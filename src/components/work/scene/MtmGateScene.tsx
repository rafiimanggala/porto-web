"use client";

import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { CAPTIONS, CHAPTERS } from "./MtmGateSceneData";
import { stateLabel } from "./MtmGateSceneMath";
import Stage from "./MtmGateSceneStage";

/* Add to cart gate scene: a locked button, a saved pattern that unlocks it, a fresh fitting that replaces it, and a bail out
   that snaps a small state machine back to locked. The store page and the machine underneath share one token. */

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, stateLabel);
  return <motion.span>{text}</motion.span>;
}

export default function MtmGateScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Stage p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
