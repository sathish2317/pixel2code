const express = require('express');
const { wrap } = require('../middleware');
const { HttpError, v } = require('../errors');
const pdf = require('../services/pdfService');

const OPTION_KEYS = { framework: ['html', 'react', 'vue', 'svelte', 'nextjs'], language: ['javascript', 'typescript'], styling: ['css', 'scss', 'css-modules', 'tailwind', 'bootstrap', 'styled-components'], animation: ['none', 'subtle', 'rich'] };
function options(o = {}) {
  if (typeof o !== 'object' || o === null) throw new HttpError(400, 'options must be an object.');
  const out = {};
  for (const [k, list] of Object.entries(OPTION_KEYS)) if (o[k] !== undefined) out[k] = v.oneOf(o[k], 'options.' + k, list);
  if (o.font !== undefined) out.font = v.str(o.font, 'options.font', { max: 40 });
  if (o.breakpoints !== undefined) {
    if (!Array.isArray(o.breakpoints) || o.breakpoints.length > 6) throw new HttpError(400, 'options.breakpoints must be up to 6 numbers.');
    out.breakpoints = o.breakpoints.map((n) => v.int(n, 'breakpoint', { min: 200, max: 4000 }));
  }
  if (o.cssFramework !== undefined) out.styling = v.oneOf(o.cssFramework, 'options.cssFramework', ['bootstrap', 'tailwind', 'none']);
  return out;
}

module.exports = ({ ai, provider, jobs, legacy, repos, projectRoutes }) => {
  const r = express.Router();
  function selectedComponents(req, body) {
    const ids = Array.isArray(body.componentIds) ? body.componentIds : [];
    if (ids.length > 30) throw new HttpError(400, 'Select at most 30 saved components.');
    const stored = [];
    for (const raw of ids) {
      const id = v.id(raw, 'componentId');
      const component = repos.components.get(req.userId, id);
      if (!component) throw new HttpError(404, `Saved component ${id} was not found.`);
      stored.push({ name: component.name, notes: component.description, html: component.html, css: component.css, js: component.js });
    }
    const inline = Array.isArray(body.components) ? body.components.slice(0, 20).map((c) => ({
      name: v.str(c?.name, 'component.name', { min: 1, max: 80 }),
      notes: v.str(c?.notes ?? '', 'component.notes', { max: 300 }),
      html: v.str(c?.html ?? '', 'component.html', { max: 60_000 }),
      css: v.str(c?.css ?? '', 'component.css', { max: 60_000 }),
      js: v.str(c?.js ?? '', 'component.js', { max: 60_000 })
    })) : [];
    if (stored.length + inline.length > 30) throw new HttpError(400, 'Select at most 30 components in total.');
    const all = [...stored, ...inline];
    if (all.reduce((n, c) => n + c.html.length + c.css.length + c.js.length, 0) > 150_000) throw new HttpError(413, 'Selected components exceed the 150 KB context limit.');
    return all;
  }

  const target = (b, o) => v.oneOf(b.target ?? (o.styling === 'bootstrap' || o.styling === 'tailwind' ? o.styling : undefined), 'target', ['html', 'bootstrap', 'tailwind'], 'html');
  const respond = (req, res, run) => v.bool(req.query.async) ? res.status(202).json({ jobId: jobs.submit(req.userId, 'convert', run) }) : run().then((x) => res.json(x));

  // Screenshot / wireframe / design image(s) -> multi-file project PROPOSAL (the app shows it and the user accepts or rejects).
  r.post('/image-to-code', wrap(async (req, res) => {
    const b = req.body || {}, o = options(b.options), components = selectedComponents(req, b);
    const list = Array.isArray(b.images) ? b.images : [];
    if (!list.length) throw new HttpError(400, 'Send images: [{base64, mime}].');
    if (list.some((im) => im?.mime === 'application/pdf')) throw new HttpError(400, 'Use /api/convert/pdf-to-code for PDFs.');
    legacy.checkImages(list);
    await respond(req, res, async () => ({ ...(await ai.generate({ images: list, target: target(b, o), instructions: Array.isArray(b.instructions) ? b.instructions.slice(0, 20).map((s) => String(s).slice(0, 300)) : [], components, deep: v.bool(b.deep), assets: b.assets, options: o })), source: 'image' }));
  }));

  // Extract text from a PDF (text layer). Used by "Attach Code" for PDF docs. No code is generated.
  r.post('/pdf-text', wrap(async (req, res) => {
    const b64 = v.str((req.body || {}).base64, 'base64', { min: 100, max: 20_000_000 });
    res.json(await pdf.extractText(Buffer.from(b64, 'base64')));
  }));

  // PDF design/doc -> project proposal. The text layer is extracted first; scanned PDFs (no text layer) are read visually
  // by Gemini. There is no separate OCR engine, so with other providers a scanned PDF is refused rather than faked.
  r.post('/pdf-to-code', wrap(async (req, res) => {
    const b = req.body || {}, o = options(b.options), components = selectedComponents(req, b);
    const b64 = v.str(b.base64, 'base64', { min: 100, max: 20_000_000 });
    const info = await pdf.extractText(Buffer.from(b64, 'base64'));
    if (info.scanned && !provider.supportsPdf) throw new HttpError(422, 'This PDF has no text layer (scanned). Reading it needs OCR or a vision model that accepts PDFs: set AI_PROVIDER=gemini, or upload the pages as images.');
    const instructions = (Array.isArray(b.instructions) ? b.instructions.slice(0, 20).map((s) => String(s).slice(0, 300)) : []);
    if (info.text.length >= 40) instructions.push('Extracted PDF text (use it for exact wording; the PDF itself shows the layout):\n' + info.text.slice(0, 30_000));
    await respond(req, res, async () => {
      if (!provider.supportsPdf) throw new HttpError(400, 'Converting a PDF needs AI_PROVIDER=gemini (other free models cannot read PDFs). The extracted text is available at /api/convert/pdf-text.');
      const out = await ai.generate({ images: [{ base64: b64, mime: 'application/pdf' }], target: target(b, o), instructions, components, deep: v.bool(b.deep), assets: b.assets, options: o });
      return { ...out, source: 'pdf', pdf: { pages: info.pages, scanned: info.scanned, textChars: info.text.length, method: info.scanned ? 'vision-model (no OCR engine)' : 'text-layer + vision model' } };
    });
  }));
  return r;
};
