"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { segAt } from "./MobileSceneMath";
import { u } from "./MobileSceneKit";
import { MtmGlyph } from "./MtmKitGlyphs";
import { TONE_VAR, clamp01, keyframes, mixColor, statusMix } from "./MtmKitMath";
import type { Measure } from "./MtmKitData";
import { FIELD, FIELDS, FOCUSED, PLANS, T, type Keys } from "./MtmPhoneSceneData";
import type { FieldGeo, Flow } from "./MtmPhoneSceneMath";
import { Flash, NO_BEAT, clipRight, useBeat, useRect, type Type } from "./MtmPhoneSceneKit";

/* One measurement field, drawn in stage units: label and range, boxed value typed in by a clip, and a range bar whose marker
   turns rose out of range and mint inside it. Its rect comes from the flow, so it moves with the form. */

type Props = { p: MV; flow: MotionValue<Flow>; type: Type; k: number };

const LINE = "var(--color-line-strong)";
const DOMAIN_PAD = 0.4;
const MARKER_EDGE = 0.035;
const LINEAR = (t: number) => t;
const RANGE_IN = [0.6, 1] as const;
const BOX_TOP = FIELD.label + 1;
const BAR_MID = BOX_TOP + FIELD.box + 3.5;

const useKeysOf = (p: MV, k: Keys, linear = false): MV => useTransform(p, (v) => keyframes(v, k[0], k[1], linear ? LINEAR : undefined));

const posOf = ([lo, hi]: readonly [number, number], n: number) => {
  const pad = (hi - lo) * DOMAIN_PAD;
  return (n - (lo - pad)) / (hi - lo + 2 * pad);
};
const pctOf = (t: number) => `${(t * 100).toFixed(3)}%`;

const textOf = (m: Measure, n: number) => (m.letters ? m.letters.charAt(Math.round(n) - 1) : String(Math.round(n)));

/* Typing goes one character at a time. frac is the share of the text that is there, part the number those characters read
   so far, so the caret always sits after the last character and the range marker follows what is typed, not the final value. */
type Typed = { frac: number; part: number };

function typedAt(m: Measure, n: number, r: number): Typed {
  const text = textOf(m, n);
  const count = Math.max(0, Math.ceil(clamp01(r) * text.length - 1e-6));
  const part = m.letters ? (count > 0 ? Math.round(n) : 0) : Number(text.slice(0, count) || 0);
  return { frac: count / text.length, part };
}

function Badge({ s }: { s: MV }) {
  const ok = useTransform(s, (x) => clamp01(x));
  const bad = useTransform(s, (x) => clamp01(-x));
  return (
    <span aria-hidden className="relative block shrink-0" style={{ width: u(9), height: u(9), marginLeft: u(3) }}>
      <motion.span style={{ scale: ok, opacity: ok }} className="absolute inset-0">
        <MtmGlyph name="check" size="100%" />
      </motion.span>
      <motion.span style={{ scale: bad, opacity: bad }} className="absolute inset-0">
        <MtmGlyph name="cross" size="100%" />
      </motion.span>
    </span>
  );
}

function Value({ m, v, r, typed, type }: { m: Measure; v: MV; r: MV; typed: MotionValue<Typed>; type: Type }) {
  const text = useTransform(v, (n) => textOf(m, n));
  const clip = useTransform(typed, (t) => clipRight(t.frac));
  const caretLeft = useTransform(typed, (t) => `${(t.frac * 100).toFixed(2)}%`);
  const caretOn = useTransform(r, (t) => (t > 0.001 && t < 0.999 ? 1 : 0));
  return (
    <span className="relative inline-block" style={{ minWidth: u(1) }}>
      <motion.span style={{ clipPath: clip, fontSize: type.name, lineHeight: 1 }} className="block font-semibold tabular-nums text-fg">
        {text}
      </motion.span>
      <motion.i
        aria-hidden
        style={{ left: caretLeft, opacity: caretOn, width: u(1.2), top: u(-1.5), bottom: u(-1.5), marginLeft: u(1) }}
        className="absolute -translate-x-1/2 rounded-full bg-accent"
      />
    </span>
  );
}

