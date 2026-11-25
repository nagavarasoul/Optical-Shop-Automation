"use client";

/* Main navigation (Requirements_Navigation.md sections 4, 6 and 8), with the
   behaviour of the signed-off mockup (mockups/site.js):
   - desktop (≥1180 px): mega menus open on hover (90 ms), click, Enter or Space;
     close on Esc (focus back to the item), mouse-out (180 ms), a click outside,
     focus leaving, or another item opening;
   - search panel; light/dark toggle (saved as "vslm-theme", follows the device
     until chosen);
   - phone and tablet (<1180 px): full-screen menu, + / − sections with one open
     at a time, page scroll locked, focus kept inside, Esc closes.
   Panel contents are server-rendered (mega-panels.tsx, accordion-panels.tsx). */
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { logo } from "@/lib/site-config";
import { ThemeToggle } from "../theme-toggle";
import { PickerButton } from "./branch-picker";
import { Icon } from "./icons";
import { currentNavId, NAV } from "./menu-links";

const DESKTOP = "(min-width: 1180px)";
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

function Brand({ small = false }: { small?: boolean }) {
  return (
    <Link className="brand" href="/" aria-label="VS Lens Mart, home">
      <Image className="brand__mark" src={logo.src} alt="" width={small ? 40 : 52} height={small ? 40 : 52} unoptimized priority />
      {!small && <span className="brand__rule" aria-hidden="true" />}
      <span className="brand__text">
        <span className="brand__name"><b>VS</b> LENS MART</span>
        <span className="brand__est">EST. 1999</span>
      </span>
    </Link>
  );
}

