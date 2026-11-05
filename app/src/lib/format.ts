/**
 * Small code formatters used when you COPY or DOWNLOAD block code, so pasted code is already indented and readable.
 * No dependency. They only change whitespace; the page looks and works the same.
 *   formatHtml : one tag per line, children indented, inline text and inline tags stay together
 *   formatCss  : one declaration per line, nested @media / @keyframes indented, one selector per line
 *   formatJs   : re-indents by bracket depth (2 spaces); does not rewrite your code
 * If anything looks unusual (unbalanced tags etc.) the original text is returned untouched.
 */

/** Set `fmt.on = false` to get the original text back (used only by tests that compare the two). */
export const fmt = { on: true };
const IND = '  ';
const MAX = 110;

// ---------------------------------------------------------------------------------------------
// CSS
// ---------------------------------------------------------------------------------------------
export function formatCss(css: string): string {
  if (!fmt.on) return css.trim();
  const src = css.replace(/\r\n/g, '\n');
  const out: string[] = [];
  const stack: string[] = []; // at-rule / selector preludes of the open blocks
  let depth = 0;
  let buf = '';
  let paren = 0;
  let i = 0;
  const pad = () => IND.repeat(depth);
  const squash = (s: string) => s.replace(/("[^"]*"|'[^']*')|\s+/g, (m, q) => (q ? q : ' ')).trim();
  const inKeyframes = () => stack.some((s) => /^@(-\w+-)?keyframes/i.test(s));

  const flushDecl = () => {
    const d = squash(buf);
    buf = '';
    if (!d) return;
    if (d.startsWith('@')) { out.push(pad() + d + ';'); return; }
    const c = d.indexOf(':');
    if (c < 0) { out.push(pad() + d + ';'); return; }
    out.push(pad() + d.slice(0, c).trim() + ': ' + d.slice(c + 1).trim() + ';');
  };

  while (i < src.length) {
    const ch = src[i];
    if (ch === '"' || ch === "'") { // string, copied as it is
      let j = i + 1;
      while (j < src.length && src[j] !== ch) { if (src[j] === '\\') j++; j++; }
      buf += src.slice(i, j + 1);
      i = j + 1;
      continue;
    }
    if (ch === '/' && src[i + 1] === '*') {
      const j = src.indexOf('*/', i + 2);
      const end = j < 0 ? src.length : j + 2;
      if (!buf.trim()) { out.push(pad() + src.slice(i, end).trim()); } else buf += src.slice(i, end);
      i = end;
      continue;
    }
    if (ch === '(') paren++;
    if (ch === ')') paren = Math.max(0, paren - 1);
    if (paren === 0 && ch === '{') {
      let sel = squash(buf);
      buf = '';
      stack.push(sel);
      if (sel.startsWith('@')) {
        sel = sel.replace(/\(\s*([\w-]+)\s*:\s*/g, '($1: ');
        out.push(pad() + sel + ' {');
      } else if (inKeyframes() && /^[\d.%\s,a-z]+$/i.test(sel)) {
        out.push(pad() + sel.replace(/\s*,\s*/g, ', ') + ' {');
      } else {
        const parts: string[] = [];
        let d = 0, cur = '';
        for (const c of sel) {
          if (c === '(' || c === '[') d++;
          if (c === ')' || c === ']') d--;
          if (c === ',' && d === 0) { parts.push(cur.trim()); cur = ''; } else cur += c;
        }
        parts.push(cur.trim());
        out.push(parts.map((p, k) => pad() + p + (k < parts.length - 1 ? ',' : ' {')).join('\n'));
      }
      depth++;
      i++;
      continue;
    }
    if (paren === 0 && ch === ';') { flushDecl(); i++; continue; }
    if (paren === 0 && ch === '}') {
      flushDecl();
      depth = Math.max(0, depth - 1);
      stack.pop();
      out.push(pad() + '}');
      if (depth === 0) out.push('');
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  flushDecl();
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

// ---------------------------------------------------------------------------------------------
// JS (re-indent only)
// ---------------------------------------------------------------------------------------------
export function formatJs(js: string): string {
  if (!fmt.on) return js.trim();
  const lines = js.replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  const stack: number[] = []; // line number of every open bracket; brackets opened on one line count as ONE indent level
  let inBlock = false; // inside /* ... */
  let inTpl = false; // inside a template literal that spans lines
  let prev = ''; // previous significant line (trimmed)
  const levelOf = (st: number[]) => new Set(st).size;
  lines.forEach((raw, n) => {
    const line = raw.trim();
    if (inBlock || inTpl) { // keep these lines exactly as they are
      out.push(raw);
      const r = scan(line, inBlock, inTpl);
      inBlock = r.block; inTpl = r.tpl;
      r.ev.forEach((e) => { if (e === 'o') stack.push(n); else stack.pop(); });
      return;
    }
    if (!line) { out.push(''); return; }
    let lead = 0;
    for (const c of line) { if (c === '}' || c === ')' || c === ']') lead++; else break; }
    let level = levelOf(stack.slice(0, Math.max(0, stack.length - lead)));
    // a statement that continues on the next line (operator at the end, or a chained call) gets one extra level
    const cont = /^(\.|\?|:|\+|-|\*|%|&&|\|\|)/.test(line) && !/^(\/[/*]|\+\+|--)/.test(line);
    const open = /[+\-*%=&|?:]$/.test(prev) && !/\b(case|default)\b/.test(prev) && !/^\/\//.test(prev);
    if (prev && (cont || open) && !lead) level += 1;
    out.push(IND.repeat(level) + line);
    const r = scan(line, false, false);
    inBlock = r.block; inTpl = r.tpl;
    r.ev.forEach((e) => { if (e === 'o') stack.push(n); else stack.pop(); });
    if (!/^\/[/*]/.test(line)) prev = line.replace(/\s\/\/[^'"`]*$/, '').trim() || prev;
  });
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

/** Brackets opened ('o') and closed ('c') on one line, skipping strings, regex literals and comments. */
function scan(line: string, block: boolean, tpl: boolean): { ev: ('o' | 'c')[]; block: boolean; tpl: boolean } {
  const ev: ('o' | 'c')[] = [];
  let i = 0;
  let last = ''; // last significant char (to tell a regex from a division)
  while (i < line.length) {
    const c = line[i];
    if (block) { const j = line.indexOf('*/', i); if (j < 0) return { ev, block: true, tpl }; i = j + 2; block = false; continue; }
    if (tpl) {
      if (c === '\\') { i += 2; continue; }
      if (c === '`') { tpl = false; last = '`'; }
      i++;
      continue;
    }
    if (c === '/' && line[i + 1] === '/') break;
    if (c === '/' && line[i + 1] === '*') { block = true; i += 2; continue; }
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < line.length && line[j] !== c) { if (line[j] === '\\') j++; j++; }
      i = j + 1; last = c;
      continue;
    }
    if (c === '`') { tpl = true; i++; continue; }
    if (c === '/' && (last === '' || /[(,=:[!&|?{};+\-*%<>~^]/.test(last) || /\b(return|typeof|case)$/.test(line.slice(0, i).trim()))) {
      let j = i + 1, cls = false;
      while (j < line.length) {
        if (line[j] === '\\') { j += 2; continue; }
        if (line[j] === '[') cls = true;
        else if (line[j] === ']') cls = false;
        else if (line[j] === '/' && !cls) break;
        j++;
      }
      i = j + 1; last = '/';
      continue;
    }
    if (c === '{' || c === '(' || c === '[') ev.push('o');
    else if (c === '}' || c === ')' || c === ']') ev.push('c');
    if (c !== ' ' && c !== '\t') last = c;
    i++;
  }
  return { ev, block, tpl };
}

// ---------------------------------------------------------------------------------------------
// HTML
// ---------------------------------------------------------------------------------------------
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const BLOCK = new Set(['address', 'article', 'aside', 'blockquote', 'body', 'caption', 'colgroup', 'dd', 'details', 'dialog', 'div', 'dl', 'dt', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hr', 'html', 'li', 'main', 'nav', 'ol', 'optgroup', 'option', 'p', 'section', 'select', 'summary', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'ul', 'title']);
const RAW = new Set(['pre', 'textarea', 'script', 'style', 'svg']);

interface N { t: 'el' | 'text' | 'comment' | 'raw'; tag?: string; attrs?: string; kids?: N[]; text?: string; ws?: boolean; end?: boolean; trail?: boolean; }

const TOKEN = /<!--[\s\S]*?-->|<!doctype[^>]*>|<(\/?)([a-zA-Z][\w:-]*)((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;

function parse(html: string): N[] | null {
  const root: N = { t: 'el', tag: '#root', kids: [] };
  const stack: N[] = [root];
  let pos = 0;
  let ws = false;
  const top = () => stack[stack.length - 1];
  const addText = (s: string) => {
    if (!s) return;
    const lead = /^\s/.test(s);
    const trail = /\s$/.test(s);
    const body = s.replace(/\s+/g, ' ').trim();
    if (!body) { ws = true; return; }
    top().kids!.push({ t: 'text', text: body, ws: ws || lead });
    ws = trail;
  };
  TOKEN.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = TOKEN.exec(html))) {
    addText(html.slice(pos, m.index));
    pos = m.index + m[0].length;
    const raw = m[0];
    if (raw.startsWith('<!--') || /^<!doctype/i.test(raw)) { top().kids!.push({ t: 'comment', text: raw, ws }); ws = false; continue; }
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const attrs = m[3].replace(/("[^"]*"|'[^']*')|\s+/g, (_x, q) => (q ? q : ' ')).trim();
    if (closing) {
      if (top().tag !== tag) return null; // unbalanced: leave the text alone
      top().end = true;
      top().trail = ws;
      stack.pop();
      ws = false;
      continue;
    }
    if (RAW.has(tag) && !/\/\s*$/.test(m[3])) { // pre, textarea, script, style, svg: copied whole
      const re = new RegExp('<' + tag + '\\b|</' + tag + '\\s*>', 'gi');
      re.lastIndex = pos;
      let d = 1, e: RegExpExecArray | null, endAt = -1, endLen = 0;
      while ((e = re.exec(html))) {
        if (e[0][1] === '/') { d--; if (d === 0) { endAt = e.index; endLen = e[0].length; break; } } else d++;
      }
      if (endAt < 0) return null;
      let inner = html.slice(pos, endAt);
      if (tag === 'svg') inner = inner.replace(/\s*\n\s*/g, ' ');
      top().kids!.push({ t: 'raw', tag, attrs, text: '<' + tag + (attrs ? ' ' + attrs : '') + '>' + inner + '</' + tag + '>', ws });
      pos = endAt + endLen;
      TOKEN.lastIndex = pos;
      ws = false;
      continue;
    }
    const el: N = { t: 'el', tag, attrs, kids: [], ws };
    top().kids!.push(el);
    ws = false;
    if (VOID.has(tag) || /\/\s*$/.test(m[3])) { el.end = true; continue; }
    stack.push(el);
  }
  addText(html.slice(pos));
  if (stack.length !== 1) return null;
  return root.kids!;
}

const openTag = (n: N) => '<' + n.tag + (n.attrs ? ' ' + n.attrs.replace(/\s*\/$/, '') : '') + (VOID.has(n.tag!) && /\/$/.test(n.attrs || '') ? ' /' : '') + '>';
const closeTag = (n: N) => (VOID.has(n.tag!) ? '' : '</' + n.tag + '>');
const isBlock = (n: N) => n.t === 'comment' || (n.t === 'raw' && n.tag !== 'svg') || (n.t === 'el' && BLOCK.has(n.tag!));
const hasBlock = (n: N): boolean => isBlock(n) || (n.t === 'el' && n.kids!.some(hasBlock));

/** Element and everything in it as ONE line (only called when no block-level tag is inside). */
function inline(n: N): string {
  if (n.t === 'text') return n.text!;
  if (n.t === 'raw' || n.t === 'comment') return n.text!;
  const blockish = BLOCK.has(n.tag!);
  let s = openTag(n);
  n.kids!.forEach((k, i) => { s += (k.ws && !(blockish && i === 0) ? ' ' : '') + inline(k); });
  if (n.trail && !blockish && !VOID.has(n.tag!)) s += ' ';
  return s + closeTag(n);
}

function render(kids: N[], level: number, out: string[]): void {
  const pad = IND.repeat(level);
  let cur = '';
  let afterBlock = false; // the last line written is a one-line block element
  const flush = () => { if (cur.trim()) out.push(pad + cur.trim()); cur = ''; };
  for (const k of kids) {
    if (k.t === 'comment' || (k.t === 'raw' && k.tag !== 'svg')) { flush(); out.push(pad + k.text); afterBlock = false; continue; }
    if (k.t === 'el' && (BLOCK.has(k.tag!) || hasBlock(k))) {
      if (VOID.has(k.tag!)) { flush(); out.push(pad + openTag(k)); afterBlock = true; continue; }
      if (!k.kids!.some(hasBlock)) {
        const one = inline(k);
        // CSS may show this "block" tag inline, so a tag written right after inline content (no space between) stays glued to it
        if (cur && !k.ws) { cur += one; afterBlock = false; continue; }
        flush();
        if (one.length + pad.length <= MAX) { out.push(pad + one); afterBlock = true; continue; }
      }
      flush();
      out.push(pad + openTag(k));
      render(k.kids!, level + 1, out);
      out.push(pad + closeTag(k));
      afterBlock = false;
      continue;
    }
    // inline piece: text, inline element, svg, img, input ...
    const piece = inline(k);
    if (afterBlock && !cur && !k.ws && out.length) { out[out.length - 1] += piece; afterBlock = false; continue; }
    afterBlock = false;
    if (cur && k.ws) {
      if ((pad + cur + ' ' + piece).length > MAX) { flush(); cur = piece; } else cur += ' ' + piece;
    } else cur += piece;
  }
  flush();
}

export function formatHtml(html: string): string {
  if (!fmt.on) return html.trim();
  try {
    const tree = parse(html.replace(/\r\n/g, '\n'));
    if (!tree) return html.trim();
    const out: string[] = [];
    render(tree, 0, out);
    return out.join('\n');
  } catch {
    return html.trim();
  }
}
