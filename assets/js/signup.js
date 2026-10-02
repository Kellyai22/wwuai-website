/* Shared Kit signup handling. Access changes only after a verified success. */
(function (root) {
  'use strict';
  function accepted(response, data) {
    return !!(response.ok && data && data.status === 'success' && !(data.consent && data.consent.enabled));
  }
  async function subscribe(form, fetcher) {
    var controller = new AbortController();
    var timer = setTimeout(function () { controller.abort(); }, 20000);
    try {
      var response = await fetcher(form.action, {
        method: 'POST', body: new FormData(form),
        headers: { Accept: 'application/json' }, signal: controller.signal
      });
      var data = await response.json();
      if (!accepted(response, data)) throw new Error('signup_not_confirmed');
      return data;
    } finally { clearTimeout(timer); }
  }
  function bind(form, onSuccess) {
    if (form.dataset.signupBound) return;
    form.dataset.signupBound = 'true';
    var error = form.querySelector('[data-signup-error]');
    if (!error) {
      error = document.createElement('p'); error.dataset.signupError = '';
      error.setAttribute('role', 'alert'); error.hidden = true;
      form.appendChild(error);
    }
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      if (!form.reportValidity() || form.dataset.submitting === 'true') return;
      var button = form.querySelector('button[type="submit"]');
      var label = button ? button.textContent : '';
      form.dataset.submitting = 'true'; form.setAttribute('aria-busy', 'true');
      error.hidden = true;
      if (button) { button.disabled = true; button.textContent = 'Sending…'; }
      try {
        await subscribe(form, root.fetch.bind(root));
        if (onSuccess) onSuccess(form);
        else if (form.dataset.successUrl) root.location.assign(form.dataset.successUrl);
      } catch (err) {
        error.textContent = 'Your signup has not been confirmed. Please try again. If it still does not work, email hello@wisewomenuseai.com and tell me which resource you wanted.';
        error.hidden = false;
      } finally {
        delete form.dataset.submitting; form.removeAttribute('aria-busy');
        if (button) { button.disabled = false; button.textContent = label; }
      }
    });
  }
  root.WWUAIForms = { bind: bind, accepted: accepted, subscribe: subscribe };
  if (typeof document !== 'undefined') {
    document.querySelectorAll('form[data-wwuai-signup]').forEach(function (form) { bind(form); });
  }
  if (typeof module !== 'undefined') module.exports = { accepted: accepted, subscribe: subscribe };
})(typeof window !== 'undefined' ? window : globalThis);
