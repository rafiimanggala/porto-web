"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { CHIP_POP, MARKER_BY_KEY, WORD_FADE, WORD_GLOW, WORD_GLOW_PEAK, type MarkerKey, type Span } from "./ChatSceneData";

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/* Small mono labels: 10px in a narrow stage, 11 then 12px as the mock gets room. */
export const LABEL = "text-[10px] @[30rem]:text-[11px] @[40rem]:text-[12px]";

const SPARK_W = 100;
const SPARK_PAD = 3;
const DOT_FREQ = 900;

type Domain = readonly [number, number];

function sparkY(v: number, dom: Domain, h: number) {
  const usable = h - SPARK_PAD * 2;
  return h - SPARK_PAD - ((v - dom[0]) / (dom[1] - dom[0])) * usable;
}

function sparkGeometry(series: readonly number[], h: number, dom: Domain) {
  const pts = series.map((v, i) => [(i / (series.length - 1)) * SPARK_W, sparkY(v, dom, h)] as const);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`).join(" ");
  const [endX, endY] = pts[pts.length - 1];
  return { d, endX, endY };
}

const seriesDomain = (series: readonly number[]): Domain => [Math.min(...series), Math.max(...series)];

type Mark = { idx: number; label: string };

type SparkProps = {
  t: MV;
  series: readonly number[];
  color: string;
  className: string;
  h?: number;
  domain?: Domain;
  floor?: { v: number; label: string };
  marks?: readonly Mark[];
  strokeClass: string;
};

/* A dot and value label that lands as the drawn line reaches its point. */
function SparkMark({ t, series, mark, h, dom, color }: { t: MV; series: readonly number[]; mark: Mark; h: number; dom: Domain; color: string }) {
  const last = series.length - 1;
  const at = mark.idx / last;
  const opacity = useTransform(t, [Math.max(0, at - 0.02), Math.min(1, at + 0.08)], [0, 1]);
  const x = at * 100;
  const y = (sparkY(series[mark.idx], dom, h) / h) * 100;
  const side = mark.idx === last ? "right-[-2px]" : "left-[-2px]";
  return (
    <motion.span aria-hidden style={{ left: `${x}%`, top: `${y}%`, opacity }} className="absolute h-0 w-0">
      <i className="absolute left-0 top-0 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ background: color }} />
      <b className={`${MONO} absolute bottom-[7px] ${side} ${LABEL} font-medium tabular-nums text-fg`}>{mark.label}</b>
    </motion.span>
  );
}

export function Spark({ t, series, color, className, h = 24, domain, floor, marks, strokeClass }: SparkProps) {
  const dom = domain ?? seriesDomain(series);
  const { d, endX, endY } = sparkGeometry(series, h, dom);
  const dotOp = useTransform(t, [0.85, 1], [0, 1]);
  return (
    <div className={`relative w-full ${className}`}>
      {floor ? (
        <div className="absolute inset-x-0 bottom-0 border-t border-dashed border-line-strong bg-accent/10" style={{ top: `${(sparkY(floor.v, dom, h) / h) * 100}%` }}>
          <span className={`${MONO} absolute -top-3.5 left-0 ${LABEL} text-dim`}>{floor.label}</span>
        </div>
      ) : null}
      <svg viewBox={`0 0 ${SPARK_W} ${h}`} preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible" fill="none">
        <motion.path d={d} strokeLinejoin="round" className={strokeClass} style={{ pathLength: t, stroke: color }} />
      </svg>
      {marks ? (
        marks.map((m) => <SparkMark key={m.idx} t={t} series={series} mark={m} h={h} dom={dom} color={color} />)
      ) : (
        <motion.i
          style={{ left: `${endX}%`, top: `${(endY / h) * 100}%`, opacity: dotOp, background: color }}
          className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
      )}
    </div>
  );
}

const CORNERS = [
  { k: "tl", sx: -1, sy: -1, cls: "-left-px -top-px border-l-2 border-t-2 rounded-tl-lg" },
  { k: "tr", sx: 1, sy: -1, cls: "-right-px -top-px border-r-2 border-t-2 rounded-tr-lg" },
  { k: "bl", sx: -1, sy: 1, cls: "-bottom-px -left-px border-b-2 border-l-2 rounded-bl-lg" },
  { k: "br", sx: 1, sy: 1, cls: "-bottom-px -right-px border-b-2 border-r-2 rounded-br-lg" },
] as const;

const RETICLE_TRAVEL = 9;

function Corner({ t, sx, sy, cls }: { t: MV; sx: number; sy: number; cls: string }) {
  const x = useTransform(t, (v) => sx * (1 - v) * RETICLE_TRAVEL);
  const y = useTransform(t, (v) => sy * (1 - v) * RETICLE_TRAVEL);
  const opacity = useTransform(t, [0, 0.25], [0, 1]);
  return <motion.i aria-hidden style={{ x, y, opacity }} className={`pointer-events-none absolute h-2.5 w-2.5 border-accent ${cls}`} />;
}

export function Reticle({ t }: { t: MV }) {
  return (
    <>
      {CORNERS.map((c) => (
        <Corner key={c.k} t={t} sx={c.sx} sy={c.sy} cls={c.cls} />
      ))}
    </>
  );
}

export function Word({ p, text, a }: { p: MV; text: string; a: number }) {
  const o = useSeg(p, a, a + WORD_FADE);
  const y = useTransform(o, (v) => (1 - v) * 4);
  const glow = useTransform(p, [a, a + WORD_GLOW_PEAK, a + WORD_GLOW], [0, 1, 0]);
  return (
    <span className="relative inline-block">
      <motion.i aria-hidden style={{ opacity: glow }} className="absolute -inset-x-0.5 inset-y-0 rounded-[3px] bg-accent/30" />
      <motion.span style={{ opacity: o, y }} className="relative inline-block">
        {text}
      </motion.span>
    </span>
  );
}

export function CiteChip({ p, marker, a }: { p: MV; marker: MarkerKey; a: number }) {
  const m = MARKER_BY_KEY[marker];
  const o = useSeg(p, a, a + CHIP_POP);
  const pop = useSeg(p, a, a + CHIP_POP, easeOutBack);
  const scale = useTransform(pop, (v) => 0.7 + 0.3 * v);
  const flash = useTransform(p, [a, a + 0.012, a + 0.05], [0, 1, 0]);
  return (
    <motion.span
      style={{ opacity: o, scale }}
      className={`relative mx-px inline-flex origin-left items-center gap-1 whitespace-nowrap rounded-md border border-line-strong bg-surface-2 py-px pl-[3px] pr-1.5 align-baseline ${MONO} text-[11px] leading-[1.5] text-fg @[30rem]:text-[13.5px]`}
    >
      <motion.i aria-hidden style={{ opacity: flash }} className="absolute inset-0 rounded-md bg-accent/35" />
      <b
        className="relative grid h-3.5 w-3.5 place-items-center rounded-full text-[10px] font-medium leading-none text-bg"
        style={{ background: m.color }}
      >
        {m.index}
      </b>
      <span className="relative">
        {m.label} {m.value} {m.unit}
      </span>
    </motion.span>
  );
}

function Dot({ p, i }: { p: MV; i: number }) {
  const wave = useTransform(p, (v) => Math.sin(v * DOT_FREQ + i * 1.3));
  const y = useTransform(wave, (w) => w * 2.4);
  const opacity = useTransform(wave, (w) => 0.75 + 0.25 * w);
  const scale = useTransform(wave, (w) => 0.92 + 0.08 * w);
  return <motion.i style={{ y, opacity, scale }} className="h-[5px] w-[5px] rounded-full bg-dim @[30rem]:h-1.5 @[30rem]:w-1.5" />;
}

/* Typing indicator: a small pill sitting where the answer text will land. */
export function TypingBubble({ p, span }: { p: MV; span: Span }) {
  const opacity = useTransform(p, [span[0], span[0] + 0.008, span[1] - 0.008, span[1]], [0, 1, 1, 0]);
  return (
    <motion.span
      aria-hidden
      style={{ opacity }}
      className="absolute left-3 top-0 flex h-6 items-center gap-1.5 rounded-full border border-line-strong bg-surface-2 px-2.5 @[30rem]:h-7 @[30rem]:gap-2 @[30rem]:px-3"
    >
      {[0, 1, 2].map((i) => (
        <Dot key={i} p={p} i={i} />
      ))}
    </motion.span>
  );
}

export function MarkerDot({ color, className = "" }: { color: string; className?: string }) {
  return <i className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${className}`} style={{ background: color }} />;
}
