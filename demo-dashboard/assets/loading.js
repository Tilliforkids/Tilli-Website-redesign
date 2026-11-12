/* ============================================================
   Tilli Measures — loading + error states (shared by every app)
   ------------------------------------------------------------
   The prototype reads everything from DemoStore, so nothing
   really waits or fails. To make these states visible (and ready
   for a real backend), screens show a skeleton on their FIRST
   visit for DEMO_MS, and buttons that save / import / download
   show a busy state for BUSY_MS. A developer swaps the timers for
   the real request.

   Simulated errors (to see the error states): open any page with
   ?errors=1 (off: ?errors=0). It's remembered across pages. Every
   screen's first load then fails once and every busy button fails
   once; "Try again" succeeds.

   TilliLoad.skeleton(parts)      → skeleton HTML. parts: 'title',
       'crumbs', 'bar', 'tabs', 'hero', 'tiles:N', 'rows:N',
       'cards:N', 'card:N' (one card, N lines), 'chart', 'circle'
   TilliLoad.gate(key, rerender)  → 'loading' | 'error' | 'ready'.
       First call starts the (pretend) request; rerender() runs when
       it settles. Render a skeleton / errorHTML(key) / the page.
   TilliLoad.errorHTML(key, what) → "Couldn't load …" + Try again
   TilliLoad.firstVisit(key, el, parts, done)
       → true (skeleton or error shown in el; done() runs once it's
         ready) or false (ready: render it yourself)
   TilliLoad.seen(key)            marks a key as already loaded
   TilliLoad.busy(btn, label, fn) disables btn, shows a spinner +
       label, runs fn after BUSY_MS, then restores the button. If it
       fails (fn throws / returns false, or a simulated error), the
       button comes back with a message under it.
   TilliLoad.failNow(key)         true when a simulated error should
       happen for this key (each key fails once)
   ============================================================ */
