import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { analyzeKitZip } from '../src/lib/layoutKit';
import { bundleForPreview } from '../src/lib/managed';

test('ZIP analysis preserves separate nested source files and local web fonts', async () => {
  const zip = new JSZip();
  zip.file('site/index.html', '<!doctype html><html><head><link rel="stylesheet" href="css/site.css"></head><body><button id="menu">Menu</button><script src="js/script.js" defer></script></body></html>');
  zip.file('site/css/site.css', '@font-face{font-family:Test;src:url("../fonts/test.woff2")} body{font-family:Test}');
  zip.file('site/js/script.js', "document.getElementById('menu').addEventListener('click',()=>document.body.classList.toggle('open'));");
  zip.file('site/fonts/test.woff2', new Uint8Array([1, 2, 3, 4]));
  zip.file('site/images/logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>');
  const result = await analyzeKitZip(await zip.generateAsync({ type: 'uint8array' }), 'site.zip');
  assert.ok(result.sourceFiles.some((f) => f.path === 'index.html'));
  assert.ok(result.sourceFiles.some((f) => f.path === 'css/site.css'));
  assert.ok(result.sourceFiles.some((f) => f.path === 'js/script.js'));
  assert.ok(result.assets.some((a) => a.path === 'fonts/test.woff2' && a.mime === 'font/woff2'));
  assert.ok(result.assets.some((a) => a.path === 'images/logo.svg'));
});

test('preview resolves nested entry files and runs a local deferred script after parsed markup', () => {
  const html = bundleForPreview([
    { path: 'pages/header.html', content: '<!doctype html><html><head><link rel="stylesheet" href="../css/header.css"></head><body><button id="menu">Menu</button><script src="../js/menu.js" defer></script></body></html>' },
    { path: 'css/header.css', content: 'body{color:#123}' },
    { path: 'js/menu.js', content: "document.getElementById('menu').addEventListener('click',()=>document.body.classList.toggle('open'));" },
  ]);
  assert.ok(html.includes('body{color:#123}'));
  assert.ok(html.includes("document.getElementById('menu').addEventListener"));
  assert.ok(html.includes('sourceURL=js/menu.js'));
  assert.ok(!html.includes('src="../js/menu.js"'));
});

test('preview supports local ES-module entry points and rewrites literal local JSON fetches', () => {
  const html = bundleForPreview([
    { path: 'index.html', content: '<!doctype html><html><head></head><body><div id="app"></div><script type="module" src="js/main.js"></script></body></html>' },
    { path: 'js/main.js', content: "import { label } from './label.js'; fetch('../data/config.json').then(r=>r.json()).then(console.log); document.getElementById('app').textContent=label;" },
    { path: 'js/label.js', content: "export const label = 'module-loaded';" },
    { path: 'data/config.json', content: '{"ok":true}' },
  ]);
  assert.ok(html.includes('Pixel2Code local ES-module loader'));
  assert.ok(html.includes('js/main.js'));
  assert.ok(html.includes('js/label.js'));
  assert.ok(html.includes('data:application/json;base64,'));
  assert.ok(!html.includes('type="module" src="js/main.js"'));
});

test('Chrome-tab wrapper exposes Console and Network diagnostics tabs', async () => {
  const { tabDocument } = await import('../src/lib/tabDoc');
  const page = tabDocument('<!doctype html><html><body><p>Preview</p></body></html>');
  assert.ok(page.includes('id="consoleTab">Console'));
  assert.ok(page.includes('id="networkTab">Network'));
  assert.ok(page.includes("m.type==='network'"));
});

test('preview recursively inlines local CSS imports and font URLs', () => {
  const html = bundleForPreview([
    { path: 'index.html', content: '<html><head><link rel="stylesheet" href="css/main.css"></head><body></body></html>' },
    { path: 'css/main.css', content: '@import "parts/theme.css"; @font-face{font-family:Demo;src:url("../fonts/demo.woff2")} body{font-family:Demo}' },
    { path: 'css/parts/theme.css', content: '.theme{color:rebeccapurple}' },
  ], [{ path: 'fonts/demo.woff2', mime: 'font/woff2', base64: 'AAECAw==' }]);
  assert.ok(html.includes('.theme{color:rebeccapurple}'));
  assert.ok(html.includes('data:font/woff2;base64,AAECAw=='));
});
