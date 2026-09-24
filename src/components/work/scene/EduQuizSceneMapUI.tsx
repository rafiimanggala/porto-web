"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { COUNTS, N, STATUS, STATUSES, STATUS_COLOR, STOPS, T, type Status, type Stop } from "./EduQuizSceneData";
import { groupHit, spotAt } from "./EduQuizSceneGrid";
import { HexDot, MonoLabel, WipePages, useKeys } from "./EduQuizSceneKit";

/* The furniture around the honeycomb: the status legend and a preview strip
   under it while the map is large, then a status count panel beside it once
   the map has shrunk to make room for the question card. */

function BadgePoly({ color, opacity }: { color: string; opacity?: MV }) {
  return (
    <motion.polygon
      points="0,-9 7.8,-4.5 7.8,4.5 0,9 -7.8,4.5 -7.8,-4.5"
      style={opacity ? { opacity } : undefined}
      fill={color}
      fillOpacity={0.5}
      stroke={color}
      strokeWidth="1"
      strokeLinejoin="round"
    />
  );
}

const BADGE_BOX = "h-[30px] w-[26px]";

function BadgeShell({ n, className, children }: { n: number; className: string; children: ReactNode }) {
  return (
    <span className={`relative grid shrink-0 place-items-center ${className}`}>
      <svg aria-hidden viewBox="-9 -10 18 20" className="absolute inset-0 h-full w-full">
        {children}
      </svg>
      <span className={`${MONO} relative text-[10px] tabular-nums leading-none text-fg`}>{n}</span>
    </span>
  );
}

export function HexBadge({ n, color, className = BADGE_BOX }: { n: number; color: string; className?: string }) {
  return (
    <BadgeShell n={n} className={className}>
      <BadgePoly color={color} />
    </BadgeShell>
  );
}

type FlipBadgeProps = { n: number; from: string; to: string; mix: MV; className?: string };

/* Same badge, its fill and outline complementary-fading from one status colour to another as `mix` runs 0 to 1. */
export function FlipBadge({ n, from, to, mix, className = BADGE_BOX }: FlipBadgeProps) {
  const out = useTransform(mix, (v) => 1 - v);
  return (
    <BadgeShell n={n} className={className}>
      <BadgePoly color={from} opacity={out} />
      <BadgePoly color={to} opacity={mix} />
    </BadgeShell>
  );
}

function useFade(p: MV, a: number, b: number, away: number) {
  const appear = useSeg(p, a, b);
  const gone = useSeg(p, away, away + 0.018);
  return useTransform([appear, gone], ([x, g]: number[]) => x * (1 - g));
}

function LegendItem({ p, s }: { p: MV; s: Status }) {
  const hit = useTransform(p, (v) => Math.max(groupHit(v, s), s === "flagged" ? spotAt(v) : 0));
  const opacity = useTransform(hit, (h) => 0.62 + 0.38 * h);
  const scale = useTransform(hit, (h) => 1 + 0.08 * h);
  return (
    <motion.span style={{ opacity, scale }} className="flex origin-left items-center gap-1.5 text-[11px] text-fg @[34rem]:text-[12px]">
      <HexDot color={STATUS_COLOR[s]} opacity={0.55} className="h-3.5 w-[12px]" />
      {s}
    </motion.span>
  );
}

export function Legend({ p }: { p: MV }) {
  const opacity = useFade(p, T.strip[0] - 0.008, T.strip[1], T.shrink[0]);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-x-0 top-[calc(var(--hdr)+var(--gap)+var(--gh)+var(--gap))] flex h-[var(--leg)] items-center justify-between px-1"
    >
      {STATUSES.map((s) => (
        <LegendItem key={s} p={p} s={s} />
      ))}
    </motion.div>
  );
}

