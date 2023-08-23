export function parseMultipart(body, contentType) {
  const boundary = contentType.split("; ")[1].replace("boundary=", "");
  const boundaryRegex = new RegExp(`-{0,2}${boundary}-{0,2}[\r\n]*`);
  const bodyParts = body.split(boundaryRegex).filter(Boolean);

  if (bodyParts.length > 1) {
    throw new Error("Too many data props received.");
  }
  const [fileData] = bodyParts;
  const [, filename] = fileData.match(/Content-Disposition: form-data; name=".+"; filename="(.+)"/)
  const [, fileContentType] = fileData.match(/Content-Type: (.+)/)

  const file = fileData.replace(/[\r\n]*Content-Disposition: form-data; name=".+"; filename="(.+)"[\r\n]Content-Type: (.+)[\r\n]{1,2}/, '');

  return { contentType: fileContentType, filename, data: file };
}
