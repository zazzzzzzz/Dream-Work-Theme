import * as fs from 'fs';
import { CdpSession, fetchRendererTargets, isAnyPageTarget } from './cdp';
import { getAppDefinition } from './app-registry';
import { buildUsageSnapshot, usageDbDir, usageDbStamp } from './usage-db';

/* ZCode token 用量泵（主进程侧）：仿 zcode-token-usage-statusbar 的 inject-main.cjs，
 * 但宿主不是 ZCode 的 app.asar，而是本主题管理器的主进程 —— 皮肤注入走 CDP，
 * 状态栏数据也走同一条 CDP 通道：
 *   fs.watch db 目录 → 去抖 300ms → 读库聚合快照 → Runtime.evaluate 推给每个
 *   ZCode 渲染页 window.__dreamWorkUsageUpdate(payload)。
 * 空闲零进程零轮询：完全空闲时只有兜底心跳（30s）防 fs.watch 文件事件丢失；
 * 活动期限频 activity_min_ms（默认 1.5s），限频到点自动补拉最后一笔写入。
 * 任何失败只打日志，不影响 ZCode 与主题注入。 */

const ACTIVITY_MIN_MS = 1500;
const HEARTBEAT_MS = 30000;
const DEBOUNCE_MS = 300;

interface PumpState {
  watcher: fs.FSWatcher | null;
  heartbeat: NodeJS.Timeout | null;
  retryTimer: NodeJS.Timeout | null;
  debounceTimer: NodeJS.Timeout | null;
  busy: boolean;
  lastSpawnAt: number;
  lastStamp: number;
  lastWants: string;
}

const pumps = new Map<number, PumpState>();

function log(...args: unknown[]): void {
  console.error('[usage-pump]', ...args);
}

/* 与 injector.applyTheme 同套发现逻辑：严格 rendererHints 失败后放宽到任意 page target */
async function listZcodePageTargets(port: number): Promise<any[]> {
  const hints = getAppDefinition('zcode')?.rendererHints ?? ['out/renderer/index.html', 'renderer/index.html'];
  for (const hint of hints) {
    try {
      const targets = await fetchRendererTargets(port, hint, { timeoutMs: 1500, quiet: true });
      if (targets.length > 0) return targets;
    } catch { }
  }
  try {
    const resp = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(3000) });
    const json = await resp.json();
    return (Array.isArray(json) ? json : []).filter(isAnyPageTarget);
  } catch {
    return [];
  }
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  return await Promise.race([
    promise,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), ms)),
  ]);
}

async function pushCycle(port: number, state: PumpState): Promise<void> {
  const targets = await listZcodePageTargets(port);
  if (targets.length === 0) return;

  /* 阶段一：收各窗口的 want sid（渲染端 localStorage 启发式暴露在
   * window.__dreamWorkUsageWant 上），强制纳入快照池 —— 刚开的新会话 /
   * 6+6 池之外的会话也能被本窗口选中显示。 */
  const wants: string[] = [];
  for (const target of targets) {
    const session = new CdpSession(target.webSocketDebuggerUrl);
    try {
      await session.open();
      const want = await withTimeout(session.evaluate("(window.__dreamWorkUsageWant || '')"), 1500);
      const sid = typeof want === 'string' ? want.trim() : '';
      if (sid && /^[A-Za-z0-9_-]{1,255}$/.test(sid) && !wants.includes(sid)) wants.push(sid);
    } catch { } finally {
      session.close();
    }
  }

  const stamp = usageDbStamp();
  const wantsKey = wants.join(',');
  if (wantsKey === state.lastWants && stamp > 0 && stamp === state.lastStamp) return;
  const now = Date.now();
  if (now - state.lastSpawnAt < ACTIVITY_MIN_MS) {
    scheduleRetry(port, ACTIVITY_MIN_MS - (now - state.lastSpawnAt) + 50);
    return;
  }
  state.lastWants = wantsKey;
  if (stamp) state.lastStamp = stamp;
  state.lastSpawnAt = now;

  const snapshot = buildUsageSnapshot(wants);
  if (!snapshot) return;
  /* U+2028/2029 转义：JSON.stringify 会输出裸字符，放进 executeJavaScript
   * 字符串字面量有语法风险（会话标题可能含任意文本）。 */
  const js = 'window.__dreamWorkUsageUpdate && window.__dreamWorkUsageUpdate('
    + JSON.stringify(snapshot).replace(/[\u2028\u2029]/g, (c) => (c === '\u2028' ? '\\u2028' : '\\u2029'))
    + ')';
  for (const target of targets) {
    const session = new CdpSession(target.webSocketDebuggerUrl);
    try {
      await session.open();
      await withTimeout(session.evaluate(js), 5000);
    } catch { } finally {
      session.close();
    }
  }
}

