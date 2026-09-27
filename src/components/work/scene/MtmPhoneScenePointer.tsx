"use client";

import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { SCREEN_WIDE } from "./MobileSceneData";
import { segAt } from "./MobileSceneMath";
import { u } from "./MobileSceneKit";
import { keyframes } from "./MtmKitMath";
import { FIELD, HOVERS, T, type Rect } from "./MtmPhoneSceneData";
import { WIDE } from "./MtmPhoneSceneMath";

/* The desk pointer. It visits the shirts that lift, then the height and collar fields as they are typed, and ends on the
   padlocked button. Its path is read off the desk layout, so it always lands on the thing it names. */

const SIZE = 11;
const ARROW = "M0 0L0 13.5L3.6 10.3L6.2 16L8.6 14.9L6 9.4L10.8 9.4Z";

const at = (r: Rect, fx: number, fy: number) => ({ x: SCREEN_WIDE.x + r.x + r.w * fx, y: SCREEN_WIDE.y + r.y + r.h * fy });
const onCard = (i: number) => at(WIDE.grid.cards[i].rect, 0.62, 0.5);

/* The value box of a field: the form's offset, the field's own rect, then the label row above the box. */
function onField(k: number) {
  const { rect: form, fields } = WIDE.form;
  const f = fields[k].rect;
  return at({ x: form.x + f.x, y: form.y + f.y + FIELD.label + 1, w: f.w, h: FIELD.box }, 0.4, 0.5);
}

const peak = (span: readonly [number, number]) => (span[0] + span[1]) / 2;
const STOPS = [
  ...HOVERS.map(([card, span]) => ({ t: peak(span), ...onCard(card) })),
  { t: 0.188, ...onField(0) },
  { t: 0.218, ...onField(0) },
  { t: 0.224, ...onField(1) },
  { t: 0.25, ...onField(1) },
  { t: 0.262, ...at(WIDE.cart, 0.5, 0.5) },
  { t: 0.29, ...at(WIDE.cart, 0.5, 0.5) },
];
const TIMES = STOPS.map((s) => s.t);
const XS = STOPS.map((s) => s.x);
const YS = STOPS.map((s) => s.y);
const IN = [0.09, 0.105] as const;
const OUT = [0.293, 0.306] as const;

export function Pointer({ p }: { p: MV }) {
  const x = useTransform(p, (v) => u(keyframes(v, TIMES, XS)));
  const y = useTransform(p, (v) => u(keyframes(v, TIMES, YS)));
  const opacity = useTransform(p, (v) => segAt(v, IN) * (1 - segAt(v, OUT)));
  const scale = useTransform(p, (v) => 1 - 0.16 * Math.sin(Math.PI * segAt(v, T.poke)));
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 11 16.5"
      style={{ left: x, top: y, opacity, scale, width: u(SIZE), height: u(SIZE * 1.5), transformOrigin: "0 0" }}
      className="pointer-events-none absolute z-50 overflow-visible"
    >
      <path d={ARROW} fill="var(--color-fg)" stroke="var(--color-bg)" strokeWidth="1.1" strokeLinejoin="round" />
    </motion.svg>
  );
}
