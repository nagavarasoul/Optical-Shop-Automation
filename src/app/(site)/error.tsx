"use client"; // error boundaries must be client components

import { PickerButton } from "@/components/site/branch-picker";
import { NotFoundView } from "@/components/site/not-found-view";

/* A public page that failed while loading, inside the site's normal layout.
   Customers never see technical details: the real error is already in the
   server log (server errors reach the browser only as a reference number).
   Spec: docs/requirements/Requirements_NotFound.md section 3 */
export default function SiteError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <>
      <title>Something went wrong | VS Lens Mart</title>
      <meta name="robots" content="noindex" />
      <NotFoundView
        variant="error"
        visitText="Addresses, hours and maps"
        action={
          <div className="empty__actions">
            <button className="btn btn--primary" type="button" onClick={() => retry()}>Try again</button>
            <PickerButton kind="call" className="btn btn--outline-dark">Call us</PickerButton>
          </div>
        }
      />
    </>
  );
}
