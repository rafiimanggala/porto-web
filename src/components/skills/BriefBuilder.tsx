"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import type { BriefOption } from "@/data/briefOptions";
import { toggleDomId, useBrief } from "./BriefProvider";
import { useMediaQuery } from "./useMediaQuery";

// Fan-in needs room for the tilt and no motion preference. Everything else
// gets the same grid, flat and static.
const FAN_QUERY = "(min-width: 768px) and (prefers-reduced-motion: no-preference)";

const GRID = "mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3";

// Alternating tilt, never past six degrees.
const FAN_ROTATION = [-6, 4.5, -3.5, 6, -4.5, 3.5] as const;

function OptionCard({ option }: { option: BriefOption }) {
  const { slug, has, toggle } = useBrief();
  const on = has(option.id);

  return (
    <div
      data-added={on}
      className={`flex w-full min-w-0 flex-col justify-between rounded-2xl border p-5 transition-colors duration-200 ${
        on ? "border-accent/60 bg-surface-2" : "border-line bg-surface-1"
      }`}
    >
      <div>
        <h3 className="font-display text-lg font-semibold leading-tight text-fg">
          {option.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-dim">{option.detail}</p>
      </div>
      <button
        id={toggleDomId(slug, option.id)}
        type="button"
        aria-pressed={on}
        onClick={() => toggle(option.id)}
        data-unit={`brief:toggle:${slug}:${option.id}`}
        className={`mono mt-5 inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-xs font-semibold transition-colors duration-200 ${
          on
            ? "border-accent bg-accent/10 text-accent"
            : "border-line-strong text-fg hover:border-accent hover:text-accent"
        }`}
      >
        <svg aria-hidden width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d={on ? "M5 12.5l4.5 4.5L19 7.5" : "M12 5v14M5 12h14"} />
        </svg>
        Add to brief
        <span className="sr-only">: {option.title}</span>
      </button>
    </div>
  );
}

function FanItem({
  progress,
  index,
  children,
}: {
  progress: MotionValue<number>;
  index: number;
  children: ReactNode;
}) {
  const startRotate = FAN_ROTATION[index % FAN_ROTATION.length];
  const startY = 28 + (index % 3) * 10;
  const rotate = useTransform(progress, [0, 1], [startRotate, 0]);
  const y = useTransform(progress, [0, 1], [startY, 0]);
  const opacity = useTransform(progress, [0, 0.6], [0.35, 1]);

  return (
    <motion.li
      style={{ rotate, y, opacity, transformOrigin: "50% 100%" }}
      className="flex min-w-0"
    >
      {children}
    </motion.li>
  );
}

// Progress runs from 0 (grid top meets the bottom of the viewport) to 1 (grid
// centre meets the viewport centre), then holds flat.
function FannedGrid({ options }: { options: readonly BriefOption[] }) {
  const ref = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });

  return (
    <ul ref={ref} data-fan="on" className={GRID}>
      {options.map((option, i) => (
        <FanItem key={option.id} progress={scrollYProgress} index={i}>
          <OptionCard option={option} />
        </FanItem>
      ))}
    </ul>
  );
}

function StaticGrid({ options }: { options: readonly BriefOption[] }) {
  return (
    <ul data-fan="off" className={GRID}>
      {options.map((option) => (
        <li key={option.id} className="flex min-w-0">
          <OptionCard option={option} />
        </li>
      ))}
    </ul>
  );
}

export default function BriefBuilder() {
  const { options } = useBrief();
  const fan = useMediaQuery(FAN_QUERY);

  if (options.length === 0) return null;
  return fan ? <FannedGrid options={options} /> : <StaticGrid options={options} />;
}
