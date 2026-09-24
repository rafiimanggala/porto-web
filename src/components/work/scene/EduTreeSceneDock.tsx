"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { LEVELS, LEVEL_AT, QUIZ, TL } from "./EduTreeSceneData";
import { CheckMark, NodesIcon } from "./EduTreeSceneIcons";
import { QuizChip, Roller, useKeys } from "./EduTreeSceneKit";
import { keyframes, windowRows } from "./EduTreeSceneMath";
import { SceneIcon } from "./SceneIcon";

/* Bottom strip: one cell per chapter, rolled like the info strip. It carries the level legend, the
   window position, the quiz tray the chips are picked from, and the sync state. */

const CELL = "flex h-[var(--dock)] shrink-0 items-center gap-1.5 overflow-hidden px-3 @min-[500px]:gap-2 @min-[500px]:px-4";
const TEXT = `${MONO} whitespace-nowrap text-[11px] @min-[500px]:text-[12px]`;
const TRAY_GAP_PX = 6;

function LevelChip({ p, level, at }: { p: MV; level: number; at: number }) {
  const lit = useSeg(p, at, at + 0.02, easeOutCubic);
  const color = useTransform(lit, (v) => `color-mix(in oklab, var(--color-fg) ${(v * 100).toFixed(1)}%, var(--color-mute))`);
  const tint = LEVELS[level].color;
  return (
    <span className={`relative inline-flex items-center gap-1 rounded-md border border-line-strong px-1.5 py-[3px] ${TEXT}`}>
      <motion.i aria-hidden style={{ opacity: lit, background: `color-mix(in oklab, ${tint} 34%, transparent)` }} className="absolute inset-0 rounded-md" />
      <i aria-hidden className="relative h-1.5 w-1.5 rounded-full" style={{ background: tint }} />
      <motion.span style={{ color }} className="relative">
        {LEVELS[level].name}
      </motion.span>
    </span>
  );
}

function LevelsCell({ p }: { p: MV }) {
  return (
    <div className={CELL}>
      {LEVELS.map((l, i) => (
        <LevelChip key={l.name} p={p} level={i} at={LEVEL_AT[i]} />
      ))}
    </div>
  );
}

function WindowCell({ p }: { p: MV }) {
  const text = useTransform(p, windowRows);
  return (
    <div className={CELL}>
      <NodesIcon className="h-4 w-4 shrink-0 @min-[500px]:h-5 @min-[500px]:w-5" />
      <motion.span className={`${TEXT} tabular-nums text-dim`}>{text}</motion.span>
    </div>
  );
}

const TRAY_LEVELS = [1, 2] as const;

function TrayChip({ p, level, slot }: { p: MV; level: 1 | 2; slot: number }) {
  const t = useSeg(p, TL.tray[0] + slot * 0.008, TL.tray[1] + slot * 0.008, easeOutBack);
  const scale = useTransform(t, (v) => 0.85 + 0.15 * v);
  const dimmed = useTransform(p, (v): number => {
    const flying = QUIZ.some((q) => q.level === level && v > q.fly[0] && v < q.fly[1]);
    return flying ? 0.35 : 1;
  });
  const opacity = useTransform([t, dimmed], ([a, b]: number[]) => Math.min(1, a) * b);
  return (
    <motion.div
      style={{ opacity, scale, left: `calc(var(--tray-x) + ${slot} * (var(--chip-w) + ${TRAY_GAP_PX}px))` }}
      className="absolute top-1/2 -translate-y-1/2"
    >
      <QuizChip level={level} />
    </motion.div>
  );
}

function TrayCell({ p }: { p: MV }) {
  const label = useSeg(p, TL.tray[0], TL.tray[1]);
  return (
    <div className={`${CELL} relative`}>
      <motion.span style={{ opacity: label }} className={`${TEXT} uppercase tracking-[0.12em] text-mute`}>
        quiz
      </motion.span>
      {TRAY_LEVELS.map((lv, i) => (
        <TrayChip key={lv} p={p} level={lv} slot={i} />
      ))}
    </div>
  );
}

const SYNC_ICON = "h-5 w-5 @min-[500px]:h-6 @min-[500px]:w-6";

/* Sync state as a glyph: the arrows spin while caching, a tick when done, the device once offline. */
function SyncCell({ p }: { p: MV }) {
  const turn = useTransform(p, (v) => keyframes(v, [TL.ring[0], TL.ring[1]], [0, 720], easeInOutCubic));
  const state = useKeys(p, [TL.ring[1] - 0.004, TL.ring[1] + 0.004, TL.swap[0], TL.swap[1]], [0, 1, 1, 2]);
  return (
    <div className={CELL}>
      <Roller
        pos={state}
        cellClass={`${SYNC_ICON} justify-center`}
        className={`${SYNC_ICON} shrink-0`}
        items={[
          <motion.span key="a" style={{ rotate: turn }} className="grid place-items-center">
            <SceneIcon name="sync" size={64} className={SYNC_ICON} />
          </motion.span>,
          <span key="b" className="grid h-4 w-4 place-items-center rounded-full bg-mint text-[var(--color-pastel-ink)]">
            <CheckMark className="h-2.5 w-2.5" />
          </span>,
          <SceneIcon key="c" name="device-phone" size={64} className={SYNC_ICON} />,
        ]}
      />
      <Roller
        pos={state}
        cellClass="h-[18px]"
        className={`h-[18px] ${TEXT} leading-[18px]`}
        items={[
          <span key="a" className="text-dim">syncing 7 licensed variants</span>,
          <span key="b" className="text-fg">up to date</span>,
          <span key="c" className="text-fg">offline, reading from cache</span>,
        ]}
      />
    </div>
  );
}

const CELLS = 4;

export function DockStrip({ p }: { p: MV }) {
  const y = useTransform(p, (v) => {
    const pos = keyframes(v, TL.roll, [0, 1, 1, 2, 2, 3]);
    return `${((-pos * 100) / CELLS).toFixed(3)}%`;
  });
  return (
    <div className="relative overflow-hidden border-t border-line">
      <motion.div style={{ y }} className="flex flex-col">
        <LevelsCell p={p} />
        <WindowCell p={p} />
        <TrayCell p={p} />
        <SyncCell p={p} />
      </motion.div>
    </div>
  );
}
