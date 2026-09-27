"use client";

import { useEffect, useState } from "react";
import { useMotionValue } from "framer-motion";
import { MtmFitVisual } from "./MtmFitScene";
import { MtmEditorVisual } from "./MtmEditorScene";
import MtmGateVisual from "./MtmGateSceneStage";
import MtmDebugVisual from "./MtmDebugSceneShell";
import { MtmEmailVisual } from "./MtmEmailScene";
import { MtmPhoneVisual } from "./MtmPhoneScene";

/* WorkReel card preview rig, reel edition: cycles through all 6 real scroll
   scenes (Fit, Editor, Gate, Debug, Email, Phone) in the case study's own
   order, instead of just the Fit chapter (Rafii's correction, 27 Sep:
   "maksud saya semua animasi bukan 1 bab doang"). Driven by
   window.__setMtmReelFrame(sceneIndex, localProgress) -- see PipeReelPreview
   for why this is a series of instant sets, not a navigation per frame. */

export const MTM_REEL_SCENES = [
  MtmFitVisual,
  MtmEditorVisual,
  MtmGateVisual,
  MtmDebugVisual,
  MtmEmailVisual,
  MtmPhoneVisual,
];

declare global {
  interface Window {
    __setMtmReelFrame?: (sceneIndex: number, localProgress: number) => void;
  }
}

export default function MtmReelPreview({
  sceneIndex,
  localProgress,
  width,
  height,
}: {
  sceneIndex: number;
  localProgress: number;
  width: number;
  height: number;
}) {
  const [scene, setScene] = useState(sceneIndex);
  const p = useMotionValue(localProgress);

  useEffect(() => {
    window.__setMtmReelFrame = (i: number, v: number) => {
      setScene(i);
      p.set(v);
    };
    return () => {
      delete window.__setMtmReelFrame;
    };
  }, [p]);

  const Scene = MTM_REEL_SCENES[Math.min(MTM_REEL_SCENES.length - 1, Math.max(0, scene))];

  return (
    <div className="relative mx-auto bg-bg" style={{ width, height }}>
      <Scene p={p} />
    </div>
  );
}
