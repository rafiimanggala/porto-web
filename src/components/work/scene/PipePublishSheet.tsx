"use client";

import { motion, useTransform } from "framer-motion";
import { useWindow, type MV } from "./HealthSceneParts";
import { NODE, SHEET_ROWS } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import ReadyRow from "./PipePublishCard";
import { FILTER_TEXT, READY_INDEX, ROWS, TL } from "./PipePublishData";
import { useGeo } from "./PipePublishGeo";
import { MONO_TXT, Pill } from "./PipePublishKit";
import { rowOpacity, rowOpen, sweepAt } from "./PipePublishMath";
import { Port } from "./PipePublishWrite";

/* The sheet: a header with the filter, six rows and an accent sweep that reads them one by one. Rows that are not ready
   dim, fade out, then collapse; the ready row stays and unfolds (PipePublishCard). At the end they open again. The write-back
   port hangs from the real bottom edge of the card, so it never sits on the last row. */

type Row = (typeof SHEET_ROWS)[number];

/* The separator line belongs to the row's inner box, not to the clipped outer one: a collapsed row is then really empty,
   and five closed rows do not leave five stray hairlines under the header. */
function RowLine({ row }: { row: Row }) {
  const { SIZE, GUTTER, cqh } = useGeo();
  return (
    <div className="flex items-center gap-2 border-t border-line" style={{ height: cqh(SIZE.row), paddingInline: GUTTER }}>
      <span className={`${MONO_TXT} w-[5em] shrink-0 text-mute`}>{row.id}</span>
      <span className="min-w-0 flex-1 truncate text-[clamp(11px,3.1cqw,15px)] text-fg">{row.topic}</span>
      <Pill status={row.status} />
    </div>
  );
}

function SheetRow({ row, i, p }: { row: Row; i: number; p: MV }) {
  const { SIZE, cqhN } = useGeo();
  const height = useTransform(p, (v) => `${(cqhN(SIZE.row) * rowOpen(v, i)).toFixed(3)}cqh`);
  const opacity = useTransform(p, (v) => rowOpacity(v, i));
  return (
    <motion.div style={{ height, opacity }} className="overflow-hidden">
      <RowLine row={row} />
    </motion.div>
  );
}

function FilterChip({ p }: { p: MV }) {
  const lit = useWindow(p, TL.sweep[0] - 0.02, TL.collapse.from + 0.03);
  return (
    <span className={`${MONO_TXT} relative flex items-center gap-1.5 rounded-[5px] border border-line-strong px-1.5 py-[3px] leading-none text-dim`}>
      <motion.i aria-hidden style={{ opacity: lit }} className="absolute inset-0 rounded-[5px] border border-accent bg-accent/15" />
      <PipeGlyph name={NODE.readyRows.glyph} size={13} className="relative" />
      <span className="relative text-fg">{FILTER_TEXT}</span>
    </span>
  );
}

function Head({ p }: { p: MV }) {
  const { SIZE, GUTTER, cqh } = useGeo();
  return (
    <div className="flex items-center justify-between gap-2" style={{ height: cqh(SIZE.head), paddingInline: GUTTER }}>
      <span className={`${MONO_TXT} flex items-center gap-1.5 leading-none text-fg`}>
        <PipeGlyph name={NODE.row.glyph} size={14} />
        {NODE.row.label}
      </span>
      <FilterChip p={p} />
    </div>
  );
}

function Sweep({ p }: { p: MV }) {
  const { SIZE, cqhN } = useGeo();
  const top = useTransform(p, (v) => `${(cqhN(SIZE.head) + sweepAt(v) * ROWS * cqhN(SIZE.row)).toFixed(3)}cqh`);
  const opacity = useTransform(p, [TL.sweep[0] - 0.004, TL.sweep[0] + 0.004, TL.sweep[1] - 0.004, TL.sweep[1] + 0.004], [0, 1, 1, 0]);
  return <motion.i aria-hidden style={{ top, opacity }} className="pointer-events-none absolute inset-x-0 z-20 h-0.5 -translate-y-1/2 bg-accent" />;
}

export default function Sheet({ p }: { p: MV }) {
  return (
    <div className="absolute inset-x-0 top-0 z-30">
      <div className="relative overflow-hidden rounded-xl border border-line-strong bg-surface-1 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]">
        <Head p={p} />
        {SHEET_ROWS.map((row, i) => (i === READY_INDEX ? <ReadyRow key={row.id} row={row} p={p} /> : <SheetRow key={row.id} row={row} i={i} p={p} />))}
        <Sweep p={p} />
      </div>
      <Port p={p} />
    </div>
  );
}
