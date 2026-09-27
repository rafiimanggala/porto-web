"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, type MotionStyle } from "framer-motion";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { FH, FW } from "./PipeShortsData";

/* One fixed 358 by 430 design frame, scaled up as a whole and centred in the visual box. Positions are percentages of the
   frame, sizes that must scale use unit(n), and text keeps a real 10px minimum. Inside a PipePhone screen (its own size
   container) do not use unit(): size in px there. */

export const pctX = (x: number) => `${((x / FW) * 100).toFixed(3)}%`;
export const pctY = (y: number) => `${((y / FH) * 100).toFixed(3)}%`;
export const unit = (n: number) => `calc(var(--u) * ${n})`;

export const boxStyle = (x: number, y: number, w: number, h: number): CSSProperties => ({ left: pctX(x), top: pctY(y), width: pctX(w), height: pctY(h) });
export const pointPct = (x: number, y: number): readonly [number, number] => [(x / FW) * 100, (y / FH) * 100];

/** Mono data text: 10.5px on a phone, growing with the frame up to 13px. */
export const TEXT = `${MONO} text-[length:clamp(10.5px,calc(var(--u)*10),13px)] leading-[1.2]`;
/** Sans text for titles and topics. */
export const SANS = "font-sans text-[length:clamp(10.5px,calc(var(--u)*10.5),13px)] leading-[1.15]";
export const SMALL_SANS = "font-sans text-[length:clamp(10px,calc(var(--u)*10),12.5px)] leading-[1.15]";

export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center [container-type:size]">
      <div
        className="relative [container-type:size] [--u:calc(100cqw/358)]"
        style={{ width: `min(100cqw, calc(100cqh * ${FW} / ${FH}))`, aspectRatio: `${FW} / ${FH}` }}
      >
        <div className={`absolute inset-0 ${TEXT}`}>{children}</div>
      </div>
    </div>
  );
}

/** A full frame layer, so wipes can clip whole groups and coordinates stay shared. */
export function Layer({ children, style, className = "" }: { children: ReactNode; style?: MotionStyle; className?: string }) {
  return (
    <motion.div style={style} className={`pointer-events-none absolute inset-0 ${className}`}>
      {children}
    </motion.div>
  );
}

const SKINS = {
  line: "border-line-strong bg-surface-2 text-dim",
  accent: "border-accent bg-accent text-pastel-ink",
  mint: "border-mint bg-mint text-pastel-ink",
  sky: "border-sky bg-sky text-pastel-ink",
} as const;

/** Small mono pill. */
export function Pill({ children, tone = "line", className = "" }: { children: ReactNode; tone?: keyof typeof SKINS; className?: string }) {
  const skin = SKINS[tone];
  return <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-[0.5em] py-[0.15em] ${skin} ${className}`}>{children}</span>;
}

/** Mint check badge; `pop` is a 0..1 MotionValue (apply your own easing before passing it). */
export function TickBadge({ pop, size = 14, className = "" }: { pop: MV; size?: number; className?: string }) {
  return (
    <motion.span
      aria-hidden
      style={{ scale: pop, width: unit(size), height: unit(size) }}
      className={`grid shrink-0 place-items-center rounded-full bg-mint text-pastel-ink ${className}`}
    >
      <svg viewBox="0 0 16 16" className="h-[64%] w-[64%]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.4 8.6l3 3 6.2-6.6" />
      </svg>
    </motion.span>
  );
}

/** Shows an svg group from progress `at` on, so a resting wire does not sit there before its step begins. */
export function Gate({ p, at, children }: { p: MV; at: number; children: ReactNode }) {
  const opacity = useSeg(p, at - 0.008, at);
  return <motion.g style={{ opacity }}>{children}</motion.g>;
}
