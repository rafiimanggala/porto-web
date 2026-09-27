"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, type MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { PipeNode } from "./PipeKitNode";
import { Pulse, Wire } from "./PipeKitWire";
import { lerp } from "./PipeKitMath";
import { B_GROUP, LANE_A, LANE_B, TITLE_A, TITLE_B } from "./PipeIsolationData";
import { FAILED_RUN, OK_RUN } from "./PipeKitData";
import { B_WIRE_DEFS, TILE_CSS, W, centre, rectStyle, type Box } from "./PipeIsolationLayout";
import { MONO_TXT, StateRoll, useLayout, useWin, type RollLine } from "./PipeIsolationKit";
import { B_DIM, B_FIRST, B_OK, FAIL, PILL_A_MARKS, PILL_B_MARKS, RETRY, SKIP, drawA, drawB, rideA, seg, stepIndex, tileA, tileB } from "./PipeIsolationTime";

/* The two workflow lanes: A (the scraper, upper) and B (the publisher, lower). Each is a card, a layer of wires and a
   row of node tiles. Nothing here connects A to B. */

const SKIPPED_DIM = 0.55;
const B_IDLE = 0.62;
const LAYER = "pointer-events-none absolute inset-0 h-full w-full overflow-visible";

const PILL_A: readonly RollLine[] = [
  { text: "idle", tone: "mute" },
  { text: "running", tone: "accent" },
  { text: "ok", tone: "mint" },
  { text: "running", tone: "accent" },
  { text: `${FAILED_RUN.label} failed`, tone: "rose" },
];
const PILL_B: readonly RollLine[] = [
  { text: "waiting", tone: "mute" },
  { text: "running", tone: "accent" },
  { text: `${OK_RUN.label} ${OK_RUN.status}`, tone: "mint" },
];

function Card({ box, tag, title, ring, ringClass, right }: { box: Box; tag: string; title: string; ring: MV; ringClass: string; right: ReactNode }) {
  const { stage } = useLayout();
  return (
    <div style={rectStyle(box, stage)} className="absolute rounded-xl border border-line bg-surface-1">
      <motion.i aria-hidden style={{ opacity: ring }} className={`pointer-events-none absolute -inset-px rounded-xl border-2 ${ringClass}`} />
      <div className={`${MONO_TXT} absolute inset-x-[2.8%] top-[0.6em] flex items-center justify-between`}>
        <span className="flex items-center gap-[0.7em]">
          <b className="grid h-[1.6em] w-[1.6em] place-items-center rounded-[4px] border border-line-strong font-normal text-fg">{tag}</b>
          <span className="whitespace-nowrap text-dim">{title}</span>
        </span>
        <span className="flex items-center gap-[0.8em]">{right}</span>
      </div>
    </div>
  );
}

function RetryChip({ p }: { p: MV }) {
  const pop = useWin(p, RETRY, easeOutBack);
  const opacity = useWin(p, [RETRY[0], RETRY[0] + 0.012]);
  const y = useTransform(pop, (v) => (1 - v) * -6);
  return (
    <motion.span
      style={{ opacity, y }}
      className={`${MONO} inline-flex items-center gap-[0.4em] rounded-[5px] border border-rose/60 bg-rose/15 px-[0.6em] text-fg`}
    >
      <span className="flex h-[1.6em] items-center gap-[0.4em]">
        <PipeGlyph name="loop" size="1.4em" />
        retry
      </span>
    </motion.span>
  );
}

/* Lane B carries the row it posts (OK_RUN.row, the row the strip below shows), popped in as the 06:00 run starts.
   Left out on a stage under 300 units wide, where it would not fit beside the title and the state. */
function RowChip({ p }: { p: MV }) {
  const pop = useWin(p, [B_DIM[0], B_FIRST], easeOutBack);
  const opacity = useWin(p, [B_DIM[0], B_DIM[0] + 0.012]);
  const y = useTransform(pop, (v) => (1 - v) * -6);
  return (
    <motion.span
      style={{ opacity, y }}
      className={`${MONO} hidden items-center gap-[0.4em] rounded-[5px] border border-mint/60 bg-mint/15 px-[0.6em] text-fg @min-[300px]:inline-flex`}
    >
      <span className="flex h-[1.6em] items-center gap-[0.4em]">
        <PipeGlyph name="sheet" size="1.4em" />
        {OK_RUN.row}
      </span>
    </motion.span>
  );
}

