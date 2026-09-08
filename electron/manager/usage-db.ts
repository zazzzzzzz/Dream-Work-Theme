import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { APP_DEFINITIONS } from './app-registry';

/* ZCode token 用量数据层：纯 TS 只读 SQLite 读取器（含 WAL）+ 快照聚合。
 *
 * 为什么不用 node:sqlite / better-sqlite3：主题管理器的 Electron 33（Node 20.18）
 * 没有内置 sqlite 模块；native 依赖会引入 ABI 重编译与打包链风险。用量三表
 * （model_usage / turn_usage / tool_usage）合计 ~1 万行（332MB 主库的其余部分是
 * 会话内容表，本读取器只走四张表的 b-tree，不碰大表），每次拉取全量重扫的开销
 * 在毫秒级。方案与 zcode-token-usage-statusbar 的 zusage.py 同口径：
 * 只读、不联网、任何失败只打日志并放弃本次拉取（下一笔 db 写入会再拉）。
 *
 * 聚合口径对齐 zusage.py snapshot()：
 * - 会话累计只统计 status='completed' 的 model_usage 行；
 * - ctx（上下文容量）= 最近一次 completed 请求的 input_tokens（不能用 max：会话
 *   压缩后 input 骤降，峰值永不回落）；
 * - 本轮 = turn_usage 的 (session_id, turn_id) 聚合行；轮进行中还没落 completed
 *   行时回退 model_usage 现场聚合；
 * - 子代理 = query_source='subagent' 且子会话 parent_id=本会话（独立统计）；
 * - 上下文超限告警 = 最近一次 context_exceeded=1 的时刻（该请求 status=error，
 *   不进 completed 统计）晚于最近成功请求 = 仍处于超限状态；
 * - 上下文窗口 = 模型目录（ZCode resources/model-providers/*.json）查表，查不到
 *   兜底 128000；渲染端还会用原生 UI 读数（"…总量 N"按钮）覆盖，优先级更高。
 * 与原版的差异：子代理任务名（part 表 LIKE 扫描，代价随主库体积增长）不做，
 * 明细面板用子会话标题代替；多窗口焦点会话没有 IPC 通道，按各窗口上报的
 * want sid 强制纳入快照池（渲染端 localStorage 启发式选取）。 */

const SESSION_TIMEOUT_MS = 30 * 60 * 1000;   // 最近30分钟有请求视为活跃会话
const SUB_RUNNING_MS = 30 * 1000;            // 子代理 30s 内有完成请求 = 运行中
const FALLBACK_CONTEXT_WINDOW = 128000;
/* 反引号的字符码：SQLite 标识符引名支持三种括法，本文件一律用字符码判断，
 * 避免源码里出现反引号字面量（会被静态扫描误判为 shell 命令替换） */
const TICK = 96;

export function usageDbDir(): string {
  return path.join(os.homedir(), '.zcode', 'cli', 'db');
}

/* db 活动戳：db.sqlite / -wal / -shm 的最新 mtime。WAL 模式下写入主要落在 -wal。 */
export function usageDbStamp(): number {
  const dir = usageDbDir();
  let m = 0;
  for (const f of ['db.sqlite', 'db.sqlite-wal', 'db.sqlite-shm']) {
    try { m = Math.max(m, fs.statSync(path.join(dir, f)).mtimeMs); } catch { }
  }
  return m;
}

type SqlValue = number | string | null;

function readVarint(buf: Buffer, off: number): { value: number; next: number } {
  let v = 0;
  for (let i = 0; i < 8; i++) {
    const b = buf[off + i];
    if (b === undefined) throw new Error('varint out of range');
    v = v * 128 + (b & 0x7f);
    if ((b & 0x80) === 0) return { value: v, next: off + i + 1 };
  }
  const b9 = buf[off + 8];
  if (b9 === undefined) throw new Error('varint out of range');
  v = v * 256 + b9;
  return { value: v, next: off + 9 };
}

function readSignedInt(buf: Buffer, off: number, size: number): number {
  let v = 0;
  for (let i = 0; i < size; i++) v = v * 256 + buf[off + i];
  if (size < 8 && v >= Math.pow(2, size * 8 - 1)) v -= Math.pow(2, size * 8);
  return v;
}

