import type { Metadata } from "next";
import {
  CaseShell,
  CaseHero,
  Section,
  Lead,
  PhoneRow,
  Callout,
  ProtoButton,
  NextCase,
} from "@/components/work/casestudy";

export const metadata: Metadata = {
  title: "Streak · UI/UX case study · Rafii Manggala",
  description:
    "Designing a warm, encouraging habit tracker: research, user flow, design system, and a clickable prototype.",
};

/* ---- small in-page diagram + system bits (presentational) ---- */

function Flow() {
  const steps = ["Onboard", "Today", "Add habit", "Check off", "Insights"];
  return (
    <div className="mt-8 flex flex-wrap items-center gap-2 rounded-2xl border border-line bg-surface-1 p-6">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-2">
          <span className="rounded-full border border-line-strong bg-surface-2 px-4 py-2 text-sm text-fg">
            {s}
          </span>
          {i < steps.length - 1 ? (
            <span className="text-mute" aria-hidden>
              &rarr;
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function WirePhone({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[180px] rounded-[22px] border border-line-strong bg-surface-1 p-3">
      <div className="flex flex-col gap-2.5 rounded-[14px] bg-surface-2 p-3">
        {children}
      </div>
    </div>
  );
}
function Bar({ w = "100%", h = 10, r = 4 }: { w?: string; h?: number; r?: number }) {
  return (
    <div
      style={{ width: w, height: h, borderRadius: r }}
      className="bg-[rgba(255,255,255,0.10)]"
    />
  );
}

function SystemPanel() {
  const colors = [
    { name: "Paper", hex: "#F6F1E9" },
    { name: "Ink", hex: "#211B14" },
    { name: "Ember / primary", hex: "#FF5A3C" },
    { name: "Success", hex: "#1FA97B" },
  ];
  return (
    <div className="mt-8 grid gap-5 rounded-2xl border border-line bg-surface-1 p-6 sm:grid-cols-2">
      <div>
        <div className="eyebrow mb-3">Colour</div>
        <div className="space-y-2.5">
          {colors.map((c) => (
            <div key={c.hex} className="flex items-center gap-3">
              <span
                className="h-7 w-7 rounded-full border border-line-strong"
                style={{ background: c.hex }}
              />
              <span className="text-sm text-fg">{c.name}</span>
              <span className="mono ml-auto text-xs text-mute">{c.hex}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="eyebrow mb-3">Type &amp; tokens</div>
        <div
          className="text-fg"
          style={{ fontFamily: "Georgia, serif", fontSize: 26, lineHeight: 1.1 }}
        >
          Fraunces
        </div>
        <div className="text-sm text-dim">Display · warm, editorial</div>
        <div className="mt-3 text-fg" style={{ fontSize: 16 }}>
          Inter
        </div>
        <div className="text-sm text-dim">UI · clean, legible</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {["4", "8", "16", "24", "32", "48"].map((s) => (
            <span
              key={s}
              className="mono rounded-md border border-line bg-surface-2 px-2 py-1 text-xs text-mute"
            >
              {s}
            </span>
          ))}
        </div>
        <div className="mt-2 text-xs text-mute">Spacing scale · radius 12 / 18 / 26</div>
      </div>
    </div>
  );
}

const B = "/work/streak";

export default function StreakCase() {
  return (
    <CaseShell>
      <CaseHero
        eyebrow="UI/UX Case Study"
        title="Streak"
        subtitle="A warm, encouraging habit tracker. I took it from a one-line problem to a clickable prototype: research, user flow, a small design system, and five responsive screens."
        meta={[
          { label: "Role", value: "Concept, UI/UX, build" },
          { label: "Timeline", value: "1 week" },
          { label: "Platform", value: "Responsive web" },
          { label: "Tools", value: "Figma, React, Tailwind" },
        ]}
      />

      <PhoneRow
        shots={[
          { src: `${B}/m-onboarding.png`, label: "Onboarding" },
          { src: `${B}/m-home.png`, label: "Today" },
          { src: `${B}/m-detail.png`, label: "Habit detail" },
          { src: `${B}/m-add.png`, label: "Add habit" },
          { src: `${B}/m-stats.png`, label: "Insights" },
        ]}
      />

      <Section n="01" kicker="Problem" title="People quit habit apps the day they break a streak.">
        <Lead>
          Most trackers treat a missed day as failure. The streak resets to zero,
          the screen turns red, and the guilt makes people delete the app instead
          of trying again. The tracker meant to build consistency becomes the
          reason they stop.
        </Lead>
        <Callout title="Design principle">
          Encourage, don&apos;t punish. Progress should feel warm and forgiving,
          so a missed day is a small dip, not a wall.
        </Callout>
      </Section>

      <Section n="02" kicker="Goal" title="Make daily tracking feel calm and rewarding.">
        <Lead>
          One clear job: help someone create a habit and check it off today,
          in under ten seconds, while making the long view feel motivating
          rather than judgmental. Everything else stays out of the way.
        </Lead>
      </Section>

      <Section n="03" kicker="Research" title="The insight that shaped every screen.">
        <Lead>
          Looking at how people talk about habit apps, the pattern was loss
          aversion: a broken streak feels like losing something earned, so the
          punishment for one slip is bigger than the reward for showing up.
          I leaned the whole design the other way, toward visible, accumulating
          progress that a single off day can&apos;t erase.
        </Lead>
        <Columns2>
          <Mini title="What people feel" body="Guilt on a miss, pressure to be perfect, all-or-nothing." />
          <Mini title="What I designed for" body="Soft streaks, a 17-week heat map, and an honest weekly view that shows trend over perfection." />
        </Columns2>
      </Section>

      <Section n="04" kicker="User flow" title="One primary path, kept short.">
        <Lead>
          The core loop is just two moves: add a habit, then check it off. The
          flow below is the spine the whole app is built around.
        </Lead>
        <Flow />
      </Section>

      <Section n="05" kicker="Wireframes" title="The messy middle.">
        <Lead>
          I started in low fidelity to settle structure before style. The first
          home screen tried to show every habit&apos;s full history at once and
          felt heavy, so I cut it back to today&apos;s list plus a single
          progress ring, and pushed history into the detail screen.
        </Lead>
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div>
            <WirePhone>
              <Bar w="55%" h={14} />
              <Bar w="80%" h={20} />
              <div className="my-1 h-16 w-16 self-center rounded-full border-2 border-[rgba(255,255,255,0.12)]" />
              <Bar />
              <Bar w="70%" />
            </WirePhone>
            <p className="mt-2 text-center text-xs text-mute">Today</p>
          </div>
          <div>
            <WirePhone>
              <Bar w="40%" h={14} />
              <div className="h-10 rounded-md bg-[rgba(255,255,255,0.08)]" />
              <div className="grid grid-cols-4 gap-1.5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded bg-[rgba(255,255,255,0.08)]" />
                ))}
              </div>
              <Bar w="60%" />
            </WirePhone>
            <p className="mt-2 text-center text-xs text-mute">Add habit</p>
          </div>
          <div>
            <WirePhone>
              <Bar w="50%" h={14} />
              <Bar w="35%" h={26} />
              <div className="grid grid-cols-9 gap-1">
                {Array.from({ length: 36 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-sm bg-[rgba(255,255,255,0.08)]" />
                ))}
              </div>
            </WirePhone>
            <p className="mt-2 text-center text-xs text-mute">Detail</p>
          </div>
        </div>
      </Section>

      <Section n="06" kicker="Design system" title="A small, warm system.">
        <Lead>
          A single primary (ember), one success colour, and warm neutrals on a
          paper canvas. A serif display (Fraunces) gives it personality; Inter
          keeps the UI calm. Everything sits on a 4-point spacing scale with
          three radii, so new screens stay consistent by default.
        </Lead>
        <SystemPanel />
      </Section>

      <Section n="07" kicker="Final screens" title="From problem to solution.">
        <Columns2>
          <Mini
            title="Today, at a glance"
            body="A progress ring shows how many habits are done today. The number can dip but never shames; the copy stays encouraging."
          />
          <Mini
            title="History that rewards showing up"
            body="The detail screen leads with the current streak, then a 17-week heat map so consistency is visible even after an off day."
          />
        </Columns2>
        <PhoneRow
          shots={[
            { src: `${B}/m-home.png`, label: "Today" },
            { src: `${B}/m-detail.png`, label: "Streak + heat map" },
            { src: `${B}/m-stats.png`, label: "Honest weekly view" },
            { src: `${B}/m-add.png`, label: "Create in seconds" },
            { src: `${B}/m-onboarding.png`, label: "Gentle start" },
          ]}
        />
      </Section>

      <Section n="08" kicker="Prototype" title="Try the real thing.">
        <Lead>
          The prototype is fully clickable: toggle habits, open a detail screen,
          create a new habit, and switch the accent live. Built in React so the
          design survives implementation, and resizes from phone to desktop.
        </Lead>
        <ProtoButton href="/demo/streak" />
      </Section>

      <Section n="09" kicker="Reflection" title="What I'd do next.">
        <Lead>
          If I kept going, I&apos;d user-test the streak language to confirm it
          actually lowers the cost of a missed day, and design an empty and
          first-week state for brand-new users who have no history yet. The
          biggest lesson was restraint: the home screen got better every time I
          removed something.
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

/* tiny helpers local to this page */
function Columns2({ children }: { children: React.ReactNode }) {
  return <div className="mt-6 grid gap-4 sm:grid-cols-2">{children}</div>;
}
function Mini({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-line bg-surface-1 p-5">
      <div className="text-sm font-medium text-fg">{title}</div>
      <p className="mt-2 text-sm leading-relaxed text-dim">{body}</p>
    </div>
  );
}
