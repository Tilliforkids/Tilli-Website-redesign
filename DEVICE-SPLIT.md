# Device Split — desktop vs. mobile (reference)

> **This is the doc to re-read whenever I say "Device Split", "the split",
> "device-forked design", or "the two designs".** It defines what we're
> doing and the current state so we don't re-litigate it each time.

## The core idea (non-negotiable)

Serve **two entirely separate builds**, chosen by **device** — **NOT** a single
responsive layout that reflows.

| Side | Lives at | What it is |
|---|---|---|
| **Desktop** | `/` (`index.html`) | The seamless **Three.js** scroll experience (scroll-jacked canvas). |
| **Mobile** | `/m/` (`m/index.html`) | A **separate build**: same story as a normal vertical scroll, **no 3JS canvas**. |

Each side has its **own markup/CSS/JS**. We switch at load time, not with
media queries on one DOM.

## "Lighter tech, not a lighter look"

The mobile build keeps the **SAME visual language** as desktop — same sections,
same colour order, same type system, same copy voice (question-led). The *only*
difference is delivery:

- Desktop: scroll-jacked `<canvas>` / Three.js.
- Mobile: the same sections rendered as a plain vertical scroll.

So "lightweight" = lighter **runtime**, same **design**. Do not simplify or
restyle the mobile aesthetic — mirror the desktop sections.

## How the fork works (current implementation)

One shared gate file is the single source of truth:

- [`js/device-split.js`](js/device-split.js) — parser-blocking, loaded **before any
  stylesheet** by **both** builds:
  - desktop `index.html` → `<script src="js/device-split.js">`
  - mobile `m/index.html` → `<script src="../js/device-split.js?v=2">`
- It detects **which build it's on from the URL** (last path segment `m` = mobile
  build), so the two sides can't disagree and loop.
  - On desktop build + visitor is mobile → `location.replace('m/…')`
  - On mobile build + visitor is desktop → `location.replace('../…')`
- "Is mobile?" = mobile UA **OR** iPad **OR** (narrow ≤820px **AND** touch).

### Testing overrides (per-load, NOT remembered)

| URL param | Effect |
|---|---|
| `?view=mobile` | Force the mobile build for this load only |
| `?view=desktop` | Force the desktop build for this load only |

No persistence on purpose — a stored choice (old `localStorage` key `tl-view`,
now actively cleared) would strand real visitors on the wrong build.

## Keeping the two builds from drifting

- **Shared design tokens**: both load the same `_ds/.../tokens/fonts.css` and
  `colors.css`. Colours/fonts change in one place.
- **Shared content**: aim to drive both from one content source (same JSON/Sheet)
  so copy and section order can't diverge. *(Mobile markup is currently hand-built
  in `m/index.html` — when editing a section on one side, edit the matching
  section on the other.)*
- **SEO**: mobile sets `<link rel="canonical">` to the desktop root; keep that.

> ⚠️ **Future drift risk:** mobile sections are currently duplicated markup, not
> generated from a shared source. **Triggered whenever** a section's copy or
> order changes on desktop and isn't mirrored into `m/index.html` — the two
> builds silently diverge. **Fix:** move both builds onto one content JSON and
> template the sections, or keep a checklist that every content edit touches both
> files.

## Hosting / domain

- **Wix can't host the custom code** (closed builder).
- Production is a **static host**; currently **GitHub Pages** on push to `main`,
  served at **`tillinewwebsite.ishanirai.com`** (see [`CNAME`](CNAME)). Repo:
  `github.com/Tilliforkids/Tilli-Website-redesign`. *(Cloudflare Pages was the
  earlier lean for the apex domain — revisit if we point `tillikids.com` directly.)*
- The domain **`tillikids.com`** was bought on Wix and **stays registered there**;
  it gets **repointed** to the host (change nameservers, cleanest; or edit A/CNAME
  records). Apex needs an **A/ALIAS** record — CNAME is invalid at the apex.
- **Push = live deploy.** Never commit/push without an explicit ask.

## Non-home pages

Only **Home** is the seamless-scroll / device-split treatment. Other pages
(`faq.html`, `research.html`, `privacy-policy.html`, `success.html`, etc.) are
normal static web pages reusing the design system — not forked.

## Quick file map

| File | Role |
|---|---|
| [`index.html`](index.html) | Desktop 3JS home |
| [`m/index.html`](m/index.html) | Mobile home (separate build) |
| [`js/device-split.js`](js/device-split.js) | The fork gate (shared) |
| [`js/main.js`](js/main.js) | Desktop 3JS experience |
| `_ds/.../tokens/` | Shared fonts + colour tokens |
| [`CNAME`](CNAME) | Deploy host |
