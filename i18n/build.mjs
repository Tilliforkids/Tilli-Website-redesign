#!/usr/bin/env node
/* ============================================================================
   Tilli i18n — extract + build. No npm dependencies (Node 18+).

     node i18n/build.mjs extract   → i18n/source.json  (every English string,
                                     grouped by page; "missing" lists strings
                                     a language file doesn't have yet)
     node i18n/build.mjs build     → i18n/pages/<lang>/<page>.html

   HOW IT WORKS
   English HTML stays the source of truth. The extractor walks each page and
   cuts it into "segments": a run of text plus inline tags (<b>, <a>, <span>…)
   between block boundaries. Inline tags become numbered placeholders, so
     'Hello <b class="x">world</b><br>'  →  'Hello <1>world</1><2/>'
   Language files (i18n/<lang>.json) map that English key → translation, and
   the builder swaps each segment, restoring the original tags by number.
   Strings that live in JS are wrapped in _t("…") at their call site and
   travel to the page as window.TILLI_I18N (see injectHead()).

   RE-RUN `build` AFTER ANY ENGLISH COPY CHANGE. A changed English string
   simply falls back to English on translated pages until its translation is
   added (run `extract` to see what's missing).
   ─────────────────────────────────────────────────────────────────────────── */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const I18N = path.join(ROOT, 'i18n');
const OUT = path.join(I18N, 'pages');

/* Pages that get translated copies. tilli-for-unrwa.html is deliberately out. */
export const PAGES = [
  'index.html', 'faq.html', 'jobs.html', 'opensource.html', 'privacy-policy.html',
  'research.html', 'success.html', 'team.html', 'terms.html',
  'm/index.html', 'm/research.html', 'm/success.html'
];
/* JS files scanned for _t("…") strings. */
const JS_FILES = ['js/site-chrome.js', 'js/m-chrome.js', 'js/booking-form.js', 'js/main.js',
  'js/slideshow.js', 'js/i18n.js'];

export const LANGS = {
  ar: { name: 'العربية', en: 'Arabic', dir: 'rtl', font: 'Noto+Sans+Arabic:wght@400;500;600;700;800', family: 'Noto Sans Arabic' },
  si: { name: 'සිංහල', en: 'Sinhala', dir: 'ltr', font: 'Noto+Sans+Sinhala:wght@400;500;600;700;800', family: 'Noto Sans Sinhala' },
  ta: { name: 'தமிழ்', en: 'Tamil', dir: 'ltr', font: 'Noto+Sans+Tamil:wght@400;500;600;700;800', family: 'Noto Sans Tamil' },
  es: { name: 'Español', en: 'Spanish', dir: 'ltr' }
};

const INLINE = new Set(['a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'em', 'i', 'img', 'kbd',
  'mark', 'q', 's', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'wbr', 'label']);
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'svg', 'textarea', 'template', 'math']);
/* Home scenes (data-label) whose layout stays LTR on RTL pages (see injectHead). */
const HOME_LTR_SCENES = ['12 skills', 'Journey'];
/* Side padding (px) of Home's bottom pill nav buttons on translated pages. */
const QUICKNAV_PAD = 11;
/* Heading line-height on Arabic / Sinhala / Tamil pages (English uses ~1.14). */
const HEADING_LH = 1.3;
/* Containers that must stay direction:ltr on RTL pages (see injectHead). */
const RTL_PINNED = ['.ss', '.s-carousel', '.mrail', '.imp2-carousel', '.imp2-track', '.photo-track',
  '.school-track', '.sc-marquee', '.sc-track', 'canvas'];
const TEXT_ATTRS = ['alt', 'title', 'placeholder', 'aria-label', 'data-i18n-text'];
const META_KEYS = /^(description|og:title|og:description|twitter:title|twitter:description)$/i;

