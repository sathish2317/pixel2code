// Turns a Pixel2Code project (plain HTML/CSS/JS) into a ready-to-run React (JavaScript or TypeScript) Vite project.
// Pure functions only: no ZIP library and no storage here, so it is easy to test. lib/exporter.ts zips the result.
import type { ProjectAsset, ProjectFile, Target } from '../types';
import { TAG_RE, VOID, getAttr, resolveLocal, tagName } from './quality';

export type ExportKind = 'react' | 'react-ts' | 'assets';

export interface ExportResult {
  files: ProjectFile[];
  assets: ProjectAsset[];
  /** Plain-language notes shown to the user and written into the README. */
  notes: string[];
}

const isHtml = (p: string) => /\.html?$/i.test(p);
const isCss = (p: string) => /\.css$/i.test(p);
const isJs = (p: string) => /\.m?js$/i.test(p);

// ---------------------------------------------------------------- small helpers

export function pascal(s: string, fallback = 'Section'): string {
  const w = s.replace(/[^a-zA-Z0-9]+(.)?/g, (_m, c: string | undefined) => (c ? c.toUpperCase() : ''));
  const out = w.charAt(0).toUpperCase() + w.slice(1);
  return /^[A-Z]/.test(out) ? out : fallback + out;
}

export const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'pixel2code-app';

