/* =========================================================
   MÉLO PÂTISSERIE — concept demo
   Header scroll state, mobile nav, category quick-scroll,
   reveal-on-scroll. No build step, no dependencies.
   ========================================================= */

document.addEventListener('DOMContentLoaded', function () {
  var year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header scroll state ---------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    document.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile nav toggle ---------- */
  var hamburgerBtn = document.getElementById('hamburgerBtn');
  var navScrim = document.getElementById('navScrim');
  var navLinks = document.getElementById('navLinks');
  var navMain = document.getElementById('main');
  var navFooter = document.querySelector('.site-footer');
  var navWaFloat = document.querySelector('.wa-float');

  function closeNav() {
    document.body.classList.remove('nav-open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'false');
    if (navMain) navMain.inert = false;
    if (navFooter) navFooter.inert = false;
    if (navWaFloat) navWaFloat.inert = false;
  }
  function openNav() {
    document.body.classList.add('nav-open');
    if (hamburgerBtn) hamburgerBtn.setAttribute('aria-expanded', 'true');
    if (navMain) navMain.inert = true;
    if (navFooter) navFooter.inert = true;
    if (navWaFloat) navWaFloat.inert = true;
  }
  if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', function () {
      var isOpen = document.body.classList.contains('nav-open');
      isOpen ? closeNav() : openNav();
    });
    if (navScrim) navScrim.addEventListener('click', closeNav);
    navLinks.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeNav);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('nav-open')) closeNav();
    });
  }

  /* ---------- Category tiles scroll to Best Sellers ---------- */
  document.querySelectorAll('.category-tile').forEach(function (tile) {
    tile.addEventListener('click', function (e) {
      var target = document.querySelector('#menu');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var revealEls = document.querySelectorAll('.reveal');
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  } else if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }
});
