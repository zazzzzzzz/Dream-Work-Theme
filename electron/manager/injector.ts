import { readFile } from 'fs/promises';
import * as fs from 'fs';
import * as path from 'path';
import { app, nativeImage } from 'electron';
import { CdpSession, fetchRendererTargets, waitForRendererTargets, isAnyPageTarget } from './cdp';
import { getThemeHeroDataUrl, getThemeVideoPath, listThemes } from './theme-store';
import { getAppDefinition } from './app-registry';
import { ensureSharedCustomThemeService, listSharedCustomThemes, mergeSharedCustomThemes, recordThemeUsage, selectQuickThemeIds } from './custom-theme-store';
import { Rgb, hexToRgb, rgbToHex, mixRgb, ensureContrastAgainstAll, contrastRatio, relativeLuminance, rgbToHsl, hslToRgb } from './contrast';
import { decodePngAverageRgb } from './hero-png';
import { buildUsageBarScript } from './usage-bar';
import { startUsagePump, stopUsagePump } from './usage-pump';

const STYLE_ID = 'dream-work-style';
const MENU_ID = 'dream-work-menu';
const hanaAgentPersistentScripts = new Map<string, string>();
const hanaAgentWatchers = new Map<number, NodeJS.Timeout>();
const hanaAgentGenerations = new Map<number, number>();
/* ZCode token 用量状态栏：Page.addScriptToEvaluateOnNewDocument 注册句柄
 * （页面重载后自动重挂状态栏；applyTheme 重注入前先摘旧句柄） */
const usageBarScripts = new Map<string, string>();
const WORKBUDDY_CSS_PLACEHOLDERS = {
  id: 'wb-dream-sentinel-id',
  hero: 'data:image/png;base64,WBDREAMHEROSENTINEL',
  accent: '#010203',
  secondary: '#040506',
  surface: '#070809',
  text: '#0a0b0c',
  // 派生文字色的独立哨兵：模板里次级文字位置放这些值，
  // 页面端按提取调色板推导后替换，避免与主文字色耦合。
  textSubtle: '#0d0e0f',
  textSubtlest: '#101112',
  textSecondary: '#131415',
};

// 各应用中文字实际落在的半透明表面（surface 对壁纸的 alpha 列表，与
// buildGenericWorkCss / buildZCodeConversationCss / buildCodexCss 等生成
// 的材质对应）。对比度按 surface×alpha + 壁纸平均色×(1-alpha) 的合成
// 背景计算，而不是纯 surface，否则半透明玻璃上的真实对比度会被高估。
const HERO_BACKED_SURFACE_ALPHAS: Record<string, number[]> = {
  zcode: [0.60, 0.66, 0.78, 0.80],
  codex: [0.76, 0.82, 0.86, 0.90, 0.92],
  catpaw: [0.78, 0.82],
  'qoder-work': [0.70, 0.82, 0.86, 0.90],
  'qwen-office': [0.86, 0.90],
  workbuddy: [0.58, 0.62, 0.92],
  'hana-agent': [0.62, 0.66, 0.78],
};
const DEFAULT_SURFACE_ALPHAS = [0.6, 0.66, 0.78, 0.8];   // 与增透后的玻璃一致（PNL/USR 与各弹层混比）

function surfaceAlphasFor(appId: string): number[] {
  return HERO_BACKED_SURFACE_ALPHAS[appId] ?? DEFAULT_SURFACE_ALPHAS;
}

// 视频文件绝对路径 → file:/// URL（ZCode 页面本身是 file:// 源，media 元素可直读；
// encodeURI 不转义 # 与 ?，手工补齐避免被当成分隔符）
function videoFileUrl(absPath: string | null): string | undefined {
  if (!absPath) return undefined;
  return 'file:///' + encodeURI(absPath.replace(/\\/g, '/')).replace(/#/g, '%23').replace(/\?/g, '%3F');
}

/* 宠物注册表（ZCode 桌面宠物）：assets/pet/<id>/ 一目录一宠物，pet.json 提供
 * id/name/order/scale，目录内 GIF 的文件名（去扩展名）即状态键（idle / look-left-side /
 * look-right-side / running / running-left / running-right / review / jumping / failed /
 * waiting / waving）——新宠物按状态命名放进目录即可加载。
 * GIF 以 file:// URL 注入（与视频层同款：安装包内映射 app.asar.unpacked，Chromium
 * 的 img 读不了 asar；按需懒加载，菜单脚本不被素材体积拖大）。 */
export interface PetDef {
  id: string;
  name: string;
  order: number;
  scale: number;
  states: Record<string, string>;
}

let petRegistryCache: PetDef[] | null = null;
export function getPetRegistry(): PetDef[] | undefined {
  if (petRegistryCache) return petRegistryCache.length ? petRegistryCache : undefined;
  const out: PetDef[] = [];
  try {
    const appPath = app.getAppPath();
    const inAsar = (p: string) => appPath.endsWith('.asar') && (p === appPath || p.startsWith(appPath + path.sep));
    const base = path.resolve(path.join(appPath, 'assets', 'pet'));
    for (const dirName of fs.readdirSync(base)) {
      /* 越界防御：目录名只接受 basename，解析结果必须落在 assets/pet 之内 */
      if (dirName !== path.basename(dirName)) continue;
      const dir = path.resolve(base, dirName);
      if (dir !== base && !dir.startsWith(base + path.sep)) continue;
      try { if (!fs.statSync(dir).isDirectory()) continue; } catch { continue; }
      let meta: any = {};
      try { meta = JSON.parse(fs.readFileSync(path.join(dir, 'pet.json'), 'utf8')); } catch { }
      const states: Record<string, string> = {};
      try {
        for (const f of fs.readdirSync(dir)) {
          /* 状态键 = 文件名去扩展名；同一状态多格式时 .webp（8 位 alpha 平滑轮廓）优先 */
          const ext = path.extname(f).toLowerCase();
          if (!['.gif', '.webp', '.png'].includes(ext) || f !== path.basename(f)) continue;
          const key = f.slice(0, -ext.length);
          if (states[key] && ext !== '.webp') continue;
          let filePath = path.join(dir, f);
          if (inAsar(filePath)) {
            const unpacked = path.resolve(appPath + '.unpacked', path.relative(appPath, filePath));
            if (fs.existsSync(unpacked)) filePath = unpacked;
          }
          const url = videoFileUrl(filePath);
          if (!url) continue;
          /* mtime 作查询串防 Chromium 缓存旧素材（file:// 解析只用路径，查询不影响取文件） */
          let stamp = 0;
          try { stamp = Math.round(fs.statSync(filePath).mtimeMs); } catch { }
          states[key] = stamp ? url + '?v=' + stamp : url;
        }
      } catch { }
      if (!Object.keys(states).length) continue;
      out.push({
        id: String(meta.id || dirName),
        name: String(meta.name || dirName),
        order: Number.isFinite(Number(meta.order)) ? Number(meta.order) : 99,
        scale: Number.isFinite(Number(meta.scale)) && Number(meta.scale) > 0 ? Number(meta.scale) : 0.5,
        states,
      });
    }
    out.sort((a, b) => a.order - b.order || (a.id < b.id ? -1 : 1));
  } catch (e) {
    console.warn('[injector] pet registry unavailable:', (e as Error).message);
  }
  petRegistryCache = out;
  return out.length ? out : undefined;
}

const heroAverageCache = new Map<string, { size: number; mtimeMs: number; rgb: Rgb | null }>();

/** 主进程侧对 hero 图采样平均色：缩到 1×1 再解码 PNG（Chromium 缩放即全图加权平均）。
    失败返回 null，调用方回退为纯 surface 计算对比度。 */
function getHeroAverageRgb(heroPath: string): Rgb | null {
  let stats: fs.Stats;
  try {
    stats = fs.statSync(heroPath);
  } catch {
    return null;
  }
  const cached = heroAverageCache.get(heroPath);
  if (cached && cached.size === stats.size && cached.mtimeMs === stats.mtimeMs) return cached.rgb;
  let rgb: Rgb | null = null;
  try {
    const image = nativeImage.createFromPath(heroPath);
    if (!image.isEmpty()) {
      const dataUrl = image.resize({ width: 1, height: 1 }).toDataURL();
      rgb = decodePngAverageRgb(Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64'));
    }
  } catch (e) {
    console.warn('[injector] Hero average sampling failed:', (e as Error).message);
  }
  heroAverageCache.set(heroPath, { size: stats.size, mtimeMs: stats.mtimeMs, rgb });
  return rgb;
}

// Load base Codex skin CSS (from codex-themes-main)
let CODEX_BASE_CSS: string | null = null;
async function getCodexBaseCss(): Promise<string> {
  if (!CODEX_BASE_CSS) {
    try {
      // vite-plugin-electron bundles TS into dist-electron/main.js, so __dirname
      // points at dist-electron/, while the CSS lives in dist-electron/manager/.
      const cssPath = path.resolve(__dirname, 'manager', 'codex-dream-skin.css');
      CODEX_BASE_CSS = await readFile(cssPath, 'utf-8');
    } catch (e) {
      console.warn('[injector] Failed to load Codex base CSS:', (e as Error).message);
      CODEX_BASE_CSS = '';
    }
  }
  return CODEX_BASE_CSS;
}

export async function applyTheme(
  appId: string,
  themeId: string,
  port: number,
  options: { rendererUrlHint?: string; profile?: any } = {}
): Promise<{ success: boolean; applied: number; error?: string }> {
  const definition = getAppDefinition(appId);
  const hints = options.rendererUrlHint ? [options.rendererUrlHint] : definition?.rendererHints ?? ['renderer/index.html', 'index.html'];
  let targets: any[] = [];
  let lastError: string = 'No renderer targets found';

  for (const hint of hints) {
    try {
      console.log(`[injector] Trying hint "${hint}" on port ${port}`);
      targets = await waitForRendererTargets(port, hint, { timeoutMs: 20000, pollMs: 500 });
      if (targets.length > 0) {
        console.log(`[injector] Found ${targets.length} targets with hint "${hint}"`);
        break;
      }
    } catch (e: any) {
      lastError = e.message;
      console.log(`[injector] Hint "${hint}" failed: ${e.message}`);
    }
  }

  // Fallback: accept any page target if strict URL hint matching found nothing
  if (targets.length === 0) {
    try {
      console.log(`[injector] Strict hints failed, trying relaxed page-target fallback on port ${port}`);
      const resp = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(5000) });
      const json = await resp.json();
      const relaxed = (Array.isArray(json) ? json : []).filter(isAnyPageTarget).sort((a: any, b: any) => {
        const la = [String(a.id ?? ''), a.url, a.webSocketDebuggerUrl];
        const lb = [String(b.id ?? ''), b.url, b.webSocketDebuggerUrl];
        for (let i = 0; i < la.length; i++) { if (la[i] < lb[i]) return -1; if (la[i] > lb[i]) return 1; }
        return 0;
      });
      
      if (relaxed.length > 0) {
        console.log(`[injector] Relaxed fallback found ${relaxed.length} page targets`);
        targets = relaxed;
      }
    } catch (e: any) {
      console.log(`[injector] Relaxed fallback failed: ${e.message}`);
    }
  }

  if (targets.length === 0) {
    return { success: false, applied: 0, error: lastError };
  }

  try {

    // Load all themes for the menu
    const allThemes = listThemes(appId);
    console.log(`[injector] Loaded ${allThemes.length} themes`);
    if (!allThemes.some(theme => theme.id === themeId)) {
      return { success: false, applied: 0, error: `Theme ${themeId} is not compatible with ${appId}` };
    }
    // 快捷菜单上限 8：对应 Ctrl+Alt+1~8 快捷切换（buildMenuScript 行尾数字角标）
    const quickThemeIds = selectQuickThemeIds(appId, allThemes.map(theme => theme.id), themeId, 8);
    const themesById = new Map(allThemes.map(theme => [theme.id, theme]));
    const menuThemeEntries = quickThemeIds.map(id => themesById.get(id)).filter(Boolean) as typeof allThemes;
    const themeEntries = new Map<string, { name: string; css: string; surface: string; videoUrl?: string }>();
    for (const theme of menuThemeEntries) {
      // 视频分支只在视频文件真实可解析时启用：否则壁纸透明化会没有视频层兜底
      const themeVideoPath = appId === 'zcode' ? getThemeVideoPath(theme) : null;
      themeEntries.set(theme.id, {
        name: theme.name,
        css: buildAppCss(appId, theme.manifest, getThemeHeroDataUrl(theme), getHeroAverageRgb(path.join(theme.path, theme.manifest.hero)), { video: Boolean(themeVideoPath) }),
        surface: theme.manifest.colors.surface,
        videoUrl: videoFileUrl(themeVideoPath),
      });
    }

    // Build menu script with all themes
    const menuThemes = Array.from(themeEntries.entries()).map(([id, entry]) => ({
      id,
      name: entry.name,
      css: entry.css,
      surface: entry.surface,
      accent: allThemes.find(theme => theme.id === id)?.manifest.colors.accent ?? '#24c9d7',
      videoUrl: entry.videoUrl,
    }));
    let sharedCustomThemes = listSharedCustomThemes();
    if (sharedCustomThemes.length === 0) {
      const storageKey = appId === 'workbuddy' ? 'dreamCustomThemes' : 'dreamCodexCustomThemes';
      for (const target of targets) {
        const session = new CdpSession(target.webSocketDebuggerUrl);
        try {
          await session.open();
          const serialized = await session.evaluate(`(() => localStorage.getItem(${JSON.stringify(storageKey)}) || '[]')()`);
          const localThemes = JSON.parse(serialized);
          if (Array.isArray(localThemes) && localThemes.length > 0) {
            sharedCustomThemes = mergeSharedCustomThemes(localThemes);
            break;
          }
        } catch (error) {
          console.warn(`[injector] Failed to import existing custom themes from ${appId} target ${target.id}:`, error);
        } finally {
          session.close();
        }
      }
    }
    const sharedCustomThemeService = await ensureSharedCustomThemeService();
    const menuScript = appId === 'workbuddy'
      ? buildWorkBuddyMenuScript({
          styleId: STYLE_ID,
          menuId: MENU_ID,
          currentThemeId: themeId,
          themes: menuThemes,
          sharedCustomThemes,
          sharedCustomThemeService,
          cssTemplate: buildWorkBuddyCss({
            id: WORKBUDDY_CSS_PLACEHOLDERS.id,
            colors: {
              accent: WORKBUDDY_CSS_PLACEHOLDERS.accent,
              secondary: WORKBUDDY_CSS_PLACEHOLDERS.secondary,
              surface: WORKBUDDY_CSS_PLACEHOLDERS.surface,
              text: WORKBUDDY_CSS_PLACEHOLDERS.text,
            },
            copy: null,
          }, WORKBUDDY_CSS_PLACEHOLDERS.hero, {
            accent: WORKBUDDY_CSS_PLACEHOLDERS.accent,
            secondary: WORKBUDDY_CSS_PLACEHOLDERS.secondary,
            surface: WORKBUDDY_CSS_PLACEHOLDERS.surface,
            text: WORKBUDDY_CSS_PLACEHOLDERS.text,
          }),
        })
      : appId === 'hana-agent'
        ? buildHanaAgentMenuScript({
            styleId: STYLE_ID,
            menuId: MENU_ID,
            currentThemeId: themeId,
            themes: menuThemes,
            sharedCustomThemes,
            sharedCustomThemeService,
            cssTemplate: buildHanaAgentCss({
              id: WORKBUDDY_CSS_PLACEHOLDERS.id,
              colors: {
                accent: WORKBUDDY_CSS_PLACEHOLDERS.accent,
                secondary: WORKBUDDY_CSS_PLACEHOLDERS.secondary,
                surface: WORKBUDDY_CSS_PLACEHOLDERS.surface,
                text: WORKBUDDY_CSS_PLACEHOLDERS.text,
              },
            }, WORKBUDDY_CSS_PLACEHOLDERS.hero, {
              accent: WORKBUDDY_CSS_PLACEHOLDERS.accent,
              secondary: WORKBUDDY_CSS_PLACEHOLDERS.secondary,
              surface: WORKBUDDY_CSS_PLACEHOLDERS.surface,
              text: WORKBUDDY_CSS_PLACEHOLDERS.text,
            }),
          })
      : buildMenuScript({
          styleId: STYLE_ID,
          menuId: MENU_ID,
          currentThemeId: themeId,
          appId,
          themes: menuThemes,
          sharedCustomThemes,
          sharedCustomThemeService,
          // 模板模式：占位哨兵色原样透传进 CSS，页面端替换真实调色板后
          // 再做对比度提升（见脚本内 deriveTextColors）。
          cssTemplate: buildAppCss(appId, {
            id: WORKBUDDY_CSS_PLACEHOLDERS.id,
            colors: {
              accent: WORKBUDDY_CSS_PLACEHOLDERS.accent,
              secondary: WORKBUDDY_CSS_PLACEHOLDERS.secondary,
              surface: WORKBUDDY_CSS_PLACEHOLDERS.surface,
              text: WORKBUDDY_CSS_PLACEHOLDERS.text,
            },
          }, WORKBUDDY_CSS_PLACEHOLDERS.hero, null, { template: true }),
          surfaceAlphas: surfaceAlphasFor(appId),
          // ZCode：桌面宠物（assets/pet 注册表，GIF 以 data URL 内嵌）
          pets: appId === 'zcode' ? getPetRegistry() : undefined,
        });

    // Inject to all targets
    let applied = 0;
    for (const target of targets) {
      try {
        console.log(`[injector] Injecting to target ${target.id}: ${target.url}`);
        const session = new CdpSession(target.webSocketDebuggerUrl);
        await session.open();

        if (appId === 'workbuddy') {
          const isWorkBuddy = await session.evaluate(`(() => {
            const body = document.body;
            return body?.dataset.applicationName === 'workbuddy' && Boolean(
              document.querySelector('[data-view-id], .teams-container, .conversation-list, .main-content')
            );
          })()`);
          if (!isWorkBuddy) {
            console.warn(`[injector] Skipping non-WorkBuddy target ${target.id}: ${target.url}`);
            session.close();
            continue;
          }
        }
        
        // For Codex, inject base CSS first
        if (appId === 'codex') {
          const baseCss = await getCodexBaseCss();
          if (baseCss) {
            await session.evaluate(`(() => {
              const existing = document.getElementById('codex-dream-skin-base');
              if (!existing) {
                const style = document.createElement('style');
                style.id = 'codex-dream-skin-base';
                style.textContent = ${JSON.stringify(baseCss)};
                document.head.appendChild(style);
              }
            })()`);
          }
        }
        
        if (appId === 'hana-agent') {
          const persistentScript = `(() => {
            const inject = () => ${menuScript};
            if (document.readyState === 'loading') {
              window.addEventListener('DOMContentLoaded', inject, { once: true });
            } else {
              inject();
            }
          })()`;
          const previousIdentifier = hanaAgentPersistentScripts.get(target.id);
          if (previousIdentifier) {
            await session.removeScriptToEvaluateOnNewDocument(previousIdentifier).catch(() => {});
          }
          const identifier = await session.addScriptToEvaluateOnNewDocument(persistentScript);
          if (identifier) hanaAgentPersistentScripts.set(target.id, identifier);
        }
        const evalResult = await session.evaluate(appId === 'hana-agent'
          ? `(() => { window.__dreamWorkForceApply = true; return ${menuScript}; })()`
          : menuScript);
        console.log(`[injector] Injection result for target ${target.id}:`, evalResult);

        /* ZCode token 用量状态栏：与主题同批注入（持久化注册保证页面重载后自动重挂），
         * 数据由 usage-pump 经 CDP 推送；配色引用主题 CSS 变量，随换肤自动跟随 */
        if (appId === 'zcode') {
          const barScript = buildUsageBarScript();
          const previousBarIdentifier = usageBarScripts.get(target.id);
          if (previousBarIdentifier) {
            await session.removeScriptToEvaluateOnNewDocument(previousBarIdentifier).catch(() => {});
          }
          const barIdentifier = await session.addScriptToEvaluateOnNewDocument(
            `(() => { const inject = () => { ${barScript} }; if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true }); else inject(); })()`
          ).catch(() => undefined);
          if (barIdentifier) usageBarScripts.set(target.id, barIdentifier);
          await session.evaluate(barScript).catch((e) =>
            console.warn(`[injector] Usage bar injection failed for target ${target.id}:`, (e as Error).message));
        }

        if (appId === 'hana-agent') {
          let ready = false;
          for (let attempt = 0; attempt < 20; attempt++) {
            ready = await session.evaluate(`(() => {
              const host = document.getElementById('${MENU_ID}-host');
              return Boolean(
                document.getElementById('${STYLE_ID}') &&
                host?.shadowRoot?.getElementById('${MENU_ID}') &&
                document.documentElement.dataset.dreamTheme
              );
            })()`).catch(() => false);
            if (ready) break;
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          if (!ready) {
            console.warn(`[injector] HanaAgent injection did not become ready for target ${target.id}`);
            session.close();
            continue;
          }
        }

        // For Codex, ensure home-surface classes are present so the base CSS
        // (background-image / chrome / suggestion cards) can match the DOM.
        if (appId === 'codex') {
          // Retry a few times because Codex may still be mounting its home DOM.
          for (let attempt = 1; attempt <= 4; attempt++) {
            const codexDebug = await session.evaluate(`(() => {
              const shellMain = document.querySelector('main.main-surface') || document.querySelector('main');
              let homeCandidate = shellMain ? (shellMain.matches('[role="main"]') ? shellMain : shellMain.querySelector('[role="main"]')) : null;
              
              // Fallback: if no [role="main"] found, try broader selectors.
              if (!homeCandidate) {
                homeCandidate = document.querySelector('[class*="home-main-content"]') ||
                                document.querySelector('[class*="home-content"]') ||
                                document.querySelector('main') ||
                                document.querySelector('.app-shell') ||
                                document.body;
              }
              
              if (!homeCandidate) return { error: 'no homeCandidate' };
              
              const hasGameSource = Boolean(homeCandidate.querySelector('[data-feature="game-source"]'));
              const hasSuggestions = Boolean(homeCandidate.querySelector('[class*="group/home-suggestions"]'));
              const hasTaskContent = Boolean(homeCandidate.querySelector('.thread-scroll-container, [data-message-author-role], article, .message'));
              
              // If we fell back to body/main and can't detect home signals, still tag it
              // so the CSS selectors have something to bind to.
              const isFallback = homeCandidate === document.body || homeCandidate.matches('main');
              const isHomeContainer = homeCandidate.matches('[class*="home-main-content"], [class*="container-name:home-main-content"]');
              if ((hasGameSource || hasSuggestions || isHomeContainer || isFallback) && !hasTaskContent) {
                homeCandidate.classList.add('dream-skin-home');
                if (shellMain) shellMain.classList.add('dream-skin-home-shell');
              } else if (shellMain) {
                shellMain.classList.remove('dream-skin-home-shell');
              }
              return {
                homeClasses: Array.from(homeCandidate.classList),
                shellClasses: shellMain ? Array.from(shellMain.classList) : [],
                hasGameSource,
                hasSuggestions,
                hasTaskContent,
                isHomeContainer,
                isFallback
              };
            })`);
            if (codexDebug.homeClasses && codexDebug.homeClasses.includes('dream-skin-home')) {
              console.log(`[injector] Codex home detection for ${target.id}: attempt=${attempt}`, JSON.stringify(codexDebug));
              break;
            }
            if (attempt < 4) {
              await new Promise(r => setTimeout(r, 800));
            }
          }
        }
        
        // Debug: check if Codex styles were applied
        if (appId === 'codex') {
          try {
            const debugResult = await session.evaluate(`(() => {
              const html = document.documentElement;
              const body = document.body;
              const style = document.getElementById('dream-work-style');
              const baseStyle = document.getElementById('codex-dream-skin-base');
              const menu = document.getElementById('dream-work-menu');
              
              // Check computed styles of key elements
              const mainSurface = document.querySelector('main.main-surface') || document.querySelector('main');
              const sidebar = document.querySelector('aside.app-shell-left-panel');
              const homeEl = document.querySelector('.dream-skin-home');
              
              return {
                htmlClasses: Array.from(html.classList),
                bodyClasses: Array.from(body.classList),
                hasStyle: Boolean(style),
                styleLength: style ? style.textContent.length : 0,
                hasBaseStyle: Boolean(baseStyle),
                baseStyleLength: baseStyle ? baseStyle.textContent.length : 0,
                hasMenu: Boolean(menu),
                title: document.title,
                url: window.location.href,
                mainSurfaceClasses: mainSurface ? Array.from(mainSurface.classList) : null,
                sidebarClasses: sidebar ? Array.from(sidebar.classList) : null,
                homeClasses: homeEl ? Array.from(homeEl.classList) : null,
                codexDreamSkinOnHtml: html.classList.contains('codex-dream-skin'),
                dreamTheme: html.dataset.dreamTheme || null
              };
            })()`);
            console.log(`[injector] Codex debug info for ${target.id}:`, JSON.stringify(debugResult, null, 2));
          } catch (e) {
            console.error(`[injector] Failed to get debug info for ${target.id}:`, e);
          }
        }
        
        session.close();
        applied++;
      } catch (e) {
        console.error(`[injector] Failed to inject to target ${target.id}:`, e);
      }
    }

    if (appId === 'hana-agent' && applied > 0) {
      const injectedTargetIds = new Set(targets.map(target => target.id));
      const deadline = Date.now() + 20000;
      let stableTargetId = '';
      let stableSince = 0;

      while (Date.now() < deadline) {
        let currentTargets: any[] = [];
        try {
          currentTargets = await fetchRendererTargets(port, '.hanako/artifacts/renderer/', { timeoutMs: 2000, quiet: true });
        } catch {}
        const current = currentTargets[0];
        if (!current) {
          stableTargetId = '';
          stableSince = 0;
          await new Promise(resolve => setTimeout(resolve, 250));
          continue;
        }

        if (!injectedTargetIds.has(current.id)) {
          console.log(`[injector] HanaAgent created renderer target ${current.id}; injecting theme`);
          const session = new CdpSession(current.webSocketDebuggerUrl);
          try {
            await session.open();
            const persistentScript = `(() => {
              const inject = () => ${menuScript};
              if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true });
              else inject();
            })()`;
            const identifier = await session.addScriptToEvaluateOnNewDocument(persistentScript);
            if (identifier) hanaAgentPersistentScripts.set(current.id, identifier);
            await session.evaluate(`(() => { window.__dreamWorkForceApply = true; return ${menuScript}; })()`);
            injectedTargetIds.add(current.id);
          } finally {
            session.close();
          }
        }

        const session = new CdpSession(current.webSocketDebuggerUrl);
        let ready = false;
        try {
          await session.open();
          ready = await session.evaluate(`(() => {
            const host = document.getElementById('${MENU_ID}-host');
            return Boolean(document.getElementById('${STYLE_ID}') && host?.shadowRoot?.getElementById('${MENU_ID}') && document.documentElement.dataset.dreamTheme);
          })()`);
        } catch {} finally {
          session.close();
        }

        if (ready) {
          if (stableTargetId !== current.id) {
            stableTargetId = current.id;
            stableSince = Date.now();
          } else if (Date.now() - stableSince >= 2000) {
            startHanaAgentWatcher(port, menuScript, injectedTargetIds);
            recordThemeUsage(appId, themeId);
            return { success: true, applied: 1 };
          }
        } else {
          stableTargetId = '';
          stableSince = 0;
        }
        await new Promise(resolve => setTimeout(resolve, 250));
      }
      return { success: false, applied: 0, error: 'HanaAgent renderer did not stabilize with the injected theme' };
    }
    if (appId === 'zcode' && applied > 0) startUsagePump(port);
    if (applied > 0) recordThemeUsage(appId, themeId);
    return { success: applied > 0, applied };
  } catch (error: any) {
    console.error('[injector] Injection failed:', error);
    return { success: false, applied: 0, error: error.message };
  }
}

export async function getStatus(
  appId: string,
  port: number,
  options: { rendererUrlHint?: string } = {}
): Promise<{ installed: boolean; menu: boolean; themeId?: string; targets?: number }> {
  return readStatusOnce(appId, port, options);
}

function startHanaAgentWatcher(port: number, menuScript: string, injectedTargetIds: Set<string>): void {
  const existing = hanaAgentWatchers.get(port);
  if (existing) clearInterval(existing);
  const generation = (hanaAgentGenerations.get(port) ?? 0) + 1;
  hanaAgentGenerations.set(port, generation);
  let busy = false;
  const timer = setInterval(async () => {
    if (busy) return;
    if (hanaAgentGenerations.get(port) !== generation) return;
    busy = true;
    try {
      const targets = await fetchRendererTargets(port, '.hanako/artifacts/renderer/', { timeoutMs: 1000, quiet: true });
      const target = targets[0];
      if (!target) return;
      if (hanaAgentGenerations.get(port) !== generation) return;
      const session = new CdpSession(target.webSocketDebuggerUrl);
      try {
        await session.open();
        const state = await session.evaluate(`(() => {
          const host = document.getElementById('${MENU_ID}-host');
          if (document.documentElement.dataset.dreamThemeRestored === 'true') return 'restored';
          return document.getElementById('${STYLE_ID}') && host?.shadowRoot?.getElementById('${MENU_ID}') && document.documentElement.dataset.dreamTheme
            ? 'ready'
            : 'missing';
        })()`).catch(() => 'missing');
        if (state === 'ready' || state === 'restored') {
          injectedTargetIds.add(target.id);
          return;
        }
        console.log(`[injector] HanaAgent watcher restoring theme on renderer target ${target.id}`);
        if (hanaAgentGenerations.get(port) !== generation) return;
        const persistentScript = `(() => {
          const inject = () => ${menuScript};
          if (document.readyState === 'loading') window.addEventListener('DOMContentLoaded', inject, { once: true });
          else inject();
        })()`;
        if (!injectedTargetIds.has(target.id)) {
          const identifier = await session.addScriptToEvaluateOnNewDocument(persistentScript);
          if (identifier) hanaAgentPersistentScripts.set(target.id, identifier);
        }
        await session.evaluate(menuScript);
        if (hanaAgentGenerations.get(port) !== generation) {
          await session.evaluate(`(() => {
            document.getElementById('${STYLE_ID}')?.remove();
            document.getElementById('${MENU_ID}-host')?.remove();
            clearInterval(window.__dreamWorkMenuGuard);
            delete window.__dreamWorkMenuGuard;
            delete document.documentElement.dataset.dreamTheme;
          })()`).catch(() => {});
          return;
        }
        injectedTargetIds.add(target.id);
      } finally {
        session.close();
      }
    } catch {
      if (!(await isPortReachable(port))) {
        clearInterval(timer);
        hanaAgentWatchers.delete(port);
      }
    } finally {
      busy = false;
    }
  }, 1000);
  hanaAgentWatchers.set(port, timer);
}

async function isPortReachable(port: number): Promise<boolean> {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(500) });
    return response.ok;
  } catch {
    return false;
  }
}

