"use client";

import { motion, useTransform, type MotionStyle } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { ATTACH_AT, ATTACH_LEN, CITE_AT, DRAW_LEN, LIGHT_LEN, MARKERS, SOURCES, T, USE_FALL, USE_RISE, USE_SPANS, type Marker, type Source, type Span } from "./ChatSceneData";
import { LABEL, Reticle, Spark, clamp01 } from "./ChatSceneParts";
import { EvidenceSourceIcon, SourceIcon } from "./ChatSceneIcons";

const CARD = "relative min-w-0 overflow-hidden rounded-lg border border-line bg-surface-2";
const pulse = (v: number, s: Span) => clamp01((v - s[0]) / USE_RISE) * (1 - clamp01((v - s[1]) / USE_FALL));
const flash = (l: number) => (l <= 0 || l >= 1 ? 0 : l < 0.35 ? l / 0.35 : (1 - l) / 0.65);
/* Narrow layout: the tray is tall while it lists what was sent, then compacts to a citation strip. */
const TRAY_TALL = 224;
const TRAY_SHORT = 104;
/* Unattached cards stay readable (3:1 or better); the dot and the bar carry the pending state. */
const REST_OPACITY = 0.88;
const CARD_STROKE = "[stroke-width:2] @[30rem]:[stroke-width:1.4]";

function ContextCard({ p, src, a }: { p: MV; src: Source; a: number }) {
  const t = useSeg(p, a, a + ATTACH_LEN);
  const fill = useSeg(p, a, a + ATTACH_LEN, easeOutCubic);
  const body = useTransform(t, (v) => REST_OPACITY + (1 - REST_OPACITY) * v);
  const dot = useTransform(t, (v) => 0.25 + 0.75 * v);
  return (
    <motion.div style={{ opacity: body }} className={`${CARD} flex flex-col justify-between p-1.5 @[30rem]:p-3`}>
      <div>
        <div className="flex items-center gap-1.5 text-[11px] text-fg @[30rem]:text-[13px]">
          <SourceIcon src={src} t={t} />
          <motion.i style={{ opacity: dot, background: src.color }} className="hidden h-2 w-2 shrink-0 rounded-full @[30rem]:block" />
          <span className="truncate">{src.name}</span>
          <span className={`${MONO} ml-auto shrink-0 text-[10px] text-dim @[30rem]:hidden`}>{src.note}</span>
        </div>
        <p className={`${MONO} mt-0.5 hidden ${LABEL} text-dim @[30rem]:block`}>{src.note}</p>
        <p className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-dim @[30rem]:line-clamp-none @[30rem]:text-[11.5px] @[40rem]:text-[12px]">{src.detail}</p>
      </div>
      <div className="h-[3px] rounded-full bg-line-strong">
        <motion.div style={{ scaleX: fill, background: src.color }} className="h-full origin-left rounded-full" />
      </div>
    </motion.div>
  );
}

function EvidenceValue({ m, lit }: { m: Marker; lit: MV }) {
  const front = useTransform(lit, [0.08, 0.92], [0, 100], { clamp: true });
  const valClip = useTransform(front, (f) => `inset(0 ${(100 - f).toFixed(2)}% 0 0)`);
  const skelClip = useTransform(front, (f) => `inset(0 0 0 ${f.toFixed(2)}%)`);
  const edgeLeft = useTransform(front, (f) => `${f.toFixed(2)}%`);
  const edgeOp = useTransform(lit, [0.02, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return (
    <div className="relative h-[28px] @[30rem]:h-[34px] @[40rem]:h-[40px]">
      <motion.div style={{ clipPath: valClip }} className="absolute inset-0 flex items-end gap-1">
        <span className="t-hero text-[24px] leading-none @[30rem]:text-[26px] @[40rem]:text-[32px]">{m.value}</span>
        <span className="pb-px text-[10px] leading-none text-dim @[30rem]:pb-1 @[30rem]:text-[11px]">{m.unit}</span>
      </motion.div>
      <motion.div style={{ clipPath: skelClip }} className="absolute inset-0 flex items-center">
        <i className="h-2.5 w-2/3 rounded bg-line-strong" />
      </motion.div>
      <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOp }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
      <EvidenceSourceIcon m={m} lit={lit} />
    </div>
  );
}

function EvidenceCard({ p, m }: { p: MV; m: Marker }) {
  const a = CITE_AT[m.key];
  const lit = useSeg(p, a, a + LIGHT_LEN);
  const draw = useSeg(p, a, a + DRAW_LEN, easeOutCubic);
  const focus = useSeg(p, T.focus[0], T.focus[1]);
  const settle = useSeg(p, T.settle[0], T.settle[1]);
  const isFocus = m.key === "vitd";
  const use = useTransform(p, (v) => USE_SPANS[m.key].reduce((mx, s) => Math.max(mx, pulse(v, s)), 0));
  const wrap = useTransform([focus, use, settle], ([f, u, s]: number[]) => {
    const base = isFocus ? 1 : 1 - 0.55 * f;
    return base + (1 - base) * Math.max(u, s);
  });
  const bump = useTransform(use, (u) => 1 + 0.025 * u);
  const focusRing = useTransform([focus, settle], ([f, s]: number[]) => (isFocus ? f * (1 - s) : 0));
  const label = useTransform(lit, (v) => 0.55 + 0.45 * v);
  const ring = useTransform([lit, use], ([l, u]: number[]) => Math.max(flash(l), u));
  return (
    <motion.div style={{ opacity: wrap, scale: bump }} className="relative min-w-0">
      <div className={`${CARD} flex h-full flex-col justify-between p-1.5 @[30rem]:p-3`}>
        <motion.div style={{ opacity: label }} className="flex items-center justify-between gap-1">
          <span className={`${MONO} flex min-w-0 items-center gap-1.5 ${LABEL} uppercase text-dim`}>
            <i className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: m.color }} />
            <span className="truncate">{m.label}</span>
          </span>
          <b className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full text-[10px] font-medium leading-none text-bg" style={{ background: m.color }}>
            {m.index}
          </b>
        </motion.div>
        <EvidenceValue m={m} lit={lit} />
        <p className={`${MONO} hidden text-[11px] leading-snug text-dim @[40rem]:block @[40rem]:text-[12px] [@container(max-height:600px)]:!hidden`}>
          {m.status}
          <br />
          {m.source}
        </p>
        <div className="relative">
          <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-line" />
          <Spark t={draw} series={m.series} color={m.color} className="h-6 @[30rem]:h-[30px]" strokeClass={CARD_STROKE} />
        </div>
      </div>
      <motion.i aria-hidden style={{ opacity: ring }} className="pointer-events-none absolute inset-0 rounded-lg border border-accent" />
      <motion.i aria-hidden style={{ opacity: focusRing }} className="pointer-events-none absolute inset-0 rounded-lg border-2 border-accent" />
      <Reticle t={lit} />
    </motion.div>
  );
}

