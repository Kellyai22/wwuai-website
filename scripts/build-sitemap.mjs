#!/usr/bin/env node
/**
 * Rebuilds the sitemap from the site itself.
 *
 * Why this exists: the sitemap was hand-maintained and drifted twice. A July
 * 2026 audit found 6 of 10 blog posts missing; by 12 August it was 15 pages out
 * of date and was simultaneously listing /workshop, which carried a noindex tag
 * at the time. A hand-kept list will always rot, because nothing checks it.
 *
 * The rules live here instead of in someone's memory:
 *   - included only if vercel.json actually routes to the file
 *   - excluded if the page carries a robots noindex tag
 *   - excluded if the route is a 3xx redirect, or the file is missing
 *   - lastmod is the file's last real change in git, not a guess
 *
 * Since the Astro rebuild (Nov 2026) a page is either a legacy file in public/
 * or an Astro page in src/pages/. Astro pages are read from the built site, so
 * run `npm run build` (or `npx astro build`) first.
 *
 * Usage:
 *   node scripts/build-sitemap.mjs             write public/sitemap.xml
 *   node scripts/build-sitemap.mjs --check     exit 1 if its list of addresses is stale
 *   node scripts/build-sitemap.mjs --dry-run   print it, write nothing
 *   node scripts/build-sitemap.mjs --dist      (every build) --check, and also write a
 *                                              correct dist/sitemap.xml so visitors never
 *                                              get a stale one. On Vercel a stale committed
 *                                              file warns instead of failing, so a new blog
 *                                              post can never be blocked by its own sitemap line.
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { ROOT, PUBLIC, DIST, BASE, vercel, astroPages, sourceOf, servedHtml } from "./lib-site.mjs";

const args = new Set(process.argv.slice(2));

// Priority by URL shape. Anything unmatched gets 0.5.
const PRIORITY = [
  [/^\/$/, "1.0"],
  [/^\/(work|community|workshop)$/, "0.9"],
  [/^\/(about|blog|notion-advantage|content-advantage)$/, "0.8"],
  [/^\/posts\//, "0.6"],
  [/^\/(privacy|ai-disclosure)$/, "0.3"],
];

const priorityFor = (url) => (PRIORITY.find(([re]) => re.test(url)) || [, "0.5"])[1];

if (astroPages().length && !existsSync(DIST)) {
  console.error("No dist/ folder. Astro pages are read from the built site: run `npm run build` first.");
  process.exit(1);
}

/** Clean URL -> file, for every non-redirect, non-wildcard route. */
function routeMap() {
  const map = new Map();
  for (const r of vercel.routes) {
    if (!r.src || !r.dest) continue;          // redirects, handle:filesystem, header-only rules
    if (r.status && r.status >= 300) continue;
    if (r.src.includes("(")) continue;        // wildcards expanded separately
    map.set(r.src, r.dest.replace(/^\//, ""));
  }
  // Blog posts are served by the /posts/(.*) wildcard, so expand them from disk.
  const postsDir = path.join(PUBLIC, "posts");
  if (existsSync(postsDir)) {
    for (const f of readdirSync(postsDir).filter((f) => f.endsWith(".html"))) {
      map.set("/posts/" + f.replace(/\.html$/, ""), "posts/" + f);
    }
  }
  // The homepage is served by handle:filesystem rather than a named route.
  map.set("/", "index.html");
  return map;
}

function isNoindex(file) {
  const html = servedHtml(file);
  if (html == null) return true;              // routed at a file that does not exist
  const tag = html.match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  return !!(tag && /noindex/i.test(tag[0]));
}

/**
 * Files git has never seen are work in progress from another session, not live
 * pages. Listing one would publish a sitemap entry pointing at a 404 until that
 * page is pushed. If git is not available (some build machines), skip the test.
 */
let tracked = null, shallow = true;
try {
  tracked = new Set(execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).split("\n").filter(Boolean));
  shallow = execFileSync("git", ["rev-parse", "--is-shallow-repository"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim() !== "false";
} catch { tracked = null; }

/** The page's own canonical tag decides which URL wins when several route to it. */
function canonicalOf(file) {
  const html = servedHtml(file);
  if (html == null) return null;
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1].replace(BASE, "") || "/" : null;
}

const today = new Date().toISOString().slice(0, 10);

/**
 * Date of the file's last real change. A plain move (like the Nov 2026 move
 * into public/) is not a change to the page, so it is skipped.
 */
function lastChangeDate(source) {
  try {
    const out = execFileSync("git", ["log", "--follow", "-M", "--format=@%cs", "--name-status", "--", source], {
      cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    });
    let date = null;
    for (const line of out.split("\n")) {
      if (line.startsWith("@")) { date = line.slice(1); continue; }
      if (!line.trim() || !date) continue;
      if (!/^R100\b/.test(line)) return date;   // added, modified, or moved with edits
    }
    return date || today;
  } catch { return today; }
}

const redirected = new Set(
  vercel.routes.filter((r) => r.src && r.status >= 300).map((r) => r.src)
);

const urls = [];
const skipped = [];
const seenFile = new Map();   // file -> the URL already chosen for it

for (const [url, file] of [...routeMap()].sort()) {
  if (redirected.has(url)) { skipped.push([url, "301 redirect"]); continue; }
  if (isNoindex(file)) { skipped.push([url, "noindex or missing file"]); continue; }
  const source = sourceOf(file);
  if (tracked && (!source || !tracked.has(source))) { skipped.push([url, "not committed yet"]); continue; }

  // One file, one URL. Several routes can point at the same page (/switch and
  // /switch-wwuai, /carousel and /carousel-maker); listing both is duplicate
  // content. The page's own canonical tag breaks the tie.
  const canon = canonicalOf(file);
  if (seenFile.has(file)) {
    const kept = seenFile.get(file);
    if (canon === url) {                       // this one is canonical, swap it in
      const i = urls.findIndex((u) => u.url === kept);
      if (i >= 0) urls.splice(i, 1);
      skipped.push([kept, "duplicate of " + url]);
      seenFile.set(file, url);
    } else {
      skipped.push([url, "duplicate of " + kept]);
      continue;
    }
  } else {
    seenFile.set(file, url);
  }
  urls.push({ url, source, priority: priorityFor(url) });
}
urls.sort((a, b) => Number(b.priority) - Number(a.priority) || a.url.localeCompare(b.url));

const target = path.join(PUBLIC, "sitemap.xml");
const current = existsSync(target) ? readFileSync(target, "utf8") : "";
const committed = new Map(
  [...current.matchAll(/<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)].map((m) => [m[1].replace(BASE, "") || "/", m[2]])
);

const render = (dateFor) => [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) =>
    [
      "  <url>",
      `    <loc>${BASE}${u.url}</loc>`,
      `    <lastmod>${dateFor(u)}</lastmod>`,
      `    <priority>${u.priority}</priority>`,
      "  </url>",
    ].join("\n")
  ),
  "</urlset>",
  "",
].join("\n");

