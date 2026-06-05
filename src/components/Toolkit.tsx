import { toolkit, capabilities } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import ToolVisual from "./visuals/toolVisuals";

export default function Toolkit() {
  return (
    <Section
      id="toolkit"
      index="02"
      label="Custom toolkit"
      title="The tools I built to build faster."
      intro="15+ skills, hooks, and CLIs wrapped around Claude Code. The interesting work isn't prompting, it's the harness around it."
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
        {toolkit.map((t, i) => (
          <Reveal key={t.name} delay={(i % 2) * 0.06} className="h-full">
            <div
              data-unit={`tool:${t.name}`}
              className="group flex h-full flex-col bg-surface-1 p-6 transition-colors duration-200 hover:bg-surface-2"
            >
              <ToolVisual name={t.name} />
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

      {/* Capabilities, folded in as a compact strip */}
      <Reveal delay={0.1}>
        <div className="mt-10 rounded-2xl border border-line bg-surface-1 p-6 sm:p-8">
          <h3 className="eyebrow mb-5">Orchestration, not autocomplete</h3>
          <div className="grid gap-x-10 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {capabilities.map((c) => (
              <div key={c.title} className="flex gap-2.5">
                <span className="mt-1 select-none text-accent">▸</span>
                <div>
                  <div className="text-sm font-medium text-fg">{c.title}</div>
                  <div className="mt-0.5 text-xs leading-relaxed text-mute">
                    {c.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
