import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { APP_DEFINITIONS, getAppDefinition } from './app-registry';

const STORE_VERSION = 1;

interface AppPathStore {
  version: number;
  paths: Record<string, string>;
}

export interface AppPathConfiguration {
  appId: string;
  name: string;
  exeNames: string[];
  customPath?: string;
  customPathStatus: 'none' | 'valid' | 'invalid';
}

export function getAppPathConfigurations(): AppPathConfiguration[] {
  const configuredPaths = readStore().paths;
  return APP_DEFINITIONS.map(definition => {
    const customPath = configuredPaths[definition.id];
    return {
      appId: definition.id,
      name: definition.name,
      exeNames: [...definition.exeNames],
      customPath,
      customPathStatus: customPath ? (isValidExecutablePath(definition.id, customPath) ? 'valid' : 'invalid') : 'none',
    };
  });
}

export function getValidCustomAppPath(appId: string): string | undefined {
  const customPath = readStore().paths[appId];
  return customPath && isValidExecutablePath(appId, customPath) ? customPath : undefined;
}

export function setCustomAppPath(appId: string, executablePath: string): string {
  const definition = getAppDefinition(appId);
  if (!definition) throw new Error(`Unknown app: ${appId}`);
  if (!isValidExecutablePath(appId, executablePath)) {
    throw new Error(`请选择 ${definition.name} 的可执行文件（${definition.exeNames.join(' 或 ')}）`);
  }

  const store = readStore();
  store.paths[appId] = path.resolve(executablePath);
  writeStore(store);
  return store.paths[appId];
}

export function clearCustomAppPath(appId: string): void {
  if (!getAppDefinition(appId)) throw new Error(`Unknown app: ${appId}`);
  const store = readStore();
  delete store.paths[appId];
  writeStore(store);
}

export function isValidExecutablePath(appId: string, candidate: string): boolean {
  const definition = getAppDefinition(appId);
  if (!definition || !candidate || typeof candidate !== 'string') return false;

  try {
    if (!fs.statSync(candidate).isFile()) return false;
  } catch {
    return false;
  }

  const filename = path.basename(candidate).toLowerCase();
  return definition.exeNames.some(exeName => exeName.toLowerCase() === filename);
}

function getStorePath(): string {
  return path.join(app.getPath('userData'), 'app-paths.json');
}

function readStore(): AppPathStore {
  try {
    const parsed = JSON.parse(fs.readFileSync(getStorePath(), 'utf8')) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return emptyStore();
    const value = parsed as Partial<AppPathStore>;
    if (value.version !== STORE_VERSION || !value.paths || typeof value.paths !== 'object' || Array.isArray(value.paths)) {
      return emptyStore();
    }

    const paths: Record<string, string> = {};
    for (const [appId, executablePath] of Object.entries(value.paths)) {
      if (getAppDefinition(appId) && typeof executablePath === 'string' && executablePath.trim()) {
        paths[appId] = executablePath;
      }
    }
    return { version: STORE_VERSION, paths };
  } catch {
    return emptyStore();
  }
}

function emptyStore(): AppPathStore {
  return { version: STORE_VERSION, paths: {} };
}

function writeStore(store: AppPathStore): void {
  const storePath = getStorePath();
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  fs.writeFileSync(storePath, `${JSON.stringify({ version: STORE_VERSION, paths: store.paths }, null, 2)}\n`, 'utf8');
}
