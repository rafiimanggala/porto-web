"use client";

import type { CSSProperties } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { SceneIcon } from "./SceneIcon";
import {
  CARD_QS,
  FEEDBACK,
  GRID_H,
  GRID_W,
  KEY_ALT,
  KEY_MAIN,
  Q41,
  Q43,
  STATUS,
  STATUS_COLOR,
  T,
  cellX,
  cellY,
  type QType,
} from "./EduQuizSceneData";
import { Controls } from "./EduQuizSceneControls";
import { KeyIcon, TypeGlyph } from "./EduQuizSceneIcons";
import { FlipBadge, HexBadge } from "./EduQuizSceneMapUI";
import { HexDot, MonoLabel, WipePages, lerp, segAt, useKeys } from "./EduQuizSceneKit";

/* The question card that opens out of the Q41 cell: one question at a time,
   whose head, stem and answer control change with the question type, then an
   answer key and the student feedback that fill their reserved slots. */

const CARD_VARS = {
  "--row": "clamp(22px, 5.2cqh, 42px)",
  "--pitch": "calc(var(--row) + clamp(3px, 0.6cqh, 6px))",
  "--headh": "clamp(26px, 4.6cqh, 36px)",
  "--stemh": "clamp(32px, 5.8cqh, 44px)",
  "--keyh": "clamp(28px, 5.2cqh, 42px)",
  "--fbh": "clamp(46px, 8.6cqh, 66px)",
} as CSSProperties;
const TYPES: readonly QType[] = ["single", "multi", "short"];
const OPEN_R_FROM = 8;
const OPEN_R_TO = 150;
const OPEN_HOLD = 0.004;
const CELL_FX = cellX(Q41) / GRID_W;
const CELL_FY = cellY(Q41) / GRID_H;

const HEAD_BADGE = "h-[26px] w-[23px] @[34rem]:h-[30px] @[34rem]:w-[26px]";

/* The badge carries the question's status colour. The last question is the one that gets reviewed, so its badge follows the pill. */
function HeadBadge({ idx, flip }: { idx: number; flip: MV }) {
  const color = STATUS_COLOR[STATUS[idx]];
  if (idx !== Q43) return <HexBadge n={idx + 1} color={color} className={HEAD_BADGE} />;
  return <FlipBadge n={idx + 1} from={color} to={STATUS_COLOR.reviewed} mix={flip} className={HEAD_BADGE} />;
}

function HeadPage({ i, flip }: { i: number; flip: MV }) {
  const q = CARD_QS[i];
  return (
    <div className="flex h-full items-center gap-2 pr-[96px]">
      <HeadBadge idx={q.idx} flip={flip} />
      <TypeGlyph type={TYPES[i]} className="h-4 w-4" />
      <span className="text-[12px] font-medium text-fg @[34rem]:text-[13px]">{q.type}</span>
    </div>
  );
}

function PillPage({ word, color }: { word: string; color: string }) {
  return (
    <span className={`flex h-full items-center justify-center gap-1.5 ${MONO} text-[10px] uppercase tracking-[0.1em] text-fg`}>
      <HexDot color={color} opacity={0.6} className="h-3 w-[10.4px]" />
      {word}
    </span>
  );
}

const PILL_PAGES = [<PillPage key="d" word="draft" color={STATUS_COLOR.draft} />, <PillPage key="r" word="reviewed" color={STATUS_COLOR.reviewed} />];

function Head({ p, pos }: { p: MV; pos: MV }) {
  const flip = useSeg(p, T.flip[0], T.flip[1]);
  const pages = CARD_QS.map((q, i) => <HeadPage key={q.idx} i={i} flip={flip} />);
  return (
    <div className="relative h-[var(--headh)] shrink-0">
      <WipePages pos={pos} pages={pages} className="h-full w-full" />
      <div className="absolute right-0 top-1/2 h-[22px] w-[92px] -translate-y-1/2 overflow-hidden rounded-full border border-line-strong bg-surface-2">
        <WipePages pos={flip} pages={PILL_PAGES} className="h-full w-full" />
      </div>
    </div>
  );
}

const STEM = "text-[12px] leading-[1.35] text-fg @[34rem]:text-[14px]";

function EmptySlot({ label, hint }: { label: string; hint: string }) {
  return (
    <div className="flex h-full items-center justify-between gap-2 rounded-md border border-dashed border-line-strong px-2.5">
      <MonoLabel>{label}</MonoLabel>
      <span className="truncate text-[11px] text-dim @[34rem]:text-[12px]">{hint}</span>
    </div>
  );
}

