import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  analyzeRefs, assetsFromZip, dirOf, fixRefs, inlineAssets, mapRefs, normalizeRef, rebaseCss, relativePath,
  remapRef, resolveFrom, sanitizeAssetPath, unusedAssets,
} from '../src/lib/assets';
import { bundleForPreview } from '../src/lib/managed';
import type { ProjectAsset, ProjectFile } from '../src/types';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const asset = (path: string): ProjectAsset => ({ path, mime: 'image/png', base64: PNG });

async function makeZip(names: string[]): Promise<Uint8Array> {
  const z = new JSZip();
  for (const n of names) z.file(n, n.endsWith('.txt') ? 'hello' : PNG, { base64: !n.endsWith('.txt') });
  return z.generateAsync({ type: 'uint8array' });
}

test('paths: relative and resolve', () => {
  assert.equal(relativePath('', 'images/a.png'), 'images/a.png');
  assert.equal(relativePath('css', 'images/a.png'), '../images/a.png');
  assert.equal(relativePath('pages/en', 'pages/img/a.png'), '../img/a.png');
  assert.equal(resolveFrom('css', '../images/a.png'), 'images/a.png');
  assert.equal(resolveFrom('', './images/a.png'), 'images/a.png');
  assert.equal(dirOf('css/site.css'), 'css');
  assert.equal(normalizeRef('./images/My%20Logo.png?v=2#x'), 'images/My Logo.png');
});

test('sanitizeAssetPath blocks traversal and hidden files, cleans names, adds the images/ prefix once', () => {
  assert.equal(sanitizeAssetPath('../x.png', 'images/'), null);
  assert.equal(sanitizeAssetPath('a/../x.png', 'images/'), null);
  assert.equal(sanitizeAssetPath('.hidden.png', 'images/'), null);
  assert.equal(sanitizeAssetPath('__MACOSX/a.png', 'images/'), null);
  assert.equal(sanitizeAssetPath('My Photo (1).PNG', 'images/'), 'images/My-Photo-1.PNG');
  assert.equal(sanitizeAssetPath('images/logo.png', 'images/'), 'images/logo.png');
  assert.equal(sanitizeAssetPath('banner/slide 1.jpg', 'images/'), 'images/banner/slide-1.jpg');
});

test('assetsFromZip: strips the top folder, skips junk, puts everything under images/, de-duplicates names', async () => {
  const zip = await makeZip([
    'photos/Logo.png', 'photos/Hero Banner.png', 'photos/team/anna.png', 'photos/readme.txt',
    '__MACOSX/photos/._Logo.png', 'photos/.DS_Store', 'photos/a b.png', 'photos/a-b.png',
  ]);
  const r = await assetsFromZip(zip, { prefix: 'images/', sanitize: true, maxTotalBytes: 10_000_000 });
  assert.deepEqual(r.assets.map((a) => a.path), [
    'images/Hero-Banner.png', 'images/Logo.png', 'images/a-b-2.png', 'images/a-b.png', 'images/team/anna.png',
  ]);
  assert.equal(r.ignored, 1); // readme.txt
  assert.ok(r.assets.every((a) => a.mime === 'image/png' && a.base64 === PNG));
});

test('assetsFromZip respects the total size limit', async () => {
  const zip = await makeZip(['a.png', 'b.png', 'c.png']);
  const r = await assetsFromZip(zip, { prefix: 'images/', sanitize: true, maxTotalBytes: 100 }); // each png is 70 bytes
  assert.equal(r.assets.length, 1);
  assert.equal(r.skipped.length, 2);
});

const html = `<!doctype html><html><head>
<link rel="icon" href="Favicon.png"><link rel="stylesheet" href="css/styles.css"><style>.x{background:url('banner.png')}</style></head><body>
<img src="images/logo.png" alt="">
<img src="Logo.PNG">
<img src="/images/team/anna.png">
<img src="assets/old/hero-banner.png" srcset="images/logo.png 1x, small/logo.png 2x">
<img src="https://picsum.photos/400/300">
<img src="https://cdn.example.com/x.png">
<img src="nothing-here.png">
<div style="background:url(images/team/anna.png)" data-src="images/team/anna.png"></div>
<script src="script.js"></script><video poster="images/logo.png"><source src="movie.mp4"></video>
</body></html>`;
const css = `.hero{background:url("../images/hero-banner.png")}.b{background:url(images/wrong.png)}@font-face{src:url(../fonts/a.woff2)}`;
const files: ProjectFile[] = [
  { path: 'index.html', content: html },
  { path: 'css/styles.css', content: css },
  { path: 'script.js', content: "const slides=['images/team/anna.png'];" },
];
const assets = [asset('images/logo.png'), asset('images/team/anna.png'), asset('images/hero-banner.png'), asset('images/favicon.png'), asset('images/banner.png'), asset('images/unused-thing.png')];

