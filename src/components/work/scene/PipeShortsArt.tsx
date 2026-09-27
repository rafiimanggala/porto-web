"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";

/* The five generated slide images, drawn as abstract duotone illustrations in a 90 by 160 (9:16) box: a background, a
   middle layer and a foreground that drift at different rates as `move` (0..1, the clip playing) runs. The top right
   corner (x 57 to 85, y 4 to 32) is kept free of focal shapes: the status badge sits there. */

const INK = "var(--color-fg)";
const tint = (color: string, amount: number) => `color-mix(in oklab, ${color} ${amount}%, transparent)`;
const wash = (color: string, amount: number) => `color-mix(in oklab, ${color} ${amount}%, var(--color-surface-1))`;
const SUN = tint("var(--color-sun)", 62);
const SKY = tint("var(--color-sky)", 55);
const MINT = tint("var(--color-mint)", 60);
const ACCENT = tint("var(--color-accent)", 78);
const TABLE = "var(--color-surface-2)";

const LINE = { fill: "none", stroke: INK, strokeWidth: 2.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const FULL = { x: -12, y: -12, width: 114, height: 184 } as const;
const GROUND = { x: -12, width: 114 } as const;

type Layers = { readonly bg: ReactNode; readonly mid: ReactNode; readonly fg: ReactNode };

const LAMP: Layers = {
  bg: (
    <g>
      <rect {...FULL} fill={wash("var(--color-sky)", 22)} />
      <circle cx="22" cy="34" r="9" fill={SUN} stroke={INK} strokeWidth="2.4" />
      <circle cx="26.5" cy="30.5" r="8" fill={wash("var(--color-sky)", 22)} />
      <path d="M48 16h.01M76 50h.01M42 46h.01M10 60h.01" {...LINE} strokeWidth="3" />
    </g>
  ),
  mid: (
    <g>
      <path d="M33 92H57L88 128H2Z" fill={tint("var(--color-sun)", 26)} />
      <rect {...GROUND} y="128" height="44" fill={TABLE} />
      <path d="M-12 128H102" {...LINE} />
    </g>
  ),
  fg: (
    <g {...LINE}>
      <ellipse cx="45" cy="125" rx="13" ry="3.6" fill={TABLE} />
      <path d="M45 122V96" />
      <path d="M36 72H54L63 95H27Z" fill={SUN} />
    </g>
  ),
};

const PHONE: Layers = {
  bg: (
    <g>
      <rect {...FULL} fill={wash("var(--color-sun)", 14)} />
      <path d="M-12 40H102M-12 80H102M-12 120H102" stroke={INK} strokeOpacity="0.14" strokeWidth="1.6" />
    </g>
  ),
  mid: <rect x="29" y="46" width="36" height="78" rx="7" fill={tint(INK, 16)} />,
  fg: (
    <g {...LINE}>
      <rect x="26" y="40" width="36" height="78" rx="7" fill={TABLE} />
      <rect x="30" y="45" width="15" height="15" rx="4" fill={SKY} />
      <circle cx="35" cy="50" r="2.3" fill={INK} stroke="none" />
      <circle cx="40.5" cy="55" r="2.3" fill={INK} stroke="none" />
      <path d="M50 110H58" />
    </g>
  ),
};

const MUG: Layers = {
  bg: <rect {...FULL} fill={wash("var(--color-sun)", 16)} />,
  mid: (
    <g>
      <rect {...GROUND} y="124" height="48" fill={TABLE} />
      <path d="M-12 124H102" {...LINE} />
      <path d="M37 76Q32 66 37 58Q42 50 37 42M46 72Q41 62 46 52Q51 42 46 34M55 76Q50 68 55 60Q60 52 55 46" {...LINE} strokeOpacity="0.85" />
    </g>
  ),
  fg: (
    <g {...LINE}>
      <ellipse cx="45" cy="124" rx="24" ry="4.4" fill={TABLE} />
      <path d="M62 91H68Q77 91 77 100Q77 109 68 109H62" />
      <path d="M27 82H63V108Q63 122 49 122H41Q27 122 27 108Z" fill={ACCENT} />
      <ellipse cx="45" cy="82" rx="18" ry="3.6" fill={wash("var(--color-accent)", 30)} />
    </g>
  ),
};

const NOTE: Layers = {
  bg: <rect {...FULL} fill={wash("var(--color-mint)", 18)} />,
  mid: <rect x="26" y="58" width="42" height="64" rx="4" fill={tint(INK, 14)} transform="rotate(-6 45 90)" />,
  fg: (
    <g {...LINE}>
      <g transform="rotate(-6 45 86)">
        <rect x="24" y="52" width="42" height="64" rx="4" fill={MINT} />
        <path d="M32 68H58M32 77H58M32 86H48" strokeWidth="1.8" />
        <path d="M32 98l3.4 3.4L42 94" stroke="var(--color-accent)" strokeWidth="2.6" />
        {[60, 70, 80, 90, 100, 110].map((y) => (
          <circle key={y} cx="24" cy={y} r="2.2" fill="var(--color-surface-1)" />
        ))}
      </g>
      <g transform="translate(58 96) rotate(16)">
        <rect x="-3.6" y="-50" width="7.2" height="46" rx="3.6" fill={ACCENT} />
        <path d="M-3.6 -4H3.6L0 8Z" fill={INK} strokeWidth="1.6" />
      </g>
    </g>
  ),
};

const CLOCK_TICKS = [0, 90, 180, 270].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return [Math.sin(rad), -Math.cos(rad)] as const;
});

