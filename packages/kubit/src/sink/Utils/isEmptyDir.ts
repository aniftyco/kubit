import { readdirSync } from 'fs';

/**
 * Returns a boolean telling if a directory is empty or
 * not.
 */
export function isEmptyDir(location: string): boolean {
  try {
    const files = readdirSync(location);
    return files.length === 0;
  } catch (error) {
    return error.code === 'ENOENT';
  }
}
