/* Follow the sun: the home page is one day. It opens and closes drawn: the striped sun from the logo rising over the
   mountains, and setting behind them. In between it is real: the sun turns into a window onto the film, then each
   place rises over the last (woodland, terraces, ridge), with pins on what is being worn. Animates the markup that
   sections/story.liquid renders; scrubbed with GSAP ScrollTrigger, and plays itself until the visitor takes over. */
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const hd = $('.hd');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const CHAPTERS = $$('.chap button span').map(s => s.textContent.trim());
if (!$('.story')) return;
if (!window.gsap || !window.ScrollTrigger) { document.documentElement.classList.add('story-static'); return; } // without the libraries the captions still read in order
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
at('.mtn.day', { yPercent: 110, ease: 'power2.in' }, 1.05, .55);
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
    if (want && !playing) { if (!video.src && video.dataset.src) video.src = video.dataset.src; video.play().catch(() => {}); playing = true; }
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
const html = document.documentElement;
let glide = null, glideY = -1;
function stopGlide() { if (glide) glide.kill(); glide = null; glideY = -1; html.style.scrollBehavior = ''; }
// the page's smooth scrolling is switched off while gliding, so each step lands at once and nothing lags behind
function glideTo(t, dur) {
  stopGlide();
  const o = { y: scrollY };
  html.style.scrollBehavior = 'auto';
  glide = gsap.to(o, { y: yAt(t), duration: reduce ? 0 : dur, ease: 'power1.inOut',
    onUpdate: () => { glideY = Math.round(o.y); scrollTo(0, glideY); }, onComplete: stopGlide });
}
const next = i => glideTo(REST[i], i === 1 ? 4.6 : i === 5 ? 1.8 : 2.6);
// anything the visitor does themselves takes over: it stops a glide, and starts the countdown again from the top
let touched = 0;
function takeOver(e) {
  if (e && e.target && e.target.closest && e.target.closest('.auto,.stage > .cue')) return;
  stopGlide(); touched = performance.now();
}
['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown'].forEach(ev => addEventListener(ev, takeOver, { passive: true }));
// a scroll the glide did not make (a scrollbar drag, momentum) counts too
addEventListener('scroll', () => { if (!glide || Math.abs(scrollY - glideY) > 6) takeOver(); }, { passive: true });
$('.stage > .cue').addEventListener('click', () => next(1));

// each place counts down, then moves on to the next, unless it is paused
const AUTO = 7, auto = $('.auto'), pp = $('.auto-pp'), run = $('.auto-pp .run'), cue2 = $('.auto .cue');
const C = 2 * Math.PI * 20;
run.style.strokeDasharray = C;
let left = AUTO, paused = false, scene = 0, raf = 0, last = 0;
function tick(now) {
  raf = 0;
  if (!scene) return;
  if (touched) { left = AUTO; touched = 0; }
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
  cue2.setAttribute('aria-label', `${cue2.dataset.go} ${CHAPTERS[i + 1]}`);
  left = AUTO; last = 0; run.style.strokeDashoffset = 0;
  if (!reduce) raf = requestAnimationFrame(tick);
}
cue2.addEventListener('click', () => scene && next(scene + 1));
// pausing holds every countdown until play is pressed again
pp.addEventListener('click', () => {
  paused = !paused;
  pp.setAttribute('aria-pressed', paused); pp.setAttribute('aria-label', paused ? pp.dataset.play : pp.dataset.pause);
});
onScene = t => settle(Math.max(0, LIVE.findIndex(r => r && t > r[0] && t < r[1])));
onScene(st.progress * TOTAL);

addEventListener('load', () => {
  ScrollTrigger.refresh();
  // the sunrise plays by itself when the page opens at the top
  if (!reduce && scrollY < 4) setTimeout(() => { if (scrollY < 4) glideTo(REST[1], 4.6); }, 500);
});
})();
