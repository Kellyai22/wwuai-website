# Link report: legacy pages

Written by `node scripts/check-links.mjs` on every local build. Do not edit by hand.

These are the older pages served as-is from `public/`. Nothing here fails the build. It is the list for deciding what stays, what gets rebuilt and what goes.

## Summary

- 69 legacy pages.
- 37 still link to the closed free Skool community, the Skool "about" page or a classroom lesson (49 links in all).
- 14 carry a sign-up form, across 11 different Kit forms.
- 32 have no next step (no link to /architect and no paid join link).
- 2 have a broken internal link.

How to read it: **Next step** is yes when the page links to `/architect` (or straight to the paid Skool join page). **Free wording** counts phrases like "free community", "Join free" and "Start free" in the page text.

## Every page

| Page | Address | Old Skool links | Sign-up form | Next step | Free wording | Links to /community |
|---|---|---|---|---|---|---|
| `Astra.html` | /Astra | 1 × free community | Kit form 9886959, source `astra-job-briefs` | yes | 1 | none |
| `backup.html` | /backup | 1 × free community | Kit form 9685607, source `headquarters` | paid join link only | 1 | none |
| `blog.html` | /blog | 1 × free community | none | yes | 1 | 1 |
| `brand-guide.html` | /brand-guide.html (hidden from search) | none | none | **none** | none | none |
| `calm.html` | /calm | 1 × free community | Kit form 9685014, source `sunday-reset` | paid join link only | 1 | none |
| `carousel-guide.html` | /carousel-guide (hidden from search) | 1 × Skool about page | none | **none** | none | none |
| `carousel-maker.html` | /carousel | 2 × free community | Kit form 9346256, source `carousel-maker`, then /carousel-guide; Kit form 9346256, source `carousel-maker`, then /carousel-guide | **none** | none | none |
| `community.html` | /community | 3 × free community | none | yes | 5 | 2 |
| `content-advantage-welcome.html` | /content-advantage/welcome (hidden from search) | none | none | paid join link only | none | none |
| `content-advantage.html` | /content-advantage | 1 × free community | none | **none** | none | none |
| `dashboard.html` | /dashboard (hidden from search) | none | none | **none** | none | none |
| `dream.html` | /dream | 1 × free community | Kit form 9694100, source `dream` | paid join link only | 1 | none |
| `example-content.html` | /examples/one-idea-three-drafts | 1 × free community | none | yes | 2 | 2 |
| `fable.html` | /fable.html (redirected away) | 1 × free community | Kit form 9658821, source `fable` | **none** | 2 | none |
| `guide.html` | /guide | none | Kit form 9316842, source `claude-clearly`, then /thank-you?source=claude-clearly; Kit form 9316842, source `claude-clearly`, then /thank-you?source=claude-clearly | **none** | none | none |
| `hours.html` | /audit | 1 × free community | Kit form 9658821, source `hours` | **none** | 1 | none |
| `hub-welcome.html` | /hub/welcome (hidden from search) | 1 × free community | none | **none** | none | none |
| `hub.html` | /links | none | none | paid join link only | none | none |
| `journey-map-def6a4a862.html` | /journey-map-def6a4a862.html (hidden from search) | none | none | **none** | 2 | none |
| `masterclass-prompts.html` | /masterclass-prompts (hidden from search) | none | none | **none** | none | none |
| `masterclass-thankyou.html` | /masterclass-thankyou.html (hidden from search) | none | none | **none** | none | none |
| `masterclass.html` | /masterclass.html (redirected away) | 1 × free community | Kit form 9507453, source `masterclass`; Kit form 9507453, source `masterclass` | **none** | none | none |
| `notion-advantage-welcome.html` | /notion-advantage/welcome (hidden from search) | 1 × Skool about page | none | **none** | none | none |
| `notion-advantage.html` | /notion-advantage | 1 × free community | none | **none** | none | none |
| `posts/7-roles-just-me.html` | /posts/7-roles-just-me | none | none | yes | 1 | 2 |
| `posts/ai-for-solopreneurs-australia.html` | /posts/ai-for-solopreneurs-australia | none | none | yes | 1 | 3 |
| `posts/building-your-business-on-part-time-hours.html` | /posts/building-your-business-on-part-time-hours | none | none | yes | 1 | 2 |
| `posts/it-was-never-a-discipline-problem.html` | /posts/it-was-never-a-discipline-problem | none | none | yes | 2 | 3 |
| `posts/repurpose-newsletter-with-ai.html` | /posts/repurpose-newsletter-with-ai | none | none | yes | 1 | 2 |
| `posts/the-exhausting-part-isnt-the-writing.html` | /posts/the-exhausting-part-isnt-the-writing | none | none | yes | 1 | 2 |
| `posts/the-lie-ai-influencers-keep-telling-you.html` | /posts/the-lie-ai-influencers-keep-telling-you | none | none | yes | 1 | 2 |
| `posts/we-dont-want-volume-we-want-clarity.html` | /posts/we-dont-want-volume-we-want-clarity | none | none | yes | 1 | 2 |
| `posts/what-i-ask-claude-before-every-big-decision.html` | /posts/what-i-ask-claude-before-every-big-decision | none | none | yes | 1 | 2 |
| `posts/you-shouldnt-feel-ashamed-for-using-ai-in-your-content.html` | /posts/you-shouldnt-feel-ashamed-for-using-ai-in-your-content | 1 × free community | none | yes | 1 | 2 |
| `posts/you-were-never-meant-to-hold-all-of-it.html` | /posts/you-were-never-meant-to-hold-all-of-it | none | none | yes | 2 | 2 |
| `posts/your-content-lives-in-one-place-your-head.html` | /posts/your-content-lives-in-one-place-your-head | none | none | yes | 2 | 3 |
| `posts/youre-measuring-ai-wrong.html` | /posts/youre-measuring-ai-wrong | none | none | yes | 1 | 2 |
| `reel-thank-you.html` | /reel-thank-you (hidden from search) | none | none | yes | none | none |
| `reel.html` | /reel | none | posts to /api/reel-signup, then /reel-thank-you | **none** | none | none |
| `review.html` | /review | 1 × free community | Kit form 9693677, source `review` | paid join link only | 1 | none |
| `slop.html` | /slop | 1 × free community | Kit form 9739659, source `slop` | paid join link only | none | none |
| `style.html` | /style (hidden from search) | none | demo form (sends nothing) | yes | none | none |
| `switch.html` | /switch | none | Kit form 9316854, source `switch-to-claude` | **none** | 2 | 1 |
| `tools-business-team.html` | /tools/business-team (hidden from search) | 2 × Skool about page | none | **none** | none | none |
| `tools-claude-connectors.html` | /tools/claude-connectors (hidden from search) | 1 × Skool classroom | none | **none** | none | none |
| `tools-claude-projects.html` | /tools/claude-projects | 2 × Skool about page | none | **none** | none | none |
| `tools-clear-the-decks.html` | /tools/clear-the-decks (hidden from search) | 1 × Skool classroom | none | **none** | none | none |
| `tools-client-call.html` | /tools/client-call | 1 × Skool classroom | none | yes | none | none |
| `tools-client-welcome.html` | /tools/client-welcome | 1 × Skool classroom | none | yes | none | none |
| `tools-email-plan.html` | /tools/email-plan | 1 × Skool classroom | none | yes | none | none |
| `tools-everyday-jobs.html` | /tools/everyday-jobs | none | none | yes | none | none |
| `tools-first-ai-workflow.html` | /tools/first-ai-workflow | 2 × Skool about page | none | **none** | none | none |
| `tools-first-wins.html` | /tools/first-wins (hidden from search) | 1 × Skool classroom | none | **none** | none | none |
| `tools-five-ai-prompts.html` | /tools/five-ai-prompts (hidden from search) | 2 × Skool about page | none | **none** | none | none |
| `tools-follow-up-tracker.html` | /tools/follow-up-tracker | 1 × Skool classroom | none | yes | none | none |
| `tools-micro-sophistications.html` | /tools/micro-sophistications (hidden from search) | 2 × Skool about page | none | **none** | none | none |
| `tools-out-of-your-head.html` | /tools/out-of-your-head (hidden from search) | 1 × Skool classroom | none | **none** | none | none |
| `tools-quick-wins.html` | /tools/quick-wins (hidden from search) | 2 × Skool about page | none | **none** | none | none |
| `tools-repeat-job.html` | /tools/repeat-job | 1 × Skool classroom | none | yes | none | none |
| `tools-which-claude.html` | /tools/which-claude (hidden from search) | 1 × Skool about page | none | **none** | none | none |
| `vault-claude-clearly.html` | /vault-claude-clearly | none | none | **none** | none | none |
| `vault-starter.html` | /vault-starter.html | none | none | **none** | none | none |
| `vault.html` | /vault | 2 × Skool classroom; 1 × other Skool link; 1 × free community | none | yes | 3 | none |
| `work.html` | /work | 1 × free community | none | yes | 1 | 1 |
| `workshop-november-2026-details.html` | /workshop-november-2026-details (hidden from search) | none | none | yes | none | none |
| `workshop-october-2026-details.html` | /workshop-october-2026-details.html (hidden from search) | none | none | yes | none | none |
| `workshop-thankyou.html` | /workshop-thankyou (hidden from search) | none | none | yes | none | none |
| `workshop.html` | /workshop | none | posts to /api/workshop-signup, then /workshop-november-2026-details | **none** | none | none |
| `wwuai-pitch-deck.html` | /wwuai-pitch-deck.html (hidden from search) | none | none | **none** | none | none |

