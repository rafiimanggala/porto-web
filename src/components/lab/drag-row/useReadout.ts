import { useEffect } from "react";
import type { RefObject } from "react";
import type { MotionValue } from "framer-motion";
import { skills } from "@/data/skills";

// Paints the readout, the progress bar and the active card straight from the
// motion value. No React state: at frame rate that would be a render per frame.

export type Field = "x" | "velocity" | "progress" | "snapped" | "direction";
export type FieldRefs = Partial<Record<Field, HTMLElement | null>>;

export type ReadoutRefs = {
  fields: RefObject<FieldRefs>;
  bar: RefObject<HTMLDivElement | null>;
  cards: RefObject<(HTMLLIElement | null)[]>;
};

export const LAST = skills.length - 1;
const IDLE_REPAINT_MS = 90; // velocity reads 0 once motion stopped, but no event fires then

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

// Fixed decimals without a stray "-0" when a value rounds to zero.
const fmt = (n: number, digits: number) => {
  const scale = 10 ** digits;
  return (Math.round(n * scale) / scale + 0).toFixed(digits);
};

export type Sample = {
  pos: number;
  velocity: number;
  progress: number;
  index: number;
  direction: "left" | "right" | "idle";
};

// Pure: what the row is doing right now, given its position and card pitch.
export function sample(pos: number, velocity: number, step: number): Sample {
  const progress = step > 0 ? clamp(-pos / (step * LAST), 0, 1) : 0;
  const index = step > 0 ? clamp(Math.round(-pos / step), 0, LAST) : 0;
  const direction = Math.abs(velocity) < 1 ? "idle" : velocity > 0 ? "right" : "left";
  return { pos, velocity, progress, index, direction };
}

function writeFields(fields: FieldRefs, s: Sample) {
  const text: Record<Field, string> = {
    x: fmt(s.pos, 1),
    velocity: fmt(s.velocity, 0),
    progress: fmt(s.progress, 3),
    snapped: String(s.index),
    direction: s.direction,
  };
  (Object.keys(text) as Field[]).forEach((key) => {
    const el = fields[key];
    if (el) el.textContent = text[key];
  });
}

export function useReadout(
  x: MotionValue<number>,
  stepRef: RefObject<number>,
  step: number,
  refs: ReadoutRefs,
) {
  useEffect(() => {
    let active = -1;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const paint = () => {
      const s = sample(x.get(), x.getVelocity(), stepRef.current);
      writeFields(refs.fields.current, s);
      if (refs.bar.current) refs.bar.current.style.transform = `scaleX(${s.progress})`;
      if (s.index !== active) {
        refs.cards.current[active]?.removeAttribute("data-active");
        refs.cards.current[s.index]?.setAttribute("data-active", "true");
        active = s.index;
      }
      clearTimeout(idleTimer);
      if (s.velocity !== 0) idleTimer = setTimeout(paint, IDLE_REPAINT_MS);
    };

    paint();
    const stops = [
      x.on("change", paint),
      x.on("animationComplete", paint),
      x.on("animationCancel", paint),
    ];
    return () => {
      clearTimeout(idleTimer);
      stops.forEach((stop) => stop());
    };
  }, [x, stepRef, step, refs]);
}
