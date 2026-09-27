"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { OK_RUN, SCHEDULE } from "./PipeKitData";
import { PipeGlyph } from "./PipeKitGlyphs";
import { lerp, segAt } from "./PipeKitMath";
import { SCHED, TILE, TL } from "./PipeSourcesSceneData";
import { FS, U, X, Y, useLy } from "./PipeSourcesSceneKit";

/* Chapter 1: a dial whose hand sweeps to 06:00, the tick that fires the run, then the dial shrinks into the
   schedule tile that heads the pipeline. The dial and the tile trade places with complementary opacity, so only one
   outline is on screen at any moment. On a tall stage everything sits `dy` lower, to stay centred. */

const CX = 180;
const CY = 150;
const DIAL = 176;
const R_FACE = 84;
const R_WEDGE = 68;
const START_MIN = 40;
/* The minute hand stops inside the ring of numerals, so at 06:00 it does not cut through the 12. */
const MINUTE_LEN = 43;
const HOUR_LEN = 27;
const DAYS = 7;
const DAY_SIZE = 26;
const DAY_GAP = 6;
const DAY_START = 0.03;
const DAY_STEP = 0.011;

const rad = (deg: number) => (deg * Math.PI) / 180;
const r3 = (n: number) => Math.round(n * 1000) / 1000 + 0;
const tip = (deg: number, len: number) => [r3(len * Math.sin(rad(deg))), r3(-len * Math.cos(rad(deg)))] as const;
const minutesAt = (v: number) => lerp(START_MIN, 60, segAt(v, TL.sweep[0], TL.sweep[1], easeInOutCubic));
const wobbleAt = (v: number) => {
  const t = segAt(v, TL.fire[0], TL.fire[1]);
  return Math.sin(t * Math.PI * 3) * (1 - t) * 5;
};

const f2 = (n: number) => n.toFixed(2);

/* Clockwise arc from the start of the sweep to `toDeg`, empty until the hand has moved. */
function arc(toDeg: number, r: number, pie: boolean) {
  const from = START_MIN * 6;
  const end = Math.min(toDeg, 360);
  if (end - from < 0.4) return "";
  const [x0, y0] = tip(from, r);
  const [x1, y1] = tip(end, r);
  const head = pie ? `M0 0L${f2(x0)} ${f2(y0)}` : `M${f2(x0)} ${f2(y0)}`;
  return `${head}A${r} ${r} 0 0 1 ${f2(x1)} ${f2(y1)}${pie ? "Z" : ""}`;
}

const TICKS = Array.from({ length: 60 }, (_, i) => {
  const major = i % 5 === 0;
  const [x1, y1] = tip(i * 6, major ? 64 : 70);
  const [x2, y2] = tip(i * 6, 76);
  return { i, major, x1, y1, x2, y2 };
});

const NUMERALS = [
  { n: "12", deg: 0 },
  { n: "3", deg: 90 },
  { n: "6", deg: 180 },
  { n: "9", deg: 270 },
] as const;

function Ripple({ p, a, b }: { p: MV; a: number; b: number }) {
  const t = useSeg(p, a, b, easeOutCubic);
  const r = useTransform(t, (v) => R_FACE + 46 * v);
  const opacity = useTransform(t, (v) => (v <= 0 ? 0 : (1 - v) * 0.75));
  return <motion.circle r={r} fill="none" strokeWidth="2" style={{ opacity, stroke: "var(--color-accent)" }} />;
}

function Hands({ p }: { p: MV }) {
  const minute = useTransform(p, (v) => minutesAt(v) * 6 + wobbleAt(v));
  const hour = useTransform(p, (v) => (5 + minutesAt(v) / 60) * 30);
  const mx = useTransform(minute, (d) => tip(d, MINUTE_LEN)[0]);
  const my = useTransform(minute, (d) => tip(d, MINUTE_LEN)[1]);
  const hx = useTransform(hour, (d) => tip(d, HOUR_LEN)[0]);
  const hy = useTransform(hour, (d) => tip(d, HOUR_LEN)[1]);
  const ring = useTransform(minute, (d) => arc(d, R_FACE, false));
  const sector = useTransform(minute, (d) => arc(d, R_WEDGE, true));
  const fire = useSeg(p, TL.fire[0], TL.fire[0] + 0.012);
  return (
    <>
      <motion.path d={sector} style={{ fill: "color-mix(in oklab, var(--color-accent) 18%, transparent)" }} />
      <motion.path d={ring} fill="none" strokeWidth="3" strokeLinecap="round" style={{ stroke: "var(--color-accent)" }} />
      <motion.line x1={0} y1={0} x2={hx} y2={hy} strokeWidth="6.4" strokeLinecap="round" style={{ stroke: "var(--color-dim)" }} />
      <motion.line x1={0} y1={0} x2={mx} y2={my} strokeWidth="3.4" strokeLinecap="round" style={{ stroke: "var(--color-fg)" }} />
      <motion.line x1={0} y1={0} x2={mx} y2={my} strokeWidth="3.4" strokeLinecap="round" style={{ stroke: "var(--color-accent)", opacity: fire }} />
      <circle r="5" style={{ fill: "var(--color-fg)" }} />
      <motion.circle r="2.4" style={{ fill: "var(--color-accent)", opacity: fire }} />
    </>
  );
}

