"use client";

import { motion, useReducedMotion } from "framer-motion";
import { profile, techStack } from "@/data/portfolio";
import Reveal from "./ui/Reveal";
import Marquee from "./ui/Marquee";
import { SPRING, HOVER_SCALE, TAP_SCALE } from "./home/springs";

// Shared footer. `lean` is what the switchboard homepage uses: a flat orange
// panel on the green theme with the email as the one big action. The bio, the
// tech marquee and the second availability badge are dropped there because the
// homepage already states availability once and says nothing twice. The full
// (non-lean) block below is what the dark /dev and /video pages still use.

// Focus ring that stays visible on the orange panel (the global ring is orange).
const PILL_FOCUS = "focus-visible:outline-sun";

function ArrowUpRight() {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

// Flat pastel target (rings, no gradient): a nod to the B3 reference's palette.
function TargetMark({ className }: { className: string }) {
  return (
    <svg aria-hidden viewBox="0 0 200 200" className={className}>
      <circle cx="100" cy="100" r="100" fill="var(--color-fg)" opacity="0.18" />
      <circle cx="100" cy="100" r="78" fill="var(--color-sky)" />
      <circle cx="100" cy="100" r="52" fill="var(--color-rose)" />
      <circle cx="100" cy="100" r="26" fill="var(--color-sun)" />
    </svg>
  );
}

function OutPill({
  href,
  unit,
  tone,
  label,
  sr,
}: {
  href: string;
  unit: string;
  tone: string;
  label: string;
  sr: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      data-unit={unit}
      aria-label={`${label} (${sr})`}
      className={`inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-full px-6 text-sm font-semibold text-pastel-ink transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${tone} ${PILL_FOCUS}`}
      whileHover={reduce ? undefined : HOVER_SCALE}
      whileTap={reduce ? undefined : TAP_SCALE}
      transition={SPRING}
    >
      {label}
      <ArrowUpRight />
    </motion.a>
  );
}

function LeanContact() {
  const reduce = useReducedMotion();
  return (
    <footer id="contact" className="relative">
      <div className="mx-auto w-full max-w-[1120px] px-6 pb-16 sm:pb-24 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-[32px] bg-accent px-6 py-12 text-surface-1 sm:rounded-[40px] sm:px-12 sm:py-16 lg:px-16 lg:py-20">
            <TargetMark className="mb-8 h-16 w-16 sm:h-20 sm:w-20 xl:absolute xl:-right-14 xl:top-1/2 xl:mb-0 xl:h-64 xl:w-64 xl:-translate-y-1/2" />

            <div className="relative max-w-[760px]">
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                Contact
              </span>
              <h2 className="mt-4 font-display text-[clamp(2.5rem,1.6rem+3.4vw,4.25rem)] font-normal leading-[1.16] tracking-[-0.01em]">
                <span>Tell me what is broken, or </span>
                <span className="rounded-2xl bg-sun px-3 text-pastel-ink [box-decoration-break:clone]">
                  what you want built.
                </span>
              </h2>
              <p className="t-lead mt-6 max-w-[54ch] text-fg/95">
                Not sure which one? Describe the problem and I will tell you if it is mine to solve. Reply within a day, Indonesia time.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <motion.a
                  href={`mailto:${profile.email}`}
                  data-unit="cta:email"
                  className={`inline-flex min-h-14 max-w-full cursor-pointer items-center gap-3 rounded-full bg-sun px-6 text-base font-semibold text-pastel-ink transition-transform duration-200 hover:-translate-y-0.5 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:min-h-16 sm:px-8 sm:text-xl ${PILL_FOCUS}`}
                  whileHover={reduce ? undefined : HOVER_SCALE}
                  whileTap={reduce ? undefined : TAP_SCALE}
                  transition={SPRING}
                >
                  <span className="min-w-0 break-all">{profile.email}</span>
                  <ArrowUpRight />
                </motion.a>
                <OutPill href={profile.github} unit="cta:github" tone="bg-sky" label="GitHub" sr="opens in a new tab" />
                <OutPill href={profile.linkedin} unit="cta:linkedin" tone="bg-rose" label="LinkedIn" sr="opens in a new tab" />
              </div>

              <ul className="mt-10 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] sm:text-xs sm:tracking-[0.12em]">
                <li className="inline-flex items-center gap-2 rounded-full bg-mint px-3 py-2 text-pastel-ink sm:px-3.5">
                  <span aria-hidden className="h-2 w-2 rounded-full bg-pastel-ink" />
                  Available
                </li>
                <li className="rounded-full border border-fg/45 px-3 py-2 sm:px-3.5">Remote</li>
                <li className="rounded-full border border-fg/45 px-3 py-2 sm:px-3.5">UTC+7</li>
              </ul>
            </div>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}

function AboutBlock({ index }: { index: string }) {
  return (
    <>
      <Reveal>
        <span className="eyebrow">{`// ${index} · About`}</span>
        <h2 className="t-h3 mt-4 max-w-3xl text-fg">
          A freelance engineer who treats agents as a team.
        </h2>
      </Reveal>

      <Reveal>
        <p className="t-lead mt-7 max-w-3xl text-balance text-dim">
          Rafii Manggala Japamel is a freelance AI engineer based in Indonesia
          (UTC+7) who builds autonomous systems with Claude Code: trading bots,
          digital twins, and self-running infrastructure that observe, decide,
          and act in production. He runs Claude not as a chatbot but as an
          always-on agent OS, and ships for clients in Australia and the United
          States.
        </p>
        <p className="t-body mt-5 max-w-3xl text-pretty text-dim/90">
          {profile.thesis}
        </p>
      </Reveal>

      <Reveal delay={0.1}>
        <h3 className="eyebrow mb-3 mt-12">Stack I ship with</h3>
        <div data-unit="stack">
          <Marquee items={techStack} />
        </div>
      </Reveal>
    </>
  );
}

function FullHeading() {
  return (
    <>
      <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface-2/60 px-3 py-1">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
        </span>
        <span className="eyebrow">Available · Remote · UTC+7</span>
      </div>

      <h2 className="t-h2 max-w-3xl text-fg">
        Let&apos;s build something that{" "}
        <span className="text-accent">runs without you.</span>
      </h2>
      <p className="t-lead mt-5 max-w-xl text-dim">
        Open to remote AI engineering roles and freelance builds: autonomous
        systems, agent orchestration, and full-stack products.
      </p>
    </>
  );
}

const CARD_CLASS =
  "group card cursor-pointer p-6 transition-all duration-200 hover:border-line-strong hover:bg-surface-2";
const CARD_LINK_CLASS =
  "mono mt-4 text-[10px] text-mute group-hover:text-accent group-hover:underline";

function ContactCards() {
  return (
    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <a href={`mailto:${profile.email}`} data-unit="cta:email" className={CARD_CLASS}>
        <p className="mono text-[10px] text-mute">email</p>
        <p className="mt-2 text-sm font-medium text-fg">Say hello</p>
        <p className="mt-1 text-xs leading-relaxed text-dim">
          Direct line, straight to my inbox.
        </p>
        <p className={CARD_LINK_CLASS}>{profile.email} ↗</p>
      </a>

      <a
        href={profile.github}
        target="_blank"
        rel="noreferrer"
        data-unit="cta:github"
        className={CARD_CLASS}
      >
        <p className="mono text-[10px] text-mute">github</p>
        <p className="mt-2 text-sm font-medium text-fg">See the code</p>
        <p className="mt-1 text-xs leading-relaxed text-dim">
          40+ repos, agents included.
        </p>
        <p className={CARD_LINK_CLASS}>github.com/rafiimanggala ↗</p>
      </a>

      <a
        href={profile.linkedin}
        target="_blank"
        rel="noreferrer"
        data-unit="cta:linkedin"
        className={CARD_CLASS}
      >
        <p className="mono text-[10px] text-mute">linkedin</p>
        <p className="mt-2 text-sm font-medium text-fg">Connect</p>
        <p className="mt-1 text-xs leading-relaxed text-dim">
          Work history, endorsements, full experience.
        </p>
        <p className={CARD_LINK_CLASS}>in/rafiimanggala ↗</p>
      </a>
    </div>
  );
}

function FullContact({
  index,
  hideHeading,
}: {
  index: string;
  hideHeading: boolean;
}) {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-line">
      <div className="grid-backdrop absolute inset-0 -z-10 opacity-70" />
      <div className="mx-auto w-full max-w-[1120px] px-6 py-24 sm:py-28 lg:px-8">
        <AboutBlock index={index} />

        <div className="mt-20 border-t border-line pt-16">
          <Reveal>
            {hideHeading ? (
              <span className="eyebrow">{`// ${index} · Contact`}</span>
            ) : (
              <FullHeading />
            )}
            <ContactCards />
          </Reveal>
        </div>

        <div className="mono mt-20 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-xs text-mute sm:flex-row sm:items-center">
          <span>
            {profile.name} · {profile.role}
          </span>
          <span>{profile.location}</span>
          <span>Built with Next.js · the agents helped.</span>
        </div>
      </div>
    </footer>
  );
}

// `hideHeading` only applies to the full block. The lean orange panel always
// shows its heading: the heading is the point of the panel.
export default function Contact({
  index = "09",
  lean = false,
  hideHeading = false,
}: {
  index?: string;
  lean?: boolean;
  hideHeading?: boolean;
}) {
  if (lean) return <LeanContact />;
  return <FullContact index={index} hideHeading={hideHeading} />;
}
