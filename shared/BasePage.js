class BasePage {
  constructor(page) {
    this.page = page;
  }

  // ------------------------------------------------------------------ //
  // Navigation
  // ------------------------------------------------------------------ //

  async navigateTo(path = '/') {
    await this.page.goto(path);
  }

  async getCurrentUrl() {
    return this.page.url();
  }

  async getPageTitle() {
    return await this.page.title();
  }

  async goBack() {
    await this.page.goBack();
  }

  async reload() {
    await this.page.reload();
  }

  // ------------------------------------------------------------------ //
  // Waiting for elements
  // ------------------------------------------------------------------ //

  async waitForElement(selector) {
    await this.page.locator(selector).waitFor({ state: 'visible' });
  }

  async waitForElementToDisappear(selector) {
    await this.page.locator(selector).waitFor({ state: 'hidden' });
  }

  async waitForUrl(urlPattern) {
    await this.page.waitForURL(urlPattern);
  }

  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  // ------------------------------------------------------------------ //
  // Element interactions
  // ------------------------------------------------------------------ //

  async click(selector) {
    await this.page.locator(selector).click();
  }

  async fill(selector, value) {
    await this.page.locator(selector).fill(value);
  }

  async clearAndFill(selector, value) {
    await this.page.locator(selector).clear();
    await this.page.locator(selector).fill(value);
  }

  async selectOption(selector, value) {
    await this.page.locator(selector).selectOption(value);
  }

  async hover(selector) {
    await this.page.locator(selector).hover();
  }

  async pressKey(key) {
    await this.page.keyboard.press(key);
  }

  // ------------------------------------------------------------------ //
  // Reading element content
  // ------------------------------------------------------------------ //

  async getText(selector) {
    return await this.page.locator(selector).textContent();
  }

  async getInputValue(selector) {
    return await this.page.locator(selector).inputValue();
  }

  async getAttribute(selector, attribute) {
    return await this.page.locator(selector).getAttribute(attribute);
  }

  // ------------------------------------------------------------------ //
  // Visibility checks
  // ------------------------------------------------------------------ //

  async isVisible(selector) {
    return await this.page.locator(selector).isVisible();
  }

  async isEnabled(selector) {
    return await this.page.locator(selector).isEnabled();
  }

  async isChecked(selector) {
    return await this.page.locator(selector).isChecked();
  }

  async isHidden(selector) {
    return await this.page.locator(selector).isHidden();
  }

  // ------------------------------------------------------------------ //
  // Screenshots — useful for debugging failures
  // ------------------------------------------------------------------ //

  async takeScreenshot(name) {
    await this.page.screenshot({
      path: `test-results/screenshots/${name}.png`,
      fullPage: true,
    });
  }

  // ------------------------------------------------------------------ //
  // Scroll helpers
  // ------------------------------------------------------------------ //

  async scrollToBottom() {
    await this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  }

  async scrollToTop() {
    await this.page.evaluate(() => window.scrollTo(0, 0));
  }

  async scrollToElement(selector) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  // ------------------------------------------------------------------ //
  // Alert / dialog handling
  // ------------------------------------------------------------------ //

  async acceptDialog() {
    this.page.once('dialog', dialog => dialog.accept());
  }

  async dismissDialog() {
    this.page.once('dialog', dialog => dialog.dismiss());
  }

  async getDialogMessage() {
    return new Promise(resolve => {
      this.page.once('dialog', dialog => {
        resolve(dialog.message());
        dialog.accept();
      });
    });
  }

  // ------------------------------------------------------------------ //
  // Local storage helpers — useful for React apps
  // ------------------------------------------------------------------ //

  async getLocalStorageItem(key) {
    return await this.page.evaluate(k => localStorage.getItem(k), key);
  }

  async setLocalStorageItem(key, value) {
    await this.page.evaluate(
      ({ k, v }) => localStorage.setItem(k, v),
      { k: key, v: value }
    );
  }

  async clearLocalStorage() {
    await this.page.evaluate(() => localStorage.clear());
  }

  // ------------------------------------------------------------------ //
  // Cookie helpers
  // ------------------------------------------------------------------ //

  async getCookies() {
    return await this.page.context().cookies();
  }

  async clearCookies() {
    await this.page.context().clearCookies();
  }

  // ------------------------------------------------------------------ //
  // Count
  // ------------------------------------------------------------------ //

  async getElementCount(selector) {
    return await this.page.locator(selector).count();
  }
}

module.exports = { BasePage };