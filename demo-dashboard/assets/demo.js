/* Demo boot — runs last. The dashboard is already mounted underneath.
   On top: the landing page; "Enter the dashboard" opens the "Continue as"
   pop-up over it (dark overlay); "Continue as" reveals the dashboard. */

/* Motion layer (Nov 13, user: small animations so things open smoothly — pop-ups etc.).
   The dashboard repaints whole screens with innerHTML, so a plain CSS entrance
   animation would replay on every click (that's why they were removed before).
   Instead, after every DOM change this compares what's showing with the last
   snapshot and animates only what just APPEARED: pop-ups, menus, folds, ⓘ boxes,
   and the content under a tab that just changed. A closing pop-up fades out as a
   detached, click-through copy. Screen changes are left to the existing
   cross-fade (teacher-dashboard render() calls DemoMotion.quiet()).
   CSS: "Motion pass" block at the end of demo.css. */
/* UI-built dropdowns (Nov 13, user: every dropdown is our own UI, never the OS list).
   Each native <select> stays in the page, hidden, as the source of truth — the app's
   code keeps reading .value and listening for 'change' — and gets a button (same
   classes, so it looks the same) that opens a .ui-menu list floating over the page.
   Picking sets the select and fires input + change like a real pick. New selects
   from a repaint are picked up by the motion layer's observer (DemoSelect.enhance).
   CSS: "UI dropdowns" block at the end of demo.css. */
