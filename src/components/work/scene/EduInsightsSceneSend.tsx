"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInCubic, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { SceneIcon, type SceneIconName } from "./SceneIcon";
import { NEXT_SEND, T } from "./EduInsightsSceneData";
import { CardBody, CardSkeleton } from "./EduInsightsSceneCard";
import { FocusTile } from "./EduInsightsSceneFocus";
import { TickBadge } from "./EduInsightsSceneIcons";
import { SwapEdge, clamp01, keyframes, lerp, pct, useKeys, useSwap } from "./EduInsightsSceneKit";

/* Bottom stage: a two-face roll (summary card, then the Class D focus card and
   back). In the send chapter the pane grows up over the dimmed results, the card
   wipes into bare lines, shrinks into an envelope, the flap closes, a stamp and a
   schedule tick land and the paper plane leaves. */

/* The envelope box is a 3:2 shape sized in percent of the pane through two CSS
   variables (width --ew, height --eh), so it holds at every stage size: the grown
   pane is PANE_K times its own width tall and eh = ew / (1.5 * PANE_K). */
const PANE_K = 0.54;
const ENV_VARS = "[--ew:40] [--eh:49.4] @lg:[--ew:50] @lg:[--eh:61.7]";
const ENV_LEFT = 3;
const cv = (a: number, e: number, v: "ew" | "eh") => `calc(${a.toFixed(3)}% + ${e.toFixed(4)} * var(--${v}) * 1%)`;
const envBox = {
  left: `${ENV_LEFT}%`,
  top: "calc(50% - var(--eh) * 0.5%)",
  width: "calc(var(--ew) * 1%)",
  height: "calc(var(--eh) * 1%)",
};

/* The letter: the whole pane, then hovering over the envelope, then inside it.
   Each coordinate is [percent of the pane, multiple of the envelope size]. */
type Pt = readonly [number, number];
type Track = { v: "ew" | "eh"; at: readonly [Pt, Pt, Pt] };
const LETTER: Record<"left" | "top" | "w" | "h", Track> = {
  left: { v: "ew", at: [[0, 0], [ENV_LEFT, 0.1], [ENV_LEFT, 0.1]] },
  top: { v: "eh", at: [[0, 0], [50, -0.657], [50, -0.2]] },
  w: { v: "ew", at: [[100, 0], [0, 0.8], [0, 0.8]] },
  h: { v: "eh", at: [[100, 0], [0, 0.6], [0, 0.6]] },
};
const PACK_KEYS = [0, 0.5, 1];
const ROLL_KEYS = [T.roll[0], T.roll[1], T.back[0], T.back[1]];
const ROLL_VALS = [0, 1, 1, 0];
const ENV_ASPECT = "0 0 100 66";
const SKY_TINT = (n: number) => `color-mix(in oklab, var(--color-sky) ${n}%, var(--color-surface-2))`;

function usePackRect(pack: MV, key: keyof typeof LETTER) {
  const { v, at } = LETTER[key];
  return useTransform(pack, (t) =>
    cv(
      keyframes(t, PACK_KEYS, at.map((q) => q[0])),
      keyframes(t, PACK_KEYS, at.map((q) => q[1])),
      v,
    ),
  );
}

function Placeholder({ wake }: { wake: MV }) {
  const opacity = useTransform(wake, (v) => 1 - v);
  return (
    <motion.div style={{ opacity }} className="absolute inset-0 grid place-items-center">
      <span className="flex items-center gap-1.5 text-mute">
        <SceneIcon name="insight" size={32} className="h-[2.4em] w-[2.4em] opacity-60" />
        <span className={MONO}>drafts itself from the results</span>
      </span>
    </motion.div>
  );
}

/* The summary card: dashed slot while results arrive, then the writing card,
   then the letter that goes into the envelope. */
