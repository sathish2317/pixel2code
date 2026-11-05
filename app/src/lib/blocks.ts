import { PlacedBlock, ProjectFile, SavedComponent, uid } from '../types';
import { PRO_CSS, PRO_JS } from './proShared';
import { PRO_A } from './proA';
import { PRO_B } from './proB';
import { PRO_C } from './proC';
import { PRO_D } from './proD';
import { PRO_E } from './proE';
import { PRO_F } from './proF';
import { formatCss, formatHtml, formatJs } from './format';

/**
 * Built-in code blocks. Every block is plain HTML + CSS (+ a little JS where it must move), with NO framework
 * and NO dependency, and every CSS rule starts with its own "bk-" class, so blocks can be mixed on one page
 * or pasted into any existing site without touching the rest of it.
 *
 * Images are picsum.photos placeholders. Replace them with your own (for example images/hero.jpg).
 * The accent color in the blocks is #2563eb; the Code Blocks screen can swap it for your brand color.
 */
export interface Block {
  id: string;
  category: string;
  name: string;
  description: string;
  html: string;
  css: string;
  js: string;
  shared?: string[]; // ids of SHARED css that this block needs (added once per page)
  specs?: string[]; // short technical specification list shown on the block card (Pro blocks)
  tags?: string[]; // extra type labels, for example 'E-commerce'. Other labels are worked out from the code by tagsOf()
}

export const ACCENT = '#2563eb';

export const SHARED: Record<string, string> = {
  base: `.bk-wrap{max-width:1200px;margin:0 auto;padding:0 20px}
.bk-sec{padding:72px 0}
.bk-head{text-align:center;max-width:680px;margin:0 auto 44px}
.bk-head h2{font-size:clamp(26px,4vw,38px);line-height:1.2;margin:0 0 12px;color:#0f172a}
.bk-head p{margin:0;color:#64748b;font-size:17px;line-height:1.6}
.bk-tag{display:inline-block;background:#eff6ff;color:#2563eb;font-weight:600;font-size:13px;padding:6px 12px;border-radius:999px;margin-bottom:14px}`,
  btn: `.bk-btn{display:inline-block;background:#2563eb;color:#fff;padding:12px 24px;border-radius:10px;font-size:16px;font-weight:600;line-height:1.2;font-family:inherit;text-decoration:none;border:2px solid #2563eb;cursor:pointer;transition:background .2s,color .2s,border-color .2s}
.bk-btn:hover{background:#1d4ed8;border-color:#1d4ed8}
.bk-btn--ghost{background:transparent;color:#2563eb}
.bk-btn--ghost:hover{background:#2563eb;color:#fff}
.bk-btn--light{background:#fff;color:#2563eb;border-color:#fff}
.bk-btn--light:hover{background:#eff6ff;border-color:#eff6ff}
.bk-btn--outline-light{background:transparent;color:#fff;border-color:#fff}
.bk-btn--outline-light:hover{background:#fff;color:#0f172a}`,
  form: `.bk-form{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:28px;display:grid;gap:16px;box-shadow:0 14px 34px rgba(15,23,42,.07)}
.bk-form__row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.bk-form label{display:grid;gap:6px;font-weight:600;font-size:14px;color:#334155}
.bk-form input,.bk-form textarea,.bk-form select{width:100%;padding:12px 14px;border:1px solid #cbd5e1;border-radius:10px;font-size:15px;line-height:1.4;font-family:inherit;color:#0f172a;background:#fff}
.bk-form input:focus,.bk-form textarea:focus,.bk-form select:focus{outline:2px solid #bfdbfe;border-color:#2563eb}
.bk-form .is-invalid{border-color:#dc2626}
.bk-form__msg{margin:0;font-weight:600;min-height:1.2em}
.bk-form__msg.is-ok{color:#15803d}
.bk-form__msg.is-error{color:#dc2626}
@media (max-width:560px){.bk-form__row{grid-template-columns:1fr}}`,
  // design tokens, premium button, scroll-reveal and reduced-motion rules used by every Pro block (see proShared.ts)
  pro: PRO_CSS,
};

/** Scripts that a shared id needs once per page (written once, at the top). */
export const SHARED_JS: Record<string, string> = { pro: PRO_JS };

// ---------------------------------------------------------------------------------------------
// Page theme: three switches that re-skin every Pro block through CSS variables
// ---------------------------------------------------------------------------------------------
export interface Theme {
  radius: 'sharp' | 'soft' | 'round';
  font: 'sans' | 'serif';
  motion: 'full' | 'subtle' | 'off';
}
export const DEFAULT_THEME: Theme = { radius: 'round', font: 'sans', motion: 'full' };

export function themeCss(t: Theme = DEFAULT_THEME): string {
  const v: string[] = [];
  if (t.radius === 'sharp') v.push('--bk-r:4px', '--bk-br:4px');
  if (t.radius === 'soft') v.push('--bk-r:14px', '--bk-br:12px');
  if (t.font === 'serif') v.push('--bk-hf:Georgia,"Times New Roman",serif');
  if (t.motion === 'subtle') v.push('--bk-t:.25s', '--bk-lift:-2px');
  const out: string[] = [];
  if (v.length) out.push(`.bk-p{${v.join(';')}}`);
  if (t.motion === 'off') out.push('.bk-p *,.bk-p *::before,.bk-p *::after{animation:none!important;transition:none!important}\n.bk-js .bk-rv{opacity:1;transform:none}');
  return out.join('\n');
}

// One script for every form block. Identical scripts are written only once when blocks are combined.
const FORM_JS = `document.querySelectorAll('.bk-form').forEach(function (form) {
  var msg = form.querySelector('.bk-form__msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('input,textarea,select').forEach(function (f) {
      var bad = !f.checkValidity();
      f.classList.toggle('is-invalid', bad);
      if (bad) ok = false;
    });
    if (!msg) return;
    msg.className = 'bk-form__msg ' + (ok ? 'is-ok' : 'is-error');
    msg.textContent = ok ? 'Thank you! We received your message.' : 'Please fill in the highlighted fields.';
    // This only checks the form in the browser. To really send it, replace this part with a fetch() to your server or form service.
    if (ok) form.reset();
  });
});`;

const img = (seed: string, w: number, h: number) => `https://picsum.photos/seed/${seed}/${w}/${h}`;
const CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
const icon = (path: string) => `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
const I_SHIELD = icon('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>');
const I_BOLT = icon('<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>');
const I_HEART = icon('<path d="M12 21s-8-5-8-11a4.5 4.5 0 018-2.8A4.5 4.5 0 0120 10c0 6-8 11-8 11z"/>');
const I_STAR = icon('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>');

export const BLOCKS: Block[] = [
  // ============================== NAVBAR ==============================
  {
    id: 'topbar', category: 'Navbar', name: 'Top info bar', description: 'Thin dark strip above the menu: phone, hours, social links.',
    html: `<div class="bk-topbar" id="topbar">
  <div class="bk-topbar__in">
    <div class="bk-topbar__list"><span>Call: +91 00000 00000</span><span>Mon - Sat: 9:00 AM - 6:00 PM</span></div>
    <div class="bk-topbar__list"><a href="#">Facebook</a><a href="#">Instagram</a><a href="#">LinkedIn</a></div>
  </div>
