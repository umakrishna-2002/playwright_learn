const { test, expect } = require('@playwright/test');
const { DashboardPage } = require('../pages/DashboardPage');
const { ReportsPage } = require('../pages/ReportsPage');
const path = require('path');

test.describe('Download Payroll Report', () => {
    test.use({ storageState: 'auth.json' });

    test('Navigate to Reports and DOwnload the payroll Report', async ({ page }) => {
        const dashboard = new DashboardPage(page);
        const reportsPage = new ReportsPage(page);

        // going to Reports page from main dashboard

        await dashboard.navigate();
        await  dashboard.goToReports();
        await expect(page).toHaveURL('/reports.html');
        

        // defining target save path for the downloaded file
        const targetPath = path.join(__dirname, '../downloads/payroll_report.csv');

        // Trigger the download and save the file to the specified path
        const  download = await reportsPage.downloadReport(targetPath);

      expect(download.suggestedFilename()).toContain('payroll_report');
    expect(download.suggestedFilename().endsWith('.csv')).toBeTruthy();
  });
}); 


