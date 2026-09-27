import type { Metadata } from "next";
import { BrowserWindow } from "@/components/mockups/frame";
import { ACCENT } from "@/components/mockups/accent";
import { HealthAnimatedCard, EducationAnimatedCard } from "@/components/mockups/motion";
import EduInsightsScenePreview from "@/components/work/scene/EduInsightsScenePreview";
import HealthScenePreview from "@/components/work/scene/HealthScenePreview";
import PipePublishScenePreview from "@/components/work/scene/PipePublishScenePreview";
import MtmFitScenePreview from "@/components/work/scene/MtmFitScenePreview";
import PipeReelPreview from "@/components/work/scene/PipeReelPreview";
import MtmReelPreview from "@/components/work/scene/MtmReelPreview";
import EduReelPreview from "@/components/work/scene/EduReelPreview";

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
  searchParams: Promise<{ project?: string; progress?: string; scene?: string }>;
}) {
  const { project, progress, scene } = await searchParams;
  const p = Math.max(0, Math.min(1, Number(progress ?? "0") || 0));
  const sceneIndex = Math.max(0, Number(scene ?? "0") || 0);

  // edu-insights: the REAL scroll scene (EduInsightsScene's visual), driven
  // by window.__setEduInsightsProgress for a frame sweep. Kept separate from
  // the isEdu/isHealth branch below, which still serves the old mockup.tsx
  // fake-animation cards (health-platform's WorkReel video, and this route's
  // original two branches) until those get the same real-scene treatment.
  if (project === "edu-insights") {
    return (
      <div className="theme-green inline-block bg-bg p-10">
        <div id="shot-target" className="mx-auto w-fit">
          <BrowserWindow accent={ACCENT.amber} label="class insights">
            <EduInsightsScenePreview progress={p} width={812} height={680} />
          </BrowserWindow>
        </div>
      </div>
    );
  }

  // health-scene / pipe-publish / mtm-fit: same treatment as edu-insights
  // above -- the REAL scroll scene visual, driven by its own
  // window.__set*Progress for a frame sweep, instead of the old mockup.tsx
  // fake-animation cards.
  if (project === "health-scene") {
    return (
      <div className="theme-green inline-block bg-bg p-10">
        <div id="shot-target" className="mx-auto w-fit">
          <BrowserWindow accent={ACCENT.amber} label="dashboard">
            <HealthScenePreview progress={p} width={812} height={680} />
          </BrowserWindow>
        </div>
      </div>
    );
  }
  if (project === "pipe-publish") {
    return (
      <div className="theme-green inline-block bg-bg p-10">
        <div id="shot-target" className="mx-auto w-fit">
          <BrowserWindow accent={ACCENT.amber} label="publish">
            <PipePublishScenePreview progress={p} width={812} height={680} />
          </BrowserWindow>
        </div>
      </div>
    );
  }
  if (project === "mtm-fit") {
    return (
      <div className="theme-green inline-block bg-bg p-10">
        <div id="shot-target" className="mx-auto w-fit">
          <BrowserWindow accent={ACCENT.amber} label="fit">
            <MtmFitScenePreview progress={p} width={812} height={680} />
          </BrowserWindow>
        </div>
      </div>
    );
  }

  // *-reel: cycles through EVERY real scroll scene of the case study, not
  // just one chapter (Rafii's correction, 27 Sep: "maksud saya semua
  // animasi bukan 1 bab doang"). `scene` picks the chapter, `progress` is
  // that chapter's own 0..1 sweep -- see PipeReelPreview for the frame
  // protocol.
  if (project === "pipe-reel") {
    return (
      <div className="theme-green inline-block bg-bg p-10">
        <div id="shot-target" className="mx-auto w-fit">
          <BrowserWindow accent={ACCENT.amber} label="workflow">
            <PipeReelPreview sceneIndex={sceneIndex} localProgress={p} width={812} height={680} />
          </BrowserWindow>
        </div>
      </div>
    );
  }
  if (project === "mtm-reel") {
    return (
      <div className="theme-green inline-block bg-bg p-10">
        <div id="shot-target" className="mx-auto w-fit">
          <BrowserWindow accent={ACCENT.amber} label="shopify theme">
            <MtmReelPreview sceneIndex={sceneIndex} localProgress={p} width={812} height={680} />
          </BrowserWindow>
        </div>
      </div>
    );
  }
  if (project === "edu-reel") {
    return (
      <div className="theme-green inline-block bg-bg p-10">
        <div id="shot-target" className="mx-auto w-fit">
          <BrowserWindow accent={ACCENT.amber} label="class insights">
            <EduReelPreview sceneIndex={sceneIndex} localProgress={p} width={812} height={680} />
          </BrowserWindow>
        </div>
      </div>
    );
  }

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
