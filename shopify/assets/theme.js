/* Freemorrow: the shop layer on every page. The bag and the quick look run on Shopify's Ajax Cart API; cards add
   by size; pins and chips open the quick look. Markup for the drawers comes from snippets/drawers.liquid.
   Triggers: data-product="handle" (data-color="Colour name", data-from="Label") opens the quick look; data-bag opens the bag. */
(() => {
'use strict';
const FM = window.FM = window.FM || {};
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const T = FM.strings || {};
const handleize = s => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const short = t => String(t).replace(/^The /, '');
// Shopify's CDN resizes any image by its width parameter
const sized = (u, w) => u ? u + (u.includes('?') ? '&' : '?') + 'width=' + w : '';

/* ---------- money, in the shop's own format ---------- */
FM.money = cents => {
  const fmt = FM.moneyFormat || '${{amount}}';
  const n = (cents || 0) / 100;
  const group = (x, d, th, dec) => { const [i, f] = x.toFixed(d).split('.'); return i.replace(/\B(?=(\d{3})+(?!\d))/g, th) + (f ? dec + f : ''); };
  return fmt.replace(/\{\{\s*(\w+)\s*\}\}/, (_, k) => ({
    amount: group(n, 2, ',', '.'), amount_no_decimals: group(n, 0, ',', '.'),
    amount_with_comma_separator: group(n, 2, '.', ','), amount_no_decimals_with_comma_separator: group(n, 0, '.', ','),
    amount_with_apostrophe_separator: group(n, 2, "'", '.'),
  }[k] || group(n, 2, ',', '.')));
};

/* ---------- colours, matching snippets/swatch-color.liquid ---------- */
const PALETTE = { dust: '#D9CCB4', 'athletic heather': '#B5B4B0', 'pine green': '#2E4A3B', black: '#1A1A1A', cypress: '#5E6A4C', 'midnight blue': '#1E2942', clay: '#B8836A', 'french navy': '#1F2A48', stone: '#D6CDBD', white: '#F7F7F4', 'light blue': '#B7CEE2', 'mustard yellow': '#D6A238', 'oxford navy': '#232B44', burgundy: '#6B1F2B', 'light avio blue': '#9DB7D2', 'leaf green': '#4D7A46', navy: '#1F2A44', cranberry: '#8C2234', 'dark grey': '#4B4B4B', 'denim blue': '#4E6A8F' };
FM.swatch = v => PALETTE[String(v).toLowerCase()] || '#CFC6B6';
const isColor = o => /^colou?r$/i.test(o.name || o);
const isSize = o => /^size$/i.test(o.name || o);

/* ---------- cart ---------- */
const post = (url, body) => fetch(url + '.js', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) })
  .then(r => r.json().then(j => { if (!r.ok) throw j; return j; }));
FM.add = (id, qty = 1) => post(FM.routes.cartAdd, { items: [{ id, quantity: qty }] })
  .then(j => { refresh(); toast(`${short(j.items[0].product_title)} ${T.added}`); bump(); return j; })
  .catch(e => { toast(e.description || e.message || T.error); throw e; });
FM.change = (key, quantity) => post(FM.routes.cartChange, { id: key, quantity }).then(render).catch(e => toast(e.description || T.error));

