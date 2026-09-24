"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { BODIES } from "./MobileSceneCards";
import {
  CAPTIONS,
  CHAPTERS,
  LAYOUT_ROOMY,
  LAYOUT_TIGHT,
  PT,
  STAGE_H,
  STAGE_W,
  type CardDef,
} from "./MobileSceneData";
import { frameEase } from "./MobileSceneMath";
import { Chrome, ColBands, Frame, Legend, Ruler, Screen, Thumb, Zone } from "./MobileSceneFrame";
import { CardShell, LayoutCtx, Swap, useLayout } from "./MobileSceneKit";
import { ScoreBody } from "./MobileSceneScore";

/* Dashboard built wide, FLIPped into a phone stack by priority, then scrolled with the score pinned. */

const STAGE_FIT = "min(100cqw, 90cqh)";

/* On a narrow screen the phone state only needs the middle of the stage, so a camera zooms in on it as the frame
   morphs. Zoom and pan are measured once per resize into CSS variables; the per-frame part stays a function of p. */
const NARROW_PX = 520;
const ZOOM_MAX = 1.5;
const PAN_UNITS = 20;
/* Rendered pixels per iPhone point below which the phone switches to its tight layout (body text would fall under 9.5 px). */
const TIGHT_BELOW = 0.62;

function useCameraVars(ref: React.RefObject<HTMLDivElement | null>, onTight: (tight: boolean) => void) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const stagePx = Math.min(el.clientWidth, 0.9 * el.clientHeight);
      const fit = (el.clientHeight * 0.98) / ((stagePx * STAGE_H) / STAGE_W);
      const zoom = el.clientWidth < NARROW_PX ? Math.max(1, Math.min(ZOOM_MAX, fit)) : 1;
      el.style.setProperty("--cam-zoom", zoom.toFixed(3));
      el.style.setProperty("--cam-pan", `${((-PAN_UNITS * stagePx) / STAGE_W).toFixed(2)}px`);
      onTight((stagePx / STAGE_W) * PT * zoom < TIGHT_BELOW);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, onTight]);
}

const cameraAt = (v: number) => {
  const f = frameEase(v).toFixed(4);
  return `translateX(calc(var(--cam-pan, 0px) * ${f} * (1 + (var(--cam-zoom, 1) - 1) * ${f}))) scale(calc(1 + (var(--cam-zoom, 1) - 1) * ${f}))`;
};

function Stage({ p, children }: { p: MV; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [tight, setTight] = useState(false);
  useCameraVars(ref, setTight);
  const transform = useTransform(p, cameraAt);
  return (
    <div ref={ref} className="absolute inset-0 grid place-items-center" style={{ containerType: "size" }}>
      <motion.div
        className="relative"
        style={{
          width: STAGE_FIT,
          aspectRatio: `${STAGE_W} / ${STAGE_H}`,
          containerType: "inline-size",
          transform,
          ["--u" as string]: `calc(100cqw / ${STAGE_W})`,
        }}
      >
        <LayoutCtx.Provider value={tight ? LAYOUT_TIGHT : LAYOUT_ROOMY}>{children}</LayoutCtx.Provider>
      </motion.div>
    </div>
  );
}

function SwapBody({ p, card }: { p: MV; card: CardDef }) {
  if (card.key === "score") return <ScoreBody p={p} card={card} />;
  const Body = BODIES[card.key];
  return (
    <Swap p={p} range={card.swap} wide={<Body.wide p={p} a={card.build} />} phone={<Body.phone p={p} a={card.build} />} />
  );
}

function CardView({ p, card }: { p: MV; card: CardDef }) {
  return (
    <CardShell p={p} card={card}>
      <SwapBody p={p} card={card} />
    </CardShell>
  );
}

function Cards({ p }: { p: MV }) {
  const { cards } = useLayout();
  return (
    <>
      {cards.map((card) => (
        <CardView key={card.key} p={p} card={card} />
      ))}
    </>
  );
}

function Visual({ p }: { p: MV }) {
  return (
    <Stage p={p}>
      <Frame p={p} />
      <Screen p={p}>
        <Cards p={p} />
      </Screen>
      <Chrome p={p} />
      <ColBands p={p} />
      <Legend p={p} />
      <Ruler p={p} />
      <Thumb p={p} />
      <Zone p={p} />
    </Stage>
  );
}

export default function MobileScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      heightClass="h-[400svh] sm:h-[440svh]"
    />
  );
}
