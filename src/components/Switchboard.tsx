import Link from "next/link";
import Reveal from "./ui/Reveal";
import Scramble from "./ui/Scramble";
import SwitchboardPanel from "./SwitchboardPanel";
import SwitchboardPreview from "./SwitchboardPreview";
import { skills } from "@/data/skills";

// The directory. Seven equal bays in one panel, one press each. Deliberately
// not a bento: no hero cell, no col-span. Order is the only ranking lever, and
// equal weight is what makes it scannable in a few seconds.
//
// Each bay carries one miniature (SwitchboardPreview) so the shape of the work
// reads before the copy does. Same box height in every bay, so the media area
// stays a rhythm rather than a size contest between cards.
//
// Seven doesn't divide evenly into the 3-column desktop row (3/3/1): the last
// card is re-centred under the middle column with col-start rather than given
// a col-span, so the lone-card row still reads as one grid, not a leftover.
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
          press 1 to 7
        </span>
      </div>

      {/* One Reveal for the whole panel, not the house delay={(i % 3) * 0.06}
          stagger. Seven independent transforms inside a gap-px grid shear the 1px
          seams during the rise and break the single-object read. */}
      <Reveal delay={0.15}>
        <SwitchboardPanel className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((s, i) => (
            <li
              key={s.slug}
              className={`flex${i === skills.length - 1 && skills.length % 3 === 1 ? " lg:col-start-2" : ""}`}
            >
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
                    {s.proof.length} {s.proof.length === 1 ? "case" : "cases"}
                  </span>
                </div>

                <SwitchboardPreview slug={s.slug} />

                <h3
                  id={`${s.slug}-t`}
                  className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold leading-[1.15] tracking-[-0.02em] text-fg"
                >
                  {s.title}
                </h3>

                <p
                  id={`${s.slug}-v`}
                  className="mt-4 text-sm leading-relaxed text-dim"
                >
                  {s.value}
                </p>

                <p className="mono mt-4 flex items-start gap-1.5 text-[11px] text-dim">
                  {/* a real glyph, not a text triangle: U+25B8 renders as an
                      emoji slot on some platforms and reads as icon-by-emoji. */}
                  <svg
                    aria-hidden
                    viewBox="0 0 8 8"
                    width="8"
                    height="8"
                    className="mt-[5px] shrink-0"
                  >
                    <path d="M2 1 L6 4 L2 7 Z" fill="var(--color-accent)" />
                  </svg>
                  <span>{s.evidence}</span>
                </p>

                <p className="mono mt-2 mb-6 truncate text-[11px] text-mute">
                  {s.tools.slice(0, 3).join(" · ")}
                  {s.tools.length > 3 ? ` +${s.tools.length - 3}` : ""}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-line pt-4">
                  <span className="mono text-[11px] text-mute transition-colors duration-200 group-hover:text-accent group-focus-visible:text-accent">
                    Open
                  </span>
                  {/* drawn, not typed: a U+2192 in a 1-glyph span is indexed as
                      an icon-by-character and its width shifts per platform. */}
                  <svg
                    aria-hidden
                    viewBox="0 0 20 8"
                    width="20"
                    height="8"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="1.25"
                    className="transition-transform duration-200 group-hover:translate-x-1 group-focus-visible:translate-x-1"
                  >
                    <path d="M0 4 H18" strokeLinecap="round" />
                    <path d="M14.5 1 L18 4 L14.5 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </SwitchboardPanel>
      </Reveal>
    </section>
  );
}
