// Free workshop registration → Kit.
// /workshop posts here (via /assets/js/signup.js). We upsert the subscriber
// (active, no confirmation email) and tag them with this month's workshop tag.
// The tag is found by NAME and created if Kit does not have it yet, so there is
// no tag id to get wrong. Same Kit pattern as api/reel-signup.js.
// Env var (already set in Vercel): KIT_API_KEY.
// Each month: change WORKSHOP_TAG_NAME below.

const KIT_BASE = 'https://api.kit.com/v4';
const WORKSHOP_TAG_NAME = 'workshop-2026-12';   // Wednesday 9 December 2026
// No sequence is attached yet (Kelly, 13 Nov 2026). When the December
// "Workshop information" sequence exists, put its id here and set
// ADD_TO_SEQUENCE to true. Never reuse an earlier month's tag or sequence.
const WORKSHOP_SEQUENCE_ID = null;
const ADD_TO_SEQUENCE = false;
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

async function kit(method, path, body) {
  const res = await fetch(`${KIT_BASE}${path}`, {
    method,
    headers: { 'X-Kit-Api-Key': process.env.KIT_API_KEY, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (err) { /* empty body */ }
  if (!res.ok && res.status !== 409) {
    throw new Error(`Kit ${method} ${path.split('?')[0]} failed: ${res.status} ${JSON.stringify(data).slice(0, 300)}`);
  }
  return data || {};
}

// Find this month's tag by name; create it only if it does not exist.
// Remembered while the function stays warm, so most sign-ups skip the lookup.
let tagId = null;
async function workshopTagId() {
  if (tagId) return tagId;
  let after = null;
  do {
    const page = await kit('GET', `/tags?per_page=500${after ? `&after=${encodeURIComponent(after)}` : ''}`);
    const hit = (page.tags || []).find((t) => t.name === WORKSHOP_TAG_NAME);
    if (hit) { tagId = hit.id; return tagId; }
    const p = page.pagination || {};
    after = p.has_next_page ? p.end_cursor : null;
  } while (after);
  const made = await kit('POST', '/tags', { name: WORKSHOP_TAG_NAME });
  if (!made.tag || !made.tag.id) throw new Error('Kit did not return the new tag');
  tagId = made.tag.id;
  return tagId;
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
    await kit('POST', '/subscribers', subscriber);
    await kit('POST', `/tags/${await workshopTagId()}/subscribers`, { email_address: email });
    if (ADD_TO_SEQUENCE && WORKSHOP_SEQUENCE_ID) {
      await kit('POST', `/sequences/${WORKSHOP_SEQUENCE_ID}/subscribers`, { email_address: email });
    }
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('workshop-signup', err.message);
    res.status(502).json({ status: 'error', error: 'signup not confirmed' });
  }
};
