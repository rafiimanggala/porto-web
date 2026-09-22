"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { workReel, type WorkReelItem } from "@/data/workReel";

// Header block, same language as DirectoryHead.tsx: a sun pastel label chip,
// a Titan One heading in the accent color, and a dim one-line intro.
function WorkHead() {
  return (
    <header>
      <span className="mb-6 inline-flex w-fit rounded-full bg-sun px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-pastel-ink">
        Recent work
      </span>
      <h2
        id="work-h"
        className="font-display max-w-[16ch] text-balance text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.98] font-normal tracking-[-0.01em] text-accent"
      >
        What I actually shipped.
      </h2>
      <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-dim sm:text-lg">
        Seven builds, stacked. Keep scrolling and each one covers the last.
      </p>
    </header>
  );
}

// Pastel index chip cycle, same tones the FAQ and orbit number pills use.
const PILL_TONES = ["bg-sun", "bg-sky", "bg-rose", "bg-mint"] as const;

// Flat pill under the title, same role as the small year/category tags on
// viens-la.com's actual project cards: one concrete fact, sitting in normal
// flow next to the title, not a rotated sticker floating over the photo
// (that rotated-chip look came from a different section of their site, not
// their project cards, per a frame-by-frame check of a live reference video).
function FactPill({ text, tone }: { text: string; tone: string }) {
  return (
    <span
      className={`inline-flex max-w-[26ch] rounded-full px-3.5 py-1.5 text-xs font-semibold leading-snug text-pastel-ink sm:text-sm ${tone}`}
    >
      {text}
    </span>
  );
}

// Two different reasons a card needs the padded contain treatment instead of
// the full-bleed cover photo every other card gets:
// - education-saas, health-platform: pre-cropped thin strips, not full
//   screenshots -- a full-bleed cover crop would mangle them further.
// - made-to-measure-shopify, spotter-eld, streak: real product screenshots
//   with a white or cream UI background. CoverCard overlays the title in
//   white on a dark gradient meant for moody photography -- against a light
//   screenshot that gradient barely darkens the lower third, so the title
//   read as white-on-white, nearly illegible (caught live: "SPOTTER ELD" and
//   "STREAK" were both unreadable against their own screenshots). Cropping
//   the sidebar icons on made-to-measure-shopify's raw storefront screenshot
//   this way also left a UI icon peeking outside the card's rounded corner.
//   ContainCard sidesteps all of it: the title sits on its own solid
//   surface-2 zone below the image, never on top of it.
const CONTAIN_SLUGS = new Set([
  "education-saas",
  "health-platform",
  "made-to-measure-shopify",
  "spotter-eld",
  "streak",
]);

