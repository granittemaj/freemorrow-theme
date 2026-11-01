/* Follow the sun, the shop. It opens on the four places from the shoot, side by side, with the drawn sun moving
   across the sky above whichever one you are looking at, morning to evening. Pick a place to shop what was worn
   there, or browse the grid: filters and sorting glide the pieces into place, and every card adds by size on hover.
   Runs after store.js (window.FM) and kit.js (header, footer, bag); GSAP and Flip are optional. */
(() => {
'use strict';
const { byId, money } = window.FM, A = FM.base, D = window.FM_DETAILS || {};
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const main = $('#main');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 7v10M7 12h10"/></svg>';
const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L20 7"/></svg>';
const SUN = `<svg viewBox="0 0 100 77" aria-hidden="true"><defs><clipPath id="shSunC"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#shSunC)" fill="#C9432A">
  <rect x="0" y="0" width="100" height="41"/><rect x="0" y="45" width="100" height="5.2"/><rect x="0" y="53.6" width="100" height="4.4"/><rect x="0" y="61.2" width="100" height="3.6"/><rect x="0" y="67.6" width="100" height="2.8"/><rect x="0" y="73.2" width="100" height="2.2"/></g></svg>`;
const FILM = 'https://freemorrow.com/cdn/shop/videos/c/vp/a222892b32af4fb0b2b1a1a89c07a3e6/a222892b32af4fb0b2b1a1a89c07a3e6.HD-1080p-7.2Mbps-96820446.mp4?v=0';

const SHORT = { basecamp: 'Basecamp Hoodie', adventure: 'Made for Adventure Hoodie', daybreak: 'Daybreak Cropped Hoodie', roamer: 'Roamer Long Sleeve', offbeat: 'Offbeat Long Sleeve', signature: 'Signature Tee', 'everyday-tee': 'Everyday Tee', tote: 'Free to Wander Tote', print: 'Logo Art Print', beanie: 'Organic Beanie', cap: 'Everyday Cap' };
const CAT = { basecamp: 'Hoodies', adventure: 'Hoodies', daybreak: 'Hoodies', roamer: 'Long sleeves', offbeat: 'Long sleeves', signature: 'Tees', 'everyday-tee': 'Tees', tote: 'Accessories', print: 'Prints', beanie: 'Accessories', cap: 'Accessories' };
const CATS = ['Hoodies', 'Long sleeves', 'Tees', 'Accessories', 'Prints'];
const slug = s => s.toLowerCase().replace(' ', '-');
// featured order: the pieces from the story first
const ORDER = ['basecamp', 'adventure', 'everyday-tee', 'cap', 'roamer', 'beanie', 'signature', 'daybreak', 'offbeat', 'tote', 'print'];
const PLACES = [
  { id: 'canopy', at: 'Under the canopy', name: 'The canopy', time: 'Morning', line: 'Nature is <em>art.</em>', img: 'video-poster.jpg', video: true, pos: '50% 50%', alt: 'Mist rising off a rainforest canopy at first light', items: [['adventure', 0], ['roamer', 0]] },
  { id: 'woodland', at: 'In the woodland', name: 'The woodland', time: 'Midday', line: 'Growth begins with <em>the smallest things.</em>', img: 'hero-forest.jpg', pos: '50% 30%', alt: 'Wearing the Basecamp Hoodie and a mustard beanie in a pine forest', items: [['basecamp', 0], ['beanie', 0]] },
  { id: 'terraces', at: 'On the terraces', name: 'The terraces', time: 'Afternoon', line: 'Keep <em>climbing.</em>', img: 'life-1.jpg', pos: '50% 35%', alt: 'Wearing the Everyday Tee in White among rice terraces', items: [['everyday-tee', 1], ['tote', 0]] },
  { id: 'ridge', at: 'On the ridge', name: 'The ridge', time: 'Evening', line: 'Waiting for <em>the light.</em>', img: 'col-river.jpg', pos: '50% 22%', alt: 'Wearing the Everyday Cap under a mountain sky', items: [['cap', 1], ['offbeat', 0]] },
];
const placesOf = id => PLACES.filter(pl => pl.items.some(([x]) => x === id)).map(pl => pl.id);
const organic = id => (D[id] && D[id].bullets || []).some(b => /organic/i.test(b));
const backOf = c => c.alt || (c.more && c.more[0]) || '';
const pin = (id, ci, px, py) => `<button class="pin" data-product="${id}" data-color="${ci}" data-from="Worn in the woodland" data-px="${px}" data-py="${py}" aria-label="Quick look: ${SHORT[id]}, ${money(byId(id).price)}"><i>${PLUS}</i><span>${SHORT[id]} · ${money(byId(id).price)}</span></button>`;

const card = id => {
  const p = byId(id), c = p.colors[0], back = backOf(c);
  return `<article class="pc" data-id="${id}" data-cat="${CAT[id]}" data-price="${p.price}" data-places="${placesOf(id).join(' ')}" data-ci="0">
  <div class="pc-im">
    <a class="pc-a" href="product.html?p=${id}" aria-label="${SHORT[id]}, ${money(p.price)}"><img class="f" src="${c.img}" alt="" loading="lazy">${back ? `<img class="b" src="${back}" alt="" loading="lazy">` : ''}</a>
    ${organic(id) ? '<span class="pc-tag mono">Organic cotton</span>' : ''}
    <div class="qa">${p.sizes ? `<span class="mono">Quick add</span><div class="qa-s" role="group" aria-label="Add ${SHORT[id]} to bag in size">${p.sizes.map(s => `<button data-qa="${s}">${s.replace(' cm', '')}</button>`).join('')}</div>`
      : `<button class="qa-one" data-qa="One size">Add to bag ${PLUS}</button>`}</div>
    <button class="pc-q" data-product="${id}" data-from="The shop" aria-label="Quick look: ${SHORT[id]}">${PLUS}</button>
  </div>
  <div class="pc-m">
    <a href="product.html?p=${id}" class="pc-n" tabindex="-1">${SHORT[id]}</a><span class="pc-p">${money(p.price)}</span>
    ${p.colors.length > 1 ? `<div class="pc-sw" role="radiogroup" aria-label="${SHORT[id]} colour">${p.colors.map((x, k) => `<button role="radio" aria-checked="${!k}" aria-label="${x.n}" style="--c:${x.c}" data-k="${k}"></button>`).join('')}</div>` : ''}
    <small class="pc-c">${c.n}${p.colors.length > 1 ? ` <span>· ${p.colors.length} colours</span>` : ''}</small>
  </div>
</article>`;
};

main.innerHTML = `
<section class="sh-hero">
  <div class="sh-t">
    <div><p class="mono">The shop · ${ORDER.length} pieces</p><h1>Everything the sun <em>touched.</em></h1></div>
    <p class="lede">Each piece was photographed somewhere real, morning to evening. Shop by the place it was worn, or browse the whole collection.</p>
  </div>
  <div class="sh-sky" aria-hidden="true"><svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path d="M0 100Q500 -40 1000 100"/></svg><span class="sh-sun">${SUN}</span></div>
  <div class="places">${PLACES.map((pl, i) => `
    <article class="place${i ? '' : ' on'}" data-i="${i}">
      <div class="pl-im">${pl.video ? `<video muted loop playsinline preload="none" poster="${A + pl.img}" aria-label="${pl.alt}"></video>` : `<img src="${A + pl.img}" alt="${pl.alt}" style="object-position:${pl.pos}">`}</div>
      <button class="pl-h" aria-expanded="${!i}" aria-controls="pl-${pl.id}"><span class="mono"><b>${pad(i + 1)}</b> · ${pl.time}</span><span class="pl-n">${pl.name}</span></button>
      <div class="pl-b" id="pl-${pl.id}">
        <h2>${pl.line}</h2>
        <ul>${pl.items.map(([id, ci]) => { const p = byId(id), c = p.colors[ci]; return `<li><button data-product="${id}" data-color="${ci}" data-from="Worn ${pl.at.toLowerCase()}"><span class="th"><img src="${c.img}" alt=""></span><span><b>${SHORT[id]}</b><small>${c.n} · ${money(p.price)}</small></span><i>${PLUS}</i></button></li>`; }).join('')}</ul>
        <button class="pl-go" data-place="${pl.id}">Shop ${pl.name.toLowerCase()} ${ARROW}</button>
      </div>
    </article>`).join('')}</div>
</section>

<div class="tools" id="tools">
  <div class="tools-in">
    <div class="chips" role="group" aria-label="Filter by type"><button aria-pressed="true" data-f="all">All <i>${ORDER.length}</i></button>${CATS.map(c => `<button aria-pressed="false" data-f="${c}">${c} <i>${ORDER.filter(id => CAT[id] === c).length}</i></button>`).join('')}</div>
    <button class="pill" hidden><span></span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button>
    <div class="tools-r"><span class="mono" id="shN" aria-live="polite"></span>
      <label class="sort"><span class="sr">Sort by</span><select id="shSort"><option value="featured">Featured</option><option value="low">Price, low to high</option><option value="high">Price, high to low</option></select></label></div>
  </div>
  <div class="track" aria-hidden="true"><i></i></div>
</div>

<section class="grid" aria-label="The collection">
  ${ORDER.slice(0, 2).map(card).join('')}
  <article class="ed ed-look">
    <div class="fill" data-nw="1672" data-nh="941" data-pos="50 40"><img src="${A}hero-forest.jpg" alt="Wearing the Basecamp Hoodie and the Organic Beanie in a pine forest" loading="lazy">${pin('beanie', 0, 52.2, 11.6)}${pin('basecamp', 0, 47, 52)}</div>
    <div class="ed-t"><p class="mono">Worn in the woodland</p><h3>Cream and mustard <em>on moss.</em></h3><p>${SHORT.basecamp} and ${SHORT.beanie} · ${money(byId('basecamp').price + byId('beanie').price)}</p><button class="tlink" data-place="woodland">Shop the look ${ARROW}</button></div>
  </article>
  ${ORDER.slice(2, 10).map(card).join('')}
  <a class="ed ed-q" href="index.html"><img src="${A}life-2.jpg" alt="" loading="lazy"><span class="ed-qt"><span class="mono">The terraces</span><b>Keep climbing. There is always more of the world, <em>and yourself,</em> to discover.</b><span class="tlink">Follow the sun ${ARROW}</span></span></a>
  ${ORDER.slice(10).map(card).join('')}
</section>
<p class="none" hidden>Nothing here yet. <button class="tlink" data-reset>Show everything</button></p>`;

const places = $$('.place'), sky = $('.sh-sky'), sun = $('.sh-sun'), grid = $('.grid'), tools = $('#tools');
const G = window.gsap;
G && window.Flip && G.registerPlugin(Flip);
G && window.ScrollTrigger && G.registerPlugin(ScrollTrigger);

/* ---------- the places, and the sun over them ---------- */
let cur = 0;
const wide = () => innerWidth > 760;
function sunTo(i, instant) {
  if (!wide()) return;
  const sr = sky.getBoundingClientRect();
  // the panel grows as it opens, so aim for where its centre will settle
  const W = sr.width, grow = 2.6, unit = (W - 3 * 10) / (3 + grow);
  const x = i * (unit + 10) + unit * grow / 2, t = x / W;
  const y = ((1 - t) ** 2 * 100 + 2 * (1 - t) * t * -40 + t * t * 100) / 100 * sr.height;
  const vars = { x: x - sun.offsetWidth / 2, y: y - sun.offsetHeight * .62, duration: instant || reduce ? 0 : 1.1, ease: 'power3.inOut' };
  G ? G.to(sun, vars) : (sun.style.transform = `translate(${vars.x}px,${vars.y}px)`);
}
function open(i) {
  if (i === cur && places[i].classList.contains('on')) return;
  cur = i;
  places.forEach((p, k) => { p.classList.toggle('on', k === i); $('.pl-h', p).setAttribute('aria-expanded', k === i); });
  sunTo(i); film();
}
places.forEach((p, i) => {
  p.addEventListener('mouseenter', () => wide() && matchMedia('(hover:hover)').matches && open(i));
  $('.pl-h', p).addEventListener('click', () => open(i));
  p.addEventListener('focusin', () => wide() && open(i));
});
// the canopy film plays only while its panel is open and on screen
const vid = $('.place video');
let seen = true;
function film() {
  if (!vid || reduce) return;
  const want = seen && (cur === 0 || !wide());
  if (want) { if (!vid.src) vid.src = FILM; vid.play().catch(() => {}); } else vid.pause();
}
new IntersectionObserver(([e]) => { seen = e.isIntersecting; film(); }, { threshold: .2 }).observe($('.places'));
// on load the sun rises over the first place
if (wide()) {
  sunTo(0, true);
  if (G && !reduce) G.from(sun, { y: sky.offsetHeight + 30, duration: 1.6, ease: 'power2.out', delay: .2 });
}
addEventListener('resize', () => sunTo(cur, true));

/* ---------- filters, place and sort ---------- */
let cat = 'all', place = null, sort = 'featured';
const cards = $$('.pc'), eds = $$('.ed'), featured = [...grid.children];
function apply(animate = true) {
  const els = [...grid.children];
  const state = animate && !reduce && window.Flip ? Flip.getState(els) : null;
  const showEd = cat === 'all' && !place && sort === 'featured';
  const order = sort === 'featured' ? featured : [...cards].sort((a, b) => (a.dataset.price - b.dataset.price) * (sort === 'low' ? 1 : -1));
  order.forEach(el => grid.appendChild(el));
  let n = 0;
  cards.forEach(c => { const on = (cat === 'all' || c.dataset.cat === cat) && (!place || c.dataset.places.split(' ').includes(place)); c.hidden = !on; n += on; });
  eds.forEach(e => e.hidden = !showEd);
  if (state) Flip.from(state, { duration: .65, ease: 'power3.inOut', absolute: true, scale: false, nested: true,
    onEnter: el => G.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, delay: .15 }),
    onLeave: el => G.to(el, { opacity: 0, duration: .25 }) });
  $$('.chips button').forEach(b => b.setAttribute('aria-pressed', b.dataset.f === cat));
  const pill = $('.pill'), pl = PLACES.find(x => x.id === place);
  pill.hidden = !pl; if (pl) { $('span', pill).textContent = `Worn ${pl.at.toLowerCase()}`; pill.setAttribute('aria-label', `Remove filter: worn ${pl.at.toLowerCase()}`); }
  $('#shN').textContent = `${n} ${n === 1 ? 'piece' : 'pieces'}`;
  $('.none').hidden = n > 0;
  const h = [cat !== 'all' ? slug(cat) : '', place || ''].filter(Boolean).join('/');
  history.replaceState(null, '', h ? '#' + h : location.pathname);
  window.ScrollTrigger && setTimeout(() => ScrollTrigger.refresh(), 700);
}
const toGrid = () => { const y = tools.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hd')) || 60) + 1; if (scrollY < y - 4) scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); };
$('.chips').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { cat = b.dataset.f; apply(); } });
$('.pill').addEventListener('click', () => { place = null; apply(); });
$('#shSort').addEventListener('change', e => { sort = e.target.value; apply(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-place]'); if (b) { place = b.dataset.place; cat = 'all'; toGrid(); setTimeout(apply, reduce ? 0 : 350); }
  if (e.target.closest('[data-reset]')) { cat = 'all'; place = null; apply(); }
});
// deep links: #hoodies, #woodland, #tees/terraces
location.hash.slice(1).split('/').forEach(k => { const c = CATS.find(x => slug(x) === k); if (c) cat = c; if (PLACES.some(p => p.id === k)) place = k; });
apply(false);