async function readStatusOnce(
  appId: string,
  port: number,
  options: { rendererUrlHint?: string } = {}
): Promise<{ installed: boolean; menu: boolean; themeId?: string; targets?: number }> {
  const hints = options.rendererUrlHint ? [options.rendererUrlHint] : getAppDefinition(appId)?.rendererHints ?? ['renderer/index.html', 'index.html'];
  let targets: any[] = [];

  for (const hint of hints) {
    try {
      targets = await fetchRendererTargets(port, hint, { timeoutMs: 1000, quiet: true });
      if (targets.length > 0) break;
    } catch {}
  }

  // Relaxed fallback: any page target
  if (targets.length === 0) {
    try {
      const resp = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(5000) });
      const json = await resp.json();
      targets = (Array.isArray(json) ? json : []).filter(isAnyPageTarget).sort((a: any, b: any) => {
        const la = [String(a.id ?? ''), a.url, a.webSocketDebuggerUrl];
        const lb = [String(b.id ?? ''), b.url, b.webSocketDebuggerUrl];
        for (let i = 0; i < la.length; i++) { if (la[i] < lb[i]) return -1; if (la[i] > lb[i]) return 1; }
        return 0;
      });
    } catch {}
  }

  if (targets.length === 0) {
    return { installed: false, menu: false, targets: 0 };
  }

  const states: Array<{ installed: boolean; menu: boolean; themeId?: string }> = [];
  for (const target of targets) {
    const session = new CdpSession(target.webSocketDebuggerUrl);
    try {
      await session.open();
      if (appId === 'workbuddy') {
        const isWorkBuddy = await session.evaluate(`(() => document.body?.dataset.applicationName === 'workbuddy')()`);
        if (!isWorkBuddy) continue;
      }
      const serializedState = await session.evaluate(`(() => {
        const style = document.getElementById('${STYLE_ID}');
        const menuHost = document.getElementById('${MENU_ID}-host');
        const menu = document.getElementById('${MENU_ID}') || menuHost?.shadowRoot?.getElementById('${MENU_ID}');
        return JSON.stringify({
          installed: Boolean(style),
          menu: Boolean(menu),
          themeId: document.documentElement.dataset.dreamTheme ?? undefined
        });
      })()`);
      const state = JSON.parse(serializedState);
      states.push(state);
    } catch (error) {
      console.warn(`[injector] Status check failed for ${appId} target ${target.id}:`, error);
    } finally {
      session.close();
    }
  }

  const active = states.find(state => state.installed && state.themeId) ?? states.find(state => state.installed);
  return {
    installed: states.some(state => state.installed),
    menu: states.some(state => state.menu),
    themeId: active?.themeId,
    targets: states.length,
  };
}

export async function removeSkin(
  appId: string,
  port: number,
  options: { rendererUrlHint?: string } = {}
): Promise<{ success: boolean }> {
  if (appId === 'hana-agent') {
    hanaAgentGenerations.set(port, (hanaAgentGenerations.get(port) ?? 0) + 1);
    const watcher = hanaAgentWatchers.get(port);
    if (watcher) clearInterval(watcher);
    hanaAgentWatchers.delete(port);
  }
  const rendererUrlHint = options.rendererUrlHint ?? getAppDefinition(appId)?.rendererHints[0] ?? 'renderer/index.html';
  let targets: any[] = [];

  try {
    targets = await fetchRendererTargets(port, rendererUrlHint);
  } catch {}

  // Relaxed fallback
  if (targets.length === 0) {
    try {
      const resp = await fetch(`http://127.0.0.1:${port}/json/list`, { signal: AbortSignal.timeout(5000) });
      const json = await resp.json();
      targets = (Array.isArray(json) ? json : []).filter(isAnyPageTarget).sort((a: any, b: any) => {
        const la = [String(a.id ?? ''), a.url, a.webSocketDebuggerUrl];
        const lb = [String(b.id ?? ''), b.url, b.webSocketDebuggerUrl];
        for (let i = 0; i < la.length; i++) { if (la[i] < lb[i]) return -1; if (la[i] > lb[i]) return 1; }
        return 0;
      });
    } catch {}
  }

  if (targets.length === 0) {
    return { success: false };
  }

  for (const target of appId === 'hana-agent' ? targets : targets.slice(0, 1)) {
    const session = new CdpSession(target.webSocketDebuggerUrl);
    await session.open();
    if (appId === 'hana-agent') {
      const identifier = hanaAgentPersistentScripts.get(target.id);
      if (identifier) {
        await session.removeScriptToEvaluateOnNewDocument(identifier).catch(() => {});
        hanaAgentPersistentScripts.delete(target.id);
      }
    }
    if (appId === 'zcode') {
      const barIdentifier = usageBarScripts.get(target.id);
      if (barIdentifier) {
        await session.removeScriptToEvaluateOnNewDocument(barIdentifier).catch(() => {});
        usageBarScripts.delete(target.id);
      }
    }
    await session.evaluate(`(() => {
      ${appId === 'hana-agent' ? `try { localStorage.setItem('dream-work-theme:hana-agent:restored', '1'); } catch {}
      document.documentElement.dataset.dreamThemeRestored = 'true';` : ''}
      document.getElementById('${STYLE_ID}')?.remove();
      document.getElementById('${MENU_ID}')?.remove();
      document.getElementById('${MENU_ID}-host')?.remove();
      document.getElementById('${MENU_ID}-pet-host')?.remove();
      clearInterval(window.__dreamWorkPetTimer);
      document.getElementById('dream-work-video-layer')?.remove();
      document.getElementById('dream-usage-bar')?.remove();
      document.getElementById('dream-usage-tip')?.remove();
      document.getElementById('dream-usage-exc')?.remove();
      document.querySelectorAll('[data-du-pad]').forEach((el) => {
        el.style.marginBottom = el.dataset.duPad || '';
        delete el.dataset.duPad;
      });
      clearInterval(window.__dreamWorkMenuGuard);
      delete window.__dreamWorkMenuGuard;
      delete window.__dreamWorkVideoSrc;
      delete window.__dreamWorkUsageBar;
      delete window.__dreamWorkUsageUpdate;
      delete window.__dreamWorkUsageWant;
      window.__dreamWorkUsageGen = (window.__dreamWorkUsageGen || 0) + 1;
      if (window.__dreamWorkOutsideClick) {
        document.removeEventListener('pointerdown', window.__dreamWorkOutsideClick, true);
        delete window.__dreamWorkOutsideClick;
      }
      delete document.documentElement.dataset.dreamTheme;
      delete document.documentElement.dataset.dreamShell;
      return true;
    })`);
    session.close();
  }

  if (appId === 'zcode') {
    usageBarScripts.clear();
    stopUsagePump(port);
  }

  return { success: true };
};

// ---- 文字对比度推导：工具函数见 ./contrast.ts ----
/* 鲜艳取色（0.7.14 用户裁定"保彩度、只动明度"）：
   文字色不再朝黑/白/表面色混（那样一混彩度就掉，观感发灰），而是**沿用主题色相的
   高饱和基色，只让 ensureContrastRgb 沿明度轴把它压到对比度下限**——同色相下能在
   达标线附近拿到的最鲜艳那一档。`sat` 是基色饱和度：正文 0.60、数值 0.92、次级 0.45。 */
const TEXT_SAT_BODY = 0.90;    // 正文饱和度（0.7.15 用户点名 0.60 → 0.90）
const TEXT_SAT_VIVID = 0.92;
const TEXT_SAT_SUBTLE = 0.45;
function vividBase(hue: number, sat: number, light: number): Rgb {
  return hslToRgb(((hue % 1) + 1) % 1, sat, Math.max(0.02, Math.min(0.98, light)));
}
/* 亮度提升（0.7.16 用户点名"提高亮度"）：推导结果再沿明度轴**朝远离背景的方向**推
   TEXT_BRIGHT_K（比背景亮的更亮、比背景暗的更暗）。注意方向必须按背景判，不能按"亮/暗"
   一刀切——次级档本来就在背景与正文之间，朝极端推会把它推向背景、对比度反降（实测翻车）。 */
const TEXT_BRIGHT_K = 0.20;   // 提亮幅度（0.35 会把近白端彩度冲光、观感退回"白字"，实测被否）
function pushAwayFromBg(rgb: Rgb, backgrounds: Rgb[], k = TEXT_BRIGHT_K): Rgb {
  if (!backgrounds.length) return rgb;
  const l = relativeLuminance(rgb);
  const bg = backgrounds.reduce((sum, b) => sum + relativeLuminance(b), 0) / backgrounds.length;
  const [h, s, hl] = rgbToHsl(rgb);
  const next = l >= bg ? hl + (1 - hl) * k : hl * (1 - k);
  return hslToRgb(h, s, Math.max(0.02, Math.min(0.99, next)));
}
/* 彩度下限（0.7.16）：明度越高彩度被压得越扁，近白端会看不出主题色相（用户："又变回去了"）。
   通道极差不足时先提饱和度、再小幅回落明度，直到色相可辨；若因此跌破对比度下限，
   宁可保留亮度（对比度优先于彩度）。 */
const TEXT_MIN_SPREAD = 30;   // 通道极差下限（0-255）：低于这个数就看不出主题色相
function ensureTint(rgb: Rgb, backgrounds: Rgb[], floor: number, target = TEXT_MIN_SPREAD): Rgb {
  const spread = (c: Rgb) => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
  const minC = (c: Rgb) => (backgrounds.length ? Math.min(...backgrounds.map((bg) => contrastRatio(c, bg))) : 99);
  if (spread(rgb) >= target) return rgb;
  const [h, s, l] = rgbToHsl(rgb);
  /* 彩度在中间明度最高：近白/近黑的文字要往 0.5 方向收才涨彩度（越亮只会更白） */
  const towardMid = l > 0.5 ? -1 : 1;
  let best = rgb;
  for (let i = 1; i <= 20; i++) {
    const cand = hslToRgb(h, Math.min(1, s + 0.06 * i), Math.max(0.06, Math.min(0.99, l + towardMid * 0.02 * i)));
    if (minC(cand) < floor) break;   // 涨彩度不能破对比度下限
    best = cand;
    if (spread(cand) >= target) break;
  }
  return best;
}
/* 视频主题的文字基色：色相取 accent、高饱和，明度取对比度最优极（暗底近白 / 亮底近黑），
   随后由 deriveTextColors 做 4.5:1/3:1 兜底。 */
const VIDEO_TEXT_SAT = 0.70;   // 视频主题染色浓度（鲜艳取向）
function themeTintedTextColor(accentHex: string, surfaceHex: string, heroAverage: Rgb | null, alphas: number[]): string {
  let surface: Rgb;
  let hue = 0.58;
  try {
    surface = hexToRgb(surfaceHex);
    hue = rgbToHsl(hexToRgb(accentHex))[0];
  } catch {
    surface = [12, 12, 18];
  }
  const hero = heroAverage ?? surface;
  const backgrounds = alphas.map((alpha) => mixRgb(hero, surface, alpha));
  const minContrast = (fg: Rgb) => Math.min(...backgrounds.map((bg) => contrastRatio(fg, bg)));
  const lightPole = vividBase(hue, VIDEO_TEXT_SAT, 0.92);   // 提亮但不过头：再亮就把彩度冲光
  const darkPole = vividBase(hue, VIDEO_TEXT_SAT, 0.12);
  return rgbToHex(minContrast(lightPole) >= minContrast(darkPole) ? lightPole : darkPole);
}

/* 主文字 4.5:1、次级 3:1（WCAG 大字号下限），背景取各半透明表面与壁纸平均色的合成色。
   基色一律"主题色相 + 高饱和 + 清单明度"（清单 text 只用来定位明度轴的方向），
   不达标时沿明度轴收，彩度保留 —— 鲜艳与可读性同时要。 */
function deriveTextColors(surfaceHex: string, textHex: string, heroAverage: Rgb | null, alphas: number[], accentHex?: string, secondaryHex?: string) {
  const surface = hexToRgb(surfaceHex);
  // hero 未采样到时退化为纯 surface（mixRgb(surface, surface, a) === surface）
  const backgrounds = alphas.map((alpha) => mixRgb(heroAverage ?? surface, surface, alpha));
  const parse = (hex?: string, fallback?: Rgb): Rgb => { try { return hex ? hexToRgb(hex) : (fallback ?? [255, 255, 255]); } catch { return fallback ?? [255, 255, 255]; } };
  const base = parse(textHex, [255, 255, 255]);
  const accent = parse(accentHex, base);
  const secondary = parse(secondaryHex, accent);
  const accentHue = rgbToHsl(accent)[0];
  const secondaryHue = rgbToHsl(secondary)[0];
  const baseLight = rgbToHsl(base)[2];
  const text = ensureContrastAgainstAll(vividBase(accentHue, TEXT_SAT_BODY, baseLight), backgrounds, 4.5);
  /* 分层双色相：数值/关键值用 accent 高彩度（textVivid），标签/次级用 secondary 色相
     （textAlt）；subtle 族保持主色相、彩度略低，避免整屏只有一种纯度。 */
  const tint = (from: Rgb, sat: number, l: number, floor: number, target: number, hueShift = 0) => {
    const [h0] = rgbToHsl(from);
    const h = ((h0 + hueShift) % 1 + 1) % 1;
    const lifted = pushAwayFromBg(ensureContrastAgainstAll(vividBase(h, sat, l), backgrounds, floor), backgrounds);
    return ensureTint(lifted, backgrounds, floor, target);
  };
  const textRgb = ensureTint(pushAwayFromBg(text, backgrounds), backgrounds, 4.5, 60);
  const textL = rgbToHsl(textRgb)[2];
  return {
    text: rgbToHex(textRgb),
    textVivid: rgbToHex(tint(accent, TEXT_SAT_VIVID, baseLight, 4.5, 80)),
    textAlt: rgbToHex(tint(secondary, Math.max(TEXT_SAT_SUBTLE + 0.25, 0.70), baseLight, 3, 45)),
    /* 相反色相档（0.7.16 用户点名）：思考行/工具输出标签用 accent 的对面色相 + 高饱和 */
    textOpposite: rgbToHex(tint(accent, 0.95, baseLight, 3, 90, 0.5)),
    textSubtle: rgbToHex(tint(accent, TEXT_SAT_SUBTLE, textL < 0.5 ? Math.min(0.98, textL + 0.30) : Math.max(0.02, textL - 0.26), 3, 34)),
    textSubtlest: rgbToHex(tint(accent, TEXT_SAT_SUBTLE * 0.8, textL < 0.5 ? Math.min(0.98, textL + 0.44) : Math.max(0.02, textL - 0.38), 3, 30)),
    textSecondary: rgbToHex(tint(accent, TEXT_SAT_SUBTLE * 0.9, textL < 0.5 ? Math.min(0.98, textL + 0.36) : Math.max(0.02, textL - 0.32), 3, 32)),
  };
}


// 壁纸色彩单一（调色板里没有与主色相差 >50° 的色相桶）时的 secondary 兜底：
// 旧兜底 = accent 提白，与主色同色相，多彩流光环六段交替感官只剩一色。
// 改取 accent 色相 −60° 的同源伴生色（粉→紫方向），饱和度下限 0.35、明度沿用，
// 保证环上读得出第二种色相。仅替换兜底分支；壁纸本身有异色相时不变。
export function companionHueFallback(rgb: Rgb): Rgb {
  const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  const rawH = d === 0 ? 0 : max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  const h = (((rawH * 60) % 360) + 360) % 360;
  const hc = (h - 60 + 360) % 360;
  const c = (1 - Math.abs(2 * l - 1)) * Math.max(s, 0.35);
  const x = c * (1 - Math.abs(((hc / 60) % 2) - 1));
  const m = l - c / 2;
  const seg = hc < 60 ? [c, x, 0] : hc < 120 ? [x, c, 0] : hc < 180 ? [0, c, x] : hc < 240 ? [0, x, c] : hc < 300 ? [x, 0, c] : [c, 0, x];
  return seg.map((v) => (v + m) * 255) as Rgb;
}

function hexHueChroma(hexColor: string): { h: number; chroma: number } | null {
  let rgb: Rgb;
  try {
    rgb = hexToRgb(hexColor);
  } catch {
    return null;
  }
  const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d > 0) {
    const raw = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = ((raw * 60) % 360 + 360) % 360;
  }
  return { h, chroma: d };
}

// ZCode 流光环 B 色的感知门限：清单 secondary 若与 accent 色相贴脸（<45°）
// 或自身彩度过低（RGB 极差 <0.10，近白/近灰，如 nezuko-demon-form 的
// #dedef3 淡薰衣草），六段交替感官上只剩一种色 —— 此时换用 accent−60°
// 的同源伴生色（companionHueFallback）。壁纸取色与自定义图片主题路径
// 各有旋转兜底，这里只管预设清单色。
function zcodeRingCompanion(accentHex: string, secondaryHex: string): string {
  const a = hexHueChroma(accentHex);
  const s = hexHueChroma(secondaryHex);
  if (!a || !s) return secondaryHex;
  const dist = Math.abs(a.h - s.h) % 360;
  const hueGap = dist > 180 ? 360 - dist : dist;
  if (hueGap >= 45 && s.chroma >= 0.1) return secondaryHex;
  return rgbToHex(companionHueFallback(hexToRgb(accentHex)));
}

export function buildAppCss(
  appId: string,
  manifest: any,
  heroDataUrl: string,
  heroAverage: Rgb | null = null,
  options: { template?: boolean; video?: boolean } = {}
): string {
  const surface = manifest.colors?.surface ?? '#f7fbff';
  const text = manifest.colors?.text ?? '#17344f';
  // 模板模式下占位哨兵色必须原样透传：一旦在这里跑对比度提升，
  // 哨兵字符串（如 #0a0b0c）会被改写，页面端 split/join 替换将永远不命中。
  const accentColor = manifest.colors?.accent ?? '#24c9d7';
  const derived = options.template
    ? {
        text,
        textSubtle: WORKBUDDY_CSS_PLACEHOLDERS.textSubtle,
        textSubtlest: WORKBUDDY_CSS_PLACEHOLDERS.textSubtlest,
        textSecondary: WORKBUDDY_CSS_PLACEHOLDERS.textSecondary,
      }
    : deriveTextColors(
        surface,
        /* 视频主题：高饱和主题色相文字（明度取对比度最优极） */
        options.video ? themeTintedTextColor(accentColor, surface, heroAverage, surfaceAlphasFor(appId)) : text,
        heroAverage,
        surfaceAlphasFor(appId),
        accentColor,
        /* 次级/标签色相先过伴生门限，让 textAlt 与流光环同源 */
        appId === 'zcode' && !options.template
          ? zcodeRingCompanion(accentColor, manifest.colors?.secondary ?? '#ef8fd3')
          : manifest.colors?.secondary ?? '#ef8fd3'
      );
  const colors = {
    accent: accentColor,
    secondary: manifest.colors?.secondary ?? '#ef8fd3',
    surface,
    ...derived,
  };
  if (appId === 'zcode' && !options.template) {
    colors.secondary = zcodeRingCompanion(colors.accent, colors.secondary);
  }

  if (appId === 'codex') {
    return buildCodexCss(manifest, heroDataUrl, colors);
  }

  const definition = getAppDefinition(appId);
  if (definition?.kind === 'vscode-work') {
    return buildVsCodeWorkCss(manifest, heroDataUrl, colors);
  }
  if (definition?.kind === 'generic-work') {
    if (appId === 'hana-agent') {
      return buildHanaAgentCss(manifest, heroDataUrl, colors);
    }
    return buildGenericWorkCss(appId, manifest, heroDataUrl, colors, Boolean(options.video));
  }

  // Default: WorkBuddy
  return buildWorkBuddyCss({ ...manifest, copy: null }, heroDataUrl, colors);
}