// Full-bleed variant: photo fills the whole card, title/blurb/link sit on a
// dark gradient over the image, same layout the viens-la.com reference uses
// for its project cards.
function CoverCard({ item, tone, index }: { item: WorkReelItem; tone: string; index: number }) {
  const captionTone = PILL_TONES[(index + 1) % PILL_TONES.length];
  return (
    // Fills its wrapper exactly -- see ReelCard's padded wrapper div for
    // where the visible margin around this card actually comes from now.
    <div className="relative h-full w-full">
      <Image
        src={item.image.src}
        alt={item.image.alt}
        fill
        sizes="(min-width: 640px) 90vw, 100vw"
        className="object-cover"
        priority={index === 0}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
      <span
        className={`nums absolute top-6 left-6 inline-flex h-9 w-11 items-center justify-center rounded-full text-[13px] font-semibold text-pastel-ink sm:top-8 sm:left-8 ${tone}`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      {/* Resting state matches the b3 reference: title + one pill only, big
          and with real bottom air, not jammed flush to the card edge. The
          blurb and case-study link stay in the DOM for a11y/SEO but fade in
          only on hover/focus -- viens-la's own cards never show body copy on
          the face at all, ours keeps it as a hover flourish instead of
          dropping the content outright. No Dock-specific inset needed here
          any more: the card itself now ends well above the Dock (see the
          76svh height above), so ordinary bottom air is already clear of it. */}
      <div className="absolute inset-x-6 bottom-10 sm:inset-x-10 sm:bottom-14">
        <h3 className="[font-family:var(--font-card-title)] text-[clamp(2.6rem,9vw,5.75rem)] leading-[0.9] tracking-[-0.01em] text-balance text-white uppercase">
          {item.title}
        </h3>
        <div className="mt-5">
          <FactPill text={item.caption} tone={captionTone} />
        </div>
        <p className="mt-4 max-w-[48ch] text-sm leading-relaxed text-white/80 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 sm:text-base">
          {item.blurb}
        </p>
        <span className="mono mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sun opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          View case study <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </div>
  );
}

// Two-zone variant for the pre-cropped strip images: the strip sits framed
// and uncropped on its own surface, copy sits below on a solid surface, no
// gradient-over-photo trick needed since there's no full photo to gradient.
function ContainCard({ item, tone, index }: { item: WorkReelItem; tone: string; index: number }) {
  const captionTone = PILL_TONES[(index + 1) % PILL_TONES.length];
  return (
    // Fills its wrapper exactly -- same reasoning as CoverCard above.
    <div className="flex h-full w-full flex-col">
      {/* Fixed height, not flex-1: these strips are ~7:1 (700x103/700x187), so
          object-contain already centers the raster inside its box, but a box
          that swallows every leftover pixel of the card leaves a huge dead
          void above and below a thin strip -- centered on paper, but reading
          as "stuck near the top" next to that much empty green. Capping the
          zone's own height keeps the strip close to its natural size, and the
          copy zone below picks up flex-1 + justify-center so the whole card
          composes as one balanced unit instead of a small image floating in
          a tall box above a copy block hugging the top of a short one. */}
      <div className="relative h-[38vh] bg-surface-1 p-8 sm:h-[42vh] sm:p-12">
        <Image src={item.image.src} alt={item.image.alt} fill sizes="90vw" className="object-contain p-6 sm:p-8" />
        <span
          className={`nums absolute top-6 left-6 inline-flex h-9 w-11 items-center justify-center rounded-full text-[13px] font-semibold text-pastel-ink sm:top-8 sm:left-8 ${tone}`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <div className="flex flex-1 flex-col justify-center bg-surface-2 p-6 sm:p-8">
        <h3 className="[font-family:var(--font-card-title)] text-4xl leading-[0.9] tracking-[-0.01em] text-fg uppercase sm:text-6xl">
          {item.title}
        </h3>
        <div className="mt-3">
          <FactPill text={item.caption} tone={captionTone} />
        </div>
        <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-dim sm:text-base">{item.blurb}</p>
        <span className="mono mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
          View case study <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </div>
  );
}

// Replaces the native pointer over a card with a circular "View" badge that
// tracks the mouse, same move viens-la.com makes over its own project
// photos. Position is relative to the card itself (set from the Link's own
// mousemove), not the document, so it stays correct however far down the
// page the card has scrolled.
function CardCursor({ x, y, visible }: { x: number; y: number; visible: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="mono pointer-events-none absolute top-0 left-0 z-20 flex h-16 w-16 items-center justify-center rounded-full bg-sun text-[11px] font-semibold tracking-[0.06em] text-pastel-ink uppercase transition-opacity duration-150"
      style={{ transform: `translate(${x - 32}px, ${y - 32}px)`, opacity: visible ? 1 : 0 }}
    >
      View
    </span>
  );
}

// How much of the PREVIOUS card's slot the incoming card spends easing in
// (translateY + rotate, from off-screen-below to settled). The remainder of
// that slot is the outgoing card's alone-on-screen stretch before the next
// one starts rising into view -- matches how long viens-la.com holds a
// single card with nothing rising into it yet (same intent the old
// TRACK_H/REVEAL_PULL split served, just expressed as a fraction of one
// shared progress value instead of two separate CSS lengths).
const ARRIVE_FRACTION = 0.55;
// Scale every card eases toward once it starts receding, at progress = 1
// (the very end of the whole reel). A card almost never actually reaches
// this scale while still visible -- it gets covered by the next arrival
// first -- so this is a target rate, not a value any card visibly hits.
// Viens-la.com's own measured recede rate (~-0.0000574 scale/px) doesn't
// port literally: that number is scaled to THEIR total virtual-scroll
// height (25485px), which has no equivalent here. What transfers is the
// shape -- constant shrink while pinned, still fully visible underneath the
// next card during its arrival -- not the literal constant.
const MIN_SCALE = 0.82;

// One card in the reel. Position/rotation/scale all come from ONE shared
// scroll-progress value (see WorkReel below) instead of each card owning
// its own independent sticky element -- that's what makes the outgoing
// card's shrink-while-still-visible possible: with N separate sticky boxes
// each locking to the SAME top:0, there's no way for an earlier one to stay
// on screen, smaller, once a later one has locked over it (it's either
// fully covered by the later box's opaque stage, or it isn't locked yet --
// nothing in between). A single stage with every card absolutely positioned
// inside it, stacked by DOM order, can hold that in-between state: the
// later card animates in on top while the earlier one is still fully
// painted underneath, just progressively smaller.
function ReelCard({
  item,
  index,
  count,
  progress,
}: {
  item: WorkReelItem;
  index: number;
  count: number;
  progress: MotionValue<number>;
}) {
  const tone = PILL_TONES[index % PILL_TONES.length];
  const contain = CONTAIN_SLUGS.has(item.slug);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });

  const slot = 1 / count;
  const start = index * slot;
  const nextStart = index === count - 1 ? 1 : (index + 1) * slot;
  // Card 0 has nothing to arrive from -- it's the resting state from the
  // very first frame of the pin. Every other card eases in across the back
  // half (ARRIVE_FRACTION) of the slot before its own, landing exactly at
  // `start`, which is also the instant the card before it starts receding.
  const arriveFrom = index === 0 ? -1 : start - slot * ARRIVE_FRACTION;
  const arriveTo = index === 0 ? -0.999 : start;

  // 100vh, not some smaller nudge: the stage clips anything outside its own
  // box (see Reel's `overflow-hidden` below), and only that guarantees full
  // clipping regardless of how tall the padded card itself is -- caught
  // live: an earlier 46vh offset left every not-yet-arrived card (not just
  // the one actually arriving) peeking from the bottom edge at once, since
  // 46vh wasn't enough to clear a card almost as tall as the stage.
  const y = useTransform(progress, [arriveFrom, arriveTo], ["100vh", "0vh"], { clamp: true });
  const rotate = useTransform(progress, [arriveFrom, arriveTo], [-5, 0], { clamp: true });
  const scale = useTransform(progress, [start, 1], [1, MIN_SCALE], { clamp: true });
  // A MotionValue written straight into `style`, not React state -- this
  // updates on every scroll frame without a re-render, and framer-motion
  // applies non-animatable string values (like "pointerEvents") as a plain
  // assignment rather than trying to interpolate them.
  const pointerEvents = useTransform(progress, (v) => (v >= start && v < nextStart ? "auto" : "none"));

  // tabIndex/aria-hidden are real DOM attributes, not styles, so they can't
  // ride a MotionValue directly -- mirror the same front/back test into
  // React state, but only re-render on the two frames where it actually
  // flips (React bails out a same-value setState), not every scroll frame.
  const [interactive, setInteractive] = useState(index === 0);
  useMotionValueEvent(progress, "change", (v) => {
    const active = v >= start && v < nextStart;
    setInteractive((prev) => (prev === active ? prev : active));
  });

  return (
    <motion.div
      className="absolute inset-0 px-[3vw] py-[12vh] sm:px-[6vw] lg:px-[10vw]"
      style={{ y, rotate, scale, pointerEvents, zIndex: index + 1 }}
    >
      <Link
        href={`/work/${item.slug}`}
        data-unit={`work:${item.slug}`}
        tabIndex={interactive ? 0 : -1}
        aria-hidden={!interactive}
        className="group relative block h-full w-full cursor-none overflow-hidden rounded-[1.75rem] border border-line shadow-[0_20px_50px_rgba(8,16,12,0.45)] sm:rounded-[2.5rem]"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          setCursor({ x: e.clientX - rect.left, y: e.clientY - rect.top, visible: true });
        }}
        onMouseLeave={() => setCursor((c) => ({ ...c, visible: false }))}
      >
        {contain ? (
          <ContainCard item={item} tone={tone} index={index} />
        ) : (
          <CoverCard item={item} tone={tone} index={index} />
        )}
        <CardCursor x={cursor.x} y={cursor.y} visible={cursor.visible} />
      </Link>
    </motion.div>
  );
}

