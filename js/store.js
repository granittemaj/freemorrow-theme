/* Freemorrow concept shop layer: real catalogue, product panel and bag.
   Pages mark triggers with data-product="id" (optional data-color="index"),
   data-bag (opens the bag) and data-bag-count (shows the count). */
(() => {
'use strict';
const FM_BASE = document.currentScript.dataset.assets || '../assets/';
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const money = n => '$' + n.toFixed(2);
const P = (h, n) => `${FM_BASE}pc/${h}__${n}.webp?v=2`; // background-free cut-outs of the studio shots in p/
const S5 = ['S', 'M', 'L', 'XL', '2XL'], S6 = [...S5, '3XL'];
const C = (n, c, img, alt, more = []) => ({ n, c, img, alt, more });
const products = [
  { id: 'basecamp', name: 'The Basecamp Oversized Hoodie', price: 50, sizes: S6, colors: [
    C('Dust', '#D9CCB4', P('basecamp-oversized-hoodie', 'oversized-heavyweight-hoodie-dust-front'), P('basecamp-oversized-hoodie', 'oversized-heavyweight-hoodie-dust-back'), [P('basecamp-oversized-hoodie', 'oversized-heavyweight-hoodie-dust-left')]),
    C('Athletic Heather', '#B5B4B0', P('basecamp-oversized-hoodie', 'oversized-heavyweight-hoodie-athletic-heather-front'), P('basecamp-oversized-hoodie', 'oversized-heavyweight-hoodie-athletic-heather-back')) ] },
  { id: 'adventure', name: 'The Made for Adventure Oversized Hoodie', price: 65, sizes: S6, colors: [
    C('Pine Green', '#2E4A3B', P('made-for-adventure-oversized-hoodie', 'relax-hoodie-pine-green-front'), P('made-for-adventure-oversized-hoodie', 'relax-hoodie-pine-green-back')) ] },
  { id: 'daybreak', name: 'The Daybreak Cropped Hoodie', price: 50, sizes: ['S', 'M', 'L', 'XL'], colors: [
    C('Black', '#1A1A1A', P('daybreak-cropped-hoodie', 'cropped-hoodie-black-front'), P('daybreak-cropped-hoodie', 'cropped-hoodie-black-back')) ] },
  { id: 'roamer', name: 'The Roamer Heavyweight Long Sleeve', price: 35, sizes: S6, colors: [
    C('Cypress', '#5E6A4C', P('roamer-heavyweight-long-sleeve', 'premium-heavyweight-long-sleeve-shirt-cypress-front'), P('roamer-heavyweight-long-sleeve', 'premium-heavyweight-long-sleeve-shirt-cypress-left')),
    C('Midnight Blue', '#1E2942', P('roamer-heavyweight-long-sleeve', 'premium-heavyweight-long-sleeve-shirt-midnight-blue-front'), P('roamer-heavyweight-long-sleeve', 'premium-heavyweight-long-sleeve-shirt-midnight-blue-left')),
    C('Clay', '#B8836A', P('roamer-heavyweight-long-sleeve', 'premium-heavyweight-long-sleeve-shirt-clay-front'), P('roamer-heavyweight-long-sleeve', 'premium-heavyweight-long-sleeve-shirt-clay-left')) ] },
  { id: 'signature', name: 'The Signature Oversized Tee', price: 30, sizes: S5, colors: [
    C('French Navy', '#1F2A48', P('signature-oversized-tee', 'organic-oversized-high-neck-blaster-2.0-t-shirt-french-navy-front'), P('signature-oversized-tee', 'organic-oversized-high-neck-blaster-2.0-t-shirt-french-navy-back')),
    C('Black', '#151515', P('signature-oversized-tee', 'organic-oversized-high-neck-blaster-2.0-t-shirt-black-front'), P('signature-oversized-tee', 'organic-oversized-high-neck-blaster-2.0-t-shirt-black-back')) ] },
  { id: 'everyday-tee', name: 'The Everyday Oversized Tee', price: 28, sizes: S5, colors: [
    C('Stone', '#D6CDBD', P('everyday-oversized-tee', 'organic-oversized-high-neck-blaster-2.0-t-shirt-stone-front'), P('everyday-oversized-tee', 'organic-oversized-high-neck-blaster-2.0-t-shirt-stone-back')),
    C('White', '#F7F7F4', P('everyday-oversized-tee', 'organic-oversized-high-neck-blaster-2.0-t-shirt-white-front'), P('everyday-oversized-tee', 'organic-oversized-high-neck-blaster-2.0-t-shirt-white-back')) ] },
  { id: 'offbeat', name: 'The Offbeat Long Sleeve Tee', price: 35, sizes: S5, colors: [
    C('Light Blue', '#B7CEE2', P('offbeat-long-sleeve-tee', 'long-sleeve-shirt-light-blue-front'), P('offbeat-long-sleeve-tee', 'long-sleeve-shirt-light-blue-back')) ] },
  { id: 'beanie', name: 'The Everyday Organic Beanie', price: 25, colors:
    ['mustard-yellow|Mustard Yellow|#D6A238', 'oxford-navy|Oxford Navy|#232B44', 'burgundy|Burgundy|#6B1F2B', 'light-avio-blue|Light Avio Blue|#9DB7D2', 'leaf-green|Leaf Green|#4D7A46']
      .map(s => { const [k, n, c] = s.split('|'); return C(n, c, P('everyday-organic-beanie', `ribbed-beanie-${k}-front`)); }) },
  { id: 'cap', name: 'The Everyday Cap', price: 25, colors:
    ['navy|Navy|#1F2A44', 'stone|Stone|#CFC5B3', 'cranberry|Cranberry|#8C2234', 'dark-grey|Dark Grey|#4B4B4B', 'light-blue|Light Blue|#A8C3DD']
      .map(s => { const [k, n, c] = s.split('|'); return C(n, c, P('everyday-cap', `dad-hat-${k}-front`), P('everyday-cap', `dad-hat-${k}-right-front`)); }) },
  { id: 'tote', name: 'The Free to Wander Denim Tote', price: 35, colors: [
    C('Denim Blue', '#4E6A8F', P('free-to-wander-denim-tote', 'denim-tote-bag-denim-blue-front'), P('free-to-wander-denim-tote', 'denim-tote-bag-denim-blue-back')) ] },
  { id: 'print', name: 'The Freemorrow Logo Art Print', price: 20, sizes: ['21×30 cm', '30×40 cm', 'A2'], colors: [
    C('Matte paper', '#F2ECE0', P('freemorrow-logo-art-print', '30x40-cm-front'), null, [P('freemorrow-logo-art-print', 'a2-_42x59.4-cm_-front')]) ] },
];
const byId = id => products.find(p => p.id === id);
// what each piece is usually worn with, for "Pairs well with" and the bag
const PAIR = { basecamp: 'beanie', adventure: 'roamer', daybreak: 'cap', roamer: 'adventure', signature: 'cap', 'everyday-tee': 'tote', offbeat: 'cap', beanie: 'basecamp', cap: 'offbeat', tote: 'everyday-tee', print: 'tote' };
const CAT = { basecamp: 'Hoodies', adventure: 'Hoodies', daybreak: 'Hoodies', roamer: 'Long sleeves', signature: 'Tees', 'everyday-tee': 'Tees', offbeat: 'Long sleeves', beanie: 'Accessories', cap: 'Accessories', tote: 'Accessories', print: 'Prints' };

document.body.insertAdjacentHTML('beforeend', `
<div class="fm-scrim" id="fmScrim"></div>
<aside class="fm-drawer" id="fmQV" role="dialog" aria-modal="true" aria-label="Product details" aria-hidden="true">
  <div class="fm-dhead"><span class="fm-label" id="fmFrom">The collection</span><button class="fm-x">Close</button></div>
  <div class="fm-dbody">
    <div class="fm-main"><img id="fmImg" src="" alt=""></div>
    <div class="fm-thumbs" id="fmThumbs"></div>
    <div class="fm-info">
      <h2 id="fmName"></h2><p class="fm-price" id="fmPrice"></p>
      <fieldset class="fm-opt" id="fmColors"><legend class="fm-label">Colour <span id="fmColorName"></span></legend><div class="fm-sws" role="radiogroup" aria-label="Colour"></div></fieldset>
      <fieldset class="fm-opt" id="fmSizes"><legend class="fm-label">Size</legend><div class="fm-sizes" role="radiogroup" aria-label="Size"></div><span class="fm-err" id="fmErr" aria-live="polite"></span></fieldset>
      <div class="fm-pair" id="fmPair"></div>
    </div>
  </div>
  <div class="fm-dfoot"><button class="fm-btn" id="fmAdd">Add to bag</button></div>
</aside>
<aside class="fm-drawer" id="fmBag" role="dialog" aria-modal="true" aria-label="Your bag" aria-hidden="true">
  <div class="fm-dhead"><span class="fm-label">Your bag (<span id="fmBagN">0</span>)</span><button class="fm-x">Close</button></div>
  <div class="fm-dbody"><div id="fmLines"></div><div class="fm-pair fm-pair--bag" id="fmBagPair"></div></div>
  <div class="fm-dfoot"><div class="fm-sub"><span>Subtotal</span><span id="fmSubtotal">$0.00</span></div><small>Taxes and shipping calculated at checkout.</small><button class="fm-btn" id="fmCheckout">Checkout</button></div>
</aside>
<div class="fm-toast" id="fmToast" role="status" aria-live="polite"><i></i><span></span></div>`);

const scrim = $('#fmScrim');
let open = null, back = null;
function show(d, opener) {
  if (open && open !== d) hide(open, true);
  back = opener || document.activeElement;
  d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); scrim.classList.add('open'); open = d;
  window.__lenis && window.__lenis.stop();
  setTimeout(() => $('.fm-x', d).focus({ preventScroll: true }), 60);
}
function hide(d, swap) {
  d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
  if (swap) return;
  scrim.classList.remove('open'); open = null; window.__lenis && window.__lenis.start();
  back && back.focus && back.focus({ preventScroll: true });
}
scrim.addEventListener('click', () => open && hide(open));
$$('.fm-x').forEach(b => b.addEventListener('click', () => hide(b.closest('.fm-drawer'))));
addEventListener('keydown', e => {
  if (e.key === 'Escape' && open) hide(open);
  if (e.key === 'Tab' && open) {
    const f = $$('button, a, input', open).filter(x => x.offsetParent), a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
});

const pairCard = (p, label) => `<span class="fm-label">${label}</span><button class="fm-pc" data-pair="${p.id}"><span class="fm-pi"><img src="${p.colors[0].img}" alt=""></span><span><b>${p.name.replace(/^The /, '')}</b><small>${money(p.price)}${p.colors.length > 1 ? ` · ${p.colors.length} colours` : ''}</small></span><span class="fm-go">View</span></button>`;
let cur, ci = 0, cs = null;
function render() {
  const c = cur.colors[ci];
  $('#fmName').textContent = cur.name.replace(/^The /, '');
  $('#fmPrice').textContent = money(cur.price);
  const views = [c.img, c.alt, ...(c.more || [])].filter(Boolean);
  $('#fmImg').src = views[0]; $('#fmImg').alt = `${cur.name} in ${c.n}`;
  $('#fmThumbs').innerHTML = views.length > 1 ? views.map((v, i) => `<button aria-label="View ${i + 1}" aria-pressed="${i === 0}" data-v="${v}"><img src="${v}" alt=""></button>`).join('') : '';
  $('#fmColors').hidden = cur.colors.length < 2;
  $('#fmColorName').textContent = c.n;
  $('#fmColors .fm-sws').innerHTML = cur.colors.map((x, i) => `<button class="fm-sw" role="radio" aria-checked="${i === ci}" aria-label="${x.n}" style="background:${x.c}" data-i="${i}"></button>`).join('');
  $('#fmSizes').hidden = !cur.sizes;
  if (cur.sizes) $('#fmSizes .fm-sizes').innerHTML = cur.sizes.map(s => `<button class="fm-sz" role="radio" aria-checked="${s === cs}" data-s="${s}">${s}</button>`).join('');
  $('#fmErr').textContent = '';
  $('#fmAdd').textContent = `Add to bag — ${money(cur.price)}`;
  $('#fmPair').innerHTML = PAIR[cur.id] ? pairCard(byId(PAIR[cur.id]), 'Pairs well with') : '';
}
function openProduct(id, color, opener, from) {
  cur = byId(id); if (!cur) return; ci = color || 0; cs = null;
  $('#fmFrom').textContent = from || CAT[id] || 'The collection';
  render(); show($('#fmQV'), opener);
}
$('#fmThumbs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; $$('#fmThumbs button').forEach(x => x.setAttribute('aria-pressed', x === b)); $('#fmImg').src = b.dataset.v; });
$('#fmColors').addEventListener('click', e => { const b = e.target.closest('.fm-sw'); if (!b) return; ci = +b.dataset.i; render(); });
$('#fmSizes').addEventListener('click', e => { const b = e.target.closest('.fm-sz'); if (!b) return; cs = b.dataset.s; $$('.fm-sz').forEach(x => x.setAttribute('aria-checked', x === b)); $('#fmErr').textContent = ''; });
$('#fmAdd').addEventListener('click', () => {
  if (cur.sizes && !cs) { $('#fmErr').textContent = 'Choose a size to continue.'; $('.fm-sz').focus(); return; }
  window.FM.fly && window.FM.fly($('#fmImg'));
  add(cur, cur.colors[ci], cs || 'One size'); hide($('#fmQV'));
});

const bag = [];
// the bag survives moving between pages in this tab
try { (JSON.parse(sessionStorage.getItem('fm-bag')) || []).forEach(x => { const p = byId(x.id), c = p && p.colors[x.c]; if (c) bag.push({ key: `${p.id}|${c.n}|${x.size}`, p, c, size: x.size, qty: x.qty }); }); } catch (e) {}
let tt;
function toast(t) { const el = $('#fmToast'); $('span', el).textContent = t; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 2600); }
function add(p, c, size, quiet) {
  const key = `${p.id}|${c.n}|${size}`, l = bag.find(x => x.key === key);
  l ? l.qty++ : bag.push({ key, p, c, size, qty: 1 });
  draw(); if (!quiet) toast(`${p.name.replace(/^The /, '')} added to bag`);
}
function draw() {
  const n = bag.reduce((a, l) => a + l.qty, 0), t = bag.reduce((a, l) => a + l.qty * l.p.price, 0);
  $$('[data-bag-count]').forEach(e => e.textContent = n);
  $$('[data-bag]').forEach(e => e.setAttribute('aria-label', `Bag, ${n} item${n === 1 ? '' : 's'}`));
  $('#fmBagN').textContent = n; $('#fmSubtotal').textContent = money(t);
  try { sessionStorage.setItem('fm-bag', JSON.stringify(bag.map(l => ({ id: l.p.id, c: l.p.colors.indexOf(l.c), size: l.size, qty: l.qty })))); } catch (e) {}
  document.dispatchEvent(new CustomEvent('fm:bag', { detail: { n, t, lines: bag.slice() } }));
  $('#fmLines').innerHTML = bag.length ? bag.map((l, i) => `<div class="fm-line"><div class="fm-im"><img src="${l.c.img}" alt=""></div>
    <div><h4>${l.p.name.replace(/^The /, '')}</h4><div class="fm-v">${l.c.n}${l.size !== 'One size' ? ' · ' + l.size : ''}</div>
    <div class="fm-qty"><button data-q="-1" data-i="${i}" aria-label="Decrease quantity">−</button><span>${l.qty}</span><button data-q="1" data-i="${i}" aria-label="Increase quantity">+</button></div></div>
    <div class="fm-r">${money(l.qty * l.p.price)}<button class="fm-rm" data-rm="${i}">Remove</button></div></div>`).join('')
    : `<div class="fm-empty"><strong>Nothing here yet.</strong><p>Every story needs somewhere to go.</p></div>`;
  const last = bag[bag.length - 1], sug = last && byId(PAIR[last.p.id]);
  $('#fmBagPair').innerHTML = sug && !bag.some(l => l.p.id === sug.id) ? pairCard(sug, `Goes with your ${/Long Sleeve/.test(last.p.name) ? 'long sleeve' : last.p.name.split(' ').pop().toLowerCase()}`) : '';
}
$('#fmLines').addEventListener('click', e => {
  const q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
  if (q) { const l = bag[+q.dataset.i]; l.qty += +q.dataset.q; if (l.qty < 1) bag.splice(+q.dataset.i, 1); draw(); }
  if (r) { bag.splice(+r.dataset.rm, 1); draw(); }
});
$('#fmCheckout').addEventListener('click', () => toast('Concept only: checkout hands off to Shopify'));

document.addEventListener('click', e => {
  const pc = e.target.closest('[data-pair]');
  if (pc) { openProduct(pc.dataset.pair, 0, back, 'Pairs well with'); return; }
  const b = e.target.closest('[data-bag]');
  if (b) { e.preventDefault(); show($('#fmBag'), b); return; }
  const t = e.target.closest('[data-product]');
  if (t && !e.defaultPrevented) { e.preventDefault(); openProduct(t.dataset.product, +(t.dataset.color || 0), t, t.dataset.from); }
});
draw();
const openBag = opener => show($('#fmBag'), opener);
window.FM = { products, byId, money, openProduct, add, toast, openBag, refresh: draw, base: FM_BASE };
})();
