import test from 'node:test';
import assert from 'node:assert/strict';
import { BLOCKS, SHARED, composeCss, composeHtml, composeJs, composePage, pageFiles, placeFromBlock, recolor, uniqueIds } from '../src/lib/blocks';

const VOID = new Set(['img', 'input', 'br', 'hr', 'meta', 'link', 'source']);

function tagProblems(html: string): string[] {
  const stack: string[] = [];
  const bad: string[] = [];
  const re = /<(\/?)([a-zA-Z][\w-]*)\b[^>]*?(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) {
    const [, close, tag, selfClose] = m;
    const t = tag.toLowerCase();
    if (VOID.has(t) || selfClose) continue;
    if (!close) stack.push(t);
    else if (stack[stack.length - 1] === t) stack.pop();
    else bad.push(`unexpected </${t}> (open: ${stack[stack.length - 1]})`);
  }
  if (stack.length) bad.push('unclosed: ' + stack.join(','));
  return bad;
}

/** Removes @keyframes blocks (their from/to/50% selectors are not class selectors) and checks that each animation name starts with bk-. */
function stripKeyframes(css: string): string {
  let out = '';
  let i = 0;
  while (i < css.length) {
    const at = css.indexOf('@keyframes', i);
    if (at < 0) { out += css.slice(i); break; }
    out += css.slice(i, at);
    const name = /^@keyframes\s+([\w-]+)/.exec(css.slice(at));
    assert.ok(name && name[1].startsWith('bk-'), 'keyframes name must start with bk-: ' + (name && name[1]));
    let depth = 0, j = css.indexOf('{', at);
    for (; j < css.length; j++) { if (css[j] === '{') depth++; else if (css[j] === '}') { depth--; if (depth === 0) break; } }
    i = j + 1;
  }
  return out;
}

const braces = (css: string) => (css.match(/{/g) || []).length - (css.match(/}/g) || []).length;

test('block ids are unique and shared keys exist', () => {
  const ids = BLOCKS.map((b) => b.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const b of BLOCKS) for (const s of b.shared || []) assert.ok(SHARED[s], `${b.id} uses unknown shared ${s}`);
  assert.ok(BLOCKS.length >= 92);
});

for (const b of BLOCKS) {
  test(`block "${b.id}": valid html, balanced css, valid js, scoped classes`, () => {
    assert.deepEqual(tagProblems(b.html), [], 'html tags');
    assert.equal(braces(b.css), 0, 'css braces');
    // "font:inherit" on its own is valid (a CSS-wide keyword); "font:600 14px inherit" is not.
    assert.ok(!/font:(?!\s*inherit\s*(?:[;}!]|$))[^;}]*\binherit\b/.test(b.css), 'font shorthand mixing inherit with other values is invalid CSS');
    if (b.js) assert.doesNotThrow(() => new Function(b.js), 'js syntax');
    // every selector of the block's own css starts with a bk- class (so it cannot restyle the rest of a site)
    for (const rule of stripKeyframes(b.css).replace(/@media[^{]*{/g, '').split('}')) {
      const sel = rule.split('{')[0].trim();
      if (!sel) continue;
      for (const part of sel.split(',')) assert.match(part.trim(), /^\.bk-/, `unscoped selector "${part.trim()}" in ${b.id}`);
    }
    // no id inside the block may be shared with an id from another block, except the common section ids
    assert.ok(b.html.trim().length > 40);
  });
}

test('composeCss writes shared css once and skips duplicates', () => {
  const a = BLOCKS.find((b) => b.id === 'contact-form')!;
  const c = BLOCKS.find((b) => b.id === 'appointment-form')!;
  const css = composeCss([placeFromBlock(a), placeFromBlock(c), placeFromBlock(a)]);
  assert.equal(css.split('.bk-form {').length - 1, 1);
  assert.equal(css.split('.bk-btn {').length - 1, 1);
  const js = composeJs([placeFromBlock(a), placeFromBlock(c)]);
  assert.equal(js.split("querySelectorAll('.bk-form')").length - 1, 1, 'form script only once');
  assert.doesNotThrow(() => new Function(js));
});

test('the same block twice gets unique ids and matching label "for"', () => {
  const a = BLOCKS.find((b) => b.id === 'contact-form')!;
  const html = composeHtml([placeFromBlock(a), placeFromBlock(a)]);
  assert.ok(html.includes('id="bk-name"') && html.includes('id="bk-name-2"'));
  assert.ok(html.includes('for="bk-name-2"'));
  assert.equal(uniqueIds('<a id="x">', 1), '<a id="x">');
});

