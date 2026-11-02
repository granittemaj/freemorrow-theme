/* Follow the sun: the home page is one day. It opens and closes drawn: the striped sun from the logo rising over the
   mountains, and setting behind them. In between it is real: the sun turns into a window onto the Amazon film, then
   each place from the shoot rises over the last (woodland, terraces, ridge), with pins on what is being worn.
   Runs after store.js (window.FM) and kit.js (header, footer, bag); scrubbed with GSAP ScrollTrigger. */
(() => {
'use strict';
const { byId, money } = window.FM, A = FM.base;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const main = $('#main'), hd = $('.hd');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const pad = n => String(n).padStart(2, '0');
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const PLUS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M12 7v10M7 12h10"/></svg>';
const SHORT = { basecamp: 'Basecamp Hoodie', adventure: 'Made for Adventure Hoodie', daybreak: 'Daybreak Cropped Hoodie', roamer: 'Roamer Long Sleeve', offbeat: 'Offbeat Long Sleeve', signature: 'Signature Tee', 'everyday-tee': 'Everyday Tee', tote: 'Free to Wander Tote', print: 'Logo Art Print', beanie: 'Organic Beanie', cap: 'Everyday Cap' };
const FILM = 'https://freemorrow.com/cdn/shop/videos/c/vp/a222892b32af4fb0b2b1a1a89c07a3e6/a222892b32af4fb0b2b1a1a89c07a3e6.HD-1080p-7.2Mbps-96820446.mp4?v=0';

// the striped sun, drawn to match the print: a solid dome, then bands that thin towards the horizon
const SUN = `<svg viewBox="0 0 100 77" aria-hidden="true"><defs><clipPath id="sunC"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#sunC)" fill="#C9432A">
  <rect x="0" y="0" width="100" height="41"/><rect x="0" y="45" width="100" height="5.2"/><rect x="0" y="53.6" width="100" height="4.4"/><rect x="0" y="61.2" width="100" height="3.6"/><rect x="0" y="67.6" width="100" height="2.8"/><rect x="0" y="73.2" width="100" height="2.2"/></g></svg>`;
const R = [
  'M0 250L90 214L170 236L290 150L380 196L470 168L600 92L700 168L800 130L900 182L1010 120L1130 196L1240 150L1350 206L1440 176V420H0Z',
  'M0 300L120 262L240 290L360 222L470 268L580 236L690 286L820 214L930 262L1050 230L1170 282L1290 240L1440 270V420H0Z',
  'M0 352L150 322L300 346L450 306L610 340L760 312L920 348L1080 316L1240 344L1440 322V420H0Z',
];
const ridge = (cls, cols) => `<svg class="mtn ${cls}" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${R.map((d, i) => `<path d="${d}" fill="${cols[i]}"/>`).join('')}</svg>`;

const CHAPTERS = ['Sunrise', 'The canopy', 'The woodland', 'The terraces', 'The ridge', 'Sunset'];
const chip = (id, ci = 0) => { const p = byId(id), c = p.colors[ci]; return `<div class="chip"><span class="th"><img src="${c.img}" alt=""></span><span class="ct"><b>${SHORT[id]}</b><small>${c.n} · ${money(p.price)}</small></span>
  <button class="chip-add" data-product="${id}" data-color="${ci}" data-from="From the story">Add to bag</button><a class="chip-go" href="product.html?p=${id}&c=${ci}" aria-label="${SHORT[id]} details">${ARROW}</a></div>`; };
const cap = (i, title, text, extra = '') => `<article class="cap" data-cap="${i}"><p class="mono">${CHAPTERS[i]}</p>${i ? `<h2>${title}</h2>` : `<h1>${title}</h1>`}<p class="lead">${text}</p>${extra}</article>`;
// a pin on a photo, at the piece's position in the original image
const pin = (id, ci, px, py, from) => { const p = byId(id); return `<button class="pin" data-product="${id}" data-color="${ci}" data-from="${from}" data-px="${px}" data-py="${py}" aria-label="Quick look: ${SHORT[id]}, ${money(p.price)}"><i>${PLUS}</i><span>${SHORT[id]} · ${money(p.price)}</span></button>`; };

main.innerHTML = `
<section class="story" aria-label="The Freemorrow story">
  <div class="stage">
    <div class="scene sc-film"><video muted loop playsinline preload="none" poster="${A}video-poster.jpg" aria-label="Mist rising off a rainforest canopy at first light"></video></div>
    <div class="scene sc-wood"><div class="fill" data-nw="1672" data-nh="941" data-pos="50 40"><img src="${A}hero-forest.jpg" alt="Wearing the Basecamp Hoodie and a mustard beanie in a pine forest">${pin('beanie', 0, 52.2, 11.6, 'Worn in the woodland')}${pin('basecamp', 0, 47, 52, 'Worn in the woodland')}</div></div>
    <div class="scene sc-terr"><div class="panel pa"><div class="fill" data-nw="1122" data-nh="1402" data-pos="50 40"><img src="${A}life-1.jpg" alt="Wearing the Everyday Tee in White among rice terraces">${pin('everyday-tee', 1, 54, 46, 'Worn on the terraces')}</div></div>
      <div class="panel pb"><div class="fill" data-nw="1122" data-nh="1402" data-pos="50 40"><img src="${A}life-2.jpg" alt="Standing among rice terraces below limestone peaks"></div></div></div>
    <div class="scene sc-ridge"><img class="bg" src="${A}mountain.jpg" alt="Striped red and ochre ridges of a mountain under a cloudy sky">
      <div class="card"><div class="fill" data-nw="1122" data-nh="1402" data-pos="50 30"><img src="${A}col-river.jpg" alt="Wearing the Everyday Cap under a mountain sky">${pin('cap', 1, 59, 25.5, 'Worn on the ridge')}</div></div></div>
    <div class="dusk" aria-hidden="true"></div>
    <div class="sun">${SUN}</div>
    ${ridge('day', ['#E9C9A4', '#D08B66', '#2E4A3B'])}${ridge('night', ['#33433A', '#26352B', '#1C2720'])}
    <div class="caps">
      ${cap(0, 'A world worth <em>exploring.</em>', 'Clothing inspired by extraordinary places, people, wildlife, cultures and ideas. Scroll, and spend a day with the sun.')}
      ${cap(1, 'Nature is <em>art.</em>', 'Mist rising off the Amazon at first light. The colours of the canopy, made to be worn far from home.', `<div class="look">${chip('adventure')}${chip('roamer')}</div>`)}
      ${cap(2, 'Growth begins with <em>the smallest things.</em>', 'Cream and mustard on moss. The heavyweight hoodie and the organic beanie, exactly as they were worn. Touch a pin to shop it.', `<div class="look">${chip('basecamp')}${chip('beanie')}</div>`)}
      ${cap(3, 'Keep <em>climbing.</em>', 'Shot among rice terraces and limestone peaks. Light layers for long days and longer walks.', `<div class="look">${chip('everyday-tee', 1)}${chip('tote')}</div>`)}
      ${cap(4, 'Waiting for <em>the light.</em>', 'The most moving beauty is often the most modest. A washed cap and a soft long sleeve, under a hard blue mountain sky.', `<div class="look">${chip('cap', 1)}${chip('offbeat')}</div>`)}
      ${cap(5, 'Leave the world better <em>than you found it.</em>', 'All proceeds from Freemorrow support the work of Not For Sale, helping protect people and the planet by addressing human trafficking, modern-day slavery and ecocide.', `<div class="acts"><a class="btn" href="shop.html">Shop the collection ${ARROW}</a><a class="tlink" href="about.html">Our story ${ARROW}</a></div>`)}
    </div>
    <button class="cue mono" aria-label="Play the sunrise"><i></i>Scroll</button>
    <div class="auto" role="group" aria-label="Autoplay">
      <button class="auto-pp" aria-pressed="false" aria-label="Pause"><svg viewBox="0 0 44 44" aria-hidden="true"><circle class="trk" cx="22" cy="22" r="20"/><circle class="run" cx="22" cy="22" r="20"/></svg>
        <svg class="ic pa" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7v10M15 7v10"/></svg><svg class="ic pl" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 7l8 5-8 5z"/></svg></button>
      <button class="cue mono" aria-label="Go to the woodland"><i></i>Scroll</button>
    </div>
    <nav class="chap" aria-label="Story chapters">${CHAPTERS.map(c => `<button><span>${c}</span><i></i></button>`).join('')}</nav>
    <div class="bar" aria-hidden="true"><i></i></div>
  </div>
</section>`;

if (!window.gsap || !window.ScrollTrigger) return; // without the libraries the captions still read in order
gsap.registerPlugin(ScrollTrigger);
const stage = $('.stage'), sun = $('.sun'), caps = $$('.cap'), video = $('.sc-film video');
const film = $('.sc-film'), wood = $('.sc-wood'), terr = $('.sc-terr'), ridgeS = $('.sc-ridge');

/* ---------- sizes for this screen ---------- */
let G;
// pins sit where the piece is in the original photo, wherever the crop of object-fit: cover puts it
function placePins() {
  $$('.fill').forEach(f => {
    const W = f.clientWidth, H = f.clientHeight, nw = +f.dataset.nw, nh = +f.dataset.nh, [px, py] = f.dataset.pos.split(' ').map(n => n / 100);
    const s = Math.max(W / nw, H / nh), ox = (W - nw * s) * px, oy = (H - nh * s) * py;
    $('img', f).style.objectPosition = `${px * 100}% ${py * 100}%`;
    $$('.pin', f).forEach(p => { p.style.left = ox + nw * s * p.dataset.px / 100 + 'px'; p.style.top = oy + nh * s * p.dataset.py / 100 + 'px'; p.classList.toggle('flip', ox + nw * s * p.dataset.px / 100 > W * .62); });
  });
}
function layout() {
  const W = stage.clientWidth, H = stage.clientHeight, m = W < 760;
  const sunW = m ? Math.min(W * .74, H * .36) : Math.min(W * .36, H * .52), sunH = sunW * .77;
  const sunX = (m ? W / 2 : W * .66) - sunW / 2, sunY1 = m ? H * .4 : H * .17;
  // the sun's disc, as a circle on the stage: where the film first shows through
  G = { W, H, m, sunW, sunH, sunX, sunY1, cx: sunX + sunW / 2, cy: sunY1 + sunW / 2, r0: sunW / 2, r1: Math.hypot(W, H) };
  placePins();
}
layout();
ScrollTrigger.addEventListener('refreshInit', layout);
const sunK = () => G.sunW / 200;
const circle = r => () => `circle(${typeof r === 'function' ? r() : r}px at ${G.cx}px ${G.cy}px)`;
const SHUT = 'inset(100% 0% 0% 0%)', OPEN = 'inset(0% 0% 0% 0%)';

/* ---------- the day, in scenes ---------- */
const TOTAL = 7.3, MARKS = [0, 1.6, 3.1, 4.6, 6.0, 6.95], SUNSET = 6.9;
const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 1 } });
const at = (el, vars, t, d = 1) => tl.to(el, { ...vars, duration: d }, t);

