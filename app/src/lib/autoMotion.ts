// Auto motion: light hover / reveal animations for card and box content, with light tints taken from the
// reference design's colours. Output is plain CSS + a tiny script that live between the managed markers
// (see managed.ts), so it can be switched off or rebuilt at any time without touching the user's own code.
import { ProjectFile } from '../types';

export interface MotionSettings {
  enabled: boolean;
  hover: boolean; // cards/boxes lift, get a soft shadow and a light background tint
  reveal: boolean; // cards fade/slide in once when scrolled into view
  tint: boolean; // hover background uses a LIGHT tint of the design colour
  noButtonClick: boolean; // remove press (:active) animations from buttons
  palette: string[]; // 6-digit hex colours taken from the reference, most important first
}

export const defaultMotion = (palette: string[] = []): MotionSettings => ({
  enabled: true, hover: true, reveal: true, tint: true, noButtonClick: false, palette,
});

// ---------------------------------------------------------------------------------------------
// Colours
// ---------------------------------------------------------------------------------------------

export function parseHex(h: string): [number, number, number] | null {
  const m = /^#?([\da-f]{3}|[\da-f]{6})$/i.exec(h.trim());
  if (!m) return null;
  const s = m[1].length === 3 ? m[1].split('').map((c) => c + c).join('') : m[1];
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}
export const toHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');

/** Mixes a colour with white. amount 0 = the colour, 1 = white. The result is always light. */
export function lighten(hex: string, amount: number): string {
  const c = parseHex(hex);
  if (!c) return '#f4f7fb';
  return toHex(c[0] + (255 - c[0]) * amount, c[1] + (255 - c[1]) * amount, c[2] + (255 - c[2]) * amount);
}

export const luminance = (hex: string): number => {
  const c = parseHex(hex);
  if (!c) return 1;
  return (0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]) / 255;
};
const saturation = (c: [number, number, number]) => { const mx = Math.max(...c), mn = Math.min(...c); return mx === 0 ? 0 : (mx - mn) / mx; };

/**
 * Picks the main colours from raw RGBA pixels (e.g. a 64px-wide copy of the design).
 * Near-white, near-black and grey pixels are ignored: they are backgrounds and text, not the brand colours.
 */
export function paletteFromPixels(data: ArrayLike<number>, max = 4): string[] {
  const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i + 3 < data.length; i += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
    if (a < 200) continue;
    const mx = Math.max(r, g, b);
    if (mx < 50 || Math.min(r, g, b) > 225) continue;
    if (saturation([r, g, b]) < 0.18) continue;
    const key = `${r >> 5}-${g >> 5}-${b >> 5}`;
    const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
    e.n++; e.r += r; e.g += g; e.b += b;
    buckets.set(key, e);
  }
  const ranked = [...buckets.values()].sort((a, b) => b.n - a.n).map((e) => toHex(e.r / e.n, e.g / e.n, e.b / e.n));
  const out: string[] = [];
  for (const h of ranked) {
    const c = parseHex(h)!;
    if (out.every((o) => { const d = parseHex(o)!; return Math.abs(c[0] - d[0]) + Math.abs(c[1] - d[1]) + Math.abs(c[2] - d[2]) > 90; })) out.push(h);
    if (out.length >= max) break;
  }
  return out;
}

/** Web only: reads the design image in the browser and returns its brand colours. Returns [] where no canvas exists. */
export async function paletteFromImage(base64: string, mime: string): Promise<string[]> {
  try {
    if (typeof document === 'undefined' || typeof Image === 'undefined') return [];
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i); i.onerror = () => reject(new Error('image'));
      i.src = `data:${mime};base64,${base64}`;
    });
    const w = 64, h = Math.max(1, Math.round((img.height / img.width) * 64));
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = Math.min(h, 4000);
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];
    ctx.drawImage(img, 0, 0, w, canvas.height);
    return paletteFromPixels(ctx.getImageData(0, 0, w, canvas.height).data);
  } catch { return []; }
}

