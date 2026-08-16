// ---- WCAG 对比度工具：根据表面明暗动态提升文字对比度 ----
// 注意：注入页面的菜单脚本里有一份同逻辑的字符串副本（injector.ts 中
// __DREAM_PAGE_CONTRAST__ 标记块），页面脚本无法直接 import 本模块，
// 修改这里的算法时需同步修改那份副本。

export type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return [255, 255, 255];
  const v = parseInt(m[1], 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

export function rgbToHex(rgb: Rgb): string {
  return '#' + rgb.map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, '0')).join('');
}

function srgbToLinear(c: number): number {
  const x = c / 255;
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(rgb: Rgb): number {
  return 0.2126 * srgbToLinear(rgb[0]) + 0.7152 * srgbToLinear(rgb[1]) + 0.0722 * srgbToLinear(rgb[2]);
}

export function contrastRatio(a: Rgb, b: Rgb): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

export function mixRgb(a: Rgb, b: Rgb, t: number): Rgb {
  return [0, 1, 2].map((index) => a[index] + (b[index] - a[index]) * t) as Rgb;
}

export function rgbToHsl(rgb: Rgb): [number, number, number] {
  const r = rgb[0] / 255, g = rgb[1] / 255, b = rgb[2] / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
  else if (max === g) h = (b - r) / d + 2;
  else h = (r - g) / d + 4;
  return [h / 6, s, l];
}

export function hslToRgb(h: number, s: number, l: number): Rgb {
  if (s <= 0) { const v = l * 255; return [v, v, v]; }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  // 保持浮点精度：多轮迭代中过早取整会累积丢失色相/饱和度，
  // 只在 rgbToHex 输出时取整一次
  return [
    hue2rgb(p, q, h + 1 / 3) * 255,
    hue2rgb(p, q, h) * 255,
    hue2rgb(p, q, h - 1 / 3) * 255,
  ];
}

/** 若 fg 与 bg 的 WCAG 对比度不足 target，则调整 fg 明度直到达标；
    优先保持 fg 的色相与饱和度（只沿明度二分搜索），避免把主题文字
    推向无彩色的纯黑/纯白。方向按“远离背景亮度”选择：fg 比背景暗就
    继续压暗、比背景亮就继续提亮——按背景绝对明暗选方向会在中间亮度
    背景上选错边。仅当色相保持无法达标时才退回黑白混合。 */
export function ensureContrastRgb(fg: Rgb, bg: Rgb, target: number): Rgb {
  if (contrastRatio(fg, bg) >= target) return fg;
  // 搜索目标留 2% 余量：最终十六进制取整（±0.5/通道）可能把恰好压线的结果挤回阈值之下
  const aim = target + Math.max(0.02, target * 0.02);
  const lfg = relativeLuminance(fg);
  const lbg = relativeLuminance(bg);
  const darken = lfg < lbg || (lfg === lbg && lbg > 0.475);
  const [h, s, l] = rgbToHsl(fg);
  if (s >= 0.02) {
    // 明度对对比度单调：二分找“最接近原始明度且达标”的明度值
    let lo = darken ? 0 : l;
    let hi = darken ? l : 1;
    for (let i = 0; i < 14; i++) {
      const mid = (lo + hi) / 2;
      if (contrastRatio(hslToRgb(h, s, mid), bg) >= aim) {
        if (darken) lo = mid; else hi = mid;
      } else {
        if (darken) hi = mid; else lo = mid;
      }
    }
    const candidate = hslToRgb(h, s, darken ? lo : hi);
    if (contrastRatio(candidate, bg) >= target) return candidate;
  }
  const toward: Rgb = darken ? [0, 0, 0] : [255, 255, 255];
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2;
    if (contrastRatio(mixRgb(fg, toward, mid), bg) >= aim) hi = mid;
    else lo = mid;
  }
  return mixRgb(fg, toward, hi);
}

/** 针对多个候选背景迭代提升：每轮找到对比度最差的背景向其提升，
    直到与全部背景达标。背景明暗横跨中间亮度、任何单色都无法全部达标时，
    在保持色相的明度阶梯里选最差对比度最大的候选兜底（不劣于原始色）。 */
export function ensureContrastAgainstAll(fg: Rgb, backgrounds: Rgb[], target: number): Rgb {
  if (backgrounds.length === 0) return fg;
  const minContrast = (color: Rgb) => Math.min(...backgrounds.map((bg) => contrastRatio(color, bg)));
  let current = fg;
  for (let round = 0; round < 4; round++) {
    if (minContrast(current) >= target) return current;
    const before = minContrast(current);
    let worst = backgrounds[0];
    let worstRatio = Infinity;
    for (const bg of backgrounds) {
      const ratio = contrastRatio(current, bg);
      if (ratio < worstRatio) {
        worstRatio = ratio;
        worst = bg;
      }
    }
    const boosted = ensureContrastRgb(current, worst, target);
    // 提升后整体最差对比度没有改善就停：两个方向都无法达标时继续会来回震荡
    if (minContrast(boosted) <= before + 1e-9) break;
    current = boosted;
  }
  if (minContrast(current) >= target) return current;
  // 兜底候选：保持 fg 色相/饱和度的明度阶梯（而非黑白混合），
  // 保证极端场景下文字仍带主题色调
  const [h, s] = rgbToHsl(fg);
  const candidates: Rgb[] = [fg, current];
  for (const l of [0.02, 0.06, 0.12, 0.22, 0.78, 0.88, 0.95, 0.99]) {
    candidates.push(hslToRgb(h, s, l));
  }
  let bestColor = current;
  let bestRatio = minContrast(current);
  for (const candidate of candidates) {
    const ratio = minContrast(candidate);
    if (ratio > bestRatio + 1e-9) {
      bestRatio = ratio;
      bestColor = candidate;
    }
  }
  return bestColor;
}
