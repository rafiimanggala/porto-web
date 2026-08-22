import type { Metadata } from "next";
import {
  CaseShell,
  CaseHero,
  Section,
  Lead,
  Figure,
  ReelGrid,
  WideReel,
  RangeStrip,
  NextCase,
} from "@/components/work/casestudy";

export const metadata: Metadata = {
  title: "AI Video Production at Scale · Rafii Manggala",
  description:
    "600+ AI-generated and AI-edited video and image assets across 14 client accounts: UGC ad avatars, 2D and 3D character animation, cinematic b-roll, product film, and scripted scenes.",
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

      <Section n="02" kicker="Output" title="Nine clips where the motion is the point.">
        <Lead>
          These are here because a frame cannot carry them: a face holding
          identity through a turn to camera, one presenter cut across three
          locations, a macro pass that only reads while it moves. No single
          client&apos;s footage or branding is shown in full.
        </Lead>
        <ReelGrid
          reels={[
            { src: `${B}/07-photoreal-talent.mp4`, poster: `${B}/07-photoreal-talent.jpg`, label: "Photoreal talent, turn to camera" },
            { src: `${B}/08-presenter-locations.mp4`, poster: `${B}/08-presenter-locations.jpg`, label: "One presenter, three locations" },
            { src: `${B}/09-product-film.mp4`, poster: `${B}/09-product-film.jpg`, label: "Product film, macro pass" },
            { src: `${B}/01-broll.mp4`, poster: `${B}/01-broll.jpg`, label: "Cinematic AI b-roll" },
            { src: `${B}/03-character-story.mp4`, poster: `${B}/03-character-story.jpg`, label: "2D character narrative" },
            { src: `${B}/04-3d-animation.mp4`, poster: `${B}/04-3d-animation.jpg`, label: "3D character animation" },
            { src: `${B}/05-ugc-avatar.mp4`, poster: `${B}/05-ugc-avatar.jpg`, label: "AI UGC ad avatar" },
            { src: `${B}/06-faceswap-remix.mp4`, poster: `${B}/06-faceswap-remix.jpg`, label: "Face-swap remix, same script" },
            { src: `${B}/02-product-demo.mp4`, poster: `${B}/02-product-demo.jpg`, label: "Food preparation macro" },
          ]}
        />
      </Section>

      <Section n="03" kicker="Scope" title="One piece shot at cinema ratio.">
        <Lead>
          A torch-bearing crowd, smoke, and two interior looks through iced
          glass, all holding together across the cut. It is the only clip in
          the set framed wide, so it is shown wide rather than cropped into a
          phone frame.
        </Lead>
        <WideReel
          src={`${B}/10-scope-crowd.mp4`}
          poster={`${B}/10-scope-crowd.jpg`}
          caption="Crowd and fire at scope ratio."
        />
      </Section>

      <Section n="04" kicker="Range" title="Ten more, across verticals.">
        <Lead>
          Breadth rather than depth: automotive, hospitality, fashion, food, a
          technical explainer, and a locked-off time-lapse that has to hold
          framing and light steady while the subject changes. Smaller tiles
          because they are the supporting evidence, not the argument.
        </Lead>
        <RangeStrip
          reels={[
            { src: `${B}/strip-01-food-hero.mp4`, poster: `${B}/strip-01-food-hero.jpg`, label: "Studio food hero, localised ad copy" },
            { src: `${B}/strip-02-night-aerial.mp4`, poster: `${B}/strip-02-night-aerial.jpg`, label: "Night aerial, high-rise push" },
            { src: `${B}/strip-03-automotive.mp4`, poster: `${B}/strip-03-automotive.jpg`, label: "Automotive beauty pass" },
            { src: `${B}/strip-04-timelapse.mp4`, poster: `${B}/strip-04-timelapse.jpg`, label: "Locked-off decay time-lapse" },
            { src: `${B}/strip-05-two-hander.mp4`, poster: `${B}/strip-05-two-hander.jpg`, label: "Scripted two-hander, office" },
            { src: `${B}/strip-06-fire-portrait.mp4`, poster: `${B}/strip-06-fire-portrait.jpg`, label: "Fire-lit editorial portrait" },
            { src: `${B}/strip-07-anatomical.mp4`, poster: `${B}/strip-07-anatomical.jpg`, label: "3D anatomical explainer" },
            { src: `${B}/strip-08-presenter-ext.mp4`, poster: `${B}/strip-08-presenter-ext.jpg`, label: "In-character presenter, exterior" },
            { src: `${B}/strip-09-lookbook.mp4`, poster: `${B}/strip-09-lookbook.jpg`, label: "Garment lookbook, three angles" },
            { src: `${B}/strip-10-hospitality.mp4`, poster: `${B}/strip-10-hospitality.jpg`, label: "Hospitality venue, 4K source" },
          ]}
        />
        <p className="mono mt-8 text-[11px] text-mute">
          Twenty of 600+, all playable. Selected for craft and for range, and
          filtered so nothing here carries a client mark.
        </p>
      </Section>

      <NextCase
        href="/work/content-automation-pipeline"
        label="Related case study"
        title="Content Automation Pipeline"
      />
    </CaseShell>
  );
}
