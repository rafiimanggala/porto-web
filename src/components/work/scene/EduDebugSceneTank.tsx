"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import {
  CODE_STAMP,
  DRAIN,
  FILL,
  FLAT_NOTE,
  LIMIT_LINE,
  LIMIT_NOTE,
  LIMIT_PER_HOUR,
  PER_TOKEN,
  QUEUE_TOTAL,
  THROAT_FADE,
  THROAT_POP,
  THROAT_SQUEEZE,
  TOKENS,
  TOKEN_COLS,
  TOKEN_ROWS,
  drainAt,
  etaAt,
  fmtTidy,
  levelRowsAt,
  oldestAt,
  queuedAt,
} from "./EduDebugSceneData";
import { CheckMark, EnvelopeIcon, ValveGlyph } from "./EduDebugSceneIcons";
import { LABEL, MonoLabel, PAD, Roll, pct } from "./EduDebugSceneKit";

/* Queue tank page, shown in the fill chapter and again in the drain chapter. */

export type TankMode = "fill" | "drain";

const SPARK_START = 0.004;
const SPARK_END = 0.2;
const SAMPLES = 12;
const SCALE_TOP = 10000;
const GRID_SHARE = (100 * QUEUE_TOTAL) / SCALE_TOP;
const GAUGE_SHARE = 16;
/* Rows that dissolve at the tank floor while the pile sinks, so a half-drained row never shows as a sliver. */
const FLOOR_FADE_ROWS = 1.3;
const FLOOR_FADE_SHARE = (100 * FLOOR_FADE_ROWS) / TOKEN_ROWS;
const FLOOR_FADE_RAMP = 12;
const FLOOR_HOLE_SHARE = 4;
const DISPLAY_FACE = "var(--font-display)";
/* The display face draws its zero as a pill with a bar, so the final numeral uses a plain mono zero. */
const ZERO_FACE = "ui-monospace, SFMono-Regular, Menlo, monospace";
/* The check lands while the last row is still leaving, so the tank is never an empty, unstamped box. */
const BADGE_LEAD = 0.01;
const TICKS = [
  { at: 2500, label: "2.5k" },
  { at: 5000, label: "5k" },
  { at: 7500, label: "7.5k" },
  { at: 10000, label: "10k" },
] as const;

/* Top row first; k is the fill order. */
const CELLS = Array.from({ length: TOKENS }, (_, d) => {
  const row = Math.floor(d / TOKEN_COLS);
  return (TOKEN_ROWS - 1 - row) * TOKEN_COLS + (d % TOKEN_COLS);
});

const GRID_STYLE = {
  gridTemplateColumns: `repeat(${TOKEN_COLS}, minmax(0, 1fr))`,
  gridTemplateRows: `repeat(${TOKEN_ROWS}, minmax(0, 1fr))`,
} as const;

function Token({ p, k }: { p: MV; k: number }) {
  const a = FILL.start + k * FILL.step;
  const t = useSeg(p, a, a + FILL.drop, easeOutCubic);
  const y = useTransform(t, (v) => pct(-(1 - v) * 90));
  const scale = useTransform(t, (v) => 0.6 + 0.4 * v);
  return (
    <motion.div style={{ opacity: t, y, scale }} className="grid place-items-center">
      <EnvelopeIcon className="h-full w-full" />
    </motion.div>
  );
}

function Gauge() {
  return (
    <>
      {TICKS.map((t) => (
        <span
          key={t.label}
          style={{ bottom: `${(t.at / SCALE_TOP) * 100}%`, width: `${GAUGE_SHARE}%` }}
          className={`${MONO} absolute right-0 translate-y-1/2 text-right text-[10px] leading-none text-mute @[30rem]:text-[11px]`}
        >
          {t.label}
        </span>
      ))}
    </>
  );
}

function ClearBadge({ p }: { p: MV }) {
  const start = DRAIN[1] - BADGE_LEAD;
  const t = useSeg(p, start, start + 0.03, easeOutBack);
  const opacity = useSeg(p, start, start + 0.012);
  const scale = useTransform(t, (v) => 0.6 + 0.4 * v);
  return (
    <motion.div style={{ opacity, scale }} className="absolute inset-0 grid place-content-center justify-items-center gap-2">
      <span className="grid h-[clamp(30px,8cqw,48px)] w-[clamp(30px,8cqw,48px)] place-items-center rounded-full bg-mint text-pastel-ink">
        <CheckMark className="h-[65%] w-[65%]" />
      </span>
      <span className={`${LABEL} text-fg`}>queue clear</span>
    </motion.div>
  );
}

