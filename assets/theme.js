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
FM.palette = PALETTE;
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
  // a drawer written inside a section is lifted to the body, so no transformed ancestor can trap its fixed position
  if (d.parentElement !== document.body) { document.body.appendChild(d); void d.offsetWidth; }
  const scrim = $('#fmScrim');
  if (open && open !== d) hide(open, true);
  back = opener || document.activeElement;
  d.classList.add('open'); d.setAttribute('aria-hidden', 'false'); scrim.classList.add('open'); open = d;
  // focus goes to the panel itself, so keyboard and screen reader users land inside it without a ring on Close
  if (!d.hasAttribute('tabindex')) d.setAttribute('tabindex', '-1');
  setTimeout(() => d.focus({ preventScroll: true }), 60);
}
function hide(d, swap) {
  d.classList.remove('open'); d.setAttribute('aria-hidden', 'true');
  if (swap) return;
  $('#fmScrim').classList.remove('open'); open = null;
  back && back.focus && back.focus({ preventScroll: true });
}
FM.openBag = opener => { show($('#fmBag'), opener); refresh(); };
FM.show = show; FM.hide = hide;

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
  // the photo sits in the same soft light as the product page, tinted with the colour shown
  let tint = ci > -1 && sel[ci] ? FM.swatch(sel[ci]) : null;
  if (!tint) { const f = String(first).toLowerCase(), k = Object.keys(PALETTE).find(n => f.includes(handleize(n))); tint = k ? PALETTE[k] : '#D9CCB4'; }
  $('.fm-main').style.setProperty('--tint', tint);
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
  const srch = t.closest('[data-search]');
  if (srch && FM.openSearch) { e.preventDefault(); FM.openSearch(srch); return; }
  const dr = t.closest('[data-drawer]');
  if (dr && $('#' + dr.dataset.drawer)) { e.preventDefault(); show($('#' + dr.dataset.drawer), dr); return; }
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
    const f = $$('button, a, input, select, textarea', open).filter(x => x.offsetParent && !x.disabled), a = f[0], z = f[f.length - 1];
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
FM.cardSizes = () => $$('.pc').forEach(cardSizes);

/* ---------- the newsletter signs up in place ---------- */
// The form is sent the ordinary way, so Shopify's spam check (hCaptcha) can add its token first, but into a hidden
// frame, so the page stays where it is. When the answer arrives, its message replaces the field. Anything else the
// frame lands on (a visible challenge, an error page) is opened in the page instead.
const nl = $('#footer-newsletter');
if (nl) {
  const frame = document.createElement('iframe');
  frame.name = 'fmNewsletter'; frame.title = ''; frame.hidden = true; frame.setAttribute('aria-hidden', 'true'); frame.tabIndex = -1;
  document.body.appendChild(frame);
  nl.target = 'fmNewsletter';
  let sent = false;
  nl.addEventListener('submit', () => { sent = true; nl.setAttribute('aria-busy', 'true'); const b = $('button[type="submit"]', nl); b && (b.disabled = true); });
  frame.addEventListener('load', () => {
    if (!sent) return;
    sent = false;
    nl.removeAttribute('aria-busy');
    const btn = $('button[type="submit"]', nl);
    let d = null, href = '';
    try { d = frame.contentDocument; href = frame.contentWindow.location.href; } catch (e) {}
    const f = d && d.getElementById('footer-newsletter');
    const ok = f && f.querySelector('.ft-ok'), err = f && f.querySelector('.ft-err');
    $$('.ft-err', nl).forEach(x => x.remove());
    if (ok) { const box = $('.ft-in', nl); box && box.replaceWith(document.importNode(ok, true)); return; }
    btn && (btn.disabled = false);
    if (err) { const box = $('.ft-in', nl); box && box.before(document.importNode(err, true)); const i = $('input[type="email"]', nl); i && i.focus(); return; }
    if (href && href !== 'about:blank') location.href = href;
  });
}

/* ---------- back to top ---------- */
const topB = $('#fmTop');
if (topB) {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const onTop = () => { const on = scrollY > innerHeight * 1.2; topB.classList.toggle('on', on); topB.tabIndex = on ? 0 : -1; };
  addEventListener('scroll', onTop, { passive: true }); onTop();
  topB.addEventListener('click', () => {
    scrollTo({ top: 0, behavior: still ? 'auto' : 'smooth' });
    const logo = $('.logo'); logo && logo.focus({ preventScroll: true });
  });
}

