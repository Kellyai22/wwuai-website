// wisewomenuseai.com: static site, deployed on Vercel.
// The settings below exist to keep every visitor-facing address exactly as it
// was before the Astro rebuild (Nov 2026). Read CLAUDE.md before changing them.
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.wisewomenuseai.com',
  output: 'static',
  // src/pages/about.astro builds about.html (not about/index.html), which is
  // the file vercel.json already routes /about to. No trailing slashes.
  build: { format: 'file' },
  trailingSlash: 'never',
  // Keep the HTML exactly as written. Astro 7's default strips whitespace the
  // way React does, which can close up the gap between inline elements.
  compressHTML: false,
  devToolbar: { enabled: false },
});
