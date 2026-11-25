/* The staff pages' loading state (sprint 5.6 part D): the shape of a page
   heading and a few list rows while the data comes in, instead of a bare
   "Loading…", so the page doesn't jump when it arrives. Screen readers hear
   "Loading…". The shimmer is off with reduced motion (admin.css). */
export function AdminLoading() {
  return (
    <div className="adm-loading" role="status" aria-busy="true">
      <span className="sr-only">Loading…</span>
      <span className="adm-loading__bar adm-loading__bar--title" aria-hidden="true" />
      <span className="adm-loading__bar adm-loading__bar--text" aria-hidden="true" />
      {[0, 1, 2, 3].map((i) => <span key={i} className="adm-loading__row" aria-hidden="true" />)}
    </div>
  );
}
