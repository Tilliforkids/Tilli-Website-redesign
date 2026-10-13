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
                            "blind" greys it and rings the South Asia / Middle East gap,
                            "weird-blind" turns one into the other as a tall (pinned)
                            section scrolls — data-dots-morph="a,b" = scroll progress range
               skills12     12 mini orbs: 6 cognitive (cyan) + 6 SEL (pink)
               rings        ecological rings around the child
               star         4 data files streaming packets into one subject_id node
               neural       a small neural net, activation pulsing through the layers
               pipe         a tube winding START → END (SVG drawn by the page, data-dots-anchor
                            = its centre-line <path>); dots fill it as far as it is on screen —
                            up to where it leaves the bottom edge — and further as you scroll;
                            once END is on screen they pour out of it
               release      open data streaming outward from one source

   Placement (all optional):
     data-dots-pos="x,y"        centre: x = fraction of viewport width, y = fraction of
                                the section's height (kept inside its visible part)
     data-dots-r="0.18"         radius as a fraction of viewport height
     data-dots-rw="0.36"        radius as a fraction of viewport WIDTH (wins over -r)
     data-dots-anchor="sel"     centre on an element (first match) — split / star use
                                every match (one orb per element)
     data-dots-hub="sel"        star: the subject_id node's element
     data-dots-hub-r="38"       star: hub orb radius, px (default min(4.5vh, 38))
     data-dots-hub-off="x,y"    star: nudge the hub orb, px
     data-dots-flow="0.3"       star: packet trips per second
     data-dots-hub-n / -file-n  star: dots in the hub orb (0 = none) / in EACH file orb
     data-dots-packets          star: packet dots per file (in flight file → hub)
     data-dots-file-r="45"      star: file orb radius, px (default data-dots-r × vh)
     data-dots-hub-size / -file-size   star: dot size multiplier (default 0.9)
     data-dots-fit              size from the anchor's box instead of data-dots-r
     data-dots-ay="0.5"         anchor point down the element (0 = top edge)
     data-dots-off="x,y"        nudge the centre, both as fractions of viewport width
     data-dots-speed="1"        animation speed multiplier (spin, drift, loops)
     data-dots-colors="a,b,c"   green|cyan|yellow|orange|pink
     data-dots-gap="0.14"       split row: distance between orb centres (× vw)
     data-dots-box="x0,y0,x1,y1" scatter/network/dim region, viewport fractions
     data-dots-void="0.2"       dim/scatter: empty circle in the middle (× vh)
     data-dots-avoid="sel"      hide dots that land on these elements
     data-dots-clip             hide dots outside the section's box (crop at its edges)
     data-dots-mirror           child: a second, mirrored child on the other side of the
                                viewport (x → 1 − x); the dots are split between the two
     data-dots-scroll           scroll with the section like an image (no clamping into the
                                visible part) — pair with data-dots-cut on the next section
     data-dots-cut              no morph INTO this section: it and the one above each keep
                                their own dots and simply scroll past one another
   Page: <main data-dots-count="640" data-dots-size="9"> overrides dot count / size (px).
   Cursor orb: a small orb of its own dots (own 2D canvas ABOVE the page content, under
   the header) forms on the pointer once a
   <section data-dots-cursor> reaches mid-screen and follows it from then on; it
   dissolves again above that section or past a <section data-dots-cursor-end>.
   <section data-dots-cursor-fill="img sel">: when the pointer comes in or near the child
   in that image, the orb bursts and pours into its silhouette (mask for assets/Triad.svg:
   TRIAD_CHILD) and stays there until the image is scrolled back below the screen.

   .dots-stage elements (css/site.css) reserve room for a formation on desktop.
   FAQ cards fire `tl-dots:burst` ({x,y,w,h,color}) → a burst of their colour.

   Desktop, plus PHONES (the m/ twins, and touch screens ≤860px on responsive
   pages like FAQ). Phones get fewer dots (<main data-dots-count-m / -size-m>),
   a capped pixel ratio, width-only re-layout (the URL bar never rebuilds) and
   an idle render loop; low-memory or reduced-motion phones are skipped.
   Reduced motion (desktop) → no spin/drift/loops, still follows scroll.
   ?debug=1 → window.__dotField.
   ─────────────────────────────────────────────────────────────────────────── */

const GATE = '(min-width: 861px) and (pointer: fine)';
const PHONE = /\/m\/[^/]*$/.test(location.pathname) ||
  !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches && window.matchMedia('(max-width: 860px)').matches);
const PHONE_OK = PHONE && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) &&
  !(navigator.deviceMemory && navigator.deviceMemory <= 2);
