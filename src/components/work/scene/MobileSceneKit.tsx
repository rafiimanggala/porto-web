"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { LAYOUT_ROOMY, PT, T, type CardDef, type Layout, type Rect, type Span } from "./MobileSceneData";
import { cardBoxAt, collapseAt, frameEase, inFlight, lerp, liftAt, segAt, underBarAt, veilAt } from "./MobileSceneMath";

/* Unit helper, wipe reveal, gutter swap, ring, rank tag and card shell. */

export const u = (n: number) => `calc(var(--u) * ${n})`;

/* Phone typography: n is an iPhone point size on a 390 pt screen. Rendered text never drops below the floor of its role
   (large title 13.5 px, card titles 10.5 px, body 10 px, captions and tab labels 9.5 px), whatever the zoom, so the type steps survive on a small stage. */
export const pt = (n: number) => u(n * PT);
export const floorPx = (px: number) => `calc(${px}px / var(--cam-zoom, 1))`;
const roleFloor = (n: number) => (n >= 20 ? 13.5 : n >= 15 ? 10.5 : n >= 14 ? 10 : 9.5);
export const font = (n: number) => `max(${pt(n)}, ${floorPx(roleFloor(n))})`;

export const LayoutCtx = createContext<Layout>(LAYOUT_ROOMY);
export const useLayout = () => useContext(LayoutCtx);

export const FS = 10.8;

export const TXT = {
  xs: { fontSize: u(FS), lineHeight: 1.15 },
} satisfies Record<string, CSSProperties>;

export const CARD_PAD = 6;

export function useBox(p: MV, fn: (v: number) => Rect) {
  const box = useTransform(p, fn);
  return {
    left: useTransform(box, (b) => u(b.x)),
    top: useTransform(box, (b) => u(b.y)),
    width: useTransform(box, (b) => u(b.w)),
    height: useTransform(box, (b) => u(b.h)),
  };
}

/* Unbuilt rows stay faintly legible, so the first frame reads as a finished dashboard rather than a skeleton. */
export const WIPE_BASE = 0.6;
const WIPE_FEATHER = 6;

const wipeMask = (t: number) => {
  const pos = t * (100 + WIPE_FEATHER);
  return `linear-gradient(90deg, #000 ${(pos - WIPE_FEATHER).toFixed(2)}%, rgba(0,0,0,${WIPE_BASE}) ${pos.toFixed(2)}%)`;
};

export function Wipe({
  p,
  a,
  b,
  className,
  style,
  children,
}: {
  p: MV;
  a: number;
  b: number;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  const t = useSeg(p, a, b, easeOutCubic);
  const mask = useTransform(t, wipeMask);
  return (
    <motion.div style={{ ...style, maskImage: mask, WebkitMaskImage: mask }} className={className}>
      {children}
    </motion.div>
  );
}

/* Old and new bodies never share an x: a blank gutter with the scan line rides between them.
   Anything left of the gutter is the new body, anything right of it is the old one. */
const GUTTER = 2.5;
const FADE = 4;
const REACH = GUTTER + FADE;
const newMask = (s: number) =>
  `linear-gradient(90deg, #000 ${(s - REACH).toFixed(2)}%, transparent ${(s - GUTTER).toFixed(2)}%)`;
const oldMask = (s: number) =>
  `linear-gradient(90deg, transparent ${(s + GUTTER).toFixed(2)}%, #000 ${(s + REACH).toFixed(2)}%)`;

export function Swap({ p, range, wide, phone }: { p: MV; range: Span; wide: ReactNode; phone: ReactNode }) {
  const t = useSeg(p, range[0], range[1], easeInOutCubic);
  const scan = useTransform(t, (v) => -REACH + v * (100 + 2 * REACH));
  const wideMask = useTransform(scan, oldMask);
  const phoneMask = useTransform(scan, newMask);
  const edgeLeft = useTransform(scan, (s) => `${s.toFixed(2)}%`);
  const edgeOp = useTransform(scan, [0, 8, 92, 100], [0, 1, 1, 0]);
  return (
    <div className="absolute inset-0">
      <motion.div style={{ maskImage: wideMask, WebkitMaskImage: wideMask }} className="absolute inset-0">
        {wide}
      </motion.div>
      <motion.div style={{ maskImage: phoneMask, WebkitMaskImage: phoneMask }} className="absolute inset-0">
        {phone}
      </motion.div>
      <motion.i
        aria-hidden
        style={{ left: edgeLeft, opacity: edgeOp }}
        className="pointer-events-none absolute bottom-0.5 top-0.5 z-10 w-0.5 -translate-x-1/2 rounded-full bg-accent shadow-[0_0_8px_var(--color-accent)]"
      />
    </div>
  );
}

export function Ring({ frac }: { frac: number }) {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
      <circle cx="50" cy="50" r="42" fill="none" strokeWidth="9" style={{ stroke: "var(--color-line-strong)" }} />
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        strokeWidth="9"
        strokeLinecap="round"
        pathLength={1}
        strokeDasharray={`${frac} 1`}
        style={{ stroke: "var(--color-accent)" }}
      />
    </svg>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <p className={`${MONO} uppercase text-mute`} style={{ fontSize: u(FS), lineHeight: 1, letterSpacing: "0.08em" }}>
      {children}
    </p>
  );
}

