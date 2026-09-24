"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Backdrop, MONO, useSeg, type MV } from "./HealthSceneParts";
import type { SceneCaption } from "./ScrollScene";

/* Same skeleton as ScrollScene (pinned track, sticky stage, chapter header, spring-smoothed
   progress) with one change: the caption and eyebrow swap is sequenced instead of overlapped.
   The outgoing text is fully gone before the incoming text starts, and the incoming text is
   whole exactly at the chapter marker, so a tick jump never lands on a blank caption. */

type Props = {
  captions: readonly SceneCaption[];
  /** Chapter boundaries, length captions.length + 1, from 0 to 1. */
  chapters: readonly number[];
  render: (p: MV) => ReactNode;
  readout?: (p: MV) => ReactNode;
  heightClass?: string;
  stillAt?: number;
};

const FADE = 0.014;
const GAP = 0.004;
const RISE = 18;
const LIFT = -12;

type Swap = { p: MV; start: number | null; end: number | null };

/* Opacity and y for one caption: in over [start - FADE, start], out over the FADE before end - GAP. */
function useSwap({ p, start, end }: Swap) {
  const outB = end === null ? 0 : end - FADE - GAP;
  const outA = outB - FADE;
  const inA = start === null ? 0 : start - FADE;
  const xs: number[] = [];
  const op: number[] = [];
  const dy: number[] = [];
  if (start !== null) {
    xs.push(inA, inA + FADE);
    op.push(0, 1);
    dy.push(RISE, 0);
  }
  if (end !== null) {
    xs.push(outA, outB);
    op.push(1, 0);
    dy.push(0, LIFT);
  }
  const opacity = useTransform(p, xs.length ? xs : [0, 1], xs.length ? op : [1, 1]);
  const y = useTransform(p, xs.length ? xs : [0, 1], xs.length ? dy : [0, 0]);
  return { opacity, y };
}

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

function Eyebrow({ text, swap }: { text: string; swap: Swap }) {
  const { opacity } = useSwap(swap);
  return (
    <motion.span style={{ opacity }} className="absolute left-0 top-0 text-fg">
      {text}
    </motion.span>
  );
}

function CaptionView({ cap, swap }: { cap: SceneCaption; swap: Swap }) {
  const { opacity, y } = useSwap(swap);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      <h2 className="t-h3 max-w-[26ch] text-[1.1rem] leading-snug sm:text-[1.6rem]">{cap.title}</h2>
      <p className="mt-2 max-w-[44ch] text-[13px] leading-relaxed text-dim sm:mt-3 sm:text-sm">{cap.body}</p>
    </motion.div>
  );
}

function StillCaptions({ captions }: { captions: readonly SceneCaption[] }) {
  return (
    <div>
      {captions.map((cap) => (
        <div key={cap.eyebrow} className="mb-8">
          <p className={`${MONO} text-[11px] uppercase tracking-[0.14em] text-mute`}>{cap.eyebrow}</p>
          <h2 className="t-h3 mt-2 max-w-[26ch] text-[1.4rem] leading-snug">{cap.title}</h2>
          <p className="mt-2 max-w-[44ch] text-sm leading-relaxed text-dim">{cap.body}</p>
        </div>
      ))}
    </div>
  );
}

type Chrome = Pick<Props, "captions" | "chapters"> & { p: MV; swap: (i: number) => Swap };

function ChapterHeader({ captions, chapters, p, swap, readout, onGo }: Chrome & { readout?: Props["readout"]; onGo: (f: number) => void }) {
  return (
    <div className="absolute inset-x-0 top-0 z-10 border-b border-line bg-bg/60 backdrop-blur-sm">
      <div className="mx-auto flex h-9 max-w-[1180px] items-center justify-between px-4 sm:px-8">
        <div className={`relative h-4 w-44 ${MONO} text-[11px] uppercase tracking-[0.14em]`}>
          {captions.map((c, i) => (
            <Eyebrow key={c.eyebrow} text={c.eyebrow} swap={swap(i)} />
          ))}
        </div>
        <span className={`${MONO} text-[10px] tabular-nums text-mute`}>{readout?.(p)}</span>
      </div>
      <div className="mx-auto flex max-w-[1180px] gap-1.5 px-4 sm:px-8">
        {captions.map((c, i) => (
          <ChapterTick key={c.eyebrow} p={p} a={chapters[i]} b={chapters[i + 1]} label={c.eyebrow} onGo={onGo} />
        ))}
      </div>
    </div>
  );
}

function StageBox({ p, children }: { p: MV; children: ReactNode }) {
  return (
    <div className="relative min-h-0 sm:col-start-2 sm:row-start-1">
      <Backdrop p={p} />
      <span aria-hidden className={`${MONO} absolute left-0 top-0 text-xs text-mute`}>+</span>
      <span aria-hidden className={`${MONO} absolute right-0 top-0 text-xs text-mute`}>+</span>
      <span aria-hidden className={`${MONO} absolute bottom-0 left-0 text-xs text-mute`}>+</span>
      <span aria-hidden className={`${MONO} absolute bottom-0 right-0 text-xs text-mute`}>+</span>
      <div aria-hidden className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}

function scrollToFraction(el: HTMLDivElement | null, f: number) {
  if (!el) return;
  const top = el.getBoundingClientRect().top + window.scrollY - 56;
  const range = el.offsetHeight - (window.innerHeight - 56);
  window.scrollTo({ top: top + f * range + (f > 0 ? 2 : 0), behavior: "smooth" });
}

export default function DexaSceneShell({
  captions,
  chapters,
  render,
  readout,
  heightClass = "h-[300svh] sm:h-[340svh]",
  stillAt = 0.97,
}: Props) {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress: raw } = useScroll({ target: track, offset: ["start 56px", "end end"] });
  const p = useSpring(raw, { stiffness: 110, damping: 26, mass: 0.4, restDelta: 0.0001 });
  const goTo = (f: number) => scrollToFraction(track.current, f);

  const last = captions.length - 1;
  const swap = (i: number): Swap => ({
    p,
    start: i === 0 ? null : chapters[i],
    end: i === last ? null : chapters[i + 1],
  });

  const still = useMotionValue(stillAt);

  return (
    <>
      <div ref={track} className={`relative motion-reduce:hidden ${heightClass}`}>
        <div className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-hidden">
          <ChapterHeader captions={captions} chapters={chapters} p={p} swap={swap} readout={readout} onGo={goTo} />
          <div className="mx-auto grid h-full max-w-[1180px] grid-rows-[minmax(0,1fr)_auto] gap-3 px-4 pb-4 pt-[52px] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:grid-rows-1 sm:gap-10 sm:px-8 sm:pb-8 sm:pt-16">
            <StageBox p={p}>{render(p)}</StageBox>
            <div className="relative h-[136px] sm:col-start-1 sm:row-start-1 sm:h-auto sm:self-center">
              <div className="relative h-[136px] sm:h-[240px]">
                {captions.map((cap, i) => (
                  <CaptionView key={cap.eyebrow} cap={cap} swap={swap(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto hidden w-full max-w-[1180px] gap-8 px-4 py-14 motion-reduce:grid sm:grid-cols-2 sm:px-8">
        <StillCaptions captions={captions} />
        <div aria-hidden className="relative h-[460px] overflow-hidden rounded-2xl border border-line">
          {render(still)}
        </div>
      </div>
    </>
  );
}
