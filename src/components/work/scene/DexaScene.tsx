"use client";

import { useRef, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import DexaSceneShell from "./DexaSceneShell";
import type { MV } from "./HealthSceneParts";
import {
  CAPTIONS,
  CHAPTERS,
  DRAW_ORDER,
  HOP,
  HUNT_ORDER,
  PAGES,
  REGIONS,
  STRIP_CHARTS,
  TL,
  VB_H,
  VB_W,
  ZONE,
  arriveAt,
  chartPt,
  hopAt,
  landAt,
  type ZoneKey,
} from "./DexaSceneData";
import { StageContext, useExtra, useStageExtra } from "./DexaSceneKit";
import { PdfPage, Strip } from "./DexaSceneParts";
import { CropRect, OpStream } from "./DexaSceneHunt";
import { ExtractCard, RegionList, Summary } from "./DexaSceneBody";
import { CardBadge } from "./DexaSceneIcons";

/* DEXA case study scene: vendor PDFs, locate the chart from the PDF operators,
   extract regional numbers, score them against age-matched percentiles. One SVG
   stage, a pure function of the scroll progress. */

function Zone({ at, children }: { at: ZoneKey; children: ReactNode }) {
  const extra = useExtra();
  return <g transform={`translate(0 ${(extra * ZONE[at]).toFixed(1)})`}>{children}</g>;
}

function Visual({ p }: { p: MV }) {
  const ref = useRef<SVGSVGElement>(null);
  const stage = useStageExtra(ref);
  return (
    <StageContext.Provider value={stage}>
      <svg ref={ref} viewBox={`0 0 ${VB_W} ${VB_H + stage.extra}`} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full overflow-visible">
        <Zone at="strip">
          <Strip p={p} />
        </Zone>
        <Zone at="top">
          {DRAW_ORDER.map((i) => (
            <PdfPage key={PAGES[i].vendor} p={p} cfg={PAGES[i]} index={i} />
          ))}
        </Zone>
        <Zone at="stream">
          <OpStream p={p} />
        </Zone>
        <Zone at="top">
          <CropRect p={p} />
        </Zone>
        <Zone at="hero">
          <Summary p={p} />
        </Zone>
        <Zone at="top">
          <ExtractCard p={p} />
          <CardBadge p={p} />
          <RegionList p={p} />
        </Zone>
      </svg>
    </StageContext.Provider>
  );
}

const PCT_ROWS = REGIONS.filter((r) => r.pct !== null).length;
const HUNT_STARTS = [TL.snapA - 0.02, hopAt(TL.toC, HOP.swap), hopAt(TL.toB, HOP.swap)] as const;

function cropReadout(v: number) {
  const step = HUNT_STARTS.filter((s) => v >= s).length;
  if (step === 0) return "reading operators";
  const page = HUNT_ORDER[step - 1];
  const { w, h } = chartPt(page);
  return `v${page.vendor} chart ${w} x ${h} pt`;
}

function readoutText(v: number) {
  if (v < TL.squareUp[1]) {
    const n = Math.floor((v - TL.stripStart) / TL.stripStep) + 1;
    return `layouts ${Math.min(STRIP_CHARTS.length, Math.max(0, n))}/${STRIP_CHARTS.length}`;
  }
  if (v < TL.exit[0]) return cropReadout(v);
  if (v < TL.header[0]) return `regions ${REGIONS.filter((r) => v >= arriveAt(r)).length}/${REGIONS.length}`;
  return `percentiles ${Array.from({ length: PCT_ROWS }, (_, i) => i).filter((i) => v >= landAt(i)).length}/${PCT_ROWS}`;
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutText);
  return <motion.span>{text}</motion.span>;
}

export default function DexaScene() {
  return (
    <DexaSceneShell
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[380svh] sm:h-[420svh]"
    />
  );
}