if (window.matchMedia && (window.matchMedia(GATE).matches || PHONE_OK)) init();

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
    starFlow: 0.3,     // data files → hub: packet trips per second (data-dots-flow overrides)
    starPackets: 0.22, // share of each file's dots travelling as packets
    pipeDots: 1500,    // Research AI use cases: max dots in the pipe
    pipeDensity: 0.54, // pipe fill, dots per px of pipe length (capped so a screenful of pipe fits pipeDots)
    pipeSpeed: 270,    // pipe flow, px per second along the pipe
    pipeDotSize: 18 / 7, // pipe dot size, × dotSize (18px on Research)
    pipeFade: 28,      // px over which dots fade in at START / out at the screen's bottom edge
    pipeSpill: 70,     // px dots travel past END before vanishing
    pipeDrain: 3,      // × pipeSpeed when dots run back after scrolling up
    pipeFF: 2,         // fast-forward: max × pipeSpeed while the stream catches up after a fast scroll
    pipeFFGap: 900,    // px the stream's head can trail the screen's bottom edge before fast-forward is at full
    pipeTwist: 0.004,  // pipe dots spiral round the tube: radians per px travelled
    pipePersp: 0.25,   // perspective: near-side dots up to (1 + this) × size, far side (1 − this) ×
    pipeBack: 0.45,    // alpha of dots on the far side of the tube
    pipeFocus: 0.55,   // depth in focus: −1 far wall … 0 tube axis … 1 near wall
    pipeDof: 0.4,      // depth of field: blur per unit of depth away from the focus (0 = all sharp)
    weekRate: 5,       // weeks timeline: weeks lit per second
    phoneDots: 360,    // phones: default dot count (<main data-dots-count-m> overrides)
    phoneDpr: 1.5,     // phones: max devicePixelRatio
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
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: !PHONE, alpha: true }); }
  catch (e) { canvas.remove(); return; }
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;   // token hex in, same hex out (lines too)
  document.documentElement.classList.add('tl-dots');

  // Layering: section backgrounds < dots < section content. A stacking context
  // on <main> (m.css gives .content z-index 1) would put every section — dark
  // backgrounds included — above the canvas, so release it.
  const mainEl = document.querySelector('main');
  if (mainEl && getComputedStyle(mainEl).zIndex !== 'auto') mainEl.style.zIndex = 'auto';
  // Lift each section's direct children above the canvas (keeps absolute ones absolute).
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

  const mainDs = (document.querySelector('main') || {}).dataset || {};
  // ?debug=1&dots=N previews a dot count (the Kids panel reloads with it — N sizes every buffer)
  const urlDots = DEBUG && parseInt((location.search.match(/[?&]dots=(\d+)/) || [])[1], 10);
  const N = urlDots || (PHONE
    ? parseInt(mainDs.dotsCountM, 10) || Math.min(cfg.phoneDots, parseInt(mainDs.dotsCount, 10) || cfg.count)
    : parseInt(mainDs.dotsCount, 10) || cfg.count);
  cfg.dotSize = parseFloat(PHONE && mainDs.dotsSizeM) || parseFloat(mainDs.dotsSize) || cfg.dotSize;
  const pointsMat = () => new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { uDpr: { value: 1 } },
    vertexShader: `
      attribute vec3 aColor; attribute float aAlpha; attribute float aSize; attribute float aBlur;
      uniform float uDpr; varying vec3 vC; varying float vA; varying float vB;
      void main() {
        vC = aColor; vA = aAlpha; vB = aBlur;
        gl_PointSize = aSize * uDpr;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      varying vec3 vC; varying float vA; varying float vB;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        // aBlur widens the soft rim from a crisp edge to a full falloff (depth of field)
        gl_FragColor = vec4(vC, vA * smoothstep(0.5, mix(0.40, 0.0, vB), d));
      }`,
  });
  function makePoints(n, order) {
    const g = new THREE.BufferGeometry();
    const buf = { P: new Float32Array(n * 3), C: new Float32Array(n * 3), A: new Float32Array(n), S: new Float32Array(n), B: new Float32Array(n) };
    g.setAttribute('position', new THREE.BufferAttribute(buf.P, 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(buf.C, 3));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(buf.A, 1));
    g.setAttribute('aSize', new THREE.BufferAttribute(buf.S, 1));
    g.setAttribute('aBlur', new THREE.BufferAttribute(buf.B, 1));
    const m = pointsMat();
    const pts = new THREE.Points(g, m);
    pts.frustumCulled = false;
    pts.renderOrder = order;
    scene.add(pts);
    buf.geo = g; buf.mat = m;
    buf.dirty = () => ['position', 'aColor', 'aAlpha', 'aSize', 'aBlur'].forEach((k) => { g.attributes[k].needsUpdate = true; });
    return buf;
  }
  const field = makePoints(N, 2);
  // formations across a data-dots-cut edge (one above, one below the active section)
  const cutLayers = [makePoints(N, 2), makePoints(N, 2)];
  const cutOn = [false, false];
  const { P, C: COL, A: ALPHA, S: SIZE, B: BLUR } = field;

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
        rw: parseFloat(d.dotsRw) || 0,
        clip: d.dotsClip !== undefined,
        cut: d.dotsCut !== undefined,
        mirror: d.dotsMirror !== undefined,
        scroll: d.dotsScroll !== undefined,
        fit: d.dotsFit !== undefined,
        anchor: d.dotsAnchor ? el.querySelector(d.dotsAnchor) : null,
        anchors: d.dotsAnchor ? Array.from(el.querySelectorAll(d.dotsAnchor)) : [],
        hub: d.dotsHub ? el.querySelector(d.dotsHub) : null,
        ay: d.dotsAy !== undefined ? parseFloat(d.dotsAy) : 0.5,
        off: nums(d.dotsOff, 2, [0, 0]),
        speed: d.dotsSpeed !== undefined ? parseFloat(d.dotsSpeed) : 1,
        morph: nums(d.dotsMorph, 2, [0.3, 0.7]),
        hubR: parseFloat(d.dotsHubR) || 0,
        hubOff: nums(d.dotsHubOff, 2, [0, 0]),
        flow: d.dotsFlow !== undefined ? parseFloat(d.dotsFlow) : cfg.starFlow,
        hubN: d.dotsHubN !== undefined ? parseInt(d.dotsHubN, 10) || 0 : -1,   // 0 = no hub orb
        fileN: parseInt(d.dotsFileN, 10) || 0,
        packets: d.dotsPackets !== undefined ? parseInt(d.dotsPackets, 10) : -1,
        fileR: parseFloat(d.dotsFileR) || 0,
        hubSize: parseFloat(d.dotsHubSize) || 0.9,
        fileSize: parseFloat(d.dotsFileSize) || 0.9,
        colors: (d.dotsColors || 'green,cyan,yellow,orange,pink').split(',').map((s) => NAMED[s.trim()] || NAMED.cyan),
        gap: parseFloat(d.dotsGap) || 0.14,
        box: nums(d.dotsBox, 4, [0, 0, 1, 1]),
        voidR: parseFloat(d.dotsVoid) || 0,
        map: d.dotsMap || 'weird',
        dir: d.dotsDir || 'h',
        avoid: d.dotsAvoid || AVOID,
        avoidOn: !!REGION[d.dots] || !!d.dotsAvoid,
        lines: null, pairs: null,
        x: new Float32Array(N), y: new Float32Array(N),
        c: new Float32Array(N * 3), a: new Float32Array(N), s: new Float32Array(N), b: new Float32Array(N),
      };
      (BUILD[f.type] || (() => {}))(f);
      return f;
    });
    // either side of a hard cut is cropped at the shared edge
    formations.forEach((f, i) => {
      f.clipTop = f.clip || f.cut;
      f.clipBot = f.clip || !!(formations[i + 1] && formations[i + 1].cut);
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
      const R = f.rw ? f.rw * W : f.rSet ? f.r * H : Math.min(b.width, b.height) * 0.42;
      return { cx: b.left + b.width / 2 + f.off[0] * W, cy: b.top + b.height * f.ay + f.off[1] * W,
        rx: f.fit ? b.width / 2 : R, ry: f.fit ? b.height / 2 : R, b };
    }
    const R = f.r * H;
    let cy = rect.top + f.pos[1] * rect.height;
    if (f.scroll) return { cx: (f.pos[0] + f.off[0]) * W, cy: cy + f.off[1] * W, rx: R, ry: R };
    const lo = Math.max(rect.top, 0) + R, hi = Math.min(rect.bottom, H) - R;
    cy = lo < hi ? clamp(cy, lo, hi) : (Math.max(rect.top, 0) + Math.min(rect.bottom, H)) / 2;
    return { cx: (f.pos[0] + f.off[0]) * W, cy: cy + f.off[1] * W, rx: R, ry: R };
  }

  // star dot budget: defaults keep the original split (hub 16%, files share the rest, cfg.starPackets
  // of each file in flight); explicit counts are clamped so the total never exceeds N
  function starCounts(f) {
    const hubN = Math.min(N, f.hubN >= 0 ? f.hubN : Math.round(N * 0.16));
    const perFile = Math.floor((N - hubN) / 4);
    const fileN = Math.max(1, Math.min(perFile, f.fileN || Math.floor(perFile * (1 - cfg.starPackets))));
    const packets = Math.max(0, Math.min(perFile - fileN, f.packets >= 0 ? f.packets : perFile - fileN));
    return { hubN, fileN, packets, used: hubN + 4 * (fileN + packets) };
  }

  /* ── pipe (Research AI use cases) ──────────────────────────────────────── */
  // centre-line samples every `step` px, rebuilt whenever the page redraws the path
  function pipeLUT(f, path, svg) {
    const d = path.getAttribute('d') || '';
    if (!d) return null;
    if (f.lut && f.lut.d === d) return f.lut;
    const total = path.getTotalLength(), step = 4, m = Math.max(2, Math.ceil(total / step) + 1);
    const x = new Float32Array(m), y = new Float32Array(m);
    for (let k = 0; k < m; k++) { const q = path.getPointAtLength(Math.min(total, k * step)); x[k] = q.x; y[k] = q.y; }
    const pw = parseFloat(getComputedStyle(svg).getPropertyValue('--pipe-w')) || 28;
    // the most pipe one screen can show (sets the density the dot budget can afford)
    let maxVis = 0;
    for (let i = 0, j = 0, win = H + pw * 2; i < m; i++) {
      while (j < m - 1 && y[j + 1] <= y[i] + win) j++;
      maxVis = Math.max(maxVis, (j - i) * step);
    }
    f.lut = { d, total, step, m, x, y, pw, maxVis: maxVis + cfg.pipeSpill };
    return f.lut;
  }
  // how far along the pipe is on screen: the pipe only ever runs down (flat runs, semicircle
  // turns), so it is the last sample above the viewport's bottom edge
  function pipeVisible(lut, bottom) {
    if (lut.y[0] > bottom) return 0;
    let lo = 0, hi = lut.m - 1;
    if (lut.y[hi] <= bottom) return Infinity;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (lut.y[mid] <= bottom) lo = mid; else hi = mid; }
    return lo * lut.step;
  }
  // where the pipe comes in at the viewport's top edge: the first sample at or below it
  function pipeTail(lut, top) {
    if (lut.y[0] >= top) return 0;
    let lo = 0, hi = lut.m - 1;
    if (lut.y[hi] < top) return lut.total;
    while (hi - lo > 1) { const mid = (lo + hi) >> 1; if (lut.y[mid] < top) lo = mid; else hi = mid; }
    return hi * lut.step;
  }
  // each dot keeps its distance along the pipe (-1 = parked). Only the on-screen stretch
  // [tail, front] holds dots: they stream in at the tail (START, or the screen's top edge once
  // START has scrolled away), run to the front and are recycled there or when the tail passes
  // them. A front that moves back drains the dots beyond it; a tail that moves back (scrolling
  // up) refills the stretch it uncovers in place, since that part was full all along; a stream
  // head trailing far behind the front (fast scroll down) fast-forwards everything.
  function pipeStep(f, n, tail, front, density) {
    const now = performance.now(), dt = Math.min(0.05, (now - (f.pipeLast || now)) / 1000);
    f.pipeLast = now;
    if (!f.ps) { f.ps = new Float32Array(N).fill(-1); f.spawn = 0; f.next = 0; f.ff = 1; f.tail = tail; }
    const ps = f.ps;
    if (reduced) {                       // no flow: an even fill of the on-screen stretch
      const len = Math.max(0, front - tail), k = Math.min(n, len * density);
      for (let i = 0; i < n; i++) ps[i] = i < k ? tail + (i + 0.5) / k * len : -1;
      return;
    }
    if (tail < f.tail - 1) {
      const lo = tail, hi = Math.min(f.tail, front);
      for (let i = 0, want = Math.round((hi - lo) * density); i < n && want > 0; i++) {
        if (ps[i] < 0) { ps[i] = lo + Math.random() * (hi - lo); want--; }
      }
    }
    f.tail = tail;
    let head = -1;
    for (let i = 0; i < n; i++) if (ps[i] > head) head = ps[i];
    const gap = front - Math.max(head, tail);
    const ff = 1 + (cfg.pipeFF - 1) * smooth(clamp((gap - cfg.pipeFFGap * 0.15) / cfg.pipeFFGap));
    f.ff += (ff - f.ff) * Math.min(1, dt * 6);
    const v = cfg.pipeSpeed * f.ff;
    for (let i = 0; i < n; i++) {
      let s = ps[i];
      if (s < 0) continue;
      const sp = v * (0.75 + 0.5 * RND[i * 2]);
      if (s > front) s = Math.max(front - 0.01, s - sp * cfg.pipeDrain * dt);
      else s += sp * dt;
      ps[i] = s >= front || s < tail ? -1 : s;
    }
    if (front <= tail) { f.spawn = 0; return; }
    f.spawn = Math.min(Math.max(4, n * 0.05) * f.ff, f.spawn + dt * density * v);
    for (let k = 0; f.spawn >= 1 && k < n; k++) {
      const i = f.next; f.next = (f.next + 1) % n;
      if (ps[i] < 0) { ps[i] = tail + RND[i * 2 + 1] * 4; f.spawn -= 1; }
    }
  }

  /* ── drawing ───────────────────────────────────────────────────────────── */
  let X, Y, Cc, Aa, Ss, Bb;           // the formation being written
  const col = (i, rgb) => { Cc[i * 3] = rgb[0]; Cc[i * 3 + 1] = rgb[1]; Cc[i * 3 + 2] = rgb[2]; };
  const dot = (i, x, y, rgb, a = 1, s = 1, b = 0) => { X[i] = x; Y[i] = y; col(i, rgb); Aa[i] = a; Ss[i] = cfg.dotSize * s; Bb[i] = b; };
  const hide = (i, x, y) => { X[i] = x; Y[i] = y; Aa[i] = 0; Ss[i] = cfg.dotSize * 0.5; Bb[i] = 0; col(i, GREY); };
  // a point on a spinning, tilted ball (src = BALL filled / SHELL surface). si = which ball
  // point to use: the ball is a Fibonacci spiral pole→pole, so a run of consecutive indices
  // is only a cap — spread si over 0…N for an orb built from a contiguous block of dots
  function orbDot(i, cx, cy, R, ang, rgb, sMul = 1, src = BALL, si = i) {
    const bx = src[si * 3], by = src[si * 3 + 1], bz = src[si * 3 + 2];
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
        // mirror: odd dots draw the twin, flipped about the viewport centre — every other
        // outline point each, so both outlines stay evenly spaced
        const tw = f.mirror && i & 1, sx = tw ? -1 : 1, cx = tw ? W - p.cx : p.cx;
        dot(i, cx + sx * (ux + sway * uy) * R * br, p.cy - uy * R * br, PALETTE[i % 5], out ? 1 : 0.85, out ? 0.8 : 1);
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
      if (f.dir === 'v') return DRAW.weeksV(f, p, t, b);
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
    /* phones: the year runs DOWN a column at the anchor's left edge (the term
       list is stacked vertically on the m/ page), playhead top → bottom */
    weeksV(f, p, t, b) {
      const x = b.left + 16, y0 = b.top + 10, y1 = b.top + b.height - 10;   // down the term markers
      const head = reduced ? 36 : (t * cfg.weekRate) % 42, termRGB = [NAMED.green, NAMED.cyan, NAMED.pink];
      for (let i = 0; i < N; i++) {
        if (i < 36) {
          const y = y0 + (y1 - y0) * i / 35, end = i % 12 === 11, lit = i < head;
          dot(i, x, y, lit ? termRGB[Math.floor(i / 12)] : GREY, 1,
            (end ? 1.7 : 0.75) * (lit && head - i < 1 ? 1.4 : 1));
        } else hide(i, x, y0 + (y1 - y0) * clamp(head / 36));
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
    map(f, p, t, rect) {
      if (!LAND) buildLand();
      const spanLon = MAP.lon1 - MAP.lon0, spanLat = MAP.lat1 - MAP.lat0;
      const sc = Math.min((p.rx * 2) / spanLon, (p.ry * 2) / spanLat);
      const px = (lon) => p.cx + (lon - (MAP.lon0 + MAP.lon1) / 2) * sc;
      const py = (lat) => p.cy - (lat - (MAP.lat0 + MAP.lat1) / 2) * sc;
      const gx = px(63.5), gy = py(23), gr = 30 * sc;
      // 0 = W.E.I.R.D. (West lit), 1 = blind spot (all grey + ring); "weird-blind" follows scroll
      let K = f.map === 'blind' ? 1 : 0;
      if (f.map === 'weird-blind') {
        const span = rect.height - H, prog = span > 0 ? clamp(-rect.top / span) : 0;
        K = smooth(clamp((prog - f.morph[0]) / (f.morph[1] - f.morph[0])));
      }
      let gi = 0, gN = 0;
      if (K > 0) LAND.forEach((c) => { if (c && c.gap) gN++; });
      const lerp = (a, b, k) => a + (b - a) * k;
      for (let i = 0; i < N; i++) {
        const c = LAND[i];
        if (!c) { hide(i, p.cx, p.cy); continue; }
        const x0 = px(c.lon), y0 = py(c.lat);
        // weird state
        const c0 = c.west ? PALETTE[i % 5] : GREY;
        const a0 = c.west ? 0.85 + 0.15 * Math.sin(t * 2 + PHASE[i]) : 0.6, s0 = c.west ? 1 : 0.7;
        if (K <= 0) { dot(i, x0, y0, c0, a0, s0); if (c.gap) gi++; continue; }
        // blind state
        let x1 = x0, y1 = y0, c1 = GREY, a1 = 0.32, s1 = 0.7;
        if (c.gap) {                                      // the blind spot: an empty, pulsing ring
          const a = (gi++ / gN) * Math.PI * 2 + t * 0.25, pr = gr * (1 + 0.06 * Math.sin(t * 2));
          x1 = gx + Math.cos(a) * pr; y1 = gy + Math.sin(a) * pr;
          c1 = WHITE; a1 = 0.55 + 0.4 * Math.sin(t * 2 + a * 2); s1 = 0.75;
        }
        const k = K >= 1 ? 1 : smooth(clamp((K - LEAVE[i] * 0.3) / 0.7));
        dot(i, lerp(x0, x1, k), lerp(y0, y1, k), mix(c0, c1, k), lerp(a0, a1, k), lerp(s0, s1, k));
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
      const st = starCounts(f), files = f.anchors.slice(0, 4).map((el) => el.getBoundingClientRect());
      const hb = f.hub ? f.hub.getBoundingClientRect() : null;
      const hx = (hb ? hb.left + hb.width / 2 : p.cx) + f.hubOff[0], hy = (hb ? hb.top + hb.height / 2 : p.cy - p.ry) + f.hubOff[1];
      const flowT = f.el.__flowT || 0, fileR = f.fileR || f.r * H;
      const fileRGB = f.colors.length >= 4 ? f.colors : [NAMED.pink, NAMED.green, NAMED.cyan, NAMED.orange];
      // dots: [hub × hubN] then files interleaved (g = j % 4): rank < fileN = orb, next `packets` = in flight
      for (let i = 0; i < N; i++) {
        if (i < st.hubN) { orbDot(i, hx, hy, f.hubR || Math.min(0.045 * H, 38), t * cfg.spin, PALETTE[i % 5], f.hubSize, BALL, Math.floor((i + 0.5) * N / st.hubN)); continue; }
        const j = i - st.hubN, g = j % 4, rank = Math.floor(j / 4), b = files[g];
        if (!b || rank >= st.fileN + st.packets) { hide(i, hx, hy); continue; }
        const fx = b.left + b.width / 2, fy = b.top + b.height * f.ay;
        if (rank >= st.fileN) {                            // a data packet on its way into the hub
          const ph = frac(RND[i * 2] + flowT), e = ph * ph;      // speeds up as it nears the hub
          const nx = -(hy - fy), ny = hx - fx, nl = Math.hypot(nx, ny) || 1, wob = (RND[i * 2 + 1] - 0.5) * 18 * Math.sin(Math.PI * ph);
          dot(i, fx + (hx - fx) * e + nx / nl * wob, fy + (hy - fy) * e + ny / nl * wob, fileRGB[g],
            0.9 * Math.min(1, ph * 8) * (1 - Math.pow(ph, 6)), 0.65);
          continue;
        }
        // file orbs spin (each starts at its own angle); ball points spread pole→pole whatever fileN is
        orbDot(i, fx, fy, fileR, g * 1.7 + t * cfg.spin, fileRGB[g], f.fileSize, BALL, Math.floor((rank + 0.5) * N / st.fileN));
      }
    },
    /* RESEARCH ─ AI use cases: dots fill the on-screen stretch of a pipe, flowing START → END */
    pipe(f, p, t) {
      const path = f.anchor, svg = path && path.ownerSVGElement, lut = svg && pipeLUT(f, path, svg);
      if (!lut) { for (let i = 0; i < N; i++) hide(i, p.cx, p.cy); return; }
      const n = Math.min(N, cfg.pipeDots), sb = svg.getBoundingClientRect();
      const last = lut.m - 1, px = cfg.dotSize * cfg.pipeDotSize;
      // on-screen stretch, padded so dots enter / leave beyond the screen edges
      const mg = lut.pw / 2 + px * (1 + cfg.pipePersp) + 4, end = lut.total + cfg.pipeSpill;
      const tail = pipeTail(lut, -sb.top - mg), seen = pipeVisible(lut, H - sb.top + mg), open = seen === Infinity;
      const front = tail >= lut.total ? tail : open ? end : seen;
      pipeStep(f, n, tail, front, Math.min(cfg.pipeDensity, n * 0.9 / lut.maxVis));
      const r = Math.max(2, lut.pw / 2 - px * (1 + cfg.pipePersp) / 2 - 3);   // even the nearest (biggest) dots stay inside the walls
      for (let i = 0; i < N; i++) {
        const s = i < n ? f.ps[i] : -1;
        if (s < 0) { hide(i, sb.left + lut.x[0], sb.top + lut.y[0]); continue; }
        // point + direction on the centre-line (straight on past END)
        const k = clamp(s / lut.step, 0, last - 0.001), k0 = Math.floor(k), u = k - k0;
        let tx = lut.x[k0 + 1] - lut.x[k0], ty = lut.y[k0 + 1] - lut.y[k0];
        const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
        const over = Math.max(0, s - lut.total);
        const cx = lut.x[k0] + (lut.x[k0 + 1] - lut.x[k0]) * u + tx * over;
        const cy = lut.y[k0] + (lut.y[k0 + 1] - lut.y[k0]) * u + ty * over;
        // the tube as a cylinder: each dot sits at its own radius / angle round the axis and spirals
        // as it travels; seen side-on, cos = across the tube, sin = depth (+1 near wall, −1 far)
        const rho = Math.sqrt(LEAVE[i]), th = PHASE[i] + s * cfg.pipeTwist;
        const off = rho * Math.cos(th) * r + Math.sin(t * 2 + PHASE[i]) * 1.5, z = rho * Math.sin(th);
        const blur = clamp(Math.abs(z - cfg.pipeFocus) * cfg.pipeDof);
        const a = 0.9 * clamp(s / cfg.pipeFade) * clamp((front - s) / (open ? cfg.pipeSpill : cfg.pipeFade))
          * (cfg.pipeBack + (1 - cfg.pipeBack) * (z + 1) / 2) * (1 - 0.3 * blur);
        dot(i, sb.left + cx - ty * off, sb.top + cy + tx * off, PALETTE[i % 5], a,
          cfg.pipeDotSize * (1 + cfg.pipePersp * z) * (1 + 0.35 * blur), blur);
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
  function layout(f) {
    const t = f.el.__dotsT || 0;      // per-section clock (data-dots-speed), advanced in frame()
    const rect = f.el.getBoundingClientRect();
    X = f.x; Y = f.y; Cc = f.c; Aa = f.a; Ss = f.s; Bb = f.b;
    if (REGION[f.type]) region(f, t);
    else (DRAW[f.type] || DRAW.orb)(f, place(f, rect), t, rect);
    if (f.clipTop || f.clipBot) for (let i = 0; i < N; i++) {
      if ((f.clipTop && Y[i] < rect.top) || (f.clipBot && Y[i] > rect.bottom)) Aa[i] = 0;
    }
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

  /* ── cursor orb (own canvas above content; the field's formations carry on) ─ */
  const CUR = {
    n: 110,         // dots in the orb
    r: 30,          // orb radius, px (~60px across)
    size: 4.5,      // dot diameter, px
    follow: 10,     // how tightly it trails the pointer (higher = snappier)
    form: 0.7,      // seconds to gather / dissolve
    scatter: 160,   // px the dots fly in from while forming
    spin: 2,        // × cfg.spin
    fill: 600,      // dots that end up inside the child silhouette (extra ones join in the burst)
    fillSize: 5,    // dot diameter once settled in the silhouette, px
    fillDur: 1.8,   // seconds: burst + pour into the silhouette
    burst: 0.28,    // share of fillDur spent bursting outward
    burstR: 190,    // px the burst throws dots (max)
    near: 60,       // px around the child's outline that counts as "near" for the trigger
  };
  // interior of the child in assets/Triad.svg (viewBox 1440×810), inset ~8 units from the
  // outline: rows of "start.length" cell spans, 4-unit cells from (x0, y0)
  const TRIAD_CHILD = { vw: 1440, vh: 810, box: [987, 77, 1416, 806], x0: 1000, y0: 100, cell: 4,
    rows: '40.11;37.17;36.19;34.23;33.25;32.27;31.29;30.31;29.33;29.33;28.35;28.35;27.37;27.37;27.37;26.39;26.39;26.39;26.39;26.39;26.39;26.39;26.39;27.37;27.37;27.37;27.37;28.35;28.35;29.33;30.31;30.31;31.29;32.27;33.25;35.21;36.19;38.15;41.11;44.7;45.6;46.5;46.5;46.5;45.7;45.8;43.17;35.32;31.39;28.42;27.44;27.44;27.45;26.46;26.47;25.48;25.49;24.51;24.51;23.53;23.53;22.55;22.56;21.57;21.58;20.59;19.61;19.62;18.63;18.64;17.66;17.66;16.68;16.69;15.70;15.71;14.72;14.73;13.75;12.76;12.77;11.79;11.79;10.81;10.82;9.83;9.84;8.65,77.17;7.65,79.15;7.15,28.43,79.16;6.15,29.42,80.15;6.15,29.42,80.16;5.15,29.42,81.15;5.15,29.42,82.15;4.15,29.42,82.15;4.15,29.42,83.15;3.15,29.43,84.14;3.14,29.43,85.13;3.14,29.43,86.12;3.13,29.43,87.11;2.13,29.43,88.10;2.12,29.43,89.9;2.11,29.43,90.8;2.10,29.43,92.5;3.8,29.43;3.7,28.45;4.4,28.45;28.45;28.45;28.45;28.45;28.45;28.45;28.45;28.45;28.45;29.44;29.44;29.19,54.19;29.17,56.17;29.16,57.16;29.16,57.16;29.16,58.15;29.16,58.15;29.16,58.15;29.16,58.15;29.16,58.16;29.16,58.16;29.16,58.16;29.16,58.16;29.16,58.16;29.16,58.16;29.16,58.16;29.16,58.16;29.16,58.16;29.16,58.16;29.16,58.16;29.16,58.16;29.16,59.15;29.16,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;30.15,59.15;31.14,59.15;31.14,59.15;31.14,59.15;31.14,59.14;31.14,59.14;31.14,59.14;31.14,59.14;31.14,59.14;32.13,59.14;32.13,60.12;32.13,60.12;33.12,60.12;33.11,61.10;33.11,62.9;34.9,63.7;35.6' };
  const curStart = document.querySelector('main section[data-dots-cursor]');
  const curEnd = document.querySelector('main section[data-dots-cursor-end]');
  const fillSec = document.querySelector('main section[data-dots-cursor-fill]');
  const fillImg = fillSec && fillSec.querySelector(fillSec.dataset.dotsCursorFill);
  const POOL = fillImg ? Math.max(CUR.n, CUR.fill) : CUR.n;
  let curCtx = null;
  if (curStart) {
    const c2 = document.createElement('canvas');
    c2.id = 'tlDotsCursor';
    c2.setAttribute('aria-hidden', 'true');
    c2.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:50;pointer-events:none';
    document.body.appendChild(c2);
    curCtx = c2.getContext('2d');
  }
  const rgbCss = (c) => `rgb(${Math.round(c[0] * 255)},${Math.round(c[1] * 255)},${Math.round(c[2] * 255)})`;
  const CCOL = PALETTE.map(rgbCss);
  let curDrawn = false;
  const CBALL = new Float32Array(CUR.n * 3), CSCAT = new Float32Array(CUR.n * 2);
  const CBURST = new Float32Array(POOL * 2), CLEAVE = new Float32Array(POOL), CPH = new Float32Array(POOL);
  {
    const r = rng(23);
    for (let i = 0; i < CUR.n; i++) {
      const k = i + 0.5, phi = Math.acos(1 - 2 * k / CUR.n), th = Math.PI * (1 + Math.sqrt(5)) * k, rr = Math.cbrt(0.2 + 0.8 * r());
      CBALL[i * 3] = Math.cos(th) * Math.sin(phi) * rr; CBALL[i * 3 + 1] = Math.cos(phi) * rr; CBALL[i * 3 + 2] = Math.sin(th) * Math.sin(phi) * rr;
      const a = r() * Math.PI * 2, d = CUR.scatter * (0.4 + 0.6 * r());
      CSCAT[i * 2] = Math.cos(a) * d; CSCAT[i * 2 + 1] = Math.sin(a) * d;
    }
    for (let i = 0; i < POOL; i++) {
      const a = r() * Math.PI * 2, d = CUR.burstR * (0.35 + 0.65 * Math.sqrt(r()));
      CBURST[i * 2] = Math.cos(a) * d; CBURST[i * 2 + 1] = Math.sin(a) * d;
      CLEAVE[i] = r(); CPH[i] = r() * Math.PI * 2;
    }
  }
  // silhouette targets (viewBox units): dart-throw over the mask cells so the fill is even
  let CTGT = null;
  function buildTargets() {
    const M = TRIAD_CHILD, cells = [];
    M.rows.split(';').forEach((row, ry) => {
      if (!row) return;
      row.split(',').forEach((sp) => {
        const [s0, len] = sp.split('.').map(Number);
        for (let k = 0; k < len; k++) cells.push(M.x0 + (s0 + k) * M.cell, M.y0 + ry * M.cell);
      });
    });
    const nC = cells.length / 2, r = rng(31), order = Array.from({ length: nC }, (_, i) => i);
    for (let i = nC - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    const minD = Math.sqrt(nC * M.cell * M.cell / CUR.fill) * 0.72, minD2 = minD * minD;
    const out = [], grid = new Map(), key = (x, y) => Math.floor(x / minD) + ':' + Math.floor(y / minD);
    for (let pass = 0; pass < 2 && out.length < CUR.fill * 2; pass++) {
      for (let o = 0; o < nC && out.length < CUR.fill * 2; o++) {
        const c = order[o], x = cells[c * 2] + r() * M.cell, y = cells[c * 2 + 1] + r() * M.cell;
        if (!pass) {
          const gx = Math.floor(x / minD), gy = Math.floor(y / minD);
          let near = false;
          for (let dx = -1; dx <= 1 && !near; dx++) for (let dy = -1; dy <= 1 && !near; dy++) {
            (grid.get((gx + dx) + ':' + (gy + dy)) || []).forEach((q) => { if ((q[0] - x) ** 2 + (q[1] - y) ** 2 < minD2) near = true; });
          }
          if (near) continue;
          const kk = key(x, y); (grid.get(kk) || grid.set(kk, []).get(kk)).push([x, y]);
        }
        out.push(x, y);
      }
    }
    CTGT = new Float32Array(POOL * 2);
    for (let i = 0; i < POOL; i++) { CTGT[i * 2] = out[(i % (out.length / 2)) * 2]; CTGT[i * 2 + 1] = out[(i % (out.length / 2)) * 2 + 1]; }
  }

  let mx = -1, my = -1, ox = 0, oy = 0, curK = 0, curF = 0, curIn = false, curLatch = false, curLast = performance.now();
  const curT0 = curLast;
  if (curStart) {
    window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; curIn = true; kick(); }, { passive: true });
    document.addEventListener('mouseout', (e) => { if (!e.relatedTarget) { curIn = false; kick(); } });
  }
  const easeOut = (v) => 1 - (1 - v) * (1 - v) * (1 - v);
  function stepCursor(now) {
    const dt = Math.min(0.05, (now - curLast) / 1000); curLast = now;
    if (!curCtx) return;
    if (mx < 0) { mx = W / 2; my = H / 2; }                   // pointer not seen yet: start mid-screen
    const mid = H * 0.5;
    const started = curStart.getBoundingClientRect().top <= mid;
    // fill trigger: pointer in / near the child's outline box; latched until the image is
    // scrolled back below the screen
    if (fillImg) {
      const b = fillImg.getBoundingClientRect(), M = TRIAD_CHILD.box, fx = b.width / TRIAD_CHILD.vw, fy = b.height / TRIAD_CHILD.vh;
      if (b.top > H) curLatch = false;
      else if (!curLatch && curIn && started
        && mx > b.left + M[0] * fx - CUR.near && mx < b.left + M[2] * fx + CUR.near
        && my > b.top + M[1] * fy - CUR.near && my < b.top + M[3] * fy + CUR.near) curLatch = true;
    }
    const filling = curLatch;
    const on = started && !(curEnd && curEnd.getBoundingClientRect().top <= mid) && (curIn || filling || curF > 0);
    if (!curK && !on) {                                       // idle: park on the pointer, ready to form there
      ox = mx; oy = my;
      if (curDrawn) { curCtx.clearRect(0, 0, W, H); curDrawn = false; }
      return;
    }
    curK = reduced ? (on ? 1 : 0) : clamp(curK + (on ? dt : -dt) / CUR.form);
    if (fillImg) curF = reduced ? (filling ? 1 : 0) : clamp(curF + (filling ? dt : -dt) / CUR.fillDur);
    const ease = reduced ? 1 : 1 - Math.exp(-dt * CUR.follow);
    ox += (mx - ox) * ease; oy += (my - oy) * ease;

    // settled in the silhouette and scrolled out of view: nothing to draw
    let ib = null;
    if (curF > 0) {
      ib = fillImg.getBoundingClientRect();
      if (curF >= 1 && (ib.bottom < 0 || ib.top > H)) {
        if (curDrawn) { curCtx.clearRect(0, 0, W, H); curDrawn = false; }
        return;
      }
      if (!CTGT) buildTargets();
    }

    const k = smooth(curK), tt = reduced ? 0 : (now - curT0) / 1000, ang = tt * cfg.spin * CUR.spin;
    const ca = Math.cos(ang), sa = Math.sin(ang), ct = Math.cos(cfg.tilt), st = Math.sin(cfg.tilt);
    const bk = easeOut(clamp(curF / CUR.burst)), sx = ib ? ib.width / TRIAD_CHILD.vw : 0, sy = ib ? ib.height / TRIAD_CHILD.vh : 0;
    curCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
    curCtx.clearRect(0, 0, W, H);
    const count = curF > 0 ? POOL : CUR.n;
    for (let i = 0; i < count; i++) {
      // 1 · the orb on the pointer (extra fill dots wait, hidden, at its centre)
      let x = ox, y = oy, a = 0, sz = CUR.size;
      if (i < CUR.n) {
        const bx = CBALL[i * 3], by = CBALL[i * 3 + 1], bz = CBALL[i * 3 + 2];
        const rx = bx * ca + bz * sa, rz0 = -bx * sa + bz * ca, ry = by * ct - rz0 * st, rz = by * st + rz0 * ct;
        const d = 1 + rz * cfg.depth;
        x = ox + rx * CUR.r * d + CSCAT[i * 2] * (1 - k);
        y = oy - ry * CUR.r * d + CSCAT[i * 2 + 1] * (1 - k);
        a = k * (cfg.backAlpha + (1 - cfg.backAlpha) * (rz + 1) / 2);
        sz = CUR.size * d;
      }
      // 2 · burst outward, then 3 · pour into the silhouette (staggered per dot)
      if (curF > 0) {
        const tr = smooth(clamp((curF - CUR.burst - CLEAVE[i] * 0.3) / (1 - CUR.burst - 0.3)));
        const bxp = ox + CBURST[i * 2], byp = oy + CBURST[i * 2 + 1];
        const tx = ib.left + CTGT[i * 2] * sx, ty = ib.top + CTGT[i * 2 + 1] * sy;
        x = x + (bxp - x) * bk; y = y + (byp - y) * bk;
        x = x + (tx - x) * tr; y = y + (ty - y) * tr;
        const settled = 0.8 + 0.2 * Math.sin(tt * 2 + CPH[i]);
        a = (i < CUR.n ? a : bk * 0.9) * (1 - tr) + settled * tr * k;   // k: fades with the orb past data-dots-cursor-end
        sz = sz + (CUR.fillSize - sz) * tr;
      }
      if (a <= 0.01) continue;
      curCtx.globalAlpha = a * cfg.opacity;
      curCtx.fillStyle = CCOL[i % 5];
      curCtx.beginPath();
      curCtx.arc(x, y, sz / 2, 0, Math.PI * 2);
      curCtx.fill();
    }
    curDrawn = true;
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
  let tPrev = performance.now();
  const XYZ = new Float32Array(N * 3);
  function interleave(f) {
    for (let i = 0; i < N; i++) { XYZ[i * 3] = f.x[i]; XYZ[i * 3 + 1] = f.y[i]; }
    return XYZ;
  }
  let liveOnScreen = true;
  function frame() {
    const now = performance.now();
    stepBursts(now);
    stepCursor(now);
    if (!formations.length) { renderer.render(scene, camera); return; }
    const dt = reduced ? 0 : Math.min(0.1, (now - tPrev) / 1000); tPrev = now;
    formations.forEach((f) => {
      f.el.__dotsT = (f.el.__dotsT || 0) + dt * f.speed;
      f.el.__flowT = (f.el.__flowT || 0) + dt * f.flow;     // own clock so flow speed can change smoothly
    });
    const mid = H * 0.5;

    // active pair: the last section whose top has passed mid-screen, and the next
    let ai = 0;
    for (let i = 0; i < formations.length; i++) {
      if (formations[i].el.getBoundingClientRect().top <= mid) ai = i;
    }
    const A = formations[ai], B = formations[ai + 1];
    liveOnScreen = [A, B, formations[ai - 1]].some((f) => f && f.type !== 'off' && (() => {
      const r = f.el.getBoundingClientRect(); return r.bottom > -H * 0.5 && r.top < H * 1.5;
    })());
    let w = 0;
    if (B) {
      const edge = B.el.getBoundingClientRect().top, band = cfg.morphBand * H;
      w = smooth(clamp((mid - (edge - band / 2)) / band));
      // a short first section never starts half-morphed: hold it until the visitor scrolls
      if (ai === 0) w *= clamp(window.scrollY / (H * 0.25));
    }
    // hard cut: no morph; the section on the other side of each cut edge gets its own layer
    const prev = formations[ai - 1];
    const others = [
      A.cut && prev && prev.el.getBoundingClientRect().bottom > 0 ? prev : null,
      B && B.cut && B.el.getBoundingClientRect().top < H ? B : null,
    ];
    if (B && B.cut) w = 0;
    layout(A);
    if (B && w > 0) layout(B);
    others.forEach((o, k) => {
      const L = cutLayers[k];
      if (o) {
        layout(o);
        L.P.set(interleave(o)); L.C.set(o.c); L.S.set(o.s); L.B.set(o.b);
        for (let i = 0; i < N; i++) L.A[i] = o.a[i] * cfg.opacity;
        L.dirty(); cutOn[k] = true;
      } else if (cutOn[k]) { L.A.fill(0); L.dirty(); cutOn[k] = false; }
    });

    const sg = clamp(cfg.stagger, 0, 0.9);
    for (let i = 0; i < N; i++) {
      const wi = B && w > 0 ? smooth(clamp((w - LEAVE[i] * sg) / (1 - sg))) : 0;
      const ui = 1 - wi;
      P[i * 3] = A.x[i] * ui + (wi ? B.x[i] * wi : 0);
      P[i * 3 + 1] = A.y[i] * ui + (wi ? B.y[i] * wi : 0);
      for (let k = 0; k < 3; k++) COL[i * 3 + k] = A.c[i * 3 + k] * ui + (wi ? B.c[i * 3 + k] * wi : 0);
      ALPHA[i] = (A.a[i] * ui + (wi ? B.a[i] * wi : 0)) * cfg.opacity;
      SIZE[i] = A.s[i] * ui + (wi ? B.s[i] * wi : 0);
      BLUR[i] = A.b[i] * ui + (wi ? B.b[i] * wi : 0);
    }
    field.dirty();

    // lines ride on the live dot positions
    formations.forEach((f) => {
      if (!f.lines) return;
      // a formation across a cut edge draws its links from its own layer, at full weight
      const ck = others.indexOf(f), src = ck >= 0 ? cutLayers[ck] : field;
      const weight = ck >= 0 ? 1 : f === A ? 1 - w : f === B ? w : 0;
      f.lines.visible = weight > 0.01;
      if (!f.lines.visible) return;
      f.lines.material.opacity = weight * weight * cfg.lineOpacity * cfg.opacity;
      const lp = f.lines.geometry.attributes.position.array, lc = f.lines.geometry.attributes.color.array;
      for (let p = 0; p < f.pairs.length; p += 2) {
        // a link whose end dot is hidden (over text) collapses to nothing
        const i = f.pairs[p], j = f.pairs[p + 1];
        const hide = src.A[i] < 0.05 || src.A[j] < 0.05;
        for (let e = 0; e < 2; e++) {
          const v = hide ? i : f.pairs[p + e], q = (p + e) * 3;
          lp[q] = src.P[v * 3]; lp[q + 1] = src.P[v * 3 + 1]; lp[q + 2] = 0;
          lc[q] = src.C[v * 3]; lc[q + 1] = src.C[v * 3 + 1]; lc[q + 2] = src.C[v * 3 + 2];
        }
      }
      f.lines.geometry.attributes.position.needsUpdate = true;
      f.lines.geometry.attributes.color.needsUpdate = true;
    });

    renderer.render(scene, camera);
  }

  /* phones: lay out against the LARGE viewport so the URL bar showing /
     hiding never shifts a formation */
  function viewportH() {
    if (!PHONE) return window.innerHeight;
    const pr = document.createElement('div');
    pr.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:100vh;height:100lvh;visibility:hidden;pointer-events:none';
    document.documentElement.appendChild(pr);
    const h = pr.getBoundingClientRect().height;
    pr.remove();
    return Math.max(window.innerHeight, h || 0);
  }
  function resize() {
    W = window.innerWidth; H = viewportH();
    DPR = Math.min(window.devicePixelRatio || 1, PHONE ? cfg.phoneDpr : 2);
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H, false);
    field.mat.uniforms.uDpr.value = DPR;
    burst.mat.uniforms.uDpr.value = DPR;
    cutLayers.forEach((L) => { L.mat.uniforms.uDpr.value = DPR; });
    if (curCtx) { curCtx.canvas.width = Math.round(W * DPR); curCtx.canvas.height = Math.round(H * DPR); curDrawn = false; }
    camera.left = 0; camera.right = W; camera.top = 0; camera.bottom = H;
    camera.updateProjectionMatrix();
    readFormations();
    frame();
  }

  let raf = 0;
  const loop = () => {
    raf = 0; frame();
    /* keep animating only while something can move: a live formation on
       screen, a burst in flight, or the cursor orb — a page parked on
       data-dots="off" sections stops drawing (phones' battery) */
    if ((!reduced || bAlive) && !document.hidden && (liveOnScreen || bAlive || curCtx)) raf = requestAnimationFrame(loop);
  };
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }
  let lastW = window.innerWidth;
  window.addEventListener('resize', () => {
    if (PHONE && window.innerWidth === lastW) return;   // URL bar / keyboard: height-only
    lastW = window.innerWidth;
    resize(); kick();
  });
  window.addEventListener('scroll', kick, { passive: true });
  document.addEventListener('visibilitychange', kick);
  // images/fonts shift section heights after first paint
  window.addEventListener('load', () => { resize(); kick(); });

  resize();
  kick();

  if (DEBUG) window.__dotField = { cfg, rebuild: () => { readFormations(); kick(); }, formations: () => formations };

  /* ── ?debug=1 tuning panels ────────────────────────────────────────────── */
  // knob: { label, unit, min, max, step, get, set, note?, commit? } — commit fires on release
  function debugPanel(title, knobs, side, foot) {
    const panel = document.createElement('div');
    panel.style.cssText = 'position:fixed;' + side + ':16px;bottom:16px;z-index:9999;width:240px;padding:12px 14px;' +
      'background:#fff;border:1px solid #C7CDD8;border-radius:10px;box-shadow:0 6px 24px rgba(0,0,0,.12);' +
      'font:12px/1.4 system-ui,sans-serif;color:#141414';
    panel.innerHTML = '<b style="display:block;margin-bottom:6px">' + title + '</b>';
    const shows = [];
    knobs.forEach((k) => {
      const row = document.createElement('label');
      row.style.cssText = 'display:block;margin-top:8px';
      row.innerHTML = '<span style="display:flex;justify-content:space-between"><span>' + k.label + '</span><output></output></span>' +
        '<input type="range" style="width:100%" min="' + k.min + '" max="' + k.max + '" step="' + k.step + '" value="' + k.get() + '">';
      const out = row.querySelector('output'), input = row.querySelector('input');
      const show = () => { out.textContent = input.value + ' ' + k.unit + (k.note ? k.note(parseFloat(input.value)) : ''); };
      input.addEventListener('input', () => { if (k.set) k.set(parseFloat(input.value)); shows.forEach((f) => f()); kick(); });
      if (k.commit) input.addEventListener('change', () => k.commit(parseFloat(input.value)));
      shows.push(show);
      panel.appendChild(row);
    });
    if (foot) {
      const ft = document.createElement('div');
      ft.style.cssText = 'margin-top:10px;padding-top:8px;border-top:1px solid #E5E7EB;color:#6B7280;font:11px/1.45 ui-monospace,monospace;word-break:break-all';
      panel.appendChild(ft);
      shows.push(() => { ft.textContent = foot(); });
    }
    shows.forEach((f) => f());
    document.body.appendChild(panel);
  }

  // Research pipe
  const pipeSec = DEBUG && formations.find((f) => f.type === 'pipe');
  if (pipeSec) {
    const sec = pipeSec.el;
    const css0 = (name) => parseFloat(getComputedStyle(sec).getPropertyValue(name));
    const knobs = [
      { label: 'Pipe width', unit: 'px', min: 12, max: 240, step: 1, get: () => css0('--pipe-w'),
        set: (v) => { sec.style.setProperty('--pipe-w', v + 'px'); formations.forEach((f) => { if (f.type === 'pipe') f.lut = null; }); } },
      { label: 'Speed', unit: 'px/s', min: 40, max: 1200, step: 10, get: () => cfg.pipeSpeed, set: (v) => { cfg.pipeSpeed = v; } },
      { label: 'Dot size', unit: 'px', min: 2, max: 20, step: 0.5, get: () => +(cfg.dotSize * cfg.pipeDotSize).toFixed(1),
        set: (v) => { cfg.pipeDotSize = v / cfg.dotSize; } },
      { label: 'Perspective', unit: '', min: 0, max: 0.9, step: 0.05, get: () => cfg.pipePersp, set: (v) => { cfg.pipePersp = v; } },
      { label: 'Depth of field', unit: '', min: 0, max: 3, step: 0.05, get: () => cfg.pipeDof, set: (v) => { cfg.pipeDof = v; } },
      { label: 'Focus depth', unit: '', min: -1, max: 1, step: 0.05, get: () => cfg.pipeFocus, set: (v) => { cfg.pipeFocus = v; } },
      // the pipe can only use pipeDots dots, so a long pipe caps the density it can actually show
      { label: 'Density', unit: '/px', min: 0.02, max: 0.6, step: 0.01, get: () => cfg.pipeDensity, set: (v) => { cfg.pipeDensity = v; },
        note: () => {
          const f = formations.find((q) => q.type === 'pipe'), lut = f && f.lut;
          if (!lut) return '';
          const cap = Math.min(N, cfg.pipeDots) * 0.9 / lut.maxVis;
          return cfg.pipeDensity > cap ? ' (max ' + cap.toFixed(2) + ')' : '';
        } },
    ];
    debugPanel('Pipe tuning', knobs, 'right');
  }

  // the child(ren): density = dot count, which sizes every buffer → applied by reloading
  const kidSec = DEBUG && formations.find((f) => f.type === 'child');
  if (kidSec) {
    const per = kidSec.mirror ? 2 : 1, f = kidSec;
    debugPanel('Kids', [
      { label: 'Dots (page total)', unit: '', min: 120, max: 2000, step: 20, get: () => N,
        note: (v) => per > 1 ? ' · ' + Math.round(v / per) + '/kid' : '',
        commit: (v) => {   // reload with ?dots= (keeps debug=1)
          const u = new URL(location.href);
          u.searchParams.set('dots', v);
          location.href = u.href;
        } },
      { label: 'Dot size (page)', unit: 'px', min: 2, max: 18, step: 0.5, get: () => cfg.dotSize, set: (v) => { cfg.dotSize = v; } },
      { label: 'Kid size (data-dots-r)', unit: '× vh', min: 0.06, max: 0.4, step: 0.005, get: () => f.r, set: (v) => { f.r = v; } },
      { label: 'Kid x (right one)', unit: '× vw', min: 0.55, max: 0.98, step: 0.005, get: () => f.pos[0], set: (v) => { f.pos[0] = v; } },
    ], 'left', () => '<main data-dots-count="' + N + '" data-dots-size="' + cfg.dotSize + '"> · hero data-dots-r="' +
      f.r + '" data-dots-pos="' + f.pos[0] + ',' + f.pos[1] + '"');
  }
}
