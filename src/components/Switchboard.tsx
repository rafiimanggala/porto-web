import Link from "next/link";
import Reveal from "./ui/Reveal";
import Scramble from "./ui/Scramble";
import SwitchboardPanel from "./SwitchboardPanel";
import { skills } from "@/data/skills";

// The directory. Six equal bays in one panel, one press each. Deliberately not
// a bento: no hero cell, no col-span, no thumbnails. Order is the only ranking
// lever, and equal weight is what makes it scannable in a few seconds.
export default function Switchboard() {
  return (
    <section
      id="directory"
      aria-labelledby="directory-h"
      className="mx-auto w-full max-w-[1120px] scroll-mt-20 px-6 pb-16 lg:px-8"
    >
      <h2 id="directory-h" className="sr-only">
        What I get hired for
      </h2>
      <div className="flex items-center gap-4">
        <Scramble text="// 01 · Directory" className="eyebrow" />
        <span className="hairline flex-1" />
        <span className="mono hidden text-[11px] text-mute lg:inline">
          press 1 to 6
        </span>
      </div>

      {/* One Reveal for the whole panel, not the house delay={(i % 3) * 0.06}
          stagger. Six independent transforms inside a gap-px grid shear the 1px
          seams during the rise and break the single-object read. */}
      <Reveal delay={0.15}>
        <SwitchboardPanel className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s) => (
            <li key={s.slug} className="flex">
              {/* outline-offset is negative on purpose: the panel wrapper is
                  overflow-hidden and clips the global +3px ring on interior
                  cell edges. */}
              <Link
                href={`/skills/${s.slug}`}
                aria-labelledby={`${s.slug}-t ${s.slug}-v`}
                aria-keyshortcuts={String(s.n)}
                data-unit={`skill:${s.slug}`}
                className="group relative flex h-full w-full cursor-pointer flex-col bg-surface-1 p-6 transition-colors duration-200 before:absolute before:inset-y-0 before:left-0 before:w-[2px] before:origin-top before:scale-y-0 before:bg-accent before:transition-transform before:duration-200 before:ease-[cubic-bezier(0.165,0.84,0.44,1)] hover:bg-surface-2 hover:before:scale-y-100 focus-visible:bg-surface-2 focus-visible:[outline-offset:-3px] focus-visible:before:scale-y-100 active:bg-surface-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    aria-hidden
                    className="mono nums rounded-sm border border-line px-1.5 py-0.5 text-[11px] text-mute transition-colors duration-200 group-hover:border-accent group-hover:text-accent group-focus-visible:border-accent group-focus-visible:text-accent"
                  >
                    {s.n}
                  </span>
                  <span className="mono text-[11px] text-mute">
                    {s.proof.length} cases
                  </span>
                </div>

                <h3
                  id={`${s.slug}-t`}
                  className="mt-6 font-[family-name:var(--font-display)] text-xl font-semibold leading-[1.15] tracking-[-0.02em] text-fg"
                >
                  {s.title}
                </h3>

                <p
                  id={`${s.slug}-v`}
                  className="mt-4 text-sm leading-relaxed text-dim"
                >
                  {s.value}
                </p>

                <p className="mono mt-4 text-[11px] text-dim">
                  <span aria-hidden className="text-accent">
                    &#9656;
                  </span>{" "}
                  {s.evidence}
                </p>

                <p className="mono mt-2 mb-6 truncate text-[11px] text-mute">
                  {s.tools.slice(0, 3).join(" · ")}
                  {s.tools.length > 3 ? ` +${s.tools.length - 3}` : ""}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
                  <span className="mono text-[11px] text-mute transition-colors duration-200 group-hover:text-accent group-focus-visible:text-accent">
                    Open
                  </span>
                  <span
                    aria-hidden
                    className="text-accent transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
                  >
                    &rarr;
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </SwitchboardPanel>
      </Reveal>
    </section>
  );
}
