import * as git from 'download-git-repo';
import { promises as fs } from 'node:fs';
import { tmpdir } from 'node:os';

const tmp = async () => fs.realpath(tmpdir());

const download = async (repo: string, path: string) => {
  return new Promise<void>((resolve, reject) => {
    git(repo, path, (err: Error) => {
      return err ? reject(err) : resolve();
    });
  });
};

export const scaffold = async (path: string) => {
  const dir = await tmp();
  await download('aniftyco/kubit', dir);
  await fs.rename(`${dir}/templates/web`, path);
};