function StripPage({ stop }: { stop: Stop }) {
  const status = STATUS[stop.idx];
  return (
    <div className="flex h-full items-center gap-2.5 px-2.5">
      <HexBadge n={stop.idx + 1} color={STATUS_COLOR[status]} />
      <div className="min-w-0 flex-1">
        <p className={`${MONO} text-[10px] uppercase leading-[14px] tracking-[0.12em]`} style={{ color: STATUS_COLOR[status] }}>
          {status}
        </p>
        <p className="truncate text-[12px] leading-[17px] text-fg @[34rem]:text-[13px]">{stop.stem}</p>
      </div>
    </div>
  );
}

const STRIP_PAGES = STOPS.map((stop) => <StripPage key={stop.idx} stop={stop} />);

/* What the cursor is on: it swaps with a wipe each time the teacher jumps. */
export function Strip({ p }: { p: MV }) {
  const opacity = useFade(p, T.strip[0], T.strip[1], T.shrink[0]);
  const pos = useKeys(p, T.stripPos.t, T.stripPos.v);
  return (
    <motion.div
      style={{ opacity }}
      className="absolute inset-x-0 top-[calc(var(--hdr)+var(--gap)+var(--gh)+var(--gap)+var(--leg)+var(--gap))] h-[var(--strip)] overflow-hidden rounded-lg border border-line-strong bg-surface-1"
    >
      <WipePages pos={pos} pages={STRIP_PAGES} className="h-full w-full" />
    </motion.div>
  );
}

const DELTA: Record<Status, number> = { reviewed: 1, draft: -1, flagged: 0, untouched: 0 };

function CountRoll({ p, s }: { p: MV; s: Status }) {
  const t = useSeg(p, T.flip[0], T.flip[1], easeOutCubic);
  const y = useTransform(t, (v) => `${(-v * 50).toFixed(3)}%`);
  const from = COUNTS[s];
  if (DELTA[s] === 0) return <span className="tabular-nums text-fg">{from}</span>;
  return (
    <span className="inline-block h-[1.35em] overflow-hidden text-right leading-[1.35em]">
      <motion.span style={{ y }} className="flex flex-col tabular-nums text-fg">
        <span>{from}</span>
        <span>{from + DELTA[s]}</span>
      </motion.span>
    </span>
  );
}

function StatusRow({ p, s }: { p: MV; s: Status }) {
  return (
    <div className="flex items-center gap-1.5 text-[11px] text-dim @[34rem]:text-[12px]">
      <HexDot color={STATUS_COLOR[s]} opacity={0.55} className="h-3.5 w-[12px]" />
      <span className="flex-1">{s}</span>
      <CountRoll p={p} s={s} />
    </div>
  );
}

function StatusBar() {
  return (
    <div aria-hidden className="flex h-1.5 gap-[2px] overflow-hidden rounded-full">
      {STATUSES.map((s) => (
        <i key={s} style={{ width: `${(COUNTS[s] / N) * 100}%`, background: STATUS_COLOR[s], opacity: s === "untouched" ? 0.4 : 0.85 }} />
      ))}
    </div>
  );
}

export function StatusPanel({ p }: { p: MV }) {
  const t = useSeg(p, T.shrink[1] - 0.01, T.shrink[1] + 0.008, easeOutCubic);
  const x = useTransform(t, (v) => (1 - v) * 12);
  return (
    <motion.div
      style={{ opacity: t, x }}
      className="absolute right-0 top-[calc(var(--hdr)+var(--gap))] flex h-[calc(var(--gh)*var(--mini))] flex-col justify-between left-[calc(var(--gw)*var(--mini)+14px)]"
    >
      <div className="flex items-baseline justify-between gap-2 whitespace-nowrap">
        <MonoLabel>by status</MonoLabel>
        <span className={`${MONO} text-[10px] text-mute`}>
          {N}
          <span className="hidden @[34rem]:inline"> total</span>
        </span>
      </div>
      {STATUSES.map((s) => (
        <StatusRow key={s} p={p} s={s} />
      ))}
      <StatusBar />
    </motion.div>
  );
}
