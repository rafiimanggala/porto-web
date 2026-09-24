"use client";

import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import BytesPage from "./EduDebugSceneBytes";
import { Console, StatusBar } from "./EduDebugSceneConsole";
import { BYTE_ROWS, CAPTIONS, CHAPTERS, LIMIT_PER_HOUR, ROWS, WIPES, fmtTidy, matchedAt, queuedAt } from "./EduDebugSceneData";
import { Page, ScanEdge, useKeys } from "./EduDebugSceneKit";
import PipePage from "./EduDebugScenePipe";
import TankPage from "./EduDebugSceneTank";

/* One instrument panel: status bar, four stage pages that wipe over each other, log console. */

const PAGE_KEYS = WIPES.flatMap(([a, b]) => [a, b]);
const PAGE_VALS = [0, 1, 1, 2, 2, 3];
const SWITCH = WIPES.map(([a, b]) => (a + b) / 2);
const TRACE_MARKS = [0.595, 0.618, 0.64] as const;
const TRACE_TEXT = ["trace: app", "trace: job", "trace: smtp"] as const;

function Stage({ p }: { p: MV }) {
  const pagePos = useKeys(p, PAGE_KEYS, PAGE_VALS);
  return (
    <div className="relative min-h-0 flex-1 overflow-hidden">
      <Page pagePos={pagePos} k={0}>
        <TankPage p={p} mode="fill" />
      </Page>
      <Page pagePos={pagePos} k={1}>
        <BytesPage p={p} />
      </Page>
      <Page pagePos={pagePos} k={2}>
        <PipePage p={p} />
      </Page>
      <Page pagePos={pagePos} k={3}>
        <TankPage p={p} mode="drain" />
      </Page>
      {WIPES.map((_, i) => (
        <ScanEdge key={i} pagePos={pagePos} k={i + 1} />
      ))}
    </div>
  );
}

function Visual({ p }: { p: MV }) {
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div className="absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-line-strong bg-surface-1 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]">
        <StatusBar p={p} />
        <Stage p={p} />
        <Console p={p} />
      </div>
    </div>
  );
}

function rowsMatched(v: number) {
  return BYTE_ROWS.filter((_, i) => v >= matchedAt(i)).length;
}

function readoutText(v: number) {
  if (v < SWITCH[0] || v >= SWITCH[2]) return `queued ${fmtTidy(queuedAt(v))}`;
  if (v < SWITCH[1]) return `rows ${rowsMatched(v)}/${ROWS} match`;
  const step = TRACE_MARKS.findIndex((m) => v < m);
  return step === -1 ? `limit ${LIMIT_PER_HOUR} / hr` : TRACE_TEXT[step];
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutText);
  return <motion.span>{text}</motion.span>;
}

export default function EduDebugScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
