import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { AppDefinition, getAppDefinition } from './app-registry';
import { getValidCustomAppPath } from './app-path-store';

const execFileAsync = promisify(execFile);

export async function resolveWindowsAppExecutable(appId: string): Promise<string | null> {
  const definition = getAppDefinition(appId);
  if (!definition) return null;

  const configuredPath = getValidCustomAppPath(appId);
  if (configuredPath) return configuredPath;

  const directPath = findWindowsExecutable(definition.exeNames, definition.installPaths);
  if (directPath) return directPath;

  const programFilesPath = findProgramFilesExecutable(definition);
  if (programFilesPath) return programFilesPath;

  if (appId === 'codex') {
    const windowsAppsPath = findWindowsAppsOpenAIExe();
    if (windowsAppsPath) return windowsAppsPath;
    return findCodexAppx();
  }

  return null;
}

function findWindowsExecutable(exeNames: string[], installPaths: string[]): string | null {
  for (const base of installPaths) {
    if (!base || !fs.existsSync(base)) continue;
    try {
      if (fs.statSync(base).isFile() && hasExpectedFilename(base, exeNames)) return base;
      for (const exe of exeNames) {
        const direct = path.join(base, exe);
        if (isFile(direct)) return direct;
      }
      const versionDirs = fs.readdirSync(base, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .sort((left, right) => right.name.localeCompare(left.name, undefined, { numeric: true }));
      for (const item of versionDirs) {
        for (const exe of exeNames) {
          const candidate = path.join(base, item.name, exe);
          if (isFile(candidate)) return candidate;
        }
      }
    } catch {
      // Continue with the remaining installation locations.
    }
  }
  return null;
}

function findProgramFilesExecutable(definition: AppDefinition): string | null {
  const scanDirs = [process.env.ProgramFiles, process.env['ProgramFiles(x86)']].filter((value): value is string => Boolean(value));
  for (const directory of scanDirs) {
    if (!fs.existsSync(directory)) continue;
    try {
      const match = fs.readdirSync(directory).find(item =>
        item.toLowerCase().includes(definition.id.replace('-', '')) ||
        item.toLowerCase().includes(definition.name.toLowerCase()),
      );
      if (!match) continue;
      for (const exeName of definition.exeNames) {
        const candidate = path.join(directory, match, exeName);
        if (isFile(candidate)) return candidate;
      }
    } catch {
      // Program Files can contain directories that the current user cannot read.
    }
  }
  return null;
}

function findWindowsAppsOpenAIExe(): string | null {
  const windowsApps = path.join(process.env.ProgramFiles || 'C:\\Program Files', 'WindowsApps');
  if (!fs.existsSync(windowsApps)) return null;
  try {
    for (const item of fs.readdirSync(windowsApps)) {
      if (!/^OpenAI\.Codex_\d+/i.test(item)) continue;
      const candidate = path.join(windowsApps, item, 'app', 'ChatGPT.exe');
      if (isFile(candidate)) return candidate;
    }
  } catch {
    // WindowsApps is commonly protected by ACLs; use the Appx fallback below.
  }
  return null;
}

async function findCodexAppx(): Promise<string | null> {
  const script = `
$ErrorActionPreference = 'SilentlyContinue'
$package = Get-AppxPackage -Name 'OpenAI.Codex' -ErrorAction SilentlyContinue
if (-not $package) { exit 1 }
$manifest = Get-AppxPackageManifest -Package $package.PackageFullName
$rel = [string]$manifest.Package.Applications.Application.Executable
if (-not $rel) { exit 1 }
$full = Join-Path $package.InstallLocation $rel
if (Test-Path -LiteralPath $full -PathType Leaf) { Write-Output $full } else { exit 1 }
`;
  try {
    const { stdout } = await execFileAsync(
      'powershell.exe',
      ['-NoLogo', '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { encoding: 'utf8', maxBuffer: 4 * 1024 * 1024 },
    );
    const found = stdout.trim();
    return isFile(found) ? found : null;
  } catch {
    return null;
  }
}

function hasExpectedFilename(candidate: string, exeNames: string[]): boolean {
  const filename = path.basename(candidate).toLowerCase();
  return exeNames.some(exeName => exeName.toLowerCase() === filename);
}

function isFile(candidate: string): boolean {
  try {
    return fs.statSync(candidate).isFile();
  } catch {
    return false;
  }
}
