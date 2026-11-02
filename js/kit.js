/* Field Kit: Freemorrow as a kit laid out on a table. The home page is the table, the trail it was worn on,
   a hangtag and a contact sheet; the shop is the kit list; a product is its specimen sheet; About is the journal.
   Catalogue, quick look and bag come from js/store.js (window.FM). */
(() => {
'use strict';
const { byId, money } = window.FM, A = FM.base, D = window.FM_DETAILS || {};
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const page = document.body.dataset.page, main = $('#main');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');

/* ---------- The kit ---------- */
// table order, which is also each piece's kit number
const KIT = ['basecamp', 'adventure', 'daybreak', 'roamer', 'offbeat', 'signature', 'everyday-tee', 'tote', 'print', 'beanie', 'cap'];
const NO = id => pad(KIT.indexOf(id) + 1);
const SHORT = { basecamp: 'Basecamp Hoodie', adventure: 'Made for Adventure Hoodie', daybreak: 'Daybreak Cropped Hoodie', roamer: 'Roamer Long Sleeve', offbeat: 'Offbeat Long Sleeve', signature: 'Signature Tee', 'everyday-tee': 'Everyday Tee', tote: 'Free to Wander Tote', print: 'Logo Art Print', beanie: 'Organic Beanie', cap: 'Everyday Cap' };
const CAT = { basecamp: 'Hoodies', adventure: 'Hoodies', daybreak: 'Hoodies', roamer: 'Long sleeves', offbeat: 'Long sleeves', signature: 'Tees', 'everyday-tee': 'Tees', tote: 'Accessories', print: 'Prints', beanie: 'Accessories', cap: 'Accessories' };
const CATS = ['Hoodies', 'Long sleeves', 'Tees', 'Accessories', 'Prints'];
const PAIR = { basecamp: 'beanie', adventure: 'roamer', daybreak: 'cap', roamer: 'adventure', signature: 'cap', 'everyday-tee': 'tote', offbeat: 'cap', beanie: 'basecamp', cap: 'offbeat', tote: 'everyday-tee', print: 'tote' };
// laid out at roughly true relative size: width of the piece within its square on the table
const SCALE = { basecamp: 1, adventure: 1, daybreak: .92, roamer: 1, offbeat: 1, signature: 1, 'everyday-tee': 1, tote: .84, print: .72, beanie: .5, cap: .54 };
// the table is two rows: tops, then everything that gets packed around them
const SPAN = { basecamp: 5, adventure: 5, daybreak: 4, roamer: 5, offbeat: 5, signature: 4, 'everyday-tee': 4, tote: 4, print: 4, beanie: 4, cap: 4 };
// specimen callouts, drawn from each product's own details: [x%, y%, side, label]
const ANN = {
  basecamp: [[50, 9, 'r', 'Double-layered hood, no drawcords'], [30, 42, 'l', 'Heavyweight brushed fleece, 339 g/m²'], [50, 70, 'r', 'Front kangaroo pocket']],
  adventure: [[50, 8, 'r', 'Lined hood without drawcords'], [19, 40, 'l', 'Wordmark down one sleeve'], [50, 70, 'r', 'Front kangaroo pocket']],
  daybreak: [[57, 22, 'r', 'Embroidered Freemorrow logo'], [27, 17, 'l', 'Dropped shoulders'], [50, 87, 'r', 'Cropped body with a raw hem']],
  roamer: [[50, 16, 'r', 'Wide ribbed neckline'], [32, 52, 'l', 'Heavyweight cotton, 278 g/m²'], [8, 82, 'l', 'Ribbed cuffs']],
  offbeat: [[50, 5, 'r', 'Taped neck and shoulders'], [69, 45, 'r', 'Wordmark down the sleeve'], [17, 90, 'l', 'Ribbed cuffs']],
  signature: [[62, 25, 'r', 'Small embroidered logo'], [50, 5, 'l', 'Wide, high ribbed neckline'], [40, 62, 'l', 'Organic cotton, 200 g/m²']],
  'everyday-tee': [[50, 5, 'r', 'Wide, high ribbed neckline'], [12, 30, 'l', 'Dropped shoulders'], [42, 62, 'l', 'Organic cotton, 200 g/m²']],
  tote: [[30, 9, 'l', 'Cross-stitched long handles'], [50, 32, 'r', 'Double-stitched top seam'], [72, 72, 'r', 'Organic cotton denim, 305 g/m²']],
  print: [[44, 50, 'l', 'Thick matte art paper, 189 g/m²']],
  beanie: [[40, 30, 'l', 'Ribbed organic cotton knit'], [60, 86, 'r', 'Fold-up cuff']],
  cap: [[50, 16, 'r', 'Unstructured six-panel crown'], [50, 42, 'l', 'Embroidered sun'], [50, 88, 'r', 'Low-profile curved brim']],
};
// photos of the pieces being worn: pos crops the photo onto the piece, c is the colour worn
const WORN = {
  basecamp: [{ img: 'hero-forest.jpg', pos: '50% 30%', c: 'Dust', alt: 'Wearing the Basecamp Hoodie in Dust, in a pine forest' }, { img: 'col-hoodie.jpg', pos: '50% 40%', c: 'Dust', alt: 'The back of the Basecamp Hoodie, printed with the striped sun' }, { img: 'flatlay.jpg', pos: '50% 50%', c: 'Dust', alt: 'The Basecamp Hoodie laid flat with a tee and joggers' }],
  beanie: [{ img: 'hero-forest.jpg', pos: '52% 8%', c: 'Mustard Yellow', alt: 'Wearing the Organic Beanie in Mustard Yellow' }],
  'everyday-tee': [{ img: 'life-1.jpg', pos: '50% 35%', c: 'White', alt: 'Wearing the Everyday Tee in White among rice terraces' }, { img: 'flatlay.jpg', pos: '50% 50%', c: 'White', alt: 'The Everyday Tee laid flat beside the Basecamp Hoodie' }],
  cap: [{ img: 'col-river.jpg', pos: '50% 22%', c: 'Stone', alt: 'Wearing the Everyday Cap under a mountain sky' }],
};
const FILM = 'https://freemorrow.com/cdn/shop/videos/c/vp/a222892b32af4fb0b2b1a1a89c07a3e6/a222892b32af4fb0b2b1a1a89c07a3e6.HD-1080p-7.2Mbps-96820446.mp4?v=0';
const SCENES = [
  { id: 'canopy', name: 'The canopy', line: 'Nature is art.', img: 'video-poster.jpg', video: true, alt: 'Mist rising off a rainforest canopy at first light',
    text: 'Mist rising off the Amazon at first light. The colours of the canopy, made to be worn far from home.', items: [['adventure', 0], ['roamer', 0]] },
  { id: 'woodland', name: 'The woodland', line: 'Growth often begins with the smallest things we choose to nurture.', img: 'hero-forest.jpg', alt: 'Wearing the Basecamp Hoodie and a mustard beanie in a pine forest',
    text: 'Cream and mustard on moss. The look from our woodland shoot, exactly as it was worn.', items: [['basecamp', 0], ['beanie', 0]] },
  { id: 'terraces', name: 'The terraces', line: 'Keep climbing. There is always more of the world, and yourself, to discover.', img: 'life-1.jpg', alt: 'Wearing the Everyday Tee in White among rice terraces and limestone peaks',
    text: 'Shot among rice terraces and limestone peaks. Light layers for long days and longer walks.', items: [['everyday-tee', 1], ['tote', 0]] },
  { id: 'ridge', name: 'The ridge', line: 'The most moving beauty is often the most modest, waiting in silence for the light to reveal it.', img: 'col-river.jpg', alt: 'Wearing the Everyday Cap under a hard blue mountain sky',
    text: 'A washed cap and a soft long sleeve, worn under a hard blue mountain sky.', items: [['cap', 1], ['offbeat', 0]] },
];

const ICON = {
  bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5.2 8h13.6l-.9 11.2a1.6 1.6 0 0 1-1.6 1.5H7.7a1.6 1.6 0 0 1-1.6-1.5z"/><path d="M8.8 10.5V7a3.2 3.2 0 0 1 6.4 0v3.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M12 6v12M6 12h12"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>',
};
const mono = t => `<p class="mono">${t}</p>`;
const sizesOf = p => p.sizes ? (p.sizes.length > 3 ? `${p.sizes[0]}–${p.sizes[p.sizes.length - 1]}` : p.sizes.join(', ')) : 'One size';
const weightOf = id => { const b = (D[id] && D[id].bullets || []).join(' '), m = b.match(/\((\d+(?:\.\d+)?) g\/m²\)|(\d+) g\/m²/); return m ? `${Math.round(+(m[1] || m[2]))} g/m²` : '—'; };
const fabricOf = id => { const b = D[id] && D[id].bullets || []; return (b.find(x => /cotton|paper|denim|twill/i.test(x)) || '—').replace(/;.*$/, ''); };

/* ---------- Header and footer ---------- */
const NAV = [['home', 'index.html', document.body.dataset.home || 'The kit'], ['shop', 'shop.html', 'Shop'], ['about', 'about.html', 'About']];
document.body.insertAdjacentHTML('afterbegin', `<a class="skip" href="#main">Skip to content</a>
<header class="hd"><a class="logo" href="index.html" aria-label="Freemorrow, home"><img class="lc" src="${A}logo-color.png" alt=""><img class="lw" src="${A}logo-white.png" alt=""></a>
  <nav class="nav" aria-label="Main">${NAV.map(([k, h, t]) => `<a href="${h}"${k === page || (k === 'shop' && page === 'product') || (k === 'home' && page === 'story') ? ' aria-current="page"' : ''}>${t}</a>`).join('')}</nav>
  <div class="hd-r"><button class="bag-b" data-bag data-n="0" aria-label="Bag, empty">${ICON.bag}<span class="count" data-bag-count aria-hidden="true">0</span></button></div></header>`);
document.body.insertAdjacentHTML('beforeend', `<footer class="ft">
  <div class="ft-a"><img src="${A}logo-white.png" alt="" class="ft-mark"><p>Leaving the world better than we found it.</p></div>
  <nav class="ft-c" aria-label="Shop"><b class="mono">Shop</b>${CATS.map(c => `<a href="shop.html#${c.toLowerCase().replace(' ', '-')}">${c}</a>`).join('')}</nav>
  <nav class="ft-c" aria-label="Freemorrow"><b class="mono">Freemorrow</b><a href="about.html">About</a><a href="index.html#trail">The trail</a><a href="index.html#archive">The archive</a><a href="about.html#faq">Questions</a></nav>
  <form class="ft-n" novalidate><label class="mono" for="ftMail">Letters from the field</label><p>New collections and the stories behind them, a few times a year.</p>
    <div class="ft-in"><input id="ftMail" type="email" placeholder="Email address" autocomplete="email"><button type="submit">Sign up</button></div></form>
  <p class="ft-l mono"><span>© 2026 Freemorrow</span></p></footer>`);
$('.ft-n').addEventListener('submit', e => { e.preventDefault(); FM.toast('Concept only: sign-up connects to Shopify'); });

const bagB = $('.bag-b');
document.addEventListener('fm:bag', e => {
  const n = e.detail.n; bagB.dataset.n = n;
  bagB.setAttribute('aria-label', n ? `Bag, ${n} ${n === 1 ? 'item' : 'items'}` : 'Bag, empty');
  if (n > +(bagB.dataset.was || n)) { bagB.classList.remove('bump'); void bagB.offsetWidth; bagB.classList.add('bump'); }
  bagB.dataset.was = n;
});
FM.refresh();
const hd = $('.hd');
addEventListener('scroll', () => hd.classList.toggle('up', scrollY > 8), { passive: true });

/* ---------- The table: every piece laid out at once ---------- */
function table(from) {
  return `<div class="kt" role="list" aria-label="The kit">${KIT.map((id, i) => { const p = byId(id); return `
  <div class="it" role="listitem" data-id="${id}" data-cat="${CAT[id]}" style="--s:${SCALE[id]};--span:${SPAN[id]}">
    <a class="it-im" href="product.html?p=${id}" aria-label="${SHORT[id]}, ${money(p.price)}"><img src="${p.colors[0].img}" alt=""></a>
    <div class="it-l"><b aria-hidden="true">${pad(i + 1)}</b>${p.colors.length > 1 ? `<span class="it-c" role="radiogroup" aria-label="${SHORT[id]} colour">${p.colors.map((c, k) => `<button role="radio" aria-checked="${!k}" aria-label="${c.n}" style="--c:${c.c}" data-k="${k}"></button>`).join('')}</span>` : ''}<em aria-hidden="true">${money(p.price)}</em><span class="nm" aria-hidden="true">${SHORT[id]}</span></div>
    <button class="it-q" data-product="${id}" data-from="${from}" aria-label="Quick look: ${SHORT[id]}">${ICON.plus}</button>
  </div>`; }).join('')}</div>`;
}
// a dot on the table swaps the piece to that colour, and carries the colour into its page and quick look
document.addEventListener('click', e => {
  const b = e.target.closest('.it-c button'); if (!b) return;
  const it = b.closest('.it'), p = byId(it.dataset.id), k = +b.dataset.k;
  $$('.it-c button', it).forEach(x => x.setAttribute('aria-checked', x === b));
  $('.it-im img', it).src = p.colors[k].img;
  $('.it-im', it).href = `product.html?p=${p.id}${k ? `&c=${k}` : ''}`;
  $('.it-im', it).setAttribute('aria-label', `${SHORT[p.id]} in ${p.colors[k].n}, ${money(p.price)}`);
  $('.it-q', it).dataset.color = k;
});

/* ---------- Home ---------- */
function home() {
  main.innerHTML = `
  <section class="hero">
    <div class="hero-t">
      <div>${mono(`Field kit No. 01 · ${KIT.length} pieces`)}<h1>A world worth exploring, <em>laid out on one table.</em></h1></div>
      <p class="lede">Clothing inspired by extraordinary places, people, wildlife, cultures and ideas. Every piece here has been somewhere first. Touch one to look closer.</p>
    </div>
    <div class="surface">${table('The kit')}</div>
    <div class="hero-b mono"><span>Laid out at true relative size</span><a href="#trail">Where it was worn ${ICON.arrow}</a></div>
  </section>

  <section class="trail" id="trail">
    <div class="trail-map" aria-hidden="true"><svg viewBox="0 0 600 760" preserveAspectRatio="xMidYMid slice"><g class="topo"></g><path class="route-bg"/><path class="route"/><g class="wps"></g><g class="me"><circle r="14" class="halo"/><circle r="5"/></g></svg>
      <div class="map-k mono"><span>Field kit No. 01</span><span data-wp>Waypoint 01 · The canopy</span></div></div>
    <div class="trail-bar" aria-hidden="true"><i data-bar></i>${SCENES.map((s, i) => `<span style="--i:${i}"></span>`).join('')}<b class="mono" data-wp>01 · The canopy</b></div>
    <div class="trail-l">
      <header class="trail-h">${mono('The trail · four waypoints')}<h2>Where the kit <em>was worn.</em></h2><p>Every collection begins with something real. This one began in four places, from mist over the Amazon to a hard blue mountain sky. Follow the route, and pack what was worn there.</p></header>
      ${SCENES.map((s, i) => `
      <article class="wp" id="${s.id}" data-i="${i}">
        ${mono(`<b>Waypoint ${pad(i + 1)}</b> / ${pad(SCENES.length)} · ${s.name}`)}
        <figure class="wp-im">${s.video ? `<video muted loop playsinline preload="none" poster="${A + s.img}" aria-label="${s.alt}" data-src="${FILM}"></video>` : `<img src="${A + s.img}" alt="${s.alt}" loading="lazy">`}</figure>
        <blockquote>${s.line}</blockquote>
        <p>${s.text}</p>
        <p class="mono worn-h"><span>Worn here · ${s.items.length} pieces</span><span>${money(s.items.reduce((a, [id]) => a + byId(id).price, 0))}</span></p>
        <ul class="worn" aria-label="Worn at ${s.name.toLowerCase()}">${s.items.map(([id, ci]) => { const p = byId(id), c = p.colors[ci]; return `
          <li><a href="product.html?p=${id}&c=${ci}"><span class="th"><img src="${c.img}" alt="" loading="lazy"></span><span><b>${SHORT[id]}</b><small>${c.n} · ${money(p.price)}</small></span></a>
          <button class="add" data-product="${id}" data-color="${ci}" data-from="Worn at ${s.name.toLowerCase()}" aria-label="Quick look: ${SHORT[id]}">${ICON.plus}</button></li>`; }).join('')}</ul>
      </article>`).join('')}
    </div>
  </section>

  <section class="notes">
    <div class="notes-t">${mono('Field notes')}<h2>People protect what they <em>first learn to love.</em></h2>
      <p>Freemorrow seeks out stories that create wonder: a landscape, a little-known animal, a remarkable person, a tradition or an idea. The story always comes first. The clothing gives it somewhere else to go.</p>
      <a class="tlink" href="about.html">Read the journal ${ICON.arrow}</a></div>
    <div class="tag-wrap">
      <svg class="string" viewBox="0 0 40 120" aria-hidden="true"><path d="M20 0 C 8 40, 30 70, 20 120"/></svg>
      <button class="tag" aria-pressed="false" aria-label="Turn the tag over">
        <span class="tag-f"><img src="${A}logo-color.png" alt=""><span class="mono">Freemorrow · Kit No. 01</span><span class="q">A world worth exploring.</span><span class="mono tag-k">Turn over ${ICON.arrow}</span></span>
        <span class="tag-b"><span class="mono">Where it goes</span><span class="t">All proceeds from Freemorrow support the work of Not For Sale, helping protect people and the planet by addressing human trafficking, modern-day slavery and ecocide.</span><span class="mono tag-k">Turn back ${ICON.arrow}</span></span>
      </button>
    </div>
  </section>

  <section class="sheet" id="archive">
    <div class="sheet-h">${mono('The archive')}<h2>An evolving archive <em>of the world’s wonder.</em></h2><p>Frames from the shoots behind the collection. New ones are added with every story.</p></div>
    <div class="strips">${[
      [['video-poster.jpg', '#canopy', 'The canopy', '50% 50%'], ['hero-forest.jpg', 'product.html?p=basecamp', 'Basecamp Hoodie, the woodland', '50% 35%', 1], ['life-1.jpg', 'product.html?p=everyday-tee&c=1', 'Everyday Tee, the terraces', '50% 30%']],
      [['col-river.jpg', 'product.html?p=cap&c=1', 'Everyday Cap, the ridge', '50% 25%'], ['mountain.jpg', 'about.html', 'Striped ridges under cloud', '50% 45%'], ['col-hoodie.jpg', 'product.html?p=basecamp', 'The striped sun, printed on the back', '50% 40%', 1]],
      [['life-2.jpg', 'about.html', 'Among the rice terraces', '50% 30%'], ['hands.jpg', 'about.html', 'Hands, and the cloth', '50% 50%'], ['flatlay.jpg', 'shop.html', 'The kit, laid flat', '50% 50%']],
    ].map((row, r) => `<div class="strip" style="--r:${[-0.5, 0.35, -0.2][r]}deg"><span class="edge mono" aria-hidden="true">FREEMORROW 400 · ${pad(r * 3 + 12)} · ${pad(r * 3 + 13)}A · ${pad(r * 3 + 14)}</span>${row.map(([img, href, cap, pos, sel], k) => `
      <a class="fr${sel ? ' sel' : ''}" href="${href}"><img src="${A + img}" alt="" loading="lazy" style="object-position:${pos}"><span class="cap"><b class="mono">${pad(r * 3 + k + 12)}${k % 2 ? 'A' : ''}</b>${cap}</span>${sel ? '<svg class="grease" viewBox="0 0 200 140" aria-hidden="true"><path d="M150 18C112 2 40 10 18 52c-18 36 22 74 82 74 64 0 98-30 90-66C183 26 136 8 92 14"/></svg>' : ''}</a>`).join('')}</div>`).join('')}</div>
  </section>

  <section class="pack">
    <figure class="pack-im"><img src="${A}flatlay.jpg" alt="The Basecamp Hoodie, a tee and joggers laid flat" loading="lazy"></figure>
    <div class="slip">
      <div class="slip-h">${mono('Packing list')}<h2>What are you <em>taking?</em></h2><p>Tick a piece to choose its size. Everything in your bag is ticked here.</p></div>
      <ul class="pl">${KIT.map(id => `<li><button data-product="${id}" data-from="Packing list" data-pl="${id}"><span class="box">${ICON.check}</span><span class="n">${SHORT[id]}</span><span class="dots"></span><span class="p">${money(byId(id).price)}</span></button></li>`).join('')}</ul>
      <div class="pl-sum"><span aria-live="polite" data-sum>Nothing packed yet</span><button class="tlink" data-open-bag hidden>View bag ${ICON.arrow}</button></div>
      <a class="btn" href="shop.html">Open the kit list ${ICON.arrow}</a>
    </div>
  </section>`;

  trail();
  // the grease-pencil marks get drawn the first time the contact sheet is seen
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .5 });
  $$('.fr.sel').forEach(f => io.observe(f));
  const tag = $('.tag');
  tag.addEventListener('click', () => { const on = tag.getAttribute('aria-pressed') !== 'true'; tag.setAttribute('aria-pressed', on); tag.setAttribute('aria-label', on ? 'Turn the tag back' : 'Turn the tag over'); });
  const tick = d => {
    $('[data-sum]').textContent = d.n ? `${d.n} packed · ${money(d.t)}` : 'Nothing packed yet';
    $('[data-open-bag]').hidden = !d.n;
    $$('[data-pl]').forEach(b => { const has = d.lines.some(l => l.p.id === b.dataset.pl); b.classList.toggle('on', has); b.setAttribute('aria-label', `${SHORT[b.dataset.pl]}, ${money(byId(b.dataset.pl).price)}${has ? ', in your bag' : ''}`); });
  };
  $('[data-open-bag]').addEventListener('click', e => FM.openBag(e.currentTarget));
  document.addEventListener('fm:bag', e => tick(e.detail)); FM.refresh();
}

