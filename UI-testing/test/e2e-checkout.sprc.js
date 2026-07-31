const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');
const { InventoryPage } = require('../pages/InventoryPage');

test.describe('E-Commerce Core User Journeys', () => {
  let loginPage;
  let inventoryPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    inventoryPage = new InventoryPage(page);
    await loginPage.navigate();
  });

  test('Should log in successfully and verify inventory page', async ({ page }) => {
    await loginPage.login('standard_user', 'secret_sauce');
    await expect(inventoryPage.title).toBeVisible();
    await expect(page).toHaveURL(/.*inventory.html/);
  });

  test('Should add product to cart and verify cart count', async () => {
    await loginPage.login('standard_user', 'secret_sauce');
    await inventoryPage.addBackpackToCart();
    await expect(inventoryPage.cartBadge).toHaveText('1');
  });

  test('Should display error for locked out user', async () => {
    await loginPage.login('locked_out_user', 'secret_sauce');
    await expect(loginPage.errorMessage).toContainText('Epic sadface: Sorry, this user has been locked out.');
  });
});
