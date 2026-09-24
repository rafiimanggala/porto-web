"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, type MV } from "./HealthSceneParts";
import { QuizIcon } from "./EduTreeSceneIcons";
import { clamp01, keyframes } from "./EduTreeSceneMath";

/* Shared building blocks of the tree scene. Everything is a pure function of the progress it receives. */

type Ease = (t: number) => number;

export function useKeys(p: MV, xs: readonly number[], ys: readonly number[], ease?: Ease): MV {
  return useTransform(p, (v) => keyframes(v, xs, ys, ease ?? easeInOutCubic));
}

/* Position swap: a column of equal cells in a clipped box, `pos` slides it. Old and new never overlap. */
export function Roller({
  pos,
  items,
  className = "",
  cellClass = "",
}: {
  pos: MV;
  items: readonly ReactNode[];
  className?: string;
  cellClass?: string;
}) {
  const n = items.length;
  const y = useTransform(pos, (v) => `${((-Math.min(n - 1, Math.max(0, v)) * 100) / n).toFixed(3)}%`);
  return (
    <div className={`overflow-hidden ${className}`}>
      <motion.div style={{ y }} className="flex flex-col">
        {items.map((it, i) => (
          <div key={i} className={`flex shrink-0 items-center ${cellClass}`}>
            {it}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

/* The display face closes the counter of a zero into a solid blob at this size, so a zero is set in the sans face. */
export const ZERO_STYLE = { fontFamily: "var(--font-sans)", fontWeight: 700 } as const;
export const isZero = (text: string) => text === "0";

/* Digit column: a counter that rolls instead of blinking. */
export function Odometer({ value, max, className = "" }: { value: MV; max: number; className?: string }) {
  const y = useTransform(value, (v) => `${((-clamp01(v / max) * max * 100) / (max + 1)).toFixed(3)}%`);
  const digits = Array.from({ length: max + 1 }, (_, i) => i);
  return (
    <span className={`inline-block h-[1.4em] overflow-hidden leading-[1.4em] ${className}`}>
      <motion.span style={{ y }} className="flex flex-col">
        {digits.map((d) => (
          <span key={d} style={d === 0 ? ZERO_STYLE : undefined} className="block h-[1.4em] leading-[1.4em] tabular-nums">
            {d}
          </span>
        ))}
      </motion.span>
    </span>
  );
}

export const MONO_LABEL = `${MONO} text-[11px] uppercase tracking-[0.12em] text-mute`;

const LEVEL_TINT = { 1: "var(--color-mint)", 2: "var(--color-sun)" } as const;

/* A quiz level chip: in the tray, in flight and stamped on a row it is the same object. */
export function QuizChip({ level, className = "" }: { level: 1 | 2; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-[5px] ${MONO} text-[11px] leading-none text-fg @min-[500px]:text-[12px] ${className}`}
      style={{
        width: "var(--chip-w)",
        height: "var(--chip-h)",
        background: `color-mix(in oklab, ${LEVEL_TINT[level]} 55%, var(--color-surface-1))`,
        boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--color-fg) 38%, transparent)",
      }}
    >
      <QuizIcon className="h-[11px] w-[11px] shrink-0 @min-[500px]:h-[15px] @min-[500px]:w-[15px]" />
      Level {level}
    </span>
  );
}

/* Small mono pill used for status text. */
export function Pill({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap ${MONO} text-[11px] ${className}`}>
      {children}
    </span>
  );
}
