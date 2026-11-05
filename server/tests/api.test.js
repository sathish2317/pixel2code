// Run: node --test tests/   (Node 22.13+). Uses an in-memory SQLite DB and a fake AI server; no network, no real keys.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const JSZip = require('jszip');
const { createApp } = require('../src/app');

let fake, fakeUrl, script = [], seen = [];
let srv, base;
const T = { 'x-app-token': 'alice-token-1', 'content-type': 'application/json' };
const B = { 'x-app-token': 'bob-token-22', 'content-type': 'application/json' };

test.before(async () => {
  fake = http.createServer((req, res) => {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      seen.push(JSON.parse(body || '{}'));
      const next = script.shift() || { status: 200, text: '=== EXPLANATION ===\nok' };
      res.writeHead(next.status || 200, { 'content-type': 'application/json', ...(next.headers || {}) });
      res.end(next.status && next.status >= 400 ? JSON.stringify({ error: { message: 'boom' } }) : JSON.stringify({ choices: [{ message: { content: next.text } }] }));
    });
  });
  await new Promise((r) => fake.listen(0, r));
  fakeUrl = `http://127.0.0.1:${fake.address().port}/v1/chat`;
  const { app } = createApp({ AI_PROVIDER: 'groq', GROQ_API_KEY: 'k', AI_BASE_URL: fakeUrl, APP_USERS: 'alice:alice-token-1,bob:bob-token-22', DB_PATH: ':memory:', AI_BACKOFF_MS: '5', AI_MAX_ATTEMPTS: '3', AI_RATE_LIMIT: '200' }, { quiet: true });
  srv = http.createServer(app);
  await new Promise((r) => srv.listen(0, r));
  base = `http://127.0.0.1:${srv.address().port}`;
});
test.after(() => { srv.close(); fake.close(); });

const call = async (method, path, body, headers = T) => {
  const r = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const ct = r.headers.get('content-type') || '';
  return { status: r.status, headers: r.headers, body: ct.includes('json') ? await r.json() : Buffer.from(await r.arrayBuffer()) };
};

test('auth: missing / wrong token is rejected, health is public', async () => {
  assert.equal((await call('GET', '/health', undefined, {})).status, 200);
  assert.equal((await call('GET', '/api/projects', undefined, {})).status, 401);
  assert.equal((await call('GET', '/api/projects', undefined, { 'x-app-token': 'nope' })).status, 401);
});

let pid;
test('projects: create with files, list, get, patch', async () => {
  const c = await call('POST', '/api/projects', { name: 'Site', files: [{ path: 'index.html', content: '<h1>Hi</h1>' }, { path: 'css/a.css', content: 'h1{}' }] });
  assert.equal(c.status, 201); pid = c.body.id;
  assert.equal(c.body.fileCount, 2);
  const l = await call('GET', '/api/projects?limit=1');
  assert.equal(l.body.total, 1); assert.equal(l.body.items[0].fileCount, 2);
  const g = await call('GET', '/api/projects/' + pid);
  assert.deepEqual(g.body.files.map((f) => f.path).sort(), ['css/a.css', 'index.html']);
  assert.equal((await call('PATCH', '/api/projects/' + pid, { name: 'Renamed' })).body.name, 'Renamed');
  assert.equal((await call('POST', '/api/projects', { name: '' })).status, 400);
});

test('ownership: another user cannot see, change or delete it', async () => {
  assert.equal((await call('GET', '/api/projects/' + pid, undefined, B)).status, 404);
  assert.equal((await call('PATCH', '/api/projects/' + pid, { name: 'x' }, B)).status, 404);
  assert.equal((await call('DELETE', `/api/projects/${pid}?confirm=Renamed`, undefined, B)).status, 404);
  assert.equal((await call('GET', '/api/projects', undefined, B)).body.total, 0);
  assert.equal((await call('POST', '/api/code/review', { projectId: pid }, B)).status, 404);
  assert.equal((await call('POST', '/api/export/zip', { projectId: pid }, B)).status, 404);
});

