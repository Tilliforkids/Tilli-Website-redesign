/* ============================================================================
   Tilli — shared 3JS dot field for the static pages (Results, FAQ, Research).

   One fixed WebGL canvas sits between the section backgrounds and the section
   content. Every <section data-dots="…"> declares a formation that SAYS what
   the section says; as the page scrolls (normal scroll — no detents, no
   hijack) the SAME dots flow from one section's formation into the next.

   Formations (data-dots):
     generic   orb · split · network · scatter · helix · dim · off
     Results   child        the whole child (Student Outline silhouette, filled)
               pipeline     raw data → insight orb → rising arrow (Measure/Ask/Intervene)
               bars         three years of growth, growth slice in pink (+28%)
               venn         teacher / parent / child lenses, the child at the overlap
               loop         plan → see data → redesign, dots circling the cycle
               tenkids      ten children, nine lit (9 in 10 improved)
               weeks        36 weekly lessons along the year, a playhead lighting them
               constellation 53 partner schools + one empty, pulsing slot
     FAQ       qcheck       a "?" that resolves into a "✓"
     Research  globe        360°: a dotted sphere with orbit rings
               isolated     classroom and home data as two grey clusters that never meet
               map          dot-matrix world map; data-dots-map="weird" lights the West,
                            "blind" greys it and rings the South Asia / Middle East gap
               skills12     12 mini orbs: 6 cognitive (cyan) + 6 SEL (pink)
               rings        ecological rings around the child
               star         4 data files wired to one subject_id node
               neural       a small neural net, activation pulsing through the layers
               release      open data streaming outward from one source

   Placement (all optional):
     data-dots-pos="x,y"        centre: x = fraction of viewport width, y = fraction of
                                the section's height (kept inside its visible part)
     data-dots-r="0.18"         radius as a fraction of viewport height
     data-dots-anchor="sel"     centre on an element (first match) — split / star use
                                every match (one orb per element)
     data-dots-hub="sel"        star: the subject_id node's element
     data-dots-fit              size from the anchor's box instead of data-dots-r
     data-dots-ay="0.5"         anchor point down the element (0 = top edge)
     data-dots-colors="a,b,c"   green|cyan|yellow|orange|pink
     data-dots-gap="0.14"       split row: distance between orb centres (× vw)
     data-dots-box="x0,y0,x1,y1" scatter/network/dim region, viewport fractions
     data-dots-void="0.2"       dim/scatter: empty circle in the middle (× vh)
     data-dots-avoid="sel"      hide dots that land on these elements
   Page: <main data-dots-count="640"> overrides the dot count.

   .dots-stage elements (css/site.css) reserve room for a formation on desktop.
   FAQ cards fire `tl-dots:burst` ({x,y,w,h,color}) → a burst of their colour.

   Desktop only: skipped below 861px or on coarse pointers. Reduced motion →
   no spin/drift/loops, still follows scroll. ?debug=1 → window.__dotField.
   ─────────────────────────────────────────────────────────────────────────── */

const GATE = '(min-width: 861px) and (pointer: fine)';
if (window.matchMedia && window.matchMedia(GATE).matches) init();

