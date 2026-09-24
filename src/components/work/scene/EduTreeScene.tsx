"use client";

import type { CSSProperties } from "react";
import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import { easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CAPTIONS, CHAPTERS, LEVEL_AT, QUIZ, TL, WINDOW } from "./EduTreeSceneData";
import { DockStrip } from "./EduTreeSceneDock";
import { InfoStrip, TopBar } from "./EduTreeSceneInfo";
import { nodesAt, pct, quizCount, segAt } from "./EduTreeSceneMath";
import OfflinePage from "./EduTreeSceneOffline";
import TreeWindow from "./EduTreeSceneRows";
import { Flights } from "./EduTreeSceneStamps";

/* Deep content tree scene. One app panel with a top bar, a rolling info strip, a body and a dock.
   The tree stays put through drill down, scale and assign; the offline page wipes over it. Every
   size is a container-relative variable, so one layout serves the phone and the wide stage. */

const VARS = {
  "--row": "clamp(20px, 4.6cqh, 34px)",
  "--top": "clamp(40px, 6.2cqh, 52px)",
  "--info": "clamp(54px, 8.6cqh, 64px)",
  "--dock": "clamp(36px, 6cqh, 46px)",
  /* Top of the twelve-row window: centred in the body, never closer than a row and a half to the strip. */
  "--gtop": "max(calc(var(--row) * 1.5), calc((100cqh - 2px - var(--top) - var(--info) - var(--dock) - var(--row) * 12) / 2))",
  "--ind": "clamp(12px, 3.6cqw, 22px)",
  "--mini": "clamp(18px, 4cqw, 28px)",
  "--rside": "calc(var(--mini) + 14px)",
  "--chip-w": "clamp(66px, 12cqw, 84px)",
  "--chip-h": "calc(var(--row) - 4px)",
  "--tray-x": "clamp(52px, 9cqw, 60px)",
} as CSSProperties;

function Body({ p }: { p: MV }) {
  const w = useSeg(p, TL.wipe[0], TL.wipe[1], easeInOutCubic);
  const treeClip = useTransform(w, (v) => `inset(0 0 0 ${pct(v * 100)})`);
  const pageClip = useTransform(w, (v) => `inset(0 ${pct(100 - v * 100)} 0 0)`);
  const left = useTransform(w, (v) => pct(v * 100));
  const opacity = useTransform(w, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <div className="relative min-h-0">
      <motion.div style={{ clipPath: treeClip }} className="absolute inset-0">
        <TreeWindow p={p} />
      </motion.div>
      <motion.div style={{ clipPath: pageClip }} className="absolute inset-0">
        <OfflinePage p={p} />
      </motion.div>
      <motion.i
        aria-hidden
        style={{ left, opacity }}
        className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent"
      />
    </div>
  );
}

function Visual({ p }: { p: MV }) {
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div style={VARS} className="absolute inset-0">
        <div className="absolute inset-0 grid grid-rows-[var(--top)_var(--info)_minmax(0,1fr)_var(--dock)] overflow-hidden rounded-xl border border-line-strong bg-surface-1 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]">
          <TopBar p={p} />
          <InfoStrip p={p} />
          <Body p={p} />
          <DockStrip p={p} />
        </div>
        <Flights p={p} />
      </div>
    </div>
  );
}

const STAMPS = QUIZ.map((q) => q.stamp);

function readoutText(v: number) {
  if (v < CHAPTERS[1]) return `level ${1 + LEVEL_AT.filter((a, i) => i > 0 && v >= a).length}/4`;
  if (v < CHAPTERS[2]) return `${nodesAt(v)} nodes, ${WINDOW} drawn`;
  if (v < CHAPTERS[3]) return `quizzes ${Math.round(quizCount(v, STAMPS))}/${QUIZ.length}`;
  return `cached ${Math.round(segAt(v, TL.ring[0], TL.ring[1], easeInOutCubic) * 100)}%`;
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutText);
  return <motion.span>{text}</motion.span>;
}

export default function EduTreeScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