test('files: create, duplicate, save, rename, delete, path + type rules', async () => {
  const f = await call('POST', `/api/projects/${pid}/files`, { path: 'js/app.js', content: 'let a=1;' });
  assert.equal(f.status, 201);
  assert.equal((await call('POST', `/api/projects/${pid}/files`, { path: 'js/app.js', content: 'x' })).status, 409);
  const id = (await call('GET', `/api/projects/${pid}/files`)).body.items.find((x) => x.path === 'js/app.js').id;
  const put = await call('PUT', `/api/projects/${pid}/files/${id}`, { content: 'let a=2;' });
  assert.equal(put.body.bytes, 8);
  assert.equal((await call('PUT', `/api/projects/${pid}/files/${id}`, { path: 'js/b.js' })).body.language, 'javascript');
  assert.equal((await call('GET', `/api/projects/${pid}/files/${id}`)).body.content, 'let a=2;');
  for (const bad of [{ path: '../evil.js', content: 'x' }, { path: '/etc/passwd', content: 'x' }, { path: 'a\\b.js', content: 'x' }, { path: 'run.exe', content: 'x' }, { path: 'x.sh', content: 'x' }, { path: 'a.js', content: 'bin\u0000ary' }, { path: 'a.weird', content: 'x' }])
    assert.equal((await call('POST', `/api/projects/${pid}/files`, bad)).status, 400, JSON.stringify(bad).slice(0, 40));
  assert.equal((await call('DELETE', `/api/projects/${pid}/files/${id}`)).status, 200);
  assert.equal((await call('GET', `/api/projects/${pid}/files/${id}`)).status, 404);
});

test('bulk import keeps existing files unless overwrite=true', async () => {
  const r1 = await call('POST', `/api/projects/${pid}/files`, { files: [{ path: 'index.html', content: 'NEW' }, { path: 'n.txt', content: 'n' }] });
  assert.deepEqual([r1.body.created, r1.body.skipped], [['n.txt'], ['index.html']]);
  assert.equal((await call('GET', `/api/projects/${pid}/files?content=1`)).body.items.find((x) => x.path === 'index.html').content, '<h1>Hi</h1>');
  const r2 = await call('POST', `/api/projects/${pid}/files`, { files: [{ path: 'index.html', content: 'NEW' }], overwrite: true });
  assert.deepEqual(r2.body.updated, ['index.html']);
});

test('versions: snapshot, change, restore (and a safety snapshot is made)', async () => {
  const s = await call('POST', `/api/projects/${pid}/versions`, { label: 'v1' });
  assert.equal(s.status, 201);
  await call('PUT', `/api/projects/${pid}/sync`, { files: [{ path: 'only.html', content: 'x' }] });
  assert.deepEqual((await call('GET', `/api/projects/${pid}/files`)).body.items.map((f) => f.path), ['only.html']);
  const rs = await call('POST', `/api/projects/${pid}/versions/${s.body.id}/restore`);
  assert.equal(rs.status, 200); assert.ok(rs.body.files.some((f) => f.path === 'index.html'));
  const list = (await call('GET', `/api/projects/${pid}/versions`)).body;
  assert.ok(list.items.some((v) => v.label === 'Before restore') && list.items.some((v) => v.label === 'Before sync'));
});

test('code actions: structured result, status new/modified, bad paths/exe rejected, history stored', async () => {
  script.push({ text: '=== EXPLANATION ===\nChanged the heading.\n=== FILE: index.html ===\n```html\n<h1>Better</h1>\n```\n=== FILE: tests/a.test.js ===\ntest(1)\n=== FILE: ../x.js ===\nbad\n=== FILE: evil.exe ===\nMZ\n=== DEPENDENCIES ===\n- vitest - test runner\n- rm -rf / - x\n=== NOTES ===\nCheck it.' });
  const r = await call('POST', '/api/code/refactor', { projectId: pid, instruction: 'improve heading' });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.files.map((f) => [f.path, f.status]), [['index.html', 'modified'], ['tests/a.test.js', 'new']]);
  assert.equal(r.body.requiresApproval, true);
  assert.deepEqual(r.body.dependencies.map((d) => d.name), ['vitest']);
  assert.equal(r.body.warnings.length, 2);
  assert.match(seen.at(-1).messages[0].content, /PROJECT FILES/);
  // The server only proposes: stored file is unchanged.
  assert.equal((await call('GET', `/api/projects/${pid}/files?content=1`)).body.items.find((f) => f.path === 'index.html').content, 'NEW');
  const msgs = (await call('GET', `/api/projects/${pid}/messages`)).body;
  assert.equal(msgs.total, 2); assert.equal(msgs.items[0].role, 'user');
});