/* ---------- cards: colours and quick add ---------- */
grid.addEventListener('click', e => {
  const sw = e.target.closest('.pc-sw button');
  if (sw) {
    const c = sw.closest('.pc'), p = byId(c.dataset.id), k = +sw.dataset.k, col = p.colors[k];
    c.dataset.ci = k;
    $$('.pc-sw button', c).forEach(x => x.setAttribute('aria-checked', x === sw));
    $('.f', c).src = col.img; const b = $('.b', c); if (b) b.src = backOf(col) || col.img;
    $$('a', c).forEach(a => a.href = `product.html?p=${p.id}${k ? `&c=${k}` : ''}`);
    $('.pc-a', c).setAttribute('aria-label', `${SHORT[p.id]} in ${col.n}, ${money(p.price)}`);
    $('.pc-q', c).dataset.color = k;
    $('.pc-c', c).innerHTML = `${col.n} <span>· ${p.colors.length} colours</span>`;
    return;
  }
  const q = e.target.closest('[data-qa]');
  if (q) {
    const c = q.closest('.pc'), p = byId(c.dataset.id);
    FM.add(p, p.colors[+c.dataset.ci], q.dataset.qa);
    q.classList.add('done'); const was = q.innerHTML; if (q.classList.contains('qa-one')) q.innerHTML = `Added ${CHECK}`;
    setTimeout(() => { q.classList.remove('done'); q.innerHTML = was; }, 1400);
  }
});

