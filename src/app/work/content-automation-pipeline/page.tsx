import type { Metadata } from "next";
import {
  CaseShell,
  CaseHero,
  Section,
  Lead,
  Figure,
  Callout,
  NextCase,
} from "@/components/work/casestudy";

export const metadata: Metadata = {
  title: "Content Automation Pipeline · n8n case study · Rafii Manggala",
  description:
    "A self-hosted n8n instance that scrapes source content, generates video scripts and voiceover with AI, and publishes to TikTok and Instagram on a schedule.",
};

const B = "/work/content-automation-pipeline";

export default function ContentAutomationCase() {
  return (
    <CaseShell>
      <CaseHero
        eyebrow="Automation · Engineering case study"
        title="Content Automation Pipeline"
        subtitle="A self-hosted n8n instance that turns RSS sources into scripted, voiced short-form video and auto-publishes it to TikTok and Instagram, on a schedule, with no manual step in between."
        meta={[
          { label: "Role", value: "Workflow design + build" },
          { label: "Runtime", value: "Self-hosted n8n" },
          { label: "Platform", value: "TikTok + Instagram" },
          { label: "Tools", value: "n8n, OpenAI, Whisper, Creatomate" },
        ]}
      />

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
          The video-generation graph below is one schedule-triggered
          workflow: it merges multiple RSS sources, transcribes and rewrites
          them into a script with an LLM, calls OpenAI Whisper for
          voiceover, sources matching visuals, waits on async render jobs,
          and hands off the finished video to TikTok and Instagram posting
          nodes, with results logged back to a database at every stage.
        </Lead>
        <Figure
          src={`${B}/01-video-workflow.png`}
          alt="n8n workflow graph for AI video content generation: RSS merge, script generation, Whisper voiceover, render, TikTok/Instagram posting"
          caption="The full video-generation graph: RSS ingestion on the left, script + voiceover + render in the middle, publishing on the right."
        />
        <Callout title="Why n8n over a custom script">
          A visual workflow engine keeps every branch, retry, and merge point
          inspectable. When a scheduled run fails at 3am, the execution log
          shows exactly which node broke and with what payload, instead of a
          stack trace with no context.
        </Callout>
      </Section>

      <Section n="04" kicker="Data collection" title="Scraping trend and engagement signals.">
        <Lead>
          A second workflow handles TikTok data collection separately from
          the publishing pipeline: pulling engagement signals to inform what
          gets scripted next, decoupled so a scraping failure never blocks
          the publishing schedule.
        </Lead>
        <Figure
          src={`${B}/02-scraping-workflow.png`}
          alt="n8n workflow for TikTok data scraping"
          caption="A dedicated scraping workflow, isolated from the publishing pipeline so failures don't cascade."
        />
      </Section>

      <Section n="05" kicker="Variants" title="A second format, same backbone.">
        <Lead>
          Shorts-format content runs through a parallel workflow that
          reuses the same script-generation and posting backbone, tuned for
          a different pacing and visual style rather than being rebuilt from
          scratch.
        </Lead>
        <Figure
          src={`${B}/03-shorts-workflow.png`}
          alt="n8n workflow for short-form video content generation"
          caption="A second content format built on the same underlying nodes, not a separate pipeline."
        />
      </Section>

      <Section n="06" kicker="Outcome" title="Running on a schedule, self-hosted.">
        <Lead>
          The pipeline runs on a self-hosted n8n instance rather than a
          managed SaaS tier, so there&apos;s no per-execution billing ceiling
          and every credential and API key stays under direct control.
        </Lead>
      </Section>

      <NextCase
        href="/work/made-to-measure-shopify"
        label="Next case study"
        title="Made-to-Measure Shopify Platform"
      />
    </CaseShell>
  );
}
