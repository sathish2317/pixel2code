// preview / export / capabilities / jobs / run
const express = require('express');
const { wrap } = require('../middleware');
const { HttpError, v } = require('../errors');
const { assertFile, extOf } = require('../filePolicy');
const preview = require('../services/previewService');
const exp = require('../services/exportService');

module.exports = ({ repos, cfg, provider, jobs, projectRoutes }) => {
  const r = express.Router();
  const L = cfg.limits;

  function filesFrom(req) {
    const b = req.body || {};
    let project = null, files;
    if (b.projectId !== undefined) project = projectRoutes.own({ userId: req.userId, params: { projectId: b.projectId } });
    if (b.files !== undefined) {
      if (!Array.isArray(b.files) || b.files.length > L.projectFiles) throw new HttpError(400, 'files must be a list.');
      files = b.files.map((f) => assertFile(f, L));
      if (files.reduce((n, f) => n + Buffer.byteLength(f.content), 0) > L.projectBytes) throw new HttpError(413, 'Too large.');
    } else if (project) files = repos.files.list(project.id, true).map(({ path, content }) => ({ path, content }));
    else throw new HttpError(400, 'Send files or a projectId.');
    return { project, files, b };
  }

  r.post('/preview/build', wrap(async (req, res) => {
    const { files, b } = filesFrom(req);
    const out = preview.build(files, b.entry ? v.str(b.entry, 'entry', { max: 200 }) : undefined);
    if (!out.ok) return res.status(422).json({ error: out.message, reason: out.reason });
    res.json(out);
  }));

  r.post('/export/zip', wrap(async (req, res) => {
    const { project, files, b } = filesFrom(req);
    if (!files.length) throw new HttpError(400, 'Nothing to export.');
    const buf = await exp.zipFiles(files);
    res.set({ 'content-type': 'application/zip', 'content-disposition': `attachment; filename="${exp.downloadName(project?.name || b.name)}"`, 'content-length': buf.length });
    res.send(buf);
  }));

  r.get('/jobs/:jobId', wrap(async (req, res) => {
    const j = jobs.get(req.userId, v.id(req.params.jobId, 'jobId'));
    if (!j) throw new HttpError(404, 'Job not found (jobs are kept in memory for 30 minutes).');
    res.json(j);
  }));

  // Honest status of every integration. The app uses this to enable/disable buttons instead of pretending.
  r.get('/capabilities', (_req, res) => res.json({
    ai: { configured: provider.configured, provider: provider.name, model: provider.model, pdfInput: provider.supportsPdf, maxImages: provider.maxImages },
    storage: { type: 'sqlite', durable: true },
    designAnalysis: { configured: provider.configured, mode: 'vision-model', endpoint: '/api/design/analyze' },
    screenshotComparison: { configured: provider.configured, mode: 'vision-model-estimate', endpoint: '/api/design/compare', exactPixelDiff: 'frontend-canvas-required' },
    iterativeDesignFix: { configured: provider.configured, endpoint: '/api/design/iterate', maxRounds: 2, autoApply: false },
    staticQualityAudit: { configured: true, endpoint: '/api/quality/audit', includes: ['responsive', 'accessibility', 'seo', 'security', 'maintainability'] },
    savedComponentLibrary: { configured: true, endpoint: '/api/components', storage: 'sqlite' },
    browserAutomation: { configured: false, note: 'Playwright/browser automation is not installed in this server. Use the frontend browser preview and its manual/DOM checks, or configure a separate isolated browser runner.' },
    pdfTextExtraction: true,
    ocr: { configured: false, note: 'No OCR engine is installed. Scanned PDFs can only be read visually by a vision model (Gemini).' },
    codeRunner: { configured: false, note: 'Running PHP, Python, Java or any other language is NOT available: no sandboxed runner is configured. Web projects (HTML/CSS/JS) preview in a sandboxed iframe in the browser.' },
    jobs: { type: 'in-memory', durable: false },
    limits: L,
  }));

  r.post('/run', (_req, res) => res.status(501).json({ error: 'Code execution is not configured on this server. Use the browser preview for HTML/CSS/JS, or static analysis (/api/code/review), or download the source.', unconfigured: true }));
  return r;
};
