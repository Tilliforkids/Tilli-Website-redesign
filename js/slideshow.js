/* ───────────────────────────────────────────────────────────────────────────
   Tilli — photo slideshow (Success case studies, desktop + mobile).
   Markup: any sized box with class "ss" holding <img>s directly:
     <div class="cs__media ss" data-ss-interval="5000"> <img …> <img …> </div>
   Slides horizontally, auto-advances every data-ss-interval ms (default 5000),
   arrows + dots to flip by hand, swipe on touch. A clone of the first slide sits
   at the end so the wrap from last → first keeps sliding forward (no rewind).
   Pauses on hover / focus / hidden tab; reduced-motion → no autoplay, no slide.
   ─────────────────────────────────────────────────────────────────────────── */
(() => {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const css = document.createElement('style');
  css.textContent = `
  .ss { position: relative; overflow: hidden; padding: 0; display: block; }
  .ss__track { display: flex; height: 100%; transition: transform var(--ss-dur, 600ms) var(--tl-ease, ease); }
  .ss__track > img { flex: 0 0 100%; width: 100%; height: 100%; object-fit: cover; display: block; }
  .ss__btn { position: absolute; top: 50%; transform: translateY(-50%); z-index: 1;
    width: 40px; height: 40px; border-radius: 50%; border: 0; cursor: pointer;
    display: grid; place-items: center; padding: 0;
    background: rgba(255,255,255,.92); color: var(--tl-ink-900); box-shadow: var(--tl-shadow-raised);
    opacity: .85; transition: opacity var(--tl-duration-fast, .15s) ease; }
  .ss:hover .ss__btn, .ss__btn:focus-visible { opacity: 1; }
  .ss__btn svg { width: 18px; height: 18px; }
  .ss__btn--prev { left: 12px; } .ss__btn--next { right: 12px; }
  .ss__dots { position: absolute; left: 0; right: 0; bottom: 12px; z-index: 1;
    display: flex; justify-content: center; gap: 8px; }
  .ss__dot { width: 8px; height: 8px; border-radius: 50%; border: 0; padding: 0; cursor: pointer;
    background: rgba(255,255,255,.6); box-shadow: 0 0 0 1px rgba(0,0,0,.08); }
  .ss__dot[aria-current="true"] { background: var(--tl-white, #fff); transform: scale(1.25); }`;
  document.head.appendChild(css);

  const icon = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"
    stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

  document.querySelectorAll('.ss').forEach((box) => {
    const imgs = Array.from(box.querySelectorAll(':scope > img'));
    const n = imgs.length;
    if (n < 2) return;
    const wait = parseInt(box.dataset.ssInterval, 10) || 5000;

    const track = document.createElement('div');
    track.className = 'ss__track';
    imgs.forEach((im) => track.appendChild(im));
    const clone = imgs[0].cloneNode();
    clone.alt = ''; clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    box.appendChild(track);
    box.setAttribute('role', 'region');
    box.setAttribute('aria-roledescription', 'carousel');

    const mk = (cls, label, d) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'ss__btn ' + cls; b.setAttribute('aria-label', label);
      b.innerHTML = icon(d);
      box.appendChild(b);
      return b;
    };
    const prev = mk('ss__btn--prev', 'Previous photo', 'M15 5l-7 7 7 7');
    const next = mk('ss__btn--next', 'Next photo', 'M9 5l7 7-7 7');
    const dotsWrap = document.createElement('div');
    dotsWrap.className = 'ss__dots';
    const dots = imgs.map((_, k) => {
      const d = document.createElement('button');
      d.type = 'button'; d.className = 'ss__dot'; d.setAttribute('aria-label', 'Photo ' + (k + 1) + ' of ' + n);
      d.addEventListener('click', () => { go(k); restart(); });
      dotsWrap.appendChild(d);
      return d;
    });
    box.appendChild(dotsWrap);

    let i = 0, timer = 0, held = false;
    const place = (anim) => {
      track.style.transition = anim && !reduced ? '' : 'none';
      track.style.transform = 'translateX(' + (-i * 100) + '%)';
      if (!anim || reduced) void track.offsetWidth;   // commit the jump before re-enabling transitions
      dots.forEach((d, k) => d.setAttribute('aria-current', String(k === i % n)));
    };
    function go(k) {
      if (i === n) { i = 0; place(false); k -= n; }  // clicked mid-wrap: settle on the real first slide
      if (k < 0) { i = n; place(false); k = n - 1; }  // from the first: jump to the clone, slide back
      i = k;
      place(true);
      if (i === n && reduced) { i = 0; place(false); }
    }
    // landed on the clone → swap to the real first slide, invisibly
    track.addEventListener('transitionend', () => { if (i === n) { i = 0; place(false); } });

    const stop = () => { clearInterval(timer); timer = 0; };
    function restart() {
      stop();
      if (!reduced && !held && !document.hidden) timer = setInterval(() => go(i + 1), wait);
    }
    prev.addEventListener('click', () => { go(i - 1); restart(); });
    next.addEventListener('click', () => { go(i + 1); restart(); });

    const hold = (v) => () => { held = v; restart(); };
    box.addEventListener('mouseenter', hold(true));
    box.addEventListener('mouseleave', hold(false));
    box.addEventListener('focusin', hold(true));
    box.addEventListener('focusout', hold(false));
    document.addEventListener('visibilitychange', restart);

    // swipe: horizontal drag past 40px flips one slide
    let x0 = null;
    box.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    box.addEventListener('touchend', (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      x0 = null;
      if (Math.abs(dx) > 40) { go(dx < 0 ? i + 1 : i - 1); restart(); }
    });

    place(false);
    restart();
  });
})();
