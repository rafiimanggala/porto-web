import { DOMAINS, SCORE } from "./HealthSceneData";

/* Wearable scene content and geometry, stage units 360 x 400. All values are invented (NDA illustrative). */

export const STAGE_W = 360;
export const STAGE_H = 400;
export const NIGHTS = 30;

const seq = <T,>(fn: (i: number) => T): T[] => Array.from({ length: NIGHTS }, (_, i) => fn(i));
const mean = (xs: readonly number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

const HRV_DIP: Record<number, number> = { 19: 53, 20: 48, 21: 43, 22: 46, 23: 51, 24: 55, 29: 58 };
const RHR_DIP: Record<number, number> = { 19: 54, 20: 56, 21: 57, 22: 55, 23: 54, 29: 52 };
const EFF_DIP: Record<number, number> = { 19: 87, 20: 85, 21: 84, 22: 86, 29: 91 };
const MIN_DIP: Record<number, number> = { 19: 412, 20: 398, 21: 392, 22: 402 };

export const HRV = seq((i) => HRV_DIP[i] ?? Math.round(59.6 + 3.3 * Math.sin(i * 1.9 + 0.4) + 1.5 * Math.sin(i * 0.7 + 1.1)));
export const RHR = seq((i) => RHR_DIP[i] ?? Math.round(51.5 + 1.1 * Math.sin(i * 1.3 + 0.8)));
export const EFF = seq((i) => EFF_DIP[i] ?? Math.round(91.6 + 2.2 * Math.sin(i * 1.1 + 2)));
export const SLEEP_MIN = seq((i) => MIN_DIP[i] ?? Math.round(444 + 22 * Math.sin(i * 0.9 + 0.3)));

const deepShare = (i: number) => (i in MIN_DIP ? 0.155 : 0.205 + 0.015 * Math.sin(i * 1.7));
export const STAGES = seq((i) => {
  const total = SLEEP_MIN[i];
  const deep = Math.round(total * deepShare(i));
  const rem = Math.round(total * (0.245 + 0.012 * Math.sin(i * 2.3 + 1)));
  return [deep, rem, total - deep - rem] as const;
});

export const READY = seq((i) =>
  Math.max(0, Math.min(99, Math.round(81 + 0.8 * (HRV[i] - 59) - 1.6 * (RHR[i] - 52) + 0.9 * (EFF[i] - 91)))),
);

const runMean = (xs: readonly number[]) => xs.map((_, i) => mean(xs.slice(0, i + 1)));
export const AVG_HRV = runMean(HRV);
export const AVG_RHR = runMean(RHR);
export const AVG_EFF = runMean(EFF);

export const DIP_FIRST = 19;
export const DIP_LAST = 21;
export const FLAG_NIGHT = DIP_LAST + 1;
export const BASELINE = Math.round(mean(HRV.slice(0, DIP_FIRST)));
export const HRV_DROP = Math.round((1 - Math.min(...HRV) / BASELINE) * 100);
export const NEED_MIN = 444;
export const DEBT_MIN = SLEEP_MIN.slice(DIP_FIRST, DIP_LAST + 1).reduce((a, m) => a + (NEED_MIN - m), 0);
export const MAX_SLEEP_MIN = 480;

export const fmtDur = (min: number) => `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m`;

export const inDip = (i: number) => i >= DIP_FIRST && i <= DIP_LAST + 1;

export const FEED_DOMAINS = [
  ...DOMAINS.filter((d) => d.k === "Vitals"),
  ...DOMAINS.filter((d) => d.k !== "Vitals"),
];
export const VITALS = FEED_DOMAINS[0].v;
export { SCORE };

/* Geometry, stage units. */
export type Rect = { x: number; y: number; w: number; h: number };

export const PANEL: Rect = { x: 8, y: 58, w: 344, h: 262 };
export const PLOT_X = 18;
export const PLOT_W = 324;
export const NIGHT_W = PLOT_W / NIGHTS;
export const HRV_PLOT: Rect = { x: PLOT_X, y: 96, w: PLOT_W, h: 62 };
export const RHR_PLOT: Rect = { x: PLOT_X, y: 180, w: PLOT_W, h: 36 };
export const SLEEP_PLOT: Rect = { x: PLOT_X, y: 242, w: PLOT_W, h: 48 };
export const SLOT: Rect = { x: 8, y: 328, w: 344, h: 66 };

export const nightX = (i: number) => PLOT_X + (i + 0.5) * NIGHT_W;
export const DIP_X0 = PLOT_X + DIP_FIRST * NIGHT_W - 4;
export const DIP_X1 = PLOT_X + (DIP_LAST + 1) * NIGHT_W + 4;
export const DIP_CX = (DIP_X0 + DIP_X1) / 2;

const HRV_DOMAIN = [38, 68] as const;
const RHR_DOMAIN = [49, 59] as const;
const PAD = 4;
const scaleY = (v: number, [lo, hi]: readonly [number, number], r: Rect) =>
  r.y + PAD + ((hi - v) / (hi - lo)) * (r.h - PAD * 2);
export const hrvY = (v: number) => scaleY(v, HRV_DOMAIN, HRV_PLOT);
export const rhrY = (v: number) => scaleY(v, RHR_DOMAIN, RHR_PLOT);

export const CHIPS = [
  { key: "Ring", icon: "device-ring", color: "var(--color-mint)", full: { x: 14, y: 36, w: 104, h: 52 }, strip: { x: 8, y: 9, w: 72, h: 32 } },
  { key: "Watch", icon: "device-watch", color: "var(--color-sky)", full: { x: 128, y: 36, w: 104, h: 52 }, strip: { x: 84, y: 9, w: 72, h: 32 } },
  { key: "Phone", icon: "device-phone", color: "var(--color-sun)", full: { x: 242, y: 36, w: 104, h: 52 }, strip: { x: 160, y: 9, w: 72, h: 32 } },
] as const;

const LAST = NIGHTS - 1;
export const SYNC_LOG = [
  `02:14  ring   hrv ${HRV[LAST]} ms, rhr ${RHR[LAST]} bpm`,
  `02:14  watch  sleep ${fmtDur(SLEEP_MIN[LAST])}, eff ${EFF[LAST]}%`,
  "02:15  phone  spo2 97%, steps 8,412",
] as const;

/* Hub centre and diameter at each stop of its flight. */
export const HUB_STOPS = {
  start: { x: 180, y: 236, d: 84 },
  strip: { x: 322, y: 25, d: 34 },
  feed: { x: 270, y: 124, d: 88 },
} as const;

export const THUMB = { x: 10, y: 64, scale: 0.44 };
export const DOMAIN_RING = { x: 140, y: 328, r: 60, w: 11 };
export const LEGEND = { x: 222, y: 272, w: 124, row: 17 };

/* Progress timings. Chapter 4 finishes its landing by 0.945 so 0.945 to 1 is a stable hold. */
export const CH = [0, 0.2, 0.5, 0.78, 1] as const;
export const T = {
  linkStart: 0.015,
  linkStep: 0.035,
  retract: [0.16, 0.19],
  chipMove: [0.19, 0.26],
  hubFly: [0.18, 0.25],
  hubMode: [0.2, 0.235],
  slotTiles: [0.22, 0.27],
  panel: [0.21, 0.28],
  sweep: [0.24, 0.46],
  rewind: [0.49, 0.53],
  slotAlert: [0.48, 0.53],
  dim: [0.5, 0.54],
  baseline: [0.51, 0.55],
  scan: [0.53, 0.63],
  band: [0.57, 0.6],
  circle: [0.6, 0.65],
  leader: [0.64, 0.67],
  callout: [0.64, 0.76],
  slotExit: [0.78, 0.82],
  labelsOff: [0.785, 0.81],
  shrink: [0.805, 0.855],
  cursorEnd: [0.78, 0.83],
  hubFeed: [0.82, 0.87],
  flowIn: [0.85, 0.875],
  ringIn: [0.855, 0.885],
  domainRing: [0.865, 0.915],
  legend: [0.86, 0.9],
  link: [0.875, 0.905],
  land: [0.905, 0.945],
} as const;

export const CURSOR_SCAN = { from: 15.5 / NIGHTS, to: (FLAG_NIGHT - 0.5) / NIGHTS };

export const CAPTIONS = [
  { eyebrow: "01 / Connect", title: "Rings, watches and phones, one stream.", body: "Devices connect once, then push HRV, sleep and heart rate every night." },
  { eyebrow: "02 / Stream", title: "Thirty nights in one glance.", body: "Sleep stages, resting heart rate and HRV line up on a single timeline." },
  { eyebrow: "03 / Notice", title: "The dip nobody felt.", body: "HRV slides for three nights while sleep debt builds, and the app flags it first." },
  { eyebrow: "04 / Feed", title: "Into the score.", body: "Recovery and readiness feed the vitals domain of the longevity score." },
] as const;
