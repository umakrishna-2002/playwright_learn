const path = require('path');
class ReportsPage {
    constructor(page) {
        this.page = page;
        this.downloadButton = page.getByRole('button', { name: 'Download Payroll Report (CSV)' });
    }

    async downloadReport(targetPath) {
        const downloadPromise = this.page.waitForEvent('download');

        // click the download trigger
        await this.downloadButton.click();

        // wait for the download to complete
        const download = await downloadPromise;

        await download.saveAs(targetPath);

        return download;
    }
}

module.exports = { ReportsPage };
