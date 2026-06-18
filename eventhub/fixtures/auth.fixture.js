const { test: base, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { getAccount } = require('../test-data/account');

const HOME = 'https://eventhub.rahulshettyacademy.com/';

// Provides a `loggedInPage` already authenticated with the account registered
// by auth.setup.js, so tests for events/bookings don't repeat the login steps.
const test = base.extend({
  loggedInPage: async ({ page }, use) => {
    const account = getAccount();
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(account.email, account.password);
    await page.waitForURL(HOME);
    await use(page);
  },
});

module.exports = { test, expect };
