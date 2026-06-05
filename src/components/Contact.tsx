import { profile } from "@/data/portfolio";
import Reveal from "./ui/Reveal";
import Magnetic from "./ui/Magnetic";

export default function Contact() {
  return (
    <footer
      id="contact"
      className="relative overflow-hidden border-t border-line"
    >
      <div className="grid-backdrop absolute inset-0 -z-10 opacity-70" />
      <div
        className="glow-blob bottom-0 left-1/2 h-[24rem] w-[36rem] -translate-x-1/2 opacity-20"
        style={{ background: "radial-gradient(circle, var(--color-accent), transparent 70%)" }}
      />
      <div className="mx-auto w-full max-w-[1120px] px-6 py-24 sm:py-32 lg:px-8">
        <Reveal>
          <span className="eyebrow">// 06 · Contact</span>
          <h2 className="t-h2 mt-4 max-w-3xl text-fg">
            Let&apos;s build something that{" "}
            <span className="text-accent">runs without you.</span>
          </h2>
          <p className="t-lead mt-5 max-w-xl text-dim">
            Open to remote AI engineering roles and freelance builds: autonomous
            systems, agent orchestration, and full-stack products.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Magnetic>
              <a
                href={`mailto:${profile.email}`}
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
                className="mono block cursor-pointer rounded-full border border-line px-6 py-3 text-sm text-fg transition-colors hover:border-line-strong"
              >
                GitHub ↗
              </a>
            </Magnetic>
          </div>
        </Reveal>

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