function parseAttrs(raw: string): { name: string; value: string | null }[] {
  const inner = raw.replace(/^<\/?[\w:-]+/, '').replace(/\/?>$/, '');
  const out: { name: string; value: string | null }[] = [];
  for (const m of inner.matchAll(/([^\s=/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g)) out.push({ name: m[1], value: m[2] ?? m[3] ?? m[4] ?? null });
  return out;
}

function splitDecls(s: string): string[] {
  const out: string[] = []; let cur = '', depth = 0, q = '';
  for (const ch of s) {
    if (q) { cur += ch; if (ch === q) q = ''; continue; }
    if (ch === '"' || ch === "'") { q = ch; cur += ch; continue; }
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === ';' && depth === 0) { out.push(cur); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

const publicUrl = (resolved: string) => '/' + resolved;

/** Rewrites url(...) references in CSS text so they point to the Vite public folder. */
export function rewriteCssUrls(css: string, from: string): string {
  return css.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/gi, (m, q: string, ref: string) => {
    const p = resolveLocal(from, ref);
    return p ? `url(${q}${publicUrl(p)}${q})` : m;
  });
}

function styleToJsx(style: string, from: string): string {
  const parts: string[] = [];
  for (const d of splitDecls(rewriteCssUrls(style, from))) {
    const i = d.indexOf(':');
    if (i < 0) continue;
    const k = d.slice(0, i).trim(), v = d.slice(i + 1).trim();
    if (!k || !v) continue;
    const key = k.startsWith('--') ? JSON.stringify(k) : k.replace(/^-ms-/, 'ms-').replace(/^-/, '').replace(/-([a-z])/g, (_a, c: string) => c.toUpperCase());
    parts.push(`${key}: ${JSON.stringify(v)}`);
  }
  return `{{ ${parts.join(', ')} }}`;
}

const ATTR_MAP: Record<string, string> = {
  class: 'className', for: 'htmlFor', tabindex: 'tabIndex', colspan: 'colSpan', rowspan: 'rowSpan', readonly: 'readOnly', maxlength: 'maxLength', minlength: 'minLength',
  autocomplete: 'autoComplete', autofocus: 'autoFocus', frameborder: 'frameBorder', allowfullscreen: 'allowFullScreen', cellpadding: 'cellPadding', cellspacing: 'cellSpacing',
  crossorigin: 'crossOrigin', srcset: 'srcSet', datetime: 'dateTime', enctype: 'encType', novalidate: 'noValidate', contenteditable: 'contentEditable', spellcheck: 'spellCheck',
  charset: 'charSet', usemap: 'useMap', playsinline: 'playsInline', autoplay: 'autoPlay', inputmode: 'inputMode', referrerpolicy: 'referrerPolicy', fetchpriority: 'fetchPriority',
  accesskey: 'accessKey', hreflang: 'hrefLang', srclang: 'srcLang', formaction: 'formAction', viewbox: 'viewBox', preserveaspectratio: 'preserveAspectRatio',
};
const EVENTS: Record<string, string> = {
  onclick: 'onClick', ondblclick: 'onDoubleClick', onchange: 'onChange', oninput: 'onInput', onsubmit: 'onSubmit', onkeyup: 'onKeyUp', onkeydown: 'onKeyDown',
  onmouseover: 'onMouseOver', onmouseout: 'onMouseOut', onmouseenter: 'onMouseEnter', onmouseleave: 'onMouseLeave', onfocus: 'onFocus', onblur: 'onBlur', onload: 'onLoad', onerror: 'onError',
};

interface Ctx { from: string; ts: boolean; notes: Set<string> }

function handlerToJsx(attr: string, code: string, ctx: Ctx): string | null {
  const event = EVENTS[attr.toLowerCase()];
  if (!event) return null;
  let body = code.trim().replace(/;$/, '');
  const returns = /^return\s+/.test(body);
  body = body.replace(/^return\s+/, '');
  const m = body.match(/^(?:window\.)?([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\(([^()]*)\)$/);
  if (!m || /^(?:this|document|event)\b/.test(m[1])) return null;
  const win = ctx.ts ? '(window as any)' : 'window';
  const call = `${win}.${m[1]}(${m[2].replace(/\bthis\b/g, 'event.currentTarget')})`;
  return returns ? `${event}={(event) => { if (${call} === false) event.preventDefault(); }}` : `${event}={(event) => ${call}}`;
}

function jsxAttr(tag: string, name: string, value: string | null, ctx: Ctx): string {
  const lower = name.toLowerCase();
  if (/^on[a-z]+$/.test(lower)) {
    const h = value ? handlerToJsx(name, value, ctx) : null;
    if (h) return h;
    ctx.notes.add(`Removed an inline ${name}="…" handler from <${tag}> (too complex to convert). Re-add it as a React event handler.`);
    return '';
  }
  if (lower === 'style') return value ? `style=${styleToJsx(value, ctx.from)}` : '';
  let jsx = ATTR_MAP[lower] ?? (/^(?:data|aria)-/.test(lower) ? lower : name);
  if (jsx === 'value' && /^(?:input|textarea|select)$/.test(tag)) jsx = 'defaultValue';
  if (jsx === 'checked') jsx = 'defaultChecked';
  if (jsx === name && /[-:]/.test(name) && !/^(?:data|aria)-/.test(lower)) jsx = name.replace(/[:-]([a-zA-Z])/g, (_m, c: string) => c.toUpperCase());
  if (value === null) return jsx;
  let v = value;
  if (/^(?:src|poster|data-src)$/i.test(name)) { const p = resolveLocal(ctx.from, v); if (p) v = publicUrl(p); }
  else if (/^srcset$/i.test(name)) v = v.split(',').map((c) => { const [u, ...rest] = c.trim().split(/\s+/); const p = resolveLocal(ctx.from, u); return [p ? publicUrl(p) : u, ...rest].join(' '); }).join(', ');
  else if (/^href$/i.test(name) && tag !== 'a') { const p = resolveLocal(ctx.from, v); if (p) v = publicUrl(p); }
  return v.includes('"') || v.includes('{') && /^(?:className|htmlFor)$/.test(jsx) ? `${jsx}={${JSON.stringify(v)}}` : `${jsx}="${v}"`;
}

function convertTag(raw: string, ctx: Ctx): string {
  const name = raw.match(/^<\/?([a-zA-Z][\w:-]*)/)?.[1] || '';
  if (raw[1] === '/') return `</${name}>`;
  const lower = name.toLowerCase();
  const attrs = parseAttrs(raw).map((a) => jsxAttr(lower, a.name, a.value, ctx)).filter(Boolean);
  const selfClose = VOID.has(lower) || /\/>$/.test(raw);
  return `<${name}${attrs.length ? ' ' + attrs.join(' ') : ''}${selfClose ? ' />' : '>'}`;
}

const escText = (s: string) => s.replace(/\{/g, '&#123;').replace(/\}/g, '&#125;');

/** HTML fragment (no scripts/styles/comments) to JSX text. */
export function htmlToJsx(html: string, ctx: Ctx): string {
  const clean = html.replace(/<!--[\s\S]*?-->/g, '');
  let out = '', last = 0;
  for (const m of clean.matchAll(TAG_RE)) {
    out += escText(clean.slice(last, m.index));
    out += convertTag(m[0], ctx);
    last = (m.index ?? 0) + m[0].length;
  }
  return out + escText(clean.slice(last));
}

interface Node { raw: string; name: string; open: string; inner: string; close: string }

/** Splits an HTML fragment into its top-level elements. Returns null when the markup is not cleanly nested. */
export function splitElements(html: string): Node[] | null {
  const nodes: Node[] = [];
  let depth = 0, start = 0, open = '', name = '', rest = html;
  for (const m of html.matchAll(TAG_RE)) {
    const raw = m[0], tn = tagName(raw), idx = m.index ?? 0;
    const closing = raw[1] === '/', selfClose = VOID.has(tn) || /\/>$/.test(raw);
    if (closing) {
      if (depth === 0) return null;
      depth--;
      if (depth === 0) { const full = html.slice(start, idx + raw.length); nodes.push({ raw: full, name, open, inner: html.slice(start + open.length, idx), close: raw }); rest = rest.replace(full, ''); }
      continue;
    }
    if (depth === 0) {
      start = idx; open = raw; name = tn;
      if (selfClose) { nodes.push({ raw, name, open: raw, inner: '', close: '' }); rest = rest.replace(raw, ''); } else depth = 1;
    } else if (!selfClose) depth++;
  }
  if (depth !== 0) return null;
  if (rest.replace(/<!--[\s\S]*?-->/g, '').trim()) return null; // loose text at top level: keep the page in one piece
  return nodes;
}

function componentName(n: Node, i: number, used: Set<string>): string {
  const id = getAttr(n.open, 'id'), cls = (getAttr(n.open, 'class') || '').split(/\s+/)[0];
  const byTag: Record<string, string> = { header: 'Header', nav: 'Navbar', footer: 'Footer', main: 'Main', aside: 'Sidebar' };
  let base = byTag[n.name] || pascal(id || cls || '', 'Section');
  if (base === 'Section' || base === 'SectionApp') base = 'Section' + (i + 1);
  if (base === 'App') base = 'AppSection';
  let name = base, k = 2;
  while (used.has(name)) name = base + k++;
  used.add(name);
  return name;
}

const indent = (s: string, n: number) => s.split('\n').map((l) => (l.trim() ? ' '.repeat(n) + l : l)).join('\n');

function componentFile(name: string, jsx: string): string {
  return `export default function ${name}() {\n  return (\n    <>\n${indent(jsx.trim(), 6)}\n    </>\n  );\n}\n`;
}

// ---------------------------------------------------------------- page analysis

interface PageParts {
  path: string;
  headExternal: string[]; // raw tags to copy into index.html (CDN css, fonts, tailwind script ...)
  title?: string;
  description?: string;
  localCss: string[];
  scripts: { src: string; module: boolean }[]; // in order: external (https) and local, from <head> and <body>
  inlineScripts: string[];
  inlineStyles: string[];
  jsonLd: string[];
  bodyHtml: string;
  bodyClass?: string;
  htmlLang?: string;
}

function analyze(file: ProjectFile, known: Set<string>): PageParts {
  const html = file.content;
  const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? '';
  const bodyMatch = html.match(/<body([^>]*)>([\s\S]*?)<\/body>/i);
  const bodyRaw = bodyMatch ? bodyMatch[2] : html.replace(/<!doctype[^>]*>|<\/?html[^>]*>|<head[\s\S]*?<\/head>/gi, '');
  const parts: PageParts = {
    path: file.path, headExternal: [], localCss: [], scripts: [], inlineScripts: [], inlineStyles: [], jsonLd: [], bodyHtml: '',
    title: head.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim(),
    description: head.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']*)["']/i)?.[1],
    bodyClass: bodyMatch ? getAttr(`<body${bodyMatch[1]}>`, 'class') : undefined,
    htmlLang: html.match(/<html[^>]*\blang=["']([^"']+)["']/i)?.[1],
  };
  for (const m of head.matchAll(/<link\b[^>]*>/gi)) {
    const tag = m[0], href = getAttr(tag, 'href') || '';
    if (/rel=["']?stylesheet/i.test(tag) || /rel=["']?(?:preconnect|dns-prefetch|preload)/i.test(tag)) {
      const local = resolveLocal(file.path, href);
      if (local && known.has(local)) parts.localCss.push(local); else if (!local) parts.headExternal.push(tag);
    }
  }
  for (const m of head.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) parts.inlineStyles.push(m[1]);
  const scanScripts = (area: string, inHead: boolean) => {
    for (const m of area.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
      const tag = `<script${m[1]}>`, src = getAttr(tag, 'src'), type = getAttr(tag, 'type') || '';
      if (/json/i.test(type)) { parts.jsonLd.push(m[0]); continue; }
      if (src) {
        const local = resolveLocal(file.path, src);
        if (!local) { if (inHead) parts.headExternal.push(m[0].replace(/<\/script\s*>$/i, '</script>')); else parts.scripts.push({ src, module: false }); }
        else parts.scripts.push({ src: publicUrl(local), module: /module/i.test(type) });
      } else if (m[2].trim()) parts.inlineScripts.push(m[2]);
    }
  };
  scanScripts(head, true);
  scanScripts(bodyRaw, false);
  for (const m of bodyRaw.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)) parts.inlineStyles.push(m[1]);
  parts.bodyHtml = bodyRaw.replace(/<script\b[\s\S]*?<\/script\s*>/gi, '').replace(/<style\b[\s\S]*?<\/style\s*>/gi, '').replace(/<noscript\b[\s\S]*?<\/noscript\s*>/gi, '').trim();
  return parts;
}

// ---------------------------------------------------------------- generators

const LOADER = (ts: boolean) => `// Runs the original page scripts (jQuery, sliders, menus ...) after React has drawn the markup.
// Scripts that wait for DOMContentLoaded / load are told the page is ready, because React renders after those events.
export const legacyScripts${ts ? ': { src: string; module: boolean }[]' : ''} = __SCRIPTS__;

let started = false;

export function loadLegacyScripts()${ts ? ': void' : ''} {
  if (started || legacyScripts.length === 0) return;
  started = true;
  const addDoc = document.addEventListener.bind(document);
  const addWin = window.addEventListener.bind(window);
  const docReady = document.readyState !== 'loading';
  const winReady = document.readyState === 'complete';
  if (docReady) {
    document.addEventListener = ((type${ts ? ': string' : ''}, fn${ts ? ': any' : ''}, opts${ts ? '?: any' : ''}) => (type === 'DOMContentLoaded' ? void setTimeout(() => fn.call(document, new Event(type))) : addDoc(type, fn, opts)))${ts ? ' as typeof document.addEventListener' : ''};
  }
  if (winReady) {
    window.addEventListener = ((type${ts ? ': string' : ''}, fn${ts ? ': any' : ''}, opts${ts ? '?: any' : ''}) => (type === 'load' ? void setTimeout(() => fn.call(window, new Event(type))) : addWin(type, fn, opts)))${ts ? ' as typeof window.addEventListener' : ''};
  }
  const restore = () => { document.addEventListener = addDoc${ts ? ' as typeof document.addEventListener' : ''}; window.addEventListener = addWin${ts ? ' as typeof window.addEventListener' : ''}; };
  let i = 0;
  const next = () => {
    if (i >= legacyScripts.length) { setTimeout(restore, 50); return; }
    const { src, module } = legacyScripts[i++];
    const el = document.createElement('script');
    el.src = src;
    el.async = false;
    if (module) el.type = 'module';
    el.onload = next;
    el.onerror = () => { console.error('Could not load ' + src); next(); };
    document.body.appendChild(el);
  };
  next();
}
`;

function pagesRouter(pages: { name: string; routes: string[] }[], ts: boolean): { imports: string; body: string } {
  const routeLines = ["  '/': Home,", "  '/index.html': Home,", ...pages.flatMap((p) => p.routes.map((r) => `  '${r}': ${p.name},`))];
  const imports = pages.map((p) => `import ${p.name} from './pages/${p.name}';`).join('\n');
  const body = `const routes${ts ? ': Record<string, () => JSX.Element>' : ''} = {\n${routeLines.join('\n')}\n};

export default function App() {
  const [path, setPath] = useState(routes[window.location.pathname] ? window.location.pathname : '/');
  useEffect(() => { loadLegacyScripts(); }, []);
  useEffect(() => {
    // Links between exported pages (about.html ...) switch the page without a reload.
    const onClick = (e${ts ? ': MouseEvent' : ''}) => {
      const a = (e.target${ts ? ' as HTMLElement' : ''}).closest?.('a[href]')${ts ? ' as HTMLAnchorElement | null' : ''};
      if (!a || a.target === '_blank' || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || !routes[url.pathname]) return;
      e.preventDefault();
      window.history.pushState({}, '', url.pathname + url.hash);
      setPath(url.pathname);
      if (!url.hash) window.scrollTo(0, 0);
    };
    const onPop = () => setPath(routes[window.location.pathname] ? window.location.pathname : '/');
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onPop);
    return () => { document.removeEventListener('click', onClick); window.removeEventListener('popstate', onPop); };
  }, []);
  const Page = routes[path] || Home;
  return <Page />;
}
`;
  return { imports, body };
}

function readme(name: string, ts: boolean, target: Target, notes: string[], hasPages: boolean): string {
  const stack: Record<Target, string> = { html: 'plain CSS', bootstrap: 'Bootstrap 5 (loaded from its CDN in index.html)', tailwind: 'Tailwind CSS (Play CDN script in index.html)' };
  return `# ${name}

${ts ? 'React + TypeScript' : 'React (JavaScript)'} project generated by Pixel2Code. Styling: ${stack[target]}.

## Run it

You need Node.js 18 or newer.

\`\`\`
npm install
npm run dev
\`\`\`

Open the address it prints (usually http://localhost:5173).

## Build for production

\`\`\`
npm run build
npm run preview
\`\`\`

The finished site is in the \`dist/\` folder. ${hasPages ? 'This project has several pages, so your host must send every path to index.html (an "SPA fallback").' : ''}

## Folder guide

- \`src/components/\` – one component per section of the page (header, sections, footer ...)
${hasPages ? '- `src/pages/` – the other pages of the site\n' : ''}- \`src/styles/\` – your CSS files
- \`public/\` – images and the original JavaScript files (served as they are)
- \`src/legacyScripts.${ts ? 'ts' : 'js'}\` – loads the original page scripts after React draws the page

## Conversion notes

${notes.length ? notes.map((n) => '- ' + n).join('\n') : '- Nothing needed manual attention.'}
- Interactions that came from the original JavaScript still work because those scripts run against the rendered markup. When you add React state later, move that logic into components step by step.
`;
}

// ---------------------------------------------------------------- main entry

export function buildExport(opts: { name: string; target: Target; files: ProjectFile[]; assets: ProjectAsset[]; kind: ExportKind }): ExportResult {
  const { name, target, files, assets, kind } = opts;
  const notes: string[] = [];
  if (kind === 'assets') {
    if (!assets.length) notes.push('This project has no images.');
    return { files: [{ path: 'README.txt', content: `Images exported from "${name}" by Pixel2Code.\nThey keep the exact paths used in the code.\n` }], assets, notes };
  }

  const ts = kind === 'react-ts', x = ts ? 'tsx' : 'jsx', e = ts ? 'ts' : 'js';
  const known = new Set([...files.map((f) => f.path), ...assets.map((a) => a.path)]);
  const htmlFiles = files.filter((f) => isHtml(f.path));
  if (!htmlFiles.length) throw new Error('This project has no HTML file to convert. Add an index.html first.');
  const entry = htmlFiles.find((f) => /(^|\/)index\.html$/i.test(f.path)) || htmlFiles[0];
  const pages = [entry, ...htmlFiles.filter((f) => f !== entry)].map((f) => analyze(f, known));
  const main = pages[0];
  const out: ProjectFile[] = [];
  const ctxNotes = new Set<string>();

  // CSS: every stylesheet moves to src/styles, with url() fixed to the public folder.
  const cssOrder: string[] = [];
  for (const p of pages) for (const c of p.localCss) if (!cssOrder.includes(c)) cssOrder.push(c);
  for (const f of files) if (isCss(f.path) && !cssOrder.includes(f.path)) cssOrder.push(f.path);
  const cssImports: string[] = [];
  const usedCss = new Set<string>();
  for (const cp of cssOrder) {
    const f = files.find((q) => q.path === cp);
    if (!f) continue;
    let base = cp.split('/').pop()!; if (usedCss.has(base)) base = cp.replace(/\//g, '-'); usedCss.add(base);
    out.push({ path: `src/styles/${base}`, content: rewriteCssUrls(f.content, cp) });
    cssImports.push(`import './styles/${base}';`);
  }
  const inlineCss = pages.flatMap((p) => p.inlineStyles).map((s) => rewriteCssUrls(s, entry.path)).join('\n\n').trim();
  if (inlineCss) { out.push({ path: 'src/styles/inline.css', content: inlineCss + '\n' }); cssImports.push("import './styles/inline.css';"); }

  // JS: original scripts are served from public/ and run after render.
  const scripts: { src: string; module: boolean }[] = [];
  for (const p of pages) for (const s of p.scripts) if (!scripts.some((q) => q.src === s.src)) scripts.push(s);
  let inlineN = 0;
  for (const p of pages) for (const code of p.inlineScripts) { const path = `js/inline-${++inlineN}.js`; out.push({ path: 'public/' + path, content: code }); scripts.push({ src: '/' + path, module: false }); }
  for (const f of files) {
    if (isHtml(f.path) || isCss(f.path)) continue;
    if (/^(?:package(?:-lock)?\.json|README\.md|\.gitignore)$/i.test(f.path)) continue;
    out.push({ path: 'public/' + f.path, content: f.content }); // js, json, svg, txt ... keep their exact paths
    if (isJs(f.path) && !scripts.some((q) => q.src === '/' + f.path) && !/(^|\/)(?:tailwind|vite|webpack)\.config\./i.test(f.path)) notes.push(`${f.path} is not linked from the page, so it was copied to public/ but not loaded.`);
  }

  // Components for the main page (split by top-level sections), page components for the rest.
  const ctx: Ctx = { from: entry.path, ts, notes: ctxNotes };
  const used = new Set<string>(['App', 'Home']);
  const components: { name: string; jsx: string }[] = [];
  let wrapperOpen = '', wrapperClose = '';
  let nodes = splitElements(main.bodyHtml);
  if (nodes && nodes.length === 1 && /^(?:div|main)$/.test(nodes[0].name)) {
    const inner = splitElements(nodes[0].inner);
    if (inner && inner.length >= 2) { wrapperOpen = convertTag(nodes[0].open, ctx); wrapperClose = `</${nodes[0].name}>`; nodes = inner; }
  }
  if (nodes && nodes.length) for (let i = 0; i < nodes.length; i++) { const n = nodes[i]; components.push({ name: componentName(n, i, used), jsx: htmlToJsx(n.raw, ctx) }); }
  else components.push({ name: 'Page', jsx: htmlToJsx(main.bodyHtml, ctx) });
  used.add('Page');
  for (const c of components) out.push({ path: `src/components/${c.name}.${x}`, content: componentFile(c.name, c.jsx) });

  const pageComps: { name: string; routes: string[] }[] = [];
  for (const p of pages.slice(1)) {
    const base = pascal(p.path.replace(/\.html?$/i, '').replace(/\//g, '-'), 'Page') + 'Page';
    let nm = base, k = 2; while (used.has(nm)) nm = base + k++; used.add(nm);
    const pctx: Ctx = { from: p.path, ts, notes: ctxNotes };
    out.push({ path: `src/pages/${nm}.${x}`, content: componentFile(nm, htmlToJsx(p.bodyHtml, pctx)) });
    const route = '/' + p.path.replace(/^\/+/, '');
    pageComps.push({ name: nm, routes: [route, route.replace(/\.html?$/i, '')] });
  }
  for (const n of ctxNotes) notes.push(n);

  const homeJsx = components.map((c) => `<${c.name} />`).join('\n');
  const importLines = components.map((c) => `import ${c.name} from './components/${c.name}';`).join('\n');
  const homeBody = wrapperOpen ? `${wrapperOpen}\n${indent(homeJsx, 2)}\n${wrapperClose}` : `<>\n${indent(homeJsx, 2)}\n</>`;

  if (pageComps.length) {
    const r = pagesRouter(pageComps, ts);
    out.push({ path: `src/App.${x}`, content: `import { useEffect, useState } from 'react';\nimport { loadLegacyScripts } from './legacyScripts';\n${importLines}\n${r.imports}\n\nfunction Home() {\n  return (\n${indent(homeBody, 4)}\n  );\n}\n\n${r.body}` });
  } else {
    out.push({ path: `src/App.${x}`, content: `import { useEffect } from 'react';\nimport { loadLegacyScripts } from './legacyScripts';\n${importLines}\n\nexport default function App() {\n  useEffect(() => { loadLegacyScripts(); }, []);\n  return (\n${indent(homeBody, 4)}\n  );\n}\n` });
  }
  out.push({ path: `src/legacyScripts.${e}`, content: LOADER(ts).replace('__SCRIPTS__', JSON.stringify(scripts, null, 2)) });
  out.push({ path: `src/main.${x}`, content: `import { createRoot } from 'react-dom/client';\n${cssImports.join('\n')}${cssImports.length ? '\n' : ''}import App from './App';\n${main.bodyClass ? `\ndocument.body.className = ${JSON.stringify(main.bodyClass)};\n` : ''}\ncreateRoot(document.getElementById('root')${ts ? ' as HTMLElement' : ''}).render(<App />);\n` });
  if (ts) out.push({ path: 'src/vite-env.d.ts', content: '/// <reference types="vite/client" />\n' });

  // Project shell
  const pkgName = slug(name);
  const deps: Record<string, string> = { react: '^18.3.1', 'react-dom': '^18.3.1' };
  const dev: Record<string, string> = { vite: '^5.4.10', '@vitejs/plugin-react': '^4.3.3' };
  if (ts) Object.assign(dev, { typescript: '~5.6.3', '@types/react': '^18.3.12', '@types/react-dom': '^18.3.1' });
  out.push({ path: 'package.json', content: JSON.stringify({ name: pkgName, private: true, version: '1.0.0', type: 'module', scripts: { dev: 'vite', build: ts ? 'tsc --noEmit && vite build' : 'vite build', preview: 'vite preview' }, dependencies: deps, devDependencies: dev }, null, 2) + '\n' });
  out.push({ path: `vite.config.${e}`, content: `import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({ plugins: [react()] });\n` });
  if (ts) out.push({ path: 'tsconfig.json', content: JSON.stringify({ compilerOptions: { target: 'ES2020', lib: ['ES2020', 'DOM', 'DOM.Iterable'], module: 'ESNext', moduleResolution: 'bundler', jsx: 'react-jsx', strict: true, noEmit: true, skipLibCheck: true, isolatedModules: true, resolveJsonModule: true, types: ['vite/client'] }, include: ['src', 'vite.config.ts'] }, null, 2) + '\n' });

  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const headTags = [...new Set(pages.flatMap((p) => p.headExternal))];
  out.push({ path: 'index.html', content: `<!doctype html>\n<html lang="${main.htmlLang || 'en'}">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>${esc(main.title || name)}</title>\n${main.description ? `    <meta name="description" content="${main.description.replace(/"/g, '&quot;')}" />\n` : ''}${headTags.map((t) => '    ' + t).join('\n')}${headTags.length ? '\n' : ''}${main.jsonLd.map((t) => '    ' + t).join('\n')}${main.jsonLd.length ? '\n' : ''}  </head>\n  <body>\n    <div id="root"></div>\n    <script type="module" src="/src/main.${x}"></script>\n  </body>\n</html>\n` });
  out.push({ path: '.gitignore', content: 'node_modules/\ndist/\n.env\n.DS_Store\n' });
  if (pageComps.length) notes.push(`Extra pages (${pageComps.map((p) => p.name).join(', ')}) are switched with a tiny built-in router. For bigger sites consider react-router.`);
  out.push({ path: 'README.md', content: readme(name, ts, target, notes, pageComps.length > 0) });

  return { files: out, assets: assets.map((a) => ({ ...a, path: 'public/' + a.path })), notes };
}