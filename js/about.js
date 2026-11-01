/* Follow the sun, About: every stripe is a story. It opens on the striped sun from the logo; as you scroll, each
   stripe becomes a window onto the striped mountain, the gaps close, and the sun opens into the photograph. Then the
   mission, written into place word by word; how a piece comes to be, walked sideways under a moving sun; the archive;
   questions; and a drawn sunset to close. Runs after store.js (window.FM) and kit.js; scrubbed with GSAP ScrollTrigger. */
(() => {
'use strict';
const A = FM.base;
const $ = (s, el = document) => el.querySelector(s), $$ = (s, el = document) => [...el.querySelectorAll(s)];
const main = $('#main'), hd = $('.hd');
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
const FILM = 'https://freemorrow.com/cdn/shop/videos/c/vp/a222892b32af4fb0b2b1a1a89c07a3e6/a222892b32af4fb0b2b1a1a89c07a3e6.HD-1080p-7.2Mbps-96820446.mp4?v=0';
// the stripes of the sun, as [top, height] in a 100-unit disc: a solid dome, then bands that thin towards the horizon
const BANDS = [[0, 41], [45, 5.2], [53.6, 4.4], [61.2, 3.6], [67.6, 2.8], [73.2, 2.2]];
const SUN = id => `<svg viewBox="0 0 100 77" aria-hidden="true"><defs><clipPath id="${id}"><circle cx="50" cy="50" r="50"/></clipPath></defs><g clip-path="url(#${id})" fill="#C9432A">${BANDS.map(([y, h]) => `<rect x="0" y="${y}" width="100" height="${h}"/>`).join('')}</g></svg>`;
const R = [
  'M0 250L90 214L170 236L290 150L380 196L470 168L600 92L700 168L800 130L900 182L1010 120L1130 196L1240 150L1350 206L1440 176V420H0Z',
  'M0 300L120 262L240 290L360 222L470 268L580 236L690 286L820 214L930 262L1050 230L1170 282L1290 240L1440 270V420H0Z',
  'M0 352L150 322L300 346L450 306L610 340L760 312L920 348L1080 316L1240 344L1440 322V420H0Z',
];
const ridge = (cls, cols) => `<svg class="mtn ${cls}" viewBox="0 0 1440 420" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${R.map((d, i) => `<path d="${d}" fill="${cols[i]}"/>`).join('')}</svg>`;
const MISSION = 'To inspire people to discover, value and protect the extraordinary world around them.';
const STEPS = [
  { t: 'A story', img: 'video-poster.jpg', video: true, alt: 'Mist rising off a rainforest canopy at first light',
    p: 'Every collection begins with something real: a landscape, a little-known animal, a remarkable person, a tradition or an idea. The story always comes first.' },
  { t: 'An idea, drawn', img: 'col-hoodie.jpg', alt: 'The back of the Basecamp Hoodie, printed with the striped sun',
    p: 'Each garment is designed to carry an idea. Sometimes that becomes an illustration. Sometimes a statement, a place or a small detail worth noticing.' },
  { t: 'The cloth', img: 'hands.jpg', alt: 'Two hands resting against undyed cloth',
    p: 'Every piece is created to mean something, not simply follow a trend. Selected pieces use organic cotton, and every product page lists what it is made of.' },
  { t: 'Somewhere new', img: 'life-1.jpg', alt: 'Wearing the Everyday Tee among rice terraces',
    p: 'Designed with a person, a destination or an experience in mind, from exploring your own neighbourhood to heading somewhere new.' },
];
const ARCHIVE = [
  [['hero-forest.jpg', 'The woodland', '50% 35%'], ['mountain.jpg', 'Striped ridges', '50% 50%']],
  [['video-poster.jpg', 'The canopy', '50% 50%'], ['col-river.jpg', 'The ridge', '50% 25%'], ['flatlay.jpg', 'Laid flat', '50% 50%']],
  [['life-2.jpg', 'The terraces', '50% 35%'], ['col-hoodie.jpg', 'The striped sun', '50% 40%']],
];
const FAQ = [
  ['What is Freemorrow?', 'An adventure-inspired clothing and accessories brand for people who love to travel, explore and discover. The collection includes tees, hoodies, long-sleeve shirts, hats and tote bags designed for everyday wear.'],
  ['What inspires the clothing?', 'Every garment is designed with a person, a destination or an experience in mind, from exploring your own neighbourhood to heading somewhere new.'],
  ['Do you offer organic cotton clothing?', 'Yes. Selected products use organic cotton, including the oversized organic cotton tees, ribbed beanies and organic denim tote. Each product page lists its fabric composition.'],
  ['How does buying Freemorrow support charity?', 'All proceeds go toward supporting our charity partner and its work combating human trafficking and ecocide. Every purchase contributes to leaving the world better than we found it.'],
];

document.body.classList.add('float');
main.innerHTML = `
<section class="ab-open" aria-label="About Freemorrow">
  <div class="ab-stage">
    <svg class="ab-win" aria-hidden="true"><defs><clipPath id="abC"><circle/></clipPath>
      <mask id="abM" maskUnits="userSpaceOnUse"><rect class="mbg" fill="#000"/><g clip-path="url(#abC)">${BANDS.map(() => '<rect class="mb" fill="#fff"/>').join('')}</g></mask></defs>
      <image href="${A}mountain.jpg" preserveAspectRatio="xMidYMid slice" mask="url(#abM)"/>
      <g clip-path="url(#abC)">${BANDS.map(() => '<rect class="rb" fill="#C9432A"/>').join('')}</g></svg>
    <div class="ab-shade"></div>
    ${ridge('day', ['#E9C9A4', '#D08B66', '#2E4A3B'])}
    <div class="ab-caps">
      <article class="ab-cap"><p class="mono">About Freemorrow</p><h1>Every stripe <em>is a story.</em></h1><p class="lead">Freemorrow is a purpose-led clothing brand inspired by extraordinary places, people, wildlife, cultures and ideas.</p></article>
      <article class="ab-cap"><p class="mono"><b>01</b> · Belief</p><h2>People protect what they <em>first learn to love.</em></h2><p class="lead">Through storytelling, design and clothing, we celebrate what makes the world worth exploring, and help protect the future it deserves.</p></article>
    </div>
    <div class="cue mono" aria-hidden="true"><i></i>Scroll</div>
  </div>
</section>

<section class="ab-mission">
  <p class="mono"><b>02</b> · Mission</p>
  <p class="words" aria-label="${MISSION}">${MISSION.split(' ').map(w => `<span aria-hidden="true">${w}</span>`).join(' ')}</p>
  <p class="sub">We seek out stories that create wonder, offer a new perspective and build a deeper connection with people and the planet.</p>
</section>

<section class="ab-way">
  <div class="way-pin">
    <header class="way-h"><div><p class="mono"><b>03</b> · How a piece comes to be</p><h2>From a story <em>to something you wear.</em></h2></div>
      <p class="mono way-n" aria-hidden="true"><b data-step>01</b> / 0${STEPS.length}</p></header>
    <div class="way-sky" aria-hidden="true"><svg viewBox="0 0 1000 100" preserveAspectRatio="none"><path class="arc" d="M0 100Q500 -80 1000 100"/><path class="arc-on" d="M0 100Q500 -80 1000 100"/></svg><span class="way-sun">${SUN('wsC')}</span></div>
    <ol class="way-track">${STEPS.map((s, i) => `
      <li class="step"><figure>${s.video ? `<video muted loop playsinline preload="none" poster="${A + s.img}" aria-label="${s.alt}"></video>` : `<img src="${A + s.img}" alt="${s.alt}" loading="lazy">`}</figure>
        <div><p class="mono"><b>0${i + 1}</b></p><h3>${s.t}</h3><p>${s.p}</p></div></li>`).join('')}</ol>
  </div>
</section>

<section class="ab-vision">
  <div class="vis-t"><p class="mono"><b>04</b> · Vision</p><h2>A fashion brand where every product <em>begins with purpose.</em></h2>
    <p>An evolving archive of the world’s wonder, connecting a global community of curious optimists. New frames are added with every story.</p>
    <a class="tlink" href="index.html">Follow the sun ${ARROW}</a></div>
  <div class="vis-cols" aria-label="From the archive">${ARCHIVE.map((col, c) => `<div class="vcol" data-c="${c}">${col.map(([img, cap, pos]) => `<figure><img src="${A + img}" alt="${cap}" loading="lazy" style="object-position:${pos}"><figcaption class="mono">${cap}</figcaption></figure>`).join('')}</div>`).join('')}</div>
</section>

<section class="ab-faq" id="faq"><div><p class="mono">Questions</p><h2>Asked <em>along the way.</em></h2></div>
  <div class="faq-l">${FAQ.map(([q, a]) => `<details><summary>${q}<i aria-hidden="true"></i></summary><p>${a}</p></details>`).join('')}</div>
</section>

<section class="ab-end">
  <div class="end-sun">${SUN('esC')}</div>
  ${ridge('night', ['#2A3830', '#22302A', '#1C2720'])}
  <div class="end-t"><p class="mono">Where it goes</p><h2>Leave the world better <em>than you found it.</em></h2>
    <p>All proceeds from Freemorrow support the work of Not For Sale, helping protect people and the planet by addressing human trafficking, modern-day slavery and ecocide.</p>
    <div class="acts"><a class="btn" href="shop.html">Shop the collection ${ARROW}</a><a class="tlink" href="index.html">Follow the sun ${ARROW}</a></div></div>
</section>`;

const vids = $$('video');
// films only load and play while on screen
if (!reduce) vids.forEach(v => new IntersectionObserver(([e]) => { if (e.isIntersecting) { if (!v.src) v.src = FILM; v.play().catch(() => {}); } else v.pause(); }, { threshold: .3 }).observe(v));

if (!window.gsap || !window.ScrollTrigger) { document.body.classList.add('static'); hd.classList.add('solid'); return; }
gsap.registerPlugin(ScrollTrigger);
const mm = gsap.matchMedia();

/* ---------- 01 the sun opens into the mountain ---------- */
const stage = $('.ab-stage'), svg = $('.ab-win'), img = $('image', svg), circ = $('#abC circle'), mbg = $('.mbg');
const mb = $$('.mb'), rb = $$('.rb'), caps = $$('.ab-cap');
let G;
const S = { cx: 0, cy: 0, r: 0, f: 0, o0: 1, o1: 1, o2: 1, o3: 1, o4: 1, o5: 1 };
function layout() {
  const W = stage.clientWidth, H = stage.clientHeight, m = W < 760;
  const cx = m ? W / 2 : W * .66, cy = m ? H * .6 : H * .47, r = m ? Math.min(W * .34, H * .2) : Math.min(W * .19, H * .3);
  G = { W, H, m, cx, cy, r, r2: r * 1.22, r1: Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) + 8 };
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  [img, mbg].forEach(el => { el.setAttribute('width', W); el.setAttribute('height', H); });
  draw();
}
// each stripe is a window; f closes the gaps between them until the sun is one disc
function draw() {
  if (!G) return;
  const r = S.r || G.r, cx = S.cx || G.cx, cy = S.cy || G.cy, k = r / 50, top = cy - r;
  circ.setAttribute('cx', cx); circ.setAttribute('cy', cy); circ.setAttribute('r', r);
  BANDS.forEach(([y, h], i) => {
    const next = i < BANDS.length - 1 ? BANDS[i + 1][0] : 100, hh = h + S.f * (next - y - h);
    [mb[i], rb[i]].forEach(el => { el.setAttribute('x', cx - r); el.setAttribute('width', 2 * r); el.setAttribute('y', top + y * k); el.setAttribute('height', hh * k + .5); });
    rb[i].setAttribute('opacity', S['o' + i]);
  });
}
layout();
ScrollTrigger.addEventListener('refreshInit', layout);

const TOTAL = 3.4;
const tl = gsap.timeline({ defaults: { ease: 'power2.inOut', duration: 1 }, onUpdate: draw });
tl.set(S, { cx: () => G.cx, cy: () => G.cy, r: () => G.r, f: 0, o0: 1, o1: 1, o2: 1, o3: 1, o4: 1, o5: 1 }, 0)
  .set(stage, { '--fg': '#1D201C', '--fg2': 'rgba(29,32,28,.72)' }, 0)
  .set('.ab-shade', { autoAlpha: 0 }, 0).set('.ab-stage .mtn', { yPercent: 0 }, 0)
  .set(caps[1], { autoAlpha: 0, y: 24 }, 0);
// the stripes turn, top to bottom, from sun red into windows onto the mountain
tl.to('.cue', { autoAlpha: 0, duration: .15 }, 0);
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
  trigger: '.ab-open', start: 'top top', end: () => '+=' + Math.round(TOTAL * innerHeight * .8), pin: true, scrub: reduce ? true : 1,
  anticipatePin: 1, animation: tl, invalidateOnRefresh: true,
  onUpdate: self => { const t = self.progress * TOTAL; hd.classList.toggle('dark', t > 2.0 && self.progress < 1); },
  onLeave: () => { hd.classList.remove('dark'); hd.classList.add('solid'); }, onEnterBack: () => hd.classList.remove('solid'),
});