const ALARM: Layers = {
  bg: <rect {...FULL} fill={wash("var(--color-sky)", 20)} />,
  mid: (
    <g>
      <rect {...GROUND} y="132" height="40" fill={TABLE} />
      <path d="M-12 132H102" {...LINE} />
    </g>
  ),
  fg: (
    <g {...LINE}>
      <path d="M33 108L27 124M57 108L63 124" />
      <circle cx="28" cy="58" r="8" fill={SKY} />
      <circle cx="62" cy="58" r="8" fill={SKY} />
      <path d="M45 58V64" />
      <circle cx="45" cy="86" r="28" fill={SUN} />
      <circle cx="45" cy="86" r="22" fill={wash("var(--color-sun)", 18)} strokeWidth="1.6" />
      {CLOCK_TICKS.map(([dx, dy]) => (
        <path key={`${dx}${dy}`} d={`M${45 + dx * 17} ${86 + dy * 17}L${45 + dx * 20} ${86 + dy * 20}`} />
      ))}
      <path d="M45 86L36.5 77.5" strokeWidth="3.2" />
      <path d="M45 86V104" strokeWidth="2.4" />
      <circle cx="45" cy="86" r="2" fill={INK} stroke="none" />
    </g>
  ),
};

const LAYERS: readonly Layers[] = [LAMP, PHONE, MUG, NOTE, ALARM];

type ParaProps = { move: MV; x?: number; y?: number; s?: number; children: ReactNode };

/** Drifts by `x` and `y` units and scales by `s` across the whole clip, centred on the middle of the clip. The amounts are
   the largest that keep every subject and the full bleed background inside the 90 by 160 frame at both ends of the clip. */
function Para({ move, x = 0, y = 0, s = 0, children }: ParaProps) {
  const tx = useTransform(move, (v) => (v - 0.5) * x);
  const ty = useTransform(move, (v) => (v - 0.5) * y);
  const ts = useTransform(move, (v) => 1 + (v - 0.5) * s);
  return <motion.g style={{ x: tx, y: ty, scale: ts }}>{children}</motion.g>;
}

type SlideArtProps = { kind: number; move: MV; className?: string };

export function SlideArt({ kind, move, className = "block h-full w-full" }: SlideArtProps) {
  const layers = LAYERS[kind];
  return (
    <svg viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      <Para move={move} s={0.2}>
        {layers.bg}
      </Para>
      <Para move={move} x={14} y={-4}>
        {layers.mid}
      </Para>
      <Para move={move} x={-18} s={0.14}>
        {layers.fg}
      </Para>
    </svg>
  );
}
