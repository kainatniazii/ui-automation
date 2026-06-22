const { BasePage } = require('../../shared/BasePage');

class InventoryPage extends BasePage {
  constructor(page) {
    super(page);

    this.cartIcon       = page.locator('.shopping_cart_link');
    this.cartBadge      = page.locator('.shopping_cart_badge');
    this.sortDropdown   = page.locator("[data-test='product-sort-container']");
    this.productNames   = page.locator('.inventory_item_name');
    this.productPrices  = page.locator('.inventory_item_price');
    this.inventoryItems = page.locator('.inventory_item');
    this.menuButton     = page.locator('#react-burger-menu-btn');
    this.logoutLink     = page.locator('#logout_sidebar_link');
  }

  async getAllProductNames() {
    return await this.productNames.allTextContents();
  }

  async getAllProductPrices() {
    const raw = await this.productPrices.allTextContents();
    return raw.map(p => parseFloat(p.replace('$', '')));
  }

  async getProductCount() {
    return await this.inventoryItems.count();
  }

  async getCartCount() {
    // The badge is absent (not just empty) when the cart is empty.
    if (await this.cartBadge.count() === 0) return 0;
    const text = await this.cartBadge.textContent();
    return parseInt(text ?? '0', 10);
  }

  async addToCartByName(productName) {
    const slug = productName.toLowerCase().replace(/ /g, '-').replace(/[()]/g, '');
    await this.page.locator(`[data-test='add-to-cart-${slug}']`).click();
  }

  async removeFromCartByName(productName) {
    const slug = productName.toLowerCase().replace(/ /g, '-').replace(/[()]/g, '');
    await this.page.locator(`[data-test='remove-${slug}']`).click();
  }

  async sortBy(option) {
    await this.sortDropdown.selectOption(option);
  }

  async goToCart() {
    await this.cartIcon.click();
  }

  async logout() {
    await this.menuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
    await this.logoutLink.click();
  }

  async clickProduct(name) {
    await this.page.locator('.inventory_item_name', { hasText: name }).click();
  }
}

module.exports = { InventoryPage };