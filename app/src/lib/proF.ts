import type { Block } from './blocks';
import { AR, IC, img, svg } from './proShared';

const I_SEARCH = svg('<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>', 20);
const I_CART = svg('<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.7 12.4a2 2 0 002 1.6h8a2 2 0 002-1.5L21 8H6"/>', 22);
const I_REFRESH = svg('<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>', 18);
const I_COPY = svg('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 012-2h9"/>', 18);
const I_SWAP = svg('<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>', 20);
const I_STAR = IC.star;
const I_USERS = svg('<circle cx="9" cy="8" r="3.5"/><path d="M2 20c.5-4 3.5-6 7-6s6.5 2 7 6M17 5a3.5 3.5 0 010 7M22 20c-.3-2.6-1.7-4.4-4-5.3"/>', 18);
const I_FORK = svg('<circle cx="6" cy="5" r="2"/><circle cx="18" cy="5" r="2"/><circle cx="12" cy="19" r="2"/><path d="M6 7v2a3 3 0 003 3h6a3 3 0 003-3V7M12 12v5"/>', 16);
const I_PIN = IC.pin;
const I_CLOCK = IC.clock;

/** Same two helpers in every API block, so each block can be copied on its own. */
const H = `function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function getJson(url) { return fetch(url).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); }`;

/** Skeleton shimmer used by the API blocks (each block names its own keyframes). */
const sk = (n: string) => `.bk-${n}__sk{position:relative;overflow:hidden;background:var(--bk-line);border-radius:12px}
.bk-${n}__sk::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,.65),transparent);transform:translateX(-100%);animation:bk-${n}-sk 1.3s infinite}
@keyframes bk-${n}-sk{to{transform:translateX(100%)}}`;

