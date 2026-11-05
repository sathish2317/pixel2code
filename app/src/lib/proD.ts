import type { Block } from './blocks';
import { AR, IC, img, svg } from './proShared';

const I_PLUS = svg('<path d="M12 5v14M5 12h14"/>', 22, 2.6);
const I_STETH = svg('<path d="M6 3v6a4 4 0 008 0V3"/><path d="M10 13v2a5 5 0 0010 0v-2"/><circle cx="20" cy="11" r="2"/>', 24);
const I_BONE = svg('<path d="M7 7a2.5 2.5 0 11-3-3 2.5 2.5 0 013 3l10 10a2.5 2.5 0 113 3 2.5 2.5 0 01-3-3z"/>', 24);
const I_BRAIN = svg('<path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 1V4a3 3 0 00-3 0zM15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 1"/>', 24);
const I_BABY = svg('<circle cx="12" cy="12" r="9"/><path d="M9 10h.01M15 10h.01M9 15c1 1.2 5 1.2 6 0"/>', 24);
const I_SEARCH = svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', 20);
const I_HOME = svg('<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>', 22);
const I_GRID = svg('<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>', 22);
const I_USERS = svg('<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.5-4 3.5-6 7-6s6.5 2 7 6M17 5a3.5 3.5 0 010 7M22 20c-.3-2.6-1.7-4.4-4-5.3"/>', 22);
const I_MAIL = IC.mail;
const I_BRIEF = svg('<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 012-2h2a2 2 0 012 2v2M3 13h18"/>', 20);
const I_PIN = IC.pin;

