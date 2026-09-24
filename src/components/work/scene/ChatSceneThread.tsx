"use client";

import { Fragment } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import {
  ANSWER,
  ANSWER_SLOTS,
  ATTACH_AT,
  ATTACH_LEN,
  CHART_MARKS,
  FOCUS_ANSWER,
  FOCUS_FOLLOWUPS,
  FOCUS_QUESTION,
  FADE_QUICK,
  FOCUS_SLOTS,
  FOLLOW_POP,
  FOLLOWUPS,
  type Followup,
  MARKER_BY_KEY,
  MONTHS,
  QUESTION,
  SOURCES,
  T,
  type Slot,
  type Span,
  type Tok,
} from "./ChatSceneData";
import { CiteChip, LABEL, MarkerDot, Spark, TypingBubble, Word } from "./ChatSceneParts";
import { FollowIcon } from "./ChatSceneIcons";

const THREAD_PAD = "px-3 pb-2 pt-2.5 @[30rem]:px-5 @[30rem]:pb-4 @[30rem]:pt-5";
const BODY_TEXT = "text-[13px] leading-[1.55] @[30rem]:text-[15.5px] @[30rem]:leading-[1.65]";
const FLOW = "flex flex-col gap-2 @[30rem]:gap-4";
const NO_TAP: Span = [2, 3];
const CHART_STROKE = "[stroke-width:0.7] @[30rem]:[stroke-width:0.55]";
const CHART_H = "h-[72px] @[30rem]:h-[92px] [@container(min-width:30rem)_and_(min-height:600px)]:h-[128px]";

function EmptyState({ p }: { p: MV }) {
  const opacity = useTransform(p, [T.send[0], T.send[0] + FADE_QUICK], [1, 0]);
  const y = useTransform(opacity, (v) => (1 - v) * -8);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
      <span className="t-h3 text-[17px] @[30rem]:text-[22px]">Ask about your results.</span>
      <span className={`${MONO} ${LABEL} uppercase tracking-[0.12em] text-dim`}>4 sources connected</span>
    </motion.div>
  );
}

function UserBubble({ p, text, span }: { p: MV; text: string; span: Span }) {
  const t = useSeg(p, span[0], span[1], easeOutCubic);
  const y = useTransform(t, (v) => (1 - v) * 14);
  const scale = useTransform(t, (v) => 0.94 + 0.06 * v);
  return (
    <motion.div
      style={{ opacity: t, y, scale }}
      className="ml-auto max-w-[84%] origin-bottom-right rounded-2xl rounded-br-sm border border-line bg-surface-2 px-2.5 py-1.5 text-[12px] leading-snug text-fg @[30rem]:px-3 @[30rem]:py-2 @[30rem]:text-[14.5px]"
    >
      {text}
    </motion.div>
  );
}

function SentLine({ p }: { p: MV }) {
  const opacity = useSeg(p, T.bubble[0] + 0.01, T.bubble[1]);
  const text = useTransform(p, (v) => `sent with ${ATTACH_AT.filter((a) => v >= a + ATTACH_LEN / 2).length} of ${SOURCES.length} sources`);
  return (
    <motion.p style={{ opacity }} className={`-mt-1 ml-auto flex items-center gap-1.5 ${MONO} ${LABEL} tabular-nums text-dim`}>
      <span className="flex items-center gap-[3px]">
        {SOURCES.map((s, i) => (
          <SentDot key={s.key} p={p} color={s.color} a={ATTACH_AT[i]} />
        ))}
      </span>
      <motion.span>{text}</motion.span>
    </motion.p>
  );
}

function SentDot({ p, color, a }: { p: MV; color: string; a: number }) {
  const t = useSeg(p, a, a + ATTACH_LEN);
  const opacity = useTransform(t, (v) => 0.2 + 0.8 * v);
  return <motion.i style={{ opacity, background: color }} className="h-1.5 w-1.5 rounded-full" />;
}

function AssistantLabel({ p, a, tail }: { p: MV; a: number; tail?: string }) {
  const opacity = useSeg(p, a, a + 0.01);
  return (
    <motion.div style={{ opacity }} className={`flex items-center gap-2 ${MONO} ${LABEL} uppercase tracking-[0.12em] text-dim`}>
      <i className="h-1.5 w-1.5 rounded-full bg-accent" />
      <span>assistant{tail ? ` / ${tail}` : ""}</span>
    </motion.div>
  );
}

function Answer({ p, toks, slots, span, dots }: { p: MV; toks: readonly Tok[]; slots: readonly Slot[]; span: Span; dots: Span }) {
  const bar = useSeg(p, span[0], span[1]);
  const rule = useSeg(p, span[0], span[0] + 0.01);
  return (
    <div className="relative pl-3">
      <TypingBubble p={p} span={dots} />
      <motion.span aria-hidden style={{ opacity: rule }} className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-line-strong" />
      <motion.span aria-hidden style={{ scaleY: bar }} className="absolute inset-y-0 left-0 w-0.5 origin-top rounded-full bg-accent" />
      <p className={`${BODY_TEXT} text-fg`}>
        {toks.map((tok, i) => (
          <Fragment key={i}>
            {tok.kind === "w" ? <Word p={p} text={tok.text} a={slots[i].a} /> : <CiteChip p={p} marker={tok.marker} a={slots[i].a} />}{" "}
          </Fragment>
        ))}
      </p>
    </div>
  );
}

