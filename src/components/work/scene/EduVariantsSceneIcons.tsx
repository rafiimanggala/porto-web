import { tint } from "./EduVariantsSceneKit";

/* Duotone recognition icons for the variants scene, drawn inside the stage
   svg: cream stroke, tinted fill, one orange accent, centred on (0, 0) in a
   24 x 24 box. The caller places and scales them with a wrapping <g>. */

const INK = "var(--color-fg)";
const MINT = "var(--color-mint)";
const SUN = "var(--color-sun)";
const SKY = "var(--color-sky)";
const ACCENT = "var(--color-accent)";

const LINE = {
  fill: "none",
  stroke: INK,
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/* Open book: the subject. */
export function BookIcon() {
  return (
    <g {...LINE}>
      <path d="M-10 -6.5C-6.8 -8.2 -3.2 -7.8 0 -5.6V9.6C-3.2 7.4 -6.8 7 -10 8.7Z" style={{ fill: tint(MINT) }} />
      <path d="M10 -6.5C6.8 -8.2 3.2 -7.8 0 -5.6V9.6C3.2 7.4 6.8 7 10 8.7Z" style={{ fill: tint(SUN) }} />
      <path d="M4.2 -7.4V0.4L5.9 -1L7.6 0.4V-6.9" style={{ fill: ACCENT, stroke: ACCENT }} strokeWidth={1.2} />
    </g>
  );
}

/* Quiz sheet with a ticked box: the quiz engine. */
export function SheetIcon() {
  return (
    <g {...LINE}>
      <path d="M-6.5 -10.5H2.5L7.5 -5.5V10.5H-6.5Z" style={{ fill: tint(SKY) }} />
      <path d="M2.5 -10.5V-5.5H7.5" />
      <rect x={-4.4} y={-3.2} width={3.6} height={3.6} rx={0.8} />
      <path d="M0.6 -1.4H4.6" />
      <rect x={-4.4} y={2.6} width={3.6} height={3.6} rx={0.8} />
      <path d="M0.6 4.4H4.6" />
      <path d="M-4 -1.4L-2.9 -0.4L-0.9 -2.8" style={{ stroke: ACCENT }} strokeWidth={1.5} />
    </g>
  );
}

/* School building with a flag: the licence holder. */
export function SchoolIcon() {
  return (
    <g {...LINE}>
      <path d="M-8.5 -1.5V9.5H8.5V-1.5" style={{ fill: tint(SUN) }} />
      <path d="M-11 -1.5L0 -8.6L11 -1.5Z" style={{ fill: tint(ACCENT, 70) }} />
      <path d="M-2.3 9.5V3.6H2.3V9.5" />
      <path d="M0 -8.6V-12L4.2 -10.6L0 -9.4" style={{ stroke: ACCENT }} strokeWidth={1.3} />
    </g>
  );
}

/* Padlock: a variant this school has not licensed. */
export function LockIcon() {
  return (
    <g {...LINE}>
      <path d="M-3.4 -1.6V-4.4A3.4 3.4 0 0 1 3.4 -4.4V-1.6" />
      <rect x={-5.6} y={-1.6} width={11.2} height={9.4} rx={2} style={{ fill: tint(INK, 35) }} />
      <path d="M0 2.2V4.6" />
    </g>
  );
}

/* Tick and cross marks, drawn small for badges. */
export function TickMark() {
  return <path d="M-3.4 0.2L-1 2.6L3.6 -2.6" {...LINE} strokeWidth={2} />;
}

export function CrossMark({ color = INK }: { color?: string }) {
  return <path d="M-3 -3L3 3M3 -3L-3 3" {...LINE} stroke={color} strokeWidth={2} />;
}
