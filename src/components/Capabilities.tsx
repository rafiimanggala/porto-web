import { capabilities } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

export default function Capabilities() {
  return (
    <Section
      id="capabilities"
      index="03"
      label="How I work with AI"
      title="Orchestration, not autocomplete."
      intro="The interesting work isn't prompting, it's the harness. Fleets of parallel agents, adversarial review panels, and self-correcting loops."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
        {capabilities.map((c, i) => (
          <Reveal key={c.title} delay={(i % 3) * 0.05} className="h-full">
            <div className="flex h-full flex-col bg-surface-1 p-6 transition-colors duration-200 hover:bg-surface-2">
              <span className="mono nums text-xs text-accent">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-fg">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
