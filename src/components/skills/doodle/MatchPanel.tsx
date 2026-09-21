import type { Match } from "@/lib/doodle/types";
import { WORDS } from "@/lib/doodle/words";

const ROWS = 3;

// "The matcher sees": the three closest shapes as bars. Bars are scaled with
// transform only. The leader gets the accent, the rest stay neutral.
export default function MatchPanel({ matches }: { matches: readonly Match[] | null }) {
  const rows = Array.from({ length: ROWS }, (_, i) => matches?.[i] ?? null);

  return (
    <div data-doodle-panel className="flex h-full flex-col">
      <h4 className="eyebrow">The matcher sees</h4>
      <div className="mono mt-4 flex justify-between text-[10px] uppercase tracking-wider text-mute">
        <span>Shape</span>
        <span>Match</span>
      </div>
      <ol className="mt-2 space-y-3">
        {rows.map((row, i) => (
          <li key={i} data-doodle-row={i} data-shape={row?.id ?? ""}>
            <div className="mono flex items-baseline justify-between text-sm">
              <span className={i === 0 && row ? "text-fg" : "text-dim"}>
                {row ? WORDS[row.id].word : "waiting"}
              </span>
              <span className="nums text-xs text-dim">
                {row ? `${Math.round(row.share * 100)}%` : "0%"}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-line">
              <div
                data-doodle-bar
                className={`h-full w-full origin-left rounded-full transition-transform duration-200 ease-out ${
                  i === 0 && row ? "bg-accent" : "bg-mute"
                }`}
                style={{ transform: `scaleX(${row ? row.share : 0})` }}
              />
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-auto pt-6">
        <p className="text-sm text-fg/90">
          A tiny matcher running in your browser. No API, nothing leaves this page.
        </p>
        <p className="mt-2 text-xs leading-relaxed text-mute">
          Match is a share among the shapes it knows, not a certainty. It compares your drawing
          with shapes it drew itself when this card woke up.
        </p>
      </div>
    </div>
  );
}
