"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import {
  AVG_EFF,
  AVG_HRV,
  AVG_RHR,
  BASELINE,
  DEBT_MIN,
  DIP_CX,
  DIP_FIRST,
  DIP_LAST,
  DIP_X0,
  DIP_X1,
  EFF,
  HRV,
  HRV_DROP,
  HRV_PLOT,
  MAX_SLEEP_MIN,
  NIGHTS,
  NIGHT_W,
  PANEL,
  PLOT_W,
  PLOT_X,
  RHR,
  RHR_PLOT,
  SLEEP_MIN,
  SLEEP_PLOT,
  SLOT,
  STAGES,
  T,
  THUMB,
  fmtDur,
  hrvY,
  inDip,
  nightX,
  rhrY,
} from "./WearableSceneData";
import {
  ClipPane,
  Mono,
  Typed,
  clamp01,
  fs,
  lerp,
  panelBox,
  panelXPct,
  pct,
  stageBox,
  useDrawn,
  type MVS,
} from "./WearableSceneKit";
import { TRACK_INSET, TrackIcons } from "./WearableSceneIcons";

/* Chapters 2 and 3: the 30-night panel, its anomaly window and the two slot panes. */

const VIEWBOX = `${PANEL.x} ${PANEL.y} ${PANEL.w} ${PANEL.h}`;
const PLOT_TOP = HRV_PLOT.y - 3;
const PLOT_BOTTOM = SLEEP_PLOT.y + SLEEP_PLOT.h + 3;
const BAR_GAP = 3;
const WIN_FROM = DIP_FIRST - 1;
const WIN_TO = DIP_LAST + 2;
const GRID_NIGHTS = [5, 10, 15, 20, 25] as const;
const AXIS_NIGHTS = [
  { n: 1, text: "night 1", shift: "0%" },
  { n: 10, text: "10", shift: "-50%" },
  { n: 20, text: "20", shift: "-50%" },
  { n: 30, text: "30", shift: "-100%" },
] as const;
const CIRCLE = { cx: DIP_CX, cy: (hrvY(BASELINE) + hrvY(Math.min(...HRV))) / 2, rx: 27, ry: 25 };
const LEADER = { x: DIP_CX, y0: PLOT_BOTTOM + 1, y1: SLOT.y - 3 };
const DIP_LOOK = 0.92;
const LOOP_MIN = 0.05;

