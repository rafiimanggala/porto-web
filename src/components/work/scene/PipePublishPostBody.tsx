"use client";

import { motion, useTransform } from "framer-motion";
import { easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { clamp01 } from "./PipeKitMath";
import { sheenAt, waitPulseAt } from "./PipePublishMath";
import { POSTS, RATIO, TL } from "./PipePublishData";
import { useGeo } from "./PipePublishGeo";
import { Counter, MONO_TXT, tagText } from "./PipePublishKit";
import { Thumb } from "./PipePublishThumb";

/* The mini post under each posting node: an empty post waiting for media (a slot for the 9:16 video, caption lines and tag
   chips, all outlined), then the video lands, the caption comes in word by word, the tags pop and a progress bar runs until
   the post is live. The outlines leave before the real parts arrive, in the same places. */

/* Tint follows the tag's place in the list, not the platform, so the two previews are the same picture. */
const TAG_TINT = ["var(--color-sky)", "var(--color-sun)"] as const;
const DONE_SPAN = 0.02;
/* The caption is 12px on the tall (phone) stage, which has the height for it, and 10px at the least on the wide one. */
const CAPTION_TALL = "text-[clamp(12px,3.3cqw,15px)]";
const CAPTION_WIDE = "text-[clamp(10px,2.9cqw,15px)]";
const SKELETON_LINES = ["92%", "78%", "46%"] as const;

function Words({ text, p, a, b }: { text: string; p: MV; a: number; b: number }) {
  const words = text.split(" ");
  return (
    <>
      {words.map((w, k) => (
        <Word key={`${w}-${k}`} text={w} p={p} a={a + ((b - a) * k) / words.length} b={a + ((b - a) * (k + 1)) / words.length} />
      ))}
    </>
  );
}

function Word({ text, p, a, b }: { text: string; p: MV; a: number; b: number }) {
  const t = useSeg(p, a, b);
  const y = useTransform(t, (v) => (1 - v) * 3);
  return (
    <>
      <motion.span style={{ opacity: t, y }} className="inline-block">
        {text}
      </motion.span>{" "}
    </>
  );
}

/* The post before its media arrives: the same slots as the live post, drawn as outlines. */
/* A soft light that scans the empty post and a label that breathes, both tied to scroll, so the lower half reads as waiting
   on purpose while the sheet and the upload do the talking. The two posts are half a lap apart. */
function Sheen({ i, p }: { i: number; p: MV }) {
  const x = useTransform(p, (v) => `${(sheenAt(v, i) * 340 - 110).toFixed(1)}%`);
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
      <motion.i style={{ x }} className="absolute inset-y-0 left-0 w-[24%] bg-[linear-gradient(100deg,transparent,color-mix(in_oklab,var(--color-fg)_9%,transparent),transparent)]" />
    </span>
  );
}

function WaitingLabel({ i, p }: { i: number; p: MV }) {
  const opacity = useTransform(p, (v) => waitPulseAt(v, i));
  return (
    <motion.span style={{ opacity }} className={`${MONO_TXT} mt-auto block leading-none text-mute`}>
      waiting for media
    </motion.span>
  );
}

