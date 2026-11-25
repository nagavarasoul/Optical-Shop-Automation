/* ==========================================================================
   VS Lens Mart mockups: shared listing (filters, sort, saved, load more)
   Used by frames.html and sunglasses.html. Spec: Requirements_Frames.md
   section 3 and Requirements_Sunglasses.md section 3. Live: the same filters
   run as a database query on approved, active rows.

   VSLM_LISTING({
     items,        // the rows this page lists
     groups,       // filter keys, in order: gender, category, lens, brand, price, colour, shape
     tiers,        // mega-menu ?tier= -> price bands
     noun(n), plural, filterNote
   })
   ========================================================================== */
window.VSLM_LISTING = cfg => {
  const ALL = cfg.items;
  const PAGE = 24;
  const slug = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  // Options come only from the items on this page (array fields such as lens type are flattened)
  const uniq = key => [...new Set(ALL.flatMap(f => [].concat(f[key])))].sort();

  const PRICES = [
    { id: '0-999', label: 'Under ₹1,000', min: 0, max: 999 },
    { id: '1000-2999', label: '₹1,000–2,999', min: 1000, max: 2999 },
    { id: '3000-4999', label: '₹3,000–4,999', min: 3000, max: 4999 },
    { id: '5000+', label: '₹5,000 and above', min: 5000, max: Infinity },
  ];
  // Swatches show the product's colour, so these are content colours, not design tokens
  const SWATCH = { Black: '#1A1A1A', Blue: '#2F5FA8', Brown: '#6B4426', Burgundy: '#6D1F2F', Gold: '#C9A227', Gunmetal: '#4A4F57',
    Pink: '#E7A3B8', Red: '#B03030', Silver: '#C0C4C8', Tortoise: '#7A4A24', Transparent: '#EEF2F4', White: '#F4F4F2' };

  // Every filter a listing can use. `param` is the URL key; values are slugs. Each page lists its groups in cfg.groups.
  const GROUP_DEFS = {
    gender: { param: 'for', legend: 'Gender', options: ['Men', 'Women', 'Unisex', 'Kids'] },
    category: { param: 'category', legend: 'Category' },
    lens: { param: 'lens', legend: 'Lens type', order: ['Polarized', 'UV protection', 'Tinted', 'Power sunglasses'] },
    brand: { param: 'brand', legend: 'Brand' },
    price: { param: 'price', legend: 'Price', options: PRICES.map(p => p.id), label: id => PRICES.find(p => p.id === id).label },
    colour: { param: 'colour', legend: 'Colour', swatch: true },
    shape: { param: 'shape', legend: 'Shape' },
  };
  // A fixed `order` (e.g. the mega menu's lens types) keeps that order but still lists only values in stock
  const ordered = (key, order) => order ? order.filter(o => uniq(key).includes(o)) : uniq(key);
  const GROUPS = cfg.groups.map(key => ({ key, ...GROUP_DEFS[key], options: GROUP_DEFS[key].options || ordered(key, GROUP_DEFS[key].order) }));

  const matchOne = (g, f, v) => g.key === 'price'
    ? (p => f.price >= p.min && f.price <= p.max)(PRICES.find(p => p.id === v))
    : [].concat(f[g.key]).includes(v);

  /* ---------- State <-> URL ---------- */
  const state = { sel: {}, stock: false, saved: false, sort: 'new', shown: PAGE };
  GROUPS.forEach(g => state.sel[g.key] = []);

  function readURL() {
    const q = new URLSearchParams(location.search);
    GROUPS.forEach(g => {
      const wanted = (q.get(g.param) || '').split(',').filter(Boolean);
      state.sel[g.key] = g.options.filter(o => wanted.includes(slug(o)));
    });
    // Mega-menu price tiers (DUMMY tier names) map onto the price bands
    const tier = cfg.tiers?.[q.get('tier')];
    if (tier) state.sel.price = tier;
    state.stock = q.get('stock') === '1';
    state.saved = q.get('saved') === '1';
    state.sort = ['new', 'price-asc', 'price-desc'].includes(q.get('sort')) ? q.get('sort') : 'new';
  }
  function writeURL() {
    const q = new URLSearchParams();
    GROUPS.forEach(g => { if (state.sel[g.key].length) q.set(g.param, state.sel[g.key].map(slug).join(',')); });
    if (state.stock) q.set('stock', '1');
    if (state.saved) q.set('saved', '1');
    if (state.sort !== 'new') q.set('sort', state.sort);
    const s = q.toString().replace(/%2C/g, ',');
    try { history.replaceState(null, '', s ? `?${s}` : location.pathname); } catch (_) {}
  }

  /* ---------- Matching ---------- */
  function passes(f, skipKey) {
    if (state.stock && f.sold) return false;
    if (state.saved && !VSLM.getFavs().includes(f.code)) return false;
    return GROUPS.every(g => g.key === skipKey || !state.sel[g.key].length || state.sel[g.key].some(v => matchOne(g, f, v)));
  }
  function results() {
    const list = ALL.filter(f => passes(f));
    const order = f => ALL.indexOf(f);
    const by = { 'new': (a, b) => order(a) - order(b), 'price-asc': (a, b) => a.price - b.price, 'price-desc': (a, b) => b.price - a.price }[state.sort];
    return list.sort((a, b) => (a.sold - b.sold) || by(a, b));   // sold out always last
  }

  /* ---------- Filters UI ---------- */
  const groupsEl = document.getElementById('filter-groups');
  groupsEl.innerHTML = GROUPS.map(g => `
    <fieldset class="fgroup">
      <legend>${g.legend}</legend>
      ${g.options.map(o => `
        <label class="fopt">
          <input type="checkbox" data-group="${g.key}" value="${o}">
          ${g.swatch ? `<span class="swatch" style="background:${SWATCH[o] || '#ccc'}"></span>` : ''}
          <span>${g.label ? g.label(o) : o}</span>
          <span class="fopt__count" data-count="${g.key}|${o}"></span>
        </label>`).join('')}
    </fieldset>`).join('') + `
    <fieldset class="fgroup">
      <legend>Availability</legend>
      <label class="fswitch">In stock only <input type="checkbox" id="stock"></label>
    </fieldset>
    <p class="mock-only" style="margin-top:12px"><span class="todo">${cfg.filterNote}</span></p>`;

  function renderFilters() {
    GROUPS.forEach(g => g.options.forEach(o => {
      const input = groupsEl.querySelector(`input[data-group="${g.key}"][value="${o}"]`);
      const n = ALL.filter(f => passes(f, g.key) && matchOne(g, f, o)).length;
      const checked = state.sel[g.key].includes(o);
      input.checked = checked;
      input.disabled = !n && !checked;
      input.closest('.fopt').classList.toggle('is-empty', !n && !checked);
      groupsEl.querySelector(`[data-count="${g.key}|${o}"]`).textContent = n;
    }));
    document.getElementById('stock').checked = state.stock;
    document.querySelectorAll('[data-quick]').forEach(b => b.setAttribute('aria-pressed', String(state.sel.gender.includes(b.dataset.quick))));
  }

  /* ---------- Results UI ---------- */
  const grid = document.getElementById('grid');
  const foot = document.getElementById('results-foot');
  const empty = document.getElementById('empty');
  function render() {
    const list = results();
    const favs = VSLM.getFavs();
    const n = list.length;
    document.getElementById('count').textContent = `${cfg.noun(n)}`;
    document.getElementById('filters-apply').textContent = `Show ${cfg.noun(n)}`;

    grid.innerHTML = list.slice(0, state.shown).map(f => VSLM.card(f, favs)).join('');
    grid.hidden = !n;
    empty.hidden = !!n;
    empty.className = n ? '' : 'empty';
    empty.innerHTML = n ? '' : `
      <svg class="icon" aria-hidden="true"><use href="#i-glasses"/></svg>
      <h2>No ${cfg.plural} match these filters</h2>
      <p>We may still have it in store. Clear a filter, or ask us on WhatsApp.</p>
      <div class="empty__actions">
        <button class="btn btn--outline-dark" type="button" data-clear>Clear filters</button>
        <button class="btn btn--primary" type="button" data-picker="whatsapp" aria-haspopup="true" aria-expanded="false" aria-controls="picker">Ask on WhatsApp</button>
      </div>`;
    const shown = Math.min(state.shown, n);
    foot.innerHTML = n ? `<span>Showing ${shown} of ${n}</span>${shown < n ? '<button class="btn btn--outline-dark" type="button" id="more">Load more</button>' : ''}` : '';

    // Active filter chips
    const chips = [];
    GROUPS.forEach(g => state.sel[g.key].forEach(v => chips.push({ g: g.key, v, text: g.label ? g.label(v) : v })));
    if (state.stock) chips.push({ g: 'stock', v: '', text: 'In stock only' });
    document.getElementById('active-chips').innerHTML = chips.map(c =>
      `<button class="active-chip" type="button" data-remove="${c.g}|${c.v}" aria-label="Remove filter: ${c.text}">${c.text}<svg class="icon"><use href="#i-x"/></svg></button>`).join('')
      + (chips.length ? '<button class="clear-all" type="button" data-clear>Clear all</button>' : '');
    document.getElementById('filters-n').textContent = chips.length ? `(${chips.length})` : '';

    // Saved toggle
    const savedBtn = document.getElementById('saved');
    const savedCount = favs.filter(c => ALL.some(f => f.code === c)).length;
    document.getElementById('saved-n').textContent = savedCount;
    savedBtn.setAttribute('aria-pressed', String(state.saved));
    savedBtn.disabled = !savedCount && !state.saved;
    savedBtn.title = savedCount || state.saved ? '' : 'Tap ♡ on a frame to save it';
    document.getElementById('sort').value = state.sort;

    renderFilters();
    writeURL();
  }
  const update = () => { state.shown = PAGE; render(); };

  /* ---------- Events ---------- */
  groupsEl.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'stock') state.stock = t.checked;
    else if (t.dataset.group) {
      const s = state.sel[t.dataset.group];
      state.sel[t.dataset.group] = t.checked ? [...s, t.value] : s.filter(v => v !== t.value);
    }
    update();
  });
  document.querySelectorAll('[data-quick]').forEach(b => b.addEventListener('click', () => {
    const v = b.dataset.quick, s = state.sel.gender;
    state.sel.gender = s.includes(v) ? s.filter(x => x !== v) : [...s, v];
    update();
  }));
  function clearAll() { GROUPS.forEach(g => state.sel[g.key] = []); state.stock = false; state.saved = false; update(); }
  document.addEventListener('click', e => {
    if (e.target.closest('[data-clear]')) return clearAll();
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      const [g, v] = rm.dataset.remove.split('|');
      if (g === 'stock') state.stock = false; else state.sel[g] = state.sel[g].filter(x => x !== v);
      return update();
    }
    if (e.target.closest('#more')) { state.shown += PAGE; render(); }
  });
  document.getElementById('sort').addEventListener('change', e => { state.sort = e.target.value; update(); });
  document.getElementById('saved').addEventListener('click', () => { state.saved = !state.saved; update(); });
  VSLM.wireFavs(grid, () => { if (state.saved) update(); else render(); });

  /* ---------- Filter panel (below 1180px) ---------- */
  const panel = document.getElementById('filters');
  const openBtn = document.getElementById('filters-open');
  function setPanel(on) {
    panel.classList.toggle('is-open', on);
    openBtn.setAttribute('aria-expanded', String(on));
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (on) setTimeout(() => document.getElementById('filters-close').focus(), 50); else openBtn.focus();
  }
  openBtn.addEventListener('click', () => setPanel(true));
  document.getElementById('filters-close').addEventListener('click', () => setPanel(false));
  document.getElementById('filters-apply').addEventListener('click', () => setPanel(false));
  document.getElementById('filters-clear').addEventListener('click', clearAll);
  panel.addEventListener('keydown', e => {
    if (!panel.classList.contains('is-open')) return;
    if (e.key === 'Escape') { e.stopPropagation(); return setPanel(false); }
    if (e.key !== 'Tab') return;
    const f = [...panel.querySelectorAll('button, input:not(:disabled)')].filter(el => el.offsetParent !== null);
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });
  matchMedia('(min-width: 1180px)').addEventListener('change', e => { if (e.matches && panel.classList.contains('is-open')) setPanel(false); });

  readURL();
  render();
};
