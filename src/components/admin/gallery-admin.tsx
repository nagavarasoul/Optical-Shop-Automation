/* Staff gallery (Requirements_Admin.md 7): add photos, then show / hide each one;
   only an admin deletes. Hidden photos are listed too (staff can still see them). */
import Link from "next/link";
import { workingBranch } from "@/lib/admin-branch";
import { withRole } from "@/lib/db";
import { GALLERY_BRANCHES, monthLabel, tagLabel } from "@/lib/gallery-rules";
import { galleryAdminList } from "@/lib/queries/admin";
import { requireStaff } from "@/lib/session";
import { GalleryControls } from "./gallery-controls";
import { GalleryUpload } from "./gallery-upload";

export async function GalleryAdmin() {
  const staff = await requireStaff();
  const [rows, branch] = await Promise.all([withRole(staff.role, (tx) => galleryAdminList(tx), staff.id), workingBranch(staff)]);
  const branchName = (b: string) => GALLERY_BRANCHES.find(([v]) => v === b)?.[1] ?? b;
  return (
    <>
      <header className="adm-head">
        <nav aria-label="Breadcrumb"><ol className="crumbs"><li><Link href="/admin">Dashboard</Link></li><li aria-current="page">Gallery</li></ol></nav>
        <h1>Gallery</h1>
        <p>Photos of the shops, team, frames and eye camps. They show on the Gallery page as soon as they&apos;re added.</p>
      </header>
      <GalleryUpload defaultBranch={branch} />
      <section className="apanel" aria-labelledby="g-title" style={{ marginTop: 24 }}>
        <div className="apanel__head"><h2 id="g-title"><span>Photos ({rows.length})</span></h2></div>
        <div className="apanel__body">
          <div className="bk-list">
            {rows.length === 0 ? <p className="apanel__empty">No photos yet. Add the first ones above.</p> : rows.map((p) => (
              <div className="bk-row gadm-row" key={p.id}>
                <span className="gadm-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element -- staff preview of a /media photo, hidden ones included */}
                  <img src={`/media/${p.path}`} alt="" loading="lazy" />
                </span>
                <span className="bk-row__who">
                  <b>{p.caption}</b>
                  <span>{tagLabel(p.tag)} · {branchName(p.branch)}{p.month ? ` · ${monthLabel(p.month)}` : ""}{p.showsPeople ? " · shows people (permission recorded)" : ""}</span>
                </span>
                <GalleryControls id={p.id} caption={p.caption} visible={p.isVisible} canDelete={staff.role === "admin"} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
