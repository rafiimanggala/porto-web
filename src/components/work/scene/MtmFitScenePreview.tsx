"use client";

import { useEffect } from "react";
import { useMotionValue } from "framer-motion";
import { MtmFitVisual } from "./MtmFitScene";

/* WorkReel card preview rig: mounts the REAL MtmFitScene visual (the exact
   one that ships on the case study page) at a manually-driven progress,
   instead of a fake mockup-animation loop. The capture script drives it via
   window.__setMtmFitProgress(p), set here once on mount, so a full frame
   sweep is a series of instant sets, not a page navigation per frame (see
   mockup-video/page.tsx for why that matters). */

declare global {
  interface Window {
    __setMtmFitProgress?: (p: number) => void;
  }
}

export default function MtmFitScenePreview({
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
    window.__setMtmFitProgress = (v: number) => p.set(v);
    return () => {
      delete window.__setMtmFitProgress;
    };
  }, [p]);

  return (
    <div className="relative mx-auto bg-bg" style={{ width, height }}>
      <MtmFitVisual p={p} />
    </div>
  );
}
