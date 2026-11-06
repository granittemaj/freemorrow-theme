/* Follow the sun, About: every stripe is a story. The striped sun opens into the photograph; the statement is
   written into place word by word; how a piece comes to be is walked sideways under a moving sun; the archive drifts;
   a drawn sunset closes it. Each part runs only when its section is on the page. Scrubbed with GSAP ScrollTrigger. */
(() => {
'use strict';
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const hd = $('.hd');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
// the stripes of the sun, as [top, height] in a 100-unit disc: a solid dome, then bands that thin towards the horizon
const BANDS = [[0, 41], [45, 5.2], [53.6, 4.4], [61.2, 3.6], [67.6, 2.8], [73.2, 2.2]];

// films only load and play while on screen
if (!reduce) $$('.ab-way video, .ab-vision video').forEach(v => new IntersectionObserver(([e]) => {
  if (e.isIntersecting) { if (!v.src && v.dataset.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause();
}, { threshold: .3 }).observe(v));

const opening = $('.ab-open');
if (!opening && hd) hd.classList.add('solid');
if (!window.gsap || !window.ScrollTrigger) { document.documentElement.classList.add('about-static'); hd && hd.classList.add('solid'); return; }
gsap.registerPlugin(ScrollTrigger);
const mm = gsap.matchMedia();

/* ---------- the sun opens into the photograph ---------- */
if (opening) {
  const stage = $('.ab-stage'), svg = $('.ab-win'), img = $('image', svg), circ = $('#abC circle'), mbg = $('.mbg');
  const mb = $$('.mb'), rb = $$('.rb'), caps = $$('.ab-cap');
  let G;
  const S = { cx: 0, cy: 0, r: 0, f: 0, o0: 1, o1: 1, o2: 1, o3: 1, o4: 1, o5: 1 };
  const layout = () => {
    const W = stage.clientWidth, H = stage.clientHeight, m = W < 760;
    const cx = m ? W / 2 : W * .66, cy = m ? H * .6 : H * .47, r = m ? Math.min(W * .34, H * .2) : Math.min(W * .19, H * .3);
    G = { W, H, m, cx, cy, r, r2: r * 1.22, r1: Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 8 };
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    [img, mbg].forEach(el => { el.setAttribute('width', W); el.setAttribute('height', H); });
    draw();
  };
  // each stripe is a window; f closes the gaps between them until the sun is one disc
  const draw = () => {
    if (!G) return;
    const r = S.r || G.r, cx = S.cx || G.cx, cy = S.cy || G.cy, k = r / 50, top = cy - r;
    circ.setAttribute('cx', cx); circ.setAttribute('cy', cy); circ.setAttribute('r', r);
    BANDS.forEach(([y, h], i) => {
      const next = i < BANDS.length - 1 ? BANDS[i + 1][0] : 100, hh = h + S.f * (next - y - h);
      [mb[i], rb[i]].forEach(el => { el.setAttribute('x', cx - r); el.setAttribute('width', 2 * r); el.setAttribute('y', top + y * k); el.setAttribute('height', hh * k + .5); });
      rb[i].setAttribute('opacity', S['o' + i]);
    });
  };
  layout();
  ScrollTrigger.addEventListener('refreshInit', layout);

  const TOTAL = 3.4;
  const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 1 }, onUpdate: draw });
  tl.set(S, { cx: () => G.cx, cy: () => G.cy, r: () => G.r, f: 0, o0: 1, o1: 1, o2: 1, o3: 1, o4: 1, o5: 1 }, 0)
    .set(stage, { '--fg': '#1D201C', '--fg2': 'rgba(29,32,28,.72)' }, 0)
    .set('.ab-shade', { autoAlpha: 0 }, 0).set('.ab-stage .mtn', { yPercent: 0 }, 0)
    .set(caps[1], { autoAlpha: 0, y: 24 }, 0);
  // the stripes turn, top to bottom, from sun red into windows onto the photograph
  tl.to('.ab-stage .cue', { autoAlpha: 0, duration: .15 }, 0);
  ['o0', 'o1', 'o2', 'o3', 'o4', 'o5'].forEach((o, i) => tl.to(S, { [o]: 0, duration: .4, ease: 'none' }, .05 + i * .1));
  tl.to(S, { r: () => G.r2, cy: () => G.cy - G.r * .08, duration: .9, ease: 'power1.inOut' }, 0);
  tl.to('.ab-stage .mtn', { yPercent: 14, duration: .9 }, 0);
  tl.to(caps[0], { autoAlpha: 0, y: -24, duration: .3 }, .95);
  // the gaps close, and the sun opens into the photograph
  tl.to(S, { f: 1, duration: .55, ease: 'power2.inOut' }, 1.0);
  tl.to(S, { r: () => G.r1, duration: .8, ease: 'power3.in' }, 1.45);
  tl.to('.ab-stage .mtn', { yPercent: 100, duration: .6, ease: 'power2.in' }, 1.45);
  tl.to('.ab-shade', { autoAlpha: 1, duration: .4, ease: 'none' }, 1.95);
  tl.to(stage, { '--fg': '#F7F2E9', '--fg2': 'rgba(247,242,233,.84)', duration: .25 }, 2.0);
  tl.to(caps[1], { autoAlpha: 1, y: 0, duration: .35 }, 2.25);
  tl.to({}, { duration: .1 }, TOTAL - .1);
  ScrollTrigger.create({
    trigger: opening, start: 'top top', end: () => '+=' + Math.round(TOTAL * innerHeight * .8), pin: true, scrub: reduce ? true : 1,
    anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
    onUpdate: self => { const t = self.progress * TOTAL; hd && hd.classList.toggle('dark', t > 2.0 && self.progress < 1); },
    onLeave: () => { if (hd) { hd.classList.remove('dark'); hd.classList.add('solid'); } }, onEnterBack: () => hd && hd.classList.remove('solid'),
  });
}

/* ---------- the statement, written into place ---------- */
$$('.words').forEach(w => gsap.to($$('span', w), { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: w, start: 'top 78%', end: 'bottom 42%', scrub: reduce ? true : .6 } }));

