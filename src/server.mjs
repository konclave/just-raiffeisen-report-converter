/* Server for local testing perposes */
import http from 'http';
import { handleRequest } from './handler.mjs';

const server = http.createServer();
server.on('request', (request, response) => {
  let body = [];
  request.on('data', (chunk) => {
    console.log('chunk', chunk);
    if (chunk instanceof Buffer) {
      body.push(chunk);
    }
  }).on('end', () => {
    body = Buffer.concat(body);
    const { headers, method, url } = request;
    const data = handleRequest({ headers, method, url, body });
    response.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="snowball_report.xlsx"'
    });
    response.end(data);
  });
}).listen(8080);
