// Business Dependency Check: the eight questions and the scoring rules.
// Pen's rules (Nov 2026). The page (src/pages/check.astro) renders the
// questions from here and scores with score(); tests/check-scoring.test.cjs
// proves the rules. Points are never shown to the visitor.

// Tie-break order when neither Q8 nor Q6 settles it.
export const TIE_ORDER = ['enquiries', 'onboarding', 'admin', 'delivery', 'knowledge'];
export const AREAS = ['enquiries', 'onboarding', 'delivery', 'admin', 'knowledge'];

const a = (text, area, points) => ({ text, area, points });

export const QUESTIONS = [
  { q: 'When a new enquiry arrives in a busy week, what happens to it?', answers: [
    a('It gets a reply the same day, whether or not I’m free.', 'enquiries', 0),
    a('It waits until I have a clear moment.', 'enquiries', 1),
    a('It can sit for days, and some never get a reply.', 'enquiries', 2),
  ] },
  { q: 'When someone says yes, how do they get started with you?', answers: [
    a('The same steps happen every time, without me having to think about it.', 'onboarding', 0),
    a('I have a rough routine, but I rebuild parts of it each time.', 'onboarding', 1),
    a('I work it out from memory for each new client.', 'onboarding', 2),
  ] },
  { q: 'How much of the work clients pay you for starts from a blank page?', answers: [
    a('Very little. The repeatable parts have a template or checklist.', 'delivery', 0),
    a('Some of it. I reuse old work when I can find it.', 'delivery', 1),
    a('Most of it. I begin again each time.', 'delivery', 2),
  ] },
  { q: 'How do your invoices and payment reminders go out?', answers: [
    a('On a set day, or without me having to remember.', 'admin', 0),
    a('When I get to them, which is usually later than I’d like.', 'admin', 1),
    a('When I notice the money hasn’t come in.', 'admin', 2),
  ] },
  { q: 'If someone had to cover for you tomorrow, where would they find how things are done?', answers: [
    a('Written down in one place they could follow.', 'knowledge', 0),
    a('Scattered across my inbox, notes and files.', 'knowledge', 1),
    a('In my head.', 'knowledge', 2),
  ] },
  { q: 'You take three working days off. What is waiting when you get back?', answers: [
    a('Enquiries nobody answered.', 'enquiries', 1),
    a('New clients waiting to get started.', 'onboarding', 1),
    a('Client work that didn’t move.', 'delivery', 1),
    a('Invoices and admin that piled up.', 'admin', 1),
    a('Questions only I can answer.', 'knowledge', 1),
  ] },
  { q: 'Which of these do you write from scratch most often?', answers: [
    a('Replies to enquiries and follow-up messages.', 'enquiries', 1),
    a('Welcome emails and first steps for a new client.', 'onboarding', 1),
    a('Proposals, reports or the client work itself.', 'delivery', 1),
    a('Invoices, payment reminders and other admin.', 'admin', 1),
    a('Explanations of how I do things, for clients, helpers or ai.', 'knowledge', 1),
  ] },
  { q: 'If one of these could stop depending on you, which would you choose?', answers: [
    a('Answering and following up enquiries.', 'enquiries', 2),
    a('Getting new clients started.', 'onboarding', 2),
    a('Delivering the client work.', 'delivery', 2),
    a('Invoicing and admin.', 'admin', 2),
    a('Being the only one who knows how it all works.', 'knowledge', 2),
  ] },
];

/**
 * Score a finished Check.
 * @param {number[]} picks  the index of the answer tapped for each of the eight questions
 * @returns {{ result: string, totals: Record<string, number> }}
 * Throws if any question is unanswered or an index is out of range, so there
 * is always exactly one result or none at all.
 */
export function score(picks) {
  if (!Array.isArray(picks) || picks.length !== QUESTIONS.length) throw new Error('all eight questions must be answered');
  const totals = Object.fromEntries(AREAS.map((k) => [k, 0]));
  const chosen = picks.map((p, i) => {
    const ans = Number.isInteger(p) ? QUESTIONS[i].answers[p] : undefined;
    if (!ans) throw new Error(`question ${i + 1} has no valid answer`);
    totals[ans.area] += ans.points;
    return ans;
  });
  const top = Math.max(...Object.values(totals));
  const tied = AREAS.filter((k) => totals[k] === top);
  let result;
  if (tied.length === 1) result = tied[0];
  else if (tied.includes(chosen[7].area)) result = chosen[7].area;      // Q8
  else if (tied.includes(chosen[5].area)) result = chosen[5].area;      // Q6
  else result = TIE_ORDER.find((k) => tied.includes(k));
  return { result, totals };
}
