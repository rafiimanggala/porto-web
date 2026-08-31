import type { Metadata } from "next";
import Link from "next/link";
import Nav from "@/components/Nav";
import FaqAccordion from "@/components/FaqAccordion";
import Contact from "@/components/Contact";
import FooterLinks from "@/components/FooterLinks";
import AgentThreads from "@/components/visuals/AgentThreads";
import SwitchboardPreview from "@/components/SwitchboardPreview";
import Reveal from "@/components/ui/Reveal";
import LineMask from "@/components/ui/LineMask";
import Scramble from "@/components/ui/Scramble";
import Magnetic from "@/components/ui/Magnetic";
import { skills } from "@/data/skills";

export const metadata: Metadata = {
  title: "Rafii Manggala · Web apps, AI features, automation",
  description:
    "Seven things I get hired for: full-stack web apps, AI features inside products, automation, AI video at scale, design and prototypes, fixing live systems, and custom Shopify builds.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="relative">
      <Nav variant="home" />

      <section className="mx-auto w-full max-w-[1120px] px-6 pt-20 pb-16 text-center lg:px-8 lg:pt-28 lg:pb-20">
        <Reveal>
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface-2/60 px-3 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <Scramble text="Available · Remote · UTC+7" className="eyebrow" />
          </div>
        </Reveal>

        <Reveal>
          <h1 className="t-hero">
            <LineMask
              lines={[{ text: "What do you need built?", className: "text-fg", icon: true }]}
            />
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="t-lead mx-auto mt-7 max-w-[54ch] text-dim">
            I build systems where AI agents do the work, not just write the code. Seven
            things I get hired for below.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <a
                href="#directory"
                data-unit="cta:work"
                className="block cursor-pointer rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-colors"
              >
                View the work
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="#contact"
                data-unit="cta:contact"
                className="mono block cursor-pointer rounded-full border border-line px-5 py-2.5 text-sm text-fg transition-colors hover:border-line-strong"
              >
                Get in touch
              </a>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mx-auto mt-[88px] max-w-[740px] text-left">
            <AgentThreads />
          </div>
        </Reveal>
      </section>

      <section
        id="directory"
        aria-labelledby="directory-h"
        className="mx-auto w-full max-w-[1120px] scroll-mt-20 px-6 pb-24 lg:px-8 lg:pb-32"
      >
        <Reveal>
          <div className="flex items-center gap-4">
            <Scramble text="// View the work" className="eyebrow" />
            <span className="hairline flex-1" />
          </div>
          <h2 id="directory-h" className="t-h2 mt-5 text-fg">
            Seven things I get hired for.
          </h2>
          <p className="t-body mt-3 max-w-[54ch] text-dim">
            Press any card for the case study, the numbers, and the stack behind it.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {skills.map((s) => (
              <Link
                key={s.slug}
                href={`/skills/${s.slug}`}
                data-unit={`skill:${s.slug}`}
                className="group flex flex-col gap-4 rounded-xl border border-line bg-surface-1 p-4 transition-colors duration-200 hover:bg-surface-2"
              >
                <SwitchboardPreview slug={s.slug} />
                <div>
                  <span className="mono nums text-[11px] text-mute">{s.n}</span>
                  <h3 className="mt-1 text-sm font-medium text-fg">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-dim">{s.value}</p>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      </section>

      <FaqAccordion index="05" />
      <Contact index="06" lean hideHeading />
      <FooterLinks />
    </main>
  );
}
