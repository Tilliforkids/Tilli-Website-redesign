# Success Story Page — Claude Code Edit List

> Self-contained spec for ONE tagged Claude Code change on the **Success Story page**.
> Drop this into Claude Code as the instruction set for that change.
> Separate from redesign-tasks-2.md (the running capture list).

## References (inspiration — do not copy, adapt to Tilli brand)
- https://about.duolingo.com
- https://www.duolingo.com/efficacy  — closest analogue to Tilli's evidence/impact story
- https://press.duolingo.com/#contact — (press/newsroom; may become a separate page)

## Guardrails for every element below
- Use Tilli's own content, numbers, and brand (colours, Montserrat/desktop fonts).
- Canonical facts: 53 schools · 579 data points/child/year · 12 skills in 2 buckets
  (Executive Function + Social-Emotional). Never Duolingo's numbers or copy.
- Each element = what to add + where on the page + any data it needs.

---

## Elements to add
<!-- One entry per screenshot the user sends. Format:

### E1 — <name of element>
- **Inspiration:** <which ref / screenshot>
- **What it is:** <plain description>
- **Where on page:** <section / order>
- **Tilli content:** <what fills it>
- **Notes / interactions:** <animation, responsive, etc.>
-->

### E1 — Clean centered intro header + de-crowd the whole page
- **Inspiration:** about.duolingo.com "OUR MISSION" block (screenshot 1).
- **What it is:** a small coloured uppercase eyebrow label, centered; one large bold
  rounded headline beneath it (a single statement, 1–2 lines); very generous whitespace
  above and below. Nothing else competing in that band.
- **Where on page:** top of the Success Story page, as the intro/hero band — sets the
  tone before any cards or stories.
- **Tilli content:**
  - Eyebrow: e.g. `OUR IMPACT` or `SCHOOL SUCCESS` (Tilli accent colour, letter-spaced,
    ~12–13px, uppercase).
  - Headline: one clean line in Montserrat bold, large (clamp ~40–64px), centered,
    deep navy/charcoal. Default suggestion: *"Every child, developmentally on track by
    their 10th birthday."* — confirm/replace copy.
