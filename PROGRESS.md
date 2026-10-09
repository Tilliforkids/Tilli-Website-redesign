# Tilli Redesign — Mobile Pass · Live Progress

> Live status tracker for the `CHG-NN` tasks in [tilli-redesign-tasks.md](tilli-redesign-tasks.md).
> Updated by Claude as tasks are completed. Spec is the source of truth; this is the dashboard.
>
> **Legend:** ✅ done · 🔵 in progress · ⬜ todo · ⛔ blocked
> **Last updated:** 2026-10-09 — CHG-33 (E8) ✅ (closing CTA upgraded to a bold terminal band on both builds). **P5 + P6 now code-complete** — rest is external-blocked/process. Scope 29 tasks.

## At a glance

- **Done:** 23 / 29
- **In progress:** 0
- **Blocked:** 4  (CHG-22 → B4 · CHG-29 → B6 · CHG-30 → B7 · CHG-32 → B7)
- **Unblocked & remaining:** 2  (CHG-21 umbrella — awaits E4/E5/E7 · CHG-23 process — Masoomi)
- **Removed:** 2  (CHG-14, CHG-18)

```
[████████████████████████████████        ]  79%
```

> **P5 + P6 are code-complete** — every buildable task is done. All that remains is blocked on
> external inputs (B4 photos · B6 Kavi chart data · B7 school assets) or is process (CHG-23
> Masoomi review). Nothing further is buildable without those.

## Next up

→ **All buildable P5 + P6 work is done.** Nothing is currently buildable. Remaining:
  CHG-22 (⛔ B4, Drive photos) · CHG-23 (process — Masoomi review) · CHG-29 (⛔ B6, Kavi chart
  data) · CHG-30 + CHG-32 (⛔ B7, school photos/quotes/names/logos). Each unblocks the moment
  its external input arrives — see **Ask Kavi** + **Assets needed** below.

---

## P1 — Global (do first)
| Status | ID | Task |
|--------|----|------|
| ✅ | CHG-09 | Unify nav / hamburger menu |
| ✅ | CHG-07+19 | Unify footer (= Home/hero) |
| ✅ | CHG-10 | Remove Fredoka; enforce font system |
| ✅ | CHG-06 | Remove "Ask-Tilli on WhatsApp" copy |

## P2 — Content accuracy
| Status | ID | Task |
|--------|----|------|
| ✅ | CHG-05 | "53 schools" + quote order + RPP credit |
| ✅ | CHG-02 | Brain/heart icons on skill columns |

## P3 — Quick mobile wins
| Status | ID | Task |
|--------|----|------|
| ✅ | CHG-08 | Remove "View full desktop experience" |
| ✅ | CHG-04 | Ask-Tilli demo on mobile |
| ✅ | CHG-11 | Research hero photo framing |
| ✅ | CHG-17 | Remove "high-density behavioural stream" line |

## P4 — Layout rebuilds
| Status | ID | Task |
|--------|----|------|
| ✅ | CHG-01 | 360° strands — bind box to strand (swipe + dots) |
| ✅ | CHG-03 | Match child illustrations to desktop |
| ✅ | CHG-15 | Triadic protocol — desktop uses Triad.svg vector, lines extended full-bleed |
| ✅ | CHG-16 | Redesign data-structure folders (white cards + folder glyph, both builds) |
| ✅ | CHG-13 | Six cognitive + SEL skills — mobile 2-col live card grids (B5 agreed) |
| ❌ | CHG-14 | Domain/parameter chips — **REMOVED** (not needed) |
| ❌ | CHG-18 | AI use cases redesign — **REMOVED** (not needed) |
| ✅ | CHG-12 | Restore Research "Why" — done (no "Why" section existed; covered by WEIRD band work) |

## P5 — School Success
| Status | ID | Task |
|--------|----|------|
| ⬜ | CHG-21 | Make page on-brand |
| ⛔ | CHG-22 | Photo carousel — **B4** (Drive photos) |
| ✅ | CHG-24 | Offerings section — desktop parity (mobile already had it) |
| ✅ | CHG-25+20 | WhatsApp icon consistency — already single-source (WA_ICON) in both skins |
| ⬜ | CHG-23 | Masoomi content review (process) |

