"use client";

import { useEffect, useState } from "react";
import { useMotionValue } from "framer-motion";
import { HealthVisual } from "./HealthScene";
import { DexaVisual } from "./DexaScene";
import { GeneticsVisual } from "./GeneticsScene";
import { WearableVisual } from "./WearableScene";
import { ChatVisual } from "./ChatScene";
import { PlanVisual } from "./PlanScene";
import { MobileVisual } from "./MobileScene";

/* WorkReel card preview rig, reel edition: cycles through all 7 real scroll
   scenes of the health-platform case study (registration, DEXA, genetics,
   wearables, chat, plan, mobile) in the page's own order. The card used to
   play the registration scene alone, on the assumption that HealthScene
   already told the whole story -- it doesn't, the six feature scenes below
   it are chapters of their own (Rafii, 29 Sep: "kenapa masih hanya animasi 1
   bab saja tidak semua"). Driven by window.__setHealthReelFrame(sceneIndex,
   localProgress) -- see PipeReelPreview for why this is a series of instant
   sets, not a navigation per frame. */

export const HEALTH_REEL_SCENES = [
  HealthVisual,
  DexaVisual,
  GeneticsVisual,
  WearableVisual,
  ChatVisual,
  PlanVisual,
  MobileVisual,
];

declare global {
  interface Window {
    __setHealthReelFrame?: (sceneIndex: number, localProgress: number) => void;
  }
}

export default function HealthReelPreview({
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
    window.__setHealthReelFrame = (i: number, v: number) => {
      setScene(i);
      p.set(v);
    };
    return () => {
      delete window.__setHealthReelFrame;
    };
  }, [p]);

  const Scene = HEALTH_REEL_SCENES[Math.min(HEALTH_REEL_SCENES.length - 1, Math.max(0, scene))];

  return (
    <div className="relative mx-auto bg-bg" style={{ width, height }}>
      <Scene p={p} />
    </div>
  );
}
