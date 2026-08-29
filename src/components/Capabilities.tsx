import { capabilities } from "@/data/portfolio";
import Section from "./ui/Section";
import Reveal from "./ui/Reveal";

// Four line-icons (plus / circle / rounded-square / check), one per capability
// concept (build / review / lock-in / ship), same shapes as the reference clone.
const ICON_PATHS = [
  <path key="plus" d="M4 12h16M12 4v16" />,
  <circle key="circle" cx="12" cy="12" r="8" />,
  <rect key="rect" x="4" y="4" width="16" height="16" rx="3" />,
  <path key="check" d="M4 12l6 6L20 6" />,
];

export default function Capabilities({ limit }: { limit?: number } = {}) {
  const items = limit ? capabilities.slice(0, limit) : capabilities;
  return (
    <Section
      id="capabilities"
      index="02"
      label="Capabilities"
      title="What running these agents actually takes"
    >
      <div className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-2">
        {items.map((c, i) => (
          <Reveal key={c.title} delay={(i % 4) * 0.05} className="h-full">
            <div className="flex h-full flex-col bg-surface-1 p-6 transition-colors duration-200 hover:bg-surface-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-2">
                <svg
                  aria-hidden
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                >
                  {ICON_PATHS[i % ICON_PATHS.length]}
                </svg>
              </div>
              <h3 className="mt-3 font-[family-name:var(--font-display)] text-base font-semibold tracking-tight text-fg">
                {c.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-dim">{c.desc}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
