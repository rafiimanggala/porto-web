import type { Metadata } from "next";
import {
  CaseShell,
  CaseHero,
  Section,
  Lead,
  Figure,
  ReelGrid,
  NextCase,
} from "@/components/work/casestudy";

export const metadata: Metadata = {
  title: "AI Video Production at Scale · Rafii Manggala",
  description:
    "600+ AI-generated and AI-edited video and image assets delivered across 14 client accounts: UGC-style ad avatars, 3D/2D character animation, cinematic b-roll, and face-swap remixes.",
};

const B = "/work/ai-video-production";

export default function AiVideoProductionCase() {
  return (
    <CaseShell>
      <CaseHero
        eyebrow="AI video · Freelance production"
        title="AI Video Production at Scale"
        subtitle="A second, anonymized freelance line: 600+ AI-generated and AI-edited video assets across 14 client accounts. Below: the automation behind delivery, and a sample of the output."
        meta={[
          { label: "Role", value: "Production + delivery pipeline" },
          { label: "Output", value: "600+ assets, 14 clients" },
          { label: "Formats", value: "UGC ads, animation, b-roll" },
          { label: "Tools", value: "Kling, Veo, Seedance, n8n" },
        ]}
      />

      <Section n="01" kicker="Automation" title="Delivery runs on the same n8n stack.">
        <Lead>
          Approved cuts are scheduled and cross-posted through the same
          self-hosted n8n graph used in the{" "}
          <a href="/work/content-automation-pipeline" className="text-fg underline decoration-line-strong underline-offset-4 hover:text-accent">
            Content Automation Pipeline
          </a>{" "}
          case study, not a manual upload per client.
        </Lead>
        <Figure
          src="/work/content-automation-pipeline/01-video-workflow.png"
          alt="n8n workflow graph used for scheduling and cross-platform video delivery"
          caption="The delivery graph: schedule, render hand-off, cross-post."
        />
      </Section>

      <Section n="02" kicker="Output" title="A sample of the output, anonymized.">
        <Lead>
          Six clips across the formats this work spans. No single
          client&apos;s footage or branding is shown in full.
        </Lead>
        <ReelGrid
          reels={[
            { src: `${B}/01-broll.mp4`, poster: `${B}/01-broll.jpg`, label: "Cinematic AI b-roll" },
            { src: `${B}/02-product-demo.mp4`, poster: `${B}/02-product-demo.jpg`, label: "AI product demo" },
            { src: `${B}/03-character-story.mp4`, poster: `${B}/03-character-story.jpg`, label: "2D character narrative" },
            { src: `${B}/04-3d-animation.mp4`, poster: `${B}/04-3d-animation.jpg`, label: "3D character animation" },
            { src: `${B}/05-ugc-avatar.mp4`, poster: `${B}/05-ugc-avatar.jpg`, label: "AI UGC ad avatar" },
            { src: `${B}/06-faceswap-remix.mp4`, poster: `${B}/06-faceswap-remix.jpg`, label: "Face-swap remix, same script" },
          ]}
        />
      </Section>

      <NextCase
        href="/work/content-automation-pipeline"
        label="Related case study"
        title="Content Automation Pipeline"
      />
    </CaseShell>
  );
}