(function () {
  'use strict';
  var cur = null;   // the open menu: { b: trigger, sel: select, menu }
  var MENU_MAX = 320;   // tallest the list gets (px) before it scrolls

  function optText(o) { return o ? o.textContent.trim() : ''; }
  function sync(sel) {
    var b = sel._uisBtn; if (!b) return;
    var o = sel.options[sel.selectedIndex], v = optText(o);
    b.querySelector('.uis-val').textContent = v;
    var lab = sel.getAttribute('aria-label');
    b.setAttribute('aria-label', lab ? lab + ': ' + v : v);
    if (sel.classList.contains('ui-filterchip')) b.classList.toggle('on', sel.value !== '');   // chip-style select goes dark once something is picked
  }
  function build(sel) {
    sel.setAttribute('data-uis', '');
    if (sel.multiple || sel.size > 1) return;
    var b = document.createElement('button');
    b.type = 'button';
    b.className = sel.className + ' uis-trigger';
    if (sel.title) b.title = sel.title;
    b.disabled = sel.disabled;
    b.setAttribute('aria-haspopup', 'listbox');
    b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<span class="uis-row"><span class="uis-val"></span><span class="uis-caret" aria-hidden="true">▾</span></span>';
    b._uisSel = sel; sel._uisBtn = b;
    sel.classList.add('uis-native');
    sel.tabIndex = -1;
    sel.setAttribute('aria-hidden', 'true');
    sel.parentNode.insertBefore(b, sel.nextSibling);
    sync(sel);
    if (getComputedStyle(b).backgroundImage !== 'none') b.classList.add('uis-bgcaret');   // field already draws its own arrow
    sel.addEventListener('change', function () { sync(sel); });
    b.addEventListener('click', function () { if (cur && cur.b === b) close(true); else open(b); });
    b.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(b); } });
  }
  function items() { return cur ? [].slice.call(cur.menu.querySelectorAll('.uis-opt:not([disabled])')) : []; }
  function open(b) {
    close(false);
    var sel = b._uisSel, menu = document.createElement('div');
    menu.className = 'ui-menu uis-menu';
    menu.setAttribute('role', 'listbox');
    menu.setAttribute('data-demo', '');   // already translated text: the DOM translator leaves it alone
    var html = '';
    [].forEach.call(sel.children, function (c) {
      var opts = c.tagName === 'OPTGROUP' ? c.children : [c];
      if (c.tagName === 'OPTGROUP') html += '<div class="uis-group">' + esc(c.label) + '</div>';
      [].forEach.call(opts, function (o) {
        if (o.hidden) return;
        var on = o.selected;
        html += '<button type="button" class="ui-menu-item uis-opt focus' + (on ? ' on' : '') + '" role="option" aria-selected="' + on + '" data-uis-i="' + o.index + '"' + (o.disabled ? ' disabled' : '') + '>' +
          '<span>' + esc(optText(o)) + '</span>' + (on ? '<span class="uis-tick" aria-hidden="true">✓</span>' : '') + '</button>';
      });
    });
    menu.innerHTML = html;
    document.body.appendChild(menu);
    cur = { b: b, sel: sel, menu: menu };
    b.setAttribute('aria-expanded', 'true');
    b.classList.add('uis-open');
    place();
    var on = menu.querySelector('.uis-opt.on') || items()[0];
    if (on) { on.focus({ preventScroll: true }); menu.scrollTop = Math.max(0, on.offsetTop - (menu.clientHeight - on.offsetHeight) / 2); }   // not scrollIntoView: that can scroll the page, which closes the menu
    menu.addEventListener('click', function (e) { var o = e.target.closest('.uis-opt'); if (o && !o.disabled) pick(+o.getAttribute('data-uis-i')); });
  }
  // Below the field, or above it when there's more room there; never off-screen sideways.
  function place() {
    if (!cur) return;
    var r = cur.b.getBoundingClientRect(), m = cur.menu, vw = window.innerWidth, vh = window.innerHeight;
    m.style.minWidth = Math.max(r.width, 160) + 'px';
    m.style.maxHeight = MENU_MAX + 'px';
    var below = vh - r.bottom - 12, above = r.top - 12, h = m.offsetHeight;
    var up = h > below && above > below, room = Math.min(MENU_MAX, up ? above : below);
    m.style.maxHeight = Math.max(room, 120) + 'px';
    h = m.offsetHeight;
    m.style.top = (up ? r.top - 6 - h : r.bottom + 6) + 'px';
    m.style.left = Math.max(8, Math.min(r.left, vw - m.offsetWidth - 8)) + 'px';
    m.classList.toggle('up', up);
  }
  function close(refocus) {
    if (!cur) return;
    var b = cur.b;
    cur.menu.remove();
    b.setAttribute('aria-expanded', 'false');
    b.classList.remove('uis-open');
    cur = null;
    if (refocus && b.isConnected) b.focus({ preventScroll: true });
  }
  function pick(i) {
    var sel = cur.sel, b = cur.b, changed = sel.selectedIndex !== i;
    close(true);
    if (!changed) return;
    sel.selectedIndex = i;
    sel.dispatchEvent(new Event('input', { bubbles: true }));
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    // The pick usually repaints the screen: put focus back on the new copy of this dropdown.
    var key = sel.id ? '#' + sel.id : [].map.call(sel.attributes, function (a) { return a.name; }).filter(function (n) { return n.indexOf('data-') === 0 && n !== 'data-uis'; })[0];
    setTimeout(function () {
      if (b.isConnected || !key) return;
      var n = document.querySelector(key.charAt(0) === '#' ? key : 'select[' + key + ']');
      if (n && n._uisBtn) n._uisBtn.focus({ preventScroll: true });
    }, 0);
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // Keys inside the list; Escape is caught here first so it doesn't also close the pop-up underneath.
  window.addEventListener('keydown', function (e) {
    if (!cur) return;
    var list = items(), i = list.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(true); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); var n = list[Math.max(0, Math.min(list.length - 1, i + (e.key === 'ArrowDown' ? 1 : -1)))]; if (n) n.focus(); }
    else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); var x = list[e.key === 'Home' ? 0 : list.length - 1]; if (x) x.focus(); }
    else if (e.key === 'Tab') close(false);
  }, true);
  document.addEventListener('pointerdown', function (e) { if (cur && !cur.menu.contains(e.target) && !cur.b.contains(e.target)) close(false); }, true);
  document.addEventListener('scroll', function (e) { if (cur && !cur.menu.contains(e.target)) close(false); }, true);
  window.addEventListener('resize', function () { close(false); });
  // <label for="…"> pointing at a hidden select opens its dropdown instead.
  document.addEventListener('click', function (e) {
    var l = e.target.closest && e.target.closest('label[for]');
    var s = l && document.getElementById(l.htmlFor);
    if (s && s._uisBtn && !s._uisBtn.contains(e.target)) { e.preventDefault(); s._uisBtn.click(); }
  });

  window.DemoSelect = {
    enhance: function () {
      document.querySelectorAll('select:not([data-uis])').forEach(build);
      if (cur && !cur.b.isConnected) close(false);   // its screen was repainted underneath
    }
  };
  window.DemoSelect.enhance();
})();

