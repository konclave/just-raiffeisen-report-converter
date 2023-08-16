import * as XLSX from "xlsx";
import { readFile, writeFile } from "node:fs/promises";
import { mapRecordTypes } from './row-tests.mjs';

export async function parseReport(filePath) {
  const file = await readFile(filePath);
  const workbook = XLSX.read(file, { type: "buffer" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

  return rows.map(mapRecordTypes).filter(Boolean);
}


export async function saveReport(transactions, path) {
  const headers = ['Event', 'Date', 'Symbol', 'Price', 'Quantity', 'Currency', 'FeeTax', 'Exchange', 'NKD', 'FeeCurrency', 'DoNotAdjustCash', 'Note'];
  const worksheet = XLSX.utils.json_to_sheet(transactions);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
  const binary = XLSX.write(workbook, { type: "buffer", compression: true });
  writeFile(path, binary, { encoding: "buffer" });
}
