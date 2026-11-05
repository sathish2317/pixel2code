// Small regex tokenizer for the built-in editor. Output is HTML with <span class="p2c-X"> wrappers.
// INVARIANT (tested): removing the tags and un-escaping gives back exactly the input text, so the colored layer
// always lines up character-for-character with the textarea above it.
type Rule = [cls: string, re: string];

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const words = (w: string) => `\\b(?:${w.trim().split(/\s+/).join('|')})\\b`;

const JS_KW = 'break case catch class const continue debugger default delete do else enum export extends finally for function if import in instanceof let new of return static super switch throw try typeof var void while with yield async await from as get set interface type implements private public protected readonly namespace declare abstract';
const JS_LIT = 'true false null undefined this NaN Infinity';
const C_KW = 'abstract auto bool break case catch char class const continue default delete do double else enum extern final finally float for friend goto if implements import inline int interface long namespace new operator override package private protected public register return short signed sizeof static struct super switch template this throw throws try typedef typename union unsigned using virtual void volatile while fn let mut impl trait pub use mod match loop func go defer chan select range var val fun when object string';
const PY_KW = 'and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield match case self end do then unless begin module require def';
const PHP_KW = 'abstract and array as break callable case catch class clone const continue declare default do echo else elseif empty enddeclare endfor endforeach endif endswitch endwhile extends final finally fn for foreach function global if implements include include_once instanceof insteadof interface isset list namespace new or print private protected public require require_once return static switch throw trait try unset use var while xor yield';
const SQL_KW = 'select from where insert into values update set delete create table alter drop index view join inner outer left right full on group by order having limit offset union all distinct as and or not null is in like between exists case when then else end primary key foreign references default unique constraint check autoincrement auto_increment int integer varchar text boolean date timestamp begin commit rollback';

const STR = `"(?:\\\\[\\s\\S]|[^"\\\\\\n])*"?|'(?:\\\\[\\s\\S]|[^'\\\\\\n])*'?`;
const TPL = '`(?:\\\\[\\s\\S]|[^`\\\\])*`?';
const NUM = '\\b(?:0[xX][\\da-fA-F]+|\\d[\\d_]*\\.?\\d*(?:[eE][+-]?\\d+)?)\\b';

const RULES: Record<string, Rule[]> = {
  js: [['c', '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?(?:\\*\\/|$)'], ['s', STR + '|' + TPL], ['n', NUM], ['k', words(JS_KW)], ['l', words(JS_LIT)], ['f', '\\b[A-Za-z_$][\\w$]*(?=\\s*\\()'], ['t', '\\b[A-Z][\\w$]*\\b']],
  c: [['c', '\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?(?:\\*\\/|$)|^[ \\t]*#[^\\n]*'], ['s', STR], ['n', NUM], ['k', words(C_KW)], ['l', words('true false null nil NULL nullptr None')], ['f', '\\b[A-Za-z_][\\w]*(?=\\s*\\()'], ['t', '\\b[A-Z][\\w]*\\b']],
  php: [['c', '\\/\\/[^\\n]*|#[^\\n]*|\\/\\*[\\s\\S]*?(?:\\*\\/|$)'], ['s', STR], ['n', NUM], ['v', '\\$[A-Za-z_]\\w*'], ['k', words(PHP_KW)], ['l', words('true false null TRUE FALSE NULL')], ['f', '\\b[A-Za-z_]\\w*(?=\\s*\\()'], ['t', '<\\?php|\\?>']],
  py: [['c', '#[^\\n]*'], ['s', '(?:"""[\\s\\S]*?(?:"""|$)|\'\'\'[\\s\\S]*?(?:\'\'\'|$))|' + STR], ['n', NUM], ['k', words(PY_KW)], ['l', words('True False None true false nil null')], ['f', '\\b[A-Za-z_]\\w*(?=\\s*\\()'], ['t', '\\b[A-Z]\\w*\\b']],
  sql: [['c', '--[^\\n]*|\\/\\*[\\s\\S]*?(?:\\*\\/|$)'], ['s', "'(?:''|[^'])*'?"], ['n', NUM], ['k', '\\b(?:' + SQL_KW.split(' ').join('|') + ')\\b(?<!\\w)'], ['f', '\\b[A-Za-z_]\\w*(?=\\s*\\()']],
  css: [['c', '\\/\\*[\\s\\S]*?(?:\\*\\/|$)'], ['s', STR], ['k', '@[\\w-]+'], ['v', '#[\\da-fA-F]{3,8}\\b'], ['n', '-?\\b\\d*\\.?\\d+(?:px|em|rem|%|vh|vw|vmin|vmax|s|ms|deg|fr|ch)?\\b'], ['p', '[\\w-]+(?=\\s*:(?!:))'], ['t', '(?:[.#][\\w-]+)']],
  json: [['p', '"(?:\\\\.|[^"\\\\\\n])*"(?=\\s*:)'], ['s', STR], ['n', '-?\\b\\d+\\.?\\d*(?:[eE][+-]?\\d+)?\\b'], ['l', words('true false null')]],
  yaml: [['c', '#[^\\n]*'], ['p', '^[ \\t-]*[\\w.-]+(?=\\s*:)'], ['s', STR], ['n', NUM], ['l', words('true false null yes no')]],
};
const LANG_GROUP: Record<string, string> = {
  javascript: 'js', javascriptreact: 'js', typescript: 'js', typescriptreact: 'js', java: 'c', c: 'c', cpp: 'c', csharp: 'c', go: 'c', rust: 'c', kotlin: 'c', swift: 'c', dart: 'c',
  php: 'php', python: 'py', ruby: 'py', sql: 'sql', css: 'css', scss: 'css', less: 'css', json: 'json', yaml: 'yaml', toml: 'yaml',
};

