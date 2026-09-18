/* Small, shared behaviors: sticky bar state, fade-up reveals, the project index strip. */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var bar = document.querySelector('.topbar');
  var lastY = window.scrollY;
  function onScroll() {
    var y = window.scrollY;
    if (bar) {
      bar.classList.toggle('scrolled', y > 8);
      bar.classList.toggle('hidden', y > 140 && y > lastY + 4);
      if (y < lastY - 4 || y <= 140) bar.classList.remove('hidden');
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

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
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
  var cells = document.querySelectorAll('.numbers td.n');
  if (cells.length && !reduce && 'IntersectionObserver' in window) {
    var counted = new IntersectionObserver(function (entries) {
      for (var q = 0; q < entries.length; q++) {
        if (entries[q].isIntersecting) { countUp(entries[q].target); counted.unobserve(entries[q].target); }
      }
    }, { threshold: 0.4 });
    for (var n = 0; n < cells.length; n++) counted.observe(cells[n]);
  }

  var groups = document.querySelectorAll('[data-stagger]');
  for (var g = 0; g < groups.length; g++) {
    var kids = groups[g].children;
    for (var k = 0; k < kids.length; k++) kids[k].style.transitionDelay = Math.min(k * 70, 420) + 'ms';
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
  }

  var strip = document.getElementById('strip');
  if (strip) {
    var wrap = strip.parentElement;
    var prev = document.querySelector('[data-strip="prev"]');
    var next = document.querySelector('[data-strip="next"]');
    function update() {
      var atStart = strip.scrollLeft <= 2;
      var atEnd = strip.scrollLeft + strip.clientWidth >= strip.scrollWidth - 2;
      wrap.classList.toggle('at-start', atStart);
      wrap.classList.toggle('at-end', atEnd);
      if (prev) prev.disabled = atStart;
      if (next) next.disabled = atEnd;
    }
    strip.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    var buttons = [prev, next];
    for (var b = 0; b < buttons.length; b++) {
      if (!buttons[b]) continue;
      buttons[b].addEventListener('click', function () {
        var dir = this.getAttribute('data-strip') === 'next' ? 1 : -1;
        strip.scrollBy({ left: dir * strip.clientWidth * 0.8, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  }
})();
