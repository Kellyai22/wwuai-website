# CLAUDE.md -- WWUAI Website

## What This Is
The primary website for Wise Women Use AI. A static site built with Astro and deployed on Vercel.
- Repo: Kellyai22/wwuai-website
- URL: wisewomenuseai.com

## How the site is built (Astro rebuild, shipped 12 November 2026)

The site was 64 hand-written HTML files, each with its own copy of the header, footer and next step. Now the header, footer and next step are written once. The rebuild is staged: phase 1 moved the frame and eight core pages; everything else is served exactly as it was.

**Where things live**

| Folder | What it is |
|---|---|
| `src/config/site.ts` | **The one place** for the navigation, the footer links, the Skool join link and the site's next step (label and address). Change the offer here. |
| `src/layouts/` | `Sales` (sign-up and sales pages), `Guide` (lead magnets, guides, articles), `ThankYou`. Each ends with `NextStep`, so a page cannot be built without one. `Base` loads the shared styling and motion. `Legacy` is only for core pages not yet restyled. |
| `src/components/` | `Header`, `Footer`, `NextStep` (closing Bordeaux band with the embossed ai), `SignupForm` (Kit form + `/assets/js/signup.js`; takes `formId`, `source`, `successUrl`). `sections/` has one component per approved /style section. `legacy/` holds the header and footer for the not-yet-restyled core pages. |
| `src/pages/` | Astro pages: `index`, `check`, `vault`, `community`, `about`, `architect`, `starter`, `thank-you`, `privacy`, `ai-disclosure`, `404`. |
| `public/` | **Legacy pages and every static file, served exactly as written:** all other `.html` pages, `posts/`, `assets/`, `downloads/`, `robots.txt`, `llms.txt`, `sitemap.xml`, the `.ics` files. A file here keeps the address it always had (`public/calm.html` is still routed to `/calm` by `vercel.json`). |
| `api/` | The serverless functions (`workshop-signup`, `reel-signup`, `stripe-webhook`, `check-signup`). Root folder, CommonJS, unchanged. Do not add `"type": "module"` to `package.json`; it would break them. |
| `scripts/`, `tests/` | The checks below. |
| `dist/` | Build output. Never edit, never commit. |

Only the home page is on the page system so far. The other seven core pages use the `Legacy` layout: they keep their old inline styles and look, with their header and footer links read from `site.ts`. Restyling each onto `Sales` / `Guide` / `ThankYou` is a redesign of that page and needs Kelly's approval through the `wwuai-page-standard` skill.

**Addresses must never change.** `astro.config.mjs` sets `build.format: 'file'` (so `about.astro` builds `about.html`, the file `vercel.json` already routes `/about` to), `trailingSlash: 'never'` and `compressHTML: false` (Astro 7 otherwise strips whitespace the way React does). `vercel.json` keeps its original `routes` list; every redirect is still there. Do not switch to the Vercel adapter, `cleanUrls` or `redirects`/`rewrites` without re-testing every address.

**Commands**

