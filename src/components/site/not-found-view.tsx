import Link from "next/link";
import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/site/icons";
import { AskOnWhatsApp } from "@/components/site/not-found-help";

/* The "page not found" and "something went wrong" layout, from the signed-off
   mockup (mockups/404.html). Spec: docs/requirements/Requirements_NotFound.md.
   No hooks here: the 404 pages render it on the server, the error page
   (a client component) in the browser. */

export type NotFoundVariant = "page" | "frames" | "sunglasses" | "camps" | "error";

type Card = { href: string; icon: IconName; title: string; text: string };

const TEXT: Record<NotFoundVariant, { icon: IconName; square?: boolean; code: string; title: string; text: string }> = {
  page: {
    icon: "glasses", code: "404",
    title: "This page is a little out of focus.",
    text: "We couldn't find the page you were looking for. It may have moved, or the link may be wrong.",
  },
  frames: {
    icon: "glasses", code: "404",
    title: "This frame isn’t available.",
    text: "It may have been sold or removed. Have a look at what we have now, or ask us for something similar.",
  },
  sunglasses: {
    icon: "glasses", code: "404",
    title: "These sunglasses aren’t available.",
    text: "It may have been sold or removed. Have a look at what we have now, or ask us for something similar.",
  },
  camps: {
    icon: "camp", square: true, code: "404",
    title: "This camp isn’t available.",
    text: "It may have been removed. See our upcoming and past eye camps instead.",
  },
  error: {
    icon: "alert", square: true, code: "Error",
    title: "Something went wrong on our side.",
    text: "Please try again. If it keeps happening, call or WhatsApp us and we'll help straight away.",
  },
};

function cards(variant: NotFoundVariant, visitText: string): Card[] {
  const c: Record<string, Card> = {
    frames: { href: "/frames", icon: "glasses", title: "Frames", text: "Eyeglasses and computer glasses" },
    sunglasses: { href: "/sunglasses", icon: "sun", title: "Sunglasses", text: "Branded and everyday pairs" },
    book: { href: "/book-eye-test", icon: "cal", title: "Book an eye test", text: "Pick a branch, a day and a time" },
    visit: { href: "/contact#branches", icon: "store", title: "Visit a branch", text: visitText },
    camps: { href: "/eye-camps", icon: "camp", title: "Eye camps", text: "Upcoming and past camps" },
  };
  if (variant === "frames") c.frames = { ...c.frames, title: "See all frames", text: "What we have in stock now" };
  if (variant === "sunglasses") c.sunglasses = { ...c.sunglasses, title: "See all sunglasses", text: "What we have in stock now" };
  const order =
    variant === "sunglasses" ? ["sunglasses", "frames", "book", "visit"]
    : variant === "camps" ? ["camps", "book", "frames", "visit"]
    : ["frames", "sunglasses", "book", "visit"];
  return order.map((k) => c[k]);
}

/** `action`: the search form (404) or the Try again / Call buttons (error page). */
export function NotFoundView({ variant, visitText, action }: { variant: NotFoundVariant; visitText: string; action: ReactNode }) {
  const t = TEXT[variant];
  return (
    <div className="container">
      <section className="notfound notfound--page" aria-labelledby="nf-title">
        <Icon name={t.icon} className={t.square ? "icon icon--square" : "icon"} />
        <p className="caps notfound__code">{t.code}</p>
        <h1 id="nf-title">{t.title}</h1>
        <p>{t.text}</p>
        {action}
      </section>

      <nav aria-labelledby="nf-next">
        <h2 className="sr-only" id="nf-next">Where to next</h2>
        <div className="nf-cards">
          {cards(variant, visitText).map((c) => (
            <Link key={c.href} className="quick__card" href={c.href}>
              <span className="quick__icon"><Icon name={c.icon} /></span>
              <span><span className="quick__title">{c.title}</span><span className="quick__text">{c.text}</span></span>
              <Icon name="arrow" />
            </Link>
          ))}
        </div>
      </nav>

      <div className="nf-help">
        <span>Still can&apos;t find it?</span>
        <AskOnWhatsApp error={variant === "error"} />
        <Link className="btn btn--outline-dark" href="/">Back to home</Link>
      </div>
    </div>
  );
}

/** The 404 pages' search form: the same search as the header (`/search`). */
export function NotFoundSearch() {
  return (
    <form className="nf-search" role="search" action="/search">
      <label className="sr-only" htmlFor="nf-q">Search frames, sunglasses and lenses</label>
      <input type="search" id="nf-q" name="q" placeholder="Search frames, sunglasses and lenses" autoComplete="off" />
      <button className="btn btn--primary" type="submit">Search</button>
    </form>
  );
}
