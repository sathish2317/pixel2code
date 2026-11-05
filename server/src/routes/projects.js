const express = require('express');
const { wrap } = require('../middleware');
const { HttpError, v } = require('../errors');
const { assertFile, checkFile, safePath } = require('../filePolicy');

module.exports = ({ repos, cfg }) => {
  const r = express.Router();
  const L = cfg.limits;
  const page = (q) => ({ limit: v.int(q.limit, 'limit', { min: 1, max: 500, def: 25 }), offset: v.int(q.offset, 'offset', { min: 0, max: 1e7, def: 0 }) });
  const TARGETS = ['html', 'bootstrap', 'tailwind'];

  // Every handler first resolves the project through the owner check; another user's project is simply "not found".
  const own = (req) => {
    const p = repos.projects.get(req.userId, v.id(req.params.projectId, 'projectId'));
    if (!p) throw new HttpError(404, 'Project not found.');
    return p;
  };
  const cleanFiles = (list, existing = { count: 0, bytes: 0 }) => {
    if (!Array.isArray(list)) throw new HttpError(400, 'files must be a list.');
    if (list.length > L.projectFiles) throw new HttpError(400, `Too many files (max ${L.projectFiles}).`);
    const seen = new Set(), out = [];
    let bytes = 0;
    for (const f of list) {
      const c = assertFile(f, L);
      if (seen.has(c.path)) throw new HttpError(400, `${c.path}: listed twice.`);
      seen.add(c.path); out.push(c); bytes += Buffer.byteLength(c.content);
    }
    if (bytes + existing.bytes > L.projectBytes) throw new HttpError(413, `Project would exceed ${Math.round(L.projectBytes / 1e6)} MB.`);
    if (out.length + existing.count > L.projectFiles) throw new HttpError(413, `Project would exceed ${L.projectFiles} files.`);
    return out;
  };

  // ---- projects ----
  r.post('/', wrap(async (req, res) => {
    const b = req.body || {};
    const name = v.str(b.name, 'name', { min: 1, max: 120 }).trim();
    const id = b.id !== undefined ? v.id(b.id, 'id') : undefined; // the app may reuse its local id so a local project maps to one server project
    if (id && repos.projects.exists(id)) throw new HttpError(409, 'A project with this id already exists.');
    if (repos.projects.count(req.userId) >= L.projectsPerUser) throw new HttpError(429, `Project limit reached (${L.projectsPerUser}).`);
    const files = b.files === undefined ? [] : cleanFiles(b.files);
    const settings = b.settings && typeof b.settings === 'object' && JSON.stringify(b.settings).length < 20_000 ? b.settings : {};
    const p = repos.tx(() => {
      const p = repos.projects.create(req.userId, { id, name, target: v.oneOf(b.target, 'target', TARGETS, 'html'), settings });
      for (const f of files) repos.files.create(p.id, f);
      return p;
    });
    res.status(201).json({ ...p, fileCount: files.length, storage: 'server' });
  }));

  r.get('/', wrap(async (req, res) => {
    const { limit, offset } = page(req.query);
    const { items, total } = repos.projects.list(req.userId, { limit, offset, search: typeof req.query.q === 'string' ? req.query.q.slice(0, 80) : '' });
    res.json({ items, total, limit, offset });
  }));

  r.get('/:projectId', wrap(async (req, res) => {
    const p = own(req);
    res.json({ ...p, files: repos.files.list(p.id), stats: repos.files.stats(p.id) });
  }));

  r.patch('/:projectId', wrap(async (req, res) => {
    const p = own(req), b = req.body || {};
    const patch = {};
    if (b.name !== undefined) patch.name = v.str(b.name, 'name', { min: 1, max: 120 }).trim();
    if (b.target !== undefined) patch.target = v.oneOf(b.target, 'target', TARGETS);
    if (b.settings !== undefined) {
      if (typeof b.settings !== 'object' || b.settings === null || Array.isArray(b.settings) || JSON.stringify(b.settings).length > 20_000) throw new HttpError(400, 'settings must be an object under 20 KB.');
      patch.settings = b.settings;
    }
    res.json(repos.projects.update(req.userId, p.id, patch));
  }));

  // Deleting needs ?confirm=<project name> so an accidental request cannot wipe a project.
  r.delete('/:projectId', wrap(async (req, res) => {
    const p = own(req);
    if (req.query.confirm !== p.name) throw new HttpError(400, 'To delete this project add ?confirm=<exact project name>.');
    repos.projects.remove(req.userId, p.id);
    res.json({ deleted: true });
  }));

  // ---- files ----
  r.get('/:projectId/files', wrap(async (req, res) => {
    const p = own(req);
    const all = repos.files.list(p.id, v.bool(req.query.content));
    const { limit, offset } = page({ limit: req.query.limit ?? 200, offset: req.query.offset });
    res.json({ items: all.slice(offset, offset + limit), total: all.length, limit, offset });
  }));

  // Create or import. Body: {path, content} or {files:[...], overwrite:false}. Existing files are kept unless overwrite=true.
  r.post('/:projectId/files', wrap(async (req, res) => {
    const p = own(req), b = req.body || {};
    const list = b.files !== undefined ? b.files : [{ path: b.path, content: b.content ?? '' }];
    const clean = cleanFiles(list, repos.files.stats(p.id));
    const result = repos.files.upsertMany(p.id, clean, v.bool(b.overwrite));
    if (b.files === undefined && result.skipped.length) throw new HttpError(409, 'A file with this path already exists.');
    res.status(201).json({ ...result, files: repos.files.list(p.id) });
  }));

  r.get('/:projectId/files/:fileId', wrap(async (req, res) => {
    const p = own(req);
    const f = repos.files.get(p.id, v.id(req.params.fileId, 'fileId'));
    if (!f) throw new HttpError(404, 'File not found.');
    res.json(f);
  }));

  r.put('/:projectId/files/:fileId', wrap(async (req, res) => {
    const p = own(req), b = req.body || {};
    const cur = repos.files.get(p.id, v.id(req.params.fileId, 'fileId'));
    if (!cur) throw new HttpError(404, 'File not found.');
    const next = { path: b.path ?? cur.path, content: b.content ?? cur.content };
    const err = checkFile(next, L);
    if (err) throw new HttpError(400, err);
    if (next.path !== cur.path && repos.files.byPath(p.id, next.path)) throw new HttpError(409, 'Another file already has this path.');
    const st = repos.files.stats(p.id);
    if (st.bytes - cur.bytes + Buffer.byteLength(next.content) > L.projectBytes) throw new HttpError(413, 'Project would be too large.');
    res.json(repos.files.update(p.id, cur.id, next));
  }));

  r.delete('/:projectId/files/:fileId', wrap(async (req, res) => {
    const p = own(req);
    if (!repos.files.remove(p.id, v.id(req.params.fileId, 'fileId'))) throw new HttpError(404, 'File not found.');
    res.json({ deleted: true });
  }));

  // ---- sync: replace the server copy with the app's copy (the app calls this from "Sync to server") ----
  r.put('/:projectId/sync', wrap(async (req, res) => {
    const p = own(req), b = req.body || {};
    const files = cleanFiles(b.files);
    // a snapshot of what the server had, so a bad sync can be undone
    const before = repos.files.list(p.id, true).map(({ path, content }) => ({ path, content }));
    if (before.length) repos.versions.create(p.id, 'Before sync', `${before.length} files`, before);
    repos.files.replaceAll(p.id, files);
    if (b.name) repos.projects.update(req.userId, p.id, { name: v.str(b.name, 'name', { min: 1, max: 120 }).trim() });
    res.json({ synced: true, fileCount: files.length, updatedAt: repos.projects.get(req.userId, p.id).updatedAt });
  }));

  // ---- versions ----
  r.get('/:projectId/versions', wrap(async (req, res) => { const p = own(req); const pg = page(req.query); res.json({ ...repos.versions.list(p.id, pg), ...pg }); }));
  r.post('/:projectId/versions', wrap(async (req, res) => {
    const p = own(req), b = req.body || {};
    const files = repos.files.list(p.id, true).map(({ path, content }) => ({ path, content }));
    res.status(201).json(repos.versions.create(p.id, v.str(b.label ?? 'Snapshot', 'label', { min: 1, max: 120 }), v.str(b.summary ?? '', 'summary', { max: 500 }), files));
  }));
  r.get('/:projectId/versions/:versionId', wrap(async (req, res) => {
    const p = own(req);
    const ver = repos.versions.get(p.id, v.id(req.params.versionId, 'versionId'));
    if (!ver) throw new HttpError(404, 'Version not found.');
    res.json(ver);
  }));
  r.post('/:projectId/versions/:versionId/restore', wrap(async (req, res) => {
    const p = own(req);
    const ver = repos.versions.get(p.id, v.id(req.params.versionId, 'versionId'));
    if (!ver) throw new HttpError(404, 'Version not found.');
    const files = cleanFiles(ver.files);
    repos.versions.create(p.id, 'Before restore', `Before restoring "${ver.label}"`, repos.files.list(p.id, true).map(({ path, content }) => ({ path, content })));
    repos.files.replaceAll(p.id, files);
    res.json({ restored: ver.label, files: repos.files.list(p.id) });
  }));
  r.delete('/:projectId/versions/:versionId', wrap(async (req, res) => {
    const p = own(req);
    if (!repos.versions.remove(p.id, v.id(req.params.versionId, 'versionId'))) throw new HttpError(404, 'Version not found.');
    res.json({ deleted: true });
  }));

  // ---- AI chat history of the project ----
  r.get('/:projectId/messages', wrap(async (req, res) => { const p = own(req); const pg = page({ limit: req.query.limit ?? 100, offset: req.query.offset }); res.json({ ...repos.messages.list(p.id, pg), ...pg }); }));
  r.delete('/:projectId/messages', wrap(async (req, res) => { const p = own(req); repos.messages.clear(p.id); res.json({ cleared: true }); }));

  r.own = own;
  return r;
};
