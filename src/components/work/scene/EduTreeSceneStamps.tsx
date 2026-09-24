"use client";

import { motion, useTransform } from "framer-motion";
import { easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { COVER_ROWS, FRAME_PAD, QUIZ, TL } from "./EduTreeSceneData";
import { mix, pct } from "./EduTreeSceneMath";
import { QuizChip } from "./EduTreeSceneKit";

/* Chapter 3. A quiz chip is picked up from the tray, flies to a row and is stamped on it. The stamps
   live inside the tree window (rows sit at fixed slots then), the flights over the whole panel. */

type Quiz = (typeof QUIZ)[number];

const rowTop = (rel: number) => `calc(var(--row) * ${rel} + (var(--row) - var(--chip-h)) / 2)`;

function Stamp({ p, q }: { p: MV; q: Quiz }) {
  const t = useSeg(p, q.stamp[0], q.stamp[1], easeOutCubic);
  const on = useTransform(p, (v) => (v >= q.stamp[0] ? 1 : 0));
  const scale = useTransform(t, [0, 0.45], [1.3, 1], { clamp: true });
  const ringScale = useTransform(t, (v) => 1 + 0.32 * v);
  const ringOp = useTransform(t, [0, 0.08, 1], [0, 0.85, 0]);
  const flash = useTransform(t, [0, 0.2, 1], [0, 0.9, 0]);
  return (
    <>
      <motion.i
        aria-hidden
        style={{ opacity: flash, top: `calc(var(--row) * ${q.rel})` }}
        className="absolute inset-x-0 h-[var(--row)] bg-accent/30"
      />
      <div aria-hidden style={{ top: rowTop(q.rel) }} className="absolute right-1.5 z-10">
        <motion.i
          style={{ scale: ringScale, opacity: ringOp }}
          className="absolute inset-0 rounded-[5px] border-2 border-accent"
        />
        <motion.div style={{ opacity: on, scale }}>
          <QuizChip level={q.level} />
        </motion.div>
      </div>
    </>
  );
}

function Cover({ p }: { p: MV }) {
  const c = useSeg(p, TL.cover[0], TL.cover[1], easeInOutCubic);
  const clip = useTransform(c, (v) => `inset(0 0 ${pct(100 - v * 100)} 0)`);
  const edge = useTransform(c, (v) => `calc(var(--row) * ${(COVER_ROWS * v).toFixed(4)})`);
  const edgeOp = useTransform(c, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  const bar = useTransform(c, (v) => v);
  return (
    <>
      <motion.i
        aria-hidden
        style={{ clipPath: clip, height: `calc(var(--row) * ${COVER_ROWS})` }}
        className="absolute inset-x-0 top-0 bg-accent/10"
      />
      <motion.i
        aria-hidden
        style={{ scaleY: bar, height: `calc(var(--row) * ${COVER_ROWS})` }}
        className="absolute left-0 top-0 w-[3px] origin-top rounded-full bg-accent"
      />
      <motion.i aria-hidden style={{ top: edge, opacity: edgeOp }} className="absolute inset-x-0 h-px bg-accent" />
    </>
  );
}

export function Stamps({ p }: { p: MV }) {
  return (
    <>
      <Cover p={p} />
      {QUIZ.map((q) => (
        <Stamp key={q.rel} p={p} q={q} />
      ))}
    </>
  );
}

const TRAY_GAP = 6;
const BORDER = 1;
/* Frame padding edge to badge: frame border plus the right inset of the stamp. */
const STAMP_INSET = 7;

function Flight({ p, q, slot }: { p: MV; q: Quiz; slot: 0 | 1 }) {
  const t = useSeg(p, q.fly[0], q.fly[1]);
  const startX = `var(--tray-x) + ${slot} * (var(--chip-w) + ${TRAY_GAP}px) + ${BORDER}px`;
  const endX = `100% - ${FRAME_PAD}px - var(--chip-w) - ${STAMP_INSET}px`;
  const startY = `100% - var(--dock) / 2 - var(--chip-h) / 2`;
  const endY = `${BORDER}px + var(--top) + var(--info) + var(--gtop) + ${rowTop(q.rel)}`;
  const left = useTransform(t, (v) => mix(startX, endX, easeInOutCubic(v)));
  const top = useTransform(t, (v) => mix(startY, endY, easeOutCubic(v)));
  const opacity = useTransform(t, (v) => (v > 0 && v < 1 ? 1 : 0));
  const scale = useTransform(t, (v) => 1 + 0.14 * Math.sin(Math.PI * v));
  return (
    <motion.div aria-hidden style={{ left, top, opacity, scale }} className="pointer-events-none absolute z-30 will-change-transform">
      <QuizChip level={q.level} />
    </motion.div>
  );
}

export function Flights({ p }: { p: MV }) {
  return (
    <>
      {QUIZ.map((q) => (
        <Flight key={q.fly[0]} p={p} q={q} slot={q.level === 1 ? 0 : 1} />
      ))}
    </>
  );
}
