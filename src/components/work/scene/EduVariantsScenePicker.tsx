"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CARD, LICENSED, OTHER_SUBJECTS, SLOT, TL, VARIANTS, VIEW_W } from "./EduVariantsSceneData";
import { useGeo } from "./EduVariantsSceneGeo";
import { BookIcon, SchoolIcon } from "./EduVariantsSceneIcons";
import { flyStart, licensedAt, seg } from "./EduVariantsSceneKit";

/* Chapter four. A vertical wipe swaps the lower half of the stage from the
   trees and the shared core to a subject picker card, with a school licence
   badge at the top. The variant chips fly into the card from above. */

const CARD_PAD = 14;
const BADGE_Y = 13;
const BADGE_H = 34;
const BADGE_RIGHT = 352;
const EDGE_BAND = 20;

export type WipeIds = { old: string; next: string; band: string; line: string };

function useWipe(p: MV): MV {
  return useSeg(p, TL.wipe[0], TL.wipe[1], easeInOutCubic);
}

/* The old lower half is clipped from the left as the wipe front moves right,
   the new one is revealed from the left behind it: never both at one place. The
   front is drawn as a soft trailing band plus a short line that fades at both
   ends, so it never reads as a hard rule cutting through the counters. */
export function WipeClips({ p, ids }: { p: MV; ids: WipeIds }) {
  const { wipeTop, viewH } = useGeo();
  const t = useWipe(p);
  const front = useTransform(t, (v) => v * VIEW_W);
  const rest = useTransform(t, (v) => (1 - v) * VIEW_W);
  const height = viewH - wipeTop + 20;
  const accent = { stopColor: "var(--color-accent)" };
  return (
    <defs>
      <clipPath id={ids.old}>
        <motion.rect x={front} y={wipeTop} width={rest} height={height} />
      </clipPath>
      <clipPath id={ids.next}>
        <motion.rect x={0} y={wipeTop} width={front} height={height} />
      </clipPath>
      <linearGradient id={ids.band} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" style={{ ...accent, stopOpacity: 0 }} />
        <stop offset="1" style={{ ...accent, stopOpacity: 0.3 }} />
      </linearGradient>
      <linearGradient id={ids.line} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" style={{ ...accent, stopOpacity: 0 }} />
        <stop offset="0.3" style={{ ...accent, stopOpacity: 0.95 }} />
        <stop offset="0.7" style={{ ...accent, stopOpacity: 0.95 }} />
        <stop offset="1" style={{ ...accent, stopOpacity: 0 }} />
      </linearGradient>
    </defs>
  );
}

export function WipeEdge({ p, ids }: { p: MV; ids: WipeIds }) {
  const { wipeTop, viewH } = useGeo();
  const t = useWipe(p);
  const x = useTransform(t, (v) => v * VIEW_W);
  const opacity = useTransform(t, [0, 0.06, 0.9, 1], [0, 1, 1, 0]);
  const top = wipeTop + 12;
  const height = viewH - top - 8;
  return (
    <motion.g style={{ x, opacity }}>
      <rect x={-EDGE_BAND} y={top} width={EDGE_BAND} height={height} fill={`url(#${ids.band})`} />
      <rect x={-0.9} y={top} width={1.8} height={height} fill={`url(#${ids.line})`} />
    </motion.g>
  );
}

export function SchoolBadge({ p }: { p: MV }) {
  const { fs } = useGeo();
  const t = useSeg(p, TL.badge[0], TL.badge[1], easeOutCubic);
  const y = useTransform(t, (v) => (1 - v) * -12);
  const w = Math.round(38 + 6 * fs.s);
  const x = BADGE_RIGHT - w;
  return (
    <motion.g style={{ y, opacity: t }}>
      <rect x={x} y={BADGE_Y} width={w} height={BADGE_H} rx={8} className="fill-surface-2 stroke-line-strong" />
      <g transform={`translate(${x + 17} ${BADGE_Y + BADGE_H / 2}) scale(0.9)`}>
        <SchoolIcon />
      </g>
      <text x={x + 33} y={BADGE_Y + fs.s * 1.3} fontSize={fs.s} className={`${MONO} fill-fg`}>
        School 412
      </text>
      <text x={x + 33} y={BADGE_Y + fs.s * 2.4} fontSize={fs.s} className={`${MONO} fill-mute`}>
        of 995
      </text>
    </motion.g>
  );
}

function SubjectRow({ name, note, top }: { name: string; note: string; top: number }) {
  const { fs } = useGeo();
  const cy = top + 12;
  return (
    <g>
      <rect x={SLOT.x} y={top} width={SLOT.w} height={24} rx={6} className="fill-surface-2/60 stroke-line" />
      <path d={`M${SLOT.x + 13} ${cy - 3.5}L${SLOT.x + 17} ${cy}L${SLOT.x + 13} ${cy + 3.5}`} fill="none" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="stroke-mute" />
      <text x={SLOT.x + 28} y={cy + fs.m * 0.35} fontSize={fs.m} className="fill-dim">
        {name}
      </text>
      <text x={SLOT.x + SLOT.w - 12} y={cy + fs.s * 0.35} textAnchor="end" fontSize={fs.s} className={`${MONO} fill-mute`}>
        {note}
      </text>
    </g>
  );
}

/* An empty row of the picker. It is dashed until the chip bound for it lands,
   then it fades away and the chip's own solid border takes over. */
function SlotFrame({ p, k, top }: { p: MV; k: number; top: number }) {
  const end = flyStart(k) + TL.fly.dur;
  const opacity = useTransform(p, (v) => 1 - seg(v, end - 0.012, end));
  return (
    <motion.rect
      x={SLOT.x}
      y={top}
      width={SLOT.w}
      height={SLOT.h}
      rx={6}
      fill="none"
      strokeWidth={1.2}
      strokeDasharray="3 3"
      style={{ opacity }}
      className="stroke-line-strong"
    />
  );
}

export function PickerCard({ p }: { p: MV }) {
  const G = useGeo();
  const licensed = useTransform(p, (v) => `${licensedAt(v)} of ${VARIANTS.length} licensed`);
  const right = CARD.x + CARD.w - CARD_PAD - 8;
  return (
    <g>
      <rect x={CARD.x} y={G.cardY} width={CARD.w} height={G.cardH} rx={12} className="fill-surface-1 stroke-line-strong" />
      <text x={CARD.x + CARD_PAD + 8} y={G.cardY + 10 + G.fs.s} fontSize={G.fs.s} className={`${MONO} fill-mute uppercase tracking-[0.14em]`}>
        Subject picker
      </text>
      <path d={`M${CARD.x} ${G.cardY + 32}H${CARD.x + CARD.w}`} className="stroke-line" />
      <g transform={`translate(${SLOT.x + 12} ${G.bioCy}) scale(0.85)`}>
        <BookIcon />
      </g>
      <text x={SLOT.x + 30} y={G.bioCy + G.fs.l * 0.37} fontSize={G.fs.l} className="fill-fg font-semibold">
        Biology
      </text>
      <motion.text x={right} y={G.bioCy + G.fs.s * 0.35} textAnchor="end" fontSize={G.fs.s} className={`${MONO} fill-mute tabular-nums`}>
        {licensed}
      </motion.text>
      {LICENSED.map((_, k) => (
        <SlotFrame key={k} p={p} k={k} top={G.slotTops[k]} />
      ))}
      {OTHER_SUBJECTS.map((s, j) => (
        <SubjectRow key={s.name} name={s.name} note={s.note} top={G.subjectTops[j]} />
      ))}
    </g>
  );
}
