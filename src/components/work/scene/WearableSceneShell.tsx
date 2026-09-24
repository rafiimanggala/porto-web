"use client";

import { useCallback, useLayoutEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Backdrop, MONO, useSeg, type MV } from "./HealthSceneParts";
import type { SceneCaption } from "./ScrollScene";

/* Same skeleton as ScrollScene (tall track, sticky stage, chapter header, spring-smoothed `p`) with one
   difference: captions swap through complementary windows. The outgoing caption is fully gone before the
   incoming one starts to fade in, and the new one is at full opacity by the chapter boundary, so a scroll
   stop never shows two captions stacked. Still a pure function of `p`. */

type Props = {
  captions: readonly SceneCaption[];
  chapters: readonly number[];
  render: (p: MV) => ReactNode;
  readout?: (p: MV) => ReactNode;
  heightClass?: string;
  stillAt?: number;
};

const OUT_FROM = 0.028;
const OUT_TO = 0.015;
const IN_FROM = 0.011;

function useCaptionOpacity(p: MV, chapters: readonly number[], i: number, count: number): MV {
  const first = i === 0;
  const last = i === count - 1;
  const xs = [...(first ? [0] : [chapters[i] - IN_FROM, chapters[i]]), ...(last ? [1] : [chapters[i + 1] - OUT_FROM, chapters[i + 1] - OUT_TO])];
  const ys = [...(first ? [1] : [0, 1]), ...(last ? [1] : [1, 0])];
  return useTransform(p, xs, ys);
}

/* The scroll hook measures against the document root, which framer-motion wants to be non-static. */
function useNonStaticRoot() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (getComputedStyle(root).position !== "static") return;
    root.style.position = "relative";
    return () => {
      root.style.position = "";
    };
  }, []);
}

type Win = { p: MV; chapters: readonly number[]; i: number; count: number };

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

function Eyebrow({ text, win }: { text: string; win: Win }) {
  const opacity = useCaptionOpacity(win.p, win.chapters, win.i, win.count);
  return (
    <motion.span style={{ opacity }} className="absolute left-0 top-0 text-fg">
      {text}
    </motion.span>
  );
}

function CaptionView({ cap, win }: { cap: SceneCaption; win: Win }) {
  const opacity = useCaptionOpacity(win.p, win.chapters, win.i, win.count);
  const y = useTransform(opacity, (v) => (1 - v) * 18);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      <h2 className="t-h3 max-w-[26ch] text-[1.1rem] leading-snug sm:text-[1.6rem]">{cap.title}</h2>
      <p className="mt-2 max-w-[44ch] text-[13px] leading-relaxed text-dim sm:mt-3 sm:text-sm">{cap.body}</p>
    </motion.div>
  );
}

function Header({ p, captions, chapters, readout, onGo }: Pick<Props, "captions" | "chapters" | "readout"> & { p: MV; onGo: (f: number) => void }) {
  const win = (i: number): Win => ({ p, chapters, i, count: captions.length });
  return (
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
          <ChapterTick key={c.eyebrow} p={p} a={chapters[i]} b={chapters[i + 1]} label={c.eyebrow} onGo={onGo} />
        ))}
      </div>
    </div>
  );
}

function Body({ p, captions, chapters, render }: Pick<Props, "captions" | "chapters" | "render"> & { p: MV }) {
  return (
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
            <CaptionView key={cap.eyebrow} cap={cap} win={{ p, chapters, i, count: captions.length }} />
          ))}
        </div>
      </div>
    </div>
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

export default function WearableSceneShell({ captions, chapters, render, readout, heightClass = "h-[300svh] sm:h-[340svh]", stillAt = 0.97 }: Props) {
  useNonStaticRoot();
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

  const still = useMotionValue(stillAt);

  return (
    <>
      <div ref={track} className={`relative motion-reduce:hidden ${heightClass}`}>
        <div className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-hidden">
          <Header p={p} captions={captions} chapters={chapters} readout={readout} onGo={goTo} />
          <Body p={p} captions={captions} chapters={chapters} render={render} />
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
