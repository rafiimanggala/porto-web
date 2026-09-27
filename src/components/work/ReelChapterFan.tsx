"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// Both the reel video and each chapter's own mini-loop play at this rate.
// Rafii's call (28 Sep, second round): "animasinya apa bisa di perlambat itu
// terlalu kencang" -- the *ReelPreview capture recipes pack a whole scene
// into ~1-1.5s (12 sweep + 2 hold frames at 12fps) so the reel could cycle
// through all of a case study's chapters in under 10 seconds; halving the
// rate doubles that without needing a new capture.
const PLAYBACK_RATE = 0.5;

// One chapter card's own mini animation: the SAME reel video as the main
// hub, but looped to just that chapter's own time slice (chapters are equal-
// length slices already -- see the module comment below), instead of a
// looping full-bleed <video> per case study, this reuses the ONE file
// already captured. Each capture recipe is already a self-contained 12-
// sweep + 2-hold mini-loop per scene (*ReelPreview.tsx), so isolating one
// slice and looping it plays back exactly like its own tiny clip, no new
// asset work needed.
//
// Rafii's call (28 Sep): "ganti card itu dengan animasi skill per bab nya,
// bukan hanya tulisan" -- the chip used to be a plain text label; now the
// label is a caption over a live preview of that bab's own moment in the
// case study.
//
// Only mounted while `active` (this card's overlay is the current front-of-
// stack one -- see WorkReel.tsx): a video element decodes even at opacity
// 0, and up to 7 of these exist per case study once every chapter has
// spawned, so unmounting them the instant they're not visible keeps only
// ONE case study's worth of extra decoders alive at a time instead of all 3.
// Memoized (review workflow, 28 Sep, high-severity finding): the parent
// re-renders every time its live-measured `scale` changes -- which happens
// on most scroll frames while the card is active, since the outer card's
// own scroll-driven scale transform (see ReelCard in WorkReel.tsx) keeps
// nudging hostRef's measured position -- and none of THIS component's props
// depend on `scale`, so without memo every mounted clip (up to 7 <video>
// elements) was re-rendering on every one of those ticks for no reason.
const ChapterClip = memo(function ChapterClip({
  src,
  segStart,
  segEnd,
  playing,
}: {
  src: string;
  segStart: number;
  segEnd: number;
  playing: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !playing) return;

    const seek = () => {
      el.currentTime = segStart;
      el.playbackRate = PLAYBACK_RATE;
      void el.play().catch(() => {});
    };
    if (el.readyState >= 1) seek();
    else el.addEventListener("loadedmetadata", seek, { once: true });

    const onTime = () => {
      if (el.currentTime >= segEnd) el.currentTime = segStart;
    };
    el.addEventListener("timeupdate", onTime);
    return () => {
      el.removeEventListener("loadedmetadata", seek);
      el.removeEventListener("timeupdate", onTime);
    };
  }, [playing, segStart, segEnd]);

  if (!playing) return <div className="absolute inset-0 bg-surface-1" aria-hidden="true" />;

  return (
    <video
      ref={ref}
      src={src}
      muted
      playsInline
      // "metadata", not "auto": each clip only ever plays its own short,
      // fixed segment (seeked immediately once metadata loads, see `seek`
      // above) and loops within it, so there's nothing to gain from the
      // browser eagerly buffering the rest of the file -- and up to 7 of
      // these mount at once, all pointing at the SAME source file, so
      // "auto" was multiplying real network/decode-buffer pressure for
      // zero playback benefit (review workflow, 28 Sep).
      preload="metadata"
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
});

