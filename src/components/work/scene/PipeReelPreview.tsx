"use client";

import { useEffect, useState } from "react";
import { useMotionValue } from "framer-motion";
import { PipeSourcesVisual } from "./PipeSourcesScene";
import { PipeScriptVisual } from "./PipeScriptScene";
import { PipeVoiceVisual } from "./PipeVoiceScene";
import { PipeRenderVisual } from "./PipeRenderScene";
import { PipePublishVisual } from "./PipePublishScene";
import { PipeIsolationVisual } from "./PipeIsolationScene";
import { PipeShortsVisual } from "./PipeShortsScene";

/* WorkReel card preview rig, reel edition: instead of picking ONE chapter to
   stand in for the whole pipeline (Rafii's correction, 27 Sep: "kenapa cuma 1
   animasi saya igin semuanya" -> "maksud saya semua animasi bukan 1 bab
   doang"), this cycles through all 7 real scroll scenes in the case study's
   own order, each swept 0 to 1 in turn. The capture script drives it via
   window.__setPipeReelFrame(sceneIndex, localProgress), set here once on
   mount, so a full sweep is a series of instant sets, not a page navigation
   per frame (see mockup-video/page.tsx for why that matters). */

export const PIPE_REEL_SCENES = [
  PipeSourcesVisual,
  PipeScriptVisual,
  PipeVoiceVisual,
  PipeRenderVisual,
  PipePublishVisual,
  PipeIsolationVisual,
  PipeShortsVisual,
];

declare global {
  interface Window {
    __setPipeReelFrame?: (sceneIndex: number, localProgress: number) => void;
  }
}

export default function PipeReelPreview({
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
    window.__setPipeReelFrame = (i: number, v: number) => {
      setScene(i);
      p.set(v);
    };
    return () => {
      delete window.__setPipeReelFrame;
    };
  }, [p]);

  const Scene = PIPE_REEL_SCENES[Math.min(PIPE_REEL_SCENES.length - 1, Math.max(0, scene))];

  return (
    <div className="relative mx-auto bg-bg" style={{ width, height }}>
      <Scene p={p} />
    </div>
  );
}
