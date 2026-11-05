import type { Block } from './blocks';
import { AR, IC, img } from './proShared';

/**
 * PRO blocks, part A: navigation, heroes, cards, bento, panels, tabs, team.
 * Every block: responsive (fluid clamp() type + breakpoints), hover/focus animation, keyboard + screen-reader friendly,
 * respects prefers-reduced-motion, and every class starts with bk- so it never clashes with your site.
 */
export const PRO_A: Block[] = [
  // ============================== PRO NAVBAR ==============================
  {
    id: 'pro-nav-glass', category: 'Pro Navbar', name: 'Glass navbar (sliding pill)',
    description: 'Floating frosted-glass bar. A pill slides under the hovered link, the bar shrinks on scroll, links highlight by section, mobile gets an animated drawer.',
    specs: ['Sticky, backdrop-blur glass, shrinks after 24px scroll', 'Sliding hover indicator + scroll-spy (active link follows the section)', 'Mobile (max 900px): burger morphs to X, drawer with staggered links, Esc closes', 'Accessible: aria-expanded, focus ring, keyboard friendly'],
    shared: ['pro'],
    html: `<header class="bk-p bk-pnav" id="header">
  <div class="bk-pnav__bar">
    <a class="bk-pnav__logo" href="#home"><span class="bk-pnav__mark"></span>Brand</a>
    <nav class="bk-pnav__menu" aria-label="Main">
      <span class="bk-pnav__ind" aria-hidden="true"></span>
      <a class="is-active" href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#services">Services</a>
      <a href="#pricing">Pricing</a>
      <a href="#contact">Contact</a>
      <a class="bk-pnav__mcta" href="#contact">Get started</a>
    </nav>
    <a class="bk-pbtn bk-pnav__cta" href="#contact">Get started ${AR}</a>
    <button class="bk-pnav__burger" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span></button>
  </div>
</header>`,
    css: `.bk-pnav{position:sticky;top:0;z-index:80;padding:16px clamp(12px,3vw,32px);transition:padding .4s var(--bk-ease)}
.bk-pnav__bar{position:relative;max-width:1240px;margin:0 auto;display:flex;align-items:center;gap:18px;padding:9px 10px 9px 22px;border-radius:999px;background:rgba(255,255,255,.72);-webkit-backdrop-filter:saturate(1.6) blur(16px);backdrop-filter:saturate(1.6) blur(16px);border:1px solid rgba(255,255,255,.7);box-shadow:0 1px 0 rgba(255,255,255,.9) inset,0 12px 32px -16px rgba(11,18,32,.3);transition:background .4s,box-shadow .4s}
.bk-pnav.is-stuck{padding-top:8px;padding-bottom:8px}
.bk-pnav.is-stuck .bk-pnav__bar{background:rgba(255,255,255,.92);box-shadow:0 16px 40px -18px rgba(11,18,32,.45)}
.bk-pnav__logo{display:flex;align-items:center;gap:10px;margin-right:auto;font-size:20px;font-weight:800;letter-spacing:-.03em;color:var(--bk-ink);text-decoration:none}
.bk-pnav__mark{width:26px;height:26px;border-radius:9px 9px 9px 3px;background:linear-gradient(135deg,var(--bk-a),var(--bk-a2));transition:transform .6s var(--bk-ease)}
.bk-pnav__logo:hover .bk-pnav__mark{transform:rotate(90deg) scale(1.12)}
.bk-pnav__menu{position:relative;display:flex;align-items:center;gap:2px}
.bk-pnav__menu a{position:relative;z-index:1;padding:10px 16px;border-radius:999px;color:#334155;font-size:15px;font-weight:500;text-decoration:none;transition:color .25s}
.bk-pnav__menu a:hover,.bk-pnav__menu a.is-active{color:var(--bk-a)}
.bk-pnav__menu a:focus-visible{outline:2px solid var(--bk-a);outline-offset:2px}
.bk-pnav__menu a.bk-pnav__mcta{display:none}
.bk-pnav__ind{position:absolute;z-index:0;top:0;left:0;height:100%;width:0;border-radius:999px;background:var(--bk-a-l);opacity:0;transition:transform .5s var(--bk-ease),width .5s var(--bk-ease),opacity .3s}
.bk-pnav__cta{padding:13px 22px}
.bk-pnav__burger{display:none}
@media (max-width:900px){
  .bk-pnav__cta{display:none}
  .bk-pnav__burger{display:grid;align-content:center;justify-items:center;gap:5px;width:46px;height:46px;border:0;border-radius:50%;background:var(--bk-a-l);cursor:pointer}
  .bk-pnav__burger span{display:block;width:20px;height:2px;border-radius:2px;background:var(--bk-ink);transition:transform .45s var(--bk-ease)}
  .bk-pnav.is-open .bk-pnav__burger span:nth-child(1){transform:translateY(3.5px) rotate(45deg)}
  .bk-pnav.is-open .bk-pnav__burger span:nth-child(2){transform:translateY(-3.5px) rotate(-45deg)}
  .bk-pnav__ind{display:none}
  .bk-pnav__menu{position:absolute;top:calc(100% + 10px);left:0;right:0;flex-direction:column;align-items:stretch;gap:4px;padding:14px;border-radius:26px;background:rgba(255,255,255,.97);border:1px solid var(--bk-line);box-shadow:0 34px 70px -24px rgba(11,18,32,.5);opacity:0;visibility:hidden;transform:translateY(-12px) scale(.98);transform-origin:top center;transition:opacity .35s,transform .5s var(--bk-ease),visibility .35s}
  .bk-pnav.is-open .bk-pnav__menu{opacity:1;visibility:visible;transform:none}
  .bk-pnav__menu a{padding:15px 18px;font-size:17px;opacity:0;transform:translateY(10px);transition:opacity .4s,transform .5s var(--bk-ease),color .25s,background .25s;transition-delay:calc(var(--n,0) * 45ms)}
  .bk-pnav.is-open .bk-pnav__menu a{opacity:1;transform:none}
  .bk-pnav__menu a:hover,.bk-pnav__menu a.is-active{background:var(--bk-a-l)}
  .bk-pnav__menu a.bk-pnav__mcta{display:flex;justify-content:center;margin-top:6px;background:var(--bk-a);color:#fff}
  .bk-pnav__menu a.bk-pnav__mcta:hover{background:var(--bk-a-d);color:#fff}
}`,
    js: `document.querySelectorAll('.bk-pnav').forEach(function (nav) {
  var menu = nav.querySelector('.bk-pnav__menu');
  var ind = nav.querySelector('.bk-pnav__ind');
  var btn = nav.querySelector('.bk-pnav__burger');
  var links = [].slice.call(menu.querySelectorAll('a:not(.bk-pnav__mcta)'));
  menu.querySelectorAll('a').forEach(function (a, i) { a.style.setProperty('--n', i); });
  function active() { return menu.querySelector('a.is-active'); }
  function place(el) {
    if (!el || !ind || getComputedStyle(ind).display === 'none') return;
    ind.style.width = el.offsetWidth + 'px';
    ind.style.transform = 'translateX(' + el.offsetLeft + 'px)';
    ind.style.opacity = '1';
  }
  links.forEach(function (a) {
    a.addEventListener('mouseenter', function () { place(a); });
    a.addEventListener('focus', function () { place(a); });
  });
  menu.addEventListener('mouseleave', function () {
    var a = active();
    if (a) place(a); else if (ind) ind.style.opacity = '0';
  });
  function setOpen(o) {
    nav.classList.toggle('is-open', o);
    btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  }
  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
  menu.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
  var targets = links.map(function (a) {
    var h = a.getAttribute('href');
    try { return h && h.length > 1 && h.charAt(0) === '#' ? document.querySelector(h) : null; } catch (err) { return null; }
  });
  function spy() {
    nav.classList.toggle('is-stuck', window.scrollY > 24);
    var cur = -1;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= 140) cur = i; });
    if (cur > -1) links.forEach(function (a, i) { a.classList.toggle('is-active', i === cur); });
    var a = active();
    if (a && !menu.matches(':hover')) place(a);
  }
  window.addEventListener('scroll', spy, { passive: true });
  window.addEventListener('resize', spy);
  spy();
});`,
  },

  // ============================== PRO HERO ==============================
  {
    id: 'pro-hero-aurora', category: 'Pro Hero', name: 'Hero: aurora gradient',
    description: 'Modern SaaS / agency hero with drifting colour blobs, gradient headline, shine buttons, floating stat chips and a tilting image.',
    specs: ['Fluid type clamp(40px, 6.2vw, 78px)', 'Animated aurora background (pure CSS, GPU transforms)', 'Image tilts in 3D on hover, chips float (bk-bob)', 'Stacks to one column under 900px, image first', 'Staggered scroll-reveal on every element'],
    shared: ['pro'],
    html: `<section class="bk-p bk-aur" id="home">
  <div class="bk-aur__bg" aria-hidden="true"><i></i><i></i><i></i></div>
  <div class="bk-pw bk-aur__in">
    <div class="bk-aur__text">
      <span class="bk-pey bk-rv">Version 2.0 is live</span>
      <h1 class="bk-rv" style="--i:1">Design that makes people <em>stop scrolling</em></h1>
      <p class="bk-rv" style="--i:2">One honest sentence about what you do, who it is for and why it works. Short, clear and confident.</p>
      <div class="bk-aur__btns bk-rv" style="--i:3">
        <a class="bk-pbtn" href="#contact">Start free ${AR}</a>
        <a class="bk-pbtn bk-pbtn--ghost" href="#about">See how it works</a>
      </div>
      <ul class="bk-aur__trust bk-rv" style="--i:4">
        <li><strong>4.9/5</strong><span>Client rating</span></li>
        <li><strong>12k+</strong><span>Happy users</span></li>
        <li><strong>99.9%</strong><span>Uptime</span></li>
      </ul>
    </div>
    <div class="bk-aur__visual bk-rv bk-rv--r" style="--i:2">
      <div class="bk-aur__frame"><img src="${img('bk-aurora', 760, 700)}" alt="Product preview" loading="lazy"></div>
      <div class="bk-aur__chip bk-aur__chip--a">${IC.chart}<div><b>+248%</b><span>Growth this year</span></div></div>
      <div class="bk-aur__chip bk-aur__chip--b">${IC.shield}<div><b>Secure</b><span>Bank-grade</span></div></div>
    </div>
  </div>
</section>`,
    css: `.bk-aur{position:relative;overflow:hidden;background:#fbfbfe;padding:clamp(48px,8vw,110px) 0 clamp(56px,8vw,120px)}
.bk-aur__bg{position:absolute;inset:0;pointer-events:none}
.bk-aur__bg i{position:absolute;border-radius:50%;filter:blur(70px);opacity:.55;animation:bk-aur-drift 16s ease-in-out infinite alternate}
.bk-aur__bg i:nth-child(1){width:46vw;height:46vw;max-width:620px;max-height:620px;left:-8%;top:-18%;background:var(--bk-a)}
.bk-aur__bg i:nth-child(2){width:38vw;height:38vw;max-width:520px;max-height:520px;right:-6%;top:6%;background:var(--bk-a2);animation-delay:-5s}
.bk-aur__bg i:nth-child(3){width:34vw;height:34vw;max-width:460px;max-height:460px;left:34%;bottom:-24%;background:var(--bk-a-m);animation-delay:-9s}
@keyframes bk-aur-drift{0%{transform:translate3d(0,0,0) scale(1)}100%{transform:translate3d(6vw,4vw,0) scale(1.18)}}
.bk-aur__in{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(32px,5vw,72px);align-items:center}
.bk-aur h1{font-size:clamp(40px,6.2vw,78px);margin:22px 0 22px;font-weight:800}
.bk-aur h1 em{font-style:normal;color:var(--bk-a);background:linear-gradient(90deg,var(--bk-a),var(--bk-a2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.bk-aur__text p{max-width:520px;font-size:clamp(17px,1.7vw,20px);color:var(--bk-mut);margin-bottom:34px}
.bk-aur__btns{display:flex;flex-wrap:wrap;gap:14px}
.bk-aur__trust{list-style:none;margin:44px 0 0;padding:34px 0 0;border-top:1px solid var(--bk-line);display:flex;flex-wrap:wrap;gap:18px 44px}
.bk-aur__trust strong{display:block;font-size:26px;font-weight:800;letter-spacing:-.03em}
.bk-aur__trust span{font-size:14px;color:var(--bk-mut)}
.bk-aur__visual{position:relative}
.bk-aur__frame{border-radius:calc(var(--bk-r) + 8px);padding:10px;background:rgba(255,255,255,.7);border:1px solid rgba(255,255,255,.9);box-shadow:0 40px 80px -30px rgba(11,18,32,.45);transition:transform .9s var(--bk-ease)}
.bk-aur__frame img{width:100%;aspect-ratio:1/.95;object-fit:cover;border-radius:var(--bk-r)}
@media (hover:hover){.bk-aur__frame:hover{transform:perspective(1100px) rotateY(-6deg) rotateX(4deg) scale(1.02)}}
.bk-aur__chip{position:absolute;display:flex;align-items:center;gap:12px;padding:12px 18px 12px 14px;border-radius:18px;background:rgba(255,255,255,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px);box-shadow:0 20px 40px -18px rgba(11,18,32,.4);animation:bk-bob 5s ease-in-out infinite}
.bk-aur__chip svg{color:var(--bk-a);flex:none}
.bk-aur__chip b{display:block;font-size:17px;line-height:1.2}
.bk-aur__chip span{font-size:12.5px;color:var(--bk-mut)}
.bk-aur__chip--a{left:-6%;top:12%}
.bk-aur__chip--b{right:-3%;bottom:10%;animation-delay:-2.5s}
@media (max-width:900px){.bk-aur__in{grid-template-columns:1fr}.bk-aur__visual{order:-1;max-width:560px;margin:0 auto;width:100%}.bk-aur__chip--a{left:2%}.bk-aur__chip--b{right:2%}}`,
    js: '',
  },
  {
    id: 'pro-hero-classic', category: 'Pro Hero', name: 'Hero: classic editorial (serif)',
    description: 'Timeless magazine look on cream paper: serif headline, arch-shaped photo, rotating circular badge, thin ornamental rules.',
    specs: ['Serif display type (Georgia / Playfair if you load it)', 'Arch photo window with slow zoom on hover', 'Rotating SVG text badge (CSS spin)', 'Great for law, clinics, hotels, boutiques, weddings', 'Responsive: arch drops below text under 860px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-cls" id="home">
  <div class="bk-pw bk-cls__in">
    <div class="bk-cls__text">
      <p class="bk-cls__no bk-rv"><span>No. 01</span><i></i><span>Est. 1998</span></p>
      <h1 class="bk-rv" style="--i:1">Where careful craft meets <em>quiet luxury</em></h1>
      <p class="bk-cls__lead bk-rv" style="--i:2">A short, elegant paragraph about your story. Write it like a letter to a guest: warm, specific and unhurried.</p>
      <div class="bk-cls__btns bk-rv" style="--i:3">
        <a class="bk-cls__btn" href="#contact">Reserve a visit</a>
        <a class="bk-cls__link" href="#about">Our story ${AR}</a>
      </div>
      <dl class="bk-cls__facts bk-rv" style="--i:4">
        <div><dt>25+</dt><dd>Years of practice</dd></div>
        <div><dt>3,400</dt><dd>Guests served</dd></div>
        <div><dt>18</dt><dd>Awards won</dd></div>
      </dl>
    </div>
    <div class="bk-cls__art bk-rv bk-rv--z" style="--i:2">
      <div class="bk-cls__arch"><img src="${img('bk-classic', 640, 800)}" alt="Interior" loading="lazy"></div>
      <svg class="bk-cls__badge" viewBox="0 0 120 120" aria-hidden="true"><defs><path id="bk-cls-circ" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs><text><textPath href="#bk-cls-circ">HANDCRAFTED &#8226; SINCE 1998 &#8226;</textPath></text><circle cx="60" cy="60" r="9"/></svg>
    </div>
  </div>
</section>`,
    css: `.bk-cls{--bk-hf:"Playfair Display",Georgia,"Times New Roman",serif;background:#faf6ef;color:#2a2118;padding:clamp(48px,8vw,104px) 0;position:relative}
.bk-cls::before{content:"";position:absolute;inset:18px;border:1px solid rgba(42,33,24,.18);pointer-events:none}
.bk-cls__in{display:grid;grid-template-columns:1.1fr .9fr;gap:clamp(36px,6vw,90px);align-items:center}
.bk-cls__no{display:flex;align-items:center;gap:16px;font-size:13px;letter-spacing:.24em;text-transform:uppercase;color:#7a6a58}
.bk-cls__no i{flex:0 0 64px;height:1px;background:var(--bk-a)}
.bk-cls h1{font-size:clamp(40px,6vw,80px);font-weight:500;letter-spacing:-.025em;line-height:1.04;margin:22px 0 26px;color:#1d160f}
.bk-cls h1 em{font-style:italic;color:var(--bk-a)}
.bk-cls__lead{max-width:500px;font-family:Georgia,serif;font-size:clamp(17px,1.6vw,20px);line-height:1.75;color:#5d4e3d;margin-bottom:34px}
.bk-cls__btns{display:flex;align-items:center;flex-wrap:wrap;gap:26px}
.bk-cls__btn{position:relative;overflow:hidden;display:inline-block;padding:16px 34px;background:#1d160f;color:#faf6ef;font-size:13px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;transition:color .4s,letter-spacing .5s var(--bk-ease)}
.bk-cls__btn::before{content:"";position:absolute;inset:0;background:var(--bk-a);transform:translateY(101%);transition:transform .5s var(--bk-ease);z-index:0}
.bk-cls__btn:hover{letter-spacing:.26em}
.bk-cls__btn:hover::before{transform:none}
.bk-cls__btn{isolation:isolate}
.bk-cls__btn::before{z-index:-1}
.bk-cls__link{color:#1d160f;text-decoration:none;font-size:15px;border-bottom:1px solid currentColor;padding-bottom:3px;transition:color .3s}
.bk-cls__link:hover{color:var(--bk-a)}
.bk-cls__link:hover .bk-pbtn__ar{transform:translateX(6px)}
.bk-cls__facts{display:flex;flex-wrap:wrap;gap:20px 46px;margin:48px 0 0;padding-top:30px;border-top:1px solid rgba(42,33,24,.18)}
.bk-cls__facts dt{font-family:var(--bk-hf);font-size:34px;line-height:1;color:#1d160f}
.bk-cls__facts dd{margin:6px 0 0;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#7a6a58}
.bk-cls__art{position:relative;max-width:460px;margin-left:auto;width:100%}
.bk-cls__arch{overflow:hidden;border-radius:999px 999px 6px 6px;aspect-ratio:4/5;box-shadow:0 40px 70px -34px rgba(42,33,24,.55)}
.bk-cls__arch img{width:100%;height:100%;object-fit:cover;transition:transform 1.6s var(--bk-ease)}
.bk-cls__art:hover .bk-cls__arch img{transform:scale(1.08)}
.bk-cls__badge{position:absolute;left:-54px;bottom:44px;width:120px;height:120px;padding:6px;border-radius:50%;background:#faf6ef;box-shadow:0 14px 30px -12px rgba(42,33,24,.5);animation:bk-spin 22s linear infinite}
.bk-cls__badge text{font-size:10.4px;letter-spacing:.17em;fill:#1d160f;font-family:Georgia,serif}
.bk-cls__badge circle{fill:var(--bk-a)}
@media (max-width:860px){.bk-cls__in{grid-template-columns:1fr}.bk-cls__art{margin:0 auto;max-width:380px}.bk-cls__badge{left:-14px;width:96px;height:96px}.bk-cls::before{inset:10px}}`,
    js: '',
  },
  {
    id: 'pro-hero-spotlight', category: 'Pro Hero', name: 'Hero: dark cursor spotlight',
    description: 'Dark product hero with a grid and a soft light that follows the pointer, email capture pill and a glowing badge.',
    specs: ['Pointer-tracked radial spotlight (CSS variables --mx / --my)', 'Masked grid background, glow headline word', 'Inline email capture with validation message', 'Touch devices get a calm static glow', 'Min-height 100svh-safe: clamp(560px, 92vh, 860px)'],
    shared: ['pro'],
    html: `<section class="bk-p bk-spot" id="home">
  <div class="bk-spot__grid" aria-hidden="true"></div>
  <div class="bk-spot__in">
    <a class="bk-spot__badge bk-rv" href="#features"><b>New</b> Automations are here <span aria-hidden="true">&rarr;</span></a>
    <h1 class="bk-rv" style="--i:1">Ship your next idea <em>ten times faster</em></h1>
    <p class="bk-rv" style="--i:2">A calm, powerful workspace for teams that care about details. Plan, build and launch without the noise.</p>
    <form class="bk-spot__form bk-rv" style="--i:3" novalidate>
      <input type="email" required placeholder="you@company.com" aria-label="Email address">
      <button class="bk-pbtn" type="submit">Get early access ${AR}</button>
    </form>
    <p class="bk-spot__msg" role="status" aria-live="polite"></p>
    <ul class="bk-spot__proof bk-rv" style="--i:4"><li>No credit card</li><li>Free 14-day trial</li><li>Cancel anytime</li></ul>
  </div>
</section>`,
    css: `.bk-spot{position:relative;overflow:hidden;min-height:clamp(560px,92vh,860px);display:grid;place-items:center;background:#060b18;color:#e8edf7;padding:clamp(70px,9vw,120px) 20px;--mx:50%;--my:28%}
.bk-spot::before{content:"";position:absolute;inset:0;background:radial-gradient(640px circle at var(--mx) var(--my),color-mix(in srgb,var(--bk-a) 42%,transparent),transparent 62%);transition:opacity .4s}
.bk-spot__grid{position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.06) 1px,transparent 1px);background-size:56px 56px;-webkit-mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000 30%,transparent 80%);mask-image:radial-gradient(ellipse 70% 60% at 50% 40%,#000 30%,transparent 80%)}
.bk-spot__in{position:relative;max-width:860px;text-align:center}
.bk-spot__badge{display:inline-flex;align-items:center;gap:10px;padding:6px 16px 6px 6px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);color:#cbd5e6;font-size:14px;text-decoration:none;transition:background .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-spot__badge b{padding:4px 11px;border-radius:999px;background:var(--bk-a);color:#fff;font-size:12px}
.bk-spot__badge:hover{background:rgba(255,255,255,.13);border-color:rgba(255,255,255,.3);transform:translateY(-2px)}
.bk-spot h1{font-size:clamp(40px,7vw,84px);font-weight:800;margin:28px 0 22px;color:#fff}
.bk-spot h1 em{font-style:normal;background:linear-gradient(100deg,#fff 10%,var(--bk-a-m) 45%,var(--bk-a2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.bk-spot__in>p{max-width:600px;margin:0 auto 36px;font-size:clamp(16px,1.8vw,20px);color:#9fb0cc}
.bk-spot__form{display:flex;gap:8px;max-width:520px;margin:0 auto;padding:7px;border-radius:999px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.16);transition:border-color .3s,box-shadow .4s}
.bk-spot__form:focus-within{border-color:var(--bk-a);box-shadow:0 0 0 5px color-mix(in srgb,var(--bk-a) 28%,transparent)}
.bk-spot__form input{flex:1;min-width:0;padding:0 18px;border:0;background:transparent;color:#fff;font-family:inherit;font-size:16px;outline:0}
.bk-spot__form input::placeholder{color:#7f90ad}
.bk-spot__form .bk-pbtn{padding:14px 22px;white-space:nowrap}
.bk-spot__msg{min-height:1.4em;margin-top:14px;font-weight:600;font-size:14px;color:var(--bk-a-m)}
.bk-spot__proof{list-style:none;margin:18px 0 0;padding:0;display:flex;flex-wrap:wrap;justify-content:center;gap:10px 26px;font-size:14px;color:#8a9bb8}
.bk-spot__proof li::before{content:"";display:inline-block;width:6px;height:6px;margin-right:9px;border-radius:50%;background:var(--bk-a);vertical-align:middle}
@media (max-width:560px){.bk-spot__form{flex-direction:column;border-radius:26px;padding:10px}.bk-spot__form input{padding:14px 16px}.bk-spot__form .bk-pbtn{width:100%}}`,
    js: `document.querySelectorAll('.bk-spot').forEach(function (root) {
  if (window.matchMedia && window.matchMedia('(hover:hover)').matches) {
    root.addEventListener('pointermove', function (e) {
      var r = root.getBoundingClientRect();
      root.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      root.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  }
  var form = root.querySelector('.bk-spot__form');
  var msg = root.querySelector('.bk-spot__msg');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = form.querySelector('input').checkValidity();
    if (msg) msg.textContent = ok ? 'You are on the list. Check your inbox!' : 'Please enter a valid email address.';
    // To really collect emails, send the value to your server or mailing service here.
    if (ok) form.reset();
  });
});`,
  },

  // ============================== PRO CARDS ==============================
  {
    id: 'pro-cards-tilt', category: 'Pro Cards', name: 'Cards: 3D tilt + glare',
    description: 'Three image cards that tilt toward the pointer with a moving glare, zooming photo and a sliding arrow button.',
    specs: ['Pointer-driven 3D tilt (max 9deg) with light glare', 'Photo zoom, tag slide-in, arrow button fills on hover', 'Tilt is disabled on touch and for reduced-motion users', '3 columns -> 2 -> 1 (1020px / 640px)', 'Whole card is one link (large touch target)'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-tc" id="services">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">What we do</span><h2>Services built around you</h2><p>Three short lines that explain the value of the cards below.</p></div>
    <div class="bk-tc__grid">
      <a class="bk-tc__card bk-rv" style="--i:0" href="#"><div class="bk-tc__img"><img src="${img('bk-tc1', 640, 480)}" alt="Strategy" loading="lazy"><span class="bk-tc__tag">Strategy</span></div><div class="bk-tc__body"><h3>Brand strategy</h3><p>Clear positioning and a story people remember. Written in two or three lines.</p><span class="bk-tc__go" aria-hidden="true">&rarr;</span></div></a>
      <a class="bk-tc__card bk-rv" style="--i:1" href="#"><div class="bk-tc__img"><img src="${img('bk-tc2', 640, 480)}" alt="Design" loading="lazy"><span class="bk-tc__tag">Design</span></div><div class="bk-tc__body"><h3>Product design</h3><p>Interfaces that feel obvious, fast and a little bit delightful to use every day.</p><span class="bk-tc__go" aria-hidden="true">&rarr;</span></div></a>
      <a class="bk-tc__card bk-rv" style="--i:2" href="#"><div class="bk-tc__img"><img src="${img('bk-tc3', 640, 480)}" alt="Engineering" loading="lazy"><span class="bk-tc__tag">Build</span></div><div class="bk-tc__body"><h3>Web engineering</h3><p>Fast, accessible, well tested code that your team can keep growing for years.</p><span class="bk-tc__go" aria-hidden="true">&rarr;</span></div></a>
    </div>
  </div>
</section>`,
    css: `.bk-tc{background:var(--bk-soft)}
.bk-tc__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(18px,2.4vw,32px);perspective:1200px}
.bk-tc__card{--rx:0deg;--ry:0deg;--gx:50%;--gy:50%;position:relative;display:block;overflow:hidden;border-radius:var(--bk-r);background:#fff;color:inherit;text-decoration:none;box-shadow:var(--bk-sh);transform:rotateX(var(--rx)) rotateY(var(--ry));transform-style:preserve-3d;transition:transform .5s var(--bk-ease),box-shadow .5s var(--bk-ease)}
.bk-tc__card.is-tilting{transition:transform .08s linear,box-shadow .5s}
.bk-tc__card::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(420px circle at var(--gx) var(--gy),rgba(255,255,255,.55),transparent 55%);opacity:0;transition:opacity .4s;mix-blend-mode:soft-light}
.bk-tc__card:hover::after{opacity:1}
.bk-tc__card:hover{box-shadow:0 34px 60px -26px rgba(11,18,32,.5)}
.bk-tc__card:focus-visible{outline:3px solid var(--bk-a);outline-offset:4px}
.bk-tc__img{position:relative;overflow:hidden;aspect-ratio:4/3}
.bk-tc__img img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s var(--bk-ease)}
.bk-tc__card:hover .bk-tc__img img{transform:scale(1.1)}
.bk-tc__tag{position:absolute;left:16px;top:16px;padding:6px 14px;border-radius:999px;background:rgba(255,255,255,.92);font-size:12.5px;font-weight:700;color:var(--bk-a-d);transform:translateY(-8px);opacity:.0;transition:transform .5s var(--bk-ease),opacity .4s}
.bk-tc__card:hover .bk-tc__tag,.bk-tc__card:focus-visible .bk-tc__tag{transform:none;opacity:1}
.bk-tc__body{position:relative;padding:26px 28px 30px;transform:translateZ(30px)}
.bk-tc__body h3{font-size:clamp(20px,2vw,24px);margin-bottom:10px}
.bk-tc__body p{color:var(--bk-mut);padding-right:48px}
.bk-tc__go{position:absolute;right:24px;bottom:26px;display:grid;place-items:center;width:44px;height:44px;border-radius:50%;background:var(--bk-a-l);color:var(--bk-a);font-size:18px;transition:background .35s,color .35s,transform .5s var(--bk-ease)}
.bk-tc__card:hover .bk-tc__go{background:var(--bk-a);color:#fff;transform:rotate(-45deg)}
@media (max-width:1020px){.bk-tc__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:640px){.bk-tc__grid{grid-template-columns:1fr}.bk-tc__tag{opacity:1;transform:none}}`,
    js: `document.querySelectorAll('.bk-tc').forEach(function (root) {
  var canTilt = window.matchMedia && window.matchMedia('(hover:hover)').matches && !window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  if (!canTilt) return;
  root.querySelectorAll('.bk-tc__card').forEach(function (card) {
    card.addEventListener('pointermove', function (e) {
      var r = card.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width;
      var y = (e.clientY - r.top) / r.height;
      card.classList.add('is-tilting');
      card.style.setProperty('--ry', ((x - 0.5) * 18).toFixed(2) + 'deg');
      card.style.setProperty('--rx', ((0.5 - y) * 14).toFixed(2) + 'deg');
      card.style.setProperty('--gx', (x * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', (y * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', function () {
      card.classList.remove('is-tilting');
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
    });
  });
});`,
  },
  {
    id: 'pro-cards-flip', category: 'Pro Cards', name: 'Cards: flip on hover (4)',
    description: 'Four service cards with an icon on the front and details on the back. They flip on hover, keyboard focus, or tap on phones.',
    specs: ['True 3D flip (backface-visibility), 0.8s ease', 'Works with mouse, keyboard (Tab + Enter) and touch (tap)', 'Gradient back face using your accent color', '4 columns -> 2 -> 1', 'aria-pressed updated on every flip'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-fl" id="services">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Our expertise</span><h2>Hover to discover more</h2><p>Front shows the idea, back shows the proof. Tap on mobile.</p></div>
    <div class="bk-fl__grid">
      <div class="bk-fl__card bk-rv" style="--i:0" tabindex="0" role="button" aria-pressed="false"><div class="bk-fl__in"><div class="bk-fl__face bk-fl__front"><span class="bk-fl__ic">${IC.bolt}</span><h3>Fast delivery</h3><p>Launch in weeks, not months.</p></div><div class="bk-fl__face bk-fl__back"><h3>Fast delivery</h3><p>Agile sprints, weekly demos and a clear roadmap keep every project moving.</p><a href="#">Learn more &rarr;</a></div></div></div>
      <div class="bk-fl__card bk-rv" style="--i:1" tabindex="0" role="button" aria-pressed="false"><div class="bk-fl__in"><div class="bk-fl__face bk-fl__front"><span class="bk-fl__ic">${IC.shield}</span><h3>Secure by design</h3><p>Safety built in from day one.</p></div><div class="bk-fl__face bk-fl__back"><h3>Secure by design</h3><p>Encrypted data, role-based access and regular audits protect your customers.</p><a href="#">Learn more &rarr;</a></div></div></div>
      <div class="bk-fl__card bk-rv" style="--i:2" tabindex="0" role="button" aria-pressed="false"><div class="bk-fl__in"><div class="bk-fl__face bk-fl__front"><span class="bk-fl__ic">${IC.layers}</span><h3>Scalable stack</h3><p>Grows when you grow.</p></div><div class="bk-fl__face bk-fl__back"><h3>Scalable stack</h3><p>Clean architecture and cloud-ready services that handle ten users or ten million.</p><a href="#">Learn more &rarr;</a></div></div></div>
      <div class="bk-fl__card bk-rv" style="--i:3" tabindex="0" role="button" aria-pressed="false"><div class="bk-fl__in"><div class="bk-fl__face bk-fl__front"><span class="bk-fl__ic">${IC.heart}</span><h3>Human support</h3><p>Real people, real answers.</p></div><div class="bk-fl__face bk-fl__back"><h3>Human support</h3><p>A dedicated manager and a reply within hours, not days. We stay after launch.</p><a href="#">Learn more &rarr;</a></div></div></div>
    </div>
  </div>
</section>`,
    css: `.bk-fl__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(16px,2vw,28px)}
.bk-fl__card{perspective:1100px;min-height:300px;outline:0;cursor:pointer}
.bk-fl__in{position:relative;height:100%;min-height:300px;transform-style:preserve-3d;transition:transform .8s var(--bk-ease)}
@media (hover:hover){.bk-fl__card:hover .bk-fl__in{transform:rotateY(180deg)}}
.bk-fl__card:focus-visible .bk-fl__in,.bk-fl__card.is-flipped .bk-fl__in{transform:rotateY(180deg)}
.bk-fl__card:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:4px;border-radius:var(--bk-r)}
.bk-fl__face{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:10px;padding:28px;text-align:center;border-radius:var(--bk-r);-webkit-backface-visibility:hidden;backface-visibility:hidden}
.bk-fl__front{background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh)}
.bk-fl__ic{display:grid;place-items:center;width:68px;height:68px;margin-bottom:10px;border-radius:22px;background:var(--bk-a-l);color:var(--bk-a);transition:transform .6s var(--bk-ease)}
.bk-fl__ic svg{width:30px;height:30px}
.bk-fl__front h3{font-size:21px}
.bk-fl__front p{color:var(--bk-mut);font-size:15px}
.bk-fl__back{transform:rotateY(180deg);background:linear-gradient(150deg,var(--bk-a),var(--bk-a-d));color:#fff;box-shadow:0 30px 50px -24px var(--bk-a)}
.bk-fl__back h3{font-size:21px}
.bk-fl__back p{font-size:15px;line-height:1.65;color:rgba(255,255,255,.88)}
.bk-fl__back a{margin-top:8px;padding:9px 18px;border-radius:999px;background:rgba(255,255,255,.18);color:#fff;font-size:14px;font-weight:600;text-decoration:none;transition:background .3s,color .3s}
.bk-fl__back a:hover{background:#fff;color:var(--bk-a-d)}
@media (max-width:1100px){.bk-fl__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:560px){.bk-fl__grid{grid-template-columns:1fr}.bk-fl__card,.bk-fl__in{min-height:270px}}`,
    js: `document.querySelectorAll('.bk-fl').forEach(function (root) {
  root.querySelectorAll('.bk-fl__card').forEach(function (card) {
    function flip(force) {
      var on = typeof force === 'boolean' ? force : !card.classList.contains('is-flipped');
      card.classList.toggle('is-flipped', on);
      card.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
    card.addEventListener('click', function (e) { if (e.target.closest('a')) return; flip(); });
    card.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
    });
  });
});`,
  },
  {
    id: 'pro-team', category: 'Pro Cards', name: 'Team: portrait cards + social slide-up',
    description: 'Tall portrait cards. On hover the photo scales, the info panel rises, corner brackets draw in and social icons slide up one by one.',
    specs: ['Portrait 4:5 photos with gradient scrim', 'Staggered social icons (transition-delay per icon)', 'Corner brackets animate in on hover/focus', '4 columns -> 2 -> 1', 'Info stays visible on touch devices'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-tm" id="team">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">The team</span><h2>People behind the work</h2><p>Small, senior and obsessed with the details.</p></div>
    <div class="bk-tm__grid">
      <article class="bk-tm__card bk-rv" style="--i:0" tabindex="0"><img src="${img('bk-tm1', 480, 600)}" alt="Aarav Mehta" loading="lazy"><div class="bk-tm__info"><h3>Aarav Mehta</h3><p>Founder &amp; CEO</p><div class="bk-tm__soc"><a href="#" aria-label="LinkedIn">${IC.in}</a><a href="#" aria-label="X">${IC.x}</a><a href="#" aria-label="Email">${IC.mail}</a></div></div></article>
      <article class="bk-tm__card bk-rv" style="--i:1" tabindex="0"><img src="${img('bk-tm2', 480, 600)}" alt="Diya Nair" loading="lazy"><div class="bk-tm__info"><h3>Diya Nair</h3><p>Head of Design</p><div class="bk-tm__soc"><a href="#" aria-label="LinkedIn">${IC.in}</a><a href="#" aria-label="X">${IC.x}</a><a href="#" aria-label="Email">${IC.mail}</a></div></div></article>
      <article class="bk-tm__card bk-rv" style="--i:2" tabindex="0"><img src="${img('bk-tm3', 480, 600)}" alt="Karthik Raja" loading="lazy"><div class="bk-tm__info"><h3>Karthik Raja</h3><p>Lead Engineer</p><div class="bk-tm__soc"><a href="#" aria-label="LinkedIn">${IC.in}</a><a href="#" aria-label="X">${IC.x}</a><a href="#" aria-label="Email">${IC.mail}</a></div></div></article>
      <article class="bk-tm__card bk-rv" style="--i:3" tabindex="0"><img src="${img('bk-tm4', 480, 600)}" alt="Meera Iyer" loading="lazy"><div class="bk-tm__info"><h3>Meera Iyer</h3><p>Client Success</p><div class="bk-tm__soc"><a href="#" aria-label="LinkedIn">${IC.in}</a><a href="#" aria-label="X">${IC.x}</a><a href="#" aria-label="Email">${IC.mail}</a></div></div></article>
    </div>
  </div>
</section>`,
    css: `.bk-tm__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2vw,26px)}
.bk-tm__card{position:relative;overflow:hidden;aspect-ratio:4/5;border-radius:var(--bk-r);background:#0b1220;outline:0;isolation:isolate}
.bk-tm__card img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--bk-ease),filter .6s}
.bk-tm__card::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,transparent 45%,rgba(6,11,24,.88));transition:opacity .5s}
.bk-tm__card::after{content:"";position:absolute;inset:14px;z-index:2;border-radius:calc(var(--bk-r) - 8px);pointer-events:none;border:1.5px solid transparent;border-image:none;opacity:0;transform:scale(1.06);transition:opacity .5s,transform .6s var(--bk-ease);border-color:rgba(255,255,255,.65)}
.bk-tm__card:hover img,.bk-tm__card:focus-visible img{transform:scale(1.09);filter:saturate(1.1)}
.bk-tm__card:hover::after,.bk-tm__card:focus-visible::after{opacity:1;transform:none}
.bk-tm__card:focus-visible{box-shadow:0 0 0 3px var(--bk-a)}
.bk-tm__info{position:absolute;z-index:3;left:0;right:0;bottom:0;padding:24px;color:#fff;transform:translateY(54px);transition:transform .6s var(--bk-ease)}
.bk-tm__card:hover .bk-tm__info,.bk-tm__card:focus-visible .bk-tm__info{transform:none}
.bk-tm__info h3{font-size:21px}
.bk-tm__info p{font-size:14px;color:#c9d4ea}
.bk-tm__soc{display:flex;gap:10px;margin-top:16px}
.bk-tm__soc a{display:grid;place-items:center;width:38px;height:38px;border-radius:50%;background:rgba(255,255,255,.16);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;opacity:0;transform:translateY(18px);transition:opacity .4s,transform .55s var(--bk-ease),background .3s,color .3s}
.bk-tm__soc a:nth-child(2){transition-delay:.06s}
.bk-tm__soc a:nth-child(3){transition-delay:.12s}
.bk-tm__card:hover .bk-tm__soc a,.bk-tm__card:focus-visible .bk-tm__soc a,.bk-tm__card:focus-within .bk-tm__soc a{opacity:1;transform:none}
.bk-tm__soc a:hover{background:#fff;color:var(--bk-a);transform:translateY(-4px)}
@media (hover:none){.bk-tm__info{transform:none}.bk-tm__soc a{opacity:1;transform:none}}
@media (max-width:1000px){.bk-tm__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:480px){.bk-tm__grid{grid-template-columns:1fr;max-width:380px;margin:0 auto}}`,
    js: '',
  },

  // ============================== PRO SECTIONS ==============================
  {
    id: 'pro-bento', category: 'Pro Sections', name: 'Bento grid with glow border',
    description: 'Trendy bento layout of six tiles with different sizes. A soft light follows the pointer across each tile border.',
    specs: ['CSS Grid, 6 columns, tiles span 2/3/4 columns', 'Pointer glow per tile (CSS variables --mx / --my)', 'Mini visuals: animated bars, big number, image, icon', '6 cols -> 2 cols (980px) -> 1 col (600px)', 'Hover lift and border highlight'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-bn" id="features">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Features</span><h2>Everything in one place</h2><p>A bento layout shows many ideas at a glance without feeling crowded.</p></div>
    <div class="bk-bn__grid">
      <article class="bk-bn__it bk-bn__it--w bk-rv" style="--i:0"><span class="bk-bn__ic">${IC.chart}</span><h3>Live analytics</h3><p>See what matters the moment it happens, with clean charts and zero setup.</p><div class="bk-bn__bars" aria-hidden="true"><i style="--h:38%"></i><i style="--h:62%"></i><i style="--h:48%"></i><i style="--h:80%"></i><i style="--h:66%"></i><i style="--h:94%"></i><i style="--h:72%"></i></div></article>
      <article class="bk-bn__it bk-bn__it--n bk-rv" style="--i:1"><h3 class="bk-bn__big">99.9%</h3><p>Uptime guaranteed across every region.</p></article>
      <article class="bk-bn__it bk-bn__it--n bk-rv" style="--i:2"><span class="bk-bn__ic">${IC.shield}</span><h3>Private</h3><p>Your data stays yours. Always encrypted.</p></article>
      <article class="bk-bn__it bk-bn__it--img bk-rv" style="--i:3"><img src="${img('bk-bento', 700, 520)}" alt="Team at work" loading="lazy"><div class="bk-bn__cap"><h3>Made for teams</h3><p>Share, comment and ship together.</p></div></article>
      <article class="bk-bn__it bk-bn__it--w bk-rv" style="--i:4"><span class="bk-bn__ic">${IC.globe}</span><h3>Works everywhere</h3><p>Desktop, tablet and phone. One design that adapts to every screen and every connection.</p><ul class="bk-bn__tags"><li>Web</li><li>iOS</li><li>Android</li><li>API</li></ul></article>
    </div>
  </div>
</section>`,
    css: `.bk-bn{background:#fff}
.bk-bn__grid{display:grid;grid-template-columns:repeat(6,1fr);grid-auto-rows:minmax(220px,auto);gap:clamp(12px,1.6vw,20px)}
.bk-bn__it{--mx:50%;--my:50%;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;padding:clamp(22px,2.6vw,32px);border-radius:var(--bk-r);background:var(--bk-soft);border:1px solid var(--bk-line);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t) var(--bk-ease),border-color .3s}
.bk-bn__it::before{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(360px circle at var(--mx) var(--my),color-mix(in srgb,var(--bk-a) 16%,transparent),transparent 60%);opacity:0;transition:opacity .4s}
.bk-bn__it:hover{transform:translateY(var(--bk-lift));border-color:var(--bk-a-m);box-shadow:var(--bk-sh)}
.bk-bn__it:hover::before{opacity:1}
.bk-bn__it>*{position:relative}
.bk-bn__it--w{grid-column:span 3}
.bk-bn__it--n{grid-column:span 3}
.bk-bn__it--img{grid-column:span 3;padding:0;justify-content:flex-end;color:#fff;background:#0b1220}
.bk-bn__it:nth-child(1){grid-column:span 4;grid-row:span 2}
.bk-bn__it:nth-child(2),.bk-bn__it:nth-child(3){grid-column:span 2}
.bk-bn__it:nth-child(4){grid-column:span 3}
.bk-bn__it:nth-child(5){grid-column:span 3}
.bk-bn__ic{display:grid;place-items:center;width:52px;height:52px;margin-bottom:6px;border-radius:16px;background:#fff;color:var(--bk-a);box-shadow:0 6px 16px -8px rgba(11,18,32,.3);transition:transform .6s var(--bk-ease),background .3s,color .3s}
.bk-bn__it:hover .bk-bn__ic{transform:rotate(-8deg) scale(1.1);background:var(--bk-a);color:#fff}
.bk-bn__it h3{font-size:clamp(20px,2vw,26px)}
.bk-bn__it p{color:var(--bk-mut);max-width:440px}
.bk-bn__big{font-size:clamp(44px,6vw,72px)!important;letter-spacing:-.04em;background:linear-gradient(90deg,var(--bk-a),var(--bk-a2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.bk-bn__bars{flex:1;min-height:120px;display:flex;align-items:flex-end;gap:clamp(6px,1.4vw,16px);margin-top:18px}
.bk-bn__bars i{flex:1;height:var(--h);border-radius:10px 10px 4px 4px;background:linear-gradient(180deg,var(--bk-a),var(--bk-a-m));transform-origin:bottom;transform:scaleY(.25);transition:transform .9s var(--bk-ease)}
.bk-bn__it.is-in .bk-bn__bars i,.bk-bn__it:hover .bk-bn__bars i{transform:scaleY(1)}
.bk-bn__bars i:nth-child(2){transition-delay:.05s}.bk-bn__bars i:nth-child(3){transition-delay:.1s}.bk-bn__bars i:nth-child(4){transition-delay:.15s}.bk-bn__bars i:nth-child(5){transition-delay:.2s}.bk-bn__bars i:nth-child(6){transition-delay:.25s}.bk-bn__bars i:nth-child(7){transition-delay:.3s}
.bk-bn__it--img img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--bk-ease)}
.bk-bn__it--img:hover img{transform:scale(1.08)}
.bk-bn__it--img::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 30%,rgba(6,11,24,.85))}
.bk-bn__cap{position:relative;z-index:2;padding:clamp(22px,2.6vw,32px)}
.bk-bn__cap p{color:#d5def0}
.bk-bn__tags{display:flex;flex-wrap:wrap;gap:8px;list-style:none;margin:10px 0 0;padding:0}
.bk-bn__tags li{padding:7px 14px;border-radius:999px;background:#fff;border:1px solid var(--bk-line);font-size:13px;font-weight:600;transition:background .3s,color .3s,transform .4s var(--bk-ease)}
.bk-bn__tags li:hover{background:var(--bk-a);color:#fff;transform:translateY(-3px)}
@media (max-width:980px){.bk-bn__grid{grid-template-columns:repeat(2,1fr)}.bk-bn__it:nth-child(n){grid-column:span 1;grid-row:auto}.bk-bn__it:nth-child(1){grid-column:span 2}.bk-bn__it--img{min-height:300px}}
@media (max-width:600px){.bk-bn__grid{grid-template-columns:1fr}.bk-bn__it:nth-child(n){grid-column:auto}}`,
    js: `document.querySelectorAll('.bk-bn__it').forEach(function (it) {
  it.addEventListener('pointermove', function (e) {
    var r = it.getBoundingClientRect();
    it.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    it.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});`,
  },
  {
    id: 'pro-panels', category: 'Pro Sections', name: 'Expanding image panels',
    description: 'Four tall photo panels. Hover (or tap) one and it expands while the others shrink; its text fades in. Stacks on phones.',
    specs: ['Flex-grow transition 1 -> 4 (0.8s)', 'Hover, keyboard focus and tap all work (is-open class)', 'Vertical accordion layout under 800px', 'Gradient scrim keeps text readable on any photo', 'Rotated title on collapsed panels (desktop)'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-pn" id="services">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Explore</span><h2>Four ways we can help</h2><p>Move over a panel to open it.</p></div>
    <div class="bk-pn__row bk-rv" style="--i:1">
      <article class="bk-pn__it is-open" tabindex="0" style="--bg:url(${img('bk-pn1', 900, 1100)})"><span class="bk-pn__n">01</span><h3>Discover</h3><div class="bk-pn__txt"><p>We listen first. Workshops and research turn your goals into a clear plan.</p><a class="bk-pbtn bk-pbtn--light" href="#">Learn more ${AR}</a></div></article>
      <article class="bk-pn__it" tabindex="0" style="--bg:url(${img('bk-pn2', 900, 1100)})"><span class="bk-pn__n">02</span><h3>Design</h3><div class="bk-pn__txt"><p>Wireframes, visuals and prototypes you can click before anything is built.</p><a class="bk-pbtn bk-pbtn--light" href="#">Learn more ${AR}</a></div></article>
      <article class="bk-pn__it" tabindex="0" style="--bg:url(${img('bk-pn3', 900, 1100)})"><span class="bk-pn__n">03</span><h3>Develop</h3><div class="bk-pn__txt"><p>Clean, tested code shipped in small steps so you always see progress.</p><a class="bk-pbtn bk-pbtn--light" href="#">Learn more ${AR}</a></div></article>
      <article class="bk-pn__it" tabindex="0" style="--bg:url(${img('bk-pn4', 900, 1100)})"><span class="bk-pn__n">04</span><h3>Grow</h3><div class="bk-pn__txt"><p>Measure, learn and improve. We stay with you after launch.</p><a class="bk-pbtn bk-pbtn--light" href="#">Learn more ${AR}</a></div></article>
    </div>
  </div>
</section>`,
    css: `.bk-pn__row{display:flex;gap:clamp(8px,1.2vw,16px);height:clamp(440px,60vw,600px)}
.bk-pn__it{position:relative;overflow:hidden;flex:1 1 0;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(20px,2.4vw,32px);border-radius:var(--bk-r);background:#0b1220 var(--bg) center/cover no-repeat;color:#fff;cursor:pointer;outline:0;transition:flex-grow .8s var(--bk-ease)}
.bk-pn__it::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(6,11,24,.05) 20%,rgba(6,11,24,.9));transition:background .6s}
.bk-pn__it.is-open{flex-grow:4}
.bk-pn__it:focus-visible{box-shadow:0 0 0 3px var(--bk-a)}
.bk-pn__it>*{position:relative}
.bk-pn__n{position:absolute;top:22px;left:24px;font-size:14px;font-weight:700;letter-spacing:.14em;padding:6px 12px;border-radius:999px;background:rgba(255,255,255,.18);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.bk-pn__it h3{font-size:clamp(24px,2.6vw,34px);white-space:nowrap;transition:transform .6s var(--bk-ease)}
.bk-pn__txt{max-height:0;opacity:0;overflow:hidden;transform:translateY(16px);transition:max-height .8s var(--bk-ease),opacity .5s,transform .7s var(--bk-ease)}
.bk-pn__it.is-open .bk-pn__txt{max-height:240px;opacity:1;transform:none;transition-delay:.15s}
.bk-pn__txt p{max-width:440px;margin:12px 0 20px;color:#dbe4f5}
.bk-pn__it:not(.is-open):hover::before{background:linear-gradient(180deg,color-mix(in srgb,var(--bk-a) 25%,transparent),rgba(6,11,24,.85))}
@media (min-width:801px){.bk-pn__it:not(.is-open) h3{transform:rotate(-90deg) translate(-4px,-6px);transform-origin:left bottom;margin-bottom:60px}}
@media (max-width:800px){.bk-pn__row{flex-direction:column;height:auto}.bk-pn__it{flex:none;min-height:96px;justify-content:center;transition:min-height .8s var(--bk-ease)}.bk-pn__it.is-open{min-height:340px;justify-content:flex-end}.bk-pn__n{top:50%;transform:translateY(-50%)}.bk-pn__it.is-open .bk-pn__n{top:22px;transform:none}.bk-pn__it h3{margin-left:60px}.bk-pn__it.is-open h3{margin-left:0}}`,
    js: `document.querySelectorAll('.bk-pn__row').forEach(function (row) {
  var items = [].slice.call(row.querySelectorAll('.bk-pn__it'));
  function open(it) { items.forEach(function (x) { x.classList.toggle('is-open', x === it); }); }
  var hover = window.matchMedia && window.matchMedia('(hover:hover)').matches;
  items.forEach(function (it) {
    if (hover) it.addEventListener('mouseenter', function () { open(it); });
    it.addEventListener('focus', function () { open(it); });
    it.addEventListener('click', function (e) { if (!e.target.closest('a')) open(it); });
  });
});`,
  },
  {
    id: 'pro-tabs', category: 'Pro Sections', name: 'Tabs: sliding pill + panels',
    description: 'Pill tab bar with a sliding highlight. Each tab fades in a text + image panel. Arrow keys switch tabs.',
    specs: ['ARIA tablist / tab / tabpanel with roving tabindex', 'Left/Right/Home/End keys', 'Sliding indicator follows the active tab (resize-safe)', 'Panel image slides + fades on change', 'Tab bar scrolls sideways on narrow phones'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-tb" id="about">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">How it works</span><h2>From idea to launch</h2><p>Pick a step to see what happens.</p></div>
    <div class="bk-tb__list bk-rv" style="--i:1" role="tablist" aria-label="Steps"><span class="bk-tb__ind" aria-hidden="true"></span><button class="is-active" type="button" role="tab">Plan</button><button type="button" role="tab">Design</button><button type="button" role="tab">Build</button><button type="button" role="tab">Launch</button></div>
    <div class="bk-tb__panels bk-rv" style="--i:2">
      <div class="bk-tb__panel is-active" role="tabpanel"><div class="bk-tb__txt"><h3>Plan with clarity</h3><p>We turn goals into a simple roadmap with milestones, owners and dates. No jargon, no surprises.</p><ul><li>Kick-off workshop</li><li>User research</li><li>Scope and timeline</li></ul></div><div class="bk-tb__pic"><img src="${img('bk-tb1', 720, 520)}" alt="Planning" loading="lazy"></div></div>
      <div class="bk-tb__panel" role="tabpanel" hidden><div class="bk-tb__txt"><h3>Design with care</h3><p>Wireframes first, then polished screens. You review a clickable prototype before we write code.</p><ul><li>Wireframes</li><li>Visual design system</li><li>Clickable prototype</li></ul></div><div class="bk-tb__pic"><img src="${img('bk-tb2', 720, 520)}" alt="Design" loading="lazy"></div></div>
      <div class="bk-tb__panel" role="tabpanel" hidden><div class="bk-tb__txt"><h3>Build it right</h3><p>Small, tested releases every week. You always see real progress on a live staging link.</p><ul><li>Weekly demos</li><li>Automated testing</li><li>Performance budget</li></ul></div><div class="bk-tb__pic"><img src="${img('bk-tb3', 720, 520)}" alt="Build" loading="lazy"></div></div>
      <div class="bk-tb__panel" role="tabpanel" hidden><div class="bk-tb__txt"><h3>Launch and learn</h3><p>We deploy, monitor and train your team. After launch we measure results and keep improving.</p><ul><li>Smooth go-live</li><li>Team training</li><li>Monthly insights</li></ul></div><div class="bk-tb__pic"><img src="${img('bk-tb4', 720, 520)}" alt="Launch" loading="lazy"></div></div>
    </div>
  </div>
</section>`,
    css: `.bk-tb{background:var(--bk-soft)}
.bk-tb__list{position:relative;display:flex;width:max-content;max-width:100%;margin:0 auto clamp(28px,4vw,48px);padding:6px;border-radius:999px;background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh);overflow-x:auto;scrollbar-width:none}
.bk-tb__list::-webkit-scrollbar{display:none}
.bk-tb__list button{position:relative;z-index:1;flex:none;padding:12px clamp(18px,3vw,32px);border:0;border-radius:999px;background:transparent;color:var(--bk-mut);font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:color .3s}
.bk-tb__list button:hover{color:var(--bk-ink)}
.bk-tb__list button.is-active{color:#fff}
.bk-tb__list button:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:-3px}
.bk-tb__ind{position:absolute;z-index:0;top:6px;bottom:6px;left:0;width:0;border-radius:999px;background:var(--bk-a);box-shadow:0 10px 20px -8px var(--bk-a);transition:transform .55s var(--bk-ease),width .55s var(--bk-ease)}
.bk-tb__panel{display:grid;grid-template-columns:1fr 1fr;gap:clamp(24px,5vw,72px);align-items:center;padding:clamp(22px,4vw,48px);border-radius:calc(var(--bk-r) + 6px);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh)}
.bk-tb__panel[hidden]{display:none}
.bk-tb__panel.is-active .bk-tb__txt{animation:bk-tb-in .7s var(--bk-ease) both}
.bk-tb__panel.is-active .bk-tb__pic{animation:bk-tb-pic .9s var(--bk-ease) both}
@keyframes bk-tb-in{from{opacity:0;transform:translateX(-24px)}to{opacity:1;transform:none}}
@keyframes bk-tb-pic{from{opacity:0;transform:translateX(30px) scale(.96)}to{opacity:1;transform:none}}
.bk-tb__txt h3{font-size:clamp(24px,3vw,36px);margin-bottom:14px}
.bk-tb__txt p{color:var(--bk-mut);font-size:17px;margin-bottom:22px}
.bk-tb__txt ul{list-style:none;margin:0;padding:0;display:grid;gap:12px}
.bk-tb__txt li{position:relative;padding-left:34px;font-weight:600;transition:transform .35s var(--bk-ease)}
.bk-tb__txt li:hover{transform:translateX(6px)}
.bk-tb__txt li::before{content:"";position:absolute;left:0;top:2px;width:22px;height:22px;border-radius:50%;background:var(--bk-a-l) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23444' stroke-width='3.4' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 12.5l4 4 8-9'/%3E%3C/svg%3E") center/13px no-repeat}
.bk-tb__pic{overflow:hidden;border-radius:var(--bk-r)}
.bk-tb__pic img{width:100%;aspect-ratio:7/5;object-fit:cover;transition:transform 1.2s var(--bk-ease)}
.bk-tb__pic:hover img{transform:scale(1.06)}
@media (max-width:820px){.bk-tb__panel{grid-template-columns:1fr}.bk-tb__pic{order:-1}}`,
    js: `document.querySelectorAll('.bk-tb').forEach(function (root) {
  var tabs = [].slice.call(root.querySelectorAll('.bk-tb__list [role=tab]'));
  var panels = [].slice.call(root.querySelectorAll('.bk-tb__panel'));
  var ind = root.querySelector('.bk-tb__ind');
  var uid = 'bk-tb-' + Math.random().toString(36).slice(2, 7);
  tabs.forEach(function (t, i) {
    t.id = uid + '-t' + i; panels[i].id = uid + '-p' + i;
    t.setAttribute('aria-controls', panels[i].id); panels[i].setAttribute('aria-labelledby', t.id);
  });
  function move() {
    var a = root.querySelector('.bk-tb__list .is-active');
    if (a && ind) { ind.style.width = a.offsetWidth + 'px'; ind.style.transform = 'translateX(' + a.offsetLeft + 'px)'; }
  }
  function select(i, focus) {
    tabs.forEach(function (t, k) {
      var on = k === i;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      panels[k].hidden = !on;
      panels[k].classList.toggle('is-active', on);
    });
    if (focus) tabs[i].focus();
    move();
    if (tabs[i].scrollIntoView && root.querySelector('.bk-tb__list').scrollWidth > root.querySelector('.bk-tb__list').clientWidth) tabs[i].scrollIntoView({ block: 'nearest', inline: 'center' });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { select(i); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, k = -1;
      if (e.key === 'ArrowRight') k = (i + 1) % n;
      else if (e.key === 'ArrowLeft') k = (i - 1 + n) % n;
      else if (e.key === 'Home') k = 0;
      else if (e.key === 'End') k = n - 1;
      if (k > -1) { e.preventDefault(); select(k, true); }
    });
  });
  window.addEventListener('resize', move);
  select(0);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(move);
});`,
  },
];