/* ── tokenizer ─────────────────────────────────────────────────────────── */
function tokenize(html) {
  const toks = [];
  let i = 0;
  const n = html.length;
  while (i < n) {
    if (html.startsWith('<!--', i)) {
      const e = html.indexOf('-->', i + 4);
      const end = e < 0 ? n : e + 3;
      toks.push({ t: 'other', s: html.slice(i, end) }); i = end; continue;
    }
    if (html[i] === '<' && /[a-zA-Z\/!]/.test(html[i + 1] || '')) {
      if (html[i + 1] === '!') { const e = html.indexOf('>', i); toks.push({ t: 'other', s: html.slice(i, e + 1) }); i = e + 1; continue; }
      // find end of tag respecting quotes
      let j = i + 1, q = null;
      for (; j < n; j++) {
        const c = html[j];
        if (q) { if (c === q) q = null; }
        else if (c === '"' || c === "'") q = c;
        else if (c === '>') break;
      }
      const s = html.slice(i, j + 1);
      const close = s[1] === '/';
      const name = (s.match(/^<\/?([a-zA-Z0-9-]+)/) || [])[1]?.toLowerCase() || '';
      const tok = { t: close ? 'close' : 'open', s, name };
      toks.push(tok);
      i = j + 1;
      if (!close && RAW.has(name) && !/\/>$/.test(s)) {
        const re = new RegExp('</' + name + '\\s*>', 'i');
        const rest = html.slice(i);
        const m = rest.match(re);
        const end = m ? i + m.index : n;
        toks.push({ t: 'raw', s: html.slice(i, end), name });
        i = end;
      }
      continue;
    }
    let j = html.indexOf('<', i + 1);
    while (j > -1 && !/[a-zA-Z\/!]/.test(html[j + 1] || '')) j = html.indexOf('<', j + 1);
    if (j < 0) j = n;
    toks.push({ t: 'text', s: html.slice(i, j) });
    i = j;
  }
  return toks;
}

