"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { easeInCubic, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { iconSrc, type SceneIconName } from "./SceneIcon";
import { BODY_BOX, PAGE_W, STREAM, TL } from "./DexaSceneData";
import { TXT, useIconSize, type Span } from "./DexaSceneKit";

const START_SCALE = 0.85;
const RISE = 5;
/* A span the progress never reaches: the badge has no exit. */
const NEVER: Span = [2, 3];
/* The glyph inside the 256px PNG spans about 73% x 80% of the canvas, centred. */
const GLYPH_RIGHT = 0.86;
const LABEL_GAP = 6;

type BadgeProps = {
  p: MV;
  name: SceneIconName;
  x: number;
  y: number;
  size: number;
  /** Scale pop, easeOutBack. */
  enter: Span;
  /** Optional exit, a shrink (and a fade when `ramp` is on). */
  leave?: Span;
  /** Scale at the start of the pop: 0 for a scale-only pop, START_SCALE with `ramp`. */
  from: number;
  /** Fade in over the first half of `enter` and out over `leave`. Off = always opaque. */
  ramp: boolean;
  children?: ReactNode;
};

function useBadgeMotion({ p, enter, leave, from, ramp }: Pick<BadgeProps, "p" | "enter" | "leave" | "from" | "ramp">) {
  const pop = useSeg(p, enter[0], enter[1], easeOutBack);
  const fadeIn = useSeg(p, enter[0], (enter[0] + enter[1]) / 2);
  const out = useSeg(p, ...(leave ?? NEVER));
  const vis = useTransform([pop, out], ([a, o]: number[]) => a * (1 - easeInCubic(o)));
  const scale = useTransform(vis, (v) => from + (1 - from) * v);
  const rise = useTransform(vis, (v) => (1 - v) * RISE);
  const opacity = useTransform([fadeIn, out], ([a, o]: number[]) => (ramp ? a * (1 - o) : 1));
  return { scale, rise, opacity };
}

function IconBadge({ name, x, y, size, children, ...timing }: BadgeProps) {
  const { scale, rise, opacity } = useBadgeMotion(timing);
  return (
    <motion.g style={{ opacity }}>
      <motion.g style={{ scale, y: rise }}>
        <image href={iconSrc(name)} x={x} y={y} width={size} height={size} />
      </motion.g>
      {children}
    </motion.g>
  );
}

/* Vendor pages. The focus page (vendor 7, the one the crop locks onto) carries its badge
   from the start. The two side pages pop theirs in once they have fanned clear of it, with
   no half-opaque state, and drop them before the flatten so chapter 2 shows one page badge. */
const PAGE_BADGE = { size: 34, overlap: 8 } as const;
const SIDE_ENTER: Span = [0.04, 0.08];
const SIDE_LEAVE: Span = [TL.squareUp[0] - 0.03, TL.squareUp[0] + 0.005];

export function PageBadge({ p, focus }: { p: MV; focus: boolean }) {
  const size = useIconSize(PAGE_BADGE.size);
  const timing = focus
    ? { enter: TL.fanOut, from: START_SCALE }
    : { enter: SIDE_ENTER, leave: SIDE_LEAVE, from: 0 };
  return <IconBadge p={p} name="pdf-report" x={(PAGE_W - size) / 2} y={PAGE_BADGE.overlap - size} size={size} ramp={false} {...timing} />;
}

/* The narrow size is kept below 1.25x: the badge sits over the ends of the longest operator
   lines, and a bigger glyph would crowd them. */
const STREAM_BADGE = { size: 36, narrow: 41, inset: 1 } as const;

export function StreamBadge({ p }: { p: MV }) {
  const size = useIconSize(STREAM_BADGE.size, STREAM_BADGE.narrow);
  const enter: Span = [TL.streamIn[0] + 0.01, TL.streamIn[1]];
  const x = STREAM.x + STREAM.w - size - STREAM_BADGE.inset;
  return <IconBadge p={p} name="pdf-report" x={x} y={STREAM.y + STREAM_BADGE.inset} size={size} enter={enter} from={START_SCALE} ramp />;
}

/* Header of the chart card: named, and only for the Extract chapter. It leaves as the
   percentile rows of chapter 4 arrive. */
const CARD_BADGE = { size: 42, gap: 4, label: "DEXA scan" } as const;

export function CardBadge({ p }: { p: MV }) {
  const size = useIconSize(CARD_BADGE.size);
  const x = BODY_BOX[0] - 4;
  const y = BODY_BOX[1] - size - CARD_BADGE.gap;
  const enter: Span = [TL.lift[1] - 0.01, TL.lift[1] + 0.03];
  const leave: Span = [TL.header[0] - 0.02, TL.header[0]];
  return (
    <IconBadge p={p} name="body-scan" x={x} y={y} size={size} enter={enter} leave={leave} from={START_SCALE} ramp>
      <text x={x + size * GLYPH_RIGHT + LABEL_GAP} y={y + size * 0.56} className={`${TXT} fill-mute`}>
        {CARD_BADGE.label}
      </text>
    </IconBadge>
  );
}
