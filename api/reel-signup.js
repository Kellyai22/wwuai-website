// REEL lead magnet signup → Kit.
// The /reel page posts here (via /assets/js/signup.js). We upsert the subscriber,
// tag them LM-REEL and add them to the "REEL · Free Reel Starter" sequence, which
// delivers the download and the nurture. Same Kit pattern as api/stripe-webhook.js,
// so no Kit form or Kit automation rule is needed.
// Env var (already set in Vercel for the Stripe webhook): KIT_API_KEY.

const KIT_BASE = 'https://api.kit.com/v4';
const REEL_TAG_ID = 24844536;        // LM-REEL
const REEL_SEQUENCE_ID = 2937832;    // REEL · Free Reel Starter
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

// signup.js sends multipart FormData; the page could also send urlencoded or JSON.
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
  const email = String(fields.email_address || '').trim().toLowerCase();
  const firstName = String(fields['fields[first_name]'] || fields.first_name || '').trim().slice(0, 60);
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ status: 'error', error: 'invalid email' });
    return;
  }
  try {
    const subscriber = { email_address: email, state: 'active' };
    if (firstName) subscriber.first_name = firstName;
    await kit('/subscribers', subscriber);
    await kit(`/tags/${REEL_TAG_ID}/subscribers`, { email_address: email });
    await kit(`/sequences/${REEL_SEQUENCE_ID}/subscribers`, { email_address: email });
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('reel-signup', err.message);
    res.status(502).json({ status: 'error', error: 'signup not confirmed' });
  }
};
