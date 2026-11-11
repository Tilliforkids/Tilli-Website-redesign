/* ============================================================================
   Tilli — language banner + footer language picker. Shared by every page,
   both skins. Injected by functions/_middleware.js (with window.TILLI_LOCALE),
   so pages don't load it themselves.

   window.TILLI_LOCALE = { lang, how, country, langs:{code:nativeName} }
     how = "browser" | "country" | "timezone" → switched automatically: banner
           "url" | "cookie" | "default" → the visitor chose (or nothing to say)

   Time-zone fallback: Cloudflare can't see the device's time zone, so when
   nothing stronger picked a language (how = "default") this script maps the
   time zone (TZ_LANG), stores it in the tl-auto cookie and reloads ONCE; the
   middleware then serves that language on every page. If the time zone later
   changes, the cookie follows it.

   Picking a language just reloads with ?lang=xx; the middleware remembers it
   in the tl-lang cookie, so it sticks on every page after that.
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var L = window.TILLI_LOCALE;
  if (!L || !L.langs) return;
  var _t = window._t || function (s) { return s; };

  /* How long the banner waits before sliding in (ms), and the cookie life. */
  var BANNER_DELAY = 900;
  var COOKIE_DAYS = 365;
  /* Time zone → language, used only when nothing stronger applies.
     tl-auto cookie life in days (it is re-checked against the clock on every page). */
  var TZ_LANG = { "Asia/Colombo": "si", "Asia/Amman": "ar", "Europe/Madrid": "es",
                  "Atlantic/Canary": "es", "Africa/Ceuta": "es" };
  var TZ_COOKIE_DAYS = 30;
  var SECURE = location.protocol === "https:" ? "; Secure" : "";

  /* ── Time-zone fallback (runs before anything renders) ───────────────────── */
  function tzLang() {
    try { return TZ_LANG[Intl.DateTimeFormat().resolvedOptions().timeZone] || null; }
    catch (e) { return null; }
  }
  function hasCookie(re) { return re.test(document.cookie); }
  function timezoneFallback() {
    if (L.how !== "default" && L.how !== "timezone") return false;   // something stronger decided
    var want = tzLang();
    var have = L.how === "timezone" ? L.lang : null;
    if (want === have) return false;                                  // already right
    if (want) document.cookie = "tl-auto=" + want + "; Max-Age=" + TZ_COOKIE_DAYS * 86400 + "; Path=/; SameSite=Lax" + SECURE;
    else document.cookie = "tl-auto=; Max-Age=0; Path=/; SameSite=Lax" + SECURE;
    /* Guard 1: cookies blocked → the reload would change nothing (and loop). */
    var stored = want ? hasCookie(new RegExp("(?:^|;\\s*)tl-auto=" + want + "(?:;|$)"))
                      : !hasCookie(/(?:^|;\s*)tl-auto=/);
    if (!stored) return false;
    /* Guard 2: at most one time-zone reload per page + target per session. */
    var key = "tl-tz:" + location.pathname + ":" + (want || "none");
    try { if (sessionStorage.getItem(key)) return false; sessionStorage.setItem(key, "1"); }
    catch (e) { return false; }
    location.replace(location.href);
    return true;
  }
  if (timezoneFallback()) return;   // page is reloading in the right language

  function hrefFor(code) {
    var u = new URL(location.href);
    u.searchParams.set("lang", code);
    return u.pathname + u.search + u.hash;
  }
  function remember(code) {
    document.cookie = "tl-lang=" + code + "; Max-Age=" + COOKIE_DAYS * 86400 + "; Path=/; SameSite=Lax" +
      (location.protocol === "https:" ? "; Secure" : "");
  }

  var css =
    ".tl-lang{display:inline-flex;align-items:center;gap:6px;margin-inline-start:10px;vertical-align:middle}" +
    ".tl-lang svg{width:15px;height:15px;opacity:.7;flex:none}" +
    ".tl-lang select{font:inherit;font-size:inherit;color:inherit;background:transparent;border:1px solid currentColor;" +
      "border-radius:999px;padding:3px 10px;cursor:pointer;opacity:.85}" +
    ".tl-lang select:hover{opacity:1}" +
    ".tl-lbar{position:fixed;left:16px;bottom:16px;z-index:80;max-width:min(380px,calc(100vw - 104px));" +
      "background:var(--tl-white,#fff);color:var(--tl-ink-900,#1a1a1a);border-radius:var(--tl-radius-lg,18px);" +
      "box-shadow:var(--tl-shadow-overlay,0 12px 40px rgba(0,0,0,.18));padding:16px 18px 14px;" +
      "font-family:var(--tl-font-core,system-ui,sans-serif);font-size:var(--tl-fs-sm,14px);line-height:1.45;" +
      "opacity:0;transform:translateY(12px);transition:opacity .3s ease,transform .3s ease}" +
    ".tl-lbar.show{opacity:1;transform:none}" +
    ".tl-lbar p{margin:0 0 12px;padding-inline-end:18px}" +   /* room for the × */
    ".tl-lbar__btns{display:flex;flex-wrap:wrap;gap:8px}" +
    ".tl-lbar button,.tl-lbar a.tl-lbar__btn{font:inherit;font-weight:700;border-radius:999px;padding:7px 14px;cursor:pointer;" +
      "text-decoration:none;border:2px solid var(--tl-ink-900,#1a1a1a);background:transparent;color:inherit}" +
    ".tl-lbar .tl-lbar__keep{background:var(--tl-ink-900,#1a1a1a);color:var(--tl-white,#fff)}" +
    ".tl-lbar__more{margin-top:10px;font-size:var(--tl-fs-xs,12px);opacity:.75}" +
    ".tl-lbar__more a{color:inherit;margin-inline-end:10px}" +
    ".tl-lbar__x{position:absolute;top:6px;inset-inline-end:8px;border:0!important;padding:4px 8px!important;font-size:18px;line-height:1;opacity:.6}" +
    /* Phones: full width so the buttons sit side by side, above the WhatsApp bubble (62px + 22px) */
    "@media (max-width:600px){.tl-lbar{left:12px;right:12px;max-width:none;bottom:96px}}" +
    /* Home: sit above the quick-nav pill row, level with the raised WhatsApp bubble (css/site.css .tl-home .tl-wa) */
    ".tl-home .tl-lbar{bottom:130px}" +
    "@media (max-width:860px){.tl-home .tl-lbar{bottom:122px}}" +
    "@media (prefers-reduced-motion:reduce){.tl-lbar{transition:none}}";
  var style = document.createElement("style");
  style.textContent = css;
  document.head.appendChild(style);

  /* ── Footer picker: fills every [data-tl-lang-switch] (chrome footers + Home) ── */
  var GLOBE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></svg>';
  function fillPickers() {
    document.querySelectorAll("[data-tl-lang-switch]:not(.tl-lang)").forEach(function (slot) {
      slot.classList.add("tl-lang");
      var opts = Object.keys(L.langs).map(function (c) {
        return '<option value="' + c + '"' + (c === L.lang ? " selected" : "") + ' lang="' + c + '">' + L.langs[c] + "</option>";
      }).join("");
      slot.innerHTML = GLOBE + '<select aria-label="' + _t("Language") + '">' + opts + "</select>";
      slot.querySelector("select").addEventListener("change", function (e) { location.href = hrefFor(e.target.value); });
    });
  }

  /* ── Banner: only when we switched language automatically ───────────────── */
  function banner() {
    if (L.how !== "browser" && L.how !== "country" && L.how !== "timezone") return;
    var here = L.langs[L.lang];
    var why = L.how === "browser" ? _t("We’re showing this page in {lang} to match your browser’s language.")
                                  : _t("We’re showing this page in {lang} based on where you are.");
    var others = Object.keys(L.langs).filter(function (c) { return c !== L.lang && c !== "en"; })
      .map(function (c) { return '<a href="' + hrefFor(c) + '" lang="' + c + '">' + L.langs[c] + "</a>"; }).join("");
    var bar = document.createElement("div");
    bar.className = "tl-lbar";
    bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", _t("Language"));
    bar.innerHTML =
      '<button class="tl-lbar__x" type="button" aria-label="' + _t("Close") + '">&times;</button>' +
      "<p>" + why.replace("{lang}", "<b>" + here + "</b>") + "</p>" +
      '<div class="tl-lbar__btns">' +
        (L.lang !== "en" ? '<a class="tl-lbar__btn" href="' + hrefFor("en") + '" lang="en">Show in English</a>' : "") +
        '<button class="tl-lbar__keep" type="button">' + _t("Keep {lang}").replace("{lang}", here) + "</button>" +
      "</div>" +
      (others ? '<div class="tl-lbar__more">' + _t("Other languages:") + " " + others + "</div>" : "");
    document.body.appendChild(bar);
    function dismiss() { remember(L.lang); bar.classList.remove("show"); setTimeout(function () { bar.remove(); }, 350); }
    bar.querySelector(".tl-lbar__keep").addEventListener("click", dismiss);
    bar.querySelector(".tl-lbar__x").addEventListener("click", dismiss);
    setTimeout(function () { bar.classList.add("show"); }, BANNER_DELAY);
  }

  function init() {
    /* chrome footers are built on DOMContentLoaded by site-chrome / m-chrome;
       wait a frame so their [data-tl-lang-switch] slots exist */
    requestAnimationFrame(function () { fillPickers(); banner(); });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