tl.set(stage, { backgroundColor: '#F3E6D2', '--fg': '#1D201C', '--fg2': 'rgba(29,32,28,.72)' }, 0)
  .set(sun, { x: () => G.sunX, y: () => G.H * .8 - G.sunH * .46, scale: sunK, autoAlpha: 1 }, 0)
  .set(film, { clipPath: circle(0), autoAlpha: 1, y: 0 }, 0)
  .set([wood, terr, ridgeS], { clipPath: SHUT, y: 0 }, 0)
  .set('.panel', { yPercent: 40 }, 0).set('.card', { xPercent: 60, rotation: 6, autoAlpha: 0 }, 0)
  .set('.pin', { xPercent: -50, yPercent: -50, scale: 0, autoAlpha: 0 }, 0)
  .set('.dusk', { autoAlpha: 0 }, 0)
  .set('.mtn.day', { yPercent: 0 }, 0).set('.mtn.night', { yPercent: 60, autoAlpha: 0 }, 0)
  .set(caps.slice(1), { autoAlpha: 0, y: 24 }, 0);

// 01 sunrise, drawn
at(sun, { y: () => G.sunY1, ease: 'power1.out' }, 0, 1);
at(stage, { backgroundColor: '#F6DDC0' }, 0, 1);
at('.mtn.day', { yPercent: 6 }, 0, 1);
at('.stage > .cue', { autoAlpha: 0 }, 0, .2);
at(caps[0], { autoAlpha: 0, y: -24 }, .75, .3);
// 02 the canopy: the sun becomes a window onto the film, which opens to the whole screen
tl.set(film, { clipPath: circle(() => G.r0) }, 1);
at(sun, { autoAlpha: 0, ease: 'none' }, 1, .25);
at(film, { clipPath: circle(() => G.r1), ease: 'power3.in' }, 1.2, .55);
at('.mtn.day', { yPercent: 80, ease: 'power2.in' }, 1.05, .55);
at(stage, { '--fg': '#F7F2E9', '--fg2': 'rgba(247,242,233,.82)' }, 1.4, .3);
at(caps[1], { autoAlpha: 1, y: 0 }, 1.6, .3); at(caps[1], { autoAlpha: 0, y: -24 }, 2.55, .2);
// 03 the woodland rises over the film
at(wood, { clipPath: OPEN, ease: 'power3.inOut' }, 2.6, .7);
at(film, { y: () => -G.H * .12, ease: 'power3.inOut' }, 2.6, .7);
tl.to('.sc-wood .pin', { scale: 1, autoAlpha: 1, duration: .25, stagger: .1, ease: 'back.out(2)' }, 3.2);
at(caps[2], { autoAlpha: 1, y: 0 }, 3.15, .3); at(caps[2], { autoAlpha: 0, y: -24 }, 4.0, .2);
// 04 the terraces: sand comes up, and two photographs climb in at their own pace
at(terr, { clipPath: OPEN, ease: 'power3.inOut' }, 4.0, .7);
at(wood, { y: () => -G.H * .12, ease: 'power3.inOut' }, 4.0, .7);
at('.pa', { yPercent: 0, ease: 'power3.out' }, 4.15, .75);
at('.pb', { yPercent: 0, ease: 'power3.out' }, 4.3, .75);
at(stage, { '--fg': '#1D201C', '--fg2': 'rgba(29,32,28,.72)' }, 4.15, .3);
tl.to('.sc-terr .pin', { scale: 1, autoAlpha: 1, duration: .25, ease: 'back.out(2)' }, 4.9);
at(caps[3], { autoAlpha: 1, y: 0 }, 4.6, .3); at(caps[3], { autoAlpha: 0, y: -24 }, 5.4, .2);
// 05 the ridge: the striped mountain, and the portrait from that day laid over it
at(ridgeS, { clipPath: OPEN, ease: 'power3.inOut' }, 5.4, .7);
at(terr, { y: () => -G.H * .12, ease: 'power3.inOut' }, 5.4, .7);
at('.card', { xPercent: 0, rotation: 2.5, autoAlpha: 1, ease: 'power3.out' }, 5.7, .6);
at(stage, { '--fg': '#F7F2E9', '--fg2': 'rgba(247,242,233,.82)' }, 5.55, .3);
tl.to('.sc-ridge .pin', { scale: 1, autoAlpha: 1, duration: .25, ease: 'back.out(2)' }, 6.25);
at(caps[4], { autoAlpha: 1, y: 0 }, 6.0, .3); at(caps[4], { autoAlpha: 0, y: -24 }, 6.8, .2);
tl.to({}, { duration: .1 }, TOTAL - .1);
// 06 sunset, drawn again and played in time rather than scrolled: once the ridge has gone, dusk falls, the night
// mountains rise and the sun goes down behind them by itself. It is the last chapter, so nothing moves on after it.
const sunset = gsap.timeline({ paused: true })
  .fromTo('.dusk', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, ease: 'none', immediateRender: false }, 0)
  .fromTo('.mtn.night', { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, duration: 1.3, ease: 'power2.out', immediateRender: false }, .4)
  .fromTo(sun, { x: () => G.sunX, y: () => G.H * .06, scale: sunK, autoAlpha: 0 }, { autoAlpha: 1, duration: .5, ease: 'none', immediateRender: false }, .5)
  .to(sun, { y: () => G.H * .8 - G.sunH * .3, duration: 3.6, ease: 'power1.in' }, .6)
  .fromTo(caps[5], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: .7, ease: 'power2.out', immediateRender: false }, 1.4);
