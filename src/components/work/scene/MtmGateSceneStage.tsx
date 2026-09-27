"use client";

import type { CSSProperties } from "react";
import type { MV } from "./HealthSceneParts";
import { StoreWindow } from "./MtmKitStage";
import { LAYOUT } from "./MtmGateSceneData";
import { useDimMotion } from "./MtmGateSceneDims";
import { Machine } from "./MtmGateSceneMachine";
import { Menu } from "./MtmGateSceneMenu";
import { useGateMotion, type GateMotion } from "./MtmGateSceneMotion";
import OptionsPage from "./MtmGateSceneOptions";
import { FreshPane } from "./MtmGateSceneFresh";
import { PaneTabs, SavedPane } from "./MtmGateSceneSaved";
import { Preview } from "./MtmGateScenePreview";
import { CartBar } from "./MtmGateSceneSlot";
import { WipeStack } from "./MtmGateSceneWipe";

/* The stage is laid out for a 358 px wide box and scaled up (never down) to at most 1.32, as far as the box is wide and tall enough.
   The kit sets its smallest labels at 10 px, so on a phone, where nothing scales up, every 10 px text of the stage gets 10.5 px. */

const DESIGN_W = "358px";
const MAX_SCALE = 1.32;
const DESIGN_H = "500px";
const STAGE: CSSProperties = {
  ["--s" as string]: `clamp(1, min(tan(atan2(100cqw, ${DESIGN_W})), tan(atan2(100cqh, ${DESIGN_H}))), ${MAX_SCALE})`,
  width: "calc(100cqw / var(--s))",
  height: "calc(100cqh / var(--s))",
  transform: "scale(var(--s))",
  transformOrigin: "0 0",
};

function Body({ p, m }: { p: MV; m: GateMotion }) {
  const dims = useDimMotion(p, m.fresh);
  const pages = [<OptionsPage key="o" p={p} />, <SavedPane key="s" m={m} />, <FreshPane key="f" m={m} />, <SavedPane key="b" m={m} />];
  return (
    <div className="absolute inset-0 flex flex-col">
      <div className="relative min-h-0 flex-1">
        <Preview p={p} dims={dims} />
        <div className="absolute inset-x-0 bottom-0" style={{ height: LAYOUT.paneH }}>
          <WipeStack pos={m.panePos} pages={pages} className="h-full" />
          <PaneTabs m={m} />
          <Menu m={m} />
        </div>
      </div>
      <CartBar p={p} m={m} />
    </div>
  );
}

export default function Stage({ p }: { p: MV }) {
  const m = useGateMotion(p);
  return (
    <div className="absolute inset-0 [container-type:size] [&_.text-\[10px\]]:text-[10.5px]">
      <div className="absolute left-0 top-0" style={STAGE}>
        <div className="flex h-full flex-col gap-2 p-2">
          <div className="min-h-0 flex-1">
            <StoreWindow>
              <Body p={p} m={m} />
            </StoreWindow>
          </div>
          <Machine p={p} />
        </div>
      </div>
    </div>
  );
}
