"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  motion,
  useMotionValue,
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
// +solid-copy-zone layout. CONTAIN_SLUGS marks screenshots that don't survive
// a hard `object-cover` crop, since cropping cuts through real UI chrome
// (caught live: made-to-measure-shopify's raw storefront crop left a sidebar
// icon peeking outside the rounded corner) -- those get `object-contain` on
// a solid backdrop instead, so nothing gets cropped or stretched. spotter-eld
// and streak are the two left, since they're still raw screenshots with no
// scroll scene of their own to capture instead.
const CONTAIN_SLUGS = new Set(["spotter-eld", "streak"]);

// The four cards whose clip is a capture of the case study's own scroll
// scenes (see workReel.ts). They were full-bleed too, zoomed to fill the
// card (23 Sep, "di zoom seperti card 1 dan 2"), back when each played a
// single mockup. Once every clip grew into a whole multi-scene reel of dense
// UI, that treatment buried it (Rafii, 30 Sep: "kontennya kurang keliatan di
// card tersebut"): the cover crop cut the sides off on any card taller than
// the clip (a third of the width survived on a phone), the full-height scrim
// dimmed most of what was left, and the title ran right across its middle.
// SceneCard gives these clips a zone of their own instead: the whole
// capture, uncropped and undimmed, above the caption rather than under it.
// Same chip, same caption, same corner for the title -- only the media
// stops being a backdrop.
const SCENE_SLUGS = new Set([
  "education-saas",
  "health-platform",
  "content-automation-pipeline",
  "made-to-measure-shopify",
]);

// Corner radius of the BrowserWindow frame baked into every scene capture
// (rounded-2xl, 16px at the capture's 862px CSS width), plus 2px so the clip
// also swallows the antialiased page-color wedges outside that corner.
const SCENE_FRAME_RADIUS = 18;

// See `playbackRate` on WorkReelItem. defaultPlaybackRate too, not just
// playbackRate: the media load algorithm resets playbackRate to the
// default on every (re)load, which would silently snap the clip back to 1x.
function useClipRate(rate: number | undefined) {
  const videoRef = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = videoRef.current;
    if (!el || !rate) return;
    el.defaultPlaybackRate = rate;
    el.playbackRate = rate;
  }, [rate]);
  return videoRef;
}

