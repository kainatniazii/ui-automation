const XLSX = require('xlsx');

// Small helpers for reading/editing the .xlsx the page produces.
// The workbook has a single sheet with columns:
//   sno, fruit_name, color, price, season

function readRows(filePath) {
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws);
}

// Set one field on the row whose fruit_name matches, then save back to disk.
function setFruitField(filePath, fruitName, field, value) {
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName]);
  const row = rows.find(r => r.fruit_name === fruitName);
  if (!row) throw new Error(`No row found for fruit "${fruitName}"`);
  row[field] = value;
  wb.Sheets[sheetName] = XLSX.utils.json_to_sheet(rows);
  XLSX.writeFile(wb, filePath);
}

module.exports = { readRows, setFruitField };
