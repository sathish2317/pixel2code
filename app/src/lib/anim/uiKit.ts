export type UIKitCategory = 'Buttons' | 'Modals & popups' | 'Navigation' | 'Cards & panels' | 'Playful & advanced';
export type UIKitItem = { id: string; name: string; category: UIKitCategory; level: 'Starter' | 'Pro'; description: string; html: string; css: string; js?: string; tags: string[] };
const base = `.p2c-kit *{box-sizing:border-box}.p2c-kit{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#e8ecf7}.p2c-kit button,.p2c-kit a{font:inherit}.p2c-kit button{cursor:pointer}.p2c-kit.p2c-stage,.p2c-kit .p2c-stage{min-height:270px;display:grid;place-items:center;padding:28px;background:radial-gradient(circle at 10% 0%,#25345b 0,transparent 42%),linear-gradient(135deg,#101827,#151d2f);border-radius:14px}.p2c-kit .p2c-demo{display:flex;gap:12px;align-items:center;justify-content:center;flex-wrap:wrap}.p2c-kit .p2c-note{color:#9aa8c2;font-size:12px;margin-top:14px;text-align:center}@media(prefers-reduced-motion:reduce){.p2c-kit *{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}`;
const item = (id:string,name:string,category:UIKitCategory,description:string,html:string,css:string,js?:string,level:'Starter'|'Pro'='Starter',tags:string[]=[]):UIKitItem=>({id,name,category,description,html,css:base + css,js,level,tags});
export const UI_KIT: UIKitItem[] = [
// ═════════════════════════════════════════════════════════════════════════════
//  PREMIUM BUTTON COLLECTION  ·  12 pointer-reactive buttons (Magnetic-style)
//
//  HOW TO APPLY in src/lib/anim/uiKit.ts
//   1. Delete EVERY item(...) whose category is 'Buttons' (all 21 of them).
//   2. Paste this whole block directly under:
//          export const UI_KIT: UIKitItem[] = [
//   Nothing else in the file / project needs to change.
// ═════════════════════════════════════════════════════════════════════════════

// 01 ─ MAGNETIC PRO: spring-physics pull, label parallax, light that tracks the cursor
item('btn-magnetic','Magnetic Pro button','Buttons','Spring-physics magnetic button: pulled toward the cursor, label drifts with parallax, glow tracks the pointer, arrow flips on approach.',
`<div class="p2c-stage p2c-kit"><div class="mg-wrap"><div class="mg-field"><button class="mg-btn" type="button"><span class="mg-glow" aria-hidden="true"></span><span class="mg-inner"><span class="mg-text">Book a demo</span><span class="mg-arrow" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></span></span></button></div><p class="p2c-note">Move your cursor near the button</p></div></div>`,
`.p2c-kit .mg-wrap{display:grid;justify-items:center;width:min(100%,430px)}
.p2c-kit .mg-field{display:grid;place-items:center;width:100%;height:200px;border:1px dashed rgba(148,163,184,.28);border-radius:28px;background:radial-gradient(circle at 50% 50%,rgba(99,102,241,.14),transparent 62%)}
.p2c-kit .mg-btn{--mx:50%;--my:50%;position:relative;padding:19px 30px;border:0;border-radius:999px;overflow:hidden;color:#fff;background:linear-gradient(135deg,#5b5bf0,#7c3aed 55%,#0ea5e9);box-shadow:0 22px 46px -16px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.4),inset 0 -2px 0 rgba(0,0,0,.18);will-change:transform;transition:box-shadow .35s ease,filter .3s ease}
.p2c-kit .mg-glow{position:absolute;inset:0;background:radial-gradient(130px circle at var(--mx) var(--my),rgba(255,255,255,.5),transparent 62%);opacity:0;transition:opacity .35s ease;pointer-events:none}
.p2c-kit .mg-btn.is-near{box-shadow:0 30px 56px -14px rgba(14,165,233,.8),inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.18)}
.p2c-kit .mg-btn.is-near .mg-glow{opacity:1}
.p2c-kit .mg-btn:active{filter:brightness(.92)}
.p2c-kit .mg-inner{position:relative;display:flex;align-items:center;gap:12px;font-size:16px;font-weight:800;letter-spacing:.01em;will-change:transform}
.p2c-kit .mg-arrow{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:rgba(255,255,255,.2);transition:transform .4s cubic-bezier(.34,1.56,.64,1),background .3s ease,color .3s ease}
.p2c-kit .mg-btn.is-near .mg-arrow{transform:rotate(45deg) scale(1.08);background:#fff;color:#4f46e5}
.p2c-kit .mg-btn:focus-visible{outline:2px solid #67e8f9;outline-offset:4px}`,
`(function () {
  var field = document.querySelector('.mg-field');
  var btn = field && field.querySelector('.mg-btn');
  var inner = btn && btn.querySelector('.mg-inner');
  if (!btn) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var RADIUS = 200, MAX = 34, cx = 0, cy = 0;
  function spring(set) {
    var x = 0, v = 0, t = 0, raf = 0;
    function step() {
      v += (t - x) * 0.14; v *= 0.78; x += v; set(x);
      if (Math.abs(v) > 0.01 || Math.abs(t - x) > 0.01) raf = requestAnimationFrame(step);
      else { x = t; set(x); raf = 0; }
    }
    return { to: function (n) { t = n; if (!raf) raf = requestAnimationFrame(step); } };
  }
  function apply() {
    btn.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
    inner.style.transform = 'translate3d(' + (cx * 0.38).toFixed(2) + 'px,' + (cy * 0.38).toFixed(2) + 'px,0)';
  }
  var sx = spring(function (v) { cx = v; apply(); });
  var sy = spring(function (v) { cy = v; apply(); });
  function clamp(v) { return Math.max(-MAX, Math.min(MAX, v)); }
  field.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var f = field.getBoundingClientRect();
    var dx = e.clientX - (f.left + f.width / 2);
    var dy = e.clientY - (f.top + f.height / 2);
    var near = Math.sqrt(dx * dx + dy * dy) < RADIUS;
    btn.classList.toggle('is-near', near);
    sx.to(near ? clamp(dx * 0.3) : 0);
    sy.to(near ? clamp(dy * 0.3) : 0);
    var b = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', (e.clientX - b.left) + 'px');
    btn.style.setProperty('--my', (e.clientY - b.top) + 'px');
  });
  field.addEventListener('pointerleave', function () {
    btn.classList.remove('is-near'); sx.to(0); sy.to(0);
  });
})();`,
'Pro',['buttons','magnetic','premium','spring','pointer']),

// 02 ─ AURORA CTA: flowing mesh gradient, soft glow, sheen sweep, cursor highlight
item('btn-gradient','Aurora gradient CTA','Buttons','Flowing aurora mesh gradient with a blurred glow, light-sweep on hover and a highlight that tracks the cursor.',
`<div class="p2c-stage p2c-kit"><button class="au-btn" type="button"><span class="au-bg" aria-hidden="true"></span><span class="au-sheen" aria-hidden="true"></span><span class="au-label">Get started free</span><span class="au-chev" aria-hidden="true">→</span></button></div>`,
`.p2c-kit .au-btn{--mx:50%;--my:50%;position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:12px;padding:18px 30px;border:0;border-radius:18px;color:#fff;font-size:16px;font-weight:800;letter-spacing:.01em;transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .au-btn::before{content:"";position:absolute;inset:8px 10px -8px;z-index:-2;border-radius:inherit;background:linear-gradient(120deg,#22d3ee,#6366f1,#ec4899);filter:blur(22px);opacity:.5;transition:opacity .35s ease,inset .35s ease}
.p2c-kit .au-bg{position:absolute;inset:0;z-index:-1;border-radius:inherit;background:radial-gradient(60% 140% at 15% 0%,#22d3ee 0,transparent 60%),radial-gradient(60% 140% at 90% 100%,#f472b6 0,transparent 60%),linear-gradient(120deg,#4338ca,#7c3aed);background-size:180% 180%,180% 180%,100% 100%;box-shadow:inset 0 1px 0 rgba(255,255,255,.45);animation:au-flow 7s ease-in-out infinite alternate}
@keyframes au-flow{0%{background-position:0% 0%,100% 100%,0 0}100%{background-position:100% 60%,0% 40%,0 0}}
.p2c-kit .au-sheen{position:absolute;inset:0;z-index:-1;border-radius:inherit;overflow:hidden;pointer-events:none}
.p2c-kit .au-sheen::before{content:"";position:absolute;inset:0;background:radial-gradient(110px circle at var(--mx) var(--my),rgba(255,255,255,.38),transparent 65%);opacity:0;transition:opacity .3s ease}
.p2c-kit .au-sheen::after{content:"";position:absolute;top:-20%;bottom:-20%;left:-40%;width:30%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.55),transparent);transform:skewX(-20deg)}
.p2c-kit .au-chev{transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .au-btn:hover{transform:translateY(-3px)}
.p2c-kit .au-btn:hover::before{opacity:.9;inset:10px 4px -14px}
.p2c-kit .au-btn:hover .au-sheen::before{opacity:1}
.p2c-kit .au-btn:hover .au-sheen::after{transform:skewX(-20deg) translateX(700%);transition:transform .9s ease}
.p2c-kit .au-btn:hover .au-chev{transform:translateX(5px)}
.p2c-kit .au-btn:active{transform:translateY(0) scale(.97)}
.p2c-kit .au-btn:focus-visible{outline:2px solid #a5f3fc;outline-offset:4px}`,
`(function () {
  var btn = document.querySelector('.au-btn');
  if (!btn) return;
  btn.addEventListener('pointermove', function (e) {
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    btn.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
})();`,
'Pro',['buttons','gradient','aurora','premium','glow']),

// 03 ─ TILT 3D: perspective tilt with spring, layered depth and moving glare
item('btn-tilt','3D tilt glare button','Buttons','Perspective tilt driven by spring physics, with layered depth (icon, text and price float at different heights) and a moving glare.',
`<div class="p2c-stage p2c-kit"><div class="tl-scene"><button class="tl-btn" type="button"><span class="tl-glare" aria-hidden="true"></span><span class="tl-icon" aria-hidden="true">◆</span><span class="tl-copy"><strong>Upgrade to Pro</strong><small>Unlock every component</small></span><span class="tl-price" aria-hidden="true">$12<i>/mo</i></span></button></div></div>`,
`.p2c-kit .tl-scene{padding:34px 28px;perspective:850px}
.p2c-kit .tl-btn{--gx:50%;--gy:50%;position:relative;display:flex;align-items:center;gap:16px;min-width:320px;padding:18px 20px;border:1px solid rgba(255,255,255,.14);border-radius:20px;color:#f4f6ff;text-align:left;background:linear-gradient(150deg,#222d5a 0%,#101735 60%,#0b1226 100%);box-shadow:0 30px 60px -28px rgba(0,0,0,.9),inset 0 1px 0 rgba(255,255,255,.18);transform-style:preserve-3d;will-change:transform;transition:box-shadow .3s ease,border-color .3s ease}
.p2c-kit .tl-btn:hover{border-color:rgba(165,180,252,.45);box-shadow:0 40px 70px -26px rgba(79,70,229,.75),inset 0 1px 0 rgba(255,255,255,.3)}
.p2c-kit .tl-glare{position:absolute;inset:0;border-radius:inherit;background:radial-gradient(240px circle at var(--gx) var(--gy),rgba(255,255,255,.24),transparent 62%);opacity:0;transition:opacity .3s ease;pointer-events:none;transform:translateZ(1px)}
.p2c-kit .tl-btn.is-live .tl-glare{opacity:1}
.p2c-kit .tl-icon{display:grid;place-items:center;width:46px;height:46px;border-radius:14px;font-size:18px;background:linear-gradient(135deg,#6366f1,#22d3ee);box-shadow:0 10px 24px -8px rgba(99,102,241,.9);transform:translateZ(34px)}
.p2c-kit .tl-copy{display:grid;gap:3px;flex:1;transform:translateZ(22px)}
.p2c-kit .tl-copy strong{font-size:16px;font-weight:800}
.p2c-kit .tl-copy small{color:#9fb0d6;font-size:12px}
.p2c-kit .tl-price{padding:8px 12px;border:1px solid rgba(255,255,255,.16);border-radius:12px;background:rgba(255,255,255,.1);font-size:16px;font-weight:800;transform:translateZ(46px)}
.p2c-kit .tl-price i{margin-left:2px;color:#a5b4fc;font-size:11px;font-style:normal;font-weight:600}
.p2c-kit .tl-btn:focus-visible{outline:2px solid #818cf8;outline-offset:5px}`,
`(function () {
  var scene = document.querySelector('.tl-scene');
  var btn = scene && scene.querySelector('.tl-btn');
  if (!btn) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var rx = 0, ry = 0;
  function spring(set) {
    var x = 0, v = 0, t = 0, raf = 0;
    function step() {
      v += (t - x) * 0.12; v *= 0.8; x += v; set(x);
      if (Math.abs(v) > 0.01 || Math.abs(t - x) > 0.01) raf = requestAnimationFrame(step);
      else { x = t; set(x); raf = 0; }
    }
    return { to: function (n) { t = n; if (!raf) raf = requestAnimationFrame(step); } };
  }
  function apply() { btn.style.transform = 'rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)'; }
  var sx = spring(function (v) { rx = v; apply(); });
  var sy = spring(function (v) { ry = v; apply(); });
  scene.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    var s = scene.getBoundingClientRect();
    var px = Math.max(0, Math.min(1, (e.clientX - s.left) / s.width));
    var py = Math.max(0, Math.min(1, (e.clientY - s.top) / s.height));
    sx.to((0.5 - py) * 18);
    sy.to((px - 0.5) * 24);
    var b = btn.getBoundingClientRect();
    btn.style.setProperty('--gx', (e.clientX - b.left) + 'px');
    btn.style.setProperty('--gy', (e.clientY - b.top) + 'px');
    btn.classList.add('is-live');
  });
  scene.addEventListener('pointerleave', function () { sx.to(0); sy.to(0); btn.classList.remove('is-live'); });
})();`,
'Pro',['buttons','3d','tilt','premium','glare']),

// 04 ─ SPOTLIGHT BORDER: only the 1.5px border lights up where the cursor is
item('btn-outline','Spotlight border button','Buttons','A masked 1.5px border that lights up exactly where the cursor is, plus a soft inner glow. Primary and ghost variants.',
`<div class="p2c-stage p2c-kit"><div class="sp-row"><button class="sp-btn" type="button"><span>Explore components</span><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></button><button class="sp-btn sp-ghost" type="button"><span>Read the docs</span><kbd>D</kbd></button></div></div>`,
`.p2c-kit .sp-row{display:flex;flex-wrap:wrap;gap:14px;justify-content:center}
.p2c-kit .sp-btn{--mx:50%;--my:50%;position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:12px;padding:15px 24px;border:0;border-radius:14px;background:#0b1124;color:#e8ecff;font-size:15px;font-weight:700;transition:transform .25s ease,box-shadow .3s ease}
.p2c-kit .sp-ghost{background:rgba(255,255,255,.03)}
.p2c-kit .sp-btn::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;padding:1.5px;background:radial-gradient(170px circle at var(--mx) var(--my),#c7d2fe,#6366f1 38%,transparent 72%),rgba(255,255,255,.1);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude}
.p2c-kit .sp-btn::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;background:radial-gradient(170px circle at var(--mx) var(--my),rgba(99,102,241,.22),transparent 70%);opacity:0;transition:opacity .3s ease}
.p2c-kit .sp-btn:hover{transform:translateY(-2px);box-shadow:0 18px 36px -20px rgba(99,102,241,.9)}
.p2c-kit .sp-btn:hover::after{opacity:1}
.p2c-kit .sp-btn:active{transform:scale(.97)}
.p2c-kit .sp-btn svg{transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .sp-btn:hover svg{transform:translateX(4px)}
.p2c-kit .sp-btn kbd{padding:2px 7px;border:1px solid rgba(255,255,255,.2);border-radius:6px;background:rgba(0,0,0,.3);color:#a5b4fc;font:700 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}
.p2c-kit .sp-btn:focus-visible{outline:2px solid #818cf8;outline-offset:3px}`,
`(function () {
  [].slice.call(document.querySelectorAll('.sp-btn')).forEach(function (btn) {
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      btn.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
})();`,
'Pro',['buttons','outline','spotlight','premium','border']),

// 05 ─ LIQUID RIPPLE: ink ripple from the exact click point (also from keyboard)
item('btn-ripple','Liquid ripple button','Buttons','Glossy gradient button with an ink ripple that starts at the exact pointer position (and from the centre for keyboard users).',
`<div class="p2c-stage p2c-kit"><div class="rp-wrap"><button class="rp-btn" type="button"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M6 8h12l-1 11H7L6 8Zm3 0a3 3 0 0 1 6 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Purchase · $29</span></button><p class="p2c-note">Click anywhere on the button</p></div></div>`,
`.p2c-kit .rp-wrap{display:grid;justify-items:center}
.p2c-kit .rp-btn{position:relative;display:inline-flex;align-items:center;gap:12px;padding:17px 30px;border:0;border-radius:16px;overflow:hidden;color:#fff;font-size:16px;font-weight:800;background:linear-gradient(135deg,#7c3aed,#db2777);box-shadow:0 20px 40px -16px rgba(219,39,119,.85),inset 0 1px 0 rgba(255,255,255,.4);transition:transform .2s ease,box-shadow .3s ease}
.p2c-kit .rp-btn::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(255,255,255,.2),transparent 55%);pointer-events:none}
.p2c-kit .rp-btn>svg,.p2c-kit .rp-btn>span{position:relative;z-index:1}
.p2c-kit .rp-btn:hover{transform:translateY(-2px);box-shadow:0 26px 48px -16px rgba(219,39,119,.95),inset 0 1px 0 rgba(255,255,255,.5)}
.p2c-kit .rp-btn:active{transform:scale(.97)}
.p2c-kit .rp-btn:focus-visible{outline:2px solid #f9a8d4;outline-offset:4px}
.p2c-kit .rp-btn .rp-wave{position:absolute;z-index:0;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.7) 0,rgba(255,255,255,.28) 45%,transparent 70%);pointer-events:none;animation:rp-out .75s cubic-bezier(.2,.7,.2,1) forwards}
@keyframes rp-out{from{transform:scale(0);opacity:1}to{transform:scale(1);opacity:0}}`,
`(function () {
  var btn = document.querySelector('.rp-btn');
  if (!btn) return;
  function wave(x, y) {
    var r = btn.getBoundingClientRect();
    var d = Math.max(r.width, r.height) * 2.4;
    var s = document.createElement('span');
    s.className = 'rp-wave';
    s.style.width = d + 'px';
    s.style.height = d + 'px';
    s.style.left = (x - r.left - d / 2) + 'px';
    s.style.top = (y - r.top - d / 2) + 'px';
    btn.appendChild(s);
    s.addEventListener('animationend', function () { s.remove(); });
  }
  btn.addEventListener('pointerdown', function (e) { wave(e.clientX, e.clientY); });
  btn.addEventListener('keydown', function (e) {
    if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
      var r = btn.getBoundingClientRect();
      wave(r.left + r.width / 2, r.top + r.height / 2);
    }
  });
})();`,
'Pro',['buttons','ripple','click','premium','material']),

// 06 ─ MORPHING ASYNC BUTTON: pill → spinner circle → success / error
item('btn-loading','Morphing async button','Buttons','Pill that morphs into a spinner circle, then a drawn check (or a shake with an error). Shift+click simulates a failure.',
`<div class="p2c-stage p2c-kit"><div class="ld-wrap"><button class="ld-btn" type="button" data-state="idle"><span class="ld-label">Save changes</span><span class="ld-spin" aria-hidden="true"></span><svg class="ld-ok" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path pathLength="1" d="m5 12.5 4.5 4.5L19 7.5"/></svg><svg class="ld-err" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path pathLength="1" d="M7 7l10 10M17 7 7 17"/></svg></button><p class="p2c-note ld-msg" role="status">Click to save · Shift+click simulates an error</p></div></div>`,
`.p2c-kit .ld-wrap{display:grid;justify-items:center}
.p2c-kit .ld-btn{position:relative;display:inline-grid;place-items:center;height:54px;padding:0 34px;border:0;border-radius:999px;overflow:hidden;color:#fff;font-size:15px;font-weight:800;background:linear-gradient(135deg,#4f46e5,#7c3aed);box-shadow:0 18px 38px -16px rgba(99,102,241,.9),inset 0 1px 0 rgba(255,255,255,.35);transition:width .5s cubic-bezier(.65,0,.25,1),padding .5s cubic-bezier(.65,0,.25,1),background .35s ease,box-shadow .35s ease,transform .15s ease}
.p2c-kit .ld-btn>*{grid-area:1/1}
.p2c-kit .ld-btn:active{transform:scale(.97)}
.p2c-kit .ld-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}
.p2c-kit .ld-label{white-space:nowrap;transition:opacity .2s ease,transform .3s ease}
.p2c-kit .ld-spin{width:24px;height:24px;border:3px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;opacity:0;animation:ld-rot .7s linear infinite}
.p2c-kit .ld-ok,.p2c-kit .ld-err{fill:none;stroke:#fff;stroke-width:2.8;stroke-linecap:round;stroke-linejoin:round;stroke-dasharray:1;stroke-dashoffset:1;opacity:0}
@keyframes ld-rot{to{transform:rotate(360deg)}}
@keyframes ld-shake{20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
.p2c-kit .ld-btn:not([data-state="idle"]){padding:0}
.p2c-kit .ld-btn[data-state="loading"] .ld-label,.p2c-kit .ld-btn[data-state="success"] .ld-label,.p2c-kit .ld-btn[data-state="error"] .ld-label{opacity:0;transform:scale(.5)}
.p2c-kit .ld-btn[data-state="loading"] .ld-spin{opacity:1}
.p2c-kit .ld-btn[data-state="loading"]{cursor:progress}
.p2c-kit .ld-btn[data-state="success"]{background:linear-gradient(135deg,#059669,#10b981);box-shadow:0 18px 38px -16px rgba(16,185,129,.9),inset 0 1px 0 rgba(255,255,255,.35)}
.p2c-kit .ld-btn[data-state="success"] .ld-ok{opacity:1;stroke-dashoffset:0;transition:stroke-dashoffset .45s ease .2s}
.p2c-kit .ld-btn[data-state="error"]{background:linear-gradient(135deg,#be123c,#f43f5e);box-shadow:0 18px 38px -16px rgba(244,63,94,.9),inset 0 1px 0 rgba(255,255,255,.35);animation:ld-shake .5s ease .2s}
.p2c-kit .ld-btn[data-state="error"] .ld-err{opacity:1;stroke-dashoffset:0;transition:stroke-dashoffset .4s ease .2s}`,
`(function () {
  var btn = document.querySelector('.ld-btn');
  var msg = document.querySelector('.ld-msg');
  if (!btn) return;
  var HINT = 'Click to save · Shift+click simulates an error';
  var W = 0, busy = false;
  function measure() { btn.style.width = ''; W = btn.offsetWidth; btn.style.width = W + 'px'; }
  measure();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (!busy) measure(); });
  function set(s) { btn.setAttribute('data-state', s); }
  btn.addEventListener('click', function (e) {
    if (busy) return;
    busy = true;
    var fail = e.shiftKey;
    set('loading');
    btn.style.width = btn.offsetHeight + 'px';
    btn.setAttribute('aria-busy', 'true');
    msg.textContent = 'Saving…';
    setTimeout(function () {
      btn.removeAttribute('aria-busy');
      set(fail ? 'error' : 'success');
      msg.textContent = fail ? 'Could not save. Please try again.' : 'All changes saved.';
      setTimeout(function () {
        set('idle');
        btn.style.width = W + 'px';
        msg.textContent = HINT;
        busy = false;
      }, 1900);
    }, 1700);
  });
})();`,
'Pro',['buttons','loading','async','premium','morph']),

// 07 ─ PREMIUM TOGGLES: spring switch + multi-select chips (aria-pressed)
item('btn-toggle','Premium toggle buttons','Buttons','Spring-loaded switch (role=switch) with glow, plus pressed chips with an animated check. Full keyboard support.',
`<div class="p2c-stage p2c-kit"><div class="tg-wrap"><button class="tg-switch" type="button" role="switch" aria-checked="false"><span class="tg-track" aria-hidden="true"><span class="tg-knob"></span></span><span class="tg-text"><strong>Push notifications</strong><small class="tg-state">Off</small></span></button><div class="tg-chips" role="group" aria-label="Channels"><button class="tg-chip" type="button" aria-pressed="true">Email</button><button class="tg-chip" type="button" aria-pressed="false">SMS</button><button class="tg-chip" type="button" aria-pressed="true">Slack</button></div><p class="p2c-note tg-out" role="status">Push is off · 2 channels selected</p></div></div>`,
`.p2c-kit .tg-wrap{display:grid;justify-items:center;gap:18px}
.p2c-kit .tg-switch{display:inline-flex;align-items:center;gap:16px;min-width:290px;padding:12px 20px 12px 12px;border:1px solid #2b3a57;border-radius:18px;background:#0f1729;color:#eef2ff;text-align:left;transition:border-color .3s ease,box-shadow .3s ease,background .3s ease}
.p2c-kit .tg-switch:hover{border-color:#4f6aa8}
.p2c-kit .tg-switch:focus-visible,.p2c-kit .tg-chip:focus-visible{outline:2px solid #818cf8;outline-offset:3px}
.p2c-kit .tg-track{position:relative;flex:none;width:60px;height:34px;border-radius:999px;background:#273354;box-shadow:inset 0 2px 6px rgba(0,0,0,.4);transition:background .35s ease,box-shadow .35s ease}
.p2c-kit .tg-knob{position:absolute;top:4px;left:4px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 4px 10px rgba(0,0,0,.4);transition:transform .45s cubic-bezier(.34,1.56,.64,1),width .2s ease}
.p2c-kit .tg-switch:active .tg-knob{width:32px}
.p2c-kit .tg-switch[aria-checked="true"]{border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.14),0 20px 40px -22px rgba(99,102,241,.9)}
.p2c-kit .tg-switch[aria-checked="true"] .tg-track{background:linear-gradient(135deg,#6366f1,#22d3ee);box-shadow:0 0 18px rgba(34,211,238,.45)}
.p2c-kit .tg-switch[aria-checked="true"] .tg-knob{transform:translateX(26px)}
.p2c-kit .tg-switch[aria-checked="true"]:active .tg-knob{transform:translateX(20px)}
.p2c-kit .tg-text{display:grid;gap:2px}
.p2c-kit .tg-text strong{font-size:15px;font-weight:700}
.p2c-kit .tg-text small{color:#8ea0c4;font-size:12px;font-weight:600}
.p2c-kit .tg-switch[aria-checked="true"] .tg-state{color:#67e8f9}
.p2c-kit .tg-chips{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.p2c-kit .tg-chip{display:inline-flex;align-items:center;padding:9px 16px;border:1px solid #2b3a57;border-radius:999px;background:transparent;color:#9fb0d6;font-size:13px;font-weight:700;transition:background .25s ease,border-color .25s ease,color .25s ease,transform .15s ease}
.p2c-kit .tg-chip::before{content:"✓";width:0;margin-right:0;overflow:hidden;opacity:0;transition:width .25s ease,margin .25s ease,opacity .25s ease}
.p2c-kit .tg-chip:hover{border-color:#5668a8;color:#fff}
.p2c-kit .tg-chip:active{transform:scale(.95)}
.p2c-kit .tg-chip[aria-pressed="true"]{background:rgba(99,102,241,.2);border-color:#818cf8;color:#fff}
.p2c-kit .tg-chip[aria-pressed="true"]::before{width:12px;margin-right:7px;opacity:1}`,
`(function () {
  var sw = document.querySelector('.tg-switch');
  var state = document.querySelector('.tg-state');
  var out = document.querySelector('.tg-out');
  var chips = [].slice.call(document.querySelectorAll('.tg-chip'));
  if (!sw) return;
  function summary() {
    var n = chips.filter(function (c) { return c.getAttribute('aria-pressed') === 'true'; }).length;
    out.textContent = 'Push is ' + (sw.getAttribute('aria-checked') === 'true' ? 'on' : 'off') + ' · ' + n + (n === 1 ? ' channel' : ' channels') + ' selected';
  }
  sw.addEventListener('click', function () {
    var on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
    state.textContent = on ? 'On' : 'Off';
    summary();
  });
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      c.setAttribute('aria-pressed', c.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      summary();
    });
  });
})();`,
'Pro',['buttons','toggle','switch','premium','a11y']),

// 08 ─ DIRECTIONAL FILL: the colour floods in from whichever edge the cursor entered
item('btn-fill','Directional fill button','Buttons','Fill enters from the exact edge the cursor came in through and exits through the edge it leaves by. Works on focus too.',
`<div class="p2c-stage p2c-kit"><div class="df-row"><button class="df-btn" type="button"><span class="df-fill" aria-hidden="true"></span><span>Explore the docs</span><span class="df-arrow" aria-hidden="true">→</span></button><button class="df-btn df-alt" type="button"><span class="df-fill" aria-hidden="true"></span><span>View pricing</span><span class="df-arrow" aria-hidden="true">→</span></button></div></div>`,
`.p2c-kit .df-row{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}
.p2c-kit .df-btn{--fill:#f5f7ff;--ink:#0b1020;position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:12px;padding:17px 28px;border:1.5px solid rgba(255,255,255,.4);border-radius:14px;overflow:hidden;background:transparent;color:#fff;font-size:15px;font-weight:800;letter-spacing:.01em;transition:color .35s ease,border-color .35s ease,transform .2s ease}
.p2c-kit .df-alt{--fill:linear-gradient(135deg,#a5b4fc,#67e8f9);--ink:#0b1020;border-color:rgba(165,180,252,.55)}
.p2c-kit .df-fill{position:absolute;inset:0;z-index:-1;background:var(--fill);transform:translate(0,101%)}
.p2c-kit .df-btn.is-in{color:var(--ink);border-color:transparent}
.p2c-kit .df-arrow{transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .df-btn.is-in .df-arrow{transform:translateX(5px)}
.p2c-kit .df-btn:active{transform:scale(.97)}
.p2c-kit .df-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}`,
`(function () {
  var EASE = 'transform .5s cubic-bezier(.65,0,.25,1)';
  var VEC = { left: [-101, 0], right: [101, 0], top: [0, -101], bottom: [0, 101] };
  function edge(btn, e) {
    var r = btn.getBoundingClientRect();
    var d = { left: e.clientX - r.left, right: r.right - e.clientX, top: e.clientY - r.top, bottom: r.bottom - e.clientY };
    return Object.keys(d).sort(function (a, b) { return d[a] - d[b]; })[0];
  }
  function move(fill, side) { fill.style.transform = 'translate(' + VEC[side][0] + '%,' + VEC[side][1] + '%)'; }
  [].slice.call(document.querySelectorAll('.df-btn')).forEach(function (btn) {
    var fill = btn.querySelector('.df-fill');
    function enter(side) {
      fill.style.transition = 'none';
      move(fill, side);
      void fill.offsetWidth;
      fill.style.transition = EASE;
      fill.style.transform = 'translate(0,0)';
      btn.classList.add('is-in');
    }
    function leave(side) {
      fill.style.transition = EASE;
      move(fill, side);
      btn.classList.remove('is-in');
    }
    btn.addEventListener('pointerenter', function (e) { enter(edge(btn, e)); });
    btn.addEventListener('pointerleave', function (e) { leave(edge(btn, e)); });
    btn.addEventListener('focus', function () { if (!btn.matches(':hover')) enter('bottom'); });
    btn.addEventListener('blur', function () { if (!btn.matches(':hover')) leave('bottom'); });
  });
})();`,
'Pro',['buttons','fill','directional','premium','hover']),

// 09 ─ LETTER ROLL: every letter rolls up and is replaced, staggered; arrow swaps
item('btn-roll','Letter roll button','Buttons','Each letter rolls up and is replaced by a copy with a stagger; the arrow slides out and a new one slides in.',
`<div class="p2c-stage p2c-kit"><button class="rl-btn" type="button" aria-label="Start your project"><span class="rl-text" aria-hidden="true">Start your project</span><span class="rl-ico" aria-hidden="true"><span class="rl-col"><span class="rl-a">↗</span><span class="rl-a">↗</span></span></span></button></div>`,
`.p2c-kit .rl-btn{display:inline-flex;align-items:center;gap:16px;padding:8px 8px 8px 28px;border:0;border-radius:999px;background:#f3f5ff;color:#0b1020;font-size:16px;font-weight:800;letter-spacing:.01em;box-shadow:0 16px 36px -16px rgba(165,180,252,.8);transition:background .4s ease,color .4s ease,box-shadow .4s ease,transform .2s ease}
.p2c-kit .rl-text{display:inline-flex;height:1.3em;line-height:1.3;overflow:hidden}
.p2c-kit .rl-sp{display:inline-block;width:.32em}
.p2c-kit .rl-ch{display:inline-block;height:1.3em;overflow:hidden}
.p2c-kit .rl-in{position:relative;display:block;transition:transform .5s cubic-bezier(.65,0,.25,1);transition-delay:calc(var(--i) * 24ms)}
.p2c-kit .rl-in::after{content:attr(data-c);position:absolute;left:0;top:100%}
.p2c-kit .rl-ico{display:block;width:40px;height:40px;overflow:hidden;border-radius:50%;background:#0b1020;color:#fff;transition:background .4s ease,color .4s ease}
.p2c-kit .rl-col{display:flex;flex-direction:column;transition:transform .5s cubic-bezier(.65,0,.25,1)}
.p2c-kit .rl-a{display:block;height:40px;line-height:40px;text-align:center;font-size:18px}
.p2c-kit .rl-btn:hover{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 20px 44px -16px rgba(99,102,241,.95)}
.p2c-kit .rl-btn:hover .rl-in{transform:translateY(-100%)}
.p2c-kit .rl-btn:hover .rl-ico{background:#fff;color:#4f46e5}
.p2c-kit .rl-btn:hover .rl-col{transform:translateY(-40px)}
.p2c-kit .rl-btn:active{transform:scale(.97)}
.p2c-kit .rl-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}`,
`(function () {
  var text = document.querySelector('.rl-text');
  if (!text) return;
  var html = '';
  text.textContent.split('').forEach(function (c, i) {
    if (c === ' ') { html += '<span class="rl-sp"></span>'; return; }
    html += '<span class="rl-ch"><span class="rl-in" style="--i:' + i + '" data-c="' + c + '">' + c + '</span></span>';
  });
  text.innerHTML = html;
})();`,
'Pro',['buttons','text','roll','premium','stagger']),

// 10 ─ SLIDE TO CONFIRM: drag handle with fill, shimmer label, spring-back, keyboard
item('btn-slide','Slide to confirm button','Buttons','Drag-to-confirm control with a shimmering label, live fill and spring-back. Keyboard: → to advance, Enter to confirm.',
`<div class="p2c-stage p2c-kit"><div class="sl-wrap"><div class="sl-track"><span class="sl-fill" aria-hidden="true"></span><span class="sl-label" aria-hidden="true">Slide to pay $49.00</span><button class="sl-handle" type="button" aria-label="Slide to confirm payment of $49.00"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="m6 6 6 6-6 6M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><p class="p2c-note sl-msg" role="status">Drag the handle · or focus it and press → / Enter</p></div></div>`,
`.p2c-kit .sl-wrap{display:grid;justify-items:center}
.p2c-kit .sl-track{--p:0;position:relative;width:min(100%,330px);height:60px;border:1px solid #2b3a57;border-radius:999px;overflow:hidden;background:#0c1328;user-select:none;-webkit-user-select:none;touch-action:none}
.p2c-kit .sl-fill{position:absolute;top:0;bottom:0;left:0;width:calc(54px + var(--p) * (100% - 58px));border-radius:999px;background:linear-gradient(90deg,#4f46e5,#22d3ee)}
.p2c-kit .sl-label{position:absolute;inset:0;display:grid;place-items:center;padding-left:46px;font-size:14px;font-weight:700;letter-spacing:.02em;background:linear-gradient(110deg,#6b7bab 35%,#fff 50%,#6b7bab 65%);background-size:250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;opacity:calc(1 - var(--p) * 1.6);animation:sl-shine 2.6s linear infinite}
@keyframes sl-shine{from{background-position:120% 0}to{background-position:-120% 0}}
.p2c-kit .sl-handle{position:absolute;top:4px;left:4px;display:grid;place-items:center;width:50px;height:50px;border:0;border-radius:50%;color:#fff;background:linear-gradient(135deg,#6366f1,#8b5cf6);box-shadow:0 8px 20px -6px rgba(99,102,241,.95);cursor:grab;touch-action:none}
.p2c-kit .sl-handle:active{cursor:grabbing}
.p2c-kit .sl-handle:focus-visible{outline:2px solid #fff;outline-offset:2px}
.p2c-kit .sl-track.is-done{border-color:#10b981}
.p2c-kit .sl-track.is-done .sl-fill{background:linear-gradient(90deg,#059669,#10b981)}
.p2c-kit .sl-track.is-done .sl-handle{background:#fff;color:#059669}
.p2c-kit .sl-track.is-done .sl-label{opacity:1;animation:none;background:none;color:#fff;padding-left:0}`,
`(function () {
  var track = document.querySelector('.sl-track');
  var handle = document.querySelector('.sl-handle');
  var label = document.querySelector('.sl-label');
  var msg = document.querySelector('.sl-msg');
  if (!track || !handle) return;
  var HINT = 'Drag the handle · or focus it and press → / Enter';
  var x = 0, max = 0, startX = 0, drag = false, done = false, raf = 0;
  function calc() { max = track.clientWidth - handle.offsetWidth - 8; }
  function set(v) {
    x = Math.max(0, Math.min(max, v));
    handle.style.transform = 'translateX(' + x + 'px)';
    track.style.setProperty('--p', max ? x / max : 0);
  }
  function back() {
    cancelAnimationFrame(raf);
    (function step() {
      x *= 0.8;
      if (x < 0.5) { set(0); return; }
      set(x);
      raf = requestAnimationFrame(step);
    })();
  }
  function complete() {
    calc(); done = true; set(max);
    track.classList.add('is-done');
    label.textContent = 'Payment sent ✓';
    handle.setAttribute('aria-label', 'Payment confirmed');
    msg.textContent = 'Payment of $49.00 confirmed.';
    setTimeout(reset, 2400);
  }
  function reset() {
    done = false;
    track.classList.remove('is-done');
    label.textContent = 'Slide to pay $49.00';
    handle.setAttribute('aria-label', 'Slide to confirm payment of $49.00');
    msg.textContent = HINT;
    back();
  }
  handle.addEventListener('pointerdown', function (e) {
    if (done) return;
    calc(); drag = true;
    startX = e.clientX - x;
    cancelAnimationFrame(raf);
    handle.setPointerCapture(e.pointerId);
  });
  handle.addEventListener('pointermove', function (e) { if (drag) set(e.clientX - startX); });
  function release() {
    if (!drag) return;
    drag = false;
    if (x >= max * 0.92) complete(); else back();
  }
  handle.addEventListener('pointerup', release);
  handle.addEventListener('pointercancel', release);
  handle.addEventListener('keydown', function (e) {
    if (done) return;
    calc();
    if (e.key === 'ArrowRight') { e.preventDefault(); set(x + max * 0.25); if (x >= max * 0.99) complete(); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); set(x - max * 0.25); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); complete(); }
  });
})();`,
'Pro',['buttons','slide','confirm','premium','drag']),

// 11 ─ SPLIT ACTION: primary action + animated menu that changes the primary action
item('btn-split','Split action menu button','Buttons','Primary action with an attached menu. Choosing an option becomes the new primary action. Arrow keys, Esc and outside-click supported.',
`<div class="p2c-stage p2c-kit"><div class="sa-wrap"><div class="sa-group"><button class="sa-main" type="button" data-tone="0"><span class="sa-dot" aria-hidden="true"></span><span class="sa-label">Deploy to staging</span></button><button class="sa-caret" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Choose deploy target"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><ul class="sa-menu" role="menu" aria-label="Deploy target"><li role="none"><button class="sa-item" type="button" role="menuitemradio" aria-checked="true" data-tone="0" tabindex="-1"><span class="sa-check" aria-hidden="true">✓</span><span><strong>Deploy to staging</strong><small>Safe · gets a preview URL</small></span></button></li><li role="none"><button class="sa-item" type="button" role="menuitemradio" aria-checked="false" data-tone="1" tabindex="-1"><span class="sa-check" aria-hidden="true">✓</span><span><strong>Deploy to production</strong><small>Live · needs approval</small></span></button></li><li role="none"><button class="sa-item" type="button" role="menuitemradio" aria-checked="false" data-tone="2" tabindex="-1"><span class="sa-check" aria-hidden="true">✓</span><span><strong>Schedule for tonight</strong><small>02:00 UTC · low traffic</small></span></button></li></ul><p class="p2c-note sa-out" role="status">Ready</p></div></div>`,
`.p2c-kit .sa-wrap{position:relative;display:grid;justify-items:center;align-content:start;gap:12px;min-height:230px}
.p2c-kit .sa-group{display:inline-flex;border-radius:14px;box-shadow:0 20px 40px -18px rgba(99,102,241,.9)}
.p2c-kit .sa-main,.p2c-kit .sa-caret{border:0;color:#fff;background:linear-gradient(135deg,#4f46e5,#7c3aed);transition:filter .2s ease,transform .15s ease}
.p2c-kit .sa-main{display:inline-flex;align-items:center;gap:10px;min-width:210px;padding:15px 22px;border-radius:14px 0 0 14px;font-size:15px;font-weight:800}
.p2c-kit .sa-caret{display:grid;place-items:center;width:50px;border-left:1px solid rgba(255,255,255,.25);border-radius:0 14px 14px 0}
.p2c-kit .sa-caret svg{transition:transform .3s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .sa-caret[aria-expanded="true"] svg{transform:rotate(180deg)}
.p2c-kit .sa-main:hover,.p2c-kit .sa-caret:hover{filter:brightness(1.12)}
.p2c-kit .sa-main:active{transform:scale(.98)}
.p2c-kit .sa-main:focus-visible,.p2c-kit .sa-caret:focus-visible,.p2c-kit .sa-item:focus-visible{outline:2px solid #a5f3fc;outline-offset:2px}
.p2c-kit .sa-dot{width:9px;height:9px;border-radius:50%;background:#86efac;box-shadow:0 0 0 0 rgba(134,239,172,.7);animation:sa-ping 2s ease-out infinite}
.p2c-kit .sa-main[data-tone="1"] .sa-dot{background:#fca5a5}
.p2c-kit .sa-main[data-tone="2"] .sa-dot{background:#fde68a}
@keyframes sa-ping{to{box-shadow:0 0 0 9px rgba(255,255,255,0)}}
.p2c-kit .sa-menu{position:absolute;top:62px;left:50%;z-index:5;width:272px;margin:0;padding:6px;list-style:none;border:1px solid #2b3a57;border-radius:16px;background:#0c1328;box-shadow:0 30px 60px -20px rgba(0,0,0,.9);visibility:hidden;opacity:0;transform:translate(-50%,-8px) scale(.97);transform-origin:50% 0;transition:opacity .2s ease,transform .25s cubic-bezier(.34,1.56,.64,1),visibility 0s linear .25s}
.p2c-kit .sa-menu.is-open{visibility:visible;opacity:1;transform:translate(-50%,0) scale(1);transition:opacity .2s ease,transform .25s cubic-bezier(.34,1.56,.64,1),visibility 0s}
.p2c-kit .sa-item{display:flex;align-items:center;gap:12px;width:100%;padding:11px 12px;border:0;border-radius:11px;background:transparent;color:#e8ecff;text-align:left;transition:background .15s ease}
.p2c-kit .sa-item:hover,.p2c-kit .sa-item:focus-visible{background:rgba(99,102,241,.2)}
.p2c-kit .sa-item strong{display:block;font-size:14px;font-weight:700}
.p2c-kit .sa-item small{display:block;margin-top:2px;color:#8ea0c4;font-size:12px}
.p2c-kit .sa-check{width:16px;color:#67e8f9;font-weight:800;opacity:0;transform:scale(.4);transition:opacity .2s ease,transform .3s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .sa-item[aria-checked="true"] .sa-check{opacity:1;transform:none}`,
`(function () {
  var main = document.querySelector('.sa-main');
  var caret = document.querySelector('.sa-caret');
  var menu = document.querySelector('.sa-menu');
  var out = document.querySelector('.sa-out');
  var label = document.querySelector('.sa-label');
  if (!main || !caret || !menu) return;
  var items = [].slice.call(menu.querySelectorAll('.sa-item'));
  var timer;
  function isOpen() { return menu.classList.contains('is-open'); }
  function open(focusIndex) {
    menu.classList.add('is-open');
    caret.setAttribute('aria-expanded', 'true');
    items.forEach(function (b) { b.tabIndex = 0; });
    var i = focusIndex;
    if (i == null) i = Math.max(0, items.findIndex(function (b) { return b.getAttribute('aria-checked') === 'true'; }));
    items[i].focus();
  }
  function close(refocus) {
    menu.classList.remove('is-open');
    caret.setAttribute('aria-expanded', 'false');
    items.forEach(function (b) { b.tabIndex = -1; });
    if (refocus) caret.focus();
  }
  function choose(b) {
    items.forEach(function (o) { o.setAttribute('aria-checked', o === b ? 'true' : 'false'); });
    label.textContent = b.querySelector('strong').textContent;
    main.setAttribute('data-tone', b.getAttribute('data-tone'));
    close(true);
  }
  caret.addEventListener('click', function () { if (isOpen()) close(false); else open(); });
  caret.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); open(); }
    if (e.key === 'ArrowUp') { e.preventDefault(); open(items.length - 1); }
  });
  items.forEach(function (b, i) {
    b.addEventListener('click', function () { choose(b); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i + items.length - 1) % items.length].focus(); }
      else if (e.key === 'Home') { e.preventDefault(); items[0].focus(); }
      else if (e.key === 'End') { e.preventDefault(); items[items.length - 1].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { close(false); }
    });
  });
  main.addEventListener('click', function () {
    out.textContent = 'Running: ' + label.textContent + '…';
    clearTimeout(timer);
    timer = setTimeout(function () { out.textContent = '✓ ' + label.textContent + ' finished'; }, 1300);
  });
  document.addEventListener('click', function (e) {
    if (isOpen() && !menu.contains(e.target) && !caret.contains(e.target)) close(false);
  });
})();`,
'Pro',['buttons','split','menu','premium','a11y']),

// 12 ─ MAGNIFYING DOCK: icon buttons grow with cursor proximity (gaussian falloff)
item('btn-dock','Magnifying dock buttons','Buttons','Glass dock whose icon buttons magnify by cursor distance with a smooth falloff, floating labels and a bounce on click.',
`<div class="p2c-stage p2c-kit"><div class="dk-dock" role="toolbar" aria-label="Quick launch"><button class="dk-item" type="button" data-tip="Home" aria-label="Home" style="--c1:#6366f1;--c2:#22d3ee"><span aria-hidden="true">⌂</span></button><button class="dk-item" type="button" data-tip="Mail" aria-label="Mail" style="--c1:#ec4899;--c2:#f97316"><span aria-hidden="true">✉</span></button><button class="dk-item" type="button" data-tip="Music" aria-label="Music" style="--c1:#8b5cf6;--c2:#ec4899"><span aria-hidden="true">♫</span></button><button class="dk-item" type="button" data-tip="Focus" aria-label="Focus" style="--c1:#10b981;--c2:#22d3ee"><span aria-hidden="true">◎</span></button><button class="dk-item" type="button" data-tip="Create" aria-label="Create" style="--c1:#f59e0b;--c2:#ef4444"><span aria-hidden="true">✦</span></button></div></div>`,
`.p2c-kit .dk-dock{--s:1;display:flex;align-items:flex-end;gap:10px;height:100px;padding:10px 14px;border:1px solid rgba(255,255,255,.16);border-radius:26px;background:rgba(255,255,255,.07);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 30px 60px -24px rgba(0,0,0,.85)}
.p2c-kit .dk-item{--s:1;position:relative;flex:none;display:grid;place-items:center;width:calc(52px * var(--s));height:calc(52px * var(--s));padding:0;border:0;border-radius:30%;color:#fff;font-size:calc(22px * var(--s));background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:0 10px 22px -10px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,255,255,.4);transition:width .28s cubic-bezier(.34,1.3,.64,1),height .28s cubic-bezier(.34,1.3,.64,1),font-size .28s ease}
.p2c-kit .dk-dock.is-live .dk-item{transition:width .07s linear,height .07s linear,font-size .07s linear}
.p2c-kit .dk-item::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 12px);padding:5px 10px;border:1px solid rgba(255,255,255,.18);border-radius:8px;background:#0b1020;color:#e8ecff;font-size:12px;font-weight:700;white-space:nowrap;opacity:0;pointer-events:none;transform:translate(-50%,6px);transition:opacity .2s ease,transform .2s ease}
.p2c-kit .dk-item:hover::after,.p2c-kit .dk-item:focus-visible::after{opacity:1;transform:translate(-50%,0)}
.p2c-kit .dk-item:focus-visible{outline:2px solid #fff;outline-offset:3px}
.p2c-kit .dk-item.is-bounce{animation:dk-jump .55s cubic-bezier(.3,.7,.4,1)}
@keyframes dk-jump{0%,100%{transform:translateY(0)}35%{transform:translateY(-22px)}65%{transform:translateY(0)}82%{transform:translateY(-7px)}}`,
`(function () {
  var dock = document.querySelector('.dk-dock');
  if (!dock) return;
  var items = [].slice.call(dock.querySelectorAll('.dk-item'));
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var rest = [];
  function measure() {
    items.forEach(function (b) { b.style.setProperty('--s', 1); });
    var d = dock.getBoundingClientRect();
    var mid = d.left + d.width / 2;
    rest = items.map(function (b) { var r = b.getBoundingClientRect(); return r.left + r.width / 2 - mid; });
  }
  measure();
  window.addEventListener('resize', measure);
  dock.addEventListener('pointermove', function (e) {
    if (reduce || e.pointerType === 'touch') return;
    if (!dock.classList.contains('is-live')) { dock.classList.add('is-live'); measure(); }
    var d = dock.getBoundingClientRect();
    var px = e.clientX - (d.left + d.width / 2);
    items.forEach(function (b, i) {
      var dist = px - rest[i];
      b.style.setProperty('--s', (1 + 0.85 * Math.exp(-(dist * dist) / (2 * 62 * 62))).toFixed(3));
    });
  });
  dock.addEventListener('pointerleave', function () {
    dock.classList.remove('is-live');
    items.forEach(function (b) { b.style.setProperty('--s', 1); });
  });
  items.forEach(function (b) {
    b.addEventListener('click', function () {
      b.classList.remove('is-bounce');
      void b.offsetWidth;
      b.classList.add('is-bounce');
    });
    b.addEventListener('animationend', function () { b.classList.remove('is-bounce'); });
  });
})();`,
'Pro',['buttons','dock','magnify','premium','glass']),

// ═════════════════════════════════════════════════════════════════════════════
//  PREMIUM DEVELOPER COMPONENTS  ·  13 items
//  Modals & popups (3) · Navigation (3) · Cards & panels (4) · Playful & advanced (3)
//
//  HOW TO APPLY in src/lib/anim/uiKit.ts
//   Paste this whole block directly AFTER the last Buttons item (the "Magnifying dock"
//   item ending with  'Pro',['buttons','dock','magnify','premium','glass']),  )
//   and BEFORE the closing  ];  of UI_KIT.
//   Nothing else in the file / project needs to change.
// ═════════════════════════════════════════════════════════════════════════════

// ───────────────────────────── MODALS & POPUPS ─────────────────────────────

// 13 ─ COMMAND PALETTE: Ctrl/⌘+K, fuzzy search, arrow-key navigation, aria combobox
item('modal-command','Command palette (Ctrl+K)','Modals & popups','Developer command palette: opens with Ctrl/Cmd+K, fuzzy filter, arrow keys + Enter, Esc to close, focus returns to the trigger.',
`<div class="p2c-stage p2c-kit"><div class="cp-root"><button class="cp-open" type="button"><span aria-hidden="true">⌕</span><span class="cp-open-t">Search commands…</span><span class="cp-keys"><kbd>Ctrl</kbd><kbd>K</kbd></span></button><p class="p2c-note cp-out" role="status">Press Ctrl / ⌘ + K or click the bar</p><div class="cp-scrim" aria-hidden="true"><div class="cp-panel" role="dialog" aria-modal="true" aria-label="Command palette"><div class="cp-bar"><span aria-hidden="true">⌕</span><input class="cp-input" type="text" role="combobox" aria-expanded="true" aria-controls="cp-list" aria-autocomplete="list" placeholder="Type a command or search…" autocomplete="off" spellcheck="false"/><kbd>Esc</kbd></div><ul class="cp-list" id="cp-list" role="listbox"></ul><p class="cp-empty" hidden>No matching commands</p><div class="cp-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> run</span></div></div></div></div></div>`,
`.p2c-kit .cp-root{position:relative;display:grid;justify-items:center;gap:14px;width:100%;min-height:300px;align-content:center}
.p2c-kit .cp-open{display:inline-flex;align-items:center;gap:12px;width:min(100%,360px);padding:13px 14px;border:1px solid #2b3a57;border-radius:14px;background:#0c1328;color:#8ea0c4;font-size:14px;transition:border-color .25s ease,box-shadow .25s ease,transform .2s ease}
.p2c-kit .cp-open:hover{border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.14)}
.p2c-kit .cp-open:active{transform:scale(.985)}
.p2c-kit .cp-open-t{flex:1;text-align:left}
.p2c-kit .cp-keys{display:inline-flex;gap:4px}
.p2c-kit kbd{padding:2px 7px;border:1px solid rgba(255,255,255,.2);border-radius:6px;background:rgba(0,0,0,.3);color:#a5b4fc;font:700 11px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace}
.p2c-kit .cp-open:focus-visible,.p2c-kit .cp-input:focus-visible{outline:2px solid #818cf8;outline-offset:3px}
.p2c-kit .cp-scrim{position:absolute;inset:-28px;z-index:10;display:grid;justify-items:center;align-items:start;padding:30px 18px;border-radius:14px;background:rgba(6,9,20,.64);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);opacity:0;visibility:hidden;transition:opacity .2s ease,visibility 0s linear .2s}
.p2c-kit .cp-scrim.is-open{opacity:1;visibility:visible;transition:opacity .2s ease}
.p2c-kit .cp-panel{width:min(100%,470px);border:1px solid #2b3a57;border-radius:18px;background:#0b1124;box-shadow:0 40px 80px -24px rgba(0,0,0,.95);transform:translateY(-12px) scale(.98);transition:transform .3s cubic-bezier(.34,1.4,.64,1)}
.p2c-kit .cp-scrim.is-open .cp-panel{transform:none}
.p2c-kit .cp-bar{display:flex;align-items:center;gap:12px;padding:14px 16px;border-bottom:1px solid #1d2a47;color:#8ea0c4}
.p2c-kit .cp-input{flex:1;min-width:0;border:0;background:transparent;color:#f1f4ff;font-size:15px;outline:0}
.p2c-kit .cp-input::placeholder{color:#62739a}
.p2c-kit .cp-list{position:relative;max-height:216px;margin:0;padding:8px;overflow:auto;list-style:none}
.p2c-kit .cp-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;color:#b8c4e6;font-size:14px;font-weight:600;cursor:pointer}
.p2c-kit .cp-item[aria-selected="true"]{background:rgba(99,102,241,.24);color:#fff}
.p2c-kit .cp-ico{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:rgba(255,255,255,.07);font-size:13px}
.p2c-kit .cp-txt{flex:1}
.p2c-kit .cp-empty{margin:0;padding:26px;color:#8ea0c4;font-size:13px;text-align:center}
.p2c-kit .cp-empty[hidden]{display:none}
.p2c-kit .cp-foot{display:flex;gap:18px;padding:10px 16px;border-top:1px solid #1d2a47;color:#62739a;font-size:12px}`,
`(function () {
  var root = document.querySelector('.cp-root');
  if (!root) return;
  var openBtn = root.querySelector('.cp-open');
  var scrim = root.querySelector('.cp-scrim');
  var input = root.querySelector('.cp-input');
  var list = root.querySelector('.cp-list');
  var empty = root.querySelector('.cp-empty');
  var out = root.querySelector('.cp-out');
  var CMDS = [
    { i: '⎇', t: 'Create new branch', k: 'B' },
    { i: '▶', t: 'Run test suite', k: 'T' },
    { i: '⇪', t: 'Deploy to production', k: 'D' },
    { i: '⌕', t: 'Search in files', k: 'F' },
    { i: '⚙', t: 'Open settings', k: ',' },
    { i: '☾', t: 'Toggle theme', k: 'L' },
    { i: '⎘', t: 'Copy preview URL', k: 'U' }
  ];
  var shown = [], idx = 0;
  function match(q, s) {
    q = q.toLowerCase(); s = s.toLowerCase();
    var j = 0;
    for (var i = 0; i < s.length && j < q.length; i++) { if (s.charAt(i) === q.charAt(j)) j++; }
    return j === q.length;
  }
  function mark() {
    [].slice.call(list.children).forEach(function (li, n) {
      var on = n === idx;
      li.setAttribute('aria-selected', on ? 'true' : 'false');
      if (on) input.setAttribute('aria-activedescendant', li.id);
    });
  }
  function reveal() {
    var el = list.children[idx];
    if (!el) return;
    if (el.offsetTop < list.scrollTop) list.scrollTop = el.offsetTop;
    else if (el.offsetTop + el.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = el.offsetTop + el.offsetHeight - list.clientHeight;
  }
  function render() {
    var q = input.value.trim();
    shown = CMDS.filter(function (c) { return match(q, c.t); });
    if (idx >= shown.length) idx = 0;
    list.innerHTML = '';
    shown.forEach(function (c, n) {
      var li = document.createElement('li');
      li.className = 'cp-item'; li.id = 'cp-opt-' + n; li.setAttribute('role', 'option');
      var ico = document.createElement('span'); ico.className = 'cp-ico'; ico.textContent = c.i;
      var tx = document.createElement('span'); tx.className = 'cp-txt'; tx.textContent = c.t;
      var k = document.createElement('kbd'); k.textContent = c.k;
      li.appendChild(ico); li.appendChild(tx); li.appendChild(k);
      li.addEventListener('pointermove', function () { if (idx !== n) { idx = n; mark(); } });
      li.addEventListener('click', function () { run(c); });
      list.appendChild(li);
    });
    empty.hidden = shown.length > 0;
    mark();
  }
  function isOpen() { return scrim.classList.contains('is-open'); }
  function open() {
    scrim.classList.add('is-open'); scrim.setAttribute('aria-hidden', 'false');
    input.value = ''; idx = 0; render();
    setTimeout(function () { input.focus(); }, 30);
  }
  function close() {
    scrim.classList.remove('is-open'); scrim.setAttribute('aria-hidden', 'true');
    openBtn.focus();
  }
  function run(c) { close(); out.textContent = '▶ Ran: ' + c.t; }
  openBtn.addEventListener('click', open);
  input.addEventListener('input', function () { idx = 0; render(); });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (shown.length) { idx = (idx + 1) % shown.length; mark(); reveal(); } }
    else if (e.key === 'ArrowUp') { e.preventDefault(); if (shown.length) { idx = (idx + shown.length - 1) % shown.length; mark(); reveal(); } }
    else if (e.key === 'Enter') { e.preventDefault(); if (shown[idx]) run(shown[idx]); }
    else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { e.preventDefault(); }
  });
  scrim.addEventListener('pointerdown', function (e) { if (e.target === scrim) close(); });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
      var r = root.getBoundingClientRect();
      if (r.bottom < 0 || r.top > window.innerHeight) return;
      e.preventDefault();
      if (isOpen()) close(); else open();
    }
  });
})();`,
'Pro',['modal','command','palette','search','developer','a11y']),

// 14 ─ DANGER CONFIRM: GitHub-style "type the name to confirm" destructive dialog
item('modal-danger','Type-to-confirm danger dialog','Modals & popups','Destructive-action dialog: the delete button unlocks only after the exact resource name is typed. Focus trap, Esc, backdrop click and busy state.',
`<div class="p2c-stage p2c-kit"><div class="dg-root"><button class="dg-open" type="button"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Delete repository</span></button><p class="p2c-note dg-out" role="status">acme/api · last deployed 2 hours ago</p><div class="dg-scrim" aria-hidden="true"><div class="dg-panel" role="alertdialog" aria-modal="true" aria-labelledby="dg-t" aria-describedby="dg-d"><div class="dg-icon" aria-hidden="true">!</div><h4 id="dg-t">Delete acme/api?</h4><p id="dg-d">This permanently removes the repository, 128 deployments and every environment variable. This action cannot be undone.</p><label class="dg-label" for="dg-in">Type <code>acme/api</code> to confirm</label><input id="dg-in" class="dg-input" type="text" placeholder="acme/api" autocomplete="off" spellcheck="false"/><div class="dg-actions"><button class="dg-cancel" type="button">Cancel</button><button class="dg-confirm" type="button" disabled>Delete forever</button></div></div></div></div></div>`,
`.p2c-kit .dg-root{position:relative;display:grid;justify-items:center;gap:14px;width:100%;min-height:300px;align-content:center}
.p2c-kit .dg-open{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border:1px solid rgba(244,63,94,.5);border-radius:14px;background:rgba(244,63,94,.1);color:#fda4af;font-size:15px;font-weight:800;transition:background .25s ease,color .25s ease,transform .2s ease,box-shadow .3s ease}
.p2c-kit .dg-open:hover{background:#e11d48;color:#fff;box-shadow:0 18px 36px -16px rgba(244,63,94,.95)}
.p2c-kit .dg-open:active{transform:scale(.97)}
.p2c-kit .dg-open:focus-visible,.p2c-kit .dg-cancel:focus-visible,.p2c-kit .dg-confirm:focus-visible{outline:2px solid #fda4af;outline-offset:3px}
.p2c-kit .dg-scrim{position:absolute;inset:-28px;z-index:10;display:grid;place-items:center;padding:18px;border-radius:14px;background:rgba(6,9,20,.7);-webkit-backdrop-filter:blur(5px);backdrop-filter:blur(5px);opacity:0;visibility:hidden;transition:opacity .2s ease,visibility 0s linear .2s}
.p2c-kit .dg-scrim.is-open{opacity:1;visibility:visible;transition:opacity .2s ease}
.p2c-kit .dg-panel{width:min(100%,400px);padding:24px;border:1px solid #3b2a3f;border-radius:20px;background:#0d1226;box-shadow:0 40px 80px -24px rgba(0,0,0,.95),0 0 0 1px rgba(244,63,94,.15);transform:translateY(14px) scale(.96);transition:transform .35s cubic-bezier(.34,1.5,.64,1)}
.p2c-kit .dg-scrim.is-open .dg-panel{transform:none}
.p2c-kit .dg-icon{display:grid;place-items:center;width:42px;height:42px;margin-bottom:14px;border-radius:12px;background:rgba(244,63,94,.18);color:#fb7185;font-size:20px;font-weight:900}
.p2c-kit .dg-panel h4{margin:0 0 8px;font-size:18px;font-weight:800;color:#fff}
.p2c-kit .dg-panel p{margin:0 0 18px;color:#9fb0d6;font-size:13px;line-height:1.55}
.p2c-kit .dg-label{display:block;margin-bottom:8px;color:#cbd5f5;font-size:13px;font-weight:600}
.p2c-kit .dg-label code{padding:2px 6px;border-radius:6px;background:rgba(255,255,255,.08);color:#fff;font:700 12px ui-monospace,SFMono-Regular,Menlo,monospace}
.p2c-kit .dg-input{width:100%;padding:12px 14px;border:1px solid #2b3a57;border-radius:12px;background:#080d1c;color:#fff;font:600 14px ui-monospace,SFMono-Regular,Menlo,monospace;outline:0;transition:border-color .2s ease,box-shadow .2s ease}
.p2c-kit .dg-input:focus{border-color:#f43f5e;box-shadow:0 0 0 4px rgba(244,63,94,.18)}
.p2c-kit .dg-input.is-match{border-color:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.16)}
.p2c-kit .dg-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:18px}
.p2c-kit .dg-cancel,.p2c-kit .dg-confirm{padding:11px 18px;border-radius:12px;font-size:14px;font-weight:800;transition:filter .2s ease,opacity .2s ease,transform .15s ease}
.p2c-kit .dg-cancel{border:1px solid #2b3a57;background:transparent;color:#cbd5f5}
.p2c-kit .dg-cancel:hover{background:rgba(255,255,255,.06)}
.p2c-kit .dg-confirm{border:0;background:linear-gradient(135deg,#be123c,#f43f5e);color:#fff}
.p2c-kit .dg-confirm:disabled{opacity:.35;cursor:not-allowed}
.p2c-kit .dg-confirm:not(:disabled):hover{filter:brightness(1.12)}
.p2c-kit .dg-confirm:not(:disabled):active{transform:scale(.97)}`,
`(function () {
  var root = document.querySelector('.dg-root');
  if (!root) return;
  var open = root.querySelector('.dg-open');
  var scrim = root.querySelector('.dg-scrim');
  var input = root.querySelector('.dg-input');
  var cancel = root.querySelector('.dg-cancel');
  var ok = root.querySelector('.dg-confirm');
  var out = root.querySelector('.dg-out');
  var NAME = 'acme/api', HINT = 'acme/api · last deployed 2 hours ago', busy = false;
  function sync() {
    var m = input.value === NAME;
    ok.disabled = !m;
    input.classList.toggle('is-match', m);
  }
  function show() {
    scrim.classList.add('is-open'); scrim.setAttribute('aria-hidden', 'false');
    input.value = ''; sync();
    setTimeout(function () { input.focus(); }, 30);
  }
  function hide() {
    if (busy) return;
    scrim.classList.remove('is-open'); scrim.setAttribute('aria-hidden', 'true');
    open.focus();
  }
  input.addEventListener('input', sync);
  open.addEventListener('click', show);
  cancel.addEventListener('click', hide);
  scrim.addEventListener('pointerdown', function (e) { if (e.target === scrim) hide(); });
  ok.addEventListener('click', function () {
    if (ok.disabled || busy) return;
    busy = true; ok.disabled = true; ok.textContent = 'Deleting…';
    setTimeout(function () {
      busy = false; ok.textContent = 'Delete forever';
      hide();
      out.textContent = '✓ ' + NAME + ' was deleted';
      setTimeout(function () { out.textContent = HINT; }, 2400);
    }, 1200);
  });
  scrim.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { e.preventDefault(); hide(); return; }
    if (e.key === 'Enter' && e.target === input && !ok.disabled) { e.preventDefault(); ok.click(); return; }
    if (e.key === 'Tab') {
      var f = [input, cancel, ok].filter(function (n) { return !n.disabled; });
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      if (e.shiftKey) f[(i <= 0 ? f.length : i) - 1].focus();
      else f[(i + 1) % f.length].focus();
    }
  });
})();`,
'Pro',['modal','danger','confirm','delete','developer','a11y']),

// 15 ─ TOAST STACK: auto-dismiss with progress bar, pause on hover/focus, max 4
item('modal-toasts','Toast notification stack','Modals & popups','Stacked toasts with progress bar, pause on hover or focus, dismiss button and a live region. Max four visible at once.',
`<div class="p2c-stage p2c-kit"><div class="ts-root"><div class="ts-btns"><button class="ts-trig" type="button" data-k="ok">Success</button><button class="ts-trig" type="button" data-k="err">Error</button><button class="ts-trig" type="button" data-k="info">Info</button><button class="ts-trig" type="button" data-k="run">Deploy</button></div><p class="p2c-note">Hover a toast to pause its timer</p><div class="ts-stack" aria-live="polite"></div></div></div>`,
`.p2c-kit .ts-root{position:relative;display:grid;justify-items:center;align-content:center;gap:4px;width:100%;min-height:300px}
.p2c-kit .ts-btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center}
.p2c-kit .ts-trig{padding:11px 18px;border:1px solid #2b3a57;border-radius:12px;background:#0c1328;color:#e1e8ff;font-size:14px;font-weight:700;transition:border-color .2s ease,transform .15s ease,background .2s ease}
.p2c-kit .ts-trig:hover{border-color:#6366f1;background:#121b3a}
.p2c-kit .ts-trig:active{transform:scale(.96)}
.p2c-kit .ts-trig:focus-visible,.p2c-kit .ts-x:focus-visible{outline:2px solid #818cf8;outline-offset:3px}
.p2c-kit .ts-stack{position:absolute;right:0;bottom:0;display:grid;gap:10px;width:min(100%,330px);pointer-events:none}
.p2c-kit .ts-toast{--c:#6366f1;position:relative;display:flex;align-items:flex-start;gap:12px;padding:13px 14px 17px;border:1px solid #2b3a57;border-radius:14px;overflow:hidden;background:rgba(12,19,40,.94);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 24px 48px -20px rgba(0,0,0,.9);pointer-events:auto;animation:ts-in .4s cubic-bezier(.34,1.56,.64,1);transition:opacity .25s ease,transform .25s ease}
.p2c-kit .ts-toast[data-k="ok"]{--c:#10b981}
.p2c-kit .ts-toast[data-k="err"]{--c:#f43f5e}
.p2c-kit .ts-toast[data-k="info"]{--c:#38bdf8}
.p2c-kit .ts-toast[data-k="run"]{--c:#a78bfa}
.p2c-kit .ts-toast.is-out{opacity:0;transform:translateX(26px) scale(.96)}
@keyframes ts-in{from{opacity:0;transform:translateX(30px) scale(.94)}to{opacity:1;transform:none}}
.p2c-kit .ts-ico{display:grid;place-items:center;flex:none;width:28px;height:28px;border-radius:9px;background:color-mix(in srgb,var(--c) 22%,transparent);color:var(--c);font-size:14px;font-weight:900}
.p2c-kit .ts-txt{flex:1;min-width:0}
.p2c-kit .ts-txt strong{display:block;color:#fff;font-size:14px;font-weight:800}
.p2c-kit .ts-txt span{display:block;margin-top:2px;color:#9fb0d6;font-size:12px;line-height:1.45}
.p2c-kit .ts-x{flex:none;width:24px;height:24px;border:0;border-radius:7px;background:transparent;color:#8ea0c4;font-size:16px;line-height:1}
.p2c-kit .ts-x:hover{background:rgba(255,255,255,.1);color:#fff}
.p2c-kit .ts-bar{position:absolute;left:0;bottom:0;width:100%;height:3px;background:var(--c);transform-origin:0 50%;animation:ts-bar 4.5s linear forwards}
.p2c-kit .ts-toast:hover .ts-bar,.p2c-kit .ts-toast:focus-within .ts-bar{animation-play-state:paused}
@keyframes ts-bar{from{transform:scaleX(1)}to{transform:scaleX(0)}}`,
`(function () {
  var root = document.querySelector('.ts-root');
  if (!root) return;
  var stack = root.querySelector('.ts-stack');
  var TYPES = {
    ok: { i: '✓', t: 'Deployment ready', m: 'api-7f3c9 is live on production.' },
    err: { i: '!', t: 'Build failed', m: 'Exit code 1 in step npm run build.' },
    info: { i: 'i', t: 'New version available', m: 'v2.4.0 ships 12 improvements.' },
    run: { i: '↻', t: 'Deploying…', m: 'Step 2 of 4 · installing packages.' }
  };
  var MS = 4500;
  function dismiss(el) {
    if (el.getAttribute('data-gone')) return;
    el.setAttribute('data-gone', '1');
    el.classList.add('is-out');
    setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 280);
  }
  function life(el) {
    var left = MS, t0 = 0, tm = 0, running = false;
    function start() { if (running) return; running = true; t0 = Date.now(); tm = setTimeout(function () { dismiss(el); }, Math.max(left, 300)); }
    function stop() { if (!running) return; running = false; clearTimeout(tm); left -= Date.now() - t0; }
    el.addEventListener('pointerenter', stop);
    el.addEventListener('pointerleave', start);
    el.addEventListener('focusin', stop);
    el.addEventListener('focusout', start);
    start();
  }
  function push(k) {
    var T = TYPES[k];
    var live = [].slice.call(stack.children).filter(function (n) { return !n.getAttribute('data-gone'); });
    if (live.length >= 4) dismiss(live[0]);
    var el = document.createElement('div');
    el.className = 'ts-toast'; el.setAttribute('data-k', k); el.setAttribute('role', 'status');
    var ico = document.createElement('span'); ico.className = 'ts-ico'; ico.setAttribute('aria-hidden', 'true'); ico.textContent = T.i;
    var txt = document.createElement('div'); txt.className = 'ts-txt';
    var s = document.createElement('strong'); s.textContent = T.t;
    var m = document.createElement('span'); m.textContent = T.m;
    txt.appendChild(s); txt.appendChild(m);
    var x = document.createElement('button'); x.type = 'button'; x.className = 'ts-x'; x.setAttribute('aria-label', 'Dismiss notification'); x.textContent = '×';
    x.addEventListener('click', function () { dismiss(el); });
    var bar = document.createElement('span'); bar.className = 'ts-bar'; bar.setAttribute('aria-hidden', 'true');
    el.appendChild(ico); el.appendChild(txt); el.appendChild(x); el.appendChild(bar);
    stack.appendChild(el);
    life(el);
  }
  [].slice.call(root.querySelectorAll('.ts-trig')).forEach(function (b) {
    b.addEventListener('click', function () { push(b.getAttribute('data-k')); });
  });
  setTimeout(function () { push('ok'); }, 400);
})();`,
'Pro',['modal','toast','notification','stack','developer','a11y']),

// ───────────────────────────── NAVIGATION ─────────────────────────────

// 16 ─ SIDEBAR: collapsible dashboard sidebar with spring-sliding active indicator
item('nav-sidebar','Collapsible dev sidebar','Navigation','Dashboard sidebar with a spring-sliding active indicator, count badge, collapse-to-icons and arrow-key navigation.',
`<div class="p2c-stage p2c-kit"><nav class="sb-nav" aria-label="Project"><div class="sb-head"><span class="sb-logo" aria-hidden="true">▲</span><strong class="sb-brand">acme-cloud</strong><button class="sb-collapse" type="button" aria-label="Collapse sidebar" aria-expanded="true">‹</button></div><div class="sb-list"><span class="sb-ind" aria-hidden="true"></span><button class="sb-link" type="button" aria-current="page" title="Overview"><span class="sb-ico" aria-hidden="true">◧</span><span class="sb-text">Overview</span></button><button class="sb-link" type="button" title="Deployments"><span class="sb-ico" aria-hidden="true">▲</span><span class="sb-text">Deployments</span><span class="sb-badge">3</span></button><button class="sb-link" type="button" title="Logs"><span class="sb-ico" aria-hidden="true">≣</span><span class="sb-text">Logs</span></button><button class="sb-link" type="button" title="Domains"><span class="sb-ico" aria-hidden="true">◎</span><span class="sb-text">Domains</span></button><button class="sb-link" type="button" title="Settings"><span class="sb-ico" aria-hidden="true">⚙</span><span class="sb-text">Settings</span></button></div></nav></div>`,
`.p2c-kit .sb-nav{width:248px;overflow:hidden;border:1px solid #243252;border-radius:20px;background:linear-gradient(180deg,#0e1530,#0a1022);box-shadow:0 30px 60px -28px rgba(0,0,0,.9);transition:width .38s cubic-bezier(.65,0,.25,1)}
.p2c-kit .sb-nav.is-min{width:70px}
.p2c-kit .sb-head{display:flex;align-items:center;gap:12px;padding:14px 14px 6px;white-space:nowrap}
.p2c-kit .sb-logo{display:grid;place-items:center;flex:none;width:34px;height:34px;border-radius:11px;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#fff;font-size:14px}
.p2c-kit .sb-brand{flex:1;color:#fff;font-size:15px;font-weight:800}
.p2c-kit .sb-collapse{flex:none;width:28px;height:28px;border:1px solid #2b3a57;border-radius:9px;background:transparent;color:#9fb0d6;font-size:16px;line-height:1;transition:transform .35s ease,background .2s ease}
.p2c-kit .sb-collapse:hover{background:rgba(255,255,255,.08);color:#fff}
.p2c-kit .sb-nav.is-min .sb-collapse{transform:rotate(180deg)}
.p2c-kit .sb-nav.is-min .sb-brand{opacity:0}
.p2c-kit .sb-brand{transition:opacity .2s ease}
.p2c-kit .sb-list{position:relative;display:grid;gap:4px;padding:10px}
.p2c-kit .sb-ind{position:absolute;top:0;left:10px;right:10px;height:44px;border-radius:12px;background:linear-gradient(90deg,rgba(99,102,241,.32),rgba(34,211,238,.1));box-shadow:inset 3px 0 0 #818cf8;transition:transform .45s cubic-bezier(.34,1.35,.64,1),height .3s ease}
.p2c-kit .sb-link{position:relative;z-index:1;display:flex;align-items:center;gap:12px;width:100%;height:44px;padding:0 13px;border:0;border-radius:12px;background:transparent;color:#9fb0d6;font-size:14px;font-weight:700;text-align:left;white-space:nowrap;transition:color .2s ease,background .2s ease}
.p2c-kit .sb-link:hover{color:#fff;background:rgba(255,255,255,.04)}
.p2c-kit .sb-link[aria-current="page"]{color:#fff}
.p2c-kit .sb-link:focus-visible,.p2c-kit .sb-collapse:focus-visible{outline:2px solid #818cf8;outline-offset:2px}
.p2c-kit .sb-ico{flex:none;width:20px;text-align:center;font-size:16px}
.p2c-kit .sb-text{flex:1;transition:opacity .2s ease}
.p2c-kit .sb-badge{padding:1px 8px;border-radius:999px;background:#6366f1;color:#fff;font-size:11px;font-weight:800;transition:opacity .2s ease}
.p2c-kit .sb-nav.is-min .sb-text,.p2c-kit .sb-nav.is-min .sb-badge{opacity:0}`,
`(function () {
  var nav = document.querySelector('.sb-nav');
  if (!nav) return;
  var ind = nav.querySelector('.sb-ind');
  var links = [].slice.call(nav.querySelectorAll('.sb-link'));
  var tog = nav.querySelector('.sb-collapse');
  function cur() { return links.filter(function (x) { return x.getAttribute('aria-current') === 'page'; })[0] || links[0]; }
  function place(l) { ind.style.height = l.offsetHeight + 'px'; ind.style.transform = 'translateY(' + l.offsetTop + 'px)'; }
  function go(l) {
    links.forEach(function (x) { x.removeAttribute('aria-current'); });
    l.setAttribute('aria-current', 'page');
    place(l);
  }
  links.forEach(function (l, i) {
    l.addEventListener('click', function () { go(l); });
    l.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); links[(i + links.length - 1) % links.length].focus(); }
    });
  });
  tog.addEventListener('click', function () {
    var min = nav.classList.toggle('is-min');
    tog.setAttribute('aria-expanded', min ? 'false' : 'true');
    tog.setAttribute('aria-label', min ? 'Expand sidebar' : 'Collapse sidebar');
  });
  ind.style.transition = 'none';
  place(cur());
  void ind.offsetWidth;
  ind.style.transition = '';
  window.addEventListener('resize', function () { place(cur()); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(cur()); });
})();`,
'Pro',['navigation','sidebar','dashboard','indicator','developer']),

// 17 ─ TABS: Preview / Code / Console with sliding pill and fully keyboard-accessible tabpanels
item('nav-tabs','Sliding pill tabs (Preview / Code / Console)','Navigation','ARIA tabs with a sliding glass pill, animated panels, syntax-coloured code view and Arrow / Home / End keyboard support.',
`<div class="p2c-stage p2c-kit"><div class="tb-wrap"><div class="tb-list" role="tablist" aria-label="Editor views"><span class="tb-ind" aria-hidden="true"></span><button class="tb-tab" type="button" role="tab" id="tb-t0" aria-controls="tb-p0" aria-selected="true">Preview</button><button class="tb-tab" type="button" role="tab" id="tb-t1" aria-controls="tb-p1" aria-selected="false" tabindex="-1">Code</button><button class="tb-tab" type="button" role="tab" id="tb-t2" aria-controls="tb-p2" aria-selected="false" tabindex="-1">Console</button></div><div class="tb-panels"><div class="tb-panel" role="tabpanel" id="tb-p0" aria-labelledby="tb-t0" tabindex="0"><div class="tb-mock"><span class="tb-mock-bar"></span><span class="tb-mock-h">Ship faster</span><span class="tb-mock-l"></span><span class="tb-mock-l tb-s"></span><span class="tb-mock-b">Get started</span></div></div><div class="tb-panel" role="tabpanel" id="tb-p1" aria-labelledby="tb-t1" tabindex="0" hidden><pre class="tb-code"><span class="c">// api/deploy.ts</span>
<span class="k">export async function</span> <span class="f">deploy</span>(project: <span class="t">string</span>) {
  <span class="k">const</span> res = <span class="k">await</span> <span class="f">fetch</span>(<span class="s">"/api/deploy"</span>, {
    method: <span class="s">"POST"</span>,
    body: JSON.<span class="f">stringify</span>({ project })
  });
  <span class="k">return</span> res.<span class="f">json</span>();
}</pre></div><div class="tb-panel" role="tabpanel" id="tb-p2" aria-labelledby="tb-t2" tabindex="0" hidden><pre class="tb-code"><span class="d">12:04:11</span> <span class="ok">INFO </span> server listening on :3000
<span class="d">12:04:15</span> <span class="ok">INFO </span> GET /api/health 200 3ms
<span class="d">12:04:21</span> <span class="w">WARN </span> slow query users.find 412ms
<span class="d">12:04:30</span> <span class="e">ERROR</span> payment webhook signature invalid</pre></div></div></div></div>`,
`.p2c-kit .tb-wrap{width:min(100%,460px)}
.p2c-kit .tb-list{position:relative;display:inline-flex;gap:2px;padding:5px;border:1px solid #243252;border-radius:14px;background:#0a1022}
.p2c-kit .tb-ind{position:absolute;top:5px;left:0;height:calc(100% - 10px);width:0;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#7c3aed);box-shadow:0 8px 20px -8px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.3);transition:transform .45s cubic-bezier(.34,1.3,.64,1),width .35s ease}
.p2c-kit .tb-tab{position:relative;z-index:1;padding:9px 18px;border:0;border-radius:10px;background:transparent;color:#8ea0c4;font-size:14px;font-weight:700;transition:color .25s ease}
.p2c-kit .tb-tab:hover{color:#fff}
.p2c-kit .tb-tab[aria-selected="true"]{color:#fff}
.p2c-kit .tb-tab:focus-visible,.p2c-kit .tb-panel:focus-visible{outline:2px solid #a5b4fc;outline-offset:2px}
.p2c-kit .tb-panels{margin-top:12px;border:1px solid #243252;border-radius:16px;background:#0a1022;overflow:hidden}
.p2c-kit .tb-panel{min-height:176px;padding:18px;animation:tb-in .35s ease}
.p2c-kit .tb-panel[hidden]{display:none}
@keyframes tb-in{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.p2c-kit .tb-code{margin:0;color:#c7d2fe;font:500 12.5px/1.75 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap}
.p2c-kit .tb-code .k{color:#c084fc}.p2c-kit .tb-code .s{color:#86efac}.p2c-kit .tb-code .f{color:#67e8f9}.p2c-kit .tb-code .t{color:#fcd34d}.p2c-kit .tb-code .c,.p2c-kit .tb-code .d{color:#62739a}
.p2c-kit .tb-code .ok{color:#34d399}.p2c-kit .tb-code .w{color:#fbbf24}.p2c-kit .tb-code .e{color:#fb7185}
.p2c-kit .tb-mock{display:grid;gap:10px;justify-items:start;padding:16px;border-radius:12px;background:linear-gradient(135deg,#141c3d,#0e1530)}
.p2c-kit .tb-mock-bar{width:44px;height:6px;border-radius:99px;background:#6366f1}
.p2c-kit .tb-mock-h{color:#fff;font-size:20px;font-weight:800}
.p2c-kit .tb-mock-l{width:78%;height:8px;border-radius:99px;background:#26335a}
.p2c-kit .tb-mock-l.tb-s{width:52%}
.p2c-kit .tb-mock-b{margin-top:4px;padding:8px 14px;border-radius:10px;background:linear-gradient(135deg,#4f46e5,#22d3ee);color:#fff;font-size:12px;font-weight:800}`,
`(function () {
  var list = document.querySelector('.tb-list');
  if (!list) return;
  var ind = list.querySelector('.tb-ind');
  var tabs = [].slice.call(list.querySelectorAll('.tb-tab'));
  function slide(t) { ind.style.width = t.offsetWidth + 'px'; ind.style.transform = 'translateX(' + t.offsetLeft + 'px)'; }
  function pick(i, focus) {
    tabs.forEach(function (t, n) {
      var on = n === i;
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      var p = document.getElementById(t.getAttribute('aria-controls'));
      if (p) p.hidden = !on;
    });
    slide(tabs[i]);
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i, false); });
    t.addEventListener('keydown', function (e) {
      var n = -1;
      if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
      else if (e.key === 'ArrowLeft') n = (i + tabs.length - 1) % tabs.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = tabs.length - 1;
      if (n > -1) { e.preventDefault(); pick(n, true); }
    });
  });
  function current() { var i = 0; tabs.forEach(function (t, n) { if (t.getAttribute('aria-selected') === 'true') i = n; }); return i; }
  ind.style.transition = 'none';
  slide(tabs[0]);
  void ind.offsetWidth;
  ind.style.transition = '';
  window.addEventListener('resize', function () { slide(tabs[current()]); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { slide(tabs[current()]); });
})();`,
'Pro',['navigation','tabs','aria','pill','code','a11y']),

// 18 ─ STEPPER: deploy wizard with animated progress line and step states
item('nav-stepper','Deploy wizard stepper','Navigation','Three-step wizard with an animated progress line, check-marked completed steps, back / continue buttons and a finished state.',
`<div class="p2c-stage p2c-kit"><div class="st-wrap"><ol class="st-steps"><span class="st-line" aria-hidden="true"><span class="st-fill"></span></span><li class="st-step"><span class="st-dot">1</span><span class="st-name">Connect</span></li><li class="st-step"><span class="st-dot">2</span><span class="st-name">Configure</span></li><li class="st-step"><span class="st-dot">3</span><span class="st-name">Deploy</span></li></ol><div class="st-body" aria-live="polite"><h4 class="st-title"></h4><p class="st-desc"></p></div><div class="st-actions"><button class="st-back" type="button">Back</button><button class="st-next" type="button">Continue</button></div></div></div>`,
`.p2c-kit .st-wrap{width:min(100%,440px);padding:22px;border:1px solid #243252;border-radius:20px;background:linear-gradient(180deg,#0e1530,#0a1022);box-shadow:0 30px 60px -28px rgba(0,0,0,.9)}
.p2c-kit .st-steps{position:relative;display:grid;grid-template-columns:repeat(3,1fr);margin:0;padding:0;list-style:none}
.p2c-kit .st-line{position:absolute;top:16px;left:16.66%;right:16.66%;height:3px;border-radius:99px;background:#223052;overflow:hidden}
.p2c-kit .st-fill{display:block;width:100%;height:100%;background:linear-gradient(90deg,#6366f1,#22d3ee);transform-origin:0 50%;transform:scaleX(0);transition:transform .55s cubic-bezier(.65,0,.25,1)}
.p2c-kit .st-step{position:relative;display:grid;justify-items:center;gap:8px}
.p2c-kit .st-dot{display:grid;place-items:center;width:35px;height:35px;border:2px solid #2b3a57;border-radius:50%;background:#0a1022;color:#8ea0c4;font-size:13px;font-weight:800;transition:background .35s ease,border-color .35s ease,color .35s ease,transform .35s cubic-bezier(.34,1.56,.64,1),box-shadow .35s ease}
.p2c-kit .st-name{color:#8ea0c4;font-size:12px;font-weight:700;transition:color .3s ease}
.p2c-kit .st-step.is-cur .st-dot{border-color:#818cf8;color:#fff;transform:scale(1.12);box-shadow:0 0 0 5px rgba(99,102,241,.2)}
.p2c-kit .st-step.is-cur .st-name{color:#fff}
.p2c-kit .st-step.is-done .st-dot{border-color:transparent;background:linear-gradient(135deg,#6366f1,#22d3ee);color:#fff}
.p2c-kit .st-step.is-done .st-name{color:#cbd5f5}
.p2c-kit .st-body{min-height:92px;margin-top:22px;padding:16px;border:1px solid #1d2a47;border-radius:14px;background:rgba(255,255,255,.03)}
.p2c-kit .st-title{margin:0 0 6px;color:#fff;font-size:16px;font-weight:800}
.p2c-kit .st-desc{margin:0;color:#9fb0d6;font-size:13px;line-height:1.55}
.p2c-kit .st-body.is-swap{animation:st-swap .35s ease}
@keyframes st-swap{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}
.p2c-kit .st-actions{display:flex;justify-content:space-between;gap:10px;margin-top:16px}
.p2c-kit .st-back,.p2c-kit .st-next{padding:11px 20px;border-radius:12px;font-size:14px;font-weight:800;transition:opacity .2s ease,filter .2s ease,transform .15s ease}
.p2c-kit .st-back{border:1px solid #2b3a57;background:transparent;color:#cbd5f5}
.p2c-kit .st-back:disabled{opacity:.35;cursor:not-allowed}
.p2c-kit .st-next{border:0;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff}
.p2c-kit .st-next:hover{filter:brightness(1.12)}
.p2c-kit .st-next:active,.p2c-kit .st-back:not(:disabled):active{transform:scale(.97)}
.p2c-kit .st-back:focus-visible,.p2c-kit .st-next:focus-visible{outline:2px solid #a5b4fc;outline-offset:3px}`,
`(function () {
  var wrap = document.querySelector('.st-wrap');
  if (!wrap) return;
  var steps = [].slice.call(wrap.querySelectorAll('.st-step'));
  var fill = wrap.querySelector('.st-fill');
  var body = wrap.querySelector('.st-body');
  var title = wrap.querySelector('.st-title');
  var desc = wrap.querySelector('.st-desc');
  var back = wrap.querySelector('.st-back');
  var next = wrap.querySelector('.st-next');
  var C = [
    { t: 'Connect your repository', d: 'Authorize GitHub and choose the repo to ship. Only read access to code is requested.', b: 'Continue' },
    { t: 'Configure the build', d: 'Framework detected: Vite + React. Build command npm run build, output directory dist.', b: 'Continue' },
    { t: 'Deploy to the edge', d: 'Your app is built, tested and replicated to 28 regions in about 40 seconds.', b: 'Deploy now' },
    { t: 'You are live', d: 'Deployment finished successfully. Your site is available at acme-app.dev.', b: 'Start over' }
  ];
  var i = 0;
  function paint() {
    steps.forEach(function (s, n) {
      var dot = s.querySelector('.st-dot');
      s.classList.toggle('is-done', n < i);
      s.classList.toggle('is-cur', n === i);
      dot.textContent = n < i ? '✓' : String(n + 1);
    });
    fill.style.transform = 'scaleX(' + Math.min(1, i / (steps.length - 1)) + ')';
    title.textContent = C[i].t; desc.textContent = C[i].d; next.textContent = C[i].b;
    back.disabled = i === 0 || i === C.length - 1;
    body.classList.remove('is-swap'); void body.offsetWidth; body.classList.add('is-swap');
  }
  next.addEventListener('click', function () { i = i >= C.length - 1 ? 0 : i + 1; paint(); });
  back.addEventListener('click', function () { if (i > 0) { i--; paint(); } });
  paint();
})();`,
'Pro',['navigation','stepper','wizard','progress','developer']),

// ───────────────────────────── CARDS & PANELS ─────────────────────────────

// 19 ─ SPOTLIGHT GRID: one cursor, glowing borders across every card at once
item('card-spotlight','Spotlight feature grid','Cards & panels','Feature cards whose borders and inner glow follow one shared cursor across the whole grid, Linear-style.',
`<div class="p2c-stage p2c-kit"><div class="sc-grid"><article class="sc-card"><span class="sc-ico" aria-hidden="true">⚡</span><h4>Edge runtime</h4><p>Run server code in 28 regions with sub-50ms cold starts.</p><a class="sc-link" href="#" onclick="return false">Read docs →</a></article><article class="sc-card"><span class="sc-ico" aria-hidden="true">◎</span><h4>Preview URLs</h4><p>Every pull request gets its own live, shareable environment.</p><a class="sc-link" href="#" onclick="return false">Read docs →</a></article><article class="sc-card"><span class="sc-ico" aria-hidden="true">⛨</span><h4>Secure by default</h4><p>Encrypted secrets, audit logs and role-based access built in.</p><a class="sc-link" href="#" onclick="return false">Read docs →</a></article></div></div>`,
`.p2c-kit .sc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:14px;width:min(100%,780px)}
.p2c-kit .sc-card{--mx:-400px;--my:-400px;position:relative;isolation:isolate;padding:22px;border-radius:18px;background:#0b1124;transition:transform .3s ease}
.p2c-kit .sc-card::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;padding:1.5px;background:radial-gradient(220px circle at var(--mx) var(--my),#c7d2fe,#6366f1 40%,transparent 75%),rgba(255,255,255,.08);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask-composite:exclude}
.p2c-kit .sc-card::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;background:radial-gradient(260px circle at var(--mx) var(--my),rgba(99,102,241,.2),transparent 70%);opacity:0;transition:opacity .3s ease}
.p2c-kit .sc-grid:hover .sc-card::after{opacity:1}
.p2c-kit .sc-card:hover{transform:translateY(-3px)}
.p2c-kit .sc-ico{display:grid;place-items:center;width:38px;height:38px;margin-bottom:14px;border-radius:11px;background:linear-gradient(135deg,rgba(99,102,241,.3),rgba(34,211,238,.18));color:#c7d2fe;font-size:17px}
.p2c-kit .sc-card h4{margin:0 0 6px;color:#fff;font-size:16px;font-weight:800}
.p2c-kit .sc-card p{margin:0 0 14px;color:#9fb0d6;font-size:13px;line-height:1.55}
.p2c-kit .sc-link{color:#a5b4fc;font-size:13px;font-weight:700;text-decoration:none}
.p2c-kit .sc-link:hover{color:#fff}
.p2c-kit .sc-link:focus-visible{outline:2px solid #818cf8;outline-offset:3px;border-radius:4px}`,
`(function () {
  var grid = document.querySelector('.sc-grid');
  if (!grid) return;
  var cards = [].slice.call(grid.querySelectorAll('.sc-card'));
  grid.addEventListener('pointermove', function (e) {
    cards.forEach(function (c) {
      var r = c.getBoundingClientRect();
      c.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      c.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
  grid.addEventListener('pointerleave', function () {
    cards.forEach(function (c) { c.style.setProperty('--mx', '-400px'); c.style.setProperty('--my', '-400px'); });
  });
})();`,
'Pro',['card','spotlight','grid','glow','premium']),

// 20 ─ CODE SNIPPET CARD: package-manager switcher + one-click copy
item('card-code','Install snippet card with copy','Cards & panels','Code card with a sliding npm / pnpm / yarn / bun switcher, coloured command and an animated copy-to-clipboard button.',
`<div class="p2c-stage p2c-kit"><div class="cs-card"><div class="cs-head"><span class="cs-dots" aria-hidden="true"><i></i><i></i><i></i></span><div class="cs-seg" role="group" aria-label="Package manager"><span class="cs-thumb" aria-hidden="true"></span><button class="cs-tab" type="button" aria-pressed="true" data-pm="npm">npm</button><button class="cs-tab" type="button" aria-pressed="false" data-pm="pnpm">pnpm</button><button class="cs-tab" type="button" aria-pressed="false" data-pm="yarn">yarn</button><button class="cs-tab" type="button" aria-pressed="false" data-pm="bun">bun</button></div></div><div class="cs-body"><code class="cs-code"><span class="cs-prompt">$</span> <span class="cs-cmd"></span></code><button class="cs-copy" type="button" aria-label="Copy command"><svg class="cs-i1" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg><svg class="cs-i2" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg></button></div><p class="cs-msg" role="status"></p></div></div>`,
`.p2c-kit .cs-card{width:min(100%,430px);overflow:hidden;border:1px solid #243252;border-radius:18px;background:#080d1c;box-shadow:0 30px 60px -28px rgba(0,0,0,.95)}
.p2c-kit .cs-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px;border-bottom:1px solid #1a2745;background:#0b1226}
.p2c-kit .cs-dots{display:inline-flex;gap:6px}
.p2c-kit .cs-dots i{width:10px;height:10px;border-radius:50%;background:#2b3a57}
.p2c-kit .cs-dots i:nth-child(1){background:#fb7185}.p2c-kit .cs-dots i:nth-child(2){background:#fbbf24}.p2c-kit .cs-dots i:nth-child(3){background:#34d399}
.p2c-kit .cs-seg{position:relative;display:inline-flex;padding:3px;border:1px solid #243252;border-radius:10px;background:#080d1c}
.p2c-kit .cs-thumb{position:absolute;top:3px;left:0;height:calc(100% - 6px);width:0;border-radius:7px;background:#26335a;transition:transform .35s cubic-bezier(.34,1.3,.64,1),width .3s ease}
.p2c-kit .cs-tab{position:relative;z-index:1;padding:5px 11px;border:0;border-radius:7px;background:transparent;color:#8ea0c4;font:700 12px ui-monospace,SFMono-Regular,Menlo,monospace;transition:color .2s ease}
.p2c-kit .cs-tab[aria-pressed="true"]{color:#fff}
.p2c-kit .cs-tab:hover{color:#fff}
.p2c-kit .cs-tab:focus-visible,.p2c-kit .cs-copy:focus-visible{outline:2px solid #818cf8;outline-offset:2px}
.p2c-kit .cs-body{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 16px}
.p2c-kit .cs-code{font:600 14px ui-monospace,SFMono-Regular,Menlo,monospace;color:#e1e8ff;overflow-x:auto;white-space:nowrap}
.p2c-kit .cs-prompt{color:#62739a}
.p2c-kit .cs-cmd{display:inline-block;transition:opacity .2s ease,transform .2s ease}
.p2c-kit .cs-cmd.is-swap{opacity:0;transform:translateY(5px)}
.p2c-kit .cs-copy{position:relative;display:grid;place-items:center;flex:none;width:36px;height:36px;border:1px solid #2b3a57;border-radius:10px;background:#0c1328;color:#9fb0d6;transition:background .2s ease,color .2s ease,border-color .2s ease,transform .15s ease}
.p2c-kit .cs-copy:hover{background:#141e3d;color:#fff}
.p2c-kit .cs-copy:active{transform:scale(.92)}
.p2c-kit .cs-copy>svg{grid-area:1/1;transition:opacity .2s ease,transform .3s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .cs-i2{opacity:0;transform:scale(.3) rotate(-30deg)}
.p2c-kit .cs-copy.is-ok{border-color:#10b981;background:rgba(16,185,129,.16);color:#34d399}
.p2c-kit .cs-copy.is-ok .cs-i1{opacity:0;transform:scale(.3)}
.p2c-kit .cs-copy.is-ok .cs-i2{opacity:1;transform:none}
.p2c-kit .cs-msg{min-height:18px;margin:-6px 0 8px 16px;color:#34d399;font-size:12px;font-weight:700}`,
`(function () {
  var card = document.querySelector('.cs-card');
  if (!card) return;
  var tabs = [].slice.call(card.querySelectorAll('.cs-tab'));
  var thumb = card.querySelector('.cs-thumb');
  var cmd = card.querySelector('.cs-cmd');
  var copy = card.querySelector('.cs-copy');
  var msg = card.querySelector('.cs-msg');
  var CMDS = { npm: 'npm install @acme/sdk', pnpm: 'pnpm add @acme/sdk', yarn: 'yarn add @acme/sdk', bun: 'bun add @acme/sdk' };
  var pm = 'npm', timer = 0, swapTimer = 0;
  function slide(t) { thumb.style.width = t.offsetWidth + 'px'; thumb.style.transform = 'translateX(' + t.offsetLeft + 'px)'; }
  function active() { return tabs.filter(function (t) { return t.getAttribute('aria-pressed') === 'true'; })[0] || tabs[0]; }
  function setCmd(first) {
    if (first) { cmd.textContent = CMDS[pm]; return; }
    cmd.classList.add('is-swap');
    clearTimeout(swapTimer);
    swapTimer = setTimeout(function () { cmd.textContent = CMDS[pm]; cmd.classList.remove('is-swap'); }, 160);
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      pm = t.getAttribute('data-pm');
      tabs.forEach(function (o) { o.setAttribute('aria-pressed', o === t ? 'true' : 'false'); });
      slide(t); setCmd(false);
    });
  });
  function done() {
    copy.classList.add('is-ok'); msg.textContent = 'Copied to clipboard';
    clearTimeout(timer);
    timer = setTimeout(function () { copy.classList.remove('is-ok'); msg.textContent = ''; }, 1800);
  }
  copy.addEventListener('click', function () {
    var text = CMDS[pm];
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else { fallback(); }
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (err) {}
      document.body.removeChild(ta); done();
    }
  });
  setCmd(true);
  thumb.style.transition = 'none'; slide(active()); void thumb.offsetWidth; thumb.style.transition = '';
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { slide(active()); });
})();`,
'Pro',['card','code','copy','snippet','developer','clipboard']),

// 21 ─ TERMINAL CARD: typed deploy log with replay
item('card-terminal','Animated terminal log','Cards & panels','Terminal window that types a command then streams coloured deploy log lines, with a blinking cursor and a replay button.',
`<div class="p2c-stage p2c-kit"><div class="tm-card"><div class="tm-head"><span class="tm-dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="tm-title">~/acme-api — zsh</span><button class="tm-replay" type="button" aria-label="Replay animation">↻ Replay</button></div><div class="tm-body" aria-label="Deploy log"></div></div></div>`,
`.p2c-kit .tm-card{width:min(100%,460px);overflow:hidden;border:1px solid #243252;border-radius:16px;background:#070b18;box-shadow:0 30px 60px -28px rgba(0,0,0,.95)}
.p2c-kit .tm-head{display:flex;align-items:center;gap:12px;padding:11px 14px;border-bottom:1px solid #1a2745;background:#0b1226}
.p2c-kit .tm-dots{display:inline-flex;gap:6px}
.p2c-kit .tm-dots i{width:10px;height:10px;border-radius:50%;background:#2b3a57}
.p2c-kit .tm-dots i:nth-child(1){background:#fb7185}.p2c-kit .tm-dots i:nth-child(2){background:#fbbf24}.p2c-kit .tm-dots i:nth-child(3){background:#34d399}
.p2c-kit .tm-title{flex:1;color:#62739a;font:600 12px ui-monospace,SFMono-Regular,Menlo,monospace;text-align:center}
.p2c-kit .tm-replay{padding:4px 10px;border:1px solid #2b3a57;border-radius:8px;background:transparent;color:#9fb0d6;font-size:11px;font-weight:700;transition:background .2s ease,color .2s ease}
.p2c-kit .tm-replay:hover{background:rgba(255,255,255,.08);color:#fff}
.p2c-kit .tm-replay:focus-visible{outline:2px solid #818cf8;outline-offset:2px}
.p2c-kit .tm-body{min-height:228px;padding:16px;font:500 13px/1.8 ui-monospace,SFMono-Regular,Menlo,monospace;color:#cbd5f5}
.p2c-kit .tm-line{white-space:pre-wrap;word-break:break-word}
.p2c-kit .tm-cmd{color:#fff;font-weight:700}
.p2c-kit .tm-ok{color:#34d399}
.p2c-kit .tm-warn{color:#fbbf24}
.p2c-kit .tm-dim{color:#62739a}
.p2c-kit .tm-link{color:#67e8f9;text-decoration:underline;text-underline-offset:3px}
.p2c-kit .tm-cursor{display:block;width:8px;height:16px;margin-top:2px;background:#a5b4fc;animation:tm-blink 1s steps(1) infinite}
@keyframes tm-blink{50%{opacity:0}}`,
`(function () {
  var body = document.querySelector('.tm-body');
  var again = document.querySelector('.tm-replay');
  if (!body) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var LINES = [
    { t: '$ npm run deploy', c: 'cmd', type: true },
    { t: '✔ Lint passed', c: 'ok' },
    { t: '✔ 128 tests passed (4.2s)', c: 'ok' },
    { t: '… Building production bundle', c: 'dim' },
    { t: '⚠ 2 warnings in src/utils.ts', c: 'warn' },
    { t: '✔ Uploaded 28 assets to the edge', c: 'ok' },
    { t: '→ https://api-7f3c9.acme.app', c: 'link' },
    { t: 'Done in 41.8s', c: 'dim' }
  ];
  var run = 0;
  function play() {
    var id = ++run;
    body.innerHTML = '';
    var cursor = document.createElement('span');
    cursor.className = 'tm-cursor';
    body.appendChild(cursor);
    var i = 0;
    function next() {
      if (id !== run || i >= LINES.length) return;
      var L = LINES[i++];
      var el = document.createElement('div');
      el.className = 'tm-line tm-' + L.c;
      body.insertBefore(el, cursor);
      if (reduce) { el.textContent = L.t; next(); return; }
      if (L.type) {
        var n = 0;
        (function ty() {
          if (id !== run) return;
          n++; el.textContent = L.t.slice(0, n);
          if (n < L.t.length) setTimeout(ty, 42); else setTimeout(next, 450);
        })();
      } else { el.textContent = L.t; setTimeout(next, 340); }
    }
    next();
  }
  again.addEventListener('click', play);
  play();
})();`,
'Pro',['card','terminal','log','typing','developer']),

// 22 ─ METRIC CARD: smooth sparkline, range switch, hover crosshair + tooltip
item('card-metric','Metric card with sparkline','Cards & panels','Analytics card: 24h / 7d / 30d range switch, smooth drawn sparkline, trend delta and a hover crosshair with tooltip.',
`<div class="p2c-stage p2c-kit"><div class="mt-card"><div class="mt-top"><div><p class="mt-label">API latency · p95</p><p class="mt-val">0 ms</p></div><div class="mt-range" role="group" aria-label="Range"><button type="button" aria-pressed="true" data-r="24h">24h</button><button type="button" aria-pressed="false" data-r="7d">7d</button><button type="button" aria-pressed="false" data-r="30d">30d</button></div></div><p class="mt-delta"></p><div class="mt-chart"><svg class="mt-svg" viewBox="0 0 320 110" role="img" aria-label="Latency trend chart"><defs><linearGradient id="mt-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6366f1" stop-opacity=".45"/><stop offset="1" stop-color="#6366f1" stop-opacity="0"/></linearGradient></defs><path class="mt-area" fill="url(#mt-g)"/><path class="mt-line" pathLength="1" fill="none" stroke="#818cf8" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><line class="mt-cross" y1="0" y2="110" stroke="#818cf8" stroke-width="1" stroke-dasharray="3 3"/><circle class="mt-dot" r="4.5" fill="#fff" stroke="#6366f1" stroke-width="2.5"/></svg><div class="mt-tip"></div></div></div></div>`,
`.p2c-kit .mt-card{width:min(100%,380px);padding:20px;border:1px solid #243252;border-radius:20px;background:linear-gradient(180deg,#0e1530,#0a1022);box-shadow:0 30px 60px -28px rgba(0,0,0,.9)}
.p2c-kit .mt-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
.p2c-kit .mt-label{margin:0;color:#8ea0c4;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
.p2c-kit .mt-val{margin:4px 0 0;color:#fff;font-size:30px;font-weight:800;letter-spacing:-.02em}
.p2c-kit .mt-range{display:inline-flex;padding:3px;border:1px solid #243252;border-radius:10px;background:#080d1c}
.p2c-kit .mt-range button{padding:5px 10px;border:0;border-radius:7px;background:transparent;color:#8ea0c4;font-size:12px;font-weight:700;transition:background .2s ease,color .2s ease}
.p2c-kit .mt-range button:hover{color:#fff}
.p2c-kit .mt-range button[aria-pressed="true"]{background:#26335a;color:#fff}
.p2c-kit .mt-range button:focus-visible{outline:2px solid #818cf8;outline-offset:2px}
.p2c-kit .mt-delta{margin:6px 0 10px;font-size:12px;font-weight:700}
.p2c-kit .mt-delta.is-good{color:#34d399}.p2c-kit .mt-delta.is-bad{color:#fb7185}
.p2c-kit .mt-chart{position:relative;touch-action:pan-y}
.p2c-kit .mt-svg{display:block;width:100%;height:auto;overflow:visible}
.p2c-kit .mt-line{stroke-dasharray:1;stroke-dashoffset:0}
.p2c-kit .mt-line.is-draw{animation:mt-draw .8s ease-out}
@keyframes mt-draw{from{stroke-dashoffset:1}to{stroke-dashoffset:0}}
.p2c-kit .mt-cross,.p2c-kit .mt-dot{opacity:0;transition:opacity .15s ease}
.p2c-kit .mt-tip{position:absolute;top:-8px;padding:5px 9px;border:1px solid #2b3a57;border-radius:8px;background:#0b1020;color:#e8ecff;font-size:12px;font-weight:700;white-space:nowrap;opacity:0;pointer-events:none;transform:translate(-50%,-100%);transition:opacity .15s ease}`,
`(function () {
  var card = document.querySelector('.mt-card');
  if (!card) return;
  var svg = card.querySelector('.mt-svg');
  var line = card.querySelector('.mt-line');
  var area = card.querySelector('.mt-area');
  var cross = card.querySelector('.mt-cross');
  var dot = card.querySelector('.mt-dot');
  var tip = card.querySelector('.mt-tip');
  var val = card.querySelector('.mt-val');
  var delta = card.querySelector('.mt-delta');
  var chart = card.querySelector('.mt-chart');
  var btns = [].slice.call(card.querySelectorAll('.mt-range button'));
  var W = 320, H = 110, PAD = 10;
  var RANGES = {
    '24h': { n: 24, u: 'h', seed: 7, base: 180, amp: 30 },
    '7d': { n: 7, u: 'd', seed: 21, base: 190, amp: 26 },
    '30d': { n: 30, u: 'd', seed: 42, base: 205, amp: 34 }
  };
  var pts = [], data = [], key = '24h';
  function gen(r) {
    var s = r.seed, a = [];
    for (var i = 0; i < r.n; i++) {
      s = (s * 9301 + 49297) % 233280;
      var rnd = s / 233280;
      a.push(Math.round(r.base + Math.sin(i / r.n * Math.PI * 2.4) * r.amp * 0.6 + (rnd - 0.5) * r.amp - i * 0.4));
    }
    return a;
  }
  function avg(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
  function label(i) { var r = RANGES[key]; return i === data.length - 1 ? 'now' : '−' + (data.length - 1 - i) + r.u; }
  function draw() {
    var r = RANGES[key];
    data = gen(r);
    var min = Math.min.apply(null, data), max = Math.max.apply(null, data), span = (max - min) || 1;
    pts = data.map(function (v, i) { return [PAD + i * (W - PAD * 2) / (data.length - 1), H - PAD - (v - min) / span * (H - PAD * 2)]; });
    var d = 'M' + pts[0][0].toFixed(1) + ',' + pts[0][1].toFixed(1);
    for (var i = 1; i < pts.length; i++) {
      var mx = ((pts[i - 1][0] + pts[i][0]) / 2).toFixed(1);
      d += ' C' + mx + ',' + pts[i - 1][1].toFixed(1) + ' ' + mx + ',' + pts[i][1].toFixed(1) + ' ' + pts[i][0].toFixed(1) + ',' + pts[i][1].toFixed(1);
    }
    var last = pts[pts.length - 1];
    line.setAttribute('d', d);
    area.setAttribute('d', d + ' L' + last[0].toFixed(1) + ',' + H + ' L' + pts[0][0].toFixed(1) + ',' + H + ' Z');
    line.classList.remove('is-draw'); void line.getBoundingClientRect(); line.classList.add('is-draw');
    var half = Math.floor(data.length / 2);
    var change = (avg(data.slice(half)) - avg(data.slice(0, half))) / avg(data.slice(0, half)) * 100;
    delta.textContent = (change <= 0 ? '↓ ' : '↑ ') + Math.abs(change).toFixed(1) + '% vs earlier in range';
    delta.className = 'mt-delta ' + (change <= 0 ? 'is-good' : 'is-bad');
    val.textContent = data[data.length - 1] + ' ms';
    hide();
  }
  function hide() { cross.style.opacity = 0; dot.style.opacity = 0; tip.style.opacity = 0; }
  function show(i) {
    var p = pts[i];
    cross.setAttribute('x1', p[0]); cross.setAttribute('x2', p[0]);
    dot.setAttribute('cx', p[0]); dot.setAttribute('cy', p[1]);
    cross.style.opacity = 1; dot.style.opacity = 1;
    tip.textContent = label(i) + ' · ' + data[i] + ' ms';
    tip.style.left = Math.max(16, Math.min(84, p[0] / W * 100)) + '%';
    tip.style.opacity = 1;
  }
  chart.addEventListener('pointermove', function (e) {
    var r = svg.getBoundingClientRect();
    var x = (e.clientX - r.left) / r.width * W, best = 0, bd = 1e9;
    pts.forEach(function (p, i) { var dd = Math.abs(p[0] - x); if (dd < bd) { bd = dd; best = i; } });
    show(best);
  });
  chart.addEventListener('pointerleave', hide);
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      key = b.getAttribute('data-r');
      btns.forEach(function (o) { o.setAttribute('aria-pressed', o === b ? 'true' : 'false'); });
      draw();
    });
  });
  draw();
})();`,
'Pro',['card','metric','chart','sparkline','analytics','developer']),

// ───────────────────────────── PLAYFUL & ADVANCED ─────────────────────────────

// 23 ─ HOLD TO DELETE: press-and-hold with filling progress and rising shake
item('fun-hold','Hold-to-confirm danger button','Playful & advanced','Press and hold for 1.2 seconds to confirm: the button fills, shakes harder as it charges and cancels smoothly on release. Works with Space / Enter.',
`<div class="p2c-stage p2c-kit"><div class="hd-wrap"><button class="hd-btn" type="button" aria-describedby="hd-msg"><span class="hd-fill" aria-hidden="true"></span><span class="hd-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="hd-label">Hold to delete project</span></button><p class="p2c-note hd-msg" id="hd-msg" role="status">Press and hold · or hold Space / Enter</p></div></div>`,
`.p2c-kit .hd-wrap{display:grid;justify-items:center}
.p2c-kit .hd-btn{--p:0;position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:12px;padding:17px 28px;border:1px solid rgba(244,63,94,.5);border-radius:16px;overflow:hidden;background:#1a1226;color:#ffe4e6;font-size:15px;font-weight:800;user-select:none;-webkit-user-select:none;touch-action:none;-webkit-touch-callout:none;will-change:transform}
.p2c-kit .hd-fill{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#be123c,#f43f5e);transform-origin:0 50%;transform:scaleX(var(--p))}
.p2c-kit .hd-ico{display:grid;place-items:center}
.p2c-kit .hd-btn:focus-visible{outline:2px solid #fda4af;outline-offset:4px}
.p2c-kit .hd-btn.is-done{border-color:#10b981}
.p2c-kit .hd-btn.is-done .hd-fill{background:linear-gradient(90deg,#059669,#10b981)}`,
`(function () {
  var btn = document.querySelector('.hd-btn');
  if (!btn) return;
  var icon = btn.querySelector('.hd-ico');
  var label = btn.querySelector('.hd-label');
  var msg = document.querySelector('.hd-msg');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HINT = 'Press and hold · or hold Space / Enter';
  var DUR = 1200, p = 0, t0 = 0, raf = 0, holding = false, done = false;
  function paint() {
    btn.style.setProperty('--p', p.toFixed(3));
    if (reduce) return;
    var t = Date.now();
    btn.style.transform = 'scale(' + (1 - p * 0.035).toFixed(3) + ')';
    icon.style.transform = 'translateX(' + (Math.sin(t / 28) * p * 2.6).toFixed(2) + 'px) rotate(' + (Math.sin(t / 34) * p * 9).toFixed(1) + 'deg)';
  }
  function tick() {
    if (holding) {
      p = Math.min(1, (Date.now() - t0) / DUR);
      paint();
      if (p >= 1) { finish(); return; }
    } else {
      p *= 0.82;
      if (p < 0.01) { p = 0; paint(); icon.style.transform = ''; btn.style.transform = ''; raf = 0; return; }
      paint();
    }
    raf = requestAnimationFrame(tick);
  }
  function begin() {
    if (done || holding) return;
    holding = true; t0 = Date.now() - p * DUR;
    label.textContent = 'Keep holding…';
    cancelAnimationFrame(raf); raf = requestAnimationFrame(tick);
  }
  function end() {
    if (!holding) return;
    holding = false;
    if (!done) label.textContent = 'Hold to delete project';
  }
  function finish() {
    holding = false; done = true; p = 1; paint();
    icon.style.transform = ''; btn.style.transform = '';
    btn.classList.add('is-done');
    label.textContent = 'Project deleted';
    msg.textContent = '✓ acme-landing was permanently deleted';
    setTimeout(reset, 2300);
  }
  function reset() {
    done = false; p = 0; paint(); btn.style.transform = '';
    btn.classList.remove('is-done');
    label.textContent = 'Hold to delete project';
    msg.textContent = HINT;
  }
  btn.addEventListener('pointerdown', function (e) {
    if (e.button !== 0) return;
    try { btn.setPointerCapture(e.pointerId); } catch (err) {}
    begin();
  });
  btn.addEventListener('pointerup', end);
  btn.addEventListener('pointercancel', end);
  btn.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  btn.addEventListener('keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); begin(); } });
  btn.addEventListener('keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') end(); });
  btn.addEventListener('blur', end);
})();`,
'Pro',['playful','hold','confirm','danger','premium','a11y']),

// 24 ─ PRICING CARD: rotating conic border + animated number tween on billing switch
item('fun-pricing','Animated-border pricing card','Playful & advanced','Pricing card with a rotating conic-gradient border, blurred glow and a number that tweens between monthly and yearly billing.',
`<div class="p2c-stage p2c-kit"><div class="pc-card"><span class="pc-glow" aria-hidden="true"></span><span class="pc-badge">Most popular</span><h4 class="pc-name">Pro</h4><p class="pc-price"><span class="pc-cur">$</span><span class="pc-num" aria-live="polite">29</span><span class="pc-per">/mo</span></p><div class="pc-bill"><span>Monthly</span><button class="pc-switch" type="button" role="switch" aria-checked="false" aria-label="Bill yearly"><span class="pc-knob"></span></button><span>Yearly</span><em class="pc-chip">Save 17%</em></div><ul class="pc-list"><li>Unlimited projects</li><li>Preview URLs on every PR</li><li>Priority build queue</li><li>Team roles and audit log</li></ul><button class="pc-cta" type="button">Start free trial</button></div></div>`,
`@property --pc-ang{syntax:'<angle>';inherits:false;initial-value:0deg}
.p2c-kit .pc-card{position:relative;isolation:isolate;width:min(100%,310px);padding:26px;border-radius:22px;background:#0b1124}
.p2c-kit .pc-card::before{content:"";position:absolute;inset:-1.5px;z-index:-2;border-radius:inherit;background:conic-gradient(from var(--pc-ang),#22d3ee,#6366f1,#ec4899,#22d3ee);animation:pc-spin 5s linear infinite}
.p2c-kit .pc-card::after{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;background:linear-gradient(180deg,#10183a,#0a1022)}
@keyframes pc-spin{to{--pc-ang:360deg}}
.p2c-kit .pc-glow{position:absolute;inset:6px;z-index:-3;border-radius:inherit;background:conic-gradient(from var(--pc-ang),#22d3ee,#6366f1,#ec4899,#22d3ee);filter:blur(26px);opacity:.38;animation:pc-spin 5s linear infinite}
.p2c-kit .pc-badge{display:inline-block;padding:4px 10px;border-radius:999px;background:rgba(99,102,241,.22);color:#c7d2fe;font-size:11px;font-weight:800;letter-spacing:.04em;text-transform:uppercase}
.p2c-kit .pc-name{margin:12px 0 4px;color:#fff;font-size:20px;font-weight:800}
.p2c-kit .pc-price{display:flex;align-items:baseline;gap:3px;margin:0;color:#fff}
.p2c-kit .pc-cur{font-size:20px;font-weight:700;color:#9fb0d6}
.p2c-kit .pc-num{min-width:2ch;font-size:44px;font-weight:800;letter-spacing:-.03em;font-variant-numeric:tabular-nums}
.p2c-kit .pc-per{color:#8ea0c4;font-size:13px;font-weight:600}
.p2c-kit .pc-bill{display:flex;align-items:center;gap:10px;margin:16px 0 18px;color:#9fb0d6;font-size:13px;font-weight:600}
.p2c-kit .pc-switch{position:relative;width:42px;height:24px;padding:0;border:0;border-radius:999px;background:#26335a;transition:background .3s ease}
.p2c-kit .pc-knob{position:absolute;top:3px;left:3px;width:18px;height:18px;border-radius:50%;background:#fff;box-shadow:0 3px 8px rgba(0,0,0,.4);transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .pc-switch[aria-checked="true"]{background:linear-gradient(135deg,#6366f1,#22d3ee)}
.p2c-kit .pc-switch[aria-checked="true"] .pc-knob{transform:translateX(18px)}
.p2c-kit .pc-switch:focus-visible,.p2c-kit .pc-cta:focus-visible{outline:2px solid #a5b4fc;outline-offset:3px}
.p2c-kit .pc-chip{padding:2px 8px;border-radius:999px;background:rgba(16,185,129,.18);color:#34d399;font-size:11px;font-style:normal;font-weight:800;opacity:0;transform:scale(.8);transition:opacity .3s ease,transform .35s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .pc-chip.is-on{opacity:1;transform:none}
.p2c-kit .pc-list{display:grid;gap:9px;margin:0 0 22px;padding:0;list-style:none;color:#cbd5f5;font-size:13px}
.p2c-kit .pc-list li{display:flex;gap:10px;align-items:center}
.p2c-kit .pc-list li::before{content:"✓";display:grid;place-items:center;width:18px;height:18px;border-radius:50%;background:rgba(99,102,241,.25);color:#a5b4fc;font-size:11px;font-weight:900}
.p2c-kit .pc-cta{width:100%;padding:14px;border:0;border-radius:14px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:15px;font-weight:800;box-shadow:0 16px 32px -14px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.35);transition:filter .2s ease,transform .15s ease}
.p2c-kit .pc-cta:hover{filter:brightness(1.12)}
.p2c-kit .pc-cta:active{transform:scale(.97)}`,
`(function () {
  var card = document.querySelector('.pc-card');
  if (!card) return;
  var sw = card.querySelector('.pc-switch');
  var num = card.querySelector('.pc-num');
  var per = card.querySelector('.pc-per');
  var chip = card.querySelector('.pc-chip');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var cur = 29, raf = 0;
  function tween(to) {
    cancelAnimationFrame(raf);
    if (reduce) { cur = to; num.textContent = String(to); return; }
    var from = cur, t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / 450);
      var e = 1 - Math.pow(1 - k, 3);
      cur = from + (to - from) * e;
      num.textContent = String(Math.round(cur));
      if (k < 1) raf = requestAnimationFrame(step);
    })(t0);
  }
  sw.addEventListener('click', function () {
    var yearly = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', yearly ? 'true' : 'false');
    chip.classList.toggle('is-on', yearly);
    per.textContent = yearly ? '/mo · billed yearly' : '/mo';
    tween(yearly ? 24 : 29);
  });
})();`,
'Pro',['playful','pricing','conic','border','tween','premium']),

// 25 ─ SHIP IT: confetti burst on click, deploy counter
item('fun-ship','Ship-it confetti button','Playful & advanced','Primary button that fires a physics-eased confetti burst from its centre, flips to a shipped state and counts deploys. Respects reduced motion.',
`<div class="p2c-stage p2c-kit"><div class="sh-wrap"><button class="sh-btn" type="button"><svg class="sh-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="sh-label">Ship it</span></button><p class="p2c-note sh-msg" role="status">Deploys today: <b class="sh-count">0</b></p></div></div>`,
`.p2c-kit .sh-wrap{position:relative;display:grid;justify-items:center}
.p2c-kit .sh-btn{position:relative;display:inline-flex;align-items:center;gap:12px;padding:17px 32px;border:0;border-radius:16px;color:#fff;font-size:16px;font-weight:800;background:linear-gradient(135deg,#059669,#10b981 55%,#22d3ee);box-shadow:0 20px 40px -16px rgba(16,185,129,.9),inset 0 1px 0 rgba(255,255,255,.45),inset 0 -2px 0 rgba(0,0,0,.15);transition:transform .2s ease,box-shadow .3s ease,filter .2s ease}
.p2c-kit .sh-btn:hover{transform:translateY(-2px);box-shadow:0 26px 48px -16px rgba(16,185,129,.95),inset 0 1px 0 rgba(255,255,255,.5),inset 0 -2px 0 rgba(0,0,0,.15)}
.p2c-kit .sh-btn:active{transform:scale(.96)}
.p2c-kit .sh-btn:focus-visible{outline:2px solid #a7f3d0;outline-offset:4px}
.p2c-kit .sh-ico{transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .sh-btn:hover .sh-ico{transform:translateY(-3px)}
.p2c-kit .sh-btn.is-ok .sh-ico{transform:translateY(-3px) scale(1.15)}
.p2c-kit .sh-btn.is-ok{background:linear-gradient(135deg,#6366f1,#8b5cf6 55%,#ec4899);box-shadow:0 20px 40px -16px rgba(139,92,246,.95),inset 0 1px 0 rgba(255,255,255,.45)}
.p2c-kit .sh-count{color:#e8ecff;font-variant-numeric:tabular-nums}
.p2c-kit .sh-bit{position:absolute;left:50%;top:50%;z-index:5;pointer-events:none}`,
`(function () {
  var wrap = document.querySelector('.sh-wrap');
  if (!wrap) return;
  var btn = wrap.querySelector('.sh-btn');
  var label = wrap.querySelector('.sh-label');
  var count = wrap.querySelector('.sh-count');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#22d3ee', '#6366f1', '#ec4899', '#fbbf24', '#34d399', '#f472b6'];
  var n = 0, timer = 0;
  function burst() {
    if (reduce || !btn.animate) return;
    var cx = btn.offsetLeft + btn.offsetWidth / 2;
    var cy = btn.offsetTop + btn.offsetHeight / 2;
    for (var i = 0; i < 30; i++) {
      var p = document.createElement('span');
      var w = 5 + Math.random() * 5, h = 7 + Math.random() * 8;
      p.className = 'sh-bit';
      p.style.width = w + 'px'; p.style.height = h + 'px';
      p.style.left = cx + 'px'; p.style.top = cy + 'px';
      p.style.background = COLORS[i % COLORS.length];
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      wrap.appendChild(p);
      var a = Math.random() * Math.PI * 2;
      var dist = 70 + Math.random() * 90;
      var dx = Math.cos(a) * dist, dy = Math.sin(a) * dist - 30;
      var rot = (Math.random() - 0.5) * 720;
      var anim = p.animate([
        { transform: 'translate(-50%,-50%) translate(0,0) rotate(0deg)', opacity: 1 },
        { transform: 'translate(-50%,-50%) translate(' + dx.toFixed(1) + 'px,' + (dy + 50).toFixed(1) + 'px) rotate(' + rot.toFixed(0) + 'deg)', opacity: 0 }
      ], { duration: 700 + Math.random() * 500, easing: 'cubic-bezier(.12,.8,.3,1)' });
      anim.onfinish = (function (el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; })(p);
    }
  }
  btn.addEventListener('click', function () {
    n++; count.textContent = String(n);
    btn.classList.add('is-ok'); label.textContent = 'Shipped';
    burst();
    clearTimeout(timer);
    timer = setTimeout(function () { btn.classList.remove('is-ok'); label.textContent = 'Ship it'; }, 1800);
  });
})();`,
'Pro',['playful','confetti','button','celebration','developer']),
// ═════════════════════════════════════════════════════════════════════════════
//  PREMIUM BUTTON COLLECTION · PACK 2  ·  22 more buttons (category: 'Buttons')
//
//  HOW TO APPLY in src/lib/anim/uiKit.ts
//   Paste this whole block directly AFTER the last existing Buttons item
//   (the "Magnifying dock" item that ends with
//        'Pro',['buttons','dock','magnify','premium','glass']),  )
//   Nothing else in the file / project needs to change.
//   Every item uses its own unique class prefix, so nothing collides with
//   the first 12 buttons or with the other component categories.
// ═════════════════════════════════════════════════════════════════════════════

// 13 ─ NEON ORBIT: a comet of light circles the border (registered conic angle), pure CSS
item('btn-neon','Neon orbit border','Buttons','Dark button with a comet of light orbiting the border, a neon glow that intensifies on hover and a live status LED. Pure CSS.',
`<div class="p2c-stage p2c-kit"><button class="nn-btn" type="button"><span class="nn-led" aria-hidden="true"></span><span>Launch console</span></button></div>`,
`@property --nn-a{syntax:'<angle>';inherits:false;initial-value:0deg}
.p2c-kit .nn-btn{position:relative;isolation:isolate;display:inline-flex;align-items:center;gap:12px;padding:18px 32px;border:0;border-radius:16px;background:transparent;color:#e8fbff;font-size:14px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;filter:drop-shadow(0 0 8px rgba(34,211,238,.35));transition:transform .25s ease,filter .35s ease}
.p2c-kit .nn-btn::before{content:"";position:absolute;inset:0;z-index:-1;border-radius:inherit;background:#070b18}
.p2c-kit .nn-btn::after{content:"";position:absolute;inset:-2px;z-index:-2;border-radius:18px;background:conic-gradient(from var(--nn-a),rgba(255,255,255,.08) 0 52%,#22d3ee 72%,#a78bfa 88%,rgba(255,255,255,.08));animation:nn-spin 2.8s linear infinite}
@keyframes nn-spin{to{--nn-a:360deg}}
.p2c-kit .nn-led{width:9px;height:9px;border-radius:50%;background:#34d399;box-shadow:0 0 0 0 rgba(52,211,153,.7);animation:nn-ping 1.8s ease-out infinite}
@keyframes nn-ping{to{box-shadow:0 0 0 9px rgba(52,211,153,0)}}
.p2c-kit .nn-btn:hover{transform:translateY(-2px);filter:drop-shadow(0 0 18px rgba(34,211,238,.7))}
.p2c-kit .nn-btn:active{transform:scale(.97)}
.p2c-kit .nn-btn:focus-visible{outline:2px solid #67e8f9;outline-offset:5px}`,
undefined,
'Pro',['buttons','neon','border','glow','premium','css']),

// 14 ─ GLASS: frosted glass over drifting colour orbs, highlight tracks the cursor
item('btn-glass','Frosted glass button','Buttons','Frosted glass button over drifting colour orbs. The specular highlight follows the pointer and the orbs slide apart on hover.',
`<div class="p2c-stage p2c-kit"><div class="gl-scene"><span class="gl-orb gl-o1" aria-hidden="true"></span><span class="gl-orb gl-o2" aria-hidden="true"></span><button class="gl-btn" type="button"><span class="gl-shine" aria-hidden="true"></span><span class="gl-label">Get early access</span></button></div></div>`,
`.p2c-kit .gl-scene{position:relative;padding:30px 52px}
.p2c-kit .gl-orb{position:absolute;border-radius:50%;transition:transform .9s cubic-bezier(.34,1.2,.64,1)}
.p2c-kit .gl-o1{left:10px;top:0;width:78px;height:78px;background:linear-gradient(135deg,#f472b6,#fb923c)}
.p2c-kit .gl-o2{right:8px;bottom:-6px;width:60px;height:60px;background:linear-gradient(135deg,#22d3ee,#6366f1)}
.p2c-kit .gl-scene:hover .gl-o1{transform:translate(30px,18px)}
.p2c-kit .gl-scene:hover .gl-o2{transform:translate(-30px,-14px)}
.p2c-kit .gl-btn{--mx:50%;--my:50%;position:relative;overflow:hidden;display:inline-flex;align-items:center;padding:17px 32px;border:1px solid rgba(255,255,255,.32);border-radius:18px;background:rgba(255,255,255,.12);-webkit-backdrop-filter:blur(16px) saturate(1.5);backdrop-filter:blur(16px) saturate(1.5);color:#fff;font-size:15px;font-weight:800;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(255,255,255,.1),0 22px 40px -18px rgba(0,0,0,.75);transition:transform .25s ease,background .3s ease}
.p2c-kit .gl-shine{position:absolute;inset:0;background:radial-gradient(140px circle at var(--mx) var(--my),rgba(255,255,255,.5),transparent 62%);opacity:0;transition:opacity .3s ease;pointer-events:none}
.p2c-kit .gl-label{position:relative}
.p2c-kit .gl-btn:hover{transform:translateY(-3px);background:rgba(255,255,255,.18)}
.p2c-kit .gl-btn:hover .gl-shine{opacity:1}
.p2c-kit .gl-btn:active{transform:scale(.97)}
.p2c-kit .gl-btn:focus-visible{outline:2px solid #fff;outline-offset:4px}`,
`(function () {
  var btn = document.querySelector('.gl-btn');
  if (!btn) return;
  btn.addEventListener('pointermove', function (e) {
    var r = btn.getBoundingClientRect();
    btn.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    btn.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
})();`,
'Pro',['buttons','glass','blur','frosted','pointer','premium']),

// 15 ─ SHIMMER: light sweep + moving text gradient, always alive
item('btn-shimmer','Shimmer sweep button','Buttons','Dark premium button with a continuous diagonal light sweep, shimmering gradient text and a sparkle icon. Pure CSS.',
`<div class="p2c-stage p2c-kit"><button class="sm-btn" type="button"><svg class="sm-ico" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Zm7 11 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z" fill="currentColor"/></svg><span class="sm-t">Upgrade to Pro</span></button></div>`,
`.p2c-kit .sm-btn{position:relative;isolation:isolate;overflow:hidden;display:inline-flex;align-items:center;gap:12px;padding:17px 30px;border:1px solid rgba(165,180,252,.35);border-radius:14px;background:linear-gradient(180deg,#151d3f,#0b1124);color:#c7d2fe;font-size:15px;font-weight:800;box-shadow:inset 0 1px 0 rgba(255,255,255,.18),0 18px 36px -18px rgba(99,102,241,.85);transition:transform .25s ease,border-color .3s ease,box-shadow .3s ease}
.p2c-kit .sm-btn::after{content:"";position:absolute;top:-20%;bottom:-20%;left:-70%;z-index:-1;width:45%;background:linear-gradient(100deg,transparent,rgba(255,255,255,.28),transparent);transform:skewX(-18deg);animation:sm-sweep 3.4s ease-in-out infinite}
@keyframes sm-sweep{0%{left:-70%}55%,100%{left:140%}}
.p2c-kit .sm-t{background:linear-gradient(100deg,#fff 30%,#a5b4fc 50%,#fff 70%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:sm-text 3.4s linear infinite}
@keyframes sm-text{from{background-position:120% 0}to{background-position:-120% 0}}
.p2c-kit .sm-ico{color:#a5b4fc;transition:transform .5s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .sm-btn:hover{transform:translateY(-3px);border-color:rgba(165,180,252,.7);box-shadow:inset 0 1px 0 rgba(255,255,255,.25),0 26px 46px -18px rgba(99,102,241,.95)}
.p2c-kit .sm-btn:hover .sm-ico{transform:rotate(90deg) scale(1.2)}
.p2c-kit .sm-btn:active{transform:scale(.97)}
.p2c-kit .sm-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}`,
undefined,
'Pro',['buttons','shimmer','sweep','gradient','premium','css']),

// 16 ─ COPY KEY: code-style token with a split copy action that flips to a success state
item('btn-copy','Copy API key button','Buttons','Developer token button: the key is on the left, the action half flips from Copy to Copied with a drawn state change and real clipboard support.',
`<div class="p2c-stage p2c-kit"><div class="cy-wrap"><button class="cy-btn" type="button" aria-label="Copy API key"><span class="cy-key"><span class="cy-tag">KEY</span><code>pk_live_4f9a…c21b</code></span><span class="cy-act"><span class="cy-c"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Copy</span><span class="cy-d"><svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>Copied</span></span></button><p class="p2c-note cy-msg" role="status">Click to copy the key</p></div></div>`,
`.p2c-kit .cy-wrap{display:grid;justify-items:center}
.p2c-kit .cy-btn{display:inline-flex;align-items:stretch;overflow:hidden;border:1px solid #2b3a57;border-radius:14px;background:#0b1124;color:#e8ecff;transition:border-color .3s ease,box-shadow .3s ease,transform .15s ease}
.p2c-kit .cy-btn:hover{border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.14)}
.p2c-kit .cy-btn:active{transform:scale(.98)}
.p2c-kit .cy-btn:focus-visible{outline:2px solid #818cf8;outline-offset:4px}
.p2c-kit .cy-key{display:inline-flex;align-items:center;gap:10px;padding:14px 16px}
.p2c-kit .cy-tag{padding:2px 7px;border-radius:6px;background:rgba(99,102,241,.25);color:#c7d2fe;font:800 10px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em}
.p2c-kit .cy-key code{color:#e1e8ff;font:600 13px ui-monospace,SFMono-Regular,Menlo,monospace}
.p2c-kit .cy-act{position:relative;display:grid;place-items:center;min-width:104px;padding:0 16px;border-left:1px solid #2b3a57;background:#111b3a;color:#cbd5f5;font-size:13px;font-weight:800;transition:background .3s ease,color .3s ease}
.p2c-kit .cy-act>span{grid-area:1/1;display:inline-flex;align-items:center;gap:8px;transition:opacity .25s ease,transform .35s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .cy-d{opacity:0;transform:translateY(10px)}
.p2c-kit .cy-btn.is-ok{border-color:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.16)}
.p2c-kit .cy-btn.is-ok .cy-act{background:#064e3b;color:#6ee7b7}
.p2c-kit .cy-btn.is-ok .cy-c{opacity:0;transform:translateY(-10px)}
.p2c-kit .cy-btn.is-ok .cy-d{opacity:1;transform:none}`,
`(function () {
  var btn = document.querySelector('.cy-btn');
  var msg = document.querySelector('.cy-msg');
  if (!btn) return;
  var KEY = 'pk_live_4f9a7d3e0b6c21b', timer = 0;
  function done() {
    btn.classList.add('is-ok'); msg.textContent = 'Key copied to clipboard';
    clearTimeout(timer);
    timer = setTimeout(function () { btn.classList.remove('is-ok'); msg.textContent = 'Click to copy the key'; }, 1900);
  }
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = KEY; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta); done();
  }
  btn.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(KEY).then(done, fallback);
    else fallback();
  });
})();`,
'Pro',['buttons','copy','clipboard','token','developer','a11y']),

// 17 ─ LIKE: heart pop, particle burst, live count
item('btn-like','Like button with burst','Buttons','Heart button with a spring pop, a radial particle burst and a live counter. aria-pressed toggle, keyboard friendly.',
`<div class="p2c-stage p2c-kit"><div class="lk-wrap"><button class="lk-btn" type="button" aria-pressed="false" aria-label="Like"><span class="lk-heart"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M12 20.8 4.2 13.2a5 5 0 0 1 7-7.1l.8.8.8-.8a5 5 0 0 1 7 7.1L12 20.8Z" stroke-width="2" stroke-linejoin="round"/></svg></span><span class="lk-n">128</span></button></div></div>`,
`.p2c-kit .lk-wrap{position:relative;display:grid;place-items:center}
.p2c-kit .lk-btn{position:relative;display:inline-flex;align-items:center;gap:12px;padding:14px 22px;border:1px solid #2b3a57;border-radius:999px;background:#0b1124;color:#9fb0d6;font-size:16px;font-weight:800;transition:border-color .3s ease,color .3s ease,background .3s ease,transform .15s ease}
.p2c-kit .lk-btn:hover{border-color:#f43f5e;color:#fda4af}
.p2c-kit .lk-btn:active{transform:scale(.95)}
.p2c-kit .lk-btn:focus-visible{outline:2px solid #fda4af;outline-offset:4px}
.p2c-kit .lk-heart{display:grid;place-items:center}
.p2c-kit .lk-heart svg{fill:transparent;stroke:currentColor;transition:fill .25s ease,stroke .25s ease}
.p2c-kit .lk-btn[aria-pressed="true"]{border-color:rgba(244,63,94,.6);background:rgba(244,63,94,.12);color:#fff}
.p2c-kit .lk-btn[aria-pressed="true"] .lk-heart svg{fill:#f43f5e;stroke:#f43f5e}
.p2c-kit .lk-heart.is-pop{animation:lk-pop .55s cubic-bezier(.34,1.56,.64,1)}
@keyframes lk-pop{0%{transform:scale(1)}30%{transform:scale(.7)}60%{transform:scale(1.4)}100%{transform:scale(1)}}
.p2c-kit .lk-n{min-width:3ch;font-variant-numeric:tabular-nums}
.p2c-kit .lk-bit{position:absolute;left:34px;top:50%;z-index:3;width:7px;height:7px;margin:-3px 0 0 -3px;border-radius:50%;pointer-events:none}`,
`(function () {
  var btn = document.querySelector('.lk-btn');
  if (!btn) return;
  var heart = btn.querySelector('.lk-heart');
  var num = btn.querySelector('.lk-n');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var COLORS = ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#fda4af'];
  var count = 128;
  function burst() {
    if (reduce || !btn.animate) return;
    for (var i = 0; i < 10; i++) {
      var p = document.createElement('span');
      p.className = 'lk-bit';
      p.style.background = COLORS[i % COLORS.length];
      btn.appendChild(p);
      var a = (Math.PI * 2 * i) / 10 + Math.random() * 0.4;
      var d = 30 + Math.random() * 18;
      var anim = p.animate([
        { transform: 'translate(0,0) scale(1)', opacity: 1 },
        { transform: 'translate(' + (Math.cos(a) * d).toFixed(1) + 'px,' + (Math.sin(a) * d).toFixed(1) + 'px) scale(0)', opacity: 0 }
      ], { duration: 520 + Math.random() * 200, easing: 'cubic-bezier(.15,.8,.3,1)' });
      anim.onfinish = (function (el) { return function () { if (el.parentNode) el.parentNode.removeChild(el); }; })(p);
    }
  }
  btn.addEventListener('click', function () {
    var on = btn.getAttribute('aria-pressed') !== 'true';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    count += on ? 1 : -1;
    num.textContent = String(count);
    if (on) {
      heart.classList.remove('is-pop'); void heart.offsetWidth; heart.classList.add('is-pop');
      burst();
    }
  });
})();`,
'Pro',['buttons','like','heart','burst','social','premium']),

// 18 ─ DOWNLOAD: pill fills with live percentage then completes
item('btn-download','Download progress button','Buttons','Download button that fills like a progress bar with a live percentage, a bouncing arrow while busy and a check on completion.',
`<div class="p2c-stage p2c-kit"><div class="dw-wrap"><button class="dw-btn" type="button" data-state="idle"><span class="dw-fill" aria-hidden="true"></span><span class="dw-ico" aria-hidden="true"><svg class="dw-ar" viewBox="0 0 24 24" width="16" height="16"><path d="M12 4v11M7 11l5 5 5-5M5 20h14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg><svg class="dw-ck" viewBox="0 0 24 24" width="16" height="16"><path d="m5 12.5 4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="dw-label">Download build</span><span class="dw-size">24.8 MB</span></button><p class="p2c-note dw-msg" role="status">Click to start the download</p></div></div>`,
`.p2c-kit .dw-wrap{display:grid;justify-items:center}
.p2c-kit .dw-btn{--p:0;position:relative;isolation:isolate;overflow:hidden;display:inline-flex;align-items:center;gap:12px;min-width:270px;padding:15px 20px;border:1px solid #2b3a57;border-radius:16px;background:#0b1124;color:#fff;font-size:15px;font-weight:800;text-align:left;transition:border-color .3s ease,transform .15s ease}
.p2c-kit .dw-btn:hover{border-color:#6366f1}
.p2c-kit .dw-btn:active{transform:scale(.98)}
.p2c-kit .dw-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}
.p2c-kit .dw-fill{position:absolute;inset:0;z-index:-1;background:linear-gradient(90deg,#4f46e5,#22d3ee);transform-origin:0 50%;transform:scaleX(var(--p))}
.p2c-kit .dw-ico{display:grid;place-items:center;flex:none;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.14)}
.p2c-kit .dw-ico>svg{grid-area:1/1;transition:opacity .25s ease,transform .35s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .dw-ck{opacity:0;transform:scale(.3)}
.p2c-kit .dw-label{flex:1;font-variant-numeric:tabular-nums}
.p2c-kit .dw-size{color:#9fb0d6;font-size:12px;font-weight:700;transition:opacity .25s ease}
.p2c-kit .dw-btn[data-state="loading"]{cursor:progress}
.p2c-kit .dw-btn[data-state="loading"] .dw-ar{animation:dw-bob .7s ease-in-out infinite}
@keyframes dw-bob{50%{transform:translateY(3px)}}
.p2c-kit .dw-btn[data-state="loading"] .dw-size{opacity:0}
.p2c-kit .dw-btn[data-state="done"]{border-color:#10b981}
.p2c-kit .dw-btn[data-state="done"] .dw-fill{background:linear-gradient(90deg,#059669,#10b981)}
.p2c-kit .dw-btn[data-state="done"] .dw-ar{opacity:0;transform:scale(.3)}
.p2c-kit .dw-btn[data-state="done"] .dw-ck{opacity:1;transform:none}
.p2c-kit .dw-btn[data-state="done"] .dw-size{opacity:0}`,
`(function () {
  var btn = document.querySelector('.dw-btn');
  var msg = document.querySelector('.dw-msg');
  if (!btn) return;
  var label = btn.querySelector('.dw-label');
  var p = 0, timer = 0;
  function set(s) { btn.setAttribute('data-state', s); }
  function paint() { btn.style.setProperty('--p', (p / 100).toFixed(3)); }
  btn.addEventListener('click', function () {
    if (btn.getAttribute('data-state') !== 'idle') return;
    p = 0; paint(); set('loading'); btn.setAttribute('aria-busy', 'true');
    msg.textContent = 'Downloading…';
    timer = setInterval(function () {
      p = Math.min(100, p + 1.2 + Math.random() * 3.6);
      paint();
      label.textContent = 'Downloading ' + Math.floor(p) + '%';
      if (p >= 100) {
        clearInterval(timer);
        btn.removeAttribute('aria-busy'); set('done');
        label.textContent = 'Download complete';
        msg.textContent = 'build-2.4.0.zip saved';
        setTimeout(function () {
          set('idle'); p = 0; paint();
          label.textContent = 'Download build';
          msg.textContent = 'Click to start the download';
        }, 2200);
      }
    }, 70);
  });
})();`,
'Pro',['buttons','download','progress','percentage','developer','async']),

// 19 ─ DIRECTIONAL LINKS: underline wipes in from the side the cursor enters and out where it leaves
item('btn-link','Wipe underline link buttons','Buttons','Text buttons whose underline grows from the exact side the pointer enters and retracts toward the side it leaves. Arrow glides on hover.',
`<div class="p2c-stage p2c-kit"><div class="ln-row"><button class="ln-btn" type="button"><span>Read the changelog</span><i aria-hidden="true">→</i></button><button class="ln-btn ln-alt" type="button"><span>View on GitHub</span><i aria-hidden="true">↗</i></button></div></div>`,
`.p2c-kit .ln-row{display:grid;gap:26px;justify-items:center}
.p2c-kit .ln-btn{--o:0% 50%;position:relative;display:inline-flex;align-items:center;gap:10px;padding:6px 2px;border:0;background:none;color:#e8ecff;font-size:18px;font-weight:700;letter-spacing:.005em}
.p2c-kit .ln-btn::before,.p2c-kit .ln-btn::after{content:"";position:absolute;left:0;right:0;bottom:0;height:2px;border-radius:2px}
.p2c-kit .ln-btn::before{background:currentColor;opacity:.2}
.p2c-kit .ln-btn::after{background:linear-gradient(90deg,#818cf8,#22d3ee);transform:scaleX(0);transform-origin:var(--o);transition:transform .5s cubic-bezier(.65,0,.25,1)}
.p2c-kit .ln-alt::after{background:linear-gradient(90deg,#f472b6,#fb923c)}
.p2c-kit .ln-btn:hover::after,.p2c-kit .ln-btn:focus-visible::after{transform:scaleX(1)}
.p2c-kit .ln-btn i{font-style:normal;transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .ln-btn:hover i,.p2c-kit .ln-btn:focus-visible i{transform:translateX(5px)}
.p2c-kit .ln-alt:hover i,.p2c-kit .ln-alt:focus-visible i{transform:translate(3px,-3px)}
.p2c-kit .ln-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:6px;border-radius:4px}`,
`(function () {
  [].slice.call(document.querySelectorAll('.ln-btn')).forEach(function (btn) {
    function side(e) {
      var r = btn.getBoundingClientRect();
      return e.clientX < r.left + r.width / 2 ? '0% 50%' : '100% 50%';
    }
    btn.addEventListener('pointerenter', function (e) { btn.style.setProperty('--o', side(e)); });
    btn.addEventListener('pointerleave', function (e) { btn.style.setProperty('--o', side(e)); });
  });
})();`,
'Starter',['buttons','link','underline','directional','text','hover']),

// 20 ─ EXPAND: icon circle blooms into a labelled pill
item('btn-expand','Expanding icon pill','Buttons','Round icon button that smoothly expands into a labelled pill on hover or focus. On touch screens it stays expanded.',
`<div class="p2c-stage p2c-kit"><div class="ex-row"><button class="ex-btn" type="button"><span class="ex-txt">Get started</span><span class="ex-ico" aria-hidden="true">→</span></button><button class="ex-btn ex-alt" type="button"><span class="ex-txt">Watch demo</span><span class="ex-ico" aria-hidden="true">▶</span></button></div></div>`,
`.p2c-kit .ex-row{display:flex;flex-wrap:wrap;gap:18px;justify-content:center;align-items:center}
.p2c-kit .ex-btn{display:inline-flex;align-items:center;height:58px;padding:5px;border:0;border-radius:999px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:15px;font-weight:800;box-shadow:0 18px 36px -16px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.35);transition:box-shadow .3s ease,transform .2s ease}
.p2c-kit .ex-alt{background:linear-gradient(135deg,#0e7490,#0891b2 55%,#22d3ee);box-shadow:0 18px 36px -16px rgba(34,211,238,.8),inset 0 1px 0 rgba(255,255,255,.35)}
.p2c-kit .ex-txt{max-width:0;padding:0;overflow:hidden;opacity:0;white-space:nowrap;transition:max-width .55s cubic-bezier(.65,0,.25,1),padding .55s cubic-bezier(.65,0,.25,1),opacity .3s ease .05s}
.p2c-kit .ex-ico{display:grid;place-items:center;flex:none;width:48px;height:48px;border-radius:50%;background:#fff;color:#4f46e5;font-size:18px;transition:transform .55s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .ex-alt .ex-ico{color:#0e7490}
.p2c-kit .ex-btn:hover .ex-txt,.p2c-kit .ex-btn:focus-visible .ex-txt{max-width:150px;padding:0 10px 0 22px;opacity:1}
.p2c-kit .ex-btn:hover .ex-ico,.p2c-kit .ex-btn:focus-visible .ex-ico{transform:rotate(-45deg)}
.p2c-kit .ex-alt:hover .ex-ico,.p2c-kit .ex-alt:focus-visible .ex-ico{transform:rotate(360deg)}
.p2c-kit .ex-btn:active{transform:scale(.97)}
.p2c-kit .ex-btn:focus-visible{outline:2px solid #c7d2fe;outline-offset:4px}
@media (hover:none){.p2c-kit .ex-txt{max-width:150px;padding:0 10px 0 22px;opacity:1}}`,
undefined,
'Pro',['buttons','expand','pill','icon','hover','premium']),

// 21 ─ KEYCAP: 3D mechanical keys that depress on press
item('btn-keycap','3D mechanical keycaps','Buttons','Chunky 3D keycap buttons that physically depress on press, including Space / Enter on a focused key. Great for shortcuts and kbd hints.',
`<div class="p2c-stage p2c-kit"><div class="kc-row"><button class="kc-key" type="button" aria-label="Command"><span class="kc-base" aria-hidden="true"></span><span class="kc-top"><b>⌘</b><small>cmd</small></span></button><button class="kc-key" type="button" aria-label="K"><span class="kc-base" aria-hidden="true"></span><span class="kc-top"><b>K</b><small>search</small></span></button><button class="kc-key kc-wide" type="button" aria-label="Enter"><span class="kc-base" aria-hidden="true"></span><span class="kc-top"><b>↵</b><small>enter</small></span></button></div></div>`,
`.p2c-kit .kc-row{display:flex;flex-wrap:wrap;gap:16px;justify-content:center;align-items:flex-end}
.p2c-kit .kc-key{position:relative;width:66px;height:62px;margin-top:8px;padding:0;border:0;background:none}
.p2c-kit .kc-wide{width:130px}
.p2c-kit .kc-base{position:absolute;inset:0 0 -2px;border-radius:16px;background:linear-gradient(180deg,#59638f,#39426b);box-shadow:0 16px 24px -8px rgba(0,0,0,.85)}
.p2c-kit .kc-top{position:absolute;inset:0;display:grid;place-content:center;gap:1px;border-radius:15px;background:linear-gradient(180deg,#fbfcff,#d6ddf3);color:#141b3a;text-align:center;box-shadow:inset 0 2px 0 #fff,inset 0 -4px 0 rgba(20,27,58,.1);transform:translateY(-6px);transition:transform .09s ease-out}
.p2c-kit .kc-top b{font-size:21px;font-weight:800}
.p2c-kit .kc-top small{font-size:9px;font-weight:700;letter-spacing:.1em;opacity:.55;text-transform:uppercase}
.p2c-kit .kc-key:hover .kc-top{transform:translateY(-8px)}
.p2c-kit .kc-key:active .kc-top,.p2c-kit .kc-key.is-down .kc-top{transform:translateY(-1px)}
.p2c-kit .kc-key:focus-visible{outline:2px solid #a5b4fc;outline-offset:7px;border-radius:18px}`,
`(function () {
  [].slice.call(document.querySelectorAll('.kc-key')).forEach(function (k) {
    k.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') k.classList.add('is-down'); });
    k.addEventListener('keyup', function () { k.classList.remove('is-down'); });
    k.addEventListener('blur', function () { k.classList.remove('is-down'); });
  });
})();`,
'Pro',['buttons','keycap','3d','keyboard','shortcut','premium']),

// 22 ─ SOFT TOGGLE BUTTONS: dark neumorphism with LED
item('btn-soft','Soft neumorphic toggles','Buttons','Dark neumorphic push buttons that sink into the surface when active, with a glowing LED. Real toggle buttons with aria-pressed.',
`<div class="p2c-stage p2c-kit"><div class="sf-row"><button class="sf-btn" type="button" aria-pressed="true"><i class="sf-led" aria-hidden="true"></i>Wi-Fi</button><button class="sf-btn" type="button" aria-pressed="false"><i class="sf-led" aria-hidden="true"></i>Bluetooth</button><button class="sf-btn" type="button" aria-pressed="false"><i class="sf-led" aria-hidden="true"></i>Sync</button></div></div>`,
`.p2c-kit .sf-row{display:flex;flex-wrap:wrap;gap:20px;justify-content:center;padding:14px;border-radius:24px;background:#1b2240}
.p2c-kit .sf-btn{display:inline-flex;align-items:center;gap:12px;padding:16px 24px;border:0;border-radius:18px;background:#1b2240;color:#8e9bc7;font-size:15px;font-weight:800;box-shadow:8px 8px 18px #0d1226,-8px -8px 18px #29335c;transition:box-shadow .2s ease,color .25s ease}
.p2c-kit .sf-btn:hover{color:#c7d2fe}
.p2c-kit .sf-btn:active,.p2c-kit .sf-btn[aria-pressed="true"]{box-shadow:inset 6px 6px 12px #0d1226,inset -6px -6px 12px #29335c;color:#fff}
.p2c-kit .sf-led{width:9px;height:9px;border-radius:50%;background:#3a4570;transition:background .3s ease,box-shadow .3s ease}
.p2c-kit .sf-btn[aria-pressed="true"] .sf-led{background:#67e8f9;box-shadow:0 0 10px 2px rgba(103,232,249,.7)}
.p2c-kit .sf-btn:focus-visible{outline:2px solid #818cf8;outline-offset:4px}`,
`(function () {
  [].slice.call(document.querySelectorAll('.sf-btn')).forEach(function (b) {
    b.addEventListener('click', function () {
      b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
  });
})();`,
'Starter',['buttons','neumorphism','toggle','soft','led','a11y']),

// 23 ─ SCRAMBLE: hacker-style text decode on hover
item('btn-scramble','Text scramble decode button','Buttons','Monospace button whose label scrambles and decodes letter by letter into a new message on hover or focus, then decodes back on leave.',
`<div class="p2c-stage p2c-kit"><button class="sr-btn" type="button" data-text="Decrypt access" data-alt="Access granted"><span class="sr-t" aria-hidden="true">Decrypt access</span></button></div>`,
`.p2c-kit .sr-btn{position:relative;overflow:hidden;padding:18px 30px;border:1px solid rgba(52,211,153,.5);border-radius:12px;background:#06140f;color:#6ee7b7;font:700 14px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.08em;text-transform:uppercase;box-shadow:inset 0 0 24px rgba(16,185,129,.12);transition:background .3s ease,color .3s ease,box-shadow .3s ease,transform .15s ease}
.p2c-kit .sr-btn::before{content:"";position:absolute;left:0;right:0;top:0;height:2px;background:linear-gradient(90deg,transparent,#34d399,transparent);transform:translateY(-4px);animation:sr-scan 2.6s linear infinite}
@keyframes sr-scan{to{transform:translateY(64px)}}
.p2c-kit .sr-btn:hover,.p2c-kit .sr-btn:focus-visible{background:#0b2a1f;color:#a7f3d0;box-shadow:inset 0 0 30px rgba(16,185,129,.3),0 0 28px -6px rgba(16,185,129,.7)}
.p2c-kit .sr-btn:active{transform:scale(.97)}
.p2c-kit .sr-btn:focus-visible{outline:2px solid #6ee7b7;outline-offset:4px}
.p2c-kit .sr-t{display:inline-block;text-align:center}`,
`(function () {
  var btn = document.querySelector('.sr-btn');
  if (!btn) return;
  var el = btn.querySelector('.sr-t');
  var orig = btn.getAttribute('data-text'), alt = btn.getAttribute('data-alt');
  var CH = '!<>-_/[]{}=+*^?#%&01';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var raf = 0;
  btn.setAttribute('aria-label', orig);
  el.style.minWidth = Math.max(orig.length, alt.length) + 'ch';
  function scramble(to) {
    cancelAnimationFrame(raf);
    if (reduce) { el.textContent = to; return; }
    var f = 0;
    (function step() {
      var done = Math.floor((f - 4) / 1.5), out = '';
      for (var i = 0; i < to.length; i++) {
        var c = to.charAt(i);
        out += (c === ' ' || i < done) ? c : CH.charAt(Math.floor(Math.random() * CH.length));
      }
      el.textContent = out;
      f++;
      if (done < to.length) raf = requestAnimationFrame(step); else el.textContent = to;
    })();
  }
  btn.addEventListener('pointerenter', function () { scramble(alt); });
  btn.addEventListener('pointerleave', function () { scramble(orig); });
  btn.addEventListener('focus', function () { scramble(alt); });
  btn.addEventListener('blur', function () { scramble(orig); });
})();`,
'Pro',['buttons','scramble','text','decode','hacker','developer']),

// 24 ─ FAB SPEED DIAL: floating action button that fans out an arc of actions
item('btn-fab','Speed-dial action button','Buttons','Floating action button that fans four actions out in an arc with a staggered spring. Arrow keys, Esc and outside click supported.',
`<div class="p2c-stage p2c-kit"><div class="fb-wrap"><div class="fb-items" role="menu" aria-label="Quick actions"><button class="fb-item" type="button" role="menuitem" data-tip="New file" aria-label="New file" tabindex="-1">✎</button><button class="fb-item" type="button" role="menuitem" data-tip="Duplicate" aria-label="Duplicate" tabindex="-1">⎘</button><button class="fb-item" type="button" role="menuitem" data-tip="Share" aria-label="Share" tabindex="-1">⇪</button><button class="fb-item" type="button" role="menuitem" data-tip="Flag" aria-label="Flag" tabindex="-1">⚑</button></div><button class="fb-main" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="Open quick actions"><span aria-hidden="true">+</span></button></div><p class="p2c-note fb-out" role="status">Tap the + button</p></div>`,
`.p2c-kit .fb-wrap{position:relative;width:280px;height:170px}
.p2c-kit .fb-main{position:absolute;left:50%;bottom:0;z-index:2;display:grid;place-items:center;width:60px;height:60px;margin-left:-30px;border:0;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:30px;font-weight:300;line-height:1;box-shadow:0 18px 34px -12px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.4);transition:transform .2s ease,filter .2s ease}
.p2c-kit .fb-main span{display:block;transition:transform .45s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .fb-wrap.is-open .fb-main span{transform:rotate(135deg)}
.p2c-kit .fb-main:hover{filter:brightness(1.12)}
.p2c-kit .fb-main:active{transform:scale(.93)}
.p2c-kit .fb-main:focus-visible,.p2c-kit .fb-item:focus-visible{outline:2px solid #a5f3fc;outline-offset:3px}
.p2c-kit .fb-item{position:absolute;left:50%;bottom:6px;display:grid;place-items:center;width:48px;height:48px;margin-left:-24px;padding:0;border:1px solid rgba(165,180,252,.4);border-radius:50%;background:#141d40;color:#e8ecff;font-size:18px;opacity:0;pointer-events:none;transform:translate(0,0) scale(.3);transition:transform .5s cubic-bezier(.34,1.56,.64,1) calc(var(--i) * 45ms),opacity .25s ease calc(var(--i) * 45ms),background .2s ease}
.p2c-kit .fb-wrap.is-open .fb-item{opacity:1;pointer-events:auto;transform:translate(var(--x),var(--y)) scale(1)}
.p2c-kit .fb-item:hover{background:#26335f}
.p2c-kit .fb-item::after{content:attr(data-tip);position:absolute;bottom:calc(100% + 8px);left:50%;padding:4px 9px;border:1px solid rgba(255,255,255,.18);border-radius:8px;background:#0b1020;color:#e8ecff;font-size:11px;font-weight:700;white-space:nowrap;opacity:0;pointer-events:none;transform:translate(-50%,4px);transition:opacity .15s ease,transform .15s ease}
.p2c-kit .fb-item:hover::after,.p2c-kit .fb-item:focus-visible::after{opacity:1;transform:translate(-50%,0)}`,
`(function () {
  var wrap = document.querySelector('.fb-wrap');
  if (!wrap) return;
  var main = wrap.querySelector('.fb-main');
  var items = [].slice.call(wrap.querySelectorAll('.fb-item'));
  var out = document.querySelector('.fb-out');
  var R = 100;
  items.forEach(function (b, i) {
    var a = Math.PI * (1.1 + 0.8 * i / (items.length - 1));
    b.style.setProperty('--x', (Math.cos(a) * R).toFixed(1) + 'px');
    b.style.setProperty('--y', (Math.sin(a) * R).toFixed(1) + 'px');
    b.style.setProperty('--i', i);
  });
  function isOpen() { return wrap.classList.contains('is-open'); }
  function open() {
    wrap.classList.add('is-open');
    main.setAttribute('aria-expanded', 'true'); main.setAttribute('aria-label', 'Close quick actions');
    items.forEach(function (b) { b.tabIndex = 0; });
  }
  function close(refocus) {
    wrap.classList.remove('is-open');
    main.setAttribute('aria-expanded', 'false'); main.setAttribute('aria-label', 'Open quick actions');
    items.forEach(function (b) { b.tabIndex = -1; });
    if (refocus) main.focus();
  }
  main.addEventListener('click', function () { if (isOpen()) close(false); else open(); });
  main.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) close(false); });
  items.forEach(function (b, i) {
    b.addEventListener('click', function () { out.textContent = 'Selected: ' + b.getAttribute('data-tip'); close(true); });
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); items[(i + items.length - 1) % items.length].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
    });
  });
  document.addEventListener('click', function (e) { if (isOpen() && !wrap.contains(e.target)) close(false); });
})();`,
'Pro',['buttons','fab','speed-dial','menu','arc','a11y']),

// 25 ─ ADD TO CART: button morphs into a quantity stepper
item('btn-cart','Add-to-cart stepper','Buttons','E-commerce button that morphs into a quantity stepper after the first click, with a bump animation, a max of 9 and a live total.',
`<div class="p2c-stage p2c-kit"><div class="ct-wrap"><div class="ct-box"><button class="ct-add" type="button"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M3 4h2l2.2 11h10.6L20 7H6.2M9 20h.01M17 20h.01" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>Add to cart</span></button><div class="ct-step" role="group" aria-label="Quantity"><button class="ct-m" type="button" aria-label="Decrease quantity">−</button><span class="ct-q" aria-live="polite">1</span><button class="ct-p" type="button" aria-label="Increase quantity">+</button></div></div><p class="p2c-note ct-msg" role="status">Mechanical keyboard · $129</p></div></div>`,
`.p2c-kit .ct-wrap{display:grid;justify-items:center}
.p2c-kit .ct-box{position:relative;width:210px;height:56px}
.p2c-kit .ct-add,.p2c-kit .ct-step{position:absolute;inset:0;border-radius:16px;transition:opacity .25s ease,transform .4s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .ct-add{display:inline-flex;align-items:center;justify-content:center;gap:10px;border:0;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:15px;font-weight:800;box-shadow:0 18px 36px -16px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.4)}
.p2c-kit .ct-add:hover{filter:brightness(1.12)}
.p2c-kit .ct-add:active{transform:scale(.97)}
.p2c-kit .ct-step{display:flex;align-items:center;justify-content:space-between;padding:6px;border:1px solid #4f46e5;background:#0f1a3a;visibility:hidden;opacity:0;transform:scale(.88);transition:opacity .25s ease,transform .4s cubic-bezier(.34,1.56,.64,1),visibility 0s linear .3s}
.p2c-kit .ct-box.is-in .ct-step{visibility:visible;opacity:1;transform:none;transition:opacity .25s ease,transform .4s cubic-bezier(.34,1.56,.64,1),visibility 0s}
.p2c-kit .ct-box.is-in .ct-add{opacity:0;transform:scale(.88);pointer-events:none}
.p2c-kit .ct-m,.p2c-kit .ct-p{display:grid;place-items:center;width:42px;height:42px;border:0;border-radius:12px;background:rgba(99,102,241,.22);color:#fff;font-size:20px;font-weight:800;transition:background .2s ease,transform .15s ease,opacity .2s ease}
.p2c-kit .ct-m:hover,.p2c-kit .ct-p:hover{background:#4f46e5}
.p2c-kit .ct-m:active,.p2c-kit .ct-p:active{transform:scale(.9)}
.p2c-kit .ct-p:disabled{opacity:.35;cursor:not-allowed}
.p2c-kit .ct-q{min-width:2ch;color:#fff;font-size:18px;font-weight:800;text-align:center;font-variant-numeric:tabular-nums}
.p2c-kit .ct-q.is-bump{animation:ct-bump .35s cubic-bezier(.34,1.56,.64,1)}
@keyframes ct-bump{40%{transform:scale(1.4)}}
.p2c-kit .ct-add:focus-visible,.p2c-kit .ct-m:focus-visible,.p2c-kit .ct-p:focus-visible{outline:2px solid #a5b4fc;outline-offset:3px}`,
`(function () {
  var box = document.querySelector('.ct-box');
  var msg = document.querySelector('.ct-msg');
  if (!box) return;
  var add = box.querySelector('.ct-add');
  var minus = box.querySelector('.ct-m');
  var plus = box.querySelector('.ct-p');
  var q = box.querySelector('.ct-q');
  var PRICE = 129, MAX = 9, qty = 0;
  function paint(bump) {
    box.classList.toggle('is-in', qty > 0);
    q.textContent = String(qty || 1);
    plus.disabled = qty >= MAX;
    msg.textContent = qty ? qty + ' × Mechanical keyboard · $' + (qty * PRICE) : 'Mechanical keyboard · $129';
    if (bump) { q.classList.remove('is-bump'); void q.offsetWidth; q.classList.add('is-bump'); }
  }
  add.addEventListener('click', function () { qty = 1; paint(true); plus.focus(); });
  plus.addEventListener('click', function () { if (qty < MAX) { qty++; paint(true); } });
  minus.addEventListener('click', function () {
    qty--; paint(true);
    if (qty <= 0) { qty = 0; paint(false); add.focus(); }
  });
})();`,
'Pro',['buttons','cart','stepper','ecommerce','morph','a11y']),

// 26 ─ RADIAL REVEAL: colour blooms from the exact entry point and collapses at the exit point
item('btn-radial','Radial reveal buttons','Buttons','The fill expands as a circle from exactly where the pointer entered and collapses to the point where it leaves. Light and aurora variants.',
`<div class="p2c-stage p2c-kit"><div class="rd-row"><button class="rd-btn" type="button"><span class="rd-fill" aria-hidden="true"></span><span>Start building</span></button><button class="rd-btn rd-alt" type="button"><span class="rd-fill" aria-hidden="true"></span><span>Talk to sales</span></button></div></div>`,
`.p2c-kit .rd-row{display:flex;flex-wrap:wrap;gap:16px;justify-content:center}
.p2c-kit .rd-btn{--x:50%;--y:50%;--fill:#f5f7ff;--ink:#0b1020;position:relative;isolation:isolate;overflow:hidden;padding:17px 32px;border:1.5px solid rgba(255,255,255,.4);border-radius:999px;background:transparent;color:#fff;font-size:15px;font-weight:800;transition:color .4s ease,border-color .4s ease,transform .2s ease}
.p2c-kit .rd-alt{--fill:linear-gradient(135deg,#a5b4fc,#67e8f9);border-color:rgba(165,180,252,.55)}
.p2c-kit .rd-fill{position:absolute;inset:0;z-index:-1;background:var(--fill);clip-path:circle(0% at var(--x) var(--y));transition:clip-path .65s cubic-bezier(.65,0,.25,1)}
.p2c-kit .rd-btn.is-in{color:var(--ink);border-color:transparent}
.p2c-kit .rd-btn.is-in .rd-fill{clip-path:circle(160% at var(--x) var(--y))}
.p2c-kit .rd-btn:active{transform:scale(.97)}
.p2c-kit .rd-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}`,
`(function () {
  [].slice.call(document.querySelectorAll('.rd-btn')).forEach(function (btn) {
    function at(e) {
      var r = btn.getBoundingClientRect();
      btn.style.setProperty('--x', (e.clientX - r.left) + 'px');
      btn.style.setProperty('--y', (e.clientY - r.top) + 'px');
    }
    function center() { btn.style.setProperty('--x', '50%'); btn.style.setProperty('--y', '50%'); }
    btn.addEventListener('pointerenter', function (e) { at(e); void btn.offsetWidth; btn.classList.add('is-in'); });
    btn.addEventListener('pointerleave', function (e) { at(e); btn.classList.remove('is-in'); });
    btn.addEventListener('focus', function () { if (!btn.matches(':hover')) { center(); btn.classList.add('is-in'); } });
    btn.addEventListener('blur', function () { if (!btn.matches(':hover')) btn.classList.remove('is-in'); });
  });
})();`,
'Pro',['buttons','radial','reveal','clip-path','hover','premium']),

// 27 ─ GRAIN GRADIENT: tactile grainy mesh gradient, pure CSS
item('btn-grain','Grainy gradient button','Buttons','Trendy grainy mesh-gradient button with an SVG noise overlay, inner depth shadows and a drifting gradient on hover. Pure CSS.',
`<div class="p2c-stage p2c-kit"><button class="gn-btn" type="button"><span>Join the waitlist</span></button></div>`,
`.p2c-kit .gn-btn{position:relative;isolation:isolate;overflow:hidden;padding:20px 38px;border:0;border-radius:20px;color:#fff;font-size:16px;font-weight:800;letter-spacing:.01em;background:radial-gradient(120% 170% at 8% 0%,#ffb067 0,transparent 55%),radial-gradient(120% 170% at 100% 100%,#6d28d9 0,transparent 62%),#ec4899;background-size:150% 150%;background-position:0% 0%;box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -12px 22px rgba(0,0,0,.2),0 26px 46px -18px rgba(236,72,153,.85);transition:background-position .9s ease,transform .25s ease,box-shadow .3s ease}
.p2c-kit .gn-btn::before{content:"";position:absolute;inset:0;z-index:-1;opacity:.4;mix-blend-mode:overlay;background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 .9 0'/></filter><rect width='140' height='140' filter='url(%23n)'/></svg>")}
.p2c-kit .gn-btn span{position:relative;text-shadow:0 1px 8px rgba(0,0,0,.25)}
.p2c-kit .gn-btn:hover{background-position:100% 100%;transform:translateY(-3px);box-shadow:inset 0 1px 0 rgba(255,255,255,.6),inset 0 -12px 22px rgba(0,0,0,.2),0 34px 56px -18px rgba(236,72,153,.95)}
.p2c-kit .gn-btn:active{transform:scale(.97)}
.p2c-kit .gn-btn:focus-visible{outline:2px solid #fbcfe8;outline-offset:5px}`,
undefined,
'Pro',['buttons','grain','noise','mesh','gradient','premium','css']),

// 28 ─ REACTIONS: hover or long-press reveals an emoji row that magnifies
item('btn-react','Reaction picker button','Buttons','Like button that reveals a row of reactions on hover, long-press or ArrowUp. Emojis magnify under the cursor and the choice replaces the button state.',
`<div class="p2c-stage p2c-kit"><div class="re-wrap"><div class="re-pop" role="menu" aria-label="Choose a reaction"><button class="re-opt" type="button" role="menuitem" data-e="👍" aria-label="Like" tabindex="-1">👍</button><button class="re-opt" type="button" role="menuitem" data-e="❤️" aria-label="Love" tabindex="-1">❤️</button><button class="re-opt" type="button" role="menuitem" data-e="🔥" aria-label="Fire" tabindex="-1">🔥</button><button class="re-opt" type="button" role="menuitem" data-e="🎉" aria-label="Celebrate" tabindex="-1">🎉</button><button class="re-opt" type="button" role="menuitem" data-e="👀" aria-label="Eyes" tabindex="-1">👀</button></div><button class="re-main" type="button" aria-haspopup="menu" aria-expanded="false"><span class="re-e">👍</span><span class="re-l">React</span><span class="re-n">24</span></button><p class="p2c-note re-out" role="status">Hover, long-press or press ArrowUp</p></div></div>`,
`.p2c-kit .re-wrap{position:relative;display:grid;justify-items:center;padding-top:64px}
.p2c-kit .re-main{display:inline-flex;align-items:center;gap:10px;padding:13px 20px;border:1px solid #2b3a57;border-radius:999px;background:#0b1124;color:#cbd5f5;font-size:15px;font-weight:800;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;transition:border-color .25s ease,background .25s ease,color .25s ease,transform .15s ease}
.p2c-kit .re-main:hover{border-color:#6366f1}
.p2c-kit .re-main:active{transform:scale(.96)}
.p2c-kit .re-main.is-on{border-color:#818cf8;background:rgba(99,102,241,.2);color:#fff}
.p2c-kit .re-e{font-size:18px;line-height:1;transition:transform .35s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .re-main.is-on .re-e{transform:scale(1.15)}
.p2c-kit .re-n{padding:1px 8px;border-radius:999px;background:rgba(255,255,255,.1);font-size:12px;font-variant-numeric:tabular-nums}
.p2c-kit .re-main:focus-visible,.p2c-kit .re-opt:focus-visible{outline:2px solid #a5b4fc;outline-offset:3px}
.p2c-kit .re-pop{position:absolute;top:2px;left:50%;z-index:4;display:flex;gap:4px;padding:6px 8px;border:1px solid #2b3a57;border-radius:999px;background:#0e1633;box-shadow:0 20px 40px -14px rgba(0,0,0,.9);opacity:0;visibility:hidden;transform:translate(-50%,10px) scale(.9);transform-origin:50% 100%;transition:opacity .2s ease,transform .35s cubic-bezier(.34,1.56,.64,1),visibility 0s linear .2s}
.p2c-kit .re-pop.is-open{opacity:1;visibility:visible;transform:translate(-50%,0) scale(1);transition:opacity .2s ease,transform .35s cubic-bezier(.34,1.56,.64,1),visibility 0s}
.p2c-kit .re-opt{display:grid;place-items:center;width:40px;height:40px;padding:0;border:0;border-radius:50%;background:transparent;font-size:24px;line-height:1;transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .re-opt:hover,.p2c-kit .re-opt:focus-visible{transform:translateY(-8px) scale(1.4)}
.p2c-kit .re-opt:active{transform:translateY(-4px) scale(1.15)}`,
`(function () {
  var wrap = document.querySelector('.re-wrap');
  if (!wrap) return;
  var main = wrap.querySelector('.re-main');
  var pop = wrap.querySelector('.re-pop');
  var opts = [].slice.call(pop.querySelectorAll('.re-opt'));
  var out = wrap.querySelector('.re-out');
  var eEl = main.querySelector('.re-e'), lEl = main.querySelector('.re-l'), nEl = main.querySelector('.re-n');
  var count = 24, mine = null, openT = 0, closeT = 0, pressT = 0, suppress = false;
  function paint() {
    eEl.textContent = mine || '👍';
    lEl.textContent = mine ? 'Reacted' : 'React';
    nEl.textContent = String(count);
    main.classList.toggle('is-on', !!mine);
  }
  function open() {
    clearTimeout(closeT);
    pop.classList.add('is-open'); main.setAttribute('aria-expanded', 'true');
    opts.forEach(function (o) { o.tabIndex = 0; });
  }
  function close() {
    pop.classList.remove('is-open'); main.setAttribute('aria-expanded', 'false');
    opts.forEach(function (o) { o.tabIndex = -1; });
  }
  function choose(e) {
    if (!mine) count++;
    mine = e; paint(); close();
    out.textContent = 'You reacted ' + e;
  }
  wrap.addEventListener('pointerenter', function (e) {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(closeT); clearTimeout(openT);
    openT = setTimeout(open, 160);
  });
  wrap.addEventListener('pointerleave', function (e) {
    if (e.pointerType !== 'mouse') return;
    clearTimeout(openT); clearTimeout(closeT);
    closeT = setTimeout(close, 320);
  });
  main.addEventListener('click', function () {
    if (suppress) { suppress = false; return; }
    if (mine) { mine = null; count--; out.textContent = 'Reaction removed'; }
    else { mine = '👍'; count++; out.textContent = 'You reacted 👍'; }
    paint(); close();
  });
  main.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    clearTimeout(pressT);
    pressT = setTimeout(function () { suppress = true; open(); }, 450);
  });
  ['pointerup', 'pointercancel', 'pointerleave'].forEach(function (n) { main.addEventListener(n, function () { clearTimeout(pressT); }); });
  main.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  main.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') { e.preventDefault(); open(); opts[0].focus(); }
    else if (e.key === 'Escape') close();
  });
  opts.forEach(function (o, i) {
    o.addEventListener('click', function () { choose(o.getAttribute('data-e')); main.focus(); });
    o.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); opts[(i + 1) % opts.length].focus(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); opts[(i + opts.length - 1) % opts.length].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); close(); main.focus(); }
    });
  });
  document.addEventListener('click', function (e) { if (!wrap.contains(e.target)) close(); });
  paint();
})();`,
'Pro',['buttons','reactions','emoji','picker','social','a11y']),

// 29 ─ THEME SWITCH: day / night toggle with sun, moon, stars and clouds
item('btn-theme','Sun and moon theme switch','Buttons','Illustrated dark-mode switch: a glowing sun slides into a cratered moon while the sky fades to a night of twinkling stars. role=switch.',
`<div class="p2c-stage p2c-kit"><div class="th-wrap"><button class="th-sw" type="button" role="switch" aria-checked="false" aria-label="Dark mode"><span class="th-night" aria-hidden="true"><i class="th-star s1"></i><i class="th-star s2"></i><i class="th-star s3"></i><i class="th-star s4"></i></span><span class="th-day" aria-hidden="true"><i class="th-cloud c1"></i><i class="th-cloud c2"></i></span><span class="th-knob" aria-hidden="true"><span class="th-moon"><i></i><i></i><i></i></span></span></button><p class="p2c-note th-out" role="status">Light mode</p></div></div>`,
`.p2c-kit .th-wrap{display:grid;justify-items:center}
.p2c-kit .th-sw{position:relative;width:104px;height:50px;padding:0;overflow:hidden;border:0;border-radius:999px;background:linear-gradient(135deg,#1e1b4b,#0b1020);box-shadow:inset 0 3px 8px rgba(0,0,0,.45),0 14px 30px -14px rgba(0,0,0,.8)}
.p2c-kit .th-sw:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}
.p2c-kit .th-day{position:absolute;inset:0;border-radius:inherit;background:linear-gradient(135deg,#38bdf8,#bae6fd);transition:opacity .55s ease}
.p2c-kit .th-sw[aria-checked="true"] .th-day{opacity:0}
.p2c-kit .th-cloud{position:absolute;height:12px;border-radius:99px;background:#fff;opacity:.9;transition:transform .55s cubic-bezier(.34,1.2,.64,1)}
.p2c-kit .th-cloud.c1{left:46px;top:28px;width:34px}
.p2c-kit .th-cloud.c2{left:62px;top:12px;width:26px;opacity:.75}
.p2c-kit .th-sw[aria-checked="true"] .th-cloud{transform:translateY(40px)}
.p2c-kit .th-night{position:absolute;inset:0}
.p2c-kit .th-star{position:absolute;width:3px;height:3px;border-radius:50%;background:#fff;opacity:0;transform:scale(.3);transition:opacity .5s ease .15s,transform .5s ease .15s}
.p2c-kit .th-star.s1{left:20px;top:12px}.p2c-kit .th-star.s2{left:36px;top:30px;width:2px;height:2px}.p2c-kit .th-star.s3{left:50px;top:14px}.p2c-kit .th-star.s4{left:62px;top:34px;width:2px;height:2px}
.p2c-kit .th-sw[aria-checked="true"] .th-star{opacity:1;transform:none;animation:th-tw 2.4s ease-in-out infinite}
.p2c-kit .th-star.s2{animation-delay:.6s!important}.p2c-kit .th-star.s3{animation-delay:1.2s!important}
@keyframes th-tw{50%{opacity:.35}}
.p2c-kit .th-knob{position:absolute;top:5px;left:5px;width:40px;height:40px;border-radius:50%;background:radial-gradient(circle at 35% 35%,#fef08a,#f59e0b);box-shadow:0 0 0 7px rgba(253,224,71,.22),0 0 24px rgba(253,224,71,.8);transition:transform .6s cubic-bezier(.34,1.35,.64,1),box-shadow .5s ease}
.p2c-kit .th-sw[aria-checked="true"] .th-knob{transform:translateX(54px);box-shadow:0 0 0 0 rgba(255,255,255,0),0 0 14px rgba(226,232,240,.35)}
.p2c-kit .th-moon{position:absolute;inset:0;border-radius:50%;background:#e5e7eb;opacity:0;transition:opacity .45s ease}
.p2c-kit .th-sw[aria-checked="true"] .th-moon{opacity:1}
.p2c-kit .th-moon i{position:absolute;border-radius:50%;background:#cbd5e1}
.p2c-kit .th-moon i:nth-child(1){left:9px;top:10px;width:10px;height:10px}
.p2c-kit .th-moon i:nth-child(2){left:22px;top:21px;width:8px;height:8px}
.p2c-kit .th-moon i:nth-child(3){left:12px;top:26px;width:5px;height:5px}`,
`(function () {
  var sw = document.querySelector('.th-sw');
  var out = document.querySelector('.th-out');
  if (!sw) return;
  sw.addEventListener('click', function () {
    var on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
    out.textContent = on ? 'Dark mode' : 'Light mode';
  });
})();`,
'Pro',['buttons','theme','dark-mode','switch','sun','moon','a11y']),

// 30 ─ PLAY / PAUSE: shape-morphing icon with a progress ring
item('btn-play','Play / pause progress ring','Buttons','Circular media button whose triangle morphs into pause bars via clip-path, wrapped in a live progress ring with a time readout.',
`<div class="p2c-stage p2c-kit"><div class="pl-wrap"><button class="pl-btn" type="button" aria-label="Play" aria-pressed="false"><svg class="pl-ring" viewBox="0 0 72 72" aria-hidden="true"><circle class="pl-track" cx="36" cy="36" r="32"/><circle class="pl-prog" cx="36" cy="36" r="32" pathLength="1"/></svg><span class="pl-icon" aria-hidden="true"><i class="pl-l"></i><i class="pl-r"></i></span></button><p class="p2c-note pl-time" role="timer">0:00 / 0:12</p></div></div>`,
`.p2c-kit .pl-wrap{display:grid;justify-items:center;gap:2px}
.p2c-kit .pl-btn{position:relative;display:grid;place-items:center;width:76px;height:76px;padding:0;border:0;border-radius:50%;background:radial-gradient(circle at 30% 25%,#1c2756,#0b1124);box-shadow:0 20px 40px -16px rgba(99,102,241,.8),inset 0 1px 0 rgba(255,255,255,.2);transition:transform .2s ease,box-shadow .3s ease}
.p2c-kit .pl-btn:hover{box-shadow:0 26px 48px -16px rgba(99,102,241,1),inset 0 1px 0 rgba(255,255,255,.3)}
.p2c-kit .pl-btn:active{transform:scale(.94)}
.p2c-kit .pl-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:5px}
.p2c-kit .pl-ring{position:absolute;inset:2px;width:72px;height:72px;transform:rotate(-90deg)}
.p2c-kit .pl-track,.p2c-kit .pl-prog{fill:none;stroke-width:3.5}
.p2c-kit .pl-track{stroke:rgba(255,255,255,.12)}
.p2c-kit .pl-prog{stroke:#818cf8;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1}
.p2c-kit .pl-icon{display:flex;width:22px;height:22px;transform:translateX(2px);transition:transform .4s cubic-bezier(.65,0,.25,1)}
.p2c-kit .pl-btn[aria-pressed="true"] .pl-icon{transform:none}
.p2c-kit .pl-l,.p2c-kit .pl-r{display:block;width:11px;height:22px;background:#fff;transition:clip-path .45s cubic-bezier(.65,0,.25,1)}
.p2c-kit .pl-l{clip-path:polygon(0 0,100% 25%,100% 75%,0 100%)}
.p2c-kit .pl-r{clip-path:polygon(0 25%,100% 50%,100% 50%,0 75%)}
.p2c-kit .pl-btn[aria-pressed="true"] .pl-l,.p2c-kit .pl-btn[aria-pressed="true"] .pl-r{clip-path:polygon(18% 0,82% 0,82% 100%,18% 100%)}`,
`(function () {
  var btn = document.querySelector('.pl-btn');
  var time = document.querySelector('.pl-time');
  if (!btn) return;
  var prog = btn.querySelector('.pl-prog');
  var DUR = 12, el = 0, last = 0, raf = 0, on = false;
  function fmt(s) { s = Math.floor(s); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
  function paint() {
    prog.style.strokeDashoffset = String(1 - el / DUR);
    time.textContent = fmt(el) + ' / ' + fmt(DUR);
  }
  function tick() {
    var now = performance.now();
    el += (now - last) / 1000; last = now;
    if (el >= DUR) {
      el = DUR; paint(); toggle(false);
      setTimeout(function () { if (!on) { el = 0; paint(); } }, 700);
      return;
    }
    paint();
    raf = requestAnimationFrame(tick);
  }
  function toggle(v) {
    on = v;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Pause' : 'Play');
    cancelAnimationFrame(raf);
    if (on) { if (el >= DUR) el = 0; last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  btn.addEventListener('click', function () { toggle(!on); });
  paint();
})();`,
'Pro',['buttons','play','pause','media','progress','morph','a11y']),

// 31 ─ SCROLL TO TOP: ring shows scroll progress, button appears after scrolling
item('btn-top','Scroll-to-top progress button','Buttons','Back-to-top button with a ring that fills as you scroll the panel. It fades in after scrolling and smooth-scrolls back to the top.',
`<div class="p2c-stage p2c-kit"><div class="tp-box"><div class="tp-scroll" tabindex="0" aria-label="Scrollable release notes"><h4>Release notes</h4><p>Faster builds with incremental compilation across the whole monorepo.</p><p>A redesigned dashboard with live deployment logs and shareable links.</p><p>New edge runtime cuts cold starts below fifty milliseconds worldwide.</p><p>Preview environments now spin up automatically for every pull request.</p><p>Role based access control with audit logs for every team member.</p><p>Environment variables can be scoped per branch and per environment.</p><p>Improved error overlays show the exact file and line of every failure.</p><p>Bundle analysis highlights the largest dependencies at a glance.</p></div><button class="tp-btn" type="button" aria-label="Scroll to top"><svg class="tp-ring" viewBox="0 0 48 48" aria-hidden="true"><circle class="tp-track" cx="24" cy="24" r="21"/><circle class="tp-prog" cx="24" cy="24" r="21" pathLength="1"/></svg><span aria-hidden="true">↑</span></button></div></div>`,
`.p2c-kit .tp-box{position:relative;width:min(100%,370px);height:200px;overflow:hidden;border:1px solid #243252;border-radius:16px;background:#0a1022}
.p2c-kit .tp-scroll{height:100%;padding:16px 18px;overflow:auto;color:#9fb0d6;font-size:13px;line-height:1.6;scrollbar-width:thin}
.p2c-kit .tp-scroll h4{margin:0 0 10px;color:#fff;font-size:16px;font-weight:800}
.p2c-kit .tp-scroll p{margin:0 0 14px}
.p2c-kit .tp-scroll:focus-visible{outline:2px solid #818cf8;outline-offset:-2px}
.p2c-kit .tp-btn{position:absolute;right:14px;bottom:14px;display:grid;place-items:center;width:46px;height:46px;padding:0;border:0;border-radius:50%;background:#141d40;color:#fff;font-size:18px;font-weight:800;box-shadow:0 14px 28px -10px rgba(0,0,0,.9);opacity:0;visibility:hidden;transform:translateY(14px) scale(.85);transition:opacity .3s ease,transform .45s cubic-bezier(.34,1.56,.64,1),visibility 0s linear .3s,background .2s ease}
.p2c-kit .tp-btn.is-show{opacity:1;visibility:visible;transform:none;transition:opacity .3s ease,transform .45s cubic-bezier(.34,1.56,.64,1),visibility 0s,background .2s ease}
.p2c-kit .tp-btn:hover{background:#26335f}
.p2c-kit .tp-btn:active{transform:scale(.92)}
.p2c-kit .tp-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:3px}
.p2c-kit .tp-ring{position:absolute;inset:0;width:46px;height:46px;transform:rotate(-90deg)}
.p2c-kit .tp-track,.p2c-kit .tp-prog{fill:none;stroke-width:3}
.p2c-kit .tp-track{stroke:rgba(255,255,255,.12)}
.p2c-kit .tp-prog{stroke:#818cf8;stroke-linecap:round;stroke-dasharray:1;stroke-dashoffset:1}`,
`(function () {
  var box = document.querySelector('.tp-box');
  if (!box) return;
  var sc = box.querySelector('.tp-scroll');
  var btn = box.querySelector('.tp-btn');
  var prog = box.querySelector('.tp-prog');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function update() {
    var max = sc.scrollHeight - sc.clientHeight;
    var p = max > 0 ? sc.scrollTop / max : 0;
    prog.style.strokeDashoffset = String(1 - p);
    btn.classList.toggle('is-show', sc.scrollTop > 24);
  }
  sc.addEventListener('scroll', update);
  btn.addEventListener('click', function () {
    sc.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    sc.focus({ preventScroll: true });
  });
  update();
})();`,
'Pro',['buttons','scroll','top','progress','ring','a11y']),

// 32 ─ NOTIFICATION BELL: swinging bell, popping badge
item('btn-bell','Notification bell with badge','Buttons','Bell icon button that swings like a real bell when a notification arrives, with a springy count badge and a clear action.',
`<div class="p2c-stage p2c-kit"><div class="bl-wrap"><div class="bl-row"><button class="bl-btn" type="button" aria-label="Notifications, 0 unread"><svg class="bl-ico" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9ZM10 20a2 2 0 0 0 4 0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg><span class="bl-badge" hidden>0</span></button><button class="bl-clear" type="button">Mark all as read</button></div><p class="p2c-note bl-msg" role="status">Click the bell to receive a notification</p></div></div>`,
`.p2c-kit .bl-wrap{display:grid;justify-items:center;gap:6px}
.p2c-kit .bl-row{display:flex;align-items:center;gap:18px}
.p2c-kit .bl-btn{position:relative;display:grid;place-items:center;width:58px;height:58px;padding:0;border:1px solid #2b3a57;border-radius:18px;background:#0b1124;color:#cbd5f5;transition:border-color .25s ease,color .25s ease,transform .15s ease}
.p2c-kit .bl-btn:hover{border-color:#6366f1;color:#fff}
.p2c-kit .bl-btn:active{transform:scale(.94)}
.p2c-kit .bl-btn:focus-visible,.p2c-kit .bl-clear:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}
.p2c-kit .bl-ico{transform-origin:50% 10%}
.p2c-kit .bl-ico.is-ring{animation:bl-ring .9s ease-in-out}
@keyframes bl-ring{0%,100%{transform:rotate(0)}15%{transform:rotate(18deg)}30%{transform:rotate(-16deg)}45%{transform:rotate(12deg)}60%{transform:rotate(-8deg)}75%{transform:rotate(4deg)}}
.p2c-kit .bl-badge{position:absolute;top:-7px;right:-7px;display:grid;place-items:center;min-width:22px;height:22px;padding:0 6px;border:2px solid #0b1124;border-radius:999px;background:#f43f5e;color:#fff;font-size:11px;font-weight:800;font-variant-numeric:tabular-nums}
.p2c-kit .bl-badge[hidden]{display:none}
.p2c-kit .bl-badge.is-pop{animation:bl-pop .45s cubic-bezier(.34,1.56,.64,1)}
@keyframes bl-pop{0%{transform:scale(.2)}100%{transform:scale(1)}}
.p2c-kit .bl-clear{padding:9px 14px;border:0;border-radius:10px;background:transparent;color:#9fb0d6;font-size:13px;font-weight:700;transition:background .2s ease,color .2s ease}
.p2c-kit .bl-clear:hover{background:rgba(255,255,255,.07);color:#fff}`,
`(function () {
  var btn = document.querySelector('.bl-btn');
  if (!btn) return;
  var ico = btn.querySelector('.bl-ico');
  var badge = btn.querySelector('.bl-badge');
  var clear = document.querySelector('.bl-clear');
  var msg = document.querySelector('.bl-msg');
  var n = 0;
  function paint(pop) {
    badge.hidden = n === 0;
    badge.textContent = n > 9 ? '9+' : String(n);
    btn.setAttribute('aria-label', 'Notifications, ' + n + ' unread');
    if (pop) { badge.classList.remove('is-pop'); void badge.offsetWidth; badge.classList.add('is-pop'); }
  }
  btn.addEventListener('click', function () {
    n++; paint(true);
    ico.classList.remove('is-ring'); void ico.getBoundingClientRect(); ico.classList.add('is-ring');
    msg.textContent = 'New notification · ' + n + ' unread';
  });
  clear.addEventListener('click', function () { n = 0; paint(false); msg.textContent = 'All caught up'; });
})();`,
'Pro',['buttons','bell','notification','badge','swing','a11y']),

// 33 ─ SEND: paper plane launches away, then success
item('btn-send','Paper-plane send button','Buttons','Send button where the paper plane flies off on click, the label cycles Sending then Sent and the plane glides back in when ready again.',
`<div class="p2c-stage p2c-kit"><div class="sn-wrap"><button class="sn-btn" type="button" data-state="idle"><span class="sn-ico" aria-hidden="true"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M3 11 21 3l-6 18-3-7-9-3Z" fill="currentColor"/></svg></span><span class="sn-label">Send message</span></button><p class="p2c-note sn-msg" role="status">Click to send</p></div></div>`,
`.p2c-kit .sn-wrap{display:grid;justify-items:center}
.p2c-kit .sn-btn{position:relative;overflow:hidden;display:inline-flex;align-items:center;justify-content:center;gap:12px;min-width:214px;padding:17px 28px;border:0;border-radius:16px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:15px;font-weight:800;box-shadow:0 20px 40px -16px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.4);transition:background .4s ease,box-shadow .4s ease,transform .15s ease}
.p2c-kit .sn-btn:hover{filter:brightness(1.1)}
.p2c-kit .sn-btn:active{transform:scale(.97)}
.p2c-kit .sn-btn:focus-visible{outline:2px solid #c7d2fe;outline-offset:4px}
.p2c-kit .sn-ico{display:grid;place-items:center;transition:transform .7s cubic-bezier(.5,0,.75,0),opacity .5s ease .1s}
.p2c-kit .sn-btn[data-state="sending"] .sn-ico,.p2c-kit .sn-btn[data-state="sent"] .sn-ico{transform:translate(140px,-46px) rotate(-18deg);opacity:0}
.p2c-kit .sn-btn[data-state="sending"]{cursor:progress}
.p2c-kit .sn-btn[data-state="sent"]{background:linear-gradient(135deg,#059669,#10b981);box-shadow:0 20px 40px -16px rgba(16,185,129,.95),inset 0 1px 0 rgba(255,255,255,.4)}
.p2c-kit .sn-label{transition:opacity .2s ease}`,
`(function () {
  var btn = document.querySelector('.sn-btn');
  var msg = document.querySelector('.sn-msg');
  if (!btn) return;
  var ico = btn.querySelector('.sn-ico');
  var label = btn.querySelector('.sn-label');
  var busy = false;
  function set(s) { btn.setAttribute('data-state', s); }
  btn.addEventListener('click', function () {
    if (busy) return;
    busy = true; set('sending'); label.textContent = 'Sending…'; msg.textContent = 'Sending…';
    btn.setAttribute('aria-busy', 'true');
    setTimeout(function () {
      btn.removeAttribute('aria-busy');
      set('sent'); label.textContent = 'Message sent'; msg.textContent = 'Delivered just now';
      setTimeout(function () {
        ico.style.transition = 'none';
        ico.style.transform = 'translate(-40px,10px)';
        void ico.offsetWidth;
        ico.style.transition = ''; ico.style.transform = '';
        set('idle'); label.textContent = 'Send message'; msg.textContent = 'Click to send';
        busy = false;
      }, 1900);
    }, 1300);
  });
})();`,
'Pro',['buttons','send','plane','async','success','premium']),

// 34 ─ GLITCH: cyberpunk cut-corner button with RGB-split glitch slices on hover
item('btn-glitch','Cyber glitch button','Buttons','Cut-corner cyberpunk button with RGB-split glitch slices on hover or focus. The glitch layers are removed for reduced-motion users.',
`<div class="p2c-stage p2c-kit"><button class="gt-btn" type="button"><span class="gt-t">Initialize</span><span class="gt-g gt-g1" aria-hidden="true">Initialize</span><span class="gt-g gt-g2" aria-hidden="true">Initialize</span></button></div>`,
`.p2c-kit .gt-btn{position:relative;isolation:isolate;padding:19px 40px;border:0;background:linear-gradient(135deg,#22d3ee,#a855f7);color:#e8fbff;font:800 15px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.16em;text-transform:uppercase;clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));transition:transform .15s ease,filter .3s ease}
.p2c-kit .gt-btn::before{content:"";position:absolute;inset:2px;z-index:-1;background:#0b1020;clip-path:polygon(0 0,calc(100% - 15px) 0,100% 15px,100% 100%,15px 100%,0 calc(100% - 15px))}
.p2c-kit .gt-t{position:relative}
.p2c-kit .gt-g{position:absolute;left:0;right:0;top:19px;text-align:center;opacity:0;pointer-events:none;mix-blend-mode:screen}
.p2c-kit .gt-g1{color:#22d3ee}
.p2c-kit .gt-g2{color:#f43f5e}
.p2c-kit .gt-btn:hover .gt-g,.p2c-kit .gt-btn:focus-visible .gt-g{opacity:1}
.p2c-kit .gt-btn:hover .gt-g1,.p2c-kit .gt-btn:focus-visible .gt-g1{animation:gt-a .7s steps(1) infinite}
.p2c-kit .gt-btn:hover .gt-g2,.p2c-kit .gt-btn:focus-visible .gt-g2{animation:gt-b .7s steps(1) infinite}
@keyframes gt-a{0%{clip-path:inset(10% 0 60% 0);transform:translate(-3px,0)}20%{clip-path:inset(55% 0 12% 0);transform:translate(3px,0)}40%{clip-path:inset(30% 0 40% 0);transform:translate(-2px,0)}60%{clip-path:inset(75% 0 5% 0);transform:translate(4px,0)}80%{clip-path:inset(0 0 80% 0);transform:translate(-4px,0)}100%{clip-path:inset(45% 0 30% 0);transform:translate(2px,0)}}
@keyframes gt-b{0%{clip-path:inset(60% 0 10% 0);transform:translate(3px,0)}25%{clip-path:inset(15% 0 55% 0);transform:translate(-3px,0)}50%{clip-path:inset(80% 0 0 0);transform:translate(2px,0)}75%{clip-path:inset(35% 0 35% 0);transform:translate(-4px,0)}100%{clip-path:inset(5% 0 70% 0);transform:translate(3px,0)}}
.p2c-kit .gt-btn:hover{filter:drop-shadow(0 0 14px rgba(168,85,247,.6))}
.p2c-kit .gt-btn:active{transform:scale(.97) skewX(-3deg)}
.p2c-kit .gt-btn:focus-visible{outline:2px solid #67e8f9;outline-offset:5px}
@media(prefers-reduced-motion:reduce){.p2c-kit .gt-g{display:none}}`,
undefined,
'Starter',['buttons','glitch','cyber','cut-corner','hover','css']),

// ═════════════════════════════════════════════════════════════════════════════
//  PREMIUM BUTTON COLLECTION · PACK 3  ·  20 more buttons (category: 'Buttons')
//
//  HOW TO APPLY in src/lib/anim/uiKit.ts
//   Paste this whole block directly AFTER the last existing Buttons item
//   (pack 2 ends with the "Cyber glitch button" item, id 'btn-glitch').
//   Nothing else in the file / project needs to change.
//   All class prefixes are unique (gb, so, tt, cf, ud, sg, rt, od, rc, cu, fl,
//   br, wv, fm, vl, mi, jl, bd, av, em), so nothing collides with earlier packs.
// ═════════════════════════════════════════════════════════════════════════════

// 35 ─ GRADIENT FLOW BORDER: spectrum border flowing around a dark pill with a blurred glow
item('btn-gradflow','Flowing gradient border','Buttons','Dark pill with a full-spectrum border that flows continuously, plus a blurred glow underneath that intensifies on hover. Pure CSS.',
`<div class="p2c-stage p2c-kit"><button class="gb-btn" type="button"><span class="gb-glow" aria-hidden="true"></span><span class="gb-t">Start free trial</span></button></div>`,
`.p2c-kit .gb-btn{position:relative;isolation:isolate;padding:18px 36px;border:0;border-radius:999px;background:transparent;color:#fff;font-size:15px;font-weight:800;letter-spacing:.01em;transition:transform .25s ease}
.p2c-kit .gb-btn::before{content:"";position:absolute;inset:0;z-index:-2;border-radius:inherit;background:linear-gradient(90deg,#22d3ee,#6366f1,#ec4899,#f59e0b,#22d3ee);background-size:300% 100%;animation:gb-flow 4s linear infinite}
.p2c-kit .gb-btn::after{content:"";position:absolute;inset:2px;z-index:-1;border-radius:inherit;background:#0a1022;transition:background .35s ease}
.p2c-kit .gb-glow{position:absolute;inset:6px 10px -6px;z-index:-3;border-radius:inherit;background:linear-gradient(90deg,#22d3ee,#6366f1,#ec4899,#f59e0b,#22d3ee);background-size:300% 100%;filter:blur(18px);opacity:.35;animation:gb-flow 4s linear infinite;transition:opacity .35s ease}
@keyframes gb-flow{to{background-position:-300% 0}}
.p2c-kit .gb-btn:hover{transform:translateY(-3px)}
.p2c-kit .gb-btn:hover::after{background:#111a3a}
.p2c-kit .gb-btn:hover .gb-glow{opacity:.85}
.p2c-kit .gb-btn:active{transform:scale(.97)}
.p2c-kit .gb-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:5px}`,
undefined,
'Pro',['buttons','gradient','border','flow','glow','premium','css']),

// 36 ─ SIGN-IN OPTIONS: full-width auth buttons with sliding icon and busy state
item('btn-social','Sign-in option buttons','Buttons','Stacked auth buttons (passkey, email, SSO) with a sliding icon tile, hover arrow and a busy spinner state after click.',
`<div class="p2c-stage p2c-kit"><div class="so-stack"><button class="so-btn" type="button"><span class="so-ico"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="8" cy="12" r="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M11.5 12H21M17 12v3M20 12v2.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><span class="so-t" data-t="Continue with passkey">Continue with passkey</span><span class="so-ar" aria-hidden="true">→</span></button><button class="so-btn" type="button"><span class="so-ico"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span class="so-t" data-t="Continue with email">Continue with email</span><span class="so-ar" aria-hidden="true">→</span></button><button class="so-btn" type="button"><span class="so-ico"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 3 5 6v5c0 4.5 2.9 8 7 10 4.1-2 7-5.5 7-10V6l-7-3Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg></span><span class="so-t" data-t="Continue with SSO">Continue with SSO</span><span class="so-ar" aria-hidden="true">→</span></button></div></div>`,
`.p2c-kit .so-stack{display:grid;gap:12px;width:min(100%,330px)}
.p2c-kit .so-btn{--mx:50%;position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;width:100%;padding:12px 16px 12px 12px;border:1px solid #2b3a57;border-radius:16px;background:#0b1124;color:#e8ecff;font-size:14px;font-weight:700;text-align:left;transition:border-color .3s ease,transform .2s ease,background .3s ease}
.p2c-kit .so-btn::before{content:"";position:absolute;inset:0;background:radial-gradient(160px circle at var(--mx) 50%,rgba(99,102,241,.22),transparent 70%);opacity:0;transition:opacity .3s ease;pointer-events:none}
.p2c-kit .so-btn:hover{border-color:#6366f1;transform:translateY(-2px)}
.p2c-kit .so-btn:hover::before{opacity:1}
.p2c-kit .so-btn:active{transform:scale(.98)}
.p2c-kit .so-btn:focus-visible{outline:2px solid #818cf8;outline-offset:3px}
.p2c-kit .so-ico{position:relative;display:grid;place-items:center;flex:none;width:38px;height:38px;border-radius:11px;background:linear-gradient(135deg,rgba(99,102,241,.35),rgba(34,211,238,.18));color:#c7d2fe;transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .so-btn:hover .so-ico{transform:rotate(-8deg) scale(1.08)}
.p2c-kit .so-t{position:relative;flex:1}
.p2c-kit .so-ar{color:#a5b4fc;opacity:0;transform:translateX(-8px);transition:opacity .25s ease,transform .35s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .so-btn:hover .so-ar,.p2c-kit .so-btn:focus-visible .so-ar{opacity:1;transform:none}
.p2c-kit .so-btn.is-busy{pointer-events:none;border-color:#4f46e5}
.p2c-kit .so-btn.is-busy .so-ico svg{opacity:0}
.p2c-kit .so-btn.is-busy .so-ico::after{content:"";position:absolute;width:18px;height:18px;border:2.5px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:so-rot .7s linear infinite}
@keyframes so-rot{to{transform:rotate(360deg)}}`,
`(function () {
  [].slice.call(document.querySelectorAll('.so-btn')).forEach(function (btn) {
    var t = btn.querySelector('.so-t');
    var base = t.getAttribute('data-t');
    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      btn.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    });
    btn.addEventListener('click', function () {
      if (btn.classList.contains('is-busy')) return;
      btn.classList.add('is-busy'); btn.setAttribute('aria-busy', 'true');
      t.textContent = 'Connecting…';
      setTimeout(function () {
        btn.classList.remove('is-busy'); btn.removeAttribute('aria-busy');
        t.textContent = base;
      }, 1400);
    });
  });
})();`,
'Pro',['buttons','auth','login','social','spotlight','premium']),

// 37 ─ TOOLTIP ICON BUTTONS: springy tooltips with shortcut chips and a hover delay
item('btn-tooltip','Tooltip icon buttons','Buttons','Icon buttons with springy tooltips that show a label and a shortcut chip. 250 ms hover delay, instant on keyboard focus. Bookmark is a real toggle.',
`<div class="p2c-stage p2c-kit"><div class="tt-row"><button class="tt-b" type="button" aria-label="Copy link"><span class="tt-i" aria-hidden="true">⎘</span><span class="tt-tip" aria-hidden="true">Copy link<em>C</em></span></button><button class="tt-b" type="button" aria-label="Share"><span class="tt-i" aria-hidden="true">⇪</span><span class="tt-tip" aria-hidden="true">Share<em>S</em></span></button><button class="tt-b tt-save" type="button" aria-label="Bookmark" aria-pressed="false"><span class="tt-i" aria-hidden="true">☆</span><span class="tt-tip" aria-hidden="true"><span class="tt-tx">Bookmark</span><em>B</em></span></button><button class="tt-b tt-del" type="button" aria-label="Delete"><span class="tt-i" aria-hidden="true">⌫</span><span class="tt-tip" aria-hidden="true">Delete<em>Del</em></span></button></div></div>`,
`.p2c-kit .tt-row{display:flex;gap:14px;padding:10px 14px;border:1px solid #243252;border-radius:20px;background:rgba(255,255,255,.04)}
.p2c-kit .tt-b{position:relative;display:grid;place-items:center;width:50px;height:50px;padding:0;border:1px solid #2b3a57;border-radius:15px;background:#0b1124;color:#cbd5f5;font-size:20px;transition:background .2s ease,color .2s ease,border-color .2s ease,transform .15s ease}
.p2c-kit .tt-b:hover{background:#141e3d;color:#fff;border-color:#4f6aa8}
.p2c-kit .tt-b:active{transform:scale(.92)}
.p2c-kit .tt-b:focus-visible{outline:2px solid #818cf8;outline-offset:3px}
.p2c-kit .tt-save[aria-pressed="true"]{color:#fbbf24;border-color:rgba(251,191,36,.5);background:rgba(251,191,36,.1)}
.p2c-kit .tt-del:hover{background:rgba(244,63,94,.16);color:#fda4af;border-color:rgba(244,63,94,.5)}
.p2c-kit .tt-tip{position:absolute;bottom:calc(100% + 12px);left:50%;z-index:5;display:inline-flex;align-items:center;gap:8px;padding:6px 10px;border:1px solid #2b3a57;border-radius:10px;background:#0b1020;color:#e8ecff;font-size:12px;font-weight:700;white-space:nowrap;opacity:0;pointer-events:none;transform:translate(-50%,6px) scale(.9);transform-origin:50% 100%;transition:opacity .15s ease,transform .3s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .tt-tip::after{content:"";position:absolute;left:50%;bottom:-5px;width:8px;height:8px;border-right:1px solid #2b3a57;border-bottom:1px solid #2b3a57;background:#0b1020;transform:translateX(-50%) rotate(45deg)}
.p2c-kit .tt-tip em{padding:1px 6px;border:1px solid rgba(255,255,255,.2);border-radius:5px;background:rgba(255,255,255,.08);color:#a5b4fc;font:800 10px ui-monospace,SFMono-Regular,Menlo,monospace;font-style:normal}
.p2c-kit .tt-b:hover .tt-tip{opacity:1;transform:translate(-50%,0) scale(1);transition-delay:.25s}
.p2c-kit .tt-b:focus-visible .tt-tip{opacity:1;transform:translate(-50%,0) scale(1);transition-delay:0s}`,
`(function () {
  var b = document.querySelector('.tt-save');
  if (!b) return;
  var icon = b.querySelector('.tt-i');
  var tx = b.querySelector('.tt-tx');
  b.addEventListener('click', function () {
    var on = b.getAttribute('aria-pressed') !== 'true';
    b.setAttribute('aria-pressed', on ? 'true' : 'false');
    b.setAttribute('aria-label', on ? 'Remove bookmark' : 'Bookmark');
    icon.textContent = on ? '★' : '☆';
    tx.textContent = on ? 'Bookmarked' : 'Bookmark';
  });
})();`,
'Pro',['buttons','tooltip','icon','shortcut','toolbar','a11y']),

// 38 ─ TWO-STEP CONFIRM: first click arms the button with a draining timer, second click confirms
item('btn-confirm','Two-step confirm button','Buttons','Click once to arm (label changes and a bar drains for 3 seconds), click again to confirm. Disarms itself if you do nothing.',
`<div class="p2c-stage p2c-kit"><div class="cf-wrap"><button class="cf-btn" type="button" data-state="idle" aria-label="Archive project"><span class="cf-bar" aria-hidden="true"></span><span class="cf-l cf-l1">Archive project</span><span class="cf-l cf-l2" aria-hidden="true">Click again to confirm</span><span class="cf-l cf-l3" aria-hidden="true">Archived ✓</span></button><p class="p2c-note cf-msg" role="status">Two clicks required</p></div></div>`,
`.p2c-kit .cf-wrap{display:grid;justify-items:center}
.p2c-kit .cf-btn{position:relative;isolation:isolate;overflow:hidden;display:inline-grid;place-items:center;padding:17px 30px;border:1px solid #2b3a57;border-radius:16px;background:#0b1124;color:#e8ecff;font-size:15px;font-weight:800;transition:background .3s ease,border-color .3s ease,color .3s ease,transform .15s ease}
.p2c-kit .cf-btn:hover{border-color:#6366f1}
.p2c-kit .cf-btn:active{transform:scale(.97)}
.p2c-kit .cf-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}
.p2c-kit .cf-l{grid-area:1/1;transition:opacity .25s ease,transform .35s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .cf-l2,.p2c-kit .cf-l3{opacity:0;transform:translateY(10px)}
.p2c-kit .cf-bar{position:absolute;left:0;bottom:0;z-index:-1;width:100%;height:100%;background:rgba(245,158,11,.22);transform-origin:0 50%;transform:scaleX(0)}
.p2c-kit .cf-btn[data-state="armed"]{border-color:#f59e0b;color:#fde68a}
.p2c-kit .cf-btn[data-state="armed"] .cf-l1{opacity:0;transform:translateY(-10px)}
.p2c-kit .cf-btn[data-state="armed"] .cf-l2{opacity:1;transform:none}
.p2c-kit .cf-btn[data-state="armed"] .cf-bar{animation:cf-drain 3s linear forwards}
@keyframes cf-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.p2c-kit .cf-btn[data-state="done"]{border-color:#10b981;background:#064e3b;color:#6ee7b7}
.p2c-kit .cf-btn[data-state="done"] .cf-l1{opacity:0;transform:translateY(-10px)}
.p2c-kit .cf-btn[data-state="done"] .cf-l3{opacity:1;transform:none}`,
`(function () {
  var btn = document.querySelector('.cf-btn');
  var msg = document.querySelector('.cf-msg');
  if (!btn) return;
  var timer = 0;
  function set(s) { btn.setAttribute('data-state', s); }
  btn.addEventListener('click', function () {
    var s = btn.getAttribute('data-state');
    if (s === 'idle') {
      set('armed'); btn.setAttribute('aria-label', 'Confirm archive project');
      msg.textContent = 'Click again within 3 seconds to confirm';
      clearTimeout(timer);
      timer = setTimeout(function () {
        set('idle'); btn.setAttribute('aria-label', 'Archive project'); msg.textContent = 'Two clicks required';
      }, 3000);
    } else if (s === 'armed') {
      clearTimeout(timer);
      set('done'); btn.setAttribute('aria-label', 'Project archived'); msg.textContent = 'Project archived';
      timer = setTimeout(function () {
        set('idle'); btn.setAttribute('aria-label', 'Archive project'); msg.textContent = 'Two clicks required';
      }, 2000);
    }
  });
})();`,
'Pro',['buttons','confirm','safety','countdown','danger','a11y']),

// 39 ─ UNDO SEND: countdown before commit, click again to cancel
item('btn-undosend','Undo-send countdown button','Buttons','Gmail-style send: after the click a 5 second countdown runs with a draining bar and the same button becomes Undo. Click to cancel, or let it send.',
`<div class="p2c-stage p2c-kit"><div class="ud-wrap"><button class="ud-btn" type="button" data-state="idle"><span class="ud-bar" aria-hidden="true"></span><span class="ud-label">Send email</span></button><p class="p2c-note ud-msg" role="status">Click to send</p></div></div>`,
`.p2c-kit .ud-wrap{display:grid;justify-items:center}
.p2c-kit .ud-btn{position:relative;isolation:isolate;overflow:hidden;min-width:230px;padding:17px 28px;border:0;border-radius:16px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:15px;font-weight:800;font-variant-numeric:tabular-nums;box-shadow:0 20px 40px -16px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.4);transition:background .35s ease,box-shadow .35s ease,transform .15s ease}
.p2c-kit .ud-btn:hover{filter:brightness(1.1)}
.p2c-kit .ud-btn:active{transform:scale(.97)}
.p2c-kit .ud-btn:focus-visible{outline:2px solid #c7d2fe;outline-offset:4px}
.p2c-kit .ud-bar{position:absolute;inset:0;z-index:-1;background:rgba(0,0,0,.28);transform-origin:100% 50%;transform:scaleX(0)}
.p2c-kit .ud-btn[data-state="counting"]{background:linear-gradient(135deg,#1e293b,#334155);box-shadow:0 20px 40px -16px rgba(0,0,0,.8)}
.p2c-kit .ud-btn[data-state="counting"] .ud-bar{background:rgba(129,140,248,.35);transform-origin:0 50%;animation:ud-drain 5s linear forwards}
@keyframes ud-drain{from{transform:scaleX(1)}to{transform:scaleX(0)}}
.p2c-kit .ud-btn[data-state="sent"]{background:linear-gradient(135deg,#059669,#10b981);box-shadow:0 20px 40px -16px rgba(16,185,129,.95),inset 0 1px 0 rgba(255,255,255,.4)}`,
`(function () {
  var btn = document.querySelector('.ud-btn');
  var msg = document.querySelector('.ud-msg');
  if (!btn) return;
  var label = btn.querySelector('.ud-label');
  var timer = 0, left = 0;
  function set(s) { btn.setAttribute('data-state', s); }
  function reset(delay) {
    setTimeout(function () { set('idle'); label.textContent = 'Send email'; msg.textContent = 'Click to send'; }, delay);
  }
  btn.addEventListener('click', function () {
    var s = btn.getAttribute('data-state');
    if (s === 'idle') {
      left = 5; set('counting');
      label.textContent = 'Sending in 5s · Undo';
      msg.textContent = 'Click again to cancel';
      timer = setInterval(function () {
        left--;
        if (left > 0) { label.textContent = 'Sending in ' + left + 's · Undo'; return; }
        clearInterval(timer);
        set('sent'); label.textContent = 'Email sent ✓'; msg.textContent = 'Delivered';
        reset(1900);
      }, 1000);
    } else if (s === 'counting') {
      clearInterval(timer);
      set('idle'); label.textContent = 'Send email'; msg.textContent = 'Send cancelled';
    }
  });
})();`,
'Pro',['buttons','undo','send','countdown','safety','async']),

// 40 ─ SEGMENTED CONTROL: sliding thumb radiogroup with live price readout
item('btn-segmented','Sliding segmented control','Buttons','Radiogroup segmented buttons with a spring-sliding thumb, Arrow / Home / End keys and a live price readout underneath.',
`<div class="p2c-stage p2c-kit"><div class="sg-wrap"><div class="sg-seg" role="radiogroup" aria-label="Billing period"><span class="sg-thumb" aria-hidden="true"></span><button class="sg-opt" type="button" role="radio" aria-checked="true" data-p="$29" data-n="per month, billed monthly">Monthly</button><button class="sg-opt" type="button" role="radio" aria-checked="false" tabindex="-1" data-p="$24" data-n="per month, billed yearly">Yearly</button><button class="sg-opt" type="button" role="radio" aria-checked="false" tabindex="-1" data-p="$499" data-n="one-time payment">Lifetime</button></div><p class="sg-price" role="status"><b>$29</b><span>per month, billed monthly</span></p></div></div>`,
`.p2c-kit .sg-wrap{display:grid;justify-items:center;gap:20px}
.p2c-kit .sg-seg{position:relative;display:inline-flex;padding:5px;border:1px solid #243252;border-radius:16px;background:#0a1022}
.p2c-kit .sg-thumb{position:absolute;top:5px;left:0;width:0;height:calc(100% - 10px);border-radius:12px;background:linear-gradient(135deg,#4f46e5,#7c3aed);box-shadow:0 8px 20px -8px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.3);transition:transform .5s cubic-bezier(.34,1.3,.64,1),width .35s ease}
.p2c-kit .sg-opt{position:relative;z-index:1;padding:11px 22px;border:0;border-radius:12px;background:transparent;color:#8ea0c4;font-size:14px;font-weight:700;transition:color .25s ease}
.p2c-kit .sg-opt:hover{color:#fff}
.p2c-kit .sg-opt[aria-checked="true"]{color:#fff}
.p2c-kit .sg-opt:focus-visible{outline:2px solid #a5b4fc;outline-offset:2px}
.p2c-kit .sg-price{display:grid;justify-items:center;gap:2px;margin:0;min-height:62px}
.p2c-kit .sg-price b{color:#fff;font-size:34px;font-weight:800;letter-spacing:-.02em}
.p2c-kit .sg-price span{color:#8ea0c4;font-size:13px;font-weight:600}
.p2c-kit .sg-price.is-swap{animation:sg-swap .4s ease}
@keyframes sg-swap{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`,
`(function () {
  var seg = document.querySelector('.sg-seg');
  if (!seg) return;
  var thumb = seg.querySelector('.sg-thumb');
  var opts = [].slice.call(seg.querySelectorAll('.sg-opt'));
  var price = document.querySelector('.sg-price');
  var pb = price.querySelector('b'), ps = price.querySelector('span');
  function slide(o) { thumb.style.width = o.offsetWidth + 'px'; thumb.style.transform = 'translateX(' + o.offsetLeft + 'px)'; }
  function cur() { return opts.filter(function (o) { return o.getAttribute('aria-checked') === 'true'; })[0] || opts[0]; }
  function pick(i, focus) {
    opts.forEach(function (o, n) { o.setAttribute('aria-checked', n === i ? 'true' : 'false'); o.tabIndex = n === i ? 0 : -1; });
    slide(opts[i]);
    pb.textContent = opts[i].getAttribute('data-p'); ps.textContent = opts[i].getAttribute('data-n');
    price.classList.remove('is-swap'); void price.offsetWidth; price.classList.add('is-swap');
    if (focus) opts[i].focus();
  }
  opts.forEach(function (o, i) {
    o.addEventListener('click', function () { pick(i, false); });
    o.addEventListener('keydown', function (e) {
      var n = -1;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = (i + 1) % opts.length;
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = (i + opts.length - 1) % opts.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = opts.length - 1;
      if (n > -1) { e.preventDefault(); pick(n, true); }
    });
  });
  thumb.style.transition = 'none'; slide(cur()); void thumb.offsetWidth; thumb.style.transition = '';
  window.addEventListener('resize', function () { slide(cur()); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { slide(cur()); });
})();`,
'Pro',['buttons','segmented','radiogroup','pricing','thumb','a11y']),

// 41 ─ STAR RATING: hover preview, spring pop, keyboard radiogroup
item('btn-rating','Star rating buttons','Buttons','Five star buttons with hover preview, spring pop on select, a live text label and full radiogroup keyboard support.',
`<div class="p2c-stage p2c-kit"><div class="rt-wrap"><div class="rt-grp" role="radiogroup" aria-label="Rating"><button class="rt-s" type="button" role="radio" aria-checked="false" aria-label="1 star"><svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8L12 3.2Z" stroke-width="1.8" stroke-linejoin="round"/></svg></button><button class="rt-s" type="button" role="radio" aria-checked="false" tabindex="-1" aria-label="2 stars"><svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8L12 3.2Z" stroke-width="1.8" stroke-linejoin="round"/></svg></button><button class="rt-s" type="button" role="radio" aria-checked="false" tabindex="-1" aria-label="3 stars"><svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8L12 3.2Z" stroke-width="1.8" stroke-linejoin="round"/></svg></button><button class="rt-s" type="button" role="radio" aria-checked="false" tabindex="-1" aria-label="4 stars"><svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8L12 3.2Z" stroke-width="1.8" stroke-linejoin="round"/></svg></button><button class="rt-s" type="button" role="radio" aria-checked="false" tabindex="-1" aria-label="5 stars"><svg viewBox="0 0 24 24" width="34" height="34" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.4 9.5l6-.8L12 3.2Z" stroke-width="1.8" stroke-linejoin="round"/></svg></button></div><p class="rt-l" role="status">Rate your experience</p></div></div>`,
`.p2c-kit .rt-wrap{display:grid;justify-items:center;gap:12px}
.p2c-kit .rt-grp{display:inline-flex;gap:6px;padding:10px 14px;border:1px solid #243252;border-radius:20px;background:rgba(255,255,255,.04)}
.p2c-kit .rt-s{display:grid;place-items:center;padding:4px;border:0;border-radius:12px;background:transparent;transition:transform .25s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .rt-s svg{fill:transparent;stroke:#62739a;transition:fill .2s ease,stroke .2s ease,filter .2s ease}
.p2c-kit .rt-s.is-on svg{fill:#fbbf24;stroke:#fbbf24;filter:drop-shadow(0 0 8px rgba(251,191,36,.55))}
.p2c-kit .rt-s.is-hot{transform:translateY(-2px)}
.p2c-kit .rt-s:active{transform:scale(.85)}
.p2c-kit .rt-s.is-pop{animation:rt-pop .5s cubic-bezier(.34,1.56,.64,1)}
@keyframes rt-pop{0%{transform:scale(1)}35%{transform:scale(1.5) rotate(-12deg)}100%{transform:scale(1)}}
.p2c-kit .rt-s:focus-visible{outline:2px solid #a5b4fc;outline-offset:2px}
.p2c-kit .rt-l{margin:0;min-height:20px;color:#9fb0d6;font-size:14px;font-weight:700}`,
`(function () {
  var grp = document.querySelector('.rt-grp');
  if (!grp) return;
  var stars = [].slice.call(grp.querySelectorAll('.rt-s'));
  var lab = document.querySelector('.rt-l');
  var NAMES = ['Rate your experience', 'Terrible', 'Poor', 'Okay', 'Great', 'Excellent'];
  var val = 0;
  function paint(h) {
    var shown = h || val;
    stars.forEach(function (s, i) {
      s.classList.toggle('is-on', i < shown);
      s.classList.toggle('is-hot', !!h && i < shown);
      s.setAttribute('aria-checked', i + 1 === val ? 'true' : 'false');
      s.tabIndex = (val ? i + 1 === val : i === 0) ? 0 : -1;
    });
    lab.textContent = shown ? NAMES[shown] + (h ? '' : ' (' + val + '/5)') : NAMES[0];
  }
  function set(n, focus) {
    val = n; paint(0);
    var s = stars[n - 1];
    s.classList.remove('is-pop'); void s.offsetWidth; s.classList.add('is-pop');
    if (focus) s.focus();
  }
  stars.forEach(function (s, i) {
    s.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') paint(i + 1); });
    s.addEventListener('click', function () { set(i + 1, false); });
    s.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); set(Math.min(5, (val || i + 1) + 1), true); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); set(Math.max(1, (val || i + 1) - 1), true); }
    });
  });
  grp.addEventListener('pointerleave', function () { paint(0); });
  paint(0);
})();`,
'Pro',['buttons','rating','stars','radiogroup','feedback','a11y']),

// 42 ─ ODOMETER COUNTER: GitHub-style star button whose digits roll like an odometer
item('btn-odometer','Odometer star counter','Buttons','Star button with a counter whose digits roll vertically with a stagger, like a mechanical odometer. Click to star or unstar.',
`<div class="p2c-stage p2c-kit"><button class="od-btn" type="button" aria-pressed="false" aria-label="Star, 1,284 stars"><span class="od-ico" aria-hidden="true">☆</span><span class="od-lbl">Star</span><span class="od-count" aria-hidden="true"></span></button></div>`,
`.p2c-kit .od-btn{display:inline-flex;align-items:center;gap:12px;padding:0 0 0 18px;border:1px solid #2b3a57;border-radius:14px;overflow:hidden;background:#0b1124;color:#e8ecff;font-size:15px;font-weight:800;transition:border-color .3s ease,box-shadow .3s ease,transform .15s ease}
.p2c-kit .od-btn:hover{border-color:#6366f1;box-shadow:0 0 0 4px rgba(99,102,241,.14)}
.p2c-kit .od-btn:active{transform:scale(.97)}
.p2c-kit .od-btn:focus-visible{outline:2px solid #818cf8;outline-offset:4px}
.p2c-kit .od-ico{font-size:18px;color:#9fb0d6;transition:transform .5s cubic-bezier(.34,1.56,.64,1),color .3s ease}
.p2c-kit .od-btn[aria-pressed="true"]{border-color:rgba(251,191,36,.55)}
.p2c-kit .od-btn[aria-pressed="true"] .od-ico{color:#fbbf24;transform:rotate(72deg) scale(1.25)}
.p2c-kit .od-lbl{padding:15px 0}
.p2c-kit .od-count{display:inline-flex;align-items:center;align-self:stretch;padding:0 18px 0 16px;border-left:1px solid #2b3a57;background:#111b3a;font-size:15px;font-variant-numeric:tabular-nums}
.p2c-kit .od-d{display:inline-block;height:1.2em;overflow:hidden}
.p2c-kit .od-col{display:block;transition:transform .6s cubic-bezier(.34,1.3,.64,1)}
.p2c-kit .od-col i{display:block;height:1.2em;line-height:1.2em;font-style:normal}`,
`(function () {
  var btn = document.querySelector('.od-btn');
  if (!btn) return;
  var box = btn.querySelector('.od-count');
  var ico = btn.querySelector('.od-ico');
  var lbl = btn.querySelector('.od-lbl');
  var n = 1284, on = false, cols = [], built = 0;
  function fmt(v) { return v.toLocaleString('en-US'); }
  function build(s) {
    box.innerHTML = ''; cols = [];
    for (var i = 0; i < s.length; i++) {
      var ch = s.charAt(i), el = document.createElement('span');
      if (ch === ',') { el.className = 'od-c'; el.textContent = ','; box.appendChild(el); cols.push(null); }
      else {
        el.className = 'od-d';
        var col = document.createElement('span'); col.className = 'od-col';
        for (var d = 0; d < 10; d++) { var it = document.createElement('i'); it.textContent = String(d); col.appendChild(it); }
        col.style.transform = 'translateY(-' + (parseInt(ch, 10) * 1.2) + 'em)';
        el.appendChild(col); box.appendChild(el); cols.push(col);
      }
    }
    built = s.length;
  }
  function paint() {
    var s = fmt(n);
    if (s.length !== built) build(s);
    for (var i = 0; i < s.length; i++) {
      if (!cols[i]) continue;
      cols[i].style.transitionDelay = ((s.length - 1 - i) * 45) + 'ms';
      cols[i].style.transform = 'translateY(-' + (parseInt(s.charAt(i), 10) * 1.2) + 'em)';
    }
    btn.setAttribute('aria-label', (on ? 'Unstar' : 'Star') + ', ' + s + ' stars');
  }
  btn.addEventListener('click', function () {
    on = !on; n += on ? 1 : -1;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    ico.textContent = on ? '★' : '☆';
    lbl.textContent = on ? 'Starred' : 'Star';
    paint();
  });
  paint();
})();`,
'Pro',['buttons','counter','odometer','star','github','premium']),

// 43 ─ RECORD: pulsing rings, core morphs from circle to square, live timer
item('btn-record','Record button with timer','Buttons','Camera-style record button: the red core morphs from a circle to a rounded square, rings pulse while recording and a live mm:ss timer runs.',
`<div class="p2c-stage p2c-kit"><div class="rc-wrap"><button class="rc-btn" type="button" aria-pressed="false" aria-label="Start recording"><span class="rc-ring rc-r1" aria-hidden="true"></span><span class="rc-ring rc-r2" aria-hidden="true"></span><span class="rc-core" aria-hidden="true"></span></button><p class="rc-time" role="timer">00:00</p></div></div>`,
`.p2c-kit .rc-wrap{display:grid;justify-items:center;gap:14px}
.p2c-kit .rc-btn{position:relative;display:grid;place-items:center;width:80px;height:80px;padding:0;border:3px solid rgba(255,255,255,.85);border-radius:50%;background:transparent;transition:transform .2s ease,border-color .3s ease}
.p2c-kit .rc-btn:hover{border-color:#fff}
.p2c-kit .rc-btn:active{transform:scale(.93)}
.p2c-kit .rc-btn:focus-visible{outline:2px solid #fda4af;outline-offset:6px}
.p2c-kit .rc-core{width:58px;height:58px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fb7185,#e11d48);box-shadow:0 0 22px rgba(244,63,94,.55);transition:width .4s cubic-bezier(.34,1.56,.64,1),height .4s cubic-bezier(.34,1.56,.64,1),border-radius .4s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .rc-btn[aria-pressed="true"] .rc-core{width:30px;height:30px;border-radius:9px}
.p2c-kit .rc-ring{position:absolute;inset:-3px;border:2px solid #f43f5e;border-radius:50%;opacity:0;pointer-events:none}
.p2c-kit .rc-btn[aria-pressed="true"] .rc-ring{animation:rc-pulse 1.8s ease-out infinite}
.p2c-kit .rc-btn[aria-pressed="true"] .rc-r2{animation-delay:.9s}
@keyframes rc-pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.9);opacity:0}}
.p2c-kit .rc-time{position:relative;margin:0;padding-left:16px;color:#9fb0d6;font:700 15px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.06em}
.p2c-kit .rc-time::before{content:"";position:absolute;left:0;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:#3a4570}
.p2c-kit .rc-wrap.is-rec .rc-time{color:#fff}
.p2c-kit .rc-wrap.is-rec .rc-time::before{background:#f43f5e;animation:rc-blink 1s steps(1) infinite}
@keyframes rc-blink{50%{opacity:.2}}`,
`(function () {
  var wrap = document.querySelector('.rc-wrap');
  if (!wrap) return;
  var btn = wrap.querySelector('.rc-btn');
  var time = wrap.querySelector('.rc-time');
  var t = 0, tm = 0, on = false;
  function pad(x) { return x < 10 ? '0' + x : String(x); }
  function paint() { time.textContent = pad(Math.floor(t / 60)) + ':' + pad(t % 60); }
  btn.addEventListener('click', function () {
    on = !on;
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    btn.setAttribute('aria-label', on ? 'Stop recording' : 'Start recording');
    wrap.classList.toggle('is-rec', on);
    clearInterval(tm);
    if (on) { t = 0; paint(); tm = setInterval(function () { t++; paint(); }, 1000); }
  });
})();`,
'Pro',['buttons','record','timer','pulse','media','a11y']),

// 44 ─ COUPON: ticket-shaped button; reveal the code, then copy it
item('btn-coupon','Coupon reveal button','Buttons','Ticket-shaped button with real punched notches. First click reveals the blurred code, the second copies it to the clipboard.',
`<div class="p2c-stage p2c-kit"><button class="cu-btn" type="button" data-state="hidden" aria-label="Reveal coupon code"><span class="cu-l"><small>Save</small><b>40% off</b></span><span class="cu-r"><span class="cu-code">SAVE40</span><span class="cu-hint">Tap to reveal</span></span></button></div>`,
`.p2c-kit .cu-btn{position:relative;display:inline-flex;align-items:stretch;min-width:300px;padding:0;border:0;color:#fff;background:linear-gradient(135deg,#f59e0b,#ec4899 60%,#8b5cf6);-webkit-mask:radial-gradient(circle 10px at 0 50%,transparent 97%,#000) left/51% 100% no-repeat,radial-gradient(circle 10px at 100% 50%,transparent 97%,#000) right/51% 100% no-repeat;mask:radial-gradient(circle 10px at 0 50%,transparent 97%,#000) left/51% 100% no-repeat,radial-gradient(circle 10px at 100% 50%,transparent 97%,#000) right/51% 100% no-repeat;border-radius:14px;filter:drop-shadow(0 18px 24px rgba(236,72,153,.35));transition:transform .2s ease}
.p2c-kit .cu-btn:hover{transform:translateY(-3px) rotate(-.6deg)}
.p2c-kit .cu-btn:active{transform:scale(.97)}
.p2c-kit .cu-btn:focus-visible{outline:2px solid #fff;outline-offset:5px}
.p2c-kit .cu-l{display:grid;align-content:center;gap:2px;padding:18px 22px 18px 26px;text-align:left}
.p2c-kit .cu-l small{font-size:11px;font-weight:700;letter-spacing:.12em;opacity:.85;text-transform:uppercase}
.p2c-kit .cu-l b{font-size:26px;font-weight:900;letter-spacing:-.01em}
.p2c-kit .cu-r{position:relative;display:grid;place-items:center;flex:1;padding:0 24px;border-left:2px dashed rgba(255,255,255,.55)}
.p2c-kit .cu-code{font:900 20px ui-monospace,SFMono-Regular,Menlo,monospace;letter-spacing:.14em;filter:blur(7px);transition:filter .45s ease}
.p2c-kit .cu-hint{position:absolute;inset:0;display:grid;place-items:center;font-size:12px;font-weight:800;letter-spacing:.04em;transition:opacity .3s ease}
.p2c-kit .cu-btn[data-state="revealed"] .cu-code,.p2c-kit .cu-btn[data-state="copied"] .cu-code{filter:blur(0)}
.p2c-kit .cu-btn[data-state="revealed"] .cu-hint,.p2c-kit .cu-btn[data-state="copied"] .cu-hint{font-size:11px;opacity:.9;inset:auto 0 8px;display:block;text-align:center}`,
`(function () {
  var btn = document.querySelector('.cu-btn');
  if (!btn) return;
  var hint = btn.querySelector('.cu-hint');
  var CODE = 'SAVE40', timer = 0;
  function set(s, label, h) { btn.setAttribute('data-state', s); btn.setAttribute('aria-label', label); hint.textContent = h; }
  function copied() {
    set('copied', 'Coupon code copied', 'Copied ✓');
    clearTimeout(timer);
    timer = setTimeout(function () { set('revealed', 'Copy coupon code ' + CODE, 'Tap to copy'); }, 1800);
  }
  function fallback() {
    var ta = document.createElement('textarea');
    ta.value = CODE; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (err) {}
    document.body.removeChild(ta); copied();
  }
  btn.addEventListener('click', function () {
    var s = btn.getAttribute('data-state');
    if (s === 'hidden') { set('revealed', 'Copy coupon code ' + CODE, 'Tap to copy'); }
    else if (s === 'revealed') {
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(CODE).then(copied, fallback);
      else fallback();
    }
  });
})();`,
'Pro',['buttons','coupon','ticket','reveal','copy','ecommerce']),

// 45 ─ FOLD CORNER: the top-right corner peels back on hover
item('btn-fold','Peel-corner button','Buttons','Button whose top-right corner folds over like paper on hover. The corner is a real clip-path animated through a registered length.',
`<div class="p2c-stage p2c-kit"><button class="fl-btn" type="button"><span>Open document</span><span class="fl-ar" aria-hidden="true">→</span></button></div>`,
`@property --fl-f{syntax:'<length>';inherits:false;initial-value:0px}
.p2c-kit .fl-btn{--fl-f:0px;position:relative;display:inline-flex;align-items:center;gap:14px;padding:20px 40px 20px 34px;border:0;border-radius:14px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:15px;font-weight:800;clip-path:polygon(0 0,calc(100% - var(--fl-f)) 0,100% var(--fl-f),100% 100%,0 100%);transition:--fl-f .45s cubic-bezier(.34,1.4,.64,1),filter .3s ease}
.p2c-kit .fl-btn::after{content:"";position:absolute;top:0;right:0;width:var(--fl-f);height:var(--fl-f);background:linear-gradient(45deg,#a5b4fc 50%,transparent 50%)}
.p2c-kit .fl-ar{transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .fl-btn:hover,.p2c-kit .fl-btn:focus-visible{--fl-f:36px}
.p2c-kit .fl-btn:hover .fl-ar,.p2c-kit .fl-btn:focus-visible .fl-ar{transform:translateX(5px)}
.p2c-kit .fl-btn:active{filter:brightness(.9)}
.p2c-kit .fl-btn:focus-visible{outline:2px solid #c7d2fe;outline-offset:5px}`,
undefined,
'Starter',['buttons','fold','corner','clip-path','paper','css']),

// 46 ─ NEO-BRUTALIST: hard offset shadows that collapse on press
item('btn-brutal','Neo-brutalist buttons','Buttons','Bold flat buttons with hard offset shadows that grow on hover and collapse when pressed. Three colour variants, pure CSS.',
`<div class="p2c-stage p2c-kit"><div class="br-row"><button class="br-btn" type="button">Buy now</button><button class="br-btn br-w" type="button">Learn more</button><button class="br-btn br-m" type="button">Read docs</button></div></div>`,
`.p2c-kit .br-row{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;padding:6px}
.p2c-kit .br-btn{--sh:#a5b4fc;position:relative;padding:16px 28px;border:3px solid #0b0b0f;border-radius:12px;background:#fde047;color:#0b0b0f;font-size:15px;font-weight:900;letter-spacing:.02em;box-shadow:6px 6px 0 var(--sh);transition:transform .12s ease,box-shadow .12s ease}
.p2c-kit .br-w{--sh:#f472b6;background:#f8fafc}
.p2c-kit .br-m{--sh:#fde047;background:#5eead4}
.p2c-kit .br-btn:hover{transform:translate(-3px,-3px);box-shadow:9px 9px 0 var(--sh)}
.p2c-kit .br-btn:active{transform:translate(6px,6px);box-shadow:0 0 0 var(--sh)}
.p2c-kit .br-btn:focus-visible{outline:3px solid #fff;outline-offset:4px}`,
undefined,
'Starter',['buttons','brutalist','flat','shadow','bold','css']),

// 47 ─ LIQUID WAVE: two rotating blobs rise like water
item('btn-wave','Liquid wave fill button','Buttons','Two rotating blobs rise inside the button like water on hover, giving a continuously moving wave surface. Pure CSS.',
`<div class="p2c-stage p2c-kit"><button class="wv-btn" type="button"><span class="wv-w wv-w2" aria-hidden="true"></span><span class="wv-w wv-w1" aria-hidden="true"></span><span class="wv-t">Dive in</span></button></div>`,
`.p2c-kit .wv-btn{position:relative;isolation:isolate;overflow:hidden;padding:19px 46px;border:1.5px solid #38bdf8;border-radius:18px;background:#071426;color:#e0f2fe;font-size:16px;font-weight:800;transition:box-shadow .5s ease,transform .2s ease,color .4s ease}
.p2c-kit .wv-t{position:relative}
.p2c-kit .wv-w{position:absolute;left:50%;top:112%;z-index:-1;width:260%;aspect-ratio:1;margin-left:-130%;border-radius:41%;background:rgba(14,165,233,.9);animation:wv-spin 6s linear infinite;transition:top 1s cubic-bezier(.65,0,.25,1)}
.p2c-kit .wv-w2{background:rgba(56,189,248,.5);border-radius:38%;animation-duration:9s;animation-direction:reverse}
@keyframes wv-spin{to{transform:rotate(360deg)}}
.p2c-kit .wv-btn:hover .wv-w1,.p2c-kit .wv-btn:focus-visible .wv-w1{top:14%}
.p2c-kit .wv-btn:hover .wv-w2,.p2c-kit .wv-btn:focus-visible .wv-w2{top:8%}
.p2c-kit .wv-btn:hover,.p2c-kit .wv-btn:focus-visible{color:#fff;box-shadow:0 0 28px -4px rgba(14,165,233,.7)}
.p2c-kit .wv-btn:active{transform:scale(.97)}
.p2c-kit .wv-btn:focus-visible{outline:2px solid #7dd3fc;outline-offset:5px}`,
undefined,
'Pro',['buttons','wave','liquid','water','hover','css']),

// 48 ─ FORMAT TOOLBAR: toggle buttons that style a live preview
item('btn-format','Formatting toolbar buttons','Buttons','Rich-text toolbar: Bold / Italic / Underline / Strike toggles and an alignment radiogroup that style a live preview. Arrow-key navigation across the toolbar.',
`<div class="p2c-stage p2c-kit"><div class="fm-wrap"><div class="fm-bar" role="toolbar" aria-label="Text formatting"><button class="fm-b" type="button" data-f="b" aria-pressed="false" aria-label="Bold"><b>B</b></button><button class="fm-b" type="button" data-f="i" aria-pressed="false" aria-label="Italic"><i>I</i></button><button class="fm-b" type="button" data-f="u" aria-pressed="false" aria-label="Underline"><u>U</u></button><button class="fm-b" type="button" data-f="s" aria-pressed="false" aria-label="Strikethrough"><s>S</s></button><span class="fm-sep" aria-hidden="true"></span><button class="fm-b" type="button" data-a="left" role="radio" aria-checked="true" aria-label="Align left">⇤</button><button class="fm-b" type="button" data-a="center" role="radio" aria-checked="false" aria-label="Align center">↔</button><button class="fm-b" type="button" data-a="right" role="radio" aria-checked="false" aria-label="Align right">⇥</button></div><p class="fm-prev">Ship beautiful interfaces faster.</p></div></div>`,
`.p2c-kit .fm-wrap{display:grid;gap:14px;width:min(100%,400px)}
.p2c-kit .fm-bar{display:flex;align-items:center;gap:4px;padding:6px;border:1px solid #243252;border-radius:16px;background:#0a1022}
.p2c-kit .fm-b{display:grid;place-items:center;width:40px;height:40px;padding:0;border:0;border-radius:11px;background:transparent;color:#9fb0d6;font-size:16px;transition:background .2s ease,color .2s ease,transform .15s ease}
.p2c-kit .fm-b:hover{background:rgba(255,255,255,.07);color:#fff}
.p2c-kit .fm-b:active{transform:scale(.88)}
.p2c-kit .fm-b[aria-pressed="true"],.p2c-kit .fm-b[aria-checked="true"]{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;box-shadow:0 6px 16px -6px rgba(99,102,241,.95)}
.p2c-kit .fm-b.is-pop{animation:fm-pop .35s cubic-bezier(.34,1.56,.64,1)}
@keyframes fm-pop{40%{transform:scale(1.2)}}
.p2c-kit .fm-b:focus-visible{outline:2px solid #a5b4fc;outline-offset:2px}
.p2c-kit .fm-sep{width:1px;height:22px;margin:0 6px;background:#243252}
.p2c-kit .fm-prev{margin:0;padding:22px;border:1px solid #243252;border-radius:16px;background:#0a1022;color:#e8ecff;font-size:20px;line-height:1.4;text-align:left;transition:all .2s ease}
.p2c-kit .fm-prev.b{font-weight:800}
.p2c-kit .fm-prev.i{font-style:italic}
.p2c-kit .fm-prev.u{text-decoration-line:underline}
.p2c-kit .fm-prev.s{text-decoration-line:line-through}
.p2c-kit .fm-prev.u.s{text-decoration-line:underline line-through}`,
`(function () {
  var bar = document.querySelector('.fm-bar');
  var prev = document.querySelector('.fm-prev');
  if (!bar) return;
  var btns = [].slice.call(bar.querySelectorAll('.fm-b'));
  var aligns = btns.filter(function (b) { return b.hasAttribute('data-a'); });
  function pop(b) { b.classList.remove('is-pop'); void b.offsetWidth; b.classList.add('is-pop'); }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () {
      pop(b);
      if (b.hasAttribute('data-f')) {
        var on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
        prev.classList.toggle(b.getAttribute('data-f'), on);
      } else {
        aligns.forEach(function (a) { a.setAttribute('aria-checked', a === b ? 'true' : 'false'); });
        prev.style.textAlign = b.getAttribute('data-a');
      }
    });
    b.addEventListener('keydown', function (e) {
      var n = -1;
      if (e.key === 'ArrowRight') n = (i + 1) % btns.length;
      else if (e.key === 'ArrowLeft') n = (i + btns.length - 1) % btns.length;
      else if (e.key === 'Home') n = 0;
      else if (e.key === 'End') n = btns.length - 1;
      if (n > -1) { e.preventDefault(); btns[n].focus(); }
    });
  });
})();`,
'Pro',['buttons','toolbar','format','toggle','editor','a11y']),

// 49 ─ VOLUME: mute button that expands into a volume slider
item('btn-volume','Expanding volume button','Buttons','Round mute button that grows into a volume pill with a gradient slider on hover or focus. The icon waves follow the level and mute restores the last volume.',
`<div class="p2c-stage p2c-kit"><div class="vl-wrap"><div class="vl-pill" data-l="2"><button class="vl-btn" type="button" aria-label="Mute" aria-pressed="false"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor"/><path class="vl-w1" d="M16 9.2a4 4 0 0 1 0 5.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="vl-w2" d="M18.6 6.6a8 8 0 0 1 0 10.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path class="vl-x" d="M16 9.5l5 5M21 9.5l-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button><input class="vl-range" type="range" min="0" max="100" value="60" aria-label="Volume"/></div><p class="p2c-note vl-out" role="status">Volume 60%</p></div></div>`,
`.p2c-kit .vl-wrap{display:grid;justify-items:center;gap:14px}
.p2c-kit .vl-pill{display:flex;align-items:center;width:58px;height:58px;overflow:hidden;border:1px solid #2b3a57;border-radius:999px;background:#0b1124;transition:width .55s cubic-bezier(.65,0,.25,1),border-color .3s ease}
.p2c-kit .vl-pill:hover,.p2c-kit .vl-pill:focus-within{width:240px;border-color:#6366f1}
.p2c-kit .vl-btn{display:grid;place-items:center;flex:none;width:56px;height:56px;padding:0;border:0;border-radius:50%;background:transparent;color:#e8ecff;transition:color .2s ease,transform .15s ease}
.p2c-kit .vl-btn:hover{color:#a5b4fc}
.p2c-kit .vl-btn:active{transform:scale(.9)}
.p2c-kit .vl-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:-4px}
.p2c-kit .vl-btn path{transition:opacity .25s ease}
.p2c-kit .vl-x{opacity:0}
.p2c-kit .vl-pill[data-l="0"] .vl-w1,.p2c-kit .vl-pill[data-l="0"] .vl-w2{opacity:0}
.p2c-kit .vl-pill[data-l="0"] .vl-x{opacity:1}
.p2c-kit .vl-pill[data-l="1"] .vl-w2{opacity:0}
.p2c-kit .vl-range{-webkit-appearance:none;appearance:none;flex:1;min-width:0;height:6px;margin:0 20px 0 4px;border-radius:99px;outline:0;cursor:pointer;opacity:0;background:linear-gradient(90deg,#818cf8 var(--v,60%),#2b3a57 var(--v,60%));transition:opacity .3s ease .1s}
.p2c-kit .vl-pill:hover .vl-range,.p2c-kit .vl-pill:focus-within .vl-range{opacity:1}
.p2c-kit .vl-range::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.5);transition:transform .2s ease}
.p2c-kit .vl-range::-moz-range-thumb{width:16px;height:16px;border:0;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.5)}
.p2c-kit .vl-range:active::-webkit-slider-thumb{transform:scale(1.3)}
.p2c-kit .vl-range:focus-visible{outline:2px solid #a5b4fc;outline-offset:6px}
@media (hover:none){.p2c-kit .vl-pill{width:240px}.p2c-kit .vl-range{opacity:1}}`,
`(function () {
  var pill = document.querySelector('.vl-pill');
  if (!pill) return;
  var btn = pill.querySelector('.vl-btn');
  var range = pill.querySelector('.vl-range');
  var out = document.querySelector('.vl-out');
  var vol = 60, prev = 60;
  function paint() {
    var muted = vol === 0;
    range.value = String(vol);
    range.style.setProperty('--v', vol + '%');
    btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
    btn.setAttribute('aria-label', muted ? 'Unmute' : 'Mute');
    pill.setAttribute('data-l', muted ? '0' : (vol < 35 ? '1' : '2'));
    out.textContent = muted ? 'Muted' : 'Volume ' + vol + '%';
  }
  range.addEventListener('input', function () {
    vol = parseInt(range.value, 10);
    if (vol > 0) prev = vol;
    paint();
  });
  btn.addEventListener('click', function () {
    if (vol > 0) { prev = vol; vol = 0; } else { vol = prev || 50; }
    paint();
  });
  paint();
})();`,
'Pro',['buttons','volume','slider','expand','media','a11y']),

// 50 ─ MAGNETIC ICONS: each icon button is individually pulled toward the cursor
item('btn-magicons','Magnetic icon cluster','Buttons','A row of icon buttons where every button is attracted to the cursor on its own with a spring-like ease and scales up with proximity.',
`<div class="p2c-stage p2c-kit"><div class="mi-field"><button class="mi-b" type="button" aria-label="Edit" style="--c1:#6366f1;--c2:#22d3ee">✎</button><button class="mi-b" type="button" aria-label="Cloud" style="--c1:#ec4899;--c2:#f97316">☁</button><button class="mi-b" type="button" aria-label="Settings" style="--c1:#8b5cf6;--c2:#ec4899">⚙</button><button class="mi-b" type="button" aria-label="Command" style="--c1:#10b981;--c2:#22d3ee">⌘</button><button class="mi-b" type="button" aria-label="Extras" style="--c1:#f59e0b;--c2:#ef4444">❖</button></div></div>`,
`.p2c-kit .mi-field{display:flex;flex-wrap:wrap;gap:18px;align-items:center;justify-content:center;padding:44px 36px;border:1px dashed rgba(148,163,184,.25);border-radius:28px}
.p2c-kit .mi-b{display:grid;place-items:center;width:56px;height:56px;padding:0;border:0;border-radius:18px;color:#fff;font-size:24px;background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:0 14px 28px -12px rgba(0,0,0,.8),inset 0 1px 0 rgba(255,255,255,.4);will-change:transform}
.p2c-kit .mi-b:active{filter:brightness(.9)}
.p2c-kit .mi-b:focus-visible{outline:2px solid #fff;outline-offset:4px}`,
`(function () {
  var field = document.querySelector('.mi-field');
  if (!field) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var btns = [].slice.call(field.querySelectorAll('.mi-b'));
  var st = btns.map(function () { return { x: 0, y: 0, s: 1, tx: 0, ty: 0, ts: 1 }; });
  var R = 130, MAX = 22, raf = 0;
  function loop() {
    var moving = false;
    btns.forEach(function (b, i) {
      var o = st[i];
      o.x += (o.tx - o.x) * 0.18; o.y += (o.ty - o.y) * 0.18; o.s += (o.ts - o.s) * 0.18;
      if (Math.abs(o.tx - o.x) > 0.05 || Math.abs(o.ty - o.y) > 0.05 || Math.abs(o.ts - o.s) > 0.002) moving = true;
      else { o.x = o.tx; o.y = o.ty; o.s = o.ts; }
      b.style.transform = 'translate3d(' + o.x.toFixed(2) + 'px,' + o.y.toFixed(2) + 'px,0) scale(' + o.s.toFixed(3) + ')';
    });
    raf = moving ? requestAnimationFrame(loop) : 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  field.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    btns.forEach(function (b, i) {
      var r = b.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var d = Math.sqrt(dx * dx + dy * dy);
      var k = d < R ? 1 - d / R : 0;
      st[i].tx = Math.max(-MAX, Math.min(MAX, dx * 0.45 * k));
      st[i].ty = Math.max(-MAX, Math.min(MAX, dy * 0.45 * k));
      st[i].ts = 1 + 0.3 * k;
    });
    kick();
  });
  field.addEventListener('pointerleave', function () {
    st.forEach(function (o) { o.tx = 0; o.ty = 0; o.ts = 1; });
    kick();
  });
})();`,
'Pro',['buttons','magnetic','icons','spring','pointer','premium']),

// 51 ─ JELLY: squash on press, wobbling release
item('btn-jelly','Jelly squish button','Buttons','Glossy button that squashes while pressed and wobbles back like jelly on release, with a squish counter.',
`<div class="p2c-stage p2c-kit"><div class="jl-wrap"><button class="jl-btn" type="button">Squish me</button><p class="p2c-note jl-msg" role="status">Squishes: 0</p></div></div>`,
`.p2c-kit .jl-wrap{display:grid;justify-items:center}
.p2c-kit .jl-btn{position:relative;padding:20px 40px;border:0;border-radius:26px;background:linear-gradient(180deg,#ff8fb8,#f43f8e 60%,#d61f6f);color:#fff;font-size:17px;font-weight:900;letter-spacing:.01em;box-shadow:0 22px 40px -14px rgba(244,63,142,.9),inset 0 3px 0 rgba(255,255,255,.55),inset 0 -6px 0 rgba(0,0,0,.14);transition:transform .35s cubic-bezier(.34,1.8,.64,1)}
.p2c-kit .jl-btn:hover{transform:translateY(-3px) scale(1.03)}
.p2c-kit .jl-btn:active{transform:scale(1.12,.84)}
.p2c-kit .jl-btn.is-wob{animation:jl-wob .85s linear}
@keyframes jl-wob{0%{transform:scale(1.12,.84)}22%{transform:scale(.88,1.14)}42%{transform:scale(1.07,.94)}60%{transform:scale(.97,1.04)}80%{transform:scale(1.015,.99)}100%{transform:scale(1)}}
.p2c-kit .jl-btn:focus-visible{outline:2px solid #fbcfe8;outline-offset:5px}`,
`(function () {
  var btn = document.querySelector('.jl-btn');
  var msg = document.querySelector('.jl-msg');
  if (!btn) return;
  var n = 0;
  btn.addEventListener('click', function () {
    n++; msg.textContent = 'Squishes: ' + n;
    btn.classList.remove('is-wob'); void btn.offsetWidth; btn.classList.add('is-wob');
  });
  btn.addEventListener('animationend', function () { btn.classList.remove('is-wob'); });
})();`,
'Pro',['buttons','jelly','squish','spring','playful','premium']),

// 52 ─ DRAW BORDER: SVG outline draws itself around the button on hover
item('btn-drawborder','Self-drawing border button','Buttons','A 1.5px SVG outline that draws itself clockwise around the button on hover or focus, with a soft fill and arrow nudge.',
`<div class="p2c-stage p2c-kit"><button class="bd-btn" type="button"><svg class="bd-svg" width="100%" height="100%" aria-hidden="true"><rect class="bd-base" x="0.75" y="0.75" width="100%" height="100%" rx="14"/><rect class="bd-draw" x="0.75" y="0.75" width="100%" height="100%" rx="14" pathLength="1"/></svg><span class="bd-t">View case study</span><span class="bd-ar" aria-hidden="true">→</span></button></div>`,
`.p2c-kit .bd-btn{position:relative;display:inline-flex;align-items:center;gap:12px;padding:18px 34px;border:0;border-radius:14px;background:rgba(255,255,255,.03);color:#e8ecff;font-size:15px;font-weight:800;transition:background .4s ease,color .3s ease,transform .2s ease}
.p2c-kit .bd-svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none}
.p2c-kit .bd-base,.p2c-kit .bd-draw{x:.75px;y:.75px;width:calc(100% - 1.5px);height:calc(100% - 1.5px);rx:14px;ry:14px;fill:none;stroke-width:1.5}
.p2c-kit .bd-base{stroke:rgba(255,255,255,.14)}
.p2c-kit .bd-draw{stroke:url(#none);stroke:#818cf8;stroke-dasharray:1;stroke-dashoffset:1;transition:stroke-dashoffset .9s cubic-bezier(.65,0,.25,1)}
.p2c-kit .bd-t,.p2c-kit .bd-ar{position:relative}
.p2c-kit .bd-ar{transition:transform .4s cubic-bezier(.34,1.56,.64,1)}
.p2c-kit .bd-btn:hover,.p2c-kit .bd-btn:focus-visible{background:rgba(99,102,241,.1);color:#fff}
.p2c-kit .bd-btn:hover .bd-draw,.p2c-kit .bd-btn:focus-visible .bd-draw{stroke-dashoffset:0}
.p2c-kit .bd-btn:hover .bd-ar,.p2c-kit .bd-btn:focus-visible .bd-ar{transform:translateX(5px)}
.p2c-kit .bd-btn:active{transform:scale(.97)}
.p2c-kit .bd-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:5px}`,
undefined,
'Pro',['buttons','svg','border','draw','outline','hover','css']),

// 53 ─ AVATAR INVITE: stacked avatars fan out on hover
item('btn-avatars','Avatar-stack invite button','Buttons','Invite button with an overlapping avatar stack that spreads apart on hover, then confirms with a copied-link state on click.',
`<div class="p2c-stage p2c-kit"><button class="av-btn" type="button"><span class="av-stack" aria-hidden="true"><i style="--c1:#f472b6;--c2:#fb923c">AK</i><i style="--c1:#22d3ee;--c2:#6366f1">MR</i><i style="--c1:#a78bfa;--c2:#ec4899">JT</i><i class="av-more">+5</i></span><span class="av-t">Invite team</span></button></div>`,
`.p2c-kit .av-btn{display:inline-flex;align-items:center;gap:16px;padding:10px 24px 10px 14px;border:1px solid #2b3a57;border-radius:999px;background:#0b1124;color:#e8ecff;font-size:15px;font-weight:800;transition:border-color .3s ease,background .3s ease,box-shadow .3s ease,transform .15s ease}
.p2c-kit .av-btn:hover{border-color:#6366f1;background:#101a3a;box-shadow:0 18px 34px -18px rgba(99,102,241,.9)}
.p2c-kit .av-btn:active{transform:scale(.97)}
.p2c-kit .av-btn:focus-visible{outline:2px solid #a5b4fc;outline-offset:4px}
.p2c-kit .av-stack{display:inline-flex;align-items:center}
.p2c-kit .av-stack i{display:grid;place-items:center;width:36px;height:36px;margin-left:-12px;border:2.5px solid #0b1124;border-radius:50%;background:linear-gradient(135deg,var(--c1,#334155),var(--c2,#475569));color:#fff;font-size:11px;font-style:normal;font-weight:800;transition:margin .45s cubic-bezier(.34,1.56,.64,1),transform .45s cubic-bezier(.34,1.56,.64,1),border-color .3s ease}
.p2c-kit .av-stack i:first-child{margin-left:0}
.p2c-kit .av-more{background:#26335a!important;color:#c7d2fe!important}
.p2c-kit .av-btn:hover .av-stack i,.p2c-kit .av-btn:focus-visible .av-stack i{margin-left:5px;border-color:#101a3a}
.p2c-kit .av-btn:hover .av-stack i:first-child,.p2c-kit .av-btn:focus-visible .av-stack i:first-child{margin-left:0}
.p2c-kit .av-btn:hover .av-stack i:nth-child(odd),.p2c-kit .av-btn:focus-visible .av-stack i:nth-child(odd){transform:translateY(-3px)}
.p2c-kit .av-btn.is-ok{border-color:#10b981;box-shadow:0 0 0 4px rgba(16,185,129,.16)}`,
`(function () {
  var btn = document.querySelector('.av-btn');
  if (!btn) return;
  var t = btn.querySelector('.av-t');
  var timer = 0;
  btn.addEventListener('click', function () {
    btn.classList.add('is-ok'); t.textContent = 'Invite link copied';
    clearTimeout(timer);
    timer = setTimeout(function () { btn.classList.remove('is-ok'); t.textContent = 'Invite team'; }, 1800);
  });
})();`,
'Pro',['buttons','avatars','invite','team','stack','social']),

// 54 ─ SUBSCRIBE EXPAND: button morphs into an email field with validation
item('btn-subscribe','Subscribe-to-input morph','Buttons','Pill button that expands into an email input with a submit arrow. Validates on Enter with a shake, collapses on Esc or outside click, shows a success state.',
`<div class="p2c-stage p2c-kit"><div class="em-wrap"><div class="em-box" data-open="false"><button class="em-open" type="button">Subscribe</button><div class="em-field"><input class="em-input" type="email" placeholder="you@company.com" aria-label="Email address" autocomplete="off" spellcheck="false" tabindex="-1"/><button class="em-go" type="button" aria-label="Submit email" tabindex="-1">→</button></div></div><p class="p2c-note em-msg" role="status">Get release notes by email</p></div></div>`,
`.p2c-kit .em-wrap{display:grid;justify-items:center}
.p2c-kit .em-box{position:relative;width:170px;height:58px;overflow:hidden;border:1px solid #4f46e5;border-radius:999px;background:linear-gradient(135deg,#4f46e5,#7c3aed);box-shadow:0 18px 36px -16px rgba(99,102,241,.95),inset 0 1px 0 rgba(255,255,255,.35);transition:width .6s cubic-bezier(.65,0,.25,1),background .4s ease,border-color .3s ease}
.p2c-kit .em-box[data-open="true"]{width:min(100%,340px);background:#0b1124;border-color:#4f46e5}
.p2c-kit .em-box.is-bad{border-color:#f43f5e;animation:em-shake .45s ease}
.p2c-kit .em-box.is-ok{width:210px;background:linear-gradient(135deg,#059669,#10b981);border-color:#10b981}
@keyframes em-shake{20%{transform:translateX(-7px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(3px)}}
.p2c-kit .em-open{position:absolute;inset:0;width:100%;border:0;background:transparent;color:#fff;font-size:15px;font-weight:800;transition:opacity .25s ease,transform .35s ease}
.p2c-kit .em-open:focus-visible{outline:2px solid #c7d2fe;outline-offset:-4px;border-radius:999px}
.p2c-kit .em-box[data-open="true"] .em-open{opacity:0;transform:scale(.9);pointer-events:none}
.p2c-kit .em-field{position:absolute;inset:0;display:flex;align-items:center;gap:6px;padding:0 6px 0 22px;opacity:0;pointer-events:none;transition:opacity .3s ease .15s}
.p2c-kit .em-box[data-open="true"] .em-field{opacity:1;pointer-events:auto}
.p2c-kit .em-input{flex:1;min-width:0;border:0;background:transparent;color:#fff;font-size:15px;outline:0}
.p2c-kit .em-input::placeholder{color:#62739a}
.p2c-kit .em-go{display:grid;place-items:center;flex:none;width:46px;height:46px;border:0;border-radius:50%;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:18px;font-weight:800;transition:transform .3s cubic-bezier(.34,1.56,.64,1),filter .2s ease}
.p2c-kit .em-go:hover{transform:translateX(2px);filter:brightness(1.15)}
.p2c-kit .em-go:active{transform:scale(.9)}
.p2c-kit .em-go:focus-visible{outline:2px solid #c7d2fe;outline-offset:2px}`,
`(function () {
  var box = document.querySelector('.em-box');
  var msg = document.querySelector('.em-msg');
  if (!box) return;
  var open = box.querySelector('.em-open');
  var input = box.querySelector('.em-input');
  var go = box.querySelector('.em-go');
  var HINT = 'Get release notes by email', busy = false;
  function isOpen() { return box.getAttribute('data-open') === 'true'; }
  function expand() {
    box.setAttribute('data-open', 'true');
    input.tabIndex = 0; go.tabIndex = 0;
    setTimeout(function () { input.focus(); }, 280);
  }
  function collapse(refocus) {
    box.setAttribute('data-open', 'false');
    input.tabIndex = -1; go.tabIndex = -1;
    input.removeAttribute('aria-invalid');
    if (refocus) open.focus();
  }
  function valid(v) {
    var at = v.indexOf('@'), dot = v.lastIndexOf('.');
    return at > 0 && dot > at + 1 && dot < v.length - 1 && v.indexOf(' ') < 0;
  }
  function submit() {
    if (busy) return;
    var v = input.value.trim();
    if (!valid(v)) {
      input.setAttribute('aria-invalid', 'true');
      msg.textContent = 'Please enter a valid email address';
      box.classList.remove('is-bad'); void box.offsetWidth; box.classList.add('is-bad');
      return;
    }
    busy = true;
    box.classList.remove('is-bad'); box.classList.add('is-ok');
    box.setAttribute('data-open', 'false'); open.textContent = 'Subscribed ✓';
    input.tabIndex = -1; go.tabIndex = -1;
    msg.textContent = 'Thanks! Check your inbox to confirm.';
    setTimeout(function () {
      box.classList.remove('is-ok'); open.textContent = 'Subscribe';
      input.value = ''; msg.textContent = HINT; busy = false;
    }, 2400);
  }
  open.addEventListener('click', expand);
  go.addEventListener('click', submit);
  box.addEventListener('animationend', function () { box.classList.remove('is-bad'); });
  input.addEventListener('input', function () { input.removeAttribute('aria-invalid'); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && e.target === input) { e.preventDefault(); submit(); }
    else if (e.key === 'Escape' && isOpen()) { e.preventDefault(); collapse(true); msg.textContent = HINT; }
  });
  document.addEventListener('pointerdown', function (e) {
    if (isOpen() && !box.contains(e.target) && !input.value) collapse(false);
  });
})();`,
'Pro',['buttons','subscribe','input','morph','email','validation','a11y']),
];

// Keep the category list exported alongside the catalog for ComponentLab filters.
export const UI_KIT_CATEGORIES: Array<'All' | UIKitCategory> = [
  'All',
  'Buttons',
  'Modals & popups',
  'Navigation',
  'Cards & panels',
  'Playful & advanced',
];