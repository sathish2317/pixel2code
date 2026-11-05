// Run: node --test tests/   Tests for the design-quality changes: analysis-only plan, self-check pass, prompt rules.
const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createApp } = require('../src/app');
const { parsePlan, parseFiles } = require('../src/services/aiOutput');
const P = require('../src/services/prompts');

let fake, srv, base, script = [], seen = [];
const T = { 'x-app-token': 'alice-token-1', 'content-type': 'application/json' };
const IMG = { base64: 'A'.repeat(200), mime: 'image/png' };
const FILES = [{ path: 'index.html', content: '<h1>Hi</h1>' + 'x'.repeat(100) }, { path: 'styles.css', content: 'h1{color:red}' + ' '.repeat(100) }];
const text = (s) => ({ status: 200, text: s });
const promptOf = (i) => seen[i].messages[0].content.find((p) => p.type === 'text').text;

function boot(extraEnv = {}) {
  return new Promise((resolve) => {
    fake = http.createServer((req, res) => {
      let body = '';
      req.on('data', (c) => (body += c));
      req.on('end', () => {
        seen.push(JSON.parse(body || '{}'));
        const next = script.shift() || text('=== NOTES ===\nok');
        res.writeHead(next.status || 200, { 'content-type': 'application/json' });
        res.end(next.status >= 400 ? JSON.stringify({ error: { message: 'boom' } }) : JSON.stringify({ choices: [{ message: { content: next.text } }] }));
      });
    });
    fake.listen(0, () => {
      const { app } = createApp({ AI_PROVIDER: 'groq', GROQ_API_KEY: 'k', AI_BASE_URL: `http://127.0.0.1:${fake.address().port}/v1/chat`, APP_USERS: 'alice:alice-token-1', DB_PATH: ':memory:', AI_BACKOFF_MS: '5', AI_MAX_ATTEMPTS: '2', AI_RATE_LIMIT: '200', ...extraEnv }, { quiet: true });
      srv = http.createServer(app);
      srv.listen(0, () => { base = `http://127.0.0.1:${srv.address().port}`; resolve(); });
    });
  });
}
const post = async (path, body) => { const r = await fetch(base + path, { method: 'POST', headers: T, body: JSON.stringify(body) }); return { status: r.status, body: await r.json() }; };
const stop = () => { srv.close(); fake.close(); script = []; seen = []; };

test('parsePlan: reads numbered lines, drops "matches", removes markdown, never throws', () => {
  const r = parsePlan('1. **Header** | logo is 20px too small\n2. Hero | matches\n- 3) Footer | 4 columns, bg #f4f7fb\nrandom text\n=== NOTES ===\n80% match');
  assert.deepEqual(r.items.map((i) => [i.section, i.text]), [['Header', 'logo is 20px too small'], ['Footer', '4 columns, bg #f4f7fb']]);
  assert.match(r.notes, /^1\. Header \| logo is 20px too small\n2\. Footer \|/);
  assert.equal(parsePlan('sorry, I cannot do that').items.length, 0);
  assert.equal(parsePlan('sorry, I cannot do that').notes, 'sorry, I cannot do that');
});

test('parseFiles: allowEmpty returns no files instead of throwing', () => {
  assert.deepEqual(parseFiles('=== NOTES ===\nNo fixes needed', { fileBytes: 1e6 }, { allowEmpty: true }).files, []);
  assert.throws(() => parseFiles('=== NOTES ===\nNo fixes needed', { fileBytes: 1e6 }), /no usable files/);
});

