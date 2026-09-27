/* Abstract duotone illustration for the rendered video: sunrise over an empty bed (image job 7f3a). Drawn in a 54 by 96
   box, as a fragment for a parent svg and as a standalone 9:16 svg. */

const INK = "var(--color-fg)";
const tint = (color: string, amount: number, base = "transparent") => `color-mix(in oklab, ${color} ${amount}%, ${base})`;
const LINE = { fill: "none", stroke: INK, strokeWidth: 1.3, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const THUMB_W = 54;
export const THUMB_H = 96;
const HORIZON = 60;
const RAYS = [-52, -26, 0, 26, 52] as const;

function Rays() {
  return (
    <g {...LINE} strokeWidth={1.1}>
      {RAYS.map((deg) => (
        <path key={deg} transform={`translate(27 ${HORIZON}) rotate(${deg})`} d="M0 -22V-28" />
      ))}
    </g>
  );
}

function Bed() {
  return (
    <g {...LINE}>
      <rect x="4" y="53" width="3.6" height="25" rx="1.4" fill={tint("var(--color-rose)", 70)} />
      <rect x="6" y="64" width="42" height="12" rx="2.4" fill={tint("var(--color-mint)", 62)} />
      <rect x="9" y="58.4" width="13" height="7" rx="3" fill={INK} stroke="none" opacity="0.9" />
      <path d="M24 64V76M46 64V76" strokeWidth={1} />
    </g>
  );
}

function CaptionBars() {
  return (
    <g fill={INK} opacity="0.92">
      <rect x="9" y="82" width="36" height="4.6" rx="2.3" />
      <rect x="15" y="88.4" width="24" height="4.6" rx="2.3" />
    </g>
  );
}

export function ThumbArt() {
  return (
    <g>
      <rect width={THUMB_W} height={THUMB_H} fill={tint("var(--color-sky)", 42, "var(--color-surface-1)")} />
      <circle cx="27" cy={HORIZON} r="14" fill={tint("var(--color-sun)", 88)} />
      <Rays />
      <rect y={HORIZON} width={THUMB_W} height={THUMB_H - HORIZON} fill={tint("var(--color-mint)", 22, "var(--color-surface-2)")} />
      <path d={`M0 ${HORIZON}H${THUMB_W}`} {...LINE} />
      <Bed />
      <CaptionBars />
    </g>
  );
}

/** Standalone svg that fills a 9:16 box. */
export function Thumb({ className }: { className?: string }) {
  return (
    <svg viewBox={`0 0 ${THUMB_W} ${THUMB_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      <ThumbArt />
    </svg>
  );
}