test('recolor swaps the accent only with a valid 6-digit hex', () => {
  assert.equal(recolor('a{color:#2563eb}', '#ff0000'), 'a{color:#ff0000}');
  assert.equal(recolor('a{color:#2563eb}', 'red;}'), 'a{color:#2563eb}');
});

test('full page and file set are complete and the js parses', () => {
  const all = BLOCKS.map(placeFromBlock);
  const page = composePage(all, '#16a34a', 'Test <page>');
  assert.ok(page.startsWith('<!DOCTYPE html>'));
  assert.ok(!page.includes('#2563eb'));
  assert.ok(page.includes('<title>Test page</title>'));
  assert.deepEqual(tagProblems(page.replace(/<script>[\s\S]*?<\/script>/g, '').replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<!DOCTYPE html>/, '')), []);
  const files = pageFiles(all);
  assert.deepEqual(files.map((f) => f.path), ['index.html', 'styles.css', 'script.js']);
  assert.doesNotThrow(() => new Function(files[2].content));
  assert.equal(braces(files[1].content), 0);
});

import { blockFromCode, blocksFromFiles } from '../src/lib/blocks';

test('blockFromCode splits a full snippet into html, css and js', () => {
  const b = blockFromCode('Mine', '<style>.a{color:red}</style><div class="a">Hi</div><script>console.log(1)</script><script src="x.js"></script>');
  assert.equal(b.css, '.a{color:red}');
  assert.equal(b.js, 'console.log(1)');
  assert.ok(b.html.includes('<div class="a">Hi</div>') && b.html.includes('src="x.js"'));
  assert.ok(!b.html.includes('<style'));
});

test('blockFromCode tells css from js when there is no markup', () => {
  assert.equal(blockFromCode('c', '.card{color:red}').css, '.card{color:red}');
  assert.equal(blockFromCode('j', "document.title='x'").js, "document.title='x'");
});

test('blocksFromFiles groups card.html + card.css + card.js into one block', () => {
  const r = blocksFromFiles([
    { name: 'card.html', text: '<div class="c">x</div>' }, { name: 'card.css', text: '.c{color:red}' },
    { name: 'card.js', text: 'var a=1;' }, { name: 'footer.html', text: '<footer>f</footer>' },
  ]);
  assert.equal(r.length, 2);
  const card = r.find((b) => b.name === 'card')!;
  assert.deepEqual([card.html, card.css, card.js], ['<div class="c">x</div>', '.c{color:red}', 'var a=1;']);
});

import { DEFAULT_THEME, themeCss, sharedJsFor } from '../src/lib/blocks';

test('pro blocks: wrapper class, specs, reveal script and theme', () => {
  const pro = BLOCKS.filter((b) => b.id.startsWith('pro-'));
  assert.ok(pro.length >= 68);
  for (const b of pro) {
    assert.ok(/class="bk-p[ "]/.test(b.html), `${b.id} root needs class bk-p`);
    assert.ok(b.shared?.includes('pro'), `${b.id} needs shared pro`);
    assert.ok((b.specs || []).length >= 3, `${b.id} needs specs`);
    if (b.id !== 'pro-scroll-tools') assert.ok(/@media \(max-width/.test(b.css), `${b.id} needs a responsive breakpoint`);
    assert.ok(!b.js.includes('#2563eb'), 'no accent hex in js (it is not recolored)');
  }
  const page = composePage([placeFromBlock(pro[0]), placeFromBlock(pro[1])], '#16a34a', 'T', { radius: 'sharp', font: 'serif', motion: 'subtle' });
  assert.ok(page.includes('--bk-r: 4px') && page.includes('--bk-hf: Georgia'));
  assert.ok(page.includes('--bk-a: #16a34a') && !page.includes('#2563eb'));
  assert.equal(page.split("classList.add('bk-js')").length - 1, 1, 'reveal script once');
  assert.equal(themeCss(DEFAULT_THEME), '');
  assert.ok(themeCss({ ...DEFAULT_THEME, motion: 'off' }).includes('animation:none'));
  assert.equal(sharedJsFor([placeFromBlock(BLOCKS.find((b) => b.id === 'faq')!)]), '');
});