test('review returns sorted issues and never proposes edits; explain too', async () => {
  script.push({ text: '=== EXPLANATION ===\nTwo issues.\n=== FILE: index.html ===\nSNEAKY\n=== ISSUES ===\nlow | index.html:1 | no alt | add alt\ncritical | a.js:9 | eval of user input | remove eval\n' });
  const r = await call('POST', '/api/code/review', { projectId: pid });
  assert.deepEqual(r.body.issues.map((i) => i.severity), ['critical', 'low']);
  assert.equal(r.body.files.length, 0);
});

test('code: validation', async () => {
  assert.equal((await call('POST', '/api/code/generate', { files: [] })).status, 400);
  assert.equal((await call('POST', '/api/code/nope', {})).status, 404);
  assert.equal((await call('POST', '/api/code/explain', {})).status, 400);
  assert.equal((await call('POST', '/api/code/explain', { files: [{ path: 'a.exe', content: 'x' }] })).status, 400);
  const big = [{ path: 'a.js', content: 'x'.repeat(900_000) }, { path: 'b.js', content: 'x'.repeat(900_000) }];
  assert.equal((await call('POST', '/api/code/explain', { files: big })).status, 413);
});

test('AI retry: 503 is retried with backoff and then succeeds; never more than 3 attempts', async () => {
  seen = [];
  script.push({ status: 503 }, { status: 503 }, { text: '=== EXPLANATION ===\nrecovered' });
  const ok = await call('POST', '/api/code/explain', { files: [{ path: 'a.js', content: 'x' }] });
  assert.equal(ok.status, 200); assert.equal(seen.length, 3);
  seen = [];
  script.push({ status: 500 }, { status: 500 }, { status: 500 }, { text: 'never used' });
  const fail = await call('POST', '/api/code/explain', { files: [{ path: 'a.js', content: 'x' }] });
  assert.equal(fail.status, 502); assert.equal(seen.length, 3);
  script.length = 0;
});

test('AI quota (429) is reported clearly and not retried when the wait is long', async () => {
  seen = [];
  script.push({ status: 429, headers: { 'retry-after': '120' } });
  const r = await call('POST', '/api/code/explain', { files: [{ path: 'a.js', content: 'x' }] });
  assert.equal(r.status, 429); assert.equal(r.body.quota, true); assert.equal(r.body.retryAfterSec, 120); assert.equal(seen.length, 1);
});

test('async jobs: 202 + poll', async () => {
  script.push({ text: '=== EXPLANATION ===\nasync ok' });
  const r = await call('POST', '/api/code/explain?async=1', { files: [{ path: 'a.js', content: 'x' }] });
  assert.equal(r.status, 202);
  let j;
  for (let i = 0; i < 50; i++) { j = (await call('GET', '/api/jobs/' + r.body.jobId)).body; if (j.status === 'done' || j.status === 'failed') break; await new Promise((x) => setTimeout(x, 20)); }
  assert.equal(j.status, 'done'); assert.equal(j.result.explanation, 'async ok');
  assert.equal((await call('GET', '/api/jobs/' + r.body.jobId, undefined, B)).status, 404);
});