function buildVsCodeWorkCss(manifest: any, heroDataUrl: string, colors: any): string {
  return `/* DREAM_THEME:${manifest.id} */
:root {
  --vscode-editor-background: transparent !important;
  --vscode-foreground: ${colors.text} !important;
  --vscode-sideBar-background: color-mix(in srgb, ${colors.surface} 82%, transparent) !important;
  --vscode-panel-background: transparent !important;
  --vscode-input-background: color-mix(in srgb, ${colors.surface} 84%, transparent) !important;
  --vscode-button-background: ${colors.accent} !important;
  --vscode-button-foreground: #ffffff !important;
  --vscode-focusBorder: ${colors.accent} !important;
}
body.solo-lite {
  background-color: ${colors.surface} !important;
  color: ${colors.text} !important;
}
body.solo-lite #root {
  background-color: ${colors.surface} !important;
  background-image: url(${JSON.stringify(heroDataUrl)}) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important;
  color: ${colors.text} !important;
}
body.solo-lite #solo-lite-root {
  background-color: transparent !important;
  background-image: none !important;
}
.panel-content,
.initial-chat-panel,
.solo-lite-chat-panel-container {
  background-color: transparent !important;
  background-image: none !important;
  color: ${colors.text} !important;
}
.panel-content > *,
.initial-chat-panel > *,
.initial-chat-panel-content,
.solo-lite-chat-panel-container > *,
.solo-lite-chat-panel-main,
.solo-lite-chat-panel,
.solo-lite-chat-panel-content > *,
.solo-lite-chat-container,
.session-panel-cache-layout,
.virtualized-message-list-view__content,
.virtualized-message-list-view,
[class*="virtualized-message-list-view__scroller"],
[class*="virtualized-message-list-view__virtuoso"] {
  background-color: transparent !important;
  background-image: none !important;
}
.messageInputContainer {
  background-color: color-mix(in srgb, ${colors.surface} 66%, transparent) !important;
  color: ${colors.text} !important;
  backdrop-filter: blur(12px) saturate(105%);
}
.messageInputContainer {
  border-color: color-mix(in srgb, ${colors.accent} 34%, transparent) !important;
  box-shadow: 0 16px 44px color-mix(in srgb, ${colors.surface} 34%, transparent) !important;
}
.messageInputContainer :where(
  .chat-input-v2-editor-part,
  .chat-input-v2-slot-header,
  .chat-input-v2-editor-part-lower-content,
  .chat-input-v2-editor-part-lower__left,
  .chat-input-v2-editor-part-lower__right,
  .chat-input-v2-slot-toolbar-right,
  .chat-input-v2-slot-overlay,
  .messageInputToolbarIconBtn,
  .messageInputPluginToolbar,
  .messageInputPluginToolbarIconWrapper,
  .messageInputPluginToolbarMore,
  .chat-input-v2-send-button
) {
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
html body.solo-lite #root .initial-chat-panel .messageInputContainer button.messageInputToolbarIconBtn,
html body.solo-lite #root .initial-chat-panel .messageInputContainer button.messageInputPluginToolbar,
html body.solo-lite #root .initial-chat-panel .messageInputContainer .messageInputPluginToolbarIconWrapper,
html body.solo-lite #root .initial-chat-panel .messageInputContainer .messageInputPluginToolbarMore,
html body.solo-lite #root .initial-chat-panel .messageInputContainer .chat-input-v2-editor-part-lower__right,
html body.solo-lite #root .initial-chat-panel .messageInputContainer .chat-input-v2-slot-toolbar-right,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer button.messageInputToolbarIconBtn,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer button.messageInputPluginToolbar,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer .messageInputPluginToolbarIconWrapper,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer .messageInputPluginToolbarMore,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer .chat-input-v2-editor-part-lower__right,
html body.solo-lite #root .solo-lite-chat-panel-content .messageInputContainer .chat-input-v2-slot-toolbar-right {
  background: transparent !important;
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
html body.solo-lite #root :where(.initial-chat-panel, .solo-lite-chat-panel-content) .messageInputContainer
  :where(button, button span, .messageInputPluginToolbarMore, .core-model-select-trigger, .rtcVoicePluginButton, .voiceCallButton, .inputBarButton-ncFFma) {
  color: ${colors.text} !important;
  -webkit-text-fill-color: ${colors.text} !important;
}
html body.solo-lite #root :where(.initial-chat-panel, .solo-lite-chat-panel-content) .messageInputContainer
  :where(button, [role="button"]) svg {
  color: ${colors.text} !important;
  fill: currentColor !important;
  stroke: currentColor !important;
}
.messageInputContainer .chat-input-v2-slot-overlay {
  pointer-events: none !important;
}
.messageInputContainer :where(
  button,
  .messageInputToolbarIconBtn,
  .messageInputPluginToolbar,
  .core-model-select-trigger,
  .rtcVoicePluginButton,
  .voiceCallButton,
  .inputBarButton-ncFFma
) {
  color: ${colors.text} !important;
  -webkit-text-fill-color: ${colors.text} !important;
}
.messageInputContainer :where(button, [role="button"]) svg {
  color: ${colors.text} !important;
  fill: currentColor !important;
  stroke: currentColor !important;
}
.messageInputContainer :where(button, [role="button"]):hover {
  background-color: color-mix(in srgb, ${colors.accent} 16%, transparent) !important;
}
.messageInputContainer .chat-input-v2-send-button:not(.disabled) {
  background-color: ${colors.accent} !important;
  color: #ffffff !important;
  -webkit-text-fill-color: #ffffff !important;
}
.messageInputContainer .chat-input-v2-send-button.disabled {
  opacity: .5 !important;
}
.messageInputContainer .projectButtonPlaceholderWork-JV100D,
.messageInputContainer [class*="Placeholder"] {
  color: color-mix(in srgb, ${colors.text} 66%, transparent) !important;
  -webkit-text-fill-color: color-mix(in srgb, ${colors.text} 66%, transparent) !important;
}
html[data-dream-shell="dark"] body.solo-lite #root .messageInputContainer
  :where(.inputBarButton-ncFFma, .inputBarButton-ncFFma *, .core-model-select-trigger, .core-model-select-trigger *) {
  color: ${colors.text} !important;
  -webkit-text-fill-color: ${colors.text} !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-base-content, .soloLiteMenubar, .task-list-base-footer)
  :where(
    .tab-pLFRtu,
    .tab-pLFRtu *,
    .task-list-new-task-item,
    .task-list-new-task-item *,
    .taskItem,
    .taskItem *,
    .task-list-heading,
    .task-list-heading *,
    .task-list-group-title,
    .task-list-group-title *,
    .accountTrigger-rIX2_l,
    .accountTrigger-rIX2_l *,
    .solo-mobile-expanded-btn,
    .solo-mobile-expanded-btn *,
    .menubar-menu-title,
    .menubar-menu-title *
  ) {
  color: ${colors.text} !important;
  -webkit-text-fill-color: ${colors.text} !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-heading, .task-list-group-title, .menubar-menu-title) {
  opacity: .78 !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-base-content, .soloLiteMenubar, .task-list-base-footer, .messageInputContainer) svg {
  color: ${colors.text} !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-base-content, .soloLiteMenubar, .task-list-base-footer, .messageInputContainer)
  :where(svg[fill]:not([fill="none"]), svg [fill]:not([fill="none"])) {
  fill: currentColor !important;
}
html[data-dream-shell="dark"] body.solo-lite #root
  :where(.task-list-base-content, .soloLiteMenubar, .task-list-base-footer, .messageInputContainer)
  :where(svg[stroke]:not([stroke="none"]), svg [stroke]:not([stroke="none"])) {
  stroke: currentColor !important;
}
`;
}

function buildGenericWorkCss(appId: string, manifest: any, heroDataUrl: string, colors: any, video = false): string {
  const mainSelectors: Record<string, string> = {
    'qoder-work': '#root > div, [class*="layout"], [class*="content-area"], [class*="main-content"]',
    catpaw: '.main-area, .main-content-container, .main-content, .chat-content-area',
    zcode: 'main, main > div, [class*="min-h-0"][class*="flex-1"]',
    'qwen-office': '.agents-content-area, .agents-parchment-paper-surface',
  };
  const sidebarSelectors: Record<string, string> = {
    'qoder-work': '[class*="sidebar"]',
    catpaw: '.sidebar-wrapper, .sidebar',
    zcode: '#sidebar, aside',
    'qwen-office': '.agents-sidebar, .group\\/sidebar',
  };
  const main = mainSelectors[appId] ?? 'main, [role="main"], [class*="main-content"]';
  const sidebar = sidebarSelectors[appId] ?? 'aside, nav, [class*="sidebar"]';
  const appSpecificCss = appId === 'qoder-work'
    ? buildQoderWorkShellCss(colors)
    : appId === 'catpaw'
      ? buildCatPawCss(heroDataUrl, colors)
      : appId === 'zcode'
        ? buildZCodeConversationCss(colors, video)
      : '';
  const contentSurfaceSelectors = appId === 'zcode'
    ? '[class*="composer"], [class*="input-container"]'
    : '[class*="message"], [class*="bubble"], [class*="composer"], [class*="input-container"]';
  // ZCode conversation rows carry their own translucent surfaces
  // (buildZCodeConversationCss), so its wallpaper needs no gradient mask.
  // 视频主题：壁纸画布让位给 fixed 视频层（mainBackground 透明，hero 转由
  // 视频层自身底图承担，加载/失败时即静态回退）。
  /* 背景亮暗（快捷面板的"背景亮暗"）只作用于壁纸层：静态主题在壁纸同一声明里叠一层
     蒙版渐变 --dream-dim-veil（黑=压暗 / 白=提亮），改变量即时生效且不动文字与玻璃。 */
  const dimVeil = `linear-gradient(var(--dream-dim-veil, transparent), var(--dream-dim-veil, transparent))`;
  const mainBackground = video
    ? 'transparent !important'
    : appId === 'zcode'
    ? `${dimVeil}, url(${JSON.stringify(heroDataUrl)}) center / cover no-repeat fixed !important`
    : `linear-gradient(90deg, color-mix(in srgb, ${colors.surface} 72%, transparent) 0 12%, transparent 42%), ${dimVeil}, url(${JSON.stringify(heroDataUrl)}) center / cover no-repeat fixed !important`;
  return `/* DREAM_THEME:${manifest.id} */
:root {
  --dream-work-accent: ${colors.accent};
  --dream-work-secondary: ${colors.secondary};
  --dream-work-surface: ${colors.surface};
  --dream-work-text: ${colors.text};
  /* 分层鲜艳取色（0.7.14）：数值/关键值用 accent 高彩度档、标签/次级用 secondary 色相档，
     正文保持主题色相 + 0.60 饱和（都经 4.5:1 / 3:1 兜底，见 deriveTextColors） */
  --dream-work-text-vivid: ${colors.textVivid ?? colors.text};
  --dream-work-text-alt: ${colors.textAlt ?? colors.textSecondary ?? colors.text};
  /* 相反色相档：思考行与工具输出标签（accent +180°、高饱和） */
  --dream-work-text-opposite: ${colors.textOpposite ?? colors.textVivid ?? colors.text};
  /* 正文技术记号的"纯黑/纯白"档：亮主题纯黑、暗主题纯白（按正文极性的明度判定） */
  --dream-work-ink: ${(() => { try { const c = hexToRgb(colors.text); const lum = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; return lum < 96 ? '#000000' : '#ffffff'; } catch { return '#ffffff'; } })()};
  /* ZCode 原生前景色变量：跟随动态提升后的文字色，毛玻璃背景上保持可读 */
  --color-foreground: ${colors.text} !important;
  --color-foreground-subtle: ${colors.textSubtle} !important;
  --color-foreground-subtlest: ${colors.textSubtlest} !important;
  --catpaw-bg-primary: ${colors.surface} !important;
  --catpaw-text-primary: ${colors.text} !important;
  --catpaw-text-secondary: ${colors.textSecondary} !important;
  --agents-sidebar-material-bg: color-mix(in srgb, ${colors.surface} 80%, transparent) !important;
  --text-base-primary: ${colors.text} !important;
  --text-base-secondary: ${colors.textSecondary} !important;
  --bg-base: color-mix(in srgb, ${colors.surface} 76%, transparent) !important;
  /* ZCode 选中/悬停变量：组件自身的 data-active:!bg-selected 类带 !important
     引用 --color-selected，接管变量让这类选中背景也跟随主题 accent */
  --color-selected: color-mix(in srgb, ${colors.accent} 16%, ${colors.surface}) !important;
  --color-hover: color-mix(in srgb, ${colors.accent} 10%, ${colors.surface}) !important;
}
html, body, #root { background: ${video ? 'transparent' : colors.surface} !important; color: ${colors.text} !important; }
:is(${sidebar}) {
  background: color-mix(in srgb, ${colors.surface} 82%, transparent) !important;
  color: ${colors.text} !important;
  /* 不给侧栏挂 backdrop-filter：它会给 position:fixed 后代创建包含块，账号菜单一类
     "选中右侧弹出"的子菜单若未 portal 出去就会被困在侧栏的 overflow:hidden 里（被遮挡）。
     毛玻璃观感靠 92% 的实底保住，视觉差别极小。 */
}
:is(${main}) {
  background: ${mainBackground};
  color: ${colors.text} !important;
}
:is(${main}) :where([class*="message"], [class*="chat"], [class*="composer"], [class*="editor"], [contenteditable="true"], textarea) {
  color: ${colors.text} !important;
}
:is(${main}) :where(${contentSurfaceSelectors}) {
  background-color: color-mix(in srgb, ${colors.surface} 78%, transparent) !important;
  backdrop-filter: blur(16px) saturate(108%);
}
:is(${main}) :where(p, span, li, h1, h2, h3, h4, strong, em, code, pre, kbd, samp, time, small, b, i, u, del, ins, mark) { color: ${colors.text} !important; }
button[class*="bg-primary"], button[class*="bg-accent"] { background-color: ${colors.accent} !important; color: #fff !important; }
${appSpecificCss}${video ? `
/* ZCode 动态视频背景：fixed 层 z-index:-1 落于普通流内容之下（内容无需抬升，
   不破坏原生 sticky），层自身带 hero 底图作加载中/失败回退；玻璃 backdrop-filter 直接采样视频 */
#dream-work-video-layer {
  position: fixed !important;
  inset: 0 !important;
  z-index: -1 !important;
  pointer-events: none !important;
  overflow: hidden !important;
  background: url(${JSON.stringify(heroDataUrl)}) center / cover no-repeat !important;
}
#dream-work-video-layer {
  filter: brightness(var(--dream-dim-k, 1)) !important;
}
#dream-work-video-layer video {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block !important;
}
/* 应用壳层根容器（bg-background-win-alt，实测 rgb(236,236,238)）不透明底会整个压住
   z-index:-1 的视频层——视频主题必须一并放行，人物/画面才可见 */
.bg-background-win-alt, [class*="bg-background-win"] { background: transparent !important; }
/* 独立整页（设置/插件市场/自动化）的内容壳 div.bg-background.rounded-*.border-border
   同样不透明（rgb 248,248,248），视频主题一并放行；页内统计卡/侧栏自身已是玻璃。
   3.12.1 起圆角类从 rounded-xl 改为 rounded-[5px]/rounded——选择器放宽为"带边框色的
   bg-background"，不再绑定具体圆角类 */
.bg-background.border-border, .bg-background.rounded-xl.border-border { background: transparent !important; }
#dream-work-video-layer[data-motion-error="true"] video { display: none !important; }` : ''}`;
}

