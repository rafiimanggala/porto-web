import { profile, techStack } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

export default function About() {
  return (
    <Section
      id="about"
      index="06"
      label="About"
      title="A freelance engineer who treats agents as a team."
    >
      <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
        <Reveal>
          <p className="t-lead text-balance text-dim">{profile.thesis}</p>
          <p className="t-body mt-6 text-pretty text-dim/90">
            I ship across stacks (TypeScript, Python, .NET, Swift) and across
            domains, from clinical health scoring to high-frequency paper
            trading. What I review, change, and improve myself is the
            architecture: the boundaries, the failure handling, and the
            verification. The agents handle volume; I own the judgment.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <h3 className="eyebrow mb-4">Stack I ship with</h3>
          <div className="flex flex-wrap gap-2">
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
    </Section>
  );
}
