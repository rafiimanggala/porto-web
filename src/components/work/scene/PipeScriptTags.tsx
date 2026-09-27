"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { PipeGlyph } from "./PipeKitGlyphs";
import { PipeNode } from "./PipeKitNode";
import { clamp01, lerp, segAt, useSpan } from "./PipeKitMath";
import { AW, AH, SPAWN_RIPPLES, TL } from "./PipeScriptData";
import { CHIPS, CHIP_H, ORIGIN, SCAN_Y, SPAWN, type ChipSpec } from "./PipeScriptLayout";
import { TXT, X, Y, blend, fs, ripples, tri, u } from "./PipeScriptKit";

/* Chapter three: twelve trending tags fan out of the trends endpoint, a scan line keeps four and lets the other eight
   dim, drift a short way and fade (never over a kept tag), and the kept chips snap into the slots under the caption. */

const DIM = 0.68;
/** A discarded tag is gone once this share of its drift is done. */
const FADE_BY = 0.65;

type ChipState = { x: number; y: number; opacity: number; scale: number; mark: number };

function chipState(v: number, c: ChipSpec, i: number): ChipState {
  const enter = segAt(v, c.spawn, c.spawn + TL.spawn.dur, easeOutCubic);
  const decide = segAt(v, c.decide, c.decide + 0.01);
  const awayAt = c.decide + TL.away.lag;
  const away = c.kept ? 0 : segAt(v, awayAt, awayAt + TL.away.dur);
  const gone = segAt(away, 0, FADE_BY);
  const trip = c.dest ? segAt(v, c.gather, c.gather + TL.gather.dur, easeOutBack) : 0;
  const sway = enter * (1 - decide);
  const bx = lerp(SPAWN[0], c.slot[0], enter) + Math.sin(v * 34 + i * 1.9) * 1.4 * sway + c.drift[0] * away;
  const by = lerp(SPAWN[1], c.slot[1], enter) + Math.cos(v * 29 + i * 2.6) * 1.1 * sway + c.drift[1] * away;
  const seen = clamp01((enter - 0.08) / 0.3);
  return {
    x: c.dest ? lerp(bx, c.dest[0], trip) : bx,
    y: c.dest ? lerp(by, c.dest[1], trip) : by,
    opacity: c.kept ? seen : seen * (1 - DIM * decide) * (1 - gone),
    scale: (0.9 + 0.1 * enter) * (c.kept ? 1 + 0.05 * decide + 0.07 * tri(v, TL.pill[1], 0.016) : 1 - 0.08 * away),
    mark: c.kept ? decide : 0,
  };
}

function CloudChip({ p, chip, i }: { p: MV; chip: ChipSpec; i: number }) {
  const st = useTransform(p, (v) => chipState(v, chip, i));
  const left = useTransform(st, (s) => X(s.x));
  const top = useTransform(st, (s) => Y(s.y));
  const opacity = useTransform(st, (s) => s.opacity);
  const scale = useTransform(st, (s) => s.scale);
  const mark = useTransform(st, (s) => s.mark);
  const color = useTransform(mark, (m) => blend("var(--color-dim)", "var(--color-fg)", m));
  return (
    <motion.div aria-hidden style={{ left, top, opacity, scale }} className="absolute z-10 h-0 w-0">
      <span
        style={{ width: u(chip.w), height: u(CHIP_H), fontSize: fs(TXT) }}
        className={`${MONO} absolute left-0 top-0 grid -translate-x-1/2 -translate-y-1/2 place-items-center whitespace-nowrap rounded-[4px] border border-line-strong bg-surface-2`}
      >
        <motion.i aria-hidden style={{ opacity: mark }} className="absolute -inset-px rounded-[4px] border border-accent bg-accent/25" />
        <motion.span style={{ color }} className="relative">
          {chip.tag}
        </motion.span>
      </span>
    </motion.div>
  );
}

function ScanLine({ p }: { p: MV }) {
  const t = useSeg(p, TL.scan[0], TL.scan[1]);
  const top = useTransform(t, (v) => Y(lerp(SCAN_Y[0], SCAN_Y[1], v)));
  const opacity = useTransform(t, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  return (
    <motion.div aria-hidden style={{ top, opacity }} className="pointer-events-none absolute inset-x-0 z-[5] h-0">
      <i className="absolute inset-x-0 top-0 h-0.5 -translate-y-1/2 rounded-full bg-accent" />
      <span style={{ left: X(AW - 14), width: u(20), height: u(20) }} className="absolute top-0 grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-accent bg-surface-2">
        <PipeGlyph name="filter" size="70%" />
      </span>
    </motion.div>
  );
}

/** The endpoint the tags come from: a globe tile that ripples as each batch leaves it. */
function Origin({ p }: { p: MV }) {
  const opacity = useSpan(p, TL.origin[0], TL.origin[1], 0.012);
  const pulse = useTransform(p, (v) => ripples(v, SPAWN_RIPPLES, 0.04));
  return (
    <motion.div aria-hidden style={{ opacity }} className="absolute inset-0">
      <PipeNode glyph="globe" size={u(24)} at={[(ORIGIN[0] / AW) * 100, ((ORIGIN[1] - 4) / AH) * 100]} pulse={pulse} />
    </motion.div>
  );
}

export function TagCloud({ p }: { p: MV }) {
  return (
    <>
      <Origin p={p} />
      <ScanLine p={p} />
      {CHIPS.map((c, i) => (
        <CloudChip key={c.tag} p={p} chip={c} i={i} />
      ))}
    </>
  );
}