test('analyzeRefs: ok / fixable / placeholder / missing, ignores external CDN, videos and fonts', () => {
  const rep = analyzeRefs(files, assets);
  const st = (file: string, ref: string) => rep.find((r) => r.file === file && r.ref === ref)?.status;
  assert.equal(st('index.html', 'images/logo.png'), 'ok');
  assert.equal(st('index.html', 'Logo.PNG'), 'fixable');
  assert.equal(st('index.html', '/images/team/anna.png'), 'fixable'); // absolute path breaks double-click opening
  assert.equal(st('index.html', 'assets/old/hero-banner.png'), 'fixable');
  assert.equal(st('index.html', 'small/logo.png'), 'fixable');
  assert.equal(st('index.html', 'Favicon.png'), 'fixable');
  assert.equal(st('index.html', 'banner.png'), 'fixable');
  assert.equal(st('index.html', 'https://picsum.photos/400/300'), 'placeholder');
  assert.equal(st('index.html', 'nothing-here.png'), 'missing');
  assert.equal(st('css/styles.css', '../images/hero-banner.png'), 'ok');
  assert.equal(st('css/styles.css', 'images/wrong.png'), 'missing'); // relative to css/, so it does not exist
  assert.equal(rep.find((r) => r.ref.includes('cdn.example.com')), undefined);
  assert.equal(rep.find((r) => r.ref.includes('movie.mp4')), undefined);
  assert.equal(rep.find((r) => r.ref.includes('woff2')), undefined);
});

test('fixRefs rewrites only fixable refs, to the right relative path per file', () => {
  const { files: out, fixed } = fixRefs(files, assets);
  const h = out.find((f) => f.path === 'index.html')!.content;
  assert.equal(fixed, 6); // Logo.PNG, /images/team/anna.png, hero-banner (old folder), small/logo.png, Favicon.png, banner.png
  assert.ok(h.includes('src="images/logo.png"'));
  assert.ok(!h.includes('Logo.PNG'));
  assert.ok(h.includes('<img src="images/team/anna.png">'));
  assert.ok(h.includes('src="images/hero-banner.png"'));
  assert.ok(h.includes('1x, images/logo.png 2x'));
  assert.ok(h.includes('href="images/favicon.png"'));
  assert.ok(h.includes("url('images/banner.png')"));
  assert.ok(h.includes('https://picsum.photos/400/300'), 'placeholders are left alone');
  assert.ok(h.includes('nothing-here.png'), 'missing ones are left alone');
  const c = out.find((f) => f.path === 'css/styles.css')!.content;
  assert.ok(c.includes('url("../images/hero-banner.png")'));
  assert.ok(c.includes('url(images/wrong.png)'));
  // running it again changes nothing
  assert.equal(fixRefs(out, assets).fixed, 0);
});

test('remapRef maps a placeholder to a chosen image, in the right folder depth', () => {
  const a = remapRef(files, 'index.html', 'https://picsum.photos/400/300', 'images/team/anna.png');
  assert.ok(a.find((f) => f.path === 'index.html')!.content.includes('<img src="images/team/anna.png">'));
  const b = remapRef(files, 'css/styles.css', 'images/wrong.png', 'images/banner.png');
  assert.ok(b.find((f) => f.path === 'css/styles.css')!.content.includes('url(../images/banner.png)'));
});

test('unusedAssets also counts names mentioned in JS (carousel arrays)', () => {
  const fixed = fixRefs(files, assets).files;
  const un = unusedAssets(fixed, assets).map((a) => a.path);
  assert.deepEqual(un, ['images/unused-thing.png']);
});

test('inlineAssets embeds exact matches only; wrong paths stay broken like in the real site', () => {
  const out = inlineAssets('<img src="images/logo.png"><img src="logo.png"><div style="background:url(images/logo.png)"></div><img src="https://x.com/a.png">', assets);
  assert.equal((out.match(/data:image\/png;base64,/g) || []).length, 2);
  assert.ok(out.includes('src="logo.png"'));
  assert.ok(out.includes('https://x.com/a.png'));
});

test('bundleForPreview: images referenced from a CSS file in a sub folder are resolved from that folder', () => {
  const doc = bundleForPreview(files, assets);
  assert.ok(doc.includes('background:url("data:image/png;base64,'), 'css ../images/hero-banner.png resolved');
  // images/wrong.png is written relative to css/, so it means css/images/wrong.png, which does not exist: it must stay broken.
  assert.ok(doc.includes('url(css/images/wrong.png)'), 'wrong css path is not "rescued"');
});

test('rebaseCss only changes url() of files in sub folders', () => {
  assert.equal(rebaseCss('a{background:url(x.png)}', 'styles.css'), 'a{background:url(x.png)}');
  assert.equal(rebaseCss('a{background:url(../images/x.png)}', 'css/styles.css'), 'a{background:url(images/x.png)}');
  assert.equal(rebaseCss('a{background:url(https://a.com/x.png)}', 'css/styles.css'), 'a{background:url(https://a.com/x.png)}');
});

test('mapRefs ignores data: URIs, anchors and mailto', () => {
  const seen: string[] = [];
  mapRefs('<img src="data:image/png;base64,AAAA"><a href="#x"><img src="a.png"><link rel="icon" href="b.ico"><link rel="stylesheet" href="c.css">', 'html', (r) => { seen.push(r); return undefined; });
  assert.deepEqual(seen, ['a.png', 'b.ico']);
});
