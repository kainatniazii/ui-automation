const { test as base, expect } = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const users             = require('../test-data/users.json');

const test = base.extend({

  // Gives you a logged-in page automatically
  loggedInPage: async ({ page }, use) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(
      users.validUser.username,
      users.validUser.password
    );
    await page.waitForURL('**/inventory.html');
    await use(page);
  },

  // Gives you InventoryPage already logged in
  inventoryPage: async ({ loggedInPage }, use) => {
    const inv = new InventoryPage(loggedInPage);
    await use(inv);
  },

});

module.exports = { test, expect };