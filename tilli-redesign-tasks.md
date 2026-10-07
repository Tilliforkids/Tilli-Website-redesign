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

### CHG-11 · Fix Research hero photo framing — 🔵 IN PROGRESS
- **Page:** Research · opening/landing
- **Scope:** mobile
- **Change:** Fix crop/focal point so the hero photo frames correctly at phone width.
- **Acceptance:** subject correctly framed, no awkward crop/overflow at ≤430px.
- **Progress:** first pass shifted focal `center 28%` → `72% 32%` at m/research.html:68.
  User says this isn't right yet — reworking (awaiting details on what to change).

### CHG-17 · Remove "high-density behavioural stream" line — ⬜ TODO
- **Page:** Research · **Scope:** global (wherever it appears)
- **Change:** Delete "Our high-density behavioural stream enables researchers to build
  the next generation of AI" (and the section if it exists only for that line).
- **Acceptance:** phrase absent site-wide; surrounding layout still coherent.

---

## 6. PRIORITY 4 — Layout rebuilds (real work)

### CHG-01 · 360° strands — bind each box to its strand — ⬜ TODO
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

### CHG-03 · Match child illustrations to dashboard style — ⬜ TODO
- **Page:** Home · "Every child walks into middle school developmentally on track"
- **Scope:** mobile (confirm desktop)
- **Current:** child figures here use a different illustration style than the dashboard
  visuals.
- **Change:** unify to one illustration style across this section and the dashboard.
- **Acceptance:** consistent character/illustration style; no style clash in one scroll.

### CHG-15 · Rebuild triadic assessment protocol in code — ⬜ TODO
- **Page:** Research · "How we measure" (triadic proto assessment protocol)
- **Scope:** mobile (likely global)
- **Current:** built from images.
- **Change:** rebuild directly in code (HTML/CSS), new layout, no screenshots/exports.
- **Acceptance:** section is live DOM, responsive, legible on mobile; zero raster images
  of the protocol.

### CHG-16 · Redesign "What we measure" data-structure folders — ⬜ TODO
- **Page:** Research · "What we measure" (data structure)
- **Scope:** mobile
- **Change:** redesign the folder visuals — much stronger, on-brand.
- **Acceptance:** folders read clearly on mobile and match the design system.

### CHG-13 · New mobile layout for the six cognitive skills — ⛔ BLOCKED (B5)
- **Page:** Research · six cognitive skills
- **Scope:** mobile · **Blocked-by:** B5 (plan first)
- **Change:** design a new mobile layout (current one not working). Agree layout before
  building.
- **Acceptance:** six skills laid out per the agreed plan; legible, on-brand on mobile.

### CHG-14 · Domain/parameter chips mimic homepage buttons — ⛔ BLOCKED (B5)
- **Page:** Research · other domains & parameters
- **Scope:** mobile · **Blocked-by:** B5 (discuss first)
- **Change:** chip size/shape/padding/layout should mirror the **homepage buttons**
  (not the hero).
- **Acceptance:** chips visually match the homepage button spec once agreed.

### CHG-18 · Redesign "AI use cases: research → action" — ⛔ BLOCKED (B5)
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

### CHG-21 · Make the page enticing / on-brand — ⬜ TODO
- **Current:** plain, reads AI-generated.
- **Change:** add Tilli character, warmth, and brand texture; bring it up to the other
  pages' standard.
- **Acceptance:** page uses the Tilli design system; no longer reads as a plain template.

### CHG-22 · Schools & trainings photo carousel (landing element) — ⛔ BLOCKED (B4)
- **Scope:** mobile (and desktop) · **Blocked-by:** B4
- **Change:** add a carousel of real school + training photos as the first element
  (above or below the hero).
- **Acceptance:** carousel present, swipeable on mobile, using real photos from B4.

### CHG-24 · Add an offerings section — ⬜ TODO
- **Change:** add an "offerings" section consistent with how offerings appear elsewhere.
- **Acceptance:** offerings section present and consistent with site pattern.

### CHG-23 · Content review by Masoomi — ⬜ TODO (process)
- **Type:** process, not code.
- **Change:** route School Success copy to Masoomi (Learning Lead) for sign-off before
  ship.
- **Acceptance:** copy reviewed/approved before this page goes live.

### CHG-20 + CHG-25 · WhatsApp icon consistency — ⬜ TODO
- **Pages:** Research (CHG-20), School Success (CHG-25)
- **Scope:** global
- **Current:** WhatsApp icon differs from the homepage landing icon.
- **Change:** Make the WhatsApp icon **identical to the homepage landing icon** (same
  asset, size, style) wherever it appears. This is a consistency fix, not removal.
- **Acceptance:** one consistent WhatsApp icon matching Home on every page.

---

## 8. Cross-cutting acceptance (run once at the end)

- One nav, one footer, one font system across Home / Research / School Success.
- No Fredoka, no "30+", no "2,895 on enrolment", no WhatsApp-as-Ask-Tilli-channel.
- Every section that exists on desktop exists on mobile (Ask-Tilli demo, footer, etc.).
- Full page tested at ≤430px with no horizontal scroll, and keyboard/focus intact.
