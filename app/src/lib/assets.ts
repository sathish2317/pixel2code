import JSZip from 'jszip';
import { AssetInfo, ProjectAsset, ProjectFile } from '../types';

/**
 * Everything about project IMAGES that does not need React Native, so it can be unit tested with plain Node.
 *
 * The idea: images live in the project as `assets` with an exact path (for example "images/hero/banner.jpg").
 * The generated HTML/CSS must point to exactly that path. This file can
 *   1. import a ZIP of images and give every file a clean, safe path,
 *   2. find every image reference in the code (<img src>, srcset, poster, CSS url(...), inline styles),
 *   3. tell which references are OK, fixable by name, still a placeholder, or missing,
 *   4. rewrite references to the right relative path, and
 *   5. embed the images into the preview (data: URIs) so the preview shows the same thing the exported site will.
 */

export const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|ico|avif|bmp)$/i;
const MEDIA_EXT = /\.(mp4|webm|ogv|ogg|mov|m4v|mp3|wav|m4a|aac)(\?|#|$)/i;
const FONT_EXT = /\.(woff2?|ttf|otf|eot)(\?|#|$)/i;

const MIME: Record<string, string> = {
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif',
  svg: 'image/svg+xml', ico: 'image/x-icon', avif: 'image/avif', bmp: 'image/bmp',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', eot: 'application/vnd.ms-fontobject',
};

// Plain code-point order (not localeCompare), so the order is the same on every device and language.
const byPath = (a: { path: string }, b: { path: string }): number => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0);

export const MAX_ASSET_BYTES = 8 * 1024 * 1024; // one image
export const MAX_ASSET_COUNT = 300;

export const mimeFromPath = (p: string): string => MIME[(p.split('.').pop() || '').toLowerCase()] || 'application/octet-stream';
export const assetBytes = (a: ProjectAsset): number => Math.floor((a.base64.length * 3) / 4);
export const totalBytes = (list: ProjectAsset[]): number => list.reduce((n, a) => n + assetBytes(a), 0);
export const dataUri = (a: ProjectAsset): string => `data:${a.mime};base64,${a.base64}`;
export const infoOf = (a: ProjectAsset, dims?: { width: number; height: number }): AssetInfo =>
  ({ path: a.path, mime: a.mime, bytes: assetBytes(a), ...(dims ? { width: dims.width, height: dims.height } : {}) });

export function formatBytes(n: number): string {
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(0) + ' KB';
  return (n / 1024 / 1024).toFixed(1) + ' MB';
}

// ---------------------------------------------------------------------------------------------
// Paths
// ---------------------------------------------------------------------------------------------

export const dirOf = (p: string): string => (p.includes('/') ? p.slice(0, p.lastIndexOf('/')) : '');
export const baseOf = (p: string): string => p.split('/').pop() || p;

/** Strips ?query and #hash, decodes %20, removes leading "./". Keeps leading "/" and "../" so callers can resolve. */
export function normalizeRef(ref: string): string {
  let r = ref.trim().replace(/[?#].*$/, '');
  try { r = decodeURIComponent(r); } catch { /* keep as is */ }
  while (r.startsWith('./')) r = r.slice(2);
  return r;
}

/** Resolves a reference written inside a file that lives in `fileDir` to a project-root-relative path. */
export function resolveFrom(fileDir: string, ref: string): string {
  const parts: string[] = ref.startsWith('/') ? [] : fileDir.split('/').filter(Boolean);
  for (const seg of ref.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/');
}

/** The relative path to write inside a file in `fromDir` to reach `toPath`. */
export function relativePath(fromDir: string, toPath: string): string {
  const a = fromDir.split('/').filter(Boolean);
  const b = toPath.split('/').filter(Boolean);
  let i = 0;
  while (i < a.length && i < b.length - 1 && a[i] === b[i]) i++;
  return '../'.repeat(a.length - i) + b.slice(i).join('/');
}

function cleanSegment(seg: string): string {
  return seg
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/-+\./g, '.') // "My Photo (1).png" -> "My-Photo-1.png", not "My-Photo-1-.png"
    .replace(/\.-+/g, '.')
    .replace(/^[-.]+|-+$/g, '')
    .slice(0, 80);
}

/** Safe, web-friendly path for a file from a ZIP. Returns null if the path is unsafe or hidden. */
export function sanitizeAssetPath(raw: string, prefix: string, sanitize = true): string | null {
  const segs = raw.replace(/\\/g, '/').split('/').filter((s) => s !== '' && s !== '.');
  if (!segs.length || segs.some((s) => s === '..' || s.startsWith('.') || s === '__MACOSX')) return null;
  const out = sanitize ? segs.map(cleanSegment) : segs;
  if (out.some((s) => !s || s.length > 120)) return null;
  let path = out.join('/');
  if (/^[a-zA-Z]:/.test(path) || path.length > 200) return null;
  if (prefix && !path.toLowerCase().startsWith(prefix.toLowerCase())) path = prefix + path;
  return path;
}

// ---------------------------------------------------------------------------------------------
// Importing images from a ZIP
// ---------------------------------------------------------------------------------------------

export interface ZipImport {
  assets: ProjectAsset[];
  skipped: { name: string; reason: string }[];
  ignored: number; // non-image files that were simply not images (docs, folders' metadata ...)
}

export async function readZip(data: ArrayBuffer | Uint8Array): Promise<JSZip> {
  return JSZip.loadAsync(data);
}

/**
 * Collects the images of an already opened ZIP.
 * prefix "images/": every image goes under images/ (keeps the ZIP's own sub-folders).
 * sanitize=false keeps paths exactly (used when importing a whole project ZIP).
 */
export async function collectAssets(
  zip: JSZip,
  opts: { prefix: string; sanitize: boolean; maxTotalBytes: number; stripTop?: boolean }
): Promise<ZipImport> {
  const entries = Object.values(zip.files).filter((f) => !f.dir && !/(^|\/)(__MACOSX|\.DS_Store|Thumbs\.db)(\/|$)/.test(f.name));
  const names = entries.map((e) => e.name);
  const top = names[0]?.split('/')[0];
  const strip = opts.stripTop !== false && top && names.length > 0 && names.every((n) => n.startsWith(top + '/')) ? top + '/' : '';

  const res: ZipImport = { assets: [], skipped: [], ignored: 0 };
  const used = new Set<string>();
  let total = 0;
  for (const e of entries) {
    const rel = e.name.slice(strip.length);
    if (!IMAGE_EXT.test(rel)) { res.ignored++; continue; }
    if (res.assets.length >= MAX_ASSET_COUNT) { res.skipped.push({ name: rel, reason: `more than ${MAX_ASSET_COUNT} images` }); continue; }
    let path = sanitizeAssetPath(rel, opts.prefix, opts.sanitize);
    if (!path) { res.skipped.push({ name: rel, reason: 'unsafe or hidden file name' }); continue; }
    // Different files may collapse to one name after cleaning (or differ only by case): keep both, add -2, -3 ...
    if (used.has(path.toLowerCase())) {
      const dot = path.lastIndexOf('.');
      let n = 2;
      while (used.has((path.slice(0, dot) + '-' + n + path.slice(dot)).toLowerCase())) n++;
      path = path.slice(0, dot) + '-' + n + path.slice(dot);
    }
    const declared = (e as any)._data?.uncompressedSize;
    if (typeof declared === 'number' && declared > MAX_ASSET_BYTES) { res.skipped.push({ name: rel, reason: 'bigger than 8 MB' }); continue; }
    const base64 = await e.async('base64');
    const size = Math.floor((base64.length * 3) / 4);
    if (size > MAX_ASSET_BYTES) { res.skipped.push({ name: rel, reason: 'bigger than 8 MB' }); continue; }
    if (total + size > opts.maxTotalBytes) { res.skipped.push({ name: rel, reason: 'storage limit for images reached' }); continue; }
    total += size;
    used.add(path.toLowerCase());
    res.assets.push({ path, mime: mimeFromPath(path), base64 });
  }
  res.assets.sort(byPath);
  return res;
}

export async function assetsFromZip(data: ArrayBuffer | Uint8Array, opts: { prefix: string; sanitize: boolean; maxTotalBytes: number }): Promise<ZipImport> {
  return collectAssets(await readZip(data), opts);
}

/** Merges new assets into old ones. Same path = replaced. */
export function mergeAssets(old: ProjectAsset[], add: ProjectAsset[]): ProjectAsset[] {
  const map = new Map(old.map((a) => [a.path, a]));
  for (const a of add) map.set(a.path, a);
  return [...map.values()].sort(byPath);
}

// ---------------------------------------------------------------------------------------------
// Finding and rewriting image references
// ---------------------------------------------------------------------------------------------

const PLACEHOLDER_HOSTS = /^(?:https?:)?\/\/(?:[\w-]+\.)*(?:picsum\.photos|placehold\.co|placehold\.it|via\.placeholder\.com|placeholder\.com|dummyimage\.com|loremflickr\.com|placeimg\.com|fakeimg\.pl|lorempixel\.com|source\.unsplash\.com|images\.unsplash\.com)\b/i;

export const isPlaceholderUrl = (ref: string): boolean => PLACEHOLDER_HOSTS.test(ref.trim());
export const isExternal = (ref: string): boolean => /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(ref.trim());
const isIgnorable = (ref: string): boolean => {
  const r = ref.trim();
  return !r || r.startsWith('#') || /^(?:data|javascript|mailto|tel|blob|about):/i.test(r);
};

type RefFn = (ref: string) => string | undefined;

const CSS_URL = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)\s"']+))\s*\)/gi;

function mapCss(css: string, fn: RefFn, fonts = false): string {
  return css.replace(CSS_URL, (m, dq, sq, bare) => {
    const val: string = dq ?? sq ?? bare ?? '';
    if (isIgnorable(val) || (!fonts && FONT_EXT.test(val))) return m;
    const out = fn(val);
    if (out === undefined || out === val) return m;
    const q = dq !== undefined ? '"' : sq !== undefined ? "'" : '';
    return `url(${q}${out}${q})`;
  });
}

const ATTR = /(\s)([a-zA-Z_:][\w:.-]*)(\s*=\s*)(?:"([^"]*)"|'([^']*)')/g;
const LAZY = new Set(['data-src', 'data-lazy-src', 'data-original', 'data-bg', 'data-background', 'data-image']);

function mapTag(tag: string, attrs: string, fn: RefFn, fonts = false): string {
  return attrs.replace(ATTR, (m, ws, name, eq, dq, sq) => {
    const val: string = dq !== undefined ? dq : sq;
    const q = dq !== undefined ? '"' : "'";
    const n = name.toLowerCase();
    const put = (nv: string) => `${ws}${name}${eq}${q}${nv}${q}`;
    const one = (v: string): string | undefined => (isIgnorable(v) || MEDIA_EXT.test(v) || FONT_EXT.test(v) ? undefined : fn(v));

    if (n === 'src') {
      if (tag === 'input' && !/\btype\s*=\s*["']?image/i.test(attrs)) return m;
      if (tag !== 'img' && tag !== 'source' && tag !== 'input' && tag !== 'image') return m;
      const out = one(val); return out === undefined ? m : put(out);
    }
    if (LAZY.has(n) || n === 'poster') { const out = one(val); return out === undefined ? m : put(out); }
    if (n === 'srcset' || n === 'data-srcset') {
      let changed = false;
      const parts = val.split(',').map((cand) => {
        const t = cand.trim();
        if (!t) return cand;
        const [url, ...desc] = t.split(/\s+/);
        const out = one(url);
        if (out === undefined) return cand;
        changed = true;
        return [out, ...desc].join(' ');
      });
      return changed ? put(parts.join(', ')) : m;
    }
    if (n === 'href' && tag === 'link' && /\brel\s*=\s*["'][^"']*icon/i.test(attrs)) { const out = one(val); return out === undefined ? m : put(out); }
    if (n === 'style' && /url\(/i.test(val)) { const out = mapCss(val, fn, fonts); return out === val ? m : put(out); }
    return m;
  });
}

/** Calls fn for every image reference of an html or css text; fn may return a replacement. Returns the new text. */
export function mapRefs(content: string, kind: 'html' | 'css', fn: RefFn, fonts = false): string {
  if (kind === 'css') return mapCss(content, fn, fonts);
  let html = content.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (_m, a, css, b) => a + mapCss(css, fn, fonts) + b);
  html = html.replace(/<([a-zA-Z][\w-]*)\b([^>]*)>/g, (m, tag, attrs) => {
    const out = mapTag(String(tag).toLowerCase(), attrs, fn, fonts);
    return out === attrs ? m : `<${tag}${out}>`;
  });
  return html;
}

const kindOf = (path: string): 'html' | 'css' | null => (/\.html?$/i.test(path) ? 'html' : /\.css$/i.test(path) ? 'css' : null);

// ---- matching a written reference to a real asset ----

const looseKey = (p: string): string => baseOf(p).replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]/g, '');

/** Exact and correct: the reference, read from `fileDir`, points to an existing asset path. */
export function exactAsset(fileDir: string, ref: string, assets: { path: string }[]): string | undefined {
  const n = normalizeRef(ref);
  if (!n || n.startsWith('/')) return undefined; // absolute paths break when the file is opened by double-click
  const target = resolveFrom(fileDir, n);
  return assets.find((a) => a.path === target)?.path;
}

/** Forgiving match (case, missing folder, spaces/underscores, different folder). Returns undefined when it would be a guess. */
export function fuzzyAsset(ref: string, assets: { path: string }[]): string | undefined {
  const n = normalizeRef(ref).replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');
  if (!n) return undefined;
  const low = n.toLowerCase();
  const byPath = assets.filter((a) => a.path.toLowerCase() === low || a.path.toLowerCase().endsWith('/' + low));
  if (byPath.length === 1) return byPath[0].path;
  const bn = baseOf(low);
  const byBase = assets.filter((a) => baseOf(a.path).toLowerCase() === bn);
  if (byBase.length === 1) return byBase[0].path;
  if (byBase.length > 1) {
    const deep = byBase.filter((a) => a.path.toLowerCase().endsWith(low));
    return deep.length === 1 ? deep[0].path : undefined;
  }
  const key = looseKey(low);
  if (!key) return undefined;
  const byKey = assets.filter((a) => looseKey(a.path) === key);
  return byKey.length === 1 ? byKey[0].path : undefined;
}

export type RefStatus = 'ok' | 'fixable' | 'placeholder' | 'missing';
export interface RefReport {
  file: string;
  ref: string;
  status: RefStatus;
  target?: string; // asset path for ok / fixable
}

function classify(fileDir: string, ref: string, assets: { path: string }[]): { status: RefStatus; target?: string } | null {
  const ex = exactAsset(fileDir, ref, assets);
  if (ex) return { status: 'ok', target: ex };
  if (isPlaceholderUrl(ref)) return { status: 'placeholder' };
  if (isExternal(ref)) return null; // a real remote image or CDN: not our business
  const fz = fuzzyAsset(ref, assets);
  if (fz) return { status: 'fixable', target: fz };
  return { status: 'missing' };
}

/** Every image reference found in html/css files with its status. */
export function analyzeRefs(files: ProjectFile[], assets: { path: string }[]): RefReport[] {
  const out: RefReport[] = [];
  const seen = new Set<string>();
  for (const f of files) {
    const kind = kindOf(f.path);
    if (!kind) continue;
    mapRefs(f.content, kind, (ref) => {
      const key = f.path + '\u0000' + ref;
      if (seen.has(key)) return undefined;
      seen.add(key);
      const c = classify(dirOf(f.path), ref, assets);
      if (c) out.push({ file: f.path, ref, status: c.status, target: c.target });
      return undefined;
    });
  }
  return out;
}

/** Rewrites every fixable reference to the correct relative path. Placeholders and missing ones are left alone. */
export function fixRefs(files: ProjectFile[], assets: { path: string }[]): { files: ProjectFile[]; fixed: number } {
  let fixed = 0;
  const next = files.map((f) => {
    const kind = kindOf(f.path);
    if (!kind) return f;
    const content = mapRefs(f.content, kind, (ref) => {
      const c = classify(dirOf(f.path), ref, assets);
      if (!c || c.status !== 'fixable' || !c.target) return undefined;
      fixed++;
      return relativePath(dirOf(f.path), c.target);
    });
    return content === f.content ? f : { ...f, content };
  });
  return { files: next, fixed };
}

/** Points every occurrence of `oldRef` in one file to the chosen asset (manual mapping). */
export function remapRef(files: ProjectFile[], filePath: string, oldRef: string, assetPath: string): ProjectFile[] {
  return files.map((f) => {
    const kind = kindOf(f.path);
    if (f.path !== filePath || !kind) return f;
    const content = mapRefs(f.content, kind, (ref) => (ref === oldRef ? relativePath(dirOf(f.path), assetPath) : undefined));
    return content === f.content ? f : { ...f, content };
  });
}

/** Assets that no reference points to (exactly or by name). */
export function unusedAssets<T extends { path: string }>(files: ProjectFile[], assets: T[]): T[] {
  const used = new Set<string>();
  for (const r of analyzeRefs(files, assets)) if (r.target) used.add(r.target);
  // JS files can also name images (carousel arrays). A plain text search keeps those from being reported as unused.
  const js = files.filter((f) => /\.(js|json)$/i.test(f.path)).map((f) => f.content).join('\n');
  return assets.filter((a) => !used.has(a.path) && !js.includes(baseOf(a.path)));
}

/** Preview helper: when a CSS file is inlined into index.html, its url(...) must still be read from the CSS file's own folder. */
export function rebaseCss(css: string, cssPath: string): string {
  const dir = dirOf(cssPath);
  if (!dir) return css;
  return mapRefs(css, 'css', (ref) => {
    if (isExternal(ref)) return undefined;
    const n = normalizeRef(ref);
    if (n.startsWith('/')) return undefined;
    return resolveFrom(dir, n);
  }, true); // fonts too: @font-face url(../fonts/x.woff2) must still be read from the CSS file's own folder
}

/** Preview: replaces references that point exactly to an asset with a data: URI. Wrong references stay broken (like in the real site). */
export function inlineAssets(html: string, assets: ProjectAsset[]): string {
  if (!assets.length) return html;
  const byPath = new Map(assets.map((a) => [a.path, a]));
  return mapRefs(html, 'html', (ref) => {
    if (isExternal(ref)) return undefined;
    const n = normalizeRef(ref);
    if (n.startsWith('/')) return undefined;
    const a = byPath.get(resolveFrom('', n));
    return a ? dataUri(a) : undefined;
  }, true); // fonts inside <style> blocks and style="" attributes are embedded too
}

/**
 * Preview lookup of a written reference. Tries the exact path first, then the same path ignoring upper/lower case
 * (a ZIP made on Windows/macOS often says "Images/Logo.PNG" for "images/logo.png"), then a unique file-name match.
 * `roots` are the folders the reference may be relative to (tried in order).
 */
export function findPreviewAsset<T extends { path: string }>(ref: string, roots: string[], assets: T[]): T | undefined {
  if (isExternal(ref) || isIgnorable(ref)) return undefined;
  const n = normalizeRef(ref);
  if (!n) return undefined;
  const targets = [...new Set([...roots.map((r) => resolveFrom(r, n)), resolveFrom('', n)])];
  for (const t of targets) { const a = assets.find((x) => x.path === t); if (a) return a; }
  for (const t of targets) { const a = assets.find((x) => x.path.toLowerCase() === t.toLowerCase()); if (a) return a; }
  const hit = fuzzyAsset(n, assets);
  return hit ? assets.find((x) => x.path === hit) : undefined;
}