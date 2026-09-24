"use client";

import type { CSSProperties } from "react";
import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import { easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CAPTIONS, CHAPTERS, GRID_ASPECT, GRID_H, GRID_W, Q41, T, cellX, cellY } from "./EduQuizSceneData";
import { CardOutline, QuestionCard } from "./EduQuizSceneCard";
import { HexGrid } from "./EduQuizSceneGrid";
import { BankList, TopRow } from "./EduQuizSceneList";
import { Legend, StatusPanel, Strip } from "./EduQuizSceneMapUI";

/* Quiz engine scene. One stage, four beats: an endless question list that
   collapses into a hex grid behind a scan line, a cursor that jumps between
   cells, a card that opens out of one cell and cycles through the answer
   controls, and the key and feedback that finish the review. The map keeps a
   third of the stage, the card takes the rest. */

/* Container-relative sizing. The map is as wide as the stage, unless the stage is too short for it.
   Once it shrinks it keeps whatever height the card leaves over, never less than 30 % or more than 66 %. */
const CHROME = "calc(var(--hdr) + 3 * var(--gap) + var(--leg) + var(--strip))";
const STAGE_VARS = {
  "--pad": "clamp(10px, 2.6cqw, 18px)",
  "--hdr": "26px",
  "--gap": "8px",
  "--leg": "20px",
  "--strip": "44px",
  "--gw": `min(calc(100cqw - 2 * var(--pad)), calc((100cqh - 2 * var(--pad) - ${CHROME}) / ${GRID_ASPECT.toFixed(4)}))`,
  "--gh": `calc(var(--gw) * ${GRID_ASPECT.toFixed(4)})`,
  "--full": `calc(var(--gh) + ${CHROME})`,
  "--shift": "max(0px, calc((100cqh - var(--full)) / 2 - var(--pad)))",
  "--mh": "clamp(calc(var(--gh) * 0.3), calc(100cqh - max(58cqh, 268px) - 2 * var(--pad) - var(--hdr) - var(--gap) - 10px), calc(var(--gh) * 0.66))",
  "--mini": "tan(atan2(var(--mh), var(--gh)))",
} as CSSProperties;

const CELL_FX = cellX(Q41) / GRID_W;
const CELL_FY = cellY(Q41) / GRID_H;

/* A short line from the opened cell down to the card it opens. */
function Leader({ p }: { p: MV }) {
  const grow = useSeg(p, T.leader[0], T.leader[1], easeOutCubic);
  const fade = useSeg(p, T.card[1] - 0.02, T.card[1] + 0.02);
  const opacity = useTransform(fade, (f) => 1 - f);
  return (
    <motion.i
      aria-hidden
      style={{
        scaleY: grow,
        opacity,
        left: `calc(var(--pad) + var(--gw) * var(--mini) * ${CELL_FX.toFixed(4)} - 1px)`,
        top: `calc(var(--pad) + var(--hdr) + var(--gap) + var(--gh) * var(--mini) * ${CELL_FY.toFixed(4)})`,
        height: `calc(var(--gh) * var(--mini) * ${(1 - CELL_FY).toFixed(4)} + 10px)`,
      }}
      className="pointer-events-none absolute z-10 w-0.5 origin-top rounded-full bg-accent"
    />
  );
}

function Visual({ p }: { p: MV }) {
  const k = useSeg(p, T.shrink[0], T.shrink[1], easeInOutCubic);
  const lift = useTransform([useSeg(p, T.scan[0], T.scan[1], easeInOutCubic), k], ([s, v]: number[]) => s * (1 - v));
  const shift = useTransform(lift, (v) => `translateY(calc(var(--shift) * ${v.toFixed(4)}))`);
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div className="absolute inset-0" style={STAGE_VARS}>
        <CardOutline p={p} />
        <motion.div style={{ transform: shift }} className="absolute inset-x-[var(--pad)] bottom-[var(--pad)] top-[var(--pad)]">
          <BankList p={p} lift={lift} />
          <HexGrid p={p} k={k} />
          <Legend p={p} />
          <Strip p={p} />
          <StatusPanel p={p} />
          <TopRow p={p} />
        </motion.div>
        <Leader p={p} />
        <QuestionCard p={p} />
      </div>
    </div>
  );
}

export default function EduQuizScene() {
  return <ScrollScene captions={CAPTIONS} chapters={CHAPTERS} render={(p) => <Visual p={p} />} heightClass="h-[240svh] sm:h-[280svh]" />;
}
