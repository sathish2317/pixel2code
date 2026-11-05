// Layout Kit: reads a ZIP that contains a header and/or footer (or any section) and works out
// - which files it has (html / css / js / images / fonts),
// - which of them make it responsive and why,
// - a responsive score and a list of problems,
// - the combined html / css / js (+ images) that can be saved as a "My component".
// Everything is only READ as text. Nothing from the ZIP is executed here.

import { ProjectAsset } from '../types';
import {
  IMAGE_EXT,
  MAX_ASSET_BYTES,
  analyzeRefs,
  dirOf,
  fuzzyAsset,
  isExternal,
  mapRefs,
  mimeFromPath,
  normalizeRef,
  readZip,
  resolveFrom,
} from './assets';

export type KitRole = 'html' | 'css' | 'js' | 'image' | 'font' | 'other';
export type KitKind = 'header' | 'footer' | 'header+footer' | 'section';

export interface KitFile {
  path: string;
  bytes: number;
  role: KitRole;
  responsive: string[];
}

export interface KitAnalysis {
  analyzedAt: number;
  sourceName: string;
  kind: KitKind;
  entry: string[];
  files: KitFile[];
  counts: Record<KitRole, number>;
  breakpoints: number[];
  frameworks: string[];
  viewportMeta: boolean;
  responsiveScore: number;
  responsiveFiles: string[];
  findings: string[];
  testWidths: number[];
}

export interface KitResult {
  analysis: KitAnalysis;
  html: string;
  css: string;
  js: string;
  assets: ProjectAsset[];
  sourceFiles: { path: string; content: string }[];
}

const TEXT_ROLE: Record<string, KitRole> = {
  html: 'html',
  htm: 'html',
  css: 'css',
  js: 'js',
  mjs: 'js',
};

const FONT_EXT = /\.(woff2?|ttf|otf|eot)$/i;

const IGNORED =
  /(^|\/)(node_modules|\.git|__MACOSX|\.idea|\.vscode)\/|(^|\/)(\.DS_Store|Thumbs\.db)$/;

const MAX_ENTRIES = 1500;
const MAX_TEXT_BYTES = 800_000;

// Maximum size of an individual image or font.
const MAX_KIT_ASSET_BYTES = 20 * 1024 * 1024;

// Maximum combined size of imported images and fonts.
const MAX_KIT_ASSET_TOTAL_BYTES = 100 * 1024 * 1024;

export function roleOf(path: string): KitRole {
  const ext = (path.split('.').pop() || '').toLowerCase();

  if (TEXT_ROLE[ext]) return TEXT_ROLE[ext];
  if (IMAGE_EXT.test(path)) return 'image';
  if (FONT_EXT.test(path)) return 'font';

  return 'other';
}

// ---------------------------------------------------------------------------------------------
// CSS / HTML / JS inspection
// ---------------------------------------------------------------------------------------------

