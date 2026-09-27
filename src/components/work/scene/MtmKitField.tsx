"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { TONE_VAR, clamp01, mixColor, statusMix, useMv, type MvIn } from "./MtmKitMath";

/* Measurement field: label, boxed value and a range bar with the valid band. All motion comes from MotionValues. */

export type FieldStatus = "neutral" | "ok" | "bad";
const STATUS_NUM: Readonly<Record<FieldStatus, number>> = { neutral: 0, ok: 1, bad: -1 };

const DOMAIN_PAD = 0.4;
const MARKER_EDGE = 0.035;
const FOCUS_FROM = 0.001;
const FOCUS_TO = 0.999;
const LINE = "var(--color-line-strong)";

type Range = readonly [number, number];

/** Status of a value against its range: 1 in range, -1 out of it, scaled by `armed` (0..1) so it can fade in. */
export function useMeasureStatus(value: MV, range: Range, armed: MvIn = 1): MV {
  const a = useMv(armed);
  return useTransform([value, a], ([v, k]: number[]) => (v >= range[0] && v <= range[1] ? 1 : -1) * clamp01(k));
}

/** Where n sits on the bar, 0..1. The bar shows the valid range with padding on both sides. */
const posOf = ([lo, hi]: Range, n: number) => {
  const pad = (hi - lo) * DOMAIN_PAD;
  return (n - (lo - pad)) / (hi - lo + 2 * pad);
};

function ValueText({ v, r, letters }: { v: MV; r: MV; letters?: string }) {
  const text = useTransform(v, (n) => (letters ? letters.charAt(Math.round(n) - 1) : String(Math.round(n))));
  const clip = useTransform(r, (t) => `inset(0 ${((1 - clamp01(t)) * 100).toFixed(2)}% 0 0)`);
  const caretLeft = useTransform(r, (t) => `${(clamp01(t) * 100).toFixed(2)}%`);
  const caretOn = useTransform(r, (t) => (t > FOCUS_FROM && t < FOCUS_TO ? 1 : 0));
  return (
    <span className="relative inline-block min-w-[2px] text-[17px] font-semibold leading-none tabular-nums text-fg">
      <motion.span style={{ clipPath: clip }} className="block">
        {text}
      </motion.span>
      <motion.i aria-hidden style={{ left: caretLeft, opacity: caretOn }} className="absolute -inset-y-[1px] w-[2px] -translate-x-1/2 rounded-full bg-accent" />
    </span>
  );
}

function Badge({ s }: { s: MV }) {
  const ok = useTransform(s, (x) => clamp01(x));
  const bad = useTransform(s, (x) => clamp01(-x));
  return (
    <span aria-hidden className="relative ml-1.5 block h-4 w-4 shrink-0">
      <motion.span style={{ scale: ok, opacity: ok }} className="absolute inset-0">
        <MtmGlyph name="check" size="100%" />
      </motion.span>
      <motion.span style={{ scale: bad, opacity: bad }} className="absolute inset-0">
        <MtmGlyph name="cross" size="100%" />
      </motion.span>
    </span>
  );
}

const pctOf = (t: number) => `${(t * 100).toFixed(3)}%`;

function RangeBar({ v, r, s, range, letters }: { v: MV; r: MV; s: MV; range: Range; letters?: string }) {
  const at = (n: number) => posOf(range, n);
  const left = useTransform(v, (n) => pctOf(MARKER_EDGE + (1 - 2 * MARKER_EDGE) * clamp01(at(n))));
  const color = useTransform(s, (x) => statusMix(x, "var(--color-fg)"));
  const shown = useTransform(r, (t) => clamp01(t * 8));
  return (
    <div className="relative mt-2 h-3">
      <i aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-line-strong" />
      <i
        aria-hidden
        className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full"
        style={{ left: pctOf(at(range[0])), width: pctOf(at(range[1]) - at(range[0])), background: mixColor(TONE_VAR.mint, 0.5, "transparent") }}
      />
      {letters?.split("").map((_, i) => (
        <i key={i} aria-hidden className="absolute top-1/2 h-[3px] w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg/70" style={{ left: pctOf(at(i + 1)) }} />
      ))}
      <motion.i
        aria-hidden
        style={{ left, background: color, opacity: shown }}
        className="absolute top-1/2 h-3 w-1 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_2px_var(--color-surface-1)]"
      />
    </div>
  );
}

type MeasureFieldProps = {
  label: string;
  /** Shown after the value, e.g. "cm". */
  unit?: string;
  /** The number in the box, rounded for display. Scrub it with a MotionValue or pass a constant. */
  value: MvIn;
  /** Valid range, inclusive. Draws the band on the bar and the min and max labels. */
  range: Range;
  /** -1 bad (rose), 0 neutral, 1 ok (mint), fractions blend. Or "neutral" | "ok" | "bad". Default neutral. */
  status?: MvIn | FieldStatus;
  /** 0..1: how much of the value is typed. A clip from the left with a caret at the edge. Default 1. */
  reveal?: MvIn;
  /** Cup style fields: the value is a 1 based index into these letters, e.g. "ABCDEFGH". */
  letters?: string;
  className?: string;
};

export function MeasureField({ label, unit = "", value, range, status = 0, reveal = 1, letters, className = "" }: MeasureFieldProps) {
  const v = useMv(value);
  const r = useMv(reveal);
  const s = useMv(typeof status === "string" ? STATUS_NUM[status] : status);
  const ring = useTransform([s, r], ([x, t]: number[]) => statusMix(x, t > FOCUS_FROM && t < FOCUS_TO ? TONE_VAR.accent : LINE));
  const edge = (n: number) => (letters ? letters.charAt(n - 1) : String(n));
  return (
    <div aria-hidden className={`w-full min-w-0 ${className}`}>
      <p className={`${MONO} mb-1 text-[10px] uppercase leading-none tracking-[0.12em] text-mute`}>{label}</p>
      <div className="relative flex h-9 items-center rounded-md bg-surface-2 px-2.5">
        <motion.i aria-hidden style={{ borderColor: ring }} className="pointer-events-none absolute inset-0 rounded-md border-2" />
        <ValueText v={v} r={r} letters={letters} />
        <span className={`${MONO} ml-auto pl-1 text-[11px] text-mute`}>{unit}</span>
        <Badge s={s} />
      </div>
      <RangeBar v={v} r={r} s={s} range={range} letters={letters} />
      <div className={`${MONO} relative mt-0.5 h-3 text-[10px] leading-3 text-mute`}>
        {range.map((n) => (
          <span key={n} className="absolute -translate-x-1/2" style={{ left: pctOf(posOf(range, n)) }}>
            {edge(n)}
          </span>
        ))}
      </div>
    </div>
  );
}
