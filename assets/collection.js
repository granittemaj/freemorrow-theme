/* Follow the sun, the shop. The places open as you look at them, with the drawn sun moving across the sky above
   them; choosing a place filters the grid to what was worn there, and the sort reorders it, both gliding with Flip.
   Collections are links (sections/main-collection.liquid); cards are handled by theme.js. */
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const grid = $('.grid'), tools = $('#tools');
if (!grid) return;
const G = window.gsap;
if (G && window.Flip) G.registerPlugin(Flip);
if (G && window.ScrollTrigger) G.registerPlugin(ScrollTrigger);
let PLACES = [];
try { PLACES = JSON.parse($('#shPlaces').textContent); } catch (e) {}

/* ---------- the places, and the sun over them ---------- */
const places = $$('.place'), sky = $('.sh-sky'), sun = $('.sh-sun');
let cur = 0;
const wide = () => innerWidth > 760;
function sunTo(i, instant) {
  if (!wide() || !sky || !sun) return;
  const sr = sky.getBoundingClientRect(), n = places.length;
  // the open panel grows, so aim for where its centre will settle
  const W = sr.width, grow = 2.6, gap = 10, unit = (W - (n - 1) * gap) / (n - 1 + grow);
  const x = i * (unit + gap) + unit * grow / 2, t = x / W;
  const y = ((1 - t) ** 2 * 100 + 2 * (1 - t) * t * -40 + t * t * 100) / 100 * sr.height;
  const vars = { x: x - sun.offsetWidth / 2, y: y - sun.offsetHeight * .62, duration: instant || reduce ? 0 : 1.1, ease: 'power3.inOut' };
  G ? G.to(sun, vars) : (sun.style.transform = `translate(${vars.x}px,${vars.y}px)`);
}
// each place's film plays only while it is open and on screen
let seen = true;
function films() {
  places.forEach((p, k) => {
    const v = $('video', p); if (!v || reduce) return;
    if (seen && (k === cur || !wide())) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
  });
}
function open(i) {
  if (i === cur && places[i].classList.contains('on')) return;
  cur = i;
  places.forEach((p, k) => { p.classList.toggle('on', k === i); $('.pl-h', p).setAttribute('aria-expanded', k === i); });
  sunTo(i); films();
}
places.forEach((p, i) => {
  p.addEventListener('mouseenter', () => wide() && matchMedia('(hover:hover)').matches && open(i));
  $('.pl-h', p).addEventListener('click', () => open(i));
  p.addEventListener('focusin', () => wide() && open(i));
});
if (places.length) {
  new IntersectionObserver(([e]) => { seen = e.isIntersecting; films(); }, { threshold: .2 }).observe($('.places'));
  // on arrival the sun rises over the first place
  if (wide()) {
    sunTo(0, true);
    if (G && !reduce) G.from(sun, { y: sky.offsetHeight + 30, duration: 1.6, ease: 'power2.out', delay: .2 });
  }
  addEventListener('resize', () => sunTo(cur, true));
}

/* ---------- place and sort ---------- */
let cards = $$('.pc', grid), eds = $$('.ed', grid), featured = [...grid.children];
const tagPlaces = () => cards.forEach(c => { c.dataset.places = PLACES.filter(p => p.handles.includes(c.dataset.handle)).map(p => p.id).join(' '); });
tagPlaces();
let place = null, sort = 'featured';
const pill = $('.pill'), count = $('#shN');
function apply(animate = true) {
  const els = [...grid.children];
  const state = animate && !reduce && G && window.Flip ? Flip.getState(els) : null;
  const order = sort === 'featured' ? featured : [...cards].sort((a, b) => (a.dataset.price - b.dataset.price) * (sort === 'low' ? 1 : -1));
  order.forEach(el => grid.appendChild(el));
  let n = 0;
  cards.forEach(c => { const on = !place || c.dataset.places.split(' ').includes(place); c.hidden = !on; n += on; });
  eds.forEach(e => e.hidden = !!place || sort !== 'featured');
  if (state) Flip.from(state, { duration: .65, ease: 'power3.inOut', absolute: true, scale: false, nested: true,
    onEnter: el => G.fromTo(el, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, delay: .15 }),
    onLeave: el => G.to(el, { opacity: 0, duration: .25 }) });
  const pl = PLACES.find(x => x.id === place);
  if (pill) {
    pill.hidden = !pl;
    if (pl) { const w = `${pill.dataset.worn} ${pl.at.toLowerCase()}`; $('span', pill).textContent = w; pill.setAttribute('aria-label', `${pill.dataset.remove}: ${w}`); }
  }
  if (count) count.textContent = `${n} ${n === 1 ? count.dataset.one : count.dataset.other}`;
  const none = $('[data-none]'); if (none) none.hidden = n > 0;
  history.replaceState(history.state, '', place ? '#' + place : location.pathname + location.search);
  window.ScrollTrigger && setTimeout(() => ScrollTrigger.refresh(), 700);
}
const toGrid = () => {
  const hd = $('.hd'), y = tools.getBoundingClientRect().top + scrollY - (hd ? hd.offsetHeight : 60) + 1;
  if (scrollY < y - 4) scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
};
pill && pill.addEventListener('click', () => { place = null; apply(); });
$('#shSort') && $('#shSort').addEventListener('change', e => { sort = e.target.value; apply(); });
document.addEventListener('click', e => {
  const b = e.target.closest('[data-place]');
  if (b) { place = b.dataset.place; toGrid(); setTimeout(apply, reduce ? 0 : 350); }
  if (e.target.closest('[data-reset]')) { place = null; apply(); }
});
// deep links: /collections/all#the-woodland
const fromHash = location.hash.slice(1);
if (PLACES.some(p => p.id === fromHash)) place = fromHash;
apply(false);

