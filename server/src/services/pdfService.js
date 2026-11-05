// PDF text extraction (pdf-parse, text layer only). There is NO OCR engine in this server:
// a scanned PDF has no text layer, so it is reported as "scanned" and (with Gemini) read visually by the AI instead.
const { HttpError } = require('../errors');

async function extractText(buffer, maxPages = 60) {
  if (!buffer.slice(0, 5).toString('latin1').startsWith('%PDF')) throw new HttpError(400, 'That file is not a PDF.');
  let pdfParse;
  try { pdfParse = require('pdf-parse/lib/pdf-parse.js'); } catch { throw new HttpError(503, 'PDF text extraction is not installed (npm i pdf-parse).', { unconfigured: true }); }
  let data;
  try { data = await pdfParse(buffer, { max: maxPages }); }
  catch (e) { throw new HttpError(422, 'Could not read this PDF (damaged or password protected).'); }
  const text = String(data.text || '').replace(/\u0000/g, '').trim();
  const perPage = data.numpages ? text.length / Math.min(data.numpages, maxPages) : 0;
  return { text: text.slice(0, 300_000), pages: data.numpages || 0, truncated: text.length > 300_000 || data.numpages > maxPages, scanned: perPage < 40, method: 'text-layer' };
}

module.exports = { extractText };
