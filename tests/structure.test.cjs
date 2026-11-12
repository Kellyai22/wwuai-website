// The promises the Astro rebuild made: same addresses, same redirects, the three
// functions still in place. Needs a build (dist/); skipped when there isn't one.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.join(__dirname, '..');
const hasDist = fs.existsSync(path.join(root, 'dist', 'index.html'));
const opts = { skip: hasDist ? false : 'no dist/ (run npm run build)' };
const lib = () => import('../scripts/lib-site.mjs');

test('the eight core pages build to the same file names', opts, () => {
  for (const f of ['index', 'about', 'architect', 'starter', 'thank-you', 'privacy', 'ai-disclosure', '404'])
    assert.ok(fs.existsSync(path.join(root, 'dist', f + '.html')), f + '.html');
});
test('no page was built as a folder (that would add a trailing slash)', opts, () => {
  for (const f of ['about', 'architect', 'starter', 'thank-you', 'privacy', 'ai-disclosure'])
    assert.ok(!fs.existsSync(path.join(root, 'dist', f, 'index.html')), f + '/index.html must not exist');
});
test('clean addresses resolve the way they did before', opts, async () => {
  const { resolveUrl } = await lib();
  for (const u of ['/', '/about', '/architect', '/starter', '/thank-you', '/privacy', '/ai-disclosure', '/workshop', '/links', '/blog', '/vault', '/calm', '/tools/first-wins', '/hub/welcome', '/posts/7-roles-just-me', '/assets/system/wwuai.css', '/robots.txt', '/llms.txt', '/sitemap.xml', '/workshop.ics', '/downloads/wwuai-reel-kit.zip'])
    assert.equal(resolveUrl(u).ok, true, u);
});
test('old redirects are still redirects', opts, async () => {
  const { resolveUrl } = await lib();
  const expect = { '/masterclass': '/workshop', '/hub': '/', '/fable': '/', '/content-system': '/', '/switch-to-claude': '/switch', '/vault-starter': '/starter?unlocked=1', '/masterclass.ics': '/workshop.ics' };
  for (const [from, to] of Object.entries(expect)) {
    const r = resolveUrl(from);
    assert.equal(r.kind, 'redirect', from); assert.equal(r.detail, to, from);
  }
});
test('a made-up address is reported as missing (the link check can fail)', opts, async () => {
  const { resolveUrl } = await lib();
  assert.equal(resolveUrl('/this-page-does-not-exist').ok, false);
  assert.equal(resolveUrl('/assets/system/nope.css').ok, false);
});
test('the three functions are still at /api with the same names', () => {
  for (const f of ['workshop-signup', 'reel-signup', 'stripe-webhook']) {
    const src = fs.readFileSync(path.join(root, 'api', f + '.js'), 'utf8');
    assert.match(src, /module\.exports\s*=/, f);
  }
});
test('the 404 catch-all and filesystem rule are still last in vercel.json', () => {
  const { routes } = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
  assert.deepEqual(routes[routes.length - 2], { handle: 'filesystem' });
  assert.equal(routes[routes.length - 1].dest, '/404.html');
  assert.equal(routes[routes.length - 1].status, 404);
});
test('no analytics or tracking scripts in any Astro page', opts, () => {
  for (const f of fs.readdirSync(path.join(root, 'dist')).filter((f) => f.endsWith('.html'))) {
    if (!fs.existsSync(path.join(root, 'src', 'pages', f.replace(/\.html$/, '.astro')))) continue;
    const html = fs.readFileSync(path.join(root, 'dist', f), 'utf8');
    assert.doesNotMatch(html, /googletagmanager|google-analytics|gtag\(|fbq\(|connect\.facebook\.net|plausible|hotjar|clarity\.ms|segment\.com|va\.vercel-scripts/i, f);
  }
});
