"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { FRAME_PHONE, FRAME_WIDE, SCREEN_PHONE, SCREEN_WIDE, STAGE_W } from "./MobileSceneData";
import { clamp01, frameAt, frameEase, lerp, segAt } from "./MobileSceneMath";
import { FS, u, useBox } from "./MobileSceneKit";
import { SceneIcon, type SceneIconName } from "./SceneIcon";
import { BAR_H, CART, FLOW_TOP, HEAD, CARD, RULER_GAP, T, VIEWS, type Span } from "./MtmPhoneSceneData";
import { WIDE, rulerAt, viewAt } from "./MtmPhoneSceneMath";
import { clipRight } from "./MtmPhoneSceneKit";

/* Annotation layer around the device: the width ruler, the two layout guides of the desk state, the callouts hung on the
   phone, the swipe thumb and the index of the three views. */

const TXT = { fontSize: u(FS), lineHeight: 1.15 } as const;
const WIDE_ONLY = "hidden @[32.5rem]:flex";

const RULER_ICON = 26;
const RULER_TEXT_W = "16ch";
const POP = 2;
const pop = (t: number) => `translateY(${u(POP * (1 - t))}) scale(${lerp(0.85, 1, t).toFixed(3)})`;

function StateIcon({ p, name, span, entering }: { p: MV; name: SceneIconName; span: Span; entering: boolean }) {
  const t = useTransform(p, (v) => {
    const s = segAt(frameEase(v), span);
    return entering ? s : 1 - s;
  });
  const transform = useTransform(t, pop);
  return (
    <motion.span style={{ opacity: t, transform }} className="absolute inset-0">
      <SceneIcon name={name} size={64} className="h-full w-full" />
    </motion.span>
  );
}

function RulerLabel({ p, draw }: { p: MV; draw: MV }) {
  const text = useTransform(p, (v) => {
    const { px, cols } = rulerAt(v);
    return `${px}px, ${cols} col`;
  });
  const ink = useTransform(draw, (d) => segAt(d, [0.45, 1]));
  return (
    <div className="absolute left-1/2 top-0 flex -translate-x-1/2 -translate-y-1/2 items-center" style={{ padding: `0 ${u(5)}`, gap: u(4) }}>
      <motion.i style={{ opacity: draw }} className="absolute inset-0 bg-bg" />
      <motion.span style={{ opacity: ink, width: u(RULER_ICON), height: u(RULER_ICON) }} className="relative block shrink-0">
        <StateIcon p={p} name="browser" span={[0.28, 0.5]} entering={false} />
        <StateIcon p={p} name="device-phone" span={[0.5, 0.72]} entering />
      </motion.span>
      <motion.span style={{ ...TXT, width: RULER_TEXT_W, opacity: ink }} className={`${MONO} relative whitespace-nowrap tabular-nums text-fg`}>
        {text}
      </motion.span>
    </div>
  );
}

export function Ruler({ p }: { p: MV }) {
  const box = useBox(p, (v) => {
    const { frame } = frameAt(v);
    return { x: frame.x, y: frame.y - RULER_GAP, w: frame.w, h: 0 };
  });
  const draw = useSeg(p, T.ruler[0], T.ruler[1], easeOutCubic);
  const stub = useTransform(draw, (d) => segAt(d, [0.8, 1]));
  return (
    <motion.div aria-hidden style={box} className="absolute z-20">
      <motion.div style={{ opacity: draw }} className="absolute inset-0">
        <motion.i style={{ scaleX: draw }} className="absolute inset-x-0 top-0 h-px bg-dim" />
        <motion.i style={{ opacity: stub, height: u(7) }} className="absolute left-0 top-0 w-px -translate-y-1/2 bg-dim" />
        <motion.i style={{ opacity: stub, height: u(7) }} className="absolute right-0 top-0 w-px -translate-y-1/2 bg-dim" />
      </motion.div>
      <RulerLabel p={p} draw={draw} />
    </motion.div>
  );
}

const FORM_BOX = { ...WIDE.form.rect, h: WIDE.cart.y + CART.h + 12 - WIDE.form.rect.y };
const GUIDES = [
  { label: "grid", rect: WIDE.grid.rect },
  { label: "form", rect: FORM_BOX },
] as const;
const OUTSET = 3;

/* A guide is drawn on: it wipes in from the left over T.guideDraw, holds, and fades out before the frame narrows. */
function useGuideDraw(p: MV, i: number) {
  const a = T.guideIn[i];
  const opacity = useTransform(p, [a, a + 0.01, T.guideOut - 0.02, T.guideOut], [0, 1, 1, 0]);
  const clip = useTransform(p, (v) => clipRight(segAt(v, [a, a + T.guideDraw])));
  return { opacity, clip };
}

export function GuideBox({ p, i }: { p: MV; i: number }) {
  const { rect } = GUIDES[i];
  const { opacity, clip } = useGuideDraw(p, i);
  return (
    <motion.i
      aria-hidden
      style={{ opacity, clipPath: clip, left: u(rect.x - OUTSET), top: u(rect.y - OUTSET), width: u(rect.w + 2 * OUTSET), height: u(rect.h + 2 * OUTSET), borderRadius: u(7) }}
      className="pointer-events-none absolute z-20 border border-dashed border-accent bg-accent/[0.06]"
    />
  );
}

