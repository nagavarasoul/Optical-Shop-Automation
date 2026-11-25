import Link from "next/link";

/* A staff-area address that doesn't exist, shown inside the staff shell
   rather than as the public page. Signed-out visitors never get here: they
   are sent to /admin/login first. Spec: Requirements_NotFound.md section 4 */
export default function AdminNotFound() {
  return (
    <div className="adm-head">
      <h1>Page not found</h1>
      <p>This staff page doesn&apos;t exist. Use the menu, or go back to the dashboard.</p>
      <p><Link className="btn btn--primary" href="/admin">Back to the dashboard</Link></p>
    </div>
  );
}
