"use client";

import { useId, useSyncExternalStore } from "react";
import { motion } from "framer-motion";

// D6: horizontal bars that grow once when they enter the viewport. The bar's
// width is its true share of the largest value and never animates; only a
// transform (scaleX, from the left edge) does. Your own bar takes the accent,
// comparison bars stay grey, and every bar prints its value as text.
//
// Honesty contract: only use this where the page text already holds a real
// comparison (before and after, two measured values, or N of M). Never invent a
// baseline or a competitor value.

export type Bar = {
  label: string;
  /** Numeric length of the bar, in the same unit as the other bars. */
  value: number;
  /** Text printed next to the bar, e.g. "600+". Must match the page text. */
  display: string;
  /** The one bar that is yours. It gets the accent, the rest are grey. */
  own?: boolean;
};

const EASE = [0.19, 1, 0.22, 1] as const;
const QUERY = "(prefers-reduced-motion: reduce)";

// useSyncExternalStore with a server snapshot of false keeps hydration stable:
// the first client render matches the server, then flips if the user prefers
// reduced motion.
function subscribe(onChange: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const getSnapshot = () => window.matchMedia(QUERY).matches;
const getServerSnapshot = () => false;

// The track is the thing that gets observed: a fixed-size box, so the viewport
// check never depends on a bar that is still scaled to zero.
function Track({
  ratio,
  own,
  index,
  reduced,
}: {
  ratio: number;
  own: boolean;
  index: number;
  reduced: boolean;
}) {
  const track = "mt-2 h-2.5 overflow-hidden rounded-full bg-surface-2";
  const fill = `h-full origin-left rounded-full ${own ? "bg-accent" : "bg-mute"}`;
  const width = `${ratio * 100}%`;

  // Reduced motion: the static end state, no transform at all.
  if (reduced) {
    return (
      <div aria-hidden="true" className={track}>
        <div className={fill} style={{ width }} />
      </div>
    );
  }

  return (
    <motion.div
      aria-hidden="true"
      className={track}
      initial="hidden"
      whileInView="grown"
      viewport={{ once: true, amount: 0.8 }}
    >
      <motion.div
        className={`${fill} motion-reduce:transform-none!`}
        style={{ width, originX: 0 }}
        variants={{
          hidden: { scaleX: 0 },
          grown: {
            scaleX: 1,
            transition: { duration: 0.9, delay: index * 0.1, ease: EASE },
          },
        }}
      />
    </motion.div>
  );
}

function isValid(bars: Bar[]) {
  const ok = bars.every((b) => Number.isFinite(b.value) && b.value >= 0);
  return ok && bars.length >= 2 && Math.max(...bars.map((b) => b.value)) > 0;
}

export default function BenchmarkBars({
  title,
  description,
  bars,
}: {
  title: string;
  /** Plain sentence for screen readers: what is compared, with the final values. */
  description: string;
  bars: Bar[];
}) {
  const titleId = useId();
  const descId = useId();
  const reduced = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isValid(bars)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("BenchmarkBars needs at least 2 bars with finite, non-negative values.");
    }
    return null;
  }

  const max = Math.max(...bars.map((b) => b.value));

  return (
    <figure
      data-unit="benchmark-bars"
      data-bars={bars.length}
      data-state={reduced ? "static" : "animated"}
      aria-labelledby={titleId}
      aria-describedby={descId}
      className="mt-10"
    >
      <figcaption id={titleId} className="eyebrow mb-5">
        {title}
      </figcaption>
      <p id={descId} className="sr-only">
        {description}
      </p>
      <ul className="space-y-5">
        {bars.map((b, i) => (
          <li key={b.label}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className={b.own ? "text-fg" : "text-dim"}>{b.label}</span>
              <span
                className={`mono nums shrink-0 ${b.own ? "text-accent" : "text-dim"}`}
              >
                {b.display}
              </span>
            </div>
            <Track ratio={b.value / max} own={!!b.own} index={i} reduced={reduced} />
          </li>
        ))}
      </ul>
    </figure>
  );
}
