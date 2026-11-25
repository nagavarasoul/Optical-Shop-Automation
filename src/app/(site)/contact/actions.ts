"use server";

/* The contact form (Requirements_Contact.md 4–5). Runs with the public role,
   which may add an enquiry but never read one back. Every field is checked
   here again, whatever the browser sent. */
import { enquiries } from "@/db/schema";
import { fieldErrors } from "@/lib/booking-rules";
import { withRole } from "@/lib/db";
import { ENQUIRY_KEYS, enquiryFields } from "@/lib/enquiry-rules";
import { looksLikeSpam, withinLimit } from "@/lib/form-guard";
import { purgeExpired } from "@/lib/retention";

export type EnquiryResult =
  | { ok: true }
  | { ok: false; errors: Record<string, string> }
  | { ok: false; limited: true }
  | { ok: false; failed: true };

export async function sendEnquiry(fd: FormData): Promise<EnquiryResult> {
  if (looksLikeSpam(fd)) return { ok: true }; // a bot gets a convincing "thanks" and nothing is saved
  if (!(await withinLimit("enquiry"))) return { ok: false, limited: true };
  const parsed = enquiryFields.safeParse(Object.fromEntries(ENQUIRY_KEYS.map((k) => [k, String(fd.get(k) ?? "")])));
  if (!parsed.success) return { ok: false, errors: fieldErrors(parsed.error) };
  const f = parsed.data;
  try {
    // Inserted without RETURNING: the public role can't read the row back
    await withRole("public", async (tx) => {
      await tx.insert(enquiries).values({
        name: f.name, phone: f.phone, address: f.address, branch: f.branch, topic: f.topic as typeof enquiries.$inferInsert.topic,
        message: f.message, frameCode: f.frameCode, replyBy: f.replyBy, consentAt: new Date(),
      });
      await purgeExpired(tx);
    });
    return { ok: true };
  } catch (e) {
    console.error("Enquiry could not be saved", e instanceof Error ? e.message : e);
    return { ok: false, failed: true };
  }
}
