/* ============================================================================
   Tilli — shared site chrome (header, footer, WhatsApp bubble, Get-in-touch form)
   Injected on every page. Edit CONFIG below; nothing else needs touching to
   change nav, the WhatsApp number, the form endpoint, or the school dropdown.

   Home page (has <canvas id="world">) gets a light top-right cluster instead of
   the full header, so it never fights the seamless-scroll canvas / quicknav.
   ========================================================================== */
(function () {
  "use strict";

  /* ── CONFIG ─────────────────────────────────────────────────────────────
     All shared content now lives in js/site-config.js (window.TILLI) so the
     desktop and mobile skins never drift. This file only renders the desktop /
     static-page markup from it. Load site-config.js before this script.
     ─────────────────────────────────────────────────────────────────────── */
  var CONFIG = window.TILLI || {
    WHATSAPP_NUMBER: "94741889706",
    WHATSAPP_PREFILL: "Hi Kavi! I'd love to learn more about bringing Tilli to our school.",
    FORM_ENDPOINT: "", CALENDLY_URL: "", KAVI_PHOTO: "", ASSET_BASE: "assets/ds/", EMAIL: "info@tillikids.com",
    NAV_ITEMS: [], FOOTER_LINKS: [], SOCIAL: [], WA_ICON: ""
  };

  var IS_HOME = !!document.getElementById("world") || document.body.hasAttribute("data-tl-home");

  function currentFile() {
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }
  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function waLink() {
    return "https://wa.me/" + CONFIG.WHATSAPP_NUMBER +
      "?text=" + encodeURIComponent(CONFIG.WHATSAPP_PREFILL);
  }
  /* Phones/tablets: the WhatsApp bubble opens the chat directly (no Kavi card),
     matching the /m/ builds. Same rule as js/device-split.js (tl-mobile = Home in mobile mode;
     FAQ/Privacy aren't forked, so they need the UA test). */
  function isMobileDevice() {
    if (document.documentElement.classList.contains("tl-mobile")) return true;
    var ua = navigator.userAgent || "";
    var touch = (navigator.maxTouchPoints || 0) > 0 || "ontouchstart" in window;
    var narrow = Math.min(window.innerWidth || 9999, (window.screen && window.screen.width) || 9999) <= 820;
    return /Android|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile/i.test(ua) ||
      /iPad/.test(ua) || (navigator.platform === "MacIntel" && (navigator.maxTouchPoints || 0) > 1) ||
      (narrow && touch);
  }

  /* ── Header ─────────────────────────────────────────────────────────────── */
  /* Same full logo + nav bar on every page, home included. */
  function buildHeader() {
    var here = currentFile();
    var links = CONFIG.NAV_ITEMS.map(function (n) {
      var cur = n.href === here ? ' aria-current="page"' : "";
      return '<a href="' + n.href + '"' + cur + '>' + n.label + "</a>";
    }).join("");

    var header = el(
      '<header class="tl-header">' +
        '<div class="tl-container tl-header__inner">' +
          '<a class="tl-logo" href="index.html" aria-label="Tilli home">' +
            '<img src="' + CONFIG.ASSET_BASE + 'tilli-logo.png" alt="Tilli">' +
          '</a>' +
          '<button class="tl-burger" aria-label="Menu" aria-expanded="false">' +
            '<span></span><span></span><span></span></button>' +
          '<nav class="tl-nav" aria-label="Site">' + links +
            '<button class="tl-btn tl-btn--primary tl-nav__cta" data-tl-open-form>' + (CONFIG.NAV_CTA_LABEL || "Get in touch") + '</button>' +
          '</nav>' +
        '</div>' +
      '</header>'
    );
    document.body.insertBefore(header, document.body.firstChild);
    var burger = header.querySelector(".tl-burger");
    var nav = header.querySelector(".tl-nav");
    burger.addEventListener("click", function () {
      var open = nav.classList.toggle("tl-nav--open");
      burger.setAttribute("aria-expanded", String(open));
    });
  }

  /* ── Footer (interior pages only; home keeps its own) ───────────────────── */
  function buildFooter() {
    if (IS_HOME) return;
    var navLinks = (CONFIG.FOOTER_LINKS || []).map(function (n) {
      return '<a href="' + n.href + '">' + n.label + '</a>';
    }).join("");
    var social = (CONFIG.SOCIAL || []).map(function (s) {
      return '<a href="' + s.href + '" target="_blank" rel="noopener">' + s.label + '</a>';
    }).join("");
    var footer = el(
      '<footer class="tl-footer">' +
        '<div class="tl-container">' +
          '<div class="tl-footer__row">' +
            '<div class="tl-footer__brand"><img src="' + CONFIG.ASSET_BASE + 'tilli-logo.png" alt="Tilli">' +
              '<span class="tl-footer__tag">Developmentally on track by age 10.</span></div>' +
            '<nav class="tl-footer__links" aria-label="Footer">' + navLinks + '</nav>' +
          '</div>' +
          '<div class="tl-footer__row tl-footer__row--meta">' +
            '<div class="tl-footer__reach">Reach out: <a href="mailto:' + CONFIG.EMAIL + '">' + CONFIG.EMAIL + '</a></div>' +
            '<nav class="tl-footer__links tl-footer__social" aria-label="Social">' + social + '</nav>' +
            '<div class="tl-footer__legal">© <span data-tl-year>2026</span> Tilli Kids Inc. · www.tillikids.com</div>' +
          '</div>' +
        '</div>' +
      '</footer>'
    );
    document.body.appendChild(footer);
  }

  /* ── WhatsApp bubble + Kavi card ────────────────────────────────────────── */
  function buildWhatsApp() {
    var waIcon = CONFIG.WA_ICON || '';
    var initials = "KT";
    /* Render the photo only when KAVI_PHOTO is set; otherwise draw the initials
       monogram directly so no missing-image request (404) is ever made. The img
       keeps an onerror fallback for the case where the path is set but fails. */
    var monogram = '<div class="tl-wa__avatar" style="display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--tl-green-600);font-size:var(--tl-fs-xl)">' + initials + '</div>';
    var avatarMarkup = CONFIG.KAVI_PHOTO
      ? '<img class="tl-wa__avatar" src="' + CONFIG.KAVI_PHOTO + '" alt="Kavi"' +
          ' onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'tl-wa__avatar\',style:\'display:flex;align-items:center;justify-content:center;font-weight:800;color:var(--tl-green-600);font-size:var(--tl-fs-xl)\',textContent:\'' + initials + '\'}))">'
      : monogram;
    var card =
      '<div class="tl-wa__card" role="dialog" aria-label="Chat with Kavi">' +
        '<div class="tl-wa__head">' +
          '<button class="tl-wa__close" aria-label="Close">&times;</button>' +
          '<div class="tl-wa__avwrap">' +
            avatarMarkup +
            '<span class="tl-wa__dot"></span>' +
          '</div>' +
          '<p class="tl-wa__name">Kavindya</p>' +
          '<p class="tl-wa__role">Stanford Researcher · CEO, Tilli</p>' +
        '</div>' +
        '<div class="tl-wa__foot">' +
          '<a class="tl-btn tl-btn--green tl-wa__start" href="' + waLink() + '" target="_blank" rel="noopener">Start Chat</a>' +
        '</div>' +
      '</div>';
    var wrap = el(
      '<div class="tl-wa">' + card +
        '<button class="tl-wa__bubble" aria-label="Chat with us on WhatsApp" aria-expanded="false">' + waIcon + '</button>' +
      '</div>'
    );
    document.body.appendChild(wrap);
    var bubble = wrap.querySelector(".tl-wa__bubble");
    var close = wrap.querySelector(".tl-wa__close");
    function toggle(open) {
      wrap.classList.toggle("tl-wa--open", open);
      bubble.setAttribute("aria-expanded", String(open));
    }
    /* Phones: one tap straight into WhatsApp. Desktop: open the Kavi card. */
    bubble.addEventListener("click", function () {
      if (isMobileDevice()) { window.open(waLink(), "_blank", "noopener"); return; }
      toggle(!wrap.classList.contains("tl-wa--open"));
    });
    close.addEventListener("click", function () { toggle(false); });
  }

  /* ── Back-to-top arrow (phones only — CSS decides visibility) ───────────── */
  /* Appended after the WhatsApp wrap so `.tl-wa--open ~ .tl-totop` can hide it.
     Home on phones is native scroll (no detent hijack), so a plain smooth
     scrollTo is safe there too. */
  function buildToTop() {
    var btn = el(
      '<button class="tl-totop" type="button" aria-label="Back to top">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M12 19V5M5 12l7-7 7 7"/></svg>' +
      '</button>'
    );
    document.body.appendChild(btn);
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    btn.addEventListener("click", function () {
      /* Home registers its own glide (js/main.js) — it has to switch the phone
         scroll-snap off for the trip, or the smooth scroll stalls */
      if (typeof window.tilliScrollTop === "function") { window.tilliScrollTop(); return; }
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
    var ticking = false;
    function sync() {
      btn.classList.toggle("tl-totop--show", (window.pageYOffset || 0) > window.innerHeight);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
  }

  /* ── Phones: WhatsApp + back-to-top fade out over the footer ────────────── */
  /* They sit bottom-right, on top of the footer text. Fade both out once the
     footer reaches the bubble, back in when it scrolls away. Home's footer
     lives in its pinned last stage, so there "on screen" also means that stage
     is showing — its fade lags the scroll, hence the trailing re-checks. */
  function fadeOverFooter() {
    var phone = document.documentElement.classList.contains("tl-mobile") ||
      window.matchMedia("(max-width: 860px) and (pointer: coarse)").matches;
    var wa = document.querySelector(".tl-wa");
    if (!phone || !wa) return;
    var timers = [];
    function sync() {
      var ft = document.querySelector(".tl-footer") || document.querySelector(".foot");
      if (!ft) return;
      var r = ft.getBoundingClientRect();
      var stage = ft.closest(".stage"), shown = r.height > 0;
      if (stage) {
        var cs = getComputedStyle(stage);
        shown = shown && cs.visibility !== "hidden" && parseFloat(cs.opacity) > 0.3;
      }
      var bubble = wa.querySelector(".tl-wa__bubble") || wa;
      document.body.classList.toggle("tl-over-footer", shown && r.top < bubble.getBoundingClientRect().bottom && r.bottom > 0);
    }
    function kick() {
      sync();
      timers.forEach(clearTimeout);
      timers = [setTimeout(sync, 300), setTimeout(sync, 800)];
    }
    window.addEventListener("scroll", kick, { passive: true });
    window.addEventListener("resize", kick);
    kick();
  }

  /* ── Get-in-touch modal + form ──────────────────────────────────────────── */
  /* ── Booking form triggers ──────────────────────────────────────────────── */
  /* The pop-up lives in js/booking-form.js (shared with the /m/ build). Any
     element with [data-tl-open-form] opens it, phones included; WhatsApp is
     the fallback if that script hasn't loaded. */
  function bindFormTriggers() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-tl-open-form]");
      if (!t) return;
      e.preventDefault();
      if (window.TilliForm) window.TilliForm.open();
      else window.open(waLink(), "_blank", "noopener");
    });
  }

  /* ── Hide header on scroll-down, reveal on scroll-up ────────────────────── */
  function initHideOnScroll() {
    var header = document.querySelector(".tl-header");
    if (!header) return;
    var lastY = window.pageYOffset || 0;
    var hidden = false;
    var ticking = false;
    var SHOW_AT_TOP = 80; // px: always show near the very top
    var DELTA = 6;        // px: ignore sub-pixel / jitter scrolls

    function setHidden(v) {
      if (v === hidden) return;
      hidden = v;
      header.classList.toggle("tl-header--hidden", v);
      document.body.classList.toggle("tl-chrome-hidden", v);
    }
    /* Home only: main.js eases the page onto the nearest beat after you stop
       scrolling, which can nudge it back UP a little — that must not read as
       "user scrolled up". So on Home the header follows the direction of the
       last real input (wheel / touch / keys), not every scrollY change. */
    var intent = 0; // +1 down, -1 up, 0 unknown (no input yet)
    if (IS_HOME) {
      window.addEventListener("wheel", function (e) {
        if (e.deltaY) intent = e.deltaY > 0 ? 1 : -1;
      }, { passive: true });
      var touchY = null;
      window.addEventListener("touchstart", function (e) { touchY = e.touches[0].clientY; }, { passive: true });
      window.addEventListener("touchmove", function (e) {
        if (touchY == null) return;
        var cur = e.touches[0].clientY;
        if (cur !== touchY) intent = cur < touchY ? 1 : -1; // finger up → scroll down
        touchY = cur;
      }, { passive: true });
      window.addEventListener("keydown", function (e) {
        var k = e.key;
        if (k === "ArrowUp" || k === "PageUp" || k === "Home") intent = -1;
        else if (k === "ArrowDown" || k === "PageDown" || k === "End" || k === " ") intent = 1;
      });
      // pointer input (scrollbar drag, nav clicks) → fall back to raw direction
      window.addEventListener("mousedown", function () { intent = 0; }, { passive: true });
    }

    function onFrame(y) {
      var down = y > lastY + DELTA, up = y < lastY - DELTA;
      if (IS_HOME && intent) { down = down && intent > 0; up = up && intent < 0; }
      if (y <= SHOW_AT_TOP) setHidden(false);
      else if (down) setHidden(true);   // scrolling down
      else if (up) setHidden(false);    // scrolling up
      if (Math.abs(y - lastY) > DELTA) lastY = y;
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      var y = window.pageYOffset || document.documentElement.scrollTop || 0;
      if (!ticking) { ticking = true; requestAnimationFrame(function () { onFrame(y); }); }
    }, { passive: true });
  }

  function init() {
    if (IS_HOME) {
      document.body.classList.add("tl-home");
    } else if (!document.body.classList.contains("tl-page")) {
      document.body.classList.add("tl-page");
    }
    buildHeader();
    buildFooter();
    buildWhatsApp();
    buildToTop();
    fadeOverFooter();
    bindFormTriggers();
    initHideOnScroll();
    // Dynamic copyright year — fills [data-tl-year] placeholders (interior footer + Home's static .foot).
    var year = String(new Date().getFullYear());
    document.querySelectorAll("[data-tl-year]").forEach(function (e) { e.textContent = year; });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
