/* Staff lenses list (Requirements_Admin.md 7): search by brand or name, filter
   by type and shown / hidden, each row opens the form. A plain GET form, so the
   filters live in the address. */
import Link from "next/link";
import { withRole } from "@/lib/db";
import { LENS_TYPES, lensTypeName } from "@/lib/lens-rules";
import { lensesList } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { AdminIcon } from "./admin-icons";

type SP = Promise<Record<string, string | string[] | undefined>>;
const rupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export async function LensesList({ searchParams }: { searchParams: SP }) {
  const staff = await requireStaff();
  const sp = await searchParams;
  const one = (k: string) => (typeof sp[k] === "string" ? (sp[k] as string) : undefined);
  const f = { q: one("q"), type: LENS_TYPES.some((t) => t.id === one("type")) ? one("type") : undefined, active: one("active") };
  const rows = await withRole(staff.role, (tx) => lensesList(tx, f), staff.id);

  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">Lenses</li></ol></nav>
        <h1>Lenses</h1>
        <p>{rows.length} lens{rows.length === 1 ? "" : "es"}{f.q || f.type || f.active ? " match these filters" : ""}. Active lenses show on the Lenses page straight away.</p>
      </header>
      <form className="adm-tools" action="/admin/lenses" role="search" aria-label="Find lenses">
        <div className="ffield" style={{ marginBottom: 0, flex: "1 1 16rem" }}>
          <label htmlFor="q">Search brand or lens name</label>
          <input id="q" name="q" type="text" defaultValue={f.q} placeholder="e.g. ZEISS or Crizal" />
        </div>
        <div className="ffield" style={{ marginBottom: 0 }}>
          <label htmlFor="type">Type</label>
          <select id="type" name="type" defaultValue={f.type ?? ""}>
            <option value="">All</option>
            {LENS_TYPES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>
        <div className="ffield" style={{ marginBottom: 0 }}>
          <label htmlFor="active">On the site</label>
          <select id="active" name="active" defaultValue={f.active ?? ""}>
            <option value="">All</option><option value="yes">Shown</option><option value="no">Hidden</option>
          </select>
        </div>
        <button className="btn btn--outline-dark" type="submit"><AdminIcon name="search" className="icon icon--sm" />Show</button>
        <Link className="btn btn--primary" href="/admin/lenses/new"><AdminIcon name="plus" className="icon icon--sm" />Add lens</Link>
      </form>
      <section className="apanel" aria-label="Lenses list">
        <div className="apanel__body">
          <div className="dq-list">
            {rows.length === 0 ? <p className="apanel__empty">No lenses match. Tap &quot;Add lens&quot; to add one.</p> : rows.map((r) => (
              <div className="dq-row" key={r.id}>
                <span className="dq-thumb" aria-hidden="true"><AdminIcon name="lens" /></span>
                <span className="dq-row__text">
                  <b><Link href={`/admin/lenses/${r.id}`}>{r.brand} {r.name}</Link></b>
                  <span>{lensTypeName(r.type)} · {r.price != null ? rupees(r.price) : "Ask for price"}{r.features.length ? ` · ${r.features.join(", ")}` : ""}</span>
                  <span>{r.isActive ? <span className="adm-badge adm-badge--ok">On the site</span> : <span className="adm-badge adm-badge--muted">Hidden</span>}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
