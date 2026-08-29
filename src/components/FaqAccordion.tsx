"use client";

import { useState } from "react";
import Section from "./ui/Section";

// Accordion (APG, non-exclusive): each trigger toggles its own panel
// independently. aria-expanded on the trigger, aria-controls -> panel id,
// panel is role="region" aria-labelledby the trigger.
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

export default function FaqAccordion({ index }: { index: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section id="faq" index={index} label="FAQ" title="Before you reach out">
      <div className="divide-y divide-line border-y border-line">
        {FAQS.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q}>
              <h3>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-trigger-${i}`}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
                >
                  <span className="t-h3 text-base text-fg sm:text-lg">{item.q}</span>
                  <svg
                    aria-hidden
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className={`shrink-0 text-mute transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
              </h3>
              <div
                id={`faq-panel-${i}`}
                role="region"
                aria-labelledby={`faq-trigger-${i}`}
                hidden={!isOpen}
                className="pb-5"
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
