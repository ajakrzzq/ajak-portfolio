(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * WhatsApp CTAs — placeholder Malaysian number, easy to replace.
   * Every [data-whatsapp] link already has a plain wa.me href in the
   * markup as a no-JS fallback; this only attaches the pre-filled text.
   * ------------------------------------------------------------------ */
  var WHATSAPP_NUMBER = '60123456789'; // TODO: replace with the real AirPro KL WhatsApp number

  document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
    var message = el.getAttribute('data-whatsapp') || 'Hi AirPro KL, I would like to enquire about your air-conditioning services.';
    el.setAttribute('href', 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* ------------------------------------------------------------------ *
   * Toast (gentle inline confirmations for demo interactions)
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
   * FAQ accordion
   * ------------------------------------------------------------------ */
  var faqItems = document.querySelectorAll('[data-faq-item]');
  faqItems.forEach(function (item) {
    var question = item.querySelector('[data-faq-question]');
    var answer = item.querySelector('[data-faq-answer]');
    if (!question || !answer) return;

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      faqItems.forEach(function (other) {
        if (other === item) return;
        other.classList.remove('is-open');
        var otherAnswer = other.querySelector('[data-faq-answer]');
        var otherQuestion = other.querySelector('[data-faq-question]');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
        if (otherQuestion) otherQuestion.setAttribute('aria-expanded', 'false');
      });

      if (isOpen) {
        item.classList.remove('is-open');
        answer.style.maxHeight = null;
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  window.addEventListener('resize', function () {
    document.querySelectorAll('.faq-item.is-open [data-faq-answer]').forEach(function (answer) {
      answer.style.maxHeight = answer.scrollHeight + 'px';
    });
  });

  /* ------------------------------------------------------------------ *
   * Quote request form — no backend; assembles a pre-filled WhatsApp
   * message from the fields instead (same approach as the main
   * ajak.Web portfolio contact form).
   * ------------------------------------------------------------------ */
  var quoteForm = document.querySelector('[data-quote-form]');
  if (quoteForm) {
    quoteForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var name = (quoteForm.querySelector('[name="name"]') || {}).value || '';
      var area = (quoteForm.querySelector('[name="area"]') || {}).value || '';
      var service = (quoteForm.querySelector('[name="service"]') || {}).value || '';
      var details = (quoteForm.querySelector('[name="details"]') || {}).value || '';

      var lines = ['Hi AirPro KL, I would like to request a free quote.'];
      if (name) lines.push('Name: ' + name);
      if (area) lines.push('Area: ' + area);
      if (service) lines.push('Service needed: ' + service);
      if (details) lines.push('Details: ' + details);

      var message = lines.join('\n');
      var url = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
      window.open(url, '_blank', 'noopener');
      showToast('Opening WhatsApp with your quote request filled in…');
    });
  }

  /* ------------------------------------------------------------------ *
   * Concept-demo inert actions: social icons with no real destination.
   * ------------------------------------------------------------------ */
  document.querySelectorAll('[data-demo-inert]').forEach(function (el) {
    el.addEventListener('click', function (event) {
      event.preventDefault();
      showToast(el.getAttribute('data-demo-inert') || 'This is a concept demo — this action is not connected to a live service.');
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
