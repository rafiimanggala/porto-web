"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { EXEC_LOG, FAILED_RUN } from "./PipeKitData";
import { rectStyle, unit, type Box } from "./PipeIsolationLayout";
import { useLayout, useWin } from "./PipeIsolationKit";
import { LOG_T, rowAt } from "./PipeIsolationTime";

/* Page four of the middle band: the execution log of the failed run. The trace walks down the node list, turns the
   failed row rose, and the detail panel reveals that node's input payload and error. Coordinates are band units.
   Wide: the list and the detail sit side by side. Tall (phone): they stack at full width, with bigger text. */

type Spec = { readonly head: Box; readonly list: Box; readonly detail: Box; readonly row: string };
const WIDE: Spec = {
  head: { x: 8, y: 0, w: 342, h: 16 },
  list: { x: 8, y: 22, w: 172, h: 128 },
  detail: { x: 184, y: 22, w: 166, h: 128 },
  row: "1.6em",
};
const TALL: Spec = {
  head: { x: 8, y: 0, w: 342, h: 18 },
  list: { x: 8, y: 24, w: 342, h: 127 },
  detail: { x: 8, y: 157, w: 342, h: 128 },
  row: unit(17),
};
const CLOCK_ROOM = 66;

function useSpec(): Spec {
  return useLayout().compact ? TALL : WIDE;
}
const ROW_REVEAL = 0.006;
const FAILED_AT = EXEC_LOG.findIndex((row) => row.state === "error");

const isNumber = (v: string) => /^\d+$/.test(v);

function StateMark({ state, t }: { state: (typeof EXEC_LOG)[number]["state"]; t: MV }) {
  const glyph = state === "ok" ? "check" : state === "error" ? "cross" : null;
  return (
    <span className="relative grid shrink-0 place-items-center" style={{ height: "1.2em", width: "1.2em" }}>
      <i className={`h-[0.5em] w-[0.5em] rounded-full ${glyph ? "bg-mute" : "border border-mute"}`} />
      {glyph ? (
        <motion.span style={{ opacity: t }} className="absolute inset-0">
          <PipeGlyph name={glyph} size="1.2em" />
        </motion.span>
      ) : null}
    </span>
  );
}

function LogRow({ p, k }: { p: MV; k: number }) {
  const { row: height } = useSpec();
  const row = EXEC_LOG[k];
  const at = rowAt(k);
  const t = useWin(p, [at, at + ROW_REVEAL]);
  const color = useTransform(t, (v) => `color-mix(in oklab, var(--color-fg) ${(v * 100).toFixed(1)}%, var(--color-mute))`);
  const failed = row.state === "error";
  const skipped = row.state === "skipped";
  return (
    <div className="relative" style={{ height }}>
      {failed ? <motion.i aria-hidden style={{ opacity: t }} className="absolute inset-0 rounded-[4px] border border-rose/60 bg-rose/20" /> : null}
      <span className="relative flex h-full items-center gap-[0.3em] px-[0.3em] leading-none">
        <StateMark state={row.state} t={t} />
        <motion.span style={{ color: skipped ? "var(--color-mute)" : color }} className="min-w-0 truncate">
          {row.node}
        </motion.span>
        <span className="ml-auto shrink-0 pl-[0.3em] text-mute">{row.note}</span>
      </span>
    </div>
  );
}

