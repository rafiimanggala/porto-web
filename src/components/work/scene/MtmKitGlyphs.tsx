import type { ReactElement } from "react";

/* Duotone glyphs in a 24 by 24 box centred on the origin (viewBox -12 -12 24 24): cream stroke over a tinted fill. */

const INK = "var(--color-fg)";
const tint = (color: string, amount: number) => `color-mix(in oklab, ${color} ${amount}%, transparent)`;
const SUN = tint("var(--color-sun)", 62);
const SKY = tint("var(--color-sky)", 55);
const MINT = tint("var(--color-mint)", 60);
const ROSE = tint("var(--color-rose)", 62);
const ACCENT = tint("var(--color-accent)", 78);
const PAPER = tint(INK, 84);

const BASE = { fill: "none", stroke: INK, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const SOLID = { fill: INK, stroke: "none" } as const;

/* Five point star, tip radius 10.2, inner radius 4.5. */
const STAR_PATH = `M${Array.from({ length: 10 }, (_, i) => {
  const a = ((-90 + i * 36) * Math.PI) / 180;
  const r = i % 2 === 0 ? 10.2 : 4.5;
  return `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a) + 0.6).toFixed(2)}`;
}).join("L")}Z`;

/** Shared by the static lock glyph and the animated lock of the cart button. */
export const LOCK_SHACKLE_D = "M-4 -1V-4.6A4 4 0 0 1 4 -4.6V-1";
export const LOCK_BODY: ReactElement = (
  <>
    <rect x="-7.2" y="-1" width="14.4" height="11.6" rx="2.6" fill={SUN} />
    <circle cy="3.8" r="1.7" {...SOLID} />
    <path d="M0 4.6V7.2" strokeWidth="2.2" />
  </>
);

