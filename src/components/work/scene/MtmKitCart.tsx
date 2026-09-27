"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { LOCK_BODY, MtmGlyph } from "./MtmKitGlyphs";
import { clamp01, mixColor, useMv, type MvIn } from "./MtmKitMath";

/* Add to cart button: unlock 0..1 opens the padlock, then wipes the ready face in over the locked face. */

const OPEN_END = 0.3;
const PRESS_DIP = 0.04;
const RIPPLE_GROW = 0.1;
const RIPPLE_PEAK = 0.7;
const LOCK_LIFT = 2.8;
const LEG_LIFT = 2.4;
const RIGHT_LEG_LIFT = 4.6;
const LOCK_CENTER = -4.6;
const LEG_BOTTOM = -1;

function AnimLock({ open }: { open: MV }) {
  const d = useTransform(open, (o) => {
    const arch = LOCK_CENTER - LOCK_LIFT * o;
    return `M-4 ${LEG_BOTTOM - LEG_LIFT * o}V${arch}A4 4 0 0 1 4 ${arch}V${LEG_BOTTOM - RIGHT_LEG_LIFT * o}`;
  });
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden className="h-5 w-5 shrink-0">
      <g fill="none" stroke="var(--color-fg)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <motion.path d={d} />
        {LOCK_BODY}
      </g>
    </svg>
  );
}

const FACE = "absolute inset-0 flex items-center gap-2.5 px-3.5";
const LABEL = "text-[13px] font-semibold leading-none";
const TAG = `${MONO} ml-auto text-[10px] uppercase tracking-[0.12em]`;

type CartButtonProps = {
  /** 0 locked, 1 ready. Scrub it: the shackle lifts over the first 30%, then the accent face wipes in. */
  unlock: MvIn;
  /** 0..1: one press, a small dip and a ripple ring. Default 0. */
  press?: MvIn;
  label?: string;
  className?: string;
};

export function CartButton({ unlock, press = 0, label = "Add to cart", className = "" }: CartButtonProps) {
  const u = useMv(unlock);
  const pr = useMv(press);
  const open = useSeg(u, 0, OPEN_END, easeOutCubic);
  const fill = useSeg(u, OPEN_END, 1, easeInOutCubic);
  const lockedClip = useTransform(fill, (f) => `inset(0 0 0 ${(f * 100).toFixed(2)}%)`);
  const readyClip = useTransform(fill, (f) => `inset(0 ${((1 - f) * 100).toFixed(2)}% 0 0)`);
  const edgeLeft = useTransform(fill, (f) => `${(f * 100).toFixed(2)}%`);
  const edgeOn = useTransform(fill, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  const border = useTransform(fill, (f) => mixColor("var(--color-accent)", f, "var(--color-line-strong)"));
  const scale = useTransform(pr, (t) => 1 - PRESS_DIP * Math.sin(Math.PI * clamp01(t)));
  const rippleScale = useTransform(pr, (t) => 1 + RIPPLE_GROW * clamp01(t));
  const rippleOn = useTransform(pr, (t) => (t > 0 && t < 1 ? (1 - t) * RIPPLE_PEAK : 0));
  return (
    <div aria-hidden className={`relative h-11 w-full ${className}`}>
      <motion.i style={{ scale: rippleScale, opacity: rippleOn }} className="pointer-events-none absolute inset-0 rounded-lg border-2 border-accent" />
      <motion.div style={{ scale, borderColor: border }} className="absolute inset-0 overflow-hidden rounded-lg border">
        <motion.div style={{ clipPath: lockedClip }} className={`${FACE} bg-surface-2 text-mute`}>
          <AnimLock open={open} />
          <span className={LABEL}>{label}</span>
          <span className={TAG}>locked</span>
        </motion.div>
        <motion.div style={{ clipPath: readyClip }} className={`${FACE} bg-accent text-fg`}>
          <MtmGlyph name="cart" size={20} />
          <span className={LABEL}>{label}</span>
          <span className={TAG}>ready</span>
        </motion.div>
        <motion.i aria-hidden style={{ left: edgeLeft, opacity: edgeOn }} className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-fg" />
      </motion.div>
    </div>
  );
}
