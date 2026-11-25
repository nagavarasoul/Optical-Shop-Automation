/* One branch card (Requirements_Contact.md 3.1), shared by Contact and About:
   address, hours and the next closed day, services, open now, its own Call /
   WhatsApp, Directions, and a map that loads only when needed. */
import { BranchLink } from "@/components/site/branch-link";
import { DummyTag } from "@/components/site/dummy-tag";
import { Icon } from "@/components/site/icons";
import { eyeCareServices } from "@/components/site/menu-links";
import { dayLabel } from "@/lib/booking-rules";
import type { Branch, Closure } from "@/lib/queries/site";
import { time12 } from "@/lib/site-config";
import { BranchMap, OpenStatus } from "./branch-live";

const directions = (b: Branch) => b.mapUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`VS Lens Mart, ${b.address}`)}`;
const days = (b: Branch) => (b.openDays.length === 7 ? "Mon–Sun" : b.openDays.join(", "));
/** A closure's note without the seed's DUMMY marker (the tag shows it instead, in development). */
const cleanNote = (n: string | null) => (n ?? "").replace(/\s*\(DUMMY[^)]*\)/, "").trim();

export function BranchCard({ b, closures }: { b: Branch; closures: Closure[] }) {
  const mine = closures.filter((c) => c.branchSlug === null || c.branchSlug === b.slug);
  const next = mine[0];
  return (
    <article className="branch" id={b.slug} aria-labelledby={`${b.slug}-name`}>
      <BranchMap name={b.name} address={`VS Lens Mart, ${b.address}`} />
      <div className="branch__body">
        <div className="branch__head">
          <h3 className="branch__name" id={`${b.slug}-name`}>{b.name}</h3>
          <OpenStatus opens={b.opens} closes={b.closes} openDays={b.openDays} closedDays={mine.map((c) => c.day)} />
        </div>
        <p className="branch__row"><Icon name="pin" /><span>{b.address}</span></p>
        <p className="branch__row"><Icon name="clock" /><span>
          {days(b)} · {time12(b.opens)}–{time12(b.closes)}
          {next && <><br />Closed on {dayLabel(next.day)}{cleanNote(next.note) && ` (${cleanNote(next.note)})`} <DummyTag id="D3" /></>}
        </span></p>
        <p className="branch__row"><Icon name="phone" /><span>{b.dummy ? "+91 00000 00000" : b.phone}{b.dummy && <> <DummyTag id="D2" /></>}</span></p>
        <ul className="pill-list" aria-label={`Services at ${b.name}`}>{eyeCareServices.map((s) => <li key={s.label}>{s.label}</li>)}</ul>
        <div className="branch__actions">
          <a className="btn btn--outline-dark" href={directions(b)} target="_blank" rel="noopener noreferrer" aria-label={`Directions to the ${b.name} branch`}><Icon name="pin" className="icon icon--sm" />Directions</a>
          <BranchLink b={b} kind="call" className="btn btn--outline-dark" label={`Call the ${b.name} branch`}>Call</BranchLink>
          <BranchLink b={b} kind="whatsapp" className="btn btn--outline-dark" label={`WhatsApp the ${b.name} branch`} text={`Hi VS Lens Mart, I have a question for the ${b.name} branch.`}>WhatsApp</BranchLink>
        </div>
      </div>
    </article>
  );
}
