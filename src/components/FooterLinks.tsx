import Link from "next/link";
import { profile, toolkit, techStack } from "@/data/portfolio";

// The site-map footer x.ai/bot closes on: a quiet globe mark, a brand +
// tagline column beside four equal-weight link columns, then a bottom bar
// (copyright, "built with" badge, theme toggle). Contact.tsx (lean) still
// owns the closing headline and contact cards right above this.
export default function FooterLinks() {
  return (
    <div className="border-t border-line">
      <div className="mx-auto w-full max-w-[1120px] px-6 py-16 lg:px-8">
        <svg
          aria-hidden
          className="mx-auto mb-10 opacity-40"
          width="72"
          height="72"
          viewBox="0 0 120 120"
          fill="none"
          stroke="var(--color-mute)"
          strokeWidth="1"
        >
          <circle cx="60" cy="60" r="50" />
          <ellipse cx="60" cy="60" rx="50" ry="20" />
          <ellipse cx="60" cy="60" rx="20" ry="50" />
          <path d="M10 60H110" />
        </svg>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="mono flex items-center gap-2 text-sm font-medium text-fg">
              <span
                aria-hidden
                className="flex h-5 w-5 items-center justify-center rounded-full border border-line-strong bg-surface-2 text-[10px] font-bold text-accent"
              >
                &gt;
              </span>
              {profile.handle}
              <span className="text-accent">.</span>
            </Link>
            <p className="mt-3 max-w-[220px] text-sm text-dim">{profile.tagline}</p>
          </div>

          <div>
            <h4 className="mono mb-4 text-[11px] uppercase tracking-wide text-mute">
              Explore
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <a href="#directory" className="text-dim transition-colors hover:text-fg">
                  Directory
                </a>
              </li>
              <li>
                <a href="#contact" className="text-dim transition-colors hover:text-fg">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/dev" className="text-dim transition-colors hover:text-fg">
                  Engineering deep dive &#8599;
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mono mb-4 text-[11px] uppercase tracking-wide text-mute">
              Elsewhere
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li>
                <a href={`mailto:${profile.email}`} className="text-dim transition-colors hover:text-fg">
                  Email
                </a>
              </li>
              <li>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  className="text-dim transition-colors hover:text-fg"
                >
                  GitHub &#8599;
                </a>
              </li>
              <li>
                <a
                  href={profile.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="text-dim transition-colors hover:text-fg"
                >
                  LinkedIn &#8599;
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mono mb-4 text-[11px] uppercase tracking-wide text-mute">
              Toolkit
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {toolkit.slice(0, 3).map((t) => (
                <li key={t.name}>
                  <Link href="/dev#toolkit" className="text-dim transition-colors hover:text-fg">
                    {t.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mono mb-4 text-[11px] uppercase tracking-wide text-mute">
              Stack
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm">
              {techStack.slice(0, 3).map((t) => (
                <li key={t} className="text-dim">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6 text-sm text-dim">
          <span>&copy; 2026 {profile.name}.</span>
          <div className="flex items-center gap-4">
            <span className="mono inline-flex items-center gap-1.5 rounded-full border border-line-strong px-3 py-1.5 text-xs text-fg">
              Built with Next.js &middot; the agents helped.
            </span>
            {/* Decorative only: no theme system to wire up yet, matches the reference's icon-only toggle */}
            <button
              type="button"
              aria-label="Toggle theme"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-line-strong text-dim transition-colors hover:text-fg"
            >
              <svg
                aria-hidden
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
