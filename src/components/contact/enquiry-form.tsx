"use client";

/* "Send us a message" (Requirements_Contact.md 4), from the signed-off mockup
   (mockups/contact.html): the form, the side note, and the thank-you state.
   The browser checks with the same rules as the server (enquiry-rules.ts);
   the server action checks everything again and can only add the message. */
import { useEffect, useRef, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { sendEnquiry } from "@/app/(site)/contact/actions";
import { BranchLink } from "@/components/site/branch-link";
import { PickerButton } from "@/components/site/branch-picker";
import { DummyTag } from "@/components/site/dummy-tag";
import { Icon } from "@/components/site/icons";
import { fieldErrors } from "@/lib/booking-rules";
import { ENQUIRY_KEYS, enquiryFields, frameFromUrl, framePrefix, TOPICS, topicFromUrl } from "@/lib/enquiry-rules";
import type { Branch } from "@/lib/queries/site";

type Props = { branches: Branch[]; email: string; replyTime: string; hours: string };
type Sent = { topic: string; branch: string; reply: "whatsapp" | "call"; phone: string };

const msSince = (t: number) => Date.now() - t; // fill time, for the spam check

/** Reads ?topic=&frame= (needs <Suspense>); invalid values are ignored. */
export function EnquiryForm(props: Props) {
  const q = useSearchParams();
  return <EnquiryFormView {...props} topic={topicFromUrl(q.get("topic"))} frame={frameFromUrl(q.get("frame"))} />;
}
/** The same form before the address is read (pre-rendered). */
export function EnquiryFormPlain(props: Props) {
  return <EnquiryFormView {...props} topic="" frame="" />;
}

function EnquiryFormView({ branches, email, replyTime, hours, topic, frame }: Props & { topic: string; frame: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<{ title: string; items: [string, string][]; failed?: boolean } | null>(null);
  const [length, setLength] = useState(frame ? framePrefix(frame).length : 0);
  const [sent, setSent] = useState<Sent | null>(null);
  const [pending, startTransition] = useTransition();
  const started = useRef(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLElement>(null);

  useEffect(() => { started.current = Date.now(); }, [sent]);
  useEffect(() => { if (summary) summaryRef.current?.focus(); }, [summary]);
  useEffect(() => { if (sent) doneRef.current?.focus(); }, [sent]);

  function showErrors(errs: Record<string, string>) {
    setErrors(errs);
    const order: [string, string][] = [["name", "name"], ["phone", "phone"], ["address", "address"], ["branch", "branch-indresham"], ["topic", "topic"], ["message", "message-text"], ["consent", "consent"]];
    setSummary({ title: "Please check your message", items: order.filter(([k]) => errs[k]).map(([k, target]) => [target, errs[k]]) });
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("consent", fd.get("consent") ? "yes" : "");
    fd.set("frameCode", frame);
    fd.set("elapsed", String(msSince(started.current)));
    const check = enquiryFields.safeParse(Object.fromEntries(ENQUIRY_KEYS.map((k) => [k, String(fd.get(k) ?? "")])));
    if (!check.success) return showErrors(fieldErrors(check.error));
    setErrors({}); setSummary(null);
    startTransition(async () => {
      try {
        const r = await sendEnquiry(fd);
        if (r.ok) setSent({ topic: check.data.topic, branch: check.data.branch, reply: check.data.replyBy, phone: check.data.phone });
        else if ("errors" in r) showErrors(r.errors);
        else if ("limited" in r) setSummary({ title: "Please wait a minute and try again.", items: [] });
        else setSummary({ title: "We couldn't send your message", items: [], failed: true });
      } catch {
        setSummary({ title: "We couldn't send your message", items: [], failed: true });
      }
    });
  }

  if (sent) {
    const b = branches.find((x) => x.slug === sent.branch);
    const topicName = TOPICS.find(([t]) => t === sent.topic)?.[1] ?? sent.topic;
    return (
      <section className="bdone" tabIndex={-1} ref={doneRef} aria-labelledby="done-title">
        <span className="bdone__tick" aria-hidden="true">✓</span>
        <h2 id="done-title">Thanks, we&apos;ve got your message.</h2>
        <p>We&apos;ll {sent.reply === "call" ? "call you back" : "reply on WhatsApp"} {replyTime}. <DummyTag id="C21" /></p>
        <dl>
          <dt>Topic</dt><dd>{topicName}{frame && sent.topic === "frames" ? ` (${frame})` : ""}</dd>
          <dt>Branch</dt><dd>{b?.name ?? "Either"}</dd>
          <dt>Mobile</dt><dd>•••••• {sent.phone.slice(-4)}</dd>
        </dl>
        <div className="bdone__actions">
          {b ? <BranchLink b={b} kind="whatsapp" className="btn btn--primary">Need it sooner? WhatsApp us</BranchLink>
            : <PickerButton kind="whatsapp" className="btn btn--primary"><Icon name="wa" className="icon icon--sm" />Need it sooner? WhatsApp us</PickerButton>}
          <Link className="btn btn--outline-dark" href="/frames">Back to frames</Link>
        </div>
        <button className="clear-all" type="button" onClick={() => { setSent(null); setLength(frame ? framePrefix(frame).length : 0); }}>Send another message</button>
      </section>
    );
  }

  const err = (k: string) => errors[k] ? <span className="ferr" id={`${k}-err`}>{errors[k]}</span> : null;
  const box = (k: string) => `ffield${errors[k] ? " has-error" : ""}`;
  return (
    <div className="cform">
      <form onSubmit={submit} noValidate>
        {summary && (
          <div className="esummary" role="alert" tabIndex={-1} ref={summaryRef}>
            <h2>{summary.title}</h2>
            {summary.items.length > 0 && <ul>{summary.items.map(([target, msg]) => <li key={target}><a href={`#${target}`}>{msg}</a></li>)}</ul>}
            {summary.failed && (
              <>
                <p>Please try again, or WhatsApp us.</p>
                <div className="branch__actions"><PickerButton kind="whatsapp" className="btn btn--outline-dark">WhatsApp us</PickerButton></div>
              </>
            )}
          </div>
        )}
        <div className={box("name")}>
          <label htmlFor="name">Name</label>
          <input type="text" id="name" name="name" autoComplete="name" maxLength={60} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
          {err("name")}
        </div>
        <div className={box("phone")}>
          <label htmlFor="phone">Mobile number</label>
          <div className="phone"><span className="phone__pre" aria-hidden="true">+91</span>
            <input type="tel" id="phone" name="phone" autoComplete="tel-national" inputMode="numeric" maxLength={16} aria-invalid={!!errors.phone} aria-describedby={`phone-hint${errors.phone ? " phone-err" : ""}`} />
          </div>
          <span className="ffield__hint" id="phone-hint">10-digit mobile. We use it only to reply to you.</span>
          {err("phone")}
        </div>
        <div className={box("address")}>
          <label htmlFor="address">Your area or address <span className="ffield__hint">(optional)</span></label>
          <input type="text" id="address" name="address" autoComplete="street-address" maxLength={150} placeholder="For example: Citizens Colony, Indresham" aria-describedby="address-hint" />
          <span className="ffield__hint" id="address-hint">Helps us point you to the nearest branch.</span>
          {err("address")}
        </div>
        <fieldset>
          <legend>Branch</legend>
          <div className="chips-pick">
            {branches.map((b) => (
              <label className="rchoice" key={b.slug}><input type="radio" name="branch" value={b.slug} id={`branch-${b.slug}`} /><span>{b.name}</span></label>
            ))}
            <label className="rchoice"><input type="radio" name="branch" value="either" defaultChecked /><span>Either</span></label>
          </div>
        </fieldset>
        <div className={box("topic")}>
          <label htmlFor="topic">Topic</label>
          <select id="topic" name="topic" defaultValue={topic} aria-invalid={!!errors.topic} aria-describedby={errors.topic ? "topic-err" : undefined}>
            <option value="">Choose a topic</option>
            {TOPICS.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
          {err("topic")}
        </div>
        <div className={box("message")}>
          <label htmlFor="message-text">Message</label>
          <textarea id="message-text" name="message" maxLength={500} defaultValue={frame ? framePrefix(frame) : ""} onInput={(e) => setLength(e.currentTarget.value.length)}
            aria-invalid={!!errors.message} aria-describedby={`msg-count${errors.message ? " message-err" : ""}`} />
          <span className="ffield__hint" id="msg-count">{length} / 500</span>
          {err("message")}
        </div>
        <fieldset>
          <legend>How should we reply? <span className="ffield__hint">(optional)</span></legend>
          <div className="chips-pick">
            <label className="rchoice"><input type="radio" name="replyBy" value="whatsapp" defaultChecked /><span>WhatsApp</span></label>
            <label className="rchoice"><input type="radio" name="replyBy" value="call" /><span>Phone call</span></label>
          </div>
        </fieldset>
        <div className={box("consent")}>
          <label className="consent"><input type="checkbox" id="consent" name="consent" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-err" : undefined} />
            <span>I agree that VS Lens Mart may use my name, number and address (if given) to reply to this message. <a href="/privacy">Privacy policy</a></span>
          </label>
          {err("consent")}
        </div>
        {/* Spam trap: people never see or fill this */}
        <div className="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
        <div className="bsubmit">
          <button className="btn btn--primary" type="submit" disabled={pending} aria-busy={pending || undefined}>{pending ? "Sending…" : "Send message"}</button>
        </div>
      </form>
      <aside>
        <div className="cnote">
          <h3>Faster on WhatsApp</h3>
          <p>Most questions about frames, lenses or your order are answered quickest on WhatsApp.</p>
          <div className="branch__actions">
            <PickerButton kind="whatsapp" className="btn btn--primary"><Icon name="wa" className="icon icon--sm" />WhatsApp us</PickerButton>
          </div>
        </div>
        <div className="cnote">
          <h3>Email</h3>
          <p><a href={`mailto:${email}`}>{email}</a> <DummyTag id="D1" /></p>
          <p>{hours}, at both branches.</p>
        </div>
      </aside>
    </div>
  );
}
