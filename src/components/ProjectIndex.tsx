import { projectIndex } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

export default function ProjectIndex() {
  return (
    <Section
      id="index"
      index="08"
      label="The rest of the shelf"
      title="More things I've shipped."
      intro="A sample of the other 40-odd repos. Hover a row for the stack."
    >
      <div className="grid gap-x-8 gap-y-10 lg:grid-cols-3">
        {projectIndex.map((g, gi) => (
          <Reveal key={g.group} delay={gi * 0.05}>
            <h3 className="eyebrow mb-3">{g.group}</h3>
            <ul className="-mx-2">
              {g.items.map((it) => (
                <li
                  key={it.name}
                  className="group cursor-default rounded-md px-2 py-2 transition-colors duration-200 hover:bg-surface-1"
                >
                  <div className="font-[family-name:var(--font-display)] text-sm font-semibold text-fg">
                    {it.name}
                  </div>
                  <div className="mt-0.5 text-xs leading-relaxed text-dim">
                    {it.note}
                  </div>
                  <div className="mono mt-1 max-h-0 overflow-hidden text-[10px] text-mute opacity-0 transition-all duration-200 group-hover:max-h-6 group-hover:opacity-100">
                    {it.stack}
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