function Face({ p }: { p: MV }) {
  const fire = useSeg(p, TL.fire[0], TL.fire[0] + 0.012);
  const numerals = useTransform(p, [TL.morph[0], TL.morph[0] + 0.012], [1, 0]);
  return (
    <svg viewBox="-88 -88 176 176" aria-hidden className="absolute inset-0 h-full w-full overflow-visible">
      <circle r={R_FACE} strokeWidth="2" style={{ fill: "var(--color-surface-1)", stroke: "var(--color-line-strong)" }} />
      <Ripple p={p} a={TL.fire[0]} b={TL.fire[1]} />
      <Ripple p={p} a={TL.fire[0] + 0.012} b={TL.fire[1] + 0.012} />
      {TICKS.map((t) => (
        <line key={t.i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2} strokeWidth={t.major ? 2.2 : 1.2} strokeLinecap="round" style={{ stroke: t.major ? "var(--color-dim)" : "var(--color-line-strong)" }} />
      ))}
      <motion.g style={{ opacity: numerals }}>
        {NUMERALS.map((m) => {
          const [x, y] = tip(m.deg, 52);
          return (
            <text key={m.n} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize="10.5" className={MONO} style={{ fill: "var(--color-mute)" }}>
              {m.n}
            </text>
          );
        })}
      </motion.g>
      <Hands p={p} />
      <motion.circle r={R_FACE} fill="none" strokeWidth="3" style={{ stroke: "var(--color-accent)", opacity: fire }} />
    </svg>
  );
}

function DialCard({ p }: { p: MV }) {
  const { dy } = useLy();
  const morph = useSeg(p, TL.morph[0], TL.morph[1], easeInOutCubic);
  const x = useTransform(morph, (t) => `${lerp(0, ((SCHED[0] - CX) / DIAL) * 100, t).toFixed(3)}%`);
  const y = useTransform(morph, (t) => `${lerp(0, ((SCHED[1] - CY - dy) / DIAL) * 100, t).toFixed(3)}%`);
  const scale = useTransform(morph, (t) => lerp(1, TILE / DIAL, t));
  const opacity = useTransform(p, [TL.tileIn[0], TL.tileIn[1]], [1, 0]);
  return (
    <motion.div
      style={{ x, y, scale, opacity, left: X(CX - DIAL / 2), top: Y(CY + dy - DIAL / 2), width: X(DIAL), aspectRatio: "1" }}
      className="absolute z-30"
    >
      <Face p={p} />
    </motion.div>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function Digits({ p }: { p: MV }) {
  const { dy } = useLy();
  const text = useTransform(p, (v) => {
    const m = Math.floor(minutesAt(v) + 0.0001);
    return m >= 60 ? "06:00" : `05:${pad2(m)}`;
  });
  const fire = useSeg(p, TL.fire[0], TL.fire[0] + 0.012);
  const scale = useTransform(p, (v) => 1 + 0.14 * Math.sin(segAt(v, TL.fire[0], TL.fire[0] + 0.03) * Math.PI));
  const color = useTransform(fire, (f) => `color-mix(in oklab, var(--color-accent) ${(f * 100).toFixed(1)}%, var(--color-fg))`);
  return (
    <motion.span
      style={{ scale, color, fontSize: U(32), top: Y(248 + dy) }}
      className={`${MONO} absolute left-1/2 -translate-x-1/2 font-semibold tabular-nums leading-none`}
    >
      {text}
    </motion.span>
  );
}

function DayTile({ p, i }: { p: MV; i: number }) {
  const last = i === DAYS - 1;
  const at = last ? TL.fire[0] + 0.004 : DAY_START + i * DAY_STEP;
  const pop = useSeg(p, at, at + 0.014, easeOutBack);
  const dashed = useTransform(pop, (v) => (last ? 1 - Math.min(1, v * 2) : 0));
  return (
    <span style={{ width: U(DAY_SIZE), height: U(DAY_SIZE) }} className="relative grid place-items-center rounded-[5px] border border-line-strong bg-surface-2">
      <motion.i aria-hidden style={{ opacity: dashed }} className="absolute inset-0 rounded-[5px] border border-dashed border-mute bg-bg" />
      <motion.span style={{ scale: pop, opacity: pop }} className="grid place-items-center">
        <PipeGlyph name="check" size={U(16)} />
      </motion.span>
    </span>
  );
}

function RunChip({ p }: { p: MV }) {
  const { dy } = useLy();
  const t = useSeg(p, TL.fire[0] + 0.01, TL.fire[0] + 0.03, easeOutBack);
  const opacity = useSeg(p, TL.fire[0] + 0.01, TL.fire[0] + 0.022);
  return (
    <motion.span
      style={{ scale: t, opacity, top: Y(376 + dy), fontSize: FS }}
      className={`${MONO} absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-accent bg-surface-2 px-2 py-1 text-fg`}
    >
      run {OK_RUN.label} started
    </motion.span>
  );
}

function Extras({ p }: { p: MV }) {
  const { dy } = useLy();
  const opacity = useTransform(p, [TL.extrasOut[0], TL.extrasOut[1]], [1, 0]);
  return (
    <motion.div aria-hidden style={{ opacity }} className="absolute inset-0 z-20">
      <Digits p={p} />
      <span style={{ top: Y(288 + dy), fontSize: FS }} className={`${MONO} absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-dim`}>
        {SCHEDULE.label}
      </span>
      <div style={{ top: Y(314 + dy), gap: U(DAY_GAP) }} className="absolute inset-x-0 flex justify-center">
        {Array.from({ length: DAYS }, (_, i) => (
          <DayTile key={i} p={p} i={i} />
        ))}
      </div>
      <span style={{ top: Y(350 + dy), fontSize: FS }} className={`${MONO} absolute left-1/2 -translate-x-1/2 whitespace-nowrap text-dim`}>
        manual steps <span className="text-fg">0</span>
      </span>
      <RunChip p={p} />
    </motion.div>
  );
}

export default function Dial({ p }: { p: MV }) {
  return (
    <>
      <DialCard p={p} />
      <Extras p={p} />
    </>
  );
}