let tt;
function toast(t) { const el = $('#fmToast'); if (!el) return; $('span', el).textContent = t; el.classList.add('show'); clearTimeout(tt); tt = setTimeout(() => el.classList.remove('show'), 2600); }
FM.toast = toast;
function bump() { $$('.bag-b').forEach(b => { b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump'); }); }

function refresh() { return fetch(FM.routes.cart + '.js', { headers: { Accept: 'application/json' } }).then(r => r.json()).then(render); }
FM.refresh = refresh;
function render(cart) {
  const n = cart.item_count;
  $$('[data-bag-count]').forEach(e => e.textContent = n);
  $$('.bag-b').forEach(b => { b.dataset.n = n; });
  const bn = $('#fmBagN'); if (bn) bn.textContent = n;
  const st = $('#fmSubtotal'); if (st) st.textContent = FM.money(cart.total_price);
  const lines = $('#fmLines'); if (!lines) return cart;
  lines.innerHTML = cart.items.length ? cart.items.map(l => `<div class="fm-line">
    <a class="fm-im" href="${esc(l.url)}">${l.image ? `<img src="${esc(sized(l.image, 200))}" alt="">` : ''}</a>
    <div><h4>${esc(short(l.product_title))}</h4>${l.product_has_only_default_variant ? '' : `<div class="fm-v">${esc(l.variant_title)}</div>`}
      <div class="fm-qty"><button type="button" data-q="-1" data-k="${esc(l.key)}" data-n="${l.quantity}" aria-label="−">−</button><span>${l.quantity}</span><button type="button" data-q="1" data-k="${esc(l.key)}" data-n="${l.quantity}" aria-label="+">+</button></div></div>
    <div class="fm-r">${FM.money(l.final_line_price)}<button type="button" class="fm-rm" data-rm="${esc(l.key)}">${esc(T.remove)}</button></div></div>`).join('')
    : `<div class="fm-empty"><strong>${esc(T.empty)}</strong><p>${esc(T.emptyLine)}</p></div>`;
  $('#fmCheckout') && ($('#fmCheckout').disabled = !cart.items.length);
  document.dispatchEvent(new CustomEvent('fm:cart', { detail: cart }));
  return cart;
}

/* ---------- drawers ---------- */
let open = null, back = null;
function show(d, opener) {
  const scrim = $('#fmScrim');
  if (open && open !== d) hide(open, true);
  back = opener || document.activeElement;
  d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); scrim.classList.add('open'); open = d;
  setTimeout(() => $('.fm-x', d).focus({ preventScroll: true }), 60);
}
function hide(d, swap) {
  d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
  if (swap) return;
  $('#fmScrim').classList.remove('open'); open = null;
  back && back.focus && back.focus({ preventScroll: true });
}
FM.openBag = opener => { show($('#fmBag'), opener); refresh(); };

/* ---------- quick look ---------- */
let qp = null, sel = [];
const cache = {};
const getProduct = h => cache[h] || (cache[h] = fetch(`${FM.routes.root.replace(/\/$/, '')}/products/${encodeURIComponent(h)}.js`).then(r => { if (!r.ok) throw r; return r.json(); }));
const variantFor = (p, s) => p.variants.find(v => v.options.every((o, i) => s[i] == null || o === s[i]));
function qRender() {
  const p = qp, ci = p.options.findIndex(isColor);
  const v = variantFor(p, sel) || p.variants[0];
  $('#fmName').textContent = short(p.title);
  $('#fmPrice').textContent = FM.money(v.price);
  // the photos of the chosen colour, else all of them
  let imgs = p.images;
  if (ci > -1 && sel[ci]) { const h = handleize(sel[ci]), mine = p.images.filter(u => u.toLowerCase().includes(h)); if (mine.length) imgs = mine; }
  const first = (v.featured_image && v.featured_image.src) || imgs[0];
  $('#fmImg').src = sized(first, 900); $('#fmImg').alt = short(p.title) + (sel[ci] ? ` — ${sel[ci]}` : '');
  $('#fmThumbs').innerHTML = imgs.length > 1 ? imgs.slice(0, 6).map((u, i) => `<button type="button" aria-label="${i + 1}" aria-pressed="${u === first}" data-v="${esc(sized(u, 900))}"><img src="${esc(sized(u, 160))}" alt=""></button>`).join('') : '';
  const colors = $('#fmColors'), sizes = $('#fmSizes');
  colors.hidden = ci < 0 || p.options[ci].values.length < 2;
  if (ci > -1) {
    $('#fmColorName').textContent = sel[ci] || '';
    $('.fm-sws', colors).innerHTML = p.options[ci].values.map(x => `<button type="button" class="fm-sw" role="radio" aria-checked="${x === sel[ci]}" aria-label="${esc(x)}" style="background:${FM.swatch(x)}" data-v="${esc(x)}"></button>`).join('');
  }
  // every other option is chosen with buttons; sizes that are gone in this colour are struck out
  const others = p.options.map((o, i) => i).filter(i => i !== ci && !(p.options.length === 1 && p.options[0].values.length === 1));
  sizes.hidden = !others.length;
  $('.fm-sizes', sizes).innerHTML = others.map(i => p.options[i].values.map(x => {
    const s2 = sel.slice(); s2[i] = x; const vv = variantFor(p, s2);
    return `<button type="button" class="fm-sz" role="radio" data-o="${i}" data-v="${esc(x)}" aria-checked="${sel[i] === x}"${vv && vv.available ? '' : ' aria-disabled="true"'}>${esc(x)}</button>`;
  }).join('')).join('');
  if (others.length) $('legend', sizes).firstChild.textContent = p.options[others[0]].name + ' ';
  $('#fmErr').textContent = '';
  const ready = p.options.every((o, i) => sel[i] != null), cur = ready && variantFor(p, sel);
  $('#fmAdd').textContent = cur && !cur.available ? T.soldOut : `${T.addToBag} — ${FM.money(v.price)}`;
  $('#fmAdd').disabled = !!(cur && !cur.available);
  $('#fmMore').href = p.url + (cur ? `?variant=${cur.id}` : '');
}
FM.openProduct = (handle, color, opener, from) => {
  getProduct(handle).then(p => {
    qp = p; sel = p.options.map(o => o.values.length === 1 ? o.values[0] : null);
    const ci = p.options.findIndex(isColor);
    if (ci > -1) sel[ci] = (color && p.options[ci].values.includes(color)) ? color : p.options[ci].values[0];
    $('#fmFrom').textContent = from || '';
    qRender(); show($('#fmQV'), opener);
  }).catch(() => { location.href = `${FM.routes.root.replace(/\/$/, '')}/products/${handle}`; });
};

/* ---------- quick add from a card ---------- */
function cardData(card) { try { return JSON.parse($('[data-variants]', card).textContent); } catch (e) { return null; } }
function cardColor(card) { const b = $('.pc-sw [aria-checked="true"]', card); return b ? b.dataset.value : null; }
function cardSizes(card) {
  const d = cardData(card); if (!d || d.size == null) return;
  const c = cardColor(card);
  $$('.qa-s button', card).forEach(b => {
    const v = d.variants.find(x => x.o[d.size] === b.dataset.qa && (d.color == null || c == null || x.o[d.color] === c));
    b.disabled = !(v && v.a);
  });
}

/* ---------- one listener for every trigger ---------- */
document.addEventListener('click', e => {
  const t = e.target;
  const bagB = t.closest('[data-bag]');
  if (bagB) { e.preventDefault(); FM.openBag(bagB); return; }
  if (t.closest('#fmScrim')) { open && hide(open); return; }
  const x = t.closest('.fm-x'); if (x) { hide(x.closest('.fm-drawer')); return; }

  // cards: colour dots and quick add come before the quick look
  const sw = t.closest('.pc-sw button');
  if (sw) {
    const card = sw.closest('.pc');
    $$('.pc-sw button', card).forEach(b => b.setAttribute('aria-checked', b === sw));
    const f = $('.f', card), b = $('.b', card);
    if (f && sw.dataset.front) { f.removeAttribute('srcset'); f.src = sw.dataset.front; }
    if (b) { b.removeAttribute('srcset'); b.src = sw.dataset.back || sw.dataset.front; }
    const c = $('.pc-c', card); if (c && c.firstChild) c.firstChild.textContent = sw.dataset.value + ' ';
    $('.pc-q', card).dataset.color = sw.dataset.value;
    cardSizes(card);
    return;
  }
  const qa = t.closest('[data-qa]');
  if (qa) {
    const card = qa.closest('.pc'), d = cardData(card); if (!d) return;
    const c = cardColor(card), s = qa.dataset.qa;
    const v = d.variants.find(x => (d.size == null || !s || x.o[d.size] === s) && (d.color == null || c == null || x.o[d.color] === c) && x.a);
    if (!v) { toast(T.soldOut); return; }
    qa.classList.add('done');
    FM.add(v.id).finally(() => setTimeout(() => qa.classList.remove('done'), 1200));
    return;
  }
  const trig = t.closest('[data-product]');
  if (trig) { e.preventDefault(); FM.openProduct(trig.dataset.product, trig.dataset.color, trig, trig.dataset.from); return; }

  // quick look controls
  if (!qp) return;
  const th = t.closest('#fmThumbs button');
  if (th) { $$('#fmThumbs button').forEach(b => b.setAttribute('aria-pressed', b === th)); $('#fmImg').src = th.dataset.v; return; }
  const qs = t.closest('#fmColors .fm-sw');
  if (qs) { sel[qp.options.findIndex(isColor)] = qs.dataset.v; qRender(); return; }
  const qz = t.closest('#fmSizes .fm-sz');
  if (qz) { if (qz.getAttribute('aria-disabled') === 'true') return; sel[+qz.dataset.o] = qz.dataset.v; qRender(); return; }
  if (t.closest('#fmAdd')) {
    const miss = qp.options.findIndex((o, i) => sel[i] == null);
    if (miss > -1) { $('#fmErr').textContent = T.chooseSize; const z = $('.fm-sz'); z && z.focus(); return; }
    const v = variantFor(qp, sel); if (!v || !v.available) return;
    FM.add(v.id).then(() => hide($('#fmQV'))).catch(() => {});
  }
});
document.addEventListener('click', e => {
  const q = e.target.closest('#fmLines [data-q]'), r = e.target.closest('#fmLines [data-rm]');
  if (q) FM.change(q.dataset.k, Math.max(0, +q.dataset.n + +q.dataset.q));
  if (r) FM.change(r.dataset.rm, 0);
});
addEventListener('keydown', e => {
  if (!open) return;
  if (e.key === 'Escape') hide(open);
  if (e.key === 'Tab') {
    const f = $$('button, a, input', open).filter(x => x.offsetParent && !x.disabled), a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  }
});

/* ---------- header ---------- */
const hd = $('.hd');
// once the page has scrolled a little, the header (and the shop's filter bar) tighten up; theme.css has the sizes
const root = document.documentElement;
if (hd) addEventListener('scroll', () => { hd.classList.toggle('up', scrollY > 8); root.classList.toggle('compact', scrollY > 40); }, { passive: true });

document.addEventListener('DOMContentLoaded', () => { $$('.pc').forEach(cardSizes); });
})();
