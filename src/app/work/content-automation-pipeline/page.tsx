import type { Metadata } from "next";
import { Section, Lead, Figure, Callout, NextCase } from "@/components/work/casestudy";
import ResultNumbers from "@/components/work/ResultNumbers";
import WideCaseShell from "@/components/work/scene/WideCaseShell";
import PipeSourcesScene from "@/components/work/scene/PipeSourcesScene";
import PipeScriptScene from "@/components/work/scene/PipeScriptScene";
import PipeVoiceScene from "@/components/work/scene/PipeVoiceScene";
import PipeRenderScene from "@/components/work/scene/PipeRenderScene";
import PipePublishScene from "@/components/work/scene/PipePublishScene";
import PipeIsolationScene from "@/components/work/scene/PipeIsolationScene";
import PipeShortsScene from "@/components/work/scene/PipeShortsScene";
import { PipeGlyph, type GlyphName } from "@/components/work/scene/PipeKitGlyphs";

export const metadata: Metadata = {
  title: "Content Automation Pipeline · n8n case study · Rafii Manggala",
  description:
    "A self-hosted n8n instance that scrapes source content, generates video scripts and voiceover with AI, and publishes to TikTok and Instagram on a schedule.",
};

const B = "/work/content-automation-pipeline";

function FeatureBreak({ n, title, glyph }: { n: string; title: string; glyph: GlyphName }) {
  return (
    <div id={`feature-${n}`} className="mx-auto flex w-full max-w-[1180px] items-center gap-4 px-4 pb-6 pt-16 sm:px-8 sm:pt-24">
      <span className="mono shrink-0 text-[11px] uppercase tracking-[0.14em] text-accent">Feature {n}</span>
      <span className="h-px flex-1 bg-line-strong" />
      <PipeGlyph name={glyph} size={36} className="h-7 w-7 shrink-0 sm:h-9 sm:w-9" />
      <span className="mono shrink-0 text-[11px] uppercase tracking-[0.14em] text-dim">{title}</span>
    </div>
  );
}

