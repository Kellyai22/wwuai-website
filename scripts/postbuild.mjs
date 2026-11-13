#!/usr/bin/env node
// Every check, in one place. `npm run build` runs this straight after `astro build`,
// so a build that finishes has passed all of them. `npm run check` runs it on its own.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { ROOT } from "./lib-site.mjs";

const steps = [
  ["Page system", ["scripts/check-system.mjs"]],
  ["Links and routes", ["scripts/check-links.mjs"]],
  ["Sitemap", ["scripts/build-sitemap.mjs", "--dist"]],
  ["Closing block on every free page", ["scripts/apply-closing.mjs", "--check"]],
  ["Everyday prompts in step with the audit", ["scripts/sync-everyday-prompts.mjs", "--check"]],
  ["Tests", ["--test", ...fs.readdirSync(path.join(ROOT, "tests")).filter((f) => /\.test\.[cm]?js$/.test(f)).map((f) => path.join("tests", f))]],
];
// Colours come from a file on Kelly's Mac, so this one only runs there.
const brand = process.env.BRAND_TOKENS || path.join(os.homedir(), ".claude/wwuai-os/config/brand-tokens.json");
if (fs.existsSync(brand)) steps.push(["Colour tokens match the brand file", ["scripts/build-tokens.mjs", "--check"]]);

const failed = [];
for (const [name, argv] of steps) {
  console.log(`\n== ${name}`);
  const r = spawnSync(process.execPath, argv, { cwd: ROOT, stdio: "inherit" });
  if (r.status !== 0) failed.push(name);
}
if (failed.length) { console.error(`\nFAILED: ${failed.join("; ")}`); process.exit(1); }
console.log("\nAll checks passed.");
