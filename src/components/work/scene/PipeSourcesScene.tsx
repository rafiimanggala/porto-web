"use client";

import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { CAPTIONS, CHAPTERS } from "./PipeSourcesSceneData";
import Dial from "./PipeSourcesSceneDial";
import { CombWires, FeedTiles, ScheduleTile } from "./PipeSourcesSceneFeeds";
import { ChainTiles, ChainWires, ListLabel, MergeSweep, ScanLine, Stamp } from "./PipeSourcesSceneMerge";
import { ArticleCard } from "./PipeSourcesSceneCard";
import { Braces, MiniSheet, PayloadChip, PayloadJson, StatusLayer } from "./PipeSourcesScenePick";
import { Stage, useLy } from "./PipeSourcesSceneKit";
import { SW } from "./PipeSourcesSceneLayout";
import { Rows, TableHeader } from "./PipeSourcesSceneRow";
import { Counters, Minimap } from "./PipeSourcesSceneStats";

/* Scene 1 of the content pipeline: the daily trigger and the sources. One stage, drawn as a pure function of the
   scroll progress: a dial fires at 06:00, three feeds print in parallel, a sweep prints them again as one list, the
   rows already used are struck out, and one story goes forward into a new sheet row. Every row carries a real headline.
   A tall phone gets its own portrait layout (see PipeSourcesSceneLayout); the timeline is the same. */

function Content({ p }: { p: MV }) {
  const ly = useLy();
  return (
    <>
      <svg viewBox={`0 0 ${SW} ${ly.sh}`} aria-hidden className="absolute inset-0 z-0 h-full w-full">
        <CombWires p={p} />
        <ChainWires p={p} />
        <Braces p={p} />
      </svg>
      <Minimap p={p} />
      <Counters p={p} />
      <Dial p={p} />
      <ScheduleTile p={p} />
      <FeedTiles p={p} />
      <ChainTiles p={p} />
      <ListLabel p={p} />
      {ly.tall ? null : <TableHeader p={p} />}
      <Rows p={p} />
      <MergeSweep p={p} />
      <ScanLine p={p} />
      <Stamp p={p} />
      <PayloadChip p={p} />
      <PayloadJson p={p} />
      <ArticleCard p={p} />
      <MiniSheet p={p} />
      <StatusLayer p={p} />
    </>
  );
}

export function PipeSourcesVisual({ p }: { p: MV }) {
  return (
    <Stage>
      <Content p={p} />
    </Stage>
  );
}

export default function PipeSourcesScene() {
  return <ScrollScene captions={CAPTIONS} chapters={CHAPTERS} render={(p) => <PipeSourcesVisual p={p} />} heightClass="h-[240svh] sm:h-[280svh]" />;
}
