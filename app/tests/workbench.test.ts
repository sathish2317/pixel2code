import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import { diffLines, diffStats, hunks } from '../src/lib/diff';
import { replaceInFiles, searchFiles } from '../src/lib/search';
import { buildTree, createFile, deletePath, duplicatePath, renamePath, uniquePath } from '../src/lib/fileTree';
import { decodeText, fromFiles, fromPaste, fromZip, planImport } from '../src/lib/attach';
import { diagnose } from '../src/lib/diagnostics';
import { checkFileKind, languageOf, sanitizePath } from '../src/lib/langs';
import { sanitizeEditorSettings } from '../src/lib/editorSettings';

const enc = (s: string) => new TextEncoder().encode(s);
const F = (path: string, content = 'x') => ({ path, content });

test('language detection by extension', () => {
  assert.equal(languageOf('a/b/App.tsx'), 'typescriptreact'); assert.equal(languageOf('x.PHP'), 'php'); assert.equal(languageOf('Makefile'), 'plaintext');
  assert.equal(languageOf('.gitignore'), 'plaintext'); assert.equal(languageOf('q.sql'), 'sql');
});
test('path rules', () => {
  assert.equal(sanitizePath('./a//b.js'), 'a/b.js'); assert.equal(sanitizePath('a\\b.js'), 'a/b.js'); // Windows separators are converted, never trusted
  for (const bad of ['../a.js', 'a/../b.js', '/etc/x', 'C:\\x.js', 'a\\..\\b', 'a/./b', '']) assert.equal(sanitizePath(bad), null, bad);
  assert.equal(checkFileKind('a.exe', 1).problem, 'executable'); assert.equal(checkFileKind('a.sh', 1).problem, 'executable');
  assert.equal(checkFileKind('a.png', 1).problem, 'image'); assert.equal(checkFileKind('a.xyz', 1).problem, 'unsupported');
  assert.equal(checkFileKind('a.js', 2_000_000).problem, 'toolarge'); assert.equal(checkFileKind('a.js', 10).problem, undefined);
});

test('diff: line ops, stats, collapsed hunks', () => {
  const ops = diffLines('a\nb\nc\nd', 'a\nB\nc\nd\ne');
  assert.deepEqual(diffStats(ops), { added: 2, removed: 1 });
  assert.deepEqual(ops.filter((o) => o.t !== 'eq').map((o) => o.t + ':' + o.text), ['del:b', 'add:B', 'add:e']);
  assert.deepEqual(diffStats(diffLines('', 'x\ny')), { added: 2, removed: 0 });
  assert.deepEqual(diffStats(diffLines('x\ny', '')), { added: 0, removed: 2 });
  const big = Array.from({ length: 50 }, (_, i) => 'l' + i).join('\n');
  const h = hunks(diffLines(big, big.replace('l25', 'CHANGED')), 2);
  assert.ok(h.some((x) => x.t === 'gap')); assert.ok(h.length < 15);
});

test('search + replace: case, whole word, regex, literal $, scope', () => {
  const files = [F('a.js', 'Foo foo FOO\nfoobar'), F('b.css', 'foo{}')];
  assert.equal(searchFiles(files, { query: 'foo' }).matches.length, 5);
  assert.equal(searchFiles(files, { query: 'foo', caseSensitive: true }).matches.length, 3);
  assert.equal(searchFiles(files, { query: 'foo', wholeWord: true }).matches.length, 4);
  assert.equal(searchFiles(files, { query: 'fo+', regex: true }).matches.length, 5);
  assert.ok(searchFiles(files, { query: '(', regex: true }).error); assert.ok(searchFiles(files, { query: 'a*', regex: true }).error);
  const r = replaceInFiles(files, { query: 'foo', wholeWord: true }, 'bar$1');
  assert.equal(r.count, 4); assert.equal(r.files[0].content, 'bar$1 bar$1 bar$1\nfoobar'); assert.deepEqual(r.changed, ['a.js', 'b.css']);
  assert.equal(replaceInFiles(files, { query: 'foo' }, 'x', 'b.css').files[0].content, files[0].content);
  assert.equal(replaceInFiles([F('a', 'ab12')], { query: '(\\w)(\\d)', regex: true }, '$2$1').files[0].content, 'a1b2');
});

