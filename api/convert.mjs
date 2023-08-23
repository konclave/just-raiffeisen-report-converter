import * as xls from '../src/xls.mjs';
import * as xml from '../src/xml.mjs';
import { getFile } from '../src/process-request.mjs';
import { convertToSnowball } from '../src/parser.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.statusCode = 501;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      message: 'Not implemented.'
    }));
  }

  let body = [];
  req.on('data', chunk => {
    body.push(chunk);
  });

  req.on('end', async () => {
    let fileData = null;
    try {
      fileData = getFile(Buffer.concat(body), req.headers['content-type']);
    } catch (err) {
      console.log(err);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        message: err.message
      }));
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
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify({
          message: 'Report could not be parsed. Unsupported file type.'
        }));
    };

    const converted = convertToSnowball(report);
    const xlsReportFile = xls.saveReport(converted);
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.end(xlsReportFile);
  });
}