/* ---------- collections, without leaving the page ---------- */
// scrolling is driven here rather than left to the browser's smooth scroll, so it lands the same everywhere
function glideTo(y) {
  const html = document.documentElement;
  if (reduce || !G) { scrollTo(0, y); return; }
  const o = { y: scrollY };
  html.style.scrollBehavior = 'auto';
  G.to(o, { y, duration: .8, ease: 'power2.inOut', onUpdate: () => scrollTo(0, o.y), onComplete: () => { html.style.scrollBehavior = ''; } });
}
// a chip fetches only this section of the other collection (Shopify's Section Rendering API) and swaps the grid in
// place: the pieces in both glide to their new places, the new ones fade in. The link still works on its own.
const section = grid.closest('.shopify-section'), sid = section ? section.id.replace('shopify-section-', '') : '';
const shopName = (document.title.split(' – ').pop() || '').trim();
let loading = null;
async function showCollection(url, push) {
  const u = new URL(url, location.href);
  if (loading) loading.abort();
  loading = new AbortController();
  // to the top of the products, from above or below
  const hd = $('.hd'), y = tools.getBoundingClientRect().top + scrollY - (hd ? hd.offsetHeight : 60) + 1;
  if (Math.abs(scrollY - y) > 4) glideTo(y);
  grid.setAttribute('aria-busy', 'true');
  try {
    const r = await fetch(`${u.pathname}?section_id=${encodeURIComponent(sid)}`, { signal: loading.signal });
    if (!r.ok) throw new Error(r.status);
    const doc = new DOMParser().parseFromString(await r.text(), 'text/html'), ng = doc.querySelector('.grid');
    if (!ng) throw new Error('no grid');
    const state = !reduce && G && window.Flip ? Flip.getState($$('.pc, .ed', grid)) : null;
    // pieces in both collections keep their element, so they glide rather than reappear
    const old = new Map(cards.map(c => [c.dataset.handle, c]));
    const next = [...ng.children].map(el => (el.classList.contains('pc') && old.get(el.dataset.handle)) || document.importNode(el, true));
    grid.replaceChildren(...next);
    cards = $$('.pc', grid); eds = $$('.ed', grid); featured = [...grid.children];
    tagPlaces(); place = null;
    const pager = $('.pager'), npager = doc.querySelector('.pager');
    if (pager) pager.remove();
    if (npager) grid.after(document.importNode(npager, true));
    apply(false);
    if (state) Flip.from(state, { duration: .6, ease: 'power3.inOut', absolute: true, scale: false,
      onEnter: els => G.fromTo(els, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .5, stagger: .04, delay: .1 }) });
    // the chip, the address and the title follow
    let title = '';
    $$('.chips a').forEach(a => { const on = new URL(a.href, location.href).pathname === u.pathname; a.toggleAttribute('aria-current', on); if (on) { a.setAttribute('aria-current', 'page'); title = a.firstChild.textContent.trim(); } });
    if (title) document.title = shopName ? `${title} – ${shopName}` : title;
    if (push) history.pushState({ fmCollection: u.pathname }, '', u.pathname);
    window.FM && FM.cardSizes && FM.cardSizes();
    placePins();
  } catch (e) {
    if (e && e.name === 'AbortError') return;
    location.href = u.href;
  } finally { grid.removeAttribute('aria-busy'); }
}
if (sid) {
  $$('.chips a').forEach(a => a.addEventListener('click', e => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button) return;
    e.preventDefault();
    if (a.hasAttribute('aria-current')) { toGrid(); return; }
    showCollection(a.href, true);
  }));
  history.replaceState({ fmCollection: location.pathname }, '', location.href);
  addEventListener('popstate', e => { const path = (e.state && e.state.fmCollection) || location.pathname; if (/\/collections\//.test(path)) showCollection(path, false); });
}

/* ---------- pins on the photo tiles ---------- */
function placePins() {
  $$('.fill', grid).forEach(f => {
    const W = f.clientWidth, H = f.clientHeight, nw = +f.dataset.nw, nh = +f.dataset.nh, [px, py] = f.dataset.pos.split(' ').map(n => n / 100);
    const s = Math.max(W / nw, H / nh), ox = (W - nw * s) * px, oy = (H - nh * s) * py;
    $('img', f).style.objectPosition = `${px * 100}% ${py * 100}%`;
    $$('.pin', f).forEach(p => { const x = ox + nw * s * p.dataset.px / 100; p.style.left = x + 'px'; p.style.top = oy + nh * s * p.dataset.py / 100 + 'px'; p.classList.toggle('flip', x > W * .6); });
  });
}
placePins(); addEventListener('resize', placePins);

/* ---------- the sun crosses the toolbar as you browse ---------- */
if (window.ScrollTrigger && tools) {
  const dot = $('.track i');
  ScrollTrigger.create({ trigger: grid, start: 'top 70%', end: 'bottom bottom', onUpdate: s => { dot.style.left = (s.progress * 100).toFixed(2) + '%'; } });
  ScrollTrigger.create({ trigger: tools, start: () => `top ${$('.hd').offsetHeight}`, endTrigger: grid, end: 'bottom top', toggleClass: { targets: tools, className: 'stuck' } });
  addEventListener('load', () => { placePins(); ScrollTrigger.refresh(); });
}
})();
