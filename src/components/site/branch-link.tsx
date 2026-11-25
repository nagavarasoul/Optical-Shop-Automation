"use client";

import type { ReactNode } from "react";
import type { Branch } from "@/lib/queries/site";
import { DummyTag } from "./dummy-tag";
import { Icon } from "./icons";

/** A call / WhatsApp link to one branch; a DUMMY number never dials (D2). */
export function BranchLink({ b, kind, text, className, label, children }: { b: Branch; kind: "call" | "whatsapp"; text?: string; className: string; label?: string; children: ReactNode }) {
  const href = kind === "call" ? `tel:+91${b.phone}` : `https://wa.me/91${b.whatsapp}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
  return (
    <a className={className} href={href} {...(kind === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={b.dummy ? (e) => e.preventDefault() : undefined} aria-disabled={b.dummy ? true : undefined} aria-label={label}>
      {kind === "whatsapp" ? <Icon name="wa" className="icon icon--sm" /> : <Icon name="phone" className="icon icon--sm" />}{children}
      {b.dummy && <DummyTag id="D2" />}
    </a>
  );
}
