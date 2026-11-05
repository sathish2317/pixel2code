'use strict';
const express = require('express');
const { wrap } = require('../middleware');
const { HttpError, v } = require('../errors');
const { assertFile } = require('../filePolicy');

module.exports = ({ ai, provider, cfg, jobs, repos, projectRoutes }) => {
  const r = express.Router();
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];

  function checkImage(image, name) {
    if (!image || !allowed.includes(image.mime)) throw new HttpError(400, `${name} must be a PNG, JPG or WebP image.`);
    if (typeof image.base64 !== 'string' || image.base64.length < 100) throw new HttpError(400, `${name} is missing image data.`);
    if (image.base64.length > 7_000_000) throw new HttpError(413, `${name} is too large (max about 5 MB).`);
  }
  function imagesFrom(body, min = 1, max = provider.maxImages) {
    const list = Array.isArray(body.images) ? body.images : body.image ? [body.image] : [];
    if (list.length < min) throw new HttpError(400, 'Send images as [{base64, mime}].');
    if (list.length > max) throw new HttpError(400, `Too many images (max ${max} for ${provider.name}).`);
    list.forEach((im, i) => checkImage(im, `images[${i}]`));
    return list;
  }
  function filesFrom(req) {
    const b = req.body || {};
    if (b.projectId !== undefined) {
      const project = projectRoutes.own({ userId: req.userId, params: { projectId: b.projectId } });
      return repos.files.list(project.id, true).map(({ path, content }) => ({ path, content }));
    }
    if (!Array.isArray(b.files) || !b.files.length) throw new HttpError(400, 'Send files or a projectId.');
    if (b.files.length > cfg.limits.projectFiles) throw new HttpError(400, 'Too many files.');
    const files = b.files.map((f) => assertFile(f, cfg.limits));
    if (files.reduce((n, f) => n + f.content.length, 0) > cfg.limits.requestFilesChars) throw new HttpError(413, 'Project too large for this operation.');
    return files;
  }
  const respond = (req, res, kind, fn) => {
    if (v.bool(req.query.async)) return res.status(202).json({ jobId: jobs.submit(req.userId, kind, fn) });
    return fn().then((result) => res.json(result));
  };

  // Returns a structured design brief for the frontend to show/edit before code generation.
  r.post('/analyze', wrap(async (req, res) => {
    const b = req.body || {}, images = imagesFrom(b);
    const run = () => ai.analyzeDesign({ images, instructions: Array.isArray(b.instructions) ? b.instructions.slice(0, 20).map((x) => String(x).slice(0, 500)) : [] });
    await respond(req, res, 'design:analyze', run);
  }));

  // Vision-based screenshot comparison. Exact pixel-diff heatmaps belong in the browser Canvas layer.
  r.post('/compare', wrap(async (req, res) => {
    const b = req.body || {};
    const reference = b.reference, rendered = b.rendered;
    checkImage(reference, 'reference'); checkImage(rendered, 'rendered');
    const viewport = b.viewport && typeof b.viewport === 'object' ? {
      width: v.int(b.viewport.width, 'viewport.width', { min: 1, max: 10000 }),
      height: v.int(b.viewport.height, 'viewport.height', { min: 1, max: 10000 })
    } : undefined;
    const run = () => ai.compareDesign({ reference, rendered, viewport, instruction: v.str(b.instruction ?? '', 'instruction', { max: 1000, optional: true }) || '' });
    await respond(req, res, 'design:compare', run);
  }));

  // Controlled agent loop: compare -> propose minimal edits -> self-check. It never writes into project storage.
  r.post('/iterate', wrap(async (req, res) => {
    const b = req.body || {}, images = imagesFrom(b), files = filesFrom(req);
    const request = v.str(b.request ?? '', 'request', { max: 2000, optional: true }) || '';
    const target = v.oneOf(b.target ?? 'html', 'target', ['html', 'bootstrap', 'tailwind']);
    const maxIterations = v.int(b.maxIterations ?? 1, 'maxIterations', { min: 1, max: 2 });
    const run = () => ai.iterateDesign({ images, files, request, target, maxIterations, assets: b.assets });
    await respond(req, res, 'design:iterate', run);
  }));

  return r;
};
