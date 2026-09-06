import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { app } from 'electron';
import { ThemeManifest } from '../../shared/types';
import { getThemeSearchDirs } from './theme-paths';

export interface ThemeEntry {
  id: string;
  name: string;
  author: string;
  path: string;
  manifest: ThemeManifest;
}

const heroHashCache = new Map<string, { size: number; mtimeMs: number; hash: string }>();

export function listThemes(appId?: string): ThemeEntry[] {
  const entries: ThemeEntry[] = [];
  const seenIds = new Set<string>();

  for (const themesDir of getThemeSearchDirs()) {
    if (!fs.existsSync(themesDir)) continue;
    const items = fs.readdirSync(themesDir, { withFileTypes: true });

    for (const item of items) {
      if (!item.isDirectory()) continue;
      const themeDir = path.join(themesDir, item.name);
      const manifestPath = path.join(themeDir, 'theme.json');
      if (!fs.existsSync(manifestPath)) continue;

      try {
        const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
        const manifest = validateThemeManifest(raw);
        if (seenIds.has(manifest.id)) continue;
        const heroPath = path.join(themeDir, manifest.hero);
        if (!fs.existsSync(heroPath) || !fs.statSync(heroPath).isFile()) throw new Error(`theme hero is missing: ${manifest.hero}`);
        if (appId && manifest.apps[appId]?.compat !== true && appId !== 'hana-agent') continue;

        seenIds.add(manifest.id);
        entries.push({
          id: manifest.id,
          name: manifest.name,
          author: manifest.author,
          path: themeDir,
          manifest,
        });
      } catch (e) {
        console.error(`Failed to load theme ${item.name}:`, e);
      }
    }
  }

  const uniqueEntries = new Map<string, ThemeEntry>();
  for (const entry of entries) {
    const heroPath = path.join(entry.path, entry.manifest.hero);
    const heroHash = getHeroHash(heroPath);
    const contentKey = `${entry.name.trim().toLocaleLowerCase()}\0${entry.author.trim().toLocaleLowerCase()}\0${heroHash}`;
    const current = uniqueEntries.get(contentKey);
    if (!current || isPreferredThemeId(entry.id, current.id)) uniqueEntries.set(contentKey, entry);
  }

  return [...uniqueEntries.values()].sort((a, b) => a.name.localeCompare(b.name));
}

function getHeroHash(heroPath: string): string {
  const stats = fs.statSync(heroPath);
  const cached = heroHashCache.get(heroPath);
  if (cached && cached.size === stats.size && cached.mtimeMs === stats.mtimeMs) return cached.hash;
  const hash = crypto.createHash('sha256').update(fs.readFileSync(heroPath)).digest('hex');
  heroHashCache.set(heroPath, { size: stats.size, mtimeMs: stats.mtimeMs, hash });
  return hash;
}

function isPreferredThemeId(candidate: string, current: string): boolean {
  const candidateCustom = candidate.startsWith('custom-');
  const currentCustom = current.startsWith('custom-');
  if (candidateCustom !== currentCustom) return !candidateCustom;
  return candidate.length < current.length || (candidate.length === current.length && candidate.localeCompare(current) < 0);
}

export function getThemeById(id: string, appId?: string): ThemeEntry | undefined {
  return listThemes(appId).find(t => t.id === id);
}

export function getThemeAssetPath(id: string): string | undefined {
  const theme = getThemeById(id);
  if (!theme) return undefined;
  const asset = path.resolve(theme.path, theme.manifest.hero);
  if (!asset.startsWith(`${path.resolve(theme.path)}${path.sep}`)) return undefined;
  return asset;
}

export function getThemeAssetUrl(id: string): string {
  return `theme-asset://local/${encodeURIComponent(id)}`;
}

export function getThemeHeroDataUrl(theme: ThemeEntry): string {
  // hero 文件名来自 theme.json（用户可导入）：解析后必须仍落在主题目录内，防路径穿越
  const themeDir = path.resolve(theme.path);
  const heroPath = path.resolve(themeDir, theme.manifest.hero);
  if (heroPath !== themeDir && !heroPath.startsWith(themeDir + path.sep)) {
    throw new Error(`Theme hero path escapes theme directory: ${theme.manifest.hero}`);
  }
  const heroBuffer = fs.readFileSync(heroPath);
  return `data:${getMimeType(theme.manifest.hero)};base64,${heroBuffer.toString('base64')}`;
}

