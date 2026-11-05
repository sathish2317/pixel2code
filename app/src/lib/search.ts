import { ProjectFile } from '../types';

export interface SearchOpts { query: string; caseSensitive?: boolean; wholeWord?: boolean; regex?: boolean }
export interface Match { path: string; line: number; col: number; length: number; text: string }

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Builds the RegExp, or returns an error text (bad regex / empty). Guards against regexes that match the empty string. */
export function buildRegex(o: SearchOpts): { re?: RegExp; error?: string } {
  if (!o.query) return { error: 'Type something to search for.' };
  try {
    let src = o.regex ? o.query : esc(o.query);
    if (o.wholeWord) src = `\\b(?:${src})\\b`;
    const re = new RegExp(src, 'g' + (o.caseSensitive ? '' : 'i') + 'm');
    if (re.test('')) return { error: 'That pattern matches empty text. Make it more specific.' };
    re.lastIndex = 0;
    return { re };
  } catch (e: any) { return { error: 'Invalid pattern: ' + String(e.message).replace(/^Invalid regular expression: /, '') }; }
}

export function searchFiles(files: ProjectFile[], o: SearchOpts, max = 500): { matches: Match[]; truncated: boolean; error?: string } {
  const { re, error } = buildRegex(o);
  if (!re) return { matches: [], truncated: false, error };
  const matches: Match[] = [];
  for (const f of files) {
    const lines = f.content.split('\n');
    for (let i = 0; i < lines.length; i++) {
      re.lastIndex = 0;
      let m: RegExpExecArray | null;
      while ((m = re.exec(lines[i]))) {
        matches.push({ path: f.path, line: i + 1, col: m.index + 1, length: m[0].length, text: lines[i].slice(0, 240) });
        if (matches.length >= max) return { matches, truncated: true };
        if (m[0].length === 0) re.lastIndex++;
      }
    }
  }
  return { matches, truncated: false };
}

/** Replace in the given files (or one). Returns the new file list and how many replacements were made. */
export function replaceInFiles(files: ProjectFile[], o: SearchOpts, replacement: string, onlyPath?: string): { files: ProjectFile[]; count: number; changed: string[]; error?: string } {
  const { re, error } = buildRegex(o);
  if (!re) return { files, count: 0, changed: [], error };
  let count = 0;
  const changed: string[] = [];
  const out = files.map((f) => {
    if (onlyPath && f.path !== onlyPath) return f;
    let n = 0;
    const content = f.content.replace(re, (...a) => { n++; return o.regex ? expand(replacement, a) : replacement; });
    if (!n) return f;
    count += n; changed.push(f.path);
    return { ...f, content };
  });
  return { files: out, count, changed };
}

// expand $1, $&, $$ for regex mode
function expand(rep: string, a: any[]): string {
  const groups = a.slice(0, a.findIndex((x) => typeof x === 'number'));
  return rep.replace(/\$(\$|&|\d{1,2})/g, (_m, g) => (g === '$' ? '$' : g === '&' ? groups[0] : groups[Number(g)] ?? ''));
}
