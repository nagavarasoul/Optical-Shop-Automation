"use client";

/* Home quote band (Requirements_HomePage.md 3.9): the plan's three quotes,
   changing slowly with a fade. Dots pick one, the button pauses. Nothing moves
   with reduced motion. The text is announced only when the visitor changes it,
   not every 7 seconds. */
import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/site/icons";

const QUOTES = [
  "Welcome to the Optical Family, where every customer is family.",
  "We see you, not just your prescription.",
  "Quality you can see. Trust you can feel.",
];
const EVERY_MS = 7000;
const FADE_MS = 420;

export function QuoteBand() {
  const [shown, setShown] = useState(0);
  const [fading, setFading] = useState(false);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(true); // reduced motion, until the browser says otherwise
  const [byVisitor, setByVisitor] = useState(false);
  const fade = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function show(i: number) {
    clearTimeout(fade.current);
    if (still) return setShown(i);
    setFading(true);
    fade.current = setTimeout(() => { setShown(i); setFading(false); }, FADE_MS);
  }

  useEffect(() => {
    if (paused || still) return;
    const t = setInterval(() => show((shown + 1) % QUOTES.length), EVERY_MS);
    return () => clearInterval(t);
  });
  useEffect(() => () => clearTimeout(fade.current), []);

  const stopped = paused || still;
  return (
    <section className="section section--navy quote" aria-label="What we believe">
      <div className="container">
        <p className="quote__mark" aria-hidden="true">&ldquo;</p>
        <p className={`quote__text${fading ? " is-fading" : ""}`} id="quote-text" aria-live={byVisitor ? "polite" : "off"}>{QUOTES[shown]}</p>
        <div className="quote__controls">
          {QUOTES.map((q, i) => (
            <button key={q} className="quote__dot" type="button" aria-label={`Quote ${i + 1}`} aria-current={i === shown}
              onClick={() => { setByVisitor(true); show(i); }} />
          ))}
          {!still && (
            <button className="quote__pause" type="button" aria-label={stopped ? "Play quotes" : "Pause quotes"} onClick={() => setPaused(!paused)}>
              <Icon name={stopped ? "play" : "pause"} />
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
