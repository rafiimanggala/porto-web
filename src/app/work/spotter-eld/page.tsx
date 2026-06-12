import type { Metadata } from "next";
import Link from "next/link";
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
  title: "Spotter ELD · UI/UX case study · Rafii Manggala",
  description:
    "Turning a regulated, error-prone task (truck route planning and Hours-of-Service logs) into one calm screen.",
};

const B = "/work/spotter-eld";
const LIVE = "https://frontend-lac-alpha-42.vercel.app";

export default function SpotterCase() {
  return (
    <CaseShell>
      <CaseHero
        eyebrow="UI/UX Case Study"
        title="Spotter ELD"
        subtitle="A trip planner for US truck drivers that turns a regulated, paper-heavy task into one screen: enter a trip, get a compliant route and auto-filled daily log sheets."
        meta={[
          { label: "Role", value: "UI/UX, build" },
          { label: "Domain", value: "Logistics / compliance" },
          { label: "Platform", value: "Web app (live)" },
          { label: "Tools", value: "React, Leaflet, Canvas" },
        ]}
      />

      <Figure
        src={`${B}/06-results-top.png`}
        alt="Spotter ELD results screen with trip form, route map and stat cards"
        caption="The result screen: trip inputs on the left, a live route with a colour-coded legend, and at-a-glance stats."
      />

      <Section n="01" kicker="Problem" title="Drivers plan routes and log hours by hand.">
        <Lead>
          US truck drivers are bound by Hours-of-Service rules: limited drive
          time, mandatory breaks, and a 70-hour cycle. Most plan the trip in one
          place and fill out their daily log sheets separately, by hand. It is
          slow, easy to get wrong, and a wrong log is a compliance problem.
        </Lead>
        <Callout title="The design challenge">
          Take a dense regulatory task and make it feel like filling in three
          fields, without hiding the detail a driver actually needs to trust it.
        </Callout>
      </Section>

      <Section n="02" kicker="Goal" title="One input, a route, and the paperwork done.">
        <Lead>
          The whole experience fits on a single screen. A driver enters current,
          pickup and dropoff locations plus hours already used, hits one button,
          and gets a mapped route with fuel, break and rest stops, plus daily log
          sheets generated for them.
        </Lead>
      </Section>

      <Section n="03" kicker="Empty state" title="Start with a calm, obvious first move.">
        <Lead>
          Before any input, the screen guides rather than overwhelms: a simple
          prompt and a single clear call to action, so a first-time user knows
          exactly where to begin.
        </Lead>
        <Figure
          src={`${B}/01-landing.png`}
          alt="Spotter ELD landing and empty state"
          caption="Empty state: one prompt, one action. No blank canvas anxiety."
        />
      </Section>

      <Section n="04" kicker="Interaction" title="Reduce friction at the point of input.">
        <Lead>
          Location fields use autocomplete with a clear map-pin affordance and a
          live cycle-hours indicator, so the form fills fast and the driver can
          see their remaining hours update as they go.
        </Lead>
        <Figure
          src={`${B}/02-current-location.png`}
          alt="Autocomplete location input with map pin"
          caption="Autocomplete and a live hours indicator keep the form quick and legible."
        />
      </Section>

      <Section n="05" kicker="The hard part" title="A daily log that looks like the real thing.">
        <Lead>
          The standout piece is the FMCSA daily log: a faithful, drawn-to-grid
          duty-status sheet, generated automatically from the planned route.
          Getting this to read like the paper form drivers already know was the
          difference between a toy and something they&apos;d trust.
        </Lead>
        <Figure
          src={`${B}/09-log-sheet-detail.png`}
          alt="Auto-generated FMCSA daily log sheet"
          caption="The auto-generated FMCSA log grid: the detail that makes the tool credible."
        />
      </Section>

      <Section n="06" kicker="Whole flow" title="Input to compliant trip, in one view.">
        <Lead>
          Stops are listed chronologically and the route, stats and logs all
          update together, so the driver always sees the full picture without
          leaving the screen.
        </Lead>
        <Figure
          src={`${B}/11-final-overview.png`}
          alt="Full Spotter ELD overview"
          caption="Everything in one place: route, stops, stats, and logs."
        />
      </Section>

      <Section n="07" kicker="Outcome" title="Shipped and live.">
        <Lead>
          Spotter ELD is deployed and usable end to end, so it can be tried
          rather than just looked at. It&apos;s the project I point to when I want
          to show that I can take a genuinely complicated domain and make the
          interface feel simple.
        </Lead>
        <Link
          href={LIVE}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-bg transition-transform hover:scale-[1.02]"
        >
          Open the live app
          <span aria-hidden>&rarr;</span>
        </Link>
      </Section>

      <NextCase href="/work/streak" label="Next case study" title="Streak" />
    </CaseShell>
  );
}