test('file tree ops: create, rename file/folder, duplicate, delete, no overwrite', () => {
  const files = [F('index.html'), F('css/a.css'), F('css/b.css')];
  assert.deepEqual(buildTree(files).map((n) => n.name + (n.dir ? '/' : '')), ['css/', 'index.html']);
  assert.equal(createFile(files, 'js/app.js').files.length, 4);
  assert.ok(createFile(files, 'index.html').error); assert.ok(createFile(files, '../x.js').error); assert.ok(createFile(files, 'css').error);
  const r = renamePath(files, 'css', 'styles');
  assert.deepEqual(r.files.map((f) => f.path), ['index.html', 'styles/a.css', 'styles/b.css']);
  assert.ok(renamePath(files, 'css/a.css', 'css/b.css').error); assert.ok(renamePath(files, 'css', 'css/inner').error);
  assert.deepEqual(duplicatePath(files, 'css/a.css').files.at(-1)!.path, 'css/a-copy.css');
  assert.equal(uniquePath(files, 'index.html'), 'index (2).html');
  assert.deepEqual(deletePath(files, 'css').map((f) => f.path), ['index.html']);
});

test('decodeText: utf-8, BOM, utf-16, CRLF, binary, bad encoding', () => {
  assert.equal(decodeText(enc('héllo\r\nx')).text, 'héllo\nx');
  assert.equal(decodeText(new Uint8Array([0xef, 0xbb, 0xbf, 0x68, 0x69])).text, 'hi');
  assert.equal(decodeText(new Uint8Array([0xff, 0xfe, 0x68, 0x00, 0x69, 0x00])).text, 'hi');
  assert.equal(decodeText(new Uint8Array([0x68, 0, 0x69])).problem, 'binary');
  assert.equal(decodeText(new Uint8Array([0x68, 0xe9, 0x6c])).problem, 'encoding');
});

test('attach: statuses for ok / duplicate / identical / executable / image / unsupported / encoding / large / unsafe', () => {
  const existing = [F('index.html', '<p>a</p>'), F('same.js', 'same')];
  const c = fromFiles([
    { name: 'new.js', bytes: enc('let a') }, { name: 'index.html', bytes: enc('<p>b</p>') }, { name: 'same.js', bytes: enc('same') },
    { name: 'run.exe', bytes: enc('MZ') }, { name: 'pic.png', bytes: enc('x') }, { name: 'a.weird', bytes: enc('x') },
    { name: 'bad.js', bytes: new Uint8Array([0x68, 0xe9]) }, { name: 'big.js', bytes: new Uint8Array(1_100_000).fill(97) }, { name: '../evil.js', bytes: enc('x') },
    { name: 'dup.js', bytes: enc('1') }, { name: 'dup.js', bytes: enc('2') },
  ], existing);
  const s = Object.fromEntries(c.map((x) => [x.path + (x.path === 'dup.js' ? c.indexOf(x) : ''), x.status + ':' + (x.problem || (x.identical ? 'identical' : ''))]));
  assert.equal(s['new.js'], 'ok:'); assert.equal(s['index.html'], 'duplicate:'); assert.equal(s['same.js'], 'duplicate:identical');
  assert.equal(s['run.exe'], 'rejected:executable'); assert.equal(s['pic.png'], 'rejected:image'); assert.equal(s['a.weird'], 'rejected:unsupported');
  assert.equal(s['bad.js'], 'rejected:encoding'); assert.equal(s['big.js'], 'rejected:toolarge'); assert.equal(s['../evil.js'], 'rejected:unsafe');
  assert.equal(c.filter((x) => x.path === 'dup.js' && x.status === 'rejected').length, 1);
  assert.equal(c.find((x) => x.path === 'same.js')!.selected, false);
});

