import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { analyzeKitZip } from '../src/lib/layoutKit';
import { componentPreviewFiles } from '../src/lib/blocks';
import { bundleForPreview } from '../src/lib/managed';
import { findPreviewAsset } from '../src/lib/assets';

const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

async function kit(): Promise<Uint8Array> {
  const z = new JSZip();
  z.file('kit/header/header.html', '<header class="hd"><img src="../Images/LOGO.png"><img src="../images/Hero Pic.png"><a style="background:url(\'../images/bg.png\')">x</a></header>');
  z.file('kit/footer/footer.html', '<footer><img src="/images/bg.png"><img src="images/nope.png"></footer>');
  z.file('kit/css/style.css', '@font-face{font-family:Inter;src:url("../fonts/Inter.woff2?v=2") format("woff2"),url(../Fonts/INTER.ttf)}.hd{background:url(../images/bg.png)}');
  z.file('kit/js/main.js', 'var slides=["images/logo.png","images/bg.png"];');
  for (const n of ['logo.png', 'Hero Pic.png', 'bg.png']) z.file('kit/images/' + n, PNG);
  z.file('kit/fonts/Inter.woff2', Buffer.from('wOF2fake'));
  z.file('kit/fonts/INTER.ttf', Buffer.from('fakettf'));
  return new Uint8Array(await z.generateAsync({ type: 'nodebuffer' }));
}

test('header/footer ZIP: images, fonts and JS-loaded images are embedded in the preview', async () => {
  const r = await analyzeKitZip(await kit(), 'kit.zip');
  assert.deepEqual(r.assets.map((a) => a.path).sort(), ['fonts/INTER.ttf', 'fonts/Inter.woff2', 'images/Hero Pic.png', 'images/bg.png', 'images/logo.png']);
  const html = bundleForPreview(componentPreviewFiles({ id: '1', name: 'k', html: r.html, css: r.css, js: r.js, sourceFiles: r.sourceFiles }), r.assets);
  const body = html.slice(html.indexOf('</script>'));
  assert.ok(body.includes('data:font/woff2;base64,'), 'woff2 font embedded');
  assert.ok(body.includes('data:font/ttf;base64,'), 'ttf font embedded (different case in the CSS)');
  assert.ok(!/src="\.\.\/Images/.test(body), 'wrong-case image reference resolved');
  assert.ok(!body.includes('"images/logo.png"'), 'image named inside JavaScript resolved');
  assert.equal((body.match(/images\/[\w ]+\.png/g) || []).join(','), 'images/nope.png', 'only the really missing image stays unresolved');
});

test('header/footer ZIP: the missing image is reported by name and unlinked CSS/JS are kept', async () => {
  const r = await analyzeKitZip(await kit(), 'kit.zip');
  assert.ok(r.analysis.findings.some((f) => f.includes('images/nope.png')));
  assert.ok(r.css.includes('@font-face') && r.js.includes('slides'));
});

test('findPreviewAsset: exact, case-insensitive and unique file-name match; never guesses between two files', () => {
  const a = [{ path: 'images/logo.png' }, { path: 'a/x.png' }, { path: 'b/x.png' }];
  assert.equal(findPreviewAsset('images/logo.png', [''], a)?.path, 'images/logo.png');
  assert.equal(findPreviewAsset('Images/LOGO.PNG?v=1', [''], a)?.path, 'images/logo.png');
  assert.equal(findPreviewAsset('../logo.png', ['css'], a)?.path, 'images/logo.png');
  assert.equal(findPreviewAsset('x.png', [''], a), undefined);
  assert.equal(findPreviewAsset('https://cdn.com/logo.png', [''], a), undefined);
});