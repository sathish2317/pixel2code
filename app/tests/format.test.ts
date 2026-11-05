import test from 'node:test';
import assert from 'node:assert/strict';
import { BLOCKS } from '../src/lib/blocks';
import { formatCss, formatHtml, formatJs } from '../src/lib/format';

const flat = (s: string) => s.replace(/\s+/g, '').replace(/;}/g, '}');
const tagsOnly = (s: string) => s.replace(/\s+/g, ' ').replace(/\s*>\s*/g, '>').replace(/\s*<\s*/g, '<').trim();

test('formatCss expands rules and keeps meaning', () => {
  const f = formatCss('.a{color:red;margin:0 auto}.a:hover,.b>.c{background:url("x;y.png")}@media (max-width:600px){.a{display:none}}@keyframes k{0%,100%{opacity:0}50%{opacity:1}}');
  assert.ok(f.includes('.a {\n  color: red;\n  margin: 0 auto;\n}'));
  assert.ok(f.includes('.a:hover,\n.b>.c {'));
  assert.ok(f.includes('@media (max-width: 600px) {\n  .a {\n    display: none;\n  }\n}'));
  assert.ok(f.includes('0%, 100% {'));
  assert.ok(f.includes('url("x;y.png")'));
});

test('formatHtml indents blocks and keeps inline text together', () => {
  const f = formatHtml('<section class="a"><div><h2>Title</h2><p>Hello <b>big</b> world</p><ul><li><a href="#">One</a></li><li>Two</li></ul></div></section>');
  assert.equal(f, '<section class="a">\n  <div>\n    <h2>Title</h2>\n    <p>Hello <b>big</b> world</p>\n    <ul>\n      <li><a href="#">One</a></li>\n      <li>Two</li>\n    </ul>\n  </div>\n</section>');
  // no space is invented between inline siblings, and a real one is kept
  assert.equal(formatHtml('<p><b>a</b><i>b</i> <u>c</u></p>'), '<p><b>a</b><i>b</i> <u>c</u></p>');
  assert.equal(formatHtml('<p><b>a </b>b</p>'), '<p><b>a </b>b</p>');
});

test('formatJs re-indents by depth', () => {
  const f = formatJs("a.forEach(function (x) {\nif (x) {\nrun(/[{]/, 'a}');\n}\n});");
  assert.equal(f, "a.forEach(function (x) {\n  if (x) {\n    run(/[{]/, 'a}');\n  }\n});");
});

test('every block formats without changing its content', () => {
  for (const b of BLOCKS) {
    assert.equal(tagsOnly(formatHtml(b.html)), tagsOnly(b.html), b.id + ' html');
    assert.equal(flat(formatCss(b.css)), flat(b.css), b.id + ' css');
    if (b.js) {
      const f = formatJs(b.js);
      assert.equal(f.replace(/^\s+/gm, ''), b.js.replace(/^\s+/gm, '').replace(/\n{3,}/g, '\n\n').trim(), b.id + ' js');
      assert.doesNotThrow(() => new Function(f), b.id + ' js parses');
    }
  }
});
