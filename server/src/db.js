// SQLite storage (node:sqlite, built into Node 22.5+, no native build step). One file on disk, local-first prototype.
// For a multi-user hosted app, swap this module for a PostgreSQL implementation with the same repository functions.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function open(file) {
  let DatabaseSync;
  try { ({ DatabaseSync } = require('node:sqlite')); }
  catch { throw new Error('This server needs Node.js 22.13 or newer (it uses the built-in SQLite). Run: node -v'); }
  if (file !== ':memory:') fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;');
  migrate(db);
  return db;
}

function migrate(db) {
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, created_at INTEGER NOT NULL);
  CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL, target TEXT NOT NULL DEFAULT 'html', settings TEXT NOT NULL DEFAULT '{}',
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id, updated_at DESC);
  CREATE TABLE IF NOT EXISTS files (
    id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    path TEXT NOT NULL, content TEXT NOT NULL, language TEXT NOT NULL, bytes INTEGER NOT NULL,
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, UNIQUE(project_id, path));
  CREATE TABLE IF NOT EXISTS versions (
    id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    label TEXT NOT NULL, summary TEXT NOT NULL DEFAULT '', files TEXT NOT NULL, created_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_versions_project ON versions(project_id, created_at DESC);
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    role TEXT NOT NULL, action TEXT, content TEXT NOT NULL, meta TEXT, created_at INTEGER NOT NULL);
  CREATE INDEX IF NOT EXISTS idx_messages_project ON messages(project_id, created_at);
  CREATE TABLE IF NOT EXISTS components (
    id TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL, category TEXT NOT NULL DEFAULT 'custom', description TEXT NOT NULL DEFAULT '',
    html TEXT NOT NULL DEFAULT '', css TEXT NOT NULL DEFAULT '', js TEXT NOT NULL DEFAULT '',
    created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_components_user ON components(user_id, updated_at DESC);
  CREATE INDEX IF NOT EXISTS idx_components_project ON components(project_id, updated_at DESC);
  `);
}

const nid = () => crypto.randomBytes(9).toString('base64url');
const now = () => Date.now();

function repos(db, languageOf) {
  const q = (sql) => db.prepare(sql);
  const tx = (fn) => { db.exec('BEGIN'); try { const r = fn(); db.exec('COMMIT'); return r; } catch (e) { db.exec('ROLLBACK'); throw e; } };

  const users = {
    ensure(id) { q('INSERT OR IGNORE INTO users(id, created_at) VALUES (?, ?)').run(id, now()); },
  };

  const projectRow = (r) => r && { id: r.id, name: r.name, target: r.target, settings: JSON.parse(r.settings || '{}'), createdAt: r.created_at, updatedAt: r.updated_at };

  const projects = {
    create(userId, { id, name, target, settings }) {
      const t = now(); id = id || nid();
      q('INSERT INTO projects(id,user_id,name,target,settings,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(id, userId, name, target || 'html', JSON.stringify(settings || {}), t, t);
      return projects.get(userId, id);
    },
    /** Only returns a project the user owns; another user's id looks exactly like a missing one (no information leak). */
    get(userId, id) { return projectRow(q('SELECT * FROM projects WHERE id=? AND user_id=?').get(id, userId)); },
    exists(id) { return !!q('SELECT 1 x FROM projects WHERE id=?').get(id); },
    count(userId) { return q('SELECT COUNT(*) n FROM projects WHERE user_id=?').get(userId).n; },
    list(userId, { limit, offset, search }) {
      const like = '%' + String(search || '').replace(/[%_]/g, '') + '%';
      const total = q('SELECT COUNT(*) n FROM projects WHERE user_id=? AND name LIKE ?').get(userId, like).n;
      const items = q(`SELECT p.*, (SELECT COUNT(*) FROM files f WHERE f.project_id=p.id) AS file_count FROM projects p
        WHERE user_id=? AND name LIKE ? ORDER BY updated_at DESC LIMIT ? OFFSET ?`).all(userId, like, limit, offset)
        .map((r) => ({ ...projectRow(r), fileCount: r.file_count }));
      return { items, total };
    },
    update(userId, id, patch) {
      const cur = projects.get(userId, id); if (!cur) return null;
      q('UPDATE projects SET name=?, target=?, settings=?, updated_at=? WHERE id=?').run(
        patch.name ?? cur.name, patch.target ?? cur.target, JSON.stringify(patch.settings ?? cur.settings), now(), id);
      return projects.get(userId, id);
    },
    touch(id) { q('UPDATE projects SET updated_at=? WHERE id=?').run(now(), id); },
    remove(userId, id) { return q('DELETE FROM projects WHERE id=? AND user_id=?').run(id, userId).changes > 0; },
  };

  const fileRow = (r, withContent = true) => r && ({ id: r.id, path: r.path, language: r.language, bytes: r.bytes, createdAt: r.created_at, updatedAt: r.updated_at, ...(withContent ? { content: r.content } : {}) });

  const files = {
    list(projectId, withContent = false) { return q('SELECT * FROM files WHERE project_id=? ORDER BY path').all(projectId).map((r) => fileRow(r, withContent)); },
    get(projectId, fileId) { return fileRow(q('SELECT * FROM files WHERE project_id=? AND id=?').get(projectId, fileId)); },
    byPath(projectId, p) { return fileRow(q('SELECT * FROM files WHERE project_id=? AND path=?').get(projectId, p)); },
    stats(projectId) { const r = q('SELECT COUNT(*) n, COALESCE(SUM(bytes),0) b FROM files WHERE project_id=?').get(projectId); return { count: r.n, bytes: r.b }; },
    create(projectId, f) {
      const t = now(), id = nid(), bytes = Buffer.byteLength(f.content);
      q('INSERT INTO files(id,project_id,path,content,language,bytes,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?)').run(id, projectId, f.path, f.content, languageOf(f.path), bytes, t, t);
      projects.touch(projectId);
      return files.get(projectId, id);
    },
    update(projectId, fileId, patch) {
      const cur = files.get(projectId, fileId); if (!cur) return null;
      const content = patch.content ?? cur.content, p = patch.path ?? cur.path;
      q('UPDATE files SET path=?, content=?, language=?, bytes=?, updated_at=? WHERE id=?').run(p, content, languageOf(p), Buffer.byteLength(content), now(), fileId);
      projects.touch(projectId);
      return files.get(projectId, fileId);
    },
    remove(projectId, fileId) { const ok = q('DELETE FROM files WHERE project_id=? AND id=?').run(projectId, fileId).changes > 0; if (ok) projects.touch(projectId); return ok; },
    /** Replace the whole file set atomically (used by sync, restore and AI-change approval). */
    replaceAll(projectId, list) {
      tx(() => {
        q('DELETE FROM files WHERE project_id=?').run(projectId);
        for (const f of list) files.create(projectId, f);
      });
      projects.touch(projectId);
    },
    /** Insert or overwrite by path. Returns {created, updated, skipped}. */
    upsertMany(projectId, list, overwrite) {
      const out = { created: [], updated: [], skipped: [] };
      tx(() => {
        for (const f of list) {
          const ex = files.byPath(projectId, f.path);
          if (!ex) { files.create(projectId, f); out.created.push(f.path); }
          else if (overwrite) { files.update(projectId, ex.id, { content: f.content }); out.updated.push(f.path); }
          else out.skipped.push(f.path);
        }
      });
      return out;
    },
  };

  const versions = {
    create(projectId, label, summary, fileList) {
      const id = nid();
      q('INSERT INTO versions(id,project_id,label,summary,files,created_at) VALUES (?,?,?,?,?,?)').run(id, projectId, label, summary || '', JSON.stringify(fileList), now());
      // keep the newest 100 snapshots per project
      q('DELETE FROM versions WHERE project_id=? AND id NOT IN (SELECT id FROM versions WHERE project_id=? ORDER BY created_at DESC LIMIT 100)').run(projectId, projectId);
      return versions.get(projectId, id, false);
    },
    list(projectId, { limit, offset }) {
      const total = q('SELECT COUNT(*) n FROM versions WHERE project_id=?').get(projectId).n;
      const items = q('SELECT id,label,summary,created_at,files FROM versions WHERE project_id=? ORDER BY created_at DESC LIMIT ? OFFSET ?').all(projectId, limit, offset)
        .map((r) => ({ id: r.id, label: r.label, summary: r.summary, createdAt: r.created_at, fileCount: JSON.parse(r.files).length }));
      return { items, total };
    },
    get(projectId, id, withFiles = true) {
      const r = q('SELECT * FROM versions WHERE project_id=? AND id=?').get(projectId, id);
      return r && { id: r.id, label: r.label, summary: r.summary, createdAt: r.created_at, ...(withFiles ? { files: JSON.parse(r.files) } : { fileCount: JSON.parse(r.files).length }) };
    },
    remove(projectId, id) { return q('DELETE FROM versions WHERE project_id=? AND id=?').run(projectId, id).changes > 0; },
  };

  const componentRow = (r) => r && ({ id: r.id, projectId: r.project_id, name: r.name, category: r.category, description: r.description, html: r.html, css: r.css, js: r.js, createdAt: r.created_at, updatedAt: r.updated_at });

  const components = {
    list(userId, projectId = undefined) {
      const rows = projectId === undefined
        ? q('SELECT * FROM components WHERE user_id=? ORDER BY updated_at DESC').all(userId)
        : q('SELECT * FROM components WHERE user_id=? AND project_id=? ORDER BY updated_at DESC').all(userId, projectId);
      return rows.map(componentRow);
    },
    get(userId, id) { return componentRow(q('SELECT * FROM components WHERE id=? AND user_id=?').get(id, userId)); },
    create(userId, input) {
      const t = now(), id = nid();
      q('INSERT INTO components(id,user_id,project_id,name,category,description,html,css,js,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)')
        .run(id, userId, input.projectId || null, input.name, input.category || 'custom', input.description || '', input.html || '', input.css || '', input.js || '', t, t);
      return components.get(userId, id);
    },
    update(userId, id, patch) {
      const cur = components.get(userId, id); if (!cur) return null;
      q('UPDATE components SET name=?,category=?,description=?,html=?,css=?,js=?,updated_at=? WHERE id=? AND user_id=?')
        .run(patch.name ?? cur.name, patch.category ?? cur.category, patch.description ?? cur.description, patch.html ?? cur.html, patch.css ?? cur.css, patch.js ?? cur.js, now(), id, userId);
      return components.get(userId, id);
    },
    remove(userId, id) { return q('DELETE FROM components WHERE id=? AND user_id=?').run(id, userId).changes > 0; },
    resolve(userId, ids) { return ids.map((id) => components.get(userId, id)).filter(Boolean); },
  };

  const messages = {
    add(projectId, { role, action, content, meta }) {
      const id = nid();
      q('INSERT INTO messages(id,project_id,role,action,content,meta,created_at) VALUES (?,?,?,?,?,?,?)').run(id, projectId, role, action || null, content, meta ? JSON.stringify(meta) : null, now());
      q('DELETE FROM messages WHERE project_id=? AND id NOT IN (SELECT id FROM messages WHERE project_id=? ORDER BY created_at DESC LIMIT 500)').run(projectId, projectId);
      return id;
    },
    list(projectId, { limit, offset }) {
      const total = q('SELECT COUNT(*) n FROM messages WHERE project_id=?').get(projectId).n;
      const items = q('SELECT * FROM messages WHERE project_id=? ORDER BY created_at ASC, rowid ASC LIMIT ? OFFSET ?').all(projectId, limit, offset)
        .map((r) => ({ id: r.id, role: r.role, action: r.action, content: r.content, meta: r.meta ? JSON.parse(r.meta) : null, createdAt: r.created_at }));
      return { items, total };
    },
    clear(projectId) { q('DELETE FROM messages WHERE project_id=?').run(projectId); },
  };

  return { users, projects, files, versions, messages, components, tx };
}

module.exports = { open, repos, nid };
