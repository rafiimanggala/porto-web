"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CRUMBS, QUIZ, TL, TOTAL, WINDOW } from "./EduTreeSceneData";
import { BookIcon, CheckMark, NodesIcon, WifiGlyph } from "./EduTreeSceneIcons";
import { MONO_LABEL, Odometer, Roller, ZERO_STYLE, isZero, useKeys } from "./EduTreeSceneKit";
import { clamp01, keyframes, nodesAt, pct, quizCount, segAt } from "./EduTreeSceneMath";

/* Top bar and the rolling info strip. The strip holds one cell per chapter and rolls between them,
   so a readout is swapped by position and never fades over its replacement. */

const CELL = "flex h-[var(--info)] shrink-0 items-center gap-3 overflow-hidden px-3 @min-[500px]:px-4";
const BIG = "t-hero leading-none tabular-nums text-[clamp(1.3rem,4.8cqh,2.2rem)]";

export function TopBar({ p }: { p: MV }) {
  const drop = useSeg(p, TL.drop[0], TL.drop[1]);
  const swap = useSeg(p, TL.swap[0], TL.swap[1], easeInOutCubic);
  return (
    <div className="flex items-center justify-between gap-2 border-b border-line px-3 @min-[500px]:px-4">
      <div className="flex min-w-0 items-center gap-2 @min-[500px]:gap-3">
        <BookIcon className="h-6 w-6 shrink-0 @min-[500px]:h-8 @min-[500px]:w-8" />
        <div className="min-w-0 leading-tight">
          <p className="truncate text-[13px] font-medium text-fg @min-[500px]:text-[15px]">Biology</p>
          <p className={`${MONO} truncate text-[11px] text-mute`}>Units 3 and 4</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        <WifiGlyph drop={drop} className="h-[15px] w-[17px] @min-[500px]:h-[19px] @min-[500px]:w-[22px]" />
        <Roller
          pos={swap}
          cellClass="h-4"
          className={`h-4 ${MONO} text-[11px] leading-4`}
          items={[<span key="on" className="text-mint">online</span>, <span key="off" className="text-sun">offline</span>]}
        />
      </div>
    </div>
  );
}

function Crumb({ p, label, at, next }: { p: MV; label: string; at: number; next: number }) {
  const t = useSeg(p, at, at + 0.014, easeOutCubic);
  const later = useSeg(p, next, next + 0.014);
  const x = useTransform(t, (v) => (1 - v) * -6);
  const color = useTransform(later, (v) => `color-mix(in oklab, var(--color-fg) ${((1 - v) * 100).toFixed(1)}%, var(--color-dim))`);
  return (
    <motion.span style={{ opacity: t, x, color }} className="flex shrink-0 items-center gap-1.5">
      <span aria-hidden className="text-mute">/</span>
      {label}
    </motion.span>
  );
}

/* Until the first click nothing is open, so the strip says so and the text steps aside for the first crumb. */
function EmptyPath({ p }: { p: MV }) {
  const gone = useSeg(p, CRUMBS[0].at - 0.016, CRUMBS[0].at);
  const opacity = useTransform(gone, (v) => 1 - v);
  const maxWidth = useTransform(gone, (v) => `${((1 - v) * 130).toFixed(2)}px`);
  const marginLeft = useTransform(gone, (v) => `${-6 * v}px`);
  return (
    <motion.span style={{ opacity, maxWidth, marginLeft }} className="shrink-0 overflow-hidden whitespace-nowrap text-dim">
      nothing open yet
    </motion.span>
  );
}