function Letter({ p }: { p: MV }) {
  const pack = useSeg(p, T.pack[0], T.pack[1]);
  const wake = useSeg(p, T.wait[0], T.wait[1]);
  const dashed = useTransform(wake, (v) => 1 - v);
  const sw = useSwap(useSeg(p, T.wipe[0], T.wipe[1]));
  const left = usePackRect(pack, "left");
  const top = usePackRect(pack, "top");
  const width = usePackRect(pack, "w");
  const height = usePackRect(pack, "h");
  return (
    <motion.div style={{ left, top, width, height, zIndex: 10 }} className="absolute overflow-hidden rounded-xl">
      <motion.i aria-hidden style={{ opacity: dashed }} className="absolute inset-0 rounded-xl border border-dashed border-line-strong" />
      <motion.i aria-hidden style={{ opacity: wake }} className="absolute inset-0 rounded-xl border border-line-strong bg-surface-1" />
      <Placeholder wake={wake} />
      <motion.div style={{ clipPath: sw.outClip }} className="absolute inset-0">
        <CardBody p={p} />
      </motion.div>
      <motion.div style={{ clipPath: sw.inClip }} className="absolute inset-0">
        <CardSkeleton />
      </motion.div>
      <SwapEdge edge={sw.edge} op={sw.edgeOp} />
    </motion.div>
  );
}

function EnvShape({ p, front }: { p: MV; front: boolean }) {
  const at = T.pack[0] + 0.3 * (T.pack[1] - T.pack[0]);
  const opacity = useSeg(p, at, at + 0.25 * (T.pack[1] - T.pack[0]));
  const stroke = { stroke: "var(--color-fg)", strokeWidth: 1.8, vectorEffect: "non-scaling-stroke", strokeLinejoin: "round" } as const;
  return (
    <motion.svg
      aria-hidden
      viewBox={ENV_ASPECT}
      preserveAspectRatio="none"
      style={{ ...envBox, opacity, zIndex: front ? 20 : 5 }}
      className="pointer-events-none absolute overflow-visible"
    >
      {front ? (
        <path d="M1 1 50 42 99 1V60a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5Z" fill={SKY_TINT(20)} {...stroke} />
      ) : (
        <rect x="1" y="1" width="98" height="64" rx="5" fill="var(--color-surface-2)" {...stroke} />
      )}
    </motion.svg>
  );
}

function Flap({ p }: { p: MV }) {
  const t = useSeg(p, T.flap[0], T.flap[1], easeOutCubic);
  const clip = useTransform(t, (v) => `inset(0 0 ${pct(100 - v * 100)} 0)`);
  return (
    <motion.svg
      aria-hidden
      viewBox={ENV_ASPECT}
      preserveAspectRatio="none"
      style={{ ...envBox, clipPath: clip, zIndex: 30 }}
      className="pointer-events-none absolute overflow-visible"
    >
      <path d="M1 1H99L50 42Z" fill={SKY_TINT(38)} stroke="var(--color-fg)" strokeWidth={1.8} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </motion.svg>
  );
}

function EnvTick({ p }: { p: MV }) {
  const t = useSeg(p, T.tick2[0], T.tick2[1]);
  return (
    <span
      className="absolute z-40 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
      style={{ left: cv(ENV_LEFT, 1, "ew"), top: envBox.top }}
    >
      <TickBadge t={t} className="h-[2.4em] w-[2.4em]" />
    </span>
  );
}

