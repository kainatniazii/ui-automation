const { BasePage } = require('../../shared/BasePage');

// Page object for https://rahulshettyacademy.com/upload-download-test/
// A React data table (react-data-table-component) with a Download button
// that exports the table to an .xlsx file, and a file input that loads an
// .xlsx back into the table.
class UploadDownloadPage extends BasePage {
  constructor(page) {
    super(page);

    this.downloadButton = page.locator('#downloadButton');
    this.fileInput      = page.locator('#fileinput');
    this.tableRows      = page.locator('.rdt_TableRow');
    this.firstRow       = page.locator('#row-0');
  }

  async navigate() {
    await this.navigateTo('/upload-download-test/');
    // Wait for the table to render before interacting.
    await this.firstRow.waitFor({ state: 'visible' });
  }

  // ------------------------------------------------------------------ //
  // Download
  // ------------------------------------------------------------------ //

  // Clicks Download, saves the file to destPath, and returns the name the
  // site suggested (e.g. "download.xlsx").
  async downloadFile(destPath) {
    const [download] = await Promise.all([
      this.page.waitForEvent('download'),
      this.downloadButton.click(),
    ]);
    await download.saveAs(destPath);
    return download.suggestedFilename();
  }

  // ------------------------------------------------------------------ //
  // Upload
  // ------------------------------------------------------------------ //

  async uploadFile(filePath) {
    await this.fileInput.setInputFiles(filePath);
  }

  // ------------------------------------------------------------------ //
  // Table reads
  // ------------------------------------------------------------------ //

  async getRowCount() {
    return await this.tableRows.count();
  }

  async getRowText(index) {
    return (await this.page.locator(`#row-${index}`).innerText()).replace(/\s+/g, ' ').trim();
  }

  async getFirstRowText() {
    return await this.getRowText(0);
  }

  // The table row that contains the given text (e.g. a fruit name).
  rowContaining(text) {
    return this.tableRows.filter({ hasText: text });
  }
}

module.exports = { UploadDownloadPage };
