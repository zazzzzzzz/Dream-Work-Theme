import * as os from 'os';
import { APP_DEFINITIONS } from './app-registry';
import { resolveWindowsAppExecutable } from './app-path-resolver';

export interface DiscoveredApp {
  appId: string;
  name: string;
  path: string;
  pid?: number;
}

export async function discoverApps(): Promise<DiscoveredApp[]> {
  if (os.platform() !== 'win32') return [];

  const results: DiscoveredApp[] = [];
  for (const definition of APP_DEFINITIONS) {
    const executablePath = await resolveWindowsAppExecutable(definition.id);
    if (executablePath) {
      results.push({ appId: definition.id, name: definition.name, path: executablePath });
    }
  }
  return results;
}
