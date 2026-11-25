"use client";

/* Staff accounts forms (admin): add an account, and one account's settings
   (name, role, branch; new password; switch off / on; delete a sample).
   Passwords are typed twice, never shown back, and cleared after saving. */
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { addAccount, removeSample, resetPassword, saveAccount, switchAccount } from "@/app/admin/(staff)/staff/actions";
import { fieldErrors } from "@/lib/booking-rules";
import type { Account } from "@/lib/staff-admin";
import { accountFields, newAccountFields, passwordFields, PASSWORD_MIN } from "@/lib/staff-rules";

type Branch = { slug: string; name: string };
type Errors = Record<string, string>;

function toForm(values: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(values)) fd.set(k, v);
  return fd;
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <div className={`ffield ${error ? "has-error" : ""}`}>
      <label htmlFor={id}>{label}{hint && <> <span className="ffield__hint">({hint})</span></>}</label>
      {children}
      {error && <span className="ferr">{error}</span>}
    </div>
  );
}

function Passwords({ prefix, f, set, errors }: { prefix: string; f: { password: string; again: string }; set: (k: "password" | "again", v: string) => void; errors: Errors }) {
  return (
    <div className="fgrid">
      <Field id={`${prefix}-password`} label="Password" hint={`at least ${PASSWORD_MIN} characters`} error={errors.password}>
        <input id={`${prefix}-password`} type="password" autoComplete="new-password" value={f.password} onChange={(e) => set("password", e.target.value)} />
      </Field>
      <Field id={`${prefix}-again`} label="Type it again" error={errors.again}>
        <input id={`${prefix}-again`} type="password" autoComplete="new-password" value={f.again} onChange={(e) => set("again", e.target.value)} />
      </Field>
    </div>
  );
}

