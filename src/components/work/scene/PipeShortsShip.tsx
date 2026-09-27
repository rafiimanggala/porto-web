"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { NODE, fmtClock } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { clamp01 } from "./PipeKitMath";
import { PipePhone } from "./PipeKitPhone";
import { Pulse, Wire, cubicPath, type WirePath } from "./PipeKitWire";
import { SlideArt } from "./PipeShortsArt";
import { CLIP_TOTAL, FACTS, FH, FW, PLATFORM_LIST, SLIDES, TL, tickAt } from "./PipeShortsData";
import { Gate, TickBadge, boxStyle, pctX, pctY, unit } from "./PipeShortsKit";
import { insetLeft } from "./PipeShortsMath";

/* Chapter 4 stage: the render walks the five clips into one finished 9:16 video, a phone plays it once it is complete, and
   that single upload fans out to three platform tiles that tick one by one. Then the whole panel settles: tiles pulse, the
   phone lifts. */

const FACT_X = 8;
const FACT_Y = 138;
const FACT_STEP = 14;
const PHONE = { x: 118, y: 112, w: 80 } as const;
const PHONE_OUT = [PHONE.x + PHONE.w, PHONE.y + 68] as const;
const TILE = { x: 228, w: 124, h: 42, gap: 8, y: 112 } as const;
const NAME_TEXT = "text-[length:clamp(10px,calc(var(--u)*10),12.5px)]";
const ARROW = "M-6.5 -3.6L0 0L-6.5 3.6Z";
const tileY = (k: number) => TILE.y + k * (TILE.h + TILE.gap);
const WIRES: readonly WirePath[] = PLATFORM_LIST.map((_, k) => cubicPath(PHONE_OUT, [TILE.x, tileY(k) + TILE.h / 2]));
const WIRE_STAGGER = 0.008;
const WIRE_DUR = 0.02;

/* ---------- Render facts ---------- */

function Fact({ p, k, text }: { p: MV; k: number; text: string }) {
  const t = useSeg(p, TL.timeText[1] + k * 0.005, TL.timeText[1] + k * 0.005 + 0.014);
  const clip = useTransform(t, insetLeft);
  return (
    <motion.span style={{ clipPath: clip, left: pctX(FACT_X), top: pctY(FACT_Y + k * FACT_STEP) }} className="absolute whitespace-nowrap text-fg">
      {text}
    </motion.span>
  );
}

function RenderPanel({ p, r }: { p: MV; r: MV }) {
  const head = useSeg(p, TL.wipe2[0] + 0.012, TL.wipe2[1]);
  const pct = useTransform(r, (v) => `${Math.round(v * 100)}%`);
  const done = useSeg(r, 0.96, 1);
  return (
    <>
      <motion.span style={{ opacity: head, left: pctX(FACT_X), top: pctY(114) }} className="absolute flex items-center gap-[5px] text-dim">
        <PipeGlyph name={NODE.render.glyph} size={unit(15)} />
        {NODE.render.label}
      </motion.span>
      {FACTS.map((text, k) => (
        <Fact key={text} p={p} k={k} text={text} />
      ))}
      <i aria-hidden style={boxStyle(FACT_X, 204, 88, 4)} className="absolute overflow-hidden rounded-full bg-line-strong">
        <motion.i style={{ scaleX: r }} className="absolute inset-0 origin-left bg-accent" />
      </i>
      <span style={{ left: pctX(FACT_X), top: pctY(216) }} className="absolute flex items-center gap-[6px]">
        <motion.span className="t-h3 text-[length:clamp(20px,calc(var(--u)*22),28px)] leading-none tabular-nums">{pct}</motion.span>
        <TickBadge pop={done} size={14} />
      </span>
    </>
  );
}

/* ---------- The finished video on a phone ---------- */

/** Which slide the playhead is on, 0 to 4, moving to the next one during the last part of each slide's time. */
const slideIndex = (v: number) => {
  const s = v * SLIDES.length;
  const base = Math.min(SLIDES.length - 1, Math.floor(s));
  const e = base < SLIDES.length - 1 ? clamp01((s - base - 0.72) / 0.28) : 0;
  return base + easeInOutCubic(e);
};

/** Every slide fills the whole screen. A cut hands the screen from one slide to the next along one moving edge: the slide
   before it keeps the left part, the one after it takes the right part, so the two always tile the screen exactly. */
function PhoneSlide({ pl, at, j }: { pl: MV; at: MV; j: number }) {
  const move = useTransform(pl, (v) => clamp01(v * SLIDES.length - j));
  const clip = useTransform(at, (v) => `inset(0 ${(clamp01(v - j) * 100).toFixed(2)}% 0 ${(clamp01(j - v) * 100).toFixed(2)}%)`);
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0">
      <SlideArt kind={j} move={move} />
    </motion.div>
  );
}

function CutEdge({ at }: { at: MV }) {
  const left = useTransform(at, (v) => `${((1 - (v - Math.floor(v))) * 100).toFixed(2)}%`);
  const opacity = useTransform(at, (v) => Math.min(1, Math.sin(Math.PI * (v - Math.floor(v))) * 3));
  return <motion.i aria-hidden style={{ left, opacity }} className="absolute inset-y-0 z-[5] w-[2px] -translate-x-1/2 bg-accent" />;
}

