import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { analyzeKitZip, breakpointsIn, cssFacts, htmlFacts, jsFacts, kitInstructions, kitSummary, responsiveScore, testWidthsFor } from '../src/lib/layoutKit';
import { buildMotionCss, buildMotionJs, defaultMotion, lighten, luminance, paletteFromFiles, paletteFromPixels } from '../src/lib/autoMotion';
import { PLAN_REQUEST, buildApplyRequest, parsePlan } from '../src/lib/changePlan';
import { planTiles } from '../src/lib/tilePlan';
import { tabDocument } from '../src/lib/tabDoc';
import { applyManaged, bundleForPreview } from '../src/lib/managed';
import { Project } from '../src/types';

// ---------------- layoutKit ----------------
test('breakpointsIn reads min/max/range media queries and converts em/rem', () => {
  const css = '@media (max-width: 768px){a{}} @media (min-width:48em) and (max-width:991.98px){b{}} @media (width >= 1200px){c{}} /* @media (max-width:111px) */';
  assert.deepEqual(breakpointsIn(css), [768, 992, 1200]);
});

test('cssFacts: flex, grid, fluid, big fixed widths, mobile menu', () => {
  const f = cssFacts('.a{display:flex}.b{display:grid}.c{font-size:clamp(1rem,2vw,2rem)}.d{width:1200px}.e{max-width:1200px}.hamburger{display:none}img{max-width:100%}');
  assert.ok(f.flex && f.grid && f.fluid && f.hasMobileMenuCss && f.fluidImages);
  assert.deepEqual(f.bigFixedWidths, [1200]); // max-width:1200px is NOT counted
});

test('htmlFacts: viewport, frameworks, bootstrap classes, links, inline code', () => {
  const h = htmlFacts('<head><meta name="viewport" content="width=device-width"><link rel="stylesheet" href="https://cdn/bootstrap.min.css"><link rel="stylesheet" href="css/a.css"><style>.x{}</style></head><header><nav class="navbar navbar-expand-lg"><button class="navbar-toggler"></button></nav></header><footer></footer><script src="js/a.js"></script><script>var a=1</script>');
  assert.ok(h.viewportMeta && h.hasHeader && h.hasNav && h.hasFooter && h.toggler && h.frameworkResponsive);
  assert.ok(h.frameworks.includes('Bootstrap'));
  assert.deepEqual(h.cssLinks, ['https://cdn/bootstrap.min.css', 'css/a.css']);
  assert.deepEqual(h.scriptSrcs, ['js/a.js']);
  assert.equal(h.inlineJs.trim(), 'var a=1');
});

test('jsFacts finds menu toggles, matchMedia and resize', () => {
  assert.ok(jsFacts("btn.addEventListener('click',()=>nav.classList.toggle('open'))").menuToggle);
  assert.ok(jsFacts("window.matchMedia('(max-width:700px)')").matchMedia);
  assert.ok(jsFacts('if(window.innerWidth<700){}').resize);
  assert.ok(!jsFacts('var a=1').menuToggle);
});

test('responsiveScore: full kit scores 100, desktop-only kit scores low', () => {
  assert.equal(responsiveScore({ viewportMeta: true, breakpoints: [576, 768, 992], frameworkResponsive: false, flexOrGrid: true, fluid: true, hasNav: true, mobileMenu: true, fluidImages: true, bigFixedWidths: [] }), 100);
  assert.ok(responsiveScore({ viewportMeta: false, breakpoints: [], frameworkResponsive: false, flexOrGrid: false, fluid: false, hasNav: true, mobileMenu: false, fluidImages: false, bigFixedWidths: [1200] }) <= 10);
});

test('testWidthsFor adds just-below and at each breakpoint', () => {
  const w = testWidthsFor([768, 992]);
  for (const n of [320, 390, 767, 768, 991, 992, 1024, 1440]) assert.ok(w.includes(n), 'missing ' + n);
});

async function zipOf(files: Record<string, string>, wrap = ''): Promise<Uint8Array> {
  const z = new JSZip();
  for (const [p, c] of Object.entries(files)) z.file(wrap + p, c);
  return z.generateAsync({ type: 'uint8array' });
}
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64').toString('binary');

