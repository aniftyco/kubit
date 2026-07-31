import { defineConfig, devices } from '@playwright/test';

/**
 * Both fixtures are static pages loaded over file://, so there is no server to
 * manage and both stacks render in the same browser with the same fonts and
 * viewport. Differences therefore trace to structure.
 */
export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    ...devices['Desktop Chrome'],
    deviceScaleFactor: 1,
  },
});
