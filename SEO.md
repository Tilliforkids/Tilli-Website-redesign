# SEO & launch-discoverability plan

Living doc. Work through it at the end, before and after `tillikids.com` is pointed at the new site.
Update the **Status** column and the **Changelog** at the bottom whenever something here changes.

_Last updated: 2026-10-28_

---

## 0. Where we stand today (audit, 2026-10-28)

| Page | `<title>` | Description | Canonical | OG image | Structured data |
|---|---|---|---|---|---|
| `index.html` | Tilli — Developmentally on track by age 10 | ✅ | ✅ (staging URL) | wordmark | ❌ |
| `success.html` | Success Stories — Tilli | ✅ | ❌ | wordmark | ❌ |
| `research.html` | Tilli for Research | ✅ | ❌ | wordmark | ❌ |
| `faq.html` | FAQs — Tilli | ✅ | ❌ | wordmark | ❌ |
| `privacy-policy.html` | Privacy Policy — Tilli | ✅ | ❌ | wordmark | ❌ |
| `team.html` | Our team — Tilli | ✅ | ❌ | wordmark | ❌ |
| `jobs.html` | Jobs @ Tilli — Tilli | ✅ | ❌ | wordmark | ❌ |
| `opensource.html` | Open Source — Tilli | ✅ | ❌ | wordmark | ❌ |
| `terms.html` | Terms of Service — Tilli | ✅ | ❌ | wordmark | ❌ |
| `m/index.html` | (same as desktop) | ✅ | ✅ → `/` | wordmark | ❌ |
| `m/success.html` | (same as desktop) | ✅ | ❌ | wordmark | ❌ |
| `m/research.html` | (same as desktop) | ✅ | ❌ | wordmark | ❌ |

Also missing site-wide: `sitemap.xml`, `robots.txt`, `404.html`, analytics, Search Console.
Every `og:url` / `og:image` / canonical points at the **staging domain** `tillinewwebsite.ishanirai.com`.

---

## 1. Decisions to make first

| # | Decision | Options | Recommendation |
|---|---|---|---|
| D1 | Final host name | `www.tillikids.com` vs bare `tillikids.com` | Use `www`, and redirect the bare domain to it. Wix serves `www` today, so the URLs Google already knows stay the same |
| D2 | How old Wix URLs redirect | (a) GitHub Pages + HTML redirect pages · (b) put Cloudflare (free) in front for real 301s | **(b)** if we're open to moving DNS to Cloudflare. GitHub Pages can't send real 301s |
| D3 | Analytics | GA4 · Plausible/Fathom (no cookies) · none | Plausible or GA4. If GA4 or the Meta pixel is used, we need a cookie banner for EU/UK visitors |
| D4 | Keep the Meta (Facebook) pixel from Wix? | yes / no | Ask whoever runs ads |
| D5 | What happens to the Wix blog, shop, events and open-source pages | rebuild · redirect to the closest new page · let them 404 | List them (step 2.1), then decide one by one |

---

## 2. Before launch

### 2.1 Capture what Google knows about the old site
- [ ] In Google Search Console for the current Wix site (Wix may already have verified it), export **Pages → Indexed** and **Performance → top pages/queries** (last 12 months).
- [ ] Search Google for `site:tillikids.com` and save the URL list.
- [ ] Download the Wix sitemap: `https://www.tillikids.com/sitemap.xml`. It lists every blog post and product URL.

### 2.2 Redirect map (old Wix URL → new page)
Fill this in from 2.1. Any URL with backlinks or traffic **must** redirect somewhere.

| Old Wix path | New target | Status |
|---|---|---|
| `/` | `/` | same URL |
| `/faq` | `/faq.html` | check (GitHub Pages usually serves `/faq` → `faq.html` on its own) |
| `/research` | `/research.html` | check (as above) |
| `/privacypolicy` | `/privacy-policy.html` | needs redirect |
| `/team-tilli` | `/team.html` | needs redirect |
| `/careers` | `/jobs.html` | needs redirect |
| `/tilli-for-school` | `/` or `/success.html`? | decide |
| `/asktilli-dataset` | `/research.html`? | decide |
| `/tilli-for-home` | ? | decide (D5) |
| `/shop` | ? | decide (D5) |
| `/terms-of-service` | `/terms.html` | needs redirect |
| `/opensource` | `/opensource.html` | check (same name, so GitHub Pages should serve it without a redirect) |
| `/webinar` | ? | decide (D5) |
| `/blog`, `/post/*` | ? | decide (D5) |

