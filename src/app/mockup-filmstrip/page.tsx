import type { Metadata } from "next";
import { BrowserWindow } from "@/components/mockups/frame";
import { ACCENT } from "@/components/mockups/accent";
import { HealthAnimatedCard, EducationAnimatedCard } from "@/components/mockups/motion";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Renders a BATCH of frames of the animated mockup card stacked directly on
// top of each other (zero gap, same fixed 812px-wide box each), so one
// full-page screenshot captures many frames of the video timeline at once
// -- scripts/record-mockup-video.mjs slices it into per-frame PNGs by
// fixed-height arithmetic (each frame is exactly 1116px tall at dpr 2)
// instead of one navigate+screenshot round trip per frame.
//
// `?project=health|education&frames=N&hold=H&start=S&count=C`: N is the
// TOTAL frame count across the whole video (first N-H frames sweep
// progress 0..1 evenly, last H hold at progress=1); this page renders only
// frames [S, S+C). Batching matters because Chrome's full-page screenshot
// stitches multiple captures together above ~16384 CSS px of page height,
// and that stitch has visible seams -- keeping each batch's rendered
// height under that (C frames * ~558px + padding) avoids it. Call this
// page multiple times with different `start` to cover all N frames.
export default async function MockupFilmstrip({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; frames?: string; hold?: string; start?: string; count?: string }>;
}) {
  const { project, frames, hold, start, count } = await searchParams;
  const n = Math.max(2, Math.min(120, Number(frames ?? "20") || 20));
  const h = Math.max(0, Math.min(n - 1, Number(hold ?? "4") || 4));
  const s = Math.max(0, Math.min(n - 1, Number(start ?? "0") || 0));
  const c = Math.max(1, Math.min(n - s, Number(count ?? String(n)) || n));
  const isEdu = project === "education";
  const accent = isEdu ? ACCENT.amber : ACCENT.violet;
  const label = isEdu ? "class insights" : "dashboard";
  const sweepCount = n - h;

  const progressList = Array.from({ length: c }, (_, k) => {
    const i = s + k;
    return i < sweepCount ? i / (sweepCount - 1) : 1;
  });

  return (
    <div className="bg-surface-1 p-10">
      <div id="shot-target" className="mx-auto w-full max-w-[812px]">
        {progressList.map((p, i) => (
          <BrowserWindow key={i} accent={accent} label={label}>
            {isEdu ? <EducationAnimatedCard progress={p} /> : <HealthAnimatedCard progress={p} />}
          </BrowserWindow>
        ))}
      </div>
    </div>
  );
}
