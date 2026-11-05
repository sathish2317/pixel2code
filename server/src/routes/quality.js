'use strict';
const express = require('express');
const { wrap } = require('../middleware');
const { HttpError } = require('../errors');
const { assertFile } = require('../filePolicy');
const { audit } = require('../services/qualityService');

module.exports = ({ cfg, repos, projectRoutes }) => {
  const r = express.Router();
  r.post('/audit', wrap(async (req, res) => {
    const b = req.body || {};
    let files;
    if (b.projectId !== undefined) {
      const project = projectRoutes.own({ userId: req.userId, params: { projectId: b.projectId } });
      files = repos.files.list(project.id, true).map(({ path, content }) => ({ path, content }));
    } else {
      if (!Array.isArray(b.files) || !b.files.length) throw new HttpError(400, 'Send files or a projectId.');
      if (b.files.length > cfg.limits.projectFiles) throw new HttpError(400, 'Too many files.');
      files = b.files.map((f) => assertFile(f, cfg.limits));
      if (files.reduce((n, f) => n + f.content.length, 0) > cfg.limits.requestFilesChars) throw new HttpError(413, 'Project too large for a quality audit.');
    }
    res.json(audit(files));
  }));
  return r;
};
