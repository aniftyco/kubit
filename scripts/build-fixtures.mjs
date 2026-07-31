import { execFileSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Build everything the visual parity suite needs:
 *
 *   1. the React package, since the renderer imports its built output
 *   2. both stacks' case pages, into one build directory
 *   3. one stylesheet, compiled over the pages both stacks just emitted
 *
 * Step 3 is the point. A single CSS build shared by both fixtures means any pixel
 * difference traces to markup, not to two Tailwind runs seeing different inputs.
 */
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = (command, args) => execFileSync(command, args, { cwd: root, stdio: 'inherit' });

rmSync(resolve(root, 'tests/visual/build'), { recursive: true, force: true });

run('npm', ['run', 'build', '--workspace', 'kubit']);

run('php', ['scripts/render-blade.php']);
run('node', ['scripts/render-react.mjs']);

run('npx', ['@tailwindcss/cli', '--input', 'tests/visual/fixture.css', '--output', 'tests/visual/build/fixture.css']);

console.log('\nFixtures built to tests/visual/build.');
