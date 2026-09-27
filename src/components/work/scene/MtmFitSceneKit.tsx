"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { pct, toneTint, type ToneName } from "./MtmKitMath";

const EDGE = "pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-accent";
const EDGE_FADE: number[] = [0, 0.04, 0.96, 1];

/* The outgoing layer of a wipe is gone after this share of the wipe, so the edge never slices through old glyphs: it only reveals the new layer. */
export const OUT_FADE = 0.2;

export function useWipe(t: MV) {
  const oldClip = useTransform(t, (f) => `inset(0 0 0 ${pct(f * 100)})`);
  const newClip = useTransform(t, (f) => `inset(0 ${pct(100 - f * 100)} 0 0)`);
  const edgeLeft = useTransform(t, (f) => pct(f * 100));
  const edgeOpacity = useTransform(t, EDGE_FADE, [0, 1, 1, 0]);
  return { oldClip, newClip, edgeLeft, edgeOpacity };
}

export function Edge({ left, opacity }: { left: MotionValue<string> | string; opacity: MV }) {
  return <motion.i aria-hidden style={{ left, opacity }} className={EDGE} />;
}

type WipeProps = { t: MV; from: ReactNode; to: ReactNode; className?: string };

export function Wipe({ t, from, to, className = "" }: WipeProps) {
  const w = useWipe(t);
  const oldOpacity = useTransform(t, [0, OUT_FADE], [1, 0]);
  return (
    <div className={`relative ${className}`}>
      <motion.div style={{ clipPath: w.oldClip, opacity: oldOpacity }} className="absolute inset-0">
        {from}
      </motion.div>
      <motion.div style={{ clipPath: w.newClip }} className="absolute inset-0">
        {to}
      </motion.div>
      <Edge left={w.edgeLeft} opacity={w.edgeOpacity} />
    </div>
  );
}

export function Reveal({ t, children, className = "" }: { t: MV; children: ReactNode; className?: string }) {
  const clip = useTransform(t, (f) => `inset(0 ${pct(100 - f * 100)} 0 0)`);
  const left = useTransform(t, (f) => pct(f * 100));
  const opacity = useTransform(t, EDGE_FADE, [0, 1, 1, 0]);
  return (
    <div className={`relative ${className}`}>
      <motion.div style={{ clipPath: clip }} className="h-full">
        {children}
      </motion.div>
      <Edge left={left} opacity={opacity} />
    </div>
  );
}

export function Tag({ tone, children, className = "" }: { tone: ToneName; children: ReactNode; className?: string }) {
  return (
    <span
      className={`${MONO} inline-flex items-center rounded-[4px] px-1.5 py-[2px] text-[10px] uppercase leading-none tracking-[0.1em] text-fg ${className}`}
      style={{ background: toneTint(tone, 0.4) }}
    >
      {children}
    </span>
  );
}
