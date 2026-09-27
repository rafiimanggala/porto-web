/* Glyphs the kit lacks, in the same duotone house style: cream stroke over a tinted fill, viewBox -12 -12 24 24. */

const INK = "var(--color-fg)";
const PAPER = `color-mix(in oklab, ${INK} 84%, transparent)`;
const SKY = "color-mix(in oklab, var(--color-sky) 55%, transparent)";

export function PushGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden style={{ width: size, height: size }}>
      <g fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-10 3V8.4Q-10 10 -8.4 10H8.4Q10 10 10 8.4V3Z" fill={SKY} />
        <path d="M0 6V-9.4" />
        <path d="M-5.6 -4L0 -9.6L5.6 -4" fill="none" />
        <path d="M-5 2.6H5" stroke={PAPER} strokeWidth="1.4" />
      </g>
    </svg>
  );
}

/* The gate is a checklist, not a lock: a clipboard with two ticked rows stands on the button until both checks are done. */
export function ChecklistGlyph({ size = 20 }: { size?: number }) {
  return (
    <svg viewBox="-12 -12 24 24" aria-hidden style={{ width: size, height: size }}>
      <g fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-6.4 -8.6H6.4Q8.6 -8.6 8.6 -6.4V8.4Q8.6 10.6 6.4 10.6H-6.4Q-8.6 10.6 -8.6 8.4V-6.4Q-8.6 -8.6 -6.4 -8.6Z" fill={SKY} />
        <path d="M-3.4 -10.6H3.4V-6.6H-3.4Z" fill={PAPER} />
        <path d="M-5 0.2L-3.4 1.8L-0.6 -1.2" stroke={PAPER} strokeWidth="1.5" />
        <path d="M-5 6.2L-3.4 7.8L-0.6 4.8" stroke={PAPER} strokeWidth="1.5" />
        <path d="M2 0.4H5.4M2 6.4H5.4" stroke={PAPER} strokeWidth="1.4" />
      </g>
    </svg>
  );
}
