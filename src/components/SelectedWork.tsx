import type { ReactNode } from "react";
import Link from "next/link";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";
import { ACCENT } from "./mockups/accent";
import { HealthWeb1 } from "./mockups/health";
import { EduWeb1 } from "./mockups/education";
import { ShopifyWeb1 } from "./mockups/shopify";

type Case = {
  slug: string;
  title: string;
  blurb: string;
  thumb?: string;
  mockup?: ReactNode;
  mockupAccent?: string;
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
    slug: "health-platform",
    title: "Health Optimisation Platform",
    blurb:
      "Biomarkers, DNA, DEXA scans and wearables reconciled into one longevity score, with AI reasoning that connects findings across domains.",
    mockup: <HealthWeb1 accent={ACCENT.violet} />,
    mockupAccent: ACCENT.violet,
    tags: ["React", "AI insights", "Live"],
    status: "Live",
  },
  {
    slug: "education-saas",
    title: "K-12 Education SaaS",
    blurb:
      "Curriculum-aligned learning platform for schools: quiz engine, AI performance insights, shipped against a live database of 995 schools.",
    mockup: <EduWeb1 accent={ACCENT.amber} />,
    mockupAccent: ACCENT.amber,
    tags: [".NET 9", "Angular", "Live"],
    status: "Live",
  },
  {
    slug: "content-automation-pipeline",
    title: "Content Automation Pipeline",
    blurb:
      "A self-hosted n8n instance that scripts, voices and renders short-form video from RSS sources, then auto-publishes to TikTok and Instagram.",
    thumb: "/work/content-automation-pipeline/01-video-workflow.png",
    tags: ["n8n", "OpenAI", "Live"],
    status: "Live",
  },
  {
    slug: "made-to-measure-shopify",
    title: "Made-to-Measure Shopify Platform",
    blurb:
      "A body-measurement pattern-fitting editor built into a Shopify theme, plus ten Klaviyo flows that replaced every default transactional email.",
    mockup: <ShopifyWeb1 accent={ACCENT.mint} />,
    mockupAccent: ACCENT.mint,
    tags: ["Shopify", "Liquid", "Email automation"],
    status: "Live",
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
      index="05"
      label="Work"
      title="Selected work"
      intro="Case studies that show the process, not just the result: the problem, the build, and the outcome."
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cases.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.06}>
            <Link
              href={`/work/${c.slug}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface-1 transition-colors hover:border-line-strong"
            >
              <div className="relative overflow-hidden border-b border-line bg-surface-2">
                {c.mockup ? (
                  <div
                    className="aspect-[16/10] w-full p-4 transition-transform duration-500 group-hover:scale-[1.03] sm:p-5"
                    style={{
                      background: `radial-gradient(120% 90% at 50% -10%, ${c.mockupAccent}0f, transparent 60%), var(--color-surface-1)`,
                    }}
                  >
                    {c.mockup}
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={c.thumb}
                    alt={`${c.title} preview`}
                    loading="lazy"
                    className="block aspect-[16/10] w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                )}
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
