"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Arrow from "@/components/ui/Arrow";
import SwitchboardPreview from "@/components/SwitchboardPreview";
import type { Skill } from "@/data/skills";

// Evidence card for the selected orbit node. Copy comes straight from
// skills.ts; nothing here is authored separately, so it cannot drift from the
// /skills/<slug> page it links to. Swapped by the parent's AnimatePresence
// (opacity + a short rise only, no layout animation).
export default function OrbitCard({
  skill,
  cardId,
  onClose,
}: {
  skill: Skill;
  cardId: string;
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.section
      id={cardId}
      aria-labelledby={`${cardId}-title`}
      data-card={skill.slug}
      initial={reduce ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
      transition={{ duration: reduce ? 0 : 0.22, ease: [0.19, 1, 0.22, 1] }}
      className="pointer-events-auto max-h-full w-[280px] overflow-y-auto rounded-2xl border border-line-strong bg-surface-1 p-5 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.8)] lg:w-[340px]"
    >
      <div className="flex items-center justify-between">
        <span aria-hidden className="mono nums text-[11px] text-mute">
          {String(skill.n).padStart(2, "0")}
        </span>
        <button
          type="button"
          onClick={onClose}
          data-unit="orbit:close"
          className="mono -mr-2 -mt-2 flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-full text-[11px] text-dim transition-colors hover:text-fg"
        >
          Close
        </button>
      </div>

      <div className="-mt-4">
        <SwitchboardPreview slug={skill.slug} />
      </div>

      <h3
        id={`${cardId}-title`}
        className="mt-4 font-[family-name:var(--font-display)] text-xl font-semibold leading-[1.15] tracking-[-0.02em] text-fg"
      >
        {skill.title}
      </h3>
      <p className="mono mt-3 text-[12px] leading-relaxed text-fg">
        <span className="text-mute">Evidence: </span>
        {skill.evidence}
      </p>
      <p className="mt-3 text-[13px] leading-relaxed text-dim">{skill.value}</p>

      <ul aria-label="Tools" className="mt-4 flex flex-wrap gap-1.5">
        {skill.tools.map((tool) => (
          <li key={tool} className="mono rounded border border-line px-2 py-0.5 text-[11px] text-dim">
            {tool}
          </li>
        ))}
      </ul>

      <Link
        href={`/skills/${skill.slug}`}
        data-unit={`skill:${skill.slug}`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-fg px-5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
      >
        Open case
        <Arrow />
      </Link>
    </motion.section>
  );
}