// the sunset stays paused and a tween drives its progress, so it can set and rise again any number of times
let setting = false, drive = null;
function sundown(on) {
  if (on === setting) return;
  setting = on; stage.classList.toggle('set', on);
  if (drive) drive.kill();
  if (reduce) { sunset.progress(on ? 1 : 0); return; }
  const left = on ? 1 - sunset.progress() : sunset.progress();
  drive = gsap.to(sunset, { progress: on ? 1 : 0, duration: sunset.duration() * left / (on ? 1 : 3), ease: 'none' });
}
ScrollTrigger.addEventListener('refresh', () => { if (sunset.progress()) sunset.invalidate().progress(sunset.progress()); });

/* ---------- scroll ---------- */
// native scrolling; the scrub does the smoothing, so nothing fights the browser's own scroll
const chaps = $$('.chap button'), bar = $('.bar i');
let curCh = -1, playing = false;
let onScene = null; // set once the autoplay below is ready
const st = ScrollTrigger.create({
  trigger: '.story', start: 'top top', end: () => '+=' + Math.round(TOTAL * innerHeight * .95),
  pin: true, scrub: reduce ? true : 1, anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
  onUpdate(self) {
    const t = self.progress * TOTAL;
    if (onScene) onScene(t);
    sundown(t >= SUNSET);
    let ch = 0; MARKS.forEach((mk, i) => { if (t >= mk - .05) ch = i; });
    if (ch !== curCh) { curCh = ch; chaps.forEach((b, i) => b.toggleAttribute('aria-current', i === ch)); }
    bar.style.transform = `scaleX(${self.progress})`;
    const dark = (t > 1.35 && t < 4.2) || t > 5.55; // the sunset runs straight into the dark footer
    hd.classList.toggle('dark', dark); stage.classList.toggle('on-dark', dark);
    // the film only loads and plays while it is the scene
    const want = !reduce && t > .9 && t < 3.3;
    if (want && !playing) { if (!video.src) video.src = FILM; video.play().catch(() => {}); playing = true; }
    else if (!want && playing) { video.pause(); playing = false; }
  },
  onLeave: () => hd.classList.add('solid'), onEnterBack: () => hd.classList.remove('solid'),
});
const go = y => scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
chaps.forEach((b, i) => b.addEventListener('click', () => go(st.start + (MARKS[i] + (i ? .25 : 0)) / TOTAL * (st.end - st.start))));