(function () {
  'use strict';
  if (!window.MutationObserver || !document.body) return;
  var mq = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(mq && mq.matches); }

  // [selector, animation, signature] — the signature tells two versions of the same box apart (which day is open, which box).
  var POPS = [
    ['.ui-modal-card, .dm-upcard', 'pop'],
    ['.ui-scrim, .askx-scrim', 'fade'],
    ['.rc-attpop, .roster-kebabpop, .roster-sortpop, .askx-pop, .uis-menu', 'drop'],
    ['details:not(.rc-attmenu):not(.rc-amenu):not(.roster-sortmenu):not(.roster-kebab)', 'fold'],
    ['.info-pop, .rc-abody, .rc-aedit, .rc-adel, .sel-bar', 'fold'],
    ['.rc-day', 'fold', function (el) { var b = el.querySelector('b'); return b ? b.textContent : ''; }],
    ['.dt-open', 'popsm', function (el) { return el.className; }],
    ['.dt-tiles', 'fade'],
    ['.dm-saved, .obs-saved', 'popsm']
  ];
  // Tab groups: the active button carries one of these attributes.
  var TAB_ATTRS = ['data-stab', 'data-assesstab', 'data-inview', 'data-rview', 'data-demo-acview', 'data-demo-day', 'data-demo-acfilter'];
  var TAB_SEL = TAB_ATTRS.map(function (a) { return '[' + a + '].on, [' + a + '][aria-selected="true"]'; }).join(', ');
  var OVROOT = '.ui-scrim, .dm-ov, #dm-up';
  var CLS = { pop: 'mo-pop', popsm: 'mo-popsm', fade: 'mo-fade', drop: 'mo-drop', fold: 'mo-fold', rise: 'mo-rise' };
  var ALL_CLS = Object.keys(CLS).map(function (k) { return CLS[k]; });
  var TAB_MAX = 10;   // most blocks animated under one tab change

  function shown(el) {
    if (el.closest('.mo-ghost, [hidden]')) return false;
    if (el.tagName === 'DETAILS' && !el.open) return false;
    var p = el.parentElement;
    return !(p && p.closest('details:not([open])'));
  }
  // Where an element sits: child indexes up to the nearest id (stable across repaints of the same screen).
  function pathOf(el) {
    var parts = [];
    while (el && el !== document.body) {
      if (el.id) { parts.push('#' + el.id); break; }
      var i = 0, s = el;
      while ((s = s.previousElementSibling)) i++;
      parts.push(i);
      el = el.parentElement;
    }
    return parts.join('<');
  }

  function scan() {
    var pops = {}, tabs = {}, seen = {};
    POPS.forEach(function (p, pi) {
      document.querySelectorAll(p[0]).forEach(function (el) {
        if (!shown(el)) return;
        var it = { el: el, kind: p[1] };
        if (p[1] === 'pop') {   // remember where the whole overlay lives, for the closing fade
          var r = el.closest(OVROOT);
          it.root = r; it.host = r && r.parentElement ? r.parentElement.closest('[id]') : null;
        }
        pops[pi + ':' + pathOf(el) + (p[2] ? '|' + p[2](el) : '')] = it;
      });
    });
    document.querySelectorAll(TAB_SEL).forEach(function (b) {
      if (b.closest('.mo-ghost')) return;
      for (var i = 0; i < TAB_ATTRS.length; i++) {
        var a = TAB_ATTRS[i];
        if (!b.hasAttribute(a)) continue;
        var g = a + '#' + (seen[a] = (seen[a] || 0) + 1);
        tabs[g] = { el: b, v: b.getAttribute(a) };
        return;
      }
    });
    return { pops: pops, tabs: tabs };
  }

  function play(el, kind, i) {
    var c = CLS[kind];
    el.classList.remove(c);
    if (i != null) el.style.setProperty('--mo-i', i);
    el.classList.add(c);
    // Drop the class once done: an idle animation on translate/scale would keep a
    // containing block around (breaks position: fixed inside) and could replay later.
    setTimeout(function () { el.classList.remove(c); if (i != null) el.style.removeProperty('--mo-i'); }, 900);
  }

  // Content after the tab bar that actually changed: climb from the bar, comparing
  // each later sibling with its twin in the previous (now detached) screen.
  function changedAfter(nb, ob) {
    var n = nb.closest('[role="tablist"]') || nb.parentElement;
    var o = ob.closest('[role="tablist"]') || ob.parentElement;
    var stop = n.closest('main, .dm-upcard, .ui-modal-card') || document.body;
    var out = [];
    while (n && o && n !== stop && n.parentElement && o.parentElement) {
      var nk = n.parentElement.children, ok = o.parentElement.children;
      for (var i = 0; i < nk.length; i++) {
        var k = nk[i];
        if (k === n || !(n.compareDocumentPosition(k) & 4)) continue;   // 4 = comes after
        if (!ok[i] || !k.isEqualNode(ok[i])) out.push(k);
      }
      n = n.parentElement; o = o.parentElement;
    }
    return out.slice(0, TAB_MAX);
  }

  // Closing: put the removed overlay back as a click-through copy and fade it out.
  function ghost(it) {
    var r = it.root;
    if (!r || r.isConnected) return;
    var host = it.host && it.host.isConnected ? it.host : document.body;
    var card = it.el, top = card._moTop || 0;
    if (r.id === 'dm-up') r.classList.add('mo-ghost-up');   // #dm-up is laid out by its id, which the copy can't keep
    [r].concat([].slice.call(r.querySelectorAll('[id], .' + ALL_CLS.join(', .')))).forEach(function (x) {
      x.removeAttribute('id'); ALL_CLS.forEach(function (c) { x.classList.remove(c); });
    });
    r.classList.add('mo-ghost');
    r.setAttribute('aria-hidden', 'true');
    r.inert = true;
    host.appendChild(r);
    if (top) card.scrollTop = top;
    r.classList.add('mo-out');
    var gone = false, done = function () { if (!gone) { gone = true; r.remove(); } };
    r.addEventListener('animationend', function (e) { if (e.target === r) done(); });
    setTimeout(done, 450);
  }

  var prev = scan(), quietNext = false;
  function onChange() {
    if (window.DemoSelect) window.DemoSelect.enhance();   // first, so the snapshot already has the UI dropdowns
    var cur = scan(), old = prev;
    prev = cur;
    var quiet = quietNext || reduced();
    quietNext = false;
    if (quiet) return;
    Object.keys(old.pops).forEach(function (k) { if (!cur.pops[k] && old.pops[k].kind === 'pop') ghost(old.pops[k]); });
    var panels = [];
    Object.keys(cur.tabs).forEach(function (g) {
      var o = old.tabs[g], n = cur.tabs[g];
      if (!o || o.v === n.v || o.el === n.el) return;
      changedAfter(n.el, o.el).forEach(function (el, i) { play(el, 'rise', i); panels.push(el); });
    });
    Object.keys(cur.pops).forEach(function (k) {
      if (old.pops[k]) return;
      var it = cur.pops[k];
      // Inside a tab panel that's already rising in: one movement is enough.
      if (it.kind !== 'pop' && it.kind !== 'fade' && panels.some(function (p) { return p.contains(it.el); })) return;
      play(it.el, it.kind);
    });
  }
  new MutationObserver(onChange).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['open', 'hidden'] });
  // A pop-up's scroll position, so its closing copy doesn't jump back to the top.
  document.addEventListener('scroll', function (e) {
    var t = e.target;
    if (t && t.classList && (t.classList.contains('ui-modal-card') || t.classList.contains('dm-upcard'))) t._moTop = t.scrollTop;
  }, true);

  window.DemoMotion = {
    quiet: function () { quietNext = true; }   // the next repaint is a screen change: snapshot it, animate nothing
  };
})();

(function () {
  'use strict';
  // After a refresh in the same tab, go straight back to where you were; otherwise show the landing page.
  if (window.DemoUI && !window.DemoUI.restore()) window.DemoUI.landing();
})();