## Old Skool links, page by page

### `Astra.html`

- free community: "free community" goes to https://www.skool.com/wise-women-use-ai-1109

### `backup.html`

- free community: "free community" goes to https://www.skool.com/wise-women-use-ai-1109

### `blog.html`

- free community: "Join the community" goes to https://www.skool.com/wise-women-use-ai-1109

### `calm.html`

- free community: "free community" goes to https://www.skool.com/wise-women-use-ai-1109

### `carousel-guide.html`

- Skool about page: "Join the community" goes to https://www.skool.com/wise-women-use-ai-1109/about

### `carousel-maker.html`

- free community: "Join the Skool community here." goes to https://www.skool.com/wise-women-use-ai-1109
- free community: "Join the community" goes to https://www.skool.com/wise-women-use-ai-1109

### `community.html`

- free community: "Take the first step, free" goes to https://www.skool.com/wise-women-use-ai-1109
- free community: "Find your first bottleneck" goes to https://www.skool.com/wise-women-use-ai-1109
- free community: "Find your first bottleneck, free" goes to https://www.skool.com/wise-women-use-ai-1109

### `content-advantage.html`

- free community: "Join the community" goes to https://www.skool.com/wise-women-use-ai-1109

### `dream.html`

- free community: "free community" goes to https://www.skool.com/wise-women-use-ai-1109

