"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import {
  COL_BAND,
  COL_CENTERS,
  FRAME_PHONE,
  FRAME_WIDE,
  ISLAND,
  RADIUS,
  RULER_GAP,
  SCREEN_PHONE,
  STATUS_COVER,
  T,
  TAB_ZONE,
  THUMB,
  ZONE,
  type Rect,
} from "./MobileSceneData";
import { coverAt, frameAt, frameEase, lerp, lerpRect, segAt, thumbY } from "./MobileSceneMath";
import { FS, TXT, u, useBox } from "./MobileSceneKit";
import { RulerLabel } from "./MobileSceneIcons";
import { LargeTitle, StatusBar, TabBar, sceneIn } from "./MobileSceneDevice";

/* Device chrome and annotation layer: frame, screen, ruler, column guides, thumb, reach zone. */

const radii = (top: number, bottom: number) => `${u(top)} ${u(top)} ${u(bottom)} ${u(bottom)}`;
const FADE_ALL = T.frame[0] + 0.01;

/* Dark glass for the bezel and the island: the surface token pulled toward black so it reads as a device, not a card. */
const GLASS = "color-mix(in oklab, var(--color-surface-1) 40%, black)";
const DEVICE_IN = [0.55, 1] as const;

const NUBS = [
  { side: "left", y: 46, h: 8 },
  { side: "left", y: 62, h: 15 },
  { side: "left", y: 81, h: 15 },
  { side: "right", y: 70, h: 24 },
] as const;

function Nubs({ show }: { show: MV }) {
  return (
    <>
      {NUBS.map((n) => (
        <motion.i
          key={`${n.side}${n.y}`}
          aria-hidden
          style={{ opacity: show, top: u(n.y), height: u(n.h), width: u(1.6), [n.side]: u(-2.1) }}
          className="absolute rounded-full bg-line-strong"
        />
      ))}
    </>
  );
}

export function Frame({ p }: { p: MV }) {
  const box = useBox(p, (v) => frameAt(v).frame);
  const radius = useTransform(p, (v) => u(lerp(RADIUS.frame[0], RADIUS.frame[1], frameEase(v))));
  const device = useTransform(p, (v) => segAt(frameEase(v), DEVICE_IN));
  return (
    <motion.div
      aria-hidden
      style={{ ...box, borderRadius: radius }}
      className="absolute z-0 border border-line-strong bg-surface-1 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.7)]"
    >
      <motion.i
        style={{ opacity: device, background: GLASS, boxShadow: `inset 0 0 0 ${u(1.2)} var(--color-line-strong)` }}
        className="absolute inset-0 rounded-[inherit]"
      />
      <Nubs show={device} />
    </motion.div>
  );
}

/* Scroll edges: the layer is cut under the status bar and fades over the last few units above the tab bar, so a card that
   has just crept past the bar shows as a faint hint, never a hard sliver. Cards rest clear of the band, so at rest nothing is touched. */
const EDGE_FADE = 3;
const edgeMask = (top: number, bottom: number) => {
  const cut = u(STATUS_COVER * top);
  const bar = u(TAB_ZONE * bottom);
  const soft = u(EDGE_FADE * bottom);
  return `linear-gradient(to bottom, transparent ${cut}, #000 ${cut}, #000 calc(100% - ${bar} - ${soft}), transparent calc(100% - ${bar}))`;
};

function CardLayer({ p, children }: { p: MV; children: ReactNode }) {
  const mask = useTransform(p, (v) => edgeMask(coverAt(v), sceneIn(v)));
  return (
    <motion.div style={{ maskImage: mask, WebkitMaskImage: mask }} className="absolute inset-0 z-30">
      {children}
    </motion.div>
  );
}

export function Screen({ p, children }: { p: MV; children: ReactNode }) {
  const box = useBox(p, (v) => frameAt(v).screen);
  const radius = useTransform(p, (v) => {
    const f = frameEase(v);
    return radii(lerp(RADIUS.screenTop[0], RADIUS.screenTop[1], f), lerp(RADIUS.screenBottom[0], RADIUS.screenBottom[1], f));
  });
  return (
    <motion.div aria-hidden style={{ ...box, borderRadius: radius }} className="absolute z-10 overflow-hidden bg-bg">
      <CardLayer p={p}>{children}</CardLayer>
      <LargeTitle p={p} />
      <StatusBar p={p} />
      <TabBar p={p} />
    </motion.div>
  );
}

