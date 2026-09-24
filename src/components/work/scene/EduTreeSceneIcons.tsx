"use client";

import { motion, useTransform } from "framer-motion";
import { clamp01 } from "./EduTreeSceneMath";
import type { MV } from "./HealthSceneParts";

/* Duotone glyphs in the house style: a cream stroke over a tinted fill, chunky enough to read at 24px. */

const INK = "var(--color-fg)";
const tint = (color: string, amount = 45) => `color-mix(in oklab, ${color} ${amount}%, transparent)`;

type IconProps = { className?: string };

const base = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function BookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className} {...base}>
      <path d="M5 11c7-2.5 14-1.5 19 2.5v27c-5-4-12-5-19-2.5z" fill={tint("var(--color-sky)")} stroke={INK} strokeWidth="3" />
      <path d="M43 11c-7-2.5-14-1.5-19 2.5v27c5-4 12-5 19-2.5z" fill={tint("var(--color-mint)")} stroke={INK} strokeWidth="3" />
      <path d="M11 21c4-1 7-.6 9 .8M11 28c4-1 7-.6 9 .8" stroke={INK} strokeWidth="2.4" />
    </svg>
  );
}

export function QuizIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className} {...base}>
      <path d="M11 5h18l9 9v27a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill={tint("var(--color-sun)", 55)} stroke={INK} strokeWidth="3.4" />
      <path d="M29 5v9h9" stroke={INK} strokeWidth="3.4" />
      <path d="M16 31l6 6 11-13" stroke={INK} strokeWidth="4" />
    </svg>
  );
}

export function NodesIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className} {...base}>
      <path d="M12 12v25M12 25h16M12 37h16" stroke={INK} strokeWidth="3" />
      <circle cx="12" cy="10" r="5.5" fill={tint("var(--color-sun)", 70)} stroke={INK} strokeWidth="3" />
      <circle cx="33" cy="25" r="5.5" fill={tint("var(--color-mint)", 70)} stroke={INK} strokeWidth="3" />
      <circle cx="33" cy="37" r="5.5" fill={tint("var(--color-rose)", 70)} stroke={INK} strokeWidth="3" />
    </svg>
  );
}

export function Chevron({ className }: IconProps) {
  return (
    <svg viewBox="0 0 12 12" aria-hidden className={className} {...base}>
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function CheckMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} {...base}>
      <path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="2.2" />
    </svg>
  );
}

export function PlayMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} {...base}>
      <path d="M5 3.5v9l7-4.5z" fill="currentColor" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function CursorMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 14 18" aria-hidden className={className}>
      <path d="M1.5 1.5v13l3.6-3.2 2.4 5.2 2.2-1-2.4-5.1h4.9z" className="fill-fg stroke-bg" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

const ARCS = [
  { d: "M6.3 16.3A25 25 0 0 1 41.7 16.3", order: 0 },
  { d: "M12 22A17 17 0 0 1 36 22", order: 1 },
  { d: "M17.6 27.6A9 9 0 0 1 30.4 27.6", order: 2 },
] as const;
const STRIKE = "M7 5L41 37";
const ARC_STAGGER = 0.2;
const ARC_SPAN = 0.5;
const ARC_FALL = 5;

function WifiArc({ drop, d, order }: { drop: MV; d: string; order: number }) {
  const t = useTransform(drop, (v) => clamp01((v - order * ARC_STAGGER) / ARC_SPAN));
  const opacity = useTransform(t, (v) => 1 - 0.5 * v);
  const y = useTransform(t, (v) => v * ARC_FALL);
  const stroke = useTransform(t, (v) => `color-mix(in oklab, var(--color-sun) ${(v * 100).toFixed(1)}%, var(--color-mint))`);
  return <motion.path d={d} style={{ opacity, y, stroke }} strokeWidth="5" {...base} />;
}

/* Wifi glyph. `drop` runs 0 to 1: the arcs fall away from the outside in, a strike is drawn across. Offline is amber, an expected state and not an alarm. */
export function WifiGlyph({ drop, className }: { drop: MV; className?: string }) {
  const strike = useTransform(drop, (v) => clamp01((v - 0.35) / 0.65));
  const strikeOn = useTransform(strike, (v) => (v > 0.002 ? 1 : 0));
  const dot = useTransform(drop, (v) => `color-mix(in oklab, var(--color-sun) ${(clamp01(v * 2) * 100).toFixed(1)}%, var(--color-mint))`);
  return (
    <svg viewBox="0 0 48 42" aria-hidden className={className}>
      {ARCS.map((a) => (
        <WifiArc key={a.d} drop={drop} d={a.d} order={a.order} />
      ))}
      <motion.circle cx="24" cy="34" r="3.4" style={{ fill: dot }} />
      <motion.path d={STRIKE} stroke="var(--color-surface-1)" strokeWidth="10" strokeLinecap="round" fill="none" style={{ pathLength: strike, opacity: strikeOn }} />
      <motion.path d={STRIKE} stroke="var(--color-sun)" strokeWidth="5" strokeLinecap="round" fill="none" style={{ pathLength: strike, opacity: strikeOn }} />
    </svg>
  );
}
