import type { Block } from './blocks';
import { AR, IC, img, svg } from './proShared';

const I_BAG = svg('<path d="M5 8h14l-1 12H6z"/><path d="M9 8a3 3 0 016 0"/>', 20);
const I_HEART = svg('<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/>', 20);
const I_CAL = svg('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>', 22);
const I_USER = svg('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>', 22);
const I_EYE = svg('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>', 20);

/** PRO blocks, part C: premium showcase blocks (device hero, mega menu, overlay menu, storytelling, shop, booking, auth, dashboard ...). */
export const PRO_C: Block[] = [
  // ============================== HEROES ==============================
  {
    id: 'pro-hero-device', category: 'Pro Hero', name: 'Hero: 3D phone mockup + floating cards',
    description: 'App-launch hero with a CSS phone that tilts with the pointer, orbit rings and floating notification cards at different depths.',
    specs: ['Pure CSS phone with notch, UI skeleton and gradient wallet card (no images needed)', 'Pointer parallax: phone rotates, cards move at 3 depths (CSS variables --px / --py)', 'Rings pulse and float, respects reduced motion', 'Store buttons, rating line, stacks to one column under 940px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-dv" id="home">
  <div class="bk-dv__bg" aria-hidden="true"></div>
  <div class="bk-pw bk-dv__in">
    <div class="bk-dv__text">
      <span class="bk-pey bk-rv">Now on iOS &amp; Android</span>
      <h1 class="bk-rv" style="--i:1">Money, made <em>effortless</em></h1>
      <p class="bk-rv" style="--i:2">Send, save and track spending in one beautiful app. Set up in two minutes, no paperwork.</p>
      <div class="bk-dv__stores bk-rv" style="--i:3"><a href="#"><b>&#9679;</b><span><small>Download on the</small>App Store</span></a><a href="#"><b>&#9654;</b><span><small>Get it on</small>Google Play</span></a></div>
      <p class="bk-dv__rate bk-rv" style="--i:4"><span class="bk-dv__stars">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</span><b>4.9</b> from 38,000+ reviews</p>
    </div>
    <div class="bk-dv__stage bk-rv bk-rv--z" style="--i:2">
      <i class="bk-dv__ring bk-dv__ring--1" aria-hidden="true"></i><i class="bk-dv__ring bk-dv__ring--2" aria-hidden="true"></i>
      <div class="bk-dv__phone">
        <i class="bk-dv__notch"></i>
        <div class="bk-dv__screen">
          <div class="bk-dv__hi"><span></span><div><b>Good morning, Ava</b><small>Welcome back</small></div></div>
          <div class="bk-dv__card"><small>Total balance</small><strong>$24,580.40</strong><div><i></i><i></i><i></i><i></i></div></div>
          <div class="bk-dv__acts"><span></span><span></span><span></span><span></span></div>
          <div class="bk-dv__row"><span></span><div><b></b><b></b></div><em></em></div>
          <div class="bk-dv__row"><span></span><div><b></b><b></b></div><em></em></div>
        </div>
      </div>
      <div class="bk-dv__float bk-dv__float--a">${IC.check}<div><b>Payment received</b><small>+ $1,200.00 from Studio</small></div></div>
      <div class="bk-dv__float bk-dv__float--b">${IC.shield}<div><b>Protected</b><small>256-bit encryption</small></div></div>
      <div class="bk-dv__float bk-dv__float--c">${IC.chart}<div><b>+18%</b><small>Savings this month</small></div></div>
    </div>
  </div>
</section>`,
    css: `.bk-dv{position:relative;overflow:hidden;background:#070b16;color:#fff;padding:clamp(56px,8vw,110px) 0 clamp(64px,9vw,130px)}
.bk-dv__bg{position:absolute;inset:0;background:radial-gradient(700px 480px at 78% 30%,color-mix(in srgb,var(--bk-a) 55%,transparent),transparent 70%),radial-gradient(520px 420px at 8% 92%,color-mix(in srgb,var(--bk-a2) 40%,transparent),transparent 70%)}
.bk-dv__in{position:relative;display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,5vw,72px);align-items:center}
.bk-dv .bk-pey{background:rgba(255,255,255,.1);color:#dbe4f5}
.bk-dv h1{font-size:clamp(42px,6.4vw,84px);font-weight:800;margin:22px 0}
.bk-dv h1 em{font-style:normal;background:linear-gradient(90deg,#fff,var(--bk-a-m),var(--bk-a2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.bk-dv__text>p{max-width:480px;font-size:clamp(17px,1.7vw,20px);color:#a9b7d0;margin-bottom:34px}
.bk-dv__stores{display:flex;flex-wrap:wrap;gap:12px}
.bk-dv__stores a{display:flex;align-items:center;gap:12px;padding:11px 20px;border-radius:16px;background:#fff;color:#0b1220;text-decoration:none;font-weight:700;font-size:17px;line-height:1.15;transition:transform .5s var(--bk-ease),box-shadow .5s var(--bk-ease)}
.bk-dv__stores a:hover{transform:translateY(-5px);box-shadow:0 22px 36px -16px rgba(255,255,255,.35)}
.bk-dv__stores b{font-size:24px}
.bk-dv__stores small{display:block;font-size:11px;font-weight:500;color:#5b6679}
.bk-dv__rate{display:flex;align-items:center;gap:10px;margin-top:28px;font-size:14px;color:#a9b7d0}
.bk-dv__rate b{color:#fff}
.bk-dv__stars{display:flex;color:#fbbf24}
.bk-dv__stars svg{width:16px;height:16px}
.bk-dv__stage{--px:0;--py:0;position:relative;display:grid;place-items:center;min-height:clamp(480px,50vw,640px);perspective:1400px}
.bk-dv__ring{position:absolute;border-radius:50%;border:1px solid rgba(255,255,255,.14);animation:bk-dv-ring 6s ease-in-out infinite}
.bk-dv__ring--1{width:min(86%,460px);aspect-ratio:1}
.bk-dv__ring--2{width:min(112%,600px);aspect-ratio:1;animation-delay:-3s;border-color:rgba(255,255,255,.08)}
@keyframes bk-dv-ring{0%,100%{transform:scale(.96);opacity:.6}50%{transform:scale(1.04);opacity:1}}
.bk-dv__phone{position:relative;width:min(70%,290px);aspect-ratio:9/18.5;padding:11px;border-radius:44px;background:linear-gradient(145deg,#2a3350,#0d1325);box-shadow:0 50px 90px -30px rgba(0,0,0,.9),0 0 0 2px rgba(255,255,255,.1) inset,0 0 80px -10px color-mix(in srgb,var(--bk-a) 60%,transparent);transform:rotateY(calc(var(--px) * 14deg)) rotateX(calc(var(--py) * -10deg));transition:transform .25s ease-out;transform-style:preserve-3d}
.bk-dv__notch{position:absolute;z-index:3;left:50%;top:18px;width:30%;height:22px;margin-left:-15%;border-radius:20px;background:#05080f}
.bk-dv__screen{height:100%;overflow:hidden;padding:48px 14px 14px;border-radius:34px;background:linear-gradient(180deg,#141b34,#0b1022);display:grid;align-content:start;gap:14px}
.bk-dv__hi{display:flex;align-items:center;gap:10px}
.bk-dv__hi>span{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--bk-a),var(--bk-a2))}
.bk-dv__hi b{display:block;font-size:12.5px}
.bk-dv__hi small{font-size:10.5px;color:#8a99b8}
.bk-dv__card{padding:16px;border-radius:20px;background:linear-gradient(135deg,var(--bk-a),var(--bk-a-d) 60%,var(--bk-a2));box-shadow:0 16px 30px -14px var(--bk-a)}
.bk-dv__card small{font-size:10.5px;opacity:.85}
.bk-dv__card strong{display:block;margin:4px 0 14px;font-size:22px;letter-spacing:-.02em}
.bk-dv__card div{display:flex;gap:5px}
.bk-dv__card i{width:26px;height:5px;border-radius:5px;background:rgba(255,255,255,.5)}
.bk-dv__acts{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
.bk-dv__acts span{aspect-ratio:1;border-radius:14px;background:rgba(255,255,255,.07)}
.bk-dv__row{display:flex;align-items:center;gap:10px;padding:10px;border-radius:14px;background:rgba(255,255,255,.05)}
.bk-dv__row>span{width:30px;height:30px;border-radius:10px;background:rgba(255,255,255,.12)}
.bk-dv__row div{flex:1;display:grid;gap:5px}
.bk-dv__row b{height:6px;border-radius:6px;background:rgba(255,255,255,.14)}
.bk-dv__row b:last-child{width:55%}
.bk-dv__row em{width:34px;height:8px;border-radius:6px;background:color-mix(in srgb,var(--bk-a-m) 70%,transparent)}
.bk-dv__float{position:absolute;z-index:4;display:flex;align-items:center;gap:12px;padding:12px 18px 12px 14px;border-radius:18px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.16);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);box-shadow:0 24px 40px -20px rgba(0,0,0,.7);animation:bk-bob 6s ease-in-out infinite;transition:transform .25s ease-out}
.bk-dv__float svg{flex:none;color:var(--bk-a-m)}
.bk-dv__float b{display:block;font-size:14px}
.bk-dv__float small{font-size:12px;color:#a9b7d0}
.bk-dv__float--a{left:0;top:16%;transform:translate(calc(var(--px) * -26px),calc(var(--py) * -18px))}
.bk-dv__float--b{right:0;top:42%;animation-delay:-2s;transform:translate(calc(var(--px) * 34px),calc(var(--py) * 22px))}
.bk-dv__float--c{left:4%;bottom:10%;animation-delay:-4s;transform:translate(calc(var(--px) * -40px),calc(var(--py) * 26px))}
@media (max-width:940px){.bk-dv__in{grid-template-columns:1fr;text-align:center}.bk-dv__text>p{margin-left:auto;margin-right:auto}.bk-dv__stores,.bk-dv__rate{justify-content:center}.bk-dv__stage{min-height:520px}.bk-dv__float--a{left:2%}.bk-dv__float--b{right:2%}}
@media (max-width:480px){.bk-dv__float{padding:9px 13px 9px 11px}.bk-dv__float b{font-size:12.5px}.bk-dv__float small{display:none}}`,
    js: `document.querySelectorAll('.bk-dv__stage').forEach(function (st) {
  if (!(window.matchMedia && window.matchMedia('(hover:hover)').matches)) return;
  st.addEventListener('pointermove', function (e) {
    var r = st.getBoundingClientRect();
    st.style.setProperty('--px', (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
    st.style.setProperty('--py', (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
  });
  st.addEventListener('pointerleave', function () { st.style.setProperty('--px', '0'); st.style.setProperty('--py', '0'); });
});`,
  },
  {
    id: 'pro-hero-type', category: 'Pro Hero', name: 'Hero: giant typography + ticker',
    description: 'Bold agency hero. Huge words with inline photo pills, outline-to-fill hover on each word, a rotating scroll badge and a scrolling ticker.',
    specs: ['Fluid giant type clamp(48px, 11vw, 168px)', 'Words fill with accent colour on hover, photo pills expand', 'Rotating circular scroll button (SVG text)', 'Infinite ticker, pauses on hover', 'Works at 320px width without overflow'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ty" id="home">
  <div class="bk-pw bk-ty__in">
    <p class="bk-ty__top bk-rv"><span>Creative studio</span><span>City &bull; Country</span><span>Est. 2014</span></p>
    <h1 class="bk-ty__h">
      <span class="bk-ty__l bk-rv">We craft</span>
      <span class="bk-ty__l bk-rv" style="--i:1"><i class="bk-ty__pill" style="background-image:url(${img('bk-ty1', 400, 200)})"></i><b>bold</b> brands</span>
      <span class="bk-ty__l bk-rv" style="--i:2">&amp; <b>digital</b> <i class="bk-ty__pill" style="background-image:url(${img('bk-ty2', 400, 200)})"></i> work</span>
    </h1>
    <div class="bk-ty__foot bk-rv" style="--i:3">
      <p>Strategy, identity and websites for ambitious companies. We keep the team small and the standards high.</p>
      <a class="bk-pbtn" href="#contact">Start a project ${AR}</a>
      <a class="bk-ty__scroll" href="#services" aria-label="Scroll down"><svg viewBox="0 0 120 120" aria-hidden="true"><defs><path id="bk-ty-c" d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0"/></defs><text><textPath href="#bk-ty-c">SCROLL DOWN &#8226; SCROLL DOWN &#8226;</textPath></text></svg><span>&darr;</span></a>
    </div>
  </div>
  <div class="bk-ty__tick" aria-hidden="true"><div class="bk-ty__tr"><span>Branding</span><span>Web design</span><span>Mobile apps</span><span>Motion</span><span>Strategy</span><span>Photography</span></div></div>
</section>`,
    css: `.bk-ty{background:#f4f1ea;color:#14120e;padding:clamp(36px,6vw,80px) 0 0;overflow:hidden}
.bk-ty__top{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px 20px;font-size:13px;font-weight:600;letter-spacing:.14em;text-transform:uppercase;color:#6b6558;padding-bottom:20px;border-bottom:1px solid rgba(20,18,14,.18)}
.bk-ty__h{margin:clamp(28px,5vw,64px) 0;font-size:clamp(48px,11vw,168px);font-weight:800;letter-spacing:-.055em;line-height:.92}
.bk-ty__l{display:flex;align-items:center;flex-wrap:wrap;gap:0 .18em}
.bk-ty__l b{font-weight:800;color:transparent;-webkit-text-stroke:2px #14120e;transition:color .5s var(--bk-ease),-webkit-text-stroke-color .5s;cursor:default}
.bk-ty__l b:hover{color:var(--bk-a);-webkit-text-stroke-color:var(--bk-a)}
.bk-ty__pill{display:inline-block;width:1.55em;height:.7em;border-radius:999px;background:#14120e center/cover;transition:width .7s var(--bk-ease),transform .7s var(--bk-ease)}
.bk-ty__l:hover .bk-ty__pill{width:2.3em}
.bk-ty__foot{display:flex;flex-wrap:wrap;align-items:center;gap:20px 32px;padding-bottom:clamp(32px,5vw,60px)}
.bk-ty__foot p{flex:1 1 280px;max-width:460px;font-size:clamp(16px,1.6vw,19px);color:#4d483d}
.bk-ty__foot .bk-pbtn{background:#14120e;border-color:#14120e;box-shadow:none}
.bk-ty__foot .bk-pbtn:hover{background:var(--bk-a);border-color:var(--bk-a)}
.bk-ty__scroll{position:relative;display:grid;place-items:center;width:112px;height:112px;margin-left:auto;border-radius:50%;background:var(--bk-a);color:#fff;text-decoration:none;font-size:28px;transition:transform .6s var(--bk-ease)}
.bk-ty__scroll svg{position:absolute;inset:0;width:100%;height:100%;animation:bk-spin 16s linear infinite}
.bk-ty__scroll text{font-size:11.5px;font-weight:700;letter-spacing:.18em;fill:#fff}
.bk-ty__scroll:hover{transform:scale(1.1)}
.bk-ty__scroll span{transition:transform .5s var(--bk-ease)}
.bk-ty__scroll:hover span{transform:translateY(6px)}
.bk-ty__tick{overflow:hidden;background:#14120e;color:#f4f1ea;padding:18px 0}
.bk-ty__tr{display:flex;width:max-content;animation:bk-ty-tick 28s linear infinite}
.bk-ty__tick:hover .bk-ty__tr{animation-play-state:paused}
.bk-ty__tr span{padding:0 clamp(20px,3vw,40px);font-size:clamp(20px,3vw,34px);font-weight:800;letter-spacing:-.03em;white-space:nowrap}
.bk-ty__tr span::after{content:"\\2736";margin-left:clamp(20px,3vw,40px);color:var(--bk-a-m)}
@keyframes bk-ty-tick{to{transform:translateX(-50%)}}
@media (max-width:640px){.bk-ty__l b{-webkit-text-stroke-width:1.4px}.bk-ty__scroll{width:92px;height:92px;margin-left:0}}`,
    js: `document.querySelectorAll('.bk-ty__tr').forEach(function (tr) {
  if (tr.getAttribute('data-cloned')) return;
  tr.setAttribute('data-cloned', '1');
  [].slice.call(tr.children).forEach(function (k) { tr.appendChild(k.cloneNode(true)); });
  [].slice.call(tr.children).slice(0, 6).forEach(function (k) { tr.appendChild(k.cloneNode(true)); });
});`,
  },

  // ============================== NAVBARS ==============================
  {
    id: 'pro-nav-mega', category: 'Pro Navbar', name: 'Navbar: mega menu dropdowns',
    description: 'Business navbar with two mega-menu panels (icons, descriptions, featured card). Opens on hover or click, mobile becomes an accordion drawer.',
    specs: ['Hover-intent open with small close delay, click + keyboard (Enter, Esc, Tab) support', 'aria-expanded / aria-haspopup on triggers, focus returns to trigger on Esc', 'Panel: 2 link columns + featured image card, animated fade/slide', 'Mobile: drawer with accordion groups, body scroll not locked (safe in iframes)', 'Sticky with shadow after scroll'],
    shared: ['pro'],
    html: `<header class="bk-p bk-mg" id="header">
  <div class="bk-mg__bar">
    <a class="bk-mg__logo" href="#home"><span></span>Brand</a>
    <nav class="bk-mg__nav" aria-label="Main">
      <div class="bk-mg__grp"><button class="bk-mg__btn" type="button" aria-expanded="false" aria-haspopup="true">Solutions <i aria-hidden="true"></i></button>
        <div class="bk-mg__panel">
          <div class="bk-mg__cols">
            <div><h4>By need</h4><a href="#"><span>${IC.chart}</span><b>Analytics<small>Understand your customers</small></b></a><a href="#"><span>${IC.bolt}</span><b>Automation<small>Save hours every week</small></b></a><a href="#"><span>${IC.layers}</span><b>Integrations<small>Connect 200+ tools</small></b></a></div>
            <div><h4>By team</h4><a href="#"><span>${IC.heart}</span><b>Marketing<small>Campaigns that convert</small></b></a><a href="#"><span>${IC.shield}</span><b>Security<small>Protect every account</small></b></a><a href="#"><span>${IC.globe}</span><b>Global ops<small>Scale to any region</small></b></a></div>
          </div>
          <a class="bk-mg__feat" href="#" style="background-image:url(${img('bk-mg1', 520, 420)})"><span>New</span><b>See what is new in 2026</b><small>Read the release notes &rarr;</small></a>
        </div>
      </div>
      <div class="bk-mg__grp"><button class="bk-mg__btn" type="button" aria-expanded="false" aria-haspopup="true">Resources <i aria-hidden="true"></i></button>
        <div class="bk-mg__panel bk-mg__panel--s">
          <div class="bk-mg__cols">
            <div><h4>Learn</h4><a href="#"><span>${IC.layers}</span><b>Guides<small>Step-by-step tutorials</small></b></a><a href="#"><span>${IC.globe}</span><b>Blog<small>News and ideas</small></b></a></div>
            <div><h4>Support</h4><a href="#"><span>${IC.heart}</span><b>Help centre<small>Answers in seconds</small></b></a><a href="#"><span>${IC.phone}</span><b>Contact<small>Talk to a human</small></b></a></div>
          </div>
        </div>
      </div>
      <a class="bk-mg__lnk" href="#pricing">Pricing</a>
      <a class="bk-mg__lnk" href="#about">About</a>
    </nav>
    <a class="bk-pbtn bk-mg__cta" href="#contact">Get started ${AR}</a>
    <button class="bk-mg__burger" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>
  </div>
</header>`,
    css: `.bk-mg{position:sticky;top:0;z-index:90;background:rgba(255,255,255,.9);-webkit-backdrop-filter:saturate(1.5) blur(14px);backdrop-filter:saturate(1.5) blur(14px);border-bottom:1px solid var(--bk-line);transition:box-shadow .4s}
.bk-mg.is-stuck{box-shadow:0 14px 40px -22px rgba(11,18,32,.5)}
.bk-mg__bar{position:relative;max-width:1240px;margin:0 auto;display:flex;align-items:center;gap:20px;padding:12px clamp(16px,3vw,32px)}
.bk-mg__logo{display:flex;align-items:center;gap:10px;font-size:21px;font-weight:800;letter-spacing:-.03em;color:var(--bk-ink);text-decoration:none}
.bk-mg__logo span{width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,var(--bk-a),var(--bk-a2))}
.bk-mg__nav{display:flex;align-items:center;gap:2px;margin:0 auto 0 28px}
.bk-mg__grp{position:static}
.bk-mg__btn,.bk-mg__lnk{display:inline-flex;align-items:center;gap:7px;padding:10px 15px;border:0;border-radius:12px;background:transparent;color:#334155;font-family:inherit;font-size:15px;font-weight:500;text-decoration:none;cursor:pointer;transition:background .25s,color .25s}
.bk-mg__btn:hover,.bk-mg__lnk:hover,.bk-mg__btn[aria-expanded=true]{background:var(--bk-a-l);color:var(--bk-a)}
.bk-mg__btn:focus-visible,.bk-mg__lnk:focus-visible{outline:2px solid var(--bk-a);outline-offset:2px}
.bk-mg__btn i{width:7px;height:7px;margin-top:-3px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);transition:transform .35s var(--bk-ease)}
.bk-mg__btn[aria-expanded=true] i{transform:rotate(225deg);margin-top:3px}
.bk-mg__panel{position:absolute;left:clamp(16px,3vw,32px);top:calc(100% - 2px);width:min(860px,calc(100% - 2 * clamp(16px,3vw,32px)));display:grid;grid-template-columns:1.5fr 1fr;gap:18px;padding:22px;border-radius:24px;background:#fff;border:1px solid var(--bk-line);box-shadow:0 40px 80px -30px rgba(11,18,32,.5);opacity:0;visibility:hidden;transform:translateY(12px) scale(.985);transform-origin:top left;transition:opacity .3s,transform .5s var(--bk-ease),visibility .3s}
.bk-mg__panel--s{grid-template-columns:1fr;width:min(520px,calc(100% - 2 * clamp(16px,3vw,32px)));left:clamp(150px,16vw,260px)}
.bk-mg__btn[aria-expanded=true]+.bk-mg__panel{opacity:1;visibility:visible;transform:none}
.bk-mg__cols{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.bk-mg__cols h4{margin:0 0 8px 10px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:var(--bk-mut)}
.bk-mg__cols a{display:flex;align-items:center;gap:14px;padding:11px 10px;border-radius:16px;color:var(--bk-ink);text-decoration:none;transition:background .25s,transform .4s var(--bk-ease)}
.bk-mg__cols a:hover{background:var(--bk-a-l);transform:translateX(5px)}
.bk-mg__cols a span{display:grid;place-items:center;flex:none;width:44px;height:44px;border-radius:14px;background:var(--bk-a-l);color:var(--bk-a);transition:background .3s,color .3s,transform .5s var(--bk-ease)}
.bk-mg__cols a:hover span{background:var(--bk-a);color:#fff;transform:rotate(-8deg) scale(1.06)}
.bk-mg__cols b{display:block;font-size:15px}
.bk-mg__cols small{display:block;font-weight:400;font-size:13px;color:var(--bk-mut)}
.bk-mg__feat{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;gap:2px;min-height:210px;padding:20px;border-radius:18px;background:#0b1220 center/cover;color:#fff;text-decoration:none;isolation:isolate;transition:transform .6s var(--bk-ease)}
.bk-mg__feat::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,transparent 20%,rgba(6,11,24,.9))}
.bk-mg__feat:hover{transform:scale(1.02)}
.bk-mg__feat span{align-self:flex-start;margin-bottom:auto;padding:4px 12px;border-radius:999px;background:var(--bk-a);font-size:12px;font-weight:700}
.bk-mg__feat small{color:#cbd6ec}
.bk-mg__cta{padding:12px 22px}
.bk-mg__burger{display:none}
@media (max-width:980px){
  .bk-mg__cta{display:none}
  .bk-mg__burger{display:grid;align-content:center;justify-items:center;gap:5px;width:46px;height:46px;margin-left:auto;border:0;border-radius:14px;background:var(--bk-a-l);cursor:pointer}
  .bk-mg__burger span{display:block;width:20px;height:2px;border-radius:2px;background:var(--bk-ink);transition:transform .45s var(--bk-ease),opacity .3s}
  .bk-mg.is-open .bk-mg__burger span:nth-child(1){transform:translateY(7px) rotate(45deg)}
  .bk-mg.is-open .bk-mg__burger span:nth-child(2){opacity:0}
  .bk-mg.is-open .bk-mg__burger span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}
  .bk-mg__nav{position:absolute;left:0;right:0;top:100%;flex-direction:column;align-items:stretch;gap:4px;margin:0;padding:12px 16px 18px;background:#fff;border-bottom:1px solid var(--bk-line);box-shadow:0 30px 50px -26px rgba(11,18,32,.5);max-height:calc(100vh - 80px);overflow:auto;opacity:0;visibility:hidden;transform:translateY(-10px);transition:opacity .3s,transform .45s var(--bk-ease),visibility .3s}
  .bk-mg.is-open .bk-mg__nav{opacity:1;visibility:visible;transform:none}
  .bk-mg__btn,.bk-mg__lnk{width:100%;justify-content:space-between;padding:15px 14px;font-size:17px}
  .bk-mg__panel,.bk-mg__panel--s{position:static;display:none;width:auto;left:auto;padding:6px 0 10px;border:0;box-shadow:none;background:transparent;opacity:1;visibility:visible;transform:none}
  .bk-mg__btn[aria-expanded=true]+.bk-mg__panel{display:grid}
  .bk-mg__cols{grid-template-columns:1fr}
  .bk-mg__feat{display:none}
}`,
    js: `document.querySelectorAll('.bk-mg').forEach(function (root) {
  var btns = [].slice.call(root.querySelectorAll('.bk-mg__btn'));
  var burger = root.querySelector('.bk-mg__burger');
  var timer = null;
  var canHover = window.matchMedia && window.matchMedia('(hover:hover) and (min-width:981px)').matches;
  function closeAll(except) { btns.forEach(function (b) { if (b !== except) b.setAttribute('aria-expanded', 'false'); }); }
  btns.forEach(function (b) {
    b.addEventListener('click', function () {
      var open = b.getAttribute('aria-expanded') !== 'true';
      closeAll(b);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    var grp = b.parentNode;
    grp.addEventListener('mouseenter', function () {
      if (!canHover) return;
      clearTimeout(timer); closeAll(b); b.setAttribute('aria-expanded', 'true');
    });
    grp.addEventListener('mouseleave', function () {
      if (!canHover) return;
      timer = setTimeout(function () { b.setAttribute('aria-expanded', 'false'); }, 160);
    });
  });
  document.addEventListener('click', function (e) { if (!root.contains(e.target)) closeAll(null); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var open = btns.filter(function (b) { return b.getAttribute('aria-expanded') === 'true'; })[0];
    closeAll(null);
    if (open) open.focus();
    root.classList.remove('is-open');
  });
  burger.addEventListener('click', function () {
    var o = !root.classList.contains('is-open');
    root.classList.toggle('is-open', o);
    burger.setAttribute('aria-expanded', o ? 'true' : 'false');
    burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  });
  root.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { root.classList.remove('is-open'); closeAll(null); }); });
  window.addEventListener('scroll', function () { root.classList.toggle('is-stuck', window.scrollY > 10); }, { passive: true });
});`,
  },
  {
    id: 'pro-nav-overlay', category: 'Pro Navbar', name: 'Navbar: full-screen overlay menu',
    description: 'Minimal top bar. The Menu button opens a circular-reveal full-screen overlay with giant numbered links, dim-siblings hover and contact details.',
    specs: ['Circle clip-path reveal from the button (0.9s)', 'Giant links (clamp 38px-96px) stagger in; hovering one dims the others', 'Esc closes, focus moves into the menu and back', 'Overlay uses position:fixed, so keep this block outside transformed parents', 'Contact column hides on small phones'],
    shared: ['pro'],
    html: `<header class="bk-p bk-ov" id="header">
  <div class="bk-ov__bar">
    <button class="bk-ov__btn" type="button" aria-expanded="false" aria-label="Open menu"><span class="bk-ov__ln"><i></i><i></i></span><em>Menu</em></button>
    <a class="bk-ov__logo" href="#home">Brand<span>.</span></a>
    <a class="bk-ov__talk" href="#contact">Let&rsquo;s talk ${AR}</a>
  </div>
  <div class="bk-ov__layer" aria-hidden="true">
    <nav class="bk-ov__links" aria-label="Menu">
      <a href="#home"><small>01</small>Home</a>
      <a href="#about"><small>02</small>About</a>
      <a href="#services"><small>03</small>Services</a>
      <a href="#gallery"><small>04</small>Work</a>
      <a href="#contact"><small>05</small>Contact</a>
    </nav>
    <div class="bk-ov__side"><div><h4>Say hello</h4><a href="#">hello@example.com</a><a href="#">+91 00000 00000</a></div><div><h4>Visit</h4><p>Street, City<br>Country</p></div><div class="bk-ov__soc"><a href="#">Instagram</a><a href="#">LinkedIn</a><a href="#">Behance</a></div></div>
  </div>
</header>`,
    css: `.bk-ov{position:sticky;top:0;z-index:100;background:#fff;border-bottom:1px solid var(--bk-line)}
.bk-ov.is-open{background:transparent;border-color:transparent}
.bk-ov__bar{position:relative;z-index:3;display:grid;grid-template-columns:1fr auto 1fr;align-items:center;max-width:1400px;margin:0 auto;padding:14px clamp(16px,3vw,36px)}
.bk-ov__btn{justify-self:start;display:inline-flex;align-items:center;gap:14px;padding:8px 18px 8px 8px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:border-color .3s,background .3s,color .3s}
.bk-ov__btn:hover{border-color:var(--bk-a)}
.bk-ov__btn:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:3px}
.bk-ov__btn em{font-style:normal}
.bk-ov__ln{position:relative;display:block;width:44px;height:44px;border-radius:50%;background:var(--bk-ink);transition:background .3s,transform .6s var(--bk-ease)}
.bk-ov__ln i{position:absolute;left:13px;width:18px;height:2px;border-radius:2px;background:#fff;transition:transform .5s var(--bk-ease),top .5s var(--bk-ease)}
.bk-ov__ln i:nth-child(1){top:17px}
.bk-ov__ln i:nth-child(2){top:25px}
.bk-ov__btn:hover .bk-ov__ln{background:var(--bk-a);transform:rotate(90deg)}
.bk-ov.is-open .bk-ov__ln i:nth-child(1){top:21px;transform:rotate(45deg)}
.bk-ov.is-open .bk-ov__ln i:nth-child(2){top:21px;transform:rotate(-45deg)}
.bk-ov.is-open .bk-ov__btn{border-color:rgba(255,255,255,.3);background:transparent;color:#fff}
.bk-ov__logo{font-size:24px;font-weight:800;letter-spacing:-.04em;color:var(--bk-ink);text-decoration:none;transition:color .4s}
.bk-ov__logo span{color:var(--bk-a)}
.bk-ov.is-open .bk-ov__logo{color:#fff}
.bk-ov__talk{justify-self:end;display:inline-flex;gap:8px;align-items:center;color:var(--bk-ink);font-weight:600;text-decoration:none;transition:color .3s}
.bk-ov__talk:hover{color:var(--bk-a)}
.bk-ov.is-open .bk-ov__talk{color:#fff}
.bk-ov__layer{position:fixed;inset:0;z-index:2;display:grid;grid-template-columns:1.6fr 1fr;gap:clamp(24px,5vw,80px);align-items:center;padding:100px clamp(20px,6vw,96px) 40px;background:radial-gradient(900px 600px at 85% 10%,color-mix(in srgb,var(--bk-a) 45%,#070b16),#070b16);color:#fff;clip-path:circle(0 at 52px 44px);visibility:hidden;transition:clip-path .9s var(--bk-ease),visibility 0s .9s;overflow:auto}
.bk-ov.is-open .bk-ov__layer{clip-path:circle(160% at 52px 44px);visibility:visible;transition:clip-path .9s var(--bk-ease),visibility 0s}
.bk-ov__links{display:grid;gap:clamp(2px,1vw,10px)}
.bk-ov__links a{display:flex;align-items:baseline;gap:18px;font-size:clamp(38px,8vw,96px);font-weight:800;letter-spacing:-.045em;line-height:1.05;color:#fff;text-decoration:none;opacity:0;transform:translateY(40px);transition:opacity .5s,transform .8s var(--bk-ease),color .35s,padding .5s var(--bk-ease)}
.bk-ov__links small{font-size:14px;font-weight:600;letter-spacing:.1em;color:var(--bk-a-m)}
.bk-ov.is-open .bk-ov__links a{opacity:1;transform:none;transition-delay:calc(.25s + var(--n,0) * .07s),calc(.25s + var(--n,0) * .07s),0s,0s}
.bk-ov__links:hover a{color:rgba(255,255,255,.3)}
.bk-ov__links a:hover{color:#fff;padding-left:18px}
.bk-ov__side{display:grid;gap:28px;font-size:16px;color:#b8c4dc;opacity:0;transform:translateY(24px);transition:opacity .6s .55s,transform .8s .55s var(--bk-ease)}
.bk-ov.is-open .bk-ov__side{opacity:1;transform:none}
.bk-ov__side h4{margin-bottom:8px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#7f90ad}
.bk-ov__side a{display:block;width:max-content;color:#fff;text-decoration:none;padding:3px 0;transition:color .3s,transform .4s var(--bk-ease)}
.bk-ov__side a:hover{color:var(--bk-a-m);transform:translateX(5px)}
.bk-ov__soc{display:flex;flex-wrap:wrap;gap:6px 22px}
@media (max-width:820px){.bk-ov__layer{grid-template-columns:1fr;align-content:center}.bk-ov__side{grid-template-columns:1fr 1fr}.bk-ov__soc{grid-column:1/-1}}
@media (max-width:520px){.bk-ov__btn em{display:none}.bk-ov__btn{padding:6px}.bk-ov__talk{font-size:14px}.bk-ov__side{display:none}}`,
    js: `document.querySelectorAll('.bk-ov').forEach(function (root) {
  var btn = root.querySelector('.bk-ov__btn');
  var layer = root.querySelector('.bk-ov__layer');
  var links = [].slice.call(layer.querySelectorAll('a'));
  root.querySelectorAll('.bk-ov__links a').forEach(function (a, i) { a.style.setProperty('--n', i); });
  function set(o) {
    root.classList.toggle('is-open', o);
    btn.setAttribute('aria-expanded', o ? 'true' : 'false');
    btn.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    layer.setAttribute('aria-hidden', o ? 'false' : 'true');
    links.forEach(function (a) { a.tabIndex = o ? 0 : -1; });
    if (o) setTimeout(function () { if (links[0]) links[0].focus(); }, 500); else btn.focus();
  }
  links.forEach(function (a) { a.tabIndex = -1; a.addEventListener('click', function () { set(false); }); });
  btn.addEventListener('click', function () { set(!root.classList.contains('is-open')); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('is-open')) set(false); });
});`,
  },

  // ============================== SECTIONS ==============================
  {
    id: 'pro-sticky-story', category: 'Pro Sections', name: 'Features: sticky scroll storytelling',
    description: 'A phone-style picture stays pinned while text steps scroll past. The picture cross-fades to match the active step. Premium product-page effect.',
    specs: ['position:sticky stage + IntersectionObserver for the active step', 'Cross-fade with scale between images, active step number fills with accent', 'Progress dots on the stage', 'Under 900px the stage is hidden and each step shows its own image', 'No scroll hijacking: normal scrolling, works with keyboard and touch'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-ss" id="features">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">How it works</span><h2>One scroll, the whole story</h2><p>Keep scrolling. The picture changes with each step.</p></div>
    <div class="bk-ss__grid">
      <div class="bk-ss__stage"><div class="bk-ss__frame">
        <img class="is-on" src="${img('bk-ss1', 700, 860)}" alt="Step one" loading="lazy"><img src="${img('bk-ss2', 700, 860)}" alt="Step two" loading="lazy"><img src="${img('bk-ss3', 700, 860)}" alt="Step three" loading="lazy"><img src="${img('bk-ss4', 700, 860)}" alt="Step four" loading="lazy">
        <div class="bk-ss__dots" aria-hidden="true"><i class="is-on"></i><i></i><i></i><i></i></div>
      </div></div>
      <div class="bk-ss__steps">
        <article class="bk-ss__step is-on"><span>01</span><h3>Tell us your goal</h3><p>Share what you want to achieve in plain words. We turn it into a clear, measurable plan.</p><img class="bk-ss__m" src="${img('bk-ss1', 700, 860)}" alt="" loading="lazy"></article>
        <article class="bk-ss__step"><span>02</span><h3>See it take shape</h3><p>Interactive prototypes let you click through the real experience before a line of code is written.</p><img class="bk-ss__m" src="${img('bk-ss2', 700, 860)}" alt="" loading="lazy"></article>
        <article class="bk-ss__step"><span>03</span><h3>Build and test</h3><p>Weekly releases, automated tests and real-device checks keep quality high from the first day.</p><img class="bk-ss__m" src="${img('bk-ss3', 700, 860)}" alt="" loading="lazy"></article>
        <article class="bk-ss__step"><span>04</span><h3>Launch and grow</h3><p>We go live together, then measure, learn and improve with data from real customers.</p><img class="bk-ss__m" src="${img('bk-ss4', 700, 860)}" alt="" loading="lazy"></article>
      </div>
    </div>
  </div>
</section>`,
    css: `.bk-ss{background:#fff}
.bk-ss__grid{display:grid;grid-template-columns:1fr 1fr;gap:clamp(32px,6vw,96px)}
.bk-ss__stage{position:relative}
.bk-ss__frame{position:sticky;top:12vh;overflow:hidden;width:min(100%,440px);margin:0 auto;aspect-ratio:4/5;border-radius:calc(var(--bk-r) + 10px);background:#0b1220;box-shadow:0 50px 90px -40px rgba(11,18,32,.6)}
.bk-ss__frame>img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.08);transition:opacity .8s var(--bk-ease),transform 1.2s var(--bk-ease)}
.bk-ss__frame>img.is-on{opacity:1;transform:none}
.bk-ss__dots{position:absolute;left:0;right:0;bottom:16px;display:flex;justify-content:center;gap:8px}
.bk-ss__dots i{width:8px;height:8px;border-radius:8px;background:rgba(255,255,255,.5);transition:width .5s var(--bk-ease),background .3s}
.bk-ss__dots i.is-on{width:30px;background:#fff}
.bk-ss__steps{display:grid}
.bk-ss__step{min-height:62vh;display:flex;flex-direction:column;justify-content:center;gap:14px;opacity:.3;transition:opacity .6s}
.bk-ss__step.is-on{opacity:1}
.bk-ss__step span{display:grid;place-items:center;width:54px;height:54px;border-radius:18px;background:var(--bk-a-l);color:var(--bk-a);font-weight:800;transition:background .5s,color .5s,transform .6s var(--bk-ease)}
.bk-ss__step.is-on span{background:var(--bk-a);color:#fff;transform:rotate(-6deg) scale(1.08)}
.bk-ss__step h3{font-size:clamp(26px,3.2vw,42px)}
.bk-ss__step p{max-width:460px;font-size:18px;color:var(--bk-mut)}
.bk-ss__m{display:none}
@media (max-width:900px){.bk-ss__grid{grid-template-columns:1fr}.bk-ss__stage{display:none}.bk-ss__step{min-height:0;opacity:1;padding:0 0 clamp(36px,8vw,56px)}.bk-ss__m{display:block;width:100%;max-width:460px;aspect-ratio:4/3;object-fit:cover;border-radius:var(--bk-r);margin-top:10px}}`,
    js: `document.querySelectorAll('.bk-ss').forEach(function (root) {
  var steps = [].slice.call(root.querySelectorAll('.bk-ss__step'));
  var imgs = [].slice.call(root.querySelectorAll('.bk-ss__frame>img'));
  var dots = [].slice.call(root.querySelectorAll('.bk-ss__dots i'));
  function on(i) {
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k === i); });
    imgs.forEach(function (m, k) { m.classList.toggle('is-on', k === i); });
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === i); });
  }
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (x) { if (x.isIntersecting) on(steps.indexOf(x.target)); });
  }, { rootMargin: '-45% 0px -45% 0px' });
  steps.forEach(function (s) { io.observe(s); });
});`,
  },
  {
    id: 'pro-products', category: 'Pro Sections', name: 'Shop: product cards with quick add',
    description: 'E-commerce cards: second photo on hover, colour swatches, animated wishlist heart, sale badge and a quick-add button that updates a cart counter.',
    specs: ['Image cross-fade on hover, quick-add slides up', 'Swatches change the card tint (data-color)', 'Wishlist heart pops with a burst; aria-pressed', 'Cart counter bumps and a toast confirms the add', '4 columns -> 3 -> 2 -> 1 (1180 / 860 / 520px)'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-sh" id="shop">
  <div class="bk-pw">
    <div class="bk-sh__top bk-rv"><div><span class="bk-pey">Shop</span><h2>New arrivals</h2></div><div class="bk-sh__cart" aria-live="polite">${I_BAG}<span>Cart</span><b>0</b></div></div>
    <div class="bk-sh__grid">
      <article class="bk-sh__card bk-rv" style="--i:0"><div class="bk-sh__pic"><img src="${img('bk-sh1a', 600, 750)}" alt="Linen shirt" loading="lazy"><img class="bk-sh__alt" src="${img('bk-sh1b', 600, 750)}" alt="" loading="lazy"><span class="bk-sh__badge">-20%</span><button class="bk-sh__fav" type="button" aria-pressed="false" aria-label="Add to wishlist">${I_HEART}</button><button class="bk-sh__add" type="button">${I_BAG}Quick add</button></div><div class="bk-sh__info"><div class="bk-sh__sw"><i style="--c:#0f172a" class="is-on"></i><i style="--c:#b45309"></i><i style="--c:#15803d"></i></div><h3>Linen shirt</h3><p><s>$65</s> <b>$52</b></p></div></article>
      <article class="bk-sh__card bk-rv" style="--i:1"><div class="bk-sh__pic"><img src="${img('bk-sh2a', 600, 750)}" alt="Canvas sneakers" loading="lazy"><img class="bk-sh__alt" src="${img('bk-sh2b', 600, 750)}" alt="" loading="lazy"><span class="bk-sh__badge bk-sh__badge--n">New</span><button class="bk-sh__fav" type="button" aria-pressed="false" aria-label="Add to wishlist">${I_HEART}</button><button class="bk-sh__add" type="button">${I_BAG}Quick add</button></div><div class="bk-sh__info"><div class="bk-sh__sw"><i style="--c:#e2e8f0" class="is-on"></i><i style="--c:#1d4ed8"></i></div><h3>Canvas sneakers</h3><p><b>$78</b></p></div></article>
      <article class="bk-sh__card bk-rv" style="--i:2"><div class="bk-sh__pic"><img src="${img('bk-sh3a', 600, 750)}" alt="Leather bag" loading="lazy"><img class="bk-sh__alt" src="${img('bk-sh3b', 600, 750)}" alt="" loading="lazy"><button class="bk-sh__fav" type="button" aria-pressed="false" aria-label="Add to wishlist">${I_HEART}</button><button class="bk-sh__add" type="button">${I_BAG}Quick add</button></div><div class="bk-sh__info"><div class="bk-sh__sw"><i style="--c:#78350f" class="is-on"></i><i style="--c:#0f172a"></i><i style="--c:#be123c"></i></div><h3>Leather bag</h3><p><b>$149</b></p></div></article>
      <article class="bk-sh__card bk-rv" style="--i:3"><div class="bk-sh__pic"><img src="${img('bk-sh4a', 600, 750)}" alt="Wool scarf" loading="lazy"><img class="bk-sh__alt" src="${img('bk-sh4b', 600, 750)}" alt="" loading="lazy"><span class="bk-sh__badge">-35%</span><button class="bk-sh__fav" type="button" aria-pressed="false" aria-label="Add to wishlist">${I_HEART}</button><button class="bk-sh__add" type="button">${I_BAG}Quick add</button></div><div class="bk-sh__info"><div class="bk-sh__sw"><i style="--c:#be123c" class="is-on"></i><i style="--c:#0f766e"></i></div><h3>Wool scarf</h3><p><s>$60</s> <b>$39</b></p></div></article>
    </div>
    <div class="bk-sh__toast" role="status" aria-live="polite"></div>
  </div>
</section>`,
    css: `.bk-sh{background:#fff}
.bk-sh__top{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:clamp(24px,4vw,44px)}
.bk-sh__top h2{font-size:clamp(30px,4.4vw,52px);margin-top:14px}
.bk-sh__cart{display:flex;align-items:center;gap:10px;padding:11px 18px;border-radius:999px;background:var(--bk-ink);color:#fff;font-weight:600;font-size:15px}
.bk-sh__cart b{display:grid;place-items:center;min-width:26px;height:26px;padding:0 6px;border-radius:13px;background:var(--bk-a);font-size:13px;transition:transform .5s var(--bk-ease)}
.bk-sh__cart.is-bump b{animation:bk-sh-bump .6s var(--bk-ease)}
@keyframes bk-sh-bump{0%{transform:scale(1)}35%{transform:scale(1.7)}100%{transform:scale(1)}}
.bk-sh__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(14px,2vw,28px)}
.bk-sh__card{--tint:transparent}
.bk-sh__pic{position:relative;overflow:hidden;aspect-ratio:4/5;border-radius:var(--bk-r);background:var(--bk-soft)}
.bk-sh__pic img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:opacity .6s,transform 1.1s var(--bk-ease)}
.bk-sh__pic::after{content:"";position:absolute;inset:0;background:var(--tint);mix-blend-mode:multiply;opacity:.55;transition:background .5s;pointer-events:none}
.bk-sh__alt{opacity:0}
.bk-sh__card:hover .bk-sh__alt{opacity:1}
.bk-sh__card:hover .bk-sh__pic img{transform:scale(1.06)}
.bk-sh__badge{position:absolute;z-index:2;left:14px;top:14px;padding:6px 13px;border-radius:999px;background:#dc2626;color:#fff;font-size:12.5px;font-weight:700}
.bk-sh__badge--n{background:var(--bk-a)}
.bk-sh__fav{position:absolute;z-index:3;right:12px;top:12px;display:grid;place-items:center;width:42px;height:42px;padding:0;border:0;border-radius:50%;background:#fff;color:var(--bk-ink);box-shadow:0 8px 18px -8px rgba(11,18,32,.5);cursor:pointer;transition:transform .5s var(--bk-ease),color .3s}
.bk-sh__fav:hover{transform:scale(1.12)}
.bk-sh__fav[aria-pressed=true]{color:#e11d48}
.bk-sh__fav[aria-pressed=true] svg{fill:#e11d48;animation:bk-sh-pop .5s var(--bk-ease)}
@keyframes bk-sh-pop{0%{transform:scale(.4)}60%{transform:scale(1.4)}100%{transform:scale(1)}}
.bk-sh__add{position:absolute;z-index:3;left:12px;right:12px;bottom:12px;display:flex;align-items:center;justify-content:center;gap:10px;padding:14px;border:0;border-radius:calc(var(--bk-r) - 8px);background:rgba(11,18,32,.92);color:#fff;font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;transform:translateY(calc(100% + 16px));transition:transform .6s var(--bk-ease),background .3s}
.bk-sh__card:hover .bk-sh__add,.bk-sh__add:focus-visible{transform:none}
.bk-sh__add:hover{background:var(--bk-a)}
@media (hover:none){.bk-sh__add{transform:none;padding:11px;font-size:14px}}
.bk-sh__info{padding:16px 4px 0}
.bk-sh__sw{display:flex;gap:7px;margin-bottom:10px}
.bk-sh__sw i{width:20px;height:20px;border-radius:50%;background:var(--c);border:2px solid #fff;box-shadow:0 0 0 1.5px var(--bk-line);cursor:pointer;transition:transform .4s var(--bk-ease),box-shadow .3s}
.bk-sh__sw i:hover{transform:scale(1.2)}
.bk-sh__sw i.is-on{box-shadow:0 0 0 2px var(--bk-ink)}
.bk-sh__info h3{font-size:18px;margin-bottom:4px}
.bk-sh__info p{color:var(--bk-mut)}
.bk-sh__info b{color:var(--bk-ink);font-size:17px}
.bk-sh__toast{position:fixed;left:50%;bottom:28px;z-index:130;padding:13px 22px;border-radius:999px;background:var(--bk-ink);color:#fff;font-weight:600;font-size:14px;box-shadow:0 20px 40px -16px rgba(11,18,32,.7);opacity:0;transform:translate(-50%,24px);pointer-events:none;transition:opacity .4s,transform .6s var(--bk-ease)}
.bk-sh__toast.is-show{opacity:1;transform:translate(-50%,0)}
@media (max-width:1180px){.bk-sh__grid{grid-template-columns:repeat(3,1fr)}.bk-sh__card:nth-child(4){display:none}}
@media (max-width:860px){.bk-sh__grid{grid-template-columns:repeat(2,1fr)}.bk-sh__card:nth-child(4){display:block}}
@media (max-width:520px){.bk-sh__grid{grid-template-columns:1fr 1fr;gap:12px}.bk-sh__cart span{display:none}}`,
    js: `document.querySelectorAll('.bk-sh').forEach(function (root) {
  var cart = root.querySelector('.bk-sh__cart');
  var count = cart.querySelector('b');
  var toast = root.querySelector('.bk-sh__toast');
  var n = 0, tt = null;
  root.querySelectorAll('.bk-sh__card').forEach(function (card) {
    var name = card.querySelector('h3').textContent;
    card.querySelectorAll('.bk-sh__sw i').forEach(function (sw) {
      sw.addEventListener('click', function () {
        card.querySelectorAll('.bk-sh__sw i').forEach(function (x) { x.classList.toggle('is-on', x === sw); });
        card.style.setProperty('--tint', sw.style.getPropertyValue('--c'));
      });
    });
    var fav = card.querySelector('.bk-sh__fav');
    fav.addEventListener('click', function () {
      fav.setAttribute('aria-pressed', fav.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
    });
    card.querySelector('.bk-sh__add').addEventListener('click', function () {
      n += 1; count.textContent = n;
      cart.classList.remove('is-bump'); void cart.offsetWidth; cart.classList.add('is-bump');
      toast.textContent = name + ' added to your cart';
      toast.classList.add('is-show');
      clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove('is-show'); }, 2200);
      // A real shop would send this to your cart API here.
    });
  });
});`,
  },
  {
    id: 'pro-services-list', category: 'Pro Sections', name: 'Services list: cursor-follow preview',
    description: 'Large editorial list. Hover a row and a photo glides after the cursor while other rows dim. Phones show a thumbnail in each row.',
    specs: ['Smooth eased follow (requestAnimationFrame lerp) on hover devices', 'Images cross-fade by row index (data-i)', 'Rows dim, shift and show an arrow on hover / focus', 'Under 820px: no floating image, each row shows a small thumbnail', 'Keyboard accessible rows'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-sl" id="services">
  <div class="bk-pw">
    <div class="bk-sl__head bk-rv"><span class="bk-pey">What we do</span><h2>Services that move your business</h2></div>
    <div class="bk-sl__list bk-rv" style="--i:1">
      <a class="bk-sl__row" href="#" data-i="0"><span>01</span><h3>Brand identity</h3><p>Logo, colour, type and voice</p><img class="bk-sl__th" src="${img('bk-sl1', 240, 160)}" alt="" loading="lazy"><i aria-hidden="true">&nearr;</i></a>
      <a class="bk-sl__row" href="#" data-i="1"><span>02</span><h3>Website design</h3><p>Fast, beautiful, converts</p><img class="bk-sl__th" src="${img('bk-sl2', 240, 160)}" alt="" loading="lazy"><i aria-hidden="true">&nearr;</i></a>
      <a class="bk-sl__row" href="#" data-i="2"><span>03</span><h3>Mobile apps</h3><p>iOS and Android, one codebase</p><img class="bk-sl__th" src="${img('bk-sl3', 240, 160)}" alt="" loading="lazy"><i aria-hidden="true">&nearr;</i></a>
      <a class="bk-sl__row" href="#" data-i="3"><span>04</span><h3>Digital marketing</h3><p>Search, social and email</p><img class="bk-sl__th" src="${img('bk-sl4', 240, 160)}" alt="" loading="lazy"><i aria-hidden="true">&nearr;</i></a>
      <div class="bk-sl__float" aria-hidden="true"><img class="is-on" src="${img('bk-sl1', 520, 380)}" alt=""><img src="${img('bk-sl2', 520, 380)}" alt=""><img src="${img('bk-sl3', 520, 380)}" alt=""><img src="${img('bk-sl4', 520, 380)}" alt=""></div>
    </div>
  </div>
</section>`,
    css: `.bk-sl{background:#fff}
.bk-sl__head{margin-bottom:clamp(28px,4vw,56px)}
.bk-sl__head h2{max-width:760px;margin-top:16px;font-size:clamp(32px,5vw,64px)}
.bk-sl__list{position:relative;border-top:1px solid var(--bk-line)}
.bk-sl__row{display:grid;grid-template-columns:70px 1.2fr 1fr 40px;align-items:center;gap:20px;padding:clamp(22px,3vw,40px) 6px;border-bottom:1px solid var(--bk-line);color:var(--bk-ink);text-decoration:none;transition:opacity .4s,padding .6s var(--bk-ease),background .4s}
.bk-sl__row span{font-weight:700;color:var(--bk-mut)}
.bk-sl__row h3{font-size:clamp(26px,4.4vw,58px);letter-spacing:-.04em;transition:color .4s,transform .6s var(--bk-ease)}
.bk-sl__row p{color:var(--bk-mut);font-size:clamp(15px,1.4vw,18px)}
.bk-sl__row i{font-style:normal;font-size:28px;color:var(--bk-a);opacity:0;transform:translate(-10px,10px);transition:opacity .4s,transform .6s var(--bk-ease)}
.bk-sl__list:hover .bk-sl__row{opacity:.35}
.bk-sl__list .bk-sl__row:hover,.bk-sl__list .bk-sl__row:focus-visible{opacity:1;padding-left:26px;background:linear-gradient(90deg,var(--bk-a-l),transparent);outline:0}
.bk-sl__row:hover h3,.bk-sl__row:focus-visible h3{color:var(--bk-a);transform:translateX(8px)}
.bk-sl__row:hover i,.bk-sl__row:focus-visible i{opacity:1;transform:none}
.bk-sl__th{display:none}
.bk-sl__float{position:absolute;left:0;top:0;z-index:5;width:clamp(200px,24vw,320px);aspect-ratio:4/3;overflow:hidden;border-radius:var(--bk-r);box-shadow:0 40px 70px -26px rgba(11,18,32,.6);pointer-events:none;opacity:0;transform:translate3d(0,0,0) scale(.8) rotate(-4deg);transition:opacity .35s,scale .5s var(--bk-ease)}
.bk-sl__float.is-show{opacity:1}
.bk-sl__float img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.15);transition:opacity .5s,transform .8s var(--bk-ease)}
.bk-sl__float img.is-on{opacity:1;transform:none}
@media (max-width:820px){.bk-sl__float{display:none}.bk-sl__row{grid-template-columns:1fr 84px;grid-template-areas:"t i" "p i";gap:4px 16px}.bk-sl__row span,.bk-sl__row>i{display:none}.bk-sl__row h3{grid-area:t}.bk-sl__row p{grid-area:p}.bk-sl__th{display:block;grid-area:i;grid-row:1 / span 2;width:84px;height:64px;object-fit:cover;border-radius:12px}.bk-sl__list:hover .bk-sl__row{opacity:1}}`,
    js: `document.querySelectorAll('.bk-sl__list').forEach(function (list) {
  var fl = list.querySelector('.bk-sl__float');
  var imgs = [].slice.call(fl.querySelectorAll('img'));
  var rows = [].slice.call(list.querySelectorAll('.bk-sl__row'));
  var canHover = window.matchMedia && window.matchMedia('(hover:hover) and (min-width:821px)').matches;
  if (!canHover) return;
  var tx = 0, ty = 0, x = 0, y = 0, raf = 0, running = false;
  function loop() {
    x += (tx - x) * 0.14; y += (ty - y) * 0.14;
    var rot = Math.max(-8, Math.min(8, (tx - x) * 0.25));
    fl.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(1) rotate(' + rot.toFixed(2) + 'deg)';
    if (running) raf = requestAnimationFrame(loop);
  }
  function show(i) { imgs.forEach(function (m, k) { m.classList.toggle('is-on', k === i); }); }
  list.addEventListener('pointermove', function (e) {
    var r = list.getBoundingClientRect();
    tx = e.clientX - r.left + 24; ty = e.clientY - r.top - fl.offsetHeight / 2;
  });
  rows.forEach(function (row) {
    row.addEventListener('mouseenter', function (e) {
      var r = list.getBoundingClientRect();
      if (!running) { x = tx = e.clientX - r.left + 24; y = ty = e.clientY - r.top - fl.offsetHeight / 2; running = true; loop(); }
      show(parseInt(row.getAttribute('data-i'), 10) || 0);
      fl.classList.add('is-show');
    });
  });
  list.addEventListener('mouseleave', function () { fl.classList.remove('is-show'); running = false; cancelAnimationFrame(raf); });
});`,
  },
  {
    id: 'pro-quote-select', category: 'Pro Sections', name: 'Testimonial: big quote + avatar picker',
    description: 'One large quote at a time. Click an avatar to switch, a progress bar shows the auto-advance, and the text slides smoothly.',
    specs: ['Auto-advance every 6s, pauses on hover/focus, stops for reduced motion users', 'Avatars scale and ring on hover, active avatar has a progress line', 'Arrow keys move between avatars (roving tabindex)', 'aria-live polite quote region', 'Large fluid quote type clamp(24px, 3.6vw, 44px)'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-qs" id="reviews">
  <div class="bk-pw bk-qs__in">
    <span class="bk-pey bk-rv">Client love</span>
    <div class="bk-qs__stage bk-rv" style="--i:1" aria-live="polite">
      <blockquote class="bk-qs__q is-on"><p>They understood our idea faster than we could explain it. The result looks great and works even better.</p><footer><b>Priya Sharma</b><span>Founder, Lumen</span></footer></blockquote>
      <blockquote class="bk-qs__q"><p>On time, on budget and a pleasure to work with. Our customers keep complimenting the new website.</p><footer><b>Rahul Verma</b><span>CEO, Northline</span></footer></blockquote>
      <blockquote class="bk-qs__q"><p>Clear communication every week and zero surprises. I would hire this team again without thinking twice.</p><footer><b>Anita Das</b><span>Director, Verde</span></footer></blockquote>
      <blockquote class="bk-qs__q"><p>Our sign-ups doubled in two months after the redesign. Beautiful work backed by real numbers.</p><footer><b>Sanjay Kumar</b><span>Marketing, Orbit</span></footer></blockquote>
    </div>
    <div class="bk-qs__pick bk-rv" style="--i:2" role="tablist" aria-label="Choose a testimonial">
      <button class="is-on" type="button" role="tab" aria-label="Priya Sharma"><img src="${img('bk-qs1', 120, 120)}" alt=""><i></i></button>
      <button type="button" role="tab" aria-label="Rahul Verma"><img src="${img('bk-qs2', 120, 120)}" alt=""><i></i></button>
      <button type="button" role="tab" aria-label="Anita Das"><img src="${img('bk-qs3', 120, 120)}" alt=""><i></i></button>
      <button type="button" role="tab" aria-label="Sanjay Kumar"><img src="${img('bk-qs4', 120, 120)}" alt=""><i></i></button>
    </div>
  </div>
</section>`,
    css: `.bk-qs{background:radial-gradient(900px 500px at 50% -10%,var(--bk-a-l),#fff 70%)}
.bk-qs__in{display:grid;justify-items:center;text-align:center}
.bk-qs__stage{position:relative;display:grid;max-width:980px;margin:34px 0 40px}
.bk-qs__stage::before{content:"\\201C";display:block;height:.45em;margin-bottom:10px;font-family:Georgia,serif;font-size:clamp(90px,12vw,160px);line-height:.9;color:var(--bk-a-m)}
.bk-qs__q{grid-area:2 / 1;margin:0;opacity:0;visibility:hidden;transform:translateY(24px);transition:opacity .6s,transform .9s var(--bk-ease),visibility .6s}
.bk-qs__q.is-on{opacity:1;visibility:visible;transform:none}
.bk-qs__q p{font-size:clamp(24px,3.6vw,44px);font-weight:600;letter-spacing:-.03em;line-height:1.28;color:var(--bk-ink)}
.bk-qs__q footer{margin-top:26px;display:flex;justify-content:center;gap:10px;flex-wrap:wrap;color:var(--bk-mut)}
.bk-qs__q footer b{color:var(--bk-ink)}
.bk-qs__stage{grid-template-rows:auto 1fr}
.bk-qs__pick{display:flex;gap:clamp(10px,2vw,20px)}
.bk-qs__pick button{position:relative;width:clamp(54px,7vw,76px);height:clamp(54px,7vw,76px);padding:0;border:0;border-radius:50%;background:transparent;cursor:pointer;opacity:.5;transition:opacity .4s,transform .6s var(--bk-ease)}
.bk-qs__pick button:hover{opacity:1;transform:translateY(-6px) scale(1.06)}
.bk-qs__pick button:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:4px}
.bk-qs__pick img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:3px solid #fff;box-shadow:0 12px 24px -12px rgba(11,18,32,.5)}
.bk-qs__pick i{position:absolute;left:12%;right:12%;bottom:-12px;height:3px;border-radius:3px;background:var(--bk-line);overflow:hidden}
.bk-qs__pick i::after{content:"";display:block;height:100%;width:0;background:var(--bk-a)}
.bk-qs__pick button.is-on{opacity:1;transform:scale(1.12)}
.bk-qs__pick button.is-on img{border-color:var(--bk-a)}
.bk-qs__pick button.is-on i::after{animation:bk-qs-fill 6s linear forwards}
.bk-qs__pick.is-paused button.is-on i::after{animation-play-state:paused}
@keyframes bk-qs-fill{to{width:100%}}
@media (max-width:560px){.bk-qs__stage::before{height:.3em}}`,
    js: `document.querySelectorAll('.bk-qs').forEach(function (root) {
  var qs = [].slice.call(root.querySelectorAll('.bk-qs__q'));
  var btns = [].slice.call(root.querySelectorAll('.bk-qs__pick button'));
  var pick = root.querySelector('.bk-qs__pick');
  var cur = 0, timer = null;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  function show(i) {
    cur = (i + qs.length) % qs.length;
    qs.forEach(function (q, k) { q.classList.toggle('is-on', k === cur); });
    btns.forEach(function (b, k) {
      var on = k === cur;
      b.classList.remove('is-on'); void b.offsetWidth;
      if (on) b.classList.add('is-on');
      b.setAttribute('aria-selected', on ? 'true' : 'false');
      b.tabIndex = on ? 0 : -1;
    });
  }
  function start() { stop(); if (still) return; timer = setTimeout(function () { show(cur + 1); start(); }, 6000); }
  function stop() { if (timer) clearTimeout(timer); timer = null; }
  btns.forEach(function (b, i) {
    b.addEventListener('click', function () { show(i); start(); });
    b.addEventListener('keydown', function (e) {
      var k = -1;
      if (e.key === 'ArrowRight') k = cur + 1; else if (e.key === 'ArrowLeft') k = cur - 1;
      if (k > -1) { e.preventDefault(); show(k); btns[cur].focus(); start(); }
    });
  });
  root.addEventListener('mouseenter', function () { stop(); pick.classList.add('is-paused'); });
  root.addEventListener('mouseleave', function () { pick.classList.remove('is-paused'); show(cur); start(); });
  show(0); start();
});`,
  },
  {
    id: 'pro-blog-feature', category: 'Pro Cards', name: 'Blog: featured post + list',
    description: 'One big featured story with overlay text and three compact rows with thumbnails. Titles underline, images zoom, arrows slide on hover.',
    specs: ['Featured card with gradient scrim and category chip', 'Rows: thumbnail zoom, animated title underline, reading time', 'Grid 1.3fr / 1fr -> single column under 900px', 'All cards are full links (large tap targets)'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-bg" id="blog">
  <div class="bk-pw">
    <div class="bk-bg__top bk-rv"><div><span class="bk-pey">Journal</span><h2>Latest from the blog</h2></div><a class="bk-pbtn bk-pbtn--ghost" href="#">All articles ${AR}</a></div>
    <div class="bk-bg__grid">
      <a class="bk-bg__feat bk-rv" href="#" style="background-image:url(${img('bk-bgf', 900, 900)})"><span class="bk-bg__chip">Strategy</span><div><small>12 Oct 2026 &middot; 8 min read</small><h3>How small teams win against giants with focus and speed</h3><p>Five habits we see in every fast-growing company, and how you can copy them this quarter.</p></div></a>
      <div class="bk-bg__list">
        <a class="bk-bg__row bk-rv" style="--i:1" href="#"><div class="bk-bg__th"><img src="${img('bk-bg1', 360, 280)}" alt="" loading="lazy"></div><div><span>Design</span><h3>The quiet power of white space</h3><small>5 min read</small></div></a>
        <a class="bk-bg__row bk-rv" style="--i:2" href="#"><div class="bk-bg__th"><img src="${img('bk-bg2', 360, 280)}" alt="" loading="lazy"></div><div><span>Engineering</span><h3>Making a website load in under one second</h3><small>7 min read</small></div></a>
        <a class="bk-bg__row bk-rv" style="--i:3" href="#"><div class="bk-bg__th"><img src="${img('bk-bg3', 360, 280)}" alt="" loading="lazy"></div><div><span>Growth</span><h3>What your analytics are not telling you</h3><small>6 min read</small></div></a>
      </div>
    </div>
  </div>
</section>`,
    css: `.bk-bg__top{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:20px;margin-bottom:clamp(26px,4vw,48px)}
.bk-bg__top h2{font-size:clamp(30px,4.4vw,52px);margin-top:14px}
.bk-bg__grid{display:grid;grid-template-columns:1.3fr 1fr;gap:clamp(16px,2.4vw,32px)}
.bk-bg__feat{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;min-height:clamp(420px,46vw,600px);padding:clamp(22px,3vw,40px);border-radius:calc(var(--bk-r) + 4px);background:#0b1220 center/cover no-repeat;color:#fff;text-decoration:none;isolation:isolate;background-size:100%;transition:background-size 1.4s var(--bk-ease)}
.bk-bg__feat::before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(180deg,transparent 25%,rgba(6,11,24,.92))}
.bk-bg__feat:hover{background-size:108%}
.bk-bg__chip{position:absolute;left:24px;top:24px;padding:7px 15px;border-radius:999px;background:var(--bk-a);font-size:13px;font-weight:700}
.bk-bg__feat small{color:#cbd6ec}
.bk-bg__feat h3{margin:10px 0;font-size:clamp(24px,3vw,38px);transition:transform .6s var(--bk-ease)}
.bk-bg__feat:hover h3{transform:translateX(8px)}
.bk-bg__feat p{max-width:520px;color:#d5def0}
.bk-bg__list{display:grid;gap:clamp(12px,1.6vw,20px);align-content:space-between}
.bk-bg__row{display:grid;grid-template-columns:clamp(110px,14vw,170px) 1fr;gap:clamp(14px,2vw,24px);align-items:center;padding:12px;border-radius:var(--bk-r);background:var(--bk-soft);border:1px solid transparent;color:var(--bk-ink);text-decoration:none;transition:background .4s,border-color .4s,transform .6s var(--bk-ease),box-shadow .5s}
.bk-bg__row:hover{background:#fff;border-color:var(--bk-line);transform:translateX(8px);box-shadow:var(--bk-sh)}
.bk-bg__th{overflow:hidden;aspect-ratio:4/3;border-radius:calc(var(--bk-r) - 8px)}
.bk-bg__th img{width:100%;height:100%;object-fit:cover;transition:transform 1s var(--bk-ease)}
.bk-bg__row:hover .bk-bg__th img{transform:scale(1.12)}
.bk-bg__row span{font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--bk-a)}
.bk-bg__row h3{margin:6px 0;font-size:clamp(17px,1.7vw,21px);line-height:1.25;background:linear-gradient(currentColor,currentColor) 0 100%/0 2px no-repeat;transition:background-size .6s var(--bk-ease);display:inline}
.bk-bg__row:hover h3{background-size:100% 2px}
.bk-bg__row small{display:block;margin-top:6px;color:var(--bk-mut)}
@media (max-width:900px){.bk-bg__grid{grid-template-columns:1fr}.bk-bg__feat{min-height:420px}}
@media (max-width:480px){.bk-bg__row{grid-template-columns:96px 1fr;padding:10px}}`,
    js: '',
  },
  {
    id: 'pro-dashboard', category: 'Pro Sections', name: 'Dashboard showcase (animated chart)',
    description: 'A browser-window product mockup: sidebar, KPI cards, a line chart that draws itself, bars that grow and a live activity list. It tilts flat on scroll.',
    specs: ['Pure HTML/CSS/SVG, no chart library', 'Line draws with stroke-dashoffset when scrolled into view', 'Bars grow, KPI numbers count up (data-count)', '3D perspective tilt that flattens on hover', 'Sidebar hides under 760px, KPI grid 3 -> 1 column'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-db" id="product">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Product</span><h2>Your whole business at a glance</h2><p>A clean dashboard your team will actually open every morning.</p></div>
    <div class="bk-db__stage"><div class="bk-db__win bk-rv bk-rv--z" style="--i:1">
      <div class="bk-db__chrome"><i></i><i></i><i></i><span>app.brand.com/dashboard</span></div>
      <div class="bk-db__body">
        <aside class="bk-db__side"><b></b><span class="is-on"></span><span></span><span></span><span></span><span></span></aside>
        <div class="bk-db__main">
          <div class="bk-db__kpis">
            <div><small>Revenue</small><strong data-count="48250" data-pre="$">$0</strong><em>+12.4%</em></div>
            <div><small>Customers</small><strong data-count="2840" data-pre="">0</strong><em>+8.1%</em></div>
            <div><small>Conversion</small><strong data-count="64" data-pre="" data-suf="%">0%</strong><em>+3.2%</em></div>
          </div>
          <div class="bk-db__row">
            <div class="bk-db__chart"><small>Revenue over time</small><svg viewBox="0 0 400 160" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="bk-db-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".35"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs><path class="bk-db__area" d="M0 130 C40 110 60 120 90 95 S150 70 190 85 S250 40 290 55 S350 20 400 28 L400 160 L0 160Z" fill="url(#bk-db-g)"/><path class="bk-db__line" d="M0 130 C40 110 60 120 90 95 S150 70 190 85 S250 40 290 55 S350 20 400 28"/></svg></div>
            <div class="bk-db__bars"><small>By channel</small><div><i style="--h:80%"></i><i style="--h:55%"></i><i style="--h:92%"></i><i style="--h:40%"></i><i style="--h:66%"></i></div></div>
          </div>
          <ul class="bk-db__feed"><li><span></span><b>New order #4821</b><em>2 min ago</em></li><li><span></span><b>Payment received</b><em>9 min ago</em></li><li><span></span><b>New customer joined</b><em>21 min ago</em></li></ul>
        </div>
      </div>
    </div></div>
  </div>
</section>`,
    css: `.bk-db{background:linear-gradient(180deg,var(--bk-soft),#fff)}
.bk-db__stage{perspective:1600px}
.bk-db__win{overflow:hidden;border-radius:calc(var(--bk-r) + 2px);background:#fff;border:1px solid var(--bk-line);box-shadow:0 60px 110px -50px rgba(11,18,32,.6);transform:rotateX(9deg) scale(.96);transform-origin:center top;transition:transform 1.2s var(--bk-ease),opacity .9s var(--bk-ease)}
.bk-js .bk-db__win.bk-rv{transform:rotateX(14deg) scale(.9)}
.bk-db__win.is-in,.bk-js .bk-db__win.bk-rv.is-in{transform:rotateX(0) scale(1)}
.bk-db__chrome{display:flex;align-items:center;gap:7px;padding:13px 16px;background:var(--bk-soft);border-bottom:1px solid var(--bk-line)}
.bk-db__chrome i{width:11px;height:11px;border-radius:50%;background:#cbd5e1}
.bk-db__chrome i:nth-child(1){background:#f87171}.bk-db__chrome i:nth-child(2){background:#fbbf24}.bk-db__chrome i:nth-child(3){background:#4ade80}
.bk-db__chrome span{margin:0 auto;padding:5px 24px;border-radius:999px;background:#fff;border:1px solid var(--bk-line);font-size:12px;color:var(--bk-mut)}
.bk-db__body{display:grid;grid-template-columns:72px 1fr}
.bk-db__side{display:grid;align-content:start;justify-items:center;gap:14px;padding:20px 0;border-right:1px solid var(--bk-line);background:var(--bk-soft)}
.bk-db__side b{width:32px;height:32px;margin-bottom:8px;border-radius:10px;background:linear-gradient(135deg,var(--bk-a),var(--bk-a2))}
.bk-db__side span{width:34px;height:34px;border-radius:11px;background:#e5e9f0;transition:background .3s,transform .4s var(--bk-ease)}
.bk-db__side span:hover{transform:scale(1.12);background:var(--bk-a-m)}
.bk-db__side span.is-on{background:var(--bk-a)}
.bk-db__main{display:grid;gap:clamp(12px,1.6vw,20px);padding:clamp(14px,2vw,26px)}
.bk-db__kpis{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(10px,1.4vw,18px)}
.bk-db__kpis div{padding:16px 18px;border-radius:16px;border:1px solid var(--bk-line);background:#fff;transition:transform .5s var(--bk-ease),box-shadow .4s}
.bk-db__kpis div:hover{transform:translateY(-5px);box-shadow:var(--bk-sh)}
.bk-db small{font-size:12.5px;color:var(--bk-mut)}
.bk-db__kpis strong{display:block;margin:4px 0;font-size:clamp(20px,2.6vw,30px);letter-spacing:-.03em}
.bk-db__kpis em{font-style:normal;font-size:12.5px;font-weight:700;color:#16a34a}
.bk-db__row{display:grid;grid-template-columns:1.6fr 1fr;gap:clamp(10px,1.4vw,18px)}
.bk-db__chart,.bk-db__bars{padding:16px 18px;border-radius:16px;border:1px solid var(--bk-line)}
.bk-db__chart svg{display:block;width:100%;height:clamp(110px,14vw,170px);margin-top:10px;color:var(--bk-a)}
.bk-db__line{fill:none;stroke:var(--bk-a);stroke-width:3;stroke-linecap:round;vector-effect:non-scaling-stroke;stroke-dasharray:1;stroke-dashoffset:1}
.bk-db__area{opacity:0;transition:opacity 1.2s .9s}
.bk-db__win.is-in .bk-db__line{animation:bk-db-draw 2s .3s var(--bk-ease) forwards}
.bk-db__win.is-in .bk-db__area{opacity:1}
@keyframes bk-db-draw{to{stroke-dashoffset:0}}
.bk-db__bars>div{display:flex;align-items:flex-end;gap:10px;height:clamp(110px,14vw,170px);margin-top:10px}
.bk-db__bars i{flex:1;height:var(--h);border-radius:8px 8px 3px 3px;background:linear-gradient(180deg,var(--bk-a),var(--bk-a-m));transform-origin:bottom;transform:scaleY(0);transition:transform 1s var(--bk-ease)}
.bk-db__win.is-in .bk-db__bars i{transform:scaleY(1)}
.bk-db__bars i:nth-child(2){transition-delay:.1s}.bk-db__bars i:nth-child(3){transition-delay:.2s}.bk-db__bars i:nth-child(4){transition-delay:.3s}.bk-db__bars i:nth-child(5){transition-delay:.4s}
.bk-db__feed{display:grid;gap:8px;margin:0;padding:0;list-style:none}
.bk-db__feed li{display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:14px;background:var(--bk-soft);font-size:14px;transition:transform .4s var(--bk-ease),background .3s}
.bk-db__feed li:hover{transform:translateX(6px);background:var(--bk-a-l)}
.bk-db__feed span{width:10px;height:10px;border-radius:50%;background:var(--bk-a);box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-db__feed b{flex:1}
.bk-db__feed em{font-style:normal;font-size:12.5px;color:var(--bk-mut)}
@media (max-width:760px){.bk-db__body{grid-template-columns:1fr}.bk-db__side{display:none}.bk-db__kpis{grid-template-columns:1fr}.bk-db__row{grid-template-columns:1fr}}`,
    js: `document.querySelectorAll('.bk-db__win').forEach(function (win) {
  var line = win.querySelector('.bk-db__line');
  if (line && line.pathLength !== undefined) line.setAttribute('pathLength', '1');
  var nums = [].slice.call(win.querySelectorAll('[data-count]'));
  var done = false;
  function count() {
    if (done) return; done = true;
    nums.forEach(function (n) {
      var end = parseFloat(n.getAttribute('data-count')) || 0;
      var pre = n.getAttribute('data-pre') || '', suf = n.getAttribute('data-suf') || '';
      var t0 = null;
      function tick(t) {
        if (t0 === null) t0 = t;
        var p = Math.min((t - t0) / 1800, 1), e = 1 - Math.pow(1 - p, 3);
        n.textContent = pre + Math.round(end * e).toLocaleString() + suf;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  if (!('IntersectionObserver' in window)) { win.classList.add('is-in'); count(); return; }
  var io = new IntersectionObserver(function (l) {
    l.forEach(function (x) { if (x.isIntersecting) { win.classList.add('is-in'); count(); io.disconnect(); } });
  }, { threshold: 0.25 });
  io.observe(win);
});`,
  },

  // ============================== FORMS ==============================
  {
    id: 'pro-booking', category: 'Pro Forms', name: 'Booking stepper (clinic / salon / services)',
    description: 'Three-step appointment flow: choose a service, pick a date and time slot, enter details. Progress bar, summary, validation and an animated confirmation.',
    specs: ['Step 1 service cards, step 2 next 7 days + time slots (generated by JS), step 3 contact form', 'Progress bar + step dots, Back / Next, blocks moving on until the step is valid', 'Live summary card, aria-live error messages', 'Edit the SERVICES / times directly in the HTML (data-price / data-time)', 'Layout: form + summary side by side -> stacked under 900px', 'No backend: replace the marked line with fetch() to your server'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-bk" id="booking">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Book online</span><h2>Book your appointment</h2><p>Three quick steps. We will confirm by phone or email.</p></div>
    <div class="bk-bk__card bk-rv bk-rv--z" style="--i:1">
      <form class="bk-bk__form" novalidate>
        <div class="bk-bk__prog" aria-hidden="true"><i></i></div>
        <ol class="bk-bk__steps" aria-hidden="true"><li class="is-on"><b>1</b>Service</li><li><b>2</b>Date &amp; time</li><li><b>3</b>Your details</li></ol>
        <div class="bk-bk__pane is-on" data-step="0">
          <h3>Choose a service</h3>
          <div class="bk-bk__svc">
            <label><input type="radio" name="bk-svc" value="General consultation" data-price="500"><span><em>${I_USER}</em><b>General consultation</b><small>30 min &middot; $20</small></span></label>
            <label><input type="radio" name="bk-svc" value="Skin &amp; hair care" data-price="900"><span><em>${IC.heart}</em><b>Skin &amp; hair care</b><small>45 min &middot; $35</small></span></label>
            <label><input type="radio" name="bk-svc" value="Full health check" data-price="2400"><span><em>${IC.shield}</em><b>Full health check</b><small>90 min &middot; $95</small></span></label>
            <label><input type="radio" name="bk-svc" value="Follow-up visit" data-price="300"><span><em>${IC.check}</em><b>Follow-up visit</b><small>15 min &middot; $12</small></span></label>
          </div>
        </div>
        <div class="bk-bk__pane" data-step="1">
          <h3>Pick a date and time</h3>
          <div class="bk-bk__days"></div>
          <div class="bk-bk__times"><button type="button">09:00 AM</button><button type="button">10:30 AM</button><button type="button">12:00 PM</button><button type="button">02:00 PM</button><button type="button">03:30 PM</button><button type="button">05:00 PM</button></div>
        </div>
        <div class="bk-bk__pane" data-step="2">
          <h3>Your details</h3>
          <div class="bk-bk__fields">
            <label>Full name<input type="text" name="name" required autocomplete="name" placeholder="Your name"></label>
            <label>Phone<input type="tel" name="phone" required pattern="[0-9+ ()-]{8,}" autocomplete="tel" placeholder="+91 00000 00000"></label>
            <label class="bk-bk__wide">Email<input type="email" name="email" required autocomplete="email" placeholder="you@example.com"></label>
            <label class="bk-bk__wide">Notes (optional)<textarea name="notes" rows="3" placeholder="Anything we should know?"></textarea></label>
          </div>
        </div>
        <p class="bk-bk__err" role="alert" aria-live="assertive"></p>
        <div class="bk-bk__nav"><button class="bk-pbtn bk-pbtn--ghost bk-bk__back" type="button">Back</button><button class="bk-pbtn bk-bk__next" type="submit">Continue ${AR}</button></div>
        <div class="bk-bk__ok" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg><h3>You are booked!</h3><p class="bk-bk__okmsg">We will confirm your appointment shortly.</p><button class="bk-pbtn bk-pbtn--ghost bk-bk__again" type="button">Book another</button></div>
      </form>
      <aside class="bk-bk__sum"><h4>Your booking</h4><dl><div><dt>${I_USER} Service</dt><dd class="bk-bk__s0">Not chosen yet</dd></div><div><dt>${I_CAL} Date</dt><dd class="bk-bk__s1">Not chosen yet</dd></div><div><dt>${IC.clock} Time</dt><dd class="bk-bk__s2">Not chosen yet</dd></div></dl><p class="bk-bk__help">Need help? Call <a href="#">+91 00000 00000</a></p></aside>
    </div>
  </div>
</section>`,
    css: `.bk-bk{background:var(--bk-soft)}
.bk-bk__card{display:grid;grid-template-columns:1.6fr 1fr;overflow:hidden;max-width:1060px;margin:0 auto;border-radius:calc(var(--bk-r) + 8px);background:#fff;box-shadow:0 50px 90px -44px rgba(11,18,32,.55)}
.bk-bk__form{position:relative;padding:clamp(22px,3.4vw,44px);display:grid;gap:22px;align-content:start}
.bk-bk__prog{height:5px;border-radius:5px;background:var(--bk-line);overflow:hidden}
.bk-bk__prog i{display:block;height:100%;width:33.33%;border-radius:5px;background:linear-gradient(90deg,var(--bk-a),var(--bk-a2));transition:width .7s var(--bk-ease)}
.bk-bk__steps{display:flex;justify-content:space-between;gap:8px;margin:0;padding:0;list-style:none;font-size:13px;font-weight:600;color:var(--bk-mut)}
.bk-bk__steps li{display:flex;align-items:center;gap:8px;transition:color .3s}
.bk-bk__steps b{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:var(--bk-line);color:var(--bk-mut);font-size:12px;transition:background .4s,color .4s,transform .5s var(--bk-ease)}
.bk-bk__steps li.is-on{color:var(--bk-ink)}
.bk-bk__steps li.is-on b,.bk-bk__steps li.is-done b{background:var(--bk-a);color:#fff}
.bk-bk__steps li.is-on b{transform:scale(1.15)}
.bk-bk__pane{display:none}
.bk-bk__pane.is-on{display:block;animation:bk-bk-in .6s var(--bk-ease)}
@keyframes bk-bk-in{from{opacity:0;transform:translateX(26px)}to{opacity:1;transform:none}}
.bk-bk__pane h3{margin-bottom:16px;font-size:22px}
.bk-bk__svc{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.bk-bk__svc input{position:absolute;opacity:0;pointer-events:none}
.bk-bk__svc label{display:block;cursor:pointer}
.bk-bk__svc span{display:grid;gap:3px;padding:16px;border-radius:18px;border:1.5px solid var(--bk-line);transition:border-color .3s,background .3s,transform .5s var(--bk-ease),box-shadow .4s}
.bk-bk__svc em{display:grid;place-items:center;width:42px;height:42px;margin-bottom:6px;border-radius:13px;background:var(--bk-a-l);color:var(--bk-a);transition:background .3s,color .3s}
.bk-bk__svc small{color:var(--bk-mut)}
.bk-bk__svc label:hover span{transform:translateY(-4px);border-color:var(--bk-a-m)}
.bk-bk__svc input:checked+span{border-color:var(--bk-a);background:var(--bk-a-l);box-shadow:0 14px 26px -16px var(--bk-a)}
.bk-bk__svc input:checked+span em{background:var(--bk-a);color:#fff}
.bk-bk__svc input:focus-visible+span{outline:3px solid var(--bk-a-m);outline-offset:2px}
.bk-bk__days{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;margin-bottom:18px}
.bk-bk__days button,.bk-bk__times button{padding:10px 4px;border:1.5px solid var(--bk-line);border-radius:14px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:border-color .3s,background .3s,color .3s,transform .4s var(--bk-ease)}
.bk-bk__days button{display:grid;gap:2px}
.bk-bk__days small{font-size:11px;font-weight:600;color:var(--bk-mut)}
.bk-bk__days b{font-size:18px}
.bk-bk__times{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.bk-bk__days button:hover,.bk-bk__times button:hover{transform:translateY(-3px);border-color:var(--bk-a-m)}
.bk-bk__days button.is-on,.bk-bk__times button.is-on{background:var(--bk-a);border-color:var(--bk-a);color:#fff}
.bk-bk__days button.is-on small{color:rgba(255,255,255,.8)}
.bk-bk__fields{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.bk-bk__fields label{display:grid;gap:6px;font-size:14px;font-weight:600;color:#334155}
.bk-bk__wide{grid-column:1/-1}
.bk-bk__fields input,.bk-bk__fields textarea{width:100%;padding:13px 14px;border:1.5px solid var(--bk-line);border-radius:14px;font-family:inherit;font-size:15px;font-weight:400;color:var(--bk-ink);transition:border-color .3s,box-shadow .3s}
.bk-bk__fields input:focus,.bk-bk__fields textarea:focus{outline:0;border-color:var(--bk-a);box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-bk__fields .is-bad{border-color:#dc2626}
.bk-bk__err{min-height:1.3em;font-size:14px;font-weight:600;color:#dc2626}
.bk-bk__nav{display:flex;justify-content:space-between;gap:12px}
.bk-bk__back[hidden]{display:none}
.bk-bk__nav .bk-bk__next{margin-left:auto}
.bk-bk__sum{padding:clamp(22px,3.4vw,44px);background:linear-gradient(160deg,#0b1220,color-mix(in srgb,var(--bk-a) 35%,#0b1220));color:#fff;display:grid;align-content:start;gap:18px}
.bk-bk__sum h4{font-size:20px}
.bk-bk__sum dl{display:grid;gap:14px;margin:0}
.bk-bk__sum dt{display:flex;align-items:center;gap:8px;font-size:12.5px;letter-spacing:.06em;text-transform:uppercase;color:#93a4c4}
.bk-bk__sum dt svg{width:18px;height:18px}
.bk-bk__sum dd{margin:4px 0 0;font-size:17px;font-weight:600;transition:color .3s}
.bk-bk__sum dd.is-set{color:var(--bk-a-m)}
.bk-bk__help{margin-top:10px;padding-top:18px;border-top:1px solid rgba(255,255,255,.14);font-size:14px;color:#a9b7d0}
.bk-bk__help a{color:#fff}
.bk-bk__ok{position:absolute;inset:0;z-index:2;display:grid;place-content:center;justify-items:center;gap:10px;padding:30px;text-align:center;background:#fff;opacity:0;visibility:hidden;transition:opacity .4s,visibility .4s}
.bk-bk__ok svg{width:96px;height:96px;fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.bk-bk__ok circle{stroke:var(--bk-a-m);stroke-dasharray:151;stroke-dashoffset:151}
.bk-bk__ok path{stroke:var(--bk-a);stroke-dasharray:50;stroke-dashoffset:50}
.bk-bk__ok p{max-width:340px;color:var(--bk-mut)}
.bk-bk__form.is-done .bk-bk__ok{opacity:1;visibility:visible}
.bk-bk__form.is-done .bk-bk__ok circle{animation:bk-bk-draw .8s .1s forwards}
.bk-bk__form.is-done .bk-bk__ok path{animation:bk-bk-draw .5s .7s forwards}
@keyframes bk-bk-draw{to{stroke-dashoffset:0}}
@media (max-width:900px){.bk-bk__card{grid-template-columns:1fr}.bk-bk__sum{order:-1;grid-template-columns:repeat(3,1fr);align-items:start}.bk-bk__sum h4,.bk-bk__help{grid-column:1/-1}.bk-bk__sum dl{display:contents}}
@media (max-width:560px){.bk-bk__svc,.bk-bk__fields{grid-template-columns:1fr}.bk-bk__times{grid-template-columns:repeat(2,1fr)}.bk-bk__days{grid-template-columns:repeat(4,1fr)}.bk-bk__steps{font-size:0}.bk-bk__steps b{font-size:12px}.bk-bk__sum{grid-template-columns:1fr}}`,
    js: `document.querySelectorAll('.bk-bk__form').forEach(function (form) {
  var panes = [].slice.call(form.querySelectorAll('.bk-bk__pane'));
  var steps = [].slice.call(form.querySelectorAll('.bk-bk__steps li'));
  var prog = form.querySelector('.bk-bk__prog i');
  var back = form.querySelector('.bk-bk__back');
  var next = form.querySelector('.bk-bk__next');
  var err = form.querySelector('.bk-bk__err');
  var card = form.closest('.bk-bk__card');
  var days = form.querySelector('.bk-bk__days');
  var times = [].slice.call(form.querySelectorAll('.bk-bk__times button'));
  var sum = [0, 1, 2].map(function (i) { return card.querySelector('.bk-bk__s' + i); });
  var step = 0, date = '', time = '';
  var names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var count = window.innerWidth < 560 ? 8 : 7;
  for (var i = 1; i <= count; i++) {
    var d = new Date(); d.setDate(d.getDate() + i);
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('data-label', names[d.getDay()] + ', ' + d.getDate() + ' ' + months[d.getMonth()] + ' ' + d.getFullYear());
    b.innerHTML = '<small>' + names[d.getDay()] + '</small><b>' + d.getDate() + '</b>';
    days.appendChild(b);
  }
  function setSum(i, v) { sum[i].textContent = v || 'Not chosen yet'; sum[i].classList.toggle('is-set', !!v); }
  days.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    [].slice.call(days.children).forEach(function (x) { x.classList.toggle('is-on', x === b); });
    date = b.getAttribute('data-label'); setSum(1, date); err.textContent = '';
  });
  times.forEach(function (t) {
    t.addEventListener('click', function () {
      times.forEach(function (x) { x.classList.toggle('is-on', x === t); });
      time = t.textContent; setSum(2, time); err.textContent = '';
    });
  });
  form.querySelectorAll('input[name=bk-svc]').forEach(function (r) {
    r.addEventListener('change', function () { setSum(0, r.value); err.textContent = ''; });
  });
  function show(n) {
    step = n;
    panes.forEach(function (p, k) { p.classList.toggle('is-on', k === n); });
    steps.forEach(function (s, k) { s.classList.toggle('is-on', k === n); s.classList.toggle('is-done', k < n); });
    prog.style.width = ((n + 1) / panes.length * 100) + '%';
    back.hidden = n === 0;
    next.firstChild.nodeValue = n === panes.length - 1 ? 'Confirm booking ' : 'Continue ';
    err.textContent = '';
  }
  function valid() {
    if (step === 0 && !form.querySelector('input[name=bk-svc]:checked')) { err.textContent = 'Please choose a service to continue.'; return false; }
    if (step === 1 && (!date || !time)) { err.textContent = !date ? 'Please pick a date.' : 'Please pick a time slot.'; return false; }
    if (step === 2) {
      var ok = true;
      form.querySelectorAll('.bk-bk__fields input').forEach(function (f) { var bad = !f.checkValidity(); f.classList.toggle('is-bad', bad); if (bad) ok = false; });
      if (!ok) { err.textContent = 'Please fill in your name, a valid phone number and email.'; return false; }
    }
    return true;
  }
  back.addEventListener('click', function () { if (step > 0) show(step - 1); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!valid()) return;
    if (step < panes.length - 1) { show(step + 1); return; }
    // To really book, replace this comment with a fetch() POST to your server (service, date, time, name, phone, email).
    form.querySelector('.bk-bk__okmsg').textContent = 'See you on ' + date + ' at ' + time + '. We will confirm shortly.';
    form.classList.add('is-done');
  });
  form.querySelector('.bk-bk__again').addEventListener('click', function () {
    form.classList.remove('is-done'); form.reset(); date = ''; time = '';
    [].slice.call(days.children).concat(times).forEach(function (x) { x.classList.remove('is-on'); });
    setSum(0, ''); setSum(1, ''); setSum(2, ''); show(0);
  });
  show(0);
});`,
  },
  {
    id: 'pro-auth', category: 'Pro Forms', name: 'Auth: sign in / sign up with strength meter',
    description: 'Split screen: brand panel with a quote on the left, a card with sliding Sign in / Sign up tabs, show-password eye, password strength meter and social buttons.',
    specs: ['Sliding tab indicator, panes cross-fade', 'Show / hide password with aria-pressed', 'Strength meter (length, case, number, symbol) with colour + label', 'Inline validation messages, social buttons are placeholders', 'Split -> single card under 900px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-au" id="login">
  <div class="bk-au__art"><div class="bk-au__logo">Brand<span>.</span></div><blockquote><p>&ldquo;The fastest way we ever got our team onboarded. It simply feels right.&rdquo;</p><footer><img src="${img('bk-au1', 96, 96)}" alt=""><div><b>Meera Iyer</b><span>Head of Operations</span></div></footer></blockquote><i class="bk-au__o bk-au__o--1" aria-hidden="true"></i><i class="bk-au__o bk-au__o--2" aria-hidden="true"></i></div>
  <div class="bk-au__side">
    <div class="bk-au__card">
      <div class="bk-au__tabs" role="tablist"><span class="bk-au__ind" aria-hidden="true"></span><button class="is-on" type="button" role="tab" aria-selected="true">Sign in</button><button type="button" role="tab" aria-selected="false">Sign up</button></div>
      <form class="bk-au__pane is-on" novalidate data-kind="in">
        <h2>Welcome back</h2><p>Enter your details to continue.</p>
        <label>Email<input type="email" required placeholder="you@example.com" autocomplete="email"></label>
        <label>Password<span class="bk-au__pw"><input type="password" required minlength="6" placeholder="Your password" autocomplete="current-password"><button type="button" aria-label="Show password" aria-pressed="false">${I_EYE}</button></span></label>
        <div class="bk-au__row"><label class="bk-au__chk"><input type="checkbox"> Remember me</label><a href="#">Forgot password?</a></div>
        <button class="bk-pbtn" type="submit">Sign in ${AR}</button>
        <p class="bk-au__msg" role="status" aria-live="polite"></p>
      </form>
      <form class="bk-au__pane" novalidate data-kind="up">
        <h2>Create account</h2><p>Start your free 14-day trial.</p>
        <label>Full name<input type="text" required placeholder="Your name" autocomplete="name"></label>
        <label>Email<input type="email" required placeholder="you@example.com" autocomplete="email"></label>
        <label>Password<span class="bk-au__pw"><input class="bk-au__np" type="password" required minlength="8" placeholder="At least 8 characters" autocomplete="new-password"><button type="button" aria-label="Show password" aria-pressed="false">${I_EYE}</button></span></label>
        <div class="bk-au__meter" aria-hidden="true"><i></i><i></i><i></i><i></i><span>Enter a password</span></div>
        <button class="bk-pbtn" type="submit">Create account ${AR}</button>
        <p class="bk-au__msg" role="status" aria-live="polite"></p>
      </form>
      <div class="bk-au__or"><span>or continue with</span></div>
      <div class="bk-au__soc"><button type="button">Google</button><button type="button">GitHub</button></div>
    </div>
  </div>
</section>`,
    css: `.bk-au{display:grid;grid-template-columns:1fr 1fr;min-height:clamp(620px,90vh,860px);background:#fff}
.bk-au__art{position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:clamp(28px,5vw,64px);background:linear-gradient(150deg,#0b1220,color-mix(in srgb,var(--bk-a) 55%,#0b1220));color:#fff}
.bk-au__logo{font-size:26px;font-weight:800;letter-spacing:-.04em}
.bk-au__logo span{color:var(--bk-a-m)}
.bk-au__art blockquote{position:relative;z-index:2;margin:0;max-width:480px}
.bk-au__art p{font-size:clamp(22px,2.6vw,32px);font-weight:600;letter-spacing:-.02em;line-height:1.3}
.bk-au__art footer{display:flex;align-items:center;gap:14px;margin-top:26px}
.bk-au__art footer img{width:52px;height:52px;border-radius:50%;object-fit:cover;border:2px solid rgba(255,255,255,.4)}
.bk-au__art footer b{display:block}
.bk-au__art footer span{font-size:14px;color:#b8c4dc}
.bk-au__o{position:absolute;border-radius:50%;background:radial-gradient(circle,var(--bk-a) 0,transparent 70%);opacity:.5;animation:bk-bob 8s ease-in-out infinite}
.bk-au__o--1{width:420px;height:420px;right:-140px;top:-120px}
.bk-au__o--2{width:300px;height:300px;left:-90px;bottom:-90px;animation-delay:-4s;background:radial-gradient(circle,var(--bk-a2) 0,transparent 70%)}
.bk-au__side{display:grid;place-items:center;padding:clamp(20px,4vw,48px);background:var(--bk-soft)}
.bk-au__card{width:100%;max-width:440px;padding:clamp(22px,3vw,36px);border-radius:calc(var(--bk-r) + 6px);background:#fff;border:1px solid var(--bk-line);box-shadow:0 40px 80px -44px rgba(11,18,32,.5)}
.bk-au__tabs{position:relative;display:grid;grid-template-columns:1fr 1fr;padding:5px;margin-bottom:24px;border-radius:999px;background:var(--bk-soft)}
.bk-au__tabs button{position:relative;z-index:1;padding:11px;border:0;border-radius:999px;background:transparent;color:var(--bk-mut);font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:color .3s}
.bk-au__tabs button.is-on{color:var(--bk-ink)}
.bk-au__tabs button:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:-2px}
.bk-au__ind{position:absolute;top:5px;bottom:5px;left:5px;width:calc(50% - 5px);border-radius:999px;background:#fff;box-shadow:0 6px 16px -8px rgba(11,18,32,.4);transition:transform .55s var(--bk-ease)}
.bk-au__card.is-up .bk-au__ind{transform:translateX(100%)}
.bk-au__pane{display:none;gap:16px}
.bk-au__pane.is-on{display:grid;animation:bk-au-in .55s var(--bk-ease)}
@keyframes bk-au-in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
.bk-au__pane h2{font-size:28px}
.bk-au__pane>p{margin-top:-8px;color:var(--bk-mut)}
.bk-au__pane label{display:grid;gap:7px;font-size:14px;font-weight:600;color:#334155}
.bk-au__pane input[type=text],.bk-au__pane input[type=email],.bk-au__pane input[type=password]{width:100%;padding:13px 14px;border:1.5px solid var(--bk-line);border-radius:14px;font-family:inherit;font-size:15px;font-weight:400;color:var(--bk-ink);transition:border-color .3s,box-shadow .3s}
.bk-au__pane input:focus{outline:0;border-color:var(--bk-a);box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-au__pane input.is-bad{border-color:#dc2626}
.bk-au__pw{position:relative;display:block}
.bk-au__pw input{padding-right:48px!important}
.bk-au__pw button{position:absolute;right:6px;top:50%;display:grid;place-items:center;width:38px;height:38px;margin-top:-19px;border:0;border-radius:10px;background:transparent;color:var(--bk-mut);cursor:pointer;transition:background .3s,color .3s}
.bk-au__pw button:hover,.bk-au__pw button[aria-pressed=true]{background:var(--bk-a-l);color:var(--bk-a)}
.bk-au__row{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:14px}
.bk-au__row a{color:var(--bk-a);text-decoration:none;font-weight:600}
.bk-au__row a:hover{text-decoration:underline}
.bk-au__chk{display:flex!important;grid-auto-flow:column;align-items:center;gap:8px!important;font-weight:500!important}
.bk-au__chk input{width:17px;height:17px;accent-color:var(--bk-a)}
.bk-au__meter{display:grid;grid-template-columns:repeat(4,1fr) auto;align-items:center;gap:6px;margin-top:-6px}
.bk-au__meter i{height:6px;border-radius:6px;background:var(--bk-line);transition:background .4s}
.bk-au__meter span{padding-left:6px;font-size:12.5px;font-weight:600;color:var(--bk-mut);min-width:84px}
.bk-au__meter[data-s="1"] i:nth-child(-n+1){background:#ef4444}
.bk-au__meter[data-s="2"] i:nth-child(-n+2){background:#f59e0b}
.bk-au__meter[data-s="3"] i:nth-child(-n+3){background:#84cc16}
.bk-au__meter[data-s="4"] i:nth-child(-n+4){background:#16a34a}
.bk-au__msg{min-height:1.3em;font-size:14px;font-weight:600;color:#dc2626}
.bk-au__msg.is-ok{color:#16a34a}
.bk-au__pane .bk-pbtn{width:100%}
.bk-au__or{position:relative;margin:22px 0 16px;text-align:center;font-size:13px;color:var(--bk-mut)}
.bk-au__or::before{content:"";position:absolute;left:0;right:0;top:50%;height:1px;background:var(--bk-line)}
.bk-au__or span{position:relative;padding:0 12px;background:#fff}
.bk-au__soc{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.bk-au__soc button{padding:12px;border:1.5px solid var(--bk-line);border-radius:14px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:15px;font-weight:600;cursor:pointer;transition:transform .45s var(--bk-ease),border-color .3s,background .3s}
.bk-au__soc button:hover{transform:translateY(-3px);border-color:var(--bk-a-m);background:var(--bk-a-l)}
@media (max-width:900px){.bk-au{grid-template-columns:1fr}.bk-au__art{display:none}.bk-au__side{min-height:100vh;padding:24px 16px}}`,
    js: `document.querySelectorAll('.bk-au__card').forEach(function (card) {
  var tabs = [].slice.call(card.querySelectorAll('.bk-au__tabs button'));
  var panes = [].slice.call(card.querySelectorAll('.bk-au__pane'));
  function pick(i) {
    card.classList.toggle('is-up', i === 1);
    tabs.forEach(function (t, k) { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    panes.forEach(function (p, k) { p.classList.toggle('is-on', k === i); });
  }
  tabs.forEach(function (t, i) { t.addEventListener('click', function () { pick(i); }); });
  card.querySelectorAll('.bk-au__pw button').forEach(function (b) {
    b.addEventListener('click', function () {
      var inp = b.parentNode.querySelector('input');
      var show = inp.type === 'password';
      inp.type = show ? 'text' : 'password';
      b.setAttribute('aria-pressed', show ? 'true' : 'false');
      b.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });
  var np = card.querySelector('.bk-au__np');
  var meter = card.querySelector('.bk-au__meter');
  if (np && meter) {
    var label = meter.querySelector('span');
    var words = ['Enter a password', 'Weak', 'Fair', 'Good', 'Strong'];
    np.addEventListener('input', function () {
      var v = np.value, s = 0;
      if (v.length >= 8) s++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
      if (/[0-9]/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      if (!v) s = 0; else if (s === 0) s = 1;
      meter.setAttribute('data-s', s);
      label.textContent = words[s];
    });
  }
  panes.forEach(function (form) {
    var msg = form.querySelector('.bk-au__msg');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('input[required]').forEach(function (f) { var bad = !f.checkValidity(); f.classList.toggle('is-bad', bad); if (bad) ok = false; });
      msg.className = 'bk-au__msg' + (ok ? ' is-ok' : '');
      msg.textContent = ok ? (form.getAttribute('data-kind') === 'up' ? 'Account created. Welcome aboard!' : 'Signed in successfully.') : 'Please fix the highlighted fields.';
      // Real sign-in / sign-up must be checked on your server. Never check passwords in browser code.
    });
  });
});`,
  },
  {
    id: 'pro-news-confetti', category: 'Pro Forms', name: 'Newsletter: glass card + confetti burst',
    description: 'Frosted card over a moving gradient. Subscribing fires a confetti burst from the button and shows a success message.',
    specs: ['Backdrop-blur glass card on animated gradient blobs', 'Confetti is 36 DOM particles (no canvas / library), skipped for reduced motion', 'Email validation with aria-live message', 'Input + button stack under 520px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-nc" id="newsletter">
  <i class="bk-nc__b bk-nc__b--1" aria-hidden="true"></i><i class="bk-nc__b bk-nc__b--2" aria-hidden="true"></i><i class="bk-nc__b bk-nc__b--3" aria-hidden="true"></i>
  <div class="bk-nc__card bk-rv bk-rv--z">
    <span class="bk-nc__ic">${IC.mail}</span>
    <h2>Get the good stuff, monthly</h2>
    <p>Design ideas, product news and honest advice. Join 12,000+ readers. Unsubscribe anytime.</p>
    <form class="bk-nc__form" novalidate><input type="email" required placeholder="Enter your email" aria-label="Email address"><button class="bk-pbtn bk-pbtn--light" type="submit">Subscribe ${AR}</button></form>
    <p class="bk-nc__msg" role="status" aria-live="polite"></p>
  </div>
</section>`,
    css: `.bk-nc{position:relative;overflow:hidden;display:grid;place-items:center;padding:clamp(64px,9vw,120px) clamp(16px,4vw,40px);background:#0b1220}
.bk-nc__b{position:absolute;border-radius:50%;filter:blur(60px);opacity:.75;animation:bk-nc-move 14s ease-in-out infinite alternate}
.bk-nc__b--1{width:420px;height:420px;left:8%;top:-10%;background:var(--bk-a)}
.bk-nc__b--2{width:360px;height:360px;right:6%;bottom:-12%;background:var(--bk-a2);animation-delay:-5s}
.bk-nc__b--3{width:260px;height:260px;left:46%;top:30%;background:var(--bk-a-m);opacity:.4;animation-delay:-9s}
@keyframes bk-nc-move{to{transform:translate3d(60px,40px,0) scale(1.2)}}
.bk-nc__card{position:relative;z-index:1;width:100%;max-width:640px;padding:clamp(28px,5vw,56px);border-radius:calc(var(--bk-r) + 10px);background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.22);-webkit-backdrop-filter:blur(22px) saturate(1.4);backdrop-filter:blur(22px) saturate(1.4);box-shadow:0 50px 100px -40px rgba(0,0,0,.8);text-align:center;color:#fff}
.bk-nc__ic{display:inline-grid;place-items:center;width:64px;height:64px;margin-bottom:18px;border-radius:20px;background:rgba(255,255,255,.16);animation:bk-bob 4s ease-in-out infinite}
.bk-nc__ic svg{width:30px;height:30px}
.bk-nc__card h2{font-size:clamp(28px,4vw,44px);margin-bottom:12px}
.bk-nc__card>p{color:#cbd6ec}
.bk-nc__form{position:relative;display:flex;gap:8px;margin-top:28px;padding:7px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.22);transition:box-shadow .4s,border-color .3s}
.bk-nc__form:focus-within{border-color:#fff;box-shadow:0 0 0 5px rgba(255,255,255,.18)}
.bk-nc__form input{flex:1;min-width:0;padding:0 18px;border:0;background:transparent;color:#fff;font-family:inherit;font-size:16px;outline:0}
.bk-nc__form input::placeholder{color:#b8c4dc}
.bk-nc__form .bk-pbtn{padding:14px 24px;white-space:nowrap;overflow:visible}
.bk-nc__msg{min-height:1.4em;margin-top:14px;font-weight:600;font-size:15px;color:#fff}
.bk-nc__dot{position:absolute;left:50%;top:50%;width:var(--s);height:var(--s);margin:calc(var(--s) / -2) 0 0 calc(var(--s) / -2);border-radius:var(--r);background:var(--c);pointer-events:none;z-index:5;animation:bk-nc-pop 1.1s cubic-bezier(.1,.7,.3,1) forwards}
@keyframes bk-nc-pop{0%{transform:translate(0,0) rotate(0) scale(1);opacity:1}100%{transform:translate(var(--x),var(--y)) rotate(var(--rot)) scale(.6);opacity:0}}
@media (max-width:520px){.bk-nc__form{flex-direction:column;border-radius:26px;padding:10px}.bk-nc__form input{padding:14px 16px}.bk-nc__form .bk-pbtn{width:100%}}`,
    js: `document.querySelectorAll('.bk-nc__form').forEach(function (form) {
  var msg = form.parentNode.querySelector('.bk-nc__msg');
  var btn = form.querySelector('button');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var colors = ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#ffffff', '#a78bfa'];
  function burst() {
    if (still) return;
    for (var i = 0; i < 36; i++) {
      var d = document.createElement('i');
      d.className = 'bk-nc__dot';
      var a = Math.random() * Math.PI * 2, dist = 90 + Math.random() * 190;
      d.style.setProperty('--x', Math.cos(a) * dist + 'px');
      d.style.setProperty('--y', (Math.sin(a) * dist - 60) + 'px');
      d.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      d.style.setProperty('--s', (6 + Math.random() * 8) + 'px');
      d.style.setProperty('--r', Math.random() > 0.5 ? '50%' : '2px');
      d.style.setProperty('--c', colors[i % colors.length]);
      btn.parentNode.appendChild(d);
      (function (x) { setTimeout(function () { x.remove(); }, 1200); })(d);
    }
  }
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = form.querySelector('input').checkValidity();
    msg.textContent = ok ? 'You are in! Check your inbox to confirm.' : 'Please enter a valid email address.';
    // To really subscribe people, send the email to your server or mailing service here.
    if (ok) { burst(); form.reset(); }
  });
});`,
  },
];
