import type { ReactNode } from "react";
import Reveal from "./Reveal";
import Scramble from "./Scramble";

// Heading helper shared by the dark pages and the cream home.
// Dark: terminal eyebrow ("// 05 · FAQ") + hairline + Space Grotesk title.
// Cream: a pastel highlighter chip (no numbering) + chunky violet display title.
// The cream look is scoped with [.theme-light_&] so the dark pages do not change.
export default function Section({
  id,
  index,
  label,
  title,
  intro,
  children,
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-6 py-[clamp(5rem,3rem+9vw,11rem)] lg:px-8 [.theme-light_&]:py-[clamp(4rem,2.5rem+6vw,7.5rem)]"
    >
      <Reveal>
        <div className="mb-4 flex items-center gap-3 [.theme-light_&]:hidden">
          <Scramble text={`// ${index} · ${label}`} className="eyebrow" />
          <span className="hairline flex-1" />
        </div>
        <span className="mb-6 hidden w-fit rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-fg [.theme-light_&]:inline-flex">
          {label}
        </span>
        <h2 className="t-h2 max-w-3xl text-fg [.theme-light_&]:max-w-4xl [.theme-light_&]:text-[clamp(3rem,2.2rem+2.4vw,4rem)] [.theme-light_&]:font-normal [.theme-light_&]:leading-[1.02] [.theme-light_&]:tracking-[-0.01em] [.theme-light_&]:text-accent">
          {title}
        </h2>
        {intro && (
          <p className="t-body mt-5 max-w-2xl text-balance text-dim">{intro}</p>
        )}
      </Reveal>
      <div className="mt-12 [.theme-light_&]:mt-10">{children}</div>
    </section>
  );
}
