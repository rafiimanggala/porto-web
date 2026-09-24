"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { SceneIcon, type SceneIconName } from "./SceneIcon";
import { T, type CardKey, type Span } from "./MobileSceneData";
import { breakpointAt, frameEase, lerp, segAt } from "./MobileSceneMath";
import { PhoneTitle, TXT, Title, WIPE_BASE, floorPx, pt, u } from "./MobileSceneKit";

/* Icons that name the objects of the scene: the browser and the phone on the ruler, and a leading glyph in the header
   of each data card (labs, wearable, genome, insights). Score and Domains are pure summaries and carry none. */

const RULER_ICON = 26;
const RULER_TEXT_W = "16ch";
const LABEL_GAP = 4;
const POP_STEP = 0.004;
const POP_SPAN = 0.025;
const POP_FROM = 0.85;
const POP_RISE = 2;

const pop = (t: number, rise: number) => `translateY(${u(rise * (1 - t))}) scale(${lerp(POP_FROM, 1, t).toFixed(3)})`;

/* Drawn pixels of each 256 px source (left, top, right, bottom). The PNGs carry about 10 % clear margin, so the glyph is
   sized and placed by these bounds and its layout box is exactly what is visible. */
const SRC = 256;
type Bounds = readonly [number, number, number, number];
const BOUNDS = {
  "lab-blood": [56, 25, 200, 230],
  "device-watch": [58, 25, 198, 230],
  insight: [56, 25, 199, 230],
  dna: [32, 25, 224, 230],
} as const satisfies Partial<Record<SceneIconName, Bounds>>;
type GlyphName = keyof typeof BOUNDS;

export const CARD_ICONS: Partial<Record<CardKey, GlyphName>> = {
  blood: "lab-blood",
  wearable: "device-watch",
  insights: "insight",
  bio: "dna",
};

/* Wide state: on a phone the whole dashboard is drawn about a third of desktop size, so a px floor keeps the glyph readable.
   Phone state: a glyph a little taller than the 15 pt card title, like an SF Symbol next to its label. */
const G_WIDE = `max(${u(12)}, 22px)`;
const G_PHONE = `max(${u(9)}, ${floorPx(11.5)})`;
const HEAD_GAP = `max(${u(6)}, 8px)`;
/* The wide header is lifted a little: its title sits just under the rank tag, so it keeps a few px of air from it. */
const HEAD_LIFT = 1;

function Glyph({ name, size }: { name: GlyphName; size: string }) {
  const [x0, y0, x1, y1] = BOUNDS[name];
  const k = (n: number) => `calc(var(--g) * ${(n / (y1 - y0)).toFixed(4)})`;
  return (
    <span aria-hidden className="relative block shrink-0" style={{ ["--g" as string]: size, width: k(x1 - x0), height: "var(--g)" }}>
      <span className="absolute" style={{ left: k(-x0), top: k(-y0), width: k(SRC), height: k(SRC) }}>
        <SceneIcon name={name} size={64} className="h-full w-full" />
      </span>
    </span>
  );
}

function PopGlyph({ p, a, name, size }: { p: MV; a: number; name: GlyphName; size: string }) {
  const start = (a / T.buildStep) * POP_STEP;
  const t = useSeg(p, start, start + POP_SPAN, easeOutCubic);
  const opacity = useTransform(t, (v) => lerp(WIPE_BASE, 1, v));
  const transform = useTransform(t, (v) => pop(v, POP_RISE));
  return (
    <motion.span style={{ opacity, transform }} className="block shrink-0">
      <Glyph name={name} size={size} />
    </motion.span>
  );
}

/* Card title with its glyph on the left, sitting on one baseline. The glyph is part of the header row, so it can never
   reach the border, the rank tag or the first data row, and it swaps with the body it belongs to. */
export function CardHead({ p, a, card, wide, children }: { p: MV; a: number; card: CardKey; wide: boolean; children: ReactNode }) {
  const name = CARD_ICONS[card];
  if (!name) return <Title>{children}</Title>;
  if (!wide) {
    return (
      <div className="flex items-center" style={{ gap: pt(7) }}>
        <PopGlyph p={p} a={a} name={name} size={G_PHONE} />
        <PhoneTitle>{children}</PhoneTitle>
      </div>
    );
  }
  return (
    <div className="flex items-end" style={{ gap: HEAD_GAP, marginTop: u(-HEAD_LIFT) }}>
      <PopGlyph p={p} a={a} name={name} size={G_WIDE} />
      <Title>{children}</Title>
    </div>
  );
}

function StateIcon({ p, name, span, entering }: { p: MV; name: SceneIconName; span: Span; entering: boolean }) {
  const t = useTransform(p, (v) => {
    const s = segAt(frameEase(v), span);
    return entering ? s : 1 - s;
  });
  const transform = useTransform(t, (v) => pop(v, entering ? POP_RISE : -POP_RISE));
  return (
    <motion.span style={{ opacity: t, transform }} className="absolute inset-0">
      <SceneIcon name={name} size={64} className="h-full w-full" />
    </motion.span>
  );
}

function FrameIcon({ p, draw }: { p: MV; draw: MV }) {
  return (
    <motion.span style={{ opacity: draw, width: u(RULER_ICON), height: u(RULER_ICON) }} className="relative block shrink-0">
      <StateIcon p={p} name="browser" span={[0.28, 0.5]} entering={false} />
      <StateIcon p={p} name="device-phone" span={[0.5, 0.72]} entering />
    </motion.span>
  );
}

/* Icon and readout share the ruler's draw: nothing is visible before it starts. The readout box has a fixed width and
   unfolds by clipping, so the icon holds still while the text is revealed. */
export function RulerLabel({ p, draw }: { p: MV; draw: MV }) {
  const text = useTransform(p, (v) => {
    const { px, cols } = breakpointAt(v);
    return `${px} px · ${cols} col`;
  });
  const reveal = useTransform(draw, (d) => `inset(0 ${((1 - d) * 100).toFixed(1)}% 0 0)`);
  return (
    <div
      className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center"
      style={{ padding: `0 ${u(5)}`, gap: u(LABEL_GAP) }}
    >
      <motion.i style={{ opacity: draw }} className="absolute inset-0 bg-bg" />
      <FrameIcon p={p} draw={draw} />
      <motion.span
        style={{ ...TXT.xs, width: RULER_TEXT_W, clipPath: reveal, opacity: draw }}
        className={`${MONO} relative whitespace-nowrap tabular-nums text-fg`}
      >
        {text}
      </motion.span>
    </div>
  );
}
