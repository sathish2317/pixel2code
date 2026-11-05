// The ORIGINAL endpoints the app already uses (POST /api/generate, POST /api/refine). Same request/response shape as before.
const express = require('express');
const { wrap } = require('../middleware');
const { HttpError } = require('../errors');

module.exports = ({ ai, provider, cfg }) => {
  const r = express.Router();
  const ALLOWED = [...ai.IMAGE_MIME, 'application/pdf'];

  function checkImages(list) {
    if (list.length > 12) throw new HttpError(400, 'Too many image slices (max 12).');
    if (list.length > provider.maxImages) throw new HttpError(400, `${provider.name} accepts at most ${provider.maxImages} images per request. Use AI_PROVIDER=gemini for tall designs.`);
    let total = 0;
    for (const im of list) {
      if (!ALLOWED.includes(im?.mime)) throw new HttpError(400, 'File must be PNG, JPG, WebP or PDF.');
      if (typeof im.base64 !== 'string' || im.base64.length < 100) throw new HttpError(400, 'Missing file.');
      if (im.mime === 'application/pdf' && (list.length > 1 || !provider.supportsPdf))
        throw new HttpError(400, 'PDF designs need AI_PROVIDER=gemini in server/.env (Groq and OpenRouter free models cannot read PDFs). Or upload the pages as images.');
      if (im.base64.length > (im.mime === 'application/pdf' ? 20_000_000 : 7_000_000)) throw new HttpError(413, im.mime === 'application/pdf' ? 'PDF too large (max about 14 MB).' : 'Image too large.');
      total += im.base64.length;
    }
    if (total > 26_000_000) throw new HttpError(413, 'Upload too large.');
  }
  r.checkImages = checkImages;

  r.post('/generate', wrap(async (req, res) => {
    const { images, imageBase64, mime, target = 'html', instructions = [], components = [], deep = false, assets } = req.body || {};
    const list = Array.isArray(images) && images.length ? images : [{ base64: imageBase64, mime }];
    checkImages(list);
    res.json(await ai.generate({ images: list, target, instructions, components, deep, assets }));
  }));

  // Analysis only: compare the reference with the current files and return a numbered list of differences. Changes nothing.
  // Accepts images:[{base64,mime}] (best: the same HD slices used to generate) or one imageBase64 + mime.
  async function planFrom(body) {
    const { files, request = '', imageBase64, mime, images, assets } = body || {};
    if (!Array.isArray(files) || !files.length) throw new HttpError(400, 'No files.');
    if (typeof request !== 'string' || request.length > 2000) throw new HttpError(400, 'Request too long (max 2000 chars).');
    if (files.reduce((n, f) => n + (f.content || '').length, 0) > cfg.limits.requestFilesChars) throw new HttpError(413, 'Project too large to analyze.');
    const list = Array.isArray(images) && images.length ? images : imageBase64 ? [{ base64: imageBase64, mime }] : [];
    if (!list.length) throw new HttpError(400, 'Send the reference design (images or imageBase64 + mime) so it can be compared with the page.');
    checkImages(list);
    return ai.plan({ images: list, files: files.map(({ path, content }) => ({ path, content })), request, assets });
  }

  r.post('/plan', wrap(async (req, res) => { res.json(await planFrom(req.body)); }));

  r.post('/refine', wrap(async (req, res) => {
    const { files, request, target = 'html', instructions = [], imageBase64, mime, assets } = req.body || {};
    if (!Array.isArray(files) || !files.length) throw new HttpError(400, 'No files.');
    if (typeof request !== 'string' || !request.trim() || request.length > 2000) throw new HttpError(400, 'Write a request (max 2000 chars).');
    if (files.reduce((n, f) => n + (f.content || '').length, 0) > cfg.limits.requestFilesChars) throw new HttpError(413, 'Project too large to refine.');
    // The app's "Analyze design and list changes" button sends a request that starts with ANALYSIS ONLY. It has no file answer,
    // so it must not go through the file parser (that would fail with "no usable files").
    if (req.body.analysisOnly === true || /^\s*ANALYSIS ONLY\b/i.test(request)) return res.json(await planFrom(req.body));
    res.json(await ai.refine({ files, request, target, instructions, imageBase64, mime, assets }));
  }));
  return r;
};
