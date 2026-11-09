/**
 * Skilleze — shared theme behaviour for every page except index.html (home.js does the same there).
 *  - dark / light toggle in the navbar (desktop + mobile), persisted in localStorage('skilleze-theme') and shared with the home page
 *  - follows the OS until the visitor chooses; one cross-fade (View Transitions) when switching
 *  - mobile menu as a bottom sheet (backdrop tap / Esc to close, page scroll locked) and a compact Call/WhatsApp/Apply bar on scroll-down
 * The initial theme is applied by a tiny inline script in <head> (no flash). The toggle is injected here, so page markup/content is untouched.
 */
(function () {
  'use strict';
  var KEY = 'skilleze-theme', d = document, root = d.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var TOGGLE = '<button type="button" class="hv-theme-toggle" aria-label="Switch to light mode" title="Switch to light mode"><span class="hv-tg-thumb" aria-hidden="true"></span>' +
    '<svg class="hv-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>' +
    '<svg class="hv-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path></svg></button>';

  function stored() { try { var v = localStorage.getItem(KEY); return v === 'light' || v === 'dark' ? v : null; } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    root.classList.toggle('light', theme === 'light');
    root.classList.toggle('dark', theme === 'dark');
    var next = theme === 'dark' ? 'light' : 'dark';
    [].forEach.call(d.querySelectorAll('.hv-theme-toggle'), function (b) {
      b.setAttribute('aria-label', 'Switch to ' + next + ' mode'); b.setAttribute('title', 'Switch to ' + next + ' mode');
    });
    var meta = d.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#09090B' : '#F6EDE2');
  }

  var timer;
  function toggle() {
    var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    save(next);
    if (d.startViewTransition && !reduce) {
      root.classList.add('hv-vt');
      var vt = d.startViewTransition(function () { apply(next); });
      var done = function () { root.classList.remove('hv-vt'); };
      vt.finished.then(done, done);
      return;
    }
    root.classList.add('hv-theming'); apply(next);
    clearTimeout(timer); timer = setTimeout(function () { root.classList.remove('hv-theming'); }, 450);
  }

  function inject() {
    var header = d.querySelector('body > div > header'); if (!header) return;
    var desk = header.querySelector('.hidden.lg\\:flex.items-center.gap-4');
    var mob = header.querySelector('.flex.items-center.gap-3.lg\\:hidden');
    var menuBtn = d.getElementById('mobile-menu-btn');
    if (desk) desk.insertAdjacentHTML('beforeend', TOGGLE);
    if (mob) { if (menuBtn && menuBtn.parentNode === mob) menuBtn.insertAdjacentHTML('beforebegin', TOGGLE); else mob.insertAdjacentHTML('afterbegin', TOGGLE); }
    [].forEach.call(d.querySelectorAll('.hv-theme-toggle'), function (b) { b.addEventListener('click', toggle); });
  }

  function initSheet() {
    var btn = d.getElementById('mobile-menu-btn'), menu = d.getElementById('mobile-menu'); if (!btn || !menu) return;
    function open() { return !menu.classList.contains('hidden'); }
    new MutationObserver(function () { root.classList.toggle('hv4-lock', open() && innerWidth < 1024); }).observe(menu, { attributes: true, attributeFilter: ['class'] });
    d.addEventListener('click', function (e) {
      if (open() && !menu.contains(e.target) && !btn.contains(e.target)) { e.preventDefault(); e.stopPropagation(); btn.click(); }
    }, true);
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open()) { btn.click(); btn.focus(); } });
    menu.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a') && open()) btn.click(); });
    addEventListener('resize', function () { if (innerWidth >= 1024) root.classList.remove('hv4-lock'); });
  }

  function initBar() {
    var bar = d.querySelector('.md\\:hidden.fixed.bottom-0'); if (!bar) return;
    var last = scrollY, compact = false;
    addEventListener('scroll', function () {
      var y = scrollY, dy = y - last; if (Math.abs(dy) < 8) return; last = y;
      var next = y > 320 && dy > 0 ? true : (dy < 0 || y <= 320 ? false : compact);
      if (next !== compact) { compact = next; bar.classList.toggle('hv4-compact', compact); }
    }, { passive: true });
  }

  function boot() {
    apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    inject(); initSheet(); initBar();
    apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');   // refresh labels on the injected toggles
    if (window.matchMedia) {
      var mq = matchMedia('(prefers-color-scheme: light)');
      var onChange = function (e) { if (!stored()) apply(e.matches ? 'light' : 'dark'); };
      if (mq.addEventListener) mq.addEventListener('change', onChange); else if (mq.addListener) mq.addListener(onChange);
    }
    // keep two open tabs in sync
    addEventListener('storage', function (e) { if (e.key === KEY && (e.newValue === 'light' || e.newValue === 'dark')) apply(e.newValue); });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', boot); else boot();
})();
