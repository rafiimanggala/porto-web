"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { clamp01, keepRight, pct, revealLeft } from "./MtmDebugSceneMath";

/* Small parts shared by the four pages. Every one is a pure function of the MotionValues it receives. */

export const LABEL = `${MONO} text-[10px] uppercase tracking-[0.12em] text-mute`;
/* Primary text (code, hex, file names) is 11px so it stays readable on a narrow panel. Labels and tags stay at 10px. */
export const CODE = `${MONO} text-[11px] leading-[15px]`;
/* The lookup line of the menu page is the widest string of the panel, so it keeps the smaller size. */
export const CODE_SM = `${MONO} text-[10px] leading-[13px]`;
export const PANEL_SHADOW = "shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)]";

const EDGE = "pointer-events-none absolute inset-y-[-1px] z-10 w-0.5 -translate-x-1/2 rounded-full bg-accent";

/** Text typed from the left by a clip, with an accent caret at the moving edge. */
export function Typed({ t, children, className = "" }: { t: MV; children: ReactNode; className?: string }) {
  const clip = useTransform(t, revealLeft);
  const left = useTransform(t, (v) => pct(clamp01(v) * 100));
  const caret = useTransform(t, [0, 0.02, 0.98, 1], [0, 1, 1, 0]);
  return (
    <span className={`relative inline-block whitespace-pre ${className}`}>
      <motion.span style={{ clipPath: clip }} className="block">
        {children}
      </motion.span>
      <motion.i aria-hidden style={{ left, opacity: caret }} className={EDGE} />
    </span>
  );
}

/** Two lines of one fixed height, rolled by position: `t` 0 shows `a`, 1 shows `b`. */
export function Roll({ t, a, b, h, align = "start", className = "" }: { t: MV; a: ReactNode; b: ReactNode; h: number; align?: "start" | "center" | "end"; className?: string }) {
  const y = useTransform(t, (v) => pct(-clamp01(v) * 50));
  const line = { height: h, lineHeight: `${h}px` };
  const justify = { start: "justify-start", center: "justify-center", end: "justify-end" }[align];
  return (
    <span style={{ height: h }} className={`block overflow-hidden ${className}`}>
      <motion.span style={{ y }} className="flex flex-col">
        <span style={line} className={`flex items-center whitespace-nowrap ${justify}`}>
          {a}
        </span>
        <span style={line} className={`flex items-center whitespace-nowrap ${justify}`}>
          {b}
        </span>
      </motion.span>
    </span>
  );
}

type Tone = string | MotionValue<string>;

/** A vertical wire that draws downward with an arrowhead at its end. It fills the height of its parent. */
export function VWire({ t, color = "var(--color-accent)", className = "" }: { t: MV; color?: Tone; className?: string }) {
  const head = useTransform(t, [0.8, 1], [0, 1]);
  return (
    <div aria-hidden className={`relative w-0.5 ${className}`}>
      <i className="absolute inset-0 rounded-full bg-line-strong" />
      <motion.i style={{ scaleY: t, background: color }} className="absolute inset-0 origin-top rounded-full" />
      <motion.i
        style={{ opacity: head, background: color }}
        className="absolute -bottom-px left-1/2 h-1.5 w-2.5 -translate-x-1/2 [clip-path:polygon(0_0,100%_0,50%_100%)]"
      />
    </div>
  );
}

/** A dot riding a wire: `t` 0 to 1 moves it down the parent's height, it fades in and out at the ends. */
export function Packet({ t, color = "var(--color-accent)", className = "" }: { t: MV; color?: Tone; className?: string }) {
  const top = useTransform(t, (v) => pct(clamp01(v) * 100));
  const opacity = useTransform(t, [0, 0.08, 0.92, 1], [0, 1, 1, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ top, opacity, background: color }}
      className={`pointer-events-none absolute z-10 -ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full shadow-[0_0_0_2px_var(--color-surface-1)] ${className}`}
    />
  );
}

/** Diagonal hatch: the look of an empty or missing thing. */
export const HATCH = "[background-image:repeating-linear-gradient(135deg,transparent_0_5px,var(--color-line-strong)_5px_6px)]";

/** Waiting for a read: a hatched bar of `width` that the text typed over it eats from the left. */
export function Pending({ t, width }: { t: MV; width: string }) {
  const clip = useTransform(t, keepRight);
  return <motion.i aria-hidden style={{ clipPath: clip, width }} className={`absolute left-0 top-1/2 h-[9px] -translate-y-1/2 rounded-sm ${HATCH}`} />;
}

/** A small status tag: filled with a tone, dark ink on top. */
export function Tag({ tone, children, className = "" }: { tone: "rose" | "mint" | "sun" | "accent"; children: ReactNode; className?: string }) {
  const fill = { rose: "bg-rose text-pastel-ink", mint: "bg-mint text-pastel-ink", sun: "bg-sun text-pastel-ink", accent: "bg-accent text-fg" }[tone];
  return <span className={`${MONO} inline-block rounded-[3px] px-1 text-[10px] leading-[14px] ${fill} ${className}`}>{children}</span>;
}
