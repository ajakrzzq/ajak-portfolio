(function () {
  'use strict';

  /**
   * Footer year
   */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /**
   * Develop — signature motion. Photography resolves from monochrome to
   * full tone as it enters view. Text is never animated.
   */
  var developTargets = document.querySelectorAll('[data-develop]');

  if (developTargets.length && 'IntersectionObserver' in window) {
    var developObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-developed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );
    developTargets.forEach(function (target) { developObserver.observe(target); });

    // Safety net: nothing should stay permanently mid-transition.
    window.setTimeout(function () {
      developTargets.forEach(function (target) { target.classList.add('is-developed'); });
    }, 4000);
  } else {
    developTargets.forEach(function (target) { target.classList.add('is-developed'); });
  }

  /**
   * The Edge — active chapter tracking. A scroll-spy, not a hamburger menu.
   */
  var chapters = ['person', 'process', 'transformation', 'expertise', 'trust', 'visit']
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var ticks = document.querySelectorAll('.edge__tick');

  function setActive(id) {
    ticks.forEach(function (tick) {
      tick.classList.toggle('is-active', tick.getAttribute('data-tick') === id);
    });
  }

  if (chapters.length && ticks.length && 'IntersectionObserver' in window) {
    var chapterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    chapters.forEach(function (chapter) { chapterObserver.observe(chapter); });
  }
})();
