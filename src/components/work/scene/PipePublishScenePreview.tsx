"use client";

import { useEffect } from "react";
import { useMotionValue } from "framer-motion";
import { PipePublishVisual } from "./PipePublishScene";

/* WorkReel card preview rig: mounts the REAL PipePublishScene visual (the
   exact one that ships on the case study page) at a manually-driven
   progress, instead of a fake mockup-animation loop. The capture script
   drives it via window.__setPipePublishProgress(p), set here once on mount,
   so a full frame sweep is a series of instant sets, not a page navigation
   per frame (see mockup-video/page.tsx for why that matters). */

declare global {
  interface Window {
    __setPipePublishProgress?: (p: number) => void;
  }
}

export default function PipePublishScenePreview({
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
    window.__setPipePublishProgress = (v: number) => p.set(v);
    return () => {
      delete window.__setPipePublishProgress;
    };
  }, [p]);

  return (
    <div className="relative mx-auto bg-bg" style={{ width, height }}>
      <PipePublishVisual p={p} />
    </div>
  );
}
