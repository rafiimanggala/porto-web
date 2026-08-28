import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Switchboard from "@/components/Switchboard";
import Contact from "@/components/Contact";
import AgentThreads from "@/components/visuals/AgentThreads";
import Reveal from "@/components/ui/Reveal";
import LineMask from "@/components/ui/LineMask";
import Scramble from "@/components/ui/Scramble";
import Magnetic from "@/components/ui/Magnetic";
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
                { text: "What do you", className: "text-grad" },
                { text: "need built?", className: "text-accent" },
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
          <div className="mx-auto mt-16 max-w-[940px] text-left">
            <AgentThreads />
          </div>
        </Reveal>
      </section>

      <section className="mx-auto w-full max-w-[1120px] px-6 pb-16 text-center lg:px-8 lg:pb-20">
        <Reveal>
          <p className="t-body mx-auto max-w-[62ch] text-dim">
            <span className="text-fg">{profile.name}</span> &middot; {profile.role},
            based in {profile.location.split(" · ")[0]} ({profile.location.split(" · ")[1]}).
            Most people use Claude Code to write functions; I deploy it as the engine:
            always-on agents that observe, decide, and act in production.
          </p>
        </Reveal>
      </section>

      <Switchboard />
      <Contact index="02" lean />
    </main>
  );
}
