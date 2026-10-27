/* WWUAI page system: motion and small behaviours. One script for every page.
   Loads after (deferred) GSAP 3.13.0, ScrollTrigger 3.13.0, SplitText 3.13.0 and Lenis 1.1.13.
   Content is visible without this file. Motion only runs when <html> has class "m",
   which the head snippet adds unless the visitor prefers reduced motion. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Footer year range (site footer standard)
  var y = new Date().getFullYear();
  d.querySelectorAll('.yr').forEach(function (el) { if (y > 2026) el.textContent = '2026–' + y; });

  // Keep punctuation on the same line as the script word ("same." never splits)
  d.querySelectorAll('.em').forEach(function (em) {
    var n = em.nextSibling; if (!n || n.nodeType !== 3) return;
    var m = n.textContent.match(/^[.,!?;:’']+/); if (!m) return;
    var w = d.createElement('span'); w.style.whiteSpace = 'nowrap';
    em.parentNode.insertBefore(w, em); w.appendChild(em); w.appendChild(d.createTextNode(m[0]));
    n.textContent = n.textContent.slice(m[0].length);
  });

  // News banner: top of the page, and again pinned to the top once you've scrolled a long way.
  var newsSlot = d.querySelector('[data-news]');
  if (newsSlot && window.fetch) {
    fetch('/assets/system/news.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (data) {
      var now = new Date();
      var items = (data.items || []).filter(function (it) { return !it.until || new Date(it.until) > now; });
      if (!items.length) return;
      var esc = function (t) { var e = d.createElement('span'); e.textContent = t || ''; return e.innerHTML; };
      var one = items.map(function (it) {
        return '<a class="news__item" href="' + esc(it.link || '#') + '">' + esc(it.text) + (it.cta ? ' <b>' + esc(it.cta) + ' →</b>' : '') + '</a>';
      }).join('');
      // Repeat until one copy is wider than the screen, then double it for a seamless loop
      var chars = items.reduce(function (n, it) { return n + (it.text || '').length + (it.cta || '').length + 12; }, 0);
      var reps = Math.max(1, Math.ceil(2600 / Math.max(300, chars * 7.5)));
      var half = new Array(reps + 1).join(one);
      var html = '<div class="news__track">' + half + half + '</div>';
      newsSlot.innerHTML = html; newsSlot.hidden = false;
      newsSlot.setAttribute('aria-label', 'News');
      var float = newsSlot.cloneNode(true);
      float.removeAttribute('data-news'); float.classList.add('news--float'); float.setAttribute('aria-hidden', 'true');
      float.querySelectorAll('a').forEach(function (a) { a.tabIndex = -1; });
      d.body.appendChild(float);
      var ticking = false;
      window.addEventListener('scroll', function () {
        if (ticking) return; ticking = true;
        requestAnimationFrame(function () { float.classList.toggle('is-shown', window.scrollY > window.innerHeight * 1.6); ticking = false; });
      }, { passive: true });
    }).catch(function () {});
  }

  // Demo forms on /style never submit anywhere
  d.querySelectorAll('form[data-demo]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!f.reportValidity()) return;
      var box = f.closest('[data-form]'); if (box) box.classList.add('is-done');
    });
  });

  // "Save my seat" links put the cursor in the first field
  d.querySelectorAll('a[href^="#"][data-focus]').forEach(function (a) {
    a.addEventListener('click', function () {
      var t = d.getElementById(a.getAttribute('data-focus'));
      if (t) setTimeout(function () { t.focus({ preventScroll: true }); }, 900);
    });
  });

  // Card glide: buttons, drag on desktop, progress line. Works with or without motion.
  d.querySelectorAll('.glide').forEach(function (g) {
    var track = g.querySelector('.glide__track'); if (!track) return;
    var prev = g.querySelector('[data-glide="prev"]'), next = g.querySelector('[data-glide="next"]');
    var bar = g.querySelector('.glide__progress i');
    function step() { var c = track.querySelector('.glide__card'); return c ? c.getBoundingClientRect().width + 24 : 320; }
    function update() {
      var max = track.scrollWidth - track.clientWidth;
      var p = max > 0 ? track.scrollLeft / max : 1;
      var view = Math.min(1, track.clientWidth / track.scrollWidth);
      if (bar) bar.style.transform = 'scaleX(' + Math.max(view, view + (1 - view) * p).toFixed(3) + ')';
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
    }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduce ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduce ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    if (fine) {
      var down = false, startX = 0, startL = 0, moved = 0;
      track.addEventListener('pointerdown', function (e) { if (e.pointerType !== 'mouse') return; down = true; moved = 0; startX = e.clientX; startL = track.scrollLeft; });
      window.addEventListener('pointermove', function (e) {
        if (!down) return; var dx = e.clientX - startX; moved = Math.abs(dx);
        if (moved > 6) { track.classList.add('is-dragging'); track.scrollLeft = startL - dx; }
      });
      window.addEventListener('pointerup', function () {
        if (!down) return; down = false;
        if (track.classList.contains('is-dragging')) {
          track.classList.remove('is-dragging');
          var w = step(); track.scrollTo({ left: Math.round(track.scrollLeft / w) * w, behavior: 'smooth' });
        }
      });
    }
  });

  // Embossed "ai": light comes from an angle that turns as you scroll
  function setEmboss(el, progress) {
    var size = parseFloat(getComputedStyle(el).fontSize) || 200;
    var dist = Math.max(2, size * 0.014);
    var a = (200 + 140 * progress) * Math.PI / 180;
    el.style.setProperty('--ex', (Math.cos(a) * -dist).toFixed(2) + 'px');
    el.style.setProperty('--ey', (Math.sin(a) * -dist).toFixed(2) + 'px');
  }
  var marks = d.querySelectorAll('.emboss__mark');
  marks.forEach(function (el) { setEmboss(el, 0.35); });

  if (reduce || !window.gsap || !window.ScrollTrigger) { html.classList.remove('m'); return; }
  html.classList.add('m');
  var gsap = window.gsap, ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);
  if (window.SplitText) gsap.registerPlugin(window.SplitText);

  // Smooth scroll on desktop only. Phones keep native scrolling.
  if (fine && window.Lenis) {
    var lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    d.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href'); if (id.length < 2) return;
        var t = d.querySelector(id); if (!t) return;
        e.preventDefault(); lenis.scrollTo(t, { offset: -24, duration: 1.4 });
      });
    });
  }

  // Hero headline, line by line
  d.querySelectorAll('[data-lines]').forEach(function (h) {
    var tl = gsap.timeline({ delay: 0.15 });
    tl.to(h.querySelectorAll('.line > span'), { opacity: 1, y: 0, yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.11 });
    var sec = h.closest('section');
    var after = sec ? sec.querySelectorAll('[data-after]') : [];
    if (after.length) tl.to(after, { opacity: 1, duration: 0.9, ease: 'power2.out', stagger: 0.08 }, '-=0.8');
  });

  // Every other heading arrives line by line as it scrolls in
  function splitHeadings() {
    d.querySelectorAll('.title, .display:not([data-lines])').forEach(function (el) {
      if (!window.SplitText) { el.classList.add('is-split'); return; }
      window.SplitText.create(el, {
        type: 'lines', linesClass: 'split-line', autoSplit: true,
        onSplit: function (self) {
          el.classList.add('is-split');
          return gsap.from(self.lines, {
            opacity: 0, yPercent: 45, duration: 1.1, ease: 'expo.out', stagger: 0.1,
            scrollTrigger: { trigger: el, start: 'top 86%', once: true }
          });
        }
      });
    });
  }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(function () { splitHeadings(); ST.refresh(); });
  else splitHeadings();
  // Never leave a heading hidden if something above fails
  setTimeout(function () { d.querySelectorAll('.title, .display').forEach(function (el) { el.classList.add('is-split'); }); }, 4000);

  // Scroll reveals, once each
  ST.batch('[data-reveal]', {
    start: 'top 88%', once: true,
    onEnter: function (els) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', stagger: 0.08, overwrite: true });
    }
  });

  // Photos wipe open from the bottom
  d.querySelectorAll('[data-wipe]').forEach(function (el) {
    gsap.to(el, { clipPath: 'inset(0% 0 0 0)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
  });

  var mm = gsap.matchMedia();

  // Problem deck: the section holds still while each card flicks off to reveal the next
  d.querySelectorAll('.deck').forEach(function (deck) {
    var cards = Array.prototype.slice.call(deck.querySelectorAll('.deck__card'));
    if (cards.length < 2) return;
    cards.forEach(function (c, i) {
      gsap.set(c, { zIndex: cards.length - i, y: i * 14, scale: 1 - i * 0.04 });
    });
    var tl = gsap.timeline({
      defaults: { ease: 'power2.inOut' },
      scrollTrigger: { trigger: deck.closest('.s--deck') || deck, start: 'top top', end: '+=' + (cards.length - 1) * 60 + '%', pin: true, scrub: 0.6, anticipatePin: 1 }
    });
    cards.slice(0, -1).forEach(function (c, i) {
      var label = 'c' + i;
      tl.to(c, { yPercent: -140, rotation: i % 2 ? 7 : -7, duration: 1, ease: 'power2.in' }, label);
      tl.to(c, { opacity: 0, duration: 0.25, ease: 'none' }, label + '+=0.75');
      cards.slice(i + 1).forEach(function (n, k) {
        tl.to(n, { y: k * 14, scale: 1 - k * 0.04, duration: 1 }, label);
      });
      tl.to({}, { duration: 0.35 });
    });
    var hint = deck.querySelector('.deck__hint');
    if (hint) tl.to(hint, { opacity: 0, duration: 0.3 }, '-=0.6');
  });

  // Background shift Pearl → Greige → Bordeaux, tied to the scroll position
  var TONES = ['pearl', 'greige', 'dark'];
  var probe = d.createElement('div'); probe.style.display = 'none'; d.body.appendChild(probe);
  var tone = {};
  TONES.forEach(function (t) {
    probe.className = 'tone-' + t;
    var cs = getComputedStyle(probe);
    tone[t] = {};
    ['--bg', '--paper', '--ink', '--soft', '--rule', '--em'].forEach(function (v) { tone[t][v] = cs.getPropertyValue(v).trim(); });
  });
  probe.remove();
  d.querySelectorAll('[data-tone-run]').forEach(function (run) {
    var parts = run.querySelectorAll(':scope > [data-tone]'); if (!parts.length) return;
    run.classList.add('is-running');
    gsap.set(run, tone[parts[0].dataset.tone]);
    var dark = function (t) { run.classList.toggle('tone-dark', t === 'dark'); };
    dark(parts[0].dataset.tone);
    var pick = function (t, keys) { var o = {}; keys.forEach(function (k) { o[k] = tone[t][k]; }); return o; };
    var SURFACE = ['--bg', '--paper'], TEXT = ['--ink', '--soft', '--rule', '--em'];
    for (var i = 1; i < parts.length; i++) {
      (function (from, to, el) {
        // Background fades slowly with the scroll...
        gsap.fromTo(run, pick(from, SURFACE), Object.assign(pick(to, SURFACE), {
          ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: el, start: 'top 85%', end: 'top 35%', scrub: 0.8 }
        }));
        // ...and the text swaps quickly in the middle, so it never matches the background.
        gsap.fromTo(run, pick(from, TEXT), Object.assign(pick(to, TEXT), {
          ease: 'none', immediateRender: false,
          scrollTrigger: { trigger: el, start: 'top 62%', end: 'top 56%', scrub: 0.3,
            onUpdate: function (s) { dark(s.progress > 0.5 ? to : from); } }
        }));
      })(parts[i - 1].dataset.tone, parts[i].dataset.tone, parts[i]);
    }
  });

  // Full-bleed photo eases back as it passes
  d.querySelectorAll('.veil__img img').forEach(function (img) {
    gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: img.closest('.veil'), start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  // Card glide: cards rise in one after another
  d.querySelectorAll('.glide__card').forEach(function (c, i) { gsap.set(c, { opacity: 0, y: 40 }); });
  ST.batch('.glide__card', { start: 'top 92%', once: true, onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1.1, ease: 'expo.out', stagger: 0.09 }); } });

  // Emboss light follows scroll
  marks.forEach(function (el) {
    ST.create({ trigger: el, start: 'top bottom', end: 'bottom top', onUpdate: function (s) { setEmboss(el, s.progress); } });
  });
})();