const stripCssComments = (css: string) =>
  css.replace(/\/\*[\s\S]*?\*\//g, '');

/** Widths (px) of min-width / max-width / range media queries. em and rem count as 16px. */
export function breakpointsIn(css: string): number[] {
  const out = new Set<number>();
  const text = stripCssComments(css);

  const px = (n: string, u: string) =>
    Math.round(parseFloat(n) * (u === 'px' ? 1 : 16));

  for (const m of text.matchAll(/@media[^{]*/gi)) {
    for (const q of m[0].matchAll(
      /\(\s*(?:min|max)-width\s*:\s*([\d.]+)(px|em|rem)\s*\)/gi
    )) {
      out.add(px(q[1], q[2].toLowerCase()));
    }

    for (const q of m[0].matchAll(
      /\(\s*width\s*(?:>=|<=|>|<)\s*([\d.]+)(px|em|rem)\s*\)/gi
    )) {
      out.add(px(q[1], q[2].toLowerCase()));
    }

    for (const q of m[0].matchAll(
      /([\d.]+)(px|em|rem)\s*(?:<=|<)\s*width/gi
    )) {
      out.add(px(q[1], q[2].toLowerCase()));
    }
  }

  return [...out]
    .filter((n) => n > 0 && n < 4000)
    .sort((a, b) => a - b);
}

export interface CssFacts {
  breakpoints: number[];
  flex: boolean;
  grid: boolean;
  fluid: boolean;
  containerQueries: boolean;
  bigFixedWidths: number[];
  hasMobileMenuCss: boolean;
  fluidImages: boolean;
}

export function cssFacts(cssRaw: string): CssFacts {
  const css = stripCssComments(cssRaw);
  const big: number[] = [];

  for (const m of css.matchAll(
    /(?:^|[;{\s])width\s*:\s*(\d{3,4})px/gi
  )) {
    if (+m[1] >= 900) big.push(+m[1]);
  }

  return {
    breakpoints: breakpointsIn(css),
    flex: /display\s*:\s*(?:inline-)?flex\b/i.test(css),
    grid: /display\s*:\s*(?:inline-)?grid\b/i.test(css),
    fluid:
      /\b(?:clamp|min|max)\(|\d\s*v[wh]\b|width\s*:\s*\d+(?:\.\d+)?%/i.test(
        css
      ),
    containerQueries: /@container\b/i.test(css),
    bigFixedWidths: [...new Set(big)],
    hasMobileMenuCss:
      /(?:hamburger|menu-toggle|nav-toggle|navbar-toggler|burger|toggler|mobile-menu|menu-btn|menu-icon)|:checked\s*~|:target/i.test(
        css
      ),
    fluidImages:
      /(?:img|picture|video|svg)[^{}]*\{[^{}]*max-width\s*:\s*100%/i.test(
        css
      ) || /max-width\s*:\s*100%/i.test(css),
  };
}

export interface HtmlFacts {
  viewportMeta: boolean;
  picture: boolean;
  srcset: boolean;
  hasHeader: boolean;
  hasNav: boolean;
  hasFooter: boolean;
  frameworks: string[];
  frameworkResponsive: boolean;
  toggler: boolean;
  cssLinks: string[];
  scriptSrcs: string[];
  inlineCss: string;
  inlineJs: string;
}

const FRAMEWORKS: [string, RegExp][] = [
  ['Bootstrap', /bootstrap/i],
  ['Tailwind CSS', /tailwind/i],
  ['jQuery', /jquery/i],
  ['Font Awesome', /font-?awesome|fontawesome/i],
  ['Bootstrap Icons', /bootstrap-icons/i],
  ['Owl Carousel', /owl\.?carousel/i],
  ['Swiper', /swiper/i],
  ['Slick', /slick/i],
  ['AOS', /\baos\b/i],
  ['Animate.css', /animate(?:\.min)?\.css/i],
  ['Google Fonts', /fonts\.googleapis\.com/i],
  ['Foundation', /foundation/i],
  ['Bulma', /bulma/i],
];

export function htmlFacts(html: string): HtmlFacts {
  const links: string[] = [];
  const scripts: string[] = [];

  for (const m of html.matchAll(/<link\b[^>]*>/gi)) {
    if (!/rel\s*=\s*["']?stylesheet/i.test(m[0])) continue;

    const h = /href\s*=\s*["']?([^"'\s>]+)/i.exec(m[0])?.[1];

    if (h) links.push(h);
  }

  for (const m of html.matchAll(
    /<script\b[^>]*\bsrc\s*=\s*["']?([^"'\s>]+)/gi
  )) {
    scripts.push(m[1]);
  }

  const inlineCss = [
    ...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi),
  ]
    .map((m) => m[1])
    .join('\n');

  const inlineJs = [
    ...html.matchAll(
      /<script\b(?![^>]*\bsrc\s*=)[^>]*>([\s\S]*?)<\/script>/gi
    ),
  ]
    .map((m) => m[1])
    .join('\n');

  const refs = [...links, ...scripts].join(' ');

  const frameworks = FRAMEWORKS.filter(([, re]) => re.test(refs)).map(
    ([n]) => n
  );

  if (
    !frameworks.includes('Bootstrap') &&
    /\bcol-(?:sm|md|lg|xl)-\d+|\bnavbar-expand-(?:sm|md|lg|xl)\b/.test(
      html
    )
  ) {
    frameworks.push('Bootstrap');
  }

  return {
    viewportMeta:
      /<meta\b[^>]*name\s*=\s*["']viewport["'][^>]*>/i.test(html),
    picture: /<picture\b/i.test(html),
    srcset: /\bsrcset\s*=/i.test(html),
    hasHeader: /<header\b/i.test(html),
    hasNav: /<nav\b/i.test(html),
    hasFooter: /<footer\b/i.test(html),
    frameworks,
    frameworkResponsive:
      /\bcol-(?:sm|md|lg|xl|xxl)-\d+|\bnavbar-expand-(?:sm|md|lg|xl)\b|\bd-(?:sm|md|lg|xl)-(?:none|block|flex)\b|\b(?:sm|md|lg|xl|2xl):[a-z-]+/.test(
        html
      ),
    toggler:
      /(?:navbar-toggler|hamburger|menu-toggle|nav-toggle|burger|menu-btn|aria-expanded|data-bs-toggle\s*=\s*["']collapse)/i.test(
        html
      ) ||
      /type\s*=\s*["']checkbox["'][^>]*(?:menu|nav)/i.test(html),
    cssLinks: links,
    scriptSrcs: scripts,
    inlineCss,
    inlineJs,
  };
}

export interface JsFacts {
  menuToggle: boolean;
  matchMedia: boolean;
  resize: boolean;
}

export function jsFacts(js: string): JsFacts {
  return {
    menuToggle:
      /(?:classList\.(?:toggle|add|remove)|aria-expanded|\.toggle\(|slideToggle|style\.display)/.test(
        js
      ) &&
      /addEventListener\(\s*['"]click|\.on\(\s*['"]click|\.click\(|onclick/.test(
        js
      ),
    matchMedia: /matchMedia\(/.test(js),
    resize: /addEventListener\(\s*['"]resize|\.resize\(|innerWidth/.test(js),
  };
}

// ---------------------------------------------------------------------------------------------
// Responsive score
// ---------------------------------------------------------------------------------------------

export interface ScoreInput {
  viewportMeta: boolean;
  breakpoints: number[];
  frameworkResponsive: boolean;
  flexOrGrid: boolean;
  fluid: boolean;
  hasNav: boolean;
  mobileMenu: boolean;
  fluidImages: boolean;
  bigFixedWidths: number[];
}

export function responsiveScore(s: ScoreInput): number {
  let n = 0;

  if (s.viewportMeta) n += 20;

  const bps = s.breakpoints.length + (s.frameworkResponsive ? 2 : 0);

  n += bps >= 2 ? 25 : bps === 1 ? 15 : 0;

  if (s.flexOrGrid || s.frameworkResponsive) n += 15;
  if (s.fluid || s.frameworkResponsive) n += 10;

  n += !s.hasNav || s.mobileMenu ? 15 : 0;

  if (s.fluidImages) n += 5;
  if (!s.bigFixedWidths.length) n += 10;

  return Math.min(100, n);
}

/** Widths to test: common phone/tablet/laptop sizes plus breakpoint boundaries. */
export function testWidthsFor(bps: number[]): number[] {
  const set = new Set<number>([320, 390, 768, 1024, 1440]);

  for (const b of bps) {
    if (b >= 280 && b <= 2000) {
      set.add(b - 1);
      set.add(b);
    }
  }

  return [...set].sort((a, b) => a - b).slice(0, 14);
}

// ---------------------------------------------------------------------------------------------
// ZIP -> analysis + component code
// ---------------------------------------------------------------------------------------------

const bodyOf = (html: string) => {
  const m = /<body\b[^>]*>([\s\S]*?)<\/body>/i.exec(html);

  return m
    ? m[1]
    : html
        .replace(/<!doctype[^>]*>/i, '')
        .replace(/<\/?(?:html|head)\b[^>]*>/gi, '')
        .replace(/<title\b[\s\S]*?<\/title>/i, '')
        .replace(/<meta\b[^>]*>/gi, '');
};

function sortHtml(paths: string[]): string[] {
  const rank = (p: string) =>
    /footer/i.test(p) ? 2 : /header|nav|top/i.test(p) ? 0 : 1;

  return [...paths].sort(
    (a, b) => rank(a) - rank(b) || a.length - b.length || a.localeCompare(b)
  );
}

export async function analyzeKitZip(
  data: ArrayBuffer | Uint8Array,
  sourceName: string
): Promise<KitResult> {
  let zip: Awaited<ReturnType<typeof readZip>>;

  try {
    zip = await readZip(data);
  } catch {
    throw new Error(
      'That file is not a valid ZIP (or it is password protected).'
    );
  }

  const entries = Object.values(zip.files).filter(
    (e) => !e.dir && !IGNORED.test(e.name.replace(/\\/g, '/'))
  );

  if (!entries.length) {
    throw new Error('The ZIP is empty.');
  }

  if (entries.length > MAX_ENTRIES) {
    throw new Error(
      `The ZIP has ${entries.length} files (max ${MAX_ENTRIES}). Zip only the header/footer folder.`
    );
  }

  const names = entries.map((e) => e.name.replace(/\\/g, '/'));
  const top = names[0].split('/')[0];

  const strip = names.every((n) => n.startsWith(top + '/'))
    ? top + '/'
    : '';

  const findings: string[] = [];
  const files: KitFile[] = [];
  const text = new Map<string, string>();
  const assets: ProjectAsset[] = [];
  const sourceFiles: { path: string; content: string }[] = [];

  let assetTotal = 0;
  let textTotal = 0;

  // Read files from the ZIP.
  for (let i = 0; i < entries.length; i++) {
    const path = names[i].slice(strip.length);

    if (
      !path ||
      path.split('/').includes('..') ||
      path.startsWith('/') ||
      /^[a-zA-Z]:/.test(path)
    ) {
      findings.push(`Skipped an unsafe path: ${path.slice(0, 80)}`);
      continue;
    }

    const e = entries[i];
    const role = roleOf(path);

    const declared: number = (e as any)._data?.uncompressedSize ?? 0;

    files.push({
      path,
      bytes: declared,
      role,
      responsive: [],
    });

    if (role === 'html' || role === 'css' || role === 'js') {
      if (declared > MAX_TEXT_BYTES) {
        findings.push(
          `${path} is larger than ${Math.round(
            MAX_TEXT_BYTES / 1000
          )} KB and was not analyzed.`
        );
        continue;
      }

      if (textTotal > 8_000_000) {
        findings.push(
          'The ZIP holds too much code; the rest was not analyzed.'
        );
        break;
      }

      const t = (await e.async('string'))
        .replace(/^﻿/, '')
        .replace(/\r\n?/g, '\n');

      textTotal += t.length;

      text.set(path, t);
      sourceFiles.push({
        path,
        content: t,
      });

      files[files.length - 1].bytes = t.length;
    } else if (role === 'image' || role === 'font') {
      // The imported limit must respect both the general asset limit and
      // the limit configured for Layout Kit.
      const individualLimit = Math.min(
        MAX_ASSET_BYTES,
        MAX_KIT_ASSET_BYTES
      );

      if (declared > individualLimit) {
        findings.push(
          `Asset "${path}" was skipped because it exceeds the individual asset limit of ${Math.round(
            individualLimit / (1024 * 1024)
          )} MB.`
        );
        continue;
      }

      // Check the combined size of imported assets.
      if (assetTotal + declared > MAX_KIT_ASSET_TOTAL_BYTES) {
        findings.push(
          `Asset "${path}" was skipped because importing it would exceed the combined asset limit of ${Math.round(
            MAX_KIT_ASSET_TOTAL_BYTES / (1024 * 1024)
          )} MB.`
        );
        continue;
      }

      try {
        const base64 = await e.async('base64');

        if (!base64) {
          findings.push(`Asset "${path}" could not be read from the ZIP.`);
          continue;
        }

        assets.push({
          path,
          mime: mimeFromPath(path),
          base64,
        });

        assetTotal += declared;
      } catch {
        findings.push(`Asset "${path}" could not be extracted from the ZIP.`);
      }
    }
  }

  const htmlPaths = sortHtml(
    [...text.keys()].filter((p) => roleOf(p) === 'html')
  );

  if (!htmlPaths.length) {
    throw new Error(
      'No .html file found in the ZIP. A header/footer ZIP needs at least one HTML file (for example index.html or header.html).'
    );
  }

  const index = htmlPaths.find((p) => /(^|\/)index\.html?$/i.test(p));

  const chosen = index
    ? [index]
    : htmlPaths.length > 6
      ? htmlPaths.slice(0, 6)
      : htmlPaths;

  if (!index && htmlPaths.length > chosen.length) {
    findings.push(
      `${htmlPaths.length} HTML files found; only the first ${chosen.length} were combined.`
    );
  }

  // Keep references to imported assets unchanged when their paths exist.
  const assetPaths = new Set(assets.map((a) => a.path));

  // Points every image / font reference to its path from the ZIP root (the combined page lives at the root).
  // Exact match first, then a forgiving one (upper/lower case, missing folder) so "Images/Logo.PNG" still finds images/logo.png.
  // Fonts are included for CSS: @font-face url(../fonts/x.woff2) is read from the CSS file's own folder.
  const fix = (kind: 'html' | 'css', content: string, dir: string) =>
    mapRefs(content, kind, (ref) => {
      if (isExternal(ref)) return undefined;

      const r = resolveFrom(dir, normalizeRef(ref));

      if (assetPaths.has(r)) return r;

      const lower = [...assetPaths].find((p) => p.toLowerCase() === r.toLowerCase());

      return lower ?? fuzzyAsset(ref, assets);
    }, kind === 'css');

  // ----- Facts per file -----

  let viewportMeta = false;
  let hasNav = false;
  let hasHeader = false;
  let hasFooter = false;
  let frameworkResponsive = false;
  let toggler = false;

  let flexOrGrid = false;
  let fluid = false;
  let fluidImages = false;
  let mobileMenuCss = false;
  let mobileMenuJs = false;

  const frameworks = new Set<string>();
  const allBps = new Set<number>();
  const bigWidths = new Set<number>();

  const orderedCss: string[] = [];
  const orderedJs: string[] = [];
  const cdnHead: string[] = [];

  const seenCss = new Set<string>();
  const seenJs = new Set<string>();

  const htmlOut: string[] = [];

  const fileOf = (p: string) => files.find((f) => f.path === p);

  const note = (p: string, why: string) => {
    const f = fileOf(p);

    if (f && !f.responsive.includes(why)) {
      f.responsive.push(why);
    }
  };

  const takeCss = (p: string, css: string) => {
    if (seenCss.has(p)) return;

    seenCss.add(p);

    const f = cssFacts(css);

    f.breakpoints.forEach((b) => allBps.add(b));
    f.bigFixedWidths.forEach((b) => bigWidths.add(b));

    if (f.breakpoints.length) {
      note(p, `media queries at ${f.breakpoints.join(', ')}px`);
    }

    if (f.flex) note(p, 'flexbox layout');
    if (f.grid) note(p, 'grid layout');
    if (f.fluid) note(p, 'fluid sizes (clamp / vw / %)');

    if (f.containerQueries) {
      note(p, 'container queries');
    }

    if (f.hasMobileMenuCss) {
      note(p, 'mobile menu styles');
    }

    if (f.fluidImages) {
      note(p, 'images shrink to fit (max-width:100%)');
    }

    flexOrGrid ||= f.flex || f.grid;
    fluid ||= f.fluid;
    fluidImages ||= f.fluidImages;
    mobileMenuCss ||= f.hasMobileMenuCss;
  };

  const takeJs = (p: string, js: string) => {
    if (seenJs.has(p)) return;

    seenJs.add(p);

    const f = jsFacts(js);

    if (f.menuToggle) note(p, 'menu open/close script');
    if (f.matchMedia) note(p, 'matchMedia (screen-size logic)');
    if (f.resize) note(p, 'resize handling');

    mobileMenuJs ||= f.menuToggle;
  };

  // Combine the selected HTML files and their referenced CSS/JS.
  for (const hp of chosen) {
    const html = text.get(hp)!;
    const dir = dirOf(hp);
    const hf = htmlFacts(html);

    viewportMeta ||= hf.viewportMeta;
    hasNav ||= hf.hasNav;
    hasHeader ||= hf.hasHeader;
    hasFooter ||= hf.hasFooter;

    frameworkResponsive ||= hf.frameworkResponsive;
    toggler ||= hf.toggler;

    hf.frameworks.forEach((x) => frameworks.add(x));

    if (hf.viewportMeta) note(hp, 'viewport meta tag');

    if (hf.frameworkResponsive) {
      note(
        hp,
        'responsive framework classes (col-md-*, navbar-expand-*, md:...)'
      );
    }

    if (hf.picture || hf.srcset) {
      note(hp, 'responsive images (picture / srcset)');
    }

    if (hf.toggler) {
      note(hp, 'menu toggle markup');
    }

    // Stylesheets.
    for (const href of hf.cssLinks) {
      if (isExternal(href)) {
        cdnHead.push(`<link rel="stylesheet" href="${href}">`);
        continue;
      }

      const p = resolveFrom(dir, normalizeRef(href));
      const css = text.get(p);

      if (css === undefined) {
        findings.push(
          `${hp} links to ${href}, but that file is not in the ZIP.`
        );
        continue;
      }

      takeCss(p, css);

      if (!orderedCss.some((x) => x.startsWith(`/* ${p} */`))) {
        orderedCss.push(
          `/* ${p} */\n${fix('css', css, dirOf(p))}`
        );
      }
    }

    // Inline styles.
    if (hf.inlineCss.trim()) {
      const css = hf.inlineCss;
      const f = cssFacts(css);

      f.breakpoints.forEach((b) => allBps.add(b));
      f.bigFixedWidths.forEach((b) => bigWidths.add(b));

      if (f.breakpoints.length) {
        note(
          hp,
          `inline <style> media queries at ${f.breakpoints.join(', ')}px`
        );
      }

      flexOrGrid ||= f.flex || f.grid;
      fluid ||= f.fluid;
      fluidImages ||= f.fluidImages;
      mobileMenuCss ||= f.hasMobileMenuCss;

      orderedCss.push(
        `/* ${hp} (inline) */\n${fix('css', css, dir)}`
      );
    }

    // JavaScript files.
    for (const src of hf.scriptSrcs) {
      if (isExternal(src)) {
        cdnHead.push(`<script src="${src}"></script>`);
        continue;
      }

      const p = resolveFrom(dir, normalizeRef(src));
      const js = text.get(p);

      if (js === undefined) {
        findings.push(`${hp} loads ${src}, but that file is not in the ZIP.`);
        continue;
      }

      takeJs(p, js);

      if (!orderedJs.some((x) => x.startsWith(`// ${p}\n`))) {
        orderedJs.push(`// ${p}\n${js}`);
      }
    }

    // Inline JavaScript.
    if (hf.inlineJs.trim()) {
      takeJs(hp + '#inline', hf.inlineJs);

      orderedJs.push(`// ${hp} (inline)\n${hf.inlineJs}`);

      note(
        hp,
        jsFacts(hf.inlineJs).menuToggle
          ? 'inline menu script'
          : 'inline script'
      );
    }

    // Extract body markup and remove stylesheets/scripts already collected.
    let body = bodyOf(html)
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<link\b[^>]*rel\s*=\s*["']?stylesheet[^>]*>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '')
      .trim();

    body = fix('html', body, dir);

    htmlOut.push(`<!-- ${hp} -->\n${body}`);
  }

  // Stylesheets / scripts that the selected HTML does not link (typical for a header.html + footer.html pair that ships
  // style.css and main.js next to it). They ARE the header/footer's responsive code, so they are added to the saved code.
  const looseJs: string[] = [];

  for (const p of text.keys()) {
    const role = roleOf(p);

    if (role === 'css' && !seenCss.has(p)) {
      takeCss(p, text.get(p)!);

      orderedCss.push(`/* ${p} (not linked in the HTML, added automatically) */\n${fix('css', text.get(p)!, dirOf(p))}`);

      findings.push(`${p} is not linked from the HTML, so it was added to the saved CSS automatically.`);
    }

    if (role === 'js' && !seenJs.has(p)) {
      takeJs(p, text.get(p)!);

      looseJs.push(p);

      findings.push(`${p} is not linked from the HTML, so it was added to the saved JavaScript automatically.`);
    }
  }

  // Libraries first (jquery, bootstrap, vendor, *.min.js), then the site's own scripts.
  const isLib = (p: string) => /(^|\/)(jquery|bootstrap|vendor|vendors|lib|libs|plugins?)[^/]*|\.min\.js$/i.test(p);

  looseJs
    .sort((x, y) => Number(isLib(y)) - Number(isLib(x)) || (x < y ? -1 : x > y ? 1 : 0))
    .forEach((p) => orderedJs.push(`// ${p}\n${text.get(p)!}`));

  const breakpoints = [...allBps].sort((a, b) => a - b);

  const mobileMenu = toggler || mobileMenuCss || mobileMenuJs;

  const score = responsiveScore({
    viewportMeta,
    breakpoints,
    frameworkResponsive,
    flexOrGrid,
    fluid,
    hasNav: hasNav || hasHeader,
    mobileMenu,
    fluidImages,
    bigFixedWidths: [...bigWidths],
  });

  // ----- Plain-language findings -----

  if (!viewportMeta) {
    findings.push(
      'No <meta name="viewport"> tag. Phones will show a zoomed-out desktop page. Add <meta name="viewport" content="width=device-width, initial-scale=1"> to the page that uses this kit.'
    );
  }

  if (!breakpoints.length && !frameworkResponsive) {
    findings.push(
      'No media queries and no responsive framework classes found: the layout will not change between phone, tablet and desktop.'
    );
  } else if (
    breakpoints.length &&
    Math.min(...breakpoints) > 600 &&
    !frameworkResponsive
  ) {
    findings.push(
      `The smallest breakpoint is ${Math.min(
        ...breakpoints
      )}px. Nothing is defined for small phones (under 600px).`
    );
  }

  if (!flexOrGrid && !frameworkResponsive) {
    findings.push(
      'No flexbox, grid or framework grid found. Layout may rely on floats or fixed widths.'
    );
  }

  if (bigWidths.size) {
    findings.push(
      `Fixed widths of ${[...bigWidths]
        .sort((a, b) => a - b)
        .join(', ')}px found (width, not max-width). These cause sideways scrolling on small screens.`
    );
  }

  if ((hasNav || hasHeader) && !mobileMenu) {
    findings.push(
      'A menu/navigation exists but no mobile menu (hamburger, collapse or toggle) was found.'
    );
  }

  // Say exactly which image the code asks for but the ZIP does not contain (instead of a blank spot in the preview).
  {
    const seenMissing = new Set<string>();
    const reports = analyzeRefs(
      sourceFiles.filter((f) => /\.(html?|css)$/i.test(f.path)),
      assets
    );

    for (const r of reports) {
      if (r.status !== 'missing') continue;

      const key = r.file + '|' + r.ref;

      if (seenMissing.has(key)) continue;

      seenMissing.add(key);

      if (seenMissing.size <= 10) {
        findings.push(`${r.file} uses "${r.ref}", but no image with that name is in the ZIP.`);
      }
    }

    if (seenMissing.size > 10) {
      findings.push(`...and ${seenMissing.size - 10} more missing image references.`);
    }
  }

  const heavy = assets.filter(
    (a) => (a.base64.length * 3) / 4 > 500_000
  );

  if (heavy.length) {
    findings.push(
      `Large images (over 500 KB): ${heavy
        .slice(0, 4)
        .map((a) => a.path)
        .join(', ')}. They slow down phones.`
    );
  }

  // Report missing images separately from imported fonts.
  const imageFiles = files.filter((f) => f.role === 'image');
  const importedImages = assets.filter((a) => IMAGE_EXT.test(a.path));

  if (imageFiles.length > 0 && importedImages.length === 0) {
    findings.push(
      'Images were found in the ZIP, but none were imported. Check the asset-size limits and ZIP extraction warnings.'
    );
  }

  const kind: KitKind =
    (hasHeader || hasNav) && hasFooter
      ? 'header+footer'
      : hasFooter
        ? 'footer'
        : hasHeader || hasNav
          ? 'header'
          : 'section';

  const counts: Record<KitRole, number> = {
    html: 0,
    css: 0,
    js: 0,
    image: 0,
    font: 0,
    other: 0,
  };

  files.forEach((f) => counts[f.role]++);

  const analysis: KitAnalysis = {
    analyzedAt: Date.now(),
    sourceName,
    kind,
    entry: chosen,
    files,
    counts,
    breakpoints,
    frameworks: [...frameworks],
    viewportMeta,
    responsiveScore: score,
    responsiveFiles: files
      .filter((f) => f.responsive.length)
      .map((f) => f.path),
    findings,
    testWidths: testWidthsFor(breakpoints),
  };

  const head = [...new Set(cdnHead)].join('\n');

  return {
    analysis,
    html: [head, ...htmlOut].filter(Boolean).join('\n\n').trim(),
    css: orderedCss.join('\n\n').trim(),
    js: orderedJs.join('\n\n').trim(),
    assets,
    sourceFiles,
  };
}

/** A short text version of the analysis. It is added to component notes. */
export function kitSummary(a: KitAnalysis): string {
  const bp = a.breakpoints.length
    ? `breakpoints ${a.breakpoints.join('/')}px`
    : 'no breakpoints';

  const fw = a.frameworks.length
    ? `; uses ${a.frameworks.join(', ')}`
    : '';

  const why = a.responsiveFiles.slice(0, 4).join(', ');

  return `Analyzed ${a.kind} kit "${a.sourceName}": ${a.counts.html} html, ${a.counts.css} css, ${a.counts.js} js, ${a.counts.image} images; ${bp}${fw}; responsive score ${a.responsiveScore}/100${
    why ? `; responsive logic lives in ${why}` : ''
  }.`;
}

/** Instruction lines sent with a generation when header/footer kits are selected. */
export function kitInstructions(
  list: { name: string; analysis?: KitAnalysis; kind?: string }[]
): string[] {
  const out: string[] = [];

  const hf = list.filter(
    (c) => c.analysis && c.analysis.kind !== 'section'
  );

  if (!hf.length) return out;

  out.push(
    `Keep the HTML structure, class names, JavaScript and responsive behaviour (breakpoints, mobile menu) of my saved component(s): ${hf
      .map((c) => `"${c.name}"`)
      .join(', ')}.`
  );

  out.push(
    'Restyle those components to match the design image/PDF exactly: colors, fonts, font sizes, spacing, logo, menu items, button style, icons, background. Do not keep the old look.'
  );

  out.push(
    'Header and footer must stay fully responsive from 320px to 1920px: no horizontal scroll, working mobile menu, stacked footer columns on phones.'
  );

  return out;
}