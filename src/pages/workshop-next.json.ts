// /workshop-next.json: the next workshop's date, for the "Next one: [date]"
// line under workshop buttons. Built from workshop.config.json on every build.
// Only the date and time go out. Never add the Zoom link or anything else from
// that file here: this address is public.
import cfg from '../../workshop.config.json';

export function GET() {
  const body = { date: cfg.date, startTimeLocal: cfg.startTimeLocal, timeZone: 'Australia/Melbourne' };
  return new Response(JSON.stringify(body), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
