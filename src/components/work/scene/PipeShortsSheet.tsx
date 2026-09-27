"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { SHEET, SHEET_TEXT, SHEET_VIEW, TL, memoryRowAt } from "./PipeShortsData";
import { SMALL_SANS, boxStyle, unit } from "./PipeShortsKit";
import { seg, trap } from "./PipeShortsMath";

/* The Shorts sheet, peeking under the docked lanes while the agent works: three posted rows the memory check reads, and the
   new row (SHORTS.rowId) the run adds. The card row takes its place once the slides are written. */

const LAST = SHEET_VIEW.length - 1;
const HEIGHT = SHEET.head + SHEET.row * SHEET_VIEW.length;

function SheetRow({ p, k }: { p: MV; k: number }) {
  const row = SHEET_VIEW[k];
  const isNew = k === LAST;
  const glow = useTransform(p, (v) => (isNew ? seg(v, TL.sheetRow[0], TL.sheetRow[1]) : trap(v, memoryRowAt(k) - 0.002, memoryRowAt(k) + 0.014, 0.004)));
  const tone = isNew ? "border-accent bg-accent/20" : "border-transparent bg-accent/30";
  return (
    <div style={{ height: unit(SHEET.row) }} className="relative flex items-center gap-[6px] px-[6px]">
      <motion.i aria-hidden style={{ opacity: glow }} className={`absolute inset-x-[1px] inset-y-[1px] rounded border ${tone}`} />
      <span className="relative w-[3.6em] shrink-0 text-mute">{row.id}</span>
      <span className={`relative min-w-0 flex-1 truncate text-fg ${SMALL_SANS}`}>{row.topic}</span>
      <span className={`relative shrink-0 ${isNew ? "text-fg" : "text-mute"}`}>{row.status}</span>
    </div>
  );
}

export default function SheetPeek({ p }: { p: MV }) {
  const inn = useSeg(p, TL.sheet[0], TL.sheet[1], easeOutCubic);
  const out = useSeg(p, TL.sheetOut[0], TL.sheetOut[1]);
  const opacity = useTransform([inn, out], ([a, b]: number[]) => a * (1 - b));
  const y = useTransform(inn, (v) => `${((1 - v) * 6).toFixed(2)}%`);
  return (
    <motion.div
      style={{ ...boxStyle(SHEET.x, SHEET.y, SHEET.w, HEIGHT), opacity, y }}
      className="absolute overflow-hidden rounded-md border border-line-strong bg-surface-2"
    >
      <div style={{ height: unit(SHEET.head) }} className="flex items-center justify-between gap-[6px] border-b border-line px-[6px] text-mute">
        <span className="flex items-center gap-[4px]">
          <PipeGlyph name="sheet" size={unit(12)} />
          Sheet
        </span>
        <span>{SHEET_TEXT}</span>
      </div>
      {SHEET_VIEW.map((row, k) => (
        <SheetRow key={row.id} p={p} k={k} />
      ))}
    </motion.div>
  );
}
