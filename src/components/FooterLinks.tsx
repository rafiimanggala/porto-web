import Link from "next/link";
import type { ReactNode } from "react";
import { profile, toolkit, techStack } from "@/data/portfolio";

// Quiet closing footer for the cream home: a hairline, the brand and tagline
// beside four link groups (ink group titles, dim links), then a small bottom
// bar. Contact.tsx (lean) owns the violet closing panel right above this.

// Links are min 44px tall so they are easy to hit on a phone.
const LINK =
  "flex min-h-11 items-center text-sm text-dim underline-offset-4 transition-colors hover:text-fg hover:underline";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-fg">
        {title}
      </h3>
      <ul className="flex flex-col">{children}</ul>
    </div>
  );
}

function Brand() {
  return (
    <div className="col-span-2 sm:col-span-1">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center gap-2.5 font-display text-xl text-fg"
      >
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-sm text-surface-2"
        >
          R
        </span>
        Rafii Manggala
      </Link>
      <p className="mt-2 max-w-[240px] text-sm text-dim">{profile.tagline}</p>
    </div>
  );
}

export default function FooterLinks() {
  return (
    <div className="border-t border-line">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-12 sm:py-16 lg:px-8">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <Brand />

          <Group title="Explore">
            <li>
              <a href="#directory" className={LINK}>
                Directory
              </a>
            </li>
            <li>
              <a href="#contact" className={LINK}>
                Contact
              </a>
            </li>
            <li>
              <Link href="/dev" className={LINK}>
                Engineering deep dive &#8599;
              </Link>
            </li>
          </Group>

          <Group title="Elsewhere">
            <li>
              <a href={`mailto:${profile.email}`} className={LINK}>
                Email
              </a>
            </li>
            <li>
              <a href={profile.github} target="_blank" rel="noreferrer" className={LINK}>
                GitHub &#8599;
              </a>
            </li>
            <li>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className={LINK}>
                LinkedIn &#8599;
              </a>
            </li>
          </Group>

          <Group title="Toolkit">
            {toolkit.slice(0, 3).map((t) => (
              <li key={t.name}>
                <Link href="/dev#toolkit" className={LINK}>
                  {t.name}
                </Link>
              </li>
            ))}
          </Group>

          <Group title="Stack">
            {techStack.slice(0, 3).map((t) => (
              <li key={t} className="flex min-h-11 items-center text-sm text-dim">
                {t}
              </li>
            ))}
          </Group>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-dim">
          <span>&copy; 2026 {profile.name}.</span>
          <span className="inline-flex items-center rounded-full bg-surface-3 px-4 py-2 text-xs text-fg">
            Built with Next.js &middot; the agents helped.
          </span>
        </div>
      </div>
    </div>
  );
}
