import { profile, stats } from "@/data/portfolio";
import Reveal from "./ui/Reveal";
import Scramble from "./ui/Scramble";
import Magnetic from "./ui/Magnetic";
import CountUp from "./ui/CountUp";
import CommandCenter from "./CommandCenter";
import LineMask from "./ui/LineMask";

export default function Hero() {
  return (
    <div id="top" className="relative overflow-hidden">
      {/* depth layers */}
      <div className="grid-backdrop absolute inset-0 -z-10" />
      <div
        className="glow-blob -left-24 -top-24 h-[28rem] w-[28rem]"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
      />
      <div
        className="glow-blob right-0 top-10 h-[22rem] w-[22rem] opacity-[0.12]"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
      />

      <div className="mx-auto grid w-full max-w-[1120px] gap-14 px-6 pb-16 pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 lg:pt-28">
        {/* copy */}
        <div>
          <Reveal>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface-2/60 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              <Scramble
                text={`${profile.available ? "Available for remote work" : "Currently engaged"}  ·  ${profile.location}`}
                className="mono text-xs text-dim"
              />
            </div>
          </Reveal>

          <h1 className="t-hero">
            <LineMask
              lines={[
                { text: "I build systems where", className: "text-grad" },
                { text: "AI agents do the work,", className: "text-accent" },
                { text: "not just write the code.", className: "text-grad" },
              ]}
            />
          </h1>

          <Reveal delay={0.1}>
            <p className="t-lead mt-7 max-w-xl text-dim">
              {profile.role}. I deploy Claude Code as the engine: always-on
              agents that observe, decide, and act in production: trading bots,
              digital twins, and autonomous infra.
            </p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href="#work"
                  data-unit="cta:work"
                  className="block cursor-pointer rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-bg transition-colors"
                >
                  View selected work
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  data-unit="cta:github"
                  className="mono block cursor-pointer rounded-full border border-line px-5 py-2.5 text-sm text-fg transition-colors hover:border-line-strong"
                >
                  GitHub ↗
                </a>
              </Magnetic>
              <a
                href={`mailto:${profile.email}`}
                data-unit="cta:email"
                className="mono cursor-pointer px-2 py-2.5 text-sm text-dim underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                {profile.email}
              </a>
            </div>
          </Reveal>
        </div>

        {/* live command center */}
        <Reveal delay={0.2}>
          <CommandCenter />
        </Reveal>
      </div>

      {/* stat strip */}
      <Reveal delay={0.1}>
        <div className="mx-auto w-full max-w-[1120px] px-6 pb-8 lg:px-8">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-6">
            {stats.map((s) => (
              <div key={s.label} className="bg-surface-1 px-4 py-5">
                <dt className="t-h3 nums text-fg">
                  <CountUp value={s.value} />
                </dt>
                <dd className="mt-1 text-xs text-dim">{s.label}</dd>
                {s.note && (
                  <dd className="mono mt-0.5 text-[10px] text-mute">{s.note}</dd>
                )}
              </div>
            ))}
          </dl>
        </div>
      </Reveal>
    </div>
  );
}
