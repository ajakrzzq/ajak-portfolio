(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * WhatsApp CTAs — placeholder Malaysian number, easy to replace.
   * Every [data-whatsapp] link already has a plain wa.me href in the
   * markup as a no-JS fallback; this only attaches the pre-filled text.
   * ------------------------------------------------------------------ */
  var WHATSAPP_NUMBER = '60123456789'; // TODO: replace with the real Safwa Umrah & Travel WhatsApp number

  document.querySelectorAll('[data-whatsapp]').forEach(function (el) {
    var message = el.getAttribute('data-whatsapp') || 'Hi, I would like to know more about your Umrah packages.';
    el.setAttribute('href', 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message));
    el.setAttribute('target', '_blank');
    el.setAttribute('rel', 'noopener');
  });

  /* ------------------------------------------------------------------ *
   * Toast (used for gentle inline confirmations on demo interactions)
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
   * Trust statistics: count-up when scrolled into view
   * ------------------------------------------------------------------ */
  var statValues = document.querySelectorAll('[data-count-to]');
  if (statValues.length && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          countObserver.unobserve(entry.target);
          var el = entry.target;
          var target = parseFloat(el.getAttribute('data-count-to'));
          var suffix = el.getAttribute('data-count-suffix') || '';
          var decimals = el.getAttribute('data-count-decimals') ? parseInt(el.getAttribute('data-count-decimals'), 10) : 0;

          if (prefersReducedMotion || !isFinite(target)) {
            el.textContent = target.toFixed(decimals) + suffix;
            return;
          }

          var duration = 1400;
          var start = null;

          function step(timestamp) {
            if (start === null) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);
            var eased = 1 - Math.pow(1 - progress, 3);
            var value = target * eased;
            el.textContent = value.toFixed(decimals) + suffix;
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          }
          window.requestAnimationFrame(step);
        });
      },
      { threshold: 0.5 }
    );
    statValues.forEach(function (el) { countObserver.observe(el); });
  }

  /* ------------------------------------------------------------------ *
   * Quick Package Finder
   * ------------------------------------------------------------------ */
  var finderForm = document.querySelector('[data-finder-form]');
  var packageCards = document.querySelectorAll('[data-package-card]');
  var packagesSection = document.getElementById('packages');

  if (finderForm && packageCards.length) {
    finderForm.addEventListener('submit', function (event) {
      event.preventDefault();

      var budget = finderForm.querySelector('[name="budget"]').value;
      var duration = finderForm.querySelector('[name="duration"]').value;
      var period = finderForm.querySelector('[name="period"]').value;
      var anySelected = budget || duration || period;

      var matchCount = 0;

      packageCards.forEach(function (card) {
        card.classList.remove('is-dimmed', 'is-match');

        if (!anySelected) return;

        var cardBudget = card.getAttribute('data-budget');
        var cardDuration = card.getAttribute('data-duration');
        var cardPeriods = (card.getAttribute('data-periods') || '').split(',');

        var matchesBudget = !budget || cardBudget === budget;
        var matchesDuration = !duration || cardDuration === duration;
        var matchesPeriod = !period || cardPeriods.indexOf(period) !== -1;

        if (matchesBudget && matchesDuration && matchesPeriod) {
          card.classList.add('is-match');
          matchCount += 1;
        } else {
          card.classList.add('is-dimmed');
        }
      });

      if (anySelected && matchCount === 0) {
        packageCards.forEach(function (card) { card.classList.remove('is-dimmed'); });
        showToast('No exact match for that combination — here are our most flexible packages. WhatsApp us for a tailored option.');
      } else if (anySelected) {
        showToast(matchCount === 1 ? '1 package matches your preferences.' : matchCount + ' packages match your preferences.');
      }

      if (packagesSection) {
        packagesSection.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Testimonial carousel
   * ------------------------------------------------------------------ */
  var testimonialWrap = document.querySelector('[data-testimonial]');
  if (testimonialWrap) {
    var slidesEl = testimonialWrap.querySelector('[data-testimonial-slides]');
    var slides = Array.prototype.slice.call(testimonialWrap.querySelectorAll('[data-testimonial-slide]'));
    var prevBtn = testimonialWrap.querySelector('[data-testimonial-prev]');
    var nextBtn = testimonialWrap.querySelector('[data-testimonial-next]');
    var dotsWrap = testimonialWrap.querySelector('[data-testimonial-dots]');
    var current = 0;
    var autoplayTimer = null;

    var dots = slides.map(function (_, index) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'testimonial-dot';
      dot.setAttribute('aria-label', 'Show testimonial ' + (index + 1) + ' of ' + slides.length);
      dot.addEventListener('click', function () { goTo(index); resetAutoplay(); });
      if (dotsWrap) dotsWrap.appendChild(dot);
      return dot;
    });

    function render() {
      if (slidesEl) {
        slidesEl.style.transform = 'translateX(-' + (current * 100) + '%)';
      }
      dots.forEach(function (dot, index) {
        dot.classList.toggle('is-active', index === current);
      });
    }

    function goTo(index) {
      current = (index + slides.length) % slides.length;
      render();
    }

    function next() { goTo(current + 1); }
    function prev() { goTo(current - 1); }

    if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetAutoplay(); });
    if (prevBtn) prevBtn.addEventListener('click', function () { prev(); resetAutoplay(); });

    testimonialWrap.setAttribute('tabindex', '0');
    testimonialWrap.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowRight') { next(); resetAutoplay(); }
      if (event.key === 'ArrowLeft') { prev(); resetAutoplay(); }
    });

    function startAutoplay() {
      if (prefersReducedMotion || slides.length < 2) return;
      autoplayTimer = setInterval(next, 6500);
    }
    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }

    testimonialWrap.addEventListener('mouseenter', function () { clearInterval(autoplayTimer); });
    testimonialWrap.addEventListener('mouseleave', startAutoplay);

    render();
    startAutoplay();
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
   * Concept-demo inert actions: guide preview cards, social icons, etc.
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
