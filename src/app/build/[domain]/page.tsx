import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CaseShell, CaseHero, Section, Lead } from "@/components/work/casestudy";
import { fieldNotes, fieldNoteBySlug } from "@/data/fieldNotes";
import { profile } from "@/data/portfolio";
import Arrow from "@/components/ui/Arrow";

export function generateStaticParams() {
  return fieldNotes.map((f) => ({ domain: f.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string }>;
}): Promise<Metadata> {
  const { domain } = await params;
  const note = fieldNoteBySlug(domain);
  if (!note) return {};
  return {
    title: `${note.title} · Field notes · Rafii Manggala`,
    description: note.value,
    alternates: { canonical: `/build/${note.slug}` },
  };
}

function NoteRow({
  i,
  title,
  body,
  source,
}: {
  i: number;
  title: string;
  body: string;
  source?: { label: string; href: string };
}) {
  return (
    <li className="border-t border-line py-7 first:border-t-0 first:pt-0">
      <div className="flex gap-4 sm:gap-6">
        <span
          aria-hidden
          className="mono nums mt-1 shrink-0 text-[11px] text-mute"
        >
          {String(i).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          <h3 className="t-h3 max-w-[44ch] text-fg">{title}</h3>
          <p className="mt-3 max-w-[64ch] text-sm leading-relaxed text-dim">
            {body}
          </p>
          {source ? (
            <Link
              href={source.href}
              className="mono mt-3 inline-flex items-center gap-1.5 text-[11px] text-mute transition-colors hover:text-accent"
            >
              Where this happened: {source.label}
              <Arrow />
            </Link>
          ) : null}
        </div>
      </div>
    </li>
  );
}

export default async function FieldNotePage({
  params,
}: {
  params: Promise<{ domain: string }>;
}) {
  const { domain } = await params;
  const note = fieldNoteBySlug(domain);
  if (!note) notFound();

  const others = fieldNotes.filter((f) => f.slug !== note.slug);

  return (
    <CaseShell>
      <CaseHero
        eyebrow="Field notes"
        title={note.title}
        subtitle={note.value}
        meta={[
          { label: "Domain", value: note.domain },
          { label: "Notes", value: `${note.notes.length} items` },
          { label: "Source", value: "Shipped work" },
          { label: "Reply", value: "Within a day" },
        ]}
      />

      <Section n="01" kicker="Notes" title="What I already knew before the kickoff call.">
        <Lead>{note.standing}</Lead>
        {/* Every line below is something that happened on work that shipped.
            Items with no link are public facts about an external framework,
            not claims about my own record. */}
        <ul className="mt-8">
          {note.notes.map((x, i) => (
            <NoteRow key={x.title} i={i + 1} {...x} />
          ))}
        </ul>
      </Section>

      <Section n="02" kicker="Other domains" title="The same notes, other ground.">
        <ul className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {others.map((o) => (
            <li key={o.slug} className="flex min-w-0">
              <Link
                href={`/build/${o.slug}`}
                className="group block w-full bg-surface-1 p-6 transition-colors hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:[outline-offset:-3px]"
              >
                <span className="eyebrow">{o.domain}</span>
                <h3 className="t-h3 mt-2 text-fg">{o.title}</h3>
                <span className="mono mt-3 inline-flex items-center gap-2 text-[11px] text-mute transition-colors group-hover:text-accent">
                  {o.notes.length} notes
                  <Arrow className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section n="03" kicker="Start" title="Working in one of these?">
        <Lead>
          Tell me what is happening in your own words. I will tell you within a
          day whether it is mine to solve, and roughly what it takes.
        </Lead>
        <p className="mt-6">
          <a
            href={`mailto:${profile.email}`}
            className="mono inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface-2 px-5 py-2.5 text-sm text-fg transition-colors hover:border-accent hover:text-accent"
          >
            {profile.email}
            <Arrow />
          </a>
        </p>
      </Section>
    </CaseShell>
  );
}
