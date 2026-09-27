"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { MeasureField, useMeasureStatus } from "./MtmKitCards";
import { MtmGlyph } from "./MtmKitGlyphs";
import type { Measure } from "./MtmKitData";
import { clamp01, lerp, mixColor, segAt } from "./MtmKitMath";
import { ACTION_H, DIFF_TEXT, EDIT, EDIT_FIELDS, FIELD_GAP, FIELD_H, SAVE_LABEL, T } from "./MtmEditorSceneData";
import { FoldBox, Pointer, bell, inWindows } from "./MtmEditorSceneKit";

/* The inline editor: four measurement fields that fade in one by one, one of them nudged, and the action bar with Save As New. */

const FOCUSED = 0.998;

/* Half linear, half sine: the nudge keeps moving from its first to its last frame, so scrubbing through it never reads as a hold. */
const softInOut = (t: number) => 0.5 * t + 0.25 * (1 - Math.cos(Math.PI * t));

function EditorField({ m, i, p }: { m: Measure; i: number; p: MV }) {
  const edited = m.id === EDIT.id;
  const a = T.fields.from + T.fields.step * i;
  const enter = useSeg(p, a, a + T.fields.dur, easeOutCubic);
  const scale = useTransform(enter, (v) => 0.97 + 0.03 * v);
  const value = useTransform(p, (v): number => (edited ? lerp(EDIT.from, EDIT.to, segAt(v, T.nudge[0], T.nudge[1], softInOut)) : m.sample));
  const armed = useSeg(p, T.ok[0], T.ok[1]);
  const status = useMeasureStatus(value, [m.min, m.max], edited ? armed : 0);
  const reveal = useTransform(p, (v): number => (edited && v > T.focus[0] && v < T.focus[1] ? FOCUSED : 1));
  return (
    <motion.div style={{ opacity: enter, scale }} className="origin-top">
      <MeasureField label={m.label} unit={m.unit} value={value} range={[m.min, m.max]} status={status} reveal={reveal} />
    </motion.div>
  );
}

function EditorRow({ p, r }: { p: MV; r: number }) {
  const opensAt = T.rowOpen.from + T.rowOpen.step * r;
  const close = T.rowClose.from + T.rowClose.step * (ROWS - 1 - r);
  const grown = useSeg(p, opensAt, opensAt + T.rowOpen.dur, easeOutCubic);
  const folded = useSeg(p, close, close + T.rowClose.dur, easeInOutCubic);
  const natural = FIELD_H + (r < ROWS - 1 ? FIELD_GAP : 0);
  const room = useTransform([grown, folded], ([g, f]: number[]) => g * (1 - f));
  return (
    <FoldBox t={room} h={natural}>
      <div className="grid grid-cols-2 gap-x-3" style={{ paddingBottom: natural - FIELD_H }}>
        {EDIT_FIELDS.slice(r * COLS, r * COLS + COLS).map((m, i) => (
          <EditorField key={m.id} m={m} i={r * COLS + i} p={p} />
        ))}
      </div>
    </FoldBox>
  );
}

const COLS = 2;
const ROWS = Math.ceil(EDIT_FIELDS.length / COLS);

export function Editor({ p }: { p: MV }) {
  return (
    <>
      {Array.from({ length: ROWS }, (_, r) => (
        <EditorRow key={r} p={p} r={r} />
      ))}
    </>
  );
}

function SaveButton({ p }: { p: MV }) {
  const press = useTransform(p, (v) => inWindows(v, [T.tapSave.press, T.tapSave2.press]));
  const dip = useTransform(press, (v) => 1 - 0.05 * bell(v));
  const ring = useTransform(press, (v) => 1 + 0.06 * clamp01(v));
  const ringOn = useTransform(press, (v) => (v > 0 && v < 1 ? (1 - v) * 0.7 : 0));
  const flash = useTransform(press, (v) => 0.5 * bell(v));
  const border = useTransform(flash, (f) => mixColor("var(--color-accent)", f * 2, "var(--color-line-strong)"));
  const t1 = useSeg(p, T.tapSave.travel[0], T.tapSave.travel[1], easeInOutCubic);
  const t2 = useSeg(p, T.tapSave2.travel[0], T.tapSave2.travel[1], easeInOutCubic);
  const travel = useTransform([t1, t2], ([a, b]: number[]) => (b > 0 ? b : a));
  const show = useTransform(p, (v) => {
    const one = segAt(v, T.tapSave.travel[0], T.tapSave.travel[0] + 0.02) * (1 - segAt(v, T.tapSave.gone[0], T.tapSave.gone[1]));
    const two = segAt(v, T.tapSave2.travel[0], T.tapSave2.travel[0] + 0.015) * (1 - segAt(v, T.tapSave2.gone[0], T.tapSave2.gone[1]));
    return Math.max(one, two);
  });
  return (
    <div className="relative shrink-0">
      <motion.i style={{ scale: ring, opacity: ringOn }} className="pointer-events-none absolute inset-0 rounded-lg border-2 border-accent" />
      <motion.div style={{ scale: dip, borderColor: border }} className="relative flex h-9 items-center gap-2 overflow-hidden rounded-lg border bg-surface-2 px-3">
        <motion.i aria-hidden style={{ opacity: flash }} className="absolute inset-0 bg-accent" />
        <span className="relative">
          <MtmGlyph name="save" size={18} />
        </span>
        <span className="relative text-[12px] font-semibold leading-none text-fg">{SAVE_LABEL}</span>
      </motion.div>
      <div className="absolute left-[62%] top-[58%]">
        <Pointer t={travel} press={press} show={show} from={[40, -84]} />
      </div>
    </div>
  );
}

/* The diff line types in whole characters, the caret sits right behind the last one, so no glyph is ever cut in half. */
const DIFF_LEN = DIFF_TEXT.length;

function DiffText({ p }: { p: MV }) {
  const t = useSeg(p, T.diff[0], T.diff[1]);
  const typed = useTransform(t, (v) => DIFF_TEXT.slice(0, Math.floor(v * DIFF_LEN)));
  const icon = useTransform(t, (v) => segAt(v, 0, 0.08));
  const caretOn = useTransform(t, (v) => (v > 0.001 && v < 0.999 ? 1 : 0));
  return (
    <span className="flex h-6 min-w-0 flex-1 items-center gap-1.5">
      <motion.span style={{ opacity: icon }} className="shrink-0">
        <MtmGlyph name="pencil" size={16} />
      </motion.span>
      <span className={`${MONO} flex min-w-0 items-center text-[10px] leading-none text-dim`}>
        <motion.span className="min-w-0 overflow-hidden text-ellipsis whitespace-pre">{typed}</motion.span>
        <motion.i aria-hidden style={{ opacity: caretOn }} className="ml-px h-3 w-[2px] shrink-0 rounded-full bg-accent" />
      </span>
    </span>
  );
}

export function ActionBar({ p }: { p: MV }) {
  const h = useSeg(p, T.bar[0], T.bar[1], easeOutCubic);
  return (
    <FoldBox t={h} h={ACTION_H} className="mt-auto">
      <div className="flex items-end gap-3 pt-2" style={{ height: ACTION_H }}>
        <DiffText p={p} />
        <SaveButton p={p} />
      </div>
    </FoldBox>
  );
}
