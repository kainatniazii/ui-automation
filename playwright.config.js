const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',

  use: {
    baseURL: 'https://www.saucedemo.com',
    // Keep a trace for local failures too, not just on retry.
    trace: process.env.CI ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // Run headless by default (and always in CI). Opt into a headed,
    // slowed-down run locally with HEADED=1 for debugging.
    headless: process.env.CI ? true : !process.env.HEADED,
    launchOptions: {
      slowMo: process.env.HEADED ? 500 : 0,
    },
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});