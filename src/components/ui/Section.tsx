import type { ReactNode } from "react";
import Reveal from "./Reveal";
import Scramble from "./Scramble";

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
      className="mx-auto w-full max-w-[1120px] scroll-mt-24 px-6 py-[clamp(5rem,3rem+9vw,11rem)] lg:px-8"
    >
      <Reveal>
        <div className="mb-4 flex items-center gap-3">
          <Scramble text={`// ${index} · ${label}`} className="eyebrow" />
          <span className="hairline flex-1" />
        </div>
        <h2 className="t-h2 max-w-3xl text-fg">{title}</h2>
        {intro && (
          <p className="t-body mt-5 max-w-2xl text-balance text-dim">{intro}</p>
        )}
      </Reveal>
      <div className="mt-12">{children}</div>
    </section>
  );
}
