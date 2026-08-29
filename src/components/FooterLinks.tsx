import Link from "next/link";
import { profile, toolkit, techStack } from "@/data/portfolio";

// The site-map footer x.ai/bot closes on: a quiet globe mark, then four
// equal-weight link columns. Contact.tsx (lean) already renders the closing
// headline, contact cards and final copyright line right above this, so this
// block stays to columns only rather than repeating that copy.
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

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
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
      </div>
    </div>
  );
}
