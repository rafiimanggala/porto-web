import type { Metadata } from "next";
import Link from "next/link";
import { LabShell } from "@/components/lab/LabShell";
import Arrow from "@/components/ui/Arrow";

export const metadata: Metadata = {
  title: "Lab · Rafii Manggala",
  description:
    "Three small browser experiments, each on its own route and opt-in: a WebGL halftone, a draggable card row with a live readout, and a grid that hides a game of Snake.",
  alternates: { canonical: "/lab" },
};

const experiments = [
  {
    href: "/lab/halftone",
    name: "Wordmark halftone",
    line: "My name printed with two ink plates on a rotated dot screen, drawn by one fragment shader. Tune the dots, push the plates apart.",
    cost: "WebGL through three.js, loaded when that page opens. Works on touch: swipe up or down to scroll, drag sideways to push.",
  },
  {
    href: "/lab/drag-row",
    name: "Drag row with a readout",
    line: "The seven services as cards you drag and snap. A monospace panel shows the numbers behind the motion while you move it.",
    cost: "No canvas, no WebGL. Works on touch and keyboard.",
  },
  {
    href: "/lab/grid-trail",
    name: "Grid trail, then Snake",
    line: "A grid that lights up where your pointer has been. Keep going and it offers you a game of Snake.",
    cost: "Plain DOM grid, no canvas. Desktop only: on touch you get a note instead of a game.",
  },
];

function ExperimentCard({ href, name, line, cost }: (typeof experiments)[number]) {
  return (
    <Link href={href} className="card group flex w-full flex-col justify-between gap-8 p-6">
      <div>
        <h3 className="t-h3">{name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-dim">{line}</p>
      </div>
      <div>
        <p className="mono text-xs leading-relaxed text-mute">{cost}</p>
        <span className="mono mt-4 inline-flex min-h-11 items-center gap-2 text-sm text-fg">
          Open
          <Arrow className="transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export default function LabPage() {
  return (
    <LabShell backHref="/" backLabel="Home">
      <header className="pt-14 sm:pt-20">
        <div className="eyebrow">Lab</div>
        <h1 className="t-hero mt-4 max-w-[16ch]">Small experiments</h1>
        <p className="t-lead mt-6 max-w-[58ch] text-dim">
          Three toys that do not belong in a case study. Each lives on its own
          page and starts only when you touch it. Nothing here autoplays, and
          the cost of each one is written on its card.
        </p>
        <p className="t-body mt-4 max-w-[58ch] text-mute">
          They show craft with the browser, not AI work. The client work is in the{" "}
          <Link
            href="/#directory"
            className="text-dim underline decoration-line-strong underline-offset-4 hover:text-fg"
          >
            directory
          </Link>
          .
        </p>
      </header>

      <section aria-labelledby="lab-list" className="mt-16">
        <h2 id="lab-list" className="sr-only">
          Experiments
        </h2>
        <ul className="grid gap-4 md:grid-cols-3">
          {experiments.map((e) => (
            <li key={e.href} className="flex">
              <ExperimentCard {...e} />
            </li>
          ))}
        </ul>
      </section>
    </LabShell>
  );
}
