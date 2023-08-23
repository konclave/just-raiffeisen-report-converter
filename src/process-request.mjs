import { parseMultipart } from './parse-multipart.mjs';

export function getFile(body, contentType) {
  if (!contentType.includes('multipart/form-data')) {
    throw new Error("Unsupported content type.");
  }
  return parseMultipart(body, contentType);
}
