import * as xls from '../src/xls.mjs';
import * as xml from '../src/xml.mjs';
import { parseMultipart } from '../src/parse-multipart.mjs';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(501).json({
      message: 'Not implemented.'
    });
  }

  const requestContentType = req.headers.contentType;

  let body = [];
  req.on('data', chunk => {
    body.push(chunk);
  });

  req.on('end', async () => {
    body = Buffer.concat(body).toString();
    let fileData = null;
    try {
      fileData = parseMultipart(body, requestContentType);
    } catch (err) {
      return res.status(400).json({
        message: err.message
      });
    }

    let report = null;
    const { data, contentType } = fileData;
    switch (contentType) {
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
      case 'application/vnd.ms-excel':
        report = xls.parseReport(data);
        break;
      case 'text/html':
        report = xml.parseReport(data);
        break;
      default:
        return res.status(400).json({
          message: 'Report could not be parsed. Unsupported file type.'
        });
    };

    return res.status(200).send(report);
  });
}
