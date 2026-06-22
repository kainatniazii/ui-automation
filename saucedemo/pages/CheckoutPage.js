const { BasePage } = require('../../shared/BasePage');

class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);

    // --- Cart page ---
    this.cartItems        = page.locator('.cart_item');
    this.cartItemNames    = page.locator('.inventory_item_name');
    this.cartItemPrices   = page.locator('.inventory_item_price');
    this.checkoutButton   = page.locator("[data-test='checkout']");
    this.continueShopBtn  = page.locator("[data-test='continue-shopping']");
    this.removeButtons    = page.locator("[data-test^='remove']");

    // --- Step 1: Your information ---
    this.firstNameInput   = page.locator("[data-test='firstName']");
    this.lastNameInput    = page.locator("[data-test='lastName']");
    this.postalCodeInput  = page.locator("[data-test='postalCode']");
    this.continueButton   = page.locator("[data-test='continue']");
    this.errorMessage     = page.locator("[data-test='error']");

    // --- Step 2: Overview ---
    this.overviewItems    = page.locator('.cart_item');
    this.subtotalLabel    = page.locator('.summary_subtotal_label');
    this.taxLabel         = page.locator('.summary_tax_label');
    this.totalLabel       = page.locator('.summary_total_label');
    this.finishButton     = page.locator("[data-test='finish']");
    this.cancelButton     = page.locator("[data-test='cancel']");

    // --- Step 3: Complete ---
    this.successHeader    = page.locator('.complete-header');
    this.successText      = page.locator('.complete-text');
    this.backHomeButton   = page.locator("[data-test='back-to-products']");
  }

  // ------------------------------------------------------------------ //
  // Cart page methods
  // ------------------------------------------------------------------ //

  async getCartItemCount() {
    return await this.cartItems.count();
  }

  async getCartItemNames() {
    return await this.cartItemNames.allTextContents();
  }

  async getCartItemPrices() {
    const raw = await this.cartItemPrices.allTextContents();
    return raw.map(p => parseFloat(p.replace('$', '')));
  }

  async clickCheckout() {
    await this.checkoutButton.click();
  }

  async clickContinueShopping() {
    await this.continueShopBtn.click();
  }

  // ------------------------------------------------------------------ //
  // Step 1: Fill in customer information
  // ------------------------------------------------------------------ //

  async fillShippingInfo(firstName, lastName, postalCode) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.postalCodeInput.fill(postalCode);
  }

  async clickContinue() {
    await this.continueButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }

  async isErrorVisible() {
    return await this.errorMessage.isVisible();
  }

  // ------------------------------------------------------------------ //
  // Step 2: Overview page methods
  // ------------------------------------------------------------------ //

  async getOverviewItemCount() {
    return await this.overviewItems.count();
  }

  async getSubtotal() {
    const text = await this.subtotalLabel.textContent();
    return parseFloat(text.replace('Item total: $', ''));
  }

  async getTax() {
    const text = await this.taxLabel.textContent();
    return parseFloat(text.replace('Tax: $', ''));
  }

  async getTotal() {
    const text = await this.totalLabel.textContent();
    return parseFloat(text.replace('Total: $', ''));
  }

  async clickFinish() {
    await this.finishButton.click();
  }

  async clickCancel() {
    await this.cancelButton.click();
  }

  // ------------------------------------------------------------------ //
  // Step 3: Confirmation page
  // ------------------------------------------------------------------ //

  async getSuccessHeader() {
    return await this.successHeader.textContent();
  }

  async getSuccessText() {
    return await this.successText.textContent();
  }

  async clickBackHome() {
    await this.backHomeButton.click();
  }

  // ------------------------------------------------------------------ //
  // Full flow helper — does the entire checkout in one call
  // ------------------------------------------------------------------ //

  async completeCheckout(firstName, lastName, postalCode) {
    await this.clickCheckout();
    await this.fillShippingInfo(firstName, lastName, postalCode);
    await this.clickContinue();
    await this.clickFinish();
  }
}

module.exports = { CheckoutPage };