/* ---------- how a piece comes to be: sideways, under a moving sun ---------- */
const way = $('.ab-way');
if (way && $('.step', way)) {
  const arc = $('.arc-on', way), wsun = $('.way-sun', way), sky = $('.way-sky', way);
  const len = arc.getTotalLength();
  arc.style.strokeDasharray = len;
  const sunAt = p => {
    const pt = arc.getPointAtLength(p * len), w = sky.clientWidth, h = sky.clientHeight, s = wsun.offsetWidth;
    wsun.style.transform = `translate(${pt.x / 1000 * w - s / 2}px,${pt.y / 100 * h - s * .5}px)`;
    arc.style.strokeDashoffset = len * (1 - p);
  };
  mm.add('(min-width: 761px)', () => {
    const track = $('.way-track', way), dist = () => Math.max(0, track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft));
    gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: way, start: 'top top', end: () => '+=' + dist(), pin: $('.way-pin', way), scrub: reduce ? true : .8, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => sunAt(s.progress) } });
    sunAt(0);
  });
  mm.add('(max-width: 760px)', () => {
    ScrollTrigger.create({ trigger: $('.way-track', way), start: 'top 60%', end: 'bottom 60%', onUpdate: s => sunAt(s.progress) });
    sunAt(0);
  });
}

/* ---------- the archive drifts at three speeds ---------- */
const vision = $('.ab-vision');
if (vision) mm.add('(min-width: 761px)', () => {
  [[-6, 0], [10, 1], [-14, 2]].forEach(([d, c]) => {
    const col = $(`.vcol[data-c="${c}"]`, vision);
    col && gsap.fromTo(col, { yPercent: -d / 2 }, { yPercent: d, ease: 'none', scrollTrigger: { trigger: vision, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
});

/* ---------- sunset ---------- */
const end = $('.ab-end');
if (end) gsap.fromTo($('.end-sun', end), { yPercent: -40 }, { yPercent: 120, ease: 'none', scrollTrigger: { trigger: end, start: 'top 70%', end: 'bottom bottom', scrub: reduce ? true : .6 } });

addEventListener('load', () => ScrollTrigger.refresh());
})();