export function hasThemeContent(name: string, author: string, heroPath: string): boolean {
  const expectedHash = getHeroHash(heroPath);
  return listThemes().some(theme => {
    if (theme.name.trim().toLowerCase() !== name.trim().toLowerCase() ||
        theme.author.trim().toLowerCase() !== author.trim().toLowerCase()) return false;
    return getHeroHash(path.join(theme.path, theme.manifest.hero)) === expectedHash;
  });
}

function validateThemeManifest(input: any): ThemeManifest {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    throw new Error('theme manifest must be an object');
  }
  if (input.schemaVersion !== 1) {
    throw new Error(`unsupported theme schema ${input.schemaVersion}`);
  }
  if (typeof input.id !== 'string' || !/^[a-z0-9-]+$/.test(input.id)) {
    throw new Error('theme id must use lowercase letters, numbers, and hyphens');
  }
  if (typeof input.name !== 'string' || !input.name.trim()) {
    throw new Error('theme name must be a non-empty string');
  }
  if (typeof input.author !== 'string') {
    throw new Error('theme author must be a string');
  }
  if (typeof input.hero !== 'string') {
    throw new Error('theme hero must be a string');
  }
  // 可选动态背景视频：文件名必须落在主题目录内且为白名单格式，非法值按无视频处理
  let video: string | undefined;
  if (typeof input.video === 'string' && input.video.trim()) {
    const name = input.video.trim();
    if (path.basename(name) !== name || !/\.(mp4|webm)$/i.test(name)) {
      console.warn(`theme ${input.id}: ignoring invalid video field ${name}`);
    } else {
      video = name;
    }
  }
  if (typeof input.colors !== 'object' || input.colors === null) {
    throw new Error('theme colors must be an object');
  }

  const requiredColors = ['accent', 'secondary', 'surface', 'text'];
  for (const color of requiredColors) {
    if (typeof input.colors[color] !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(input.colors[color])) {
      throw new Error(`theme color ${color} must be a hex color`);
    }
  }

  return {
    schemaVersion: 1,
    id: input.id,
    name: input.name.trim(),
    author: input.author,
    hero: input.hero,
    video,
    colors: {
      accent: input.colors.accent,
      secondary: input.colors.secondary,
      surface: input.colors.surface,
      text: input.colors.text,
    },
    copy: input.copy ?? undefined,
    apps: input.apps ?? {},
  };
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  const map: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
  };
  return map[ext] || 'image/png';
}

// 动态背景视频的磁盘路径：主题目录内解析 + 与 hero 同款防穿越；安装态主题在
// app.asar 内而 Chromium 的 video 元素读不了 asar，映射到 electron-builder 的
// app.asar.unpacked 真实目录；文件缺失/非法返回 null（主题退回静态壁纸）。
export function getThemeVideoPath(theme: ThemeEntry): string | null {
  const videoName = theme.manifest.video;
  if (!videoName) return null;
  const themeDir = path.resolve(theme.path);
  let videoPath = path.resolve(themeDir, videoName);
  if (videoPath !== themeDir && !videoPath.startsWith(themeDir + path.sep)) return null;
  if (!/\.(mp4|webm)$/i.test(path.extname(videoPath))) return null;
  const appPath = app.getAppPath();
  if (appPath.endsWith('.asar') && (themeDir === appPath || themeDir.startsWith(appPath + path.sep))) {
    // 仅当主题确在安装包内时才映射 unpacked；用户库（%APPDATA%）主题本就是真实文件。
    // electron-builder 的解包目录是 app.asar 的同名 +.unpacked（与 asar 同级）
    const unpackedThemeDir = path.resolve(appPath + '.unpacked', path.relative(appPath, themeDir));
    videoPath = path.resolve(unpackedThemeDir, videoName);
  }
  try {
    if (!fs.existsSync(videoPath) || !fs.statSync(videoPath).isFile()) return null;
  } catch {
    return null;
  }
  return videoPath;
}
