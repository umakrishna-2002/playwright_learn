const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../pages/LoginPage');

test.describe('Authentication Setup', () => {
  test('Authenticate and generate auth.json state', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.navigate();
    await loginPage.login('admin', 'admin123');

    // Verify successful login
    await expect(page).toHaveURL('/dashboard.html');

    // Save session storage & cookies to auth.json
    await page.context().storageState({ path: 'auth.json' });
  });
});
