const { test, expect } = require('@playwright/test');
const { LoginPage }     = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');
const { CheckoutPage }  = require('../pages/CheckoutPage');
const users             = require('../test-data/users.json');

// ------------------------------------------------------------------ //
// Test data
// ------------------------------------------------------------------ //

const VALID_CUSTOMER = {
  firstName:  'Ahmed',
  lastName:   'Khan',
  postalCode: '25000',
};

const PRODUCTS = {
  backpack:  'Sauce Labs Backpack',
  bikeLight: 'Sauce Labs Bike Light',
  jacket:    'Sauce Labs Fleece Jacket',
};

// ------------------------------------------------------------------ //
// Shared setup — login + add items before each test
// ------------------------------------------------------------------ //

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.navigate();
  await login.login(
    users.validUser.username,
    users.validUser.password
  );
  await page.waitForURL('**/inventory.html');
});

// Helper — adds products and goes to cart
async function addItemsAndGoToCart(page, productNames = [PRODUCTS.backpack]) {
  const inv = new InventoryPage(page);
  for (const name of productNames) {
    await inv.addToCartByName(name);
  }
  await inv.goToCart();
  await page.waitForURL('**/cart.html');
}

// ------------------------------------------------------------------ //
// SUITE 1: Cart page
// ------------------------------------------------------------------ //

test.describe('Cart page', () => {

  test('added items appear correctly in cart', async ({ page }) => {
    await addItemsAndGoToCart(page, [PRODUCTS.backpack, PRODUCTS.bikeLight]);
    const checkout = new CheckoutPage(page);

    const names = await checkout.getCartItemNames();
    expect(names).toContain(PRODUCTS.backpack);
    expect(names).toContain(PRODUCTS.bikeLight);
  });

  test('cart shows correct item count', async ({ page }) => {
    await addItemsAndGoToCart(page, [
      PRODUCTS.backpack,
      PRODUCTS.bikeLight,
      PRODUCTS.jacket,
    ]);
    const checkout = new CheckoutPage(page);
    expect(await checkout.getCartItemCount()).toBe(3);
  });

  test('continue shopping returns to inventory', async ({ page }) => {
    await addItemsAndGoToCart(page);
    const checkout = new CheckoutPage(page);
    await checkout.clickContinueShopping();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('checkout button navigates to step one', async ({ page }) => {
    await addItemsAndGoToCart(page);
    const checkout = new CheckoutPage(page);
    await checkout.clickCheckout();
    await expect(page).toHaveURL(/checkout-step-one/);
  });

});

// ------------------------------------------------------------------ //
// SUITE 2: Step 1 — Customer information
// ------------------------------------------------------------------ //

test.describe('Checkout step 1 — customer information', () => {

  test.beforeEach(async ({ page }) => {
    await addItemsAndGoToCart(page);
    const checkout = new CheckoutPage(page);
    await checkout.clickCheckout();
    await page.waitForURL('**/checkout-step-one.html');
  });

  test('valid information proceeds to step 2', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillShippingInfo(
      VALID_CUSTOMER.firstName,
      VALID_CUSTOMER.lastName,
      VALID_CUSTOMER.postalCode
    );
    await checkout.clickContinue();
    await expect(page).toHaveURL(/checkout-step-two/);
  });

  test('missing first name shows error', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillShippingInfo('', VALID_CUSTOMER.lastName, VALID_CUSTOMER.postalCode);
    await checkout.clickContinue();

    expect(await checkout.isErrorVisible()).toBe(true);
    expect(await checkout.getErrorMessage()).toContain('First Name is required');
  });

  test('missing last name shows error', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillShippingInfo(VALID_CUSTOMER.firstName, '', VALID_CUSTOMER.postalCode);
    await checkout.clickContinue();

    expect(await checkout.isErrorVisible()).toBe(true);
    expect(await checkout.getErrorMessage()).toContain('Last Name is required');
  });

  test('missing postal code shows error', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.fillShippingInfo(VALID_CUSTOMER.firstName, VALID_CUSTOMER.lastName, '');
    await checkout.clickContinue();

    expect(await checkout.isErrorVisible()).toBe(true);
    expect(await checkout.getErrorMessage()).toContain('Postal Code is required');
  });

  test('all fields empty shows error', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.clickContinue();

    expect(await checkout.isErrorVisible()).toBe(true);
  });

});

// ------------------------------------------------------------------ //
// SUITE 3: Step 2 — Order overview
// ------------------------------------------------------------------ //