const URL_WIDE: Rect = { x: 50, y: 87, w: 256, h: 12 };
const URL_PHONE: Rect = ISLAND;

export function Chrome({ p }: { p: MV }) {
  const pill = useBox(p, (v) => lerpRect(URL_WIDE, URL_PHONE, frameEase(v)));
  const island = useTransform(p, (v) => segAt(frameEase(v), DEVICE_IN));
  const fill = useTransform(island, (t) => `color-mix(in oklab, ${GLASS} ${(t * 100).toFixed(1)}%, var(--color-surface-2))`);
  const rim = useTransform(island, (t) => `color-mix(in oklab, var(--color-line-strong) ${((1 - t) * 100).toFixed(1)}%, transparent)`);
  const label = useTransform(p, (v) => 1 - segAt(frameEase(v), [0, 0.35]));
  const dots = useTransform(p, (v) => 1 - segAt(frameEase(v), [0, 0.3]));
  const dotsLeft = useTransform(p, (v) => u(frameAt(v).frame.x + 8));
  const dotsTop = useTransform(p, (v) => u(frameAt(v).frame.y + 6));
  return (
    <>
      <motion.div
        aria-hidden
        style={{ left: dotsLeft, top: dotsTop, opacity: dots, gap: u(3.5) }}
        className="absolute z-20 flex"
      >
        {[0, 1, 2].map((i) => (
          <i key={i} className="rounded-full bg-line-strong" style={{ width: u(5), height: u(5) }} />
        ))}
      </motion.div>
      <motion.div
        aria-hidden
        style={{ ...pill, backgroundColor: fill, borderColor: rim }}
        className="absolute z-50 grid place-items-center overflow-hidden rounded-full border"
      >
        <motion.span style={{ opacity: label, fontSize: u(FS), lineHeight: 1 }} className={`${MONO} whitespace-nowrap text-mute`}>
          dashboard
        </motion.span>
      </motion.div>
    </>
  );
}

export function Ruler({ p }: { p: MV }) {
  const box = useBox(p, (v) => {
    const { frame } = frameAt(v);
    return { x: frame.x, y: frame.y - RULER_GAP, w: frame.w, h: 0 };
  });
  const draw = useSeg(p, 0.08, 0.17, easeOutCubic);
  return (
    <motion.div aria-hidden style={box} className="absolute z-20">
      <motion.div style={{ opacity: draw }} className="absolute inset-0">
        <motion.i style={{ scaleX: draw }} className="absolute inset-x-0 top-0 h-px bg-dim" />
        <i className="absolute left-0 top-0 w-px -translate-y-1/2 bg-dim" style={{ height: u(7) }} />
        <i className="absolute right-0 top-0 w-px -translate-y-1/2 bg-dim" style={{ height: u(7) }} />
      </motion.div>
      <RulerLabel p={p} draw={draw} />
    </motion.div>
  );
}

function ColBand({ p, col }: { p: MV; col: number }) {
  const a = T.cols[0] + col * T.colStep;
  const op = useTransform(p, [a, a + 0.02, a + 0.06, a + 0.09, FADE_ALL - 0.04, FADE_ALL + 0.02], [0, 1, 1, 0.4, 0.4, 0]);
  const pillOp = useTransform(p, [a, a + 0.02, FADE_ALL - 0.04, FADE_ALL + 0.02], [0, 1, 1, 0]);
  const cx = COL_CENTERS[col];
  return (
    <>
      <motion.i
        aria-hidden
        style={{ opacity: op, left: u(cx - COL_BAND.w / 2), top: u(COL_BAND.top), width: u(COL_BAND.w), height: u(COL_BAND.height), borderRadius: u(6) }}
        className="pointer-events-none absolute z-20 border border-dashed border-accent bg-accent/[0.07]"
      />
      <motion.span
        aria-hidden
        style={{ opacity: pillOp, left: u(cx), top: u(FRAME_WIDE.y + FRAME_WIDE.h + 8), ...TXT.xs }}
        className={`${MONO} absolute z-20 -translate-x-1/2 whitespace-nowrap text-dim`}
      >
        col {col + 1}
      </motion.span>
    </>
  );
}

export function ColBands({ p }: { p: MV }) {
  return (
    <>
      {COL_CENTERS.map((_, i) => (
        <ColBand key={i} p={p} col={i} />
      ))}
    </>
  );
}

