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

## Footer standard (set 1 August 2026)
Three things were inconsistent across the site before this date. Keep them consistent now.

- **Copyright line, one wording everywhere:** `&copy; <span class="yr">2026</span> Wise Women Use AI &middot; Melbourne, Australia`, paired with the small inline `yr` script before `</body>`. It renders `© 2026` now and `© 2026–2027` from January, fixed start year 2026 (the site's first commit was 25 Feb 2026). Never hardcode a bare year again, and never reintroduce "All rights reserved" (legally meaningless, and against the voice rules). The dash is an **en dash** inside the script, which is correct for a numeric range and is NOT the banned em dash. 30 pages carry this line; the 26 lead-magnet and tool pages deliberately keep a minimal footer with no copyright line.
- **Every audience-facing page links `/privacy` and `/ai-disclosure`.** 51 pages do. There are three footer shapes in this repo (main-site `.footer-links`, capture-page `.foot-links` / `<ul class="footer-links">`, and a plain `<p>`); a new page should copy whichever shape its neighbours use and carry both links.
- **Deliberately footerless:** `dashboard.html`, `journey-map-*.html`, `wwuai-pitch-deck.html`. Internal working documents, not landing pages. Leave them alone.
- **The blog post template lives OUTSIDE this repo, so a site-wide footer change is only half done until you edit it too.** New posts are generated from `~/.claude/wwuai-os/skills/marketing/blog-publisher.md`, which carries its own full copy of the nav and footer. On 1 Aug 2026 a weekly post landed mid-change carrying the retired footer and a dead `/hub` link, because the site was fixed and the template was not. It would have reintroduced the old footer every week, silently. **Any change to the nav, footer, or copyright line gets applied in both places in the same pass**, then check the next generated post.

## Transparency pages (added 1 August 2026)
- `ai-disclosure.html` → `/ai-disclosure`. Kelly's open account of where AI does the work in the business. **Every line is a factual claim about how she actually operates, so it is not ordinary marketing copy.** Under Australian Consumer Law the misleading-conduct provision has no turnover threshold, and the ACCC has flagged AI-washing as an enforcement focus, so a claim here that drifts from reality is a real liability. Before editing this page, verify the claim against the actual pipeline. Known specifics it commits to: the weekly topic is approved but individual captions are not read before posting; long community training videos may use an ElevenLabs synthetic narrator; the ManyChat keyword DM is disclosed as automated. If any of that changes, change the page in the same pass.
- `privacy.html` → `/privacy`. Plain-language statement of actual practice, not boilerplate. It asserts **no tracking pixels, no Google Analytics, no tag manager, no advertising cookies**, which was true of the site code on 1 Aug 2026. **Adding any pixel or analytics to this site makes that page false, so update it in the same pass.** It names Kit, Stripe, Skool, ManyChat, Cal.com and Vercel as the places data actually sits.
- Both pages use a shared visual pattern: drenched Bordeaux hero, Blush italic emphasis on dark, Clay italic on light, full-bleed dark bands alternating with light reading sections. They are twins; a change to one usually belongs in the other.

## Tech
- Static HTML (no framework)
- Deployed on Vercel
- WWUAI brand colours, fonts, and button styles (see global CLAUDE.md)
- All CSS is inline `<style>` blocks — no external stylesheets. Each page is self-contained.
- All pages load Google Fonts (Playfair Display, Plus Jakarta Sans, Allison) independently in their own `<head>`

## Key pages
- `hub-install.html` — **REMOVED 1 July 2026** (deleted from the repo). Kelly took the Hub Install page off the site ("that page shouldn't be there"). `/hub`, `/hub-install` and `/ai-business-hub-install` now 301-redirect to the homepage. The $1,500 done-with-you Hub Install offer is delisted from the public site. Historical copy source: Notion doc `352f53df20e4817fa9eecf88d9222d62`.
- `workshop.html` — **Current free-workshop registration landing page. Live at `/workshop` (1 July 2026).** Design/copy ported verbatim from the finished preview `~/Downloads/workshop-landing-preview_5.html` (The Unfair Advantage: "Your business can't run without you. It's time it could."). Centred hero, contained rounded hero photo band, "Who is this for?" elevated cards, "So we're not doing that" script line, `<details>` FAQ accordion, closing "Get the foundation right" section. Wrapped in the standard site nav/footer shell. Two embedded Kit forms (first name + email + "Save my seat"), hero and closing section, both reusing **Kit form 9507453 (UID 4a313d4988)** with `fields[source]=workshop`; submit-intercept JS redirects to `/masterclass-thankyou`. About portrait uses `kelly-about.jpg`/`.webp`. Hero band photo `assets/photos/workshop-hero.jpg` (665x1182, extracted from the preview's base64). Live event Wed 15 July 2026, 9:30am AEST. Heads-up: the reused Kit confirmation email and `/masterclass-thankyou` copy still describe the old June masterclass — update in Kit when ready.
- `masterclass.html` — **RETIRED 1 July 2026, replaced by `workshop.html`.** `/masterclass` now 301-redirects to `/workshop`. File kept in the repo for version-control history (still directly reachable at `/masterclass.html`). Was the free masterclass registration page (merged PR #2), Kit form 9507453, live event Wed 17 June 2026.
- `hub.html` — The public links page, live at `/links` (restructured 2 June 2026, PR #3; hero swapped 22 June 2026). The free community is the hero card at top → `/community` ("Join the free community"); the expired masterclass hero was removed once the 17 June event passed. Keeps Free Tools and the Substack newsletter. The $47 AI Business Hub template Shop card was removed 22 June 2026 (not currently part of the offer). No longer routed to `/hub` (since 2026-05-02).
- `hub-welcome.html` — Post-purchase thank-you page for $47 Notion template buyers. Live at `/hub/welcome`.
- `ai-business-hub-install.html` — **REMOVED 1 July 2026** (deleted). Was an earlier version of the Hub Install page. `/ai-business-hub-install` now 301-redirects to the homepage.
- `community.html` — The community landing page, live at `/community`. **Changed 11 June 2026: the Skool community is now FREE to join, with an optional paid Growth Membership at $49/month (the full library of tools, prompts and workflows).** Free-first hero, taster "what you get free" section, dark Growth upsell with a free-vs-Growth comparison, free-join CTAs to https://www.skool.com/wise-women-use-ai-1109. The old paid $99/$197 one-off model is retired. Homepage (`index.html`) updated to match. "Upgrade to Growth" button still points at the free Skool link as a placeholder until the paid tier is set up in Skool. Follow-up (mostly resolved 1 July 2026): the Hub Install and Content System pages were removed and their nav/footer links stripped site-wide; carousel-maker may still mention the old model — check in a future audit.
- `content-system.html` + `programme-welcome.html` — **REMOVED 1 July 2026** (deleted). The Content System offer was taken off the site. `/content-system` and `/programme-welcome` now 301-redirect to the homepage.
- `about.html` — **Restored 1 July 2026.** The page existed but had no route (so `/about` 404'd). Added the `/about` route; now live at `/about`.
- `posts/the-thing-holding-your-ai-back-isnt-your-prompts.html` — **RETIRED 1 July 2026** (deleted; it was a Hub Install sales piece). URL 301-redirects to `/blog`; removed from the blog listing and sitemap.

## SEO / AEO (audit shipped 24 July 2026)
- `work.html` is the "AI consultant Melbourne" target page: title, hero copy, FAQ section, and ProfessionalService + FAQPage schema all carry it. Don't retitle it away from that phrase without checking with Kelly.
- Person schema (about/index) says "AI Consultant and Educator" and includes the full sameAs set (LinkedIn: linkedin.com/in/wisewomenuseai). Keep the social list in sync across index/about/work.
- All main pages carry `og:locale` `en_AU`. New pages should too.
- **When a new blog post goes live, add it to `sitemap.xml`** (with the post's date as lastmod, priority 0.6). The nightly pipeline does not do this; the July audit found 6 of 10 posts missing.
- `llms.txt` describes the current offer structure. Update it when offers change (it went stale for a full rebrand cycle once).
- `404.html` is the custom not-found page, wired in vercel.json via `{"handle": "filesystem"}` + a catch-all 404 route. Those two entries must stay LAST in the routes array; anything added after them never runs.

## Routing notes (vercel.json)
- `/hub` → 301 redirect to homepage (Hub Install removed 1 July 2026)
- `/hub-install` → 301 redirect to homepage
- `/hub/welcome` → `hub-welcome.html`
- `/ai-business-hub-install` → 301 redirect to homepage
- `/workshop` → `workshop.html`
- `/masterclass` → 301 redirect to `/workshop` (was `masterclass.html` until 1 July 2026)
- `/links` → `hub.html`
- `/content-system`, `/content-system.html`, `/programme-welcome` → 301 redirect to homepage (removed 1 July 2026)
- `/about` → `about.html` (route added 1 July 2026)
- `/privacy` → `privacy.html` (added 1 August 2026)
- `/ai-disclosure` → `ai-disclosure.html` (added 1 August 2026)
- `/posts/the-thing-holding-your-ai-back-isnt-your-prompts` → 301 redirect to `/blog` (post retired 1 July 2026)
