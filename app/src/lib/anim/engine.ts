// Animation Studio engine. Pure TypeScript: no UI, no network.
// Everything Pixel2Code adds lives between marker comments so it can be removed/replaced precisely
// without touching the user's own CSS/JS.
import JSZip from 'jszip';

export interface SFile { path: string; bytes: Uint8Array; text?: string; mime: string }
export type Project = Map<string, SFile>;

export const LIMITS = { zipBytes: 60_000_000, totalBytes: 200_000_000, files: 3000, fileBytes: 25_000_000, ratio: 200 };
const TEXT_EXT = /\.(html?|css|js|mjs|json|svg|txt|md|xml|webmanifest)$/i;
const ALLOWED_EXT = /\.(html?|css|js|mjs|json|svg|txt|md|xml|webmanifest|png|jpe?g|gif|webp|avif|ico|bmp|woff2?|ttf|otf|eot|mp4|webm|mp3|ogg|wav|map|pdf)$/i;
const MIME: Record<string, string> = {
  html: 'text/html', htm: 'text/html', css: 'text/css', js: 'text/javascript', mjs: 'text/javascript', json: 'application/json', svg: 'image/svg+xml',
  png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif', ico: 'image/x-icon', bmp: 'image/bmp',
  woff: 'font/woff', woff2: 'font/woff2', ttf: 'font/ttf', otf: 'font/otf', eot: 'application/vnd.ms-fontobject', mp4: 'video/mp4', webm: 'video/webm',
  mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav', pdf: 'application/pdf', txt: 'text/plain', md: 'text/plain', xml: 'text/xml', webmanifest: 'application/manifest+json',
};
const ext = (p: string) => (p.split('.').pop() || '').toLowerCase();
export const mimeOf = (p: string) => MIME[ext(p)] || 'application/octet-stream';

export const START = '/* >>> pixel2code-animations (managed) >>> */';
export const END = '/* <<< pixel2code-animations (managed) <<< */';
export const P2C_CSS = 'pixel2code-animations.css';
export const P2C_JS = 'pixel2code-animations.js';

export function safePath(p: string): boolean {
  return !!p && p.length < 260 && !p.startsWith('/') && !p.includes('\\') && !/^[a-zA-Z]:/.test(p) && !p.split('/').some((s) => s === '..' || s === '') && !p.includes('\0');
}

// ---------------------------------------------------------------------------------------------
// ZIP loading
// ---------------------------------------------------------------------------------------------
export interface LoadResult { project: Project; root: string; main: string; warnings: string[]; skipped: string[] }

