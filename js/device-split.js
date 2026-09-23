/* ── Device Split gate ──────────────────────────────────────────────────────
   ONE source of truth for the desktop⇄mobile fork. Loaded (parser-blocking,
   before any stylesheet or the 3JS bundle) by both:
     desktop  /index.html   →  <script src="js/device-split.js"></script>
     mobile   /m/index.html →  <script src="../js/device-split.js"></script>

   It figures out which build it's running on from the URL, so the two sides can
   never disagree and cause a redirect loop.
     • On the desktop build, a phone is sent to  m/
     • On the mobile build,  a desktop is sent to ../

   Manual override for testing / a "view other version" link — applies to THIS
   load only, it is NOT remembered:
     ?view=mobile   ?view=desktop
   (No persistence on purpose: a stored choice would override real device
   detection forever — e.g. testing ?view=mobile once would strand every later
   desktop visit on /m/.)
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  try {
    // Clear any preference stored by earlier versions of this gate, so visitors
    // who got stuck on the wrong build are released on their next load.
    try { localStorage.removeItem('tl-view'); } catch (e) {}

    // Which build are we on? Strip trailing "index.html" / slash, check last segment.
    var seg = location.pathname.replace(/\/index\.html$/i, '').replace(/\/+$/, '');
    var onMobileBuild = /(^|\/)m$/i.test(seg);

    // Per-load override
    var forced = new URLSearchParams(location.search).get('view');

    // Decide: is this visitor "mobile"?
    var isMobile;
    if (forced === 'mobile' || forced === 'desktop') {
      isMobile = (forced === 'mobile');
    } else {
      var ua = navigator.userAgent || '';
      var uaMobile = /Android|iPhone|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile/i.test(ua);
      var iPad = /iPad/.test(ua) || (navigator.platform === 'MacIntel' && (navigator.maxTouchPoints || 0) > 1);
      var narrow = Math.min(window.innerWidth || 9999, (window.screen && window.screen.width) || 9999) <= 820;
      var touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
      isMobile = uaMobile || iPad || (narrow && touch);
    }

    // Fork. Redirect targets are relative to the PAGE, so they hold on both sides.
    if (onMobileBuild && !isMobile) {
      location.replace('../' + location.search + location.hash);
    } else if (!onMobileBuild && isMobile) {
      location.replace('m/' + location.search + location.hash);
    }
  } catch (e) {}
})();