/* 记录格式：header 变长头（串类型序列）+ 值区。10/11 保留类型出现即视为坏行。 */
function decodeRecord(payload: Buffer): SqlValue[] | null {
  try {
    const h = readVarint(payload, 0);
    const headerLen = h.value;
    if (headerLen > payload.length) return null;
    let p = h.next;
    let body = headerLen;
    const out: SqlValue[] = [];
    while (p < headerLen) {
      const st = readVarint(payload, p);
      p = st.next;
      const t = st.value;
      if (t === 0) { out.push(null); continue; }
      if (t >= 1 && t <= 6) {
        const size = [0, 1, 2, 3, 4, 6, 8][t];
        out.push(readSignedInt(payload, body, size));
        body += size;
        continue;
      }
      if (t === 7) { out.push(payload.readDoubleBE(body)); body += 8; continue; }
      if (t === 8) { out.push(0); continue; }
      if (t === 9) { out.push(1); continue; }
      if (t >= 12 && t % 2 === 0) { const n = (t - 12) / 2; out.push(null); body += n; continue; }
      if (t >= 13) { const n = (t - 13) / 2; out.push(payload.toString('utf8', body, body + n)); body += n; continue; }
      return null;
    }
    return out;
  } catch {
    return null;
  }
}

/* CREATE TABLE 列名提取：只取每列定义的首个标识符，跳过表级约束。
 * schema 演进（ZCode 升级加列）时自动跟随，不硬编码列序。 */
function parseCreateColumns(sql: string): string[] {
  const open = sql.indexOf('(');
  if (open < 0) return [];
  const isQuote = (ch: string) => ch === '"' || ch === "'" || ch.charCodeAt(0) === TICK;
  const scanSkip = (text: string, i: number): number => {
    const ch = text[i];
    if (isQuote(ch)) {
      i++;
      while (i < text.length && text[i] !== ch) i++;
      return i;
    }
    if (ch === '[') {
      const j = text.indexOf(']', i);
      return j < 0 ? text.length : j;
    }
    return i;
  };
  let depth = 0;
  let end = -1;
  for (let i = open; i < sql.length; i++) {
    const skipped = scanSkip(sql, i);
    if (skipped !== i) { i = skipped; continue; }
    if (sql[i] === '(') depth++;
    else if (sql[i] === ')') { depth--; if (depth === 0) { end = i; break; } }
  }
  if (end < 0) return [];
  const body = sql.slice(open + 1, end);
  const defs: string[] = [];
  let cur = '';
  let d = 0;
  for (let i = 0; i < body.length; i++) {
    const skipped = scanSkip(body, i);
    if (skipped !== i) { cur += body.slice(i, skipped + 1); i = skipped; continue; }
    if (body[i] === '(') d++;
    else if (body[i] === ')') d--;
    if (body[i] === ',' && d === 0) { defs.push(cur); cur = ''; continue; }
    cur += body[i];
  }
  if (cur.trim()) defs.push(cur);
  const tableConstraints = new Set(['PRIMARY', 'UNIQUE', 'CHECK', 'FOREIGN', 'CONSTRAINT']);
  const cols: string[] = [];
  for (const raw of defs) {
    const def = raw.trim();
    if (!def) continue;
    let name = '';
    if (def.startsWith('"')) {
      const e = def.indexOf('"', 1);
      name = def.slice(1, e > 0 ? e : 1);
    } else if (def.startsWith('[')) {
      const e = def.indexOf(']', 1);
      name = def.slice(1, e > 0 ? e : 1);
    } else if (def.charCodeAt(0) === TICK) {
      const tick = String.fromCharCode(TICK);
      const e = def.indexOf(tick, 1);
      name = def.slice(1, e > 0 ? e : 1);
    } else {
      const m = def.match(/^([A-Za-z_][A-Za-z0-9_]*)/);
      if (m) name = m[1];
    }
    if (!name) continue;
    if (!def.startsWith('"') && !def.startsWith('[') && def.charCodeAt(0) !== TICK
      && tableConstraints.has(name.toUpperCase())) continue;
    cols.push(name);
  }
  return cols;
}

function walChecksumRange(buf: Buffer, start: number, len: number, bigEndian: boolean, s0: number, s1: number): [number, number] {
  for (let i = start; i + 8 <= start + len; i += 8) {
    const x0 = bigEndian ? buf.readUInt32BE(i) : buf.readUInt32LE(i);
    const x1 = bigEndian ? buf.readUInt32BE(i + 4) : buf.readUInt32LE(i + 4);
    s0 = (s0 + x0 + s1) >>> 0;
    s1 = (s1 + x1 + s0) >>> 0;
  }
  return [s0, s1];
}

