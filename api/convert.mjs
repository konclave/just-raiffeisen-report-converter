import * as xls from '../src/xls.mjs';
import * as xml from '../src/xml.mjs';
import { parseMultipart } from '../src/parse-multipart.mjs';
import { convertToSnowball } from '../src/parser.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(501).json({
      message: 'Not implemented.'
    });
  }

  let body = [];
  req.on('data', chunk => {
    body.push(chunk);
  });

  req.on('end', async () => {
    let fileData = null;
    try {
      fileData = parseMultipart(Buffer.concat(body), req.headers['content-type']);
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        message: err.message
      });
    }

    let report = null;
    const { data, type: contentType } = fileData;
    switch (contentType) {
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        report = await xls.parseReport(data);
        break;
      case 'text/html':
        report = await xml.parseReport(data);
        break;
      default:
        return res.status(400).json({
          message: 'Report could not be parsed. Unsupported file type.'
        });
    };
    const converted = convertToSnowball(report);
    const csvFile = xls.saveReport(converted);
    return res.status(200).send(csvFile);
  });
}
