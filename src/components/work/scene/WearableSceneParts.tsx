"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInCubic, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import {
  CHIPS,
  HUB_STOPS,
  READY,
  STAGE_W,
  SYNC_LOG,
  T,
} from "./WearableSceneData";
import {
  ClipPane,
  DEVICE_COLORS,
  Mono,
  Typed,
  bezier,
  clamp01,
  cq,
  cubicD,
  frac,
  fs,
  lerp,
  pct,
  stageBox,
  sx,
  sy,
  useDrawn,
} from "./WearableSceneKit";
import { CHIP_ICON, ChipIcon } from "./WearableSceneIcons";

/* Chapter 1 pieces, plus the hub that later flies off to become the readiness ring. */

const HUB = HUB_STOPS.start;
const HUB_R = HUB.d / 2;
const LINK_ANGLES = [-135, -90, -45] as const;
const LINK_DY = 52;
const LINK_DRAW = 0.04;
const DRAW_DELAY = 0.01;
const CHIP_ON = 0.012;
const CHIP_PULSE = 0.04;
const ARC_LEN = 0.03;
const RIPPLE_LEN = 0.045;
const RIPPLE_GROW = 0.45;
const CAPTION_GAP = 30;
const LOG_DELAY = 0.055;
const LOG_LEN = 0.05;
const PACKET_FADE = 0.012;
const PACKET_SPEED = 8;
const ARC_SHARE = 0.3;
const RING_WARN_AT = 72;
const RING_WARN_SPAN = 6;
const LABEL_FROM = 60;
const LABEL_SPAN = 14;
const NUM_SHARE = 0.36;
const QUIET_DROP = 0.45;

/* Hub count layer: the display-font zero reads as a broken glyph, so 0 gets its own mono layer. */
const modeFade = (n: number, m: number, counted: boolean) => ((n > 0) === counted ? 1 - clamp01(m / 0.33) : 0);

const linkStart = (i: number) => T.linkStart + i * T.linkStep;
const linkEnd = (i: number) => linkStart(i) + DRAW_DELAY + LINK_DRAW;

export const LINKS = CHIPS.map((c, i) => {
  const s: [number, number] = [c.full.x + c.full.w / 2, c.full.y + c.full.h];
  const ang = (LINK_ANGLES[i] * Math.PI) / 180;
  const e: [number, number] = [HUB.x + (HUB_R + 4) * Math.cos(ang), HUB.y + (HUB_R + 4) * Math.sin(ang)];
  return [s, [s[0], s[1] + LINK_DY], [e[0], e[1] - LINK_DY], e] as [number, number][];
});

