import type { Metadata } from "next";
import { LabShell, LabHeader } from "@/components/lab/LabShell";
import { PixelScenesMount } from "@/components/pixel/PixelMount";
import { PIECES } from "@/pixel/data";
import "@/components/pixel/pixel.css";

export const metadata: Metadata = {
  title: "Pixel scenes · Lab · Rafii Manggala",
  description:
    "Four places drawn entirely in code, with no image files: a lagoon in Raja Ampat at noon, a floating temple at dusk, a neon street in the rain and Jakarta at two in the morning.",
  alternates: { canonical: "/lab/pixel-scenes" },
};

const notes = [
  "Each scene is its own program. It writes a colour for every pixel of a small frame, 480 by 270 (Jakarta is 320 by 180), and the frame goes onto a canvas scaled up by whole pixels so the edges stay sharp.",
  "No image files and no random numbers: every frame is worked out from the clock, so the still frame you see before pressing Play is the same one every time.",
  "One scene plays at a time, and a scene that scrolls out of view stops drawing until it comes back.",
];

const PLAY_PATH = "M4 2h2v1h2v1h2v1h2v1h1v4h-1v1h-2v1H8v1H6v1H4z";

export default function PixelScenesPage() {
  return (
    <LabShell>
      <LabHeader
        eyebrow="Lab"
        title="Pixel scenes"
        lead="Four places I drew in code: a lagoon in Raja Ampat, a temple on floating islands at dusk, a neon street in the rain and Jakarta at two in the morning. Each waits on a still frame until you press Play."
        cost="Plain 2D canvas, no WebGL. The scene code loads when this page opens, and starting one scene stops the others."
      />

      <section aria-label="Scenes" className="mt-12">
        <ul id="pixel-scenes" className="px-lab scenes">
          {PIECES.map((pc) => (
            <li key={pc.id} className="scene" data-scene={pc.id}>
              <div className="scene-screen">
                <canvas aria-hidden="true" />
              </div>
              <h2 className="t-h3 mt-5">{pc.name}</h2>
              <p className="t-body mt-2 text-dim">{pc.detail}</p>
              <p className="mono mt-2 text-xs text-mute">
                {pc.w} by {pc.h} pixels, drawn by code.
              </p>
              <button
                type="button"
                aria-pressed="false"
                aria-label={`Play ${pc.name}`}
                className="mono mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-5 text-sm text-fg transition-colors hover:border-line-strong aria-pressed:border-sun aria-pressed:bg-sun aria-pressed:text-pastel-ink"
              >
                <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" aria-hidden="true">
                  <path d={PLAY_PATH} />
                </svg>
                Play
              </button>
            </li>
          ))}
        </ul>
        <PixelScenesMount />
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
