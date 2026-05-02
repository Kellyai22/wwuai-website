# CLAUDE.md -- WWUAI Website

## What This Is
The primary website for Wise Women Use AI. Static HTML site deployed via Vercel.
- Repo: Kellyai22/wwuai-website
- URL: wisewomenuseai.com

## Image Library
There is a public image library in `assets/`. The `IMAGE_LIBRARY.md` file in the repo root is the manifest. Read it to browse and select images.

- **URL pattern:** `wisewomenuseai.com/assets/{folder}/{filename}`
- **Folders:** `logos/`, `photos/`, `brand/`, `content/`, `social/`, `lifestyle/`
- **When adding new images:** Always update `IMAGE_LIBRARY.md` with the filename, description, and tags

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
- `hub-install.html` — Hub Install sales page (done-with-you service, $1,500–$2,500 AUD). Live at `/hub-install` and `/hub`. Design source in Google Drive: WWUAI/AI Business Hub/hub-install-sales-page.html. All 4 CTAs → cal.com/kelly-yuaiol/discoverycall.
- `hub.html` — Old "Start Here" links page. No longer routed to `/hub` (as of 2026-05-02). Still in repo.
- `hub-welcome.html` — Post-purchase thank-you page for $47 Notion template buyers. Live at `/hub/welcome`.
- `ai-business-hub-install.html` — Earlier shorter version of Hub Install page. Still live at `/ai-business-hub-install`. Nav links updated to point to `/hub-install`.

## Routing notes (vercel.json)
- `/hub` → `hub-install.html` (canonical URL as of 2026-05-02)
- `/hub-install` → 301 redirect to `/hub`
- `/hub/welcome` → `hub-welcome.html`
- `/ai-business-hub-install` → 301 redirect to `/hub`
