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

  /* Project index: a preview image that follows the pointer over the rows */
  var roll = document.getElementById('roll');
  var preview = document.getElementById('preview');
  if (roll && preview && fine && !reduce) {
    var pimg = preview.querySelector('img');
    var px = 0, py = 0, tx = 0, ty = 0, on = false, ticking = false, warmed = false;
    function place() {
      ticking = false;
      px += (tx - px) * 0.18;
      py += (ty - py) * 0.18;
      var rot = Math.max(-5, Math.min(5, (tx - px) * 0.04));
      var w = preview.offsetWidth || 320;
      var x = Math.min(px + 24, window.innerWidth - w - 16);
      var y = Math.max(py, 100 + 24);
      preview.style.transform = 'translate(' + x + 'px, ' + (y - 100) + 'px) translate(0, -50%) rotate(' + rot + 'deg) scale(' + (on ? 1 : .9) + ')';
      if (on || Math.abs(tx - px) > 0.5 || Math.abs(ty - py) > 0.5) { ticking = true; raf(place); }
    }
    function warm() {
      if (warmed) return; warmed = true;
      var rows2 = roll.querySelectorAll('.row');
      for (var w2 = 0; w2 < rows2.length; w2++) { var im = new Image(); im.src = rows2[w2].getAttribute('data-img'); }
    }
    roll.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      if (!ticking) { ticking = true; raf(place); }
    }, { passive: true });
    roll.addEventListener('mouseenter', warm, { once: true });
    var rows = roll.querySelectorAll('.row');
    for (var r = 0; r < rows.length; r++) {
      rows[r].addEventListener('mouseenter', function (e) {
        var src = this.getAttribute('data-img');
        if (pimg.getAttribute('src') !== src) pimg.setAttribute('src', src);
        if (!on) { tx = px = e.clientX; ty = py = e.clientY; }
        on = true; preview.classList.add('on');
        if (!ticking) { ticking = true; raf(place); }
      });
      rows[r].addEventListener('mouseleave', function () {
        on = false; preview.classList.remove('on');
      });
    }
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

  /* Hero contours drift with the pointer */
  var contours = document.querySelector('.hero-bg .contours');
  if (contours && fine && !reduce) {
    var hero = document.querySelector('.hero');
    var hx = 0, hy = 0, hTick = false;
    hero.addEventListener('mousemove', function (e) {
      var b = hero.getBoundingClientRect();
      hx = ((e.clientX - b.left) / b.width - 0.5) * 18;
      hy = ((e.clientY - b.top) / b.height - 0.5) * 12;
      if (!hTick) { hTick = true; raf(function () { hTick = false; contours.style.translate = hx + 'px ' + hy + 'px'; }); }
    }, { passive: true });
  }

})();
