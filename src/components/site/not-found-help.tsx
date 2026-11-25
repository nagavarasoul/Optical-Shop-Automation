"use client";

import { useState } from "react";
import { PickerButton } from "@/components/site/branch-picker";
import { Icon } from "@/components/site/icons";

/* "Ask us on WhatsApp" on the 404 and error pages, with the address the
   visitor was on in the message. The 404 page is pre-rendered once for every
   missing address, so the address is read in the browser. It only goes into
   the message, never into the page, so server and browser HTML still match. */
export function AskOnWhatsApp({ error = false }: { error?: boolean }) {
  const [where] = useState(() => (typeof window === "undefined" ? "" : window.location.href));
  const text = error
    ? "Hi VS Lens Mart, a page on your website isn’t loading for me."
    : `Hi VS Lens Mart, I was looking for a page on your website${where ? `: ${where}` : "."}`;
  return (
    <PickerButton kind="whatsapp" waText={text} className="btn btn--outline-dark">
      <Icon name="wa" className="icon icon--sm" />Ask us on WhatsApp
    </PickerButton>
  );
}
