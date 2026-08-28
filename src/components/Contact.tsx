import { profile, techStack } from "@/data/portfolio";
import Reveal from "./ui/Reveal";
import Marquee from "./ui/Marquee";

// Shared footer. `lean` is what the switchboard homepage uses: the bio, the tech
// marquee and the second availability badge are dropped there because the
// homepage already states availability once and says nothing twice.
export default function Contact({
  index = "09",
  lean = false,
}: {
  index?: string;
  lean?: boolean;
}) {
  return (
    <footer id="contact" className="relative overflow-hidden border-t border-line">
      <div className="grid-backdrop absolute inset-0 -z-10 opacity-70" />
      <div className="mx-auto w-full max-w-[1120px] px-6 py-24 sm:py-28 lg:px-8">
        {!lean ? (
          <>
            {/* About */}
            <Reveal>
              <span className="eyebrow">{`// ${index} · About`}</span>
              <h2 className="t-h3 mt-4 max-w-3xl text-fg">
                A freelance engineer who treats agents as a team.
              </h2>
            </Reveal>

            <Reveal>
              <p className="t-lead mt-7 max-w-3xl text-balance text-dim">
                Rafii Manggala Japamel is a freelance AI engineer based in
                Indonesia (UTC+7) who builds autonomous systems with Claude
                Code: trading bots, digital twins, and self-running
                infrastructure that observe, decide, and act in production. He
                runs Claude not as a chatbot but as an always-on agent OS, and
                ships for clients in Australia and the United States.
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
        ) : null}

        <div className={lean ? "" : "mt-20 border-t border-line pt-16"}>
          <Reveal>
            {lean ? (
              <span className="eyebrow">{`// ${index} · Contact`}</span>
            ) : (
              <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-line bg-surface-2/60 px-3 py-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
                </span>
                <span className="eyebrow">Available · Remote · UTC+7</span>
              </div>
            )}

            <h2 className={`t-h2 max-w-3xl text-fg${lean ? " mt-4" : ""}`}>
              {lean ? (
                <>
                  <span>Tell me what is broken, or </span>
                  <span className="text-accent">what you want built.</span>
                </>
              ) : (
                <>
                  Let&apos;s build something that{" "}
                  <span className="text-accent">runs without you.</span>
                </>
              )}
            </h2>
            <p className={`mt-5 text-dim${lean ? " t-body max-w-[54ch]" : " t-lead max-w-xl"}`}>
              {lean
                ? "Not sure which one? Describe the problem and I will tell you if it is mine to solve. Reply within a day, Indonesia time."
                : "Open to remote AI engineering roles and freelance builds: autonomous systems, agent orchestration, and full-stack products."}
            </p>

            {/* contact cards */}
            <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <a
                href={`mailto:${profile.email}`}
                data-unit="cta:email"
                className="group card cursor-pointer p-6 transition-all duration-200 hover:border-line-strong hover:bg-surface-2"
              >
                <p className="mono text-[10px] text-mute">email</p>
                <p className="mt-2 text-sm font-medium text-fg">Say hello</p>
                <p className="mt-1 text-xs leading-relaxed text-dim">
                  Direct line, straight to my inbox.
                </p>
                <p className="mono mt-4 text-[10px] text-mute group-hover:text-accent group-hover:underline">
                  {profile.email} ↗
                </p>
              </a>

              <a
                href={profile.github}
                target="_blank"
                rel="noreferrer"
                data-unit="cta:github"
                className="group card cursor-pointer p-6 transition-all duration-200 hover:border-line-strong hover:bg-surface-2"
              >
                <p className="mono text-[10px] text-mute">github</p>
                <p className="mt-2 text-sm font-medium text-fg">See the code</p>
                <p className="mt-1 text-xs leading-relaxed text-dim">
                  40+ repos, agents included.
                </p>
                <p className="mono mt-4 text-[10px] text-mute group-hover:text-accent group-hover:underline">
                  github.com/rafiimanggala ↗
                </p>
              </a>

              <a
                href={profile.linkedin}
                target="_blank"
                rel="noreferrer"
                data-unit="cta:linkedin"
                className="group card cursor-pointer p-6 transition-all duration-200 hover:border-line-strong hover:bg-surface-2"
              >
                <p className="mono text-[10px] text-mute">linkedin</p>
                <p className="mt-2 text-sm font-medium text-fg">Connect</p>
                <p className="mt-1 text-xs leading-relaxed text-dim">
                  Work history, endorsements, full experience.
                </p>
                <p className="mono mt-4 text-[10px] text-mute group-hover:text-accent group-hover:underline">
                  in/rafiimanggala ↗
                </p>
              </a>
            </div>
          </Reveal>
        </div>

        {lean ? (
          <p className="mono mt-12 border-t border-line pt-6 text-[11px] text-mute">
            {profile.name} · Indonesia · UTC+7 ·{" "}
            <a
              href="/dev"
              className="cursor-pointer transition-colors hover:text-accent"
            >
              Engineering deep dive ↗
            </a>
          </p>
        ) : (
          <div className="mono mt-20 flex flex-col items-start justify-between gap-4 border-t border-line pt-8 text-xs text-mute sm:flex-row sm:items-center">
            <span>
              {profile.name} · {profile.role}
            </span>
            <span>{profile.location}</span>
            <span>Built with Next.js · the agents helped.</span>
          </div>
        )}
      </div>
    </footer>
  );
}