function buildZCodeConversationCss(colors: any, video = false): string {
  const PNL = 66;   // 增透：76 -> 66（用户点名"增加毛玻璃透明度"）
  const USR = 60;   // 增透：70 -> 60
  return `
/* ZCode conversations: the wallpaper stays on the timeline, while each
   semantic row receives its own readable surface instead of one large wash. */
:is(main) :where(
  [class*="chat"],
  [class*="conversation"],
  [class*="message"],
  [class*="thread"],
  [class*="virtual"]
):has([data-row-id]) {
  background-color: transparent !important;
  background-image: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

:is(main) :where(
  [class~="group/user-row"] > div:first-child,
  [class~="group/user-row"] > div[class*="rounded-xl"],
  [class~="group/assistant-row"] > [data-conversation-selectable]
) {
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${colors.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  /* 会话卡片不做背景模糊（用户点名"不要玻璃模糊效果"）：去掉 backdrop-filter，
     卡片只剩半透明底色，观感不再受模糊重采样影响。 */
}

:is(main) [class~="group/user-row"] > div:is(:first-child, [class*="rounded-xl"]) {
  border-color: color-mix(in srgb, ${colors.accent} 44%, transparent) !important;
  background: color-mix(in srgb, ${colors.surface} ${USR}%, transparent) !important;
}

:is(main) [class~="group/assistant-row"] > [data-conversation-selectable] {
  padding: 14px 16px !important;
}

/* 折叠的思考行不加内边距：原版标签行与会话内其它行左缘对齐（皮肤曾给整行加
   padding: 12px 16px，导致"思考 · 持续了 N 秒"比工具行缩进、行距也与原版不同）。
   内边距只在展开态（下面是玻璃卡片规则里）补回。 */
:is(main) [data-row-id]:has([data-reasoning-content]) [data-reasoning-content] {
  background: transparent !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
}

/* 思考行（Radix collapsible）：折叠态的"思考 · 持续了…"标签裸露，不加玻璃包裹；
   仅 data-state="open"（思考内容已展开）时整行恢复与会话行同款玻璃卡片。
   默认规则覆盖 main 与辅助对话面板两种作用域；缺 data-state 时宁可保持裸露也不误包。 */
:is(main, div.border-l.border-border) [data-row-id]:has([data-reasoning-content]) {
  background: transparent !important;
  background-image: none !important;
  border: none !important;
  box-shadow: none !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

:is(main, div.border-l.border-border) [data-row-id]:has([data-reasoning-content][data-state="open"]) {
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${colors.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  color: ${colors.text} !important;
  text-shadow: none !important;
  padding: 12px 16px !important;   /* 展开态卡片才需要内边距 */
}

/* 裸行（思考行 group/reasoning、工具摘要行 group/tool-summary）自身及祖先都没有表面，
   易被 app 的次级色/硬编码半透明色压得读不清 —— 一律用主题自身文字色（整屏统一，
   不做逐行判定：逐行挑色会出现相邻行一深一浅、随时间来回翻的"反转"观感）。 */
:is(main, div.border-l.border-border) [class~="group/reasoning"],
:is(main, div.border-l.border-border) [class~="group/reasoning"] :where(*),
:is(main, div.border-l.border-border) [class~="group/tool-summary"],
:is(main, div.border-l.border-border) [class~="group/tool-summary"] :where(*) {
  color: var(--dream-work-text) !important;
}
/* 分层双色相：抢眼信息从正文里挑出来 —— 工具类别标签（终端/写入/读取/编辑…）与
   思考行标签（思考 · 持续了 N 秒）走 secondary 色相档，正文/命令行保持 accent 主档。
   思考行只作用于触发按钮（标签行），展开的思考正文不在其中。 */
/* 最终口径（用户裁定"算了，全部走主题色"）：会话区所有文字——标签、图标、命令行、
   文件路径、元信息、正文与其中的代码/技术记号——统一用主题文字色；不再有纯黑纯白档
   与相反色相档（两个变量保留以备后用，但没有任何规则消费它们）。 */
:is(main, div.border-l.border-border) [class~="tool-summary-kind-label"],
:is(main, div.border-l.border-border) button[data-testid="chat-reasoning-trigger"],
:is(main, div.border-l.border-border) button[data-testid="chat-reasoning-trigger"] :where(*),
:is(main, div.border-l.border-border) [class~="group/tool-summary"] :where(svg) {
  color: var(--dream-work-text) !important;
}
/* 标题走数值档（accent 高彩度） */
:is(main, div.border-l.border-border) :where(h1, h2, h3, h4, [class*="title"]) {
  color: var(--dream-work-text-vivid) !important;
}
/* 侧栏选中会话项走数值档（accent 高彩度），与选中底色同源更醒目 */
#sidebar li[class*="bg-selected"],
#sidebar li[class*="bg-selected"] :where(*) {
  color: var(--dream-work-text-vivid) !important;
}
/* 保留原版的"执行/思考"标签动画（app 的 gradient-flow：-webkit-text-fill-color 透明 +
   background-clip:text 的渐变扫光，4s 循环）——用户点名要恢复（此前为治"白块"把它关掉了，
   现在标签已是实色主题字，动画在实色基础上扫过即可，不再压掉文字）。 */

/* ---- 毛玻璃材质统一：左侧边栏 / 状态面板（Git 变更）/ 切换面板右侧栏 ----
   与会话输入、模型输出行使用同一种玻璃材质（surface 76% + blur 14px），
   并清除宽泛的 [class*="min-h-0"][class*="flex-1"] 壁纸选择器落在
   这些面板内部容器上的直出壁纸。 */
#sidebar[class],
#sidebar aside aside {
  background: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
#sidebar aside {
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  /* 同上：侧栏内的 aside 不挂 backdrop-filter（避免包含块/裁剪困住侧栏内的浮层） */
}
/* 侧栏内"选中右侧弹出"的子菜单兜底：只对 Radix 的浮层 portal 生效。
   注意别写成 [data-slot*="menu"] —— 侧栏任务项本身就是 context-menu-trigger，
   被抬到超高 z-index 后反而会盖住弹出的子菜单（实测踩坑）。 */
[data-radix-popper-content-wrapper] {
  z-index: 2147483000 !important;
}
/* 侧边栏整列包裹主题自适应边框：accent 30% 混透明，与会话行/输入区同配方。
   边框落在 #sidebar 外层列上，连同底部账号区一起被包住；贴窗缘的三边
   与窗口框重合，视觉上主要呈现为侧栏与主区之间的 accent 分隔线。 */
#sidebar[class] {
  border: 2px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
}
/* 项目 / 任务分区标签行辉光层染（Atmospheric Glow）：仅标签行（h-7 表头），
   展开列表区域不加。行背景不画渐变（28px 行高会把渐变硬裁出可见边界），
   改由 ::after 向上下各外扩 14px 绘椭圆径向渐变，透明色标恰好落在扩展边缘
   （垂直半径 60px、transparent 46% ≈ 27.6px），全向平滑归零无任何可见边界。
   左缘 2px accent 竖线（::before）自上而下渐隐作锚点。 */
#sidebar section[class~="group/purpose-section"] > div > div[class~="h-7"] {
  position: relative !important;
  background: transparent !important;
}
#sidebar section[class~="group/purpose-section"] > div > div[class~="h-7"]::after {
  content: "" !important;
  position: absolute !important;
  left: 0 !important;
  right: -36px !important;
  top: -14px !important;
  bottom: -14px !important;
  background: radial-gradient(420px 60px at 0% 50%, color-mix(in srgb, ${colors.accent} 15%, transparent) 0%, color-mix(in srgb, ${colors.accent} 6%, transparent) 22%, transparent 46%) !important;
  pointer-events: none !important;
}
#sidebar section[class~="group/purpose-section"] > div > div[class~="h-7"]::before {
  content: "" !important;
  position: absolute !important;
  left: 0 !important;
  top: 0 !important;
  bottom: 0 !important;
  width: 2px !important;
  background: linear-gradient(to bottom, ${colors.accent}, transparent) !important;
  border-radius: 1px !important;
  pointer-events: none !important;
}
#sidebar [class*="min-h-0"][class*="flex-1"] {
  background: transparent !important;
  background-image: none !important;
}

#root aside[class*="bg-[var(--color-popover)]"] {
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  border-color: color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
}
#root aside[class*="bg-[var(--color-popover)]"] [class*="min-h-0"][class*="flex-1"] {
  background: transparent !important;
  background-image: none !important;
}

.side-pane-open-tab-shell {
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
}
.side-pane-open-tab-shell [class*="min-h-0"][class*="flex-1"] {
  background: transparent !important;
  background-image: none !important;
}

/* 设置页面（aside.min-w-0 nav 出现时）里所有组件的背景统一毛玻璃材质，
   与对话行一致：surface 76% + blur 14px + accent 30% 边框；
   文字色统一为主题文字色，保证玻璃背景上的可读性。 */
html:has(aside.min-w-0 nav) main :is(button, input, select):where(
  [class*="bg-"], [class*="border"], [class*="ring-"], [class*="group/switch"]
),
html:has(aside.min-w-0 nav) main span:where(
  [class*="bg-surface"], [class*="bg-secondary"], [class*="bg-selected"]
) {
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${colors.text} !important;
  text-shadow: none !important;
}
html:has(aside.min-w-0 nav) main :is(button, input, select):where(
  [class*="bg-"], [class*="border"], [class*="ring-"], [class*="group/switch"]
):hover {
  border-color: color-mix(in srgb, ${colors.accent} 46%, transparent) !important;
}

/* 设置页列表行按钮（插件/技能/MCP 等列表整行）：容器已带毛玻璃，
   行本身保持透明，避免 76% 表面色双层叠加发黑。 */
html:has(aside.min-w-0 nav) main button.flex-1.text-left {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* 设置页内容区里的分块背景区域（卡片/区块/分段容器）同款毛玻璃材质。
   使用统计等子页的统计卡/趋势图/模型用量是 section.bg-surface，与 div 一并接住。 */
html:has(aside.min-w-0 nav) main :where(
  div[class*="group/card"],
  div[class*="bg-card"],
  div[class*="bg-surface"],
  section[class*="bg-surface"],
  div[role="tablist"]
) {
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${colors.text} !important;
}

/* 输入会话框：chat-composer-input-surface 已有毛玻璃（surface 88% + blur 16px），
   把内层 bg-input 纯白底改为透明，露出底层毛玻璃材质。 */
.chat-composer-input-surface div[class*="bg-input"],
.chat-composer-region div[class*="bg-input"] {
  background: transparent !important;
  background-color: transparent !important;
  border-color: color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  box-shadow: none !important;
}

/* 输入框外层的毛玻璃区域：圆角 0px 时直角浅色玻璃会在编辑器胶囊
   （rounded-2xl）四周形成"白色长方形框"，圆角化后与胶囊边缘贴合 */
.chat-composer-region,
.chat-composer-input-surface {
  border-radius: 16px !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
}
/* 输入框玻璃与会话卡片同档（用户点名"输入框也加上这个透明度"）：surface 66% 半透明、
   不做背景模糊（卡片那边的模糊已按用户要求去掉，这里保持一致）。
   选择器带 :is(main) 前缀是为了压过 contentSurfaceSelectors 那条 78% 的规则（同权重时后者靠前）。 */
:is(main) .chat-composer-region,
:is(main) .chat-composer-input-surface,
:is(main, div.border-l.border-border) .chat-composer-region,
:is(main, div.border-l.border-border) .chat-composer-input-surface {
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  background-color: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* 辅助对话面板打开时与主对话之间的分割线：原生 border-l 是无主题色的灰线，
   换成 accent 30% 主题自适应边框，与 #sidebar 边框同配方同宽度（2px）。 */
div.border-l.border-border {
  border-left: 2px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
}

/* 主对话顶部工具条（workspace-header）：原生只有灰色 border-b，
   换成主题自适应包裹边框（2px accent 30%，与侧栏/分割线同配方）。
   左边不留框 —— 与侧栏的边界由侧栏边框充当，避免平行双线。 */
header[class*="workspace-header"] {
  border: solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  border-width: 2px 2px 2px 0 !important;
}

/* 辅助面板顶部标签条：主题自适应包裹。
   作用域挂在辅助面板（div.border-l.border-border）之下，避免波及设置页的 tabs-list。
   上边不留框（工具条下边框充当分隔）、左边不留框（面板分割线充当），
   重合处归一成一条线。 */
div.border-l.border-border div[data-slot="tabs-list"] {
  border: solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  border-width: 0 2px 2px 0 !important;
}

/* 标签条内的按钮（折叠箭头 / 加号）：与会话行同款毛玻璃。
   玻璃底与边框放 ::before 伪元素 —— 这些按钮自带分层的透明底 !important
   （Tailwind v4 分层 important 压过未分层注入），伪元素绕开该优先级；
   本体只接管文字色。圆角统一 10px —— 0 圆角玻璃会被看成白色矩形框。
   标签胶囊（tooltip-trigger / tabs-trigger）不上毛玻璃（用户定稿），
   只压掉原生不透明白底，保持透明、文字走全局主题变量。 */
div.border-l.border-border div[data-slot="tabs-list"] :is(button, [role="tab"]) {
  position: relative !important;
  isolation: isolate !important;
  color: ${colors.text} !important;
  text-shadow: none !important;
}

div.border-l.border-border div[data-slot="tabs-list"] :is(button, [role="tab"])::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: -1 !important;
  border-radius: 10px !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  -webkit-backdrop-filter: blur(14px) saturate(108%) !important;
  pointer-events: none !important;
}

/* 标签胶囊（tooltip-trigger / tabs-trigger）保持原生 —— 皮肤不碰它的底色与边框。
   玻璃只给条内的独立按钮（折叠箭头 / 加号）；胶囊内的 × 关闭按钮
   通过 content:none 豁免，避免在原生胶囊上再叠玻璃方块。 */
div.border-l.border-border div[data-slot="tabs-list"] [data-slot="tooltip-trigger"] button::before,
div.border-l.border-border div[data-slot="tabs-list"] [data-slot="tabs-trigger"] button::before {
  content: none !important;
}

/* 辅助对话（侧边面板，不在 main 内）的消息行：同款毛玻璃材质。
   思考行不在此列 —— 折叠裸露/展开玻璃由上方统一规则覆盖两种作用域。 */
div.border-l.border-border :where(
  [class~="group/user-row"] > div:first-child,
  [class~="group/user-row"] > div[class*="rounded-xl"],
  [class~="group/assistant-row"] > [data-conversation-selectable]
) {
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${colors.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${colors.text} !important;
  text-shadow: none !important;
}
div.border-l.border-border [class~="group/user-row"] > div:is(:first-child, [class*="rounded-xl"]) {
  border-color: color-mix(in srgb, ${colors.accent} 44%, transparent) !important;
  background: color-mix(in srgb, ${colors.surface} ${USR}%, transparent) !important;
}

/* 子代理输出（主对话与辅助对话面板中）同款毛玻璃材质。 */
:is(main, div.border-l.border-border) :where(
  [class*="agent-row"] > [data-conversation-selectable],
  [class*="subagent"] > [data-conversation-selectable],
  [class*="subagent-row"] > div,
  [class*="agent-row"] > div
) {
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  border-radius: 16px !important;
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${colors.surface} 30%, transparent), inset 0 1px color-mix(in srgb, white 12%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${colors.text} !important;
  text-shadow: none !important;
}

/* 已执行命令的输出卡片（工具/终端展开后的内容卡）同款半透明底；
   按用户点名不做背景模糊 —— 与会话卡片/输入框保持一致（surface 66%、无 blur）。 */
:is(main, div.border-l.border-border) div[class*="bg-panel"][class*="rounded-xl"] {
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  color: ${colors.text} !important;
}

/* ---- 选中/悬停态：与主题一致的底色（accent 混 surface），强化视觉反馈。
   通用毛玻璃规则会抹平原生选中样式，这里补回更明显的激活态。 ---- */
/* 标签页与按钮的激活态（Radix data-state=active / aria-selected） */
:is(main, #sidebar, aside, [role="dialog"], [role="menu"]) :is(button, [role="tab"], [role="button"], a):where(
  [data-state="active"], [aria-selected="true"], [data-active], [data-active="true"]
) {
  background: color-mix(in srgb, ${colors.accent} 16%, ${colors.surface}) !important;
  color: ${colors.text} !important;
  box-shadow: inset 0 0 0 1px color-mix(in srgb, ${colors.accent} 38%, transparent) !important;
}

/* 悬停态：轻微 accent 底色，仅作用于交互元素 */
:is(main, #sidebar, aside, [role="dialog"], [role="menu"]) :is(button, [role="button"], a, li[class*="cursor-pointer"]):hover {
  background-color: color-mix(in srgb, ${colors.accent} 10%, transparent) !important;
}

/* 侧栏/列表选中项（bg-selected、激活任务项）：accent 混 surface 底 + 左缘强调线；
   不再添加 inset 1px 描边环 —— 会话导轨的选中项几乎占满导轨宽度，
   描边环会被看成"整个导轨被边框包起来" */
:is(#sidebar, main, aside) :where(
  li[class*="bg-selected"],
  [class*="group/task-item"][data-state="active"],
  [class*="group/task-item"][aria-current="true"]
) {
  background: color-mix(in srgb, ${colors.accent} 18%, ${colors.surface}) !important;
  box-shadow: inset 2px 0 0 ${colors.accent} !important;
}

/* 开关（Radix switch）选中时轨道染主题 accent */
:is([role="switch"][data-state="checked"], button[class*="switch"][data-state="checked"]) {
  background-color: ${colors.accent} !important;
  border-color: color-mix(in srgb, ${colors.accent} 70%, transparent) !important;
}

/* 设置页内的激活控件：覆盖设置页通用毛玻璃（属性选择器提高优先级） */
html:has(aside.min-w-0 nav) main :is(button, [role="tab"], a, input, select):where(
  [data-state="active"], [aria-selected="true"], [class*="bg-selected"]
) {
  background: color-mix(in srgb, ${colors.accent} 16%, ${colors.surface}) !important;
  border-color: color-mix(in srgb, ${colors.accent} 44%, transparent) !important;
  color: ${colors.text} !important;
}
html:has(aside.min-w-0 nav) main :is(button, [role="tab"], a):where(
  [data-state="active"], [aria-selected="true"]
):hover {
  background: color-mix(in srgb, ${colors.accent} 24%, ${colors.surface}) !important;
}

/* 设置页插件/技能/MCP 列表：外层卡片保留 accent 边框与毛玻璃，
   内部行按钮去掉各自重复的边框，避免盒中盒双重边框；行间 hover 用 accent 底区分 */
html:has(aside.min-w-0 nav) main [class*="max-w-4xl"] div[class*="rounded-xl"] :is(
  button[class*="flex-1"], button[class*="min-w-0"], button[class*="w-full"]
) {
  border-color: transparent !important;
  box-shadow: none !important;
}

/* 设置页计数标签（插件/MCP/技能）的轨道：玻璃底已生效但为直角，
   呈现白色矩形框；圆角化与胶囊标签协调 */
html:has(aside.min-w-0 nav) main [class*="max-w-4xl"] [class*="tabs-list"] {
  border-radius: 999px !important;
}

/* 会话列左缘的历史会话导航导轨（NAV.w-12 竖向细轨）：选中态规则会给
   指示按钮加 accent 内描边环与底色，看起来像"导轨被边框包起来"；
   用户要求导轨无边框也无底色 —— 完全还原为透明，仅保留原生形态 */
#root nav[class*="inset-y-0"][class*="left-0"] :is(button, [role="button"]) {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  outline: none !important;
}

/* ---- 悬停浮层与点击弹窗（tooltip / popover / 下拉菜单 / 对话框 / 命令面板）：
   这类组件 portal 挂载在 body 下，不随 main/#sidebar 作用域，这里统一为
   与会话行一致的毛玻璃材质（surface + blur 14px + accent 30% 边框）。 ---- */
:is(
  [data-radix-popper-content-wrapper] > *,
  [role="menu"],
  [role="listbox"],
  [role="dialog"],
  [role="alertdialog"],
  [class*="cmdk-root"],
  div[class*="Popover"],
  div[class*="DropdownMenu"],
  div[class*="DialogContent"],
  div[class*="HoverCard"],
  div[class*="bg-popover"],
  div[class*="bg-dropdown"]
):not([class*="Overlay"]):not([data-radix-dialog-overlay]):not([class*="backdrop"]) {
  background: color-mix(in srgb, ${colors.surface} 78%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${colors.surface} 30%, transparent) !important;
  /* 弹层不挂 backdrop-filter：它会给 position:fixed 的子菜单创建包含块，子菜单随即被弹层
     自身的 overflow:hidden 裁掉 —— 实机表现就是"选中后右侧悬浮面板不显示"（关皮肤即恢复，
     已用 computer-use 复现定位）。88% 半透明底 + 边框 + 阴影观感已足够接近毛玻璃。 */
  color: ${colors.text} !important;
  text-shadow: none !important;
}

/* ZCode 模型选择器的供应商菜单会把 Radix 子菜单 portal 挂在主菜单内部。
   backdrop-filter 会让主菜单成为 fixed 子菜单的包含块，随后子菜单又被主菜单的
   overflow 裁切。把模糊材质移到伪元素后，外观不变，子菜单可以继续相对视口定位。 */
body.zcode-startup-ready [role="menu"][data-slot="dropdown-menu-content"]:has([data-model-provider-key]) {
  position: relative !important;
  isolation: isolate;
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}
body.zcode-startup-ready [role="menu"][data-slot="dropdown-menu-content"]:has([data-model-provider-key])::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: -1;
  border-radius: inherit;
  background: color-mix(in srgb, ${colors.surface} 78%, transparent);
  backdrop-filter: blur(14px) saturate(108%);
  -webkit-backdrop-filter: blur(14px) saturate(108%);
  pointer-events: none;
}

/* 菜单底部的粘性页脚（如模型菜单的"管理模型"项，sticky bottom-0 z-10 bg-menu
   + after:bg-menu 补缝条）自带不透明原生底，会盖住菜单玻璃形成黑块。
   换成与弹层同款玻璃（surface 88% + blur14），滚动经过的菜单项在其后被磨砂遮住。 */
[role="menu"] .bg-menu {
  background: color-mix(in srgb, ${colors.surface} 78%, transparent) !important;
  /* 同上：菜单内部的底衬层也不能挂 backdrop-filter（否则裁掉子菜单） */
}
[role="menu"] .bg-menu::after {
  background: color-mix(in srgb, ${colors.surface} 78%, transparent) !important;
}

/* tooltip 更小更密：更高不透明度保证可读性 */
[role="tooltip"] {
  background: color-mix(in srgb, ${colors.surface} 82%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  box-shadow: 0 8px 20px color-mix(in srgb, ${colors.surface} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${colors.text} !important;
  text-shadow: none !important;
}

/* 弹层内部的菜单项/选项：默认透明，悬停与选中用 accent 底色 */
:is([role="menu"], [role="listbox"]) :is(
  [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], a, button
) {
  background: transparent !important;
  color: ${colors.text} !important;
}
:is([role="menu"], [role="listbox"]) :is(
  [role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"], [role="option"], a, button
):hover,
:is([role="menu"], [role="listbox"]) :is([role="option"], [role="menuitem"]):where([aria-selected="true"], [data-state="checked"]) {
  background: color-mix(in srgb, ${colors.accent} 14%, ${colors.surface}) !important;
  color: ${colors.text} !important;
}

/* 对话框标题/正文/标签跟随主题文字色（输入类控件背景交由上方毛玻璃容器透出） */
:is([role="dialog"], [role="alertdialog"]) :where(h1, h2, h3, h4, label, p, span, li, [class*="DialogLabel"], [class*="DialogTitle"], [class*="DialogDescription"]) {
  color: ${colors.text} !important;
  text-shadow: none !important;
}

/* ---- 插件市场页（独立整页，含 H1 标题，无设置侧栏）：
   设置页规则按 aside.min-w-0 nav 作用域，市场页不命中导致搜索框原生纯白、
   插件图标与卡片透明浮在壁纸上。这里按 max-w-4xl:has(h1) 精确限定，
   与会话列（无 h1）区分开。 ---- */
main [class*="max-w-4xl"]:has(h1) :is(
  input,
  button,
  div[class*="group/card"],
  div[class*="bg-card"],
  div[class*="rounded-xl"],
  div[class*="min-h-11"]
):not([class*="bg-accent"]):not([class*="bg-primary"]) {
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  box-shadow: 0 12px 30px color-mix(in srgb, ${colors.surface} 30%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
  color: ${colors.text} !important;
  text-shadow: none !important;
}
main [class*="max-w-4xl"]:has(h1) :is(
  button, div[class*="group/card"], div[class*="bg-card"]
):not([class*="bg-accent"]):not([class*="bg-primary"]):hover {
  background: color-mix(in srgb, ${colors.accent} 14%, ${colors.surface}) !important;
}
main [class*="max-w-4xl"]:has(h1) input {
  color: ${colors.text} !important;
  caret-color: ${colors.accent} !important;
}
main [class*="max-w-4xl"]:has(h1) input::placeholder {
  color: ${colors.textSecondary} !important;
  opacity: 1 !important;
}

/* 会话流内的文件更改汇总卡（bg-card）：原生 oklch 深底完全不透明，
   接入与设置页卡片同款毛玻璃材质；行底的 bg-background/50 深色叠底
   改为透明，避免在玻璃上再压一层暗色。 */
:is(main, div.border-l.border-border) [class~="group/assistant-turn"] div[class~="bg-card"] {
  background: color-mix(in srgb, ${colors.surface} ${PNL}%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  color: ${colors.text} !important;
}
:is(main, div.border-l.border-border) [class~="group/assistant-turn"] div[class~="bg-card"] div[class~="bg-background/50"] {
  background: transparent !important;
}

/* 上下文叠加 HoverCard（composer 工具条图标悬停触发）：容器已由上方弹层
   规则提供毛玻璃，但内层 bg-menu 不透明深底把玻璃盖平；改透明让玻璃透出，
   并按用户点名接入同款边框流光。 */
div[data-slot="hover-card-content"] {
  position: relative !important;
}
div[data-slot="hover-card-content"] div[class~="bg-menu"] {
  background: transparent !important;
}
div[data-slot="hover-card-content"]::after {
  content: "" !important;
  position: absolute !important;
  inset: -2px !important;
  border-radius: inherit !important;
  padding: 2px !important;
  background: conic-gradient(from var(--dream-flow), color-mix(in srgb, #ffffff 14%, transparent) 0deg, color-mix(in srgb, #ffffff 7%, transparent) 15deg, transparent 30deg, transparent 150deg, color-mix(in srgb, #ffffff 7%, transparent) 165deg, color-mix(in srgb, #ffffff 14%, transparent) 180deg, color-mix(in srgb, #ffffff 7%, transparent) 195deg, transparent 210deg, transparent 330deg, color-mix(in srgb, #ffffff 7%, transparent) 345deg, color-mix(in srgb, #ffffff 14%, transparent) 360deg), conic-gradient(from var(--dream-flow), color-mix(in srgb, ${colors.accent} 82%, transparent) 15deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 45deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 75deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 105deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 135deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 165deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 195deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 225deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 255deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 285deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 315deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 345deg) !important;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  mask-composite: exclude !important;
  animation: dream-flow-orbit 6s linear infinite !important;
  pointer-events: none !important;
}

/* ---- 会话流光（多彩流光环）：等粗恒定 82% alpha 色环包围整个框，
   accent/secondary 以 60° 周期六段交替（30° 保持 + 30° 混色，转一圈每点
   交替三次色相），一对半透明白纱微光 180° 对置巡游只提亮不增粗。环带
   亮度处处相等（粗细视觉恒定），单 --dream-flow 时钟 6s/圈（彗星基线
   24s 的 4 倍速）。颜色随主题 ----
   @property 注册角度变量使 conic-gradient 可动画；reduced-motion 时静止。 */
@property --dream-flow { syntax: '<angle>'; inherits: false; initial-value: 0deg; }
:is(main) .chat-composer-region,
:is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable],
:is(main, div.border-l.border-border) [class~="group/user-row"] > div[class*="rounded-xl"],
#sidebar li[class*="bg-selected"] {
  position: relative !important;
}
:is(main) .chat-composer-region::after,
:is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable]::after,
:is(main, div.border-l.border-border) [class~="group/user-row"] > div[class*="rounded-xl"]::after,
#sidebar li[class*="bg-selected"]::after {
  content: "" !important;
  position: absolute !important;
  inset: -2px !important;
  border-radius: 18px !important;
  padding: 2px !important;
  background: conic-gradient(from var(--dream-flow), color-mix(in srgb, #ffffff 14%, transparent) 0deg, color-mix(in srgb, #ffffff 7%, transparent) 15deg, transparent 30deg, transparent 150deg, color-mix(in srgb, #ffffff 7%, transparent) 165deg, color-mix(in srgb, #ffffff 14%, transparent) 180deg, color-mix(in srgb, #ffffff 7%, transparent) 195deg, transparent 210deg, transparent 330deg, color-mix(in srgb, #ffffff 7%, transparent) 345deg, color-mix(in srgb, #ffffff 14%, transparent) 360deg), conic-gradient(from var(--dream-flow), color-mix(in srgb, ${colors.accent} 82%, transparent) 15deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 45deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 75deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 105deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 135deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 165deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 195deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 225deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 255deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 285deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 315deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 345deg) !important;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  mask-composite: exclude !important;
  animation: dream-flow-orbit 6s linear infinite !important;
  pointer-events: none !important;
}
/* 输入框区域（chat-composer-region，shrink-0 钉在外层容器底边）下缘被
   容器边界裁剪：外扩 2px 的环下缘整条不可见。底边改贴边内绘（同 Git
   面板 inset 0 方案），上/左/右仍外扩 2px。 */
:is(main) .chat-composer-region::after {
  inset: -2px -2px 0 -2px !important;
}
#sidebar li[class*="bg-selected"]::after {
  border-radius: 10px !important;
  inset: -1.5px !important;
}
/* 侧栏任务树的横向滚动条拇指（内容溢出时出现在头像行上方，用户确认为
   非原生观感）：隐藏条本体，overflow 保持 auto——内容仍可横向滚、不裁
   选中会话环的外扩 1.5px。 */
#sidebar div[class*="overflow-y-auto"] {
  scrollbar-width: none !important;
}
#sidebar div[class*="overflow-y-auto"]::-webkit-scrollbar {
  display: none !important;
  height: 0 !important;
  width: 0 !important;
}
/* 用户气泡半径 rounded-xl（12px，右上 rounded-tr-xs 更小），外扩 2px 的环取 14px。 */
:is(main, div.border-l.border-border) [class~="group/user-row"] > div[class*="rounded-xl"]::after {
  border-radius: 14px !important;
}
/* Git 工具状态面板流光：与会话盒同款多彩流光环（类签名 popover-border 全局唯一）。
   面板自身 overflow-hidden + 16px 圆角，环贴边内绘（inset 0）避免裁剪。 */
aside[class*="popover-border"] {
  position: relative !important;
}
aside[class*="popover-border"]::after {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: 16px !important;
  padding: 2px !important;
  background: conic-gradient(from var(--dream-flow), color-mix(in srgb, #ffffff 14%, transparent) 0deg, color-mix(in srgb, #ffffff 7%, transparent) 15deg, transparent 30deg, transparent 150deg, color-mix(in srgb, #ffffff 7%, transparent) 165deg, color-mix(in srgb, #ffffff 14%, transparent) 180deg, color-mix(in srgb, #ffffff 7%, transparent) 195deg, transparent 210deg, transparent 330deg, color-mix(in srgb, #ffffff 7%, transparent) 345deg, color-mix(in srgb, #ffffff 14%, transparent) 360deg), conic-gradient(from var(--dream-flow), color-mix(in srgb, ${colors.accent} 82%, transparent) 15deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 45deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 75deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 105deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 135deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 165deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 195deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 225deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 255deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 285deg, color-mix(in srgb, ${colors.secondary} 82%, transparent) 315deg, color-mix(in srgb, ${colors.accent} 82%, transparent) 345deg) !important;
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  -webkit-mask-composite: xor !important;
  mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0) !important;
  mask-composite: exclude !important;
  animation: dream-flow-orbit 6s linear infinite !important;
  pointer-events: none !important;
}
#sidebar li[class*="bg-selected"] {
  border: 1px solid color-mix(in srgb, ${colors.accent} 45%, transparent) !important;
}
#sidebar li[class*="bg-selected"] {
  border: 1px solid color-mix(in srgb, ${colors.accent} 45%, transparent) !important;
}
/* 会话输出框仪表角标（Tactical Corners）：左上/右下 L 形 2.5px 加粗角标
   （20px 臂长、圆角端点、小弧拐弯），右上/左下短刻度圆点，accent 随主题；
   角标组呼吸式流光闪烁（静态 drop-shadow 光晕 + 透明度脉动）。
   ::before 定位绘制于底色之上、角落留白区，pointer-events 关闭不挡交互。
   用户气泡（group/user-row 下 rounded-xl 子盒）同款。 */
:is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable]::before,
:is(main, div.border-l.border-border) [class~="group/user-row"] > div[class*="rounded-xl"]::before {
  content: "" !important;
  position: absolute !important;
  inset: -1px !important;
  background: url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M19.5 0.5H15.5A15 15 0 0 0 0.5 15.5V19.5" stroke="${colors.accent}" stroke-width="2.5" stroke-linecap="round"/></svg>`)}") 0 0 / 20px 20px no-repeat, url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M0.5 19.5H4.5A15 15 0 0 0 19.5 4.5V0.5" stroke="${colors.accent}" stroke-width="2.5" stroke-linecap="round"/></svg>`)}") right 0 bottom 0 / 20px 20px no-repeat, radial-gradient(circle, ${colors.accent} 0 2px, transparent 2.8px) right 8px top 3px / 6px 6px no-repeat, radial-gradient(circle, ${colors.accent} 0 2px, transparent 2.8px) left 8px bottom 3px / 6px 6px no-repeat !important;
  filter: drop-shadow(0 0 5px color-mix(in srgb, ${colors.accent} 70%, transparent)) !important;
  animation: dream-corner-blink 2.2s ease-in-out infinite !important;
  pointer-events: none !important;
}
@keyframes dream-corner-blink { 0%, 100% { opacity: 0.35; } 50% { opacity: 1; } }
@keyframes dream-flow-orbit { to { --dream-flow: 360deg; } }
@media (prefers-reduced-motion: reduce) {
  :is(main) .chat-composer-region::after,
  :is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable]::after,
  #sidebar li[class*="bg-selected"]::after,
  :is(main, div.border-l.border-border) [class~="group/assistant-row"] > [data-conversation-selectable]::before,
  aside[class*="popover-border"]::after,
  div[data-slot="hover-card-content"]::after { animation: none !important; }
}`;
}

function buildHanaAgentCss(manifest: any, heroDataUrl: string, colors: any): string {
  return `/* DREAM_THEME:${manifest.id} */
:root {
  --dream-work-accent: ${colors.accent};
  --dream-work-secondary: ${colors.secondary};
  --dream-work-surface: ${colors.surface};
  --dream-work-text: ${colors.text};
  --dream-work-text-vivid: ${colors.textVivid ?? colors.text};
  --dream-work-text-alt: ${colors.textAlt ?? colors.textSecondary ?? colors.text};
  --dream-work-text-opposite: ${colors.textOpposite ?? colors.textVivid ?? colors.text};
}
html, body, #react-root, .app-shell {
  background-color: ${colors.surface} !important;
  background-image: url(${JSON.stringify(heroDataUrl)}) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important;
  color: ${colors.text} !important;
}
.titlebar, .app, .main-content, .chat-area, .input-area {
  background-color: transparent !important;
  background-image: none !important;
}
#sidebar, #jianSidebar .universal-card, #previewBody {
  background: color-mix(in srgb, ${colors.surface} 56%, transparent) !important;
  border-color: color-mix(in srgb, ${colors.accent} 24%, transparent) !important;
  color: ${colors.text} !important;
  backdrop-filter: blur(20px) saturate(110%) !important;
}
.titlebar {
  background: color-mix(in srgb, ${colors.surface} 52%, transparent) !important;
  color: ${colors.text} !important;
  backdrop-filter: blur(18px) saturate(108%) !important;
}
[class*="input-wrapper"] {
  background: color-mix(in srgb, ${colors.surface} 68%, transparent) !important;
  border-color: color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  color: ${colors.text} !important;
  box-shadow: 0 16px 42px color-mix(in srgb, ${colors.surface} 28%, transparent) !important;
  backdrop-filter: blur(18px) saturate(108%) !important;
}
[class*="input-wrapper"] :where(textarea, input, [contenteditable="true"]) {
  background: transparent !important;
  color: ${colors.text} !important;
  caret-color: ${colors.accent} !important;
}
#sidebar :where(button, [role="button"]):hover,
#jianSidebar :where(button, [role="button"]):hover {
  background-color: color-mix(in srgb, ${colors.accent} 16%, transparent) !important;
}
:where(button[class*="primary"], button[type="submit"]) {
  background-color: ${colors.accent} !important;
  color: #ffffff !important;
}`;
}