export async function loadZip(bytes: Uint8Array): Promise<LoadResult> {
  if (bytes.length > LIMITS.zipBytes) throw new Error(`ZIP is larger than ${Math.round(LIMITS.zipBytes / 1e6)} MB.`);
  let zip: JSZip;
  try { zip = await JSZip.loadAsync(bytes); } catch { throw new Error('This is not a valid ZIP file (or it is corrupted/encrypted).'); }
  const entries = Object.values(zip.files).filter((f) => !f.dir);
  if (!entries.length) throw new Error('The ZIP is empty.');
  if (entries.length > LIMITS.files) throw new Error(`The ZIP has more than ${LIMITS.files} files.`);

  const warnings: string[] = [], skipped: string[] = [];
  const raw: { path: string; bytes: Uint8Array }[] = [];
  let total = 0;
  for (const e of entries) {
    const path = e.name.replace(/^\.\//, '');
    if (!safePath(path)) { if (/(^|\/)\.\.(\/|$)/.test(path) || path.startsWith('/')) throw new Error(`Unsafe path in ZIP rejected: ${path}`); skipped.push(path); continue; }
    if (/(^|\/)(node_modules|\.git|__MACOSX|\.DS_Store)(\/|$)/.test(path)) { skipped.push(path); continue; }
    if (!ALLOWED_EXT.test(path)) { skipped.push(path); continue; }
    const data = await e.async('uint8array');
    total += data.length;
    if (data.length > LIMITS.fileBytes) { skipped.push(path + ' (too large)'); continue; }
    if (total > LIMITS.totalBytes) throw new Error('The ZIP expands to more than the allowed size (zip-bomb protection).');
    if (bytes.length > 0 && total / bytes.length > LIMITS.ratio && total > 50_000_000) throw new Error('Suspicious compression ratio. ZIP rejected.');
    raw.push({ path, bytes: data });
  }
  if (!raw.length) throw new Error('The ZIP contains no supported website files.');

  // detect root: shortest dir containing an html file (strip common single wrapper folder)
  const htmls = raw.filter((r) => /\.html?$/i.test(r.path));
  if (!htmls.length) throw new Error('No HTML file found in the ZIP, so the main page cannot be identified.');
  const dirOf = (p: string) => (p.includes('/') ? p.slice(0, p.lastIndexOf('/') + 1) : '');
  const idx = htmls.filter((h) => /(^|\/)index\.html?$/i.test(h.path));
  const pool = idx.length ? idx : htmls;
  pool.sort((a, b) => a.path.split('/').length - b.path.split('/').length || a.path.length - b.path.length);
  const mainRaw = pool[0].path;
  const root = dirOf(mainRaw);
  if (idx.length === 0) warnings.push(`No index.html found. Using ${mainRaw} as the main page.`);

  const project: Project = new Map();
  const dec = new TextDecoder('utf-8');
  for (const r of raw) {
    if (root && !r.path.startsWith(root)) { skipped.push(r.path + ' (outside project root)'); continue; }
    const p = r.path.slice(root.length);
    const isText = TEXT_EXT.test(p);
    project.set(p, { path: p, bytes: r.bytes, text: isText ? dec.decode(r.bytes) : undefined, mime: mimeOf(p) });
  }
  const main = mainRaw.slice(root.length);

  // missing local references
  const html = project.get(main)?.text || '';
  for (const ref of linkedRefs(html)) {
    const target = resolve(main, ref);
    if (target && !project.has(target)) {
      const line = Math.max(1, html.slice(0, html.indexOf(ref)).split('\n').length);
      warnings.push(`ERROR · ${main}:${line} · Missing local reference "${ref}". Fix: restore "${target}" or correct/remove this href/src on line ${line}.`);
    }
  }
  return { project, root, main, warnings, skipped };
}

/** Static project diagnostics with source file paths and 1-based line numbers. */
export function diagnoseProject(project: Project): string[] {
  const findings: string[] = [];
  const lineOf = (text: string, index: number) => Math.max(1, text.slice(0, Math.max(0, index)).split('\n').length);
  const skipRef = (u: string) => !u || /^\s*(?:#|data:|https?:|\/\/|mailto:|tel:|javascript:)/i.test(u) || /[{}+]|\$\{|<%|%>/.test(u);
  for (const [path, file] of project) {
    const text = file.text;
    if (text === undefined) continue;
    if (/\.css$/i.test(path)) {
      const stack: number[] = [];
      let quote = '', comment = false, escaped = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i], n = text[i + 1];
        if (comment) { if (c === '*' && n === '/') { comment = false; i++; } continue; }
        if (quote) { if (escaped) escaped = false; else if (c === '\\') escaped = true; else if (c === quote) quote = ''; continue; }
        if (c === '/' && n === '*') { comment = true; i++; continue; }
        if (c === '"' || c === "'") { quote = c; continue; }
        if (c === '{') stack.push(lineOf(text, i));
        if (c === '}') { if (stack.length) stack.pop(); else findings.push(`CSS ERROR · ${path}:${lineOf(text, i)} · Unexpected closing brace }. Fix: remove the extra } or add the missing opening {.`); }
      }
      for (const line of stack) findings.push(`CSS ERROR · ${path}:${line} · Missing closing brace }. Fix: close this CSS rule with }.`);
      const urlRe = /url\(\s*["']?([^"')]+)["']?\s*\)/gi; let m: RegExpExecArray | null;
      while ((m = urlRe.exec(text))) {
        const ref = m[1].trim(); if (skipRef(ref)) continue;
        const target = resolve(path, ref);
        if (target && !project.has(target)) findings.push(`ASSET ERROR · ${path}:${lineOf(text, m.index)} · Missing asset "${ref}". Fix: add "${target}" or correct/remove url(...) on this line.`);
      }
    }
    if (/\.html?$/i.test(path)) {
      const attrRe = /\b(src|href|poster|data-src)\s*=\s*(["'])(.*?)\2/gi; let m: RegExpExecArray | null;
      while ((m = attrRe.exec(text))) {
        const ref = m[3].trim(); if (skipRef(ref) || /^(?:javascript:|#)$/i.test(ref)) continue;
        const tagStart = text.lastIndexOf('<', m.index), tagEnd = text.indexOf('>', m.index);
        const tag = text.slice(tagStart, tagEnd < 0 ? m.index : tagEnd);
        const isFileRef = /<(?:script|link|img|source|video|audio|iframe|object|embed)\b/i.test(tag) || /\.(?:css|js|mjs|png|jpe?g|gif|webp|svg|ico|woff2?|ttf|mp4|webm)(?:[?#].*)?$/i.test(ref);
        if (!isFileRef) continue;
        const target = resolve(path, ref);
        if (target && !project.has(target)) findings.push(`ASSET ERROR · ${path}:${lineOf(text, m.index)} · Missing file "${ref}". Fix: add "${target}" or correct/remove the ${m[1]} attribute on this line.`);
      }
    }
  }
  return Array.from(new Set(findings));
}

function isRemote(u: string) { return /^([a-z][a-z0-9+.-]*:|\/\/|#|data:|mailto:|tel:|javascript:)/i.test(u.trim()); }
export function resolve(from: string, ref: string): string | null {
  const clean = ref.split('#')[0].split('?')[0].trim();
  if (!clean || isRemote(clean)) return null;
  const base = from.includes('/') ? from.slice(0, from.lastIndexOf('/')).split('/') : [];
  const parts = clean.startsWith('/') ? [] : base;
  for (const seg of clean.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') { if (!parts.length) return null; parts.pop(); } else parts.push(decodeURIComponent(seg));
  }
  return parts.join('/');
}
function linkedRefs(html: string): string[] {
  const out: string[] = [];
  const re = /<(?:link[^>]+href|script[^>]+src)\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html))) out.push(m[1]);
  return out.filter((r) => !isRemote(r));
}

// ---------------------------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------------------------
export interface Existing { kind: 'keyframes' | 'animation' | 'transition'; name: string; file: string; selector: string; managed: boolean }
export interface Analysis {
  pages: string[]; css: string[]; js: string[]; assets: number; elements: number;
  sections: string[]; cards: string[]; buttons: string[]; links: string[]; images: string[]; headings: string[]; nav: string[]; header: string[]; footer: string[];
  classes: string[]; ids: string[]; existing: Existing[]; libs: string[];
}

export function analyze(p: Project, main: string): Analysis {
  const html = p.get(main)?.text || '';
  const doc = parseHtml(html);
  const q = (s: string) => unique(Array.from(doc.querySelectorAll(s)).map(selectorFor)).slice(0, 60);
  const classes = new Set<string>(), ids = new Set<string>();
  doc.querySelectorAll('[class]').forEach((e) => e.classList.forEach((c) => classes.add(c)));
  doc.querySelectorAll('[id]').forEach((e) => ids.add(e.id));
  const cardSel = '[class*="card" i], [class*="product" i], [class*="service" i], [class*="feature" i], [class*="item" i], [class*="pricing" i], [class*="testimonial" i], article';
  const existing: Existing[] = [];
  const css: string[] = [], js: string[] = [];
  for (const [path, f] of p) {
    if (f.text === undefined) continue;
    if (/\.css$/i.test(path)) { css.push(path); existing.push(...scanCss(path, f.text)); }
    else if (/\.m?js$/i.test(path)) js.push(path);
  }
  existing.push(...scanCss(main + ' (<style>)', Array.from(doc.querySelectorAll('style')).map((s) => s.textContent || '').join('\n')));
  const libs = ['gsap', 'aos', 'animate.css', 'wow', 'scrollreveal', 'framer-motion', 'bootstrap', 'tailwind', 'jquery', 'swiper', 'lottie', 'anime'].filter((l) => new RegExp(l.replace('.', '\\.'), 'i').test(html + Array.from(p.keys()).join(' ')));
  return {
    pages: Array.from(p.keys()).filter((k) => /\.html?$/i.test(k)), css, js, assets: Array.from(p.values()).filter((f) => f.text === undefined || /\.svg$/i.test(f.path)).length,
    elements: doc.querySelectorAll('*').length,
    sections: q('section, main > div, [id*="section" i]'), cards: q(cardSel), buttons: q('button, .btn, [class*="button" i], a[class*="btn" i], input[type=submit]'),
    links: q('a[href]'), images: q('img, picture, figure'), headings: q('h1, h2, h3'), nav: q('nav, [role=navigation]'), header: q('header'), footer: q('footer'),
    classes: Array.from(classes).slice(0, 300), ids: Array.from(ids).slice(0, 100), existing, libs,
  };
}
function scanCss(file: string, css: string): Existing[] {
  const out: Existing[] = [];
  const managed = css.includes(START);
  const body = stripManaged(css);
  let m: RegExpExecArray | null;
  const kf = /@keyframes\s+([\w-]+)/g;
  while ((m = kf.exec(body))) out.push({ kind: 'keyframes', name: m[1], file, selector: '@keyframes', managed: false });
  const rule = /([^{}@]+)\{([^{}]*)\}/g;
  while ((m = rule.exec(body))) {
    const sel = m[1].trim().replace(/\s+/g, ' ').slice(0, 80), decl = m[2];
    const a = /animation(?:-name)?\s*:\s*([\w-]+)/.exec(decl);
    if (a && a[1] !== 'none') out.push({ kind: 'animation', name: a[1], file, selector: sel, managed: false });
    const t = /transition\s*:\s*([^;]+)/.exec(decl);
    if (t) out.push({ kind: 'transition', name: t[1].trim().slice(0, 40), file, selector: sel, managed: false });
  }
  if (managed) out.push({ kind: 'animation', name: 'Pixel2Code generated', file, selector: '(managed block)', managed: true });
  return out.slice(0, 200);
}
const unique = <T,>(a: T[]) => Array.from(new Set(a));
export function selectorFor(e: Element): string {
  if (e.id && /^[A-Za-z][\w-]*$/.test(e.id)) return '#' + e.id;
  const cls = Array.from(e.classList).filter((c) => /^[A-Za-z_][\w-]*$/.test(c) && !/^(p2c|p2a)-/.test(c));
  if (cls.length) return e.tagName.toLowerCase() + '.' + cls[0];
  return e.tagName.toLowerCase();
}
function parseHtml(html: string): Document { return new DOMParser().parseFromString(html, 'text/html'); }
export function stripManaged(s: string): string {
  const a = s.indexOf(START), b = s.indexOf(END);
  if (a < 0 || b < a) return s;
  return (s.slice(0, a) + s.slice(b + END.length)).replace(/\n{3,}/g, '\n\n');
}

// ---------------------------------------------------------------------------------------------
// Settings -> CSS
// ---------------------------------------------------------------------------------------------
export type Cat = 'scroll' | 'hover' | 'other';
export type Effect = 'fade' | 'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'slide-up' | 'zoom-in' | 'zoom-out' | 'reveal' | 'image-reveal' | 'blur-in';
export type HoverFx = 'lift' | 'scale' | 'glow' | 'image-zoom' | 'underline' | 'border' | 'gradient' | 'icon-move' | 'shrink' | 'rotate' | 'tilt' | 'slide-left' | 'slide-right' | 'slide-up' | 'slide-down' | 'background-fade' | 'text-color' | 'shadow' | 'soft-shadow' | 'hard-shadow' | 'inset-shadow' | 'outline' | 'radius' | 'brightness' | 'grayscale' | 'saturate' | 'sepia' | 'blur' | 'invert' | 'opacity' | 'text-shadow' | 'letter-spacing' | 'border-glow' | 'skew' | 'flip' | 'pulse' | 'bounce' | 'ripple' | 'gradient-shift' | 'image-overlay' | 'button-press' | 'underline-grow' | 'underline-slide' | 'color-wash' | 'raise' | 'perspective' | 'focus-ring' | 'rotate-small' | 'shine-sweep' | 'wobble' | 'swing' | 'heartbeat' | 'float' | 'jelly' | 'skew-x' | 'skew-y' | 'image-white' | 'contrast' | 'hue-rotate' | 'border-dash' | 'underline-center' | 'text-reveal';
export type LoopFx = 'none' | 'float' | 'pulse' | 'spin' | 'bounce' | 'gradient-move' | 'text-emphasis';
export type Intensity = 'subtle' | 'medium' | 'advanced';

export interface Settings {
  scrollOn: boolean; hoverOn: boolean; loadOn: boolean;
  effect: Effect; hover: HoverFx[]; loop: LoopFx; loopTarget: string;
  scrollTargets: string; hoverCards: string; hoverButtons: string; hoverLinks: string; hoverImages: string; excludes: string;
  duration: number; delay: number; stagger: number; easing: string; distance: number; scale: number;
  trigger: 'scroll-observer' | 'scroll-driven' | 'load'; once: boolean; threshold: number; hoverIntensity: number;
  intensity: Intensity; navOnLoad: boolean; focusStates: boolean;
}
export const DEFAULTS: Settings = {
  scrollOn: true, hoverOn: true, loadOn: false, effect: 'fade-up', hover: ['lift', 'underline'], loop: 'none', loopTarget: '',
  scrollTargets: 'auto', hoverCards: 'auto', hoverButtons: 'auto', hoverLinks: 'auto', hoverImages: 'auto', excludes: '',
  duration: 700, delay: 0, stagger: 80, easing: 'cubic-bezier(.22,.61,.36,1)', distance: 28, scale: 0.94,
  trigger: 'scroll-observer', once: true, threshold: 0.15, hoverIntensity: 1, intensity: 'medium', navOnLoad: false, focusStates: true,
};
export const EASINGS = ['ease', 'ease-in-out', 'cubic-bezier(.22,.61,.36,1)', 'cubic-bezier(.34,1.56,.64,1)', 'linear', 'ease-out'];
export const PRESETS: Record<string, Partial<Settings>> = {
  'Smooth Fade': { scrollOn: true, effect: 'fade', duration: 800, distance: 0, stagger: 0, hover: [], hoverOn: false },
  'Modern Slide': { scrollOn: true, effect: 'fade-left', duration: 700, distance: 40, easing: 'cubic-bezier(.22,.61,.36,1)', stagger: 60 },
  'Soft Zoom': { scrollOn: true, effect: 'zoom-in', duration: 650, scale: 0.92, stagger: 70 },
  'Stagger Reveal': { scrollOn: true, effect: 'fade-up', duration: 600, stagger: 120, distance: 24 },
  'Premium Card Hover': { hoverOn: true, hover: ['lift', 'glow'], hoverIntensity: 1.2, scrollOn: false },
  'Animated Underline': { hoverOn: true, hover: ['underline'], scrollOn: false },
  'Floating Elements': { loop: 'float', scrollOn: false, hoverOn: false },
  'Scroll Reveal': { scrollOn: true, effect: 'reveal', duration: 900, stagger: 90 },
};
const INTENS: Record<Intensity, { d: number; dist: number; lift: number }> = { subtle: { d: 0.8, dist: 0.6, lift: 0.6 }, medium: { d: 1, dist: 1, lift: 1 }, advanced: { d: 1.25, dist: 1.5, lift: 1.5 } };

const BLOCK = (sel: string) => (sel || '').split(',').map((s) => s.trim()).filter(Boolean);
export function validSelector(s: string): boolean {
  if (!s.trim()) return true;
  try { document.createDocumentFragment().querySelector(s); return true; } catch { return false; }
}

/** Decide which selectors to animate based on the real DOM. */
export function pickTargets(a: Analysis, s: Settings) {
  const custom = (v: string, fb: string[]) => (v && v !== 'auto' ? BLOCK(v) : fb);
  const sc = custom(s.scrollTargets, [...a.sections.filter((x) => !/^(header|footer|nav)/.test(x)), ...a.cards.slice(0, 12), ...a.headings.slice(0, 6), ...a.images.slice(0, 8)]);
  return {
    scroll: unique(sc).slice(0, 40),
    cards: custom(s.hoverCards, a.cards.slice(0, 12)),
    buttons: custom(s.hoverButtons, a.buttons.slice(0, 12)),
    links: custom(s.hoverLinks, a.nav.length ? a.nav.map((n) => n + ' a') : ['nav a']),
    images: custom(s.hoverImages, a.images.filter((i) => /^(img|figure|picture)/.test(i)).slice(0, 10)),
  };
}

export interface Generated { css: string; js: string; notes: string[] }

export function generate(a: Analysis, s: Settings, extraCss = ''): Generated {
  const I = INTENS[s.intensity];
  const dur = Math.round(s.duration * I.d), dist = Math.round(s.distance * I.dist), liftPx = Math.round(6 * I.lift * s.hoverIntensity);
  const t = pickTargets(a, s);
  const ex = BLOCK(s.excludes);
  const notIn = ex.length ? ex.map((e) => `:not(${e}):not(${e} *)`).join('') : '';
  const notes: string[] = [];
  const L: string[] = [];
  L.push(START, '/* Generated by Pixel2Code Animation Studio. Remove this block to restore the original look. */');
  L.push(`:root{--p2c-dur:${dur}ms;--p2c-delay:${s.delay}ms;--p2c-ease:${s.easing};--p2c-dist:${dist}px;--p2c-scale:${s.scale};--p2c-stagger:${s.stagger}ms;--p2c-lift:${liftPx}px}`);

  let js = '';
  if (s.scrollOn && t.scroll.length) {
    const sel = t.scroll.map((x) => x + notIn).join(',\n');
    const from: Record<Effect, string> = {
      fade: 'opacity:0', 'fade-up': 'opacity:0;transform:translate3d(0,var(--p2c-dist),0)', 'fade-down': 'opacity:0;transform:translate3d(0,calc(var(--p2c-dist) * -1),0)',
      'fade-left': 'opacity:0;transform:translate3d(var(--p2c-dist),0,0)', 'fade-right': 'opacity:0;transform:translate3d(calc(var(--p2c-dist) * -1),0,0)',
      'slide-up': 'opacity:0;transform:translate3d(0,calc(var(--p2c-dist) * 2),0)', 'zoom-in': 'opacity:0;transform:scale(var(--p2c-scale))', 'zoom-out': 'opacity:0;transform:scale(calc(2 - var(--p2c-scale)))',
      reveal: 'opacity:0;clip-path:inset(0 0 100% 0)', 'image-reveal': 'opacity:0;clip-path:inset(0 100% 0 0)', 'blur-in': 'opacity:0;filter:blur(8px)',
    };
    const to = 'opacity:1;transform:none;clip-path:inset(0);filter:none';
    if (s.trigger === 'scroll-driven') {
      L.push(`@keyframes p2c-in{from{${from[s.effect]}}to{${to}}}`);
      L.push(`@supports (animation-timeline: view()){\n${sel}{animation:p2c-in linear both;animation-timeline:view();animation-range:entry 0% cover ${Math.round(30 + s.threshold * 100)}%}\n}`);
      L.push(`@supports not (animation-timeline: view()){ /* no scroll-driven support: content stays visible */ }`);
      notes.push('Using CSS scroll-driven animations (no JavaScript). Browsers without support show the content normally.');
    } else {
      // Hidden state only applies when JS adds .p2c-js to <html>, so content is never lost without JavaScript.
      const hide = t.scroll.map((x) => `.p2c-js ${x}${notIn}`).join(',\n');
      L.push(`@media (prefers-reduced-motion:no-preference){\n${hide}{${from[s.effect]};transition:opacity var(--p2c-dur) var(--p2c-ease),transform var(--p2c-dur) var(--p2c-ease),clip-path var(--p2c-dur) var(--p2c-ease),filter var(--p2c-dur) var(--p2c-ease);transition-delay:calc(var(--p2c-delay) + var(--p2c-i,0) * var(--p2c-stagger));will-change:opacity,transform}\n${t.scroll.map((x) => `.p2c-js ${x}${notIn}.p2c-in`).join(',\n')}{${to}}\n}`);
      js = observerJs(t.scroll, ex, s);
      notes.push('Scroll animations use CSS transitions plus a ~25-line IntersectionObserver that only toggles the p2c-in class.');
    }
  }
  const hv = new Set(s.hover);
  if (s.hoverOn && hv.size) {
    L.push('@media (hover:hover) and (prefers-reduced-motion:no-preference){');
    const cards = t.cards.map((x) => x + notIn).join(',\n'), cardsH = t.cards.map((x) => x + notIn + ':hover').join(',\n');
    if (t.cards.length) {
      L.push(`${cards}{transition:transform .35s var(--p2c-ease),box-shadow .35s var(--p2c-ease),border-color .35s,background-color .35s}`);
      const fx: string[] = [];
      if (hv.has('lift')) fx.push('transform:translateY(calc(var(--p2c-lift) * -1))');
      if (hv.has('scale')) fx.push(`transform:scale(${(1 + 0.03 * s.hoverIntensity).toFixed(3)})`);
      if (hv.has('lift') || hv.has('glow')) fx.push(hv.has('glow') ? `box-shadow:0 ${8 + liftPx}px ${24 + liftPx * 2}px rgba(99,102,241,.28)` : `box-shadow:0 ${8 + liftPx}px ${20 + liftPx * 2}px rgba(0,0,0,.18)`);
      if (hv.has('border')) fx.push('border-color:rgba(99,102,241,.8)');
      if (fx.length) L.push(`${cardsH}{${fx.join(';')}}`);
    }
    if (t.buttons.length) {
      L.push(`${t.buttons.map((x) => x + notIn).join(',\n')}{transition:transform .25s var(--p2c-ease),box-shadow .25s,filter .25s,background-color .25s,color .25s}`);
      L.push(`${t.buttons.map((x) => x + notIn + ':hover').join(',\n')}{transform:translateY(-2px) scale(${(1 + 0.04 * s.hoverIntensity).toFixed(3)});${hv.has('glow') ? 'box-shadow:0 6px 20px rgba(99,102,241,.4);' : ''}filter:brightness(1.06)}`);
      L.push(`${t.buttons.map((x) => x + notIn + ':active').join(',\n')}{transform:scale(.98)}`);
    }
    if (hv.has('underline') && t.links.length) {
      const l = t.links.map((x) => x + notIn);
      L.push(`${l.join(',\n')}{background-image:linear-gradient(currentColor,currentColor);background-repeat:no-repeat;background-position:0 100%;background-size:0 2px;transition:background-size .3s var(--p2c-ease)}`);
      L.push(`${l.map((x) => x + ':hover').join(',\n')},\n${l.map((x) => x + ':focus-visible').join(',\n')}{background-size:100% 2px}`);
    }
    if (hv.has('image-zoom') && t.images.length) {
      L.push(`${t.images.map((x) => x + notIn).join(',\n')}{overflow:hidden}`);
      L.push(`${t.images.map((x) => x + notIn + ' img').join(',\n')},\n${t.images.filter((x) => x.startsWith('img')).map((x) => x + notIn).join(',\n') || 'img.p2c-none'}{transition:transform .6s var(--p2c-ease)}`);
      L.push(`${t.images.map((x) => x + notIn + ':hover img').join(',\n')},\n${t.images.filter((x) => x.startsWith('img')).map((x) => x + notIn + ':hover').join(',\n') || 'img.p2c-none:hover'}{transform:scale(${(1 + 0.08 * s.hoverIntensity).toFixed(3)})}`);
    }
    if (hv.has('gradient') && t.buttons.length) {
      L.push(`${t.buttons.map((x) => x + notIn).join(',\n')}{background-size:200% 100%;transition:background-position .5s}`);
      L.push(`${t.buttons.map((x) => x + notIn + ':hover').join(',\n')}{background-position:100% 0}`);
    }
    if (hv.has('icon-move')) L.push(`${t.buttons.map((x) => x + notIn + ' svg,' + x + notIn + ' i').join(',\n') || 'button svg'}{transition:transform .25s var(--p2c-ease)}\n${t.buttons.map((x) => x + notIn + ':hover svg,' + x + notIn + ':hover i').join(',\n') || 'button:hover svg'}{transform:translateX(4px)}`);
    L.push('}');
  }
  if (s.focusStates) {
    const f = [...t.buttons, ...t.links].map((x) => x + notIn + ':focus-visible').join(',\n');
    if (f) L.push(`${f}{outline:2px solid rgba(99,102,241,.9);outline-offset:3px;transition:outline-offset .2s}`);
  }
  if (s.loadOn || s.navOnLoad) {
    const nav = (a.nav[0] || a.header[0] || '');
    if (nav) { L.push(`@keyframes p2c-nav-in{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:none}}\n@media (prefers-reduced-motion:no-preference){${nav}${notIn}{animation:p2c-nav-in .7s var(--p2c-ease) both}}`); }
    else notes.push('Load animation skipped: no <nav> or <header> found.');
  }
  // Additional hover presets. Every effect is scoped to an explicit :hover rule.
  if (s.hoverOn && hv.size) {
    const target = t.cards.length ? t.cards : t.buttons;
    const baseSel = target.map((x) => x + notIn).join(',\n');
    const hoverSel = target.map((x) => x + notIn + ':hover').join(',\n');
    const extra: Partial<Record<HoverFx, { base?: string; hover: string }>> = {
      'shrink': { base: 'transition:transform .3s var(--p2c-ease)', hover: 'transform:scale(.96)' },
      'rotate': { base: 'transition:transform .35s var(--p2c-ease)', hover: 'transform:rotate(3deg)' },
      'tilt': { base: 'transition:transform .35s var(--p2c-ease)', hover: 'transform:perspective(700px) rotateX(3deg) rotateY(-3deg)' },
      'slide-left': { base: 'transition:transform .3s var(--p2c-ease)', hover: 'transform:translateX(-6px)' },
      'slide-right': { base: 'transition:transform .3s var(--p2c-ease)', hover: 'transform:translateX(6px)' },
      'slide-up': { base: 'transition:transform .3s var(--p2c-ease)', hover: 'transform:translateY(-6px)' },
      'slide-down': { base: 'transition:transform .3s var(--p2c-ease)', hover: 'transform:translateY(6px)' },
      'background-fade': { base: 'transition:background-color .3s ease', hover: 'background-color:rgba(99,102,241,.12)' },
      'text-color': { base: 'transition:color .3s ease', hover: 'color:#6366f1' },
      'shadow': { base: 'transition:box-shadow .3s ease', hover: 'box-shadow:0 12px 28px rgba(0,0,0,.2)' },
      'soft-shadow': { base: 'transition:box-shadow .3s ease', hover: 'box-shadow:0 6px 18px rgba(0,0,0,.12)' },
      'hard-shadow': { base: 'transition:box-shadow .3s ease', hover: 'box-shadow:8px 8px 0 rgba(15,23,42,.25)' },
      'inset-shadow': { base: 'transition:box-shadow .3s ease', hover: 'box-shadow:inset 0 0 0 2px rgba(99,102,241,.5)' },
      'outline': { base: 'transition:outline-color .25s ease,outline-offset .25s ease', hover: 'outline:2px solid #818cf8;outline-offset:3px' },
      'radius': { base: 'transition:border-radius .3s ease', hover: 'border-radius:24px' },
      'brightness': { base: 'transition:filter .3s ease', hover: 'filter:brightness(1.12)' },
      'grayscale': { base: 'transition:filter .3s ease', hover: 'filter:grayscale(1)' },
      'saturate': { base: 'transition:filter .3s ease', hover: 'filter:saturate(1.6)' },
      'sepia': { base: 'transition:filter .3s ease', hover: 'filter:sepia(.7)' },
      'blur': { base: 'transition:filter .3s ease', hover: 'filter:blur(1.5px)' },
      'invert': { base: 'transition:filter .3s ease', hover: 'filter:invert(.85)' },
      'opacity': { base: 'transition:opacity .3s ease', hover: 'opacity:.72' },
      'text-shadow': { base: 'transition:text-shadow .3s ease', hover: 'text-shadow:0 2px 12px rgba(99,102,241,.45)' },
      'letter-spacing': { base: 'transition:letter-spacing .3s ease', hover: 'letter-spacing:.06em' },
      'border-glow': { base: 'transition:border-color .3s ease,box-shadow .3s ease', hover: 'border-color:#818cf8;box-shadow:0 0 0 3px rgba(129,140,248,.18)' },
      'skew': { base: 'transition:transform .3s ease', hover: 'transform:skew(-2deg,-1deg)' },
      'flip': { base: 'transition:transform .45s ease', hover: 'transform:perspective(600px) rotateY(8deg)' },
      'pulse': { base: 'transition:transform .3s ease', hover: 'animation:p2c-hover-pulse .7s ease-in-out infinite alternate' },
      'bounce': { base: 'transition:transform .3s ease', hover: 'animation:p2c-hover-bounce .55s ease-in-out infinite alternate' },
      'ripple': { base: 'position:relative;overflow:hidden;transition:box-shadow .25s ease', hover: 'box-shadow:0 0 0 5px rgba(99,102,241,.16)' },
      'gradient-shift': { base: 'background-size:200% 100%;transition:background-position .4s ease', hover: 'background-position:100% 0' },
      'image-overlay': { base: 'transition:filter .3s ease', hover: 'filter:brightness(.82) saturate(1.1)' },
      'button-press': { base: 'transition:transform .12s ease', hover: 'transform:translateY(1px) scale(.98)' },
      'underline-grow': { base: 'text-decoration-line:underline;text-decoration-thickness:2px;text-underline-offset:4px;text-decoration-color:transparent;transition:text-decoration-color .25s ease', hover: 'text-decoration-color:currentColor' },
      'underline-slide': { base: 'text-decoration-line:underline;text-decoration-thickness:2px;text-underline-offset:4px', hover: 'text-decoration-color:currentColor' },
      'color-wash': { base: 'transition:background-image .3s ease,background-color .3s ease', hover: 'background-color:rgba(45,212,191,.16)' },
      'raise': { base: 'transition:transform .3s ease,box-shadow .3s ease', hover: 'transform:translateY(-10px);box-shadow:0 16px 30px rgba(15,23,42,.18)' },
      'perspective': { base: 'transition:transform .35s ease', hover: 'transform:perspective(800px) rotateX(5deg) rotateY(5deg)' },
      'focus-ring': { base: 'transition:box-shadow .25s ease', hover: 'box-shadow:0 0 0 3px rgba(59,130,246,.28)' },
      'rotate-small': { base: 'transition:transform .3s ease', hover: 'transform:rotate(-2deg)' },
    };
    const extraNames: HoverFx[] = ['shrink','rotate','tilt','slide-left','slide-right','slide-up','slide-down','background-fade','text-color','shadow','soft-shadow','hard-shadow','inset-shadow','outline','radius','brightness','grayscale','saturate','sepia','blur','invert','opacity','text-shadow','letter-spacing','border-glow','skew','flip','pulse','bounce','ripple','gradient-shift','image-overlay','button-press','underline-grow','underline-slide','color-wash','raise','perspective','focus-ring','rotate-small'];
    for (const name of extraNames) if (hv.has(name) && extra[name] && target.length) {
      const rule = extra[name]!;
      if (rule.base) L.push(`${baseSel}{${rule.base}}`);
      L.push(`${hoverSel}{${rule.hover}}`);
    }
    if (hv.has('pulse')) L.push('@keyframes p2c-hover-pulse{from{transform:scale(1)}to{transform:scale(1.035)}}');
    if (hv.has('bounce')) L.push('@keyframes p2c-hover-bounce{from{transform:translateY(0)}to{transform:translateY(-5px)}}');
  }

  if (s.loop !== 'none') {
    const target = s.loopTarget.trim() || a.images[0] || a.buttons[0] || '';
    if (!target) notes.push('Loop animation skipped: no target found. Enter a selector.');
    else {
      const kf: Record<string, string> = {
        float: '@keyframes p2c-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}', pulse: '@keyframes p2c-pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}',
        spin: '@keyframes p2c-spin{to{transform:rotate(360deg)}}', bounce: '@keyframes p2c-bounce{0%,100%{transform:translateY(0)}40%{transform:translateY(-14px)}60%{transform:translateY(-6px)}}',
        'gradient-move': '@keyframes p2c-gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}',
        'text-emphasis': '@keyframes p2c-emph{0%,100%{letter-spacing:normal}50%{letter-spacing:.04em}}',
      };
      const nm = s.loop === 'gradient-move' ? 'p2c-gradient' : s.loop === 'text-emphasis' ? 'p2c-emph' : 'p2c-' + s.loop;
      L.push(kf[s.loop]);
      L.push(`@media (prefers-reduced-motion:no-preference){${BLOCK(target).map((x) => x + notIn).join(',')}{animation:${nm} ${s.loop === 'spin' ? 4 : 3}s ${s.loop === 'spin' ? 'linear' : 'ease-in-out'} infinite${s.loop === 'gradient-move' ? ';background-size:200% 200%' : ''}}}`);
    }
  }
  L.push('@media (prefers-reduced-motion:reduce){.p2c-js *{transition-duration:.01ms!important;animation-duration:.01ms!important;animation-iteration-count:1!important}.p2c-js [class]{opacity:1!important;transform:none!important;clip-path:none!important;filter:none!important}}');
  if (extraCss.trim()) L.push('/* AI / custom rules */\n' + extraCss.trim());
  L.push(END);
  return { css: L.join('\n'), js, notes };
}

function observerJs(sel: string[], ex: string[], s: Settings): string {
  return `/* Pixel2Code scroll-reveal (managed). Only toggles the .p2c-in class. */
(function(){
  var reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce||!('IntersectionObserver' in window))return;
  var SEL=${JSON.stringify(sel.join(','))},EX=${JSON.stringify(ex.join(','))},ONCE=${s.once},TH=${s.threshold};
  function init(){
    var list=[].slice.call(document.querySelectorAll(SEL)).filter(function(e){return !EX||!(e.matches(EX)||e.closest(EX));});
    if(!list.length)return;
    document.documentElement.classList.add('p2c-js');
    var groups=new Map();
    list.forEach(function(e){if(!e||!e.style)return;var p=e.parentElement;var n=groups.get(p)||0;e.style.setProperty('--p2c-i',Math.min(n,8));groups.set(p,n+1);});
    var io=new IntersectionObserver(function(es){es.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add('p2c-in');if(ONCE)io.unobserve(en.target);}
      else if(!ONCE){en.target.classList.remove('p2c-in');}
    });},{threshold:TH,rootMargin:'0px 0px -5% 0px'});
    list.forEach(function(e){io.observe(e);});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();`;
}

// ---------------------------------------------------------------------------------------------
// Applying changes to the project (immutable snapshots)
// ---------------------------------------------------------------------------------------------
export function cloneProject(p: Project): Project {
  const m: Project = new Map();
  for (const [k, v] of p) m.set(k, { ...v });
  return m;
}
const enc = new TextEncoder();
export function setText(p: Project, path: string, text: string) { p.set(path, { path, text, bytes: enc.encode(text), mime: mimeOf(path) }); }

/** Insert/replace managed block: CSS goes into a dedicated file linked from every HTML page; JS likewise. */
export function applyGenerated(base: Project, g: Generated): Project {
  const p = cloneProject(base);
  setText(p, P2C_CSS, g.css + '\n');
  if (g.js) setText(p, P2C_JS, g.js + '\n'); else p.delete(P2C_JS);
  for (const [path, f] of p) {
    if (!/\.html?$/i.test(path) || f.text === undefined) continue;
    let h = f.text;
    h = h.replace(/\s*<link[^>]*data-p2c[^>]*>/gi, '').replace(/\s*<script[^>]*data-p2c[^>]*><\/script>/gi, '');
    const up = path.includes('/') ? '../'.repeat(path.split('/').length - 1) : '';
    const link = `\n  <link rel="stylesheet" href="${up}${P2C_CSS}" data-p2c>`;
    h = /<\/head>/i.test(h) ? h.replace(/<\/head>/i, link + '\n</head>') : link + h;
    if (g.js) {
      const sc = `\n  <script src="${up}${P2C_JS}" data-p2c></script>`;
      h = /<\/body>/i.test(h) ? h.replace(/<\/body>/i, sc + '\n</body>') : h + sc;
    }
    setText(p, path, h);
  }
  return p;
}

/** Removes everything Pixel2Code added (restores html to un-linked form). */
export function removeGenerated(base: Project, original: Project): Project {
  const p = cloneProject(base);
  p.delete(P2C_CSS); p.delete(P2C_JS);
  for (const [path, f] of p) {
    if (!/\.html?$/i.test(path) || f.text === undefined) continue;
    const orig = original.get(path)?.text;
    // Pixel2Code only ever injects its own <link>/<script>; the exact original page is restored.
    if (orig !== undefined) setText(p, path, orig);
    else setText(p, path, f.text.replace(/\n?\s*<link[^>]*data-p2c[^>]*>/gi, '').replace(/\n?\s*<script[^>]*data-p2c[^>]*><\/script>/gi, ''));
  }
  return p;
}

/** Targeted removal of animations from the user's ORIGINAL css (only what was asked). */
export type RemoveMode = 'all-generated' | 'scroll' | 'hover' | 'loop' | 'original-animations' | 'original-transitions';
export function removeFromOriginal(p: Project, mode: 'original-animations' | 'original-transitions', selector?: string): { project: Project; removed: string[] } {
  const out = cloneProject(p); const removed: string[] = [];
  for (const [path, f] of out) {
    if (!/\.css$/i.test(path) || f.text === undefined || path === P2C_CSS) continue;
    const re = /([^{}@]+)\{([^{}]*)\}/g;
    const next = f.text.replace(re, (all, sel: string, decl: string) => {
      if (selector && !sel.split(',').some((x) => x.trim() === selector.trim() || x.includes(selector.trim()))) return all;
      const prop = mode === 'original-animations' ? /(^|;|\s)animation(-[a-z-]+)?\s*:[^;]*;?/g : /(^|;|\s)transition(-[a-z-]+)?\s*:[^;]*;?/g;
      if (!prop.test(decl)) return all;
      removed.push(`${path}: ${sel.trim()}`);
      return `${sel}{${decl.replace(prop, (m0, lead) => lead)}}`;
    });
    if (next !== f.text) setText(out, path, next);
  }
  return { project: out, removed };
}

// ---------------------------------------------------------------------------------------------
// Diff summary
// ---------------------------------------------------------------------------------------------
export interface FileChange { path: string; status: 'added' | 'modified' | 'removed'; before: string; after: string }
export function changesBetween(a: Project, b: Project): FileChange[] {
  const out: FileChange[] = [];
  for (const [path, f] of b) {
    if (f.text === undefined) continue;
    const o = a.get(path);
    if (!o) out.push({ path, status: 'added', before: '', after: f.text });
    else if (o.text !== f.text) out.push({ path, status: 'modified', before: o.text || '', after: f.text });
  }
  for (const [path, f] of a) if (!b.has(path) && f.text !== undefined) out.push({ path, status: 'removed', before: f.text, after: '' });
  return out;
}

// ---------------------------------------------------------------------------------------------
// Preview: inline every local asset so the sandboxed (opaque-origin) iframe can render it.
// ---------------------------------------------------------------------------------------------
export interface PreviewResult { html: string; problems: string[] }

export function buildPreview(p: Project, page: string): PreviewResult {
  const problems: string[] = [];
  const f = p.get(page);
  if (!f || f.text === undefined) return { html: '<p style="font:14px sans-serif;padding:20px">Page not found.</p>', problems: ['Page not found: ' + page] };
  const urlCache = new Map<string, string>();
  const dataUrl = (path: string): string | null => {
    const fl = p.get(path); if (!fl) return null;
    if (urlCache.has(path)) return urlCache.get(path)!;
    const u = 'data:' + fl.mime + ';base64,' + b64(fl.bytes);
    urlCache.set(path, u); return u;
  };
  const rewriteCss = (css: string, from: string, depth = 0): string =>
    css
      .replace(/@import\s+(?:url\()?["']?([^"')]+)["']?\)?\s*([^;]*);/g, (all, u: string) => {
        const t = resolve(from, u);
        if (!t) return all;
        const c = p.get(t);
        if (!c || c.text === undefined) { problems.push(`Stylesheet failed to load: ${u} (imported by ${from})`); return ''; }
        return depth < 4 ? rewriteCss(c.text, t, depth + 1) : '';
      })
      .replace(/url\(\s*["']?([^"')]+)["']?\s*\)/g, (all, u: string) => {
        const t = resolve(from, u);
        if (!t) return all;
        const d = dataUrl(t);
        if (!d) { problems.push(`Missing asset: ${u} (in ${from})`); return all; }
        return `url("${d}")`;
      });

  let html = f.text;
  // stylesheets
  html = html.replace(/<link\b[^>]*>/gi, (tag) => {
    if (!/rel\s*=\s*["']?stylesheet/i.test(tag)) {
      const m = /href\s*=\s*["']([^"']+)["']/i.exec(tag);
      if (m) { const t = resolve(page, m[1]); const d = t && dataUrl(t); if (d) return tag.replace(m[1], d); }
      return tag;
    }
    const m = /href\s*=\s*["']([^"']+)["']/i.exec(tag); if (!m) return tag;
    const t = resolve(page, m[1]); if (!t) return tag;
    const c = p.get(t);
    if (!c || c.text === undefined) { problems.push(`Stylesheet failed to load: ${m[1]}`); return `<!-- missing ${m[1]} -->`; }
    return `<style data-src="${t}">\n${rewriteCss(c.text, t)}\n</style>`;
  });
  html = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi, (all, a: string, css: string, z: string) => (a.includes('data-src') ? all : a + rewriteCss(css, page) + z));
  // scripts
  html = html.replace(/<script\b([^>]*)\bsrc\s*=\s*["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (all, a: string, src: string, b: string) => {
    const t = resolve(page, src); if (!t) return all;
    const c = p.get(t);
    if (!c || c.text === undefined) { problems.push(`Script failed to load: ${src}`); return `<!-- missing ${src} -->`; }
    const type = /type\s*=\s*["']module["']/i.test(a + b) ? ' type="module"' : '';
    return `<script${type} data-src="${t}">\n${c.text.replace(/<\/script/gi, '<\\/script')}\n</script>`;
  });
  // src / srcset / poster / inline style urls
  html = html.replace(/\b(src|poster|data-src|data-bg)\s*=\s*"([^"]+)"/gi, (all, k: string, u: string) => {
    if (/^<?script/i.test(all)) return all;
    const t = resolve(page, u); if (!t) return all;
    const d = dataUrl(t);
    if (!d) { problems.push(`Missing asset: ${u}`); return all; }
    return `${k}="${d}"`;
  });
  html = html.replace(/\bsrcset\s*=\s*"([^"]+)"/gi, (all, v: string) => 'srcset="' + v.split(',').map((part) => {
    const [u, ...rest] = part.trim().split(/\s+/); const t = resolve(page, u); const d = t && dataUrl(t);
    return d ? [d, ...rest].join(' ') : part.trim();
  }).join(', ') + '"');
  html = html.replace(/style\s*=\s*"([^"]*url\([^"]*)"/gi, (all, s: string) => 'style="' + rewriteCss(s, page).replace(/"/g, '&quot;') + '"');
  // internal page links: navigate by message (iframe has no origin)
  const guard = `<script>(function(){
  var PAGES=${JSON.stringify(Array.from(p.keys()).filter((k) => /\.html?$/i.test(k)))};
  document.addEventListener('click',function(e){var a=e.target&&e.target.closest&&e.target.closest('a[href]');if(!a)return;var h=a.getAttribute('href')||'';
    if(h.charAt(0)==='#')return;
    if(/^(https?:)?\\/\\//i.test(h)||/^(mailto|tel):/i.test(h)){e.preventDefault();return;}
    e.preventDefault();parent.postMessage({p2cNav:h},'*');},true);
  document.addEventListener('submit',function(e){e.preventDefault();},true);
  var selected=null;
  function makeSelector(el){
    if(!el||el.nodeType!==1)return '';
    if(el.id)return '#'+CSS.escape(el.id);
    var parts=[],cur=el,depth=0;
    while(cur&&cur.nodeType===1&&cur!==document.documentElement&&depth<5){
      var utility=/^(?:container(?:-fluid|-sm|-md|-lg|-xl|-xxl)?|row|col(?:-(?:xs|sm|md|lg|xl|xxl)(?:-\d+)?)?|g-\d+|gx-\d+|gy-\d+|m[trblxy]?-(?:auto|\d+)|p[trblxy]?-(?:auto|\d+)|gap-\d+|row-gap-\d+|d-(?:none|block|inline|inline-block|flex|inline-flex|grid)|flex-(?:row|column|wrap|nowrap)|justify-content-\w+|align-items-\w+|text-(?:start|end|center|left|right|white|dark|light|primary|secondary|success|danger|warning|info)|bg-(?:primary|secondary|success|danger|warning|info|light|dark|white|transparent)|w-\d+|h-\d+|rounded(?:-\w+)?|shadow(?:-\w+)?)$/i;
      var classes=cur.classList?Array.from(cur.classList).filter(function(c){return !/^p2c-studio-/.test(c)&&!utility.test(c)}):[];
      var tag=cur.tagName.toLowerCase();
      var semantic=/^(h[1-6]|p|button|a|img|input|textarea|label|li|section|article|header|footer|nav|main|aside)$/.test(tag);
      var part=classes.length?'.'+CSS.escape(classes[0]):tag;
      if(classes.length>1)part+='.'+CSS.escape(classes[1]);
      // Preserve the actual selected text tag (e.g. h2) so effects target the heading, not its parent div.
      if(depth===0&&semantic&&classes.length)part=tag+'.'+classes.slice(0,2).map(function(c){return CSS.escape(c)}).join('.');
      parts.unshift(part); depth++;
      if(cur.parentElement&&cur.parentElement.id){parts.unshift('#'+CSS.escape(cur.parentElement.id));break;}
      cur=cur.parentElement;
    }
    return parts.join(' ');
  }
  document.addEventListener('click',function(e){
    var raw=e.target&&e.target.nodeType===1?e.target:e.target&&e.target.parentElement;if(!raw)return;
    // Single click selects the nearest meaningful card/section. Double-click drills
    // into the exact nested text/image element so card-level and child-level editing coexist.
    var el;
    if(e.detail>=2){el=(raw.closest&&raw.closest('h1,h2,h3,h4,h5,h6,p,button,a,img,input,textarea,label,li,span,strong,em'))||raw;}
    else {el=(raw.closest&&raw.closest('.achievers-box,.vector-box,.admission-box,.speciality-card,[class*=\"card\"],article,section))||(raw.closest&&raw.closest('.blog-detail-content'))||raw;}
    if(!el||el===document.body||el===document.documentElement)return;
    if(selected)selected.classList.remove('p2c-studio-selected'); selected=el; selected.classList.add('p2c-studio-selected');
    if(!document.getElementById('p2c-studio-pick-style')){var pickStyle=document.createElement('style');pickStyle.id='p2c-studio-pick-style';pickStyle.textContent='.p2c-studio-selected{outline:2px solid #7C9CFF!important;outline-offset:2px!important}';(document.head||document.documentElement).appendChild(pickStyle);}
    var selector=makeSelector(el);
    try { if(selector && document.querySelectorAll(selector).length>1 && el.parentElement){ var siblings=Array.prototype.filter.call(el.parentElement.children,function(x){return x.tagName===el.tagName}); selector += ':nth-of-type('+(siblings.indexOf(el)+1)+')'; } } catch(_){}
    var clean=el.cloneNode(true);if(clean.classList)clean.classList.remove('p2c-studio-selected');
    var matched=[];try{Array.from(document.styleSheets).forEach(function(sheet){try{Array.from(sheet.cssRules||[]).forEach(function(rule){if(rule.type===1&&rule.selectorText){try{if(el.matches(rule.selectorText))matched.push(rule.cssText);}catch(_){}}});}catch(_){}});}catch(_){}
    var computed='';try{var cs=getComputedStyle(el);computed=Array.from(cs).map(function(k){return k+': '+cs.getPropertyValue(k)+';'}).join('\\n');}catch(_){}
    parent.postMessage({p2cSelected:{selector:selector,tag:el.tagName||'',id:el.id||'',className:typeof el.className==='string'?el.className:'',html:clean.outerHTML||'',css:matched.join('\\n\\n')||('/* No matching authored CSS rule found. Computed styles follow; these are browser-resolved values. */\\n'+selector+' {\\n'+computed.split('\\n').map(function(line){return '  '+line;}).join('\\n')+'\\n}')}},'*');
    e.preventDefault();
  },true);
  window.addEventListener('message',function(e){
    var d=e.data||{};
    if(d.p2cStudioPreview){
      var style=document.getElementById('p2c-studio-temp-preview')||document.createElement('style');
      style.id='p2c-studio-temp-preview'; style.textContent=String(d.p2cStudioPreview||'').replace(/:hover\b/g,'');
      if(!style.parentNode)document.head.appendChild(style);
    }
    if(d.p2cStudioClear){var temp=document.getElementById('p2c-studio-temp-preview');if(temp)temp.remove();}
    if(d.p2cEditSelectedCss){var live=document.getElementById('p2c-studio-live-css')||document.createElement('style');live.id='p2c-studio-live-css';live.textContent=String(d.p2cEditSelectedCss||'');if(!live.parentNode)document.head.appendChild(live);}
    if(d.p2cEditSelectedHtml&&selected){try{var wrap=document.createElement('div');wrap.innerHTML=String(d.p2cEditSelectedHtml);var replacement=wrap.firstElementChild;if(replacement){replacement.classList.remove('p2c-studio-selected');selected.replaceWith(replacement);selected=replacement;}}catch(err){parent.postMessage({p2cErr:'Selected HTML edit failed: '+String(err)},'*');}}
  });
  window.addEventListener('error',function(e){parent.postMessage({p2cErr:String(e.message||'error')+(e.lineno?' (line '+e.lineno+')':'')},'*');});
})();</script>`;
  html = /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (m) => m + guard) : guard + html;
  return { html, problems: unique(problems) };
}
function b64(bytes: Uint8Array): string {
  let s = ''; const CH = 0x8000;
  for (let i = 0; i < bytes.length; i += CH) s += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CH)) as any);
  return btoa(s);
}

