import { parseReport } from './xml.mjs';
import { saveReport } from './xls.mjs';
import { convertToSnowball } from './parser.mjs';

const FILE_PATH = "./data/raiffeisen_report.html";
const REPORT_PATH = "./data/snowball_report.xlsx";

main();

function main() {
  parseReport(FILE_PATH).then((rows) => {
    const converted = convertToSnowball(rows);
    saveReport(converted, REPORT_PATH);
  });
}
