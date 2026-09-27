"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, type MotionStyle } from "framer-motion";
import { MONO } from "./HealthSceneParts";
import { FH, FW } from "./PipeRenderData";

/* One fixed 358 by 430 design frame, scaled up as a whole and centred in the visual box. Positions are percentages of the
   frame, sizes that must scale use unit(n), and text keeps a real 10.5px minimum. */

export const pctX = (x: number) => `${((x / FW) * 100).toFixed(3)}%`;
export const pctY = (y: number) => `${((y / FH) * 100).toFixed(3)}%`;
export const unit = (n: number) => `calc(var(--u) * ${n})`;

export const boxStyle = (x: number, y: number, w: number, h: number): CSSProperties => ({ left: pctX(x), top: pctY(y), width: pctX(w), height: pctY(h) });
export const pointPct = (x: number, y: number): readonly [number, number] => [(x / FW) * 100, (y / FH) * 100];

/** Real 10.5px on a phone, growing with the frame up to 13px. Apply it below the frame: the size reads the frame as its container. */
export const TEXT = `${MONO} text-[length:clamp(10.5px,calc(var(--u)*10),13px)] leading-[1.2]`;
export const BIG_TEXT = "text-[length:clamp(12px,calc(var(--u)*12),16px)] leading-[1.25]";

export function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 grid place-items-center [container-type:size]">
      <div
        className="relative [container-type:size] [--u:calc(100cqw/358)]"
        style={{ width: `min(100cqw, calc(100cqh * ${FW} / ${FH}))`, aspectRatio: `${FW} / ${FH}` }}
      >
        <div className={`absolute inset-0 ${TEXT}`}>{children}</div>
      </div>
    </div>
  );
}

/** A full frame layer, so wipes can clip whole groups and coordinates stay shared. */
export function Layer({ children, style, className = "" }: { children: ReactNode; style?: MotionStyle; className?: string }) {
  return (
    <motion.div style={style} className={`absolute inset-0 ${className}`}>
      {children}
    </motion.div>
  );
}
