import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Both stacks must pin the same Tabler version.
 *
 * A missing icon on one side is obvious. A *redrawn* one is exactly the kind of
 * difference nobody notices until it looks wrong, which is why this is a build
 * gate rather than something to check by eye.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const composer = JSON.parse(readFileSync(resolve(root, 'composer.json'), 'utf8'));
const npm = JSON.parse(readFileSync(resolve(root, 'react/package.json'), 'utf8'));

const php = composer.require['secondnetwork/blade-tabler-icons'];
const js = npm.dependencies['@tabler/icons-react'];

// Compare major.minor; the packages publish patch releases independently.
const minor = (constraint) =>
  constraint
    .replace(/^[^\d]*/, '')
    .split('.')
    .slice(0, 2)
    .join('.');

if (minor(php) !== minor(js)) {
  console.error(
    `Tabler versions differ.\n` +
      `  secondnetwork/blade-tabler-icons: ${php} (${minor(php)})\n` +
      `  @tabler/icons-react:              ${js} (${minor(js)})`
  );
  process.exit(1);
}

console.log(`Tabler pinned to ${minor(php)} in both stacks.`);
