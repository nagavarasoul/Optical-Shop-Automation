/* Staff testimonials (Requirements_Admin.md 7): the form (add, or edit with ?id=)
   and every testimonial, hidden ones included. Only real customers who agreed. */
import Link from "next/link";
import { withRole } from "@/lib/db";
import { testimonialsAdminList } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { getBranches } from "@/lib/site-data";
import { TestimonialForm } from "./testimonial-form";

type SP = Promise<Record<string, string | string[] | undefined>>;

export async function TestimonialsAdmin({ searchParams }: { searchParams: SP }) {
  const staff = await requireStaff();
  const sp = await searchParams;
  const [rows, branches] = await Promise.all([withRole(staff.role, (tx) => testimonialsAdminList(tx), staff.id), getBranches()]);
  const editing = typeof sp.id === "string" ? rows.find((r) => r.id === sp.id) ?? null : null;
  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">Testimonials</li></ol></nav>
        <h1>Testimonials</h1>
        <p>Only a real customer&apos;s own words, with their permission. Never write a review for someone.</p>
      </header>
      <TestimonialForm key={editing?.id ?? "new"} role={staff.role} branches={branches.map((b) => ({ slug: b.slug, name: b.name }))}
        item={editing && { id: editing.id, firstName: editing.firstName, branch: editing.branch, quote: editing.quote, agreedOn: editing.agreedOn, isVisible: editing.isVisible }} />
      <section className="apanel" aria-labelledby="tl-title" style={{ marginTop: 24 }}>
        <div className="apanel__head"><h2 id="tl-title"><span>Testimonials ({rows.length})</span></h2></div>
        <div className="apanel__body">
          <div className="bk-list">
            {rows.length === 0 ? <p className="apanel__empty">None yet.</p> : rows.map((r) => (
              <div className="bk-row" key={r.id}>
                <span className="bk-row__time">{r.agreedOn.slice(8)}/{r.agreedOn.slice(5, 7)}/{r.agreedOn.slice(2, 4)}</span>
                <span className="bk-row__who">
                  <b>{r.firstName}{r.branchName ? ` · ${r.branchName}` : ""}</b>
                  <span className="bk-row__msg">&ldquo;{r.quote}&rdquo;</span>
                  <span>{r.isVisible ? <span className="adm-badge adm-badge--ok">On the site</span> : <span className="adm-badge adm-badge--muted">Hidden</span>}</span>
                </span>
                <Link className="btn btn--outline-dark" href={`/admin/testimonials?id=${r.id}`} aria-label={`Edit ${r.firstName}'s testimonial`}>Edit</Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