How to do it:
- **With Cloudflare (D2-b):** Rules → Redirect Rules, one 301 per row.
- **GitHub Pages only (D2-a):** add a folder per old path, e.g. `team-tilli/index.html`, containing
  `<meta http-equiv="refresh" content="0; url=/team.html">`, `<link rel="canonical" href="https://www.tillikids.com/team.html">`, and a `location.replace(...)` call. Google treats an instant meta refresh as a permanent redirect.

### 2.3 Switch every URL from staging to the real domain
- [ ] Replace `https://tillinewwebsite.ishanirai.com` with `https://www.tillikids.com` in every `og:url`, `og:image`, `twitter:image` and `canonical` (root and `/m/`).
- [ ] Change the `CNAME` file to `www.tillikids.com`.
- [ ] Bump `version.json`.

### 2.4 Canonicals and the device split (important)
The phone versions of Success and Research are separate pages under `/m/`, so Google needs to be told they're the same content as the desktop pages:
- [ ] Every desktop page gets `<link rel="canonical" href="https://www.tillikids.com/<page>">` pointing at itself.
- [ ] Each forked desktop page (`success`, `research`) also gets
  `<link rel="alternate" media="only screen and (max-width: 640px)" href="https://www.tillikids.com/m/<page>">`.
- [ ] Each `/m/` page gets a canonical pointing at its **desktop** URL (`m/index.html` already does this).
- [ ] The width in the `media` attribute should match the cutoff `js/device-split.js` uses.

### 2.5 Titles and descriptions
Each title should be under ~60 characters, each description under ~155, and no two pages should share them. Suggested changes:
- [ ] `Jobs @ Tilli — Tilli` → `Jobs at Tilli: Join our mission`
- [ ] `Tilli for Research` → `Research behind Tilli: SEL & foundational skills`
- [ ] `Success Stories — Tilli` → add a result, e.g. `School success stories — Tilli`
- [ ] Rewrite each description with the words a school leader would search for (SEL programme, foundational skills assessment, CBSE/IB, India/Sri Lanka). Claims must match `success.html`.

