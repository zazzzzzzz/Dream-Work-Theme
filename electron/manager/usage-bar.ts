/* ZCode 皮肤注入 · token 用量状态栏（渲染进程脚本，自包含 IIFE 字符串）。
 *
 * 功能对齐 zcode-token-usage-statusbar 的 overlay.js：生成速度 / 上下文容量 /
 * 本轮 / 会话累计 / 工具调用 / 今日合计 / 子代理 七项 + 悬停明细 + 显示项开关 +
 * 上下文超限告警气泡。数据由主题管理器主进程的 usage-pump 经 CDP 推送到
 * window.__dreamWorkUsageUpdate（原版走 app.asar 主进程泵 + python，这里全程 CDP）。
 *
 * 配色（与皮肤色系一致，本文件与原版最大的差异）：原版引用客户端语义变量
 * --color-*，这里一律引用皮肤注入的 --dream-work-* 主题变量 —— accent /
 * secondary / surface / text 随预设与自定义图片主题切换自动换装；玻璃材质
 * （surface 78% + blur 14px + accent 30% 边框 + 圆角）与 buildZCodeConversationCss
 * 的会话行/输入区同配方。三档状态色（绿/黄/红）是功能色不走主题，但与主题
 * 文字色 color-mix 适配深浅（亮主题下自动加深、暗主题下自动提亮）。
 * 皮肤被"还原主题"（style 清空）时状态栏随之隐藏，保持观感一致。
 *
 * 定位/会话识别/上下文原生读数沿用 overlay.js 的实测结论：
 * - 条悬浮在输入框视觉卡片正下方（卡片加 margin-bottom 24px 让位），rAF 逐帧跟随，
 *   重活（找输入框/读原生总量）600ms 低频；
 * - 当前会话 = localStorage zcode-v4-last-session:* 键与快照池求交集，切换优先，
 *   多候选取最近活跃；want sid 暴露在 window.__dreamWorkUsageWant 供泵强制补拉；
 * - 上下文窗口 = 原生 UI 按钮"…总量 N"（服务端下发）> 泵按模型目录查表 > 128000。
 * 代码风格：字符串拼接（无模板字面量），主进程以 String.raw 原样下发。 */

