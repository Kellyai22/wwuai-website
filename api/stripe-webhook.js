// Stripe → Kit buyer automation.
// On checkout.session.completed: upsert the buyer in Kit, tag them, add them to
// the product's onboarding sequence. Add future products to PRODUCT_MAP only.
// Env vars (Vercel project settings): STRIPE_WEBHOOK_SECRET, KIT_API_KEY.

const crypto = require('crypto');

// payment_link id → Kit destinations. Key "default" catches sessions with no
// payment link (e.g. manual invoices) so a buyer is never silently dropped.
const PRODUCT_MAP = {
  plink_1TocnXPUfAlFO1z994LksTzd: {
    product: 'notion-advantage',
    tagId: 20815815,
    sequenceId: 2813464,
  },
  // Member price ($79), offered only inside the membership classroom
  plink_1ToieUPUfAlFO1z9kxOxMsQ0: {
    product: 'notion-advantage-member',
    tagId: 20815815,
    sequenceId: 2813464,
  },
  // August: the Content Advantage Pack. $129 public.
  plink_1U0xQbPUfAlFO1z9fXQeifON: {
    product: 'content-advantage',
    tagId: 22012636,
    sequenceId: 2850379,
  },
  // Member price ($99), offered only inside the membership classroom
  plink_1U0xQcPUfAlFO1z9wDBPnOtR: {
    product: 'content-advantage-member',
    tagId: 22012636,
    sequenceId: 2850379,
  },
  // Safety net for sessions with no payment link (manual invoices, say) so a
  // buyer is never silently dropped. NOTE: it tags them as a Notion Advantage
  // buyer, which was harmless with one product and is now misleading with two.
  // It still beats losing the record. If a third product lands, give this its
  // own neutral tag rather than letting it keep guessing.
  default: {
    product: 'unmapped',
    tagId: 20815815,
    sequenceId: null,
  },
};

const KIT_BASE = 'https://api.kit.com/v4';
const SIGNATURE_TOLERANCE_SECONDS = 300;

module.exports.config = { api: { bodyParser: false } };

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyStripeSignature(rawBody, header, secret) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(',').map((p) => {
      const i = p.indexOf('=');
      return [p.slice(0, i), p.slice(i + 1)];
    })
  );
  const timestamp = Number(parts.t);
  if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > SIGNATURE_TOLERANCE_SECONDS) {
    return false;
  }
  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${parts.t}.${rawBody}`)
    .digest('hex');
  const given = parts.v1 || '';
  if (given.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(given));
}

async function kit(path, body) {
  const res = await fetch(`${KIT_BASE}${path}`, {
    method: 'POST',
    headers: {
      'X-Kit-Api-Key': process.env.KIT_API_KEY,
      'Content-Type': 'application/json',
    },
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
    res.status(405).json({ error: 'method not allowed' });
    return;
  }

  const rawBody = await readRawBody(req);
  const ok = verifyStripeSignature(
    rawBody,
    req.headers['stripe-signature'],
    process.env.STRIPE_WEBHOOK_SECRET
  );
  if (!ok) {
    res.status(400).json({ error: 'invalid signature' });
    return;
  }

  const event = JSON.parse(rawBody.toString('utf8'));
  if (event.type !== 'checkout.session.completed') {
    res.status(200).json({ received: true, ignored: event.type });
    return;
  }

  const session = event.data.object;
  const email = session.customer_details && session.customer_details.email;
  const fullName = (session.customer_details && session.customer_details.name) || '';
  const firstName = fullName.split(' ')[0] || '';
  const mapping = PRODUCT_MAP[session.payment_link] || PRODUCT_MAP.default;

  if (!email) {
    // Nothing to act on, but acknowledge so Stripe stops retrying.
    res.status(200).json({ received: true, warning: 'no email on session' });
    return;
  }

  try {
    await kit('/subscribers', {
      email_address: email,
      first_name: firstName,
      state: 'active',
    });
    await kit(`/tags/${mapping.tagId}/subscribers`, { email_address: email });
    if (mapping.sequenceId) {
      await kit(`/sequences/${mapping.sequenceId}/subscribers`, { email_address: email });
    }
    res.status(200).json({ received: true, product: mapping.product });
  } catch (err) {
    // 500 makes Stripe retry (up to ~3 days), so a Kit blip never loses a buyer.
    res.status(500).json({ error: err.message });
  }
};
