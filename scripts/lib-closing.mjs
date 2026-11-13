// The shared closing block for free resource pages, as plain HTML that can sit
// on an older page without the page system. Words come from
// src/config/closing.json. Used by scripts/apply-closing.mjs (older pages in
// public/) and src/components/legacy/ClosingBlock.astro (older Astro pages).
// Page-system pages do not use this: their layout ends with <NextStep next="workshop">.
// Pure: the caller passes the words in (no file reads here, so Astro can bundle it).

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

const css = `
.wwc{margin:0;padding:clamp(56px,7vw,104px) clamp(20px,5vw,64px);background:var(--bordeaux);color:var(--pearl);text-align:center;font-family:"Plus Jakarta Sans",system-ui,-apple-system,"Segoe UI",sans-serif}
.wwc--panel{border-radius:18px;margin:clamp(40px,5vw,64px) 0}
.wwc__in{max-width:760px;margin:0 auto}
.wwc .wwc__h{font-family:"Playfair Display",Georgia,serif;font-weight:400;font-style:normal;font-size:clamp(2rem,1.4rem + 2.6vw,3.5rem);line-height:1.08;letter-spacing:-.015em;color:var(--pearl);margin:0 0 20px;max-width:none}
.wwc .wwc__p{font-size:1.125rem;line-height:1.6;color:rgb(var(--pearl-rgb) / .82);margin:0 auto 28px;max-width:56ch}
.wwc .wwc__btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:54px;padding:0 30px;background:var(--blush);border:1.5px solid var(--blush);border-radius:2px;color:var(--bordeaux);font-weight:500;font-size:1rem;line-height:1.2;letter-spacing:.01em;text-decoration:none;transition:background-color .2s ease,color .2s ease}
.wwc .wwc__btn:active{transform:translateY(1px)}
@media (hover:hover) and (pointer:fine){.wwc .wwc__btn:hover{background:transparent;color:var(--blush)}}
.wwc .wwc__date{font-size:.9375rem;line-height:1.5;color:rgb(var(--pearl-rgb) / .74);margin:16px 0 0;max-width:none}
`.trim();

/** variant: "band" (full width, outside any page wrapper) or "panel" (rounded, inside one). */
export function closingHtml(closing, variant = "band") {
  return [
    `<link rel="stylesheet" href="/assets/system/tokens.css">`,
    `<style>${css}</style>`,
    `<section class="wwc${variant === "panel" ? " wwc--panel" : ""}" aria-labelledby="wwc-h">`,
    `  <div class="wwc__in">`,
    `    <h2 class="wwc__h" id="wwc-h">${esc(closing.heading)}</h2>`,
    `    <p class="wwc__p">${esc(closing.line)}</p>`,
    `    <a class="wwc__btn" href="${esc(closing.href)}">${esc(closing.button)} <span aria-hidden="true">→</span></a>`,
    `    <p class="wwc__date" data-next-workshop hidden></p>`,
    `  </div>`,
    `</section>`,
    `<script defer src="/assets/js/workshop-next.js"></script>`,
  ].join("\n");
}

export const START = /<!-- closing:start( panel)? -->/;
export const BLOCK = /<!-- closing:start( panel)? -->[\s\S]*?<!-- closing:end -->/g;
export const wrap = (closing, variant) => `<!-- closing:start${variant === "panel" ? " panel" : ""} -->\n${closingHtml(closing, variant)}\n<!-- closing:end -->`;
