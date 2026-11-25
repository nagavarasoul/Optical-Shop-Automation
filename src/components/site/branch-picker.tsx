"use client";

/* Branch picker (Requirements_Navigation.md 4.3 and 7): each branch has its own
   number, so Call and WhatsApp first ask "Which branch?". One picker for the
   whole site; any <PickerButton> opens it. Under a header icon it opens below
   the button; from the phone sticky bar it opens above the bar.
   Ported from the signed-off mockup (mockups/site.js "Branch picker"). */
import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import type { Branch } from "@/lib/queries/site";
import { DummyTag } from "./dummy-tag";

type Kind = "call" | "whatsapp";
type Open = { kind: Kind; waText?: string; anchor: HTMLElement; owner: string; bottom: boolean };
const Ctx = createContext<{ open: (o: Open) => void; close: (focus?: boolean) => void; owner: string | null } | null>(null);

const displayNumber = (b: Branch, kind: Kind) => (b.dummy ? "+91 00000 00000" : kind === "call" ? b.phone : b.whatsapp);

export function BranchPickerProvider({ branches, children }: { branches: Branch[]; children: ReactNode }) {
  const [state, setState] = useState<Open | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top?: number; right?: number }>({});

  const close = useCallback((focus = false) => {
    setState((s) => {
      if (s && focus) s.anchor.focus();
      return null;
    });
  }, []);
  const open = useCallback((o: Open) => setState(o), []);

  // Position under (or above) the button that opened it, and focus the first branch
  useEffect(() => {
    if (!state) return;
    if (!state.bottom && panel.current) {
      const r = state.anchor.getBoundingClientRect();
      const h = panel.current.offsetHeight || 220, w = panel.current.offsetWidth || 320;
      const below = r.bottom + 8 + h <= innerHeight;
      setPos({ top: below ? r.bottom + 8 : Math.max(8, r.top - 8 - h), right: Math.max(12, Math.min(innerWidth - r.right, innerWidth - w - 12)) });
    } else setPos({});
    // preventScroll: focusing a link at the screen's edge would scroll the page, and scrolling closes the picker
    const t = setTimeout(() => panel.current?.querySelector("a")?.focus({ preventScroll: true }), matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 50);
    return () => clearTimeout(t);
  }, [state]);

  // Esc, a click elsewhere, or scrolling (for the anchored picker) closes it
  useEffect(() => {
    if (!state) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { e.stopPropagation(); close(true); } };
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!panel.current?.contains(t) && !state.anchor.contains(t)) close();
    };
    // Only a real move closes it: a scroll event can arrive just after the tap that opened it
    // (scroll events are sent a frame late), and phones nudge the page as the address bar hides.
    const y0 = scrollY;
    const onScroll = () => { if (!state.bottom && Math.abs(scrollY - y0) > 24) close(); };
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("click", onClick);
    addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("click", onClick);
      removeEventListener("scroll", onScroll);
    };
  }, [state, close]);

  const text = state?.waText ? `?text=${encodeURIComponent(state.waText)}` : "";
  return (
    <Ctx value={{ open, close, owner: state?.owner ?? null }}>
      {children}
      <div
        ref={panel}
        id="picker"
        className={`picker ${state?.bottom ? "picker--bottom" : "picker--top"} ${state ? "is-open" : ""}`}
        role="dialog"
        aria-modal="false"
        aria-labelledby="picker-title"
        style={state && !state.bottom ? { top: pos.top, right: pos.right } : undefined}
        inert={!state}
      >
        <p className="picker__title" id="picker-title">
          {state?.kind === "call" ? "Call which branch?" : "WhatsApp which branch?"}
        </p>
        <div className="picker__list">
          {branches.map((b) => {
            const num = (state?.kind === "call" ? b.phone : b.whatsapp).replace(/\D/g, "");
            const href = state?.kind === "call" ? `tel:+91${num}` : `https://wa.me/91${num}${text}`;
            return (
              <a
                key={b.slug}
                href={href}
                {...(state?.kind === "whatsapp" ? { target: "_blank", rel: "noopener" } : {})}
                // A placeholder number must never dial (DUMMY D2)
                onClick={b.dummy ? (e) => e.preventDefault() : () => close()}
                aria-disabled={b.dummy ? true : undefined}
              >
                <span>{b.name}</span>
                <span className="picker__num">{state ? displayNumber(b, state.kind) : ""}</span>
              </a>
            );
          })}
        </div>
        {branches.some((b) => b.dummy) && <DummyTag id="D2" />}
      </div>
    </Ctx>
  );
}

/** Any Call / WhatsApp button that should ask "Which branch?" first. */
export function PickerButton({ kind, waText, className, children, label }: {
  kind: Kind; waText?: string; className?: string; children: ReactNode; label?: string;
}) {
  const ctx = useContext(Ctx);
  const id = useId();
  const isOpen = ctx?.owner === id;
  return (
    <button
      type="button"
      className={className}
      aria-label={label}
      aria-haspopup="dialog"
      aria-expanded={isOpen}
      aria-controls="picker"
      onClick={(e) => {
        if (!ctx) return;
        if (isOpen) return ctx.close(true);
        ctx.open({ kind, waText, anchor: e.currentTarget, owner: id, bottom: !!e.currentTarget.closest(".stickybar") });
      }}
    >
      {children}
    </button>
  );
}