const pathOf = (series: readonly number[], y: (v: number) => number, from = 0, to = NIGHTS - 1) =>
  series
    .slice(from, to + 1)
    .map((v, k) => `${k === 0 ? "M" : "L"} ${nightX(from + k).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(" ");

const HRV_D = pathOf(HRV, hrvY);
const RHR_D = pathOf(RHR, rhrY);
const HRV_BOTTOM = HRV_PLOT.y + HRV_PLOT.h;
const HRV_AREA = `${HRV_D} L ${nightX(NIGHTS - 1)} ${HRV_BOTTOM} L ${nightX(0)} ${HRV_BOTTOM} Z`;
const DIP_HRV_D = pathOf(HRV, hrvY, WIN_FROM, WIN_TO);
const DIP_RHR_D = pathOf(RHR, rhrY, WIN_FROM, WIN_TO);
const BASE_Y = hrvY(BASELINE);
const DIP_FILL_D = `M ${Array.from({ length: WIN_TO - WIN_FROM + 1 }, (_, k) => {
  const i = WIN_FROM + k;
  return `${nightX(i).toFixed(1)} ${Math.max(hrvY(HRV[i]), BASE_Y).toFixed(1)}`;
}).join(" L ")} L ${nightX(WIN_TO)} ${BASE_Y} L ${nightX(WIN_FROM)} ${BASE_Y} Z`;

function loopPath({ cx, cy, rx, ry }: typeof CIRCLE) {
  const steps = 48;
  return Array.from({ length: steps + 1 }, (_, k) => {
    const t = k / steps;
    const ang = ((-200 + t * 400) * Math.PI) / 180;
    const r = (1 - 0.08 * t) * (1 + 0.04 * Math.sin(ang * 3));
    return `${k === 0 ? "M" : "L"} ${(cx + rx * r * Math.cos(ang)).toFixed(1)} ${(cy + ry * r * Math.sin(ang)).toFixed(1)}`;
  }).join(" ");
}
const LOOP_D = loopPath(CIRCLE);

const sample = (series: readonly number[], c: number) => {
  const f = Math.min(NIGHTS - 1, Math.max(0, c * NIGHTS - 0.5));
  const i = Math.floor(f);
  return lerp(series[i], series[Math.min(NIGHTS - 1, i + 1)], f - i);
};

function Layer({ clip, opacity, children }: { clip?: MVS; opacity?: MV; children: ReactNode }) {
  return (
    <motion.svg viewBox={VIEWBOX} style={{ clipPath: clip, opacity }} className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
      {children}
    </motion.svg>
  );
}

const revealClip = (r: number) => `inset(0 ${(100 - panelXPct(PLOT_X + r * PLOT_W)).toFixed(2)}% 0 0)`;
const lineStyle = { stroke: "var(--color-line)" };

function GridLayer() {
  return (
    <Layer>
      {GRID_NIGHTS.map((n) => (
        <line key={n} x1={PLOT_X + n * NIGHT_W} x2={PLOT_X + n * NIGHT_W} y1={HRV_PLOT.y} y2={SLEEP_PLOT.y + SLEEP_PLOT.h} strokeWidth="0.8" strokeDasharray="1.5 3" style={lineStyle} />
      ))}
      {[HRV_PLOT, RHR_PLOT, SLEEP_PLOT].map((r) => (
        <line key={r.y} x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={r.y + r.h} y2={r.y + r.h} strokeWidth="0.8" style={{ stroke: "var(--color-line-strong)" }} />
      ))}
    </Layer>
  );
}

function LinesLayer({ reveal, dim }: { reveal: MV; dim: MV }) {
  const clip = useTransform(reveal, revealClip);
  const opacity = useTransform(dim, (d) => 1 - 0.6 * d);
  return (
    <Layer clip={clip} opacity={opacity}>
      <path d={HRV_AREA} style={{ fill: "var(--color-mint)", opacity: 0.13 }} />
      <path d={HRV_D} fill="none" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: "var(--color-mint)" }} />
      <path d={RHR_D} fill="none" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: "var(--color-rose)" }} />
    </Layer>
  );
}

function BaselineLayer({ p }: { p: MV }) {
  const k = useSeg(p, T.baseline[0], T.baseline[1], easeInOutCubic);
  const clip = useTransform(k, revealClip);
  const y = BASE_Y;
  return (
    <Layer clip={clip}>
      <line x1={PLOT_X} x2={PLOT_X + PLOT_W} y1={y} y2={y} strokeWidth="1" strokeDasharray="4 3" style={{ stroke: "var(--color-fg)", opacity: 0.55 }} />
    </Layer>
  );
}

function AlertLayer({ p, cur }: { p: MV; cur: MV }) {
  const left = panelXPct(DIP_X0);
  const clip = useTransform([p, cur], ([pv, c]: number[]) => {
    const x = panelXPct(PLOT_X + (pv >= T.scan[0] ? c : 0) * PLOT_W);
    return `inset(0 ${(100 - Math.max(x, left)).toFixed(2)}% 0 ${left.toFixed(2)}%)`;
  });
  return (
    <Layer clip={clip}>
      <path d={DIP_FILL_D} style={{ fill: "var(--color-accent)", opacity: 0.4 }} />
      <path d={DIP_HRV_D} fill="none" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: "var(--color-accent)" }} />
      <path d={DIP_RHR_D} fill="none" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" style={{ stroke: "var(--color-accent)" }} />
    </Layer>
  );
}

function MarkLayer({ p }: { p: MV }) {
  const k = useSeg(p, T.circle[0], T.circle[1], easeOutCubic);
  const drawn = useDrawn(k, LOOP_MIN);
  return (
    <Layer>
      <motion.path d={LOOP_D} fill="none" strokeWidth="2" strokeLinejoin="round" style={{ pathLength: k, opacity: drawn, stroke: "var(--color-fg)" }} />
    </Layer>
  );
}

function DipBand({ p }: { p: MV }) {
  const opacity = useSeg(p, T.band[0], T.band[1]);
  return (
    <motion.i
      aria-hidden
      style={{ ...panelBox({ x: DIP_X0, y: PLOT_TOP, w: DIP_X1 - DIP_X0, h: PLOT_BOTTOM - PLOT_TOP }), opacity }}
      className="absolute rounded-sm border-x border-accent/70 bg-accent/20"
    />
  );
}

function NightBar({ i, reveal, dim }: { i: number; reveal: MV; dim: MV }) {
  const grow = useTransform(reveal, (v) => easeOutCubic(clamp01(v * NIGHTS - i)));
  const opacity = useTransform(dim, (d) => (inDip(i) ? 1 : 1 - 0.6 * d));
  const [deep, rem, light] = STAGES[i];
  const h = (m: number) => `${((m / MAX_SLEEP_MIN) * 100).toFixed(2)}%`;
  const box = panelBox({ x: PLOT_X + i * NIGHT_W + BAR_GAP / 2, y: SLEEP_PLOT.y, w: NIGHT_W - BAR_GAP, h: SLEEP_PLOT.h });
  return (
    <motion.div style={{ ...box, scaleY: grow, opacity, transformOrigin: "50% 100%" }} className="absolute flex flex-col-reverse">
      <i style={{ height: h(deep), background: "var(--color-sky)" }} />
      <i style={{ height: h(rem), background: "var(--color-sun)" }} />
      <i className="rounded-t-[2px]" style={{ height: h(light), background: "color-mix(in oklab, var(--color-dim) 55%, transparent)" }} />
    </motion.div>
  );
}

function Cursor({ p, cur }: { p: MV; cur: MV }) {
  const opacity = useTransform(p, [T.sweep[0] - 0.015, T.sweep[0]], [0, 1]);
  const left = useTransform(cur, (c) => pct(PLOT_X + c * PLOT_W - PANEL.x, PANEL.w));
  const mix = useSeg(p, T.rewind[0], T.rewind[1]);
  const color = useTransform(mix, (k) => `color-mix(in oklab, var(--color-accent) ${(k * 100).toFixed(0)}%, var(--color-fg))`);
  const hy = useTransform(cur, (c) => pct(hrvY(sample(HRV, c)) - PANEL.y, PANEL.h));
  const ry = useTransform(cur, (c) => pct(rhrY(sample(RHR, c)) - PANEL.y, PANEL.h));
  const dot = "absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface-1";
  return (
    <>
      <motion.i
        aria-hidden
        style={{ left, opacity, background: color, top: pct(PLOT_TOP - PANEL.y, PANEL.h), height: pct(PLOT_BOTTOM - PLOT_TOP, PANEL.h) }}
        className="absolute z-10 w-[1.5px] -translate-x-1/2"
      />
      <motion.i aria-hidden style={{ left, top: hy, opacity, background: "var(--color-mint)" }} className={`${dot} z-10`} />
      <motion.i aria-hidden style={{ left, top: ry, opacity, background: "var(--color-rose)" }} className={`${dot} z-10`} />
    </>
  );
}

function LabelRow({ y, left, right, inset = 0 }: { y: number; left: ReactNode; right: ReactNode; inset?: number }) {
  return (
    <div style={panelBox({ x: PLOT_X + inset, y, w: PLOT_W - inset, h: 14 })} className="absolute flex items-center justify-between gap-2 whitespace-nowrap">
      <span className="flex items-center gap-2 rounded-sm bg-surface-1 pr-1">{left}</span>
      <span className="rounded-sm bg-surface-1 pl-1">{right}</span>
    </div>
  );
}

const Name = ({ children }: { children: ReactNode }) => <Mono className="uppercase tracking-[0.1em] text-mute">{children}</Mono>;

function Value({ text, flag }: { text: MVS; flag?: MV }) {
  return (
    <span className="flex items-center gap-1.5">
      {flag && <motion.i aria-hidden style={{ opacity: flag }} className="h-1.5 w-1.5 rounded-full bg-accent" />}
      <motion.span className={`${MONO} tabular-nums text-fg`} style={{ fontSize: fs(10.2) }}>
        {text}
      </motion.span>
    </span>
  );
}

const Swatch = ({ color, label }: { color: string; label: string }) => (
  <span className="flex items-center gap-1">
    <i className="h-1.5 w-1.5 rounded-[1px]" style={{ background: color }} />
    <Mono className="text-mute">{label}</Mono>
  </span>
);

function AxisLabels() {
  return (
    <>
      {AXIS_NIGHTS.map((a) => (
        <div key={a.n} style={{ left: pct(nightX(a.n - 1) - PANEL.x, PANEL.w), top: pct(297 - PANEL.y, PANEL.h), transform: `translateX(${a.shift})` }} className="absolute">
          <Mono className="text-mute">{a.text}</Mono>
        </div>
      ))}
    </>
  );
}

function TrackLabels({ p, night }: { p: MV; night: MV }) {
  const baseK = useSeg(p, T.baseline[0], T.baseline[1]);
  const baseClip = useTransform(baseK, (k) => `inset(0 ${(100 - k * 100).toFixed(1)}% 0 0)`);
  const head = useTransform(night, (n) => `night ${n + 1}/${NIGHTS}`);
  const hrv = useTransform(night, (n) => `${HRV[n]} ms`);
  const hrvFlag = useTransform(night, (n): number => (HRV[n] < BASELINE * DIP_LOOK ? 1 : 0));
  const rhr = useTransform(night, (n) => `${RHR[n]} bpm`);
  const sleep = useTransform(night, (n) => `${fmtDur(SLEEP_MIN[n])} · ${EFF[n]}%`);
  return (
    <>
      <LabelRow
        y={62}
        left={<Value text={head} />}
        right={<Mono className="text-mute">synced 02:14</Mono>}
      />
      <LabelRow
        y={80}
        inset={TRACK_INSET}
        left={
          <>
            <Name>HRV</Name>
            <motion.span style={{ clipPath: baseClip }}>
              <Mono className="text-mute">baseline {BASELINE} ms</Mono>
            </motion.span>
          </>
        }
        right={<Value text={hrv} flag={hrvFlag} />}
      />
      <LabelRow y={164} inset={TRACK_INSET} left={<Name>Resting HR</Name>} right={<Value text={rhr} />} />
      <LabelRow
        y={222}
        inset={TRACK_INSET}
        left={
          <>
            <Name>Sleep</Name>
            <Swatch color="var(--color-sky)" label="deep" />
            <Swatch color="var(--color-sun)" label="rem" />
            <Swatch color="color-mix(in oklab, var(--color-dim) 55%, transparent)" label="light" />
          </>
        }
        right={<Value text={sleep} />}
      />
      <TrackIcons p={p} />
      <AxisLabels />
    </>
  );
}

export function TimelinePanel({ p, cur, night }: { p: MV; cur: MV; night: MV }) {
  const rev = useSeg(p, T.panel[0], T.panel[1], easeOutCubic);
  const shrink = useSeg(p, T.shrink[0], T.shrink[1], easeInOutCubic);
  const sweep = useSeg(p, T.sweep[0], T.sweep[1]);
  const dim = useSeg(p, T.dim[0], T.dim[1]);
  const clip = useTransform(rev, (r) => `inset(0 0 ${((1 - r) * 100).toFixed(2)}% 0 round 12px)`);
  const scale = useTransform(shrink, (k) => lerp(1, THUMB.scale, k));
  const x = useTransform(shrink, (k) => `${((((THUMB.x - PANEL.x) * k) / PANEL.w) * 100).toFixed(3)}%`);
  const y = useTransform(shrink, (k) => `${((((THUMB.y - PANEL.y) * k) / PANEL.h) * 100).toFixed(3)}%`);
  const edgeTop = useTransform(rev, (r) => `${(r * 100).toFixed(2)}%`);
  const edgeOp = useTransform(rev, [0, 0.05, 0.95, 1], [0, 1, 1, 0]);
  const labelsOp = useTransform(p, [T.labelsOff[0], T.labelsOff[1]], [1, 0]);
  return (
    <motion.div
      style={{ ...stageBox(PANEL), clipPath: clip, scale, x, y, transformOrigin: "0 0" }}
      className="absolute rounded-xl border border-line-strong bg-surface-1"
    >
      <GridLayer />
      <DipBand p={p} />
      <LinesLayer reveal={sweep} dim={dim} />
      <BaselineLayer p={p} />
      {Array.from({ length: NIGHTS }, (_, i) => (
        <NightBar key={i} i={i} reveal={sweep} dim={dim} />
      ))}
      <AlertLayer p={p} cur={cur} />
      <MarkLayer p={p} />
      <Cursor p={p} cur={cur} />
      <motion.div style={{ opacity: labelsOp }} className="absolute inset-0 z-10">
        <TrackLabels p={p} night={night} />
      </motion.div>
      <motion.i aria-hidden style={{ top: edgeTop, opacity: edgeOp }} className="absolute inset-x-0 z-20 h-px bg-accent" />
    </motion.div>
  );
}

export function LeaderLine({ p, exit }: { p: MV; exit: MV }) {
  const k = useSeg(p, T.leader[0], T.leader[1], easeInOutCubic);
  const drawn = useDrawn(k);
  const opacity = useTransform([drawn, exit], ([d, e]: number[]) => d * (1 - e));
  return (
    <motion.path
      d={`M ${LEADER.x} ${LEADER.y0} L ${LEADER.x} ${LEADER.y1}`}
      fill="none"
      strokeWidth="1.6"
      strokeDasharray="3 2"
      style={{ pathLength: k, opacity, stroke: "var(--color-accent)" }}
    />
  );
}

function Stat({ label, value, unit }: { label: string; value: MVS; unit: string }) {
  return (
    <div className="min-w-0">
      <Mono className="block uppercase tracking-[0.1em] text-mute">{label}</Mono>
      <div className="flex items-baseline gap-1">
        <motion.span className="t-hero leading-none tabular-nums" style={{ fontSize: fs(22, 30) }}>
          {value}
        </motion.span>
        <Mono className="text-dim">{unit}</Mono>
      </div>
    </div>
  );
}

export function StatsPane({ night, inF, outF }: { night: MV; inF: MV; outF: MV }) {
  const hrv = useTransform(night, (n) => String(Math.round(AVG_HRV[n])));
  const rhr = useTransform(night, (n) => String(Math.round(AVG_RHR[n])));
  const eff = useTransform(night, (n) => String(Math.round(AVG_EFF[n])));
  const sep = <i className="h-8 w-px bg-line-strong" />;
  return (
    <ClipPane inF={inF} outF={outF} className="flex items-center justify-between rounded-lg border border-line bg-surface-1 px-4">
      <Stat label="avg HRV" value={hrv} unit="ms" />
      {sep}
      <Stat label="resting HR" value={rhr} unit="bpm" />
      {sep}
      <Stat label="sleep eff." value={eff} unit="%" />
    </ClipPane>
  );
}

export function CalloutPane({ p, night, inF, outF }: { p: MV; night: MV; inF: MV; outF: MV }) {
  const [a, b] = T.callout;
  const flag = useSeg(p, a, a + 0.02);
  const watchClip = useTransform(flag, (v) => `inset(0 0 0 ${(v * 100).toFixed(1)}%)`);
  const badgeClip = useTransform(flag, (v) => `inset(0 ${(100 - v * 100).toFixed(1)}% 0 0)`);
  const live = useTransform(night, (n): string => {
    const d = HRV[n] - BASELINE;
    return `night ${n + 1}: hrv ${HRV[n]} ms (${d > 0 ? "+" : ""}${d} vs ${BASELINE})`;
  });
  const monoStyle = { fontSize: fs(10.2) };
  return (
    <ClipPane inF={inF} outF={outF} className="flex flex-col justify-center gap-1 rounded-lg border border-accent/70 bg-surface-1 px-3">
      <div className="relative flex h-[1.5em] items-center justify-between" style={monoStyle}>
        <span className="relative h-full flex-1">
          <motion.span style={{ clipPath: watchClip }} className={`absolute inset-0 flex items-center text-mute ${MONO}`}>
            watching for trends
          </motion.span>
          <motion.span style={{ clipPath: badgeClip }} className="absolute inset-0 flex items-center">
            <span className={`rounded-[3px] bg-accent px-1.5 uppercase leading-[1.5] tracking-[0.1em] text-fg ${MONO}`}>trend flagged</span>
          </motion.span>
        </span>
        <Typed p={p} a={b - 0.045} b={b - 0.005} text="you logged: fine" className={`text-dim ${MONO}`} style={monoStyle} />
      </div>
      <motion.p className={`${MONO} whitespace-nowrap tabular-nums text-fg`} style={monoStyle}>
        {live}
      </motion.p>
      <Typed p={p} a={a + 0.015} b={b - 0.05} text={`HRV -${HRV_DROP}% in 3 nights, sleep debt +${fmtDur(DEBT_MIN)}`} className={`whitespace-nowrap text-fg ${MONO}`} style={monoStyle} />
    </ClipPane>
  );
}
