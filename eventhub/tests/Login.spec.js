const { test, expect } = require('@playwright/test');
const { LoginPage }    = require('../pages/LoginPage');
const { getAccount }   = require('../test-data/account');
const users            = require('../test-data/users.json');

const HOME = 'https://eventhub.rahulshettyacademy.com/';

test.describe('EventHub — Login', () => {

  test('valid login redirects to home', async ({ page }) => {
    // Uses the account registered by auth.setup.js (fresh each run),
    // so this test never depends on a stale hardcoded account.
    const account = getAccount();
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(account.email, account.password);

    // Assert: landed on home and the logged-in nav is shown.
    await expect(page).toHaveURL(HOME);
    await expect(page.getByText('Logout')).toBeVisible();
  });

  test('invalid credentials shows error and stays on login', async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.login(users.invalidUser.email, users.invalidUser.password);

    // Use auto-waiting assertions: these retry for a few seconds until the
    // error toast appears, instead of checking once and failing if it's slow.
    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText('Invalid email or password');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('register link navigates to register page', async ({ page }) => {
    const login = new LoginPage(page);
    await login.navigate();
    await login.goToRegister();
    await expect(page).toHaveURL(/\/register$/);
  });

});
