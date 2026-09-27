"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { PATTERNS, type Garment, type Gender, type Weave } from "./MtmKitData";
import { clamp01, mixColor, num, toneTint, useMv, type MvIn, type ToneName } from "./MtmKitMath";

export { MeasureField, useMeasureStatus, type FieldStatus } from "./MtmKitField";
export { CartButton } from "./MtmKitCart";

/* Storefront pieces of the made-to-measure scenes. Every animated prop is a MotionValue (or a constant), 0..1. */

const GENDER_TONE: Readonly<Record<Gender, ToneName>> = { Men: "sky", Women: "rose" };

export type PatternState = "saved" | "editing" | "new";
const STATE_TONE: Readonly<Record<PatternState, ToneName>> = { saved: "mint", editing: "sun", new: "accent" };

const CHIP = `${MONO} inline-flex items-center rounded-[4px] px-1.5 py-[2px] text-[10px] uppercase leading-none tracking-[0.1em] text-fg`;

function Chip({ tone, children }: { tone: ToneName; children: ReactNode }) {
  return (
    <span className={CHIP} style={{ background: toneTint(tone, 0.4) }}>
      {children}
    </span>
  );
}

function Tick({ t, className }: { t: MV; className: string }) {
  const on = useTransform(t, (v) => (v > 0.01 ? 1 : 0));
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className}>
      <motion.path d="M3.8 8.6l2.7 2.7 5.7-6" fill="none" stroke="var(--color-fg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ pathLength: t, opacity: on }} />
    </svg>
  );
}

function Radio({ sel }: { sel: MV }) {
  const pop = useTransform(sel, (v) => easeOutBack(clamp01(v)));
  return (
    <span aria-hidden className="relative block h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-line-strong">
      <motion.i style={{ scale: pop, opacity: sel }} className="absolute -inset-[1.5px] rounded-full bg-accent" />
      <Tick t={sel} className="absolute inset-0 h-full w-full" />
    </span>
  );
}

type PatternCardProps = {
  /** A string, or any node (for example clipped text) when the name is being typed. */
  name: ReactNode;
  gender: Gender;
  /** 0..1 or a flag: accent frame and a filled radio. */
  selected?: MvIn | boolean;
  /** Optional chip after the gender chip. */
  state?: PatternState;
  /** Garment glyph. Default: looked up from the sample patterns by name, else shirt. */
  garment?: Garment;
  className?: string;
};

export function PatternCard({ name, gender, selected = false, state, garment, className = "" }: PatternCardProps) {
  const sel = useMv(num(selected));
  const glyph = garment ?? PATTERNS.find((p) => p.name === name)?.garment ?? "shirt";
  return (
    <div aria-hidden className={`relative flex w-full items-center gap-2.5 rounded-lg border border-line-strong bg-surface-1 px-2.5 py-2 ${className}`}>
      <motion.i style={{ opacity: sel }} className="pointer-events-none absolute -inset-px rounded-lg border-2 border-accent bg-accent/10" />
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-2">
        <MtmGlyph name={glyph} size={26} />
      </span>
      <div className="relative min-w-0 flex-1">
        <p className="truncate text-[13px] font-medium leading-tight text-fg">{name}</p>
        <div className="mt-1 flex items-center gap-1.5">
          <Chip tone={GENDER_TONE[gender]}>{gender}</Chip>
          {state ? <Chip tone={STATE_TONE[state]}>{state}</Chip> : null}
        </div>
      </div>
      <Radio sel={sel} />
    </div>
  );
}

const LINE = "color-mix(in oklab, var(--color-bg) 34%, transparent)";
const WEAVES: Readonly<Record<Weave, CSSProperties>> = {
  basket: {
    backgroundImage: `repeating-linear-gradient(0deg, ${LINE} 0 1.5px, transparent 1.5px 6px), repeating-linear-gradient(90deg, ${LINE} 0 1.5px, transparent 1.5px 6px)`,
  },
  plain: {
    backgroundImage: `repeating-linear-gradient(0deg, ${LINE} 0 1px, transparent 1px 3px), repeating-linear-gradient(90deg, ${LINE} 0 1px, transparent 1px 3px)`,
  },
  twill: { backgroundImage: `repeating-linear-gradient(45deg, ${LINE} 0 1.5px, transparent 1.5px 5px)` },
  slub: {
    backgroundImage: `repeating-linear-gradient(0deg, ${LINE} 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, transparent 0 9px, ${LINE} 9px 10.5px)`,
  },
};

type SwatchProps = {
  /** Any CSS colour, ideally fabricColor(fabric) from MtmKitData. */
  color: string;
  name: string;
  selected?: MvIn | boolean;
  /** Fabric texture drawn over the colour. Default plain. */
  weave?: Weave;
  className?: string;
};

export function Swatch({ color, name, selected = false, weave = "plain", className = "" }: SwatchProps) {
  const sel = useMv(num(selected));
  const label = useTransform(sel, (v) => mixColor("var(--color-fg)", v, "var(--color-dim)"));
  const pop = useTransform(sel, (v) => easeOutBack(clamp01(v)));
  return (
    <div aria-hidden className={`w-full min-w-0 ${className}`}>
      <div className="relative aspect-square w-full rounded-lg border border-line-strong" style={{ background: color, ...WEAVES[weave] }}>
        <motion.i style={{ opacity: sel }} className="pointer-events-none absolute -inset-[3px] rounded-[11px] border-2 border-accent" />
        <motion.span style={{ scale: pop, opacity: sel }} className="absolute -bottom-1.5 -right-1.5 grid h-5 w-5 place-items-center rounded-full bg-accent">
          <Tick t={sel} className="h-3.5 w-3.5" />
        </motion.span>
      </div>
      <motion.p style={{ color: label }} className={`${MONO} mt-2 truncate text-[10px] leading-none`}>
        {name}
      </motion.p>
    </div>
  );
}

type OptionChipProps = { label: string; active?: MvIn | boolean; className?: string };

export function OptionChip({ label, active = false, className = "" }: OptionChipProps) {
  const on = useMv(num(active));
  const color = useTransform(on, (v) => mixColor("var(--color-fg)", v, "var(--color-dim)"));
  return (
    <span aria-hidden className={`relative inline-flex h-8 items-center rounded-full border border-line-strong px-3 ${className}`}>
      <motion.i style={{ opacity: on }} className="absolute -inset-px rounded-full border-2 border-accent bg-accent/15" />
      <motion.span style={{ color }} className="relative text-[12px] font-medium leading-none">
        {label}
      </motion.span>
    </span>
  );
}
