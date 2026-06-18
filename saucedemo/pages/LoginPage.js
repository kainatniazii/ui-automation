const { BasePage } = require('./BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.usernameInput = page.locator('#user-name');
    this.passwordInput = page.locator('#password');
    this.loginButton   = page.locator('#login-button');
    this.errorMsg      = page.locator("[data-test='error']");
  }

  async navigate() {
    await this.navigateTo('/');
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async getErrorMessage() {
    return await this.errorMsg.textContent();
  }

  async isErrorVisible() {
    return await this.errorMsg.isVisible();
  }
}

module.exports = { LoginPage };