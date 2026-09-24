"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { PT, STAGE_H, STAGE_W } from "./MobileSceneData";
import { frameAt, frameEase, lerp, segAt } from "./MobileSceneMath";
import { FS, floorPx, u } from "./MobileSceneKit";
import { HEAD_TEXT_H, M, PAGE_H, T, type Rect, type Span } from "./EduPhoneSceneData";
import { panAt } from "./EduPhoneSceneMath";

/* Shared building blocks: the stage with its zoom camera, rect helpers, the type
   scale that eases from the wide size to the 390 pt phone scale, and small
   annotation pieces. Every visual here is a pure function of progress. */

export type SV = MotionValue<string>;
export type Type = { body: SV; name: SV; label: SV };

const STAGE_FIT = "min(100cqw, 90cqh)";
const NARROW_PX = 520;
const ZOOM_MAX = 1.5;
const LAP_ZOOM = 1.45;
const LAP_BAND = 290;
const PAN_EDGE = 2;

/* Measured once per resize. On a narrow stage the laptop state is zoomed in and panned across (its 12 px type would
   otherwise read as 10 px), and the phone state zooms to fill the height. --cam-pan is the reach of the pan in stage
   units, --cam-fit the stage width that fits the viewport (in units times zoom), so the camera can pull back to keep
   the narrowing frame whole. */
function useZoomVar(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const narrow = el.clientWidth < NARROW_PX;
      const stagePx = Math.min(el.clientWidth, 0.9 * el.clientHeight);
      const fit = (el.clientHeight * 0.98) / ((stagePx * STAGE_H) / STAGE_W);
      const lapFit = (el.clientHeight * 0.98) / ((stagePx * LAP_BAND) / STAGE_W);
      const lap = narrow ? Math.max(1, Math.min(LAP_ZOOM, lapFit)) : 1;
      const zoom = narrow ? Math.max(1, Math.min(ZOOM_MAX, fit)) : 1;
      const view = document.documentElement.clientWidth;
      el.style.setProperty("--cam-zoom", zoom.toFixed(3));
      el.style.setProperty("--cam-lap", lap.toFixed(3));
      el.style.setProperty("--cam-pan", Math.max(0, (STAGE_W / 2) * (1 - 1 / lap) - PAN_EDGE).toFixed(2));
      el.style.setProperty("--cam-fit", narrow ? ((0.97 * view * STAGE_W) / stagePx).toFixed(1) : "9999");
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
}

/* Zoom follows the frame from the laptop value to the phone value. Once the frame starts to narrow the camera pulls
   back so the whole frame stays in view, then follows it in as it shrinks; on a wide stage all three values are 1. */
function camZoom(v: number) {
  const t = frameEase(v);
  const follow = `(var(--cam-lap, 1) + (var(--cam-zoom, 1) - var(--cam-lap, 1)) * ${t.toFixed(4)})`;
  const whole = `min(${follow}, var(--cam-fit, 9999) / ${frameAt(v).frame.w.toFixed(2)})`;
  const pull = easeInOutCubic(segAt(v, T.camPull));
  return `calc(var(--cam-lap, 1) + (${whole} - var(--cam-lap, 1)) * ${pull.toFixed(4)})`;
}
const camPan = (v: number) => `calc(var(--cam-pan, 0) * ${((panAt(v) / STAGE_W) * 100).toFixed(4)}%)`;

export function Stage({ p, children }: { p: MV; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useZoomVar(ref);
  const transform = useTransform(p, (v) => `translateX(${camPan(v)}) scale(${camZoom(v)})`);
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

const LABEL_WIDE = 9.6;
const fs = (units: number, floor: number) => `max(${u(units)}, ${floorPx(floor)})`;
/* Rendered type never drops below its floor: the floor is divided by the zoom the camera has at this moment. */
export const fsAt = (units: number, floor: number, v: number) => `max(${u(units)}, calc(${floor}px / ${camZoom(v)}))`;

/* Phone type of a fixed role: n is an iPhone point size on a 390 pt screen, floored in rendered px. */
export const font = (n: number, floor: number) => fs(n * PT, floor);

export function useType(p: MV): Type {
  return {
    body: useTransform(p, (v) => fsAt(lerp(FS, 14 * PT, frameEase(v)), 10.5, v)),
    name: useTransform(p, (v) => fsAt(lerp(FS, 15 * PT, frameEase(v)), 10.5, v)),
    label: useTransform(p, (v) => fsAt(lerp(LABEL_WIDE, 12 * PT, frameEase(v)), 10.5, v)),
  };
}

export function Header({ type, children }: { type: Type; children: ReactNode }) {
  return (
    <motion.p
      style={{ fontSize: type.label, lineHeight: 1, height: u(HEAD_TEXT_H) }}
      className={`${MONO} absolute left-0 top-0 whitespace-nowrap uppercase tracking-[0.08em] text-mute`}
    >
      {children}
    </motion.p>
  );
}

/* 0 to 1 and back inside [a, b]: a highlight that sweeps over an element. */
export function useBeat(p: MV, a: number, b: number): MV {
  return useTransform(p, [a, (a + b) / 2, b], [0, 1, 0]);
}

export function Flash({ beat, className = "" }: { beat: MV; className?: string }) {
  const opacity = useTransform(beat, (v) => v * 0.3);
  return <motion.i aria-hidden style={{ opacity }} className={`pointer-events-none absolute inset-0 rounded-[inherit] bg-accent ${className}`} />;
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

/* One full phone screen of the pager. Page k sits k screens below the home page. */
export function PageShell({ k, children }: { k: number; children: ReactNode }) {
  return (
    <div className="absolute inset-x-0" style={{ top: u(k * PAGE_H), height: u(PAGE_H) }}>
      {children}
    </div>
  );
}

export const PAGE_TITLE_TOP = 30;
export const PAGE_BODY_TOP = 64;

export function PageTitle({ title, caption }: { title: string; caption: string }) {
  return (
    <>
      <h3
        className="absolute text-fg"
        style={{ left: u(M), top: u(PAGE_TITLE_TOP), fontSize: font(26, 13.5), lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.02em" }}
      >
        {title}
      </h3>
      <p
        className={`${MONO} absolute uppercase tracking-[0.08em] text-mute`}
        style={{ left: u(M), top: u(PAGE_TITLE_TOP + 20), fontSize: font(12, 10.5), lineHeight: 1 }}
      >
        {caption}
      </p>
    </>
  );
}
