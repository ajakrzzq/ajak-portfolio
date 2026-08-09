/* ==========================================================================
   NOVAÉ — main.js
   Homepage interactivity: header state, mobile menu, search panel,
   quick view modal, wishlist, cart drawer (localStorage), newsletter,
   and scroll-reveal animation.

   No external dependencies. Everything degrades gracefully if an element
   is missing from the page (defensive null checks throughout), so this
   file can be safely reused as-is on future pages (shop/product/cart).
   ========================================================================== */
(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------ *
   * Small dialog helper: shared focus-trap + escape-to-close behaviour
   * used by the mobile menu, quick view modal and cart drawer.
   * ------------------------------------------------------------------ */
  function createDialog(panelEl, opts) {
    opts = opts || {};
    var lastFocused = null;

    function getFocusable() {
      return Array.prototype.slice.call(
        panelEl.querySelectorAll(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );
    }

    function handleKeydown(e) {
      if (e.key === 'Escape') {
        close();
        return;
      }
      if (e.key === 'Tab') {
        var focusable = getFocusable();
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    function open(triggerEl) {
      lastFocused = triggerEl || document.activeElement;
      document.documentElement.classList.add('no-scroll');
      document.body.style.overflow = 'hidden';
      panelEl.classList.add('is-open');
      if (opts.backdrop) opts.backdrop.classList.add('is-open');
      document.addEventListener('keydown', handleKeydown);
      window.setTimeout(function () {
        var focusable = getFocusable();
        (opts.initialFocus || focusable[0] || panelEl).focus();
      }, prefersReducedMotion ? 0 : 60);
      if (typeof opts.onOpen === 'function') opts.onOpen();
    }

    function close() {
      panelEl.classList.remove('is-open');
      if (opts.backdrop) opts.backdrop.classList.remove('is-open');
      document.documentElement.classList.remove('no-scroll');
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleKeydown);
      if (lastFocused && typeof lastFocused.focus === 'function') {
        lastFocused.focus();
      }
      if (typeof opts.onClose === 'function') opts.onClose();
    }

    function isOpen() {
      return panelEl.classList.contains('is-open');
    }

    return { open: open, close: close, isOpen: isOpen };
  }

  /* ------------------------------------------------------------------ *
   * Header: shrink/elevate on scroll
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
  var menuClose = document.querySelector('[data-menu-close]');

  if (menuToggle && mobileMenu) {
    var mobileDialog = createDialog(mobileMenu, {
      onOpen: function () {
        menuToggle.setAttribute('aria-expanded', 'true');
      },
      onClose: function () {
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });

    menuToggle.addEventListener('click', function () {
      if (mobileDialog.isOpen()) {
        mobileDialog.close();
      } else {
        mobileDialog.open(menuToggle);
      }
    });

    if (menuClose) {
      menuClose.addEventListener('click', function () {
        mobileDialog.close();
      });
    }

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileDialog.close();
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Search panel (desktop)
   * ------------------------------------------------------------------ */
  var searchToggle = document.querySelector('[data-search-toggle]');
  var searchPanel = document.querySelector('[data-search-panel]');

  if (searchToggle && searchPanel) {
    var searchInput = searchPanel.querySelector('input[type="search"]');
    var searchDialog = createDialog(searchPanel, {
      initialFocus: searchInput,
      onOpen: function () {
        searchToggle.setAttribute('aria-expanded', 'true');
      },
      onClose: function () {
        searchToggle.setAttribute('aria-expanded', 'false');
      }
    });

    searchToggle.addEventListener('click', function () {
      if (searchDialog.isOpen()) {
        searchDialog.close();
      } else {
        searchDialog.open(searchToggle);
      }
    });

  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="search"]');
      var q = ((input && input.value) || '').trim();
      window.location.href = 'shop.html' + (q ? '?q=' + encodeURIComponent(q) : '');
    });
  });

  /* ------------------------------------------------------------------ *
   * Wishlist (persisted per product id in localStorage)
   * ------------------------------------------------------------------ */
  var WISHLIST_KEY = 'novae:wishlist';

  function readWishlist() {
    try {
      var raw = window.localStorage.getItem(WISHLIST_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function writeWishlist(list) {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    } catch (err) {
      /* localStorage unavailable (e.g. private mode) — fail silently, UI still works for the session */
    }
  }

  function initWishlistButtons() {
    var wishlist = readWishlist();
    document.querySelectorAll('[data-wishlist-toggle]').forEach(function (btn) {
      var card = btn.closest('[data-product-id]');
      var id = card ? card.getAttribute('data-product-id') : btn.getAttribute('data-wishlist-toggle');
      var active = wishlist.indexOf(id) !== -1;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));

      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var list = readWishlist();
        var idx = list.indexOf(id);
        var nowActive;
        if (idx === -1) {
          list.push(id);
          nowActive = true;
        } else {
          list.splice(idx, 1);
          nowActive = false;
        }
        writeWishlist(list);
        btn.classList.toggle('is-active', nowActive);
        btn.setAttribute('aria-pressed', String(nowActive));
      });
    });
  }

  /* ------------------------------------------------------------------ *
   * Cart (localStorage-backed, drawer UI)
   * ------------------------------------------------------------------ */
  var CART_KEY = 'novae:cart';
  var cartDrawer = document.querySelector('[data-cart-drawer]');
  var cartBackdrop = document.querySelector('[data-cart-backdrop]');
  var cartCountEls = document.querySelectorAll('[data-cart-count]');
  var cartBody = document.querySelector('[data-cart-body]');
  var cartSubtotalEl = document.querySelector('[data-cart-subtotal]');

  function readCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function writeCart(items) {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(items));
    } catch (err) {
      /* ignore */
    }
  }

  function formatPrice(n) {
    return '$' + Number(n).toFixed(2);
  }

  function renderCart() {
    var items = readCart();
    var count = items.reduce(function (sum, item) { return sum + item.qty; }, 0);

    cartCountEls.forEach(function (el) {
      el.textContent = String(count);
      el.hidden = count === 0;
    });

    if (!cartBody) return;

    if (!items.length) {
      cartBody.innerHTML =
        '<div class="cart-drawer__empty">' +
        '<p>Your bag is empty.</p>' +
        '<a class="btn btn--outline btn--sm" data-cart-close-link href="shop.html">Continue Shopping</a>' +
        '</div>';
      var closeLink = cartBody.querySelector('[data-cart-close-link]');
      if (closeLink && cartDialogRef) {
        closeLink.addEventListener('click', function () {
          cartDialogRef.close();
        });
      }
      if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(0);
      return;
    }

    var subtotal = items.reduce(function (sum, item) { return sum + item.price * item.qty; }, 0);
    if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);

    cartBody.innerHTML =
      '<ul class="cart-drawer__items">' +
      items
        .map(function (item, index) {
          return (
            '<li class="cart-item">' +
            '<div class="cart-item__media"><img src="' +
            item.image +
            '" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'images/placeholder.svg\';this.classList.add(\'img-fallback\')"></div>' +
            '<div class="cart-item__info">' +
            '<p class="cart-item__name">' + item.name + '</p>' +
            '<p class="cart-item__meta">' + item.color + ' &middot; ' + item.size + ' &middot; Qty ' + item.qty + '</p>' +
            '<div class="cart-item__row">' +
            '<span class="cart-item__price">' + formatPrice(item.price * item.qty) + '</span>' +
            '<button type="button" class="cart-item__remove" data-cart-remove="' + index + '">Remove</button>' +
            '</div>' +
            '</div>' +
            '</li>'
          );
        })
        .join('') +
      '</ul>';

    cartBody.querySelectorAll('[data-cart-remove]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var idx = Number(btn.getAttribute('data-cart-remove'));
        var current = readCart();
        current.splice(idx, 1);
        writeCart(current);
        renderCart();
      });
    });
  }

  var cartDialogRef = null;
  var cartToggles = document.querySelectorAll('[data-cart-toggle]');
  var cartClose = document.querySelector('[data-cart-close]');

  if (cartDrawer) {
    cartDialogRef = createDialog(cartDrawer, { backdrop: cartBackdrop });

    cartToggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        renderCart();
        cartDialogRef.open(btn);
      });
    });

    if (cartClose) {
      cartClose.addEventListener('click', function () {
        cartDialogRef.close();
      });
    }

    if (cartBackdrop) {
      cartBackdrop.addEventListener('click', function () {
        if (cartDialogRef.isOpen()) cartDialogRef.close();
        if (quickviewDialogRef && quickviewDialogRef.isOpen()) quickviewDialogRef.close();
      });
    }
  }

  function addToCart(item) {
    var items = readCart();
    var existing = items.find(function (i) {
      return i.id === item.id && i.color === item.color && i.size === item.size;
    });
    if (existing) {
      existing.qty += item.qty;
    } else {
      items.push(item);
    }
    writeCart(items);
    renderCart();
  }

  /* ------------------------------------------------------------------ *
   * Quick View modal
   * ------------------------------------------------------------------ */
  var quickview = document.querySelector('[data-quickview]');
  var quickviewBackdrop = document.querySelector('[data-quickview-backdrop]');
  var quickviewDialogRef = null;
  var qvState = { colors: [], sizes: [], qty: 1, color: null, size: null };

  if (quickview) {
    quickviewDialogRef = createDialog(quickview, { backdrop: quickviewBackdrop });

    var qvClose = quickview.querySelector('[data-quickview-close]');
    if (qvClose) {
      qvClose.addEventListener('click', function () {
        quickviewDialogRef.close();
      });
    }
    if (quickviewBackdrop) {
      quickviewBackdrop.addEventListener('click', function () {
        quickviewDialogRef.close();
      });
    }

    var qvImage = quickview.querySelector('[data-qv-image]');
    var qvCategory = quickview.querySelector('[data-qv-category]');
    var qvName = quickview.querySelector('[data-qv-name]');
    var qvPrice = quickview.querySelector('[data-qv-price]');
    var qvSwatches = quickview.querySelector('[data-qv-swatches]');
    var qvSelectedColor = quickview.querySelector('[data-qv-selected-color]');
    var qvSizes = quickview.querySelector('[data-qv-sizes]');
    var qvQtyOutput = quickview.querySelector('[data-qv-qty]');
    var qvAddForm = quickview.querySelector('[data-qv-form]');
    var qvNote = quickview.querySelector('[data-qv-note]');

    function openQuickview(card) {
      var data = {
        id: card.getAttribute('data-product-id'),
        name: card.getAttribute('data-name'),
        category: card.getAttribute('data-category'),
        price: parseFloat(card.getAttribute('data-price')),
        image: card.getAttribute('data-image'),
        colors: JSON.parse(card.getAttribute('data-colors') || '[]'),
        sizes: (card.getAttribute('data-sizes') || '').split(',').filter(Boolean)
      };

      qvState = { colors: data.colors, sizes: data.sizes, qty: 1, color: data.colors[0] || null, size: null };

      quickview.setAttribute('data-current-id', data.id);
      quickview.setAttribute('data-current-name', data.name);
      quickview.setAttribute('data-current-price', String(data.price));
      quickview.setAttribute('data-current-image', data.image);

      if (qvImage) {
        qvImage.src = data.image;
        qvImage.alt = data.name;
      }
      if (qvCategory) qvCategory.textContent = data.category || '';
      if (qvName) qvName.textContent = data.name || '';
      if (qvPrice) qvPrice.textContent = formatPrice(data.price || 0);
      if (qvQtyOutput) qvQtyOutput.textContent = '1';
      if (qvNote) qvNote.textContent = '';

      if (qvSwatches) {
        qvSwatches.innerHTML = data.colors
          .map(function (c, i) {
            return (
              '<button type="button" class="swatch-btn' +
              (i === 0 ? ' is-selected' : '') +
              '" style="background:' +
              c.hex +
              '" data-color-name="' +
              c.name +
              '" aria-pressed="' +
              (i === 0 ? 'true' : 'false') +
              '"><span class="visually-hidden">' +
              c.name +
              '</span></button>'
            );
          })
          .join('');
      }
      if (qvSelectedColor) qvSelectedColor.textContent = data.colors[0] ? data.colors[0].name : '';

      if (qvSizes) {
        qvSizes.innerHTML = data.sizes
          .map(function (s) {
            return '<button type="button" class="size-btn" data-size="' + s + '">' + s + '</button>';
          })
          .join('');
      }
    }

    document.querySelectorAll('[data-quickview-open]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var card = btn.closest('[data-product-id]');
        if (!card) return;
        openQuickview(card);
        quickviewDialogRef.open(btn);
      });
    });

    if (qvSwatches) {
      qvSwatches.addEventListener('click', function (e) {
        var target = e.target.closest('.swatch-btn');
        if (!target) return;
        qvSwatches.querySelectorAll('.swatch-btn').forEach(function (b) {
          b.classList.remove('is-selected');
          b.setAttribute('aria-pressed', 'false');
        });
        target.classList.add('is-selected');
        target.setAttribute('aria-pressed', 'true');
        if (qvSelectedColor) qvSelectedColor.textContent = target.getAttribute('data-color-name') || '';
      });
    }

    if (qvSizes) {
      qvSizes.addEventListener('click', function (e) {
        var target = e.target.closest('.size-btn');
        if (!target) return;
        qvSizes.querySelectorAll('.size-btn').forEach(function (b) {
          b.classList.remove('is-selected');
        });
        target.classList.add('is-selected');
        if (qvNote) qvNote.textContent = '';
      });
    }

    quickview.querySelectorAll('[data-qty-step]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dir = btn.getAttribute('data-qty-step') === 'up' ? 1 : -1;
        var current = qvQtyOutput ? parseInt(qvQtyOutput.textContent, 10) || 1 : 1;
        var next = Math.min(10, Math.max(1, current + dir));
        if (qvQtyOutput) qvQtyOutput.textContent = String(next);
      });
    });

    if (qvAddForm) {
      qvAddForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var sizeBtn = qvSizes ? qvSizes.querySelector('.size-btn.is-selected') : null;
        if (!sizeBtn) {
          if (qvNote) qvNote.textContent = 'Please select a size.';
          return;
        }
        var colorBtn = qvSwatches ? qvSwatches.querySelector('.swatch-btn.is-selected') : null;

        addToCart({
          id: quickview.getAttribute('data-current-id'),
          name: quickview.getAttribute('data-current-name'),
          price: parseFloat(quickview.getAttribute('data-current-price')),
          image: quickview.getAttribute('data-current-image'),
          color: colorBtn ? colorBtn.getAttribute('data-color-name') : '',
          size: sizeBtn.getAttribute('data-size'),
          qty: qvQtyOutput ? parseInt(qvQtyOutput.textContent, 10) || 1 : 1
        });

        if (qvNote) qvNote.textContent = 'Added to your bag.';
        window.setTimeout(function () {
          quickviewDialogRef.close();
          if (cartDialogRef) cartDialogRef.open();
          renderCart();
        }, 500);
      });
    }
  }

  /* ------------------------------------------------------------------ *
   * Newsletter form (no backend — front-end only confirmation state)
   * ------------------------------------------------------------------ */
  var newsletterForm = document.querySelector('[data-newsletter-form]');
  if (newsletterForm) {
    var newsletterStatus = newsletterForm.querySelector('[data-newsletter-status]');
    newsletterForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = newsletterForm.querySelector('input[type="email"]');
      var value = input ? input.value.trim() : '';
      var isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      if (!isValid) {
        if (newsletterStatus) newsletterStatus.textContent = 'Please enter a valid email address.';
        return;
      }

      if (newsletterStatus) newsletterStatus.textContent = 'Thank you — you’re on the list.';
      newsletterForm.reset();
    });
  }

  /* ------------------------------------------------------------------ *
   * Scroll reveal
   * ------------------------------------------------------------------ */
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    var revealTargets = document.querySelectorAll('[data-reveal], [data-reveal-group]');
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealTargets.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    document.querySelectorAll('[data-reveal], [data-reveal-group]').forEach(function (el) {
      el.classList.add('is-visible');
    });
  }

  /* ------------------------------------------------------------------ *
   * Footer year
   * ------------------------------------------------------------------ */
  var yearEl = document.querySelector('[data-year]');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------------------------ *
   * Init
   * ------------------------------------------------------------------ */
  initWishlistButtons();
  renderCart();
})();
