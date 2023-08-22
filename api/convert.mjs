import * as xls from '../src/xls.mjs';
import * as xml from '../src/xml.mjs';

// handles post request with the file and returns the parsed data
export default async function handleRequest(req, res) {
  if (!req.body) {
    return res.send({
      statusCode: 400,
      body: {
        message: 'No file provided'
      }
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
      return res.send({
        statusCode: 400,
        body: {
          message: 'Report could not be parsed. Unsupported file type.'
        }
      });
  };

  return res.send({
    statusCode: 200,
    body: {
      report
    }
  });
}
