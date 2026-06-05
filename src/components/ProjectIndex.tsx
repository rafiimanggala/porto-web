import { projectIndex } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

export default function ProjectIndex() {
  return (
    <Section
      id="index"
      index="05"
      label="The rest of the shelf"
      title="More things I've shipped."
      intro="A sample of the other 40-odd repos: autonomous bots, full-stack products, financial terminals, native apps, and developer tooling."
    >
      <div className="space-y-12">
        {projectIndex.map((g, gi) => (
          <Reveal key={g.group} delay={gi * 0.05}>
            <div>
              <h3 className="eyebrow mb-4">{g.group}</h3>
              <ul className="divide-y divide-line border-y border-line">
                {g.items.map((it) => (
                  <li
                    key={it.name}
                    className="group flex flex-col gap-1 px-2 py-4 transition-colors duration-200 hover:bg-surface-1 sm:flex-row sm:items-baseline sm:gap-6"
                  >
                    <span className="min-w-[12rem] font-[family-name:var(--font-display)] text-sm font-semibold text-fg">
                      {it.name}
                    </span>
                    <span className="flex-1 text-sm text-dim">{it.note}</span>
                    <span className="mono text-[11px] text-mute">{it.stack}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
