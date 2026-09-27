"use client";

import { easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import ScrollScene from "./ScrollScene";
import { StatusStrip } from "./PipeKitStatus";
import { ArticleBars, ArticleFrame, ArticleText, RulerBacking, RulerFrame } from "./PipeScriptArticle";
import { CaptionCard, ScriptPill } from "./PipeScriptCaption";
import { PhraseChips } from "./PipeScriptChips";
import { CAPTIONS, CHAPTERS, TL, WIPES } from "./PipeScriptData";
import { GraphNodes, GraphWires } from "./PipeScriptGraph";
import { Artboard, Edge, Layer, Y } from "./PipeScriptKit";
import { SHEET_H } from "./PipeScriptLayout";
import { Panel } from "./PipeScriptPanel";
import { RulerLabel, RulerTicks, ScriptRows } from "./PipeScriptRows";
import { TagCloud } from "./PipeScriptTags";

/* From article to script and caption. One fixed-ratio board; the article folds into the script ruler, the middle layer
   wipes from the script rows to the tag cloud and the caption card, the graph row lights up node by node. */

const STATUS_AT = [-1, TL.strip, 2, 2, 2] as const;
const WIPE_TOP = 6;
const WIPE_HEIGHT = SHEET_H - 12;

export function PipeScriptVisual({ p }: { p: MV }) {
  const w2 = useSeg(p, WIPES[1][0], WIPES[1][1], easeInOutCubic);
  return (
    <Artboard>
      <GraphWires p={p} />
      <RulerFrame />
      <Layer leave={w2}>
        <ArticleFrame p={p} />
      </Layer>
      <RulerBacking p={p} />
      <ArticleText p={p} />
      <ArticleBars p={p} />
      <Layer leave={w2}>
        <RulerTicks p={p} />
        <ScriptRows p={p} />
      </Layer>
      <Layer enter={w2}>
        <RulerLabel />
        <TagCloud p={p} />
        <CaptionCard p={p} />
      </Layer>
      <Edge front={w2} style={{ top: Y(WIPE_TOP), height: Y(WIPE_HEIGHT) }} />
      <PhraseChips p={p} />
      <ScriptPill p={p} />
      <Panel p={p} />
      <GraphNodes p={p} />
      <div className="absolute inset-x-0 bottom-0">
        <StatusStrip p={p} statusAt={STATUS_AT} />
      </div>
    </Artboard>
  );
}

export default function PipeScriptScene() {
  return <ScrollScene captions={CAPTIONS} chapters={CHAPTERS} render={(p) => <PipeScriptVisual p={p} />} heightClass="h-[240svh] sm:h-[280svh]" />;
}
