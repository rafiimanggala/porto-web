import type { Metadata } from "next";
import {
  CaseShell,
  CaseHero,
  Section,
  Lead,
  Callout,
  NextCase,
} from "@/components/work/casestudy";
import { AutoCycle, BrowserWindow, PhoneWindow, ACCENT } from "@/components/mockups/frame";
import { HealthWeb1, HealthWeb2, HealthWeb3, HealthMobile1, HealthMobile2 } from "@/components/mockups/health";

export const metadata: Metadata = {
  title: "Health Optimisation Platform · Engineering case study · Rafii Manggala",
  description:
    "A health web app that reconciles biomarkers, DNA, DEXA scans and wearables into one clinical scoring system, then explains it in plain English.",
};

const accent = ACCENT.violet;

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

      <div className="mt-8">
        <BrowserWindow label="biomarkers &middot; genetics &middot; ai insights" accent={accent}>
          <AutoCycle
            accent={accent}
            screens={[
              <HealthWeb1 key="1" accent={accent} />,
              <HealthWeb2 key="2" accent={accent} />,
              <HealthWeb3 key="3" accent={accent} />,
            ]}
          />
        </BrowserWindow>
        <p className="mt-3 text-sm text-mute">
          An illustrated recreation of the product, not real screenshots.
          This is an NDA client engagement &mdash; layout and copy are
          reworked into this site&apos;s own visual language.
        </p>
      </div>

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
          Blood panels get parsed into discrete markers and flagged
          against optimal ranges. DNA results resolve into named risk
          variants. DEXA reports are auto-cropped from the source PDF by
          inspecting its operator list rather than hardcoding scanner
          templates, then scored against reference percentiles instead of a
          fixed cutoff.
        </Lead>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <Metric value="70+" label="blood markers parsed per panel" />
          <Metric value="6/6" label="domains feeding the bio-age model" />
          <Metric value="3" label="ingestion sources: labs, DNA, DEXA" />
        </div>
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
        <div className="mt-8 max-w-[280px]">
          <PhoneWindow accent={accent}>
            <AutoCycle
              accent={accent}
              screens={[
                <HealthMobile1 key="1" accent={accent} />,
                <HealthMobile2 key="2" accent={accent} />,
              ]}
            />
          </PhoneWindow>
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
    </CaseShell>
  );
}
