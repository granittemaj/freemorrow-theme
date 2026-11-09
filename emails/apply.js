// Freemorrow: brands one Shopify notification template. Run it in the browser console on a template's
// "Edit code" page (Settings › Notifications › Customer notifications › any email › Edit code), then click Save.
// It puts brand-head.html before </head> and brand-footer.html at the top of the footer, and it replaces
// an earlier copy of either, so it is safe to run again after changing them. Paste the two files' contents
// into FM_HEAD and FM_FOOT first (build.py in this folder writes a ready-to-paste copy, apply.bundle.js).

function fmBrand(src, head, foot) {
  const strip = (s, name) => s.replace(new RegExp('<!-- fm:' + name + ' -->[\\s\\S]*?<!-- /fm:' + name + ' -->\\n?', 'g'), '');
  src = strip(strip(src, 'brand-head'), 'brand-footer');
  const done = { head: false, foot: false };
  const h = src.indexOf('</head>');
  if (h > -1) { src = src.slice(0, h) + head + src.slice(h); done.head = true; }
  // The brand block goes at the top of the footer table, ahead of Shopify's "If you have any questions" line.
  // Some templates use the disclaimer class higher up too, so look only after the footer starts.
  const start = src.search(/<table class="row footer"/);
  if (start > -1) {
    const rest = src.slice(start);
    let at = rest.search(/<p class="disclaimer__subtext"/);
    if (at < 0) {
      const box = rest.search(/<table class="container"/);
      const td = box > -1 ? rest.indexOf('<td>', box) : -1;
      at = td > -1 ? td + 4 : -1;
    }
    if (at > -1) { src = src.slice(0, start + at) + foot + src.slice(start + at); done.foot = true; }
  }
  return { src, done };
}

function fmApply(head, foot) {
  const view = document.querySelector('.cm-content').cmView.view;
  const before = view.state.doc.toString();
  const { src, done } = fmBrand(before, head, foot);
  if (src !== before) view.dispatch({ changes: { from: 0, to: before.length, insert: src } });
  return { changed: src !== before, ...done, length: src.length };
}

if (typeof module !== 'undefined') module.exports = { fmBrand };
