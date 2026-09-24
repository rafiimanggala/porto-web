"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import {
  DOMAIN_RING,
  FEED_DOMAINS,
  HUB_STOPS,
  LEGEND,
  SCORE,
  T,
  THUMB,
  PANEL,
} from "./WearableSceneData";
import { Mono, arcPath, bezier, clamp01, cubicD, cq, frac, fs, pct, sx, sy, useDrawn } from "./WearableSceneKit";

/* Chapter 4: thumbnail to readiness ring, ring to the Vitals domain, domains to the score. */

const ARC_GAP = 5;
const SEG = 360 / FEED_DOMAINS.length;
const RING_START = -SEG;
const FLOW_SPEED = 6;
const RING = HUB_STOPS.feed;
const OTHER_ARC = "color-mix(in oklab, var(--color-fg) 78%, var(--color-mute))";
const ARC_STAGGER = 0.005;
const ARC_SPAN = 0.03;
const SCORE_TOTAL = FEED_DOMAINS.reduce((t, d) => t + d.v, 0);

/* Fill window of domain i: the five others fill first, Vitals lands last. */
const fillWindow = (i: number): [number, number] => {
  if (i === 0) return [T.land[0], T.land[1]];
  const a = T.domainRing[0] + (i - 1) * ARC_STAGGER;
  return [a, a + ARC_SPAN];
};
const fillAt = (i: number, v: number) => {
  const [a, b] = fillWindow(i);
  return easeOutCubic(clamp01((v - a) / (b - a)));
};
/* The score is the running sum of what has filled so far, so it reaches SCORE exactly when Vitals lands. */
const scoreAt = (v: number) =>
  Math.round((SCORE * FEED_DOMAINS.reduce((t, d, i) => t + fillAt(i, v) * d.v, 0)) / SCORE_TOTAL);
const LEGEND_H = LEGEND.row * FEED_DOMAINS.length;

const thumbRight = THUMB.x + PANEL.w * THUMB.scale;
const thumbMid = THUMB.y + (PANEL.h * THUMB.scale) / 2;
const FLOW_IN: [number, number][] = [
  [thumbRight + 2, thumbMid],
  [thumbRight + 34, thumbMid],
  [RING.x - RING.d / 2 - 36, RING.y],
  [RING.x - RING.d / 2 - 2, RING.y],
];
const LINK_TOP = LEGEND.y - 2;
const LINK: [number, number][] = [
  [RING.x, RING.y + RING.d / 2 + 2],
  [RING.x, RING.y + RING.d / 2 + 40],
  [RING.x, LINK_TOP - 40],
  [RING.x, LINK_TOP],
];
const VITALS_MID = RING_START + SEG / 2;
const rad = (d: number) => (d * Math.PI) / 180;
const VITALS_PT = {
  x: DOMAIN_RING.x + DOMAIN_RING.r * Math.cos(rad(VITALS_MID)),
  y: DOMAIN_RING.y + DOMAIN_RING.r * Math.sin(rad(VITALS_MID)),
};
const ROW_MID = LEGEND.y + 7;
const CONNECT_D = `M ${LEGEND.x - 2} ${ROW_MID} H ${LEGEND.x - 16} L ${VITALS_PT.x + 4} ${VITALS_PT.y - 3}`;
const FLOW_IN_D = cubicD(FLOW_IN);
const LINK_D = cubicD(LINK);

function FlowPacket({ p, pts, a, k }: { p: MV; pts: [number, number][]; a: number; k: number }) {
  const t = useTransform(p, (v) => frac((v - a) * FLOW_SPEED + k / 3));
  const left = useTransform(t, (u) => sx(bezier(pts, u)[0]));
  const top = useTransform(t, (u) => sy(bezier(pts, u)[1]));
  const opacity = useTransform(p, [a, a + 0.012], [0, 1]);
  return (
    <motion.i
      aria-hidden
      style={{ left, top, opacity, width: cq(6), height: cq(6) }}
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent"
    />
  );
}

export function FeedPackets({ p }: { p: MV }) {
  return (
    <>
      {[0, 1, 2].map((k) => (
        <FlowPacket key={`in${k}`} p={p} pts={FLOW_IN} a={T.flowIn[1]} k={k} />
      ))}
      {[0, 1, 2].map((k) => (
        <FlowPacket key={`link${k}`} p={p} pts={LINK} a={T.link[1]} k={k} />
      ))}
    </>
  );
}

function Flow({ p, d, seg }: { p: MV; d: string; seg: readonly [number, number] }) {
  const k = useSeg(p, seg[0], seg[1], easeInOutCubic);
  const drawn = useDrawn(k);
  const guide = useSeg(p, seg[0] - 0.03, seg[0]);
  return (
    <>
      <motion.path d={d} fill="none" strokeWidth="1" strokeDasharray="2 4" style={{ opacity: guide, stroke: "var(--color-line-strong)" }} />
      <motion.path d={d} fill="none" strokeWidth="2" style={{ pathLength: k, opacity: drawn, stroke: "var(--color-accent)" }} />
    </>
  );
}

