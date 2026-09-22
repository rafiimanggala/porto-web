"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Section from "./ui/Section";
import { SPRING, HOVER_SCALE, TAP_SCALE } from "./home/springs";

// Accordion (APG, non-exclusive): each trigger toggles its own panel
// independently. aria-expanded on the trigger, aria-controls -> panel id,
// panel is role="region" aria-labelledby the trigger. Keyboard is the native
// button contract (Tab to reach, Enter or Space to toggle).
const FAQS = [
  {
    q: "Are you available for freelance work?",
    a: "Yes, open to remote AI engineering roles and freelance builds: autonomous systems, agent orchestration, and full-stack products.",
  },
  {
    q: "Where are you based?",
    a: "Indonesia, UTC+7, working remotely. Current clients are in Australia and the US.",
  },
  {
    q: "What makes your approach different?",
    a: "Most people use Claude Code to write functions. I deploy it as the engine: always-on agents that observe, decide, and act in production.",
  },
];

// Pastel number pills, in order: sun, sky, rose. Full class names so Tailwind
// can see them.
const PILL_TONES = ["bg-sun", "bg-sky", "bg-rose"];

// Plus that becomes an X: the whole glyph springs 45deg open instead of the
// vertical bar snapping away. Reduced motion still reaches the open state,
// just without the spring (instant transition instead of skipping it).
function Toggle({ open }: { open: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent text-surface-2 sm:h-11 sm:w-11"
      animate={{ rotate: open ? 45 : 0 }}
      transition={reduce ? { duration: 0 } : SPRING}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
        <path d="M5 12h14" />
        <path d="M12 5v14" />
      </svg>
    </motion.span>
  );
}

export default function FaqAccordion({ index }: { index: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const reduce = useReducedMotion();

  return (
    <Section id="faq" index={index} label="FAQ" title="Before you reach out">
      <div className="flex flex-col gap-3 sm:gap-4">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div
              key={item.q}
              className={`rounded-3xl border bg-surface-2 transition-colors duration-200 motion-reduce:transition-none ${
                isOpen ? "border-accent" : "border-line hover:border-line-strong"
              }`}
            >
              <h3>
                <motion.button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex min-h-[72px] w-full cursor-pointer items-center gap-3 rounded-3xl p-4 text-left focus-visible:outline-offset-[-4px] sm:gap-4 sm:p-5"
                  whileHover={reduce ? undefined : HOVER_SCALE}
                  whileTap={reduce ? undefined : TAP_SCALE}
                  transition={SPRING}
                >
                  <span
                    aria-hidden
                    className={`flex h-9 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold tabular-nums text-pastel-ink sm:w-12 ${PILL_TONES[i % PILL_TONES.length]}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-base font-semibold leading-snug tracking-[-0.01em] text-fg sm:text-lg">
                    {item.q}
                  </span>
                  <Toggle open={isOpen} />
                </motion.button>
              </h3>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-trigger-${i}`}
                hidden={!isOpen}
                className="px-4 pb-6 pl-[4.25rem] sm:px-5 sm:pb-7 sm:pl-[5.25rem] sm:pr-20"
              >
                <p className="t-body max-w-2xl text-dim">{item.a}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