function RoleBranch({ prefix, f, set, errors, branches, roleLocked }: {
  prefix: string; f: { role: string; branch: string }; set: (k: "role" | "branch", v: string) => void; errors: Errors; branches: Branch[]; roleLocked?: boolean;
}) {
  return (
    <div className="fgrid">
      <Field id={`${prefix}-role`} label="Role" hint={roleLocked ? "you can't change your own" : undefined} error={errors.role}>
        <select id={`${prefix}-role`} value={f.role} disabled={roleLocked} onChange={(e) => set("role", e.target.value)}>
          <option value="staff">Staff: adds and edits content</option>
          <option value="admin">Admin: also approves, deletes and manages settings</option>
        </select>
      </Field>
      <Field id={`${prefix}-branch`} label="Home branch" error={errors.branch}>
        <select id={`${prefix}-branch`} value={f.branch} onChange={(e) => set("branch", e.target.value)}>
          <option value="">Choose…</option>
          {branches.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
        </select>
      </Field>
    </div>
  );
}

export function StaffAddForm({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const blank = { name: "", email: "", role: "staff", branch: "", password: "", again: "" };
  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState<Errors>({});
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof blank, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    const check = newAccountFields.safeParse(f);
    if (!check.success) return setErrors(fieldErrors(check.error));
    setErrors({}); setBusy(true); setDone(null);
    try {
      const r = await addAccount(toForm(f));
      if (!r.ok) return setErrors(r.errors);
      setDone(`${f.name.trim()} can now sign in with ${check.data.email}.`);
      setF(blank);
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <form className="fsec" noValidate onSubmit={submit} aria-labelledby="st-add">
      <h2 className="fsec__title" id="st-add">Add a staff account</h2>
      {done && <div className="fbanner" role="status"><b>{done}</b><span>Tell them the password in person. It isn&apos;t shown again.</span></div>}
      {errors.form && <span className="ferr" role="alert">{errors.form}</span>}
      <div className="fgrid">
        <Field id="st-name" label="Name" hint="shown in the staff area" error={errors.name}>
          <input id="st-name" type="text" maxLength={60} autoComplete="off" value={f.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field id="st-email" label="Email" hint="used to sign in" error={errors.email}>
          <input id="st-email" type="email" autoComplete="off" value={f.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
      </div>
      <RoleBranch prefix="st" f={f} set={set} errors={errors} branches={branches} />
      <Passwords prefix="st" f={f} set={set} errors={errors} />
      <div className="factions">
        <span className="factions__note" aria-live="polite">{busy ? "Saving…" : ""}</span>
        <button className="btn btn--primary" type="submit" disabled={busy}>Add account</button>
      </div>
    </form>
  );
}

/** A yes/no question in a dialog before an action that locks someone out or deletes. */
function Confirm({ label, title, text, yes, onYes, primary }: { label: string; title: string; text: string; yes: string; onYes: () => void; primary?: boolean }) {
  const [asking, setAsking] = useState(false);
  const dlg = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (asking && !dlg.current?.open) dlg.current?.showModal();
    if (!asking && dlg.current?.open) dlg.current.close();
  }, [asking]);
  return (
    <>
      <button className={`btn ${primary ? "btn--primary" : "btn--outline-dark"}`} type="button" onClick={() => setAsking(true)}>{label}</button>
      <dialog className="adm-dialog" ref={dlg} onClose={() => setAsking(false)} aria-label={title}>
        <h2>{title}</h2>
        <p>{text}</p>
        <div className="adm-dialog__actions">
          <button className="btn btn--outline-dark" type="button" onClick={() => setAsking(false)}>Cancel</button>
          <button className="btn btn--primary" type="button" onClick={() => { setAsking(false); onYes(); }}>{yes}</button>
        </div>
      </dialog>
    </>
  );
}

export function StaffManage({ account, self, branches }: { account: Account; self: boolean; branches: Branch[] }) {
  const router = useRouter();
  const [f, setF] = useState({ name: account.name, role: account.role as string, branch: account.branch ?? "" });
  const [pw, setPw] = useState({ password: "", again: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [pwErrors, setPwErrors] = useState<Errors>({});
  const [done, setDone] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(action: () => Promise<{ ok: true } | { ok: false; errors: Errors }>, message: string, onErrors = setErrors) {
    setBusy(true); setDone(null); setErrors({}); setPwErrors({});
    try {
      const r = await action();
      if (!r.ok) return onErrors(r.errors);
      setDone(message);
      router.refresh();
    } finally { setBusy(false); }
  }

  function saveDetails(e: FormEvent) {
    e.preventDefault();
    const check = accountFields.safeParse(f);
    if (!check.success) return setErrors(fieldErrors(check.error));
    run(() => saveAccount(account.id, toForm(f)), "Saved.");
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    const check = passwordFields.safeParse(pw);
    if (!check.success) return setPwErrors(fieldErrors(check.error));
    setBusy(true); setDone(null); setPwErrors({});
    try {
      const r = await resetPassword(account.id, toForm(pw));
      if (!r.ok) return setPwErrors(r.errors);
      setPw({ password: "", again: "" });
      if (r.signedOut) return window.location.replace("/admin/login"); // a fresh load, like Sign out
      setDone(`Password changed. ${account.name} has been signed out everywhere; tell them the new one in person.`);
    } finally { setBusy(false); }
  }

  async function remove() {
    setBusy(true); setDone(null); setErrors({});
    try {
      const r = await removeSample(account.id);
      if (!r.ok) return setErrors(r.errors);
      router.push("/admin/staff");
      router.refresh();
    } finally { setBusy(false); }
  }

  return (
    <div className="fsec st-manage" aria-labelledby="sm-title" role="region">
      <h2 className="fsec__title" id="sm-title">{account.name}{self ? " (you)" : ""}</h2>
      <p className="text-muted">{account.email} · <Link href="/admin/staff">Back to Add a staff account</Link></p>
      {done && <div className="fbanner" role="status"><b>{done}</b></div>}
      {errors.form && <span className="ferr" role="alert">{errors.form}</span>}

      <form noValidate onSubmit={saveDetails} aria-label="Name, role and branch">
        <Field id="sm-name" label="Name" error={errors.name}>
          <input id="sm-name" type="text" maxLength={60} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        </Field>
        <RoleBranch prefix="sm" f={f} set={(k, v) => setF({ ...f, [k]: v })} errors={errors} branches={branches} roleLocked={self} />
        <div className="factions">
          <span className="factions__note" aria-live="polite">{busy ? "Saving…" : ""}</span>
          <button className="btn btn--primary" type="submit" disabled={busy}>Save changes</button>
        </div>
      </form>

      <h3 className="fsec__title" style={{ marginTop: 24 }}>New password</h3>
      {account.sample ? <p className="text-muted">Sample accounts can&apos;t sign in, so they have no password. Add a real account instead.</p> : (
        <form noValidate onSubmit={savePassword} aria-label="New password">
          <p className="text-muted">For a forgotten password. {self ? "You'll be signed out and sign in again with the new one." : `${account.name} is signed out on every device.`}</p>
          {pwErrors.form && <span className="ferr" role="alert">{pwErrors.form}</span>}
          <Passwords prefix="sm" f={pw} set={(k, v) => setPw({ ...pw, [k]: v })} errors={pwErrors} />
          <div className="factions">
            <button className="btn btn--outline-dark" type="submit" disabled={busy}>Set new password</button>
          </div>
        </form>
      )}

      <h3 className="fsec__title" style={{ marginTop: 24 }}>Access</h3>
      {self ? <p className="text-muted">You can&apos;t switch off or delete your own account.</p> : (
        <div className="factions factions--start">
          {account.banned ? (
            <>
              <span className="adm-badge adm-badge--alert">Switched off</span>
              <button className="btn btn--primary" type="button" disabled={busy}
                onClick={() => run(() => switchAccount(account.id, false), `${account.name} can sign in again.`)}>Switch on</button>
            </>
          ) : (
            <Confirm label="Switch off" title={`Switch off ${account.name}?`}
              text="They're signed out at once and can't sign in. What they added stays, with their name. You can switch them on again."
              yes="Switch off" onYes={() => run(() => switchAccount(account.id, true), `${account.name} is switched off.`)} />
          )}
          {account.sample && (
            <Confirm label="Delete sample" title={`Delete ${account.name}?`} text="This sample account is removed for good." yes="Delete" onYes={remove} />
          )}
        </div>
      )}
    </div>
  );
}
