/**
 * Skilleze home — v4 effects (index.html only, no dependencies)
 *  hero: typing line, pointer-follow glow · stats counters · marquee pause · card tilt + glow · magnetic CTAs
 *  about timeline fill · mobile: carousel dots, bottom-sheet backdrop/lock, compact action bar · image blur-up
 * Everything is progressive: no JS / reduced motion = static, fully readable page.
 */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches;
  var raf = window.requestAnimationFrame.bind(window);
  function $(s, c) { return (c || d).querySelector(s); }
  function $$(s, c) { return [].slice.call((c || d).querySelectorAll(s)); }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* ------------------------------------------------ hero: typing line */
  function initTyping() {
    var el = $('.hv4-rot-v'); if (!el || reduce) return;
    var words = (el.getAttribute('data-words') || '').split('|').filter(Boolean);
    if (words.length < 2) return;
    var hero = $('.hv-hero'), w = 0, n = words[0].length, del = false;
    el.classList.add('is-typing');
    (function tick() {
      var idle = d.hidden || (hero && hero.classList.contains('is-offscreen'));
      if (idle) { setTimeout(tick, 500); return; }
      var word = words[w], wait;
      if (!del) { n++; wait = 75; if (n >= word.length) { n = word.length; del = true; wait = 1500; } }
      else { n--; wait = 38; if (n <= 0) { n = 0; del = false; w = (w + 1) % words.length; wait = 260; } }
      el.textContent = word.slice(0, n) || '​';
      setTimeout(tick, wait);
    })();
  }

  /* ------------------------------------- hero: pointer-follow background */
  function initHeroPointer() {
    var hero = $('.hv-hero'); if (!hero || !fine || reduce) return;
    var tx = 0, ty = 0, cx = 0, cy = 0, on = false;
    function frame() {
      cx += (tx - cx) * .06; cy += (ty - cy) * .06;
      hero.style.setProperty('--px', cx.toFixed(3)); hero.style.setProperty('--py', cy.toFixed(3));
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > .002 && !hero.classList.contains('is-offscreen')) raf(frame); else on = false;
    }
    hero.addEventListener('pointermove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = (e.clientX - r.left) / r.width - .5; ty = (e.clientY - r.top) / r.height - .5;
      if (!on) { on = true; raf(frame); }
    }, { passive: true });
  }

  /* ---------------------------------------------------- stats counters */
  function initCounters() {
    var box = $('.hv4-stats'); if (!box) return;
    var nums = $$('[data-count]', box);
    if (reduce || !('IntersectionObserver' in window)) return;      // keep the final numbers
    nums.forEach(function (n) { n.textContent = '0'; });
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io.disconnect();
      var t0 = performance.now(), dur = 1500;
      (function step(t) {
        var p = clamp((t - t0) / dur, 0, 1), e = 1 - Math.pow(1 - p, 3);
        nums.forEach(function (n) { n.textContent = Math.round(+n.getAttribute('data-count') * e); });
        if (p < 1) raf(step);
      })(t0);
    }, { threshold: .4 });
    io.observe(box);
  }

  /* -------------------------------------------------- marquee pausing */
  function initMarquee() {
    var m = $('.hv4-marquee'); if (!m || !('IntersectionObserver' in window)) return;
    new IntersectionObserver(function (es) { m.classList.toggle('is-paused', !es[0].isIntersecting); }).observe(m);
  }

  /* ------------------------------------------------ card tilt + glow */
  function initTilt() {
    if (!fine || reduce) return;
    var cfg = [['.hv-ccard', 5], ['.hv-strip-item', 3.5], ['.hv3-card', 2.2]];
    cfg.forEach(function (c) {
      $$(c[0]).forEach(function (el) {
        var max = c[1], r = null, pend = false, ex = 0, ey = 0;
        function paint() {
          pend = false; if (!r) return;
          var px = ex / r.width, py = ey / r.height;
          el.style.setProperty('--mx', ex + 'px'); el.style.setProperty('--my', ey + 'px');
          el.style.transform = 'perspective(900px) rotateX(' + ((.5 - py) * max).toFixed(2) + 'deg) rotateY(' + ((px - .5) * max * 1.3).toFixed(2) + 'deg) translateY(-4px)';
        }
        el.addEventListener('pointerenter', function (e) { if (e.pointerType !== 'mouse') return; r = el.getBoundingClientRect(); el.classList.add('is-tilt'); });
        el.addEventListener('pointermove', function (e) {
          if (!r || e.pointerType !== 'mouse') return;
          ex = e.clientX - r.left; ey = e.clientY - r.top;
          if (!pend) { pend = true; raf(paint); }
        }, { passive: true });
        el.addEventListener('pointerleave', function () { r = null; el.classList.remove('is-tilt'); el.style.transform = ''; });
      });
    });
  }

  /* --------------------------------------------------- magnetic CTAs */
  function initMagnet() {
    if (!fine || reduce) return;
    var items = $$('.hv-cta, .hv3-btn, .hv-cta-sec a.hv-cta').map(function (el) { return { el: el, x: 0, y: 0, tx: 0, ty: 0, r: null }; });
    if (!items.length) return;
    var mx = -1e4, my = -1e4, run = false;
    function loop() {
      var busy = false;
      items.forEach(function (it) {
        var r = it.r = it.el.getBoundingClientRect();
        var cx = r.left + r.width / 2 - it.x, cy = r.top + r.height / 2 - it.y;      // un-shifted centre
        var dx = mx - cx, dy = my - cy, near = Math.abs(dx) < r.width / 2 + 46 && Math.abs(dy) < r.height / 2 + 46;
        it.tx = near ? clamp(dx * .22, -9, 9) : 0; it.ty = near ? clamp(dy * .3, -7, 7) : 0;
        it.x += (it.tx - it.x) * .18; it.y += (it.ty - it.y) * .18;
        if (Math.abs(it.x) < .05 && !it.tx) it.x = 0; if (Math.abs(it.y) < .05 && !it.ty) it.y = 0;
        it.el.style.translate = (it.x || it.y) ? it.x.toFixed(2) + 'px ' + it.y.toFixed(2) + 'px' : '';
        if (it.x || it.y || it.tx || it.ty) busy = true;
      });
      if (busy) raf(loop); else run = false;
    }
    addEventListener('pointermove', function (e) { mx = e.clientX; my = e.clientY; if (!run) { run = true; raf(loop); } }, { passive: true });
  }

  /* ------------------------------------------------- about timeline */
  function initTimeline() {
    var tl = $('.hv4-timeline'); if (!tl) return;
    var steps = $$('.hv-step', tl), vis = true, pend = false;
    function paint() {
      pend = false; var r = tl.getBoundingClientRect(), vh = innerHeight;
      var p = reduce ? 1 : clamp((vh * .8 - r.top) / Math.max(r.height, vh * .45), 0, 1);
      tl.style.setProperty('--p', p.toFixed(3));
      steps.forEach(function (s, i) { s.classList.toggle('is-lit', p * steps.length > i + .2); });
    }
    function req() { if (vis && !pend) { pend = true; raf(paint); } }
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; req(); }, { rootMargin: '120px 0px' }).observe(tl);
    addEventListener('scroll', req, { passive: true }); addEventListener('resize', req); paint();
  }

  /* ------------------------------------- mobile: course carousel dots */
  function initCarousel() {
    var grid = $('.hv-courses > .grid'); if (!grid) return;
    var cards = $$('.hv-ccard', grid); if (cards.length < 2) return;
    var nav = d.createElement('div'); nav.className = 'hv4-dots';
    var dots = cards.map(function (c, i) {
      var b = d.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Show course ' + (i + 1) + ' of ' + cards.length);
      b.addEventListener('click', function () { grid.scrollTo({ left: c.offsetLeft - (grid.clientWidth - c.offsetWidth) / 2, behavior: reduce ? 'auto' : 'smooth' }); });
      nav.appendChild(b); return b;
    });
    grid.parentNode.insertBefore(nav, grid.nextSibling);
    var pend = false;
    function sync() {
      pend = false; var mid = grid.scrollLeft + grid.clientWidth / 2, best = 0, bd = 1e9;
      cards.forEach(function (c, i) { var dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (dd < bd) { bd = dd; best = i; } });
      dots.forEach(function (b, i) { b.classList.toggle('is-on', i === best); });
    }
    grid.addEventListener('scroll', function () { if (!pend) { pend = true; raf(sync); } }, { passive: true });
    addEventListener('resize', sync); sync();
  }

  /* ----------------------------- mobile menu as bottom sheet (helpers) */
  function initSheet() {
    var btn = $('#mobile-menu-btn'), menu = $('#mobile-menu'); if (!btn || !menu) return;
    function open() { return !menu.classList.contains('hidden'); }
    new MutationObserver(function () { root.classList.toggle('hv4-lock', open() && innerWidth < 1024); }).observe(menu, { attributes: true, attributeFilter: ['class'] });
    d.addEventListener('click', function (e) {
      if (open() && !menu.contains(e.target) && !btn.contains(e.target)) { e.preventDefault(); e.stopPropagation(); btn.click(); }
    }, true);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open()) { btn.click(); btn.focus(); } });
    menu.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) { if (open()) btn.click(); } });
    addEventListener('resize', function () { if (innerWidth >= 1024) root.classList.remove('hv4-lock'); });
  }

  /* ------------------------------------- mobile: compact action bar */
  function initBar() {
    var bar = $('.md\\:hidden.fixed.bottom-0'); if (!bar) return;
    var last = scrollY, compact = false;
    addEventListener('scroll', function () {
      var y = scrollY, dy = y - last; if (Math.abs(dy) < 8) return; last = y;
      var next = y > 320 && dy > 0 ? true : (dy < 0 || y <= 320 ? false : compact);
      if (next !== compact) { compact = next; bar.classList.toggle('hv4-compact', compact); }
    }, { passive: true });
  }

  /* ---------------------------------------------- image blur-up */
  function initImages() {
    $$('main img[loading="lazy"]').forEach(function (img) {
      function done() { img.classList.add('is-loaded'); }
      if (img.complete && img.naturalWidth) done(); else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', done, { once: true }); }
    });
  }

  function boot() {
    initTyping(); initHeroPointer(); initCounters(); initMarquee(); initTilt(); initMagnet();
    initTimeline(); initCarousel(); initSheet(); initBar(); initImages();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