</div>`,
    css: `.bk-topbar{background:#0f172a;color:#cbd5e1;font-size:13px}
.bk-topbar__in{max-width:1200px;margin:0 auto;padding:8px 20px;display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
.bk-topbar__list{display:flex;gap:18px;flex-wrap:wrap}
.bk-topbar a{color:inherit;text-decoration:none}
.bk-topbar a:hover{color:#fff}`,
    js: '',
  },
  {
    id: 'navbar', category: 'Navbar', name: 'Navbar with mobile menu', description: 'Sticky logo + links + call-to-action button, collapses to a hamburger on phones.',
    html: `<header class="bk-navbar" id="header">
  <div class="bk-navbar__in">
    <a class="bk-navbar__logo" href="#">Brand<span>.</span></a>
    <button class="bk-navbar__toggle" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
    <nav class="bk-navbar__menu">
      <a class="is-active" href="#home">Home</a>
      <a href="#about">About</a>
      <a href="#services">Services</a>
      <a href="#contact">Contact</a>
      <a class="bk-navbar__cta" href="#contact">Get started</a>
    </nav>
  </div>
</header>`,
    css: `.bk-navbar{position:sticky;top:0;z-index:50;background:#fff;border-bottom:1px solid #e2e8f0}
.bk-navbar__in{max-width:1200px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;position:relative}
.bk-navbar__logo{font-size:22px;font-weight:800;color:#0f172a;text-decoration:none}
.bk-navbar__logo span{color:#2563eb}
.bk-navbar__menu{display:flex;align-items:center;gap:6px}
.bk-navbar__menu a{padding:8px 14px;border-radius:8px;color:#334155;text-decoration:none;font-weight:500}
.bk-navbar__menu a:hover,.bk-navbar__menu a.is-active{color:#2563eb;background:#eff6ff}
.bk-navbar__menu a.bk-navbar__cta{background:#2563eb;color:#fff;margin-left:8px}
.bk-navbar__menu a.bk-navbar__cta:hover{background:#1d4ed8}
.bk-navbar__toggle{display:none;background:none;border:0;padding:8px;cursor:pointer}
.bk-navbar__toggle span{display:block;width:24px;height:2px;background:#0f172a;margin:5px 0}
@media (max-width:820px){
  .bk-navbar__toggle{display:block}
  .bk-navbar__menu{display:none;position:absolute;top:100%;left:0;right:0;flex-direction:column;align-items:stretch;background:#fff;padding:12px 20px 18px;border-bottom:1px solid #e2e8f0;box-shadow:0 12px 24px rgba(15,23,42,.08)}
  .bk-navbar.is-open .bk-navbar__menu{display:flex}
  .bk-navbar__menu a.bk-navbar__cta{margin:6px 0 0;text-align:center}
}`,
    js: `document.querySelectorAll('.bk-navbar').forEach(function (nav) {
  var btn = nav.querySelector('.bk-navbar__toggle');
  if (!btn) return;
  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { setOpen(!nav.classList.contains('is-open')); });
  nav.querySelectorAll('.bk-navbar__menu a').forEach(function (a) {
    a.addEventListener('click', function () { setOpen(false); });
  });
});`,
  },

  // ============================== BANNER ==============================
  {
    id: 'hero-split', category: 'Banner', name: 'Hero: text + image', description: 'Headline, text and two buttons on the left, big image on the right.',
    shared: ['btn'],
    html: `<section class="bk-hero" id="home">
  <div class="bk-hero__in">
    <div class="bk-hero__text">
      <span class="bk-hero__tag">Welcome</span>
      <h1>Build something people love</h1>
      <p>One clear sentence that explains what you do and who it is for. Keep it short and honest.</p>
      <div class="bk-hero__btns">
        <a class="bk-btn" href="#contact">Get started</a>
        <a class="bk-btn bk-btn--ghost" href="#about">Learn more</a>
      </div>
    </div>
    <div class="bk-hero__img"><img src="${img('bk-hero', 720, 520)}" alt="Hero image"></div>
  </div>
</section>`,
    css: `.bk-hero{background:linear-gradient(135deg,#eff6ff,#fff);padding:72px 0}
.bk-hero__in{max-width:1200px;margin:0 auto;padding:0 20px;display:grid;grid-template-columns:1.1fr .9fr;gap:48px;align-items:center}
.bk-hero__tag{display:inline-block;background:#dbeafe;color:#2563eb;font-weight:600;font-size:13px;padding:6px 12px;border-radius:999px;margin-bottom:16px}
.bk-hero h1{font-size:clamp(34px,5.5vw,58px);line-height:1.1;margin:0 0 18px;color:#0f172a}
.bk-hero p{font-size:18px;line-height:1.7;color:#475569;margin:0 0 28px;max-width:520px}
.bk-hero__btns{display:flex;gap:12px;flex-wrap:wrap}
.bk-hero__img img{width:100%;height:auto;display:block;border-radius:20px;box-shadow:0 24px 48px rgba(15,23,42,.18)}
@media (max-width:860px){.bk-hero__in{grid-template-columns:1fr}.bk-hero__img{order:-1}}`,
    js: '',
  },
  {
    id: 'hero-bg', category: 'Banner', name: 'Hero: centered on photo', description: 'Full-width photo background with a dark overlay and centered text.',
    shared: ['btn'],
    html: `<section class="bk-herobg" id="home">
  <div class="bk-herobg__in">
    <h1>Your headline goes here</h1>
    <p>A short supporting line that tells visitors what to do next.</p>
    <div class="bk-herobg__btns">
      <a class="bk-btn bk-btn--light" href="#contact">Book now</a>
      <a class="bk-btn bk-btn--outline-light" href="#services">Our services</a>
    </div>
  </div>
</section>`,
    css: `.bk-herobg{background:linear-gradient(rgba(15,23,42,.62),rgba(15,23,42,.62)),url(${img('bk-herobg', 1600, 800)}) center/cover no-repeat;color:#fff;text-align:center;padding:130px 0}
.bk-herobg__in{max-width:820px;margin:0 auto;padding:0 20px}
.bk-herobg h1{font-size:clamp(34px,6vw,64px);line-height:1.1;margin:0 0 18px}
.bk-herobg p{font-size:19px;line-height:1.6;margin:0 0 30px;color:#e2e8f0}
.bk-herobg__btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}`,
    js: '',
  },
  {
    id: 'hero-slider', category: 'Banner', name: 'Banner slider', description: 'Three full-width slides with arrows, dots and autoplay (pauses on hover).',
    shared: ['btn'],
    html: `<section class="bk-slider" id="banner" aria-roledescription="carousel" aria-label="Banner">
  <div class="bk-slider__slide is-active" style="background-image:url(${img('bk-s1', 1600, 700)})">
    <div class="bk-slider__cap"><h2>First slide title</h2><p>Short text for the first slide.</p><a class="bk-btn" href="#">Learn more</a></div>
  </div>
  <div class="bk-slider__slide" style="background-image:url(${img('bk-s2', 1600, 700)})">
    <div class="bk-slider__cap"><h2>Second slide title</h2><p>Short text for the second slide.</p><a class="bk-btn" href="#">Learn more</a></div>
  </div>
  <div class="bk-slider__slide" style="background-image:url(${img('bk-s3', 1600, 700)})">
    <div class="bk-slider__cap"><h2>Third slide title</h2><p>Short text for the third slide.</p><a class="bk-btn" href="#">Learn more</a></div>
  </div>
  <button class="bk-slider__arrow bk-slider__arrow--prev" type="button" aria-label="Previous slide">&#10094;</button>
  <button class="bk-slider__arrow bk-slider__arrow--next" type="button" aria-label="Next slide">&#10095;</button>
  <div class="bk-slider__dots"></div>
</section>`,
    css: `.bk-slider{position:relative;height:clamp(360px,60vw,620px);overflow:hidden;background:#0f172a}
.bk-slider__slide{position:absolute;inset:0;background-size:cover;background-position:center;opacity:0;visibility:hidden;transition:opacity .7s ease,visibility .7s}
.bk-slider__slide.is-active{opacity:1;visibility:visible}
.bk-slider__slide::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(15,23,42,.75),rgba(15,23,42,.15))}
.bk-slider__cap{position:relative;max-width:1200px;margin:0 auto;height:100%;padding:0 72px;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;color:#fff}
.bk-slider__cap h2{font-size:clamp(28px,5vw,52px);line-height:1.1;margin:0 0 12px;max-width:620px}
.bk-slider__cap p{font-size:18px;margin:0 0 24px;color:#e2e8f0;max-width:520px}
.bk-slider__arrow{position:absolute;top:50%;transform:translateY(-50%);width:46px;height:46px;border-radius:50%;border:0;background:rgba(255,255,255,.9);color:#0f172a;font-size:18px;cursor:pointer;z-index:3}
.bk-slider__arrow:hover{background:#fff}
.bk-slider__arrow--prev{left:16px}
.bk-slider__arrow--next{right:16px}
.bk-slider__dots{position:absolute;left:0;right:0;bottom:18px;display:flex;justify-content:center;gap:8px;z-index:3}
.bk-slider__dots button{width:11px;height:11px;border-radius:50%;border:0;padding:0;background:rgba(255,255,255,.5);cursor:pointer}
.bk-slider__dots button.is-active{background:#fff;width:28px;border-radius:6px}
@media (max-width:640px){.bk-slider__cap{padding:0 28px}.bk-slider__arrow{display:none}}`,
    js: `document.querySelectorAll('.bk-slider').forEach(function (root) {
  var slides = root.querySelectorAll('.bk-slider__slide');
  var dotsBox = root.querySelector('.bk-slider__dots');
  var index = 0, timer = null;
  if (slides.length < 2) return;
  var dots = [];
  slides.forEach(function (_s, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    d.addEventListener('click', function () { show(i); restart(); });
    dotsBox.appendChild(d);
    dots.push(d);
  });
  function show(i) {
    index = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('is-active', k === index); });
    dots.forEach(function (d, k) { d.classList.toggle('is-active', k === index); });
  }
  function restart() { stop(); timer = setInterval(function () { show(index + 1); }, 5000); }
  function stop() { if (timer) clearInterval(timer); timer = null; }
  root.querySelector('.bk-slider__arrow--prev').addEventListener('click', function () { show(index - 1); restart(); });
  root.querySelector('.bk-slider__arrow--next').addEventListener('click', function () { show(index + 1); restart(); });
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', restart);
  show(0);
  restart();
});`,
  },
  {
    id: 'page-banner', category: 'Banner', name: 'Inner page title banner', description: 'Page title with breadcrumb for About, Services, Contact pages.',
    html: `<section class="bk-pagebanner" id="page-banner">
  <div class="bk-pagebanner__in">
    <h1>About Us</h1>
    <nav class="bk-pagebanner__crumbs" aria-label="Breadcrumb"><a href="#">Home</a><span>/</span><span>About Us</span></nav>
  </div>
</section>`,
    css: `.bk-pagebanner{background:linear-gradient(rgba(15,23,42,.7),rgba(15,23,42,.7)),url(${img('bk-pagebanner', 1600, 400)}) center/cover no-repeat;color:#fff;text-align:center;padding:80px 20px}
.bk-pagebanner h1{font-size:clamp(30px,5vw,48px);margin:0 0 12px}
.bk-pagebanner__crumbs{display:flex;justify-content:center;gap:10px;font-size:15px;color:#cbd5e1}
.bk-pagebanner__crumbs a{color:#fff;text-decoration:none}
.bk-pagebanner__crumbs a:hover{text-decoration:underline}`,
    js: '',
  },

  // ============================== CARDS ==============================
  {
    id: 'cards-3', category: 'Cards', name: 'Image cards (3 columns)', description: 'Three cards with photo, title, text and a read-more link.',
    shared: ['base'],
    html: `<section class="bk-sec bk-cards" id="cards">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Our work</span><h2>Section title</h2><p>A short sentence that introduces the cards below.</p></div>
    <div class="bk-cards__grid">
      <article class="bk-card">
        <img src="${img('bk-card1', 600, 400)}" alt="Card one">
        <div class="bk-card__body"><h3>Card title one</h3><p>Two lines of text that describe this card in a friendly way.</p><a class="bk-card__link" href="#">Read more &rarr;</a></div>
      </article>
      <article class="bk-card">
        <img src="${img('bk-card2', 600, 400)}" alt="Card two">
        <div class="bk-card__body"><h3>Card title two</h3><p>Two lines of text that describe this card in a friendly way.</p><a class="bk-card__link" href="#">Read more &rarr;</a></div>
      </article>
      <article class="bk-card">
        <img src="${img('bk-card3', 600, 400)}" alt="Card three">
        <div class="bk-card__body"><h3>Card title three</h3><p>Two lines of text that describe this card in a friendly way.</p><a class="bk-card__link" href="#">Read more &rarr;</a></div>
      </article>
    </div>
  </div>
</section>`,
    css: `.bk-cards__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:26px}
.bk-card{background:#fff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;transition:transform .25s,box-shadow .25s}
.bk-card:hover{transform:translateY(-6px);box-shadow:0 18px 36px rgba(15,23,42,.12)}
.bk-card img{display:block;width:100%;aspect-ratio:3/2;object-fit:cover}
.bk-card__body{padding:22px}
.bk-card__body h3{margin:0 0 8px;font-size:20px;color:#0f172a}
.bk-card__body p{margin:0 0 14px;color:#64748b;line-height:1.6}
.bk-card__link{color:#2563eb;font-weight:600;text-decoration:none}
.bk-card__link:hover{text-decoration:underline}`,
    js: '',
  },
  {
    id: 'cards-icons', category: 'Cards', name: 'Icon cards (4 columns)', description: 'Four small cards with an icon, title and text. Good for "Why choose us".',
    shared: ['base'],
    html: `<section class="bk-sec bk-icards" id="why-us">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Why choose us</span><h2>Reasons people trust us</h2><p>Four short points. Change the icons, titles and text.</p></div>
    <div class="bk-icards__grid">
      <div class="bk-icard"><div class="bk-icard__ico">${I_SHIELD}</div><h3>Trusted</h3><p>Short text about trust and safety.</p></div>
      <div class="bk-icard"><div class="bk-icard__ico">${I_BOLT}</div><h3>Fast</h3><p>Short text about speed and delivery.</p></div>
      <div class="bk-icard"><div class="bk-icard__ico">${I_HEART}</div><h3>Caring</h3><p>Short text about service and care.</p></div>
      <div class="bk-icard"><div class="bk-icard__ico">${I_STAR}</div><h3>Quality</h3><p>Short text about quality and results.</p></div>
    </div>
  </div>
</section>`,
    css: `.bk-icards{background:#f8fafc}
.bk-icards__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:22px}
.bk-icard{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:30px 24px;text-align:center;transition:transform .25s,box-shadow .25s}
.bk-icard:hover{transform:translateY(-5px);box-shadow:0 16px 32px rgba(15,23,42,.1)}
.bk-icard__ico{width:64px;height:64px;border-radius:50%;background:#eff6ff;color:#2563eb;display:flex;align-items:center;justify-content:center;margin:0 auto 16px}
.bk-icard h3{margin:0 0 8px;font-size:19px;color:#0f172a}
.bk-icard p{margin:0;color:#64748b;line-height:1.6}`,
    js: '',
  },
  {
    id: 'team', category: 'Cards', name: 'Team / doctors (round photos)', description: 'Four people with round photo, name and role.',
    shared: ['base'],
    html: `<section class="bk-sec bk-team" id="team">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Our team</span><h2>Meet the people</h2><p>The experts behind the work.</p></div>
    <div class="bk-team__grid">
      <div class="bk-person"><img src="${img('bk-p1', 400, 400)}" alt="Person one"><h3>Full Name</h3><span>Role or speciality</span></div>
      <div class="bk-person"><img src="${img('bk-p2', 400, 400)}" alt="Person two"><h3>Full Name</h3><span>Role or speciality</span></div>
      <div class="bk-person"><img src="${img('bk-p3', 400, 400)}" alt="Person three"><h3>Full Name</h3><span>Role or speciality</span></div>
      <div class="bk-person"><img src="${img('bk-p4', 400, 400)}" alt="Person four"><h3>Full Name</h3><span>Role or speciality</span></div>
    </div>
  </div>
</section>`,
    css: `.bk-team__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:28px}
.bk-person{text-align:center}
.bk-person img{width:170px;height:170px;border-radius:50%;object-fit:cover;border:5px solid #eff6ff;box-shadow:0 10px 24px rgba(15,23,42,.14);margin-bottom:16px}
.bk-person h3{margin:0 0 4px;font-size:19px;color:#0f172a}
.bk-person span{color:#2563eb;font-weight:500;font-size:15px}`,
    js: '',
  },
  {
    id: 'blog-cards', category: 'Cards', name: 'Blog / news cards', description: 'Three posts with date badge, title and short excerpt.',
    shared: ['base'],
    html: `<section class="bk-sec bk-blog" id="blog">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Latest news</span><h2>From our blog</h2><p>Updates, tips and stories.</p></div>
    <div class="bk-blog__grid">
      <article class="bk-post"><div class="bk-post__img"><img src="${img('bk-b1', 600, 380)}" alt="Post one"><span class="bk-post__date">12 Jan</span></div><div class="bk-post__body"><h3>Post title goes here</h3><p>A short excerpt that gives a taste of the article.</p><a href="#">Continue reading</a></div></article>
      <article class="bk-post"><div class="bk-post__img"><img src="${img('bk-b2', 600, 380)}" alt="Post two"><span class="bk-post__date">28 Jan</span></div><div class="bk-post__body"><h3>Post title goes here</h3><p>A short excerpt that gives a taste of the article.</p><a href="#">Continue reading</a></div></article>
      <article class="bk-post"><div class="bk-post__img"><img src="${img('bk-b3', 600, 380)}" alt="Post three"><span class="bk-post__date">05 Feb</span></div><div class="bk-post__body"><h3>Post title goes here</h3><p>A short excerpt that gives a taste of the article.</p><a href="#">Continue reading</a></div></article>
    </div>
  </div>
</section>`,
    css: `.bk-blog__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:26px}
.bk-post{border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;background:#fff}
.bk-post__img{position:relative}
.bk-post__img img{display:block;width:100%;aspect-ratio:16/10;object-fit:cover}
.bk-post__date{position:absolute;left:14px;top:14px;background:#2563eb;color:#fff;font-weight:600;font-size:13px;padding:6px 12px;border-radius:8px}
.bk-post__body{padding:22px}
.bk-post__body h3{margin:0 0 8px;font-size:20px;color:#0f172a}
.bk-post__body p{margin:0 0 12px;color:#64748b;line-height:1.6}
.bk-post__body a{color:#2563eb;font-weight:600;text-decoration:none}`,
    js: '',
  },

  // ============================== FEATURES ==============================
  {
    id: 'about-split', category: 'Features', name: 'About: image + checklist', description: 'Photo on the left, heading, text and a checklist on the right.',
    shared: ['base', 'btn'],
    html: `<section class="bk-sec bk-about" id="about">
  <div class="bk-wrap bk-about__in">
    <div class="bk-about__img"><img src="${img('bk-about', 640, 520)}" alt="About us"></div>
    <div class="bk-about__text">
      <span class="bk-tag">About us</span>
      <h2>We help you reach your goals</h2>
      <p>A paragraph about who you are, what you believe in and why customers choose you.</p>
      <ul class="bk-about__list">
        <li>${CHECK}<span>First strong point</span></li>
        <li>${CHECK}<span>Second strong point</span></li>
        <li>${CHECK}<span>Third strong point</span></li>
      </ul>
      <a class="bk-btn" href="#contact">Contact us</a>
    </div>
  </div>
</section>`,
    css: `.bk-about__in{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
.bk-about__img img{display:block;width:100%;height:auto;border-radius:20px;box-shadow:0 20px 44px rgba(15,23,42,.16)}
.bk-about__text h2{font-size:clamp(26px,4vw,38px);line-height:1.2;margin:0 0 14px;color:#0f172a}
.bk-about__text p{color:#64748b;font-size:17px;line-height:1.7;margin:0 0 20px}
.bk-about__list{list-style:none;margin:0 0 28px;padding:0;display:grid;gap:12px}
.bk-about__list li{display:flex;gap:10px;align-items:center;color:#334155;font-weight:500}
@media (max-width:860px){.bk-about__in{grid-template-columns:1fr;gap:32px}}`,
    js: '',
  },
  {
    id: 'services-grid', category: 'Features', name: 'Services grid (6 tiles)', description: 'Six numbered service tiles in a responsive grid.',
    shared: ['base'],
    html: `<section class="bk-sec bk-services" id="services">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">What we do</span><h2>Our services</h2><p>Pick the services that fit you best.</p></div>
    <div class="bk-services__grid">
      <div class="bk-service"><b>01</b><h3>Service one</h3><p>Short description of this service.</p></div>
      <div class="bk-service"><b>02</b><h3>Service two</h3><p>Short description of this service.</p></div>
      <div class="bk-service"><b>03</b><h3>Service three</h3><p>Short description of this service.</p></div>
      <div class="bk-service"><b>04</b><h3>Service four</h3><p>Short description of this service.</p></div>
      <div class="bk-service"><b>05</b><h3>Service five</h3><p>Short description of this service.</p></div>
      <div class="bk-service"><b>06</b><h3>Service six</h3><p>Short description of this service.</p></div>
    </div>
  </div>
</section>`,
    css: `.bk-services{background:#f8fafc}
.bk-services__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:22px}
.bk-service{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;transition:border-color .2s,transform .2s}
.bk-service:hover{border-color:#2563eb;transform:translateY(-4px)}
.bk-service b{display:block;font-size:34px;color:#bfdbfe;margin-bottom:10px}
.bk-service h3{margin:0 0 8px;font-size:20px;color:#0f172a}
.bk-service p{margin:0;color:#64748b;line-height:1.6}`,
    js: '',
  },
  {
    id: 'stats', category: 'Features', name: 'Counters (numbers)', description: 'Four big numbers that count up when scrolled into view.',
    html: `<section class="bk-stats" id="stats">
  <div class="bk-stats__in">
    <div class="bk-stat"><strong data-count="1200" data-suffix="+">0</strong><span>Happy clients</span></div>
    <div class="bk-stat"><strong data-count="15" data-suffix="+">0</strong><span>Years of experience</span></div>
    <div class="bk-stat"><strong data-count="48" data-suffix="">0</strong><span>Team members</span></div>
    <div class="bk-stat"><strong data-count="99" data-suffix="%">0</strong><span>Satisfaction</span></div>
  </div>
</section>`,
    css: `.bk-stats{background:#2563eb;color:#fff;padding:56px 20px}
.bk-stats__in{max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:24px;text-align:center}
.bk-stat strong{display:block;font-size:clamp(34px,5vw,52px);line-height:1.1}
.bk-stat span{display:block;margin-top:6px;color:#dbeafe;font-size:16px}`,
    js: `document.querySelectorAll('.bk-stats').forEach(function (root) {
  var nums = root.querySelectorAll('[data-count]');
  function run(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null, duration = 1600;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      el.textContent = Math.round(target * p) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!('IntersectionObserver' in window)) {
    nums.forEach(function (el) { el.textContent = el.getAttribute('data-count') + (el.getAttribute('data-suffix') || ''); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.4 });
  nums.forEach(function (el) { io.observe(el); });
});`,
  },

  // ============================== TESTIMONIALS ==============================
  {
    id: 'testimonials-3', category: 'Testimonials', name: 'Testimonial cards (3)', description: 'Three customer quotes with photo, name and role.',
    shared: ['base'],
    html: `<section class="bk-sec bk-quotes" id="testimonials">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Testimonials</span><h2>What people say</h2><p>Real words from real customers.</p></div>
    <div class="bk-quotes__grid">
      <figure class="bk-quote"><blockquote>A short, honest quote from a happy customer about their experience.</blockquote><figcaption><img src="${img('bk-q1', 100, 100)}" alt=""><span><b>Customer name</b><small>City or role</small></span></figcaption></figure>
      <figure class="bk-quote"><blockquote>A short, honest quote from a happy customer about their experience.</blockquote><figcaption><img src="${img('bk-q2', 100, 100)}" alt=""><span><b>Customer name</b><small>City or role</small></span></figcaption></figure>
      <figure class="bk-quote"><blockquote>A short, honest quote from a happy customer about their experience.</blockquote><figcaption><img src="${img('bk-q3', 100, 100)}" alt=""><span><b>Customer name</b><small>City or role</small></span></figcaption></figure>
    </div>
  </div>
</section>`,
    css: `.bk-quotes{background:#f8fafc}
.bk-quotes__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:24px}
.bk-quote{margin:0;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:28px;display:flex;flex-direction:column;gap:20px}
.bk-quote blockquote{margin:0;color:#334155;font-size:17px;line-height:1.7}
.bk-quote blockquote::before{content:"\\201C";display:block;font-size:54px;line-height:.6;color:#2563eb;margin-bottom:8px}
.bk-quote figcaption{display:flex;align-items:center;gap:12px;margin-top:auto}
.bk-quote img{width:48px;height:48px;border-radius:50%;object-fit:cover}
.bk-quote b{display:block;color:#0f172a}
.bk-quote small{color:#64748b}`,
    js: '',
  },
  {
    id: 'testimonial-slider', category: 'Testimonials', name: 'Testimonial slider', description: 'One big quote at a time with previous / next buttons.',
    shared: ['base'],
    html: `<section class="bk-sec bk-tslider" id="testimonials">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Testimonials</span><h2>Kind words</h2></div>
    <div class="bk-tslider__box">
      <div class="bk-tslider__item is-active"><p>"First quote. Replace this with a real customer testimonial."</p><b>Customer one</b><small>Role, Company</small></div>
      <div class="bk-tslider__item"><p>"Second quote. Replace this with a real customer testimonial."</p><b>Customer two</b><small>Role, Company</small></div>
      <div class="bk-tslider__item"><p>"Third quote. Replace this with a real customer testimonial."</p><b>Customer three</b><small>Role, Company</small></div>
      <div class="bk-tslider__nav"><button type="button" class="bk-tslider__prev" aria-label="Previous">&#10094;</button><button type="button" class="bk-tslider__next" aria-label="Next">&#10095;</button></div>
    </div>
  </div>
</section>`,
    css: `.bk-tslider__box{max-width:760px;margin:0 auto;text-align:center;position:relative}
.bk-tslider__item{display:none}
.bk-tslider__item.is-active{display:block}
.bk-tslider__item p{font-size:clamp(19px,3vw,26px);line-height:1.6;color:#0f172a;margin:0 0 20px}
.bk-tslider__item b{display:block;color:#2563eb}
.bk-tslider__item small{color:#64748b}
.bk-tslider__nav{display:flex;justify-content:center;gap:12px;margin-top:28px}
.bk-tslider__nav button{width:44px;height:44px;border-radius:50%;border:1px solid #cbd5e1;background:#fff;cursor:pointer;color:#0f172a}
.bk-tslider__nav button:hover{background:#2563eb;border-color:#2563eb;color:#fff}`,
    js: `document.querySelectorAll('.bk-tslider').forEach(function (root) {
  var items = root.querySelectorAll('.bk-tslider__item');
  var i = 0;
  if (!items.length) return;
  function show(n) {
    i = (n + items.length) % items.length;
    items.forEach(function (it, k) { it.classList.toggle('is-active', k === i); });
  }
  root.querySelector('.bk-tslider__prev').addEventListener('click', function () { show(i - 1); });
  root.querySelector('.bk-tslider__next').addEventListener('click', function () { show(i + 1); });
});`,
  },

  // ============================== PRICING ==============================
  {
    id: 'pricing-3', category: 'Pricing', name: 'Pricing plans (3)', description: 'Three plans, the middle one highlighted.',
    shared: ['base', 'btn'],
    html: `<section class="bk-sec bk-pricing" id="pricing">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Pricing</span><h2>Simple plans</h2><p>Choose the plan that fits you.</p></div>
    <div class="bk-pricing__grid">
      <div class="bk-plan"><h3>Basic</h3><div class="bk-plan__price">$19<small>/month</small></div><ul><li>Feature one</li><li>Feature two</li><li>Feature three</li></ul><a class="bk-btn bk-btn--ghost" href="#contact">Choose Basic</a></div>
      <div class="bk-plan bk-plan--hot"><span class="bk-plan__badge">Popular</span><h3>Standard</h3><div class="bk-plan__price">$49<small>/month</small></div><ul><li>Everything in Basic</li><li>Feature four</li><li>Feature five</li><li>Feature six</li></ul><a class="bk-btn" href="#contact">Choose Standard</a></div>
      <div class="bk-plan"><h3>Premium</h3><div class="bk-plan__price">$99<small>/month</small></div><ul><li>Everything in Standard</li><li>Feature seven</li><li>Feature eight</li></ul><a class="bk-btn bk-btn--ghost" href="#contact">Choose Premium</a></div>
    </div>
  </div>
</section>`,
    css: `.bk-pricing__grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:24px;align-items:stretch}
.bk-plan{position:relative;background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:34px 28px;text-align:center;display:flex;flex-direction:column;gap:18px}
.bk-plan--hot{border:2px solid #2563eb;box-shadow:0 20px 44px rgba(37,99,235,.18)}
.bk-plan__badge{position:absolute;top:-13px;left:50%;transform:translateX(-50%);background:#2563eb;color:#fff;font-size:12px;font-weight:700;padding:5px 14px;border-radius:999px}
.bk-plan h3{margin:0;font-size:22px;color:#0f172a}
.bk-plan__price{font-size:46px;font-weight:800;color:#0f172a}
.bk-plan__price small{font-size:16px;font-weight:500;color:#64748b}
.bk-plan ul{list-style:none;margin:0;padding:0;display:grid;gap:10px;color:#475569;flex:1}
.bk-plan li{padding-bottom:10px;border-bottom:1px solid #f1f5f9}`,
    js: '',
  },

  // ============================== GALLERY / CAROUSEL ==============================
  {
    id: 'gallery-grid', category: 'Gallery', name: 'Photo gallery grid', description: 'Responsive photo grid with a zoom effect on hover.',
    shared: ['base'],
    html: `<section class="bk-sec bk-gallery" id="gallery">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Gallery</span><h2>Moments we are proud of</h2></div>
    <div class="bk-gallery__grid">
      <a href="#"><img src="${img('bk-g1', 600, 600)}" alt="Gallery 1"></a>
      <a href="#"><img src="${img('bk-g2', 600, 600)}" alt="Gallery 2"></a>
      <a href="#"><img src="${img('bk-g3', 600, 600)}" alt="Gallery 3"></a>
      <a href="#"><img src="${img('bk-g4', 600, 600)}" alt="Gallery 4"></a>
      <a href="#"><img src="${img('bk-g5', 600, 600)}" alt="Gallery 5"></a>
      <a href="#"><img src="${img('bk-g6', 600, 600)}" alt="Gallery 6"></a>
      <a href="#"><img src="${img('bk-g7', 600, 600)}" alt="Gallery 7"></a>
      <a href="#"><img src="${img('bk-g8', 600, 600)}" alt="Gallery 8"></a>
    </div>
  </div>
</section>`,
    css: `.bk-gallery__grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:14px}
.bk-gallery__grid a{display:block;overflow:hidden;border-radius:14px;aspect-ratio:1/1}
.bk-gallery__grid img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .4s}
.bk-gallery__grid a:hover img{transform:scale(1.08)}`,
    js: '',
  },
  {
    id: 'carousel-circles', category: 'Carousel', name: 'Carousel: round photos', description: 'Row of round photos with name and caption, scrolled by arrow buttons (achievers, doctors, clients).',
    shared: ['base'],
    html: `<section class="bk-sec bk-circles" id="achievers">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Achievers</span><h2>Our proud achievers</h2></div>
    <div class="bk-circles__box">
      <button class="bk-circles__arrow bk-circles__arrow--prev" type="button" aria-label="Previous">&#10094;</button>
      <div class="bk-circles__track">
        <div class="bk-circles__item"><img src="${img('bk-c1', 300, 300)}" alt="Person 1"><h3>Name One</h3><span>Achievement</span></div>
        <div class="bk-circles__item"><img src="${img('bk-c2', 300, 300)}" alt="Person 2"><h3>Name Two</h3><span>Achievement</span></div>
        <div class="bk-circles__item"><img src="${img('bk-c3', 300, 300)}" alt="Person 3"><h3>Name Three</h3><span>Achievement</span></div>
        <div class="bk-circles__item"><img src="${img('bk-c4', 300, 300)}" alt="Person 4"><h3>Name Four</h3><span>Achievement</span></div>
        <div class="bk-circles__item"><img src="${img('bk-c5', 300, 300)}" alt="Person 5"><h3>Name Five</h3><span>Achievement</span></div>
        <div class="bk-circles__item"><img src="${img('bk-c6', 300, 300)}" alt="Person 6"><h3>Name Six</h3><span>Achievement</span></div>
        <div class="bk-circles__item"><img src="${img('bk-c7', 300, 300)}" alt="Person 7"><h3>Name Seven</h3><span>Achievement</span></div>
      </div>
      <button class="bk-circles__arrow bk-circles__arrow--next" type="button" aria-label="Next">&#10095;</button>
    </div>
  </div>
</section>`,
    css: `.bk-circles__box{position:relative;padding:0 26px}
.bk-circles__track{display:flex;gap:28px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-behavior:smooth;padding:10px 4px 18px;scrollbar-width:none}
.bk-circles__track::-webkit-scrollbar{display:none}
.bk-circles__item{flex:0 0 180px;text-align:center;scroll-snap-align:start}
.bk-circles__item img{width:160px;height:160px;border-radius:50%;object-fit:cover;border:4px solid #fff;box-shadow:0 8px 22px rgba(15,23,42,.18);margin-bottom:12px}
.bk-circles__item h3{margin:0 0 2px;font-size:17px;color:#0f172a}
.bk-circles__item span{font-size:14px;color:#64748b}
.bk-circles__arrow{position:absolute;top:80px;width:42px;height:42px;border-radius:50%;border:1px solid #cbd5e1;background:#fff;color:#0f172a;cursor:pointer;z-index:2;box-shadow:0 4px 12px rgba(15,23,42,.12)}
.bk-circles__arrow:hover{background:#2563eb;border-color:#2563eb;color:#fff}
.bk-circles__arrow--prev{left:-6px}
.bk-circles__arrow--next{right:-6px}`,
    js: `document.querySelectorAll('.bk-circles').forEach(function (root) {
  var track = root.querySelector('.bk-circles__track');
  var prev = root.querySelector('.bk-circles__arrow--prev');
  var next = root.querySelector('.bk-circles__arrow--next');
  if (!track || !prev || !next) return;
  function step() {
    var item = track.querySelector('.bk-circles__item');
    return item ? item.getBoundingClientRect().width + 28 : 200;
  }
  prev.addEventListener('click', function () { track.scrollBy({ left: -step() * 2, behavior: 'smooth' }); });
  next.addEventListener('click', function () { track.scrollBy({ left: step() * 2, behavior: 'smooth' }); });
});`,
  },
  {
    id: 'logo-strip', category: 'Carousel', name: 'Partner logo strip', description: 'A row of partner / client logo boxes.',
    shared: ['base'],
    html: `<section class="bk-sec bk-logos" id="partners">
  <div class="bk-wrap">
    <div class="bk-head"><h2>Trusted by</h2></div>
    <div class="bk-logos__row">
      <div>Logo 1</div><div>Logo 2</div><div>Logo 3</div><div>Logo 4</div><div>Logo 5</div><div>Logo 6</div>
    </div>
  </div>
</section>`,
    css: `.bk-logos{padding:48px 0}
.bk-logos .bk-head{margin-bottom:26px}
.bk-logos__row{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:16px}
.bk-logos__row div{border:1px dashed #cbd5e1;border-radius:12px;height:70px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-weight:600}`,
    js: '',
  },

  // ============================== FORMS ==============================
  {
    id: 'contact-form', category: 'Form', name: 'Contact form', description: 'Name, email, phone, subject and message with validation and a thank-you message (no backend).',
    shared: ['base', 'btn', 'form'],
    html: `<section class="bk-sec bk-contact" id="contact">
  <div class="bk-wrap bk-contact__in">
    <div class="bk-contact__info">
      <span class="bk-tag">Contact</span>
      <h2>Let us talk</h2>
      <p>Tell us a little about what you need and we will reply soon.</p>
      <ul><li><b>Phone</b> +91 00000 00000</li><li><b>Email</b> hello@example.com</li><li><b>Address</b> Street, City, Country</li></ul>
    </div>
    <form class="bk-form" novalidate>
      <div class="bk-form__row">
        <label for="bk-name">Name<input id="bk-name" name="name" type="text" required placeholder="Your name"></label>
        <label for="bk-email">Email<input id="bk-email" name="email" type="email" required placeholder="you@example.com"></label>
      </div>
      <div class="bk-form__row">
        <label for="bk-phone">Phone<input id="bk-phone" name="phone" type="tel" placeholder="Phone number"></label>
        <label for="bk-subject">Subject<input id="bk-subject" name="subject" type="text" placeholder="How can we help?"></label>
      </div>
      <label for="bk-message">Message<textarea id="bk-message" name="message" rows="5" required placeholder="Write your message"></textarea></label>
      <button class="bk-btn" type="submit">Send message</button>
      <p class="bk-form__msg" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>`,
    css: `.bk-contact__in{display:grid;grid-template-columns:.9fr 1.1fr;gap:48px;align-items:start}
.bk-contact__info h2{font-size:clamp(26px,4vw,38px);margin:0 0 12px;color:#0f172a}
.bk-contact__info p{color:#64748b;line-height:1.7;margin:0 0 20px}
.bk-contact__info ul{list-style:none;margin:0;padding:0;display:grid;gap:10px;color:#334155}
.bk-contact__info li b{display:inline-block;min-width:72px;color:#0f172a}
@media (max-width:860px){.bk-contact__in{grid-template-columns:1fr}}`,
    js: FORM_JS,
  },
  {
    id: 'appointment-form', category: 'Form', name: 'Appointment booking form', description: 'Department, doctor, date and time. Good for clinics, salons and services.',
    shared: ['base', 'btn', 'form'],
    html: `<section class="bk-sec bk-appt" id="appointment">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">Appointment</span><h2>Book a visit</h2><p>Choose a day and time that suits you.</p></div>
    <form class="bk-form bk-appt__form" novalidate>
      <div class="bk-form__row">
        <label for="bk-a-name">Full name<input id="bk-a-name" name="name" type="text" required placeholder="Your name"></label>
        <label for="bk-a-phone">Phone<input id="bk-a-phone" name="phone" type="tel" required placeholder="Phone number"></label>
      </div>
      <div class="bk-form__row">
        <label for="bk-a-dept">Department<select id="bk-a-dept" name="department" required><option value="">Select</option><option>General</option><option>Cardiology</option><option>Dental</option><option>Pediatrics</option></select></label>
        <label for="bk-a-date">Date<input id="bk-a-date" name="date" type="date" required></label>
      </div>
      <div class="bk-form__row">
        <label for="bk-a-time">Time<input id="bk-a-time" name="time" type="time" required></label>
        <label for="bk-a-email">Email<input id="bk-a-email" name="email" type="email" placeholder="Optional"></label>
      </div>
      <label for="bk-a-note">Notes<textarea id="bk-a-note" name="notes" rows="3" placeholder="Anything we should know?"></textarea></label>
      <button class="bk-btn" type="submit">Book appointment</button>
      <p class="bk-form__msg" role="status" aria-live="polite"></p>
    </form>
  </div>
</section>`,
    css: `.bk-appt{background:#f8fafc}
.bk-appt__form{max-width:760px;margin:0 auto}`,
    js: FORM_JS,
  },
  {
    id: 'newsletter', category: 'Form', name: 'Newsletter signup', description: 'One-line email box with a subscribe button on a colored band.',
    shared: ['btn'],
    html: `<section class="bk-news" id="newsletter">
  <div class="bk-news__in">
    <div><h2>Stay in the loop</h2><p>Get news and offers in your inbox. No spam.</p></div>
    <form class="bk-news__form" novalidate>
      <input type="email" required placeholder="Your email address" aria-label="Email address">
      <button class="bk-btn bk-btn--light" type="submit">Subscribe</button>
    </form>
    <p class="bk-news__msg" role="status" aria-live="polite"></p>
  </div>
</section>`,
    css: `.bk-news{background:#0f172a;color:#fff;padding:56px 20px}
.bk-news__in{max-width:1000px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:20px 40px;align-items:center}
.bk-news h2{margin:0 0 6px;font-size:28px}
.bk-news p{margin:0;color:#cbd5e1}
.bk-news__form{display:flex;gap:10px}
.bk-news__form input{flex:1;min-width:0;padding:13px 16px;border-radius:10px;border:0;font-size:16px;font-weight:400;line-height:1.2;font-family:inherit}
.bk-news__msg{grid-column:1/-1;min-height:1.2em;font-weight:600}
@media (max-width:760px){.bk-news__in{grid-template-columns:1fr}.bk-news__form{flex-direction:column}}`,
    js: `document.querySelectorAll('.bk-news__form').forEach(function (form) {
  var msg = form.parentNode.querySelector('.bk-news__msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var input = form.querySelector('input');
    var ok = input.checkValidity();
    if (msg) msg.textContent = ok ? 'Thanks for subscribing!' : 'Please enter a valid email address.';
    // To really subscribe people, send the email to your server or mailing service here.
    if (ok) form.reset();
  });
});`,
  },
  {
    id: 'login-form', category: 'Form', name: 'Login card', description: 'Centered email + password card with a remember-me checkbox.',
    shared: ['btn'],
    html: `<section class="bk-login" id="login">
  <form class="bk-login__card" novalidate>
    <h2>Welcome back</h2>
    <p>Sign in to your account</p>
    <label for="bk-l-email">Email<input id="bk-l-email" type="email" required placeholder="you@example.com"></label>
    <label for="bk-l-pass">Password<input id="bk-l-pass" type="password" required minlength="6" placeholder="Your password"></label>
    <div class="bk-login__row"><label class="bk-login__check" for="bk-l-rem"><input id="bk-l-rem" type="checkbox"> Remember me</label><a href="#">Forgot password?</a></div>
    <button class="bk-btn" type="submit">Sign in</button>
    <p class="bk-login__msg" role="status" aria-live="polite"></p>
  </form>
</section>`,
    css: `.bk-login{background:#f1f5f9;padding:72px 20px;display:flex;justify-content:center}
.bk-login__card{width:100%;max-width:420px;background:#fff;border-radius:18px;padding:34px 30px;display:grid;gap:16px;box-shadow:0 20px 44px rgba(15,23,42,.1)}
.bk-login__card h2{margin:0;font-size:28px;color:#0f172a}
.bk-login__card p{margin:0;color:#64748b}
.bk-login__card label{display:grid;gap:6px;font-weight:600;font-size:14px;color:#334155}
.bk-login__card input[type=email],.bk-login__card input[type=password]{padding:12px 14px;border:1px solid #cbd5e1;border-radius:10px;font-size:15px;font-weight:400;line-height:1.4;font-family:inherit}
.bk-login__card input:focus{outline:2px solid #bfdbfe;border-color:#2563eb}
.bk-login__row{display:flex;justify-content:space-between;align-items:center;font-size:14px}
.bk-login__row a{color:#2563eb;text-decoration:none}
.bk-login__check{display:flex!important;grid-auto-flow:column;align-items:center;gap:8px!important;font-weight:500!important}
.bk-login__msg{min-height:1.2em;font-weight:600;color:#dc2626}`,
    js: `document.querySelectorAll('.bk-login__card').forEach(function (form) {
  var msg = form.querySelector('.bk-login__msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = form.checkValidity();
    if (msg) msg.textContent = ok ? '' : 'Enter a valid email and a password of at least 6 characters.';
    // Real sign-in must be checked on a server. Never store or check passwords in browser code.
  });
});`,
  },

  // ============================== FAQ / CTA ==============================
  {
    id: 'faq', category: 'FAQ', name: 'FAQ accordion', description: 'Questions that open and close. Pure HTML + CSS, no JavaScript.',
    shared: ['base'],
    html: `<section class="bk-sec bk-faq" id="faq">
  <div class="bk-wrap">
    <div class="bk-head"><span class="bk-tag">FAQ</span><h2>Frequently asked questions</h2></div>
    <div class="bk-faq__list">
      <details open><summary>First question goes here?</summary><p>The answer to the first question. Keep it short and clear.</p></details>
      <details><summary>Second question goes here?</summary><p>The answer to the second question. Keep it short and clear.</p></details>
      <details><summary>Third question goes here?</summary><p>The answer to the third question. Keep it short and clear.</p></details>
      <details><summary>Fourth question goes here?</summary><p>The answer to the fourth question. Keep it short and clear.</p></details>
    </div>
  </div>
</section>`,
    css: `.bk-faq__list{max-width:760px;margin:0 auto;display:grid;gap:12px}
.bk-faq details{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:0 20px}
.bk-faq summary{cursor:pointer;list-style:none;padding:18px 28px 18px 0;font-weight:600;color:#0f172a;position:relative}
.bk-faq summary::-webkit-details-marker{display:none}
.bk-faq summary::after{content:"+";position:absolute;right:0;top:50%;transform:translateY(-50%);font-size:24px;color:#2563eb}
.bk-faq details[open] summary::after{content:"-"}
.bk-faq details p{margin:0;padding:0 0 18px;color:#64748b;line-height:1.7}`,
    js: '',
  },
  {
    id: 'cta-band', category: 'CTA', name: 'Call-to-action band', description: 'Colored band with a headline and one button.',
    shared: ['btn'],
    html: `<section class="bk-cta" id="cta">
  <div class="bk-cta__in">
    <div><h2>Ready to get started?</h2><p>Tell us what you need and we will take it from there.</p></div>
    <a class="bk-btn bk-btn--light" href="#contact">Contact us today</a>
  </div>
</section>`,
    css: `.bk-cta{background:linear-gradient(135deg,#2563eb,#1d4ed8);color:#fff;padding:56px 20px}
.bk-cta__in{max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;gap:24px;flex-wrap:wrap}
.bk-cta h2{margin:0 0 6px;font-size:clamp(24px,4vw,34px)}
.bk-cta p{margin:0;color:#dbeafe;font-size:17px}`,
    js: '',
  },

  // ============================== FOOTER ==============================
  {
    id: 'footer-4col', category: 'Footer', name: 'Footer: 4 columns', description: 'Brand + about text, two link columns, contact column and a copyright bar.',
    html: `<footer class="bk-footer" id="footer">
  <div class="bk-footer__in">
    <div class="bk-footer__col"><a class="bk-footer__logo" href="#">Brand<span>.</span></a><p>One or two lines about your company and what you stand for.</p></div>
    <div class="bk-footer__col"><h4>Quick links</h4><a href="#">Home</a><a href="#">About</a><a href="#">Services</a><a href="#">Contact</a></div>
    <div class="bk-footer__col"><h4>Services</h4><a href="#">Service one</a><a href="#">Service two</a><a href="#">Service three</a><a href="#">Service four</a></div>
    <div class="bk-footer__col"><h4>Contact</h4><p>Street, City, Country</p><p>+91 00000 00000</p><p>hello@example.com</p></div>
  </div>
  <div class="bk-footer__bar">&copy; 2026 Your Company. All rights reserved.</div>
</footer>`,
    css: `.bk-footer{background:#0f172a;color:#cbd5e1}
.bk-footer__in{max-width:1200px;margin:0 auto;padding:56px 20px 36px;display:grid;grid-template-columns:1.4fr 1fr 1fr 1.2fr;gap:36px}
.bk-footer__logo{font-size:24px;font-weight:800;color:#fff;text-decoration:none;display:inline-block;margin-bottom:12px}
.bk-footer__logo span{color:#60a5fa}
.bk-footer__col h4{margin:0 0 14px;color:#fff;font-size:17px}
.bk-footer__col a{display:block;color:#cbd5e1;text-decoration:none;margin-bottom:9px}
.bk-footer__col a:hover{color:#fff}
.bk-footer__col p{margin:0 0 9px;line-height:1.6}
.bk-footer__bar{border-top:1px solid #1e293b;text-align:center;padding:18px 20px;font-size:14px;color:#94a3b8}
@media (max-width:900px){.bk-footer__in{grid-template-columns:1fr 1fr}}
@media (max-width:540px){.bk-footer__in{grid-template-columns:1fr}}`,
    js: '',
  },
  {
    id: 'footer-simple', category: 'Footer', name: 'Footer: simple', description: 'One line: logo, links and copyright.',
    html: `<footer class="bk-footer2" id="footer">
  <div class="bk-footer2__in">
    <a class="bk-footer2__logo" href="#">Brand<span>.</span></a>
    <nav><a href="#">Home</a><a href="#">About</a><a href="#">Services</a><a href="#">Contact</a></nav>
    <small>&copy; 2026 Your Company</small>
  </div>
</footer>`,
    css: `.bk-footer2{background:#fff;border-top:1px solid #e2e8f0}
.bk-footer2__in{max-width:1200px;margin:0 auto;padding:26px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;flex-wrap:wrap}
.bk-footer2__logo{font-size:20px;font-weight:800;color:#0f172a;text-decoration:none}
.bk-footer2__logo span{color:#2563eb}
.bk-footer2 nav{display:flex;gap:18px;flex-wrap:wrap}
.bk-footer2 nav a{color:#475569;text-decoration:none}
.bk-footer2 nav a:hover{color:#2563eb}
.bk-footer2 small{color:#64748b}`,
    js: '',
  },
];

BLOCKS.push(...PRO_A, ...PRO_B, ...PRO_C, ...PRO_D, ...PRO_E, ...PRO_F);

// Popup / modal collection: all examples are dependency-free and can be mixed on the page.
const POPUP_BLOCKS: Block[] = [
  {
    id: 'popup-pdf', category: 'Popups & Modals', name: 'PDF document popup', description: 'Open a PDF in an accessible modal with download and close actions.', tags: ['Interactive'],
    html: `<section class="bk-pdf-demo"><button class="bk-pdf-open" type="button" data-bk-pdf-open>View PDF document</button><div class="bk-pdf-modal" data-bk-pdf-modal hidden><button class="bk-pdf-backdrop" data-bk-pdf-close aria-label="Close PDF dialog"></button><div class="bk-pdf-dialog" role="dialog" aria-modal="true" aria-labelledby="bk-pdf-title"><header><div><p class="bk-pdf-kicker">DOCUMENT PREVIEW</p><h2 id="bk-pdf-title">Project brochure.pdf</h2></div><button class="bk-pdf-x" type="button" data-bk-pdf-close aria-label="Close">×</button></header><div class="bk-pdf-viewer"><iframe title="PDF document preview" src="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"></iframe></div><footer><span>PDF preview</span><a href="https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf" target="_blank" rel="noopener noreferrer" download>Download PDF ↗</a></footer></div></div></section>`,
    css: `.bk-pdf-demo{padding:24px;font-family:system-ui,sans-serif}.bk-pdf-open{border:0;border-radius:10px;background:#2563eb;color:#fff;padding:13px 20px;font-weight:700;cursor:pointer}.bk-pdf-modal[hidden]{display:none}.bk-pdf-modal{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:18px}.bk-pdf-backdrop{position:absolute;inset:0;width:100%;height:100%;border:0;background:rgba(15,23,42,.72);backdrop-filter:blur(5px);cursor:pointer}.bk-pdf-dialog{position:relative;z-index:1;background:#fff;width:min(960px,100%);height:min(84vh,760px);border-radius:18px;box-shadow:0 25px 90px #0005;display:flex;flex-direction:column;overflow:hidden}.bk-pdf-dialog header,.bk-pdf-dialog footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px}.bk-pdf-dialog header{border-bottom:1px solid #e2e8f0}.bk-pdf-dialog h2{font-size:18px;margin:2px 0;color:#0f172a}.bk-pdf-kicker{font-size:10px;letter-spacing:1.5px;color:#64748b;margin:0}.bk-pdf-x{border:0;background:#f1f5f9;border-radius:50%;width:36px;height:36px;font-size:25px;cursor:pointer}.bk-pdf-viewer{flex:1;min-height:0;background:#334155}.bk-pdf-viewer iframe{width:100%;height:100%;border:0}.bk-pdf-dialog footer{font-size:13px;color:#64748b;border-top:1px solid #e2e8f0}.bk-pdf-dialog footer a{color:#2563eb;font-weight:700;text-decoration:none}@media(max-width:600px){.bk-pdf-modal{padding:8px}.bk-pdf-dialog{height:90vh;border-radius:12px}.bk-pdf-dialog header,.bk-pdf-dialog footer{padding:12px}}`,
    js: `document.querySelectorAll('.bk-pdf-demo').forEach(function(root){var modal=root.querySelector('[data-bk-pdf-modal]');var opener=root.querySelector('[data-bk-pdf-open]');var previous=null;function close(){modal.hidden=true;document.body.style.overflow='';if(previous)previous.focus()}opener.addEventListener('click',function(){previous=document.activeElement;modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.bk-pdf-x').focus()});modal.querySelectorAll('[data-bk-pdf-close]').forEach(function(b){b.addEventListener('click',close)});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()})});`,
  },
  {
    id: 'popup-image-lightbox', category: 'Popups & Modals', name: 'Image lightbox popup', description: 'Click a gallery image to view it large with caption, backdrop close, and Escape support.', tags: ['Interactive'],
    html: `<section class="bk-lightbox"><p class="bk-lightbox-label">IMAGE GALLERY · CLICK TO ENLARGE</p><div class="bk-lightbox-grid"><button type="button" data-bk-image-open="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1600" data-bk-image-caption="Mountain lake at sunrise"><img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=500" alt="Mountain lake at sunrise"><span>View image ↗</span></button><button type="button" data-bk-image-open="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1600" data-bk-image-caption="Golden hour landscape"><img src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=500" alt="Golden hour landscape"><span>View image ↗</span></button><button type="button" data-bk-image-open="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600" data-bk-image-caption="Sunlight through the forest"><img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=500" alt="Sunlight through the forest"><span>View image ↗</span></button></div><div class="bk-lightbox-modal" data-bk-lightbox-modal hidden><button class="bk-lightbox-shade" type="button" data-bk-lightbox-close aria-label="Close image viewer"></button><figure role="dialog" aria-modal="true" aria-label="Image viewer"><button type="button" class="bk-lightbox-close" data-bk-lightbox-close aria-label="Close">×</button><img data-bk-lightbox-full alt=""><figcaption data-bk-lightbox-caption></figcaption></figure></div></section>`,
    css: `.bk-lightbox{padding:24px;font-family:system-ui,sans-serif}.bk-lightbox-label{font-size:11px;letter-spacing:1.4px;color:#64748b;font-weight:800}.bk-lightbox-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.bk-lightbox-grid button{position:relative;border:0;padding:0;border-radius:14px;overflow:hidden;cursor:zoom-in;background:#e2e8f0;min-height:130px}.bk-lightbox-grid img{display:block;width:100%;height:190px;object-fit:cover;transition:transform .35s}.bk-lightbox-grid button:hover img{transform:scale(1.06)}.bk-lightbox-grid span{position:absolute;bottom:0;left:0;right:0;padding:28px 12px 12px;color:#fff;text-align:left;font-size:13px;font-weight:700;background:linear-gradient(transparent,#0009)}.bk-lightbox-modal[hidden]{display:none}.bk-lightbox-modal{position:fixed;inset:0;z-index:10000;display:grid;place-items:center;padding:20px}.bk-lightbox-shade{position:absolute;inset:0;background:rgba(2,6,23,.9);border:0;cursor:zoom-out}.bk-lightbox-modal figure{position:relative;z-index:1;margin:0;max-width:min(1100px,100%);max-height:90vh;display:flex;flex-direction:column;align-items:center}.bk-lightbox-modal figure img{max-width:100%;max-height:78vh;object-fit:contain;border-radius:10px}.bk-lightbox-modal figcaption{color:#fff;padding:12px;font-size:14px}.bk-lightbox-close{position:absolute;right:10px;top:10px;z-index:2;border:0;border-radius:50%;width:38px;height:38px;background:#fff;color:#0f172a;font-size:26px;cursor:pointer}@media(max-width:600px){.bk-lightbox-grid{grid-template-columns:1fr}.bk-lightbox-grid img{height:220px}}`,
    js: `document.querySelectorAll('.bk-lightbox').forEach(function(root){var modal=root.querySelector('[data-bk-lightbox-modal]');var full=root.querySelector('[data-bk-lightbox-full]');var caption=root.querySelector('[data-bk-lightbox-caption]');var previous=null;root.querySelectorAll('[data-bk-image-open]').forEach(function(btn){btn.addEventListener('click',function(){previous=btn;full.src=btn.getAttribute('data-bk-image-open');full.alt=btn.getAttribute('data-bk-image-caption')||'Expanded image';caption.textContent=btn.getAttribute('data-bk-image-caption')||'';modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.bk-lightbox-close').focus()})});function close(){modal.hidden=true;full.removeAttribute('src');document.body.style.overflow='';if(previous)previous.focus()}modal.querySelectorAll('[data-bk-lightbox-close]').forEach(function(b){b.addEventListener('click',close)});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()})});`,
  },
  {
    id: 'popup-content-modal', category: 'Popups & Modals', name: 'Content / information modal', description: 'A flexible text modal for terms, service details, announcements, or long-form content.', tags: ['Interactive'],
    html: `<section class="bk-info-pop"><button type="button" class="bk-info-trigger" data-bk-info-open>Explore service details <span>↗</span></button><div class="bk-info-overlay" data-bk-info-modal hidden><button type="button" class="bk-info-backdrop" data-bk-info-close aria-label="Close information dialog"></button><article class="bk-info-dialog" role="dialog" aria-modal="true" aria-labelledby="bk-info-title"><div class="bk-info-icon">✦</div><button type="button" class="bk-info-close" data-bk-info-close aria-label="Close">×</button><p class="bk-info-eyebrow">A LITTLE MORE DETAIL</p><h2 id="bk-info-title">Built around your goals</h2><p class="bk-info-lead">Everything you need to make a confident decision, all in one place.</p><div class="bk-info-body"><p>Use this modal for service descriptions, product details, terms and conditions, announcements, or any content that deserves more space without navigating away.</p><ul><li>Clear and readable content</li><li>Responsive layout on mobile and desktop</li><li>Keyboard-friendly close behaviour</li></ul></div><button class="bk-info-action" type="button" data-bk-info-close>Got it, thanks</button></article></div></section>`,
    css: `.bk-info-pop{padding:28px;font-family:system-ui,sans-serif}.bk-info-trigger,.bk-info-action{border:0;border-radius:10px;background:#0f172a;color:#fff;padding:13px 18px;font-weight:750;cursor:pointer}.bk-info-trigger span{margin-left:18px}.bk-info-overlay[hidden]{display:none}.bk-info-overlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:18px}.bk-info-backdrop{position:absolute;inset:0;border:0;background:rgba(15,23,42,.55);backdrop-filter:blur(4px)}.bk-info-dialog{position:relative;background:#fff;width:min(560px,100%);max-height:85vh;overflow:auto;border-radius:22px;padding:34px;box-shadow:0 25px 90px #0003;color:#0f172a}.bk-info-icon{width:44px;height:44px;display:grid;place-items:center;background:#dbeafe;color:#2563eb;border-radius:14px;font-size:23px}.bk-info-close{position:absolute;right:20px;top:20px;width:36px;height:36px;border:0;border-radius:50%;background:#f1f5f9;font-size:24px;cursor:pointer}.bk-info-eyebrow{font-size:10px;letter-spacing:1.5px;font-weight:800;color:#2563eb;margin:24px 0 8px}.bk-info-dialog h2{font-size:clamp(24px,4vw,32px);letter-spacing:-.7px;margin:0 0 10px}.bk-info-lead{color:#475569;font-size:17px;line-height:1.55}.bk-info-body{border-top:1px solid #e2e8f0;margin-top:20px;padding-top:12px;color:#475569;line-height:1.7}.bk-info-body li{margin:7px 0}.bk-info-action{margin-top:12px;background:#2563eb}@media(max-width:480px){.bk-info-dialog{padding:24px;border-radius:16px}}`,
    js: `document.querySelectorAll('.bk-info-pop').forEach(function(root){var modal=root.querySelector('[data-bk-info-modal]');var opener=root.querySelector('[data-bk-info-open]');var previous=null;opener.addEventListener('click',function(){previous=opener;modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.bk-info-close').focus()});function close(){modal.hidden=true;document.body.style.overflow='';if(previous)previous.focus()}modal.querySelectorAll('[data-bk-info-close]').forEach(function(b){b.addEventListener('click',close)});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()})});`,
  },
  {
    id: 'popup-confirm-dialog', category: 'Popups & Modals', name: 'Confirmation dialog', description: 'Confirm or cancel a destructive action with clear button states.', tags: ['Interactive'],
    html: `<section class="bk-confirm-demo"><button type="button" class="bk-confirm-launch" data-bk-confirm-open>Delete item…</button><div class="bk-confirm-overlay" data-bk-confirm-modal hidden><button type="button" class="bk-confirm-shade" data-bk-confirm-cancel aria-label="Cancel"></button><div class="bk-confirm-card" role="alertdialog" aria-modal="true" aria-labelledby="bk-confirm-title" aria-describedby="bk-confirm-copy"><div class="bk-confirm-symbol">!</div><h2 id="bk-confirm-title">Delete this item?</h2><p id="bk-confirm-copy">This action cannot be undone. The selected item will be permanently removed.</p><div class="bk-confirm-actions"><button type="button" data-bk-confirm-cancel class="bk-confirm-cancel">Cancel</button><button type="button" data-bk-confirm-yes class="bk-confirm-delete">Delete item</button></div></div></div><p class="bk-confirm-status" data-bk-confirm-status aria-live="polite"></p></section>`,
    css: `.bk-confirm-demo{padding:28px;font-family:system-ui,sans-serif}.bk-confirm-launch,.bk-confirm-delete{border:0;border-radius:9px;background:#dc2626;color:#fff;padding:12px 17px;font-weight:750;cursor:pointer}.bk-confirm-overlay[hidden]{display:none}.bk-confirm-overlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:18px}.bk-confirm-shade{position:absolute;inset:0;border:0;background:#0f172a99;backdrop-filter:blur(3px)}.bk-confirm-card{position:relative;width:min(430px,100%);background:#fff;padding:28px;border-radius:18px;box-shadow:0 24px 70px #0004;color:#0f172a}.bk-confirm-symbol{width:44px;height:44px;display:grid;place-items:center;border-radius:50%;background:#fee2e2;color:#b91c1c;font-size:25px;font-weight:900}.bk-confirm-card h2{font-size:22px;margin:18px 0 8px}.bk-confirm-card p{color:#64748b;line-height:1.6;margin:0}.bk-confirm-actions{display:flex;justify-content:flex-end;gap:10px;margin-top:26px;flex-wrap:wrap}.bk-confirm-cancel{border:1px solid #cbd5e1;border-radius:9px;background:#fff;color:#334155;padding:11px 16px;font-weight:700;cursor:pointer}.bk-confirm-status{color:#15803d;font-weight:700}.bk-confirm-delete{background:#dc2626}`, 
    js: `document.querySelectorAll('.bk-confirm-demo').forEach(function(root){var modal=root.querySelector('[data-bk-confirm-modal]');var status=root.querySelector('[data-bk-confirm-status]');var opener=root.querySelector('[data-bk-confirm-open]');opener.addEventListener('click',function(){modal.hidden=false;modal.querySelector('[data-bk-confirm-cancel]').focus()});function close(){modal.hidden=true;opener.focus()}modal.querySelectorAll('[data-bk-confirm-cancel]').forEach(function(b){b.addEventListener('click',close)});modal.querySelector('[data-bk-confirm-yes]').addEventListener('click',function(){status.textContent='Demo action confirmed. Connect your own delete handler here.';close()});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()})});`,
  },
  {
    id: 'popup-video-modal', category: 'Popups & Modals', name: 'Video popup', description: 'Open an embedded video in a responsive modal; close the popup to stop playback.', tags: ['Interactive'],
    html: `<section class="bk-video-pop"><button type="button" class="bk-video-open" data-bk-video-open><span class="bk-video-play">▶</span><span><b>Watch the overview</b><small>2 min · Product introduction</small></span></button><div class="bk-video-overlay" data-bk-video-modal hidden><button type="button" class="bk-video-shade" data-bk-video-close aria-label="Close video"></button><div class="bk-video-dialog" role="dialog" aria-modal="true" aria-label="Video player"><button type="button" class="bk-video-x" data-bk-video-close aria-label="Close">×</button><div class="bk-video-frame"><iframe data-bk-video-frame title="Product overview video" src="" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div><p>Product overview · Replace the video URL with your own embed link.</p></div></div></section>`,
    css: `.bk-video-pop{padding:26px;font-family:system-ui,sans-serif}.bk-video-open{display:flex;align-items:center;gap:14px;text-align:left;border:1px solid #e2e8f0;background:#fff;padding:16px 20px;border-radius:15px;cursor:pointer;box-shadow:0 10px 28px #0f172a0d}.bk-video-play{width:48px;height:48px;display:grid;place-items:center;background:#2563eb;color:#fff;border-radius:50%;padding-left:3px}.bk-video-open b,.bk-video-open small{display:block}.bk-video-open b{color:#0f172a;font-size:15px}.bk-video-open small{color:#64748b;margin-top:4px}.bk-video-overlay[hidden]{display:none}.bk-video-overlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:20px}.bk-video-shade{position:absolute;inset:0;background:#020617e8;border:0}.bk-video-dialog{position:relative;width:min(1000px,100%);background:#0f172a;border-radius:16px;overflow:hidden;color:#cbd5e1;box-shadow:0 25px 90px #0008}.bk-video-x{position:absolute;right:10px;top:10px;z-index:2;width:38px;height:38px;border:0;border-radius:50%;background:#fff;color:#0f172a;font-size:25px;cursor:pointer}.bk-video-frame{aspect-ratio:16/9;background:#020617}.bk-video-frame iframe{width:100%;height:100%;border:0}.bk-video-dialog>p{margin:0;padding:12px 16px;font-size:12px}@media(max-width:600px){.bk-video-overlay{padding:8px}.bk-video-dialog{border-radius:10px}}`,
    js: `document.querySelectorAll('.bk-video-pop').forEach(function(root){var modal=root.querySelector('[data-bk-video-modal]');var frame=root.querySelector('[data-bk-video-frame]');var opener=root.querySelector('[data-bk-video-open]');var embed='https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1';opener.addEventListener('click',function(){modal.hidden=false;frame.src=embed;modal.querySelector('.bk-video-x').focus()});function close(){modal.hidden=true;frame.src='';opener.focus()}modal.querySelectorAll('[data-bk-video-close]').forEach(function(b){b.addEventListener('click',close)});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()})});`,
  },
  {
    id: 'popup-cookie-consent', category: 'Popups & Modals', name: 'Cookie consent popup', description: 'Cookie preference panel with accept, reject, and settings actions (demo storage only).', tags: ['Interactive'],
    html: `<section class="bk-cookie-demo"><button type="button" class="bk-cookie-reopen" data-bk-cookie-open>Cookie preferences</button><div class="bk-cookie-panel" data-bk-cookie-panel role="dialog" aria-labelledby="bk-cookie-title"><button type="button" class="bk-cookie-x" data-bk-cookie-close aria-label="Close cookie preferences">×</button><div class="bk-cookie-icon">☷</div><h2 id="bk-cookie-title">Your privacy matters</h2><p>We use cookies to keep the site working and, if you agree, to understand how visitors use it. Choose your preferences below.</p><div class="bk-cookie-options"><label><span><b>Necessary</b><small>Required for the website to work</small></span><input type="checkbox" checked disabled></label><label><span><b>Analytics</b><small>Help us improve the experience</small></span><input type="checkbox" data-bk-cookie-analytics></label><label><span><b>Marketing</b><small>Personalized content and ads</small></span><input type="checkbox" data-bk-cookie-marketing></label></div><div class="bk-cookie-actions"><button type="button" data-bk-cookie-reject>Reject optional</button><button type="button" data-bk-cookie-accept>Accept all</button><button type="button" data-bk-cookie-save>Save choices</button></div><p class="bk-cookie-status" data-bk-cookie-status aria-live="polite"></p></div></section>`,
    css: `.bk-cookie-demo{font-family:system-ui,sans-serif;padding:18px}.bk-cookie-reopen{border:1px solid #cbd5e1;background:#fff;color:#334155;border-radius:8px;padding:10px 14px;cursor:pointer}.bk-cookie-panel{position:fixed;left:22px;bottom:22px;z-index:9999;width:min(430px,calc(100vw - 32px));background:#fff;border:1px solid #e2e8f0;border-radius:20px;padding:24px;box-shadow:0 20px 70px #0f172a30;color:#0f172a}.bk-cookie-panel[hidden]{display:none}.bk-cookie-x{position:absolute;right:14px;top:12px;border:0;background:#f1f5f9;border-radius:50%;width:32px;height:32px;font-size:22px;cursor:pointer}.bk-cookie-icon{font-size:24px;color:#2563eb}.bk-cookie-panel h2{font-size:22px;margin:8px 0}.bk-cookie-panel>p{font-size:13px;color:#64748b;line-height:1.6}.bk-cookie-options{border-top:1px solid #e2e8f0;margin-top:16px}.bk-cookie-options label{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 0;border-bottom:1px solid #f1f5f9}.bk-cookie-options b,.bk-cookie-options small{display:block}.bk-cookie-options b{font-size:13px}.bk-cookie-options small{font-size:11px;color:#64748b;margin-top:3px}.bk-cookie-options input{accent-color:#2563eb;width:17px;height:17px}.bk-cookie-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:16px}.bk-cookie-actions button{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:9px 10px;font-size:12px;font-weight:750;cursor:pointer}.bk-cookie-actions [data-bk-cookie-accept]{background:#2563eb;border-color:#2563eb;color:#fff}.bk-cookie-status{font-size:12px;color:#15803d;font-weight:700}@media(max-width:480px){.bk-cookie-panel{left:10px;bottom:10px;width:calc(100vw - 20px);padding:18px}}`,
    js: `document.querySelectorAll('.bk-cookie-demo').forEach(function(root){var panel=root.querySelector('[data-bk-cookie-panel]');var status=root.querySelector('[data-bk-cookie-status]');root.querySelector('[data-bk-cookie-open]').addEventListener('click',function(){panel.hidden=false});root.querySelector('[data-bk-cookie-close]').addEventListener('click',function(){panel.hidden=true});function save(analytics,marketing,label){try{localStorage.setItem('p2c-cookie-preferences',JSON.stringify({necessary:true,analytics:analytics,marketing:marketing}))}catch(e){}root.querySelector('[data-bk-cookie-analytics]').checked=analytics;root.querySelector('[data-bk-cookie-marketing]').checked=marketing;status.textContent=label;panel.hidden=true}root.querySelector('[data-bk-cookie-accept]').addEventListener('click',function(){save(true,true,'Preferences saved (demo).')});root.querySelector('[data-bk-cookie-reject]').addEventListener('click',function(){save(false,false,'Optional cookies rejected (demo).')});root.querySelector('[data-bk-cookie-save]').addEventListener('click',function(){save(root.querySelector('[data-bk-cookie-analytics]').checked,root.querySelector('[data-bk-cookie-marketing]').checked,'Your choices were saved (demo).')})});`,
  },
  {
    id: 'popup-newsletter', category: 'Popups & Modals', name: 'Newsletter signup modal', description: 'Email capture modal with client-side validation and a success state.', tags: ['Interactive', 'Form'],
    html: `<section class="bk-news-pop"><button type="button" class="bk-news-open" data-bk-news-open>Get design updates <span>→</span></button><div class="bk-news-overlay" data-bk-news-modal hidden><button type="button" class="bk-news-shade" data-bk-news-close aria-label="Close newsletter signup"></button><div class="bk-news-card" role="dialog" aria-modal="true" aria-labelledby="bk-news-title"><button type="button" class="bk-news-x" data-bk-news-close aria-label="Close">×</button><div class="bk-news-art">✉</div><p class="bk-news-tag">THE GOOD STUFF, OCCASIONALLY</p><h2 id="bk-news-title">Ideas worth opening.</h2><p>Get practical design tips and product updates delivered to your inbox.</p><form data-bk-news-form><label for="bk-news-email">Email address</label><div class="bk-news-field"><input id="bk-news-email" type="email" placeholder="you@example.com" required><button type="submit">Join list</button></div><small>No spam. Unsubscribe whenever you like.</small><p class="bk-news-status" data-bk-news-status aria-live="polite"></p></form></div></div></section>`,
    css: `.bk-news-pop{padding:24px;font-family:system-ui,sans-serif}.bk-news-open{border:0;border-radius:10px;background:#7c3aed;color:#fff;padding:14px 18px;font-weight:750;cursor:pointer}.bk-news-open span{margin-left:16px}.bk-news-overlay[hidden]{display:none}.bk-news-overlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:18px}.bk-news-shade{position:absolute;inset:0;border:0;background:#1e1b4bba;backdrop-filter:blur(5px)}.bk-news-card{position:relative;width:min(510px,100%);background:#fff;padding:34px;border-radius:24px;box-shadow:0 30px 90px #0004;color:#0f172a}.bk-news-x{position:absolute;right:16px;top:16px;width:34px;height:34px;border:0;border-radius:50%;background:#f1f5f9;font-size:23px;cursor:pointer}.bk-news-art{width:54px;height:54px;display:grid;place-items:center;background:#ede9fe;color:#7c3aed;border-radius:16px;font-size:25px}.bk-news-tag{font-size:10px;letter-spacing:1.4px;color:#7c3aed;font-weight:850;margin:24px 0 8px}.bk-news-card h2{font-size:clamp(27px,5vw,38px);letter-spacing:-1px;line-height:1.1;margin:0}.bk-news-card>p{color:#64748b;line-height:1.6}.bk-news-card form{margin-top:24px}.bk-news-card label{display:block;font-size:13px;font-weight:750;margin-bottom:8px}.bk-news-field{display:flex;gap:8px}.bk-news-field input{min-width:0;flex:1;border:1px solid #cbd5e1;border-radius:9px;padding:12px;font:inherit}.bk-news-field button{border:0;border-radius:9px;background:#7c3aed;color:#fff;padding:12px 15px;font-weight:750;cursor:pointer}.bk-news-card form small{display:block;color:#94a3b8;font-size:11px;margin-top:10px}.bk-news-status{font-size:13px;color:#15803d;font-weight:750}@media(max-width:480px){.bk-news-card{padding:26px 20px;border-radius:18px}.bk-news-field{flex-direction:column}}`,
    js: `document.querySelectorAll('.bk-news-pop').forEach(function(root){var modal=root.querySelector('[data-bk-news-modal]');var opener=root.querySelector('[data-bk-news-open]');var form=root.querySelector('[data-bk-news-form]');var status=root.querySelector('[data-bk-news-status]');opener.addEventListener('click',function(){modal.hidden=false;modal.querySelector('input').focus()});function close(){modal.hidden=true;opener.focus()}modal.querySelectorAll('[data-bk-news-close]').forEach(function(b){b.addEventListener('click',close)});form.addEventListener('submit',function(e){e.preventDefault();if(!form.checkValidity()){form.reportValidity();return}status.textContent='Thanks for subscribing! Connect this form to your email provider to collect subscribers.';form.reset()});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()})});`,
  },
];

const AUTO_POPUP_BLOCKS: Block[] = [
  {
    id: 'popup-auto-glass-welcome', category: 'Popups & Modals', name: 'Auto-open glass welcome modal', description: 'Premium blurred-glass welcome modal that opens automatically when the page loads.', tags: ['Interactive', 'Animated'],
    html: `<section class="bk-auto-glass"><button class="bk-ag-reopen" type="button" data-bk-ag-open>Open welcome popup</button><div class="bk-ag-layer" data-bk-ag-modal hidden><button class="bk-ag-backdrop" type="button" data-bk-ag-close aria-label="Close welcome popup"></button><article class="bk-ag-card" role="dialog" aria-modal="true" aria-labelledby="bk-ag-title"><button class="bk-ag-x" type="button" data-bk-ag-close aria-label="Close">×</button><span class="bk-ag-orb">✦</span><p class="bk-ag-kicker">A BETTER EXPERIENCE STARTS HERE</p><h2 id="bk-ag-title">Welcome to something <em>beautiful.</em></h2><p>Discover a cleaner way to build, create, and bring your next big idea to life.</p><div class="bk-ag-actions"><button type="button" data-bk-ag-close>Explore now <span>↗</span></button><a href="#learn-more" data-bk-ag-close>Maybe later</a></div><small>Thoughtfully designed for you.</small></article></div></section>`,
    css: `.bk-auto-glass{font-family:Inter,system-ui,sans-serif;padding:20px}.bk-ag-reopen{border:0;border-radius:12px;background:#111827;color:#fff;padding:13px 18px;font-weight:750;cursor:pointer}.bk-ag-layer[hidden]{display:none}.bk-ag-layer{position:fixed;inset:0;z-index:10050;display:grid;place-items:center;padding:20px;animation:bk-ag-fade .3s ease both}.bk-ag-backdrop{position:absolute;inset:0;border:0;background:radial-gradient(circle at 50% 35%,#64748b66,#020617d9);backdrop-filter:blur(12px)}.bk-ag-card{position:relative;width:min(560px,100%);overflow:hidden;text-align:center;color:#f8fafc;padding:48px 38px 32px;border:1px solid #ffffff40;border-radius:28px;background:linear-gradient(135deg,#ffffff24,#ffffff09);box-shadow:0 35px 110px #0008;backdrop-filter:blur(24px);animation:bk-ag-rise .55s cubic-bezier(.2,.8,.2,1) both}.bk-ag-card:before{content:"";position:absolute;inset:0 0 auto;height:4px;background:linear-gradient(90deg,#38bdf8,#c084fc,#fb7185)}.bk-ag-x{position:absolute;right:16px;top:16px;width:35px;height:35px;border:1px solid #ffffff35;border-radius:50%;background:#ffffff15;color:#fff;font-size:24px;cursor:pointer}.bk-ag-orb{display:grid;place-items:center;margin:0 auto 22px;width:62px;height:62px;border-radius:20px;color:#fff;font-size:28px;background:linear-gradient(135deg,#38bdf8,#8b5cf6);box-shadow:0 12px 40px #8b5cf655}.bk-ag-kicker{font-size:10px;letter-spacing:2px;font-weight:850;color:#c4b5fd}.bk-ag-card h2{font-size:clamp(30px,6vw,46px);line-height:1.04;letter-spacing:-1.8px;margin:12px 0}.bk-ag-card h2 em{font-style:normal;background:linear-gradient(90deg,#67e8f9,#c4b5fd);color:transparent;background-clip:text}.bk-ag-card>p:not(.bk-ag-kicker){max-width:400px;margin:0 auto;color:#cbd5e1;line-height:1.7;font-size:14px}.bk-ag-actions{display:flex;align-items:center;justify-content:center;gap:20px;flex-wrap:wrap;margin:28px 0 22px}.bk-ag-actions button{border:0;border-radius:10px;padding:13px 18px;background:#fff;color:#0f172a;font-weight:800;cursor:pointer}.bk-ag-actions button span{margin-left:12px}.bk-ag-actions a{color:#e2e8f0;font-size:13px;text-decoration:none}.bk-ag-card small{color:#94a3b8;font-size:11px}@keyframes bk-ag-fade{from{opacity:0}to{opacity:1}}@keyframes bk-ag-rise{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}@media(max-width:480px){.bk-ag-card{padding:42px 22px 26px;border-radius:22px}}@media(prefers-reduced-motion:reduce){.bk-ag-layer,.bk-ag-card{animation:none}}`,
    js: `document.querySelectorAll('.bk-auto-glass').forEach(function(root){var modal=root.querySelector('[data-bk-ag-modal]');var opener=root.querySelector('[data-bk-ag-open]');function open(){modal.hidden=false;document.body.style.overflow='hidden';var x=modal.querySelector('.bk-ag-x');if(x)x.focus()}function close(){modal.hidden=true;document.body.style.overflow='';opener.focus()}opener.addEventListener('click',open);modal.querySelectorAll('[data-bk-ag-close]').forEach(function(b){b.addEventListener('click',close)});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()});setTimeout(open,350)});`,
  },
  {
    id: 'popup-auto-split-offer', category: 'Popups & Modals', name: 'Auto-open split image offer', description: 'Image-led sale popup with a split layout, discount badge, and CTA; opens on page load.', tags: ['Interactive', 'Animated'],
    html: `<section class="bk-auto-offer"><button type="button" class="bk-ao-reopen" data-bk-ao-open>Show special offer</button><div class="bk-ao-layer" data-bk-ao-modal hidden><button type="button" class="bk-ao-shade" data-bk-ao-close aria-label="Close offer"></button><article class="bk-ao-card" role="dialog" aria-modal="true" aria-labelledby="bk-ao-title"><button type="button" class="bk-ao-x" data-bk-ao-close aria-label="Close">×</button><div class="bk-ao-photo" role="img" aria-label="Warm modern workspace"></div><div class="bk-ao-copy"><span class="bk-ao-badge">LIMITED OFFER · 30% OFF</span><p class="bk-ao-eyebrow">A LITTLE SOMETHING FOR YOU</p><h2 id="bk-ao-title">Make room for <span>better.</span></h2><p>Upgrade your everyday with thoughtfully selected essentials. Your welcome offer is ready.</p><div class="bk-ao-code"><span>YOUR CODE</span><b>WELCOME30</b><button type="button" data-bk-ao-copy>Copy</button></div><button class="bk-ao-cta" type="button" data-bk-ao-close>Explore the collection ↗</button><small>Demo offer — connect your real promotion before publishing.</small></div></article></div></section>`,
    css: `.bk-auto-offer{font-family:system-ui,sans-serif;padding:20px}.bk-ao-reopen{border:0;background:#0f766e;color:white;padding:12px 17px;border-radius:9px;font-weight:750;cursor:pointer}.bk-ao-layer[hidden]{display:none}.bk-ao-layer{position:fixed;inset:0;z-index:10051;display:grid;place-items:center;padding:20px}.bk-ao-shade{position:absolute;inset:0;border:0;background:#071b1acc;backdrop-filter:blur(5px)}.bk-ao-card{position:relative;display:grid;grid-template-columns:1fr 1fr;width:min(850px,100%);background:#fff;border-radius:22px;overflow:hidden;box-shadow:0 30px 100px #0006;animation:bk-ao-in .45s cubic-bezier(.2,.8,.2,1) both}.bk-ao-photo{min-height:470px;background:linear-gradient(0deg,#0f766e22,#0f766e05),url('https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=900') center/cover}.bk-ao-copy{position:relative;padding:42px 34px;display:flex;flex-direction:column;align-items:flex-start;justify-content:center;color:#14201e}.bk-ao-x{position:absolute;right:13px;top:13px;z-index:2;border:0;border-radius:50%;width:34px;height:34px;background:#f1f5f9;color:#0f172a;font-size:24px;cursor:pointer}.bk-ao-badge{font-size:10px;letter-spacing:1px;font-weight:900;background:#ccfbf1;color:#115e59;padding:8px 10px;border-radius:5px}.bk-ao-eyebrow{font-size:10px;letter-spacing:1.5px;color:#0f766e;font-weight:850;margin:24px 0 8px}.bk-ao-copy h2{font-size:clamp(30px,4vw,43px);line-height:1.03;letter-spacing:-1.5px;margin:0}.bk-ao-copy h2 span{color:#0f766e}.bk-ao-copy>p:not(.bk-ao-eyebrow){color:#64748b;font-size:13px;line-height:1.7}.bk-ao-code{display:flex;align-items:center;gap:10px;flex-wrap:wrap;width:100%;border:1px dashed #99f6e4;background:#f0fdfa;padding:12px;border-radius:10px;margin:12px 0 16px}.bk-ao-code span{width:100%;font-size:9px;letter-spacing:1px;color:#0f766e}.bk-ao-code b{letter-spacing:1px}.bk-ao-code button{margin-left:auto;border:0;background:transparent;color:#0f766e;font-weight:800;cursor:pointer}.bk-ao-cta{width:100%;border:0;border-radius:9px;padding:14px;background:#0f766e;color:#fff;font-weight:800;cursor:pointer}.bk-ao-copy small{font-size:10px;color:#94a3b8;line-height:1.5;margin-top:12px}@keyframes bk-ao-in{from{opacity:0;transform:translateY(18px) scale(.98)}to{opacity:1;transform:none}}@media(max-width:620px){.bk-ao-layer{padding:10px}.bk-ao-card{grid-template-columns:1fr;max-height:92vh;overflow:auto}.bk-ao-photo{min-height:170px}.bk-ao-copy{padding:26px 22px}.bk-ao-eyebrow{margin-top:18px}}@media(prefers-reduced-motion:reduce){.bk-ao-card{animation:none}}`,
    js: `document.querySelectorAll('.bk-auto-offer').forEach(function(root){var modal=root.querySelector('[data-bk-ao-modal]');var opener=root.querySelector('[data-bk-ao-open]');function open(){modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.bk-ao-x').focus()}function close(){modal.hidden=true;document.body.style.overflow='';opener.focus()}opener.addEventListener('click',open);modal.querySelectorAll('[data-bk-ao-close]').forEach(function(b){b.addEventListener('click',close)});modal.querySelector('[data-bk-ao-copy]').addEventListener('click',function(){var b=this;var done=function(){b.textContent='Copied!'};if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText('WELCOME30').then(done).catch(function(){b.textContent='WELCOME30'})}else{b.textContent='WELCOME30'}});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()});setTimeout(open,400)});`,
  },
  {
    id: 'popup-auto-bottom-sheet', category: 'Popups & Modals', name: 'Auto-open bottom sheet', description: 'Mobile-first bottom sheet that slides up on load; useful for quick actions, app prompts, and booking.', tags: ['Interactive', 'Animated'],
    html: `<section class="bk-auto-sheet"><button type="button" class="bk-as-reopen" data-bk-as-open>Open quick actions</button><div class="bk-as-layer" data-bk-as-modal hidden><button type="button" class="bk-as-shade" data-bk-as-close aria-label="Close quick actions"></button><article class="bk-as-panel" role="dialog" aria-modal="true" aria-labelledby="bk-as-title"><div class="bk-as-handle"></div><button type="button" class="bk-as-x" data-bk-as-close aria-label="Close">×</button><p class="bk-as-kicker">QUICK ACCESS</p><h2 id="bk-as-title">What would you like to do?</h2><p>Choose an action to keep things moving.</p><button class="bk-as-option" type="button" data-bk-as-close><span class="bk-as-icon">⌁</span><span><b>Explore features</b><small>See what's possible</small></span><span class="bk-as-arrow">↗</span></button><button class="bk-as-option" type="button" data-bk-as-close><span class="bk-as-icon">▦</span><span><b>View pricing</b><small>Find the right plan</small></span><span class="bk-as-arrow">↗</span></button><button class="bk-as-option" type="button" data-bk-as-close><span class="bk-as-icon">✉</span><span><b>Talk to our team</b><small>We are happy to help</small></span><span class="bk-as-arrow">↗</span></button><button class="bk-as-dismiss" type="button" data-bk-as-close>Not right now</button></article></div></section>`,
    css: `.bk-auto-sheet{font-family:system-ui,sans-serif;padding:20px}.bk-as-reopen{border:0;border-radius:10px;background:#4338ca;color:#fff;padding:12px 17px;font-weight:750;cursor:pointer}.bk-as-layer[hidden]{display:none}.bk-as-layer{position:fixed;inset:0;z-index:10052;display:flex;align-items:flex-end;justify-content:center}.bk-as-shade{position:absolute;inset:0;border:0;background:#0f172a99;backdrop-filter:blur(3px)}.bk-as-panel{position:relative;width:min(600px,100%);background:#fff;color:#0f172a;padding:14px 26px 28px;border-radius:26px 26px 0 0;box-shadow:0 -20px 70px #0002;animation:bk-as-up .42s cubic-bezier(.22,1,.36,1) both}.bk-as-handle{width:42px;height:5px;background:#cbd5e1;border-radius:9px;margin:0 auto 22px}.bk-as-x{position:absolute;right:20px;top:20px;border:0;background:#f1f5f9;border-radius:50%;width:34px;height:34px;font-size:22px;cursor:pointer}.bk-as-kicker{font-size:10px;letter-spacing:1.6px;color:#6366f1;font-weight:900;margin:0 0 7px}.bk-as-panel h2{font-size:26px;letter-spacing:-.7px;margin:0 0 7px}.bk-as-panel>p:not(.bk-as-kicker){font-size:13px;color:#64748b;margin:0 0 18px}.bk-as-option{display:flex;align-items:center;gap:13px;width:100%;text-align:left;border:1px solid #e2e8f0;border-radius:13px;background:#fff;padding:13px;margin-top:9px;cursor:pointer}.bk-as-icon{display:grid;place-items:center;width:42px;height:42px;background:#eef2ff;color:#4338ca;border-radius:11px;font-size:22px}.bk-as-option b,.bk-as-option small{display:block}.bk-as-option b{font-size:13px}.bk-as-option small{font-size:11px;color:#64748b;margin-top:3px}.bk-as-arrow{margin-left:auto;color:#6366f1}.bk-as-dismiss{display:block;margin:18px auto 0;border:0;background:transparent;color:#64748b;font-weight:700;cursor:pointer}@keyframes bk-as-up{from{transform:translateY(100%)}to{transform:translateY(0)}}@media(min-width:700px){.bk-as-layer{align-items:center;padding:20px}.bk-as-panel{border-radius:26px;max-width:560px}}@media(prefers-reduced-motion:reduce){.bk-as-panel{animation:none}}`,
    js: `document.querySelectorAll('.bk-auto-sheet').forEach(function(root){var modal=root.querySelector('[data-bk-as-modal]');var opener=root.querySelector('[data-bk-as-open]');function open(){modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.bk-as-x').focus()}function close(){modal.hidden=true;document.body.style.overflow='';opener.focus()}opener.addEventListener('click',open);modal.querySelectorAll('[data-bk-as-close]').forEach(function(b){b.addEventListener('click',close)});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()});setTimeout(open,300)});`,
  },
  {
    id: 'popup-auto-side-drawer', category: 'Popups & Modals', name: 'Auto-open side drawer', description: 'A modern side panel that enters from the right on page load, ideal for cart summaries or menus.', tags: ['Interactive', 'Animated'],
    html: `<section class="bk-auto-drawer"><button type="button" class="bk-ad-reopen" data-bk-ad-open>Open cart drawer</button><div class="bk-ad-layer" data-bk-ad-modal hidden><button type="button" class="bk-ad-shade" data-bk-ad-close aria-label="Close cart drawer"></button><aside class="bk-ad-panel" role="dialog" aria-modal="true" aria-labelledby="bk-ad-title"><div class="bk-ad-head"><div><p>YOUR BAG</p><h2 id="bk-ad-title">A good choice.</h2></div><button type="button" class="bk-ad-x" data-bk-ad-close aria-label="Close">×</button></div><div class="bk-ad-product"><div class="bk-ad-product-art">✦</div><div><b>Everyday Essential</b><small>Midnight / Standard</small><strong>$48.00</strong></div><button type="button" class="bk-ad-remove" aria-label="Remove item">×</button></div><div class="bk-ad-note">✧ You're eligible for complimentary shipping.</div><div class="bk-ad-total"><span>Subtotal</span><b>$48.00</b></div><button type="button" class="bk-ad-checkout" data-bk-ad-close>Continue to checkout →</button><button type="button" class="bk-ad-continue" data-bk-ad-close>Continue shopping</button><small class="bk-ad-demo">Sample cart content — connect your own cart data.</small></aside></div></section>`,
    css: `.bk-auto-drawer{font-family:system-ui,sans-serif;padding:20px}.bk-ad-reopen{border:0;border-radius:9px;background:#111827;color:#fff;padding:12px 17px;font-weight:750;cursor:pointer}.bk-ad-layer[hidden]{display:none}.bk-ad-layer{position:fixed;inset:0;z-index:10053}.bk-ad-shade{position:absolute;inset:0;border:0;background:#02061799;backdrop-filter:blur(2px)}.bk-ad-panel{position:absolute;right:0;top:0;height:100%;width:min(460px,100%);background:#fff;color:#111827;padding:28px;display:flex;flex-direction:column;box-shadow:-25px 0 80px #0002;animation:bk-ad-in .38s cubic-bezier(.22,1,.36,1) both}.bk-ad-head{display:flex;align-items:flex-start;justify-content:space-between;border-bottom:1px solid #e5e7eb;padding-bottom:22px}.bk-ad-head p{font-size:10px;letter-spacing:1.8px;color:#6b7280;font-weight:900;margin:0 0 7px}.bk-ad-head h2{font-size:28px;letter-spacing:-1px;margin:0}.bk-ad-x{border:0;background:#f3f4f6;width:36px;height:36px;border-radius:50%;font-size:24px;cursor:pointer}.bk-ad-product{display:flex;align-items:center;gap:14px;padding:22px 0;border-bottom:1px solid #e5e7eb}.bk-ad-product-art{display:grid;place-items:center;width:82px;height:94px;background:linear-gradient(135deg,#d1fae5,#99f6e4);color:#115e59;font-size:30px;border-radius:9px}.bk-ad-product b,.bk-ad-product small,.bk-ad-product strong{display:block}.bk-ad-product b{font-size:13px}.bk-ad-product small{font-size:11px;color:#6b7280;margin:5px 0 12px}.bk-ad-product strong{font-size:13px}.bk-ad-remove{margin-left:auto;align-self:flex-start;border:0;background:transparent;color:#9ca3af;font-size:22px;cursor:pointer}.bk-ad-note{font-size:12px;color:#047857;background:#ecfdf5;padding:12px;border-radius:8px;margin-top:18px}.bk-ad-total{display:flex;justify-content:space-between;margin-top:auto;padding:20px 0 14px;border-top:1px solid #e5e7eb;font-size:14px}.bk-ad-checkout{border:0;background:#111827;color:#fff;border-radius:9px;padding:15px;font-weight:800;cursor:pointer}.bk-ad-continue{border:0;background:transparent;padding:13px;color:#374151;font-weight:700;cursor:pointer}.bk-ad-demo{text-align:center;font-size:10px;color:#9ca3af;margin-top:8px}@keyframes bk-ad-in{from{transform:translateX(100%)}to{transform:translateX(0)}}@media(prefers-reduced-motion:reduce){.bk-ad-panel{animation:none}}`,
    js: `document.querySelectorAll('.bk-auto-drawer').forEach(function(root){var modal=root.querySelector('[data-bk-ad-modal]');var opener=root.querySelector('[data-bk-ad-open]');function open(){modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.bk-ad-x').focus()}function close(){modal.hidden=true;document.body.style.overflow='';opener.focus()}opener.addEventListener('click',open);modal.querySelectorAll('[data-bk-ad-close]').forEach(function(b){b.addEventListener('click',close)});root.querySelector('.bk-ad-remove').addEventListener('click',function(){var item=root.querySelector('.bk-ad-product');if(item)item.style.opacity='.35'});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()});setTimeout(open,350)});`,
  },
  {
    id: 'popup-auto-fullscreen-launch', category: 'Popups & Modals', name: 'Auto-open fullscreen launch popup', description: 'Full-screen launch announcement with bold typography and animated gradient; opens instantly on load.', tags: ['Interactive', 'Animated'],
    html: `<section class="bk-auto-launch"><button type="button" class="bk-al-reopen" data-bk-al-open>View launch announcement</button><div class="bk-al-layer" data-bk-al-modal hidden><button type="button" class="bk-al-close" data-bk-al-close aria-label="Close announcement">×</button><div class="bk-al-glow bk-al-glow-one"></div><div class="bk-al-glow bk-al-glow-two"></div><article class="bk-al-content" role="dialog" aria-modal="true" aria-labelledby="bk-al-title"><span class="bk-al-pill"><i></i> NOW LIVE · 2026</span><p class="bk-al-eyebrow">INTRODUCING THE NEXT CHAPTER</p><h2 id="bk-al-title">Big ideas.<br><span>Beautifully built.</span></h2><p class="bk-al-lead">A fresh toolkit for people who want to move from idea to impact, faster than ever.</p><button type="button" class="bk-al-cta" data-bk-al-close>Discover what's new <span>↗</span></button><small>Designed for your next big thing.</small></article><div class="bk-al-bottom"><span>MAKE SOMETHING GREAT</span><span>SCROLL LESS. CREATE MORE.</span></div></div></section>`,
    css: `.bk-auto-launch{font-family:system-ui,sans-serif;padding:20px}.bk-al-reopen{border:0;background:#111827;color:#fff;border-radius:9px;padding:12px 17px;font-weight:750;cursor:pointer}.bk-al-layer[hidden]{display:none}.bk-al-layer{position:fixed;inset:0;z-index:10054;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:28px;background:#070b17;color:#fff}.bk-al-layer:before{content:"";position:absolute;inset:0;background:linear-gradient(125deg,#070b17,#17113c 48%,#082c3d);background-size:200% 200%;animation:bk-al-gradient 12s ease infinite}.bk-al-close{position:absolute;right:28px;top:24px;z-index:3;width:44px;height:44px;border:1px solid #ffffff45;border-radius:50%;background:#ffffff10;color:#fff;font-size:28px;cursor:pointer}.bk-al-glow{position:absolute;width:45vw;height:45vw;min-width:280px;min-height:280px;filter:blur(90px);border-radius:50%;opacity:.28;pointer-events:none}.bk-al-glow-one{background:#7c3aed;left:-10%;top:-15%}.bk-al-glow-two{background:#06b6d4;right:-10%;bottom:-25%}.bk-al-content{position:relative;z-index:2;max-width:850px;text-align:center;animation:bk-al-content .7s cubic-bezier(.2,.8,.2,1) both}.bk-al-pill{display:inline-flex;align-items:center;gap:9px;border:1px solid #ffffff30;border-radius:99px;padding:9px 14px;color:#dbeafe;font-size:10px;letter-spacing:1.5px}.bk-al-pill i{width:7px;height:7px;background:#4ade80;border-radius:50%;box-shadow:0 0 15px #4ade80}.bk-al-eyebrow{font-size:11px;letter-spacing:3px;color:#a5b4fc;font-weight:850;margin:32px 0 14px}.bk-al-content h2{font-size:clamp(44px,9vw,100px);line-height:.94;letter-spacing:-.065em;margin:0}.bk-al-content h2 span{background:linear-gradient(90deg,#67e8f9,#c4b5fd,#f0abfc);color:transparent;background-clip:text}.bk-al-lead{max-width:570px;margin:25px auto;color:#cbd5e1;line-height:1.8;font-size:clamp(14px,2vw,18px)}.bk-al-cta{border:0;border-radius:10px;background:#fff;color:#111827;padding:15px 20px;font-weight:850;cursor:pointer}.bk-al-cta span{margin-left:25px}.bk-al-content small{display:block;margin-top:25px;color:#94a3b8;font-size:11px}.bk-al-bottom{position:absolute;bottom:24px;left:28px;right:28px;display:flex;justify-content:space-between;color:#64748b;font-size:9px;letter-spacing:1.4px}@keyframes bk-al-gradient{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}@keyframes bk-al-content{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}@media(max-width:500px){.bk-al-bottom{left:16px;right:16px;bottom:15px;font-size:7px}.bk-al-close{right:16px;top:16px}}@media(prefers-reduced-motion:reduce){.bk-al-layer:before,.bk-al-content{animation:none}}`,
    js: `document.querySelectorAll('.bk-auto-launch').forEach(function(root){var modal=root.querySelector('[data-bk-al-modal]');var opener=root.querySelector('[data-bk-al-open]');function open(){modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('.bk-al-close').focus()}function close(){modal.hidden=true;document.body.style.overflow='';opener.focus()}opener.addEventListener('click',open);modal.querySelectorAll('[data-bk-al-close]').forEach(function(b){b.addEventListener('click',close)});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()});setTimeout(open,250)});`,
  },
  {
    id: 'popup-auto-login', category: 'Popups & Modals', name: 'Auto-open login modal', description: 'Compact login form popup with show-password toggle and demo validation, automatically opened on load.', tags: ['Interactive', 'Form'],
    html: `<section class="bk-auto-login"><button type="button" class="bk-an-reopen" data-bk-an-open>Open sign-in</button><div class="bk-an-layer" data-bk-an-modal hidden><button type="button" class="bk-an-shade" data-bk-an-close aria-label="Close sign-in"></button><article class="bk-an-card" role="dialog" aria-modal="true" aria-labelledby="bk-an-title"><button type="button" class="bk-an-x" data-bk-an-close aria-label="Close">×</button><div class="bk-an-logo">P</div><p class="bk-an-kicker">WELCOME BACK</p><h2 id="bk-an-title">Sign in to continue.</h2><p class="bk-an-desc">Your workspace is waiting right where you left it.</p><form data-bk-an-form><label for="bk-an-email">Email address</label><input id="bk-an-email" type="email" placeholder="you@example.com" required><label for="bk-an-password">Password</label><div class="bk-an-password"><input id="bk-an-password" type="password" placeholder="Enter your password" minlength="4" required><button type="button" data-bk-an-show>Show</button></div><button class="bk-an-submit" type="submit">Sign in <span>→</span></button><p class="bk-an-status" data-bk-an-status aria-live="polite"></p></form><p class="bk-an-foot">New here? <a href="#signup">Create an account</a></p><small class="bk-an-note">Demo form only. Add real authentication before use.</small></article></div></section>`,
    css: `.bk-auto-login{font-family:system-ui,sans-serif;padding:20px}.bk-an-reopen{border:0;border-radius:9px;background:#2563eb;color:#fff;padding:12px 17px;font-weight:750;cursor:pointer}.bk-an-layer[hidden]{display:none}.bk-an-layer{position:fixed;inset:0;z-index:10055;display:grid;place-items:center;padding:18px}.bk-an-shade{position:absolute;inset:0;border:0;background:#0f172acc;backdrop-filter:blur(6px)}.bk-an-card{position:relative;width:min(450px,100%);background:#fff;border-radius:22px;padding:34px;color:#111827;box-shadow:0 28px 100px #0005;animation:bk-an-pop .38s cubic-bezier(.2,.8,.2,1) both}.bk-an-x{position:absolute;right:15px;top:15px;width:34px;height:34px;border:0;border-radius:50%;background:#f3f4f6;font-size:23px;cursor:pointer}.bk-an-logo{width:44px;height:44px;display:grid;place-items:center;background:#2563eb;color:#fff;font-weight:900;font-size:24px;border-radius:13px}.bk-an-kicker{font-size:10px;letter-spacing:1.6px;color:#2563eb;font-weight:900;margin:22px 0 7px}.bk-an-card h2{font-size:29px;letter-spacing:-1px;margin:0}.bk-an-desc{font-size:13px;color:#6b7280;line-height:1.6;margin:9px 0 22px}.bk-an-card form label{display:block;font-size:12px;font-weight:800;margin:14px 0 7px}.bk-an-card form>input,.bk-an-password input{box-sizing:border-box;width:100%;min-width:0;border:1px solid #d1d5db;border-radius:9px;padding:12px;font:inherit;font-size:13px;outline-color:#2563eb}.bk-an-password{display:flex;gap:8px}.bk-an-password button{border:0;background:transparent;color:#2563eb;font-size:12px;font-weight:800;cursor:pointer}.bk-an-submit{display:flex;justify-content:space-between;width:100%;border:0;border-radius:9px;background:#2563eb;color:#fff;padding:14px 16px;font-weight:850;margin-top:22px;cursor:pointer}.bk-an-status{font-size:12px;color:#047857;font-weight:700}.bk-an-foot{text-align:center;font-size:12px;color:#6b7280;margin-top:22px}.bk-an-foot a{color:#2563eb;font-weight:800;text-decoration:none}.bk-an-note{display:block;text-align:center;color:#9ca3af;font-size:10px;margin-top:16px}@keyframes bk-an-pop{from{opacity:0;transform:translateY(14px) scale(.97)}to{opacity:1;transform:none}}@media(max-width:480px){.bk-an-card{padding:28px 22px}}@media(prefers-reduced-motion:reduce){.bk-an-card{animation:none}}`,
    js: `document.querySelectorAll('.bk-auto-login').forEach(function(root){var modal=root.querySelector('[data-bk-an-modal]');var opener=root.querySelector('[data-bk-an-open]');var form=root.querySelector('[data-bk-an-form]');var status=root.querySelector('[data-bk-an-status]');var password=root.querySelector('#bk-an-password');function open(){modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('#bk-an-email').focus()}function close(){modal.hidden=true;document.body.style.overflow='';opener.focus()}opener.addEventListener('click',open);modal.querySelectorAll('[data-bk-an-close]').forEach(function(b){b.addEventListener('click',close)});root.querySelector('[data-bk-an-show]').addEventListener('click',function(){password.type=password.type==='password'?'text':'password';this.textContent=password.type==='password'?'Show':'Hide'});form.addEventListener('submit',function(e){e.preventDefault();if(!form.checkValidity()){form.reportValidity();return}status.textContent='Form validated. Connect this form to your authentication service.'});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()});setTimeout(open,350)});`,
  },
  {
    id: 'popup-auto-toast-stack', category: 'Popups & Modals', name: 'Auto-open notification toast stack', description: 'Non-blocking top-right toast notification that appears on page load with close and action buttons.', tags: ['Interactive', 'Animated'],
    html: `<section class="bk-auto-toast"><button type="button" class="bk-at-reopen" data-bk-at-open>Show notification</button><div class="bk-at-stack" data-bk-at-stack aria-live="polite"><article class="bk-at-card" data-bk-at-card hidden><div class="bk-at-check">✓</div><div class="bk-at-message"><b>You're all caught up</b><p>Your workspace is ready. Pick up where you left off.</p><button type="button" data-bk-at-action>View workspace ↗</button></div><button type="button" class="bk-at-x" data-bk-at-close aria-label="Dismiss notification">×</button></article></div></section>`,
    css: `.bk-auto-toast{font-family:system-ui,sans-serif;padding:20px}.bk-at-reopen{border:0;border-radius:9px;background:#0f172a;color:#fff;padding:12px 17px;font-weight:750;cursor:pointer}.bk-at-stack{position:fixed;top:20px;right:20px;z-index:10056;width:min(390px,calc(100vw - 32px));pointer-events:none}.bk-at-card[hidden]{display:none}.bk-at-card{pointer-events:auto;display:flex;align-items:flex-start;gap:13px;background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:17px;box-shadow:0 18px 60px #0f172a25;animation:bk-at-in .4s cubic-bezier(.2,.8,.2,1) both}.bk-at-check{display:grid;place-items:center;flex:0 0 36px;height:36px;background:#dcfce7;color:#15803d;border-radius:50%;font-weight:900}.bk-at-message{flex:1;min-width:0}.bk-at-message>b{font-size:13px;color:#0f172a}.bk-at-message p{font-size:12px;line-height:1.5;color:#64748b;margin:5px 0 9px}.bk-at-message button{border:0;background:transparent;padding:0;color:#2563eb;font-size:12px;font-weight:850;cursor:pointer}.bk-at-x{border:0;background:transparent;color:#94a3b8;font-size:22px;cursor:pointer;padding:0 2px}@keyframes bk-at-in{from{opacity:0;transform:translateY(-12px) translateX(12px)}to{opacity:1;transform:none}}@media(max-width:480px){.bk-at-stack{top:10px;right:10px;width:calc(100vw - 20px)}}@media(prefers-reduced-motion:reduce){.bk-at-card{animation:none}}`,
    js: `document.querySelectorAll('.bk-auto-toast').forEach(function(root){var card=root.querySelector('[data-bk-at-card]');function open(){card.hidden=false}root.querySelector('[data-bk-at-open]').addEventListener('click',open);root.querySelector('[data-bk-at-close]').addEventListener('click',function(){card.hidden=true});root.querySelector('[data-bk-at-action]').addEventListener('click',function(){card.hidden=true});setTimeout(open,450)});`,
  },
  {
    id: 'popup-auto-newsletter', category: 'Popups & Modals', name: 'Auto-open newsletter popup', description: 'Bright newsletter subscription popup that appears after a short delay and validates email input.', tags: ['Interactive', 'Form', 'Animated'],
    html: `<section class="bk-auto-news"><button type="button" class="bk-aw-reopen" data-bk-aw-open>Open newsletter popup</button><div class="bk-aw-layer" data-bk-aw-modal hidden><button type="button" class="bk-aw-shade" data-bk-aw-close aria-label="Close newsletter popup"></button><article class="bk-aw-card" role="dialog" aria-modal="true" aria-labelledby="bk-aw-title"><button type="button" class="bk-aw-x" data-bk-aw-close aria-label="Close">×</button><div class="bk-aw-visual"><span>THE WEEKLY EDIT</span><strong>Fresh ideas<br>for your inbox.</strong><small>DESIGN · PRODUCT · CULTURE</small></div><div class="bk-aw-form-area"><p class="bk-aw-kicker">GOOD THINGS, DELIVERED</p><h2 id="bk-aw-title">Stay in the loop.</h2><p>One thoughtful email each week. Inspiration, useful tips, and no unnecessary noise.</p><form data-bk-aw-form><label for="bk-aw-email">Your email address</label><div class="bk-aw-field"><input id="bk-aw-email" type="email" placeholder="name@email.com" required><button type="submit" aria-label="Subscribe">→</button></div><small>By subscribing, you agree to our privacy policy.</small><p data-bk-aw-status aria-live="polite"></p></form><button type="button" class="bk-aw-skip" data-bk-aw-close>No thanks, I'll pass</button></div></article></div></section>`,
    css: `.bk-auto-news{font-family:system-ui,sans-serif;padding:20px}.bk-aw-reopen{border:0;border-radius:9px;background:#ea580c;color:#fff;padding:12px 17px;font-weight:750;cursor:pointer}.bk-aw-layer[hidden]{display:none}.bk-aw-layer{position:fixed;inset:0;z-index:10057;display:grid;place-items:center;padding:18px}.bk-aw-shade{position:absolute;inset:0;border:0;background:#431407b8;backdrop-filter:blur(5px)}.bk-aw-card{position:relative;display:grid;grid-template-columns:.9fr 1.1fr;width:min(820px,100%);background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 30px 90px #0005;animation:bk-aw-zoom .42s cubic-bezier(.2,.8,.2,1) both}.bk-aw-x{position:absolute;right:12px;top:12px;z-index:2;width:34px;height:34px;border:0;border-radius:50%;background:#ffffffd9;color:#0f172a;font-size:24px;cursor:pointer}.bk-aw-visual{min-height:400px;padding:28px;display:flex;flex-direction:column;justify-content:space-between;color:#fff;background:linear-gradient(160deg,#7c2d12a8,#43140777),url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=900') center/cover}.bk-aw-visual span,.bk-aw-visual small{font-size:9px;letter-spacing:2px;font-weight:900}.bk-aw-visual strong{font-size:clamp(30px,4vw,48px);line-height:1;letter-spacing:-1.5px}.bk-aw-form-area{padding:42px 32px;display:flex;flex-direction:column;justify-content:center;color:#111827}.bk-aw-kicker{font-size:10px;letter-spacing:1.5px;color:#ea580c;font-weight:900}.bk-aw-form-area h2{font-size:32px;letter-spacing:-1.1px;margin:0}.bk-aw-form-area>p:not(.bk-aw-kicker){font-size:13px;line-height:1.7;color:#64748b}.bk-aw-form-area label{display:block;font-size:12px;font-weight:800;margin:20px 0 8px}.bk-aw-field{display:flex;border:1px solid #d1d5db;border-radius:9px;overflow:hidden}.bk-aw-field input{flex:1;min-width:0;border:0;padding:13px;font:inherit;font-size:12px;outline:0}.bk-aw-field button{width:48px;border:0;background:#ea580c;color:#fff;font-size:22px;cursor:pointer}.bk-aw-form-area form small{display:block;color:#9ca3af;font-size:10px;margin-top:9px}.bk-aw-form-area form p{font-size:12px;color:#15803d;font-weight:750}.bk-aw-skip{align-self:flex-start;border:0;background:transparent;color:#9ca3af;font-size:11px;margin-top:12px;cursor:pointer}@keyframes bk-aw-zoom{from{opacity:0;transform:scale(.96) translateY(12px)}to{opacity:1;transform:none}}@media(max-width:620px){.bk-aw-card{grid-template-columns:1fr;max-height:92vh;overflow:auto}.bk-aw-visual{min-height:155px;padding:18px 22px}.bk-aw-visual strong{font-size:30px}.bk-aw-form-area{padding:24px 22px}.bk-aw-form-area h2{font-size:27px}}@media(prefers-reduced-motion:reduce){.bk-aw-card{animation:none}}`,
    js: `document.querySelectorAll('.bk-auto-news').forEach(function(root){var modal=root.querySelector('[data-bk-aw-modal]');var opener=root.querySelector('[data-bk-aw-open]');var form=root.querySelector('[data-bk-aw-form]');function open(){modal.hidden=false;document.body.style.overflow='hidden';modal.querySelector('#bk-aw-email').focus()}function close(){modal.hidden=true;document.body.style.overflow='';opener.focus()}opener.addEventListener('click',open);modal.querySelectorAll('[data-bk-aw-close]').forEach(function(b){b.addEventListener('click',close)});form.addEventListener('submit',function(e){e.preventDefault();if(!form.checkValidity()){form.reportValidity();return}root.querySelector('[data-bk-aw-status]').textContent='Thanks! Connect this form to your newsletter service.'});document.addEventListener('keydown',function(e){if(!modal.hidden&&e.key==='Escape')close()});setTimeout(open,500)});`,
  },
];

BLOCKS.push(...POPUP_BLOCKS, ...AUTO_POPUP_BLOCKS);



/** Type labels shown on every block card and used by the "Type" filter. */
export const TYPES = ['Live API', 'E-commerce', 'Form', 'Interactive', 'Animated', 'Classic', 'Static'] as const;

/** Explicit tags of the block plus labels worked out from its code (fetch = Live API, <form = Form, @keyframes = Animated ...). */
export function tagsOf(b: Block): string[] {
  const set = new Set<string>(b.tags || []);
  if (/\bfetch\(/.test(b.js)) set.add('Live API');
  if (/<form\b/i.test(b.html)) set.add('Form');
  if (/@keyframes/.test(b.css)) set.add('Animated');
  if (/Georgia|Playfair|serif/.test(b.css)) set.add('Classic');
  if (b.js.trim() && !set.has('Live API')) set.add('Interactive');
  if (!b.js.trim()) set.add('Static');
  return TYPES.filter((x) => set.has(x));
}

export const CATEGORIES: string[] = ['All', ...Array.from(new Set(BLOCKS.map((b) => b.category))), 'My components'];

// ---------------------------------------------------------------------------------------------
// Turning blocks into a page you can copy
// ---------------------------------------------------------------------------------------------

export const placeFromBlock = (b: Block): PlacedBlock =>
  ({ id: uid(), blockId: b.id, name: b.name, html: b.html, css: b.css, js: b.js, shared: b.shared });

/** Your own saved components (from "My components") can be dragged in too. */
export const placeFromSaved = (c: SavedComponent): PlacedBlock =>
  ({ id: uid(), blockId: 'saved:' + c.id, name: c.name, html: c.html, css: c.css, js: c.js });

/** Two copies of one block on one page must not share ids (labels and anchors would break). Ids and their label "for" get a -2, -3 ... suffix. */
export function uniqueIds(html: string, copy: number): string {
  if (copy <= 1) return html;
  const ids = new Set<string>();
  html.replace(/\sid="([^"]+)"/g, (_m, id) => { ids.add(id); return ''; });
  let out = html;
  ids.forEach((id) => {
    const esc = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    out = out.replace(new RegExp(`(\\sid=")${esc}(")`, 'g'), `$1${id}-${copy}$2`).replace(new RegExp(`(\\sfor=")${esc}(")`, 'g'), `$1${id}-${copy}$2`);
  });
  return out;
}

export function recolor(text: string, accent: string): string {
  if (!accent || accent.toLowerCase() === ACCENT || !/^#[0-9a-fA-F]{6}$/.test(accent)) return text;
  return text.split(ACCENT).join(accent);
}

export function composeHtml(items: PlacedBlock[], accent = ACCENT): string {
  const seen: Record<string, number> = {};
  return items.map((it) => {
    seen[it.blockId] = (seen[it.blockId] || 0) + 1;
    return `<!-- ${it.name} -->\n${formatHtml(uniqueIds(recolor(it.html, accent), seen[it.blockId]).trim())}`;
  }).join('\n\n');
}

export function composeCss(items: PlacedBlock[], accent = ACCENT, theme: Theme = DEFAULT_THEME): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  const add = (label: string, css: string) => {
    const t = css.trim();
    if (!t || seen.has(t)) return; // the same CSS is never written twice
    seen.add(t);
    parts.push(`/* ${label} */\n${formatCss(t)}`);
  };
  const sharedOrder = ['base', 'btn', 'form', 'pro'];
  const used = new Set<string>();
  items.forEach((it) => (it.shared || []).forEach((s) => used.add(s)));
  sharedOrder.filter((s) => used.has(s)).forEach((s) => add('shared: ' + s, SHARED[s]));
  if (used.has('pro')) add('theme', themeCss(theme));
  items.forEach((it) => add(it.name, it.css));
  return recolor(parts.join('\n\n'), accent);
}

/** Script of the shared parts the given blocks need (for example scroll-reveal), without any wrapper. */
export function sharedJsFor(items: PlacedBlock[]): string {
  const used = new Set<string>();
  items.forEach((it) => (it.shared || []).forEach((s) => used.add(s)));
  return ['pro'].filter((k) => used.has(k) && SHARED_JS[k]).map((k) => SHARED_JS[k]).join('\n');
}

export function composeJs(items: PlacedBlock[]): string {
  const parts: string[] = [];
  const seen = new Set<string>();
  const sh = sharedJsFor(items);
  if (sh) { seen.add(sh); parts.push(`// shared: scroll reveal\n${formatJs(sh)}`); }
  for (const it of items) {
    const t = it.js.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    parts.push(`// ${it.name}\n${formatJs(t)}`);
  }
  // Wait for the page so scripts placed anywhere still find their elements.
  const body = parts.join('\n\n').split('\n').map((l) => (l ? '  ' + l : l)).join('\n');
  return parts.length ? `document.addEventListener('DOMContentLoaded', function () {\n${body}\n});` : '';
}

/** One complete index.html (CSS in <style>, JS in <script>) that works when double-clicked. */
export function composePage(items: PlacedBlock[], accent = ACCENT, title = 'My page', theme: Theme = DEFAULT_THEME): string {
  const css = composeCss(items, accent, theme);
  const js = composeJs(items);
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title.replace(/[<>&]/g, '')}</title>
<style>
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth}
[id]{scroll-margin-top:96px}
body{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#0f172a;line-height:1.5}
img{max-width:100%}
${css}
</style>
</head>
<body>
${composeHtml(items, accent)}
${js ? `<script>\n${js}\n</script>\n` : ''}</body>
</html>
`;
}

/** The same page as separate files, for the preview and for "Download". */
export function pageFiles(items: PlacedBlock[], accent = ACCENT, theme: Theme = DEFAULT_THEME): ProjectFile[] {
  const css = composeCss(items, accent, theme);
  const js = composeJs(items);
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Preview</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
${composeHtml(items, accent)}
${js ? '<script src="script.js"></script>\n' : ''}</body>
</html>
`;
  return [
    { path: 'index.html', content: html },
    { path: 'styles.css', content: `*,*::before,*::after{box-sizing:border-box}\nhtml{scroll-behavior:smooth}\n[id]{scroll-margin-top:96px}\nbody{margin:0;font-family:system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;color:#0f172a;line-height:1.5}\nimg{max-width:100%}\n${css}\n` },
    ...(js ? [{ path: 'script.js', content: js + '\n' }] : []),
  ];
}

