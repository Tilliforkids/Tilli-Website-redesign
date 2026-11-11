/* ============================================================================
   Tilli — language + region at the edge (Cloudflare Pages Function).
   Runs only on page routes (see _routes.json), never on images/CSS/JS.

   1. Picks a language, first match wins:
        ?lang=xx in the URL  → also remembered in the tl-lang cookie
        tl-lang cookie       → the visitor's earlier choice
        browser language     → Accept-Language (non-English supported language)
        country              → COUNTRY_LANG below (Cloudflare's request.cf.country)
        time zone            → tl-auto cookie, set by js/i18n.js from the
                               browser's time zone (Cloudflare can't see it)
        English
   2. Serves the pre-built translated copy (i18n/pages/<lang>/…) at the SAME
      URL, so every relative asset path keeps working.
   3. Regional content: in LOCAL_PRICING_COUNTRIES the ₹ prices
      ([data-price="inr"]) are removed and the "ask for local pricing" lines
      ([data-price="local"]) are shown instead.
   4. Hands js/i18n.js what it needs for the banner + footer picker, and adds
      hreflang alternates so search engines index each language.
   ─────────────────────────────────────────────────────────────────────────── */

const LANGS = { en: 'English', ar: 'العربية', si: 'සිංහල', ta: 'தமிழ்', es: 'Español' };

/* Country (ISO code) → language we switch to automatically. */
const COUNTRY_LANG = { JO: 'ar', LK: 'si', ES: 'es' };

/* Countries that see "ask for local pricing" instead of the ₹ figures. */
const LOCAL_PRICING_COUNTRIES = ['JO', 'LK', 'ES'];

/* When true, a visitor in a COUNTRY_LANG country gets that language even if
   their browser asks for English (Google-style). false = English browsers
   stay English and only non-English browsers get switched. */
const COUNTRY_BEATS_ENGLISH_BROWSER = true;

const COOKIE = 'tl-lang';
const COOKIE_DAYS = 365;

/* URL path → source page. Extensionless and .html forms both resolve. */
const PAGES = new Set(['index', 'faq', 'jobs', 'opensource', 'privacy-policy', 'research', 'success',
  'team', 'terms', 'm/index', 'm/research', 'm/success']);

function pageFor(pathname) {
  let p = pathname.replace(/^\/+/, '').replace(/\.html$/, '');
  if (p === '' || p.endsWith('/')) p += 'index';
  return PAGES.has(p) ? p : null;
}

function browserLang(header) {
  if (!header) return null;
  const tags = header.split(',').map((part) => {
    const [tag, ...params] = part.trim().split(';');
    const q = params.find((x) => x.trim().startsWith('q='));
    return { code: tag.trim().toLowerCase().split('-')[0], q: q ? parseFloat(q.split('=')[1]) || 0 : 1 };
  }).filter((t) => t.code && t.q > 0).sort((a, b) => b.q - a.q);
  const hit = tags.find((t) => LANGS[t.code]);
  return hit ? hit.code : null;
}

function cookieLang(header) {
  const m = (header || '').match(/(?:^|;\s*)tl-lang=([a-z]{2})/);
  return m && LANGS[m[1]] ? m[1] : null;
}

function autoLang(header) {
  const m = (header || '').match(/(?:^|;\s*)tl-auto=([a-z]{2})/);
  return m && LANGS[m[1]] && m[1] !== 'en' ? m[1] : null;
}

function decide(request, url) {
  const q = (url.searchParams.get('lang') || '').toLowerCase();
  if (LANGS[q]) return { lang: q, how: 'url' };
  const c = cookieLang(request.headers.get('Cookie'));
  if (c) return { lang: c, how: 'cookie' };
  const b = browserLang(request.headers.get('Accept-Language'));
  if (b && b !== 'en') return { lang: b, how: 'browser' };
  const country = request.cf && request.cf.country;
  const cl = COUNTRY_LANG[country];
  if (cl && (!b || COUNTRY_BEATS_ENGLISH_BROWSER)) return { lang: cl, how: 'country' };
  const tz = autoLang(request.headers.get('Cookie'));
  if (tz) return { lang: tz, how: 'timezone' };
  return { lang: 'en', how: 'default' };
}

export async function onRequest(ctx) {
  const { request, env, next } = ctx;
  const url = new URL(request.url);

  /* the raw translated copies only make sense when served through here */
  if (url.pathname.startsWith('/i18n/')) return new Response('Not found', { status: 404 });

  const page = pageFor(url.pathname);
  if (!page || (request.method !== 'GET' && request.method !== 'HEAD')) return next();

  const { lang, how } = decide(request, url);
  const country = (request.cf && request.cf.country) || '';

  let res = null;
  if (lang !== 'en') {
    /* Pages serves foo.html at /foo, so ask for the extensionless path */
    const assetPath = '/i18n/pages/' + lang + '/' + page.replace(/(^|\/)index$/, '$1');
    const r = await env.ASSETS.fetch(new URL(assetPath, url.origin));
    if (r.ok) res = r;
  }
  if (!res) res = await next();

  const type = res.headers.get('Content-Type') || '';
  if (!res.ok || !type.includes('text/html')) return res;

  const localPricing = LOCAL_PRICING_COUNTRIES.includes(country);
  const isMobileCopy = page.startsWith('m/');
  const locale = { lang, how, country, langs: LANGS };

  let rw = new HTMLRewriter()
    .on('[data-price="inr"]', { element(el) { if (localPricing) el.remove(); } })
    .on('[data-price="local"]', { element(el) { if (localPricing) el.removeAttribute('hidden'); else el.remove(); } })
    .on('head', {
      element(el) {
        el.prepend('<script>window.TILLI_LOCALE=' + JSON.stringify(locale).replace(/</g, '\\u003c') + ';</script>', { html: true });
        el.append('<script src="/js/i18n.js?v=3" defer></script>', { html: true });
      }
    });
  if (!isMobileCopy) {
    /* hreflang alternates, built from the page's canonical URL */
    rw = rw.on('link[rel="canonical"]', {
      element(el) {
        const base = (el.getAttribute('href') || '').replace(/[?&]lang=[a-z]{2}/, '');
        if (!base) return;
        const alt = Object.keys(LANGS).map((l) =>
          `<link rel="alternate" hreflang="${l}" href="${base}${l === 'en' ? '' : (base.includes('?') ? '&' : '?') + 'lang=' + l}">`).join('');
        el.after(alt + `<link rel="alternate" hreflang="x-default" href="${base}">`, { html: true });
      }
    });
  }

  const out = rw.transform(res);
  const headers = new Headers(out.headers);
  /* the same URL now returns different HTML per visitor */
  headers.set('Vary', 'Accept-Language, Cookie');
  headers.set('Cache-Control', 'private, no-cache');
  headers.set('Content-Language', lang);
  if (how === 'url') {
    headers.append('Set-Cookie', `${COOKIE}=${lang}; Max-Age=${COOKIE_DAYS * 86400}; Path=/; SameSite=Lax; Secure`);
  }
  return new Response(out.body, { status: out.status, statusText: out.statusText, headers });
}
