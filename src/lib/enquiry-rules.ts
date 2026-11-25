/* Contact form rules (Requirements_Contact.md 4), shared by the browser and the
   server action, like booking-rules.ts. No server imports. */
import { z } from "zod";
import { optionalText, phone } from "./booking-rules";

// Values match the enquiries table; the address bar uses the dashed form (?topic=eye-test)
export const TOPICS = [
  ["frames", "Frames"], ["sunglasses", "Sunglasses"], ["lenses", "Lenses"],
  ["eye_test", "Eye test"], ["repair", "Repair or adjustment"], ["other", "Something else"],
] as const;
export const topicFromUrl = (v: string | null) => TOPICS.find(([t]) => t === (v ?? "").replace(/-/g, "_"))?.[0] ?? "";
/** A frame code from ?frame= (same format as the staff form; DUMMY C13). */
export const frameFromUrl = (v: string | null) => (/^[A-Z]{2,4}-\d{3,5}$/.test(v ?? "") ? v! : "");
export const framePrefix = (code: string) => `About frame ${code}: `;

export const enquiryFields = z.object({
  name: z.string().trim().min(2, "Enter your name").max(60, "Your name can be up to 60 characters"),
  phone,
  address: optionalText(150, "Your area or address"),
  branch: z.enum(["indresham", "patelguda", "either"], "Choose a branch").default("either"),
  topic: z.enum(TOPICS.map(([t]) => t) as [string, ...string[]], "Choose a topic"),
  message: z.string().trim().min(10, "Write a message of at least 10 characters").max(500, "Your message can be up to 500 characters"),
  frameCode: z.string().transform((s) => (frameFromUrl(s) || null)),
  replyBy: z.enum(["whatsapp", "call"]).default("whatsapp"),
  consent: z.literal("yes", { error: "Tick the box to agree, so we can reply to you" }),
}).refine((f) => !f.frameCode || f.message !== framePrefix(f.frameCode).trim(), { path: ["message"], message: "Write a message of at least 10 characters" });
export type EnquiryInput = z.infer<typeof enquiryFields>;
export const ENQUIRY_KEYS = ["name", "phone", "address", "branch", "topic", "message", "frameCode", "replyBy", "consent"] as const;
