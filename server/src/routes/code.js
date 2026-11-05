const express = require('express');
const { wrap } = require('../middleware');
const { HttpError, v } = require('../errors');
const { checkFile } = require('../filePolicy');

const ACTIONS = ['explain', 'generate', 'refactor', 'fix', 'review', 'tests'];

module.exports = ({ ai, repos, cfg, jobs, projectRoutes }) => {
  const r = express.Router();
  const L = cfg.limits;

  function context(req) {
    const b = req.body || {};
    let project = null, files;
    if (b.projectId !== undefined) project = projectRoutes.own({ userId: req.userId, params: { projectId: b.projectId } });
    if (b.files !== undefined) {
      if (!Array.isArray(b.files) || b.files.length > L.projectFiles) throw new HttpError(400, 'files must be a list.');
      files = b.files.map((f) => {
        const err = checkFile(f, L);
        if (err) throw new HttpError(400, `${f && f.path ? f.path + ': ' : ''}${err}`);
        return { path: f.path, content: f.content };
      });
    } else if (project) files = repos.files.list(project.id, true).map(({ path, content }) => ({ path, content }));
    else files = [];
    if (files.reduce((n, f) => n + f.content.length, 0) > L.requestFilesChars) throw new HttpError(413, `Too much code for one request (max ${Math.round(L.requestFilesChars / 1000)}K characters). Select fewer files as context.`);
    const sel = b.selection;
    let selection;
    if (sel !== undefined) {
      if (typeof sel !== 'object' || sel === null) throw new HttpError(400, 'selection must be an object.');
      selection = { path: v.str(sel.path ?? '', 'selection.path', { max: 200 }), text: v.str(sel.text ?? '', 'selection.text', { max: 60_000 }), startLine: sel.startLine ? v.int(sel.startLine, 'startLine', { min: 1, max: 1e7 }) : undefined, endLine: sel.endLine ? v.int(sel.endLine, 'endLine', { min: 1, max: 1e7 }) : undefined };
    }
    const diagnostics = Array.isArray(b.diagnostics) ? b.diagnostics.slice(0, 40).map((d) => ({ path: String(d.path || '').slice(0, 200), line: Number(d.line) || undefined, message: String(d.message || '').slice(0, 300) })) : [];
    const instruction = v.str(b.instruction, 'instruction', { max: 4000, optional: true });
    const rules = Array.isArray(b.instructions) ? b.instructions.slice(0, 20).map((s) => String(s).slice(0, 300)) : [];
    return { project, files, selection, diagnostics, instruction, instructions: rules, language: v.str(b.language, 'language', { max: 40, optional: true }) };
  }

  r.post('/:action', wrap(async (req, res) => {
    const action = req.params.action;
    if (!ACTIONS.includes(action)) throw new HttpError(404, 'Unknown code action.');
    const input = context(req);
    if (action === 'generate' && !input.instruction?.trim()) throw new HttpError(400, 'Tell the assistant what to generate (instruction).');
    if (!input.files.length && !input.selection?.text && action !== 'generate') throw new HttpError(400, 'Nothing to work on: send files, a selection or a projectId.');

    const run = async () => {
      const out = await ai.codeAction(action, input);
      if (input.project) {
        repos.messages.add(input.project.id, { role: 'user', action, content: input.instruction || `(${action})`, meta: { selection: input.selection?.path } });
        repos.messages.add(input.project.id, { role: 'assistant', action, content: out.explanation || out.notes || '(no text)', meta: { files: out.files.map((f) => ({ path: f.path, status: f.status })), issues: out.issues.length, dependencies: out.dependencies.map((d) => d.name) } });
      }
      return out;
    };
    if (v.bool(req.query.async)) return res.status(202).json({ jobId: jobs.submit(req.userId, 'code:' + action, run) });
    res.json(await run());
  }));
  return r;
};