function PhoneScreen({ r, pl }: { r: MV; pl: MV }) {
  const at = useTransform(pl, slideIndex);
  const on = useSeg(r, 0.97, 1);
  const waiting = useTransform(on, (v) => 1 - v);
  const time = useTransform(pl, (v) => fmtClock(Math.round(v * CLIP_TOTAL)));
  return (
    <>
      <motion.span style={{ opacity: waiting }} className="absolute inset-0 grid place-items-center">
        <PipeGlyph name={NODE.render.glyph} size={26} className="opacity-50" />
        <i aria-hidden className="absolute inset-x-[24%] top-[62%] h-[3px] overflow-hidden rounded-full bg-line-strong">
          <motion.i style={{ scaleX: r }} className="absolute inset-0 origin-left bg-accent" />
        </i>
      </motion.span>
      <motion.div style={{ opacity: on }} className="absolute inset-0">
        {SLIDES.map((s, j) => (
          <PhoneSlide key={s.title} pl={pl} at={at} j={j} />
        ))}
        <CutEdge at={at} />
        <span className="absolute bottom-[7%] left-1/2 z-[6] -translate-x-1/2 rounded bg-surface-1/85 px-[4px] py-[1px] font-[ui-monospace,SFMono-Regular,Menlo,monospace] text-[10px] leading-[1.2] tabular-nums text-fg">
          <motion.span>{time}</motion.span>
        </span>
        <motion.i aria-hidden style={{ scaleX: pl }} className="absolute bottom-0 left-0 z-[6] h-[3px] w-full origin-left bg-accent" />
      </motion.div>
    </>
  );
}

function Phone({ p, r, pl }: { p: MV; r: MV; pl: MV }) {
  const rise = useSeg(p, TL.wipe2[0] + 0.008, TL.wipe2[1] + 0.01, easeOutCubic);
  const lift = useSeg(p, TL.payoff[0], TL.payoff[0] + 0.03, easeOutCubic);
  const y = useTransform([rise, lift], ([a, l]: number[]) => `${((1 - a) * 6 - l * 1.2).toFixed(2)}%`);
  const scale = useTransform(lift, (l) => 1 + 0.03 * l);
  return (
    <div style={{ left: pctX(PHONE.x), top: pctY(PHONE.y) }} className="absolute">
      <PipePhone width={unit(PHONE.w)} style={{ opacity: rise, y, scale }}>
        <PhoneScreen r={r} pl={pl} />
      </PipePhone>
    </div>
  );
}

/* ---------- One upload, three platforms ---------- */

function PlatformWire({ p, k }: { p: MV; k: number }) {
  const at = TL.upload[0] + k * WIRE_STAGGER;
  const draw = useSeg(p, at, at + WIRE_DUR);
  const head = useSeg(p, at + WIRE_DUR - 0.006, at + WIRE_DUR);
  const [x, y] = WIRES[k].at(1);
  return (
    <Gate p={p} at={TL.upload[0] - 0.02}>
      <Wire path={WIRES[k]} draw={draw} />
      <g transform={`translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${WIRES[k].angleAt(1).toFixed(2)})`}>
        <motion.path d={ARROW} style={{ opacity: head }} fill="var(--color-accent)" stroke="var(--color-accent)" strokeWidth={1.2} strokeLinejoin="round" />
      </g>
      <Pulse path={WIRES[k]} progress={draw} trail={1} />
    </Gate>
  );
}

function PlatformTile({ p, k }: { p: MV; k: number }) {
  const appear = useSeg(p, TL.wipe2[0] + 0.01 + k * 0.006, TL.wipe2[1] + 0.006 + k * 0.006, easeOutCubic);
  const lit = useSeg(p, TL.upload[0] + WIRE_DUR - 0.006 + k * WIRE_STAGGER, TL.upload[0] + WIRE_DUR + 0.004 + k * WIRE_STAGGER);
  const posted = useSeg(p, tickAt(k), tickAt(k) + TL.tick.dur);
  const pop = useSeg(p, tickAt(k), tickAt(k) + TL.tick.dur, easeOutBack);
  const beat = useSeg(p, TL.payoff[0], TL.payoff[0] + 0.03);
  const y = useTransform(appear, (v) => `${((1 - v) * 14).toFixed(2)}%`);
  const scale = useTransform(beat, (v) => 1 + 0.045 * Math.sin(Math.PI * v));
  return (
    <motion.div style={{ ...boxStyle(TILE.x, tileY(k), TILE.w, TILE.h), opacity: appear, y, scale }} className="absolute flex items-center gap-[6px] rounded-md border border-line-strong bg-surface-2 px-[6px]">
      <motion.i aria-hidden style={{ opacity: lit }} className="absolute -inset-px rounded-md border-2 border-accent" />
      <motion.i aria-hidden style={{ opacity: posted }} className="absolute -inset-px rounded-md border-2 border-mint" />
      <PipeGlyph name={NODE.shorts.glyph} size={unit(20)} className="relative shrink-0" />
      <span className={`relative min-w-0 flex-1 leading-[1.15] text-fg ${MONO} ${NAME_TEXT}`}>{PLATFORM_LIST[k]}</span>
      <TickBadge pop={pop} size={15} className="relative" />
    </motion.div>
  );
}

export default function ShipView({ p }: { p: MV }) {
  const r = useSeg(p, TL.render[0], TL.render[1]);
  const pl = useSeg(p, TL.play[0], TL.play[1]);
  return (
    <>
      <svg viewBox={`0 0 ${FW} ${FH}`} className="absolute inset-0 h-full w-full" aria-hidden>
        {PLATFORM_LIST.map((name, k) => (
          <PlatformWire key={name} p={p} k={k} />
        ))}
      </svg>
      <RenderPanel p={p} r={r} />
      <Phone p={p} r={r} pl={pl} />
      {PLATFORM_LIST.map((name, k) => (
        <PlatformTile key={name} p={p} k={k} />
      ))}
    </>
  );
}