### 2.6 Sitemap, robots, 404
- [ ] `sitemap.xml` at the site root: list the desktop pages only, never `/m/` (they're covered by the alternate tags). Leave out the `.dc.html` drafts.
- [ ] `robots.txt`: allow everything, add `Sitemap: https://www.tillikids.com/sitemap.xml`, and block the drafts (`/*.dc.html`, `/_ds/`) or delete them before launch.
- [ ] `404.html` in the site design (GitHub Pages serves it automatically), with links to Home, FAQ and Book a call.

### 2.7 Structured data (JSON-LD)
- [ ] **Home:** `Organization` (name, logo, url, `sameAs` = the social links in `site-config.js`, email, address from the privacy policy) + `WebSite`.
- [ ] **FAQ:** `FAQPage` built from the questions on the page. Google shows FAQ rich results only for a few sites now, but AI search and assistants still read it.
- [ ] **Jobs:** `JobPosting` for each open role. This needs `datePosted`, `validThrough`, `employmentType` and `jobLocation`, **which the page doesn't have yet**, so we need those details from Piumi.
- [ ] **Team:** optional `Person` entries for the leadership team.
- [ ] **Open source:** optional `SoftwareSourceCode` entries for the GitHub repos (`tillioss/tilli-ide`, `tillioss/Godot-Strategies-V1`).
- [ ] Check each page with Google's Rich Results Test.

### 2.8 Sharing previews
- [ ] Make a 1200×630 share image (logo, tagline, brand colours). Right now every page uses the plain wordmark.
- [ ] Optional: a separate share image for Success and Research.
- [ ] Preview links with the LinkedIn Post Inspector and the WhatsApp link preview.

### 2.9 Can Google see the content? (the 3JS Home)
- [ ] All Home copy has to be real HTML text, not drawn on the canvas. It currently is; keep it that way.
- [ ] In Search Console, run **URL Inspection → View crawled page** on `/` and check the rendered HTML contains the headings and copy.
- [ ] Exactly one `<h1>` per page, with headings in order.
- [ ] Every `<img>` has a useful `alt`. Decorative images get `alt=""`.

### 2.10 Speed (Core Web Vitals)
- [ ] Run PageSpeed Insights on `/`, `/success.html` and `/m/success.html`, on both mobile and desktop.
- [ ] Big items already known: the dashboard video (compression is still an open item), the 3JS bundle size, and carousel images. Use WebP/AVIF, `loading="lazy"` below the fold, and `width`/`height` on images.
- [ ] Fonts: preload the main font file and use `font-display: swap`.

---

## 3. Launch day

1. Merge the URL switch (2.3) and redirects (2.2), then push.
2. In Wix: disconnect the domain from the Wix site and point DNS at GitHub Pages (or Cloudflare). Records:
   - `www` → CNAME `tilliforkids.github.io`
   - bare domain → A records `185.199.108.153`, `.109.153`, `.110.153`, `.111.153` (GitHub Pages)
3. In GitHub repo → Settings → Pages: set the custom domain to `www.tillikids.com` and turn on **Enforce HTTPS** once the certificate is issued.
4. Spot-check every row of the redirect map, plus `http://`, the bare domain and `www`.
5. Search Console: verify the **Domain property** `tillikids.com` with a DNS TXT record, submit `sitemap.xml`, and request indexing for Home, Success, Research and FAQ.
6. Bing Webmaster Tools: import the site from Search Console (this also covers ChatGPT/Copilot search, which use Bing's index).
7. Turn off or redirect the staging domain `tillinewwebsite.ishanirai.com` so it isn't indexed as a duplicate.

---

## 4. After launch

- [ ] **Week 1:** Search Console → Pages: look for 404s and "Duplicate without user-selected canonical", and fix any redirects that are missing.
- [ ] **Week 2–4:** compare clicks and queries with the export from 2.1. Expect a small dip while Google picks up the new pages.
- [ ] Google Business Profile: update the website link.
- [ ] Update the website link on LinkedIn, Instagram, X, YouTube, Facebook and any directory/partner listings.
- [ ] Ask partner schools and organisations that link to old Wix URLs to update them, for the links that matter most.
- [ ] Keep the redirects for at least a year (ideally permanently).
- [ ] Each quarter: refresh the jobs page, check the FAQ still matches Success, and re-run PageSpeed.

---

## 5. Nice-to-have

- `llms.txt` at the root, a short plain-text summary of Tilli for AI assistants.
- `hreflang` tags if translated pages are ever added.
- A blog or resources section, which is the main way to rank for searches like "SEL curriculum for CBSE schools".

---

## Changelog

| Date | Change |
|---|---|
| 2026-10-28 | Doc created. Initial audit. Added `team.html` and `jobs.html` (need redirects from `/team-tilli` and `/careers`, and a `JobPosting` schema once role details are known). |
| 2026-10-28 | Added `opensource.html` (content from Wix `/opensource`), linked from the Research "Open-source Toolkits" buttons. Its Terms of Service link still points at Wix `/terms-of-service`, which needs a decision (D5). |
| 2026-10-28 | `team.html` rebuilt as a 1-for-1 copy of the Wix team page (site font kept). |
| 2026-10-28 | `jobs.html` and `opensource.html` rebuilt as 1-for-1 copies of Wix `/careers` and `/opensource` (site font kept). |
| 2026-10-28 | Added `terms.html` (content from Wix `/terms-of-service`, styled like the Privacy Policy); Open Source now links to it. Module-1 GIF replaced by a 539 KB MP4. Deleted the old Wix export. |