export function Legend({ p }: { p: MV }) {
  const op = useTransform(p, [T.legend[0], T.legend[1], FADE_ALL - 0.01, FADE_ALL + 0.02], [0, 1, 1, 0]);
  return (
    <motion.p
      aria-hidden
      style={{ opacity: op, top: u(FRAME_WIDE.y + FRAME_WIDE.h + 32), ...TXT.xs }}
      className={`${MONO} absolute inset-x-0 z-20 text-center text-dim`}
    >
      01 to 06 = mobile priority
    </motion.p>
  );
}

/* The swipe leaves a short comet tail under the thumb, not its whole path, so it never scores through a row of text. */
const TAIL = "linear-gradient(to bottom, color-mix(in oklab, var(--color-accent) 60%, transparent), transparent)";
const THUMB_STOPS = [T.thumbIn[0], T.thumbIn[1], T.lift - 0.015, T.lift - 0.005, T.lift + 0.005, T.swipe2[0] + 0.005, T.swipe2[1] - 0.005, T.swipe2[1] + 0.015];

export function Thumb({ p }: { p: MV }) {
  const y = useTransform(p, thumbY);
  const op = useTransform(p, THUMB_STOPS, [0, 1, 1, 0, 0, 1, 1, 0]);
  const ringTop = useTransform(y, (v) => u(v - THUMB.d / 2));
  const trailTop = useTransform(y, (v) => u(v + THUMB.d / 2));
  const trailH = useTransform(y, (v) => u(Math.min(THUMB.tail, Math.max(0, THUMB.y0 - v))));
  return (
    <motion.div aria-hidden style={{ opacity: op }} className="pointer-events-none absolute inset-0 z-50">
      <motion.i
        style={{ top: trailTop, height: trailH, left: u(THUMB.x - 0.75), width: u(1.5), background: TAIL }}
        className="absolute"
      />
      <motion.span
        style={{ top: ringTop, left: u(THUMB.x - THUMB.d / 2), width: u(THUMB.d), height: u(THUMB.d) }}
        className="absolute rounded-full border-[1.5px] border-accent"
      >
        <i className="absolute rounded-full bg-accent" style={{ inset: "36%" }} />
      </motion.span>
    </motion.div>
  );
}

const HEAT_STOPS = [
  "color-mix(in oklab, var(--color-accent) 15%, transparent) 0%",
  "color-mix(in oklab, var(--color-accent) 6%, transparent) 55%",
  "transparent 100%",
].join(", ");
const heatAt = (t: number) => `radial-gradient(circle calc(var(--u) * ${(ZONE.r * t).toFixed(1)}) at 100% 100%, ${HEAT_STOPS})`;

/* The label is a two-line callout hung on the phone's edge by a short leader, so it stays inside the stage at any width. */
const LABEL_DOT = 6;
const LEADER = 9;
const LABEL_LIFT = 24;

export function Zone({ p }: { p: MV }) {
  const [z0, z1] = T.zone;
  const reach = useSeg(p, z0, z1 - 0.02, easeOutCubic);
  const heat = useTransform(reach, heatAt);
  const label = useTransform(p, [z0 + 0.05, z1 - 0.005], [0, 1], { clamp: true });
  const s = SCREEN_PHONE;
  return (
    <>
      <motion.div
        aria-hidden
        style={{ background: heat, left: u(s.x), top: u(s.y), width: u(s.w), height: u(s.h), borderRadius: radii(RADIUS.screenTop[1], RADIUS.screenBottom[1]) }}
        className="pointer-events-none absolute z-30"
      />
      <motion.p
        aria-hidden
        style={{ opacity: label, left: u(FRAME_PHONE.x + FRAME_PHONE.w - LABEL_DOT / 2), top: u(ZONE.cy - LABEL_LIFT), ...TXT.xs }}
        className={`${MONO} absolute z-30 flex items-center text-dim`}
      >
        <i className="shrink-0 rounded-full bg-accent" style={{ width: u(LABEL_DOT), height: u(LABEL_DOT) }} />
        <i className="shrink-0 bg-accent" style={{ width: u(LEADER), height: u(0.75), opacity: 0.6 }} />
        <span style={{ marginLeft: u(4), lineHeight: 1.15 }}>
          thumb
          <br />
          zone
        </span>
      </motion.p>
    </>
  );
}
