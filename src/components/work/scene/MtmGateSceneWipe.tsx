"use client";

import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { easeInOutCubic, easeOutCubic, type MV } from "./HealthSceneParts";
import { clamp01, pct } from "./MtmKitMath";
import { WIPE } from "./MtmGateSceneData";

/* Pages that take over a box in three beats, so no frame ever shows two half pages. Boundary k sits between page k - 1 and
   page k and runs while `pos` rises from k - 1 to k. First the old content fades out in place, then a thin accent edge sweeps
   across the empty frame and swaps it (page k on the left of the edge, page k - 1 on the right, both without content), then
   the new content fades in. Content sits inside <Ink>, the frame around it does not. Falling pos plays it all back. */

const InkContext = createContext<MV | null>(null);

/** How far through boundary k the wipe is, 0..1. */
const beat = (pos: number, k: number) => clamp01(pos - (k - 1));
const outInk = (t: number) => 1 - easeOutCubic(clamp01(t / WIPE.out));
const inInk = (t: number) => clamp01((t - WIPE.sweep) / (1 - WIPE.sweep));
export const edgeAt = (t: number) => easeInOutCubic(clamp01((t - WIPE.out) / (WIPE.sweep - WIPE.out)));
/** Ink of a page that is being covered (`t` is beat k + 1) or revealed (`t` is beat k). */
export const inkAt = (pos: number, k: number) => outInk(beat(pos, k + 1)) * inInk(beat(pos, k));

/** Ink of something that stays once boundary k has shown it, like the tab row that comes with the first page swap. */
export const revealAt = (pos: number, k: number) => inInk(beat(pos, k));

/** The content of a page: it takes the ink of the page that holds it, so it is gone while the edge is on the way. */
export function Ink({ children, className = "", style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ink = useContext(InkContext);
  return (
    <motion.div style={{ ...style, opacity: ink ?? 1 }} className={className}>
      {children}
    </motion.div>
  );
}

function WipePage({ pos, k, children }: { pos: MV; k: number; children: ReactNode }) {
  const right = useTransform(pos, (v) => edgeAt(beat(v, k)));
  const left = useTransform(pos, (v) => edgeAt(beat(v, k + 1)));
  const ink = useTransform(pos, (v) => inkAt(v, k));
  const clip = useTransform([right, left], ([r, l]: number[]) => `inset(0 ${pct(100 - r * 100)} 0 ${pct(l * 100)})`);
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0">
      <InkContext.Provider value={ink}>{children}</InkContext.Provider>
    </motion.div>
  );
}

function ScanEdge({ pos, k }: { pos: MV; k: number }) {
  const front = useTransform(pos, (v) => edgeAt(beat(v, k)));
  const left = useTransform(front, (f) => pct(f * 100));
  const opacity = useTransform(front, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left, opacity }}
      className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 rounded-full bg-accent"
    />
  );
}

export function WipeStack({ pos, pages, className = "" }: { pos: MV; pages: readonly ReactNode[]; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {pages.map((page, k) => (
        <WipePage key={k} pos={pos} k={k}>
          {page}
        </WipePage>
      ))}
      {pages.slice(1).map((_, i) => (
        <ScanEdge key={i} pos={pos} k={i + 1} />
      ))}
    </div>
  );
}
