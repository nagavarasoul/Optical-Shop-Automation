"use client";

/* Book an eye test (Requirements_Booking.md 2–5), from the signed-off mockup
   (mockups/book-eye-test.html): three steps on one page, a summary card, an
   error summary, and the confirmation. The browser checks with the same rules
   as the server (booking-rules.ts), for instant messages; the server action
   checks everything again. Slots come as counts only. */
import { useEffect, useRef, useState, useSyncExternalStore, useTransition, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { bookEyeTest, getSlots } from "@/app/(site)/book-eye-test/actions";
import { BranchLink } from "@/components/site/branch-link";
import { PickerButton } from "@/components/site/branch-picker";
import { DummyTag } from "@/components/site/dummy-tag";
import { Icon } from "@/components/site/icons";
import { addDays, BOOKING, bookingFields, cleanPhone, dayLabel, fieldErrors, inWindow, nowInIndia, timeLabel, toMinutes, weekday, type DaySlots } from "@/lib/booking-rules";
import type { Branch } from "@/lib/queries/site";
import { time12 } from "@/lib/site-config";

type Props = { branches: Branch[]; freeTest: boolean };
type Done = { ref: string; branch: Branch; day: string; time: string; name: string; phone: string };
type Summary = { title: string; items: [string, string][]; failed?: boolean } | null;

const PARTS: [string, number, number][] = [["Morning", 0, 12 * 60], ["Afternoon", 12 * 60, 17 * 60], ["Evening", 17 * 60, 24 * 60]];
const noop = () => () => {};
const msSince = (t: number) => Date.now() - t; // fill time, for the spam check

/** Reads ?branch=&date= (needs <Suspense>); invalid values are ignored. */
export function BookingForm(props: Props) {
  const q = useSearchParams();
  return <BookingFormView {...props} prefill={{ branch: q.get("branch") ?? "", date: q.get("date") ?? "" }} />;
}
/** The same form before the address is read (pre-rendered). */
export function BookingFormPlain(props: Props) {
  return <BookingFormView {...props} prefill={{ branch: "", date: "" }} />;
}

function BookingFormView({ branches, freeTest, prefill }: Props & { prefill: { branch: string; date: string } }) {
  // "Today" in India, read in the browser (the page itself is pre-rendered)
  const today = useSyncExternalStore(noop, () => nowInIndia().day, () => null);
  const [branchSlug, setBranch] = useState(() => (branches.some((b) => b.slug === prefill.branch) ? prefill.branch : ""));
  const [pickedDay, setDay] = useState(prefill.date);
  const day = today && inWindow(pickedDay, today) ? pickedDay : "";
  const [time, setTime] = useState("");
  const [refresh, setRefresh] = useState(0);
  const [slots, setSlots] = useState<{ key: string; result: DaySlots } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [summary, setSummary] = useState<Summary>(null);
  const [noteLength, setNoteLength] = useState(0);
  const [done, setDone] = useState<Done | null>(null);
  const [pending, startTransition] = useTransition();
  const started = useRef(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef<HTMLElement>(null);
  const form = useRef<HTMLFormElement>(null);

  const branch = branches.find((b) => b.slug === branchSlug);
  const key = branchSlug && day ? `${branchSlug}|${day}|${refresh}` : "";
  const current = slots && slots.key === key ? slots.result : null;
  const chosen = current?.state === "open" && current.slots.some((s) => s.time === time && !s.full) ? time : "";

  useEffect(() => { started.current = Date.now(); }, []);
  // Counts for the chosen branch and day (never who booked)
  useEffect(() => {
    if (!key) return;
    let live = true;
    getSlots(branchSlug, day).then((result) => { if (live) setSlots({ key, result }); }, () => { if (live) setSlots({ key, result: { state: "none" } }); });
    return () => { live = false; };
  }, [key, branchSlug, day]);
  useEffect(() => { if (summary) summaryRef.current?.focus(); }, [summary]);
  useEffect(() => { if (done) { doneRef.current?.focus(); scrollTo({ top: 0 }); } }, [done]);

  const days = today ? Array.from({ length: BOOKING.dayChips }, (_, i) => addDays(today, i)) : [];
  const chipDay = (d: string, i: number) => (i === 0 ? "Today" : i === 1 ? "Tomorrow" : weekday(d));
  const short = (d: string) => dayLabel(d).split(" ").slice(1).join(" ");
  const sumLine = branch && day && chosen ? `${branch.name} · ${dayLabel(day)} · ${timeLabel(chosen)}` : "";

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("branch", branchSlug); fd.set("day", day); fd.set("time", chosen);
    fd.set("consent", fd.get("consent") ? "yes" : "");
    fd.set("elapsed", String(msSince(started.current)));
    const check = bookingFields.safeParse(Object.fromEntries(["branch", "day", "time", "name", "phone", "forWhom", "address", "note", "consent"].map((k) => [k, String(fd.get(k) ?? "")])));
    if (!check.success) return showErrors(fieldErrors(check.error));
    setErrors({}); setSummary(null);
    startTransition(async () => {
      try {
        const r = await bookEyeTest(fd);
        if (r.ok) {
          setDone({ ref: r.ref, branch: branch!, day, time: chosen, name: check.data.name, phone: check.data.phone });
        } else if ("errors" in r) showErrors(r.errors);
        else if ("full" in r) {
          setTime(""); setRefresh((n) => n + 1);
          setSummary({ title: `Sorry, ${timeLabel(r.full)} just filled up`, items: [["step2", "Please pick another time"]] });
        } else if ("limited" in r) setSummary({ title: "Please wait a minute and try again.", items: [] });
        else setSummary({ title: "We couldn't save your booking", items: [], failed: true });
      } catch {
        setSummary({ title: "We couldn't save your booking", items: [], failed: true });
      }
    });
  }
  function showErrors(errs: Record<string, string>) {
    setErrors(errs);
    const order: [string, string][] = [["branch", "step1"], ["day", "step1"], ["time", "step2"], ["name", "name"], ["phone", "phone"], ["address", "address"], ["note", "note"], ["consent", "consent"]];
    setSummary({ title: "Please check your booking", items: order.filter(([k]) => errs[k]).map(([k, target]) => [target, errs[k]]) });
  }

  if (done) return <Confirmation done={done} onAgain={() => { setDone(null); setTime(""); setNoteLength(0); setRefresh((n) => n + 1); }} doneRef={doneRef} freeTest={freeTest} />;

  const err = (k: string) => errors[k] ? <span className="ferr" id={`${k}-err`}>{errors[k]}</span> : null;
  return (
    <div className="book" id="book">
      <form ref={form} onSubmit={submit} noValidate>
        {summary && (
          <div className="esummary" role="alert" tabIndex={-1} ref={summaryRef}>
            <h2>{summary.title}</h2>
            {summary.items.length > 0 && <ul>{summary.items.map(([target, msg]) => <li key={target + msg}><a href={`#${target}`}>{msg}</a></li>)}</ul>}
            {summary.failed && branch && (
              <>
                <p>Please try again, or call the branch.</p>
                <div className="branch__actions">
                  <BranchLink b={branch} kind="call" className="btn btn--outline-dark">Call {branch.name}</BranchLink>
                  <BranchLink b={branch} kind="whatsapp" className="btn btn--outline-dark">WhatsApp {branch.name}</BranchLink>
                </div>
              </>
            )}
          </div>
        )}

        <fieldset className={`bstep${branch && day ? " is-done" : ""}`} id="step1">
          <legend><span className="bstep__num">1</span>Branch and day</legend>
          <div className="branch-pick">
            {branches.map((b) => (
              <label className="rchoice" key={b.slug}>
                <input type="radio" name="branch-choice" value={b.slug} checked={branchSlug === b.slug} onChange={() => { setBranch(b.slug); setTime(""); }} />
                <span><b>{b.name}</b>{b.address} · {time12(b.opens)}–{time12(b.closes)}</span>
              </label>
            ))}
          </div>
          {errors.branch && <span className="ferr">{errors.branch}</span>}
          <p className="bsub" id="day-label">Day</p>
          <div className="chips-pick" role="radiogroup" aria-labelledby="day-label">
            {days.map((d, i) => (
              <label className="rchoice" key={d}>
                <input type="radio" name="day-choice" value={d} checked={day === d} onChange={() => { setDay(d); setTime(""); }} />
                <span>{chipDay(d, i)}<small>{short(d)}</small></span>
              </label>
            ))}
          </div>
          {today && (
            <label className="other-date">Pick another date{" "}
              <input type="date" min={today} max={addDays(today, BOOKING.windowDays)} value={day && !days.includes(day) ? day : ""}
                onChange={(e) => { if (inWindow(e.target.value, today)) { setDay(e.target.value); setTime(""); } }} />
            </label>
          )}
          {errors.day && <span className="ferr">{errors.day}</span>}
        </fieldset>

        <fieldset className={`bstep${chosen ? " is-done" : ""}`} id="step2" disabled={!(branch && day)}>
          <legend><span className="bstep__num">2</span>Time</legend>
          <div id="slots" aria-live="polite">
            {!(branch && day) ? <p className="slot-empty">Choose a branch and a day first.</p>
              : !current ? <p className="slot-empty">Finding free times…</p>
              : current.state === "closed" ? <p className="slot-empty">Closed on {dayLabel(day)}. Please pick another day.</p>
              : current.state !== "open" ? <p className="slot-empty">No times left on this day. Please pick another day.</p>
              : PARTS.map(([part, from, to]) => {
                const list = current.slots.filter((s) => toMinutes(s.time) >= from && toMinutes(s.time) < to);
                if (!list.length) return null;
                const id = `g-${part.toLowerCase()}`;
                return (
                  <div key={part}>
                    <p className="bsub" id={id}>{part}</p>
                    <div className="chips-pick" role="radiogroup" aria-labelledby={id}>
                      {list.map((s) => (
                        <label className="rchoice" key={s.time}>
                          <input type="radio" name="time-choice" value={s.time} disabled={s.full} checked={chosen === s.time} onChange={() => setTime(s.time)} />
                          <span>{timeLabel(s.time)}{s.full && <small>Full</small>}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
          {errors.time && <span className="ferr">{errors.time}</span>}
          <DummyTag id="C18" />
        </fieldset>

        <fieldset className="bstep" id="step3" disabled={!chosen}>
          <legend><span className="bstep__num">3</span>Your details</legend>
          <div className={`ffield${errors.name ? " has-error" : ""}`}>
            <label htmlFor="name">Full name</label>
            <input type="text" id="name" name="name" autoComplete="name" maxLength={60} aria-invalid={!!errors.name} aria-describedby={errors.name ? "name-err" : undefined} />
            {err("name")}
          </div>
          <div className={`ffield${errors.phone ? " has-error" : ""}`}>
            <label htmlFor="phone">Mobile number</label>
            <div className="phone"><span className="phone__pre" aria-hidden="true">+91</span>
              <input type="tel" id="phone" name="phone" autoComplete="tel-national" inputMode="numeric" maxLength={16} aria-invalid={!!errors.phone}
                aria-describedby={`phone-hint${errors.phone ? " phone-err" : ""}`} onBlur={(e) => { e.currentTarget.value = cleanPhone(e.currentTarget.value) || e.currentTarget.value; }} />
            </div>
            <span className="ffield__hint" id="phone-hint">10-digit mobile. We use it for this booking only.</span>
            {err("phone")}
          </div>
          <div className="ffield">
            <span className="ffield__label" id="for-label">Who is the test for? <span className="ffield__hint">(optional)</span></span>
            <div className="chips-pick" role="radiogroup" aria-labelledby="for-label">
              <label className="rchoice"><input type="radio" name="forWhom" value="myself" defaultChecked /><span>Myself</span></label>
              <label className="rchoice"><input type="radio" name="forWhom" value="someone_else" /><span>Someone else</span></label>
            </div>
          </div>
          <div className={`ffield${errors.address ? " has-error" : ""}`}>
            <label htmlFor="address">Your area or address <span className="ffield__hint">(optional)</span></label>
            <input type="text" id="address" name="address" autoComplete="street-address" maxLength={150} placeholder="For example: Citizens Colony, Indresham" aria-describedby="address-hint" />
            <span className="ffield__hint" id="address-hint">Helps the branch know where you&apos;re coming from.</span>
            {err("address")}
          </div>
          <div className="ffield">
            <label htmlFor="note">Anything we should know? <span className="ffield__hint">(optional)</span></label>
            <textarea id="note" name="note" maxLength={300} placeholder="For example: I wear glasses for reading" aria-describedby="note-count" onInput={(e) => setNoteLength(e.currentTarget.value.length)} />
            <span className="ffield__hint" id="note-count">{noteLength} / 300</span>
          </div>
          <div className={`ffield${errors.consent ? " has-error" : ""}`}>
            <label className="consent"><input type="checkbox" id="consent" name="consent" aria-invalid={!!errors.consent} aria-describedby={errors.consent ? "consent-err" : undefined} />
              <span>I agree that VS Lens Mart may use my name, number and address (if given) to manage this booking and contact me about it. <a href="/privacy">Privacy policy</a></span>
            </label>
            {err("consent")}
          </div>
          {/* Spam trap: people never see or fill this */}
          <div className="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="website" tabIndex={-1} autoComplete="off" /></label></div>
        </fieldset>

        <p className="bsubmit__sum" aria-live="polite">{sumLine}</p>
        <div className="bsubmit">
          <button className="btn btn--primary" type="submit" disabled={pending} aria-busy={pending || undefined}>{pending ? "Booking…" : "Confirm booking"}</button>
          <span className="ffield__hint">{freeTest && <>Free eye test <DummyTag id="D7" /> · </>}takes 5–20 minutes</span>
        </div>
      </form>

      <aside className="bsummary" aria-label="Your booking">
        <h2>Your booking</h2>
        <dl>
          <dt>Branch</dt><dd>{branch?.name ?? "Not chosen"}</dd>
          <dt>Day</dt><dd>{day ? dayLabel(day) : "Not chosen"}</dd>
          <dt>Time</dt><dd>{chosen ? timeLabel(chosen) : "Not chosen"}</dd>
        </dl>
        <div className="bsummary__help">
          <span>{branches[0] ? `Open 7 days, ${time12(branches[0].opens)}–${time12(branches[0].closes)}. ` : ""}The test takes 5–20 minutes.</span>
          <span>Prefer to talk to us?</span>
          <div className="branch__actions">
            <PickerButton kind="call" className="btn btn--outline-dark"><Icon name="phone" className="icon icon--sm" />Call</PickerButton>
            <PickerButton kind="whatsapp" className="btn btn--outline-dark"><Icon name="wa" className="icon icon--sm" />WhatsApp</PickerButton>
          </div>
        </div>
      </aside>
    </div>
  );
}

/* The confirmation (Requirements_Booking.md 4): only what was just entered, plus the reference. */
function Confirmation({ done, onAgain, doneRef, freeTest }: { done: Done; onAgain: () => void; doneRef: React.RefObject<HTMLElement | null>; freeTest: boolean }) {
  const { branch: b, day, time, ref, name, phone } = done;
  const msg = `Hi VS Lens Mart, I've booked an eye test at ${b.name} on ${dayLabel(day)} at ${timeLabel(time)}. Ref ${ref}. Name: ${name}.`;
  const stamp = (m: number) => `${day.replaceAll("-", "")}T${String(Math.floor(m / 60)).padStart(2, "0")}${String(m % 60).padStart(2, "0")}00`;
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//VS Lens Mart//Booking//EN", "BEGIN:VEVENT",
    `UID:${ref}-${day}@vslensmart`, `DTSTART:${stamp(toMinutes(time))}`, `DTEND:${stamp(toMinutes(time) + BOOKING.slotMinutes)}`,
    `SUMMARY:Eye test at VS Lens Mart ${b.name}`, `LOCATION:${b.address.replace(/[,;]/g, (c) => `\\${c}`)}`,
    `DESCRIPTION:Booking ${ref}. Please bring your current glasses.`, "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  return (
    <section className="bdone" tabIndex={-1} ref={doneRef} aria-labelledby="done-title">
      <span className="bdone__tick" aria-hidden="true">✓</span>
      <h2 id="done-title">You&apos;re booked!</h2>
      <p>Your booking reference</p>
      <span className="bdone__ref">{ref}</span>
      <dl>
        <dt>Branch</dt><dd>{b.name}</dd>
        <dt>Day</dt><dd>{dayLabel(day)}</dd>
        <dt>Time</dt><dd>{timeLabel(time)}</dd>
        <dt>Name</dt><dd>{name}</dd>
        <dt>Mobile</dt><dd>•••••• {phone.slice(-4)}</dd>
      </dl>
      <div className="bdone__actions">
        <BranchLink b={b} kind="whatsapp" text={msg} className="btn btn--primary">Send to the branch on WhatsApp</BranchLink>
        <a className="btn btn--outline-dark" href={`data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}`} download="vs-lens-mart-eye-test.ics">
          <Icon name="cal" className="icon icon--sm" />Add to calendar
        </a>
      </div>
      <p className="bdone__note">The eye test takes 5–20 minutes{freeTest && <> and is free <DummyTag id="D7" /></>}. Please bring your current glasses.</p>
      <p className="bdone__note"><b>Need to change or cancel?</b> Call or WhatsApp the branch.</p>
      <button className="clear-all" type="button" onClick={onAgain}>Book another test</button>
    </section>
  );
}