function PathCell({ p }: { p: MV }) {
  return (
    <div className={CELL}>
      <div className="min-w-0">
        <p className={MONO_LABEL}>open branch</p>
        <div className="mt-1 flex items-center gap-1.5 whitespace-nowrap text-[12px] @min-[500px]:text-[13px]">
          <NodesIcon className="h-[15px] w-[15px] shrink-0 @min-[500px]:h-[18px] @min-[500px]:w-[18px]" />
          <EmptyPath p={p} />
          {CRUMBS.map((c, i) => (
            <Crumb key={c.label} p={p} label={c.label} at={c.at} next={CRUMBS[i + 1]?.at ?? 9} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* The number in a stat: animated counts swap to the sans face at zero. */
function Count({ value, className }: { value: MotionValue<string>; className: string }) {
  const fontFamily = useTransform(value, (v) => (isZero(v) ? ZERO_STYLE.fontFamily : "var(--font-display)"));
  const fontWeight = useTransform(value, (v) => (isZero(v) ? ZERO_STYLE.fontWeight : 600));
  return (
    <motion.span style={{ fontFamily, fontWeight }} className={className}>
      {value}
    </motion.span>
  );
}

function Stat({ value, label, tone = "text-fg", scale }: { value: MotionValue<string> | string; label: string; tone?: string; scale?: MV }) {
  return (
    <motion.div style={{ scale }} className="origin-left">
      {typeof value === "string" ? (
        <span className={`block ${BIG} ${tone}`}>{value}</span>
      ) : (
        <Count value={value} className={`block ${BIG} ${tone}`} />
      )}
      <span className={`mt-0.5 block ${MONO_LABEL}`}>{label}</span>
    </motion.div>
  );
}

function ShareBar({ p }: { p: MV }) {
  const share = useTransform(p, (v) => WINDOW / nodesAt(v));
  const scaleX = useTransform(share, (s) => s);
  const text = useTransform(share, (s) => `${(s * 100).toFixed(1)}% drawn`);
  return (
    <div className="ml-auto min-w-0 flex-1 self-center">
      <motion.p className={`truncate text-right ${MONO_LABEL}`}>{text}</motion.p>
      <div className="mt-1 h-[6px] rounded-full bg-line-strong">
        <motion.div style={{ scaleX }} className="h-full origin-left rounded-full bg-accent" />
      </div>
    </div>
  );
}

function StatsCell({ p }: { p: MV }) {
  const nodes = useTransform(p, (v) => String(nodesAt(v)));
  const pulse = useTransform(p, (v) => 1 + 0.12 * Math.sin(Math.PI * segAt(v, TL.pulse[0], TL.pulse[1])));
  return (
    <div className={`${CELL} @min-[500px]:gap-5`}>
      <Stat value={nodes} label="nodes" />
      <i aria-hidden className="h-8 w-px shrink-0 bg-line-strong" />
      <Stat value={String(WINDOW)} label="drawn" tone="text-accent" scale={pulse} />
      <ShareBar p={p} />
    </div>
  );
}

const STAMPS = QUIZ.map((q) => q.stamp);
const SCOPE_KEYS = QUIZ.flatMap((q) => [q.stamp[0] - 0.012, q.stamp[0]]);
const SCOPES = ["no quiz yet", ...QUIZ.map((q) => q.scope)] as const;

function QuizCell({ p }: { p: MV }) {
  const count = useTransform(p, (v) => quizCount(v, STAMPS));
  const scope = useKeys(p, SCOPE_KEYS, [0, 1, 1, 2, 2, 3], easeInOutCubic);
  return (
    <div className={CELL}>
      <div className="flex items-center gap-2">
        <Odometer value={count} max={QUIZ.length} className={`${BIG} text-accent`} />
        <span className={MONO_LABEL}>quizzes</span>
      </div>
      <div className="ml-auto min-w-0 text-right">
        <p className={MONO_LABEL}>attached to</p>
        <Roller
          pos={scope}
          cellClass="h-[18px] justify-end"
          className="mt-0.5 h-[18px] text-[12px] text-fg @min-[500px]:text-[14px]"
          items={SCOPES.map((s) => (
            <span key={s} className="whitespace-nowrap">{s}</span>
          ))}
        />
      </div>
    </div>
  );
}

function CachedCell({ p }: { p: MV }) {
  const frac = useSeg(p, TL.ring[0], TL.ring[1], easeInOutCubic);
  const count = useTransform(frac, (v) => String(Math.round(v * TOTAL)));
  const label = useSeg(p, TL.swap[0], TL.swap[1], easeInOutCubic);
  const done = useSeg(p, TL.ring[1] - 0.01, TL.ring[1] + 0.012, easeOutCubic);
  const tickScale = useTransform(done, (v) => 0.6 + 0.4 * v);
  return (
    <div className={CELL}>
      <Stat value={count} label="nodes cached" tone="text-fg" />
      <motion.span
        aria-hidden
        style={{ opacity: done, scale: tickScale }}
        className="grid h-5 w-5 place-items-center rounded-full bg-mint text-[var(--color-pastel-ink)] @min-[500px]:h-6 @min-[500px]:w-6"
      >
        <CheckMark className="h-3 w-3 @min-[500px]:h-3.5 @min-[500px]:w-3.5" />
      </motion.span>
      <Roller
        pos={label}
        cellClass="h-[18px] justify-end"
        className="ml-auto h-[18px] text-[12px] @min-[500px]:text-[14px]"
        items={[
          <span key="a" className="whitespace-nowrap text-dim">cached on device</span>,
          <span key="b" className="whitespace-nowrap text-fg">still open offline</span>,
        ]}
      />
    </div>
  );
}

const ROLL_CELLS = 4;

export function InfoStrip({ p }: { p: MV }) {
  const pos = useTransform(p, (v) => keyframes(v, TL.roll, [0, 1, 1, 2, 2, 3]));
  const y = useTransform(pos, (v) => pct((-clamp01(v / (ROLL_CELLS - 1)) * (ROLL_CELLS - 1) * 100) / ROLL_CELLS));
  return (
    <div className="relative overflow-hidden border-b border-line">
      <motion.div style={{ y }} className="flex flex-col">
        <PathCell p={p} />
        <StatsCell p={p} />
        <QuizCell p={p} />
        <CachedCell p={p} />
      </motion.div>
    </div>
  );
}
