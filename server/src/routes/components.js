'use strict';
const express = require('express');
const { wrap } = require('../middleware');
const { HttpError, v } = require('../errors');

module.exports = ({ repos, projectRoutes }) => {
  const r = express.Router();
  const clean = (body, partial = false) => {
    const b = body || {}, out = {};
    if (!partial || b.name !== undefined) out.name = v.str(b.name, 'name', { min: 1, max: 80 }).trim();
    if (!partial || b.category !== undefined) out.category = v.str(b.category ?? 'custom', 'category', { min: 1, max: 40 }).trim();
    if (!partial || b.description !== undefined) out.description = v.str(b.description ?? '', 'description', { max: 500 });
    for (const key of ['html', 'css', 'js']) if (!partial || b[key] !== undefined) out[key] = v.str(b[key] ?? '', key, { max: 60_000 });
    const size = ['html', 'css', 'js'].reduce((n, k) => n + (out[k] || '').length, 0);
    if (size > 100_000) throw new HttpError(413, 'A component may contain at most 100 KB of source.');
    return out;
  };
  const ownerProject = (req, id) => {
    if (!id) return null;
    return projectRoutes.own({ userId: req.userId, params: { projectId: v.id(id, 'projectId') } });
  };

  r.get('/', wrap(async (req, res) => {
    const project = req.query.projectId ? ownerProject(req, req.query.projectId) : null;
    res.json({ items: repos.components.list(req.userId, project ? project.id : undefined) });
  }));

  r.post('/', wrap(async (req, res) => {
    const b = req.body || {};
    const project = ownerProject(req, b.projectId);
    const data = clean(b);
    const component = repos.components.create(req.userId, { ...data, projectId: project?.id });
    res.status(201).json(component);
  }));

  r.put('/:componentId', wrap(async (req, res) => {
    const id = v.id(req.params.componentId, 'componentId');
    const current = repos.components.get(req.userId, id);
    if (!current) throw new HttpError(404, 'Component not found.');
    const patch = clean(req.body || {}, true);
    res.json(repos.components.update(req.userId, id, patch));
  }));

  r.delete('/:componentId', wrap(async (req, res) => {
    if (!repos.components.remove(req.userId, v.id(req.params.componentId, 'componentId'))) throw new HttpError(404, 'Component not found.');
    res.json({ deleted: true });
  }));
  return r;
};