## P6 — Success Story page elements (E1–E8, implements CHG-21)
| Status | ID | Task |
|--------|----|------|
| ✅ | CHG-26 (E1) | Clean centered intro header + de-crowd whole page |
| ✅ | CHG-27 (E2) | "Get in touch" contact block — icons + Tilli character |
| ✅ | CHG-28 (E3) | "Tilli works" + Top Results checklist |
| ⛔ | CHG-29 (E4) | Statistical bar-chart band (coded) — **B6** (⏳ awaiting Kavi) |
| ⛔ | CHG-30 (E5) | "Meet real Tilli schools" story feature — **B7** (⏳ awaiting assets; fold into existing cards) |
| ✅ | CHG-31 (E6) | Fix hero — remove gradient, keep content + CTA |
| ⛔ | CHG-32 (E7) | Case-study card — photo album + logos + align — **B7** |
| ✅ | CHG-33 (E8) | Closing CTA band — bolder terminal band (character deferred — asset needed) |

---

## Follow-ups (deferred cleanup)
- **Fredoka leftovers (from CHG-10)** — user chose to keep for now; delete when ready:
  - `_ds/.../assets/fonts/fredoka-normal-latin.woff2` + `-ext.woff2` (orphaned, unreferenced)
  - `Dataset _ Tilli.html` + `Dataset _ Tilli_files/` (old Wix site export, repo root)

## Ask Kavi (open data requests)
- ⏳ **B6 — E4 chart data (CHG-29).** Not yet received. Ask Kavi for the chart numbers. The ask:
  *"For the Success-page impact chart, which do you want and what are the real numbers + source/n?
  Option A = reach/growth per year (traction). Option B (recommended) = baseline→endline lift per
  skill (true efficacy). Real data only — every bar must trace to a source and we'll label source
  + n under the chart."* Blocks CHG-29 until answered.

## Assets needed (B7 — for CHG-30/E5, also unblocks CHG-32/E7 + CHG-22)
- ⏳ **Per school × 3 (Hippocampus, NMAJS, Musaeus):** (1) photo file — which file → which
  school; (2) named role owner — full name + exact title; (3) approved quote (1–2 sentences,
  cleared to publish); (4) optional logo + permission (monochrome). Consent confirmed; actual
  files/text not yet received. GIG dropped (no consent).

## Deferred (needs a new asset)
- ⬜ **E8 closing-CTA character (CHG-33).** Shipped without a character — the only mascot
  (`tilli-girl-waving.png`) is already used by the E2 band directly above it. Add a **distinct**
  Tilli character to the closing band when one exists. Hook: page-local `.s-cta` section on both
  success builds.

## Content ideas to place (Success Story page)
- ⬜ **"Every school that has started with Tilli is still with us."** — a 100% retention /
  zero-churn trust line. Decide where on Success Stories it goes: candidate = an E3 (CHG-28)
  "Top results" checklist line (cross-school, no place names, no "+28%" clash — spec-clean);
  alt = a standalone trust line under the hero. Optionally pair with a partner count
  ("…across NN+ schools"). Placement + wording not yet confirmed.