export function Nav({ panels, accordion, footNote }: {
  panels: Record<string, ReactNode>;
  accordion: Record<string, ReactNode>;
  footNote: ReactNode;
}) {
  const pathname = usePathname();
  const current = currentNavId(pathname);
  const [mega, setMega] = useState<string | null>(null);
  const [search, setSearch] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [acc, setAcc] = useState<string | null>(null);
  const nav = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const burger = useRef<HTMLButtonElement>(null);
  const searchBtn = useRef<HTMLButtonElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const leaveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const closeAll = useCallback((returnFocus = false) => {
    setMega((id) => {
      if (returnFocus && id) triggers.current[id]?.focus();
      return null;
    });
  }, []);

  // A link was followed: close everything (reset during render, as React recommends)
  const [seenPath, setSeenPath] = useState(pathname);
  if (seenPath !== pathname) {
    setSeenPath(pathname);
    setMega(null); setSearch(false); setDrawer(false);
  }

  /* ---------- Phone drawer: lock scroll, focus the close button, return focus ---------- */
  const wasOpen = useRef(false);
  useEffect(() => {
    document.documentElement.style.overflow = drawer ? "hidden" : "";
    if (drawer) {
      const t = setTimeout(() => drawerRef.current?.querySelector<HTMLElement>(".drawer__close")?.focus(), reduced() ? 0 : 50);
      wasOpen.current = true;
      return () => clearTimeout(t);
    }
    if (wasOpen.current) { burger.current?.focus(); wasOpen.current = false; }
  }, [drawer]);
  useEffect(() => {
    const m = matchMedia(DESKTOP);
    const onChange = (e: MediaQueryListEvent) => { if (e.matches) setDrawer(false); };
    m.addEventListener("change", onChange);
    return () => m.removeEventListener("change", onChange);
  }, []);

  /* ---------- Esc and clicks outside ---------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (drawer) return setDrawer(false);
      if (search) { setSearch(false); searchBtn.current?.focus(); return; }
      if (mega) closeAll(true);
    };
    const onClick = (e: MouseEvent) => {
      if (!nav.current?.contains(e.target as Node)) { setMega(null); setSearch(false); }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("click", onClick); };
  }, [drawer, search, mega, closeAll]);

  // Keep keyboard focus inside the open drawer
  const trapFocus = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab" || !drawerRef.current) return;
    const f = [...drawerRef.current.querySelectorAll<HTMLElement>("a, button")].filter((el) => el.offsetParent !== null && !el.closest(".acc__panel:not(.is-open)"));
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  /* ---------- Desktop mega menus ---------- */
  const isDesktop = () => matchMedia(DESKTOP).matches;
  const openMega = (id: string) => { setSearch(false); setMega(id); };
  const onEnter = (id: string) => {
    if (!isDesktop()) return;
    clearTimeout(leaveTimer.current); clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => openMega(id), mega ? 0 : 90);
  };

  return (
    <>
      <nav
        ref={nav}
        className="nav on-dark"
        aria-label="Main"
        onMouseLeave={() => { clearTimeout(hoverTimer.current); leaveTimer.current = setTimeout(() => setMega(null), 180); }}
        onMouseEnter={() => clearTimeout(leaveTimer.current)}
      >
        <div className="container nav__inner">
          <Brand />

          <ul className="menu" id="menu">
            {NAV.map((item) => item.mega ? (
              <li
                key={item.id}
                onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setMega((m) => (m === item.id ? null : m)); }}
              >
                <button
                  ref={(el) => { triggers.current[item.id] = el; }}
                  className="menu__link"
                  type="button"
                  aria-expanded={mega === item.id}
                  aria-controls={`mega-${item.id}`}
                  aria-current={current === item.id ? "page" : undefined}
                  onClick={() => { clearTimeout(hoverTimer.current); if (mega === item.id) setMega(null); else openMega(item.id); }}
                  onMouseEnter={() => onEnter(item.id)}
                  onMouseLeave={() => clearTimeout(hoverTimer.current)}
                >
                  {item.label} <Icon name="chev" className="icon chev" />
                </button>
                <div className={`mega ${mega === item.id ? "is-open" : ""}`} id={`mega-${item.id}`} role="region" aria-label={item.label} inert={mega !== item.id}>
                  {panels[item.id]}
                </div>
              </li>
            ) : (
              <li key={item.id}>
                <Link
                  className="menu__link"
                  href={item.href}
                  prefetch={false}
                  aria-current={current === item.id ? "page" : undefined}
                  onMouseEnter={() => { if (isDesktop()) { clearTimeout(hoverTimer.current); setMega(null); } }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="nav__tools">
            <ThemeToggle />
            <button
              ref={searchBtn}
              className="icon-btn icon-btn--search"
              type="button"
              aria-label="Search"
              aria-expanded={search}
              aria-controls="search"
              onClick={() => {
                const on = !search;
                setMega(null); setSearch(on);
                if (on) setTimeout(() => document.querySelector<HTMLInputElement>("#search input")?.focus(), reduced() ? 0 : 60);
              }}
            >
              <Icon name="search" />
            </button>
            <PickerButton kind="whatsapp" className="icon-btn icon-btn--wa" label="Chat on WhatsApp">
              <Icon name="wa" />
            </PickerButton>
            <button
              ref={burger}
              className="icon-btn burger"
              type="button"
              aria-label="Open menu"
              aria-expanded={drawer}
              aria-controls="drawer"
              onClick={() => setDrawer(true)}
            >
              <Icon name="menu" />
            </button>
          </div>
        </div>

        {/* Search (results page: sprint 5.6) */}
        <div className={`search ${search ? "is-open" : ""}`} id="search" inert={!search}>
          <form className="container search__row" role="search" action="/search">
            <label className="search__field">
              <Icon name="search" />
              <span className="sr-only">Search</span>
              <input type="search" name="q" placeholder="Search frames, sunglasses and lenses" autoComplete="off" />
            </label>
            <button className="btn btn--primary" type="submit">Search</button>
          </form>
        </div>
      </nav>

      {/* Phone and tablet menu */}
      <div
        ref={drawerRef}
        className={`drawer ${drawer ? "is-open" : ""}`}
        id="drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!drawer}
        onKeyDown={trapFocus}
      >
        <div className="drawer__head">
          <Brand small />
          <button className="icon-btn drawer__close" type="button" aria-label="Close menu" onClick={() => setDrawer(false)}>
            <Icon name="x" className="icon icon--lg" />
          </button>
        </div>
        <div className="drawer__body">
          <ul className="acc">
            {NAV.map((item) => item.mega ? (
              <li key={item.id}>
                <button
                  className="acc__btn"
                  type="button"
                  aria-expanded={acc === item.id}
                  aria-controls={`acc-${item.id}`}
                  onClick={() => setAcc((a) => (a === item.id ? null : item.id))}
                >
                  {item.label} <span className="acc__sign" aria-hidden="true" />
                </button>
                <div className={`acc__panel ${acc === item.id ? "is-open" : ""}`} id={`acc-${item.id}`} inert={acc !== item.id}>
                  <div>{accordion[item.id]}</div>
                </div>
              </li>
            ) : (
              <li key={item.id}>
                <Link
                  className="acc__link"
                  href={item.href}
                  prefetch={false}
                  aria-current={current === item.id ? "page" : undefined}
                  onClick={() => setDrawer(false)}
                >
                  {item.label} <Icon name="arrow" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="drawer__foot">{footNote}</div>
        </div>
      </div>
    </>
  );
}
