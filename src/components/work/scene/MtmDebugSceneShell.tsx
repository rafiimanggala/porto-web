"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { CLOSED_AT, FOOTER, TABS, WIPES } from "./MtmDebugSceneData";
import { PANEL_SHADOW } from "./MtmDebugSceneKit";
import { clamp01, keyframes, pct, segAt } from "./MtmDebugSceneMath";
import { mixColor } from "./MtmKitMath";
import BytesPage from "./MtmDebugSceneBytes";
import LoginPage from "./MtmDebugSceneLogin";
import MenuPage from "./MtmDebugSceneMenu";
import ShipPage from "./MtmDebugSceneShip";

/* One instrument panel: a tab strip, four pages that wipe over each other, a footer that counts closed cases.
   The panel is laid out for a 358 by 430 box and scaled up (never down) as far as the box is wide and tall enough.
   In a taller box it stops growing at MAX_H design px and sits in the middle, so a tall phone gets a snug panel
   instead of one with a hundred pixels of empty band above and below the content. */

const DESIGN_W = "358px";
const DESIGN_H = "430px";
const MAX_H = "500px";
const MAX_SCALE = 1.5;
const STAGE: CSSProperties = {
  ["--s" as string]: `clamp(1, min(tan(atan2(100cqw, ${DESIGN_W})), tan(atan2(100cqh, ${DESIGN_H}))), ${MAX_SCALE})`,
  ["--h" as string]: `min(calc(100cqh / var(--s)), ${MAX_H})`,
  top: "calc((100cqh - var(--s) * var(--h)) / 2)",
  width: "calc(100cqw / var(--s))",
  height: "var(--h)",
  transform: "scale(var(--s))",
  transformOrigin: "0 0",
};

const PAGE_KEYS = WIPES.flatMap(([a, b]) => [a, b]);
const PAGE_VALS = [0, 1, 1, 2, 2, 3];
const DIM = 0.3;

function Tab({ pagePos, k, label }: { pagePos: MV; k: number; label: string }) {
  const on = useTransform(pagePos, (v) => 1 - Math.min(1, Math.abs(v - k)));
  const color = useTransform(on, (t) => mixColor("var(--color-fg)", t, "var(--color-mute)"));
  return (
    <motion.span style={{ color }} className={`${MONO} truncate text-center text-[10px] uppercase tracking-[0.1em]`}>
      {label}
    </motion.span>
  );
}

function Tabs({ pagePos }: { pagePos: MV }) {
  const left = useTransform(pagePos, (v) => pct(v * 25));
  return (
    <div className="relative grid h-8 shrink-0 grid-cols-4 items-center border-b border-line bg-surface-2/60">
      {TABS.map((label, k) => (
        <Tab key={label} pagePos={pagePos} k={k} label={label} />
      ))}
      <motion.i aria-hidden style={{ left }} className="absolute -bottom-px h-0.5 w-1/4 bg-accent" />
    </div>
  );
}

function Page({ pagePos, k, children }: { pagePos: MV; k: number; children: ReactNode }) {
  const shown = useTransform(pagePos, (v) => clamp01(v - (k - 1)));
  const cover = useTransform(pagePos, (v) => clamp01(v - k));
  const clip = useTransform([shown, cover], ([s, c]: number[]) => `inset(0 ${pct(100 - s * 100)} 0 ${pct(c * 100)})`);
  const opacity = useTransform(cover, (c) => 1 - DIM * c);
  return (
    <motion.div style={{ clipPath: clip }} className="absolute inset-0">
      <motion.div style={{ opacity }} className="h-full">
        {children}
      </motion.div>
    </motion.div>
  );
}

function Edge({ pagePos, k }: { pagePos: MV; k: number }) {
  const front = useTransform(pagePos, (v) => clamp01(v - (k - 1)));
  const left = useTransform(front, (f) => pct(f * 100));
  const opacity = useTransform(front, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return <motion.i aria-hidden style={{ left, opacity }} className="pointer-events-none absolute inset-y-0 z-20 w-0.5 -translate-x-1/2 rounded-full bg-accent" />;
}

function Pip({ p, at }: { p: MV; at: number }) {
  const closed = useTransform(p, (v) => segAt(v, at - 0.012, at));
  const background = useTransform(closed, (t) => mixColor("var(--color-mint)", t, "var(--color-line-strong)"));
  return <motion.i style={{ background }} className="h-2 w-2 rounded-full" />;
}

function Footer({ p }: { p: MV }) {
  const count = useTransform(p, (v) => `${CLOSED_AT.filter((a) => v >= a).length}/${CLOSED_AT.length}`);
  return (
    <div className={`${MONO} flex h-7 shrink-0 items-center gap-2 border-t border-line bg-surface-2/60 px-3 text-[10px] text-mute`}>
      <span className="flex gap-1">
        {CLOSED_AT.map((at) => (
          <Pip key={at} p={p} at={at} />
        ))}
      </span>
      <span>
        {FOOTER.label} <motion.span className="tabular-nums text-fg">{count}</motion.span>
      </span>
      <span className="ml-auto min-w-0 truncate">{FOOTER.stack}</span>
    </div>
  );
}

export default function Visual({ p }: { p: MV }) {
  const pagePos = useTransform(p, (v) => keyframes(v, PAGE_KEYS, PAGE_VALS));
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div className="absolute left-0 top-0" style={STAGE}>
        <div className={`absolute inset-0 flex flex-col overflow-hidden rounded-xl border border-line-strong bg-surface-1 ${PANEL_SHADOW}`}>
          <Tabs pagePos={pagePos} />
          <div className="relative min-h-0 flex-1 overflow-hidden">
            <Page pagePos={pagePos} k={0}>
              <LoginPage p={p} />
            </Page>
            <Page pagePos={pagePos} k={1}>
              <MenuPage p={p} />
            </Page>
            <Page pagePos={pagePos} k={2}>
              <BytesPage p={p} />
            </Page>
            <Page pagePos={pagePos} k={3}>
              <ShipPage p={p} />
            </Page>
            {WIPES.map((_, i) => (
              <Edge key={i} pagePos={pagePos} k={i + 1} />
            ))}
          </div>
          <Footer p={p} />
        </div>
      </div>
    </div>
  );
}