export default function ContentAutomationCase() {
  return (
    <WideCaseShell>
      <header className="mx-auto w-full max-w-[860px] px-6 pt-14 sm:pt-20">
        <div className="flex items-center gap-3 border-y border-line py-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          <span className="mono text-[11px] tracking-[0.14em] text-dim uppercase">
            Automation &middot; Engineering case study
          </span>
        </div>
        <h1 className="t-hero mt-8 text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.95]">
          Content Automation
          <br />
          Pipeline.
        </h1>
        <p className="t-lead mt-6 max-w-[56ch] text-dim">
          A self-hosted n8n instance that turns RSS sources into scripted,
          voiced short-form video and auto-publishes it to TikTok and
          Instagram, on a schedule, with no manual step in between.
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
          {[
            { label: "Role", value: "Workflow design + build" },
            { label: "Runtime", value: "Self-hosted n8n" },
            { label: "Platform", value: "TikTok + Instagram" },
            { label: "Tools", value: "n8n, OpenAI, Whisper, Creatomate" },
          ].map((m) => (
            <div key={m.label}>
              <dt className="eyebrow">{m.label}</dt>
              <dd className="mt-1 text-sm text-fg">{m.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mono mt-10 text-[11px] motion-reduce:hidden tracking-[0.14em] text-mute uppercase">
          Scroll to watch it run. Or hold.
        </p>
      </header>

      <div className="mt-6 sm:mt-10">
        <FeatureBreak n="01" title="Sources" glyph="clock" />
        <PipeSourcesScene />
        <FeatureBreak n="02" title="Script" glyph="ai" />
        <PipeScriptScene />
        <FeatureBreak n="03" title="Voice" glyph="speaker" />
        <PipeVoiceScene />
        <FeatureBreak n="04" title="Render" glyph="film" />
        <PipeRenderScene />
        <FeatureBreak n="05" title="Publish" glyph="vertical-video" />
        <PipePublishScene />
        <FeatureBreak n="06" title="Isolation" glyph="scraper" />
        <PipeIsolationScene />
        <FeatureBreak n="07" title="Shorts" glyph="branch" />
        <PipeShortsScene />
      </div>

      <article className="mx-auto w-full max-w-[860px] px-6 pb-32">
        <div className="mt-10">
          <p className="mono text-[11px] uppercase tracking-[0.14em] text-accent">The real graphs</p>
          <p className="mt-3 max-w-[60ch] text-sm leading-relaxed text-dim">
            Everything above is redrawn for clarity. These are the actual n8n
            canvases the pipeline runs on.
          </p>
        </div>
        <Figure
          src={`${B}/01-video-workflow.png`}
          alt="n8n workflow graph for AI video content generation: RSS merge, script generation, Whisper voiceover, render, TikTok/Instagram posting"
          caption="The full video-generation graph: RSS ingestion on the left, script + voiceover + render in the middle, publishing on the right."
        />
        <Figure
          src={`${B}/02-scraping-workflow.png`}
          alt="n8n workflow for TikTok data scraping"
          caption="A dedicated scraping workflow, isolated from the publishing pipeline so failures don't cascade."
        />
        <Figure
          src={`${B}/03-shorts-workflow.png`}
          alt="n8n workflow for short-form video content generation"
          caption="A second content format built on the same underlying nodes, not a separate pipeline."
        />

        <details className="group mt-16 border-y border-line">
          <summary className="mono flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[11px] uppercase tracking-[0.14em] text-dim transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
            <span>Read the full write-up</span>
            <span aria-hidden className="text-accent transition-transform group-open:rotate-45">+</span>
          </summary>

          <Section n="01" kicker="Problem" title="Short-form content is a production pipeline, not a script.">
            <Lead>
              Publishing consistently on TikTok and Instagram means research,
              scriptwriting, voiceover, visuals, captioning, and posting, done
              daily. Doing that by hand doesn&apos;t scale, and most
              &quot;automation&quot; tools stop at scripting and still expect a
              human to render and upload the result.
            </Lead>
          </Section>

          <Section n="02" kicker="Goal" title="RSS in, published video out. No manual step.">
            <Lead>
              One pipeline that watches curated content sources on a schedule,
              drafts a script with an LLM, generates voiceover, sources visuals,
              renders the final video, and posts it directly to TikTok and
              Instagram, with only a review checkpoint if something needs a
              human eye.
            </Lead>
          </Section>

          <Section n="03" kicker="Build" title="A 30+ node workflow, orchestrated end to end.">
            <Lead>
              The video-generation graph is one schedule-triggered workflow:
              it merges multiple RSS sources, transcribes and rewrites them
              into a script with an LLM, calls OpenAI Whisper for voiceover,
              sources matching visuals, waits on async render jobs, and hands
              off the finished video to TikTok and Instagram posting nodes,
              with results logged back to a database at every stage.
            </Lead>
            <Callout title="Why n8n over a custom script">
              A visual workflow engine keeps every branch, retry, and merge
              point inspectable. When a scheduled run fails at 3am, the
              execution log shows exactly which node broke and with what
              payload, instead of a stack trace with no context.
            </Callout>
          </Section>

          <Section n="04" kicker="Data collection" title="Scraping trend and engagement signals.">
            <Lead>
              A second workflow handles TikTok data collection separately from
              the publishing pipeline: pulling engagement signals to inform what
              gets scripted next, decoupled so a scraping failure never blocks
              the publishing schedule.
            </Lead>
          </Section>

          <Section n="05" kicker="Variants" title="A second format, same backbone.">
            <Lead>
              Shorts-format content runs through a parallel workflow that
              reuses the same script-generation and posting backbone, tuned for
              a different pacing and visual style rather than being rebuilt from
              scratch.
            </Lead>
          </Section>
        </details>

        <Section n="06" kicker="Outcome" title="Running on a schedule, self-hosted.">
          <Lead>
            The pipeline runs on a self-hosted n8n instance rather than a
            managed SaaS tier, so there&apos;s no per-execution billing ceiling
            and every credential and API key stays under direct control.
          </Lead>
          <ResultNumbers
            caption="The system in numbers"
            stats={[
              { value: "30+", label: "nodes in the video workflow" },
              { value: "3", label: "workflows: video, scraping and shorts" },
              { value: "0", label: "manual steps between feed and post" },
            ]}
          />
        </Section>

        <NextCase
          href="/work/made-to-measure-shopify"
          label="Next case study"
          title="Made-to-Measure Shopify Platform"
        />
      </article>
    </WideCaseShell>
  );
}