const FRAGMENTS = {
  shirt: (
    <g {...BASE}>
      <path d="M-4.4 -9.6L-10.2 -6.8L-11.4 -1.4L-7.8 0.2L-6.9 -2.2V9.8H6.9V-2.2L7.8 0.2L11.4 -1.4L10.2 -6.8L4.4 -9.6L0 -5.8Z" fill={SKY} />
      <path d="M-4.4 -9.6L0 -5.8L-2.6 -3L-6 -6.4ZM4.4 -9.6L0 -5.8L2.6 -3L6 -6.4Z" fill={PAPER} />
      <path d="M0 -0.4H0.01M0 3.2H0.01M0 6.8H0.01" strokeWidth="2.2" />
    </g>
  ),
  suit: (
    <g {...BASE}>
      <path d="M-4.6 -9.8L-9.8 -7L-10.6 9.6H-7.4V10.4H7.4V9.6H10.6L9.8 -7L4.6 -9.8L0 2Z" fill={SKY} />
      <path d="M-4.6 -9.8H4.6L0 2Z" fill={PAPER} strokeWidth="1.5" />
      <path d="M0 -7.4L-1.4 -4.6L0 -0.6L1.4 -4.6Z" fill={ACCENT} strokeWidth="1.3" />
      <path d="M-7.4 -4.4V9.6M7.4 -4.4V9.6M0 6H0.01" />
    </g>
  ),
  dress: (
    <g {...BASE}>
      <path d="M-4.2 -10.4L-3.2 -5.2L-4.9 -1L-10.2 10H10.2L4.9 -1L3.2 -5.2L4.2 -10.4H1.9Q0 -7 -1.9 -10.4Z" fill={ROSE} />
      <path d="M-4.9 -1H4.9M-1.6 1.4L-3.6 10M1.6 1.4L3.6 10" />
    </g>
  ),
  tape: (
    <g {...BASE}>
      <circle cx="-3" cy="-2.2" r="7.8" fill={SUN} />
      <circle cx="-3" cy="-2.2" r="2.7" />
      <path d="M-3 5.6H10.8V10.6H-3Z" fill={PAPER} />
      <path d="M1.8 5.6V8.6M4.9 5.6V9.8M8 5.6V8.6" strokeWidth="1.6" />
    </g>
  ),
  ruler: (
    <g {...BASE} transform="rotate(-32)">
      <rect x="-11" y="-4.6" width="22" height="9.2" rx="1.8" fill={MINT} />
      <path d="M-7.4 -4.6V-0.6M-3.7 -4.6V-2M0 -4.6V-0.6M3.7 -4.6V-2M7.4 -4.6V-0.6" strokeWidth="1.5" />
    </g>
  ),
  pencil: (
    <g {...BASE} transform="rotate(45)">
      <rect x="-3.2" y="-7.4" width="6.4" height="11.6" fill={SUN} />
      <path d="M-3.2 4.2H3.2L0 10.6Z" fill={PAPER} />
      <path d="M-1.1 8.4H1.1L0 10.6Z" {...SOLID} />
      <path d="M-3.2 -10.4Q-3.2 -12 0 -12Q3.2 -12 3.2 -10.4V-7.4H-3.2Z" fill={ROSE} />
    </g>
  ),
  clone: (
    <g {...BASE}>
      <path d="M-3.4 3.2H-7Q-10.2 3.2 -10.2 0V-7Q-10.2 -10.2 -7 -10.2H0Q3.2 -10.2 3.2 -7V-3.6" />
      <rect x="-3.2" y="-3.2" width="13.6" height="13.6" rx="3.2" fill={MINT} />
      <path d="M3.6 0.8V6.4M0.8 3.6H6.4" strokeWidth="2.2" />
    </g>
  ),
  lock: (
    <g {...BASE}>
      <path d={LOCK_SHACKLE_D} />
      {LOCK_BODY}
    </g>
  ),
  unlock: (
    <g {...BASE}>
      <path d="M-4 -3.4V-7.4A4 4 0 0 1 4 -7.4V-5.6" />
      <rect x="-7.2" y="-1" width="14.4" height="11.6" rx="2.6" fill={MINT} />
      <circle cy="3.8" r="1.7" {...SOLID} />
      <path d="M0 4.6V7.2" strokeWidth="2.2" />
    </g>
  ),
  cart: (
    <g {...BASE}>
      <path d="M-7.2 -5.6H10.6L7.8 1.4H-5.6Z" fill={ACCENT} />
      <path d="M-11 -9.4H-8L-5.2 4.4H7.6" />
      <circle cx="-2.8" cy="8.6" r="1.9" {...SOLID} />
      <circle cx="5.6" cy="8.6" r="1.9" {...SOLID} />
    </g>
  ),
  server: (
    <g {...BASE}>
      <rect x="-9.6" y="-10.4" width="19.2" height="6" rx="1.8" fill={SKY} />
      <rect x="-9.6" y="-3" width="19.2" height="6" rx="1.8" fill={SKY} />
      <rect x="-9.6" y="4.4" width="19.2" height="6" rx="1.8" fill={SKY} />
      <circle cx="-5.6" cy="-7.4" r="1.3" fill={MINT} strokeWidth="1.2" />
      <circle cx="-5.6" cy="0" r="1.3" fill={MINT} strokeWidth="1.2" />
      <circle cx="-5.6" cy="7.4" r="1.3" fill={MINT} strokeWidth="1.2" />
      <path d="M-1.4 -7.4H5.6M-1.4 0H5.6M-1.4 7.4H5.6" strokeWidth="1.4" />
    </g>
  ),
  api: (
    <g {...BASE}>
      <path d="M-10.6 -4.4H3.6" />
      <path d="M2.8 -8.8L10 -4.4L2.8 0Z" fill={MINT} />
      <path d="M10.6 4.4H-3.6" />
      <path d="M-2.8 0L-10 4.4L-2.8 8.8Z" fill={SUN} />
    </g>
  ),
  code: (
    <g {...BASE}>
      <rect x="-10.6" y="-8.2" width="21.2" height="16.4" rx="3.2" fill={SKY} />
      <path d="M-4.2 -3.4L-7.2 0L-4.2 3.4M4.2 -3.4L7.2 0L4.2 3.4M1.6 -4.8L-1.6 4.8" />
    </g>
  ),
  layers: (
    <g {...BASE}>
      <path d="M0 -10L10.6 -4.6L0 0.8L-10.6 -4.6Z" fill={SKY} />
      <path d="M-10.6 0L0 5.4L10.6 0" />
      <path d="M-10.6 4.8L0 10.2L10.6 4.8" />
    </g>
  ),
  warning: (
    <g {...BASE}>
      <path d="M0 -9.6L10.6 8.6H-10.6Z" fill={SUN} strokeWidth="2.2" />
      <path d="M0 -3V2.8M0 5.6H0.01" />
    </g>
  ),
  check: (
    <g {...BASE}>
      <circle r="9.6" fill={MINT} />
      <path d="M-4.4 0.4L-1.4 3.4L4.6 -3.2" strokeWidth="2.2" />
    </g>
  ),
  cross: (
    <g {...BASE}>
      <circle r="9.6" fill={ROSE} />
      <path d="M-3.6 -3.6L3.6 3.6M3.6 -3.6L-3.6 3.6" strokeWidth="2.2" />
    </g>
  ),
  mail: (
    <g {...BASE}>
      <rect x="-10.6" y="-7.6" width="21.2" height="15.2" rx="2.8" fill={SKY} />
      <path d="M-9.4 -5.8L0 2L9.4 -5.8" />
    </g>
  ),
  "mail-open": (
    <g {...BASE}>
      <path d="M-10.6 -1.4L0 -9.8L10.6 -1.4V7Q10.6 9.2 8.4 9.2H-8.4Q-10.6 9.2 -10.6 7Z" fill={SKY} />
      <path d="M-6.4 -5.4H6.4V1L0 5.2L-6.4 1Z" fill={PAPER} strokeWidth="1.5" />
      <path d="M-3.4 -2.4H3.4M-3.4 0H1.4" strokeWidth="1.4" />
      <path d="M-10.4 -1.2L0 5.4L10.4 -1.2" />
    </g>
  ),
  tag: (
    <g {...BASE}>
      <path d="M-9.6 -9.6H0.4L9.6 -0.4Q10.6 0.6 9.6 1.6L1.6 9.6Q0.6 10.6 -0.4 9.6L-9.6 0.4Z" fill={SUN} />
      <circle cx="-5.2" cy="-5.2" r="1.8" />
      <path d="M-1.6 -1.6L3.4 3.4" strokeWidth="1.5" />
    </g>
  ),
  archive: (
    <g {...BASE}>
      <rect x="-10.6" y="-9.8" width="21.2" height="5.4" rx="1.8" fill={SUN} />
      <path d="M-9 -4.4V8.4Q-9 10.2 -7.2 10.2H7.2Q9 10.2 9 8.4V-4.4" fill={SUN} />
      <path d="M-3 0.8H3" strokeWidth="2.4" />
    </g>
  ),
  store: (
    <g {...BASE}>
      <path d="M-9 -3.4V9.8H9V-3.4" fill={SUN} />
      <path d="M-9.8 -10H9.8L10.8 -3.6A2.7 2.7 0 0 1 5.4 -3.6A2.7 2.7 0 0 1 0 -3.6A2.7 2.7 0 0 1 -5.4 -3.6A2.7 2.7 0 0 1 -10.8 -3.6Z" fill={ACCENT} />
      <rect x="-2.6" y="2.6" width="5.2" height="7.2" rx="0.8" />
    </g>
  ),
  user: (
    <g {...BASE}>
      <circle cy="-4.8" r="4.2" fill={SUN} />
      <path d="M-8.8 10V8.4A5.6 5.6 0 0 1 -3.2 2.8H3.2A5.6 5.6 0 0 1 8.8 8.4V10Z" fill={SKY} />
    </g>
  ),
  filter: (
    <g {...BASE}>
      <path d="M-10 -9.6H10L3.2 -0.8V8L-3.2 10.4V-0.8Z" fill={SKY} />
    </g>
  ),
  save: (
    <g {...BASE}>
      <path d="M-9.6 -6.6Q-9.6 -9.6 -6.6 -9.6H6L9.6 -6V6.6Q9.6 9.6 6.6 9.6H-6.6Q-9.6 9.6 -9.6 6.6Z" fill={SKY} />
      <rect x="-5.4" y="-9.6" width="8.4" height="5.2" fill={PAPER} strokeWidth="1.5" />
      <rect x="-6.2" y="0.6" width="12.4" height="9" rx="1" fill={PAPER} strokeWidth="1.5" />
    </g>
  ),
  eye: (
    <g {...BASE}>
      <path d="M-10.6 0Q0 -11.6 10.6 0Q0 11.6 -10.6 0Z" fill={SKY} />
      <circle r="3.8" fill={SUN} />
      <circle r="1.4" {...SOLID} />
    </g>
  ),
  truck: (
    <g {...BASE}>
      <rect x="-10.8" y="-7.8" width="12.8" height="11.8" rx="1.6" fill={SUN} />
      <path d="M2 -3.4H6.2L10.8 1.2V4H2Z" fill={SKY} />
      <circle cx="-5.8" cy="6.6" r="2.4" fill={PAPER} />
      <circle cx="6.2" cy="6.6" r="2.4" fill={PAPER} />
    </g>
  ),
  box: (
    <g {...BASE}>
      <path d="M0 -10.2L9.6 -5V5.2L0 10.2L-9.6 5.2V-5Z" fill={ACCENT} />
      <path d="M-9.6 -5L0 0L9.6 -5M0 0V10.2" />
      <path d="M-4.8 -7.6L4.8 -2.6" strokeWidth="1.4" />
    </g>
  ),
  bag: (
    <g {...BASE}>
      <path d="M-8 -5.4H8L9.4 8.6Q9.6 10.4 7.8 10.4H-7.8Q-9.6 10.4 -9.4 8.6Z" fill={MINT} />
      <path d="M-3.6 -3.4V-6.4A3.6 3.6 0 0 1 3.6 -6.4V-3.4" />
    </g>
  ),
  calendar: (
    <g {...BASE}>
      <rect x="-9.8" y="-8" width="19.6" height="18" rx="3.2" fill={SKY} />
      <path d="M-9.8 -2.4H9.8M-4.6 -10.8V-5.8M4.6 -10.8V-5.8" />
      <circle cx="-4.6" cy="2.4" r="1" {...SOLID} />
      <circle cx="0" cy="2.4" r="1" {...SOLID} />
      <circle cx="-4.6" cy="6.6" r="1" {...SOLID} />
      <circle cx="4.6" cy="6.4" r="2.1" fill={ACCENT} strokeWidth="1.2" />
    </g>
  ),
  key: (
    <g {...BASE} transform="rotate(-45)">
      <circle cy="-6" r="4.6" fill={SUN} />
      <circle cy="-6" r="1.5" {...SOLID} />
      <path d="M0 -1.4V10.4M0 5.6H3.8M0 8.6H2.8" />
    </g>
  ),
  bell: (
    <g {...BASE}>
      <path d="M-7 6.4C-5.6 5 -5.2 2.6 -5.2 -1.4A5.2 5.2 0 0 1 5.2 -1.4C5.2 2.6 5.6 5 7 6.4Z" fill={SUN} />
      <path d="M-8.8 6.4H8.8M0 -6.6V-9.6" />
      <circle cy="9.4" r="1.6" {...SOLID} />
    </g>
  ),
  receipt: (
    <g {...BASE}>
      <path d="M-7.4 -10.4H7.4V10.4L4.9 8.4L2.4 10.4L0 8.4L-2.4 10.4L-4.9 8.4L-7.4 10.4Z" fill={SKY} />
      <path d="M-3.6 -5.8H3.6M-3.6 -2H3.6M-3.6 1.8H0.6" strokeWidth="1.5" />
    </g>
  ),
  star: (
    <g {...BASE}>
      <path d={STAR_PATH} fill={SUN} />
    </g>
  ),
} satisfies Record<string, ReactElement>;

export type MtmGlyphName = keyof typeof FRAGMENTS;

/** Every glyph name, in display order. */
export const MTM_GLYPH_NAMES = Object.keys(FRAGMENTS) as readonly MtmGlyphName[];

/** Raw <g> fragments in the -12..12 box, for use inside a parent svg (see MtmGlyphG). */
export const MTM_FRAGMENTS: Readonly<Record<MtmGlyphName, ReactElement>> = FRAGMENTS;

/** Standalone glyph with its own svg. `size` is px (number) or any CSS length (string). */
export function MtmGlyph({ name, size = 24, className }: { name: MtmGlyphName; size?: number | string; className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden className={className} style={{ width: size, height: size }}>
      {FRAGMENTS[name]}
    </svg>
  );
}

/** Glyph placed inside a parent svg: centred on (x, y), `size` user units wide. */
export function MtmGlyphG({ name, x = 0, y = 0, size = 24 }: { name: MtmGlyphName; x?: number; y?: number; size?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size / 24})`}>{FRAGMENTS[name]}</g>;
}
