"use client";

import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

const beats = [
  "Before coffee, an hourly Email Reactor has already caught a client bug report, spun up a headless Claude, warmed up the right project, and fixed it on a branch waiting for review.",
  "Mid-morning, a single task fans out into 5 to 12 parallel subagents: one writes code, others research and debug, a lead agent merges the results.",
  "An adversarial-verify workflow runs a judge panel over the work, looping until every check passes instead of trusting the first answer.",
  "A TE loop closes a feature end to end: Fix, Deploy, Test through Playwright, then send proof screenshots before anything is marked done.",
  "At session end, Mahoraga reviews the transcript and locks a confirmed lesson into a permanent rule, so the same mistake never recurs.",
  "All of it is steerable from an iPhone over Termius and Tailscale SSH, from anywhere, at any hour.",
];

const faqs = [
  {
    q: "How does Rafii Manggala use AI?",
    a: "Rafii runs Claude Code as an always-on personal agent operating system on a Mac Mini M4, not as a chatbot. Fifteen launchd agents run around the clock, six autonomous systems run in production, and he steers the whole fleet from his iPhone over SSH. AI is his production environment, not a tool he occasionally prompts.",
  },
  {
    q: "What makes Rafii's AI workflow different?",
    a: "He builds the orchestration himself: self-learning hooks that lock in lessons permanently, an email reactor that fixes client bugs autonomously, parallel agent teams with adversarial review, and his own desktop and web automation tooling. Most people use AI to get answers; Rafii engineers AI systems that ship work, with safety rails and proof loops built in.",
  },
  {
    q: "Can Rafii ship production work with AI agents?",
    a: "Yes. He has delivered client work for health and education platforms (BioBrain on .NET, HodieLabs) across Australia and the US, with every fix Playwright-proven before he reports it done. His TE loop deploys to an isolated test port, runs the change through a real browser, and attaches proof screenshots, so done means verified, not claimed.",
  },
];

export default function AgentDay() {
  return (
    <Section
      id="ai-day"
      index="02"
      label="How I work"
      title="I run AI agents in production, not in a chat window"
      intro="I operate a fleet of AI agents as a working system: 15 always-on processes, 6 autonomous pipelines, and a self-learning rule set that ships client work while I sleep. I build the orchestration, the safety rails, and the tooling myself, then drive all of it from my phone."
    >
      <div className="card p-6 sm:p-8">
        <div className="space-y-4">
          {beats.map((beat, i) => (
            <Reveal key={i} delay={i * 0.06}>
              <div className="flex gap-3">
                <span className="mono mt-1 select-none text-accent">▸</span>
                <p className="text-sm leading-relaxed text-dim">{beat}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <h3 className="eyebrow mt-12 mb-4">Questions</h3>
      {faqs.map((faq, i) => (
        <Reveal key={i} delay={i * 0.06}>
          <div className="border-t border-line py-5">
            <h3 className="t-h3 text-fg">{faq.q}</h3>
            <p className="mt-2 text-sm leading-relaxed text-dim">{faq.a}</p>
          </div>
        </Reveal>
      ))}
    </Section>
  );
}
