/* Server for local testing perposes */
import http from 'http';
import handler from '../api/convert.mjs';
import { readFileSync } from 'fs';

const server = http.createServer();
server.on('request', (request, response) => {
  if (request.method === 'GET') {
    const html = readFileSync('./public/index.html', 'utf8');
    response.end(html);
    return;
  }
  handler(request, response);
}).listen(8080);