function Ghost({ i, p, dashed }: { i: number; p: MV; dashed: MV }) {
  const { CAPTION_ROW, cqh, tall } = useGeo();
  return (
    <motion.div aria-hidden style={{ opacity: dashed }} className="absolute inset-0 flex flex-col gap-[5px] p-1.5">
      <Sheen i={i} p={p} />
      <div className="flex gap-1.5" style={{ height: cqh(CAPTION_ROW) }}>
        <div className={`${MONO_TXT} grid h-full shrink-0 place-items-center rounded-[4px] border border-dashed border-line-strong leading-none text-mute`} style={{ aspectRatio: "9 / 16" }}>
          {RATIO}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-[7px] pt-[3px]">
          {SKELETON_LINES.map((w) => (
            <i key={w} className="block h-[5px] rounded-full bg-line" style={{ width: w }} />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-[3px]">
        {POSTS[i].tags.map((tag) => (
          <i key={tag} className={`${tagText(tall)} block rounded-[4px] border border-dashed border-line-strong leading-[1.4]`} style={{ width: `${(tag.length * 0.52 + 0.8).toFixed(1)}em`, height: "1.4em" }} />
        ))}
      </div>
      <WaitingLabel i={i} p={p} />
    </motion.div>
  );
}

function Slot({ i, p }: { i: number; p: MV }) {
  const [a, b] = TL.slot[i];
  const live = useSeg(p, a - 0.03, a);
  const pop = useSeg(p, a, b, easeOutBack);
  const opacity = useSeg(p, a, a + 0.01);
  const scale = useTransform(pop, (v) => 0.6 + 0.4 * v);
  return (
    <div className="relative h-full shrink-0" style={{ aspectRatio: "9 / 16" }}>
      <motion.i aria-hidden style={{ opacity: live }} className="absolute inset-0 rounded-[4px] border border-dashed border-line-strong" />
      <motion.div style={{ scale, opacity }} className="absolute inset-0 overflow-hidden rounded-[4px] border border-line-strong">
        <Thumb className="absolute inset-0 h-full w-full" />
      </motion.div>
    </div>
  );
}

function Tag({ tag, i, k, p }: { tag: string; i: number; k: number; p: MV }) {
  const { tall } = useGeo();
  const [a, b] = TL.tags[i];
  const from = a + ((b - a) * k) / 4;
  const t = useSeg(p, from, from + 0.014, easeOutBack);
  const scale = useTransform(t, (v) => 0.7 + 0.3 * v);
  const opacity = useTransform(t, (v) => clamp01(v * 2));
  return (
    <motion.span
      style={{ scale, opacity, background: `color-mix(in oklab, ${TAG_TINT[k % TAG_TINT.length]} 38%, transparent)` }}
      className={`${tagText(tall)} rounded-[4px] px-1 leading-[1.4] text-fg`}
    >
      {tag}
    </motion.span>
  );
}

function Progress({ i, p }: { i: number; p: MV }) {
  const [a, b] = TL.post[i];
  const level = useSeg(p, a, b);
  const ok = useSeg(p, TL.tick[i], TL.tick[i] + DONE_SPAN);
  const show = useSeg(p, a - 0.014, a);
  const roll = useTransform(ok, (v) => `${(-v * 50).toFixed(2)}%`);
  const text = (v: number) => `posting ${Math.round(v * 100)}%`;
  return (
    <motion.div style={{ opacity: show }} className="mt-auto flex items-center gap-1.5">
      <span className="relative h-[5px] flex-1 overflow-hidden rounded-full bg-line-strong">
        <motion.i style={{ scaleX: level }} className="absolute inset-0 origin-left bg-accent" />
        <motion.i style={{ opacity: ok }} className="absolute inset-0 bg-mint" />
      </span>
      <span className={`${MONO_TXT} block h-[1.4em] w-[7.6em] overflow-hidden leading-[1.4em]`}>
        <motion.span style={{ y: roll }} className="flex flex-col">
          <Counter p={level} of={text} className="block text-dim" />
          <span className="block text-fg">posted</span>
        </motion.span>
      </span>
    </motion.div>
  );
}

export default function PostBody({ i, p }: { i: number; p: MV }) {
  const { H, PT, POST_CARD, CAPTION_ROW, cqh, xPct, tall } = useGeo();
  const post = POSTS[i];
  const live = useSeg(p, TL.slot[i][0] - 0.03, TL.slot[i][0]);
  const fold = useSeg(p, TL.fold[0], TL.fold[1]);
  const opacity = useTransform(fold, (v) => 1 - clamp01(v * 1.8));
  const clip = useTransform(fold, (v) => `inset(0 0 ${(v * 100).toFixed(2)}% 0)`);
  const dashed = useTransform(live, (v) => 1 - v);
  const [a, b] = TL.words[i];
  return (
    <motion.div
      style={{ left: xPct(PT.posts[i][0] - POST_CARD.w / 2), top: `${(POST_CARD.top / H) * 100}%`, width: xPct(POST_CARD.w), height: cqh(H - POST_CARD.top - 1), opacity, clipPath: clip }}
      className="absolute z-20"
    >
      <motion.i aria-hidden style={{ opacity: dashed }} className="absolute inset-0 rounded-lg border border-dashed border-line-strong" />
      <motion.i aria-hidden style={{ opacity: live }} className="absolute inset-0 rounded-lg border border-line-strong bg-surface-1" />
      <Ghost i={i} p={p} dashed={dashed} />
      <div className="relative flex h-full flex-col gap-[5px] p-1.5">
        <div className="flex gap-1.5" style={{ height: cqh(CAPTION_ROW) }}>
          <Slot i={i} p={p} />
          <p className={`min-w-0 flex-1 leading-[1.25] text-fg ${tall ? CAPTION_TALL : CAPTION_WIDE}`}>
            <Words text={post.caption} p={p} a={a} b={b} />
          </p>
        </div>
        <div className="flex flex-wrap gap-[3px]">
          {post.tags.map((tag, k) => (
            <Tag key={tag} tag={tag} i={i} k={k} p={p} />
          ))}
        </div>
        <Progress i={i} p={p} />
      </div>
    </motion.div>
  );
}
