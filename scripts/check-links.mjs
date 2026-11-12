#!/usr/bin/env node
/**
 * Link check. Runs on every build (after `astro build`).
 *
 *   Astro pages (src/pages)   a broken internal link FAILS the build.
 *   Legacy pages (public/)    never fail. They are written up in LINK-REPORT.md:
 *                             links to the closed free Skool community, Skool
 *                             "about" or a classroom lesson, every sign-up form
 *                             with its Kit form ID, whether the page has a next
 *                             step, and any broken internal links.
 *
 *   node scripts/check-links.mjs            check; refresh LINK-REPORT.md (not on Vercel)
 *   node scripts/check-links.mjs --report   same, and always write the report
 *   node scripts/check-links.mjs --no-report
 *
 * An address counts as working if vercel.json routes it to a file that exists,
 * redirects it, or the built site contains that file. Same rules Vercel applies.
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT, DIST, PUBLIC, vercel, astroPages, legacyPages, resolveUrl, linksIn, internalPath } from "./lib-site.mjs";

const args = new Set(process.argv.slice(2));
if (!fs.existsSync(DIST)) { console.error("No dist/ folder. Run `npm run build` first."); process.exit(1); }

const NEXT_STEP = "/architect";
const SKOOL = /^https?:\/\/(www\.)?skool\.com\/wise-women-use-ai-1109(\/[^?#]*)?/i;
function skoolKind(url) {
  const m = SKOOL.exec(url);
  if (!m) return /skool\.com/i.test(url) ? "other Skool link" : null;
  const rest = (m[2] || "").replace(/\/+$/, "");
  if (rest === "") return "free community";
  if (rest === "/about") return "Skool about page";
  if (rest.startsWith("/classroom")) return "Skool classroom";
  if (rest === "/plans") return "paid join";
  return "other Skool link";
}

function brokenLinks(html) {
  const ids = new Set([...html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]));
  const bad = [];
  for (const l of linksIn(html)) {
    if (l.url.startsWith("#") && l.url.length > 1) {
      if (!ids.has(l.url.slice(1)) && !/\{|\$/.test(l.url)) bad.push(`${l.url} (no element with that id on the page)`);
      continue;
    }
    const p = internalPath(l.url);
    if (p == null) continue;
    const r = resolveUrl(p);
    if (!r.ok) bad.push(`${l.url}${l.text ? ` ("${l.text.slice(0, 50)}")` : ""}`);
  }
  return [...new Set(bad)];
}

// 1. Every address vercel.json serves must point at a file that exists.
const routeProblems = [];
for (const r of vercel.routes) {
  if (!r.dest || (r.status >= 300 && r.status < 400) || r.dest.includes("$")) continue;
  if (!fs.existsSync(path.join(DIST, r.dest))) routeProblems.push(`${r.src} -> ${r.dest} (file missing from the built site)`);
}

// 2. Astro pages: broken internal links fail the build.
let fails = routeProblems.length;
for (const p of routeProblems) console.error(`FAIL  vercel.json: ${p}`);
const astro = astroPages();
for (const { file, source } of astro) {
  const built = path.join(DIST, file);
  if (!fs.existsSync(built)) { console.error(`FAIL  ${source}: was not built`); fails++; continue; }
  const html = fs.readFileSync(built, "utf8");
  for (const b of brokenLinks(html)) { console.error(`FAIL  ${source}: broken link ${b}`); fails++; }
  for (const l of linksIn(html)) {
    const k = skoolKind(l.url);
    if (k && k !== "paid join") { console.error(`FAIL  ${source}: links to the ${k} (${l.url}). The free community closed 11 Nov 2026; send people to ${NEXT_STEP}.`); fails++; }
  }
}

// 3. Legacy pages: report only.
const routeFor = new Map(); // file -> clean addresses
for (const r of vercel.routes) {
  if (r.dest && !(r.status >= 300) && !r.dest.includes("$")) {
    const f = r.dest.replace(/^\//, "");
    routeFor.set(f, [...(routeFor.get(f) || []), r.src]);
  }
}
const redirectedFiles = new Set(vercel.routes.filter((r) => r.status >= 300 && r.src?.endsWith(".html")).map((r) => r.src.slice(1)));
const rows = [];
for (const file of legacyPages()) {
  const html = fs.readFileSync(path.join(PUBLIC, file), "utf8");
  const links = linksIn(html);
  const skoolLinks = [];
  for (const l of links) { const k = skoolKind(l.url); if (k && k !== "paid join") skoolLinks.push({ kind: k, url: l.url, text: l.text }); }
  const forms = [];
  for (const m of html.replace(/<!--[\s\S]*?-->/g, "").matchAll(/<form\b([^>]*)>([\s\S]*?)<\/form>/gi)) {
    const action = /\baction\s*=\s*["']([^"']*)["']/i.exec(m[1])?.[1] || "";
    const kit = /kit\.com\/forms\/(\d+)/i.exec(action)?.[1] || /data-sv-form\s*=\s*["'](\d+)["']/i.exec(m[1])?.[1];
    const source = /name\s*=\s*["']fields\[source\]["'][^>]*value\s*=\s*["']([^"']*)["']/i.exec(m[2])?.[1]
      || /value\s*=\s*["']([^"']*)["'][^>]*name\s*=\s*["']fields\[source\]["']/i.exec(m[2])?.[1];
    const success = /data-success-url\s*=\s*["']([^"']*)["']/i.exec(m[1])?.[1];
    if (kit) forms.push(`Kit form ${kit}${source ? `, source \`${source}\`` : ""}${success ? `, then ${success}` : ""}`);
    else if (action.startsWith("/api/")) forms.push(`posts to ${action}${success ? `, then ${success}` : ""}`);
    else if (/data-demo/i.test(m[1])) forms.push("demo form (sends nothing)");
    else forms.push(`form posting to ${action || "(no address)"}`);
  }
  const hasArchitect = links.some((l) => (internalPath(l.url) || "").split(/[?#]/)[0] === NEXT_STEP);
  const hasPaidJoin = links.some((l) => skoolKind(l.url) === "paid join");
  const communityLinks = links.filter((l) => (internalPath(l.url) || "").split(/[?#]/)[0] === "/community").length;
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<[^>]+>/g, " ");
  const freeMentions = (text.match(/free (Wise Women Use AI )?community|join free|start free/gi) || []).length;
  const address = file === "404.html" ? null
    : routeFor.get(file)?.[0] || (file.startsWith("posts/") ? "/" + file.replace(/\.html$/, "") : "/" + file);
  rows.push({
    file, address, redirected: redirectedFiles.has(file), noindex: /<meta[^>]+name=["']robots["'][^>]*noindex/i.test(html),
    skoolLinks, forms, hasArchitect, hasPaidJoin, communityLinks, freeMentions, broken: brokenLinks(html),
  });
}

function report() {
  const withSkool = rows.filter((r) => r.skoolLinks.length);
  const noNext = rows.filter((r) => !r.hasArchitect && !r.hasPaidJoin);
  const withForms = rows.filter((r) => r.forms.some((f) => !f.startsWith("demo form")));
  const withBroken = rows.filter((r) => r.broken.length);
  const kitIds = new Set(rows.flatMap((r) => r.forms.map((f) => /Kit form (\d+)/.exec(f)?.[1]).filter(Boolean)));
  const L = [];
  L.push("# Link report: legacy pages", "");
  L.push("Written by `node scripts/check-links.mjs` on every local build. Do not edit by hand.", "");
  L.push("These are the older pages served as-is from `public/`. Nothing here fails the build. It is the list for deciding what stays, what gets rebuilt and what goes.", "");
  L.push("## Summary", "");
  L.push(`- ${rows.length} legacy pages.`);
  L.push(`- ${withSkool.length} still link to the closed free Skool community, the Skool "about" page or a classroom lesson (${withSkool.reduce((n, r) => n + r.skoolLinks.length, 0)} links in all).`);
  L.push(`- ${withForms.length} carry a sign-up form, across ${kitIds.size} different Kit forms.`);
  L.push(`- ${noNext.length} have no next step (no link to ${NEXT_STEP} and no paid join link).`);
  L.push(`- ${withBroken.length} have a broken internal link.`, "");
  L.push("How to read it: **Next step** is yes when the page links to `/architect` (or straight to the paid Skool join page). **Free wording** counts phrases like \"free community\", \"Join free\" and \"Start free\" in the page text.", "");
  L.push("## Every page", "");
  L.push("| Page | Address | Old Skool links | Sign-up form | Next step | Free wording | Links to /community |");
  L.push("|---|---|---|---|---|---|---|");
  for (const r of rows) {
    const kinds = {}; for (const s of r.skoolLinks) kinds[s.kind] = (kinds[s.kind] || 0) + 1;
    const skool = Object.entries(kinds).map(([k, n]) => `${n} × ${k}`).join("; ") || "none";
    const next = r.hasArchitect ? "yes" : r.hasPaidJoin ? "paid join link only" : "**none**";
    const note = [r.redirected ? "redirected away" : null, r.noindex ? "hidden from search" : null].filter(Boolean).join(", ");
    L.push(`| \`${r.file}\` | ${r.address ?? "(not-found page)"}${note ? ` (${note})` : ""} | ${skool} | ${r.forms.join("; ") || "none"} | ${next} | ${r.freeMentions || "none"} | ${r.communityLinks || "none"} |`);
  }
  L.push("", "## Old Skool links, page by page", "");
  if (!withSkool.length) L.push("None.");
  for (const r of withSkool) {
    L.push(`### \`${r.file}\``, "");
    for (const s of r.skoolLinks) L.push(`- ${s.kind}: "${s.text || "(no link text)"}" goes to ${s.url}`);
    L.push("");
  }
  L.push("## Pages with no next step", "");
  L.push(noNext.length ? noNext.map((r) => `- \`${r.file}\`${r.redirected ? " (redirected away, visitors never see it)" : ""}`).join("\n") : "None.", "");
  L.push("## Broken internal links", "");
  if (!withBroken.length) L.push("None.");
  for (const r of withBroken) { L.push(`### \`${r.file}\``, ""); for (const b of r.broken) L.push(`- ${b}`); L.push(""); }
  return L.join("\n").replace(/\n+$/, "\n");
}

const md = report();
const target = path.join(ROOT, "LINK-REPORT.md");
const write = args.has("--report") || (!args.has("--no-report") && !process.env.VERCEL && !process.env.CI);
if (write) fs.writeFileSync(target, md);

const skoolPages = rows.filter((r) => r.skoolLinks.length).length;
const brokenPages = rows.filter((r) => r.broken.length).length;
console.log(`link check: ${astro.length} Astro pages, ${rows.length} legacy pages. Legacy (report only): ${skoolPages} with old Skool links, ${brokenPages} with broken links. ${write ? "LINK-REPORT.md written." : "See LINK-REPORT.md."}`);
if (fails) { console.error(`\n${fails} link problem(s) on Astro pages or routes. The build stops here.`); process.exit(1); }