function Bar({ k, typed, r, s }: { k: number; typed: MotionValue<Typed>; r: MV; s: MV }) {
  const m = FIELDS[k];
  const range = [m.min, m.max] as const;
  const left = useTransform(typed, (t) => pctOf(MARKER_EDGE + (1 - 2 * MARKER_EDGE) * clamp01(posOf(range, t.part))));
  const color = useTransform(s, (x) => statusMix(x, "var(--color-fg)"));
  const shown = useTransform(r, (t) => clamp01(t * 8));
  return (
    <div className="absolute inset-x-0" style={{ top: u(BAR_MID), height: 0 }}>
      <i aria-hidden className="absolute inset-x-0 -translate-y-1/2 rounded-full bg-line-strong" style={{ height: u(FIELD.bar) }} />
      <i
        aria-hidden
        className="absolute -translate-y-1/2 rounded-full"
        style={{ height: u(FIELD.bar), left: pctOf(posOf(range, m.min)), width: pctOf(posOf(range, m.max) - posOf(range, m.min)), background: mixColor(TONE_VAR.mint, 0.5, "transparent") }}
      />
      <motion.i
        aria-hidden
        style={{ left, background: color, opacity: shown, width: u(2.2), height: u(7.5) }}
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_1.5px_var(--color-surface-1)]"
      />
    </div>
  );
}

function RangeText({ k, geo, s, type }: { k: number; geo: MotionValue<FieldGeo>; s: MV; type: Type }) {
  const m = FIELDS[k];
  const opacity = useTransform(geo, (g) => segAt(g.wide, RANGE_IN));
  const color = useTransform(s, (x) => mixColor(TONE_VAR.rose, clamp01(-x), "var(--color-mute)"));
  const edge = (n: number) => (m.letters ? m.letters.charAt(n - 1) : String(n));
  return (
    <motion.span style={{ opacity, color, fontSize: type.label, lineHeight: 1 }} className={`${MONO} tabular-nums`}>
      {edge(m.min)} to {edge(m.max)}
    </motion.span>
  );
}

export default function Field({ p, flow, type, k }: Props) {
  const m = FIELDS[k];
  const plan = PLANS[k];
  const geo = useTransform(flow, (f) => f.form.fields[k]);
  const box = useRect(geo, (g) => g.rect);
  const show = useTransform(geo, (g) => g.show);
  const r = useKeysOf(p, plan.reveal, true);
  const s = useKeysOf(p, plan.status);
  const v = useTransform(p, (t) => (t < plan.flip ? plan.first : plan.value));
  const typed = useTransform([v, r], ([n, t]: number[]) => typedAt(m, n, t));
  const focus = useBeat(p, ...(k === FOCUSED ? T.focus : NO_BEAT));
  const ring = useTransform([s, r, focus], ([x, t, f]: number[]) =>
    statusMix(x, t > 0.001 && t < 0.999 ? TONE_VAR.accent : mixColor(TONE_VAR.accent, f, LINE)),
  );
  const a = T.fieldBeat.start + k * T.fieldBeat.step;
  const beat = useBeat(p, a, a + T.fieldBeat.dur);
  return (
    <motion.div style={{ ...box, opacity: show }} className="absolute">
      <div className={`${MONO} absolute inset-x-0 top-0 flex items-start justify-between uppercase tracking-[0.08em] text-mute`} style={{ height: u(FIELD.label) }}>
        <motion.span style={{ fontSize: type.label, lineHeight: 1 }}>{m.label}</motion.span>
        <RangeText k={k} geo={geo} s={s} type={type} />
      </div>
      <div className="absolute inset-x-0 flex items-center bg-surface-2" style={{ top: u(BOX_TOP), height: u(FIELD.box), borderRadius: u(3), paddingInline: u(4) }}>
        <motion.i aria-hidden style={{ borderColor: ring, borderWidth: u(1), borderRadius: "inherit" }} className="pointer-events-none absolute inset-0" />
        <Value m={m} v={v} r={r} typed={typed} type={type} />
        <motion.span style={{ fontSize: type.label, lineHeight: 1 }} className={`${MONO} ml-auto text-mute`}>
          {m.unit}
        </motion.span>
        <Badge s={s} />
        <Flash beat={beat} />
      </div>
      <Bar k={k} typed={typed} r={r} s={s} />
    </motion.div>
  );
}
