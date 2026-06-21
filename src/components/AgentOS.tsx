"use client";

import { toolkit, capabilities } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import AgentNodeGraph from "./visuals/AgentNodeGraph";

const FEATURED_TOOLS = ["Mahoraga", "Email Reactor", "Smart Context Injector"];

export default function AgentOS() {
  const tools = FEATURED_TOOLS.map((n) => toolkit.find((t) => t.name === n)!).filter(Boolean);
  const caps = capabilities.slice(0, 3);

  return (
    <Section
      id="agent-os"
      index="03"
      label="Agent OS"
      title="Not a chatbot. An operating system for agents."
      intro="The part most engineers do not have: a personal agent stack that runs itself, learns from its own mistakes, and never touches production without a gate."
    >
      <AgentNodeGraph className="mb-8 opacity-70" />
      <div className="grid gap-5 md:grid-cols-3">
        {tools.map((t, i) => (
          <Reveal key={t.name} delay={(i % 3) * 0.06} className="h-full">
            <div className="card flex h-full flex-col p-6">
              <span className="mono text-[11px] text-mute">{t.cmd}</span>
              <h3 className="t-h3 mt-3 text-fg">{t.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{t.desc}</p>
              <p className="mono mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-accent/90">
                {t.why}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
        {caps.map((c, i) => (
          <Reveal key={c.title} delay={(i % 3) * 0.06}>
            <div className="h-full bg-surface-1 p-5">
              <h4 className="mono text-sm text-fg">{c.title}</h4>
              <p className="mt-2 text-xs leading-relaxed text-dim">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
