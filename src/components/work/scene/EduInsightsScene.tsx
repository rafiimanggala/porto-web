"use client";

import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { CAPTIONS, CHAPTERS, T } from "./EduInsightsSceneData";
import { WindowPanel } from "./EduInsightsSceneCal";
import { ClassTable } from "./EduInsightsSceneTable";
import { RollStack } from "./EduInsightsSceneSend";
import { linear, useKeys } from "./EduInsightsSceneKit";

/* Class performance insights. One stage, three panels that hand the focus
   downward: the 14-day window and the class table (results), the summary card
   that writes itself (summarise), the empty class whose 0 percent becomes
   "no data yet" (honest zero), and the card folding into an envelope that grows
   over the dimmed results (send). */

const STAGE_VARS = {
  "--pad": "clamp(10px, 3cqw, 20px)",
  "--gap": "clamp(8px, 1.8cqw, 12px)",
} as CSSProperties;

const STRIP_DIM = 0.5;
const TABLE_DIM = 0.55;
/* In the send chapter the envelope takes the stage and the results step back. */
const BACK_DIM = 0.16;
const DIM_KEYS = [0, T.ring[0], T.ring[1], T.back[0], T.back[1]];
const DIM_VALS = [0, 0, 1, 1, 0];
const RING_KEYS = [T.lines[2][0], T.lines[2][0] + 0.015, T.back[0], T.back[1]];
const RING_VALS = [0, 1, 1, 0];

function Visual({ p }: { p: MV }) {
  const dim = useKeys(p, DIM_KEYS, DIM_VALS);
  const ring = useKeys(p, RING_KEYS, RING_VALS);
  const stripOp = useKeys(p, [CHAPTERS[1], T.head[0], T.expand[0], T.expand[1]], [1, STRIP_DIM, STRIP_DIM, BACK_DIM], linear);
  const tableOp = useKeys(p, [T.back[0], T.back[1], T.expand[0], T.expand[1]], [1, TABLE_DIM, TABLE_DIM, BACK_DIM], linear);
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div
        className="absolute inset-0 flex flex-col gap-[var(--gap)] p-[var(--pad)] text-[11px] @lg:text-[12px]"
        style={STAGE_VARS}
      >
        <motion.div style={{ opacity: stripOp }} className="h-[19%] shrink-0">
          <WindowPanel p={p} />
        </motion.div>
        <motion.div style={{ opacity: tableOp }} className="min-h-0 flex-1">
          <ClassTable p={p} dim={dim} ring={ring} />
        </motion.div>
        <div className="relative h-[32%] shrink-0 @lg:text-[13.5px]">
          <RollStack p={p} />
        </div>
      </div>
    </div>
  );
}

export default function EduInsightsScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
      stillAt={1}
    />
  );
}