function buildHanaAgentMenuScript(options: {
  styleId: string;
  menuId: string;
  currentThemeId: string;
  themes: Array<{ id: string; name: string; css: string; surface: string; accent?: string }>;
  cssTemplate: string;
  sharedCustomThemes: any[];
  sharedCustomThemeService: { endpoint: string; usageEndpoint: string; token: string };
}): string {
  return `(() => {
    const themes = ${JSON.stringify(options.themes)};
    const cssTemplate = ${JSON.stringify(options.cssTemplate)};
    const sentinels = ${JSON.stringify(WORKBUDDY_CSS_PLACEHOLDERS)};
    const restoreKey = 'dream-work-theme:hana-agent:restored';
    const customStorageKey = 'dreamCodexCustomThemes';
    const selectedKey = 'dream-work-theme:hana-agent:selected-theme';
    const sharedCustomThemes = ${JSON.stringify(options.sharedCustomThemes)};
    const sharedCustomThemeService = ${JSON.stringify(options.sharedCustomThemeService)};
    const recordPresetUsage = (themeId) => fetch(sharedCustomThemeService.usageEndpoint, {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token, 'Content-Type': 'application/json' },
      body: JSON.stringify({ appId: 'hana-agent', themeId }),
    }).catch(() => {});
    const forceApply = Boolean(window.__dreamWorkForceApply);
    delete window.__dreamWorkForceApply;
    let restored = false;
    try { restored = localStorage.getItem(restoreKey) === '1'; } catch {}
    if (forceApply) {
      restored = false;
      try { localStorage.removeItem(restoreKey); } catch {}
    }
    if (restored) document.documentElement.dataset.dreamThemeRestored = 'true';
    else delete document.documentElement.dataset.dreamThemeRestored;
    let active = !restored;
    let style = document.getElementById('${options.styleId}');
    if (!style) {
      style = document.createElement('style');
      style.id = '${options.styleId}';
    }
    const attachStyle = () => {
      if (active && !style.isConnected) document.head.appendChild(style);
    };
    let rows = [];
    const applyTheme = (themeId) => {
      const theme = themes.find(item => item.id === themeId);
      if (!theme) return;
      active = true;
      try { localStorage.removeItem(restoreKey); } catch {}
      delete document.documentElement.dataset.dreamThemeRestored;
      style.textContent = theme.css;
      attachStyle();
      document.documentElement.dataset.dreamTheme = themeId;
      try { localStorage.setItem(selectedKey, themeId); } catch {}
      rows.forEach((row) => {
        const selected = row.dataset.themeId === themeId;
        row.style.background = selected ? 'rgba(36,201,215,.16)' : 'transparent';
        row.style.fontWeight = selected ? '700' : '500';
      });
    };
    const restoreNative = () => {
      active = false;
      try { localStorage.setItem(restoreKey, '1'); } catch {}
      document.documentElement.dataset.dreamThemeRestored = 'true';
      clearInterval(window.__dreamWorkMenuGuard);
      style.remove();
      delete document.documentElement.dataset.dreamTheme;
      try { localStorage.removeItem(selectedKey); } catch {}
      panel.style.display = 'none';
    };
    if (window.__dreamWorkOutsideClick) {
      document.removeEventListener('pointerdown', window.__dreamWorkOutsideClick, true);
      delete window.__dreamWorkOutsideClick;
    }
    document.getElementById('${options.menuId}-host')?.remove();
    clearInterval(window.__dreamWorkMenuGuard);
    const host = document.createElement('div');
    host.id = '${options.menuId}-host';
    host.style.cssText = 'all:initial!important;position:fixed!important;right:16px!important;bottom:16px!important;z-index:2147483647!important;display:block!important;pointer-events:auto!important;';
    const shadow = host.attachShadow({ mode: 'open' });
    const root = document.createElement('div');
    root.id = '${options.menuId}';
    root.style.cssText = 'display:flex;flex-direction:column;align-items:flex-end;font:500 13px/1.4 system-ui;color:#17344f;';
    const panel = document.createElement('div');
    panel.style.cssText = 'display:none;margin-bottom:8px;min-width:190px;padding:6px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:rgba(255,255,255,.96);box-shadow:0 10px 30px rgba(0,0,0,.18);';
    const button = document.createElement('button');
    button.type = 'button';
    button.title = 'Dream Work Theme';
    button.textContent = '◉';
    button.style.cssText = 'width:36px;height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.92);box-shadow:0 3px 12px rgba(0,0,0,.2);cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;color:#17344f;font-size:18px;line-height:1;';
    const addRow = (label, themeId, accent, onClick, before) => {
      const row = document.createElement('div');
      row.dataset.themeId = themeId || '';
      row.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;color:#17344f;';
      const dot = document.createElement('span');
      dot.style.cssText = 'width:10px;height:10px;border-radius:50%;flex:none;background:' + accent + ';';
      const text = document.createElement('span');
      text.textContent = label;
      row.append(dot, text);
      row.addEventListener('click', onClick);
      if (before) panel.insertBefore(row, before); else panel.appendChild(row);
      rows.push(row);
      return row;
    };
    themes.forEach((theme) => addRow(theme.name, theme.id, theme.accent || '#24c9d7', () => {
      applyTheme(theme.id);
      void recordPresetUsage(theme.id);
      panel.style.display = 'none';
    }));
    const materializeCustomCss = (dataUrl, colors, customId) => cssTemplate
      .split(sentinels.hero).join(dataUrl)
      .split(sentinels.accent).join(colors.accent)
      .split(sentinels.secondary).join(colors.secondary)
      .split(sentinels.surface).join(colors.surface)
      .split(sentinels.text).join(colors.text)
      .split(sentinels.id).join(customId);
    const hex = (r, g, b) => '#' + [r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('');
    const mix = (a, b, amount) => a.map((value, index) => value + (b[index] - value) * amount);
    const extractPalette = (canvas) => {
      const context = canvas.getContext('2d');
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const buckets = new Map();
      let luminanceSum = 0;
      let count = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        luminanceSum += luminance;
        count += 1;
        const saturation = max === 0 ? 0 : (max - min) / max;
        if (saturation < 0.18 || luminance < 24 || luminance > 245) continue;
        const delta = max - min || 1;
        const hue = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
        const bucket = (Math.round(hue) % 6) * 2 + (saturation > 0.55 ? 1 : 0);
        const entry = buckets.get(bucket) || { weight: 0, r: 0, g: 0, b: 0, hue: hue * 60 };
        const weight = saturation * saturation;
        entry.weight += weight;
        entry.r += r * weight;
        entry.g += g * weight;
        entry.b += b * weight;
        buckets.set(bucket, entry);
      }
      const ranked = [...buckets.values()].sort((left, right) => right.weight - left.weight)
        .map((entry) => ({ rgb: [entry.r / entry.weight, entry.g / entry.weight, entry.b / entry.weight], hue: entry.hue }));
      const accent = ranked[0]?.rgb || [36, 201, 215];
      const secondary = ranked.find((entry) => Math.abs(entry.hue - (ranked[0]?.hue || 0)) > 50)?.rgb || mix(accent, [255, 255, 255], 0.35);
      const light = (count ? luminanceSum / count : 128) > 128;
      return {
        accent: hex(...accent),
        secondary: hex(...secondary),
        surface: hex(...(light ? mix(accent, [252, 252, 255], 0.92) : mix(accent, [12, 12, 18], 0.86))),
        text: hex(...(light ? mix(accent, [16, 24, 40], 0.82) : mix(accent, [244, 246, 252], 0.85))),
      };
    };
    const MAX_CUSTOM = 5;
    const customRows = new Map();
    const removeCustomRow = (slotId) => {
      const row = customRows.get(slotId);
      if (!row) return;
      const rowIndex = rows.indexOf(row);
      if (rowIndex >= 0) rows.splice(rowIndex, 1);
      row.remove();
      customRows.delete(slotId);
    };
    const loadCustoms = () => {
      try {
        const saved = JSON.parse(localStorage.getItem(customStorageKey) || '[]');
        return Array.isArray(saved) ? saved.filter((item) => item?.id && item?.dataUrl && item?.colors).slice(0, MAX_CUSTOM) : [];
      } catch { return []; }
    };
    const writeLocalCustoms = (saved) => {
      try { localStorage.setItem(customStorageKey, JSON.stringify(saved.slice(0, MAX_CUSTOM))); }
      catch (error) { console.warn('Dream Theme: HanaAgent 自定义图片本地缓存失败', error); }
    };
    const syncSharedCustoms = (saved) => fetch(sharedCustomThemeService.endpoint, {
      method: 'PUT',
      headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token, 'Content-Type': 'application/json' },
      body: JSON.stringify(saved.slice(0, MAX_CUSTOM)),
    }).then((response) => {
      if (!response.ok) throw new Error('共享图片同步失败: HTTP ' + response.status);
      return response.json();
    });
    const saveCustoms = (saved) => {
      const limited = saved.slice(0, MAX_CUSTOM);
      writeLocalCustoms(limited);
      return syncSharedCustoms(limited).catch((error) => {
        console.warn('Dream Theme: HanaAgent 共享图片同步失败', error);
        return limited;
      });
    };
    const localCustomThemes = loadCustoms();
    const initialCustomThemes = sharedCustomThemes.length > 0 ? sharedCustomThemes : localCustomThemes;
    writeLocalCustoms(initialCustomThemes);
    if (sharedCustomThemes.length === 0 && localCustomThemes.length > 0) void saveCustoms(localCustomThemes);
    const paintRows = (themeId) => rows.forEach((row) => {
      const selected = row.dataset.themeId === themeId;
      row.style.background = selected ? 'rgba(36,201,215,.16)' : 'transparent';
      row.style.fontWeight = selected ? '700' : '500';
    });
    const applyCustomTheme = (slot) => {
      active = true;
      try {
        localStorage.removeItem(restoreKey);
        localStorage.setItem(selectedKey, slot.id);
      } catch {}
      delete document.documentElement.dataset.dreamThemeRestored;
      style.textContent = materializeCustomCss(slot.dataUrl, slot.colors, slot.id);
      attachStyle();
      document.documentElement.dataset.dreamTheme = slot.id;
      paintRows(slot.id);
    };
    let uploadRow;
    const deleteCustom = async (slotId) => {
      const saved = loadCustoms();
      const index = saved.findIndex((item) => item.id === slotId);
      if (index < 0) return;
      if (document.documentElement.dataset.dreamTheme === slotId) restoreNative();
      saved.splice(index, 1);
      await saveCustoms(saved);
      removeCustomRow(slotId);
    };
    const ensureCustomRow = (slot) => {
      const existing = customRows.get(slot.id);
      if (existing) return;
      const item = addRow(slot.name, slot.id, slot.colors.accent, () => {
        const current = loadCustoms().find((saved) => saved.id === slot.id) || slot;
        applyCustomTheme(current);
        panel.style.display = 'none';
      }, uploadRow);
      const text = item.querySelector('span + span');
      text.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
      const remove = document.createElement('span');
      remove.textContent = '×';
      remove.title = '删除这张自定义图片';
      remove.style.cssText = 'flex:none;width:18px;height:18px;line-height:18px;text-align:center;border-radius:50%;color:rgba(0,0,0,.45);font-size:14px;';
      remove.addEventListener('click', (event) => { event.stopPropagation(); deleteCustom(slot.id); });
      item.appendChild(remove);
      customRows.set(slot.id, item);
    };
    const importFromDataUrl = (dataUrl, name) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = async () => {
        const scale = Math.min(1, 1280 / image.width);
        const full = document.createElement('canvas');
        full.width = Math.max(1, Math.round(image.width * scale));
        full.height = Math.max(1, Math.round(image.height * scale));
        full.getContext('2d').drawImage(image, 0, 0, full.width, full.height);
        const sample = document.createElement('canvas');
        sample.width = 48;
        sample.height = Math.max(1, Math.round(48 * image.height / image.width));
        sample.getContext('2d').drawImage(image, 0, 0, sample.width, sample.height);
        const colors = extractPalette(sample);
        const compressed = full.toDataURL('image/webp', 0.78);
        const saved = loadCustoms();
        let slot;
        if (saved.length < MAX_CUSTOM) {
          slot = { id: 'custom-hana-' + Date.now().toString(36), name: name || '我的图片', dataUrl: compressed, colors };
          saved.push(slot);
        } else {
          const activeId = document.documentElement.dataset.dreamTheme;
          let index = saved.findIndex((item) => item.id === activeId);
          if (index < 0) index = 0;
          slot = { id: saved[index].id, name: name || '我的图片', dataUrl: compressed, colors };
          saved[index] = slot;
          removeCustomRow(slot.id);
        }
        await saveCustoms(saved);
        ensureCustomRow(slot);
        applyCustomTheme(slot);
        resolve(colors);
      };
      image.onerror = () => reject(new Error('图片读取失败'));
      image.src = dataUrl;
    });
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'image/png,image/jpeg,image/webp';
    picker.style.display = 'none';
    picker.addEventListener('change', () => {
      const file = picker.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => importFromDataUrl(reader.result, file.name.replace(/\\.[a-z0-9]+$/i, '')).catch((error) => console.warn('Dream Theme: HanaAgent 图片导入失败', error));
      reader.readAsDataURL(file);
      picker.value = '';
      panel.style.display = 'none';
    });
    uploadRow = addRow('＋ 自定义图片', '', 'rgba(36,201,215,.9)', () => picker.click());
    uploadRow.style.borderTop = '1px solid rgba(0,0,0,.08)';
    addRow('还原主题', '', 'rgba(0,0,0,.24)', restoreNative);
    initialCustomThemes.forEach(ensureCustomRow);
    fetch(sharedCustomThemeService.endpoint, {
      headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token },
    }).then((response) => response.ok ? response.json() : Promise.reject(new Error('HTTP ' + response.status)))
      .then((latest) => {
        if (!Array.isArray(latest)) return;
        for (const slotId of [...customRows.keys()]) {
          if (!latest.some((item) => item.id === slotId)) removeCustomRow(slotId);
        }
        writeLocalCustoms(latest);
        latest.forEach(ensureCustomRow);
        let selectedId = '';
        try { selectedId = localStorage.getItem(selectedKey) || ''; } catch {}
        const selected = latest.find((item) => item.id === selectedId);
        if (selected) applyCustomTheme(selected);
      }).catch((error) => console.warn('Dream Theme: HanaAgent 共享图片读取失败', error));
    button.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
    });
    const closeOnOutsideClick = (event) => {
      if (panel.style.display === 'none') return;
      const path = event.composedPath?.() || [];
      if (!path.includes(host)) panel.style.display = 'none';
    };
    window.__dreamWorkOutsideClick = closeOnOutsideClick;
    document.addEventListener('pointerdown', closeOnOutsideClick, true);
    root.append(panel, button, picker);
    shadow.appendChild(root);
    document.documentElement.appendChild(host);
    window.__dreamWorkMenuGuard = setInterval(() => {
      attachStyle();
      if (!host.isConnected) document.documentElement.appendChild(host);
    }, 250);
    if (!restored || forceApply) {
      let selectedId = '${options.currentThemeId}';
      if (!forceApply) {
        try { selectedId = localStorage.getItem(selectedKey) || selectedId; } catch {}
      }
      const selectedCustom = loadCustoms().find((item) => item.id === selectedId);
      if (selectedCustom) applyCustomTheme(selectedCustom);
      else applyTheme('${options.currentThemeId}');
    }
    return true;
  })()`;
}

function buildQoderWorkShellCss(colors: any): string {
  return `
/* QoderWork shell controls */
body > #root > div:first-child > div:first-child button[aria-label] {
  background-color: transparent !important;
  color: ${colors.text} !important;
  border-color: transparent !important;
  box-shadow: none !important;
}

body > #root > div:first-child > div:first-child button[aria-label]:hover,
body > #root > div:first-child > div:first-child button[aria-label]:focus-visible {
  background-color: color-mix(in srgb, ${colors.accent} 16%, transparent) !important;
  color: ${colors.text} !important;
}
body > #root > div:first-child > div:first-child button[aria-label="Close"]:hover {
  background-color: color-mix(in srgb, #ef4444 20%, transparent) !important;
  color: #ef4444 !important;
}
.agents-sidebar :where(button, [role="button"], [class*="cursor-pointer"]) {
  color: ${colors.textSecondary} !important;
}
.agents-sidebar :where(button, [role="button"], [class*="cursor-pointer"]):hover {
  background-color: color-mix(in srgb, ${colors.accent} 14%, transparent) !important;
  color: ${colors.text} !important;
}
.agents-sidebar :where(button[aria-label="任务"], button[aria-label="频道"]) {
  background-color: transparent !important;
  color: ${colors.textSecondary} !important;
  border-color: transparent !important;
  box-shadow: none !important;
}
.agents-sidebar :where(button[aria-label="任务"], button[aria-label="频道"])[data-state="active"],
.agents-sidebar :where(button[aria-label="任务"], button[aria-label="频道"])[aria-selected="true"],
.agents-sidebar :where(button[aria-label="任务"], button[aria-label="频道"]):focus-visible {
  background-color: color-mix(in srgb, ${colors.accent} 20%, transparent) !important;
  color: ${colors.text} !important;
}
.agents-sidebar > :last-child button {
  background-color: transparent !important;
  color: ${colors.text} !important;
  border-color: transparent !important;
  box-shadow: none !important;
}
.agents-sidebar > :last-child button:hover {
  background-color: color-mix(in srgb, ${colors.accent} 14%, transparent) !important;
}
.agents-content-area button.rounded-full:not(.SendButton-send),
.agents-parchment-paper-surface button.rounded-full:not(.SendButton-send) {
  background-color: color-mix(in srgb, ${colors.surface} 60%, transparent) !important;
  color: ${colors.text} !important;
  border-color: color-mix(in srgb, ${colors.text} 14%, transparent) !important;
  box-shadow: none !important;
}
.agents-content-area button.rounded-full:not(.SendButton-send):hover,
.agents-parchment-paper-surface button.rounded-full:not(.SendButton-send):hover {
  background-color: color-mix(in srgb, ${colors.accent} 18%, transparent) !important;
  border-color: color-mix(in srgb, ${colors.accent} 34%, transparent) !important;
}
.agents-content-area button svg,
.agents-sidebar button svg,
body > #root > div:first-child > div:first-child button[aria-label] svg {
  color: currentColor !important;
}`;
}

function buildCatPawCss(heroDataUrl: string, colors: any): string {
  return `
/* CatPaw new-task and conversation surfaces */
html body #root .main-area {
  position: relative !important;
  isolation: isolate !important;
  background-color: ${colors.surface} !important;
  background-image: url(${JSON.stringify(heroDataUrl)}) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
}
html body #root .main-content-container,
html body #root .main-content,
html body #root .chat-content-area {
  background-color: transparent !important;
  background-image: none !important;
}
html body #root .chat-content-area > .relative.flex.flex-col.items-center.h-full,
html body #root .chat-content-area [class~="bg-catpaw-bg-primary"] {
  background-color: transparent !important;
  background-image: none !important;
}
html body #root .catpaw-desk-inputBox > .bg-catpaw-bg-card,
html body #root .catpaw-desk-inputBox [class~="bg-catpaw-bg-card"] {
  background-color: color-mix(in srgb, ${colors.surface} 68%, transparent) !important;
  border: 1px solid color-mix(in srgb, ${colors.accent} 30%, transparent) !important;
  box-shadow: 0 16px 42px color-mix(in srgb, ${colors.surface} 30%, transparent) !important;
  backdrop-filter: blur(16px) saturate(108%) !important;
}
html body #root .catpaw-desk-inputBox :where(
  .catpaw-chat-input,
  .catpaw-editor,
  .catpaw-editor__body,
  .catpaw-editor__content,
  .mc-input-container
) {
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
  color: ${colors.text} !important;
}
html body #root .catpaw-desk-inputBox :where(button, [role="button"]) {
  color: ${colors.text} !important;
}
html body #root .catpaw-desk-inputBox :where(button, [role="button"]):hover {
  background-color: color-mix(in srgb, ${colors.accent} 15%, transparent) !important;
}
html body #root .catpaw-desk-inputBox :where(svg, svg *) {
  color: currentColor !important;
}
`;
}

function copy(value: unknown, fallback = "") {
  return JSON.stringify(typeof value === "string" ? value : fallback);
}

function buildWorkBuddyCss(manifest: any, heroDataUrl: string, colors: any): string {
  const id = String(manifest.id ?? "custom").replace(/[^a-z0-9_-]/gi, "");
  return `/* DREAM_THEME:${id} */
body[data-application-name="workbuddy"] {
  --wb-accent: ${colors.accent};
  --wb-secondary: ${colors.secondary};
  --wb-surface: ${colors.surface};
  --wb-text: ${colors.text};

  /* 背景 */
  --cb-bg-primary: var(--wb-surface) !important;
  --cb-bg-secondary: color-mix(in srgb, var(--wb-surface) 94%, transparent) !important;
  --cb-panel-bg-primary: color-mix(in srgb, var(--wb-surface) 92%, transparent) !important;
  --cb-team-member-card-background: color-mix(in srgb, var(--wb-surface) 92%, transparent) !important;

  /* 文字 */
  --cb-text-primary: var(--wb-text) !important;
  --cb-text-secondary: color-mix(in srgb, var(--wb-text) 82%, transparent) !important;
  --cb-text-disabled: color-mix(in srgb, var(--wb-text) 62%, transparent) !important;
  --cb-text-link: var(--wb-accent) !important;
  --cb-text-error-active: var(--wb-accent) !important;

  /* VS Code 主题色包装 */
  --cb-vscode-editor-background: var(--wb-surface) !important;
  --cb-vscode-sideBar-background: color-mix(in srgb, var(--wb-surface) 94%, transparent) !important;
  --cb-vscode-foreground: var(--wb-text) !important;
  --cb-vscode-editor-foreground: var(--wb-text) !important;
  --cb-vscode-descriptionForeground: color-mix(in srgb, var(--wb-text) 70%, transparent) !important;
  --cb-vscode-titleBar-activeBackground: var(--wb-accent) !important;
  --cb-vscode-titleBar-activeForeground: #ffffff !important;
  --cb-vscode-titleBar-inactiveBackground: color-mix(in srgb, var(--wb-accent) 80%, var(--wb-surface)) !important;
  --cb-vscode-titleBar-inactiveForeground: color-mix(in srgb, #ffffff 70%, transparent) !important;
  --cb-titlebar-control-hover-background: color-mix(in srgb, var(--wb-accent) 16%, transparent) !important;
  --cb-vscode-input-background: color-mix(in srgb, var(--wb-surface) 94%, transparent) !important;
  --cb-vscode-dropdown-background: color-mix(in srgb, var(--wb-surface) 96%, transparent) !important;
  --cb-vscode-list-hoverBackground: color-mix(in srgb, var(--wb-accent) 16%, transparent) !important;
  --cb-vscode-toolbar-hoverBackground: color-mix(in srgb, var(--wb-accent) 16%, transparent) !important;
  --cb-vscode-scrollbarSlider-background: color-mix(in srgb, var(--wb-accent) 30%, transparent) !important;
  --cb-vscode-scrollbarSlider-hoverBackground: color-mix(in srgb, var(--wb-accent) 50%, transparent) !important;
  --cb-vscode-textLink-foreground: var(--wb-accent) !important;
  --cb-vscode-widget-border: color-mix(in srgb, var(--wb-accent) 45%, transparent) !important;
  --cb-vscode-panel-border: color-mix(in srgb, var(--wb-accent) 30%, transparent) !important;

  /* 按钮 */
  --cb-button-dark-background: var(--wb-accent) !important;
  --cb-button-dark-foreground: #ffffff !important;
  --cb-button-dark-hover-background: color-mix(in srgb, var(--wb-accent) 85%, #000000) !important;
  --cb-vscode-button-background: var(--wb-accent) !important;
  --cb-vscode-button-foreground: #ffffff !important;
  --cb-vscode-button-hoverBackground: color-mix(in srgb, var(--wb-accent) 85%, #000000) !important;

  /* 描边 */
  --cb-stroke-secondary: color-mix(in srgb, var(--wb-accent) 45%, transparent) !important;
  --cb-markdown-hr-border-color: color-mix(in srgb, var(--wb-accent) 30%, transparent) !important;
}

#root {
  color: var(--wb-text) !important;
  background-color: var(--wb-surface) !important;
  background-image: url(${JSON.stringify(heroDataUrl)}) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  background-attachment: fixed !important;
}

/* 关键：teams-container 是 #root 直接子层，默认有不透明灰底，会完全盖住背景图 */
.teams-container,
.teams-container.is-mac {
  background: transparent !important;
}

/* 所有 grid 项容器透明，让 #root 背景图大面积透出 */
[data-view-id] {
  background: transparent !important;
}

/* 内容区内的子层也透明（否则会盖住背景图和磨砂层） */
.conversation-list,
.main-content,
.main-content--welcome,
.sidebar-next {
  background: transparent !important;
}

/* 侧边栏磨砂玻璃（覆盖上面的 transparent） */
[data-view-id=sidebar] {
  background: color-mix(in srgb, var(--wb-surface) 62%, transparent) !important;
  border-right: 1px solid color-mix(in srgb, var(--wb-accent) 45%, transparent) !important;
  backdrop-filter: blur(20px) saturate(1.12);
}

/* 主内容区：顶部透出底图，底部更强遮罩保证内容可读 */
[data-view-id=main-content] {
  background: linear-gradient(180deg, transparent 0 58%, color-mix(in srgb, var(--wb-surface) 58%, transparent) 100%) !important;
}

/* 详情面板半透明磨砂 */
[data-view-id=detail-panel] {
  background: color-mix(in srgb, var(--wb-surface) 64%, transparent) !important;
  backdrop-filter: blur(18px) saturate(1.08);
}

/* brand 文案（copy 为空时不显示） */
#root::before {
  position: fixed;
  z-index: 20;
  top: 60px;
  left: max(300px, 22vw);
  content: ${copy(manifest.copy?.brand)};
  color: var(--wb-accent);
  font: 800 clamp(16px, 2vw, 30px)/1.2 ui-rounded, system-ui;
  text-shadow: 0 2px 10px white;
  pointer-events: none;
}

/* headline 文案 */
#root::after {
  position: fixed;
  z-index: 20;
  top: 104px;
  left: max(300px, 22vw);
  max-width: 42vw;
  content: ${copy(manifest.copy?.headline)};
  color: var(--wb-text);
  font: 750 clamp(18px, 2.7vw, 42px)/1.15 ui-rounded, system-ui;
  text-shadow: 0 2px 12px white;
  pointer-events: none;
}`;
}

