/* Staff frames / sunglasses list (Requirements_Admin.md section 7): search by
   code, brand or model; filter by status, availability and branch; the
   viewer's own drafts and sent-back frames first; one-tap Sold out; each row
   opens the frame form. Filters are a plain GET form, so they live in the URL. */
import Link from "next/link";
import { withRole } from "@/lib/db";
import { framesList, type Kind, type ListFilters } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { staffNames } from "@/lib/staff-directory";
import { AdminIcon } from "./admin-icons";
import { SoldOutToggle } from "./sold-out-toggle";

const STATUS: Record<string, [string, string]> = {
  draft: ["Draft", "adm-badge--muted"], waiting: ["Waiting for approval", "adm-badge--gold"],
  sent_back: ["Sent back", "adm-badge--alert"], approved: ["Approved", "adm-badge--ok"],
};
const WHERE: Record<string, string> = { indresham: "Indresham", patelguda: "Patelguda", both: "Both branches" };
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export async function FramesList({ kind, searchParams }: { kind: Kind; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const staff = await requireStaff();
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const f: ListFilters & { mine?: string } = { q: one("q"), status: one("status"), avail: one("avail"), branch: one("branch"), mine: one("mine") };
  let rows = await withRole(staff.role, (tx) => framesList(tx, kind, f, staff.id), staff.id);
  if (f.mine) rows = rows.filter((r) => r.createdBy === staff.id);
  const names = await staffNames(rows.map((r) => r.createdBy));
  const noun = kind === "sunglasses" ? "sunglasses" : "frames";
  const base = `/admin/${kind}`;

  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">{kind === "sunglasses" ? "Sunglasses" : "Frames"}</li></ol></nav>
        <h1>{kind === "sunglasses" ? "Sunglasses" : "Frames"}</h1>
        <p>{rows.length} {noun}{f.q || f.status || f.avail || f.branch || f.mine ? " match these filters" : ""}. Tap Sold out to change it on the site straight away.</p>
      </header>

      <form className="adm-tools" action={base} role="search" aria-label={`Find ${noun}`}>
        <div className="ffield" style={{ marginBottom: 0, flex: "1 1 16rem" }}>
          <label htmlFor="q">Search code, brand or model</label>
          <input id="q" name="q" type="text" defaultValue={f.q} placeholder={kind === "sunglasses" ? "e.g. SG-2017 or Ray-Ban" : "e.g. VSF-1024 or Titan"} />
        </div>
        <div className="ffield" style={{ marginBottom: 0 }}>
          <label htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={f.status ?? ""}>
            <option value="">All</option><option value="waiting">Waiting for approval</option><option value="sent_back">Sent back</option>
            <option value="draft">Draft</option><option value="approved">Approved</option><option value="hidden">Hidden from site</option>
          </select>
        </div>
        <div className="ffield" style={{ marginBottom: 0 }}>
          <label htmlFor="avail">Availability</label>
          <select id="avail" name="avail" defaultValue={f.avail ?? ""}>
            <option value="">All</option><option value="in_stock">In stock</option><option value="sold_out">Sold out</option>
          </select>
        </div>
        <div className="ffield" style={{ marginBottom: 0 }}>
          <label htmlFor="branch">Branch</label>
          <select id="branch" name="branch" defaultValue={f.branch ?? ""}>
            <option value="">Both</option><option value="indresham">Indresham</option><option value="patelguda">Patelguda</option>
          </select>
        </div>
        <button className="btn btn--outline-dark" type="submit"><AdminIcon name="search" className="icon icon--sm" />Show</button>
        <Link className="btn btn--primary" href={`${base}/new`}><AdminIcon name="plus" className="icon icon--sm" />Add {kind === "sunglasses" ? "sunglasses" : "frame"}</Link>
      </form>

      <section className="apanel" aria-label={`${noun} list`}>
        <div className="apanel__body">
          <div className="dq-list">
            {rows.length === 0 ? <p className="apanel__empty">No {noun} match. Try clearing the filters.</p> : rows.map((r) => {
              const [label, cls] = STATUS[r.status];
              const by = r.createdBy ? names.get(r.createdBy)?.name : undefined;
              return (
                <div className="dq-row" key={r.id}>
                  <span className="dq-thumb" aria-hidden="true"><AdminIcon name="glasses" /></span>
                  <span className="dq-row__text">
                    <b><Link href={`${base}/${r.code}`}>{r.brand} {r.model}</Link></b>
                    <span>{r.code} · {rupees(r.price)} · {WHERE[r.availableAt]} · {r.photos} photo{r.photos === 1 ? "" : "s"}{by ? ` · added by ${by}` : ""}</span>
                    <span>
                      <span className={`adm-badge ${cls}`}>{label}</span>{" "}
                      {!r.isActive && <span className="adm-badge adm-badge--muted">Hidden from site</span>}
                    </span>
                    {r.status === "sent_back" && r.reviewNote && <span className="dq-note"><b>Admin&apos;s note:</b> {r.reviewNote}</span>}
                  </span>
                  <SoldOutToggle frameId={r.id} soldOut={r.availability === "sold_out"} label={`${r.brand} ${r.model}`} />
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