function Plane({ p }: { p: MV }) {
  const f = useSeg(p, T.plane[0], T.plane[1]);
  const left = useTransform(f, (v) => cv(ENV_LEFT + 22 * easeOutCubic(v), 0.5, "ew"));
  const top = useTransform(f, (v) => pct(lerp(50, -14, easeInCubic(v))));
  const opacity = useTransform(f, [0, 0.1, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(f, (v) => 0.85 + 0.4 * clamp01(v));
  return (
    <motion.span style={{ left, top, opacity, scale }} className="absolute z-50 -translate-x-1/2 -translate-y-1/2">
      <SceneIcon name="send" size={64} className="h-[3.6em] w-[3.6em]" />
    </motion.span>
  );
}

/* A send-date stamp on the front of the envelope, pressed on as the flap closes. */
function Stamp({ p }: { p: MV }) {
  const t = useSeg(p, T.flap[0] + 0.006, T.flap[1] + 0.008, easeOutBack);
  const opacity = useTransform(t, (v) => clamp01(v * 1.6));
  const scale = useTransform(t, (v) => 1.35 - 0.35 * v);
  return (
    <div aria-hidden style={envBox} className="pointer-events-none absolute z-[25]">
      <motion.span
        style={{ opacity, scale, rotate: -6, background: "color-mix(in oklab, var(--color-sun) 34%, transparent)" }}
        className="absolute bottom-[14%] right-[7%] flex aspect-[5/6] w-[20%] flex-col items-center justify-center rounded-[3px] border border-dashed border-fg/70 leading-none text-fg"
      >
        <span className={MONO}>Sep</span>
        <b className="mt-[0.15em] text-[1.5em] font-semibold">21</b>
      </motion.span>
    </div>
  );
}

function CheckRow({ icon, title, sub, t }: { icon: SceneIconName; title: string; sub: string; t: MV }) {
  return (
    <div className="flex items-center gap-[0.6em]">
      <SceneIcon name={icon} size={32} className="-my-1 h-[2em] w-[2em] @lg:h-[2.4em] @lg:w-[2.4em]" />
      <div className="min-w-0 flex-1 leading-tight">
        <p className="truncate text-fg">{title}</p>
        <p className={`${MONO} truncate text-dim`}>{sub}</p>
      </div>
      <TickBadge t={t} />
    </div>
  );
}

function SchedulePanel({ p }: { p: MV }) {
  const show = useSeg(p, T.panel[0], T.panel[1], easeOutCubic);
  const x = useTransform(show, (v) => pct((1 - v) * 12));
  const tick1 = useSeg(p, T.tick1[0], T.tick1[1]);
  const tick2 = useSeg(p, T.tick2[0], T.tick2[1]);
  return (
    <motion.div
      style={{ opacity: show, x, top: envBox.top, height: envBox.height, width: "calc((92 - var(--ew)) * 1%)" }}
      className="absolute right-[3%] flex flex-col justify-between rounded-lg border border-line-strong bg-surface-2 p-[clamp(6px,1.6cqw,12px)]"
    >
      <CheckRow icon="browser" title="In-app preview" sub="checked first" t={tick1} />
      <CheckRow icon="send" title="Email, on schedule" sub="every 14 days" t={tick2} />
      <p className={`${MONO} text-dim`}>
        next send: <span className="text-fg">{NEXT_SEND}</span>
      </p>
    </motion.div>
  );
}

function SendPane({ p }: { p: MV }) {
  return (
    <div className="absolute inset-0 isolate">
      <SchedulePanel p={p} />
      <EnvShape p={p} front={false} />
      <Letter p={p} />
      <EnvShape p={p} front />
      <Flap p={p} />
      <Stamp p={p} />
      <EnvTick p={p} />
      <Plane p={p} />
    </div>
  );
}

export function RollStack({ p }: { p: MV }) {
  const k = useKeys(p, ROLL_KEYS, ROLL_VALS, easeInOutCubic);
  const y = useTransform(k, (v) => pct(-v * 100));
  const grow = useSeg(p, T.expand[0], T.expand[1], easeInOutCubic);
  const height = useTransform(grow, (g) => `calc(100% + ${g.toFixed(4)} * (${PANE_K} * (100cqw - 2 * var(--pad)) - 100%))`);
  const backing = useSeg(p, T.expand[0], T.expand[0] + 0.012);
  return (
    <motion.div style={{ height }} className={`absolute inset-x-0 bottom-0 z-10 overflow-hidden rounded-xl ${ENV_VARS}`}>
      <motion.i aria-hidden style={{ opacity: backing }} className="absolute inset-0 rounded-xl border border-line-strong bg-surface-1" />
      <motion.div style={{ y }} className="absolute inset-0">
        <SendPane p={p} />
        <div className="absolute inset-x-0 top-full h-full">
          <FocusTile p={p} />
        </div>
      </motion.div>
    </motion.div>
  );
}
