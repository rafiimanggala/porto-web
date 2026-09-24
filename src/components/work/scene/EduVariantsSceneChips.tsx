"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CHIP, LICENSED, MID_X, SLOT, TL, VIEW_W, colX, type Variant } from "./EduVariantsSceneData";
import { useGeo } from "./EduVariantsSceneGeo";
import { LockIcon, TickMark } from "./EduVariantsSceneIcons";
import { chipStart, clamp01, flyStart, lerp, resolveAt, seg, tint } from "./EduVariantsSceneKit";

/* Variant chips. Each one slides out from behind the subject tile, shows its
   name, and in the last chapter either dims behind a padlock (not licensed) or
   flies down and widens into a row of the subject picker (licensed). */

const HALF_H = CHIP.h / 2;
const SLOT_CX = SLOT.x + SLOT.w / 2;
const FAN_DEG = 6;
const BADGE_R = 5.5;
const DIM_TO = 0.28;
/* A flying chip first slides sideways above the card, then drops, then widens, so it never sweeps over the card's header text. */
const SIDE_END = 0.5;
const DROP_FROM = 0.12;
const GROW_FROM = 0.66;

function useFlight(p: MV, k: number): MV {
  return useTransform(p, (v) => (k < 0 ? 0 : seg(v, flyStart(k), flyStart(k) + TL.fly.dur)));
}

function ChipLabel({ v, show, size }: { v: Variant; show: MV; size: MV }) {
  const fs = useGeo().fs.s;
  const baseline = useTransform(size, (s) => s * 0.36);
  if (v.lines.length === 1) {
    return (
      <motion.text x={0} y={baseline} textAnchor="middle" style={{ opacity: show, fontSize: size, fontWeight: 500 }} className="fill-fg">
        {v.lines[0]}
      </motion.text>
    );
  }
  return (
    <motion.g style={{ opacity: show }} className="fill-fg" fontSize={fs} fontWeight={500}>
      <text x={0} y={-fs * 0.24} textAnchor="middle">{v.lines[0]}</text>
      <text x={0} y={fs * 0.95} textAnchor="middle">{v.lines[1]}</text>
    </motion.g>
  );
}

function LandedRow({ v, w, detail, pick }: { v: Variant; w: MV; detail: MV; pick?: MV }) {
  const fs = useGeo().fs.s;
  const dotX = useTransform(w, (s) => -s / 2 + 20);
  const topicsX = useTransform(w, (s) => s / 2 - 14);
  return (
    <motion.g style={{ opacity: detail }}>
      <motion.circle cx={dotX} cy={0} r={6} strokeWidth={1.5} style={{ stroke: v.color, fill: tint(v.color, 30) }} />
      {pick ? <motion.circle cx={dotX} cy={0} r={3.2} style={{ opacity: pick }} className="fill-accent" /> : null}
      <motion.text x={topicsX} y={fs * 0.35} textAnchor="end" fontSize={fs} className={`${MONO} fill-mute`}>
        {`${v.topics} topics`}
      </motion.text>
    </motion.g>
  );
}

function ChipBadge({ v, res, fly, w }: { v: Variant; res: MV; fly: MV; w: MV }) {
  const x = useTransform(w, (s) => s / 2 - 3);
  const opacity = useTransform([res, fly], ([r, f]: number[]) => r * (1 - clamp01(f * 4)));
  return (
    <motion.g style={{ x, y: HALF_H - 1, opacity }}>
      {v.licensed ? (
        <>
          <circle r={BADGE_R} strokeWidth={1.3} style={{ fill: "var(--color-surface-1)", stroke: "var(--color-mint)" }} />
          <g transform="scale(0.85)">
            <TickMark />
          </g>
        </>
      ) : (
        <g transform="scale(0.72)">
          <LockIcon />
        </g>
      )}
    </motion.g>
  );
}

/* Where a licensed chip used to sit: a dashed slot with a faint arrow that
   points down at the picker the chip flew into. */
