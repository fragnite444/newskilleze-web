/**
 * Skilleze v6 — minimal motion layer (no content is changed).
 *  - one ambient background per page type (aurora / grid / rings / beams / lines / waves / particles / mesh / orbit / stripes)
 *  - headings fade-rise once as they enter the viewport
 * Pure CSS animation (transform + opacity only); everything is skipped for reduced-motion and for print-style brochure pages.
 */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  if (!root.classList.contains('home-v2') && !root.classList.contains('sk-t')) return;
  var path = location.pathname.replace(/\/index\.html$/, '/').replace(/\.html$/, '');
  if (/\/(brochure|syllabus)$/.test(path)) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* page type -> background */
  var MAP = [
    [/^\/$/, 'aurora'],
    [/^\/courses(\/|$)/, 'grid'],
    [/^\/internships(\/|$)|^\/internship-in-nagpur$/, 'rings'],
    [/^\/blog(\/|$)/, 'lines'],
    [/^\/compare(\/|$)|^\/courses-vs-internships$/, 'beams'],
    [/^\/nagpur(\/|$)/, 'waves'],
    [/^\/apply|^\/contact|^\/thank-you/, 'particles'],
    [/^\/about|^\/mentors|^\/success-stories/, 'orbit'],
    [/^\/placement-support|^\/career-accelerator|^\/projects|^\/for-/, 'mesh']
  ];
  var kind = 'stripes';
  for (var i = 0; i < MAP.length; i++) { if (MAP[i][0].test(path)) { kind = MAP[i][1]; break; } }
  var COUNT = { aurora: 3, grid: 1, rings: 4, beams: 3, lines: 6, waves: 3, particles: 14, mesh: 1, orbit: 3, stripes: 1 };

  function build() {
    if (d.querySelector('.v6-bg')) return;
    var bg = d.createElement('div');
    bg.className = 'v6-bg v6-' + kind; bg.setAttribute('aria-hidden', 'true');
    var html = '';
    for (var n = 0; n < COUNT[kind]; n++) {
      if (kind === 'particles') {
        var r = function (a, b) { return (a + Math.random() * (b - a)).toFixed(2); };
        html += '<i style="--x:' + r(2, 96) + '%;--s:' + r(3, 7) + 'px;--t:' + r(14, 28) + 's;--d:-' + r(0, 24) + 's;--dx:' + r(-40, 40) + 'px"></i>';
      } else html += '<i></i>';
    }
    bg.innerHTML = html;
    d.body.insertBefore(bg, d.body.firstChild);
  }

  function reveal() {
    var sel = 'main h2, main h3, .hv-sec-title, .hv-cta-sec h2';
    var els = [].slice.call(d.querySelectorAll(sel)).filter(function (el) { return !el.closest('header, footer, nav, #mobile-menu'); });
    if (!els.length || !('IntersectionObserver' in window)) return;
    els.forEach(function (el, k) { el.classList.add('v6-r'); el.style.setProperty('--v6-d', ((k % 3) * 0.06).toFixed(2) + 's'); });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('v6-in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }

  function init() {
    if (reduce) return;
    root.classList.add('v6-js');
    build(); reveal();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();

/* ---- scroll-time load shedding: ambient loops pause while the page is moving, resume right after (native scrolling is never intercepted) ---- */
(function () {
  'use strict';
  var de = document.documentElement, t = 0, on = false;
  function stop() { on = false; de.classList.remove('v6-scrolling'); }
  window.addEventListener('scroll', function () {
    if (!on) { on = true; de.classList.add('v6-scrolling'); }
    clearTimeout(t); t = setTimeout(stop, 140);
  }, { passive: true });
})();
