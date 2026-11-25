/* ==========================================================================
   VS Lens Mart mockups: shared site chrome
   Every mockup page includes this file at the end of <body>. It inserts the
   header (utility bar, navigation, mega menus, search), the mobile drawer,
   the sticky Call / WhatsApp / Book bar, the branch picker and the mockup
   controls, then wires their behaviour. Spec: docs/requirements/Requirements_Navigation.md

   Page hooks:
     <body data-page="frames">  marks that top-level item as the current page
       (home | about | frames | sunglasses | lenses | eye-care | eye-camps | contact)
     [data-picker="call" | "whatsapp"]  on any button opens the branch picker
   ========================================================================== */
(() => {
  const HEADER = String.raw`
<!-- Icon set: authored SVG, one stroke weight (1.75) -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <symbol id="i-search" viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.2-4.2"/></symbol>
  <symbol id="i-wa" viewBox="0 0 24 24"><path d="M3.6 20.4l1.2-3.9A8.6 8.6 0 1 1 8 19.3z"/><path d="M9.2 8.3c.2-.5.6-.5.9-.5h.5l1 2.2-.8 1c.5 1.1 1.4 2 2.5 2.5l1-.8 2.2 1v.5c0 .3 0 .7-.5.9-.7.4-1.6.5-2.7 0a8 8 0 0 1-4.3-4.3c-.4-1-.3-1.9.2-2.5z"/></symbol>
  <symbol id="i-phone" viewBox="0 0 24 24"><path d="M5 4h3.2l1.6 4-2 1.3a10.5 10.5 0 0 0 4.9 4.9l1.3-2 4 1.6V17a2 2 0 0 1-2.2 2A15 15 0 0 1 3 6.2 2 2 0 0 1 5 4z"/></symbol>
  <symbol id="i-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></symbol>
  <symbol id="i-pin" viewBox="0 0 24 24"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z"/><circle cx="12" cy="10" r="2.3"/></symbol>
  <symbol id="i-cal" viewBox="0 0 24 24"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></symbol>
  <symbol id="i-menu" viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></symbol>
  <symbol id="i-x" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></symbol>
  <symbol id="i-arrow" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></symbol>
  <symbol id="i-chev" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></symbol>
  <symbol id="i-eye" viewBox="0 0 24 24"><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/></symbol>
  <symbol id="i-store" viewBox="0 0 24 24"><path d="M4 9.5V20h16V9.5M3 9.5l2-5.5h14l2 5.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M10 20v-5h4v5"/></symbol>
  <symbol id="i-camp" viewBox="0 0 24 24"><path d="M3 20h18M12 4L4 20M12 4l8 16M12 13l-3 7M12 13l3 7"/></symbol>
  <symbol id="i-heart" viewBox="0 0 24 24"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z"/></symbol>
  <symbol id="i-star" viewBox="0 0 24 24"><path d="M12 3.8l2.5 5.2 5.7.8-4.1 4 1 5.7L12 16.8l-5.1 2.7 1-5.7-4.1-4 5.7-.8z"/></symbol>
  <symbol id="i-glasses" viewBox="0 0 48 20"><circle cx="11" cy="11" r="8"/><circle cx="37" cy="11" r="8"/><path d="M19 10c2.5-1.6 7.5-1.6 10 0M3 9L1 5M45 9l2-4"/></symbol>
  <symbol id="i-lens" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5"/><path d="M8 9.5a5 5 0 0 1 4-2"/></symbol>
  <symbol id="i-tool" viewBox="0 0 24 24"><path d="M14.5 5.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 1-2-2z"/></symbol>
  <symbol id="i-adjust" viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/></symbol>
  <symbol id="i-dir" viewBox="0 0 24 24"><path d="M12 3l9 9-9 9-9-9z"/><path d="M9.5 13.5V11h5M12.5 8.5l2.5 2.5-2.5 2.5"/></symbol>
  <symbol id="i-shield" viewBox="0 0 24 24"><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/></symbol>
  <symbol id="i-pause" viewBox="0 0 24 24"><path d="M9 6v12M15 6v12"/></symbol>
  <symbol id="i-play" viewBox="0 0 24 24"><path d="M8 5.5v13l10-6.5z"/></symbol>
  <symbol id="i-alert" viewBox="0 0 24 24"><path d="M12 3.5l9.5 16.5h-19z"/><path d="M12 10v4.5M12 17.2v.3"/></symbol>
  <symbol id="i-sun" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/></symbol>
  <symbol id="i-moon" viewBox="0 0 24 24"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></symbol>
  <symbol id="i-share" viewBox="0 0 24 24"><circle cx="18" cy="5.5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="18.5" r="2.5"/><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1"/></symbol>
  <symbol id="i-ig" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="4.5"/><circle cx="12" cy="12" r="3.6"/><circle cx="16.8" cy="7.2" r="0.6"/></symbol>
  <symbol id="i-fb" viewBox="0 0 24 24"><path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5z"/></symbol>
  <symbol id="i-yt" viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="3.5"/><path d="M10.5 9.5v5l4.2-2.5z"/></symbol>
</svg>

<a class="sr-only" href="#main">Skip to content</a>

<header class="site-header">

  <!-- ========== Utility bar ========== -->
  <div class="utility on-dark">
    <div class="container utility__inner">
      <ul class="utility__facts">
        <li class="utility__legacy">Since 1999</li>
        <li class="u-hours">
          <svg class="icon"><use href="#i-clock"/></svg>
          Open 7 days, 9 AM–9:30 PM
        </li>
        <li class="u-phone">
          <svg class="icon"><use href="#i-phone"/></svg>
          <a href="tel:+919550685417">Indresham <span class="u-num">9550685417</span></a>
        </li>
        <li class="u-phone">
          <a href="tel:+910000000000" data-dummy>Patelguda <span class="u-num">+91 00000 00000</span></a>
          <span class="todo u-num" title="Client hasn't sent the Patelguda number yet (dummy-data.md D2)">DUMMY</span>
        </li>
        <li class="u-branches">
          <svg class="icon"><use href="#i-pin"/></svg>
          <a href="/contact#branches">2 branches</a>
        </li>
      </ul>
      <div class="utility__cta">
        <a class="btn btn--primary btn--sm" href="/book-eye-test">Book an eye test</a>
      </div>
    </div>
  </div>

  <!-- ========== Main navigation ========== -->
  <nav class="nav on-dark" aria-label="Main">
    <div class="container nav__inner">

      <a class="brand" href="/" aria-label="VS Lens Mart, home">
        <img class="brand__mark" src="assets/logo-placeholder.svg" alt="" width="52" height="52">
        <span class="brand__rule" aria-hidden="true"></span>
        <span class="brand__text">
          <span class="brand__name"><b>VS</b> LENS MART</span>
          <span class="brand__est">EST. 1999</span>
        </span>
      </a>

      <ul class="menu" id="menu">
        <!-- 1–2. Plain links (client change 2026-10-21: Home and About first) -->
        <li><a class="menu__link" href="/">Home</a></li>
        <li><a class="menu__link" href="/about">About</a></li>

        <!-- 3. Frames -->
        <li>
          <button class="menu__link" type="button" aria-expanded="false" aria-controls="mega-frames">
            Frames <svg class="icon chev"><use href="#i-chev"/></svg>
          </button>
          <div class="mega" id="mega-frames" role="region" aria-label="Frames">
            <div class="container mega__inner">
              <div class="mega__grid" style="--cols: 1.5fr 1fr 1fr 1.1fr">
                <div class="mega__col">
                  <h3><a href="/frames">Shop for</a></h3>
                  <div class="tiles">
                    <a class="tile" href="/frames?for=men"><div class="ph">Product photo<br>TODO (client)</div><span>Men</span></a>
                    <a class="tile" href="/frames?for=women"><div class="ph">Product photo<br>TODO (client)</div><span>Women</span></a>
                    <a class="tile" href="/frames?for=kids"><div class="ph">Product photo<br>TODO (client)</div><span>Kids</span></a>
                  </div>
                </div>
                <div class="mega__col">
                  <h3><a href="/frames">Shape</a></h3>
                  <ul class="mega__list">
                    <li><a href="/frames?shape=rectangle">Rectangle</a></li>
                    <li><a href="/frames?shape=square">Square</a></li>
                    <li><a href="/frames?shape=round">Round</a></li>
                    <li><a href="/frames?shape=cat-eye">Cat-eye</a></li>
                    <li><a href="/frames?shape=aviator">Aviator</a></li>
                  </ul>
                  <p class="mock-only" style="margin-top:8px"><span class="todo">TODO (client): confirm shapes stocked</span></p>
                </div>
                <div class="mega__col">
                  <h3><a href="/frames">Brands</a></h3>
                  <ul class="mega__list">
                    <li><a href="/frames?brand=ray-ban">Ray-Ban</a></li>
                    <li><a href="/frames?brand=vogue-eyewear">Vogue Eyewear</a></li>
                    <li><a href="/frames?brand=titan">Titan</a></li>
                    <li><a href="/frames?brand=fastrack">Fastrack</a></li>
                  </ul>
                  <p class="mock-only" style="margin-top:8px"><span class="todo">DUMMY brands. Live site lists the brands of approved frames from admin</span></p>
                  <p style="margin-top:12px"><a class="link-arrow" href="/frames#brands">All brands <svg class="icon"><use href="#i-arrow"/></svg></a></p>
                </div>
                <div class="mega__col">
                  <h3><a href="/frames">Price range</a></h3>
                  <ul class="mega__list">
                    <li><a href="/frames?tier=everyday">Everyday <span class="mega__price">from ₹999</span></a></li>
                    <li><a href="/frames?tier=premium">Premium <span class="mega__price">from ₹3,999</span></a></li>
                    <li><a href="/frames?for=kids">Kids <span class="mega__price">from ₹999</span></a></li>
                  </ul>
                  <p class="mock-only" style="margin-top:8px"><span class="todo">DUMMY prices. Live prices come from the database. TODO (client): tier names and boundaries</span></p>
                </div>
              </div>
              <div class="mega__foot">
                <span class="card__text">Visit a branch for fitting and prescription.</span>
                <a class="link-arrow" href="/frames">View all frames <svg class="icon"><use href="#i-arrow"/></svg></a>
              </div>
            </div>
          </div>
        </li>

        <!-- 2. Sunglasses -->
        <li>
          <button class="menu__link" type="button" aria-expanded="false" aria-controls="mega-sun">
            Sunglasses <svg class="icon chev"><use href="#i-chev"/></svg>
          </button>
          <div class="mega" id="mega-sun" role="region" aria-label="Sunglasses">
            <div class="container mega__inner">
              <div class="mega__grid" style="--cols: 1.5fr 1fr 1fr 1.1fr">
                <div class="mega__col">
                  <h3><a href="/sunglasses">Shop for</a></h3>
                  <div class="tiles">
                    <a class="tile" href="/sunglasses?for=men"><div class="ph">Photo<br>TODO (client)</div><span>Men</span></a>
                    <a class="tile" href="/sunglasses?for=women"><div class="ph">Photo<br>TODO (client)</div><span>Women</span></a>
                    <a class="tile" href="/sunglasses?for=kids"><div class="ph">Photo<br>TODO (client)</div><span>Kids</span></a>
                  </div>
                </div>
                <div class="mega__col">
                  <h3><a href="/sunglasses">Lens type</a></h3>
                  <ul class="mega__list">
                    <li><a href="/sunglasses?lens=polarized">Polarized</a></li>
                    <li><a href="/sunglasses?lens=uv-protection">UV protection</a></li>
                    <li><a href="/sunglasses?lens=tinted">Tinted</a></li>
                    <li><a href="/sunglasses?lens=power-sunglasses">Power sunglasses</a></li>
                  </ul>
                </div>
                <div class="mega__col">
                  <h3><a href="/sunglasses">Shape</a></h3>
                  <ul class="mega__list">
                    <li><a href="/sunglasses?shape=aviator">Aviator</a></li>
                    <li><a href="/sunglasses?shape=wayfarer">Wayfarer</a></li>
                    <li><a href="/sunglasses?shape=round">Round</a></li>
                    <li><a href="/sunglasses?shape=square">Square</a></li>
                  </ul>
                  <p class="mock-only" style="margin-top:8px"><span class="todo">TODO (client): confirm shapes</span></p>
                </div>
                <div class="mega__col">
                  <h3><a href="/sunglasses">Price range</a></h3>
                  <ul class="mega__list">
                    <li><a href="/sunglasses?tier=everyday">Everyday <span class="mega__price">from ₹999</span></a></li>
                    <li><a href="/sunglasses?tier=branded">Branded <span class="mega__price">from ₹2,999</span></a></li>
                  </ul>
                  <p class="mock-only" style="margin-top:8px"><span class="todo">DUMMY prices. Live prices come from the database. TODO (client): tiers</span></p>
                </div>
              </div>
              <div class="mega__foot">
                <span class="card__text">Power sunglasses are made to your prescription.</span>
                <a class="link-arrow" href="/sunglasses">View all sunglasses <svg class="icon"><use href="#i-arrow"/></svg></a>
              </div>
            </div>
          </div>
        </li>

        <!-- 3. Lenses -->
        <li>
          <button class="menu__link" type="button" aria-expanded="false" aria-controls="mega-lens">
            Lenses <svg class="icon chev"><use href="#i-chev"/></svg>
          </button>
          <div class="mega" id="mega-lens" role="region" aria-label="Lenses">
            <div class="container mega__inner">
              <div class="mega__grid" style="--cols: 1fr 1fr 1.4fr">
                <div class="mega__col">
                  <h3><a href="/lenses#spectacle">Spectacle lenses</a></h3>
                  <ul class="mega__list">
                    <li><a href="/lenses?type=single-vision">Single vision</a></li>
                    <li><a href="/lenses?type=bifocal">Bifocal</a></li>
                    <li><a href="/lenses?type=progressive">Progressive</a></li>
                    <li><a href="/lenses?type=blue-cut">Blue-cut / computer</a></li>
                    <li><a href="/lenses?type=photochromic">Photochromic</a></li>
                  </ul>
                  <p class="mock-only" style="margin-top:8px"><span class="todo">TODO (client): confirm blue-cut and photochromic</span></p>
                </div>
                <div class="mega__col">
                  <h3><a href="/lenses#brands">All branded lenses</a></h3>
                  <ul class="mega__list">
                    <li><a href="/lenses?brand=essilor">Essilor</a></li>
                    <li><a href="/lenses?brand=zeiss">ZEISS</a></li>
                    <li><a href="/lenses?brand=hoya">Hoya</a></li>
                    <li><a href="/lenses?brand=kodak-lens">Kodak Lens</a></li>
                    <li><a href="/lenses?brand=crizal">Crizal</a></li>
                  </ul>
                  <p class="mock-only" style="margin-top:8px"><span class="todo">DUMMY brands. Live site lists lens brands from admin</span></p>
                </div>
                <div class="mega__col">
                  <h3><a href="/book-eye-test">Not sure which lens?</a></h3>
                  <p class="card__text">Our optometrist checks your eyes and suggests the right lens for your power and daily use.</p>
                  <p style="margin-top:16px"><a class="link-arrow" href="/book-eye-test">Book an eye test <svg class="icon"><use href="#i-arrow"/></svg></a></p>
                  <p class="mock-only" style="margin-top:12px"><span class="todo">Contact lenses, reading glasses and care products removed until the client confirms they sell them</span></p>
                </div>
              </div>
              <div class="mega__foot">
                <span class="card__text">All branded lenses available.</span>
                <a class="link-arrow" href="/lenses">View all lenses <svg class="icon"><use href="#i-arrow"/></svg></a>
              </div>
            </div>
          </div>
        </li>

        <!-- 4. Eye care -->
        <li>
          <button class="menu__link" type="button" aria-expanded="false" aria-controls="mega-care">
            Eye care <svg class="icon chev"><use href="#i-chev"/></svg>
          </button>
          <div class="mega" id="mega-care" role="region" aria-label="Eye care">
            <div class="container mega__inner">
              <div class="mega__grid" style="--cols: 1fr 3.4fr">
              <div class="mega__col">
                <h3><a href="/eye-care">Our services</a></h3>
                <ul class="mega__list">
                  <li><a href="/eye-care#eye-testing">Eye testing</a></li>
                  <li><a href="/eye-care#lens-fitting">Instant lens fitting (spherical powers)</a></li>
                  <li><a href="/eye-care#frame-adjustment">Frame adjustment</a></li>
                  <li><a href="/eye-care#frame-repair">Frame repair</a></li>
                </ul>
                <p class="card__text" style="margin-top:8px">At both branches.</p>
              </div>
              <div class="cards">
                <a class="card" href="/book-eye-test">
                  <div class="ph"><span><svg class="icon icon--lg" style="margin:0 auto 6px"><use href="#i-eye"/></svg>Photo of the test room<br>TODO (client)</span></div>
                  <span class="card__title">Book an eye test <svg class="icon"><use href="#i-arrow"/></svg></span>
                  <span class="card__text">Free eye test. <span class="todo mock-only">DUMMY: is it free?</span> Pick a branch, date and time. To reschedule, call or WhatsApp the branch.</span>
                </a>
                <a class="card" href="/contact#branches">
                  <div class="ph"><span><svg class="icon icon--lg" style="margin:0 auto 6px"><use href="#i-store"/></svg>Storefront photos<br>TODO (client)</span></div>
                  <span class="card__title">Our branches <svg class="icon"><use href="#i-arrow"/></svg></span>
                  <span class="card__text">Indresham and Patelguda, open 7 days.</span>
                </a>
                <a class="card" href="/eye-camps">
                  <div class="ph"><span><svg class="icon icon--lg" style="margin:0 auto 6px"><use href="#i-camp"/></svg>Past eye camp photo<br>TODO (client)</span></div>
                  <span class="card__title">Eye camps <svg class="icon"><use href="#i-arrow"/></svg></span>
                  <span class="card__text">Upcoming camps near you, and photos from past ones.</span>
                </a>
              </div>
              </div>
              <div class="mega__foot">
                <span class="mock-only"><span class="todo">"Free" is DUMMY (D7). The live site won't say "free" until the client confirms.</span></span>
                <a class="link-arrow" href="/eye-care">Eye care tips and FAQ <svg class="icon"><use href="#i-arrow"/></svg></a>
              </div>
            </div>
          </div>
        </li>

        <!-- 7–8. Plain links -->
        <li><a class="menu__link" href="/eye-camps">Eye camps</a></li>
        <li><a class="menu__link" href="/contact">Contact</a></li>
      </ul>

      <div class="nav__tools">
        <button class="icon-btn icon-btn--theme" type="button" id="theme-toggle" aria-pressed="false" aria-label="Dark mode">
          <svg class="icon theme-icon--moon" aria-hidden="true"><use href="#i-moon"/></svg>
          <svg class="icon theme-icon--sun" aria-hidden="true"><use href="#i-sun"/></svg>
        </button>
        <button class="icon-btn icon-btn--search" type="button" aria-label="Search" aria-expanded="false" aria-controls="search">
          <svg class="icon"><use href="#i-search"/></svg>
        </button>
        <button class="icon-btn icon-btn--wa" type="button" data-picker="whatsapp" aria-label="Chat on WhatsApp" aria-haspopup="true" aria-expanded="false" aria-controls="picker">
          <svg class="icon"><use href="#i-wa"/></svg>
        </button>
        <button class="icon-btn burger" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="drawer">
          <svg class="icon"><use href="#i-menu"/></svg>
        </button>
      </div>
    </div>

    <!-- Search drawer -->
    <div class="search" id="search">
      <form class="container search__row" role="search" action="/search">
        <label class="search__field">
          <svg class="icon"><use href="#i-search"/></svg>
          <span class="sr-only">Search</span>
          <input type="search" name="q" placeholder="Search frames, sunglasses and lenses" autocomplete="off">
        </label>
        <button class="btn btn--primary" type="submit">Search</button>
      </form>
      <div class="container mock-only" style="margin-top:8px"><span class="todo">TODO (dev): search results behaviour (ROADMAP sprint 5.6)</span></div>
    </div>
  </nav>
</header>

<!-- ========== Mobile drawer (accordion) ========== -->
<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu">
  <div class="drawer__head">
    <a class="brand" href="/" aria-label="VS Lens Mart, home">
      <img class="brand__mark" src="assets/logo-placeholder.svg" alt="" width="40" height="40">
      <span class="brand__text">
        <span class="brand__name"><b>VS</b> LENS MART</span>
        <span class="brand__est">EST. 1999</span>
      </span>
    </a>
    <button class="icon-btn drawer__close" type="button" aria-label="Close menu">
      <svg class="icon icon--lg"><use href="#i-x"/></svg>
    </button>
  </div>

  <div class="drawer__body">
    <ul class="acc">
      <li><a class="acc__link" href="/">Home <svg class="icon"><use href="#i-arrow"/></svg></a></li>
      <li><a class="acc__link" href="/about">About <svg class="icon"><use href="#i-arrow"/></svg></a></li>
      <li>
        <button class="acc__btn" type="button" aria-expanded="false" aria-controls="acc-frames">Frames <span class="acc__sign" aria-hidden="true"></span></button>
        <div class="acc__panel" id="acc-frames"><div><div class="acc__group">
          <h4>Shop for</h4>
          <a href="/frames?for=men">Men</a><a href="/frames?for=women">Women</a><a href="/frames?for=kids">Kids</a>
          <h4>Shape</h4>
          <a href="/frames?shape=rectangle">Rectangle</a><a href="/frames?shape=square">Square</a><a href="/frames?shape=round">Round</a><a href="/frames?shape=cat-eye">Cat-eye</a><a href="/frames?shape=aviator">Aviator</a>
          <h4>Price range <span class="todo">DUMMY</span></h4>
          <a href="/frames?tier=everyday">Everyday <span class="mega__price">from ₹999</span></a>
          <a href="/frames?tier=premium">Premium <span class="mega__price">from ₹3,999</span></a>
          <a href="/frames?for=kids">Kids <span class="mega__price">from ₹999</span></a>
          <a class="acc__all" href="/frames">View all frames</a>
        </div></div></div>
      </li>
      <li>
        <button class="acc__btn" type="button" aria-expanded="false" aria-controls="acc-sun">Sunglasses <span class="acc__sign" aria-hidden="true"></span></button>
        <div class="acc__panel" id="acc-sun"><div><div class="acc__group">
          <h4>Shop for</h4>
          <a href="/sunglasses?for=men">Men</a><a href="/sunglasses?for=women">Women</a><a href="/sunglasses?for=kids">Kids</a>
          <h4>Lens type</h4>
          <a href="/sunglasses?lens=polarized">Polarized</a><a href="/sunglasses?lens=uv-protection">UV protection</a><a href="/sunglasses?lens=tinted">Tinted</a><a href="/sunglasses?lens=power-sunglasses">Power sunglasses</a>
          <h4>Shape</h4>
          <a href="/sunglasses?shape=aviator">Aviator</a><a href="/sunglasses?shape=wayfarer">Wayfarer</a><a href="/sunglasses?shape=round">Round</a><a href="/sunglasses?shape=square">Square</a>
          <h4>Price range <span class="todo">DUMMY</span></h4>
          <a href="/sunglasses?tier=everyday">Everyday <span class="mega__price">from ₹999</span></a>
          <a href="/sunglasses?tier=branded">Branded <span class="mega__price">from ₹2,999</span></a>
          <a class="acc__all" href="/sunglasses">View all sunglasses</a>
        </div></div></div>
      </li>
      <li>
        <button class="acc__btn" type="button" aria-expanded="false" aria-controls="acc-lens">Lenses <span class="acc__sign" aria-hidden="true"></span></button>
        <div class="acc__panel" id="acc-lens"><div><div class="acc__group">
          <h4>Spectacle lenses</h4>
          <a href="/lenses?type=single-vision">Single vision</a><a href="/lenses?type=bifocal">Bifocal</a><a href="/lenses?type=progressive">Progressive</a><a href="/lenses?type=blue-cut">Blue-cut / computer</a><a href="/lenses?type=photochromic">Photochromic</a>
          <h4>All branded lenses <span class="todo">DUMMY</span></h4>
          <a href="/lenses?brand=essilor">Essilor</a><a href="/lenses?brand=zeiss">ZEISS</a><a href="/lenses?brand=hoya">Hoya</a><a href="/lenses?brand=kodak-lens">Kodak Lens</a><a href="/lenses?brand=crizal">Crizal</a>
          <a class="acc__all" href="/book-eye-test">Not sure? Book an eye test</a>
        </div></div></div>
      </li>
      <li>
        <button class="acc__btn" type="button" aria-expanded="false" aria-controls="acc-care">Eye care <span class="acc__sign" aria-hidden="true"></span></button>
        <div class="acc__panel" id="acc-care"><div><div class="acc__group">
          <h4>Our services</h4>
          <a href="/eye-care#eye-testing">Eye testing</a>
          <a href="/eye-care#lens-fitting">Instant lens fitting (spherical powers)</a>
          <a href="/eye-care#frame-adjustment">Frame adjustment</a>
          <a href="/eye-care#frame-repair">Frame repair</a>
          <h4>More</h4>
          <a href="/book-eye-test">Book an eye test</a>
          <a href="/contact#branches">Our branches</a>
          <a href="/eye-camps">Eye camps</a>
          <a class="acc__all" href="/eye-care">Eye care tips and FAQ</a>
        </div></div></div>
      </li>
      <li><a class="acc__link" href="/eye-camps">Eye camps <svg class="icon"><use href="#i-arrow"/></svg></a></li>
      <li><a class="acc__link" href="/contact">Contact <svg class="icon"><use href="#i-arrow"/></svg></a></li>
    </ul>
    <div class="drawer__foot">
      <span>Since 1999 · Indresham and Patelguda</span>
      <span>Open 7 days, 9 AM–9:30 PM</span>
    </div>
  </div>
</div>

<!-- ========== Sticky bottom bar (mobile) ========== -->
<div class="stickybar" role="navigation" aria-label="Quick actions">
  <div class="stickybar__inner">
    <button type="button" data-picker="call" aria-haspopup="true" aria-expanded="false" aria-controls="picker"><svg class="icon"><use href="#i-phone"/></svg>Call</button>
    <button type="button" data-picker="whatsapp" aria-haspopup="true" aria-expanded="false" aria-controls="picker"><svg class="icon"><use href="#i-wa"/></svg>WhatsApp</button>
    <a class="stickybar__book" href="/book-eye-test"><svg class="icon"><use href="#i-cal"/></svg>Book test</a>
  </div>
</div>

<!-- ========== Branch picker (Call / WhatsApp) ==========
     Each branch has its own number. Numbers come from src/lib/site-config.ts on the live site. -->
<div class="picker" id="picker" role="dialog" aria-modal="false" aria-labelledby="picker-title">
  <p class="picker__title" id="picker-title">Which branch?</p>
  <div class="picker__list"></div>
  <span class="todo">Branch picker is a proposal for client review. Patelguda number is DUMMY</span>
</div>
`;
  const TAIL = String.raw`
<div class="mock-bar mock-only-keep" role="group" aria-label="Mockup controls">
  <span>Review notes</span>
  <button type="button" id="notes-toggle" aria-pressed="true">On</button>
</div>
<div class="toast" id="toast" role="status" aria-live="polite"></div>
`;
  const FOOTER = String.raw`
<!-- ========== Footer (shared) ========== -->
<footer class="footer">
  <div class="container">
    <div class="footer__grid">
      <div class="footer__brand">
        <a class="brand" href="/" aria-label="VS Lens Mart, home">
          <img class="brand__mark" src="assets/logo-placeholder.svg" alt="" width="52" height="52">
          <span class="brand__text"><span class="brand__name"><b>VS</b> LENS MART</span><span class="brand__est">EST. 1999</span></span>
        </a>
        <p>A family optical shop since 1999. Welcome to the Optical Family.</p>
        <div class="footer__social">
          <a href="https://example.com/youtube" aria-label="YouTube" data-dummy><svg class="icon"><use href="#i-yt"/></svg></a>
          <a href="https://example.com/facebook" aria-label="Facebook" data-dummy><svg class="icon"><use href="#i-fb"/></svg></a>
          <a href="https://example.com/instagram" aria-label="Instagram" data-dummy><svg class="icon"><use href="#i-ig"/></svg></a>
        </div>
        <p class="mock-only"><span class="todo">DUMMY social links (D5)</span> <span class="todo">Logo is a placeholder (D8): the client is sending a new logo</span></p>
      </div>
      <div>
        <h3>Indresham</h3>
        <address>Plot No 30/Part Block-B, Citizens Colony, Indresham, Patancheruvu, Sangareddy</address>
        <ul style="margin-top:12px"><li><a href="tel:+919550685417">9550685417</a></li><li>Mon–Sun, 9 AM–9:30 PM</li></ul>
      </div>
      <div>
        <h3>Patelguda</h3>
        <address>Falcon One Shopping Plaza, beside Apollo Pharmacy, Ellenki College, Patelguda</address>
        <ul style="margin-top:12px"><li><a href="tel:+910000000000" data-dummy>+91 00000 00000</a> <span class="todo">DUMMY</span></li><li>Mon–Sun, 9 AM–9:30 PM</li></ul>
      </div>
      <div>
        <h3>Quick links</h3>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About us</a></li>
          <li><a href="/frames">Frames</a></li>
          <li><a href="/sunglasses">Sunglasses</a></li>
          <li><a href="/lenses">Lenses</a></li>
          <li><a href="/book-eye-test">Book an eye test</a></li>
          <li><a href="/eye-camps">Eye camps</a></li>
          <li><a href="/gallery">Gallery</a></li>
          <li><a href="/contact">Contact</a></li>
        </ul>
      </div>
    </div>
    <div class="footer__bottom">
      <span>© <span data-year>2026</span> VS Lens Mart · Since 1999</span>
      <a href="/privacy">Privacy policy</a>
    </div>
  </div>
</footer>
`;
  document.body.insertAdjacentHTML('afterbegin', HEADER);
  document.body.insertAdjacentHTML('beforeend', TAIL);
  // Footer goes straight after <main>, so it sits above the page's own scripts
  (document.querySelector('main') || document.body.lastElementChild).insertAdjacentHTML('afterend', FOOTER);
  document.querySelectorAll('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  const current = {
    'frames': '[aria-controls="mega-frames"]', 'sunglasses': '[aria-controls="mega-sun"]',
    'lenses': '[aria-controls="mega-lens"]', 'eye-care': '[aria-controls="mega-care"]',
    // Top-level items only: mega-menu cards also link to these pages
    'home': '.menu > li > a[href="/"]', 'eye-camps': '.menu > li > a[href="/eye-camps"]', 'about': '.menu > li > a[href="/about"]', 'contact': '.menu > li > a[href="/contact"]',
  }[document.body.dataset.page];
  if (current) document.querySelector(current)?.setAttribute('aria-current', 'page');
})();