export function buildUsageBarScript(): string {
  return String.raw`(function () {
  if (window.top && window.top !== window) return;   // 只在主框架挂条，iframe 内不重复
  if (window.__dreamWorkUsageBar && document.getElementById('dream-usage-bar')) return;
  window.__dreamWorkUsageBar = true;
  var MY_GEN = (window.__dreamWorkUsageGen = (window.__dreamWorkUsageGen || 0) + 1);
  function stale() { return MY_GEN !== window.__dreamWorkUsageGen; }
  function ls(k, d) { try { return localStorage.getItem(k) ?? d; } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { } }

  var LS_SHOW = 'dreamUsage.show';
  var state = {
    show: { ctx: 1, turn: 1, win: 1, tools: 1, today: 1, sub: 1 },
    data: null, nativeCtx: 0, excActive: false, excGone: false, pickedSid: ''
  };
  try {
    var saved = JSON.parse(ls(LS_SHOW, 'null'));
    if (saved && typeof saved === 'object') for (var sk in state.show) if (sk in saved) state.show[sk] = saved[sk] ? 1 : 0;
  } catch (e) { }

  var style = document.createElement('style');
  style.textContent =
    '#dream-usage-bar{position:fixed;display:none;font:13px/1.3 Consolas,\'Cascadia Mono\',Menlo,\'Microsoft YaHei UI\',\'Microsoft YaHei\',monospace;' +
    'font-variant-numeric:tabular-nums;color:var(--dream-work-text,#e9edf4);' +
    'background:color-mix(in srgb,var(--dream-work-surface,#10141c) 78%,transparent);' +
    'backdrop-filter:blur(14px) saturate(108%);-webkit-backdrop-filter:blur(14px) saturate(108%);' +
    'border:1px solid color-mix(in srgb,var(--dream-work-accent,#24c9d7) 30%,transparent);' +
    'border-radius:12px;padding:2px 6px;user-select:none;white-space:nowrap;z-index:50;' +
    'box-shadow:0 12px 30px color-mix(in srgb,var(--dream-work-surface,#10141c) 30%,transparent),inset 0 1px color-mix(in srgb,white 12%,transparent);' +
    'align-items:center;gap:2px}' +
    '#du-main{overflow:hidden;min-width:0;flex:1 1 auto;display:flex;align-items:center;gap:1px}' +
    '.dit{display:flex;align-items:center;gap:4px;padding:2px 6px;border-radius:8px;' +
    'transition:background-color .12s ease-out}' +
    '.dit:hover{background:color-mix(in srgb,var(--dream-work-accent,#24c9d7) 14%,transparent)}' +
    '.dsep{width:1px;height:15px;background:color-mix(in srgb,var(--dream-work-text,#e9edf4) 16%,transparent);flex:0 0 auto;margin:0 1px}' +
    '.dk{color:color-mix(in srgb,var(--dream-work-text,#e9edf4) 62%,transparent)}' +
    '.dv{color:var(--dream-work-text,#e9edf4);font-weight:600}' +
    '.dpct{font-weight:700}' +
    '.dok{color:color-mix(in srgb,#3ecf8e 84%,var(--dream-work-text,#e9edf4))}' +
    '.dwarm{color:color-mix(in srgb,#f5b944 84%,var(--dream-work-text,#e9edf4))}' +
    '.dhot{color:color-mix(in srgb,#ff6b57 84%,var(--dream-work-text,#e9edf4))}' +
    '@keyframes duexc{0%,100%{opacity:1}50%{opacity:.35}}' +
    '.dexc{color:color-mix(in srgb,#ff2d55 88%,var(--dream-work-text,#e9edf4));text-shadow:0 0 8px rgba(255,45,85,.5);animation:duexc 1.1s ease-in-out infinite}' +
    '.dbtn{cursor:pointer;padding:2px 6px;border-radius:8px;color:var(--dream-work-text,#e9edf4);' +
    'transition:background-color .12s ease-out;opacity:.8}' +
    '.dbtn:hover{opacity:1;background:color-mix(in srgb,var(--dream-work-accent,#24c9d7) 14%,transparent)}' +
    '.dico{width:12px;height:12px;flex:0 0 auto;color:var(--dream-work-text,#e9edf4);opacity:.75}' +
    '.deb{background:color-mix(in srgb,#ff6b57 16%,transparent);color:color-mix(in srgb,#ff8a73 88%,var(--dream-work-text,#e9edf4));' +
    'border-radius:999px;padding:0 6px;line-height:16px;font-weight:600;display:inline-flex;align-items:center;gap:2px}' +
    '.deb .dico{color:inherit}' +
    '.dcbar{display:inline-block;width:46px;height:5px;border-radius:999px;' +
    'background:color-mix(in srgb,var(--dream-work-text,#e9edf4) 14%,transparent);overflow:hidden;flex:0 0 auto}' +
    '.dcbar>i{display:block;height:100%;border-radius:999px;background:currentColor}' +
    '@keyframes dupulse{0%,100%{opacity:1}50%{opacity:.2}}' +
    '.ddot{animation:dupulse 1.6s ease-in-out infinite;font-size:13px;line-height:1;color:var(--dream-work-secondary,#ef8fd3)}' +
    '.dpanel{position:absolute;bottom:calc(100% + 10px);left:0;display:none;flex-direction:column;gap:3px;' +
    'background:color-mix(in srgb,var(--dream-work-surface,#10141c) 92%,transparent);' +
    'backdrop-filter:blur(18px) saturate(108%);-webkit-backdrop-filter:blur(18px) saturate(108%);' +
    'border:1px solid color-mix(in srgb,var(--dream-work-accent,#24c9d7) 30%,transparent);border-radius:12px;' +
    'padding:10px 12px;min-width:260px;max-width:480px;max-height:72vh;overflow:auto;white-space:normal;' +
    'color:var(--dream-work-text,#e9edf4);font:13px/1.6 Consolas,Menlo,\'Microsoft YaHei UI\',monospace;' +
    'box-shadow:0 12px 32px color-mix(in srgb,var(--dream-work-surface,#10141c) 45%,transparent),inset 0 1px color-mix(in srgb,white 12%,transparent);z-index:2147483647}' +
    '.dpanel.open{display:flex}' +
    '.dpanel .dph{font-weight:700;font-size:14px;margin-bottom:4px}' +
    '.dpanel label{display:flex;align-items:flex-start;gap:8px;cursor:pointer;padding:4px 8px;margin:0 -8px;border-radius:8px}' +
    '.dpanel label:hover{background:color-mix(in srgb,var(--dream-work-accent,#24c9d7) 12%,transparent)}' +
    '.dpanel label em{font-style:normal;display:block;color:color-mix(in srgb,var(--dream-work-text,#e9edf4) 60%,transparent);font-size:12px}' +
    '.dpanel input[type=checkbox]{accent-color:var(--dream-work-accent,#24c9d7);margin-top:3px}' +
    '.dpanel .dnote{color:color-mix(in srgb,var(--dream-work-text,#e9edf4) 60%,transparent);margin-top:5px;line-height:1.6}' +
    '.dpanel .dhr{border-top:1px solid color-mix(in srgb,var(--dream-work-text,#e9edf4) 12%,transparent);margin:4px 0}' +
    '#dream-usage-tip{position:fixed;display:none;background:color-mix(in srgb,var(--dream-work-surface,#10141c) 94%,transparent);' +
    'backdrop-filter:blur(16px) saturate(108%);-webkit-backdrop-filter:blur(16px) saturate(108%);' +
    'border:1px solid color-mix(in srgb,var(--dream-work-accent,#24c9d7) 30%,transparent);border-radius:10px;padding:8px 12px;' +
    'font:13px/1.6 Consolas,\'Microsoft YaHei UI\',monospace;color:var(--dream-work-text,#e9edf4);' +
    'box-shadow:0 10px 28px color-mix(in srgb,var(--dream-work-surface,#10141c) 45%,transparent),inset 0 1px color-mix(in srgb,white 12%,transparent);' +
    'white-space:pre-line;z-index:2147483646;max-width:560px}' +
    '#dream-usage-exc{position:fixed;display:none;max-width:470px;z-index:2147483647;white-space:normal;user-select:text;' +
    'background:color-mix(in srgb,#ff2d55 10%,var(--dream-work-surface,#10141c));' +
    'border:1px solid color-mix(in srgb,#ff2d55 40%,transparent);border-radius:12px;padding:12px 15px;' +
    'font:13px/1.7 Consolas,\'Microsoft YaHei UI\',monospace;color:var(--dream-work-text,#e9edf4);' +
    'box-shadow:0 12px 32px rgba(0,0,0,.35)}' +
    '#dream-usage-exc .du-xb-title{font-weight:700;color:color-mix(in srgb,#ff5c77 90%,var(--dream-work-text,#e9edf4));margin-bottom:6px}' +
    '#dream-usage-exc .du-xb-step{color:color-mix(in srgb,var(--dream-work-text,#e9edf4) 80%,transparent)}' +
    '@media (prefers-reduced-motion:reduce){.dexc,.ddot{animation:none}.dit,.dbtn{transition:none}}';

  var bar = document.createElement('div');
  bar.id = 'dream-usage-bar';
  bar.innerHTML = '<span id="du-main"></span><span class="dbtn" id="du-gear" title="状态条显示项">⚙</span>';
  var panel = document.createElement('div');
  panel.className = 'dpanel';
  bar.appendChild(panel);
  bar.appendChild(style);
  bar.style.position = 'fixed';
  bar.style.zIndex = '50';
  bar.style.display = 'none';
  document.body.appendChild(bar);

  var tip = document.createElement('div');
  tip.id = 'dream-usage-tip';
  tip.style.display = 'none';
  document.body.appendChild(tip);

  var excBubble = document.createElement('div');
  excBubble.id = 'dream-usage-exc';
  excBubble.innerHTML = '<div class="du-xb-title">⚠ 上下文超限</div>' +
    '<div class="du-xb-step">最近一次请求因超出上下文窗口容量被拒绝，本轮对话暂时无法继续。建议依次尝试：</div>' +
    '<div class="du-xb-step">① 回滚上一轮对话，去掉超限的那次请求后继续；</div>' +
    '<div class="du-xb-step">② 换用上下文窗口更大的模型继续，或压缩 / 精简本会话；</div>' +
    '<div class="du-xb-step">③ 仍无法解决时，新开一个对话继续。</div>' +
    '<div class="du-xb-step" style="margin-top:6px">会话 ID：<span id="du-exc-sid"></span></div>';
  document.body.appendChild(excBubble);

  var main = bar.querySelector('#du-main');
  var gear = bar.querySelector('#du-gear');
  var lastHtml = '';

  function fmt(n) {
    n = n || 0;
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  }
  function sec(ms) { return ms ? (ms / 1000).toFixed(1) + 's' : '–'; }
  function excActive(s) {
    return !!(s && s.ctxExc > 0 && s.ctxExc >= (s.lastAt || 0));
  }
  function cachePct(cache, input) {
    return input > 0 ? '<span class="dk">' + Math.round(cache / input * 100) + '%</span>' : '';
  }
  function ioc(inp, out, cache, rea, cw) {
    return '输入 ' + fmt(inp) + ' / 输出 ' + fmt(out) + ' / 缓存命中 ' + fmt(cache) +
      (cw > 0 ? ' / 缓存写入 ' + fmt(cw) : '') +
      (rea > 0 ? ' / 思考 ' + fmt(rea) : '');
  }
  function ico(paths) {
    return '<svg class="dico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + paths + '</svg>';
  }
  var ICON_TPS = '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>';
  var ICON_TURN = '<path d="M23 4v6h-6"/><path d="M20.49 15A9 9 0 1 1 18.36 5.64L23 10"/>';
  var ICON_WIN = '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>';
  var ICON_TOOLS = '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>';
  var ICON_TODAY = '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>';
  var ICON_SUB = '<path d="M6 3v12"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/>';
  var ICON_ERR = '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>';

  function stubFor(sid) {
    return {
      sid: String(sid || ''), title: '', active: false, turns: 0, requests: 0,
      input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0,
      toolCalls: 0, retries: 0, ctx: 0, updated: '', lastAt: 0, ctxExc: 0,
      lastTurn: { requests: 0, retries: 0, toolCalls: 0, toolErrors: 0, input: 0, output: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0, total: 0, durationMs: 0, ttftMs: 0 },
      last: { durationMs: 0, ttftMs: 0, model: '', tps: 0 },
      code: { add: null, del: null, files: null },
      tools: { total: 0, errors: 0, list: [] },
      sub: { requests: 0, total: 0, input: 0, output: 0, cacheRead: 0, reasoning: 0, cacheWrite: 0, active: false, list: [] },
      contextWindow: 0, contextAuto: false
    };
  }

  /* 当前会话识别：ZCode 在 localStorage 的 zcode-v4-last-session:v1:<工作区路径>
   * 键里保存各工作区当前打开的会话 id；与快照池求交集，切换优先，多候选取最近活跃。 */
  var wsPrev = null;
  function pickCurrent(d) {
    var recent = d.recent || [];
    if (!recent.length) return null;
    var bySid = {}, kv = {};
    for (var i = 0; i < recent.length; i++) bySid[recent[i].sid] = recent[i];
    try {
      Object.keys(localStorage).forEach(function (k) {
        if (/^zcode-v4-last-session:/.test(k)) {
          var v = localStorage.getItem(k);
          if (v && /^[A-Za-z0-9_-]+$/.test(v)) kv[k] = v;
        }
      });
    } catch (e) { return null; }
    if (!Object.keys(kv).length) return null;
    var hit = {}, firstKeyVal = '';
    for (var k in kv) {
      if (bySid[kv[k]]) hit[k] = kv[k];
      if (!firstKeyVal) firstKeyVal = kv[k];
    }
    var switched = null;
    if (wsPrev) {
      for (var k2 in kv) {
        if (wsPrev[k2] && wsPrev[k2] !== kv[k2]) switched = kv[k2];
      }
    }
    wsPrev = kv;
    var want = switched || firstKeyVal;
    if (switched && bySid[switched]) return { sess: bySid[switched], want: want };
    var cands = [];
    for (var k3 in hit) cands.push(bySid[hit[k3]]);
    if (cands.length === 1) return { sess: cands[0], want: want };
    if (!cands.length) return { sess: null, want: want };
    var best = cands[0];
    for (var n = 1; n < cands.length; n++) {
      if ((cands[n].lastAt || 0) > (best.lastAt || 0)) best = cands[n];
    }
    return { sess: best, want: want };
  }

  function html(d) {
    var sess = d.session || stubFor('');
    var lt = sess.lastTurn || {};
    var today = d.today || {};
    var last = sess.last || {};
    var tls = sess.tools || { total: 0, errors: 0, list: [] };
    var subs = sess.sub || { requests: 0, total: 0, input: 0, output: 0, cacheRead: 0, reasoning: 0, cacheWrite: 0, active: false, list: [] };
    var items = [], tips = [];
    function it(inner, tipText) { items.push('<span class="dit">' + inner + '</span>'); tips.push(tipText || null); }
    if (last.tps) {
      var tpsCls = last.tps >= 70 ? 'dok' : last.tps >= 40 ? 'dwarm' : 'dhot';
      it(ico(ICON_TPS) + '<span class="' + tpsCls + '">' + last.tps + '</span><span class="dk">t/s</span>',
        '生成速度：最近完成请求的输出 tokens ÷ 生成耗时（首 token → 完成）\n≥70 t/s 绿色 · 40–70 黄色 · <40 红色\n模型 ' + (last.model || '?'));
    }
    if (state.show.ctx) {
      var cw = state.nativeCtx || sess.contextWindow || 0;
      var pct = cw ? sess.ctx / cw * 100 : 0;
      var exc = excActive(sess);
      var big = cw >= 1000000;
      var cls = exc ? 'dexc' : pct >= (big ? 60 : 85) ? 'dhot' : pct >= (big ? 40 : 70) ? 'dwarm' : 'dok';
      var inner = cw
        ? '<span class="dcbar"><i class="' + cls + '" style="width:' + Math.min(100, pct).toFixed(1) + '%"></i></span>' +
          '<span class="dpct ' + cls + '">' + pct.toFixed(1) + '%</span>'
        : '<span class="dv' + (exc ? ' dexc' : '') + '">' + fmt(sess.ctx) + '</span>';
      it(inner, '上下文：当前会话上下文大小（最近一次请求的总输入）÷ 窗口容量\n已用 ' + fmt(sess.ctx) + ' / 窗口 ' + fmt(cw) +
        '\n颜色随占比：' + (big ? '≤40% 绿 · 40–60% 黄 · ≥60% 红（窗口 ≥100 万）' : '<70% 绿 · 70–85% 黄 · ≥85% 红') +
        ' · 超限被拒=亮红闪烁' + (exc ? '\n⚠ 上下文超限：最近一次请求超出窗口容量被拒绝（' + sess.updated + '），需要压缩会话或新开会话' : ''));
    }
    if (state.show.turn) {
      it(ico(ICON_TURN) +
        '<span class="dv">' + fmt(lt.total) + '</span>' + cachePct(lt.cacheRead, lt.input) +
        '<span class="dk">' + (lt.requests || 0) + '次</span>' +
        ico('<path d="M6 3h12M6 21h12M8 3v3.5L12 11l4-4.5V3M8 21v-3.5L12 13l4 4.5V21"/>') + '<span class="dk">' + sec(last.durationMs) + '</span>' +
        ico('<path d="M5 20v-5M12 20v-9M19 20V5"/>') + '<span class="dk">' + sec(last.ttftMs) + '</span>',
        '本轮：最近一轮的 token 消耗（该轮共 ' + (lt.requests || 0) + ' 次模型请求）\n' +
        ioc(lt.input, lt.output, lt.cacheRead, lt.reasoning, lt.cacheWrite) +
        '\n单次耗时 ' + sec(last.durationMs) + ' · 首字 ' + sec(last.ttftMs) + ' · 轮总耗时 ' + sec(lt.durationMs) +
        (lt.toolCalls ? ' · 工具调用 ' + lt.toolCalls : '') +
        ((lt.retries || lt.toolErrors) ? ' · 重试 ' + (lt.retries || 0) + ' · 工具错误 ' + (lt.toolErrors || 0) : ''));
    }
    if (state.show.win) {
      it(ico(ICON_WIN) +
        '<span class="dv">' + fmt(sess.total) + '</span>' + cachePct(sess.cacheRead, sess.input) +
        '<span class="dk">' + (sess.turns || 0) + '轮 · ' + (sess.requests || 0) + '次</span>',
        '会话累计：当前会话全部请求的 token 消耗\n' + ioc(sess.input, sess.output, sess.cacheRead, sess.reasoning, sess.cacheWrite) +
        '\n' + (sess.turns || 0) + ' 轮 · ' + (sess.requests || 0) + ' 次请求' +
        (sess.toolCalls ? ' · 工具调用 ' + sess.toolCalls : '') +
        (sess.retries ? ' · 重试 ' + sess.retries : '') +
        (sess.code && (sess.code.add || sess.code.del) ? '\n代码变更 +' + (sess.code.add || 0) + ' / −' + (sess.code.del || 0) + (sess.code.files ? '（' + sess.code.files + ' 文件）' : '') : ''));
    }
    if (state.show.tools) {
      var toolLines = [];
      (tls.list || []).forEach(function (t1) {
        toolLines.push(t1.name + ' ' + t1.count + '次 · ' + sec(t1.durationMs) + (t1.errors ? ' · ' + t1.errors + ' 个错误' : ''));
      });
      it(ico(ICON_TOOLS) + '<span class="dv">' + (tls.total || 0) + '</span>' +
        (tls.errors ? '<span class="deb">' + ico(ICON_ERR) + tls.errors + '</span>' : ''),
        '工具调用：当前会话的工具使用统计（按调用次数排序）\n' +
        (toolLines.length ? toolLines.join('\n') : '无工具调用记录'));
    }
    if (state.show.today) {
      it(ico(ICON_TODAY) +
        '<span class="dv">' + fmt(today.total) + '</span>' + cachePct(today.cacheRead, today.input) +
        '<span class="dk">' + (today.requests || 0) + '次</span>',
        '今日合计：今天所有会话的 token 总消耗（跨会话汇总）\n' +
        ioc(today.input, today.output, today.cacheRead, today.reasoning, today.cacheWrite) +
        '\n' + (today.requests || 0) + ' 次请求');
    }
    if (state.show.sub) {
      var subLines = [];
      (subs.list || []).forEach(function (s1) {
        subLines.push((s1.title || s1.sid.slice(0, 16)) + ' · ' + fmt(s1.total) + '（输入 ' + fmt(s1.input) + ' / 输出 ' + fmt(s1.output) + '）' + (s1.active ? ' · 运行中' : ''));
      });
      it(ico(ICON_SUB) + '<span class="dv">' + fmt(subs.total) + '</span>' + (subs.active ? '<span class="ddot">●</span>' : ''),
        '子代理：当前会话的后台子代理消耗（独立统计，不计入会话累计）\n' +
        ioc(subs.input, subs.output, subs.cacheRead, subs.reasoning, subs.cacheWrite) +
        '，共 ' + (subs.requests || 0) + ' 次' + (subs.active ? ' · 运行中' : '') +
        (subLines.length ? '\n' + subLines.join('\n') : ''));
    }
    return { s: items.join('<span class="dsep"></span>') || '<span class="dk">等待数据…</span>', tips: tips };
  }

  /* ---------- tooltip：向上弹出，只读文本 ---------- */
  var hoverEl = null;
  function hideTip(force, cause) {
    if (!force && hoverEl) return;
    if (tip.style.display !== 'none') tip.style.display = 'none';
    hoverEl = null;
  }
  function drawTip(el, keepTop) {
    var t = el && el.__tip;
    if (!t) { tip.style.display = 'none'; hoverEl = null; return; }
    tip.textContent = t;
    tip.style.display = 'block';
    var tr = tip.getBoundingClientRect(), ar = el.getBoundingClientRect();
    var left = ar.left + ar.width / 2 - tr.width / 2;
    left = Math.max(8, Math.min(left, Math.max(8, innerWidth - tr.width - 8)));
    var top = Math.max(8, ar.top - tr.height - 8);
    tip.style.left = Math.round(left) + 'px';
    tip.style.top = Math.round(top) + 'px';
  }
  document.addEventListener('mousemove', function (e) {
    if (stale()) return;
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#dream-usage-tip')) return;
    if (t.closest('.dpanel')) { if (hoverEl) hideTip(true, 'panel'); return; }
    var el = t.closest('#dream-usage-bar') ? t.closest('.dit') : null;
    if (el) {
      if (el !== hoverEl) {
        hoverEl = el;
        var els = main.querySelectorAll('.dit');
        el.__idx = Array.prototype.indexOf.call(els, el);
        el.__n = els.length;
        drawTip(el, false);
      }
    } else if (hoverEl) {
      hideTip(true, 'left');
    }
  }, true);

  /* ---------- 显示项开关面板 ---------- */
  function buildPanel() {
    panel.innerHTML =
      '<div class="dph">⚙ 状态条显示项</div>' +
      '<label><input type="checkbox" data-k="ctx"><span>上下文<em>进度条 + 百分比，颜色随占比变化</em></span></label>' +
      '<label><input type="checkbox" data-k="turn"><span>本轮<em>tokens / 次数 / 单次耗时 / 首字</em></span></label>' +
      '<label><input type="checkbox" data-k="win"><span>会话累计<em>当前会话 tokens / 轮数 / 次数</em></span></label>' +
      '<label><input type="checkbox" data-k="tools"><span>工具调用<em>当前会话，悬停看各工具明细与错误</em></span></label>' +
      '<label><input type="checkbox" data-k="today"><span>今日合计<em>今天所有会话的消耗</em></span></label>' +
      '<label><input type="checkbox" data-k="sub"><span>子代理<em>后台子代理消耗，悬停看明细</em></span></label>' +
      '<div class="dhr"></div>' +
      '<div class="dnote">数据源 ~/.zcode/cli/db/db.sqlite（只读）。悬停条面各项看明细；请求完成后数值才落库刷新。</div>';
    panel.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
      cb.checked = !!state.show[cb.dataset.k];
      cb.addEventListener('change', function () {
        if (stale()) return;
        state.show[cb.dataset.k] = cb.checked ? 1 : 0;
        lsSet(LS_SHOW, JSON.stringify(state.show));
        if (state.data) render(state.data);
      });
    });
  }
  buildPanel();
  gear.addEventListener('click', function () {
    if (stale()) return;
    panel.classList.toggle('open');
    if (panel.classList.contains('open') && hoverEl) hideTip(true, 'panel');
  });

  /* ---------- 渲染 ---------- */
  function render(d) {
    state.data = d;
    var pc = pickCurrent(d);
    var p = pc ? pc.sess : (d.session || null);
    state.pickedSid = p ? p.sid : '';
    window.__dreamWorkUsageWant = (pc && pc.want) || '';
    if (!p) p = stubFor((pc && pc.want) || '');
    state.excActive = excActive(p);
    var h = html({ session: p, today: d.today || {} });
    if (h.s !== lastHtml) {
      lastHtml = h.s;
      main.innerHTML = h.s;
      var els = main.querySelectorAll('.dit');
      for (var i = 0; i < els.length; i++) els[i].__tip = h.tips[i] || null;
      if (hoverEl) {
        var nu = null;
        if (hoverEl === main) nu = main;
        else if (hoverEl.__n === els.length) nu = els[hoverEl.__idx];
        if (nu && nu.__tip) { hoverEl = nu; drawTip(nu, true); } else hideTip(true, 'orphan');
      }
    }
  }
  window.__dreamWorkUsageUpdate = function (d) {
    if (stale()) return;
    try { render(d); } catch (e) { }
  };

  /* ---------- 超限告警气泡 ---------- */
  function syncExcBubble() {
    var show = state.excActive && !state.excGone && curDisplay === 'flex';
    if (!show) {
      if (!state.excActive) state.excGone = false;
      if (excBubble.style.display !== 'none') excBubble.style.display = 'none';
      return;
    }
    var sidEl = excBubble.querySelector('#du-exc-sid');
    var sidStr = state.pickedSid || '（未知）';
    if (sidEl.textContent !== sidStr) sidEl.textContent = sidStr;
    if (excBubble.style.display !== 'block') excBubble.style.display = 'block';
    var br = bar.getBoundingClientRect();
    var r = excBubble.getBoundingClientRect();
    var left = Math.max(8, Math.round(Math.min(br.left, innerWidth - r.width - 8)));
    var top = Math.max(8, Math.round(br.top - r.height - 8));
    if (excBubble.style.left !== left + 'px') excBubble.style.left = left + 'px';
    if (excBubble.style.top !== top + 'px') excBubble.style.top = top + 'px';
  }

  /* ---------- 定位：输入框玻璃外壳正下方（留分离带，不与框体贴合成一体）。
   * 关键：ZCode 输入框的可见边界是 .chat-composer-region（玻璃壳 + 渐变描边，
   * 比内部圆角输入卡低 ~34px），让位 margin 必须加在玻璃壳上——加在内层卡上
   * 只是扩大壳内空隙，壳不动，条会落进壳里（实测翻车）。sticky bottom-0 容器
   * 内内容增高即整体上移，壳被抬离窗底，条落在壳与窗底之间的壁纸上。 ---------- */
  var composer = null, cardCache = null, hideSince = 0, lastPos = [-1, -1], curDisplay = 'none';
  var CARD_MARGIN = '44px';
  var BAR_GAP = 10;

  function isVisualBox(el) {
    try {
      var cs = getComputedStyle(el);
      return cs.borderTopWidth !== '0px' || cs.backgroundColor !== 'rgba(0, 0, 0, 0)';
    } catch (e) { return false; }
  }
  function cardOf(el) {
    /* 首选：应用自己的玻璃外壳类（稳定钩子，皮肤 CSS 同款选择器） */
    try {
      var region = el.closest('.chat-composer-region');
      if (region && region !== document.body) return region;
    } catch (e) { }
    /* 兜底：类名变更时退回启发式（向上找第一个有边框/背景的视觉盒） */
    var cr = el.getBoundingClientRect();
    var p = el.parentElement, last = el, i = 0;
    for (; p && p !== document.body && i < 8; p = p.parentElement, i++) {
      var r = p.getBoundingClientRect();
      if (r.height > cr.height * 8 + 80) break;
      if (isVisualBox(p)) return p;
      last = p;
    }
    return last;
  }
  /* 可见性判定（对齐原版 overlay 实测结论）：设置页等覆盖层不卸载聊天 DOM、
   * 也不改几何（工作区保活，offsetParent/visibility/rect 全都骗得过），
   * 唯一可靠信号是输入框中心点的 elementFromPoint 命中测试。 */
  function visibleBox(el) {
    var r = el.getBoundingClientRect();
    return r.width > 40 && r.height > 8 && r.bottom > 0 && r.top < innerHeight;
  }
  function isOwnOverlay(el) {
    try { return !!(el && el.closest && el.closest('#dream-usage-tip,.dpanel,#dream-usage-exc,#dream-usage-bar')); } catch (e) { return false; }
  }
  /* 命中根元素 = 穿透假象：下拉/模态的滚动锁定给应用层设 pointer-events:none，
   * elementFromPoint 会跳过被盖层一路穿到底，视同被盖。 */
  function hitIsThroughRoot(hit) {
    return hit === document.body || hit === document.documentElement;
  }
  function reallyVisible(el, ownOK) {
    if (!visibleBox(el)) return false;
    var r = el.getBoundingClientRect();
    var hit;
    try { hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); } catch (e) { return true; }
    if (!hit) return false;
    if (hitIsThroughRoot(hit)) return false;
    if (hit === el || hit.contains(el) || el.contains(hit)) return true;
    if (ownOK && isOwnOverlay(hit)) return true;
    return false;
  }
  function findComposer() {
    var best = null;
    var cands = document.querySelectorAll('textarea, [contenteditable="true"]');
    for (var i = 0; i < cands.length; i++) {
      var el = cands[i];
      if (!reallyVisible(el)) continue;   // 设置页里被盖住的保活输入框不选
      var r = el.getBoundingClientRect();
      if (r.top < innerHeight * 0.45) continue;
      if (!best || r.top > best.getBoundingClientRect().top) best = el;
    }
    return best;
  }
  function releasePads() {
    try {
      document.querySelectorAll('[data-du-pad]').forEach(function (el) {
        el.style.marginBottom = el.dataset.duPad || '';
        delete el.dataset.duPad;
      });
    } catch (e) { }
  }
  function ensureCardPad() {
    if (!cardCache) return;
    try {
      if (cardCache.dataset.duPad === undefined) cardCache.dataset.duPad = cardCache.style.marginBottom || '';
      if (cardCache.style.marginBottom !== CARD_MARGIN) cardCache.style.marginBottom = CARD_MARGIN;
    } catch (e) { }
  }
  function setComposer(el) {
    releasePads();
    composer = el;
    cardCache = null;
    if (composer) {
      var c = cardOf(composer);
      if (c && c !== document.body) cardCache = c;
    }
    if (cardCache) ensureCardPad();
  }
  /* 原生上下文总量：输入框工具行按钮文本/aria-label "…总量 1,000,000"（服务端下发，跟随模型） */
  var nativeCtx = { val: 0, at: 0 };
  function readNativeCtx(card) {
    if (Date.now() - nativeCtx.at < 5000) return nativeCtx.val;
    nativeCtx.at = Date.now();
    try {
      var els = card.querySelectorAll('button, [aria-label], [title]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var t = el.getAttribute('aria-label') || el.getAttribute('title') || el.textContent || '';
        var m = t.match(/总量\s*([\d,，]+)/);
        if (m) {
          nativeCtx.val = parseInt(m[1].replace(/[,]/g, '').replace(/\uFF0C/g, ''), 10);
          return nativeCtx.val;
        }
      }
    } catch (e) { }
    return nativeCtx.val;
  }
  function themeOn() {
    var st = document.getElementById('dream-work-style');
    return !!(st && st.textContent && st.textContent.length > 0);
  }
  function hideBar() {
    if (curDisplay !== 'none') { bar.style.display = 'none'; curDisplay = 'none'; }
    hideTip(true, 'bar-hidden');
  }
  function heavy() {
    if (stale()) return;
    if (!bar.isConnected) document.body.appendChild(bar);
    if (!tip.isConnected) document.body.appendChild(tip);
    if (!excBubble.isConnected) document.body.appendChild(excBubble);
    if (!themeOn()) { hideBar(); return; }
    var el = findComposer();
    if (el && el !== composer) setComposer(el);
    else if (!el && composer && !composer.isConnected) setComposer(null);
    if (composer) {
      if (!cardCache || !cardCache.isConnected) {
        var c = cardOf(composer);
        cardCache = c && c !== document.body ? c : null;
      }
      if (cardCache) {
        ensureCardPad();
        state.nativeCtx = readNativeCtx(cardCache);
      }
    }
    if (state.data) {
      var pc = pickCurrent(state.data);
      var pSid = pc ? (pc.sess ? pc.sess.sid : pc.want) : '';
      window.__dreamWorkUsageWant = (pc && pc.want) || '';
      if (pSid !== state.pickedSid) render(state.data);
    }
  }
  /* 整页路由切换（设置页等）的即时信号：工作区被 CSS 整体隐藏时
   * checkVisibility 同步返回 false（会话页 true）。这是稳定状态，不能等
   * 400ms 防闪迟滞——用户要求"切换即消失"；迟滞只留给命中测试的瞬时抖动。 */
  function checkHidden(el) {
    try {
      if (typeof el.checkVisibility === 'function') {
        return !el.checkVisibility({ visibilityProperty: true, opacityProperty: true, contentVisibilityAuto: true });
      }
    } catch (e) { }
    return false;
  }
  function coverOK(el) {
    try {
      var r = el.getBoundingClientRect();
      var hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if (!hit) return false;
      if (hitIsThroughRoot(hit)) return false;
      if (hit === el || hit.contains(el) || el.contains(hit)) return true;
      if (cardCache && cardCache.contains(el) && cardCache.contains(hit)) return true;
      if (isOwnOverlay(hit)) return true;
      return false;
    } catch (e) { return true; }
  }
  function track() {
    if (stale()) return;
    try {
      syncExcBubble();
      if (!composer || !composer.isConnected) { hideSince = 0; hideBar(); return; }
      if (cardCache && cardCache.style.marginBottom !== CARD_MARGIN) ensureCardPad();
      var r = composer.getBoundingClientRect();
      var on = reallyVisible(composer, true) || coverOK(composer);
      if (!on) {
        /* 路由切换/工作区整体隐藏/输入框移出视口 = 稳定状态，立即隐藏 */
        if (checkHidden(composer) || r.bottom <= 0 || r.top >= innerHeight) {
          hideSince = 0;
          hideBar();
          return;
        }
        if (!hideSince) hideSince = Date.now();
        if (Date.now() - hideSince > 400) hideBar();
        return;
      }
      hideSince = 0;
      if (curDisplay !== 'flex') { bar.style.display = 'flex'; curDisplay = 'flex'; }
      var anchor = cardCache || composer;
      var ar = anchor.getBoundingClientRect();
      var left = Math.round(ar.left);
      var top = Math.max(8, Math.min(Math.round(ar.bottom + BAR_GAP), innerHeight - bar.offsetHeight - 4));
      if (left !== lastPos[0] || top !== lastPos[1]) {
        bar.style.left = left + 'px';
        bar.style.top = top + 'px';
        lastPos = [left, top];
      }
      /* 条宽 = 输入卡片同宽：左右缘与卡片对齐；条目左对齐、⚙ 推到右缘 */
      var w = Math.max(60, Math.round(ar.width));
      if (bar.style.width !== w + 'px') bar.style.width = w + 'px';
    } catch (e) { } finally {
      requestAnimationFrame(track);
    }
  }

  setInterval(heavy, 600);
  heavy();
  requestAnimationFrame(track);
})();
`;
}