function Tank({ p, mode }: { p: MV; mode: TankMode }) {
  const slide = useTransform(p, (v) => pct(drainAt(v) * 100));
  const line = useTransform(p, (v) => pct((levelRowsAt(v) / TOKEN_ROWS) * GRID_SHARE));
  const lineOn = useTransform(p, (v) => (levelRowsAt(v) > 0.02 ? 1 : 0));
  const floorFade = useTransform(p, (v) => {
    const on = Math.min(1, drainAt(v) * FLOOR_FADE_RAMP);
    return `linear-gradient(to top, transparent ${(on * FLOOR_HOLE_SHARE).toFixed(2)}%, #000 ${(on * FLOOR_FADE_SHARE).toFixed(2)}%)`;
  });
  return (
    <div className="relative min-h-0 w-full flex-none aspect-[1/1.65] max-h-full rounded-lg border border-line-strong bg-bg/50 @[30rem]:aspect-[1/1.14]">
      <div className="absolute inset-[clamp(5px,1.6cqw,9px)]">
        <Gauge />
        <div style={{ width: `${100 - GAUGE_SHARE}%` }} className="absolute inset-y-0 left-0">
          <motion.div
            style={{ height: `${GRID_SHARE}%`, maskImage: floorFade, WebkitMaskImage: floorFade }}
            className="absolute inset-x-0 bottom-0 overflow-hidden"
          >
            <motion.div style={{ y: slide, ...GRID_STYLE }} className="absolute inset-0 grid gap-[clamp(1px,0.45cqw,3px)]">
              {CELLS.map((k) => (
                <Token key={k} p={p} k={k} />
              ))}
            </motion.div>
          </motion.div>
          <motion.i aria-hidden style={{ bottom: line, opacity: lineOn }} className="absolute inset-x-0 h-0.5 rounded-full bg-accent" />
        </div>
      </div>
      {mode === "drain" ? <ClearBadge p={p} /> : null}
    </div>
  );
}

function Throat({ p, mode }: { p: MV; mode: TankMode }) {
  const pop = useSeg(p, THROAT_POP[0], THROAT_POP[1], easeOutBack);
  const opacity = useSeg(p, THROAT_FADE[0], THROAT_FADE[1]);
  const scale = useTransform(pop, (v) => 0.6 + 0.4 * v);
  const squeeze = useSeg(p, THROAT_SQUEEZE[0], THROAT_SQUEEZE[1]);
  const row = "mt-0.5 h-[clamp(24px,4.8cqh,36px)]";
  return (
    <div className="flex flex-none flex-col items-center">
      <i aria-hidden className="-mt-px h-[clamp(8px,1.7cqh,12px)] w-[14%] border-x border-line-strong" />
      {mode === "fill" ? (
        <span className={`${LABEL} ${row} mt-1.5 flex items-center`}>to smtp provider</span>
      ) : (
        <motion.span style={{ opacity, scale }} className={`${row} grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2`}>
          <span />
          <ValveGlyph squeeze={squeeze} turn={squeeze} className="h-[clamp(24px,4.8cqh,36px)] w-auto" />
          <span className={`${MONO} whitespace-nowrap text-[10.5px] text-fg @[30rem]:text-[12.5px]`}>{LIMIT_PER_HOUR} / hr</span>
        </motion.span>
      )}
    </div>
  );
}

function SampleDot({ p, i }: { p: MV; i: number }) {
  const x = (i + 0.5) / SAMPLES;
  const at = SPARK_START + x * (SPARK_END - SPARK_START);
  const opacity = useSeg(p, at, at + 0.008);
  return <motion.i aria-hidden style={{ opacity, left: pct(x * 100) }} className="absolute top-1/2 h-[5px] w-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky" />;
}

function SentLine({ p, mode }: { p: MV; mode: TankMode }) {
  const draw = useSeg(p, SPARK_START, SPARK_END);
  const limit = useSeg(p, LIMIT_LINE[0], LIMIT_LINE[1], easeOutCubic);
  const scaleX = mode === "drain" ? 1 : draw;
  const limitClip = useTransform(limit, (v) => `inset(0 ${pct(100 - v * 100)} 0 0)`);
  return (
    <div className="relative mt-[clamp(6px,1.4cqh,12px)] h-[clamp(22px,5.5cqh,40px)] border-b border-dashed border-line-strong">
      <motion.i aria-hidden style={{ scaleX }} className="absolute inset-x-0 top-1/2 h-0.5 origin-left -translate-y-1/2 rounded-full bg-sky" />
      {mode === "drain" ? (
        <motion.i aria-hidden style={{ clipPath: limitClip }} className="absolute inset-x-0 top-1/2 h-0 -translate-y-1/2 border-t-2 border-dashed border-accent" />
      ) : (
        Array.from({ length: SAMPLES }, (_, i) => <SampleDot key={i} p={p} i={i} />)
      )}
    </div>
  );
}

