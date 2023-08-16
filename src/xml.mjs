import * as cheerio from 'cheerio';
import { readFile } from "node:fs/promises";
import { mapRecordTypes } from './row-tests.mjs';

export async function parseReport(filePath) {
  const decoder = new TextDecoder('windows-1251');
  const content = decoder.decode(await readFile(filePath));
  const $ = cheerio.load(content);
  const rows = [];
  $('tr').each((_, el) => {
    rows.push([]);
    $('td', el).each((_, el) => {
      rows[rows.length - 1].push($(el).text());
    });
  });
  return rows.map(mapRecordTypes).filter(Boolean);
}
