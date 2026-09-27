"use client";

import { useEffect } from "react";
import { useMotionValue } from "framer-motion";
import { EduInsightsVisual } from "./EduInsightsScene";

/* WorkReel card preview rig: mounts the REAL EduInsightsScene visual (the
   exact one that ships on the case study page) at a manually-driven
   progress, instead of the old fake mockup-animation loop. The capture
   script drives it via window.__setEduInsightsProgress(p), set here once on
   mount, so a full frame sweep is a series of instant sets, not a page
   navigation per frame (see mockup-video/page.tsx for why that matters). */

declare global {
  interface Window {
    __setEduInsightsProgress?: (p: number) => void;
  }
}

export default function EduInsightsScenePreview({
  progress,
  width,
  height,
}: {
  progress: number;
  width: number;
  height: number;
}) {
  const p = useMotionValue(progress);

  useEffect(() => {
    window.__setEduInsightsProgress = (v: number) => p.set(v);
    return () => {
      delete window.__setEduInsightsProgress;
    };
  }, [p]);

  return (
    <div className="relative mx-auto bg-bg" style={{ width, height }}>
      <EduInsightsVisual p={p} />
    </div>
  );
}
