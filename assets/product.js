/* The product page: colour swatches change the photos, sizes that are gone in that colour are struck out, and
   Add to bag goes through the bag drawer. The hidden variant select keeps the form working without JavaScript.
   Reads the product JSON that sections/main-product.liquid renders. */
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const root = $('[data-product-page]'), dataEl = $('#spData');
if (!root || !dataEl) return;
const FM = window.FM || {}, T = FM.strings || {};
const p = JSON.parse(dataEl.textContent);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const handleize = s => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const sized = (u, w) => u ? u + (u.includes('?') ? '&' : '?') + 'width=' + w : '';
const money = c => (FM.money ? FM.money(c) : (c / 100).toFixed(2));
const select = $('#spVariant'), add = $('#spAdd'), img = $('#spImg');
document.documentElement.classList.add('js');

// Liquid's product JSON lists options by name only; the values come from the variants
const opts = p.options.map((o, i) => typeof o === 'string' ? { name: o, values: [...new Set(p.variants.map(v => v.options[i]))] } : o);
const ci = opts.findIndex(o => /^colou?r$/i.test(o.name));
const start = p.variants.find(v => String(v.id) === select.value) || p.variants[0];
const fromUrl = new URLSearchParams(location.search).has('variant');
// colour starts on the variant shown; every other choice waits for the visitor, unless the link chose a variant
let sel = start.options.map((o, i) => (i === ci || fromUrl || opts[i].values.length === 1) ? o : null);
if (p.variants.length === 1) sel = start.options.slice();
const match = s => p.variants.find(v => v.options.every((o, i) => s[i] == null || o === s[i]));
const complete = () => sel.every(x => x != null);

let views = [], vi = 0;
const label = u => /back/i.test(u) ? 'Back' : /left/i.test(u) ? 'Left' : /right/i.test(u) ? 'Right' : 'Front';
function render() {
  const v = complete() ? match(sel) : null, shown = v || match(sel) || start;
  // swatches and sizes
  $$('.sw', root).forEach(b => b.setAttribute('aria-checked', sel[+b.dataset.o] === b.dataset.v));
  $$('[data-shown]', root).forEach(s => { s.textContent = sel[+s.dataset.shown] || ''; });
  $$('.sz', root).forEach(b => {
    const o = +b.dataset.o, s2 = sel.slice(); s2[o] = b.dataset.v;
    const vv = match(s2);
    b.setAttribute('aria-checked', sel[o] === b.dataset.v);
    b.classList.toggle('gone', !(vv && vv.available));
  });
  // price and button
  $('#spPrice').innerHTML = money(shown.price) + (shown.compare_at_price > shown.price ? ` <s>${money(shown.compare_at_price)}</s>` : '');
  $('#bbPrice') && ($('#bbPrice').textContent = money(shown.price));
  if (v) select.value = v.id;
  const out = v && !v.available;
  add.disabled = !!out;
  add.textContent = out ? T.soldOut : `${T.addToBag} · ${money(shown.price)}`;
  const note = $('#bbNote');
  if (note) note.textContent = sel.map((x, i) => x || (i !== ci ? opts[i].name : '')).filter(Boolean).join(' · ');
  if (v) history.replaceState(null, '', `${location.pathname}?variant=${v.id}`);
  // the photos of this colour, else every photo
  let imgs = p.images;
  if (ci > -1 && sel[ci]) { const h = handleize(sel[ci]), mine = p.images.filter(u => u.toLowerCase().includes(h)); if (mine.length) imgs = mine; }
  const lead = (shown.featured_image && shown.featured_image.src) || imgs[0];
  views = [lead, ...imgs.filter(u => u.split('?')[0] !== String(lead).split('?')[0])].slice(0, 5);
  vi = Math.min(vi, views.length - 1);
  show();
}
function show() {
  if (!img || !views.length) return;
  img.removeAttribute('srcset'); img.src = sized(views[vi], 1400);
  $('#spViews').innerHTML = views.length > 1 ? views.map((u, k) => `<button type="button" aria-pressed="${k === vi}" data-v="${k}">${label(u)}</button>`).join('') : '';
  $('#spShown').textContent = ci > -1 && sel[ci] ? sel[ci] : '';
}
$('#spViews').addEventListener('click', e => { const b = e.target.closest('button'); if (b) { vi = +b.dataset.v; show(); } });
root.addEventListener('click', e => {
  const b = e.target.closest('.sw, .sz'); if (!b) return;
  sel[+b.dataset.o] = b.dataset.v;
  if (b.classList.contains('sw')) vi = 0;
  const err = $('#spErr'); if (err) err.textContent = '';
  render();
});

// Add to bag: through the drawer when the theme script is there, else the form posts to the cart
(add.form || add.closest('form')).addEventListener('submit', e => {
  if (!complete()) {
    e.preventDefault();
    const err = $('#spErr'); if (err) err.textContent = T.chooseSize;
    const z = $$('.sz', root).find(b => sel[+b.dataset.o] == null); z && z.focus();
    return;
  }
  if (!FM.add) return;
  e.preventDefault();
  const v = match(sel); if (!v || !v.available) return;
  add.classList.add('done');
  FM.add(v.id).finally(() => setTimeout(() => add.classList.remove('done'), 1200));
});

// on phones, once the hang tag's button has scrolled away, a slim bar keeps adding to the bag within reach
const bar = $('.buybar');
if (bar) {
  new IntersectionObserver(([e]) => { const on = !e.isIntersecting && e.boundingClientRect.top < 0; bar.classList.toggle('on', on); bar.inert = !on; }).observe(add);
  $('#bbAdd').addEventListener('click', () => {
    if (!complete()) { $('.htag').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' }); }
    add.click();
  });
}
render();
})();
