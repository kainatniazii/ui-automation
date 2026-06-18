const { defineConfig, devices } = require('@playwright/test');

// ------------------------------------------------------------------ //
// Each site under test gets its own folder + baseURL.
// Add a new entry here to onboard another website.
// ------------------------------------------------------------------ //
const SITES = [
  { name: 'saucedemo', testDir: './saucedemo/tests', baseURL: 'https://www.saucedemo.com' },
  { name: 'eventhub',  testDir: './eventhub/tests',  baseURL: 'https://eventhub.rahulshettyacademy.com' },
];

const BROWSERS = [
  { name: 'chromium', device: 'Desktop Chrome' },
  { name: 'firefox',  device: 'Desktop Firefox' },
  { name: 'webkit',   device: 'Desktop Safari' },
];

// A setup project that registers a fresh eventhub account before its tests.
// eventhub browser projects depend on it, so it only runs when they do.
const EVENTHUB_BASE = 'https://eventhub.rahulshettyacademy.com';
const projects = [
  {
    name: 'eventhub-setup',
    testDir: './eventhub',
    testMatch: /auth\.setup\.js/,
    use: { ...devices['Desktop Chrome'], baseURL: EVENTHUB_BASE },
  },
];

// Build one Playwright project per (site × browser) combination.
SITES.forEach(site =>
  BROWSERS.forEach(browser => {
    projects.push({
      name: `${site.name}-${browser.name}`,
      testDir: site.testDir,
      use: {
        ...devices[browser.device],
        baseURL: site.baseURL,
      },
      ...(site.name === 'eventhub' ? { dependencies: ['eventhub-setup'] } : {}),
    });
  })
);

module.exports = defineConfig({
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    launchOptions: {
      slowMo: 500,
    },
  },

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  projects,
});
