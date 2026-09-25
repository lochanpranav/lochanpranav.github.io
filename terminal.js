/* Terminal: the site's command palette. Plain ES5, no dependencies, builds its own DOM.
   Open: [data-terminal-open], Cmd/Ctrl+K or window.Terminal.open(). Close: Esc, the backdrop or [data-terminal-close].
   What it says about Lochan comes from the resume facts sheet; anything else gets "I don't know" and the email. */
(function () {
  if (window.Terminal) return;
  var doc = document, cs = doc.currentScript, base = cs && cs.src ? cs.src.replace(/terminal\.js(\?.*)?$/, '') : '';
  var reduce = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var EMAIL = 'lm5677@nyu.edu';
  var SOCIAL = [['LinkedIn', 'https://www.linkedin.com/in/lochanpranav'], ['GitHub', 'https://github.com/lochanpranav'], ['Behance', 'https://www.behance.net/lochanpranav'], ['Dribbble', 'https://dribbble.com/LochanPranav']];
  var CAT = { gis: 'GIS', ui: 'UI/UX', brand: 'Brand', product: 'Product' };
  /* [category, title, page slug, one line] in site order */
  var P = [
    ['gis', 'Tulsa Event Monitor', 'tulsa-event-monitor', 'Civic mapping tool for the City of Tulsa Auditor\'s Office: community events from three platforms on 493 geocoded venues. 2025.'],
    ['gis', 'MTA bus electrification', 'bus-electrification', 'GIS workflow finding where terrain cuts electric bus range in Manhattan and the Bronx, then siting five charging stations. 2026.'],
    ['gis', 'Hospital accessibility, Miami-Dade', 'hospital-accessibility', 'Network analysis of hospital drive times: 1,809,369 residents live beyond 7 minutes. 2026.'],
    ['gis', 'The economics of proximity', 'economics-of-proximity', 'Why do New Yorkers value time over money? HUD affordability index by census tract against the subway. 2025.'],
    ['ui', 'Sarathi license portal', 'sarathi', 'India\'s learner\'s license application cut from seven scattered steps to one guided flow. UX case study, 2022.'],
    ['ui', 'SAVOR', 'savor', 'Food surplus app: restaurants post leftovers, volunteers deliver them to donation spots. Mobile app, 2024.'],
    ['ui', 'SUII suitcase rental', 'suii', 'Rent rarely used travel gear instead of buying it. Mobile app concept, 2022.'],
    ['ui', 'Mighty', 'mighty', 'Information architecture and visual system for an investment guidance platform. Client work, web and app.'],
    ['ui', 'Saginaw Tattoo', 'saginaw', 'Dark, editorial website concept for a tattoo studio, built on black-and-white photography.'],
    ['ui', 'Spar Agrotech', 'spar-website', 'Website and identity for a women-led farmer producer company in Pune. 2023.'],
    ['brand', 'Address Masters', 'address-masters-dashboard', 'Six months as the designer at a Bangalore real estate startup: analytics dashboard, component library, campaigns, two films. 2024.'],
    ['brand', 'SNN Estates Felicity', 'snn-felicity', 'Campaign system: interior photography, property ads and an amenity series for a Bengaluru development. 2024.'],
    ['brand', 'Visista OKAS', 'visista-okas', 'Campaign system: property ads, lifestyle creatives and a biophilic positioning series for a luxury development. 2024.'],
    ['product', 'Filter coffee maker', 'coffee-maker', 'A modern brewer that keeps the ritual of South Indian filter coffee, tested as a foam model. Appliance.'],
    ['product', 'Saffron oil bottle', 'saffron-oil-bottle', 'Form and color from the saffron bud, with a cap that cannot get lost. Packaging.'],
    ['product', 'Earpods packaging', 'earpods-packaging', 'A sliding case that opens without tearing, in four gradient variants. Packaging.'],
    ['product', 'Tesla perfume bottle', 'tesla-perfume', 'A faceted glass bottle with a polished cap, for a brand that does not sell perfume yet. Packaging.'],
    ['product', 'Home decor store', 'home-decor-store', 'A 6 by 9 meter store laid out so the whole range is visible from the sofa. Retail design.'],
    ['product', 'Sustainable shoes', 'sustainable-shoes', 'Cork soles, post-consumer cotton uppers and organic cotton laces, prototyped by hand. Eco design.'],
    ['product', 'Tree bookshelf', 'tree-bookshelf', 'A dado-jointed wooden shelf sized from anthropometric data. Furniture.']
  ];
  var ABOUT = [
    'Lochan Pranav Mohanasundar: spatial data scientist and product designer in Brooklyn, NY.',
    'M.S. Urban Data Science at NYU Tandon (CUSP), expected May 2027. Before that, B.Des Product Design at MIT World Peace University, Pune, 2024.',
    'A product designer who became a data scientist and still works as both: maps and interfaces at once, where something is, who it affects, and what a person needs to see to act on it.'
  ];
  var EDU = [
    'NYU Tandon School of Engineering, Brooklyn: M.S. Urban Data Science, Center for Urban Science and Progress (CUSP), Aug 2025 to May 2027 (expected). GPA 3.77 / 4.0.',
    'MIT World Peace University, Pune: B.Des Product Design, Jun 2020 to Jun 2024. GPA 9.0 / 10.',
    'Certifications: Google UX Design (2024); Esri ArcGIS Pro: Fundamentals of GIS.',
    'Honors: CUSP Rising Scholar Scholarship; NYU CUSP Scholarship.'
  ];
  var SKILLS = [
    ['data and gis: ', 'ArcGIS Pro (Spatial Analyst, Network Analyst, Location-Allocation, hot spot analysis), ArcGIS Online, StoryMaps, cartography, GeoPandas, Python (pandas, NumPy, scikit-learn, Matplotlib), SQL, R'],
    ['product and ux: ', 'Figma, prototyping, usability testing, design systems and component libraries, UX research, information architecture, wireframing'],
    ['visual and industrial: ', 'Photoshop, Illustrator, InDesign, Rhino, Fusion 360, SolidWorks, KeyShot, Blender, hand sketching, model making, photography, video editing'],
    ['building: ', 'Streamlit, REST APIs (Google Places, Eventbrite), HTML, CSS, JavaScript (basic), Git and GitHub. Currently learning LLM tool use and MCP.'],
    ['languages: ', 'English, Hindi, Tamil, Japanese']
  ];
  var EXP = [
    [0, 'Graduate Research Assistant, City of Tulsa Auditor\'s Office through NYU CUSP. Aug to Dec 2025.', 'Analyzed geospatial and demographic data to identify underserved neighborhoods across Tulsa; designed and prototyped the Event Monitor, a mapping tool of community events on 493 geocoded venues (Python, Streamlit, Google Places and Eventbrite APIs, Figma); presented recommendations to city stakeholders.'],
    [10, 'Graphic Designer (Product and UX Design), Address Masters, Bangalore. Jan to Jun 2024.', '12+ product workflows and 40+ UI screens for an AI-driven analytics dashboard; usability tests with 18 users, task efficiency up 32%; a component library that cut iteration time 25%; 200+ marketing creatives, 1,000+ qualified buyer inquiries.']
  ];
  var AVAIL = 'Part-time work now, internships in summer 2027, full-time roles from June 2027.';
  var WHERE = 'Brooklyn, NY (40.68° N, 73.94° W). Studied in Pune, India, worked in Bangalore, and moved to Brooklyn in 2025 for NYU.';
  var HELP = [['help', 'this list'], ['about', 'who he is'], ['work', 'all 20 projects'], ['gis, uiux, brand, products', 'by category'], ['open <number or title>', 'a project page'], ['goto <section>', 'index, gis, uiux, brand, products, about, contact, top'], ['skills', 'grouped tools'], ['education', 'degrees and certifications'], ['experience', 'Tulsa, Address Masters'], ['contact', 'email and links'], ['resume', 'the PDF, new tab'], ['theme <dark|light|auto>', 'the palette'], ['time', 'in Brooklyn'], ['whoami', 'you'], ['clear', 'wipe'], ['exit', 'close']];
  var NAMES = 'help about work projects gis uiux brand products open goto skills education experience contact resume theme time whoami clear exit'.split(' ');
  var SECTION = { index: 'index', work: 'index', gis: 'gis', uiux: 'uiux', brand: 'campaigns', products: 'industrial', about: 'about', contact: 'contact', top: 'top' };
  var STOP = ' the and for with from that this what who are you your how does his has have can about into not but where when which was were will would could there their they them than any some all use used ';
  var root, panel, out, input, opener, isOpen = false, hist = [], hIdx = 0, draft = '', timer = 0;

  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function el(tag, cls, text) { var n = doc.createElement(tag); if (cls) n.className = cls; if (text) n.textContent = text; return n; }
  function attrs(n, a) { for (var k in a) if (has(a, k)) n.setAttribute(k, a[k]); return n; }
  function link(text, url, ext) { var a = el('a', '', text); a.href = url; if (ext) { a.target = '_blank'; a.rel = 'noopener'; } return a; }
  function mail() { return link(EMAIL, 'mailto:' + EMAIL); }
  /* Lines are text nodes and elements, never markup, so typed input stays text */
  function print(parts, cls) {
    var l = el('div', 'term-line' + (cls ? ' ' + cls : '')), i;
    if (!Array.isArray(parts)) parts = [parts];
    for (i = 0; i < parts.length; i++) l.appendChild(typeof parts[i] === 'string' ? doc.createTextNode(parts[i]) : parts[i]);
    out.appendChild(l);
    return l;
  }
  function lines(a) { for (var i = 0; i < a.length; i++) print(a[i]); }
  function href(i) { return base + 'work/' + P[i][2] + '.html'; }
  function list(idx) {
    for (var i = 0, n; i < idx.length; i++) { n = idx[i]; print([el('span', 'n', (n < 9 ? '0' : '') + (n + 1)), el('span', 'c', CAT[P[n][0]]), link(P[n][1], href(n))]); }
  }
  function byCat(c) { var r = [], i; for (i = 0; i < P.length; i++) if (!c || P[i][0] === c) r.push(i); return r; }

  var CMDS = {
    help: function () {
      for (var i = 0; i < HELP.length; i++) print([el('span', 'cmd', HELP[i][0]), HELP[i][1]]);
      print('anything else searches the projects, then tries to answer. up and down recall history, tab completes.', 'dim');
    },
    about: function () { lines(ABOUT); },
    work: function () { list(byCat()); },
    gis: function () { list(byCat('gis')); },
    uiux: function () { list(byCat('ui')); },
    brand: function () { list(byCat('brand')); },
    products: function () { list(byCat('product')); },
    open: function (arg) {
      var m = [], i, low = arg.toLowerCase();
      if (!arg) return print('usage: open <number or part of a title>', 'dim');
      if (/^\d+$/.test(arg)) { if (arg > 0 && arg <= P.length) m = [arg - 1]; }
      else for (i = 0; i < P.length; i++) if (P[i][1].toLowerCase().indexOf(low) !== -1) m.push(i);
      if (m.length === 1) { print('opening ' + P[m[0]][1] + '…'); location.href = href(m[0]); }
      else if (m.length) { print('several match, pick a number:', 'dim'); list(m); }
      else print('no project called "' + arg + '". try work for the list.', 'dim');
    },
    goto: function (arg) {
      var key = arg.toLowerCase(), id = has(SECTION, key) && SECTION[key], t = id && doc.getElementById(id);
      if (!id) return print('usage: goto index|gis|uiux|brand|products|about|contact|top', 'dim');
      if (!t) { location.href = base + 'index.html#' + id; return; }
      print('→ ' + key);
      close();
      t.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    },
    skills: function () { for (var i = 0; i < SKILLS.length; i++) print([el('span', 'k', SKILLS[i][0]), SKILLS[i][1]]); },
    education: function () { lines(EDU); },
    experience: function () {
      for (var i = 0, e; i < EXP.length; i++) { e = EXP[i]; print([e[1] + ' ', link('→ ' + P[e[0]][1], href(e[0]))], 'hd'); print(e[2]); }
    },
    contact: function () {
      var parts = [], i;
      print(['email ', mail()]);
      for (i = 0; i < SOCIAL.length; i++) { if (i) parts.push('  ·  '); parts.push(link(SOCIAL[i][0], SOCIAL[i][1], true)); }
      print(parts);
      print(AVAIL, 'dim');
    },
    resume: function () {
      var u = base + 'assets/Lochan_Pranav_Resume.pdf';
      print(['opening the resume in a new tab: ', link('Lochan_Pranav_Resume.pdf', u, true)]);
      window.open(u, '_blank', 'noopener');
    },
    theme: function (arg) {
      var v = arg.toLowerCase();
      if (!/^(dark|light|auto)$/.test(v)) return print('usage: theme dark|light|auto', 'dim');
      if (typeof window.setTheme === 'function') { window.setTheme(v); print('theme: ' + v); }
      else print('this page has no theme switch.', 'dim');
    },
    time: function () {
      var t;
      try { t = new Intl.DateTimeFormat('en-US', { weekday: 'short', hour: 'numeric', minute: '2-digit', timeZoneName: 'short', timeZone: 'America/New_York' }).format(new Date()); }
      catch (e) { t = new Date().toLocaleTimeString(); }
      print(t + ' in Brooklyn.');
    },
    whoami: function () { print('guest. you found the terminal, which most visitors do not. hello from Brooklyn.'); },
    clear: function () { out.textContent = ''; },
    exit: function () { close(); },
    coffee: function () { print(['filter coffee, the South Indian kind: decoction, hot milk, poured between two tumblers until it foams. Lochan designed a brewer that keeps the ritual: ', link('Filter coffee maker', href(13)), '.']); },
    map: function () { print('40.68° N, 73.94° W. Brooklyn, NY. goto top shows it on the page.'); },
    sudo: function (arg) { if (/^hire\s+lochan\b/i.test(arg)) print(['permission granted. ', mail()]); else print('sudo: permission denied. try: sudo hire lochan', 'dim'); },
    konami: function () { print('wrong terminal.'); }
  };
  CMDS.projects = CMDS.work;

  /* Free text: words of three letters or more, minus stopwords, matched as prefixes against title and description */
  function search(s) {
    var words = s.replace(/[^a-z0-9\s-]/g, ' ').split(/\s+/), hits = [], i, j, w, n;
    for (i = 0; i < P.length; i++) {
      for (j = 0, n = 0; j < words.length; j++) {
        w = words[j];
        if (w.length < 3 || STOP.indexOf(' ' + w + ' ') !== -1) continue;
        if (new RegExp('\\b' + (w.length > 3 ? w.replace(/s$/, '') : w)).test((P[i][1] + ' ' + P[i][3]).toLowerCase())) n++;
      }
      if (n) hits.push([n, i]);
    }
    hits.sort(function (a, b) { return b[0] - a[0] || a[1] - b[1]; });
    for (i = 0; i < hits.length; i++) hits[i] = hits[i][1];
    return hits.slice(0, 5);
  }
  var INTENTS = [
    ['email,contact,reach,mail,linkedin,github,behance,dribbble,phone', CMDS.contact],
    ['experience,worked,working,employ,career,history,past,previous,tulsa,address masters', CMDS.experience],
    ['school,study,studied,student,nyu,degree,gpa,universit,college,master,education,cusp,tandon,course,graduat', CMDS.education],
    ['tools,stack,software,program,coding,tech,python,arcgis,figma,skill', CMDS.skills],
    ['speak,spoken,language,hindi,tamil,japanese,english', function () { print('English, Hindi, Tamil and Japanese. For programming languages, try skills.'); }],
    ['available,availab,hire,hiring,job,intern,freelance,open to,full-time,full time,part-time,part time,position,role,opportunit', function () { print([AVAIL + ' Email ', mail(), '.']); }],
    ['where,location,located,based, live, city,brooklyn,new york,nyc', function () { print(WHERE); }],
    ['what do you do,who are you,who is,who\'s,what is this,yourself,lochan,what are you,do you do,introduce', CMDS.about]
  ];
  function intent(s) {
    var i, j, k;
    for (i = 0; i < INTENTS.length; i++) for (j = 0, k = INTENTS[i][0].split(','); j < k.length; j++) if (s.indexOf(k[j]) !== -1) { INTENTS[i][1](); return true; }
    return false;
  }
  function fallback(s) {
    var low = s.toLowerCase(), q = /^(what|who|where|how|which|when|why|are|do|does|is|can|will|tell)\b|\?$/.test(low), m;
    if (q && intent(low)) return;
    m = search(low);
    if (m.length) { print('projects matching "' + s + '":', 'dim'); list(m); return; }
    if (!q && intent(low)) return;
    print(['I don\'t know that one. Try help, or ask Lochan: ', mail(), '.'], 'dim');
  }

  function run(s) {
    var sp, name, arg, echo;
    s = String(s).trim();
    if (!s) return;
    echo = print([el('span', 'ps', '>_ '), s], 'echo');
    sp = s.indexOf(' ');
    name = (sp < 0 ? s : s.slice(0, sp)).toLowerCase();
    arg = sp < 0 ? '' : s.slice(sp + 1).trim();
    if (has(CMDS, name)) CMDS[name](arg); else fallback(s);
    out.scrollTop = echo.offsetTop - out.offsetTop - 8;
  }
  function onSubmit(e) {
    var s = input.value.trim();
    e.preventDefault();
    input.value = '';
    if (s && hist[hist.length - 1] !== s) hist.push(s);
    if (hist.length > 50) hist.shift();
    hIdx = hist.length; draft = '';
    run(s);
  }
  function onKey(e) {
    var k = e.key;
    if ((k === 'ArrowUp' || k === 'ArrowDown') && hist.length) {
      e.preventDefault();
      if (hIdx === hist.length) draft = input.value;
      hIdx = k === 'ArrowUp' ? Math.max(0, hIdx - 1) : Math.min(hist.length, hIdx + 1);
      input.value = hIdx === hist.length ? draft : hist[hIdx];
    } else if (k === 'Tab' && !e.shiftKey) { e.preventDefault(); complete(); }
  }
  function complete() {
    var v = input.value.trim().toLowerCase(), m = [], i;
    if (v.indexOf(' ') !== -1) return;
    for (i = 0; i < NAMES.length; i++) if (NAMES[i].indexOf(v) === 0) m.push(NAMES[i]);
    if (m.length === 1) input.value = m[0] + (/^(open|goto|theme)$/.test(m[0]) ? ' ' : '');
    else if (m.length) { print(m.join('  '), 'dim'); out.scrollTop = out.scrollHeight; }
  }
  /* Tab stays inside the panel; the input handles its own Tab first (completion) */
  function trap(e) {
    if (e.key !== 'Tab' || e.defaultPrevented) return;
    var f = panel.querySelectorAll('button, a[href], input'), first = f[0], last = f[f.length - 1];
    if (e.shiftKey && e.target === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && e.target === last) { e.preventDefault(); first.focus(); }
  }
  function inert(on) {
    var b = doc.querySelectorAll('.topbar, header, main'), i;
    for (i = 0; i < b.length; i++) if (on) b[i].setAttribute('inert', ''); else b[i].removeAttribute('inert');
  }

  function build() {
    if (root || !doc.body) return;
    var bd = el('div', 'term-backdrop'), head = el('div', 'term-head'), form = el('form', 'term-row'), ps = el('label', '', '>_'), i;
    var x = attrs(el('button', '', 'esc'), { type: 'button', 'data-terminal-close': '', 'aria-label': 'Close the terminal' });
    root = el('div', 'term-root'); root.hidden = true;
    panel = attrs(el('div', 'term'), { role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Terminal' });
    out = attrs(el('div', 'term-out'), { role: 'log', 'aria-live': 'polite' });
    input = attrs(el('input'), { type: 'text', id: 'term-input', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'aria-label': 'Command' });
    ps.htmlFor = 'term-input';
    for (i = 0; i < 3; i++) head.appendChild(el('i'));
    head.appendChild(el('span', '', 'terminal')); head.appendChild(x);
    form.appendChild(ps); form.appendChild(input);
    panel.appendChild(head); panel.appendChild(out); panel.appendChild(form);
    root.appendChild(bd); root.appendChild(panel);
    doc.body.appendChild(root);
    bd.addEventListener('click', close);
    form.addEventListener('submit', onSubmit);
    input.addEventListener('keydown', onKey);
    panel.addEventListener('keydown', trap);
  }
  function open(from) {
    build();
    if (!root) return;
    if (isOpen) { input.focus(); return; }
    isOpen = true;
    opener = from && from.nodeType === 1 ? from : doc.activeElement;
    clearTimeout(timer);
    root.hidden = false;
    void root.offsetWidth;
    root.className = 'term-root is-open';
    inert(true);
    if (out.childNodes.length) print('', 'gap');
    print('lochan@brooklyn ~ $', 'hd');
    print('type help to see what this can do.', 'dim');
    out.scrollTop = out.scrollHeight;
    input.focus();
  }
  function close() {
    var o = opener;
    if (!isOpen) return;
    isOpen = false; opener = null;
    root.className = 'term-root';
    inert(false);
    timer = setTimeout(function () { root.hidden = true; }, reduce ? 0 : 260);
    if (o && o !== doc.body && o.focus) { try { o.focus({ preventScroll: true }); } catch (e) { o.focus(); } }
  }

  doc.addEventListener('keydown', function (e) {
    var tag = e.target && e.target.tagName;
    if ((e.metaKey || e.ctrlKey) && !e.altKey && !e.shiftKey && (e.key === 'k' || e.key === 'K')) {
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault(); open();
    } else if (e.key === 'Escape' && isOpen) { e.preventDefault(); close(); }
  });
  doc.addEventListener('click', function (e) {
    var t = e.target, o = t.closest && t.closest('[data-terminal-open]');
    if (o) { e.preventDefault(); open(o); }
    else if (t.closest && t.closest('[data-terminal-close]')) { e.preventDefault(); close(); }
  });
  if (doc.body) build(); else doc.addEventListener('DOMContentLoaded', build);
  window.Terminal = { open: open, close: close, toggle: function () { if (isOpen) close(); else open(); }, run: function (s) { open(); if (isOpen) run(s); } };
})();
