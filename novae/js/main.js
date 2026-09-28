/* NOVAÉ — presentation demo. Original header, reveal treatment and storefront
   structure retained. No dependencies, backend, payments or email collection. */
(function () {
  'use strict';
  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var $$ = function (selector, root) { return Array.from((root || document).querySelectorAll(selector)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var announce = function (message) { $('[data-announcement]').textContent = message; };
  var escapeHtml = function (value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  };
  var price = function (value) { return '$' + Number(value).toFixed(2); };
  var cards = $$('#new-arrivals [data-product-id]');
  var catalog = new Map(cards.map(function (card) {
    return [card.dataset.productId, {
      id: card.dataset.productId, name: card.dataset.name, price: Number(card.dataset.price),
      category: card.dataset.category, image: card.dataset.image,
      colors: JSON.parse(card.dataset.colors), sizes: card.dataset.sizes.split(','),
      description: card.dataset.description, details: card.dataset.details
    }];
  }));

  // Isolate each modal from the rest of the page, including the header.
  var activeDialog = null;
  function createDialog(panel, options) {
    options = options || {};
    var trigger = null, blocked = [], opened = false, priorOverflow = '';
    panel.inert = true;
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('tabindex', '-1');
    function focusable() {
      return $$('a[href], button:not([disabled]), input:not([disabled]), select, summary, [tabindex="0"]', panel)
        .filter(function (el) { return el.getClientRects().length && !el.closest('[inert]'); });
    }
    function keydown(event) {
      if (event.key === 'Escape') { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      var items = focusable(), first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); panel.focus(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
    function open(from) {
      if (opened) return;
      var restore = from || document.activeElement;
      if (activeDialog) activeDialog.close(false);
      trigger = restore; opened = true; activeDialog = api;
      panel.inert = false;
      panel.removeAttribute('aria-hidden');
      panel.classList.add('is-open');
      if (options.backdrop) options.backdrop.classList.add('is-open');
      var branch = panel;
      while (branch.parentElement) {
        Array.from(branch.parentElement.children).forEach(function (sibling) {
          if (sibling !== branch && sibling !== options.backdrop && !sibling.inert && !['SCRIPT','STYLE'].includes(sibling.tagName)) {
            sibling.inert = true; blocked.push(sibling);
          }
        });
        if (branch.parentElement === document.body) break;
        branch = branch.parentElement;
      }
      priorOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      document.documentElement.classList.add('no-scroll');
      document.addEventListener('keydown', keydown);
      if (options.onOpen) options.onOpen();
      requestAnimationFrame(function () { if (opened) (options.initialFocus || focusable()[0] || panel).focus(); });
    }
    function close(restoreFocus) {
      if (!opened) return;
      opened = false;
      panel.classList.remove('is-open');
      if (options.backdrop) options.backdrop.classList.remove('is-open');
      blocked.forEach(function (el) { el.inert = false; }); blocked = [];
      document.body.style.overflow = priorOverflow;
      document.documentElement.classList.remove('no-scroll');
      document.removeEventListener('keydown', keydown);
      activeDialog = null;
      if (options.onClose) options.onClose();
      if (restoreFocus !== false && trigger && trigger.isConnected && !trigger.closest('[inert]')) trigger.focus({ preventScroll: true });
      panel.inert = true;
      panel.setAttribute('aria-hidden', 'true');
    }
    var api = { open: open, close: close, isOpen: function () { return opened; }, trigger: function () { return trigger; } };
    if (options.backdrop) options.backdrop.addEventListener('click', function () { close(); });
    return api;
  }

  var header = $('[data-site-header]');
  function updateHeader() { header.classList.toggle('is-scrolled', window.scrollY > 12); }
  updateHeader(); window.addEventListener('scroll', updateHeader, { passive: true });
  var menuButton = $('[data-menu-toggle]');
  var menu = createDialog($('[data-mobile-menu]'), {
    onOpen: function () { menuButton.setAttribute('aria-expanded', 'true'); },
    onClose: function () { menuButton.setAttribute('aria-expanded', 'false'); }
  });
  menuButton.addEventListener('click', function () { menu.isOpen() ? menu.close() : menu.open(menuButton); });
  $('[data-menu-close]').addEventListener('click', function () { menu.close(); });
  $$('#mobile-menu a').forEach(function (link) { link.addEventListener('click', function () { menu.close(); }); });
  window.matchMedia('(min-width: 900px)').addEventListener('change', function (event) { if (event.matches) menu.close(); });
  var searchButton = $('[data-search-toggle]');
  var search = createDialog($('[data-search-panel]'), {
    initialFocus: $('#nav-search-input'),
    onOpen: function () { searchButton.setAttribute('aria-expanded', 'true'); },
    onClose: function () { searchButton.setAttribute('aria-expanded', 'false'); }
  });
  searchButton.addEventListener('click', function () { search.isOpen() ? search.close() : search.open(searchButton); });
  $('[data-search-close]').addEventListener('click', function () { search.close(); });

  // Keep the demo usable when storage is disabled or contains older/corrupt data.
  function read(key) { try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (_) { return []; } }
  function save(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* In-memory state remains usable. */ } }
  function canonical(id) { return typeof id === 'string' ? id.replace(/-bs$/, '') : ''; }
  function validWishlist(raw) {
    return Array.isArray(raw) ? Array.from(new Set(raw.map(canonical).filter(function (id) { return catalog.has(id); }))) : [];
  }
  function validCart(raw) {
    if (!Array.isArray(raw)) return [];
    var result = [];
    raw.forEach(function (entry) {
      if (!entry || typeof entry !== 'object') return;
      var id = canonical(entry.id), product = catalog.get(id);
      if (!product || !product.sizes.includes(entry.size) || !product.colors.some(function (c) { return c.name === entry.color; })) return;
      var quantity = Number(entry.qty);
      if (!Number.isFinite(quantity) || quantity < 1) return;
      var existing = result.find(function (item) { return item.id === id && item.color === entry.color && item.size === entry.size; });
      if (existing) existing.qty = Math.min(10, existing.qty + Math.floor(quantity));
      else result.push({ id: id, color: entry.color, size: entry.size, qty: Math.min(10, Math.floor(quantity)) });
    });
    return result;
  }
  var wishlist = validWishlist(read('novae:wishlist'));
  var cart = validCart(read('novae:cart'));
  function syncWishlist() {
    $$('[data-wishlist-toggle]').forEach(function (button) {
      var id = button.closest('[data-product-id]').dataset.productId, selected = wishlist.includes(id);
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.setAttribute('aria-label', (selected ? 'Remove ' : 'Save ') + catalog.get(id).name + (selected ? ' from saved items' : ' to saved items'));
    });
  }
  $$('[data-wishlist-toggle]').forEach(function (button) {
    button.addEventListener('click', function () {
      var id = button.closest('[data-product-id]').dataset.productId;
      wishlist = wishlist.includes(id) ? wishlist.filter(function (value) { return value !== id; }) : wishlist.concat(id);
      save('novae:wishlist', wishlist); syncWishlist();
      announce(catalog.get(id).name + (wishlist.includes(id) ? ' saved.' : ' removed from saved items.'));
      if (filter === 'saved') renderCollection();
    });
  });

  // Complete collection browsing in the original New Arrivals section.
  var filter = 'all', query = '', sort = 'featured';
  var grid = $('[data-collection-grid]');
  function renderCollection() {
    var sorted = cards.slice();
    if (sort !== 'featured') sorted.sort(function (a, b) { return (Number(a.dataset.price) - Number(b.dataset.price)) * (sort === 'low' ? 1 : -1); });
    var shown = 0;
    sorted.forEach(function (card) {
      var product = catalog.get(card.dataset.productId);
      var categoryMatch = filter === 'all' ||
        (filter === 'saved' ? wishlist.includes(product.id) :
        filter === 'layers' ? ['Outerwear', 'Knitwear'].includes(product.category) :
        filter === 'bestsellers' ? ['tailored-wool-coat','ribbed-knit-sweater','wide-leg-trousers','essential-crewneck-tee'].includes(product.id) :
        card.dataset.audience.split(' ').includes(filter));
      var textMatch = (product.name + ' ' + product.category + ' ' + product.colors.map(function (c) { return c.name; }).join(' ')).toLowerCase().includes(query.toLowerCase());
      card.hidden = !(categoryMatch && textMatch);
      if (!card.hidden) shown++;
      grid.appendChild(card);
    });
    var labels = { all: 'All pieces', women: 'Women', men: 'Men', accessories: 'Accessories', saved: 'Saved', layers: 'Layering edit', bestsellers: 'Best sellers' };
    $('[data-results]').textContent = shown + (shown === 1 ? ' piece' : ' pieces') + ' · ' + (query ? 'Results for “' + query + '”' : labels[filter]) + ' · USD';
    $('[data-empty]').hidden = shown > 0;
    $('[data-empty-message]').textContent = filter === 'saved' ? 'Tap the heart on a piece to keep it here.' : 'Try another search or explore all pieces.';
    $('[data-reset]').hidden = filter === 'all' && !query && sort === 'featured';
    $$('.collection-filters [data-shop-filter]').forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.shopFilter === filter)); });
    grid.classList.add('is-visible');
  }
  function goToCollection() {
    var heading = $('#new-arrivals-heading');
    heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
    $('#new-arrivals').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'start' });
  }
  $$('[data-shop-filter]').forEach(function (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault(); if (activeDialog) activeDialog.close(false);
      filter = button.dataset.shopFilter; query = '';
      if (filter === 'all') { sort = 'featured'; $('[data-sort]').value = sort; }
      $$('[data-search-form] input').forEach(function (input) { input.value = ''; });
      renderCollection(); if (!button.closest('[data-collection-tools]')) goToCollection();
    });
  });
  $('[data-reset]').addEventListener('click', function () {
    filter = 'all'; query = ''; sort = 'featured'; $('[data-sort]').value = sort;
    $$('[data-search-form] input').forEach(function (input) { input.value = ''; });
    renderCollection(); $('.collection-filters button').focus();
  });
  $('[data-sort]').addEventListener('change', function (event) { sort = event.target.value; renderCollection(); });
  $$('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault(); query = $('input', form).value.trim().slice(0, 120); filter = 'all';
      if (activeDialog) activeDialog.close(false); renderCollection(); goToCollection();
    });
  });

  var bag = createDialog($('[data-cart-drawer]'), { backdrop: $('[data-cart-backdrop]') });
  var bagButton = $('[data-cart-toggle]');
  bagButton.addEventListener('click', function () { renderBag(); bag.open(bagButton); });
  $('[data-cart-close]').addEventListener('click', function () { bag.close(); });
  var bagBody = $('[data-cart-body]');
  function subtotal() { return cart.reduce(function (sum, item) { return sum + catalog.get(item.id).price * item.qty; }, 0); }
  function renderBag() {
    var count = cart.reduce(function (sum, item) { return sum + item.qty; }, 0);
    $$('[data-cart-count]').forEach(function (el) { el.textContent = String(count); el.hidden = !count; });
    bagButton.setAttribute('aria-label', 'Open shopping bag, ' + count + (count === 1 ? ' item' : ' items'));
    $('[data-cart-subtotal]').textContent = price(subtotal());
    $('[data-checkout]').disabled = !count;
    if (!count) {
      bagBody.innerHTML = '<div class="cart-drawer__empty"><p>Your bag is waiting.</p><p>Find a piece to make your own.</p><button class="btn btn--outline" type="button" data-continue>Explore the collection</button></div>';
      return;
    }
    bagBody.innerHTML = '<ul class="cart-drawer__items">' + cart.map(function (item, index) {
      var product = catalog.get(item.id);
      return '<li class="cart-item"><div class="cart-item__media"><img src="' + product.image + '" alt="' + escapeHtml(product.name) + '"></div><div class="cart-item__info"><p class="cart-item__name">' + escapeHtml(product.name) + '</p><p class="cart-item__meta">' + escapeHtml(item.color) + ' · ' + escapeHtml(item.size) + '</p><div class="qty-stepper"><button type="button" data-bag-step="-1" data-index="' + index + '" aria-label="Decrease quantity of ' + escapeHtml(product.name) + '"' + (item.qty === 1 ? ' disabled' : '') + '>−</button><output aria-label="Quantity">' + item.qty + '</output><button type="button" data-bag-step="1" data-index="' + index + '" aria-label="Increase quantity of ' + escapeHtml(product.name) + '"' + (item.qty === 10 ? ' disabled' : '') + '>+</button></div><div class="cart-item__row"><span class="cart-item__price">' + price(product.price * item.qty) + '</span><button type="button" class="cart-item__remove" data-remove="' + index + '" aria-label="Remove ' + escapeHtml(product.name) + '">Remove</button></div></div></li>';
    }).join('') + '</ul>';
  }
  bagBody.addEventListener('click', function (event) {
    var button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-continue')) { bag.close(false); goToCollection(); return; }
    if (button.hasAttribute('data-remove')) {
      var removed = cart.splice(Number(button.dataset.remove), 1)[0];
      announce(catalog.get(removed.id).name + ' removed from your bag.');
      save('novae:cart', cart); renderBag(); $('[data-cart-close]').focus(); return;
    }
    if (button.hasAttribute('data-bag-step')) {
      var index = Number(button.dataset.index), direction = Number(button.dataset.bagStep);
      cart[index].qty = Math.max(1, Math.min(10, cart[index].qty + direction));
      save('novae:cart', cart); renderBag();
      var next = $('[data-index="' + index + '"][data-bag-step="' + direction + '"]', bagBody);
      if (next.disabled) next = $('[data-index="' + index + '"][data-bag-step="' + (-direction) + '"]', bagBody);
      next.focus(); announce('Quantity ' + cart[index].qty + '. Bag subtotal ' + price(subtotal()) + ' US dollars.');
    }
  });

  var qvPanel = $('[data-quickview]');
  var quickview = createDialog(qvPanel, { backdrop: $('[data-quickview-backdrop]') });
  var chosen = null, chosenColor = '', chosenSize = '', quantity = 1;
  function updateQuantity() {
    $('[data-qv-qty]').textContent = String(quantity);
    $('[data-qty-step="down"]').disabled = quantity === 1;
    $('[data-qty-step="up"]').disabled = quantity === 10;
  }
  function openProduct(card, trigger) {
    chosen = catalog.get(card.dataset.productId); chosenColor = chosen.colors[0].name;
    chosenSize = chosen.sizes.length === 1 ? chosen.sizes[0] : ''; quantity = 1;
    $('[data-qv-image]').src = chosen.image; $('[data-qv-image]').alt = chosen.name + ' — ' + chosen.colors[0].name;
    $('[data-qv-name]').textContent = chosen.name; $('[data-qv-price]').textContent = price(chosen.price) + ' USD';
    $('[data-qv-category]').textContent = chosen.category; $('[data-qv-description]').textContent = chosen.description;
    $('[data-qv-details]').textContent = chosen.details; $('[data-qv-note]').textContent = '';
    $('[data-qv-selected-color]').textContent = chosenColor;
    $('[data-qv-swatches]').innerHTML = chosen.colors.map(function (color, i) {
      return '<button type="button" class="swatch-btn' + (i === 0 ? ' is-selected' : '') + '" style="--swatch-color:' + color.hex + '" data-color="' + escapeHtml(color.name) + '" aria-label="' + escapeHtml(color.name) + '" aria-pressed="' + (i === 0) + '"></button>';
    }).join('');
    $('[data-qv-sizes]').innerHTML = chosen.sizes.map(function (size) {
      return '<button type="button" class="size-btn' + (size === chosenSize ? ' is-selected' : '') + '" data-size="' + size + '" aria-pressed="' + (size === chosenSize) + '">' + size + '</button>';
    }).join('');
    $$('.quickview details').forEach(function (details) { details.open = false; });
    $('.size-guide').hidden = chosen.sizes.length === 1;
    updateQuantity(); quickview.open(trigger); qvPanel.scrollTop = 0;
  }
  $$('[data-quickview-open]').forEach(function (button) {
    button.addEventListener('click', function () { openProduct(button.closest('[data-product-id]'), button); });
  });
  $('[data-quickview-close]').addEventListener('click', function () { quickview.close(); });
  $('[data-qv-swatches]').addEventListener('click', function (event) {
    var button = event.target.closest('[data-color]'); if (!button) return;
    chosenColor = button.dataset.color; $('[data-qv-selected-color]').textContent = chosenColor;
    $$('[data-color]', qvPanel).forEach(function (el) { var selected = el === button; el.classList.toggle('is-selected', selected); el.setAttribute('aria-pressed', String(selected)); });
  });
  $('[data-qv-sizes]').addEventListener('click', function (event) {
    var button = event.target.closest('[data-size]'); if (!button) return;
    chosenSize = button.dataset.size; $('[data-qv-note]').textContent = '';
    $$('[data-size]', qvPanel).forEach(function (el) { var selected = el === button; el.classList.toggle('is-selected', selected); el.setAttribute('aria-pressed', String(selected)); });
  });
  $$('[data-qty-step]').forEach(function (button) {
    button.addEventListener('click', function () { quantity = Math.min(10, Math.max(1, quantity + (button.dataset.qtyStep === 'up' ? 1 : -1))); updateQuantity(); });
  });
  $('[data-qv-form]').addEventListener('submit', function (event) {
    event.preventDefault();
    if (!chosenSize) { $('[data-qv-note]').textContent = 'Please select a size.'; $('[data-size]', qvPanel).focus(); return; }
    var existing = cart.find(function (item) { return item.id === chosen.id && item.color === chosenColor && item.size === chosenSize; });
    if (existing && existing.qty + quantity > 10) { $('[data-qv-note]').textContent = 'You can add up to 10 of each option. Adjust the quantity in your bag.'; return; }
    if (existing) existing.qty += quantity;
    else cart.push({ id: chosen.id, color: chosenColor, size: chosenSize, qty: quantity });
    save('novae:cart', cart); renderBag();
    var originalTrigger = quickview.trigger(); quickview.close(false); bag.open(originalTrigger);
    announce(chosen.name + ' added to your bag.');
  });

  var information = createDialog($('[data-info-dialog]'), { backdrop: $('[data-info-backdrop]') });
  var infoBody = $('[data-info-body]');
  var info = {
    story: ['Considered from the start', '<p>NOVAÉ is a concept label built around a simple wardrobe: pieces that sit naturally together, from the first layer to the finishing detail.</p><p>Our point of view is quiet colour, thoughtful proportions and everyday ease. Fewer decisions. More ways to wear.</p><p class="demo-note">Brand story created for the ajak.Web portfolio demo.</p>'],
    contact: ['Let’s talk about your website', '<p>NOVAÉ is a fashion store concept by ajak.Web. For a website like this, speak directly with the designer.</p><a class="btn btn--primary" href="https://ajakweb.com/contact.html" target="_blank" rel="noopener">Contact ajak.Web</a><p class="demo-note">NOVAÉ does not take customer orders or support requests.</p>'],
    shipping: ['Delivery, considered', '<p>This demo shows how delivery information can be presented in a real store.</p><dl class="policy-list"><dt>Delivery area</dt><dd>Malaysia nationwide (sample policy)</dd><dt>Processing</dt><dd>1–2 business days (sample estimate)</dd><dt>Delivery cost</dt><dd>Calculated by destination in a live store</dd></dl><p class="demo-note">No stock is shipped and no delivery charges are collected in this demo.</p>'],
    returns: ['Room to change your mind', '<p>Example policy: request a return within 30 days for unworn pieces with original tags. A live store would confirm eligibility and provide return instructions.</p><p class="demo-note">Illustrative policy only. This concept has no real orders or return service.</p>'],
    privacy: ['Your privacy in this demo', '<p>The shopping bag and saved items are stored in this browser only. They are not sent to a store server.</p><p>The newsletter form validates an email address on your device, then discards it. No subscription is created.</p><button class="btn btn--outline" type="button" data-clear-demo>Clear my demo bag &amp; saved items</button>'],
    terms: ['A portfolio concept', '<p>NOVAÉ is a fictional storefront designed for presentation by ajak.Web. Product images, prices, descriptions, materials and policies are illustrative. Prices are shown in US dollars to preserve the original concept.</p><p>No items are offered for sale. No payment, account registration or order fulfilment is available.</p>'],
    social: ['The NOVAÉ community', '<p>A live store could connect its Instagram, Pinterest and TikTok accounts here.</p><p>This portfolio demo is not connected to social accounts. Explore the lookbook for styling inspiration.</p><button type="button" class="btn btn--outline" data-lookbook>Explore the lookbook</button>']
  };
  function showInfo(title, body, trigger) {
    $('[data-info-title]').textContent = title; infoBody.innerHTML = body;
    information.open(trigger); $('[data-info-dialog]').scrollTop = 0;
  }
  $$('[data-info]').forEach(function (button) {
    button.addEventListener('click', function () { var content = info[button.dataset.info]; showInfo(content[0], content[1], button.closest('[data-mobile-menu]') ? menuButton : button); });
  });
  $('[data-info-close]').addEventListener('click', function () { information.close(); });
  $('[data-checkout]').addEventListener('click', function () {
    if (!cart.length) return;
    var lines = cart.map(function (item) {
      var product = catalog.get(item.id);
      return '<li><div><strong>' + escapeHtml(product.name) + '</strong><span>' + escapeHtml(item.color) + ' · ' + escapeHtml(item.size) + ' · Qty ' + item.qty + '</span></div><b>' + price(product.price * item.qty) + '</b></li>';
    }).join('');
    showInfo('Your demo order', '<p>Review your selected pieces. No payment or personal details are needed.</p><ul class="order-summary">' + lines + '</ul><p class="order-total"><span>Demo subtotal · USD</span><strong>' + price(subtotal()) + '</strong></p><p class="demo-note">Shipping and taxes are not calculated. This is not a real order.</p><button type="button" class="btn btn--primary btn--block" data-finish-demo>Finish demo</button><button type="button" class="link-underline" data-return-bag>Back to bag</button>', bagButton);
  });
  infoBody.addEventListener('click', function (event) {
    var button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-return-bag')) { information.close(false); bag.open(bagButton); }
    if (button.hasAttribute('data-finish-demo')) {
      cart = []; save('novae:cart', cart); renderBag();
      $('[data-info-title]').textContent = 'That’s the full journey.';
      infoBody.innerHTML = '<p>You’ve explored the collection, chosen your options and reviewed a demo order.</p><p>No payment was taken and no real order was placed. Your demo bag has been cleared.</p><button type="button" class="btn btn--primary" data-info-shop>Back to the collection</button>';
      $('[data-info-dialog]').focus();
    }
    if (button.hasAttribute('data-info-shop')) { information.close(false); goToCollection(); }
    if (button.hasAttribute('data-clear-demo')) {
      cart = []; wishlist = []; save('novae:cart', cart); save('novae:wishlist', wishlist);
      renderBag(); syncWishlist(); renderCollection(); button.textContent = 'Demo data cleared'; button.disabled = true;
      announce('Your demo bag and saved items have been cleared.'); $('[data-info-close]').focus();
    }
    if (button.hasAttribute('data-lookbook')) { information.close(false); $('#lookbook').scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth' }); $('#lookbook-heading').setAttribute('tabindex', '-1'); $('#lookbook-heading').focus({ preventScroll: true }); }
  });

  var newsletter = $('[data-newsletter-form]');
  newsletter.addEventListener('submit', function (event) {
    event.preventDefault(); var email = $('input', newsletter), status = $('[data-newsletter-status]');
    if (!email.value.trim() || !email.checkValidity()) { status.textContent = 'Please enter a valid email address.'; email.setAttribute('aria-invalid', 'true'); email.focus(); return; }
    email.removeAttribute('aria-invalid'); status.textContent = 'Thanks for trying the demo. Your email was not sent or saved.'; newsletter.reset();
  });
  $('input', newsletter).setAttribute('aria-describedby', 'newsletter-feedback');
  $('[data-newsletter-status]').id = 'newsletter-feedback';

  // Content is visible by default; animate only individual section entrances.
  if (!reduced.matches && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('motion-ready');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
    }, { threshold: 0.02, rootMargin: '0px 0px -20px 0px' });
    $$('[data-reveal], [data-reveal-group]').forEach(function (el) { observer.observe(el); });
    reduced.addEventListener('change', function (event) { if (event.matches) { document.documentElement.classList.remove('motion-ready'); observer.disconnect(); } });
  }
  document.addEventListener('error', function (event) {
    if (event.target.tagName === 'IMG' && !event.target.src.endsWith('/placeholder.svg')) { event.target.removeAttribute('srcset'); event.target.src = 'images/placeholder.svg'; }
  }, true);
  window.addEventListener('storage', function (event) {
    if (event.key === 'novae:cart') { cart = validCart(read('novae:cart')); renderBag(); }
    if (event.key === 'novae:wishlist') { wishlist = validWishlist(read('novae:wishlist')); syncWishlist(); renderCollection(); }
  });
  $('[data-year]').textContent = String(new Date().getFullYear());
  syncWishlist(); renderCollection(); renderBag();
})();
