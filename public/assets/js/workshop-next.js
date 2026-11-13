/* "Next one: [date]" under workshop buttons.
   Reads /workshop-next.json (built from workshop.config.json) and fills every
   [data-next-workshop] element, but only while that workshop is still ahead.
   A past date, a missing file or any error leaves the line hidden. */
(function () {
  'use strict';
  var slots = document.querySelectorAll('[data-next-workshop]');
  if (!slots.length || !window.fetch) return;
  fetch('/workshop-next.json', { headers: { Accept: 'application/json' } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (w) {
      if (!w || !/^\d{4}-\d{2}-\d{2}$/.test(w.date || '')) return;
      var start = w.date + ' ' + (/^\d{2}:\d{2}$/.test(w.startTimeLocal || '') ? w.startTimeLocal : '23:59');
      // "Now" in Melbourne, written the same way, so the two compare as text.
      var now = new Date().toLocaleString('sv-SE', { timeZone: w.timeZone || 'Australia/Melbourne', hour12: false }).slice(0, 16);
      if (now >= start) return;
      var p = w.date.split('-');
      var day = new Date(Date.UTC(+p[0], +p[1] - 1, +p[2]));
      var long = day.toLocaleDateString('en-AU', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' }).replace(',', '');
      var short = day.toLocaleDateString('en-AU', { timeZone: 'UTC', day: 'numeric', month: 'short' });
      // data-prefix replaces "Next one: "; data-format="short" gives "9 Dec".
      slots.forEach(function (el) {
        var prefix = el.hasAttribute('data-prefix') ? el.getAttribute('data-prefix') : 'Next one: ';
        el.textContent = prefix + (el.getAttribute('data-format') === 'short' ? short : long);
        el.hidden = false;
      });
    })
    .catch(function () {});
})();
