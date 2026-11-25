"use client";

/* Status and Delete for one booking or enquiry in the staff lists
   (Requirements_Admin.md 7). Staff change the status; only an admin sees
   Delete, which asks first (and the database refuses staff anyway). */
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteCustomerRow, setBookingStatus, setEnquiryStatus } from "@/app/admin/(staff)/actions";

export function RowControls({ kind, id, status, statuses, label, canDelete }: {
  kind: "booking" | "enquiry"; id: string; status: string; statuses: readonly (readonly [string, string])[]; label: string; canDelete: boolean;
}) {
  const [, startTransition] = useTransition();
  const [asking, setAsking] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (asking && !dlg.current?.open) dlg.current?.showModal();
    if (!asking && dlg.current?.open) dlg.current.close();
  }, [asking]);
  return (
    <>
      <select
        className="adm-select"
        aria-label={`Status for ${label}`}
        defaultValue={status}
        onChange={(e) => { const s = e.target.value; startTransition(() => (kind === "booking" ? setBookingStatus(id, s) : setEnquiryStatus(id, s))); }}
      >
        {statuses.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      {canDelete && (
        <>
          <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(true)} aria-label={`Delete ${label}`}>Delete</button>
          <dialog className="adm-dialog" ref={dlg} onClose={() => setAsking(false)} aria-labelledby={`del-${id}`}>
            <h2 id={`del-${id}`}>Delete this {kind} permanently?</h2>
            <p>{label}. This can&apos;t be undone.</p>
            <div className="adm-dialog__actions">
              <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(false)}>Cancel</button>
              <button className="btn btn--primary" type="button" onClick={() => { setAsking(false); startTransition(async () => { await deleteCustomerRow(kind, id); }); }}>Delete {kind}</button>
            </div>
          </dialog>
        </>
      )}
    </>
  );
}
