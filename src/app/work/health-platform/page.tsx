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
  title: "Health Optimisation Platform · Engineering case study · Rafii Manggala",
  description:
    "A health web app that reconciles biomarkers, DNA, DEXA scans and wearables into one clinical scoring system, then explains it in plain English.",
};

const B = "/work/health-platform";

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-1 p-5">
      <div className="t-h3 text-fg">{value}</div>
      <div className="mt-1.5 text-sm text-dim">{label}</div>
    </div>
  );
}

export default function HealthPlatformCase() {
  return (
    <CaseShell>
      <CaseHero
        eyebrow="Health tech · Engineering case study"
        title="Health Optimisation Platform"
        subtitle="Blood panels, DNA, DEXA scans and wearable data all say something different about a person's health. This app reconciles them into one score, then uses AI to explain what actually matters."
        meta={[
          { label: "Role", value: "Full-stack build + AI features" },
          { label: "Client", value: "AU health-tech company" },
          { label: "Platform", value: "Web app (live)" },
          { label: "Tools", value: "React, Node/Express, MongoDB, Firebase" },
        ]}
      />

      <Figure
        src={`${B}/06-progress.png`}
        alt="Longevity score radar chart, biological age chart, and biomarker trend cards"
        caption="Screenshots are from a demo account and redacted where client branding appears. Product and data shown are real, not mockups."
      />

      <Section n="01" kicker="Problem" title="Four data sources, zero shared language.">
        <Lead>
          A blood panel reports 74 markers in clinical units. A DNA test flags
          genetic risk variants. A DEXA scan returns body-composition
          percentages from whatever vendor scanned it. A wearable streams HRV
          and sleep every night. None of these speak to each other, and none
          of them alone tells a person whether they&apos;re actually getting
          healthier.
        </Lead>
        <Callout title="The hard part">
          DEXA reports in particular come from a dozen different scanner
          vendors, each with its own PDF layout, its own units, and its own
          way of cropping the body-composition chart. There was no clean API
          to normalise against &mdash; just PDFs.
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
          Blood panels get parsed into 74 discrete markers and flagged
          against optimal ranges. DNA results resolve into named risk
          variants. DEXA reports are auto-cropped from the source PDF by
          inspecting its operator list rather than hardcoding scanner
          templates, then scored against reference percentiles instead of a
          fixed cutoff.
        </Lead>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Metric value="74" label="blood markers parsed per panel" />
          <Metric value="6/6" label="domains feeding the bio-age model" />
          <Metric value="3" label="ingestion sources: labs, DNA, DEXA" />
        </div>
        <Figure
          src={`${B}/02-biomarkers.png`}
          alt="Blood panel results screen showing 74 markers analysed, 12 flagged for follow-up"
          caption="A blood panel lands as 74 structured markers, automatically flagged against optimal ranges."
        />
        <Figure
          src={`${B}/03-genetics.png`}
          alt="Genetic risk variant cards for Alzheimer's disease, Systemic sclerosis, and COVID-19 severity"
          caption="DNA results resolve into named, ranked risk variants, not a raw data dump."
        />
        <Figure
          src={`${B}/04-bodyscan.png`}
          alt="DEXA body scan results showing fat health, muscle health, and bone health sub-scores"
          caption="DEXA sub-scores, reference-percentile scored rather than hardcoded thresholds."
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
          The bio-age panel only claims &quot;high confidence&quot; once 6 of
          6 domains have data. Partial data still produces a score, but the
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
        <Figure
          src={`${B}/05-ai-insights.png`}
          alt="Cross-domain intelligence cards reasoning about ApoB, Lp(a), inflammation and cardiovascular risk together"
          caption="Cross-domain reasoning: two markers read together, with the clinical logic spelled out, not just flagged."
        />
        <Figure
          src={`${B}/01-today-plan.png`}
          alt="Personalised meal plan, training plan, and supplement plan generated from health data"
          caption="The same biomarker + DNA + body-composition data drives a generated meal, training and supplement plan."
        />
      </Section>

      <Section n="06" kicker="Process" title="Fix, deploy, verify, then report.">
        <Lead>
          Shipped under a &quot;Test &amp; Execute&quot; loop: every fix
          deploys to the live environment and gets self-verified end-to-end
          via Playwright with a screenshot confirmation, before it&apos;s
          reported as done. No &quot;should be fixed now&quot; without proof.
        </Lead>
      </Section>

      <Section n="07" kicker="Outcome" title="Live, in production.">
        <Lead>
          The scoring engine, the DEXA ingestion pipeline, and the AI
          insights layer are all live and running against real client data.
          Screenshots on this page come from a demo account with the
          client&apos;s branding cropped out.
        </Lead>
      </Section>

      <NextCase
        href="/work/education-saas"
        label="Next case study"
        title="K-12 Education SaaS"
      />
    </CaseShell>
  );
}