function scheduleRetry(port: number, ms: number): void {
  const state = pumps.get(port);
  if (!state) return;
  if (state.retryTimer) clearTimeout(state.retryTimer);
  state.retryTimer = setTimeout(() => {
    const st = pumps.get(port);
    if (!st) return;
    st.retryTimer = null;
    void maybeSpawn(port);
  }, Math.max(50, ms));
}

let cycleRunning = false;
async function maybeSpawn(port: number): Promise<void> {
  const state = pumps.get(port);
  if (!state || state.busy || cycleRunning) return;
  state.busy = true;
  cycleRunning = true;
  try {
    await pushCycle(port, state);
  } catch (e) {
    log('cycle failed:', (e as Error).message);
  } finally {
    state.busy = false;
    cycleRunning = false;
  }
}

function watchDb(port: number): void {
  const state = pumps.get(port);
  if (!state || state.watcher) return;
  try {
    state.watcher = fs.watch(usageDbDir(), (_ev, file) => {
      if (file && !/db\.sqlite/.test(file)) return;
      const st = pumps.get(port);
      if (!st) return;
      if (st.debounceTimer) clearTimeout(st.debounceTimer);
      st.debounceTimer = setTimeout(() => {
        const s2 = pumps.get(port);
        if (!s2) return;
        s2.debounceTimer = null;
        void maybeSpawn(port);
      }, DEBOUNCE_MS);
    });
    state.watcher.on('error', () => {
      log('db watcher error, re-arm in 5s');
      const st = pumps.get(port);
      if (st?.watcher) {
        try { st.watcher.close(); } catch { }
        st.watcher = null;
      }
      setTimeout(() => {
        if (pumps.has(port)) watchDb(port);
      }, 5000);
    });
    log('watching', usageDbDir(), 'for port', port);
  } catch (e) {
    log('fs.watch failed, retry in 5s:', (e as Error).message);
    setTimeout(() => {
      if (pumps.has(port)) watchDb(port);
    }, 5000);
  }
}

export function startUsagePump(port: number): void {
  let state = pumps.get(port);
  if (state) {
    if (!state.watcher) watchDb(port);
    return;
  }
  state = {
    watcher: null, heartbeat: null, retryTimer: null, debounceTimer: null,
    busy: false, lastSpawnAt: 0, lastStamp: 0, lastWants: '',
  };
  pumps.set(port, state);
  watchDb(port);
  state.heartbeat = setInterval(() => void maybeSpawn(port), HEARTBEAT_MS);
  log('started for port', port);
  void maybeSpawn(port);   // 启动先拉一次
}

export function stopUsagePump(port: number): void {
  const state = pumps.get(port);
  if (!state) return;
  pumps.delete(port);
  if (state.watcher) { try { state.watcher.close(); } catch { } }
  if (state.heartbeat) clearInterval(state.heartbeat);
  if (state.retryTimer) clearTimeout(state.retryTimer);
  if (state.debounceTimer) clearTimeout(state.debounceTimer);
  log('stopped for port', port);
}

export function isUsagePumpRunning(port: number): boolean {
  return pumps.has(port);
}
