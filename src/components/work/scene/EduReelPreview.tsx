"use client";

import { useEffect, useState } from "react";
import { useMotionValue } from "framer-motion";
import { EduVariantsVisual } from "./EduVariantsScene";
import { EduTreeVisual } from "./EduTreeScene";
import { EduQuizVisual } from "./EduQuizScene";
import { EduInsightsVisual } from "./EduInsightsScene";
import { EduDebugVisual } from "./EduDebugScene";
import { EduPhoneVisual } from "./EduPhoneScene";

/* WorkReel card preview rig, reel edition: cycles through all 6 real scroll
   scenes (Variants, Tree, Quiz, Insights, Debug, Phone) in the case study's
   own order, instead of just the Insights chapter (Rafii's correction, 27
   Sep: "maksud saya semua animasi bukan 1 bab doang"). Driven by
   window.__setEduReelFrame(sceneIndex, localProgress) -- see
   PipeReelPreview for why this is a series of instant sets, not a
   navigation per frame. */

export const EDU_REEL_SCENES = [
  EduVariantsVisual,
  EduTreeVisual,
  EduQuizVisual,
  EduInsightsVisual,
  EduDebugVisual,
  EduPhoneVisual,
];

declare global {
  interface Window {
    __setEduReelFrame?: (sceneIndex: number, localProgress: number) => void;
  }
}

export default function EduReelPreview({
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
    window.__setEduReelFrame = (i: number, v: number) => {
      setScene(i);
      p.set(v);
    };
    return () => {
      delete window.__setEduReelFrame;
    };
  }, [p]);

  const Scene = EDU_REEL_SCENES[Math.min(EDU_REEL_SCENES.length - 1, Math.max(0, scene))];

  return (
    <div className="relative mx-auto bg-bg" style={{ width, height }}>
      <Scene p={p} />
    </div>
  );
}
