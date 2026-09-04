import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export interface ShortcutProfile {
  id: string;
  appId: string;
  themeId: string;
  label: string;
  icon?: string;
}

// 快捷方式字段会进入文件名与 PowerShell/osascript 内容：
// id/appId/themeId 走严格白名单，label 只保留 Unicode 字母数字与 . _ - 空格，
// 杜绝经 shell/脚本解释器的注入面。
function validateProfile(profile: ShortcutProfile): void {
  if (!/^[a-z0-9._-]+$/i.test(profile.id || '')) throw new Error(`Invalid shortcut id: ${profile.id}`);
  if (!/^[a-z0-9-]+$/i.test(profile.appId || '')) throw new Error(`Invalid appId: ${profile.appId}`);
  if (!/^[a-z0-9._-]+$/i.test(profile.themeId || '')) throw new Error(`Invalid themeId: ${profile.themeId}`);
}

function safeFileStem(value: string): string {
  const cleaned = value.replace(/[^\p{L}\p{N} ._-]/gu, '').trim();
  return cleaned.length > 0 ? cleaned.slice(0, 80) : 'DreamWorkTheme';
}

export async function createShortcut(profile: ShortcutProfile): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    validateProfile(profile);
    if (os.platform() === 'win32') {
      return createWindowsShortcut(profile);
    }
    if (os.platform() === 'darwin') {
      return createMacShortcut(profile);
    }
    if (os.platform() === 'linux') {
      return createLinuxShortcut(profile);
    }
    return { success: false, error: `Unsupported platform: ${os.platform()}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

function createWindowsShortcut(profile: ShortcutProfile): Promise<{ success: boolean; path?: string; error?: string }> {
  const desktopDir = path.join(os.homedir(), 'Desktop');
  const shortcutPath = path.join(desktopDir, `${safeFileStem(profile.label)}.lnk`);
  const exePath = process.execPath;
  const workingDir = path.dirname(exePath);

  const script = `
    $WshShell = New-Object -comObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut("${shortcutPath.replace(/\\/g, '\\\\')}")
    $Shortcut.TargetPath = "${exePath.replace(/\\/g, '\\\\')}"
    $Shortcut.Arguments = "--launch=${profile.appId}:${profile.themeId}"
    $Shortcut.WorkingDirectory = "${workingDir.replace(/\\/g, '\\\\')}"
    $Shortcut.Save()
  `;

  return new Promise((resolve) => {
    require('child_process').execFile('powershell.exe', ['-NoProfile', '-Command', script], (error: any) => {
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true, path: shortcutPath });
      }
    });
  });
}

function createMacShortcut(profile: ShortcutProfile): Promise<{ success: boolean; path?: string; error?: string }> {
  const desktopDir = path.join(os.homedir(), 'Desktop');
  const shortcutPath = path.join(desktopDir, `${safeFileStem(profile.label)}.app`);
  const exePath = process.execPath;
  const scriptContent = `
    tell application "Terminal"
      do script "'${exePath}' --launch=${profile.appId}:${profile.themeId}"
    end tell
  `;
  const scriptPath = path.join(desktopDir, `${profile.id}.scpt`);
  fs.writeFileSync(scriptPath, scriptContent);

  return new Promise((resolve) => {
    require('child_process').execFile('osacompile', ['-o', shortcutPath, scriptPath], (error: any) => {
      fs.unlinkSync(scriptPath);
      if (error) {
        resolve({ success: false, error: error.message });
      } else {
        resolve({ success: true, path: shortcutPath });
      }
    });
  });
}

async function createLinuxShortcut(profile: ShortcutProfile): Promise<{ success: boolean; path?: string; error?: string }> {
  const appsDir = path.join(os.homedir(), '.local', 'share', 'applications');
  if (!fs.existsSync(appsDir)) {
    fs.mkdirSync(appsDir, { recursive: true });
  }
  const shortcutPath = path.join(appsDir, `${profile.id}.desktop`);
  const exePath = process.execPath;

  const content = `[Desktop Entry]
Type=Application
Name=${safeFileStem(profile.label)}
Exec="${exePath}" --launch=${profile.appId}:${profile.themeId}
Icon=${profile.icon || 'utilities-terminal'}
Terminal=false
Categories=Utility;
`;

  fs.writeFileSync(shortcutPath, content);
  fs.chmodSync(shortcutPath, 0o755);

  return { success: true, path: shortcutPath };
}