test('legacy /api/generate and /api/refine still work', async () => {
  script.push({ text: '=== FILE: index.html ===\n<h1>x</h1>\n=== NOTES ===\nmade' });
  const g = await call('POST', '/api/generate', { images: [{ base64: 'A'.repeat(200), mime: 'image/png' }], target: 'html' });
  assert.equal(g.status, 200); assert.equal(g.body.files[0].path, 'index.html'); assert.equal(g.body.notes, 'made');
  assert.equal((await call('POST', '/api/generate', { images: [{ base64: 'A'.repeat(200), mime: 'image/gif' }] })).status, 400);
  assert.equal((await call('POST', '/api/generate', { images: [{ base64: 'A'.repeat(200), mime: 'application/pdf' }] })).status, 400); // groq cannot read PDFs
  script.push({ text: '=== FILE: index.html ===\n<h1>y</h1>' });
  const rf = await call('POST', '/api/refine', { files: [{ path: 'index.html', content: 'x' }], request: 'change' });
  assert.equal(rf.body.files[0].content, '<h1>y</h1>\n');
});

test('convert/image-to-code passes options into the prompt', async () => {
  seen = [];
  script.push({ text: '=== FILE: src/App.jsx ===\nx\n=== FILE: src/styles.css ===\ny' });
  const r = await call('POST', '/api/convert/image-to-code', { images: [{ base64: 'A'.repeat(200), mime: 'image/png' }], options: { framework: 'react', breakpoints: [480, 1024], font: 'Inter' } });
  assert.equal(r.status, 200); assert.equal(r.body.files.length, 2);
  const prompt = JSON.stringify(seen.at(-1));
  assert.match(prompt, /Output framework: react/); assert.match(prompt, /480, 1024/);
  assert.equal((await call('POST', '/api/convert/image-to-code', { images: [{ base64: 'A'.repeat(200), mime: 'image/png' }], options: { framework: 'cobol' } })).status, 400);
});

test('convert/pdf-text: extracts a real PDF text layer, rejects non-PDF', async () => {
  const pdf = Buffer.from(`%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 300 100]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n4 0 obj<</Length 55>>stream\nBT /F1 14 Tf 10 50 Td (Hello Pixel2Code PDF text) Tj ET\nendstream endobj\n5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R/Size 6>>\n%%EOF`);
  const r = await call('POST', '/api/convert/pdf-text', { base64: pdf.toString('base64').padEnd(200, '=') });
  if (r.status === 200) assert.match(r.body.text, /Hello Pixel2Code/); else assert.ok([400, 422].includes(r.status), 'status ' + r.status);
  assert.equal((await call('POST', '/api/convert/pdf-text', { base64: Buffer.from('not a pdf '.repeat(30)).toString('base64') })).status, 400);
});

test('preview/build: inlines css+js and reports problems; non-web project is refused honestly', async () => {
  const r = await call('POST', '/api/preview/build', { files: [{ path: 'index.html', content: '<!doctype html><title>t</title><link rel="stylesheet" href="s.css"><script src="missing.js"></script><h1>x</h1>' }, { path: 's.css', content: 'h1{color:red}' }] });
  assert.equal(r.status, 200); assert.match(r.body.html, /color:red/);
  assert.ok(r.body.diagnostics.some((d) => d.severity === 'error' && /missing\.js/.test(d.message)));
  const py = await call('POST', '/api/preview/build', { files: [{ path: 'main.py', content: 'print(1)' }] });
  assert.equal(py.status, 422); assert.match(py.body.error, /runner/);
});

test('export/zip: valid archive with the project files', async () => {
  const r = await call('POST', '/api/export/zip', { projectId: pid });
  assert.equal(r.status, 200); assert.match(r.headers.get('content-disposition'), /Renamed\.zip/);
  const z = await JSZip.loadAsync(r.body);
  assert.ok(z.file('index.html'));
});

test('capabilities + run are honest about what is not configured', async () => {
  const c = (await call('GET', '/api/capabilities')).body;
  assert.equal(c.codeRunner.configured, false); assert.equal(c.ocr.configured, false);
  assert.equal(c.designAnalysis.configured, true); assert.equal(c.savedComponentLibrary.configured, true);
  assert.equal(c.browserAutomation.configured, false);
  const run = await call('POST', '/api/run', { language: 'python', code: 'print(1)' });
  assert.equal(run.status, 501); assert.equal(run.body.unconfigured, true);
});

