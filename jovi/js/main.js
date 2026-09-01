/* ==========================================================================
   JOVI — main.js
   Homepage interactivity: header/menu state, scroll reveal, the Gift
   Finder quiz, live personalisation preview, product storytelling tabs,
   and the What's in the Bag demo.

   No external dependencies. Every lookup is null-checked so a missing
   element (or a future page reusing this file) fails quietly rather
   than throwing.
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ------------------------------------------------------------------ *
   * Mobile menu
   * ------------------------------------------------------------------ */
  var menuToggle = document.querySelector('[data-menu-toggle]');
  var menuClose = document.querySelector('[data-menu-close]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');

  function openMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.add('is-open');
    document.documentElement.classList.add('no-scroll');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'true');
    document.addEventListener('keydown', onMenuKeydown);
  }

  function closeMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    document.documentElement.classList.remove('no-scroll');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onMenuKeydown);
  }

  function onMenuKeydown(e) {
    if (e.key === 'Escape') closeMenu();
  }

  if (menuToggle) menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  document.querySelectorAll('[data-menu-anchor]').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  /* ------------------------------------------------------------------ *
   * Scroll reveal
   * ------------------------------------------------------------------ */
  var revealEls = Array.prototype.slice.call(document.querySelectorAll('.reveal'));

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var groups = Array.prototype.slice.call(document.querySelectorAll('[data-reveal-group]'));
    groups.forEach(function (group) {
      Array.prototype.slice.call(group.children).forEach(function (child, i) {
        child.style.transitionDelay = Math.min(i * 60, 300) + 'ms';
      });
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    revealEls.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------ *
   * Gift Finder
   * ------------------------------------------------------------------ */
  var giftFinder = document.querySelector('[data-gift-finder]');

  if (giftFinder) {
    var products = [
      { id: 'cardholder', name: 'The Card Case', price: 49, image: 'images/products/card-case.jpg', budget: 'under100', recipients: ['him', 'her', 'special'], occasions: ['thankyou', 'justbecause', 'birthday'], blurb: 'A quiet, useful gift that fits any bag or pocket — and never feels like an afterthought.' },
      { id: 'keychain', name: 'Keychain Fob', price: 59, image: 'images/products/keychain.jpg', budget: 'under100', recipients: ['him', 'her', 'special'], occasions: ['birthday', 'thankyou', 'justbecause', 'graduation'], blurb: 'Small enough to feel spontaneous, personal enough to feel considered.' },
      { id: 'wallet', name: 'The Bifold', price: 119, image: 'images/products/bifold.jpg', budget: '100to200', recipients: ['him', 'special'], occasions: ['birthday', 'graduation', 'anniversary'], blurb: 'The everyday item he’ll actually retire the old one for.' },
      { id: 'sling', name: 'Everyday Sling', price: 189, image: 'images/products/everyday-sling.jpg', budget: '100to200', recipients: ['her', 'special'], occasions: ['birthday', 'graduation', 'anniversary'], blurb: 'Considered enough for dinner, practical enough for every day after.' },
      { id: 'giftset', name: 'Wallet & Card Set', price: 239, image: 'images/products/gift-set.jpg', budget: '200plus', recipients: ['special', 'him', 'her'], occasions: ['anniversary', 'graduation'], blurb: 'Two matched pieces, boxed together — for when one gift needs to feel like enough.' },
      { id: 'weekender', name: 'Weekender Companion', price: 259, image: 'images/products/weekender.jpg', budget: '200plus', recipients: ['him', 'her', 'special'], occasions: ['graduation', 'anniversary'], blurb: 'For the next trip, the next chapter — built to be used, not shelved.' }
    ];

    var occasionLabels = {
      birthday: 'a birthday', anniversary: 'an anniversary', graduation: 'a graduation',
      thankyou: 'saying thank you', justbecause: 'just because'
    };

    var state = { who: null, occasion: null, budget: null };
    var stepEls = giftFinder.querySelectorAll('[data-gf-step]');
    var progressEls = giftFinder.querySelectorAll('[data-gf-progress] li');
    var resultsEl = giftFinder.querySelector('[data-gf-results]');

    function goToStep(n) {
      stepEls.forEach(function (el) {
        el.classList.toggle('is-active', Number(el.getAttribute('data-gf-step')) === n);
      });
      progressEls.forEach(function (el) {
        var step = Number(el.getAttribute('data-step'));
        el.classList.toggle('is-active', step === n);
        el.classList.toggle('is-done', step < n);
      });
      if (n === 4) renderResults();
    }

    function renderResults() {
      if (!resultsEl) return;
      var matches = products
        .filter(function (p) { return p.budget === state.budget; })
        .map(function (p) {
          var score = 0;
          if (state.who && p.recipients.indexOf(state.who) !== -1) score += 2;
          if (state.occasion && p.occasions.indexOf(state.occasion) !== -1) score += 1;
          return { product: p, score: score };
        })
        .sort(function (a, b) { return b.score - a.score || a.product.price - b.product.price; })
        .slice(0, 2);

      var occasionText = occasionLabels[state.occasion] || 'the occasion';

      resultsEl.innerHTML = matches.map(function (m) {
        return (
          '<article class="gf-result-card">' +
          '<div class="gf-result-card__image"><img src="' + m.product.image + '" onerror="this.onerror=null;this.src=\'images/product-placeholder.svg\';" alt="' + m.product.name + '" width="400" height="300" loading="lazy"></div>' +
          '<span class="gf-result-card__chip">Great for ' + occasionText + '</span>' +
          '<h4>' + m.product.name + '</h4>' +
          '<p class="gf-result-card__price"><span class="product-card__price-label">Concept price</span>RM' + m.product.price + '</p>' +
          '<p>' + m.product.blurb + '</p>' +
          '<a class="btn btn--outline btn--sm" href="#signature">View in Signature Pieces</a>' +
          '</article>'
        );
      }).join('');
    }

    giftFinder.addEventListener('click', function (e) {
      var answerBtn = e.target.closest('[data-gf-answer]');
      if (answerBtn) {
        var key = answerBtn.getAttribute('data-gf-answer');
        state[key] = answerBtn.getAttribute('data-value');
        var currentStep = Number(answerBtn.closest('[data-gf-step]').getAttribute('data-gf-step'));
        goToStep(currentStep + 1);
        return;
      }
      if (e.target.closest('[data-gf-back]')) {
        var step = Number(e.target.closest('[data-gf-step]').getAttribute('data-gf-step'));
        goToStep(Math.max(1, step - 1));
        return;
      }
      if (e.target.closest('[data-gf-restart]')) {
        state = { who: null, occasion: null, budget: null };
        goToStep(1);
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Personalisation live preview
   * ------------------------------------------------------------------ */
  var personalise = document.querySelector('[data-personalise]');

  if (personalise) {
    var engraveInput = personalise.querySelector('[data-engrave-input]');
    var engraveOutputs = personalise.querySelectorAll('[data-engrave-output]');
    var targetBtns = personalise.querySelectorAll('[data-engrave-target]');
    var stages = personalise.querySelectorAll('[data-pz-stage]');
    var buyName = personalise.querySelector('[data-pz-buy-name]');
    var buyPrice = personalise.querySelector('[data-pz-buy-price]');

    function updateEngraving() {
      var value = (engraveInput.value || 'AJK').toUpperCase().slice(0, 4);
      engraveOutputs.forEach(function (el) { el.textContent = value; });
    }

    if (engraveInput) {
      engraveInput.addEventListener('input', updateEngraving);
    }

    targetBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-engrave-target');
        targetBtns.forEach(function (b) { b.classList.toggle('is-active', b === btn); });
        stages.forEach(function (stage) {
          stage.hidden = stage.getAttribute('data-pz-stage') !== target;
        });
        if (buyName) buyName.textContent = btn.getAttribute('data-pz-name');
        if (buyPrice) buyPrice.textContent = btn.getAttribute('data-pz-price');
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Product storytelling tabs
   * ------------------------------------------------------------------ */
  var storytelling = document.querySelector('[data-storytelling]');

  if (storytelling) {
    var tabs = storytelling.querySelectorAll('[data-st-tab]');
    var panels = storytelling.querySelectorAll('[data-st-panel]');

    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activateTab(tab); });
      tab.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var next = e.key === 'ArrowRight' ? (i + 1) % tabs.length : (i - 1 + tabs.length) % tabs.length;
        tabs[next].focus();
        activateTab(tabs[next]);
      });
    });

    function activateTab(tab) {
      var name = tab.getAttribute('data-st-tab');
      tabs.forEach(function (t) {
        var active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
      });
      panels.forEach(function (p) {
        var active = p.getAttribute('data-st-panel') === name;
        p.classList.toggle('is-active', active);
        p.hidden = !active;
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * What's in the Bag — editorial annotation
   * The marker/line highlight itself is pure CSS (:has()), so no JS is
   * required for the core interaction; this only prevents the row's
   * highlight from sticking after a touch/click on touchscreens that
   * don't naturally clear :hover.
   * ------------------------------------------------------------------ */
  var bagAnnotate = document.querySelector('.bag-annotate__layout');

  if (bagAnnotate) {
    bagAnnotate.querySelectorAll('.bag-annotate__row').forEach(function (row) {
      row.addEventListener('click', function () {
        row.blur();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Product card colour swatches — genuinely change the selected
   * colour state (and its visible label), not decorative-only dots.
   * ------------------------------------------------------------------ */
  document.querySelectorAll('.product-card').forEach(function (card) {
    var swatches = card.querySelectorAll('.swatch');
    var label = card.querySelector('[data-swatch-label]');
    swatches.forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        swatches.forEach(function (s) {
          s.classList.toggle('is-active', s === swatch);
          s.setAttribute('aria-pressed', String(s === swatch));
        });
        if (label) label.textContent = 'Colour: ' + swatch.getAttribute('data-swatch-color');
      });
    });
  });
})();
