"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

/* Signs out, then loads the login page fresh (not a client-side move). A fresh
   load wipes Next.js's in-memory copy of staff pages, so pressing Back after
   signing out can't show the dashboard again (found by tests 2026-10-23). */
export function SignOutButton({ variant = "button" }: { variant?: "button" | "top" }) {
  const [pending, setPending] = useState(false);
  const signOut = async () => {
    setPending(true);
    await authClient.signOut();
    window.location.replace("/admin/login");
  };
  if (variant === "top") {
    return (
      <button type="button" className="icon-btn adm-top__link" aria-label="Sign out" disabled={pending} onClick={signOut}>
        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 4.5H5.5A1.5 1.5 0 0 0 4 6v12a1.5 1.5 0 0 0 1.5 1.5H10M15 8l4 4-4 4M19 12H9.5" /></svg>
        <span>{pending ? "Signing out…" : "Sign out"}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      disabled={pending}
      onClick={signOut}
      className="inline-flex h-12 items-center rounded-pill border-2 border-btn-ink px-6 font-semibold text-btn-ink disabled:opacity-60"
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
