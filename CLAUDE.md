# CLAUDE.md -- WWUAI Website

## What This Is
The primary website for Wise Women Use AI. Static HTML site deployed via Vercel.
- Repo: Kellyai22/wwuai-website
- URL: wisewomenuseai.com

## Asset Library
There is a public asset library in `assets/`. The `IMAGE_LIBRARY.md` file in the repo root is the manifest. Read it to browse and select assets (images and PDFs).

- **URL pattern:** `wisewomenuseai.com/assets/{folder}/{filename}`
- **Folders:** `logos/`, `photos/`, `brand/`, `content/`, `social/`, `lifestyle/`, `workbooks/`
- **When adding new assets:** Always update `IMAGE_LIBRARY.md` with the filename, description, and tags — applies to images and PDFs alike

## Logo Variants
- OGTP for light backgrounds
- DarkTP for dark backgrounds only

## Tech
- Static HTML (no framework)
- Deployed on Vercel
- WWUAI brand colours, fonts, and button styles (see global CLAUDE.md)
- All CSS is inline `<style>` blocks — no external stylesheets. Each page is self-contained.
- All pages load Google Fonts (Playfair Display, Plus Jakarta Sans, Allison) independently in their own `<head>`

## Key pages
- `hub-install.html` — Hub Install sales page (done-with-you service, $1,500 AUD limited time offer). Live at `/hub`. Hero has NO CTAs (ends at blockquote). CTA block in Investment section has two side-by-side buttons: "Book a discovery call" → cal.com/kelly-yuaiol/discoverycall (primary, Bordeaux solid) and "Buy now" → https://buy.stripe.com/00wcN7gpl28bgDT6NV6Ri01 (secondary, Bordeaux outline). Two-card downsell above footer: $47 template → https://buy.stripe.com/dRm8wRgpl28b4Vb5JR6Ri02 and $197 Skool community → https://www.skool.com/wise-women-use-ai-1109. **Copy source of truth: Notion doc `352f53df20e4817fa9eecf88d9222d62`** (last synced 18 May 2026 — pricing simplified to single tier 23 May 2026; page restructured 23 May 2026).
- `masterclass.html` — Free masterclass registration landing page. Live at `/masterclass` (merged PR #2). Title "Free Masterclass: One Idea, a Week of Content". Kit form 9507453 (UID 4a313d4988) embedded, "Save your seat". Top of the funnel as of June 2026; live event Wed 17 June 2026, 7pm AEST.
- `hub.html` — The public links page, live at `/links` (restructured 2 June 2026, PR #3; hero swapped 22 June 2026). The free community is the hero card at top → `/community` ("Join the free community"); the expired masterclass hero was removed once the 17 June event passed. Keeps Free Tools and the Substack newsletter. The $47 AI Business Hub template Shop card was removed 22 June 2026 (not currently part of the offer). No longer routed to `/hub` (since 2026-05-02).
- `hub-welcome.html` — Post-purchase thank-you page for $47 Notion template buyers. Live at `/hub/welcome`.
- `ai-business-hub-install.html` — Earlier shorter version of Hub Install page. Still live at `/ai-business-hub-install`. Nav links updated to point to `/hub-install`.
- `community.html` — The community landing page, live at `/community`. **Changed 11 June 2026: the Skool community is now FREE to join, with an optional paid Growth Membership at $49/month (the full library of tools, prompts and workflows).** Free-first hero, taster "what you get free" section, dark Growth upsell with a free-vs-Growth comparison, free-join CTAs to https://www.skool.com/wise-women-use-ai-1109. The old paid $99/$197 one-off model is retired. Homepage (`index.html`) updated to match. "Upgrade to Growth" button still points at the free Skool link as a placeholder until the paid tier is set up in Skool. Follow-up: content-system pages, hub-install ($197 mention), carousel-maker, and blog footers still reference the old model.

## Routing notes (vercel.json)
- `/hub` → `hub-install.html` (canonical URL as of 2026-05-02)
- `/hub-install` → 301 redirect to `/hub`
- `/hub/welcome` → `hub-welcome.html`
- `/ai-business-hub-install` → 301 redirect to `/hub`
- `/masterclass` → `masterclass.html`
- `/links` → `hub.html`
