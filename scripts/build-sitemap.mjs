#!/usr/bin/env node
/**
 * Rebuilds sitemap.xml from the repo itself.
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
 *   - lastmod is the file's last git commit date, not a guess
 *
 * Usage:
 *   node scripts/build-sitemap.mjs             write sitemap.xml
 *   node scripts/build-sitemap.mjs --check     exit 1 if sitemap.xml is stale
 *   node scripts/build-sitemap.mjs --dry-run   print it, write nothing
 */

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = "https://www.wisewomenuseai.com";
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

const vercel = JSON.parse(readFileSync(path.join(ROOT, "vercel.json"), "utf8"));

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
  const postsDir = path.join(ROOT, "posts");
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
  const full = path.join(ROOT, file);
  if (!existsSync(full)) return true;         // routed at a file that does not exist
  const tag = readFileSync(full, "utf8").match(/<meta[^>]+name=["']robots["'][^>]*>/i);
  return !!(tag && /noindex/i.test(tag[0]));
}

/**
 * Files git has never seen are work in progress from another session, not live
 * pages. Listing one would publish a sitemap entry pointing at a 404 until that
 * page is pushed.
 */
const tracked = new Set(
  execFileSync("git", ["ls-files"], { cwd: ROOT, encoding: "utf8" }).split("\n").filter(Boolean)
);

/** The page's own canonical tag decides which URL wins when several route to it. */
function canonicalOf(file) {
  const full = path.join(ROOT, file);
  if (!existsSync(full)) return null;
  const m = readFileSync(full, "utf8").match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  return m ? m[1].replace(BASE, "") || "/" : null;
}

function lastCommitDate(file) {
  try {
    const out = execFileSync("git", ["log", "-1", "--format=%cs", "--", file], {
      cwd: ROOT, encoding: "utf8",
    }).trim();
    return out || new Date().toISOString().slice(0, 10);
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
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
  if (!tracked.has(file)) { skipped.push([url, "not committed yet"]); continue; }

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
  urls.push({ url, lastmod: lastCommitDate(file), priority: priorityFor(url) });
}
urls.sort((a, b) => Number(b.priority) - Number(a.priority) || a.url.localeCompare(b.url));

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((u) =>
    [
      "  <url>",
      `    <loc>${BASE}${u.url}</loc>`,
      `    <lastmod>${u.lastmod}</lastmod>`,
      `    <priority>${u.priority}</priority>`,
      "  </url>",
    ].join("\n")
  ),
  "</urlset>",
  "",
].join("\n");

const target = path.join(ROOT, "sitemap.xml");

if (args.has("--check")) {
  const current = existsSync(target) ? readFileSync(target, "utf8") : "";
  if (current.trim() !== xml.trim()) {
    console.error("sitemap.xml is STALE. Run: node scripts/build-sitemap.mjs");
    process.exit(1);
  }
  console.log(`sitemap.xml is current (${urls.length} URLs).`);
} else if (args.has("--dry-run")) {
  console.log(xml);
  console.error(`\n${urls.length} URLs, ${skipped.length} skipped:`);
  for (const [u, why] of skipped) console.error(`  - ${u}  (${why})`);
} else {
  writeFileSync(target, xml);
  console.log(`sitemap.xml written: ${urls.length} URLs, ${skipped.length} skipped.`);
  for (const [u, why] of skipped) console.log(`  skipped ${u}  (${why})`);
}
