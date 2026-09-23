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

// Rafii's call (23 Sep): every card should read as one family, card 1 and 2's
// full-bleed treatment, not a split between that and a separate boxed-strip
// +solid-copy-zone layout. All five of these are real product screenshots
// (education-saas and health-platform got a proper re-shoot the same day --
// see src/data/workReel.ts's header comment -- replacing two pre-cropped
// thin strips) -- none survives a hard `object-cover` crop, since cropping a
// screenshot cuts through real UI chrome (caught live: made-to-measure-
// shopify's raw storefront crop left a sidebar icon peeking outside the
// rounded corner). CONTAIN_SLUGS marks them so they render with
// `object-contain` on a solid backdrop instead of `object-cover`, so nothing
// gets cropped or stretched, while everything else about the card
// (full-bleed shape, gradient title overlay, no separate copy zone) matches
// card 1 and 2 exactly.
const CONTAIN_SLUGS = new Set([
  "education-saas",
  "health-platform",
  "made-to-measure-shopify",
  "spotter-eld",
  "streak",
]);

// The one card layout: full-bleed image/video, title + one pill on a dark
// gradient over it, same language the viens-la.com reference uses for its
// project cards. `contain` mode (see CONTAIN_SLUGS) is the only branch --
// same overlay, same typography, just object-contain over a solid backdrop
// instead of object-cover, for images a crop would mangle.
function CoverCard({ item, tone, index }: { item: WorkReelItem; tone: string; index: number }) {
  const captionTone = PILL_TONES[(index + 1) % PILL_TONES.length];
  const contain = CONTAIN_SLUGS.has(item.slug);
  // Reduced-motion still gets the card -- it just gets the poster frame,
  // not the loop. autoPlay is the only thing gated; the <video> element
  // itself renders either way so the poster still shows as a still image.
  const reduce = useReducedMotion();
  return (
    // Fills its wrapper exactly -- see ReelCard's padded wrapper div for
    // where the visible margin around this card actually comes from now.
    // bg-surface-1 is the letterbox color for contain mode; invisible in
    // cover mode since the image fills the box edge to edge regardless.
    // object-top (contain mode only) pins the image to the top of its box
    // instead of centering it -- centered, a short-and-wide strip lands
    // right in the middle of the card, exactly where the title sits, and
    // the two overlap illegibly (caught live: HEALTH OPTIMISATION PLATFORM
    // ran straight across the score panel's chart lines). Pinning it up top
    // keeps the whole bottom band clear for the title, every time, no
    // per-image tuning needed regardless of how tall or short the image is.
    <div className="relative h-full w-full bg-surface-1">
      {item.video ? (
        <video
          src={item.video}
          poster={item.image.src}
          autoPlay={!reduce}
          loop
          muted
          playsInline
          className={`absolute inset-0 h-full w-full ${contain ? "object-contain object-top p-10 sm:p-16" : "object-cover"}`}
        />
      ) : (
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes="(min-width: 640px) 90vw, 100vw"
          className={contain ? "object-contain object-top p-10 sm:p-16" : "object-cover"}
          priority={index === 0}
        />
      )}
      {/* Stronger than a moody-photo gradient needs (was from-black/75
          via-black/15): contain mode's backdrop is light, and a crop-free
          screenshot can still be bright right up to the title zone, so the
          scrim has to guarantee contrast on its own rather than counting on
          the photo already being dark underneath -- this is the fix for the
          exact "SPOTTER ELD"/"STREAK" white-on-white bug the old two-layout
          split was built to dodge, applied to the scrim instead of routing
          around it with a different card shape. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
      <span
        className={`nums absolute top-6 left-6 inline-flex h-9 w-11 items-center justify-center rounded-full text-[13px] font-semibold text-pastel-ink sm:top-8 sm:left-8 ${tone}`}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      {/* Resting state matches the b3 reference: title + one pill only, big
          and with real bottom air, not jammed flush to the card edge. No
          blurb on the face at all any more -- matches viens-la's own cards,
          which never show body copy over the photo either (the blurb still
          exists, just on the case-study page itself). The case-study link
          stays in the DOM for a11y/SEO but fades in only on hover/focus. No
          Dock-specific inset needed here any more: the card itself now ends
          well above the Dock (see the 76svh height above), so ordinary
          bottom air is already clear of it. */}
      <div className="absolute inset-x-6 bottom-10 sm:inset-x-10 sm:bottom-14">
        {/* The gradient above handles most images fine, but a tall
            landscape screenshot (contain mode, height-constrained) can fill
            the box edge to edge with little room left for the gradient to
            darken before the title -- made-to-measure-shopify's own shirts
            sat close enough to white behind the title that it read as
            borderline even with the stronger scrim. A drop-shadow on the
            text itself is a second, independent guarantee: near-invisible
            against an already-dark backdrop, decisive against a bright one. */}
        <h3 className="[font-family:var(--font-card-title)] [text-shadow:0_4px_24px_rgba(0,0,0,0.6)] text-[clamp(2.6rem,9vw,5.75rem)] leading-[0.9] tracking-[-0.01em] text-balance text-white uppercase">
          {item.title}
        </h3>
        <div className="mt-5">
          <FactPill text={item.caption} tone={captionTone} />
        </div>
        <span className="mono mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sun opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
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
        <CoverCard item={item} tone={tone} index={index} />
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
        return (
          <li key={item.slug} className="h-[80svh] w-full px-[3vw] sm:px-[6vw] lg:px-[10vw]">
            <Link
              href={`/work/${item.slug}`}
              data-unit={`work:${item.slug}`}
              className="group relative block h-full w-full overflow-hidden rounded-[1.75rem] border border-line shadow-[0_20px_50px_rgba(8,16,12,0.45)] sm:rounded-[2.5rem]"
            >
              <CoverCard item={item} tone={tone} index={i} />
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
