/* =========================================================
   Royale Chesterfield -- concept demo
   Self-contained: mobile menu, FAQ accordion, two-step booking
   form with WhatsApp hand-off, lightbox, reveal-on-scroll.
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();

  var WHATSAPP_NUMBER = "60123456780";

  /* ---------- Mobile menu ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var mobileMenu = document.getElementById("mobile-menu");
  if (toggle && mobileMenu) {
    var siteHeader = document.getElementById("site-header");
    var mainRegion = document.getElementById("main");
    var footerRegion = document.querySelector(".site-footer");

    var setBackgroundInert = function (isInert) {
      if (mainRegion) mainRegion.inert = isInert;
      if (footerRegion) footerRegion.inert = isInert;
    };

    var closeMenu = function (returnFocus) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      mobileMenu.classList.remove("is-open");
      document.body.style.overflow = "";
      setBackgroundInert(false);
      if (returnFocus) toggle.focus();
    };
    var openMenu = function () {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      mobileMenu.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setBackgroundInert(true);
      var firstLink = mobileMenu.querySelector("a");
      if (firstLink) firstLink.focus();
    };

    toggle.addEventListener("click", function () {
      var isOpen = mobileMenu.classList.contains("is-open");
      if (isOpen) closeMenu(true); else openMenu();
    });
    mobileMenu.querySelectorAll("a, button").forEach(function (el) {
      el.addEventListener("click", function () { closeMenu(false); });
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape" || !mobileMenu.classList.contains("is-open")) return;
      closeMenu(true);
    });
    mobileMenu.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      var focusable = mobileMenu.querySelectorAll("a, button");
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
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq__question").forEach(function (btn) {
    var answer = btn.nextElementSibling;
    btn.addEventListener("click", function () {
      var isOpen = btn.getAttribute("aria-expanded") === "true";
      document.querySelectorAll(".faq__question").forEach(function (other) {
        if (other === btn) return;
        other.setAttribute("aria-expanded", "false");
        other.nextElementSibling.style.maxHeight = "";
      });
      btn.setAttribute("aria-expanded", String(!isOpen));
      answer.style.maxHeight = isOpen ? "" : answer.scrollHeight + "px";
    });
  });

  /* ---------- Two-step booking form ---------- */
  var form = document.getElementById("booking-form");
  if (form) {
    var step1 = form.querySelector('[data-step="1"]');
    var step2 = form.querySelector('[data-step="2"]');
    var status = document.getElementById("booking-status");

    var showError = function (field, message) {
      field.closest(".field").classList.add("has-error");
      status.textContent = message;
      status.className = "form-status is-error";
      field.focus();
    };
    var clearErrors = function () {
      form.querySelectorAll(".field.has-error").forEach(function (f) { f.classList.remove("has-error"); });
      status.textContent = "";
      status.className = "form-status";
    };

    form.querySelector("[data-next]").addEventListener("click", function () {
      clearErrors();
      var name = document.getElementById("rc-name");
      var phone = document.getElementById("rc-phone");
      if (!name.value.trim()) { showError(name, "Please enter your full name."); return; }
      if (!phone.value.trim()) { showError(phone, "Please enter a phone number."); return; }
      step1.hidden = true;
      step2.hidden = false;
      var showroomField = document.getElementById("rc-showroom");
      if (showroomField) showroomField.focus();
    });

    form.querySelector("[data-back]").addEventListener("click", function () {
      clearErrors();
      step2.hidden = true;
      step1.hidden = false;
      document.getElementById("rc-name").focus();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearErrors();
      var showroom = document.getElementById("rc-showroom");
      var purpose = document.getElementById("rc-purpose");
      if (!showroom.value) { showError(showroom, "Please select a showroom."); return; }
      if (!purpose.value) { showError(purpose, "Please select a consultation purpose."); return; }

      var name = document.getElementById("rc-name").value.trim();
      var phone = document.getElementById("rc-phone").value.trim();
      var message = "Hi Royale Chesterfield, I'd like to book a showroom visit.\n" +
        "Name: " + name + "\n" +
        "Phone: " + phone + "\n" +
        "Showroom: " + showroom.value + "\n" +
        "Purpose: " + purpose.value;

      status.textContent = "Opening WhatsApp with your details...";
      status.className = "form-status is-ok";
      window.open("https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(message), "_blank", "noopener");
    });
  }

  /* ---------- Lightbox (gallery) ---------- */
  var lightbox = document.querySelector(".lightbox");
  if (lightbox) {
    var lightboxImg = lightbox.querySelector("img");
    var lightboxCaption = lightbox.querySelector(".lightbox__caption");
    var lightboxClose = lightbox.querySelector(".lightbox__close");
    var lightboxTrigger = null;
    var lbHeader = document.getElementById("site-header");
    var lbMain = document.getElementById("main");
    var lbFooter = document.querySelector(".site-footer");

    var setPageInert = function (isInert) {
      if (lbHeader) lbHeader.inert = isInert;
      if (lbMain) lbMain.inert = isInert;
      if (lbFooter) lbFooter.inert = isInert;
    };

    var openLightbox = function (trigger) {
      lightboxTrigger = trigger;
      var img = trigger.querySelector("img");
      var caption = trigger.getAttribute("data-caption") || "";
      lightboxImg.src = img && img.getAttribute("src") ? img.getAttribute("src") : "";
      lightboxImg.alt = caption;
      lightboxCaption.textContent = caption;
      lightbox.classList.add("is-open");
      document.body.style.overflow = "hidden";
      setPageInert(true);
      lightboxClose.focus();
    };
    var closeLightbox = function () {
      lightbox.classList.remove("is-open");
      lightboxImg.src = "";
      document.body.style.overflow = "";
      setPageInert(false);
      if (lightboxTrigger) lightboxTrigger.focus();
      lightboxTrigger = null;
    };

    document.querySelectorAll(".gallery__item").forEach(function (item) {
      item.addEventListener("click", function () { openLightbox(item); });
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("is-open")) closeLightbox();
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealTargets = document.querySelectorAll(
    ".split, .collections__grid > *, .process__item, .materials__item, .gallery__item, .faq__item"
  );
  if (!reduceMotion && "IntersectionObserver" in window) {
    revealTargets.forEach(function (el) { el.classList.add("reveal"); });
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealTargets.forEach(function (el) { observer.observe(el); });
  }
});