test('analyzeKitZip: responsive header/footer kit in a wrapper folder, with images', async () => {
  const z = new JSZip();
  const w = 'kit/';
  z.file(w + 'index.html', '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><link rel="stylesheet" href="css/style.css"><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css"></head><body><header class="site"><a href="#"><img src="img/logo.png"></a><nav><button class="menu-toggle">=</button></nav></header><footer>f</footer><script src="js/menu.js"></script></body></html>');
  z.file(w + 'css/style.css', '.site{display:flex;background:url(../img/logo.png)}@media (max-width:768px){.site{display:block}}@media (max-width:480px){.site{padding:0}}img{max-width:100%}.menu-toggle{display:none}');
  z.file(w + 'js/menu.js', "document.querySelector('.menu-toggle').addEventListener('click',function(){document.body.classList.toggle('open')})");
  z.file(w + 'img/logo.png', Buffer.from(PNG, 'binary'));
  z.file(w + '__MACOSX/x', 'junk');
  const r = await analyzeKitZip(await z.generateAsync({ type: 'uint8array' }), 'kit.zip');
  const a = r.analysis;
  assert.equal(a.kind, 'header+footer');
  assert.deepEqual(a.breakpoints, [480, 768]);
  assert.ok(a.viewportMeta && a.frameworks.includes('Bootstrap'));
  assert.equal(a.counts.html, 1); assert.equal(a.counts.css, 1); assert.equal(a.counts.js, 1); assert.equal(a.counts.image, 1);
  assert.ok(a.responsiveScore >= 90, 'score ' + a.responsiveScore);
  assert.ok(a.responsiveFiles.includes('css/style.css') && a.responsiveFiles.includes('js/menu.js') && a.responsiveFiles.includes('index.html'));
  assert.deepEqual(a.findings, []);
  // code is combined, local script/link tags are removed from the html, the CDN link is kept, image refs point at the kept asset
  assert.ok(!/<script/i.test(r.html) && !/css\/style\.css/.test(r.html));
  assert.ok(r.html.includes('bootstrap.min.css') && r.html.includes('img/logo.png'));
  assert.ok(r.css.includes('url(img/logo.png)') || r.css.includes('url("img/logo.png")') || r.css.includes("url('img/logo.png')"), r.css);
  assert.ok(r.js.includes('menu-toggle'));
  assert.equal(r.assets.length, 1);
  assert.equal(r.assets[0].path, 'img/logo.png');
  assert.ok(kitSummary(a).includes('score'));
  assert.equal(kitInstructions([{ name: 'Top', analysis: a }]).length, 3);
  assert.equal(kitInstructions([{ name: 'x' }]).length, 0);
});

test('analyzeKitZip: a desktop-only kit gets low score and clear problems', async () => {
  const bytes = await zipOf({ 'index.html': '<html><body><div id="top"><nav><a>Home</a></nav></div></body></html>', 'a.css': '#top{width:1200px;float:left}' });
  const r = await analyzeKitZip(bytes, 'old.zip');
  assert.ok(r.analysis.responsiveScore < 40, 'score ' + r.analysis.responsiveScore);
  const text = r.analysis.findings.join('\n');
  assert.ok(/viewport/.test(text) && /media queries/.test(text) && /1200px/.test(text) && /mobile menu/.test(text));
  assert.ok(/not linked/.test(text), 'unlinked css is reported');
});

test('analyzeKitZip: errors for non-zip and zip without html; reports missing linked files', async () => {
  await assert.rejects(() => analyzeKitZip(new Uint8Array([1, 2, 3]), 'x.zip'), /not a valid ZIP/);
  await assert.rejects(async () => analyzeKitZip(await zipOf({ 'a.css': 'a{}' }), 'x.zip'), /No \.html file/);
  const r = await analyzeKitZip(await zipOf({ 'index.html': '<link rel="stylesheet" href="missing.css"><footer>f</footer>' }), 'x.zip');
  assert.ok(r.analysis.findings.some((f) => /missing\.css/.test(f)));
});

