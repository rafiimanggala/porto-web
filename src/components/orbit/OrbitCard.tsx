"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Arrow from "@/components/ui/Arrow";
import SwitchboardPreview from "@/components/SwitchboardPreview";
import type { Skill } from "@/data/skills";
import { nodeStyle } from "./orbitStyle";

function CloseX() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M2 2l10 10M12 2L2 12" />
    </svg>
  );
}

// Evidence card for the selected orbit node. Copy comes straight from
// skills.ts; nothing here is authored separately, so it cannot drift from the
// /skills/<slug> page it links to. Swapped by the parent's AnimatePresence
// (opacity + a short rise only, no layout animation). --node is the pastel of
// the selected sphere, so the number pill and tool outlines match it.
export default function OrbitCard({
  skill,
  index,
  cardId,
  onClose,
}: {
  skill: Skill;
  index: number;
  cardId: string;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={cardId}
      aria-labelledby={`${cardId}-title`}
      data-card={skill.slug}
      style={nodeStyle(index)}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: reduce ? 0 : 0.22, ease: [0.19, 1, 0.22, 1] }}
      className="pointer-events-auto max-h-full w-[280px] overflow-y-auto rounded-3xl border border-line bg-surface-2 p-5 shadow-[0_8px_24px_rgba(21,32,18,0.08)] lg:w-[340px] lg:p-6"
    >
      <div className="flex items-center justify-between">
        <span
          aria-hidden
          className="nums inline-flex h-8 min-w-11 items-center justify-center rounded-full bg-[var(--node)] px-3 text-[13px] font-semibold text-fg"
        >
          {String(skill.n).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onClose}
          data-unit="orbit:close"
          aria-label="Close"
          className="-mr-2 -mt-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-surface-3 text-fg transition-colors hover:bg-line-strong"
        >
          <CloseX />
        </button>
      </div>

      {/* The preview keeps its dark look. It carries its own top margin, dropped here
          so the dark tile is padded evenly. */}
      <div className="theme-dark mt-2 overflow-hidden rounded-2xl p-3 [&>div]:mt-0">
        <SwitchboardPreview slug={skill.slug} />
      </div>

      <h3
        id={`${cardId}-title`}
        className="mt-4 font-display text-[28px] leading-[1.05] text-accent"
      >
        {skill.title}
      </h3>
      <p className="mt-3 text-[13px] font-medium leading-relaxed text-fg">
        <span className="font-normal text-mute">Evidence: </span>
        {skill.evidence}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-dim">{skill.value}</p>

      <ul aria-label="Tools" className="mt-4 flex flex-wrap gap-1.5">
        {skill.tools.map((tool) => (
          <li
            key={tool}
            className="rounded-full border-2 border-[var(--node)] px-2.5 py-0.5 text-[12px] font-medium text-fg"
          >
            {tool}
          </li>
        ))}
      </ul>

      <Link
        href={`/skills/${skill.slug}`}
        data-unit={`skill:${skill.slug}`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-white transition-[filter] hover:brightness-110"
      >
        Open case
        <Arrow />
      </Link>
    </motion.section>
  );
}
