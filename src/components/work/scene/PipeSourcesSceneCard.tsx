"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { ARTICLE, FEEDS, SCAN } from "./PipeKitData";
import { lerp } from "./PipeKitMath";
import { FEED_COLOR, TL } from "./PipeSourcesSceneData";
import { U, X, useLy } from "./PipeSourcesSceneKit";

/* The freshest record, grown into a card. It swaps in for the top row of the stack while both look the same, the
   old headline fades out on its own, and only then does each part of the card come in, one after another. Nothing is
   clipped sideways, so no glyph is ever cut in half. The sentences wrap to the full width of the card. */

const PAD = 10;
const TITLE_PAD = 11;
const REVEAL_DUR = 0.014;
const REVEAL_STEP = 0.006;

/* One part of the card: it fades in and rises a few units, between progress a and a + REVEAL_DUR. */
function Reveal({ p, at, className, style, children }: { p: MV; at: number; className?: string; style?: CSSProperties; children: ReactNode }) {
  const t = useSeg(p, at, at + REVEAL_DUR, easeOutCubic);
  const y = useTransform(t, (v) => U((1 - v) * 6));
  return (
    <motion.div style={{ opacity: t, y, ...style }} className={className}>
      {children}
    </motion.div>
  );
}

function Header({ p, at }: { p: MV; at: number }) {
  const { labelFs } = useLy();
  const feed = FEEDS[0];
  return (
    <Reveal p={p} at={at} style={{ fontSize: labelFs, lineHeight: U(12) }} className={`${MONO} flex items-center justify-between whitespace-nowrap`}>
      <span className="flex items-center gap-[6px] text-dim">
        <i className="inline-block h-[6px] w-[6px] rounded-full" style={{ background: FEED_COLOR[0] }} />
        {feed.label}, {ARTICLE.age}
      </span>
      <span className="rounded-[4px] bg-accent px-[5px] text-pastel-ink">
        {SCAN.picked} of {SCAN.fresh}
      </span>
    </Reveal>
  );
}

function Summary({ p }: { p: MV }) {
  const { bodyFs } = useLy();
  const start = TL.summary[0];
  const step = (TL.summary[1] - start - REVEAL_DUR) / (ARTICLE.summary.length - 1);
  return (
    <div style={{ marginTop: U(7), gap: U(5) }} className="flex flex-col">
      {ARTICLE.summary.map((line, i) => (
        <Reveal key={line} p={p} at={start + i * step} style={{ fontSize: bodyFs, lineHeight: "1.32" }} className="text-dim">
          {line}
        </Reveal>
      ))}
    </div>
  );
}

function OldTitle({ p }: { p: MV }) {
  const ly = useLy();
  const opacity = useTransform(p, [TL.oldTitleOut[0], TL.oldTitleOut[1]], [1, 0]);
  return (
    <motion.span
      style={{ opacity, left: U(8), width: U(ly.card.w - TITLE_PAD), height: U(ly.stack.h), fontSize: ly.rowFs }}
      className={`${MONO} absolute top-0 flex items-center leading-[1.05] text-fg`}
    >
      <span className="line-clamp-1 break-words">{ARTICLE.title}</span>
    </motion.span>
  );
}

export function ArticleCard({ p }: { p: MV }) {
  const { card, stack, labelFs } = useLy();
  const swap = useSeg(p, TL.cardSwap[0], TL.cardSwap[1]);
  const grow = useSeg(p, TL.cardGrow[0], TL.cardGrow[1], easeInOutCubic);
  const height = useTransform(grow, (t) => U(lerp(stack.h, card.h, t)));
  const at = TL.cardText[0];
  return (
    <motion.div
      aria-hidden
      style={{ opacity: swap, left: X(card.x - card.w / 2), top: U(card.y), width: X(card.w), height, borderRadius: U(3) }}
      className="absolute z-50 overflow-hidden border border-line bg-surface-2"
    >
      <i className="absolute inset-y-0 left-0" style={{ width: U(3), background: FEED_COLOR[0] }} />
      <OldTitle p={p} />
      <div style={{ left: U(PAD), right: U(PAD), top: U(PAD) }} className="absolute">
        <Header p={p} at={at} />
        <Reveal p={p} at={at + REVEAL_STEP} style={{ marginTop: U(6) }}>
          <h3 style={{ fontSize: U(14.5) }} className="t-h3 max-w-[92%] leading-[1.15]">
            {ARTICLE.title}
          </h3>
        </Reveal>
        <Reveal p={p} at={at + 2 * REVEAL_STEP} style={{ fontSize: labelFs, lineHeight: U(12), marginTop: U(6) }} className={`${MONO} truncate text-mute`}>
          {ARTICLE.link}
        </Reveal>
        <Summary p={p} />
      </div>
    </motion.div>
  );
}
