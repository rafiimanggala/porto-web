"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionStyle } from "framer-motion";
import { useSeg, type MV } from "./HealthSceneParts";
import { EMAIL_FLOWS } from "./MtmKitData";
import { liveWin, restyleWin, trigWin } from "./MtmEmailSceneData";
import { hump } from "./MtmEmailSceneMath";
import { Band, StockFace, Zone } from "./MtmEmailSceneFaces";
import { WipeSwap } from "./MtmEmailSceneKit";

/* One flow card: stock, branded, trigger, live. */

export type CardExtras = { band?: ReactNode; body?: ReactNode; overlay?: ReactNode };

const RING = "pointer-events-none absolute -inset-px rounded-lg border-2";

function useRing(p: MV, a: number, b: number, grow: number) {
  const t = useSeg(p, a, b);
  return { opacity: useTransform(t, (v) => hump(v) * 0.9), scale: useTransform(t, (v) => 1 + grow * v) };
}

export function EmailCard({ p, i, frame, extras }: { p: MV; i: number; frame: MotionStyle; extras?: CardExtras }) {
  const flow = EMAIL_FLOWS[i];
  const [ra, rb] = restyleWin(i);
  const [ta, tb] = trigWin(i);
  const [la, lb] = liveWin(i);
  const restyle = useSeg(p, ra, rb);
  const trig = useSeg(p, ta, tb);
  const live = useSeg(p, la, lb);
  const fire = useRing(p, tb - 0.004, tb + 0.024, 0.05);
  const liveRing = useRing(p, la, lb + 0.006, 0.06);
  return (
    <motion.div style={frame} className="absolute">
      <motion.i aria-hidden style={fire} className={`${RING} border-accent`} />
      <motion.i aria-hidden style={liveRing} className={`${RING} border-mint`} />
      <div className="absolute inset-0 overflow-hidden rounded-lg border border-line-strong bg-bg">
        <WipeSwap
          t={restyle}
          className="absolute inset-0"
          a={<StockFace flow={flow} />}
          b={
            <div className="absolute inset-0 flex flex-col bg-surface-2">
              <Band flow={flow} live={live}>
                {extras?.band}
              </Band>
              <Zone flow={flow} i={i} trig={trig} />
              {extras?.body}
            </div>
          }
        />
        {extras?.overlay}
      </div>
      <motion.i aria-hidden style={{ opacity: live }} className="pointer-events-none absolute inset-0 rounded-lg border border-mint" />
    </motion.div>
  );
}
