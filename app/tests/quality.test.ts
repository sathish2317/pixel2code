import test from 'node:test';
import assert from 'node:assert/strict';
import { auditProject, extractDesignTokens, fixAllSafe, makeSeoTags, summarizeIssues, tokensToCss } from '../src/lib/quality';

test('extracts repeated design tokens from CSS', () => {
  const tokens = extractDesignTokens([{ path: 'styles.css', content: '.a{color:#fff;background:#fff;padding:16px;border-radius:8px;font-family:Inter,sans-serif}.b{color:#000;padding:16px}' }]);
  assert.ok(tokens.some((x) => x.kind === 'color' && x.value === '#fff' && x.count === 2));
  assert.ok(tokens.some((x) => x.kind === 'spacing' && x.value === '16px'));
  assert.ok(tokens.some((x) => x.kind === 'radius' && x.value === '8px'));
  assert.match(tokensToCss(tokens), /:root/);
});

test('audit identifies common HTML accessibility and SEO issues', () => {
  const issues = auditProject([{ path: 'index.html', content: '<html><head></head><body><img src="x.png"><button>Go</button></body></html>' }]);
  assert.ok(issues.some((x) => x.title === 'Missing page title'));
  assert.ok(issues.some((x) => x.title === 'Images missing alt attributes'));
  assert.ok(issues.some((x) => x.title === 'Missing viewport tag'));
});

test('SEO tag generation escapes user input', () => {
  const tags = makeSeoTags('A "great" <site>', 'Fish & chips');
  assert.match(tags, /&quot;great&quot;/);
  assert.match(tags, /&lt;site&gt;/);
  assert.match(tags, /Fish &amp; chips/);
});

const page = (body: string, head = '') => ({ path: 'index.html', content: `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>T</title>${head}</head><body><main><h1>Hi</h1>${body}</main></body></html>` });

test('detects missing images, broken anchors, missing pages and duplicate ids', () => {
  const issues = auditProject([page('<img src="images/logo.png" alt="Logo"><a href="#contact">c</a><a href="about.html">a</a><div id="x"></div><div id="x"></div>')]);
  const titles = issues.map((i) => i.title);
  assert.ok(titles.includes('Missing image'));
  assert.ok(titles.includes('Broken in-page links'));
  assert.ok(titles.includes('Links to missing pages'));
  assert.ok(titles.includes('Duplicate id'));
});

test('an uploaded asset satisfies the missing-image check', () => {
  const issues = auditProject([page('<img src="images/logo.png" alt="Logo" width="1" height="1">')], ['images/logo.png']);
  assert.ok(!issues.some((i) => i.title === 'Missing image'));
});

test('detects unclosed tags and missing linked css/js', () => {
  const issues = auditProject([page('<section><div>text</section>', '<link rel="stylesheet" href="css/style.css"><script src="js/app.js"></script>')]);
  assert.ok(issues.some((i) => i.title === 'Unclosed tag'));
  assert.ok(issues.some((i) => i.title === 'Linked file missing'));
  assert.ok(issues.some((i) => i.title === 'Script file missing'));
});

test('flags duplicate css rules, unused classes, wide fixed widths and JS looking for missing elements', () => {
  const css = '.a{color:red}.a{color:red}.ghost{margin:0}.box{width:1200px}';
  const js = "document.getElementById('menu').addEventListener('click',()=>{});";
  const issues = auditProject([page('<div class="a box"></div>'), { path: 'style.css', content: css }, { path: 'app.js', content: js }]);
  const titles = issues.map((i) => i.title);
  assert.ok(titles.includes('Duplicate CSS rules'));
  assert.ok(titles.includes('Unused CSS classes'));
  assert.ok(titles.includes('Fixed wide width outside a media query'));
  assert.ok(titles.includes('Script looks for elements that do not exist'));
});

test('same rule inside different media queries is not called a duplicate', () => {
  const css = '@media (max-width:600px){.a{color:red}}@media (min-width:900px){.a{color:red}}.a{color:blue}';
  const issues = auditProject([page('<div class="a"></div>'), { path: 'style.css', content: css }]);
  assert.ok(!issues.some((i) => i.title === 'Duplicate CSS rules'));
});

test('issues are sorted errors first and summarized', () => {
  const issues = auditProject([{ path: 'index.html', content: '<html><body><img src="a.png"></body></html>' }]);
  assert.equal(issues[0].severity, 'error');
  const s = summarizeIssues(issues);
  assert.ok(s.errors >= 1 && s.fixable >= 1);
});

test('fixAllSafe repairs lang, viewport, charset, alt, lazy, noopener, button type and reduced motion', () => {
  const html = '<!doctype html><html><head></head><body><h1>My Site</h1><img src="img/hero-banner.png"><img src="img/b.png"><a href="https://x.com" target="_blank">x</a><button>Go</button><form><button>Send</button></form></body></html>';
  const r = fixAllSafe([{ path: 'index.html', content: html }, { path: 's.css', content: '.a{transition:all .3s}' }]);
  const out = r.files[0].content;
  assert.match(out, /<html lang="en">/);
  assert.match(out, /<meta charset="utf-8">/);
  assert.match(out, /name="viewport"/);
  assert.match(out, /<title>My Site<\/title>/);
  assert.match(out, /<img src="img\/hero-banner.png" alt="hero banner">/);
  assert.match(out, /<img src="img\/b.png" alt="b" loading="lazy">/);
  assert.match(out, /rel="noopener noreferrer"/);
  assert.match(out, /<button type="button">Go<\/button>/);
  assert.match(out, /<form><button>Send<\/button><\/form>/); // submit buttons inside forms are left alone
  assert.match(r.files[1].content, /prefers-reduced-motion/);
  assert.ok(r.applied.length >= 8);
});

test('fixAllSafe leaves scripts, comments and styles untouched and is idempotent', () => {
  const html = '<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="x"><title>t</title></head><body><!-- <img src="a.png"> --><script>var s = \'<img src="b.png">\';</script></body></html>';
  const a = fixAllSafe([{ path: 'index.html', content: html }]);
  assert.equal(a.files[0].content, html);
  assert.deepEqual(a.applied, []);
  const dirty = '<html><head></head><body><img src="a.png"></body></html>';
  const once = fixAllSafe([{ path: 'index.html', content: dirty }]);
  const twice = fixAllSafe(once.files);
  assert.equal(twice.files[0].content, once.files[0].content);
});

test('fixAllSafe keeps existing rel values and appends noopener', () => {
  const r = fixAllSafe([{ path: 'index.html', content: '<html lang="en"><body><a href="https://x.com" target="_blank" rel="nofollow">x</a></body></html>' }], ['noopener']);
  assert.match(r.files[0].content, /rel="nofollow noopener noreferrer"/);
});