/* ==========================================================================
   VS Lens Mart mockups: staff area (admin) shell
   Admin pages don't use site.js: no public header, footer or sticky bar.
   This file inserts the icon set, the top bar, the sidebar (a drawer on
   phones), the "Add frame" button on phones and the mockup controls, then
   wires them. Spec: docs/requirements/Requirements_Admin.md

   Page hooks:
     <body class="adm-body" data-admin="dashboard | frames | camps | branches">  marks the current menu item
     [data-only="admin" | "staff"]  shown only for that role (mockup "View as" switch)
   Pages read window.VSLM_ADMIN (role, user, branch, BRANCHES, DRAFTS, toast, guard).
   Everything here is DUMMY (docs/dummy-data.md C22).
   ========================================================================== */
window.VSLM_ADMIN = (() => {
  /* ---------- Mockup: which role we're viewing as (saved on this device) ---------- */
  const ROLE_KEY = 'vslm-admin-role';
  let role = 'admin';
  try { role = localStorage.getItem(ROLE_KEY) === 'staff' ? 'staff' : 'admin'; } catch (_) {}
  const USERS = {   // DUMMY C22: role and branch only, no real names
    admin: { name: 'Admin', role: 'Admin', branch: 'Indresham' },
    staff: { name: 'Staff 1', role: 'Staff', branch: 'Indresham' },
  };
  const user = USERS[role];
  document.body.dataset.role = role;

  /* ---------- Branches (client change 2026-10-21: admin manages both branches) ----------
     Live: the `branches` table, edited on /admin/branches (admin only). Addresses and the
     Indresham number are real (prescription card); the Patelguda number is DUMMY (D2). */
  const BRANCHES = {
    Indresham: { name: 'Indresham', address: 'Plot No 30/Part Block-B, Citizens Colony, Indresham, Patancheruvu, Sangareddy',
      phone: '9550685417', whatsapp: '9550685417', open: '09:00', close: '21:30', days: 'Monday–Sunday', visible: true },
    Patelguda: { name: 'Patelguda', address: 'Falcon One Shopping Plaza, beside Apollo Pharmacy, Ellenki College, Patelguda',
      phone: '+91 00000 00000', whatsapp: '+91 00000 00000', open: '09:00', close: '21:30', days: 'Monday–Sunday', visible: true, dummy: 'D2' },
  };
  // Admin picks which branch they're working on (saved on this device); staff are fixed to their home branch
  const BRANCH_KEY = 'vslm-admin-branch';
  let branch = user.branch;
  if (role === 'admin') try { const b = localStorage.getItem(BRANCH_KEY); if (BRANCHES[b]) branch = b; } catch (_) {}
  user.branch = branch;
  const time12 = t => { const [h, m] = t.split(':').map(Number); return `${((h + 11) % 12) + 1}${m ? ':' + String(m).padStart(2, '0') : ''} ${h < 12 ? 'AM' : 'PM'}`; };
  const hours = b => `${b.days}, ${time12(b.open)}–${time12(b.close)}`;

  /* ---------- DUMMY drafts (C22). Live: frames with status draft / waiting / sent_back ---------- */
  const DRAFTS = [
    { code: 'VSF-1031', brand: 'Titan', model: 'Aviator Gold', category: 'Eyeglasses', gender: 'Men', colour: 'Gold', shape: 'Aviator', material: 'Metal', size: '55-16-140', price: 3290, where: 'Patelguda',
      status: 'waiting', by: 'Staff 2 · Patelguda', ago: '25 min ago', photos: 3 },
    { code: 'SG-2017', brand: 'Oakley', model: 'Radar EV Path', category: 'Sunglasses', gender: 'Unisex', colour: 'White', shape: 'Wayfarer', material: 'O Matter', size: '138-0-128', price: 9490, where: 'Both branches',
      status: 'waiting', by: 'Staff 3 · Patelguda', ago: '1 hr ago', photos: 4, lens: ['Polarized'], lensColour: 'Grey' },
    { code: 'VSF-1029', brand: 'Fastrack', model: 'Kids Bendable', category: 'Eyeglasses', gender: 'Kids', colour: 'Green', shape: 'Rectangle', material: 'TR90', size: '45-15-125', price: 1190, where: 'Indresham',
      status: 'waiting', by: 'Staff 1 · Indresham', ago: '2 hr ago', photos: 2 },
    { code: 'VSF-1030', brand: 'Vogue Eyewear', model: 'VO5523 Round', category: 'Eyeglasses', gender: 'Women', colour: 'Tortoise', shape: 'Round', material: 'Acetate', size: '50-19-140', price: 4590, where: 'Indresham',
      status: 'sent-back', by: 'Staff 1 · Indresham', ago: 'yesterday', photos: 1, note: 'Please add a side photo and check the price against the tag.' },
  ];
  const STATUS = {
    draft: ['Draft', 'adm-badge--muted'], waiting: ['Waiting for approval', 'adm-badge--gold'],
    'sent-back': ['Sent back', 'adm-badge--alert'], approved: ['Approved', 'adm-badge--ok'],
  };

  const SHELL = String.raw`
<!-- Icon set: authored SVG, one stroke weight (1.75). Shared icons match site.js -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-wa" viewBox="0 0 24 24"><path d="M3.6 20.4l1.2-3.9A8.6 8.6 0 1 1 8 19.3z"/><path d="M9.2 8.3c.2-.5.6-.5.9-.5h.5l1 2.2-.8 1c.5 1.1 1.4 2 2.5 2.5l1-.8 2.2 1v.5c0 .3 0 .7-.5.9-.7.4-1.6.5-2.7 0a8 8 0 0 1-4.3-4.3c-.4-1-.3-1.9.2-2.5z"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path d="M5 4h3.2l1.6 4-2 1.3a10.5 10.5 0 0 0 4.9 4.9l1.3-2 4 1.6V17a2 2 0 0 1-2.2 2A15 15 0 0 1 3 6.2 2 2 0 0 1 5 4z"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></symbol>
  <symbol id="i-camp" viewBox="0 0 24 24"><path d="M3 20h18M12 4L4 20M12 4l8 16M12 13l-3 7M12 13l3 7"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/></symbol>
  <symbol id="i-glasses" viewBox="0 0 48 20"><circle cx="11" cy="11" r="8"/><circle cx="37" cy="11" r="8"/><path d="M19 10c2.5-1.6 7.5-1.6 10 0M3 9L1 5M45 9l2-4"/></symbol>
  <symbol id="i-lens" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M8 9.5a5 5 0 0 1 4-2"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24"><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.3"/></symbol>
  <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></symbol>
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></symbol>
  <!-- Staff area only -->
  <symbol id="i-grid" viewBox="0 0 24 24"><rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/></symbol>
  <symbol id="i-image" viewBox="0 0 24 24"><rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M20.5 16l-5-5-8.5 8.5"/></symbol>
  <symbol id="i-inbox" viewBox="0 0 24 24"><path d="M3.5 13.5l2.5-8h12l2.5 8V19a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 19z"/><path d="M3.5 13.5h5l1.2 2.5h4.6l1.2-2.5h5"/></symbol>
  <symbol id="i-gear" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v2.5M12 18.5V21M3 12h2.5M18.5 12H21M5.6 5.6l1.8 1.8M16.6 16.6l1.8 1.8M5.6 18.4l1.8-1.8M16.6 7.4l1.8-1.8"/></symbol>
  <symbol id="i-plus" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></symbol>
  <symbol id="i-camera" viewBox="0 0 24 24"><path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.3l1.5-2.5h5.4L16.2 7h2.3A1.5 1.5 0 0 1 20 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18z"/><circle cx="12" cy="13" r="3.5"/></symbol>
  <symbol id="i-upload" viewBox="0 0 24 24"><path d="M12 15.5V4M7.5 8.5L12 4l4.5 4.5M4.5 15v3.5A1.5 1.5 0 0 0 6 20h12a1.5 1.5 0 0 0 1.5-1.5V15"/></symbol>
  <symbol id="i-trash" viewBox="0 0 24 24"><path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13M10 11v5.5M14 11v5.5"/></symbol>
  <symbol id="i-check" viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></symbol>
  <symbol id="i-left" viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></symbol>
  <symbol id="i-right" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></symbol>
  <symbol id="i-ext" viewBox="0 0 24 24"><path d="M14 4.5h5.5V10M19.5 4.5L11 13M17 14v4.5A1.5 1.5 0 0 1 15.5 20h-10A1.5 1.5 0 0 1 4 18.5v-10A1.5 1.5 0 0 1 5.5 7H10"/></symbol>
  <symbol id="i-logout" viewBox="0 0 24 24"><path d="M10 4.5H5.5A1.5 1.5 0 0 0 4 6v12a1.5 1.5 0 0 0 1.5 1.5H10M15 8l4 4-4 4M19 12H9.5"/></symbol>
</svg>

<a class="sr-only" href="#main">Skip to content</a>

<header class="adm-top on-dark">
  <button class="icon-btn adm-top__menu" type="button" id="adm-menu" aria-expanded="false" aria-controls="adm-side" aria-label="Menu"><svg class="icon icon--lg"><use href="#i-menu"/></svg></button>
  <a class="brand" href="/admin" aria-label="VS Lens Mart staff area, dashboard">
    <img class="brand__mark" src="assets/logo-placeholder.svg" alt="" width="40" height="40">
    <span class="brand__text">
      <span class="brand__name"><b>VS</b> LENS MART</span>
      <span class="brand__est">STAFF AREA</span>
    </span>
  </a>
  <div class="adm-top__right">
    <span class="adm-user"><span class="adm-user__name">${user.name}</span><span class="adm-badge adm-badge--gold">${user.role}</span><span class="adm-user__branch">${user.branch}</span><span class="todo">DUMMY (C22)</span></span>
    <button class="icon-btn icon-btn--theme" type="button" id="theme-toggle" aria-pressed="false" aria-label="Dark mode">
      <svg class="icon theme-icon--moon"><use href="#i-moon"/></svg><svg class="icon theme-icon--sun"><use href="#i-sun"/></svg>
    </button>
    <a class="icon-btn adm-top__link" href="/"><svg class="icon"><use href="#i-ext"/></svg><span>View site</span></a>
    <button class="icon-btn adm-top__link" type="button" id="sign-out"><svg class="icon"><use href="#i-logout"/></svg><span>Sign out</span></button>
  </div>
</header>
`;

  const n = { frames: role === 'admin' ? DRAFTS.filter(d => d.status === 'waiting' && d.category !== 'Sunglasses').length : 2, sunglasses: role === 'admin' ? 1 : 0, bookings: 6, enquiries: 3 };
  const count = (k, label) => n[k] ? `<span class="adm-count" aria-label="${n[k]} ${label}">${n[k]}</span>` : '';
  const SIDE = String.raw`
<nav class="adm-side" id="adm-side" aria-label="Staff area">
  <a class="btn btn--primary adm-side__add" href="/admin/frames/new"><svg class="icon icon--sm"><use href="#i-plus"/></svg>Add frame</a>
  <div class="adm-branch">
    ${role === 'admin'
      ? `<label class="caps adm-side__label" for="adm-branch">Working on branch</label>
    <select class="adm-select" id="adm-branch">${Object.keys(BRANCHES).map(b => `<option ${b === branch ? 'selected' : ''}>${b}</option>`).join('')}</select>`
      : `<p class="caps adm-side__label">Your branch</p><b>${branch}</b>`}
    <address class="adm-branch__addr"><svg class="icon icon--sm" aria-hidden="true"><use href="#i-pin"/></svg>${BRANCHES[branch].address}</address>
  </div>
  <ul class="adm-nav">
    <li><a href="/admin" data-nav="dashboard"><svg class="icon"><use href="#i-grid"/></svg>Dashboard</a></li>
    <li><a href="/admin/frames" data-nav="frames"><svg class="icon"><use href="#i-glasses"/></svg>Frames${count('frames', role === 'admin' ? 'waiting for approval' : 'drafts to finish')}</a></li>
    <li><a href="/admin/sunglasses" data-nav="sunglasses"><svg class="icon"><use href="#i-sun"/></svg>Sunglasses${count('sunglasses', 'waiting for approval')}</a></li>
    <li><a href="/admin/lenses" data-nav="lenses"><svg class="icon"><use href="#i-lens"/></svg>Lenses</a></li>
    <li><a href="/admin/eye-camps" data-nav="camps"><svg class="icon"><use href="#i-camp"/></svg>Eye camps</a></li>
    <li><a href="/admin/gallery" data-nav="gallery"><svg class="icon"><use href="#i-image"/></svg>Gallery</a></li>
    <li><a href="/admin/testimonials" data-nav="testimonials"><svg class="icon"><use href="#i-star"/></svg>Testimonials</a></li>
    <li><a href="/admin/bookings" data-nav="bookings"><svg class="icon"><use href="#i-cal"/></svg>Bookings${count('bookings', 'today')}</a></li>
    <li><a href="/admin/enquiries" data-nav="enquiries"><svg class="icon"><use href="#i-inbox"/></svg>Enquiries${count('enquiries', 'new')}</a></li>
  </ul>
  <div data-only="admin">
    <p class="caps adm-side__label">Settings</p>
    <ul class="adm-nav">
      <li><a href="/admin/branches" data-nav="branches"><svg class="icon"><use href="#i-pin"/></svg>Branches</a></li>
      <li><a href="/admin/staff" data-nav="staff"><svg class="icon"><use href="#i-gear"/></svg>Staff accounts</a></li>
      <li><a href="/admin/holidays" data-nav="holidays"><svg class="icon"><use href="#i-cal"/></svg>Branch holidays</a></li>
    </ul>
  </div>
</nav>
<div class="adm-scrim" id="adm-scrim" hidden></div>
`;

  const TAIL = String.raw`
<a class="btn btn--primary adm-fab" href="/admin/frames/new"><svg class="icon icon--sm"><use href="#i-plus"/></svg>Add frame</a>
<div class="mock-bar mock-only-keep" role="group" aria-label="Mockup controls">
  <span>Review notes</span>
  <button type="button" id="notes-toggle" aria-pressed="true">On</button>
  <span class="adm-mock-sep" aria-hidden="true"></span>
  <span id="view-as-label">View as</span>
  <span class="adm-seg" role="group" aria-labelledby="view-as-label">
    <button type="button" data-view-as="staff" aria-pressed="${role === 'staff'}">Staff</button>
    <button type="button" data-view-as="admin" aria-pressed="${role === 'admin'}">Admin</button>
  </span>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
`;

  document.body.insertAdjacentHTML('afterbegin', SHELL);
  const main = document.getElementById('main');
  const wrap = document.createElement('div');
  wrap.className = 'adm';
  main.before(wrap);
  wrap.insertAdjacentHTML('afterbegin', SIDE);
  wrap.append(main);
  document.body.insertAdjacentHTML('beforeend', TAIL);
  document.querySelector(`[data-nav="${document.body.dataset.admin}"]`)?.setAttribute('aria-current', 'page');

  /* ---------- Toast ---------- */
  const t = document.getElementById('toast');
  let toastTimer;
  function toast(html, ms = 2600) {
    t.innerHTML = html; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), ms);
  }

  /* ---------- Light / dark mode (same rule and storage key as the public site) ---------- */
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : systemDark.matches;
  const paintTheme = () => {
    themeBtn.setAttribute('aria-pressed', String(isDark()));
    themeBtn.title = isDark() ? 'Switch to light mode' : 'Switch to dark mode';
  };
  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('vslm-theme', next); } catch (_) {}
    paintTheme();
  });
  systemDark.addEventListener('change', paintTheme);
  paintTheme();

  /* ---------- Phone: the sidebar is a drawer ---------- */
  const side = document.getElementById('adm-side'), scrim = document.getElementById('adm-scrim'), menuBtn = document.getElementById('adm-menu');
  // Closed drawer is inert on phones, so keyboard and screen readers skip it
  const phone = matchMedia('(max-width: 1023px)');
  const syncInert = () => { side.inert = phone.matches && !side.classList.contains('is-open'); };
  phone.addEventListener('change', syncInert);
  syncInert();
  function setMenu(open) {
    side.classList.toggle('is-open', open);
    syncInert();
    scrim.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    if (open) side.querySelector('a').focus(); else menuBtn.focus();
  }
  menuBtn.addEventListener('click', () => setMenu(!side.classList.contains('is-open')));
  scrim.addEventListener('click', () => setMenu(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && side.classList.contains('is-open')) setMenu(false); });

  /* ---------- Mockup controls ---------- */
  const notesBtn = document.getElementById('notes-toggle');
  notesBtn.addEventListener('click', () => {
    const off = document.body.classList.toggle('notes-off');
    notesBtn.textContent = off ? 'Off' : 'On';
    notesBtn.setAttribute('aria-pressed', String(!off));
  });
  document.querySelectorAll('[data-view-as]').forEach(b => b.addEventListener('click', () => {
    if (b.dataset.viewAs === role) return;
    try { localStorage.setItem(ROLE_KEY, b.dataset.viewAs); } catch (_) {}
    api.leave(() => location.reload());
  }));
  document.getElementById('adm-branch')?.addEventListener('change', e => {
    try { localStorage.setItem(BRANCH_KEY, e.target.value); } catch (_) {}
    api.leave(() => location.reload(), () => { e.target.value = branch; });
  });
  document.getElementById('sign-out').addEventListener('click', () =>
    toast('Signs out and goes to <code>/admin/login</code> (not mocked up)'));

  /* ---------- Mockup only: where links go ---------- */
  // Live route → mockup file. Frame codes open the frame form (review or edit).
  function mockFile(path) {
    if (path === '/admin') return 'admin.html';
    if (path === '/admin/frames/new') return 'admin-frame.html';
    if (path === '/admin/sunglasses/new') return 'admin-frame.html?category=sunglasses';
    if (path === '/admin/branches') return 'admin-branches.html';
    if (path === '/admin/eye-camps') return 'admin-camps.html';
    if (path === '/admin/eye-camps/new') return 'admin-camps.html?camp=new';
    const camp = path.match(/^\/admin\/eye-camps\/([a-z0-9-]+)$/);
    if (camp) return `admin-camps.html?camp=${camp[1]}`;
    const m = path.match(/^\/admin\/(?:frames|sunglasses)\/([A-Z]{2,3}-\d{4})$/);
    if (m) return `admin-frame.html?id=${m[1]}`;
    if (path === '/') return 'home.html';
    const pub = path.match(/^\/(?:frames|sunglasses)\/(.+)$/);   // public frame page
    if (pub) return `frame-detail.html?frame=${pub[1]}`;
    return null;
  }
  document.addEventListener('click', e => {
    const d = e.target.closest('a[data-dummy]');
    if (d) { e.preventDefault(); return toast('Customer number is <code>DUMMY</code> (C22). Live: calls or opens WhatsApp'); }
    const a = e.target.closest('a[href^="/"]');
    if (!a) return;
    e.preventDefault();
    if (side.classList.contains('is-open')) setMenu(false);
    const href = a.getAttribute('href');
    const file = mockFile(href.split('#')[0]);
    if (!file) return toast(`Goes to <code>${href}</code> (not mocked up)`);
    api.leave(() => { location.href = file; });
  });

  const api = {
    role, user, branch, BRANCHES, hours, time12, DRAFTS, STATUS, toast,
    badge: s => `<span class="adm-badge ${STATUS[s][1]}">${STATUS[s][0]}</span>`,
    // A page with unsaved changes sets guard(go, stay): it may ask first, then call go() or stay()
    guard: null,
    leave(go, stay = () => {}) { if (api.guard) api.guard(go, stay); else go(); },
  };
  return api;
})();
