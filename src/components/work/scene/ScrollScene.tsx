"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Backdrop, MONO, useSeg, type MV } from "./HealthSceneParts";

/* Shared skeleton for every pinned, scroll-scrubbed feature scene: a tall track,
   a sticky stage, a chapter header with a clickable progress bar, captions that
   swap by chapter, and a visual slot that receives the spring-smoothed progress
   `p` (0 to 1). A visual must be a pure function of `p` so it is deterministic
   and reversible. Under prefers-reduced-motion the same visual is rendered once
   at its final progress next to the stacked captions. */

export type SceneCaption = { eyebrow: string; title: string; body: string };

type Props = {
  captions: readonly SceneCaption[];
  /** Chapter boundaries, length captions.length + 1, from 0 to 1. */
  chapters: readonly number[];
  /** Right-hand visual. Fills a relative box; it must work at 358x430 and 660x680. */
  render: (p: MV) => ReactNode;
  /** Optional mono readout on the right of the header, e.g. a live value. */
  readout?: (p: MV) => ReactNode;
  /** Tailwind height classes for the scroll track. */
  heightClass?: string;
  /** Progress used for the reduced-motion still frame. */
  stillAt?: number;
};

function ChapterTick({ p, a, b, label, onGo }: { p: MV; a: number; b: number; label: string; onGo: (f: number) => void }) {
  const fill = useSeg(p, a, b);
  return (
    <button
      type="button"
      aria-label={`Jump to ${label}`}
      onClick={() => onGo(a)}
      className="group relative h-3 flex-1 cursor-pointer focus-visible:outline-none"
    >
      <span className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-line-strong transition-[height] group-hover:h-[5px] group-focus-visible:h-[5px]" />
      <motion.span
        style={{ scaleX: fill }}
        className="absolute inset-x-0 bottom-0 h-[3px] origin-left rounded-full bg-accent transition-[height] group-hover:h-[5px] group-focus-visible:h-[5px]"
      />
    </button>
  );
}

type Win = { p: MV; a: number; b: number; first: boolean; last: boolean };

/** Old caption fades out over the last SWAP_HALF of its chapter, the new one fades in after it: never both at once. */
const SWAP_HALF = 0.012;

function useChapterShow({ p, a, b, first, last }: Win): MV {
  return useTransform(p, [a, a + SWAP_HALF, b - SWAP_HALF, b], [first ? 1 : 0, 1, 1, last ? 1 : 0]);
}

function Eyebrow({ text, win }: { text: string; win: Win }) {
  const opacity = useChapterShow(win);
  return (
    <motion.span style={{ opacity }} className="absolute left-0 top-0 text-fg">
      {text}
    </motion.span>
  );
}

function CaptionView({ cap, win }: { cap: SceneCaption; win: Win }) {
  const opacity = useChapterShow(win);
  const y = useTransform(opacity, (v) => (1 - v) * 18);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      <h2 className="t-h3 max-w-[26ch] text-[1.1rem] leading-snug sm:text-[1.6rem]">{cap.title}</h2>
      <p className="mt-2 max-w-[44ch] text-[13px] leading-relaxed text-dim sm:mt-3 sm:text-sm">{cap.body}</p>
    </motion.div>
  );
}

export default function ScrollScene({ captions, chapters, render, readout, heightClass = "h-[300svh] sm:h-[340svh]", stillAt = 0.97 }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress: raw } = useScroll({ target: track, offset: ["start 56px", "end end"] });
  const p = useSpring(raw, { stiffness: 110, damping: 26, mass: 0.4, restDelta: 0.0001 });

  const goTo = useCallback((f: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 56;
    const range = el.offsetHeight - (window.innerHeight - 56);
    window.scrollTo({ top: top + f * range + (f > 0 ? 2 : 0), behavior: "smooth" });
  }, []);

  const last = captions.length - 1;
  const win = (i: number): Win => ({
    p,
    a: chapters[i],
    b: chapters[i + 1],
    first: i === 0,
    last: i === last,
  });

  const still = useMotionValue(stillAt);

  return (
    <>
      <div ref={track} className={`relative motion-reduce:hidden ${heightClass}`}>
        <div className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-hidden">
          <div className="absolute inset-x-0 top-0 z-10 border-b border-line bg-bg/60 backdrop-blur-sm">
            <div className="mx-auto flex h-9 max-w-[1180px] items-center justify-between px-4 sm:px-8">
              <div className={`relative h-4 w-44 ${MONO} text-[11px] uppercase tracking-[0.14em]`}>
                {captions.map((c, i) => (
                  <Eyebrow key={c.eyebrow} text={c.eyebrow} win={win(i)} />
                ))}
              </div>
              <span className={`${MONO} text-[10px] tabular-nums text-mute`}>{readout?.(p)}</span>
            </div>
            <div className="mx-auto flex max-w-[1180px] gap-1.5 px-4 sm:px-8">
              {captions.map((c, i) => (
                <ChapterTick key={c.eyebrow} p={p} a={chapters[i]} b={chapters[i + 1]} label={c.eyebrow} onGo={goTo} />
              ))}
            </div>
          </div>

          <div className="mx-auto grid h-full max-w-[1180px] grid-rows-[minmax(0,1fr)_auto] gap-3 px-4 pb-4 pt-[52px] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:grid-rows-1 sm:gap-10 sm:px-8 sm:pb-8 sm:pt-16">
            <div className="relative min-h-0 sm:col-start-2 sm:row-start-1">
              <Backdrop p={p} />
              <span aria-hidden className={`${MONO} absolute left-0 top-0 text-xs text-mute`}>+</span>
              <span aria-hidden className={`${MONO} absolute right-0 top-0 text-xs text-mute`}>+</span>
              <span aria-hidden className={`${MONO} absolute bottom-0 left-0 text-xs text-mute`}>+</span>
              <span aria-hidden className={`${MONO} absolute bottom-0 right-0 text-xs text-mute`}>+</span>
              <div aria-hidden className="absolute inset-0">
                {render(p)}
              </div>
            </div>

            <div className="relative h-[136px] sm:col-start-1 sm:row-start-1 sm:h-auto sm:self-center">
              <div className="relative h-[136px] sm:h-[240px]">
                {captions.map((cap, i) => (
                  <CaptionView key={cap.eyebrow} cap={cap} win={win(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-[1180px] gap-8 px-4 py-14 motion-reduce:grid sm:grid-cols-2 sm:px-8">
        <div>
          {captions.map((cap) => (
            <div key={cap.eyebrow} className="mb-8">
              <p className={`${MONO} text-[11px] uppercase tracking-[0.14em] text-mute`}>{cap.eyebrow}</p>
              <h2 className="t-h3 mt-2 max-w-[26ch] text-[1.4rem] leading-snug">{cap.title}</h2>
              <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-dim">{cap.body}</p>
            </div>
          ))}
        </div>
        <div aria-hidden className="relative h-[460px] overflow-hidden rounded-2xl border border-line">
          {render(still)}
        </div>
      </div>
    </>
  );
}
