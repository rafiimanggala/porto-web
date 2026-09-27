"use client";

import { useEffect } from "react";
import { useMotionValue } from "framer-motion";
import { HealthVisual } from "./HealthScene";

/* WorkReel card preview rig: mounts the REAL HealthScene panels/payoff at a
   manually-driven progress, instead of the old fake mockup-animation loop.
   The capture script drives it via window.__setHealthProgress(p), set here
   once on mount, so a full frame sweep is a series of instant sets, not a
   page navigation per frame (see mockup-video/page.tsx for why that
   matters). */

declare global {
  interface Window {
    __setHealthProgress?: (p: number) => void;
  }
}

export default function HealthScenePreview({
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
    window.__setHealthProgress = (v: number) => p.set(v);
    return () => {
      delete window.__setHealthProgress;
    };
  }, [p]);

  return (
    <div className="relative mx-auto bg-bg" style={{ width, height }}>
      <HealthVisual p={p} />
    </div>
  );
}
