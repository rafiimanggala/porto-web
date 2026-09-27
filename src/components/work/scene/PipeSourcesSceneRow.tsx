"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { lerp, segAt } from "./PipeKitMath";
import { FEED_COLOR, TL } from "./PipeSourcesSceneData";
import type { Layout } from "./PipeSourcesSceneLayout";
import { U, X, useLy } from "./PipeSourcesSceneKit";
import { CELL_LEFT, colsAt, rowPose, tableLeft, type Cell, type Cols, type Pose } from "./PipeSourcesSceneMath";
import { rowsFor, type RowSpec } from "./PipeSourcesSceneRows";

/* One headline of a feed, from the moment it prints to the moment it is packed. Every row carries its real headline.
   The layout math lives in PipeSourcesSceneMath; this file only turns a pose into styles. */

type ColsMV = MotionValue<Cols>;
type PoseMV = MotionValue<Pose>;

const RADIUS = 3;
const STRIPE_W = 3;
const TITLE_PAD = 11;
const LINK_TINT = "color-mix(in oklab, var(--color-sky) 70%, var(--color-fg))";

/** `strike` draws the rose line through a cell; `keep` is its opacity, 1 until the struck cells are faded out. */
type CellProps = { cols: ColsMV; strike: MV; keep: MV };

function Strike({ strike }: { strike: MV }) {
  return <motion.i aria-hidden style={{ scaleX: strike }} className="absolute left-0 top-1/2 h-[1.5px] w-full origin-left bg-rose" />;
}

/* Left, width and vertical centre of a cell, from the current columns. */
function useCell(cols: ColsMV, pick: (c: Cols) => Cell) {
  const left = useTransform(cols, (c) => U(pick(c).left));
  const width = useTransform(cols, (c) => U(pick(c).w));
  const top = useTransform(cols, (c) => U(pick(c).cy));
  return { left, width, top };
}

function LinkCell({ cols, strike, keep, slug, fs }: CellProps & { slug: string; fs: string }) {
  const cell = useCell(cols, (c) => c.link);
  return (
    <motion.span aria-hidden style={{ ...cell, opacity: keep, fontSize: fs, color: LINK_TINT }} className={`${MONO} absolute -translate-y-1/2 leading-none`}>
      <span className="block truncate">{slug}</span>
      <Strike strike={strike} />
    </motion.span>
  );
}

function DateCell({ cols, strike, keep, age, fs }: CellProps & { age: string; fs: string }) {
  const cell = useCell(cols, (c) => c.date);
  return (
    <motion.span aria-hidden style={{ ...cell, opacity: keep, fontSize: fs }} className={`${MONO} absolute -translate-y-1/2 whitespace-nowrap leading-none text-dim`}>
      {age}
      <Strike strike={strike} />
    </motion.span>
  );
}

function SummaryCell({ cols, lead, fs, tall }: { cols: ColsMV; lead: string; fs: string; tall: boolean }) {
  const cell = useCell(cols, (c) => c.sum);
  return (
    <motion.span aria-hidden style={{ ...cell, fontSize: fs }} className={`absolute -translate-y-1/2 leading-[1.08] text-dim ${tall ? "truncate" : "line-clamp-2"}`}>
      {lead}
    </motion.span>
  );
}

function Cells({ row, pose, cols, strike, keep }: { row: RowSpec; pose: PoseMV; cols: ColsMV; strike: MV; keep: MV }) {
  const ly = useLy();
  const opacity = useTransform(pose, (q) => q.cells);
  return (
    <motion.span aria-hidden style={{ opacity }} className="absolute inset-0">
      <LinkCell cols={cols} strike={strike} keep={keep} slug={row.slug ?? ""} fs={ly.rowFs} />
      <DateCell cols={cols} strike={strike} keep={keep} age={row.age ?? ""} fs={ly.rowFs} />
      <SummaryCell cols={cols} lead={row.lead ?? ""} fs={ly.rowFs} tall={ly.tall} />
    </motion.span>
  );
}

/* The headline. Old rows show one line; a new row shows two in a wide column and in the wide table, where it fills the
   row. In the tall table it sits on its own top line and follows the row only when the row shrinks under it. */
function Title({ text, pose, cols, fs }: { text: string; pose: PoseMV; cols: ColsMV; fs: string }) {
  const { tall } = useLy();
  const opacity = useTransform(pose, (q) => q.text);
  const width = useTransform(() => {
    const q = pose.get();
    return U(lerp(lerp(q.w - TITLE_PAD, cols.get().title.w, q.spread), q.w - TITLE_PAD, q.pack));
  });
  const top = useTransform(() => {
    const q = pose.get();
    const c = cols.get().title;
    return U(tall ? lerp(lerp(0, c.cy - c.h / 2, q.spread), 0, q.pack) : 0);
  });
  const height = useTransform(() => {
    const q = pose.get();
    return U(tall ? lerp(lerp(q.h, cols.get().title.h, q.spread), q.h, q.pack) : q.h);
  });
  const lines = useTransform(pose, (q) => q.lines);
  return (
    <motion.span style={{ opacity, width, top, height, left: U(CELL_LEFT), fontSize: fs }} className={`${MONO} absolute flex items-center leading-[1.05] text-fg`}>
      <motion.span
        style={{ ["--lines" as string]: lines }}
        className="overflow-hidden break-words [-webkit-box-orient:vertical] [-webkit-line-clamp:var(--lines)] [display:-webkit-box]"
      >
        {text}
      </motion.span>
    </motion.span>
  );
}

