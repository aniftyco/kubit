import { pathExistsSync } from 'fs-extra';
import { resolve } from 'path';

/**
 * Returns the package manager in use by checking for the lock files
 * on the disk or by inspecting the "npm_config_user_agent".
 *
 * Defaults to npm when unable to detect the package manager.
 */
export function getPackageManager(appRoot: string): 'yarn' | 'pnpm' | 'npm' {
  if (pathExistsSync(resolve(appRoot, 'yarn.lock'))) {
    return 'yarn';
  }

  if (pathExistsSync(resolve(appRoot, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }

  if (process.env.npm_config_user_agent) {
    if (process.env.npm_config_user_agent.includes('yarn')) {
      return 'yarn';
    }

    if (process.env.npm_config_user_agent.includes('pnpm')) {
      return 'pnpm';
    }
  }

  return 'npm';
}