### `example-content.html`

- free community: "Join the community" goes to https://www.skool.com/wise-women-use-ai-1109

### `fable.html`

- free community: "Join the free community" goes to https://www.skool.com/wise-women-use-ai-1109

### `hours.html`

- free community: "Get my next steps in the free community" goes to https://www.skool.com/wise-women-use-ai-1109

### `hub-welcome.html`

- free community: "See what's inside Skool →" goes to https://www.skool.com/wise-women-use-ai-1109

### `masterclass.html`

- free community: "Join the community" goes to https://www.skool.com/wise-women-use-ai-1109

### `notion-advantage-welcome.html`

- Skool about page: "See what's inside The Unfair Advantage" goes to https://www.skool.com/wise-women-use-ai-1109/about

### `notion-advantage.html`

- free community: "Join the community" goes to https://www.skool.com/wise-women-use-ai-1109

### `posts/you-shouldnt-feel-ashamed-for-using-ai-in-your-content.html`

- free community: "https://www.skool.com/wise-women-use-ai-1109" goes to https://www.skool.com/wise-women-use-ai-1109

### `review.html`

- free community: "free community" goes to https://www.skool.com/wise-women-use-ai-1109

### `slop.html`

- free community: "The community is free to join" goes to https://www.skool.com/wise-women-use-ai-1109

### `tools-business-team.html`

- Skool about page: "Share in the community →" goes to https://www.skool.com/wise-women-use-ai-1109/about
- Skool about page: "Join us" goes to https://www.skool.com/wise-women-use-ai-1109/about

### `tools-claude-connectors.html`

- Skool classroom: "Back to the classroom" goes to https://www.skool.com/wise-women-use-ai-1109/classroom

### `tools-claude-projects.html`

- Skool about page: "Share in the community" goes to https://www.skool.com/wise-women-use-ai-1109/about
- Skool about page: "Join us" goes to https://www.skool.com/wise-women-use-ai-1109/about

### `tools-clear-the-decks.html`

- Skool classroom: "Back to the classroom" goes to https://www.skool.com/wise-women-use-ai-1109/classroom

### `tools-client-call.html`

- Skool classroom: "Open the full lesson in the classroom" goes to https://www.skool.com/wise-women-use-ai-1109/classroom/4c3da818?md=243dcc87706340d0a38e0e5c1452f999

### `tools-client-welcome.html`

