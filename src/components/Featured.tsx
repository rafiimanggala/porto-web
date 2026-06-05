import { featured, type Project } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import SpotlightCard from "./ui/SpotlightCard";

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

function Highlights({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((h) => (
        <li key={h} className="flex gap-2.5 text-sm leading-relaxed text-dim">
          <span className="mt-1.5 select-none text-accent">▸</span>
          <span>{h}</span>
        </li>
      ))}
    </ul>
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

export default function Featured() {
  const [hero, ...rest] = featured;
  return (
    <Section
      id="work"
      index="01"
      label="Selected work"
      title="Systems that run themselves."
      intro="A few builds where the AI isn't a sidekick, it's the engine making decisions in production. Client work is anonymized; personal projects link to source."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {/* wide hero card */}
        <Reveal className="md:col-span-2">
          <SpotlightCard className="flex h-full flex-col p-6 sm:p-8 lg:grid lg:grid-cols-[1fr_1.1fr] lg:gap-10">
            <div className="flex flex-col">
              <Meta p={hero} />
              <h3 className="t-h3 mt-4 text-fg">{hero.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-dim">
                {hero.oneLiner}
              </p>
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

        {rest.map((p, i) => (
          <Reveal key={p.id} delay={(i % 2) * 0.08} className="h-full">
            <SpotlightCard className="flex h-full flex-col p-6 sm:p-7">
              <Meta p={p} />
              <h3 className="t-h3 mt-4 text-fg">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">
                {p.oneLiner}
              </p>
              <div className="mt-5">
                <Highlights items={p.highlights} />
              </div>
              <Tags p={p} />
            </SpotlightCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