/* ---------- 02 the mission, written into place ---------- */
gsap.to('.words span', { opacity: 1, stagger: .1, ease: 'none', scrollTrigger: { trigger: '.words', start: 'top 78%', end: 'bottom 42%', scrub: reduce ? true : .6 } });

/* ---------- 03 how a piece comes to be: sideways, under a moving sun ---------- */
const arc = $('.arc-on'), wsun = $('.way-sun'), sky = $('.way-sky'), stepN = $('[data-step]');
const len = arc.getTotalLength();
arc.style.strokeDasharray = len;
function sunAt(p) {
  const pt = arc.getPointAtLength(p * len), w = sky.clientWidth, h = sky.clientHeight, s = wsun.offsetWidth;
  wsun.style.transform = `translate(${pt.x / 1000 * w - s / 2}px,${pt.y / 100 * h - s * .5}px)`;
  arc.style.strokeDashoffset = len * (1 - p);
  stepN.textContent = '0' + Math.min(STEPS.length, Math.floor(p * STEPS.length * .999) + 1);
}
mm.add('(min-width: 761px)', () => {
  const track = $('.way-track'), dist = () => track.scrollWidth - innerWidth + parseFloat(getComputedStyle(track).paddingLeft);
  gsap.to(track, { x: () => -dist(), ease: 'none', scrollTrigger: { trigger: '.ab-way', start: 'top top', end: () => '+=' + dist(), pin: '.way-pin', scrub: reduce ? true : .8, invalidateOnRefresh: true, anticipatePin: 1, onUpdate: s => sunAt(s.progress) } });
  sunAt(0);
});
mm.add('(max-width: 760px)', () => {
  ScrollTrigger.create({ trigger: '.way-track', start: 'top 60%', end: 'bottom 60%', onUpdate: s => sunAt(s.progress) });
  sunAt(0);
});

/* ---------- 04 the archive drifts at three speeds ---------- */
mm.add('(min-width: 761px)', () => {
  [[-6, 0], [10, 1], [-14, 2]].forEach(([d, c]) => gsap.fromTo(`.vcol[data-c="${c}"]`, { yPercent: -d / 2 }, { yPercent: d, ease: 'none', scrollTrigger: { trigger: '.ab-vision', start: 'top bottom', end: 'bottom top', scrub: true } }));
});

/* ---------- 06 sunset ---------- */
gsap.fromTo('.end-sun', { yPercent: -40 }, { yPercent: 120, ease: 'none', scrollTrigger: { trigger: '.ab-end', start: 'top 70%', end: 'bottom bottom', scrub: reduce ? true : .6 } });

addEventListener('load', () => ScrollTrigger.refresh());
})();
