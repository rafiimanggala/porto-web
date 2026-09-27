"use client";

import { motion, useTransform } from "framer-motion";
import { easeInOutCubic, easeOutBack, easeOutCubic, type MV } from "./HealthSceneParts";
import { Pulse, Wire } from "./PipeKitWire";
import { lerp } from "./PipeKitMath";
import { hm } from "./PipeIsolationData";
import { STUB_X, W, xPct, yPct } from "./PipeIsolationLayout";
import { MONO_TXT, Page, useLayout, useWin } from "./PipeIsolationKit";
import { CLOCK, LOG_T, WIPE, clockMinutes, popOf } from "./PipeIsolationTime";
import { FAILED_RUN, OK_RUN } from "./PipeKitData";
import type { Pt, WirePath } from "./PipeKitPath";

/* The clock: a small chip in the band header at 03:04 that grows into the middle of the gap between the lanes, on the
   stub axis, and ticks on to 06:00. Either side of it a label names the two runs. Also here: the rose leader from the
   failed tile to the log, and the two stubs that stop short of each other. */

const SMALL_X = 8;
const BIG_SCALE = 2.2;
const FACE = 24;
const HALF = FACE / 2;
const DEG = Math.PI / 180;
const STUB_DRAW: readonly [number, number] = [0.764, 0.792];
const STUB_CAP_R = 3.4;
const TEXT_AT: readonly [number, number] = [0.79, 0.81];
const LAYER = "pointer-events-none absolute inset-0 h-full w-full overflow-visible";
/** The caption sits this far below the clock's centre, between the chip and the lower cap. */
const CAPTION_DROP = 31;
const EDGE = 8;

function Hand({ deg, len, width }: { deg: MV; len: number; width: number }) {
  const x2 = useTransform(deg, (d) => HALF + len * Math.sin(d * DEG));
  const y2 = useTransform(deg, (d) => HALF - len * Math.cos(d * DEG));
  return <motion.line x1={HALF} y1={HALF} x2={x2} y2={y2} stroke="var(--color-fg)" strokeWidth={width} strokeLinecap="round" />;
}

function Face({ minutes }: { minutes: MV }) {
  const hour = useTransform(minutes, (m) => m * 0.5);
  const minute = useTransform(minutes, (m) => m * 6);
  return (
    <svg viewBox={`0 0 ${FACE} ${FACE}`} aria-hidden className="shrink-0" style={{ width: "clamp(12px,3.4cqw,20px)", height: "clamp(12px,3.4cqw,20px)" }}>
      <circle cx={HALF} cy={HALF} r="10.5" fill="color-mix(in oklab, var(--color-sun) 55%, transparent)" stroke="var(--color-fg)" strokeWidth="1.8" />
      <Hand deg={hour} len={5} width={2.2} />
      <Hand deg={minute} len={8} width={1.8} />
      <circle cx={HALF} cy={HALF} r="1.5" fill="var(--color-fg)" />
    </svg>
  );
}

export function ClockChip({ p }: { p: MV }) {
  const { stage, band, gapMid } = useLayout();
  const minutes = useTransform(p, clockMinutes);
  const text = useTransform(minutes, hm);
  const morph = useWin(p, CLOCK.morph, easeInOutCubic);
  const scale = useTransform(morph, (m) => lerp(1, BIG_SCALE, m));
  const drop = useTransform(p, (v) => (1 - popOf(v)) * -8);
  const left = useTransform(morph, (m) => xPct(lerp(SMALL_X, STUB_X, m), stage));
  const top = useTransform(morph, (m) => yPct(lerp(band.y + 0.5, gapMid, m), stage));
  const centre = useTransform(morph, (m) => `${(-50 * lerp(1, BIG_SCALE, m) * m).toFixed(2)}%`);
  const opacity = useWin(p, [CLOCK.pop[0], CLOCK.pop[0] + 0.006]);
  const lock = useWin(p, CLOCK.lock, easeOutCubic);
  const ringScale = useTransform(lock, (t) => 1 + 0.18 * t);
  const ringOpacity = useTransform(lock, [0, 0.08, 1], [0, 0.85, 0]);
  return (
    <motion.div style={{ left, top, scale, x: centre, y: centre, transformOrigin: "0% 0%" }} className="absolute z-30">
      <motion.div style={{ y: drop, opacity }} className={`${MONO_TXT} relative flex items-center gap-[0.5em] rounded-md border border-line-strong bg-surface-2 px-[0.5em] py-[0.1em] leading-none text-fg`}>
        <motion.i aria-hidden style={{ scale: ringScale, opacity: ringOpacity }} className="pointer-events-none absolute -inset-px rounded-md border border-accent" />
        <Face minutes={minutes} />
        <motion.span className="tabular-nums">{text}</motion.span>
      </motion.div>
    </motion.div>
  );
}

