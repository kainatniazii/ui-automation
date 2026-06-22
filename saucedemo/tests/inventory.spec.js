const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const users             = require('../test-data/users.json');

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login(users.validUser.username, users.validUser.password);
  await page.waitForURL('**/inventory.html');
});

test.describe('Inventory page', () => {

  test('shows 6 products', async ({ page }) => {
    const inv = new InventoryPage(page);
    await expect(inv.inventoryItems).toHaveCount(6);
  });

  test('all products have positive price', async ({ page }) => {
    const inv = new InventoryPage(page);
    const prices = await inv.getAllProductPrices();
    prices.forEach(p => expect(p).toBeGreaterThan(0));
  });

  test('add single item updates cart badge', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.addToCartByName('Sauce Labs Backpack');
    await expect(inv.cartBadge).toHaveText('1');
  });

  test('remove item decrements cart', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.addToCartByName('Sauce Labs Backpack');
    await inv.addToCartByName('Sauce Labs Bike Light');
    await inv.removeFromCartByName('Sauce Labs Backpack');
    await expect(inv.cartBadge).toHaveText('1');
  });

  test('sort by price low to high', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.sortBy('lohi');
    const prices = await inv.getAllProductPrices();
    expect(prices).toEqual([...prices].sort((a, b) => a - b));
  });

  test('sort by name A to Z', async ({ page }) => {
    const inv = new InventoryPage(page);

    // Arrange: force a non-alphabetical starting order so the A→Z
    // sort has to actually reorder the list (default order is already A→Z).
    await inv.sortBy('za');
    const reversed = await inv.getAllProductNames();
    expect(reversed).toEqual([...reversed].sort().reverse());

    // Act
    await inv.sortBy('az');
    const names = await inv.getAllProductNames();

    // Assert: alphabetical AND genuinely changed from the Z→A order
    expect(names).toEqual([...names].sort());
    expect(names).not.toEqual(reversed);
  });

  test('clicking product opens detail page', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.clickProduct('Sauce Labs Backpack');
    await expect(page).toHaveURL(/inventory-item/);
  });

  test('logout returns to login page', async ({ page }) => {
    const inv = new InventoryPage(page);
    await inv.logout();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

});