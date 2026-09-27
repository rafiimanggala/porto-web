import { fabricColor, type Fabric, type OrderItem } from "./MtmKitData";

/* Long sleeve dress shirt in fabric colour. Collar spread and cuff style are drawn large so they still read at 44px. */

const BODY = "M-6 -16.5L-16.5 -12.5L-19.8 10.6L-14.6 11.8L-12.4 -2.6L-11.8 17.2H11.8L12.4 -2.6L14.6 11.8L19.8 10.6L16.5 -12.5L6 -16.5L0 -9.5Z";

/* Left leaf of the collar. A wide flat spread for Cutaway, a narrow long point for Classic. */
const COLLAR_D: Readonly<Record<string, string>> = {
  Cutaway: "M0 -9.5L-5.8 -17.8L-14.8 -6.6Z",
  Classic: "M0 -9.5L-5.8 -17.6L-6.4 -1.2Z",
  "Button-down": "M0 -9.5L-5.8 -17.6L-10.4 -4.6Z",
};

/* Left cuff: one slim band with one button, or a tall doubled block with a fold line and two buttons. */
const CUFF_D = { single: "M-19.21 6.44L-13.97 7.65L-14.6 11.8L-19.8 10.6Z", double: "M-18.51 1.6L-13.04 2.85L-14.6 11.8L-19.8 10.6Z" } as const;
const FOLD_D = "M-19.16 6.1L-13.93 7.35";
const BUTTONS_D = { single: "M-16.9 9.1H-16.89", double: "M-16.7 9.6H-16.69M-16.2 4.6H-16.19" } as const;

const PAPER = "var(--color-fg)";
const INK = "var(--color-bg)";
const OUTLINE = { stroke: "var(--color-fg)", strokeWidth: 1.25, strokeLinejoin: "round" } as const;
/* Dark edge on collar and cuffs, so they stay drawn even on a white shirt. */
const EDGE = { stroke: INK, strokeWidth: 1, strokeLinejoin: "round" } as const;
const MIRROR = "scale(-1 1)";

/* Shadow inside the neck opening, between the two collar leaves. */
const NECK_D = "M-6 -16.5L0 -9.5L6 -16.5Z";

/* The kit mixes a deep sky fabric into a dark surface, which reads grey teal. A deep fabric is drawn on a navy base instead. */
const DEEP_BELOW = 40;
const NAVY = "oklch(0.25 0.075 262)";

export const shirtFill = (f: Fabric) => (f.tone === "sky" && f.amount < DEEP_BELOW ? `color-mix(in oklab, var(--color-sky) 20%, ${NAVY})` : fabricColor(f));

/* Lighter than the page so a navy shirt keeps its value contrast. */
export const TILE_BG = "bg-[color-mix(in_oklab,var(--color-fg)_12%,var(--color-surface-1))]";

function Half({ collar, double }: { collar: string; double: boolean }) {
  const kind = double ? "double" : "single";
  return (
    <>
      <path d={CUFF_D[kind]} fill={PAPER} {...EDGE} />
      {double && <path d={FOLD_D} stroke={INK} strokeWidth={1} />}
      <path d={BUTTONS_D[kind]} stroke={INK} strokeWidth={1.8} strokeLinecap="round" />
      <path d={collar} fill={PAPER} {...EDGE} />
    </>
  );
}

export function ItemShirt({ fabric, item }: { fabric: Fabric; item: OrderItem }) {
  const collar = COLLAR_D[item.collar] ?? COLLAR_D.Classic;
  const double = item.cuff === "Double" || item.cuff === "French";
  return (
    <svg viewBox="-21 -21 42 42" aria-hidden className="h-full w-full">
      <path d={BODY} fill={shirtFill(fabric)} {...OUTLINE} />
      <path d={NECK_D} fill={INK} fillOpacity={0.6} />
      <Half collar={collar} double={double} />
      <g transform={MIRROR}>
        <Half collar={collar} double={double} />
      </g>
      <path d="M0 -3V17" stroke="var(--color-fg)" strokeOpacity={0.5} strokeWidth={0.6} />
      <path d="M0 3H0.01M0 8.5H0.01M0 14H0.01" stroke="var(--color-fg)" strokeWidth={1.4} strokeLinecap="round" />
    </svg>
  );
}
