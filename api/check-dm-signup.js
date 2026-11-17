// Business Dependency Check, DM route → Kit.
// The Blotato CHECK DM automations (Instagram + Facebook) post here once the
// email gate has the contact's email. Blotato sends JSON {email, isFollower}.
// We upsert the subscriber (active, no confirmation email) and tag them LM-CHECK,
// the same tag the /check page adds through api/check-signup.js.
// No sequence: the Check follow-up stays off until Kelly says so, matching
// ADD_TO_SEQUENCE = false in api/check-signup.js. Do not add one here as part of other work.
// The /check page itself uses api/check-signup.js (it needs a result); leave that route alone.
// Same Kit pattern as api/reel-signup.js. Env var (already set in Vercel): KIT_API_KEY.

const KIT_BASE = 'https://api.kit.com/v4';
const CHECK_TAG_ID = 25749475;       // LM-CHECK
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

// Blotato sends JSON; urlencoded or multipart also work, for manual tests.
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
    res.status(400).json({ status: 'error', error: 'could not read form' });
    return;
  }
  // Honeypot: real people never fill this hidden field. Pretend success so bots move on.
  if (fields.website) {
    res.status(200).json({ status: 'success' });
    return;
  }
  const email = String(fields.email_address || fields.email || '').trim().toLowerCase();
  const firstName = String(fields['fields[first_name]'] || fields.first_name || '').trim().slice(0, 60);
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ status: 'error', error: 'invalid email' });
    return;
  }
  try {
    const subscriber = { email_address: email, state: 'active' };
    if (firstName) subscriber.first_name = firstName;
    await kit('/subscribers', subscriber);
    await kit(`/tags/${CHECK_TAG_ID}/subscribers`, { email_address: email });
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('check-dm-signup', err.message);
    res.status(502).json({ status: 'error', error: 'signup not confirmed' });
  }
};
