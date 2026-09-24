"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CARD_ICON, IconPop, pillIcon } from "./GeneticsSceneIcons";
import { SceneIcon } from "./SceneIcon";
import {
  ARC_X0,
  ARC_X1,
  ARC_XM,
  BUTTON,
  CARD_OPEN,
  CARD_TOP,
  CHIPS,
  CHIP_W,
  CHIP_X,
  EVIDENCE,
  INSIGHT,
  PAIR_REL,
  PAIR_Y,
  PULSE,
  ROW_H,
  ROW_W,
  ROW_X,
  STUB,
  TAP,
  TYPE,
  arcPath,
  headX,
  headY,
  lerp,
  num,
  pct,
  rowMid,
  rowTop,
  type Pair,
} from "./GeneticsSceneData";


const bumpCurve = (t: number) => (t > 0 && t < 1 ? Math.sin(t * Math.PI) : 0);

const END_DOT = "absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full";

type Swap = { at: number; text: string };

function useArcMotion(p: MV, pair: Pair, fl: MV, swap?: Swap) {
  const yA0 = rowMid(pair.lane);
  const yB0 = CHIPS[pair.chip].y;
  const s = useSeg(p, pair.a, pair.b, easeInOutCubic);
  const ends = (f: number) => [lerp(yA0, PAIR_Y, f), lerp(yB0, PAIR_Y, f)] as const;
  const flagText = `${pair.flags} flag${pair.flags === 1 ? "" : "s"}`;
  const pillIn = useSeg(p, pair.b - 0.005, pair.b + 0.025, easeOutBack);
  const pillOp = useSeg(p, pair.b - 0.005, pair.b + 0.008);
  return {
    d: useTransform(fl, (f) => arcPath(...ends(f))),
    clip: useTransform(s, (v) => `inset(0 ${num(100 - headX(v))}% 0 0)`),
    drawn: useTransform(s, (v) => (v > 0 ? 1 : 0)),
    headL: useTransform(s, (v) => pct(headX(v))),
    headT: useTransform([s, fl], ([v, f]: number[]) => pct(headY(...ends(f), v))),
    headOp: useTransform(s, [0, 0.03, 0.96, 1], [0, 1, 1, 0]),
    topA: useTransform(fl, (f) => pct(ends(f)[0])),
    topB: useTransform(fl, (f) => pct(ends(f)[1])),
    topMid: useTransform(fl, (f) => pct((ends(f)[0] + ends(f)[1]) / 2)),
    startOp: useTransform(s, [0, 0.05], [0, 1]),
    endOp: useTransform(s, [0.94, 1], [0, 1]),
    pillOp,
    pillOn: useTransform(pillOp, (v) => (v > 0 ? 1 : 0)),
    label: useTransform(p, (v) => (swap && v >= swap.at ? swap.text : flagText)),
    bump: useTransform([pillIn, p], ([a, v]: number[]) => {
      const swapBump = swap ? 1 + 0.14 * bumpCurve((v - swap.at) / 0.03) : 1;
      return num((0.75 + 0.25 * a) * swapBump, 3);
    }),
  };
}

