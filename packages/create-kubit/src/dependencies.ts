import { setTimeout as sleep } from 'node:timers/promises';

import { exec } from './utils';

export const installDependencies = async (cwd: string) => {
  await exec('npm install', { cwd });
};
