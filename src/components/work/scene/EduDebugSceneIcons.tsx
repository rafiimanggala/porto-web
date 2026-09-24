"use client";

import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";

/* Duotone glyphs in the house style: a cream stroke over a tinted fill, chunky enough to read at 24px. */

const INK = "var(--color-fg)";
const tint = (color: string, amount = 45) => `color-mix(in oklab, ${color} ${amount}%, transparent)`;

type IconProps = { className?: string };

const base = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

export function EnvelopeIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 40 32" aria-hidden className={className} {...base}>
      <rect x="3" y="4" width="34" height="24" rx="4.5" fill={tint("var(--color-sun)", 62)} stroke={INK} strokeWidth="3.4" />
      <path d="M5 8l15 11L35 8" stroke={INK} strokeWidth="3.4" />
    </svg>
  );
}

export function DllIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className} {...base}>
      <path d="M11 5h18l9 9v27a2 2 0 0 1-2 2H11a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z" fill={tint("var(--color-sky)", 55)} stroke={INK} strokeWidth="3.4" />
      <path d="M29 5v9h9" stroke={INK} strokeWidth="3.4" />
      <path d="M16 24h5M25 24h7M16 31h9M29 31h3M16 38h4M24 38h8" stroke={INK} strokeWidth="3" />
    </svg>
  );
}

export function ServerIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className} {...base}>
      <rect x="6" y="7" width="36" height="15" rx="4" fill={tint("var(--color-mint)", 60)} stroke={INK} strokeWidth="3.4" />
      <rect x="6" y="26" width="36" height="15" rx="4" fill={tint("var(--color-mint)", 60)} stroke={INK} strokeWidth="3.4" />
      <path d="M12 14.5h.1M12 33.5h.1M20 14.5h14M20 33.5h14" stroke={INK} strokeWidth="3.6" />
    </svg>
  );
}

export function CheckMark({ className }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={className} {...base}>
      <path d="M3 8.5l3.2 3.2L13 4.5" stroke="currentColor" strokeWidth="2.4" />
    </svg>
  );
}

const PLATE_TOP = "M16 4h40L42.5 26h-13z";
const PLATE_BOTTOM = "M16 60h40L42.5 38h-13z";
const SQUEEZE_TRAVEL = 4.5;

/* Restrictor valve: squeeze closes the plates, turn spins the wheel, both 0 to 1. */
export function ValveGlyph({ squeeze, turn, className }: { squeeze: MV; turn: MV; className?: string }) {
  const top = useTransform(squeeze, (v) => v * SQUEEZE_TRAVEL);
  const bottom = useTransform(squeeze, (v) => -v * SQUEEZE_TRAVEL);
  const rotate = useTransform(turn, (v) => v * 90);
  return (
    <svg viewBox="0 0 72 64" aria-hidden className={className} {...base}>
      <motion.path d={PLATE_TOP} style={{ y: top }} fill={tint("var(--color-sun)", 62)} stroke={INK} strokeWidth="3.4" />
      <motion.path d={PLATE_BOTTOM} style={{ y: bottom }} fill={tint("var(--color-sun)", 62)} stroke={INK} strokeWidth="3.4" />
      <path d="M43 32h15" stroke={INK} strokeWidth="3.4" />
      <motion.g style={{ rotate, originX: 0.5, originY: 0.5 }}>
        <circle cx="64" cy="32" r="6.5" fill={tint("var(--color-accent)", 75)} stroke={INK} strokeWidth="3.2" />
        <path d="M64 27v10" stroke={INK} strokeWidth="3" />
      </motion.g>
    </svg>
  );
}
