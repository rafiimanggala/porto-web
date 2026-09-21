import type { Metadata } from "next";
import { LabShell, LabHeader } from "@/components/lab/LabShell";
import GridTrail from "@/components/lab/grid-trail/GridTrail";

export const metadata: Metadata = {
  title: "Grid trail, then Snake · Lab · Rafii Manggala",
  description:
    "A grid that lights up where your pointer has been and, after a few cells, offers a game of Snake. Desktop only, opt-in, and it never starts by itself.",
  alternates: { canonical: "/lab/grid-trail" },
};

const notes = [
  "The grid is plain divs. Moving over a cell sets a data attribute for a moment and a CSS transition fades it out, so the trail costs no React renders.",
  "After about ten different cells a panel rises and offers a game. Nothing starts until you press Start.",
  "The snake steers toward the cell under your pointer, or use the arrow keys. It wraps at the edges, and only running into itself ends the game.",
  "The rules live in a small pure module with a seedable random source, so a game can be replayed from a seed.",
  "With reduced motion on, there is no trail and the invitation is simply there. On touch or a narrow screen, there is no game at all.",
];

export default function GridTrailPage() {
  return (
    <LabShell>
      <LabHeader
        eyebrow="Lab"
        title="Grid trail, then Snake"
        lead="Drag your pointer across the grid and it remembers where you have been. Keep going and it asks whether you want to play."
        cost="A plain DOM grid, no canvas and no WebGL. Desktop with a mouse or keyboard only: on touch or a narrow screen you get a note instead of a game."
      />

      <section aria-label="Grid" className="mt-12">
        <GridTrail />
      </section>

      <section aria-labelledby="how" className="mt-16">
        <h2 id="how" className="t-h3">
          How it works
        </h2>
        <ul className="mt-6 grid max-w-[68ch] gap-3 text-dim">
          {notes.map((n) => (
            <li key={n} className="t-body">
              {n}
            </li>
          ))}
        </ul>
      </section>
    </LabShell>
  );
}
