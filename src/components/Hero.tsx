import { profile, stats } from "@/data/portfolio";
import Reveal from "./ui/Reveal";
import Scramble from "./ui/Scramble";
import Magnetic from "./ui/Magnetic";
import CountUp from "./ui/CountUp";

const term = [
  { p: "amadeus status", o: "● pulse daemon · uptime 14d · next wake in 2h" },
  { p: "trading consensus --pair BTC", o: "claude: HOLD  groq: BUY  → HOLD · capital safe" },
  { p: "inbox react", o: "client mail · warmed repo · fix on branch · reply drafted" },
];

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
        className="glow-blob right-0 top-10 h-[22rem] w-[22rem] opacity-15"
        style={{ background: "radial-gradient(circle, #6e8bff, transparent 70%)" }}
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

          <Reveal delay={0.05}>
            <h1 className="t-hero">
              <span className="text-grad">I build systems where </span>
              <span className="text-accent">AI agents do the work</span>
              <span className="text-grad">, not just write the code.</span>
            </h1>
          </Reveal>

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
                  className="mono block cursor-pointer rounded-full border border-line px-5 py-2.5 text-sm text-fg transition-colors hover:border-line-strong"
                >
                  GitHub ↗
                </a>
              </Magnetic>
              <a
                href={`mailto:${profile.email}`}
                className="mono cursor-pointer px-2 py-2.5 text-sm text-dim underline-offset-4 transition-colors hover:text-fg hover:underline"
              >
                {profile.email}
              </a>
            </div>
          </Reveal>
        </div>

        {/* terminal */}
        <Reveal delay={0.2}>
          <div className="card overflow-hidden p-0">
            <div className="flex items-center gap-2 border-b border-line bg-surface-1 px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="mono ml-3 text-xs text-mute">
                rafii@command-center
              </span>
            </div>
            <div className="mono space-y-4 p-5 text-[13px] leading-relaxed">
              {term.map((t) => (
                <div key={t.p}>
                  <div className="text-fg">
                    <span className="text-accent">~ $</span> {t.p}
                  </div>
                  <div className="mt-1 pl-5 text-dim">{t.o}</div>
                </div>
              ))}
              <div className="text-fg">
                <span className="text-accent">~ $</span>{" "}
                <span className="inline-block h-4 w-2 translate-y-0.5 animate-pulse bg-accent" />
              </div>
            </div>
          </div>
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