## Blockers (clear these to unblock the ⛔ tasks)
| # | Needed | Unblocks |
|---|--------|----------|
| ~~B3~~ | ~~Original HTML for Research "Why" section~~ — RESOLVED, no such section | ~~CHG-12~~ |
| B4 | Drive folder of school + training photos | CHG-22 |
| B5 | Working session on layout/direction | CHG-13, CHG-14, CHG-18 |
| B6 | E4 chart: Option A (growth/yr) vs B (baseline→endline lift, recommended) + real numbers. **⏳ Awaiting Kavi — not yet received (asked 2026-10-09).** | CHG-29 |
| B7 | Real school photos + approved quotes + named roles + logos/permission. **Set = NMAJS, Hippocampus, Musaeus** (consent confirmed; **GIG dropped — no consent**). **⏳ Awaiting assets — not yet received.** E5 approach decided: fold photo + named person + quote into the 3 existing case-study cards (no new section). | CHG-30, CHG-32 (shared w/ CHG-22) |
| ~~B8~~ | ~~E3 Top Results numbers~~ — RESOLVED: user supplied 95% teachers rate training effective · 9 in 10 children improved emotion regulation / term · built at Stanford, backed by UNICEF, validated w/ 12,510 children | ~~CHG-28~~ |
| ~~B9~~ | ~~"+28%" collision~~ — RESOLVED: E3 uses none of the clashing figures; "+28%" stays unique to Hippocampus (E7). Still applies to CHG-32 if that card keeps +28% | CHG-32 |

## Change log
- 2026-10-09 — CHG-33 (E8) ✅ done. Upgraded the existing closing CTA into a bolder, more
  spacious terminal band on both builds (page-local `.s-cta`: bigger headline + generous
  padding), keeping the confirmed copy ("Your school could be the next story" / "Get in touch";
  desktop `data-tl-open-form` modal, mobile `wa.me`). Mobile button switched cyan→pink for
  contrast on the cyan wash + consistency with the hero. **Character deferred** — the only
  mascot (`tilli-girl-waving.png`) is already used by the E2 band directly above, so E8 ships
  without one until a distinct character asset exists. **This completes all buildable P5 + P6
  work.**
- 2026-10-09 — CHG-28 (E3) ✅ done; B8 + B9 cleared. Added the "Tilli works" band high on both
  success builds (right after the hero, before offerings). Two-column on desktop (`.tw`: Top
  Results checklist left, placeholder illustration tile right), stacked on mobile (illustration
  below, per spec). Headline "Tilli works" + intro with `assessment` / `the evidence` /
  `Stanford research` as accent links → research.html. Three user-confirmed, place-name-free,
  cross-school lines, figure in accent + green check: **95%** teachers rate training highly
  effective (Adoption) · **9 in 10** children improved emotion regulation in a term (Outcome) ·
  built at Stanford, backed by UNICEF, validated with **12,510 children** (Credibility). B9
  resolved — E3 reuses no clashing figure, "+28%" stays unique to Hippocampus (E7). Illustration
  is a placeholder tile pending a real asset; no provenance footnote added (line 3 carries the
  credibility/n).
- 2026-10-09 — CHG-27 (E2) ✅ done. Added a grouped "Get in touch" reach-out band to both
  success builds, inserted after the case studies and before the existing closing CTA. Two-column
  on desktop (`.rk`: Tilli character `assets/ds/tilli-girl-waving.png` left, groups right);
  stacked on mobile (illustration above, per spec). Three groups — Partner/book a demo
  (book-a-demo + kavindya@…), Press & media (info@…), General (info@… + phone +1 650-334-7904) —
  each link prefixed by an inline stroke-SVG method icon (calendar/envelope/phone) in a colour-coded
  wash chip (green/cyan/pink). Book-a-demo reuses the site convention: desktop `data-tl-open-form`
  modal, mobile `wa.me`. Impact-report PDF link omitted for now (no confirmed asset — B-item).
