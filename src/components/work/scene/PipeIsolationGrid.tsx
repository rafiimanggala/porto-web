"use client";

import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { ACCOUNTS, EXEC_LOG, FAILED_RUN } from "./PipeKitData";
import { pad2 } from "./PipeIsolationData";
import { rectStyle, type Box } from "./PipeIsolationLayout";
import { Counter, RollText, useLayout, useWin } from "./PipeIsolationKit";
import { ACCOUNT_COUNT, LEAD_AT, RUN, STALL, TIMEOUT, FAIL, chipState, doneRun1, doneRun2, seg, stepIndex, stepMarks, startedRun1, startedRun2, timeoutSeconds, type Run } from "./PipeIsolationTime";

/* The account list as 18 chips, one page of the middle band. The pointer steps through them one at a time. In run 2
   the pointer reaches item 7 and stays there while a timeout counter runs. Coordinates are band units. Wide: 3
   columns of 6 rows. Tall (phone): 2 columns of 9 rows, so every chip is roomier and its label bigger. */

type Spec = { readonly head: Box; readonly grid: Box; readonly foot: Box; readonly bar: Box; readonly cols: number };
const WIDE_SPEC: Spec = {
  head: { x: 8, y: 0, w: 342, h: 16 },
  grid: { x: 8, y: 22, w: 342, h: 100 },
  foot: { x: 8, y: 128, w: 342, h: 16 },
  bar: { x: 8, y: 148, w: 342, h: 3 },
  cols: 3,
};
const TALL_SPEC: Spec = {
  head: { x: 8, y: 0, w: 342, h: 18 },
  grid: { x: 8, y: 24, w: 342, h: 232 },
  foot: { x: 8, y: 264, w: 342, h: 18 },
  bar: { x: 8, y: 288, w: 342, h: 3 },
  cols: 2,
};
const CHIP_GAP_X = 4;
const CHIP_GAP_Y = 3;
const CLOCK_ROOM = 66;
const GHOST = 0.38;
/** The ghost label is gone by this share of the pop, and the live chip only starts to show after it, so the two never overlap. */
const HANDOFF = 0.22;
const READ_ACCOUNTS = `${EXEC_LOG[1].node}: ${EXEC_LOG[1].note}`;
/** What the footer says before the first account of each run starts. Run 1 waits for the schedule first. */
const LEAD: Record<Run, readonly string[]> = { 1: ["waiting for schedule", READ_ACCOUNTS], 2: [READ_ACCOUNTS] };

function useSpec(): Spec {
  return useLayout().compact ? TALL_SPEC : WIDE_SPEC;
}

function StateDot({ cursor, done, fail }: { cursor: MV; done: MV; fail: MV }) {
  return (
    <span className="relative h-[0.6em] w-[0.6em] shrink-0">
      <i className="absolute inset-0 rounded-full bg-mute" />
      <motion.i style={{ opacity: done }} className="absolute inset-0 rounded-full bg-mint" />
      <motion.i style={{ opacity: cursor }} className="absolute inset-0 rounded-full bg-accent" />
      <motion.i style={{ opacity: fail }} className="absolute inset-0 rounded-full bg-rose" />
    </span>
  );
}

function Chip({ p, i, run }: { p: MV; i: number; run: Run }) {
  const { monoTxt } = useLayout();
  const state = useTransform(p, (v) => chipState(v, i, run));
  const show = useTransform(state, (s) => s.show);
  const cursor = useTransform(state, (s) => s.cursor);
  const done = useTransform(state, (s) => s.done);
  const fail = useTransform(state, (s) => s.fail);
  const live = useTransform(show, (v) => seg(v, [HANDOFF, 1]));
  const y = useTransform(live, (v) => (1 - v) * 5);
  const ghost = useTransform(show, (v) => GHOST * (1 - seg(v, [0, HANDOFF])));
  return (
    <div className="relative">
      <i aria-hidden className="absolute inset-0 rounded-[5px] border border-dashed border-line-strong" />
      <motion.span aria-hidden style={{ opacity: ghost }} className={`${monoTxt} absolute inset-0 flex items-center gap-[0.6em] px-[0.7em] leading-none text-fg`}>
        <i className="h-[0.6em] w-[0.6em] shrink-0 rounded-full bg-mute" />
        {ACCOUNTS[i]}
      </motion.span>
      <motion.div style={{ opacity: live, y }} className="absolute inset-0 rounded-[5px] border border-line-strong bg-surface-2">
        <motion.i aria-hidden style={{ opacity: done }} className="absolute inset-0 rounded-[5px] bg-mint/15" />
        <motion.i aria-hidden style={{ opacity: cursor }} className="absolute -inset-px rounded-[6px] border-[1.5px] border-accent bg-accent/20" />
        <motion.i aria-hidden style={{ opacity: fail }} className="absolute -inset-px rounded-[6px] border-[1.5px] border-rose bg-rose/25" />
        <span className={`${monoTxt} relative flex h-full items-center gap-[0.6em] px-[0.7em] leading-none text-fg`}>
          <StateDot cursor={cursor} done={done} fail={fail} />
          {ACCOUNTS[i]}
          <motion.span style={{ opacity: done }} className="ml-auto">
            <PipeGlyph name="check" size="1.3em" />
          </motion.span>
          <motion.span style={{ opacity: fail }} className="absolute right-[0.7em]">
            <PipeGlyph name="cross" size="1.3em" />
          </motion.span>
        </span>
      </motion.div>
    </div>
  );
}

