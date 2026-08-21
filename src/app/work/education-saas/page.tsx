import type { Metadata } from "next";
import {
  CaseShell,
  CaseHero,
  Section,
  Lead,
  Callout,
  NextCase,
} from "@/components/work/casestudy";
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

export const metadata: Metadata = {
  title: "K-12 Education SaaS · Engineering case study · Rafii Manggala",
  description:
    "A curriculum-aligned learning platform for schools: quiz engine, AI-generated performance insights, and production debugging at scale.",
};

const accent = ACCENT.amber;
/* The mockups carry the product's own blue, so their frames and captions use
   it rather than the amber this case study is tagged with elsewhere. */
const BLUE = "#0d9ddb";

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
        screenshots. No product name, logo, school, teacher, or
        student data is reproduced anywhere.
      </Callout>

      <div className="mt-8">
        <ScreenBoard
          accent={BLUE}
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
            accent={BLUE}
            items={[
              { key: "m1", label: "subjects", screen: <EduMobile1 />, note: "Subject tiles, two to a row." },
              { key: "m2", label: "quiz", screen: <EduMobile3 />, note: "Answer controls stack instead of sitting side by side." },
              { key: "m3", label: "topics", screen: <EduMobile2 />, note: "The lesson list, full width." },
            ]}
          />
        </div>
      </Section>

      <Section n="07" kicker="Outcome" title="Live, serving real schools.">
        <Lead>
          All 18 features are live in production. The system now runs
          integration tests against isolated containers instead of a shared
          dev database, after a silently-rejected auth token bug made the
          case for it. The kind of fix that only shows up once you
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
