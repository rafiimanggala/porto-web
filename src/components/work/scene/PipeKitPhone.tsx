"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, type MotionStyle } from "framer-motion";

/* Generic 9:16 phone frame, no brand: a bezel from theme tokens around a screen that is a size container, so children
   can size themselves with cqw and cqh. Pass MotionValues through `style` to move or scale the whole phone. */

const BEZEL = "calc(var(--pw) * 0.04)";
const OUTER_RADIUS = "calc(var(--pw) * 0.15)";
const SCREEN_RADIUS = "calc(var(--pw) * 0.115)";

type PipePhoneProps = {
  /** Outer width: px number or any CSS length. Height follows 9:16. Default 132. */
  width?: number | string;
  children?: ReactNode;
  className?: string;
  style?: MotionStyle;
};

export function PipePhone({ width = 132, children, className = "", style }: PipePhoneProps) {
  const vars = { ["--pw" as string]: typeof width === "number" ? `${width}px` : width } as CSSProperties;
  return (
    <motion.div
      style={{ ...vars, width: "var(--pw)", padding: BEZEL, borderRadius: OUTER_RADIUS, ...style }}
      className={`relative shrink-0 border border-line-strong bg-surface-2 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] ${className}`}
    >
      <div className="relative aspect-[9/16] w-full overflow-hidden bg-surface-1 [container-type:size]" style={{ borderRadius: SCREEN_RADIUS }}>
        {children}
        <i aria-hidden className="pointer-events-none absolute left-1/2 top-[1.8%] z-10 h-[1.5%] w-[22%] -translate-x-1/2 rounded-full bg-line-strong" />
      </div>
    </motion.div>
  );
}
