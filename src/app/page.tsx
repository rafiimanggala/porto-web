import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Switchboard from "@/components/Switchboard";
import Contact from "@/components/Contact";
import Reveal from "@/components/ui/Reveal";
import LineMask from "@/components/ui/LineMask";
import Scramble from "@/components/ui/Scramble";

export const metadata: Metadata = {
  title: "Rafii Manggala · Web apps, AI features, automation",
  description:
    "Six things I get hired for: full-stack web apps, AI features inside products, automation, AI video at scale, design and prototypes, and fixing live systems.",
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <main className="relative">
      <Nav variant="home" />

      <section className="mx-auto w-full max-w-[1120px] px-6 pt-16 pb-12 lg:px-8 lg:pt-20 lg:pb-16">
        <Reveal>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-surface-2/60 px-3 py-1">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <Scramble text="Available · Remote · UTC+7" className="eyebrow" />
          </div>
        </Reveal>

        <Reveal>
          <h1 className="t-h2">
            <LineMask
              lines={[
                { text: "What do you", className: "text-grad" },
                { text: "need built?", className: "text-accent" },
              ]}
            />
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="t-body mt-4 max-w-[54ch] text-dim">
            Six things I get hired for. Open the one that matches your problem.
          </p>
        </Reveal>
      </section>

      <Switchboard />
      <Contact index="02" lean />
    </main>
  );
}