/* Arc between a DNA row and a blood chip, drawn by a clip; flatten straightens it onto the pair line. */
export function Arc({ p, pair, flatten, swap }: { p: MV; pair: Pair; flatten?: MV; swap?: Swap }) {
  const zero = useMotionValue(0);
  const m = useArcMotion(p, pair, flatten ?? zero, swap);
  return (
    <>
      <motion.svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ clipPath: m.clip, opacity: m.drawn }}
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <motion.path
          d={m.d}
          fill="none"
          stroke={pair.color}
          strokeWidth={pair.strong ? 2.5 : 1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
      <motion.i style={{ left: pct(ARC_X0), top: m.topA, opacity: m.startOp, background: pair.color }} className={END_DOT} />
      <motion.i style={{ left: pct(ARC_X1), top: m.topB, opacity: m.endOp, background: pair.color }} className={END_DOT} />
      <motion.i
        style={{ left: m.headL, top: m.headT, opacity: m.headOp, background: pair.color }}
        className="absolute h-[7px] w-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full"
      />
      <motion.span
        style={{ left: pct(ARC_XM), top: m.topMid, opacity: m.pillOn, scale: m.bump }}
        className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border bg-bg px-1 py-px ${MONO} text-[10px] @min-[500px]:px-2 @min-[500px]:text-[11px] ${
          pair.strong ? "border-accent text-fg" : "border-line-strong text-dim"
        }`}
      >
        <motion.span style={{ opacity: m.pillOp }}>{m.label}</motion.span>
      </motion.span>
    </>
  );
}

/* Outline flash on both ends of a pairing when its arc lands. */
export function LandFlash({ p, pair }: { p: MV; pair: Pair }) {
  const t = useSeg(p, pair.b - 0.012, pair.b + 0.04);
  const opacity = useTransform(t, (v) => num(bumpCurve(v) * 0.9, 3));
  const rect = (top: number, left: number, width: number) => ({
    top: pct(top),
    left: pct(left),
    width: pct(width),
    height: pct(ROW_H),
    opacity,
    borderColor: pair.color,
  });
  return (
    <>
      <motion.i aria-hidden style={rect(rowTop(pair.lane), ROW_X, ROW_W)} className="absolute rounded-md border-2" />
      <motion.i
        aria-hidden
        style={rect(CHIPS[pair.chip].y - ROW_H / 2, CHIP_X, CHIP_W)}
        className="absolute rounded-md border-2"
      />
    </>
  );
}

/* Lactase has no blood marker on its mechanism, so its line stops short. */
export function Stub({ p }: { p: MV }) {
  const y = rowMid(STUB.lane);
  const t = useSeg(p, STUB.a, STUB.b, easeOutCubic);
  const clip = useTransform(t, (v) => `inset(0 ${num(100 - lerp(ARC_X0, STUB.end + 1, v))}% 0 0)`);
  const labelOp = useSeg(p, STUB.a + 0.005, STUB.a + 0.03);
  const drawn = useTransform(t, (v) => (v > 0 ? 1 : 0));
  return (
    <>
      <motion.svg
        aria-hidden
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ clipPath: clip, opacity: drawn }}
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <path
          d={`M ${ARC_X0} ${y} L ${STUB.end} ${y}`}
          fill="none"
          stroke="var(--color-mute)"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={`M ${STUB.end} ${y - 2} L ${STUB.end} ${y + 2}`}
          fill="none"
          stroke="var(--color-mute)"
          strokeWidth={1.5}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </motion.svg>
      <motion.span
        aria-hidden
        style={{ opacity: labelOp, left: pct(ARC_X0 + 2), top: pct(y + 4) }}
        className={`absolute -translate-y-1/2 whitespace-nowrap ${MONO} text-[10px] text-mute @min-[500px]:text-[11px]`}
      >
        no link
      </motion.span>
    </>
  );
}

/* Typed sentence; the untyped tail stays in layout, transparent, so wrapping never shifts. */
function Typed({ p, text }: { p: MV; text: string }) {
  const n = useSeg(p, TYPE[0], TYPE[1]);
  const shown = useTransform(n, (v) => text.slice(0, Math.round(v * text.length)));
  const tail = useTransform(n, (v) => text.slice(Math.round(v * text.length)));
  const caret = useTransform(n, [0, 0.02, 0.97, 1], [0, 1, 1, 0]);
  return (
    <p className="text-[13px] leading-[1.45] text-fg @min-[500px]:text-[17px]">
      <motion.span>{shown}</motion.span>
      <motion.i style={{ opacity: caret }} className="relative inline-block w-0 align-baseline">
        <b className="absolute -top-[1em] left-0 h-[1.1em] w-[2px] bg-accent" />
      </motion.i>
      <motion.span className="text-transparent">{tail}</motion.span>
    </p>
  );
}

/* The markers behind the finding, in layout from the start so the card never reflows. */
function Evidence({ p }: { p: MV }) {
  const from = TYPE[1] - 0.035;
  const opacity = useSeg(p, from, TYPE[1] - 0.01);
  return (
    <motion.ul style={{ opacity }} className="flex flex-wrap gap-2">
      {EVIDENCE.map((e) => (
        <li
          key={e.key}
          className="inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-surface-2 py-0.5 pl-1 pr-2 text-[10.5px] @min-[500px]:py-1 @min-[500px]:pr-2.5 @min-[500px]:text-[13px]"
        >
          <IconPop p={p} name={e.icon} from={from} len={0.025} className={pillIcon(e.icon)} fade={false} />
          <span className="font-medium text-fg">{e.key}</span>
          <span className="text-dim">{e.value}</span>
        </li>
      ))}
    </motion.ul>
  );
}

function AskButton({ p }: { p: MV }) {
  const pop = useSeg(p, BUTTON[0], BUTTON[1], easeOutBack);
  const pressed = useTransform(p, [TAP[0], TAP[0] + 0.008, TAP[0] + 0.016], [1, 0.95, 1]);
  const scale = useTransform([pop, pressed], ([a, b]: number[]) => a * b);
  const opacity = useSeg(p, BUTTON[0], BUTTON[0] + 0.015);
  const ripple = useSeg(p, TAP[0], TAP[1], easeOutCubic);
  const ringScale = useTransform(ripple, (v) => 1 + 0.22 * v);
  const ringOp = useTransform(ripple, (v) => (v > 0 ? 0.85 * (1 - v) : 0));
  const sendX = useTransform(ripple, (v) => 4 * bumpCurve(v));
  const sendY = useTransform(ripple, (v) => -3 * bumpCurve(v));
  return (
    <motion.div style={{ scale, opacity }} className="relative inline-flex origin-left">
      <span className="inline-flex h-9 items-center gap-1.5 rounded-full bg-accent pl-4 pr-3 text-[12px] font-semibold text-fg @min-[500px]:h-11 @min-[500px]:pl-5 @min-[500px]:pr-4 @min-[500px]:text-[14.5px]">
        Ask AI about this pairing
        <motion.span style={{ x: sendX, y: sendY }} className="inline-flex">
          <SceneIcon name="send" size={28} className="size-[22px] @min-[500px]:size-7" />
        </motion.span>
      </span>
      <motion.i
        style={{ scale: ringScale, opacity: ringOp }}
        className="pointer-events-none absolute inset-0 rounded-full border-2 border-fg"
      />
    </motion.div>
  );
}

/* The card opens from the pair line outward with an inset clip. */
export function InsightCard({ p }: { p: MV }) {
  const open = useSeg(p, CARD_OPEN[0], CARD_OPEN[1], easeInOutCubic);
  const clip = useTransform(open, (t) => {
    const k = 1 - t;
    return `inset(${num(PAIR_REL * k, 3)}cqh 0 calc((100% - ${PAIR_REL}cqh) * ${num(k, 4)}) 0 round 14px)`;
  });
  const labelOp = useSeg(p, CARD_OPEN[1] - 0.02, CARD_OPEN[1] + 0.005);
  const bodyOp = useSeg(p, TYPE[0] - 0.01, TYPE[0] + 0.01);
  return (
    <motion.div
      aria-hidden
      style={{ clipPath: clip, top: pct(CARD_TOP) }}
      className="absolute inset-x-[2%] rounded-[14px] border border-line-strong bg-surface-1 px-[3%] pb-[3.4cqh] pt-[19cqh]"
    >
      <div className="absolute left-[3.125%] top-[3.4cqh] flex -translate-y-1/2 items-center gap-1.5">
        <IconPop p={p} name="insight" from={CARD_OPEN[1] - 0.02} len={0.025} className={CARD_ICON} />
        <motion.span
          style={{ opacity: labelOp }}
          className={`${MONO} text-[10px] uppercase tracking-[0.14em] text-mute @min-[500px]:text-[11px]`}
        >
          Cross-domain insight
        </motion.span>
      </div>
      <motion.div style={{ opacity: bodyOp }} className="flex flex-col items-start gap-3 @min-[500px]:gap-4">
        <Typed p={p} text={INSIGHT} />
        <Evidence p={p} />
        <AskButton p={p} />
      </motion.div>
    </motion.div>
  );
}


export function FusePulse({ p }: { p: MV }) {
  const t = useSeg(p, PULSE[0], PULSE[1], easeOutCubic);
  const scale = useTransform(t, (v) => 0.4 + 2 * v);
  const opacity = useTransform(t, [0, 0.05, 0.6, 1], [0, 0.8, 0, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ scale, opacity, left: pct(ARC_XM), top: pct(PAIR_Y) }}
      className="pointer-events-none absolute -ml-5 -mt-5 h-10 w-10 rounded-full border-2 border-accent"
    />
  );
}
