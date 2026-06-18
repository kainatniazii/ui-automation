const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../pages/LoginPage');
const users            = require('../test-data/users.json');

test.describe('Login', () => {

  test('valid login redirects to inventory', async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(users.validUser.username, users.validUser.password);
    await expect(page).toHaveURL(/inventory/);
  });

  test('locked user sees error message', async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(users.lockedUser.username, users.lockedUser.password);
    const error = await login.getErrorMessage();
    expect(error.toLowerCase()).toContain('locked out');
  });

  test('invalid credentials shows error', async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(users.invalidUser.username, users.invalidUser.password);
    await expect(page.locator("[data-test='error']")).toBeVisible();
  });

});