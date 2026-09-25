/* Skills graph: a force-directed network of disciplines, tools and projects drawn on a canvas.
   Touch and reduced-motion visitors get the same data as a grouped list. ES5, no dependencies.
   After a theme change call window.SkillsGraph.init() to re-read the colors from the CSS variables. */
(function () {
  'use strict';
  var DISC = ['GIS', 'Machine learning', 'Product and UX', 'Brand and campaign', 'Industrial design', 'Building'];
  var TOOLS = [
    'ArcGIS Pro,ArcGIS Online,StoryMaps,Network Analyst,Spatial Analyst,Cartography',
    'Python,pandas,scikit-learn,SQL,R',
    'Figma,Usability testing,Design systems',
    'Illustrator,Photoshop,Photography,Video editing',
    'Rhino,Fusion 360,SolidWorks,KeyShot,Blender',
    'Streamlit,REST APIs,HTML and CSS,Git'
  ];
  /* discipline index | name | page slug under work/ (empty when there is no page) | linked tools */
  var PROJECTS = [
    '0|Tulsa Event Monitor|tulsa-event-monitor|Figma,Python,Streamlit,REST APIs',
    '0|MTA bus electrification|bus-electrification|ArcGIS Pro,Spatial Analyst,Network Analyst,StoryMaps',
    '0|Hospital accessibility, Miami-Dade|hospital-accessibility|ArcGIS Pro,Network Analyst,StoryMaps',
    '0|The economics of proximity|economics-of-proximity|ArcGIS Pro,ArcGIS Online,StoryMaps',
    '1|Predicting NYC housing and transport burden||Python,pandas,scikit-learn',
    '2|Sarathi license portal|sarathi|Figma,Illustrator',
    '2|SAVOR|savor|Figma,Illustrator,Photoshop',
    '2|SUII suitcase rental|suii|Figma',
    '2|Mighty|mighty|Figma',
    '2|Saginaw Tattoo|saginaw|Figma',
    '2|Spar Agrotech|spar-website|Figma,Illustrator,Photoshop',
    '2|Address Masters|address-masters-dashboard|Figma,Photoshop,Illustrator,Photography,Video editing,Design systems,Usability testing',
    '3|SNN Estates Felicity|snn-felicity|Photoshop,Illustrator,Photography,Video editing',
    '3|Visista OKAS|visista-okas|Photoshop,Illustrator,Photography,Video editing',
    '4|Filter coffee maker|coffee-maker|',
    '4|Saffron oil bottle|saffron-oil-bottle|',
    '4|Earpods packaging|earpods-packaging|',
    '4|Tesla perfume bottle|tesla-perfume|',
    '4|Home decor store|home-decor-store|',
    '4|Sustainable shoes|sustainable-shoes|',
    '4|Tree bookshelf|tree-bookshelf|'
  ];
  var TAU = Math.PI * 2, MONO = '12px "JetBrains Mono", monospace', seed = 7;
  function rnd() { seed = seed * 16807 % 2147483647; return seed / 2147483647; }

  /* k: 0 discipline, 1 tool, 2 project. d: discipline index. Edges are [a, b, rest length]. */
  function build() {
    var nodes = [], edges = [], id = {}, i, j, t, p;
    function add(k, name, d, url) { id[name] = nodes.length; nodes.push({ k: k, name: name, d: d, url: url, r: [9, 5, 3.5][k], adj: {}, x: 0, y: 0, vx: 0, vy: 0 }); }
    function link(a, b, len) { edges.push([a, b, len]); nodes[a].adj[b] = nodes[b].adj[a] = 1; }
    for (i = 0; i < 6; i++) add(0, DISC[i], i, '');
    for (i = 0; i < 6; i++) for (t = TOOLS[i].split(','), j = 0; j < t.length; j++) { add(1, t[j], i, ''); link(nodes.length - 1, i, 64); }
    for (i = 0; i < PROJECTS.length; i++) {
      p = PROJECTS[i].split('|'); t = p[3] ? p[3].split(',') : [];
      add(2, p[1], +p[0], p[2] && 'work/' + p[2] + '.html'); link(nodes.length - 1, +p[0], 84);
      for (j = 0; j < t.length; j++) link(nodes.length - 1, id[t[j]], 46);
    }
    return { nodes: nodes, edges: edges };
  }

  function renderList(el, g) {
    var h = '', i, j, n;
    for (i = 0; i < 6; i++) {
      h += '<div><h3>' + DISC[i] + '</h3><p>';
      for (j = 6; j < g.nodes.length; j++) {
        n = g.nodes[j];
        if (n.d === i) h += (n.url ? '<a href="' + n.url + '"' : '<span') + ' class="graph-chip' + (n.k > 1 ? ' is-project' : '') + '">' + n.name + (n.url ? '</a>' : '</span>');
      }
      h += '</p></div>';
    }
    el.innerHTML = '<div class="graph-list">' + h + '</div>';
  }

  /* Canvas version. Returns a function that re-reads the colors and redraws. */
  function start(el, g) {
    var nodes = g.nodes, edges = g.edges, N = nodes.length, E = edges.length;
    var canvas = document.createElement('canvas'), tip = document.createElement('div'), ctx = canvas.getContext('2d');
    var W = 0, H = 0, S = 1, dpr = 1, col, hover = -1, px = -1e4, py = -1e4, raf = 0, visible = false, rt;

    function color() {
      var cs = getComputedStyle(el);
      col = ['--accent,#3FBF7A', '--ink,#ECEAE4', '--muted,#9A9C97', '--rule,#262C33'].map(function (s) { s = s.split(','); return cs.getPropertyValue(s[0]).replace(/\s/g, '') || s[1]; });
    }
    function size() {
      var w = el.clientWidth || 600, h = Math.max(360, Math.min(560, w * 0.62)), sx = W && w / W, sy = H && h / H, i, n, a;
      W = w; H = h; S = Math.max(0.7, Math.min(1, w / 960)); dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr; canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      for (i = 0; i < N; i++) {
        n = nodes[i];
        if (!n.k) { a = n.d * TAU / 6 - TAU / 4; n.ax = W / 2 + Math.cos(a) * W * 0.3; n.ay = H / 2 + Math.sin(a) * H * 0.3; }
        if (sx) { n.x *= sx; n.y *= sy; }
      }
    }
    /* Disciplines start on their anchors, tools around their discipline, projects between their links. */
    function place() {
      var i, k, n, a, x, y, c;
      for (i = 0; i < N; i++) {
        n = nodes[i]; x = y = c = 0;
        if (!n.k) { n.x = n.ax; n.y = n.ay; }
        else if (n.k === 1) { a = rnd() * TAU; n.x = nodes[n.d].x + Math.cos(a) * 60 * S; n.y = nodes[n.d].y + Math.sin(a) * 60 * S; }
        else {
          for (k in n.adj) { x += nodes[k].x; y += nodes[k].y; c++; }
          n.x = x / c + (rnd() - 0.5) * 60; n.y = y / c + (rnd() - 0.5) * 60;
        }
      }
    }
    /* One step: anchor or center pull, pointer push, pair repulsion, edge springs, damping. Returns true while still moving. */
    function tick() {
      var i, j, a, b, e, dx, dy, d2, d, f, m = 0, rep = 700 * S * S;
      for (i = 0; i < N; i++) {
        a = nodes[i];
        if (!a.k) { a.vx += (a.ax - a.x) * 0.03; a.vy += (a.ay - a.y) * 0.03; }
        else { a.vx += (W / 2 - a.x) * 0.0012; a.vy += (H / 2 - a.y) * 0.0012; }
        dx = a.x - px; dy = a.y - py; d2 = dx * dx + dy * dy;
        if (d2 < 8100 && i !== hover) { d = Math.sqrt(d2) || 1; f = (90 - d) / 90 * (a.k ? 0.3 : 0.1) / d; a.vx += dx * f; a.vy += dy * f; }
        for (j = i + 1; j < N; j++) {
          b = nodes[j]; dx = a.x - b.x; dy = a.y - b.y; d2 = dx * dx + dy * dy;
          if (d2 > 40000) continue;
          if (d2 < 64) d2 = 64;
          f = rep / d2 / Math.sqrt(d2); dx *= f; dy *= f;
          a.vx += dx; a.vy += dy; b.vx -= dx; b.vy -= dy;
        }
      }
      for (i = 0; i < E; i++) {
        e = edges[i]; a = nodes[e[0]]; b = nodes[e[1]];
        dx = b.x - a.x; dy = b.y - a.y; d = Math.sqrt(dx * dx + dy * dy) || 1;
        f = (d - e[2] * S) * 0.012 / d; dx *= f; dy *= f;
        a.vx += dx; a.vy += dy; b.vx -= dx; b.vy -= dy;
      }
      for (i = 0; i < N; i++) {
        a = nodes[i]; a.vx *= 0.86; a.vy *= 0.86; d = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
        if (d > 3) { a.vx *= 3 / d; a.vy *= 3 / d; }
        a.x = Math.max(18, Math.min(W - 18, a.x + a.vx)); a.y = Math.max(18, Math.min(H - 18, a.y + a.vy));
        if (a.x === 18 || a.x === W - 18) a.vx = 0;
        if (a.y === 18 || a.y === H - 18) a.vy = 0;
        m += Math.abs(a.vx) + Math.abs(a.vy);
      }
      return m / N > 0.08;
    }
    function dot(n, r) { ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, TAU); }
    function draw() {
      var i, a, b, e, on, hn = hover >= 0 && nodes[hover], al, x, w;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.lineWidth = 1;
      for (i = 0; i < E; i++) {
        e = edges[i]; a = nodes[e[0]]; b = nodes[e[1]]; on = hn && (e[0] === hover || e[1] === hover);
        ctx.globalAlpha = on ? 0.9 : hn ? 0.15 : 0.6; ctx.strokeStyle = on ? col[0] : col[3];
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.font = MONO; ctx.textBaseline = 'middle';
      for (i = 0; i < N; i++) {
        a = nodes[i]; al = !hn || i === hover || hn.adj[i] ? 1 : 0.25;
        ctx.fillStyle = ctx.strokeStyle = col[a.k]; ctx.globalAlpha = al;
        if (!a.k) {
          ctx.globalAlpha = al * 0.1; dot(a, a.r + 13); ctx.fill();
          ctx.globalAlpha = al * 0.22; dot(a, a.r + 5); ctx.fill();
          ctx.globalAlpha = al; dot(a, a.r); ctx.fill();
          ctx.fillStyle = col[1]; w = ctx.measureText(a.name).width; x = a.x + a.r + 8;
          ctx.fillText(a.name, x + w > W - 6 ? a.x - a.r - 8 - w : x, a.y);
        } else if (a.k === 1) { ctx.lineWidth = 1.5; dot(a, a.r); ctx.stroke(); ctx.lineWidth = 1; }
        else { dot(a, a.r); ctx.fill(); }
        if (i === hover) { ctx.strokeStyle = col[0]; dot(a, a.r + 4); ctx.stroke(); }
      }
      ctx.globalAlpha = 1;
      if (hn && hn.k) {
        w = tip.offsetWidth; x = hn.x + 14;
        tip.style.left = (x + w > W - 4 ? hn.x - 14 - w : x) + 'px'; tip.style.top = (hn.y < 36 ? hn.y + 14 : hn.y - 32) + 'px';
      }
    }
    function frame() { var busy; raf = 0; if (visible) { busy = tick(); draw(); if (busy || hover >= 0) raf = requestAnimationFrame(frame); } }
    function wake() { if (!raf && visible) raf = requestAnimationFrame(frame); }
    function setHover(i) {
      var n = i >= 0 && nodes[i];
      if (i === hover) return;
      hover = i; canvas.style.cursor = n && n.url ? 'pointer' : '';
      if (n && n.k) tip.textContent = n.name;
      tip.className = 'graph-tip' + (n && n.k ? ' is-on' : '');
    }
    function move(e) {
      var r = canvas.getBoundingClientRect(), best = -1, bd = 1e9, i, n, dx, dy, d2;
      px = e.clientX - r.left; py = e.clientY - r.top;
      for (i = 0; i < N; i++) { n = nodes[i]; dx = n.x - px; dy = n.y - py; d2 = dx * dx + dy * dy; if (d2 < (n.r + 7) * (n.r + 7) && d2 < bd) { bd = d2; best = i; } }
      setHover(best); wake();
    }
    function leave() { px = py = -1e4; setHover(-1); wake(); }

    tip.className = 'graph-tip';
    canvas.setAttribute('aria-label', 'Skills graph: disciplines, tools and projects');
    el.appendChild(canvas); el.appendChild(tip);
    color(); size(); place(); draw();
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('click', function () { var n = hover >= 0 && nodes[hover]; if (n && n.url) location.href = n.url; });
    window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { if (el.clientWidth !== W) { size(); wake(); } }, 120); });
    if (window.IntersectionObserver) new IntersectionObserver(function (en) { visible = en[en.length - 1].isIntersecting; if (visible) { color(); wake(); } }, { rootMargin: '160px' }).observe(el);
    else { visible = true; wake(); }
    if (document.fonts && document.fonts.load) document.fonts.load(MONO).then(wake, function () {});
    return function () { color(); wake(); };
  }

  function mq(q) { return !!(window.matchMedia && window.matchMedia(q).matches); }
  function init() {
    var els = document.querySelectorAll('[data-graph]'), i, el;
    for (i = 0; i < els.length; i++) {
      el = els[i];
      if (el.__sg) el.__sg();
      else if (mq('(pointer: coarse)') || mq('(prefers-reduced-motion: reduce)') || !document.createElement('canvas').getContext) { renderList(el, build()); el.__sg = function () {}; }
      else el.__sg = start(el, build());
    }
  }
  window.SkillsGraph = { init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
