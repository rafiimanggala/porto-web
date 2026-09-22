import { profile } from "@/data/portfolio";
import { stagger } from "./stagger";
import s from "./home.module.css";

const BUTTON =
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-7 text-base font-semibold transition-colors";

// One sentence sourced from profile.thesis's own wording (near-verbatim,
// not a new claim): what "I deploy it as the engine" actually means.
const SUPPORTING_LINE =
  "Most people use Claude Code to write functions; I deploy it as the engine: always-on agents that observe, decide, and act in production.";

function EnvelopeIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="3" />
      <path d="m4 8 8 6 8-6" />
    </svg>
  );
}

// Tiny top-left block: name, role and two highlighter chips joined by an ampersand.
function Tagline() {
  return (
    <div className={`${s.rise} max-w-[15rem] sm:max-w-none`} style={stagger(0)}>
      <p className="text-sm font-semibold text-accent">Rafii Manggala, AI engineer</p>
      <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm font-semibold text-fg">
        <span className="rounded-md bg-sun px-2 py-0.5 text-pastel-ink">Web apps</span>
        <span>&amp;</span>
        <span className="rounded-md bg-sky px-2 py-0.5 text-pastel-ink">AI features</span>
      </p>
      <p className="mt-2 text-xs text-dim">Freelance, remote, UTC+7</p>
    </div>
  );
}

export default function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="home-h"
      className="relative flex flex-col gap-10 px-4 pt-16 pb-16 sm:px-8 sm:pt-24 sm:pb-24"
    >
      <Tagline />

      <div className="flex flex-col items-start gap-6">
        <h1
          id="home-h"
          className={`${s.rise} font-display max-w-[16ch] text-balance text-[clamp(3rem,10vw,7rem)] leading-[0.95] font-normal tracking-[-0.01em] text-accent`}
          style={stagger(1)}
        >
          {profile.tagline}
        </h1>
        <p
          className={`${s.rise} max-w-[46ch] text-base leading-relaxed text-dim sm:text-lg`}
          style={stagger(2)}
        >
          {SUPPORTING_LINE}
        </p>
        <div className={`${s.rise} flex flex-wrap gap-3`} style={stagger(3)}>
          <a
            href="#work"
            data-unit="cta:work"
            className={`${BUTTON} bg-accent text-white hover:bg-[#8f3a0c]`}
          >
            See what I build
          </a>
          <a
            href="#contact"
            data-unit="cta:contact"
            className={`${BUTTON} border-2 border-accent text-fg hover:bg-surface-2`}
          >
            Get in touch
          </a>
        </div>
      </div>

      <a
        href={`mailto:${profile.email}`}
        aria-label="Email Rafii"
        className={`${s.rise} absolute top-5 right-4 grid size-14 place-items-center rounded-full bg-sky text-pastel-ink transition-transform hover:-translate-y-0.5 sm:right-8 min-[1280px]:top-[34%]`}
        style={stagger(4)}
      >
        <EnvelopeIcon />
      </a>
    </section>
  );
}
