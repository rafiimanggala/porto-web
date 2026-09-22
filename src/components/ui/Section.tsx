import type { ReactNode } from "react";
import Reveal from "./Reveal";
import Scramble from "./Scramble";

// Heading helper shared by the dark pages and the green home.
// Dark (default): terminal eyebrow ("// 05 · FAQ") + hairline + Space Grotesk title.
// Green (home): a pastel highlighter chip (no numbering) + chunky orange display title.
// The green look is scoped with [.theme-green_&] so the other pages do not change.
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
      className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-6 py-[clamp(5rem,3rem+9vw,11rem)] lg:px-8 [.theme-green_&]:py-[clamp(4rem,2.5rem+6vw,7.5rem)]"
    >
      <Reveal>
        <div className="mb-4 flex items-center gap-3 [.theme-green_&]:hidden">
          <Scramble text={`// ${index} · ${label}`} className="eyebrow" />
          <span className="hairline flex-1" />
        </div>
        <span className="mb-6 hidden w-fit rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-pastel-ink [.theme-green_&]:inline-flex">
          {label}
        </span>
        <h2 className="t-h2 max-w-3xl text-fg [.theme-green_&]:max-w-4xl [.theme-green_&]:text-[clamp(3rem,2.2rem+2.4vw,4rem)] [.theme-green_&]:font-normal [.theme-green_&]:leading-[1.02] [.theme-green_&]:tracking-[-0.01em] [.theme-green_&]:text-accent">
          {title}
        </h2>
        {intro && (
          <p className="t-body mt-5 max-w-2xl text-balance text-dim">{intro}</p>
        )}
      </Reveal>
      <div className="mt-12 [.theme-green_&]:mt-10">{children}</div>
    </section>
  );
}