function HolderSlot({ cx, holder }: { cx: number; holder: MV }) {
  const { chipY } = useGeo();
  return (
    <motion.g style={{ opacity: holder }} transform={`translate(${cx} ${chipY})`}>
      <rect x={-CHIP.w / 2} y={-HALF_H} width={CHIP.w} height={CHIP.h} rx={6} strokeWidth={1.2} strokeDasharray="3 3" fill="none" className="stroke-line-strong" />
      <path d="M0 -6V5M-4.5 0.5L0 5L4.5 0.5" fill="none" strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" className="stroke-mute" />
    </motion.g>
  );
}

export function Chip({ p, v, i }: { p: MV; v: Variant; i: number }) {
  const G = useGeo();
  const cx = colX(i);
  const k = LICENSED.indexOf(i);
  const a = chipStart(i);
  const out = useSeg(p, a, a + TL.chip.dur);
  const lift = useSeg(p, TL.lift[0], TL.lift[1], easeInOutCubic);
  const show = useSeg(p, a + TL.chip.labelLag, a + TL.chip.labelLag + TL.chip.labelDur);
  const res = useSeg(p, resolveAt(i) - 0.006, resolveAt(i) + 0.014);
  const detail = useSeg(p, TL.detail[0], TL.detail[1]);
  const pick = useSeg(p, TL.pick[0], TL.pick[1]);
  const fly = useFlight(p, k);

  const x = useTransform([out, fly], ([o, f]: number[]) => lerp(lerp(MID_X, cx, easeInOutCubic(o)), SLOT_CX, seg(f, 0, SIDE_END, easeOutCubic)));
  const rowY = k < 0 ? 0 : G.slotTops[k] + SLOT.h / 2;
  const y = useTransform([out, lift, fly], ([o, l, f]: number[]) => {
    const start = lerp(G.bigY, G.rootY, l);
    return lerp(lerp(start, G.chipY, easeOutCubic(o)), rowY, seg(f, DROP_FROM, 1, easeInOutCubic));
  });
  const rotate = useTransform(out, (o) => Math.sin(Math.PI * o) * (i - 3) * FAN_DEG);
  const grow = useTransform(fly, (f) => seg(f, GROW_FROM, 1, easeInOutCubic));
  const w = useTransform(grow, (g) => lerp(CHIP.w, SLOT.w, g));
  const h = useTransform(grow, (g) => lerp(CHIP.h, SLOT.h, g));
  const left = useTransform(w, (s) => -s / 2);
  const top = useTransform(h, (s) => -s / 2);
  const size = useTransform(grow, (g) => lerp(G.fs.s, G.fs.l, g));
  const dim = useTransform(res, (r) => (v.licensed ? 1 : 1 - (1 - DIM_TO) * r));
  const stripe = useTransform(fly, (f) => 1 - clamp01(f * 5));
  const holder = useTransform(fly, (f) => clamp01(f * 6));

  return (
    <>
      {v.licensed ? <HolderSlot cx={cx} holder={holder} /> : null}
      <motion.g style={{ x, y, rotate }}>
        <motion.g style={{ opacity: dim }}>
          <motion.rect x={left} y={top} width={w} height={h} rx={6} strokeWidth={1.2} className="fill-surface-2 stroke-line-strong" />
          <motion.rect x={-12} y={-15.5} width={24} height={2.5} rx={1.2} style={{ fill: v.color, opacity: stripe }} />
          <ChipLabel v={v} show={show} size={size} />
          {v.licensed ? <LandedRow v={v} w={w} detail={detail} pick={k === 0 ? pick : undefined} /> : null}
          {k === 0 ? (
            <motion.rect x={left} y={top} width={w} height={h} rx={6} fill="none" strokeWidth={1.8} style={{ opacity: pick }} className="stroke-accent" />
          ) : null}
        </motion.g>
        <ChipBadge v={v} res={res} fly={fly} w={w} />
      </motion.g>
    </>
  );
}

export function ScanEdge({ p }: { p: MV }) {
  const { chipY } = useGeo();
  const t = useSeg(p, TL.scan[0], TL.scan[1]);
  const x = useTransform(t, (v) => v * VIEW_W);
  const opacity = useTransform(t, [0, 0.03, 0.97, 1], [0, 1, 1, 0]);
  return (
    <motion.line
      x1={x}
      x2={x}
      y1={chipY - 26}
      y2={chipY + 26}
      strokeWidth={2}
      strokeLinecap="round"
      style={{ opacity }}
      className="stroke-accent"
    />
  );
}
