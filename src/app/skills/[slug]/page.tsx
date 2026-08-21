import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseShell, CaseHero, Section, Lead } from "@/components/work/casestudy";
import { skills, skillBySlug } from "@/data/skills";
import { profile } from "@/data/portfolio";

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
  const body = (
    <>
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
          Open &rarr;
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-dim">{why}</p>
    </>
  );

  const cls =
    "group block bg-surface-1 p-6 transition-colors duration-200 hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:[outline-offset:-3px]";

  return (
    <li className="flex flex-col">
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

      <Section n="02" kicker="Start" title="Think this is your problem?">
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
          <span aria-hidden>&larr;</span> All six
        </Link>
      </div>
    </CaseShell>
  );
}
