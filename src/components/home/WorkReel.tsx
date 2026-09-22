"use client";

import Link from "next/link";
import Image from "next/image";
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

// education-saas and health-platform are pre-cropped thin strips, not full
// screenshots -- a full-bleed cover crop would mangle them further, so those
// two render on a padded surface zone with object-contain instead of the
// full-bleed photo treatment every other card gets.
const CONTAIN_SLUGS = new Set(["education-saas", "health-platform"]);

// Full-bleed variant: photo fills the whole card, title/blurb/link sit on a
// dark gradient over the image, same layout the viens-la.com reference uses
// for its project cards.
function CoverCard({ item, tone, index }: { item: WorkReelItem; tone: string; index: number }) {
  return (
    <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
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
  return (
    <div className="flex aspect-[4/3] w-full flex-col sm:aspect-[16/10]">
      <div className="relative flex-1 bg-surface-1 p-10 sm:p-14">
        <Image src={item.image.src} alt={item.image.alt} fill sizes="90vw" className="object-contain p-10 sm:p-14" />
        <span
          className={`nums absolute top-6 left-6 inline-flex h-9 w-11 items-center justify-center rounded-full text-[13px] font-semibold text-pastel-ink sm:top-8 sm:left-8 ${tone}`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
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
// (bg-bg, min-h-screen) -- not just the card itself -- so once it locks to
// top:0 it blanks out whatever card is still underneath, edge to edge, not
// just where the rounded card art sits. Every track after the first pulls up
// with a negative margin into the previous track's tail: that overlap is
// what lets this card start rising into view WHILE the previous one is still
// fully stuck, so there's a real window where both render at once (old one
// static, new one sliding up over it) instead of the two swapping the instant
// the old one would otherwise start exiting -- a plain min-h track with no
// overlap produces an exact hand-off with zero visible covering, which is
// what earlier measurement caught as a "gap" against the viens-la.com
// reference. Native document scroll only: no scroll-jacking, no wheel
// interception, just position: sticky and negative margin.
const STAGE_H = "min-h-[100svh]";
const TRACK_H = "min-h-[150vh] sm:min-h-[180vh]";
const REVEAL_PULL = "-mt-[35vh] sm:-mt-[60vh]";

function StackCard({ item, index }: { item: WorkReelItem; index: number }) {
  const tone = PILL_TONES[index % PILL_TONES.length];
  const contain = CONTAIN_SLUGS.has(item.slug);

  return (
    <li
      className={`relative ${TRACK_H} ${index === 0 ? "" : REVEAL_PULL}`}
      style={{ zIndex: index + 1 }}
    >
      <div className={`sticky top-0 flex ${STAGE_H} items-center bg-bg px-1 py-6 sm:py-10`}>
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
      className="mx-auto w-full max-w-[1120px] scroll-mt-4 px-6 pt-16 pb-24 sm:pt-24 lg:px-8 lg:pb-32"
    >
      <WorkHead />
      <ol className="relative mt-10 list-none pl-0 sm:mt-16">
        {workReel.map((item, i) => (
          <StackCard key={item.slug} item={item} index={i} />
        ))}
      </ol>
    </section>
  );
}
