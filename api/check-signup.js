// Business Dependency Check (/check) → Kit.
// The page posts here once all eight questions are answered. In this order we:
//   1. create or update the subscriber (active, no confirmation email), saving
//      her result in the custom field dependency_result in the same call, and
//      make sure the field really saved, because the follow-up email reads it;
//   2. add the tag LM-CHECK;
//   3. add her to no sequence at all (see ADD_TO_SEQUENCE below).
// The page shows the result only when this returns {status: "success"}.
// Same Kit pattern as api/workshop-signup.js. Env var (already set in Vercel): KIT_API_KEY.

const KIT_BASE = 'https://api.kit.com/v4';
const RESULT_FIELD = 'dependency_result';   // Kit custom field id 1428748
const RESULTS = ['enquiries', 'onboarding', 'delivery', 'admin', 'knowledge'];
const CHECK_TAG_ID = 25749475;              // LM-CHECK
const CHECK_TAG_NAME = 'LM-CHECK';
// The follow-up sequence is switched off on purpose. It gets switched on
// separately, when Kelly says so: do not flip this as part of other work.
const CHECK_SEQUENCE_ID = 2968008;          // CHECK · Business Dependency Check follow-up
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
  return { ok: res.ok, status: res.status, data };
}

function must(r, what) {
  if (!r.ok) throw new Error(`Kit ${what} failed: ${r.status} ${JSON.stringify(r.data).slice(0, 300)}`);
  return r;
}

const savedResult = (r) => r.data && r.data.subscriber && r.data.subscriber.fields
  ? r.data.subscriber.fields[RESULT_FIELD] : undefined;

// Step 1. Returns the subscriber id once the result is known to be saved.
async function saveSubscriber(email, firstName, result) {
  const body = { email_address: email, state: 'active', fields: { [RESULT_FIELD]: result } };
  if (firstName) body.first_name = firstName;
  const created = must(await kit('POST', '/subscribers', body), 'subscriber');
  const id = created.data && created.data.subscriber && created.data.subscriber.id;
  if (!id) throw new Error('Kit subscriber reply had no id');
  if (savedResult(created) === result) return id;
  // Someone already on the list: set the field directly, then read it back.
  const update = { fields: { [RESULT_FIELD]: result } };
  if (firstName) update.first_name = firstName;
  const updated = must(await kit('PUT', `/subscribers/${id}`, update), 'subscriber update');
  if (savedResult(updated) === result) return id;
  const read = must(await kit('GET', `/subscribers/${id}`), 'subscriber read');
  if (savedResult(read) !== result) throw new Error(`${RESULT_FIELD} did not save`);
  return id;
}

// Step 2. Uses the known tag id; if Kit no longer has it, finds the tag by
// name, and creates it only if it does not exist.
async function addTag(email) {
  let r = await kit('POST', `/tags/${CHECK_TAG_ID}/subscribers`, { email_address: email });
  if (r.ok) return;
  if (r.status !== 404) must(r, 'tag');
  let tagId = null, after = null;
  do {
    const page = must(await kit('GET', `/tags?per_page=500${after ? `&after=${encodeURIComponent(after)}` : ''}`), 'tag list');
    const hit = (page.data.tags || []).find((t) => t.name === CHECK_TAG_NAME);
    if (hit) tagId = hit.id;
    const p = page.data.pagination || {};
    after = !tagId && p.has_next_page ? p.end_cursor : null;
  } while (after);
  if (!tagId) {
    const made = must(await kit('POST', '/tags', { name: CHECK_TAG_NAME }), 'tag create');
    tagId = made.data.tag.id;
  }
  must(await kit('POST', `/tags/${tagId}/subscribers`, { email_address: email }), 'tag');
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
  const firstName = String(fields.first_name || '').trim().slice(0, 60);
  const result = String(fields.result || '').trim();
  if (!EMAIL_RE.test(email)) {
    res.status(400).json({ status: 'error', error: 'invalid email' });
    return;
  }
  if (!RESULTS.includes(result)) {
    res.status(400).json({ status: 'error', error: 'invalid result' });
    return;
  }
  try {
    await saveSubscriber(email, firstName, result);
    await addTag(email);
    if (ADD_TO_SEQUENCE) {
      must(await kit('POST', `/sequences/${CHECK_SEQUENCE_ID}/subscribers`, { email_address: email }), 'sequence');
    }
    res.status(200).json({ status: 'success' });
  } catch (err) {
    console.error('check-signup', err.message);
    res.status(502).json({ status: 'error', error: 'signup not confirmed' });
  }
};
