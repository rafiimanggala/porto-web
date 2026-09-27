"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { clamp01, pct, toneTint } from "./MtmKitMath";

/* Small building blocks of the email scene. */

const EDGE = "pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 rounded-full bg-accent";

/* Complementary clip swap of two faces behind an accent edge. */
export function WipeSwap({ t, a, b, className = "" }: { t: MV; a: ReactNode; b: ReactNode; className?: string }) {
  const aClip = useTransform(t, (v) => `inset(0 0 0 ${pct(v * 100)})`);
  const bClip = useTransform(t, (v) => `inset(0 ${pct(100 - v * 100)} 0 0)`);
  const edge = useTransform(t, (v) => pct(v * 100));
  const edgeOn = useTransform(t, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <div className={className}>
      <motion.div style={{ clipPath: aClip }} className="absolute inset-0">
        {a}
      </motion.div>
      <motion.div style={{ clipPath: bClip }} className="absolute inset-0">
        {b}
      </motion.div>
      <motion.i aria-hidden style={{ left: edge, opacity: edgeOn }} className={EDGE} />
    </div>
  );
}

type MergeProps = { type: MV; res: MV; raw: ReactNode; done: ReactNode; className?: string; center?: boolean };

/* The raw tag is gone by this share of the sweep, so its tail is never read next to the value. */
const RAW_GONE = 0.35;

type LayerProps = { clip: MotionValue<string>; fade?: MV; at: MotionValue<string>; on: MV; mark: string; center: boolean; children: ReactNode };

/* One face of a merge cell. Clip and marker use the face's own width, so a narrow value never leaves a raw tail behind. */
function Layer({ clip, fade, at, on, mark, center, children }: LayerProps) {
  return (
    <div className={`relative col-start-1 row-start-1 flex ${center ? "justify-self-center" : "justify-self-start"}`}>
      <motion.div style={{ clipPath: clip, opacity: fade }} className="flex items-center">
        {children}
      </motion.div>
      <motion.i aria-hidden style={{ left: at, opacity: on }} className={mark} />
    </div>
  );
}

const CARET = "pointer-events-none absolute inset-y-[2px] z-10 w-px -translate-x-1/2 bg-accent";

/* Raw tag typed by clip, then faded out while the real value is swept in, same cell. */
export function Merge({ type, res, raw, done, className = "", center = false }: MergeProps) {
  const rawClip = useTransform([type, res], ([t, r]: number[]) => `inset(0 ${pct(100 - t * 100)} 0 ${pct(r * 100)})`);
  const rawFade = useTransform(res, (r) => 1 - clamp01(r / RAW_GONE));
  const doneClip = useTransform(res, (r) => `inset(0 ${pct(100 - r * 100)} 0 0)`);
  const caret = useTransform(type, (t) => pct(t * 100));
  const caretOn = useTransform(type, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const edge = useTransform(res, (r) => pct(r * 100));
  const edgeOn = useTransform(res, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  const glow = useTransform(res, [0, 0.15, 0.7, 1], [0, 1, 0.6, 0]);
  return (
    <div className={`relative grid w-fit max-w-full ${className}`}>
      <motion.i aria-hidden style={{ opacity: glow }} className="pointer-events-none absolute -inset-x-1 inset-y-0 rounded-md bg-accent/20" />
      <Layer clip={rawClip} fade={rawFade} at={caret} on={caretOn} mark={CARET} center={center}>
        {raw}
      </Layer>
      <Layer clip={doneClip} at={edge} on={edgeOn} mark={EDGE} center={center}>
        {done}
      </Layer>
    </div>
  );
}

/* Raw merge tag chip. */
export function Tag({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={`${className} ${MONO} inline-flex items-center whitespace-nowrap rounded-[4px] px-1.5 py-px text-[10px] leading-[12px] text-fg [@container(min-width:34rem)_and_(min-height:36rem)]:text-[11px] [@container(min-width:34rem)_and_(min-height:36rem)]:leading-[14px]`}
      style={{ background: toneTint("accent", 0.28) }}
    >
      {children}
    </span>
  );
}

/* Event bolt glyph. */
export function Bolt({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden className={className}>
      <path
        d="M3 -10.6L-6.6 1.4H-0.9L-3 10.6L6.8 -2.2H1Z"
        fill="color-mix(in oklab, var(--color-sun) 70%, transparent)"
        stroke="var(--color-fg)"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
