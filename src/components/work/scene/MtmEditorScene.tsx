"use client";

import { useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { StoreWindow } from "./MtmKitStage";
import { useKeys } from "./MtmKitMath";
import { CAPTIONS, CHAPTERS, T } from "./MtmEditorSceneData";
import { WipePages } from "./MtmEditorSceneKit";
import { storeLoadAt } from "./MtmEditorSceneList";
import MainPage from "./MtmEditorSceneMain";
import Ribbon from "./MtmEditorSceneRibbon";
import SelectPage from "./MtmEditorSceneSelect";

/* Inline pattern editor: a five step ribbon over a product page. Library, edit and clone share one page,
   then the page wipes over to the pattern dropdown with its gender filter and fallback. */

export function MtmEditorVisual({ p }: { p: MV }) {
  const load = useTransform(p, storeLoadAt);
  const wipe = useKeys(p, T.wipe, [0, 1]);
  return (
    <div className="@container absolute inset-0 flex flex-col justify-center gap-2 sm:gap-3">
      <Ribbon p={p} />
      <div className="min-h-0 max-h-[400px] flex-1 @[34rem]:max-h-[490px]">
        <StoreWindow load={load}>
          <WipePages pos={wipe} className="absolute inset-0" pages={[<MainPage key="main" p={p} />, <SelectPage key="select" p={p} />]} />
        </StoreWindow>
      </div>
    </div>
  );
}

export default function MtmEditorScene() {
  return <ScrollScene captions={CAPTIONS} chapters={CHAPTERS} render={(p) => <MtmEditorVisual p={p} />} heightClass="h-[240svh] sm:h-[280svh]" stillAt={0.99} />;
}