/* the route: contour lines from a few hills, a path through the four waypoints, drawn as you read */
function trail() {
  const svg = $('.trail-map svg'), W = 600, H = 760;
  const hills = [[470, 150, 1.25, 120], [170, 300, .8, 130], [390, 560, .55, 105], [80, 110, .5, 85], [560, 700, .4, 90]];
  const f = (x, y) => hills.reduce((a, [hx, hy, h, s]) => a + h * Math.exp(-((x - hx) ** 2 + (y - hy) ** 2) / (2 * s * s)), 0) + .05 * Math.sin(x / 47 + y / 83) + .04 * Math.cos(y / 39 - x / 121);
  const st = 6, nx = W / st + 1, ny = H / st + 1, v = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) v.push(f(i * st, j * st));
  // marching squares, one level at a time
  const E = { t: (a, b, i, j, l) => [(i + (l - a) / (b - a)) * st, j * st], r: (b, c, i, j, l) => [(i + 1) * st, (j + (l - b) / (c - b)) * st], bm: (d, c, i, j, l) => [(i + (l - d) / (c - d)) * st, (j + 1) * st], lf: (a, d, i, j, l) => [i * st, (j + (l - a) / (d - a)) * st] };
  const CASES = [[], [['lf', 'bm']], [['bm', 'r']], [['lf', 'r']], [['t', 'r']], [['t', 'r'], ['lf', 'bm']], [['t', 'bm']], [['t', 'lf']], [['t', 'lf']], [['t', 'bm']], [['t', 'lf'], ['bm', 'r']], [['t', 'r']], [['lf', 'r']], [['bm', 'r']], [['lf', 'bm']], []];
  let minor = '', major = '';
  for (let k = 1; k <= 20; k++) {
    const l = .07 * k; let d = '';
    for (let j = 0; j < ny - 1; j++) for (let i = 0; i < nx - 1; i++) {
      const a = v[j * nx + i], b = v[j * nx + i + 1], c = v[(j + 1) * nx + i + 1], dd = v[(j + 1) * nx + i];
      const cs = (a > l) << 3 | (b > l) << 2 | (c > l) << 1 | (dd > l);
      CASES[cs].forEach(seg => {
        const pt = e => e === 't' ? E.t(a, b, i, j, l) : e === 'r' ? E.r(b, c, i, j, l) : e === 'bm' ? E.bm(dd, c, i, j, l) : E.lf(a, dd, i, j, l);
        const [p, q] = seg.map(pt); d += `M${p[0].toFixed(1)} ${p[1].toFixed(1)}L${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
      });
    }
    k % 5 ? minor += d : major += d;
  }
  $('.topo', svg).innerHTML = `<path class="c" d="${minor}"/><path class="c c5" d="${major}"/>`;
  // waypoints climb from the canopy, bottom left, to the ridge, top right
  const WP = [[118, 640], [236, 455], [395, 345], [462, 148]], P = [[30, 760], ...WP];
  let d = `M${P[0]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
    d += `C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6},${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6},${p2}`;
  }
  const bg = $('.route-bg', svg), rt = $('.route', svg), me = $('.me', svg);
  bg.setAttribute('d', d); rt.setAttribute('d', d);
  $('.wps', svg).innerHTML = WP.map(([x, y], i) => `<g class="wpt" transform="translate(${x} ${y})"><circle r="9"/><text x="16" y="4">${pad(i + 1)} ${SCENES[i].name.replace('The ', '')}</text></g>`).join('');
  const total = rt.getTotalLength();
  // how far along the route each waypoint sits
  const L = WP.map(([x, y]) => { let best = 0, bd = 1e9; for (let s = 0; s <= total; s += 2) { const p = rt.getPointAtLength(s), dd = (p.x - x) ** 2 + (p.y - y) ** 2; if (dd < bd) { bd = dd; best = s; } } return best; });
  rt.style.strokeDasharray = total;
  $$('.wpt', svg).forEach((g, k) => g.addEventListener('click', () => $('#' + SCENES[k].id).scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' })));
  const wps = $$('.wp'), wpt = $$('.wpt', svg), labels = $$('[data-wp]'), bar = $('[data-bar]');
  let cur = -1, raf = 0;
  function update() {
    raf = 0;
    const vh = innerHeight, mark = vh * .55;
    let i = -1, fr = 0;
    wps.forEach((w, k) => { const r = w.getBoundingClientRect(); if (r.top < mark) { i = k; fr = Math.min(1, (mark - r.top) / r.height); } });
    let len;
    if (i < 0) { const r = $('.trail-h').getBoundingClientRect(); len = L[0] * Math.max(0, Math.min(1, (vh - r.top) / (vh + r.height))); }
    else len = i < L.length - 1 ? L[i] + fr * (L[i + 1] - L[i]) : L[i];
    rt.style.strokeDashoffset = total - len;
    const p = rt.getPointAtLength(len); me.setAttribute('transform', `translate(${p.x} ${p.y})`);
    wpt.forEach((g, k) => g.classList.toggle('on', len >= L[k] - 2));
    bar.style.transform = `scaleX(${Math.min(1, len / L[L.length - 1])})`;
    const a = Math.max(0, i);
    if (a !== cur) { cur = a; labels.forEach((el, k) => el.textContent = k ? `${pad(a + 1)} · ${SCENES[a].name}` : `Waypoint ${pad(a + 1)} · ${SCENES[a].name}`); }
  }
  addEventListener('scroll', () => raf || (raf = requestAnimationFrame(update)), { passive: true });
  addEventListener('resize', update); update();
  // the canopy film only loads and plays while it is on screen
  const vid = $('.wp video');
  if (vid && !reduce) new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { if (!vid.src) vid.src = vid.dataset.src; vid.play().catch(() => {}); } else vid.pause();
  }, { threshold: .25 }).observe(vid);
}

/* ---------- Shop: the kit list ---------- */
function shop() {
  const count = c => KIT.filter(id => CAT[id] === c).length;
  main.innerHTML = `
  <section class="shop-h">
    <div>${mono(`The kit list · ${KIT.length} pieces`)}<h1>Everything in the kit, <em>on one table.</em></h1></div>
    <div class="ctrl">
      <div class="chips" role="group" aria-label="Filter by type"><button aria-pressed="true" data-f="all">All <i>${KIT.length}</i></button>${CATS.map(c => `<button aria-pressed="false" data-f="${c}">${c} <i>${count(c)}</i></button>`).join('')}</div>
      <div class="seg" role="group" aria-label="View"><button aria-pressed="true" data-v="table">Table</button><button aria-pressed="false" data-v="list">List</button></div>
    </div>
  </section>
  <section class="surface shop-t" data-view="table">${table('The kit list')}</section>
  <section class="shop-l" data-view="list" hidden>
    <table class="inv"><caption class="sr">The kit list</caption>
      <thead><tr><th scope="col">No.</th><th scope="col">Piece</th><th scope="col">Colours</th><th scope="col">Sizes</th><th scope="col">Fabric</th><th scope="col">Weight</th><th scope="col" aria-sort="none"><button class="sort" data-sort>Price</button></th><th scope="col"><span class="sr">Add</span></th></tr></thead>
      <tbody>${KIT.map(id => { const p = byId(id); return `<tr data-id="${id}" data-cat="${CAT[id]}" data-price="${p.price}">
        <td class="no mono">${NO(id)}</td>
        <td class="pc"><a href="product.html?p=${id}"><span class="th"><img src="${p.colors[0].img}" alt="" loading="lazy"></span><span><b>${SHORT[id]}</b><small>${CAT[id]}</small></span></a></td>
        <td class="cl"><span class="dots" aria-label="${p.colors.map(c => c.n).join(', ')}">${p.colors.map(c => `<i style="--c:${c.c}" title="${c.n}"></i>`).join('')}</span><small>${p.colors.length} ${p.colors.length === 1 ? 'colour' : 'colours'}</small></td>
        <td class="szr">${sizesOf(p)}</td><td class="fb">${fabricOf(id)}</td><td class="wt mono">${weightOf(id)}</td>
        <td class="pr">${money(p.price)}</td>
        <td class="ad"><button class="pk" data-product="${id}" data-from="The kit list">Pack <span aria-hidden="true">+</span><span class="sr"> ${SHORT[id]}</span></button></td></tr>`; }).join('')}</tbody>
    </table>
  </section>
  <p class="shop-n mono" aria-live="polite" id="shopN"></p>`;

  let filter = 'all', view = 'table';
  const apply = () => {
    $$('.chips button').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === filter));
    // filtered-out pieces stay on the table as their own shadow, like a tool board
    $$('.it').forEach(it => { const off = filter !== 'all' && it.dataset.cat !== filter; it.classList.toggle('off', off); it.inert = off; });
    $$('.inv tbody tr').forEach(tr => tr.hidden = filter !== 'all' && tr.dataset.cat !== filter);
    const n = filter === 'all' ? KIT.length : KIT.filter(id => CAT[id] === filter).length;
    $('#shopN').textContent = `Showing ${n} of ${KIT.length} pieces`;
    $$('.seg button').forEach(b => b.setAttribute('aria-pressed', b.dataset.v === view));
    $('.shop-t').hidden = view !== 'table'; $('.shop-l').hidden = view !== 'list';
    const h = [filter !== 'all' ? filter.toLowerCase().replace(' ', '-') : '', view === 'list' ? 'list' : ''].filter(Boolean).join('/');
    history.replaceState(null, '', h ? '#' + h : location.pathname);
  };
  // deep links: #hoodies, #list, #tees/list
  location.hash.slice(1).split('/').forEach(k => { const c = CATS.find(x => x.toLowerCase().replace(' ', '-') === k); if (c) filter = c; if (k === 'list') view = 'list'; });
  $('.chips').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { filter = b.dataset.f; apply(); } });
  $('.seg').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { view = b.dataset.v; apply(); } });
  const th = $('[data-sort]').closest('th'), body = $('.inv tbody'), order = [...body.rows];
  $('[data-sort]').addEventListener('click', () => {
    const s = { none: 'ascending', ascending: 'descending', descending: 'none' }[th.getAttribute('aria-sort')];
    th.setAttribute('aria-sort', s);
    const rows = s === 'none' ? order : [...order].sort((a, b) => (a.dataset.price - b.dataset.price) * (s === 'ascending' ? 1 : -1));
    rows.forEach(r => body.appendChild(r));
  });
  apply();
}