/** A saved component (from My components) as a ready-to-view page. */
export function componentPreviewFiles(c: { id: string; name: string; html: string; css: string; js: string; sourceFiles?: ProjectFile[] }): ProjectFile[] {
  // ZIP imports retain the original file tree. Prefer it so relative paths and script order
  // are preserved; legacy manually-created components still use the generated single-page form.
  if (c.sourceFiles?.some((f) => /(^|\/)index\.html?$/i.test(f.path))) return c.sourceFiles;
  const htmlFiles = c.sourceFiles?.filter((f) => /\.html?$/i.test(f.path)) || [];
  if (htmlFiles.length > 1) {
    // Header/footer ZIPs often contain separate header.html and footer.html instead of index.html.
    // The analyzer already produces a combined, dependency-aware representation for this case.
    const external = [...c.html.matchAll(/<(?:link|script)\b[^>]*(?:href|src)\s*=\s*["'](?:https?:)?\/\/[^"']+["'][^>]*>(?:\s*<\/script>)?/gi)].map((m) => m[0]).join('\n');
    const body = c.html.replace(/<(?:link|script)\b[^>]*(?:href|src)\s*=\s*["'](?:https?:)?\/\/[^"']+["'][^>]*>(?:\s*<\/script>)?/gi, '');
    const index = `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${external}<style>\n${c.css}\n</style></head><body>${body}<script>\n${c.js.replace(/<\/script/gi, '<\\/script')}\n</script></body></html>`;
    return [{ path: 'index.html', content: index }, ...(c.sourceFiles || []).filter((f) => !/\.html?$/i.test(f.path))];
  }
  if (c.sourceFiles?.length) return c.sourceFiles;
  return pageFiles([{ id: c.id, blockId: 'saved:' + c.id, name: c.name || 'Component', html: c.html, css: c.css, js: c.js }]);
}