/* ---------- pins on the woodland look ---------- */
function placePins() {
  $$('.fill').forEach(f => {
    const W = f.clientWidth, H = f.clientHeight, nw = +f.dataset.nw, nh = +f.dataset.nh, [px, py] = f.dataset.pos.split(' ').map(n => n / 100);
    const s = Math.max(W / nw, H / nh), ox = (W - nw * s) * px, oy = (H - nh * s) * py;
    $('img', f).style.objectPosition = `${px * 100}% ${py * 100}%`;
    $$('.pin', f).forEach(p => { const x = ox + nw * s * p.dataset.px / 100; p.style.left = x + 'px'; p.style.top = oy + nh * s * p.dataset.py / 100 + 'px'; p.classList.toggle('flip', x > W * .6); });
  });
}
placePins(); addEventListener('resize', placePins);

/* ---------- the sun crosses the toolbar as you browse ---------- */
if (window.ScrollTrigger) {
  const dot = $('.track i');
  ScrollTrigger.create({ trigger: grid, start: 'top 70%', end: 'bottom bottom', onUpdate: s => dot.style.left = (s.progress * 100).toFixed(2) + '%' });
  ScrollTrigger.create({ trigger: tools, start: () => `top ${$('.hd').offsetHeight}`, endTrigger: grid, end: 'bottom top', toggleClass: { targets: tools, className: 'stuck' } });
  addEventListener('load', () => { placePins(); ScrollTrigger.refresh(); });
}
})();
