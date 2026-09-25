/* Shared behaviors: sticky bar, reveals, the project index preview, cursor, clock, magnetic link.
   Everything degrades: the page is complete without JavaScript, and motion is gated by prefers-reduced-motion. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches && window.matchMedia('(hover: hover)').matches;
  var raf = function (f) { return window.requestAnimationFrame(f); };

  /* Sticky bar: border when scrolled, hides on the way down, returns on the way up */
  var bar = document.querySelector('.topbar');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (bar) {
      bar.classList.toggle('scrolled', y > 8);
      var hideable = !!document.querySelector('.case-head') && !bar.contains(document.activeElement);
      bar.classList.toggle('hidden', hideable && y > 140 && y > lastY + 4);
      if (y < lastY - 4 || y <= 140) bar.classList.remove('hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  if (bar) bar.addEventListener('focusin', function () { bar.classList.remove('hidden'); });
  onScroll();

  /* Reading progress on case pages */
  if (document.querySelector('.case-head')) {
    var progress = document.createElement('div');
    progress.className = 'progress';
    progress.setAttribute('aria-hidden', 'true');
    document.body.appendChild(progress);
    function onProgress() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(window.scrollY / max, 1) : 0) + ')';
    }
    window.addEventListener('scroll', onProgress, { passive: true });
    window.addEventListener('resize', onProgress);
    onProgress();
  }

  /* Mobile menu */
  var menu = document.getElementById('menu');
  var menuBtn = document.querySelector('.nav .menu-btn');
  if (menu && menuBtn) {
    var closeBtn = menu.querySelector('.menu-close');
    var behind = document.querySelectorAll('.topbar, header, main');
    function setMenu(open) {
      document.documentElement.classList.toggle('menu-open', open);
      menu.setAttribute('aria-hidden', open ? 'false' : 'true');
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      for (var b = 0; b < behind.length; b++) { if (open) behind[b].setAttribute('inert', ''); else behind[b].removeAttribute('inert'); }
      if (open) { closeBtn.focus(); } else { menuBtn.focus(); }
    }
    menuBtn.addEventListener('click', function () { setMenu(true); });
    closeBtn.addEventListener('click', function () { setMenu(false); });
    menu.addEventListener('click', function (e) { if (e.target.closest && e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.documentElement.classList.contains('menu-open')) setMenu(false); });
  }

  /* Local time in Brooklyn, wherever the reader is */
  var clocks = document.querySelectorAll('time[data-tz]');
  if (clocks.length) {
    var fmt;
    try { fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: clocks[0].getAttribute('data-tz') }); } catch (e) { fmt = null; }
    function tick() {
      var now = new Date();
      var text = fmt ? fmt.format(now) : now.toLocaleTimeString();
      for (var c = 0; c < clocks.length; c++) {
        clocks[c].textContent = text;
        clocks[c].setAttribute('datetime', now.toISOString());
      }
    }
    tick();
    setInterval(tick, 15000);
  }

  /* Count-up numbers on case pages */
  function countUp(cell) {
    var text = cell.textContent.trim();
    var match = text.match(/^([\d,]+)(.*)$/);
    if (!match) return;
    var target = parseInt(match[1].replace(/,/g, ''), 10);
    var suffix = match[2];
    var useCommas = match[1].indexOf(',') !== -1;
    var start = null, duration = 900;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      var value = Math.round(target * eased);
      cell.textContent = (useCommas ? value.toLocaleString('en-US') : String(value)) + suffix;
      if (p < 1) raf(frame);
    }
    raf(frame);
  }
  var cells = document.querySelectorAll('.numbers td.n');
  if (cells.length && !reduce && 'IntersectionObserver' in window) {
    var counted = new IntersectionObserver(function (entries) {
      for (var q = 0; q < entries.length; q++) {
        if (entries[q].isIntersecting) {
          var m = entries[q].target.textContent.trim().match(/^([\d,]+)/);
          if (m && parseInt(m[1].replace(/,/g, ''), 10) >= 20) countUp(entries[q].target);
          counted.unobserve(entries[q].target);
        }
      }
    }, { threshold: 0.4 });
    for (var n = 0; n < cells.length; n++) counted.observe(cells[n]);
  }

  /* Staggered reveals */
  var groups = document.querySelectorAll('[data-stagger]');
  for (var g = 0; g < groups.length; g++) {
    var kids = groups[g].children;
    for (var k = 0; k < kids.length; k++) {
      var delay = Math.min(k * 70, 420) + 'ms';
      kids[k].style.setProperty('--d', delay);
      var plate = kids[k].querySelector('.plate.reveal');
      if (plate) plate.style.setProperty('--d', delay);
    }
  }
  var els = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    for (var i = 0; i < els.length; i++) els[i].classList.add('in');
  } else {
    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) { entries[j].target.classList.add('in'); io.unobserve(entries[j].target); }
      }
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    for (var m = 0; m < els.length; m++) io.observe(els[m]);
    /* Safety net: whatever is on screen shortly after load is shown, even if the observer is late */
    function sweep() {
      var vh = window.innerHeight || 800;
      for (var s = 0; s < els.length; s++) {
        if (els[s].classList.contains('in')) continue;
        var b = els[s].getBoundingClientRect();
        if (b.top < vh * 1.1 && b.bottom > 0) els[s].classList.add('in');
      }
    }
    setTimeout(sweep, 900);
    window.addEventListener('pageshow', function () { setTimeout(sweep, 300); });
    window.addEventListener('pagereveal', function () { setTimeout(sweep, 400); });
  }

  /* Magnetic link: the email nudges toward the pointer */
  var mags = document.querySelectorAll('[data-magnetic]');
  if (mags.length && fine && !reduce) {
    for (var q2 = 0; q2 < mags.length; q2++) {
      (function (el) {
        var strength = 0.25;
        el.addEventListener('mousemove', function (e) {
          var b = el.getBoundingClientRect();
          var dx = e.clientX - (b.left + b.width / 2);
          var dy = e.clientY - (b.top + b.height / 2);
          el.style.transition = 'transform .15s ease-out, border-color .3s ease';
          el.style.transform = 'translate(' + dx * strength + 'px,' + dy * strength + 'px)';
        });
        el.addEventListener('mouseleave', function () {
          el.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1), border-color .3s ease';
          el.style.transform = '';
        });
      })(mags[q2]);
    }
  }

  /* The sliding project index */
  var strip = document.getElementById('strip');
  if (strip) {
    var wrap = strip.parentElement;
    var prev = document.querySelector('[data-strip="prev"]');
    var next = document.querySelector('[data-strip="next"]');
    var current = document.getElementById('strip-current');
    var rail = document.querySelector('.strip-rail i');
    var track = rail ? rail.parentElement : null;
    var chips = strip.children;
    var pending = false;
    function update() {
      pending = false;
      var atStart = strip.scrollLeft <= 2;
      var atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2;
      wrap.classList.toggle('at-start', atStart);
      wrap.classList.toggle('at-end', atEnd);
      if (prev) prev.disabled = atStart;
      if (next) next.disabled = atEnd;
      var max = strip.scrollWidth - strip.clientWidth;
      var p = max > 0 ? Math.min(Math.max(strip.scrollLeft / max, 0), 1) : 0;
      if (rail && track) {
        var tw = track.clientWidth;
        var thumb = Math.max(24, tw * strip.clientWidth / strip.scrollWidth);
        rail.style.width = thumb + 'px';
        rail.style.transform = 'translateX(' + p * (tw - thumb) + 'px)';
      }
      if (current && chips.length > 1) {
        var step = chips[1].offsetLeft - chips[0].offsetLeft;
        var idx = step > 0 ? Math.round(strip.scrollLeft / step) + 1 : 1;
        if (atEnd) idx = chips.length;
        idx = Math.min(Math.max(idx, 1), chips.length);
        current.textContent = (idx < 10 ? '0' : '') + idx;
      }
    }
    function onStripScroll() { if (!pending) { pending = true; raf(update); } }
    strip.addEventListener('scroll', onStripScroll, { passive: true });
    window.addEventListener('resize', onStripScroll);
    update();
    if (fine) {
      var dragging = false, startX = 0, startLeft = 0, moved = 0;
      strip.addEventListener('pointerdown', function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        dragging = true; moved = 0; startX = e.clientX; startLeft = strip.scrollLeft;
        strip.classList.add('dragging');
        try { strip.setPointerCapture(e.pointerId); } catch (err) {}
      });
      strip.addEventListener('pointermove', function (e) {
        if (!dragging) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > moved) moved = Math.abs(dx);
        strip.scrollLeft = startLeft - dx;
      });
      function endDrag() { if (!dragging) return; dragging = false; strip.classList.remove('dragging'); }
      strip.addEventListener('pointerup', endDrag);
      strip.addEventListener('pointercancel', endDrag);
      strip.addEventListener('click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; } }, true);
    }
    var buttons = [prev, next];
    for (var b2 = 0; b2 < buttons.length; b2++) {
      if (!buttons[b2]) continue;
      buttons[b2].addEventListener('click', function () {
        var dir = this.getAttribute('data-strip') === 'next' ? 1 : -1;
        strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  }

  /* Spot zones (hero, contact): letters lighten under the pointer and the contour map brightens around it */
  var zones = document.querySelectorAll('[data-spot]');
  if (zones.length && fine && !reduce) {
    for (var z = 0; z < zones.length; z++) {
      (function (zone) {
        var chars = zone.querySelectorAll('.ch');
        for (var c0 = 0; c0 < chars.length; c0++) chars[c0].style.transition = 'font-variation-settings .5s cubic-bezier(.2,.7,.2,1), transform .35s cubic-bezier(.16,1,.3,1)';
        var bright = zone.querySelector('.contours.bright');
        if (!chars.length && !bright) return;
        var hx = -9999, hy = -9999, tick = false, centers = null;
        var fs = chars.length ? parseFloat(getComputedStyle(chars[0]).fontSize) || 100 : 100;
        var sigma = Math.max(60, fs * 0.7), cutoff = Math.pow(sigma * 3.3, 2);
        function measure() {
          centers = [];
          for (var i2 = 0; i2 < chars.length; i2++) {
            var cb = chars[i2].getBoundingClientRect();
            centers.push([cb.left + cb.width / 2, cb.top + cb.height / 2]);
          }
        }
        function frame() {
          tick = false;
          if (bright) {
            var bb = bright.getBoundingClientRect();
            bright.style.setProperty('--mx', (hx - bb.left) + 'px');
            bright.style.setProperty('--my', (hy - bb.top) + 'px');
          }
          if (!centers) measure();
          for (var k2 = 0; k2 < chars.length; k2++) {
            var dx = centers[k2][0] - hx, dy = centers[k2][1] - hy;
            var d2 = dx * dx + dy * dy;
            var w = d2 < cutoff ? Math.round(800 - 230 * Math.exp(-d2 / (2 * sigma * sigma))) : 800;
            chars[k2].style.fontVariationSettings = "'opsz' 96, 'wght' " + w;
            var dist = Math.sqrt(d2), push = dist < 140 && dist > 0 ? (1 - dist / 140) * 7 : 0;
            chars[k2].style.transform = push ? 'translate(' + (dx / dist * push) + 'px,' + (dy / dist * push) + 'px)' : '';
          }
        }
        zone.addEventListener('mousemove', function (e) {
          hx = e.clientX; hy = e.clientY;
          if (!tick) { tick = true; raf(frame); }
        }, { passive: true });
        zone.addEventListener('mouseenter', function () { zone.classList.add('spot'); });
        zone.addEventListener('mouseleave', function () {
          zone.classList.remove('spot');
          hx = -9999; hy = -9999;
          if (!tick) { tick = true; raf(frame); }
        });
        window.addEventListener('resize', function () { centers = null; });
        window.addEventListener('scroll', function () { centers = null; }, { passive: true });
        setTimeout(function () { centers = null; }, 1600);
      })(zones[z]);
    }
  }

  /* ---------------------------------------------------------------- Rethink additions */
  var root = document.documentElement;
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Theme: dark by default, remembered in localStorage, toggled from the top bar */
  function setTheme(mode, silent) {
    if (mode === 'auto') { try { localStorage.removeItem('theme'); } catch (e) {} mode = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
    else { try { localStorage.setItem('theme', mode); } catch (e) {} }
    root.classList.add('theme-fade');
    if (mode === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
    $$('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-label', mode === 'light' ? 'Switch to dark mode' : 'Switch to light mode'); });
    if (window.SkillsGraph && window.SkillsGraph.init) { try { window.SkillsGraph.init(); } catch (e) {} }
    if (!silent) toast(mode === 'light' ? 'Light mode' : 'Dark mode');
    setTimeout(function () { root.classList.remove('theme-fade'); }, 400);
  }
  window.setTheme = setTheme;
  $$('[data-theme-toggle]').forEach(function (b) {
    b.setAttribute('aria-label', root.getAttribute('data-theme') === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    b.addEventListener('click', function () { setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); });
  });

  /* Toast */
  var toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl);
  var toastT;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 1800); }

  /* Keyboard shortcuts: ? help, Cmd/Ctrl+K terminal, g then h/l/b/r/w, Esc */
  var help = document.createElement('div'); help.className = 'help'; help.setAttribute('role', 'dialog'); help.setAttribute('aria-modal', 'true'); help.setAttribute('aria-label', 'Keyboard shortcuts');
  help.innerHTML = '<div class="box"><h3>Keyboard shortcuts</h3><dl>' +
    [['Open the terminal', '&#8984;K / Ctrl+K'], ['This help', '?'], ['Open GitHub', 'g then h'], ['Open LinkedIn', 'g then l'], ['Open Behance', 'g then b'], ['Open the resume', 'g then r'], ['Jump to the work index', 'g then w'], ['Toggle light and dark', 'g then t'], ['Close overlays', 'Esc']]
      .map(function (r) { return '<div><span>' + r[0] + '</span><kbd>' + r[1] + '</kbd></div>'; }).join('') +
    '</dl><button type="button" class="close">Close</button></div>';
  document.body.appendChild(help);
  function showHelp(on) { help.classList.toggle('on', on); if (on) $('.close', help).focus(); }
  help.addEventListener('click', function (e) { if (e.target === help || e.target.classList.contains('close')) showHelp(false); });
  var gPending = false, gTimer;
  var base = document.querySelector('.hero') ? '' : '../';
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) return;
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); if (window.Terminal) window.Terminal.toggle(); else toast('The terminal lives on the home page'); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '?') { e.preventDefault(); showHelp(!help.classList.contains('on')); return; }
    if (e.key === 'Escape') { showHelp(false); return; }
    if (e.key === 'g' && !gPending) { gPending = true; clearTimeout(gTimer); gTimer = setTimeout(function () { gPending = false; }, 900); return; }
    if (gPending) {
      gPending = false; clearTimeout(gTimer);
      var go = { h: ['https://github.com/lochanpranav', 'GitHub'], l: ['https://www.linkedin.com/in/lochanpranav', 'LinkedIn'], b: ['https://www.behance.net/lochanpranav', 'Behance'], r: [base + 'assets/Lochan_Pranav_Resume.pdf', 'Resume'] }[e.key];
      if (go) { window.open(go[0], '_blank', 'noopener'); toast('→ ' + go[1]); }
      else if (e.key === 'w') { if (document.getElementById('index')) { document.getElementById('index').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); toast('→ Work'); } else { location.href = base + 'index.html#index'; } }
      else if (e.key === 't') { setTheme(root.getAttribute('data-theme') === 'light' ? 'dark' : 'light'); }
    }
  });

  /* Boot screen: mono lines, click to skip, once per session; the mode chooser on the very first visit */
  var boot = document.getElementById('boot');
  if (boot) {
    var booted = false, hasTheme = false;
    try { booted = !!sessionStorage.getItem('booted'); hasTheme = !!localStorage.getItem('theme'); } catch (e) { booted = true; }
    if (!booted && !reduce) {
      boot.classList.add('on'); boot.setAttribute('aria-hidden', 'false');
      var linesEl = document.getElementById('boot-lines'), choose = document.getElementById('boot-choose'), hint = document.getElementById('boot-hint');
      var lines = [['> plotting lochanpranav.com', 0], ['> loading basemap [████░░░░] 50%', 260], ['> loading basemap [████████] 100%', 520], ['> placing 20 projects on the map', 720], ['> calibrating to Brooklyn, 40.68° N 73.94° W', 940], ['> ready. press ? for shortcuts.', 1180, 'ok']];
      var timers = [], done = false;
      lines.forEach(function (l) { timers.push(setTimeout(function () { var d = document.createElement('div'); d.className = 'ln' + (l[2] ? ' ' + l[2] : ''); d.textContent = l[0]; linesEl.appendChild(d); }, l[1])); });
      function finish() {
        if (done) return; done = true;
        timers.forEach(clearTimeout);
        try { sessionStorage.setItem('booted', '1'); } catch (e) {}
        boot.classList.add('leaving'); boot.setAttribute('aria-hidden', 'true');
        setTimeout(function () { boot.classList.remove('on'); sweepAll(); }, 420);
      }
      function askMode() {
        timers.forEach(clearTimeout); linesEl.hidden = true; choose.hidden = false; hint.hidden = true;
        $$('[data-choose]', choose).forEach(function (b) { b.addEventListener('click', function (e) { e.stopPropagation(); setTheme(b.getAttribute('data-choose'), true); finish(); }); });
        $('[data-choose="dark"]', choose).focus();
      }
      timers.push(setTimeout(function () { if (hasTheme) finish(); else askMode(); }, 1500));
      boot.addEventListener('click', function () { if (hasTheme) finish(); else askMode(); });
      document.addEventListener('keydown', function onKey(e) { if (boot.classList.contains('on') && !done && (e.key === 'Escape' || e.key === 'Enter') && choose.hidden) { if (hasTheme) finish(); else askMode(); } });
    }
  }
  function sweepAll() { $$('.reveal').forEach(function (el) { var b = el.getBoundingClientRect(); if (b.top < window.innerHeight * 1.1 && b.bottom > 0) el.classList.add('in'); }); }

  /* Right-side dot navigation: the active dot follows the section in view */
  var dots = $$('.dots a');
  if (dots.length && 'IntersectionObserver' in window) {
    var targets = dots.map(function (a) { return document.querySelector(a.getAttribute('href')); }).filter(Boolean);
    var current = null;
    var dio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) current = en.target; });
      if (!current) return;
      dots.forEach(function (a) { a.classList.toggle('on', a.getAttribute('href') === '#' + current.id); });
    }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });
    targets.forEach(function (t) { dio.observe(t); });
  }

  /* Reticle cursor on fine pointers */
  if (fine && !reduce) {
    var cur = document.createElement('div'); cur.className = 'cur'; cur.setAttribute('aria-hidden', 'true'); cur.innerHTML = '<i class="dot"></i><i class="ring"></i>';
    document.body.appendChild(cur);
    root.classList.add('cursor-on');
    var cx = -100, cy = -100, rx = -100, ry = -100, cdot = $('.dot', cur), cring = $('.ring', cur), curRaf = false, shown = false;
    function curFrame() {
      curRaf = false;
      cdot.style.transform = 'translate(' + cx + 'px,' + cy + 'px)' + (cur.classList.contains('over') ? ' scale(.5)' : '');
      rx += (cx - rx) * .18; ry += (cy - ry) * .18;
      cring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)' + (cur.classList.contains('down') ? ' scale(.85)' : '');
      if (Math.abs(cx - rx) > .3 || Math.abs(cy - ry) > .3) { curRaf = true; raf(curFrame); }
    }
    document.addEventListener('mousemove', function (e) {
      cx = e.clientX; cy = e.clientY;
      if (!shown) { shown = true; rx = cx; ry = cy; cur.classList.remove('hide'); }
      var t = e.target && e.target.closest ? e.target.closest('a, button, [role="button"], input, textarea, select, label, summary, .strip') : null;
      cur.classList.toggle('over', !!t);
      if (!curRaf) { curRaf = true; raf(curFrame); }
    }, { passive: true });
    document.addEventListener('mousedown', function () { cur.classList.add('down'); });
    document.addEventListener('mouseup', function () { cur.classList.remove('down'); });
    document.addEventListener('mouseleave', function () { cur.classList.add('hide'); });
    document.addEventListener('mouseenter', function () { cur.classList.remove('hide'); });
    window.addEventListener('blur', function () { cur.classList.add('hide'); });
  }

  /* Elevation-profile dividers: a deterministic profile per divider, drawn when it enters view */
  var dividers = $$('.divider');
  if (dividers.length) {
    dividers.forEach(function (d, idx) {
      var W = 1200, H = 32, pts = [], seed = 17 + idx * 31, y = 16;
      function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
      for (var x = 0; x <= W; x += 20) {
        var r = rnd();
        if (r < .18) y = 16 - Math.round(rnd() * 10); else if (r < .3) y = 16 + Math.round(rnd() * 8); else if (r < .55) y = 16;
        pts.push(x + ',' + y);
      }
      var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true"><polyline points="' + pts.join(' ') + '"/></svg>';
      d.innerHTML = svg;
      var pl = d.querySelector('polyline');
      try { var len = pl.getTotalLength(); pl.style.setProperty('--len', Math.ceil(len)); } catch (e) {}
    });
    if ('IntersectionObserver' in window && !reduce) {
      var divio = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); divio.unobserve(en.target); } }); }, { threshold: 0.5 });
      dividers.forEach(function (d) { divio.observe(d); });
    } else { dividers.forEach(function (d) { d.classList.add('in'); }); }
  }

  /* Hero: greeting by Brooklyn time, rotating status word */
  var greet = document.getElementById('greet'), word = document.getElementById('status-word');
  if (greet) {
    var hour = 12;
    try { hour = parseInt(new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: 'America/New_York' }).format(new Date()), 10); } catch (e) { hour = new Date().getHours(); }
    greet.textContent = hour < 5 ? 'late night in Brooklyn' : hour < 12 ? 'good morning' : hour < 17 ? 'good afternoon' : hour < 22 ? 'good evening' : 'late night in Brooklyn';
  }
  if (word && !reduce) {
    var words = ['mapping', 'prototyping', 'modeling', 'sketching', 'building'], wi = 0;
    setInterval(function () { wi = (wi + 1) % words.length; word.textContent = words[wi]; word.classList.remove('swap'); void word.offsetWidth; word.classList.add('swap'); }, 2600);
  }

  /* Plates: the highlight follows the pointer */
  if (fine) {
    var glowTick = false, glowEl = null, gx = 0, gy = 0;
    document.addEventListener('mousemove', function (e) {
      var p = e.target && e.target.closest ? e.target.closest('.plate') : null;
      if (!p) return;
      glowEl = p; gx = e.clientX; gy = e.clientY;
      if (!glowTick) { glowTick = true; raf(function () { glowTick = false; var b = glowEl.getBoundingClientRect(); glowEl.style.setProperty('--mx', (gx - b.left) + 'px'); glowEl.style.setProperty('--my', (gy - b.top) + 'px'); }); }
    }, { passive: true });
  }

  /* Count-ups on data-count numbers */
  var counters = $$('[data-count]');
  if (counters.length && !reduce && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target, target = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-decimals') || '0', 10), suffix = el.getAttribute('data-suffix') || '', start = null, dur = 1100;
        var commas = /,/.test(el.textContent);
        function fr(ts) { if (start === null) start = ts; var p = Math.min((ts - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3), v = target * eased; var txt = dec ? v.toFixed(dec) : Math.round(v); if (!dec && commas) txt = Number(txt).toLocaleString('en-US'); el.textContent = txt + suffix; if (p < 1) raf(fr); }
        raf(fr); cio.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cio.observe(c); });
  }

  /* Index ticker: auto-advance one chip at a time, speed from the slider, pauses on hover, focus and drag */
  var tctl = document.getElementById('ticker-ctl');
  if (tctl && strip) {
    var playing = false, tTimer = null, speedIn = $('[data-ticker="speed"]', tctl), hovering = false;
    function interval() { return 6500 - (parseInt(speedIn.value, 10) - 1) * 600; }
    function step() {
      if (!playing || hovering || document.hidden || strip.classList.contains('dragging')) return;
      var kids = strip.children, stepW = kids.length > 1 ? kids[1].offsetLeft - kids[0].offsetLeft : 340;
      var atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2;
      if (atEnd) strip.scrollTo({ left: 0, behavior: reduce ? 'auto' : 'smooth' }); else strip.scrollBy({ left: stepW, behavior: reduce ? 'auto' : 'smooth' });
    }
    function schedule() { clearInterval(tTimer); if (playing) tTimer = setInterval(step, interval()); }
    function setPlaying(on) { playing = on; tctl.classList.toggle('playing', on); schedule(); }
    $('[data-ticker="play"]', tctl).addEventListener('click', function () { setPlaying(true); });
    $('[data-ticker="pause"]', tctl).addEventListener('click', function () { setPlaying(false); });
    speedIn.addEventListener('input', schedule);
    strip.addEventListener('mouseenter', function () { hovering = true; }); strip.addEventListener('mouseleave', function () { hovering = false; });
    strip.addEventListener('focusin', function () { hovering = true; }); strip.addEventListener('focusout', function () { hovering = false; });
    if (!reduce) setPlaying(true);
  }

  /* Footer marquee controls */
  var fctl = document.getElementById('foot-ctl'), ftick = document.getElementById('foot-ticker');
  if (fctl && ftick) {
    var fspeed = $('[data-marquee="speed"]', fctl);
    function applySpeed() { ftick.style.setProperty('--dur', (130 - parseInt(fspeed.value, 10) * 11) + 's'); }
    fspeed.addEventListener('input', applySpeed); applySpeed();
    fctl.classList.add('playing');
    $('[data-marquee="play"]', fctl).addEventListener('click', function () { ftick.classList.remove('paused'); fctl.classList.add('playing'); });
    $('[data-marquee="pause"]', fctl).addEventListener('click', function () { ftick.classList.add('paused'); fctl.classList.remove('playing'); });
  }

  /* Contact form: posts to Formspree once a form id is set, otherwise opens a mail draft */
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      if (form.action.indexOf('FORM_ID') === -1) return;
      e.preventDefault();
      var fd = new FormData(form);
      var body = 'Hi Lochan,%0D%0A%0D%0A' + encodeURIComponent(fd.get('message') || '') + '%0D%0A%0D%0A' + encodeURIComponent(fd.get('name') || '') + '%0D%0A' + encodeURIComponent(fd.get('email') || '');
      location.href = 'mailto:lm5677@nyu.edu?subject=' + encodeURIComponent('Hello from ' + (fd.get('name') || 'your site')) + '&body=' + body;
      toast('Opening your mail app');
    });
  }

  /* Featured showcase: the thumbnail rail drives the detail panel; the gallery pages through images */
  var featData = document.getElementById('feat-data'), featDetail = document.getElementById('feat-detail');
  if (featData && featDetail) {
    var F = JSON.parse(featData.textContent), fi = 0, img = 0;
    var gal = document.getElementById('feat-gallery'), gdots = document.getElementById('feat-dots');
    function esc(t) { return String(t); }
    function el(id) { return document.getElementById(id); }
    function renderGallery() {
      var imgs = $$('img', gal);
      imgs.forEach(function (im, i) { im.classList.toggle('on', i === img); if (i === img) im.loading = 'eager'; });
      $$('button', gdots).forEach(function (b, i) { b.classList.toggle('on', i === img); });
      el('feat-ref').textContent = 'img_ref: ' + (img + 1 < 10 ? '0' : '') + (img + 1) + '/' + (imgs.length < 10 ? '0' : '') + imgs.length;
    }
    function show(i) {
      var f = F[i]; fi = i; img = 0;
      featDetail.classList.remove('switching'); void featDetail.offsetWidth; featDetail.classList.add('switching');
      el('feat-n').textContent = f.n + '/'; el('feat-title').textContent = f.title; el('feat-result').textContent = f.result;
      el('feat-links').innerHTML = '<a class="primary" href="' + f.page + '">Case study</a>' + (f.ext ? '<a href="' + f.ext + '" target="_blank" rel="noopener">' + f.extLabel + '</a>' : '');
      el('feat-sub').textContent = f.sub;
      el('feat-stats').innerHTML = f.stats.map(function (s) { return '<div><b>' + s[0] + '</b><span>' + s[1] + '</span></div>'; }).join('');
      el('feat-metrics').textContent = f.metrics; el('feat-desc').textContent = f.desc; el('feat-role').textContent = f.role;
      el('feat-tools').innerHTML = f.tools.map(function (t) { return '<li>' + t + '</li>'; }).join('');
      el('feat-event').textContent = f.event; el('feat-count').textContent = 'Project ' + (i + 1) + ' of ' + F.length;
      $$('img', gal).forEach(function (n) { n.remove(); });
      f.images.forEach(function (src, k) { var im = document.createElement('img'); im.src = src; im.alt = ''; im.width = 1600; im.height = 1100; im.decoding = 'async'; if (k) im.loading = 'lazy'; gal.insertBefore(im, gal.firstChild); });
      $$('img', gal).reverse();
      gdots.innerHTML = f.images.map(function (_, k) { return '<button type="button" data-img="' + k + '" aria-label="Image ' + (k + 1) + '"></button>'; }).join('');
      $$('.feat-thumb').forEach(function (b, k) { b.classList.toggle('on', k === i); b.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
      renderGallery();
    }
    $$('.feat-thumb').forEach(function (b) { b.addEventListener('click', function () { var i = parseInt(b.getAttribute('data-feat'), 10); if (i !== fi) show(i); }); });
    gal.addEventListener('click', function (e) {
      var b = e.target.closest('[data-g]'); if (!b) return;
      var n = $$('img', gal).length; img = (img + (b.getAttribute('data-g') === 'next' ? 1 : n - 1)) % n; renderGallery();
    });
    gdots.addEventListener('click', function (e) { var b = e.target.closest('[data-img]'); if (!b) return; img = parseInt(b.getAttribute('data-img'), 10); renderGallery(); });
    document.addEventListener('keydown', function (e) {
      if (!featDetail.matches(':hover') && !featDetail.contains(document.activeElement)) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { var n = $$('img', gal).length; img = (img + (e.key === 'ArrowRight' ? 1 : n - 1)) % n; renderGallery(); }
    });
  }
})();
