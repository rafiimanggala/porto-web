import type { Metadata } from "next";
import { BrowserWindow } from "@/components/mockups/frame";
import { ACCENT } from "@/components/mockups/accent";
import { HealthAnimatedCard, EducationAnimatedCard } from "@/components/mockups/motion";

// Same belt-and-suspenders as mockup-preview: internal tool, not linked,
// not in sitemap.ts, noindexed.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Deterministic single-frame renderer for the WorkReel video previews.
// `?project=health|education&progress=0..1` renders the animated card at
// EXACTLY that point in its reveal timeline -- see motion.tsx's header
// comment for why this is a pure function of `progress` rather than a
// real-time animation. scripts/record-mockup-video.mjs drives this page
// frame-by-frame (via chrome-devtools MCP) and assembles the frames into an
// mp4 with ffmpeg; this page itself has no timers or animation state.
export default async function MockupVideo({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; progress?: string }>;
}) {
  const { project, progress } = await searchParams;
  const p = Math.max(0, Math.min(1, Number(progress ?? "0") || 0));
  const isEdu = project === "education";
  const accent = isEdu ? ACCENT.amber : ACCENT.violet;
  const label = isEdu ? "class insights" : "dashboard";

  return (
    <div className="min-h-screen bg-surface-1 p-10">
      <div id="shot-target" className="mx-auto w-full max-w-[812px]">
        <BrowserWindow accent={accent} label={label}>
          {isEdu ? <EducationAnimatedCard progress={p} /> : <HealthAnimatedCard progress={p} />}
        </BrowserWindow>
      </div>
    </div>
  );
}