- `npm run dev` to work on a page locally.
- `npm run build` builds the site and then runs every check (`scripts/postbuild.mjs`). Vercel runs the same command, so a deploy that finishes has passed them:
  1. `check-system.mjs`: the page system rules, on the system files, `/style` and every Astro page on the system (which must also end with the next step).
  2. `check-links.mjs`: a broken internal link, or a link to the closed free Skool community, on an **Astro** page fails the build. Legacy pages never fail; they are written up in `LINK-REPORT.md` (old Skool links, Kit form IDs, whether each page has a next step).
  3. `build-sitemap.mjs --dist`: the sitemap's addresses must match the site.
  4. `sync-everyday-prompts.mjs --check`, the tests in `tests/`, and (on Kelly's Mac only) `build-tokens.mjs --check`.
- `npm run check` runs the checks again without rebuilding. `npm run sitemap` rewrites `public/sitemap.xml`. `npm test` runs the tests.

**How to add a page**

1. Load the `wwuai-page-standard` skill. Build only from the approved /style sections.
2. Create `src/pages/<name>.astro`. Import the layout that fits (`Sales`, `Guide` or `ThankYou`) and pass `title`, `description` and `path="/<name>"`. Build the body from the components in `src/components/sections/`. Put JSON-LD in `<script type="application/ld+json" is:inline slot="head">`. Use `src/pages/index.astro` as the worked example.
3. Add the route to `vercel.json`, **above** the `{"handle": "filesystem"}` entry: `{ "src": "/<name>", "dest": "/<name>.html" }`.
4. Never write the header, footer or closing band into the page, and never hardcode the next step or a Skool link: they come from `site.ts`.
5. `npm run build`, then `npm run sitemap` if the page is indexable, then build again. Screenshot with the skill's `shoot.mjs` against `npx astro preview`.

**Moving a legacy page onto Astro:** `git mv public/<name>.html src/pages/<name>.astro`, rebuild it on a layout, keep its `vercel.json` route, Kit form ID and source. Any `<script>` or `<style>` kept in an Astro page needs `is:inline`. A page must not exist in both `public/` and `src/pages/`.

**Tools outside this repo that write into it** work with both the old and new layout: the workshop builder and rollover (`~/.claude/skills/workshop/scripts/`), the blog publisher (`~/.claude/wwuai-os/skills/marketing/blog-publisher.md`, writes `public/posts/`, `public/blog.html`, `public/sitemap.xml`) and `wire-emphasis.mjs`.

## The Check, Free resources and the closing block (13 November 2026)

- **`/check` (`src/pages/check.astro`) is the free Business Dependency Check** and the site's main free front door. Landing copy is Margot's, the eight questions, scoring and five results are Pen's: change wording only with Kelly's say. Questions and scoring live in `src/lib/check-scoring.mjs` (tests in `tests/check-scoring.test.cjs`, which run every combination). The email step posts to `api/check-signup.js`: subscriber active with no confirmation email, custom field `dependency_result` (1428748) saved and read back first, then tag LM-CHECK (25749475). **No sequence:** `ADD_TO_SEQUENCE = false` until Kelly switches on the follow-up (2968008). It must never touch Kit form 9658821 or sequence 2839625 (a test checks). The result shows only after the function returns success.
- **`/hours`, `/hours.html` and `/audit` 301 to `/check`.** `public/hours.html` stays in the repo because `sync-everyday-prompts.mjs` reads its prompts. **A retired page redirects to `/check`, never the home page** (a test fails if any redirect points at `/`).
- **`/vault` (`src/pages/vault.astro`) is called "Free resources" everywhere.** Never "the Vault", and never as a member benefit. The Check is its featured card; guides link to their ungated versions (`?unlocked=1`, `/switch-wwuai`, `/vault-claude-clearly`).
- **`/community` (`src/pages/community.astro`)** is a short pointer page: Check first, workshop second, membership to `/architect`.
- **Three closing steps** in `src/config/site.ts` (`steps`): a layout takes `next="architect"` (default), `"workshop"` or `"check"`. Free resource pages end on the workshop.
- **The shared workshop closing block.** Words in `src/config/closing.json`. Page-system pages get it from the layout (`next="workshop"`). Older pages in `public/` carry a written copy between `<!-- closing:start -->` (or `closing:start panel` inside a page wrapper) and `<!-- closing:end -->`; run `node scripts/apply-closing.mjs` after changing the words. The build fails if a copy drifts or a free page loses its block. Older Astro pages use `src/components/legacy/ClosingBlock.astro` (`/starter`). A free page ends with this block and nothing else after it.
- **"Next one: [date]"** under workshop buttons comes from `/workshop-next.json` (built from `workshop.config.json`, date and time only, never the Zoom link) through `/assets/js/workshop-next.js`. It hides itself once the date has passed. Never hard-code a workshop date on a page outside the workshop skill's own pages.
- **Membership wording (approved 12 Nov 2026):** a new business system; a live build call and a live Q&A call, both recorded; a before and after check; the Business Dependency Diagnostic; Your AI Team; Your Business HQ; the replays. "Build and Fix" and "The Vault" are retired names. "Your AI Team" is allowed capitals by `check-system.mjs`, like the brand name.

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
- Astro 7 (static output) for the frame and core pages; legacy pages are plain HTML in `public/`. See "How the site is built" above.
- Deployed on Vercel (framework preset `astro`, set in `vercel.json`)
- WWUAI brand colours, fonts, and button styles (see global CLAUDE.md)
- **Page system (27 Oct 2026):** new and rebuilt pages use the shared files in `public/assets/system/` (`tokens.css` generated from brand-tokens.json by `scripts/build-tokens.mjs`, `wwuai.css`, `wwuai.js`) and are built only from the approved sections on `/style` (`public/style.html`, noindex). Before creating or editing any page, load the global `wwuai-page-standard` skill. `node scripts/check-system.mjs <page>.html` must pass (it looks in `public/`, then the built site).
- **Home page (`src/pages/index.astro`, rebuilt on the page system 11 Nov 2026, design approved by Kelly 11 Nov).** One job: Architect Advantage (`/architect`), with the free Starter Kit form (Kit form 9316857, `fields[source]=starter-kit`, `/assets/js/signup.js`) as the quiet second route. Order: layered hero (smiling portrait), growing Bordeaux box with dealt cards, Greige statement, starting projects in ruled columns, full-width Bordeaux offer ($69 USD/month), free guides, About (desk photo), organisations band, FAQ, Starter Kit form, closing band with the embossed ai. Kelly kept the hero and About photos from the old page; don't swap them without asking. No free-community copy anywhere (Skool is paid-only from 11 Nov 2026). Visible copy writes "ai" lowercase. The page is **scroll-gated** (`<html data-motion="scroll">`): its head snippet adds only `hl` (the CSS hero load), and `wwuai.js` adds `m` on the first scroll, leaving whatever was on screen at rest as it was. Other pages are not scroll-gated.
- **Four sections added to `/style` on 11 Nov 2026:** layered hero (`.hero--layered`), growing box (`.grow`), dealt cards (`.dealt`, the home page's replacement for the pinned deck; `/workshop` keeps its deck) and following button (`.follow`), plus small parts `.pair`, `.statement`, `.ruled`, `.offer`, `.band--mark` and `.nb` (keeps the last two headline words together). Emphasis words on light tones are Bordeaux from 11 Nov 2026 (Blush stays on dark); that changed /workshop and /links too.
- Older pages (everything in `public/`, and the seven `Legacy`-layout core pages) still carry their own inline `<style>` blocks and load Google Fonts in their own `<head>`. Leave them until each is rebuilt on the system; don't copy their inline pattern into new pages.

## Key pages
- `hub-install.html` — **REMOVED 1 July 2026** (deleted from the repo). Kelly took the Hub Install page off the site ("that page shouldn't be there"). `/hub`, `/hub-install` and `/ai-business-hub-install` now 301-redirect to the homepage. The $1,500 done-with-you Hub Install offer is delisted from the public site. Historical copy source: Notion doc `352f53df20e4817fa9eecf88d9222d62`.
- `workshop.html` — **Free-workshop registration page, live at `/workshop`, for "Build Your Content System" (Wed 9 Dec 2026, 7pm Melbourne time).** On the page system (load `wwuai-page-standard`); copy supplied by Kelly 13 Nov 2026: headline "Build a content system that doesn't depend on your spare hour", what you'll leave with, who it's for, proof band (Kelly's real systems), host, FAQ, Bordeaux band, form. Form posts to `/api/workshop-signup`, which finds the Kit tag `workshop-2026-12` by name (creates it if missing) and attaches **no sequence yet**; it lands on `/workshop-december-2026-details` (`src/pages/workshop-december-2026-details.astro`, hidden from search, no Zoom link: Kelly emails it). Each month: change `WORKSHOP_TAG_NAME` in the function, the page, the thank-you page, `workshop.config.json` and the item in `public/assets/system/news.json`. Event JSON-LD; indexable. `/workshop.ics` is stale (September) and nothing on the new pages links to it. The monthly holding/thank-you templates in `~/.claude/skills/workshop/templates/` are on the page system too.
- `masterclass.html` — **RETIRED 1 July 2026, replaced by `workshop.html`.** `/masterclass` now 301-redirects to `/workshop`. File kept in the repo for version-control history (still directly reachable at `/masterclass.html`). Was the free masterclass registration page (merged PR #2), Kit form 9507453, live event Wed 17 June 2026.
- `hub.html` — The public links page, live at `/links`. **Rebuilt on the page system 27 Oct 2026:** opens with a full-screen embossed "ai" (Giza Stencil) and a workshop button, then an editorial link list (workshop first with a countdown, Architect Advantage, free resources /vault, newsletter, site), then a Bordeaux workshop band. One job: workshop sign-up. No free-community link (the free tier is closing).
- `hub-welcome.html` — Post-purchase thank-you page for $47 Notion template buyers. Live at `/hub/welcome`.
- `ai-business-hub-install.html` — **REMOVED 1 July 2026** (deleted). Was an earlier version of the Hub Install page. `/ai-business-hub-install` now 301-redirects to the homepage.
- `community.html` — The community landing page, live at `/community`. **Verified 20 August 2026: Skool is freemium. Standard is free and Architect Advantage is the optional Premium membership at $69 USD/month, billed through Skool.** The paid plan includes a monthly live implementation call, fresh prompts and templates, the full library and practical support. Paid CTAs point directly to `https://www.skool.com/wise-women-use-ai-1109/plans`; free CTAs point to the community root. The old Growth Membership, $49 price and $99/$197 one-off model are retired.
- `architect.html` — The owned sales page for Architect Advantage, live at `/architect`. Replaced the parked $495 founding-cohort page on 20 August 2026. Its one job is to help women in midlife decide whether to join the $69 USD/month DIY implementation membership. The primary CTA goes to the Skool plans page (`skool.join` in `site.ts`). The free-community route was removed on 12 Nov 2026. Do not reintroduce cohort dates, seat limits, waitlist forms or Unfair Advantage naming.
- `content-system.html` + `programme-welcome.html` — **REMOVED 1 July 2026** (deleted). The Content System offer was taken off the site. `/content-system` and `/programme-welcome` now 301-redirect to the homepage.
- `about.html` — **Restored 1 July 2026.** The page existed but had no route (so `/about` 404'd). Added the `/about` route; now live at `/about`.
- `posts/the-thing-holding-your-ai-back-isnt-your-prompts.html` — **RETIRED 1 July 2026** (deleted; it was a Hub Install sales piece). URL 301-redirects to `/blog`; removed from the blog listing and sitemap.

## Second SEO/AEO + mobile pass (shipped 12-13 August 2026)

Read `reference_aeo_what_works` in memory before doing any more AEO here. **Do not add
FAQ schema and do not expand `llms.txt`;** both were checked against primary sources and
neither does anything (Google killed FAQ rich results in May 2026, and no AI system reads
llms.txt). Existing markup stays, because unused markup is harmless.

- **`/workshop` is deliberately INDEXABLE and carries Event JSON-LD.** It had `noindex`
  while also sitting in sitemap.xml, and the only Event schema was stranded on
  `masterclass.html`, which 301s away. The noindex lived in
  `~/.claude/skills/workshop/templates/workshop-holding.template.html`, so a page-level fix
  would have been wiped by the monthly rollover. **Never re-add noindex there.** The
  thank-you pages keep theirs.
- **`sitemap.xml` is GENERATED.** See the maintenance rule below.
- **Fonts: check a Google Fonts URL actually returns 200.** Eight pages had `wght,400`
  instead of `wght@0,400`, which is an HTTP 400, so all three brand fonts silently failed
  and those pages rendered in system fallbacks. Six pages also set `--sans` to Montserrat,
  which this site never loads. Both fixed; do not reintroduce either.
- **`assets/social/og-card.jpg` is the sitewide share image** (1200x630, ~95KB). Before
  this, `og:image` pointed at `kelly-hero.jpg`, a 1152x2048 **portrait** that is actually a
  PNG with a `.jpg` extension, so every Facebook and LinkedIn preview was cropped through
  Kelly's face. To change the card, edit `assets/social/og-card.source.html`, re-render at
  exactly 1200x630 and export as JPEG. **Never edit the JPEG directly.**
- **No em dashes anywhere.** 112 were removed. Page titles use the middot separator.
- **Mobile:** never hide nav links with `.nav-link + .nav-link { display: none; }`. That is
  an adjacent-sibling selector and it deleted every link after the first, so Blog and Work
  with me were unreachable on a phone. All form inputs are **16px minimum**, or iOS zooms
  the page the moment someone taps an email field.
- **Never add analytics or a tracking pixel.** `/privacy` and `llms.txt` both promise none,
  and that is a factual claim. If Search Console is wanted, verify by **DNS TXT record**.

## SEO / AEO (audit shipped 24 July 2026)
- `work.html` is the "AI consultant Melbourne" target page: title, hero copy, FAQ section, and ProfessionalService + FAQPage schema all carry it. Don't retitle it away from that phrase without checking with Kelly.
- Person schema (about/index) says "AI Consultant and Educator" and includes the full sameAs set (LinkedIn: linkedin.com/in/wisewomenuseai). Keep the social list in sync across index/about/work.
- All main pages carry `og:locale` `en_AU`. New pages should too.
- **`public/sitemap.xml` is GENERATED, not hand-edited (12 August 2026).** Run `npm run build` then `npm run sitemap` (Astro pages are read from the built site). It reads the routes from `vercel.json`, skips anything noindexed, 3xx-redirected, missing, or not yet committed, dedupes pages served at more than one URL using each page's own canonical tag, and takes `lastmod` from git. `--check` exits 1 if the committed list of addresses has drifted, `--dry-run` prints without writing. Every build also writes a corrected `dist/sitemap.xml`, so a new blog post can never be blocked by its own sitemap line. It was hand-maintained until now and drifted twice: the July audit found 6 of 10 blog posts missing, and by 12 August it was 15 pages out of date while also listing `/workshop`, which carried a noindex tag at the time. Run it after adding, retiring or noindexing any page. `blog-publisher.md` Step 6.5 appends new posts directly via the GitHub API, because the nightly pipeline has no local clone to run the script in.
- `llms.txt` describes the current offer structure. Update it when offers change (it went stale for a full rebrand cycle once).
- `src/pages/404.astro` (built to `404.html`) is the custom not-found page, wired in vercel.json via `{"handle": "filesystem"}` + a catch-all 404 route. Those two entries must stay LAST in the routes array; anything added after them never runs.

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

## Current site and signup flow (2 October 2026)

- Main positioning: practical AI and business systems for Gen X women. **The free Skool community closed on 11 Nov 2026**; Architect Advantage is the main route (the home page no longer mentions the free community). `/architect` and the other core pages had their free-community links and wording removed on 12 Nov 2026; `/community` and other legacy pages still carry it (see `LINK-REPORT.md`). Organisational workshops remain separate. Do not add an unscoped individual service.
- Architect Advantage remains $69 USD monthly via Skool, cancel any time, with one monthly member implementation call and replay. Do not promise two Build/Fix sessions without a confirmed offer change.
- `/examples/one-idea-three-drafts` is a clearly labelled worked example, not a member result or a measured time-saving claim.
- All active Kit forms use `/assets/js/signup.js`. Preserve each existing Kit form ID and source field. A successful HTTP response alone is insufficient: Kit must return JSON with `status: success`. Errors must never unlock content or redirect to a success page. Keep resource access distinct from confirmed email delivery or double opt-in.
- Run `npm test` after changing signup behaviour (it also runs on every build).
- Main navigation and article navigation use `.ww-nav`, with no hidden mobile links. Blog publisher template updated alongside it.
- `/masterclass.html` also redirects to the closed-workshop page; do not expose old event registration forms.

## Vault resources (7 October 2026)
- The catalogue at `/vault` is still hosted by the existing Sites project and proxied here. Its source is separate from this repository.
- `/tools/everyday-jobs` exposes the eight existing audit prompts without requiring the audit. `public/hours.html` remains the source for their wording. Run `node scripts/sync-everyday-prompts.mjs` after editing those prompts, or use `--check` to detect drift.
- `/tools/email-plan` teaches list-email planning and drafting. It does not read inboxes, send emails or install skills. The other new guides are `/tools/repeat-job`, `/tools/client-call`, `/tools/follow-up-tracker` and `/tools/client-welcome`.
- The business review at `/review` is evergreen. All four prompts use the same chat and the reader chooses the review and planning periods.
- `/vault-starter` was the four-step beginner path (retired 27 Oct 2026, now redirects to `/starter?unlocked=1`); Claude, Clearly was its first step. Preserve the existing paid content lesson boundary and classroom URLs.

Free Vault access (27 Oct 2026: /vault is now `vault.html` in this repo, no longer proxied from the ChatGPT-hosted site): /vault and its free website guides are public without a passcode or required email signup. Paid lessons remain in the Skool classroom. Do not restore gating on these free resources.

`/starter` (27 Oct 2026) is the exception: "Set up your Claude Project", a gated lead magnet by Kelly's explicit choice ("that's how I collect emails"). Kit form 10101593 (uid 8f8720a63c), source `starter`, custom field `uses_projects`, Kit rules 5669501 (tag `starter`) and 5669503 (warm path sequence 2839625). `/vault-starter` now 307-redirects to `/starter?unlocked=1`, so Vault visitors skip the gate. The page uses the October 2026 palette with rounded corners (the rest of the site is still July). Kelly was surprised the other free guides had been opened up on 7 Oct; whether to re-gate CALM, BACKUP, DREAM, HOURS, REVIEW and Astra is her open decision.

Free/paid boundary: public guides are standalone resources, not a mirror of the paid Systems Library. Do not copy paid lesson text, examples, templates or recordings into public guides without Kelly explicitly approving that asset for public release. Link public guides to /architect with a clear paid-membership invitation. Topic overlap alone does not authorise republishing the member asset.

Paid migration approved 7 October 2026: the five complete workflows (email-plan, repeat-job, client-call, follow-up-tracker, client-welcome) now live in the Premium-restricted Skool Systems Library. Their website URLs contain previews only, except email-plan which also contains a separate one-email free starter. Do not restore the full prompts from repository history or old build scripts. Member lesson links are in the public previews.
