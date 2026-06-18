const fs = require('fs');
const path = require('path');
const users = require('./users.json');

const AUTH_FILE = path.join(__dirname, '..', '.auth', 'account.json');

// Returns the freshly-registered account created by auth.setup.js.
// Falls back to the static seeded account if the setup hasn't run
// (e.g. running a single spec with dependencies disabled).
function getAccount() {
  try {
    return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8'));
  } catch {
    return users.validUser;
  }
}

module.exports = { getAccount };
