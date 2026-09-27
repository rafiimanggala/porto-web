"use client";

import { createContext, useContext, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { clamp01 } from "./PipeKitMath";
import { WIDE, type Layout } from "./PipeIsolationLayout";
import { seg, type Win } from "./PipeIsolationTime";

/* Small shared pieces of the isolation scene. Text is 10px on a phone stage and grows with the stage up to 14px. */

export const TXT = "text-[clamp(10px,2.8cqw,14px)]";
export const MONO_TXT = `${MONO} ${TXT}`;

/* The stage layout in force (wide, or tall on a portrait phone), provided once by the scene. */
const LayoutContext = createContext<Layout>(WIDE);
export const LayoutProvider = LayoutContext.Provider;
export const useLayout = () => useContext(LayoutContext);

/** Eased 0..1 progress of a window, as a MotionValue. */
export function useWin(p: MV, win: Win, ease?: (t: number) => number): MV {
  return useTransform(p, (v) => seg(v, win, ease));
}

export function Counter({ p, of, className = "" }: { p: MV; of: (v: number) => string; className?: string }) {
  const text = useTransform(p, of);
  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>;
}

export type Tone = "mute" | "accent" | "mint" | "rose";
export type RollLine = { readonly text: string; readonly tone: Tone };
const DOT: Record<Tone, string> = { mute: "bg-mute", accent: "bg-accent", mint: "bg-mint", rose: "bg-rose" };
const LINE_EM = 1.6;

const rollY = (idx: number, count: number) => `${((-clamp01(idx / (count - 1)) * (count - 1) * 100) / count).toFixed(3)}%`;

/** A dot and a word, rolled by position: the old state slides out as the next slides in, never ghosting in place. */
export function StateRoll({ idx, lines, className = "" }: { idx: MV; lines: readonly RollLine[]; className?: string }) {
  const y = useTransform(idx, (v) => rollY(Math.min(v, lines.length - 1), lines.length));
  return (
    <span className={`${MONO_TXT} block overflow-hidden leading-none ${className}`} style={{ height: `${LINE_EM}em` }}>
      <motion.span style={{ y }} className="flex flex-col">
        {lines.map((line, i) => (
          <span key={`${i}-${line.text}`} className="flex items-center justify-end gap-[0.6em] whitespace-nowrap text-fg" style={{ height: `${LINE_EM}em` }}>
            <i className={`h-[0.6em] w-[0.6em] shrink-0 rounded-full ${DOT[line.tone]}`} />
            {line.text}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

/** One-line strings stacked in a clipped box and rolled by position. */
export function RollText({ idx, lines, className = "" }: { idx: MV; lines: readonly string[]; className?: string }) {
  const y = useTransform(idx, (v) => rollY(Math.min(v, lines.length - 1), lines.length));
  return (
    <span className={`block overflow-hidden leading-none ${className}`} style={{ height: `${LINE_EM}em` }}>
      <motion.span style={{ y }} className="flex flex-col">
        {lines.map((line, i) => (
          <span key={`${i}-${line}`} className="flex items-center whitespace-nowrap" style={{ height: `${LINE_EM}em` }}>
            {line}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

const NEVER_IN: Win = [-2, -1];
const NEVER_OUT: Win = [2, 3];

/** A page of the middle band. It is revealed from the left as `enter` runs and consumed from the left as `leave` runs,
   so two pages meeting in one wipe are exact complements and never show the same spot twice. */
export function Page({ p, enter = NEVER_IN, leave = NEVER_OUT, className = "", children }: { p: MV; enter?: Win; leave?: Win; className?: string; children: ReactNode }) {
  const inW = useSeg(p, enter[0], enter[1], easeInOutCubic);
  const outW = useSeg(p, leave[0], leave[1], easeInOutCubic);
  const clipPath = useTransform([inW, outW], ([i, o]: number[]) => `inset(-8px ${((1 - i) * 100).toFixed(3)}% -8px ${(o * 100).toFixed(3)}%)`);
  return (
    <motion.div style={{ clipPath }} className={`absolute inset-0 ${className}`}>
      {children}
    </motion.div>
  );
}

/** The thin accent line at the moving edge of a wipe. */
export function WipeEdge({ p, win }: { p: MV; win: Win }) {
  const w = useSeg(p, win[0], win[1], easeInOutCubic);
  const left = useTransform(w, (v) => `${(v * 100).toFixed(3)}%`);
  const opacity = useTransform(w, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  return <motion.i aria-hidden style={{ left, opacity }} className="pointer-events-none absolute -bottom-1.5 -top-1.5 z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent" />;
}
