import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';

export const exec = async (command: string, options?: { cwd: string }) => promisify(_exec)(command, options);

export const colors = {
  escape: (str: string) => `\x1b[${str}m`,
  bold: (str: string) => `\x1b[1m${str}\x1b[22m`,
  dim: (str: string) => `\x1b[2m${str}\x1b[22m`,
  green: (str: string) => `\x1b[32m${str}\x1b[39m`,
  magenta: (str: string) => `\x1b[35m${str}\x1b[39m`,
  cyan: (str: string) => `\x1b[36m${str}\x1b[39m`,
};
