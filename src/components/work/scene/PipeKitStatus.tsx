"use client";

import { motion, motionValue, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, type MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { ROW_ID, STATUS } from "./PipeKitData";
import { clamp01 } from "./PipeKitMath";

/* The sheet row that travels through the pipeline, drawn as one row of a sheet: the row id, then the five status
   cells with a cursor box that slides to the current one. */

const NONE = motionValue(0);
const NEVER = 2;
const DEFAULT_AT: readonly number[] = [-1, NEVER, NEVER, NEVER, NEVER];
const DEFAULT_BLEND = 0.03;
const CELLS = STATUS.length;
const CELL_INSET = 1;

/** Continuous status index at progress v: 0 = idea ... 4 = posted, fractional while switching. Each entry of `statusAt` is the
   progress where that status is reached: use -1 for "already there when the scene starts" and 2 for "never in this scene". */
export function statusIndexAt(v: number, statusAt: readonly number[], blend = DEFAULT_BLEND): number {
  return statusAt.reduce((sum, at) => sum + easeInOutCubic(clamp01((v - at) / blend + 0.5)), -1);
}

export function useStatusIndex(p: MV, statusAt: readonly number[], blend = DEFAULT_BLEND): MV {
  return useTransform(p, (v) => statusIndexAt(v, statusAt, blend));
}

const mixed = (a: number, d: number) =>
  `color-mix(in oklab, var(--color-fg) ${(a * 100).toFixed(1)}%, color-mix(in oklab, var(--color-mint) ${(d * 100).toFixed(1)}%, var(--color-mute)))`;

function Cell({ i, label, idx }: { i: number; label: string; idx: MV }) {
  const color = useTransform(idx, (v) => mixed(clamp01(1 - Math.abs(v - i)), clamp01(v - i)));
  return (
    <motion.span style={{ color }} className={`grid place-items-center ${i > 0 ? "border-l border-line" : ""}`}>
      {label}
    </motion.span>
  );
}

function Cursor({ idx }: { idx: MV }) {
  const left = useTransform(idx, (v) => `calc(${(Math.min(CELLS - 1, Math.max(0, v)) * 100) / CELLS}% + ${CELL_INSET}px)`);
  const opacity = useTransform(idx, (v) => clamp01(v + 1));
  return (
    <motion.i
      aria-hidden
      style={{ left, opacity, width: `calc(${100 / CELLS}% - ${CELL_INSET * 2}px)` }}
      className="absolute inset-y-[3px] rounded-[4px] border-[1.5px] border-accent bg-accent/15"
    />
  );
}

type StatusStripProps = {
  /** Status index MV, 0 (idea) to 4 (posted), fractional while switching. Wins over p and statusAt. */
  index?: MV;
  /** Scene progress, used with statusAt. */
  p?: MV;
  /** Progress at which each of the five statuses is reached. See statusIndexAt. */
  statusAt?: readonly number[];
  /** Progress width of one switch. Default 0.03. */
  blend?: number;
  rowId?: string;
  className?: string;
};

export function StatusStrip({ index, p, statusAt = DEFAULT_AT, blend = DEFAULT_BLEND, rowId = ROW_ID, className = "" }: StatusStripProps) {
  const derived = useStatusIndex(p ?? NONE, statusAt, blend);
  const idx = index ?? derived;
  return (
    <div
      aria-hidden
      className={`${MONO} @container flex h-[26px] w-full items-stretch overflow-hidden rounded-md border border-line-strong bg-surface-1 text-[10px] leading-none ${className}`}
    >
      <span className="flex shrink-0 items-center gap-1 border-r border-line-strong bg-surface-2 px-1.5 text-fg">
        <PipeGlyph name="sheet" size={14} className="hidden @min-[330px]:block" />
        {rowId}
      </span>
      <div className="relative grid min-w-0 flex-1" style={{ gridTemplateColumns: `repeat(${CELLS}, minmax(0, 1fr))` }}>
        <Cursor idx={idx} />
        {STATUS.map((s, i) => (
          <Cell key={s} i={i} label={s} idx={idx} />
        ))}
      </div>
    </div>
  );
}
