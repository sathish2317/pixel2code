import type { Block } from './blocks';
import { AR, IC, img, svg } from './proShared';

const I_HEART = svg('<path d="M12 21s-8-5.2-8-11a4.6 4.6 0 018-3 4.6 4.6 0 018 3c0 5.8-8 11-8 11z"/>', 20);
const I_BED = svg('<path d="M3 18V7M3 14h18v4M21 14v-2a3 3 0 00-3-3h-7v5"/><circle cx="7" cy="11" r="1.6"/>', 18);
const I_BATH = svg('<path d="M4 12h16v3a4 4 0 01-4 4H8a4 4 0 01-4-4zM6 12V6a2 2 0 014 0M7 19l-1 2M17 19l1 2"/>', 18);
const I_AREA = svg('<path d="M4 4h16v16H4zM4 10h6v10"/>', 18);
const I_BOOK = svg('<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 19V5"/>', 18);
const I_PLAY = svg('<path d="M8 5l11 7-11 7z" fill="currentColor"/>', 18);
const I_PHONE = IC.phone;
const I_CHAT = svg('<path d="M4 5h16v11H9l-5 4z"/>', 24);
const I_PLUS = svg('<path d="M12 5v14M5 12h14"/>', 26, 2.6);
const I_X = svg('<path d="M6 6l12 12M18 6L6 18"/>', 20, 2.4);
const I_MAIL = IC.mail;

