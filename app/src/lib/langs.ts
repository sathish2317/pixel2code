// File type rules for the editor and "Attach Code". Mirrors server/src/filePolicy.js (keep both lists in sync).
export const LANGS: Record<string, string> = {
  html: 'html', htm: 'html', css: 'css', scss: 'scss', sass: 'sass', less: 'less', js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  jsx: 'javascriptreact', ts: 'typescript', tsx: 'typescriptreact', json: 'json', md: 'markdown', txt: 'plaintext', svg: 'xml', xml: 'xml',
  php: 'php', py: 'python', java: 'java', c: 'c', h: 'c', cpp: 'cpp', hpp: 'cpp', cc: 'cpp', cs: 'csharp', go: 'go', rs: 'rust', rb: 'ruby',
  sql: 'sql', yml: 'yaml', yaml: 'yaml', toml: 'toml', vue: 'html', svelte: 'html', kt: 'kotlin', swift: 'swift', dart: 'dart', env: 'plaintext',
  gitignore: 'plaintext', csv: 'plaintext',
};

/** Executables, installers and binaries are never accepted, even inside a ZIP. */
export const BLOCKED = new Set(['exe', 'dll', 'so', 'dylib', 'bin', 'msi', 'bat', 'cmd', 'com', 'scr', 'ps1', 'vbs', 'sh', 'bash', 'zsh', 'app', 'apk', 'ipa', 'jar', 'war', 'class', 'pyc', 'o', 'a', 'lib', 'deb', 'rpm', 'dmg', 'iso', 'docm', 'xlsm', 'lnk', 'reg', 'wasm']);

/** Pictures are not "code", but they are valid project files elsewhere in the app (Images tab), so they get their own message. */
export const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'ico', 'avif', 'bmp']);

export const LANGUAGE_NAMES: Record<string, string> = {
  html: 'HTML', css: 'CSS', scss: 'SCSS', sass: 'Sass', less: 'Less', javascript: 'JavaScript', javascriptreact: 'React JSX', typescript: 'TypeScript',
  typescriptreact: 'React TSX', json: 'JSON', markdown: 'Markdown', plaintext: 'Plain text', xml: 'XML/SVG', php: 'PHP', python: 'Python', java: 'Java',
  c: 'C', cpp: 'C++', csharp: 'C#', go: 'Go', rust: 'Rust', ruby: 'Ruby', sql: 'SQL', yaml: 'YAML', toml: 'TOML', kotlin: 'Kotlin', swift: 'Swift', dart: 'Dart',
};

export const MAX_FILE_BYTES = 1_000_000;
export const MAX_IMPORT_FILES = 500;
export const MAX_IMPORT_TOTAL_BYTES = 8_000_000;

export function extOf(path: string): string {
  const base = path.split('/').pop() || '';
  if (base.startsWith('.') && base.indexOf('.', 1) === -1) return base.slice(1).toLowerCase();
  const i = base.lastIndexOf('.');
  return i < 0 ? '' : base.slice(i + 1).toLowerCase();
}
export const languageOf = (path: string) => LANGS[extOf(path)] || 'plaintext';
export const languageName = (path: string) => LANGUAGE_NAMES[languageOf(path)] || 'Plain text';

/** Same rule as the server: relative, forward slashes, no "..", no empty/dot segments, plain characters. */
export function safePath(p: string): boolean {
  return typeof p === 'string' && p.length > 0 && p.length < 200 && !p.startsWith('/') && !p.endsWith('/') &&
    !p.split('/').some((s) => s === '..' || s === '.' || s === '') && !p.includes('\\') && /^[\w\-./ @+()]+$/.test(p);
}

/** Cleans a user-typed or archive path ("./a//b.js", "C:\x" -> rejected). Returns null if it cannot be made safe. */
export function sanitizePath(raw: string): string | null {
  let p = raw.replace(/\\/g, '/').replace(/^(\.\/)+/, '').replace(/\/{2,}/g, '/');
  if (/^[a-zA-Z]:/.test(p) || p.startsWith('/')) return null;
  p = p.replace(/\/$/, '');
  return safePath(p) ? p : null;
}

export type FileProblem = 'unsafe' | 'executable' | 'image' | 'unsupported' | 'binary' | 'toolarge' | 'encoding' | 'empty';

export function checkFileKind(path: string, bytes: number): { problem?: FileProblem; reason?: string } {
  if (!safePath(path)) return { problem: 'unsafe', reason: 'Unsafe or invalid path.' };
  const ext = extOf(path);
  if (BLOCKED.has(ext)) return { problem: 'executable', reason: `Executable or binary type (.${ext}) is never imported.` };
  if (IMAGE_EXT.has(ext)) return { problem: 'image', reason: 'Images belong in the Images tab, not the code editor.' };
  if (ext && !LANGS[ext]) return { problem: 'unsupported', reason: `Unsupported file type (.${ext}).` };
  if (bytes > MAX_FILE_BYTES) return { problem: 'toolarge', reason: `Larger than ${Math.round(MAX_FILE_BYTES / 1000)} KB.` };
  return {};
}

const MD_LIKE = new Set(['html', 'xml', 'markdown']);
/** Comment markers per language (for Ctrl+/). */
export function commentStyle(lang: string): { line?: string; block?: [string, string] } {
  if (['javascript', 'javascriptreact', 'typescript', 'typescriptreact', 'java', 'c', 'cpp', 'csharp', 'go', 'rust', 'kotlin', 'swift', 'dart', 'scss', 'less'].includes(lang)) return { line: '//' };
  if (['python', 'ruby', 'yaml', 'toml', 'plaintext'].includes(lang)) return { line: '#' };
  if (lang === 'php') return { line: '//' };
  if (lang === 'sql') return { line: '--' };
  if (lang === 'css') return { block: ['/*', '*/'] };
  if (MD_LIKE.has(lang)) return { block: ['<!--', '-->'] };
  return {};
}
