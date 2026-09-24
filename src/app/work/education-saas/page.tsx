import type { Metadata } from "next";
import { Section, Lead, Callout, NextCase } from "@/components/work/casestudy";
import ResultNumbers from "@/components/work/ResultNumbers";
import { PhoneRow, ScreenBoard } from "@/components/mockups/frame";
import { ACCENT } from "@/components/mockups/accent";
import {
  EduWeb1,
  EduWeb2,
  EduWeb3,
  EduWeb4,
  EduMobile1,
  EduMobile2,
  EduMobile3,
} from "@/components/mockups/education";
import type { ReactNode } from "react";
import WideCaseShell from "@/components/work/scene/WideCaseShell";
import EduVariantsScene from "@/components/work/scene/EduVariantsScene";
import EduTreeScene from "@/components/work/scene/EduTreeScene";
import EduQuizScene from "@/components/work/scene/EduQuizScene";
import EduInsightsScene from "@/components/work/scene/EduInsightsScene";
import EduDebugScene from "@/components/work/scene/EduDebugScene";
import EduPhoneScene from "@/components/work/scene/EduPhoneScene";
import { SceneIcon, type SceneIconName } from "@/components/work/scene/SceneIcon";
import { BookIcon } from "@/components/work/scene/EduVariantsSceneIcons";
import { QuizSheetIcon } from "@/components/work/scene/EduQuizSceneIcons";
import { EnvelopeIcon } from "@/components/work/scene/EduDebugSceneIcons";

export const metadata: Metadata = {
  title: "K-12 Education SaaS · Engineering case study · Rafii Manggala",
  description:
    "A curriculum-aligned learning platform for schools: quiz engine, AI-generated performance insights, and production debugging at scale.",
};

const accent = ACCENT.amber;

const BREAK_ICON = "h-7 w-7 shrink-0 text-fg sm:h-9 sm:w-9";

function FeatureBreak({ n, title, icon }: { n: string; title: string; icon: SceneIconName | ReactNode }) {
  return (
    <div id={`feature-${n}`} className="mx-auto flex w-full max-w-[1180px] items-center gap-4 px-4 pb-6 pt-16 sm:px-8 sm:pt-24">
      <span className="mono shrink-0 text-[11px] uppercase tracking-[0.14em] text-accent">Feature {n}</span>
      <span className="h-px flex-1 bg-line-strong" />
      {typeof icon === "string" ? <SceneIcon name={icon as SceneIconName} size={36} className="h-7 w-7 sm:h-9 sm:w-9" /> : icon}
      <span className="mono shrink-0 text-[11px] uppercase tracking-[0.14em] text-dim">{title}</span>
    </div>
  );
}

