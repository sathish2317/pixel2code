// Special effects for the 3D Animation Studio. Pure TypeScript (no React, no network), so every effect is unit-tested.
// Unlike the pose presets (start pose -> end pose) these need a little JavaScript: they follow the cursor, the scroll position
// or a click. Each effect returns plain CSS + plain JS (no library) that works on any page, and every one of them
// respects "reduce motion" in the visitor's system settings.

export type FxGroup = 'Cursor' | 'Click' | 'Scroll' | 'Ambient';
export interface FxDef {
  id: string; label: string; group: FxGroup; description: string;
  /** what the visitor does to see it */
  how: string;
  build: (selector: string, key: string) => { css: string; js: string };
}

const q = (s: string) => JSON.stringify(s);
const reduceCss = (S: string) => `@media (prefers-reduced-motion: reduce) {\n  ${S}, ${S}::before, ${S}::after { animation: none !important; transition: none !important; }\n}`;
/** wraps an effect body: finds the elements, stops when the visitor asked for less motion */
const wrap = (S: string, body: string) =>
  `(function () {\n  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;\n  var els = document.querySelectorAll(${q(S)});\n  if (!els.length) return;\n${body.split('\n').map((l) => (l ? '  ' + l : l)).join('\n')}\n})();`;

export const FX: FxDef[] = [
  {
    id: 'cursor-tilt', label: 'Cursor 3D tilt', group: 'Cursor', how: 'move the mouse (or finger) over it',
    description: 'The element turns toward the cursor in real 3D and settles back when you leave.',
    build: (S, K) => ({
      css: `/* 3D effect: cursor tilt on ${S} */\n${S} {\n  transform-style: preserve-3d;\n  will-change: transform;\n  transition: transform 0.45s cubic-bezier(0.2, 0.8, 0.2, 1);\n}\n${S}.${K}-live { transition: transform 0.08s linear; }\n${reduceCss(S)}\n`,
      js: wrap(S, `els.forEach(function (el) {
  var max = 14;
  el.addEventListener('pointermove', function (e) {
    var r = el.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.classList.add('${K}-live');
    el.style.transform = 'perspective(900px) rotateX(' + (-y * max).toFixed(2) + 'deg) rotateY(' + (x * max).toFixed(2) + 'deg) scale3d(1.03, 1.03, 1.03)';
  });
  el.addEventListener('pointerleave', function () { el.classList.remove('${K}-live'); el.style.transform = ''; });
});`),
    }),
  },
  {
    id: 'layers-parallax', label: 'Layered depth', group: 'Cursor', how: 'move the mouse over it',
    description: 'Tilts the element and pushes each child forward by a different depth, like a hologram.',
    build: (S, K) => ({
      css: `/* 3D effect: layered depth on ${S} */\n${S} { transform-style: preserve-3d; transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }\n${S} > * { transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); will-change: transform; }\n${reduceCss(S)}\n`,
      js: wrap(S, `els.forEach(function (el) {
  var kids = [].slice.call(el.children);
  el.addEventListener('pointermove', function (e) {
    var r = el.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = 'perspective(1000px) rotateX(' + (-y * 8).toFixed(2) + 'deg) rotateY(' + (x * 8).toFixed(2) + 'deg)';
    kids.forEach(function (k, i) {
      k.style.transform = 'translate3d(' + (x * (i + 1) * 6).toFixed(1) + 'px, ' + (y * (i + 1) * 6).toFixed(1) + 'px, ' + ((i + 1) * 14) + 'px)';
    });
  });
  el.addEventListener('pointerleave', function () {
    el.style.transform = '';
    kids.forEach(function (k) { k.style.transform = ''; });
  });
});`),
    }),
  },
  {
    id: 'spotlight', label: 'Cursor spotlight', group: 'Cursor', how: 'move the mouse over it',
    description: 'A soft light follows the cursor across the element.',
    build: (S, K) => ({
      css: `/* 3D effect: cursor spotlight on ${S} */\n${S} { --mx: 50%; --my: 50%; isolation: isolate; }\n${S}::after {\n  content: ''; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;\n  transition: opacity 0.25s ease;\n  background: radial-gradient(260px circle at var(--mx) var(--my), rgba(255, 255, 255, 0.38), transparent 62%);\n}\n${S}.${K}-on::after { opacity: 1; }\n${reduceCss(S)}\n`,
      js: wrap(S, `els.forEach(function (el) {
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.addEventListener('pointermove', function (e) {
    var r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    el.classList.add('${K}-on');
  });
  el.addEventListener('pointerleave', function () { el.classList.remove('${K}-on'); });
});`),
    }),
  },
  {
    id: 'magnetic', label: 'Magnetic pull', group: 'Cursor', how: 'bring the cursor near it',
    description: 'The element is pulled toward the cursor when it comes close, then snaps back.',
    build: (S) => ({
      css: `/* 3D effect: magnetic pull on ${S} */\n${S} { transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1); will-change: transform; }\n${reduceCss(S)}\n`,
      js: wrap(S, `var reach = 110, pull = 0.35;
window.addEventListener('pointermove', function (e) {
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < Math.max(r.width, r.height) / 2 + reach) el.style.transform = 'translate3d(' + (dx * pull).toFixed(1) + 'px, ' + (dy * pull).toFixed(1) + 'px, 0)';
    else if (el.style.transform) el.style.transform = '';
  });
}, { passive: true });`),
    }),
  },
  {
    id: 'shine', label: 'Shine sweep', group: 'Cursor', how: 'hover or press it',
    description: 'A band of light sweeps across the element. Pure CSS, no script.',
    build: (S, K) => ({
      css: `/* 3D effect: shine sweep on ${S} */\n@keyframes ${K} { from { left: -75%; } to { left: 130%; } }\n${S} { position: relative; overflow: hidden; isolation: isolate; }\n${S}::before {\n  content: ''; position: absolute; top: 0; left: -75%; width: 50%; height: 100%; pointer-events: none;\n  background: linear-gradient(100deg, transparent, rgba(255, 255, 255, 0.55), transparent); transform: skewX(-20deg);\n}\n${S}:hover::before, ${S}:active::before { animation: ${K} 0.8s ease-out; }\n${reduceCss(S)}\n`,
      js: '',
    }),
  },
  {
    id: 'ripple', label: 'Click ripple', group: 'Click', how: 'click or tap it',
    description: 'A circular wave spreads from the exact point you press.',
    build: (S, K) => ({
      css: `/* 3D effect: click ripple on ${S} */\n@keyframes ${K} { to { transform: scale(1); opacity: 0; } }\n${S} { position: relative; overflow: hidden; }\n.${K}-wave { position: absolute; border-radius: 50%; pointer-events: none; background: rgba(255, 255, 255, 0.45); transform: scale(0); animation: ${K} 0.6s ease-out forwards; }\n${reduceCss(S)}\n`,
      js: wrap(S, `els.forEach(function (el) {
  el.addEventListener('pointerdown', function (e) {
    var r = el.getBoundingClientRect(), size = Math.max(r.width, r.height) * 2;
    var w = document.createElement('span');
    w.className = '${K}-wave';
    w.style.width = w.style.height = size + 'px';
    w.style.left = (e.clientX - r.left - size / 2) + 'px';
    w.style.top = (e.clientY - r.top - size / 2) + 'px';
    el.appendChild(w);
    setTimeout(function () { if (w.parentNode) w.parentNode.removeChild(w); }, 700);
  });
});`),
    }),
  },
  {
    id: 'flip-click', label: 'Click to flip', group: 'Click', how: 'click or tap it',
    description: 'Flips the element around on each click. Content stays readable on the back.',
    build: (S, K) => ({
      css: `/* 3D effect: click to flip on ${S} */\n${S} { transform-style: preserve-3d; cursor: pointer; transition: transform 0.7s cubic-bezier(0.4, 0.2, 0.2, 1); }\n${S}.${K}-flipped { transform: perspective(900px) rotateY(180deg); }\n${S}.${K}-flipped > * { transform: rotateY(180deg); }\n${reduceCss(S)}\n`,
      js: wrap(S, `els.forEach(function (el) {
  el.addEventListener('click', function () { el.classList.toggle('${K}-flipped'); });
});`),
    }),
  },
  {
    id: 'scroll-tilt', label: 'Scroll-linked tilt', group: 'Scroll', how: 'scroll the page',
    description: 'The element leans back as it enters and straightens at the middle of the screen, following your scroll.',
    build: (S) => ({
      css: `/* 3D effect: scroll-linked tilt on ${S} */\n${S} { will-change: transform; }\n${reduceCss(S)}\n`,
      js: wrap(S, `var ticking = false;
function update() {
  ticking = false;
  var vh = window.innerHeight || 1;
  els.forEach(function (el) {
    var r = el.getBoundingClientRect();
    var t = Math.max(-1, Math.min(1, ((r.top + r.height / 2) / vh - 0.5) * 2));
    var s = (1 - Math.abs(t) * 0.06).toFixed(3);
    el.style.transform = 'perspective(1000px) rotateX(' + (t * 22).toFixed(2) + 'deg) scale3d(' + s + ', ' + s + ', 1)';
  });
}
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
update();`),
    }),
  },
  {
    id: 'levitate', label: 'Levitate + shadow', group: 'Ambient', how: 'nothing, it floats on its own',
    description: 'Hovers in 3D with a shadow that grows and shrinks. Pure CSS, runs forever.',
    build: (S, K) => ({
      css: `/* 3D effect: levitate on ${S} */\n@keyframes ${K} {\n  0%, 100% { transform: perspective(900px) translate3d(0, 0, 0) rotateX(0deg) rotateY(0deg); filter: drop-shadow(0 14px 14px rgba(0, 0, 0, 0.18)); }\n  50% { transform: perspective(900px) translate3d(0, -16px, 30px) rotateX(5deg) rotateY(-5deg); filter: drop-shadow(0 30px 24px rgba(0, 0, 0, 0.12)); }\n}\n${S} { transform-style: preserve-3d; will-change: transform, filter; animation: ${K} 4s ease-in-out infinite; }\n${reduceCss(S)}\n`,
      js: '',
    }),
  },
];

export const fxOf = (id: string) => FX.find((f) => f.id === id);

export interface FxRule { selector: string; fx: string; key: string }

/** CSS + JS of every effect on the page. Unknown effect ids are skipped (old or damaged saved data). */
export function buildFxBundle(rules: FxRule[]): { css: string; js: string } {
  const parts = rules.map((x) => { const f = fxOf(x.fx); return f ? f.build(x.selector.trim(), x.key) : { css: '', js: '' }; });
  return { css: parts.map((p) => p.css).filter(Boolean).join('\n'), js: parts.map((p) => p.js).filter(Boolean).join('\n') };
}