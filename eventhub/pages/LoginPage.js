const { BasePage } = require('../../shared/BasePage');

class LoginPage extends BasePage {
  constructor(page) {
    super(page);

    this.emailInput     = page.locator('#email');
    this.passwordInput  = page.locator('#password');
    this.signInButton   = page.locator('#login-btn');
    this.registerLink   = page.locator("a[href='/register']");

    // Invalid-credentials toast: "Invalid email or password"
    this.errorMessage   = page.getByText('Invalid email or password');
  }

  async navigate() {
    await this.navigateTo('/login');
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async goToRegister() {
    await this.registerLink.click();
  }
}

module.exports = { LoginPage };
