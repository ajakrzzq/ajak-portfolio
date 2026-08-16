(function () {
  'use strict';

  /* ------------------------------------------------------------------ *
   * WhatsApp configuration — the ONLY place the number is defined.
   * Update this single constant to change every WhatsApp link on the
   * page (floating button, header CTA, showroom CTA, contact form).
   * ------------------------------------------------------------------ */
  var WHATSAPP_NUMBER = '60123456789';

  function buildWhatsAppUrl(message) {
    var base = 'https://wa.me/' + WHATSAPP_NUMBER;
    return message ? base + '?text=' + encodeURIComponent(message) : base;
  }

  function applyWhatsAppLinks() {
    document.querySelectorAll('[data-wa]').forEach(function (el) {
      var message = el.getAttribute('data-wa') || '';
      el.setAttribute('href', buildWhatsAppUrl(message));
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener');
    });
  }

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * Toast
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
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }
  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
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
    mobileMenu.querySelectorAll('[data-menu-close]').forEach(function (btn) {
      btn.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') closeMenu();
    });
  }

  /* ------------------------------------------------------------------ *
   * Active nav link on scroll
   * ------------------------------------------------------------------ */
  var navLinks = document.querySelectorAll('.primary-nav a[href^="#"]');
  var sections = Array.prototype.slice.call(document.querySelectorAll('main [id]'));

  if (navLinks.length && sections.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function (link) {
            var match = link.getAttribute('href') === '#' + id;
            link.classList.toggle('is-active', match);
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
    var revealTargets = document.querySelectorAll('[data-reveal]');
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  } else {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------------ *
   * Back to top
   * ------------------------------------------------------------------ */
  var backToTop = document.querySelector('[data-back-to-top]');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('is-visible', window.scrollY > 700);
    }, { passive: true });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------ *
   * Gallery filter
   * ------------------------------------------------------------------ */
  var filterButtons = document.querySelectorAll('[data-gallery-filter]');
  var galleryItems = document.querySelectorAll('[data-gallery-category]');
  var galleryGrid = document.querySelector('[data-gallery-grid]');

  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) {
        b.classList.remove('is-active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('is-active');
      btn.setAttribute('aria-pressed', 'true');

      var filter = btn.getAttribute('data-gallery-filter');
      if (galleryGrid) galleryGrid.setAttribute('data-filtering', 'true');

      galleryItems.forEach(function (item) {
        var match = filter === 'all' || item.getAttribute('data-gallery-category') === filter;
        if (match) {
          item.removeAttribute('hidden');
        } else {
          item.setAttribute('hidden', '');
        }
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * Lightbox
   * ------------------------------------------------------------------ */
  var lightbox = document.querySelector('[data-lightbox]');
  var lightboxImg = lightbox ? lightbox.querySelector('img') : null;
  var lightboxCaption = lightbox ? lightbox.querySelector('.lightbox__caption') : null;
  var lightboxItems = Array.prototype.slice.call(document.querySelectorAll('[data-lightbox-src]'));
  var currentIndex = -1;
  var lastFocusedEl = null;

  function visibleLightboxItems() {
    return lightboxItems.filter(function (el) { return !el.hasAttribute('hidden'); });
  }

  function openLightbox(index) {
    var items = visibleLightboxItems();
    var el = items[index];
    if (!lightbox || !el) return;
    currentIndex = index;
    lightboxImg.src = el.getAttribute('data-lightbox-src');
    lightboxImg.alt = el.getAttribute('data-lightbox-alt') || '';
    if (lightboxCaption) lightboxCaption.textContent = el.getAttribute('data-lightbox-caption') || '';
    lastFocusedEl = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.querySelector('.lightbox__close').focus();
    document.body.classList.add('menu-open');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    document.body.classList.remove('menu-open');
    if (lastFocusedEl) lastFocusedEl.focus();
  }

  function stepLightbox(delta) {
    var items = visibleLightboxItems();
    if (!items.length) return;
    var next = (currentIndex + delta + items.length) % items.length;
    openLightbox(next);
  }

  if (lightbox) {
    document.addEventListener('click', function (event) {
      var trigger = event.target.closest('[data-lightbox-src]');
      if (!trigger) return;
      var items = visibleLightboxItems();
      openLightbox(items.indexOf(trigger));
    });

    lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox__prev').addEventListener('click', function () { stepLightbox(-1); });
    lightbox.querySelector('.lightbox__next').addEventListener('click', function () { stepLightbox(1); });

    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', function (event) {
      if (!lightbox.classList.contains('is-open')) return;
      if (event.key === 'Escape') closeLightbox();
      if (event.key === 'ArrowRight') stepLightbox(1);
      if (event.key === 'ArrowLeft') stepLightbox(-1);
    });
  }

  /* ------------------------------------------------------------------ *
   * FAQ: keep behaviour native via <details>, close siblings for tidiness
   * ------------------------------------------------------------------ */
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.removeAttribute('open');
      });
    });
  });

  /* ------------------------------------------------------------------ *
   * "View Details" on product cards: this concept demo has no individual
   * product pages, so route interest to the contact form instead of
   * leaving the button dead.
   * ------------------------------------------------------------------ */
  var interestField = document.getElementById('contact-interest');
  var messageField = document.getElementById('contact-message');
  document.querySelectorAll('[data-view-product]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var product = btn.getAttribute('data-view-product');
      if (interestField) interestField.value = product;
      if (messageField) messageField.value = 'I would like to know more about the ' + product + '.';
      var contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
      showToast('This concept demo has no individual product pages — we’ve filled in your enquiry below.');
      setTimeout(function () {
        if (messageField) messageField.focus();
      }, prefersReducedMotion ? 0 : 500);
    });
  });

  /* ------------------------------------------------------------------ *
   * Contact form → WhatsApp (no backend; this is a concept demo)
   * ------------------------------------------------------------------ */
  var contactForm = document.querySelector('[data-contact-form]');
  if (contactForm) {
    contactForm.addEventListener('submit', function (event) {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      var data = new FormData(contactForm);
      var name = (data.get('name') || '').toString().trim();
      var phone = (data.get('phone') || '').toString().trim();
      var email = (data.get('email') || '').toString().trim();
      var interest = (data.get('interest') || '').toString().trim();
      var message = (data.get('message') || '').toString().trim();

      var lines = ['Hi Royale Living, I would like to enquire about furniture.'];
      lines.push('Name: ' + name);
      if (phone) lines.push('Phone: ' + phone);
      if (email) lines.push('Email: ' + email);
      if (interest) lines.push('Interested in: ' + interest);
      if (message) lines.push('Message: ' + message);

      var url = buildWhatsAppUrl(lines.join('\n'));
      showToast('Opening WhatsApp with your enquiry — this concept demo has no backend, so nothing is stored or sent to a server.');
      window.open(url, '_blank', 'noopener');
      contactForm.reset();
    });
  }

  /* ------------------------------------------------------------------ *
   * Footer year
   * ------------------------------------------------------------------ */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  applyWhatsAppLinks();
})();
