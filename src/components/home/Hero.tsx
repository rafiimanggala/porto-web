import { profile } from "@/data/portfolio";
import Wordmark from "./Wordmark";
import { stagger } from "./stagger";
import s from "./home.module.css";

const BUTTON =
  "inline-flex min-h-12 cursor-pointer items-center justify-center rounded-full px-7 text-base font-semibold transition-colors";

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
        <span className="rounded-md bg-sun px-2 py-0.5">Web apps</span>
        <span>&amp;</span>
        <span className="rounded-md bg-sky px-2 py-0.5">AI features</span>
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
      className={`${s.wash} relative flex min-h-[100svh] flex-col px-4 pt-6 pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] sm:px-8 sm:pt-8`}
    >
      <Tagline />

      <div className="my-auto flex flex-col items-center py-10 text-center">
        <Wordmark style={stagger(1)} />
        <p
          className={`${s.rise} mt-10 max-w-[34ch] text-balance text-lg text-fg sm:text-xl`}
          style={stagger(2)}
        >
          {profile.tagline}
        </p>
        <div className={`${s.rise} mt-8 flex flex-wrap justify-center gap-3`} style={stagger(3)}>
          <a
            href="#directory"
            data-unit="cta:work"
            className={`${BUTTON} bg-accent text-white hover:bg-[#3f7a1e]`}
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
        className={`${s.rise} absolute top-5 right-4 grid size-14 place-items-center rounded-full bg-sky text-fg transition-transform hover:-translate-y-0.5 sm:right-8 min-[1280px]:top-[34%]`}
        style={stagger(4)}
      >
        <EnvelopeIcon />
      </a>
    </section>
  );
}
