import { setTimeout as sleep } from 'node:timers/promises';

import { exec } from './utils';

export const initializeGit = async (cwd: string) => {
  await exec('git init', { cwd });
};
