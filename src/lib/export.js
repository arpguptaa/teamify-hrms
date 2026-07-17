import * as XLSX from 'xlsx';

// Downloads an array of flat objects as a real .xlsx file.
// rows: [{ Column1: value, Column2: value, ... }]
export function exportToExcel(filename, rows, sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{}]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