export function DeviceChip({ p, i }: { p: MV; i: number }) {
  const chip = CHIPS[i];
  const a = linkStart(i);
  const on = useSeg(p, linkEnd(i) - CHIP_ON / 2, linkEnd(i) + CHIP_ON / 2);
  const move = useSeg(p, T.chipMove[0], T.chipMove[1], easeInOutCubic);
  const left = useTransform(move, (k) => sx(lerp(chip.full.x, chip.strip.x, k)));
  const top = useTransform(move, (k) => sy(lerp(chip.full.y, chip.strip.y, k)));
  const width = useTransform(move, (k) => sx(lerp(chip.full.w, chip.strip.w, k)));
  const height = useTransform(move, (k) => sy(lerp(chip.full.h, chip.strip.h, k)));
  const statusOp = useTransform(move, [0, 0.35], [1, 0]);
  const dashedOp = useTransform(on, (v) => 1 - v);
  const idleClip = useTransform(on, (v) => `inset(0 0 0 ${(v * 100).toFixed(1)}%)`);
  const doneClip = useTransform(on, (v) => `inset(0 ${(100 - v * 100).toFixed(1)}% 0 0)`);
  const nameLeft = useTransform(move, (k) => cq(lerp(CHIP_ICON.nameFull, CHIP_ICON.nameStrip, k)));
  const pulse = useSeg(p, a, a + CHIP_PULSE, easeOutCubic);
  const pulseScale = useTransform(pulse, (v) => 1 + 0.18 * v);
  const pulseOp = useTransform(pulse, [0, 0.1, 1], [0, 0.7, 0]);
  return (
    <motion.div style={{ left, top, width, height }} className="absolute">
      <motion.i aria-hidden style={{ scale: pulseScale, opacity: pulseOp, borderColor: chip.color }} className="absolute inset-0 rounded-lg border-2" />
      <div className="absolute inset-0 rounded-lg bg-surface-1" />
      <motion.div style={{ opacity: dashedOp }} className="absolute inset-0 rounded-lg border border-dashed border-line-strong" />
      <motion.div style={{ opacity: on }} className="absolute inset-0 rounded-lg border border-line-strong" />
      <motion.i
        aria-hidden
        style={{ scaleX: on, background: chip.color }}
        className="absolute inset-x-1.5 top-0 h-[3px] origin-left rounded-b-full"
      />
      <ChipIcon name={chip.icon} move={move} pulse={pulse} p={p} />
      <motion.span style={{ left: nameLeft, height: cq(chip.strip.h), fontSize: fs(11) }} className="absolute top-0 flex items-center text-fg">
        {chip.key}
      </motion.span>
      <motion.div style={{ opacity: statusOp, left: cq(CHIP_ICON.nameFull), bottom: cq(7), right: cq(6), height: cq(12) }} className="absolute">
        <motion.span style={{ clipPath: idleClip }} className={`absolute inset-0 flex items-center text-mute ${MONO}`}>
          <Mono>OAuth</Mono>
        </motion.span>
        <motion.span style={{ clipPath: doneClip }} className={`absolute inset-0 flex items-center gap-1.5 text-fg ${MONO}`}>
          <i className="h-1.5 w-1.5 rounded-full" style={{ background: chip.color }} />
          <Mono>linked</Mono>
        </motion.span>
      </motion.div>
    </motion.div>
  );
}

export function DeviceLink({ p, i }: { p: MV; i: number }) {
  const a = linkStart(i);
  const draw = useSeg(p, a + DRAW_DELAY, linkEnd(i), easeInOutCubic);
  const retract = useSeg(p, T.retract[0], T.retract[1], easeInCubic);
  const length = useTransform([draw, retract], ([d, r]: number[]) => d * (1 - r));
  const drawn = useDrawn(length);
  const guideOp = useTransform(retract, (r) => 0.55 * (1 - r));
  const d = cubicD(LINKS[i]);
  return (
    <>
      <motion.path d={d} fill="none" strokeWidth={1} strokeDasharray="2 4" style={{ stroke: "var(--color-line-strong)", opacity: guideOp }} />
      <motion.path d={d} fill="none" strokeWidth={2} style={{ pathLength: length, opacity: drawn, stroke: DEVICE_COLORS[i] }} />
    </>
  );
}

export function Packet({ p, i, k }: { p: MV; i: number; k: number }) {
  const a = linkEnd(i);
  const t = useTransform(p, (v) => frac((v - a) * PACKET_SPEED + k * 0.5));
  const left = useTransform(t, (u) => sx(bezier(LINKS[i], u)[0]));
  const top = useTransform(t, (u) => sy(bezier(LINKS[i], u)[1]));
  const opacity = useTransform(p, [a, a + PACKET_FADE, T.retract[0], T.retract[0] + PACKET_FADE], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left, top, opacity, background: DEVICE_COLORS[i], width: cq(6), height: cq(6) }}
      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
    />
  );
}

export function HubRipple({ p, i }: { p: MV; i: number }) {
  const a = linkEnd(i);
  const t = useSeg(p, a, a + RIPPLE_LEN, easeOutCubic);
  const scale = useTransform(t, (v) => 1 + RIPPLE_GROW * v);
  const opacity = useTransform(t, [0, 0.08, 1], [0, 0.8, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ ...stageBox({ x: HUB.x - HUB_R, y: HUB.y - HUB_R, w: HUB.d, h: HUB.d }), scale, opacity, borderColor: DEVICE_COLORS[i] }}
      className="pointer-events-none absolute rounded-full border-2"
    />
  );
}

