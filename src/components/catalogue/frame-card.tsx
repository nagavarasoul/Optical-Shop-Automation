"use client";

/* The frame card (Requirements_HomePage.md 3.6, Requirements_Frames.md 3.4),
   ported from the signed-off mockup (mockups/frames-data.js card()): photo,
   brand and model, exact price, where it's available, Sold out, the heart and
   Enquire (branch picker, with the code in the WhatsApp text). */
import Link from "next/link";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";
import { rupees } from "@/components/site/menu-links";
import type { CatalogueItem } from "@/lib/queries/catalogue";
import { FramePhoto } from "./frame-photo";
import { enquiryText, photoAlt } from "./frame-text";


export function FrameCard({ f, saved, onToggle, eager = false }: {
  f: CatalogueItem; saved: boolean; onToggle: (code: string) => void; eager?: boolean;
}) {
  const name = `${f.brand} ${f.model}`;
  return (
    <article className={`fcard${f.sold ? " fcard--sold" : ""}`}>
      <Link className="fcard__media" href={f.href} aria-label={name}>
        <FramePhoto path={f.photo} alt={photoAlt(f)} sizes="(min-width: 1180px) 300px, (min-width: 768px) 33vw, 50vw" priority={eager} />
        {f.sold && <span className="fcard__badge">Sold out</span>}
      </Link>
      <button className="fcard__fav" type="button" aria-pressed={saved} aria-label={`Save ${name} to favourites`} onClick={() => onToggle(f.code)}>
        <Icon name="heart" />
      </button>
      <span className="caps fcard__brand">
        {f.brand}
        {f.lens.length > 0 && <span className="fcard__lens">{f.lens.join(" · ")}</span>}
      </span>
      <Link className="fcard__name" href={f.href}>{f.model}</Link>
      <div className="fcard__meta">
        <span className="fcard__price">{rupees(f.price)}</span>
        <span className="fcard__where">{f.where}</span>
      </div>
      <PickerButton kind="whatsapp" className="btn btn--outline-dark fcard__enquire" waText={enquiryText(f)} label={`Enquire about ${name} on WhatsApp`}>
        Enquire
      </PickerButton>
    </article>
  );
}
