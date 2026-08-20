// tests/navigation.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Multi-Tab Navigation Suite', () => {
  test.use({ storageState: 'auth.json' });

  test('Open Candidate Portfolio in new tab', async ({ page, context }) => {
    await page.goto('/dashboard.html');

    // Wait for new page event while clicking link with target="_blank"
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('#candidatePortfolioLink').click(),
    ]);

    // Ensure new tab loaded
    await newPage.waitForLoadState();

    // Assert assertions on the NEW tab context
    await expect(newPage).toHaveURL(/\/candidate\.html/);
    await expect(newPage.getByRole('heading', { name: 'Candidate Portfolio - External View', level: 1 })).toBeVisible();

    // Close the second tab and return to main tab
    await newPage.close();
    await expect(page).toHaveURL(/\/dashboard\.html/);
  });
});
