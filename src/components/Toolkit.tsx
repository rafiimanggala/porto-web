import { toolkit } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

export default function Toolkit() {
  return (
    <Section
      id="toolkit"
      index="02"
      label="Custom toolkit"
      title="The tools I built to build faster."
      intro="15+ skills, hooks, and CLIs wrapped around Claude Code: a self-improving agent, a knowledge-graph engine, cursor-isolated automation, and more."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        {toolkit.map((t, i) => (
          <Reveal key={t.name} delay={(i % 2) * 0.06} className="h-full">
            <div className="group flex h-full flex-col bg-surface-1 p-6 transition-colors duration-200 hover:bg-surface-2">
              <div className="flex items-center justify-between">
                <code className="mono text-xs text-accent">
                  <span className="text-mute">$</span> {t.cmd}
                </code>
                <span className="mono rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-mute">
                  {t.type}
                </span>
              </div>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-fg">
                {t.name}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-dim">{t.desc}</p>
              <p className="mt-3 border-l-2 border-line pl-3 text-xs leading-relaxed text-mute">
                {t.why}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
