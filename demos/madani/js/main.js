(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * Toast (used for concept-demo notices on inert actions)
   * ------------------------------------------------------------------ */
  var toastEl = document.querySelector('[data-toast]');
  var toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 4200);
  }

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
   * Project filter
   * ------------------------------------------------------------------ */
  var filterButtons = document.querySelectorAll('[data-filter]');
  var projectCards = document.querySelectorAll('[data-project-category]');
  var projectGrid = document.querySelector('[data-project-grid]');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');

      var filter = btn.getAttribute('data-filter');
      var visibleCount = 0;

      projectCards.forEach(function (card) {
        var match = filter === 'all' || card.getAttribute('data-project-category') === filter;
        card.style.display = match ? '' : 'none';
        if (match) visibleCount += 1;
      });

      if (projectGrid) {
        projectGrid.setAttribute('data-empty', visibleCount === 0 ? 'true' : 'false');
      }
    });
  });

  /* ------------------------------------------------------------------ *
   * Apply Now: scroll to contact form and pre-fill the enquiry
   * ------------------------------------------------------------------ */
  var messageField = document.getElementById('contact-message');
  var officeField = document.getElementById('contact-office');

  document.querySelectorAll('[data-apply-role]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var role = btn.getAttribute('data-apply-role');
      var location = btn.getAttribute('data-apply-location') || '';

      if (messageField) {
        messageField.value = 'I would like to apply for the ' + role + ' position' + (location ? ' (' + location + ')' : '') + '. Please let me know the next steps.';
      }
      if (officeField && (location.indexOf('BN') !== -1 || location.indexOf('Brunei') !== -1)) {
        officeField.value = 'brunei';
      }

      var contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
      if (messageField) {
        setTimeout(function () { messageField.focus(); }, prefersReducedMotion ? 0 : 500);
      }
    });
  });

  /* ------------------------------------------------------------------ *
   * Concept-demo inert actions: WhatsApp CTA + social icons
   * ------------------------------------------------------------------ */
  document.querySelectorAll('[data-demo-inert]').forEach(function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      showToast(el.getAttribute('data-demo-inert') || 'This is a concept demo — this action is not connected to a live service.');
    });
  });

  /* ------------------------------------------------------------------ *
   * Contact form: no backend, honest inline confirmation
   * ------------------------------------------------------------------ */
  var contactForm = document.querySelector('[data-contact-form]');
  var formStatus = document.querySelector('[data-form-status]');

  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      if (formStatus) {
        formStatus.textContent = 'This is a concept demo — your message was not sent anywhere. In a live deployment, this form would reach Madani Sdn. Bhd. directly.';
        formStatus.classList.add('is-visible');
      }
      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------ *
   * Footer year
   * ------------------------------------------------------------------ */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }
})();
