"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { segAt } from "./MobileSceneMath";
import { u } from "./MobileSceneKit";
import { LOCK_BODY, MtmGlyph } from "./MtmKitGlyphs";
import { TONE_VAR, clamp01, mixColor } from "./MtmKitMath";
import { CART, T, TEXT } from "./MtmPhoneSceneData";
import type { Flow } from "./MtmPhoneSceneMath";
import { useRect, type Type } from "./MtmPhoneSceneKit";

/* The add to cart button, drawn in stage units. It sits under the form on the desk, then rides the bottom of the screen as a
   sticky bar. Unlock lifts the padlock, then the accent face wipes in over the locked one, with no ghosting. */

type Props = { p: MV; flow: MotionValue<Flow>; type: Type };

const OPEN_END = 0.3;
const LOCK_LIFT = 2.8;
const LEG_LIFT = 2.4;
const RIGHT_LEG_LIFT = 4.6;
const LOCK_CENTER = -4.6;
const LEG_BOTTOM = -1;
const PRESS_DIP = 0.04;
const SHAKE = 1.6;

function AnimLock({ open }: { open: MV }) {
  const d = useTransform(open, (o) => {
    const arch = LOCK_CENTER - LOCK_LIFT * o;
    return `M-4 ${LEG_BOTTOM - LEG_LIFT * o}V${arch}A4 4 0 0 1 4 ${arch}V${LEG_BOTTOM - RIGHT_LEG_LIFT * o}`;
  });
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden className="shrink-0" style={{ width: u(11), height: u(11) }}>
      <g fill="none" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d={d} />
        {LOCK_BODY}
      </g>
    </svg>
  );
}

function Face({ type, icon, tag }: { type: Type; icon: React.ReactNode; tag: React.ReactNode }) {
  return (
    <>
      {icon}
      <motion.span style={{ fontSize: type.name, lineHeight: 1 }} className="whitespace-nowrap font-semibold">
        {TEXT.cart}
      </motion.span>
      <motion.span style={{ fontSize: type.label, lineHeight: 1 }} className={`${MONO} relative ml-auto hidden whitespace-nowrap uppercase tracking-[0.1em] @[15em]:block`}>
        {tag}
      </motion.span>
    </>
  );
}

/* Two same-size things in one place swap by complementary clips: the old one is erased from the left, the new one is revealed from the left. */
function Swap({ s, old, next }: { s: MV; old: React.ReactNode; next: React.ReactNode }) {
  const oldClip = useTransform(s, (t) => `inset(0 0 0 ${(t * 100).toFixed(2)}%)`);
  const newClip = useTransform(s, (t) => `inset(0 ${((1 - t) * 100).toFixed(2)}% 0 0)`);
  return (
    <span className="relative inline-grid">
      <motion.span style={{ clipPath: oldClip, gridArea: "1 / 1" }}>{old}</motion.span>
      <motion.span style={{ clipPath: newClip, gridArea: "1 / 1" }}>{next}</motion.span>
    </span>
  );
}

const TAG_ROOM = "@container";

/* One face of the button. It is a container so the state tag can be dropped when the button is too narrow for both texts,
   and the stage unit is restated inside it: cq units inside a container are measured on that container, so the inner
   layer divides the container width by the button's own width in stage units to get the stage unit back. */
function Plate({ clip, unit, type, className, children }: { clip: MotionValue<string>; unit: MotionValue<string>; type: Type; className: string; children: ReactNode }) {
  return (
    <motion.div style={{ clipPath: clip, fontSize: type.name }} className={`${TAG_ROOM} absolute inset-0 ${className}`}>
      <motion.div style={{ ["--u" as string]: unit, gap: u(5), paddingInline: u(7) }} className="absolute inset-0 flex items-center">
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Cart({ p, flow, type }: Props) {
  const box = useRect(flow, (f) => f.cart);
  const unlock = useSeg(p, T.unlock[0], T.unlock[1]);
  const press = useSeg(p, T.press[0], T.press[1]);
  const open = useSeg(unlock, 0, OPEN_END, easeOutCubic);
  const fill = useSeg(unlock, OPEN_END, 1, easeInOutCubic);
  const lockedClip = useTransform(fill, (f) => `inset(0 0 0 ${(f * 100).toFixed(2)}%)`);
  const readyClip = useTransform(fill, (f) => `inset(0 ${((1 - f) * 100).toFixed(2)}% 0 0)`);
  const edgeLeft = useTransform(fill, (f) => `${(f * 100).toFixed(2)}%`);
  const edgeOn = useTransform(fill, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  const border = useTransform(fill, (f) => mixColor("var(--color-accent)", f, "var(--color-line-strong)"));
  const scale = useTransform(press, (t) => 1 - PRESS_DIP * Math.sin(Math.PI * clamp01(t)));
  const rippleScale = useTransform(press, (t) => 1 + 0.1 * clamp01(t));
  const rippleOn = useTransform(press, (t) => (t > 0 && t < 1 ? (1 - t) * 0.7 : 0));
  const added = useSeg(p, T.added[0], T.added[1], easeInOutCubic);
  const poke = useSeg(p, T.poke[0], T.poke[1]);
  const shake = useTransform(poke, (t) => u(SHAKE * Math.sin(4 * Math.PI * t) * (1 - t)));
  const unit = useTransform(flow, (f) => `calc(100cqw / ${f.cart.w.toFixed(3)})`);
  return (
    <motion.div style={{ ...box, x: shake }} className="absolute z-[45]">
      <motion.i style={{ scale: rippleScale, opacity: rippleOn, borderWidth: u(1.5), borderRadius: u(5) }} className="pointer-events-none absolute inset-0 border-accent" />
      <motion.div style={{ scale, borderColor: border, borderRadius: u(5) }} className="absolute inset-0 overflow-hidden border">
        <Plate clip={lockedClip} unit={unit} type={type} className="bg-surface-2 text-mute">
          <Face type={type} icon={<AnimLock open={open} />} tag="locked" />
        </Plate>
        <Plate clip={readyClip} unit={unit} type={type} className="bg-accent text-fg">
          <Face
            type={type}
            icon={<Swap s={added} old={<MtmGlyph name="cart" size={u(11)} />} next={<MtmGlyph name="check" size={u(11)} />} />}
            tag={<Swap s={added} old="ready" next="added" />}
          />
        </Plate>
        <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOn, width: u(1) }} className="absolute inset-y-0 -translate-x-1/2 bg-fg" />
      </motion.div>
    </motion.div>
  );
}

/* A short line under the locked button on the desk. It flushes rose while the locked button is pressed, and leaves before
   the button drops with the form. */
export function GateNote({ p, flow, type }: Props) {
  const top = useTransform(flow, (f) => u(f.cart.y + CART.h + 3));
  const left = useTransform(flow, (f) => u(f.cart.x));
  const opacity = useTransform(p, (v) => 1 - segAt(v, T.noteOut));
  const color = useTransform(p, (v) => mixColor(TONE_VAR.rose, Math.sin(Math.PI * segAt(v, T.poke)), "var(--color-mute)"));
  return (
    <motion.p aria-hidden style={{ top, left, opacity, color, fontSize: type.label, lineHeight: 1 }} className={`${MONO} absolute z-[45] whitespace-nowrap`}>
      {TEXT.note}
    </motion.p>
  );
}
