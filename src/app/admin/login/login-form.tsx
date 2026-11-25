"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";

/* Only same-site staff-area paths are allowed as the place to return to,
   so the login page can't be used to send someone to another website. */
function safeNext(): string {
  const next = new URLSearchParams(window.location.search).get("next") ?? "";
  return /^\/admin(\/[\w\-/?=&%.]*)?$/.test(next) && !next.startsWith("/admin/login") ? next : "/admin";
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (!email || !password) {
      setError("Enter your email and password.");
      return;
    }
    setPending(true);
    setError("");
    const { error } = await authClient.signIn.email({ email, password });
    if (error) {
      setPending(false);
      setError(
        error.status === 429
          ? "Too many attempts. Wait a few minutes and try again."
          : error.status === 403
            ? "This account is switched off. Ask the admin."
            : "That email and password don't match. Check them and try again.",
      );
      return;
    }
    router.replace(safeNext());
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      {error && (
        <p role="alert" className="rounded-sm border-l-4 border-gold bg-bg px-4 py-3 text-sm text-text">
          {error}
        </p>
      )}
      <label className="grid gap-1.5 text-sm font-semibold text-heading">
        Email
        <input
          name="email"
          type="email"
          autoComplete="username"
          required
          className="h-12 rounded-sm border-[1.5px] border-line bg-surface px-4 text-base font-normal text-text"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold text-heading">
        Password
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-12 rounded-sm border-[1.5px] border-line bg-surface px-4 text-base font-normal text-text"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 inline-flex h-12 items-center justify-center rounded-pill bg-gold px-6 font-semibold text-navy disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-sm text-muted">Forgot your password? Ask the admin to set a new one.</p>
    </form>
  );
}
