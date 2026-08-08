import React, { useEffect, useState } from 'react';
import { getAppInitials } from '../app-initials';

export interface AppInfo {
  appId: string;
  name: string;
  path: string;
}

interface AppPathConfiguration {
  appId: string;
  name: string;
  exeNames: string[];
  customPath?: string;
  customPathStatus: 'none' | 'valid' | 'invalid';
}

interface StatusInfo {
  installed: boolean;
  menu: boolean;
  themeId?: string;
  targets?: number;
  running?: boolean;
}

interface SettingsProps {
  apps: AppInfo[];
  statuses: Record<string, StatusInfo>;
  onRefresh: () => Promise<void>;
  onAppsChanged: () => Promise<void>;
}

export function Settings({ apps, statuses, onRefresh, onAppsChanged }: SettingsProps) {
  const [pathConfigs, setPathConfigs] = useState<AppPathConfiguration[]>([]);
  const [busyAppId, setBusyAppId] = useState<string | null>(null);
  const [pathMessage, setPathMessage] = useState('');

  const loadPathConfigs = async () => {
    try {
      setPathConfigs(await window.dreamWork.listAppPathConfigurations());
    } catch (error) {
      console.error('Failed to load app path configurations:', error);
      setPathMessage('无法读取自定义应用路径配置。');
    }
  };

  useEffect(() => {
    void loadPathConfigs();
  }, []);

  const handleChoosePath = async (appId: string) => {
    setBusyAppId(appId);
    setPathMessage('');
    try {
      const result = await window.dreamWork.chooseCustomAppPath(appId);
      if (result.success) {
        setPathMessage('自定义路径已保存，将优先于自动扫描使用。');
        await loadPathConfigs();
        await onAppsChanged();
      } else if (!result.cancelled) {
        setPathMessage(result.error || '无法保存自定义路径。');
      }
    } catch (error) {
      console.error('Failed to select app path:', error);
      setPathMessage('选择应用路径时发生错误。');
    } finally {
      setBusyAppId(null);
    }
  };

  const handleClearPath = async (appId: string) => {
    setBusyAppId(appId);
    setPathMessage('');
    try {
      const result = await window.dreamWork.clearCustomAppPath(appId);
      if (!result.success) {
        setPathMessage(result.error || '无法清除自定义路径。');
        return;
      }
      setPathMessage('已恢复为自动扫描路径。');
      await loadPathConfigs();
      await onAppsChanged();
    } catch (error) {
      console.error('Failed to clear app path:', error);
      setPathMessage('清除应用路径时发生错误。');
    } finally {
      setBusyAppId(null);
    }
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">应用设置</h1>
        <p className="page-subtitle">管理已安装应用的状态，并为非标准安装位置选择可执行文件。</p>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>自定义应用路径</h2>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            仅支持已内置注册的 Windows 应用。所选 .exe 会优先于自动扫描使用，清除后恢复自动检测。
          </p>
        </div>

        {pathMessage && (
          <div className="status-bar" style={{ marginBottom: '12px' }}>
            {pathMessage}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {pathConfigs.map((config) => {
            const isBusy = busyAppId === config.appId;
            const hasPath = Boolean(config.customPath);
            const statusText = config.customPathStatus === 'valid'
              ? '已配置'
              : config.customPathStatus === 'invalid'
                ? '路径已失效'
                : '自动扫描';
            const statusColor = config.customPathStatus === 'valid'
              ? 'var(--ok)'
              : config.customPathStatus === 'invalid'
                ? 'var(--danger)'
                : 'var(--text-tertiary)';

            return (
              <div
                key={config.appId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '12px 14px',
                  background: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div className="app-card-icon" style={{ flexShrink: 0 }}>
                  {getAppInitials(config.appId, config.name)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{config.name}</span>
                    <span style={{ fontSize: '11px', color: statusColor }}>{statusText}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: config.customPath ? '3px' : 0 }}>
                    可选文件：{config.exeNames.join(' / ')}
                  </div>
                  {config.customPath && (
                    <div style={{ fontSize: '11px', color: config.customPathStatus === 'invalid' ? 'var(--danger)' : 'var(--text-secondary)', fontFamily: 'monospace', overflowWrap: 'anywhere' }}>
                      {config.customPath}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button className="btn btn-ghost" disabled={isBusy} onClick={() => void handleChoosePath(config.appId)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                    {isBusy ? '处理中…' : '选择 .exe'}
                  </button>
                  {hasPath && (
                    <button className="btn btn-ghost" disabled={isBusy} onClick={() => void handleClearPath(config.appId)} style={{ padding: '6px 10px', fontSize: '12px' }}>
                      清除
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>已发现应用</h2>
          <button className="btn btn-ghost" onClick={() => void onRefresh()} style={{ padding: '6px 12px', fontSize: '12px' }}>
            刷新状态
          </button>
        </div>

        {apps.length === 0 ? (
          <div className="empty-state" style={{ padding: '24px' }}>
            <div className="empty-state-icon">⌕</div>
            <div className="empty-state-title">未检测到应用</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {apps.map((app) => {
              const status = statuses[app.appId];
              return (
                <div key={app.appId} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px', background: 'var(--bg-surface)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <div className="app-card-icon" style={{ flexShrink: 0 }}>{getAppInitials(app.appId, app.name)}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '2px' }}>{app.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', fontFamily: 'monospace', overflowWrap: 'anywhere' }}>{app.path}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>主题</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: status?.installed ? 'var(--ok)' : 'var(--text-tertiary)' }}>{status?.installed ? '已注入' : '未注入'}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>菜单</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: status?.menu ? 'var(--ok)' : 'var(--text-tertiary)' }}>{status?.menu ? '显示中' : '隐藏'}</div>
                    </div>
                    {status?.themeId && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '2px' }}>当前主题</div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--accent)' }}>{status.themeId}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card">
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px' }}>关于</h2>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p style={{ marginBottom: '8px' }}><strong style={{ color: 'var(--text)' }}>Dream Work Theme</strong> 通过 Chrome DevTools Protocol 在运行时注入主题，不修改目标应用的安装文件。</p>
          <p>下载的社区主题保存在 <code style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px', fontSize: '12px' }}>%APPDATA%\dream-work-theme\themes</code>。</p>
        </div>
      </div>
    </div>
  );
}
