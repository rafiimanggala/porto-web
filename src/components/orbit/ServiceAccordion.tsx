"use client";

import { useRef, useState, type KeyboardEvent, type Ref } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import Arrow from "@/components/ui/Arrow";
import { skills, type Skill } from "@/data/skills";
import { nodeStyle } from "./orbitStyle";

// Numbered accordion (APG accordion contract): one panel open at a time,
// trigger is a button in a heading with aria-expanded / aria-controls, panel
// is a labelled region. This is the SSR output and the mobile, coarse-pointer,
// no-WebGL and context-lost fallback for ServiceOrbit. Each row is a flat
// card whose number pill carries the same pastel as the orbit's node.
//
// All seven panels stay in the DOM so the services, evidence and links exist
// as real text before any script runs. Closed panels collapse to height 0 and
// are `inert`, so their links are neither focusable nor read out.

const pad = (n: number) => String(n).padStart(2, "0");

function Panel({ skill, open, reduce }: { skill: Skill; open: boolean; reduce: boolean }) {
  return (
    <motion.div
      id={`acc-panel-${skill.slug}`}
      role="region"
      aria-labelledby={`acc-trigger-${skill.slug}`}
      inert={!open}
      initial={false}
      animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
      transition={{ duration: reduce ? 0 : 0.34, ease: [0.19, 1, 0.22, 1] }}
      style={{ overflow: "hidden" }}
    >
      <div className="px-5 pb-6 pt-1">
        <p className="text-[15px] leading-relaxed text-dim">{skill.value}</p>
        <p className="mt-4 text-[13px] font-medium leading-relaxed text-fg">
          <span className="font-normal text-mute">Evidence: </span>
          {skill.evidence}
        </p>
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
      </div>
    </motion.div>
  );
}

function Row({
  skill,
  index,
  isOpen,
  reduce,
  buttonRef,
  onToggle,
  onKeyDown,
}: {
  skill: Skill;
  index: number;
  isOpen: boolean;
  reduce: boolean;
  buttonRef: Ref<HTMLButtonElement>;
  onToggle: () => void;
  onKeyDown: (e: KeyboardEvent) => void;
}) {
  return (
    <li
      style={nodeStyle(index)}
      className={`rounded-3xl border-2 bg-surface-2 transition-colors duration-200 ${isOpen ? "border-[var(--node)]" : "border-line"}`}
    >
      <h3>
        <button
          ref={buttonRef}
          type="button"
          id={`acc-trigger-${skill.slug}`}
          aria-expanded={isOpen}
          aria-controls={`acc-panel-${skill.slug}`}
          data-unit={`acc:${skill.slug}`}
          onClick={onToggle}
          onKeyDown={onKeyDown}
          className="flex min-h-[72px] w-full cursor-pointer items-center gap-3 rounded-3xl px-4 py-3 text-left"
        >
          <span
            aria-hidden
            className="nums inline-flex h-9 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--node)] text-[13px] font-semibold text-fg"
          >
            {pad(skill.n)}
          </span>
          <span className="flex-1 font-display text-[22px] leading-[1.1] text-fg">{skill.title}</span>
          <svg
            aria-hidden
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`shrink-0 text-accent transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </h3>
      <Panel skill={skill} open={isOpen} reduce={reduce} />
    </li>
  );
}

// Roving-focus target for a key press, or -1 when the key is not navigation.
function nextIndex(key: string, i: number): number {
  const last = skills.length - 1;
  if (key === "ArrowDown") return i === last ? 0 : i + 1;
  if (key === "ArrowUp") return i === 0 ? last : i - 1;
  if (key === "Home") return 0;
  if (key === "End") return last;
  return -1;
}

export default function ServiceAccordion() {
  const reduce = useReducedMotion() ?? false;
  const [open, setOpen] = useState<string>(skills[0].slug);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);

  const onKeyDown = (e: KeyboardEvent, i: number) => {
    const next = nextIndex(e.key, i);
    if (next < 0) return;
    e.preventDefault();
    triggers.current[next]?.focus();
  };

  return (
    <ol data-open={open || "none"} className="flex flex-col gap-3">
      {skills.map((skill, i) => (
        <Row
          key={skill.slug}
          skill={skill}
          index={i}
          isOpen={open === skill.slug}
          reduce={reduce}
          buttonRef={(el) => {
            triggers.current[i] = el;
          }}
          onToggle={() => setOpen(open === skill.slug ? "" : skill.slug)}
          onKeyDown={(e) => onKeyDown(e, i)}
        />
      ))}
    </ol>
  );
}