export function HubCaption({ p }: { p: MV }) {
  const opacity = useTransform(p, [0.02, 0.05, T.retract[0], T.retract[1]], [0, 1, 1, 0]);
  return (
    <motion.p
      style={{ opacity, left: sx(HUB.x), top: sy(HUB.y + HUB_R + CAPTION_GAP), fontSize: fs(10.2) }}
      className={`absolute -translate-x-1/2 whitespace-nowrap text-mute ${MONO}`}
    >
      authorise once, sync nightly
    </motion.p>
  );
}

function HubArc({ p, i }: { p: MV; i: number }) {
  const a = linkEnd(i);
  const len = useSeg(p, a, a + ARC_LEN, easeOutCubic);
  const pathLength = useTransform(len, (v) => v * ARC_SHARE);
  const drawn = useDrawn(pathLength);
  return (
    <g transform={`rotate(${-90 + i * 120 + 6} 50 50)`}>
      <motion.circle cx="50" cy="50" r="43" fill="none" strokeWidth="6" style={{ pathLength, opacity: drawn, stroke: DEVICE_COLORS[i] }} />
    </g>
  );
}

function useHubStyles(p: MV) {
  const s = HUB_STOPS;
  const fly1 = useSeg(p, T.hubFly[0], T.hubFly[1], easeInOutCubic);
  const fly2 = useSeg(p, T.hubFeed[0], T.hubFeed[1], easeInOutCubic);
  const geo = useTransform([fly1, fly2], ([f1, f2]: number[]) => {
    const m = (k: "x" | "y" | "d") => lerp(lerp(s.start[k], s.strip[k], f1), s.feed[k], f2);
    return { x: m("x"), y: m("y"), d: m("d") };
  });
  const labelOp = useTransform(geo, (g) => clamp01((g.d - LABEL_FROM) / LABEL_SPAN));
  return {
    left: useTransform(geo, (g) => sx(g.x - g.d / 2)),
    top: useTransform(geo, (g) => sy(g.y - g.d / 2)),
    width: useTransform(geo, (g) => sx(g.d)),
    height: useTransform(geo, (g) => sy(g.d)),
    numSize: useTransform(geo, (g) => fs(g.d * NUM_SHARE, 44)),
    labelOp,
    shiftY: useTransform(labelOp, (v) => `${-7 * v}%`),
  };
}

function ReadyRing({ night, mode }: { night: MV; mode: MV }) {
  const ready = useTransform(night, (n) => READY[n]);
  const readyLen = useTransform(ready, (r) => r / 100);
  const warn = useTransform(ready, (r) => (clamp01((RING_WARN_AT - r) / RING_WARN_SPAN) * 100).toFixed(0));
  const readyColor = useTransform(warn, (w) => `color-mix(in oklab, var(--color-accent) ${w}%, var(--color-mint))`);
  return (
    <motion.svg style={{ opacity: mode }} viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
      <circle cx="50" cy="50" r="43" fill="none" strokeWidth="6" style={{ stroke: "var(--color-line-strong)" }} />
      <g transform="rotate(-90 50 50)">
        <motion.circle cx="50" cy="50" r="43" fill="none" strokeWidth="6" style={{ pathLength: readyLen, stroke: readyColor }} />
      </g>
    </motion.svg>
  );
}

