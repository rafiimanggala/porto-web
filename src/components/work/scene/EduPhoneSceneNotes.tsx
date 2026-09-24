"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { FRAME_PHONE, FRAME_WIDE, SCREEN_PHONE, SCREEN_WIDE, STAGE_W } from "./MobileSceneData";
import { clamp01, frameAt, frameEase, lerp, segAt } from "./MobileSceneMath";
import { FS, u, useBox } from "./MobileSceneKit";
import { SceneIcon, type SceneIconName } from "./SceneIcon";
import { HEAD, NAV, QCARD, RULER_GAP, RULER_PX, RULER_SWITCH_PX, T, type Span } from "./EduPhoneSceneData";
import { HOME, WIDE, pageAt } from "./EduPhoneSceneMath";

/* Annotation layer around the device: the width ruler, the three layout guides of
   the laptop state, the three reflow callouts beside the phone, and the view index. */

const TXT = { fontSize: u(FS), lineHeight: 1.15 } as const;
const WIDE_ONLY = "hidden @[32.5rem]:flex";

/* Ruler above the frame: a width readout whose icon turns from a browser to a phone. */
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
    const px = Math.round(lerp(RULER_PX[0], RULER_PX[1], frameEase(v)));
    return `${px} px \u00b7 ${px > RULER_SWITCH_PX ? 4 : 2} col`;
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

/* Laptop state: a dashed outline over each block, lit in turn, and its name under the frame. */
const GUIDES = [
  { label: "grid", rect: WIDE.tiles.rect },
  { label: "list", rect: WIDE.lessons.rect },
  { label: "quiz", rect: WIDE.quiz.rect },
] as const;
const OUTSET = 3;
function useGuideOpacity(p: MV, i: number) {
  const a = T.guideIn[i];
  return useTransform(p, [a, a + 0.02, T.guideOut - 0.02, T.guideOut], [0, 1, 1, 0]);
}

export function GuideBox({ p, i }: { p: MV; i: number }) {
  const { rect } = GUIDES[i];
  const opacity = useGuideOpacity(p, i);
  return (
    <motion.i
      aria-hidden
      style={{ opacity, left: u(rect.x - OUTSET), top: u(rect.y - OUTSET), width: u(rect.w + 2 * OUTSET), height: u(rect.h + 2 * OUTSET), borderRadius: u(7) }}
      className="pointer-events-none absolute z-20 border border-dashed border-accent bg-accent/[0.06]"
    />
  );
}

export function GuidePill({ p, i }: { p: MV; i: number }) {
  const { label, rect } = GUIDES[i];
  const opacity = useGuideOpacity(p, i);
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

/* Phone state: one short callout per reflow, hung on the live right edge of the frame at the block it names, so it can never sit on the bezel while the frame resizes. */
const chipsMid = HOME.quiz.rect.y + HEAD + QCARD.pad + QCARD.qHome + QCARD.qGap + (4 * QCARD.chipH + 3 * QCARD.chipGap) / 2;
const TAGS = [
  { text: "2 per row", y: HOME.tiles.rect.y + HOME.tiles.rect.h / 2 },
  { text: "full width", y: HOME.lessons.rect.y + HOME.lessons.rect.h / 2 },
  { text: "stacked", y: chipsMid },
] as const;
const LEADER = 9;

export function Tag({ p, i }: { p: MV; i: number }) {
  const a = T.tags[i];
  const opacity = useTransform(p, [a, a + 0.025, T.tagsOut[0], T.tagsOut[1]], [0, 1, 1, 0]);
  const reach = useTransform(p, (v) => u(LEADER * clamp01(segAt(v, [a, a + 0.03]))));
  const left = useTransform(p, (v) => {
    const { frame } = frameAt(v);
    return u(frame.x + frame.w + 1);
  });
  return (
    <motion.p
      aria-hidden
      style={{ opacity, left, top: u(SCREEN_PHONE.y + TAGS[i].y), ...TXT }}
      className={`${MONO} ${WIDE_ONLY} absolute z-30 -translate-y-1/2 items-center whitespace-nowrap text-dim`}
    >
      <motion.i style={{ width: reach, height: u(0.9) }} className="shrink-0 bg-accent" />
      <span style={{ marginLeft: u(3) }}>{TAGS[i].text}</span>
    </motion.p>
  );
}

/* Phone state, chapter 3: which of the three views the phone is showing. */
const INDEX_TOP = 150;
const INDEX_PITCH = 19;
const INDEX_RIGHT = FRAME_PHONE.x - 8;

export function ViewItem({ p, i }: { p: MV; i: number }) {
  const label = NAV[i + 1];
  const w = useTransform(p, (v) => clamp01(1 - Math.abs(pageAt(v) - (i + 1))));
  const color = useTransform(w, (x) => `color-mix(in oklab, var(--color-fg) ${(x * 100).toFixed(1)}%, var(--color-mute))`);
  const dot = useTransform(w, (x) => 0.55 + 0.45 * x);
  const show = useSeg(p, T.index[0], T.index[1]);
  return (
    <motion.p
      aria-hidden
      style={{ opacity: show, color, right: u(STAGE_W - INDEX_RIGHT), top: u(INDEX_TOP + i * INDEX_PITCH), ...TXT }}
      className={`${MONO} ${WIDE_ONLY} absolute z-30 -translate-y-1/2 items-center whitespace-nowrap`}
    >
      <span>{label}</span>
      <motion.i
        style={{ scale: dot, width: u(6), height: u(6), marginLeft: u(5), background: "var(--color-accent)", opacity: w }}
        className="block shrink-0 rounded-full"
      />
    </motion.p>
  );
}
