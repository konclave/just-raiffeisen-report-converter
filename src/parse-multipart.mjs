import * as multipart from 'parse-multipart-data';

export function parseMultipart(body, contentType) {
  const boundary = contentType.split("; ")[1].replace("boundary=", "").replace('\n', '').replace('\r', '');
  const bodyParts = multipart.parse(body, boundary);

  if (bodyParts.length > 1) {
    throw new Error("Too many data props received.");
  }
  return bodyParts[0];
}
