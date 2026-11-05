// Prepares a static web project for the sandboxed preview. Nothing is executed on the server:
// this only inlines CSS/JS into one HTML string and runs static checks. The iframe (sandbox, no same-origin) runs it.
const path = require('path');
const { extOf } = require('../filePolicy');

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const WEB_EXT = new Set(['html', 'htm', 'css', 'js', 'mjs', 'json', 'svg', 'md', 'txt']);

function resolve(from, ref) {
  const clean = ref.split('#')[0].split('?')[0];
  if (!clean) return null;
  return path.posix.normalize(path.posix.join(path.posix.dirname(from), clean)).replace(/^\.\//, '');
}
const external = (r) => /^(https?:|\/\/|data:|mailto:|tel:|javascript:|#|blob:)/i.test(r);
const lineOf = (html, idx) => html.slice(0, idx).split('\n').length;

function staticChecks(file, byPath) {
  const d = [];
  const html = file.content;
  const stack = [];
  const re = /<\/?([a-zA-Z][\w-]*)([^>]*?)(\/?)>|<!--[\s\S]*?-->/g;
  let m;
  const skipRaw = /<(script|style)[\s\S]*?<\/\1>/gi;
  const scrubbed = html.replace(skipRaw, (s) => s.replace(/[^\n]/g, ' ').replace(/^ {1,7}/, (x) => '<' + x.slice(1)));
  const ids = new Map();
  while ((m = re.exec(scrubbed))) {
    if (!m[1]) continue;
    const tag = m[1].toLowerCase(), closing = m[0][1] === '/';
    const line = lineOf(html, m.index);
    const idm = /\sid\s*=\s*["']([^"']+)["']/.exec(m[2] || '');
    if (idm) { if (ids.has(idm[1])) d.push({ severity: 'warning', path: file.path, line, message: `Duplicate id "${idm[1]}".` }); ids.set(idm[1], line); }
    if (VOID.has(tag) || m[3] === '/') continue;
    if (!closing) stack.push({ tag, line });
    else {
      const i = stack.map((s) => s.tag).lastIndexOf(tag);
      if (i < 0) d.push({ severity: 'warning', path: file.path, line, message: `Closing </${tag}> has no opening tag.` });
      else { for (const s of stack.splice(i + 1)) d.push({ severity: 'warning', path: file.path, line: s.line, message: `<${s.tag}> is never closed.` }); stack.pop(); }
    }
  }
  for (const s of stack) if (!['html', 'body', 'head', 'p', 'li'].includes(s.tag)) d.push({ severity: 'warning', path: file.path, line: s.line, message: `<${s.tag}> is never closed.` });
  if (!/<!doctype html/i.test(html)) d.push({ severity: 'info', path: file.path, line: 1, message: 'Missing <!doctype html> (browsers fall back to quirks mode).' });
  if (!/<meta[^>]+viewport/i.test(html)) d.push({ severity: 'info', path: file.path, line: 1, message: 'Missing <meta name="viewport"> (the page will not be responsive on phones).' });
  if (!/<title>/i.test(html)) d.push({ severity: 'info', path: file.path, line: 1, message: 'Missing <title>.' });
  for (const im of html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/gi)) d.push({ severity: 'info', path: file.path, line: lineOf(html, im.index), message: '<img> without alt text (accessibility).' });
  return d;
}

function build(files, entry) {
  const byPath = new Map(files.map((f) => [f.path, f]));
  const pages = files.filter((f) => /\.html?$/i.test(f.path));
  if (!pages.length) return { ok: false, reason: 'no-entry', message: 'This project has no HTML file, so there is nothing to render in the browser preview. For PHP, Python, Java and other backend code use static analysis, explanation or download; running it needs a configured sandboxed runner (not configured).' };
  const main = (entry && byPath.get(entry)) || byPath.get('index.html') || pages[0];
  const diagnostics = [];
  for (const p of pages) diagnostics.push(...staticChecks(p, byPath));

  let html = main.content;
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    const href = /href\s*=\s*["']([^"']+)["']/i.exec(tag)?.[1];
    if (!href || !/rel\s*=\s*["']?stylesheet/i.test(tag) || external(href)) return tag;
    const f = byPath.get(resolve(main.path, href) || '');
    if (!f) { diagnostics.push({ severity: 'error', path: main.path, line: lineOf(main.content, main.content.indexOf(tag)), message: `Stylesheet "${href}" is not in the project.` }); return tag; }
    return `<style data-from="${f.path}">\n${f.content.replace(/<\/style/gi, '<\\/style')}\n</style>`;
  });
  html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*["']([^"']+)["']([^>]*)><\/script>/gi, (tag, a, src, b) => {
    if (external(src)) return tag;
    const f = byPath.get(resolve(main.path, src) || '');
    if (!f) { diagnostics.push({ severity: 'error', path: main.path, line: lineOf(main.content, main.content.indexOf(tag)), message: `Script "${src}" is not in the project.` }); return tag; }
    return `<script${a}${b}>\n${f.content.replace(/<\/script/gi, '<\\/script')}\n</script>`;
  });
  for (const m of main.content.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    const r = m[1];
    if (external(r)) continue;
    const p = resolve(main.path, r);
    if (p && !byPath.has(p)) {
      // images etc. may live in the app's asset store, so this is a warning, not an error
      if (!diagnostics.some((x) => x.message.includes(`"${r}"`))) diagnostics.push({ severity: 'warning', path: main.path, line: lineOf(main.content, m.index), message: `"${r}" is not a file of this project.` });
    }
  }
  const ignored = files.filter((f) => !WEB_EXT.has(extOf(f.path))).map((f) => f.path);
  return { ok: true, entry: main.path, html, diagnostics: diagnostics.slice(0, 200), notRendered: ignored,
    sandbox: 'Render with <iframe sandbox="allow-scripts allow-forms"> (no allow-same-origin) so the page cannot reach your app\'s storage.' };
}

module.exports = { build, staticChecks };
