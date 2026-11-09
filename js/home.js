/**
 * Skilleze Technologies — Home page behaviour (index.html only, no dependencies)
 *  1. Dark / light theme (persisted, follows system until the visitor chooses) with a View Transitions cross-fade
 *  2. Scroll-reveal (one IntersectionObserver, auto stagger)
 *  3. Hero parallax on the card illustrations (one rAF loop, only while the hero is visible) + pausing of ambient CSS loops off-screen
 *  4. Navbar: hide on scroll down / reveal on scroll up (the fade layer itself is pure CSS via header.scrolled)
 * The initial theme is applied by a tiny inline script in <head> (no flash).
 */
(function () {
  'use strict';

  var KEY = 'skilleze-theme';
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- theme */
  function readStored() {
    try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; }
    catch (e) { return null; }
  }
  function store(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode etc. */ } }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
    var next = theme === 'dark' ? 'light' : 'dark';
    document.querySelectorAll('.hv-theme-toggle').forEach(function (btn) {
      btn.setAttribute('aria-label', 'Switch to ' + next + ' mode');
      btn.setAttribute('title', 'Switch to ' + next + ' mode');
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#09090B' : '#F6F8FC');
  }

  var timer;
  function toggle() {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    store(next);
    if (document.startViewTransition && !reduce) {
      root.classList.add('hv-vt');                       // one cross-fade; per-element transitions are switched off
      var vt = document.startViewTransition(function () { apply(next); });
      var done = function () { root.classList.remove('hv-vt'); };
      vt.finished.then(done, done);
      return;
    }
    root.classList.add('hv-theming');                    // fallback: 350ms colour-only transitions
    apply(next);
    clearTimeout(timer);
    timer = setTimeout(function () { root.classList.remove('hv-theming'); }, 450);
  }

  function initTheme() {
    apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    document.querySelectorAll('.hv-theme-toggle').forEach(function (btn) {
      btn.addEventListener('click', toggle);
    });
    // Follow the OS only while the visitor hasn't picked a theme themselves.
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: light)');
      var onChange = function (e) { if (!readStored()) apply(e.matches ? 'light' : 'dark'); };
      if (mq.addEventListener) mq.addEventListener('change', onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  /* --------------------------------------------------------------- reveal */
  function initReveal() {
    var items = document.querySelectorAll('.hv-reveal');
    if (!items.length) return;
    // stagger index per sibling group (cap 5 so long grids never feel slow); writes only, no layout reads
    var seen = new Map();
    items.forEach(function (el) {
      if (el.style.getPropertyValue('--i')) return;
      var p = el.parentNode, n = seen.get(p) || 0;
      seen.set(p, n + 1);
      if (n) el.style.setProperty('--i', Math.min(n, 5));
    });
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ----------------------------------------------- hero: parallax + pausing */
  function initHero() {
    var hero = document.querySelector('.hv-hero');
    if (!hero) return;

    var inView = true;
    function syncPause() { hero.classList.toggle('is-offscreen', !inView || document.hidden); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) { inView = e[0].isIntersecting; syncPause(); kick(); }).observe(hero);
    }
    document.addEventListener('visibilitychange', syncPause);

    // lite path (reduced motion / touch / small / low-end / Data Saver): CSS float only, no JS parallax
    var c = navigator.connection;
    var lite = reduce || matchMedia('(pointer: coarse)').matches || innerWidth < 768 ||
               (navigator.deviceMemory && navigator.deviceMemory <= 2) || (c && c.saveData);
    var layers = [].slice.call(hero.querySelectorAll('[data-depth]')).map(function (el) {
      return { el: el, d: parseFloat(el.getAttribute('data-depth')) };
    });
    var target = 0, current = 0, running = false;

    function frame() {
      current += (target - current) * 0.12;                       // lerp smoothing
      for (var i = 0; i < layers.length; i++) {                   // writes only — no layout reads in here
        layers[i].el.style.transform = 'translate3d(0,' + (current * layers[i].d).toFixed(2) + 'px,0)';
      }
      if (inView && Math.abs(target - current) > 0.1) requestAnimationFrame(frame);
      else running = false;
    }
    function kick() { if (!lite && !running && inView) { running = true; requestAnimationFrame(frame); } }
    if (!lite) {
      addEventListener('scroll', function () { target = Math.min(scrollY, 600); kick(); }, { passive: true });
      target = Math.min(scrollY, 600);                            // restore position after reload
      kick();
    }
  }

  /* ---------------------------------------------------------------- navbar */
  function initNav() {
    var header = document.querySelector('body > div > header');
    var menu = document.getElementById('mobile-menu');
    if (!header || reduce) return;
    var lastY = scrollY, hidden = false;
    addEventListener('scroll', function () {
      var y = scrollY, dy = y - lastY;
      if (Math.abs(dy) < 6) return;                               // ignore jitter
      lastY = y;
      var hide = dy > 0 && y > 240 &&
                 !(menu && !menu.classList.contains('hidden')) &&  // mobile menu open
                 !header.matches(':hover, :focus-within');         // dropdown / focused control
      if (hide !== hidden) { hidden = hide; header.classList.toggle('hv-nav-hidden', hide); }
    }, { passive: true });
  }

  function boot() { initTheme(); initReveal(); initHero(); initNav(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
