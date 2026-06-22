const { BasePage } = require('../../shared/BasePage');

class RegisterPage extends BasePage {
  constructor(page) {
    super(page);

    this.emailInput           = page.locator('#register-email');
    this.passwordInput        = page.locator('#register-password');
    this.confirmPasswordInput = page.locator("input[placeholder='Repeat your password']");
    this.createAccountButton  = page.locator('#register-btn');

    // Validation error (e.g. mismatched passwords) renders in a red text node.
    this.errorMessage         = page.locator('.text-red-600');
  }

  async navigate() {
    await this.navigateTo('/register');
  }

  async register(email, password, confirmPassword = password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.createAccountButton.click();
  }
}

module.exports = { RegisterPage };
