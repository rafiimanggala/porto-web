import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Switchboard from "@/components/Switchboard";
import Capabilities from "@/components/Capabilities";
import ProjectIndex from "@/components/ProjectIndex";
import FaqAccordion from "@/components/FaqAccordion";
import Contact from "@/components/Contact";
import AgentThreads from "@/components/visuals/AgentThreads";
import Reveal from "@/components/ui/Reveal";
import LineMask from "@/components/ui/LineMask";
import Scramble from "@/components/ui/Scramble";
import Magnetic from "@/components/ui/Magnetic";
import OrbGlyph from "@/components/ui/OrbGlyph";
import { profile } from "@/data/portfolio";

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
              lines={[
                { text: "What do you", className: "text-fg" },
                { text: "need built?", className: "text-accent", icon: true },
              ]}
            />
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="t-lead mx-auto mt-7 max-w-[54ch] text-dim">
            Seven things I get hired for. Open the one that matches your problem.
          </p>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <a
                href="#directory"
                data-unit="cta:work"
                className="block cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-colors"
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
          <div className="mx-auto mt-20 max-w-[940px] text-left">
            <AgentThreads />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[1120px] px-6 pb-16 lg:px-8 lg:pb-20">
        <Reveal>
          <div className="card flex flex-col items-start gap-6 p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
            <div className="max-w-2xl">
              <h2 className="t-h3 text-fg">How I actually work with Claude Code.</h2>
              <p className="t-body mt-4 text-dim">
                <span className="text-fg">{profile.name}</span> &middot; {profile.role}, based
                in {profile.location.split(" · ")[0]} ({profile.location.split(" · ")[1]}).{" "}
                Most people use Claude Code to write functions; I deploy it as the engine:
                always-on agents that observe, decide, and act in production.
              </p>
            </div>
            <OrbGlyph size="4.5rem" />
          </div>
        </Reveal>
      </section>

      <Capabilities />
      <Switchboard />

      <section className="mx-auto w-full max-w-[1120px] px-6 pb-16 lg:px-8 lg:pb-20">
        <Reveal>
          <div className="card p-8 sm:p-12">
            <blockquote className="t-h3 max-w-3xl text-fg">
              &ldquo;Trading bots that reach multi-model consensus before risking capital. A
              digital twin that reasons from my own decision history. An inbox that fixes
              client bugs while I sleep. The code is the easy part, the interesting work is
              the orchestration.&rdquo;
            </blockquote>
            <cite className="mono mt-6 block text-sm not-italic text-mute">
              {profile.name} &middot; {profile.role}
            </cite>
          </div>
        </Reveal>
      </section>

      <ProjectIndex index="04" />
      <FaqAccordion index="05" />
      <Contact index="06" lean />
    </main>
  );
}
