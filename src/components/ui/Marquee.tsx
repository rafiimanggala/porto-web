// Pure-CSS marquee: a duplicated track that loops seamlessly, fades at the
// edges, and pauses on hover. No JS, respects prefers-reduced-motion.
const chipClass =
  "mono whitespace-nowrap rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-xs text-dim";

export default function Marquee({ items }: { items: string[] }) {
  return (
    <div className="marquee-mask group relative overflow-hidden py-1">
      <div className="marquee-track flex w-max gap-2 group-hover:[animation-play-state:paused]">
        <div className="flex shrink-0 items-center gap-2 pr-2">
          {items.map((t) => (
            <span key={t} className={chipClass}>
              {t}
            </span>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2 pr-2" aria-hidden>
          {items.map((t) => (
            <span key={t} className={chipClass}>
              {t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
