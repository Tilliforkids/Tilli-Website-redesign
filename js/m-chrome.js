/* ============================================================================
   Tilli — shared MOBILE chrome (topbar rail, header/hamburger drawer, footer,
   WhatsApp bubble + Kavi card). Injected on every /m/ build so Home, Research,
   and School Success share ONE nav + ONE footer.

   Content comes from js/site-config.js (window.TILLI) — the same source the
   desktop js/site-chrome.js reads — so the two skins never drift. This file
   owns only the mobile markup + CSS. Load order on an /m/ page:
       <script src="../js/site-config.js"></script>
       <script src="../js/m-chrome.js"></script>

   Pages are one level deep (/m/<page>), so root-relative config hrefs are
   rewritten: a forked page (index/research/success) resolves to its /m/ twin
   (same filename); everything else gets a "../" prefix. Absolute URLs pass through.
   ========================================================================== */
(function () {
  "use strict";
  var T = window.TILLI || {};
  var FORKED = { "index.html": 1, "research.html": 1, "success.html": 1 };

  function currentFile() {
    var p = location.pathname.split("/").pop();
    return p === "" ? "index.html" : p;
  }
  var HERE = currentFile();

  /* Rewrite a root-relative config href for an /m/ page. */
  function mHref(href) {
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return href;       // absolute / anchor
    var base = href.split("#")[0];                                   // ignore hash for the twin check
    return FORKED[base] ? href : "../" + href;                       // /m/ twin (keeps #anchor) vs ../
  }
  function waLink() {
    return "https://wa.me/" + (T.WHATSAPP_NUMBER || "") +
      "?text=" + encodeURIComponent(T.WHATSAPP_PREFILL || "");
  }
  function el(html) {
    var t = document.createElement("template");
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }

  /* ── CSS (lifted verbatim from the original m/index.html inline styles) ──── */
  function injectCSS() {
    var css =
      /* Topbar rail */
      ".topbar{position:fixed;top:0;left:0;right:0;z-index:60;display:flex;height:6px}" +
      ".topbar div{flex:1}" +
      /* Header */
      ".hdr{position:sticky;top:6px;z-index:50;display:flex;align-items:center;justify-content:space-between;" +
        "padding:12px 20px;background:var(--tl-glass);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);" +
        "border-bottom:1px solid var(--tl-line-200)}" +
      ".hdr .brand{display:flex;align-items:center}" +
      ".hdr .brand img{height:36px;width:auto}" +
      ".burger{display:flex;flex-direction:column;justify-content:center;gap:5px;width:40px;height:40px;" +
        "padding:9px 8px;margin:-8px;background:none;border:0;cursor:pointer}" +
      ".burger span{display:block;height:2.5px;width:100%;border-radius:var(--tl-radius-xs);background:var(--tl-ink-700);" +
        "transition:transform .25s ease,opacity .2s ease}" +
      ".hdr.nav-open .burger span:nth-child(1){transform:translateY(7.5px) rotate(45deg)}" +
      ".hdr.nav-open .burger span:nth-child(2){opacity:0}" +
      ".hdr.nav-open .burger span:nth-child(3){transform:translateY(-7.5px) rotate(-45deg)}" +
      ".navdrawer{position:absolute;top:100%;left:0;right:0;display:flex;flex-direction:column;gap:4px;" +
        "padding:10px 20px 18px;background:var(--tl-glass-strong);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);" +
        "border-bottom:1px solid var(--tl-line-200);box-shadow:var(--tl-shadow-raised);" +
        "opacity:0;visibility:hidden;transform:translateY(-8px);transition:opacity .22s ease,transform .22s ease,visibility .22s}" +
      ".hdr.nav-open .navdrawer{opacity:1;visibility:visible;transform:translateY(0)}" +
      ".navdrawer a{font-family: var(--tl-font-core);text-decoration:none;font-weight:700;font-size:var(--tl-fs-base);color:var(--tl-ink-700);padding:12px 4px;border-bottom:1px solid var(--tl-line-200)}" +
      ".navdrawer a[aria-current=page]{color:var(--tl-pink-600)}" +
      ".navdrawer .navdrawer-cta{border:0;margin-top:12px;color:var(--tl-white);justify-content:center;display:flex;width:100%;" +
        "align-items:center;gap:8px;font-weight:700;font-size:var(--tl-fs-base);padding:13px 22px;border-radius:var(--tl-radius-pill);" +
        "background:var(--tl-pink-600);box-shadow:var(--tl-shadow-glow-pink)}" +
      /* Footer */
      ".ft{padding:32px 20px calc(32px + env(safe-area-inset-bottom));border-top:1px solid var(--tl-line-200);" +
        "text-align:center;background:var(--tl-white)}" +
      ".ft .fbrand img{height:28px;width:auto;display:block;margin:0 auto}" +
      ".ft .tag{font-size:var(--tl-fs-sm);font-style:italic;color:var(--tl-ink-500);margin-top:6px}" +
      ".ft .mail{font-size:var(--tl-fs-sm);color:var(--tl-ink-500);margin-top:4px}" +
      ".ft nav{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin:20px 0 14px}" +
      ".ft nav a{font-size:var(--tl-fs-sm);font-weight:600;color:var(--tl-ink-600)}" +
      ".ft .social{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin:0 0 16px}" +
      ".ft .social a{font-size:var(--tl-fs-sm);font-weight:600;color:var(--tl-ink-500)}" +
      ".ft .mail a{font-size:var(--tl-fs-sm);color:var(--tl-ink-500)}" +
      ".ft .copy{margin-top:16px;font-size:var(--tl-fs-xs);color:var(--tl-ink-300)}" +
      /* WhatsApp bubble — one tap straight into WhatsApp (no card on phones) */
      ".wa{position:fixed;right:16px;bottom:calc(74px + env(safe-area-inset-bottom));z-index:56;transition:opacity .25s ease,transform .25s ease}" +
      ".wa-bubble{width:52px;height:52px;border-radius:50%;border:0;cursor:pointer;margin-left:auto;text-decoration:none;" +
        "background:var(--tl-whatsapp);box-shadow:var(--tl-shadow-glow-whatsapp);display:flex;align-items:center;justify-content:center}" +
      ".wa-bubble svg{width:28px;height:28px;fill:var(--tl-white)}" +
      /* Back-to-top arrow — on the WhatsApp bubble's axis, 12px above it */
      ".totop{--totop-size:44px;position:fixed;z-index:55;display:flex;align-items:center;justify-content:center;" +
        "right:calc(16px + (52px - var(--totop-size)) / 2);bottom:calc(74px + 52px + 12px + env(safe-area-inset-bottom));" +
        "width:var(--totop-size);height:var(--totop-size);border-radius:50%;cursor:pointer;color:var(--tl-ink-700);" +
        "background:var(--tl-glass-strong);border:1px solid var(--tl-line-200);box-shadow:var(--tl-shadow-raised);" +
        "backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);" +
        "opacity:0;pointer-events:none;transform:translateY(8px);transition:opacity .22s ease,transform .22s ease}" +
      ".totop svg{width:20px;height:20px}" +
      ".totop.show{opacity:1;pointer-events:auto;transform:translateY(0)}" +
      ".wa.open~.totop{opacity:0;pointer-events:none}" +
      /* both buttons fade away while the footer is on screen (fadeOverFooter) */
      "body.over-ft .wa:not(.open),body.over-ft .totop{opacity:0!important;pointer-events:none!important;transform:translateY(8px)}";
    var style = document.createElement("style");
    style.id = "m-chrome-css";
    style.textContent = css;
    document.head.appendChild(style);
  }

  /* ── Topbar + Header ─────────────────────────────────────────────────────── */
  function buildHeader() {
    var topbar = el(
      '<div class="topbar">' +
        '<div style="background:var(--tl-green-500)"></div>' +
        '<div style="background:var(--tl-pink-400)"></div>' +
        '<div style="background:var(--tl-cyan-500)"></div>' +
        '<div style="background:var(--tl-yellow-500)"></div>' +
      '</div>'
    );
    var links = (T.NAV_ITEMS || []).map(function (n) {
      var cur = n.href === HERE ? ' aria-current="page"' : "";
      return '<a href="' + mHref(n.href) + '"' + cur + ">" + n.label + "</a>";
    }).join("");
    var header = el(
      '<header class="hdr">' +
        '<a class="brand" href="' + mHref("index.html") + '" aria-label="Tilli home">' +
          '<img src="../' + (T.ASSET_BASE || "assets/ds/") + 'tilli-logo.png" alt="Tilli"></a>' +
        '<button class="burger" aria-label="Menu" aria-expanded="false"><span></span><span></span><span></span></button>' +
        '<nav class="navdrawer" aria-label="Site">' + links +
          '<a class="navdrawer-cta" href="' + waLink() + '" target="_blank" rel="noopener" data-tl-open-form>' + (T.NAV_CTA_LABEL || "Get in touch") + '</a>' +
        '</nav>' +
      '</header>'
    );
    document.body.insertBefore(topbar, document.body.firstChild);
    document.body.insertBefore(header, topbar.nextSibling);

    var burger = header.querySelector(".burger");
    function set(open) { header.classList.toggle("nav-open", open); burger.setAttribute("aria-expanded", String(open)); }
    burger.addEventListener("click", function (e) { e.stopPropagation(); set(!header.classList.contains("nav-open")); });
    header.querySelectorAll(".navdrawer a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
    document.addEventListener("click", function (e) { if (!header.contains(e.target)) set(false); });
  }

  /* ── Footer (full desktop content, reflowed for phone) ───────────────────── */
  function buildFooter() {
    var year = new Date().getFullYear();
    var links = (T.FOOTER_LINKS || []).map(function (n) {
      return '<a href="' + mHref(n.href) + '">' + n.label + "</a>";
    }).join("");
    var social = (T.SOCIAL || []).map(function (s) {
      return '<a href="' + s.href + '" target="_blank" rel="noopener">' + s.label + "</a>";
    }).join("");
    var mail = T.EMAIL || "info@tillikids.com";
    var footer = el(
      '<footer class="ft">' +
        '<div class="fbrand"><img src="../' + (T.ASSET_BASE || "assets/ds/") + 'tilli-logo.png" alt="Tilli"></div>' +
        '<div class="tag">Developmentally on track by age 10.</div>' +
        '<nav aria-label="Footer">' + links + "</nav>" +
        '<div class="social" aria-label="Social">' + social + "</div>" +
        '<div class="mail">Reach out: <a href="mailto:' + mail + '">' + mail + "</a></div>" +
        '<div class="copy">© ' + year + " Tilli Kids Inc. · www.tillikids.com</div>" +
      "</footer>"
    );
    var main = document.querySelector("main.content") || document.body;
    main.appendChild(footer);
  }

  /* ── WhatsApp + back-to-top fade out over the footer ───────────────────── */
  /* They sit bottom-right, on top of the footer text: fade both out once the
     footer reaches the bubble, back in when it scrolls away. */
  function fadeOverFooter() {
    var wa = document.querySelector(".wa"), ft = document.querySelector("footer.ft");
    if (!wa || !ft) return;
    var bubble = wa.querySelector(".wa-bubble") || wa;
    function sync() {
      var r = ft.getBoundingClientRect();
      document.body.classList.toggle("over-ft", r.top < bubble.getBoundingClientRect().bottom && r.bottom > 0);
    }
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  /* ── WhatsApp bubble ───────────────────────────────────────────────────── */
  /* A plain link: one tap opens the WhatsApp chat. The booking pop-up
     (js/booking-form.js) carries the Calendly + form options instead. */
  function buildWhatsApp() {
    var wrap = el(
      '<div class="wa">' +
        '<a class="wa-bubble" href="' + waLink() + '" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">' +
          (T.WA_ICON || "") + "</a>" +
      "</div>"
    );
    document.body.appendChild(wrap);
  }

  /* ── "Book a 30-minute call" → booking pop-up ────────────────────────────── */
  /* Every [data-tl-open-form] link opens the pop-up. Its href stays a WhatsApp
     link, used as-is if booking-form.js hasn't loaded. */
  function bindFormTriggers() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-tl-open-form]");
      if (!t || !window.TilliForm) return;
      e.preventDefault();
      window.TilliForm.open();
    });
  }

  /* ── Back-to-top arrow ───────────────────────────────────────────────────── */
  /* Appended after the WhatsApp wrap so `.wa.open ~ .totop` can hide it. */
  function buildToTop() {
    var btn = el(
      '<button class="totop" type="button" aria-label="Back to top">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M12 19V5M5 12l7-7 7 7"/></svg>' +
      "</button>"
    );
    document.body.appendChild(btn);
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
    var ticking = false;
    function sync() {
      btn.classList.toggle("show", (window.pageYOffset || 0) > window.innerHeight);
      ticking = false;
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(sync); }
    }, { passive: true });
    sync();
  }

  function init() {
    injectCSS();
    buildHeader();
    buildFooter();
    buildWhatsApp();
    buildToTop();
    fadeOverFooter();
    bindFormTriggers();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
