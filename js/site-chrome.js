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
     WHATSAPP_NUMBER  digits only, country code first (no +, spaces, or dashes)
     WHATSAPP_PREFILL text pre-typed into WhatsApp when "Start Chat" is tapped
     FORM_ENDPOINT    Google Apps Script Web App URL. "" = stubbed (no backend
                      yet): the form still validates and confirms, nothing is
                      sent. Paste the deployed /exec URL here to go live.
     KAVI_PHOTO       headshot for the chat card (drop the file at this path)
     SCHOOL_TYPES     options in the "kind of school" dropdown (used as email
                      context by the Cowork routine)
     NAV_ITEMS        header links, in order. Add/remove/reorder here only.
     ─────────────────────────────────────────────────────────────────────── */
  var CONFIG = {
    WHATSAPP_NUMBER: "94741889706",
    WHATSAPP_PREFILL: "Hi Kavi! I'd love to learn more about bringing Tilli to our school.",
    FORM_ENDPOINT: "",
    KAVI_PHOTO: "assets/ds/kavi.jpg",
    ASSET_BASE: "assets/ds/",
    SCHOOL_TYPES: [
      "IB", "Cambridge / IGCSE", "CBSE", "ICSE", "State board",
      "Public / Government", "NGO / Non-profit", "Other"
    ],
    NAV_ITEMS: [
      { label: "Home", href: "index.html" },
      { label: "Tilli for Research", href: "research.html" },
      { label: "Success Stories", href: "success.html" }
    ]
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
            '<button class="tl-btn tl-btn--primary tl-nav__cta" data-tl-open-form>Get in touch</button>' +
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
    var year = new Date().getFullYear();
    var footer = el(
      '<footer class="tl-footer">' +
        '<div class="tl-container">' +
          '<div class="tl-footer__row">' +
            '<div class="tl-footer__brand"><img src="' + CONFIG.ASSET_BASE + 'tilli-logo.png" alt="Tilli">' +
              '<span class="tl-footer__tag">Developmentally on track by 10.</span></div>' +
            '<nav class="tl-footer__links" aria-label="Footer">' +
              '<a href="index.html">Home</a>' +
              '<a href="research.html">Tilli for Research</a>' +
              '<a href="success.html">Success Stories</a>' +
              '<a href="faq.html">FAQs</a>' +
              '<a href="privacy-policy.html">Privacy Policy</a>' +
              '<a href="#" data-tl-open-form>Get in touch</a>' +
              '<a href="' + waLink() + '" target="_blank" rel="noopener">WhatsApp</a>' +
            '</nav>' +
          '</div>' +
          '<div class="tl-footer__row" style="margin-top:22px">' +
            '<div class="tl-footer__reach">Reach out: <a href="mailto:info@tillikids.com">info@tillikids.com</a></div>' +
            '<nav class="tl-footer__links" aria-label="Social">' +
              '<a href="https://www.linkedin.com/company/tillikids/" target="_blank" rel="noopener">LinkedIn</a>' +
              '<a href="https://www.instagram.com/tilliforkids/" target="_blank" rel="noopener">Instagram</a>' +
              '<a href="https://x.com/kidstilli" target="_blank" rel="noopener">X</a>' +
              '<a href="https://www.youtube.com/channel/UCmLhsI6wbyZ2yb-gqguzjmA" target="_blank" rel="noopener">YouTube</a>' +
              '<a href="https://www.facebook.com/TilliKids/" target="_blank" rel="noopener">Facebook</a>' +
            '</nav>' +
          '</div>' +
          '<div class="tl-footer__legal">© ' + year + ' Tilli Kids Inc. · www.tillikids.com</div>' +
        '</div>' +
      '</footer>'
    );
    document.body.appendChild(footer);
  }

  /* ── WhatsApp bubble + Kavi card ────────────────────────────────────────── */
  function buildWhatsApp() {
    var waIcon = '<svg viewBox="0 0 32 32" fill="currentColor" aria-hidden="true"><path d="M16 3C9.4 3 4 8.4 4 15c0 2.1.6 4.2 1.6 6L4 29l8.2-1.6c1.7.9 3.6 1.4 5.6 1.4h.2c6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.7 0-3.4-.5-4.9-1.3l-.4-.2-4.9 1 1-4.8-.3-.5c-1-1.6-1.5-3.4-1.5-5.3C5 9.5 9.9 4.9 16 4.9c5.6 0 10.1 4.5 10.1 10.1S21.6 24.8 16 24.8zm5.6-7.6c-.3-.2-1.8-.9-2.1-1s-.5-.2-.7.2-.8 1-1 1.2-.4.3-.7.1c-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.7l.5-.6c.2-.2.2-.3.3-.5s.1-.4 0-.6l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4s-1.1 1.1-1.1 2.7 1.2 3.1 1.3 3.3c.2.2 2.3 3.6 5.6 5 .8.3 1.4.5 1.9.7.8.3 1.5.2 2.1.1.6-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>';
    var initials = "KT";
    var card =
      '<div class="tl-wa__card" role="dialog" aria-label="Chat with Kavi">' +
        '<div class="tl-wa__head">' +
          '<button class="tl-wa__close" aria-label="Close">&times;</button>' +
          '<div class="tl-wa__avwrap">' +
            '<img class="tl-wa__avatar" src="' + CONFIG.KAVI_PHOTO + '" alt="Kavi"' +
              ' onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'tl-wa__avatar\',style:\'display:flex;align-items:center;justify-content:center;font-weight:800;color:#348C11;font-size:30px\',textContent:\'' + initials + '\'}))">' +
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
    bubble.addEventListener("click", function () { toggle(!wrap.classList.contains("tl-wa--open")); });
    close.addEventListener("click", function () { toggle(false); });
  }

  /* ── Get-in-touch modal + form ──────────────────────────────────────────── */
  function buildForm() {
    var opts = CONFIG.SCHOOL_TYPES.map(function (s) {
      return '<option value="' + s + '">' + s + "</option>";
    }).join("");
    var modal = el(
      '<div class="tl-modal" role="dialog" aria-modal="true" aria-label="Request to connect">' +
        '<div class="tl-modal__panel">' +
          '<button class="tl-modal__close" aria-label="Close">&times;</button>' +
          '<p class="tl-eyebrow">Request to connect</p>' +
          '<h2 class="tl-h2" style="margin:0 0 6px">Let’s talk about your school</h2>' +
          '<p class="tl-body tl-muted">Tell us a little about you and Kavi’s team will reach out.</p>' +
          '<form class="tl-form" novalidate>' +
            '<div class="tl-form__row">' +
              '<div class="tl-field">' +
                '<label for="tlf-name">Name <span class="tl-req">*</span></label>' +
                '<input class="tl-input" id="tlf-name" name="name" type="text" autocomplete="name" required>' +
                '<span class="tl-field__err">Please enter your name.</span>' +
              '</div>' +
              '<div class="tl-field">' +
                '<label for="tlf-role">Your role</label>' +
                '<input class="tl-input" id="tlf-role" name="role" type="text" placeholder="Principal, coordinator…">' +
              '</div>' +
            '</div>' +
            '<div class="tl-field">' +
              '<label for="tlf-school">School / organisation</label>' +
              '<input class="tl-input" id="tlf-school" name="school" type="text" autocomplete="organization">' +
            '</div>' +
            '<div class="tl-form__row">' +
              '<div class="tl-field">' +
                '<label for="tlf-email">Email <span class="tl-req">*</span></label>' +
                '<input class="tl-input" id="tlf-email" name="email" type="email" autocomplete="email" required>' +
                '<span class="tl-field__err">Please enter a valid email.</span>' +
              '</div>' +
              '<div class="tl-field">' +
                '<label for="tlf-phone">Phone (WhatsApp) <span class="tl-req">*</span></label>' +
                '<input class="tl-input" id="tlf-phone" name="phone" type="tel" autocomplete="tel" required placeholder="+94 …">' +
                '<span class="tl-field__err">A phone number is required.</span>' +
              '</div>' +
            '</div>' +
            '<div class="tl-field">' +
              '<label for="tlf-type">Kind of school</label>' +
              '<select class="tl-select" id="tlf-type" name="school_type"><option value="">Select…</option>' + opts + '</select>' +
            '</div>' +
            '<div class="tl-field">' +
              '<label for="tlf-msg">Anything you’d like us to know?</label>' +
              '<textarea class="tl-textarea" id="tlf-msg" name="message"></textarea>' +
            '</div>' +
            '<button class="tl-btn tl-btn--primary tl-btn--lg tl-form__submit" type="submit">Send request</button>' +
            '<p class="tl-form__note">We’ll only use these details to get in touch about Tilli.</p>' +
          '</form>' +
          '<div class="tl-form__ok">' +
            '<h3 class="tl-h3">Thank you — we’ve got it! 🌱</h3>' +
            '<p class="tl-body tl-muted">Kavi’s team will be in touch soon. Prefer to chat now?</p>' +
            '<a class="tl-btn tl-btn--green" href="' + waLink() + '" target="_blank" rel="noopener" style="margin-top:10px">Message us on WhatsApp</a>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
    document.body.appendChild(modal);

    var panel = modal.querySelector(".tl-modal__panel");
    var form = modal.querySelector(".tl-form");
    var closeBtn = modal.querySelector(".tl-modal__close");

    function open() { modal.classList.add("tl-modal--open"); document.body.style.overflow = "hidden";
      setTimeout(function () { var f = modal.querySelector("#tlf-name"); if (f) f.focus(); }, 60); }
    function close() { modal.classList.remove("tl-modal--open"); document.body.style.overflow = ""; }

    closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });

    // Any element with [data-tl-open-form] opens the modal.
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-tl-open-form]");
      if (t) { e.preventDefault(); open(); }
    });

    function showErr(input, on) {
      input.classList.toggle("tl-input--err", on);
      input.classList.toggle("tl-select--err", on);
      var err = input.parentElement.querySelector(".tl-field__err");
      if (err) err.classList.toggle("tl-field__err--show", on);
    }
    function validEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
    function validPhone(v) { return /^[+()\-\s]*(?:\d[()\-\s]*){7,}$/.test(v); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.name, email = form.email, phone = form.phone;
      var ok = true;
      if (!name.value.trim()) { showErr(name, true); ok = false; } else showErr(name, false);
      if (!validEmail(email.value.trim())) { showErr(email, true); ok = false; } else showErr(email, false);
      if (!validPhone(phone.value.trim())) { showErr(phone, true); ok = false; } else showErr(phone, false);
      if (!ok) { var first = form.querySelector(".tl-input--err"); if (first) first.focus(); return; }

      var btn = form.querySelector(".tl-form__submit");
      var done = function () { panel.parentElement.classList.add("tl-modal--done"); };
      var data = new FormData(form);
      data.append("page", location.pathname);
      data.append("submitted_at", new Date().toISOString());

      if (!CONFIG.FORM_ENDPOINT) { done(); return; } // stub: no backend wired yet

      btn.disabled = true; btn.textContent = "Sending…";
      fetch(CONFIG.FORM_ENDPOINT, { method: "POST", body: data })
        .then(done)
        .catch(function () { done(); }) // Apps Script often returns opaque; treat as sent
        .finally(function () { btn.disabled = false; btn.textContent = "Send request"; });
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
    function onFrame(y) {
      if (y <= SHOW_AT_TOP) setHidden(false);
      else if (y > lastY + DELTA) setHidden(true);   // scrolling down
      else if (y < lastY - DELTA) setHidden(false);  // scrolling up
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
    buildForm();
    initHideOnScroll();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