function IndexChip({ index, tone }: { index: number; tone: string }) {
  return (
    <span
      className={`nums absolute top-6 left-6 inline-flex h-9 w-11 items-center justify-center rounded-full text-[13px] font-semibold text-pastel-ink sm:top-8 sm:left-8 ${tone}`}
    >
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

// Resting state matches the b3 reference: title + one pill only. No blurb on
// the face at all -- matches viens-la's own cards, which never show body copy
// over the photo either (the blurb still exists, just on the case-study page
// itself). The case-study link stays in the DOM for a11y/SEO but fades in
// only on hover/focus, beside the pill rather than on a row of its own, so it
// costs the card no height while it's invisible.
// The title came down from clamp(2.6rem,9vw,5.75rem) on 30 Sep: at that size
// it ran two lines on most cards, which is what left a scene reel no room
// above it (see SCENE_SLUGS). One line on desktop now, on every card, so the
// family still matches.
function CardCaption({ item, index }: { item: WorkReelItem; index: number }) {
  const captionTone = PILL_TONES[(index + 1) % PILL_TONES.length];
  return (
    <>
      {/* The scrim under each caption handles most backdrops fine; the
          drop-shadow on the text itself is a second, independent guarantee:
          near-invisible against an already-dark backdrop, decisive against a
          bright one (made-to-measure-shopify's old storefront shot sat close
          enough to white behind the title to read as borderline). */}
      <h3 className="[font-family:var(--font-card-title)] [text-shadow:0_4px_24px_rgba(0,0,0,0.6)] text-[clamp(2.25rem,5.4vw,4rem)] leading-[0.9] tracking-[-0.01em] text-balance text-white uppercase">
        {item.title}
      </h3>
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-3">
        <FactPill text={item.caption} tone={captionTone} />
        <span className="mono inline-flex items-center gap-1.5 text-xs font-semibold text-sun opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          View case study <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </>
  );
}

// Media zone over caption zone, instead of media under caption (see
// SCENE_SLUGS). The zone is a size container so the frame can be sized the
// way object-contain would size it -- min(zone width, zone height x clip
// aspect) -- but as a real box, which a letterboxed <video> never is: that
// box is what carries the rounded clip matching the capture's own window
// corners. Centered both ways: on a phone the clip is width-bound and floats
// mid-zone with the index chip clear above it; on a wide laptop card it's
// height-bound and gets even side margins instead. The sm: padding keeps it
// off the card's own top border (otherwise the window's title bar sits
// flush against it, two frame lines stacked) and, on the 1920 desktop where
// it's width-bound again, far enough in that the index chip lands beside
// the window rather than on top of its traffic lights.
function SceneCard({ item, tone, index }: { item: WorkReelItem; tone: string; index: number }) {
  const reduce = useReducedMotion();
  const videoRef = useClipRate(item.playbackRate);
  const { width, height } = item.image;
  const frame = {
    aspectRatio: `${width} / ${height}`,
    width: `min(100cqw, ${((100 * width) / height).toFixed(2)}cqh)`,
    borderRadius: `min(${((100 * SCENE_FRAME_RADIUS) / width).toFixed(3)}cqw, ${((100 * SCENE_FRAME_RADIUS) / height).toFixed(3)}cqh)`,
  };
  return (
    <div className="relative flex h-full w-full flex-col bg-surface-1">
      <div className="relative min-h-0 flex-1 sm:mx-20 sm:mt-8 [container-type:size]">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative overflow-hidden" style={frame}>
            <video
              ref={videoRef}
              src={item.video}
              poster={item.image.src}
              autoPlay={!reduce}
              loop
              muted
              playsInline
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
      </div>
      <IndexChip index={index} tone={tone} />
      <div className="relative bg-gradient-to-t from-black/85 via-black/50 to-transparent px-6 pt-4 pb-10 sm:px-10 sm:pb-14">
        <CardCaption item={item} index={index} />
      </div>
    </div>
  );
}

// Every other card: full-bleed image/video, title + one pill on a dark
// gradient over it, same language the viens-la.com reference uses for its
// project cards. `contain` mode (see CONTAIN_SLUGS) is the only branch --
// same overlay, same typography, just object-contain over a solid backdrop
// instead of object-cover, for images a crop would mangle.
function CoverCard({ item, tone, index }: { item: WorkReelItem; tone: string; index: number }) {
  // object-top (contain mode only) pins the image to the top of its box
  // instead of centering it -- centered, a short-and-wide strip lands right
  // in the middle of the card, exactly where the title sits, and the two
  // overlap illegibly. Pinning it up top keeps the bottom band clear for the
  // title, no per-image tuning needed.
  const fit = CONTAIN_SLUGS.has(item.slug) ? "object-contain object-top p-10 sm:p-16" : "object-cover";
  // Reduced-motion still gets the card -- it just gets the poster frame,
  // not the loop. autoPlay is the only thing gated; the <video> element
  // itself renders either way so the poster still shows as a still image.
  const reduce = useReducedMotion();
  const videoRef = useClipRate(item.playbackRate);

  return (
    // bg-surface-1 is the letterbox color for contain mode; invisible in
    // cover mode since the image fills the box edge to edge regardless.
    <div className="relative h-full w-full bg-surface-1">
      {item.video ? (
        <video
          ref={videoRef}
          src={item.video}
          poster={item.image.src}
          autoPlay={!reduce}
          loop
          muted
          playsInline
          className={`absolute inset-0 h-full w-full ${fit}`}
        />
      ) : (
        <Image
          src={item.image.src}
          alt={item.image.alt}
          fill
          sizes="(min-width: 640px) 90vw, 100vw"
          className={fit}
          priority={index === 0}
        />
      )}
      {/* Stronger than a moody-photo gradient needs (was from-black/75
          via-black/15): contain mode's backdrop is light, and a crop-free
          screenshot can still be bright right up to the title zone, so the
          scrim has to guarantee contrast on its own rather than counting on
          the photo already being dark underneath. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
      <IndexChip index={index} tone={tone} />
      <div className="absolute inset-x-6 bottom-10 sm:inset-x-10 sm:bottom-14">
        <CardCaption item={item} index={index} />
      </div>
    </div>
  );
}

function CardFace(props: { item: WorkReelItem; tone: string; index: number }) {
  return SCENE_SLUGS.has(props.item.slug) && props.item.video ? <SceneCard {...props} /> : <CoverCard {...props} />;
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
  const isLast = index === count - 1;
  const nextStart = isLast ? 1 : (index + 1) * slot;
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

  // Last card's own upper bound (review workflow, 28 Sep, high-severity
  // finding): `scrollYProgress` reads exactly 1 at the very bottom of this
  // section's pinned scroll range -- the natural resting spot once the last
  // card has fully arrived -- so the plain `v < nextStart=1` test every
  // other card uses made the LAST card go non-interactive at exactly the
  // moment a user finishes scrolling to it. The fix isn't just dropping the
  // upper bound, though: `v` stays clamped at 1 for all further scrolling
  // too, including well after this whole section has scrolled off the top
  // of the screen (the sticky stage un-pins and scrolls away as one block
  // past that point) -- an unconditional `v >= start` would leave the last
  // card's link permanently tabbable/clickable, invisible, for the rest of
  // the page. Gating on genuine on-screen visibility (IntersectionObserver)
  // instead of a second progress threshold covers both: interactive through
  // the true end of the scroll range, not before or indefinitely after.
  const linkRef = useRef<HTMLAnchorElement>(null);
  // 1/0, not a boolean: useTransform's multi-value overload requires every
  // input MotionValue to share one primitive type (number[] or string[]).
  const lastVisible = useMotionValue(1);
  useEffect(() => {
    const el = linkRef.current;
    if (!isLast || !el) return;
    const io = new IntersectionObserver(([entry]) => lastVisible.set(entry.isIntersecting ? 1 : 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [isLast, lastVisible]);

  const isWithinSlot = (v: number, visible: number) => (isLast ? v >= start && visible === 1 : v >= start && v < nextStart);

  // A MotionValue written straight into `style`, not React state -- this
  // updates on every scroll frame without a re-render, and framer-motion
  // applies non-animatable string values (like "pointerEvents") as a plain
  // assignment rather than trying to interpolate them. Combining two
  // MotionValues (not just reading `lastVisible` in a closure) is what
  // makes this re-fire correctly when visibility flips independently of a
  // scroll-driven progress change.
  const pointerEvents = useTransform([progress, lastVisible], ([v, visible]: number[]) =>
    isWithinSlot(v, visible) ? "auto" : "none",
  );

  // tabIndex/aria-hidden are real DOM attributes, not styles, so they can't
  // ride a MotionValue directly -- mirror the same front/back test into
  // React state, but only re-render on the frames where it actually flips
  // (React bails out a same-value setState), not every scroll frame.
  const [interactive, setInteractive] = useState(index === 0);
  useEffect(() => {
    const recompute = () => {
      const active = isWithinSlot(progress.get(), lastVisible.get());
      setInteractive((prev) => (prev === active ? prev : active));
    };
    recompute();
    const unsubProgress = progress.on("change", recompute);
    const unsubVisible = lastVisible.on("change", recompute);
    return () => {
      unsubProgress();
      unsubVisible();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress, lastVisible, isLast, start, nextStart]);

  return (
    <motion.div
      className="absolute inset-0 px-[3vw] py-[12vh] sm:px-[6vw] lg:px-[10vw]"
      style={{ y, rotate, scale, pointerEvents, zIndex: index + 1 }}
    >
      <Link
        ref={linkRef}
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
        <CardFace item={item} tone={tone} index={index} />
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
              <CardFace item={item} tone={tone} index={i} />
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
  // Touch devices used to fall back to PlainStack (see the old hover/
  // pointer-fine gate this replaced) on the assumption that pinned-scroll
  // physics is a desktop-only trick. Rafii's call (23 Sep, "tidak bisa
  // animasi scroll down" on his phone): he wants the same arrive/cover/
  // recede reel on touch too, not a plain list -- framer-motion's
  // useScroll tracks any scroll container, touch included, so the only
  // real gate needed is prefers-reduced-motion.
  const reduce = useReducedMotion();
  const [animated, setAnimated] = useState(false);
  useEffect(() => {
    setAnimated(!reduce);
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