function PillA({ p }: { p: MV }) {
  const idx = useTransform(p, (v) => stepIndex(v, PILL_A_MARKS));
  return <StateRoll idx={idx} lines={PILL_A} className="w-[10em]" />;
}

function PillB({ p }: { p: MV }) {
  const idx = useTransform(p, (v) => stepIndex(v, PILL_B_MARKS));
  return <StateRoll idx={idx} lines={PILL_B} className="w-[10em]" />;
}

/* ---------- Lane A ---------- */

function AWire({ p, k }: { p: MV; k: number }) {
  const { aWires } = useLayout();
  const draw = useTransform(p, (v) => drawA(v, k));
  const ride = useTransform(p, (v) => rideA(v, k));
  const skipped = useWin(p, SKIP);
  const opacity = useTransform(skipped, (s) => (k >= 3 ? 1 - SKIPPED_DIM * s : 1));
  return (
    <motion.g style={{ opacity }}>
      <Wire path={aWires[k]} draw={draw} />
      <Pulse path={aWires[k]} progress={ride} trail={k === 2 || k === 3 ? 1 : 0} />
    </motion.g>
  );
}

function ATile({ p, i }: { p: MV; i: number }) {
  const { aPts, stage } = useLayout();
  const state = useTransform(p, (v) => tileA(v, i));
  const active = useTransform(state, (s) => s.active);
  const done = useTransform(state, (s) => s.done);
  const error = useTransform(state, (s) => s.error);
  const pulse = useTransform(state, (s) => s.pulse);
  const opacity = useTransform(state, (s) => 1 - SKIPPED_DIM * s.skip);
  return (
    <motion.div style={{ opacity }} className="pointer-events-none absolute inset-0">
      <PipeNode glyph={LANE_A[i].glyph} label={LANE_A[i].label} size={TILE_CSS} at={centre(aPts[i], stage)} active={active} done={done} error={error} pulse={pulse} />
    </motion.div>
  );
}

export function LaneA({ p }: { p: MV }) {
  const L = useLayout();
  const failed = useWin(p, FAIL);
  return (
    <>
      <Card
        box={L.aBox}
        tag="A"
        title={TITLE_A}
        ring={failed}
        ringClass="border-rose"
        right={
          <>
            <RetryChip p={p} />
            <PillA p={p} />
          </>
        }
      />
      <svg viewBox={`0 0 ${W} ${L.H}`} className={LAYER} aria-hidden>
        {L.aWires.map((_, k) => (
          <AWire key={k} p={p} k={k} />
        ))}
      </svg>
      {L.aPts.map((_, i) => (
        <ATile key={i} p={p} i={i} />
      ))}
    </>
  );
}

/* ---------- Lane B ---------- */

function BWire({ p, k }: { p: MV; k: number }) {
  const { bWires } = useLayout();
  const group = B_WIRE_DEFS[k].group;
  const draw = useTransform(p, (v) => drawB(v, group));
  return (
    <g>
      <Wire path={bWires[k]} draw={draw} tone="mint" />
      <Pulse path={bWires[k]} progress={draw} tone="mint" trail={1} />
    </g>
  );
}

function BTile({ p, i }: { p: MV; i: number }) {
  const { bPts, stage } = useLayout();
  const state = useTransform(p, (v) => tileB(v, B_GROUP[i]));
  const active = useTransform(state, (s) => s.active);
  const done = useTransform(state, (s) => s.done);
  const pulse = useTransform(state, (s) => s.pulse);
  return <PipeNode glyph={LANE_B[i].glyph} label={LANE_B[i].label} size={TILE_CSS} at={centre(bPts[i], stage)} active={active} done={done} pulse={pulse} />;
}

export function LaneB({ p }: { p: MV }) {
  const L = useLayout();
  const dim = useTransform(p, (v) => lerp(B_IDLE, 1, seg(v, B_DIM)));
  const ok = useWin(p, B_OK);
  return (
    <motion.div style={{ opacity: dim }} className="pointer-events-none absolute inset-0">
      <Card
        box={L.bBox}
        tag="B"
        title={TITLE_B}
        ring={ok}
        ringClass="border-mint"
        right={
          <>
            <RowChip p={p} />
            <PillB p={p} />
          </>
        }
      />
      <svg viewBox={`0 0 ${W} ${L.H}`} className={LAYER} aria-hidden>
        {L.bWires.map((_, k) => (
          <BWire key={k} p={p} k={k} />
        ))}
      </svg>
      {L.bPts.map((_, i) => (
        <BTile key={i} p={p} i={i} />
      ))}
    </motion.div>
  );
}
