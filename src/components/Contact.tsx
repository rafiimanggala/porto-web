import { profile, techStack } from "@/data/portfolio";
import Reveal from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";

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

        <div className="mt-7 grid gap-10 lg:grid-cols-[1.3fr_0.7fr]">
          <Reveal>
            <p className="t-lead text-balance text-dim">{profile.thesis}</p>
            <p className="t-body mt-5 text-pretty text-dim/90">
              I ship across stacks and domains, from clinical health scoring to
              high-frequency paper trading. What I review and own is the
              architecture: the boundaries, the failure handling, the
              verification. The agents handle volume; I own the judgment.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h3 className="eyebrow mb-4">Stack I ship with</h3>
            <div data-unit="stack" className="flex flex-wrap gap-2">
              {techStack.map((t) => (
                <span
                  key={t}
                  className="mono rounded-lg border border-line bg-surface-1 px-3 py-1.5 text-xs text-dim transition-colors duration-200 hover:border-line-strong hover:text-fg"
                >
                  {t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>

        {/* Contact CTA */}
        <div className="mt-20 border-t border-line pt-16">
          <Reveal>
            <h2 className="t-h2 max-w-3xl text-fg">
              Let&apos;s build something that{" "}
              <span className="text-accent">runs without you.</span>
            </h2>
            <p className="t-lead mt-5 max-w-xl text-dim">
              Open to remote AI engineering roles and freelance builds:
              autonomous systems, agent orchestration, and full-stack products.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic>
                <a
                  href={`mailto:${profile.email}`}
                  data-unit="cta:contact"
                  className="mono block cursor-pointer rounded-full bg-accent px-6 py-3 text-sm font-medium text-bg transition-colors"
                >
                  {profile.email}
                </a>
              </Magnetic>
              <Magnetic>
                <a
                  href={profile.github}
                  target="_blank"
                  rel="noreferrer"
                  data-unit="cta:github"
                  className="mono block cursor-pointer rounded-full border border-line px-6 py-3 text-sm text-fg transition-colors hover:border-line-strong"
                >
                  GitHub ↗
                </a>
              </Magnetic>
            </div>
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
