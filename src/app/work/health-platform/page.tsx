import type { Metadata } from "next";
import { Section, Lead, Callout, NextCase } from "@/components/work/casestudy";
import ResultNumbers from "@/components/work/ResultNumbers";
import { PhoneRow, ScreenBoard } from "@/components/mockups/frame";
import { ACCENT } from "@/components/mockups/accent";
import {
  HealthWeb1,
  HealthWeb2,
  HealthWeb3,
  HealthWeb4,
  HealthWeb5,
  HealthMobile1,
  HealthMobile2,
  HealthMobile3,
} from "@/components/mockups/health";
import WideCaseShell from "@/components/work/scene/WideCaseShell";
import HealthScene from "@/components/work/scene/HealthScene";
import HealthSceneStatic from "@/components/work/scene/HealthSceneStatic";
import DexaScene from "@/components/work/scene/DexaScene";
import GeneticsScene from "@/components/work/scene/GeneticsScene";
import WearableScene from "@/components/work/scene/WearableScene";
import ChatScene from "@/components/work/scene/ChatScene";
import PlanScene from "@/components/work/scene/PlanScene";
import MobileScene from "@/components/work/scene/MobileScene";
import { SceneIcon, type SceneIconName } from "@/components/work/scene/SceneIcon";

export const metadata: Metadata = {
  title: "Health Optimisation Platform · Engineering case study · Rafii Manggala",
  description:
    "A health web app that reconciles biomarkers, DNA, DEXA scans and wearables into one clinical scoring system, then explains it in plain English.",
};

const accent = ACCENT.violet;

function FeatureBreak({ n, title, icon }: { n: string; title: string; icon: SceneIconName }) {
  return (
    <div id={`feature-${n}`} className="mx-auto flex w-full max-w-[1180px] items-center gap-4 px-4 pb-6 pt-16 sm:px-8 sm:pt-24">
      <span className="mono shrink-0 text-[11px] uppercase tracking-[0.14em] text-accent">Feature {n}</span>
      <span className="h-px flex-1 bg-line-strong" />
      <SceneIcon name={icon} size={36} className="h-7 w-7 sm:h-9 sm:w-9" />
      <span className="mono shrink-0 text-[11px] uppercase tracking-[0.14em] text-dim">{title}</span>
    </div>
  );
}