/** PRO blocks, part E: timeline, parallax stats, menu, property, courses, spotlight pricing, steps, wall, portfolio, cookie, modal, footer, speed dial, page header, article, coverflow, newsletter. */
export const PRO_E: Block[] = [
  {
    id: 'pro-timeline-h', category: 'Pro Sections', name: 'Horizontal timeline (scroll-draw)',
    description: 'Company history on a horizontal line that draws itself as you scroll. Milestones pop up one by one, alternating above and below the line.',
    specs: ['Progress line fills when the section enters view (CSS transition)', 'Alternating up / down cards, nodes pulse once active', 'Desktop: horizontal scroll-snap; phones: vertical timeline', 'Add a milestone by copying one <li>'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-tl" id="history">
  <div class="bk-pw"><div class="bk-ph bk-rv"><span class="bk-pey">Our journey</span><h2>25 years of getting better</h2></div></div>
  <div class="bk-tl__scroll"><div class="bk-tl__line"><i></i></div>
  <ol class="bk-tl__list">
    <li class="bk-rv" style="--i:0"><span class="bk-tl__dot"></span><div><b>1998</b><h3>First clinic opens</h3><p>Two doctors and a dream in a small rented room.</p></div></li>
    <li class="bk-rv" style="--i:1"><span class="bk-tl__dot"></span><div><b>2005</b><h3>50-bed hospital</h3><p>We build our own hospital with a 24/7 emergency unit.</p></div></li>
    <li class="bk-rv" style="--i:2"><span class="bk-tl__dot"></span><div><b>2012</b><h3>Cardiac centre</h3><p>Advanced heart care arrives in the city.</p></div></li>
    <li class="bk-rv" style="--i:3"><span class="bk-tl__dot"></span><div><b>2018</b><h3>Digital records</h3><p>Online reports, booking and video consults.</p></div></li>
    <li class="bk-rv" style="--i:4"><span class="bk-tl__dot"></span><div><b>2024</b><h3>12,000 patients a year</h3><p>Nationally recognised for patient satisfaction.</p></div></li>
  </ol></div>
</section>`,
    css: `.bk-tl{background:#fff;overflow:hidden}
.bk-tl__scroll{position:relative;overflow-x:auto;padding:0 clamp(18px,4vw,40px) 20px;scrollbar-width:thin}
.bk-tl__line{position:absolute;left:0;right:0;top:50%;height:4px;margin-top:-2px;background:var(--bk-line);min-width:900px;border-radius:4px}
.bk-tl__line i{position:absolute;left:0;top:0;bottom:0;width:0;border-radius:4px;background:linear-gradient(90deg,var(--bk-a),var(--bk-a2));transition:width 2.4s var(--bk-ease)}
.bk-tl.is-draw .bk-tl__line i{width:100%}
.bk-tl__list{position:relative;display:grid;grid-template-columns:repeat(5,minmax(200px,1fr));margin:0;padding:0;list-style:none;min-width:1000px;min-height:380px}
.bk-tl__list li{position:relative;display:flex;align-items:flex-end;justify-content:center;padding:0 12px}
.bk-tl__list li:nth-child(even){align-items:flex-start}
.bk-tl__list li>div{width:100%;max-width:230px;padding:20px 22px;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh);text-align:left;transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t),border-color .3s;margin-bottom:46px}
.bk-tl__list li:nth-child(even)>div{margin:46px 0 0}
.bk-tl__list li>div:hover{transform:translateY(-8px);border-color:var(--bk-a);box-shadow:0 30px 50px -26px var(--bk-a)}
.bk-tl__list b{display:inline-block;margin-bottom:8px;padding:3px 12px;border-radius:999px;background:var(--bk-a);color:#fff;font-size:13px}
.bk-tl__list h3{margin-bottom:4px;font-size:19px}
.bk-tl__list p{font-size:14.5px;color:var(--bk-mut)}
.bk-tl__dot{position:absolute;left:50%;top:50%;width:20px;height:20px;margin:-10px 0 0 -10px;border-radius:50%;background:#fff;border:4px solid var(--bk-a);z-index:2}
.bk-tl__dot::after{content:"";position:absolute;inset:-8px;border-radius:50%;border:2px solid var(--bk-a);opacity:0}
.bk-tl.is-draw .bk-tl__dot::after{animation:bk-pulse 2.4s ease-out infinite}
@media (max-width:760px){.bk-tl__scroll{overflow:visible}.bk-tl__line{left:calc(clamp(18px,4vw,40px) + 9px);right:auto;top:0;bottom:0;width:4px;height:auto;min-width:0;margin:0}.bk-tl__line i{width:100%;height:0;transition:height 2.4s var(--bk-ease)}.bk-tl.is-draw .bk-tl__line i{width:100%;height:100%}.bk-tl__list{display:block;min-width:0;min-height:0}.bk-tl__list li,.bk-tl__list li:nth-child(even){display:block;padding:0 0 22px 46px}.bk-tl__list li>div,.bk-tl__list li:nth-child(even)>div{margin:0;max-width:none}.bk-tl__dot{left:9px;top:22px;margin:0}}`,
    js: `document.querySelectorAll('.bk-tl').forEach(function (root) {
  if (!('IntersectionObserver' in window)) { root.classList.add('is-draw'); return; }
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { root.classList.add('is-draw'); o.disconnect(); } }, { threshold: 0.25 }).observe(root);
});`,
  },
  {
    id: 'pro-parallax-band', category: 'Pro Extras', name: 'Parallax counter band',
    description: 'Full-width photo band with a slow parallax background and four big counters that count up when seen. Perfect between two content sections.',
    specs: ['Background shifts with scroll (transform, no jank)', 'Counters ease-out up to data-to, with suffix (+, %, k)', '4 columns -> 2 -> stacked, text stays centred', 'Reduced motion: shows final numbers, no parallax'],
    shared: ['pro'],
    html: `<section class="bk-p bk-pb">
  <div class="bk-pb__bg" style="--bg:url(${img('bk-band', 1800, 900)})"></div>
  <div class="bk-pw bk-pb__in">
    <div class="bk-pb__c bk-rv" style="--i:0"><b><span data-to="25">0</span>+</b><small>Years of experience</small></div>
    <div class="bk-pb__c bk-rv" style="--i:1"><b><span data-to="12">0</span>k</b><small>Happy patients</small></div>
    <div class="bk-pb__c bk-rv" style="--i:2"><b><span data-to="45">0</span>+</b><small>Expert doctors</small></div>
    <div class="bk-pb__c bk-rv" style="--i:3"><b><span data-to="98">0</span>%</b><small>Satisfaction rate</small></div>
  </div>
</section>`,
    css: `.bk-pb{position:relative;overflow:hidden;color:#fff;padding:clamp(60px,9vw,120px) 0}
.bk-pb__bg{position:absolute;left:0;right:0;top:-15%;bottom:-15%;background:linear-gradient(rgba(8,14,30,.72),rgba(8,14,30,.78)),var(--bg) center/cover;will-change:transform}
.bk-pb__in{position:relative;display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(18px,3vw,40px);text-align:center}
.bk-pb__c{position:relative;padding:8px 10px}
.bk-pb__c:not(:last-child)::after{content:"";position:absolute;right:calc(clamp(18px,3vw,40px) / -2);top:15%;bottom:15%;width:1px;background:rgba(255,255,255,.2)}
.bk-pb__c b{display:block;font-size:clamp(44px,7vw,92px);font-weight:800;letter-spacing:-.05em;line-height:1;background:linear-gradient(180deg,#fff,var(--bk-a-m));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
.bk-pb__c small{display:block;margin-top:10px;font-size:clamp(13px,1.4vw,16px);letter-spacing:.1em;text-transform:uppercase;color:#d5def0}
@media (max-width:760px){.bk-pb__in{grid-template-columns:1fr 1fr;row-gap:34px}.bk-pb__c::after{display:none}}`,
    js: `document.querySelectorAll('.bk-pb').forEach(function (root) {
  var bg = root.querySelector('.bk-pb__bg');
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var nums = [].slice.call(root.querySelectorAll('[data-to]'));
  function setAll() { nums.forEach(function (n) { n.textContent = n.getAttribute('data-to'); }); }
  function run() {
    if (still) { setAll(); return; }
    nums.forEach(function (n) {
      var to = parseFloat(n.getAttribute('data-to')), t0 = null;
      function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1800); n.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(f); }
      requestAnimationFrame(f);
    });
  }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { run(); o.disconnect(); } }, { threshold: 0.3 }).observe(root); else setAll();
  if (!still) {
    var tick = false;
    function par() { var r = root.getBoundingClientRect(); var p = (r.top + r.height / 2 - window.innerHeight / 2) / window.innerHeight; bg.style.transform = 'translate3d(0,' + (p * -60).toFixed(1) + 'px,0)'; tick = false; }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(par); } }, { passive: true }); par();
  }
});`,
  },
  {
    id: 'pro-menu-tabs', category: 'Pro Sections', name: 'Restaurant menu with category tabs',
    description: 'Elegant menu with category tabs (Starters, Mains, Desserts, Drinks). Dishes fade in with a stagger; each row has a dotted leader line to the price and a veg / spicy tag.',
    specs: ['ARIA tabs, arrow-key navigation, staggered dish reveal on switch', 'Photo + dotted-leader price rows', 'Veg dot and spicy tags (CSS only)', '2 columns -> 1; tabs scroll sideways on phones'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-mn" id="menu">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Our menu</span><h2>Made fresh, every single day</h2></div>
    <div class="bk-mn__tabs bk-rv" style="--i:1" role="tablist"><button class="is-on" type="button" role="tab">Starters</button><button type="button" role="tab">Mains</button><button type="button" role="tab">Desserts</button><button type="button" role="tab">Drinks</button></div>
    <div class="bk-mn__panel is-on" role="tabpanel"><div class="bk-mn__pic"><img src="${img('bk-m1', 640, 760)}" alt="Starters" loading="lazy"></div><ul>
      <li><div><h3>Crispy paneer tikka <i class="v"></i></h3><p>Charred cottage cheese, mint chutney, onion salad</p></div><span>$9</span></li>
      <li><div><h3>Prawn koliwada <em>Spicy</em></h3><p>Gram flour crust, curry leaf, lemon</p></div><span>$12</span></li>
      <li><div><h3>Wild mushroom soup <i class="v"></i></h3><p>Cream, thyme, toasted sourdough</p></div><span>$8</span></li>
      <li><div><h3>Chicken 65 <em>Spicy</em></h3><p>Crisp fried, yoghurt, green chilli</p></div><span>$10</span></li></ul></div>
    <div class="bk-mn__panel" role="tabpanel" hidden><div class="bk-mn__pic"><img src="${img('bk-m2', 640, 760)}" alt="Mains" loading="lazy"></div><ul>
      <li><div><h3>Saffron lamb biryani</h3><p>Aged basmati, slow-cooked lamb, raita</p></div><span>$18</span></li>
      <li><div><h3>Butter chicken</h3><p>Tandoori chicken, tomato cream, naan</p></div><span>$16</span></li>
      <li><div><h3>Garden vegetable korma <i class="v"></i></h3><p>Cashew sauce, seasonal vegetables, jeera rice</p></div><span>$14</span></li>
      <li><div><h3>Chettinad fish curry <em>Spicy</em></h3><p>Pan-seared fish, roasted spices, coconut</p></div><span>$19</span></li></ul></div>
    <div class="bk-mn__panel" role="tabpanel" hidden><div class="bk-mn__pic"><img src="${img('bk-m3', 640, 760)}" alt="Desserts" loading="lazy"></div><ul>
      <li><div><h3>Gulab jamun tart <i class="v"></i></h3><p>Warm syrup, pistachio, vanilla cream</p></div><span>$7</span></li>
      <li><div><h3>Mango kulfi <i class="v"></i></h3><p>Slow-frozen, cardamom, almond</p></div><span>$6</span></li>
      <li><div><h3>Dark chocolate pot <i class="v"></i></h3><p>70% cocoa, sea salt, olive oil</p></div><span>$8</span></li></ul></div>
    <div class="bk-mn__panel" role="tabpanel" hidden><div class="bk-mn__pic"><img src="${img('bk-m4', 640, 760)}" alt="Drinks" loading="lazy"></div><ul>
      <li><div><h3>Masala chai <i class="v"></i></h3><p>Brewed with fresh ginger and cardamom</p></div><span>$3</span></li>
      <li><div><h3>Rose lassi <i class="v"></i></h3><p>Churned yoghurt, rose, saffron</p></div><span>$5</span></li>
      <li><div><h3>Fresh lime soda <i class="v"></i></h3><p>Sweet, salted or mixed</p></div><span>$4</span></li></ul></div>
  </div>
</section>`,
    css: `.bk-mn{--bk-hf:"Playfair Display",Georgia,serif;background:#fffaf3}
.bk-mn__tabs{display:flex;justify-content:center;gap:8px;margin-bottom:clamp(26px,4vw,46px);overflow-x:auto;padding:4px;scrollbar-width:none}
.bk-mn__tabs::-webkit-scrollbar{display:none}
.bk-mn__tabs button{flex:none;padding:12px 28px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-mut);font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-mn__tabs button:hover{transform:translateY(-3px);color:var(--bk-a)}
.bk-mn__tabs button.is-on{background:var(--bk-ink);border-color:var(--bk-ink);color:#fff}
.bk-mn__panel{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(22px,4vw,56px);align-items:center}
.bk-mn__panel[hidden]{display:none}
.bk-mn__pic{overflow:hidden;border-radius:240px 240px var(--bk-r) var(--bk-r);aspect-ratio:1/1.12;box-shadow:0 40px 70px -36px rgba(11,18,32,.5)}
.bk-mn__pic img{width:100%;height:100%;object-fit:cover;transition:transform 1.4s var(--bk-ease)}
.bk-mn__pic:hover img{transform:scale(1.07)}
.bk-mn__panel ul{display:grid;gap:clamp(18px,2.4vw,28px);margin:0;padding:0;list-style:none}
.bk-mn__panel li{display:flex;align-items:flex-start;gap:14px;justify-content:space-between;padding-bottom:18px;border-bottom:2px dotted var(--bk-line);opacity:0;transform:translateY(18px)}
.bk-mn__panel.is-on li{animation:bk-mn-in .7s var(--bk-ease) forwards;animation-delay:calc(var(--n,0) * 90ms)}
@keyframes bk-mn-in{to{opacity:1;transform:none}}
.bk-mn__panel h3{display:flex;align-items:center;flex-wrap:wrap;gap:10px;font-family:var(--bk-hf);font-size:clamp(19px,2vw,24px);font-weight:600}
.bk-mn__panel p{margin-top:4px;font-size:15px;color:var(--bk-mut)}
.bk-mn__panel li>span{font-family:var(--bk-hf);font-size:22px;font-weight:700;color:var(--bk-a);transition:transform .4s var(--bk-ease)}
.bk-mn__panel li:hover>span{transform:scale(1.2)}
.bk-mn__panel i.v{display:inline-block;width:16px;height:16px;border:2px solid #16a34a;border-radius:3px;position:relative}
.bk-mn__panel i.v::after{content:"";position:absolute;inset:3px;border-radius:50%;background:#16a34a}
.bk-mn__panel em{padding:2px 10px;border-radius:999px;background:#fee2e2;color:#b91c1c;font-family:"Inter",system-ui,sans-serif;font-size:11px;font-style:normal;font-weight:700;letter-spacing:.04em;text-transform:uppercase}
@media (max-width:820px){.bk-mn__panel{grid-template-columns:1fr}.bk-mn__pic{max-width:340px;margin:0 auto;aspect-ratio:1/.9;border-radius:var(--bk-r)}.bk-mn__tabs{justify-content:flex-start}}
@media (prefers-reduced-motion:reduce){.bk-mn__panel li{opacity:1;transform:none;animation:none!important}}`,
    js: `document.querySelectorAll('.bk-mn').forEach(function (root) {
  var tabs = [].slice.call(root.querySelectorAll('[role=tab]'));
  var panels = [].slice.call(root.querySelectorAll('.bk-mn__panel'));
  panels.forEach(function (p) { [].slice.call(p.querySelectorAll('li')).forEach(function (li, i) { li.style.setProperty('--n', i); }); });
  function pick(i, focus) {
    tabs.forEach(function (t, k) { t.classList.toggle('is-on', k === i); t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
    panels.forEach(function (p, k) { p.hidden = k !== i; p.classList.toggle('is-on', k === i); });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length;
      if (e.key === 'ArrowRight') { e.preventDefault(); pick((i + 1) % n, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); pick((i - 1 + n) % n, true); }
    });
  });
  pick(0);
});`,
  },
  {
    id: 'pro-property-cards', category: 'Pro Cards', name: 'Property listing cards',
    description: 'Real estate cards with a zooming photo, price tag, favourite heart that pops, bed / bath / area icons and a tag filter (All, For sale, For rent).',
    specs: ['Heart toggle with pop animation + aria-pressed', 'Filter chips (data-type) with fade', 'Photo zoom, price tag slides, card lift', '3 -> 2 -> 1 columns'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-pc" id="listings">
  <div class="bk-pw">
    <div class="bk-pc__top bk-rv"><div><span class="bk-pey">Featured homes</span><h2>Handpicked properties</h2></div><div class="bk-pc__chips"><button class="is-on" type="button" data-f="all">All</button><button type="button" data-f="sale">For sale</button><button type="button" data-f="rent">For rent</button></div></div>
    <div class="bk-pc__grid">
      <article class="bk-pc__c bk-rv" style="--i:0" data-type="sale"><div class="bk-pc__pic"><img src="${img('bk-h1', 680, 500)}" alt="Modern villa" loading="lazy"><span class="bk-pc__tag">For sale</span><button class="bk-pc__fav" type="button" aria-pressed="false" aria-label="Save to favourites">${I_HEART}</button><b class="bk-pc__price">$420,000</b></div><div class="bk-pc__b"><h3>Skyline modern villa</h3><p>${IC.pin}Adyar, Chennai</p><ul><li>${I_BED}4 beds</li><li>${I_BATH}3 baths</li><li>${I_AREA}2,400 sqft</li></ul></div></article>
      <article class="bk-pc__c bk-rv" style="--i:1" data-type="rent"><div class="bk-pc__pic"><img src="${img('bk-h2', 680, 500)}" alt="City apartment" loading="lazy"><span class="bk-pc__tag bk-pc__tag--r">For rent</span><button class="bk-pc__fav" type="button" aria-pressed="false" aria-label="Save to favourites">${I_HEART}</button><b class="bk-pc__price">$900 / mo</b></div><div class="bk-pc__b"><h3>Sea-view apartment</h3><p>${IC.pin}ECR, Chennai</p><ul><li>${I_BED}2 beds</li><li>${I_BATH}2 baths</li><li>${I_AREA}1,150 sqft</li></ul></div></article>
      <article class="bk-pc__c bk-rv" style="--i:2" data-type="sale"><div class="bk-pc__pic"><img src="${img('bk-h3', 680, 500)}" alt="Garden home" loading="lazy"><span class="bk-pc__tag">For sale</span><button class="bk-pc__fav" type="button" aria-pressed="false" aria-label="Save to favourites">${I_HEART}</button><b class="bk-pc__price">$285,000</b></div><div class="bk-pc__b"><h3>Garden family home</h3><p>${IC.pin}Velachery, Chennai</p><ul><li>${I_BED}3 beds</li><li>${I_BATH}2 baths</li><li>${I_AREA}1,800 sqft</li></ul></div></article>
      <article class="bk-pc__c bk-rv" style="--i:3" data-type="rent"><div class="bk-pc__pic"><img src="${img('bk-h4', 680, 500)}" alt="Studio" loading="lazy"><span class="bk-pc__tag bk-pc__tag--r">For rent</span><button class="bk-pc__fav" type="button" aria-pressed="false" aria-label="Save to favourites">${I_HEART}</button><b class="bk-pc__price">$520 / mo</b></div><div class="bk-pc__b"><h3>Bright studio flat</h3><p>${IC.pin}Anna Nagar, Chennai</p><ul><li>${I_BED}1 bed</li><li>${I_BATH}1 bath</li><li>${I_AREA}620 sqft</li></ul></div></article>
      <article class="bk-pc__c bk-rv" style="--i:4" data-type="sale"><div class="bk-pc__pic"><img src="${img('bk-h5', 680, 500)}" alt="Penthouse" loading="lazy"><span class="bk-pc__tag">For sale</span><button class="bk-pc__fav" type="button" aria-pressed="false" aria-label="Save to favourites">${I_HEART}</button><b class="bk-pc__price">$690,000</b></div><div class="bk-pc__b"><h3>Rooftop penthouse</h3><p>${IC.pin}Nungambakkam, Chennai</p><ul><li>${I_BED}4 beds</li><li>${I_BATH}4 baths</li><li>${I_AREA}3,100 sqft</li></ul></div></article>
      <article class="bk-pc__c bk-rv" style="--i:5" data-type="rent"><div class="bk-pc__pic"><img src="${img('bk-h6', 680, 500)}" alt="Townhouse" loading="lazy"><span class="bk-pc__tag bk-pc__tag--r">For rent</span><button class="bk-pc__fav" type="button" aria-pressed="false" aria-label="Save to favourites">${I_HEART}</button><b class="bk-pc__price">$1,300 / mo</b></div><div class="bk-pc__b"><h3>Quiet townhouse</h3><p>${IC.pin}OMR, Chennai</p><ul><li>${I_BED}3 beds</li><li>${I_BATH}3 baths</li><li>${I_AREA}1,700 sqft</li></ul></div></article>
    </div>
  </div>
</section>`,
    css: `.bk-pc{background:#fff}
.bk-pc__top{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:20px;margin-bottom:clamp(24px,4vw,44px)}
.bk-pc__top h2{margin-top:14px;font-size:clamp(30px,4.4vw,52px)}
.bk-pc__chips{display:flex;gap:8px;flex-wrap:wrap}
.bk-pc__chips button{padding:10px 20px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-mut);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-pc__chips button:hover{transform:translateY(-3px);color:var(--bk-a)}
.bk-pc__chips button.is-on{background:var(--bk-a);border-color:var(--bk-a);color:#fff}
.bk-pc__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,28px)}
.bk-pc__c{overflow:hidden;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t),opacity .35s}
.bk-pc__c:hover{transform:translateY(var(--bk-lift));box-shadow:0 36px 60px -28px rgba(11,18,32,.45)}
.bk-pc__c.is-off{display:none}
.bk-pc__pic{position:relative;overflow:hidden;aspect-ratio:4/3}
.bk-pc__pic img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--bk-ease)}
.bk-pc__c:hover .bk-pc__pic img{transform:scale(1.09)}
.bk-pc__pic::after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(6,11,24,.5),transparent 45%);pointer-events:none}
.bk-pc__tag{position:absolute;z-index:2;left:14px;top:14px;padding:6px 14px;border-radius:999px;background:var(--bk-a);color:#fff;font-size:12.5px;font-weight:700}
.bk-pc__tag--r{background:#0f172a}
.bk-pc__fav{position:absolute;z-index:2;right:14px;top:14px;display:grid;place-items:center;width:42px;height:42px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.92);color:var(--bk-ink);cursor:pointer;transition:transform .4s var(--bk-ease),color .3s}
.bk-pc__fav:hover{transform:scale(1.12)}
.bk-pc__fav[aria-pressed=true]{color:#e11d48}
.bk-pc__fav[aria-pressed=true] svg{fill:currentColor;animation:bk-pc-pop .5s var(--bk-ease)}
@keyframes bk-pc-pop{0%{transform:scale(.5)}60%{transform:scale(1.35)}100%{transform:scale(1)}}
.bk-pc__price{position:absolute;z-index:2;left:14px;bottom:14px;color:#fff;font-size:22px;letter-spacing:-.02em;transform:translateY(0);transition:transform .5s var(--bk-ease)}
.bk-pc__c:hover .bk-pc__price{transform:translateY(-4px)}
.bk-pc__b{padding:20px 22px 22px}
.bk-pc__b h3{font-size:20px}
.bk-pc__b p{display:flex;align-items:center;gap:6px;margin:6px 0 16px;font-size:14.5px;color:var(--bk-mut)}
.bk-pc__b p svg{width:16px;height:16px;color:var(--bk-a)}
.bk-pc__b ul{display:flex;justify-content:space-between;gap:8px;margin:0;padding:16px 0 0;border-top:1px solid var(--bk-line);list-style:none;font-size:14px;font-weight:600}
.bk-pc__b li{display:flex;align-items:center;gap:7px}
.bk-pc__b li svg{color:var(--bk-a)}
@media (max-width:1000px){.bk-pc__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:620px){.bk-pc__grid{grid-template-columns:1fr}}`,
    js: `document.querySelectorAll('.bk-pc').forEach(function (root) {
  var chips = [].slice.call(root.querySelectorAll('.bk-pc__chips button'));
  var cards = [].slice.call(root.querySelectorAll('.bk-pc__c'));
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { x.classList.toggle('is-on', x === c); });
      cards.forEach(function (k) { k.classList.toggle('is-off', f !== 'all' && k.getAttribute('data-type') !== f); });
    });
  });
  root.querySelectorAll('.bk-pc__fav').forEach(function (b) {
    b.addEventListener('click', function () { b.setAttribute('aria-pressed', b.getAttribute('aria-pressed') === 'true' ? 'false' : 'true'); });
  });
});`,
  },
  {
    id: 'pro-courses', category: 'Pro Cards', name: 'Course cards with level + progress',
    description: 'Education cards: thumbnail with play button, level pill, lesson count, rating, instructor avatar and an animated enrolment bar. Great for schools and online academies.',
    specs: ['Play button pulses, thumbnail zooms', 'Seats-left progress bar animates in when visible', 'Instructor avatar + rating row', 'Equal-height cards, 3 -> 2 -> 1'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-co" id="courses">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Popular courses</span><h2>Learn skills that open doors</h2><p>Live classes, real projects and mentors who answer.</p></div>
    <div class="bk-co__grid">
      <article class="bk-co__c bk-rv" style="--i:0"><div class="bk-co__pic"><img src="${img('bk-c1', 640, 400)}" alt="Web development" loading="lazy"><span class="bk-co__lv">Beginner</span><i class="bk-co__pl">${I_PLAY}</i></div><div class="bk-co__b"><h3>Full-stack web development</h3><ul><li>${I_BOOK}48 lessons</li><li>${IC.clock}12 weeks</li></ul><div class="bk-co__seat"><span>Seats filled</span><b>78%</b><i><u style="--p:78%"></u></i></div><div class="bk-co__f"><div class="bk-co__in"><img src="${img('bk-i1', 60, 60)}" alt=""><span>Ananya R.<small>${IC.star}4.9 (820)</small></span></div><b>$149</b></div></div></article>
      <article class="bk-co__c bk-rv" style="--i:1"><div class="bk-co__pic"><img src="${img('bk-c2', 640, 400)}" alt="UI UX design" loading="lazy"><span class="bk-co__lv bk-co__lv--m">Intermediate</span><i class="bk-co__pl">${I_PLAY}</i></div><div class="bk-co__b"><h3>UI / UX design masterclass</h3><ul><li>${I_BOOK}36 lessons</li><li>${IC.clock}8 weeks</li></ul><div class="bk-co__seat"><span>Seats filled</span><b>92%</b><i><u style="--p:92%"></u></i></div><div class="bk-co__f"><div class="bk-co__in"><img src="${img('bk-i2', 60, 60)}" alt=""><span>Karthik S.<small>${IC.star}4.8 (540)</small></span></div><b>$129</b></div></div></article>
      <article class="bk-co__c bk-rv" style="--i:2"><div class="bk-co__pic"><img src="${img('bk-c3', 640, 400)}" alt="Data science" loading="lazy"><span class="bk-co__lv bk-co__lv--a">Advanced</span><i class="bk-co__pl">${I_PLAY}</i></div><div class="bk-co__b"><h3>Data science with Python</h3><ul><li>${I_BOOK}60 lessons</li><li>${IC.clock}16 weeks</li></ul><div class="bk-co__seat"><span>Seats filled</span><b>54%</b><i><u style="--p:54%"></u></i></div><div class="bk-co__f"><div class="bk-co__in"><img src="${img('bk-i3', 60, 60)}" alt=""><span>Meera P.<small>${IC.star}5.0 (310)</small></span></div><b>$199</b></div></div></article>
    </div>
  </div>
</section>`,
    css: `.bk-co{background:var(--bk-soft)}
.bk-co__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,28px)}
.bk-co__c{display:flex;flex-direction:column;overflow:hidden;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t)}
.bk-co__c:hover{transform:translateY(var(--bk-lift));box-shadow:0 36px 60px -28px rgba(11,18,32,.45)}
.bk-co__pic{position:relative;overflow:hidden;aspect-ratio:16/10}
.bk-co__pic img{width:100%;height:100%;object-fit:cover;transition:transform 1.2s var(--bk-ease)}
.bk-co__c:hover .bk-co__pic img{transform:scale(1.08)}
.bk-co__lv{position:absolute;left:14px;top:14px;padding:6px 14px;border-radius:999px;background:#dcfce7;color:#15803d;font-size:12.5px;font-weight:800}
.bk-co__lv--m{background:#fef3c7;color:#b45309}
.bk-co__lv--a{background:#fee2e2;color:#b91c1c}
.bk-co__pl{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:64px;height:64px;margin:-32px 0 0 -32px;border-radius:50%;background:#fff;color:var(--bk-a);font-style:normal;box-shadow:0 14px 30px -10px rgba(0,0,0,.5);transition:transform .5s var(--bk-ease)}
.bk-co__pl svg{width:24px;height:24px;margin-left:3px}
.bk-co__pl::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid #fff;animation:bk-pulse 2.2s ease-out infinite}
.bk-co__c:hover .bk-co__pl{transform:scale(1.14)}
.bk-co__b{display:flex;flex-direction:column;flex:1;padding:22px}
.bk-co__b h3{font-size:21px;margin-bottom:12px}
.bk-co__b ul{display:flex;gap:18px;margin:0 0 18px;padding:0;list-style:none;font-size:14px;color:var(--bk-mut)}
.bk-co__b li{display:flex;align-items:center;gap:7px}
.bk-co__b li svg{color:var(--bk-a);width:18px;height:18px}
.bk-co__seat{display:grid;grid-template-columns:1fr auto;gap:8px;margin-bottom:20px;font-size:13px;color:var(--bk-mut)}
.bk-co__seat b{color:var(--bk-ink)}
.bk-co__seat i{grid-column:1/-1;height:8px;border-radius:8px;background:var(--bk-line);overflow:hidden}
.bk-co__seat u{display:block;height:100%;width:0;border-radius:8px;background:linear-gradient(90deg,var(--bk-a),var(--bk-a2));transition:width 1.6s var(--bk-ease) .3s}
.bk-co__c.is-in .bk-co__seat u,.bk-co__c:not(.bk-rv) .bk-co__seat u{width:var(--p)}
.bk-co__f{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:auto;padding-top:16px;border-top:1px solid var(--bk-line)}
.bk-co__f>b{font-size:24px;letter-spacing:-.03em;color:var(--bk-a)}
.bk-co__in{display:flex;align-items:center;gap:11px;font-size:14.5px;font-weight:700}
.bk-co__in img{width:40px;height:40px;border-radius:50%;object-fit:cover}
.bk-co__in small{display:flex;align-items:center;gap:4px;font-weight:500;color:var(--bk-mut)}
.bk-co__in small svg{width:13px;height:13px;color:#f5a524}
@media (max-width:1000px){.bk-co__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:620px){.bk-co__grid{grid-template-columns:1fr}}`,
    js: '',
  },
  {
    id: 'pro-spotlight-pricing', category: 'Pro Cards', name: 'Pricing with cursor spotlight',
    description: 'Dark pricing cards that light up under your mouse. A soft spotlight follows the cursor across every card and the popular plan carries a glowing border.',
    specs: ['Radial spotlight tracks pointer per card (CSS variables --mx / --my)', 'Monthly / yearly toggle changes the prices with a quick number roll', 'Popular card gradient border + badge', 'Touch devices: static glow; 3 -> 1 columns'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-sp" id="pricing">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Pricing</span><h2>Simple plans, no surprises</h2><p>Switch anytime. Cancel anytime.</p></div>
    <div class="bk-sp__sw bk-rv" style="--i:1"><span class="is-on">Monthly</span><button type="button" role="switch" aria-checked="false" aria-label="Bill yearly"><i></i></button><span>Yearly <em>Save 20%</em></span></div>
    <div class="bk-sp__grid">
      <article class="bk-sp__c bk-rv" style="--i:0"><h3>Starter</h3><p>For individuals getting going.</p><div class="bk-sp__pr"><sup>$</sup><b data-m="19" data-y="15">19</b><small>/ month</small></div><ul><li>${IC.check}1 project</li><li>${IC.check}Basic analytics</li><li>${IC.check}Email support</li></ul><a class="bk-pbtn bk-pbtn--ghost" href="#contact">Get started</a></article>
      <article class="bk-sp__c bk-sp__c--hot bk-rv" style="--i:1"><span class="bk-sp__bd">Most popular</span><h3>Business</h3><p>For growing teams that need more.</p><div class="bk-sp__pr"><sup>$</sup><b data-m="49" data-y="39">49</b><small>/ month</small></div><ul><li>${IC.check}Unlimited projects</li><li>${IC.check}Advanced analytics</li><li>${IC.check}Priority support</li><li>${IC.check}Custom domain</li></ul><a class="bk-pbtn" href="#contact">Start free trial ${AR}</a></article>
      <article class="bk-sp__c bk-rv" style="--i:2"><h3>Enterprise</h3><p>For large organisations.</p><div class="bk-sp__pr"><sup>$</sup><b data-m="129" data-y="99">129</b><small>/ month</small></div><ul><li>${IC.check}Everything in Business</li><li>${IC.check}Single sign-on</li><li>${IC.check}Dedicated manager</li></ul><a class="bk-pbtn bk-pbtn--ghost" href="#contact">Contact sales</a></article>
    </div>
  </div>
</section>`,
    css: `.bk-sp{background:#0b1220;color:#fff}
.bk-sp .bk-ph p{color:#9fb0cf}
.bk-sp .bk-pey{background:rgba(255,255,255,.1);color:#fff}
.bk-sp__sw{display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:clamp(30px,4vw,50px);font-weight:700;color:#7f90ad}
.bk-sp__sw span.is-on{color:#fff}
.bk-sp__sw em{margin-left:6px;padding:3px 10px;border-radius:999px;background:var(--bk-a);color:#fff;font-size:12px;font-style:normal}
.bk-sp__sw button{position:relative;width:58px;height:32px;padding:0;border:0;border-radius:999px;background:#1e2a47;cursor:pointer;transition:background .3s}
.bk-sp__sw button i{position:absolute;left:4px;top:4px;width:24px;height:24px;border-radius:50%;background:#fff;transition:transform .5s var(--bk-ease)}
.bk-sp__sw button[aria-checked=true]{background:var(--bk-a)}
.bk-sp__sw button[aria-checked=true] i{transform:translateX(26px)}
.bk-sp__sw button:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:3px}
.bk-sp__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,26px);align-items:stretch}
.bk-sp__c{--mx:50%;--my:0%;position:relative;isolation:isolate;display:flex;flex-direction:column;padding:clamp(26px,3vw,40px);border-radius:var(--bk-r);background:#111a30;border:1px solid #1e2a47;overflow:hidden;transition:transform var(--bk-t) var(--bk-ease),border-color .4s}
.bk-sp__c::before{content:"";position:absolute;inset:0;z-index:-1;background:radial-gradient(360px circle at var(--mx) var(--my),color-mix(in srgb,var(--bk-a) 38%,transparent),transparent 62%);opacity:0;transition:opacity .4s}
.bk-sp__c:hover{transform:translateY(-8px);border-color:color-mix(in srgb,var(--bk-a) 60%,#1e2a47)}
.bk-sp__c:hover::before{opacity:1}
.bk-sp__c--hot{background:linear-gradient(#111a30,#111a30) padding-box,linear-gradient(135deg,var(--bk-a),var(--bk-a2),var(--bk-a)) border-box;border:2px solid transparent;box-shadow:0 40px 80px -40px var(--bk-a)}
.bk-sp__bd{position:absolute;right:20px;top:20px;padding:5px 14px;border-radius:999px;background:var(--bk-a);color:#fff;font-size:12px;font-weight:800}
.bk-sp__c h3{font-size:22px}
.bk-sp__c>p{margin:6px 0 22px;color:#93a4c4;font-size:15px}
.bk-sp__pr{display:flex;align-items:flex-end;gap:4px;margin-bottom:24px}
.bk-sp__pr sup{margin-bottom:auto;padding-top:10px;font-size:22px;font-weight:700}
.bk-sp__pr b{font-size:clamp(46px,5vw,64px);font-weight:800;letter-spacing:-.05em;line-height:1;display:inline-block}
.bk-sp__pr b.is-roll{animation:bk-sp-roll .5s var(--bk-ease)}
@keyframes bk-sp-roll{0%{transform:translateY(40%);opacity:0}100%{transform:none;opacity:1}}
.bk-sp__pr small{padding-bottom:8px;color:#93a4c4}
.bk-sp__c ul{display:grid;gap:12px;margin:0 0 28px;padding:0;list-style:none;flex:1;color:#d5def0;font-size:15.5px}
.bk-sp__c li{display:flex;align-items:center;gap:10px}
.bk-sp__c li svg{flex:none;width:20px;height:20px;padding:3px;border-radius:50%;background:color-mix(in srgb,var(--bk-a) 28%,transparent);color:var(--bk-a-m)}
.bk-sp__c .bk-pbtn{justify-content:center;width:100%}
.bk-sp__c .bk-pbtn--ghost{color:#fff;border-color:#2b3a5e}
@media (max-width:920px){.bk-sp__grid{grid-template-columns:1fr;max-width:480px;margin:0 auto}}
@media (hover:none){.bk-sp__c::before{opacity:.6}}`,
    js: `document.querySelectorAll('.bk-sp').forEach(function (root) {
  root.querySelectorAll('.bk-sp__c').forEach(function (c) {
    c.addEventListener('pointermove', function (e) { var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); });
  });
  var sw = root.querySelector('.bk-sp__sw button'), labels = root.querySelectorAll('.bk-sp__sw span');
  var nums = [].slice.call(root.querySelectorAll('.bk-sp__pr b'));
  sw.addEventListener('click', function () {
    var yearly = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', yearly ? 'true' : 'false');
    labels[0].classList.toggle('is-on', !yearly); labels[1].classList.toggle('is-on', yearly);
    nums.forEach(function (n) { n.textContent = n.getAttribute(yearly ? 'data-y' : 'data-m'); n.classList.remove('is-roll'); void n.offsetWidth; n.classList.add('is-roll'); });
  });
});`,
  },
  {
    id: 'pro-steps-line', category: 'Pro Sections', name: 'Numbered steps with drawing line',
    description: 'Four large numbered steps connected by a dashed line that fills with colour as each step scrolls into view. Alternating image and text.',
    specs: ['Vertical line fills with scroll progress (JS, rAF)', 'Number badge turns solid when reached', 'Image + text alternate sides; stacked under 820px with the line on the left', 'Accent colour themeable'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-st" id="how">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">How it works</span><h2>From hello to done in four steps</h2></div>
    <div class="bk-st__list"><div class="bk-st__line"><i></i></div>
      <div class="bk-st__it"><span class="bk-st__n">1</span><div class="bk-st__t bk-rv bk-rv--l"><h3>Tell us what you need</h3><p>Share your goals in a short call or form. We listen first and suggest later.</p></div><img class="bk-rv bk-rv--r" src="${img('bk-s1', 560, 380)}" alt="" loading="lazy"></div>
      <div class="bk-st__it"><span class="bk-st__n">2</span><div class="bk-st__t bk-rv bk-rv--r"><h3>Get a clear plan</h3><p>You receive a simple proposal with scope, timeline and one fixed price.</p></div><img class="bk-rv bk-rv--l" src="${img('bk-s2', 560, 380)}" alt="" loading="lazy"></div>
      <div class="bk-st__it"><span class="bk-st__n">3</span><div class="bk-st__t bk-rv bk-rv--l"><h3>We build, you review</h3><p>Weekly demos keep you in control. Change your mind, we adapt.</p></div><img class="bk-rv bk-rv--r" src="${img('bk-s3', 560, 380)}" alt="" loading="lazy"></div>
      <div class="bk-st__it"><span class="bk-st__n">4</span><div class="bk-st__t bk-rv bk-rv--r"><h3>Launch and grow</h3><p>We go live together, then stay on hand with support and improvements.</p></div><img class="bk-rv bk-rv--l" src="${img('bk-s4', 560, 380)}" alt="" loading="lazy"></div>
    </div>
  </div>
</section>`,
    css: `.bk-st{background:#fff;overflow-x:clip}
.bk-st__list{position:relative;display:grid;gap:clamp(36px,6vw,80px);max-width:1040px;margin:0 auto}
.bk-st__line{position:absolute;left:50%;top:30px;bottom:30px;width:4px;margin-left:-2px;border-radius:4px;background:repeating-linear-gradient(180deg,var(--bk-line) 0 10px,transparent 10px 18px)}
.bk-st__line i{position:absolute;left:0;top:0;width:100%;height:0;border-radius:4px;background:linear-gradient(180deg,var(--bk-a),var(--bk-a2))}
.bk-st__it{position:relative;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:clamp(60px,9vw,130px)}
.bk-st__it:nth-child(odd) img{order:2}
.bk-st__it:nth-child(even) .bk-st__t{text-align:right}
.bk-st__it:nth-of-type(even) img{order:0}
.bk-st__n{position:absolute;left:50%;top:50%;z-index:2;display:grid;place-items:center;width:60px;height:60px;margin:-30px 0 0 -30px;border-radius:50%;background:#fff;border:4px solid var(--bk-line);color:var(--bk-mut);font-size:24px;font-weight:800;transition:background .5s,border-color .5s,color .5s,transform .6s var(--bk-ease)}
.bk-st__it.is-on .bk-st__n{background:var(--bk-a);border-color:var(--bk-a);color:#fff;transform:scale(1.12);box-shadow:0 16px 30px -12px var(--bk-a)}
.bk-st__t h3{margin-bottom:10px;font-size:clamp(22px,2.6vw,32px)}
.bk-st__t p{color:var(--bk-mut);font-size:clamp(15.5px,1.5vw,18px)}
.bk-st__it img{width:100%;aspect-ratio:560/380;object-fit:cover;border-radius:var(--bk-r);box-shadow:0 30px 60px -32px rgba(11,18,32,.5);transition:transform .8s var(--bk-ease)}
.bk-st__it img:hover{transform:scale(1.03) rotate(-1deg)}
@media (max-width:820px){.bk-st__line{left:30px;margin:0}.bk-st__it{grid-template-columns:1fr;gap:18px;padding-left:84px}.bk-st__it:nth-child(even) .bk-st__t{text-align:left}.bk-st__it img,.bk-st__it:nth-child(odd) img{order:2}.bk-st__n{left:0;top:0;margin:0;width:52px;height:52px;font-size:20px}}`,
    js: `document.querySelectorAll('.bk-st__list').forEach(function (root) {
  var line = root.querySelector('.bk-st__line'), fill = line.querySelector('i');
  var items = [].slice.call(root.querySelectorAll('.bk-st__it'));
  var tick = false;
  function upd() {
    var lr = line.getBoundingClientRect(), mid = window.innerHeight * 0.55;
    var p = Math.max(0, Math.min(1, (mid - lr.top) / Math.max(lr.height, 1)));
    fill.style.height = (p * 100).toFixed(1) + '%';
    items.forEach(function (it) { it.classList.toggle('is-on', it.getBoundingClientRect().top + 30 < mid); });
    tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  window.addEventListener('resize', upd); upd();
});`,
  },
  {
    id: 'pro-wall', category: 'Pro Cards', name: 'Social proof wall (masonry)',
    description: 'Masonry wall of short testimonials, star ratings and a "verified" tick. Cards float slightly and lift on hover. Fills any width with CSS columns.',
    specs: ['CSS columns masonry (4 -> 3 -> 2 -> 1)', 'Gentle staggered float animation', 'Rating stars, avatar, role, verified badge', 'Add a card by copying one <figure>'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-wl" id="love">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Wall of love</span><h2>Loved by thousands</h2><p>Real words from real customers.</p></div>
    <div class="bk-wl__cols">
      <figure class="bk-wl__c bk-rv" style="--i:0"><div class="bk-wl__s">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><blockquote>Booked in two minutes and the doctor was on time. Never seen that before!</blockquote><figcaption><img src="${img('bk-w1', 60, 60)}" alt=""><span>Priya S.<small>Patient</small></span><i title="Verified">${IC.check}</i></figcaption></figure>
      <figure class="bk-wl__c bk-rv" style="--i:1"><div class="bk-wl__s">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><blockquote>Our new website doubled enquiries in the first month. Beautiful and fast on every phone, and the team really cared about getting every detail exactly right for us.</blockquote><figcaption><img src="${img('bk-w2', 60, 60)}" alt=""><span>Rahul M.<small>Founder, Kaveri Foods</small></span><i title="Verified">${IC.check}</i></figcaption></figure>
      <figure class="bk-wl__c bk-rv" style="--i:2"><div class="bk-wl__s">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><blockquote>Clean, simple and exactly what we wanted.</blockquote><figcaption><img src="${img('bk-w3', 60, 60)}" alt=""><span>Divya K.<small>Teacher</small></span><i title="Verified">${IC.check}</i></figcaption></figure>
      <figure class="bk-wl__c bk-wl__c--hot bk-rv" style="--i:3"><div class="bk-wl__s">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><blockquote>The support team answered at midnight. That is when I knew we picked the right partner.</blockquote><figcaption><img src="${img('bk-w4', 60, 60)}" alt=""><span>Arun T.<small>CTO</small></span><i title="Verified">${IC.check}</i></figcaption></figure>
      <figure class="bk-wl__c bk-rv" style="--i:4"><div class="bk-wl__s">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><blockquote>We moved our whole hospital booking online without a single complaint from patients. The staff picked it up in an afternoon.</blockquote><figcaption><img src="${img('bk-w5', 60, 60)}" alt=""><span>Dr. Sana H.<small>Medical director</small></span><i title="Verified">${IC.check}</i></figcaption></figure>
      <figure class="bk-wl__c bk-rv" style="--i:5"><div class="bk-wl__s">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><blockquote>Great value. Highly recommended.</blockquote><figcaption><img src="${img('bk-w6', 60, 60)}" alt=""><span>Vikram J.<small>Shop owner</small></span><i title="Verified">${IC.check}</i></figcaption></figure>
      <figure class="bk-wl__c bk-rv" style="--i:6"><div class="bk-wl__s">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><blockquote>Professional, friendly and quick. They explained every step in plain language.</blockquote><figcaption><img src="${img('bk-w7', 60, 60)}" alt=""><span>Nisha B.<small>Designer</small></span><i title="Verified">${IC.check}</i></figcaption></figure>
      <figure class="bk-wl__c bk-rv" style="--i:7"><div class="bk-wl__s">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><blockquote>From the first call to launch day, everything was smooth and honest.</blockquote><figcaption><img src="${img('bk-w8', 60, 60)}" alt=""><span>Sameer A.<small>Entrepreneur</small></span><i title="Verified">${IC.check}</i></figcaption></figure>
    </div>
  </div>
</section>`,
    css: `.bk-wl{background:var(--bk-soft)}
.bk-wl__cols{columns:4 240px;column-gap:clamp(14px,2vw,22px)}
.bk-wl__c{break-inside:avoid;margin:0 0 clamp(14px,2vw,22px);padding:24px;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t),border-color .3s}
.bk-wl__c:hover{transform:translateY(-8px) rotate(-.6deg);border-color:var(--bk-a-m);box-shadow:0 30px 50px -28px rgba(11,18,32,.45)}
.bk-wl__c--hot{background:linear-gradient(160deg,var(--bk-a),var(--bk-a-d));color:#fff;border-color:transparent}
.bk-wl__c--hot figcaption small,.bk-wl__c--hot blockquote{color:rgba(255,255,255,.85)}
.bk-wl__s{display:flex;gap:3px;margin-bottom:14px;color:#f5a524}
.bk-wl__s svg{width:18px;height:18px}
.bk-wl__c blockquote{margin:0 0 20px;font-size:16px;line-height:1.7;color:var(--bk-ink)}
.bk-wl__c--hot blockquote{color:#fff}
.bk-wl__c figcaption{display:flex;align-items:center;gap:12px;font-size:14.5px;font-weight:700}
.bk-wl__c figcaption img{width:42px;height:42px;border-radius:50%;object-fit:cover}
.bk-wl__c figcaption span{flex:1}
.bk-wl__c figcaption small{display:block;font-weight:500;color:var(--bk-mut)}
.bk-wl__c figcaption i{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#3b82f6;color:#fff}
.bk-wl__c figcaption i svg{width:12px;height:12px}
.bk-js .bk-wl__c.is-in{animation:bk-bob 9s ease-in-out infinite;animation-delay:calc(var(--i,0) * -1.1s)}
.bk-js .bk-wl__c.is-in:hover{animation-play-state:paused}
@media (max-width:640px){.bk-wl__cols{columns:1}}
@media (prefers-reduced-motion:reduce){.bk-js .bk-wl__c.is-in{animation:none}}`,
    js: '',
  },
  {
    id: 'pro-portfolio', category: 'Pro Cards', name: 'Portfolio / case study cards',
    description: 'Large project cards with a full-bleed image, a gradient overlay that rises on hover to reveal the result metric, tags and a "View case study" link. Filterable by type.',
    specs: ['Overlay slides up with result stat (e.g. +180% leads)', 'Filter chips with smooth hide/show', 'Image zoom + tilt-free hover (safe on touch: overlay always visible)', '2 columns (large first card spans 2) -> 1'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-pf" id="work">
  <div class="bk-pw">
    <div class="bk-pf__top bk-rv"><div><span class="bk-pey">Selected work</span><h2>Projects we are proud of</h2></div><div class="bk-pf__chips"><button class="is-on" type="button" data-f="all">All</button><button type="button" data-f="web">Websites</button><button type="button" data-f="app">Apps</button><button type="button" data-f="brand">Branding</button></div></div>
    <div class="bk-pf__grid">
      <a class="bk-pf__c bk-pf__c--w bk-rv" style="--i:0" href="#" data-t="web"><img src="${img('bk-p1', 1100, 640)}" alt="" loading="lazy"><div class="bk-pf__o"><em>Website</em><h3>Kaveri Foods e-commerce</h3><p><b>+180%</b> online orders in 90 days</p><span>View case study ${AR}</span></div></a>
      <a class="bk-pf__c bk-rv" style="--i:1" href="#" data-t="app"><img src="${img('bk-p2', 700, 640)}" alt="" loading="lazy"><div class="bk-pf__o"><em>Mobile app</em><h3>MediQ patient app</h3><p><b>4.8</b> store rating</p><span>View case study ${AR}</span></div></a>
      <a class="bk-pf__c bk-rv" style="--i:2" href="#" data-t="brand"><img src="${img('bk-p3', 700, 640)}" alt="" loading="lazy"><div class="bk-pf__o"><em>Branding</em><h3>Nila Studio identity</h3><p><b>3x</b> social followers</p><span>View case study ${AR}</span></div></a>
      <a class="bk-pf__c bk-rv" style="--i:3" href="#" data-t="web"><img src="${img('bk-p4', 700, 640)}" alt="" loading="lazy"><div class="bk-pf__o"><em>Website</em><h3>Sunrise Hospital</h3><p><b>-40%</b> phone call load</p><span>View case study ${AR}</span></div></a>
      <a class="bk-pf__c bk-rv" style="--i:4" href="#" data-t="app"><img src="${img('bk-p5', 700, 640)}" alt="" loading="lazy"><div class="bk-pf__o"><em>Mobile app</em><h3>Fleetly delivery tracker</h3><p><b>12k</b> daily users</p><span>View case study ${AR}</span></div></a>
    </div>
  </div>
</section>`,
    css: `.bk-pf{background:#fff}
.bk-pf__top{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:20px;margin-bottom:clamp(24px,4vw,44px)}
.bk-pf__top h2{margin-top:14px;font-size:clamp(30px,4.4vw,52px)}
.bk-pf__chips{display:flex;gap:8px;flex-wrap:wrap}
.bk-pf__chips button{padding:10px 20px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-mut);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-pf__chips button:hover{transform:translateY(-3px);color:var(--bk-a)}
.bk-pf__chips button.is-on{background:var(--bk-ink);border-color:var(--bk-ink);color:#fff}
.bk-pf__grid{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-rows:clamp(260px,30vw,380px);gap:clamp(12px,1.8vw,22px)}
.bk-pf__c{position:relative;overflow:hidden;border-radius:var(--bk-r);color:#fff;text-decoration:none;background:#0b1220;transition:opacity .35s,transform .5s var(--bk-ease)}
.bk-pf__c--w{grid-column:span 2}
.bk-pf__c.is-off{display:none}
.bk-pf__c img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform 1.3s var(--bk-ease),filter .6s}
.bk-pf__c:hover img{transform:scale(1.08);filter:brightness(.7)}
.bk-pf__o{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:flex-end;gap:6px;padding:clamp(18px,2.4vw,30px);background:linear-gradient(0deg,rgba(6,11,24,.9),rgba(6,11,24,.1) 60%)}
.bk-pf__o em{align-self:flex-start;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,.18);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);font-size:12px;font-style:normal;font-weight:700}
.bk-pf__o h3{font-size:clamp(20px,2.2vw,28px)}
.bk-pf__o p,.bk-pf__o span{max-height:0;opacity:0;overflow:hidden;transform:translateY(14px);transition:max-height .6s var(--bk-ease),opacity .5s,transform .6s var(--bk-ease)}
.bk-pf__o p{font-size:15px;color:#d5def0}
.bk-pf__o p b{font-size:20px;color:var(--bk-a-m)}
.bk-pf__o span{display:inline-flex;gap:6px;font-weight:700}
.bk-pf__c:hover .bk-pf__o p,.bk-pf__c:hover .bk-pf__o span,.bk-pf__c:focus-visible .bk-pf__o p,.bk-pf__c:focus-visible .bk-pf__o span{max-height:60px;opacity:1;transform:none}
.bk-pf__c:hover .bk-pf__o span .bk-pbtn__ar{transform:translateX(5px)}
.bk-pf__c:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:3px}
@media (hover:none){.bk-pf__o p,.bk-pf__o span{max-height:60px;opacity:1;transform:none}}
@media (max-width:860px){.bk-pf__grid{grid-template-columns:1fr 1fr}.bk-pf__c--w{grid-column:span 2}}
@media (max-width:560px){.bk-pf__grid{grid-template-columns:1fr;grid-auto-rows:280px}.bk-pf__c--w{grid-column:auto}}`,
    js: `document.querySelectorAll('.bk-pf').forEach(function (root) {
  var chips = [].slice.call(root.querySelectorAll('.bk-pf__chips button'));
  var cards = [].slice.call(root.querySelectorAll('.bk-pf__c'));
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { x.classList.toggle('is-on', x === c); });
      cards.forEach(function (k) { k.classList.toggle('is-off', f !== 'all' && k.getAttribute('data-t') !== f); });
    });
  });
  cards.forEach(function (k) { k.addEventListener('click', function (e) { if (k.getAttribute('href') === '#') e.preventDefault(); }); });
});`,
  },
  {
    id: 'pro-cookie', category: 'Pro Extras', name: 'Cookie consent banner',
    description: 'Friendly bottom-left cookie card that slides up, with Accept, Reject and a Customise panel of switches. Remembers the choice in localStorage (safe fallback).',
    specs: ['Slides in after 1s, remembers choice (try/catch around storage)', 'Customise panel with 3 toggles (essential locked on)', 'Full-width on phones, safe-area padding', 'Escape closes panel; focus-visible styles'],
    shared: ['pro'],
    html: `<aside class="bk-p bk-ck" role="dialog" aria-label="Cookie preferences" hidden>
  <div class="bk-ck__h"><span class="bk-ck__e" aria-hidden="true">&#127850;</span><div><h3>We use cookies</h3><p>They help the site work, remember your choices and show us what to improve.</p></div></div>
  <div class="bk-ck__opts" hidden>
    <label><span><b>Essential</b><small>Always on, needed for the site</small></span><input type="checkbox" checked disabled><i></i></label>
    <label><span><b>Analytics</b><small>Helps us improve pages</small></span><input type="checkbox" data-k="an"><i></i></label>
    <label><span><b>Marketing</b><small>Relevant offers and ads</small></span><input type="checkbox" data-k="mk"><i></i></label>
  </div>
  <div class="bk-ck__btns"><button class="bk-ck__a bk-pbtn" type="button">Accept all</button><button class="bk-ck__r" type="button">Reject</button><button class="bk-ck__c" type="button" aria-expanded="false">Customise</button></div>
</aside>`,
    css: `.bk-ck{position:fixed;z-index:150;left:clamp(12px,2vw,24px);bottom:clamp(12px,2vw,24px);width:min(400px,calc(100vw - 24px));padding:22px;border-radius:calc(var(--bk-r) + 2px);background:#fff;border:1px solid var(--bk-line);box-shadow:0 30px 70px -20px rgba(11,18,32,.5);transform:translateY(30px);opacity:0;transition:transform .7s var(--bk-ease),opacity .5s}
.bk-ck[hidden]{display:none}
.bk-ck.is-in{transform:none;opacity:1}
.bk-ck.is-out{transform:translateY(40px);opacity:0}
.bk-ck__h{display:flex;gap:14px}
.bk-ck__e{display:grid;place-items:center;flex:none;width:46px;height:46px;border-radius:14px;background:var(--bk-a-l);font-size:24px;animation:bk-bob 4s ease-in-out infinite}
.bk-ck h3{font-size:18px;margin-bottom:4px}
.bk-ck p{font-size:14px;line-height:1.55;color:var(--bk-mut)}
.bk-ck__opts{display:grid;gap:10px;margin:16px 0 0}
.bk-ck__opts[hidden]{display:none}
.bk-ck__opts label{position:relative;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:12px 14px;border-radius:14px;background:var(--bk-soft);cursor:pointer}
.bk-ck__opts b{display:block;font-size:14.5px}
.bk-ck__opts small{color:var(--bk-mut);font-size:12.5px}
.bk-ck__opts input{position:absolute;opacity:0;pointer-events:none}
.bk-ck__opts i{position:relative;flex:none;width:44px;height:26px;border-radius:999px;background:#cbd5e1;transition:background .3s}
.bk-ck__opts i::after{content:"";position:absolute;left:3px;top:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .4s var(--bk-ease)}
.bk-ck__opts input:checked+i{background:var(--bk-a)}
.bk-ck__opts input:checked+i::after{transform:translateX(18px)}
.bk-ck__opts input:disabled+i{opacity:.55}
.bk-ck__opts input:focus-visible+i{outline:3px solid var(--bk-a-m);outline-offset:2px}
.bk-ck__btns{display:flex;flex-wrap:wrap;gap:10px;margin-top:18px}
.bk-ck__btns .bk-pbtn{flex:1;justify-content:center;padding:12px 18px}
.bk-ck__r,.bk-ck__c{padding:12px 16px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .3s,border-color .3s}
.bk-ck__r:hover,.bk-ck__c:hover{background:var(--bk-soft);border-color:var(--bk-a-m)}
.bk-ck button:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:2px}
@media (max-width:520px){.bk-ck{left:0;right:0;bottom:0;width:auto;border-radius:22px 22px 0 0;padding-bottom:calc(22px + env(safe-area-inset-bottom))}}`,
    js: `document.querySelectorAll('.bk-ck').forEach(function (box) {
  var KEY = 'bk-cookie-choice';
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function close(v) { set(v); box.classList.remove('is-in'); box.classList.add('is-out'); setTimeout(function () { box.hidden = true; }, 600); }
  if (get()) return;
  setTimeout(function () { box.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('is-in'); }); }); }, 1000);
  var opts = box.querySelector('.bk-ck__opts'), cb = box.querySelector('.bk-ck__c');
  cb.addEventListener('click', function () { var open = opts.hidden; opts.hidden = !open; cb.setAttribute('aria-expanded', open ? 'true' : 'false'); cb.textContent = open ? 'Save choices' : 'Customise'; if (!open) close('custom'); });
  box.querySelector('.bk-ck__a').addEventListener('click', function () { close('all'); });
  box.querySelector('.bk-ck__r').addEventListener('click', function () { close('none'); });
  box.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !opts.hidden) { opts.hidden = true; cb.textContent = 'Customise'; cb.setAttribute('aria-expanded', 'false'); } });
});`,
  },
  {
    id: 'pro-offer-modal', category: 'Pro Extras', name: 'Offer popup modal',
    description: 'Centred offer popup with a blurred backdrop, a scale-in card, confetti-style shapes and an email field. Opens after a delay or from any button with data-bk-open. Close with X, Esc or a backdrop click.',
    specs: ['Native <dialog> with focus trap and Esc (graceful fallback)', 'Auto-opens once after 3s (session guard in try/catch)', 'Any element with data-bk-open="offer" opens it again', 'Two-column on desktop, image hidden on phones'],
    shared: ['pro'],
    html: `<div class="bk-p bk-om">
  <button class="bk-pbtn" type="button" data-bk-open="offer">Get 20% off ${AR}</button>
  <dialog class="bk-om__d" aria-label="Special offer">
    <button class="bk-om__x" type="button" aria-label="Close">${I_X}</button>
    <div class="bk-om__pic" style="--bg:url(${img('bk-offer', 600, 800)})"><i></i><i></i><i></i><b>-20%</b></div>
    <form class="bk-om__f" novalidate>
      <span class="bk-pey">Welcome gift</span>
      <h3>Take 20% off your first booking</h3>
      <p>Join our list and we will send your code right away. No spam, ever.</p>
      <label>${I_MAIL}<input type="email" required placeholder="Your email address" aria-label="Email address"></label>
      <button class="bk-pbtn" type="submit">Send my code ${AR}</button>
      <p class="bk-om__m" role="status" aria-live="polite"></p>
      <button class="bk-om__no" type="button">No thanks</button>
    </form>
  </dialog>
</div>`,
    css: `.bk-om{padding:24px;text-align:center}
.bk-om__d{width:min(780px,calc(100vw - 24px));max-height:calc(100vh - 24px);padding:0;border:0;border-radius:calc(var(--bk-r) + 6px);background:#fff;color:var(--bk-ink);overflow:hidden;box-shadow:0 60px 120px -30px rgba(0,0,0,.6)}
.bk-om__d:not([open]){display:none}
.bk-om__d[open]{display:grid;grid-template-columns:.9fr 1.1fr;animation:bk-om-in .6s var(--bk-ease)}
.bk-om__d::backdrop{background:rgba(8,14,30,.6);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);animation:bk-om-fade .4s}
.bk-om__d.is-fb{position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);z-index:300}
@keyframes bk-om-in{from{opacity:0;transform:translateY(30px) scale(.94)}to{opacity:1;transform:none}}
@keyframes bk-om-fade{from{opacity:0}}
.bk-om__x{position:absolute;right:14px;top:14px;z-index:3;display:grid;place-items:center;width:38px;height:38px;padding:0;border:0;border-radius:50%;background:#fff;color:var(--bk-ink);box-shadow:0 8px 20px -8px rgba(0,0,0,.4);cursor:pointer;transition:transform .5s var(--bk-ease),background .3s,color .3s}
.bk-om__x:hover{transform:rotate(90deg);background:var(--bk-a);color:#fff}
.bk-om__pic{position:relative;min-height:380px;background:linear-gradient(160deg,color-mix(in srgb,var(--bk-a) 80%,transparent),color-mix(in srgb,var(--bk-a-d) 88%,transparent)),var(--bg) center/cover;display:grid;place-items:center;overflow:hidden}
.bk-om__pic b{font-size:clamp(64px,9vw,104px);font-weight:800;letter-spacing:-.05em;color:#fff;text-shadow:0 14px 30px rgba(0,0,0,.3);animation:bk-bob 4s ease-in-out infinite}
.bk-om__pic i{position:absolute;border-radius:50%;background:rgba(255,255,255,.2);animation:bk-bob 6s ease-in-out infinite}
.bk-om__pic i:nth-child(1){left:10%;top:12%;width:70px;height:70px}
.bk-om__pic i:nth-child(2){right:12%;top:30%;width:34px;height:34px;animation-delay:-2s}
.bk-om__pic i:nth-child(3){left:20%;bottom:12%;width:50px;height:50px;border-radius:14px;animation-delay:-4s}
.bk-om__f{display:flex;flex-direction:column;align-items:flex-start;gap:14px;padding:clamp(26px,4vw,44px)}
.bk-om__f h3{font-size:clamp(24px,3vw,32px)}
.bk-om__f p{color:var(--bk-mut)}
.bk-om__f label{position:relative;display:block;width:100%}
.bk-om__f label svg{position:absolute;left:16px;top:50%;margin-top:-10px;color:var(--bk-mut)}
.bk-om__f input{width:100%;padding:16px 16px 16px 48px;border:1.5px solid var(--bk-line);border-radius:14px;font-family:inherit;font-size:16px;color:var(--bk-ink);transition:border-color .3s,box-shadow .3s}
.bk-om__f input:focus{outline:0;border-color:var(--bk-a);box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-om__f .bk-pbtn{width:100%;justify-content:center}
.bk-om__m{min-height:1.3em;font-size:14px;font-weight:600;color:#dc2626}
.bk-om__m.is-ok{color:#16a34a}
.bk-om__no{align-self:center;padding:4px;border:0;background:transparent;color:var(--bk-mut);font-family:inherit;font-size:14px;text-decoration:underline;cursor:pointer}
@media (max-width:680px){.bk-om__d[open]{grid-template-columns:1fr}.bk-om__pic{display:none}.bk-om__f{padding-top:56px}}`,
    js: `document.querySelectorAll('.bk-om').forEach(function (root) {
  var d = root.querySelector('.bk-om__d');
  var native = typeof d.showModal === 'function';
  function open() { if (native) { if (!d.open) d.showModal(); } else { d.setAttribute('open', ''); d.classList.add('is-fb'); } }
  function close() { if (native) { if (d.open) d.close(); } else { d.removeAttribute('open'); d.classList.remove('is-fb'); } }
  document.querySelectorAll('[data-bk-open=offer]').forEach(function (b) { b.addEventListener('click', open); });
  d.querySelector('.bk-om__x').addEventListener('click', close);
  d.querySelector('.bk-om__no').addEventListener('click', close);
  d.addEventListener('click', function (e) { if (e.target === d) close(); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  var msg = d.querySelector('.bk-om__m');
  d.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    var f = d.querySelector('input'), ok = f.checkValidity();
    msg.className = 'bk-om__m' + (ok ? ' is-ok' : '');
    msg.textContent = ok ? 'Code sent! Check your inbox.' : 'Please enter a valid email address.';
    // To really send the code, post the email to your server here.
    if (ok) setTimeout(close, 1600);
  });
  var seen = false;
  try { seen = sessionStorage.getItem('bk-offer-seen') === '1'; } catch (e) {}
  if (!seen) setTimeout(function () { open(); try { sessionStorage.setItem('bk-offer-seen', '1'); } catch (e) {} }, 3000);
});`,
  },
  {
    id: 'pro-footer-clinic', category: 'Pro Footer', name: 'Footer: CTA band + 4 columns',
    description: 'Big call-to-action band that overlaps a dark footer, with 4 link columns, working hours, social buttons that lift on hover and a back-to-top button.',
    specs: ['CTA card overlaps footer (negative margin, safe on all widths)', 'Link underline slide animation', 'Social icons rise and fill with accent on hover', 'Back to top smooth scroll', '4 -> 2 -> 1 columns'],
    shared: ['pro'],
    html: `<footer class="bk-p bk-fc">
  <div class="bk-pw"><div class="bk-fc__cta bk-rv"><div><h2>Need care today?</h2><p>Call our 24/7 helpline or book a visit online.</p></div><div class="bk-fc__cb"><a class="bk-pbtn bk-pbtn--light" href="#booking">Book appointment ${AR}</a><a class="bk-fc__tel" href="#">${I_PHONE}+91 00000 00000</a></div></div></div>
  <div class="bk-pw bk-fc__g">
    <div class="bk-fc__brand"><a class="bk-fc__logo" href="#home"><span>${IC.heart}</span>CareWell</a><p>Compassionate, modern healthcare for every family since 1998.</p><div class="bk-fc__soc"><a href="#" aria-label="Facebook">${IC.fb}</a><a href="#" aria-label="Instagram">${IC.ig}</a><a href="#" aria-label="LinkedIn">${IC.in}</a><a href="#" aria-label="X">${IC.x}</a></div></div>
    <nav><h4>Departments</h4><a href="#">Cardiology</a><a href="#">Orthopedics</a><a href="#">Pediatrics</a><a href="#">Neurology</a></nav>
    <nav><h4>Company</h4><a href="#about">About us</a><a href="#team">Our doctors</a><a href="#careers">Careers</a><a href="#">News</a></nav>
    <div class="bk-fc__ct"><h4>Contact</h4><p>${IC.pin}Street name, Area, City</p><p>${IC.mail}hello@example.com</p><p>${IC.clock}Mon - Sat, 9 AM - 6 PM</p></div>
  </div>
  <div class="bk-pw bk-fc__b"><span>&copy; 2026 CareWell Hospital. All rights reserved.</span><span class="bk-fc__l"><a href="#">Privacy</a><a href="#">Terms</a></span><button class="bk-fc__up" type="button" aria-label="Back to top">${IC.arrowUp}</button></div>
</footer>`,
    css: `.bk-fc{position:relative;background:#0b1220;color:#b8c4dc;padding-top:clamp(70px,9vw,110px);margin-top:clamp(50px,6vw,80px)}
.bk-fc__cta{position:relative;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:24px;margin-top:calc(-1 * clamp(130px,16vw,190px));margin-bottom:clamp(40px,5vw,64px);padding:clamp(26px,4vw,54px);border-radius:calc(var(--bk-r) + 8px);background:linear-gradient(120deg,var(--bk-a),var(--bk-a-d));color:#fff;overflow:hidden;box-shadow:0 40px 80px -30px var(--bk-a)}
.bk-fc__cta::before{content:"";position:absolute;right:-60px;top:-80px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,.14);animation:bk-bob 8s ease-in-out infinite}
.bk-fc__cta>*{position:relative}
.bk-fc__cta h2{font-size:clamp(26px,3.6vw,42px);margin-bottom:6px}
.bk-fc__cta p{opacity:.9}
.bk-fc__cb{display:flex;flex-wrap:wrap;align-items:center;gap:14px 26px}
.bk-fc__tel{display:inline-flex;align-items:center;gap:10px;color:#fff;font-weight:700;text-decoration:none}
.bk-fc__g{display:grid;grid-template-columns:1.5fr 1fr 1fr 1.3fr;gap:clamp(24px,4vw,56px);padding-bottom:44px}
.bk-fc__logo{display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;color:#fff;font-size:24px;font-weight:800;text-decoration:none}
.bk-fc__logo span{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--bk-a);color:#fff}
.bk-fc__brand p{max-width:300px;margin-bottom:20px;line-height:1.7}
.bk-fc__soc{display:flex;gap:10px}
.bk-fc__soc a{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:#16203a;color:#fff;transition:transform .5s var(--bk-ease),background .3s}
.bk-fc__soc a:hover{transform:translateY(-6px);background:var(--bk-a)}
.bk-fc__soc svg{width:18px;height:18px}
.bk-fc h4{margin-bottom:18px;color:#fff;font-size:15px;letter-spacing:.1em;text-transform:uppercase}
.bk-fc nav{display:flex;flex-direction:column;align-items:flex-start;gap:12px}
.bk-fc nav a{position:relative;color:#b8c4dc;text-decoration:none;transition:color .3s}
.bk-fc nav a::after{content:"";position:absolute;left:0;bottom:-3px;width:100%;height:2px;background:var(--bk-a);transform:scaleX(0);transform-origin:right;transition:transform .5s var(--bk-ease)}
.bk-fc nav a:hover{color:#fff}
.bk-fc nav a:hover::after{transform:scaleX(1);transform-origin:left}
.bk-fc__ct p{display:flex;gap:10px;margin-bottom:12px}
.bk-fc__ct svg{flex:none;width:18px;height:18px;margin-top:3px;color:var(--bk-a-m)}
.bk-fc__b{display:flex;align-items:center;flex-wrap:wrap;gap:14px 28px;padding-top:24px;padding-bottom:28px;border-top:1px solid #1e2a47;font-size:14px}
.bk-fc__l{display:flex;gap:20px;margin-left:auto}
.bk-fc__l a{color:#b8c4dc}
.bk-fc__l a:hover{color:#fff}
.bk-fc__up{display:grid;place-items:center;width:46px;height:46px;padding:0;border:0;border-radius:50%;background:var(--bk-a);color:#fff;cursor:pointer;transition:transform .5s var(--bk-ease)}
.bk-fc__up:hover{transform:translateY(-6px)}
@media (max-width:900px){.bk-fc__g{grid-template-columns:1fr 1fr}.bk-fc__brand{grid-column:1/-1}}
@media (max-width:520px){.bk-fc__g{grid-template-columns:1fr}.bk-fc__l{margin-left:0}}`,
    js: `document.querySelectorAll('.bk-fc__up').forEach(function (b) {
  b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
});`,
  },
  {
    id: 'pro-speed-dial', category: 'Pro Extras', name: 'Floating speed dial (call / chat / mail)',
    description: 'A round + button fixed at the corner. Tap it and three action buttons fan out upwards with labels (Call, WhatsApp, Email). The plus rotates into an X.',
    specs: ['Staggered pop-out using transition-delay', 'aria-expanded, Esc and outside click close it', 'Labels slide in from the left; mobile-safe position', 'Replace href values with tel:, https://wa.me/ and mailto:'],
    shared: ['pro'],
    html: `<div class="bk-p bk-sd">
  <div class="bk-sd__list" role="menu" aria-label="Contact options">
    <a role="menuitem" href="tel:+910000000000" style="--n:0"><span>Call us</span><i>${I_PHONE}</i></a>
    <a role="menuitem" href="https://wa.me/910000000000" style="--n:1"><span>WhatsApp</span><i>${I_CHAT}</i></a>
    <a role="menuitem" href="mailto:hello@example.com" style="--n:2"><span>Email</span><i>${I_MAIL}</i></a>
  </div>
  <button class="bk-sd__btn" type="button" aria-expanded="false" aria-label="Contact options">${I_PLUS}</button>
</div>`,
    css: `.bk-sd{position:fixed;z-index:110;right:clamp(14px,2.4vw,28px);bottom:clamp(14px,2.4vw,28px);display:flex;flex-direction:column;align-items:flex-end;gap:14px}
.bk-sd__btn{position:relative;display:grid;place-items:center;width:62px;height:62px;padding:0;border:0;border-radius:50%;background:var(--bk-a);color:#fff;box-shadow:0 18px 36px -12px var(--bk-a);cursor:pointer;transition:transform .6s var(--bk-ease),background .3s}
.bk-sd__btn::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid var(--bk-a);animation:bk-pulse 2.4s ease-out infinite}
.bk-sd__btn svg{transition:transform .6s var(--bk-ease)}
.bk-sd__btn:hover{transform:scale(1.08)}
.bk-sd__btn:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:3px}
.bk-sd.is-open .bk-sd__btn svg{transform:rotate(135deg)}
.bk-sd.is-open .bk-sd__btn::after{animation:none;opacity:0}
.bk-sd__list{display:flex;flex-direction:column;align-items:flex-end;gap:12px}
.bk-sd__list a{display:flex;align-items:center;gap:12px;color:var(--bk-ink);text-decoration:none;opacity:0;visibility:hidden;transform:translateY(24px) scale(.6);transform-origin:bottom right;transition:opacity .35s,visibility .35s,transform .6s var(--bk-ease);transition-delay:calc((2 - var(--n)) * 60ms)}
.bk-sd.is-open .bk-sd__list a{opacity:1;visibility:visible;transform:none;transition-delay:calc(var(--n) * 70ms)}
.bk-sd__list span{padding:8px 16px;border-radius:999px;background:#fff;box-shadow:0 10px 24px -10px rgba(11,18,32,.45);font-size:14px;font-weight:700;transition:transform .5s var(--bk-ease)}
.bk-sd__list i{display:grid;place-items:center;width:50px;height:50px;border-radius:50%;background:#fff;color:var(--bk-a);box-shadow:0 12px 26px -10px rgba(11,18,32,.5);transition:background .3s,color .3s,transform .5s var(--bk-ease)}
.bk-sd__list a:hover i{background:var(--bk-a);color:#fff;transform:scale(1.1)}
.bk-sd__list a:hover span{transform:translateX(-4px)}
.bk-sd__list a:focus-visible i{outline:3px solid var(--bk-a-m);outline-offset:2px}
.bk-sd__list svg{width:22px;height:22px}
@media (max-width:520px){.bk-sd__btn{width:56px;height:56px}.bk-sd__list i{width:46px;height:46px}}`,
    js: `document.querySelectorAll('.bk-sd').forEach(function (root) {
  var btn = root.querySelector('.bk-sd__btn');
  function set(o) { root.classList.toggle('is-open', o); btn.setAttribute('aria-expanded', o ? 'true' : 'false'); }
  btn.addEventListener('click', function () { set(!root.classList.contains('is-open')); });
  document.addEventListener('click', function (e) { if (!root.contains(e.target)) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
});`,
  },
  {
    id: 'pro-page-header', category: 'Pro Sections', name: 'Inner page header + breadcrumb',
    description: 'Compact banner for inner pages (About, Services, Blog). Gradient with animated shapes, breadcrumb trail with chevrons and a big title that slides in.',
    specs: ['Breadcrumb as <nav> + <ol>, last item aria-current="page"', 'Floating shapes + diagonal bottom edge (clip-path)', 'Title clamp(32px, 6vw, 68px)', 'Zero JS, perfect at 320px'],
    shared: ['pro'],
    html: `<header class="bk-p bk-hd">
  <i class="bk-hd__s bk-hd__s--1" aria-hidden="true"></i><i class="bk-hd__s bk-hd__s--2" aria-hidden="true"></i><i class="bk-hd__s bk-hd__s--3" aria-hidden="true"></i>
  <div class="bk-pw bk-hd__in">
    <nav aria-label="Breadcrumb" class="bk-rv"><ol><li><a href="#home">Home</a></li><li><a href="#services">Services</a></li><li aria-current="page">Cardiology</li></ol></nav>
    <h1 class="bk-rv" style="--i:1">Cardiology &amp; heart care</h1>
    <p class="bk-rv" style="--i:2">Prevention, diagnosis and treatment from a team that treats hearts like family.</p>
  </div>
</header>`,
    css: `.bk-hd{position:relative;overflow:hidden;background:linear-gradient(120deg,var(--bk-a-d),var(--bk-a) 60%,var(--bk-a2));color:#fff;padding:clamp(56px,8vw,110px) 0 clamp(80px,10vw,140px);clip-path:polygon(0 0,100% 0,100% 82%,0 100%)}
.bk-hd__s{position:absolute;border-radius:50%;background:rgba(255,255,255,.12);animation:bk-bob 8s ease-in-out infinite}
.bk-hd__s--1{right:8%;top:-60px;width:240px;height:240px}
.bk-hd__s--2{left:-50px;bottom:10%;width:160px;height:160px;animation-delay:-3s}
.bk-hd__s--3{right:30%;bottom:22%;width:44px;height:44px;border-radius:12px;animation-delay:-5s;transform:rotate(20deg)}
.bk-hd__in{position:relative}
.bk-hd ol{display:flex;flex-wrap:wrap;gap:6px 0;margin:0 0 20px;padding:0;list-style:none;font-size:14.5px}
.bk-hd li{display:flex;align-items:center;opacity:.9}
.bk-hd li+li::before{content:"\\203A";margin:0 12px;opacity:.6;font-size:18px}
.bk-hd li a{color:#fff;text-decoration:none;border-bottom:1px solid transparent;transition:border-color .3s}
.bk-hd li a:hover{border-color:#fff}
.bk-hd li[aria-current]{font-weight:700;opacity:1}
.bk-hd h1{max-width:820px;font-size:clamp(32px,6vw,68px);font-weight:800;letter-spacing:-.04em}
.bk-hd__in>p{max-width:560px;margin-top:14px;font-size:clamp(16px,1.7vw,20px);opacity:.9}
@media (max-width:520px){.bk-hd ol{font-size:13px}.bk-hd li+li::before{margin:0 8px}.bk-hd{clip-path:polygon(0 0,100% 0,100% 90%,0 100%)}}`,
    js: '',
  },
  {
    id: 'pro-article-toc', category: 'Pro Sections', name: 'Article layout with TOC + reading progress',
    description: 'Blog article template: reading-progress bar at the top, sticky table of contents that highlights the current heading, share buttons and a pull-quote.',
    specs: ['Progress bar fills with scroll (position: fixed)', 'Sticky TOC with scroll-spy (IntersectionObserver)', 'Smooth jump to headings (scroll-margin-top built in)', 'TOC becomes a compact chip row on tablets and phones', 'Readable 68ch measure, large type'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-ar" id="blog">
  <div class="bk-ar__bar" aria-hidden="true"><i></i></div>
  <div class="bk-pw bk-ar__g">
    <aside class="bk-ar__toc"><b>On this page</b><nav aria-label="Table of contents"><a href="#ar-1" class="is-on">Why it matters</a><a href="#ar-2">What we learned</a><a href="#ar-3">How to start</a><a href="#ar-4">Final thoughts</a></nav></aside>
    <article class="bk-ar__body">
      <header class="bk-rv"><span class="bk-pey">Guide &middot; 6 min read</span><h1>How to make your website feel instant</h1><div class="bk-ar__by"><img src="${img('bk-au', 80, 80)}" alt=""><span>Written by <b>Ananya R.</b><small>12 March 2026</small></span></div></header>
      <img class="bk-ar__hero bk-rv" src="${img('bk-ar-hero', 1100, 560)}" alt="" loading="lazy">
      <h2 id="ar-1">Why it matters</h2>
      <p>Visitors decide within seconds. A page that responds right away feels trustworthy, and trust is what turns a visit into an enquiry or a sale.</p>
      <blockquote>Speed is not a feature. It is the first impression, repeated on every click.</blockquote>
      <h2 id="ar-2">What we learned</h2>
      <p>After rebuilding forty websites, the same three fixes gave the biggest wins: smaller images, less blocking script, and fewer fonts. None of them need a rewrite.</p>
      <p>Measure first. Change one thing at a time. Keep the results in a simple table so the whole team can see what worked.</p>
      <h2 id="ar-3">How to start</h2>
      <p>Open your slowest page, run a speed test and fix the top item on the list. Repeat weekly. Small steady steps beat a big risky project.</p>
      <h2 id="ar-4">Final thoughts</h2>
      <p>You do not need to be an expert. You need a habit. Start today with one page and share the result with your team.</p>
      <div class="bk-ar__sh"><span>Share this article</span><a href="#" aria-label="Share on Facebook">${IC.fb}</a><a href="#" aria-label="Share on LinkedIn">${IC.in}</a><a href="#" aria-label="Share on X">${IC.x}</a></div>
    </article>
  </div>
</section>`,
    css: `.bk-ar{position:relative;background:#fff}
.bk-ar__bar{position:fixed;left:0;top:0;right:0;z-index:200;height:4px;background:transparent;pointer-events:none}
.bk-ar__bar i{display:block;height:100%;width:0;background:linear-gradient(90deg,var(--bk-a),var(--bk-a2));border-radius:0 4px 4px 0}
.bk-ar__g{display:grid;grid-template-columns:230px minmax(0,1fr);gap:clamp(28px,5vw,72px);align-items:start;max-width:1100px}
.bk-ar__toc{position:sticky;top:96px;padding:22px;border-radius:var(--bk-r);background:var(--bk-soft);border:1px solid var(--bk-line)}
.bk-ar__toc b{display:block;margin-bottom:14px;font-size:12.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--bk-mut)}
.bk-ar__toc nav{display:flex;flex-direction:column;gap:2px;border-left:2px solid var(--bk-line)}
.bk-ar__toc a{position:relative;margin-left:-2px;padding:9px 0 9px 16px;border-left:2px solid transparent;color:var(--bk-mut);font-size:15px;font-weight:600;text-decoration:none;transition:color .3s,border-color .3s,padding .4s var(--bk-ease)}
.bk-ar__toc a:hover{color:var(--bk-ink);padding-left:20px}
.bk-ar__toc a.is-on{color:var(--bk-a);border-left-color:var(--bk-a)}
.bk-ar__body{min-width:0;max-width:68ch}
.bk-ar__body header h1{margin:18px 0;font-size:clamp(30px,4.6vw,52px);font-weight:800;letter-spacing:-.04em}
.bk-ar__by{display:flex;align-items:center;gap:12px;margin-bottom:28px;font-size:14.5px;color:var(--bk-mut)}
.bk-ar__by img{width:46px;height:46px;border-radius:50%;object-fit:cover}
.bk-ar__by b{color:var(--bk-ink)}
.bk-ar__by small{display:block}
.bk-ar__hero{width:100%;aspect-ratio:2/1;object-fit:cover;border-radius:var(--bk-r);margin-bottom:34px}
.bk-ar__body h2{margin:40px 0 14px;font-size:clamp(24px,2.6vw,32px)}
.bk-ar__body p{margin-bottom:18px;font-size:clamp(17px,1.5vw,19px);line-height:1.85;color:#334155}
.bk-ar__body blockquote{margin:30px 0;padding:6px 0 6px 26px;border-left:5px solid var(--bk-a);font-size:clamp(20px,2.2vw,26px);font-weight:700;line-height:1.5;letter-spacing:-.01em;color:var(--bk-ink)}
.bk-ar__sh{display:flex;align-items:center;gap:12px;margin-top:40px;padding-top:24px;border-top:1px solid var(--bk-line);font-weight:700}
.bk-ar__sh a{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:var(--bk-a-l);color:var(--bk-a);transition:background .3s,color .3s,transform .5s var(--bk-ease)}
.bk-ar__sh a:hover{background:var(--bk-a);color:#fff;transform:translateY(-4px)}
.bk-ar__sh svg{width:18px;height:18px}
@media (max-width:900px){.bk-ar__g{grid-template-columns:minmax(0,1fr)}.bk-ar__toc{min-width:0}.bk-ar__toc{position:sticky;top:0;z-index:5;padding:10px 12px;border-radius:0 0 var(--bk-r) var(--bk-r);background:rgba(255,255,255,.92);-webkit-backdrop-filter:blur(10px);backdrop-filter:blur(10px)}.bk-ar__toc b{display:none}.bk-ar__toc nav{flex-direction:row;overflow-x:auto;border:0;gap:6px;scrollbar-width:none}.bk-ar__toc nav::-webkit-scrollbar{display:none}.bk-ar__toc a{flex:none;margin:0;padding:8px 16px;border:1.5px solid var(--bk-line);border-radius:999px;font-size:14px}.bk-ar__toc a:hover{padding-left:16px}.bk-ar__toc a.is-on{background:var(--bk-a);border-color:var(--bk-a);color:#fff}}`,
    js: `document.querySelectorAll('.bk-ar').forEach(function (root) {
  var fill = root.querySelector('.bk-ar__bar i');
  var body = root.querySelector('.bk-ar__body');
  var links = [].slice.call(root.querySelectorAll('.bk-ar__toc a'));
  var heads = links.map(function (a) { var h = a.getAttribute('href'); try { return root.querySelector(h); } catch (e) { return null; } });
  var tick = false;
  function upd() {
    var r = body.getBoundingClientRect();
    var p = Math.max(0, Math.min(1, (window.innerHeight * 0.3 - r.top) / Math.max(r.height - window.innerHeight * 0.4, 1)));
    fill.style.width = (p * 100).toFixed(1) + '%';
    var cur = 0;
    heads.forEach(function (h, i) { if (h && h.getBoundingClientRect().top < window.innerHeight * 0.35) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('is-on', i === cur); });
    tick = false;
  }
  window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  window.addEventListener('resize', upd); upd();
});`,
  },
  {
    id: 'pro-coverflow', category: 'Pro Cards', name: '3D coverflow carousel',
    description: 'Cards arranged in 3D: the centre one faces you, the sides rotate away and fade. Click a side card, use arrows or swipe to bring it to the centre.',
    specs: ['CSS 3D transforms (perspective) driven by --o (offset) per card', 'Arrows, dots, keyboard, swipe and click-to-center', 'Autoplay off by default; reduced motion removes rotation', 'Simplified flat layout under 640px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-cf" id="showcase" tabindex="0" aria-roledescription="carousel" aria-label="Showcase">
  <div class="bk-pw"><div class="bk-ph bk-rv"><span class="bk-pey">Showcase</span><h2>Swipe through our latest work</h2></div></div>
  <div class="bk-cf__stage">
    <figure class="bk-cf__c"><img src="${img('bk-cf1', 520, 680)}" alt="" loading="lazy"><figcaption><b>Skyline Villa</b><span>Residential</span></figcaption></figure>
    <figure class="bk-cf__c"><img src="${img('bk-cf2', 520, 680)}" alt="" loading="lazy"><figcaption><b>Lotus Cafe</b><span>Hospitality</span></figcaption></figure>
    <figure class="bk-cf__c"><img src="${img('bk-cf3', 520, 680)}" alt="" loading="lazy"><figcaption><b>Nila Studio</b><span>Branding</span></figcaption></figure>
    <figure class="bk-cf__c"><img src="${img('bk-cf4', 520, 680)}" alt="" loading="lazy"><figcaption><b>Harbor Clinic</b><span>Healthcare</span></figcaption></figure>
    <figure class="bk-cf__c"><img src="${img('bk-cf5', 520, 680)}" alt="" loading="lazy"><figcaption><b>Orbit App</b><span>Mobile</span></figcaption></figure>
  </div>
  <div class="bk-cf__ctl"><button class="bk-cf__p" type="button" aria-label="Previous">&larr;</button><div class="bk-cf__dots"></div><button class="bk-cf__n" type="button" aria-label="Next">&rarr;</button></div>
</section>`,
    css: `.bk-cf{background:linear-gradient(180deg,var(--bk-soft),#fff);overflow:hidden;outline:0}
.bk-cf__stage{position:relative;height:clamp(380px,48vw,560px);perspective:1400px;touch-action:pan-y}
.bk-cf__c{--o:0;position:absolute;left:50%;top:0;width:clamp(210px,28vw,330px);height:100%;margin:0 0 0 calc(clamp(210px,28vw,330px) / -2);overflow:hidden;border-radius:var(--bk-r);background:#0b1220;box-shadow:0 40px 70px -30px rgba(11,18,32,.6);cursor:pointer;transform:translateX(calc(var(--o) * 62%)) translateZ(calc(var(--a,0) * -140px)) rotateY(calc(var(--o) * -34deg)) scale(calc(1 - var(--a,0) * .08));opacity:calc(1 - var(--a,0) * .28);z-index:calc(10 - var(--a,0) * 2);transition:transform .8s var(--bk-ease),opacity .6s}
.bk-cf__c img{width:100%;height:100%;object-fit:cover;transition:transform 1s var(--bk-ease)}
.bk-cf__c:hover img{transform:scale(1.05)}
.bk-cf__c figcaption{position:absolute;left:0;right:0;bottom:0;display:grid;gap:2px;padding:22px;background:linear-gradient(0deg,rgba(6,11,24,.85),transparent);color:#fff;opacity:0;transform:translateY(12px);transition:opacity .5s,transform .6s var(--bk-ease)}
.bk-cf__c figcaption b{font-size:20px}
.bk-cf__c figcaption span{font-size:13px;color:#cbd6ec}
.bk-cf__c.is-c figcaption{opacity:1;transform:none}
.bk-cf__c.is-hide{visibility:hidden;opacity:0}
.bk-cf__ctl{display:flex;align-items:center;justify-content:center;gap:20px;margin-top:clamp(22px,3vw,36px)}
.bk-cf__ctl>button{display:grid;place-items:center;width:52px;height:52px;border:1px solid var(--bk-line);border-radius:50%;background:#fff;color:var(--bk-ink);font-size:20px;cursor:pointer;transition:background .3s,color .3s,transform .4s var(--bk-ease)}
.bk-cf__ctl>button:hover{background:var(--bk-a);border-color:var(--bk-a);color:#fff;transform:scale(1.08)}
.bk-cf__dots{display:flex;gap:8px}
.bk-cf__dots button{width:10px;height:10px;padding:0;border:0;border-radius:10px;background:var(--bk-line);cursor:pointer;transition:width .5s var(--bk-ease),background .3s}
.bk-cf__dots button.is-on{width:30px;background:var(--bk-a)}
@media (max-width:640px){.bk-cf__c{transform:translateX(calc(var(--o) * 78%)) scale(calc(1 - var(--a,0) * .12));opacity:calc(1 - var(--a,0) * .4)}}
@media (prefers-reduced-motion:reduce){.bk-cf__c{transform:translateX(calc(var(--o) * 62%)) scale(calc(1 - var(--a,0) * .08))}}`,
    js: `document.querySelectorAll('.bk-cf').forEach(function (root) {
  var cards = [].slice.call(root.querySelectorAll('.bk-cf__c'));
  var dotsBox = root.querySelector('.bk-cf__dots');
  var cur = Math.floor(cards.length / 2), n = cards.length;
  var dots = cards.map(function (c, i) {
    var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show item ' + (i + 1));
    b.addEventListener('click', function () { go(i); }); dotsBox.appendChild(b); return b;
  });
  function go(i) {
    cur = Math.max(0, Math.min(n - 1, i));
    cards.forEach(function (c, k) {
      var o = k - cur, a = Math.min(Math.abs(o), 3);
      c.style.setProperty('--o', o); c.style.setProperty('--a', a);
      c.classList.toggle('is-c', o === 0);
      c.classList.toggle('is-hide', Math.abs(o) > 2);
    });
    dots.forEach(function (d, k) { d.classList.toggle('is-on', k === cur); });
  }
  cards.forEach(function (c, i) { c.addEventListener('click', function () { go(i); }); });
  root.querySelector('.bk-cf__p').addEventListener('click', function () { go(cur - 1); });
  root.querySelector('.bk-cf__n').addEventListener('click', function () { go(cur + 1); });
  root.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') go(cur - 1); if (e.key === 'ArrowRight') go(cur + 1); });
  var sx = null, stage = root.querySelector('.bk-cf__stage');
  stage.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  stage.addEventListener('pointerup', function (e) { if (sx === null) return; var d = e.clientX - sx; sx = null; if (Math.abs(d) > 40) go(cur + (d < 0 ? 1 : -1)); });
  go(cur);
});`,
  },
  {
    id: 'pro-newsletter-wave', category: 'Pro Forms', name: 'Newsletter band with animated wave',
    description: 'Gradient subscribe band with two layered waves sliding along the top edge, a big heading, an email field with button and a privacy note.',
    specs: ['Two SVG waves, different speeds (CSS translate loop)', 'Email validation with inline message, no page reload', 'Field + button stack on phones', 'Colours follow your accent'],
    shared: ['pro'],
    html: `<section class="bk-p bk-nw" id="subscribe">
  <svg class="bk-nw__w bk-nw__w--1" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40c120 40 240 40 360 0s240-40 360 0 240 40 360 0 240-40 360 0v40H0z" fill="#fff"/></svg>
  <svg class="bk-nw__w bk-nw__w--2" viewBox="0 0 1440 80" preserveAspectRatio="none" aria-hidden="true"><path d="M0 40c120 40 240 40 360 0s240-40 360 0 240 40 360 0 240-40 360 0v40H0z" fill="#fff"/></svg>
  <div class="bk-pw bk-nw__in">
    <span class="bk-pey bk-rv">Newsletter</span>
    <h2 class="bk-rv" style="--i:1">Get fresh ideas in your inbox</h2>
    <p class="bk-rv" style="--i:2">One short email a week. Tips, offers and stories. Unsubscribe anytime.</p>
    <form class="bk-nw__f bk-rv" style="--i:3" novalidate><input type="email" required placeholder="you@example.com" aria-label="Email address"><button class="bk-pbtn bk-pbtn--light" type="submit">Subscribe ${AR}</button></form>
    <p class="bk-nw__m" role="status" aria-live="polite">We respect your privacy.</p>
  </div>
</section>`,
    css: `.bk-nw{position:relative;overflow:hidden;background:linear-gradient(135deg,var(--bk-a-d),var(--bk-a) 55%,var(--bk-a2));color:#fff;text-align:center;padding:clamp(90px,11vw,150px) 0 clamp(60px,8vw,100px)}
.bk-nw__w{position:absolute;left:0;top:-1px;width:200%;height:clamp(40px,6vw,80px)}
.bk-nw__w--1{opacity:.45;animation:bk-nw-w 18s linear infinite}
.bk-nw__w--2{animation:bk-nw-w 28s linear infinite reverse}
@keyframes bk-nw-w{to{transform:translateX(-50%)}}
.bk-nw__in{position:relative}
.bk-nw .bk-pey{background:rgba(255,255,255,.18);color:#fff}
.bk-nw h2{margin:20px 0 12px;font-size:clamp(30px,5vw,56px)}
.bk-nw__in>p:not(.bk-nw__m){max-width:480px;margin:0 auto 30px;opacity:.92;font-size:clamp(16px,1.6vw,19px)}
.bk-nw__f{display:flex;gap:8px;max-width:520px;margin:0 auto;padding:7px;border-radius:999px;background:#fff;box-shadow:0 30px 60px -26px rgba(0,0,0,.5);transition:box-shadow .4s}
.bk-nw__f:focus-within{box-shadow:0 0 0 5px rgba(255,255,255,.35),0 30px 60px -26px rgba(0,0,0,.5)}
.bk-nw__f input{flex:1;min-width:0;padding:0 20px;border:0;background:transparent;color:var(--bk-ink);font-family:inherit;font-size:16px;outline:0}
.bk-nw__f .bk-pbtn{background:var(--bk-a);border-color:var(--bk-a);color:#fff;padding:15px 26px;box-shadow:none;white-space:nowrap}
.bk-nw__f .bk-pbtn:hover{background:var(--bk-a-d);border-color:var(--bk-a-d)}
.bk-nw__m{min-height:1.4em;margin-top:16px;font-size:14px;font-weight:600;opacity:.9}
.bk-nw__m.is-ok{opacity:1}
@media (max-width:520px){.bk-nw__f{flex-direction:column;border-radius:24px;padding:10px}.bk-nw__f input{padding:14px 16px}.bk-nw__f .bk-pbtn{width:100%;justify-content:center}}`,
    js: `document.querySelectorAll('.bk-nw__f').forEach(function (form) {
  var msg = form.parentNode.querySelector('.bk-nw__m');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.querySelector('input'), ok = f.checkValidity();
    msg.className = 'bk-nw__m' + (ok ? ' is-ok' : '');
    msg.textContent = ok ? 'You are in! Please check your inbox to confirm.' : 'Please enter a valid email address.';
    // To really subscribe, send the email to your mailing service here.
    if (ok) form.reset();
  });
});`,
  },
];