/** PRO blocks, part F: blocks that load LIVE data from a public API (fetch) with loading, error, retry and offline sample data. */
export const PRO_F: Block[] = [
  // ============================== PRODUCTS ==============================
  {
    id: 'pro-api-products', category: 'Pro API', name: 'Live product store (fetch API)',
    description: 'Product grid loaded from a real REST API (dummyjson.com). Live search, category chips from the API, sort, load-more, skeleton loading, error + retry and a working cart counter.',
    specs: ['fetch() + JSON: /products, /products/search, /products/category/{name}', 'Change data-api on the section to point at your own API', 'Skeleton cards while loading, error box with Retry, offline sample data fallback', 'Debounced search (350 ms), sort by price / rating, Load more (skip + limit)', 'Add to cart bounces the cart badge; 4 -> 3 -> 2 -> 1 columns'],
    tags: ['E-commerce'], shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-xp" id="store" data-api="https://dummyjson.com">
  <div class="bk-pw">
    <div class="bk-xp__top bk-rv"><div><span class="bk-pey">Live from an API</span><h2>Shop the collection</h2></div><button class="bk-xp__cart" type="button" aria-label="Cart">${I_CART}<b>0</b></button></div>
    <div class="bk-xp__tools bk-rv" style="--i:1">
      <label class="bk-xp__s">${I_SEARCH}<input type="search" placeholder="Search products (try phone, perfume, shoes)" aria-label="Search products"></label>
      <select class="bk-xp__sort" aria-label="Sort"><option value="">Sort: Featured</option><option value="price:asc">Price: low to high</option><option value="price:desc">Price: high to low</option><option value="rating:desc">Top rated</option></select>
    </div>
    <div class="bk-xp__chips" role="tablist"><button class="is-on" type="button" data-c="">All</button></div>
    <p class="bk-xp__note" role="status" aria-live="polite"></p>
    <div class="bk-xp__grid"></div>
    <div class="bk-xp__err" hidden><b>Could not load products</b><span>Check your internet connection and try again.</span><button class="bk-pbtn" type="button">Retry</button></div>
    <div class="bk-xp__more"><button class="bk-pbtn bk-pbtn--ghost" type="button">Load more</button></div>
  </div>
</section>`,
    css: `.bk-xp{background:#fff}
.bk-xp__top{display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:24px}
.bk-xp__top h2{margin-top:14px;font-size:clamp(30px,4.4vw,52px)}
.bk-xp__cart{position:relative;display:grid;place-items:center;width:56px;height:56px;padding:0;border:1.5px solid var(--bk-line);border-radius:18px;background:#fff;color:var(--bk-ink);cursor:pointer;transition:background .3s,color .3s,transform .5s var(--bk-ease)}
.bk-xp__cart:hover{background:var(--bk-a);border-color:var(--bk-a);color:#fff;transform:translateY(-3px)}
.bk-xp__cart b{position:absolute;right:-8px;top:-8px;min-width:24px;height:24px;padding:0 6px;border-radius:12px;background:var(--bk-a);color:#fff;font-size:13px;line-height:24px;text-align:center;border:2px solid #fff}
.bk-xp__cart.is-bump{animation:bk-xp-bump .5s var(--bk-ease)}
@keyframes bk-xp-bump{40%{transform:scale(1.18) rotate(-6deg)}}
.bk-xp__tools{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px}
.bk-xp__s{position:relative;flex:1;min-width:240px}
.bk-xp__s svg{position:absolute;left:16px;top:50%;margin-top:-10px;color:var(--bk-mut)}
.bk-xp__s input,.bk-xp__sort{width:100%;padding:15px 16px 15px 46px;border:1.5px solid var(--bk-line);border-radius:999px;background:var(--bk-soft);color:var(--bk-ink);font-family:inherit;font-size:15px;transition:border-color .3s,box-shadow .3s,background .3s}
.bk-xp__sort{width:auto;padding-left:20px;cursor:pointer}
.bk-xp__s input:focus,.bk-xp__sort:focus{outline:0;border-color:var(--bk-a);background:#fff;box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-xp__chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 12px;scrollbar-width:none}
.bk-xp__chips::-webkit-scrollbar{display:none}
.bk-xp__chips button{flex:none;padding:9px 18px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-mut);font-family:inherit;font-size:14px;font-weight:700;text-transform:capitalize;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-xp__chips button:hover{transform:translateY(-3px);color:var(--bk-a)}
.bk-xp__chips button.is-on{background:var(--bk-ink);border-color:var(--bk-ink);color:#fff}
.bk-xp__note{min-height:1.4em;margin:6px 0 14px;font-size:14px;color:var(--bk-mut)}
.bk-xp__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,1.6vw,22px)}
.bk-xp__c{position:relative;display:flex;flex-direction:column;overflow:hidden;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t);animation:bk-xp-in .6s var(--bk-ease) both;animation-delay:calc(var(--n,0) * 50ms)}
@keyframes bk-xp-in{from{opacity:0;transform:translateY(20px)}}
.bk-xp__c:hover{transform:translateY(-8px);box-shadow:0 32px 50px -26px rgba(11,18,32,.45)}
.bk-xp__pic{position:relative;aspect-ratio:1;background:var(--bk-soft);overflow:hidden}
.bk-xp__pic img{width:100%;height:100%;object-fit:contain;transition:transform 1s var(--bk-ease)}
.bk-xp__c:hover .bk-xp__pic img{transform:scale(1.1)}
.bk-xp__off{position:absolute;left:12px;top:12px;padding:4px 10px;border-radius:999px;background:#dc2626;color:#fff;font-size:12px;font-weight:800}
.bk-xp__b{display:flex;flex-direction:column;flex:1;gap:6px;padding:16px}
.bk-xp__b small{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--bk-mut)}
.bk-xp__b h3{font-size:16px;line-height:1.35}
.bk-xp__rt{display:flex;align-items:center;gap:4px;font-size:13px;color:var(--bk-mut)}
.bk-xp__rt svg{width:15px;height:15px;color:#f5a524}
.bk-xp__f{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;padding-top:10px}
.bk-xp__pr{font-size:19px;font-weight:800;letter-spacing:-.02em}
.bk-xp__pr s{margin-left:6px;font-size:13px;font-weight:500;color:var(--bk-mut)}
.bk-xp__add{display:grid;place-items:center;width:42px;height:42px;padding:0;border:0;border-radius:14px;background:var(--bk-a-l);color:var(--bk-a);cursor:pointer;transition:background .3s,color .3s,transform .4s var(--bk-ease)}
.bk-xp__add:hover{background:var(--bk-a);color:#fff;transform:scale(1.1) rotate(-6deg)}
.bk-xp__add.is-done{background:#16a34a;color:#fff}
${sk('xp')}
.bk-xp__c.is-sk .bk-xp__pic{background:var(--bk-line)}
.bk-xp__c.is-sk .bk-xp__b>i{display:block;height:14px}
.bk-xp__err{display:grid;justify-items:center;gap:10px;padding:48px 20px;border:2px dashed var(--bk-line);border-radius:var(--bk-r);text-align:center;color:var(--bk-mut)}
.bk-xp__err[hidden]{display:none}
.bk-xp__err b{font-size:20px;color:var(--bk-ink)}
.bk-xp__more{display:flex;justify-content:center;margin-top:30px}
.bk-xp__more[hidden]{display:none}
@media (max-width:1100px){.bk-xp__grid{grid-template-columns:repeat(3,1fr)}}
@media (max-width:780px){.bk-xp__grid{grid-template-columns:repeat(2,1fr)}.bk-xp__b{padding:12px}.bk-xp__pr{font-size:16px}}
@media (max-width:420px){.bk-xp__grid{grid-template-columns:1fr 1fr;gap:10px}.bk-xp__add{width:36px;height:36px}}`,
    js: `document.querySelectorAll('.bk-xp').forEach(function (root) {
  ${H}
  var API = root.getAttribute('data-api') || 'https://dummyjson.com';
  var grid = root.querySelector('.bk-xp__grid');
  var chips = root.querySelector('.bk-xp__chips');
  var note = root.querySelector('.bk-xp__note');
  var err = root.querySelector('.bk-xp__err');
  var more = root.querySelector('.bk-xp__more');
  var input = root.querySelector('.bk-xp__s input');
  var sort = root.querySelector('.bk-xp__sort');
  var cartBtn = root.querySelector('.bk-xp__cart');
  var count = 0, cat = '', skip = 0, total = 0, timer = null, token = 0;
  var LIMIT = 12;
  var SAMPLE = [
    { id: 1, title: 'Essence Mascara Lash Princess', category: 'beauty', price: 9.99, discountPercentage: 7.5, rating: 4.9, brand: 'Essence', thumbnail: '${img('bk-xp-1', 400, 400)}' },
    { id: 2, title: 'Eyeshadow Palette with Mirror', category: 'beauty', price: 19.99, discountPercentage: 5.1, rating: 3.9, brand: 'Glamour', thumbnail: '${img('bk-xp-2', 400, 400)}' },
    { id: 3, title: 'Powder Canister', category: 'beauty', price: 14.99, discountPercentage: 18, rating: 4.6, brand: 'Velvet', thumbnail: '${img('bk-xp-3', 400, 400)}' },
    { id: 4, title: 'Red Lipstick', category: 'beauty', price: 12.99, discountPercentage: 19, rating: 4.1, brand: 'Chic', thumbnail: '${img('bk-xp-4', 400, 400)}' }
  ];
  function card(p, i) {
    var old = p.discountPercentage ? (p.price / (1 - p.discountPercentage / 100)).toFixed(2) : '';
    return '<article class="bk-xp__c" style="--n:' + (i % LIMIT) + '"><div class="bk-xp__pic"><img src="' + esc(p.thumbnail) + '" alt="' + esc(p.title) + '" loading="lazy">' +
      (p.discountPercentage > 10 ? '<span class="bk-xp__off">-' + Math.round(p.discountPercentage) + '%</span>' : '') + '</div><div class="bk-xp__b"><small>' + esc(p.brand || p.category) + '</small><h3>' + esc(p.title) + '</h3>' +
      '<div class="bk-xp__rt">${I_STAR}' + esc(p.rating) + '</div><div class="bk-xp__f"><div class="bk-xp__pr">$' + Number(p.price).toFixed(2) + (old ? '<s>$' + old + '</s>' : '') + '</div>' +
      '<button class="bk-xp__add" type="button" aria-label="Add ' + esc(p.title) + ' to cart">${I_CART}</button></div></div></article>';
  }
  function skeleton(n) {
    var s = '';
    for (var i = 0; i < n; i++) s += '<article class="bk-xp__c is-sk"><div class="bk-xp__pic bk-xp__sk"></div><div class="bk-xp__b"><i class="bk-xp__sk"></i><i class="bk-xp__sk"></i><i class="bk-xp__sk" style="width:60%"></i></div></article>';
    return s;
  }
  function url() {
    var q = input.value.trim(), s = sort.value.split(':');
    var base = q ? API + '/products/search?q=' + encodeURIComponent(q) : cat ? API + '/products/category/' + encodeURIComponent(cat) + '?' : API + '/products?';
    var join = base.indexOf('?') > -1 && !/[?&]$/.test(base) ? '&' : '';
    return base + join + 'limit=' + LIMIT + '&skip=' + skip + (s[0] && !q ? '&sortBy=' + s[0] + '&order=' + s[1] : '');
  }
  function load(reset) {
    var my = ++token;
    if (reset) { skip = 0; grid.innerHTML = skeleton(8); more.hidden = true; }
    err.hidden = true; note.textContent = '';
    getJson(url()).then(function (d) {
      if (my !== token) return;
      var items = d.products || [];
      total = d.total || items.length;
      if (reset) grid.innerHTML = '';
      grid.insertAdjacentHTML('beforeend', items.map(function (p, i) { return card(p, i); }).join(''));
      skip += items.length;
      more.hidden = skip >= total;
      note.textContent = total ? 'Showing ' + Math.min(skip, total) + ' of ' + total + ' products' : 'No products found. Try another word.';
    }).catch(function () {
      if (my !== token) return;
      if (reset) { grid.innerHTML = SAMPLE.map(card).join(''); note.textContent = 'Offline: showing sample products.'; }
      err.hidden = false; more.hidden = true;
    });
  }
  getJson(API + '/products/category-list').then(function (list) {
    list.slice(0, 8).forEach(function (c) { var b = document.createElement('button'); b.type = 'button'; b.setAttribute('data-c', c); b.textContent = c.replace(/-/g, ' '); chips.appendChild(b); });
  }).catch(function () {});
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    cat = b.getAttribute('data-c'); input.value = '';
    [].slice.call(chips.children).forEach(function (x) { x.classList.toggle('is-on', x === b); });
    load(true);
  });
  input.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { load(true); }, 350); });
  sort.addEventListener('change', function () { load(true); });
  more.querySelector('button').addEventListener('click', function () { load(false); });
  err.querySelector('button').addEventListener('click', function () { load(true); });
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.bk-xp__add'); if (!b) return;
    count++; cartBtn.querySelector('b').textContent = count;
    cartBtn.classList.remove('is-bump'); void cartBtn.offsetWidth; cartBtn.classList.add('is-bump');
    b.classList.add('is-done'); setTimeout(function () { b.classList.remove('is-done'); }, 900);
  });
  load(true);
});`,
  },

  // ============================== WEATHER ==============================
  {
    id: 'pro-api-weather', category: 'Pro API', name: 'Live weather card (Open-Meteo)',
    description: 'Search any city and get live weather plus a 5-day forecast. The card colour and animated icon change with the weather and day or night. No API key needed.',
    specs: ['Two calls: geocoding-api.open-meteo.com (city to lat/long) and api.open-meteo.com/v1/forecast', 'Gradient + emoji icon by WMO weather code, day / night aware', 'Celsius / Fahrenheit switch without a new request', 'Loading shimmer, "city not found" and offline messages, sample data fallback', 'Works from 320px; forecast becomes a 2 x 3 grid'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-xw" id="weather">
  <div class="bk-pw bk-xw__in">
    <div class="bk-ph bk-rv"><span class="bk-pey">Live data</span><h2>Weather anywhere</h2><p>Type a city and press Enter.</p></div>
    <form class="bk-xw__f bk-rv" style="--i:1" novalidate><label>${I_SEARCH}<input type="search" value="Chennai" placeholder="City name, e.g. London" aria-label="City"></label><button class="bk-pbtn" type="submit">Search</button></form>
    <p class="bk-xw__msg" role="status" aria-live="polite"></p>
    <div class="bk-xw__card is-sun bk-rv" style="--i:2">
      <div class="bk-xw__now"><div><div class="bk-xw__city">--</div><div class="bk-xw__desc">Loading...</div></div><button class="bk-xw__u" type="button" aria-label="Switch unit">&deg;C</button></div>
      <div class="bk-xw__big"><span class="bk-xw__ic">&#9728;&#65039;</span><b class="bk-xw__t">--</b></div>
      <ul class="bk-xw__det"><li><small>Feels like</small><b class="bk-xw__fl">--</b></li><li><small>Humidity</small><b class="bk-xw__hu">--</b></li><li><small>Wind</small><b class="bk-xw__wi">--</b></li></ul>
      <ol class="bk-xw__days"></ol>
    </div>
  </div>
</section>`,
    css: `.bk-xw{background:var(--bk-soft)}
.bk-xw__in{max-width:760px}
.bk-xw__f{display:flex;gap:10px;margin-bottom:12px}
.bk-xw__f label{position:relative;flex:1;display:block}
.bk-xw__f label svg{position:absolute;left:16px;top:50%;margin-top:-10px;color:var(--bk-mut)}
.bk-xw__f input{width:100%;padding:16px 16px 16px 46px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:16px;transition:border-color .3s,box-shadow .3s}
.bk-xw__f input:focus{outline:0;border-color:var(--bk-a);box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-xw__msg{min-height:1.4em;margin-bottom:12px;text-align:center;font-size:14px;font-weight:600;color:#dc2626}
.bk-xw__card{position:relative;overflow:hidden;padding:clamp(22px,4vw,40px);border-radius:calc(var(--bk-r) + 8px);color:#fff;background:linear-gradient(160deg,#f59e0b,#ef4444);box-shadow:0 40px 70px -36px rgba(11,18,32,.6);transition:background .8s}
.bk-xw__card::before{content:"";position:absolute;right:-80px;top:-80px;width:280px;height:280px;border-radius:50%;background:rgba(255,255,255,.16);animation:bk-bob 9s ease-in-out infinite}
.bk-xw__card.is-cloud{background:linear-gradient(160deg,#64748b,#334155)}
.bk-xw__card.is-rain{background:linear-gradient(160deg,#3b82f6,#1e3a8a)}
.bk-xw__card.is-snow{background:linear-gradient(160deg,#93c5fd,#6366f1)}
.bk-xw__card.is-storm{background:linear-gradient(160deg,#4338ca,#0f172a)}
.bk-xw__card.is-night{background:linear-gradient(160deg,#1e293b,#020617)}
.bk-xw__card.is-load .bk-xw__big,.bk-xw__card.is-load .bk-xw__det,.bk-xw__card.is-load .bk-xw__days{opacity:.35;filter:blur(3px)}
.bk-xw__card>*{position:relative}
.bk-xw__now{display:flex;justify-content:space-between;gap:12px}
.bk-xw__city{font-size:clamp(22px,3vw,30px);font-weight:800}
.bk-xw__desc{font-size:15px;opacity:.9}
.bk-xw__u{align-self:flex-start;padding:8px 16px;border:1.5px solid rgba(255,255,255,.6);border-radius:999px;background:rgba(255,255,255,.14);color:#fff;font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .3s}
.bk-xw__u:hover{background:rgba(255,255,255,.3)}
.bk-xw__big{display:flex;align-items:center;gap:clamp(12px,3vw,28px);margin:18px 0 22px;transition:opacity .4s,filter .4s}
.bk-xw__ic{font-size:clamp(70px,14vw,120px);line-height:1;filter:drop-shadow(0 18px 20px rgba(0,0,0,.3));animation:bk-bob 5s ease-in-out infinite}
.bk-xw__t{font-size:clamp(64px,13vw,112px);font-weight:800;letter-spacing:-.06em;line-height:1}
.bk-xw__det{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 20px;padding:0;list-style:none;transition:opacity .4s,filter .4s}
.bk-xw__det li{padding:14px;border-radius:18px;background:rgba(255,255,255,.14);-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}
.bk-xw__det small{display:block;font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.8}
.bk-xw__det b{font-size:clamp(17px,2.4vw,22px)}
.bk-xw__days{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin:0;padding:0;list-style:none;transition:opacity .4s,filter .4s}
.bk-xw__days li{display:grid;justify-items:center;gap:4px;padding:14px 6px;border-radius:18px;background:rgba(255,255,255,.12);text-align:center;font-size:14px;transition:transform .5s var(--bk-ease),background .3s}
.bk-xw__days li:hover{transform:translateY(-6px);background:rgba(255,255,255,.24)}
.bk-xw__days li span{font-size:28px}
.bk-xw__days li b{font-size:15px}
.bk-xw__days li small{opacity:.75}
@media (max-width:560px){.bk-xw__days{grid-template-columns:repeat(3,1fr)}.bk-xw__f .bk-pbtn{padding:0 18px}.bk-xw__det{gap:8px}.bk-xw__det li{padding:10px}}`,
    js: `document.querySelectorAll('.bk-xw').forEach(function (root) {
  ${H}
  var form = root.querySelector('.bk-xw__f'), input = form.querySelector('input'), msg = root.querySelector('.bk-xw__msg');
  var card = root.querySelector('.bk-xw__card'), unitBtn = root.querySelector('.bk-xw__u');
  var fahrenheit = false, last = null, token = 0;
  function info(code) {
    if (code === 0) return ['\\u2600\\uFE0F', 'Clear sky', 'sun'];
    if (code <= 2) return ['\\u26C5', 'Partly cloudy', 'sun'];
    if (code === 3) return ['\\u2601\\uFE0F', 'Overcast', 'cloud'];
    if (code <= 48) return ['\\uD83C\\uDF2B\\uFE0F', 'Foggy', 'cloud'];
    if (code <= 57) return ['\\uD83C\\uDF26\\uFE0F', 'Drizzle', 'rain'];
    if (code <= 67) return ['\\uD83C\\uDF27\\uFE0F', 'Rain', 'rain'];
    if (code <= 77) return ['\\u2744\\uFE0F', 'Snow', 'snow'];
    if (code <= 82) return ['\\uD83C\\uDF27\\uFE0F', 'Rain showers', 'rain'];
    if (code <= 86) return ['\\uD83C\\uDF28\\uFE0F', 'Snow showers', 'snow'];
    return ['\\u26C8\\uFE0F', 'Thunderstorm', 'storm'];
  }
  function temp(c) { return Math.round(fahrenheit ? c * 9 / 5 + 32 : c) + '\\u00B0'; }
  var DEMO = { city: 'Chennai, India (demo)', cur: { temperature_2m: 31, apparent_temperature: 35, relative_humidity_2m: 72, wind_speed_10m: 14, weather_code: 2, is_day: 1 },
    daily: { time: ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-01-05'], weather_code: [2, 61, 3, 0, 95], temperature_2m_max: [33, 30, 31, 34, 29], temperature_2m_min: [26, 25, 25, 26, 24] } };
  function paint(d) {
    last = d;
    var i = info(d.cur.weather_code);
    card.className = 'bk-xw__card ' + (d.cur.is_day ? 'is-' + i[2] : 'is-night') + ' is-in';
    root.querySelector('.bk-xw__city').textContent = d.city;
    root.querySelector('.bk-xw__desc').textContent = i[1];
    root.querySelector('.bk-xw__ic').textContent = i[0];
    root.querySelector('.bk-xw__t').textContent = temp(d.cur.temperature_2m);
    root.querySelector('.bk-xw__fl').textContent = temp(d.cur.apparent_temperature);
    root.querySelector('.bk-xw__hu').textContent = Math.round(d.cur.relative_humidity_2m) + '%';
    root.querySelector('.bk-xw__wi').textContent = Math.round(d.cur.wind_speed_10m) + ' km/h';
    unitBtn.textContent = fahrenheit ? '\\u00B0F' : '\\u00B0C';
    root.querySelector('.bk-xw__days').innerHTML = d.daily.time.map(function (t, k) {
      var di = info(d.daily.weather_code[k]);
      var name = k === 0 ? 'Today' : new Date(t + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' });
      return '<li><small>' + esc(name) + '</small><span>' + di[0] + '</span><b>' + temp(d.daily.temperature_2m_max[k]) + '</b><small>' + temp(d.daily.temperature_2m_min[k]) + '</small></li>';
    }).join('');
  }
  function search(name) {
    var my = ++token;
    card.classList.add('is-load'); msg.textContent = '';
    getJson('https://geocoding-api.open-meteo.com/v1/search?count=1&name=' + encodeURIComponent(name)).then(function (g) {
      if (!g.results || !g.results.length) throw new Error('nf');
      var p = g.results[0];
      return getJson('https://api.open-meteo.com/v1/forecast?latitude=' + p.latitude + '&longitude=' + p.longitude +
        '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5')
        .then(function (w) { return { city: p.name + (p.country ? ', ' + p.country : ''), cur: w.current, daily: w.daily }; });
    }).then(function (d) { if (my === token) { paint(d); card.classList.remove('is-load'); } })
      .catch(function (e) {
        if (my !== token) return;
        card.classList.remove('is-load');
        msg.textContent = e.message === 'nf' ? 'City not found. Check the spelling.' : 'Could not reach the weather service. Showing sample data.';
        if (e.message !== 'nf') paint(DEMO);
      });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); if (input.value.trim()) search(input.value.trim()); });
  unitBtn.addEventListener('click', function () { fahrenheit = !fahrenheit; if (last) paint(last); });
  search(input.value);
});`,
  },

  // ============================== COUNTRIES ==============================
  {
    id: 'pro-api-countries', category: 'Pro API', name: 'Country explorer (REST Countries)',
    description: 'Searchable, filterable cards of every country with flag, capital and population. Region chips, sort and a Load more button. Big dataset, smooth and fast.',
    specs: ['One request: restcountries.com/v3.1/all?fields=... (cached in memory)', 'Filtering, sorting and paging all run in the browser (instant)', 'Region chips + search + sort (A-Z, population)', 'Count-up of population numbers, flag zoom on hover', 'Offline sample of 6 countries if the API is blocked'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-xc" id="countries">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Live data</span><h2>Explore the world</h2><p class="bk-xc__sum">Loading countries...</p></div>
    <div class="bk-xc__tools bk-rv" style="--i:1"><label class="bk-xc__s">${I_SEARCH}<input type="search" placeholder="Search by name or capital" aria-label="Search countries"></label><select aria-label="Sort"><option value="name">A to Z</option><option value="pop">Largest population</option><option value="small">Smallest population</option></select></div>
    <div class="bk-xc__chips"><button class="is-on" type="button" data-r="">All</button><button type="button" data-r="Asia">Asia</button><button type="button" data-r="Europe">Europe</button><button type="button" data-r="Africa">Africa</button><button type="button" data-r="Americas">Americas</button><button type="button" data-r="Oceania">Oceania</button></div>
    <div class="bk-xc__grid"></div>
    <div class="bk-xc__more"><button class="bk-pbtn bk-pbtn--ghost" type="button">Load more</button></div>
  </div>
</section>`,
    css: `.bk-xc{background:#fff}
.bk-xc__tools{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:16px}
.bk-xc__s{position:relative;flex:1;min-width:240px}
.bk-xc__s svg{position:absolute;left:16px;top:50%;margin-top:-10px;color:var(--bk-mut)}
.bk-xc__s input,.bk-xc__tools select{width:100%;padding:15px 16px 15px 46px;border:1.5px solid var(--bk-line);border-radius:999px;background:var(--bk-soft);color:var(--bk-ink);font-family:inherit;font-size:15px;transition:border-color .3s,box-shadow .3s,background .3s}
.bk-xc__tools select{width:auto;padding-left:20px;cursor:pointer}
.bk-xc__s input:focus,.bk-xc__tools select:focus{outline:0;border-color:var(--bk-a);background:#fff;box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-xc__chips{display:flex;gap:8px;overflow-x:auto;padding:4px 2px 16px;scrollbar-width:none}
.bk-xc__chips::-webkit-scrollbar{display:none}
.bk-xc__chips button{flex:none;padding:9px 20px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-mut);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-xc__chips button:hover{transform:translateY(-3px);color:var(--bk-a)}
.bk-xc__chips button.is-on{background:var(--bk-a);border-color:var(--bk-a);color:#fff}
.bk-xc__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,1.6vw,20px)}
.bk-xc__c{overflow:hidden;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t);animation:bk-xc-in .55s var(--bk-ease) both;animation-delay:calc(var(--n,0) * 35ms)}
@keyframes bk-xc-in{from{opacity:0;transform:translateY(18px) scale(.97)}}
.bk-xc__c:hover{transform:translateY(-8px);box-shadow:0 30px 46px -26px rgba(11,18,32,.45)}
.bk-xc__fl{position:relative;aspect-ratio:3/2;overflow:hidden;background:var(--bk-soft);display:grid;place-items:center;font-size:56px}
.bk-xc__fl img{width:100%;height:100%;object-fit:cover;transition:transform 1s var(--bk-ease)}
.bk-xc__c:hover .bk-xc__fl img{transform:scale(1.12)}
.bk-xc__b{padding:16px}
.bk-xc__b h3{margin-bottom:4px;font-size:17px;line-height:1.3}
.bk-xc__b small{display:inline-block;padding:3px 10px;border-radius:999px;background:var(--bk-a-l);color:var(--bk-a-d);font-size:12px;font-weight:700}
.bk-xc__b dl{display:grid;gap:4px;margin:12px 0 0;font-size:14px;color:var(--bk-mut)}
.bk-xc__b dl div{display:flex;justify-content:space-between;gap:8px}
.bk-xc__b dd{margin:0;font-weight:700;color:var(--bk-ink);text-align:right}
.bk-xc__more{display:flex;justify-content:center;margin-top:28px}
.bk-xc__more[hidden]{display:none}
.bk-xc__empty{grid-column:1/-1;padding:44px 20px;border:2px dashed var(--bk-line);border-radius:var(--bk-r);text-align:center;color:var(--bk-mut)}
@media (max-width:1100px){.bk-xc__grid{grid-template-columns:repeat(3,1fr)}}
@media (max-width:760px){.bk-xc__grid{grid-template-columns:repeat(2,1fr)}.bk-xc__b{padding:12px}}
@media (max-width:420px){.bk-xc__grid{grid-template-columns:1fr}}`,
    js: `document.querySelectorAll('.bk-xc').forEach(function (root) {
  ${H}
  var grid = root.querySelector('.bk-xc__grid'), sum = root.querySelector('.bk-xc__sum'), more = root.querySelector('.bk-xc__more');
  var input = root.querySelector('.bk-xc__s input'), sort = root.querySelector('.bk-xc__tools select'), chips = [].slice.call(root.querySelectorAll('.bk-xc__chips button'));
  var all = [], region = '', shown = 0, PAGE = 12, list = [];
  var SAMPLE = [
    { name: { common: 'India' }, capital: ['New Delhi'], region: 'Asia', population: 1417173173, flag: '\\uD83C\\uDDEE\\uD83C\\uDDF3' },
    { name: { common: 'France' }, capital: ['Paris'], region: 'Europe', population: 67391582, flag: '\\uD83C\\uDDEB\\uD83C\\uDDF7' },
    { name: { common: 'Brazil' }, capital: ['Brasilia'], region: 'Americas', population: 212559409, flag: '\\uD83C\\uDDE7\\uD83C\\uDDF7' },
    { name: { common: 'Kenya' }, capital: ['Nairobi'], region: 'Africa', population: 53771300, flag: '\\uD83C\\uDDF0\\uD83C\\uDDEA' },
    { name: { common: 'Japan' }, capital: ['Tokyo'], region: 'Asia', population: 125836021, flag: '\\uD83C\\uDDEF\\uD83C\\uDDF5' },
    { name: { common: 'Australia' }, capital: ['Canberra'], region: 'Oceania', population: 25687041, flag: '\\uD83C\\uDDE6\\uD83C\\uDDFA' }
  ];
  function card(c, i) {
    var fl = c.flags && c.flags.png ? '<img src="' + esc(c.flags.png) + '" alt="Flag of ' + esc(c.name.common) + '" loading="lazy">' : esc(c.flag || '');
    return '<article class="bk-xc__c" style="--n:' + (i % PAGE) + '"><div class="bk-xc__fl">' + fl + '</div><div class="bk-xc__b"><h3>' + esc(c.name.common) + '</h3><small>' + esc(c.region || '-') + '</small><dl><div><dt>Capital</dt><dd>' + esc((c.capital || ['-'])[0]) + '</dd></div><div><dt>Population</dt><dd>' + Number(c.population || 0).toLocaleString() + '</dd></div></dl></div></article>';
  }
  function apply(reset) {
    if (reset) {
      var q = input.value.trim().toLowerCase();
      list = all.filter(function (c) { return (!region || c.region === region) && (!q || c.name.common.toLowerCase().indexOf(q) > -1 || (c.capital || []).join(' ').toLowerCase().indexOf(q) > -1); });
      var s = sort.value;
      list.sort(function (a, b) { return s === 'pop' ? b.population - a.population : s === 'small' ? a.population - b.population : a.name.common.localeCompare(b.name.common); });
      shown = 0; grid.innerHTML = '';
    }
    var next = list.slice(shown, shown + PAGE);
    grid.insertAdjacentHTML('beforeend', next.map(function (c, i) { return card(c, i); }).join(''));
    shown += next.length;
    more.hidden = shown >= list.length;
    if (!list.length) grid.innerHTML = '<div class="bk-xc__empty">No country matches your search.</div>';
    sum.textContent = list.length + ' countries' + (region ? ' in ' + region : '');
  }
  getJson('https://restcountries.com/v3.1/all?fields=name,flags,region,capital,population').then(function (d) { all = d; apply(true); })
    .catch(function () { all = SAMPLE; apply(true); sum.textContent = 'Offline: sample of 6 countries'; });
  input.addEventListener('input', function () { apply(true); });
  sort.addEventListener('change', function () { apply(true); });
  more.querySelector('button').addEventListener('click', function () { apply(false); });
  chips.forEach(function (b) { b.addEventListener('click', function () { region = b.getAttribute('data-r'); chips.forEach(function (x) { x.classList.toggle('is-on', x === b); }); apply(true); }); });
});`,
  },

  // ============================== USERS ==============================
  {
    id: 'pro-api-users', category: 'Pro API', name: 'Team directory with Shuffle (RandomUser)',
    description: 'Profile cards loaded from randomuser.me: photo, name, city, email and phone, with a "Shuffle" button that loads a fresh set and a copy-email button.',
    specs: ['GET randomuser.me/api/?results=8 (no key)', 'Shimmer placeholders, cards flip in with stagger', 'Copy email to clipboard (with fallback), toast message', 'Initial-letter avatars when the API or photo fails', '4 -> 2 -> 1 columns'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-xu" id="people">
  <div class="bk-pw">
    <div class="bk-xu__top bk-rv"><div><span class="bk-pey">Live data</span><h2>Meet the community</h2></div><button class="bk-pbtn" type="button">${I_REFRESH}Shuffle</button></div>
    <div class="bk-xu__grid"></div>
    <p class="bk-xu__toast" role="status" aria-live="polite"></p>
  </div>
</section>`,
    css: `.bk-xu{background:var(--bk-soft)}
.bk-xu__top{display:flex;align-items:flex-end;justify-content:space-between;flex-wrap:wrap;gap:16px;margin-bottom:clamp(24px,4vw,40px)}
.bk-xu__top h2{margin-top:14px;font-size:clamp(30px,4.4vw,52px)}
.bk-xu__top .bk-pbtn svg{margin-right:8px;transition:transform .8s var(--bk-ease)}
.bk-xu__top .bk-pbtn:hover svg{transform:rotate(360deg)}
.bk-xu__grid{display:grid;grid-template-columns:repeat(4,1fr);gap:clamp(12px,1.8vw,24px)}
.bk-xu__c{position:relative;display:grid;justify-items:center;gap:4px;padding:28px 18px 22px;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);text-align:center;transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t);animation:bk-xu-in .7s var(--bk-ease) both;animation-delay:calc(var(--n,0) * 70ms)}
@keyframes bk-xu-in{from{opacity:0;transform:perspective(600px) rotateX(-25deg) translateY(24px)}}
.bk-xu__c:hover{transform:translateY(-8px);box-shadow:0 30px 46px -26px rgba(11,18,32,.45)}
.bk-xu__av{position:relative;display:grid;place-items:center;width:96px;height:96px;margin-bottom:10px;border-radius:50%;background:linear-gradient(135deg,var(--bk-a),var(--bk-a2));color:#fff;font-size:34px;font-weight:800;overflow:hidden;box-shadow:0 0 0 5px var(--bk-a-l);transition:box-shadow .4s}
.bk-xu__c:hover .bk-xu__av{box-shadow:0 0 0 5px var(--bk-a-m)}
.bk-xu__av img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
.bk-xu__c h3{font-size:18px}
.bk-xu__c p{display:flex;align-items:center;gap:6px;font-size:14px;color:var(--bk-mut)}
.bk-xu__c p svg{width:15px;height:15px;color:var(--bk-a)}
.bk-xu__mail{max-width:100%;margin-top:12px;padding:9px 14px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;transition:background .3s,color .3s,border-color .3s}
.bk-xu__mail:hover{background:var(--bk-a);border-color:var(--bk-a);color:#fff}
${sk('xu')}
.bk-xu__c.is-sk{animation:none;height:250px}
.bk-xu__toast{min-height:1.4em;margin-top:18px;text-align:center;font-size:14px;font-weight:600;color:var(--bk-a)}
@media (max-width:1000px){.bk-xu__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:480px){.bk-xu__grid{grid-template-columns:1fr}}`,
    js: `document.querySelectorAll('.bk-xu').forEach(function (root) {
  ${H}
  var grid = root.querySelector('.bk-xu__grid'), btn = root.querySelector('.bk-pbtn'), toast = root.querySelector('.bk-xu__toast');
  var NAMES = ['Aarav Nair', 'Meera Iyer', 'Liam Carter', 'Sofia Rossi', 'Kenji Mori', 'Amara Okoye', 'Noah Fischer', 'Priya Das'];
  function card(u, i) {
    var name = u.name.first + ' ' + u.name.last, init = esc(name.charAt(0));
    return '<article class="bk-xu__c" style="--n:' + i + '"><div class="bk-xu__av">' + init + (u.picture ? '<img src="' + esc(u.picture.large) + '" alt="" loading="lazy" onerror="this.remove()">' : '') + '</div><h3>' + esc(name) + '</h3>' +
      '<p>${I_PIN}' + esc(u.location.city) + ', ' + esc(u.location.country) + '</p><p>${I_CLOCK}' + esc(u.phone || '') + '</p><button class="bk-xu__mail" type="button" data-m="' + esc(u.email) + '">' + esc(u.email) + '</button></article>';
  }
  function demo() {
    return NAMES.map(function (n) { var p = n.split(' '); return { name: { first: p[0], last: p[1] }, location: { city: 'Chennai', country: 'India' }, email: p[0].toLowerCase() + '@example.com', phone: '+91 00000 00000' }; });
  }
  function load() {
    var s = ''; for (var i = 0; i < 8; i++) s += '<article class="bk-xu__c is-sk"><div class="bk-xu__sk" style="width:96px;height:96px;border-radius:50%"></div><div class="bk-xu__sk" style="width:70%;height:16px"></div><div class="bk-xu__sk" style="width:50%;height:12px"></div></article>';
    grid.innerHTML = s; toast.textContent = '';
    getJson('https://randomuser.me/api/?results=8&inc=name,picture,email,location,phone&nat=in,gb,us,fr,au')
      .then(function (d) { grid.innerHTML = d.results.map(card).join(''); })
      .catch(function () { grid.innerHTML = demo().map(card).join(''); toast.textContent = 'Offline: showing sample people.'; });
  }
  grid.addEventListener('click', function (e) {
    var b = e.target.closest('.bk-xu__mail'); if (!b) return;
    var m = b.getAttribute('data-m');
    function done() { toast.textContent = 'Copied ' + m; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(m).then(done, done); else done();
  });
  btn.addEventListener('click', load);
  load();
});`,
  },

  // ============================== GITHUB ==============================
  {
    id: 'pro-api-github', category: 'Pro API', name: 'GitHub profile + repos (GitHub API)',
    description: 'Enter a GitHub username to see the profile card with animated counters and the latest repositories with language colour, stars and forks. Handles "user not found" and rate limits.',
    specs: ['GET api.github.com/users/{name} and /users/{name}/repos?sort=updated', 'Followers / repos / following count up with easing', 'Language dots (JS, TS, Python, PHP ...), star and fork counts', 'Clear messages for 404 (not found) and 403 (rate limit)', 'Profile + repo grid stack on phones'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-xg" id="github">
  <div class="bk-pw bk-xg__in">
    <div class="bk-ph bk-rv"><span class="bk-pey">Live data</span><h2>Find a developer</h2><p>Try torvalds, gaearon or your own username.</p></div>
    <form class="bk-xg__f bk-rv" style="--i:1" novalidate><label>${I_SEARCH}<input type="search" value="octocat" placeholder="GitHub username" aria-label="GitHub username"></label><button class="bk-pbtn" type="submit">Look up</button></form>
    <p class="bk-xg__msg" role="status" aria-live="polite"></p>
    <div class="bk-xg__body">
      <aside class="bk-xg__p"><div class="bk-xg__av"><img alt=""></div><h3 class="bk-xg__n">--</h3><a class="bk-xg__u" href="#" target="_blank" rel="noopener">@user</a><p class="bk-xg__bio"></p><ul><li><b data-k="followers">0</b><small>Followers</small></li><li><b data-k="following">0</b><small>Following</small></li><li><b data-k="public_repos">0</b><small>Repos</small></li></ul></aside>
      <div class="bk-xg__repos"></div>
    </div>
  </div>
</section>`,
    css: `.bk-xg{background:#fff}
.bk-xg__in{max-width:1000px}
.bk-xg__f{display:flex;gap:10px;max-width:560px;margin:0 auto 12px}
.bk-xg__f label{position:relative;flex:1;display:block}
.bk-xg__f label svg{position:absolute;left:16px;top:50%;margin-top:-10px;color:var(--bk-mut)}
.bk-xg__f input{width:100%;padding:16px 16px 16px 46px;border:1.5px solid var(--bk-line);border-radius:999px;background:var(--bk-soft);color:var(--bk-ink);font-family:inherit;font-size:16px;transition:border-color .3s,box-shadow .3s,background .3s}
.bk-xg__f input:focus{outline:0;border-color:var(--bk-a);background:#fff;box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-xg__msg{min-height:1.4em;margin-bottom:14px;text-align:center;font-size:14px;font-weight:600;color:#dc2626}
.bk-xg__body{display:grid;grid-template-columns:300px 1fr;gap:clamp(16px,2.4vw,30px);align-items:start;transition:opacity .4s,filter .4s}
.bk-xg__body.is-load{opacity:.4;filter:blur(3px);pointer-events:none}
.bk-xg__p{display:grid;justify-items:center;gap:6px;padding:28px 22px;border-radius:calc(var(--bk-r) + 4px);background:linear-gradient(180deg,var(--bk-a-l),#fff);border:1px solid var(--bk-line);text-align:center;box-shadow:var(--bk-sh)}
.bk-xg__av{width:120px;height:120px;border-radius:50%;overflow:hidden;background:var(--bk-line);box-shadow:0 0 0 6px #fff,0 0 0 8px var(--bk-a-m);animation:bk-bob 6s ease-in-out infinite}
.bk-xg__av img{width:100%;height:100%;object-fit:cover}
.bk-xg__n{margin-top:12px;font-size:22px}
.bk-xg__u{color:var(--bk-a);font-weight:700;text-decoration:none}
.bk-xg__u:hover{text-decoration:underline}
.bk-xg__bio{margin:6px 0 10px;font-size:14.5px;color:var(--bk-mut)}
.bk-xg__p ul{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;width:100%;margin:0;padding:14px 0 0;border-top:1px solid var(--bk-line);list-style:none}
.bk-xg__p li b{display:block;font-size:20px}
.bk-xg__p li small{font-size:12px;color:var(--bk-mut)}
.bk-xg__repos{display:grid;grid-template-columns:repeat(2,1fr);gap:clamp(10px,1.4vw,16px)}
.bk-xg__r{display:flex;flex-direction:column;gap:8px;padding:20px;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);text-decoration:none;color:var(--bk-ink);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t),border-color .3s;animation:bk-xg-in .6s var(--bk-ease) both;animation-delay:calc(var(--n,0) * 60ms)}
@keyframes bk-xg-in{from{opacity:0;transform:translateY(16px)}}
.bk-xg__r:hover{transform:translateY(-6px);border-color:var(--bk-a);box-shadow:0 26px 40px -26px var(--bk-a)}
.bk-xg__r h4{font-size:17px;color:var(--bk-a);word-break:break-word}
.bk-xg__r p{flex:1;font-size:14px;color:var(--bk-mut)}
.bk-xg__r div{display:flex;flex-wrap:wrap;align-items:center;gap:14px;font-size:13px;color:var(--bk-mut)}
.bk-xg__r i{display:inline-block;width:11px;height:11px;margin-right:5px;border-radius:50%;background:var(--c,#94a3b8)}
.bk-xg__r span{display:inline-flex;align-items:center;gap:4px}
.bk-xg__r svg{width:15px;height:15px}
.bk-xg__empty{grid-column:1/-1;padding:30px;border:2px dashed var(--bk-line);border-radius:var(--bk-r);text-align:center;color:var(--bk-mut)}
@media (max-width:860px){.bk-xg__body{grid-template-columns:1fr}}
@media (max-width:560px){.bk-xg__repos{grid-template-columns:1fr}.bk-xg__f .bk-pbtn{padding:0 18px}}`,
    js: `document.querySelectorAll('.bk-xg').forEach(function (root) {
  ${H}
  var form = root.querySelector('.bk-xg__f'), input = form.querySelector('input'), msg = root.querySelector('.bk-xg__msg'), body = root.querySelector('.bk-xg__body'), repos = root.querySelector('.bk-xg__repos');
  var COLORS = { JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572a5', PHP: '#4f5d95', HTML: '#e34c26', CSS: '#563d7c', Java: '#b07219', Go: '#00add8', Rust: '#dea584', Ruby: '#701516', 'C++': '#f34b7d', C: '#555555', Shell: '#89e051', Kotlin: '#a97bff', Dart: '#00b4ab', Vue: '#41b883' };
  var token = 0;
  function count(el, to) {
    var t0 = null, from = 0;
    function f(t) { if (!t0) t0 = t; var p = Math.min(1, (t - t0) / 1100); el.textContent = Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))).toLocaleString(); if (p < 1) requestAnimationFrame(f); }
    requestAnimationFrame(f);
  }
  function show(u, list) {
    root.querySelector('.bk-xg__av img').src = u.avatar_url || '';
    root.querySelector('.bk-xg__n').textContent = u.name || u.login;
    var a = root.querySelector('.bk-xg__u'); a.textContent = '@' + u.login; a.href = u.html_url || '#';
    root.querySelector('.bk-xg__bio').textContent = u.bio || 'No bio yet.';
    ['followers', 'following', 'public_repos'].forEach(function (k) { count(root.querySelector('[data-k=' + k + ']'), u[k] || 0); });
    repos.innerHTML = list.length ? list.map(function (r, i) {
      return '<a class="bk-xg__r" style="--n:' + i + '" href="' + esc(r.html_url) + '" target="_blank" rel="noopener"><h4>' + esc(r.name) + '</h4><p>' + esc(r.description || 'No description') + '</p><div>' +
        (r.language ? '<span><i style="--c:' + (COLORS[r.language] || '#94a3b8') + '"></i>' + esc(r.language) + '</span>' : '') + '<span>${I_STAR}' + (r.stargazers_count || 0) + '</span><span>${I_FORK}' + (r.forks_count || 0) + '</span></div></a>';
    }).join('') : '<div class="bk-xg__empty">No public repositories yet.</div>';
  }
  function search(name) {
    var my = ++token;
    body.classList.add('is-load'); msg.textContent = '';
    Promise.all([getJson('https://api.github.com/users/' + encodeURIComponent(name)), getJson('https://api.github.com/users/' + encodeURIComponent(name) + '/repos?sort=updated&per_page=6')])
      .then(function (r) { if (my === token) { show(r[0], r[1]); body.classList.remove('is-load'); } })
      .catch(function (e) {
        if (my !== token) return;
        body.classList.remove('is-load');
        if (/404/.test(e.message)) msg.textContent = 'User not found. Check the spelling.';
        else if (/403|429/.test(e.message)) msg.textContent = 'GitHub limit reached for now (60 requests per hour). Try again later.';
        else { msg.textContent = 'Could not reach GitHub. Showing a sample profile.'; show({ login: 'sample', name: 'Sample Developer', bio: 'Offline demo profile.', followers: 1280, following: 42, public_repos: 3, avatar_url: '${img('bk-xg-av', 240, 240)}', html_url: '#' },
          [{ name: 'awesome-ui', description: 'A tiny UI kit', language: 'TypeScript', stargazers_count: 420, forks_count: 31, html_url: '#' }, { name: 'dotfiles', description: 'My setup', language: 'Shell', stargazers_count: 12, forks_count: 2, html_url: '#' }]); }
      });
  }
  form.addEventListener('submit', function (e) { e.preventDefault(); var v = input.value.trim(); if (v) search(v); });
  search(input.value);
});`,
  },

  // ============================== QUOTES ==============================
  {
    id: 'pro-api-quote', category: 'Pro API', name: 'Quote of the moment (fetch + copy)',
    description: 'A big, elegant quote card that fetches a new quote on each click, fades the text in word by word, and lets you copy or tweet it. Small, light, easy to restyle.',
    specs: ['GET dummyjson.com/quotes/random (falls back to 8 built-in quotes)', 'Word-by-word fade-in animation (CSS delay per word)', 'New quote button with spinning icon, copy button, share link', 'Serif display type, giant quote mark, centered at every width'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-xq" id="quote">
  <div class="bk-pw bk-xq__in">
    <div class="bk-xq__card bk-rv">
      <span class="bk-xq__mark" aria-hidden="true">&ldquo;</span>
      <blockquote class="bk-xq__t" aria-live="polite">Loading a quote...</blockquote>
      <p class="bk-xq__a"></p>
      <div class="bk-xq__btns"><button class="bk-pbtn" type="button">${I_REFRESH}New quote</button><button class="bk-xq__cp" type="button">${I_COPY}Copy</button><a class="bk-xq__sh" href="#" target="_blank" rel="noopener">Share</a></div>
      <p class="bk-xq__m" role="status" aria-live="polite"></p>
    </div>
  </div>
</section>`,
    css: `.bk-xq{--bk-hf:"Playfair Display",Georgia,serif;background:linear-gradient(135deg,var(--bk-a-l),#fff 60%)}
.bk-xq__in{max-width:860px}
.bk-xq__card{position:relative;overflow:hidden;padding:clamp(34px,6vw,76px) clamp(22px,5vw,64px);border-radius:calc(var(--bk-r) + 10px);background:#fff;border:1px solid var(--bk-line);text-align:center;box-shadow:0 40px 80px -44px rgba(11,18,32,.5)}
.bk-xq__mark{position:absolute;left:50%;top:-40px;transform:translateX(-50%);font-family:var(--bk-hf);font-size:clamp(180px,30vw,300px);line-height:1;color:var(--bk-a-l);pointer-events:none}
.bk-xq__t{position:relative;margin:0 0 22px;font-family:var(--bk-hf);font-size:clamp(24px,4vw,42px);font-weight:500;line-height:1.35;letter-spacing:-.01em;color:var(--bk-ink)}
.bk-xq__t span{display:inline-block;opacity:0;transform:translateY(10px);animation:bk-xq-w .6s var(--bk-ease) forwards;animation-delay:calc(var(--w,0) * 40ms)}
@keyframes bk-xq-w{to{opacity:1;transform:none}}
.bk-xq__a{position:relative;margin-bottom:30px;font-size:15px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:var(--bk-a)}
.bk-xq__btns{position:relative;display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:12px}
.bk-xq__btns .bk-pbtn svg{margin-right:8px;transition:transform .8s var(--bk-ease)}
.bk-xq__btns .bk-pbtn.is-spin svg{transform:rotate(360deg)}
.bk-xq__cp,.bk-xq__sh{display:inline-flex;align-items:center;gap:8px;padding:14px 24px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:15px;font-weight:700;text-decoration:none;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-xq__cp:hover,.bk-xq__sh:hover{background:var(--bk-a-l);border-color:var(--bk-a);color:var(--bk-a);transform:translateY(-3px)}
.bk-xq__m{min-height:1.4em;margin-top:14px;font-size:14px;font-weight:600;color:var(--bk-a)}
@media (max-width:520px){.bk-xq__btns>*{flex:1 1 100%;justify-content:center}}
@media (prefers-reduced-motion:reduce){.bk-xq__t span{opacity:1;transform:none;animation:none}}`,
    js: `document.querySelectorAll('.bk-xq').forEach(function (root) {
  ${H}
  var t = root.querySelector('.bk-xq__t'), a = root.querySelector('.bk-xq__a'), m = root.querySelector('.bk-xq__m');
  var btn = root.querySelector('.bk-xq__btns .bk-pbtn'), cp = root.querySelector('.bk-xq__cp'), sh = root.querySelector('.bk-xq__sh');
  var LOCAL = [
    ['The best way to predict the future is to create it.', 'Peter Drucker'], ['Well begun is half done.', 'Aristotle'], ['Simplicity is the ultimate sophistication.', 'Leonardo da Vinci'],
    ['Quality is not an act, it is a habit.', 'Will Durant'], ['Do the hard jobs first. The easy jobs will take care of themselves.', 'Dale Carnegie'], ['Make it work, make it right, make it fast.', 'Kent Beck'],
    ['Stay hungry, stay foolish.', 'Steve Jobs'], ['Done is better than perfect.', 'Sheryl Sandberg']
  ];
  var cur = { q: '', a: '' }, token = 0;
  function put(q, author) {
    cur = { q: q, a: author };
    t.innerHTML = q.split(' ').map(function (w, i) { return '<span style="--w:' + i + '">' + esc(w) + '&nbsp;</span>'; }).join('');
    a.textContent = author ? '\\u2014 ' + author : '';
    sh.href = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent('\\u201C' + q + '\\u201D ' + (author ? '\\u2014 ' + author : ''));
  }
  function next() {
    var my = ++token; m.textContent = '';
    btn.classList.remove('is-spin'); void btn.offsetWidth; btn.classList.add('is-spin');
    getJson('https://dummyjson.com/quotes/random').then(function (d) { if (my === token) put(d.quote, d.author); })
      .catch(function () { var p = LOCAL[Math.floor(Math.random() * LOCAL.length)]; if (my === token) put(p[0], p[1]); });
  }
  cp.addEventListener('click', function () {
    var s = '\\u201C' + cur.q + '\\u201D \\u2014 ' + cur.a;
    function done() { m.textContent = 'Copied to clipboard'; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(s).then(done, done); else done();
  });
  btn.addEventListener('click', next);
  next();
});`,
  },

  // ============================== RECIPES ==============================
  {
    id: 'pro-api-recipes', category: 'Pro API', name: 'Recipe finder with detail dialog (2 requests)',
    description: 'Recipe cards from an API with cuisine filter chips. Click a card and a second request loads the ingredients and step-by-step method into a modal dialog.',
    specs: ['List: dummyjson.com/recipes, detail: /recipes/{id} (list -> detail pattern)', 'Native <dialog> modal with Esc and backdrop click, focus returns to the card', 'Cuisine filter built from the loaded data', 'Time, difficulty, calories and rating badges; skeleton while loading', '3 -> 2 -> 1 columns; dialog full-screen on phones'],
    tags: ['E-commerce'], shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-xr" id="recipes">
  <div class="bk-pw">
    <div class="bk-ph bk-rv"><span class="bk-pey">Live data</span><h2>What shall we cook?</h2><p>Tap a recipe to see the full method.</p></div>
    <div class="bk-xr__chips"><button class="is-on" type="button" data-c="">All</button></div>
    <div class="bk-xr__grid"></div>
    <dialog class="bk-xr__d" aria-label="Recipe details"><button class="bk-xr__x" type="button" aria-label="Close">&times;</button><div class="bk-xr__dc"></div></dialog>
  </div>
</section>`,
    css: `.bk-xr{background:#fffaf3}
.bk-xr__chips{display:flex;justify-content:center;flex-wrap:wrap;gap:8px;margin-bottom:28px}
.bk-xr__chips button{padding:9px 20px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-mut);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-xr__chips button:hover{transform:translateY(-3px);color:var(--bk-a)}
.bk-xr__chips button.is-on{background:var(--bk-ink);border-color:var(--bk-ink);color:#fff}
.bk-xr__grid{display:grid;grid-template-columns:repeat(3,1fr);gap:clamp(14px,2vw,26px)}
.bk-xr__c{display:flex;flex-direction:column;overflow:hidden;padding:0;border:1px solid var(--bk-line);border-radius:var(--bk-r);background:#fff;color:var(--bk-ink);font-family:inherit;text-align:left;cursor:pointer;transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t);animation:bk-xr-in .6s var(--bk-ease) both;animation-delay:calc(var(--n,0) * 60ms)}
@keyframes bk-xr-in{from{opacity:0;transform:translateY(20px)}}
.bk-xr__c:hover{transform:translateY(-8px);box-shadow:0 34px 56px -28px rgba(11,18,32,.45)}
.bk-xr__c:focus-visible{outline:3px solid var(--bk-a-m);outline-offset:3px}
.bk-xr__pic{position:relative;aspect-ratio:4/3;overflow:hidden;background:var(--bk-line)}
.bk-xr__pic img{width:100%;height:100%;object-fit:cover;transition:transform 1.1s var(--bk-ease)}
.bk-xr__c:hover .bk-xr__pic img{transform:scale(1.1)}
.bk-xr__lv{position:absolute;left:12px;top:12px;padding:5px 12px;border-radius:999px;background:#fff;font-size:12px;font-weight:800;color:#15803d}
.bk-xr__lv.is-m{color:#b45309}
.bk-xr__lv.is-h{color:#b91c1c}
.bk-xr__b{display:grid;gap:8px;padding:18px 20px 20px}
.bk-xr__b small{font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--bk-a)}
.bk-xr__b h3{font-size:19px;line-height:1.3}
.bk-xr__m{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13.5px;color:var(--bk-mut)}
.bk-xr__m span{display:inline-flex;align-items:center;gap:5px}
.bk-xr__m svg{width:15px;height:15px;color:var(--bk-a)}
${sk('xr')}
.bk-xr__c.is-sk{pointer-events:none;height:330px;animation:none}
.bk-xr__d{width:min(760px,calc(100vw - 24px));max-height:calc(100vh - 24px);padding:0;border:0;border-radius:calc(var(--bk-r) + 6px);background:#fff;color:var(--bk-ink);overflow:auto;box-shadow:0 60px 120px -30px rgba(0,0,0,.6)}
.bk-xr__d::backdrop{background:rgba(8,14,30,.6);-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)}
.bk-xr__d[open]{animation:bk-xr-pop .5s var(--bk-ease)}
@keyframes bk-xr-pop{from{opacity:0;transform:translateY(24px) scale(.95)}}
.bk-xr__x{position:sticky;float:right;top:12px;right:12px;z-index:2;display:grid;place-items:center;width:40px;height:40px;margin:12px 12px 0 0;padding:0;border:0;border-radius:50%;background:#fff;color:var(--bk-ink);font-size:24px;line-height:1;box-shadow:0 8px 20px -8px rgba(0,0,0,.4);cursor:pointer;transition:transform .5s var(--bk-ease),background .3s,color .3s}
.bk-xr__x:hover{transform:rotate(90deg);background:var(--bk-a);color:#fff}
.bk-xr__dc img{display:block;width:100%;aspect-ratio:16/8;object-fit:cover}
.bk-xr__dc>div{padding:clamp(20px,4vw,36px)}
.bk-xr__dc h3{margin-bottom:10px;font-size:clamp(24px,3.4vw,34px)}
.bk-xr__cols{display:grid;grid-template-columns:.9fr 1.1fr;gap:28px;margin-top:20px}
.bk-xr__dc h4{margin-bottom:10px;font-size:15px;letter-spacing:.1em;text-transform:uppercase;color:var(--bk-a)}
.bk-xr__dc ul,.bk-xr__dc ol{display:grid;gap:8px;margin:0;padding-left:20px;font-size:15px;color:#334155}
@media (max-width:1000px){.bk-xr__grid{grid-template-columns:repeat(2,1fr)}}
@media (max-width:640px){.bk-xr__grid{grid-template-columns:1fr}.bk-xr__cols{grid-template-columns:1fr}.bk-xr__d{width:100vw;max-height:100vh;height:100vh;border-radius:0}}`,
    js: `document.querySelectorAll('.bk-xr').forEach(function (root) {
  ${H}
  var grid = root.querySelector('.bk-xr__grid'), chips = root.querySelector('.bk-xr__chips'), dlg = root.querySelector('.bk-xr__d'), dc = root.querySelector('.bk-xr__dc');
  var all = [], from = null;
  var SAMPLE = [
    { id: 0, name: 'Classic Margherita Pizza', image: '${img('bk-xr-1', 600, 450)}', cuisine: 'Italian', difficulty: 'Easy', prepTimeMinutes: 20, cookTimeMinutes: 15, caloriesPerServing: 300, rating: 4.6, ingredients: ['Pizza dough', 'Tomato sauce', 'Mozzarella', 'Fresh basil', 'Olive oil'], instructions: ['Preheat the oven to 250C.', 'Stretch the dough and spread the sauce.', 'Add cheese and bake for 12 minutes.', 'Top with basil and a drizzle of oil.'] },
    { id: 0, name: 'Chicken Biryani', image: '${img('bk-xr-2', 600, 450)}', cuisine: 'Indian', difficulty: 'Medium', prepTimeMinutes: 30, cookTimeMinutes: 45, caloriesPerServing: 520, rating: 4.9, ingredients: ['Basmati rice', 'Chicken', 'Yoghurt', 'Onions', 'Spices'], instructions: ['Marinate the chicken.', 'Fry the onions until golden.', 'Layer rice and chicken.', 'Cook on low heat for 30 minutes.'] }
  ];
  function lv(d) { return d === 'Easy' ? '' : d === 'Medium' ? ' is-m' : ' is-h'; }
  function card(r, i) {
    return '<button class="bk-xr__c" type="button" data-i="' + i + '" style="--n:' + (i % 9) + '"><div class="bk-xr__pic"><img src="' + esc(r.image) + '" alt="" loading="lazy"><span class="bk-xr__lv' + lv(r.difficulty) + '">' + esc(r.difficulty) + '</span></div>' +
      '<div class="bk-xr__b"><small>' + esc(r.cuisine) + '</small><h3>' + esc(r.name) + '</h3><div class="bk-xr__m"><span>${I_CLOCK}' + (r.prepTimeMinutes + r.cookTimeMinutes) + ' min</span><span>${I_STAR}' + esc(r.rating) + '</span><span>' + esc(r.caloriesPerServing) + ' kcal</span></div></div></button>';
  }
  function draw(c) {
    var list = all.filter(function (r) { return !c || r.cuisine === c; });
    grid.innerHTML = list.map(function (r) { return card(r, all.indexOf(r)); }).join('');
  }
  function build() {
    var set = {}; all.forEach(function (r) { set[r.cuisine] = 1; });
    chips.innerHTML = '<button class="is-on" type="button" data-c="">All</button>' + Object.keys(set).slice(0, 8).map(function (c) { return '<button type="button" data-c="' + esc(c) + '">' + esc(c) + '</button>'; }).join('');
    draw('');
  }
  var s = ''; for (var k = 0; k < 6; k++) s += '<div class="bk-xr__c is-sk bk-xr__sk"></div>';
  grid.innerHTML = s;
  getJson('https://dummyjson.com/recipes?limit=12&select=name,image,cuisine,difficulty,prepTimeMinutes,cookTimeMinutes,caloriesPerServing,rating').then(function (d) { all = d.recipes; build(); })
    .catch(function () { all = SAMPLE; build(); });
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    [].slice.call(chips.children).forEach(function (x) { x.classList.toggle('is-on', x === b); });
    draw(b.getAttribute('data-c'));
  });
  function open(r) {
    function paint(d) {
      dc.innerHTML = '<img src="' + esc(d.image) + '" alt=""><div><h3>' + esc(d.name) + '</h3><div class="bk-xr__m"><span>${I_CLOCK}Prep ' + esc(d.prepTimeMinutes) + ' min</span><span>Cook ' + esc(d.cookTimeMinutes) + ' min</span><span>${I_STAR}' + esc(d.rating) + '</span><span>' + esc(d.caloriesPerServing) + ' kcal</span></div>' +
        '<div class="bk-xr__cols"><div><h4>Ingredients</h4><ul>' + (d.ingredients || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div><div><h4>Method</h4><ol>' + (d.instructions || []).map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ol></div></div></div>';
    }
    if (!dlg.open) { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); }
    if (r.ingredients) { paint(r); return; }
    dc.innerHTML = '<div style="padding:60px 20px;text-align:center">Loading recipe...</div>';
    getJson('https://dummyjson.com/recipes/' + r.id).then(paint).catch(function () { dc.innerHTML = '<div style="padding:60px 20px;text-align:center">Could not load this recipe. Close and try again.</div>'; });
  }
  grid.addEventListener('click', function (e) { var b = e.target.closest('.bk-xr__c'); if (!b || b.classList.contains('is-sk')) return; from = b; open(all[parseInt(b.getAttribute('data-i'), 10)]); });
  root.querySelector('.bk-xr__x').addEventListener('click', function () { dlg.close ? dlg.close() : dlg.removeAttribute('open'); });
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (from) from.focus(); });
});`,
  },

  // ============================== POSTS + FORM (POST) ==============================
  {
    id: 'pro-api-posts', category: 'Pro API', name: 'Posts feed + create form (GET and POST)',
    description: 'Shows how to READ and WRITE with an API. Latest posts load with GET, and the form sends a POST (JSONPlaceholder test API) then adds the new post to the top with a "Sent" badge.',
    specs: ['GET jsonplaceholder.typicode.com/posts?_limit=6 and POST /posts with JSON body + headers', 'Validation (title 3+ chars, body 10+ chars) with inline errors', 'Submit button shows a spinner while sending and disables to stop double submits', 'New post animates in at the top; the test API fakes the save', 'Replace the URL with your own backend endpoint'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-xs" id="posts" data-api="https://jsonplaceholder.typicode.com/posts">
  <div class="bk-pw bk-xs__in">
    <div class="bk-ph bk-rv"><span class="bk-pey">GET + POST</span><h2>Community posts</h2></div>
    <div class="bk-xs__g">
      <form class="bk-xs__f bk-rv bk-rv--l" novalidate><h3>Write a post</h3><label>Title<input type="text" name="title" placeholder="A short title" autocomplete="off"><small></small></label><label>Message<textarea name="body" rows="5" placeholder="What do you want to share?"></textarea><small></small></label><button class="bk-pbtn" type="submit"><span>Publish ${AR}</span></button><p class="bk-xs__m" role="status" aria-live="polite"></p></form>
      <div class="bk-xs__list bk-rv bk-rv--r" style="--i:1"></div>
    </div>
  </div>
</section>`,
    css: `.bk-xs{background:var(--bk-soft)}
.bk-xs__in{max-width:1100px}
.bk-xs__g{display:grid;grid-template-columns:.9fr 1.1fr;gap:clamp(16px,2.6vw,34px);align-items:start}
.bk-xs__f{position:sticky;top:90px;display:grid;gap:16px;padding:clamp(20px,3vw,34px);border-radius:calc(var(--bk-r) + 4px);background:#fff;border:1px solid var(--bk-line);box-shadow:var(--bk-sh)}
.bk-xs__f h3{font-size:22px}
.bk-xs__f label{display:grid;gap:6px;font-size:14px;font-weight:700}
.bk-xs__f input,.bk-xs__f textarea{width:100%;padding:14px 16px;border:1.5px solid var(--bk-line);border-radius:14px;background:var(--bk-soft);color:var(--bk-ink);font-family:inherit;font-size:15.5px;font-weight:500;resize:vertical;transition:border-color .3s,box-shadow .3s,background .3s}
.bk-xs__f input:focus,.bk-xs__f textarea:focus{outline:0;border-color:var(--bk-a);background:#fff;box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-xs__f .is-bad{border-color:#dc2626;background:#fff5f5}
.bk-xs__f small{min-height:1.2em;font-size:13px;font-weight:600;color:#dc2626}
.bk-xs__f .bk-pbtn{justify-content:center}
.bk-xs__f .bk-pbtn.is-busy{pointer-events:none;opacity:.8}
.bk-xs__f .bk-pbtn.is-busy span::before{content:"";display:inline-block;width:16px;height:16px;margin-right:10px;vertical-align:-3px;border:2.5px solid rgba(255,255,255,.4);border-top-color:#fff;border-radius:50%;animation:bk-spin .7s linear infinite}
.bk-xs__m{min-height:1.4em;font-size:14px;font-weight:600;color:#dc2626}
.bk-xs__m.is-ok{color:#16a34a}
.bk-xs__list{display:grid;gap:12px}
.bk-xs__p{position:relative;padding:20px 22px;border-radius:var(--bk-r);background:#fff;border:1px solid var(--bk-line);transition:transform var(--bk-t) var(--bk-ease),box-shadow var(--bk-t),border-color .3s;animation:bk-xs-in .6s var(--bk-ease) both;animation-delay:calc(var(--n,0) * 60ms)}
@keyframes bk-xs-in{from{opacity:0;transform:translateY(16px)}}
.bk-xs__p:hover{transform:translateX(6px);border-color:var(--bk-a-m);box-shadow:var(--bk-sh)}
.bk-xs__p.is-new{border-color:var(--bk-a);background:linear-gradient(90deg,var(--bk-a-l),#fff)}
.bk-xs__p em{position:absolute;right:16px;top:16px;padding:3px 10px;border-radius:999px;background:var(--bk-a);color:#fff;font-size:11.5px;font-style:normal;font-weight:800}
.bk-xs__p h4{margin:0 70px 6px 0;font-size:17px;text-transform:capitalize}
.bk-xs__p p{font-size:14.5px;color:var(--bk-mut);line-height:1.6}
.bk-xs__p small{display:block;margin-top:10px;font-size:12px;color:var(--bk-mut)}
@media (max-width:860px){.bk-xs__g{grid-template-columns:1fr}.bk-xs__f{position:static}}`,
    js: `document.querySelectorAll('.bk-xs').forEach(function (root) {
  ${H}
  var API = root.getAttribute('data-api') || 'https://jsonplaceholder.typicode.com/posts';
  var list = root.querySelector('.bk-xs__list'), form = root.querySelector('.bk-xs__f'), msg = root.querySelector('.bk-xs__m'), btn = form.querySelector('.bk-pbtn');
  var title = form.elements.title, body = form.elements.body, n = 0;
  function item(p, fresh) {
    return '<article class="bk-xs__p' + (fresh ? ' is-new' : '') + '" style="--n:' + (n++ % 8) + '">' + (fresh ? '<em>Sent</em>' : '') + '<h4>' + esc(p.title) + '</h4><p>' + esc(p.body) + '</p><small>Post #' + esc(p.id) + '</small></article>';
  }
  getJson(API + '?_limit=6').then(function (d) { list.innerHTML = d.map(function (p) { return item(p, false); }).join(''); })
    .catch(function () { list.innerHTML = item({ id: 1, title: 'Offline sample post', body: 'The posts API could not be reached. Your form still works as a demo.' }, false); });
  function bad(el, text) { el.classList.toggle('is-bad', !!text); el.parentNode.querySelector('small').textContent = text || ''; return !text; }
  form.addEventListener('submit', function (e) {
    e.preventDefault(); msg.textContent = ''; msg.className = 'bk-xs__m';
    var a = bad(title, title.value.trim().length < 3 ? 'Please add a title (3+ characters).' : '');
    var b = bad(body, body.value.trim().length < 10 ? 'Please write at least 10 characters.' : '');
    if (!a || !b) return;
    btn.classList.add('is-busy');
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=UTF-8' }, body: JSON.stringify({ title: title.value.trim(), body: body.value.trim(), userId: 1 }) })
      .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(function (p) { list.insertAdjacentHTML('afterbegin', item({ id: p.id, title: title.value.trim(), body: body.value.trim() }, true)); form.reset(); msg.className = 'bk-xs__m is-ok'; msg.textContent = 'Published! The server answered with id ' + p.id + '.'; })
      .catch(function () { msg.textContent = 'Could not send. Check your connection and try again.'; })
      .then(function () { btn.classList.remove('is-busy'); });
  });
  [title, body].forEach(function (el) { el.addEventListener('input', function () { bad(el, ''); }); });
});`,
  },

  // ============================== CURRENCY ==============================
  {
    id: 'pro-api-currency', category: 'Pro API', name: 'Currency converter (Frankfurter API)',
    description: 'Live exchange-rate converter: type an amount, choose two currencies, press swap. Shows the current rate and the date, with a smooth number roll when the result changes.',
    specs: ['GET api.frankfurter.app/currencies and /latest?amount=&from=&to=', 'Debounced conversion while typing, swap button spins', 'Shows 1 unit rate + update date, popular currency shortcuts', 'Offline: uses built-in approximate rates and says so', 'Stacks vertically on phones'],
    shared: ['pro'],
    html: `<section class="bk-p bk-ps bk-xf" id="converter">
  <div class="bk-pw bk-xf__in">
    <div class="bk-ph bk-rv"><span class="bk-pey">Live rates</span><h2>Currency converter</h2></div>
    <div class="bk-xf__card bk-rv" style="--i:1">
      <div class="bk-xf__row">
        <label>Amount<input class="bk-xf__amt" type="number" inputmode="decimal" min="0" value="100" aria-label="Amount"></label>
        <label>From<select class="bk-xf__from" aria-label="From currency"><option value="USD">USD</option><option value="EUR">EUR</option><option value="INR">INR</option><option value="GBP">GBP</option></select></label>
        <button class="bk-xf__sw" type="button" aria-label="Swap currencies">${I_SWAP}</button>
        <label>To<select class="bk-xf__to" aria-label="To currency"><option value="INR">INR</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></select></label>
      </div>
      <div class="bk-xf__res"><small class="bk-xf__eq">--</small><b class="bk-xf__out">--</b><span class="bk-xf__rate"></span></div>
      <div class="bk-xf__quick"><button type="button" data-p="USD:INR">USD &rarr; INR</button><button type="button" data-p="EUR:USD">EUR &rarr; USD</button><button type="button" data-p="GBP:EUR">GBP &rarr; EUR</button><button type="button" data-p="USD:JPY">USD &rarr; JPY</button></div>
    </div>
  </div>
</section>`,
    css: `.bk-xf{background:linear-gradient(180deg,var(--bk-soft),#fff)}
.bk-xf__in{max-width:820px}
.bk-xf__card{padding:clamp(22px,4vw,40px);border-radius:calc(var(--bk-r) + 8px);background:#fff;border:1px solid var(--bk-line);box-shadow:0 40px 80px -44px rgba(11,18,32,.5)}
.bk-xf__row{display:grid;grid-template-columns:1.2fr 1fr auto 1fr;gap:12px;align-items:end}
.bk-xf__row label{display:grid;gap:6px;font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--bk-mut)}
.bk-xf__row input,.bk-xf__row select{width:100%;padding:15px 14px;border:1.5px solid var(--bk-line);border-radius:14px;background:var(--bk-soft);color:var(--bk-ink);font-family:inherit;font-size:17px;font-weight:700;letter-spacing:0;text-transform:none;transition:border-color .3s,box-shadow .3s,background .3s}
.bk-xf__row input:focus,.bk-xf__row select:focus{outline:0;border-color:var(--bk-a);background:#fff;box-shadow:0 0 0 4px var(--bk-a-l)}
.bk-xf__sw{display:grid;place-items:center;width:50px;height:50px;margin-bottom:2px;padding:0;border:0;border-radius:50%;background:var(--bk-a);color:#fff;cursor:pointer;box-shadow:0 14px 24px -10px var(--bk-a);transition:transform .7s var(--bk-ease)}
.bk-xf__sw:hover{transform:rotate(180deg) scale(1.08)}
.bk-xf__res{display:grid;gap:4px;margin:26px 0 18px;padding:24px;border-radius:20px;background:linear-gradient(135deg,var(--bk-a-l),#fff);border:1px solid var(--bk-a-m);text-align:center}
.bk-xf__eq{font-size:15px;color:var(--bk-mut)}
.bk-xf__out{font-size:clamp(34px,7vw,60px);letter-spacing:-.04em;color:var(--bk-a-d);transition:opacity .25s,transform .35s var(--bk-ease)}
.bk-xf__out.is-roll{opacity:0;transform:translateY(10px)}
.bk-xf__rate{font-size:13.5px;color:var(--bk-mut)}
.bk-xf__quick{display:flex;flex-wrap:wrap;justify-content:center;gap:8px}
.bk-xf__quick button{padding:9px 16px;border:1.5px solid var(--bk-line);border-radius:999px;background:#fff;color:var(--bk-ink);font-family:inherit;font-size:14px;font-weight:700;cursor:pointer;transition:background .3s,color .3s,border-color .3s,transform .4s var(--bk-ease)}
.bk-xf__quick button:hover{background:var(--bk-a);border-color:var(--bk-a);color:#fff;transform:translateY(-3px)}
@media (max-width:640px){.bk-xf__row{grid-template-columns:1fr 1fr}.bk-xf__row label:first-child{grid-column:1/-1}.bk-xf__sw{grid-column:1/-1;justify-self:center;margin:0}.bk-xf__sw{order:3}}`,
    js: `document.querySelectorAll('.bk-xf').forEach(function (root) {
  ${H}
  var amt = root.querySelector('.bk-xf__amt'), from = root.querySelector('.bk-xf__from'), to = root.querySelector('.bk-xf__to');
  var eq = root.querySelector('.bk-xf__eq'), out = root.querySelector('.bk-xf__out'), rate = root.querySelector('.bk-xf__rate');
  var timer = null, token = 0;
  var APPROX = { USD: 1, EUR: 0.92, INR: 83, GBP: 0.79, JPY: 150 };
  function fmt(n, c) { try { return new Intl.NumberFormat(undefined, { style: 'currency', currency: c, maximumFractionDigits: 2 }).format(n); } catch (e) { return n.toFixed(2) + ' ' + c; } }
  function show(a, f, t, value, r, note) {
    eq.textContent = fmt(a, f) + ' =';
    out.classList.add('is-roll');
    setTimeout(function () { out.textContent = fmt(value, t); out.classList.remove('is-roll'); }, 160);
    rate.textContent = '1 ' + f + ' = ' + r.toFixed(4) + ' ' + t + note;
  }
  function convert() {
    var a = parseFloat(amt.value), f = from.value, t = to.value, my = ++token;
    if (!(a >= 0)) { eq.textContent = 'Enter an amount'; out.textContent = '--'; rate.textContent = ''; return; }
    if (f === t) { show(a, f, t, a, 1, ''); return; }
    getJson('https://api.frankfurter.app/latest?amount=' + a + '&from=' + f + '&to=' + t).then(function (d) {
      if (my === token) show(a, f, t, d.rates[t], d.rates[t] / (a || 1), ' (rates of ' + d.date + ')');
    }).catch(function () {
      if (my !== token) return;
      var r = (APPROX[t] || 1) / (APPROX[f] || 1);
      show(a, f, t, a * r, r, ' (offline, approximate)');
    });
  }
  function fill(list) {
    var keep = [from.value, to.value];
    [from, to].forEach(function (sel, i) { sel.innerHTML = list.map(function (c) { return '<option value="' + c + '">' + c + '</option>'; }).join(''); sel.value = keep[i]; });
  }
  getJson('https://api.frankfurter.app/currencies').then(function (d) { fill(Object.keys(d)); convert(); }).catch(function () {});
  amt.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(convert, 300); });
  from.addEventListener('change', convert); to.addEventListener('change', convert);
  root.querySelector('.bk-xf__sw').addEventListener('click', function () { var a = from.value; from.value = to.value; to.value = a; convert(); });
  root.querySelector('.bk-xf__quick').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var p = b.getAttribute('data-p').split(':');
    if (!from.querySelector('option[value=' + p[0] + ']') || !to.querySelector('option[value=' + p[1] + ']')) { from.insertAdjacentHTML('beforeend', '<option value="' + p[0] + '">' + p[0] + '</option>'); to.insertAdjacentHTML('beforeend', '<option value="' + p[1] + '">' + p[1] + '</option>'); }
    from.value = p[0]; to.value = p[1]; convert();
  });
  convert();
});`,
  },
];