/* ---------- search: Shopify's predictive search as you type ---------- */
const fs = $('#fmSearch');
if (fs) {
  const q = $('#fsQ'), out = $('#fsR');
  let wait, ctl;
  FM.openSearch = opener => { show(fs, opener); setTimeout(() => q.focus({ preventScroll: true }), 120); };
  const row = (r, kind) => `<a class="fs-i" href="${esc(r.url)}">${kind === 'product'
    ? `<span class="th">${r.image ? `<img src="${esc(sized(r.image, 160))}" alt="" loading="lazy">` : ''}</span><span><b>${esc(short(r.title))}</b><small>${FM.money(Math.round(parseFloat(r.price) * 100))}${r.available ? '' : ' · ' + esc(T.soldOut)}</small></span>`
    : `<span><b>${esc(r.title)}</b></span>`}</a>`;
  const run = () => {
    const term = q.value.trim();
    if (ctl) ctl.abort();
    if (!term) { out.innerHTML = ''; return; }
    ctl = new AbortController();
    const url = `${FM.searchUrl}.json?q=${encodeURIComponent(term)}&resources[type]=product,collection,page,article&resources[limit]=6&resources[options][unavailable_products]=last`;
    fetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } }).then(r => r.json()).then(j => {
      const res = (j.resources && j.resources.results) || {};
      const groups = [['product', res.products], ['collection', res.collections], ['page', res.pages], ['article', res.articles]].filter(g => g[1] && g[1].length);
      const all = `${FM.routes.root.replace(/\/$/, '')}/search?q=${encodeURIComponent(term)}&options%5Bprefix%5D=last`;
      out.innerHTML = (groups.length
        ? groups.map(([k, list]) => `<div class="fs-g fs-g--${k}">${list.map(r => row(r, k)).join('')}</div>`).join('')
        : `<p class="fs-none">${esc(T.searchEmpty)}</p>`) + `<a class="tlink fs-all" href="${esc(all)}">${esc(T.searchAll)} “${esc(term)}”</a>`;
    }).catch(() => {});
  };
  q.addEventListener('input', () => { clearTimeout(wait); wait = setTimeout(run, 180); });
}

/* ---------- size tables: inches or centimetres, remembered ---------- */
const fmtIn = v => String(Math.round(v * 100) / 100), fmtCm = v => (Math.round(v * 2.54 * 10) / 10).toFixed(1).replace(/\.0$/, '');
function units(u) {
  $$('[data-in]').forEach(c => { const v = parseFloat(c.dataset.in); c.textContent = u === 'cm' ? fmtCm(v) : fmtIn(v); });
  $$('[data-unit]').forEach(b => b.setAttribute('aria-pressed', b.dataset.unit === u));
  $$('[data-unit-label]').forEach(l => { l.textContent = u === 'cm' ? T.cm : T.inches; });
  try { localStorage.setItem('fm-units', u); } catch (e) {}
}
document.addEventListener('click', e => { const b = e.target.closest('[data-unit]'); if (b) units(b.dataset.unit); });
document.addEventListener('DOMContentLoaded', () => { if (!$('[data-in]')) return; let u = null; try { u = localStorage.getItem('fm-units'); } catch (e) {} units(u === 'cm' ? 'cm' : 'in'); });

/* ---------- cookie consent, through Shopify's Customer Privacy API ---------- */
const ck = $('#fmCookie');
if (ck && FM.cookies) {
  const opts = $('#ckOpts');
  const api = () => window.Shopify && window.Shopify.customerPrivacy;
  // Shopify's own banner, when it is switched on, is in charge
  const shopifyOwn = () => !!(window.privacyBanner || document.getElementById('shopify-pc__banner'));
  const load = cb => {
    if (api()) { cb(); return; }
    if (window.Shopify && window.Shopify.loadFeatures) window.Shopify.loadFeatures([{ name: 'consent-tracking-api', version: '0.1' }], err => { if (!err && api()) cb(); });
  };
  const mode = choose => { opts.hidden = !choose; $('[data-ck="choose"]', ck).hidden = choose; $('[data-ck="save"]', ck).hidden = !choose; };
  const openCk = choose => {
    const p = api(), c = p && p.currentVisitorConsent ? p.currentVisitorConsent() : {};
    ['preferences', 'analytics', 'marketing'].forEach(k => { $(`[name="${k}"]`, opts).checked = c[k] === 'yes'; });
    mode(!!choose); ck.hidden = false;
    requestAnimationFrame(() => ck.classList.add('show'));
    if (choose) setTimeout(() => $('input:not(:disabled)', opts).focus({ preventScroll: true }), 80);
  };
  const closeCk = () => { ck.classList.remove('show'); setTimeout(() => { ck.hidden = true; }, 450); };
  const save = v => {
    const p = api();
    if (!p) { closeCk(); return; }
    p.setTrackingConsent({ analytics: v.analytics, marketing: v.marketing, preferences: v.preferences, sale_of_data: v.marketing }, () => { closeCk(); toast(T.cookiesSaved); });
  };
  const ask = () => {
    const p = api();
    if (!p || shopifyOwn()) return;
    const undecided = !p.getTrackingConsent || p.getTrackingConsent() === 'no_interaction';
    const required = (p.shouldShowBanner && p.shouldShowBanner()) || (p.userCanBeTracked && !p.userCanBeTracked());
    if (undecided && (FM.cookies.everyone || required)) openCk(false);
  };
  addEventListener('load', () => setTimeout(() => load(ask), 700));
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-ck]');
    if (b) {
      const a = b.dataset.ck;
      if (a === 'choose') { mode(true); $('input:not(:disabled)', opts).focus(); }
      else if (a === 'accept') save({ analytics: true, marketing: true, preferences: true });
      else if (a === 'reject') save({ analytics: false, marketing: false, preferences: false });
      else if (a === 'save') save({ analytics: $('[name="analytics"]', opts).checked, marketing: $('[name="marketing"]', opts).checked, preferences: $('[name="preferences"]', opts).checked });
      return;
    }
    const pr = e.target.closest('[data-cookie-prefs]');
    if (pr) {
      e.preventDefault();
      if (window.privacyBanner && window.privacyBanner.showPreferences) { window.privacyBanner.showPreferences(); return; }
      load(() => openCk(true));
    }
  });
}
})();
