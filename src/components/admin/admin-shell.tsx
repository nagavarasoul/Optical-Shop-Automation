"use client";

/* Staff area shell (Requirements_Admin.md section 4), ported from the signed-off
   mockup (mockups/admin.js): top bar, sidebar (a drawer below 1024 px) with the
   branch switcher, menu counts, and the phone "Add frame" button.
   Data comes from the server layout; the role decides what's shown, and the
   server and database check it again on every action. */
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { setWorkingBranch } from "@/app/admin/(staff)/actions";
import { SignOutButton } from "@/app/admin/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";
import { logo } from "@/lib/site-config";
import { AdminIcon, type AdminIconName } from "./admin-icons";

export type ShellProps = {
  user: { name: string; role: "admin" | "staff" };
  branch: { slug: string; name: string; address: string };
  branches: { slug: string; name: string }[];
  counts: { frames: number; sunglasses: number; bookings: number; enquiries: number };
  children: ReactNode;
};

type Item = { href: string; label: string; icon: AdminIconName; count?: number; countLabel?: string };

export function AdminShell({ user, branch, branches, counts, children }: ShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuBtn = useRef<HTMLButtonElement>(null);
  const side = useRef<HTMLElement>(null);
  const admin = user.role === "admin";

  // Below 1024 px the sidebar is a drawer; closed, it's inert so keyboards and screen readers skip it
  useEffect(() => {
    const m = matchMedia("(max-width: 1023px)");
    const sync = () => setPhone(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, []);
  // A link was followed: close the drawer (reset during render, as React recommends)
  const [seen, setSeen] = useState(pathname);
  if (seen !== pathname) { setSeen(pathname); setOpen(false); }
  useEffect(() => {
    if (!open) return;
    side.current?.querySelector<HTMLElement>("a")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); menuBtn.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const main: Item[] = [
    { href: "/admin", label: "Dashboard", icon: "grid" },
    { href: "/admin/frames", label: "Frames", icon: "glasses", count: counts.frames, countLabel: admin ? "waiting for approval" : "of yours not yet approved" },
    { href: "/admin/sunglasses", label: "Sunglasses", icon: "sun", count: counts.sunglasses, countLabel: "waiting for approval" },
    { href: "/admin/lenses", label: "Lenses", icon: "lens" },
    { href: "/admin/eye-camps", label: "Eye camps", icon: "camp" },
    { href: "/admin/gallery", label: "Gallery", icon: "image" },
    { href: "/admin/testimonials", label: "Testimonials", icon: "star" },
    { href: "/admin/bookings", label: "Bookings", icon: "cal", count: counts.bookings, countLabel: "today" },
    { href: "/admin/enquiries", label: "Enquiries", icon: "inbox", count: counts.enquiries, countLabel: "new" },
  ];
  const settings: Item[] = [
    { href: "/admin/branches", label: "Branches", icon: "pin" },
    { href: "/admin/staff", label: "Staff accounts", icon: "gear" },
    { href: "/admin/holidays", label: "Branch holidays", icon: "cal" },
  ];
  const isCurrent = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`));
  const navLinks = (items: Item[]) => (
    <ul className="adm-nav">
      {items.map((i) => (
        <li key={i.href}>
          <Link href={i.href} aria-current={isCurrent(i.href) ? "page" : undefined}>
            <AdminIcon name={i.icon} />{i.label}
            {!!i.count && <span className="adm-count" aria-label={`${i.count} ${i.countLabel}`}>{i.count}</span>}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    // The frame form has its own sticky action bar, so no floating "Add frame" button there
    <div className="adm-body flex min-h-full flex-1 flex-col" data-role={user.role}
      data-admin={/^\/admin\/(frames|sunglasses)\/.+/.test(pathname) ? "frames" : undefined}>
      <a className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-pill focus:bg-gold focus:px-4 focus:py-2 focus:font-semibold focus:text-navy" href="#main">Skip to content</a>
      <header className="adm-top on-dark">
        <button ref={menuBtn} className="icon-btn adm-top__menu" type="button" aria-expanded={open} aria-controls="adm-side" aria-label="Menu" onClick={() => setOpen(!open)}>
          <AdminIcon name="menu" className="icon icon--lg" />
        </button>
        <Link className="brand" href="/admin" aria-label="VS Lens Mart staff area, dashboard">
          <Image className="brand__mark" src={logo.src} alt="" width={40} height={40} unoptimized />
          <span className="brand__text">
            <span className="brand__name"><b>VS</b> LENS MART</span>
            <span className="brand__est">STAFF AREA</span>
          </span>
        </Link>
        <div className="adm-top__right">
          <span className="adm-user">
            <span className="adm-user__name">{user.name}</span>
            <span className="adm-badge adm-badge--gold">{admin ? "Admin" : "Staff"}</span>
            <span className="adm-user__branch">{branch.name}</span>
          </span>
          <ThemeToggle />
          {/* No prefetch: every staff page would otherwise render the public homepage (and its frames and camps) in the background */}
          <Link className="icon-btn adm-top__link" href="/" prefetch={false} aria-label="View site"><AdminIcon name="ext" /><span>View site</span></Link>
          <SignOutButton variant="top" />
        </div>
      </header>

      <div className="adm">
        <nav ref={side} className={`adm-side ${open ? "is-open" : ""}`} id="adm-side" aria-label="Staff area" inert={phone && !open}>
          <Link className="btn btn--primary adm-side__add" href="/admin/frames/new"><AdminIcon name="plus" className="icon icon--sm" />Add frame</Link>
          <div className="adm-branch">
            {admin ? (
              <>
                <label className="caps adm-side__label" htmlFor="adm-branch">Working on branch</label>
                <select
                  className="adm-select"
                  id="adm-branch"
                  value={branch.slug}
                  disabled={pending}
                  onChange={(e) => {
                    const slug = e.target.value;
                    startTransition(async () => { await setWorkingBranch(slug); router.refresh(); });
                  }}
                >
                  {branches.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                </select>
              </>
            ) : (
              <><p className="caps adm-side__label">Your branch</p><b>{branch.name}</b></>
            )}
            <address className="adm-branch__addr"><AdminIcon name="pin" className="icon icon--sm" />{branch.address}</address>
          </div>
          {navLinks(main)}
          {admin && (
            <div>
              <p className="caps adm-side__label">Settings</p>
              {navLinks(settings)}
            </div>
          )}
        </nav>
        {open && <div className="adm-scrim" onClick={() => setOpen(false)} />}
        <main id="main" className="adm-main">{children}</main>
      </div>
      <Link className="btn btn--primary adm-fab" href="/admin/frames/new"><AdminIcon name="plus" className="icon icon--sm" />Add frame</Link>
    </div>
  );
}