/* Two layers over one spot: `before` is wiped away from the left as `after` is wiped in, an accent edge between. */
function Swap({ p, win, before, after }: { p: MV; win: readonly [number, number]; before: ReactNode; after: ReactNode }) {
  const t = useWin(p, win);
  const front = useTransform(t, (v) => v * 100);
  const fresh = useTransform(front, (f) => `inset(0 ${(100 - f).toFixed(2)}% 0 0)`);
  const stale = useTransform(front, (f) => `inset(0 0 0 ${f.toFixed(2)}%)`);
  const left = useTransform(front, (f) => `${f.toFixed(2)}%`);
  const edge = useTransform(t, [0.02, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return (
    <div className="relative h-full">
      <motion.div style={{ clipPath: stale }} className="absolute inset-0">
        {before}
      </motion.div>
      <motion.div style={{ clipPath: fresh }} className="absolute inset-0">
        {after}
      </motion.div>
      <motion.i aria-hidden style={{ left, opacity: edge }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
    </div>
  );
}

function JsonLine({ k, v, last }: { k: string; v: string; last: boolean }) {
  return (
    <p className="leading-[1.3]" style={{ paddingLeft: "0.4em" }}>
      <span className="text-sky">&quot;{k}&quot;</span>
      <span className="text-mute">: </span>
      {isNumber(v) ? <span className="text-sun">{v}</span> : <span className="text-mint">&quot;{v}&quot;</span>}
      <span className="text-mute">{last ? "" : ","}</span>
    </p>
  );
}

function Detail({ p }: { p: MV }) {
  const { bandFrame, monoTxt } = useLayout();
  const { detail, row } = useSpec();
  const nodeWin = [rowAt(FAILED_AT), rowAt(FAILED_AT) + ROW_REVEAL * 2] as const;
  const input = useWin(p, LOG_T.input);
  const inputClip = useTransform(input, (v) => `inset(0 ${(100 - v * 100).toFixed(2)}% 0 0)`);
  const error = useWin(p, LOG_T.error);
  const errorClip = useTransform(error, (v) => `inset(0 ${(100 - v * 100).toFixed(2)}% 0 0)`);
  return (
    <div style={rectStyle(detail, bandFrame)} className={`${monoTxt} absolute overflow-hidden rounded-lg border border-line-strong bg-surface-2 p-[0.4em]`}>
      <div style={{ height: row }}>
        <Swap
          p={p}
          win={nodeWin}
          before={<p className="flex h-full items-center px-[0.2em] text-mute">node detail</p>}
          after={
            <p className="flex h-full items-center gap-[0.5em] px-[0.2em] text-fg">
              <PipeGlyph name="scraper" size="1.5em" />
              <span className="truncate">{FAILED_RUN.node}</span>
              <span className="ml-auto text-rose">error</span>
            </p>
          }
        />
      </div>
      <motion.div style={{ clipPath: inputClip }}>
        <p className="px-[0.2em] leading-[1.2] text-mute">input</p>
        {FAILED_RUN.input.map((line, i) => (
          <JsonLine key={line.k} k={line.k} v={line.v} last={i === FAILED_RUN.input.length - 1} />
        ))}
      </motion.div>
      <motion.div style={{ clipPath: errorClip }}>
        <p className="px-[0.2em] pt-[0.3em] leading-[1.2] text-mute">error</p>
        <p className="leading-[1.3] text-rose [text-wrap:balance]" style={{ paddingLeft: "0.4em" }}>
          {FAILED_RUN.error}
        </p>
      </motion.div>
    </div>
  );
}

export default function LogPage({ p }: { p: MV }) {
  const { bandFrame, monoTxt } = useLayout();
  const { head, list } = useSpec();
  return (
    <>
      <div style={rectStyle(head, bandFrame)} className={`${monoTxt} absolute flex items-center justify-between leading-none`}>
        <span className="text-dim" style={{ marginLeft: `${(CLOCK_ROOM / head.w) * 100}%` }}>
          run {FAILED_RUN.label}
        </span>
        <span className="text-mute">execution log</span>
      </div>
      <div style={rectStyle(list, bandFrame)} className={`${monoTxt} absolute overflow-hidden rounded-lg border border-line-strong bg-surface-2 p-[0.3em]`}>
        {EXEC_LOG.map((row, k) => (
          <LogRow key={row.node} p={p} k={k} />
        ))}
      </div>
      <Detail p={p} />
    </>
  );
}