const want = new Set(urls.map((u) => u.url));
const missing = [...want].filter((u) => !committed.has(u));
const extra = [...committed.keys()].filter((u) => !want.has(u));
const stale = missing.length || extra.length;
const explain = () => {
  for (const u of missing) console.error(`  missing from sitemap.xml: ${u}`);
  for (const u of extra) console.error(`  listed but should not be: ${u}`);
};

if (args.has("--dist")) {
  // What visitors get is always right: keep the committed dates, add anything new as today.
  writeFileSync(path.join(DIST, "sitemap.xml"), render((u) => committed.get(u.url) || today));
  if (stale) {
    const soft = !!process.env.VERCEL || !!process.env.CI;
    console.error(`public/sitemap.xml is STALE (${missing.length} missing, ${extra.length} extra). ${soft ? "The built sitemap has been corrected for this deploy." : "Run: npm run sitemap"}`);
    explain();
    if (!soft) process.exit(1);
  } else console.log(`sitemap is current (${urls.length} URLs).`);
} else if (args.has("--check")) {
  if (stale) { console.error("public/sitemap.xml is STALE. Run: npm run sitemap"); explain(); process.exit(1); }
  console.log(`sitemap is current (${urls.length} URLs).`);
} else {
  // Full git history gives real dates. Without it (shallow copy), keep the dates already there.
  const xml = render((u) => (shallow ? committed.get(u.url) || today : lastChangeDate(u.source)));
  if (args.has("--dry-run")) {
    console.log(xml);
    console.error(`\n${urls.length} URLs, ${skipped.length} skipped:`);
    for (const [u, why] of skipped) console.error(`  - ${u}  (${why})`);
  } else {
    writeFileSync(target, xml);
    console.log(`public/sitemap.xml written: ${urls.length} URLs, ${skipped.length} skipped.`);
    for (const [u, why] of skipped) console.log(`  skipped ${u}  (${why})`);
  }
}
