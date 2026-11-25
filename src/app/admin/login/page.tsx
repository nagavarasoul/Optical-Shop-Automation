import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Staff sign in" };

/* /admin/login (Requirements_Admin.md section 3). No link to it from the public
   site; there's no sign-up, accounts are made by the admin. */
export default function LoginPage() {
  return (
    <main id="main" className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-md border border-line bg-surface p-6 shadow-panel sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-accent-ink">VS Lens Mart · Staff area</p>
        <h1 className="mt-2 text-3xl">Sign in</h1>
        <p className="mt-2 mb-6 text-sm text-muted">For shop staff only.</p>
        <LoginForm />
      </div>
    </main>
  );
}