export function HubNode({ p, night }: { p: MV; night: MV }) {
  const st = useHubStyles(p);
  const mode = useSeg(p, T.hubMode[0], T.hubMode[1]);
  const hubOp = useTransform(mode, (v) => 1 - v);
  const readyNumOp = useTransform(mode, [0.66, 1], [0, 1]);
  const label = useTransform(mode, (v): string => (v < 0.5 ? "linked" : "readiness"));
  const count = useTransform(p, (v) => CHIPS.filter((_, i) => v >= linkEnd(i)).length);
  const linked = useTransform(count, (n) => String(n));
  const zeroOp = useTransform([count, mode], ([n, m]: number[]) => modeFade(n, m, false));
  const linkedOp = useTransform([count, mode], ([n, m]: number[]) => modeFade(n, m, true));
  const readyText = useTransform(night, (n) => String(READY[n]));
  const quiet = useSeg(p, T.land[0], T.land[1]);
  const settle = useTransform(quiet, (q) => 1 - QUIET_DROP * q);
  const numClass = "t-hero col-start-1 row-start-1 leading-none";
  return (
    <motion.div
      style={{ left: st.left, top: st.top, width: st.width, height: st.height, opacity: settle }}
      className="absolute z-20 rounded-full border border-line-strong bg-surface-1"
    >
      <motion.svg style={{ opacity: hubOp }} viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <circle cx="50" cy="50" r="43" fill="none" strokeWidth="1.2" strokeDasharray="1.5 3" style={{ stroke: "var(--color-line-strong)" }} />
        {CHIPS.map((c, i) => (
          <HubArc key={c.key} p={p} i={i} />
        ))}
      </motion.svg>
      <ReadyRing night={night} mode={mode} />
      <motion.div style={{ y: st.shiftY }} className="absolute inset-0 grid place-items-center text-center">
        <div className="relative grid place-items-center">
          <motion.span style={{ fontSize: st.numSize, opacity: zeroOp }} className={`${MONO} col-start-1 row-start-1 leading-none text-fg`}>
            0
          </motion.span>
          <motion.span style={{ fontSize: st.numSize, opacity: linkedOp }} className={numClass}>
            {linked}
          </motion.span>
          <motion.span style={{ fontSize: st.numSize, opacity: readyNumOp }} className={numClass}>
            {readyText}
          </motion.span>
        </div>
      </motion.div>
      <motion.span
        style={{ opacity: st.labelOp, top: "60%", fontSize: fs(10) }}
        className={`absolute inset-x-0 text-center uppercase tracking-[0.03em] text-mute ${MONO}`}
      >
        {label}
      </motion.span>
    </motion.div>
  );
}

function SyncRow({ p, i, text }: { p: MV; i: number; text: string }) {
  const a = linkStart(i) + LOG_DELAY;
  const dot = useSeg(p, a - DRAW_DELAY, a);
  return (
    <div className="flex items-center gap-2">
      <motion.i style={{ opacity: dot, background: DEVICE_COLORS[i] }} className="h-1.5 w-1.5 shrink-0 rounded-full" />
      <Typed p={p} a={a} b={a + LOG_LEN} text={text} className={`whitespace-pre text-dim ${MONO}`} style={{ fontSize: fs(10.2) }} />
    </div>
  );
}

export function LogPane({ p, outF }: { p: MV; outF: MV }) {
  return (
    <ClipPane outF={outF} className="flex flex-col justify-center gap-1.5 rounded-lg border border-line bg-surface-1/70 px-3">
      {SYNC_LOG.map((text, i) => (
        <SyncRow key={text} p={p} i={i} text={text} />
      ))}
    </ClipPane>
  );
}

export function ReadinessTag({ p }: { p: MV }) {
  const ring = HUB_STOPS.strip;
  const opacity = useTransform(p, [T.hubFly[1], T.hubFly[1] + 0.02, T.hubFeed[0] - 0.01, T.hubFeed[0] + 0.01], [0, 1, 1, 0]);
  return (
    <motion.p
      style={{ opacity, right: pct(STAGE_W - (ring.x - ring.d / 2 - 7), STAGE_W), top: sy(ring.y), fontSize: fs(10.2) }}
      className={`absolute -translate-y-1/2 whitespace-nowrap text-mute ${MONO}`}
    >
      readiness
    </motion.p>
  );
}
