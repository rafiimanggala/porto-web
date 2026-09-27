import type { ReactElement } from "react";

/* Duotone glyphs for the pipeline scenes, in the same house style as the other scene icon sets: a cream stroke over a
   tinted fill, chunky enough to read at 24px. Fragments are drawn in a 24 by 24 box centred on the origin
   (viewBox "-12 -12 24 24") so they can be dropped into any parent svg. */

const INK = "var(--color-fg)";
const tint = (color: string, amount: number) => `color-mix(in oklab, ${color} ${amount}%, transparent)`;
const SUN = tint("var(--color-sun)", 62);
const SKY = tint("var(--color-sky)", 55);
const MINT = tint("var(--color-mint)", 60);
const ROSE = tint("var(--color-rose)", 62);
const ACCENT = tint("var(--color-accent)", 78);

const BASE = { fill: "none", stroke: INK, strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const SOLID = { fill: INK, stroke: "none" } as const;

/* Four pointed sparkle centred on (cx, cy) with tip radius r. */
function spark(cx: number, cy: number, r: number) {
  const k = r * 0.24;
  return `M${cx} ${cy - r}Q${cx + k} ${cy - k} ${cx + r} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + r}Q${cx - k} ${cy + k} ${cx - r} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - r}Z`;
}

const WAVE_BARS = [
  [-8.8, 5],
  [-4.4, 12],
  [0, 19],
  [4.4, 9],
  [8.8, 14],
] as const;

const FRAGMENTS = {
  clock: (
    <g {...BASE}>
      <circle r="9.5" fill={SUN} />
      <path d="M0 -5.2V0.6l3.9 2.6" />
    </g>
  ),
  rss: (
    <g {...BASE}>
      <rect x="-9.5" y="-9.5" width="19" height="19" rx="4.5" fill={SKY} />
      <path d="M-4.6 -1.6A6.2 6.2 0 0 1 1.6 4.6M-4.6 -6.3A10.9 10.9 0 0 1 6.3 4.6" />
      <circle cx="-4.6" cy="4.6" r="1.6" {...SOLID} />
    </g>
  ),
  merge: (
    <g {...BASE}>
      <path d="M-8.5 -6.5H-4C0 -6.5 0 0 4 0M-8.5 6.5H-4C0 6.5 0 0 4 0M4 0H9.5M6.4 -2.8L9.5 0L6.4 2.8" />
      <circle cx="-8.5" cy="-6.5" r="2.2" fill={MINT} />
      <circle cx="-8.5" cy="6.5" r="2.2" fill={MINT} />
    </g>
  ),
  code: (
    <g {...BASE}>
      <rect x="-10.5" y="-8" width="21" height="16" rx="3.2" fill={SKY} />
      <path d="M-4.2 -3.4L-7.2 0L-4.2 3.4M4.2 -3.4L7.2 0L4.2 3.4M1.6 -4.6L-1.6 4.6" />
    </g>
  ),
  filter: (
    <g {...BASE}>
      <path d="M-9.5 -8.5H9.5L3 0V7.5L-3 10V0Z" fill={SKY} />
    </g>
  ),
  edit: (
    <g {...BASE}>
      <path d="M-8.5 8.5L-7.6 3.8L3.6 -7.4L7.4 -3.6L-3.8 7.6Z" fill={SUN} />
      <path d="M-8.5 8.5L-7.6 3.8L-3.8 7.6Z" {...SOLID} />
      <path d="M-7.6 3.8L-3.8 7.6M1.4 -5.2L5.2 -1.4" />
    </g>
  ),
  ai: (
    <g {...BASE}>
      <path d={spark(-2.2, 2.2, 8.6)} fill={ACCENT} />
      <path d={spark(6.4, -6.4, 4)} fill={SUN} />
    </g>
  ),
  globe: (
    <g {...BASE}>
      <circle r="9.5" fill={SKY} />
      <ellipse rx="4" ry="9.5" />
      <path d="M-9.5 0H9.5M-8.2 -4.6H8.2M-8.2 4.6H8.2" />
    </g>
  ),
  pause: (
    <g {...BASE}>
      <rect x="-7.8" y="-8.5" width="5.4" height="17" rx="2" fill={SKY} />
      <rect x="2.4" y="-8.5" width="5.4" height="17" rx="2" fill={SKY} />
    </g>
  ),
  branch: (
    <g {...BASE}>
      <path d="M-10 0H-4.5M-4.5 0C-0.5 0 -0.5 -6 3.5 -6H6M-4.5 0C-0.5 0 -0.5 6 3.5 6H6" />
      <circle cx="-4.5" r="1.9" {...SOLID} />
      <circle cx="8" cy="-6" r="2.4" fill={MINT} />
      <circle cx="8" cy="6" r="2.4" fill={ROSE} />
    </g>
  ),
  sheet: (
    <g {...BASE}>
      <rect x="-9" y="-9.5" width="18" height="19" rx="3" fill={MINT} />
      <path d="M-9 -3.2H9M-9 3.2H9M-2.6 -3.2V9.5" />
    </g>
  ),
  aggregate: (
    <g {...BASE}>
      <rect x="-9.5" y="-9.5" width="19" height="19" rx="4.5" fill={SUN} />
      <path d="M4.8 -4.4V-6.2H-4.8L0.2 0L-4.8 6.2H4.8V4.4" />
    </g>
  ),
  loop: (
    <g {...BASE}>
      <circle r="5.6" fill={MINT} stroke="none" />
      <path d="M-7.4 -1.3A7.5 7.5 0 0 1 6.6 -3.4M7.4 1.3A7.5 7.5 0 0 1 -6.6 3.4" strokeWidth="2.2" />
      <path d="M2.4 -5.2L6.8 -3.4L8.1 -8M-2.4 5.2L-6.8 3.4L-8.1 8" strokeWidth="2.2" />
    </g>
  ),
  mic: (
    <g {...BASE}>
      <rect x="-3.6" y="-9.5" width="7.2" height="12.5" rx="3.6" fill={SUN} />
      <path d="M-7 -1.5V0A7 7 0 0 0 7 0V-1.5M0 7V10.2M-3.4 10.2H3.4" />
    </g>
  ),
  speaker: (
    <g {...BASE}>
      <path d="M-10 -3H-6L-1 -7.5V7.5L-6 3H-10Z" fill={SUN} />
      <path d="M3 -3.5A4.5 4.5 0 0 1 3 3.5M6.5 -6.5A9 9 0 0 1 6.5 6.5" />
    </g>
  ),
  waveform: (
    <g {...BASE} strokeWidth="1.4">
      {WAVE_BARS.map(([x, h]) => (
        <rect key={x} x={x - 1.5} y={-h / 2} width="3" height={h} rx="1.5" fill={MINT} />
      ))}
    </g>
  ),
  film: (
    <g {...BASE}>
      <rect x="-9.5" y="-8.5" width="19" height="17" rx="2.5" fill={SUN} />
      <path d="M-5.3 -8.5V8.5M5.3 -8.5V8.5M-9.5 -3H-5.3M-9.5 3H-5.3M5.3 -3H9.5M5.3 3H9.5" />
    </g>
  ),
  image: (
    <g {...BASE}>
      <rect x="-9.5" y="-8.5" width="19" height="17" rx="3" fill={SKY} />
      <circle cx="-3.6" cy="-3" r="1.9" fill={SUN} />
      <path d="M-9 6.3L-3 0.6L1 4.5L4 1.7L9 6" />
    </g>
  ),
  upload: (
    <g {...BASE}>
      <path d="M-6.5 6H6A4.2 4.2 0 0 0 6.3 -2.4A6.5 6.5 0 0 0 -5.7 -2.2A4.3 4.3 0 0 0 -6.5 6Z" fill={MINT} />
      <path d="M0 3.6V-2.2M-3 0.8L0 -2.4L3 0.8" />
    </g>
  ),
  download: (
    <g {...BASE}>
      <path d="M-3 -9.5H3V-1.5H6.6L0 5.2L-6.6 -1.5H-3Z" fill={SKY} />
      <rect x="-9" y="6.4" width="18" height="3.8" rx="1.6" fill={MINT} />
    </g>
  ),
  message: (
    <g {...BASE}>
      <path d="M-6 -8.5H6A4 4 0 0 1 10 -4.5V1.5A4 4 0 0 1 6 5.5H1L-4 10V5.5H-6A4 4 0 0 1 -10 1.5V-4.5A4 4 0 0 1 -6 -8.5Z" fill={SKY} />
      <path d="M-4 -1.5H-3.99M0 -1.5H0.01M4 -1.5H4.01" strokeWidth="2.6" />
    </g>
  ),
  alert: (
    <g {...BASE}>
      <path d="M0 -9.5L10.2 8H-10.2Z" fill={ROSE} />
      <path d="M0 -3V2.6M0 5.4H0.01" />
    </g>
  ),
  check: (
    <g {...BASE}>
      <circle r="9.5" fill={MINT} />
      <path d="M-4.4 0.4L-1.4 3.4L4.6 -3.2" />
    </g>
  ),
  cross: (
    <g {...BASE}>
      <circle r="9.5" fill={ROSE} />
      <path d="M-3.6 -3.6L3.6 3.6M3.6 -3.6L-3.6 3.6" />
    </g>
  ),
  "vertical-video": (
    <g {...BASE}>
      <rect x="-5.6" y="-10" width="11.2" height="20" rx="3" fill={SKY} />
      <path d="M-1.8 -3.4L2.8 0L-1.8 3.4Z" fill={INK} strokeWidth="1.2" />
      <path d="M-2.8 6.6H2.8" />
    </g>
  ),
  play: (
    <g {...BASE}>
      <path d="M-5 -8.5L8.5 0L-5 8.5Z" fill={SUN} />
    </g>
  ),
  hashtag: (
    <g {...BASE}>
      <rect x="-10" y="-10" width="20" height="20" rx="5" fill={SUN} />
      <path d="M-2.2 -5.6L-3.5 5.6M3.5 -5.6L2.2 5.6M-6 -2H6M-6.4 2H5.6" />
    </g>
  ),
  tag: (
    <g {...BASE}>
      <path d="M-9.5 -9.5H0.5L9.5 -0.5Q10.5 0.5 9.5 1.5L1.5 9.5Q0.5 10.5 -0.5 9.5L-9.5 0.5Z" fill={SUN} />
      <circle cx="-5" cy="-5" r="1.7" {...SOLID} />
    </g>
  ),
  article: (
    <g {...BASE}>
      <path d="M-7.5 -10H2.5L7.5 -5V10H-7.5Z" fill={SKY} />
      <path d="M2.5 -10V-5H7.5M-4 3.2H3.6M-4 6.6H0.8" />
      <path d="M-4 -1H2" strokeWidth="2.8" />
    </g>
  ),
  scraper: (
    <g {...BASE}>
      <rect x="-8.5" y="-4" width="17" height="14" rx="4" fill={MINT} />
      <path d="M0 -4V-7.6" />
      <circle cy="-8.8" r="1.6" fill={SUN} />
      <circle cx="-3.4" cy="2.6" r="1.3" {...SOLID} />
      <circle cx="3.4" cy="2.6" r="1.3" {...SOLID} />
      <path d="M-3 6.6H3" />
    </g>
  ),
  eye: (
    <g {...BASE}>
      <path d="M-10.5 0Q0 -11.5 10.5 0Q0 11.5 -10.5 0Z" fill={SKY} />
      <circle r="3.8" fill={SUN} />
      <circle r="1.4" {...SOLID} />
    </g>
  ),
} satisfies Record<string, ReactElement>;

export type GlyphName = keyof typeof FRAGMENTS;

/** Every glyph name, in display order. */
export const GLYPH_NAMES = Object.keys(FRAGMENTS) as readonly GlyphName[];

/** Raw <g> fragments in the -12..12 box, for use inside a parent svg (see GlyphG). */
export const GLYPH_FRAGMENTS: Readonly<Record<GlyphName, ReactElement>> = FRAGMENTS;

/** Standalone glyph with its own svg. `size` is px (number) or any CSS length (string). */
export function PipeGlyph({ name, size = 24, className }: { name: GlyphName; size?: number | string; className?: string }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden className={className} style={{ width: size, height: size }}>
      {FRAGMENTS[name]}
    </svg>
  );
}

/** Glyph placed inside a parent svg: centred on (x, y), `size` user units wide. */
export function GlyphG({ name, x = 0, y = 0, size = 24 }: { name: GlyphName; x?: number; y?: number; size?: number }) {
  return <g transform={`translate(${x} ${y}) scale(${size / 24})`}>{FRAGMENTS[name]}</g>;
}
