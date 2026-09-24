"use client";

import { useCallback, useLayoutEffect, useRef, type ReactNode } from "react";
import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { Backdrop, MONO, useSeg, useWindow, type MV } from "./HealthSceneParts";
import type { SceneCaption } from "./ScrollScene";

/* The ScrollScene skeleton with two differences the plan scene needs:
   1. Captions swap in sequence. The outgoing caption is fully out before the
      incoming one starts, so no frame ever prints two captions on top of each
      other (ScrollScene crossfades them, which is 40 / 40 at every boundary).
   2. Each chapter tick jumps to its own target, just past the page wipe and the
      caption fade, instead of the chapter start, which sits mid-wipe. */

type Props = {
  captions: readonly SceneCaption[];
  /** Chapter boundaries, length captions.length + 1, from 0 to 1. */
  chapters: readonly number[];
  /** Scroll target of each tick, length captions.length. */
  jumps: readonly number[];
  render: (p: MV) => ReactNode;
  readout?: (p: MV) => ReactNode;
  heightClass?: string;
  stillAt?: number;
};

/* Half the blank gap around a boundary. The fade itself is 0.025 wide. */
const SWAP_GAP = 0.006;

type Win = { p: MV; a: number; b: number; first: boolean; last: boolean };

function ChapterTick({ p, a, b, jump, label, onGo }: { p: MV; a: number; b: number; jump: number; label: string; onGo: (f: number) => void }) {
  const fill = useSeg(p, a, b);
  return (
    <button
      type="button"
      aria-label={`Jump to ${label}`}
      onClick={() => onGo(jump)}
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
  const opacity = useWindow(win.p, win.a, win.b, { first: win.first, last: win.last });
  return (
    <motion.span style={{ opacity }} className="absolute left-0 top-0 text-fg">
      {text}
    </motion.span>
  );
}

function CaptionView({ cap, win }: { cap: SceneCaption; win: Win }) {
  const opacity = useWindow(win.p, win.a, win.b, { first: win.first, last: win.last });
  const y = useTransform(opacity, (v) => (1 - v) * 18);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      <h2 className="t-h3 max-w-[26ch] text-[1.1rem] leading-snug sm:text-[1.6rem]">{cap.title}</h2>
      <p className="mt-2 max-w-[44ch] text-[13px] leading-relaxed text-dim sm:mt-3 sm:text-sm">{cap.body}</p>
    </motion.div>
  );
}

/* framer-motion warns in dev when the window scroll container (<html>) is
   position: static. Making it relative while the scene is mounted silences it. It
   must run before useScroll's own layout effect takes its first measurement. */
function useRelativeRoot() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const needed = process.env.NODE_ENV !== "production" && getComputedStyle(root).position === "static";
    if (needed) root.style.position = "relative";
    return () => {
      if (needed) root.style.position = "";
    };
  }, []);
}

type Common = Pick<Props, "captions" | "chapters" | "jumps"> & { p: MV };

function Header({ captions, chapters, jumps, p, readout, win, onGo }: Common & Pick<Props, "readout"> & { win: (i: number) => Win; onGo: (f: number) => void }) {
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
          <ChapterTick key={c.eyebrow} p={p} a={chapters[i]} b={chapters[i + 1]} jump={jumps[i]} label={c.eyebrow} onGo={onGo} />
        ))}
      </div>
    </div>
  );
}

function Plus({ pos }: { pos: string }) {
  return (
    <span aria-hidden className={`${MONO} absolute ${pos} text-xs text-mute`}>
      +
    </span>
  );
}

function VisualSlot({ p, render }: { p: MV; render: Props["render"] }) {
  return (
    <div className="relative min-h-0 sm:col-start-2 sm:row-start-1">
      <Backdrop p={p} />
      <Plus pos="left-0 top-0" />
      <Plus pos="right-0 top-0" />
      <Plus pos="bottom-0 left-0" />
      <Plus pos="bottom-0 right-0" />
      <div aria-hidden className="absolute inset-0">
        {render(p)}
      </div>
    </div>
  );
}

function CaptionColumn({ captions, win }: Pick<Props, "captions"> & { win: (i: number) => Win }) {
  return (
    <div className="relative h-[136px] sm:col-start-1 sm:row-start-1 sm:h-auto sm:self-center">
      <div className="relative h-[136px] sm:h-[240px]">
        {captions.map((cap, i) => (
          <CaptionView key={cap.eyebrow} cap={cap} win={win(i)} />
        ))}
      </div>
    </div>
  );
}

/* Reduced motion: the stacked captions next to one still frame of the visual. */
function StillLayout({ captions, render, still }: Pick<Props, "captions" | "render"> & { still: MV }) {
  return (
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
  );
}

export default function PlanSceneShell({ captions, chapters, jumps, render, readout, heightClass = "h-[300svh] sm:h-[340svh]", stillAt = 1 }: Props) {
  useRelativeRoot();
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
    a: i === 0 ? 0 : chapters[i] + SWAP_GAP,
    b: i === last ? 1 : chapters[i + 1] - SWAP_GAP,
    first: i === 0,
    last: i === last,
  });
  const still = useMotionValue(stillAt);

  return (
    <>
      <div ref={track} className={`relative motion-reduce:hidden ${heightClass}`}>
        <div className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-hidden">
          <Header captions={captions} chapters={chapters} jumps={jumps} p={p} readout={readout} win={win} onGo={goTo} />
          <div className="mx-auto grid h-full max-w-[1180px] grid-rows-[minmax(0,1fr)_auto] gap-3 px-4 pb-4 pt-[52px] sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] sm:grid-rows-1 sm:gap-10 sm:px-8 sm:pb-8 sm:pt-16">
            <VisualSlot p={p} render={render} />
            <CaptionColumn captions={captions} win={win} />
          </div>
        </div>
      </div>
      <StillLayout captions={captions} render={render} still={still} />
    </>
  );
}
