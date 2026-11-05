import { ProjectFile } from '../types';
import { diagnoseAll } from './diagnostics';

export interface DesignToken {
  name: string;
  value: string;
  kind: 'color' | 'font' | 'spacing' | 'radius';
  count: number;
}

const uniqueCount = (values: string[]) => {
  const m = new Map<string, number>();
  values.forEach((v) => m.set(v, (m.get(v) || 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
};

export function extractDesignTokens(files: ProjectFile[]): DesignToken[] {
  const css = files.filter((f) => /\.(css|scss|html|tsx|jsx|vue)$/i.test(f.path)).map((f) => f.content).join('\n');
  const colors = [...css.matchAll(/#[\da-f]{3,8}\b|rgba?\(\s*[\d.% ,/]+\)|hsla?\([^)]*\)|\b(?:black|white|navy|teal|tomato|rebeccapurple|transparent)\b/gi)].map((m) => m[0].toLowerCase());
  const fonts = [...css.matchAll(/font-family\s*:\s*([^;{}]+)/gi)].map((m) => m[1].trim().replace(/^['"]|['"]$/g, ''));
  const spacing = [...css.matchAll(/(?:margin|padding|gap|inset|row-gap|column-gap)(?:-[a-z]+)?\s*:\s*(-?\d+(?:\.\d+)?(?:px|rem|em|vw|vh))/gi)].map((m) => m[1]);
  const radii = [...css.matchAll(/border-radius\s*:\s*([\d.]+(?:px|rem|em|%))/gi)].map((m) => m[1]);
  const out: DesignToken[] = [];
  const add = (kind: DesignToken['kind'], values: string[], prefix: string) => {
    uniqueCount(values).slice(0, 12).forEach(([value, count], i) => out.push({ name: `--p2c-${prefix}-${i + 1}`, value, kind, count }));
  };
  add('color', colors, 'color');
  add('font', fonts, 'font');
  add('spacing', spacing, 'space');
  add('radius', radii, 'radius');
  return out;
}

export function tokensToCss(tokens: DesignToken[]): string {
  return `:root {\n${tokens.map((t) => `  ${t.name}: ${t.kind === 'font' ? t.value : t.value}; /* ${t.kind}; found ${t.count}x */`).join('\n')}\n}\n`;
}

export type FixId = 'lang' | 'viewport' | 'charset' | 'title' | 'alt' | 'button-type' | 'lazy' | 'noopener' | 'reduced-motion';

export interface QualityIssue {
  severity: 'error' | 'warning' | 'tip';
  title: string;
  detail: string;
  file?: string;
  /** Line in `file` (1-based) when we can point at it. */
  line?: number;
  /** Which area of the spec checklist this belongs to. */
  area?: 'html' | 'css' | 'js' | 'assets' | 'links' | 'responsive' | 'a11y' | 'seo' | 'performance';
  /** Set when "Fix all (safe)" can repair it automatically. */
  fix?: FixId;
  /** Short, concrete suggestion. */
  suggestion?: string;
}

// ---------------------------------------------------------------- helpers

const isHtml = (p: string) => /\.html?$/i.test(p);
const isCss = (p: string) => /\.css$/i.test(p);
const isJs = (p: string) => /\.(m?js|jsx|ts|tsx)$/i.test(p);
export const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr', 'param']);
const BALANCED = new Set(['div', 'section', 'header', 'footer', 'nav', 'main', 'aside', 'article', 'ul', 'ol', 'form', 'table', 'a', 'button', 'span', 'figure', 'select', 'textarea']);

// A tag outside of quotes. Attribute values may contain ">" so quoted parts are matched whole.
export const TAG_RE = /<\/?[a-zA-Z][\w:-]*(?:"[^"]*"|'[^']*'|[^>"'])*>/g;
// Parts of an HTML file whose insides are not markup.
const PROTECTED_RE = /(<!--[\s\S]*?-->|<script\b[\s\S]*?<\/script\s*>|<style\b[\s\S]*?<\/style\s*>)/gi;

export const hasAttr = (tag: string, name: string) => new RegExp(`\\s${name}(?=\\s*=|\\s|/?>)`, 'i').test(tag);
export const getAttr = (tag: string, name: string): string | undefined => {
  const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
  return m ? (m[1] ?? m[2] ?? m[3] ?? '') : undefined;
};
export const tagName = (tag: string) => (tag.match(/^<\/?([a-zA-Z][\w:-]*)/)?.[1] || '').toLowerCase();
const lineAt = (text: string, index: number) => text.slice(0, index).split('\n').length;
const humanize = (src: string) => (src.split(/[?#]/)[0].split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '').replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();

interface TagHit { raw: string; name: string; closing: boolean; index: number }

/** Every tag of an HTML text that is real markup (not inside comments, scripts or styles). */
function scanTags(html: string): TagHit[] {
  const out: TagHit[] = [];
  let base = 0;
  for (const part of html.split(PROTECTED_RE)) {
    if (!/^<!--|^<script|^<style/i.test(part)) {
      for (const m of part.matchAll(TAG_RE)) out.push({ raw: m[0], name: tagName(m[0]), closing: m[0][1] === '/', index: base + (m.index ?? 0) });
    }
    base += part.length;
  }
  return out;
}

const SKIP_REF = /^(?:[a-z][a-z0-9+.-]*:|\/\/|#|\{\{|<\?|\$\{|%)/i;

/** Resolves a reference (src/href/url()) from a file to a project path, or null when it is not a local file. */
export function resolveLocal(from: string, ref: string): string | null {
  let r = ref.trim();
  if (!r || SKIP_REF.test(r)) return null;
  r = r.split(/[?#]/)[0];
  try { r = decodeURIComponent(r); } catch { /* keep as is */ }
  const parts = r.startsWith('/') ? [] : from.split('/').slice(0, -1);
  for (const seg of r.split('/')) {
    if (!seg || seg === '.') continue;
    if (seg === '..') parts.pop(); else parts.push(seg);
  }
  return parts.join('/');
}

/** Removes the contents of every @media/@supports/@keyframes block so only top-level rules remain. */
function topLevelCss(css: string): string {
  const src = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let out = '', depth = 0, i = 0;
  while (i < src.length) {
    const at = src.slice(i).match(/^@(?:media|supports|keyframes|-webkit-keyframes|font-face|layer|container)[^{]*\{/i);
    if (depth === 0 && at) {
      let d = 1; i += at[0].length;
      while (i < src.length && d > 0) { if (src[i] === '{') d++; else if (src[i] === '}') d--; i++; }
      continue;
    }
    out += src[i]; i++;
  }
  return out;
}

// ---------------------------------------------------------------- audit

export function auditProject(files: ProjectFile[], assetPaths: string[] = []): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const add = (severity: QualityIssue['severity'], title: string, detail: string, extra: Partial<QualityIssue> = {}) => issues.push({ severity, title, detail, ...extra });
  const known = new Set([...files.map((f) => f.path), ...assetPaths]);
  const htmlFiles = files.filter((f) => isHtml(f.path));
  const htmlFile = files.find((f) => /(^|\/)index\.html$/i.test(f.path)) || htmlFiles[0];
  const cssFiles = files.filter((f) => isCss(f.path));
  const jsFiles = files.filter((f) => isJs(f.path));
  const all = files.map((f) => f.content).join('\n');

  // ---- entry point + page-level HTML/SEO
  if (!htmlFile) add('warning', 'No HTML entry point found', 'SEO and semantic checks need an HTML file such as index.html.', { area: 'html' });
  else {
    const html = htmlFile.content;
    const f = htmlFile.path;
    const h1Text = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').trim();
    if (!/<title(?:\s|>)/i.test(html)) add('warning', 'Missing page title', 'Add a descriptive <title> inside <head>.', { file: f, area: 'seo', fix: h1Text ? 'title' : undefined, suggestion: h1Text ? `Use the main heading: "${h1Text.slice(0, 60)}".` : undefined });
    if (!/<meta[^>]+name=["']description["']/i.test(html)) add('warning', 'Missing meta description', 'Add a concise meta description for search results.', { file: f, area: 'seo' });
    if (!/<meta[^>]+name=["']viewport["']/i.test(html)) add('warning', 'Missing viewport tag', 'Add width=device-width, initial-scale=1 for mobile layouts.', { file: f, area: 'responsive', fix: 'viewport' });
    if (!/<meta[^>]+charset/i.test(html) && /<head[\s>]/i.test(html)) add('tip', 'Missing charset declaration', 'Add <meta charset="utf-8"> as the first tag in <head> so text renders correctly.', { file: f, area: 'html', fix: 'charset' });
    if (!/<html[^>]+lang=/i.test(html)) add('warning', 'Missing document language', 'Set <html lang="en"> (or the correct page language).', { file: f, area: 'a11y', fix: 'lang' });
    if (!/<h1(?:\s|>)/i.test(html)) add('warning', 'No H1 heading detected', 'Use one clear primary heading to describe the page.', { area: 'seo' });
    if ((html.match(/<h1(?:\s|>)/gi) || []).length > 1) add('tip', 'More than one H1', 'Pages read best with a single H1; make the others H2 or lower.', { file: f, area: 'seo' });
    if (!/<main(?:\s|>)|role=["']main["']/i.test(html)) add('tip', 'No <main> landmark', 'Wrap the primary content in <main> so screen-reader users can jump to it.', { file: f, area: 'a11y' });
    if (!/<meta[^>]+property=["']og:title["']/i.test(html)) add('tip', 'Open Graph tags missing', 'Add og:title, og:description and og:image for social sharing.', { file: f, area: 'seo' });
  }

  // ---- per-HTML-file markup checks
  for (const hf of htmlFiles) {
    const tags = scanTags(hf.content);
    const f = hf.path;
    const ids = new Set<string>([...hf.content.matchAll(/\b(?:id|name)\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]));
    const seenIds = new Map<string, number>();
    const stack: TagHit[] = [];
    let formDepth = 0;
    let missingAlt = 0, noType = 0, noDims = 0, noLazy = 0, blank = 0, emptyHash = 0, imgIndex = 0;
    const brokenAnchors: string[] = [], brokenFiles: string[] = [], brokenLinksTo: string[] = [], emptyControls: TagHit[] = [];

    tags.forEach((t, ti) => {
      const { raw, name } = t;
      if (!t.closing) {
        const id = getAttr(raw, 'id');
        if (id) seenIds.set(id, (seenIds.get(id) || 0) + 1);
        if (name === 'form') formDepth++;
        if (name === 'img') {
          imgIndex++;
          if (!hasAttr(raw, 'alt')) missingAlt++;
          if (!hasAttr(raw, 'loading') && imgIndex > 1) noLazy++;
          if (!(hasAttr(raw, 'width') && hasAttr(raw, 'height'))) noDims++;
          const src = getAttr(raw, 'src');
          if (src !== undefined) {
            const p = resolveLocal(f, src);
            if (p && !known.has(p)) add('error', 'Missing image', `"${src}" is not in the project, so the image will be broken.`, { file: f, line: lineAt(hf.content, t.index), area: 'assets', suggestion: 'Upload the image in the Images tab using exactly this path, or fix the src.' });
          }
        }
        if (name === 'button' && !hasAttr(raw, 'type') && formDepth === 0) noType++;
        if (name === 'a') {
          const href = getAttr(raw, 'href');
          if (href === '#' || href === '' || /^javascript:/i.test(href || '')) emptyHash++;
          else if (href && href.startsWith('#') && href.length > 1 && href !== '#top' && !ids.has(decodeURIComponent(href.slice(1)))) brokenAnchors.push(href);
          else if (href) {
            const p = resolveLocal(f, href);
            if (p && !known.has(p) && !known.has(p + '.html') && !known.has(p.replace(/\/$/, '') + '/index.html') && p !== '') brokenFiles.push(href);
          }
          if (getAttr(raw, 'target')?.toLowerCase() === '_blank' && !/noopener/i.test(getAttr(raw, 'rel') || '')) blank++;
        }
        if (name === 'link') {
          const ref = getAttr(raw, 'href');
          const p = ref ? resolveLocal(f, ref) : null;
          if (p && !known.has(p)) add('error', 'Linked file missing', `"${ref}" is referenced but not in the project.`, { file: f, line: lineAt(hf.content, t.index), area: 'links', suggestion: 'Create the file or correct the path.' });
        }
        if (name === 'a' || name === 'button') {
          // Icon-only controls need a name: look at the text up to the matching close tag.
          const close = tags.slice(ti + 1).find((x) => x.closing && x.name === name);
          const inner = close ? hf.content.slice(t.index + raw.length, close.index) : 'x';
          const named = inner.replace(/<[^>]+>/g, '').trim() || /<img\b[^>]*\balt\s*=\s*["'][^"']+["']/i.test(inner);
          if (!named && !hasAttr(raw, 'aria-label') && !hasAttr(raw, 'aria-labelledby') && !hasAttr(raw, 'title')) emptyControls.push(t);
        }
      }
      // Tag balance for the container tags where a mismatch visibly breaks layouts.
      if (BALANCED.has(name)) {
        if (!t.closing) { if (!/\/>$/.test(raw)) stack.push(t); }
        else {
          if (name === 'form') formDepth = Math.max(0, formDepth - 1);
          const at = stack.map((s) => s.name).lastIndexOf(name);
          if (at < 0) add('error', 'Unmatched closing tag', `</${name}> has no matching opening tag.`, { file: f, line: lineAt(hf.content, t.index), area: 'html' });
          else {
            for (const open of stack.splice(at).slice(1)) add('error', 'Unclosed tag', `<${open.name}> opened here is never closed before </${name}>.`, { file: f, line: lineAt(hf.content, open.index), area: 'html' });
          }
        }
      }
    });
    for (const open of stack) add('error', 'Unclosed tag', `<${open.name}> is never closed.`, { file: f, line: lineAt(hf.content, open.index), area: 'html' });
    // <script src> tags live in the protected zone of scanTags, so they get their own pass (comments blanked, indices kept).
    for (const m of hf.content.replace(/<!--[\s\S]*?-->/g, (c) => ' '.repeat(c.length)).matchAll(/<script\b[^>]*>/gi)) {
      const ref = getAttr(m[0], 'src');
      const p = ref ? resolveLocal(f, ref) : null;
      if (p && !known.has(p)) add('error', 'Script file missing', `"${ref}" is referenced but not in the project.`, { file: f, line: lineAt(hf.content, m.index ?? 0), area: 'links', suggestion: 'Create the file or correct the path.' });
    }
    for (const [id, n] of seenIds) if (n > 1) add('error', 'Duplicate id', `id="${id}" is used ${n} times. IDs must be unique or scripts and anchors hit the wrong element.`, { file: f, area: 'html' });

    if (missingAlt) add('error', 'Images missing alt attributes', `${missingAlt} image(s) have no alt attribute. Add meaningful alt text, or alt="" for decorative images.`, { file: f, area: 'a11y', fix: 'alt' });
    if (noType) add('tip', 'Buttons without explicit type', `${noType} button(s) outside forms lack type. Use type="button" or type="submit" to avoid accidental form submissions.`, { file: f, area: 'html', fix: 'button-type' });
    if (noLazy) add('tip', 'Images not lazy-loaded', `${noLazy} image(s) below the first one can use loading="lazy" so the page loads faster.`, { file: f, area: 'performance', fix: 'lazy' });
    if (noDims && imgIndex > 0) add('tip', 'Images without width/height', 'Set width and height (or CSS aspect-ratio) so the layout does not jump while images load.', { file: f, area: 'performance' });
    if (blank) add('warning', 'External links need rel="noopener"', `${blank} link(s) open a new tab without rel="noopener noreferrer".`, { file: f, area: 'links', fix: 'noopener' });
    if (brokenAnchors.length) add('warning', 'Broken in-page links', `These anchors have no matching id: ${[...new Set(brokenAnchors)].slice(0, 8).join(', ')}.`, { file: f, area: 'links', suggestion: 'Add the matching id to the section, or fix the href.' });
    if (brokenFiles.length) add('warning', 'Links to missing pages', `These links point to files that are not in the project: ${[...new Set(brokenFiles)].slice(0, 8).join(', ')}.`, { file: f, area: 'links' });
    if (emptyHash) add('tip', 'Links that go nowhere', `${emptyHash} link(s) use href="#" or javascript:. Every link should open a page or section, or be a button with an action.`, { file: f, area: 'links' });
    if (emptyControls.length) add('warning', 'Controls without an accessible name', `${emptyControls.length} link/button(s) have no text or aria-label (icon-only?). Screen readers cannot announce them.`, { file: f, line: lineAt(hf.content, emptyControls[0].index), area: 'a11y', suggestion: 'Add aria-label="…" describing the action.' });
    if (/<input\b(?![^>]*\baria-label\s*=)(?![^>]*\bid\s*=)[^>]*>/i.test(hf.content) && !/<label\b/i.test(hf.content)) add('warning', 'Form controls may lack labels', 'Associate each input with a <label>, or add an accessible aria-label.', { file: f, area: 'a11y' });
    if (/data:image\/[a-z+]+;base64,[A-Za-z0-9+/=]{140000,}/.test(hf.content)) add('warning', 'Very large inline image', 'A base64 image over ~100 KB is embedded in the HTML. Move it to an image file and link it.', { file: f, area: 'performance' });
    const scriptsInHead = (hf.content.match(/<head[\s\S]*?<\/head>/i)?.[0].match(/<script\b[^>]*\bsrc=[^>]*>/gi) || []).filter((s) => !/\b(?:defer|async|type=["']module["'])/i.test(s));
    if (scriptsInHead.length) add('tip', 'Render-blocking scripts in <head>', `${scriptsInHead.length} script(s) in <head> have no defer/async and delay the first paint.`, { file: f, area: 'performance', suggestion: 'Add defer, or move the script to the end of <body>.' });
  }

  // ---- CSS
  const cssAll = cssFiles.map((c) => c.content).join('\n');
  if (!/@media\s*\(/i.test(all) && !/clamp\(/i.test(all)) add('warning', 'No responsive rules detected', 'Add tablet/mobile breakpoints or fluid sizing such as clamp().', { area: 'responsive' });
  if (/width\s*:\s*100vw/i.test(all) && !/box-sizing\s*:\s*border-box/i.test(all)) add('tip', 'Potential horizontal overflow', '100vw plus padding can overflow. Consider width:100% and box-sizing:border-box.', { area: 'responsive' });
  for (const c of cssFiles) {
    const top = topLevelCss(c.content);
    if (/(?:^|[;{\s])(?:min-)?width\s*:\s*(?:[89]\d{2}|\d{4,})px/i.test(top)) add('warning', 'Fixed wide width outside a media query', 'A fixed width of 800px or more will overflow phones. Use max-width:100% or relative units.', { file: c.path, area: 'responsive' });
    if (/@import\s/i.test(c.content)) add('tip', 'CSS @import slows loading', '@import makes the browser download files one after another. Use <link> tags instead.', { file: c.path, area: 'performance' });
    if ((c.content.match(/!important/g) || []).length > 12) add('tip', 'Many !important rules', 'Heavy use of !important makes the CSS hard to maintain. Raise selector specificity instead.', { file: c.path, area: 'css' });
    const seen = new Map<string, number>(); const dupes: string[] = [];
    for (const m of top.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const sel = m[1].replace(/\s+/g, ' ').trim(); const body = m[2].replace(/\s+/g, ' ').replace(/;\s*$/, '').trim();
      if (!sel || !body) continue;
      const key = sel + '{' + body + '}';
      const n = (seen.get(key) || 0) + 1; seen.set(key, n);
      if (n === 2) dupes.push(sel);
    }
    if (dupes.length) add('warning', 'Duplicate CSS rules', `${dupes.length} rule(s) appear twice with identical declarations: ${dupes.slice(0, 5).join(' | ')}.`, { file: c.path, area: 'css', suggestion: 'Delete the repeated copy. (Not auto-fixed: removing a copy can change which rule wins.)' });
  }
  if (!/prefers-reduced-motion/i.test(all) && /animation\s*:|transition\s*:|@keyframes/i.test(all) && cssFiles.length) add('tip', 'Reduced-motion support missing', 'Consider @media (prefers-reduced-motion: reduce) for motion-sensitive users.', { area: 'a11y', fix: 'reduced-motion' });

  // Unused classes: a class that appears nowhere in HTML or JS.
  if (cssFiles.length && (htmlFiles.length || jsFiles.length)) {
    const used = new Set((htmlFiles.map((h) => h.content).concat(jsFiles.map((j) => j.content)).join('\n').match(/[\w-]+/g)) || []);
    const unused = new Set<string>();
    for (const c of cssFiles) {
      if (/bootstrap|tailwind|normalize|reset|\.min\./i.test(c.path)) continue;
      const bare = c.content.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\{[^{}]*\}/g, '{}');
      for (const m of bare.matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) if (!used.has(m[1]) && !/^(?:p2c|bk)-/.test(m[1]) && !/^\d/.test(m[1])) unused.add(m[1]);
    }
    if (unused.size) add('tip', 'Unused CSS classes', `${unused.size} class(es) in your CSS never appear in the HTML or JavaScript: ${[...unused].slice(0, 8).map((x) => '.' + x).join(', ')}${unused.size > 8 ? '…' : ''}.`, { area: 'css', suggestion: 'Remove them to shrink the stylesheet (check JS-added classes first).' });
  }

  // CSS url() files
  for (const c of cssFiles) {
    for (const m of c.content.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi)) {
      const p = resolveLocal(c.path, m[2]);
      if (p && !known.has(p)) { add('error', 'Missing file in CSS url()', `"${m[2]}" is not in the project.`, { file: c.path, line: lineAt(c.content, m.index ?? 0), area: 'assets' }); break; }
    }
  }

  // ---- JavaScript: elements the code looks for must exist in the HTML.
  const htmlAll = htmlFiles.map((h) => h.content).join('\n');
  const htmlIds = new Set([...htmlAll.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]));
  const htmlClasses = new Set([...htmlAll.matchAll(/\bclass\s*=\s*["']([^"']+)["']/gi)].flatMap((m) => m[1].split(/\s+/)));
  for (const j of jsFiles.filter((x) => /\.m?js$/i.test(x.path))) {
    const missing = new Set<string>();
    for (const m of j.content.matchAll(/getElementById\(\s*['"]([^'"]+)['"]\s*\)/g)) if (htmlAll && !htmlIds.has(m[1]) && !j.content.includes(`id = '${m[1]}'`)) missing.add('#' + m[1]);
    for (const m of j.content.matchAll(/querySelector(?:All)?\(\s*['"]([#.])([\w-]+)['"]\s*\)/g)) {
      const ok = m[1] === '#' ? htmlIds.has(m[2]) : htmlClasses.has(m[2]);
      if (htmlAll && !ok && !j.content.includes(`'${m[2]}'`.replace(/^'/, "'")) && !new RegExp(`classList\\.(?:add|toggle)\\(\\s*['"]${m[2]}['"]`).test(j.content)) missing.add(m[1] + m[2]);
    }
    if (missing.size) add('warning', 'Script looks for elements that do not exist', `${j.path} uses: ${[...missing].slice(0, 8).join(', ')}. That code will do nothing (or throw) at runtime.`, { file: j.path, area: 'js', suggestion: 'Add the element to the HTML or correct the selector.' });
    if (/\beval\s*\(|document\.write\s*\(/.test(j.content)) add('warning', 'Unsafe JavaScript pattern', 'eval() / document.write() are slow and open security holes. Use DOM methods instead.', { file: j.path, area: 'js' });
    const logs = (j.content.match(/console\.log\(/g) || []).length;
    if (logs > 3) add('tip', 'Leftover console.log calls', `${logs} console.log calls found. Remove them before shipping.`, { file: j.path, area: 'js' });
  }

  // ---- Syntax: reuse the editor's diagnostics (brackets, tags, JSON) so Problems and Quality agree.
  const syntaxErrors = diagnoseAll(files).filter((d) => d.severity === 'error');
  for (const d of syntaxErrors.slice(0, 20)) {
    const area = isCss(d.path) ? 'css' : isJs(d.path) ? 'js' : 'html';
    if (!issues.some((i) => i.file === d.path && i.line === d.line)) add('error', `${area.toUpperCase()} syntax error`, d.message, { file: d.path, line: d.line, area });
  }

  if (!issues.length) add('tip', 'No obvious issues found', 'This lightweight audit checks common patterns; it is not a substitute for browser or screen-reader testing.');
  const order = { error: 0, warning: 1, tip: 2 } as const;
  return issues.sort((a, b) => order[a.severity] - order[b.severity]);
}

export function summarizeIssues(issues: QualityIssue[]) {
  return {
    errors: issues.filter((i) => i.severity === 'error').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
    tips: issues.filter((i) => i.severity === 'tip' && i.title !== 'No obvious issues found').length,
    fixable: issues.filter((i) => i.fix).length,
  };
}

// ---------------------------------------------------------------- fix all (safe fixes only)

const REDUCED_MOTION = '\n/* Respect users who ask for less motion */\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important; }\n}\n';

/** Applies only the fixes that cannot change how the page looks or behaves. Returns new files plus a plain-language list of what changed. */
export function fixAllSafe(files: ProjectFile[], only?: FixId[]): { files: ProjectFile[]; applied: string[] } {
  const want = (id: FixId) => !only || only.includes(id);
  const applied: string[] = [];
  const count: Partial<Record<FixId, number>> = {};
  const bump = (id: FixId) => { count[id] = (count[id] || 0) + 1; };

  const next = files.map((file) => {
    if (!isHtml(file.path)) return file;
    let content = file.content;
    let formDepth = 0, imgIndex = 0;
    content = content.split(PROTECTED_RE).map((part) => {
      if (/^<!--|^<script|^<style/i.test(part)) return part;
      return part.replace(TAG_RE, (raw) => {
        const name = tagName(raw);
        const closing = raw[1] === '/';
        if (closing) { if (name === 'form') formDepth = Math.max(0, formDepth - 1); return raw; }
        let out = raw;
        const addAttr = (attr: string) => { out = out.replace(/\s*(\/?)>$/, ` ${attr}$1>`); };
        if (name === 'form') formDepth++;
        if (name === 'html' && want('lang') && !hasAttr(raw, 'lang')) { addAttr('lang="en"'); bump('lang'); }
        if (name === 'img') {
          imgIndex++;
          if (want('alt') && !hasAttr(raw, 'alt')) { const guess = humanize(getAttr(raw, 'src') || ''); addAttr(`alt="${guess.replace(/"/g, '&quot;')}"`); bump('alt'); }
          if (want('lazy') && imgIndex > 1 && !hasAttr(raw, 'loading')) { addAttr('loading="lazy"'); bump('lazy'); }
        }
        if (name === 'button' && want('button-type') && formDepth === 0 && !hasAttr(raw, 'type')) { addAttr('type="button"'); bump('button-type'); }
        if (name === 'a' && want('noopener') && getAttr(raw, 'target')?.toLowerCase() === '_blank') {
          const rel = getAttr(raw, 'rel');
          if (rel === undefined) { addAttr('rel="noopener noreferrer"'); bump('noopener'); }
          else if (!/noopener/i.test(rel)) { out = out.replace(/(\srel\s*=\s*)(["'])([^"']*)\2/i, `$1$2$3 noopener noreferrer$2`); bump('noopener'); }
        }
        return out;
      });
    }).join('');

    // head-level fixes (only on the entry page: pages with a <head>)
    if (/<head[\s>]/i.test(content)) {
      const inject = (tag: string) => { content = content.replace(/<head[^>]*>/i, (m) => `${m}\n  ${tag}`); };
      if (want('charset') && !/<meta[^>]+charset/i.test(content)) { inject('<meta charset="utf-8">'); bump('charset'); }
      if (want('viewport') && !/<meta[^>]+name=["']viewport["']/i.test(content)) { inject('<meta name="viewport" content="width=device-width, initial-scale=1">'); bump('viewport'); }
      if (want('title') && !/<title(?:\s|>)/i.test(content)) {
        const h1 = content.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        if (h1) { inject(`<title>${h1.slice(0, 60).replace(/&(?!#?\w+;)/g, '&amp;').replace(/</g, '&lt;')}</title>`); bump('title'); }
      }
    }
    return content === file.content ? file : { ...file, content };
  });

  // Reduced motion goes at the end of the last stylesheet.
  const cssIdx = next.map((f, i) => (isCss(f.path) ? i : -1)).filter((i) => i >= 0);
  const joined = next.map((f) => f.content).join('\n');
  if (want('reduced-motion') && cssIdx.length && !/prefers-reduced-motion/i.test(joined) && /animation\s*:|transition\s*:|@keyframes/i.test(joined)) {
    const i = cssIdx[cssIdx.length - 1];
    next[i] = { ...next[i], content: next[i].content.replace(/\s*$/, '\n') + REDUCED_MOTION };
    bump('reduced-motion');
  }

  const labels: Record<FixId, (n: number) => string> = {
    lang: () => 'Added lang="en" to <html>',
    viewport: () => 'Added the viewport meta tag',
    charset: () => 'Added <meta charset="utf-8">',
    title: () => 'Added a <title> from the main heading',
    alt: (n) => `Added alt text to ${n} image(s) (taken from the file name; refine it if needed)`,
    'button-type': (n) => `Set type="button" on ${n} button(s) outside forms`,
    lazy: (n) => `Added loading="lazy" to ${n} image(s)`,
    noopener: (n) => `Added rel="noopener noreferrer" to ${n} external link(s)`,
    'reduced-motion': () => 'Added a prefers-reduced-motion block to the stylesheet',
  };
  (Object.keys(count) as FixId[]).forEach((id) => applied.push(labels[id](count[id] || 0)));
  return { files: applied.length ? next : files, applied };
}

export function makeSeoTags(title: string, description: string): string {
  const safe = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;').trim();
  return `<title>${safe(title)}</title>\n<meta name="description" content="${safe(description)}">\n<meta property="og:title" content="${safe(title)}">\n<meta property="og:description" content="${safe(description)}">\n<meta name="viewport" content="width=device-width, initial-scale=1">`;
}