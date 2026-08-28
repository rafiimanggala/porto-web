import { profile } from "@/data/portfolio";
import Reveal from "./ui/Reveal";
import Scramble from "./ui/Scramble";
import Magnetic from "./ui/Magnetic";
import CountUp from "./ui/CountUp";
import LineMask from "./ui/LineMask";

const stats = [
  { label: "AI-generated assets", value: "600+", note: "video + image" },
  { label: "Client accounts", value: "14", note: "freelance" },
  { label: "Delivery", value: "0", note: "manual uploads" },
];

export default function VideoHero() {
  return (
    <div id="top" className="relative overflow-hidden">
      <div className="grid-backdrop absolute inset-0 -z-10" />

      <div className="mx-auto w-full max-w-[1120px] px-6 pb-16 pt-20 lg:px-8 lg:pt-28">
        <Reveal>
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-surface-2/60 px-3 py-1.5">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            <Scramble
              text={`AI video automation  ·  ${profile.location}`}
              className="mono text-xs text-dim"
            />
          </div>
        </Reveal>

        <h1 className="t-hero max-w-3xl">
          <LineMask
            lines={[
              { text: "AI does the editing,", className: "text-grad" },
              { text: "the pipeline does the rest.", className: "text-accent" },
            ]}
          />
        </h1>

        <Reveal delay={0.1}>
          <p className="t-lead mt-7 max-w-xl text-dim">
            A freelance line of work built on n8n and video-gen models: scripted,
            rendered and cross-posted without a manual upload per client.
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
                See the output
              </a>
            </Magnetic>
            <Magnetic>
              <a
                href="/dev"
                data-unit="cta:dev"
                className="mono block cursor-pointer rounded-full border border-line px-5 py-2.5 text-sm text-fg transition-colors hover:border-line-strong"
              >
                Fullstack work ↗
              </a>
            </Magnetic>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <dl className="mt-14 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line">
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
        </Reveal>
      </div>
    </div>
  );
}
