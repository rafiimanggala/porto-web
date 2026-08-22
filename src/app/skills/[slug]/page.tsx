import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseShell, CaseHero, Section, Lead } from "@/components/work/casestudy";
import ProofPreview, { hasProofPreview } from "@/components/work/ProofPreview";
import { fieldNoteBySlug, notesForSkill } from "@/data/fieldNotes";
import { skills, skillBySlug } from "@/data/skills";
import { profile } from "@/data/portfolio";
import Arrow from "@/components/ui/Arrow";

const EMAIL = profile.email;

export function generateStaticParams() {
  return skills.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const skill = skillBySlug(slug);
  if (!skill) return {};
  return {
    title: `${skill.title} · Rafii Manggala`,
    description: skill.value,
    alternates: { canonical: `/skills/${skill.slug}` },
  };
}

function ProofRow({
  label,
  href,
  external,
  why,
}: {
  label: string;
  href: string;
  external?: boolean;
  why: string;
}) {
  // Rows whose destination has no case card stay text-only rather than borrow
  // an image, so the gap is readable as "no screenshot", not as a broken row.
  const withPreview = hasProofPreview(href);

  const body = (
    <div className={withPreview ? "flex flex-col gap-5 sm:flex-row sm:items-center" : ""}>
      {withPreview ? <ProofPreview href={href} /> : null}
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="t-h3">
            {label}
            {external ? (
              <span aria-hidden className="ml-1.5 text-mute">
                &#8599;
              </span>
            ) : null}
          </h3>
          <span
            aria-hidden
            className="mono shrink-0 text-[11px] text-mute transition-colors duration-200 group-hover:text-accent"
          >
            Open <Arrow className="ml-1" />
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-dim">{why}</p>
      </div>
    </div>
  );

  const cls =
    "group block bg-surface-1 p-6 transition-colors duration-200 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:[outline-offset:-3px]";

  // min-w-0: the preview renders a real product mockup whose min-content width
  // is wider than a narrow phone, and a grid item defaults to min-width:auto.
  // Without this the whole row refuses to shrink and the list clips it.
  return (
    <li className="flex min-w-0 flex-col">
      {external ? (
        <a href={href} target="_blank" rel="noreferrer" className={cls}>
          {body}
        </a>
      ) : (
        <Link href={href} className={cls}>
          {body}
        </Link>
      )}
    </li>
  );
}

export default async function SkillPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const skill = skillBySlug(slug);
  if (!skill) notFound();

  const notes = (notesForSkill[slug] ?? [])
    .map(fieldNoteBySlug)
    .filter((f) => f !== undefined);

  return (
    <CaseShell>
      <CaseHero
        eyebrow="What I get hired for"
        title={skill.title}
        subtitle={skill.value}
        meta={[
          { label: "Proof", value: `${skill.proof.length} pieces of work` },
          { label: "Tools", value: skill.tools.slice(0, 3).join(", ") },
          { label: "Availability", value: "Remote · UTC+7" },
          { label: "Reply", value: "Within a day" },
        ]}
      />

      <Section n="01" kicker="Proof" title="Where this has already shipped.">
        <Lead>{skill.evidence}. Open any of the three to read how it was built.</Lead>
        <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line">
          {skill.proof.map((p) => (
            <ProofRow key={p.label} {...p} />
          ))}
        </ul>
        <p className="mono mt-12 text-[11px] text-mute">
          {skill.tools.join(" · ")}
        </p>
      </Section>

      {notes.length > 0 ? (
        <Section
          n="02"
          kicker="Field notes"
          title="What I already knew about your domain."
        >
          <Lead>
            The traps specific to this kind of product, each one from work that
            shipped rather than from a reading list.
          </Lead>
          <ul className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {notes.map((f) => (
              <li key={f.slug} className="flex min-w-0">
                <Link
                  href={`/build/${f.slug}`}
                  className="group block w-full bg-surface-1 p-6 transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:[outline-offset:-3px]"
                >
                  <span className="eyebrow">{f.domain}</span>
                  <h3 className="t-h3 mt-2 text-fg">{f.title}</h3>
                  <span className="mono mt-3 inline-flex items-center gap-2 text-[11px] text-mute transition-colors group-hover:text-accent">
                    {f.notes.length} notes
                    <Arrow className="transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section
        n={notes.length > 0 ? "03" : "02"}
        kicker="Start"
        title="Think this is your problem?"
      >
        <Lead>
          Tell me what is happening in your own words. No brief needed, no spec.
          I will tell you within a day whether it is mine to solve, and roughly
          what it takes.
        </Lead>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`mailto:${EMAIL}?subject=${encodeURIComponent(skill.title)}`}
            data-unit={`cta:skill:${skill.slug}`}
            className="mono cursor-pointer rounded-full bg-accent px-5 py-2.5 text-xs font-semibold text-bg transition-opacity duration-200 hover:opacity-90"
          >
            Describe the problem
          </a>
          <span className="mono text-[11px] text-mute">
            {EMAIL} · reply within a day
          </span>
        </div>
      </Section>

      <div className="mt-16 border-t border-line pt-8">
        <Link
          href="/#directory"
          className="mono inline-flex items-center gap-2 text-sm text-dim transition-colors hover:text-fg"
        >
          <Arrow dir="left" /> All six
        </Link>
      </div>
    </CaseShell>
  );
}
