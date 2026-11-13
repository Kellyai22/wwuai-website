#!/usr/bin/env node
// Writes the shared closing block into every older free page in public/.
// A page takes the block wherever it has the markers:
//     <!-- closing:start -->        full-width band
//     <!-- closing:start panel -->  rounded panel, inside a page wrapper
//     <!-- closing:end -->
// Change the words in src/config/closing.json, then run this.
//   node scripts/apply-closing.mjs           rewrite the blocks
//   node scripts/apply-closing.mjs --check   fail if any block has drifted, or a
//                                            page on the list has lost its block
// Runs with --check on every build (scripts/postbuild.mjs).
import fs from "node:fs";
import path from "node:path";
import { ROOT, PUBLIC, walk } from "./lib-site.mjs";
import { BLOCK, wrap } from "./lib-closing.mjs";

const closing = JSON.parse(fs.readFileSync(path.join(ROOT, "src", "config", "closing.json"), "utf8"));

// Every free resource page that must end with the block (older pages only;
// /starter is an Astro page and is checked in the built site below).
export const REQUIRED = [
  "Astra.html", "calm.html", "backup.html", "review.html", "dream.html", "slop.html", "guide.html",
  "switch.html", "carousel-maker.html", "reel.html",
  ...fs.readdirSync(PUBLIC).filter((f) => /^tools-.*\.html$/.test(f)).sort(),
];

const check = process.argv.includes("--check");
let drift = 0, written = 0, missing = [];
for (const abs of walk(PUBLIC, (f) => f.endsWith(".html"))) {
  const rel = path.relative(PUBLIC, abs);
  const html = fs.readFileSync(abs, "utf8");
  const blocks = html.match(BLOCK) || [];
  if (!blocks.length) { if (REQUIRED.includes(rel)) missing.push(rel); continue; }
  if (blocks.length > 1) { console.error(`FAIL  ${rel}: ${blocks.length} closing blocks (a page ends with one)`); drift++; continue; }
  const next = html.replace(BLOCK, (m, panel) => wrap(closing, panel ? "panel" : "band"));
  if (next === html) continue;
  if (check) { console.error(`FAIL  ${rel}: closing block has drifted from src/config/closing.json`); drift++; }
  else { fs.writeFileSync(abs, next); written++; }
}
for (const m of missing) console.error(`FAIL  ${m}: no closing block (add the markers, then run node scripts/apply-closing.mjs)`);
// The built /starter page carries it through ClosingBlock.astro.
const starter = path.join(PUBLIC, "..", "dist", "starter.html");
if (check && fs.existsSync(starter) && !/class="wwc/.test(fs.readFileSync(starter, "utf8"))) { console.error("FAIL  starter.astro: no closing block"); drift++; }
if (drift || missing.length) { console.error(`\n${drift + missing.length} closing block problem(s). Run: node scripts/apply-closing.mjs`); process.exit(1); }
console.log(check ? `closing block matches on ${REQUIRED.length} older pages` : `closing block written to ${written} page(s)`);
