import type { Block } from './blocks';
import { AR, IC, img } from './proShared';

/** PRO blocks, part B: about, stats, process, marquee, gallery, reviews, pricing, FAQ, contact, CTA, footer, extras. */
export const PRO_B: Block[] = [
  {
    id: 'pro-about-collage', category: 'Pro Sections', name: 'About: photo collage + badge',
    description: 'Two overlapping photos that drift apart on hover, a spinning experience badge, checklist and signature line.',
    specs: ['Overlapping collage, images shift in opposite directions on hover', 'Spinning dashed badge with years of experience', 'Checklist rows slide on hover', 'Two columns -> one under 900px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-ab" id="about">
  <div class="bk-pw bk-ab__in">
    <div class="bk-ab__pics bk-rv bk-rv--l">
      <img class="bk-ab__a" src="${img('bk-ab1', 640, 780)}" alt="Our studio" loading="lazy">
      <img class="bk-ab__b" src="${img('bk-ab2', 480, 520)}" alt="Our work" loading="lazy">
      <div class="bk-ab__badge"><b>15+</b><span>Years of<br>experience</span></div>
    </div>
    <div class="bk-ab__txt">
      <span class="bk-pey bk-rv">About us</span>
      <h2 class="bk-rv" style="--i:1">We turn good ideas into things people use</h2>
      <p class="bk-rv" style="--i:2">A short story about who you are, what you believe and how you work. Two or three honest sentences are enough.</p>
      <ul class="bk-ab__list bk-rv" style="--i:3"><li>${IC.check}Senior team on every project</li><li>${IC.check}Transparent weekly progress</li><li>${IC.check}Fixed price, no hidden costs</li></ul>
      <a class="bk-pbtn bk-rv" style="--i:4" href="#contact">Meet the team ${AR}</a>
    </div>
  </div>
</section>`,
    css: `.bk-ab__in{display:grid;grid-template-columns:1fr 1fr;gap:clamp(36px,6vw,96px);align-items:center}
.bk-ab__pics{position:relative;padding:0 14% 12% 0}
.bk-ab__pics img{border-radius:var(--bk-r);object-fit:cover;box-shadow:var(--bk-sh);transition:transform .9s var(--bk-ease)}
.bk-ab__a{width:100%;aspect-ratio:4/4.6}
.bk-ab__b{position:absolute;right:0;bottom:0;width:52%;aspect-ratio:1;border:8px solid #fff}
.bk-ab__pics:hover .bk-ab__a{transform:translate(-8px,-8px) scale(1.02)}
.bk-ab__pics:hover .bk-ab__b{transform:translate(10px,10px) rotate(2deg)}
.bk-ab__badge{position:absolute;left:-14px;bottom:18%;display:grid;place-items:center;width:128px;height:128px;border-radius:50%;background:var(--bk-a);color:#fff;text-align:center;box-shadow:0 20px 40px -16px var(--bk-a)}
.bk-ab__badge::before{content:"";position:absolute;inset:7px;border:1.5px dashed rgba(255,255,255,.6);border-radius:50%;animation:bk-spin 18s linear infinite}
.bk-ab__badge b{font-size:34px;line-height:1;letter-spacing:-.03em}
.bk-ab__badge span{font-size:12px;line-height:1.25;margin-top:-18px}
.bk-ab__txt h2{font-size:clamp(30px,4.2vw,50px);margin:18px 0}
.bk-ab__txt>p{color:var(--bk-mut);font-size:18px;margin-bottom:26px}
.bk-ab__list{list-style:none;margin:0 0 32px;padding:0;display:grid;gap:12px}
.bk-ab__list li{display:flex;align-items:center;gap:14px;padding:14px 18px;border-radius:16px;background:var(--bk-soft);font-weight:600;transition:transform .4s var(--bk-ease),background .3s}
.bk-ab__list li svg{flex:none;width:28px;height:28px;padding:5px;border-radius:50%;background:var(--bk-a);color:#fff}
.bk-ab__list li:hover{transform:translateX(10px);background:var(--bk-a-l)}
@media (max-width:900px){.bk-ab__in{grid-template-columns:1fr}.bk-ab__pics{max-width:520px;margin:0 auto;width:100%}}`,
    js: '',
  },
  {
    id: 'pro-stats-rings', category: 'Pro Sections', name: 'Stats: progress rings (count-up)',
    description: 'Dark band with four circular rings that fill and count up when scrolled into view.',
    specs: ['SVG rings animated by stroke-dashoffset', 'Count-up with easing, runs once on scroll', 'Edit data-value / data-ring / data-suffix on each tile', '4 columns -> 2 -> 1'],
    shared: ['pro'],
    html: `<section class="bk-p bk-st" id="stats">
  <div class="bk-pw bk-st__grid">
    <div class="bk-st__it bk-rv" style="--i:0" data-value="1200" data-ring="86" data-suffix="+"><div class="bk-st__ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="bk-st__bar" cx="60" cy="60" r="52"/></svg><b class="bk-st__n">0</b></div><span>Projects delivered</span></div>
    <div class="bk-st__it bk-rv" style="--i:1" data-value="98" data-ring="98" data-suffix="%"><div class="bk-st__ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="bk-st__bar" cx="60" cy="60" r="52"/></svg><b class="bk-st__n">0</b></div><span>Client satisfaction</span></div>
    <div class="bk-st__it bk-rv" style="--i:2" data-value="45" data-ring="60" data-suffix="+"><div class="bk-st__ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="bk-st__bar" cx="60" cy="60" r="52"/></svg><b class="bk-st__n">0</b></div><span>Team members</span></div>
    <div class="bk-st__it bk-rv" style="--i:3" data-value="15" data-ring="75" data-suffix=""><div class="bk-st__ring"><svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52"/><circle class="bk-st__bar" cx="60" cy="60" r="52"/></svg><b class="bk-st__n">0</b></div><span>Years in business</span></div>
  </div>
</section>`,
    css: `.bk-st{background:radial-gradient(900px 400px at 15% 0,color-mix(in srgb,var(--bk-a) 38%,#0b1220),#0b1220);color:#fff;padding:clamp(56px,8vw,96px) 0}
.bk-st__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(20px,3vw,40px)}
.bk-st__it{display:grid;justify-items:center;gap:18px;text-align:center;transition:transform var(--bk-t) var(--bk-ease)}
.bk-st__it:hover{transform:translateY(var(--bk-lift))}
.bk-st__it span{color:#b8c4dc;font-size:15px;font-weight:500}
.bk-st__ring{position:relative;width:min(100%,170px);aspect-ratio:1;display:grid;place-items:center}
.bk-st__ring svg{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.bk-st__ring circle{fill:none;stroke:rgba(255,255,255,.12);stroke-width:7}
.bk-st__ring .bk-st__bar{stroke:var(--bk-a-m);stroke-linecap:round;stroke-dasharray:327;stroke-dashoffset:327;transition:stroke-dashoffset 1.8s var(--bk-ease),stroke .4s;filter:drop-shadow(0 0 8px var(--bk-a))}
.bk-st__it:hover .bk-st__bar{stroke:#fff}
.bk-st__n{font-size:clamp(28px,3.4vw,40px);letter-spacing:-.03em}
@media (max-width:900px){.bk-st__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:420px){.bk-st__grid{grid-template-columns:1fr}}`,
    js: `document.querySelectorAll('.bk-st').forEach(function (root) {
  var items = root.querySelectorAll('.bk-st__it');
  function run(it) {
    var end = parseFloat(it.getAttribute('data-value')) || 0;
    var ring = parseFloat(it.getAttribute('data-ring')) || 0;
    var suffix = it.getAttribute('data-suffix') || '';
    var n = it.querySelector('.bk-st__n');
    var bar = it.querySelector('.bk-st__bar');
    if (bar) bar.style.strokeDashoffset = String(327 - 327 * Math.min(ring, 100) / 100);
    var start = null, dur = 1800;
    function tick(t) {
      if (start === null) start = t;
      var p = Math.min((t - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      n.textContent = Math.round(end * e).toLocaleString() + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  if (!('IntersectionObserver' in window)) { items.forEach(run); return; }
  var io = new IntersectionObserver(function (list) {
    list.forEach(function (x) { if (x.isIntersecting) { run(x.target); io.unobserve(x.target); } });
  }, { threshold: 0.4 });
  items.forEach(function (it) { io.observe(it); });
});`,
  },
  {
    id: 'pro-process', category: 'Pro Sections', name: 'Process timeline (scroll-drawn line)',
    description: 'Vertical timeline whose line draws itself as you scroll. Steps light up when reached and alternate left/right on desktop.',
    specs: ['Scroll-linked progress line (JS sets --p)', 'Step bubbles fill when passed', 'Alternating layout on desktop, single column under 760px', 'Cards lift and number rotates on hover'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-tl" id="process">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Our process</span><h2>Simple steps, clear results</h2><p>Scroll down and watch the line follow you.</p></div>
    <ol class="bk-tl__list">
      <li class="bk-tl__step"><span class="bk-tl__dot">1</span><div class="bk-tl__card"><h3>Discovery call</h3><p>A free 30 minute chat to understand your goals, users and budget.</p></div></li>
      <li class="bk-tl__step"><span class="bk-tl__dot">2</span><div class="bk-tl__card"><h3>Proposal</h3><p>A fixed scope, timeline and price you can approve in one page.</p></div></li>
      <li class="bk-tl__step"><span class="bk-tl__dot">3</span><div class="bk-tl__card"><h3>Design and build</h3><p>Weekly demos so you can see, test and steer the work as it grows.</p></div></li>
      <li class="bk-tl__step"><span class="bk-tl__dot">4</span><div class="bk-tl__card"><h3>Launch and support</h3><p>We go live together, then stay close for updates and improvements.</p></div></li>
    </ol>
  </div>
</section>`,
    css: `.bk-tl{background:#fff}
.bk-tl__list{--p:0;position:relative;list-style:none;margin:0;padding:0;display:grid;gap:clamp(28px,4vw,52px)}
.bk-tl__list::before,.bk-tl__list::after{content:"";position:absolute;left:50%;top:0;width:3px;margin-left:-1.5px;border-radius:3px}
.bk-tl__list::before{bottom:0;background:var(--bk-line)}
.bk-tl__list::after{height:calc(var(--p) * 100%);background:linear-gradient(180deg,var(--bk-a),var(--bk-a2));box-shadow:0 0 14px var(--bk-a-m)}
.bk-tl__step{position:relative;display:grid;grid-template-columns:1fr 1fr;align-items:center}
.bk-tl__dot{position:absolute;z-index:2;left:50%;top:50%;transform:translate(-50%,-50%);display:grid;place-items:center;width:48px;height:48px;border-radius:50%;background:#fff;border:3px solid var(--bk-line);font-weight:800;color:var(--bk-mut);transition:background .5s,border-color .5s,color .5s,transform .6s var(--bk-ease)}
.bk-tl__step.is-on .bk-tl__dot{background:var(--bk-a);border-color:var(--bk-a);color:#fff;transform:translate(-50%,-50%) scale(1.12);box-shadow:0 0 0 8px var(--bk-a-l)}
.bk-tl__card{grid-column:1;margin-right:clamp(36px,6vw,80px);padding:clamp(20px,2.4vw,30px);border-radius:var(--bk-r);background:var(--bk-soft);border:1px solid var(--bk-line);opacity:.5;transform:translateX(-24px);transition:opacity .7s,transform .8s var(--bk-ease),box-shadow .4s,background .4s}
.bk-tl__step:nth-child(even) .bk-tl__card{grid-column:2;margin:0 0 0 clamp(36px,6vw,80px);transform:translateX(24px)}
.bk-tl__step.is-on .bk-tl__card{opacity:1;transform:none}
.bk-tl__card:hover{background:#fff;box-shadow:var(--bk-sh)}
.bk-tl__card h3{font-size:22px;margin-bottom:8px}
.bk-tl__card p{color:var(--bk-mut)}
.bk-tl__step:hover .bk-tl__dot{transform:translate(-50%,-50%) rotate(360deg) scale(1.12)}
@media (max-width:760px){.bk-tl__list::before,.bk-tl__list::after{left:24px}.bk-tl__step{grid-template-columns:1fr}.bk-tl__dot{left:24px;top:28px;transform:translate(-50%,0)}.bk-tl__step.is-on .bk-tl__dot,.bk-tl__step:hover .bk-tl__dot{transform:translate(-50%,0) scale(1.1)}.bk-tl__card,.bk-tl__step:nth-child(even) .bk-tl__card{grid-column:1;margin:0 0 0 64px;transform:translateX(24px)}.bk-tl__step.is-on .bk-tl__card,.bk-tl__step:nth-child(even).is-on .bk-tl__card{transform:none}}`,
    js: `document.querySelectorAll('.bk-tl__list').forEach(function (list) {
  var steps = [].slice.call(list.querySelectorAll('.bk-tl__step'));
  function update() {
    var r = list.getBoundingClientRect();
    var mid = window.innerHeight * 0.55;
    var p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    list.style.setProperty('--p', p.toFixed(3));
    steps.forEach(function (s) {
      var b = s.getBoundingClientRect();
      s.classList.toggle('is-on', b.top + b.height / 2 < mid);
    });
  }
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});`,
  },
  {
    id: 'pro-marquee', category: 'Pro Extras', name: 'Logo marquee (two directions)',
    description: 'Two endless rows of brand names that move in opposite directions, fade at the edges and pause on hover.',
    specs: ['Seamless loop (JS clones the row once)', 'Edge fade with CSS mask', 'Pause on hover / focus, slower on mobile', 'Reduced-motion users get a static row'],
    shared: ['pro'],
    html: `<section class="bk-p bk-mq" id="partners">
  <p class="bk-mq__t bk-rv">Trusted by teams at</p>
  <div class="bk-mq__row"><div class="bk-mq__track"><span>Northwind</span><span>Acme Corp</span><span>Globex</span><span>Initech</span><span>Umbrella</span><span>Hooli</span><span>Stark Ind.</span><span>Wayne Co.</span></div></div>
  <div class="bk-mq__row bk-mq__row--rev"><div class="bk-mq__track"><span>Vandelay</span><span>Soylent</span><span>Wonka</span><span>Cyberdyne</span><span>Tyrell</span><span>Massive</span><span>Oscorp</span><span>Pied Piper</span></div></div>
</section>`,
    css: `.bk-mq{background:#fff;padding:clamp(40px,6vw,72px) 0;overflow:hidden}
.bk-mq__t{text-align:center;margin-bottom:28px;font-size:13px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--bk-mut)}
.bk-mq__row{overflow:hidden;padding:8px 0;-webkit-mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent);mask-image:linear-gradient(90deg,transparent,#000 12%,#000 88%,transparent)}
.bk-mq__track{display:flex;width:max-content;gap:clamp(14px,2vw,26px);animation:bk-marq 34s linear infinite}
.bk-mq__row--rev .bk-mq__track{animation-direction:reverse;animation-duration:42s}
.bk-mq__row:hover .bk-mq__track,.bk-mq__row:focus-within .bk-mq__track{animation-play-state:paused}
.bk-mq__track span{flex:none;padding:16px clamp(24px,3vw,44px);border-radius:999px;background:var(--bk-soft);border:1px solid var(--bk-line);font-size:clamp(16px,1.8vw,21px);font-weight:800;letter-spacing:-.02em;color:#8a95a8;transition:color .3s,background .3s,transform .4s var(--bk-ease),border-color .3s}
.bk-mq__track span:hover{color:var(--bk-a);background:var(--bk-a-l);border-color:var(--bk-a-m);transform:scale(1.08)}
@keyframes bk-marq{to{transform:translateX(-50%)}}
@media (max-width:600px){.bk-mq__track{animation-duration:24s}}`,
    js: `document.querySelectorAll('.bk-mq__track').forEach(function (track) {
  if (track.getAttribute('data-cloned')) return;
  track.setAttribute('data-cloned', '1');
  var kids = [].slice.call(track.children);
  kids.forEach(function (k) { var c = k.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c); });
});`,
  },
  {
    id: 'pro-gallery', category: 'Pro Extras', name: 'Gallery: masonry + filter + lightbox',
    description: 'Masonry photo wall with category filter chips, hover captions and a full-screen lightbox with arrows and keyboard support.',
    specs: ['CSS columns masonry: 4 -> 3 -> 2 -> 1', 'Filter chips with fade (data-cat)', 'Native <dialog> lightbox: arrows, Esc, click outside, swipe-friendly', 'Hover: zoom, dark scrim, caption slides up, zoom icon pops'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-gl" id="gallery">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Portfolio</span><h2>Selected work</h2><p>Click any picture to open it full screen.</p></div>
    <div class="bk-gl__filters bk-rv" style="--i:1"><button class="is-active" type="button" data-f="all">All</button><button type="button" data-f="web">Web</button><button type="button" data-f="brand">Brand</button><button type="button" data-f="photo">Photo</button></div>
    <div class="bk-gl__grid">
      <figure class="bk-gl__it" data-cat="web"><img src="${img('bk-g1', 600, 800)}" alt="Project one" loading="lazy"><figcaption><b>Project one</b><span>Web</span></figcaption><i>${IC.zoom}</i></figure>
      <figure class="bk-gl__it" data-cat="brand"><img src="${img('bk-g2', 600, 420)}" alt="Project two" loading="lazy"><figcaption><b>Project two</b><span>Brand</span></figcaption><i>${IC.zoom}</i></figure>
      <figure class="bk-gl__it" data-cat="photo"><img src="${img('bk-g3', 600, 600)}" alt="Project three" loading="lazy"><figcaption><b>Project three</b><span>Photo</span></figcaption><i>${IC.zoom}</i></figure>
      <figure class="bk-gl__it" data-cat="web"><img src="${img('bk-g4', 600, 720)}" alt="Project four" loading="lazy"><figcaption><b>Project four</b><span>Web</span></figcaption><i>${IC.zoom}</i></figure>
      <figure class="bk-gl__it" data-cat="photo"><img src="${img('bk-g5', 600, 460)}" alt="Project five" loading="lazy"><figcaption><b>Project five</b><span>Photo</span></figcaption><i>${IC.zoom}</i></figure>
      <figure class="bk-gl__it" data-cat="brand"><img src="${img('bk-g6', 600, 780)}" alt="Project six" loading="lazy"><figcaption><b>Project six</b><span>Brand</span></figcaption><i>${IC.zoom}</i></figure>
      <figure class="bk-gl__it" data-cat="web"><img src="${img('bk-g7', 600, 520)}" alt="Project seven" loading="lazy"><figcaption><b>Project seven</b><span>Web</span></figcaption><i>${IC.zoom}</i></figure>
      <figure class="bk-gl__it" data-cat="photo"><img src="${img('bk-g8', 600, 680)}" alt="Project eight" loading="lazy"><figcaption><b>Project eight</b><span>Photo</span></figcaption><i>${IC.zoom}</i></figure>
    </div>
    <dialog class="bk-gl__box" aria-label="Image viewer"><button class="bk-gl__x" type="button" aria-label="Close">&times;</button><button class="bk-gl__nav bk-gl__nav--p" type="button" aria-label="Previous">&lsaquo;</button><img alt=""><p class="bk-gl__cap"></p><button class="bk-gl__nav bk-gl__nav--n" type="button" aria-label="Next">&rsaquo;</button></dialog>
  </div>
</section>`,
    css: `.bk-gl__filters{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-bottom:clamp(24px,3vw,40px)}
.bk-gl__filters button{padding:10px 22px;border-radius:999px;border:1px solid var(--bk-line);background:#fff;color:var(--bk-mut);font-family:inherit;font-size:14px;font-weight:600;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-gl__filters button:hover{transform:translateY(-3px);color:var(--bk-a);border-color:var(--bk-a-m)}
.bk-gl__filters button.is-active{background:var(--bk-a);border-color:var(--bk-a);color:#fff}
.bk-gl__grid{columns:4;column-gap:clamp(10px,1.4vw,18px)}
.bk-gl__it{position:relative;overflow:hidden;margin:0 0 clamp(10px,1.4vw,18px);break-inside:avoid;border-radius:calc(var(--bk-r) - 6px);cursor:zoom-in;background:#0b1220;transition:opacity .45s,transform .5s var(--bk-ease)}
.bk-gl__it.is-off{display:none}
.bk-gl__it.is-fade{opacity:0;transform:scale(.94)}
.bk-gl__it img{width:100%;height:auto;transition:transform 1.1s var(--bk-ease),filter .5s}
.bk-gl__it::after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(6,11,24,.82));opacity:0;transition:opacity .5s}
.bk-gl__it figcaption{position:absolute;z-index:2;left:18px;right:18px;bottom:16px;color:#fff;display:flex;flex-direction:column;transform:translateY(18px);opacity:0;transition:transform .6s var(--bk-ease),opacity .4s}
.bk-gl__it figcaption span{font-size:13px;color:#cbd6ec}
.bk-gl__it i{position:absolute;z-index:2;right:16px;top:16px;display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#fff;color:var(--bk-a);transform:scale(0);transition:transform .5s var(--bk-ease)}
.bk-gl__it:hover img{transform:scale(1.1)}
.bk-gl__it:hover::after,.bk-gl__it:hover figcaption{opacity:1}
.bk-gl__it:hover figcaption{transform:none}
.bk-gl__it:hover i{transform:scale(1)}
@media (hover:none){.bk-gl__it::after,.bk-gl__it figcaption{opacity:1;transform:none}.bk-gl__it i{display:none}}
.bk-gl__box{width:min(94vw,1100px);max-height:92vh;padding:0;border:0;border-radius:var(--bk-r);background:#0b1220;color:#fff;overflow:visible}
.bk-gl__box::backdrop{background:rgba(6,11,24,.86);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.bk-gl__box[open]{animation:bk-gl-pop .45s var(--bk-ease)}
@keyframes bk-gl-pop{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}
.bk-gl__box img{width:100%;max-height:82vh;object-fit:contain;border-radius:var(--bk-r) var(--bk-r) 0 0}
.bk-gl__cap{padding:14px 20px;text-align:center;font-weight:600}
.bk-gl__x,.bk-gl__nav{position:absolute;z-index:3;display:grid;place-items:center;width:46px;height:46px;border:0;border-radius:50%;background:rgba(255,255,255,.92);color:#0b1220;font-size:28px;line-height:1;cursor:pointer;transition:transform .35s var(--bk-ease),background .3s}
.bk-gl__x{right:-8px;top:-8px}
.bk-gl__nav{top:50%;margin-top:-23px}
.bk-gl__nav--p{left:10px}.bk-gl__nav--n{right:10px}
.bk-gl__x:hover,.bk-gl__nav:hover{transform:scale(1.12);background:#fff}
@media (max-width:1100px){.bk-gl__grid{columns:3}}
@media (max-width:760px){.bk-gl__grid{columns:2}}
@media (max-width:460px){.bk-gl__grid{columns:1}}`,
    js: `document.querySelectorAll('.bk-gl').forEach(function (root) {
  var items = [].slice.call(root.querySelectorAll('.bk-gl__it'));
  var box = root.querySelector('.bk-gl__box');
  var big = box.querySelector('img');
  var cap = box.querySelector('.bk-gl__cap');
  var cur = 0;
  root.querySelectorAll('.bk-gl__filters button').forEach(function (b) {
    b.addEventListener('click', function () {
      root.querySelectorAll('.bk-gl__filters button').forEach(function (x) { x.classList.toggle('is-active', x === b); });
      var f = b.getAttribute('data-f');
      items.forEach(function (it) {
        var show = f === 'all' || it.getAttribute('data-cat') === f;
        if (show) { it.classList.remove('is-off'); requestAnimationFrame(function () { it.classList.remove('is-fade'); }); }
        else { it.classList.add('is-fade'); setTimeout(function () { it.classList.add('is-off'); }, 300); }
      });
    });
  });
  function visible() { return items.filter(function (it) { return !it.classList.contains('is-off'); }); }
  function show(i) {
    var list = visible();
    if (!list.length) return;
    cur = (i + list.length) % list.length;
    var im = list[cur].querySelector('img');
    big.src = im.src; big.alt = im.alt;
    cap.textContent = list[cur].querySelector('figcaption b').textContent;
  }
  items.forEach(function (it) {
    it.tabIndex = 0;
    function open() { show(visible().indexOf(it)); if (box.showModal) box.showModal(); else box.setAttribute('open', ''); }
    it.addEventListener('click', open);
    it.addEventListener('keydown', function (e) { if (e.key === 'Enter') open(); });
  });
  box.querySelector('.bk-gl__x').addEventListener('click', function () { box.close(); });
  box.querySelector('.bk-gl__nav--p').addEventListener('click', function () { show(cur - 1); });
  box.querySelector('.bk-gl__nav--n').addEventListener('click', function () { show(cur + 1); });
  box.addEventListener('click', function (e) { if (e.target === box) box.close(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
});`,
  },
  {
    id: 'pro-reviews', category: 'Pro Sections', name: 'Testimonials: snap carousel (drag)',
    description: 'Horizontal scroll-snap review cards. Drag with the mouse, swipe on phones, use arrows, and watch the progress bar.',
    specs: ['CSS scroll-snap (no library), 3 / 2 / 1 cards visible', 'Mouse drag-to-scroll + touch swipe + arrow buttons', 'Progress bar follows scroll position', 'Hover: card lifts, quote mark rotates, stars pop in sequence'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-rw" id="reviews">
  <div class="bk-pw">
    <div class="bk-rw__top bk-rv"><div><span class="bk-pey">Testimonials</span><h2>Loved by clients</h2></div><div class="bk-rw__btns"><button class="bk-rw__prev" type="button" aria-label="Previous">&larr;</button><button class="bk-rw__next" type="button" aria-label="Next">&rarr;</button></div></div>
  </div>
  <div class="bk-rw__track" tabindex="0" aria-label="Client reviews">
    <article class="bk-rw__card"><span class="bk-rw__q" aria-hidden="true">&ldquo;</span><div class="bk-rw__stars" aria-label="5 stars">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><p>They understood our idea faster than we could explain it. The result looks great and works even better.</p><footer><img src="${img('bk-r1', 96, 96)}" alt="" loading="lazy"><div><b>Priya Sharma</b><span>Founder, Lumen</span></div></footer></article>
    <article class="bk-rw__card"><span class="bk-rw__q" aria-hidden="true">&ldquo;</span><div class="bk-rw__stars" aria-label="5 stars">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><p>On time, on budget and genuinely pleasant to work with. Our customers keep complimenting the new site.</p><footer><img src="${img('bk-r2', 96, 96)}" alt="" loading="lazy"><div><b>Rahul Verma</b><span>CEO, Northline</span></div></footer></article>
    <article class="bk-rw__card"><span class="bk-rw__q" aria-hidden="true">&ldquo;</span><div class="bk-rw__stars" aria-label="5 stars">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><p>Clear communication every week and zero surprises. I would hire this team again without thinking twice.</p><footer><img src="${img('bk-r3', 96, 96)}" alt="" loading="lazy"><div><b>Anita Das</b><span>Director, Verde</span></div></footer></article>
    <article class="bk-rw__card"><span class="bk-rw__q" aria-hidden="true">&ldquo;</span><div class="bk-rw__stars" aria-label="5 stars">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><p>Our sign-ups doubled in two months after the redesign. Beautiful work backed by real numbers.</p><footer><img src="${img('bk-r4', 96, 96)}" alt="" loading="lazy"><div><b>Sanjay Kumar</b><span>Marketing, Orbit</span></div></footer></article>
    <article class="bk-rw__card"><span class="bk-rw__q" aria-hidden="true">&ldquo;</span><div class="bk-rw__stars" aria-label="5 stars">${IC.star}${IC.star}${IC.star}${IC.star}${IC.star}</div><p>Professional, creative and always one step ahead. They treated our product like it was their own.</p><footer><img src="${img('bk-r5', 96, 96)}" alt="" loading="lazy"><div><b>Neha Joshi</b><span>COO, Bright</span></div></footer></article>
  </div>
  <div class="bk-pw"><div class="bk-rw__bar" aria-hidden="true"><i></i></div></div>
</section>`,
    css: `.bk-rw{background:var(--bk-soft);padding:clamp(64px,9vw,120px) 0;overflow:hidden}
.bk-rw__top{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:clamp(28px,4vw,48px)}
.bk-rw__top h2{font-size:clamp(30px,4.4vw,52px);margin-top:16px}
.bk-rw__btns{display:flex;gap:10px}
.bk-rw__btns button{display:grid;place-items:center;width:52px;height:52px;border-radius:50%;border:1px solid var(--bk-line);background:#fff;color:var(--bk-ink);font-size:20px;cursor:pointer;transition:background .3s,color .3s,transform .4s var(--bk-ease),border-color .3s}
.bk-rw__btns button:hover{background:var(--bk-a);border-color:var(--bk-a);color:#fff;transform:scale(1.08)}
.bk-rw__btns button:active{transform:scale(.94)}
.bk-rw__track{display:flex;gap:clamp(14px,2vw,26px);overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding:0 clamp(18px,4vw,40px);padding:10px max(clamp(18px,4vw,40px),calc((100vw - 1240px) / 2 + clamp(18px,4vw,40px))) 30px;scrollbar-width:none;cursor:grab;outline:0}
.bk-rw__track::-webkit-scrollbar{display:none}
.bk-rw__track.is-drag{cursor:grabbing;scroll-snap-type:none;user-select:none}
.bk-rw__card{position:relative;flex:0 0 calc((100% - 2 * clamp(14px,2vw,26px)) / 3 - 40px);min-width:300px;scroll-snap-align:start;display:flex;flex-direction:column;gap:18px;padding:clamp(24px,2.6vw,34px);border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t) var(--bk-ease)}
.bk-rw__card:hover{transform:translateY(var(--bk-lift));box-shadow:0 34px 60px -28px rgba(11,18,32,.45)}
.bk-rw__q{position:absolute;right:26px;top:6px;font-family:Georgia,serif;font-size:96px;line-height:1;color:var(--bk-a-m);transition:transform .7s var(--bk-ease),color .4s}
.bk-rw__card:hover .bk-rw__q{transform:rotate(-12deg) scale(1.15);color:var(--bk-a)}
.bk-rw__stars{display:flex;gap:3px;color:#f5a524}
.bk-rw__stars svg{transition:transform .4s var(--bk-ease)}
.bk-rw__card:hover .bk-rw__stars svg{transform:scale(1.25) rotate(-8deg)}
.bk-rw__card:hover .bk-rw__stars svg:nth-child(2){transition-delay:.05s}.bk-rw__card:hover .bk-rw__stars svg:nth-child(3){transition-delay:.1s}.bk-rw__card:hover .bk-rw__stars svg:nth-child(4){transition-delay:.15s}.bk-rw__card:hover .bk-rw__stars svg:nth-child(5){transition-delay:.2s}
.bk-rw__card p{flex:1;font-size:17px;line-height:1.7;color:#334155}
.bk-rw__card footer{display:flex;align-items:center;gap:14px;padding-top:18px;border-top:1px solid var(--bk-line)}
.bk-rw__card footer img{width:50px;height:50px;border-radius:50%;object-fit:cover;border:2px solid var(--bk-a-m)}
.bk-rw__card footer b{display:block}
.bk-rw__card footer span{font-size:14px;color:var(--bk-mut)}
.bk-rw__bar{height:4px;margin-top:8px;border-radius:4px;background:var(--bk-line);overflow:hidden}
.bk-rw__bar i{display:block;height:100%;width:30%;border-radius:4px;background:var(--bk-a);transition:width .2s,margin-left .2s}
@media (max-width:1000px){.bk-rw__card{flex-basis:calc(50% - 30px)}}
@media (max-width:640px){.bk-rw__card{flex-basis:86%;min-width:0}.bk-rw__btns button{width:46px;height:46px}}`,
    js: `document.querySelectorAll('.bk-rw').forEach(function (root) {
  var track = root.querySelector('.bk-rw__track');
  var bar = root.querySelector('.bk-rw__bar i');
  function step() { var c = track.querySelector('.bk-rw__card'); return c ? c.offsetWidth + 20 : 320; }
  root.querySelector('.bk-rw__prev').addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
  root.querySelector('.bk-rw__next').addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  function progress() {
    var max = track.scrollWidth - track.clientWidth;
    var vis = track.clientWidth / track.scrollWidth;
    var p = max > 0 ? track.scrollLeft / max : 0;
    bar.style.width = Math.max(12, vis * 100) + '%';
    bar.style.marginLeft = (p * (100 - Math.max(12, vis * 100))) + '%';
  }
  track.addEventListener('scroll', progress, { passive: true });
  window.addEventListener('resize', progress);
  progress();
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') track.scrollBy({ left: step(), behavior: 'smooth' });
    if (e.key === 'ArrowLeft') track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  var down = false, sx = 0, sl = 0;
  track.addEventListener('pointerdown', function (e) {
    if (e.pointerType !== 'mouse') return;
    down = true; sx = e.clientX; sl = track.scrollLeft;
  });
  window.addEventListener('pointermove', function (e) {
    if (!down) return;
    track.classList.add('is-drag');
    track.scrollLeft = sl - (e.clientX - sx);
  });
  window.addEventListener('pointerup', function () {
    if (!down) return;
    down = false; track.classList.remove('is-drag');
  });
});`,
  },
  {
    id: 'pro-pricing', category: 'Pro Sections', name: 'Pricing: monthly / yearly switch',
    description: 'Three plans with a smooth billing toggle that counts prices up/down. The featured plan has an animated gradient border.',
    specs: ['Toggle updates prices from data-m / data-y with a number tween', 'Animated gradient border on the popular plan', 'Feature rows with check icons, hover lift', 'role="switch" with aria-checked', '3 columns -> 1 under 960px (popular plan first)'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-pr" id="pricing">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Pricing</span><h2>Simple, fair pricing</h2><p>Switch to yearly and save 20 percent.</p>
      <div class="bk-pr__sw"><span class="is-on" data-side="m">Monthly</span><button type="button" role="switch" aria-checked="false" aria-label="Bill yearly"><i></i></button><span data-side="y">Yearly <em>-20%</em></span></div>
    </div>
    <div class="bk-pr__grid">
      <article class="bk-pr__card bk-rv" style="--i:0"><h3>Starter</h3><p class="bk-pr__d">For individuals and small ideas.</p><div class="bk-pr__price"><sup>$</sup><b data-m="19" data-y="15">19</b><span>/ month</span></div><ul><li>${IC.check}1 project</li><li>${IC.check}Basic analytics</li><li>${IC.check}Email support</li></ul><a class="bk-pbtn bk-pbtn--ghost" href="#contact">Choose Starter</a></article>
      <article class="bk-pr__card bk-pr__card--hot bk-rv" style="--i:1"><span class="bk-pr__ribbon">Most popular</span><h3>Business</h3><p class="bk-pr__d">For growing teams that need more.</p><div class="bk-pr__price"><sup>$</sup><b data-m="49" data-y="39">49</b><span>/ month</span></div><ul><li>${IC.check}Unlimited projects</li><li>${IC.check}Advanced analytics</li><li>${IC.check}Priority support</li><li>${IC.check}Team roles</li></ul><a class="bk-pbtn" href="#contact">Choose Business ${AR}</a></article>
      <article class="bk-pr__card bk-rv" style="--i:2"><h3>Enterprise</h3><p class="bk-pr__d">Security and scale for large orgs.</p><div class="bk-pr__price"><sup>$</sup><b data-m="129" data-y="99">129</b><span>/ month</span></div><ul><li>${IC.check}Everything in Business</li><li>${IC.check}Single sign-on</li><li>${IC.check}Dedicated manager</li></ul><a class="bk-pbtn bk-pbtn--ghost" href="#contact">Contact sales</a></article>
    </div>
  </div>
</section>`,
    css: `.bk-pr{background:#fff}
.bk-pr__sw{display:inline-flex;align-items:center;gap:14px;margin-top:26px;font-weight:600;color:var(--bk-mut)}
.bk-pr__sw span{transition:color .3s}
.bk-pr__sw span.is-on{color:var(--bk-ink)}
.bk-pr__sw em{font-style:normal;margin-left:6px;padding:3px 9px;border-radius:999px;background:var(--bk-a-l);color:var(--bk-a-d);font-size:12px}
.bk-pr__sw button{position:relative;width:58px;height:32px;padding:0;border:0;border-radius:999px;background:var(--bk-line);cursor:pointer;transition:background .35s}
.bk-pr__sw button i{position:absolute;left:4px;top:4px;width:24px;height:24px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(11,18,32,.3);transition:transform .45s var(--bk-ease)}
.bk-pr__sw button[aria-checked=true]{background:var(--bk-a)}
.bk-pr__sw button[aria-checked=true] i{transform:translateX(26px)}
.bk-pr__sw button:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:3px}
.bk-pr__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(16px,2vw,28px);align-items:stretch}
.bk-pr__card{position:relative;display:flex;flex-direction:column;gap:18px;padding:clamp(26px,3vw,40px);border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t) var(--bk-ease)}
.bk-pr__card:hover{transform:translateY(var(--bk-lift));box-shadow:0 36px 60px -28px rgba(11,18,32,.45)}
.bk-pr__card h3{font-size:24px}
.bk-pr__d{color:var(--bk-mut);margin-top:-8px}
.bk-pr__price{display:flex;align-items:flex-end;gap:4px;padding:6px 0 4px}
.bk-pr__price sup{align-self:flex-start;margin-top:12px;font-size:22px;font-weight:700}
.bk-pr__price b{font-size:clamp(48px,5vw,64px);line-height:1;letter-spacing:-.04em;font-variant-numeric:tabular-nums}
.bk-pr__price span{margin-bottom:8px;color:var(--bk-mut)}
.bk-pr__card ul{flex:1;list-style:none;margin:0;padding:22px 0 0;border-top:1px solid var(--bk-line);display:grid;gap:13px;align-content:start}
.bk-pr__card li{display:flex;align-items:center;gap:12px;transition:transform .35s var(--bk-ease)}
.bk-pr__card li:hover{transform:translateX(6px)}
.bk-pr__card li svg{flex:none;width:22px;height:22px;padding:4px;border-radius:50%;background:var(--bk-a-l);color:var(--bk-a)}
.bk-pr__card .bk-pbtn{width:100%}
.bk-pr__card--hot{color:#fff;border:2px solid transparent;background:linear-gradient(160deg,#0b1220,color-mix(in srgb,var(--bk-a) 30%,#0b1220)) padding-box,linear-gradient(120deg,var(--bk-a),var(--bk-a2),var(--bk-a-m),var(--bk-a)) border-box;background-size:auto,300% 300%;animation:bk-pr-glow 6s linear infinite;box-shadow:0 40px 70px -30px var(--bk-a)}
@keyframes bk-pr-glow{0%{background-position:0 0,0 50%}100%{background-position:0 0,300% 50%}}
.bk-pr__card--hot .bk-pr__d,.bk-pr__card--hot .bk-pr__price span{color:#b8c4dc}
.bk-pr__card--hot ul{border-color:rgba(255,255,255,.14)}
.bk-pr__card--hot li svg{background:rgba(255,255,255,.14);color:#fff}
.bk-pr__ribbon{position:absolute;right:22px;top:-14px;padding:6px 16px;border-radius:999px;background:linear-gradient(90deg,var(--bk-a),var(--bk-a2));color:#fff;font-size:12.5px;font-weight:700;box-shadow:0 8px 18px -8px var(--bk-a)}
@media (min-width:961px){.bk-pr__card--hot{transform:scale(1.04)}.bk-pr__card--hot:hover{transform:scale(1.04) translateY(var(--bk-lift))}}
@media (max-width:960px){.bk-pr__grid{grid-template-columns:1fr;max-width:520px;margin:0 auto}.bk-pr__card--hot{order:-1}}`,
    js: `document.querySelectorAll('.bk-pr').forEach(function (root) {
  var sw = root.querySelector('.bk-pr__sw button');
  var labels = root.querySelectorAll('.bk-pr__sw span');
  var nums = [].slice.call(root.querySelectorAll('.bk-pr__price b'));
  var yearly = false;
  function tween(el, to) {
    var from = parseFloat(el.textContent) || 0, t0 = null;
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / 600, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * e);
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  function apply() {
    sw.setAttribute('aria-checked', yearly ? 'true' : 'false');
    labels.forEach(function (l) { l.classList.toggle('is-on', (l.getAttribute('data-side') === 'y') === yearly); });
    nums.forEach(function (n) { tween(n, parseFloat(n.getAttribute(yearly ? 'data-y' : 'data-m'))); });
  }
  sw.addEventListener('click', function () { yearly = !yearly; apply(); });
});`,
  },
  {
    id: 'pro-faq', category: 'Pro Sections', name: 'FAQ: smooth accordion + help card',
    description: 'Sticky intro with a help card on the left, silky accordion on the right (height animates, plus icon rotates).',
    specs: ['Real <button> triggers with aria-expanded', 'Height animates with the grid-rows 0fr -> 1fr trick (no fixed heights)', 'One open at a time (change data-multi="1" on the list to allow many)', 'Two columns -> one under 900px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-qa" id="faq">
  <div class="bk-pw bk-qa__in">
    <div class="bk-qa__side bk-rv bk-rv--l">
      <span class="bk-pey">FAQ</span>
      <h2>Questions? We have answers.</h2>
      <p>Cannot find what you need? Our team replies within a few hours.</p>
      <div class="bk-qa__help"><b>Still curious?</b><span>Talk to a real person.</span><a class="bk-pbtn" href="#contact">Contact us ${AR}</a></div>
    </div>
    <div class="bk-qa__list bk-rv" style="--i:1" data-multi="0">
      <div class="bk-qa__it is-open"><button class="bk-qa__q" type="button" aria-expanded="true">How long does a typical project take?<i aria-hidden="true"></i></button><div class="bk-qa__a"><div><p>Most websites take 4 to 8 weeks from kick-off to launch, depending on size and how fast feedback arrives.</p></div></div></div>
      <div class="bk-qa__it"><button class="bk-qa__q" type="button" aria-expanded="false">Do you work with small budgets?<i aria-hidden="true"></i></button><div class="bk-qa__a"><div><p>Yes. We offer fixed-price starter packages and can phase the work so you invest step by step.</p></div></div></div>
      <div class="bk-qa__it"><button class="bk-qa__q" type="button" aria-expanded="false">Will my site work on phones and tablets?<i aria-hidden="true"></i></button><div class="bk-qa__a"><div><p>Every page is designed mobile-first and tested on real devices from small phones to wide desktop screens.</p></div></div></div>
      <div class="bk-qa__it"><button class="bk-qa__q" type="button" aria-expanded="false">Do you offer support after launch?<i aria-hidden="true"></i></button><div class="bk-qa__a"><div><p>Of course. Every project includes 30 days of free support, and monthly care plans are available.</p></div></div></div>
    </div>
  </div>
</section>`,
    css: `.bk-qa{background:var(--bk-soft)}
.bk-qa__in{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(32px,6vw,90px);align-items:start}
.bk-qa__side{position:sticky;top:110px}
.bk-qa__side h2{font-size:clamp(30px,4vw,48px);margin:18px 0 14px}
.bk-qa__side>p{color:var(--bk-mut);font-size:17px;margin-bottom:28px}
.bk-qa__help{display:grid;gap:6px;justify-items:start;padding:26px;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh)}
.bk-qa__help span{color:var(--bk-mut);margin-bottom:12px}
.bk-qa__list{display:grid;gap:14px}
.bk-qa__it{border-radius:calc(var(--bk-r) - 4px);background:#fff;border:1px solid var(--bk-line);transition:border-color .3s,box-shadow .4s,transform .4s var(--bk-ease)}
.bk-qa__it:hover{transform:translateX(4px);border-color:var(--bk-a-m)}
.bk-qa__it.is-open{border-color:var(--bk-a);box-shadow:0 18px 36px -20px var(--bk-a)}
.bk-qa__q{display:flex;align-items:center;justify-content:space-between;gap:18px;width:100%;padding:22px 24px;border:0;background:transparent;color:var(--bk-ink);font-family:inherit;font-size:clamp(16px,1.6vw,18px);font-weight:600;text-align:left;cursor:pointer}
.bk-qa__q:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:-3px;border-radius:calc(var(--bk-r) - 4px)}
.bk-qa__q i{position:relative;flex:none;width:34px;height:34px;border-radius:50%;background:var(--bk-a-l);transition:background .3s,transform .5s var(--bk-ease)}
.bk-qa__q i::before,.bk-qa__q i::after{content:"";position:absolute;left:50%;top:50%;width:14px;height:2px;margin:-1px 0 0 -7px;border-radius:2px;background:var(--bk-a);transition:transform .5s var(--bk-ease),background .3s}
.bk-qa__q i::after{transform:rotate(90deg)}
.bk-qa__it.is-open .bk-qa__q i{background:var(--bk-a);transform:rotate(180deg)}
.bk-qa__it.is-open .bk-qa__q i::before,.bk-qa__it.is-open .bk-qa__q i::after{background:#fff}
.bk-qa__it.is-open .bk-qa__q i::after{transform:rotate(0)}
.bk-qa__a{display:grid;grid-template-rows:0fr;transition:grid-template-rows .55s var(--bk-ease)}
.bk-qa__a>div{overflow:hidden}
.bk-qa__a p{padding:0 24px 24px;color:var(--bk-mut);line-height:1.75;opacity:0;transform:translateY(-6px);transition:opacity .4s,transform .5s var(--bk-ease)}
.bk-qa__it.is-open .bk-qa__a{grid-template-rows:1fr}
.bk-qa__it.is-open .bk-qa__a p{opacity:1;transform:none;transition-delay:.12s}
@media (max-width:900px){.bk-qa__in{grid-template-columns:1fr}.bk-qa__side{position:static}}`,
    js: `document.querySelectorAll('.bk-qa__list').forEach(function (list) {
  var multi = list.getAttribute('data-multi') === '1';
  var items = [].slice.call(list.querySelectorAll('.bk-qa__it'));
  items.forEach(function (it) {
    var q = it.querySelector('.bk-qa__q');
    q.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      if (!multi) items.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('.bk-qa__q').setAttribute('aria-expanded', 'false'); });
      it.classList.toggle('is-open', open);
      q.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
});`,
  },
  {
    id: 'pro-compare', category: 'Pro Extras', name: 'Before / after image slider',
    description: 'Drag a handle to compare two photos. Great for clinics, salons, renovations and photo editing. Works with mouse, touch and keyboard.',
    specs: ['Native range input drives it, so touch + keyboard work for free', 'clip-path reveal, handle grows on hover/drag', 'Labels fade as you slide, fully responsive 16:10 ratio', 'Replace the two image URLs with your before and after photos'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-cp" id="results">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Real results</span><h2>See the difference</h2><p>Drag the handle left and right.</p></div>
    <div class="bk-cp__box bk-rv bk-rv--z" style="--i:1">
      <img class="bk-cp__after" src="${img('bk-cmp', 1200, 750)}" alt="After" loading="lazy">
      <img class="bk-cp__before" src="${img('bk-cmp', 1200, 750)}?grayscale&blur=2" alt="Before" loading="lazy">
      <span class="bk-cp__lb bk-cp__lb--b">Before</span><span class="bk-cp__lb bk-cp__lb--a">After</span>
      <div class="bk-cp__bar" aria-hidden="true"><span><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg></span></div>
      <input class="bk-cp__rng" type="range" min="0" max="100" value="50" aria-label="Compare before and after">
    </div>
  </div>
</section>`,
    css: `.bk-cp{background:#fff}
.bk-cp__box{--pos:50%;position:relative;overflow:hidden;max-width:980px;margin:0 auto;aspect-ratio:16/10;border-radius:calc(var(--bk-r) + 4px);box-shadow:0 40px 80px -34px rgba(11,18,32,.55);user-select:none;background:#0b1220}
.bk-cp__box img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bk-cp__before{clip-path:inset(0 calc(100% - var(--pos)) 0 0)}
.bk-cp__bar{position:absolute;top:0;bottom:0;left:var(--pos);width:3px;margin-left:-1.5px;background:#fff;box-shadow:0 0 18px rgba(0,0,0,.4);pointer-events:none}
.bk-cp__bar span{position:absolute;left:50%;top:50%;display:grid;place-items:center;width:52px;height:52px;margin:-26px 0 0 -26px;border-radius:50%;background:#fff;color:var(--bk-a);box-shadow:0 10px 24px rgba(0,0,0,.35);transition:transform .45s var(--bk-ease)}
.bk-cp__box:hover .bk-cp__bar span,.bk-cp__box:focus-within .bk-cp__bar span{transform:scale(1.18)}
.bk-cp__lb{position:absolute;top:18px;padding:7px 16px;border-radius:999px;background:rgba(11,18,32,.6);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;pointer-events:none;transition:opacity .3s}
.bk-cp__lb--b{left:18px}.bk-cp__lb--a{right:18px}
.bk-cp__rng{position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;cursor:ew-resize;-webkit-appearance:none;appearance:none;touch-action:pan-y}
.bk-cp__rng::-webkit-slider-thumb{-webkit-appearance:none;width:60px;height:100vh}
.bk-cp__rng::-moz-range-thumb{width:60px;height:100vh;border:0}
.bk-cp__box:focus-within{outline:3px solid var(--bk-a-m);outline-offset:4px}
@media (max-width:560px){.bk-cp__box{aspect-ratio:4/3}.bk-cp__bar span{width:44px;height:44px;margin:-22px 0 0 -22px}}`,
    js: `document.querySelectorAll('.bk-cp__box').forEach(function (box) {
  var rng = box.querySelector('.bk-cp__rng');
  var lb = box.querySelector('.bk-cp__lb--b');
  var la = box.querySelector('.bk-cp__lb--a');
  function set() {
    var v = +rng.value;
    box.style.setProperty('--pos', v + '%');
    lb.style.opacity = v < 14 ? '0' : '1';
    la.style.opacity = v > 86 ? '0' : '1';
  }
  rng.addEventListener('input', set);
  set();
});`,
  },
  {
    id: 'pro-contact', category: 'Pro Forms', name: 'Contact: floating labels + info panel',
    description: 'Split card: dark info panel with hover icons on the left, floating-label form on the right with live validation and an animated success tick.',
    specs: ['Floating labels with pure CSS (:placeholder-shown)', 'Inline validation on blur and submit, aria-invalid, aria-live status', 'Animated success state (SVG tick draws itself)', 'Info rows slide + icons pop on hover', 'Split -> stacked under 900px, 2-col fields -> 1 under 520px', 'No backend: replace the marked line with fetch() to your server'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-cf" id="contact">
  <div class="bk-pw">
    <div class="bk-cf__card bk-rv bk-rv--z">
      <aside class="bk-cf__info">
        <h2>Let us talk</h2>
        <p>Tell us about your project. We usually reply within one working day.</p>
        <ul>
          <li><span>${IC.phone}</span><div><b>Call us</b><a href="#">+91 00000 00000</a></div></li>
          <li><span>${IC.mail}</span><div><b>Email</b><a href="#">hello@example.com</a></div></li>
          <li><span>${IC.pin}</span><div><b>Visit</b><a href="#">Street, City, Country</a></div></li>
          <li><span>${IC.clock}</span><div><b>Hours</b><a href="#">Mon - Sat, 9 AM - 6 PM</a></div></li>
        </ul>
      </aside>
      <form class="bk-cf__form" novalidate>
        <div class="bk-cf__row">
          <div class="bk-cf__f"><input id="bk-cf-name" type="text" placeholder=" " required autocomplete="name"><label for="bk-cf-name">Full name</label></div>
          <div class="bk-cf__f"><input id="bk-cf-mail" type="email" placeholder=" " required autocomplete="email"><label for="bk-cf-mail">Email address</label></div>
        </div>
        <div class="bk-cf__f"><input id="bk-cf-sub" type="text" placeholder=" " required><label for="bk-cf-sub">Subject</label></div>
        <div class="bk-cf__f"><textarea id="bk-cf-msg" rows="5" placeholder=" " required minlength="10"></textarea><label for="bk-cf-msg">Your message</label></div>
        <button class="bk-pbtn" type="submit">Send message ${AR}</button>
        <p class="bk-cf__msg" role="status" aria-live="polite"></p>
        <div class="bk-cf__ok" aria-hidden="true"><svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24"/><path d="M14 27l8 8 16-17"/></svg><h3>Message sent</h3><p>Thank you! We will be in touch very soon.</p></div>
      </form>
    </div>
  </div>
</section>`,
    css: `.bk-cf{background:var(--bk-soft)}
.bk-cf__card{display:grid;grid-template-columns:.85fr 1.15fr;overflow:hidden;border-radius:calc(var(--bk-r) + 8px);background:#fff;box-shadow:0 40px 80px -36px rgba(11,18,32,.5)}
.bk-cf__info{position:relative;overflow:hidden;padding:clamp(28px,4vw,52px);background:linear-gradient(155deg,#0b1220,color-mix(in srgb,var(--bk-a) 40%,#0b1220));color:#fff}
.bk-cf__info::after{content:"";position:absolute;right:-90px;bottom:-90px;width:280px;height:280px;border-radius:50%;background:radial-gradient(circle,var(--bk-a) 0,transparent 70%);opacity:.5;animation:bk-bob 7s ease-in-out infinite}
.bk-cf__info h2{font-size:clamp(28px,3.4vw,40px);margin-bottom:12px}
.bk-cf__info>p{color:#b8c4dc;margin-bottom:34px}
.bk-cf__info ul{position:relative;z-index:1;list-style:none;margin:0;padding:0;display:grid;gap:22px}
.bk-cf__info li{display:flex;align-items:center;gap:16px;transition:transform .45s var(--bk-ease)}
.bk-cf__info li:hover{transform:translateX(10px)}
.bk-cf__info li span{display:grid;place-items:center;flex:none;width:50px;height:50px;border-radius:16px;background:rgba(255,255,255,.1);transition:background .3s,transform .5s var(--bk-ease)}
.bk-cf__info li:hover span{background:var(--bk-a);transform:rotate(-8deg) scale(1.1)}
.bk-cf__info b{display:block;font-size:13px;letter-spacing:.08em;text-transform:uppercase;color:#93a4c4}
.bk-cf__info a{color:#fff;text-decoration:none}
.bk-cf__form{position:relative;display:grid;gap:18px;align-content:start;padding:clamp(28px,4vw,52px)}
.bk-cf__row{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.bk-cf__f{position:relative}
.bk-cf__f input,.bk-cf__f textarea{width:100%;padding:24px 16px 10px;border:1.5px solid var(--bk-line);border-radius:14px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:16px;line-height:1.4;resize:vertical;transition:border-color .3s,box-shadow .3s}
.bk-cf__f input:hover,.bk-cf__f textarea:hover{border-color:var(--bk-a-m)}
.bk-cf__f input:focus,.bk-cf__f textarea:focus{outline:0;border-color:var(--bk-a);box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-cf__f label{position:absolute;left:17px;top:17px;color:var(--bk-mut);font-size:16px;pointer-events:none;transform-origin:left top;transition:transform .35s var(--bk-ease),color .3s}
.bk-cf__f input:focus+label,.bk-cf__f input:not(:placeholder-shown)+label,.bk-cf__f textarea:focus+label,.bk-cf__f textarea:not(:placeholder-shown)+label{transform:translateY(-11px) scale(.76);color:var(--bk-a)}
.bk-cf__f.is-bad input,.bk-cf__f.is-bad textarea{border-color:#dc2626;box-shadow:0 0 0 4px rgba(220,38,38,.1)}
.bk-cf__f.is-bad label{color:#dc2626}
.bk-cf__f.is-bad{animation:bk-cf-shake .4s}
@keyframes bk-cf-shake{25%{transform:translateX(-5px)}75%{transform:translateX(5px)}}
.bk-cf__form .bk-pbtn{justify-self:start}
.bk-cf__msg{min-height:1.3em;font-weight:600;font-size:14px;color:#dc2626}
.bk-cf__ok{position:absolute;inset:0;display:grid;place-content:center;justify-items:center;gap:10px;padding:30px;text-align:center;background:#fff;opacity:0;visibility:hidden;transition:opacity .4s,visibility .4s}
.bk-cf__ok svg{width:96px;height:96px;fill:none;stroke-width:3;stroke-linecap:round;stroke-linejoin:round}
.bk-cf__ok circle{stroke:var(--bk-a-m);stroke-dasharray:151;stroke-dashoffset:151}
.bk-cf__ok path{stroke:var(--bk-a);stroke-dasharray:50;stroke-dashoffset:50}
.bk-cf__ok h3{font-size:26px}
.bk-cf__ok p{color:var(--bk-mut)}
.bk-cf__form.is-sent .bk-cf__ok{opacity:1;visibility:visible}
.bk-cf__form.is-sent .bk-cf__ok circle{animation:bk-cf-draw .8s .1s forwards}
.bk-cf__form.is-sent .bk-cf__ok path{animation:bk-cf-draw .5s .7s forwards}
@keyframes bk-cf-draw{to{stroke-dashoffset:0}}
@media (max-width:900px){.bk-cf__card{grid-template-columns:1fr}}
@media (max-width:520px){.bk-cf__row{grid-template-columns:1fr}.bk-cf__form .bk-pbtn{justify-self:stretch}}`,
    js: `document.querySelectorAll('.bk-cf__form').forEach(function (form) {
  var msg = form.querySelector('.bk-cf__msg');
  var fields = [].slice.call(form.querySelectorAll('input,textarea'));
  function check(f) {
    var bad = !f.checkValidity();
    f.parentNode.classList.toggle('is-bad', bad);
    f.setAttribute('aria-invalid', bad ? 'true' : 'false');
    return !bad;
  }
  fields.forEach(function (f) {
    f.addEventListener('blur', function () { if (f.value) check(f); });
    f.addEventListener('input', function () { if (f.parentNode.classList.contains('is-bad')) check(f); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    fields.forEach(function (f) { if (!check(f)) ok = false; });
    msg.textContent = ok ? '' : 'Please fix the highlighted fields.';
    if (!ok) return;
    // To really send the message, replace this comment with a fetch() POST to your server or form service.
    form.classList.add('is-sent');
    setTimeout(function () { form.classList.remove('is-sent'); form.reset(); }, 5000);
  });
});`,
  },
  {
    id: 'pro-cta-magnetic', category: 'Pro Sections', name: 'CTA: gradient card + magnetic button',
    description: 'Big rounded call-to-action with a moving mesh gradient. The button gently follows your cursor like a magnet.',
    specs: ['Animated mesh gradient (background-position loop)', 'Magnetic button (JS, hover devices only, strength 0.3)', 'Dot pattern overlay, floating shapes', 'Buttons stack full width on phones'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ct" id="cta">
  <div class="bk-pw">
    <div class="bk-ct__card bk-rv bk-rv--z">
      <i class="bk-ct__s bk-ct__s--1" aria-hidden="true"></i><i class="bk-ct__s bk-ct__s--2" aria-hidden="true"></i>
      <h2>Ready to build something remarkable?</h2>
      <p>Book a free 30 minute call. No pressure, just honest advice.</p>
      <div class="bk-ct__btns"><a class="bk-pbtn bk-pbtn--light bk-ct__mag" href="#contact">Book a free call ${AR}</a><a class="bk-pbtn bk-pbtn--outline-light" href="#pricing">View pricing</a></div>
    </div>
  </div>
</section>`,
    css: `.bk-ct{padding:clamp(40px,6vw,88px) 0;background:#fff}
.bk-ct__card{position:relative;overflow:hidden;text-align:center;padding:clamp(44px,7vw,100px) clamp(22px,5vw,72px);border-radius:calc(var(--bk-r) + 14px);color:#fff;background:linear-gradient(125deg,var(--bk-a),var(--bk-a-d),var(--bk-a2),var(--bk-a));background-size:300% 300%;animation:bk-ct-mesh 14s ease infinite}
@keyframes bk-ct-mesh{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}
.bk-ct__card::before{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(255,255,255,.18) 1.4px,transparent 1.6px);background-size:26px 26px;-webkit-mask-image:radial-gradient(ellipse at center,#000 20%,transparent 75%);mask-image:radial-gradient(ellipse at center,#000 20%,transparent 75%)}
.bk-ct__s{position:absolute;border-radius:50%;background:rgba(255,255,255,.12);animation:bk-bob 8s ease-in-out infinite}
.bk-ct__s--1{width:220px;height:220px;left:-60px;top:-70px}
.bk-ct__s--2{width:160px;height:160px;right:-30px;bottom:-50px;animation-delay:-3s}
.bk-ct__card h2{position:relative;max-width:760px;margin:0 auto 16px;font-size:clamp(30px,5vw,58px)}
.bk-ct__card p{position:relative;max-width:520px;margin:0 auto 34px;font-size:clamp(16px,1.7vw,19px);color:rgba(255,255,255,.88)}
.bk-ct__btns{position:relative;display:flex;flex-wrap:wrap;justify-content:center;gap:14px}
.bk-ct__mag{will-change:transform}
@media (max-width:520px){.bk-ct__btns .bk-pbtn{width:100%}}`,
    js: `document.querySelectorAll('.bk-ct__mag').forEach(function (btn) {
  if (!(window.matchMedia && window.matchMedia('(hover:hover)').matches)) return;
  btn.addEventListener('pointermove', function (e) {
    var r = btn.getBoundingClientRect();
    var x = (e.clientX - (r.left + r.width / 2)) * 0.3;
    var y = (e.clientY - (r.top + r.height / 2)) * 0.3;
    btn.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
  });
  btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
});`,
  },
  {
    id: 'pro-footer-mega', category: 'Pro Footer', name: 'Footer: mega with giant wordmark',
    description: 'Dark footer with newsletter, four link columns, bouncing social icons and a huge outlined brand word that fills with colour on hover.',
    specs: ['Fluid giant wordmark clamp(64px, 17vw, 260px) with text stroke', 'Links get a growing underline on hover', 'Social icons lift and fill', 'Newsletter with validation message', '4 columns -> 2 -> 1'],
    shared: ['pro'],
    html: `<footer class="bk-p bk-ft" id="footer">
  <div class="bk-pw">
    <div class="bk-ft__top">
      <div class="bk-ft__nl"><h3>Join our newsletter</h3><p>One useful email a month. No spam.</p><form class="bk-ft__form" novalidate><input type="email" required placeholder="you@example.com" aria-label="Email address"><button class="bk-pbtn" type="submit">Subscribe</button></form><p class="bk-ft__msg" role="status" aria-live="polite"></p></div>
      <div class="bk-ft__cols">
        <div><h4>Company</h4><a href="#">About</a><a href="#">Careers</a><a href="#">Press</a><a href="#">Contact</a></div>
        <div><h4>Services</h4><a href="#">Strategy</a><a href="#">Design</a><a href="#">Development</a><a href="#">Support</a></div>
        <div><h4>Resources</h4><a href="#">Blog</a><a href="#">Guides</a><a href="#">Help centre</a><a href="#">Privacy</a></div>
      </div>
    </div>
    <div class="bk-ft__word" aria-hidden="true">Brand</div>
    <div class="bk-ft__bar"><span>&copy; 2026 Your Company. All rights reserved.</span><div class="bk-ft__soc"><a href="#" aria-label="Facebook">${IC.fb}</a><a href="#" aria-label="Instagram">${IC.ig}</a><a href="#" aria-label="LinkedIn">${IC.in}</a><a href="#" aria-label="X">${IC.x}</a></div></div>
  </div>
</footer>`,
    css: `.bk-ft{background:#070c18;color:#b3bfd6;padding:clamp(56px,8vw,96px) 0 0;overflow:hidden}
.bk-ft__top{display:grid;grid-template-columns:1.1fr 1.4fr;gap:clamp(32px,6vw,90px)}
.bk-ft__nl h3{color:#fff;font-size:clamp(24px,3vw,34px);margin-bottom:10px}
.bk-ft__form{display:flex;gap:8px;margin-top:22px;padding:6px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);transition:border-color .3s,box-shadow .4s}
.bk-ft__form:focus-within{border-color:var(--bk-a);box-shadow:0 0 0 4px color-mix(in srgb,var(--bk-a) 28%,transparent)}
.bk-ft__form input{flex:1;min-width:0;padding:0 16px;border:0;background:transparent;color:#fff;font-family:inherit;font-size:15px;outline:0}
.bk-ft__form .bk-pbtn{padding:13px 22px}
.bk-ft__msg{min-height:1.4em;margin-top:10px;font-size:14px;font-weight:600;color:var(--bk-a-m)}
.bk-ft__cols{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.bk-ft__cols h4{margin-bottom:18px;color:#fff;font-size:15px;letter-spacing:.08em;text-transform:uppercase}
.bk-ft__cols a{position:relative;display:block;width:max-content;padding:5px 0;color:#b3bfd6;text-decoration:none;transition:color .3s,transform .4s var(--bk-ease)}
.bk-ft__cols a::after{content:"";position:absolute;left:0;bottom:2px;width:100%;height:1.5px;background:var(--bk-a-m);transform:scaleX(0);transform-origin:right;transition:transform .45s var(--bk-ease)}
.bk-ft__cols a:hover{color:#fff;transform:translateX(4px)}
.bk-ft__cols a:hover::after{transform:scaleX(1);transform-origin:left}
.bk-ft__word{margin:clamp(30px,5vw,60px) 0 0;text-align:center;font-size:clamp(64px,17vw,260px);font-weight:900;letter-spacing:-.05em;line-height:.85;color:transparent;-webkit-text-stroke:1.5px rgba(255,255,255,.22);transition:color .8s var(--bk-ease),-webkit-text-stroke-color .8s;user-select:none;cursor:default}
.bk-ft__word:hover{color:var(--bk-a);-webkit-text-stroke-color:var(--bk-a)}
.bk-ft__bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:16px;padding:24px 0;border-top:1px solid rgba(255,255,255,.1);font-size:14px}
.bk-ft__soc{display:flex;gap:10px}
.bk-ft__soc a{display:grid;place-items:center;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.07);color:#fff;transition:background .3s,transform .5s var(--bk-ease)}
.bk-ft__soc a:hover{background:var(--bk-a);transform:translateY(-6px) rotate(-8deg)}
@media (max-width:900px){.bk-ft__top{grid-template-columns:1fr}}
@media (max-width:560px){.bk-ft__cols{grid-template-columns:1fr 1fr}.bk-ft__bar{justify-content:center;text-align:center}}`,
    js: `document.querySelectorAll('.bk-ft__form').forEach(function (form) {
  var msg = form.parentNode.querySelector('.bk-ft__msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = form.querySelector('input').checkValidity();
    if (msg) msg.textContent = ok ? 'Welcome aboard! Check your inbox.' : 'Please enter a valid email address.';
    // To really subscribe people, send the email to your server or mailing service here.
    if (ok) form.reset();
  });
});`,
  },
  {
    id: 'pro-scroll-tools', category: 'Pro Extras', name: 'Scroll progress bar + back-to-top',
    description: 'Thin colour bar at the top that fills as you read, and a round button with a progress ring that scrolls back to the top.',
    specs: ['Fixed, pointer-events safe, uses transform scaleX (GPU)', 'Back-to-top button appears after 400px, ring shows progress', 'Smooth scroll, respects reduced motion', 'Add once per page'],
    shared: ['pro'],
    html: `<div class="bk-p bk-sp" id="scroll-tools">
  <div class="bk-sp__bar" aria-hidden="true"><i></i></div>
  <button class="bk-sp__top" type="button" aria-label="Back to top"><svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="21"/><circle class="bk-sp__ring" cx="24" cy="24" r="21"/></svg>${IC.arrowUp}</button>
</div>`,
    css: `.bk-sp__bar{position:fixed;left:0;top:0;right:0;z-index:120;height:4px;pointer-events:none}
.bk-sp__bar i{display:block;height:100%;transform-origin:left;transform:scaleX(0);background:linear-gradient(90deg,var(--bk-a),var(--bk-a2))}
.bk-sp__top{position:fixed;right:clamp(14px,3vw,28px);bottom:clamp(14px,3vw,28px);z-index:110;display:grid;place-items:center;width:56px;height:56px;padding:0;border:0;border-radius:50%;background:#fff;color:var(--bk-a);box-shadow:0 14px 30px -12px rgba(11,18,32,.5);cursor:pointer;opacity:0;visibility:hidden;transform:translateY(20px) scale(.8);transition:opacity .4s,visibility .4s,transform .5s var(--bk-ease),background .3s,color .3s}
.bk-sp__top.is-show{opacity:1;visibility:visible;transform:none}
.bk-sp__top:hover{background:var(--bk-a);color:#fff;transform:translateY(-5px)}
.bk-sp__top svg:first-child{position:absolute;inset:0;width:100%;height:100%;transform:rotate(-90deg)}
.bk-sp__top circle{fill:none;stroke:var(--bk-a-l);stroke-width:3}
.bk-sp__top .bk-sp__ring{stroke:var(--bk-a);stroke-linecap:round;stroke-dasharray:132;stroke-dashoffset:132}
.bk-sp__top:hover circle{stroke:rgba(255,255,255,.3)}
.bk-sp__top:hover .bk-sp__ring{stroke:#fff}
.bk-sp__top:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:3px}`,
    js: `document.querySelectorAll('.bk-sp').forEach(function (root) {
  var bar = root.querySelector('.bk-sp__bar i');
  var top = root.querySelector('.bk-sp__top');
  var ring = root.querySelector('.bk-sp__ring');
  function update() {
    var d = document.documentElement;
    var max = d.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
    ring.style.strokeDashoffset = String(132 - 132 * p);
    top.classList.toggle('is-show', window.scrollY > 400);
  }
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
});`,
  },
];
