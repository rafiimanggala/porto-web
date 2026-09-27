"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, motionValue, useTransform } from "framer-motion";
import { MONO, easeOutBack, type MV } from "./HealthSceneParts";
import { PipeGlyph, type GlyphName } from "./PipeKitGlyphs";
import { clamp01 } from "./PipeKitMath";

/* n8n style node tile. Every animated part reads a MotionValue passed in (0..1), never a timer. */

const OFF = motionValue(0);
const RADIUS = "calc(var(--n) * 0.24)";
const RING_RADIUS = "calc(var(--n) * 0.24 + 3px)";
const BADGE = "max(14px, calc(var(--n) * 0.36))";
const LIFT_PX = 2;
const LIFT_SCALE = 0.05;
const PULSE_GROW = 0.9;
const PULSE_PEAK = 0.75;
const PULSE_ATTACK = 14;

type PipeNodeProps = {
  glyph: GlyphName;
  /** Mono label under the tile, at least 10px. */
  label?: string;
  /** Tile edge: px number or any CSS length. Default 44. */
  size?: number | string;
  /** 0..1: accent ring, slight lift, label lights up. */
  active?: MV;
  /** 0..1: mint check badge pops in. */
  done?: MV;
  /** 0..1: ring turns rose, cross badge replaces the check. */
  error?: MV;
  /** 0..1: one ripple ring leaves the tile. */
  pulse?: MV;
  /** Centre of the tile in percent of an absolute parent: [left, top]. Omit to place it in flow. */
  at?: readonly [number, number];
  className?: string;
};

function Check() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-[64%] w-[64%]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.4 8.6l3 3 6.2-6.6" />
    </svg>
  );
}

function Cross() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className="h-[58%] w-[58%]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
      <path d="M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2" />
    </svg>
  );
}

function Badge({ scale, className, children }: { scale: MV; className: string; children: ReactNode }) {
  return (
    <motion.span
      aria-hidden
      style={{ scale, width: BADGE, height: BADGE }}
      className={`absolute -right-[5px] -top-[5px] z-10 grid place-items-center rounded-full text-pastel-ink ${className}`}
    >
      {children}
    </motion.span>
  );
}

function Label({ text, active }: { text: string; active: MV }) {
  return (
    <span className={`${MONO} pointer-events-none absolute left-1/2 top-full mt-1 -translate-x-1/2 whitespace-nowrap text-[10px] leading-none`}>
      <span className="text-mute">{text}</span>
      <motion.span style={{ opacity: active }} className="absolute inset-0 text-fg">
        {text}
      </motion.span>
    </span>
  );
}

export function PipeNode({ glyph, label, size = 44, active = OFF, done = OFF, error = OFF, pulse = OFF, at, className = "" }: PipeNodeProps) {
  const y = useTransform(active, (v) => -LIFT_PX * v);
  const scale = useTransform(active, (v) => 1 + LIFT_SCALE * v);
  const ring = useTransform([active, error], ([a, e]: number[]) => a * (1 - e));
  const doneScale = useTransform([done, error], ([d, e]: number[]) => easeOutBack(clamp01(d)) * (1 - clamp01(e)));
  const errScale = useTransform(error, (e) => easeOutBack(clamp01(e)));
  const rippleScale = useTransform(pulse, (v) => 1 + PULSE_GROW * v);
  const rippleOpacity = useTransform(pulse, (v) => Math.min(1, v * PULSE_ATTACK) * (1 - clamp01(v)) * PULSE_PEAK);

  const style: CSSProperties = {
    ["--n" as string]: typeof size === "number" ? `${size}px` : size,
    ...(at ? { position: "absolute", left: `${at[0]}%`, top: `${at[1]}%`, transform: "translate(-50%, -50%)" } : null),
  };

  return (
    <div style={style} className={`relative h-[var(--n)] w-[var(--n)] shrink-0 ${className}`}>
      <motion.i
        aria-hidden
        style={{ scale: rippleScale, opacity: rippleOpacity, borderRadius: RADIUS }}
        className="pointer-events-none absolute inset-0 border-2 border-accent"
      />
      <motion.div style={{ y, scale, borderRadius: RADIUS }} className="absolute inset-0 border border-line-strong bg-surface-2">
        <motion.i aria-hidden style={{ opacity: error, borderRadius: RADIUS }} className="absolute inset-0 bg-rose/20" />
        <motion.i aria-hidden style={{ opacity: ring, borderRadius: RING_RADIUS }} className="pointer-events-none absolute -inset-[3px] border-2 border-accent" />
        <motion.i aria-hidden style={{ opacity: error, borderRadius: RING_RADIUS }} className="pointer-events-none absolute -inset-[3px] border-2 border-rose" />
        <span className="absolute inset-0 grid place-items-center">
          <PipeGlyph name={glyph} size="calc(var(--n) * 0.6)" />
        </span>
        <Badge scale={doneScale} className="bg-mint">
          <Check />
        </Badge>
        <Badge scale={errScale} className="bg-rose">
          <Cross />
        </Badge>
      </motion.div>
      {label ? <Label text={label} active={active} /> : null}
    </div>
  );
}

type NodeRowProps = {
  children: ReactNode;
  /** Gap between tiles in px. Default 20. */
  gap?: number;
  /** Tile size of the children, used to centre the hairline. Default 44. */
  tileSize?: number;
  /** Draw a static hairline behind the tiles. Default true. */
  wired?: boolean;
  /** Fill the parent width and spread the tiles with justify-between (gap becomes the minimum). Default false: the row hugs its tiles. */
  spread?: boolean;
  className?: string;
};

/** Flow row of node tiles with an optional static hairline behind them. Leave room below for labels. */
export function NodeRow({ children, gap = 20, tileSize = 44, wired = true, spread = false, className = "" }: NodeRowProps) {
  return (
    <div className={`relative items-start ${spread ? "flex w-full justify-between" : "inline-flex"} ${className}`} style={{ gap }}>
      {wired ? <i aria-hidden className="absolute h-0.5 bg-line-strong" style={{ left: tileSize / 2, right: tileSize / 2, top: tileSize / 2 - 1 }} /> : null}
      {children}
    </div>
  );
}