test('analyzeKitZip: header.html + footer.html are combined in order, ../ traversal entries are skipped', async () => {
  const z = new JSZip();
  z.file('footer.html', '<footer>F</footer>'); z.file('header.html', '<header>H</header>'); z.file('main.html', '<main>M</main>');
  z.file('../evil.html', 'x');
  const r = await analyzeKitZip(await z.generateAsync({ type: 'uint8array' }), 'p.zip');
  const order = [r.html.indexOf('<header>'), r.html.indexOf('<main>'), r.html.indexOf('<footer>')];
  assert.ok(order.every((n) => n >= 0) && order[0] < order[1] && order[1] < order[2], r.html);
});

// ---------------- autoMotion ----------------
test('lighten always returns a light colour', () => {
  for (const c of ['#e22728', '#000000', '#0a3d62', '#ff0000']) assert.ok(luminance(lighten(c, 0.92)) > 0.9, c);
  assert.equal(lighten('nonsense', 0.5), '#f4f7fb');
});

test('paletteFromPixels ignores white/black/grey and returns distinct brand colours', () => {
  const px: number[] = [];
  const add = (r: number, g: number, b: number, n: number) => { for (let i = 0; i < n; i++) px.push(r, g, b, 255); };
  add(255, 255, 255, 500); add(0, 0, 0, 300); add(128, 128, 128, 200); add(226, 39, 40, 120); add(228, 41, 42, 60); add(20, 90, 200, 80);
  const p = paletteFromPixels(px);
  assert.equal(p.length, 2);
  assert.ok(p[0].startsWith('#e') || p[0].startsWith('#e2'), p[0]);
});

test('paletteFromFiles counts saturated hex colours in the CSS', () => {
  const p = paletteFromFiles([{ path: 'styles.css', content: 'a{color:#e22728}b{background:#e22728}c{color:#fff}d{color:#111}e{color:#2563eb}' }]);
  assert.deepEqual(p, ['#e22728', '#2563eb']);
});

test('buildMotionCss: hover uses a light tint, excludes nav, supports no-button-click and reduced motion', () => {
  const css = buildMotionCss({ ...defaultMotion(['#e22728']), noButtonClick: true });
  assert.ok(css.includes('--p2c-tint:' + lighten('#e22728', 0.92)));
  assert.ok(css.includes(':not(nav *)') && css.includes('prefers-reduced-motion'));
  // the :active rule must hit EVERY button selector, not just the last one of the list
  const rule = css.split('\n').find((l) => l.includes(':active') && l.includes('transform:none'))!;
  for (const sel of ['button:active', '.btn:active', 'a.btn:active', '[class*="btn"]:active', '[class*="button"]:active', 'input[type="submit"]:active']) assert.ok(rule.includes(sel), sel);
  assert.equal((css.match(/{/g) || []).length, (css.match(/}/g) || []).length, 'balanced braces');
  assert.ok(!buildMotionCss({ ...defaultMotion(), noButtonClick: false }).includes(':active'));
  assert.equal(buildMotionCss({ ...defaultMotion(), enabled: false }), '');
  assert.ok(!buildMotionCss({ ...defaultMotion(['#e22728']), tint: false }).includes('background-color:var(--p2c-tint)'));
  assert.doesNotThrow(() => new Function(buildMotionJs(defaultMotion())));
  assert.equal(buildMotionJs({ ...defaultMotion(), reveal: false }), '');
});

const baseProject = (over: Partial<Project> = {}): Project => ({
  id: 'p', name: 'p', createdAt: 0, updatedAt: 0, target: 'html', favorite: false, files: [{ path: 'index.html', content: '<html><head></head><body><div class="card">x</div></body></html>' }],
  instructions: [], fonts: {}, animations: [], sectionStyles: {}, versions: [], ...over,
});

