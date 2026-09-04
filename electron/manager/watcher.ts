import { spawn, ChildProcess } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

export interface WatcherOptions {
  appId: string;
  themeId: string;
  port: number;
  onThemeApplied?: () => void;
  onError?: (error: Error) => void;
}

export class Watcher {
  private appId: string;
  private themeId: string;
  private port: number;
  private onThemeApplied?: () => void;
  private onError?: (error: Error) => void;
  private interval: NodeJS.Timeout | null = null;
  private lastAppliedTheme: string | null = null;

  constructor(options: WatcherOptions) {
    this.appId = options.appId;
    this.themeId = options.themeId;
    this.port = options.port;
    this.onThemeApplied = options.onThemeApplied;
    this.onError = options.onError;
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => this.check(), 5000);
    this.check();
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  setTheme(themeId: string) {
    this.themeId = themeId;
    this.check();
  }

  private async check() {
    try {
      // Check if CDP port is listening
      if (!await this.isPortListening(this.port)) {
        return;
      }

      // Check if theme is applied
      const { getStatus } = await import('./injector');
      const status = await getStatus(this.appId, this.port);
      
      if (!status.installed || status.themeId !== this.themeId) {
        // Apply theme
        const { applyTheme } = await import('./injector');
        const result = await applyTheme(this.appId, this.themeId, this.port);
        if (result.success) {
          this.lastAppliedTheme = this.themeId;
          this.onThemeApplied?.();
        } else {
          this.onError?.(new Error(result.error || 'Failed to apply theme'));
        }
      }
    } catch (error) {
      this.onError?.(error as Error);
    }
  }

  private async isPortListening(port: number): Promise<boolean> {
    const net = require('net');
    return new Promise((resolve) => {
      const client = new net.Socket();
      client.connect(port, '127.0.0.1', () => {
        client.end();
        resolve(true);
      });
      client.on('error', () => resolve(false));
      setTimeout(() => {
        client.destroy();
        resolve(false);
      }, 1000);
    });
  }
}

// Platform-specific persistence
export class PersistenceManager {
  static async ensureAutoStart(appId: string, themeId: string): Promise<void> {
    const platform = os.platform();
    
    if (platform === 'darwin') {
      await this.ensureDarwinLaunchAgent(appId, themeId);
    } else if (platform === 'win32') {
      await this.ensureWindowsTask(appId, themeId);
    } else if (platform === 'linux') {
      await this.ensureLinuxSystemd(appId, themeId);
    }
  }

  static async removeAutoStart(appId: string): Promise<void> {
    const platform = os.platform();
    
    if (platform === 'darwin') {
      await this.removeDarwinLaunchAgent(appId);
    } else if (platform === 'win32') {
      await this.removeWindowsTask(appId);
    } else if (platform === 'linux') {
      await this.removeLinuxSystemd(appId);
    }
  }

  private static async ensureDarwinLaunchAgent(appId: string, themeId: string): Promise<void> {
    const plistName = `com.dreamwork.theme.${appId}`;
    const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', `${plistName}.plist`);
    const scriptPath = process.execPath;
    
    const plistContent = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${plistName}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${scriptPath}</string>
    <string>--launch=${appId}:${themeId}</string>
  </array>
  <key>RunAtLoad</key>
  <true/>
  <key>KeepAlive</key>
  <true/>
</dict>
</plist>`;

    fs.mkdirSync(path.dirname(plistPath), { recursive: true });
    fs.writeFileSync(plistPath, plistContent);
    
    // Load the agent（参数数组 + shell 关闭，避免任何拼接进 shell 的可能）
    const { execFile } = require('child_process');
    await new Promise<void>((resolve, reject) => {
      execFile('launchctl', ['load', plistPath], (error: any) => {
        if (error) reject(error);
        else resolve();
      });
    });
  }

  private static async removeDarwinLaunchAgent(appId: string): Promise<void> {
    const plistName = `com.dreamwork.theme.${appId}`;
    const plistPath = path.join(os.homedir(), 'Library', 'LaunchAgents', `${plistName}.plist`);

    if (fs.existsSync(plistPath)) {
      const { execFile } = require('child_process');
      await new Promise<void>((resolve) => {
        execFile('launchctl', ['unload', plistPath], () => resolve());
      });
      fs.rmSync(plistPath, { force: true });
    }
  }

  private static async ensureWindowsTask(appId: string, themeId: string): Promise<void> {
    const { spawnSync } = require('child_process');
    // 自动启动标识来自 UI 输入：白名单校验后再参与任何进程调用
    if (!/^[a-z0-9-]+$/i.test(appId) || !/^[a-z0-9-]+$/i.test(themeId)) {
      throw new Error(`Invalid auto-launch identifiers: ${appId} / ${themeId}`);
    }
    const taskName = `DreamWorkTheme_${appId}`;
    const exePath = process.execPath;

    // Remove existing task
    await new Promise<void>((resolve) => {
      spawnSync('schtasks', ['/Delete', '/TN', taskName, '/F'], { stdio: 'ignore' });
      resolve();
    });

    // Create new task
    await new Promise<void>((resolve, reject) => {
      const result = spawnSync('schtasks', ['/Create', '/TN', taskName, '/TR', `${exePath} --launch=${appId}:${themeId}`, '/SC', 'ONLOGON', '/RL', 'HIGHEST', '/F'], { stdio: 'ignore' });
      if (result.error) reject(result.error);
      else if (result.status !== 0) reject(new Error(`schtasks exited with ${result.status}`));
      else resolve();
    });
  }

  private static async removeWindowsTask(appId: string): Promise<void> {
    const { spawnSync } = require('child_process');
    const taskName = `DreamWorkTheme_${appId}`;
    await new Promise<void>((resolve) => {
      spawnSync('schtasks', ['/Delete', '/TN', taskName, '/F'], { stdio: 'ignore' });
      resolve();
    });
  }

  private static async ensureLinuxSystemd(appId: string, themeId: string): Promise<void> {
    const serviceName = `dream-work-theme-${appId}`;
    const servicePath = path.join(os.homedir(), '.config', 'systemd', 'user', `${serviceName}.service`);
    const exePath = process.execPath;
    
    const serviceContent = `[Unit]
Description=Dream Work Theme - ${appId}

[Service]
ExecStart=${exePath} --launch=${appId}:${themeId}
Restart=always

[Install]
WantedBy=default.target
`;

    fs.mkdirSync(path.dirname(servicePath), { recursive: true });
    fs.writeFileSync(servicePath, serviceContent);

    const { execFile } = require('child_process');
    await new Promise<void>((resolve) => {
      execFile('systemctl', ['--user', 'daemon-reload'], (error: any) => {
        if (error) console.error('Failed to reload systemd:', error);
        execFile('systemctl', ['--user', 'enable', '--now', serviceName], (enableError: any) => {
          if (enableError) console.error('Failed to enable systemd service:', enableError);
          resolve();
        });
      });
    });
  }

  private static async removeLinuxSystemd(appId: string): Promise<void> {
    const serviceName = `dream-work-theme-${appId}`;
    const servicePath = path.join(os.homedir(), '.config', 'systemd', 'user', `${serviceName}.service`);

    const { execFile } = require('child_process');
    await new Promise<void>((resolve) => {
      execFile('systemctl', ['--user', 'disable', '--now', serviceName], () => resolve());
    });
    fs.rmSync(servicePath, { force: true });
  }
}
