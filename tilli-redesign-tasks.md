# Tilli Website Redesign — Mobile Pass: Implementation Spec

> **For:** a Claude Code / engineering session working on the Tilli redesign build.
> **Author:** Collin (Head of Sales). **Date:** 2026-10-06.
> **Scope of this pass:** mobile-first fixes across Home, Research ("Tilli for
> Research"), and School Success pages, plus a few site-wide (global) fixes.

---

## 0. How to use this file

- Work the tasks in **priority order** (P1 → P5). P1 are global and unblock the rest.
- Each task has a stable ID (`CHG-NN`). Reference these in commits and PRs.
- **Do not start any task whose `Blocked-by` is unresolved.** Stop and surface it
  instead of guessing. Open decisions are listed in §1.
- "Target" tells you how to locate the element. The build has no stable selectors
  documented here, so targets are given by page + visible heading/copy. Confirm the
  element before editing.
- A task is done only when every line under `Acceptance` is true, checked on a real
  phone viewport (≤ 430px wide) AND at desktop width for anything marked `global`.
- Site is built in **Wix** (Wix.com Website Builder). Confirm whether edits are made
  in the Wix editor or in an exported/custom-code build before starting — it changes
  how "same component everywhere" (CHG-07/09/19) is implemented.

---

## 1. BLOCKERS — resolve before the dependent tasks

| # | Decision / input needed | Blocks |
|---|---|---|
| B1 | ~~WhatsApp: remove or keep?~~ **RESOLVED:** rename "Ask-Tilli on WhatsApp" → "Ask-Tilli" everywhere (copy only). The WhatsApp icon itself stays — just make it consistent with Home (CHG-20/25). | CHG-06 |
| B2 | ~~Brain/heart columns: skill→column mapping~~ **RESOLVED:** 2 buckets — brain = Executive Function, heart = Social-Emotional (full lists in §2 / CHG-02). | CHG-02 |
| B3 | ~~Original HTML for the Research "Why" section~~ **RESOLVED:** there was no separate "Why" section; CHG-12 done via the WEIRD band work. | CHG-12 |
| B4 | **Drive folder** with school + training photos for the carousel. | CHG-22 |
| B5 | **Working session** on layout/direction before build. | CHG-13, CHG-14, CHG-18 |
| B6 | **E4 chart data.** Choose **Option A** (reach/growth per year — traction) vs **Option B** (baseline→endline outcome lift per skill — efficacy; recommended) **and** supply the real underlying numbers. Real data only; label source + n under the chart. **⏳ Awaiting Kavi — not yet received (asked 2026-10-09).** | CHG-29 |
| B7 | **School proof assets.** Real school photos + approved pull-quotes + named roles + (recommended) school logos & permission to display. **Set = NMAJS, Hippocampus, Musaeus** (consent confirmed; **GIG dropped — no consent**). **⏳ Awaiting assets — not yet received.** | CHG-30, CHG-32 (shared w/ CHG-22) |
| ~~B8~~ | ~~**E3 Top Results numbers.**~~ RESOLVED (2026-10-09) — user supplied: 95% teachers rate training effective · 9 in 10 children improved emotion regulation/term · built at Stanford, backed by UNICEF, validated w/ 12,510 children. | ~~CHG-28~~ |
| ~~B9~~ | ~~**"+28%" collision.**~~ RESOLVED (2026-10-09) — E3 uses none of the clashing figures; "+28%" stays unique to Hippocampus (E7). Still applies to CHG-32 if that card keeps its "+28%". | CHG-32 |

---

## 2. CANONICAL FACTS (single source of truth — never reintroduce old values)

Any task that touches these must use these values, even if the live page currently
differs.

- **Schools:** `53` confirmed. Not "30+", not "50+". Use the exact number.
- **Data points:** `579` per child **per year**. `2,895` = 5-year cumulative ONLY,
  and only phrased as "by the time they finish primary." Never as enrolment/first-round.
- **Skills:** `12` foundational skills across **2 buckets** — **Executive Function**
  (brain icon) and **Social-Emotional** (heart icon):
  - **Executive Function:** Attention, Working Memory, Cognitive Flexibility, Planning &
    Organization, Inhibition (Distraction), Inhibition (Response).
  - **Social-Emotional:** Emotion Awareness, Emotion Regulation, Relationship Skills,
    Empathy, Metacognition, Critical Thinking.
- **Fonts:** Montserrat + the existing desktop font set ONLY. **Fredoka is banned.**
- **Nav:** one component, identical on every page (source of truth = Home).
- **Footer:** one component, identical on every page (source of truth = Home/hero).
- **Ask-Tilli:** the product is named **"Ask-Tilli"** — never "Ask-Tilli on WhatsApp."
  It is an AI teacher assistant; do not name WhatsApp (or any channel) in its label.
- **RPP credit:** the NMAJS work was a Research-Practice Partnership (RPP) with
  **Stanford** and **NMAJS** (Nita Mukesh Ambani Junior School).

---

## 3. PRIORITY 1 — Global fixes (one change, every page; do first)

### CHG-09 · Unify navigation / hamburger menu — ✅ DONE
- **Pages:** all (reported on Research vs Home)
- **Scope:** global
- **Current:** Research page hamburger menu differs from Home.
- **Change:** Make the mobile nav a single shared component. Same items, order, and CTA
  on every page.
- **Acceptance:**
  - Opening the hamburger on Home, Research, and School Success shows identical items,
    order, and CTA.
  - Changing nav in one place changes it everywhere.

### CHG-07 + CHG-19 · Unify footer (= Home/hero footer) — ✅ DONE
- **Pages:** all (reported on mobile generally, and Research)
- **Scope:** global
- **Current:** footer differs between mobile and desktop, and Research ≠ Home.
- **Change:** One shared footer component; Home/hero footer is the canonical version.
  Reflow for narrow screens — nothing dropped, added, or reordered.
- **Acceptance:**
  - Home, Research, School Success footers are byte-identical in content/links/order.
  - Mobile footer carries the full desktop content, reflowed, not a reduced variant.

### CHG-10 · Remove Fredoka; enforce font system — ✅ DONE
- **Pages:** all
- **Scope:** global
- **Current:** Fredoka used in places.
- **Change:** Replace all Fredoka usage with Montserrat / existing desktop fonts.
- **Acceptance:**
  - Grep/inspect shows zero `Fredoka` references in CSS/theme/font config.
  - No rendered text uses a font outside the desktop set.

### CHG-06 · Remove "Ask-Tilli on WhatsApp" copy — ✅ DONE
- **Pages:** all
- **Scope:** global
- **Current:** multiple references to "Ask-Tilli on WhatsApp".
- **Change:** Rename every instance to just **"Ask-Tilli"** and remove any "on
  WhatsApp" / channel phrasing. Check: the Ask-Tilli / "any AI can answer" section,
  data-journey section, FAQ answers, feature copy, parent-survey copy.
- **Acceptance:**
  - No copy says "Ask-Tilli on WhatsApp" or implies WhatsApp is its channel.
  - Ask-Tilli is referred to by name alone, channel-neutral, site-wide.

---

## 4. PRIORITY 2 — Content accuracy (fix before any school sees the page)

### CHG-05 · "30+ schools" block — number, order, RPP credit — ✅ DONE
- **Page:** Home · **Scope:** mobile (verify desktop parity)
- **Current:** "30+ schools have joined…"; stat sits above the quote; no RPP credit.
- **Change:**
  1. Update number to **53** (per §2).
  2. Move the quote **above** the schools stat.
  3. Inside the quote block, state this was an **RPP with Stanford and NMAJS**.
- **Acceptance:** reads "53", quote precedes stat, RPP credit visible in the block.

### CHG-02 · Brain/heart icons over the two skill columns — ✅ DONE
- **Page:** Home · 360° section ("Get a 360-degree view of a student — 12 foundational
  skills, measured from each side, term after term.")
- **Scope:** mobile
- **Change:** Two buckets. Add a **brain** icon over the **Executive Function** column
  and a **heart** icon over the **Social-Emotional** column.
  - **Brain (Executive Function):** Attention, Working Memory, Cognitive Flexibility,
    Planning & Organization, Inhibition (Distraction), Inhibition (Response).
  - **Heart (Social-Emotional):** Emotion Awareness, Emotion Regulation, Relationship
    Skills, Empathy, Metacognition, Critical Thinking.
- **Note:** Metacognition and Critical Thinking sit in the **Social-Emotional** bucket
  here, not with the executive-function skills — per Tilli's framework. Keep them under
  the heart.
- **Acceptance:** brain icon over the Executive Function column, heart over the
  Social-Emotional column; each skill sits in the bucket listed above (6 and 6).

---

## 5. PRIORITY 3 — Quick mobile wins (low effort, visible)

### CHG-08 · Remove "View full desktop experience" — ✅ DONE
- **Page:** all (mobile) · **Scope:** mobile-only
- **Change:** Delete the "view full desktop experience" link/prompt on phones.
- **Acceptance:** element absent at mobile widths; no layout gap left behind.
- **Done:** the `<a class="switch" href="../?view=desktop">` link was already removed
  during the `m/index.html` rewrite (commit 6af0bfb); no `.switch` CSS or layout gap
  remains anywhere in the mobile build.

### CHG-04 · Add Ask-Tilli demo to mobile — ✅ DONE
- **Page:** Home · directly after the "any AI can answer" / Ask-Tilli comparison
- **Scope:** mobile
- **Current:** interactive Ask-Tilli demo exists on desktop, missing on mobile.
- **Change:** Port the demo to mobile with a phone-appropriate layout (not a shrunk
  desktop block).
- **Depends-on:** respect CHG-06 (no WhatsApp framing).
- **Acceptance:** demo present and usable on a phone, placed right after the comparison.
- **Done:** demo was already built in the `m/index.html` rewrite (commit 6af0bfb) —
  phone-appropriate layout, right after the comparison cards. This pass fixed the input
  placeholder clipping ("Ask about Sunrise Academy…" wrapped/clipped → "Ask about your school…").

### CHG-11 · Fix Research hero photo framing — ✅ DONE
- **Page:** Research · opening/landing
- **Scope:** mobile
- **Change:** Fix crop/focal point so the hero photo frames correctly at phone width.
- **Acceptance:** subject correctly framed, no awkward crop/overflow at ≤430px.
- **Done:** hero rebuilt to "Image 1" layout — text-first (eyebrow, H1, subtitle, desc,
  two CTAs) with the children photo as a full-bleed band below, at m/research.html:67.
  Baked focal `75% 62%`, height 220px (user-tuned via `?debug=1`). Photo height/focal stay
  tunable via `?debug=1`. Previous "Image 2" photo-hero+card variant preserved in git @79213fa.

### CHG-17 · Remove "high-density behavioural stream" line — ✅ DONE
- **Page:** Research · **Scope:** global (wherever it appears)
- **Change:** Delete "Our high-density behavioural stream enables researchers to build
  the next generation of AI" (and the section if it exists only for that line).
- **Acceptance:** phrase absent site-wide; surrounding layout still coherent.
- **Done:** already removed from both live builds during the CHG-16 Research rebuild —
  desktop research.html has no trace; m/research.html:293 notes "CHG-17 banner removed",
  no orphaned section. Only remaining copy is in the legacy Wix dump `Dataset _ Tilli.html`
  (not served; slated for deletion under deferred CHG-10 cleanup).

---

## 6. PRIORITY 4 — Layout rebuilds (real work)

### CHG-01 · 360° strands — bind each box to its strand — ✅ DONE
- **Page:** Home · 360° MEASURE section (teacher / parent / child strands)
- **Scope:** mobile
- **Current:** all strand text stacks together, all boxes stack together — pairing lost.
- **Change:** Pick ONE:
  - **A (swipe):** horizontal swipe, one strand per card (strand text + its own box);
    show all three together after.
  - **B (stacked):** keep vertical scroll but bind box to its strand (text1→box1,
    text2→box2, text3→box3).
- **Acceptance:** each strand's example box is visually attached to that strand; no
  orphaned boxes.
- **Done:** Option A (swipe rail, each strand + its box per `.mcard` + recap card) was already
  in place from the rewrite. This pass added swipe dot indicators (`.mrail-dots`, one per card,
  synced via IntersectionObserver + tap-to-scroll) and removed the dead `.strands` CSS rule.

### CHG-03 · Match child illustrations to desktop — ✅ DONE
- **Page:** Home · "Every child walks into middle school developmentally on track"
- **Scope:** mobile
- **Current:** the child illustrations on mobile differ from the desktop version of this section.
- **Change:** make the mobile child illustrations match the desktop ones (same artwork/style).
- **Acceptance:** mobile child illustrations match desktop; no style clash in one scroll.
- **Done:** full-bleed ROW of children whose OUTLINE is traced by dots cycling green/yellow/cyan,
  mirroring desktop (`.ot-kids` band + JS IIFE walking `assets/Student Outline.svg` via
  getPointAtLength, m/index.html:567 + :838). User signed off.

### CHG-15 · Rebuild triadic assessment protocol in code — ✅ DONE
- **Page:** Research · "How we measure" (triadic proto assessment protocol)
- **Scope:** mobile (likely global)
- **Current:** built from images.
- **Change:** rebuild directly in code (HTML/CSS), new layout, no screenshots/exports.
- **Acceptance:** section is live DOM, responsive, legible on mobile; zero raster images
  of the protocol.

### CHG-16 · Redesign "What we measure" data-structure folders — ✅ DONE
- **Page:** Research · "What we measure" (data structure)
- **Scope:** mobile
- **Change:** redesign the folder visuals — much stronger, on-brand.
- **Acceptance:** folders read clearly on mobile and match the design system.

### CHG-13 · New mobile layout for the six cognitive skills — ✅ DONE
- **Page:** Research · six cognitive skills
- **Scope:** mobile · **Blocked-by:** B5 (plan first)
- **Change:** design a new mobile layout (current one not working). Agree layout before
  building.
- **Acceptance:** six skills laid out per the agreed plan; legible, on-brand on mobile.

### CHG-14 · Domain/parameter chips mimic homepage buttons — ❌ REMOVED (not needed, 2026-10-08)
- **Page:** Research · other domains & parameters
- **Scope:** mobile · **Blocked-by:** B5 (discuss first)
- **Change:** chip size/shape/padding/layout should mirror the **homepage buttons**
  (not the hero).
- **Acceptance:** chips visually match the homepage button spec once agreed.

### CHG-18 · Redesign "AI use cases: research → action" — ❌ REMOVED (not needed, 2026-10-08)
- **Page:** Research (and anywhere it appears) · **Scope:** global
- **Blocked-by:** B5 (plan first)
- **Change:** new design direction for this section, applied everywhere it appears.
- **Acceptance:** redesigned per agreed direction; consistent across all instances.

### CHG-12 · Restore Research "Why" section to original HTML — ✅ DONE
- **Page:** Research · "Why" section
- **Scope:** mobile · **Blocked-by:** B3
- **Current:** drifted from the originally shared HTML.
- **Change:** restore to match the original.
- **Acceptance:** section matches the supplied original HTML.

---

## 7. PRIORITY 5 — School Success page overhaul

### CHG-21 · Make the page enticing / on-brand — ⬜ TODO (umbrella)
- **Current:** plain, reads AI-generated.
- **Change:** add Tilli character, warmth, and brand texture; bring it up to the other
  pages' standard.
- **Acceptance:** page uses the Tilli design system; no longer reads as a plain template.
- **Implemented by:** §8 / P6 (CHG-26…CHG-33, elements E1–E8) — the concrete execution of
  this task. CHG-21 is done when the P6 elements land.

### CHG-22 · Schools & trainings photo carousel (landing element) — ⛔ BLOCKED (B4)
- **Scope:** mobile (and desktop) · **Blocked-by:** B4
- **Change:** add a carousel of real school + training photos as the first element
  (above or below the hero).
- **Acceptance:** carousel present, swipeable on mobile, using real photos from B4.

### CHG-24 · Add an offerings section — ✅ DONE
- **Change:** add an "offerings" section consistent with how offerings appear elsewhere.
- **Acceptance:** offerings section present and consistent with site pattern.
- **Resolution (2026-10-09):** desktop parity — mobile (`m/success.html`) already had the
  "What schools get → Measure. Ask. Intervene." block; added the matching section to desktop
  `success.html` between the hero and the first case study, using DS primitives
  (`tl-section--tint`, `tl-section-head tl-center`, `tl-grid tl-grid--3`, `tl-card`) plus a
  small page-local step-accent treatment (`.o-card` green/cyan/yellow top border + `.o-kicker`)
  mirroring the mobile `.s-ocard` colour coding. Copy copied verbatim from mobile for parity.

### CHG-23 · Content review by Masoomi — ⬜ TODO (process)
- **Type:** process, not code.
- **Change:** route School Success copy to Masoomi (Learning Lead) for sign-off before
  ship.
- **Acceptance:** copy reviewed/approved before this page goes live.

### CHG-20 + CHG-25 · WhatsApp icon consistency — ✅ DONE
- **Pages:** Research (CHG-20), School Success (CHG-25)
- **Scope:** global
- **Current:** WhatsApp icon differs from the homepage landing icon.
- **Change:** Make the WhatsApp icon **identical to the homepage landing icon** (same
  asset, size, style) wherever it appears. This is a consistency fix, not removal.
- **Acceptance:** one consistent WhatsApp icon matching Home on every page.
- **Resolution (2026-10-08):** already satisfied by the single-source chrome. One glyph
  only — `WA_ICON` in `js/site-config.js` (`window.TILLI`); the floating bubble is built
  unconditionally on every page by `js/site-chrome.js` (desktop) and `js/m-chrome.js`
  (mobile), both reading that same `WA_ICON`. Single-source bubble CSS (desktop 62/32px in
  `css/site.css`; mobile 52/28px in `m-chrome.js`), no per-page icon/size/style override,
  and in-content `wa.me` links are text CTAs with no icon. Icon on Research + School Success
  is identical to Home in each skin. Desktop-vs-mobile size is the intended device split.

---

## 8. PRIORITY 6 — Success Story page elements (E1–E8)

> Source: [success-story-edits.md](success-story-edits.md) — a self-contained spec for the
> **School Success / "Success Story" page**. These elements are the concrete execution of
> CHG-21. Inspiration is Duolingo (about / efficacy / press) — **adapt to Tilli, never copy
> their numbers or copy.** E-numbers are kept in titles for traceability back to the spec.
>
> **Governing look (from E1 + E6, applies to the ENTIRE page):** one idea per section; big
> soft rounded cards (16–24px radius) on light grey fills; generous whitespace; centered
> section intros (small eyebrow + big headline). **No gradient** — gradient is Home-only;
> every other page gets a flat/clean background.

### CHG-26 · (E1) Clean centered intro header + de-crowd the whole page — ✅ DONE
- **Current:** page feels busy / "AI-generated"; too many elements per screen.
- **Change:** top intro band = small coloured uppercase eyebrow (`OUR IMPACT` / `SCHOOL
  SUCCESS`, accent, letter-spaced ~12–13px), one large bold rounded headline beneath
  (Montserrat, clamp ~40–64px, centered, deep navy/charcoal), heavy whitespace, nothing
  competing. Default headline *"Every child, developmentally on track by their 10th
  birthday."* (confirm copy). This density principle governs every section below.
- **Acceptance:** intro band matches the clean/spacious spec; the whole page reads
  one-idea-per-section, not crowded.
- **Resolution (2026-10-09):** done with CHG-31 as one header. Existing copy kept verbatim
  (eyebrow "Success Stories", headline "Schools that measure the whole child" — the spec's
  alternate headline was *not* used per user). Page-local `.s-hero-flat` in `success.html`
  gives the hero a flat `--tl-wash-green` fill (no gradient) + extra top/bottom whitespace and
  the E1 headline clamp (40–64px). Mobile already compliant. The de-crowd density principle is
  now the governing look; later P6 elements inherit it as they land.

### CHG-27 · (E2) Grouped "get in touch" contact block — icons + Tilli character — ✅ DONE
- **Change:** two-column band. Left: a **custom Tilli character** (girl with yellow
  headband), NOT Duo. Right: contact points grouped by purpose; each group = plain label +
  one or two bold links, each prefixed by a small accent icon showing HOW to reach out
  (calendar / envelope / document / laptop).
- **Tilli content (confirm groups before building; Tilli is private — NO investor line):**
  Partner / book a demo → Kavi's Calendly + kavindya@tillikids.com · Press/media →
  info@tillikids.com + Impact Report/Fact Sheet (.pdf) if available · General →
  info@tillikids.com + phone (+1 650-334-7904).
- **Notes:** overlaps the proposed Press/Newsroom page — if that gets built this block may
  move there (confirm home). Mobile: illustration stacks above the groups.
- **Acceptance:** spacious grouped contact band present with method icons + Tilli character;
  links route correctly.
- **Resolution (2026-10-09):** built on both success builds, after the case studies / before the
  existing closing CTA (home confirmed = this page, not the Newsroom page). Character =
  `assets/ds/tilli-girl-waving.png` (yellow headband). 3 confirmed groups: Partner/book a demo
  (demo + kavindya@tillikids.com), Press & media (info@tillikids.com), General (info@tillikids.com +
  tel +1 650-334-7904). Method icons are inline stroke SVGs (calendar/envelope/phone) in colour-coded
  wash chips (green/cyan/pink) — page-local `.rk*` classes. Book-a-demo reuses the per-skin
  convention: desktop `data-tl-open-form` modal, mobile `wa.me` (no Calendly exists). **Impact
  Report / Fact Sheet link omitted** — no confirmed PDF asset yet (orphaned `uploads/*.pdf` not
  wired); add later when an approved report exists.

### CHG-28 · (E3) "Tilli works" — headline + intro + Top Results checklist — ✅ DONE
- **Where:** high on the page, right after the CHG-26 intro band (the "why my school needs
  this" moment).
- **Change:** two-column band. Left: big bold *"Tilli works"* headline; 2–3 line intro with
  `assessment` / `the evidence` / `Stanford research` as accent inline links; a **"Top
  results:"** sub-label; then **3** outcome lines, each with a green check + the figure in
  accent. Right: warm Tilli character/children illustration (stacks below on mobile).
- **Content intent (per spec UPDATE):** show OVERALL / cross-school impact, **no location
  names** here. Candidate real figures (reword to true scope, "% who improved" — not
  "average % increase"): 95% of classrooms fewer behavioural complaints in 12 wks · 90% of
  learners improved emotion regulation in 12 wks · 88% of teachers more confident · 100%
  pilot completion across 35+ pilots. Max 3 lines.
- **Blocked-by:** **B8** (supply the real cross-school numbers — no fabricated aggregate)
  and **B9** (resolve the +28% collision). Hippocampus-specific figures (self-awareness
  +20%, conflict mgmt +23%, impulse control +28%) belong on the E7 card, NOT here.
- **Acceptance:** 3 confirmed, correctly-scoped outcome lines; figures trace to source; no
  place names; no number reused elsewhere with a different meaning.
- **Resolution (2026-10-09):** built on both success builds, high on the page (after the hero,
  before offerings). Two-column desktop (`.tw`), stacked mobile (illustration below). Three
  user-confirmed, place-name-free, cross-school lines with a green check + accent figure:
  Adoption — **95%** of teachers rate Tilli's training highly effective; Outcome — **9 in 10**
  children improved emotion regulation in a single term; Credibility — built at Stanford, backed
  by UNICEF, validated with **12,510 children**. Intro links `assessment`/`the evidence`/
  `Stanford research` → research.html. **B8 resolved** (real figures supplied). **B9 resolved** —
  E3 reuses no clashing figure; "+28%" stays unique to the Hippocampus card (E7). Illustration =
  placeholder tile pending a real Tilli asset.

### CHG-29 · (E4) Statistical bar-chart band ("the impact, in a graph") — ⛔ BLOCKED (B6 · ⏳ awaiting Kavi, not yet received)
- **Where:** mid page, after CHG-28. E3 states outcomes in words; this shows them as a chart.
- **Change:** centered headline + one-line intro, then a single clean bar chart in a soft
  rounded card — grouped bars, clear y-axis label, legend, Tilli palette. **Render in CODE
  (not an image), responsive; use the dataviz skill.**
- **Blocked-by:** **B6** — pick Option A (growth/reach per year) or Option B (baseline→endline
  lift per skill; recommended, true efficacy analogue) and supply real numbers.
- **HARD RULE:** real data only — every bar traces to a real source; label source + n under
  the chart; mark any estimate as such; never fabricate a trend.
- **Acceptance:** responsive coded chart in Tilli colours, every bar sourced + n labelled.

### CHG-30 · (E5) "Meet real Tilli schools" — named-role story feature — ⛔ BLOCKED (B7)
- **Where:** after CHG-29 (chart = aggregate proof; this = proof with a face + name).
- **Change:** centered headline + one-line intro, then featured story rows: large **real
  photo** tile one side (rounded card, soft shadow — NO fake play button), and on the other
  the **named real role owner** (school + role) + a 1–2 sentence outcome-focused story.
  Multiple stories: alternate image left/right, or a spacious swipeable carousel.
- **Blocked-by:** **B7** (photos + approved quotes + named roles). Nameable schools: NMAJS,
  Hippocampus, GIG — only with publish permission; confirm consent per school.
- **Notes:** reuse the CHG-32 (E7) card as the per-school unit; same component as CHG-22.
- **Acceptance:** at least one real, named, consented school story; spacious; swipeable on
  mobile.

### CHG-31 · (E6) Fix the current hero — remove gradient, keep content + CTA — ✅ DONE
- **Current:** existing Success Story hero sits on a gradient background.
- **Keep:** eyebrow `SUCCESS STORIES` (green accent), headline *"Schools that measure the
  whole child"* (Montserrat family, not Fredoka), the intro paragraph, and the pink pill
  CTA **"Bring Tilli to your school"** → route to Kavi's Calendly / book-a-demo.
- **Change:** **remove the gradient** (flat white / single very light wash); keep it clean
  and spacious per CHG-26. This de-gradient rule applies to the whole page. This band IS the
  real intro header — treat CHG-26 + CHG-31 as one header.
- **Acceptance:** hero content/CTA preserved, gradient gone, flat clean background.
- **Resolution (2026-10-09):** see CHG-26 — done as one header. Dropped `tl-hero--green` from
  the `success.html` hero in favour of a page-local flat `.s-hero-flat`; the shared
  `.tl-hero--green` rule stays, so faq.html + privacy-policy.html keep their gradient (de-gradient
  scoped to this page per user).

### CHG-32 · (E7) Case-study card — photo album + stat-pill align + logos — ⛔ BLOCKED (B7)
- **Keep (user likes the layout):** location eyebrow → school name → highlighted stat pill
  (big % + short label) → 2–4 line story. Photo card one side, text the other; flat (no
  gradient).
- **Changes:** (1) photo → **album/carousel** — subtle arrows + maybe small dots, **no**
  obvious carousel chrome and **no** peeking next slide; (2) **remove the inline source
  line** → move provenance to a small "Methodology / sources" link at the section foot or a
  hover tooltip on the stat (don't delete provenance entirely — it's credibility);
  (3) **vertically center** the two-line stat-pill label against the big figure.
- **Logos:** add a small monochrome school logo near the name (strong B2B trust anchor) —
  pending assets + display permission.
- **Blocked-by:** **B7** (photos, logos, permission). If this card keeps a "+28%", also **B9**.
- **Notes:** this is the reusable per-school unit feeding CHG-30 (E5) and the CHG-22
  carousel — **one component, reused**, not rebuilt three times.
- **Acceptance:** stepping photo album (no peek), provenance moved out of line, stat pill
  aligned, logo present where permitted.

### CHG-33 · (E8) Closing CTA band — Duolingo-style, add Tilli character — ✅ DONE (character deferred)
- **Where:** very bottom of the page, final band before the footer.
- **Keep:** copy *"Your school could be the next story"* + subcopy *"Tell us about your
  children and we'll show you what measuring the whole child looks like in practice."* +
  pink pill CTA.
- **Change:** redo the current flat-blue band Duolingo-style — add the **Tilli character**
  (girl with yellow headband) around the headline (waving / peeking / pointing at the
  button); big friendly rounded pill; generous whitespace; flat background (no gradient);
  light Tilli-colour personality (yellow/teal, confetti-ish) kept subtle.
- **CTA consistency:** decide whether this label matches the hero's ("Bring Tilli to your
  school") or is deliberately different (e.g. "Book a call with Kavi"); both route to Kavi's
  Calendly / book-a-demo.
- **Acceptance:** warm, on-brand closing band with Tilli character; CTA label decision made;
  no gradient.
- **Resolution (2026-10-09):** upgraded the existing flat cyan band into a bolder, more
  spacious terminal band on both builds (page-local `.s-cta` — larger headline + generous
  padding; flat wash, no gradient). Copy kept per user ("Your school could be the next story" /
  "Get in touch"; CTA routes desktop `data-tl-open-form` modal, mobile `wa.me`). Mobile button
  switched cyan→pink for contrast + hero consistency. **Character deferred** — the only mascot
  (`tilli-girl-waving.png`) is already used by the E2 band directly above; add a distinct
  character later (tracked under PROGRESS.md "Deferred"). Completes all buildable P6 work.

---

## 9. Cross-cutting acceptance (run once at the end)

- One nav, one footer, one font system across Home / Research / School Success.
- No Fredoka, no "30+", no "2,895 on enrolment", no WhatsApp-as-Ask-Tilli-channel.
- Every section that exists on desktop exists on mobile (Ask-Tilli demo, footer, etc.).
- Full page tested at ≤430px with no horizontal scroll, and keyboard/focus intact.
