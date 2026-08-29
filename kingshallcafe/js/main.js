(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Footer year
   */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /**
   * Contents — corner tab visibility.
   * Tab appears once the cover section has scrolled out of view, using
   * an IntersectionObserver on the cover itself rather than a fixed
   * scrollY pixel threshold.
   */
  var contentsTab = document.querySelector('[data-contents-open]');
  var cover = document.getElementById('cover');

  if (contentsTab && cover && 'IntersectionObserver' in window) {
    var coverObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          contentsTab.classList.toggle('is-visible', !entry.isIntersecting);
        });
      },
      { rootMargin: '-10% 0px 0px 0px' }
    );
    coverObserver.observe(cover);
  } else if (contentsTab) {
    contentsTab.classList.add('is-visible');
  }

  /**
   * Contents — full editorial index overlay
   */
  var overlay = document.querySelector('[data-contents-overlay]');
  var closeBtn = document.querySelector('[data-contents-close]');
  var contentsLinks = document.querySelectorAll('[data-contents-link]');
  var lastFocused = null;

  function openContents() {
    if (!overlay) return;
    lastFocused = document.activeElement;
    overlay.classList.add('is-open');
    document.body.classList.add('contents-open');
    contentsTab.setAttribute('aria-expanded', 'true');
    if (closeBtn) closeBtn.focus();
    document.addEventListener('keydown', onContentsKeydown);
  }

  function closeContents() {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.classList.remove('contents-open');
    contentsTab.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', onContentsKeydown);
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function onContentsKeydown(event) {
    if (event.key === 'Escape') {
      closeContents();
      return;
    }
    if (event.key === 'Tab' && overlay) {
      var focusable = overlay.querySelectorAll('a[href], button:not([disabled])');
      if (!focusable.length) return;
      var first = focusable[0];
      var last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  if (contentsTab) {
    contentsTab.setAttribute('aria-expanded', 'false');
    contentsTab.addEventListener('click', openContents);
  }
  if (closeBtn) closeBtn.addEventListener('click', closeContents);
  contentsLinks.forEach(function (link) {
    link.addEventListener('click', closeContents);
  });

  /**
   * Unmask — editorial reveal system.
   * clip-path wipe on [data-unmask], line-mask on [data-unmask-line].
   * Replaces opacity/translateY fade-up with a photographic-focus feel.
   */
  var unmaskTargets = document.querySelectorAll('[data-unmask], [data-unmask-line]');

  if (unmaskTargets.length && 'IntersectionObserver' in window) {
    // Stagger items that share a group (Today's Table rows, Space items)
    document.querySelectorAll('[data-unmask-group]').forEach(function (group) {
      var items = group.querySelectorAll('[data-unmask]');
      items.forEach(function (item, index) {
        item.style.transitionDelay = (index * 0.07) + 's';
      });
    });

    var unmaskObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-unmasked');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    unmaskTargets.forEach(function (target) {
      unmaskObserver.observe(target);
    });

    // Safety net: force-reveal anything the observer somehow missed
    // (e.g. a zero-height ancestor at observe time) so nothing stays
    // hidden indefinitely.
    window.setTimeout(function () {
      unmaskTargets.forEach(function (target) {
        target.classList.add('is-unmasked');
      });
    }, 4000);
  } else {
    unmaskTargets.forEach(function (target) {
      target.classList.add('is-unmasked');
    });
  }

  /* Crop Line drift is CSS-driven (see style.css) and already honours
     prefers-reduced-motion; no JS timing logic needed here. */
  void prefersReducedMotion;
})();
