const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../pages/DashboardPage');

test.describe('HR Actions Suite (POM)', () => {
  test.use({ storageState: 'auth.json' });

  test('Add and Delete Employee using Page Objects', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.navigate();

    // 1. Add Employee via POM action
    await dashboardPage.addEmployee('David Warner', 'Marketing', 'Lead', '80000');
    await expect(page.getByText('David Warner')).toBeVisible();

    // 2. Setup dialog handler and Delete via POM action
    
    await dashboardPage.deleteEmployee('David Warner');
    page.on('dialog', async (dialog) => await dialog.accept());

    // 3. Verify deletion
    await expect(page.getByText('David Warner')).not.toBeVisible();
  });
});