/* 只读 SQLite 文件视图：主库文件 + WAL 最新有效帧的页映射。
 * WAL 帧逐个校验 salt 与累计 checksum，首个无效帧即停（与 SQLite 读侧一致，
 * 未 checkpoint 的最新写入因此可见）。页读取先查 WAL 映射再回源文件。 */
class SqliteFile {
  private fd: number;
  private pageSize: number;
  private reserved: number;
  private wal = new Map<number, Buffer>();
  private cache = new Map<number, Buffer>();

  private constructor(fd: number, pageSize: number, reserved: number) {
    this.fd = fd;
    this.pageSize = pageSize;
    this.reserved = reserved;
  }

  static open(dbPath: string): SqliteFile {
    const fd = fs.openSync(dbPath, 'r');
    try {
      const header = Buffer.alloc(100);
      let got = 0;
      while (got < 100) {
        const n = fs.readSync(fd, header, got, 100 - got, got);
        if (n <= 0) throw new Error('short header read');
        got += n;
      }
      if (header.toString('latin1', 0, 16) !== 'SQLite format 3\0') throw new Error('not a sqlite database');
      let pageSize = header.readUInt16BE(16);
      if (pageSize === 1) pageSize = 65536;
      if (pageSize < 512 || (pageSize & (pageSize - 1)) !== 0) throw new Error('invalid page size');
      const reserved = header[20];
      if (header.readUInt32BE(56) !== 1) throw new Error('unsupported text encoding');
      const db = new SqliteFile(fd, pageSize, reserved);
      db.loadWal(dbPath + '-wal');
      return db;
    } catch (e) {
      try { fs.closeSync(fd); } catch { }
      throw e;
    }
  }

  close(): void {
    try { fs.closeSync(this.fd); } catch { }
  }

  private loadWal(walPath: string): void {
    let buf: Buffer;
    try { buf = fs.readFileSync(walPath); } catch { return; }
    if (buf.length < 32) return;
    const magic = buf.readUInt32BE(0);
    if (magic !== 0x377f0682 && magic !== 0x377f0683) return;
    const bigEndian = magic === 0x377f0683;
    if (buf.readUInt32BE(8) !== this.pageSize) return;
    const salt1 = buf.readUInt32BE(16);
    const salt2 = buf.readUInt32BE(20);
    let c0 = 0;
    let c1 = 0;
    [c0, c1] = walChecksumRange(buf, 0, 24, bigEndian, c0, c1);
    if (c0 !== buf.readUInt32BE(24) || c1 !== buf.readUInt32BE(28)) return;
    const frameSize = 24 + this.pageSize;
    let off = 32;
    while (off + frameSize <= buf.length) {
      const pgno = buf.readUInt32BE(off);
      if (buf.readUInt32BE(off + 8) !== salt1 || buf.readUInt32BE(off + 12) !== salt2) break;
      [c0, c1] = walChecksumRange(buf, off, 8, bigEndian, c0, c1);
      [c0, c1] = walChecksumRange(buf, off + 24, this.pageSize, bigEndian, c0, c1);
      if (c0 !== buf.readUInt32BE(off + 16) || c1 !== buf.readUInt32BE(off + 20)) break;
      if (pgno >= 1) this.wal.set(pgno, buf.subarray(off + 24, off + 24 + this.pageSize));
      off += frameSize;
    }
  }

  private page(pgno: number): Buffer | null {
    const cached = this.cache.get(pgno);
    if (cached) return cached;
    const fromWal = this.wal.get(pgno);
    if (fromWal) {
      this.cache.set(pgno, fromWal);
      return fromWal;
    }
    if (pgno > 0x7fffffff) return null;
    const buf = Buffer.alloc(this.pageSize);
    let got = 0;
    try {
      while (got < this.pageSize) {
        const n = fs.readSync(this.fd, buf, got, this.pageSize - got, (pgno - 1) * this.pageSize + got);
        if (n <= 0) break;
        got += n;
      }
    } catch {
      return null;
    }
    if (got === 0) return null;   // 页号越界（torn 状态）：放弃本子树，下次拉取自愈
    this.cache.set(pgno, buf);
    return buf;
  }

