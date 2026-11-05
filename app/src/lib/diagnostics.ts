// Quick, local, honest diagnostics: syntax problems we can detect without a language server.
// This is NOT a full compiler or linter; for deeper checks use the AI "Review" / "Fix" actions.
import { ProjectFile } from '../types';
import { languageOf } from './langs';

export interface Diagnostic { path: string; line: number; col?: number; severity: 'error' | 'warning' | 'info'; message: string }

const PAIRS: Record<string, string> = { '(': ')', '[': ']', '{': '}' };
const CLOSERS = new Set([')', ']', '}']);

/** Bracket balance for C-like languages and CSS. Skips strings, comments and (for JS) regex/template literals loosely. */
function brackets(path: string, text: string, css: boolean): Diagnostic[] {
  const out: Diagnostic[] = [];
  const stack: { ch: string; line: number; col: number }[] = [];
  let line = 1, col = 0, i = 0;
  const n = text.length;
  while (i < n) {
    const ch = text[i], nx = text[i + 1];
    col++;
    if (ch === '\n') { line++; col = 0; i++; continue; }
    if (ch === '/' && nx === '*') { const e = text.indexOf('*/', i + 2); const seg = text.slice(i, e < 0 ? n : e + 2); line += (seg.match(/\n/g) || []).length; i += seg.length; col = 0; continue; }
    if (!css && ch === '/' && nx === '/') { while (i < n && text[i] !== '\n') i++; continue; }
    if (ch === '"' || ch === "'" || (ch === '`' && !css)) {
      const q = ch; i++;
      while (i < n && text[i] !== q) { if (text[i] === '\\') i++; if (text[i] === '\n') { if (q !== '`') break; line++; } i++; }
      i++; continue;
    }
    if (PAIRS[ch]) stack.push({ ch, line, col });
    else if (CLOSERS.has(ch)) {
      const top = stack.pop();
      if (!top) out.push({ path, line, col, severity: 'error', message: `Unexpected "${ch}" (nothing is open).` });
      else if (PAIRS[top.ch] !== ch) out.push({ path, line, col, severity: 'error', message: `"${ch}" does not match "${top.ch}" opened on line ${top.line}.` });
    }
    i++;
  }
  for (const s of stack) out.push({ path, line: s.line, col: s.col, severity: 'error', message: `"${s.ch}" is never closed.` });
  return out.slice(0, 20);
}

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'param']);
function html(path: string, text: string): Diagnostic[] {
  const out: Diagnostic[] = [];
  const scrubbed = text.replace(/<!--[\s\S]*?-->/g, (s) => s.replace(/[^\n]/g, ' ')).replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, (s) => { const open = /^<[^>]*>/.exec(s)![0]; const close = /<\/\w+>$/.exec(s)![0]; return open + s.slice(open.length, -close.length).replace(/[^\n]/g, ' ') + close; });
  const stack: { tag: string; line: number }[] = [];
  const ids = new Map<string, number>();
  const re = /<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(scrubbed))) {
    const line = scrubbed.slice(0, m.index).split('\n').length;
    const tag = m[2].toLowerCase();
    const id = /\sid\s*=\s*["']([^"']+)["']/.exec(m[3]);
    if (!m[1] && id) { if (ids.has(id[1])) out.push({ path, line, severity: 'warning', message: `Duplicate id "${id[1]}" (first used on line ${ids.get(id[1])}).` }); else ids.set(id[1], line); }
    if (VOID.has(tag) || m[4]) continue;
    if (!m[1]) { stack.push({ tag, line }); continue; }
    const k = stack.map((s) => s.tag).lastIndexOf(tag);
    if (k < 0) out.push({ path, line, severity: 'error', message: `</${tag}> has no matching opening tag.` });
    else { for (const s of stack.splice(k + 1)) if (!['p', 'li', 'td', 'tr', 'th', 'option', 'dd', 'dt'].includes(s.tag)) out.push({ path, line: s.line, severity: 'error', message: `<${s.tag}> is never closed.` }); stack.pop(); }
  }
  for (const s of stack) if (!['html', 'body', 'head', 'p', 'li', 'td', 'tr', 'th', 'option', 'dd', 'dt'].includes(s.tag)) out.push({ path, line: s.line, severity: 'error', message: `<${s.tag}> is never closed.` });
  for (const im of text.matchAll(/<img\b(?![^>]*\balt\s*=)[^>]*>/gi)) out.push({ path, line: text.slice(0, im.index).split('\n').length, severity: 'info', message: '<img> has no alt text (accessibility).' });
  if (/<html/i.test(text) && !/<meta[^>]+viewport/i.test(text)) out.push({ path, line: 1, severity: 'info', message: 'No <meta name="viewport">: the page will not be responsive on phones.' });
  return out.slice(0, 30);
}

function json(path: string, text: string): Diagnostic[] {
  if (!text.trim()) return [];
  try { JSON.parse(text); return []; } catch (e: any) {
    const m = /position (\d+)/.exec(String(e.message));
    const pos = m ? Number(m[1]) : 0;
    const before = text.slice(0, pos).split('\n');
    return [{ path, line: before.length, col: before[before.length - 1].length + 1, severity: 'error', message: 'Invalid JSON: ' + String(e.message).replace(/^JSON\.parse: /, '').slice(0, 140) }];
  }
}

export function diagnose(file: ProjectFile): Diagnostic[] {
  const lang = languageOf(file.path);
  const t = file.content;
  const out: Diagnostic[] = [];
  if (lang === 'json') out.push(...json(file.path, t));
  else if (lang === 'html' || lang === 'xml') out.push(...html(file.path, t));
  else if (lang === 'css' || lang === 'scss' || lang === 'less') out.push(...brackets(file.path, t, true));
  else if (['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'php', 'kotlin', 'swift', 'dart'].includes(lang)) out.push(...brackets(file.path, t, false));
  if (/\beval\s*\(/.test(t) && ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'].includes(lang)) out.push({ path: file.path, line: t.slice(0, t.search(/\beval\s*\(/)).split('\n').length, severity: 'warning', message: 'eval() runs text as code: a common security risk.' });
  if (/\.innerHTML\s*=/.test(t)) out.push({ path: file.path, line: t.slice(0, t.search(/\.innerHTML\s*=/)).split('\n').length, severity: 'warning', message: 'innerHTML with untrusted text allows XSS. Prefer textContent.' });
  if (/(api[_-]?key|secret|password)\s*[:=]\s*["'][^"']{8,}["']/i.test(t)) out.push({ path: file.path, line: t.split('\n').findIndex((l) => /(api[_-]?key|secret|password)\s*[:=]\s*["'][^"']{8,}["']/i.test(l)) + 1, severity: 'warning', message: 'Looks like a hard-coded secret. Keep secrets on the server (.env), never in source code.' });
  return out;
}

export const diagnoseAll = (files: ProjectFile[]): Diagnostic[] => files.flatMap(diagnose);
