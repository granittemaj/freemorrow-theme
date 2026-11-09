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
/* ---------- the turntable: the piece's photos as the sides of one object, turned by dragging, swiping or the arrows ---------- */
// where each photo sits around the piece, in degrees, read from its file name; one photo per side
const SIDES = [[/left[-_ ]?front/, 315, 'Left front'], [/right[-_ ]?front/, 45, 'Right front'], [/back/, 180, 'Back'], [/left/, 270, 'Left'], [/right/, 90, 'Right'], [/front/, 0, 'Front']];
const sideOf = u => { const f = String(u).split('?')[0].split('/').pop().toLowerCase(); const s = SIDES.find(([re]) => re.test(f)); return s ? { deg: s[1], name: s[2] } : null; };
const VIEW_NAMES = { 'Front': T.viewFront, 'Back': T.viewBack, 'Left': T.viewLeft, 'Right': T.viewRight, 'Left front': T.viewLeftFront, 'Right front': T.viewRightFront };
const fig = img && img.closest('.spec-f'), ctl = $('#spViews');
const P = 'perspective(1400px)';
function buildViews(imgs, lead) {
  // the lead photo first, then every other side once, in order around the piece
  const seen = new Set(), out = [];
  [lead, ...imgs].forEach(u => {
    if (!u) return;
    const s = sideOf(u) || { deg: 1000 + out.length, name: '' };
    if (seen.has(s.deg)) return;
    seen.add(s.deg); out.push({ u, deg: s.deg, name: VIEW_NAMES[s.name] || s.name });
  });
  const first = out[0];
  return out.sort((a, b) => ((a.deg - first.deg + 360) % 360) - ((b.deg - first.deg + 360) % 360)).slice(0, 6);
}
function controls() {
  if (!ctl) return;
  if (views.length < 2) { ctl.innerHTML = ''; ctl.hidden = true; return; }
  ctl.hidden = false;
  // a small orbit, drawn as an ellipse so it reads as a ring seen from above, with a dot for each side
  const dots = views.map((v, k) => {
    const a = (v.deg % 360) * Math.PI / 180, x = 22 + 17 * Math.sin(a), y = 13 + 7 * Math.cos(a);
    return `<circle class="${k === vi ? 'on' : ''}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${k === vi ? 3.2 : 2.2}"/>`;
  }).join('');
  ctl.innerHTML = `<button type="button" class="turn-b" data-step="-1" aria-label="${T.turnLeft}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 6.5 9 12l5.5 5.5"/></svg></button>
    <span class="turn-o" aria-hidden="true"><svg viewBox="0 0 44 26"><ellipse cx="22" cy="13" rx="17" ry="7"/>${dots}</svg></span>
    <span class="turn-l"><b aria-live="polite">${views[vi].name || ''}</b><small>${T.dragToTurn}</small></span>
    <button type="button" class="turn-b" data-step="1" aria-label="${T.turnRight}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 6.5 15 12l-5.5 5.5"/></svg></button>`;
}
function show() {
  if (!img || !views.length) return;
  img.removeAttribute('srcset'); img.src = sized(views[vi].u, 1400);
  img.style.transform = '';
  // the other sides load quietly, so a turn never waits
  views.forEach(v => { const i = new Image(); i.src = sized(v.u, 1400); });
  controls();
  $('#spShown').textContent = ci > -1 && sel[ci] ? sel[ci] : '';
}
let busy = false;
function turn(step) {
  if (views.length < 2 || busy) return;
  const dir = step > 0 ? 1 : -1;
  vi = (vi + dir + views.length) % views.length;
  if (reduce || !img.animate) { show(); return; }
  busy = true;
  // the side that leaves turns away, the next one turns in from the other side, like a piece on a turntable
  const out = img.cloneNode(); out.removeAttribute('id'); out.removeAttribute('fetchpriority'); out.className = 'turn-out';
  out.style.transform = img.style.transform || `${P} rotateY(0deg)`;
  fig.appendChild(out);
  img.src = sized(views[vi].u, 1400); img.removeAttribute('srcset'); img.style.transform = '';
  controls();
  const go = () => {
    const D = 560;
    fig.classList.add('turning');
    out.animate([{ transform: out.style.transform, opacity: 1 }, { transform: `${P} rotateY(${-dir * 80}deg) translateX(${-dir * 8}%) scale(.94)`, opacity: 0 }], { duration: D * .75, easing: 'cubic-bezier(.5,0,.8,.2)', fill: 'forwards' });
    const a = img.animate([{ transform: `${P} rotateY(${dir * 80}deg) translateX(${dir * 8}%) scale(.94)`, opacity: 0 }, { transform: `${P} rotateY(0deg)`, opacity: 1 }], { duration: D, delay: D * .28, easing: 'cubic-bezier(.2,.7,.1,1)', fill: 'backwards' });
    a.onfinish = a.oncancel = () => { out.remove(); fig.classList.remove('turning'); busy = false; };
  };
  (img.decode ? img.decode() : Promise.resolve()).then(go, go);
}
if (ctl) ctl.addEventListener('click', e => { const b = e.target.closest('[data-step]'); if (b) turn(+b.dataset.step); });
if (fig) {
  fig.tabIndex = 0;
  fig.setAttribute('role', 'group');
  fig.setAttribute('aria-label', T.turntable);
  fig.addEventListener('keydown', e => { if (e.key === 'ArrowRight') { e.preventDefault(); turn(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); turn(-1); } });
  // drag or swipe sideways to turn; while dragging the piece leans with the hand
  let x0 = null, dx = 0, id = null;
  fig.addEventListener('pointerdown', e => { if (views.length < 2 || busy) return; x0 = e.clientX; dx = 0; id = e.pointerId; fig.classList.add('grab'); });
  addEventListener('pointermove', e => {
    if (x0 === null || e.pointerId !== id) return;
    dx = e.clientX - x0;
    if (Math.abs(dx) > 4 && !fig.hasPointerCapture(id)) fig.setPointerCapture(id);
    const r = Math.max(-38, Math.min(38, dx / 4));
    img.style.transform = `${P} rotateY(${r}deg)`;
  });
  const release = () => {
    if (x0 === null) return;
    fig.classList.remove('grab');
    const moved = dx; x0 = null; dx = 0;
    if (Math.abs(moved) > 46) turn(moved < 0 ? 1 : -1);
    else if (img.style.transform) { img.animate([{ transform: img.style.transform }, { transform: `${P} rotateY(0deg)` }], { duration: 420, easing: 'cubic-bezier(.2,.7,.1,1)' }); img.style.transform = ''; }
  };
  addEventListener('pointerup', release); addEventListener('pointercancel', release);
  // with a mouse, the piece tilts a little towards the pointer
  if (!reduce && matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const stage = fig.closest('.spec-s') || fig;
    stage.addEventListener('pointermove', e => {
      if (x0 !== null || busy) return;
      const r = fig.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      img.style.transform = `${P} rotateY(${(nx * 10).toFixed(2)}deg) rotateX(${(-ny * 6).toFixed(2)}deg)`;
    });
    stage.addEventListener('pointerleave', () => { if (x0 === null && !busy) img.style.transform = ''; });
  }
}

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
  views = buildViews(imgs, lead);
  vi = Math.min(vi, views.length - 1);
  show();
}
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