async function init() {
  let THREE;
  try { THREE = await import('../lib/three.module.min.js'); } catch (e) { return; }

  const DEBUG = /[?&]debug=1\b/.test(location.search);
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── visual tuning ─────────────────────────────────────────────────────── */
  const cfg = {
    count: 320,        // dots in the field (page can override via <main data-dots-count>)
    dotSize: 9,        // px diameter at depth 1 (before DPR)
    opacity: 1,        // global alpha cap so dots never fight the text
    lineOpacity: 0.35, // line alpha at full weight
    lineK: 2,          // links per hub dot in a network
    hubEvery: 4,       // every Nth dot is a network hub
    spin: 0.22,        // orb spin, radians per second
    tilt: 0.38,        // orb tilt towards the viewer, radians
    depth: 0.35,       // perspective strength on orbs (front dots bigger/brighter)
    backAlpha: 0.55,   // alpha of the far side of an orb
    drift: 7,          // idle drift amplitude for scatter/network, px
    morphBand: 0.45,   // fraction of viewport height over which a morph plays
    stagger: 0.35,     // how spread out the dots' departure times are (0–0.9)
    dimAlpha: 0.5,     // alpha of the grey dots in "dim" sections
    dimShow: 0.45,     // fraction of dots still lit in "dim" sections
    avoidPad: 16,      // px of clear space kept around text
    flow: 0.07,        // pipeline / release travel speed (cycles per second)
    weekRate: 5,       // weeks timeline: weeks lit per second
    qPeriod: 6.4,      // FAQ ? → ✓ loop length, seconds
    burstCount: 36,    // FAQ flip burst: particles per flip
    burstLife: 0.9,    // FAQ flip burst: seconds
  };
  const AVOID = 'h1,h2,h3,h4,p,li,table,blockquote,.cs__stat,.tl-btn';
  const REGION = { scatter: 1, network: 1, dim: 1, off: 1 };

  /* ── palette (same tokens Home reads) ──────────────────────────────────── */
  const css = getComputedStyle(document.documentElement);
  const hexRGB = (v) => {
    const h = String(v).trim().replace('#', '');
    const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
  };
  const tok = (name, fb) => hexRGB((css.getPropertyValue(name) || '').trim() || fb);
  const NAMED = {
    green:  tok('--tl-dot-1', '#56C02B'),
    cyan:   tok('--tl-dot-2', '#26BDE2'),
    yellow: tok('--tl-dot-3', '#FCC30B'),
    orange: tok('--tl-dot-4', '#F99B1C'),
    pink:   tok('--tl-dot-5', '#E866B0'),
  };
  const PALETTE = [NAMED.green, NAMED.cyan, NAMED.yellow, NAMED.orange, NAMED.pink];
  const GREY = tok('--tl-line-300', '#C7CDD8');
  const WHITE = [1, 1, 1];
  const INK = tok('--tl-ink-900', '#141414');

  /* ── helpers ───────────────────────────────────────────────────────────── */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const frac = (v) => v - Math.floor(v);
  const mix = (p, q, k) => [p[0] + (q[0] - p[0]) * k, p[1] + (q[1] - p[1]) * k, p[2] + (q[2] - p[2]) * k];
  const rng = (seed) => () => {           // mulberry32, deterministic layouts
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const nums = (s, n, fb) => {
    const a = (s || '').split(',').map(parseFloat);
    return a.length === n && a.every((v) => !isNaN(v)) ? a : fb;
  };

  /* ── renderer, camera (screen-pixel ortho, y down) ─────────────────────── */
  const canvas = document.createElement('canvas');
  canvas.id = 'tlDots';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const style = document.createElement('style');
  style.textContent =
    '#tlDots{position:fixed;inset:0;width:100vw;height:100vh;z-index:1;pointer-events:none}' +
    'html.tl-dots .tl-footer{position:relative;z-index:2}';
  document.head.appendChild(style);

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); }
  catch (e) { canvas.remove(); return; }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;   // token hex in, same hex out (lines too)
  document.documentElement.classList.add('tl-dots');

  // Layering: section backgrounds < dots < section content. Lift each
  // section's direct children above the canvas (keeps absolute ones absolute).
  document.querySelectorAll('main > section').forEach((sec) => {
    if (getComputedStyle(sec).position === 'static') sec.style.position = 'relative';
    Array.from(sec.children).forEach((c) => {
      if (getComputedStyle(c).position === 'static') c.style.position = 'relative';
      c.style.zIndex = '2';
    });
  });

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -10, 10);
  let W = 1, H = 1, DPR = 1;

  const N = parseInt((document.querySelector('main') || {}).dataset?.dotsCount, 10) || cfg.count;
  const pointsMat = () => new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uDpr: { value: 1 } },
    vertexShader: `
      attribute vec3 aColor; attribute float aAlpha; attribute float aSize;
      uniform float uDpr; varying vec3 vC; varying float vA;
      void main() {
        vC = aColor; vA = aAlpha;
        gl_PointSize = aSize * uDpr;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vC; varying float vA;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(vC, vA * smoothstep(0.5, 0.40, d));
      }`,
  });
  function makePoints(n, order) {
    const g = new THREE.BufferGeometry();
    const buf = { P: new Float32Array(n * 3), C: new Float32Array(n * 3), A: new Float32Array(n), S: new Float32Array(n) };
    g.setAttribute('position', new THREE.BufferAttribute(buf.P, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(buf.C, 3));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(buf.A, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(buf.S, 1));
    const m = pointsMat();
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    pts.renderOrder = order;
    scene.add(pts);
    buf.geo = g; buf.mat = m;
    buf.dirty = () => ['position', 'aColor', 'aAlpha', 'aSize'].forEach((k) => { g.attributes[k].needsUpdate = true; });
    return buf;
  }
  const field = makePoints(N, 2);
  const { P, C: COL, A: ALPHA, S: SIZE } = field;

  /* ── per-dot constants ─────────────────────────────────────────────────── */
  const R0 = rng(11);
  const BALL = new Float32Array(N * 3);   // unit ball, filled
  const SHELL = new Float32Array(N * 3);  // unit sphere surface
  const PHASE = new Float32Array(N);      // drift / flow phase
  const LEAVE = new Float32Array(N);      // morph departure order 0..1
  const RND = new Float32Array(N * 2);    // two spare randoms per dot
  const LIT = new Uint8Array(N);          // still lit in "dim"
  for (let i = 0; i < N; i++) {
    const k = i + 0.5, phi = Math.acos(1 - 2 * k / N), th = Math.PI * (1 + Math.sqrt(5)) * k;
    const sx = Math.cos(th) * Math.sin(phi), sy = Math.cos(phi), sz = Math.sin(th) * Math.sin(phi);
    const r = Math.cbrt(0.15 + 0.85 * R0());
    BALL[i * 3] = sx * r; BALL[i * 3 + 1] = sy * r; BALL[i * 3 + 2] = sz * r;
    SHELL[i * 3] = sx; SHELL[i * 3 + 1] = sy; SHELL[i * 3 + 2] = sz;
    PHASE[i] = R0() * Math.PI * 2;
    LEAVE[i] = R0();
    RND[i * 2] = R0(); RND[i * 2 + 1] = R0();
    LIT[i] = R0() < cfg.dimShow ? 1 : 0;
  }
  // jittered grid in [0,1]² for region formations, assigned in shuffled order
  const GRID = new Float32Array(N * 2);
  {
    const g = Math.ceil(Math.sqrt(N)), order = Array.from({ length: N }, (_, i) => i);
    for (let i = N - 1; i > 0; i--) { const j = Math.floor(R0() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    for (let c = 0; c < N; c++) {
      const i = order[c];
      GRID[i * 2] = ((c % g) + 0.15 + 0.7 * R0()) / g;
      GRID[i * 2 + 1] = (Math.floor(c / g) + 0.15 + 0.7 * R0()) / Math.ceil(N / g);
    }
  }

  /* ── the child silhouette (assets/Student Outline.svg, same as Home) ───── */
  // KID[i] = unit point (x, y up, height 2) — first 42% outline, rest filled interior
  let KID = null;
  const KID_OUTLINE = Math.round(N * 0.42);
  (async () => {
    try {
      const svg = await (await fetch(new URL('../assets/Student Outline.svg', import.meta.url))).text();
      const d = (svg.match(/<path[^>]*\sd="([^"]+)"/i) || [])[1];
      if (!d) return;
      const NS = 'http://www.w3.org/2000/svg';
      const host = document.createElementNS(NS, 'svg');
      host.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden;visibility:hidden');
      const path = document.createElementNS(NS, 'path');
      path.setAttribute('d', d);
      host.appendChild(path);
      document.body.appendChild(host);
      const bb = path.getBBox(), L = path.getTotalLength();
      const sc = 2 / bb.height, cx = bb.x + bb.width / 2, cy = bb.y + bb.height / 2;
      const out = new Float32Array(N * 2), r = rng(5);
      const put = (i, px, py) => { out[i * 2] = (px - cx) * sc; out[i * 2 + 1] = -(py - cy) * sc; };
      for (let i = 0; i < KID_OUTLINE; i++) {
        const p = path.getPointAtLength((i / KID_OUTLINE) * L);
        put(i, p.x, p.y);
      }
      const pt = host.createSVGPoint();
      for (let i = KID_OUTLINE, guard = 0; i < N && guard < N * 60; guard++) {
        pt.x = bb.x + r() * bb.width; pt.y = bb.y + r() * bb.height;
        if (path.isPointInFill(pt)) put(i++, pt.x, pt.y);
      }
      host.remove();
      KID = out;
      kick();
    } catch (e) { /* orb fallback stays */ }
  })();

  /* ── dot-matrix world map (stylised; ~5.5° cells) ──────────────────────── */
  // [lon, lat] rings, deliberately coarse — reads as "the world", not geography
  const CONTINENTS = [
    [[-168,66],[-160,70],[-140,70],[-120,73],[-95,75],[-80,73],[-65,60],[-55,52],[-66,45],[-70,42],[-76,35],[-81,30],[-80,25],[-82,28],[-90,29],[-97,26],[-97,20],[-90,16],[-84,10],[-80,8],[-78,9],[-85,14],[-92,15],[-105,20],[-110,24],[-115,30],[-118,34],[-124,40],[-124,48],[-132,55],[-140,60],[-152,58],[-165,60]],
    [[-55,60],[-45,60],[-20,70],[-20,80],[-60,82],[-72,78],[-55,70]],
    [[-80,8],[-75,11],[-62,11],[-50,2],[-35,-6],[-38,-13],[-40,-22],[-48,-28],[-58,-38],[-65,-42],[-68,-52],[-72,-53],[-75,-45],[-73,-35],[-71,-25],[-70,-18],[-76,-14],[-81,-5],[-80,0]],
    [[-10,36],[-9,43],[-2,44],[-5,48],[-1,50],[5,53],[8,57],[5,62],[12,66],[20,70],[30,71],[40,67],[45,68],[60,68],[60,55],[50,47],[40,45],[30,45],[28,41],[22,40],[20,37],[15,38],[12,44],[8,44],[3,42],[0,39],[-6,36]],
    [[-6,50],[2,51],[0,54],[-2,58],[-6,58],[-5,54],[-3,52]],
    [[-17,21],[-17,14],[-12,8],[-8,4],[5,5],[9,4],[9,-1],[12,-6],[13,-12],[12,-18],[15,-27],[18,-34],[25,-34],[32,-29],[35,-24],[40,-15],[40,-10],[39,-5],[42,0],[51,12],[44,11],[38,18],[33,28],[32,31],[25,32],[20,32],[10,34],[10,37],[0,36],[-6,35],[-10,30],[-13,27]],
    [[35,30],[35,33],[36,36],[44,37],[48,30],[50,27],[56,26],[57,22],[52,17],[45,13],[43,17],[39,22],[34,28]],
    [[40,45],[50,47],[60,55],[60,68],[70,73],[90,76],[110,77],[130,72],[150,71],[170,70],[180,68],[178,63],[162,60],[156,51],[141,53],[140,48],[135,43],[129,40],[127,35],[122,37],[121,31],[118,24],[110,21],[108,16],[109,12],[105,9],[102,13],[100,10],[103,1],[98,8],[98,16],[94,19],[92,22],[88,22],[85,20],[80,15],[78,8],[76,10],[73,18],[72,21],[68,24],[62,25],[57,26],[56,28],[52,28],[48,30],[44,37],[36,37],[36,40],[40,42]],
    [[130,31],[135,34],[141,36],[142,40],[141,45],[145,44],[140,38],[136,36]],
    [[109,1],[117,7],[119,5],[117,-4],[110,-3]],
    [[95,5],[98,4],[106,-6],[104,-5]],
    [[131,-1],[141,-3],[150,-10],[142,-9],[135,-4]],
    [[114,-22],[122,-18],[130,-12],[137,-12],[142,-11],[146,-19],[153,-26],[151,-34],[146,-39],[138,-35],[131,-31],[124,-34],[115,-34],[114,-26]],
    [[172,-35],[178,-38],[175,-41],[171,-45],[167,-46],[174,-41]],
    [[44,-25],[48,-14],[50,-16],[47,-25]],
  ];
  const MAP = { lon0: -170, lon1: 180, lat0: -56, lat1: 80 };
  let LAND = null;   // { lon, lat, west, gap } per dot (null cell = hidden dot)
  function buildLand() {
    const inside = (x, y, poly) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    // pick the cell size that lands closest to N cells
    let cells = [];
    for (let step = 9; step >= 3.4; step -= 0.2) {
      cells = [];
      for (let lat = MAP.lat1 - step / 2; lat > MAP.lat0; lat -= step) {
        for (let lon = MAP.lon0 + step / 2; lon < MAP.lon1; lon += step) {
          if (CONTINENTS.some((p) => inside(lon, lat, p))) cells.push([lon, lat]);
        }
      }
      if (cells.length >= N * 0.92) break;
    }
    const pick = cells.length > N ? Array.from({ length: N }, (_, i) => cells[Math.floor(i * cells.length / N)]) : cells;
    LAND = Array.from({ length: N }, (_, i) => {
      const c = pick[i];
      if (!c) return null;
      const [lon, lat] = c;
      const west = (lon < -50 && lat > 12) || (lon > -12 && lon < 40 && lat > 35) || (lon > 110 && lat < -10);
      const gap = lon > 34 && lon < 93 && lat > 4 && lat < 42;
      return { lon, lat, west, gap };
    });
  }

  /* ── formations from the markup ────────────────────────────────────────── */
  let formations = [];
  function readFormations() {
    formations.forEach((f) => f.lines && scene.remove(f.lines));
    formations = Array.from(document.querySelectorAll('main section[data-dots]')).map((el) => {
      const d = el.dataset;
      const f = {
        el, type: d.dots,
        pos: nums(d.dotsPos, 2, [0.5, 0.5]),
        r: parseFloat(d.dotsR) || 0.18,
        rSet: !!d.dotsR,
        fit: d.dotsFit !== undefined,
        anchor: d.dotsAnchor ? el.querySelector(d.dotsAnchor) : null,
        anchors: d.dotsAnchor ? Array.from(el.querySelectorAll(d.dotsAnchor)) : [],
        hub: d.dotsHub ? el.querySelector(d.dotsHub) : null,
        ay: d.dotsAy !== undefined ? parseFloat(d.dotsAy) : 0.5,
        colors: (d.dotsColors || 'green,cyan,yellow,orange,pink').split(',').map((s) => NAMED[s.trim()] || NAMED.cyan),
        gap: parseFloat(d.dotsGap) || 0.14,
        box: nums(d.dotsBox, 4, [0, 0, 1, 1]),
        voidR: parseFloat(d.dotsVoid) || 0,
        map: d.dotsMap || 'weird',
        avoid: d.dotsAvoid || AVOID,
        avoidOn: !!REGION[d.dots] || !!d.dotsAvoid,
        lines: null, pairs: null,
        x: new Float32Array(N), y: new Float32Array(N),
        c: new Float32Array(N * 3), a: new Float32Array(N), s: new Float32Array(N),
      };
      (BUILD[f.type] || (() => {}))(f);
      return f;
    });
  }

  function makeLines(f, pairs) {
    f.pairs = pairs;
    const lg = new THREE.BufferGeometry();
    lg.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pairs.length * 3), 3));
    lg.setAttribute('color', new THREE.BufferAttribute(new Float32Array(pairs.length * 3), 3));
    f.lines = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({
      vertexColors: true, transparent: true, opacity: 0, depthTest: false, depthWrite: false }));
    f.lines.frustumCulled = false;
    f.lines.renderOrder = 1;
    scene.add(f.lines);
  }
  // k nearest links among a set of dot indices, measured on unit coords (ux, uy)
  function nearPairs(ids, ux, uy, k, sx = 1, sy = 1) {
    const seen = new Set(), pairs = [];
    ids.forEach((i) => {
      ids.filter((j) => j !== i).map((j) => {
        const dx = (ux(i) - ux(j)) * sx, dy = (uy(i) - uy(j)) * sy;
        return [dx * dx + dy * dy, j];
      }).sort((p, q) => p[0] - q[0]).slice(0, k).forEach(([, j]) => {
        const key = i < j ? i + ':' + j : j + ':' + i;
        if (!seen.has(key)) { seen.add(key); pairs.push(i, j); }
      });
    });
    return pairs;
  }

  /* per-type one-off setup (index groups, line pairs) */
  const STARS = 53;
  const BUILD = {
    network(f) {
      const [x0, y0, x1, y1] = f.box, hubs = [];
      for (let i = 0; i < N; i += cfg.hubEvery) hubs.push(i);
      makeLines(f, nearPairs(hubs, (i) => GRID[i * 2], (i) => GRID[i * 2 + 1], cfg.lineK, (x1 - x0) * W, (y1 - y0) * H));
    },
    bars(f) {
      // trend line across the tops of the three bars
      const per = Math.floor(N / 3), cols = 6, tops = [];
      for (let b = 0; b < 3; b++) {
        const n = b === 2 ? N - per * 2 : per, rows = Math.ceil(n / cols);
        tops.push(b * per + Math.min(n - 1, (rows - 1) * cols + 2));
      }
      makeLines(f, [tops[0], tops[1], tops[1], tops[2]]);
    },
    constellation(f) {
      const ids = Array.from({ length: Math.min(STARS, N) }, (_, i) => i);
      const u = (i) => starXY(i);
      makeLines(f, nearPairs(ids, (i) => u(i)[0], (i) => u(i)[1], 2));
    },
    star(f) {
      // each data file wired to the subject_id hub by a small bundle of links
      const pairs = [], hub = (i) => i < Math.round(N * 0.16);
      const hubIds = [], files = [[], [], [], []];
      for (let i = 0; i < N; i++) hub(i) ? hubIds.push(i) : files[i % 4].push(i);
      files.forEach((ids, g) => { for (let k = 0; k < 5; k++) pairs.push(hubIds[(g * 5 + k * 3) % hubIds.length], ids[k * 7 % ids.length]); });
      makeLines(f, pairs);
    },
    neural(f) {
      const pairs = [], first = neuralNodes().first;
      NEURAL.forEach((n, l) => {
        if (l === NEURAL.length - 1) return;
        for (let a = 0; a < n; a++) for (let b = 0; b < NEURAL[l + 1]; b++) pairs.push(first[l][a], first[l + 1][b]);
      });
      makeLines(f, pairs);
    },
    map() { if (!LAND) buildLand(); },
  };

  // constellation star positions in unit polar space (deterministic)
  const starXY = (i) => {
    const r = rng(300 + i), ang = (62 + r() * 308) * Math.PI / 180, rad = 0.62 + r() * 0.38;  // keep 10°–62° (upper right) free for the slot
    return [Math.cos(ang) * rad, Math.sin(ang) * rad];
  };
  // neural net: dots per node, first dot index of each node (line anchors)
  const NEURAL = [4, 6, 6, 3];
  let NN = null;
  function neuralNodes() {
    if (NN) return NN;
    const total = NEURAL.reduce((a, b) => a + b, 0), per = Math.floor(N / total);
    const node = new Int16Array(N).fill(-1), layer = new Int8Array(N), slot = new Int16Array(N), first = [];
    let i = 0;
    NEURAL.forEach((n, l) => {
      first.push([]);
      for (let k = 0; k < n; k++) {
        first[l].push(i);
        for (let m = 0; m < per; m++, i++) { node[i] = k; layer[i] = l; slot[i] = m; }
      }
    });
    NN = { per, node, layer, slot, first };
    return NN;
  }

  /* ── placement ─────────────────────────────────────────────────────────── */
  // centre + half-extents on screen; kept inside the visible part of the section
  function place(f, rect) {
    if (f.anchor) {
      const b = f.anchor.getBoundingClientRect();
      const R = f.rSet ? f.r * H : Math.min(b.width, b.height) * 0.42;
      return { cx: b.left + b.width / 2, cy: b.top + b.height * f.ay,
        rx: f.fit ? b.width / 2 : R, ry: f.fit ? b.height / 2 : R, b };
    }
    const R = f.r * H;
    let cy = rect.top + f.pos[1] * rect.height;
    const lo = Math.max(rect.top, 0) + R, hi = Math.min(rect.bottom, H) - R;
    cy = lo < hi ? clamp(cy, lo, hi) : (Math.max(rect.top, 0) + Math.min(rect.bottom, H)) / 2;
    return { cx: f.pos[0] * W, cy, rx: R, ry: R };
  }

  /* ── drawing ───────────────────────────────────────────────────────────── */
  let X, Y, Cc, Aa, Ss;               // the formation being written
  const col = (i, rgb) => { Cc[i * 3] = rgb[0]; Cc[i * 3 + 1] = rgb[1]; Cc[i * 3 + 2] = rgb[2]; };
  const dot = (i, x, y, rgb, a = 1, s = 1) => { X[i] = x; Y[i] = y; col(i, rgb); Aa[i] = a; Ss[i] = cfg.dotSize * s; };
  const hide = (i, x, y) => { X[i] = x; Y[i] = y; Aa[i] = 0; Ss[i] = cfg.dotSize * 0.5; col(i, GREY); };
  // a point on a spinning, tilted ball (src = BALL filled / SHELL surface)
  function orbDot(i, cx, cy, R, ang, rgb, sMul = 1, src = BALL) {
    const bx = src[i * 3], by = src[i * 3 + 1], bz = src[i * 3 + 2];
    const ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(cfg.tilt), st = Math.sin(cfg.tilt);
    const rx = bx * ca + bz * sa, rz0 = -bx * sa + bz * ca;
    const ry = by * ct - rz0 * st, rz = by * st + rz0 * ct;
    const k = 1 + rz * cfg.depth;
    dot(i, cx + rx * R * k, cy - ry * R * k, rgb, cfg.backAlpha + (1 - cfg.backAlpha) * (rz + 1) / 2, k * sMul);
  }
  // sample points along a polyline (unit coords), with a little stroke thickness
  function strokePts(lines, n, thick, seed) {
    const segs = [];
    let total = 0;
    lines.forEach((pl) => { for (let k = 1; k < pl.length; k++) {
      const [ax, ay] = pl[k - 1], [bx, by] = pl[k], L = Math.hypot(bx - ax, by - ay);
      segs.push([ax, ay, bx, by, L, total]); total += L;
    } });
    const r = rng(seed), out = [];
    for (let m = 0; m < n; m++) {
      const d = ((m + 0.5) / n) * total, sg = segs.find((s) => d <= s[5] + s[4]) || segs[segs.length - 1];
      const t = (d - sg[5]) / sg[4], nx = -(sg[3] - sg[1]) / sg[4], ny = (sg[2] - sg[0]) / sg[4], j = (r() - 0.5) * thick;
      out.push([sg[0] + (sg[2] - sg[0]) * t + nx * j, sg[1] + (sg[3] - sg[1]) * t + ny * j]);
    }
    return out;
  }
  const arcPts = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, k) => {
    const a = a0 + (a1 - a0) * k / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r];
  });
  // FAQ glyphs, unit coords (y up)
  let QPTS = null, CPTS = null;
  function glyphs() {
    if (QPTS) return;
    const dotN = Math.round(N * 0.14), r = rng(42);
    const hook = arcPts(0, 0.38, 0.36, Math.PI * 0.9, -Math.PI * 0.22, 14).concat([[0.06, 0.02], [0.03, -0.3]]);
    QPTS = strokePts([hook], N - dotN, 0.1, 7);
    for (let m = 0; m < dotN; m++) {                    // the full stop
      const a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.1;
      QPTS.push([0.03 + Math.cos(a) * rr, -0.64 + Math.sin(a) * rr]);
    }
    CPTS = strokePts([[[-0.62, 0.04], [-0.16, -0.46], [0.68, 0.6]]], N, 0.12, 9);
  }

  const DRAW = {
    orb(f, p, t) {
      for (let i = 0; i < N; i++) orbDot(i, p.cx, p.cy, p.rx, t * cfg.spin, PALETTE[i % 5]);
    },
    split(f, p, t, rect) {
      const k = f.colors.length;
      const at = f.anchors.length >= k
        ? f.anchors.slice(0, k).map((el) => {
            const b = el.getBoundingClientRect();
            return [b.left + b.width / 2, b.top + b.height * f.ay, f.r * H];
          })
        : (() => {
            const q = place({ ...f, anchor: null }, rect), Rg = q.rx * Math.pow(k, -1 / 3) * 1.15;
            return f.colors.map((_, g) => [q.cx + (g - (k - 1) / 2) * f.gap * W, q.cy, Rg]);
          })();
      for (let i = 0; i < N; i++) { const g = i % k; orbDot(i, at[g][0], at[g][1], at[g][2], t * cfg.spin + g * 1.7, f.colors[g]); }
    },
    helix(f, p, t) {
      for (let i = 0; i < N; i++) {
        const u = (i >> 1) / (N >> 1) * 2 - 1, ang = u * Math.PI * 3 + t * cfg.spin * 2 + (i & 1) * Math.PI;
        const z = Math.sin(ang), k = 1 + z * cfg.depth;
        dot(i, p.cx + Math.cos(ang) * p.rx * 0.35, p.cy + u * p.ry, PALETTE[i % 5], cfg.backAlpha + (1 - cfg.backAlpha) * (z + 1) / 2, k);
      }
    },

    /* RESULTS ─ the whole child */
    child(f, p, t) {
      if (!KID) return DRAW.orb(f, p, t);
      const R = p.ry, br = 1 + 0.012 * Math.sin(t * 1.4), sway = Math.sin(t * 0.7) * 0.03;
      for (let i = 0; i < N; i++) {
        const ux = KID[i * 2], uy = KID[i * 2 + 1], out = i < KID_OUTLINE;
        dot(i, p.cx + (ux + sway * uy) * R * br, p.cy - uy * R * br, PALETTE[i % 5], out ? 1 : 0.85, out ? 0.8 : 1);
      }
    },
    /* RESULTS ─ Measure → Ask → Intervene: scattered data, gathered insight, rising action */
    pipeline(f, p, t) {
      const head = Math.round(N * 0.1), core = Math.round(N * 0.24), flowN = N - head - core;
      const ox = p.cx, oy = p.cy, R = Math.min(p.ry * 0.85, p.rx * 0.2);
      for (let m = 0; m < core; m++) {                   // the insight orb itself, always there
        orbDot(flowN + head + m, ox, oy, R, t * cfg.spin * 2, NAMED.cyan, 1);
      }
      const ex = p.cx + p.rx * 0.9, ey = p.cy - p.ry * 0.78, kx = p.cx + p.rx * 0.48, ky = oy;
      for (let i = 0; i < flowN; i++) {
        const ph = frac(i / flowN + RND[i * 2] * 0.02 + t * cfg.flow);
        if (ph < 0.38) {                                 // raw data drifts in from the left
          const s = smooth(ph / 0.38);
          const sx = p.cx - p.rx * (1 - RND[i * 2] * 0.5), sy = p.cy + (RND[i * 2 + 1] * 2 - 1) * p.ry * 0.9;
          const bx = ox + BALL[i * 3] * R, by = oy - BALL[i * 3 + 1] * R;
          dot(i, sx + (bx - sx) * s, sy + (by - sy) * s, mix(NAMED.green, NAMED.cyan, s), clamp(ph / 0.05), 0.85);
        } else if (ph < 0.56) {                          // insight: the orb
          orbDot(i, ox, oy, R, t * cfg.spin * 3, NAMED.cyan, 0.95);
        } else {                                         // action: a rising arrow
          const s = (ph - 0.56) / 0.44, u = 1 - s, j = (RND[i * 2 + 1] - 0.5) * p.ry * 0.12;
          dot(i, u * u * ox + 2 * u * s * kx + s * s * ex, u * u * oy + 2 * u * s * ky + s * s * ey + j,
            mix(NAMED.cyan, NAMED.yellow, smooth(s)), clamp((1 - s) / 0.08), 0.95);
        }
      }
      const tx = ex - kx, ty = ey - ky, tl = Math.hypot(tx, ty), dx = tx / tl, dy = ty / tl, L = p.ry * 0.55;
      for (let m = 0; m < head; m++) {                   // arrowhead chevron
        const side = m % 2 ? 1 : -1, k = (Math.floor(m / 2) + 1) / Math.ceil(head / 2);
        const ang = Math.atan2(dy, dx) + Math.PI + side * 0.6;
        dot(flowN + m, ex + Math.cos(ang) * L * k, ey + Math.sin(ang) * L * k, NAMED.yellow, 1, 1.05);
      }
    },
    /* RESULTS ─ Hippocampus: three years of growth, the growth slice in pink */
    bars(f, p, t) {
      const per = Math.floor(N / 3), cols = 6, base = p.cy + p.ry * 0.78, maxH = p.ry * 1.5;
      const hs = [0.55, 0.75, 0.96].map((v) => v * maxH), bw = p.rx * 0.34;
      for (let b = 0; b < 3; b++) {
        const n = b === 2 ? N - per * 2 : per, rows = Math.ceil(n / cols), bx = p.cx + (b - 1) * p.rx * 0.56;
        for (let m = 0; m < n; m++) {
          const i = b * per + m, r = Math.floor(m / cols), c = m % cols;
          const y = base - (r + 0.5) * hs[b] / rows, grown = b > 0 && base - y > hs[b - 1];
          dot(i, bx - bw / 2 + (c + 0.5) * bw / cols, y, grown ? NAMED.pink : NAMED.green,
            0.82 + 0.18 * Math.sin(t * 2 + PHASE[i]), grown ? 1.05 : 0.9);
        }
      }
    },
    /* RESULTS ─ NMAJS: three independent lenses, the child where they overlap */
    venn(f, p, t) {
      const R = Math.min(p.rx, p.ry) * 0.95, d = R * 0.34, rc = R * 0.6, rot = t * 0.12;
      const ring = Math.round(N * 0.72), per = Math.floor(ring / 3), lens = [NAMED.green, NAMED.cyan, NAMED.orange];
      for (let i = 0; i < N; i++) {
        if (i < per * 3) {
          const g = i % 3, m = Math.floor(i / 3), th = Math.PI / 2 + g * Math.PI * 2 / 3 + rot;
          const ccx = p.cx + Math.cos(th) * d, ccy = p.cy - Math.sin(th) * d;
          const a = (m / per) * Math.PI * 2 + t * 0.25, rr = rc + (RND[i * 2] - 0.5) * R * 0.05;
          dot(i, ccx + Math.cos(a) * rr, ccy - Math.sin(a) * rr, lens[g], 0.9, 0.8);
        } else {
          const a = RND[i * 2] * Math.PI * 2, rr = Math.sqrt(RND[i * 2 + 1]) * (rc - d) * 0.75, pulse = 1 + 0.06 * Math.sin(t * 2);
          dot(i, p.cx + Math.cos(a) * rr * pulse, p.cy + Math.sin(a) * rr * pulse, PALETTE[i % 5], 1, 1.15);
        }
      }
    },
    /* RESULTS ─ Musaeus: plan → see the data → redesign, round and round */
    loop(f, p, t) {
      const R = Math.min(p.rx, p.ry) * 0.8, nodeN = Math.round(N * 0.12);
      const stops = [Math.PI / 2, -Math.PI / 6, Math.PI * 7 / 6], tint = [NAMED.pink, NAMED.cyan, NAMED.green];
      for (let i = 0; i < N; i++) {
        if (i < nodeN * 3) {
          const g = i % 3, a = stops[g];
          orbDot(i, p.cx + Math.cos(a) * R, p.cy - Math.sin(a) * R, R * 0.17, t * cfg.spin + g, tint[g], 0.9);
        } else {
          const a0 = ((i - nodeN * 3) / (N - nodeN * 3)) * Math.PI * 2, a = a0 - t * 0.6, rr = R + (RND[i * 2] - 0.5) * R * 0.1;
          const seg = Math.floor(frac((Math.PI / 2 - a) / (Math.PI * 2)) * 3) % 3;   // last stop passed
          dot(i, p.cx + Math.cos(a) * rr, p.cy - Math.sin(a) * rr, tint[seg], 0.75, 0.75);
        }
      }
    },
    /* RESULTS ─ "9 in 10 children improved": ten children, nine lit */
    tenkids(f, p, t) {
      const cw = (p.rx * 2) / 5, chH = Math.min(p.ry * 0.8, cw * 1.2) / 2, greyK = 7;
      for (let i = 0; i < N; i++) {
        const k = i % 10, m = Math.floor(i / 10), per = Math.ceil(N / 10);
        const kx = p.cx - p.rx + (k % 5 + 0.5) * cw, ky = p.cy + (k < 5 ? -0.5 : 0.5) * p.ry + Math.sin(t * 1.5 + k) * 2;
        const lit = k !== greyK, rgb = lit ? PALETTE[k % 5] : GREY;
        if (KID) {
          const src = Math.floor((m / per) * KID_OUTLINE);  // walk the outline: reads as a child at this size
          dot(i, kx + KID[src * 2] * chH, ky - KID[src * 2 + 1] * chH, rgb, lit ? 1 : 0.7, 0.75);
        } else {
          orbDot(i, kx, ky, chH * 0.8, t * cfg.spin + k, rgb, 0.7);
        }
      }
    },
    /* RESULTS ─ the year: 36 weekly lessons, three terms, a playhead lighting them */
    weeks(f, p, t) {
      const b = p.b || { left: p.cx - p.rx, width: p.rx * 2, top: p.cy };
      const x0 = b.left + b.width * 0.12, x1 = b.left + b.width * 0.88, y = b.top + 10;
      const head = reduced ? 36 : (t * cfg.weekRate) % 42, termRGB = [NAMED.green, NAMED.cyan, NAMED.pink];
      for (let i = 0; i < N; i++) {
        if (i < 36) {
          const x = x0 + (x1 - x0) * i / 35, end = i % 12 === 11, lit = i < head;
          dot(i, x, y, lit ? termRGB[Math.floor(i / 12)] : GREY, 1,
            (end ? 1.9 : 0.85) * (lit && head - i < 1 ? 1.4 : 1));
        } else hide(i, x0 + (x1 - x0) * clamp(head / 36), y);
      }
    },
    /* RESULTS ─ 53 partner schools, and an empty slot for the next story */
    constellation(f, p, t) {
      const R = p.rx, sa = Math.PI * 0.2, sx = p.cx + Math.cos(sa) * R * 0.8, sy = p.cy - Math.sin(sa) * R * 0.8;
      const ringN = Math.min(26, N - STARS), pulse = 1 + 0.12 * Math.sin(t * 2.2);
      for (let i = 0; i < N; i++) {
        if (i < STARS) {
          const [ux, uy] = starXY(i);
          dot(i, p.cx + ux * R, p.cy - uy * R, PALETTE[i % 5], 0.75 + 0.25 * Math.sin(t * 1.3 + PHASE[i]), 0.9);
        } else if (i < STARS + ringN) {
          const a = ((i - STARS) / ringN) * Math.PI * 2 + t * 0.4, rr = R * 0.12 * pulse;
          dot(i, sx + Math.cos(a) * rr, sy + Math.sin(a) * rr, NAMED.pink, (i % 2 ? 1 : 0.45) * (0.7 + 0.3 * Math.sin(t * 2.2)), 0.75);
        } else hide(i, sx, sy);
      }
    },

    /* FAQ ─ "Questions, answered": a ? that resolves into a ✓ */
    qcheck(f, p, t) {
      glyphs();
      const ph = reduced ? cfg.qPeriod * 0.6 : t % cfg.qPeriod, P_ = cfg.qPeriod;
      const m = smooth(clamp((ph - P_ * 0.375) / (P_ * 0.125))) * (1 - smooth(clamp((ph - P_ * 0.875) / (P_ * 0.125))));
      for (let i = 0; i < N; i++) {
        const k = smooth(clamp((m * 1.3 - LEAVE[i] * 0.3)));
        const ux = QPTS[i][0] + (CPTS[i][0] - QPTS[i][0]) * k, uy = QPTS[i][1] + (CPTS[i][1] - QPTS[i][1]) * k;
        dot(i, p.cx + ux * p.rx, p.cy - uy * p.ry, mix(PALETTE[i % 5], NAMED.green, k), 1, 0.95);
      }
    },

    /* RESEARCH ─ 360°: a dotted globe with orbit rings */
    globe(f, p, t) {
      const shellN = Math.round(N * 0.7), ringN = N - shellN;
      for (let i = 0; i < N; i++) {
        if (i < shellN) { orbDot(i, p.cx, p.cy, p.rx, t * cfg.spin, PALETTE[i % 5], 0.85, SHELL); continue; }
        const m = i - shellN, g = m % 2, a = (m / ringN) * Math.PI * 4 + t * 0.5 * (g ? -1 : 1);
        const tilt = g ? 0.5 : -0.9, x = Math.cos(a) * 1.3, z = Math.sin(a) * 1.3;
        const y = z * Math.sin(tilt), zz = z * Math.cos(tilt), k = 1 + zz * cfg.depth * 0.6;
        dot(i, p.cx + x * p.rx * k, p.cy - y * p.rx * k, NAMED.cyan, 0.45 + 0.4 * (zz + 1.3) / 2.6, 0.7 * k);
      }
    },
    /* RESEARCH ─ isolated data: classroom and home, never triangulated */
    isolated(f, p, t, rect) {
      // two clusters on the stage under the cards; links reach out and die before they meet
      const orbN = Math.round(N * 0.34), bridgeN = Math.round(N * 0.12);
      const R = Math.min(p.ry * 0.75, 0.05 * W), lx = p.cx - p.rx * 0.42, rx = p.cx + p.rx * 0.42, cy = p.cy;
      for (let i = 0; i < N; i++) {
        if (i < orbN * 2) {
          orbDot(i, i % 2 ? rx : lx, cy, R, t * cfg.spin + (i % 2), GREY, 0.85);
          Aa[i] *= 0.8;
        } else if (i < orbN * 2 + bridgeN) {               // reach for the other side… and fade out
          const ph = frac(RND[i * 2] + t * 0.12), side = i % 2, sx = side ? rx : lx, dir = side ? -1 : 1;
          dot(i, sx + dir * (R + ph * ((rx - lx) / 2 - R) * 0.85), cy + (RND[i * 2 + 1] - 0.5) * R * 1.2, GREY, (1 - ph) * (1 - ph) * 0.8, 0.7);
        } else {
          dot(i, GRID[i * 2] * W, GRID[i * 2 + 1] * H, GREY, LIT[i] ? 0.22 : 0, 0.6);
        }
      }
    },
    /* RESEARCH ─ the world: W.E.I.R.D. lights the West; the blind spot rings the gap */
    map(f, p, t) {
      if (!LAND) buildLand();
      const spanLon = MAP.lon1 - MAP.lon0, spanLat = MAP.lat1 - MAP.lat0;
      const sc = Math.min((p.rx * 2) / spanLon, (p.ry * 2) / spanLat);
      const px = (lon) => p.cx + (lon - (MAP.lon0 + MAP.lon1) / 2) * sc;
      const py = (lat) => p.cy - (lat - (MAP.lat0 + MAP.lat1) / 2) * sc;
      const gx = px(63.5), gy = py(23), gr = 30 * sc, blind = f.map === 'blind';
      let gi = 0, gN = 0;
      if (blind) LAND.forEach((c) => { if (c && c.gap) gN++; });
      for (let i = 0; i < N; i++) {
        const c = LAND[i];
        if (!c) { hide(i, p.cx, p.cy); continue; }
        if (!blind) {
          const tw = c.west ? 0.85 + 0.15 * Math.sin(t * 2 + PHASE[i]) : 0.6;
          dot(i, px(c.lon), py(c.lat), c.west ? PALETTE[i % 5] : GREY, tw, c.west ? 1 : 0.7);
        } else if (c.gap) {                               // the blind spot: an empty, pulsing ring
          const a = (gi++ / gN) * Math.PI * 2 + t * 0.25, pr = gr * (1 + 0.06 * Math.sin(t * 2));
          dot(i, gx + Math.cos(a) * pr, gy + Math.sin(a) * pr, WHITE, 0.55 + 0.4 * Math.sin(t * 2 + a * 2), 0.75);
        } else {
          dot(i, px(c.lon), py(c.lat), GREY, 0.32, 0.7);
        }
      }
    },
    /* RESEARCH ─ 12 skills: six cognitive orbs (cyan), six SEL orbs (pink) */
    skills12(f, p, t, rect) {
      const top = Math.max(rect.top, 0), bot = Math.min(rect.bottom, H), R = Math.min(0.032 * H, 0.03 * W);
      const y0 = top + (bot - top) * 0.12, y1 = top + (bot - top) * 0.88;
      for (let i = 0; i < N; i++) {
        const g = i % 12, side = g < 6 ? 0 : 1, k = g % 6;
        orbDot(i, side ? W * 0.945 : W * 0.055, y0 + (y1 - y0) * (k + 0.5) / 6, R, t * cfg.spin + g, side ? NAMED.pink : NAMED.cyan, 0.75);
      }
    },
    /* RESEARCH ─ ecological predictors: the child, then classroom, home, community */
    rings(f, p, t) {
      const coreN = Math.round(N * 0.08), ringRGB = [NAMED.cyan, NAMED.green, NAMED.yellow];
      const rxs = [0.022, 0.037, 0.052].map((v) => v * W), rys = [0.075, 0.125, 0.175].map((v) => v * H);
      for (let i = 0; i < N; i++) {
        if (i < coreN) { orbDot(i, p.cx, p.cy, Math.min(0.02 * H, 16), t * cfg.spin, NAMED.pink, 0.85); continue; }
        const m = i - coreN, g = m % 3, per = Math.ceil((N - coreN) / 3), q = Math.floor(m / 3);
        const a = (q / per) * Math.PI * 2 + t * (0.5 - g * 0.13), on = per > 60 ? q % Math.round(per / 48) === 0 : true;
        dot(i, p.cx + Math.cos(a) * rxs[g], p.cy + Math.sin(a) * rys[g], ringRGB[g], on ? 0.9 : 0, 0.8);
      }
    },
    /* RESEARCH ─ four files, one subject_id */
    star(f, p, t) {
      const hubN = Math.round(N * 0.16), files = f.anchors.slice(0, 4).map((el) => el.getBoundingClientRect());
      const hb = f.hub ? f.hub.getBoundingClientRect() : null;
      const hx = hb ? hb.left + hb.width / 2 : p.cx, hy = hb ? hb.top + hb.height / 2 : p.cy - p.ry;
      const fileRGB = f.colors.length >= 4 ? f.colors : [NAMED.pink, NAMED.green, NAMED.cyan, NAMED.orange];
      for (let i = 0; i < N; i++) {
        if (i < hubN) { orbDot(i, hx, hy, Math.min(0.045 * H, 38), t * cfg.spin, PALETTE[i % 5], 0.9); continue; }
        const g = i % 4, b = files[g];
        if (!b) { hide(i, hx, hy); continue; }
        orbDot(i, b.left + b.width / 2, b.top + b.height * f.ay, f.r * H, t * cfg.spin + g * 1.7, fileRGB[g], 0.9);
      }
    },
    /* RESEARCH ─ AI: a small neural net, activation pulsing input → output */
    neural(f, p, t) {
      const nn = neuralNodes(), Lx = Math.min(p.rx, 0.36 * W), layerRGB = [NAMED.green, NAMED.cyan, NAMED.yellow, NAMED.pink];
      const wave = reduced ? -9 : (t * 1.4) % (NEURAL.length + 1.5), R = Math.min(p.ry * 0.13, 13);
      for (let i = 0; i < N; i++) {
        const l = nn.layer[i], k = nn.node[i];
        if (k < 0) { hide(i, p.cx, p.cy); continue; }
        const n = NEURAL[l], nx = p.cx + (l / (NEURAL.length - 1) * 2 - 1) * Lx * 0.85;
        const ny = p.cy + ((k + 0.5) / n - 0.5) * 2 * p.ry * 0.85, act = Math.exp(-((wave - l) ** 2) * 3);
        orbDot(i, nx, ny, R * (1 + 0.25 * act), t * cfg.spin * 2 + k, layerRGB[l], 0.6 + 0.4 * act);
        Aa[i] *= 0.6 + 0.4 * act;
      }
    },
    /* RESEARCH ─ open data, released outward from one source */
    release(f, p, t) {
      const coreN = Math.round(N * 0.25), reach = 0.55 * W;
      for (let i = 0; i < N; i++) {
        if (i < coreN) { orbDot(i, p.cx, p.cy, p.rx, t * cfg.spin, PALETTE[i % 5], 0.9); continue; }
        const th = RND[i * 2] * Math.PI * 2, ph = frac(RND[i * 2 + 1] + t * cfg.flow * 1.3), r = p.rx + ph * reach;
        dot(i, p.cx + Math.cos(th) * r, p.cy + Math.sin(th) * r * 0.8, PALETTE[i % 5], Math.pow(1 - ph, 1.5) * 0.9, 0.8);
      }
    },
  };

  // region formations (scatter / network / dim / off)
  function region(f, t) {
    const [x0, y0, x1, y1] = f.box, dr = reduced ? 0 : cfg.drift;
    for (let i = 0; i < N; i++) {
      let x = (x0 + (x1 - x0) * GRID[i * 2]) * W + Math.sin(t * 0.5 + PHASE[i]) * dr;
      let y = (y0 + (y1 - y0) * GRID[i * 2 + 1]) * H + Math.cos(t * 0.4 + PHASE[i] * 1.3) * dr;
      if (f.voidR) {
        const cx = (x0 + x1) / 2 * W, cy = (y0 + y1) / 2 * H, vr = f.voidR * H;
        const dx = x - cx, dy = y - cy, dd = Math.hypot(dx, dy) || 1;
        if (dd < vr) { const k = (vr + dd * 0.35) / dd; x = cx + dx * k; y = cy + dy * k; }
      }
      if (f.type === 'dim') dot(i, x, y, GREY, LIT[i] ? cfg.dimAlpha : 0, 0.8);
      else dot(i, x, y, PALETTE[i % 5], f.type === 'off' ? 0 : 0.85, 0.8);
    }
  }

  // write formation f's target for every dot at time t
  function layout(f, t) {
    const rect = f.el.getBoundingClientRect();
    X = f.x; Y = f.y; Cc = f.c; Aa = f.a; Ss = f.s;
    if (REGION[f.type]) region(f, t);
    else (DRAW[f.type] || DRAW.orb)(f, place(f, rect), t, rect);
    if (!f.avoidOn) return;
    // text boxes on screen that the dots must stay off
    const keep = [], pad = cfg.avoidPad;
    f.el.querySelectorAll(f.avoid).forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.bottom > -40 && b.top < H + 40 && b.width) keep.push(b);
    });
    if (!keep.length) return;
    for (let i = 0; i < N; i++) {
      if (Aa[i] && keep.some((b) => X[i] > b.left - pad && X[i] < b.right + pad && Y[i] > b.top - pad && Y[i] < b.bottom + pad)) Aa[i] = 0;
    }
  }

  /* ── FAQ flip bursts (separate particles; the field is left alone) ──────── */
  const BMAX = 240, burst = makePoints(BMAX, 3);
  const BV = new Float32Array(BMAX * 2), BL = new Float32Array(BMAX);   // velocity, life left
  let bNext = 0, bAlive = 0;
  document.addEventListener('tl-dots:burst', (e) => {
    if (reduced) return;
    const { x, y, w, h, color } = e.detail || {};
    const rgb = color ? hexRGB(color) : NAMED.pink, cx = x + w / 2, cy = y + h / 2;
    for (let n = 0; n < cfg.burstCount; n++) {
      const k = bNext; bNext = (bNext + 1) % BMAX;
      const edge = Math.random() * 2 * (w + h);       // a point on the card's edge
      let px, py;
      if (edge < w) { px = x + edge; py = y; } else if (edge < w + h) { px = x + w; py = y + edge - w; }
      else if (edge < 2 * w + h) { px = x + 2 * w + h - edge; py = y + h; } else { px = x; py = y + 2 * (w + h) - edge; }
      const dx = px - cx, dy = py - cy, dl = Math.hypot(dx, dy) || 1, sp = 60 + Math.random() * 90;
      burst.P[k * 3] = px; burst.P[k * 3 + 1] = py;
      BV[k * 2] = dx / dl * sp; BV[k * 2 + 1] = dy / dl * sp;
      BL[k] = cfg.burstLife * (0.7 + Math.random() * 0.3);
      burst.C[k * 3] = rgb[0]; burst.C[k * 3 + 1] = rgb[1]; burst.C[k * 3 + 2] = rgb[2];
      burst.S[k] = cfg.dotSize * (0.6 + Math.random() * 0.5);
    }
    bAlive = BMAX;
    kick();
  });
  let bLast = performance.now();
  function stepBursts(now) {
    const dt = Math.min(0.05, (now - bLast) / 1000); bLast = now;
    if (!bAlive) return;
    let any = 0;
    for (let k = 0; k < BMAX; k++) {
      if (BL[k] <= 0) { burst.A[k] = 0; continue; }
      BL[k] -= dt; any = 1;
      burst.P[k * 3] += BV[k * 2] * dt; burst.P[k * 3 + 1] += BV[k * 2 + 1] * dt;
      BV[k * 2] *= 0.95; BV[k * 2 + 1] *= 0.95;
      burst.A[k] = clamp(BL[k] / cfg.burstLife) * 0.95;
    }
    bAlive = any;
    burst.dirty();
  }

  /* ── frame ─────────────────────────────────────────────────────────────── */
  const t0 = performance.now();
  function frame() {
    const now = performance.now();
    stepBursts(now);
    if (!formations.length) { renderer.render(scene, camera); return; }
    const t = reduced ? 0 : (now - t0) / 1000;
    const mid = H * 0.5;

    // active pair: the last section whose top has passed mid-screen, and the next
    let ai = 0;
    for (let i = 0; i < formations.length; i++) {
      if (formations[i].el.getBoundingClientRect().top <= mid) ai = i;
    }
    const A = formations[ai], B = formations[ai + 1];
    let w = 0;
    if (B) {
      const edge = B.el.getBoundingClientRect().top, band = cfg.morphBand * H;
      w = smooth(clamp((mid - (edge - band / 2)) / band));
      // a short first section never starts half-morphed: hold it until the visitor scrolls
      if (ai === 0) w *= clamp(window.scrollY / (H * 0.25));
    }
    layout(A, t);
    if (B && w > 0) layout(B, t);

    const sg = clamp(cfg.stagger, 0, 0.9);
    for (let i = 0; i < N; i++) {
      const wi = B && w > 0 ? smooth(clamp((w - LEAVE[i] * sg) / (1 - sg))) : 0;
      const ui = 1 - wi;
      P[i * 3] = A.x[i] * ui + (wi ? B.x[i] * wi : 0);
      P[i * 3 + 1] = A.y[i] * ui + (wi ? B.y[i] * wi : 0);
      for (let k = 0; k < 3; k++) COL[i * 3 + k] = A.c[i * 3 + k] * ui + (wi ? B.c[i * 3 + k] * wi : 0);
      ALPHA[i] = (A.a[i] * ui + (wi ? B.a[i] * wi : 0)) * cfg.opacity;
      SIZE[i] = A.s[i] * ui + (wi ? B.s[i] * wi : 0);
    }
    field.dirty();

    // lines ride on the live dot positions
    formations.forEach((f) => {
      if (!f.lines) return;
      const weight = f === A ? 1 - w : f === B ? w : 0;
      f.lines.visible = weight > 0.01;
      if (!f.lines.visible) return;
      f.lines.material.opacity = weight * weight * cfg.lineOpacity * cfg.opacity;
      const lp = f.lines.geometry.attributes.position.array, lc = f.lines.geometry.attributes.color.array;
      for (let p = 0; p < f.pairs.length; p += 2) {
        // a link whose end dot is hidden (over text) collapses to nothing
        const i = f.pairs[p], j = f.pairs[p + 1];
        const hide = ALPHA[i] < 0.05 || ALPHA[j] < 0.05;
        for (let e = 0; e < 2; e++) {
          const v = hide ? i : f.pairs[p + e], q = (p + e) * 3;
          lp[q] = P[v * 3]; lp[q + 1] = P[v * 3 + 1]; lp[q + 2] = 0;
          lc[q] = COL[v * 3]; lc[q + 1] = COL[v * 3 + 1]; lc[q + 2] = COL[v * 3 + 2];
        }
      }
      f.lines.geometry.attributes.position.needsUpdate = true;
      f.lines.geometry.attributes.color.needsUpdate = true;
    });

    renderer.render(scene, camera);
  }

  function resize() {
    W = window.innerWidth; H = window.innerHeight;
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H, false);
    field.mat.uniforms.uDpr.value = DPR;
    burst.mat.uniforms.uDpr.value = DPR;
    camera.left = 0; camera.right = W; camera.top = 0; camera.bottom = H;
    camera.updateProjectionMatrix();
    readFormations();
    frame();
  }

  let raf = 0;
  const loop = () => {
    raf = 0; frame();
    if ((!reduced || bAlive) && !document.hidden) raf = requestAnimationFrame(loop);
  };
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  window.addEventListener('resize', () => { resize(); kick(); });
  window.addEventListener('scroll', kick, { passive: true });
  document.addEventListener('visibilitychange', kick);
  // images/fonts shift section heights after first paint
  window.addEventListener('load', () => { resize(); kick(); });

  resize();
  kick();

  if (DEBUG) window.__dotField = { cfg, rebuild: () => { readFormations(); kick(); }, formations: () => formations };
}