- **Density principle (applies to the ENTIRE page, not just the header):**
  - One idea per section. Kill the crowding — the current page feels busy and
    "AI-generated"; this is the fix.
  - Big soft rounded cards (16–24px radius), light grey fills (#F6F8FA-ish), lots of
    internal padding, lots of space between sections.
  - Centered section intros (small eyebrow + big headline), content below.
  - Fewer elements per screen; let whitespace do the work.
- **Notes:** this is the governing look for the page redesign — later elements (E2+)
  should slot into this clean, spacious system.

### E2 — Grouped "get in touch" contact block with method icons + Tilli character
- **Inspiration:** press.duolingo.com contact block (screenshot 2).
- **What it is:** two-column band. Left: a friendly character illustration (Duo at a
  computer). Right: contact points grouped by purpose, each group = a plain label, then
  one or two bold links, each prefixed by an icon showing HOW to reach out (envelope =
  email, document = PDF, laptop = website, ? = help).
- **Where on page:** lower section of the Success Story page as a clean "reach out"
  band. (NOTE: overlaps the proposed Press/Newsroom page — redesign-tasks-2.md P5. If
  that page gets built, this block may move/duplicate there. Confirm home.)
- **Tilli content — adapt groups to Tilli (do NOT copy Duolingo's; Tilli is private, so
  NO investor/shareholder line):**
  - **Partner with us / book a demo:** → Kavi's Calendly link (calendar icon) +
    kavindya@tillikids.com (envelope).
  - **Press or media:** → info@tillikids.com (envelope) + Impact Report / Fact Sheet
    (.pdf) (document icon) — if we have one to link.
  - **General enquiries:** → info@tillikids.com (envelope) + phone (+1 650-334-7904).
  - Confirm which groups we actually want before building.
- **Illustration:** use a **custom Tilli character** (girl with yellow headband), NOT
  Duo. "doors element" in the note = the mascot/illustration beside the contacts.
- **Notes:** icons are small, in Tilli accent; links bold; keep it spacious per E1.
  On mobile: stack illustration above the contact groups.

### E3 — "Tilli works" — headline + intro + Top Results checklist + illustration
- **Inspiration:** duolingo.com/efficacy "duolingo works / top results" block (screenshot 3).
- **What it is:** two-column band.
  - Left column (top→bottom): a big bold headline (*"Tilli works"*); a 2–3 line intro
    sentence with a few keywords highlighted in Tilli accent as inline links; then a
    **"Top results:"** sub-label; then 3 outcome lines, each with a green check icon and
    the key figure highlighted in accent colour.
  - Right column: a warm Tilli character/children illustration.
- **Where on page:** high on the Success Story page — right after the E1 intro band.
  This is the "what are we selling / why my school needs this" moment.
- **Why the user wants it:** a school leader lands here and immediately sees, in 3
  lines, the concrete outcomes. "This is exactly what my school needs."
- **Tilli content:**
  - Headline: *"Tilli works"* (Montserrat bold; Tilli brand, not Duolingo's lowercase).
  - Intro: e.g. *"See how Tilli's research-backed approach delivers measurable results.
    Explore our assessment, the evidence, and our Stanford research."* — highlight
    `assessment`, `the evidence`, `Stanford research` as accent inline links.
  - **Top results — 3 lines (figure highlighted). CONFIRM every number against the
    canonical source before shipping (we have had number conflicts):**
    1. ✓ **95%** of classrooms showed fewer behavioural complaints within 12 weeks
    2. ✓ **90%** of learners improved emotion regulation after 12 weeks
    3. ✓ **+28%** teacher readiness to implement SEL in one week (Jordan, UNRWA/UNICEF)
  - These are outcome metrics (child/teacher change), NOT vanity reach numbers — keep it
    that way; swap in better real ones if available.
- **Notes:** 3 results max (user said "just top three / top results"). Check icon in
  Tilli teal/green; figures in accent. Illustration = custom Tilli characters.
  Mobile: illustration stacks below the text.

### E4 — Statistical bar-chart band ("the impact, in a graph")
- **Inspiration:** duolingo.com/efficacy "duolingo is improving" bar chart (screenshot 4).
- **What it is:** centered headline + one-line intro, then a single clean bar chart in a
  soft rounded card. Grouped bars across an x-axis, clear y-axis label, legend below,
  Tilli palette. Statistical, credible, "clear impact rather than just numbers."
- **Where on page:** mid Success Story page, after E3 (Top Results). E3 states the
  outcomes in words; E4 shows them as a chart.
- **Build:** render in CODE (not an image), responsive, Tilli colours. Use the dataviz
  skill when building.

- **TWO OPTIONS — pick based on what real data we can stand behind:**
  - **Option A (what the user suggested): growth over years.**
    - Bars = schools (or children) reached per year, e.g. 2023 / 2024 / 2025 / 2026.
    - Honest, easy, but note: this is a TRACTION story (we grew), not an EFFICACY story
      (children improved). To a principal it shows Tilli is healthy, not that their
      child benefits.
  - **Option B (recommended — the true analogue to this screenshot): baseline → endline
    outcome lift.**
    - Grouped bars = a few skills (e.g. Emotion Regulation, Attention, Empathy), each
      showing baseline vs endline score. Mirrors Duolingo's "improving" chart and is
      real OUTCOME proof.
    - Needs real aggregated assessment data (one cohort/school is enough). This is the
      strongest thing we could put on the page.

- **HARD RULE:** real data only. Every bar must trace to a real source; label the source
  and the n under the chart. If a figure is estimated, say so. Do NOT fabricate a trend.
- **Decision needed:** A, B, or both — and the underlying numbers. Flagged as a blocker
  for this element.

### E5 — "Meet real Tilli schools" — testimonial / story feature
- **Inspiration:** duolingo.com "meet real duolingo learners" block (screenshot 5).
- **What it is:** centered headline + one-line intro, then a featured story: a large
  media tile on the left, a short pull-quote/story caption on the right. Clean, two-up,
  lots of space (per E1).
- **Where on page:** after E4 (the chart). Chart = proof in aggregate; this = proof with
  a face and a name.
- **ADAPTATION (user): we don't have videos — use IMAGES + the story text on the side.**
  - Left tile: a real photo (school / classroom / principal / training), rounded card,
    soft shadow. No fake YouTube play button.
  - Right: who it is — **real role owner, named** (school + role, e.g. "Ms. X,
    Principal, GIG International School"), then a 1–2 sentence outcome-focused story.
  - Multiple stories: either stack 2–3 featured rows (alternate image left/right), or a
    simple swipeable carousel. Keep it spacious.
- **Why the user likes it:** clearly named, credible, "very clear sales thing" — real
  role owners, not anonymous quotes.
- **Tilli content — nameable schools (per earlier decision): NMAJS, Hippocampus, GIG.**
  Use only quotes/photos we have permission to publish; confirm consent per school.
- **Depends-on:** real school photos + approved quotes + named roles. Blocker for build.
- **Notes:** structure is reusable for the School Success "carousel of schools &
  trainings" idea (redesign-tasks-2.md CHG-22) — consider one component for both.

### E6 — Fix the CURRENT Success Story hero (de-gradient, keep content + CTA)
- **Source:** screenshot 6 is Tilli's EXISTING Success Story hero (not Duolingo).
- **Keep (content is good):**
  - Eyebrow `SUCCESS STORIES` (green accent, uppercase, letter-spaced).
  - Headline *"Schools that measure the whole child"* (heavy sans — already NOT Fredoka,
    good; keep in the Montserrat/desktop family).
  - Intro paragraph (the "three-year partnership… / research-practice collaboration…"
    copy) — keep.
  - CTA **"Bring Tilli to your school"** (pink pill) — user likes it; keep it, or swap
    for a different button style. Route it to Kavi's Calendly / book-a-demo.
- **Change:**
  - **Remove the gradient background.** Gradient is only used on the Home page; keep it
    off every other page for consistency. Use a flat clean background (white or a single
    very light wash), per E1's clean direction.
  - Keep it very clean and spacious. Light icons are OK if they help, but nothing heavy
    or busy.
- **Relationship to E1:** this IS the real intro band E1 described. E1 = the clean
  principle; E6 = apply it to this existing hero. Treat as one header.
- **Notes:** this de-gradient + clean rule applies to the whole Success Story page, not
  just the hero.

### E7 — Case-study card layout (photo + named school + stat pill + story)
- **Source:** screenshot 7 is Tilli's current case-study card (Hippocampus). User likes
  the layout — keep it as the template for each named school.
- **Layout to keep:** location eyebrow (e.g. `KARNATAKA, INDIA`) → school name headline
  → highlighted stat pill (big % + short label) → 2–4 line story → [source line].
  Photo card on the left, text on the right. Clean, flat (no gradient, per E6).
- **Changes:**
  1. **Photo → album/carousel.** Make the left photo a swipe/click-through gallery with
     arrows. User does NOT want obvious carousel chrome or a "next" preview — just an
     album you can step through. Subtle arrows + maybe small dots; no peeking next slide.
  2. **Remove the source line** ("Source: Hippocampus × Tilli End-of-Year Report…").
     → RECOMMENDATION (user to decide): don't delete the provenance entirely — move it to
     a small "Methodology / sources" link at the foot of the whole section, or a hover
     tooltip on the stat. For a principal, a traceable source is credibility; a naked
     stat is weaker. Keep it lightweight, just not inline.
  3. **Align the green stat pill text.** Vertically center the two-line label against the
     big `+28%`; consistent left edge/baseline so it doesn't look misaligned.
- **Logos — user asked "do we need school logos?": YES, recommend adding.**
  - Small school logo near the school name (or in place of / beside the location
    eyebrow). For a B2B buyer, a recognised logo is a strong trust anchor.
  - Pending: logo assets + permission to display each (NMAJS, Hippocampus, GIG).
  - Keep logos monochrome/clean so they sit well on the flat background.
- **Relationship:** this card is the per-school unit that feeds E5 (the "meet real Tilli
  schools" feature) and the CHG-22 carousel. One component, reused.

### E8 — Closing CTA band (Duolingo-style, add the Tilli character)
- **Source:** screenshot 8 is Tilli's current closing CTA ("Your school could be the next
  story" / "Get in touch" on flat blue). User isn't a fan — wants it redone
  Duolingo-style, possibly with the Tilli character. ("Just think about it.")
- **Keep:** the copy is strong — *"Your school could be the next story"* + subcopy *"Tell
  us about your children and we'll show you what measuring the whole child looks like in
  practice."* Keep the pink pill CTA.
- **Make it Duolingo-style:**
  - Add the **Tilli character** (girl with yellow headband) beside/around the headline —
    waving, peeking in, pointing at the button. This is the warmth Duolingo gets from Duo
    appearing at its CTAs.
  - Big, friendly, rounded pill button; generous whitespace; playful but still clean
    (flat background, no gradient per E6). A little Tilli-colour personality (yellow/teal
    accents, confetti-ish shapes) is fine if it stays light.
- **CTA wording — consistency check:** E6 hero CTA = "Bring Tilli to your school"; this
  one = "Get in touch". Decide: make them the SAME label, or deliberately different
  (e.g. hero = "Bring Tilli to your school", closing = "Book a call with Kavi"). Both
  route to Kavi's Calendly / book-a-demo.
- **Where:** very bottom of the Success Story page, final band before the footer.

---

## ⚠️ CROSS-ELEMENT FLAG — the "+28%" collision
Two DIFFERENT "+28%" figures are now on the same page:
- E3 (Top Results): "+28% teacher readiness to implement SEL in one week (Jordan)".
- E7 (Hippocampus card): "+28% growth in impulse control, 2025–26".
Same number, different meaning, same page = a sharp principal will notice and distrust
both. FIX before build: use only one "+28%" on the page, or change one of the metrics so
the two headline figures are distinct. Decide which stays.

### E3 — UPDATE (supersedes the Top Results numbers above)
- **New intent (user):** Top Results should show OVERALL / cross-school impact, not
  place-specific. No location names in this block. Ideal shape: *"Across all Tilli
  schools, children's [skill] grew by an average of X%."*
- **DATA BLOCKER — do NOT fabricate an aggregate.** I do not currently hold a verified
  cross-school dataset to compute true averages (e.g. "average +X% in attention across
  all schools"). The real figures I have are scoped, not pooled. Options:
  - **(a) Produce a real aggregate** from source: the master assessment dataset /
    end-of-year reports (baseline→endline per skill, per school). If someone computes the
    genuine cross-school averages, use those. ← strongest, but needs the raw data.
  - **(b) Use the real figures we already have, reworded to their TRUE scope** (honest,
    no fabrication). Candidates to confirm against source:
    - 95% of classrooms showed fewer behavioural complaints within 12 weeks
    - 90% of learners improved emotion regulation after 12 weeks
    - 88% of teachers reported increased confidence
    - 100% pilot completion across 35+ school pilots
    (These are "% showing improvement," NOT "average % increase" — keep the wording
    accurate; don't convert one into the other.)
- **Hippocampus-specific figures (self-awareness +20%, conflict management +23%, impulse
  control +28%, 2025–26)** belong on the Hippocampus CARD (E7), not in the cross-school
  Top Results — they're one network, not "all schools."
- **Action:** confirm (a) or (b) and supply the real numbers before this block is built.
