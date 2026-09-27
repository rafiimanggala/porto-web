"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { MEASURES, PRODUCT, formatMeasure, measureById, type MeasureId } from "./MtmKitData";
import { TONE_VAR, clamp01, mixColor } from "./MtmKitMath";
import { CHECKS_HEAD, NEW_RECORD, SAVE_LABELS, T } from "./MtmFitSceneData";
import { GateRow } from "./MtmFitSceneGate";
import { Reveal, Tag } from "./MtmFitSceneKit";

const LINE = "var(--color-line-strong)";
const TALL = "hidden @[520px]:[@media(min-height:820px)]:flex";
const CHIP_STEP = 0.006;
const PRESS_DIP = 0.04;

function NameField({ p }: { p: MV }) {
  const r = useSeg(p, T.name[0], T.name[1]);
  const ring = useTransform(r, (t) => (t > 0 && t < 1 ? TONE_VAR.accent : LINE));
  return (
    <div className="relative flex h-9 shrink-0 items-center gap-2.5 rounded-md bg-surface-2 px-2.5 @[520px]:h-10">
      <motion.i aria-hidden style={{ borderColor: ring }} className="pointer-events-none absolute inset-0 rounded-md border-2" />
      <span className={`${MONO} text-[10px] uppercase tracking-[0.12em] text-mute`}>{SAVE_LABELS.name}</span>
      <Reveal t={r} className="h-5 w-fit min-w-0 @[520px]:h-6">
        <span className="block whitespace-nowrap text-[13px] font-medium leading-5 text-fg @[520px]:text-[15px] @[520px]:leading-6">{NEW_RECORD.name}</span>
      </Reveal>
      <NextHint p={p} />
    </div>
  );
}

/* The first clone of the day exists, so the name that gets typed is the next free one: it ends in "(2)". */
function NextHint({ p }: { p: MV }) {
  const opacity = useSeg(p, T.name[1], T.name[1] + 0.015);
  return (
    <motion.span style={{ opacity }} className={`${MONO} ml-auto hidden whitespace-nowrap text-[11px] text-mute @[520px]:block`}>
      {SAVE_LABELS.next}
    </motion.span>
  );
}

const CHECKS_TOTAL = `${MEASURES.length}/${MEASURES.length} ${CHECKS_HEAD}`;

/* A slim header where the tall one does not fit, so the page never floats in blank space. */
function SlimHead() {
  return (
    <div className="flex shrink-0 items-center justify-between @[520px]:[@media(min-height:820px)]:hidden">
      <span className="text-[13px] font-medium leading-none text-fg">{SAVE_LABELS.head}</span>
      <span className={`${MONO} text-[10px] uppercase leading-none tracking-[0.1em] text-mute`}>{CHECKS_TOTAL}</span>
    </div>
  );
}

function SaveHead() {
  return (
    <div className={`${TALL} items-center gap-3`}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-surface-2">
        <MtmGlyph name="shirt" size={28} />
      </span>
      <div className="min-w-0">
        <p className="text-[14px] font-medium leading-tight text-fg">{SAVE_LABELS.head}</p>
        <p className={`${MONO} mt-0.5 text-[11px] text-mute`}>{PRODUCT.name}</p>
      </div>
      <Tag tone="sky">{PRODUCT.gender}</Tag>
      <span className={`${MONO} ml-auto text-[11px] uppercase tracking-[0.1em] text-mute`}>{CHECKS_TOTAL}</span>
    </div>
  );
}

