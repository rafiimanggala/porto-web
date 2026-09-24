"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import PlanSceneShell from "./PlanSceneShell";
import { easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CAPTIONS, CHAPTERS, GOALS, JUMPS, LIFT_TOTAL, MEALS, TL, WEEK_TOTAL, WIPES } from "./PlanSceneData";
import { GoalBar, GoalPage, TabBar } from "./PlanSceneGoal";
import MealsPage, { scoredCount } from "./PlanSceneMeals";
import TrainPage, { builtCount } from "./PlanSceneTrain";
import SuppPage, { verdict } from "./PlanSceneSupp";
import { clamp01, keyframes, pct, segAt, useKeys } from "./PlanSceneKit";

/* Plan generator scene: one goal picked, three plans generated from the same
   data. The three plan pages take over the stage with a complementary clip
   and a scan edge, the same transition the parsing scene uses per row. */

const PAGE_KEYS = WIPES.flatMap(([a, b]) => [a, b]);
const PAGE_VALS = [0, 1, 1, 2, 2, 3];
const PARALLAX = 4;
const DIM = 0.5;

function Page({ pagePos, k, children }: { pagePos: MV; k: number; children: ReactNode }) {
  const shown = useTransform(pagePos, (v) => clamp01(v - (k - 1)));
  const cover = useTransform(pagePos, (v) => clamp01(v - k));
  const clip = useTransform([shown, cover], ([s, c]: number[]) => `inset(0 ${pct(100 - s * 100)} 0 ${pct(c * 100)})`);
  const x = useTransform(shown, (s) => pct(-(1 - s) * PARALLAX));
  const opacity = useTransform(cover, (c) => 1 - DIM * c);
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0">
      <motion.div style={{ x, opacity }} className="h-full">
        {children}
      </motion.div>
    </motion.div>
  );
}

function ScanEdge({ pagePos, k }: { pagePos: MV; k: number }) {
  const front = useTransform(pagePos, (v) => clamp01(v - (k - 1)));
  const left = useTransform(front, (f) => pct(f * 100));
  const opacity = useTransform(front, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left, opacity }}
      className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent"
    />
  );
}

function Stage({ p }: { p: MV }) {
  const pagePos = useKeys(p, PAGE_KEYS, PAGE_VALS);
  const pick = useKeys(p, TL.pickKeys, TL.pickVals);
  const fan = useSeg(p, TL.fan[0], TL.fan[1], easeOutCubic);
  const tabPos = useTransform(pagePos, (v) => v - 1);
  return (
    <div className="flex h-full flex-col gap-[clamp(6px,2cqw,12px)] p-[clamp(10px,3cqw,22px)]">
      <GoalBar p={p} pick={pick} />
      <TabBar p={p} fan={fan} tabPos={tabPos} />
      <div className="relative min-h-0 flex-1">
        <Page pagePos={pagePos} k={0}>
          <GoalPage p={p} />
        </Page>
        <Page pagePos={pagePos} k={1}>
          <MealsPage p={p} />
        </Page>
        <Page pagePos={pagePos} k={2}>
          <TrainPage p={p} />
        </Page>
        <Page pagePos={pagePos} k={3}>
          <SuppPage p={p} />
        </Page>
        {WIPES.map((_, i) => (
          <ScanEdge key={i} pagePos={pagePos} k={i + 1} />
        ))}
      </div>
    </div>
  );
}

function Visual({ p }: { p: MV }) {
  return (
    <div className="@container absolute inset-0">
      <Stage p={p} />
    </div>
  );
}

function trainReadout(v: number) {
  const built = builtCount(v);
  if (built < LIFT_TOTAL) return `building week ${built}/${LIFT_TOTAL}`;
  return `week ${segAt(v, TL.train.bar[0], TL.train.bar[1]) > 0.5 ? "rebalanced" : "planned"}, ${WEEK_TOTAL} sets`;
}

/* The header readout switches at the middle of each wipe, with the page. */
const SWITCH = WIPES.map(([a, b]) => (a + b) / 2);

function readoutText(v: number) {
  if (v < SWITCH[0]) {
    const pick = Math.round(keyframes(v, TL.pickKeys, TL.pickVals));
    return `goal: ${GOALS[pick].toLowerCase()}`;
  }
  if (v < SWITCH[1]) return `meals scored ${scoredCount(v)}/${MEALS.length}`;
  if (v < SWITCH[2]) return trainReadout(v);
  return verdict(v);
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutText);
  return <motion.span>{text}</motion.span>;
}

export default function PlanScene() {
  return (
    <PlanSceneShell
      captions={CAPTIONS}
      chapters={CHAPTERS}
      jumps={JUMPS}
      render={(p) => <Visual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[440svh] sm:h-[520svh]"
    />
  );
}
