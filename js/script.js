/* =========================================================
   ajak.Web — Site Script
   Small, dependency-free helpers for every page.
   Sections below are independent — delete a block if a page
   doesn't need it (e.g. contact.html is the only page that
   uses the "Contact form" block).
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header shadow ---------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var mobileMenu = document.querySelector(".mobile-menu");
  if (toggle && mobileMenu) {
    var closeMenu = function (returnFocus) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
      if (returnFocus) toggle.focus();
    };
    var openMenu = function () {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      mobileMenu.classList.add("is-open");
      document.body.style.overflow = "hidden";
      var firstLink = mobileMenu.querySelector("a");
      if (firstLink) firstLink.focus();
    };
    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      isOpen ? closeMenu(true) : openMenu();
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(false); });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mobileMenu.classList.contains("is-open")) {
        closeMenu(true);
        return;
      }
      if (e.key === "Tab" && mobileMenu.classList.contains("is-open")) {
        var focusables = [toggle].concat(
          Array.prototype.slice.call(mobileMenu.querySelectorAll("a, button"))
        );
        var first = focusables[0];
        var last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* Note: the fade-up entrance effect on ".reveal" elements is handled
     entirely by a CSS animation in style.css (see "Entrance animation").
     It plays automatically on load, so it needs no JavaScript here. */

  /* ---------- Portfolio filter (My Work page) ---------- */
  var filterBar = document.querySelector(".filter-bar");
  var projectEls = document.querySelectorAll("[data-category]");
  if (filterBar && projectEls.length) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter-btn");
      if (!btn) return;
      filterBar.querySelectorAll(".filter-btn").forEach(function (b) {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");

      var value = btn.dataset.filter;
      projectEls.forEach(function (el) {
        var cats = el.dataset.category.split(" ");
        var show = value === "all" || cats.indexOf(value) !== -1;
        el.style.display = show ? "" : "none";
      });
    });
  }

  /* ---------- Lightbox (project screenshots) ---------- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lightboxImg = lightbox.querySelector("img");
    var lightboxCaption = lightbox.querySelector(".lightbox__caption");
    var openLightbox = function (src, caption) {
      lightboxImg.src = src;
      lightboxImg.alt = caption || "";
      lightboxCaption.textContent = caption || "";
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
    };
    var closeLightbox = function () {
      lightbox.classList.remove("is-open");
      lightboxImg.src = "";
      document.body.style.overflow = "";
    };
    document.querySelectorAll("[data-lightbox]").forEach(function (trigger) {
      trigger.addEventListener("click", function () {
        openLightbox(trigger.dataset.lightbox, trigger.dataset.caption);
      });
    });
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox || e.target.closest(".lightbox__close")) {
        closeLightbox();
      }
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeLightbox();
    });
  }

  /* ---------- Contact form -> sends enquiry via WhatsApp ----------
     No backend is connected yet, so instead of silently doing
     nothing, the form builds a pre-filled WhatsApp message from
     what was typed and opens it in WhatsApp. Swap the WHATSAPP_NUMBER
     constant if the number ever changes. */
  var enquiryForm = document.getElementById("enquiry-form");
  if (enquiryForm) {
    var WHATSAPP_NUMBER = "60176146502";
    var statusEl = document.getElementById("form-status");

    enquiryForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var data = new FormData(enquiryForm);
      var name = (data.get("name") || "").toString().trim();
      var business = (data.get("business") || "").toString().trim();
      var email = (data.get("email") || "").toString().trim();
      var phone = (data.get("phone") || "").toString().trim();
      var websiteType = (data.get("websiteType") || "").toString().trim();
      var message = (data.get("message") || "").toString().trim();

      if (!name || !email || !message) {
        statusEl.textContent = "Please fill in your name, email and a short message before sending.";
        statusEl.className = "form-status is-visible is-error";
        return;
      }

      var lines = [
        "Hi ajak.Web, I'd like to enquire about a website.",
        "",
        "Name: " + name,
        business ? "Business: " + business : null,
        "Email: " + email,
        phone ? "WhatsApp/Phone: " + phone : null,
        websiteType ? "Website type: " + websiteType : null,
        "",
        "Message: " + message
      ].filter(Boolean).join("\n");

      var url = "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(lines);

      statusEl.textContent = "Opening WhatsApp with your enquiry filled in \u2014 just hit send there.";
      statusEl.className = "form-status is-visible is-success";

      window.open(url, "_blank", "noopener");
      enquiryForm.reset();
    });
  }
});
