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
    return FORKED[href] ? href : "../" + href;                       // /m/ twin vs ../
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
        "padding:12px 20px;background:rgba(255,255,255,.9);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);" +
        "border-bottom:1px solid var(--tl-line-200)}" +
      ".hdr .brand{display:flex;align-items:center}" +
      ".hdr .brand img{height:30px;width:auto}" +
      ".burger{display:flex;flex-direction:column;justify-content:center;gap:5px;width:40px;height:40px;" +
        "padding:9px 8px;margin:-8px;background:none;border:0;cursor:pointer}" +
      ".burger span{display:block;height:2.5px;width:100%;border-radius:2px;background:var(--tl-ink-800);" +
        "transition:transform .25s ease,opacity .2s ease}" +
      ".hdr.nav-open .burger span:nth-child(1){transform:translateY(7.5px) rotate(45deg)}" +
      ".hdr.nav-open .burger span:nth-child(2){opacity:0}" +
      ".hdr.nav-open .burger span:nth-child(3){transform:translateY(-7.5px) rotate(-45deg)}" +
      ".navdrawer{position:absolute;top:100%;left:0;right:0;display:flex;flex-direction:column;gap:4px;" +
        "padding:10px 20px 18px;background:rgba(255,255,255,.97);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);" +
        "border-bottom:1px solid var(--tl-line-200);box-shadow:0 14px 24px rgba(20,20,20,.08);" +
        "opacity:0;visibility:hidden;transform:translateY(-8px);transition:opacity .22s ease,transform .22s ease,visibility .22s}" +
      ".hdr.nav-open .navdrawer{opacity:1;visibility:visible;transform:translateY(0)}" +
      ".navdrawer a{font-weight:700;font-size:16px;color:var(--tl-ink-800);padding:12px 4px;border-bottom:1px solid var(--tl-line-200)}" +
      ".navdrawer a[aria-current=page]{color:var(--tl-pink-600)}" +
      ".navdrawer .navdrawer-cta{border:0;margin-top:12px;color:#fff;justify-content:center;display:flex;width:100%;" +
        "align-items:center;gap:8px;font-weight:700;font-size:15px;padding:13px 22px;border-radius:999px;" +
        "background:var(--tl-pink-600);box-shadow:0 6px 18px rgba(233,30,140,.28)}" +
      /* Footer */
      ".ft{padding:32px 20px calc(84px + env(safe-area-inset-bottom));border-top:1px solid var(--tl-line-200);" +
        "text-align:center;background:#fff}" +
      ".ft .fbrand{font-family:'Montserrat',sans-serif;font-weight:800;font-size:20px;color:var(--tl-ink-900)}" +
      ".ft .tag{font-size:13px;font-style:italic;color:var(--tl-ink-450);margin-top:4px}" +
      ".ft nav{display:flex;justify-content:center;gap:18px;flex-wrap:wrap;margin:20px 0 14px}" +
      ".ft nav a{font-size:14px;font-weight:600;color:var(--tl-ink-600)}" +
      ".ft .social{display:flex;justify-content:center;gap:16px;flex-wrap:wrap;margin:0 0 16px}" +
      ".ft .social a{font-size:13px;font-weight:600;color:var(--tl-ink-500)}" +
      ".ft .mail a{font-size:14px;color:var(--tl-ink-500)}" +
      ".ft .copy{margin-top:16px;font-size:12px;color:var(--tl-ink-300)}" +
      /* WhatsApp bubble + card */
      ".wa{position:fixed;right:16px;bottom:calc(74px + env(safe-area-inset-bottom));z-index:56}" +
      ".wa-bubble{width:52px;height:52px;border-radius:50%;border:0;cursor:pointer;margin-left:auto;" +
        "background:#25D366;box-shadow:0 8px 22px rgba(37,211,102,.4);display:flex;align-items:center;justify-content:center}" +
      ".wa-bubble svg{width:28px;height:28px;fill:#fff}" +
      ".wa-card{position:absolute;right:0;bottom:64px;width:260px;border-radius:22px;overflow:hidden;background:#fff;" +
        "box-shadow:0 20px 50px rgba(20,20,20,.28);transform-origin:bottom right;transform:scale(.9) translateY(10px);" +
        "opacity:0;pointer-events:none;transition:transform .22s ease,opacity .22s ease}" +
      ".wa.open .wa-card{transform:scale(1) translateY(0);opacity:1;pointer-events:auto}" +
      ".wa-card__head{background:var(--tl-green-500);padding:26px 22px 22px;text-align:center;position:relative;color:#fff}" +
      ".wa-card__close{position:absolute;top:10px;right:12px;background:none;border:0;color:#fff;font-size:22px;" +
        "line-height:1;cursor:pointer;opacity:.9;padding:4px}" +
      ".wa-card__avwrap{position:relative;width:84px;margin:0 auto 12px}" +
      ".wa-card__avatar{width:84px;height:84px;border-radius:50%;border:3px solid #fff;object-fit:cover;display:block;background:#fff}" +
      ".wa-card__dot{position:absolute;right:4px;bottom:4px;width:16px;height:16px;border-radius:50%;" +
        "background:#34e07a;border:3px solid var(--tl-green-500)}" +
      ".wa-card__name{font-size:19px;font-weight:800;margin:0}" +
      ".wa-card__role{font-size:13.5px;opacity:.95;margin:3px 0 0}" +
      ".wa-card__foot{padding:16px}" +
      ".wa-card__start{display:flex;width:100%;justify-content:center;align-items:center;background:var(--tl-green-500);" +
        "color:#fff;font-weight:700;font-size:15px;padding:13px 22px;border-radius:999px}";
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
          '<a class="navdrawer-cta" href="' + waLink() + '" target="_blank" rel="noopener">Get in touch</a>' +
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
    }).join("") +
      '<a href="' + waLink() + '" target="_blank" rel="noopener">Get in touch</a>' +
      '<a href="' + waLink() + '" target="_blank" rel="noopener">WhatsApp</a>';
    var social = (T.SOCIAL || []).map(function (s) {
      return '<a href="' + s.href + '" target="_blank" rel="noopener">' + s.label + "</a>";
    }).join("");
    var mail = T.EMAIL || "info@tillikids.com";
    var footer = el(
      '<footer class="ft">' +
        '<div class="fbrand">Tilli.</div>' +
        '<div class="tag">Developmentally on track by 10.</div>' +
        '<nav aria-label="Footer">' + links + "</nav>" +
        '<div class="social" aria-label="Social">' + social + "</div>" +
        '<div class="mail"><a href="mailto:' + mail + '">' + mail + "</a></div>" +
        '<div class="copy">© ' + year + " Tilli Kids Inc. · www.tillikids.com</div>" +
      "</footer>"
    );
    var main = document.querySelector("main.content") || document.body;
    main.appendChild(footer);
  }

  /* ── WhatsApp bubble + Kavi card ─────────────────────────────────────────── */
  function buildWhatsApp() {
    var initials = "KT";
    var avatar = T.KAVI_PHOTO
      ? '<img class="wa-card__avatar" src="../' + T.KAVI_PHOTO + '" alt="Kavi"' +
          ' onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{className:\'wa-card__avatar\',style:\'display:flex;align-items:center;justify-content:center;font-weight:800;color:#348C11;font-size:30px\',textContent:\'' + initials + '\'}))">'
      : '<div class="wa-card__avatar" style="display:flex;align-items:center;justify-content:center;font-weight:800;color:#348C11;font-size:30px">' + initials + "</div>";
    var wrap = el(
      '<div class="wa">' +
        '<div class="wa-card" role="dialog" aria-label="Chat with Kavi">' +
          '<div class="wa-card__head">' +
            '<button class="wa-card__close" aria-label="Close">&times;</button>' +
            '<div class="wa-card__avwrap">' + avatar + '<span class="wa-card__dot"></span></div>' +
            '<p class="wa-card__name">Kavindya</p>' +
            '<p class="wa-card__role">Stanford Researcher · CEO, Tilli</p>' +
          "</div>" +
          '<div class="wa-card__foot">' +
            '<a class="wa-card__start" href="' + waLink() + '" target="_blank" rel="noopener">Start Chat</a>' +
          "</div>" +
        "</div>" +
        '<button class="wa-bubble" aria-label="Chat with us on WhatsApp" aria-expanded="false">' + (T.WA_ICON || "") + "</button>" +
      "</div>"
    );
    document.body.appendChild(wrap);
    var bubble = wrap.querySelector(".wa-bubble");
    function set(open) { wrap.classList.toggle("open", open); bubble.setAttribute("aria-expanded", String(open)); }
    bubble.addEventListener("click", function (e) { e.stopPropagation(); set(!wrap.classList.contains("open")); });
    wrap.querySelector(".wa-card__close").addEventListener("click", function () { set(false); });
    document.addEventListener("click", function (e) { if (!wrap.contains(e.target)) set(false); });
  }

  function init() {
    injectCSS();
    buildHeader();
    buildFooter();
    buildWhatsApp();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
