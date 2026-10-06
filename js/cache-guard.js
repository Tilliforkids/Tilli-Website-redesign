/* ============================================================================
   Tilli — HTML cache self-heal.
   GitHub Pages serves every .html with a fixed `Cache-Control: max-age=600`
   and gives no way to set headers, so a browser can keep serving a STALE page
   shell (old nav links, a reference to a page that didn't exist yet, old inline
   copy) for up to ~10 min after a deploy. That is exactly how a brand-new /m/
   page returned a 404 right after launch.

   This guard makes the shell self-correct. Every load fetches /version.json
   with `cache:"no-store"` (always hits the server, never the cache). When the
   deployed BUILD differs from the one this client last recorded, it forces ONE
   cache-revalidating reload, so no visitor keeps running an old HTML document.

   Loaded on EVERY page, as early as possible (right after the Device Split gate
   on forked pages). The version path is root-absolute so it resolves the same
   from / and from /m/.

   ── MAINTENANCE ─────────────────────────────────────────────────────────────
   After every deploy whose HTML changed (new page, nav item, inline copy),
   bump "build" in /version.json. That is the ONE thing to change — it tells
   every returning client to refresh to the new shell on its next visit.
   JS/CSS edits still need their own ?v= bump: this guard refreshes the HTML
   document only, not the subresources the fresh HTML re-requests by ?v=.
   ─────────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var KEY = "tl-build";
  try {
    fetch("/version.json?_=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (v) {
        if (!v || !v.build) return;
        var seen = null;
        try { seen = localStorage.getItem(KEY); } catch (e) {}
        try { localStorage.setItem(KEY, v.build); } catch (e) {}
        // Reload ONLY when we know this client previously saw an older build.
        // (Set the new value first, so the post-reload run can't loop.)
        if (seen && seen !== v.build) location.reload();
      })
      .catch(function () {});
  } catch (e) {}
})();
