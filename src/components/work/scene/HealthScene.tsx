"use client";

import { useCallback, useRef } from "react";
import { animate, motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { CAPTIONS, PANELS } from "./HealthSceneData";
import {
  Backdrop,
  MONO,
  PanelView,
  PayoffView,
  RegPulse,
  ScoreView,
  easeOutCubic,
  useSeg,
  useWindow,
  type MV,
} from "./HealthSceneParts";

/* Health case study: one pinned, scroll-scrubbed scene. Borrowed mechanics, all from
   live study:
   - justus-john.com: a pinned stage several screens tall, a chapter label that
     swaps in the sticky header, a progress bar, diagram parts that assemble in
     sequence.
   - deadnorth.io: colour plates that sit misregistered until you hold to
     "tune the colour in", and separate a little when the pointer moves.
   The raw scroll progress runs through a spring so wheel notches and touch
   flicks carry weight instead of stepping 1:1. Everything still settles to a
   pure function of scroll, so it is reversible. */

const CHAPTERS = [0, 0.14, 0.46, 0.76, 1] as const;

function ChapterTick({
  p,
  a,
  b,
  label,
  onGo,
}: {
  p: MV;
  a: number;
  b: number;
  label: string;
  onGo: (f: number) => void;
}) {
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

function CaptionView({ cap, opacity }: { cap: (typeof CAPTIONS)[number]; opacity: MV }) {
  const y = useTransform(opacity, (v) => (1 - v) * 18);
  return (
    <motion.div style={{ opacity, y }} className="absolute inset-x-0 top-0">
      <h2 className="t-h3 max-w-[26ch] text-[1.1rem] leading-snug sm:text-[1.6rem]">{cap.title}</h2>
      <p className="mt-2 max-w-[44ch] text-[13px] leading-relaxed text-dim sm:mt-3 sm:text-sm">{cap.body}</p>
    </motion.div>
  );
}

export default function HealthScene() {
  const track = useRef<HTMLDivElement>(null);
  const { scrollYProgress: raw } = useScroll({ target: track, offset: ["start 56px", "end end"] });
  const p = useSpring(raw, { stiffness: 110, damping: 26, mass: 0.4, restDelta: 0.0001 });

  const hold = useMotionValue(0);
  const pxRaw = useMotionValue(0);
  const pyRaw = useMotionValue(0);
  const px = useSpring(pxRaw, { stiffness: 90, damping: 18 });
  const py = useSpring(pyRaw, { stiffness: 90, damping: 18 });

  const scrollReg = useSeg(p, 0.44, 0.56, easeOutCubic);
  const reg = useTransform([hold, scrollReg], ([h, s]: number[]) => Math.max(h, s));
  const conv = useSeg(p, 0.46, 0.62);

  const holdAnim = useRef<ReturnType<typeof animate> | null>(null);
  const setHold = useCallback(
    (on: boolean) => {
      holdAnim.current?.stop();
      holdAnim.current = on
        ? animate(hold, 1, { duration: 1.2, ease: [0.19, 1, 0.22, 1] })
        : animate(hold, 0, { type: "spring", stiffness: 140, damping: 14 });
    },
    [hold],
  );

  const goTo = useCallback((f: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - 56;
    const range = el.offsetHeight - (window.innerHeight - 56);
    window.scrollTo({ top: top + f * range + (f > 0 ? 2 : 0), behavior: "smooth" });
  }, []);

  const pillOp = useTransform(p, [0.08, 0.14], [1, 0], { clamp: true });
  const pillEvents = useTransform(pillOp, (v) => (v < 0.05 ? "none" : "auto"));
  const offsetText = useTransform(reg, (r) => `plate offset ${(14 * (1 - r)).toFixed(1)}px`);

  const c0 = useWindow(p, 0, 0.15, { first: true });
  const c1 = useWindow(p, 0.14, 0.47);
  const c2 = useWindow(p, 0.46, 0.77);
  const c3 = useWindow(p, 0.76, 1, { last: true });
  const capOps = [c0, c1, c2, c3];

  return (
    <div ref={track} className="relative h-[520svh] sm:h-[560svh]">
      <div
        className="sticky top-14 h-[calc(100svh-3.5rem)] overflow-hidden"
        onPointerMove={(e) => {
          if (e.pointerType !== "mouse") return;
          pxRaw.set((e.clientX / window.innerWidth - 0.5) * 2);
          pyRaw.set((e.clientY / window.innerHeight - 0.5) * 2);
        }}
      >
        <div className="absolute inset-x-0 top-0 z-10 border-b border-line bg-bg/60 backdrop-blur-sm">
          <div className="mx-auto flex h-9 max-w-[1180px] items-center justify-between px-4 sm:px-8">
            <div className={`relative h-4 w-40 ${MONO} text-[11px] uppercase tracking-[0.14em]`}>
              {CAPTIONS.map((c, i) => (
                <motion.span key={c.eyebrow} style={{ opacity: capOps[i] }} className="absolute left-0 top-0 text-fg">
                  {c.eyebrow}
                </motion.span>
              ))}
            </div>
            <motion.span className={`${MONO} text-[10px] tabular-nums text-mute`}>{offsetText}</motion.span>
          </div>
          <div className="mx-auto flex max-w-[1180px] gap-1.5 px-4 sm:px-8">
            {CAPTIONS.map((c, i) => (
              <ChapterTick key={c.eyebrow} p={p} a={CHAPTERS[i]} b={CHAPTERS[i + 1]} label={c.eyebrow} onGo={goTo} />
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

            <div aria-hidden className="absolute inset-0 grid grid-cols-2 grid-rows-[auto_auto] content-center gap-2 px-3 pb-9 pt-3 sm:gap-3 sm:px-5 sm:pt-5">
              {PANELS.map((panel, i) => (
                <PanelView key={panel.key} panel={panel} idx={i} p={p} reg={reg} px={px} py={py} conv={conv} />
              ))}
            </div>
            <RegPulse p={p} />
            <PayoffView p={p} />
            <ScoreView p={p} />

            <motion.button
              type="button"
              style={{ opacity: pillOp, pointerEvents: pillEvents }}
              aria-label="Hold to register the four source plates"
              onPointerDown={() => setHold(true)}
              onPointerUp={() => setHold(false)}
              onPointerLeave={() => setHold(false)}
              onPointerCancel={() => setHold(false)}
              onBlur={() => setHold(false)}
              onContextMenu={(e) => e.preventDefault()}
              onKeyDown={(e) => {
                if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                  e.preventDefault();
                  setHold(true);
                }
              }}
              onKeyUp={(e) => {
                if (e.key === " " || e.key === "Enter") setHold(false);
              }}
              className={`absolute bottom-1 left-1/2 -translate-x-1/2 select-none rounded-full border border-line-strong bg-bg/80 px-4 py-2 ${MONO} text-[10px] uppercase tracking-[0.14em] text-fg [-webkit-touch-callout:none] hover:border-accent focus-visible:border-accent focus-visible:outline-none`}
            >
              Hold to register
            </motion.button>
          </div>

          <div className="relative h-[136px] sm:col-start-1 sm:row-start-1 sm:h-auto sm:self-center">
            <div className="relative h-[136px] sm:h-[240px]">
              {CAPTIONS.map((cap, i) => (
                <CaptionView key={cap.eyebrow} cap={cap} opacity={capOps[i]} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