test('planImport keeps originals unless replace/rename was chosen', () => {
  const existing = [F('index.html', 'OLD')];
  const c = fromFiles([{ name: 'index.html', bytes: enc('NEW') }, { name: 'a.js', bytes: enc('1') }, { name: 'b.js', bytes: enc('2') }], existing);
  const id = c.find((x) => x.path === 'index.html')!.id;
  c.find((x) => x.path === 'b.js')!.selected = false;
  const skip = planImport(existing, c);
  assert.deepEqual(skip.files, [F('index.html', 'OLD'), F('a.js', '1')]); assert.deepEqual(skip.skipped.sort(), ['b.js', 'index.html']);
  assert.equal(planImport(existing, c, { [id]: 'replace' }).files[0].content, 'NEW');
  const ren = planImport(existing, c, { [id]: 'rename' });
  assert.deepEqual(ren.files.map((f) => f.path), ['index.html', 'index (2).html', 'a.js']); assert.equal(existing[0].content, 'OLD');
});

test('paste: name validated, content kept', () => {
  assert.equal(fromPaste('x.py', 'print(1)\r\n', [])[0].content, 'print(1)\n');
  assert.equal(fromPaste('../x.py', 'print(1)', [])[0].problem, 'unsafe'); assert.equal(fromPaste('x.exe', 'a', [])[0].problem, 'executable');
});

test('ZIP: strips wrapper folder, ignores junk, rejects traversal/exe/symlink/binary, never throws on bad zip', async () => {
  const z = new JSZip();
  z.file('proj/index.html', '<h1>x</h1>'); z.file('proj/src/app.ts', 'let a = 1'); z.file('proj/node_modules/x/i.js', 'x'); z.file('proj/.DS_Store', 'x');
  z.file('proj/tool.exe', 'MZ'); z.file('proj/logo.png', new Uint8Array([137, 80])); z.file('proj/data.js', new Uint8Array([0, 1, 2]));
  z.file('proj/link.js', 'target', { unixPermissions: 0o120777 });
  const r = await fromZip(await z.generateAsync({ type: 'uint8array', platform: 'UNIX' }), []);
  const m = Object.fromEntries(r.candidates.map((c) => [c.path, c.status + ':' + (c.problem || '')]));
  assert.equal(m['index.html'], 'ok:'); assert.equal(m['src/app.ts'], 'ok:'); assert.equal(m['tool.exe'], 'rejected:executable');
  assert.equal(m['logo.png'], 'rejected:image'); assert.equal(m['data.js'], 'rejected:binary'); assert.equal(m['link.js'], 'rejected:unsafe');
  assert.equal(r.ignored, 2);
  // path traversal: build the raw entry names (JSZip lets us write them as given)
  const t = new JSZip(); t.file('../../evil.js', 'x'); t.file('ok.js', '1'); t.file('/abs.js', 'x'); t.file('C:/win.js', 'x');
  const tr = await fromZip(await t.generateAsync({ type: 'uint8array' }), []);
  assert.ok(tr.candidates.filter((c) => c.status === 'rejected' && c.problem === 'unsafe').length >= 2);
  assert.ok(!tr.candidates.some((c) => c.status === 'ok' && (c.path.includes('..') || c.path.startsWith('/'))));
  assert.ok((await fromZip(enc('not a zip'), [])).error);
  const empty = new JSZip(); empty.file('a.exe', 'x');
  assert.equal((await fromZip(await empty.generateAsync({ type: 'uint8array' }), [])).candidates[0].status, 'rejected');
});

