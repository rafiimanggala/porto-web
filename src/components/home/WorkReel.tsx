"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { workReel, type WorkReelItem } from "@/data/workReel";
import Reveal from "@/components/ui/Reveal";
import { useActiveRow } from "./useActiveRow";
import { useWorkReelSticky } from "./useWorkReelSticky";

// Row DOM ids the sticky panel watches.
const ROW_IDS = workReel.map((item) => `work-row-${item.slug}`);

function rowId(slug: string): string {
  return `work-row-${slug}`;
}

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
        Seven builds. Scroll and watch the picture change, or press a title for the full case
        study.
      </p>
    </header>
  );
}

// The image card. Every source image here has a different real aspect ratio,
// and two of them (education-saas, health-platform) are pre-cropped thin
// strips -- object-contain on a padded surface card keeps all 7 uncropped and
// consistent, instead of object-cover mangling the strips.
function WorkFrame({ item, priority }: { item: WorkReelItem; priority?: boolean }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-line bg-surface-1 p-6 sm:p-8">
      <Image
        src={item.image.src}
        alt={item.image.alt}
        fill
        sizes="(min-width: 1024px) 38vw, 90vw"
        className="object-contain"
        priority={priority}
      />
    </div>
  );
}

// One row: index, title, blurb, all wrapped in a real link to the case study
// so it works without JS. showFrame renders the row's own image inline right
// below it (mobile / no hover / reduced motion path) instead of relying on
// the sticky panel.
function WorkRow({
  item,
  index,
  showFrame,
}: {
  item: WorkReelItem;
  index: number;
  showFrame: boolean;
}) {
  return (
    <li id={rowId(item.slug)} className="scroll-mt-24 border-b border-line py-8 first:pt-0 last:border-b-0 lg:py-10">
      <Link href={`/work/${item.slug}`} data-unit={`work:${item.slug}`} className="group block">
        <div className="flex items-baseline gap-4">
          <span className="mono text-sm text-mute">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="font-display text-2xl leading-tight text-fg transition-colors group-hover:text-accent sm:text-3xl">
            {item.title}
          </h3>
        </div>
        <p className="mt-3 max-w-[52ch] pl-[2.4rem] text-sm leading-relaxed text-dim sm:text-base">
          {item.blurb}
        </p>
        <span className="mono mt-4 inline-block pl-[2.4rem] text-xs text-accent">
          View case study <span aria-hidden="true">&rarr;</span>
        </span>
      </Link>
      {showFrame && (
        <Reveal className="mt-6 pl-0 sm:pl-[2.4rem]">
          <WorkFrame item={item} />
        </Reveal>
      )}
    </li>
  );
}

// Desktop sticky-swap panel: crossfades to whichever row is currently most
// in view. Native document scroll only -- position: sticky, no scroll-jacking,
// no virtual scroll, no wheel-event interception.
function StickyPanel({ activeItem }: { activeItem: WorkReelItem }) {
  return (
    <div className="sticky top-24">
      <AnimatePresence mode="wait">
        <motion.div
          key={activeItem.slug}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
        >
          <WorkFrame item={activeItem} priority />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Portfolio work, scroll-revealed like the B3 reference: a plain row list on
// the left, a sticky image on the right that swaps as the active row changes.
// Below lg, without a fine pointer, or under reduced motion, each row shows
// its own image inline instead -- no sticky panel, no JS dependency to reach
// the work.
export default function WorkReel() {
  const sticky = useWorkReelSticky();
  const activeRowId = useActiveRow(ROW_IDS);
  const activeItem = workReel.find((item) => rowId(item.slug) === activeRowId) ?? workReel[0];

  return (
    <section
      id="work"
      aria-labelledby="work-h"
      className="mx-auto w-full max-w-[1120px] scroll-mt-4 px-6 pt-16 pb-24 sm:pt-24 lg:px-8 lg:pb-32"
    >
      <WorkHead />
      <div className={sticky ? "mt-10 grid grid-cols-2 items-start gap-16" : "mt-10"}>
        <ol className="list-none pl-0">
          {workReel.map((item, i) => (
            <WorkRow key={item.slug} item={item} index={i} showFrame={!sticky} />
          ))}
        </ol>
        {sticky && <StickyPanel activeItem={activeItem} />}
      </div>
    </section>
  );
}
