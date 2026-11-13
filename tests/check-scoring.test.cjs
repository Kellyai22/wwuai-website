// Business Dependency Check: Pen's scoring rules, and the promises the
// sign-up function makes about Kit.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const lib = () => import('../src/lib/check-scoring.mjs');

// Answer positions: Q1 to Q5 are first/second/third (0, 1, 2).
// Q6 to Q8 are listed enquiries, onboarding, delivery, admin, knowledge (0 to 4).
const ENQ = 0, ONB = 1, DEL = 2, ADM = 3, KNO = 4;

test('case A: enquiries 5, knowledge 3, onboarding 1, delivery 1, admin 0', async () => {
  const { score } = await lib();
  const r = score([2, 1, 1, 0, 2, KNO, ENQ, ENQ]);
  assert.deepEqual(r.totals, { enquiries: 5, onboarding: 1, delivery: 1, admin: 0, knowledge: 3 });
  assert.equal(r.result, 'enquiries');
});
test('case B: Q8 cannot settle the tie, Q6 does', async () => {
  const { score } = await lib();
  const r = score([2, 0, 0, 0, 2, ENQ, KNO, DEL]);
  assert.deepEqual(r.totals, { enquiries: 3, onboarding: 0, delivery: 2, admin: 0, knowledge: 3 });
  assert.equal(r.result, 'enquiries');
});
test('a tie that Q8 settles', async () => {
  const { score } = await lib();
  // enquiries 2+1 = 3, knowledge 1+2 = 3; Q8 is knowledge.
  const r = score([2, 0, 0, 0, 1, ENQ, DEL, KNO]);
  assert.equal(r.totals.enquiries, 3); assert.equal(r.totals.knowledge, 3);
  assert.equal(r.result, 'knowledge');
});
test('every combination gives exactly one result, and Q8 or Q6 always settles a tie', async () => {
  const { score, QUESTIONS, TIE_ORDER } = await lib();
  // All 151,875 ways to answer. The fixed order (enquiries, onboarding, admin,
  // delivery, knowledge) is the written last resort; the points make it
  // unreachable, because an area outside Q6 and Q8 can score 3 at most and only
  // one area can take Q7. If the questions or points change, this test says so.
  assert.deepEqual(TIE_ORDER, ['enquiries', 'onboarding', 'admin', 'delivery', 'knowledge']);
  let combos = 0, ties = 0, unsettled = 0;
  const sizes = QUESTIONS.map((q) => q.answers.length);
  const picks = sizes.map(() => 0);
  for (;;) {
    combos++;
    const { result, totals } = score(picks);
    const top = Math.max(...Object.values(totals));
    const tied = Object.keys(totals).filter((k) => totals[k] === top);
    assert.ok(tied.includes(result), 'the result is always one of the top areas');
    assert.ok(top <= 6);
    const q8 = QUESTIONS[7].answers[picks[7]].area, q6 = QUESTIONS[5].answers[picks[5]].area;
    if (tied.length > 1) {
      ties++;
      if (tied.includes(q8)) assert.equal(result, q8);
      else if (tied.includes(q6)) assert.equal(result, q6);
      else { unsettled++; assert.equal(result, TIE_ORDER.find((k) => tied.includes(k))); }
    }
    let i = 0;
    while (i < picks.length && ++picks[i] === sizes[i]) picks[i++] = 0;
    if (i === picks.length) break;
  }
  assert.equal(combos, 3 ** 5 * 5 ** 3);
  assert.ok(ties > 0);
  assert.equal(unsettled, 0);
});
test('no area can pass 6, and every question must be answered', async () => {
  const { score } = await lib();
  assert.equal(score([2, 0, 0, 0, 0, ENQ, ENQ, ENQ]).totals.enquiries, 6);
  assert.throws(() => score([2, 1, 1, 0, 2, KNO, ENQ]));
  assert.throws(() => score([2, 1, 1, 0, 2, KNO, ENQ, undefined]));
  assert.throws(() => score([3, 1, 1, 0, 2, KNO, ENQ, ENQ]));
  assert.throws(() => score(null));
});
test('the questions are the eight agreed, in order, with the agreed number of answers', async () => {
  const { QUESTIONS } = await lib();
  assert.deepEqual(QUESTIONS.map((q) => q.answers.length), [3, 3, 3, 3, 3, 5, 5, 5]);
  assert.deepEqual(QUESTIONS.slice(0, 5).map((q) => q.answers.map((x) => x.points)), Array(5).fill([0, 1, 2]));
  for (const q of QUESTIONS.slice(5)) assert.deepEqual(q.answers.map((x) => x.area), ['enquiries', 'onboarding', 'delivery', 'admin', 'knowledge']);
  assert.ok(QUESTIONS[7].answers.every((x) => x.points === 2));
});

// The sign-up function: what it must and must not do in Kit.
const fn = () => fs.readFileSync(path.join(__dirname, '..', 'api', 'check-signup.js'), 'utf8');
const present = fs.existsSync(path.join(__dirname, '..', 'api', 'check-signup.js'));
const opts = { skip: present ? false : 'api/check-signup.js not written yet' };
test('check-signup never touches the old /hours form or the old warm-path sequence', opts, () => {
  const src = fn();
  assert.doesNotMatch(src, /9658821/);
  assert.doesNotMatch(src, /2839625/);
  assert.doesNotMatch(src, /biggest_time_drain|hours_a_week/);
});
test('check-signup keeps the follow-up sequence switched off', opts, () => {
  const src = fn();
  assert.match(src, /CHECK_SEQUENCE_ID\s*=\s*2968008/);
  assert.match(src, /ADD_TO_SEQUENCE\s*=\s*false/);
  assert.match(src, /25749475/);
  assert.match(src, /dependency_result/);
});
