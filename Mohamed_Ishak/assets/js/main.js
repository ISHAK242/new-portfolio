/* ==========================================================================
   Mohamed Ishak H — portfolio interactions
   No dependencies. Everything degrades gracefully without JS.
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     OPTIONAL: paste a form endpoint here (e.g. Formspree "https://formspree.io/f/xxxx"
     or Getform / Basin URL) to receive messages in your inbox automatically.
     Left empty, the contact form opens the visitor's mail client with the
     message pre-filled — which works on any static host with zero setup.
     --------------------------------------------------------------------- */
  var FORM_ENDPOINT = '';
  var CONTACT_EMAIL = 'mohamedishak242@gmail.com';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  root.classList.remove('no-js');
  root.classList.add('js-ready');

  /* ============================== THEME ================================= */
  var THEME_KEY = 'mi-theme';
  var toggle = $('#themeToggle');

  function readStored() {
    try { return localStorage.getItem(THEME_KEY); } catch (e) { return null; }
  }
  function store(v) {
    try { localStorage.setItem(THEME_KEY, v); } catch (e) { /* private mode */ }
  }
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (toggle) {
      toggle.setAttribute('aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    }
  }

  var stored = readStored();
  if (stored === 'light' || stored === 'dark') {
    applyTheme(stored);
  } else {
    applyTheme(window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      store(next);
    });
  }

  /* ========================= HERO ENTRANCE ============================== */
  $$('.anim').forEach(function (el) {
    el.style.setProperty('--anim-i', el.getAttribute('data-anim') || 0);
  });

  /* ============================== NAV =================================== */
  var nav = $('#nav');
  var progress = $('#progressBar');
  var toTop = $('#toTop');
  var burger = $('#burger');
  var mobileMenu = $('#mobileMenu');

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (nav) nav.classList.toggle('is-stuck', y > 8);
    if (toTop) toTop.hidden = y < 600;
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    }
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    /* Reveals run outside requestAnimationFrame on purpose: rAF is throttled
       to zero while the page isn't painting (background tab, hidden window),
       and content must never stay stuck at opacity 0. */
    sweepReveal();
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* --------------------------- mobile menu ------------------------------ */
  function setMenu(open) {
    if (!mobileMenu || !burger) return;
    mobileMenu.hidden = !open;
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('is-locked', open);
  }
  if (burger) {
    burger.addEventListener('click', function () {
      setMenu(mobileMenu.hidden);
    });
  }
  if (mobileMenu) {
    mobileMenu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && mobileMenu && !mobileMenu.hidden) {
      setMenu(false);
      burger.focus();
    }
  });
  window.addEventListener('resize', function () {
    if (window.innerWidth > 980 && mobileMenu && !mobileMenu.hidden) setMenu(false);
  });

  /* ---------------------------- scroll spy ------------------------------ */
  var navLinks = $$('#navLinks a');
  var watched = navLinks
    .map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && watched.length) {
    var visible = {};
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting ? en.intersectionRatio : 0; });

      var bestId = null, bestRatio = 0;
      Object.keys(visible).forEach(function (id) {
        if (visible[id] > bestRatio) { bestRatio = visible[id]; bestId = id; }
      });

      navLinks.forEach(function (a) {
        a.classList.toggle('is-active', bestId !== null && a.getAttribute('href') === '#' + bestId);
      });
    }, { rootMargin: '-25% 0px -55% 0px', threshold: [0, 0.15, 0.4, 0.75, 1] });

    watched.forEach(function (sec) { spy.observe(sec); });
  }

  /* ========================== SCROLL REVEAL =============================
     A sweep rather than an IntersectionObserver: a fast flick-scroll can
     outrun observer callbacks and leave a section invisible for good, which
     is far worse than losing the animation. This can never strand content —
     anything at or above the fold is revealed on the next frame. */
  var pending = $$('.reveal');

  function sweepReveal() {
    if (!pending || !pending.length) return;
    var limit = window.innerHeight * 0.92;
    var still = [];
    for (var i = 0; i < pending.length; i++) {
      var el = pending[i];
      if (el.getBoundingClientRect().top < limit) el.classList.add('is-revealed');
      else still.push(el);
    }
    pending = still;
  }

  if (reduceMotion) {
    pending.forEach(function (el) { el.classList.add('is-revealed'); });
    pending = [];
  } else {
    sweepReveal();
    window.addEventListener('resize', sweepReveal);
    window.addEventListener('load', sweepReveal);
    window.addEventListener('pageshow', sweepReveal);
    document.addEventListener('visibilitychange', sweepReveal);
  }

  /* ========================= METRIC COUNT-UP ============================ */
  var metricNums = $$('.metrics strong[data-count]');
  if (metricNums.length && 'IntersectionObserver' in window && !reduceMotion) {
    var counted = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = parseInt(el.getAttribute('data-count'), 10) || 0;
        var start = performance.now();
        var dur = 900;
        (function step(now) {
          var p = Math.min((now - start) / dur, 1);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = String(Math.round(target * eased));
          if (p < 1) requestAnimationFrame(step);
        })(start);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    metricNums.forEach(function (el) { counted.observe(el); });
  }

  /* ======================== CAPABILITY MAP (HUB) ======================== */
  var HUB = {
    core: {
      title: 'Business Analytics',
      desc: 'The centre of how I work: business questions first, then the data, method and tool that answers them.',
      tools: ['Python', 'SQL', 'Power BI', 'Tableau', 'SPSS', 'Advanced Excel']
    },
    programming: {
      title: 'Programming & Querying',
      desc: 'Cleaning, reshaping and analysing datasets in code rather than by hand.',
      tools: ['Python', 'R Programming', 'SQL']
    },
    data: {
      title: 'Data Handling',
      desc: 'Getting messy marketplace exports into a shape that can actually be analysed.',
      tools: ['SQL', 'Advanced Excel', 'Data Cleaning', 'MS Office']
    },
    bi: {
      title: 'BI & Visualization',
      desc: 'Turning analysis into dashboards and reports a stakeholder can read at a glance.',
      tools: ['Power BI', 'Tableau', 'Advanced Excel', 'Data Visualization']
    },
    ai: {
      title: 'AI & Automation',
      desc: 'Using generative and agentic AI to remove repetitive steps from analytical work.',
      tools: ['Prompt Engineering', 'Generative AI', 'Agentic AI', 'Workflow Automation', 'Zapier', 'n8n', 'OpenAI API', 'Claude AI']
    },
    ecom: {
      title: 'E-commerce Analytics',
      desc: 'Marketplace performance across Amazon, Flipkart and Meesho — sales, returns, listings and growth.',
      tools: ['Sales Optimization', 'Product Listing Strategy', 'Growth Strategy', 'Client Account Management']
    },
    stats: {
      title: 'Statistics',
      desc: 'Testing whether a pattern in the data is real before recommending anything.',
      tools: ['SPSS', 'Regression Analysis', 'Hypothesis Testing', 'Correlation Analysis', 'Forecasting', 'Predictive Analytics']
    },
    research: {
      title: 'Research Methodology',
      desc: 'Designing primary studies end to end — from questionnaire to interpretation.',
      tools: ['Quantitative Research', 'Survey & Questionnaire Design', 'Literature Review', 'Market Research', 'Consumer Behaviour Research', 'Academic Writing']
    }
  };

  var hubTitle = $('#hubTitle');
  var hubDesc = $('#hubDesc');
  var hubTools = $('#hubTools');
  var hubNodes = $$('.hub__node');

  function renderHub(key) {
    var data = HUB[key] || HUB.core;
    if (!hubTitle || !hubDesc || !hubTools) return;
    hubTitle.textContent = data.title;
    hubDesc.textContent = data.desc;
    hubTools.textContent = '';
    data.tools.forEach(function (t) {
      var s = document.createElement('span');
      s.className = 'chip';
      s.textContent = t;
      hubTools.appendChild(s);
    });
    hubNodes.forEach(function (n) {
      n.classList.toggle('is-active', n.getAttribute('data-key') === key);
    });
  }

  hubNodes.forEach(function (node) {
    var key = node.getAttribute('data-key');
    ['mouseenter', 'focus', 'click'].forEach(function (ev) {
      node.addEventListener(ev, function () { renderHub(key); });
    });
    node.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); renderHub(key); }
    });
  });

  var hubViz = $('.hub__viz');
  if (hubViz) {
    hubViz.addEventListener('mouseleave', function () { renderHub('core'); });
  }

  /* =========================== DISCLOSURES ============================== */
  function bindDisclosure(btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;

      var label = btn.querySelector('[data-label-open]');
      if (label) {
        label.textContent = !open
          ? label.getAttribute('data-label-close')
          : label.getAttribute('data-label-open');
      }
    });
  }
  $$('.disclosure').forEach(bindDisclosure);
  $$('[data-toggle]').forEach(bindDisclosure);

  /* open the case study when a work card links to it */
  $$('[data-open-case]').forEach(function (link) {
    link.addEventListener('click', function () {
      var btn = $('[data-toggle="caseStudy"]');
      if (btn && btn.getAttribute('aria-expanded') !== 'true') btn.click();
    });
  });

  /* =========================== WORK FILTERS ============================= */
  var filters = $$('.filter');
  var workCards = $$('#workGrid .card--work');
  var emptyNote = $('#filterEmpty');

  filters.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var cat = btn.getAttribute('data-filter');
      filters.forEach(function (b) { b.classList.toggle('is-active', b === btn); });

      var shown = 0;
      workCards.forEach(function (card) {
        var cats = (card.getAttribute('data-cat') || '').split(/\s+/);
        var match = cat === 'all' || cats.indexOf(cat) !== -1;
        card.classList.toggle('is-hidden', !match);
        if (match) shown++;
      });
      if (emptyNote) emptyNote.hidden = shown !== 0;
    });
  });

  /* ============================= ROTATOR ================================ */
  var rotator = $('#rotator');
  if (rotator && !reduceMotion) {
    var items = $$('.rotator__item', rotator);
    var idx = 0;
    if (items.length > 1) {
      setInterval(function () {
        var current = items[idx];
        idx = (idx + 1) % items.length;
        var next = items[idx];
        current.classList.remove('is-active');
        current.classList.add('is-out');
        next.classList.remove('is-out');
        next.classList.add('is-active');
        setTimeout(function () { current.classList.remove('is-out'); }, 400);
      }, 3200);
    }
  }

  /* =========================== CONTACT FORM ============================= */
  var form = $('#contactForm');
  if (form) {
    var statusEl = $('#formStatus');
    var submitBtn = $('#cfSubmit');

    function setError(field, message) {
      var wrap = field.closest('.field');
      var err = $('[data-err-for="' + field.id + '"]');
      if (wrap) wrap.classList.toggle('has-error', !!message);
      if (err) err.textContent = message || '';
      field.setAttribute('aria-invalid', message ? 'true' : 'false');
    }

    function validate() {
      var ok = true;
      var name = $('#cf-name'), email = $('#cf-email'), subject = $('#cf-subject'), message = $('#cf-message');

      if (!name.value.trim()) { setError(name, 'Please enter your name.'); ok = false; } else setError(name, '');

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim());
      if (!emailOk) { setError(email, 'Please enter a valid email address.'); ok = false; } else setError(email, '');

      if (!subject.value.trim()) { setError(subject, 'Please add a subject.'); ok = false; } else setError(subject, '');

      if (message.value.trim().length < 10) {
        setError(message, 'Please write at least 10 characters.'); ok = false;
      } else setError(message, '');

      return ok;
    }

    $$('#contactForm input, #contactForm textarea').forEach(function (f) {
      f.addEventListener('blur', function () {
        if (f.closest('.field').classList.contains('has-error')) validate();
      });
    });

    function say(msg, kind) {
      if (!statusEl) return;
      statusEl.textContent = msg;
      statusEl.className = 'form-status' + (kind ? ' is-' + kind : '');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) {
        say('Please fix the highlighted fields.', 'err');
        var firstBad = $('.field.has-error input, .field.has-error textarea');
        if (firstBad) firstBad.focus();
        return;
      }

      var payload = {
        name: $('#cf-name').value.trim(),
        email: $('#cf-email').value.trim(),
        subject: $('#cf-subject').value.trim(),
        message: $('#cf-message').value.trim()
      };

      if (FORM_ENDPOINT) {
        submitBtn.disabled = true;
        say('Sending…');
        fetch(FORM_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(payload)
        }).then(function (res) {
          if (!res.ok) throw new Error('Request failed');
          form.reset();
          say('Thanks — your message has been sent. I’ll get back to you shortly.', 'ok');
        }).catch(function () {
          say('Sending failed. Please email ' + CONTACT_EMAIL + ' directly.', 'err');
        }).then(function () {
          submitBtn.disabled = false;
        });
        return;
      }

      /* No endpoint configured: hand off to the visitor's mail client. */
      var body = 'Name: ' + payload.name + '\nEmail: ' + payload.email + '\n\n' + payload.message;
      var href = 'mailto:' + CONTACT_EMAIL +
                 '?subject=' + encodeURIComponent(payload.subject) +
                 '&body=' + encodeURIComponent(body);
      window.location.href = href;
      say('Opening your email app with the message ready to send.', 'ok');
    });
  }

  /* ============================== MISC ================================== */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
