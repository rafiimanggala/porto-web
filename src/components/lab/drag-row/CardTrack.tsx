"use client";

import { motion } from "framer-motion";
import type { MotionValue, PanInfo } from "framer-motion";
import type { RefObject } from "react";
import { skills } from "@/data/skills";
import { LAST } from "./useReadout";

const pad = (n: number) => String(n).padStart(2, "0");

// The draggable strip. It is padded so the first and last card can sit in the
// middle of the frame, which is what makes every index a real snap point.
export default function CardTrack({
  x,
  step,
  reduce,
  trackRef,
  cardRefs,
  onDragStart,
  onDragEnd,
}: {
  x: MotionValue<number>;
  step: number;
  reduce: boolean;
  trackRef: RefObject<HTMLUListElement | null>;
  cardRefs: RefObject<(HTMLLIElement | null)[]>;
  onDragStart: () => void;
  onDragEnd: (event: unknown, info: PanInfo) => void;
}) {
  return (
    <motion.ul
      ref={trackRef}
      data-testid="drag-track"
      drag="x"
      dragConstraints={{ left: -step * LAST, right: 0 }}
      dragElastic={reduce ? 0 : 0.12}
      dragMomentum={false}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ x, touchAction: "pan-y", paddingInline: "calc(50% - var(--card-w) / 2)" }}
      className="relative flex w-max cursor-grab select-none gap-4 active:cursor-grabbing"
    >
      {skills.map((skill, i) => (
        <li
          key={skill.slug}
          ref={(el) => {
            cardRefs.current[i] = el;
          }}
          style={{ width: "var(--card-w)" }}
          className="card flex min-h-64 flex-col justify-between p-6 transition-colors data-[active=true]:border-accent/60"
        >
          <span className="mono nums text-xs text-mute">{pad(skill.n)}</span>
          <span className="t-h3">{skill.title}</span>
        </li>
      ))}
    </motion.ul>
  );
}