/** Single block as a ready-to-use page, used for the small live preview in the palette. */
export function blockPreviewFiles(b: PlacedBlock, accent = ACCENT, theme: Theme = DEFAULT_THEME): ProjectFile[] {
  return pageFiles([b], accent, theme);
}

// ---------------------------------------------------------------------------------------------
// Code you drop or paste yourself
// ---------------------------------------------------------------------------------------------

/** Turns pasted/dropped text into a block. A full snippet with <style> and <script> is split into its three parts. */
export function blockFromCode(name: string, text: string): PlacedBlock {
  let t = text.replace(/\r\n/g, '\n').trim();
  let css = '';
  let js = '';
  if (/^\s*</.test(t)) {
    t = t.replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_m, c) => { css += c.trim() + '\n'; return ''; });
    t = t.replace(/<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi, (_m, c) => { js += c.trim() + '\n'; return ''; });
    return { id: uid(), blockId: 'mine:' + uid(), name, html: t.trim(), css: css.trim(), js: js.trim() };
  }
  const looksJs = /\b(function|const|let|var|document\.|window\.|=>)\b/.test(t);
  const looksCss = !looksJs && /[^{}]+\{[^{}]*:[^{}]*\}/.test(t);
  return { id: uid(), blockId: 'mine:' + uid(), name, html: '', css: looksCss ? t : '', js: looksCss ? '' : t };
}

/** Dropped .html/.css/.js/.txt files: files with the same base name (card.html + card.css + card.js) become ONE block. */
export function blocksFromFiles(files: { name: string; text: string }[]): PlacedBlock[] {
  const groups = new Map<string, PlacedBlock>();
  for (const f of files) {
    const m = /^(.*?)(?:\.(html?|css|js|txt))?$/i.exec(f.name.split('/').pop() || f.name);
    const base = (m?.[1] || 'My code').trim() || 'My code';
    const ext = (m?.[2] || 'txt').toLowerCase();
    let g = groups.get(base);
    if (!g) { g = { id: uid(), blockId: 'mine:' + uid(), name: base, html: '', css: '', js: '' }; groups.set(base, g); }
    if (ext === 'css') g.css += (g.css ? '\n' : '') + f.text.trim();
    else if (ext === 'js') g.js += (g.js ? '\n' : '') + f.text.trim();
    else {
      const parsed = blockFromCode(base, f.text);
      g.html += (g.html ? '\n' : '') + parsed.html;
      if (parsed.css) g.css += (g.css ? '\n' : '') + parsed.css;
      if (parsed.js) g.js += (g.js ? '\n' : '') + parsed.js;
    }
  }
  return [...groups.values()];
}