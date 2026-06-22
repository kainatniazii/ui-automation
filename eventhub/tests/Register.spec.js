const { test, expect } = require('@playwright/test');
const { RegisterPage } = require('../pages/RegisterPage');
const users            = require('../test-data/users.json');

// Registration needs a unique email each run, otherwise the API rejects duplicates.
function uniqueEmail(prefix = 'pw_reg') {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}@example.com`;
}

test.describe('EventHub — Register', () => {

  test('valid registration redirects to home', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.navigate();
    await register.register(uniqueEmail(), users.password);

    // Successful sign-up lands on the home page.
    await expect(page).toHaveURL('https://eventhub.rahulshettyacademy.com/');
  });

  test('mismatched passwords shows error and stays on register', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.navigate();
    await register.register(uniqueEmail(), users.password, 'Different1!');

    // Auto-waiting assertions: retry until the validation error renders,
    // instead of checking once and failing if it's a moment slow.
    await expect(register.errorMessage.first()).toBeVisible();
    await expect(register.errorMessage.first()).toContainText('Passwords do not match');
    await expect(page).toHaveURL(/\/register$/);
  });

  test('weak password is rejected', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.navigate();
    await register.register(uniqueEmail(), users.weakPassword);

    // Password fails the strength rules — submission does not proceed.
    await expect(page).toHaveURL(/\/register$/);
  });

  test('duplicate email shows "already registered" error', async ({ page }) => {
    const email = uniqueEmail('pw_dup');
    const register = new RegisterPage(page);

    // First registration succeeds.
    await register.navigate();
    await register.register(email, users.password);
    await expect(page).toHaveURL('https://eventhub.rahulshettyacademy.com/');

    // Re-registering the same email is rejected.
    await register.navigate();
    await register.register(email, users.password);
    await expect(page.getByText('Email already registered')).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
  });

});
