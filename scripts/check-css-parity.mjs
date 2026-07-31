import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * The two packages must ship byte-identical tokens. Without this, a token change
 * can land in one stack and not the other, and the two drift apart in a way that
 * only shows up as a visual diff nobody can explain.
 *
 * Run after `npm run build` in react/.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(root, 'resources/css/kubit.css');
const built = resolve(root, 'react/dist/kubit.css');

let a;
let b;

try {
  a = readFileSync(source);
  b = readFileSync(built);
} catch (error) {
  console.error(`Could not read both theme files. Did you run the react build?\n${error.message}`);
  process.exit(1);
}

if (!a.equals(b)) {
  console.error(`kubit.css differs between ${source} and ${built}.`);
  process.exit(1);
}

console.log('kubit.css is identical across both packages.');
