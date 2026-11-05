import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExport, htmlToJsx, rewriteCssUrls, splitElements } from '../src/lib/projectExport';

const ctx = { from: 'index.html', ts: false, notes: new Set<string>() };

test('htmlToJsx converts attributes, void tags, styles and braces', () => {
  const jsx = htmlToJsx('<div class="a" style="color:red;background:url(img/a.png)"><img src="img/a.png" alt="x"><br><input value="5" disabled><label for="n">{x}</label><svg viewBox="0 0 1 1"><path stroke-width="2" d="M0 0"/></svg></div>', ctx);
  assert.match(jsx, /className="a"/);
  assert.match(jsx, /style=\{\{ color: "red", background: "url\(\/img\/a\.png\)" \}\}/);
  assert.match(jsx, /<img src="\/img\/a\.png" alt="x" \/>/);
  assert.match(jsx, /<br \/>/);
  assert.match(jsx, /<input defaultValue="5" disabled \/>/);
  assert.match(jsx, /htmlFor="n"/);
  assert.match(jsx, /&#123;x&#125;/);
  assert.match(jsx, /strokeWidth="2"/);
  assert.match(jsx, /viewBox="0 0 1 1"/);
});

test('inline handlers: simple calls are converted, complex ones are dropped with a note', () => {
  const notes = new Set<string>();
  const jsx = htmlToJsx('<button onclick="toggleMenu(this)">a</button><button onclick="document.body.classList.toggle(\'x\')">b</button><form onsubmit="return check()"></form>', { from: 'index.html', ts: true, notes });
  assert.match(jsx, /onClick=\{\(event\) => \(window as any\)\.toggleMenu\(event\.currentTarget\)\}/);
  assert.match(jsx, /onSubmit=\{\(event\) => \{ if \(\(window as any\)\.check\(\) === false\) event\.preventDefault\(\); \}\}/);
  assert.equal(notes.size, 1);
});

test('rewriteCssUrls points relative urls at the public folder', () => {
  assert.equal(rewriteCssUrls('a{background:url("../images/a.png")}b{background:url(https://x/y.png)}', 'css/style.css'), 'a{background:url("/images/a.png")}b{background:url(https://x/y.png)}');
});

test('splitElements finds top-level sections and refuses broken nesting', () => {
  const nodes = splitElements('<header><nav></nav></header>\n<section id="about"><div></div></section><img src="x.png"><footer></footer>');
  assert.deepEqual(nodes?.map((n) => n.name), ['header', 'section', 'img', 'footer']);
  assert.equal(splitElements('<div><section></div>'), null);
});

const files = [
  { path: 'index.html', content: '<!doctype html><html lang="en"><head><title>Demo Site</title><meta name="description" content="d"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"><link rel="stylesheet" href="css/style.css"></head><body class="home"><div class="wrap"><header id="top"><nav><a href="about.html">About</a></nav></header><section id="hero"><h1>Hello</h1><img src="images/hero.png" alt="Hero"><button id="b" onclick="hi()">Go</button></section><footer>&copy; 2026</footer></div><script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script><script src="js/app.js"></script><script>window.x=1</script></body></html>' },
  { path: 'about.html', content: '<html><head><title>About</title></head><body><main><h1>About us</h1></main></body></html>' },
  { path: 'css/style.css', content: '.hero{background:url(../images/hero.png)}' },
  { path: 'js/app.js', content: "document.addEventListener('DOMContentLoaded',()=>{});function hi(){}" },
];
const assets = [{ path: 'images/hero.png', mime: 'image/png', base64: 'AAAA' }];

test('React JS export builds a complete Vite project', () => {
  const r = buildExport({ name: 'Demo Site', target: 'bootstrap', files, assets, kind: 'react' });
  const by = (p: string) => r.files.find((f) => f.path === p)?.content ?? '';
  for (const p of ['package.json', 'index.html', 'vite.config.js', 'README.md', 'src/main.jsx', 'src/App.jsx', 'src/legacyScripts.js', 'src/components/Header.jsx', 'src/components/Hero.jsx', 'src/components/Footer.jsx', 'src/styles/style.css', 'src/pages/AboutPage.jsx', 'public/js/app.js', 'public/js/inline-1.js']) assert.ok(by(p), 'missing ' + p);
  assert.match(by('index.html'), /bootstrap@5\.3\.3\/dist\/css\/bootstrap\.min\.css/);
  assert.match(by('index.html'), /<title>Demo Site<\/title>/);
  assert.match(by('src/styles/style.css'), /url\(\/images\/hero\.png\)/);
  assert.match(by('src/App.jsx'), /<div className="wrap">/);
  assert.match(by('src/App.jsx'), /'\/about\.html': AboutPage/);
  assert.match(by('src/main.jsx'), /document\.body\.className = "home"/);
  assert.match(by('src/legacyScripts.js'), /bootstrap\.bundle\.min\.js/);
  assert.match(by('src/legacyScripts.js'), /"\/js\/app\.js"/);
  assert.match(by('src/components/Hero.jsx'), /src="\/images\/hero\.png"/);
  assert.match(by('src/components/Hero.jsx'), /onClick=\{\(event\) => window\.hi\(\)\}/);
  assert.equal(r.assets[0].path, 'public/images/hero.png');
  assert.equal(JSON.parse(by('package.json')).dependencies.react.startsWith('^18'), true);
});

test('TypeScript export adds tsconfig and typed files', () => {
  const r = buildExport({ name: 'Demo', target: 'html', files, assets, kind: 'react-ts' });
  const paths = r.files.map((f) => f.path);
  assert.ok(paths.includes('tsconfig.json') && paths.includes('src/main.tsx') && paths.includes('src/vite-env.d.ts') && paths.includes('vite.config.ts'));
  assert.ok(!paths.some((p) => p.endsWith('.jsx')));
  assert.match(r.files.find((f) => f.path === 'src/components/Hero.tsx')!.content, /\(window as any\)\.hi\(\)/);
});

test('assets-only export keeps original image paths', () => {
  const r = buildExport({ name: 'Demo', target: 'html', files, assets, kind: 'assets' });
  assert.equal(r.assets[0].path, 'images/hero.png');
});

test('export refuses a project without HTML', () => {
  assert.throws(() => buildExport({ name: 'x', target: 'html', files: [{ path: 'a.css', content: '' }], assets: [], kind: 'react' }), /no HTML/);
});

test('plain-JavaScript export contains no TypeScript-only syntax', () => {
  const r = buildExport({ name: 'Demo', target: 'html', files, assets, kind: 'react' });
  for (const f of r.files.filter((q) => /^src\/.*\.jsx?$/.test(q.path))) {
    assert.doesNotMatch(f.content, /\bas (?:any|typeof|HTMLElement|HTMLAnchorElement)\b|: (?:string|any|MouseEvent)\b|\bdeclare const\b/, f.path);
  }
});