function buildCodexCss(manifest: any, heroDataUrl: string, colors: any): string {
  const isLight = isLightHex(colors.surface);
  const conversationSurface = isLight
    ? `color-mix(in srgb, ${colors.surface} 80%, transparent)`
    : `color-mix(in srgb, ${colors.surface} 76%, transparent)`;
  const userSurface = isLight
    ? `color-mix(in srgb, ${colors.accent} 16%, ${colors.surface})`
    : `color-mix(in srgb, ${colors.accent} 42%, ${colors.surface})`;
  const codeSurface = isLight ? '#172033' : `color-mix(in srgb, ${colors.surface} 62%, #000000)`;
  const codeText = '#f2f6ff';

  // Theme-specific variable overrides
  const themeVars = `/* DREAM_THEME:${manifest.id} */
:root.codex-dream-skin {
  --ds-bg: ${colors.surface};
  --ds-panel: ${colors.surface};
  --ds-panel-2: ${colors.surface};
  --ds-surface: ${colors.surface};
  --ds-green: ${colors.accent};
  --ds-lime: ${colors.secondary};
  --ds-cyan: ${colors.secondary};
  --ds-purple: ${colors.accent};
  --ds-text: ${colors.text};
  --ds-muted: color-mix(in srgb, ${colors.text} 82%, transparent);
  --ds-line: color-mix(in srgb, ${colors.accent} 22%, transparent);
  --ds-hero-height: 252px;
  --ds-radius: 24px;
  --dream-skin-art: url(${JSON.stringify(heroDataUrl)});
}`;

  // Keep the artwork on Codex's right-hand main surface. The body remains a
  // solid shell so the sidebar and window chrome do not inherit the wallpaper.
  const bodyArt = `/* DREAM_THEME_BODY:${manifest.id} */
html.codex-dream-skin body {
  background-color: ${colors.surface} !important;
  background-image: none !important;
}

html.codex-dream-skin main.main-surface {
  position: relative !important;
  isolation: isolate !important;
  background-color: ${colors.surface} !important;
  background-image: none !important;
}

html.codex-dream-skin main.main-surface::before {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  z-index: -1 !important;
  pointer-events: none !important;
  background-color: ${colors.surface} !important;
  background-image: var(--dream-skin-art) !important;
  background-position: center center !important;
  background-size: cover !important;
  background-repeat: no-repeat !important;
  opacity: 1 !important;
}

html.codex-dream-skin main.main-surface > header.app-header-tint {
  background: color-mix(in srgb, ${colors.surface} 66%, transparent) !important;
  backdrop-filter: blur(14px) saturate(108%) !important;
}

html.codex-dream-skin main.main-surface [role="main"],
html.codex-dream-skin main.main-surface .thread-scroll-container {
  --color-token-conversation-body: ${colors.text} !important;
  --color-token-text-secondary: color-mix(in srgb, ${colors.text} 76%, transparent) !important;
  --color-token-text-tertiary: color-mix(in srgb, ${colors.text} 58%, transparent) !important;
  --color-token-conversation-summary-leading: color-mix(in srgb, ${colors.text} 88%, transparent) !important;
  --color-token-conversation-summary-trailing: color-mix(in srgb, ${colors.text} 68%, transparent) !important;
  --color-token-conversation-header: color-mix(in srgb, ${colors.text} 78%, transparent) !important;
  --color-token-description-foreground: color-mix(in srgb, ${colors.text} 72%, transparent) !important;
  --shimmer-text-secondary: color-mix(in srgb, ${colors.text} 68%, transparent) !important;
  --shimmer-contrast: ${colors.text} !important;
  background-color: transparent !important;
  color: ${colors.text} !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) {
  background-color: transparent !important;
  background-image: none !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) article,
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) .message,
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [data-message-author-role],
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [class*="surface"]:not(.composer-surface-chrome):not([class*="home-main-content"]) {
  border-color: color-mix(in srgb, ${colors.accent} 24%, transparent) !important;
  background: ${conversationSurface} !important;
  color: ${colors.text} !important;
  text-shadow: none !important;
  backdrop-filter: blur(18px) saturate(108%) !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [data-message-author-role="user"],
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell) [class*="bg-token-foreground"] {
  background: ${userSurface} !important;
  color: ${colors.text} !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container [class*="_markdownContent_"],
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container [class*="_markdownContent_"] :where(p, li, h1, h2, h3, h4, h5, h6, strong, em, blockquote, span),
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container :where(.text-token-conversation-body, .text-token-text-secondary, .group\/activity-header),
html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container .group\/activity-header :where(span, svg) {
  color: ${colors.text} !important;
  text-shadow: none !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container :where(
    article,
    article *,
    .message,
    .message *,
    [data-message-author-role],
    [data-message-author-role] *
  ) {
  color: ${colors.text} !important;
  text-shadow: none !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container * {
  color: ${colors.text} !important;
}

html.codex-dream-skin main.main-surface:not(.dream-skin-home-shell)
  .thread-scroll-container [class*="_markdownContent_"] a {
  color: ${colors.accent} !important;
}

html.codex-dream-skin .composer-surface-chrome {
  background: color-mix(in srgb, ${colors.surface} 82%, transparent) !important;
  color: ${colors.text} !important;
}

html.codex-dream-skin .composer-surface-chrome *,
html.codex-dream-skin .composer-surface-chrome .ProseMirror {
  color: ${colors.text} !important;
  caret-color: ${colors.accent} !important;
}

html.codex-dream-skin main.main-surface pre,
html.codex-dream-skin main.main-surface code,
html.codex-dream-skin main.main-surface table,
html.codex-dream-skin main.main-surface [data-testid*="code"] {
  background: ${codeSurface} !important;
  color: ${codeText} !important;
  text-shadow: none !important;
}

html.codex-dream-skin main.main-surface :where(pre, code, table) * {
  color: ${codeText} !important;
}

/* The main surface already owns the full artwork; avoid a second hero image. */
html.codex-dream-skin .dream-skin-home > div:first-child > div:first-child > div:first-child {
  background-image: none !important;
  background-color: transparent !important;
}

/* Codex new-task home: remove the full-page wash while keeping cards readable. */
html.codex-dream-skin main.main-surface.dream-skin-home-shell,
html.codex-dream-skin main.main-surface.dream-skin-home-shell > div,
html.codex-dream-skin .dream-skin-home,
html.codex-dream-skin .dream-skin-home > div {
  background-color: transparent !important;
  background-image: none !important;
}
html.codex-dream-skin .dream-skin-home :where([class*="bg-token-main-surface"], [class*="from-token-main-surface"], [class*="via-token-main-surface"]) {
  background-color: transparent !important;
  background-image: none !important;
}
html.codex-dream-skin main.main-surface [class*="container-name:home-main-content"] {
  background-color: transparent !important;
  background-image: none !important;
  backdrop-filter: none !important;
}
html.codex-dream-skin .dream-skin-home .composer-surface-chrome {
  background-color: color-mix(in srgb, ${colors.surface} 72%, transparent) !important;
  backdrop-filter: blur(14px) saturate(106%) !important;
}`;

  return themeVars + '\n' + bodyArt;
}

function isLightHex(hex: string): boolean {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match) return true;
  const value = parseInt(match[1], 16);
  return (0.299 * ((value >> 16) & 255) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)) > 140;
}

function buildWorkBuddyMenuScript(options: {
  styleId: string;
  menuId: string;
  currentThemeId: string;
  themes: Array<{ id: string; name: string; css: string; surface: string; accent: string }>;
  cssTemplate: string;
  sharedCustomThemes: any[];
  sharedCustomThemeService: { endpoint: string; usageEndpoint: string; token: string };
}): string {
  const payload = JSON.stringify({
    styleId: options.styleId,
    menuId: options.menuId,
    activeId: options.currentThemeId,
    themes: options.themes,
    cssTemplate: options.cssTemplate,
    sentinels: WORKBUDDY_CSS_PLACEHOLDERS,
    storageKey: 'dreamCustomThemes',
    selectedKey: 'wb-dream-selected',
    sharedCustomThemes: options.sharedCustomThemes,
    sharedCustomThemeService: options.sharedCustomThemeService,
  });

  return `(() => {
  const data = ${payload};
  const recordPresetUsage = (themeId) => fetch(data.sharedCustomThemeService.usageEndpoint, {
    method: "POST",
    headers: { Authorization: "Bearer " + data.sharedCustomThemeService.token, "Content-Type": "application/json" },
    body: JSON.stringify({ appId: "workbuddy", themeId }),
  }).catch(() => {});
  const themeBlobUrls = new Map();
  const materializeCss = (css, cacheKey) => {
    const dataUrl = css.match(new RegExp('data:image/(?:png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+'))?.[0];
    if (!dataUrl) return css;
    let blobUrl = themeBlobUrls.get(cacheKey);
    if (!blobUrl) {
      const [header, encoded] = dataUrl.split(',', 2);
      const mime = header.slice(5, header.indexOf(';'));
      const binary = atob(encoded);
      const bytes = new Uint8Array(binary.length);
      for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
      blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
      themeBlobUrls.set(cacheKey, blobUrl);
    }
    return css.split(dataUrl).join(blobUrl);
  };
  let style = document.getElementById(data.styleId);
  if (!style) {
    style = document.createElement("style");
    style.id = data.styleId;
    document.head.appendChild(style);
  }

  document.getElementById(data.menuId)?.remove();
  const root = document.createElement("div");
  root.id = data.menuId;
  root.style.cssText = "position:fixed;bottom:16px;right:16px;z-index:2147483000;font:500 13px/1.4 system-ui;user-select:none;";

  const button = document.createElement("button");
  button.type = "button";
  button.title = "WorkBuddy 主题切换";
  button.textContent = "◉";
  button.style.cssText = "margin-left:auto;width:36px;height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.92);backdrop-filter:blur(10px);box-shadow:0 3px 12px rgba(0,0,0,.2);cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;color:#17344f;font-size:18px;line-height:1;";

  const panel = document.createElement("div");
  panel.style.cssText = "display:none;margin-bottom:8px;min-width:200px;padding:6px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:rgba(255,255,255,.94);backdrop-filter:blur(16px);box-shadow:0 10px 30px rgba(0,0,0,.18);color:#17344f;";

  const rows = new Map();
  const paint = (id) => {
    for (const [rowId, item] of rows) {
      item.style.background = rowId === id ? "rgba(36,201,215,.16)" : "transparent";
      item.style.fontWeight = rowId === id ? "700" : "500";
    }
  };
  const row = (label, dotColor, onPick, before) => {
    const item = document.createElement("div");
    item.style.cssText = "display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;";
    const dot = document.createElement("span");
    dot.style.cssText = "width:10px;height:10px;border-radius:50%;flex:none;background:" + dotColor + ";";
    const text = document.createElement("span");
    text.textContent = label;
    item.append(dot, text);
    item.addEventListener("mouseenter", () => { if (item.style.fontWeight !== "700") item.style.background = "rgba(0,0,0,.05)"; });
    item.addEventListener("mouseleave", () => paint(document.documentElement.dataset.dreamTheme ?? null));
    item.addEventListener("click", () => onPick(item));
    if (before) panel.insertBefore(item, before); else panel.appendChild(item);
    return item;
  };

  const isLightSurface = (hex) => {
    const match = /^#([0-9a-f]{6})$/i.exec(hex || "");
    if (!match) return true;
    const value = parseInt(match[1], 16);
    return (0.299 * ((value >> 16) & 255) + 0.587 * ((value >> 8) & 255) + 0.114 * (value & 255)) > 140;
  };
  const applyMode = (surface) => {
    const dark = !isLightSurface(surface);
    const body = document.body;
    const html = document.documentElement;
    html.dataset.dreamShell = dark ? "dark" : "light";
    body.dataset.vscodeThemeKind = dark ? "vscode-dark" : "vscode-light";
    body.dataset.vscodeThemeName = dark ? "IDE Dark" : "IDE Light";
    html.style.colorScheme = dark ? "dark" : "light";
    ["light", "vscode-light", "cb-light", "dark", "vscode-dark", "cb-dark"].forEach((className) => {
      const darkClass = className === "dark" || className === "vscode-dark" || className === "cb-dark";
      body.classList.toggle(className, dark ? darkClass : !darkClass);
      html.classList.toggle(className, dark ? darkClass : !darkClass);
    });
  };
  const setTheme = (id) => {
    const theme = data.themes.find((candidate) => candidate.id === id);
    if (!theme) return;
    style.textContent = materializeCss(theme.css, theme.id);
    document.documentElement.dataset.dreamTheme = theme.id;
    try { localStorage.setItem(data.selectedKey, theme.id); } catch {}
    applyMode(theme.surface);
    paint(theme.id);
  };
  const clearTheme = () => {
    style.textContent = "";
    delete document.documentElement.dataset.dreamTheme;
    try { localStorage.removeItem(data.selectedKey); } catch {}
    applyMode("#ffffff");
    paint(null);
  };

  for (const theme of data.themes) {
    const item = row(theme.name, theme.accent, () => { setTheme(theme.id); void recordPresetUsage(theme.id); panel.style.display = "none"; });
    item.dataset.dreamThemeId = theme.id;
    rows.set(theme.id, item);
  }

  const buildCustomCss = (dataUrl, colors, customId) => data.cssTemplate
    .split(data.sentinels.hero).join(dataUrl)
    .split(data.sentinels.accent).join(colors.accent)
    .split(data.sentinels.secondary).join(colors.secondary)
    .split(data.sentinels.surface).join(colors.surface)
    .split(data.sentinels.text).join(colors.text)
    .split(data.sentinels.id).join(customId);
  const hex = (r, g, b) => "#" + [r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, amount) => a.map((value, index) => value + (b[index] - value) * amount);
  const extractPalette = (canvas) => {
    const context = canvas.getContext("2d");
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    const buckets = new Map();
    let luminanceSum = 0;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      luminanceSum += luminance;
      count += 1;
      const saturation = max === 0 ? 0 : (max - min) / max;
      if (saturation < 0.18 || luminance < 24 || luminance > 245) continue;
      const delta = max - min || 1;
      let hue = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      const bucket = (Math.round(hue) % 6) * 2 + (saturation > 0.55 ? 1 : 0);
      const entry = buckets.get(bucket) ?? { weight: 0, r: 0, g: 0, b: 0, hue: hue * 60 };
      const weight = saturation * saturation;
      entry.weight += weight;
      entry.r += r * weight;
      entry.g += g * weight;
      entry.b += b * weight;
      buckets.set(bucket, entry);
    }
    const averageLuminance = count ? luminanceSum / count : 128;
    const ranked = [...buckets.values()].sort((left, right) => right.weight - left.weight)
      .map((entry) => ({ rgb: [entry.r / entry.weight, entry.g / entry.weight, entry.b / entry.weight], hue: entry.hue }));
    const accent = ranked[0]?.rgb ?? [36, 201, 215];
    const secondary = ranked.find((entry) => Math.abs(entry.hue - (ranked[0]?.hue ?? 0)) > 50)?.rgb ?? mix(accent, [255, 255, 255], 0.35);
    const light = averageLuminance > 128;
    return {
      accent: hex(...accent),
      secondary: hex(...secondary),
      surface: hex(...(light ? mix(accent, [252, 252, 255], 0.92) : mix(accent, [12, 12, 18], 0.86))),
      text: hex(...(light ? mix(accent, [16, 24, 40], 0.82) : mix(accent, [244, 246, 252], 0.85))),
    };
  };

  const MAX_CUSTOM = 5;
  const customRows = new Map();
  const loadCustoms = () => {
    try {
      const themes = JSON.parse(localStorage.getItem(data.storageKey) ?? "[]");
      return Array.isArray(themes) ? themes.filter((theme) => theme && theme.dataUrl && theme.colors).slice(0, MAX_CUSTOM) : [];
    } catch { return []; }
  };
  const writeLocalCustoms = (themes) => {
    try { localStorage.setItem(data.storageKey, JSON.stringify(themes.slice(0, MAX_CUSTOM))); }
    catch (error) { console.warn("Dream Theme: 自定义图片本地缓存失败", error); }
  };
  const syncSharedCustoms = (themes) => fetch(data.sharedCustomThemeService.endpoint, {
    method: "PUT",
    headers: { Authorization: "Bearer " + data.sharedCustomThemeService.token, "Content-Type": "application/json" },
    body: JSON.stringify(themes.slice(0, MAX_CUSTOM)),
  }).then((response) => {
    if (!response.ok) throw new Error("共享图片同步失败: HTTP " + response.status);
    return response.json();
  });
  const saveCustoms = (themes) => {
    const limited = themes.slice(0, MAX_CUSTOM);
    writeLocalCustoms(limited);
    return syncSharedCustoms(limited).catch((error) => {
      console.warn("Dream Theme: 共享图片同步失败", error);
      return limited;
    });
  };
  const localCustomThemes = loadCustoms();
  const initialCustomThemes = data.sharedCustomThemes.length > 0 ? data.sharedCustomThemes : localCustomThemes;
  writeLocalCustoms(initialCustomThemes);
  if (data.sharedCustomThemes.length === 0 && localCustomThemes.length > 0) void saveCustoms(localCustomThemes);
  const applyCustomTheme = (slot) => {
    style.textContent = materializeCss(buildCustomCss(slot.dataUrl, slot.colors, slot.id), slot.id);
    document.documentElement.dataset.dreamTheme = slot.id;
    try { localStorage.removeItem(data.selectedKey); } catch {}
    applyMode(slot.colors.surface);
    ensureCustomRow(slot);
    paint(slot.id);
  };
  const deleteCustom = async (slotId) => {
    const themes = loadCustoms();
    const index = themes.findIndex((theme) => theme.id === slotId);
    if (index < 0) return;
    if (document.documentElement.dataset.dreamTheme === slotId) clearTheme();
    themes.splice(index, 1);
    await saveCustoms(themes);
    customRows.get(slotId)?.remove();
    customRows.delete(slotId);
    rows.delete(slotId);
  };
  const ensureCustomRow = (slot) => {
    const existing = customRows.get(slot.id);
    if (existing) {
      existing.querySelector("span + span").textContent = slot.name;
      existing.firstChild.style.background = slot.colors.accent;
      return;
    }
    const item = row(slot.name, slot.colors.accent, () => {
      const current = loadCustoms().find((theme) => theme.id === slot.id) ?? slot;
      applyCustomTheme(current);
      panel.style.display = "none";
    }, uploadRow);
    item.dataset.dreamThemeId = slot.id;
    const text = item.querySelector("span + span");
    text.style.cssText = "flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;";
    const remove = document.createElement("span");
    remove.textContent = "×";
    remove.title = "删除这张自定义图片";
    remove.style.cssText = "flex:none;width:18px;height:18px;line-height:18px;text-align:center;border-radius:50%;color:rgba(0,0,0,.45);font-size:14px;";
    remove.addEventListener("mouseenter", () => { remove.style.background = "rgba(220,60,60,.15)"; remove.style.color = "#c03030"; });
    remove.addEventListener("mouseleave", () => { remove.style.background = "transparent"; remove.style.color = "rgba(0,0,0,.45)"; });
    remove.addEventListener("click", (event) => { event.stopPropagation(); deleteCustom(slot.id); });
    item.appendChild(remove);
    customRows.set(slot.id, item);
    rows.set(slot.id, item);
  };

  const importFromDataUrl = (dataUrl, name) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = async () => {
      const scale = Math.min(1, 1600 / image.width);
      const full = document.createElement("canvas");
      full.width = Math.round(image.width * scale);
      full.height = Math.round(image.height * scale);
      full.getContext("2d").drawImage(image, 0, 0, full.width, full.height);
      const sample = document.createElement("canvas");
      sample.width = 48;
      sample.height = Math.max(1, Math.round(48 * image.height / image.width));
      sample.getContext("2d").drawImage(image, 0, 0, sample.width, sample.height);
      const colors = extractPalette(sample);
      const compressed = full.toDataURL("image/webp", 0.8);
      const themes = loadCustoms();
      let slot;
      if (themes.length < MAX_CUSTOM) {
        slot = { id: "custom-upload-" + Date.now().toString(36), name: name || "我的图片", dataUrl: compressed, colors };
        themes.push(slot);
      } else {
        const activeId = document.documentElement.dataset.dreamTheme;
        let index = themes.findIndex((theme) => theme.id === activeId);
        if (index < 0) index = 0;
        slot = { id: themes[index].id, name: name || "我的图片", dataUrl: compressed, colors };
        themes[index] = slot;
      }
      await saveCustoms(themes);
      applyCustomTheme(slot);
      resolve(colors);
    };
    image.onerror = () => reject(new Error("图片读取失败"));
    image.src = dataUrl;
  });

  const picker = document.createElement("input");
  picker.type = "file";
  picker.accept = "image/png,image/jpeg,image/webp";
  picker.style.display = "none";
  picker.addEventListener("change", () => {
    const file = picker.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importFromDataUrl(reader.result, file.name.replace(/\\.[a-z0-9]+$/i, ""));
    reader.readAsDataURL(file);
    picker.value = "";
    panel.style.display = "none";
  });

  const uploadRow = row("＋ 自定义图片", "rgba(36,201,215,.9)", () => picker.click());
  uploadRow.style.borderTop = "1px solid rgba(0,0,0,.08)";
  const native = row("还原主题", "rgba(0,0,0,.24)", () => { clearTheme(); panel.style.display = "none"; });
  rows.set(null, native);
  initialCustomThemes.forEach(ensureCustomRow);
  fetch(data.sharedCustomThemeService.endpoint, {
    headers: { Authorization: "Bearer " + data.sharedCustomThemeService.token },
  }).then((response) => response.ok ? response.json() : Promise.reject(new Error("HTTP " + response.status)))
    .then((latest) => {
      if (!Array.isArray(latest)) return;
      for (const slotId of [...customRows.keys()]) {
        if (!latest.some((item) => item.id === slotId)) {
          customRows.get(slotId)?.remove();
          customRows.delete(slotId);
          rows.delete(slotId);
        }
      }
      writeLocalCustoms(latest);
      latest.forEach(ensureCustomRow);
    }).catch((error) => console.warn("Dream Theme: 共享图片读取失败", error));

  button.addEventListener("click", () => { panel.style.display = panel.style.display === "none" ? "block" : "none"; });
  const closeOnOutsideClick = (event) => {
    if (panel.style.display === "none" || root.contains(event.target)) return;
    panel.style.display = "none";
  };
  if (window.__dreamWorkOutsideClick) {
    document.removeEventListener("pointerdown", window.__dreamWorkOutsideClick, true);
  }
  window.__dreamWorkOutsideClick = closeOnOutsideClick;
  document.addEventListener("pointerdown", closeOnOutsideClick, true);
  root.append(panel, button, picker);
  document.body.appendChild(root);

  setTheme(data.activeId);

  window.__dreamTheme = { importFromDataUrl, setTheme, clearTheme, deleteCustom };
  return true;
})()`;
}