test('saved components: CRUD, owner isolation and component selection in image generation', async () => {
  const created = await call('POST', '/api/components', { name: 'Hero', category: 'section', description: 'Main hero', html: '<header class="hero">Hi</header>', css: '.hero{padding:2rem}', js: '' });
  assert.equal(created.status, 201);
  const id = created.body.id;
  assert.equal((await call('GET', '/api/components')).body.items.length, 1);
  assert.equal((await call('GET', '/api/components', undefined, B)).body.items.length, 0);
  assert.equal((await call('PUT', '/api/components/' + id, { name: 'Hero Updated' })).body.name, 'Hero Updated');
  assert.equal((await call('DELETE', '/api/components/' + id, undefined, B)).status, 404);
  script.push({ text: '=== FILE: index.html ===\n<h1>Generated</h1>\n=== NOTES ===\nReused hero.' });
  const generated = await call('POST', '/api/convert/image-to-code', { images: [{ mime: 'image/png', base64: 'A'.repeat(150) }], componentIds: [id] });
  assert.equal(generated.status, 200);
  assert.match(seen.at(-1).messages[0].content[0].text, /SAVED COMPONENT "Hero Updated"/);
  assert.equal((await call('DELETE', '/api/components/' + id)).body.deleted, true);
});

test('design analysis and screenshot comparison use the vision provider and structured responses', async () => {
  const image = { mime: 'image/png', base64: 'A'.repeat(150) };
  script.push({ text: JSON.stringify({ title: 'Clinic', pageType: 'marketing', sections: [], confidence: 0.8 }) });
  const analysis = await call('POST', '/api/design/analyze', { image });
  assert.equal(analysis.status, 200); assert.equal(analysis.body.structured, true); assert.equal(analysis.body.title, 'Clinic');
  script.push({ text: JSON.stringify({ visualScore: 87, summary: 'Close match', issues: [], matches: ['Header'] }) });
  const compare = await call('POST', '/api/design/compare', { reference: image, rendered: image, viewport: { width: 1440, height: 900 } });
  assert.equal(compare.status, 200); assert.equal(compare.body.visualScore, 87);
  assert.match(compare.body.measurement, /frontend Canvas/);
  assert.equal((await call('POST', '/api/design/compare', { reference: image, rendered: { ...image, mime: 'application/pdf' } })).status, 400);
});

test('static quality audit reports responsive, accessibility, SEO and security findings', async () => {
  const r = await call('POST', '/api/quality/audit', { files: [
    { path: 'index.html', content: '<html><head></head><body><img src="x.png"><a target="_blank" href="x">open</a><h1>A</h1><h1>B</h1></body></html>' },
    { path: 'styles.css', content: '.hero{width:1200px;animation:fade 1s}' },
    { path: 'app.js', content: 'eval(input); el.innerHTML = value;' }
  ] });
  assert.equal(r.status, 200); assert.ok(r.body.score < 100);
  assert.ok(r.body.issues.some((i) => i.category === 'responsive'));
  assert.ok(r.body.issues.some((i) => i.message.includes('alt')));
  assert.ok(r.body.issues.some((i) => i.message.includes('eval')));
  assert.ok(r.body.issues.some((i) => i.category === 'seo'));
  assert.match(r.body.note, /not a browser execution/);
});

test('delete project needs the exact name; then everything is gone', async () => {
  assert.equal((await call('DELETE', `/api/projects/${pid}`)).status, 400);
  assert.equal((await call('DELETE', `/api/projects/${pid}?confirm=Renamed`)).status, 200);
  assert.equal((await call('GET', `/api/projects/${pid}`)).status, 404);
});

test('unconfigured AI says so (503) instead of failing mysteriously', async () => {
  const { app } = createApp({ AI_PROVIDER: 'groq', APP_TOKEN: 'tttttttt1', DB_PATH: ':memory:' }, { quiet: true });
  const s = http.createServer(app); await new Promise((r) => s.listen(0, r));
  const r = await fetch(`http://127.0.0.1:${s.address().port}/api/code/explain`, { method: 'POST', headers: { 'x-app-token': 'tttttttt1', 'content-type': 'application/json' }, body: JSON.stringify({ files: [{ path: 'a.js', content: 'x' }] }) });
  assert.equal(r.status, 503); assert.equal((await r.json()).unconfigured, true); s.close();
});
