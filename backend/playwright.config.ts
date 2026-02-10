import { defineConfig } from '@playwright/test';
const PORT = 3001;

export default defineConfig({
  testDir: './e2e',
  // Maximum time one test can run for.
  timeout: 30 * 1000,
  expect: {
    // Maximum time expect() should wait for the condition to be met.
    timeout: 5000,
  },
  // Run tests in files in parallel
  fullyParallel: true,
  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  // Opt out of parallel tests on CI.
  workers: process.env.CI ? 1 : undefined,
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: 'html',
  // Shared settings for all the projects below.
  use: {
    // Base URL to use in actions like `await request.get('/')`.
    baseURL: `http://localhost:${PORT}`,
    // Collect trace when retrying the failed test.
    trace: 'on-first-retry',
  },

  // Configure projects
  projects: [
    {
      name: 'api',
      testMatch: /.*\.spec\.ts/,
    },
  ],

  // Run the backend server before starting the tests.
  webServer: {
    command: 'bun run dev',
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 10000,
    stdout: 'pipe',
  },
});