export function GuidePill({ p, i }: { p: MV; i: number }) {
  const { label, rect } = GUIDES[i];
  const { opacity } = useGuideDraw(p, i);
  return (
    <motion.span
      aria-hidden
      style={{ opacity, left: u(SCREEN_WIDE.x + rect.x + rect.w / 2), top: u(FRAME_WIDE.y + FRAME_WIDE.h + 10), ...TXT }}
      className={`${MONO} absolute z-20 -translate-x-1/2 whitespace-nowrap text-dim`}
    >
      <i aria-hidden className="mr-[0.5em] inline-block h-[0.55em] w-[0.55em] rounded-full bg-accent" />
      {label}
    </motion.span>
  );
}

const ROW_MID = FLOW_TOP.phone + HEAD + 2.5 * (CARD.rowH + CARD.rowGap);
const TAGS = [
  { text: "one column", y: SCREEN_PHONE.y + ROW_MID },
  { text: "sticky bar", y: SCREEN_PHONE.y + SCREEN_PHONE.h - BAR_H + CART.barPad + CART.h / 2 },
] as const;
const LEADER = 9;

/* One callout per reflow, hung on the live right edge of the frame at the block it names, so it never sits on the bezel. */
export function Tag({ p, i }: { p: MV; i: number }) {
  const a = T.tagsIn[i];
  const opacity = useTransform(p, [a, a + 0.025, T.tagsOut[0], T.tagsOut[1]], [0, 1, 1, 0]);
  const reach = useTransform(p, (v) => u(LEADER * clamp01(segAt(v, [a, a + 0.03]))));
  const left = useTransform(p, (v) => {
    const { frame } = frameAt(v);
    return u(frame.x + frame.w + 1);
  });
  return (
    <motion.p
      aria-hidden
      style={{ opacity, left, top: u(TAGS[i].y), ...TXT }}
      className={`${MONO} ${WIDE_ONLY} absolute z-30 -translate-y-1/2 items-center whitespace-nowrap text-dim`}
    >
      <motion.i style={{ width: reach, height: u(0.9) }} className="shrink-0 bg-accent" />
      <span style={{ marginLeft: u(3) }}>{TAGS[i].text}</span>
    </motion.p>
  );
}

/* The thumb runs in the gap between the row caption and the chevron, and between the two labels of the form header, so it never sits on text. */
const THUMB = { x: SCREEN_PHONE.x + 104, y0: SCREEN_PHONE.y + 268, drag: 96, d: 20, tail: 22, rest: 24 };
const TAIL = "linear-gradient(to bottom, color-mix(in oklab, var(--color-accent) 60%, transparent), transparent)";

/* The swipe leaves a short comet tail under the thumb, never its whole path. */
export function Thumb({ p }: { p: MV }) {
  const [a, b] = T.thumb;
  const y = useTransform(p, (v) => THUMB.y0 - THUMB.drag * easeInOutCubic(segAt(v, T.swipe)) + THUMB.rest * (1 - easeOutCubic(segAt(v, T.thumbRest))));
  const opacity = useTransform(p, [a, a + 0.01, b - 0.012, b], [0, 1, 1, 0]);
  const ringTop = useTransform(y, (v) => u(v - THUMB.d / 2));
  const trailTop = useTransform(y, (v) => u(v + THUMB.d / 2));
  const trailH = useTransform(y, (v) => u(Math.min(THUMB.tail, Math.max(0, THUMB.y0 - v))));
  return (
    <motion.div aria-hidden style={{ opacity }} className="pointer-events-none absolute inset-0 z-50">
      <motion.i style={{ top: trailTop, height: trailH, left: u(THUMB.x - 0.75), width: u(1.5), background: TAIL }} className="absolute" />
      <motion.span
        style={{ top: ringTop, left: u(THUMB.x - THUMB.d / 2), width: u(THUMB.d), height: u(THUMB.d) }}
        className="absolute rounded-full border-[1.5px] border-accent"
      >
        <i className="absolute rounded-full bg-accent" style={{ inset: "36%" }} />
      </motion.span>
    </motion.div>
  );
}

const INDEX_TOP = 150;
const INDEX_PITCH = 19;
const INDEX_RIGHT = FRAME_PHONE.x - 8;

/* Chapter 3: which of the three views the phone is showing. */
export function ViewItem({ p, i }: { p: MV; i: number }) {
  const w = useTransform(p, (v) => clamp01(1 - Math.abs(viewAt(v) - i)));
  const color = useTransform(w, (x) => `color-mix(in oklab, var(--color-fg) ${(x * 100).toFixed(1)}%, var(--color-mute))`);
  const dot = useTransform(w, (x) => 0.55 + 0.45 * x);
  const show = useSeg(p, T.viewIn[0], T.viewIn[1]);
  return (
    <motion.p
      aria-hidden
      style={{ opacity: show, color, right: u(STAGE_W - INDEX_RIGHT), top: u(INDEX_TOP + i * INDEX_PITCH), ...TXT }}
      className={`${MONO} ${WIDE_ONLY} absolute z-30 -translate-y-1/2 items-center whitespace-nowrap`}
    >
      <span>{VIEWS[i]}</span>
      <motion.i
        style={{ scale: dot, width: u(6), height: u(6), marginLeft: u(5), background: "var(--color-accent)", opacity: w }}
        className="block shrink-0 rounded-full"
      />
    </motion.p>
  );
}