/* ---------- the story plays itself: the sunrise on arrival, then a countdown on each place ---------- */
// where each chapter has settled, in timeline time: its caption in and its pins out
const REST = [0, 2.0, 3.55, 5.15, 6.5, 7.15];
// while a place is on screen and settled, it counts down to the next chapter: [from, to] in timeline time
const LIVE = [null, [1.9, 2.6], [3.5, 4.0], [5.1, 5.4], [6.45, 6.8]];
const yAt = t => st.start + t / TOTAL * (st.end - st.start);
let glide = null;
function glideTo(t, dur) {
  if (glide) glide.kill();
  const o = { y: scrollY };
  glide = gsap.to(o, { y: yAt(t), duration: reduce ? 0 : dur, ease: 'power1.inOut', onUpdate: () => scrollTo({ top: o.y, behavior: 'instant' }), onComplete: () => { glide = null; } });
}
const next = i => glideTo(REST[i], i === 1 ? 4.6 : i === 5 ? 1.8 : 2.6);
// anything the visitor does themselves takes over from the autoplay
['wheel', 'touchstart', 'keydown'].forEach(ev => addEventListener(ev, e => { if (glide && !(e.target.closest && e.target.closest('.auto,.cue'))) { glide.kill(); glide = null; } }, { passive: true }));
$('.stage > .cue').addEventListener('click', () => next(1));