/* A rose line that strikes an old row through once the scan has passed it. */
function SeenStrike({ pose }: { pose: PoseMV }) {
  const scaleX = useTransform(pose, (q) => q.seen);
  const opacity = useTransform(pose, (q) => q.text);
  return <motion.i aria-hidden style={{ scaleX, opacity, left: U(CELL_LEFT), right: U(CELL_LEFT) }} className="absolute top-1/2 h-[1.5px] origin-left bg-rose" />;
}

const clipOf = (q: Pose) => (q.clipL <= 0 && q.clipR >= 1 ? "none" : `inset(0 ${((1 - q.clipR) * 100).toFixed(2)}% 0 ${(q.clipL * 100).toFixed(2)}%)`);

type RowProps = { p: MV; row: RowSpec; ly: Layout; cols: ColsMV; strike: MV; keep: MV };

export function Row({ p, row, ly, cols, strike, keep }: RowProps) {
  const pose = useTransform(p, (v) => rowPose(ly, row, v));
  const left = useTransform(pose, (q) => X(q.x - q.w / 2));
  const top = useTransform(pose, (q) => U(q.y));
  const width = useTransform(pose, (q) => X(q.w));
  const height = useTransform(pose, (q) => U(q.h));
  const opacity = useTransform(pose, (q) => q.opacity);
  const clip = useTransform(pose, clipOf);
  const edge = useTransform(pose, (q) => `calc(${(q.edge * 100).toFixed(2)}% - ${U(2)})`);
  const edgeOn = useTransform(pose, (q) => (q.edge > 0.02 && q.edge < 0.98 ? 1 : 0));
  const tint = useTransform(pose, (q) => q.seen * (row.fresh ? 0.3 : 0.32));
  return (
    <motion.div
      aria-hidden
      style={{ left, top, width, height, opacity, clipPath: clip, borderRadius: U(RADIUS), zIndex: 10 + (row.rank >= 0 ? 10 - row.rank : 0) }}
      className="absolute overflow-hidden border border-line bg-surface-2"
    >
      <i className="absolute inset-y-0 left-0" style={{ width: U(STRIPE_W), background: FEED_COLOR[row.feed] }} />
      <motion.i style={{ opacity: tint }} className={`absolute inset-0 ${row.fresh ? "bg-mint" : "bg-rose"}`} />
      <Title text={row.title} pose={pose} cols={cols} fs={ly.rowFs} />
      {row.fresh ? <Cells row={row} pose={pose} cols={cols} strike={strike} keep={keep} /> : <SeenStrike pose={pose} />}
      <motion.i style={{ left: edge, opacity: edgeOn, width: U(2) }} className="absolute inset-y-0 bg-accent" />
    </motion.div>
  );
}

/* The table's moving parts: the columns (which reflow while the struck cells are gone), the strike that crosses out the
   link and date, and their opacity, which falls to zero before the columns move. */
function useTable(p: MV, ly: Layout) {
  const cols = useTransform(p, (v) => colsAt(ly, segAt(v, TL.trim[0], TL.trim[1], easeInOutCubic)));
  const strike = useSeg(p, TL.strike[0], TL.strike[1], easeInOutCubic);
  const keep = useTransform(p, (v) => 1 - segAt(v, TL.fade[0], TL.fade[1]));
  return { cols, strike, keep };
}

export function Rows({ p }: { p: MV }) {
  const ly = useLy();
  const { cols, strike, keep } = useTable(p, ly);
  return (
    <>
      {rowsFor(ly).map((row) => (
        <Row key={row.order} p={p} row={row} ly={ly} cols={cols} strike={strike} keep={keep} />
      ))}
    </>
  );
}

const HEADERS = ["title", "link", "date", "summary"] as const;
type Header = (typeof HEADERS)[number];

const cellOf = (c: Cols, name: Header) => ({ title: c.title, link: c.link, date: c.date, summary: c.sum })[name];

function HeadCell({ name, ly, cols, strike, keep }: { name: Header; ly: Layout; cols: ColsMV; strike: MV; keep: MV }) {
  const left = useTransform(cols, (c) => X(tableLeft(ly) + cellOf(c, name).left));
  const dropped = name === "link" || name === "date";
  const opacity = useTransform(keep, (k) => (dropped ? k : 1));
  return (
    <motion.span style={{ left, opacity, top: U(ly.table.top - 16), fontSize: ly.rowFs }} className={`${MONO} absolute whitespace-nowrap leading-none text-mute`}>
      {name}
      {dropped ? <Strike strike={strike} /> : null}
    </motion.span>
  );
}

/* The header of the wide table. The tall table has no columns to name, so it draws none. */
export function TableHeader({ p }: { p: MV }) {
  const ly = useLy();
  const { cols, strike, keep } = useTable(p, ly);
  const opacity = useTransform(p, [TL.header[0], TL.header[1], TL.headerOut[0], TL.headerOut[1]], [0, 1, 1, 0]);
  return (
    <motion.div aria-hidden style={{ opacity }} className="absolute inset-0 z-[9]">
      {HEADERS.map((h) => (
        <HeadCell key={h} name={h} ly={ly} cols={cols} strike={strike} keep={keep} />
      ))}
    </motion.div>
  );
}
