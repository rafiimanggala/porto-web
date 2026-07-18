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
  title: "K-12 Education SaaS · Engineering case study · Rafii Manggala",
  description:
    "A curriculum-aligned learning platform for schools: quiz engine, AI-generated performance insights, and production debugging at scale.",
};

const B = "/work/education-saas";

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

      <Callout title="Note on these screenshots">
        This is an NDA client engagement. The screens below are from a
        demo/test account with every occurrence of the product name and logo
        removed. No school, teacher, or student data is shown.
      </Callout>

      <Section n="01" kicker="Problem" title="One curriculum, a dozen course variants.">
        <Lead>
          Schools don&apos;t all teach the same syllabus. A single subject
          like Biology needs separate content trees for different curricula,
          year levels and course types &mdash; IB, AP, senior, stage 1/2,
          units 1&ndash;4 &mdash; each with its own topic hierarchy, while
          still sharing one quiz engine and one results pipeline underneath.
        </Lead>
      </Section>

      <Figure
        src={`${B}/01-dashboard.png`}
        alt="Subject and course selection grid: Biology, Chemistry, Physics, Forensics, Marine Science, Psychology variants"
        caption="One entry point into a dozen curriculum variants across Biology, Chemistry, Physics and more."
      />

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
        <Figure
          src={`${B}/02-curriculum.png`}
          alt="Curriculum content tree for a Biology unit, showing nucleic acid topics with assign/view quiz actions"
          caption="A curriculum tree scoped to unit and level, with quiz actions available at any node."
        />
      </Section>

      <Section n="04" kicker="Quiz engine" title="A question bank that scales past hundreds of items.">
        <Lead>
          The quiz review UI needed to stay usable at scale: a compact
          hex-grid question map so a teacher can jump straight to any
          question, full answer keys, and feedback text, without paging
          through a long linear list.
        </Lead>
        <Figure
          src={`${B}/03-quiz-engine.png`}
          alt="Quiz question review interface with a hexagonal question navigator and multiple-choice answer key"
          caption="Quiz review: jump to any question via the hex map, see the correct answer and feedback inline."
        />
        <Figure
          src={`${B}/06-quiz-builder.png`}
          alt="Custom quiz builder form: quiz name, class assignment, question count, due date, topic selection"
          caption="Teachers can also build a fresh custom quiz from any combination of topics, scoped to a class."
        />
      </Section>

      <Section n="05" kicker="AI feature" title="AI-generated performance insights, sent on a schedule.">
        <Lead>
          One of three AI features on this engagement: a fortnightly
          class-performance summary generated from real quiz results and
          sent by email, with an in-app preview so a teacher can check the
          content before it goes out.
        </Lead>
        <Figure
          src={`${B}/05-ai-insights.png`}
          alt="Class performance insights preview panel with date range and class selector"
          caption="The same content that goes out in the scheduled insights email, previewable in-app first."
        />
        <Callout title="Production debugging, not just feature work">
          Two of the harder bugs on this engagement never touched a keyboard
          shortcut: decompiling shipped DLLs to prove a deploy was
          byte-identical to what was tested, and tracing a 9.8K-email backlog
          back to an SMTP provider&apos;s silent rate limit rather than a
          bug in the sending code.
        </Callout>
      </Section>

      <Section n="06" kicker="Outcome" title="Live, serving real schools.">
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
