import * as xls from '../src/xls.mjs';
import * as xml from '../src/xml.mjs';

// handles post request with the file and returns the parsed data
export default async function handleRequest(req, res) {
  if (req.method !== 'POST') {
    return res.status(404).json({
      message: 'Not found'
    });
  }

  if (!req.body) {
    return res.status(400).json({
      message: 'No file provided'
    });
  }

  const file = req.body;
  const contentType = req.headers.contentType;

  let report = null;
  switch (contentType) {
    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
    case 'application/vnd.ms-excel':
      report = xls.parseReport(file);
      break;
    case 'text/html':
      report = xml.parseReport(file);
      break;
    default:
      return res.status(400).json({
        message: 'Report could not be parsed. Unsupported file type.'
      });
  };

  return res.status(200).send(report);
}
