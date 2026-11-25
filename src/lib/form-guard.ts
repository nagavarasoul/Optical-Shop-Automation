import "server-only";
import { headers } from "next/headers";

/* Spam and abuse protection for the public forms (Requirements_Booking.md 2–3,
   Requirements_Contact.md 4). No CAPTCHA:
   - a hidden field people never see ("website") and a minimum fill time, both
     answered with a fake "done" so a bot learns nothing;
   - a limit on submits per minute. Like the sign-in limit, the visitor's IP is
     used only when TRUSTED_IP_HEADER names a header the host's proxy sets (a
     browser can fake X-Forwarded-For). Without it, everyone shares one bucket
     with a higher limit; set TRUSTED_IP_HEADER at deployment. */

/** Submits allowed per minute per visitor. The test server raises it (E2E_FORM_LIMIT). */
export const FORM_LIMIT = 5;
const SHARED_LIMIT = 30; // per minute for everyone together, when no IP header is trusted
const MIN_FILL_MS = 3000;

const hits = new Map<string, number[]>();

/** True when the request looks automated: the hidden field is filled, or the form was sent too fast. */
export function looksLikeSpam(fd: FormData): boolean {
  if (String(fd.get("website") ?? "") !== "") return true;
  const minFill = process.env.E2E_FORM_MIN_FILL_MS !== undefined ? Number(process.env.E2E_FORM_MIN_FILL_MS) : MIN_FILL_MS;
  const elapsed = Number(fd.get("elapsed"));
  return !Number.isFinite(elapsed) || elapsed < minFill;
}

/** Counts this submit; false once the visitor (or everyone, without a trusted IP) is over the limit. */
export async function withinLimit(form: "booking" | "enquiry"): Promise<boolean> {
  const ipHeader = process.env.TRUSTED_IP_HEADER?.trim();
  const ip = ipHeader ? (await headers()).get(ipHeader)?.split(",")[0]?.trim() : undefined;
  const limit = Number(process.env.E2E_FORM_LIMIT) || (ip ? FORM_LIMIT : SHARED_LIMIT);
  const key = `${form}|${ip ?? "shared"}`;
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < 60_000);
  if (recent.length >= limit) return false;
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear(); // never grows without bound
  return true;
}