export function PhoneTitle({ children }: { children: ReactNode }) {
  return (
    <p className="truncate text-fg" style={{ fontSize: font(15), fontWeight: 600, lineHeight: 1.2 }}>
      {children}
    </p>
  );
}

export function Pane({ children, pad = CARD_PAD }: { children: ReactNode; pad?: number }) {
  return (
    <div className="absolute inset-0 flex flex-col" style={{ padding: u(pad) }}>
      {children}
    </div>
  );
}

const TAG_HOT_OPACITY = [0, 1, 1, 0.3];

const TAG_FONT_PHONE = 12 * PT;
const tagFont = (v: number) => `max(${u(lerp(FS, TAG_FONT_PHONE, frameEase(v)))}, ${floorPx(9.5)})`;
const TAG_PAD_Y = `max(0px, calc(${u(0.6)} - 1px))`;

function RankTag({ p, card }: { p: MV; card: CardDef }) {
  const op = useTransform(p, (v) => segAt(v, [card.tag[0], card.tag[0] + 0.015]) * (1 - segAt(v, T.tagsOut)));
  const pop = useSeg(p, card.tag[0], card.tag[1], easeOutBack);
  const scale = useTransform(pop, (v) => 0.6 + 0.4 * v);
  const w = card.wave[0];
  const hot = useTransform(p, [w, w + 0.012, w + 0.03, w + 0.07], TAG_HOT_OPACITY);
  const fontSize = useTransform(p, tagFont);
  return (
    <motion.span
      aria-hidden
      style={{ opacity: op, scale, top: u(4), right: u(4), padding: `${TAG_PAD_Y} ${u(3)}`, borderRadius: u(3) }}
      className="absolute z-20 grid place-items-center overflow-hidden border border-line-strong bg-surface-1"
    >
      <motion.i style={{ opacity: hot }} className="absolute inset-0 bg-accent" />
      <motion.span className={`relative ${MONO} tabular-nums text-fg`} style={{ fontSize, lineHeight: 1 }}>
        {String(card.rank).padStart(2, "0")}
      </motion.span>
    </motion.span>
  );
}

const REST_SHADOW = (y: number) => `0 ${u(y)} ${u(y * 2)} ${u(-y * 1.5)} rgba(0,0,0,0.6)`;

/* Resting drop shadow, a stronger lifted one while a card is in the air, and a hairline + soft edge once the score is a bar. */
function shadowAt(card: CardDef, v: number) {
  const lift = liftAt(card, v);
  const rest = REST_SHADOW(12 - 4 * lift);
  const air = `0 ${u(14 * lift)} ${u(26 * lift)} ${u(-6)} rgba(0,0,0,${(0.7 * lift).toFixed(3)})`;
  const ring = `0 0 0 ${u(0.75)} color-mix(in oklab, var(--color-accent) ${(55 * lift).toFixed(1)}%, transparent)`;
  if (card.key !== "score") return `${air}, ${ring}, ${rest}`;
  const bar = collapseAt(v, card.scroll);
  const hair = `0 ${u(1)} 0 0 color-mix(in oklab, var(--color-line-strong) ${(bar * 100).toFixed(1)}%, transparent)`;
  const edge = `0 ${u(6)} ${u(8)} ${u(-3)} rgba(0,0,0,${(0.6 * bar).toFixed(3)})`;
  return `${hair}, ${edge}, ${air}, ${ring}, ${rest}`;
}

/* Cut the top `under` units off a card; the other sides reach out past the shadow so it is never clipped. */
const clipUnder = (under: number) =>
  under > 0 ? `inset(${u(under)} ${u(-24)} ${u(-24)} ${u(-24)})` : "none";

const zAt = (card: CardDef, v: number) => (inFlight(card, v) ? 60 + card.order : card.z);

export function CardShell({ p, card, children }: { p: MV; card: CardDef; children: ReactNode }) {
  const box = useBox(p, (v) => cardBoxAt(card, v));
  const zIndex = useTransform(p, (v) => zAt(card, v));
  const boxShadow = useTransform(p, (v) => shadowAt(card, v));
  const veil = useTransform(p, (v) => veilAt(card, v));
  const bar = useLayout().cards[0];
  const clipPath = useTransform(p, (v) => clipUnder(underBarAt(card, bar, v)));
  return (
    <motion.div
      style={{ ...box, zIndex, boxShadow, clipPath, borderRadius: u(6) }}
      className="absolute overflow-hidden border border-line bg-surface-1"
    >
      {children}
      <motion.i aria-hidden style={{ opacity: veil }} className="pointer-events-none absolute inset-0 z-10 bg-surface-1" />
      <RankTag p={p} card={card} />
    </motion.div>
  );
}