function Stub({ p, path, end }: { p: MV; path: WirePath; end: Pt }) {
  const draw = useWin(p, STUB_DRAW, easeOutCubic);
  const shown = useTransform(draw, (v) => (v > 0.001 ? 1 : 0));
  const cap = useWin(p, [STUB_DRAW[1] - 0.008, STUB_DRAW[1] + 0.008], easeOutBack);
  const r = useTransform(cap, (c) => STUB_CAP_R * c);
  return (
    <g>
      <motion.path d={path.d} fill="none" stroke="var(--color-dim)" strokeWidth={2} strokeLinecap="round" style={{ pathLength: draw, opacity: shown }} />
      <motion.circle cx={end[0]} cy={end[1]} r={r} fill="var(--color-bg)" stroke="var(--color-fg)" strokeWidth={1.6} />
    </g>
  );
}

/** A label at one edge of the gap, level with the clock. The right one lights up as the clock reaches its time. */
function EdgeLabel({ p, side, label, lit }: { p: MV; side: "left" | "right"; label: string; lit?: MV }) {
  const { stage, gapMid, monoTxt } = useLayout();
  const opacity = useWin(p, TEXT_AT);
  const place = side === "left" ? { left: xPct(EDGE, stage) } : { right: xPct(EDGE, stage) };
  return (
    <motion.p style={{ ...place, top: yPct(gapMid, stage), opacity }} className={`${monoTxt} absolute -translate-y-1/2 whitespace-nowrap leading-none`}>
      <span className="text-mute">{label}</span>
      {lit ? (
        <motion.span style={{ opacity: lit }} className="absolute inset-0 text-fg">
          {label}
        </motion.span>
      ) : null}
    </motion.p>
  );
}

/** Leader to the log, then the gap. Both sit over the stage but ride the same wipe as the band: the leader is consumed
   by the edge as it passes, the stubs and their captions are revealed by it, so neither one ever shows over the wrong page. */
export function GapLayer({ p }: { p: MV }) {
  const { stage, gapMid, stubs, leader, monoTxt } = useLayout();
  const leaderDraw = useWin(p, LOG_T.leader);
  const leaderOpacity = useWin(p, [LOG_T.leader[0] - 0.008, LOG_T.leader[0]]);
  const text = useWin(p, TEXT_AT);
  const textClip = useTransform(text, (t) => `inset(0 ${(50 - t * 50).toFixed(2)}% 0 ${(50 - t * 50).toFixed(2)}%)`);
  const lit = useWin(p, CLOCK.lock, easeOutCubic);
  return (
    <>
      <Page p={p} leave={WIPE.gap} className="z-20">
        <svg viewBox={`0 0 ${W} ${stage.h}`} className={LAYER} aria-hidden>
          <motion.g style={{ opacity: leaderOpacity }}>
            <Wire path={leader} draw={leaderDraw} tone="rose" arrow />
            <Pulse path={leader} progress={leaderDraw} tone="rose" />
          </motion.g>
        </svg>
      </Page>
      <Page p={p} enter={WIPE.gap} className="z-20">
        <svg viewBox={`0 0 ${W} ${stage.h}`} className={LAYER} aria-hidden>
          <Stub p={p} path={stubs.top} end={stubs.topEnd} />
          <Stub p={p} path={stubs.bottom} end={stubs.bottomEnd} />
        </svg>
        <motion.p
          style={{ left: xPct(STUB_X, stage), top: yPct(gapMid + CAPTION_DROP, stage), clipPath: textClip }}
          className={`${monoTxt} absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap leading-none text-dim`}
        >
          no shared path
        </motion.p>
        <EdgeLabel p={p} side="left" label={`${FAILED_RUN.at} failed`} />
        <EdgeLabel p={p} side="right" label={`${OK_RUN.at} starts`} lit={lit} />
      </Page>
    </>
  );
}