export function buildMenuScript(options: {
  styleId: string;
  menuId: string;
  currentThemeId: string;
  themes: Array<{ id: string; name: string; css: string; surface: string; accent?: string; videoUrl?: string }>;
  appId: string;
  cssTemplate?: string;
  surfaceAlphas?: number[];
  sharedCustomThemes: any[];
  sharedCustomThemeService: { endpoint: string; usageEndpoint: string; token: string };
  petGifs?: Record<string, string>;
  pets?: PetDef[];
}): string {
  const themesJson = JSON.stringify(options.themes);
  const cssTemplate = JSON.stringify(options.cssTemplate ?? '');
  const appId = options.appId;
  const surfaceAlphas = options.surfaceAlphas ?? DEFAULT_SURFACE_ALPHAS;
  return `(() => {
  const themes = ${themesJson};
  const cssTemplate = ${cssTemplate};
  const sentinels = ${JSON.stringify(WORKBUDDY_CSS_PLACEHOLDERS)};
  const surfaceAlphas = ${JSON.stringify(surfaceAlphas)};
  const currentThemeId = '${options.currentThemeId}';
  const appId = '${appId}';
  const pets = ${JSON.stringify(options.pets ?? [])};
  const hasPet = pets.length > 0 && appId === 'zcode';   // 桌面宠物（按任务状态切换 GIF）
  const customStorageKey = 'dreamCodexCustomThemes';
  const sharedCustomThemes = ${JSON.stringify(options.sharedCustomThemes)};
  const sharedCustomThemeService = ${JSON.stringify(options.sharedCustomThemeService)};
  const recordPresetUsage = (themeId) => fetch(sharedCustomThemeService.usageEndpoint, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ appId, themeId }),
  }).catch(() => {});
  const themeBlobUrls = new Map();
  const isBase64Char = (code) => (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122) || code === 43 || code === 47 || code === 61;
  // 不用正则提取 data URL：大体积 hero（10MB+ base64）会让旧版 V8 的正则
  // 回溯栈溢出（RangeError: Maximum call stack size exceeded）。
  // CSS 可能同时含多个 data URL（如流光角饰的 URL 编码 SVG 在 hero 之前），
  // 必须逐个按各自边界提取：head/comma/end 三段都必须落在同一个 URL 内，
  // 否则跨 URL 拼接会让 atob 拿到乱码直接 InvalidCharacterError。
  const materializeCss = (css, cacheKey) => {
    if (css.indexOf('data:image/') < 0) return css;
    const chunks = [];
    let pos = 0;
    for (;;) {
      const head = css.indexOf('data:image/', pos);
      if (head < 0) break;
      const comma = css.indexOf(',', head);
      if (comma < 0) break;
      const header = css.slice(head, comma);
      const isBase64Url = /;base64$/.test(header);
      let end = comma + 1;
      if (isBase64Url) {
        while (end < css.length && isBase64Char(css.charCodeAt(end))) end++;
      } else {
        while (end < css.length) {
          const code = css.charCodeAt(end);
          if (code === 34 || code === 39 || code === 41 || code === 32 || code === 10) break;
          end++;
        }
      }
      const dataUrl = css.slice(head, end);
      if (isBase64Url && dataUrl.length > 4096) {
        let blobUrl = themeBlobUrls.get(cacheKey + ':' + head);
        if (!blobUrl) {
          const mime = header.slice(5, header.indexOf(';'));
          const binary = atob(css.slice(comma + 1, end));
          const bytes = new Uint8Array(binary.length);
          for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
          blobUrl = URL.createObjectURL(new Blob([bytes], { type: mime }));
          themeBlobUrls.set(cacheKey + ':' + head, blobUrl);
        }
        chunks.push(css.slice(pos, head), blobUrl);
      } else {
        chunks.push(css.slice(pos, end));
      }
      pos = end;
    }
    chunks.push(css.slice(pos));
    return chunks.join('');
  };

  const isLightSurface = (hex) => {
    const m = /^#([0-9a-f]{6})$/i.exec(hex || "");
    if (!m) return true;
    const v = parseInt(m[1], 16);
    return (0.299 * ((v >> 16) & 255) + 0.587 * ((v >> 8) & 255) + 0.114 * (v & 255)) > 140;
  };
  const applyMode = (surface) => {
    const dark = !isLightSurface(surface);
    const body = document.body;
    const html = document.documentElement;
    html.dataset.dreamShell = dark ? "dark" : "light";
    body.dataset.vscodeThemeKind = dark ? "vscode-dark" : "vscode-light";
    body.dataset.vscodeThemeName = dark ? "IDE Dark" : "IDE Light";
    html.style.colorScheme = dark ? "dark" : "light";
    ["light", "vscode-light", "cb-light", "dark", "vscode-dark", "cb-dark"].forEach((cls) => {
      const isDarkCls = cls === "dark" || cls === "vscode-dark" || cls === "cb-dark";
      body.classList.toggle(cls, dark ? isDarkCls : !isDarkCls);
      html.classList.toggle(cls, dark ? isDarkCls : !isDarkCls);
    });
  };

  /* ZCode 动态视频背景（预设主题 video 字段）：幂等管理 fixed 视频层。
     菜单脚本被 watcher 周期重注入，src 未变化时绝不重建/重载，避免播放反复归零；
     视频出错回退层底图（hero），页面隐藏暂停省电，prefers-reduced-motion 不建层。 */
  const applyVideoLayer = (videoUrl) => {
    const layerId = 'dream-work-video-layer';
    let layer = document.getElementById(layerId);
    if (!videoUrl || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      if (layer) layer.remove();
      delete window.__dreamWorkVideoSrc;
      return;
    }
    if (!layer) {
      layer = document.createElement('div');
      layer.id = layerId;
      const video = document.createElement('video');
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.setAttribute('playsinline', '');
      video.preload = 'auto';
      video.addEventListener('error', () => { layer.dataset.motionError = 'true'; });
      video.addEventListener('canplay', () => { if (layer.dataset.motionError) delete layer.dataset.motionError; });
      layer.appendChild(video);
    }
    if (!layer.isConnected) document.body.appendChild(layer);
    const video = layer.querySelector('video');
    if (window.__dreamWorkVideoSrc !== videoUrl) {
      window.__dreamWorkVideoSrc = videoUrl;
      if (layer.dataset.motionError) delete layer.dataset.motionError;
      video.src = videoUrl;
      video.load();
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => {});
    } else if (video.paused && !document.hidden) {
      const playing = video.play();
      if (playing && playing.catch) playing.catch(() => {});
    }
  };
  if (!window.__dreamWorkVideoVisibility) {
    window.__dreamWorkVideoVisibility = true;
    document.addEventListener('visibilitychange', () => {
      const video = document.querySelector('#dream-work-video-layer video');
      if (!video) return;
      if (document.hidden) video.pause();
      else { const playing = video.play(); if (playing && playing.catch) playing.catch(() => {}); }
    });
  }

  const style = document.getElementById('${options.styleId}');
  if (!style) {
    const s = document.createElement('style');
    s.id = '${options.styleId}';
    document.head.appendChild(s);
    window.__dreamWorkThemeStyle = s;
  } else {
    window.__dreamWorkThemeStyle = style;
  }

  const applyTheme = (themeId) => {
    const theme = themes.find(t => t.id === themeId);
    if (!theme) return;
    window.__dreamWorkThemeStyle.textContent = materializeCss(theme.css, theme.id);
    document.documentElement.dataset.dreamTheme = themeId;
    if (appId !== 'hana-agent') applyMode(theme.surface);
    if (appId === 'zcode') applyVideoLayer(theme.videoUrl);
    
    // Codex themes require the codex-dream-skin class on <html> for CSS selectors to match
    if (appId === 'codex') {
      document.documentElement.classList.add('codex-dream-skin');
      const shellMain = document.querySelector('main.main-surface') || document.querySelector('main');
      if (shellMain) {
        const homeCandidate = (shellMain.matches('[role="main"]') ? shellMain : shellMain.querySelector('[role="main"]')) ||
          shellMain.querySelector('[class*="home-main-content"], [class*="container-name:home-main-content"]');
        if (homeCandidate) {
          const hasGameSource = homeCandidate.querySelector('[data-feature="game-source"]');
          const hasSuggestions = homeCandidate.querySelector('[class*="group/home-suggestions"]');
          const hasTaskContent = homeCandidate.querySelector('.thread-scroll-container, [data-message-author-role], article, .message');
          const isHomeContainer = homeCandidate.matches('[class*="home-main-content"], [class*="container-name:home-main-content"]');
          if ((hasGameSource || hasSuggestions || isHomeContainer) && !hasTaskContent) {
            homeCandidate.classList.add('dream-skin-home');
            shellMain.classList.add('dream-skin-home-shell');
          } else {
            shellMain.classList.remove('dream-skin-home-shell');
          }
        }
      }
    }
    
    const rows = root.querySelectorAll('.dream-theme-row');
    rows.forEach(row => {
      const id = row.dataset.themeId;
      row.style.background = id === themeId ? 'rgba(36,201,215,.16)' : 'transparent';
      row.style.fontWeight = id === themeId ? '700' : '500';
    });
  };

  const restoreNative = () => {
    window.__dreamWorkThemeStyle.textContent = '';
    delete document.documentElement.dataset.dreamTheme;
    if (appId !== 'hana-agent') applyMode('#ffffff');
    if (appId === 'zcode') applyVideoLayer(null);
    if (appId === 'codex') {
      document.documentElement.classList.remove('codex-dream-skin');
      delete document.documentElement.dataset.dreamShell;
    }
    panel.style.display = 'none';
  };

  document.getElementById('${options.menuId}-host')?.remove();
  document.getElementById('${options.menuId}')?.remove();
  if (window.__dreamWorkOutsideClick) {
    document.removeEventListener('pointerdown', window.__dreamWorkOutsideClick, true);
    delete window.__dreamWorkOutsideClick;
  }

  const host = document.createElement('div');
  host.id = '${options.menuId}-host';
  host.style.cssText = "all:initial!important;position:fixed!important;right:16px!important;bottom:16px!important;z-index:2147483647!important;display:block!important;visibility:visible!important;opacity:1!important;pointer-events:auto!important;width:fit-content!important;height:fit-content!important;transform:none!important;filter:none!important;contain:none!important;isolation:isolate!important;";
  const mount = host.attachShadow({ mode: 'open' });

  const root = document.createElement('div');
  root.id = '${options.menuId}';
  root.style.cssText = "position:relative;display:flex;flex-direction:column;align-items:flex-end;font:500 13px/1.4 system-ui;user-select:none;color-scheme:light;pointer-events:auto;color:#17344f!important;";

  const button = document.createElement('button');
  button.type = 'button';
  button.title = 'Dream Work Theme';
  button.textContent = '◉';
  button.style.cssText = "margin-left:auto;width:36px;height:36px;border-radius:10px;border:1px solid rgba(0,0,0,.12);background:rgba(255,255,255,.92);backdrop-filter:blur(10px);box-shadow:0 3px 12px rgba(0,0,0,.2);cursor:pointer;padding:0;display:flex;align-items:center;justify-content:center;color:#17344f;font-size:18px;line-height:1;";

  /* 任务宠物（ZCode）：独立于换肤按钮的浮层精灵，GIF 随当前会话任务状态切换——
   * 等待确认(waiting) > 运行中(工具在跑：沿输入框上边框左右跑动，running-left/right/running 交替)
   * > 思考(模型在飞：review) > 任务失败(failed，8s) > 任务完成(jumping，5s) > 空闲
   * (idle/look-left-side/look-right-side 每 3-5s 交替，每 5 轮插一次 waving)。
   * 位置：底边对齐 .chat-composer-region 上边框（输入框上沿），跑动范围 = 输入框左右缘；
   * pointer-events:none 纯装饰不挡点击；输入框不在（设置页等）时隐藏。换肤按钮保持原样。
   * 状态来源 = 用量泵 payload（document 'dream-usage' 事件，实时任务状态 live）+ 本地 DOM
   * 信号（侧栏当前任务项"等待确认"标签，含 agent 提问；对话区确认卡兜底）。 */
  if (hasPet) {
    (function () {
      clearInterval(window.__dreamWorkPetTimer);   // 重注入：旧实例计时器停表
      document.getElementById('${options.menuId}-pet-host')?.remove();
      const PET_SRC_W = 192, PET_SRC_H = 208;   // 素材原始尺寸，按宠物 scale 缩放
      let PET_W = 96, PET_H = 104;
      const petHost = document.createElement('div');
      petHost.id = '${options.menuId}-pet-host';
      petHost.style.cssText = "all:initial!important;position:fixed!important;z-index:2147483640!important;display:block!important;pointer-events:none!important;width:fit-content!important;height:fit-content!important;contain:none!important;isolation:isolate!important;";
      const petMount = petHost.attachShadow({ mode: 'open' });
      const wrap = document.createElement('div');
      wrap.style.cssText = 'position:relative;line-height:0;';
      /* 落地阴影：静态椭圆（不依赖逐帧 alpha）——drop-shadow 滤镜会随 GIF 每帧轮廓重算，
       * 精灵一动影子就闪，已弃用 */
      const shadowEl = document.createElement('div');
      shadowEl.style.cssText = 'position:absolute;left:50%;bottom:1px;transform:translateX(-50%);width:58%;height:9px;border-radius:50%;background:radial-gradient(ellipse at center,rgba(0,0,0,.34) 0%,rgba(0,0,0,.16) 48%,transparent 74%);pointer-events:none;';
      const img = document.createElement('img');
      img.draggable = false;
      img.alt = '';
      img.style.cssText = 'position:relative;display:block;pointer-events:none;user-select:none;-webkit-user-select:none;';
      wrap.append(shadowEl, img);
      petMount.appendChild(wrap);
      document.documentElement.appendChild(petHost);
      const pos = { x: -1, y: 0 };
      let spanLeft = 0, spanRight = 0, edgeY = 0;
      let cur = '', target = null, pauseUntil = 0;
      /* 当前宠物：localStorage dreamPet.id（'none' = 不显示；空 = 默认第一只）。
       * 兼容旧开关 dreamPet.enabled='0' → 视为不显示。dream-pet 事件即时生效。 */
      const readPetSel = () => {
        try {
          const id = localStorage.getItem('dreamPet.id');
          if (id) return id;
          return localStorage.getItem('dreamPet.enabled') === '0' ? 'none' : '';
        } catch (e) { return ''; }
      };
      let activePet = null;
      const resolvePet = () => {
        const sel = readPetSel();
        if (sel === 'none') return null;
        for (let i = 0; i < pets.length; i++) if (pets[i].id === sel) return pets[i];
        return pets[0] || null;
      };
      const applyPet = () => {
        activePet = resolvePet();
        const sc = activePet && activePet.scale ? activePet.scale : 0.5;
        PET_W = Math.round(PET_SRC_W * sc);
        PET_H = Math.round(PET_SRC_H * sc);
        img.style.width = PET_W + 'px';
        img.style.height = PET_H + 'px';
        cur = '';   // 换宠物：状态键不变也要重挂新宠物的图
      };
      applyPet();
      /* 切换宠物：立即重挂新图——空闲轮换有最长 5s 节流，不重置 idleNextAt 会出现
       * "切了宠物要等好几秒才换" 的迟滞（cur='' 只保证下一次 setGif 会执行，
       * 但空闲分支要等轮换到点才会调 setGif） */
      document.addEventListener('dream-pet', () => { applyPet(); idleNextAt = 0; });
      let live = null, liveAt = 0;
      let idleNextAt = 0, idleIdx = 0, idleCount = 0, lastState = '';
      /* 回合结束的 DOM 边沿检测：停止生成按钮消失的那一刻立即进入完成态（不等泵推送，
       * 实测泵最快也要 1.5s）；若这段窗口内数据库随后报 failed（回合其实失败/被取消），
       * failed 判定优先于合成完成，宠物切到沮丧帧。切会话时复位，避免把上一个会话的
       * 完成带进新会话。 */
      let synthDoneUntil = 0, lastTurnActive = false, lastUseSid = '';
      /* 状态键 → 当前宠物的 GIF data URL；缺状态回退（跑步方向→running→idle，其余→idle） */
      const stateGif = (key) => {
        const s = activePet ? activePet.states : null;
        if (!s) return '';
        return s[key] || ((key === 'running-left' || key === 'running-right') ? (s.running || s.idle) : '') || s.idle || '';
      };
      const setGif = (name) => {
        const key = name === 'thinking' ? 'review' : name === 'done' ? 'jumping' : name;
        if (cur === key) return;
        cur = key;
        const url = stateGif(key);
        if (url) img.src = url;
        img.dataset.gif = key;   // 诊断/测试可读
      };
      const place = () => {
        /* petHost 的 all:initial!important 会把无 !important 的 left/top 一起重置，
         * 必须走 setProperty 带 important 才能生效 */
        petHost.style.setProperty('left', Math.round(pos.x) + 'px', 'important');
        petHost.style.setProperty('top', Math.round(pos.y) + 'px', 'important');
        img.dataset.petPos = Math.round(pos.x) + ',' + Math.round(pos.y);
      };
      /* 贴边定位：底边 = 输入框（.chat-composer-region）上边框，跑动范围 = 输入框左右缘。
       * 设置页等整页路由**不卸载会话 DOM、几何依旧有效**（工作区保活），必须叠加
       * checkVisibility（隐藏层同步返回 false）判定，否则宠物会跟着"保活"的输入框留在设置页。 */
      const trackEdge = () => {
        const region = document.querySelector('.chat-composer-region');
        if (!region) return false;
        try {
          if (typeof region.checkVisibility === 'function' &&
              !region.checkVisibility({ visibilityProperty: true, opacityProperty: true, contentVisibilityAuto: true })) return false;
        } catch (e) { }
        const r = region.getBoundingClientRect();
        if (r.width < 120 || r.height < 40) return false;
        edgeY = r.top - PET_H;
        spanLeft = r.left;
        spanRight = Math.max(r.left, r.right - PET_W);
        return true;
      };
      document.addEventListener('dream-usage', (e) => {
        const d = e && e.detail;
        if (!d) return;
        if (d.sid && lastUseSid && d.sid !== lastUseSid) synthDoneUntil = 0;   // 切会话：复位
        if (d.sid) lastUseSid = d.sid;
        live = d.live || null;
        liveAt = Date.now();
      });
      const domWaiting = () => {
        try {
          const li = document.querySelector('li[data-testid^=task-item-].bg-selected');
          if (li && li.textContent && li.textContent.indexOf('等待确认') >= 0) return true;
          const els = document.querySelectorAll('span, div, button');
          for (let i = 0; i < els.length; i++) {
            const el = els[i];
            if (el.children.length || (el.textContent || '').trim() !== '等待确认') continue;
            if (el.closest && el.closest('#sidebar')) continue;
            /* offsetParent 对 position:fixed 恒为 null，用 checkVisibility 判可见 */
            const vis = el.checkVisibility ? el.checkVisibility() : el.getClientRects().length > 0;
            if (vis) return true;
          }
        } catch (e) { }
        return false;
      };
      /* 回合进行中的 DOM 信号：输入框区域里的"停止生成"按钮（生成期间可见，回合结束隐藏）。
       * 数据库没有在飞模型请求的行（实测全库 0 条 running），"思考"只能由此判定：
       * 回合进行中且没有工具在跑 = 模型在思考/生成。 */
      const domTurnActive = () => {
        try {
          const region = document.querySelector('.chat-composer-region');
          if (!region) return false;
          const btns = region.querySelectorAll('button');
          for (let i = 0; i < btns.length; i++) {
            const b = btns[i];
            const label = (b.getAttribute('aria-label') || b.title || '').trim();
            if (!/停止|Stop/i.test(label)) continue;
            const vis = b.checkVisibility ? b.checkVisibility() : b.getClientRects().length > 0;
            if (vis) return true;
          }
        } catch (e) { }
        return false;
      };
      /* 工具在跑的 DOM 信号：会话里出现可见的"正在执行"标签（工具调用进行中）。
       * 数据库从来不落在飞行（全库 0 条 running），"运行中"过去只能靠 db → 实机从不触发，
       * 工具执行时宠物一直停在"思考"。此信号独立于 db/泵，任何时候都成立。 */
      const domToolRunning = () => {
        try {
          const els = document.querySelectorAll('span, div');
          for (let i = 0; i < els.length; i++) {
            const el = els[i];
            if (el.children.length) continue;
            if ((el.textContent || '').trim() !== '正在执行') continue;
            if (el.closest && el.closest('#sidebar')) continue;
            const vis = el.checkVisibility ? el.checkVisibility() : el.getClientRects().length > 0;
            if (vis) return true;
          }
        } catch (e) { }
        return false;
      };
      const pickState = (now, turnActive) => {
        if (domWaiting()) return 'waiting';
        if (live && now - liveAt < 150000) {
          if (live.state === 'waiting') return 'waiting';
          if (live.state === 'failed' && now - live.at < 12000) return 'failed';
          if (live.state === 'done' && now - live.at < 8000) return 'done';
        }
        /* 工具执行中沿输入框上边框跑动。要求回合在跑：否则残留的"正在执行"标签
           会压住紧随其后的完成跳跃（done 依赖回合边沿）。 */
        if (turnActive && domToolRunning()) return 'running';
        if (live && live.state === 'running') return 'running';
        if (turnActive) return 'thinking';
        if (now < synthDoneUntil) return 'done';   // DOM 边沿：回合刚结束，立即跳跃
        return 'idle';
      };
      const tick = () => {
        if (!petHost.isConnected) return;   // 旧实例：宿主已被重注入替换
        try {
          if (!activePet) { petHost.style.setProperty('display', 'none', 'important'); return; }
          const now = Date.now();
          const turnActive = domTurnActive();
          if (lastTurnActive && !turnActive) synthDoneUntil = now + 8000;   // 回合刚结束
          lastTurnActive = turnActive;
          const state = pickState(now, turnActive);
          if (!trackEdge()) {
            petHost.style.setProperty('display', 'none', 'important');   // 输入框不在（设置页等）
            return;
          }
          petHost.style.setProperty('display', 'block', 'important');
          if (pos.x < 0) pos.x = spanRight;   // 首次：从输入框右端起
          if (pos.x < spanLeft) pos.x = spanLeft;
          if (pos.x > spanRight) pos.x = spanRight;
          pos.y = edgeY;
          if (state === 'running') {
            if (pauseUntil && now < pauseUntil) {
              setGif('running');
            } else if (target === null) {
              target = spanLeft + Math.random() * (spanRight - spanLeft);   // 沿上边框随机选一个落点
            } else {
              const dx = target - pos.x;
              if (Math.abs(dx) < 4) {
                target = null;
                pauseUntil = now + 500 + Math.random() * 1000;
                setGif('running');
              } else {
                pos.x += Math.min(Math.abs(dx), 14) * (dx > 0 ? 1 : -1);   // ~115px/s @120ms
                setGif(dx > 2 ? 'running-right' : dx < -2 ? 'running-left' : 'running');
              }
            }
          } else if (state === 'idle') {
            target = null; pauseUntil = 0;
            if (lastState !== 'idle') idleNextAt = 0;   // 从其它状态回空闲：立即换回空闲帧，不等轮换节流
            if (now >= idleNextAt) {
              idleNextAt = now + 3000 + Math.random() * 2000;
              const seq = ['idle', 'look-left-side', 'look-right-side'];
              setGif(idleCount > 0 && idleCount % 5 === 0 ? 'waving' : seq[idleIdx % 3]);
              idleIdx++;
              idleCount++;
            }
          } else {
            target = null; pauseUntil = 0;
            setGif(state);
          }
          lastState = state;
          place();
        } catch (e) { }
      };
      if (trackEdge()) pos.x = spanRight;
      pos.y = Math.max(0, edgeY);
      setGif('idle');
      place();
      window.__dreamWorkPetTimer = setInterval(tick, 120);
    })();
  }

  /* 0.7.12：逐行对比守卫整体移除（裸行统一用主题文字色）。重注入不刷新页面时，
     旧实例的定时器与它写在行上的变量/属性会残留（定时器还会继续按帧采样视频），
     这里就地清干净。 */
  (() => {
    if (window.__dreamWorkRowGuardTimer) {
      clearInterval(window.__dreamWorkRowGuardTimer);
      window.__dreamWorkRowGuardTimer = 0;
    }
    try {
      const stale = document.querySelectorAll('[data-dream-row-pole]');
      for (let i = 0; i < stale.length; i++) {
        stale[i].removeAttribute('data-dream-row-pole');
        stale[i].removeAttribute('data-dream-row-lum');
        stale[i].removeAttribute('data-dream-row-at');
        stale[i].removeAttribute('data-dream-row-guard');
        stale[i].style.removeProperty('--dream-row-text');
      }
    } catch (e) { }
  })();

  const panel = document.createElement('div');
  panel.style.cssText = "display:none;margin-bottom:8px;min-width:200px;padding:6px;border-radius:12px;border:1px solid rgba(0,0,0,.1);background:rgba(255,255,255,.96);backdrop-filter:blur(16px);box-shadow:0 10px 30px rgba(0,0,0,.18);color:#17344f!important;-webkit-text-fill-color:#17344f!important;"; 

  /* 分类：皮肤（8 款常用预设 + 自定义 + 还原）与宠物各为折叠组，点击分类标签展开/收起，
   * 展开态存 localStorage（dreamMenu.cat），重注入后保持。 */
  const skinBox = document.createElement('div');
  const petBox = document.createElement('div');
  const catState = (() => { try { return JSON.parse(localStorage.getItem('dreamMenu.cat') || '{}') || {}; } catch (e) { return {}; } })();
  const saveCat = () => { try { localStorage.setItem('dreamMenu.cat', JSON.stringify(catState)); } catch (e) { } };
  const catRow = (label, key, box) => {
    const item = document.createElement('div');
    item.style.cssText = "display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;font-weight:700;color:#17344f!important;-webkit-text-fill-color:#17344f!important;";
    const caret = document.createElement('span');
    caret.style.cssText = "flex:none;width:12px;text-align:center;opacity:.65;font-size:11px;color:#17344f!important;-webkit-text-fill-color:#17344f!important;";
    const text = document.createElement('span');
    text.textContent = label;
    text.style.cssText = 'color:#17344f!important;-webkit-text-fill-color:#17344f!important;';
    item.append(caret, text);
    const sync = () => {
      const open = !!catState[key];
      caret.textContent = open ? '▾' : '▸';
      box.style.display = open ? 'block' : 'none';
    };
    item.addEventListener('mouseenter', () => { item.style.background = 'rgba(0,0,0,.05)'; });
    item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
    item.addEventListener('click', () => { catState[key] = !catState[key]; saveCat(); sync(); });
    sync();
    return item;
  };

  const row = (label, dotColor, onPick, before, container) => {
    const item = document.createElement('div');
    item.style.cssText = "display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;cursor:pointer;color:#17344f!important;-webkit-text-fill-color:#17344f!important;";
    const dot = document.createElement('span');
    dot.style.cssText = "width:10px;height:10px;border-radius:50%;flex:none;background:" + dotColor + ";";
    const text = document.createElement('span');
    text.textContent = label;
    text.style.cssText = 'color:#17344f!important;-webkit-text-fill-color:#17344f!important;';
    item.append(dot, text);
    item.addEventListener('mouseenter', () => { if (item.style.fontWeight !== '700') item.style.background = 'rgba(0,0,0,.05)'; });
    item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
    item.addEventListener('click', () => onPick(item));
    const host = container || skinBox;
    if (before) host.insertBefore(item, before); else host.appendChild(item);
    return item;
  };

  /* 背景亮暗（只作用于壁纸层）：视频主题走 #dream-work-video-layer 的 filter: brightness，
     静态主题走 main 背景里的 --dream-dim-veil 蒙版渐变；静态主题另有内层壁纸层会盖住蒙版，
     亮暗≠0 时临时摘除其 background-image、归零还原（改动只落在壁纸层，不碰文字/玻璃）。 */
  const BRIGHT_KEY = 'dreamBright';
  const brightVal = () => {
    const n = parseInt(localStorage.getItem(BRIGHT_KEY) || '0', 10);
    return isNaN(n) ? 0 : Math.max(-50, Math.min(50, n));
  };
  /* 亮暗只走两个纯壁纸通道：视频主题 = #dream-work-video-layer 的 filter: brightness，
     静态主题 = main 背景声明里的 --dream-dim-veil 蒙版渐变。**不改动任何内容元素的背景**
     （用户点名：命令行/文件路径/图标/元信息这些不能被亮暗影响）。 */
  const applyBright = () => {
    const v = brightVal();
    const root = document.documentElement;
    root.style.setProperty('--dream-dim-k', String(Math.max(0.35, 1 + v / 100)));
    const a = Math.min(0.8, (Math.abs(v) / 100) * 0.8);
    root.style.setProperty('--dream-dim-veil', v < 0 ? 'rgba(0,0,0,' + a.toFixed(3) + ')' : (v > 0 ? 'rgba(255,255,255,' + a.toFixed(3) + ')' : 'transparent'));
  };
  const brightRow = document.createElement('div');
  brightRow.style.cssText = 'display:flex;align-items:center;gap:8px;padding:7px 10px;border-radius:8px;color:#17344f!important;-webkit-text-fill-color:#17344f!important;';
  const brightLabel = document.createElement('span');
  brightLabel.textContent = '背景亮暗';
  brightLabel.style.cssText = 'flex:1 1 auto;color:#17344f!important;-webkit-text-fill-color:#17344f!important;';
  const mkBtn = (txt) => {
    const b = document.createElement('span');
    b.textContent = txt;
    b.style.cssText = 'flex:none;width:22px;height:22px;line-height:20px;text-align:center;border-radius:6px;border:1px solid rgba(0,0,0,.18);cursor:pointer;user-select:none;color:#17344f!important;-webkit-text-fill-color:#17344f!important;font-weight:700;';
    b.addEventListener('mouseenter', () => { b.style.background = 'rgba(0,0,0,.06)'; });
    b.addEventListener('mouseleave', () => { b.style.background = 'transparent'; });
    return b;
  };
  const brightValEl = document.createElement('span');
  brightValEl.style.cssText = 'flex:none;min-width:44px;text-align:right;color:#17344f!important;-webkit-text-fill-color:#17344f!important;';
  const bMinus = mkBtn('−');
  const bPlus = mkBtn('＋');
  const syncBright = () => { const v = brightVal(); brightValEl.textContent = (v > 0 ? '+' : '') + v + '%'; };
  const stepBright = (d) => (e) => {
    e.stopPropagation();
    localStorage.setItem(BRIGHT_KEY, String(Math.max(-50, Math.min(50, brightVal() + d))));
    applyBright();
    syncBright();
  };
  bMinus.addEventListener('click', stepBright(-5));
  bPlus.addEventListener('click', stepBright(5));
  brightRow.append(brightLabel, bMinus, brightValEl, bPlus);
  brightRow.dataset.dreamBright = '1';
  syncBright();
  applyBright();
  panel.appendChild(brightRow);

  panel.append(catRow('皮肤', 'skin', skinBox), skinBox);
  if (hasPet) {
    panel.append(catRow('宠物', 'pet', petBox), petBox);
    /* 宠物选择：一宠物一行 + 「不显示宠物」，✓ = 当前选中（dreamPet.id 持久化；
     * dream-pet 事件让宠物脚本即时切换/隐藏） */
    const petSel = () => {
      try {
        const id = localStorage.getItem('dreamPet.id');
        if (id) return id;
        return localStorage.getItem('dreamPet.enabled') === '0' ? 'none' : pets[0].id;
      } catch (e) { return pets[0].id; }
    };
    const petRows = [];
    const syncPetRows = () => {
      const sel = petSel();
      petRows.forEach(({ item, id }) => {
        const on = id === sel;
        item.style.opacity = on ? '1' : '.5';
        const mark = item.querySelector('.dream-pet-mark');
        if (mark) mark.textContent = on ? '✓' : '';
      });
    };
    const addPetRow = (id, label, dot) => {
      const item = row(label, dot, () => {
        try { localStorage.setItem('dreamPet.id', id); } catch (e) { }
        document.dispatchEvent(new CustomEvent('dream-pet'));
        syncPetRows();
      }, null, petBox);
      const mark = document.createElement('span');
      mark.className = 'dream-pet-mark';
      mark.style.cssText = 'margin-left:auto;flex:none;font-weight:700;color:#2a9d68!important;-webkit-text-fill-color:#2a9d68!important;';
      item.appendChild(mark);
      petRows.push({ item, id });
    };
    addPetRow('none', '不显示宠物', 'rgba(0,0,0,.24)');
    for (const petDef of pets) addPetRow(petDef.id, petDef.name, '#e2557a');
    syncPetRows();
  }

  for (const theme of themes) {
    const item = row(theme.name, theme.accent || '#24c9d7', () => {
      applyTheme(theme.id);
      void recordPresetUsage(theme.id);
      panel.style.display = 'none';
    });
    item.className = 'dream-theme-row';
    item.dataset.themeId = theme.id;
  }

  // 快捷键：Ctrl+Alt+1~8 直切前 8 套预设皮肤；行尾数字角标 = 键位提示。
  // 输入控件聚焦时不劫持；重注入先摘除上一轮监听（同 __dreamWorkOutsideClick 模式）。
  if (window.__dreamWorkHotkeys) {
    document.removeEventListener('keydown', window.__dreamWorkHotkeys, true);
    delete window.__dreamWorkHotkeys;
  }
  const hotkeyRows = Array.prototype.slice.call(panel.querySelectorAll('.dream-theme-row'), 0, 8);
  hotkeyRows.forEach((item, index) => {
    const chip = document.createElement('span');
    chip.textContent = String(index + 1);
    chip.title = 'Ctrl+Alt+' + (index + 1) + ' 快速切换';
    chip.style.cssText = 'margin-left:auto;flex:none;min-width:16px;height:16px;padding:0 4px;border-radius:5px;border:1px solid rgba(0,0,0,.12);display:inline-flex;align-items:center;justify-content:center;font:600 10px/1 system-ui;color:rgba(23,52,79,.62)!important;-webkit-text-fill-color:rgba(23,52,79,.62)!important;background:rgba(0,0,0,.04);';
    item.appendChild(chip);
  });
  window.__dreamWorkHotkeys = (event) => {
    if (!event.ctrlKey || !event.altKey || event.shiftKey || event.metaKey) return;
    const target = event.target;
    if (target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName || ''))) return;
    const code = String(event.code || '');
    const digitMatch = code.match(/^Digit([1-8])$/) || code.match(/^Numpad([1-8])$/);
    const index = digitMatch ? Number(digitMatch[1]) - 1 : -1;
    if (index < 0 || index >= Math.min(8, themes.length)) return;
    event.preventDefault();
    event.stopPropagation();
    const theme = themes[index];
    applyTheme(theme.id);
    void recordPresetUsage(theme.id);
    panel.style.display = 'none';
  };
  document.addEventListener('keydown', window.__dreamWorkHotkeys, true);

  /* __DREAM_PAGE_CONTRAST_START__（与 electron/manager/contrast.ts 保持同逻辑） */
  const pageHexToRgb = (value) => {
    const m = /^#([0-9a-f]{6})$/i.exec(value || '');
    if (!m) return [255, 255, 255];
    const v = parseInt(m[1], 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  };
  const pageRgbToHex = (rgb) => '#' + rgb.map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('');
  const pageMixRgb = (a, b, t) => a.map((value, index) => value + (b[index] - value) * t);
  const pageRgbToHsl = (rgb) => {
    const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h;
    if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    return [h / 6, s, l];
  };
  const pageHslToRgb = (h, s, l) => {
    if (s <= 0) { const v = l * 255; return [v, v, v]; }
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    // 保持浮点精度，只在 pageRgbToHex 输出时取整一次
    return [hue2rgb(p, q, h + 1 / 3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1 / 3) * 255];
  };
  const pageSrgbToLinear = (c) => { const x = c / 255; return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); };
  const pageLuminance = (rgb) => 0.2126 * pageSrgbToLinear(rgb[0]) + 0.7152 * pageSrgbToLinear(rgb[1]) + 0.0722 * pageSrgbToLinear(rgb[2]);
  const pageContrast = (a, b) => {
    const la = pageLuminance(a), lb = pageLuminance(b);
    return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
  };
  // 色相保持：只调明度达标，避免推向无彩色黑白；方向按“远离背景亮度”选择；
  // 不可能时才退回黑白混合
  const pageEnsureOne = (fg, bg, target) => {
    if (pageContrast(fg, bg) >= target) return fg;
    const aim = target + Math.max(0.02, target * 0.02);
    const lfg = pageLuminance(fg), lbg = pageLuminance(bg);
    const darken = lfg < lbg || (lfg === lbg && lbg > 0.475);
    const [h, s, l] = pageRgbToHsl(fg);
    if (s >= 0.02) {
      let lo = darken ? 0 : l, hi = darken ? l : 1;
      for (let i = 0; i < 14; i++) {
        const mid = (lo + hi) / 2;
        if (pageContrast(pageHslToRgb(h, s, mid), bg) >= aim) {
          if (darken) lo = mid; else hi = mid;
        } else {
          if (darken) hi = mid; else lo = mid;
        }
      }
      const candidate = pageHslToRgb(h, s, darken ? lo : hi);
      if (pageContrast(candidate, bg) >= target) return candidate;
    }
    const toward = darken ? [0, 0, 0] : [255, 255, 255];
    let lo = 0, hi = 1;
    for (let i = 0; i < 12; i++) {
      const mid = (lo + hi) / 2;
      if (pageContrast(pageMixRgb(fg, toward, mid), bg) >= aim) hi = mid;
      else lo = mid;
    }
    return pageMixRgb(fg, toward, hi);
  };
  const pageEnsureAll = (fg, backgrounds, target) => {
    const minContrast = (color) => Math.min(...backgrounds.map((bg) => pageContrast(color, bg)));
    let current = fg;
    for (let round = 0; round < 4; round++) {
      if (minContrast(current) >= target) return current;
      const before = minContrast(current);
      let worst = null, worstRatio = Infinity;
      for (const bg of backgrounds) {
        const ratio = pageContrast(current, bg);
        if (ratio < worstRatio) { worstRatio = ratio; worst = bg; }
      }
      const boosted = pageEnsureOne(current, worst, target);
      if (minContrast(boosted) <= before + 1e-9) break;
      current = boosted;
    }
    if (minContrast(current) >= target) return current;
    const [h, s] = pageRgbToHsl(fg);
    const candidates = [fg, current];
    for (const l of [0.02, 0.06, 0.12, 0.22, 0.78, 0.88, 0.95, 0.99]) {
      candidates.push(pageHslToRgb(h, s, l));
    }
    let bestColor = current, bestRatio = minContrast(current);
    for (const candidate of candidates) {
      const ratio = minContrast(candidate);
      if (ratio > bestRatio + 1e-9) { bestRatio = ratio; bestColor = candidate; }
    }
    return bestColor;
  };
  // 替换出真实调色板后再做对比度提升：主文字 4.5:1、次级 3:1，
  // 背景用 surface 与图片平均色按各表面透明度合成（colors.average 由
  // extractPalette 计算；旧存档没有该字段时退化为纯 surface）。
  const deriveTextColors = (colors) => {
    const surface = pageHexToRgb(colors.surface);
    const hero = pageHexToRgb(colors.average || colors.surface);
    const backgrounds = surfaceAlphas.map((alpha) => pageMixRgb(hero, surface, alpha));
    /* 与主进程同款"保彩度只动明度"鲜艳取色 + 亮度提升：基色 = 主题色相 + 高饱和 +
       清单明度，收到达标线后再朝极端推一档（浅字更白 / 深字更黑） */
    const bright = (rgb) => {
      const [h, s, l] = pageRgbToHsl(rgb);
      const bgLum = backgrounds.reduce((sum, b) => sum + pageLuminance(b), 0) / Math.max(1, backgrounds.length);
      const next = pageLuminance(rgb) >= bgLum ? l + (1 - l) * 0.35 : l * 0.65;
      return pageHslToRgb(h, s, Math.max(0.02, Math.min(0.99, next)));
    };
    const tintMin = (rgb, floor, target) => {
      const spread = (c) => Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
      if (spread(rgb) >= target) return rgb;
      const [h, s, l] = pageRgbToHsl(rgb);
      const towardMid = l > 0.5 ? -1 : 1;
      let best = rgb;
      for (let i = 1; i <= 20; i++) {
        const cand = pageHslToRgb(h, Math.min(1, s + 0.06 * i), Math.max(0.06, Math.min(0.99, l + towardMid * 0.02 * i)));
        const worst = backgrounds.length ? Math.min.apply(null, backgrounds.map((bg) => pageContrast(cand, bg))) : 99;
        if (worst < floor) break;
        best = cand;
        if (spread(cand) >= target) break;
      }
      return best;
    };
    const vivid = (from, sat, l, floor, target, hueShift) => {
      const [h0] = pageRgbToHsl(from);
      const h = (((h0 + (hueShift || 0)) % 1) + 1) % 1;
      const base = pageHslToRgb(h, sat, Math.max(0.02, Math.min(0.98, l)));
      return tintMin(bright(pageEnsureAll(base, backgrounds, floor)), floor, target);
    };
    const textRgb = pageHexToRgb(colors.text);
    const baseLight = pageRgbToHsl(textRgb)[2];
    const accent = pageHexToRgb(colors.accent || colors.text);
    const secondary = pageHexToRgb(colors.secondary || colors.accent || colors.text);
    const text = tintMin(bright(pageEnsureAll(pageHslToRgb(pageRgbToHsl(accent)[0], 0.9, baseLight), backgrounds, 4.5)), 4.5, 60);
    const textL = pageRgbToHsl(text)[2];
    return {
      text: pageRgbToHex(text),
      textVivid: pageRgbToHex(vivid(accent, 0.92, baseLight, 4.5, 80)),
      textAlt: pageRgbToHex(vivid(secondary, 0.7, baseLight, 3, 45)),
      textOpposite: pageRgbToHex(vivid(accent, 0.95, baseLight, 3, 90, 0.5)),
      textSubtle: pageRgbToHex(vivid(accent, 0.45, textL < 0.5 ? Math.min(0.98, textL + 0.30) : Math.max(0.02, textL - 0.26), 3, 34)),
      textSubtlest: pageRgbToHex(vivid(accent, 0.36, textL < 0.5 ? Math.min(0.98, textL + 0.44) : Math.max(0.02, textL - 0.38), 3)),
      textSecondary: pageRgbToHex(vivid(accent, 0.4, textL < 0.5 ? Math.min(0.98, textL + 0.36) : Math.max(0.02, textL - 0.32), 3)),
    };
  };
  /* __DREAM_PAGE_CONTRAST_END__ */
  const buildCustomCss = (dataUrl, colors, customId) => {
    const derived = deriveTextColors(colors);
    // 极端壁纸下兜底色可能恰好等于某个哨兵十六进制串，替换前轻微提亮避开，
    // 防止后续 split/join 把它当成哨兵再次替换
    const sentinelHexes = [sentinels.accent, sentinels.secondary, sentinels.surface, sentinels.text, sentinels.textSubtle, sentinels.textSubtlest, sentinels.textSecondary];
    const dodgeSentinel = (hex) => sentinelHexes.includes(hex)
      ? pageRgbToHex(pageMixRgb(pageHexToRgb(hex), [255, 255, 255], 0.05))
      : hex;
    return cssTemplate
      .split(sentinels.hero).join(dataUrl)
      .split(sentinels.accent).join(colors.accent)
      .split(sentinels.secondary).join(colors.secondary)
      .split(sentinels.surface).join(colors.surface)
      .split(sentinels.text).join(dodgeSentinel(derived.text))
      .split(sentinels.textSubtle).join(dodgeSentinel(derived.textSubtle))
      .split(sentinels.textSubtlest).join(dodgeSentinel(derived.textSubtlest))
      .split(sentinels.textSecondary).join(dodgeSentinel(derived.textSecondary))
      .split(sentinels.id).join(customId);
  };
  const hex = (r, g, b) => '#' + [r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, amount) => a.map((value, index) => value + (b[index] - value) * amount);
  const extractPalette = (canvas) => {
    const context = canvas.getContext('2d');
    const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
    // 24 个色相桶 + 圆周均值：比旧版 6 桶细一倍，色相均值跨 0°/360° 不跳变，
    // 桶内平均色相不再是"第一个像素"的色相
    const HUE_BUCKETS = 24;
    const buckets = new Array(HUE_BUCKETS).fill(null);
    let luminanceSum = 0;
    let rSum = 0, gSum = 0, bSum = 0;
    let count = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      if (pixels[index + 3] < 128) continue; // 透明像素不参与统计，避免黑边污染
      const r = pixels[index], g = pixels[index + 1], b = pixels[index + 2];
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      luminanceSum += luminance;
      rSum += r;
      gSum += g;
      bSum += b;
      count += 1;
      const saturation = max === 0 ? 0 : (max - min) / max;
      // 无彩/过曝/死黑的像素不参与色相投票
      if (saturation < 0.14 || luminance < 20 || luminance > 248) continue;
      const delta = max - min || 1;
      const hue = max === r ? (g - b) / delta + (g < b ? 6 : 0) : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
      const bucket = Math.min(HUE_BUCKETS - 1, Math.floor(hue * HUE_BUCKETS / 6));
      // 频次 × 彩度²：既看"多"也看"艳"，小面积高彩点缀不再碾压大面积主色
      const weight = saturation * saturation;
      let entry = buckets[bucket];
      if (!entry) {
        entry = { weight: 0, r: 0, g: 0, b: 0, hueX: 0, hueY: 0 };
        buckets[bucket] = entry;
      }
      const angle = hue * (Math.PI / 3);
      entry.weight += weight;
      entry.r += r * weight;
      entry.g += g * weight;
      entry.b += b * weight;
      entry.hueX += Math.cos(angle) * weight;
      entry.hueY += Math.sin(angle) * weight;
    }
    const averageLuminance = count ? luminanceSum / count : 128;
    const light = averageLuminance > 128;
    const ranked = [];
    for (const entry of buckets) {
      if (!entry) continue;
      let hueDeg = Math.atan2(entry.hueY, entry.hueX) * 180 / Math.PI;
      if (hueDeg < 0) hueDeg += 360;
      ranked.push({ rgb: [entry.r / entry.weight, entry.g / entry.weight, entry.b / entry.weight], hue: hueDeg, weight: entry.weight });
    }
    ranked.sort((left, right) => right.weight - left.weight);
    const accent = ranked.length > 0 ? ranked[0].rgb : [36, 201, 215];
    // secondary：取与 accent 色相距离 ≥28° 且权重足够（≥accent 的 18% 且 ≥
    // 全彩权重的 6%）的最大色块；都不达标就由 accent 旋转 +42° 调和出辅色，
    // 不再随机向白混合成灰粉
    const hueDistance = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
    let secondary = null;
    if (ranked.length > 0) {
      const totalWeight = ranked.reduce((sum, entry) => sum + entry.weight, 0);
      for (let index = 1; index < ranked.length; index++) {
        const entry = ranked[index];
        if (hueDistance(entry.hue, ranked[0].hue) < 28) continue;
        if (entry.weight < ranked[0].weight * 0.18 || entry.weight < totalWeight * 0.06) continue;
        secondary = entry.rgb;
        break;
      }
    }
    if (!secondary) {
      const accentHsl = pageRgbToHsl(accent);
      const secLight = Math.min(0.85, Math.max(0.15, light ? accentHsl[2] + 0.2 : accentHsl[2] - 0.15));
      secondary = pageHslToRgb((accentHsl[0] + 42 / 360) % 1, Math.min(1, accentHsl[1] * 0.9 + 0.06), secLight);
    }
    // average：整图平均色（不透明像素），供 deriveTextColors 与 surface 合成实际背景
    return {
      accent: hex(...accent),
      secondary: hex(...secondary),
      surface: hex(...(light ? mix(accent, [252, 252, 255], 0.92) : mix(accent, [12, 12, 18], 0.86))),
      text: hex(...(light ? mix(accent, [16, 24, 40], 0.82) : mix(accent, [244, 246, 252], 0.85))),
      average: hex(rSum / (count || 1), gSum / (count || 1), bSum / (count || 1)),
    };
  };
  const MAX_CUSTOM = 5;
  const customRows = new Map();
  const loadCustoms = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(customStorageKey) || '[]');
      return Array.isArray(saved) ? saved.filter((theme) => theme && theme.dataUrl && theme.colors).slice(0, MAX_CUSTOM) : [];
    } catch { return []; }
  };
  const writeLocalCustoms = (saved) => {
    try { localStorage.setItem(customStorageKey, JSON.stringify(saved.slice(0, MAX_CUSTOM))); }
    catch (error) { console.warn('Dream Theme: 自定义图片本地缓存失败', error); }
  };
  const syncSharedCustoms = (saved) => fetch(sharedCustomThemeService.endpoint, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(saved.slice(0, MAX_CUSTOM)),
  }).then((response) => {
    if (!response.ok) throw new Error('共享图片同步失败: HTTP ' + response.status);
    return response.json();
  });
  const saveCustoms = (saved) => {
    const limited = saved.slice(0, MAX_CUSTOM);
    writeLocalCustoms(limited);
    return syncSharedCustoms(limited).catch((error) => {
      console.warn('Dream Theme: 共享图片同步失败', error);
      return limited;
    });
  };
  const localCustomThemes = loadCustoms();
  const initialCustomThemes = sharedCustomThemes.length > 0 ? sharedCustomThemes : localCustomThemes;
  writeLocalCustoms(initialCustomThemes);
  if (sharedCustomThemes.length === 0 && localCustomThemes.length > 0) void saveCustoms(localCustomThemes);
  const applyCustomTheme = (slot) => {
    window.__dreamWorkThemeStyle.textContent = materializeCss(buildCustomCss(slot.dataUrl, slot.colors, slot.id), slot.id);
    document.documentElement.dataset.dreamTheme = slot.id;
    if (appId !== 'hana-agent') applyMode(slot.colors.surface);
    if (appId === 'zcode') applyVideoLayer(null);
    if (appId === 'codex') document.documentElement.classList.add('codex-dream-skin');
    ensureCustomRow(slot);
  };
  const deleteCustom = async (slotId) => {
    const saved = loadCustoms();
    const index = saved.findIndex((theme) => theme.id === slotId);
    if (index < 0) return;
    if (document.documentElement.dataset.dreamTheme === slotId) restoreNative();
    saved.splice(index, 1);
    await saveCustoms(saved);
    customRows.get(slotId)?.remove();
    customRows.delete(slotId);
  };
  const ensureCustomRow = (slot) => {
    const existing = customRows.get(slot.id);
    if (existing) {
      existing.querySelector('span + span').textContent = slot.name;
      existing.firstChild.style.background = slot.colors.accent;
      return;
    }
    const item = row(slot.name, slot.colors.accent, () => {
      const current = loadCustoms().find((theme) => theme.id === slot.id) || slot;
      applyCustomTheme(current);
      panel.style.display = 'none';
    }, uploadRow);
    const text = item.querySelector('span + span');
    text.style.cssText = 'flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;';
    const remove = document.createElement('span');
    remove.textContent = '×';
    remove.title = '删除这张自定义图片';
    remove.style.cssText = 'flex:none;width:18px;height:18px;line-height:18px;text-align:center;border-radius:50%;color:rgba(0,0,0,.45);font-size:14px;';
    remove.addEventListener('click', (event) => { event.stopPropagation(); deleteCustom(slot.id); });
    item.appendChild(remove);
    customRows.set(slot.id, item);
  };
  const importFromDataUrl = (dataUrl, name) => new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = async () => {
      const scale = Math.min(1, 1600 / image.width);
      const full = document.createElement('canvas');
      full.width = Math.round(image.width * scale);
      full.height = Math.round(image.height * scale);
      full.getContext('2d').drawImage(image, 0, 0, full.width, full.height);
      const sample = document.createElement('canvas');
      // 64px 采样：48 → 64 提升色相统计稳定性，开销仍可忽略（~4K 像素单趟）
      sample.width = 64;
      sample.height = Math.max(1, Math.round(64 * image.height / image.width));
      sample.getContext('2d').drawImage(image, 0, 0, sample.width, sample.height);
      const colors = extractPalette(sample);
      const compressed = full.toDataURL('image/webp', 0.8);
      const saved = loadCustoms();
      let slot;
      if (saved.length < MAX_CUSTOM) {
        slot = { id: 'custom-codex-' + Date.now().toString(36), name: name || '我的图片', dataUrl: compressed, colors };
        saved.push(slot);
      } else {
        slot = { id: saved[0].id, name: name || '我的图片', dataUrl: compressed, colors };
        saved[0] = slot;
      }
      await saveCustoms(saved);
      applyCustomTheme(slot);
      resolve(colors);
    };
    image.onerror = () => reject(new Error('图片读取失败'));
    image.src = dataUrl;
  });
  const picker = document.createElement('input');
  picker.type = 'file';
  picker.accept = 'image/png,image/jpeg,image/webp';
  picker.style.display = 'none';
  picker.addEventListener('change', () => {
    const file = picker.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => importFromDataUrl(reader.result, file.name.replace(/\\.[a-z0-9]+$/i, ''));
    reader.readAsDataURL(file);
    picker.value = '';
    panel.style.display = 'none';
  });
  const uploadRow = row('＋ 自定义图片', 'rgba(36,201,215,.9)', () => picker.click());
  uploadRow.style.borderTop = '1px solid rgba(0,0,0,.08)';
  /* 「还原主题」不进皮肤分类：常驻面板顶层底部，随时可点 */
  const native = row('还原主题', 'rgba(0,0,0,.24)', () => restoreNative(), null, panel);
  native.style.borderTop = '1px solid rgba(0,0,0,.08)';
  initialCustomThemes.forEach(ensureCustomRow);
  fetch(sharedCustomThemeService.endpoint, {
    headers: { Authorization: 'Bearer ' + sharedCustomThemeService.token },
  }).then((response) => response.ok ? response.json() : Promise.reject(new Error('HTTP ' + response.status)))
    .then((latest) => {
      if (!Array.isArray(latest)) return;
      for (const slotId of [...customRows.keys()]) {
        if (!latest.some((item) => item.id === slotId)) {
          customRows.get(slotId)?.remove();
          customRows.delete(slotId);
        }
      }
      writeLocalCustoms(latest);
      latest.forEach(ensureCustomRow);
    }).catch((error) => console.warn('Dream Theme: 共享图片读取失败', error));

  button.addEventListener('click', () => {
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  const closeOnOutsideClick = (event) => {
    if (panel.style.display === 'none') return;
    const path = event.composedPath?.() || [];
    if (!path.includes(host)) panel.style.display = 'none';
  };
  if (window.__dreamWorkOutsideClick) {
    document.removeEventListener('pointerdown', window.__dreamWorkOutsideClick, true);
  }
  window.__dreamWorkOutsideClick = closeOnOutsideClick;
  document.addEventListener('pointerdown', closeOnOutsideClick, true);

  root.append(panel, button, picker);
  mount.appendChild(root);
  document.documentElement.appendChild(host);

  clearInterval(window.__dreamWorkMenuGuard);
  const ensureInjectedNodes = () => {
    if (!window.__dreamWorkThemeStyle.isConnected) document.head.appendChild(window.__dreamWorkThemeStyle);
    if (!host.isConnected) document.documentElement.appendChild(host);
  };
  window.__dreamWorkMenuGuard = setInterval(() => {
    ensureInjectedNodes();
  }, 250);
  applyTheme(currentThemeId);
  ensureInjectedNodes();
})()`;
}