// each place counts down, then moves on to the next, unless it is paused
const AUTO = 7, auto = $('.auto'), pp = $('.auto-pp'), run = $('.auto-pp .run'), cue2 = $('.auto .cue');
const C = 2 * Math.PI * 20;
run.style.strokeDasharray = C;
let left = AUTO, paused = false, scene = 0, raf = 0, last = 0;
function tick(now) {
  raf = 0;
  if (!scene) return;
  if (!paused && !glide) left -= Math.min(.1, (now - (last || now)) / 1000);
  last = now;
  run.style.strokeDashoffset = C * (1 - left / AUTO);
  if (left <= 0) { next(scene + 1); return; } // the countdown restarts if the visitor comes back
  raf = requestAnimationFrame(tick);
}
function settle(i) {
  if (i === scene) return;
  scene = i; auto.classList.toggle('on', !!i);
  if (raf) { cancelAnimationFrame(raf); raf = 0; }
  if (!i) return;
  cue2.setAttribute('aria-label', `Go to ${CHAPTERS[i + 1].toLowerCase()}`);
  left = AUTO; last = 0; run.style.strokeDashoffset = 0;
  if (!reduce) raf = requestAnimationFrame(tick);
}
cue2.addEventListener('click', () => scene && next(scene + 1));
// pausing holds every countdown until play is pressed again
pp.addEventListener('click', () => {
  paused = !paused;
  pp.setAttribute('aria-pressed', paused); pp.setAttribute('aria-label', paused ? 'Play' : 'Pause');
});
onScene = t => settle(Math.max(0, LIVE.findIndex(r => r && t > r[0] && t < r[1])));
onScene(st.progress * TOTAL);

addEventListener('load', () => {
  ScrollTrigger.refresh();
  // the sunrise plays by itself when the page opens at the top
  if (!reduce && scrollY < 4) setTimeout(() => { if (scrollY < 4) glideTo(REST[1], 4.6); }, 500);
});
})();
