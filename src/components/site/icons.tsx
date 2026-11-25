/* The site's icon set, copied from the signed-off mockups (mockups/site.js):
   authored SVG, one stroke weight (1.75), styled by the .icon classes.
   Decorative by default (aria-hidden); give the button or link the label. */
import type { ReactNode } from "react";

const P: Record<string, ReactNode> = {
  search: <><circle cx="11" cy="11" r="6.5" /><path d="M20 20l-4.2-4.2" /></>,
  wa: <><path d="M3.6 20.4l1.2-3.9A8.6 8.6 0 1 1 8 19.3z" /><path d="M9.2 8.3c.2-.5.6-.5.9-.5h.5l1 2.2-.8 1c.5 1.1 1.4 2 2.5 2.5l1-.8 2.2 1v.5c0 .3 0 .7-.5.9-.7.4-1.6.5-2.7 0a8 8 0 0 1-4.3-4.3c-.4-1-.3-1.9.2-2.5z" /></>,
  phone: <path d="M5 4h3.2l1.6 4-2 1.3a10.5 10.5 0 0 0 4.9 4.9l1.3-2 4 1.6V17a2 2 0 0 1-2.2 2A15 15 0 0 1 3 6.2 2 2 0 0 1 5 4z" />,
  clock: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>,
  pin: <><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" /><circle cx="12" cy="10" r="2.3" /></>,
  cal: <><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h10" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  chev: <path d="M6 9l6 6 6-6" />,
  eye: <><path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" /><circle cx="12" cy="12" r="3" /></>,
  store: <><path d="M4 9.5V20h16V9.5M3 9.5l2-5.5h14l2 5.5a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z" /><path d="M10 20v-5h4v5" /></>,
  camp: <path d="M3 20h18M12 4L4 20M12 4l8 16M12 13l-3 7M12 13l3 7" />,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4" /></>,
  moon: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />,
  ig: <><rect x="4" y="4" width="16" height="16" rx="4.5" /><circle cx="12" cy="12" r="3.6" /><circle cx="16.8" cy="7.2" r="0.6" /></>,
  fb: <path d="M14 8.5h2.5V5H14a3.5 3.5 0 0 0-3.5 3.5V11H8v3.5h2.5V21H14v-6.5h2.5L17 11h-3V9a.5.5 0 0 1 .5-.5z" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.4 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10z" />,
  glasses: <><circle cx="11" cy="11" r="8" /><circle cx="37" cy="11" r="8" /><path d="M19 10c2.5-1.6 7.5-1.6 10 0M3 9L1 5M45 9l2-4" /></>,
  lens: <><circle cx="12" cy="12" r="8.5" /><path d="M8 9.5a5 5 0 0 1 4-2" /></>,
  adjust: <><path d="M4 7h10M18 7h2M4 17h2M10 17h10" /><circle cx="16" cy="7" r="2" /><circle cx="8" cy="17" r="2" /></>,
  share: <><circle cx="18" cy="5.5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="18.5" r="2.5" /><path d="M8.2 10.8l7.6-4.1M8.2 13.2l7.6 4.1" /></>,
  shield: <><path d="M12 3l7.5 3v5.5c0 4.5-3.2 8-7.5 9.5-4.3-1.5-7.5-5-7.5-9.5V6z" /><path d="M8.8 12l2.2 2.2 4.2-4.4" /></>,
  tool: <path d="M14.5 5.5a4 4 0 0 0 5 5l-9 9a2.1 2.1 0 0 1-3-3l9-9a4 4 0 0 1-2-2z" />,
  pause: <path d="M9 6v12M15 6v12" />,
  play: <path d="M8 5.5v13l10-6.5z" />,
  alert: <><path d="M12 3.5l9.5 16.5h-19z" /><path d="M12 10v4.5M12 17.2v.3" /></>,
  yt: <><rect x="3" y="6" width="18" height="12" rx="3.5" /><path d="M10.5 9.5v5l4.2-2.5z" /></>,
};

export type IconName = keyof typeof P;
// The frame drawing is wide; every other icon is drawn on a 24 x 24 grid
const VIEWBOX: Partial<Record<IconName, string>> = { glasses: "0 0 48 20" };

export function Icon({ name, className = "icon" }: { name: IconName; className?: string }) {
  return (
    <svg className={className} viewBox={VIEWBOX[name] ?? "0 0 24 24"} aria-hidden="true" focusable="false">
      {P[name]}
    </svg>
  );
}
