"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
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

// Tilted sticker caption, same role as viens-la.com's rotated pastel label
// over its project photos: one concrete fact, not the title or blurb again.
function CaptionChip({ text, tone }: { text: string; tone: string }) {
  return (
    <span
      className={`absolute top-6 right-6 max-w-[15ch] -rotate-3 rounded-2xl px-4 py-2.5 text-xs font-semibold leading-snug text-pastel-ink shadow-[0_8px_20px_rgba(8,16,12,0.35)] sm:top-8 sm:right-8 sm:max-w-[18ch] sm:px-5 sm:py-3 sm:text-sm ${tone}`}
    >
      {text}
    </span>
  );
}

// education-saas and health-platform are pre-cropped thin strips, not full
// screenshots -- a full-bleed cover crop would mangle them further, so those
// two render on a padded surface zone with object-contain instead of the
// full-bleed photo treatment every other card gets.
const CONTAIN_SLUGS = new Set(["education-saas", "health-platform"]);

// Full-bleed variant: photo fills the whole card, title/blurb/link sit on a
// dark gradient over the image, same layout the viens-la.com reference uses
// for its project cards.
function CoverCard({ item, tone, index }: { item: WorkReelItem; tone: string; index: number }) {
  const captionTone = PILL_TONES[(index + 1) % PILL_TONES.length];
  return (
    <div className="relative h-[calc(100svh-5rem)] w-full sm:h-[calc(100svh-6.5rem)]">
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
      <CaptionChip text={item.caption} tone={captionTone} />
      <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
        <h3 className="font-display text-2xl leading-[1.05] text-white sm:text-4xl">{item.title}</h3>
        <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-white/80 sm:text-base">{item.blurb}</p>
        <span className="mono mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-sun">
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
    <div className="flex h-[calc(100svh-5rem)] w-full flex-col sm:h-[calc(100svh-6.5rem)]">
      <div className="relative flex-1 bg-surface-1 p-10 sm:p-14">
        <Image src={item.image.src} alt={item.image.alt} fill sizes="90vw" className="object-contain p-10 sm:p-14" />
        <span
          className={`nums absolute top-6 left-6 inline-flex h-9 w-11 items-center justify-center rounded-full text-[13px] font-semibold text-pastel-ink sm:top-8 sm:left-8 ${tone}`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <CaptionChip text={item.caption} tone={captionTone} />
      </div>
      <div className="bg-surface-2 p-6 sm:p-8">
        <h3 className="font-display text-2xl leading-[1.05] text-fg sm:text-4xl">{item.title}</h3>
        <p className="mt-3 max-w-[48ch] text-sm leading-relaxed text-dim sm:text-base">{item.blurb}</p>
        <span className="mono mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent">
          View case study <span aria-hidden="true">&rarr;</span>
        </span>
      </div>
    </div>
  );
}

// One card in the stack. The sticky element is a full-viewport, opaque stage
// (bg-bg, min-h-screen) -- not just the card itself -- so once a later card
// locks to top:0 it blanks out every earlier one still underneath, edge to
// edge. Every track after the first pulls up with a negative margin into the
// previous track's tail: that overlap is what lets a card start rising into
// view while the previous one is still fully stuck, so there's a real window
// where both render at once. On top of that, each card (other than the last)
// scales down a little -- 1 to 0.92 -- as its OWN track scrolls past, origin
// pinned to its top edge so the top stays put and only the bottom recedes.
// That's what makes it read as the outgoing card shrinking back into the
// stack while the next one covers it, the viens-la.com reference's actual
// motion, instead of the flat top:0-to-top:0 hand-off a same-size card gives,
// which just looks like it gets shoved off-screen. Native document scroll
// only throughout: no scroll-jacking, no wheel interception, sticky +
// negative margin + a scroll-linked transform, not scroll position itself.
const STAGE_H = "min-h-[100svh]";
// Same value at every breakpoint (vh already scales with the viewport) so
// the JS cover-start fraction below stays correct on mobile and desktop
// instead of drifting between two Tailwind breakpoint variants. TRACK_H and
// REVEAL_PULL must be literal strings, not built from TRACK_VH/REVEAL_VH via
// template interpolation -- Tailwind's scanner reads source text for a
// complete class token, and "min-h-[" + a variable + "vh]" never appears as
// one token in the file, so an interpolated version silently generates no
// CSS at all. Keep the numbers below equal to the ones inside these two
// strings by hand.
const TRACK_VH = 170;
const REVEAL_VH = 55;
const TRACK_H = "min-h-[170vh]";
const REVEAL_PULL = "-mt-[55vh]";
const RECEDE_SCALE = 0.92;
// Fraction of a card's OWN track scroll where the next card's negative
// margin actually starts covering it -- shrink needs to start here, not
// spread evenly across the whole track, or by the time covering is visible
// the scale has barely moved (most of the range gets used up while the card
// is still alone on screen, where a few-percent shrink isn't perceptible).
const COVER_START = (TRACK_VH - REVEAL_VH) / TRACK_VH;

function StackCard({ item, index, isLast }: { item: WorkReelItem; index: number; isLast: boolean }) {
  const tone = PILL_TONES[index % PILL_TONES.length];
  const contain = CONTAIN_SLUGS.has(item.slug);
  const trackRef = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end start"] });
  const scale = useTransform(
    scrollYProgress,
    [0, COVER_START, 1],
    [1, 1, isLast ? 1 : RECEDE_SCALE],
  );

  return (
    <li
      ref={trackRef}
      className={`relative ${TRACK_H} ${index === 0 ? "" : REVEAL_PULL}`}
      style={{ zIndex: index + 1 }}
    >
      {/* No top padding here: the card sits flush with the stage's own top
          edge on purpose -- a gap here would show as a band of flat green
          background before the card itself arrives. Bottom clearance for
          the floating Dock lives on the card's own height below instead. */}
      <div className={`sticky top-0 ${STAGE_H} bg-bg px-1`}>
        <motion.div style={{ scale, transformOrigin: "top center" }} className="w-full">
          <Link
            href={`/work/${item.slug}`}
            data-unit={`work:${item.slug}`}
            className="block w-full overflow-hidden rounded-[1.75rem] border border-line shadow-[0_20px_50px_rgba(8,16,12,0.45)] sm:rounded-[2.5rem]"
          >
            {contain ? (
              <ContainCard item={item} tone={tone} index={index} />
            ) : (
              <CoverCard item={item} tone={tone} index={index} />
            )}
          </Link>
        </motion.div>
      </div>
    </li>
  );
}

// Portfolio work, scroll-revealed like the B3 reference: real project cards
// that stack as you scroll, each new one covering the last. Works the same
// way on mobile and desktop -- sticky positioning needs no capability gate,
// unlike the pointer-hover interactions elsewhere on the page.
export default function WorkReel() {
  return (
    <section
      id="work"
      aria-labelledby="work-h"
      className="mx-auto w-full max-w-[1440px] scroll-mt-4 px-6 pt-16 pb-24 sm:pt-24 lg:px-10 lg:pb-32"
    >
      <WorkHead />
      <ol className="relative mt-10 list-none pl-0 sm:mt-16">
        {workReel.map((item, i) => (
          <StackCard key={item.slug} item={item} index={i} isLast={i === workReel.length - 1} />
        ))}
      </ol>
    </section>
  );
}
