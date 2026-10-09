# Tilli Redesign — Mobile Pass · Live Progress

> Live status tracker for the `CHG-NN` tasks in [tilli-redesign-tasks.md](tilli-redesign-tasks.md).
> Updated by Claude as tasks are completed. Spec is the source of truth; this is the dashboard.
>
> **Legend:** ✅ done · 🔵 in progress · ⬜ todo · ⛔ blocked
> **Last updated:** 2026-10-08 — CHG-25+20 ✅ (WhatsApp icon already single-source in both skins). Scope 29 tasks.

## At a glance

- **Done:** 17 / 29
- **In progress:** 0
- **Blocked:** 5  (CHG-22 → B4 · CHG-28 → B8/B9 · CHG-29 → B6 · CHG-30 → B7 · CHG-32 → B7)
- **Unblocked & remaining:** 7
- **Removed:** 2  (CHG-14, CHG-18)

```
[███████████████████████                 ]  59%
```

## Next up

→ **CHG-24** — add an offerings section to School Success (last unblocked P5 code task;
  CHG-23 is a process review). Then P6 starts at CHG-26 (E1) + CHG-31 (E6).

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
| ⬜ | CHG-24 | Offerings section |
| ✅ | CHG-25+20 | WhatsApp icon consistency — already single-source (WA_ICON) in both skins |
| ⬜ | CHG-23 | Masoomi content review (process) |

## P6 — Success Story page elements (E1–E8, implements CHG-21)
| Status | ID | Task |
|--------|----|------|
| ⬜ | CHG-26 (E1) | Clean centered intro header + de-crowd whole page |
| ⬜ | CHG-27 (E2) | "Get in touch" contact block — icons + Tilli character |
| ⛔ | CHG-28 (E3) | "Tilli works" + Top Results checklist — **B8, B9** |
| ⛔ | CHG-29 (E4) | Statistical bar-chart band (coded) — **B6** |
| ⛔ | CHG-30 (E5) | "Meet real Tilli schools" story feature — **B7** |
| ⬜ | CHG-31 (E6) | Fix hero — remove gradient, keep content + CTA |
| ⛔ | CHG-32 (E7) | Case-study card — photo album + logos + align — **B7** |
| ⬜ | CHG-33 (E8) | Closing CTA band — Duolingo-style + Tilli character |

---

## Follow-ups (deferred cleanup)
- **Fredoka leftovers (from CHG-10)** — user chose to keep for now; delete when ready:
  - `_ds/.../assets/fonts/fredoka-normal-latin.woff2` + `-ext.woff2` (orphaned, unreferenced)
  - `Dataset _ Tilli.html` + `Dataset _ Tilli_files/` (old Wix site export, repo root)

## Blockers (clear these to unblock the ⛔ tasks)
| # | Needed | Unblocks |
|---|--------|----------|
| ~~B3~~ | ~~Original HTML for Research "Why" section~~ — RESOLVED, no such section | ~~CHG-12~~ |
| B4 | Drive folder of school + training photos | CHG-22 |
| B5 | Working session on layout/direction | CHG-13, CHG-14, CHG-18 |
| B6 | E4 chart: Option A (growth/yr) vs B (baseline→endline lift, recommended) + real numbers | CHG-29 |
| B7 | Real school photos + approved quotes + named roles + logos/permission (NMAJS, Hippocampus, GIG) | CHG-30, CHG-32 (shared w/ CHG-22) |
| B8 | E3 Top Results: real pooled aggregate OR real scoped figures reworded (no fabricated averages) | CHG-28 |
| B9 | "+28%" collision — E3 (Jordan readiness) vs E7 (Hippocampus impulse control); keep one | CHG-28, CHG-32 |

## Change log
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