// Total scroll length the pin holds open, as a fraction of one viewport per
// card. 145vh per card (1015vh total across 7 cards) keeps roughly the same
// overall reel length the old TRACK_H(250vh)/REVEAL_PULL(-120vh) pair
// produced (net ~130vh advance per card after the first), just expressed as
// one number instead of two that had to stay in a specific relationship.
const SLOT_VH = 145;

function Reel({ items }: { items: WorkReelItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  return (
    <div ref={containerRef} className="relative" style={{ height: `${items.length * SLOT_VH}vh` }}>
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-bg">
        {items.map((item, i) => (
          <ReelCard key={item.slug} item={item} index={i} count={items.length} progress={scrollYProgress} />
        ))}
      </div>
    </div>
  );
}

// Touch / reduced-motion fallback: the pin + shared-progress mechanic above
// is driven entirely by framer-motion reading scroll position in JS, unlike
// the old per-card CSS-sticky version, which needed no capability gate at
// all. Trading that away for the recede-behind-the-next-card look (only
// possible with one shared stage, see ReelCard above) means picking it back
// up here -- same convention StickyStack uses in Featured.tsx: no pin, no
// scroll-linked transform, just the cards in plain document flow.
function PlainStack({ items }: { items: WorkReelItem[] }) {
  return (
    <ol className="mt-10 list-none space-y-6 pl-0 sm:mt-16">
      {items.map((item, i) => {
        const tone = PILL_TONES[i % PILL_TONES.length];
        const contain = CONTAIN_SLUGS.has(item.slug);
        return (
          <li key={item.slug} className="h-[80svh] w-full px-[3vw] sm:px-[6vw] lg:px-[10vw]">
            <Link
              href={`/work/${item.slug}`}
              data-unit={`work:${item.slug}`}
              className="group relative block h-full w-full overflow-hidden rounded-[1.75rem] border border-line shadow-[0_20px_50px_rgba(8,16,12,0.45)] sm:rounded-[2.5rem]"
            >
              {contain ? (
                <ContainCard item={item} tone={tone} index={i} />
              ) : (
                <CoverCard item={item} tone={tone} index={i} />
              )}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

// Portfolio work, scroll-revealed like the b3 reference: real project cards
// that stack as you scroll, each new one arriving over the last and the
// last one still visible, smaller, behind it -- not a hard cut.
export default function WorkReel() {
  const reduce = useReducedMotion();
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    setAnimated(mq.matches && !reduce);
  }, [reduce]);

  return (
    <section
      id="work"
      aria-labelledby="work-h"
      className="mx-auto w-full max-w-[1440px] scroll-mt-4 px-6 pt-16 pb-24 sm:pt-24 lg:px-10 lg:pb-32"
    >
      <WorkHead />
      {animated ? (
        <div className="mt-10 sm:mt-16">
          <Reel items={workReel} />
        </div>
      ) : (
        <PlainStack items={workReel} />
      )}
    </section>
  );
}
