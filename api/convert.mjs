import * as xls from './xls.mjs';
import * as xml from './xml.mjs';

// handles post request with the file and returns the parsed data
export default async function handleRequest(event, context) {
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
      return {
        statusCode: 500,
        body: {
          message: 'Report could not be parsed'
        }
      };
  }

  return {
    statusCode: 200,
    body: {
      report
    }
  };
}