test('diagnostics: json, brackets, html tags, css, security hints', () => {
  assert.equal(diagnose(F('a.json', '{"a":1}')).length, 0);
  const j = diagnose(F('a.json', '{\n"a":1,\n}'))[0]; assert.equal(j.severity, 'error'); assert.equal(j.line, 3);
  assert.equal(diagnose(F('a.js', 'function f() {\n if (x) {\n}\n'))[0].message.includes('never closed'), true);
  assert.equal(diagnose(F('a.js', 'const s = "}"; // )\nlet t = `{`;')).length, 0);
  assert.ok(diagnose(F('a.js', 'foo())')).some((d) => d.message.includes('Unexpected')));
  assert.ok(diagnose(F('a.css', '.a { color: red;')).length === 1);
  const h = diagnose(F('a.html', '<div>\n<span>x</div>\n<img src=a>'));
  assert.ok(h.some((d) => d.message.includes('<span> is never closed'))); assert.ok(h.some((d) => d.message.includes('alt')));
  assert.equal(diagnose(F('a.html', '<!doctype html><html><head><meta name="viewport" content="x"></head><body><script>if(a<b){}</script><br></body></html>')).length, 0);
  assert.ok(diagnose(F('a.js', 'el.innerHTML = x')).some((d) => d.message.includes('XSS')));
  assert.ok(diagnose(F('a.js', 'const apiKey = "sk-123456789012";')).some((d) => d.message.includes('secret')));
});

test('editor settings: garbage in, valid settings out', () => {
  const s = sanitizeEditorSettings({ fontSize: 500, tabSize: 3, theme: 'pink', fontFamily: 'x', wordWrap: 'yes', previewDebounce: -5 });
  assert.deepEqual([s.fontSize, s.tabSize, s.theme, s.fontFamily, s.wordWrap, s.previewDebounce], [28, 2, 'dark', 'system-mono', false, 0]);
  assert.equal(sanitizeEditorSettings(null).fontSize, 13);
});

import { highlight } from '../src/lib/highlight';
const plain = (h: string) => h.replace(/<\/?span[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
test('highlight: colored layer always equals the source text (alignment invariant)', () => {
  const samples: [string, string][] = [
    ['javascript', 'const a = `x ${1}` + "s\\"q" // c\n/* b */ function f(x){ return x<2 && y>1 }\nlet re = /a"b/; \'unterminated'],
    ['html', '<!doctype html>\n<div class="a" id=\'b\' data-x=1 hidden>x &amp; y < z</div>\n<style>.a{color:#fff;margin:-1.5px}</style><script>let a="</b>";</script><br/><!-- c --><img alt="x'],
    ['css', '@media (max-width:600px){.a:hover,#b>.c{color:#abc;width:50%;content:"x"}}/* x */ .d{'],
    ['json', '{"a":[1,2.5e3,true,null],"b":{"c":"\\u00e9"}}'],
    ['python', 'def f(x):\n    """doc\n    more"""\n    return x # c\nclass A: pass'],
    ['php', '<?php $a = "x"; // c\necho foo($a); ?>'],
    ['sql', "SELECT a, b FROM t WHERE x = 'it''s' -- c\n/* z */ ORDER BY 1"],
    ['java', '#include <x>\nint main() { return 0; }'],
    ['markdown', '# <b>& </b>'], ['plaintext', 'a < b && c > d'],
  ];
  for (const [lang, code] of samples) { assert.equal(plain(highlight(code, lang)), code, lang); assert.equal(plain(highlight('', lang)), ''); }
  // fuzz: random strings from a nasty alphabet must never change the text
  const alpha = ['<', '>', '"', "'", '`', '/', '*', '\\', '\n', ' ', 'a', '1', '&', ';', '#', '$', '-', '{', '}', '=', '!'];
  let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
  for (const lang of ['javascript', 'html', 'css', 'json', 'python', 'php', 'sql', 'java', 'yaml']) for (let i = 0; i < 150; i++) {
    const s = Array.from({ length: 1 + Math.floor(rnd() * 60) }, () => alpha[Math.floor(rnd() * alpha.length)]).join('');
    assert.equal(plain(highlight(s, lang)), s, lang + ' ' + JSON.stringify(s));
  }
  assert.match(highlight('let a = 1', 'javascript'), /p2c-k">let/); assert.match(highlight('<a href="x">', 'html'), /p2c-s">"x"/);
});
