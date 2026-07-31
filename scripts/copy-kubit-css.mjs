import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// kubit.css has one home, at the repo root. Both packages ship the same bytes so
// a token change can't land in one stack and not the other; CI asserts it.
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'resources/css/kubit.css');
const target = resolve(root, 'react/dist/kubit.css');

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

console.log(`kubit.css -> ${target}`);
