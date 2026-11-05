// Turns AI text into validated, structured data. Nothing here trusts the model: every path and size is checked.
const { checkFile, languageOf } = require('../filePolicy');
const { HttpError } = require('../errors');

const MARK = /^=== ([A-Z ]+?)(?:: (.+?))? ===\s*$/m;

/** Split "=== NAME ===" / "=== FILE: path ===" sections. */
function sections(text) {
  const lines = String(text).replace(/\r\n/g, '\n').split('\n');
  const out = [];
  let cur = null;
  for (const line of lines) {
    const m = /^=== ([A-Z ]+?)(?:: (.+?))? ===\s*$/.exec(line);
    if (m) { cur = { name: m[1].trim(), arg: (m[2] || '').trim(), body: [] }; out.push(cur); }
    else if (cur) cur.body.push(line);
  }
  return out.map((s) => ({ name: s.name, arg: s.arg, body: s.body.join('\n') }));
}

const stripFence = (c) => c.replace(/^\s*```[\w-]*\n/, '').replace(/\n```\s*$/, '').replace(/^\n/, '').replace(/\s+$/, '') + '\n';

/** Validate AI-produced files against the same policy as uploads. Returns {files, rejected}. */
function validateFiles(list, limits, existing = []) {
  const have = new Map(existing.map((f) => [f.path, f.content]));
  const files = [], rejected = [], seen = new Set();
  let total = 0;
  for (const f of list) {
    const err = checkFile(f, limits) || (seen.has(f.path) ? 'Listed twice.' : !f.content.trim() ? 'Empty file.' : null);
    if (err) { rejected.push({ path: String(f.path).slice(0, 120), reason: err }); continue; }
    total += f.content.length;
    if (total > 600_000) { rejected.push({ path: f.path, reason: 'Answer too large.' }); continue; }
    seen.add(f.path);
    const old = have.get(f.path);
    files.push({ path: f.path, content: f.content, language: languageOf(f.path), status: old === undefined ? 'new' : old === f.content ? 'unchanged' : 'modified' });
  }
  return { files, rejected };
}

/** Legacy generate/refine format: FILE sections + NOTES. */
function parseFiles(text, limits, { allowEmpty = false } = {}) {
  const secs = sections(text);
  const notes = (secs.find((s) => s.name === 'NOTES')?.body || '').trim().slice(0, 500);
  const raw = secs.filter((s) => s.name === 'FILE').map((s) => ({ path: s.arg, content: stripFence(s.body) }));
  const { files } = validateFiles(raw, limits);
  if (!files.length && !allowEmpty) throw new HttpError(502, 'AI answer had no usable files. Try again, or use a smaller input.');
  return { files: files.map(({ path, content }) => ({ path, content })), notes };
}

/**
 * Analysis-only answer: a numbered list "N. Section | what differs". Never throws: if the model ignored the format,
 * items is empty and the app shows the raw text. Lines that say "matches" are dropped. Markdown noise (bold, bullets) is removed.
 * `notes` is rebuilt as a clean numbered list, which is exactly what the app's own parser reads.
 */
function parsePlan(text, max = 80) {
  const body = String(text).replace(/\r\n/g, '\n');
  const head = body.split(/^=== NOTES ===\s*$/m);
  const list = head[0];
  const summary = (head[1] || '').trim().slice(0, 300);
  const items = [];
  const seen = new Set();
  for (const raw of list.split('\n')) {
    const m = /^\s*(?:[-*]\s*)?(\d{1,3})[.)]\s*(.+)$/.exec(raw);
    if (!m) continue;
    const clean = m[2].replace(/\*\*/g, '').replace(/`/g, '').trim();
    const parts = clean.split('|');
    const section = (parts.length > 1 ? parts[0] : 'General').trim().slice(0, 60) || 'General';
    const detail = (parts.length > 1 ? parts.slice(1).join('|') : clean).trim().slice(0, 600);
    if (!detail || /^(matches|ok|no change|same)\.?$/i.test(detail)) continue;
    const key = section.toLowerCase() + '|' + detail.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    items.push({ id: 'p' + (items.length + 1), section, text: detail });
    if (items.length >= max) break;
  }
  const notes = items.length ? items.map((i, n) => `${n + 1}. ${i.section} | ${i.text}`).join('\n') + (summary ? '\n' + summary : '') : String(text).trim().slice(0, 4000);
  return { items, notes, summary };
}

const SEVERITIES = ['critical', 'high', 'medium', 'low', 'info'];
const DEP = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*(@[\w.^~<>=*-]+)?$/i;

/** Structured code-assistant answer. */
function parseCodeResponse(text, limits, existing) {
  const secs = sections(text);
  const get = (n) => secs.find((s) => s.name === n)?.body.trim() || '';
  const raw = secs.filter((s) => s.name === 'FILE').map((s) => ({ path: s.arg, content: stripFence(s.body) }));
  const { files, rejected } = validateFiles(raw, limits, existing);

  const dependencies = [];
  for (const line of get('DEPENDENCIES').split('\n')) {
    const m = /^[-*]?\s*(\S+)(?:\s+[-:—]\s+(.*)|:\s*(.*))?$/.exec(line.trim());
    if (m && DEP.test(m[1]) && !/^none$/i.test(m[1])) dependencies.push({ name: m[1], reason: (m[2] || m[3] || '').slice(0, 200) });
  }
  const issues = [];
  for (const line of get('ISSUES').split('\n')) {
    // severity | path:line | message | fix
    const p = line.split('|').map((x) => x.trim());
    if (p.length >= 3 && SEVERITIES.includes(p[0].toLowerCase())) {
      const loc = /^(.*?)(?::(\d+))?$/.exec(p[1]) || [];
      issues.push({ severity: p[0].toLowerCase(), path: (loc[1] || '').slice(0, 200), line: loc[2] ? Number(loc[2]) : undefined, message: p[2].slice(0, 500), fix: (p[3] || '').slice(0, 500) });
    }
  }
  issues.sort((a, b) => SEVERITIES.indexOf(a.severity) - SEVERITIES.indexOf(b.severity));

  const explanation = get('EXPLANATION').slice(0, 12_000);
  const notes = get('NOTES').slice(0, 1000);
  const warnings = rejected.map((r) => `Ignored ${r.path}: ${r.reason}`);
  return { explanation, files, dependencies, issues, notes, warnings };
}

module.exports = { sections, parseFiles, parsePlan, parseCodeResponse, validateFiles, SEVERITIES, MARK };
