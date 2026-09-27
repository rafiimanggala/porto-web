"use client";

import { motion, useTransform } from "framer-motion";
import { PatternCard } from "./MtmKitCards";
import { clamp01 } from "./MtmKitMath";
import { LAYOUT, MEN_PATTERNS, MENU_TOP, PICK } from "./MtmGateSceneData";
import type { GateMotion } from "./MtmGateSceneMotion";

/* The pattern dropdown. It overlays the pane, its first row sits exactly on the selector, and it folds back into it. */

const SHADOW = "shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]";
const EDGE_ON = 0.004;

function MenuRow({ i, m }: { i: number; m: GateMotion }) {
  const pattern = MEN_PATTERNS[i];
  const hot = useTransform(m.hover, (h) => clamp01(1 - Math.abs(h - i)));
  return (
    <div className="relative">
      <PatternCard name={pattern.name} gender={pattern.gender} selected={i === PICK.pattern ? m.sel : 0} />
      <motion.i style={{ opacity: hot }} className="pointer-events-none absolute inset-0 rounded-lg border border-accent/60 bg-accent/10" />
    </div>
  );
}

export function Menu({ m }: { m: GateMotion }) {
  const clip = useTransform(m.menu, (o) => `inset(0 0 ${((1 - o) * 100).toFixed(2)}% 0)`);
  const edgeTop = useTransform(m.menu, (o) => `${(o * 100).toFixed(2)}%`);
  const edgeOn = useTransform(m.menu, (o) => (o > EDGE_ON && o < 1 - EDGE_ON ? 1 : 0));
  return (
    <div className="pointer-events-none absolute z-20" style={{ top: MENU_TOP, left: LAYOUT.panePad, right: LAYOUT.panePad }}>
      <motion.div style={{ clipPath: clip, gap: LAYOUT.menuGap }} className={`flex flex-col rounded-xl bg-surface-1 ${SHADOW}`}>
        {MEN_PATTERNS.map((pattern, i) => (
          <MenuRow key={pattern.id} i={i} m={m} />
        ))}
      </motion.div>
      <motion.i aria-hidden style={{ top: edgeTop, opacity: edgeOn }} className="absolute inset-x-0 h-0.5 -translate-y-1/2 rounded-full bg-accent" />
    </div>
  );
}
