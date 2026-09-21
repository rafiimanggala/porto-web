import type { Metadata } from "next";
import { LabShell, LabHeader } from "@/components/lab/LabShell";
import HalftonePanel from "@/components/lab/halftone/HalftonePanel";

export const metadata: Metadata = {
  title: "Wordmark halftone · Lab · Rafii Manggala",
  description:
    "My name printed as a two-plate halftone by a single WebGL fragment shader. Tune the dot pitch, screen angle and plate separation, and push the plates apart with the pointer.",
  alternates: { canonical: "/lab/halftone" },
};

const notes = [
  "The name is drawn into a 2D canvas first, then read as a texture by one fragment shader on a full-screen quad.",
  "Two plates, one per ink, each on its own rotated screen. Every dot is sized by the tone under its centre, so a dot is always a clean circle.",
  "Press and drag on the panel and the plates slide toward the pointer, then ease back on release. The separation slider does the same job with the keyboard.",
  "It draws a frame only when something changes, then stops. The pixel ratio is capped, and the loop pauses when the tab is hidden or the panel is off screen.",
];

export default function HalftonePage() {
  return (
    <LabShell>
      <LabHeader
        eyebrow="Lab"
        title="Wordmark halftone"
        lead="A print-shop trick in a shader: two ink plates on a rotated dot screen, slightly out of register. Nothing moves until you touch it."
        cost="WebGL through three.js, loaded when this page opens. On touch, swipe up or down to scroll past the panel, and drag sideways on it to push the plates."
      />

      <section aria-label="Halftone panel" className="mt-12">
        <HalftonePanel />
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
