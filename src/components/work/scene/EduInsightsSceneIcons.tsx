"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutBack, type MV } from "./HealthSceneParts";

/* Inline duotone glyphs in the house style: cream stroke, tinted fill, chunky,
   readable at 24px. */

const STROKE = "var(--color-fg)";
const BASE = { fill: "none", strokeLinecap: "round", strokeLinejoin: "round" } as const;

type IconProps = { className?: string };

export function BellIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" {...BASE} className={`shrink-0 ${className}`}>
      <path
        d="M12 3.6a5 5 0 0 0-5 5v3l-1.7 3.3a1 1 0 0 0 .9 1.5h11.6a1 1 0 0 0 .9-1.5L17 11.6v-3a5 5 0 0 0-5-5Z"
        fill="var(--color-sun)"
        fillOpacity={0.55}
        stroke={STROKE}
        strokeWidth="1.8"
      />
      <path d="M9.9 19.2a2.3 2.3 0 0 0 4.2 0" stroke={STROKE} strokeWidth="1.8" />
    </svg>
  );
}

export function WarnIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" {...BASE} className={`shrink-0 ${className}`}>
      <path d="M12 3.6 21.2 19.4H2.8Z" fill="var(--color-rose)" fillOpacity={0.55} stroke={STROKE} strokeWidth="1.8" />
      <path d="M12 9.6v4.2M12 16.6v.1" stroke={STROKE} strokeWidth="2" />
    </svg>
  );
}

export function CalendarIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" {...BASE} className={`shrink-0 ${className}`}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" fill="var(--color-sky)" fillOpacity={0.42} stroke={STROKE} strokeWidth="1.8" />
      <path d="M3.5 10.2h17M8 3v4M16 3v4" stroke={STROKE} strokeWidth="1.8" />
    </svg>
  );
}

/* Round tick that pops in and draws its check as `t` runs from 0 to 1. */
export function TickBadge({ t, className = "h-[1.7em] w-[1.7em]" }: { t: MV; className?: string }) {
  const pop = useTransform(t, (v) => easeOutBack(Math.min(1, v * 1.6)));
  const opacity = useTransform(t, [0, 0.08], [0, 1], { clamp: true });
  const draw = useTransform(t, [0.35, 1], [0, 1], { clamp: true });
  return (
    <motion.svg aria-hidden viewBox="0 0 24 24" {...BASE} style={{ scale: pop, opacity }} className={`shrink-0 ${className}`}>
      <circle cx="12" cy="12" r="10" fill="var(--color-mint)" fillOpacity={0.55} stroke={STROKE} strokeWidth="1.8" />
      <motion.path d="M7.4 12.5l3.1 3.1 6.2-6.7" stroke={STROKE} strokeWidth="2.2" style={{ pathLength: draw }} />
    </motion.svg>
  );
}