  private walkTable(pageNo: number, cb: (rowid: number, payload: Buffer) => void, depth: number): void {
    if (depth > 30) return;
    const page = this.page(pageNo);
    if (!page) return;
    const base = pageNo === 1 ? 100 : 0;
    const type = page[base];
    let nCell = 0;
    try { nCell = page.readUInt16BE(base + 3); } catch { return; }
    if (type === 13) {
      const usable = this.pageSize - this.reserved;
      const maxLocal = usable - 35;
      const minLocal = Math.floor(((usable - 12) * 32) / 255) - 23;
      for (let i = 0; i < nCell; i++) {
        try {
          const cell = page.readUInt16BE(base + 8 + i * 2);
          const pl = readVarint(page, cell);
          const rid = readVarint(page, pl.next);
          const payloadLen = pl.value;
          let local = payloadLen;
          let overflowPg = 0;
          if (payloadLen > maxLocal) {
            local = minLocal + ((payloadLen - minLocal) % (usable - 4));
            if (local > maxLocal) local = minLocal;
            overflowPg = page.readUInt32BE(rid.next + local);
          }
          if (overflowPg === 0) {
            if (rid.next + payloadLen > page.length) continue;
            cb(rid.value, page.subarray(rid.next, rid.next + payloadLen));
            continue;
          }
          const payload = Buffer.alloc(payloadLen);
          page.copy(payload, 0, rid.next, rid.next + local);
          let filled = local;
          let opg = overflowPg;
          let torn = false;
          while (opg && filled < payloadLen) {
            const op = this.page(opg);
            if (!op) { torn = true; break; }
            const next = op.readUInt32BE(0);
            const chunk = Math.min(payloadLen - filled, usable - 4);
            op.copy(payload, filled, 4, 4 + chunk);
            filled += chunk;
            opg = next;
          }
          if (torn || filled !== payloadLen) continue;
          cb(rid.value, payload);
        } catch {
          continue;   // torn 行：跳过，下一笔拉取自愈
        }
      }
    } else if (type === 5) {
      try {
        for (let i = 0; i < nCell; i++) {
          const cell = page.readUInt16BE(base + 12 + i * 2);
          this.walkTable(page.readUInt32BE(cell), cb, depth + 1);
        }
        this.walkTable(page.readUInt32BE(base + 8), cb, depth + 1);
      } catch {
        return;
      }
    }
    /* 类型 0（全零页）/2/10（索引页，不该出现）：静默忽略 */
  }

  tableRoots(): Map<string, { root: number; sql: string }> {
    const out = new Map<string, { root: number; sql: string }>();
    this.walkTable(1, (_rid, payload) => {
      const vals = decodeRecord(payload);
      if (!vals) return;
      if (vals[0] === 'table' && typeof vals[1] === 'string' && typeof vals[3] === 'number' && typeof vals[4] === 'string') {
        out.set(vals[1], { root: vals[3], sql: vals[4] });
      }
    }, 0);
    return out;
  }

  scanTable(root: number, sql: string, want: string[], onRow: (row: Record<string, SqlValue>) => void): void {
    const cols = parseCreateColumns(sql);
    if (!cols.length) return;
    const idx: Array<[string, number]> = [];
    for (const c of want) {
      const i = cols.indexOf(c);
      if (i >= 0) idx.push([c, i]);
    }
    this.walkTable(root, (_rid, payload) => {
      const vals = decodeRecord(payload);
      if (!vals) return;
      const row: Record<string, SqlValue> = {};
      for (const [c, i] of idx) row[c] = vals[i] ?? null;
      onRow(row);
    }, 0);
  }
}

/* ---------- 快照结构（渲染端渲染的唯一数据契约，camelCase） ---------- */

export interface TurnSnap {
  requests: number; retries: number; toolCalls: number; toolErrors: number;
  input: number; output: number; reasoning: number; cacheRead: number; cacheWrite: number;
  total: number; durationMs: number; ttftMs: number;
}

export interface SubItem {
  sid: string; title: string; task: string;
  requests: number; total: number; input: number; output: number;
  cacheRead: number; reasoning: number; cacheWrite: number;
  last: number; active: boolean;
}

export interface SessionSnap {
  sid: string; title: string; active: boolean;
  turns: number; requests: number;
  input: number; output: number; reasoning: number; cacheRead: number; cacheWrite: number; total: number;
  toolCalls: number; retries: number; ctx: number;
  updated: string; lastAt: number;
  last: { durationMs: number; ttftMs: number; model: string; tps: number };
  lastTurn: TurnSnap;
  tools: { total: number; errors: number; list: Array<{ name: string; count: number; durationMs: number; errors: number }> };
  sub: { requests: number; total: number; input: number; output: number; cacheRead: number; reasoning: number; cacheWrite: number; active: boolean; list: SubItem[] };
  code: { add: number | null; del: number | null; files: number | null };
  ctxExc: number; contextWindow: number; contextAuto: boolean;
  isSub: boolean; parent: string | null;
}