(() => {
  const nav = document.querySelector('.nav');
  const triggers = [...document.querySelectorAll('.menu__link[aria-controls]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const desktop = matchMedia('(min-width: 1180px)');
  let openId = null, hoverTimer = null, leaveTimer = null;

  /* ---------- Desktop mega menus ---------- */
  function openMega(btn) {
    closeSearch();
    triggers.forEach(t => { if (t !== btn) setMega(t, false); });
    setMega(btn, true);
  }
  function setMega(btn, on) {
    btn.setAttribute('aria-expanded', String(on));
    document.getElementById(btn.getAttribute('aria-controls')).classList.toggle('is-open', on);
    if (on) openId = btn.getAttribute('aria-controls');
    else if (openId === btn.getAttribute('aria-controls')) openId = null;
  }
  function closeAll(returnFocus) {
    const btn = triggers.find(t => t.getAttribute('aria-expanded') === 'true');
    triggers.forEach(t => setMega(t, false));
    if (returnFocus && btn) btn.focus();
  }

  triggers.forEach(btn => {
    const li = btn.parentElement;
    btn.addEventListener('click', () => {
      clearTimeout(hoverTimer);
      btn.getAttribute('aria-expanded') === 'true' ? setMega(btn, false) : openMega(btn);
    });
    btn.addEventListener('mouseenter', () => {
      if (!desktop.matches) return;
      clearTimeout(leaveTimer); clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => openMega(btn), openId ? 0 : 90);
    });
    btn.addEventListener('mouseleave', () => clearTimeout(hoverTimer));
    li.addEventListener('focusout', e => {
      if (!li.contains(e.relatedTarget)) setMega(btn, false);
    });
  });

  // Plain links close any open panel when hovered
  document.querySelectorAll('.menu > li > a.menu__link').forEach(a =>
    a.addEventListener('mouseenter', () => { if (desktop.matches) { clearTimeout(hoverTimer); closeAll(false); } }));

  // Close when the pointer leaves the header area
  nav.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    leaveTimer = setTimeout(() => closeAll(false), 180);
  });
  nav.addEventListener('mouseenter', () => clearTimeout(leaveTimer));

  // Click outside closes
  document.addEventListener('click', e => {
    if (!nav.contains(e.target)) { closeAll(false); closeSearch(); }
  });

  /* ---------- Light / dark mode ----------
     Follows the device setting until the visitor chooses; the choice is saved on
     this device (each page's <head> applies it before the page draws, so no flash). */
  const root = document.documentElement;
  const themeBtn = document.getElementById('theme-toggle');
  const systemDark = matchMedia('(prefers-color-scheme: dark)');
  const isDark = () => root.dataset.theme ? root.dataset.theme === 'dark' : systemDark.matches;
  function paintTheme() {
    const dark = isDark();
    themeBtn.setAttribute('aria-pressed', String(dark));
    themeBtn.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
  }
  themeBtn.addEventListener('click', () => {
    const next = isDark() ? 'light' : 'dark';
    root.dataset.theme = next;
    try { localStorage.setItem('vslm-theme', next); } catch (_) {}
    paintTheme();
  });
  systemDark.addEventListener('change', paintTheme);
  paintTheme();

  /* ---------- Search ---------- */
  const searchBtn = document.querySelector('.icon-btn--search');
  const search = document.getElementById('search');
  function closeSearch(returnFocus) {
    if (!search.classList.contains('is-open')) return;
    search.classList.remove('is-open');
    searchBtn.setAttribute('aria-expanded', 'false');
    if (returnFocus) searchBtn.focus();
  }
  searchBtn.addEventListener('click', () => {
    const on = !search.classList.contains('is-open');
    closeAll(false);
    search.classList.toggle('is-open', on);
    searchBtn.setAttribute('aria-expanded', String(on));
    if (on) setTimeout(() => search.querySelector('input').focus(), reduce.matches ? 0 : 60);
  });
  search.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    const q = search.querySelector('input').value.trim();
    toast(q ? `Search for “${q}” → results page (behaviour still to decide)` : 'Type something to search frames and lenses');
  });

  /* ---------- Mobile drawer ---------- */
  const drawer = document.getElementById('drawer');
  const burger = document.querySelector('.burger');
  const closeBtn = drawer.querySelector('.drawer__close');
  function setDrawer(on) {
    drawer.classList.toggle('is-open', on);
    burger.setAttribute('aria-expanded', String(on));
    document.documentElement.style.overflow = on ? 'hidden' : '';
    if (on) setTimeout(() => closeBtn.focus(), reduce.matches ? 0 : 50);
    else burger.focus();
  }
  burger.addEventListener('click', () => setDrawer(true));
  closeBtn.addEventListener('click', () => setDrawer(false));
  desktop.addEventListener('change', e => { if (e.matches && drawer.classList.contains('is-open')) setDrawer(false); });

  // Accordion: one section open at a time
  const accBtns = [...drawer.querySelectorAll('.acc__btn')];
  accBtns.forEach(btn => btn.addEventListener('click', () => {
    const willOpen = btn.getAttribute('aria-expanded') !== 'true';
    accBtns.forEach(b => {
      const on = b === btn && willOpen;
      b.setAttribute('aria-expanded', String(on));
      document.getElementById(b.getAttribute('aria-controls')).classList.toggle('is-open', on);
    });
  }));

  // Keep keyboard focus inside the open drawer
  drawer.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;
    const f = [...drawer.querySelectorAll('a, button')].filter(el => el.offsetParent !== null && !el.closest('.acc__panel:not(.is-open)'));
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });

  /* ---------- Branch picker (Call / WhatsApp) ---------- */
  // Mirrors src/lib/site-config.ts. Patelguda is DUMMY (docs/dummy-data.md D2).
  const BRANCHES = [
    { name: 'Indresham', phone: '9550685417', display: '9550685417' },
    { name: 'Patelguda', phone: '0000000000', display: '+91 00000 00000', dummy: true },
  ];
  const picker = document.getElementById('picker');
  const pickerList = picker.querySelector('.picker__list');
  const pickerTitle = document.getElementById('picker-title');
  let pickerOwner = null;

  function openPicker(btn) {
    const kind = btn.dataset.picker;
    pickerTitle.textContent = kind === 'call' ? 'Call which branch?' : 'WhatsApp which branch?';
    pickerList.innerHTML = '';
    BRANCHES.forEach(b => {
      const a = document.createElement('a');
      // data-wa-text on the trigger prefills the WhatsApp message (e.g. a frame enquiry)
      const text = btn.dataset.waText ? `?text=${encodeURIComponent(btn.dataset.waText)}` : '';
      a.href = kind === 'call' ? `tel:+91${b.phone}` : `https://wa.me/91${b.phone}${text}`;
      if (kind !== 'call') { a.target = '_blank'; a.rel = 'noopener'; }
      if (b.dummy) a.dataset.dummy = '';
      a.innerHTML = `<span>${b.name}</span><span class="picker__num">${b.display}</span>`;
      pickerList.append(a);
    });
    const inStickybar = !!btn.closest('.stickybar');
    picker.classList.toggle('picker--bottom', inStickybar);
    picker.classList.toggle('picker--top', !inStickybar);
    if (!inStickybar) {
      // Below the trigger, or above it when there isn't room (e.g. buttons low on the page)
      const r = btn.getBoundingClientRect();
      const h = picker.offsetHeight || 220;
      const below = r.bottom + 8 + h <= innerHeight;
      picker.style.top = `${below ? r.bottom + 8 : Math.max(8, r.top - 8 - h)}px`;
      picker.style.right = `${Math.max(12, Math.min(innerWidth - r.right, innerWidth - picker.offsetWidth - 12))}px`;
    } else {
      picker.style.top = picker.style.right = '';
    }
    closeAll(false); closeSearch();
    if (pickerOwner) pickerOwner.setAttribute('aria-expanded', 'false');
    pickerOwner = btn;
    btn.setAttribute('aria-expanded', 'true');
    picker.classList.add('is-open');
    setTimeout(() => pickerList.querySelector('a').focus(), reduce.matches ? 0 : 50);
  }
  function closePicker(returnFocus) {
    if (!picker.classList.contains('is-open')) return false;
    picker.classList.remove('is-open');
    if (pickerOwner) {
      pickerOwner.setAttribute('aria-expanded', 'false');
      if (returnFocus) pickerOwner.focus();
    }
    pickerOwner = null;
    return true;
  }
  // An anchored picker would drift from its button, so scrolling closes it (the sticky-bar one stays)
  addEventListener('scroll', () => { if (picker.classList.contains('picker--top')) closePicker(false); }, { passive: true });

  // Delegated, so [data-picker] buttons a page adds later (e.g. frame cards) work too
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-picker]');
    if (btn) return pickerOwner === btn ? closePicker(true) : openPicker(btn);
    if (!picker.contains(e.target)) closePicker(false);
  });

  /* ---------- Esc ---------- */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if (closePicker(true)) return;
    if (drawer.classList.contains('is-open')) return setDrawer(false);
    if (search.classList.contains('is-open')) return closeSearch(true);
    if (openId) closeAll(true);
  });

  /* ---------- Mockup only: show where internal links go ---------- */
  // Live route → mockup file. Add a line here when a page's mockup is built.
  const MOCKS = {
    '/': 'home.html',
    '/frames': 'frames.html',
    '/frames/*': 'frame-detail.html',   // ?frame=<slug>
    '/sunglasses': 'sunglasses.html',
    '/sunglasses/*': 'frame-detail.html',
    '/about': 'about.html',
    '/lenses': 'lenses.html',
    '/eye-care': 'eye-care.html',
    '/book-eye-test': 'book-eye-test.html',
    '/eye-camps': 'eye-camps.html',
    '/eye-camps/*': 'camp-detail.html',   // ?camp=<slug>
    '/gallery': 'gallery.html',
    '/contact': 'contact.html',
    '/privacy': 'privacy.html',
  };
  const t = document.getElementById('toast');
  let toastTimer;
  function toast(html) {
    t.innerHTML = html; t.classList.add('is-on');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('is-on'), 2600);
  }
  window.mockToast = toast;   // pages use it to show where a form or button would go
  document.addEventListener('click', e => {
    // Dummy numbers must never dial or open a chat
    const d = e.target.closest('a[data-dummy]');
    if (d) {
      e.preventDefault();
      closePicker(false);
      return toast('Patelguda number is <code>DUMMY</code>. Waiting for the real number from the client');
    }
    const a = e.target.closest('a[href^="/"]');
    if (!a) return;
    e.preventDefault();
    closeAll(false); closeSearch();
    if (drawer.classList.contains('is-open')) setDrawer(false);
    // Routes that already have a mockup open it (keeping filters and anchors); the rest show where they'd go
    const u = new URL(a.getAttribute('href'), 'https://vslensmart.example');
    const detail = u.pathname.match(/^\/(frames|sunglasses|eye-camps)\/(.+)$/);
    const file = MOCKS[u.pathname] || (detail && MOCKS[`/${detail[1]}/*`]);
    if (file) {
      const q = detail ? `?${detail[1] === 'eye-camps' ? 'camp' : 'frame'}=${detail[2]}` : u.search;
      return void (location.href = file + q + u.hash);
    }
    toast(`Goes to <code>${a.getAttribute('href')}</code> (page not mocked up yet)`);
  });

  const notesBtn = document.getElementById('notes-toggle');
  notesBtn.addEventListener('click', () => {
    const off = document.body.classList.toggle('notes-off');
    notesBtn.textContent = off ? 'Off' : 'On';
    notesBtn.setAttribute('aria-pressed', String(!off));
  });
})();
