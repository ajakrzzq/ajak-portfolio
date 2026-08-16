(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * Header: elevate on scroll
   * ------------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ------------------------------------------------------------------ *
   * Mobile menu
   * ------------------------------------------------------------------ */
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    if (header) header.classList.remove('is-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    if (header) header.classList.add('is-open');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) { closeMenu(); } else { openMenu(); }
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  /* ------------------------------------------------------------------ *
   * Active nav link on scroll
   * ------------------------------------------------------------------ */
  var navLinks = document.querySelectorAll('.primary-nav .nav-link');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));

  if (navLinks.length && sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            var match = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', match);
            if (match) { link.setAttribute('aria-current', 'page'); }
            else { link.removeAttribute('aria-current'); }
          });
        });
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
    );
    sections.forEach(function (section) { sectionObserver.observe(section); });
  }

  /* ------------------------------------------------------------------ *
   * Scroll reveal
   * ------------------------------------------------------------------ */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -60px 0px' }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------------ *
   * Menu category tabs
   * ------------------------------------------------------------------ */
  var menuTabs = document.querySelectorAll('[data-menu-filter]');
  var menuCards = document.querySelectorAll('[data-menu-category]');

  menuTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      menuTabs.forEach(function (t) {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      var filter = tab.getAttribute('data-menu-filter');
      menuCards.forEach(function (card) {
        card.hidden = card.getAttribute('data-menu-category') !== filter;
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * Footer year
   * ------------------------------------------------------------------ */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