function SummaryChip({ p, id, i }: { p: MV; id: MeasureId; i: number }) {
  const m = measureById(id);
  const a = T.checks[0] + i * CHIP_STEP;
  const t = useSeg(p, a, a + 0.02);
  const pop = useTransform(t, (v) => easeOutBack(clamp01(v)));
  return (
    <div className="relative rounded-md border border-line-strong bg-surface-1 px-2 py-1.5 @[520px]:px-3 @[520px]:py-2 @[520px]:[@media(min-height:820px)]:py-2.5">
      <motion.i aria-hidden style={{ opacity: t }} className="pointer-events-none absolute -inset-px rounded-md border-2 border-mint" />
      <p className={`${MONO} text-[10px] uppercase leading-none tracking-[0.1em] text-mute`}>{m.label}</p>
      <p className="mt-1 text-[12px] font-semibold leading-none text-fg @[520px]:text-[14px] @[520px]:[@media(min-height:820px)]:text-[16px]">{formatMeasure(m, m.sample)}</p>
      <motion.span style={{ scale: pop, opacity: t }} className="absolute right-1.5 top-1.5 block h-3.5 w-3.5">
        <MtmGlyph name="check" size="100%" />
      </motion.span>
    </div>
  );
}

const FACE = "absolute inset-0 flex items-center gap-2.5 px-3.5";
const LABEL = "text-[13px] font-semibold leading-none";
const TAG = `${MONO} ml-auto text-[10px] tracking-[0.12em]`;

function SaveButton({ p }: { p: MV }) {
  const press = useSeg(p, T.press[0], T.press[1]);
  const flip = useSeg(p, T.flip[0], T.flip[1], easeOutCubic);
  const scale = useTransform(press, (t) => 1 - PRESS_DIP * Math.sin(Math.PI * t));
  const ringScale = useTransform(press, (t) => 1 + 0.1 * t);
  const ringOpacity = useTransform(press, (t) => (t > 0 && t < 1 ? (1 - t) * 0.7 : 0));
  const idleClip = useTransform(flip, (f) => `inset(0 0 0 ${(f * 100).toFixed(2)}%)`);
  const doneClip = useTransform(flip, (f) => `inset(0 ${((1 - f) * 100).toFixed(2)}% 0 0)`);
  const edge = useTransform(flip, (f) => `${(f * 100).toFixed(2)}%`);
  const edgeOn = useTransform(flip, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  const border = useTransform(flip, (f) => mixColor(TONE_VAR.mint, f, TONE_VAR.accent));
  return (
    <div aria-hidden className="relative h-11 w-full shrink-0">
      <motion.i style={{ scale: ringScale, opacity: ringOpacity }} className="pointer-events-none absolute inset-0 rounded-lg border-2 border-accent" />
      <motion.div style={{ scale, borderColor: border }} className="absolute inset-0 overflow-hidden rounded-lg border bg-accent">
        <motion.div style={{ clipPath: idleClip }} className={`${FACE} bg-accent text-fg`}>
          <MtmGlyph name="save" size={20} />
          <span className={LABEL}>{SAVE_LABELS.idle}</span>
          <span className={`${TAG} uppercase`}>post</span>
        </motion.div>
        <motion.div style={{ clipPath: doneClip, background: mixColor(TONE_VAR.mint, 0.5, "var(--color-surface-1)") }} className={`${FACE} text-fg`}>
          <MtmGlyph name="check" size={20} />
          <span className={LABEL}>{SAVE_LABELS.done}</span>
          <span className={TAG}>{NEW_RECORD.id}</span>
        </motion.div>
        <motion.i aria-hidden style={{ left: edge, opacity: edgeOn }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-fg" />
      </motion.div>
    </div>
  );
}

export function SavePage({ p }: { p: MV }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-center gap-2 p-2.5 @[520px]:gap-3 @[520px]:p-4 @[520px]:[@media(min-height:820px)]:gap-4 @[520px]:[@media(min-height:820px)]:pb-[76px]">
      <SlimHead />
      <SaveHead />
      <NameField p={p} />
      <div className="grid shrink-0 grid-cols-3 gap-1.5 @[520px]:gap-2">
        {MEASURES.map((m, i) => (
          <SummaryChip key={m.id} p={p} id={m.id} i={i} />
        ))}
      </div>
      <SaveButton p={p} />
      <GateRow p={p} />
    </div>
  );
}
