const { test: setup } = require('@playwright/test');
const { RegisterPage } = require('./pages/RegisterPage');
const fs = require('fs');
const path = require('path');

const HOME = 'https://eventhub.rahulshettyacademy.com/';
const AUTH_FILE = path.join(__dirname, '.auth', 'account.json');

// Runs once before the eventhub tests (wired as a project dependency in the
// config). Registers a brand-new account each run and saves its credentials,
// so login/booking tests never depend on a stale hardcoded account.
// Tagged @external so excluding @external also skips this setup; otherwise it
// would still run as a dependency project and re-introduce the flakiness.
setup('register a fresh eventhub account', { tag: '@external' }, async ({ page }) => {
  const email = `pw_seed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
  const password = 'Password1!';

  const register = new RegisterPage(page);
  await register.navigate();
  await register.register(email, password);
  await page.waitForURL(HOME);

  fs.mkdirSync(path.dirname(AUTH_FILE), { recursive: true });
  fs.writeFileSync(AUTH_FILE, JSON.stringify({ email, password }, null, 2));
});
