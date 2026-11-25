"use client";

/* Home hero photos as a slow cross-fade (developer decision 2026-10-25; the
   signed-off mockup has one still photo). Fades only, every 6 s, with a pause
   button and dots; one still photo with reduced motion. Only the first photo
   loads straight away. Development only for now: the photos are DUMMY C12. */
import Image from "next/image";
import { useEffect, useState } from "react";
import { Icon } from "@/components/site/icons";

const EVERY_MS = 6000;

export function HeroSlides({ srcs }: { srcs: string[] }) {
  const [shown, setShown] = useState(0);
  const [paused, setPaused] = useState(false);
  const [still, setStill] = useState(true); // reduced motion, until the browser says otherwise

  useEffect(() => {
    const mq = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setStill(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (paused || still || srcs.length < 2) return;
    const t = setTimeout(() => setShown((i) => (i + 1) % srcs.length), EVERY_MS);
    return () => clearTimeout(t);
  }, [shown, paused, still, srcs.length]);

  const current = still ? 0 : shown;
  return (
    <>
      <div className="hero__media" aria-hidden="true">
        {srcs.map((src, i) => (
          <Image key={src} className={`hero__slide${i === current ? " is-on" : ""}`} src={src} alt="" fill
            sizes="(min-width: 768px) 62vw, 100vw" priority={i === 0} />
        ))}
      </div>
      {!still && srcs.length > 1 && (
        <div className="hero__ctl" role="group" aria-label="Hero photos">
          {srcs.map((src, i) => (
            <button key={src} className="quote__dot" type="button" aria-label={`Photo ${i + 1}`} aria-current={i === shown} onClick={() => setShown(i)} />
          ))}
          <button className="quote__pause" type="button" aria-label={paused ? "Play photos" : "Pause photos"} onClick={() => setPaused(!paused)}>
            <Icon name={paused ? "play" : "pause"} />
          </button>
        </div>
      )}
    </>
  );
}
