# CODING AGENTS: READ THIS FIRST

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read `tilli-website-redesign/project/Tilli Homepage Seamless.dc.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `tilli-website-redesign/README.md` — this file
- `tilli-website-redesign/project/` — the `Tilli Website Redesign` project files (HTML prototypes, assets, components)

## Translations (Arabic, Sinhala, Tamil, Spanish)

Every page except `/tilli-for-unrwa` is served in 5 languages at the same URL (`?lang=ar|si|ta|es|en` forces one).

- **After changing any English copy:** run `node i18n/build.mjs extract` (lists strings each language is missing), add the translations to `i18n/<lang>.json`, then run `node i18n/build.mjs build`. Commit `i18n/pages/` too: Cloudflare serves those files as they are, with no build step.
- Text created by JS goes through `_t("…")`. Use the same wrapper for any new UI string.
- Language choice and the regional price swap happen in `functions/_middleware.js` (Cloudflare Pages Function). The banner and footer picker live in `js/i18n.js`.
- To try it locally with the Function running: `npx wrangler pages dev .`
