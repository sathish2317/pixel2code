// What the server accepts as project files. Mirrored by app/src/lib/langs.ts (keep both lists in sync).
const path = require('path');
const { HttpError } = require('./errors');

const LANGS = {
  html: 'html', htm: 'html', css: 'css', scss: 'scss', sass: 'sass', less: 'less', js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  jsx: 'javascriptreact', ts: 'typescript', tsx: 'typescriptreact', json: 'json', md: 'markdown', txt: 'plaintext', svg: 'xml', xml: 'xml',
  php: 'php', py: 'python', java: 'java', c: 'c', h: 'c', cpp: 'cpp', hpp: 'cpp', cc: 'cpp', cs: 'csharp', go: 'go', rs: 'rust', rb: 'ruby',
  sql: 'sql', yml: 'yaml', yaml: 'yaml', toml: 'toml', vue: 'html', svelte: 'html', kt: 'kotlin', swift: 'swift', dart: 'dart', env: 'plaintext',
  gitignore: 'plaintext', csv: 'plaintext',
};
// Executables, installers, archives-in-archives, scripts that run on their own, and binaries are never accepted.
const BLOCKED = new Set(['exe', 'dll', 'so', 'dylib', 'bin', 'msi', 'bat', 'cmd', 'com', 'scr', 'ps1', 'vbs', 'sh', 'bash', 'zsh', 'app', 'apk', 'ipa', 'jar', 'war', 'class', 'pyc', 'o', 'a', 'lib', 'deb', 'rpm', 'dmg', 'iso', 'docm', 'xlsm', 'lnk', 'reg', 'wasm']);

const extOf = (p) => {
  const base = path.posix.basename(p);
  if (base.startsWith('.') && base.indexOf('.', 1) === -1) return base.slice(1).toLowerCase(); // .gitignore
  const i = base.lastIndexOf('.');
  return i < 0 ? '' : base.slice(i + 1).toLowerCase();
};
const languageOf = (p) => LANGS[extOf(p)] || 'plaintext';

function safePath(p) {
  return typeof p === 'string' && p.length > 0 && p.length < 200 && !p.startsWith('/') && !p.endsWith('/') &&
    !p.split('/').some((s) => s === '..' || s === '.' || s === '') && !p.includes('\\') && /^[\w\-./ @+()]+$/.test(p);
}

/** Returns an error string or null. */
function checkFile(f, limits) {
  if (!f || !safePath(f.path)) return 'Unsafe or invalid file path.';
  const ext = extOf(f.path);
  if (BLOCKED.has(ext)) return `Executable or binary file type (.${ext}) is not accepted.`;
  if (ext && !LANGS[ext]) return `Unsupported file type (.${ext}).`;
  if (typeof f.content !== 'string') return 'File content must be text.';
  if (f.content.includes('\u0000')) return 'File contains binary data (NUL bytes).';
  if (Buffer.byteLength(f.content) > limits.fileBytes) return `File is larger than ${Math.round(limits.fileBytes / 1000)} KB.`;
  return null;
}

function assertFile(f, limits) {
  const err = checkFile(f, limits);
  if (err) throw new HttpError(400, `${f && f.path ? f.path + ': ' : ''}${err}`);
  return { path: f.path, content: f.content };
}

module.exports = { LANGS, BLOCKED, extOf, languageOf, safePath, checkFile, assertFile };