/* ---------- Product: the specimen sheet ---------- */
function product() {
  const q = new URLSearchParams(location.search), p = byId(q.get('p')) || byId('basecamp'), id = p.id, d = D[id] || {};
  let ci = Math.min(+q.get('c') || 0, p.colors.length - 1), vi = 0, size = null;
  const worn = WORN[id] || [], pair = byId(PAIR[id]);
  const label = src => /back/.test(src) ? 'Back' : /left|right/.test(src) ? 'Side' : /a2/.test(src) ? 'A2' : 'Front';
  document.title = `${SHORT[id]} — Freemorrow`;
  main.innerHTML = `
  <nav class="crumb mono" aria-label="Breadcrumb"><a href="shop.html">Shop</a><span>/</span><a href="shop.html#${CAT[id].toLowerCase().replace(' ', '-')}">${CAT[id]}</a><span>/</span><span aria-current="page">${SHORT[id]}</span></nav>
  <div class="spec">
    <div class="spec-l">
      <div class="surface spec-s">
        <figure class="spec-f"><img id="spImg" src="" alt="">
          <div class="anns">${(ANN[id] || []).map(([x, y, s, t], k) => `<span class="ann ${s}" style="--x:${x}%;--y:${y}%"><i>${k + 1}</i><span class="lab">${t}</span></span>`).join('')}</div></figure>
        <div class="spec-tools"><div class="seg" role="group" aria-label="View" id="spViews"></div><span class="mono" id="spShown"></span></div>
        <ol class="legend">${(ANN[id] || []).map(a => `<li>${a[3]}</li>`).join('')}</ol>
      </div>
      ${worn.length ? `<div class="field">${mono(`Field photos · worn · ${worn.length}`)}<div class="field-r">${worn.map(w => `<figure><img src="${A + w.img}" alt="${w.alt}" loading="lazy" style="object-position:${w.pos}"><figcaption class="mono">On body · ${w.c}</figcaption></figure>`).join('')}</div></div>` : ''}
    </div>
    <aside class="spec-r">
      <div class="htag">
        ${mono(CAT[id])}
        <h1>${SHORT[id]}</h1><p class="pr">${money(p.price)}</p>
        ${p.colors.length > 1 ? `<fieldset class="opt"><legend class="mono">Colour <span id="spCol"></span></legend><div class="sws" role="radiogroup" aria-label="Colour">${p.colors.map((c, k) => `<button class="sw" role="radio" aria-checked="false" aria-label="${c.n}" style="--c:${c.c}" data-k="${k}"></button>`).join('')}</div></fieldset>` : `<p class="mono one">Colour · ${p.colors[0].n}</p>`}
        ${p.sizes ? `<fieldset class="opt"><legend class="mono">Size</legend><div class="szs" role="radiogroup" aria-label="Size">${p.sizes.map(s => `<button class="sz" role="radio" aria-checked="false" data-s="${s}">${s}</button>`).join('')}</div><span class="err" id="spErr" aria-live="polite"></span></fieldset>` : ''}
        <button class="btn add-b" id="spAdd">Add to bag · ${money(p.price)}</button>
        <small class="mono">Taxes and shipping calculated at checkout</small>
      </div>
      <details open><summary>The piece</summary><p>${d.intro || ''}</p></details>
      <details><summary>Specification</summary><ul class="specs">${(d.bullets || []).map(b => `<li>${b}</li>`).join('')}</ul></details>
      ${pair ? `<a class="pair" href="product.html?p=${pair.id}"><span class="th"><img src="${pair.colors[0].img}" alt="" loading="lazy"></span><span>${mono('Packs well with')}<b>${SHORT[pair.id]}</b><small>${money(pair.price)}</small></span>${ICON.arrow}</a>` : ''}
    </aside>
  </div>
  <div class="buybar" inert><span><b>${SHORT[id]}</b><small id="bbNote"></small></span><button class="btn" id="bbAdd">Add · ${money(p.price)}</button></div>
  <section class="more">${mono('Also in the collection')}<div class="more-r">${KIT.filter(k => k !== id && k !== PAIR[id]).slice(0, 4).map(k => { const o = byId(k); return `<a class="mini" href="product.html?p=${k}"><span class="im"><img src="${o.colors[0].img}" alt="" loading="lazy"></span><span class="it-l"><em>${money(o.price)}</em><span class="nm">${SHORT[k]}</span></span></a>`; }).join('')}</div></section>`;

  const img = $('#spImg'), views = () => { const c = p.colors[ci]; return [c.img, c.alt, ...(c.more || [])].filter(Boolean); };
  function render() {
    const c = p.colors[ci], vs = views(); vi = Math.min(vi, vs.length - 1);
    img.src = vs[vi]; img.alt = `${SHORT[id]} in ${c.n}, ${label(vs[vi]).toLowerCase()}`;
    $('#spViews').innerHTML = vs.length > 1 ? vs.map((v, k) => `<button aria-pressed="${k === vi}" data-v="${k}">${label(v)}</button>`).join('') : '';
    $('#spShown').textContent = `Shown in ${c.n}`;
    $('.spec-f').classList.toggle('back', vi > 0);
    note();
    if ($('#spCol')) { $('#spCol').textContent = c.n; $$('.sw').forEach(b => b.setAttribute('aria-checked', +b.dataset.k === ci)); }
  }
  $('#spViews').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { vi = +b.dataset.v; render(); } });
  $('.sws') && $('.sws').addEventListener('click', e => { const b = e.target.closest('.sw'); if (b) { ci = +b.dataset.k; render(); } });
  $('.szs') && $('.szs').addEventListener('click', e => { const b = e.target.closest('.sz'); if (!b) return; size = b.dataset.s; $$('.sz').forEach(x => x.setAttribute('aria-checked', x === b)); $('#spErr').textContent = ''; note(); });
  const add = $('#spAdd');
  function note() { $('#bbNote').textContent = [p.colors[ci].n, p.sizes ? (size ? `Size ${size}` : 'Choose a size') : ''].filter(Boolean).join(' · '); }
  // on phones, once the tag's button scrolls away, a slim bar keeps adding to the bag within reach
  const bar = $('.buybar');
  new IntersectionObserver(([e]) => { const on = !e.isIntersecting && e.boundingClientRect.top < 0; bar.classList.toggle('on', on); bar.inert = !on; }).observe(add);
  $('#bbAdd').addEventListener('click', () => {
    if (p.sizes && !size) { $('.htag').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); $('#spErr').textContent = 'Choose a size to continue.'; setTimeout(() => $('.sz').focus({ preventScroll: true }), 400); return; }
    add.click();
  });
  add.addEventListener('click', () => {
    if (p.sizes && !size) { $('#spErr').textContent = 'Choose a size to continue.'; $('.sz').focus(); return; }
    FM.add(p, p.colors[ci], size || 'One size');
    add.innerHTML = `${ICON.check} Added to bag`; add.classList.add('done');
    setTimeout(() => { add.textContent = `Add to bag · ${money(p.price)}`; add.classList.remove('done'); }, 1800);
  });
  render();
}