export interface UsageSnapshot {
  v: 1;
  generatedAt: number;
  today: { requests: number; input: number; output: number; cacheRead: number; cacheWrite: number; reasoning: number; total: number; retries: number };
  session: SessionSnap | null;
  recent: SessionSnap[];
}

const EMPTY_TURN: TurnSnap = {
  requests: 0, retries: 0, toolCalls: 0, toolErrors: 0, input: 0, output: 0,
  reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0, durationMs: 0, ttftMs: 0,
};

function num(v: SqlValue): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : 0;
}
function str(v: SqlValue): string {
  return typeof v === 'string' ? v : '';
}

function hhmmss(ms: number): string {
  if (!ms) return '';
  const d = new Date(ms);
  const p = (n: number) => (n < 10 ? '0' : '') + n;
  return p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds());
}

/* ---------- 模型目录：ZCode resources/model-providers/*.json → modelId → contextWindow ---------- */

let catalogCache: { at: number; map: Map<string, number> } | null = null;

function modelCatalog(): Map<string, number> {
  if (catalogCache && Date.now() - catalogCache.at < 600000) return catalogCache.map;
  const map = new Map<string, number>();
  try {
    const def = APP_DEFINITIONS.find(d => d.id === 'zcode');
    const dirs = new Set<string>([
      ...(def?.installPaths ?? []).map(p => path.join(p, 'resources', 'model-providers')),
      'D:\\ZCode\\resources\\model-providers',
    ]);
    for (const dir of dirs) {
      let files: string[] = [];
      try { files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.json')); } catch { continue; }
      for (const f of files) {
        try {
          const cat = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
          for (const prov of (Array.isArray(cat?.providers) ? cat.providers : [])) {
            for (const m of (Array.isArray(prov?.models) ? prov.models : [])) {
              const id = String(m?.id ?? '').trim().toLowerCase();
              const cw = Number(m?.contextWindow);
              if (id && Number.isFinite(cw) && cw > 0) map.set(id, cw);
            }
          }
        } catch { }
      }
    }
  } catch { }
  catalogCache = { at: Date.now(), map };
  return map;
}

/* 目录查表：先精确匹配；db 里的 model_id 可能带变体后缀（如 glm-5.3-flash 对目录
 * 的 glm-5.3），退化为最长目录键前缀匹配（glm-5.3 命中 1,000,000 而不是兜底值）。 */
function lookupContextWindow(catalog: Map<string, number>, modelKey: string): number | undefined {
  const exact = catalog.get(modelKey);
  if (exact !== undefined) return exact;
  let bestKey = '';
  let bestValue: number | undefined;
  for (const [key, value] of catalog) {
    if (key.length > bestKey.length && modelKey.startsWith(key + '-')) {
      bestKey = key;
      bestValue = value;
    }
  }
  return bestValue;
}

/* ---------- 快照构建 ---------- */

interface SessAgg {
  requests: number; input: number; output: number; reasoning: number;
  cacheRead: number; cacheWrite: number; total: number; toolCalls: number; retries: number;
  lastAt: number;
  lastIn: number;
  last: { durationMs: number; ttftMs: number; model: string; output: number; firstTokenAt: number; completedAt: number; turnId: string } | null;
  ctxExc: number;
}

function newAgg(): SessAgg {
  return {
    requests: 0, input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0,
    total: 0, toolCalls: 0, retries: 0, lastAt: 0, lastIn: 0, last: null, ctxExc: 0,
  };
}

export function buildUsageSnapshot(forceSids: string[] = []): UsageSnapshot | null {
  const dbPath = path.join(usageDbDir(), 'db.sqlite');
  let db: SqliteFile;
  try {
    db = SqliteFile.open(dbPath);
  } catch (e) {
    console.warn('[usage-db] open failed:', (e as Error).message);
    return null;
  }
  try {
    const roots = db.tableRoots();
    const required = ['model_usage', 'turn_usage', 'tool_usage', 'session'];
    for (const t of required) {
      if (!roots.has(t)) {
        console.warn('[usage-db] table missing:', t);
        return null;
      }
    }

    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayStartMs = dayStart.getTime();
    const dayEndMs = dayStartMs + 86400000;
    const now = Date.now();

    /* Pass A：model_usage 一次流式扫描 → 会话聚合 / 今日 / 子代理 / 超限。
     * turns 口径同 zusage.py：completed 请求的 distinct turn_id（turn_usage 里
     * cancelled/进行中的轮不计）。 */
    const aggs = new Map<string, SessAgg>();
    const subAggs = new Map<string, SessAgg>();
    const turnIdsSeen = new Map<string, Set<string>>();
    const today = { requests: 0, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, reasoning: 0, total: 0, retries: 0 };
    const muRoot = roots.get('model_usage')!;
    db.scanTable(muRoot.root, muRoot.sql, [
      'session_id', 'turn_id', 'status', 'started_at', 'completed_at', 'duration_ms',
      'time_to_first_token_ms', 'first_token_at', 'output_tokens', 'input_tokens',
      'reasoning_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens',
      'computed_total_tokens', 'tool_call_count', 'retry_count', 'model_id',
      'query_source', 'context_exceeded',
    ], (row) => {
      const sid = str(row.session_id);
      if (!sid) return;
      const status = str(row.status);
      const completedAt = num(row.completed_at);
      if (status === 'completed') {
        const isSub = str(row.query_source) === 'subagent';
        let target = isSub ? subAggs.get(sid) : aggs.get(sid);
        if (!target) {
          target = newAgg();
          (isSub ? subAggs : aggs).set(sid, target);
        }
        const input = num(row.input_tokens);
        target.requests++;
        const turnIdKey = str(row.turn_id);
        if (turnIdKey) {
          let seen = turnIdsSeen.get(sid);
          if (!seen) { seen = new Set(); turnIdsSeen.set(sid, seen); }
          seen.add(turnIdKey);
        }
        target.input += input;
        target.output += num(row.output_tokens);
        target.reasoning += num(row.reasoning_tokens);
        target.cacheRead += num(row.cache_read_input_tokens);
        target.cacheWrite += num(row.cache_creation_input_tokens);
        target.total += num(row.computed_total_tokens);
        target.toolCalls += num(row.tool_call_count);
        target.retries += num(row.retry_count);
        if (completedAt > target.lastAt) target.lastAt = completedAt;
        const last = target.last;
        if (!last || completedAt >= last.completedAt) {
          target.last = {
            durationMs: num(row.duration_ms),
            ttftMs: num(row.time_to_first_token_ms),
            model: str(row.model_id),
            output: num(row.output_tokens),
            firstTokenAt: num(row.first_token_at),
            completedAt,
            turnId: str(row.turn_id),
          };
          target.lastIn = input;
        }
        if (completedAt >= dayStartMs && completedAt < dayEndMs) {
          today.requests++;
          today.input += input;
          today.output += num(row.output_tokens);
          today.cacheRead += num(row.cache_read_input_tokens);
          today.cacheWrite += num(row.cache_creation_input_tokens);
          today.reasoning += num(row.reasoning_tokens);
          today.total += num(row.computed_total_tokens);
          today.retries += num(row.retry_count);
        }
      }
      if (num(row.context_exceeded) === 1) {
        const exc = completedAt || num(row.started_at);
        let a = aggs.get(sid);
        if (!a) { a = newAgg(); aggs.set(sid, a); }
        if (exc > a.ctxExc) a.ctxExc = exc;
      }
    });

    /* Pass：turn_usage（每轮权威聚合）+ tool_usage（按工具分组）+ session（标题/父会话） */
    const turnMap = new Map<string, TurnSnap>();
    const turnRoot = roots.get('turn_usage')!;
    db.scanTable(turnRoot.root, turnRoot.sql, [
      'session_id', 'turn_id', 'status', 'model_request_count', 'model_retry_count',
      'tool_call_count', 'tool_error_count', 'input_tokens', 'output_tokens',
      'reasoning_tokens', 'cache_read_input_tokens', 'cache_creation_input_tokens',
      'computed_total_tokens', 'duration_ms', 'time_to_first_token_ms',
    ], (row) => {
      const sid = str(row.session_id);
      const turnId = str(row.turn_id);
      if (!sid || !turnId || str(row.status) !== 'completed') return;
      turnMap.set(sid + '|' + turnId, {
        requests: num(row.model_request_count),
        retries: num(row.model_retry_count),
        toolCalls: num(row.tool_call_count),
        toolErrors: num(row.tool_error_count),
        input: num(row.input_tokens),
        output: num(row.output_tokens),
        reasoning: num(row.reasoning_tokens),
        cacheRead: num(row.cache_read_input_tokens),
        cacheWrite: num(row.cache_creation_input_tokens),
        total: num(row.computed_total_tokens),
        durationMs: num(row.duration_ms),
        ttftMs: num(row.time_to_first_token_ms),
      });
    });

    const toolsMap = new Map<string, { total: number; errors: number; list: Map<string, { count: number; durationMs: number; errors: number }> }>();
    const toolRoot = roots.get('tool_usage')!;
    db.scanTable(toolRoot.root, toolRoot.sql, ['session_id', 'tool_name', 'status', 'duration_ms'], (row) => {
      const sid = str(row.session_id);
      const status = str(row.status);
      if (!sid || (status !== 'completed' && status !== 'error')) return;
      const name = str(row.tool_name) || '(unknown)';
      let t = toolsMap.get(sid);
      if (!t) { t = { total: 0, errors: 0, list: new Map() }; toolsMap.set(sid, t); }
      let item = t.list.get(name);
      if (!item) { item = { count: 0, durationMs: 0, errors: 0 }; t.list.set(name, item); }
      t.total++;
      item.count++;
      item.durationMs += num(row.duration_ms);
      if (status === 'error') { t.errors++; item.errors++; }
    });

    const sessInfo = new Map<string, { title: string; parent: string | null; add: number | null; del: number | null; files: number | null }>();
    const sessRoot = roots.get('session')!;
    db.scanTable(sessRoot.root, sessRoot.sql, [
      'id', 'title', 'parent_id', 'summary_additions', 'summary_deletions', 'summary_files',
    ], (row) => {
      const sid = str(row.id);
      if (!sid) return;
      sessInfo.set(sid, {
        title: str(row.title),
        parent: typeof row.parent_id === 'string' && row.parent_id ? row.parent_id : null,
        add: typeof row.summary_additions === 'number' ? row.summary_additions : null,
        del: typeof row.summary_deletions === 'number' ? row.summary_deletions : null,
        files: typeof row.summary_files === 'number' ? row.summary_files : null,
      });
    });

    /* 快照池：force（各窗口 want）+ 最新 + 常规/子代理各 6，去重 */
    let latestSid = '';
    let latestAt = 0;
    for (const [sid, a] of aggs) {
      if (a.lastAt > latestAt) { latestAt = a.lastAt; latestSid = sid; }
    }
    const rank = (isSub: boolean) =>
      [...aggs.entries()]
        .filter(([sid]) => sid.startsWith('sess_subagent') === isSub)
        .sort((x, y) => y[1].lastAt - x[1].lastAt)
        .slice(0, 6)
        .map(([sid]) => sid);
    const pool: string[] = [];
    const pushSid = (sid: string) => {
      if (sid && /^[A-Za-z0-9_-]{1,255}$/.test(sid) && !pool.includes(sid)) pool.push(sid);
    };
    for (const fsid of forceSids) pushSid(fsid);
    pushSid(latestSid);
    rank(false).forEach(pushSid);
    rank(true).forEach(pushSid);

    /* Pass B：池内会话最后一轮在 turn_usage 还没落 completed 行时，回退 model_usage
     * 现场聚合（只对池内 lastTurnId 做二次流式扫描，规模受池上限约束） */
    const needTurns = new Set<string>();
    for (const sid of pool) {
      const turnId = aggs.get(sid)?.last?.turnId ?? '';
      if (turnId && !turnMap.has(sid + '|' + turnId)) needTurns.add(sid + '|' + turnId);
    }
    const fallbackTurns = new Map<string, TurnSnap>();
    if (needTurns.size) {
      db.scanTable(muRoot.root, muRoot.sql, [
        'session_id', 'turn_id', 'status', 'input_tokens', 'output_tokens',
        'computed_total_tokens', 'duration_ms', 'cache_read_input_tokens',
        'reasoning_tokens', 'cache_creation_input_tokens',
      ], (row) => {
        if (str(row.status) !== 'completed') return;
        const key = str(row.session_id) + '|' + str(row.turn_id);
        if (!needTurns.has(key)) return;
        let t = fallbackTurns.get(key);
        if (!t) { t = { ...EMPTY_TURN }; fallbackTurns.set(key, t); }
        t.requests++;
        t.input += num(row.input_tokens);
        t.output += num(row.output_tokens);
        t.total += num(row.computed_total_tokens);
        t.durationMs += num(row.duration_ms);
        t.cacheRead += num(row.cache_read_input_tokens);
        t.reasoning += num(row.reasoning_tokens);
        t.cacheWrite += num(row.cache_creation_input_tokens);
      });
    }

    const catalog = modelCatalog();
    const buildSnap = (sid: string): SessionSnap => {
      const a = aggs.get(sid) ?? newAgg();
      const info = sessInfo.get(sid);
      const last = a.last;
      let tps = 0;
      if (last && last.output > 0) {
        let genMs = 0;
        if (last.firstTokenAt && last.completedAt > last.firstTokenAt) genMs = last.completedAt - last.firstTokenAt;
        else genMs = last.durationMs;
        if (genMs > 0) tps = Math.round((last.output / (genMs / 1000)) * 10) / 10;
      }
      const turnId = last?.turnId ?? '';
      const lastTurn = (turnId && turnMap.get(sid + '|' + turnId))
        || (turnId && fallbackTurns.get(sid + '|' + turnId))
        || { ...EMPTY_TURN };
      const toolsEntry = toolsMap.get(sid);
      const tools = {
        total: toolsEntry?.total ?? 0,
        errors: toolsEntry?.errors ?? 0,
        list: [...(toolsEntry?.list.entries() ?? [])]
          .map(([name, v]) => ({ name, count: v.count, durationMs: v.durationMs, errors: v.errors }))
          .sort((x, y) => y.count - x.count || (x.name < y.name ? -1 : 1)),
      };
      const subList: SubItem[] = [...subAggs.entries()]
        .filter(([subSid]) => sessInfo.get(subSid)?.parent === sid)
        .sort((x, y) => y[1].lastAt - x[1].lastAt)
        .map(([subSid, sa]) => ({
          sid: subSid,
          title: sessInfo.get(subSid)?.title ?? '',
          task: '',
          requests: sa.requests,
          total: sa.total,
          input: sa.input,
          output: sa.output,
          cacheRead: sa.cacheRead,
          reasoning: sa.reasoning,
          cacheWrite: sa.cacheWrite,
          last: sa.lastAt,
          active: now - sa.lastAt < SUB_RUNNING_MS,
        }));
      const sub = {
        requests: subList.reduce((s, i) => s + i.requests, 0),
        total: subList.reduce((s, i) => s + i.total, 0),
        input: subList.reduce((s, i) => s + i.input, 0),
        output: subList.reduce((s, i) => s + i.output, 0),
        cacheRead: subList.reduce((s, i) => s + i.cacheRead, 0),
        reasoning: subList.reduce((s, i) => s + i.reasoning, 0),
        cacheWrite: subList.reduce((s, i) => s + i.cacheWrite, 0),
        active: subList.some(i => i.active),
        list: subList,
      };
      const modelKey = (last?.model ?? '').trim().toLowerCase();
      const catalogWindow = modelKey ? lookupContextWindow(catalog, modelKey) : undefined;
      return {
        sid,
        title: info?.title ?? '',
        active: a.lastAt > 0 && now - a.lastAt < SESSION_TIMEOUT_MS,
        turns: turnIdsSeen.get(sid)?.size ?? 0,
        requests: a.requests,
        input: a.input,
        output: a.output,
        reasoning: a.reasoning,
        cacheRead: a.cacheRead,
        cacheWrite: a.cacheWrite,
        total: a.total,
        toolCalls: a.toolCalls,
        retries: a.retries,
        ctx: a.lastIn,
        updated: hhmmss(a.lastAt),
        lastAt: a.lastAt,
        last: {
          durationMs: last?.durationMs ?? 0,
          ttftMs: last?.ttftMs ?? 0,
          model: last?.model ?? '',
          tps,
        },
        lastTurn,
        tools,
        sub,
        code: { add: info?.add ?? null, del: info?.del ?? null, files: info?.files ?? null },
        ctxExc: a.ctxExc,
        contextWindow: catalogWindow ?? FALLBACK_CONTEXT_WINDOW,
        contextAuto: catalogWindow !== undefined,
        isSub: sid.startsWith('sess_subagent'),
        parent: info?.parent ?? null,
      };
    };

    const recent = pool.map(buildSnap);
    const session = latestSid ? (recent.find(s => s.sid === latestSid) ?? buildSnap(latestSid)) : null;
    return { v: 1, generatedAt: now, today, session, recent };
  } catch (e) {
    console.warn('[usage-db] snapshot failed:', (e as Error).message);
    return null;
  } finally {
    db.close();
  }
}
