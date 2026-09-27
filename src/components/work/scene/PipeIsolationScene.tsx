"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { StatusStrip } from "./PipeKitStatus";
import { CAPTIONS, CHAPTERS } from "./PipeIsolationData";
import { W, WIDE, pickLayout, rectStyle, type Layout } from "./PipeIsolationLayout";
import { LayoutProvider, Page, WipeEdge, useLayout } from "./PipeIsolationKit";
import { LaneA, LaneB } from "./PipeIsolationLanes";
import GridPage from "./PipeIsolationGrid";
import SheetsPage from "./PipeIsolationSheets";
import LogPage from "./PipeIsolationLog";
import { ClockChip, GapLayer } from "./PipeIsolationClock";
import { PILL_B_MARKS, WIPE, readoutAt } from "./PipeIsolationTime";

/* The scraping workflow and why it is isolated. Two lanes, A (scraper) above B (publisher), with a middle band that
   shows the data: the account chips, the two sheets, the failed run's log, then the gap between the lanes. The sheet
   row at the bottom is #0412, waiting as "rendered" until lane B posts it at 06:00. */

const PAD = "clamp(4px,1.2cqw,12px)";
const GAP = "clamp(6px,2cqw,12px)";
const STRIP_H = 26;
const stageWidth = (h: number) => `min(calc(100cqw - 2 * ${PAD}), calc((100cqh - 2 * ${PAD} - ${GAP} - ${STRIP_H}px) * ${W} / ${h}))`;
const useEdgeEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;
/** Row #0412 is already rendered when this scene starts; the publishing run at the end posts it. */
const POSTED_AT = PILL_B_MARKS[1] - 0.006;
const STATUS_AT = [-1, -1, -1, -1, POSTED_AT] as const;

function Band({ p }: { p: MV }) {
  const L = useLayout();
  return (
    <div style={rectStyle(L.band, L.stage)} className="absolute">
      <Page p={p} leave={WIPE.sheets}>
        <GridPage p={p} run={1} />
      </Page>
      <Page p={p} enter={WIPE.sheets} leave={WIPE.run2}>
        <SheetsPage p={p} />
      </Page>
      <Page p={p} enter={WIPE.run2} leave={WIPE.log}>
        <GridPage p={p} run={2} />
      </Page>
      <Page p={p} enter={WIPE.log} leave={WIPE.gap}>
        <LogPage p={p} />
      </Page>
      {Object.values(WIPE).map((win) => (
        <WipeEdge key={win[0]} p={p} win={win} />
      ))}
    </div>
  );
}

/** The stage that fits the box the scene is given: the wide one, or the tall one on a portrait phone. */
function useStageLayout() {
  const ref = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<Layout>(WIDE);
  useEdgeEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const measure = () => setLayout(pickLayout(el.clientWidth, el.clientHeight));
    measure();
    const watch = new ResizeObserver(measure);
    watch.observe(el);
    return () => watch.disconnect();
  }, []);
  return { ref, layout };
}

export function PipeIsolationVisual({ p }: { p: MV }) {
  const { ref, layout } = useStageLayout();
  const width = stageWidth(layout.H);
  return (
    <div ref={ref} className="absolute inset-0 [container-type:size]">
      <LayoutProvider value={layout}>
        <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ gap: GAP }}>
          <div style={{ width, aspectRatio: `${W} / ${layout.H}` }} className="relative [container-type:size]">
            <LaneA p={p} />
            <LaneB p={p} />
            <Band p={p} />
            <GapLayer p={p} />
            <ClockChip p={p} />
          </div>
          <div style={{ width }}>
            <StatusStrip p={p} statusAt={STATUS_AT} className="@max-[420px]:[&>div>span]:tracking-[-0.04em]" />
          </div>
        </div>
      </LayoutProvider>
    </div>
  );
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutAt);
  return <motion.span>{text}</motion.span>;
}

export default function PipeIsolationScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <PipeIsolationVisual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
