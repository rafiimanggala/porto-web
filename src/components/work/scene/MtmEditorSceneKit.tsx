"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { SERVICE } from "./MtmKitData";
import { clamp01, mixColor, pct, segAt } from "./MtmKitMath";
import { CARD_PITCH } from "./MtmEditorSceneData";

/* Small building blocks of the inline editor scene. Everything is a pure function of the motion values it receives. */

type Win = readonly [number, number];

export const bell = (t: number) => Math.sin(Math.PI * clamp01(t));

/** Progress of whichever window contains v, else 0. */
export const inWindows = (v: number, wins: readonly Win[]) => {
  const w = wins.find(([a, b]) => v >= a && v < b);
  return w ? segAt(v, w[0], w[1]) : 0;
};

/* Column of the storefront body. It is a size container, zoomed up on wide stages. */
export const COLUMN = "absolute inset-0 mx-auto flex w-full max-w-[440px] flex-col px-2 pb-5 pt-2 @[34rem]:[zoom:1.25]";

/* Complementary page swap: page k comes in from the left while page k - 1 is clipped away from the left, with a thin accent edge. */
function WipePage({ pos, k, children }: { pos: MV; k: number; children: ReactNode }) {
  const shown = useTransform(pos, (v) => clamp01(v - (k - 1)));
  const cover = useTransform(pos, (v) => clamp01(v - k));
  const clip = useTransform([shown, cover], ([s, c]: number[]) => `inset(0 ${pct(100 - s * 100)} 0 ${pct(c * 100)})`);
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

function WipeEdge({ pos, k }: { pos: MV; k: number }) {
  const front = useTransform(pos, (v) => clamp01(v - (k - 1)));
  const left = useTransform(front, (f) => pct(f * 100));
  const opacity = useTransform(front, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  return (
    <motion.i aria-hidden style={{ left, opacity }} className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
  );
}

export function WipePages({ pos, pages, className = "relative" }: { pos: MV; pages: readonly ReactNode[]; className?: string }) {
  return (
    <div className={className}>
      {pages.map((page, k) => (
        <WipePage key={k} pos={pos} k={k}>
          {page}
        </WipePage>
      ))}
      {pages.slice(1).map((_, i) => (
        <WipeEdge key={i} pos={pos} k={i + 1} />
      ))}
    </div>
  );
}

/* A card slot that starts as a dimmed ghost of the real card (dashed frame, real name) and turns into the card as t runs,
   left to right, behind a thin accent edge. */
export function RevealSlot({ t, ghost, children }: { t: MV; ghost: ReactNode; children: ReactNode }) {
  const cardClip = useTransform(t, (v) => (v >= 0.999 ? "none" : `inset(0 ${pct(100 - v * 100)} 0 0)`));
  const ghostClip = useTransform(t, (v) => `inset(0 0 0 ${pct(v * 100)})`);
  const edge = useTransform(t, (v) => pct(v * 100));
  const edgeOn = useTransform(t, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return (
    <div className="relative">
      <motion.div aria-hidden style={{ clipPath: ghostClip }} className="absolute inset-0 opacity-40">
        {ghost}
      </motion.div>
      <motion.div style={{ clipPath: cardClip }}>{children}</motion.div>
      <motion.i aria-hidden style={{ left: edge, opacity: edgeOn }} className="pointer-events-none absolute inset-y-0 z-10 w-0.5 -translate-x-1/2 rounded-full bg-accent" />
    </div>
  );
}

/* A block that trades its own height, t 0..1 open. Its content is only visible once most of the height is there,
   so the clip edge never slices a glyph, and a soft edge covers the last stretch. */
const FOLD_SHOW: Win = [0.9, 1];
const FEATHER = 12;

const featherMask = (t: number) => {
  if (t >= 0.999) return "none";
  const px = FEATHER * clamp01((1 - t) * 6);
  return `linear-gradient(to bottom, #000 calc(100% - ${px.toFixed(1)}px), transparent)`;
};

export function FoldBox({ t, h, className = "", children }: { t: MV; h: number; className?: string; children: ReactNode }) {
  const height = useTransform(t, (v) => v * h);
  const mask = useTransform(t, featherMask);
  const overflow = useTransform(t, (v) => (v >= 0.999 ? "visible" : "hidden"));
  const opacity = useTransform(t, (v) => segAt(v, FOLD_SHOW[0], FOLD_SHOW[1]));
  return (
    <motion.div style={{ height, overflow, maskImage: mask, WebkitMaskImage: mask }} className={`shrink-0 ${className}`}>
      <motion.div style={{ opacity }}>{children}</motion.div>
    </motion.div>
  );
}

/* Lines stacked in one row, `idx` slides them by position. Each line fades out before the next one shows,
   so two lines are never readable in the same frame and no half glyph ghosts across the clip edge. */
const ROLL_FADE: Win = [0.06, 0.46];

function RollLine({ idx, i, h, children }: { idx: MV; i: number; h: number; children: ReactNode }) {
  const opacity = useTransform(idx, (v) => 1 - segAt(Math.abs(v - i), ROLL_FADE[0], ROLL_FADE[1]));
  return (
    <motion.div style={{ opacity, height: h, lineHeight: `${h}px` }} className="truncate whitespace-nowrap">
      {children}
    </motion.div>
  );
}

export function RollLines({ idx, lines, h = 20, className = "" }: { idx: MV; lines: readonly ReactNode[]; h?: number; className?: string }) {
  const y = useTransform(idx, (v) => -v * h);
  return (
    <div className={`overflow-hidden ${className}`} style={{ height: h }}>
      <motion.div style={{ y }}>
        {lines.map((line, i) => (
          <RollLine key={i} idx={idx} i={i} h={h}>
            {line}
          </RollLine>
        ))}
      </motion.div>
    </div>
  );
}

const ARROW = "M0 0L0 16.5L4.2 12.8L7 19L9.6 17.9L6.9 11.9L12.4 11.7Z";

type PointerProps = {
  /** 0 far away, 1 on target. */
  t: MV;
  /** 0..1 tap. */
  press: MV;
  show: MV;
  from?: readonly [number, number];
  className?: string;
};

/* A pointer whose tip sits at the top left corner of this element, so the parent decides where it taps. */
export function Pointer({ t, press, show, from = [36, 46], className = "" }: PointerProps) {
  const x = useTransform(t, (v) => (1 - v) * from[0]);
  const y = useTransform(t, (v) => (1 - v) * from[1]);
  const dip = useTransform(press, (v) => 1 - 0.14 * bell(v));
  const ringScale = useTransform(press, (v) => 0.3 + 1.5 * clamp01(v));
  const ringOn = useTransform(press, (v) => (v > 0 && v < 1 ? (1 - v) * 0.9 : 0));
  return (
    <span aria-hidden className={`pointer-events-none absolute z-30 h-0 w-0 ${className}`}>
      <motion.span style={{ x, y, opacity: show }} className="absolute left-0 top-0 block">
        <motion.i style={{ scale: ringScale, opacity: ringOn }} className="absolute -left-2.5 -top-2.5 h-5 w-5 rounded-full border-2 border-accent" />
        <motion.svg style={{ scale: dip }} width="14" height="20" viewBox="0 0 13 20" className="absolute left-0 top-0 origin-top-left overflow-visible">
          <path d={ARROW} fill="var(--color-fg)" stroke="var(--color-bg)" strokeWidth="1.4" strokeLinejoin="round" />
        </motion.svg>
      </motion.span>
    </span>
  );
}

/* Neutral pill for the external pattern service. The dot turns accent while a request is in flight. */
export function ServicePill({ busy }: { busy: MV }) {
  const dot = useTransform(busy, (b) => mixColor("var(--color-accent)", b, "var(--color-mint)"));
  return (
    <span className="flex h-5 shrink-0 items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 pl-1.5 pr-2">
      <MtmGlyph name="api" size={12} />
      <span className={`${MONO} text-[10px] leading-none text-mute`}>{SERVICE.label}</span>
      <motion.i style={{ background: dot }} className="h-1.5 w-1.5 rounded-full" />
    </span>
  );
}

/* Pitch box: a card plus its bottom gap. translateY(-100%) is exactly one card slot. */
export const PITCH = `${CARD_PITCH}px`;