// ---------------------------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------------------------
export async function exportZip(p: Project, only?: 'css-js'): Promise<Uint8Array> {
  const z = new JSZip();
  for (const [path, f] of p) {
    if (!safePath(path)) continue;
    if (only === 'css-js' && !(/\.(css|m?js)$/i.test(path))) continue;
    z.file(path, f.bytes);
  }
  return z.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}

// ---------------------------------------------------------------------------------------------
// Natural-language instruction -> settings (local, deterministic) + prompt for the AI
// ---------------------------------------------------------------------------------------------
export interface ParsedInstruction { settings: Partial<Settings>; remove?: 'all' | 'scroll' | 'hover' | 'loop' | 'restore'; removeSelector?: string; removeOriginal?: 'original-animations'; understood: string[] }
export function parseInstruction(text: string, current: Settings): ParsedInstruction {
  const t = text.toLowerCase();
  const s: Partial<Settings> = {}; const u: string[] = [];
  const out: ParsedInstruction = { settings: s, understood: u };
  const sel = /(?:class|selector|elements? with the class|only)\s+(?:the\s+)?((?:[.#][\w-]+)(?:\s*,\s*[.#][\w-]+)*)/i.exec(text) || /((?:^|\s)[.#][\w-]+)/.exec(text);
  const target = sel ? sel[1].trim() : '';
  if (/restore (the )?original|reset to original/.test(t)) { out.remove = 'restore'; u.push('Restore original'); return out; }
  if (/\b(remove|delete|disable|stop)\b/.test(t) && /\banimation|effect|hover|scroll|bounce|loop|continuous/.test(t)) {
    if (/scroll/.test(t) && !/hover/.test(t)) out.remove = 'scroll';
    else if (/hover/.test(t) && !/scroll/.test(t)) out.remove = 'hover';
    else if (/bounce|continuous|loop|infinite/.test(t)) out.remove = 'loop';
    else out.remove = 'all';
    if (/keep hover/.test(t)) out.remove = 'scroll';
    if (/keep scroll/.test(t)) out.remove = 'hover';
    const foot = /\b(footer|header|nav(bar)?)\b/.exec(t);
    if (/only from the|only from/.test(t) && foot) out.removeSelector = foot[1].replace('navbar', 'nav');
    u.push('Remove ' + (out.remove || 'all') + (out.removeSelector ? ' from ' + out.removeSelector : ''));
    if (/replace it with a subtle fade|replace.*fade/.test(t)) { s.scrollOn = true; s.effect = 'fade'; u.push('Replace with subtle fade'); }
    return out;
  }
  const dirs: [RegExp, Effect][] = [[/fade[- ]?up/, 'fade-up'], [/fade[- ]?down/, 'fade-down'], [/fade[- ]?left/, 'fade-left'], [/fade[- ]?right/, 'fade-right'], [/zoom[- ]?out/, 'zoom-out'], [/zoom/, 'zoom-in'], [/slide/, 'slide-up'], [/image reveal/, 'image-reveal'], [/reveal/, 'reveal'], [/blur/, 'blur-in'], [/fade/, 'fade']];
  const wantsScroll = /scroll|section|reveal|appear|fade|slide|zoom/.test(t);
  if (wantsScroll && !/only to the .*hover|hover animations only/.test(t)) { for (const [re, e] of dirs) if (re.test(t)) { s.effect = e; s.scrollOn = true; u.push('Scroll effect: ' + e); break; } }
  if (/all cards|stagger/.test(t)) { s.stagger = 120; u.push('Stagger 120ms'); }
  if (/hover/.test(t)) {
    s.hoverOn = true; const h = new Set<HoverFx>();
    if (/lift|card/.test(t)) h.add('lift'); if (/scale|button/.test(t)) h.add('scale'); if (/glow/.test(t)) h.add('glow'); if (/underline|link/.test(t)) h.add('underline');
    if (/image|zoom/.test(t)) h.add('image-zoom'); if (/border/.test(t)) h.add('border'); if (/gradient/.test(t)) h.add('gradient'); if (/icon/.test(t)) h.add('icon-move');
    if (!h.size) { h.add('lift'); h.add('scale'); }
    s.hover = Array.from(h); u.push('Hover: ' + s.hover.join(', '));
    if (/only/.test(t) && !wantsScroll) s.scrollOn = false;
    if (/button/.test(t) && !/card/.test(t)) { s.hover = Array.from(new Set([...(s.hover || []), 'scale'])); }
    if (/product card/.test(t)) { s.hoverCards = '[class*="product" i]'; u.push('Cards: product'); }
  }
  if (/navbar|nav\b|navigation/.test(t) && /load/.test(t)) { s.navOnLoad = true; u.push('Navbar load animation'); }
  if (/slower|smoother/.test(t)) { s.duration = Math.round(current.duration * 1.4); u.push('Slower: ' + s.duration + 'ms'); }
  if (/faster|quicker/.test(t)) { s.duration = Math.round(current.duration * 0.7); u.push('Faster: ' + s.duration + 'ms'); }
  if (/only once|trigger only once|once/.test(t)) { s.once = true; u.push('Trigger once'); }
  if (/repeat|again whenever|scrolls back/.test(t)) { s.once = false; u.push('Repeat on re-entry'); }
  if (/css[- ]only|without (using )?javascript|no javascript/.test(t)) { s.trigger = 'scroll-driven'; u.push('CSS-only (scroll-driven)'); }
  if (/float/.test(t)) { s.loop = 'float'; u.push('Float'); } if (/pulse/.test(t)) { s.loop = 'pulse'; u.push('Pulse'); }
  if (/spin|rotat/.test(t)) { s.loop = 'spin'; u.push('Spin'); } if (/bounce/.test(t)) { s.loop = 'bounce'; u.push('Bounce'); }
  const ex = /(?:do not|don't|dont|except|exclude|without)\s+(?:animate\s+)?(?:the\s+)?(header|footer|nav(?:bar)?|hero|[.#][\w-]+)/.exec(t);
  if (ex) { const v = ex[1].replace('navbar', 'nav'); s.excludes = [current.excludes, v].filter(Boolean).join(', '); u.push('Exclude ' + v); }
  if (target && /only|animate/.test(t)) { s.scrollTargets = target; u.push('Target ' + target); }
  const ms = /(\d+(?:\.\d+)?)\s*(ms|s)\b/.exec(t); if (ms) { s.duration = Math.round(parseFloat(ms[1]) * (ms[2] === 's' ? 1000 : 1)); u.push('Duration ' + s.duration + 'ms'); }
  return out;
}

/** Prompt for the AI (sent through the existing server `/api/code/generate`). */
export function aiContext(a: Analysis, s: Settings, project: Project, main: string): { files: { path: string; content: string }[] } {
  const outline = {
    page: main, libs: a.libs, sections: a.sections, cards: a.cards, buttons: a.buttons, nav: a.nav, header: a.header, footer: a.footer, images: a.images.slice(0, 20), headings: a.headings,
    existingAnimations: a.existing.filter((e) => !e.managed).slice(0, 40), currentSettings: s,
  };
  const css = project.get(P2C_CSS)?.text || '';
  const html = (project.get(main)?.text || '').slice(0, 14000);
  return { files: [{ path: 'analysis.json', content: JSON.stringify(outline, null, 1) }, { path: 'page-structure.html', content: html }, { path: P2C_CSS, content: css || '/* none yet */' }] };
}
export const AI_INSTRUCTION = (user: string) =>
  `You edit ONLY the file ${P2C_CSS}. Return its COMPLETE new content as a single FILE section named ${P2C_CSS}. Keep the managed markers "${START}" and "${END}" exactly, and keep everything inside them. ` +
  'Use only selectors that exist in analysis.json / page-structure.html. Prefer CSS (@keyframes, transition, transform, opacity, custom properties, :hover, :focus-visible) and wrap motion in @media (prefers-reduced-motion:no-preference). ' +
  'Do not animate everything. Do not touch layout (width/height/margin/position) and do not add libraries. Do not create or modify any other file. USER REQUEST: ' + user;
