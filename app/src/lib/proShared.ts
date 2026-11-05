/**
 * Shared parts of the "Pro" blocks (design tokens, premium button, scroll-reveal, helpers).
 *
 * Every Pro block has the class "bk-p" on its outer element. That class carries the design tokens
 * (CSS variables), so the whole page can be re-themed from ONE place:
 *
 *   --bk-a      accent color (the Code Blocks screen swaps it for your brand color)
 *   --bk-r      card radius          --bk-br   button radius
 *   --bk-t      animation duration   --bk-lift hover lift distance
 *   --bk-hf     heading font family
 *
 * You can also override them by hand in your own CSS:  .bk-p{ --bk-r:8px; --bk-t:.3s }
 */

export const ACCENT_HEX = '#2563eb';

export const PRO_CSS = `.bk-p{--bk-a:#2563eb;--bk-a-d:color-mix(in srgb,var(--bk-a) 74%,#000);--bk-a-l:color-mix(in srgb,var(--bk-a) 10%,#fff);--bk-a-m:color-mix(in srgb,var(--bk-a) 26%,#fff);--bk-a2:color-mix(in srgb,var(--bk-a) 52%,#f472b6);--bk-ink:#0b1220;--bk-mut:#5b6679;--bk-line:#e4e8ef;--bk-soft:#f6f8fb;--bk-r:22px;--bk-br:999px;--bk-t:.45s;--bk-lift:-6px;--bk-ease:cubic-bezier(.22,1,.36,1);--bk-sh:0 1px 2px rgba(11,18,32,.05),0 18px 40px -18px rgba(11,18,32,.28);--bk-hf:inherit;color:var(--bk-ink);line-height:1.6;-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.bk-p *,.bk-p *::before,.bk-p *::after{box-sizing:border-box}
:where(.bk-p) :is(h1,h2,h3,h4){font-family:var(--bk-hf);letter-spacing:-.02em;line-height:1.12;margin:0}
:where(.bk-p) p{margin:0}
:where(.bk-p) img{display:block;max-width:100%}
.bk-pw{max-width:1240px;margin:0 auto;padding:0 clamp(18px,4vw,40px)}
.bk-ps{padding:clamp(64px,9vw,120px) 0}
.bk-ph{max-width:720px;margin:0 auto clamp(36px,5vw,64px);text-align:center}
.bk-ph h2{font-size:clamp(30px,4.6vw,52px);margin:16px 0 14px}
.bk-ph p{color:var(--bk-mut);font-size:clamp(16px,1.6vw,18px)}
.bk-pey{display:inline-flex;align-items:center;gap:10px;padding:7px 14px 7px 12px;border-radius:999px;background:var(--bk-a-l);color:var(--bk-a-d);font-size:13px;font-weight:600;letter-spacing:.02em}
.bk-pey::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--bk-a);box-shadow:0 0 0 0 var(--bk-a-m);animation:bk-pulse 2.2s infinite}
.bk-pbtn{position:relative;isolation:isolate;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:10px;padding:15px 28px;border-radius:var(--bk-br);border:1.5px solid var(--bk-a);background:var(--bk-a);color:#fff;font-family:inherit;font-size:15px;font-weight:600;line-height:1;text-decoration:none;cursor:pointer;box-shadow:0 12px 26px -12px var(--bk-a);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t) var(--bk-ease),background .3s,color .3s,border-color .3s}
.bk-pbtn::after{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.42) 50%,transparent 70%);transform:translateX(-130%);transition:transform .9s var(--bk-ease)}
.bk-pbtn:hover{transform:translateY(-3px);box-shadow:0 20px 34px -14px var(--bk-a)}
.bk-pbtn:hover::after{transform:translateX(130%)}
.bk-pbtn:active{transform:translateY(0) scale(.97)}
.bk-pbtn:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:3px}
.bk-pbtn__ar{display:inline-block;transition:transform .35s var(--bk-ease)}
.bk-pbtn:hover .bk-pbtn__ar{transform:translateX(6px)}
.bk-pbtn--ghost{background:transparent;color:var(--bk-a);box-shadow:none}
.bk-pbtn--ghost:hover{background:var(--bk-a);color:#fff;box-shadow:0 14px 26px -14px var(--bk-a)}
.bk-pbtn--light{background:#fff;border-color:#fff;color:var(--bk-ink);box-shadow:0 14px 28px -14px rgba(0,0,0,.5)}
.bk-pbtn--outline-light{background:transparent;border-color:rgba(255,255,255,.45);color:#fff;box-shadow:none}
.bk-pbtn--outline-light:hover{background:#fff;border-color:#fff;color:var(--bk-ink)}
.bk-js .bk-rv{opacity:0;transform:translate(var(--rx,0),var(--ry,32px));transition:opacity .9s var(--bk-ease),transform .9s var(--bk-ease);transition-delay:calc(var(--i,0) * 90ms)}
.bk-js .bk-rv--l{--rx:-44px;--ry:0px}
.bk-js .bk-rv--r{--rx:44px;--ry:0px}
.bk-js .bk-rv--z{--rx:0px;--ry:0px;transform:scale(.92)}
.bk-js .bk-rv.is-in{opacity:1;transform:none}
@keyframes bk-pulse{0%{box-shadow:0 0 0 0 var(--bk-a-m)}70%{box-shadow:0 0 0 10px transparent}100%{box-shadow:0 0 0 0 transparent}}
@keyframes bk-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes bk-spin{to{transform:rotate(360deg)}}
@media (prefers-reduced-motion:reduce){.bk-p *,.bk-p *::before,.bk-p *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}.bk-js .bk-rv{opacity:1;transform:none}}`;

/** Runs once per page: scroll-reveal for every .bk-rv element. Content stays visible if JavaScript or IntersectionObserver is missing. */
export const PRO_JS = `document.documentElement.classList.add('bk-js');
(function () {
  var els = document.querySelectorAll('.bk-rv');
  if (!('IntersectionObserver' in window)) { els.forEach(function (e) { e.classList.add('is-in'); }); return; }
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('is-in'); io.unobserve(x.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(function (e) { io.observe(e); });
})();`;

export const img = (seed: string, w: number, h: number) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
export const AR = '<span class="bk-pbtn__ar" aria-hidden="true">&rarr;</span>';
export const svg = (path: string, size = 24, sw = 2) =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;

export const IC = {
  check: svg('<path d="M5 12.5l4.5 4.5L19 7.5"/>', 18, 3),
  star: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.8l2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.2l-5.7 3.1 1.1-6.3L2.8 9.5l6.4-.9z"/></svg>',
  bolt: svg('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>'),
  shield: svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  heart: svg('<path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6-8 11-8 11z"/>'),
  layers: svg('<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'),
  chart: svg('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
  globe: svg('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>'),
  phone: svg('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2z"/>'),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  pin: svg('<path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  fb: svg('<path d="M14 8h3V4h-3a4 4 0 00-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>', 18),
  ig: svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>', 18),
  in: svg('<path d="M6 9v11M6 4v.01M11 20v-6a3 3 0 016 0v6M11 9v11"/>', 18),
  x: svg('<path d="M4 4l16 16M20 4L4 20"/>', 18),
  arrowUp: svg('<path d="M12 19V5M5 12l7-7 7 7"/>', 20, 2.5),
  zoom: svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/>', 22),
};
