import CountUp from "@/components/ui/CountUp";

// D1: a short block of big accent numbers for a case study's Outcome or Scale
// part. Each number counts up once (CountUp) and stops; with prefers-reduced-motion
// CountUp shows the final value immediately, and so does the server render.
//
// Traceability contract, same as src/data/skills.ts: every `value` must already
// be readable in the page's own text. Never pass a number that is not there.

export type ResultStat = {
  /** Final value as it reads, e.g. "12,495", "600+", "6/6". CountUp animates the first number. */
  value: string;
  /** Short label under the number. */
  label: string;
  /** Optional screen-reader wording when "value label" would read badly (e.g. "6/6"). */
  spoken?: string;
};

// Full class strings so Tailwind can see them. 3 items stack on a phone
// rather than leaving one orphan in a two-column grid.
const GRID: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 sm:grid-cols-4",
};

function sentence(stats: ResultStat[], caption?: string) {
  const parts = stats.map((s) => s.spoken ?? `${s.value} ${s.label}`);
  return `${caption ? `${caption}: ` : ""}${parts.join(", ")}.`;
}

export default function ResultNumbers({
  stats,
  caption,
}: {
  stats: ResultStat[];
  caption?: string;
}) {
  const grid = GRID[stats.length];
  if (!grid) {
    // A block outside 2 to 4 numbers is a content mistake, not a runtime state.
    if (process.env.NODE_ENV !== "production") {
      console.warn(`ResultNumbers expects 2 to 4 stats, got ${stats.length}.`);
    }
    return null;
  }

  return (
    <div data-unit="result-numbers" data-count={stats.length} className="mt-10">
      {caption ? (
        <div className="eyebrow mb-5" aria-hidden="true">
          {caption}
        </div>
      ) : null}
      {/* The animated text would be read as partial numbers mid-count, so the
          visual list is hidden from assistive tech and one full sentence stands in. */}
      <p className="sr-only">{sentence(stats, caption)}</p>
      <ul aria-hidden="true" className={`grid gap-x-8 gap-y-9 ${grid}`}>
        {stats.map((s) => (
          <li key={s.label} className="min-w-0 border-t border-line-strong pt-4">
            <div className="nums font-display text-[length:var(--step-3)] leading-none font-semibold tracking-tight text-accent">
              <CountUp value={s.value} />
            </div>
            <div className="mt-3 max-w-[24ch] text-sm leading-snug text-dim">
              {s.label}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
