import { profile, techStack } from "@/data/portfolio";
import Reveal from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";
import Marquee from "./ui/Marquee";

export default function Contact() {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-line">
      <div className="grid-backdrop absolute inset-0 -z-10 opacity-70" />
      <div
        className="glow-blob bottom-0 left-1/2 h-[24rem] w-[36rem] -translate-x-1/2 opacity-20"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
      />
      <div className="mx-auto w-full max-w-[1120px] px-6 py-24 sm:py-28 lg:px-8">
        {/* About */}
        <Reveal>
          <span className="eyebrow">{"// 05 · About"}</span>
          <h2 className="t-h3 mt-4 max-w-3xl text-fg">
            A freelance engineer who treats agents as a team.
          </h2>
        </Reveal>

        <Reveal>
          <p className="t-lead mt-7 max-w-3xl text-balance text-dim">
            {profile.thesis}
          </p>
          <p className="t-body mt-5 max-w-3xl text-pretty text-dim/90">
            I ship across stacks and domains, from clinical health scoring to
            high-frequency paper trading. What I review and own is the
            architecture: the boundaries, the failure handling, the
            verification. The agents handle volume; I own the judgment.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h3 className="eyebrow mb-3 mt-12">Stack I ship with</h3>
          <div data-unit="stack">
            <Marquee items={techStack} />
          </div>
        </Reveal>

        {/* Contact CTA */}
        <div className="mt-20 border-t border-line pt-16">
          <Reveal>
            {/* availability badge */}
            <div className="mb-8 flex w-fit items-center gap-2 rounded-full border border-[#34d399]/30 bg-[#34d399]/5 px-3 py-1.5">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34d399]" />
              </span>
              <span className="mono text-[11px] text-[#34d399]">
                Available · Remote · UTC+7
              </span>
            </div>

            <h2 className="t-h2 max-w-3xl text-fg">
              Let&apos;s build something that{" "}
              <span className="text-accent">runs without you.</span>
            </h2>
            <p className="t-lead mt-5 max-w-xl text-dim">
              Open to remote AI engineering roles and freelance builds:
              autonomous systems, agent orchestration, and full-stack products.
            </p>

            {/* contact cards */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <a
                href={`mailto:${profile.email}`}
                data-unit="cta:email"
                className="group card cursor-pointer transition-all duration-200 hover:border-accent/40 hover:bg-surface-2"
              >
                <p className="mono text-[10px] text-mute">email</p>
                <p className="mt-2 text-sm font-medium text-fg">Say hello</p>
                <p className="mt-1 text-xs text-dim leading-relaxed">
                  Direct line. Usually replies within 24h.
                </p>
                <p className="mono mt-4 text-[10px] text-accent group-hover:underline">
                  {profile.email} ↗
                </p>
              </a>

              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                data-unit="cta:github"
                className="group card cursor-pointer transition-all duration-200 hover:border-accent/40 hover:bg-surface-2"
              >
                <p className="mono text-[10px] text-mute">github</p>
                <p className="mt-2 text-sm font-medium text-fg">See the code</p>
                <p className="mt-1 text-xs text-dim leading-relaxed">
                  45+ repos, 3K commits, agents included.
                </p>
                <p className="mono mt-4 text-[10px] text-accent group-hover:underline">
                  github.com/rafiimanggala ↗
                </p>
              </a>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                data-unit="cta:linkedin"
                className="group card cursor-pointer transition-all duration-200 hover:border-accent/40 hover:bg-surface-2"
              >
                <p className="mono text-[10px] text-mute">linkedin</p>
                <p className="mt-2 text-sm font-medium text-fg">Connect</p>
                <p className="mt-1 text-xs text-dim leading-relaxed">
                  Work history, endorsements, full experience.
                </p>
                <p className="mono mt-4 text-[10px] text-accent group-hover:underline">
                  in/rafiimanggala ↗
                </p>
              </a>
            </div>

            <p className="mono mt-6 text-[11px] text-mute">
              ↺ Usually replies within 24h · Indonesia · WIB
            </p>
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