/** Fallback when there is no canvas (phone) or no reference image: the most used colours in the generated CSS. */
export function paletteFromFiles(files: ProjectFile[], max = 4): string[] {
  const css = files.filter((f) => /\.(css|html)$/i.test(f.path)).map((f) => f.content).join('\n');
  const count = new Map<string, number>();
  for (const m of css.matchAll(/#([\da-f]{6})\b/gi)) {
    const h = ('#' + m[1]).toLowerCase();
    const c = parseHex(h)!;
    if (Math.max(...c) < 50 || Math.min(...c) > 225 || saturation(c) < 0.18) continue;
    count.set(h, (count.get(h) || 0) + 1);
  }
  return [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, max).map(([h]) => h);
}

// ---------------------------------------------------------------------------------------------
// CSS + script
// ---------------------------------------------------------------------------------------------

/** Class-name parts that mean "this is a card or a box". Navigation and header/footer links are excluded below. */
const CARD = ['card', 'box', 'tile', 'feature', 'service', 'package', 'plan', 'pricing', 'team', 'member', 'testimonial', 'blog', 'post', 'product', 'doctor', 'treatment', 'course', 'item-box', 'info-box', 'icon-box'];
export const CARD_SELECTOR = [...CARD.map((c) => `[class*="${c}"]`), 'article'].join(',');
const NOT_NAV = ':not(nav *):not(header *):not(footer *):not(.navbar *):not(.modal *):not(.carousel-control-prev):not(.carousel-control-next)';
const NOT_BTN = ':not(button):not(a):not(input):not(.btn):not([class*="btn"]):not([class*="button"]):not([class*="nav"]):not([class*="menu"]):not([class*="toggle"]):not([class*="wrapper"]):not([class*="container"]):not([class*="-row"]):not([class*="list"]):not([class*="grid"]):not([class*="slider"]):not([class*="carousel"])';
const BTN_LIST = ['button', '.btn', 'a.btn', '[class*="btn"]', '[class*="button"]', 'input[type="submit"]', 'input[type="button"]'];
const onBtn = (suffix: string) => BTN_LIST.map((b) => b + suffix).join(',');

export const MOTION_ID = 'p2c-motion';

export function buildMotionCss(m: MotionSettings): string {
  if (!m.enabled) return '';
  const a = m.palette[0] || '#2563eb';
  const tint = m.tint ? lighten(a, 0.92) : 'transparent';
  const tintBorder = lighten(a, 0.72);
  const out: string[] = [`/* ${MOTION_ID}: generated, edit it in the Motion card (Design tab) */`];
  out.push(`:root{--p2c-tint:${tint};--p2c-tint-line:${tintBorder};--p2c-lift:-6px;--p2c-ease:cubic-bezier(.22,1,.36,1)}`);
  if (m.hover) {
    const sel = `:is(${CARD_SELECTOR})${NOT_NAV}${NOT_BTN}`;
    out.push(`${sel}{transition:transform .35s var(--p2c-ease),box-shadow .35s var(--p2c-ease),background-color .35s ease,border-color .35s ease}`);
    out.push(`${sel}:hover{transform:translateY(var(--p2c-lift));box-shadow:0 14px 34px -14px rgba(15,23,42,.22)${m.tint ? ';background-color:var(--p2c-tint);border-color:var(--p2c-tint-line)' : ''}}`);
    out.push(`:is(${CARD_SELECTOR}) :is(img,svg,i)${NOT_NAV}{transition:transform .45s var(--p2c-ease)}`);
    out.push(`:is(${CARD_SELECTOR}):hover :is(img,svg,i)${NOT_NAV}{transform:scale(1.04)}`);
  }
  if (m.reveal) {
    out.push('.p2c-m-pre{opacity:0;transform:translateY(24px)}');
    out.push('.p2c-m-pre.p2c-m-in{opacity:1;transform:none;transition:opacity .6s ease var(--p2c-d,0ms),transform .6s var(--p2c-ease) var(--p2c-d,0ms)}');
  }
  if (m.noButtonClick) {
    out.push(`${onBtn(':active')},${onBtn(':focus:active')}{transform:none!important;animation:none!important;scale:none!important;filter:none!important}`);
    out.push(`${onBtn('::before')},${onBtn('::after')},${onBtn(' .ripple')},${onBtn(' .ripple-effect')}{animation:none!important}`);
    out.push(`${onBtn('')}{-webkit-tap-highlight-color:transparent}`);
  }
  out.push('@media (prefers-reduced-motion:reduce){:is(' + CARD_SELECTOR + '){transition:none!important;transform:none!important}.p2c-m-pre{opacity:1!important;transform:none!important}}');
  out.push('@media (hover:none){:is(' + CARD_SELECTOR + '):hover{transform:none}}');
  return out.join('\n');
}

export function buildMotionJs(m: MotionSettings): string {
  if (!m.enabled || !m.reveal) return '';
  // Cards are hidden only AFTER the script runs, so the page is fully visible when JS or IntersectionObserver is missing.
  return `(function(){
  if(!('IntersectionObserver' in window)||window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  var sel=${JSON.stringify(CARD_SELECTOR)};
  var skip='nav,header,footer,.navbar,.modal';
  var els=[].slice.call(document.querySelectorAll(sel)).filter(function(e){
    if(e.closest(skip))return false;
    if(e.tagName==='A'||e.tagName==='BUTTON')return false;
    // only the outermost card, not the boxes inside it
    var p=e.parentElement;while(p){if(p.matches&&p.matches(sel)&&!p.closest(skip))return false;p=p.parentElement;}
    var r=e.getBoundingClientRect();return r.width>60&&r.height>40;
  });
  var io=new IntersectionObserver(function(es){es.forEach(function(x){
    if(x.isIntersecting){
      var t=x.target;t.classList.add('p2c-m-in');io.unobserve(t);
      // once revealed the card goes back to its normal state, so the hover animation is instant and not delayed by the reveal
      setTimeout(function(){t.classList.remove('p2c-m-pre','p2c-m-in');t.style.removeProperty('--p2c-d');},1100);
    }
  });},{threshold:0.12});
  var seen=new Map();
  els.forEach(function(e){
    var par=e.parentElement,i=seen.get(par)||0;seen.set(par,i+1);
    e.style.setProperty('--p2c-d',Math.min(i,5)*80+'ms');
    e.classList.add('p2c-m-pre');io.observe(e);
  });
})();`;
}
