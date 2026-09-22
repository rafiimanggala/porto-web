"use client";

import { useState } from "react";
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
      {/* Resting state matches the b3 reference: title + one pill only, big
          and with real bottom air, not jammed flush to the card edge. The
          blurb and case-study link stay in the DOM for a11y/SEO but fade in
          only on hover/focus -- viens-la's own cards never show body copy on
          the face at all, ours keeps it as a hover flourish instead of
          dropping the content outright. */}
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
    <div className="flex h-[calc(100svh-5rem)] w-full flex-col sm:h-[calc(100svh-6.5rem)]">
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

// One card in the stack. The sticky element is a full-viewport, opaque stage
// (bg-bg, min-h-screen) -- not just the card itself -- so once a later card
// locks to top:0 it blanks out every earlier one still underneath, edge to
// edge. Every track after the first pulls up with a negative margin into the
// previous track's tail, and that pull MUST be at least as tall as the stage
// itself (one viewport): a sticky card only locks once scroll reaches its
// OWN track's start, and it releases once scroll passes (track height minus
// stage height) into that same track. With a pull shorter than the stage
// height, the next card's lock point lands AFTER the current card's release
// point -- a real gap where neither card is locked, both just scroll past
// like plain content, which reads as the old card being shoved off rather
// than covered (verified live: sampling getBoundingClientRect() through a
// full scroll found stretches with zero cards locked). Pulling up by more
// than the stage height, instead, makes the next card lock WHILE the current
// one is still locked, so there's a real window where the new one (higher
// z-index) sits flush over the old one before the old one even starts to
// release -- that's the actual cover. No scale/shrink on the outgoing card:
// a frame-by-frame check of viens-la.com's actual project cards showed a
// straight cover, no recede. Native document scroll only throughout: no
// scroll-jacking, no wheel interception, sticky + negative margin, not
// scroll position read back into JS.
const STAGE_H = "min-h-[100svh]";
// TRACK_H and REVEAL_PULL must be literal strings, not built via template
// interpolation from a shared numeric constant -- Tailwind's scanner reads
// source text for a complete class token, and "min-h-[" + a variable +
// "vh]" never appears as one token in the file, so an interpolated version
// silently generates no CSS at all. REVEAL_PULL (120vh) stays past STAGE_H's
// one viewport (100vh) so the next card still locks before the current one
// releases (see the comment above). TRACK_H went 200vh -> 250vh because
// 200vh only left ~70vh of the current card fully alone on screen before
// the next one started peeking in at the very bottom -- barely any scroll,
// so a new card was already visible almost as soon as the current one
// settled, reading as "it just pops up" instead of a deliberate reveal.
// 250vh gives a real alone stretch before the next card's top edge enters
// the viewport at all, matching how long viens-la.com holds a single card
// with nothing rising into it yet.
const TRACK_H = "min-h-[250vh]";
const REVEAL_PULL = "-mt-[120vh]";

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

function StackCard({ item, index }: { item: WorkReelItem; index: number }) {
  const tone = PILL_TONES[index % PILL_TONES.length];
  const contain = CONTAIN_SLUGS.has(item.slug);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });

  return (
    <li className={`relative ${TRACK_H} ${index === 0 ? "" : REVEAL_PULL}`} style={{ zIndex: index + 1 }}>
      {/* No top padding here: the card sits flush with the stage's own top
          edge on purpose -- a gap here would show as a band of flat green
          background before the card itself arrives. Bottom clearance for
          the floating Dock lives on the card's own height below instead. */}
      <div className={`sticky top-0 ${STAGE_H} bg-bg px-1`}>
        <Link
          href={`/work/${item.slug}`}
          data-unit={`work:${item.slug}`}
          className="group relative block w-full cursor-none overflow-hidden rounded-[1.75rem] border border-line shadow-[0_20px_50px_rgba(8,16,12,0.45)] sm:rounded-[2.5rem]"
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
          <StackCard key={item.slug} item={item} index={i} />
        ))}
      </ol>
    </section>
  );
}
