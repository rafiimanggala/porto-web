"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { SHORTS, STATUS } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { clamp01 } from "./PipeKitMath";
import { useStatusIndex } from "./PipeKitStatus";
import { STATUS_AT, STATUS_BLEND } from "./PipeShortsData";

/* The sheet row as one line of the sheet, like the shared status strip, but the current cell is lit by a crossfade inside
   its own cell: no outline ever slides across two cells and cuts through a word. A shorts run has no voice step, so the
   strip only lists the statuses this run really passes through. */

const SHOWN = STATUS.filter((s) => s !== "voiced");
const CELLS = SHOWN.length;

const mixed = (a: number, d: number) =>
  `color-mix(in oklab, var(--color-fg) ${(a * 100).toFixed(1)}%, color-mix(in oklab, var(--color-mint) ${(d * 100).toFixed(1)}%, var(--color-mute)))`;

function Cell({ i, label, idx }: { i: number; label: string; idx: MV }) {
  const color = useTransform(idx, (v) => mixed(clamp01(1 - Math.abs(v - i)), clamp01(v - i)));
  const lit = useTransform(idx, (v) => clamp01(1 - Math.abs(v - i)));
  return (
    <motion.span style={{ color }} className={`relative grid place-items-center ${i > 0 ? "border-l border-line" : ""}`}>
      <motion.i aria-hidden style={{ opacity: lit }} className="absolute inset-y-[3px] inset-x-[1px] rounded-[4px] border-[1.5px] border-accent bg-accent/15" />
      <span className="relative">{label}</span>
    </motion.span>
  );
}

export default function ShortsStatus({ p }: { p: MV }) {
  const idx = useStatusIndex(p, STATUS_AT, STATUS_BLEND);
  return (
    <div aria-hidden className={`${MONO} @container flex h-[26px] w-full items-stretch overflow-hidden rounded-md border border-line-strong bg-surface-1 text-[10px] leading-none`}>
      <span className="flex shrink-0 items-center gap-1 border-r border-line-strong bg-surface-2 px-1.5 text-fg">
        <PipeGlyph name="sheet" size={14} className="hidden @min-[330px]:block" />
        {SHORTS.rowId}
      </span>
      <div className="grid min-w-0 flex-1" style={{ gridTemplateColumns: `repeat(${CELLS}, minmax(0, 1fr))` }}>
        {SHOWN.map((s, i) => (
          <Cell key={s} i={i} label={s} idx={idx} />
        ))}
      </div>
    </div>
  );
}