function KeyFilled() {
  return (
    <div className="flex h-full items-center gap-2 rounded-md border border-line-strong bg-surface-2 px-2">
      <KeyIcon className="h-5 w-5 @[34rem]:h-6 @[34rem]:w-6" />
      <MonoLabel>key</MonoLabel>
      <span className="rounded-[4px] bg-mint/25 px-1.5 py-0.5 text-[12px] leading-none text-fg @[34rem]:text-[13px]">{KEY_MAIN}</span>
      <span className="truncate text-[12px] text-dim @[34rem]:text-[13px]">or {KEY_ALT}</span>
    </div>
  );
}

function FeedbackFilled({ p }: { p: MV }) {
  const pop = useSeg(p, T.feedback[0] + 0.012, T.feedback[0] + 0.032, easeOutBack);
  const opacity = useTransform(pop, (v) => Math.min(1, v * 2));
  return (
    <div className="flex h-full items-center gap-2">
      <motion.span style={{ scale: pop, opacity }} className="shrink-0">
        <SceneIcon name="chat-bubble" size={44} className="h-9 w-9 @[34rem]:h-11 @[34rem]:w-11" />
      </motion.span>
      <p className="min-w-0 flex-1 rounded-xl rounded-bl-sm border border-line-strong bg-surface-2 px-2.5 py-1.5 text-[12px] leading-[1.35] text-fg @[34rem]:text-[13px]">
        {FEEDBACK}
      </p>
    </div>
  );
}

function Slots({ p }: { p: MV }) {
  const key = useSeg(p, T.key[0], T.key[1]);
  const fb = useSeg(p, T.feedback[0], T.feedback[1]);
  return (
    <div className="mt-auto flex flex-col gap-1.5 @[34rem]:gap-2">
      <WipePages pos={key} pages={[<EmptySlot key="e" label="answer key" hint="Not set yet" />, <KeyFilled key="f" />]} className="h-[var(--keyh)] shrink-0" />
      <WipePages pos={fb} pages={[<EmptySlot key="e" label="student feedback" hint="Not written yet" />, <FeedbackFilled key="f" p={p} />]} className="h-[var(--fbh)] shrink-0" />
    </div>
  );
}

/* Circle reveal that grows out of the Q41 cell in the map above. */
const openClip = (v: number) => {
  const done = v >= T.card[1] + OPEN_HOLD;
  const t = lerp(OPEN_R_FROM, OPEN_R_TO, easeOutCubic(Math.min(1, Math.max(0, (v - T.card[0]) / (T.card[1] - T.card[0])))));
  if (done) return "none";
  return `circle(${t.toFixed(2)}cqh at calc(var(--gw) * var(--mini) * ${CELL_FX.toFixed(4)}) calc(var(--gh) * var(--mini) * ${(-(1 - CELL_FY)).toFixed(4)} - 10px))`;
};

const CARD_BOX =
  "absolute inset-x-[var(--pad)] bottom-[var(--pad)] top-[calc(var(--pad)+var(--hdr)+var(--gap)+var(--gh)*var(--mini)+10px)]";

/* Dashed outline of the card. It only shows while the iris is opening, so the lower half is never an empty frame. */
export function CardOutline({ p }: { p: MV }) {
  const opacity = useTransform(p, (v) => segAt(v, T.card[0] - 0.002, T.card[0] + 0.004) * (1 - segAt(v, T.card[0] + 0.014, T.card[0] + 0.034)));
  return <motion.i aria-hidden style={{ opacity }} className={`${CARD_BOX} pointer-events-none rounded-xl border border-dashed border-line-strong`} />;
}

export function QuestionCard({ p }: { p: MV }) {
  const pos = useKeys(p, T.typeT, T.typeV);
  const clip = useTransform(p, openClip);
  return (
    <motion.div style={{ clipPath: clip, ...CARD_VARS }} className={CARD_BOX}>
      <div className="flex h-full flex-col gap-1.5 overflow-hidden rounded-xl border border-line-strong bg-surface-1 p-2 @[34rem]:gap-2 @[34rem]:p-3">
        <Head p={p} pos={pos} />
        <WipePages pos={pos} pages={CARD_QS.map((q) => <p key={q.idx} className={STEM}>{q.stem}</p>)} className="h-[var(--stemh)] shrink-0" />
        <Controls p={p} pos={pos} />
        <Slots p={p} />
      </div>
    </motion.div>
  );
}
