import type { ReactElement } from "react";

/* The five generated images, drawn as flat duotone SVG in a 90 by 160 frame. The bottom band stays empty so a caption can sit
   there. Only theme tokens are used. */

const tint = (c: string, n: number) => `color-mix(in oklab, var(--color-${c}) ${n}%, transparent)`;
const INK = "var(--color-fg)";
const WALL = "var(--color-surface-1)";
const FLOOR = "var(--color-surface-2)";
const STROKE = { fill: "none", stroke: INK, strokeWidth: 1.4, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const CLOCK_HANDS = "M0 0L-3.6 6.2M0 0V-9";
const RAYS = [-70, -35, 0, 35, 70] as const;
const STARS: readonly (readonly [number, number, number])[] = [
  [16, 46, 1.5],
  [40, 34, 1.1],
  [80, 88, 1.2],
  [22, 92, 1],
];
const MOON = "M63.12 45.32A13 13 0 1 0 78.68 60.88A11 11 0 0 1 63.12 45.32Z";
const HEART = "M0 5C-9 -1 -6 -8 0 -3.5C6 -8 9 -1 0 5Z";

function Sunrise() {
  return (
    <g>
      <rect width="90" height="160" fill={WALL} />
      <circle cx="45" cy="86" r="19" fill={tint("sun", 60)} />
      {RAYS.map((a) => (
        <path key={a} d="M0 -26V-32" transform={`translate(45 86) rotate(${a})`} stroke={tint("sun", 70)} strokeWidth="1.6" strokeLinecap="round" />
      ))}
      <rect y="92" width="90" height="68" fill={FLOOR} />
      <path d="M0 92H90" stroke="var(--color-line-strong)" strokeWidth="1" />
      <g {...STROKE}>
        <rect x="13" y="94" width="5" height="26" rx="1.5" fill={tint("sky", 40)} />
        <rect x="16" y="106" width="60" height="10" rx="2" fill={tint("sky", 50)} />
        <rect x="21" y="99" width="16" height="7" rx="3.5" fill={INK} fillOpacity="0.85" />
        <path d="M22 116V122M70 116V122" />
      </g>
    </g>
  );
}

function Window() {
  return (
    <g>
      <rect width="90" height="160" fill={WALL} />
      <rect y="112" width="90" height="48" fill={FLOOR} />
      <path d="M26 100L64 100L86 142L34 142Z" fill={tint("sun", 26)} />
      <rect x="26" y="52" width="38" height="48" rx="3" fill={tint("sky", 42)} stroke={INK} strokeWidth="1.6" />
      <circle cx="55" cy="63" r="5.4" fill={tint("sun", 85)} />
      <g {...STROKE}>
        <path d="M45 52V100M26 76H64" />
      </g>
    </g>
  );
}

function Hands({ x, y, k }: { x: number; y: number; k: number }) {
  return <path d={CLOCK_HANDS} transform={`translate(${x} ${y}) scale(${k})`} {...STROKE} />;
}

function Alarm() {
  return (
    <g>
      <rect width="90" height="160" fill={WALL} />
      <g {...STROKE} strokeWidth="1.1" opacity="0.55">
        <circle cx="16" cy="110" r="8" fill={tint("sun", 20)} />
        <circle cx="74" cy="110" r="8" fill={tint("sun", 20)} />
        <Hands x={16} y={110} k={0.75} />
        <Hands x={74} y={110} k={0.75} />
      </g>
      <g {...STROKE}>
        <circle cx="29" cy="58" r="6.5" fill={tint("accent", 78)} />
        <circle cx="61" cy="58" r="6.5" fill={tint("accent", 78)} />
        <path d="M33 104L28 112M57 104L62 112" />
        <circle cx="45" cy="82" r="23" fill={tint("sun", 55)} />
        <path d="M45 62V66M45 98V102M25 82H29M61 82H65" />
        <Hands x={45} y={82} k={1.6} />
      </g>
      <circle cx="45" cy="82" r="1.8" fill={INK} />
    </g>
  );
}

function Lamp() {
  return (
    <g>
      <rect width="90" height="160" fill={WALL} />
      {STARS.map(([x, y, r]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill={INK} fillOpacity="0.8" />
      ))}
      <path d={MOON} fill={tint("sun", 78)} />
      <ellipse cx="38" cy="86" rx="26" ry="18" fill={tint("sun", 16)} />
      <rect y="116" width="90" height="44" fill={FLOOR} />
      <g {...STROKE}>
        <path d="M38 114V88" />
        <path d="M28 88L48 88L43 68L33 68Z" fill={tint("sun", 62)} />
        <ellipse cx="38" cy="114" rx="9" ry="2.6" fill={tint("sky", 40)} />
        <path d="M8 116H82" />
      </g>
    </g>
  );
}

function Follow() {
  return (
    <g>
      <rect width="90" height="160" fill={WALL} />
      <rect width="90" height="160" fill={tint("mint", 14)} />
      <circle cx="45" cy="82" r="35" fill="none" stroke={tint("accent", 30)} strokeWidth="1.2" />
      <circle cx="45" cy="82" r="27" fill="none" stroke={tint("accent", 55)} strokeWidth="1.4" />
      <circle cx="45" cy="82" r="19" fill={tint("accent", 88)} stroke={INK} strokeWidth="1.6" />
      <path d="M45 72V92M35 82H55" {...STROKE} strokeWidth="3" />
      <path d={HEART} transform="translate(68 52) scale(1.25)" fill={tint("rose", 85)} stroke={INK} strokeWidth="1.2" strokeLinejoin="round" />
    </g>
  );
}

const ART: readonly (() => ReactElement)[] = [Sunrise, Window, Alarm, Lamp, Follow];

export function ArtView({ i, className = "absolute inset-0 h-full w-full" }: { i: number; className?: string }) {
  const Piece = ART[i % ART.length];
  return (
    <svg viewBox="0 0 90 160" preserveAspectRatio="xMidYMid slice" aria-hidden className={className}>
      <Piece />
    </svg>
  );
}

/** A filmstrip: whole frames of the picture at the height of its box, so a clip on the video track never shows a cut off frame.
    The frames share out any width left over, and a single frame gives way when the box is narrower than it. */
export function FilmView({ i, frames }: { i: number; frames: number }) {
  const fit = frames === 1 ? "min-w-0 shrink" : "shrink-0";
  return (
    <div className="absolute inset-0 flex">
      {Array.from({ length: frames }, (_, k) => (
        <span key={k} className={`relative block aspect-[9/16] h-full grow ${fit} overflow-hidden border-r border-line-strong last:border-r-0`}>
          <ArtView i={i} />
        </span>
      ))}
    </div>
  );
}
