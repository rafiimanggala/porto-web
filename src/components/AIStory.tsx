"use client";

import AutomationDemo from "./AutomationDemo";

const SYSTEMS = [
  {
    id: "te",
    label: "TE Protocol",
    desc: "Fix → Deploy → Test → Proof. Every client issue gets Playwright-verified evidence before I say it's done.",
  },
  {
    id: "agents",
    label: "Agent Teams",
    desc: "5-12 parallel subagents per task: trading bots, inbox reactor, research, deploy, all running concurrently.",
  },
  {
    id: "mahoraga",
    label: "Mahoraga",
    desc: "AI that learns from every session. Corrections lock into permanent rules. Compound improvement, zero repetition.",
  },
  {
    id: "os",
    label: "Living OS",
    desc: "Hooks, memory layers, keyword triggers. The system adapts: not configured once, refined every session.",
  },
];

export default function AIStory() {
  return (
    <section id="automation" className="section-wrap">
      <p className="mono text-[11px] text-mute mb-6">how i work with ai</p>
      <div className="mb-10 max-w-xl">
        <h2 className="text-3xl font-semibold tracking-tight text-fg">
          Built on AI I can sleep on.
        </h2>
        <p className="mt-3 text-sm text-dim leading-relaxed">
          Not a power-user. An operator. Client emails arrive, agents detect and analyze,
          code gets fixed, deployed, tested, and proof sent back, before I check my phone.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <AutomationDemo />
        <div className="flex flex-col gap-4">
          {SYSTEMS.map((s) => (
            <div key={s.id} className="card">
              <p className="mono text-[11px] text-accent mb-1.5">{s.label}</p>
              <p className="text-sm text-dim leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