test('generate prompt: fidelity, responsive, light-colour and no-own-animation rules, plus the user instructions', () => {
  const p = P.buildPrompt({ mode: 'generate', target: 'html', instructions: ['make the footer dark blue'], isPdf: false, imageCount: 1, assets: [] });
  assert.match(p, /FIDELITY CHECKLIST/);
  assert.match(p, /RESPONSIVE RULES/);
  assert.match(p, /\/\* ===== RESPONSIVE ===== \*\//);
  assert.match(p, /LIGHT tint of the reference palette/);
  assert.match(p, /do NOT write hover, scroll-reveal/);
  assert.match(p, /Every visible control must have a real/);
  assert.match(p, /Three.js\/WebGL/);
  assert.match(p, /make the footer dark blue/);
  const r = P.buildPrompt({ mode: 'refine', target: 'html', instructions: [], files: [], request: 'x', assets: [] });
  assert.match(r, /numbered list of changes, apply EVERY item/);
  const reactPrompt = P.buildPrompt({ mode: 'generate', target: 'html', instructions: ['Output framework: react. Create a real multi-file project (components/pages/styles), not one big file.', 'Styling approach: tailwind.'], imageCount: 1 });
  assert.match(reactPrompt, /Output framework: react/);
  assert.doesNotMatch(reactPrompt, /Stack: Plain HTML, CSS and JavaScript in separate files/);
});

test('analysis prompt asks for palette, text, responsive plan and element count; PDF variant reads every page', () => {
  const a = P.analysisPrompt(1, false), b = P.analysisPrompt(1, true);
  for (const w of ['PALETTE', 'ALL visible text', 'RESPONSIVE PLAN', 'ELEMENT COUNT', 'UNCERTAIN']) assert.match(a, new RegExp(w));
  assert.match(b, /Read EVERY page/);
});

test('refine with ANALYSIS ONLY returns a plan (no 502 for "no files"), files stay empty', async () => {
  await boot();
  script = [text('1. Header | logo 20px too small\n2. Hero | matches\n3. Footer | needs 4 columns\n=== NOTES ===\n70% match')];
  const r = await post('/api/refine', { files: FILES, request: 'ANALYSIS ONLY. list differences', imageBase64: IMG.base64, mime: IMG.mime });
  assert.equal(r.status, 200);
  assert.deepEqual(r.body.files, []);
  assert.equal(r.body.items.length, 2);
  assert.match(r.body.notes, /^1\. Header \| logo 20px too small\n2\. Footer \| needs 4 columns/);
  assert.match(promptOf(0), /ANALYSIS ONLY: do NOT change/);
  assert.equal(seen[0].messages[0].content.some((p) => p.type === 'image_url'), true, 'the reference image is sent');
  stop();
});

test('/api/plan: needs the reference image; accepts a list of slices', async () => {
  await boot();
  assert.equal((await post('/api/plan', { files: FILES })).status, 400);
  assert.equal((await post('/api/plan', { files: [] , imageBase64: IMG.base64, mime: IMG.mime })).status, 400);
  script = [text('1. Nav | menu items are 2px too close')];
  const r = await post('/api/plan', { files: FILES, images: [IMG, IMG] });
  assert.equal(r.status, 200);
  assert.equal(r.body.items[0].section, 'Nav');
  assert.match(promptOf(0), /2 attached images are consecutive vertical slices/);
  stop();
});

test('a plan answer in the wrong format still returns 200 with the raw text for the app to show', async () => {
  await boot();
  script = [text('The page looks quite similar overall.')];
  const r = await post('/api/plan', { files: FILES, imageBase64: IMG.base64, mime: IMG.mime });
  assert.equal(r.status, 200);
  assert.equal(r.body.items.length, 0);
  assert.match(r.body.notes, /looks quite similar/);
  stop();
});

test('normal refine is unchanged: it still needs files back', async () => {
  await boot();
  script = [text('=== FILE: index.html ===\n<h1>New</h1>\n=== NOTES ===\ndone')];
  const r = await post('/api/refine', { files: FILES, request: 'make the title say New' });
  assert.equal(r.status, 200);
  assert.equal(r.body.files[0].path, 'index.html');
  stop();
});

test('deep generate = analysis + generate + self-check; the self-check fixes are merged', async () => {
  await boot();
  const html = '<!doctype html><title>x</title><h1>Old</h1>' + 'a'.repeat(200);
  script = [
    text('SPEC: header, hero, footer'),
    text(`=== FILE: index.html ===\n${html}\n=== FILE: styles.css ===\nbody{margin:0}${' '.repeat(100)}\n=== NOTES ===\nbuilt`),
    text(`=== FILE: index.html ===\n${html.replace('Old', 'Fixed')}\n=== NOTES ===\nFixed the missing heading text`),
  ];
  const r = await post('/api/generate', { images: [IMG], target: 'html', deep: true });
  assert.equal(r.status, 200);
  assert.equal(seen.length, 3);
  assert.match(promptOf(2), /QA engineer/);
  assert.match(promptOf(2), /SPEC: header, hero, footer/);
  assert.equal(r.body.analyzed, true);
  assert.equal(r.body.verified, true);
  assert.deepEqual(r.body.fixed, ['index.html']);
  assert.match(r.body.files.find((f) => f.path === 'index.html').content, /Fixed/);
  assert.equal(r.body.files.length, 2, 'files the self-check did not return are kept');
  assert.match(r.body.notes, /Self-check fixed/);
  stop();
});

test('self-check can only help: a failed, empty or cut-off answer keeps the original files', async () => {
  await boot();
  const html = '<!doctype html><title>x</title><h1>Keep</h1>' + 'a'.repeat(400);
  const gen = text(`=== FILE: index.html ===\n${html}\n=== NOTES ===\nbuilt`);
  // 1) provider error in the self-check
  script = [text('SPEC'), gen, { status: 400 }];
  let r = await post('/api/generate', { images: [IMG], deep: true });
  assert.equal(r.status, 200); assert.match(r.body.files[0].content, /Keep/); assert.deepEqual(r.body.fixed, []);
  // 2) a much shorter (cut-off) file is ignored
  script = [text('SPEC'), gen, text('=== FILE: index.html ===\n<h1>cut</h1>\n=== NOTES ===\nfixed')];
  r = await post('/api/generate', { images: [IMG], deep: true });
  assert.match(r.body.files[0].content, /Keep/); assert.deepEqual(r.body.fixed, []);
  // 3) "No fixes needed"
  script = [text('SPEC'), gen, text('=== NOTES ===\nNo fixes needed')];
  r = await post('/api/generate', { images: [IMG], deep: true });
  assert.equal(r.status, 200); assert.deepEqual(r.body.fixed, []); assert.equal(r.body.verified, true);
  stop();
});

test('without deep there is exactly one AI call and no self-check; DESIGN_VERIFY=off disables it for deep', async () => {
  await boot();
  script = [text('=== FILE: index.html ===\n<h1>x</h1>' + 'a'.repeat(100) + '\n=== NOTES ===\nbuilt')];
  let r = await post('/api/generate', { images: [IMG], deep: false });
  assert.equal(seen.length, 1); assert.equal(r.body.verified, false);
  stop();
  await boot({ DESIGN_VERIFY: 'off' });
  script = [text('SPEC'), text('=== FILE: index.html ===\n<h1>x</h1>' + 'a'.repeat(100) + '\n=== NOTES ===\nbuilt')];
  r = await post('/api/generate', { images: [IMG], deep: true });
  assert.equal(seen.length, 2); assert.equal(r.body.verified, false);
  stop();
});


test('design iterate returns a reviewable proposal and never applies it to storage', async () => {
  await boot();
  script = [
    text('1. Header | logo is too small\n=== NOTES ===\nOne mismatch.'),
    text('=== FILE: index.html ===\n<h1>Updated heading</h1>\n=== NOTES ===\nAdjusted header.'),
    text('=== NOTES ===\nNo fixes needed'),
    text('1. Header | matches\n=== NOTES ===\nRemaining differences are minor.')
  ];
  const r = await post('/api/design/iterate', { images: [IMG], files: FILES, request: 'Match the screenshot', maxIterations: 1 });
  assert.equal(r.status, 200);
  assert.equal(r.body.applied, false);
  assert.equal(r.body.requiresApproval, true);
  assert.equal(r.body.files[0].path, 'index.html');
  assert.equal(r.body.files[0].status, 'modified');
  assert.equal(r.body.remaining.length, 0, 'the parser ignores a matches line');
  assert.equal(seen.length, 4, 'plan, refine, verify and final analysis were called');
  stop();
});