- Skool classroom: "Open the full lesson in the classroom" goes to https://www.skool.com/wise-women-use-ai-1109/classroom/4c3da818?md=c71663f0ca1948a888826678abd82d42

### `tools-email-plan.html`

- Skool classroom: "Open the full lesson in the classroom" goes to https://www.skool.com/wise-women-use-ai-1109/classroom/4c3da818?md=c1f1ab3304424038b54ab53561918030

### `tools-first-ai-workflow.html`

- Skool about page: "Join the community →" goes to https://www.skool.com/wise-women-use-ai-1109/about
- Skool about page: "Join us" goes to https://www.skool.com/wise-women-use-ai-1109/about

### `tools-first-wins.html`

- Skool classroom: "Back to the classroom" goes to https://www.skool.com/wise-women-use-ai-1109/classroom

### `tools-five-ai-prompts.html`

- Skool about page: "Join the community &rarr;" goes to https://www.skool.com/wise-women-use-ai-1109/about
- Skool about page: "Join us" goes to https://www.skool.com/wise-women-use-ai-1109/about

### `tools-follow-up-tracker.html`

- Skool classroom: "Open the full lesson in the classroom" goes to https://www.skool.com/wise-women-use-ai-1109/classroom/4c3da818?md=45d7e8209c34483f84415a8ff4c4fe3d

### `tools-micro-sophistications.html`

- Skool about page: "Post in the community" goes to https://www.skool.com/wise-women-use-ai-1109/about
- Skool about page: "Join us" goes to https://www.skool.com/wise-women-use-ai-1109/about

### `tools-out-of-your-head.html`

- Skool classroom: "Back to the classroom" goes to https://www.skool.com/wise-women-use-ai-1109/classroom

### `tools-quick-wins.html`

- Skool about page: "Post in the community" goes to https://www.skool.com/wise-women-use-ai-1109/about
- Skool about page: "Join us" goes to https://www.skool.com/wise-women-use-ai-1109/about

### `tools-repeat-job.html`

- Skool classroom: "Open the full lesson in the classroom" goes to https://www.skool.com/wise-women-use-ai-1109/classroom/4c3da818?md=b0c9f343a9604b6e9d002a11eab031aa

### `tools-which-claude.html`

- Skool about page: "Join us" goes to https://www.skool.com/wise-women-use-ai-1109/about

### `vault.html`

- Skool classroom: "One idea into three useful drafts" goes to https://www.skool.com/wise-women-use-ai-1109/classroom/4c3da818?md=8ae5e01d6ed24b3997263bef6e7040f5
- Skool classroom: "Business Dependency Diagnostic" goes to https://www.skool.com/wise-women-use-ai-1109/classroom/806413b8?md=1ddb4e354e504e86b602ef7032ae9ce5
- other Skool link: "Skool ↗ Where the community and membership live." goes to https://www.skool.com/
- free community: "Still finding your feet? Join the free community" goes to https://www.skool.com/wise-women-use-ai-1109

### `work.html`

- free community: "Join the community" goes to https://www.skool.com/wise-women-use-ai-1109

## Pages with no next step

- `brand-guide.html`
- `carousel-guide.html`
- `carousel-maker.html`
- `content-advantage.html`
- `dashboard.html`
- `fable.html` (redirected away, visitors never see it)
- `guide.html`
- `hours.html`
- `hub-welcome.html`
- `journey-map-def6a4a862.html`
- `masterclass-prompts.html`
- `masterclass-thankyou.html`
- `masterclass.html` (redirected away, visitors never see it)
- `notion-advantage-welcome.html`
- `notion-advantage.html`
- `reel.html`
- `switch.html`
- `tools-business-team.html`
- `tools-claude-connectors.html`
- `tools-claude-projects.html`
- `tools-clear-the-decks.html`
- `tools-first-ai-workflow.html`
- `tools-first-wins.html`
- `tools-five-ai-prompts.html`
- `tools-micro-sophistications.html`
- `tools-out-of-your-head.html`
- `tools-quick-wins.html`
- `tools-which-claude.html`
- `vault-claude-clearly.html`
- `vault-starter.html`
- `workshop.html`
- `wwuai-pitch-deck.html`

## Broken internal links

### `masterclass.html`

- /assets/photos/content-hero.jpg
- /assets/photos/kelly-note.jpg

### `wwuai-pitch-deck.html`

- /cdn-cgi/l/email-protection ("[email&#160;protected]")
- /cdn-cgi/scripts/5c5dd728/cloudflare-static/email-decode.min.js
