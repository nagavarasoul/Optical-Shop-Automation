/* ==========================================================================
   VS Lens Mart mockups: DUMMY frame data + the shared frame card
   Used by home.html (featured frames), frames.html (listing) and the frame
   detail mockup. On the live site this comes from the database `frames`
   table (approved, active frames only). Everything here is DUMMY
   (docs/dummy-data.md C4 brands, C7 prices, C13 categories and codes).
   ========================================================================== */
window.VSLM = (() => {
  const B = 'Both branches', I = 'Indresham', P = 'Patelguda';
  // Newest first. The first 8 are the home page's featured frames.
  const FRAMES = [
    ['VSF-1024', 'Ray-Ban', 'RB5154 Clubmaster', 'Eyeglasses', 'Unisex', 'Black', 'Square', 'Acetate', '51-21-145', 6490, B],
    ['VSF-1023', 'Titan', 'Classic Rectangle', 'Eyeglasses', 'Men', 'Gunmetal', 'Rectangle', 'Metal', '54-17-140', 2290, I],
    ['VSF-1022', 'Vogue Eyewear', 'VO5276 Cat-eye', 'Eyeglasses', 'Women', 'Tortoise', 'Cat-eye', 'Acetate', '53-16-140', 4790, B],
    ['VSF-1021', 'Fastrack', 'Round Acetate', 'Computer glasses', 'Unisex', 'Transparent', 'Round', 'Acetate', '48-20-145', 999, P, true],
    ['VSF-1020', 'Carrera', 'CA 8858 Square', 'Eyeglasses', 'Men', 'Blue', 'Square', 'Metal', '55-18-145', 8990, B],
    ['VSF-1019', 'IDEE', 'S2954 Half-rim', 'Eyeglasses', 'Men', 'Silver', 'Rectangle', 'Metal', '53-17-140', 3490, I],
    ['VSF-1018', 'Titan', 'Kids Flexi', 'Eyeglasses', 'Kids', 'Blue', 'Round', 'TR90', '44-16-125', 1290, B],
    ['VSF-1017', 'Ray-Ban', 'RB7047 Square', 'Eyeglasses', 'Unisex', 'Black', 'Square', 'Acetate', '54-17-145', 5990, P],
    ['VSF-1016', 'Fastrack', 'Blue-cut Screen', 'Computer glasses', 'Men', 'Black', 'Rectangle', 'TR90', '52-18-140', 1490, B],
    ['VSF-1015', 'Vogue Eyewear', 'VO4206 Round', 'Eyeglasses', 'Women', 'Gold', 'Round', 'Metal', '50-20-140', 3990, I],
    ['VSF-1014', 'Titan', 'Slim Titanium', 'Eyeglasses', 'Men', 'Silver', 'Rectangle', 'Titanium', '55-16-145', 4490, B],
    ['VSF-1013', 'IDEE', 'S2701 Cat-eye', 'Eyeglasses', 'Women', 'Burgundy', 'Cat-eye', 'Acetate', '52-17-140', 2990, P],
    ['VSF-1012', 'Carrera', 'CA 225 Aviator', 'Eyeglasses', 'Men', 'Gold', 'Aviator', 'Metal', '56-15-145', 7490, B, true],
    ['VSF-1011', 'Fastrack', 'Kids Sporty', 'Eyeglasses', 'Kids', 'Red', 'Rectangle', 'TR90', '45-15-125', 999, B],
    ['VSF-1010', 'Ray-Ban', 'RB3447V Round', 'Eyeglasses', 'Unisex', 'Gold', 'Round', 'Metal', '50-21-145', 6990, I],
    ['VSF-1009', 'Titan', 'Office Blue-cut', 'Computer glasses', 'Women', 'Tortoise', 'Square', 'Acetate', '51-18-140', 1990, P],
    ['VSF-1008', 'Vogue Eyewear', 'VO5444 Square', 'Eyeglasses', 'Women', 'Black', 'Square', 'Acetate', '52-17-140', 4290, B],
    ['VSF-1007', 'IDEE', 'S2876 Aviator', 'Eyeglasses', 'Unisex', 'Gunmetal', 'Aviator', 'Metal', '55-16-140', 3290, B],
    ['VSF-1006', 'Fastrack', 'Everyday Rectangle', 'Eyeglasses', 'Men', 'Brown', 'Rectangle', 'Acetate', '53-18-140', 1190, I],
    ['VSF-1005', 'Titan', 'Kids Round', 'Eyeglasses', 'Kids', 'Pink', 'Round', 'TR90', '43-16-120', 1090, P],
    ['VSF-1004', 'Carrera', 'CA 8885 Rectangle', 'Eyeglasses', 'Men', 'Black', 'Rectangle', 'Acetate', '54-17-145', 7990, B],
    ['VSF-1003', 'Ray-Ban', 'RB5228 Rectangle', 'Eyeglasses', 'Unisex', 'Tortoise', 'Rectangle', 'Acetate', '53-17-140', 5490, B, true],
    ['VSF-1002', 'Vogue Eyewear', 'VO5286 Cat-eye', 'Eyeglasses', 'Women', 'Transparent', 'Cat-eye', 'Acetate', '51-17-140', 3790, I],
    ['VSF-1001', 'IDEE', 'S2901 Round', 'Computer glasses', 'Unisex', 'Silver', 'Round', 'Metal', '49-20-140', 2490, B],
    ['VSF-1000', 'Fastrack', 'Kids Square', 'Eyeglasses', 'Kids', 'Blue', 'Square', 'TR90', '44-15-125', 999, B],
    ['VSF-0999', 'Titan', 'Premium Rimless', 'Eyeglasses', 'Women', 'Gold', 'Rectangle', 'Titanium', '52-17-140', 5290, P],
    ['VSF-0998', 'Carrera', 'CA 8869 Round', 'Eyeglasses', 'Unisex', 'Tortoise', 'Round', 'Acetate', '49-21-145', 6490, B],
    ['VSF-0997', 'Ray-Ban', 'RB6489 Aviator', 'Eyeglasses', 'Men', 'Silver', 'Aviator', 'Metal', '55-14-140', 6290, I],
    ['VSF-0996', 'Vogue Eyewear', 'VO4248 Square', 'Computer glasses', 'Women', 'Pink', 'Square', 'Metal', '52-18-140', 3590, B],
    ['VSF-0995', 'IDEE', 'S2955 Rectangle', 'Eyeglasses', 'Men', 'Blue', 'Rectangle', 'Acetate', '55-17-145', 2790, P],
  ].map(([code, brand, model, category, gender, colour, shape, material, size, price, where, sold]) =>
    ({ code, brand, model, category, gender, colour, shape, material, size, price, where, sold: !!sold }));


  // DUMMY sunglasses (C5 brands, C14). Same table on the live site, category = Sunglasses.
  const SUNGLASSES = [
    ['SG-2016', 'Ray-Ban', 'RB3025 Aviator', 'Unisex', 'Gold', 'Aviator', 'Metal', '58-14-135', 7990, B, ['Polarized', 'UV protection'], 'Green'],
    ['SG-2015', 'Fastrack', 'Wayfarer Classic', 'Men', 'Black', 'Wayfarer', 'Acetate', '54-18-140', 1290, B, ['UV protection'], 'Grey'],
    ['SG-2014', 'Carrera', 'CA 1007 Square', 'Men', 'Black', 'Square', 'Acetate', '55-17-145', 6490, I, ['Polarized'], 'Grey'],
    ['SG-2013', 'Oakley', 'Holbrook', 'Men', 'Black', 'Square', 'O Matter', '55-18-137', 8990, P, ['Polarized', 'UV protection'], 'Grey'],
    ['SG-2012', 'Ray-Ban', 'RB2132 New Wayfarer', 'Unisex', 'Tortoise', 'Wayfarer', 'Acetate', '55-18-145', 6990, B, ['UV protection'], 'Brown'],
    ['SG-2011', 'Fastrack', 'Round Tint', 'Women', 'Gold', 'Round', 'Metal', '51-20-140', 999, B, ['Tinted'], 'Gradient blue'],
    ['SG-2010', 'Carrera', 'CA 5544 Aviator', 'Men', 'Silver', 'Aviator', 'Metal', '60-12-140', 5990, B, ['UV protection'], 'Grey', true],
    ['SG-2009', 'Fastrack', 'Kids Sporty Shades', 'Kids', 'Blue', 'Wayfarer', 'TR90', '46-15-120', 999, B, ['UV protection'], 'Grey'],
    ['SG-2008', 'Ray-Ban', 'RB3447 Round', 'Unisex', 'Gold', 'Round', 'Metal', '50-21-145', 7490, I, ['UV protection'], 'Green'],
    ['SG-2007', 'Oakley', 'Frogskins', 'Unisex', 'Blue', 'Wayfarer', 'O Matter', '55-17-139', 7290, P, ['Polarized'], 'Gradient blue'],
    ['SG-2006', 'Fastrack', 'Power Aviator', 'Men', 'Gunmetal', 'Aviator', 'Metal', '57-15-140', 2490, B, ['Power sunglasses', 'UV protection'], 'Grey'],
    ['SG-2005', 'Carrera', 'CA 3016 Square', 'Women', 'Tortoise', 'Square', 'Acetate', '53-19-140', 5490, B, ['Tinted', 'UV protection'], 'Brown'],
    ['SG-2004', 'Ray-Ban', 'RB4171 Erika', 'Women', 'Black', 'Round', 'Acetate', '54-18-145', 6490, B, ['Polarized'], 'Brown'],
    ['SG-2003', 'Fastrack', 'Kids Round Tint', 'Kids', 'Pink', 'Round', 'TR90', '44-16-120', 999, I, ['Tinted'], 'Gradient blue'],
    ['SG-2002', 'Oakley', 'Sutro Lite', 'Men', 'White', 'Square', 'O Matter', '139-0-135', 8490, B, ['UV protection'], 'Grey', true],
    ['SG-2001', 'Fastrack', 'Power Wayfarer', 'Unisex', 'Black', 'Wayfarer', 'Acetate', '52-18-140', 1990, P, ['Power sunglasses'], 'Grey'],
  ].map(([code, brand, model, gender, colour, shape, material, size, price, where, lens, lensColour, sold]) =>
    ({ code, brand, model, category: 'Sunglasses', gender, colour, shape, material, size, price, where, lens, lensColour, sold: !!sold }));
  const ALL = [...FRAMES, ...SUNGLASSES];
  const isSun = f => f.category === 'Sunglasses';

  const rupees = n => '₹' + n.toLocaleString('en-IN');
  const slug = f => `${f.brand} ${f.model} ${f.code}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const url = f => `/${isSun(f) ? 'sunglasses' : 'frames'}/${slug(f)}`;
  const noun = f => isSun(f) ? 'sunglasses' : 'frame';
  const enquiryText = f => `Hi VS Lens Mart, I'm interested in ${noun(f)} ${f.code} (${f.brand} ${f.model}). Is it available?`;

  /* Favourites: saved on this device only, no login (Requirements_Frames.md 3.5) */
  const KEY = 'vslm-favourites';
  function getFavs() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (_) { return []; } }
  function setFavs(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) {} }
  function toggleFav(code) {
    const list = getFavs();
    const next = list.includes(code) ? list.filter(c => c !== code) : [...list, code];
    setFavs(next);
    return next.includes(code);
  }

  /* The frame card (Requirements_HomePage.md 3.6, Requirements_Frames.md 3.4) */
  function card(f, favs = getFavs()) {
    const on = favs.includes(f.code);
    return `
    <article class="fcard${f.sold ? ' fcard--sold' : ''}">
      <a class="fcard__media" href="${url(f)}" aria-label="${f.brand} ${f.model}">
        <svg class="icon" aria-hidden="true"><use href="#i-glasses"/></svg>
        ${f.sold ? '<span class="fcard__badge">Sold out</span>' : ''}
      </a>
      <button class="fcard__fav" type="button" data-fav="${f.code}" aria-pressed="${on}" aria-label="Save ${f.brand} ${f.model} to favourites"><svg class="icon"><use href="#i-heart"/></svg></button>
      <span class="caps fcard__brand">${f.brand}${f.lens ? `<span class="fcard__lens">${f.lens.join(' · ')}</span>` : ''}</span>
      <a class="fcard__name" href="${url(f)}">${f.model}</a>
      <div class="fcard__meta"><span class="fcard__price">${rupees(f.price)}</span><span class="fcard__where">${f.where}</span></div>
      <button class="btn btn--outline-dark fcard__enquire" type="button" data-picker="whatsapp" aria-haspopup="true" aria-expanded="false" aria-controls="picker"
        data-wa-text="${f.sold ? `Hi VS Lens Mart, ${noun(f)} ${f.code} (${f.brand} ${f.model}) is sold out. Do you have something similar?` : enquiryText(f)}">Enquire</button>
    </article>`;
  }

  /* Hearts inside a container; onChange runs after each toggle */
  function wireFavs(container, onChange) {
    container.addEventListener('click', e => {
      const b = e.target.closest('[data-fav]');
      if (!b) return;
      b.setAttribute('aria-pressed', String(toggleFav(b.dataset.fav)));
      onChange?.();
    });
  }

  return { FRAMES, SUNGLASSES, ALL, isSun, noun, rupees, slug, url, enquiryText, getFavs, setFavs, toggleFav, card, wireFavs };
})();