function RailTitle({ p }: { p: MV }) {
  const t = useSeg(p, T.swap[0], T.swap[1], easeInOutCubic);
  const first = useTransform(t, (v) => (v <= 0 ? "none" : `inset(0 0 0 ${(v * 100).toFixed(2)}%)`));
  const second = useTransform(t, (v) => (v >= 1 ? "none" : `inset(0 ${((1 - v) * 100).toFixed(2)}% 0 0)`));
  const edge = useTransform(t, (v) => `${(v * 100).toFixed(2)}%`);
  const edgeOp = useTransform(t, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const cls = `${MONO} absolute inset-0 flex items-center whitespace-nowrap ${LABEL} uppercase tracking-[0.12em] @[40rem]:tracking-[0.08em]`;
  return (
    <div className="relative hidden h-4 @[30rem]:block">
      <motion.span style={{ clipPath: first }} className={`${cls} text-dim`}>
        sent with question
      </motion.span>
      <motion.span style={{ clipPath: second }} className={`${cls} text-fg`}>
        cited evidence
      </motion.span>
      <motion.i aria-hidden style={{ left: edge, opacity: edgeOp }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
    </div>
  );
}

export function Rail({ p }: { p: MV }) {
  const sw = useSeg(p, T.swap[0], T.swap[1], easeInOutCubic);
  const ctxClip = useTransform(sw, (v) => (v <= 0 ? "none" : `inset(${(v * 100).toFixed(2)}% 0 0 0)`));
  const evClip = useTransform(sw, (v) => (v >= 1 ? "none" : `inset(0 0 ${((1 - v) * 100).toFixed(2)}% 0)`));
  const edgeTop = useTransform(sw, (v) => `${(v * 100).toFixed(2)}%`);
  const edgeOp = useTransform(sw, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const trayH = useTransform(sw, (v) => `${(TRAY_TALL + (TRAY_SHORT - TRAY_TALL) * v).toFixed(1)}px`);
  return (
    <div className="flex h-full flex-col gap-2 p-1.5 @[30rem]:p-3">
      <RailTitle p={p} />
      <motion.div style={{ "--tray-h": trayH } as MotionStyle} className="relative h-[var(--tray-h)] @[30rem]:h-auto @[30rem]:min-h-0 @[30rem]:flex-1">
        <motion.div style={{ clipPath: ctxClip }} className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-1.5 @[30rem]:grid-cols-1 @[30rem]:grid-rows-4 @[30rem]:gap-2">
          {SOURCES.map((s, i) => (
            <ContextCard key={s.key} p={p} src={s} a={ATTACH_AT[i]} />
          ))}
        </motion.div>
        <motion.div style={{ clipPath: evClip }} className="absolute inset-0 grid grid-cols-3 gap-1.5 @[30rem]:grid-cols-1 @[30rem]:grid-rows-3 @[30rem]:gap-2">
          {MARKERS.map((m) => (
            <EvidenceCard key={m.key} p={p} m={m} />
          ))}
        </motion.div>
        <motion.i aria-hidden style={{ top: edgeTop, opacity: edgeOp }} className="pointer-events-none absolute inset-x-0 h-0.5 -translate-y-1/2 rounded-full bg-accent" />
      </motion.div>
    </div>
  );
}