function Head({ p, run }: { p: MV; run: Run }) {
  const { bandFrame, monoTxt } = useLayout();
  const { head } = useSpec();
  const count = run === 1 ? startedRun1 : (v: number) => Math.max(1, startedRun2(v));
  return (
    <div style={rectStyle(head, bandFrame)} className={`${monoTxt} absolute flex items-center justify-between leading-none`}>
      {run === 1 ? (
        <span className="flex items-center gap-[0.6em] text-dim">
          <PipeGlyph name="sheet" size="1.5em" />
          Accounts
          <span className="text-mute">{ACCOUNT_COUNT} rows</span>
        </span>
      ) : (
        <span className="text-dim" style={{ marginLeft: `${(CLOCK_ROOM / head.w) * 100}%` }}>
          run {FAILED_RUN.label}
        </span>
      )}
      <Counter p={p} of={(v) => `${pad2(count(v))} / ${ACCOUNT_COUNT}`} className="text-fg" />
    </div>
  );
}

function Foot({ p, run }: { p: MV; run: Run }) {
  const { bandFrame, monoTxt } = useLayout();
  const { foot } = useSpec();
  const count = run === 1 ? ACCOUNT_COUNT : STALL + 1;
  const lines = [...LEAD[run], ...ACCOUNTS.slice(0, count).map((a) => `${FAILED_RUN.node}: ${a}`)];
  const marks = run === 1 ? [LEAD_AT, ...stepMarks(run, count)] : stepMarks(run, count);
  const idx = useTransform(p, (v) => stepIndex(v, marks, 0.004));
  const right = run === 1 ? (v: number) => (v < RUN[1].first ? "" : `${doneRun1(v)} rows`) : timerText;
  return (
    <div style={rectStyle(foot, bandFrame)} className={`${monoTxt} absolute flex items-center justify-between text-fg`}>
      <RollText idx={idx} lines={lines} />
      <Counter p={p} of={right} className="text-dim" />
    </div>
  );
}

function timerText(v: number) {
  return v < TIMEOUT[0] ? `${doneRun2(v)} rows` : `${timeoutSeconds(v)} s / ${FAILED_RUN.timeoutSeconds} s`;
}

function TimeoutBar({ p }: { p: MV }) {
  const { bandFrame } = useLayout();
  const { bar } = useSpec();
  const fill = useWin(p, TIMEOUT);
  const fail = useWin(p, FAIL);
  return (
    <div style={rectStyle(bar, bandFrame)} className="absolute overflow-hidden rounded-full bg-line-strong">
      <motion.i aria-hidden style={{ scaleX: fill }} className="absolute inset-0 origin-left bg-accent" />
      <motion.i aria-hidden style={{ opacity: fail }} className="absolute inset-0 bg-rose" />
    </div>
  );
}

export default function GridPage({ p, run }: { p: MV; run: Run }) {
  const { bandFrame } = useLayout();
  const { grid, cols } = useSpec();
  const rows = ACCOUNT_COUNT / cols;
  return (
    <>
      <Head p={p} run={run} />
      <div
        style={{
          ...rectStyle(grid, bandFrame),
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`,
          columnGap: `${(CHIP_GAP_X / grid.w) * 100}%`,
          rowGap: `${(CHIP_GAP_Y / grid.h) * 100}%`,
        }}
        className="absolute grid"
      >
        {ACCOUNTS.map((a, i) => (
          <Chip key={a} p={p} i={i} run={run} />
        ))}
      </div>
      <Foot p={p} run={run} />
      {run === 2 ? <TimeoutBar p={p} /> : null}
    </>
  );
}
