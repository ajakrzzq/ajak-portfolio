/* ==========================================================================
   NOVAÉ — shop.js
   Page-specific logic for shop.html only: reads ?category=, ?q=, ?sort=
   and ?product= from the URL and applies them to the product grid that's
   already rendered in the page. Kept separate from main.js (which stays
   generic and shared across every page) so this page's filtering logic
   never affects the rest of the site.
   ========================================================================== */
(function () {
  'use strict';

  var grid = document.querySelector('[data-shop-grid]');
  if (!grid) return;

  var params = new URLSearchParams(window.location.search);
  var category = (params.get('category') || '').toLowerCase();
  var query = (params.get('q') || '').trim().toLowerCase();
  var sort = (params.get('sort') || '').toLowerCase();
  var productId = params.get('product');

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.product-card'));
  var titleEl = document.querySelector('[data-shop-title]');
  var descriptionEl = document.querySelector('[data-shop-description]');
  var emptyEl = document.querySelector('[data-shop-empty]');
  var filterLinks = document.querySelectorAll('[data-shop-filter]');

  var CATEGORY_COPY = {
    women: { title: 'Women', description: 'Tailored, easy, and built to layer — the women’s edit.' },
    men: { title: 'Men', description: 'Relaxed staples and considered outerwear for everyday wear.' },
    accessories: { title: 'Accessories', description: 'The finishing details — bags and leather goods.' }
  };

  /* Filtering: category and search narrow the grid; sort just reorders. */
  var visibleCount = 0;
  cards.forEach(function (card) {
    var department = (card.getAttribute('data-department') || '').toLowerCase();
    var matchesCategory =
      !category || department === category || (department === 'unisex' && (category === 'women' || category === 'men'));
    var matchesQuery = !query || card.getAttribute('data-name').toLowerCase().indexOf(query) !== -1;
    var visible = matchesCategory && matchesQuery;
    card.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  if (sort === 'best-sellers' || sort === 'new') {
    var flag = sort === 'best-sellers' ? 'data-bestseller' : 'data-new';
    cards
      .slice()
      .sort(function (a, b) {
        var aFlag = a.getAttribute(flag) === 'true' ? 0 : 1;
        var bFlag = b.getAttribute(flag) === 'true' ? 0 : 1;
        return aFlag - bFlag;
      })
      .forEach(function (card) {
        grid.appendChild(card);
      });
  }

  if (emptyEl) emptyEl.hidden = visibleCount !== 0;
  grid.hidden = visibleCount === 0 && !!(category || query);

  /* Page heading + active filter pill */
  if (category && CATEGORY_COPY[category]) {
    if (titleEl) titleEl.textContent = CATEGORY_COPY[category].title;
    if (descriptionEl) descriptionEl.textContent = CATEGORY_COPY[category].description;
  } else if (query) {
    if (titleEl) titleEl.textContent = 'Search results for “' + params.get('q') + '”';
    if (descriptionEl) descriptionEl.textContent = visibleCount + ' product' + (visibleCount === 1 ? '' : 's') + ' found.';
  } else if (sort === 'best-sellers') {
    if (titleEl) titleEl.textContent = 'Best Sellers';
    if (descriptionEl) descriptionEl.textContent = 'The pieces our community keeps coming back for.';
  } else if (sort === 'new') {
    if (titleEl) titleEl.textContent = 'New Arrivals';
    if (descriptionEl) descriptionEl.textContent = 'Fresh silhouettes and considered fabrics, arriving weekly.';
  }

  filterLinks.forEach(function (link) {
    var isActive = link.getAttribute('data-shop-filter') === (category || 'all');
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'page');
  });

  /* Deep link: ?product=slug auto-opens that item's Quick View */
  if (productId) {
    var targetCard = grid.querySelector('[data-product-id="' + CSS.escape(productId) + '"]');
    if (targetCard) {
      targetCard.hidden = false;
      var quickviewBtn = targetCard.querySelector('[data-quickview-open]');
      if (quickviewBtn) {
        window.setTimeout(function () {
          quickviewBtn.click();
        }, 250);
      }
    }
  }
})();