function SentCard({ p, mode }: { p: MV; mode: TankMode }) {
  const note = useSeg(p, LIMIT_NOTE[0], LIMIT_NOTE[1]);
  const flat = useSeg(p, FLAT_NOTE[0], FLAT_NOTE[1]);
  return (
    <div className="rounded-lg border border-line bg-bg/40 px-[clamp(8px,2.4cqw,14px)] py-[clamp(6px,1.6cqh,12px)]">
      <div className="flex items-baseline justify-between gap-2">
        <MonoLabel>sent / hr</MonoLabel>
        <span className="t-h3 text-[clamp(1.15rem,5cqw,1.7rem)] leading-none tabular-nums">{LIMIT_PER_HOUR}</span>
      </div>
      <SentLine p={p} mode={mode} />
      <div className={`${LABEL} mt-1.5 h-[1.3em] normal-case tracking-normal`}>
        {mode === "fill" ? (
          <motion.span style={{ opacity: flat }}>flat, no dips</motion.span>
        ) : (
          <motion.span style={{ opacity: note }} className="text-fg">
            = provider limit
          </motion.span>
        )}
      </div>
    </div>
  );
}

function ReadRow({ label, text }: { label: string; text: MotionValue<string> }) {
  return (
    <div className="flex items-baseline justify-between gap-2 whitespace-nowrap">
      <MonoLabel>{label}</MonoLabel>
      <motion.span className={`${MONO} text-[12px] tabular-nums text-fg @[30rem]:text-[15px]`}>{text}</motion.span>
    </div>
  );
}

function StatusChip({ p, mode }: { p: MV; mode: TankMode }) {
  const roll = useSeg(p, CODE_STAMP[0], CODE_STAMP[1]);
  const errors = (
    <span className="flex items-center gap-1.5">
      <i className="h-1.5 w-1.5 rounded-full bg-mint" />
      errors 0
    </span>
  );
  const code = (
    <span className="flex items-center gap-1.5">
      <CheckMark className="h-3 w-3 text-mint" />
      code diff 0 lines
    </span>
  );
  return (
    <div className={`${MONO} rounded-md border border-line bg-bg/40 px-[clamp(8px,2.4cqw,14px)] py-[clamp(4px,1cqh,8px)] text-[10.5px] text-fg @[30rem]:text-[12.5px]`}>
      {mode === "fill" ? errors : <Roll t={roll} a={errors} b={code} />}
    </div>
  );
}

function Hero({ p }: { p: MV }) {
  const queued = useTransform(p, (v) => fmtTidy(queuedAt(v)));
  const face = useTransform(queued, (text) => (text === "0" ? ZERO_FACE : DISPLAY_FACE));
  return (
    <motion.span style={{ fontFamily: face }} className="t-hero mt-1 block text-[clamp(2.1rem,12.5cqw,4.1rem)] leading-none tabular-nums">
      {queued}
    </motion.span>
  );
}

export default function TankPage({ p, mode }: { p: MV; mode: TankMode }) {
  const oldest = useTransform(p, (v) => `${Math.round(oldestAt(v))} h`);
  const eta = useTransform(p, (v) => `${Math.round(etaAt(v))} h`);
  return (
    <div style={{ padding: PAD, gap: PAD }} className="flex h-full">
      <div className="flex min-w-0 flex-[1.15] flex-col justify-center gap-[clamp(6px,1.4cqh,10px)]">
        <div className="flex items-center justify-between">
          <MonoLabel>outbox</MonoLabel>
          <span className={`${LABEL} flex items-center gap-1`}>
            <EnvelopeIcon className="h-[1.1em] w-auto" />= {PER_TOKEN}
          </span>
        </div>
        <Tank p={p} mode={mode} />
        <Throat p={p} mode={mode} />
      </div>
      <div className="flex min-w-0 flex-[0.85] flex-col justify-center gap-5 @[30rem]:gap-[clamp(10px,2.4cqh,18px)]">
        <div>
          <MonoLabel>queued mails</MonoLabel>
          <Hero p={p} />
        </div>
        <SentCard p={p} mode={mode} />
        {mode === "fill" ? <ReadRow label="oldest mail" text={oldest} /> : <ReadRow label="drain eta" text={eta} />}
        <StatusChip p={p} mode={mode} />
      </div>
    </div>
  );
}
