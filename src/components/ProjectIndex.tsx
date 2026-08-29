import Link from "next/link";
import { profile, projectIndex } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

// `cardStyle` is the bordered-card treatment the homepage uses (matches the
// x.ai/bot reference clone's pricing-grid-shaped project index, middle card
// featured). `/dev` keeps the original plain list, so this stays opt-in.
export default function ProjectIndex({
  index = "08",
  cardStyle = false,
}: {
  index?: string;
  cardStyle?: boolean;
}) {
  if (!cardStyle) {
    return (
      <Section
        id="index"
        index={index}
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

  const mid = Math.floor(projectIndex.length / 2);

  return (
    <Section
      id="index"
      index={index}
      label="Project index"
      title="Everything else, grouped"
    >
      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        {projectIndex.map((g, gi) => {
          const featured = gi === mid;
          return (
            <Reveal key={g.group} delay={gi * 0.05} className="h-full">
              <div
                className={`card flex h-full flex-col p-6 ${featured ? "border-accent" : ""}`}
              >
                <h3 className="t-h3 text-base text-fg">{g.group}</h3>
                <div className="mono mt-3 flex items-baseline gap-1.5">
                  <span className="text-2xl font-semibold text-fg">{g.items.length}</span>
                  <span className="text-xs text-mute">projects</span>
                </div>
                <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                  {g.items.map((it) => (
                    <li key={it.name} className="text-xs leading-relaxed text-dim">
                      <span className="font-medium text-fg">{it.name}</span> &mdash; {it.note}
                    </li>
                  ))}
                </ul>
                {featured ? (
                  <a
                    href="#directory"
                    className="mono mt-6 block cursor-pointer rounded-full bg-accent px-4 py-2 text-center text-[11px] font-medium text-bg transition-colors"
                  >
                    See the work &#8599;
                  </a>
                ) : (
                  <Link
                    href={profile.github}
                    target="_blank"
                    rel="noreferrer"
                    className="mono mt-6 block cursor-pointer rounded-full border border-line-strong px-4 py-2 text-center text-[11px] text-fg transition-colors hover:border-accent hover:text-accent"
                  >
                    See the repos &#8599;
                  </Link>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>
    </Section>
  );
}
