# Tilli Redesign — Mobile Pass · Live Progress

> Live status tracker for the `CHG-NN` tasks in [tilli-redesign-tasks.md](tilli-redesign-tasks.md).
> Updated by Claude as tasks are completed. Spec is the source of truth; this is the dashboard.
>
> **Legend:** ✅ done · 🔵 in progress · ⬜ todo · ⛔ blocked
> **Last updated:** 2026-10-08 — CHG-13 done (B5 agreed): mobile six cognitive + six SEL skills rebuilt as live 2-col card grids (emoji placeholders, swappable), replacing the sideways-scroll PNG strips.

## At a glance

- **Done:** 16 / 23
- **In progress:** 0
- **Blocked:** 3  (CHG-14, CHG-18 → B5 · CHG-22 → B4)
- **Unblocked & remaining:** 3

```
[████████████████████████████            ]  70%
```

## Next up

→ **CHG-21 · Make School Success page enticing / on-brand** (P5)

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
| ⛔ | CHG-14 | Domain/parameter chips — **B5** (discuss first) |
| ⛔ | CHG-18 | AI use cases redesign — **B5** (plan first) |
| ✅ | CHG-12 | Restore Research "Why" — done (no "Why" section existed; covered by WEIRD band work) |

## P5 — School Success
| Status | ID | Task |
|--------|----|------|
| ⬜ | CHG-21 | Make page on-brand |
| ⛔ | CHG-22 | Photo carousel — **B4** (Drive photos) |
| ⬜ | CHG-24 | Offerings section |
| ⬜ | CHG-25+20 | WhatsApp icon consistency |
| ⬜ | CHG-23 | Masoomi content review (process) |

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

## Change log
- 2026-10-06 — Tracker created; baseline set, all tasks ⬜/⛔, none confirmed done.
- 2026-10-06 — CHG-12 ✅ done; B3 resolved (no separate "Why" section — the Research WEIRD band was restyled with an arc + fade instead). Also done ad-hoc (not a CHG): WEIRD band arc/fade redesign on desktop + mobile.
- 2026-10-06 — CHG-09 ✅ done. Shared nav was already single-source; hardened `.tl-nav a` / `.navdrawer a` (text-decoration + Montserrat) so interior pages stop inheriting page base styles (fixes underline/font). Fixed Home boot-veil z-index so the nav no longer fades in on landing. `version.json` → …-3.
- 2026-10-06 — CHG-07+19 ✅ done. Footer unified to the Home/hero canonical (image 1): FOOTER_LINKS → How it works/12 skills/Impact/FAQs/Privacy (no Get-in-touch/WhatsApp); interior + mobile rebuilt to match (mobile logo image, "Reach out:" prefix, hash-aware mHref, #how anchor on m/index); dynamic year everywhere incl. Home.
- 2026-10-06 — CHG-10 ✅ done. Live font config already Montserrat-only; reworded token comments, set the DS lint allow-list to Montserrat-only, scrubbed Fredoka from _ds_manifest.json. Grep Fredoka-free except deferred leftovers (see Follow-ups). P1 (global fixes) complete.
- 2026-10-06 — CHG-06 ✅ done. Live Ask-Tilli copy was already channel-neutral; stripped "on WhatsApp" from parent-survey captions (index/m/index) + FAQ, and cleaned the .dc.html comps ("Ask-Tilli", "ASK-TILLI", "In seconds."). Kept "Book a demo on WhatsApp" CTA + functional WhatsApp (bubble/links/form field/"Message us on WhatsApp").
- 2026-10-07 — CHG-05 ✅ done. Mobile already compliant (53, quote-above-stat, RPP credit). Desktop: number already 53; added "Research-Practice Partnership with Stanford & NMAJS" as a full-width eyebrow ABOVE the imp2 quote (grid row 1; qmark/qtext→row2, cite→row3). Kept the choreographed scroll order per user.
- 2026-10-07 — CHG-02 ✅ done. Mobile #skills buckets already existed with correct 6+6 mapping; swapped the placeholder SVG icons for user's assets/Brain.png + Heart.png, standalone (no tinted box). Mobile-only (desktop has no bucket layout). Was a cache issue on first view.