function DomainArc({ p, i, v }: { p: MV; i: number; v: number }) {
  const a0 = RING_START + i * SEG + ARC_GAP / 2;
  const a1 = RING_START + (i + 1) * SEG - ARC_GAP / 2;
  const d = arcPath(DOMAIN_RING.x, DOMAIN_RING.y, DOMAIN_RING.r, a0, a1);
  const fillLen = useTransform(p, (pv) => fillAt(i, pv) * (v / 100));
  const fillDrawn = useDrawn(fillLen);
  return (
    <>
      <path d={d} fill="none" strokeWidth={DOMAIN_RING.w} style={{ stroke: "var(--color-line-strong)" }} />
      <motion.path
        d={d}
        fill="none"
        strokeWidth={DOMAIN_RING.w}
        style={{ pathLength: fillLen, opacity: fillDrawn, stroke: i === 0 ? "var(--color-mint)" : OTHER_ARC }}
      />
    </>
  );
}

export function FeedLines({ p }: { p: MV }) {
  const connect = useSeg(p, T.land[0], T.land[0] + 0.012);
  const connectDrawn = useDrawn(connect);
  const ringIn = useSeg(p, T.ringIn[0], T.ringIn[1]);
  return (
    <>
      <Flow p={p} d={FLOW_IN_D} seg={T.flowIn} />
      <Flow p={p} d={LINK_D} seg={T.link} />
      <motion.path d={CONNECT_D} fill="none" strokeWidth="1.6" style={{ pathLength: connect, opacity: connectDrawn, stroke: "var(--color-accent)" }} />
      <motion.g style={{ opacity: ringIn }}>
        {FEED_DOMAINS.map((dm, i) => (
          <DomainArc key={dm.k} p={p} i={i} v={dm.v} />
        ))}
      </motion.g>
    </>
  );
}

export function ScoreNumeral({ p }: { p: MV }) {
  const ringIn = useSeg(p, T.ringIn[0], T.ringIn[1]);
  const count = useTransform(p, scoreAt);
  const text = useTransform(count, (n) => String(n));
  const opacity = useTransform([ringIn, count], ([r, n]: number[]) => (n > 0 ? r : 0));
  const bump = useSeg(p, T.land[1] - 0.02, T.land[1]);
  const scale = useTransform(bump, [0, 0.5, 1], [1, 1.06, 1]);
  return (
    <motion.div
      style={{ opacity, scale, left: sx(DOMAIN_RING.x), top: sy(DOMAIN_RING.y) }}
      className="absolute grid -translate-x-1/2 -translate-y-1/2 place-items-center text-center"
    >
      <motion.span style={{ fontSize: fs(44, 60) }} className="t-hero leading-none tabular-nums text-fg">
        {text}
      </motion.span>
      <span className={`${MONO} mt-1 block uppercase leading-[1.25] tracking-[0.1em] text-mute`} style={{ fontSize: fs(10) }}>
        longevity
        <br />
        score
      </span>
    </motion.div>
  );
}

function LegendRow({ p, i, name, value }: { p: MV; i: number; name: string; value: number }) {
  const isVitals = i === 0;
  const [l0, l1] = T.legend;
  const enter = useSeg(p, l0 + i * 0.008, l1 - 0.03 + i * 0.008, easeOutCubic);
  const y = useTransform(enter, (v) => (1 - v) * 8);
  const land = useSeg(p, T.land[0], T.land[1], easeOutCubic);
  const tone = useTransform(land, (v) => `color-mix(in oklab, var(--color-fg) ${(isVitals ? 40 + 60 * v : 100).toFixed(0)}%, var(--color-mute))`);
  const glow = useTransform(land, [0, 0.3, 1], [0, 1, 0.55]);
  return (
    <motion.div
      style={{ opacity: enter, y, top: pct(i * LEGEND.row, LEGEND_H), height: pct(LEGEND.row - 2, LEGEND_H) }}
      className="absolute inset-x-0 flex items-center justify-between px-2"
    >
      {isVitals && <motion.i aria-hidden style={{ opacity: glow }} className="absolute inset-0 rounded-md border border-accent/70 bg-accent/25" />}
      <span className="relative flex items-center gap-1.5">
        <i className="h-1.5 w-1.5 rounded-full" style={{ background: isVitals ? "var(--color-mint)" : OTHER_ARC }} />
        <Mono className={isVitals ? "text-fg" : "text-dim"}>{name}</Mono>
      </span>
      <motion.span className={`${MONO} relative tabular-nums`} style={{ fontSize: fs(10.2), color: tone }}>
        {value}
      </motion.span>
    </motion.div>
  );
}

export function Legend({ p }: { p: MV }) {
  return (
    <div style={{ left: sx(LEGEND.x), top: sy(LEGEND.y), width: sx(LEGEND.w), height: sy(LEGEND_H) }} className="absolute">
      {FEED_DOMAINS.map((d, i) => (
        <LegendRow key={d.k} p={p} i={i} name={d.k} value={d.v} />
      ))}
    </div>
  );
}

export function ThumbCaption({ p }: { p: MV }) {
  const opacity = useSeg(p, T.shrink[1] - 0.02, T.shrink[1] + 0.015);
  return (
    <motion.p
      style={{ opacity, left: sx(THUMB.x), top: sy(THUMB.y + PANEL.h * THUMB.scale + 6) }}
      className={`${MONO} absolute whitespace-nowrap text-mute`}
    >
      <Mono>30 nights</Mono>
    </motion.p>
  );
}

export function LinkLabel({ p }: { p: MV }) {
  const opacity = useSeg(p, T.link[0], T.link[1]);
  return (
    <motion.p
      style={{ opacity, left: sx(RING.x + 10), top: sy((LINK[0][1] + LINK[3][1]) / 2), fontSize: fs(10.2) }}
      className={`${MONO} absolute -translate-y-1/2 whitespace-nowrap text-mute`}
    >
      feeds vitals
    </motion.p>
  );
}
