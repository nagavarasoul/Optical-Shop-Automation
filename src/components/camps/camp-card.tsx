import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/site/icons";
import { longDate } from "@/lib/camp-rules";
import type { CampItem } from "@/lib/queries/content";

/* A camp card (mockups/eye-camps.html "Past camps", camp-detail.html "More camps"):
   the cover photo or a placeholder, date, title, place, and people checked. */
export function CampCard({ c, upcoming = false }: { c: CampItem; upcoming?: boolean }) {
  return (
    <Link className="ccard" href={`/eye-camps/${c.slug}`}>
      {c.cover ? (
        <div className="ccard__img"><Image src={`/media/${c.cover}`} alt={`${c.title}, ${longDate(c.day)}`} fill sizes="(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw" /></div>
      ) : (
        <div className="ph" aria-hidden="true"><Icon name="camp" /></div>
      )}
      <time dateTime={c.day}>{longDate(c.day)}</time>
      <h3>{c.title}</h3>
      <p>{upcoming ? "Upcoming · " : ""}{c.place}</p>
      {!upcoming && c.people != null && <span className="ccard__people"><Icon name="eye" className="icon icon--sm" />{c.people.toLocaleString("en-IN")} people checked</span>}
    </Link>
  );
}
