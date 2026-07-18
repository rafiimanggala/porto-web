import type { Metadata } from "next";
import {
  CaseShell,
  CaseHero,
  Section,
  Lead,
  Callout,
  NextCase,
} from "@/components/work/casestudy";
import { AutoCycle, BrowserWindow, PhoneWindow } from "@/components/mockups/frame";
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

export const metadata: Metadata = {
  title: "K-12 Education SaaS · Engineering case study · Rafii Manggala",
  description:
    "A curriculum-aligned learning platform for schools: quiz engine, AI-generated performance insights, and production debugging at scale.",
};

const accent = ACCENT.amber;

export default function EducationSaasCase() {
  return (
    <CaseShell>
      <CaseHero
        eyebrow="EdTech · Engineering case study"
        title="K-12 Education SaaS"
        subtitle="A curriculum-aligned learning platform used by real schools: subject-mapped content, a quiz engine, and AI-generated performance insights, running against a production database of 995 schools."
        meta={[
          { label: "Role", value: "Full-stack + AI features" },
          { label: "Client", value: "AU education-tech company" },
          { label: "Scale", value: "995 schools / 12,495 users" },
          { label: "Tools", value: ".NET 9, Angular, PostgreSQL, MAUI" },
        ]}
      />

      <Callout title="Note on these mockups">
        This is an NDA client engagement. The screens on this page are an
        illustrated recreation of the product&apos;s features, not real
        screenshots &mdash; no product name, logo, school, teacher, or
        student data is reproduced anywhere.
      </Callout>

      <div className="mt-8">
        <BrowserWindow label="curriculum &middot; quiz engine &middot; ai insights" accent={accent}>
          <AutoCycle
            accent={accent}
            screens={[
              <EduWeb1 key="1" accent={accent} />,
              <EduWeb2 key="2" accent={accent} />,
              <EduWeb3 key="3" accent={accent} />,
              <EduWeb4 key="4" accent={accent} />,
            ]}
          />
        </BrowserWindow>
      </div>

      <Section n="01" kicker="Problem" title="One curriculum, a dozen course variants.">
        <Lead>
          Schools don&apos;t all teach the same syllabus. A single subject
          like Biology needs separate content trees for different curricula,
          year levels and course types &mdash; IB, AP, senior, stage 1/2,
          units 1&ndash;4 &mdash; each with its own topic hierarchy, while
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

      <Section n="06" kicker="On the phone" title="Class results, reflowed for mobile.">
        <Lead>
          Teachers check class performance between periods, not just at a
          desk. The results view collapses to single-column progress cards
          on mobile.
        </Lead>
        <div className="mt-8 max-w-[280px]">
          <PhoneWindow accent={accent}>
            <AutoCycle
              accent={accent}
              screens={[
                <EduMobile1 key="1" accent={accent} />,
                <EduMobile3 key="3" accent={accent} />,
                <EduMobile2 key="2" accent={accent} />,
              ]}
            />
          </PhoneWindow>
        </div>
      </Section>

      <Section n="07" kicker="Outcome" title="Live, serving real schools.">
        <Lead>
          All 18 features are live in production. The system now runs
          integration tests against isolated containers instead of a shared
          dev database, after a silently-rejected auth token bug made the
          case for it &mdash; the kind of fix that only shows up once you
          stop trusting the happy path.
        </Lead>
      </Section>

      <NextCase
        href="/work/content-automation-pipeline"
        label="Next case study"
        title="Content Automation Pipeline"
      />
    </CaseShell>
  );
}