const hasLetters = (s) => /\p{L}/u.test(s.replace(/&[a-z#0-9]+;/gi, ''));
const norm = (s) => s.replace(/\s+/g, ' ');
const attr = (s, a) => { const m = s.match(new RegExp('\\s' + a + '\\s*=\\s*("([^"]*)"|\'([^\']*)\')', 'i')); return m ? (m[2] ?? m[3]) : null; };

/* Group tokens into segments. Returns a list of items: either a passthrough
   token or a segment {seg:true, toks:[...], lead, trail}. */
function segment(toks) {
  const out = [];
  let buf = [];
  let skipDepth = 0; const skipStack = [];
  const flush = () => {
    if (!buf.length) return;
    // split at unbalanced inline tags
    const stack = []; const bad = new Set();
    buf.forEach((tk, k) => {
      if (tk.t === 'open' && !VOID.has(tk.name) && !/\/>$/.test(tk.s)) stack.push(k);
      else if (tk.t === 'close') {
        const top = stack.length ? buf[stack[stack.length - 1]] : null;
        if (top && top.name === tk.name) stack.pop(); else bad.add(k);
      }
    });
    stack.forEach((k) => bad.add(k));
    let part = [];
    const emit = () => {
      if (!part.length) return;
      // trim leading/trailing whitespace text and <br>
      let a = 0, b = part.length - 1;
      const blank = (tk) => (tk.t === 'text' && !tk.s.trim()) || (tk.t === 'open' && tk.name === 'br');
      while (a <= b && blank(part[a])) a++;
      while (b >= a && blank(part[b])) b--;
      const core = part.slice(a, b + 1);
      const textual = core.some((tk) => tk.t === 'text' && hasLetters(tk.s));
      part.slice(0, a).forEach((tk) => out.push(tk));
      if (core.length && textual) out.push({ seg: true, toks: core });
      else core.forEach((tk) => out.push(tk));
      part.slice(b + 1).forEach((tk) => out.push(tk));
      part = [];
    };
    buf.forEach((tk, k) => {
      if (bad.has(k)) { emit(); out.push(tk); } else part.push(tk);
    });
    emit();
    buf = [];
  };
  for (const tk of toks) {
    // translate="no" / data-i18n-skip subtrees pass through untouched
    if (skipDepth) {
      out.push(tk);
      if (tk.t === 'open' && !VOID.has(tk.name) && !/\/>$/.test(tk.s) && tk.name === skipStack[skipStack.length - 1]) skipDepth++;
      else if (tk.t === 'close' && tk.name === skipStack[skipStack.length - 1]) { skipDepth--; if (!skipDepth) skipStack.pop(); }
      continue;
    }
    if (tk.t === 'open' && /\s(translate="no"|data-i18n-skip)/.test(tk.s)) {
      flush(); out.push(tk);
      if (!VOID.has(tk.name) && !/\/>$/.test(tk.s)) { skipDepth = 1; skipStack.push(tk.name); }
      continue;
    }
    const inline = (tk.t === 'open' || tk.t === 'close') && INLINE.has(tk.name);
    if (tk.t === 'text' || inline) buf.push(tk);
    else { flush(); out.push(tk); }
  }
  flush();
  return out;
}

/* Segment tokens → placeholder key + tag table */
function keyOf(segToks) {
  let k = '', id = 0; const tags = {}; const stack = [];
  for (const tk of segToks) {
    if (tk.t === 'text') k += tk.s;
    else if (tk.t === 'open') {
      id++;
      tags[id] = tk.s;
      if (VOID.has(tk.name) || /\/>$/.test(tk.s)) k += `<${id}/>`;
      else { k += `<${id}>`; stack.push({ id, name: tk.name }); }
    } else if (tk.t === 'close') {
      const top = stack.pop();
      k += `</${top.id}>`;
      tags['/' + top.id] = tk.s;
    }
  }
  return { key: norm(k).trim(), tags };
}

function restore(tr, tags) {
  const used = new Set();
  const outS = tr.replace(/<(\/?)(\d+)(\/?)>/g, (m, sl, id, self) => {
    const k = sl ? '/' + id : id;
    if (!(k in tags)) throw new Error('unknown placeholder ' + m);
    used.add(k);
    return tags[k];
  });
  // every original placeholder must be used
  for (const k of Object.keys(tags)) if (!used.has(k)) throw new Error('missing placeholder ' + k);
  return outS;
}

/* Attribute strings on a tag */
function attrStrings(tok) {
  const found = [];
  for (const a of TEXT_ATTRS) {
    const v = attr(tok.s, a);
    if (v && hasLetters(v)) found.push({ a, v });
  }
  if (tok.name === 'meta') {
    const key = attr(tok.s, 'name') || attr(tok.s, 'property') || '';
    const v = attr(tok.s, 'content');
    if (META_KEYS.test(key) && v && hasLetters(v)) found.push({ a: 'content', v });
  }
  if (tok.name === 'input') {
    const type = (attr(tok.s, 'type') || '').toLowerCase();
    const v = attr(tok.s, 'value');
    if ((type === 'submit' || type === 'button') && v && hasLetters(v)) found.push({ a: 'value', v });
  }
  return found;
}

function eachTagTok(items, fn) {
  for (const it of items) {
    if (it.seg) it.toks.forEach((tk) => tk.t === 'open' && fn(tk));
    else if (it.t === 'open') fn(it);
  }
}

/* ── JS strings ─────────────────────────────────────────────────────────── */
function jsStrings() {
  const set = new Set();
  /* _t("text") or _t("text", "context") → key "context|text" when one word
     means different things in different places (e.g. nav "Home" vs family home) */
  const re = /\b_t\(\s*(["'])((?:\\.|(?!\1).)*)\1\s*(?:,\s*(["'])([\w-]+)\3\s*)?[,)]/g;
  for (const f of JS_FILES) {
    const p = path.join(ROOT, f);
    if (!fs.existsSync(p)) continue;
    const src = fs.readFileSync(p, 'utf8');
    let m; while ((m = re.exec(src))) { const t = m[2].replace(/\\(["'\\])/g, '$1'); set.add(m[4] ? m[4] + '|' + t : t); }
  }
  // labels from site-config.js (rendered by both chrome skins)
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/site-config.js'), 'utf8'), sandbox);
  const T = sandbox.window.TILLI;
  [...T.NAV_ITEMS, ...T.FOOTER_LINKS].forEach((x) => set.add(x.label));
  set.add(T.NAV_CTA_LABEL);   // WHATSAPP_PREFILL stays English: Kavi reads it
  return [...set].filter(Boolean);
}
/* Optional header-only variants ("nav|<label>") for languages whose full label
   is too long for the header bar. Shipped when a language file has them;
   otherwise the chrome falls back to the plain label. Not reported as missing. */
function navKeys() {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js/site-config.js'), 'utf8'), sandbox);
  const T = sandbox.window.TILLI;
  return [...T.NAV_ITEMS.map((x) => x.label), T.NAV_CTA_LABEL, 'Get in touch'].map((l) => 'nav|' + l);
}

/* ── extract ────────────────────────────────────────────────────────────── */
function extract() {
  const byPage = {}; const seen = new Set();
  for (const page of PAGES) {
    const items = segment(tokenize(fs.readFileSync(path.join(ROOT, page), 'utf8')));
    const keys = [];
    const add = (k) => { if (!seen.has(k)) { seen.add(k); keys.push(k); } };
    for (const it of items) if (it.seg) add(keyOf(it.toks).key);
    eachTagTok(items, (tk) => attrStrings(tk).forEach(({ v }) => add(norm(v).trim())));
    byPage[page] = keys;
  }
  byPage['js'] = jsStrings().filter((k) => !seen.has(k) && seen.add(k));
  const all = Object.values(byPage).flat();
  const missing = {};
  for (const l of Object.keys(LANGS)) {
    const dict = loadDict(l);
    missing[l] = all.filter((k) => !(k in dict)).length;
  }
  fs.writeFileSync(path.join(I18N, 'source.json'), JSON.stringify({ missing, pages: byPage }, null, 1));
  const words = all.join(' ').replace(/<\/?\d+\/?>/g, ' ').split(/\s+/).filter(Boolean).length;
  console.log(`extracted ${all.length} strings (${words} words)`); console.log('missing per language:', missing);
}

function loadDict(l) {
  const p = path.join(I18N, l + '.json');
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
}

/* ── build ──────────────────────────────────────────────────────────────── */
function injectHead(lang, page, dict, jsKeys) {
  const L = LANGS[lang];
  const js = {};
  for (const k of jsKeys) if (dict[k]) js[k] = dict[k];
  let h = `\n<script>window.TILLI_LANG=${JSON.stringify(lang)};window.TILLI_I18N=${JSON.stringify(js).replace(/</g, '\\u003c')};` +
    `window._t=function(s,c){var d=window.TILLI_I18N;return (d&&((c&&d[c+'|'+s])||d[s]))||s;};</script>`;
  if (L.font) {
    h += `\n<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>` +
      `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${L.font}&display=swap">` +
      /* html[lang] outranks the tokens' :root, so Montserrat keeps the Latin
         glyphs and the Noto face fills in the script's letters */
      `\n<style>html[lang="${lang}"]{--tl-font-core:'Montserrat','${L.family}',system-ui,sans-serif;--tl-font-accent:'Montserrat','${L.family}',system-ui,sans-serif}` +
      `html[lang="${lang}"] body,html[lang="${lang}"] button,html[lang="${lang}"] input,html[lang="${lang}"] select,html[lang="${lang}"] textarea{font-family:var(--tl-font-core)}</style>`;
  }
  if (page === 'index.html') {
    /* Home's bottom pill nav: translated labels run longer than English, so
       trim each pill's side padding (English: 14px) to keep the row on screen */
    h += `\n<style>@media (min-width:641px){html #quicknav button{padding-left:${QUICKNAV_PAD}px;padding-right:${QUICKNAV_PAD}px}}</style>`;
  }
  if (page === 'index.html' || page === 'm/index.html') {
    /* Report-card chips ("Evidence-based"…) are nowrap in English; longer
       translations would spill past the card, so let them wrap inside it */
    h += `\n<style>html .fan-chip{white-space:normal;width:max-content;max-width:calc(100% + 16px);text-align:center;line-height:1.25}</style>`;
  }
  if (L.dir === 'rtl') {
    /* Right-to-left text, but the moving parts keep left-to-right mechanics:
       these strips/sliders scroll or translateX on the assumption that slide 1
       sits on the left (scrollLeft goes negative under RTL). Text inside them
       still shapes right-to-left; only the strip's direction is pinned. */
    h += `\n<style>html[dir="rtl"] :is(${RTL_PINNED.join(',')}){direction:ltr}</style>`;
    if (page === 'index.html') {
      /* Home: most scenes mirror cleanly, but in these the 3D dot figures sit
         on one side of the screen and mirrored text/cards would land on them.
         Keep their layout as in English; text inside still reads RTL. */
      const sc = HOME_LTR_SCENES.map((l) => `.scene[data-label="${l}"] .stage`).join(',');
      h += `\n<style>html[dir="rtl"] :is(${sc}){direction:ltr}` +
        `html[dir="rtl"] :is(${sc}) :is(h1,h2,h3,h4,p,li,blockquote,figcaption){direction:rtl}` +
        `html[dir="rtl"] :is(${sc}) div{unicode-bidi:plaintext}</style>`;
    }
  }
  if (L.font) {
    /* Arabic, Sinhala and Tamil letters stack taller than Latin ones: give
       headings room so diacritics and vowel signs don't touch the next line */
    h += `\n<style>html[lang="${lang}"] :is(h1,h2,h3){line-height:${HEADING_LH}}</style>`;
  }
  return h;
}

function build() {
  const jsKeys = [...jsStrings(), ...navKeys()];
  let report = [];
  for (const lang of Object.keys(LANGS)) {
    const dict = loadDict(lang);
    let hit = 0, miss = 0;
    const T = (k) => { if (dict[k] != null && dict[k] !== '') { hit++; return dict[k]; } miss++; return null; };
    for (const page of PAGES) {
      const src = fs.readFileSync(path.join(ROOT, page), 'utf8');
      const items = segment(tokenize(src));
      const headHasCharset = /<meta[^>]+charset/i.test(src);
      let html = '';
      const fixTag = (tk) => {
        let s = tk.s;
        for (const { a, v } of attrStrings(tk)) {
          const tr = T(norm(v).trim());
          if (tr) s = s.replace(new RegExp('(\\s' + a + '\\s*=\\s*)("[^"]*"|\'[^\']*\')', 'i'), (m, p1) => p1 + '"' + tr.replace(/"/g, '&quot;') + '"');
        }
        if (tk.name === 'html') {
          s = s.replace(/\slang="[^"]*"/, '').replace(/\sdir="[^"]*"/, '').replace(/^<html/i, `<html lang="${lang}" dir="${LANGS[lang].dir}"`);
        }
        if (tk.name === 'link' && /rel="canonical"/.test(s)) {
          s = s.replace(/href="([^"]*)"/, (m, u) => `href="${u}${u.includes('?') ? '&' : '?'}lang=${lang}"`);
        }
        if (tk.name === 'meta' && /property="og:url"/.test(s)) {
          s = s.replace(/content="([^"]*)"/, (m, u) => `content="${u}${u.includes('?') ? '&' : '?'}lang=${lang}"`);
        }
        return s;
      };
      for (const it of items) {
        if (it.seg) {
          const { key, tags } = keyOf(it.toks);
          const tr = T(key);
          let done = false;
          if (tr) {
            try {
              // translated tags may carry translatable attrs too (e.g. <a aria-label>)
              const fixed = {};
              let n = 0;
              for (const tk of it.toks) if (tk.t === 'open') { n++; fixed[n] = fixTag(tk); }
              for (const k of Object.keys(tags)) if (!k.startsWith('/')) tags[k] = fixed[k];
              html += restore(tr, tags); done = true;
            } catch (e) { report.push(`${lang} ${page}: ${e.message} in "${key.slice(0, 60)}"`); }
          }
          if (!done) it.toks.forEach((tk) => { html += tk.t === 'open' ? fixTag(tk) : tk.s; });
        } else if (it.t === 'open') {
          html += fixTag(it);
          /* right after <meta charset> (it must stay in the first 1024 bytes),
             or straight after <head> if a page has none */
          const isCharset = it.name === 'meta' && /charset/i.test(it.s);
          if (isCharset || (it.name === 'head' && !headHasCharset)) html += injectHead(lang, page, dict, jsKeys);
        } else html += it.s;
      }
      const dest = path.join(OUT, lang, page);
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, html);
    }
    console.log(`${lang}: ${hit} translated, ${miss} fell back to English`);
  }
  if (report.length) { console.log('\nproblems (fell back to English):'); report.slice(0, 40).forEach((r) => console.log(' ', r)); }
}

const cmd = process.argv[2];
if (cmd === 'extract') extract();
else if (cmd === 'build') build();
else if (cmd) console.log('usage: node i18n/build.mjs extract|build');
