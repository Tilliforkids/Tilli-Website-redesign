/* ============================================================
   Demo translator — Spanish / Hindi for the copied Measures app.
   ------------------------------------------------------------
   The Measures teacher app writes English straight into the page.
   This swaps it on screen, before the browser paints:
     • DICT[lang][english]  whole text of a text node (trimmed), or a
                            placeholder / title / aria-label
     • PAT[lang]            regex rules for text with numbers or names
                            ("3 children", "Grade 3 A", "Hi Ana")
   Anything inside [data-demo] (demo-content.js — already written in
   each language), [translate="no"] or a form field is left alone.
   Missing strings stay English; open any page with ?i18n=missing and
   run  copy(DemoI18n.missing())  in the console to list them.
   Dictionaries live in demo-i18n-es.js / demo-i18n-hi.js.
   ============================================================ */
(function () {
  'use strict';
  var L = (window.DEMO && window.DEMO.lang) || 'en';
  window.DemoI18n = { DICT: {}, PAT: {}, missing: function () { return []; }, tr: function () { return null; } };
  if (L === 'en') return;

  var ATTRS = ['placeholder', 'title', 'aria-label'];
  var SKIP_TAGS = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, CODE: 1, PRE: 1, NOSCRIPT: 1, OPTION: 0 };
  var SKIP_SEL = '[data-demo], [translate="no"], .notranslate, [contenteditable="true"]';
  var mine = new WeakMap();
  var miss = {}, track = /[?&]i18n=missing/.test(location.search);

  function dict() { return window.DemoI18n.DICT[L] || {}; }
  function pats() { return window.DemoI18n.PAT[L] || []; }
  function tr(s) {
    var d = dict();
    if (Object.prototype.hasOwnProperty.call(d, s)) return d[s];
    var P = pats();
    for (var i = 0; i < P.length; i++) {
      var m = s.match(P[i][0]);
      if (!m) continue;
      var out = typeof P[i][1] === 'function' ? P[i][1].apply(null, m) : s.replace(P[i][0], P[i][1]);
      if (out != null) return out;   // a rule may decline (null) and let the next one try
    }
    if (track && /[A-Za-z]{2}/.test(s)) miss[s] = 1;
    return null;
  }
  window.DemoI18n.tr = tr;   // for text built outside the page (the parent report PDF)
  function skipped(el) { return !el || SKIP_TAGS[el.tagName] || (el.closest && el.closest(SKIP_SEL)); }
  function doText(node) {
    var v = node.nodeValue;
    if (!v || mine.get(node) === v || skipped(node.parentElement)) return;
    var s = v.trim(); if (!s || !/[A-Za-z]/.test(s)) return;
    var out = tr(s);
    if (out != null) { var nv = v.replace(s, out); mine.set(node, nv); node.nodeValue = nv; }
  }
  function doAttrs(el) {
    for (var i = 0; i < ATTRS.length; i++) {
      var a = ATTRS[i], v = el.getAttribute && el.getAttribute(a);
      if (!v) continue;
      var s = v.trim(); if (!/[A-Za-z]/.test(s)) continue;
      var out = tr(s); if (out != null && out !== v) el.setAttribute(a, out);
    }
  }
  function walk(node) {
    if (node.nodeType === 3) { doText(node); return; }
    if (node.nodeType !== 1 || skipped(node)) return;
    doAttrs(node);
    var w = document.createTreeWalker(node, 5, { acceptNode: function (n) { return n.nodeType === 1 && skipped(n) ? 2 : 1; } });
    for (var n = w.nextNode(); n; n = w.nextNode()) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
  }
  // Native dialogs (confirm/alert) carry English too.
  ['confirm', 'alert'].forEach(function (f) { var o = window[f]; window[f] = function (msg) { return o.call(window, tr(String(msg)) || msg); }; });

  function start() {
    walk(document.body);
    new MutationObserver(function (list) {
      list.forEach(function (m) {
        if (m.type === 'childList') m.addedNodes.forEach(walk);
        else if (m.type === 'characterData') doText(m.target);
        else if (m.type === 'attributes' && !skipped(m.target)) doAttrs(m.target);
      });
    }).observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
  document.title = { es: 'Tilli · Demo del panel docente', hi: 'Tilli · शिक्षक डैशबोर्ड डेमो' }[L] || document.title;
  window.DemoI18n.tr = tr;
  window.DemoI18n.missing = function () { return Object.keys(miss).sort(); };
})();