// Homepage WorkReel cards for the multi-scene case studies (pipeline, mtm,
// education): the reel video plus one small "chapter card" per bab of its
// OWN scene sequence, spawning in as playback reaches that chapter, wired
// back to the video with a hand-drawn-style connector line. Ported from the
// reel-card-lab prototype once Rafii converged on it (27 Sep): sketch ->
// "per bab animasi nanti muncul satu" -> "spawn card baru terpisah di kanan
// bukan seperti itu" -> "apa bisa dibuat lebih smooth". See CoverCard in
// WorkReel.tsx for how this replaces the full-bleed treatment on cards that
// have a `chapters` array; cards without one (health-platform, spotter-eld,
// streak, ai-video-production) keep the original full-bleed card untouched.
//
// Chapters are equal-length slices of the video (see each *ReelPreview
// capture recipe: N chapters x 14 frames at a fixed fps), so the chapter
// index is just currentTime / (duration / chapterCount) -- no separate
// timing data needed, and it stays in sync at any playbackRate since
// currentTime is real video-time regardless of how fast it's playing.
//
// This component only renders the video, centered, plus the chapter cards
// cascading out to its right -- it does NOT clip itself. Rafii's call (28
// Sep, marked up a screenshot): the cards are meant to spawn OUTSIDE the
// main card's own edge, into the page's own gutter beside it, not squeeze
// to fit inside the panel. Containment (and the cross-card bleed that
// containment was originally added to fix) is handled one level up, by
// WHERE CoverCard mounts this component and how it gates its visibility --
// see the mount comment in WorkReel.tsx.
export default function ReelChapterFan({
  src,
  poster,
  imgWidth,
  imgHeight,
  chapters,
  active = true,
}: {
  src: string;
  poster: string;
  imgWidth: number;
  imgHeight: number;
  chapters: string[];
  active?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const [chapterIndex, setChapterIndex] = useState(0);
  const [duration, setDuration] = useState(0);
  const [scale, setScale] = useState(1);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    el.playbackRate = PLAYBACK_RATE;

    const onTime = () => {
      if (!el.duration) return;
      setDuration((prev) => (prev === el.duration ? prev : el.duration));
      const seg = el.duration / chapters.length;
      const idx = Math.min(chapters.length - 1, Math.floor(el.currentTime / seg));
      setChapterIndex((prev) => (prev === idx ? prev : idx));
    };
    el.addEventListener("timeupdate", onTime);
    return () => el.removeEventListener("timeupdate", onTime);
  }, [chapters.length]);

  // Play only while this card is the active/front one (review workflow, 28
  // Sep, high-severity finding): all 3 chapter-fan cards stay mounted at
  // once (see WorkReel.tsx's Reel), and `active` only ever gated the
  // overlay's CSS opacity, never the hub video itself, so up to 2 of the 3
  // kept decoding and looping in the background at all times, and their own
  // `timeupdate` handler above kept advancing `chapterIndex` for nobody to
  // see. Pausing (not unmounting, unlike ChapterClip below) keeps the video
  // ready to resume from wherever it left off the instant it's front again,
  // rather than restarting from the top every time.
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (active && !reduce) void el.play().catch(() => {});
    else el.pause();
  }, [active, reduce]);

  // Base numbers for the video box itself. The fan's own cascade (gap/
  // stepX/stepY/cardW below) is free to extend past this box now that
  // containment isn't this component's job any more -- see the module
  // comment above. Card size grew from a plain text pill (118x50) to fit an
  // actual mini video preview (Rafii, 28 Sep) at roughly the source's own
  // 862:588 aspect, so the clip inside doesn't look squeezed.
  const videoW = 240;
  const videoH = videoW * (imgHeight / imgWidth);
  const cardW = 136;
  const cardH = 92;
  const gap = 20; // space between the video's right edge and the first card
  const stepY = 72; // vertical offset between cascading cards
  const stepX = 8; // horizontal offset between cascading cards
  const MAX_SCALE = 1.65;

  // hostRef's own right edge is the cascade's anchor (the video sits
  // right-aligned against it -- see the JSX below), and now that the
  // cascade isn't contained by anything, what actually limits how big this
  // can grow is the real, live distance from THAT edge to the true right
  // side of the viewport (the sticky stage spans full width, so that's the
  // only hard boundary left) -- not hostRef's own width, which was the old
  // (wrong, for this design) budget. Caught live the moment this shipped:
  // scaling the video to fill its ~440-500px column pushed a 7-chapter
  // cascade way past MAX_SCALE's worth of room in the actual gutter (~200-
  // 230px measured at 1280px, not the column's own width), clipping
  // chapters 4+ clean off the visible screen.
  //
  // The vertical axis needs the same live-measured guard (review workflow,
  // 28 Sep): the sticky stage is exactly `100svh` tall (Reel in
  // WorkReel.tsx), so a tall enough cascade -- pipeline's 7 chapters, at a
  // wide-but-short browser window -- clips the top/bottom cards against
  // that boundary the same way an ungated horizontal cascade used to clip
  // against the viewport's right edge. `window.innerHeight` stands in for
  // the stage's own height the same way `window.innerWidth` already does
  // for its width.
  const EDGE_SAFETY = 24;
  const neededCascadeX = gap + stepX * (chapters.length - 1) + cardW;
  const neededCascadeYHalf = (stepY * (chapters.length - 1) + cardH) / 2;
  const measure = useCallback(() => {
    const host = hostRef.current;
    if (!host) return;
    const rect = host.getBoundingClientRect();
    const availX = window.innerWidth - rect.right - EDGE_SAFETY;
    const contentCenterY = rect.top + rect.height / 2;
    const availYHalf = Math.min(contentCenterY, window.innerHeight - contentCenterY) - EDGE_SAFETY;
    if (availX <= 0 || availYHalf <= 0) return;
    const next = Math.min(MAX_SCALE, Math.max(0.75, Math.min(availX / neededCascadeX, availYHalf / neededCascadeYHalf)));
    setScale((prev) => (Math.abs(prev - next) < 0.01 ? prev : next));
  }, [neededCascadeX, neededCascadeYHalf]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(host);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  // ResizeObserver only sees hostRef's own box size, not its on-screen
  // POSITION -- but the card this fan sits in rides its own scroll-driven
  // `y`/`rotate`/`scale` transform (see ReelCard in WorkReel.tsx), so
  // hostRef's true right edge keeps drifting as the user scrolls through
  // this exact card's own active window, well past the single snapshot the
  // effect above took at mount (when the card was still off-screen, at a
  // slightly different rotation). Caught live from Rafii's own screenshots
  // (28 Sep): the SAME card showed a clipped cascade at one scroll position
  // and a tiny, stuck-small video at another -- both symptoms of one stale
  // `scale` computed from wherever the card happened to sit at mount, never
  // refreshed against where it actually settles. Fix: re-measure every
  // frame while this card is the active one -- a manual start/stop rAF loop
  // (not framer-motion's useAnimationFrame) so the other 1-2 mounted-but-
  // inactive instances aren't even subscribed to the shared frame ticker,
  // rather than subscribed forever and no-op'ing on an `if` check every
  // frame (review workflow, 28 Sep).
  useEffect(() => {
    if (!active) return;
    let raf = 0;
    const tick = () => {
      measure();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, measure]);

  // Every position below is in ONE shared coordinate space: (0,0) at the
  // video box's own top-left, same space the SVG and the cards both use.
  const hubX = videoW;
  const hubY = videoH / 2;

  // Reduced-motion: show every chapter card already resting in place, no
  // spawn animation and no wire line drawing itself in -- same principle
  // CoverCard already applies to the video's autoPlay elsewhere.
  const visibleUpTo = reduce ? chapters.length - 1 : chapterIndex;
  const seg = duration / chapters.length;
  // Reduced-motion also skips each chapter's own mini-loop, same reasoning
  // as the main video's autoPlay gate above it.
  const clipsPlaying = active && !reduce;

  return (
    <div ref={hostRef} className="flex h-full w-full items-center justify-end">
      {/* One box at the video's own NATURAL size, scaled by a plain CSS
          transform with its origin pinned to the vertical-center/right-edge
          point -- the same point flex already anchors it to (`items-center
          justify-end` above). A transform never affects layout, so growing
          or shrinking `scale` here costs one composited paint, never a
          layout recalc -- unlike the previous two-box version, which wrote
          JS-computed `width`/`height` (a layout property) on an outer
          wrapper every time `scale` changed, forcing a synchronous reflow
          on the very same frame `measure()` above had just read geometry
          for (review workflow, 28 Sep, high-severity finding: the read-
          write-read cycle was forcing layout on most scroll frames while
          this card was active). */}
      <div
        className="relative shrink-0"
        style={{ width: videoW, height: videoH, transform: `scale(${scale})`, transformOrigin: "center right" }}
      >
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full rounded-2xl border border-line object-cover shadow-[0_16px_40px_rgba(0,0,0,0.35)]"
        />

        <svg className="absolute inset-0 overflow-visible" style={{ width: videoW, height: videoH }}>
          <AnimatePresence>
            {chapters.map((c, i) => {
              if (i > visibleUpTo) return null;
              const cardCenterY = hubY + stepY * (i - (chapters.length - 1) / 2);
              const x2 = hubX + gap + stepX * i;
              const len = Math.hypot(x2 - hubX, cardCenterY - hubY);
              return (
                <motion.line
                  key={c}
                  x1={hubX}
                  y1={hubY}
                  x2={x2}
                  y2={cardCenterY}
                  stroke="var(--color-line-strong)"
                  strokeWidth={1.5}
                  strokeDasharray={len}
                  initial={{ strokeDashoffset: reduce ? 0 : len }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                />
              );
            })}
          </AnimatePresence>
        </svg>

        <AnimatePresence>
          {chapters.map((c, i) => {
            if (i > visibleUpTo) return null;
            const cardLeft = hubX + gap + stepX * i;
            const cardCenterY = hubY + stepY * (i - (chapters.length - 1) / 2);
            return (
              <motion.div
                key={c}
                className="absolute overflow-hidden rounded-xl border border-line-strong bg-surface-1 shadow-[0_14px_30px_rgba(0,0,0,0.4)]"
                style={{ left: cardLeft, top: cardCenterY - cardH / 2, width: cardW, height: cardH }}
                initial={{ opacity: reduce ? 1 : 0, scale: reduce ? 1 : 0.72, x: reduce ? 0 : -14 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 26 }}
              >
                {seg > 0 && (
                  <ChapterClip src={src} segStart={i * seg} segEnd={(i + 1) * seg} playing={clipsPlaying} />
                )}
                {/* Label row lives at the TOP, not the bottom: each card
                    overlaps the NEXT one's top edge by design (the cascade
                    fans diagonally, cardH > stepY on purpose, see the
                    constants above), so a later card's own body always
                    covers an earlier card's bottom ~20px. A bottom caption
                    there was invisible on every card but the last one --
                    caught live in this exact screenshot check. */}
                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center gap-1.5 bg-gradient-to-b from-black/80 to-transparent px-1.5 pt-1.5 pb-3">
                  <span className="nums flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-sun text-[9px] font-semibold text-pastel-ink">
                    {i + 1}
                  </span>
                  <span className="mono truncate text-[9px] leading-none font-semibold tracking-[0.04em] text-white uppercase">
                    {c}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