const cache = new Map<string, RegExp>();
function compile(group: string): { re: RegExp; classes: string[] } {
  const rules = RULES[group];
  let re = cache.get(group);
  if (!re) { re = new RegExp(rules.map(([, r]) => `(${r})`).join('|'), 'gm'); cache.set(group, re); }
  return { re, classes: rules.map(([c]) => c) };
}

function scan(code: string, group: string): string {
  const { re, classes } = compile(group);
  re.lastIndex = 0;
  let out = '', last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    if (m[0] === '') { re.lastIndex++; continue; }
    let k = 1;
    while (k < m.length && m[k] === undefined) k++;
    out += esc(code.slice(last, m.index)) + `<span class="p2c-${classes[k - 1]}">${esc(m[0])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(code.slice(last));
}

function markup(code: string): string {
  // tags, comments, embedded <style>/<script> bodies (highlighted as CSS/JS)
  const re = /<!--[\s\S]*?(?:-->|$)|<(style|script)\b[^>]*>[\s\S]*?(?:<\/\1\s*>|$)|<\/?[A-Za-z][\w:-]*(?:"[^"]*"|'[^']*'|[^>"'])*>?|&#?\w+;/g;
  let out = '', last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    last = m.index + m[0].length;
    const t = m[0];
    if (t.startsWith('<!--')) out += `<span class="p2c-c">${esc(t)}</span>`;
    else if (t[0] === '&') out += `<span class="p2c-n">${esc(t)}</span>`;
    else if (m[1]) {
      const open = /^<[^>]*>/.exec(t)![0];
      const closeM = new RegExp(`<\\/${m[1]}\\s*>$`, 'i').exec(t);
      const close = closeM ? closeM[0] : '';
      const body = t.slice(open.length, t.length - close.length);
      out += tag(open) + (m[1] === 'style' ? scan(body, 'css') : scan(body, 'js')) + (close ? tag(close) : '');
    } else out += tag(t);
  }
  return out + esc(code.slice(last));
}
function tag(t: string): string {
  const name = /^<\/?[A-Za-z][\w:-]*/.exec(t);
  if (!name) return esc(t);
  let out = `<span class="p2c-k">${esc(name[0])}</span>`;
  const rest = t.slice(name[0].length);
  const re = /("[^"]*"?|'[^']*'?)|([A-Za-z_:@][\w:.-]*)(?=\s*=|\s|\/?>|$)/g;
  let last = 0, m: RegExpExecArray | null;
  while ((m = re.exec(rest))) {
    out += esc(rest.slice(last, m.index));
    out += m[1] ? `<span class="p2c-s">${esc(m[1])}</span>` : `<span class="p2c-p">${esc(m[2])}</span>`;
    last = m.index + m[0].length;
  }
  return out + esc(rest.slice(last));
}

export const HIGHLIGHT_LIMIT = 250_000; // characters; above this the editor shows plain text (keeps typing fast)

export function highlight(code: string, language: string): string {
  if (code.length > HIGHLIGHT_LIMIT) return esc(code);
  if (language === 'html' || language === 'xml') return markup(code);
  const g = LANG_GROUP[language];
  return g ? scan(code, g) : esc(code);
}

export const highlightCss = (dark: boolean, vscode = false) => {
  const c = vscode && dark
    ? { c: '#6a9955', s: '#ce9178', n: '#b5cea8', k: '#569cd6', l: '#569cd6', f: '#dcdcaa', t: '#4ec9b0', v: '#9cdcfe', p: '#9cdcfe' }
    : vscode
    ? { c: '#008000', s: '#a31515', n: '#098658', k: '#0000ff', l: '#0000ff', f: '#795e26', t: '#267f99', v: '#001080', p: '#e50000' }
    : dark
    ? { c: '#6b7694', s: '#a5e075', n: '#f3a76a', k: '#c792ea', l: '#f78c6c', f: '#82aaff', t: '#ffcb6b', v: '#89ddff', p: '#7fdbca' }
    : { c: '#7a8299', s: '#2e7d32', n: '#b4510c', k: '#7b3fb8', l: '#c2410c', f: '#1d4ed8', t: '#8a5a00', v: '#0369a1', p: '#0f766e' };
  return Object.entries(c).map(([k, v]) => `.p2c-${k}{color:${v}}`).join('') + '.p2c-c{font-style:italic}';
};