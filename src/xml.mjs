import * as cheerio from 'cheerio';
import { decode } from 'windows-1251';
import { mapRecordTypes } from './row-tests.mjs';

export async function parseReport(file) {
  const content = decode(file);
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
