#!/usr/bin/env node
// Hard checks for pages built on the WWUAI page system.
//   node scripts/check-system.mjs                 checks the system files, /style and every
//                                                 built Astro page that is on the page system
//   node scripts/check-system.mjs page.html ...   also checks those pages (looked up in public/,
//                                                 then in the built site, dist/)
// Exit 1 on any failure. Each rule says what it caught and where.
// Runs on every build (scripts/postbuild.mjs). Astro pages still on the Legacy layout are
// listed and skipped: they keep their old styling until they are rebuilt.
import fs from "node:fs";
import path from "node:path";
import { ROOT, DIST, astroPages } from "./lib-site.mjs";

function locate(arg) {
  for (const p of [arg, path.join("public", arg), path.join("dist", arg)]) if (fs.existsSync(path.resolve(ROOT, p))) return p;
  return arg;
}
const onSystem = (html) => /\/assets\/system\/wwuai\.css/.test(html);
const built = [], notYet = [];
for (const { file, source } of astroPages()) {
  const p = path.join(DIST, file);
  if (!fs.existsSync(p)) continue;                 // no build yet: nothing to check
  (onSystem(fs.readFileSync(p, "utf8")) ? built : notYet).push({ rel: path.join("dist", file), source });
}
const sourceFor = new Map(built.map((b) => [b.rel, b.source]));
const files = [
  "public/assets/system/wwuai.css", "public/assets/system/wwuai.js", "public/style.html",
  ...built.map((b) => b.rel), ...process.argv.slice(2).map(locate),
];

// Rules apply to CSS (files + <style> blocks + style="" attributes) unless marked html.
const cssRules = [
  [/#[0-9a-f]{3,8}\b/i, "hex colour outside tokens.css (use a token)"],
  [/box-shadow\s*:\s*(?!none)/i, "box-shadow (no drop shadows)"],
  [/drop-shadow\(/i, "drop-shadow filter (no drop shadows)"],
  [/\bblack\b|rgba?\(\s*0[ ,]+0[ ,]+0\b/i, "black (no stark black)"],
  [/\b(purple|violet|indigo|magenta|fuchsia|lavender)\b/i, "purple family colour"],
  [/border-radius\s*:\s*(50%|9{3,}px)/i, "circle (no circles or shapes behind images)"],
  [/text-transform\s*:\s*uppercase/i, "uppercase text (no capitals for emphasis)"],
  [/font-family\s*:(?![^;]*var\(--(serif|sans|script|logo)\)|\s*"Giza Stencil")/i, "font outside Playfair / Plus Jakarta / Allison"],
];
const htmlRules = [
  [/—/, "em dash"],
  [/\bAI\b(?![^<]*Wise Women Use AI)/, "capital AI in copy (ai is lowercase; brand name excepted)"],
];

function cssParts(file, text) {
  if (file.endsWith(".css")) return [text];
  if (!file.endsWith(".html")) return [];
  const parts = [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map((m) => m[1]);
  parts.push(...[...text.matchAll(/\sstyle="([^"]*)"/gi)].map((m) => m[1]));
  return parts;
}
function visibleText(text) {
  return text.replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<head[\s\S]*?<\/head>/i, "").replace(/<[^>]+>/g, "\n");
}

let fails = 0;
for (const rel of [...new Set(files)]) {
  const abs = path.resolve(ROOT, rel);
  const name = sourceFor.has(rel) ? `${sourceFor.get(rel)} (built)` : rel;
  if (!fs.existsSync(abs)) { console.error(`MISSING  ${rel}`); fails++; continue; }
  const text = fs.readFileSync(abs, "utf8");
  for (const part of cssParts(rel, text)) {
    part.split("\n").forEach((line) => {
      for (const [re, why] of cssRules) if (re.test(line)) { console.error(`FAIL  ${name}: ${why}\n      ${line.trim().slice(0, 140)}`); fails++; }
    });
  }
  if (rel.endsWith(".html")) {
    visibleText(text).split("\n").forEach((line) => {
      // Brand name is allowed to say AI.
      const l = line.replace(/Wise Women Use AI/g, "");
      for (const [re, why] of htmlRules) if (re.test(l)) { console.error(`FAIL  ${name}: ${why}\n      ${line.trim().slice(0, 140)}`); fails++; }
    });
    if (/(font-?awesome|material-icons|lucide|phosphor|heroicons|bootstrap-icons)/i.test(text)) { console.error(`FAIL  ${name}: stock icon set`); fails++; }
    if (!/<title>[^<]{5,}<\/title>/.test(text)) { console.error(`FAIL  ${name}: no page title`); fails++; }
    if (!/\/assets\/system\/wwuai\.css/.test(text) || !/\/assets\/system\/tokens\.css/.test(text)) { console.error(`FAIL  ${name}: does not load the page system CSS`); fails++; }
    // Astro pages on the system must end with the next step (the layouts add it).
    if (sourceFor.has(rel) && !/class="s band band--mark tone-dark"/.test(text)) { console.error(`FAIL  ${name}: no closing next step (use the Sales, Guide or ThankYou layout)`); fails++; }
  }
}
if (notYet.length) console.log(`not on the page system yet (skipped): ${notYet.map((n) => n.source.replace("src/pages/", "")).join(", ")}`);
if (fails) { console.error(`\n${fails} problem(s).`); process.exit(1); }
console.log(`page system check passed (${new Set(files).size} files)`);
