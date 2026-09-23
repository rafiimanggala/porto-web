import type { Metadata } from "next";
import { BrowserWindow } from "@/components/mockups/frame";
import { ACCENT } from "@/components/mockups/accent";
import { HealthWeb1, HealthWeb2, HealthWeb3 } from "@/components/mockups/health";
import { EduWeb2, EduWeb3, EduWeb4 } from "@/components/mockups/education";

// Not in sitemap.ts and not linked anywhere, but robots:noindex too --
// belt and suspenders against a crawler ever surfacing an internal tool.
export const metadata: Metadata = { robots: { index: false, follow: false } };

// Internal-only screenshot rig, not linked from anywhere in the site nav.
// Renders one illustrated mockup screen full-size with nothing else on the
// page, so a plain viewport capture (cropped to #shot-target) is a clean
// WorkReel card source image -- no manual element-cropping math against a
// page full of nav/header/copy. `?project=health|education&screen=1|2|3`
// picks the screen; add cases here if a future card needs a re-shoot from
// another screen or project. Kept in the repo (not deleted after use) so a
// re-shoot after a mockup-content edit is a one-line nav, not a rebuild of
// this rig.
const SCREENS = {
  health: {
    "1": { label: "dashboard", screen: <HealthWeb1 /> },
    "2": { label: "longevity score", screen: <HealthWeb2 /> },
    "3": { label: "insight feed", screen: <HealthWeb3 /> },
  },
  education: {
    "1": { label: "course view", screen: <EduWeb2 /> },
    "2": { label: "quiz engine", screen: <EduWeb3 /> },
    "3": { label: "class insights", screen: <EduWeb4 /> },
  },
} as const;

export default async function MockupPreview({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; screen?: string }>;
}) {
  const { project, screen } = await searchParams;
  const group = project === "education" ? SCREENS.education : SCREENS.health;
  const accent = project === "education" ? ACCENT.amber : ACCENT.violet;
  const picked = group[(screen ?? "1") as keyof typeof group] ?? group["1"];
  const config = { label: picked.label, accent, screen: picked.screen };

  return (
    // 812px matches the case-study article's real content column
    // (CaseShell's max-w-[860px] minus its px-6 gutters) -- these screens
    // are hand-built at fixed internal pixel heights, not fluid, so a wider
    // box than production actually uses just leaves blank space at the
    // bottom instead of showing more content.
    <div className="min-h-screen bg-surface-1 p-10">
      <div id="shot-target" className="mx-auto w-full max-w-[812px]">
        <BrowserWindow accent={config.accent} label={config.label}>
          {config.screen}
        </BrowserWindow>
      </div>
    </div>
  );
}
