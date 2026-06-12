import Link from "next/link";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

type Case = {
  slug: string;
  title: string;
  blurb: string;
  thumb: string;
  tags: string[];
  status: string;
};

const cases: Case[] = [
  {
    slug: "streak",
    title: "Streak",
    blurb:
      "A warm, encouraging habit tracker. From a one-line problem to a clickable prototype: research, user flow, a small design system, and five responsive screens.",
    thumb: "/work/streak/d-home.png",
    tags: ["Product design", "Design system", "Prototype"],
    status: "Prototype",
  },
  {
    slug: "spotter-eld",
    title: "Spotter ELD",
    blurb:
      "Turning a regulated, paper-heavy task (truck route planning and Hours-of-Service logs) into one calm screen. Shipped and live.",
    thumb: "/work/spotter-eld/06-results-top.png",
    tags: ["UX", "Web app", "Live"],
    status: "Live",
  },
];

export default function SelectedWork() {
  return (
    <Section
      id="uiux"
      index="00"
      label="UI/UX"
      title="Selected UI/UX work"
      intro="Two case studies that show the process, not just the result: the problem, the flow, the system, and the screens."
    >
      <div className="grid gap-6 sm:grid-cols-2">
        {cases.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.06}>
            <Link
              href={`/work/${c.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-1 transition-colors hover:border-line-strong"
            >
              <div className="relative overflow-hidden border-b border-line bg-surface-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.thumb}
                  alt={`${c.title} preview`}
                  loading="lazy"
                  className="block aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
                <span className="mono absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-bg/70 px-2.5 py-1 text-[0.7rem] text-dim backdrop-blur">
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      c.status === "Live" ? "bg-accent" : "bg-[#f6b667]"
                    }`}
                  />
                  {c.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <h3 className="t-h3 text-fg">{c.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-dim">
                  {c.blurb}
                </p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {c.tags.map((t) => (
                    <span
                      key={t}
                      className="mono rounded-full border border-line px-2.5 py-1 text-[0.7rem] text-mute"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <span className="mono mt-5 inline-flex items-center gap-2 text-sm text-accent">
                  View case study
                  <span className="transition-transform group-hover:translate-x-1" aria-hidden>
                    &rarr;
                  </span>
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
