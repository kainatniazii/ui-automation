const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { UploadDownloadPage } = require('../pages/UploadDownloadPage');
const { readRows, setFruitField } = require('../test-data/excel');
const expected = require('../test-data/expected.json');

test.describe('Download', () => {

  test('Download button saves a non-empty .xlsx file', async ({ page }, testInfo) => {
    const ud = new UploadDownloadPage(page);
    await ud.navigate();

    const dest = testInfo.outputPath(expected.downloadFilename);
    const filename = await ud.downloadFile(dest);

    // The site offers an Excel file.
    expect(filename).toBe(expected.downloadFilename);
    expect(fs.existsSync(dest)).toBe(true);

    // .xlsx files are zip archives, so a valid one starts with the "PK" signature.
    const bytes = fs.readFileSync(dest);
    expect(bytes.length).toBeGreaterThan(0);
    expect(bytes.slice(0, 2).toString('latin1')).toBe('PK');
  });

});

test.describe('Upload', () => {

  test('uploading the downloaded file re-populates the table (round trip)', async ({ page }, testInfo) => {
    const ud = new UploadDownloadPage(page);
    await ud.navigate();

    // Capture the table as it loads, then download it.
    const rowsBefore = await ud.getRowCount();
    const firstBefore = await ud.getFirstRowText();
    expect(rowsBefore).toBe(expected.firstPageRowCount);
    expect(firstBefore).toBe(expected.firstRow);

    const dest = testInfo.outputPath('roundtrip.xlsx');
    await ud.downloadFile(dest);

    // Re-upload the exact file and confirm the table renders the same data.
    // This exercises the full upload path: setInputFiles -> the page parses
    // the .xlsx -> the table re-renders from the file's contents.
    await ud.uploadFile(dest);
    await expect(ud.tableRows).toHaveCount(expected.firstPageRowCount);
    expect(await ud.getFirstRowText()).toBe(expected.firstRow);
  });

  test('editing the downloaded file changes what the table shows', async ({ page }, testInfo) => {
    const ud = new UploadDownloadPage(page);
    await ud.navigate();

    // 1. Download the workbook.
    const file = testInfo.outputPath('edited.xlsx');
    await ud.downloadFile(file);

    // 2. Edit Mango's price in the file itself (299 -> 999).
    expect(readRows(file).find(r => r.fruit_name === 'Mango').price).toBe(299);
    setFruitField(file, 'Mango', 'price', 999);

    // 3. Upload the edited file and confirm the table now shows the new price.
    await ud.uploadFile(file);
    await expect(ud.rowContaining('Mango')).toContainText('999');
    await expect(ud.rowContaining('Mango')).not.toContainText('299');
  });

});