export default function EducationSaasCase() {
  return (
    <WideCaseShell>
      <header className="mx-auto w-full max-w-[860px] px-6 pt-14 sm:pt-20">
        <div className="flex items-center gap-3 border-y border-line py-2.5">
          <span className="h-2 w-2 shrink-0 rounded-full bg-accent" />
          <span className="mono text-[11px] tracking-[0.14em] text-dim uppercase">
            EdTech &middot; Engineering case study
          </span>
        </div>
        <h1 className="t-hero mt-8 text-[clamp(2.6rem,8vw,5.5rem)] leading-[0.95]">
          K-12 Education
          <br />
          SaaS.
        </h1>
        <p className="t-lead mt-6 max-w-[56ch] text-dim">
          One curriculum-aligned platform used by real schools: subject-mapped
          content, a quiz engine and AI performance insights, running against a
          production database of 995 schools.
        </p>
        <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
          {[
            { label: "Role", value: "Full-stack + AI features" },
            { label: "Client", value: "AU education-tech company" },
            { label: "Scale", value: "995 schools / 12,495 users" },
            { label: "Tools", value: ".NET 9, Angular, PostgreSQL, MAUI" },
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
        <FeatureBreak n="01" title="Course variants" icon={<svg aria-hidden viewBox="-12 -12 24 24" className={BREAK_ICON}><BookIcon /></svg>} />
        <EduVariantsScene />
        <FeatureBreak n="02" title="Content tree" icon="sync" />
        <EduTreeScene />
        <FeatureBreak n="03" title="Quiz engine" icon={<QuizSheetIcon className={BREAK_ICON} />} />
        <EduQuizScene />
        <FeatureBreak n="04" title="AI insights" icon="insight" />
        <EduInsightsScene />
        <FeatureBreak n="05" title="Production debugging" icon={<EnvelopeIcon className={BREAK_ICON} />} />
        <EduDebugScene />
        <FeatureBreak n="06" title="On the phone" icon="device-phone" />
        <EduPhoneScene />
      </div>

      <article className="mx-auto w-full max-w-[860px] px-6 pb-32">
      <div className="mt-8">
        <ScreenBoard
          accent={accent}
          items={[
            {
              key: "course",
              label: "course view",
              screen: <EduWeb2 />,
              note: "The topic tree on the left, the levelled lesson list on the right. Same subject, different curriculum, different tree underneath.",
            },
            {
              key: "subjects",
              label: "subject picker",
              screen: <EduWeb1 />,
              note: "Every course variant a school has licensed, downloaded for offline use so a lesson survives a bad school connection.",
            },
            {
              key: "quiz",
              label: "quiz engine",
              screen: <EduWeb3 />,
              note: "One question at a time, scoped to a level, with the question type driving which answer control is shown.",
            },
            {
              key: "insights",
              label: "class insights",
              screen: <EduWeb4 />,
              note: "The fortnightly AI summary a teacher actually reads: completion, topic accuracy, and which class needs a nudge. Classes with no submissions say so rather than reporting a misleading zero.",
            },
          ]}
        />
      </div>

        <p className="mt-6 max-w-[64ch] text-sm text-mute">
          An illustrated recreation of the product, not real screenshots. This
          is an NDA client engagement: the screens follow the real layout so
          the work is legible, while no product name, logo, school, teacher or
          student data is reproduced anywhere.
        </p>

        <details className="group mt-16 border-y border-line">
          <summary className="mono flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-[11px] uppercase tracking-[0.14em] text-dim transition-colors hover:text-fg [&::-webkit-details-marker]:hidden">
            <span>Read the full write-up</span>
            <span aria-hidden className="text-accent transition-transform group-open:rotate-45">+</span>
          </summary>
      <Section n="01" kicker="Problem" title="One curriculum, a dozen course variants.">
        <Lead>
          Schools don&apos;t all teach the same syllabus. A single subject
          like Biology needs separate content trees for different curricula,
          year levels and course types (IB, AP, senior, stage 1/2,
          units 1 to 4), each with its own topic hierarchy, while
          still sharing one quiz engine and one results pipeline underneath.
        </Lead>
      </Section>

      <Section n="02" kicker="Goal" title="18 features, shipped against a live production database.">
        <Lead>
          This wasn&apos;t a greenfield build. It was 18 features delivered
          into an existing system already running for thousands of real
          teachers and students, where every change had to be verified
          against production data before it shipped, not just against a
          local seed database.
        </Lead>
      </Section>

      <Section n="03" kicker="Curriculum engine" title="Deep, navigable content trees.">
        <Lead>
          Content is organised unit &rarr; area of study &rarr; topic
          &rarr; sub-topic, expandable per level, with quizzes assignable at
          any node. The tree has to stay fast and legible even when a single
          subject has hundreds of nodes across multiple curriculum variants.
        </Lead>
      </Section>

      <Section n="04" kicker="Quiz engine" title="A question bank that scales past hundreds of items.">
        <Lead>
          The quiz review UI needed to stay usable at scale: a compact
          hex-grid question map so a teacher can jump straight to any
          question, full answer keys, and feedback text, without paging
          through a long linear list.
        </Lead>
      </Section>

      <Section n="05" kicker="AI feature" title="AI-generated performance insights, sent on a schedule.">
        <Lead>
          One of three AI features on this engagement: a fortnightly
          class-performance summary generated from real quiz results and
          sent by email, with an in-app preview so a teacher can check the
          content before it goes out.
        </Lead>
        <Callout title="Production debugging, not just feature work">
          Two of the harder bugs on this engagement never touched a keyboard
          shortcut: decompiling shipped DLLs to prove a deploy was
          byte-identical to what was tested, and tracing a 9.8K-email backlog
          back to an SMTP provider&apos;s silent rate limit rather than a
          bug in the sending code.
        </Callout>
      </Section>

      <Section n="06" kicker="On the phone" title="The same content, reflowed for mobile.">
        <Lead>
          Students open this on a school-issued tablet as often as a laptop.
          The subject grid, the lesson list and the quiz all reflow to a
          single column rather than being shrunk down.
        </Lead>
        <div className="mt-8">
          <PhoneRow
            accent={accent}
            items={[
              { key: "m1", label: "subjects", screen: <EduMobile1 />, note: "Subject tiles, two to a row." },
              { key: "m2", label: "quiz", screen: <EduMobile3 />, note: "Answer controls stack instead of sitting side by side." },
              { key: "m3", label: "topics", screen: <EduMobile2 />, note: "The lesson list, full width." },
            ]}
          />
        </div>
      </Section>

        </details>

      <Section n="07" kicker="Outcome" title="Live, serving real schools.">
        <Lead>
          All 18 features are live in production. The system now runs
          integration tests against isolated containers instead of a shared
          dev database, after a silently-rejected auth token bug made the
          case for it. The kind of fix that only shows up once you
          stop trusting the happy path.
        </Lead>
        <ResultNumbers
          caption="Outcome in numbers"
          stats={[
            { value: "995", label: "schools on the live production system" },
            { value: "12,495", label: "users on that system" },
            { value: "18", label: "features shipped into it" },
            { value: "9,800", label: "stuck emails traced to a silent SMTP rate limit" },
          ]}
        />
      </Section>

      <NextCase
        href="/work/content-automation-pipeline"
        label="Next case study"
        title="Content Automation Pipeline"
      />
    </article>
    </WideCaseShell>
  );
}