function CitedFooter({ p }: { p: MV }) {
  const t = useSeg(p, T.cited[0], T.cited[1], easeOutCubic);
  const y = useTransform(t, (v) => (1 - v) * 6);
  return (
    <motion.div style={{ opacity: t, y }} className={`flex items-center gap-2 pl-3 ${MONO} ${LABEL} uppercase tracking-[0.1em] text-dim`}>
      <span className="flex items-center gap-1">
        {(["hrv", "vitd", "ldl"] as const).map((k) => (
          <MarkerDot key={k} color={MARKER_BY_KEY[k].color} />
        ))}
      </span>
      <span>3 markers cited, 4 sources read</span>
    </motion.div>
  );
}

function FollowChip({ p, item, a, tap }: { p: MV; item: Followup; a: number; tap?: Span }) {
  const t = useSeg(p, a, a + FOLLOW_POP, easeOutCubic);
  const y = useTransform(t, (v) => (1 - v) * 8);
  const [ta, tb] = tap ?? NO_TAP;
  const press = useSeg(p, ta, tb);
  const fill = useTransform(press, (v) => (v < 1 ? v : 1));
  const scale = useTransform(press, [0, 0.35, 0.7, 1], [1, 0.95, 1.02, 1]);
  const vis = item.wideOnly ? "hidden @[30rem]:block" : "";
  return (
    <motion.span
      style={{ opacity: t, y, scale }}
      className={`relative overflow-hidden rounded-full border border-line-strong bg-surface-2 px-2.5 py-1 text-[11.5px] text-fg @[30rem]:text-[13px] ${vis}`}
    >
      <motion.i aria-hidden style={{ scaleX: fill }} className="absolute inset-0 origin-left bg-accent" />
      <span className="relative">{item.label}</span>
    </motion.span>
  );
}

function FollowRow({ p, items, span, tapFirst }: { p: MV; items: readonly Followup[]; span: Span; tapFirst?: boolean }) {
  const step = (span[1] - span[0]) / (items.length + 1);
  return (
    <div className="mt-auto flex items-start gap-1.5 pt-0.5">
      <FollowIcon p={p} a={span[0]} pop={FOLLOW_POP} />
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
        {items.map((it, i) => (
          <FollowChip key={it.label} p={p} item={it} a={span[0] + i * step} tap={tapFirst && i === 0 ? T.tap : undefined} />
        ))}
      </div>
    </div>
  );
}

export function GeneralThread({ p }: { p: MV }) {
  const push = useSeg(p, T.push[0], T.push[1], easeInOutCubic);
  const x = useTransform(push, (v) => `${-100 * v}%`);
  return (
    <motion.div style={{ x }} className={`absolute inset-0 ${FLOW} ${THREAD_PAD}`}>
      <EmptyState p={p} />
      <UserBubble p={p} text={QUESTION} span={T.bubble} />
      <SentLine p={p} />
      <AssistantLabel p={p} a={T.dots[0]} />
      <Answer p={p} toks={ANSWER} slots={ANSWER_SLOTS} span={T.stream} dots={T.dots} />
      <CitedFooter p={p} />
      <FollowRow p={p} items={FOLLOWUPS} span={T.chips} tapFirst />
    </motion.div>
  );
}

function FocusChart({ p }: { p: MV }) {
  const draw = useSeg(p, T.chart[0], T.chart[1], easeOutCubic);
  const m = MARKER_BY_KEY.vitd;
  return (
    <div className="rounded-lg border border-line bg-surface-2/60 px-2.5 pb-1.5 pt-1.5 @[30rem]:pb-2 @[30rem]:pt-2.5">
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[12px] text-fg @[30rem]:text-[14px]">
          <MarkerDot color={m.color} />
          {m.label} <span className="tabular-nums text-dim">{m.value} {m.unit}</span>
        </span>
        <span className={`${MONO} ${LABEL} uppercase tracking-[0.1em] text-dim`}>6 months</span>
      </div>
      <Spark
        t={draw}
        series={m.series}
        color={m.color}
        className={CHART_H}
        h={30}
        domain={[48, 74]}
        floor={{ v: 50, label: "50 low" }}
        marks={CHART_MARKS}
        strokeClass={CHART_STROKE}
      />
      <div className={`mt-1 hidden justify-between ${MONO} ${LABEL} text-dim @[30rem]:flex`}>
        {MONTHS.map((mo) => (
          <span key={mo}>{mo}</span>
        ))}
      </div>
    </div>
  );
}

export function FocusThread({ p }: { p: MV }) {
  const push = useSeg(p, T.push[0], T.push[1], easeInOutCubic);
  const x = useTransform(push, (v) => `${100 * (1 - v)}%`);
  const edge = useTransform(push, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return (
    <motion.div style={{ x }} className={`absolute inset-0 ${FLOW} ${THREAD_PAD}`}>
      <motion.i aria-hidden style={{ opacity: edge }} className="absolute inset-y-0 left-0 w-0.5 bg-accent" />
      <FocusChart p={p} />
      <UserBubble p={p} text={FOCUS_QUESTION} span={T.ask2} />
      <AssistantLabel p={p} a={T.dots2[0]} tail="vitamin D" />
      <Answer p={p} toks={FOCUS_ANSWER} slots={FOCUS_SLOTS} span={T.stream2} dots={T.dots2} />
      <FollowRow p={p} items={FOCUS_FOLLOWUPS} span={T.chips2} />
    </motion.div>
  );
}
