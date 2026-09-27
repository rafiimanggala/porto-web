"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeOutBack, type MV } from "./HealthSceneParts";
import { BYTES_TL, CSS_TEXT, FONT, FOUND_FROM, HEX, RULER_PX, type PROBES } from "./MtmDebugSceneData";
import { CODE, Pending, Roll, Typed } from "./MtmDebugSceneKit";
import { keyframes, useWin, type Win } from "./MtmDebugSceneMath";
import { mixColor } from "./MtmKitMath";

/* Shared parts of the three probe rows: the head with its reading and ruler, the frame, and the byte dump. */

export const ROSE = "var(--color-rose)";
export const MINT = "var(--color-mint)";
export const ACCENT = "var(--color-accent)";
export const LINE = "var(--color-line-strong)";
const RULER_W = FONT.livePx * RULER_PX;
const CELL = 3;

type Probe = (typeof PROBES)[number];

/** Frame colour of a proof row: accent while it is probed, mint once the verdict is in. */
export function useProofBorder(p: MV, win: Win) {
  const verdict = useWin(p, BYTES_TL.verdict);
  const active = useTransform(p, (v) => keyframes(v, [win[0], win[0] + 0.008, win[1] - 0.01, win[1]], [0, 1, 1, 0], (t) => t));
  return useTransform([verdict, active], ([d, a]: number[]) => mixColor(MINT, d, mixColor(ACCENT, a, LINE)));
}

export function Frame({ border, children }: { border: MotionValue<string>; children: ReactNode }) {
  return (
    <motion.div style={{ borderColor: border }} className="relative rounded-lg border bg-surface-2 px-2.5 py-3">
      {children}
    </motion.div>
  );
}

/** Ruler: one tick per px of font size, a bar of that length grows over it. */
export function Ruler({ t, px, color }: { t: MV; px: number; color: string }) {
  return (
    <span aria-hidden style={{ width: FONT.livePx * RULER_PX }} className="relative ml-auto mt-0.5 block h-1.5">
      <i className="absolute inset-0 [background-image:repeating-linear-gradient(90deg,var(--color-line-strong)_0_1px,transparent_1px_6px)]" />
      <motion.i style={{ scaleX: t, width: px * RULER_PX, background: color }} className="absolute inset-y-[1px] left-0 origin-left rounded-[1px]" />
    </span>
  );
}

export function Head({ probe, icon, reading }: { probe: Probe; icon: ReactNode; reading: ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-md bg-surface-1">{icon}</span>
      <div className="min-w-0 leading-tight">
        <p className={`${MONO} text-[12px] text-fg`}>{probe.label}</p>
        <p className={`${MONO} text-[10px] text-mute`}>{probe.sub}</p>
      </div>
      <div style={{ width: RULER_W }} className="ml-auto text-right">
        {reading}
      </div>
    </div>
  );
}

/** The value of a proof row: a question mark until the bytes are read, then the number rolls in. */
export function Reading({ found, color }: { found: MV; color: string }) {
  return (
    <>
      <Roll
        t={found}
        h={24}
        align="end"
        a={<span className={`${MONO} text-[14px] text-mute`}>?</span>}
        b={<span className="t-h3 text-[20px] text-mint">{FONT.live}</span>}
      />
      <Ruler t={found} px={FONT.livePx} color={color} />
    </>
  );
}

function Cells({ items, className }: { items: readonly string[]; className: string }) {
  return (
    <span className={`inline-flex ${className}`}>
      {items.map((c, i) => (
        <span key={i} className="mr-[1ch] inline-block w-[2ch] text-center last:mr-0">
          {c}
        </span>
      ))}
    </span>
  );
}

const CHARS = Array.from(CSS_TEXT);
const FOUND_WIDTH = CELL * (CHARS.length - FOUND_FROM) - 1;
const PENDING_W = `${CELL * HEX.length - 1}ch`;

/** Hex of the stored bytes typed out, then decoded under it; the value's own bytes light up when found. */
export function Dump({ p, win }: { p: MV; win: Win }) {
  const a = win[0];
  const hex = useWin(p, [a + 0.006, a + 0.022]);
  const ascii = useWin(p, [a + 0.022, a + 0.04]);
  const found = useWin(p, [a + 0.04, a + 0.05]);
  return (
    <div className={`${CODE} relative mt-2.5`}>
      <motion.i
        aria-hidden
        style={{ opacity: found, left: `${CELL * FOUND_FROM - 0.5}ch`, width: `${FOUND_WIDTH + 1}ch` }}
        className="absolute inset-y-0 rounded-sm bg-mint/25"
      />
      <div className="relative h-[15px]">
        <Pending t={hex} width={PENDING_W} />
        <Typed t={hex}>
          <Cells items={HEX} className="text-dim" />
        </Typed>
      </div>
      <div className="relative h-[15px]">
        <Pending t={ascii} width={PENDING_W} />
        <Typed t={ascii}>
          <Cells items={CHARS} className="text-fg" />
        </Typed>
      </div>
    </div>
  );
}

/** Pop-in used by the verdict chips. */
export function usePop(p: MV, win: Win) {
  return useWin(p, win, easeOutBack);
}
