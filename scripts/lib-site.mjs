// Shared by the build checks: where things live now, and how an address resolves.
//   public/      legacy pages and static files, served exactly as written
//   src/pages/   Astro pages (built into dist/)
//   dist/        the built site (public/ + built pages); what Vercel serves
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const PUBLIC = path.join(ROOT, "public");
export const DIST = path.join(ROOT, "dist");
export const PAGES = path.join(ROOT, "src", "pages");
export const BASE = "https://www.wisewomenuseai.com";
export const vercel = JSON.parse(fs.readFileSync(path.join(ROOT, "vercel.json"), "utf8"));

export function walk(dir, test = () => true, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, test, out);
    else if (test(full)) out.push(full);
  }
  return out;
}

/** Astro pages as { file: "about.html", source: "src/pages/about.astro" }. */
export function astroPages() {
  return walk(PAGES, (f) => f.endsWith(".astro") && !path.basename(f).startsWith("_")).map((f) => {
    const rel = path.relative(PAGES, f).replace(/\.astro$/, ".html");
    return { file: rel, source: path.relative(ROOT, f) };
  });
}

/** Legacy pages, relative to public/ (e.g. "calm.html", "posts/x.html"). */
export function legacyPages() {
  return walk(PUBLIC, (f) => f.endsWith(".html") && !f.includes(`${path.sep}assets${path.sep}`))
    .map((f) => path.relative(PUBLIC, f)).sort();
}

/** The source file behind a served file, for git dates: public/x.html or src/pages/x.astro. */
export function sourceOf(file) {
  if (fs.existsSync(path.join(PUBLIC, file))) return "public/" + file;
  const astro = "src/pages/" + file.replace(/\.html$/, ".astro");
  return fs.existsSync(path.join(ROOT, astro)) ? astro : null;
}

/** The HTML a visitor gets for a served file: the build if there is one, else public/. */
export function servedHtml(file) {
  for (const p of [path.join(DIST, file), path.join(PUBLIC, file)]) if (fs.existsSync(p)) return fs.readFileSync(p, "utf8");
  return null;
}

/**
 * Resolve an address the way Vercel does with this vercel.json.
 * Returns { ok, kind, detail }. kind: page | file | redirect | api | missing.
 */
export function resolveUrl(urlPath) {
  let p = urlPath.split("#")[0].split("?")[0] || "/";
  try { p = decodeURI(p); } catch {}
  for (const r of vercel.routes) {
    if (r.handle === "filesystem") break;
    if (!r.src) continue;
    const m = new RegExp("^" + r.src + "$").exec(p);
    if (!m) continue;
    if (r.status >= 300 && r.status < 400) return { ok: true, kind: "redirect", detail: r.headers?.Location };
    if (r.dest) {
      const dest = r.dest.replace(/\$(\d)/g, (_, i) => m[i] ?? "");
      const ok = fs.existsSync(path.join(DIST, dest));
      return { ok, kind: ok ? "page" : "missing", detail: dest };
    }
    // header-only rule with continue: fall through
  }
  if (p.startsWith("/api/")) {
    const ok = fs.existsSync(path.join(ROOT, p + ".js"));
    return { ok, kind: ok ? "api" : "missing", detail: p };
  }
  const target = path.join(DIST, p === "/" ? "index.html" : p);
  if (fs.existsSync(target) && fs.statSync(target).isFile()) return { ok: true, kind: "file", detail: p };
  return { ok: false, kind: "missing", detail: p };
}

/** Every href / src / action in a page, with the visible text of links. */
export function linksIn(html) {
  const out = [];
  const clean = html.replace(/<!--[\s\S]*?-->/g, "");
  for (const m of clean.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const href = /\bhref\s*=\s*["']([^"']*)["']/i.exec(m[1]);
    if (href) out.push({ attr: "href", url: href[1], text: m[2].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() });
  }
  const noAnchors = clean.replace(/<a\b[^>]*>/gi, "");
  for (const m of noAnchors.matchAll(/<(link|img|script|source|form|iframe|video)\b[^>]*?\b(href|src|action)\s*=\s*["']([^"']*)["']/gi)) {
    out.push({ attr: m[2].toLowerCase(), tag: m[1].toLowerCase(), url: m[3], text: "" });
  }
  return out;
}

/** Internal path for a URL, or null if it leaves the site. */
export function internalPath(url) {
  if (!url || /^(mailto:|tel:|javascript:|data:|#)/i.test(url)) return null;
  const abs = /^https?:\/\/(www\.)?wisewomenuseai\.com(\/[^"']*)?$/i.exec(url);
  if (abs) return abs[2] || "/";
  if (/^[a-z][a-z0-9+.-]*:/i.test(url) || url.startsWith("//")) return null;
  return url.startsWith("/") ? url : null; // relative links are reported separately
}
