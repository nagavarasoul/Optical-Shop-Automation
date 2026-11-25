/* Staff accounts (Requirements_Admin.md section 3): the admin's form rules,
   shared by the browser and the server actions. No server imports.
   Sample accounts (DUMMY C22) use the reserved .example domain: they have no
   password, so nobody can sign in with them, and real accounts can't use it. */
import { z } from "zod";

/** Same as minPasswordLength in auth-options.ts (a test checks they match). */
export const PASSWORD_MIN = 10;
export const SAMPLE_DOMAIN = "@vslensmart.example";
export const isSample = (email: string) => email.toLowerCase().endsWith(SAMPLE_DOMAIN);

const name = z.string().trim().min(2, "Enter a name.").max(60, "Keep the name under 60 characters.");
const role = z.enum(["admin", "staff"], { error: "Choose a role." });
const branch = z.string().regex(/^[a-z0-9-]{1,40}$/, "Choose a home branch.");
const password = z.string().min(PASSWORD_MIN, `Use at least ${PASSWORD_MIN} characters.`).max(128, "Use at most 128 characters.");
const same = (p: { password: string; again: string }) => p.password === p.again;
const sameError = { path: ["again"], message: "The two passwords don't match." };

/** Name, role and home branch: what the admin can change on an account. */
export const accountFields = z.object({ name, role, branch });
export type AccountInput = z.infer<typeof accountFields>;

/** A new password, typed twice. */
export const passwordFields = z.object({ password, again: z.string() }).refine(same, sameError);

export const newAccountFields = z.object({
  name,
  email: z.string().trim().toLowerCase()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter an email address, such as name@gmail.com.")
    .refine((e) => !isSample(e), "That address is for sample accounts only."),
  role,
  branch,
  password,
  again: z.string(),
}).refine(same, sameError);
export type NewAccountInput = z.infer<typeof newAccountFields>;
