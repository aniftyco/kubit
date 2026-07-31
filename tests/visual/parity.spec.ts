import { expect, test, type Page } from '@playwright/test';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

/**
 * Parity is measured per component, in isolation, against dedicated fixtures.
 *
 * The case files are the contract. Adding a variant means adding a case, and that
 * case immediately binds both stacks — a case that renders in one and not the
 * other fails rather than quietly skipping.
 *
 * Each case carries its own small tolerance. Both stacks run in the same browser
 * with the same fonts and viewport, so "structurally different, visually
 * identical" lands a pixel or two apart often enough that some tolerance is what
 * keeps the suite worth listening to. Per case, so a fussy component can be
 * tightened on its own.
 */
interface Case {
  name: string;
  props?: Record<string, unknown>;
  slot?: string;
  tolerance?: number;
}

const here = dirname(fileURLToPath(import.meta.url));
const build = resolve(here, 'build');
const failures = resolve(here, 'failures');

const shoot = async (page: Page, file: string) => {
  await page.goto(pathToFileURL(file).href);
  await page.waitForLoadState('networkidle');

  const element = page.locator('[data-kubit-case]');
  await expect(element).toBeVisible();

  return PNG.sync.read(await element.screenshot());
};

const componentFiles = readdirSync(resolve(here, 'cases')).filter((file) => file.endsWith('.json'));

test.describe('visual parity', () => {
  test.skip(!existsSync(build), 'Fixtures not built. Run `npm run fixtures` first.');

  for (const file of componentFiles) {
    const component = basename(file, '.json');
    const cases: Case[] = JSON.parse(readFileSync(resolve(here, 'cases', file), 'utf8'));

    test.describe(component, () => {
      for (const testCase of cases) {
        test(testCase.name, async ({ page }) => {
          const page_ = `${component}--${testCase.name}.html`;
          const bladeFile = resolve(build, 'blade', page_);
          const reactFile = resolve(build, 'react', page_);

          // A case must exist in both stacks. Skipping a missing one would let a
          // component silently ship in one stack and not the other.
          expect(existsSync(bladeFile), `Blade fixture missing for ${page_}`).toBe(true);
          expect(existsSync(reactFile), `React fixture missing for ${page_}`).toBe(true);

          const blade = await shoot(page, bladeFile);
          const react = await shoot(page, reactFile);

          expect(
            { width: react.width, height: react.height },
            `${component}/${testCase.name}: rendered size differs between stacks`
          ).toEqual({ width: blade.width, height: blade.height });

          const diff = new PNG({ width: blade.width, height: blade.height });

          const differing = pixelmatch(blade.data, react.data, diff.data, blade.width, blade.height, {
            threshold: 0.1,
          });

          const ratio = differing / (blade.width * blade.height);

          if (ratio > (testCase.tolerance ?? 0.01)) {
            mkdirSync(failures, { recursive: true });
            writeFileSync(resolve(failures, `${component}--${testCase.name}.diff.png`), PNG.sync.write(diff));
            writeFileSync(resolve(failures, `${component}--${testCase.name}.blade.png`), PNG.sync.write(blade));
            writeFileSync(resolve(failures, `${component}--${testCase.name}.react.png`), PNG.sync.write(react));
          }

          expect(
            ratio,
            `${component}/${testCase.name}: ${(ratio * 100).toFixed(2)}% of pixels differ`
          ).toBeLessThanOrEqual(testCase.tolerance ?? 0.01);
        });
      }
    });
  }
});
