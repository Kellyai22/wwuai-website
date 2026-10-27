#!/usr/bin/env node
// Hard checks for pages built on the WWUAI page system.
//   node scripts/check-system.mjs                 checks the system files + style.html
//   node scripts/check-system.mjs page.html ...   also checks those pages
// Exit 1 on any failure. Each rule says what it caught and where.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const files = ["assets/system/wwuai.css", "assets/system/wwuai.js", "style.html", ...process.argv.slice(2)];

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
for (const rel of files) {
  const abs = path.resolve(root, rel);
  if (!fs.existsSync(abs)) { console.error(`MISSING  ${rel}`); fails++; continue; }
  const text = fs.readFileSync(abs, "utf8");
  for (const part of cssParts(rel, text)) {
    part.split("\n").forEach((line) => {
      for (const [re, why] of cssRules) if (re.test(line)) { console.error(`FAIL  ${rel}: ${why}\n      ${line.trim().slice(0, 140)}`); fails++; }
    });
  }
  if (rel.endsWith(".html")) {
    visibleText(text).split("\n").forEach((line) => {
      // Brand name is allowed to say AI.
      const l = line.replace(/Wise Women Use AI/g, "");
      for (const [re, why] of htmlRules) if (re.test(l)) { console.error(`FAIL  ${rel}: ${why}\n      ${line.trim().slice(0, 140)}`); fails++; }
    });
    if (/(font-?awesome|material-icons|lucide|phosphor|heroicons|bootstrap-icons)/i.test(text)) { console.error(`FAIL  ${rel}: stock icon set`); fails++; }
    if (!/<title>[^<]{5,}<\/title>/.test(text)) { console.error(`FAIL  ${rel}: no page title`); fails++; }
    if (!/\/assets\/system\/wwuai\.css/.test(text) || !/\/assets\/system\/tokens\.css/.test(text)) { console.error(`FAIL  ${rel}: does not load the page system CSS`); fails++; }
  }
}
if (fails) { console.error(`\n${fails} problem(s).`); process.exit(1); }
console.log(`page system check passed (${files.length} files)`);
