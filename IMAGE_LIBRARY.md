# WWUAI Image Library

> Manifest of all images in the `assets/` folder.
> URLs follow the pattern: `wisewomenuseai.com/assets/{folder}/{filename}`
>
> When adding new images, always add an entry here with filename, description, and tags.

---

## Logos (`assets/logos/`)

| Filename | Description | Tags |
|----------|-------------|------|
| WWUAI Logo OG.png | Primary logo, Pearl background — May 2026 rebrand (Bordeaux/Pearl/Ink palette) | logo, primary, square |
| WWUAI Logo OGTP.png | Primary logo, 2000x2000, transparent background — use on light backgrounds | logo, primary, transparent |
| WWUAI Logo Dark.png | Dark variant, Ink (#3A131B) background — May 2026 rebrand | logo, dark, square |
| WWUAI Logo DarkTP.png | Dark variant, transparent background — use on dark (Ink) backgrounds only | logo, dark, transparent |

## Photos (`assets/photos/`)

| Filename | Description | Tags |
|----------|-------------|------|
| KellyH.png | Kelly Hartley portrait photo, used on About section | kelly, founder, portrait, about |
| kelly-about.jpg | Kelly portrait (4:5), used in About section of AI Business Hub install page | kelly, founder, portrait, about |
| kelly-about.webp | WebP version of kelly-about.jpg — use in `<picture>` elements for performance | kelly, founder, portrait, about, webp |
| kelly-hero.jpg | Kelly hero photo | kelly, founder, hero |
| workshop-hero.jpg | Kelly at her laptop with a cup of tea, natural light. Contained hero band photo on the `/workshop` page (extracted from the workshop preview) | kelly, founder, workshop, lifestyle, hero |
| kelly-hero.webp | WebP version of kelly-hero.jpg (100KB vs 2.4MB) — primary format for hero image, use in `<picture>` elements | kelly, founder, hero, webp |
| tools-clear-the-decks.jpg | Woman typing at laptop with notebook, warm linen, natural light. Hero photo on the /tools/clear-the-decks recipe cards page | lifestyle, laptop, work, tools, hero |
| tools-first-wins.jpg | Hand on laptop keyboard, watch, phone and glasses on pale desk. Hero photo on the /tools/first-wins recipe cards page | lifestyle, desk, work, tools, hero |
| tools-out-of-your-head.jpg | Hands cradling a steaming cup, soft natural light. Hero photo on the /tools/out-of-your-head recipe cards page | lifestyle, tea, calm, tools, hero |
| tools-claude-connectors.jpg | Laptop and teacup on side table, soft morning light. Hero photo on the /tools/claude-connectors recipe cards page | lifestyle, laptop, tea, tools, hero |

> Note: `kelly-portrait.jpg` was referenced in the original AI Business Hub source file but does not exist in this repo. Replaced with `kelly-about.jpg`.

## Brand (`assets/brand/`)

*No images yet.*

## Content (`assets/content/`)

*No images yet.*

## Social (`assets/social/`)

| Filename | Description | Tags |
|----------|-------------|------|
| og-card.jpg | Site-wide Open Graph share card, 1200x630. Drenched Bordeaux with Kelly on the right and the "Your business. Your life. Your time back." line. This is the `og:image` on every page and the `image` in the blog and Event schema. | social, opengraph, share, brand, card |
| og-card.source.html | The HTML the card is rendered from. Edit this, then re-render at exactly 1200x630 with Playwright and export as JPEG over `og-card.jpg`. Do not edit the JPEG directly. | source, template, opengraph |

> Added 12 August 2026. Before this, `og:image` pointed at `kelly-hero.jpg` on 22 pages. That file is a **1152x2048 portrait**, and is actually a PNG saved with a `.jpg` extension. Facebook and LinkedIn want roughly 1.91:1, so every share preview was hard-cropped through Kelly's face, and the 2.5MB size was over the practical limit for scrapers. `hub.html` had carried a TODO for this card since March.

## Lifestyle (`assets/lifestyle/`)

*No images yet.*

## Workbooks (`assets/workbooks/`)

| Filename | Description | Tags |
|----------|-------------|------|
| hub-install-workbook.pdf | Hub Install pre-call digital workbook — sent to clients before their onboarding call | hub-install, workbook, pdf, client |

> Public URL: https://wisewomenuseai.com/assets/workbooks/hub-install-workbook.pdf

## Email (`assets/email/`)

Assets for the branded Kit email template (header + social icons). Referenced by the Kit default template.

| Filename | Description | Tags |
|----------|-------------|------|
| header-art.png | Kit email header: logo on soft off-white with "for women who mean business" tagline in Allison/Bordeaux | email, kit, header, logo |
| icon-instagram.png | Instagram social icon, Bordeaux, 128px transparent | email, kit, footer, icon, social |
| icon-tiktok.png | TikTok social icon, Bordeaux, 128px transparent | email, kit, footer, icon, social |
| icon-facebook.png | Facebook social icon, Bordeaux, 128px transparent | email, kit, footer, icon, social |
| icon-linkedin.png | LinkedIn social icon, Bordeaux, 128px transparent | email, kit, footer, icon, social |
| kelly-signature.png | "Kelly" sign-off in Allison script, Bordeaux, transparent | email, kit, signature, sign-off |

> Public URL pattern: https://wisewomenuseai.com/assets/email/{filename}
