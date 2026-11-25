"use client";

import { useOptimistic, useTransition } from "react";
import { toggleSoldOut } from "@/app/admin/(staff)/actions";

/* One-tap In stock / Sold out (Requirements_Admin.md 6.3, 7). Shows the new
   state straight away; the server action saves it and refreshes the public site. */
export function SoldOutToggle({ frameId, soldOut, label }: { frameId: string; soldOut: boolean; label: string }) {
  const [state, setState] = useOptimistic(soldOut);
  const [pending, start] = useTransition();
  return (
    <label className="switch" style={{ minWidth: "9.5rem" }}>
      <span className="switch__text"><b>{state ? "Sold out" : "In stock"}</b></span>
      <input
        type="checkbox"
        role="switch"
        aria-label={`Sold out: ${label}`}
        checked={state}
        disabled={pending}
        onChange={() => start(async () => { setState(!state); await toggleSoldOut(frameId); })}
      />
    </label>
  );
}