(function () {
  'use strict';
  var DEMO_MS = 380;   // first-visit skeleton time (prototype only)
  var BUSY_MS = 500;   // busy-button time (prototype only)
  var SIM_KEY = 'tilliMeasures.simulateErrors';
  var state = {}, redraw = {}, failed = {};

  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };

  // ---- simulated errors switch (?errors=1 / ?errors=0, remembered) ----
  var simulate = (function () {
    var on = false;
    try {
      var q = new URLSearchParams(location.search).get('errors');
      if (q === '1') DemoStore.setItem(SIM_KEY, '1');
      if (q === '0') DemoStore.removeItem(SIM_KEY);
      on = DemoStore.getItem(SIM_KEY) === '1';
    } catch (e) { /* no storage → off */ }
    return on;
  })();
  function failNow(key) { if (!simulate || failed[key]) return false; failed[key] = true; return true; }

  // ---- skeleton shapes ----
  function line(w, cls) { return '<div class="skeleton sk-line' + (cls ? ' ' + cls : '') + '" style="width:' + w + '%"></div>'; }
  function lines(n) { var s = ''; for (var i = 0; i < n; i++) s += line(92 - (i % 3) * 14); return s; }
  var PART = {
    title: function () { return '<div class="sk-head">' + line(36, 'sk-title') + line(54) + '</div>'; },
    crumbs: function () { return line(22, 'sk-crumb'); },
    bar: function () { return '<div class="sk-bar">' + line(30, 'sk-field') + line(14, 'sk-field') + line(14, 'sk-field') + '</div>'; },
    tabs: function () { return '<div class="sk-tabs">' + [1, 2, 3, 4, 5].map(function () { return '<div class="skeleton sk-tab"></div>'; }).join('') + '</div>'; },
    hero: function () { return '<div class="sk-hero"><div class="skeleton sk-circle"></div><div class="sk-hero-t">' + line(30) + line(60, 'sk-title') + line(48) + '</div></div>'; },
    circle: function () { return '<div class="ui-card sk-card sk-center"><div class="skeleton sk-circle lg"></div></div>'; },
    chart: function () { return '<div class="ui-card sk-card">' + line(34, 'sk-cardtitle') + '<div class="skeleton sk-chart"></div></div>'; },
    tiles: function (n) { var s = ''; for (var i = 0; i < n; i++) s += '<div class="ui-card sk-card sk-tile">' + line(40, 'sk-num') + line(70) + '</div>'; return '<div class="sk-grid tiles">' + s + '</div>'; },
    cards: function (n) { var s = ''; for (var i = 0; i < n; i++) s += '<div class="ui-card sk-card">' + line(46, 'sk-cardtitle') + lines(3) + '</div>'; return '<div class="sk-grid cards">' + s + '</div>'; },
    card: function (n) { return '<div class="ui-card sk-card">' + line(34, 'sk-cardtitle') + lines(n || 3) + '</div>'; },
    rows: function (n) {
      var s = ''; for (var i = 0; i < n; i++) s += '<div class="sk-row">' + line(28) + line(18) + line(14) + line(10) + '</div>';
      return '<div class="ui-card sk-card">' + line(24, 'sk-cardtitle') + s + '</div>';
    },
  };
  function skeleton(parts) {
    var html = (parts || ['title', 'card:4']).map(function (p) {
      var bits = String(p).split(':'), fn = PART[bits[0]];
      return fn ? fn(bits[1] ? parseInt(bits[1], 10) : undefined) : '';
    }).join('');
    return '<div class="sk-wrap" aria-busy="true"><span class="sk-sr" role="status">Loading…</span>' + html + '</div>';
  }

  // ---- load gate: loading → ready | error ----
  function gate(key, rerender) {
    if (rerender) redraw[key] = rerender;
    var st = state[key];
    if (st === 'ready' || st === 'error') return st;
    if (st !== 'loading') {
      state[key] = 'loading';
      setTimeout(function () {
        state[key] = failNow('load:' + key) ? 'error' : 'ready';
        if (redraw[key]) redraw[key]();
      }, DEMO_MS);
    }
    return 'loading';
  }
  function retry(key) { delete state[key]; if (redraw[key]) redraw[key](); }
  function errorHTML(key, what) {
    return '<div class="ld-error" role="alert"><div class="ld-error-ic" aria-hidden="true">!</div>' +
      '<b>Couldn’t load ' + esc(what || 'this page') + '</b>' +
      '<span>Check your internet connection and try again. If it keeps happening, tell the Tilli team.</span>' +
      '<button type="button" class="btn btn-outline btn-sm" data-ld-retry="' + esc(key) + '">Try again</button></div>';
  }
  // The button pressed last (Safari doesn't focus buttons on click, so
  // document.activeElement can't be trusted) — for helpers like downloads.
  var lastBtn = null, lastAt = 0;
  document.addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button'); if (b) { lastBtn = b; lastAt = Date.now(); } }, true);
  function lastButton() { return lastBtn && Date.now() - lastAt < 1000 && document.body.contains(lastBtn) ? lastBtn : null; }
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-ld-retry]');
    if (b) { e.preventDefault(); e.stopPropagation(); retry(b.getAttribute('data-ld-retry')); }
  }, true);
  function firstVisit(key, el, parts, done, what) {
    if (!el) return false;
    // When the load settles (or Try again restarts it) come back through here,
    // so a retry shows the skeleton again before the page.
    var g = gate(key, function () { if (!firstVisit(key, el, parts, done, what)) done(); });
    if (g === 'ready') return false;
    el.innerHTML = g === 'error' ? errorHTML(key, what) : skeleton(parts);
    return true;
  }
  function seen(key) { state[key] = 'ready'; }

  // ---- busy buttons (+ save errors) ----
  function clearErr(btn) { var n = btn && btn.nextElementSibling; if (n && n.classList && n.classList.contains('ld-saveerr')) n.remove(); }
  function showErr(btn, msg) {
    if (!btn || !document.body.contains(btn)) { if (window.console) console.warn(msg); return; }
    clearErr(btn);
    btn.insertAdjacentHTML('afterend', '<p class="ld-saveerr" role="alert">' + esc(msg) + '</p>');
  }
  function busy(btn, label, fn, errMsg) {
    if (!btn || btn.getAttribute('aria-busy') === 'true') return;
    clearErr(btn);
    var html = btn.innerHTML, w = btn.offsetWidth, wasDisabled = btn.disabled;
    var key = 'busy:' + (label || '') + ':' + (btn.id || btn.textContent || '').trim().slice(0, 40);
    btn.setAttribute('aria-busy', 'true'); btn.disabled = true; if (w) btn.style.minWidth = w + 'px';
    btn.innerHTML = '<span class="ld-spin" aria-hidden="true"></span>' + esc(label || 'Working…');
    var restore = function () {
      if (document.body.contains(btn) && btn.getAttribute('aria-busy') === 'true') {
        btn.innerHTML = html; btn.disabled = wasDisabled; btn.removeAttribute('aria-busy'); btn.style.minWidth = '';
      }
    };
    setTimeout(function () {
      var msg = errMsg || 'That didn’t go through — check your connection and try again.';
      if (failNow(key)) { restore(); showErr(btn, msg); return; }
      var ok = true;
      try { ok = fn() !== false; } catch (e) { ok = false; if (window.console) console.error(e); }
      restore();
      if (!ok) showErr(btn, msg);
    }, BUSY_MS);
  }

  // ---- "Simulating errors" badge, so nobody forgets it's on ----
  if (simulate) document.addEventListener('DOMContentLoaded', function () {
    var b = document.createElement('div'); b.className = 'ld-simbadge';
    b.innerHTML = '<span title="Every screen’s first load fails once and every save fails once, so the error states can be seen. Try again succeeds.">Simulating errors <i class="ld-new" aria-label="new">*</i></span><button type="button" title="Stop simulating errors on every page">Turn off</button>';
    b.querySelector('button').addEventListener('click', function () { try { DemoStore.removeItem(SIM_KEY); } catch (e) { /* ignore */ } location.reload(); });
    document.body.appendChild(b);
  });

  window.TilliLoad = { DEMO_MS: DEMO_MS, BUSY_MS: BUSY_MS, simulating: simulate, skeleton: skeleton, gate: gate, retry: retry, errorHTML: errorHTML,
    firstVisit: firstVisit, seen: seen, busy: busy, showError: showErr, failNow: failNow, lastButton: lastButton };
})();
