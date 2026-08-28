/* Same gradient formula as the roaming mascot orb (Mascot.tsx), sized to sit
   inline inside a heading. Decorative only: the heading's accessible name
   still comes from its text nodes. */
export default function OrbGlyph({ size = "0.34em" }: { size?: string }) {
  return (
    <span
      aria-hidden
      className="mx-[0.14em] inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        verticalAlign: "0.08em",
        background:
          "radial-gradient(circle at 50% 40%, color-mix(in oklab, var(--color-accent) 80%, white), color-mix(in oklab, var(--color-accent) 55%, transparent))",
      }}
    />
  );
}