test.describe('Checkout step 2 — order overview', () => {

  test.beforeEach(async ({ page }) => {
    await addItemsAndGoToCart(page, [PRODUCTS.backpack, PRODUCTS.bikeLight]);
    const checkout = new CheckoutPage(page);
    await checkout.clickCheckout();
    await checkout.fillShippingInfo(
      VALID_CUSTOMER.firstName,
      VALID_CUSTOMER.lastName,
      VALID_CUSTOMER.postalCode
    );
    await checkout.clickContinue();
    await page.waitForURL('**/checkout-step-two.html');
  });

  test('overview shows correct number of items', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    expect(await checkout.getOverviewItemCount()).toBe(2);
  });

  test('total equals subtotal plus tax', async ({ page }) => {
    const checkout = new CheckoutPage(page);

    const subtotal = await checkout.getSubtotal();
    const tax      = await checkout.getTax();
    const total    = await checkout.getTotal();

    // Round to 2 decimal places to avoid floating point issues
    const expected = parseFloat((subtotal + tax).toFixed(2));
    expect(total).toBeCloseTo(expected, 2);
  });

  test('subtotal matches sum of item prices', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    const prices   = await checkout.getCartItemPrices();
    const sum      = parseFloat(prices.reduce((a, b) => a + b, 0).toFixed(2));
    const subtotal = await checkout.getSubtotal();

    expect(subtotal).toBeCloseTo(sum, 2);
  });

  test('cancel from overview returns to inventory', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.clickCancel();
    await expect(page).toHaveURL(/inventory\.html/);
  });

  test('finish button navigates to confirmation', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.clickFinish();
    await expect(page).toHaveURL(/checkout-complete/);
  });

});

// ------------------------------------------------------------------ //
// SUITE 4: Step 3 — Order confirmation
// ------------------------------------------------------------------ //

test.describe('Checkout step 3 — order confirmation', () => {

  test.beforeEach(async ({ page }) => {
    await addItemsAndGoToCart(page);
    const checkout = new CheckoutPage(page);
    await checkout.completeCheckout(
      VALID_CUSTOMER.firstName,
      VALID_CUSTOMER.lastName,
      VALID_CUSTOMER.postalCode
    );
    await page.waitForURL('**/checkout-complete.html');
  });

  test('confirmation page shows success header', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    const header   = await checkout.getSuccessHeader();
    expect(header).toContain('Thank you for your order');
  });

  test('confirmation page shows dispatch message', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    const text     = await checkout.getSuccessText();
    expect(text).toContain('dispatched');
  });

  test('back to products button returns to inventory', async ({ page }) => {
    const checkout = new CheckoutPage(page);
    await checkout.clickBackHome();
    await expect(page).toHaveURL(/inventory\.html/);
  });

});

// ------------------------------------------------------------------ //
// SUITE 5: Full end-to-end happy path
// ------------------------------------------------------------------ //

test.describe('Full E2E checkout flow', () => {

  test('user can complete a full purchase from login to confirmation', async ({ page }) => {

    // Step 1 — Add 3 items to cart
    const inv = new InventoryPage(page);
    await inv.addToCartByName(PRODUCTS.backpack);
    await inv.addToCartByName(PRODUCTS.bikeLight);
    await inv.addToCartByName(PRODUCTS.jacket);
    expect(await inv.getCartCount()).toBe(3);

    // Step 2 — Go to cart and verify items
    await inv.goToCart();
    await page.waitForURL('**/cart.html');
    const checkout = new CheckoutPage(page);
    expect(await checkout.getCartItemCount()).toBe(3);

    // Step 3 — Fill in customer info
    await checkout.clickCheckout();
    await page.waitForURL('**/checkout-step-one.html');
    await checkout.fillShippingInfo(
      VALID_CUSTOMER.firstName,
      VALID_CUSTOMER.lastName,
      VALID_CUSTOMER.postalCode
    );
    await checkout.clickContinue();

    // Step 4 — Verify overview and maths
    await page.waitForURL('**/checkout-step-two.html');
    const subtotal = await checkout.getSubtotal();
    const tax      = await checkout.getTax();
    const total    = await checkout.getTotal();
    expect(total).toBeCloseTo(subtotal + tax, 2);

    // Step 5 — Finish and confirm
    await checkout.clickFinish();
    await page.waitForURL('**/checkout-complete.html');
    const header = await checkout.getSuccessHeader();
    expect(header).toContain('Thank you for your order');

    // Step 6 — Return to inventory
    await checkout.clickBackHome();
    await expect(page).toHaveURL(/inventory\.html/);
  });

});