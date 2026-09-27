"use client";

import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { clamp01 } from "./PipeKitMath";

/* Typed text, in reading order. The whole string is always laid out, so line breaks never move: the letters typed so far are
   shown, the rest is transparent. The next letter carries a caret as an inset shadow on its left edge, which adds no width
   and no break opportunity. */

const CARET = "inset 1.5px 0 0 var(--color-accent)";

type TypedProps = {
  text: string;
  /** 0..1: the share of the letters typed. */
  t: MV;
  className?: string;
};

export function Typed({ text, t, className = "" }: TypedProps) {
  const count = useTransform(t, (v) => Math.floor(clamp01(v) * text.length));
  const head = useTransform(count, (n) => text.slice(0, n));
  const next = useTransform(count, (n) => text.charAt(n));
  const rest = useTransform(count, (n) => text.slice(n + 1));
  const caret = useTransform([t, count], ([v, n]: number[]) => (v > 0 && v < 1 && n < text.length ? CARET : "none"));
  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        <motion.span>{head}</motion.span>
        <motion.span style={{ boxShadow: caret }} className="text-transparent">
          {next}
        </motion.span>
        <motion.span className="text-transparent">{rest}</motion.span>
      </span>
    </span>
  );
}
