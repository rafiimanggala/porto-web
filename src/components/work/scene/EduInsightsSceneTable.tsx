"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import {
  CLASSES,
  D_INDEX,
  T,
  TONE,
  avgAt,
  fillAt,
  readStart,
  reportingAt,
  rowStart,
  runningAvg,
  type ClassRow,
} from "./EduInsightsSceneData";
import { MonoLabel, Panel, pct } from "./EduInsightsSceneKit";

/* Class results table: six rows fill in behind a scan line, a footer averages
   the figures the rows show, and the empty class gets one wide "no data" cell. */

const COLS = "grid-cols-[1.7em_6.5em_minmax(0,1fr)_2.8em_1.9em]";
const DIM_OTHERS = 0.62;
const FLAG_BELOW = 70;
/* Before its results land a row already names its class, at this strength. */
const WAITING = 0.5;

function RowFrame({ t, read, fade, ring, children }: { t: MV; read: MV; fade?: MV; ring?: MV; children: ReactNode }) {
  const solid = useTransform(t, [0, 0.1], [0, 1], { clamp: true });
  const dashed = useTransform(solid, (v) => 1 - v);
  const hl = useTransform(read, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
  return (
    <motion.div style={fade ? { opacity: fade } : undefined} className="relative min-h-0 flex-1">
      <motion.i aria-hidden style={{ opacity: dashed }} className="absolute inset-x-0 inset-y-px rounded-md border border-dashed border-line-strong" />
      <motion.i aria-hidden style={{ opacity: solid }} className="absolute inset-x-0 inset-y-px rounded-md bg-surface-2" />
      <motion.i aria-hidden style={{ opacity: hl }} className="absolute inset-x-0 inset-y-px rounded-md bg-accent/25" />
      {ring ? (
        <motion.i aria-hidden style={{ opacity: ring }} className="absolute inset-x-0 inset-y-px rounded-md border-2 border-accent" />
      ) : null}
      <div className={`relative grid h-full items-center gap-x-1.5 px-1.5 ${COLS}`}>{children}</div>
    </motion.div>
  );
}

function IdChip({ cls, t }: { cls: ClassRow; t: MV }) {
  const opacity = useTransform(t, [0.05, 0.3], [WAITING, 1], { clamp: true });
  return (
    <motion.span
      style={{ opacity, background: `color-mix(in oklab, ${TONE[cls.tone]} 42%, transparent)` }}
      className={`grid h-[1.6em] w-[1.6em] place-items-center rounded-md ${MONO} text-fg`}
    >
      {cls.id}
    </motion.span>
  );
}

function Course({ text, t }: { text: string; t: MV }) {
  const opacity = useTransform(t, [0.08, 0.35], [WAITING, 1], { clamp: true });
  return (
    <motion.span style={{ opacity }} className="whitespace-nowrap text-dim">
      {text}
    </motion.span>
  );
}

function DataRow({ p, i, cls, dim }: { p: MV; i: number; cls: ClassRow; dim: MV }) {
  const complete = cls.complete ?? 0;
  const avg = cls.avg ?? 0;
  const t = useSeg(p, rowStart(i), rowStart(i) + T.rowDur);
  const read = useSeg(p, readStart(i), readStart(i) + T.readDur);
  const fade = useTransform(dim, (d) => 1 - DIM_OTHERS * d);
  const scale = useTransform(p, (v) => (fillAt(v, i) * complete) / 100);
  const pctText = useTransform(p, (v) => `${Math.round(fillAt(v, i) * complete)}%`);
  const avgText = useTransform(p, (v) => `${Math.round(avgAt(v, i) * avg)}`);
  const numOp = useTransform(t, [0.12, 0.3], [0, 1], { clamp: true });
  const trackOp = useTransform(t, [0.05, 0.25], [WAITING, 1], { clamp: true });
  const tone = complete < FLAG_BELOW ? "var(--color-sun)" : "var(--color-mint)";
  return (
    <RowFrame t={t} read={read} fade={fade}>
      <IdChip cls={cls} t={t} />
      <Course text={cls.course} t={t} />
      <motion.div style={{ opacity: trackOp }} className="relative h-[0.7em] overflow-hidden rounded-full bg-line-strong">
        <motion.i style={{ scaleX: scale, background: tone }} className="absolute inset-0 origin-left rounded-full" />
      </motion.div>
      <motion.span style={{ opacity: numOp }} className={`${MONO} text-right tabular-nums text-fg`}>
        {pctText}
      </motion.span>
      <motion.span style={{ opacity: numOp }} className={`${MONO} text-right tabular-nums text-dim`}>
        {avgText}
      </motion.span>
    </RowFrame>
  );
}

/* The empty class: a dashed track that says "0 submitted", rolled up into a
   chip that says "no data yet" on the same beat as the focus card. */
function EmptyTrack({ p, t }: { p: MV; t: MV }) {
  const roll = useSeg(p, T.swap[0], T.swap[1], easeInOutCubic);
  const y = useTransform(roll, (v) => pct(-v * 50));
  const label = useTransform(t, [0.3, 0.55], [0, 1], { clamp: true });
  const face = "grid h-[1.75em] place-items-center whitespace-nowrap";
  return (
    <motion.div style={{ opacity: label }} className="relative col-span-3 h-[1.75em] overflow-hidden rounded-md">
      <motion.div style={{ y }} className="flex flex-col">
        <span className={`${face} ${MONO} text-mute`}>0 submitted</span>
        <span className={`${face} text-fg`} style={{ background: "color-mix(in oklab, var(--color-sun) 30%, transparent)" }}>
          no data yet
        </span>
      </motion.div>
      <i aria-hidden className="pointer-events-none absolute inset-0 rounded-md border border-dashed border-line-strong" />
    </motion.div>
  );
}

function EmptyRow({ p, i, cls, ring }: { p: MV; i: number; cls: ClassRow; ring: MV }) {
  const t = useSeg(p, rowStart(i), rowStart(i) + T.rowDur);
  const read = useSeg(p, readStart(i), readStart(i) + T.readDur);
  return (
    <RowFrame t={t} read={read} ring={ring}>
      <IdChip cls={cls} t={t} />
      <Course text={cls.course} t={t} />
      <EmptyTrack p={p} t={t} />
    </RowFrame>
  );
}

function HeadRow() {
  return (
    <div className={`grid items-center gap-x-1.5 px-1.5 ${COLS}`}>
      <MonoLabel plain className="col-span-2">class</MonoLabel>
      <MonoLabel plain className="col-span-2">completion</MonoLabel>
      <MonoLabel plain className="text-right">avg</MonoLabel>
    </div>
  );
}

function FootRow({ p }: { p: MV }) {
  const label = useTransform(p, (v) => {
    const n = reportingAt(v);
    return n === 0 ? "waiting for results" : `avg of ${n} class${n === 1 ? "" : "es"} with data`;
  });
  const done = useTransform(p, (v) => {
    const a = runningAvg(v, "complete");
    return a === null ? "" : `${Math.round(a)}%`;
  });
  const avg = useTransform(p, (v) => {
    const a = runningAvg(v, "avg");
    return a === null ? "" : `${Math.round(a)}`;
  });
  return (
    <div className={`grid items-center gap-x-1.5 border-t border-line-strong px-1.5 pt-[clamp(3px,1cqw,7px)] ${COLS}`}>
      <motion.span className={`${MONO} col-span-3 whitespace-nowrap text-dim`}>{label}</motion.span>
      <motion.span className={`${MONO} text-right tabular-nums text-fg`}>{done}</motion.span>
      <motion.span className={`${MONO} text-right tabular-nums text-fg`}>{avg}</motion.span>
    </div>
  );
}

function ScanLine({ p }: { p: MV }) {
  const top = useSeg(p, T.scan[0], T.scan[1]);
  const topPct = useTransform(top, (v) => `${(v * 100).toFixed(3)}%`);
  const opacity = useTransform(top, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  return (
    <motion.div aria-hidden style={{ top: topPct, opacity }} className="pointer-events-none absolute inset-x-0 z-10">
      <div className="absolute inset-x-0 bottom-0 h-[clamp(14px,4cqw,26px)] bg-gradient-to-t from-accent/25 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-px bg-accent" />
    </motion.div>
  );
}

/* `dim` fades every class but the empty one; `ring` outlines the empty one, from the nudge line on. */
export function ClassTable({ p, dim, ring }: { p: MV; dim: MV; ring: MV }) {
  return (
    <Panel className="flex flex-col gap-[clamp(2px,0.8cqw,6px)] px-[clamp(6px,1.8cqw,12px)] py-[clamp(6px,1.6cqw,12px)] text-[12px]">
      <HeadRow />
      <div className="relative flex min-h-0 flex-1 flex-col">
        {CLASSES.map((c, i) =>
          i === D_INDEX ? (
            <EmptyRow key={c.id} p={p} i={i} cls={c} ring={ring} />
          ) : (
            <DataRow key={c.id} p={p} i={i} cls={c} dim={dim} />
          ),
        )}
        <ScanLine p={p} />
      </div>
      <FootRow p={p} />
    </Panel>
  );
}