test('applyManaged writes motion css + script once, is idempotent, and switches off cleanly', () => {
  const on = baseProject({ motion: defaultMotion(['#e22728']) });
  const once = applyManaged(on)[0].content;
  assert.ok(once.includes('p2c-motion') && once.includes('p2c-m-pre') && once.includes('IntersectionObserver'));
  const twice = applyManaged({ ...on, files: [{ path: 'index.html', content: once }] })[0].content;
  assert.equal(twice, once, 'idempotent');
  const off = applyManaged({ ...on, motion: { ...on.motion!, enabled: false }, files: [{ path: 'index.html', content: once }] })[0].content;
  assert.ok(!off.includes('p2c-motion') && !off.includes('p2c:body:start') && !off.includes('p2c:head:start'));
  assert.equal(applyManaged(baseProject())[0].content, baseProject().files[0].content, 'projects without motion are unchanged');
});

test('motion reveal does not hide content in the exported html (cards get the hidden class only from the script)', () => {
  const html = applyManaged(baseProject({ motion: defaultMotion(['#2563eb']) }))[0].content;
  assert.ok(!/class="[^"]*p2c-m-pre/.test(html));
});

// ---------------- changePlan ----------------
test('parsePlan reads numbered "Section | change" lines and drops "matches"', () => {
  const items = parsePlan('Here is the list:\n1. Header | logo should be 160px wide, menu text 15px\n2. Hero | matches\n3) **Footer** | background #f4f7fb, 4 columns\n- 4. Cards | radius 16px | shadow softer\nrandom text');
  assert.equal(items.length, 3);
  assert.equal(items[0].section, 'Header');
  assert.equal(items[1].section, 'Footer');
  assert.equal(items[2].text, 'radius 16px | shadow softer');
  assert.ok(items.every((i) => i.selected));
  assert.deepEqual(parsePlan(''), []);
});

test('buildApplyRequest only includes selected items and the owner words', () => {
  const items = parsePlan('1. Header | a\n2. Hero | b');
  items[1].selected = false;
  const r = buildApplyRequest(items, 'make the banner taller');
  assert.ok(r.includes('[Header] a') && !r.includes('[Hero]') && r.includes('make the banner taller') && r.includes('responsive'));
  assert.ok(PLAN_REQUEST.includes('Do NOT change'));
});

// ---------------- tile planner ----------------
test('planTiles: HD matches the old behaviour, 4K doubles the pixels, tall pages never exceed the slice cap', () => {
  const small = planTiles(1440, 1200);
  assert.equal(small.width, 1920); assert.equal(small.crops.length, 1);
  const tall = planTiles(1440, 8000, 'hd');
  assert.ok(tall.crops.length > 1 && tall.crops.length <= 12);
  // slices cover the whole page: next slice starts before the previous one ends (overlap), the last one reaches the bottom
  for (let i = 1; i < tall.crops.length; i++) assert.ok(tall.crops[i].y < tall.crops[i - 1].y + tall.crops[i - 1].height);
  const last = tall.crops[tall.crops.length - 1];
  assert.equal(last.y + last.height, tall.scaledHeight);
  const k = planTiles(1440, 8000, '4k');
  assert.equal(k.width, 3840); assert.ok(k.crops.length <= 8);
  const huge = planTiles(1000, 60000, 'hd');
  assert.ok(huge.crops.length <= 12 && huge.crops[huge.crops.length - 1].y + huge.crops[huge.crops.length - 1].height === huge.scaledHeight);
});

// ---------------- open in tab ----------------
test('tabDocument isolates the page in a sandboxed iframe without same-origin and escapes it', () => {
  const doc = tabDocument('<p title="a&b">hi</p><script>alert("x")</script>', 'My <b>page</b>');
  assert.ok(doc.includes('sandbox="allow-scripts allow-forms"') && !doc.includes('allow-same-origin'));
  // one level of escaping: the browser turns &amp; and &quot; back into & and " when it reads the attribute
  assert.ok(doc.includes('srcdoc="<p title=&quot;a&amp;b&quot;>hi</p><script>alert(&quot;x&quot;)</script>"'));
  assert.ok(doc.includes('<title>My &lt;b&gt;page&lt;/b&gt;</title>'));
});

test('bundleForPreview of a kit component keeps its inline images working', () => {
  const html = bundleForPreview([{ path: 'index.html', content: '<img src="img/logo.png">' }], [{ path: 'img/logo.png', mime: 'image/png', base64: 'AAAA' }]);
  assert.ok(html.includes('data:image/png;base64,AAAA'));
});