/** PRO blocks, part D: healthcare, HR, real-estate and restaurant heroes, announcement bar, dock, doctors, departments, hours, jobs, perks, values, comparison, countdown, FAQ search. */
export const PRO_D: Block[] = [
  // ============================== HEROES ==============================
  {
    id: 'pro-hero-clinic', category: 'Pro Hero', name: 'Hero: healthcare + quick appointment bar',
    description: 'Calm medical hero with a morphing organic photo shape, floating info cards, trust avatars, and an appointment search bar that overlaps the hero.',
    specs: ['Morphing blob mask (CSS keyframes) around the photo', 'Pulsing emergency call button', 'Quick appointment form (department, date, phone) with validation message', 'Floating cards: next slot, 24/7, rating', 'Stacks under 960px; bar becomes a 2-col then 1-col grid'],
    shared: ['pro'],
    html: `<section class="bk-p bk-cl" id="home">
  <div class="bk-pw bk-cl__in">
    <div class="bk-cl__text">
      <span class="bk-pey bk-rv">Trusted care since 1998</span>
      <h1 class="bk-rv" style="--i:1">Your health, in <em>caring</em> hands</h1>
      <p class="bk-rv" style="--i:2">Experienced doctors, modern equipment and a team that listens. Book a visit in under a minute.</p>
      <div class="bk-cl__btns bk-rv" style="--i:3"><a class="bk-pbtn" href="#booking">Book appointment ${AR}</a><a class="bk-cl__call" href="#"><span>${IC.phone}</span><b>24/7 Emergency<small>+91 00000 00000</small></b></a></div>
      <div class="bk-cl__proof bk-rv" style="--i:4"><div class="bk-cl__av"><img src="${img('bk-cl-a', 80, 80)}" alt=""><img src="${img('bk-cl-b', 80, 80)}" alt=""><img src="${img('bk-cl-c', 80, 80)}" alt=""><i>+</i></div><p><b>12,000+</b> happy patients<br><span>4.9 / 5 average rating</span></p></div>
    </div>
    <div class="bk-cl__art bk-rv bk-rv--z" style="--i:2">
      <div class="bk-cl__blob"><img src="${img('bk-clinic', 640, 720)}" alt="Doctor with patient"></div>
      <i class="bk-cl__plus bk-cl__plus--1" aria-hidden="true">${I_PLUS}</i><i class="bk-cl__plus bk-cl__plus--2" aria-hidden="true">${I_PLUS}</i>
      <div class="bk-cl__fc bk-cl__fc--a"><span>${IC.clock}</span><div><small>Next available</small><b>Today, 4:30 PM</b></div></div>
      <div class="bk-cl__fc bk-cl__fc--b"><span>${IC.heart}</span><div><small>Specialists</small><b>45+ doctors</b></div></div>
    </div>
  </div>
  <div class="bk-pw"><form class="bk-cl__bar bk-rv" style="--i:3" id="booking" novalidate>
    <label>Department<select required><option value="">Choose</option><option>General medicine</option><option>Cardiology</option><option>Orthopedics</option><option>Pediatrics</option><option>Dermatology</option></select></label>
    <label>Preferred date<input type="date" required></label>
    <label>Phone number<input type="tel" required pattern="[0-9+ ()-]{8,}" placeholder="+91 00000 00000"></label>
    <button class="bk-pbtn" type="submit">Find a slot ${AR}</button>
    <p class="bk-cl__msg" role="status" aria-live="polite"></p>
  </form></div>
</section>`,
    css: `.bk-cl{position:relative;overflow:hidden;background:linear-gradient(180deg,var(--bk-a-l),#fff 70%);padding:clamp(40px,6vw,88px) 0 clamp(40px,5vw,72px)}
.bk-cl::before{content:"";position:absolute;right:-160px;top:-160px;width:560px;height:560px;border-radius:50%;background:radial-gradient(circle,var(--bk-a-m),transparent 68%)}
.bk-cl__in{position:relative;display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(30px,5vw,70px);align-items:center;padding-bottom:clamp(60px,7vw,90px)}
.bk-cl h1{margin:22px 0;font-size:clamp(38px,5.6vw,72px);font-weight:800}
.bk-cl h1 em{font-style:normal;color:var(--bk-a)}
.bk-cl__text>p{max-width:500px;font-size:clamp(16px,1.6vw,19px);color:var(--bk-mut);margin-bottom:30px}
.bk-cl__btns{display:flex;flex-wrap:wrap;align-items:center;gap:18px 26px}
.bk-cl__call{display:flex;align-items:center;gap:12px;color:var(--bk-ink);text-decoration:none}
.bk-cl__call span{position:relative;display:grid;place-items:center;width:50px;height:50px;border-radius:50%;background:#fee2e2;color:#dc2626}
.bk-cl__call span::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid #dc2626;animation:bk-cl-ping 1.8s ease-out infinite}
@keyframes bk-cl-ping{0%{transform:scale(1);opacity:.7}100%{transform:scale(1.7);opacity:0}}
.bk-cl__call b{display:block;font-size:15px;line-height:1.3}
.bk-cl__call small{display:block;font-weight:500;color:var(--bk-mut)}
.bk-cl__proof{display:flex;align-items:center;gap:14px;margin-top:34px}
.bk-cl__av{display:flex}
.bk-cl__av img,.bk-cl__av i{width:44px;height:44px;margin-left:-12px;border-radius:50%;border:3px solid #fff;object-fit:cover}
.bk-cl__av img:first-child{margin-left:0}
.bk-cl__av i{display:grid;place-items:center;background:var(--bk-a);color:#fff;font-style:normal;font-weight:700}
.bk-cl__proof p{font-size:14px;line-height:1.4;color:var(--bk-mut)}
.bk-cl__proof b{color:var(--bk-ink);font-size:17px}
.bk-cl__art{position:relative;max-width:500px;margin-left:auto;width:100%}
.bk-cl__blob{aspect-ratio:1/1.08;overflow:hidden;background:var(--bk-a-m);border-radius:60% 40% 55% 45% / 50% 55% 45% 50%;box-shadow:0 40px 80px -36px var(--bk-a);animation:bk-cl-morph 12s ease-in-out infinite}
@keyframes bk-cl-morph{0%,100%{border-radius:60% 40% 55% 45% / 50% 55% 45% 50%}50%{border-radius:42% 58% 40% 60% / 58% 42% 58% 42%}}
.bk-cl__blob img{width:100%;height:100%;object-fit:cover}
.bk-cl__plus{position:absolute;color:var(--bk-a);opacity:.5;animation:bk-bob 5s ease-in-out infinite}
.bk-cl__plus svg{width:34px;height:34px}
.bk-cl__plus--1{left:-4%;top:6%}
.bk-cl__plus--2{right:2%;bottom:18%;animation-delay:-2s}
.bk-cl__fc{position:absolute;display:flex;align-items:center;gap:12px;padding:12px 18px 12px 12px;border-radius:18px;background:#fff;box-shadow:0 24px 44px -20px rgba(11,18,32,.4);animation:bk-bob 6s ease-in-out infinite}
.bk-cl__fc span{display:grid;place-items:center;width:44px;height:44px;border-radius:14px;background:var(--bk-a-l);color:var(--bk-a)}
.bk-cl__fc small{display:block;font-size:12px;color:var(--bk-mut)}
.bk-cl__fc b{font-size:15px}
.bk-cl__fc--a{left:-8%;bottom:14%}
.bk-cl__fc--b{right:-2%;top:10%;animation-delay:-3s}
.bk-cl__bar{position:relative;z-index:2;display:grid;grid-template-columns:1fr 1fr 1fr auto;gap:14px;align-items:end;margin-top:calc(-1 * clamp(30px,4vw,56px));padding:clamp(18px,2.4vw,28px);border-radius:calc(var(--bk-r) + 4px);background:#fff;box-shadow:0 40px 70px -34px rgba(11,18,32,.5);border:1px solid var(--bk-line)}
.bk-cl__bar label{display:grid;gap:6px;font-size:13px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--bk-mut)}
.bk-cl__bar select,.bk-cl__bar input{width:100%;padding:14px;border:1.5px solid var(--bk-line);border-radius:14px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:15px;font-weight:500;text-transform:none;letter-spacing:0;transition:border-color .3s,box-shadow .3s}
.bk-cl__bar select:focus,.bk-cl__bar input:focus{outline:0;border-color:var(--bk-a);box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-cl__bar .is-bad{border-color:#dc2626}
.bk-cl__bar .bk-pbtn{padding:16px 26px}
.bk-cl__msg{grid-column:1/-1;min-height:1.3em;font-weight:600;font-size:14px;color:#dc2626}
.bk-cl__msg.is-ok{color:#16a34a}
@media (max-width:960px){.bk-cl__in{grid-template-columns:1fr}.bk-cl__art{margin:0 auto;max-width:420px}.bk-cl__bar{grid-template-columns:1fr 1fr}.bk-cl__bar .bk-pbtn{grid-column:1/-1}}
@media (max-width:520px){.bk-cl__bar{grid-template-columns:1fr}.bk-cl__fc--a{left:0}.bk-cl__fc--b{right:0}}`,
    js: `document.querySelectorAll('.bk-cl__bar').forEach(function (form) {
  var msg = form.querySelector('.bk-cl__msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll('select,input').forEach(function (f) { var bad = !f.checkValidity(); f.classList.toggle('is-bad', bad); if (bad) ok = false; });
    msg.className = 'bk-cl__msg' + (ok ? ' is-ok' : '');
    msg.textContent = ok ? 'Thank you! Our team will call you to confirm your slot.' : 'Please choose a department, a date and a valid phone number.';
    // To really book, send the values to your server here.
    if (ok) form.reset();
  });
});`,
  },
  {
    id: 'pro-hero-rotator', category: 'Pro Hero', name: 'Hero: centred with word rotator',
    description: 'Centred headline where one word keeps changing (build / launch / scale). Mesh gradient, grid lines, two buttons and an avatar marquee.',
    specs: ['Pure CSS word rotator (stacked words, stepped keyframes)', 'Animated mesh gradient + faint grid mask', 'Fluid type clamp(38px, 7vw, 92px)', 'Works at 320px, wraps cleanly'],
    shared: ['pro'],
    html: `<section class="bk-p bk-rt" id="home">
  <div class="bk-rt__bg" aria-hidden="true"><i></i><i></i></div>
  <div class="bk-pw bk-rt__in">
    <span class="bk-pey bk-rv">Trusted by 2,400+ teams</span>
    <h1 class="bk-rv" style="--i:1">We help teams <span class="bk-rt__w"><span class="bk-rt__s"><b>build</b><b>launch</b><b>scale</b><b>build</b></span></span><br>products people love</h1>
    <p class="bk-rv" style="--i:2">From first sketch to millions of users. One partner for strategy, design and engineering.</p>
    <div class="bk-rt__btns bk-rv" style="--i:3"><a class="bk-pbtn" href="#contact">Start your project ${AR}</a><a class="bk-pbtn bk-pbtn--ghost" href="#gallery">See our work</a></div>
    <div class="bk-rt__av bk-rv" style="--i:4"><img src="${img('bk-rt1', 80, 80)}" alt=""><img src="${img('bk-rt2', 80, 80)}" alt=""><img src="${img('bk-rt3', 80, 80)}" alt=""><img src="${img('bk-rt4', 80, 80)}" alt=""><img src="${img('bk-rt5', 80, 80)}" alt=""><span><b>4.9</b> from 600+ reviews</span></div>
  </div>
</section>`,
    css: `.bk-rt{position:relative;overflow:hidden;text-align:center;background:#fff;padding:clamp(64px,10vw,150px) 0 clamp(56px,8vw,110px)}
.bk-rt__bg{position:absolute;inset:0;pointer-events:none;background-image:linear-gradient(var(--bk-line) 1px,transparent 1px),linear-gradient(90deg,var(--bk-line) 1px,transparent 1px);background-size:64px 64px;-webkit-mask-image:radial-gradient(ellipse 65% 55% at 50% 35%,#000,transparent);mask-image:radial-gradient(ellipse 65% 55% at 50% 35%,#000,transparent)}
.bk-rt__bg i{position:absolute;border-radius:50%;filter:blur(80px);opacity:.5;animation:bk-rt-drift 14s ease-in-out infinite alternate}
.bk-rt__bg i:nth-child(1){left:12%;top:-10%;width:420px;height:420px;background:var(--bk-a-m)}
.bk-rt__bg i:nth-child(2){right:10%;top:10%;width:360px;height:360px;background:var(--bk-a2);opacity:.3;animation-delay:-6s}
@keyframes bk-rt-drift{to{transform:translate3d(60px,50px,0) scale(1.2)}}
.bk-rt__in{position:relative}
.bk-rt h1{max-width:1000px;margin:26px auto 22px;font-size:clamp(38px,7vw,92px);font-weight:800;letter-spacing:-.045em;line-height:1.04}
.bk-rt__w{display:inline-block;height:1.1em;overflow:hidden;vertical-align:bottom;text-align:left}
.bk-rt__s{display:flex;flex-direction:column;animation:bk-rt-roll 9s cubic-bezier(.7,0,.2,1) infinite}
.bk-rt__s b{height:1.1em;line-height:1.1;color:var(--bk-a);background:linear-gradient(90deg,var(--bk-a),var(--bk-a2));-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}
@keyframes bk-rt-roll{0%,28%{transform:translateY(0)}33%,61%{transform:translateY(-1.1em)}66%,94%{transform:translateY(-2.2em)}100%{transform:translateY(-3.3em)}}
.bk-rt__in>p{max-width:560px;margin:0 auto 34px;font-size:clamp(17px,1.8vw,21px);color:var(--bk-mut)}
.bk-rt__btns{display:flex;flex-wrap:wrap;justify-content:center;gap:14px}
.bk-rt__av{display:flex;align-items:center;justify-content:center;margin-top:44px}
.bk-rt__av img{width:44px;height:44px;margin-left:-10px;border-radius:50%;border:3px solid #fff;object-fit:cover;box-shadow:0 8px 18px -10px rgba(11,18,32,.5);transition:transform .5s var(--bk-ease)}
.bk-rt__av img:hover{transform:translateY(-6px) scale(1.1)}
.bk-rt__av img:first-child{margin-left:0}
.bk-rt__av span{margin-left:16px;font-size:14px;color:var(--bk-mut)}
.bk-rt__av b{color:var(--bk-ink)}
@media (max-width:520px){.bk-rt__btns .bk-pbtn{width:100%}.bk-rt__av{flex-wrap:wrap;gap:10px}.bk-rt__av span{width:100%;margin:6px 0 0}}`,
    js: '',
  },
  {
    id: 'pro-hero-kenburns', category: 'Pro Hero', name: 'Hero slider: Ken Burns + progress bars',
    description: 'Full-screen cinematic slider. Each photo slowly zooms, headlines slide up line by line, and thin progress bars show the autoplay timer.',
    specs: ['Autoplay 6s with visible progress bars (click a bar to jump)', 'Ken Burns zoom (CSS scale 1.0 -> 1.12) on the active slide', 'Prev / next arrows, keyboard arrows, pause on hover', 'Height clamp(520px, 88vh, 820px); text scales fluidly', 'Reduced motion: no zoom, no autoplay'],
    shared: ['pro'],
    html: `<section class="bk-p bk-kb" id="home" aria-roledescription="carousel" aria-label="Featured">
  <div class="bk-kb__slide is-on" style="--bg:url(${img('bk-kb1', 1800, 1000)})"><div class="bk-kb__cap"><small>01 / 03</small><h1><span>Spaces that</span><span>inspire living</span></h1><p>Thoughtful architecture and interiors for homes, offices and hotels.</p><a class="bk-pbtn bk-pbtn--light" href="#contact">Plan your space ${AR}</a></div></div>
  <div class="bk-kb__slide" style="--bg:url(${img('bk-kb2', 1800, 1000)})"><div class="bk-kb__cap"><small>02 / 03</small><h1><span>Crafted with</span><span>honest materials</span></h1><p>Stone, timber and light, combined with patience and skill.</p><a class="bk-pbtn bk-pbtn--light" href="#gallery">View projects ${AR}</a></div></div>
  <div class="bk-kb__slide" style="--bg:url(${img('bk-kb3', 1800, 1000)})"><div class="bk-kb__cap"><small>03 / 03</small><h1><span>Delivered on</span><span>time, every time</span></h1><p>A dedicated team and a clear schedule from day one to handover.</p><a class="bk-pbtn bk-pbtn--light" href="#about">Our process ${AR}</a></div></div>
  <div class="bk-kb__nav"><button class="bk-kb__arr bk-kb__arr--p" type="button" aria-label="Previous slide">&larr;</button><button class="bk-kb__arr bk-kb__arr--n" type="button" aria-label="Next slide">&rarr;</button></div>
  <div class="bk-kb__bars"></div>
</section>`,
    css: `.bk-kb{position:relative;overflow:hidden;height:clamp(520px,88vh,820px);background:#0b1220;color:#fff}
.bk-kb__slide{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity 1.1s,visibility 1.1s}
.bk-kb__slide::before{content:"";position:absolute;inset:0;background:var(--bg) center/cover no-repeat;transform:scale(1);transition:transform 8s linear}
.bk-kb__slide::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,11,24,.8),rgba(6,11,24,.15) 70%),linear-gradient(0deg,rgba(6,11,24,.6),transparent 40%)}
.bk-kb__slide.is-on{opacity:1;visibility:visible}
.bk-kb__slide.is-on::before{transform:scale(1.12)}
.bk-kb__cap{position:relative;z-index:2;display:flex;flex-direction:column;justify-content:center;align-items:flex-start;gap:18px;height:100%;max-width:1240px;margin:0 auto;padding:0 clamp(24px,6vw,96px)}
.bk-kb__cap small{font-size:14px;font-weight:700;letter-spacing:.2em;color:var(--bk-a-m)}
.bk-kb h1{display:grid;font-size:clamp(40px,8vw,112px);font-weight:800;letter-spacing:-.05em;line-height:.98}
.bk-kb h1 span{display:block;overflow:hidden}
.bk-kb h1 span{opacity:0;transform:translateY(60%);transition:opacity .9s,transform 1.1s var(--bk-ease)}
.bk-kb__slide.is-on h1 span{opacity:1;transform:none;transition-delay:.35s}
.bk-kb__slide.is-on h1 span:nth-child(2){transition-delay:.5s}
.bk-kb__cap p,.bk-kb__cap .bk-pbtn{opacity:0;transform:translateY(24px);transition:opacity .8s,transform 1s var(--bk-ease)}
.bk-kb__cap p{max-width:480px;font-size:clamp(16px,1.7vw,20px);color:#d5def0}
.bk-kb__slide.is-on .bk-kb__cap p{opacity:1;transform:none;transition-delay:.75s}
.bk-kb__slide.is-on .bk-kb__cap .bk-pbtn{opacity:1;transform:none;transition-delay:.95s}
.bk-kb__nav{position:absolute;z-index:3;right:clamp(20px,5vw,72px);bottom:64px;display:flex;gap:10px}
.bk-kb__arr{display:grid;place-items:center;width:54px;height:54px;border:1.5px solid rgba(255,255,255,.4);border-radius:50%;background:rgba(255,255,255,.08);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px);color:#fff;font-size:20px;cursor:pointer;transition:background .3s,color .3s,transform .5s var(--bk-ease)}
.bk-kb__arr:hover{background:#fff;color:var(--bk-ink);transform:scale(1.1)}
.bk-kb__bars{position:absolute;z-index:3;left:clamp(24px,6vw,96px);right:clamp(24px,6vw,96px);bottom:28px;display:flex;gap:10px}
.bk-kb__bars button{flex:1;height:18px;padding:0;border:0;background:transparent;cursor:pointer;position:relative}
.bk-kb__bars button::before{content:"";position:absolute;left:0;right:0;top:7px;height:3px;border-radius:3px;background:rgba(255,255,255,.3)}
.bk-kb__bars button i{position:absolute;left:0;top:7px;height:3px;width:0;border-radius:3px;background:#fff}
.bk-kb__bars button.is-on i{animation:bk-kb-fill 6s linear forwards}
.bk-kb.is-paused .bk-kb__bars button.is-on i{animation-play-state:paused}
@keyframes bk-kb-fill{to{width:100%}}
@media (max-width:640px){.bk-kb__nav{display:none}.bk-kb{height:clamp(520px,82vh,700px)}}
@media (prefers-reduced-motion:reduce){.bk-kb__slide.is-on::before{transform:none}}`,
    js: `document.querySelectorAll('.bk-kb').forEach(function (root) {
  var slides = [].slice.call(root.querySelectorAll('.bk-kb__slide'));
  var bars = root.querySelector('.bk-kb__bars');
  var cur = 0, timer = null;
  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;
  var btns = slides.map(function (s, i) {
    var b = document.createElement('button');
    b.type = 'button'; b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    b.innerHTML = '<i></i>';
    b.addEventListener('click', function () { show(i); start(); });
    bars.appendChild(b); return b;
  });
  function show(i) {
    cur = (i + slides.length) % slides.length;
    slides.forEach(function (s, k) { s.classList.toggle('is-on', k === cur); });
    btns.forEach(function (b, k) { b.classList.remove('is-on'); void b.offsetWidth; if (k === cur) b.classList.add('is-on'); });
  }
  function start() { stop(); if (still) return; timer = setTimeout(function () { show(cur + 1); start(); }, 6000); }
  function stop() { if (timer) clearTimeout(timer); timer = null; }
  root.querySelector('.bk-kb__arr--p').addEventListener('click', function () { show(cur - 1); start(); });
  root.querySelector('.bk-kb__arr--n').addEventListener('click', function () { show(cur + 1); start(); });
  root.addEventListener('mouseenter', function () { stop(); root.classList.add('is-paused'); });
  root.addEventListener('mouseleave', function () { root.classList.remove('is-paused'); show(cur); start(); });
  document.addEventListener('keydown', function (e) {
    var r = root.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    if (e.key === 'ArrowLeft') { show(cur - 1); start(); }
    if (e.key === 'ArrowRight') { show(cur + 1); start(); }
  });
  show(0); start();
});`,
  },
  {
    id: 'pro-hero-restaurant', category: 'Pro Hero', name: 'Hero: restaurant with rotating plate',
    description: 'Warm, dark, elegant hero. A round dish photo spins slowly inside a dashed ring, with floating spice dots, a chef badge and opening hours.',
    specs: ['Rotating plate + counter-rotating ring (CSS)', 'Serif display type with italic accent word', 'Reserve button with sliding fill, hours chips', 'Stacks with the plate first under 900px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-rs" id="home">
  <div class="bk-pw bk-rs__in">
    <div class="bk-rs__text">
      <p class="bk-rs__eye bk-rv"><i></i>Fine dining &middot; Since 2009</p>
      <h1 class="bk-rv" style="--i:1">Taste the <em>tradition</em>, savour the moment</h1>
      <p class="bk-rs__lead bk-rv" style="--i:2">Seasonal ingredients, slow-cooked recipes and warm hospitality. Come hungry, leave happy.</p>
      <div class="bk-rs__btns bk-rv" style="--i:3"><a class="bk-rs__btn" href="#contact">Reserve a table</a><a class="bk-rs__link" href="#menu">View the menu ${AR}</a></div>
      <ul class="bk-rs__hrs bk-rv" style="--i:4"><li><b>Lunch</b>12:00 - 3:00 PM</li><li><b>Dinner</b>6:30 - 11:00 PM</li><li><b>Closed</b>Mondays</li></ul>
    </div>
    <div class="bk-rs__art bk-rv bk-rv--z" style="--i:2">
      <i class="bk-rs__ring" aria-hidden="true"></i>
      <div class="bk-rs__plate"><img src="${img('bk-plate', 700, 700)}" alt="Chef's special dish"></div>
      <span class="bk-rs__dot bk-rs__dot--1"></span><span class="bk-rs__dot bk-rs__dot--2"></span><span class="bk-rs__dot bk-rs__dot--3"></span>
      <div class="bk-rs__badge"><small>Chef&rsquo;s special</small><b>Saffron biryani</b><span>$18</span></div>
    </div>
  </div>
</section>`,
    css: `.bk-rs{--bk-hf:"Playfair Display",Georgia,serif;position:relative;overflow:hidden;background:radial-gradient(900px 600px at 80% 40%,#3a2417,#120d0a 70%);color:#f6ede3;padding:clamp(56px,8vw,120px) 0}
.bk-rs__in{display:grid;grid-template-columns:1.05fr .95fr;gap:clamp(30px,5vw,80px);align-items:center}
.bk-rs__eye{display:flex;align-items:center;gap:14px;font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:#d9b384}
.bk-rs__eye i{width:46px;height:1px;background:var(--bk-a)}
.bk-rs h1{margin:22px 0;font-size:clamp(40px,6vw,84px);font-weight:500;letter-spacing:-.025em;line-height:1.04;color:#fff7ee}
.bk-rs h1 em{color:#e8b86d;font-style:italic}
.bk-rs__lead{max-width:470px;font-family:Georgia,serif;font-size:clamp(17px,1.6vw,20px);line-height:1.8;color:#cdb9a3;margin-bottom:34px}
.bk-rs__btns{display:flex;align-items:center;flex-wrap:wrap;gap:26px}
.bk-rs__btn{position:relative;isolation:isolate;overflow:hidden;display:inline-block;padding:17px 36px;border:1.5px solid #e8b86d;color:#e8b86d;font-size:13px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;transition:color .5s}
.bk-rs__btn::before{content:"";position:absolute;inset:0;z-index:-1;background:#e8b86d;transform:translateX(-101%);transition:transform .6s var(--bk-ease)}
.bk-rs__btn:hover{color:#120d0a}
.bk-rs__btn:hover::before{transform:none}
.bk-rs__link{color:#fff7ee;text-decoration:none;border-bottom:1px solid rgba(255,247,238,.4);padding-bottom:3px;transition:color .3s,border-color .3s}
.bk-rs__link:hover{color:#e8b86d;border-color:#e8b86d}
.bk-rs__hrs{display:flex;flex-wrap:wrap;gap:18px 40px;margin:46px 0 0;padding:26px 0 0;border-top:1px solid rgba(246,237,227,.16);list-style:none;font-size:14px;color:#cdb9a3}
.bk-rs__hrs b{display:block;margin-bottom:3px;font-family:var(--bk-hf);font-size:18px;font-weight:500;color:#fff7ee}
.bk-rs__art{position:relative;display:grid;place-items:center;max-width:540px;margin:0 auto;width:100%;aspect-ratio:1}
.bk-rs__ring{position:absolute;inset:2%;border:1.5px dashed rgba(232,184,109,.5);border-radius:50%;animation:bk-spin 40s linear infinite reverse}
.bk-rs__plate{width:82%;aspect-ratio:1;border-radius:50%;overflow:hidden;box-shadow:0 0 0 12px rgba(255,255,255,.05),0 50px 90px -20px rgba(0,0,0,.8);animation:bk-spin 60s linear infinite}
.bk-rs__plate img{width:100%;height:100%;object-fit:cover}
.bk-rs__dot{position:absolute;border-radius:50%;background:#e8b86d;animation:bk-bob 5s ease-in-out infinite}
.bk-rs__dot--1{left:6%;top:18%;width:14px;height:14px}
.bk-rs__dot--2{right:8%;top:10%;width:9px;height:9px;animation-delay:-2s;background:var(--bk-a)}
.bk-rs__dot--3{right:14%;bottom:12%;width:12px;height:12px;animation-delay:-3.5s}
.bk-rs__badge{position:absolute;left:-2%;bottom:10%;display:grid;gap:2px;padding:16px 22px;border-radius:18px;background:rgba(255,247,238,.95);color:#120d0a;box-shadow:0 24px 44px -20px rgba(0,0,0,.7);animation:bk-bob 6s ease-in-out infinite}
.bk-rs__badge small{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:#8b6b49}
.bk-rs__badge b{font-family:var(--bk-hf);font-size:20px}
.bk-rs__badge span{font-weight:700;color:var(--bk-a)}
@media (max-width:900px){.bk-rs__in{grid-template-columns:1fr;text-align:center}.bk-rs__art{order:-1;max-width:400px}.bk-rs__lead{margin-left:auto;margin-right:auto}.bk-rs__eye,.bk-rs__btns,.bk-rs__hrs{justify-content:center}.bk-rs__badge{left:0}}`,
    js: '',
  },
  {
    id: 'pro-hero-property', category: 'Pro Hero', name: 'Hero: real estate search panel',
    description: 'Photo hero with a floating search card: Buy / Rent tabs with a sliding indicator, location, type and budget fields, plus counters.',
    specs: ['Tabs with sliding pill (ARIA tablist)', 'Search card with validation message, big Search button', 'Dark gradient over photo for readable text at any size', 'Stat counters row, responsive grid (4 -> 2 -> 1 fields)'],
    shared: ['pro'],
    html: `<section class="bk-p bk-pp" id="home" style="--bg:url(${img('bk-prop-hero', 1800, 1000)})">
  <div class="bk-pw bk-pp__in">
    <span class="bk-pey bk-rv">Over 4,500 verified listings</span>
    <h1 class="bk-rv" style="--i:1">Find a home you will <em>love</em> coming back to</h1>
    <p class="bk-rv" style="--i:2">Apartments, villas and plots in the best neighbourhoods, with honest prices and no hidden fees.</p>
    <form class="bk-pp__card bk-rv" style="--i:3" novalidate>
      <div class="bk-pp__tabs" role="tablist"><span class="bk-pp__ind" aria-hidden="true"></span><button class="is-on" type="button" role="tab" aria-selected="true">Buy</button><button type="button" role="tab" aria-selected="false">Rent</button><button type="button" role="tab" aria-selected="false">Sell</button></div>
      <div class="bk-pp__fields">
        <label>${I_PIN}<span>Location</span><input type="text" required placeholder="City or neighbourhood"></label>
        <label>${I_HOME}<span>Property type</span><select><option>Apartment</option><option>Villa</option><option>Plot</option><option>Office</option></select></label>
        <label>${I_BRIEF}<span>Budget</span><select><option>Any budget</option><option>Under $100k</option><option>$100k - $300k</option><option>$300k +</option></select></label>
        <button class="bk-pbtn" type="submit">${I_SEARCH}Search</button>
      </div>
      <p class="bk-pp__msg" role="status" aria-live="polite"></p>
    </form>
    <ul class="bk-pp__stats bk-rv" style="--i:4"><li><b>4,500+</b>Listings</li><li><b>1,200</b>Happy families</li><li><b>15 yrs</b>Experience</li></ul>
  </div>
</section>`,
    css: `.bk-pp{position:relative;overflow:hidden;color:#fff;background:linear-gradient(180deg,rgba(6,11,24,.55),rgba(6,11,24,.8)),var(--bg) center/cover no-repeat;padding:clamp(70px,10vw,150px) 0 clamp(50px,6vw,80px)}
.bk-pp__in{text-align:center}
.bk-pp .bk-pey{background:rgba(255,255,255,.14);color:#fff}
.bk-pp h1{max-width:880px;margin:24px auto 18px;font-size:clamp(36px,6.4vw,84px);font-weight:800}
.bk-pp h1 em{font-style:normal;color:var(--bk-a-m)}
.bk-pp__in>p{max-width:560px;margin:0 auto 38px;font-size:clamp(16px,1.7vw,20px);color:#dbe4f5}
.bk-pp__card{max-width:980px;margin:0 auto;padding:clamp(16px,2.4vw,26px);border-radius:calc(var(--bk-r) + 6px);background:#fff;color:var(--bk-ink);text-align:left;box-shadow:0 50px 90px -34px rgba(0,0,0,.7)}
.bk-pp__tabs{position:relative;display:inline-flex;padding:5px;margin-bottom:18px;border-radius:999px;background:var(--bk-soft)}
.bk-pp__tabs button{position:relative;z-index:1;padding:10px 26px;border:0;border-radius:999px;background:transparent;color:var(--bk-mut);font-family:inherit;font-size:15px;font-weight:700;cursor:pointer;transition:color .3s}
.bk-pp__tabs button.is-on{color:#fff}
.bk-pp__ind{position:absolute;top:5px;bottom:5px;left:0;width:0;border-radius:999px;background:var(--bk-a);box-shadow:0 10px 20px -8px var(--bk-a);transition:transform .5s var(--bk-ease),width .5s var(--bk-ease)}
.bk-pp__fields{display:grid;grid-template-columns:1.3fr 1fr 1fr auto;gap:12px}
.bk-pp__fields label{position:relative;display:grid;gap:2px;padding:10px 14px 10px 50px;border:1.5px solid var(--bk-line);border-radius:16px;transition:border-color .3s,box-shadow .3s}
.bk-pp__fields label:focus-within{border-color:var(--bk-a);box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-pp__fields label svg{position:absolute;left:15px;top:50%;margin-top:-11px;color:var(--bk-a)}
.bk-pp__fields label span{font-size:11.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--bk-mut)}
.bk-pp__fields input,.bk-pp__fields select{width:100%;padding:0;border:0;background:transparent;color:var(--bk-ink);font-family:inherit;font-size:15px;font-weight:600;outline:0}
.bk-pp__fields .bk-pbtn{padding:0 30px;min-height:60px}
.bk-pp__msg{min-height:1.3em;margin-top:10px;font-size:14px;font-weight:600;color:#dc2626}
.bk-pp__msg.is-ok{color:#16a34a}
.bk-pp__stats{display:flex;flex-wrap:wrap;justify-content:center;gap:16px 56px;margin:40px 0 0;padding:0;list-style:none;color:#cbd6ec;font-size:14px}
.bk-pp__stats b{display:block;font-size:clamp(24px,3vw,34px);color:#fff;letter-spacing:-.03em}
@media (max-width:900px){.bk-pp__fields{grid-template-columns:1fr 1fr}.bk-pp__fields .bk-pbtn{grid-column:1/-1}}
@media (max-width:520px){.bk-pp__fields{grid-template-columns:1fr}.bk-pp__tabs{display:flex}.bk-pp__tabs button{flex:1;padding:10px 6px}}`,
    js: `document.querySelectorAll('.bk-pp__card').forEach(function (card) {
  var tabs = [].slice.call(card.querySelectorAll('.bk-pp__tabs button'));
  var ind = card.querySelector('.bk-pp__ind');
  var msg = card.querySelector('.bk-pp__msg');
  function move() {
    var a = card.querySelector('.bk-pp__tabs .is-on');
    if (a) { ind.style.width = a.offsetWidth + 'px'; ind.style.transform = 'translateX(' + a.offsetLeft + 'px)'; }
  }
  tabs.forEach(function (t) {
    t.addEventListener('click', function () {
      tabs.forEach(function (x) { x.classList.toggle('is-on', x === t); x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
      move();
    });
  });
  window.addEventListener('resize', move); move();
  card.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = card.querySelector('input[required]');
    var ok = f.checkValidity() && f.value.trim().length > 1;
    f.style.outline = ok ? '' : '2px solid #dc2626';
    msg.className = 'bk-pp__msg' + (ok ? ' is-ok' : '');
    msg.textContent = ok ? 'Searching homes near ' + f.value.trim() + '...' : 'Please enter a location.';
    // To really search, send the fields to your listings API here.
  });
});`,
  },

  // ============================== NAVBARS ==============================
  {
    id: 'pro-announce', category: 'Pro Navbar', name: 'Announcement bar: ticker + countdown',
    description: 'Slim top bar with a scrolling offer message, a live mini countdown, a call-to-action link and a close button that collapses smoothly.',
    specs: ['Seamless text ticker (pause on hover)', 'Live countdown to data-end (defaults to 3 days from page load)', 'Dismiss button collapses the bar with a height animation', 'On phones the countdown hides and text stays readable'],
    shared: ['pro'],
    html: `<div class="bk-p bk-an" id="announce" data-end="">
  <div class="bk-an__in">
    <div class="bk-an__tick"><div class="bk-an__tr"><span>Festival offer: flat 25% off on all services</span><span>Free consultation for new customers</span><span>Book before Sunday and save more</span></div></div>
    <div class="bk-an__cd" aria-label="Offer ends in"><b data-u="d">0</b><small>d</small><b data-u="h">00</b><small>h</small><b data-u="m">00</b><small>m</small><b data-u="s">00</b><small>s</small></div>
    <a class="bk-an__cta" href="#contact">Claim offer ${AR}</a>
    <button class="bk-an__x" type="button" aria-label="Close announcement">&times;</button>
  </div>
</div>`,
    css: `.bk-an{position:relative;z-index:70;overflow:hidden;max-height:80px;background:linear-gradient(90deg,var(--bk-a-d),var(--bk-a),var(--bk-a2),var(--bk-a));background-size:300% 100%;animation:bk-an-bg 12s linear infinite;color:#fff;font-size:14px;transition:max-height .6s var(--bk-ease),opacity .4s}
@keyframes bk-an-bg{to{background-position:300% 0}}
.bk-an.is-gone{max-height:0;opacity:0}
.bk-an__in{display:flex;align-items:center;gap:clamp(12px,2vw,28px);max-width:1400px;margin:0 auto;padding:10px clamp(14px,3vw,32px)}
.bk-an__tick{flex:1;min-width:0;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent);mask-image:linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)}
.bk-an__tr{display:flex;width:max-content;animation:bk-an-tick 30s linear infinite}
.bk-an__tick:hover .bk-an__tr{animation-play-state:paused}
.bk-an__tr span{padding:0 36px;font-weight:600;white-space:nowrap}
.bk-an__tr span::before{content:"\\2726";margin-right:36px;opacity:.7}
@keyframes bk-an-tick{to{transform:translateX(-50%)}}
.bk-an__cd{display:flex;align-items:baseline;gap:3px;font-variant-numeric:tabular-nums}
.bk-an__cd b{padding:3px 7px;margin-left:5px;border-radius:7px;background:rgba(0,0,0,.25);font-size:14px}
.bk-an__cd small{opacity:.8}
.bk-an__cta{display:inline-flex;gap:6px;color:#fff;font-weight:700;text-decoration:none;white-space:nowrap;border-bottom:1.5px solid rgba(255,255,255,.6);padding-bottom:1px;transition:border-color .3s}
.bk-an__cta:hover{border-color:#fff}
.bk-an__cta:hover .bk-pbtn__ar{transform:translateX(5px)}
.bk-an__x{display:grid;place-items:center;flex:none;width:30px;height:30px;padding:0;border:0;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;font-size:20px;line-height:1;cursor:pointer;transition:background .3s,transform .5s var(--bk-ease)}
.bk-an__x:hover{background:rgba(255,255,255,.34);transform:rotate(90deg)}
@media (max-width:760px){.bk-an__cd{display:none}.bk-an__cta{display:none}}`,
    js: `document.querySelectorAll('.bk-an').forEach(function (bar) {
  var tr = bar.querySelector('.bk-an__tr');
  if (!tr.getAttribute('data-cloned')) {
    tr.setAttribute('data-cloned', '1');
    var kids = [].slice.call(tr.children);
    kids.forEach(function (k) { tr.appendChild(k.cloneNode(true)); });
    kids.forEach(function (k) { tr.appendChild(k.cloneNode(true)); });
    kids.forEach(function (k) { tr.appendChild(k.cloneNode(true)); });
  }
  bar.querySelector('.bk-an__x').addEventListener('click', function () { bar.classList.add('is-gone'); });
  var end = Date.parse(bar.getAttribute('data-end') || '');
  if (!end) end = Date.now() + 3 * 24 * 3600 * 1000;
  var u = {};
  ['d', 'h', 'm', 's'].forEach(function (k) { u[k] = bar.querySelector('[data-u=' + k + ']'); });
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function tick() {
    var left = Math.max(0, end - Date.now());
    var s = Math.floor(left / 1000);
    u.d.textContent = Math.floor(s / 86400);
    u.h.textContent = pad(Math.floor(s % 86400 / 3600));
    u.m.textContent = pad(Math.floor(s % 3600 / 60));
    u.s.textContent = pad(s % 60);
  }
  tick(); setInterval(tick, 1000);
});`,
  },
  {
    id: 'pro-dock', category: 'Pro Navbar', name: 'Floating dock navigation (magnify)',
    description: 'A glass dock fixed at the bottom of the screen. Icons grow as the pointer comes near (macOS style), show tooltips and highlight the current section. On phones it becomes a tab bar.',
    specs: ['Distance-based magnification (JS, hover devices only)', 'Tooltips, active dot follows scroll-spy', 'Fixed position: bottom-centre; on phones full-width tab bar', 'Links are normal anchors (#home, #services ...), keyboard friendly'],
    shared: ['pro'],
    html: `<nav class="bk-p bk-dk" aria-label="Quick navigation">
  <a class="is-on" href="#home" data-tip="Home">${I_HOME}</a>
  <a href="#services" data-tip="Services">${I_GRID}</a>
  <a href="#team" data-tip="Team">${I_USERS}</a>
  <a href="#pricing" data-tip="Pricing">${IC.chart}</a>
  <a href="#contact" data-tip="Contact">${I_MAIL}</a>
</nav>`,
    css: `.bk-dk{position:fixed;left:50%;bottom:20px;z-index:120;display:flex;align-items:flex-end;gap:10px;padding:10px 14px;border-radius:26px;background:rgba(255,255,255,.72);-webkit-backdrop-filter:blur(18px) saturate(1.6);backdrop-filter:blur(18px) saturate(1.6);border:1px solid rgba(255,255,255,.7);box-shadow:0 24px 60px -20px rgba(11,18,32,.5);transform:translateX(-50%)}
.bk-dk a{--s:1;position:relative;display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:#fff;color:var(--bk-ink);box-shadow:0 6px 16px -8px rgba(11,18,32,.4);transform:scale(var(--s));transform-origin:bottom center;transition:transform .18s ease-out,background .3s,color .3s}
.bk-dk a svg{width:24px;height:24px}
.bk-dk a:hover,.bk-dk a:focus-visible{background:var(--bk-a);color:#fff;outline:0}
.bk-dk a::before{content:attr(data-tip);position:absolute;bottom:calc(100% + 12px);left:50%;padding:5px 12px;border-radius:9px;background:var(--bk-ink);color:#fff;font-size:12.5px;font-weight:600;white-space:nowrap;opacity:0;transform:translate(-50%,6px);pointer-events:none;transition:opacity .25s,transform .35s var(--bk-ease)}
.bk-dk a:hover::before,.bk-dk a:focus-visible::before{opacity:1;transform:translate(-50%,0)}
.bk-dk a.is-on::after{content:"";position:absolute;bottom:-9px;left:50%;width:5px;height:5px;margin-left:-2.5px;border-radius:50%;background:var(--bk-a)}
.bk-dk a.is-on{color:var(--bk-a)}
.bk-dk a.is-on:hover{color:#fff}
@media (max-width:640px){.bk-dk{left:0;right:0;bottom:0;transform:none;justify-content:space-around;gap:0;padding:8px 10px calc(8px + env(safe-area-inset-bottom));border-radius:22px 22px 0 0;border-left:0;border-right:0;border-bottom:0}.bk-dk a{width:100%;max-width:64px;height:48px;background:transparent;box-shadow:none;transform:none!important}.bk-dk a.is-on{background:var(--bk-a-l)}.bk-dk a::before{display:none}.bk-dk a.is-on::after{bottom:3px}}`,
    js: `document.querySelectorAll('.bk-dk').forEach(function (dock) {
  var items = [].slice.call(dock.querySelectorAll('a'));
  var hover = window.matchMedia && window.matchMedia('(hover:hover) and (min-width:641px)').matches;
  if (hover) {
    dock.addEventListener('pointermove', function (e) {
      items.forEach(function (a) {
        var r = a.getBoundingClientRect();
        var d = Math.abs(e.clientX - (r.left + r.width / 2));
        var s = 1 + Math.max(0, 1 - d / 120) * 0.65;
        a.style.setProperty('--s', s.toFixed(3));
      });
    });
    dock.addEventListener('pointerleave', function () { items.forEach(function (a) { a.style.setProperty('--s', 1); }); });
  }
  var targets = items.map(function (a) {
    var h = a.getAttribute('href');
    try { return h && h.length > 1 ? document.querySelector(h) : null; } catch (err) { return null; }
  });
  function spy() {
    var cur = 0;
    targets.forEach(function (t, i) { if (t && t.getBoundingClientRect().top <= window.innerHeight * 0.4) cur = i; });
    items.forEach(function (a, i) { a.classList.toggle('is-on', i === cur); });
  }
  window.addEventListener('scroll', spy, { passive: true }); spy();
});`,
  },

  // ============================== HEALTHCARE ==============================
  {
    id: 'pro-doctors', category: 'Pro Cards', name: 'Doctors carousel with availability',
    description: 'Scroll-snap doctor cards: photo turns colour on hover, availability dot, specialty chip, experience, rating and a Book button that slides in.',
    specs: ['Scroll-snap carousel with arrows, drag and keyboard', '3 / 2 / 1 cards visible by breakpoint', 'Pulsing green "Available today" dot, grey for unavailable', 'Grayscale -> colour photo, card lift, Book button slide-up', 'Edit text only: swap the picsum photos for real doctors'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-dr" id="team">
  <div class="bk-pw"><div class="bk-dr__top bk-rv"><div><span class="bk-pey">Our specialists</span><h2>Meet our doctors</h2></div><div class="bk-dr__btns"><button class="bk-dr__p" type="button" aria-label="Previous">&larr;</button><button class="bk-dr__n" type="button" aria-label="Next">&rarr;</button></div></div></div>
  <div class="bk-dr__track" tabindex="0" aria-label="Doctors">
    <article class="bk-dr__card"><div class="bk-dr__pic"><img src="${img('bk-dr1', 520, 560)}" alt="Dr. Arjun Menon" loading="lazy"><span class="bk-dr__av is-on">Available today</span><a class="bk-dr__book" href="#booking">Book appointment</a></div><div class="bk-dr__body"><em>${I_STETH}Cardiology</em><h3>Dr. Arjun Menon</h3><p>MD, DM &middot; 18 years experience</p><div class="bk-dr__meta"><span>${IC.star}4.9</span><span>2,300+ patients</span></div></div></article>
    <article class="bk-dr__card"><div class="bk-dr__pic"><img src="${img('bk-dr2', 520, 560)}" alt="Dr. Kavya Reddy" loading="lazy"><span class="bk-dr__av is-on">Available today</span><a class="bk-dr__book" href="#booking">Book appointment</a></div><div class="bk-dr__body"><em>${I_BABY}Pediatrics</em><h3>Dr. Kavya Reddy</h3><p>MD &middot; 12 years experience</p><div class="bk-dr__meta"><span>${IC.star}4.8</span><span>3,100+ patients</span></div></div></article>
    <article class="bk-dr__card"><div class="bk-dr__pic"><img src="${img('bk-dr3', 520, 560)}" alt="Dr. Imran Sheikh" loading="lazy"><span class="bk-dr__av">Tomorrow</span><a class="bk-dr__book" href="#booking">Book appointment</a></div><div class="bk-dr__body"><em>${I_BONE}Orthopedics</em><h3>Dr. Imran Sheikh</h3><p>MS Ortho &middot; 15 years experience</p><div class="bk-dr__meta"><span>${IC.star}4.9</span><span>1,800+ patients</span></div></div></article>
    <article class="bk-dr__card"><div class="bk-dr__pic"><img src="${img('bk-dr4', 520, 560)}" alt="Dr. Lakshmi Nair" loading="lazy"><span class="bk-dr__av is-on">Available today</span><a class="bk-dr__book" href="#booking">Book appointment</a></div><div class="bk-dr__body"><em>${I_BRAIN}Neurology</em><h3>Dr. Lakshmi Nair</h3><p>DM Neuro &middot; 20 years experience</p><div class="bk-dr__meta"><span>${IC.star}5.0</span><span>1,500+ patients</span></div></div></article>
    <article class="bk-dr__card"><div class="bk-dr__pic"><img src="${img('bk-dr5', 520, 560)}" alt="Dr. Rohit Verma" loading="lazy"><span class="bk-dr__av">Mon, 10 AM</span><a class="bk-dr__book" href="#booking">Book appointment</a></div><div class="bk-dr__body"><em>${I_STETH}General medicine</em><h3>Dr. Rohit Verma</h3><p>MBBS, MD &middot; 10 years experience</p><div class="bk-dr__meta"><span>${IC.star}4.7</span><span>4,000+ patients</span></div></div></article>
  </div>
</section>`,
    css: `.bk-dr{background:var(--bk-soft);overflow:hidden}
.bk-dr__top{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:clamp(26px,4vw,46px)}
.bk-dr__top h2{margin-top:14px;font-size:clamp(30px,4.4vw,52px)}
.bk-dr__btns{display:flex;gap:10px}
.bk-dr__btns button{display:grid;place-items:center;width:52px;height:52px;border:1px solid var(--bk-line);border-radius:50%;background:#fff;color:var(--bk-ink);font-size:20px;cursor:pointer;transition:background .3s,color .3s,transform .4s var(--bk-ease)}
.bk-dr__btns button:hover{background:var(--bk-a);border-color:var(--bk-a);color:#fff;transform:scale(1.08)}
.bk-dr__track{display:flex;gap:clamp(14px,2vw,26px);overflow-x:auto;scroll-snap-type:x mandatory;padding:10px max(clamp(18px,4vw,40px),calc((100vw - 1240px) / 2 + clamp(18px,4vw,40px))) 34px;scrollbar-width:none;cursor:grab;outline:0}
.bk-dr__track::-webkit-scrollbar{display:none}
.bk-dr__track.is-drag{cursor:grabbing;scroll-snap-type:none;user-select:none}
.bk-dr__card{flex:0 0 calc((100% - 2 * clamp(14px,2vw,26px)) / 3 - 40px);min-width:280px;scroll-snap-align:start;overflow:hidden;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t) var(--bk-ease)}
.bk-dr__card:hover{transform:translateY(var(--bk-lift));box-shadow:0 36px 60px -28px rgba(11,18,32,.45)}
.bk-dr__pic{position:relative;overflow:hidden;aspect-ratio:1/1.04}
.bk-dr__pic img{width:100%;height:100%;object-fit:cover;filter:grayscale(.9);transition:filter .6s,transform 1.1s var(--bk-ease)}
.bk-dr__card:hover .bk-dr__pic img{filter:none;transform:scale(1.06)}
.bk-dr__av{position:absolute;left:14px;top:14px;display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:999px;background:rgba(255,255,255,.94);font-size:12.5px;font-weight:700;color:var(--bk-mut)}
.bk-dr__av::before{content:"";width:8px;height:8px;border-radius:50%;background:#94a3b8}
.bk-dr__av.is-on{color:#15803d}
.bk-dr__av.is-on::before{background:#16a34a;box-shadow:0 0 0 0 rgba(22,163,74,.6);animation:bk-dr-live 1.8s infinite}
@keyframes bk-dr-live{70%{box-shadow:0 0 0 9px rgba(22,163,74,0)}100%{box-shadow:0 0 0 0 rgba(22,163,74,0)}}
.bk-dr__book{position:absolute;left:14px;right:14px;bottom:14px;padding:14px;border-radius:14px;background:var(--bk-a);color:#fff;font-weight:700;text-align:center;text-decoration:none;transform:translateY(calc(100% + 20px));transition:transform .6s var(--bk-ease),background .3s}
.bk-dr__card:hover .bk-dr__book,.bk-dr__book:focus-visible{transform:none}
.bk-dr__book:hover{background:var(--bk-a-d)}
@media (hover:none){.bk-dr__book{transform:none}.bk-dr__pic img{filter:none}}
.bk-dr__body{padding:20px 22px 24px}
.bk-dr__body em{display:inline-flex;align-items:center;gap:8px;padding:5px 12px 5px 8px;border-radius:999px;background:var(--bk-a-l);color:var(--bk-a-d);font-size:13px;font-style:normal;font-weight:700}
.bk-dr__body em svg{width:18px;height:18px}
.bk-dr__body h3{margin:12px 0 4px;font-size:22px}
.bk-dr__body p{color:var(--bk-mut);font-size:14.5px}
.bk-dr__meta{display:flex;justify-content:space-between;margin-top:16px;padding-top:14px;border-top:1px solid var(--bk-line);font-size:14px;color:var(--bk-mut)}
.bk-dr__meta span:first-child{display:flex;align-items:center;gap:5px;font-weight:700;color:var(--bk-ink)}
.bk-dr__meta svg{width:16px;height:16px;color:#f5a524}
@media (max-width:1000px){.bk-dr__card{flex-basis:calc(50% - 30px)}}
@media (max-width:640px){.bk-dr__card{flex-basis:84%;min-width:0}}`,
    js: `document.querySelectorAll('.bk-dr').forEach(function (root) {
  var track = root.querySelector('.bk-dr__track');
  function step() { var c = track.querySelector('.bk-dr__card'); return c ? c.offsetWidth + 20 : 320; }
  root.querySelector('.bk-dr__p').addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: 'smooth' }); });
  root.querySelector('.bk-dr__n').addEventListener('click', function () { track.scrollBy({ left: step(), behavior: 'smooth' }); });
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') track.scrollBy({ left: step(), behavior: 'smooth' });
    if (e.key === 'ArrowLeft') track.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  var down = false, sx = 0, sl = 0;
  track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = track.scrollLeft; });
  window.addEventListener('pointermove', function (e) { if (!down) return; track.classList.add('is-drag'); track.scrollLeft = sl - (e.clientX - sx); });
  window.addEventListener('pointerup', function () { if (!down) return; down = false; track.classList.remove('is-drag'); });
});`,
  },
  {
    id: 'pro-departments', category: 'Pro Sections', name: 'Departments: vertical tabs + detail panel',
    description: 'Left list of departments with icons, right panel with photo, description, service chips and a button. Changes with a smooth slide. Great for hospitals and colleges.',
    specs: ['ARIA tabs with arrow-key navigation (Up/Down on desktop)', 'Active tab has a sliding accent bar and filled icon', 'Panel image + text animate in on change', 'Under 860px the list becomes horizontally scrollable chips'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-dp" id="services">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Departments</span><h2>Complete care under one roof</h2><p>Choose a department to see the services we offer.</p></div>
    <div class="bk-dp__grid bk-rv" style="--i:1">
      <div class="bk-dp__list" role="tablist" aria-label="Departments">
        <button class="is-on" type="button" role="tab">${I_STETH}<b>General medicine<small>Check-ups &amp; treatment</small></b></button>
        <button type="button" role="tab">${IC.heart}<b>Cardiology<small>Heart &amp; vascular care</small></b></button>
        <button type="button" role="tab">${I_BONE}<b>Orthopedics<small>Bones, joints &amp; spine</small></b></button>
        <button type="button" role="tab">${I_BRAIN}<b>Neurology<small>Brain &amp; nerves</small></b></button>
        <button type="button" role="tab">${I_BABY}<b>Pediatrics<small>Care for children</small></b></button>
      </div>
      <div class="bk-dp__panels">
        <div class="bk-dp__panel is-on" role="tabpanel"><img src="${img('bk-dp1', 760, 460)}" alt="General medicine" loading="lazy"><div><h3>General medicine</h3><p>Primary care for the whole family: routine check-ups, fevers, infections, diabetes and blood pressure management with clear follow-up plans.</p><ul><li>Health screening</li><li>Diabetes care</li><li>Vaccination</li><li>Lab tests</li></ul><a class="bk-pbtn" href="#booking">Book a visit ${AR}</a></div></div>
        <div class="bk-dp__panel" role="tabpanel" hidden><img src="${img('bk-dp2', 760, 460)}" alt="Cardiology" loading="lazy"><div><h3>Cardiology</h3><p>Prevention, diagnosis and treatment of heart conditions using modern imaging and a dedicated cardiac care unit.</p><ul><li>ECG &amp; Echo</li><li>Stress test</li><li>Angioplasty</li><li>Heart rehab</li></ul><a class="bk-pbtn" href="#booking">Book a visit ${AR}</a></div></div>
        <div class="bk-dp__panel" role="tabpanel" hidden><img src="${img('bk-dp3', 760, 460)}" alt="Orthopedics" loading="lazy"><div><h3>Orthopedics</h3><p>From sports injuries to joint replacement, our team helps you get moving again with minimally invasive options.</p><ul><li>Joint replacement</li><li>Sports injury</li><li>Spine care</li><li>Physiotherapy</li></ul><a class="bk-pbtn" href="#booking">Book a visit ${AR}</a></div></div>
        <div class="bk-dp__panel" role="tabpanel" hidden><img src="${img('bk-dp4', 760, 460)}" alt="Neurology" loading="lazy"><div><h3>Neurology</h3><p>Expert evaluation of headaches, seizures, stroke and movement disorders with advanced diagnostics.</p><ul><li>EEG &amp; EMG</li><li>Stroke care</li><li>Epilepsy clinic</li><li>Migraine clinic</li></ul><a class="bk-pbtn" href="#booking">Book a visit ${AR}</a></div></div>
        <div class="bk-dp__panel" role="tabpanel" hidden><img src="${img('bk-dp5', 760, 460)}" alt="Pediatrics" loading="lazy"><div><h3>Pediatrics</h3><p>Gentle, child-friendly care from newborns to teenagers, with a play area to keep little patients relaxed.</p><ul><li>Newborn care</li><li>Vaccinations</li><li>Growth checks</li><li>Child nutrition</li></ul><a class="bk-pbtn" href="#booking">Book a visit ${AR}</a></div></div>
      </div>
    </div>
  </div>
</section>`,
    css: `.bk-dp{background:#fff}
.bk-dp__grid{display:grid;grid-template-columns:.8fr 1.4fr;gap:clamp(18px,3vw,40px);align-items:start}
.bk-dp__list{position:relative;display:grid;gap:10px}
.bk-dp__list button{position:relative;display:flex;align-items:center;gap:16px;padding:16px 18px;border:1.5px solid var(--bk-line);border-radius:20px;background:#fff;color:var(--bk-ink);font-family:inherit;text-align:left;cursor:pointer;transition:border-color .3s,background .3s,transform .5s var(--bk-ease),box-shadow .4s}
.bk-dp__list button>svg{flex:none;width:46px;height:46px;padding:11px;border-radius:14px;background:var(--bk-a-l);color:var(--bk-a);transition:background .3s,color .3s,transform .5s var(--bk-ease)}
.bk-dp__list b{display:block;font-size:17px}
.bk-dp__list small{display:block;font-weight:400;font-size:13.5px;color:var(--bk-mut)}
.bk-dp__list button:hover{transform:translateX(6px);border-color:var(--bk-a-m)}
.bk-dp__list button.is-on{border-color:var(--bk-a);background:var(--bk-a-l);box-shadow:0 16px 30px -20px var(--bk-a)}
.bk-dp__list button.is-on>svg{background:var(--bk-a);color:#fff;transform:rotate(-6deg) scale(1.06)}
.bk-dp__list button:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:2px}
.bk-dp__panel{display:grid;overflow:hidden;border-radius:calc(var(--bk-r) + 4px);background:var(--bk-soft);border:1px solid var(--bk-line)}
.bk-dp__panel[hidden]{display:none}
.bk-dp__panel.is-on{animation:bk-dp-in .7s var(--bk-ease)}
@keyframes bk-dp-in{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:none}}
.bk-dp__panel img{width:100%;aspect-ratio:760/400;object-fit:cover}
.bk-dp__panel>div{padding:clamp(22px,3vw,38px)}
.bk-dp__panel h3{margin-bottom:10px;font-size:clamp(24px,2.6vw,32px)}
.bk-dp__panel p{margin-bottom:18px;color:var(--bk-mut)}
.bk-dp__panel ul{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 24px;padding:0;list-style:none}
.bk-dp__panel li{padding:8px 16px;border-radius:999px;background:#fff;border:1px solid var(--bk-line);font-size:14px;font-weight:600;transition:background .3s,color .3s,transform .4s var(--bk-ease)}
.bk-dp__panel li:hover{background:var(--bk-a);color:#fff;transform:translateY(-3px)}
@media (max-width:860px){.bk-dp__grid{grid-template-columns:1fr}.bk-dp__list{display:flex;overflow-x:auto;gap:10px;padding:4px 2px 10px;scrollbar-width:none}.bk-dp__list::-webkit-scrollbar{display:none}.bk-dp__list button{flex:none;padding:10px 16px 10px 10px}.bk-dp__list small{display:none}.bk-dp__list button>svg{width:38px;height:38px;padding:9px}}`,
    js: `document.querySelectorAll('.bk-dp__grid').forEach(function (root) {
  var tabs = [].slice.call(root.querySelectorAll('[role=tab]'));
  var panels = [].slice.call(root.querySelectorAll('.bk-dp__panel'));
  function pick(i, focus) {
    tabs.forEach(function (t, k) {
      t.classList.toggle('is-on', k === i);
      t.setAttribute('aria-selected', k === i ? 'true' : 'false');
      t.tabIndex = k === i ? 0 : -1;
      panels[k].hidden = k !== i;
      panels[k].classList.toggle('is-on', k === i);
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { pick(i); });
    t.addEventListener('keydown', function (e) {
      var n = tabs.length, k = -1;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') k = (i + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') k = (i - 1 + n) % n;
      if (k > -1) { e.preventDefault(); pick(k, true); }
    });
  });
  pick(0);
});`,
  },
  {
    id: 'pro-hours-map', category: 'Pro Sections', name: 'Opening hours + live open/closed + map',
    description: 'Hours table that highlights today and shows an Open now / Closed badge from the visitor\'s clock, next to a stylised map card with a pulsing pin and directions button.',
    specs: ['Today row highlighted automatically (JS Date)', 'Open / Closed pill computed from data-open / data-close (24h) on each row', 'Map is a CSS illustration; replace .bk-hm__map with a Google Maps iframe when ready', 'Two columns -> stacked under 860px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-hm" id="contact">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Visit us</span><h2>Opening hours &amp; location</h2></div>
    <div class="bk-hm__grid">
      <div class="bk-hm__card bk-rv bk-rv--l">
        <div class="bk-hm__st"><span class="bk-hm__pill">Checking...</span><small>Local time <b class="bk-hm__clock">--:--</b></small></div>
        <table class="bk-hm__t"><tbody>
          <tr data-d="1" data-open="9" data-close="18"><th>Monday</th><td>9:00 AM - 6:00 PM</td></tr>
          <tr data-d="2" data-open="9" data-close="18"><th>Tuesday</th><td>9:00 AM - 6:00 PM</td></tr>
          <tr data-d="3" data-open="9" data-close="18"><th>Wednesday</th><td>9:00 AM - 6:00 PM</td></tr>
          <tr data-d="4" data-open="9" data-close="18"><th>Thursday</th><td>9:00 AM - 6:00 PM</td></tr>
          <tr data-d="5" data-open="9" data-close="18"><th>Friday</th><td>9:00 AM - 6:00 PM</td></tr>
          <tr data-d="6" data-open="9" data-close="14"><th>Saturday</th><td>9:00 AM - 2:00 PM</td></tr>
          <tr data-d="0"><th>Sunday</th><td>Closed</td></tr>
        </tbody></table>
        <p class="bk-hm__em">${IC.phone}<span>Emergency 24/7: <a href="#">+91 00000 00000</a></span></p>
      </div>
      <div class="bk-hm__mapwrap bk-rv bk-rv--r" style="--i:1">
        <div class="bk-hm__map" aria-hidden="true"><i class="bk-hm__rd bk-hm__rd--1"></i><i class="bk-hm__rd bk-hm__rd--2"></i><i class="bk-hm__rd bk-hm__rd--3"></i><i class="bk-hm__pk"></i><span class="bk-hm__pin"><svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12zm0-9a3 3 0 110-6 3 3 0 010 6z"/></svg></span></div>
        <div class="bk-hm__addr"><div><h3>Main hospital</h3><p>Street name, Area, City - 000000</p></div><a class="bk-pbtn" href="#">Get directions ${AR}</a></div>
      </div>
    </div>
  </div>
</section>`,
    css: `.bk-hm{background:var(--bk-soft);overflow-x:clip}
.bk-hm__grid{display:grid;grid-template-columns:1fr 1.1fr;gap:clamp(16px,2.4vw,32px);align-items:stretch}
.bk-hm__card{padding:clamp(22px,3vw,38px);border-radius:calc(var(--bk-r) + 4px);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh)}
.bk-hm__st{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:18px}
.bk-hm__pill{display:inline-flex;align-items:center;gap:9px;padding:8px 16px;border-radius:999px;background:var(--bk-line);font-size:14px;font-weight:800;color:var(--bk-mut)}
.bk-hm__pill::before{content:"";width:9px;height:9px;border-radius:50%;background:currentColor}
.bk-hm__pill.is-open{background:#dcfce7;color:#15803d}
.bk-hm__pill.is-open::before{animation:bk-dr-live 1.8s infinite;box-shadow:0 0 0 0 rgba(22,163,74,.6)}
.bk-hm__pill.is-closed{background:#fee2e2;color:#b91c1c}
.bk-hm__st small{color:var(--bk-mut)}
.bk-hm__t{width:100%;border-collapse:separate;border-spacing:0 6px}
.bk-hm__t th,.bk-hm__t td{padding:13px 18px;text-align:left;font-size:15.5px;background:var(--bk-soft);transition:background .3s,color .3s,transform .4s var(--bk-ease)}
.bk-hm__t th{border-radius:14px 0 0 14px;font-weight:700}
.bk-hm__t td{border-radius:0 14px 14px 0;text-align:right;color:var(--bk-mut)}
.bk-hm__t tr:hover th,.bk-hm__t tr:hover td{background:var(--bk-a-l)}
.bk-hm__t tr.is-today th,.bk-hm__t tr.is-today td{background:var(--bk-a);color:#fff}
.bk-hm__t tr.is-today th::after{content:"Today";margin-left:10px;padding:2px 9px;border-radius:999px;background:rgba(255,255,255,.22);font-size:11.5px}
.bk-hm__em{display:flex;align-items:center;gap:12px;margin-top:14px;padding:14px 18px;border-radius:16px;background:#fee2e2;color:#b91c1c;font-weight:600}
.bk-hm__em svg{flex:none}
.bk-hm__em a{color:inherit}
.bk-hm__mapwrap{display:flex;flex-direction:column;overflow:hidden;border-radius:calc(var(--bk-r) + 4px);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh)}
.bk-hm__map{position:relative;flex:1;min-height:320px;overflow:hidden;background:linear-gradient(135deg,var(--bk-a-l),#e8f1e4);background-image:linear-gradient(rgba(255,255,255,.55) 2px,transparent 2px),linear-gradient(90deg,rgba(255,255,255,.55) 2px,transparent 2px);background-size:44px 44px}
.bk-hm__rd{position:absolute;background:#fff;box-shadow:0 0 0 2px rgba(11,18,32,.04)}
.bk-hm__rd--1{left:-5%;right:-5%;top:46%;height:26px;transform:rotate(-8deg)}
.bk-hm__rd--2{top:-5%;bottom:-5%;left:38%;width:22px;transform:rotate(14deg)}
.bk-hm__rd--3{left:50%;right:-5%;top:20%;height:16px;transform:rotate(22deg)}
.bk-hm__pk{position:absolute;left:8%;bottom:10%;width:120px;height:80px;border-radius:24px;background:#bfe3b4;opacity:.8}
.bk-hm__pin{position:absolute;left:46%;top:36%;color:var(--bk-a);filter:drop-shadow(0 10px 8px rgba(11,18,32,.3));animation:bk-hm-drop 2.4s ease-in-out infinite}
.bk-hm__pin::after{content:"";position:absolute;left:50%;bottom:-8px;width:44px;height:14px;margin-left:-22px;border-radius:50%;background:rgba(11,18,32,.25);z-index:-1;animation:bk-hm-shadow 2.4s ease-in-out infinite}
@keyframes bk-hm-drop{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
@keyframes bk-hm-shadow{0%,100%{transform:scale(1);opacity:.5}50%{transform:scale(.7);opacity:.25}}
.bk-hm__addr{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:14px;padding:20px 24px}
.bk-hm__addr h3{font-size:20px}
.bk-hm__addr p{color:var(--bk-mut);font-size:14.5px}
@media (max-width:860px){.bk-hm__grid{grid-template-columns:1fr}.bk-hm__map{min-height:260px}}`,
    js: `document.querySelectorAll('.bk-hm').forEach(function (root) {
  var pill = root.querySelector('.bk-hm__pill');
  var clock = root.querySelector('.bk-hm__clock');
  var rows = [].slice.call(root.querySelectorAll('tr[data-d]'));
  function update() {
    var now = new Date();
    var day = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    clock.textContent = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2);
    var open = false;
    rows.forEach(function (r) {
      var today = parseInt(r.getAttribute('data-d'), 10) === day;
      r.classList.toggle('is-today', today);
      if (today && r.hasAttribute('data-open')) open = h >= parseFloat(r.getAttribute('data-open')) && h < parseFloat(r.getAttribute('data-close'));
    });
    pill.textContent = open ? 'Open now' : 'Closed now';
    pill.className = 'bk-hm__pill ' + (open ? 'is-open' : 'is-closed');
  }
  update(); setInterval(update, 30000);
});`,
  },

  // ============================== HR ==============================
  {
    id: 'pro-jobs', category: 'Pro Sections', name: 'Job board: search + filter chips',
    description: 'Careers section with live search, department chips, a result counter and animated job rows with salary, location and an Apply button. Built for HR and recruiting sites.',
    specs: ['Live filter by text + department (data-dept), fade-out of non-matches', 'Result counter and friendly empty state', 'Rows slide an accent bar and the Apply arrow on hover', 'Edit jobs by copying one <article> row', 'Rows stack under 700px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-jb" id="careers">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">We are hiring</span><h2>Join our growing team</h2><p>Find a role where your work really matters.</p></div>
    <div class="bk-jb__tools bk-rv" style="--i:1">
      <label class="bk-jb__s">${I_SEARCH}<input type="search" placeholder="Search roles, skills or location" aria-label="Search jobs"></label>
      <div class="bk-jb__chips"><button class="is-on" type="button" data-f="all">All</button><button type="button" data-f="eng">Engineering</button><button type="button" data-f="design">Design</button><button type="button" data-f="mkt">Marketing</button><button type="button" data-f="hr">People &amp; HR</button></div>
    </div>
    <p class="bk-jb__count" role="status" aria-live="polite"></p>
    <div class="bk-jb__list">
      <article class="bk-jb__row" data-dept="eng"><div class="bk-jb__ic">${I_BRIEF}</div><div class="bk-jb__main"><h3>Senior Full-stack Engineer</h3><p><span>Engineering</span><span>${I_PIN}Chennai</span><span>Full-time</span></p></div><div class="bk-jb__pay">$40k - $60k</div><a class="bk-pbtn bk-pbtn--ghost" href="#">Apply ${AR}</a></article>
      <article class="bk-jb__row" data-dept="design"><div class="bk-jb__ic">${I_BRIEF}</div><div class="bk-jb__main"><h3>Product Designer (UI/UX)</h3><p><span>Design</span><span>${I_PIN}Remote</span><span>Full-time</span></p></div><div class="bk-jb__pay">$30k - $45k</div><a class="bk-pbtn bk-pbtn--ghost" href="#">Apply ${AR}</a></article>
      <article class="bk-jb__row" data-dept="mkt"><div class="bk-jb__ic">${I_BRIEF}</div><div class="bk-jb__main"><h3>Performance Marketing Manager</h3><p><span>Marketing</span><span>${I_PIN}Bengaluru</span><span>Full-time</span></p></div><div class="bk-jb__pay">$28k - $42k</div><a class="bk-pbtn bk-pbtn--ghost" href="#">Apply ${AR}</a></article>
      <article class="bk-jb__row" data-dept="hr"><div class="bk-jb__ic">${I_BRIEF}</div><div class="bk-jb__main"><h3>Talent Acquisition Specialist</h3><p><span>People &amp; HR</span><span>${I_PIN}Chennai</span><span>Full-time</span></p></div><div class="bk-jb__pay">$20k - $30k</div><a class="bk-pbtn bk-pbtn--ghost" href="#">Apply ${AR}</a></article>
      <article class="bk-jb__row" data-dept="eng"><div class="bk-jb__ic">${I_BRIEF}</div><div class="bk-jb__main"><h3>React Native Developer</h3><p><span>Engineering</span><span>${I_PIN}Remote</span><span>Contract</span></p></div><div class="bk-jb__pay">$25k - $40k</div><a class="bk-pbtn bk-pbtn--ghost" href="#">Apply ${AR}</a></article>
      <article class="bk-jb__row" data-dept="design"><div class="bk-jb__ic">${I_BRIEF}</div><div class="bk-jb__main"><h3>Brand &amp; Motion Designer</h3><p><span>Design</span><span>${I_PIN}Chennai</span><span>Part-time</span></p></div><div class="bk-jb__pay">$15k - $25k</div><a class="bk-pbtn bk-pbtn--ghost" href="#">Apply ${AR}</a></article>
    </div>
    <div class="bk-jb__empty" hidden><b>No roles match your search</b><span>Try a different word or clear the filters.</span></div>
  </div>
</section>`,
    css: `.bk-jb{background:#fff}
.bk-jb__tools{display:grid;gap:16px;margin-bottom:12px}
.bk-jb__s{position:relative;display:block;max-width:560px;margin:0 auto;width:100%}
.bk-jb__s svg{position:absolute;left:18px;top:50%;margin-top:-10px;color:var(--bk-mut)}
.bk-jb__s input{width:100%;padding:16px 18px 16px 50px;border:1.5px solid var(--bk-line);border-radius:999px;background:var(--bk-soft);color:var(--bk-ink);font-family:inherit;font-size:16px;transition:border-color .3s,box-shadow .3s,background .3s}
.bk-jb__s input:focus{outline:0;border-color:var(--bk-a);background:#fff;box-shadow:0 0 0 5px var(--bk-a-l)}
.bk-jb__chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.bk-jb__chips button{padding:10px 20px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-mut);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-jb__chips button:hover{transform:translateY(-3px);color:var(--bk-a);border-color:var(--bk-a-m)}
.bk-jb__chips button.is-on{background:var(--bk-a);border-color:var(--bk-a);color:#fff}
.bk-jb__count{margin:20px 0 14px;font-size:14px;font-weight:600;color:var(--bk-mut)}
.bk-jb__list{display:grid;gap:12px}
.bk-jb__row{position:relative;overflow:hidden;display:grid;grid-template-columns:auto 1fr auto auto;align-items:center;gap:clamp(14px,2vw,28px);padding:clamp(16px,2vw,24px);border:1px solid var(--bk-line);border-radius:var(--bk-r);background:#fff;transition:opacity .35s,transform .45s var(--bk-ease),box-shadow .4s,border-color .3s}
.bk-jb__row::before{content:"";position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--bk-a);transform:scaleY(0);transform-origin:top;transition:transform .5s var(--bk-ease)}
.bk-jb__row:hover{transform:translateX(6px);border-color:var(--bk-a-m);box-shadow:var(--bk-sh)}
.bk-jb__row:hover::before{transform:scaleY(1)}
.bk-jb__row.is-fade{opacity:0;transform:scale(.97)}
.bk-jb__row.is-off{display:none}
.bk-jb__ic{display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:var(--bk-a-l);color:var(--bk-a);transition:background .3s,color .3s,transform .5s var(--bk-ease)}
.bk-jb__row:hover .bk-jb__ic{background:var(--bk-a);color:#fff;transform:rotate(-8deg)}
.bk-jb__main h3{font-size:clamp(17px,1.8vw,21px);margin-bottom:6px}
.bk-jb__main p{display:flex;flex-wrap:wrap;gap:6px 18px;font-size:14px;color:var(--bk-mut)}
.bk-jb__main span{display:inline-flex;align-items:center;gap:5px}
.bk-jb__main svg{width:15px;height:15px}
.bk-jb__main span:first-child{padding:3px 11px;border-radius:999px;background:var(--bk-a-l);color:var(--bk-a-d);font-weight:700}
.bk-jb__pay{font-weight:800;font-size:17px;white-space:nowrap}
.bk-jb__row .bk-pbtn{padding:12px 22px}
.bk-jb__empty{margin-top:12px;padding:40px 20px;border:2px dashed var(--bk-line);border-radius:var(--bk-r);text-align:center;display:grid;gap:6px;color:var(--bk-mut)}
.bk-jb__empty[hidden]{display:none}
.bk-jb__empty b{font-size:20px;color:var(--bk-ink)}
@media (max-width:760px){.bk-jb__row{grid-template-columns:auto 1fr;grid-template-areas:"i m" "p p" "a a"}.bk-jb__ic{grid-area:i}.bk-jb__main{grid-area:m}.bk-jb__pay{grid-area:p}.bk-jb__row .bk-pbtn{grid-area:a;width:100%}}`,
    js: `document.querySelectorAll('.bk-jb').forEach(function (root) {
  var rows = [].slice.call(root.querySelectorAll('.bk-jb__row'));
  var chips = [].slice.call(root.querySelectorAll('.bk-jb__chips button'));
  var input = root.querySelector('.bk-jb__s input');
  var count = root.querySelector('.bk-jb__count');
  var empty = root.querySelector('.bk-jb__empty');
  var dept = 'all';
  function apply() {
    var q = input.value.trim().toLowerCase(), shown = 0;
    rows.forEach(function (r) {
      var ok = (dept === 'all' || r.getAttribute('data-dept') === dept) && (!q || r.textContent.toLowerCase().indexOf(q) > -1);
      if (ok) { shown++; r.classList.remove('is-off'); requestAnimationFrame(function () { r.classList.remove('is-fade'); }); }
      else { r.classList.add('is-fade'); setTimeout(function () { if (r.classList.contains('is-fade')) r.classList.add('is-off'); }, 300); }
    });
    count.textContent = shown + (shown === 1 ? ' open role' : ' open roles');
    empty.hidden = shown !== 0;
  }
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      dept = c.getAttribute('data-f');
      chips.forEach(function (x) { x.classList.toggle('is-on', x === c); });
      apply();
    });
  });
  input.addEventListener('input', apply);
  apply();
});`,
  },
  {
    id: 'pro-perks', category: 'Pro Cards', name: 'Perks / benefits grid (glow border)',
    description: 'Six benefit cards. On hover a bright light races around the card border while the icon lifts. Ideal for company culture, HR and service-feature sections.',
    specs: ['Rotating conic-gradient border revealed on hover (CSS only)', 'Icon tile lift + colour fill, number watermark', '3 columns -> 2 -> 1', 'Cards are keyboard focusable (tabindex 0) with the same glow'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-pk" id="benefits">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Why join us</span><h2>Benefits that make a difference</h2><p>We take care of our people, so they can do their best work.</p></div>
    <div class="bk-pk__grid">
      <article class="bk-pk__c bk-rv" style="--i:0" tabindex="0"><span class="bk-pk__n">01</span><i>${IC.heart}</i><h3>Health cover</h3><p>Full medical insurance for you and your family from day one.</p></article>
      <article class="bk-pk__c bk-rv" style="--i:1" tabindex="0"><span class="bk-pk__n">02</span><i>${IC.layers}</i><h3>Learning budget</h3><p>Courses, books and conferences, paid by us every year.</p></article>
      <article class="bk-pk__c bk-rv" style="--i:2" tabindex="0"><span class="bk-pk__n">03</span><i>${IC.globe}</i><h3>Flexible work</h3><p>Hybrid or remote. You choose where you do your best thinking.</p></article>
      <article class="bk-pk__c bk-rv" style="--i:3" tabindex="0"><span class="bk-pk__n">04</span><i>${IC.chart}</i><h3>Clear growth</h3><p>Transparent levels, regular reviews and real promotion paths.</p></article>
      <article class="bk-pk__c bk-rv" style="--i:4" tabindex="0"><span class="bk-pk__n">05</span><i>${IC.clock}</i><h3>Paid time off</h3><p>30 days of leave, plus festival holidays and a wellness week.</p></article>
      <article class="bk-pk__c bk-rv" style="--i:5" tabindex="0"><span class="bk-pk__n">06</span><i>${IC.bolt}</i><h3>Performance bonus</h3><p>Share in the success you help create, paid twice a year.</p></article>
    </div>
  </div>
</section>`,
    css: `.bk-pk{background:var(--bk-soft)}
.bk-pk__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,26px)}
.bk-pk__c{position:relative;isolation:isolate;overflow:hidden;padding:clamp(24px,2.6vw,36px);border-radius:var(--bk-r);background:#fff;outline:0;transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t) var(--bk-ease)}
.bk-pk__c::before{content:"";position:absolute;z-index:-2;left:-50%;top:-50%;width:200%;height:200%;background:conic-gradient(from 0deg,transparent 0,transparent 62%,var(--bk-a) 80%,var(--bk-a2) 92%,transparent 100%);opacity:0;animation:bk-spin 3.2s linear infinite;transition:opacity .5s}
.bk-pk__c::after{content:"";position:absolute;z-index:-1;inset:2px;border-radius:calc(var(--bk-r) - 2px);background:#fff}
.bk-pk__c:hover,.bk-pk__c:focus-visible{transform:translateY(var(--bk-lift));box-shadow:0 34px 56px -28px var(--bk-a)}
.bk-pk__c:hover::before,.bk-pk__c:focus-visible::before{opacity:1}
.bk-pk__n{position:absolute;right:20px;top:10px;font-size:64px;font-weight:800;letter-spacing:-.05em;color:var(--bk-a-l);transition:color .5s,transform .7s var(--bk-ease)}
.bk-pk__c:hover .bk-pk__n{color:var(--bk-a-m);transform:translateY(8px) scale(1.1)}
.bk-pk__c i{display:grid;place-items:center;width:60px;height:60px;margin-bottom:22px;border-radius:20px;background:var(--bk-a-l);color:var(--bk-a);transition:background .4s,color .4s,transform .6s var(--bk-ease)}
.bk-pk__c i svg{width:28px;height:28px}
.bk-pk__c:hover i{background:var(--bk-a);color:#fff;transform:translateY(-6px) rotate(-8deg)}
.bk-pk__c h3{margin-bottom:8px;font-size:21px}
.bk-pk__c p{color:var(--bk-mut)}
@media (max-width:980px){.bk-pk__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:600px){.bk-pk__grid{grid-template-columns:1fr}}`,
    js: '',
  },
  {
    id: 'pro-values', category: 'Pro Sections', name: 'Values: expanding colour panels',
    description: 'Four colourful panels that open on hover, tap or keyboard to reveal a value and its description. Different from the photo panels: pure typography and gradients.',
    specs: ['Flex expand 1 -> 3.2 with delayed text reveal', 'Gradient per panel from your accent (hue-shifted with color-mix)', 'Vertical accordion on phones (tap to open)', 'Fully keyboard accessible (Enter / Space / focus)'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-vl" id="values">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Our values</span><h2>What we stand for</h2></div>
    <div class="bk-vl__row bk-rv" style="--i:1">
      <article class="bk-vl__it is-on" tabindex="0"><span>01</span><h3>Integrity</h3><p>We do what we say and tell the truth, even when it is hard.</p></article>
      <article class="bk-vl__it" tabindex="0"><span>02</span><h3>Craft</h3><p>Details matter. We sweat the small things so you never have to.</p></article>
      <article class="bk-vl__it" tabindex="0"><span>03</span><h3>Care</h3><p>People come first: customers, colleagues and communities.</p></article>
      <article class="bk-vl__it" tabindex="0"><span>04</span><h3>Growth</h3><p>We learn every day and share what we learn with others.</p></article>
    </div>
  </div>
</section>`,
    css: `.bk-vl__row{display:flex;gap:clamp(8px,1.2vw,16px);height:clamp(380px,46vw,480px)}
.bk-vl__it{position:relative;overflow:hidden;flex:1 1 0;min-width:0;display:flex;flex-direction:column;justify-content:flex-end;padding:clamp(20px,2.4vw,34px);border-radius:var(--bk-r);color:#fff;cursor:pointer;outline:0;transition:flex-grow .8s var(--bk-ease),box-shadow .5s}
.bk-vl__it:nth-child(1){background:linear-gradient(160deg,var(--bk-a),var(--bk-a-d))}
.bk-vl__it:nth-child(2){background:linear-gradient(160deg,var(--bk-a2),color-mix(in srgb,var(--bk-a2) 60%,#000))}
.bk-vl__it:nth-child(3){background:linear-gradient(160deg,color-mix(in srgb,var(--bk-a) 55%,#0f766e),color-mix(in srgb,var(--bk-a) 30%,#064e3b))}
.bk-vl__it:nth-child(4){background:linear-gradient(160deg,#1e293b,#0b1220)}
.bk-vl__it::before{content:"";position:absolute;right:-30%;top:-30%;width:90%;aspect-ratio:1;border-radius:50%;background:radial-gradient(circle,rgba(255,255,255,.28),transparent 68%);transition:transform 1s var(--bk-ease)}
.bk-vl__it.is-on{flex-grow:3.2}
.bk-vl__it.is-on::before{transform:scale(1.4) translate(-10%,10%)}
.bk-vl__it:focus-visible{box-shadow:0 0 0 4px var(--bk-a-m)}
.bk-vl__it>*{position:relative}
.bk-vl__it span{position:absolute;left:clamp(20px,2.4vw,34px);top:clamp(20px,2.4vw,30px);font-size:15px;font-weight:800;letter-spacing:.14em;opacity:.75}
.bk-vl__it h3{font-size:clamp(26px,3.2vw,44px);white-space:nowrap;transition:transform .7s var(--bk-ease)}
.bk-vl__it p{max-width:360px;max-height:0;opacity:0;overflow:hidden;font-size:17px;color:rgba(255,255,255,.88);transition:max-height .8s var(--bk-ease),opacity .5s,margin .6s}
.bk-vl__it.is-on p{max-height:140px;margin-top:12px;opacity:1;transition-delay:.15s}
@media (min-width:821px){.bk-vl__it:not(.is-on) h3{transform:rotate(-90deg) translate(-4px,-4px);transform-origin:left bottom;margin-bottom:56px}}
@media (max-width:820px){.bk-vl__row{flex-direction:column;height:auto}.bk-vl__it{flex:none;min-height:92px;justify-content:center;transition:min-height .7s var(--bk-ease)}.bk-vl__it.is-on{min-height:230px;justify-content:flex-end}.bk-vl__it span{top:50%;transform:translateY(-50%)}.bk-vl__it.is-on span{top:22px;transform:none}.bk-vl__it h3{margin-left:50px}.bk-vl__it.is-on h3{margin-left:0}}`,
    js: `document.querySelectorAll('.bk-vl__row').forEach(function (row) {
  var items = [].slice.call(row.querySelectorAll('.bk-vl__it'));
  var hover = window.matchMedia && window.matchMedia('(hover:hover)').matches;
  function open(it) { items.forEach(function (x) { x.classList.toggle('is-on', x === it); }); }
  items.forEach(function (it) {
    if (hover) it.addEventListener('mouseenter', function () { open(it); });
    it.addEventListener('focus', function () { open(it); });
    it.addEventListener('click', function () { open(it); });
    it.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(it); } });
  });
});`,
  },
  {
    id: 'pro-compare-table', category: 'Pro Sections', name: 'Comparison table (highlight column)',
    description: 'Feature comparison for plans or competitors. The recommended column glows, rows highlight on hover, ticks pop in when scrolled into view. Scrolls sideways on phones with a sticky first column.',
    specs: ['Real <table> with scope attributes for accessibility', 'Recommended column with ribbon and glow', 'Check / cross icons animate in (staggered by row)', 'Phones: horizontal scroll + sticky first column + scroll hint', 'Edit text only, copy a <tr> to add rows'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-ct2" id="compare">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Compare plans</span><h2>Find the plan that fits</h2><p>Every plan includes security, backups and friendly support.</p></div>
    <div class="bk-ct2__wrap bk-rv" style="--i:1" tabindex="0" aria-label="Plan comparison table">
      <table class="bk-ct2__t">
        <thead><tr><th scope="col"><span>Features</span></th><th scope="col">Starter<small>$19 / mo</small></th><th scope="col" class="bk-ct2__hot"><em>Best value</em>Business<small>$49 / mo</small></th><th scope="col">Enterprise<small>$129 / mo</small></th></tr></thead>
        <tbody>
          <tr><th scope="row">Projects</th><td>1</td><td class="bk-ct2__hot">Unlimited</td><td>Unlimited</td></tr>
          <tr><th scope="row">Team members</th><td>2</td><td class="bk-ct2__hot">15</td><td>Unlimited</td></tr>
          <tr><th scope="row">Analytics dashboard</th><td><i class="y">${IC.check}</i></td><td class="bk-ct2__hot"><i class="y">${IC.check}</i></td><td><i class="y">${IC.check}</i></td></tr>
          <tr><th scope="row">Custom domain</th><td><i class="n">&times;</i></td><td class="bk-ct2__hot"><i class="y">${IC.check}</i></td><td><i class="y">${IC.check}</i></td></tr>
          <tr><th scope="row">Priority support</th><td><i class="n">&times;</i></td><td class="bk-ct2__hot"><i class="y">${IC.check}</i></td><td><i class="y">${IC.check}</i></td></tr>
          <tr><th scope="row">Single sign-on</th><td><i class="n">&times;</i></td><td class="bk-ct2__hot"><i class="n">&times;</i></td><td><i class="y">${IC.check}</i></td></tr>
          <tr><th scope="row">Dedicated manager</th><td><i class="n">&times;</i></td><td class="bk-ct2__hot"><i class="n">&times;</i></td><td><i class="y">${IC.check}</i></td></tr>
        </tbody>
        <tfoot><tr><td></td><td><a class="bk-pbtn bk-pbtn--ghost" href="#contact">Choose</a></td><td class="bk-ct2__hot"><a class="bk-pbtn" href="#contact">Choose ${AR}</a></td><td><a class="bk-pbtn bk-pbtn--ghost" href="#contact">Contact</a></td></tr></tfoot>
      </table>
    </div>
    <p class="bk-ct2__hint">Swipe sideways to compare &rarr;</p>
  </div>
</section>`,
    css: `.bk-ct2{background:#fff}
.bk-ct2__wrap{overflow-x:auto;border-radius:calc(var(--bk-r) + 4px);border:1px solid var(--bk-line);box-shadow:var(--bk-sh);outline:0}
.bk-ct2__wrap:focus-visible{box-shadow:0 0 0 4px var(--bk-a-m)}
.bk-ct2__t{width:100%;min-width:720px;border-collapse:separate;border-spacing:0;text-align:center}
.bk-ct2__t th,.bk-ct2__t td{padding:18px 20px;border-bottom:1px solid var(--bk-line);transition:background .3s}
.bk-ct2__t thead th{position:relative;padding:30px 20px 22px;font-size:20px;background:#fff;vertical-align:bottom}
.bk-ct2__t thead small{display:block;margin-top:6px;font-size:14px;font-weight:600;color:var(--bk-mut)}
.bk-ct2__t thead th:first-child,.bk-ct2__t tbody th{text-align:left;position:sticky;left:0;z-index:2;background:#fff;font-size:15.5px}
.bk-ct2__t thead th:first-child span{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--bk-mut)}
.bk-ct2__t tbody tr:hover th,.bk-ct2__t tbody tr:hover td{background:var(--bk-a-l)}
.bk-ct2__t td{font-weight:600}
.bk-ct2__t .bk-ct2__hot{background:linear-gradient(180deg,var(--bk-a-l),#fff);border-left:2px solid var(--bk-a);border-right:2px solid var(--bk-a)}
.bk-ct2__t thead .bk-ct2__hot{border-top:2px solid var(--bk-a);border-radius:18px 18px 0 0;color:var(--bk-a-d)}
.bk-ct2__t tfoot .bk-ct2__hot{border-bottom:2px solid var(--bk-a);border-radius:0 0 18px 18px}
.bk-ct2__t thead em{position:absolute;left:50%;top:-1px;transform:translate(-50%,-50%);padding:4px 14px;border-radius:999px;background:var(--bk-a);color:#fff;font-size:11.5px;font-style:normal;font-weight:700;letter-spacing:.04em;white-space:nowrap}
.bk-ct2__t tfoot td{border-bottom:0;padding:22px 16px}
.bk-ct2__t tfoot .bk-pbtn{padding:12px 20px;width:100%}
.bk-ct2__t i{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;font-style:normal;font-size:18px;font-weight:700}
.bk-ct2__t i.y{background:var(--bk-a-l);color:var(--bk-a)}
.bk-ct2__t i.n{background:#f1f5f9;color:#94a3b8}
.bk-ct2__t i svg{width:16px;height:16px}
.bk-js .bk-ct2__t i{transform:scale(0);transition:transform .6s var(--bk-ease);transition-delay:calc(var(--r,0) * 80ms)}
.bk-js .bk-ct2__wrap.is-in i{transform:scale(1)}
.bk-ct2__hint{display:none;margin-top:12px;text-align:center;font-size:13px;color:var(--bk-mut)}
@media (max-width:780px){.bk-ct2__hint{display:block}}`,
    js: `document.querySelectorAll('.bk-ct2__t tbody tr').forEach(function (tr, i) { tr.querySelectorAll('i').forEach(function (m) { m.style.setProperty('--r', i); }); });`,
  },

  // ============================== EXTRAS ==============================
  {
    id: 'pro-countdown', category: 'Pro Extras', name: 'Flip countdown (launch / event)',
    description: 'Big flip-clock countdown with days, hours, minutes and seconds, a gradient card and an email notify box. Each digit flips like a real clock.',
    specs: ['True 3D flip animation per unit when the number changes', 'Set data-end="2026-12-31T18:00:00" on the section (defaults to 7 days from load)', 'Shows a "We are live" message at zero', 'Cards shrink fluidly, 4 units fit at 320px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-cd" id="launch" data-end="">
  <div class="bk-pw bk-cd__in">
    <span class="bk-pey bk-rv">Launching soon</span>
    <h2 class="bk-rv" style="--i:1">Something big is almost here</h2>
    <p class="bk-rv" style="--i:2">Be first in line. Leave your email and we will notify you the second we go live.</p>
    <div class="bk-cd__clock bk-rv" style="--i:3" role="timer" aria-label="Time left">
      <div class="bk-cd__u" data-u="d"><div class="bk-cd__card"><div class="bk-cd__h bk-cd__t"><span>00</span></div><div class="bk-cd__h bk-cd__b"><span>00</span></div><div class="bk-cd__h bk-cd__f1"><span>00</span></div><div class="bk-cd__h bk-cd__f2"><span>00</span></div></div><small>Days</small></div>
      <div class="bk-cd__u" data-u="h"><div class="bk-cd__card"><div class="bk-cd__h bk-cd__t"><span>00</span></div><div class="bk-cd__h bk-cd__b"><span>00</span></div><div class="bk-cd__h bk-cd__f1"><span>00</span></div><div class="bk-cd__h bk-cd__f2"><span>00</span></div></div><small>Hours</small></div>
      <div class="bk-cd__u" data-u="m"><div class="bk-cd__card"><div class="bk-cd__h bk-cd__t"><span>00</span></div><div class="bk-cd__h bk-cd__b"><span>00</span></div><div class="bk-cd__h bk-cd__f1"><span>00</span></div><div class="bk-cd__h bk-cd__f2"><span>00</span></div></div><small>Minutes</small></div>
      <div class="bk-cd__u" data-u="s"><div class="bk-cd__card"><div class="bk-cd__h bk-cd__t"><span>00</span></div><div class="bk-cd__h bk-cd__b"><span>00</span></div><div class="bk-cd__h bk-cd__f1"><span>00</span></div><div class="bk-cd__h bk-cd__f2"><span>00</span></div></div><small>Seconds</small></div>
    </div>
    <p class="bk-cd__live" hidden>We are live! Welcome aboard.</p>
    <form class="bk-cd__form bk-rv" style="--i:4" novalidate><input type="email" required placeholder="Your email address" aria-label="Email address"><button class="bk-pbtn" type="submit">Notify me ${AR}</button></form>
    <p class="bk-cd__msg" role="status" aria-live="polite"></p>
  </div>
</section>`,
    css: `.bk-cd{position:relative;overflow:hidden;background:radial-gradient(800px 500px at 50% -10%,color-mix(in srgb,var(--bk-a) 50%,#0b1220),#0b1220 70%);color:#fff;padding:clamp(64px,9vw,120px) 0;text-align:center}
.bk-cd .bk-pey{background:rgba(255,255,255,.12);color:#fff}
.bk-cd h2{margin:22px 0 14px;font-size:clamp(32px,5.4vw,64px)}
.bk-cd__in>p{max-width:520px;margin:0 auto;color:#b8c4dc;font-size:clamp(16px,1.6vw,19px)}
.bk-cd__clock{display:flex;justify-content:center;gap:clamp(8px,2vw,24px);margin:clamp(30px,5vw,52px) 0}
.bk-cd__u{display:grid;gap:12px;justify-items:center}
.bk-cd__u small{font-size:12.5px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#93a4c4}
.bk-cd__card{--w:clamp(62px,15vw,128px);--h:clamp(78px,18vw,150px);position:relative;width:var(--w);height:var(--h);perspective:600px;font-size:clamp(38px,9vw,84px);font-weight:800;font-variant-numeric:tabular-nums;letter-spacing:-.04em}
.bk-cd__h{position:absolute;left:0;width:100%;height:50%;overflow:hidden;background:linear-gradient(180deg,#1a2540,#111a30);box-shadow:0 0 0 1px rgba(255,255,255,.06) inset}
.bk-cd__h span{position:absolute;left:0;width:100%;height:200%;display:grid;place-items:center;line-height:1}
.bk-cd__t,.bk-cd__f1{top:0;border-radius:16px 16px 0 0;border-bottom:1px solid rgba(0,0,0,.5)}
.bk-cd__b,.bk-cd__f2{bottom:0;border-radius:0 0 16px 16px;background:linear-gradient(180deg,#111a30,#0c1325)}
.bk-cd__t span,.bk-cd__f1 span{top:0}
.bk-cd__b span,.bk-cd__f2 span{bottom:0}
.bk-cd__f1{transform-origin:bottom;z-index:3;backface-visibility:hidden}
.bk-cd__f2{transform-origin:top;z-index:3;transform:rotateX(90deg);backface-visibility:hidden}
.bk-cd__card.is-flip .bk-cd__f1{animation:bk-cd-f1 .35s ease-in forwards}
.bk-cd__card.is-flip .bk-cd__f2{animation:bk-cd-f2 .35s .35s ease-out forwards}
@keyframes bk-cd-f1{to{transform:rotateX(-90deg)}}
@keyframes bk-cd-f2{to{transform:rotateX(0)}}
.bk-cd__card::after{content:"";position:absolute;left:0;right:0;top:50%;height:2px;margin-top:-1px;background:rgba(0,0,0,.55);z-index:4}
.bk-cd__live{margin:10px 0 28px;font-size:22px;font-weight:700;color:var(--bk-a-m)}
.bk-cd__form{display:flex;gap:8px;max-width:500px;margin:0 auto;padding:7px;border-radius:999px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.18);transition:border-color .3s,box-shadow .4s}
.bk-cd__form:focus-within{border-color:var(--bk-a);box-shadow:0 0 0 5px color-mix(in srgb,var(--bk-a) 30%,transparent)}
.bk-cd__form input{flex:1;min-width:0;padding:0 18px;border:0;background:transparent;color:#fff;font-family:inherit;font-size:16px;outline:0}
.bk-cd__form input::placeholder{color:#7f90ad}
.bk-cd__form .bk-pbtn{padding:14px 22px;white-space:nowrap}
.bk-cd__msg{min-height:1.4em;margin-top:14px;font-weight:600;color:var(--bk-a-m)}
@media (max-width:520px){.bk-cd__form{flex-direction:column;border-radius:26px;padding:10px}.bk-cd__form input{padding:14px 16px}.bk-cd__form .bk-pbtn{width:100%}.bk-cd__card{border-radius:12px}}`,
    js: `document.querySelectorAll('.bk-cd').forEach(function (root) {
  var end = Date.parse(root.getAttribute('data-end') || '');
  if (!end) end = Date.now() + 7 * 24 * 3600 * 1000;
  var units = {};
  [].slice.call(root.querySelectorAll('.bk-cd__u')).forEach(function (u) {
    units[u.getAttribute('data-u')] = { card: u.querySelector('.bk-cd__card'), val: null };
  });
  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function setAll(card, sel, v) { card.querySelectorAll(sel + ' span').forEach(function (s) { s.textContent = v; }); }
  function put(k, v) {
    var u = units[k], text = pad(v);
    if (u.val === text) return;
    if (u.val === null) {
      ['.bk-cd__t', '.bk-cd__b', '.bk-cd__f1', '.bk-cd__f2'].forEach(function (s) { setAll(u.card, s, text); });
    } else {
      setAll(u.card, '.bk-cd__f1', u.val);
      setAll(u.card, '.bk-cd__f2', text);
      setAll(u.card, '.bk-cd__t', text);
      u.card.classList.remove('is-flip'); void u.card.offsetWidth; u.card.classList.add('is-flip');
      setTimeout(function () { setAll(u.card, '.bk-cd__b', text); }, 350);
    }
    u.val = text;
  }
  var live = root.querySelector('.bk-cd__live');
  function tick() {
    var s = Math.max(0, Math.floor((end - Date.now()) / 1000));
    put('d', Math.floor(s / 86400)); put('h', Math.floor(s % 86400 / 3600)); put('m', Math.floor(s % 3600 / 60)); put('s', s % 60);
    live.hidden = s > 0;
  }
  tick(); setInterval(tick, 1000);
  var form = root.querySelector('.bk-cd__form'), msg = root.querySelector('.bk-cd__msg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = form.querySelector('input').checkValidity();
    msg.textContent = ok ? 'Thanks! We will email you at launch.' : 'Please enter a valid email address.';
    // To really collect emails, send the value to your server here.
    if (ok) form.reset();
  });
});`,
  },
  {
    id: 'pro-faq-search', category: 'Pro Sections', name: 'FAQ with live search + categories',
    description: 'Help centre style FAQ. Type to filter questions instantly, switch category chips, and open answers with a smooth height animation.',
    specs: ['Live search across questions and answers', 'Category chips (data-cat) combined with search', 'Smooth open/close, one open at a time, aria-expanded', 'Friendly "nothing found" state with a contact link', 'Centered single column, scales to 320px'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-fs" id="faq">
  <div class="bk-pw bk-fs__in">
    <div class="bk-ph bk-rv"><span class="bk-pey">Help centre</span><h2>How can we help?</h2></div>
    <label class="bk-fs__s bk-rv" style="--i:1">${I_SEARCH}<input type="search" placeholder="Search questions, e.g. refund" aria-label="Search the FAQ"></label>
    <div class="bk-fs__chips bk-rv" style="--i:2"><button class="is-on" type="button" data-f="all">All</button><button type="button" data-f="acc">Account</button><button type="button" data-f="pay">Payments</button><button type="button" data-f="ship">Delivery</button></div>
    <div class="bk-fs__list bk-rv" style="--i:3">
      <div class="bk-fs__it" data-cat="acc"><button type="button" aria-expanded="false">How do I create an account?<i aria-hidden="true"></i></button><div class="bk-fs__a"><div><p>Tap Sign up, enter your name, email and a password. You will get a confirmation email within a minute.</p></div></div></div>
      <div class="bk-fs__it" data-cat="acc"><button type="button" aria-expanded="false">I forgot my password. What now?<i aria-hidden="true"></i></button><div class="bk-fs__a"><div><p>Use Forgot password on the sign in page. We will email you a secure link that works for 30 minutes.</p></div></div></div>
      <div class="bk-fs__it" data-cat="pay"><button type="button" aria-expanded="false">Which payment methods do you accept?<i aria-hidden="true"></i></button><div class="bk-fs__a"><div><p>All major cards, UPI, net banking and popular wallets. Every payment is encrypted end to end.</p></div></div></div>
      <div class="bk-fs__it" data-cat="pay"><button type="button" aria-expanded="false">How long does a refund take?<i aria-hidden="true"></i></button><div class="bk-fs__a"><div><p>Refunds are processed within 2 working days and reach your bank in 5 to 7 days, depending on your bank.</p></div></div></div>
      <div class="bk-fs__it" data-cat="ship"><button type="button" aria-expanded="false">How can I track my order?<i aria-hidden="true"></i></button><div class="bk-fs__a"><div><p>Open My orders and tap Track. You will also receive SMS and email updates at every step.</p></div></div></div>
      <div class="bk-fs__it" data-cat="ship"><button type="button" aria-expanded="false">Do you deliver on weekends?<i aria-hidden="true"></i></button><div class="bk-fs__a"><div><p>Yes, we deliver seven days a week in most cities. Sunday slots can be chosen at checkout.</p></div></div></div>
    </div>
    <div class="bk-fs__none" hidden><b>No answers found</b><span>Try another word, or <a href="#contact">ask our team</a>.</span></div>
  </div>
</section>`,
    css: `.bk-fs{background:var(--bk-soft)}
.bk-fs__in{max-width:820px}
.bk-fs__s{position:relative;display:block;margin-bottom:18px}
.bk-fs__s svg{position:absolute;left:20px;top:50%;margin-top:-10px;color:var(--bk-mut)}
.bk-fs__s input{width:100%;padding:18px 20px 18px 54px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:17px;box-shadow:var(--bk-sh);transition:border-color .3s,box-shadow .3s}
.bk-fs__s input:focus{outline:0;border-color:var(--bk-a);box-shadow:0 0 0 5px var(--bk-a-l)}
.bk-fs__chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px;margin-bottom:28px}
.bk-fs__chips button{padding:9px 20px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-mut);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-fs__chips button:hover{transform:translateY(-3px);color:var(--bk-a)}
.bk-fs__chips button.is-on{background:var(--bk-a);border-color:var(--bk-a);color:#fff}
.bk-fs__list{display:grid;gap:12px}
.bk-fs__it{border-radius:calc(var(--bk-r) - 4px);background:#fff;border:1px solid var(--bk-line);transition:border-color .3s,box-shadow .4s,opacity .3s,transform .4s var(--bk-ease)}
.bk-fs__it.is-off{display:none}
.bk-fs__it.is-open{border-color:var(--bk-a);box-shadow:0 18px 36px -22px var(--bk-a)}
.bk-fs__it>button{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;padding:20px 22px;border:0;background:transparent;color:var(--bk-ink);font-family:inherit;font-size:clamp(16px,1.6vw,18px);font-weight:600;text-align:left;cursor:pointer}
.bk-fs__it>button:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:-3px;border-radius:calc(var(--bk-r) - 4px)}
.bk-fs__it i{position:relative;flex:none;width:32px;height:32px;border-radius:50%;background:var(--bk-a-l);transition:background .3s,transform .5s var(--bk-ease)}
.bk-fs__it i::before,.bk-fs__it i::after{content:"";position:absolute;left:50%;top:50%;width:13px;height:2px;margin:-1px 0 0 -6.5px;border-radius:2px;background:var(--bk-a);transition:transform .5s var(--bk-ease),background .3s}
.bk-fs__it i::after{transform:rotate(90deg)}
.bk-fs__it.is-open i{background:var(--bk-a);transform:rotate(180deg)}
.bk-fs__it.is-open i::before,.bk-fs__it.is-open i::after{background:#fff}
.bk-fs__it.is-open i::after{transform:rotate(0)}
.bk-fs__a{display:grid;grid-template-rows:0fr;transition:grid-template-rows .5s var(--bk-ease)}
.bk-fs__a>div{overflow:hidden}
.bk-fs__a p{padding:0 22px 22px;color:var(--bk-mut);line-height:1.75}
.bk-fs__it.is-open .bk-fs__a{grid-template-rows:1fr}
.bk-fs__none{margin-top:12px;padding:44px 20px;border:2px dashed var(--bk-line);border-radius:var(--bk-r);background:#fff;text-align:center;display:grid;gap:6px;color:var(--bk-mut)}
.bk-fs__none[hidden]{display:none}
.bk-fs__none b{font-size:20px;color:var(--bk-ink)}
.bk-fs__none a{color:var(--bk-a);font-weight:700}
@media (max-width:520px){.bk-fs__it>button{padding:16px 16px}.bk-fs__a p{padding:0 16px 18px}.bk-fs__s input{font-size:16px}}`,
    js: `document.querySelectorAll('.bk-fs').forEach(function (root) {
  var items = [].slice.call(root.querySelectorAll('.bk-fs__it'));
  var chips = [].slice.call(root.querySelectorAll('.bk-fs__chips button'));
  var input = root.querySelector('.bk-fs__s input');
  var none = root.querySelector('.bk-fs__none');
  var cat = 'all';
  function apply() {
    var q = input.value.trim().toLowerCase(), shown = 0;
    items.forEach(function (it) {
      var ok = (cat === 'all' || it.getAttribute('data-cat') === cat) && (!q || it.textContent.toLowerCase().indexOf(q) > -1);
      it.classList.toggle('is-off', !ok);
      if (ok) shown++;
    });
    none.hidden = shown !== 0;
  }
  items.forEach(function (it) {
    var b = it.querySelector('button');
    b.addEventListener('click', function () {
      var open = !it.classList.contains('is-open');
      items.forEach(function (o) { o.classList.remove('is-open'); o.querySelector('button').setAttribute('aria-expanded', 'false'); });
      it.classList.toggle('is-open', open);
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  });
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      cat = c.getAttribute('data-f');
      chips.forEach(function (x) { x.classList.toggle('is-on', x === c); });
      apply();
    });
  });
  input.addEventListener('input', apply);
});`,
  },
];