/* ---------- About: the field journal ---------- */
function about() {
  main.innerHTML = `
  <section class="j-h">${mono('Field journal · About Freemorrow')}<h1>Leaving the world better <em>than we found it.</em></h1>
    <p class="lede">Freemorrow is a purpose-led clothing brand inspired by extraordinary places, people, wildlife, cultures and ideas.</p></section>
  <figure class="j-plate"><img src="${A}mountain.jpg" alt="Striped red and ochre ridges of a mountain under a cloudy sky"><figcaption class="mono">Plate 01 · Striped ridges under cloud</figcaption></figure>
  <section class="j-e surface" aria-label="Journal entries">
    ${[['Belief', 'People protect what they first learn to love.', 'Through storytelling, design and clothing, we celebrate what makes the world worth exploring, and help protect the future it deserves.'],
       ['Mission', 'To inspire people to discover, value and protect the extraordinary world around them.', 'We seek out stories that create wonder, offer a new perspective and build a deeper connection with people and the planet.'],
       ['Vision', 'A fashion brand where every product begins with purpose.', 'An evolving archive of the world’s wonder, connecting a global community of curious optimists.'],
       ['Storytelling', 'Every collection begins with something real.', 'A landscape, a little-known animal, a remarkable person, a tradition or an idea. The story always comes first. The clothing gives it somewhere else to go.']]
      .map(([k, h, t], i) => `<article><p class="mono"><b>Entry ${pad(i + 1)}</b> · ${k}</p><h2>${h}</h2><p>${t}</p></article>`).join('')}
  </section>
  <section class="j-split">
    <figure><img src="${A}hands.jpg" alt="Two hands resting against undyed cloth" loading="lazy"><figcaption class="mono">Plate 02 · The cloth</figcaption></figure>
    <div>${mono('Our clothing')}<h2>Each garment begins with a story, <em>and is designed to carry an idea.</em></h2>
      <p>Sometimes that becomes an illustration. Sometimes a statement, a place or a small detail worth noticing. Every piece is created to mean something, not simply follow a trend.</p>
      <p>All proceeds from Freemorrow support the work of Not For Sale, helping protect people and the planet by addressing human trafficking, modern-day slavery and ecocide.</p>
      <a class="btn" href="shop.html">Open the kit list ${ICON.arrow}</a></div>
  </section>
  <section class="j-faq" id="faq">${mono('Questions')}<h2>Asked along the way</h2>
    ${[['What is Freemorrow?', 'An adventure-inspired clothing and accessories brand for people who love to travel, explore and discover. The collection includes tees, hoodies, long-sleeve shirts, hats and tote bags designed for everyday wear.'],
       ['What inspires the clothing?', 'Every garment is designed with a person, a destination or an experience in mind, from exploring your own neighbourhood to heading somewhere new.'],
       ['Do you offer organic cotton clothing?', 'Yes. Selected products use organic cotton, including the oversized organic cotton tees, ribbed beanies and organic denim tote. Each product page lists its fabric composition.'],
       ['How does buying Freemorrow support charity?', 'All proceeds go toward supporting our charity partner and its work combating human trafficking and ecocide. Every purchase contributes to leaving the world better than we found it.']]
      .map(([q, a]) => `<details><summary>${q}</summary><p>${a}</p></details>`).join('')}
  </section>`;
}

// other pages (the story home, and pages marked data-own) build their own main
const run = !document.body.hasAttribute('data-own') && ({ home, shop, product, about })[page];
run && run();
})();
