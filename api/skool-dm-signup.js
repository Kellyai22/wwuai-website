// Skool membership interest, DM route → Kit.
// Blotato sends JSON {email, isFollower} when someone triggers the Architect Advantage
// keyword DM automation. We upsert the subscriber (active, no confirmation email) and
// tag them architect-advantage-interest (tag id 26073311).
// No sequence, no lead magnet email. Just the tag so Kelly can follow up.
// Same Kit pattern as api/check-dm-signup.js. Env var (already set in Vercel): KIT_API_KEY.

const KIT_BASE = 'https://api.kit.com/v4';
const ARCHITECT_TAG_ID = 26073311;    // architect-advantage-interest
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function readFields(req) {
  const raw = await readRawBody(req);
  const type = req.headers['content-type'] || '';
  if (type.includes('application/json')) return JSON.parse(raw.toString('utf8') || '{}');
  const form = await new Response(raw, { headers: { 'content-type': type } }).formData();
  return Object.fromEntries(form.entries());
}

async function kit(path, body) {
  const res = await fetch(`${KIT_BASE}${path}`, {
    method: 'POST',
    headers: { 'X-Kit-Api-Key': process.env.KIT_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok && res.status !== 409) {
    const text = await res.text();
    throw new Error(`Kit ${path} failed: ${res.status} ${text}`);
  }
  return res;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ status: 'error', error: 'method not allowed' });
    return;
  }
  let fields;
  try {
    fields = await readFields(req);
  } catch (err) {
    res.status(400).json({ status: 'error', error: 'could not read body' });
    return;
  }
  const email = String(fields.email_address || fields.email || '').trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    // No valid email — return 200 so Blotato doesn't retry; nothing to record.
    res.status(200).json({ status: 'ok', note: 'no valid email' });
    return;
  }
  try {
    await kit('/subscribers', { email_address: email, state: 'active' });
    await kit(`/tags/${ARCHITECT_TAG_ID}/subscribers`, { email_address: email });
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('skool-dm-signup', err.message);
    res.status(502).json({ status: 'error', error: 'signup not confirmed' });
  }
};
