"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { featured, type Project } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import SpotlightCard from "./ui/SpotlightCard";
import ProjectVisual from "./visuals/projectVisuals";

// The 4 strongest showcases; the rest live in the index strip.
const FEATURED_IDS = [
  "trading-command-center",
  "amadeus",
  "testengine",
  "health-platform",
];

const statusDot: Record<string, string> = {
  Live: "bg-accent",
  Done: "bg-dim",
  Building: "bg-[#f6b667]",
  Planned: "bg-mute",
};

function Meta({ p }: { p: Project }) {
  return (
    <div className="flex items-center justify-between">
      <span className="mono text-xs uppercase tracking-wider text-mute">
        {p.kind}
        <span className="mx-2">·</span>
        {p.year}
      </span>
      <span className="mono inline-flex items-center gap-1.5 text-xs text-dim">
        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[p.status]}`} />
        {p.status}
      </span>
    </div>
  );
}

function Item({ text }: { text: string }) {
  return (
    <li className="flex gap-2.5 text-sm leading-relaxed text-dim">
      <span className="mt-1.5 select-none text-accent">▸</span>
      <span>{text}</span>
    </li>
  );
}

// First highlight always shown; the rest collapse behind a toggle.
function Highlights({ items }: { items: string[] }) {
  const [open, setOpen] = useState(false);
  const rest = items.slice(1);
  return (
    <div>
      <ul className="space-y-2.5">
        <Item text={items[0]} />
        <AnimatePresence initial={false}>
          {open &&
            rest.map((h) => (
              <motion.div
                key={h}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
              >
                <Item text={h} />
              </motion.div>
            ))}
        </AnimatePresence>
      </ul>
      {rest.length > 0 && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mono mt-3 cursor-pointer text-xs text-mute transition-colors hover:text-accent"
        >
          {open ? "− less" : `+ ${rest.length} more detail${rest.length > 1 ? "s" : ""}`}
        </button>
      )}
    </div>
  );
}

function Tags({ p }: { p: Project }) {
  return (
    <div className="mt-auto pt-6">
      <div className="flex flex-wrap gap-1.5">
        {p.stack.map((s) => (
          <span
            key={s}
            className="mono rounded-md border border-line bg-bg px-2 py-0.5 text-[11px] text-dim"
          >
            {s}
          </span>
        ))}
      </div>
      {p.link && (
        <a
          href={p.link.href}
          target="_blank"
          rel="noreferrer"
          className="mono mt-5 inline-flex cursor-pointer items-center gap-1 text-xs text-accent opacity-80 transition-opacity hover:opacity-100"
        >
          {p.link.label} ↗
        </a>
      )}
    </div>
  );
}

function ProjectCard({ p, className }: { p: Project; className?: string }) {
  return (
    <SpotlightCard dataUnit={`project:${p.id}`} className={`flex flex-col p-6 sm:p-7 ${className ?? ""}`}>
      <ProjectVisual id={p.id} accent={p.accent} className="mb-5 h-28" />
      <Meta p={p} />
      <h3 className="t-h3 mt-4 text-fg">{p.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-dim">{p.oneLiner}</p>
      <div className="mt-5">
        <Highlights items={p.highlights} />
      </div>
      <Tags p={p} />
    </SpotlightCard>
  );
}

function StickyStack({ items }: { items: Project[] }) {
  const reduce = useReducedMotion();
  const [stack, setStack] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setStack(mq.matches && !reduce);
  }, [reduce]);

  if (!stack) {
    // Touch / reduced-motion: preserve the original grid + Reveal stagger exactly.
    return (
      <div className="md:col-span-2 grid gap-5 md:grid-cols-3">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={(i % 3) * 0.08} className="h-full">
            <ProjectCard p={p} className="h-full" />
          </Reveal>
        ))}
      </div>
    );
  }

  // Desktop: sticky-stack (no Reveal -- its transform conflicts with position:sticky).
  return (
    <div className="md:col-span-2 space-y-5">
      {items.map((p, i) => (
        <div key={p.id} className="sticky" style={{ top: `calc(6rem + ${i * 1.5}rem)` }}>
          <ProjectCard p={p} />
        </div>
      ))}
    </div>
  );
}

export default function Featured() {
  const items = FEATURED_IDS.map(
    (id) => featured.find((p) => p.id === id)!
  ).filter(Boolean);
  const [hero, ...rest] = items;

  return (
    <Section
      id="work"
      index="01"
      label="Selected work"
      title="Systems that run themselves."
      intro="Four builds where the AI isn't a sidekick, it's the engine making decisions in production. Click a card for the deeper version. Client work is anonymized."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {/* wide hero card */}
        <Reveal className="md:col-span-2">
          <SpotlightCard
            dataUnit={`project:${hero.id}`}
            className="flex h-full flex-col p-6 sm:p-8 lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-10"
          >
            <div className="flex flex-col">
              <Meta p={hero} />
              <h3 className="t-h3 mt-4 text-fg">{hero.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-dim">
                {hero.oneLiner}
              </p>
              <ProjectVisual id={hero.id} accent={hero.accent} className="mt-6 h-32" />
              <div className="hidden lg:block">
                <Tags p={hero} />
              </div>
            </div>
            <div className="mt-6 lg:mt-1">
              <Highlights items={hero.highlights} />
              <div className="lg:hidden">
                <Tags p={hero} />
              </div>
            </div>
          </SpotlightCard>
        </Reveal>

        <StickyStack items={rest} />
      </div>
    </Section>
  );
}
