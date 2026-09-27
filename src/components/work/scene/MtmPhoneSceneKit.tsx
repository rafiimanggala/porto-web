"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { PT, STAGE_H, STAGE_W } from "./MobileSceneData";
import { frameAt, frameEase, lerp } from "./MobileSceneMath";
import { floorPx, u } from "./MobileSceneKit";
import { HEAD_TEXT_H, type Rect, type Span } from "./MtmPhoneSceneData";

/* Shared building blocks: the stage with its zoom camera, rect helpers, the type scale that eases from the wide size to the
   390 pt phone scale, and small annotation pieces. Every visual here is a pure function of progress. */

export type SV = MotionValue<string>;
export type Type = { name: SV; label: SV };

const STAGE_FIT = "min(100cqw, 90cqh)";
const NARROW_PX = 520;
const ZOOM_MAX = 1.5;
const FIT_MARGIN = 4;

/* Measured once per resize. On a narrow stage the whole desk browser is shown at its own scale, inside the 16 px page
   gutters, so nothing is ever cropped by the screen edge; only the phone that it becomes zooms in to fill the height.
   --cam-zoom is that final zoom, --cam-fit the stage width the narrowing frame must stay inside. Type that would fall
   under its pixel floor is floored, and a caption that no longer fits its box is hidden whole (see fitClass). */
function useZoomVar(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      if (!el.clientHeight) return;
      const narrow = el.clientWidth < NARROW_PX;
      const stagePx = Math.min(el.clientWidth, 0.9 * el.clientHeight);
      const fit = (el.clientHeight * 0.98) / ((stagePx * STAGE_H) / STAGE_W);
      el.style.setProperty("--cam-zoom", (narrow ? Math.max(1, Math.min(ZOOM_MAX, fit)) : 1).toFixed(3));
      el.style.setProperty("--cam-fit", narrow ? (STAGE_W - FIT_MARGIN).toFixed(1) : "9999");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
}

/* The camera holds the whole frame at its own scale and eases in to the phone zoom as the frame narrows, never wider
   than the stage. */
function camZoom(v: number) {
  const follow = `(1 + (var(--cam-zoom, 1) - 1) * ${frameEase(v).toFixed(4)})`;
  return `min(${follow}, var(--cam-fit, 9999) / ${frameAt(v).frame.w.toFixed(2)})`;
}

export function Stage({ p, children }: { p: MV; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useZoomVar(ref);
  const transform = useTransform(p, (v) => `scale(${camZoom(v)})`);
  return (
    <div ref={ref} className="absolute inset-0 grid place-items-center" style={{ containerType: "size" }}>
      <motion.div
        className="relative"
        style={{
          width: STAGE_FIT,
          aspectRatio: `${STAGE_W} / ${STAGE_H}`,
          containerType: "inline-size",
          transform,
          ["--u" as string]: `calc(100cqw / ${STAGE_W})`,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export function useRect<S>(src: MotionValue<S>, pick: (s: S) => Rect) {
  const r = useTransform(src, pick);
  return {
    left: useTransform(r, (b) => u(b.x)),
    top: useTransform(r, (b) => u(b.y)),
    width: useTransform(r, (b) => u(b.w)),
    height: useTransform(r, (b) => u(b.h)),
  };
}

const fs = (units: number, floor: number) => `max(${u(units)}, ${floorPx(floor)})`;

/* Rendered type never drops below its floor: the floor is divided by the zoom the camera has at this moment. */
export const fsAt = (units: number, floor: number, v: number) => `max(${u(units)}, calc(${floor}px / ${camZoom(v)}))`;

/* Phone type of a fixed role: n is an iPhone point size on a 390 pt screen, floored in rendered px. */
export const font = (n: number, floor: number) => fs(n * PT, floor);

const NAME = { wide: 7.4, phone: 15 * PT, floor: 10.5 };
const LABEL = { wide: 6.4, phone: 12 * PT, floor: 10.5 };

export function useType(p: MV): Type {
  return {
    name: useTransform(p, (v) => fsAt(lerp(NAME.wide, NAME.phone, frameEase(v)), NAME.floor, v)),
    label: useTransform(p, (v) => fsAt(lerp(LABEL.wide, LABEL.phone, frameEase(v)), LABEL.floor, v)),
  };
}

/* A span no progress ever reaches: hands a beat to the items that sit it out. */
export const NO_BEAT: Span = [-2, -1];

/* 0 to 1 and back inside [a, b]: a highlight that sweeps over an element. */
export function useBeat(p: MV, a: number, b: number): MV {
  return useTransform(p, [a, (a + b) / 2, b], [0, 1, 0]);
}

/* A highlight is an outline that lights up, never a tint: the drawing under it keeps its own colours. */
export function Flash({ beat, tone = "accent" }: { beat: MV; tone?: "accent" | "dim" }) {
  return (
    <motion.i
      aria-hidden
      style={{ opacity: beat, borderWidth: u(1.2) }}
      className={`pointer-events-none absolute inset-0 rounded-[inherit] ${tone === "dim" ? "border-dim" : "border-accent"}`}
    />
  );
}

const TAP_D = 15;

export function Tap({ p, span, style }: { p: MV; span: Span; style: CSSProperties }) {
  const t = useSeg(p, span[0], span[1], easeOutCubic);
  const opacity = useTransform(t, [0, 0.12, 1], [0, 1, 0]);
  const scale = useTransform(t, (v) => 0.5 + 0.9 * v);
  return (
    <motion.i
      aria-hidden
      style={{ ...style, opacity, scale, width: u(TAP_D), height: u(TAP_D), marginLeft: u(-TAP_D / 2), marginTop: u(-TAP_D / 2) }}
      className="pointer-events-none absolute z-50 rounded-full border-[1.5px] border-accent bg-accent/25"
    />
  );
}

export const clipRight = (r: number) => `inset(0 ${((1 - Math.min(1, Math.max(0, r))) * 100).toFixed(2)}% 0 0)`;

const FEATHER = 14;

/* A wipe with a soft leading edge: fully shown at r = 1, gone at r = 0, so a half erased word fades out instead of
   ending on a hard cut. */
export const softWipe = (r: number) => {
  const pos = Math.min(1, Math.max(0, r)) * (100 + FEATHER);
  return `linear-gradient(90deg, #000 ${(pos - FEATHER).toFixed(2)}%, transparent ${pos.toFixed(2)}%)`;
};

/* The counter is dropped when the header is narrower than both labels, and the whole header while it would straddle an edge. */
export function Head({ type, right, show, children }: { type: Type; right?: ReactNode; show?: MV; children: ReactNode }) {
  return (
    <motion.p
      style={{ fontSize: type.label, lineHeight: 1, height: u(HEAD_TEXT_H), opacity: show }}
      className={`${MONO} @container absolute inset-x-0 top-0 flex items-start justify-between whitespace-nowrap uppercase tracking-[0.08em] text-mute`}
    >
      <span>{children}</span>
      {right}
    </motion.p>
  );
}
