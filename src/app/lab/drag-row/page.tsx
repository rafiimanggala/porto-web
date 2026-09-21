import type { Metadata } from "next";
import { LabShell, LabHeader } from "@/components/lab/LabShell";
import DragRow from "@/components/lab/drag-row/DragRow";
import { skills } from "@/data/skills";

export const metadata: Metadata = {
  title: "Drag row with a live readout · Lab · Rafii Manggala",
  description:
    "The seven services as cards you drag and snap, with a monospace readout of x, velocity, progress, snapped index and direction updating live.",
  alternates: { canonical: "/lab/drag-row" },
};

export default function DragRowPage() {
  return (
    <LabShell>
      <LabHeader
        eyebrow="Lab"
        title="Drag row with a live readout"
        lead={`The ${skills.length} services as cards. Drag the row, flick it, and it snaps to the nearest card while the numbers behind the motion update beneath it.`}
        cost="No canvas and no WebGL. Works with touch, mouse and keyboard, and vertical scrolling still works on touch."
      />

      <section aria-label="Draggable service cards" className="mt-12">
        <DragRow />
      </section>

      <section aria-labelledby="how" className="mt-16">
        <h2 id="how" className="t-h3">
          How it works
        </h2>
        <ul className="mt-6 grid max-w-[68ch] gap-3 text-dim">
          <li className="t-body">
            Framer Motion drives one motion value for the row. The readout listens to that value and writes text
            straight into the page, so nothing re-renders per frame. The x value is in pixels and the velocity in pixels per second.
          </li>
          <li className="t-body">
            Letting go projects your flick a short way ahead, then springs to the nearest card. With reduced motion
            on, there is no projection and no spring: it snaps in place.
          </li>
          <li className="t-body">
            Arrow keys, Home and End step through the cards, and so do the two buttons, for anyone who does not want to drag.
          </li>
        </ul>
      </section>
    </LabShell>
  );
}
