"use client";

import type { MV } from "./HealthSceneParts";
import { MONO } from "./HealthSceneParts";
import { PRODUCT } from "./MtmKitData";
import { toneTint } from "./MtmKitMath";
import { LAYOUT } from "./MtmGateSceneData";
import type { DimMotion } from "./MtmGateSceneDims";
import { ShirtArt } from "./MtmGateSceneShirt";

/* Product preview above the fit pane. It takes whatever height the stage has left over, so it only shows on tall boxes. */

const SHOW_FROM = "96px";
const SHOW_RAMP = "12px";
const OPACITY = `clamp(0, tan(atan2(100cqh - ${SHOW_FROM}, ${SHOW_RAMP})), 1)`;

function Name() {
  return (
    <div className="absolute left-3 top-2 flex items-center gap-2">
      <span className="text-[12px] font-medium leading-none text-fg">{PRODUCT.name}</span>
      <span className={`${MONO} rounded-[4px] px-1.5 py-[2px] text-[10px] uppercase leading-none tracking-[0.1em] text-fg`} style={{ background: toneTint("sky", 0.4) }}>
        {PRODUCT.gender}
      </span>
    </div>
  );
}

export function Preview({ p, dims }: { p: MV; dims: DimMotion }) {
  return (
    <div className="absolute inset-x-0 top-0 [container-type:size]" style={{ height: `calc(100% - ${LAYOUT.paneH}px)` }}>
      <div className="absolute inset-0 grid place-items-center" style={{ opacity: OPACITY }}>
        <Name />
        <ShirtArt p={p} dims={dims} />
      </div>
    </div>
  );
}