export default function HealthPlatformCase() {
  return (
    <WideCaseShell>
      <header className="mx-auto w-full max-w-[860px] px-6 pt-14 sm:pt-20">
        <div className="flex items-center gap-3 border-y border-line py-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          <span className="mono text-[11px] tracking-[0.14em] text-dim uppercase">
            Health tech &middot; Engineering case study
          </span>
        </div>
        <h1 className="t-hero mt-8 text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.95]">
          Health Optimisation
          <br />
          Platform.
        </h1>
        <p className="t-lead mt-6 max-w-[56ch] text-dim">
          Blood panels, DNA, DEXA scans and wearable data all say something
          different about a person&apos;s health. This app reconciles them
          into one score, then uses AI to explain what actually matters.
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
          {[
            { label: "Role", value: "Full-stack build + AI features" },
            { label: "Client", value: "AU health-tech company" },
            { label: "Platform", value: "Web app (live)" },
            { label: "Tools", value: "React, Node/Express, MongoDB, Firebase" },
          ].map((m) => (
            <div key={m.label}>
              <dt className="eyebrow">{m.label}</dt>
              <dd className="mt-1 text-sm text-fg">{m.value}</dd>
            </div>
          ))}
        </dl>
        <p className="mono mt-10 text-[11px] motion-reduce:hidden tracking-[0.14em] text-mute uppercase">
          Scroll to watch it work. Or hold.
        </p>
      </header>

      <div className="mt-6 sm:mt-10">
        <div className="motion-reduce:hidden">
          <HealthScene />
        </div>
        <div className="hidden motion-reduce:block">
          <HealthSceneStatic />
        </div>
      </div>

      <FeatureBreak n="02" title="Body scan" icon="body-scan" />
      <DexaScene />
      <FeatureBreak n="03" title="Genetics" icon="dna" />
      <GeneticsScene />
      <FeatureBreak n="04" title="Wearables" icon="device-ring" />
      <WearableScene />
      <FeatureBreak n="05" title="AI chat" icon="chat-bubble" />
      <ChatScene />
      <FeatureBreak n="06" title="Plan generator" icon="meal" />
      <PlanScene />
      <FeatureBreak n="07" title="On the phone" icon="device-phone" />
      <MobileScene />

      <article className="mx-auto w-full max-w-[860px] px-6 pb-32">
        <div className="mt-10">
          <ScreenBoard
            accent={accent}
            items={[
              {
                key: "dashboard",
                label: "dashboard",
                screen: <HealthWeb1 />,
                note: "The landing view: connected wearables along the top, then the newest blood panel with the flagged markers pulled forward instead of buried in a PDF.",
              },
              {
                key: "score",
                label: "longevity score",
                screen: <HealthWeb2 />,
                note: "Six domains scored separately, then rolled into one number, sitting next to the biological-age model and today's plan.",
              },
              {
                key: "insights",
                label: "insight feed",
                screen: <HealthWeb3 />,
                note: "AI-written actions, each tagged by priority and domain, and traceable back to the markers that triggered them.",
              },
              {
                key: "bodyscan",
                label: "body scan",
                screen: <HealthWeb4 />,
                note: "An uploaded DEXA report parsed into regions, auto-cropped, and scored against an age-matched cohort.",
              },
              {
                key: "genetics",
                label: "genetics",
                screen: <HealthWeb5 />,
                note: "Reported variants grouped by pathway and cross-checked against the blood panel, so related findings surface together rather than as two unrelated flags.",
              },
            ]}
          />
        </div>
        <p className="mt-6 max-w-[64ch] text-sm text-mute">
          An illustrated recreation of the product, not real screenshots. This
          is an NDA client engagement: the screens follow the real layout so
          the work is legible, while every name, number and record shown here
          is invented.
        </p>

        <details className="group mt-16 border-y border-line">
          <summary className="mono flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[11px] uppercase tracking-[0.14em] text-dim transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
            <span>Read the full write-up</span>
            <span aria-hidden className="text-accent transition-transform group-open:rotate-45">+</span>
          </summary>
        <Section n="01" kicker="Problem" title="Four data sources, zero shared language.">
          <Lead>
            A blood panel reports dozens of markers in clinical units. A DNA
            test flags genetic risk variants. A DEXA scan returns
            body-composition percentages from whatever vendor scanned it. A
            wearable streams HRV and sleep every night. None of these speak
            to each other, and none of them alone tells a person whether
            they&apos;re actually getting healthier.
          </Lead>
          <Callout title="The hard part">
            DEXA reports in particular come from a dozen different scanner
            vendors, each with its own PDF layout, its own units, and its own
            way of cropping the body-composition chart. There was no clean API
            to normalise against: just PDFs.
          </Callout>
        </Section>

        <Section n="02" kicker="Goal" title="One score. Explainable, not a black box.">
          <Lead>
            The brief was a single &quot;longevity score&quot; that reconciles
            all four sources with correct unit conversions and per-report
            transparency, plus AI reasoning that connects findings across
            domains instead of listing them as separate cards.
          </Lead>
        </Section>

        <Section n="03" kicker="Ingestion" title="Turning lab PDFs into structured, comparable data.">
          <Lead>
            Blood panels get parsed into discrete markers and flagged
            against optimal ranges. DNA results resolve into named risk
            variants. DEXA reports are auto-cropped from the source PDF by
            inspecting its operator list rather than hardcoding scanner
            templates, then scored against reference percentiles instead of a
            fixed cutoff.
          </Lead>
          <ResultNumbers
            caption="Scale of the ingestion"
            stats={[
              { value: "70+", label: "blood markers parsed per panel" },
              {
                value: "6/6",
                label: "domains feeding the bio-age model",
                spoken: "All 6 domains feeding the bio-age model",
              },
              { value: "3", label: "ingestion sources: labs, DNA, DEXA" },
            ]}
          />
        </Section>

        <Section n="04" kicker="The scoring engine" title="Reconciling four sources into one number.">
          <Lead>
            The longevity score sits on top of a domain model: cardiovascular,
            metabolic, vitals &amp; fitness, inflammation, organ, body
            composition. Each domain pulls from whichever sources have data for
            it, converts units where needed, and rolls up into both an overall
            score and a biological age estimate versus chronological age.
          </Lead>
          <Callout title="Confidence, not certainty">
            The bio-age panel only claims &quot;high confidence&quot; once all
            domains have data. Partial data still produces a score, but the
            UI is explicit about how much of the picture is missing, instead of
            presenting an incomplete estimate as gospel.
          </Callout>
        </Section>

        <Section n="05" kicker="AI reasoning" title="Cross-domain insight, not a wall of numbers.">
          <Lead>
            The distinguishing feature isn&apos;t the score, it&apos;s what
            connects to what. The AI layer looks across domains at once and
            surfaces compounding risk (two elevated markers that share a
            mechanism), not just per-marker flags, then generates a
            personalised meal, training and supplement plan from the same
            underlying data.
          </Lead>
        </Section>

        <Section n="06" kicker="On the phone" title="The same reasoning, in your pocket.">
          <Lead>
            The score, the domain breakdown, and the AI insight feed are all
            available on mobile, reflowed rather than shrunk down.
          </Lead>
          <div className="mt-8">
            <PhoneRow
              accent={accent}
              items={[
                { key: "m1", label: "dashboard", screen: <HealthMobile1 />, note: "Score and domains, stacked." },
                { key: "m2", label: "insights", screen: <HealthMobile3 />, note: "The same insight feed, filtered by status." },
                { key: "m3", label: "biomarkers", screen: <HealthMobile2 />, note: "Blood results as a two-column card grid." },
              ]}
            />
          </div>
        </Section>

        <Section n="07" kicker="Process" title="Fix, deploy, verify, then report.">
          <Lead>
            Shipped under a &quot;Test &amp; Execute&quot; loop: every fix
            deploys to the live environment and gets self-verified end-to-end
            via Playwright with a screenshot confirmation, before it&apos;s
            reported as done. No &quot;should be fixed now&quot; without proof.
          </Lead>
        </Section>

        </details>

        <Section n="08" kicker="Outcome" title="Live, in production.">
          <Lead>
            The scoring engine, the DEXA ingestion pipeline, and the AI
            insights layer are all live and running against real client data.
          </Lead>
        </Section>

        <NextCase
          href="/work/education-saas"
          label="Next case study"
          title="K-12 Education SaaS"
        />
      </article>
    </WideCaseShell>
  );
}
