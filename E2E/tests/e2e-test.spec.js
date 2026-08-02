const { test, expect } = require('@playwright/test');
const { RegisterPage } = require('../pages/RegisterPage');
const { LoginPage } = require('../pages/LoginPage');
const { CatalogPage } = require('../pages/CatalogPage');
const { CheckoutPage } = require('../pages/CheckoutPage');

const APP_URL = 'http://localhost:3000';

test.describe('Complete UI E2E Flow (Page Object Model)', () => {

  test('User can register, log in, add product to cart, and checkout', async ({ page, request }) => {
    
    // 0. RESET DB VIA API BEFORE RUNNING UI TEST
    await request.post(`${APP_URL}/api/test/reset`);

    const registerPage = new RegisterPage(page);
    const loginPage = new LoginPage(page);
    const catalogPage = new CatalogPage(page);
    const checkoutPage = new CheckoutPage(page);

    const newUser = {
      email: `ui_shopper_${Date.now()}@example.com`,
      username: `ui_shopper_${Date.now()}`,
      password: 'Password123',
      confirmPassword: 'Password123'
    };

    // STEP 1: Go to Register Page & Create Account
    await page.goto(`${APP_URL}/register`);
    await registerPage.registerUser(newUser);

    // STEP 2: Navigate to Login Page & Sign In
    await page.goto(`${APP_URL}/login`);
    await loginPage.login(newUser.username, newUser.password);
    await expect(page).toHaveURL(`${APP_URL}/catalog`);

    // STEP 3: Add Item to Cart
    await catalogPage.addFirstItemToCart();
    await expect(catalogPage.viewCartBtn).toContainText('1');

    // STEP 4: Proceed to Checkout Page
    await catalogPage.buyFirstItemNow();
    await expect(page).toHaveURL(`${APP_URL}/checkout`);

    // Handle the browser alert triggered upon payment confirmation
    page.once('dialog', dialog => dialog.dismiss().catch(() => {}));

    // STEP 5: Submit Payment Details
    await checkoutPage.completePayment({
      name: 'Umakrishna',
      bank: 'HDFC',
      cardNo: '1234567890',
      cvv: '123'
    });

    // STEP 6: Verify redirection back to catalog
    await expect(page).toHaveURL(`${APP_URL}/catalog`);
  });

});
