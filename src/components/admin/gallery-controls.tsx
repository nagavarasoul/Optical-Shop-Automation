"use client";

/* Show / hide one gallery photo, and the admin's Delete (with a confirmation). */
import { useEffect, useRef, useState, useTransition } from "react";
import { deleteGalleryPhoto, setGalleryVisible } from "@/app/admin/(staff)/gallery/actions";

export function GalleryControls({ id, caption, visible, canDelete }: { id: string; caption: string; visible: boolean; canDelete: boolean }) {
  const [, startTransition] = useTransition();
  // The switch flips at once; the saved value from the server takes over when it arrives
  const [on, setOn] = useState({ prop: visible, value: visible });
  if (on.prop !== visible) setOn({ prop: visible, value: visible });
  const [asking, setAsking] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (asking && !dlg.current?.open) dlg.current?.showModal();
    if (!asking && dlg.current?.open) dlg.current.close();
  }, [asking]);
  return (
    <span className="bk-row__ctl">
      <label className="switch">
        <span className="switch__text"><b>On the site</b></span>
        <input type="checkbox" role="switch" checked={on.value} aria-label={`Show "${caption}" on the site`}
          onChange={(e) => { const v = e.target.checked; setOn((x) => ({ ...x, value: v })); startTransition(() => setGalleryVisible(id, v)); }} />
      </label>
      {canDelete && (
        <>
          <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(true)} aria-label={`Delete "${caption}"`}>Delete</button>
          <dialog className="adm-dialog" ref={dlg} onClose={() => setAsking(false)} aria-labelledby={`del-${id}`}>
            <h2 id={`del-${id}`}>Delete this photo permanently?</h2>
            <p>&quot;{caption}&quot;. This can&apos;t be undone.</p>
            <div className="adm-dialog__actions">
              <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(false)}>Cancel</button>
              <button className="btn btn--primary" type="button" onClick={() => { setAsking(false); startTransition(async () => { await deleteGalleryPhoto(id); }); }}>Delete photo</button>
            </div>
          </dialog>
        </>
      )}
    </span>
  );
}