- 2026-10-09 — CHG-26 (E1) + CHG-31 (E6) ✅ done (handled as one header). Success hero kept all
  copy verbatim (eyebrow "Success Stories", h1 "Schools that measure the whole child", lead, pink
  CTA); removed the green→white gradient. Desktop now uses a page-local `.s-hero-flat` (flat
  `--tl-wash-green`, no gradient — matches mobile's flat wash for device parity) with extra
  top/bottom whitespace + headline bumped to the E1 clamp (40–64px). Scoped to this page: the
  shared `.tl-hero--green` in `css/site.css` is untouched, so faq.html + privacy-policy.html keep
  their gradient. Mobile `m/success.html` was already flat/centered/Montserrat — no change. This
  sets the governing clean/spacious look for the rest of P6.
- 2026-10-09 — CHG-24 ✅ done. Added the "What schools get → Measure. Ask. Intervene." offerings section to desktop `success.html` (between hero and first case study), reaching parity with mobile which already had it. Built on DS primitives (`tl-section--tint`, `tl-section-head tl-center`, `tl-grid tl-grid--3`, `tl-card`) + a small page-local step accent (`.o-card`/`.o-kicker`, green/cyan/yellow) mirroring mobile's `.s-ocard`; copy copied verbatim. Wash order stays alternating (green→tint→white→tint→white→cyan). All P5 code tasks now done.
- 2026-10-08 — CHG-20+25 ✅ done (no code change). Verified the WhatsApp icon is already single-source: one `WA_ICON` glyph in `site-config.js`, floating bubble built on every page by `site-chrome.js` (desktop) + `m-chrome.js` (mobile) from that same source; single-source bubble CSS, no per-page override. Icon on Research + School Success matches Home in each skin. Byproduct of the mobile-pass single-source chrome (like CHG-09/07).
- 2026-10-08 — Imported `success-story-edits.md` as **P6** (CHG-26…33, elements E1–E8) — the concrete execution of umbrella CHG-21 for the School Success / "Success Story" page. Added blockers **B6–B9** (E4 chart data, school proof assets, E3 cross-school numbers, the +28% collision). Scope 21 → 29; blocked 1 → 5.
- 2026-10-06 — Tracker created; baseline set, all tasks ⬜/⛔, none confirmed done.
- 2026-10-06 — CHG-12 ✅ done; B3 resolved (no separate "Why" section — the Research WEIRD band was restyled with an arc + fade instead). Also done ad-hoc (not a CHG): WEIRD band arc/fade redesign on desktop + mobile.
- 2026-10-06 — CHG-09 ✅ done. Shared nav was already single-source; hardened `.tl-nav a` / `.navdrawer a` (text-decoration + Montserrat) so interior pages stop inheriting page base styles (fixes underline/font). Fixed Home boot-veil z-index so the nav no longer fades in on landing. `version.json` → …-3.
- 2026-10-06 — CHG-07+19 ✅ done. Footer unified to the Home/hero canonical (image 1): FOOTER_LINKS → How it works/12 skills/Impact/FAQs/Privacy (no Get-in-touch/WhatsApp); interior + mobile rebuilt to match (mobile logo image, "Reach out:" prefix, hash-aware mHref, #how anchor on m/index); dynamic year everywhere incl. Home.
- 2026-10-06 — CHG-10 ✅ done. Live font config already Montserrat-only; reworded token comments, set the DS lint allow-list to Montserrat-only, scrubbed Fredoka from _ds_manifest.json. Grep Fredoka-free except deferred leftovers (see Follow-ups). P1 (global fixes) complete.
- 2026-10-06 — CHG-06 ✅ done. Live Ask-Tilli copy was already channel-neutral; stripped "on WhatsApp" from parent-survey captions (index/m/index) + FAQ, and cleaned the .dc.html comps ("Ask-Tilli", "ASK-TILLI", "In seconds."). Kept "Book a demo on WhatsApp" CTA + functional WhatsApp (bubble/links/form field/"Message us on WhatsApp").
- 2026-10-07 — CHG-05 ✅ done. Mobile already compliant (53, quote-above-stat, RPP credit). Desktop: number already 53; added "Research-Practice Partnership with Stanford & NMAJS" as a full-width eyebrow ABOVE the imp2 quote (grid row 1; qmark/qtext→row2, cite→row3). Kept the choreographed scroll order per user.
- 2026-10-07 — CHG-02 ✅ done. Mobile #skills buckets already existed with correct 6+6 mapping; swapped the placeholder SVG icons for user's assets/Brain.png + Heart.png, standalone (no tinted box). Mobile-only (desktop has no bucket layout). Was a cache issue on first view.
