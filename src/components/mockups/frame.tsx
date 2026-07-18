"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/* Illustrative device frames for NDA-safe product mockups: hand-built UI in
   this site's own design language (never the client's actual colors/type/
   copy), not screenshots. Auto-cycles between a few "screens" per project. */

export const ACCENT = {
  mint: "#5fe9ad",
  violet: "#a78bfa",
  amber: "#f6b667",
} as const;

export type AccentKey = keyof typeof ACCENT;

function Dots({
  count,
  active,
  accent,
}: {
  count: number;
  active: number;
  accent: string;
}) {
  return (
    <div className="mt-3 flex items-center justify-center gap-1.5">
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: i === active ? "16px" : "6px",
            background: i === active ? accent : "var(--color-line-strong)",
          }}
        />
      ))}
    </div>
  );
}

export function AutoCycle({
  screens,
  interval = 3800,
  accent,
}: {
  screens: ReactNode[];
  interval?: number;
  accent: string;
}) {
  const [i, setI] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || screens.length < 2) return;
    const id = setInterval(() => setI((v) => (v + 1) % screens.length), interval);
    return () => clearInterval(id);
  }, [screens.length, interval, reduce]);

  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: [0.19, 1, 0.22, 1] }}
            className="absolute inset-0"
          >
            {screens[i]}
          </motion.div>
        </AnimatePresence>
      </div>
      {screens.length > 1 && <Dots count={screens.length} active={i} accent={accent} />}
    </div>
  );
}

export function BrowserWindow({
  label,
  accent,
  children,
}: {
  label: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-line"
      style={{
        background: `radial-gradient(120% 90% at 50% -10%, ${accent}0f, transparent 60%), var(--color-surface-1)`,
      }}
    >
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mono mx-auto flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1 text-[11px] text-mute">
          <span aria-hidden>&#9679;</span>
          {label}
        </div>
      </div>
      <div className="aspect-[16/10] p-5 sm:p-6">{children}</div>
    </div>
  );
}

export function PhoneWindow({
  accent,
  children,
}: {
  accent: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[240px]">
      <div
        className="overflow-hidden rounded-[2.2rem] border-[6px] border-surface-3 bg-surface-1 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]"
        style={{
          background: `radial-gradient(120% 90% at 50% -10%, ${accent}0f, transparent 60%), var(--color-surface-1)`,
        }}
      >
        <div className="relative aspect-[9/19.5] px-3 pb-4 pt-6">
          <div className="absolute left-1/2 top-2 h-4 w-20 -translate-x-1/2 rounded-full bg-surface-3" />
          {children}
        </div>
      </div>
    </div>
  );
}

/* ---- shared presentational primitives, reused across all project mockups ---- */

export function Pill({
  text,
  accent,
  solid,
  tone,
}: {
  text: string;
  accent: string;
  solid?: boolean;
  tone?: "up" | "down";
}) {
  const color = tone === "down" ? "#e06a6a" : tone === "up" ? accent : accent;
  return (
    <span
      className="mono inline-flex items-center rounded px-1.5 py-0.5 text-[9px] leading-none"
      style={
        solid
          ? { background: color, color: "#0b0b0f" }
          : { background: `${color}1f`, color, border: `1px solid ${color}40` }
      }
    >
      {text}
    </span>
  );
}

export function Ring({ value, accent, size = 56 }: { value: number; accent: string; size?: number }) {
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ height: size, width: size }}>
      <svg viewBox="0 0 36 36" className="-rotate-90" style={{ height: size, width: size }}>
        <circle cx="18" cy="18" r="15" fill="none" stroke="var(--color-line)" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r="15"
          fill="none"
          stroke={accent}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${value} 100`}
        />
      </svg>
      <span className="mono absolute text-sm font-semibold text-fg">{value}</span>
    </div>
  );
}

export function BarRow({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="mono w-16 shrink-0 text-[9px] text-mute">{label}</span>
      <div className="h-1.5 flex-1 rounded-full bg-line">
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: accent }} />
      </div>
    </div>
  );
}

export function Tile({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-2 px-3 py-2">
      <div className="mono text-[9px] uppercase tracking-wide text-mute">{label}</div>
      <div className="mono mt-1 text-base font-semibold" style={{ color: accent ?? "var(--color-fg)" }}>
        {value}
      </div>
      {sub ? <div className="mono text-[9px] text-mute">{sub}</div> : null}
    </div>
  );
}

export function CardRow({
  title,
  sub,
  accent,
  active,
}: {
  title: string;
  sub: string;
  accent: string;
  active?: boolean;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{
        borderColor: active ? `${accent}55` : "var(--color-line)",
        background: active ? `${accent}0d` : "var(--color-surface-2)",
      }}
    >
      <div className="mono text-[10px] text-fg">{title}</div>
      <div className="mono text-[9px] text-mute">{sub}</div>
    </div>
  );
}

export function NavTabs({ items, active, accent }: { items: string[]; active: number; accent: string }) {
  return (
    <div className="mono flex gap-1 text-[8px]">
      {items.map((t, i) => (
        <span
          key={t}
          className="rounded-full px-2 py-1"
          style={
            i === active
              ? { background: accent, color: "#0b0b0f" }
              : { background: "var(--color-surface-2)", color: "var(--color-mute)" }
          }
        >
          {t}
        </span>
      ))}
    </div>
  );
}
