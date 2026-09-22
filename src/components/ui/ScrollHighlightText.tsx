"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import styles from "./scrollHighlight.module.css";

// Progressive word-by-word highlight: dim by default, each word brightens in
// turn as the paragraph scrolls up through the viewport. Same visual idea as
// the word-highlight on viens-la.com's closing line, rebuilt on native scroll
// (framer-motion's useScroll reads real scrollY) instead of their virtual
// scroll-jacked one -- document scroll behaves exactly as normal, this only
// maps a slice of it to per-word opacity.
function Word({
  children,
  index,
  total,
  progress,
}: {
  children: string;
  index: number;
  total: number;
  progress: MotionValue<number>;
}) {
  const start = index / total;
  const end = (index + 1) / total;
  const opacity = useTransform(progress, [start, end], [0.38, 1]);
  // The reduced-motion override lives in scrollHighlight.module.css, not a JS
  // branch: useReducedMotion() reads null on the server (no matchMedia there)
  // and the real value on the client, so a JS-computed opacity here would
  // render one value server-side and possibly a different one client-side --
  // a hydration mismatch this caught in testing. A CSS media query resolves
  // the same way regardless of SSR, so it can't mismatch.
  return (
    <motion.span style={{ opacity }} className={`inline-block ${styles.word}`}>
      {children}
      {" "}
    </motion.span>
  );
}

export default function ScrollHighlightText({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  // Progress runs 0 to 1 as the paragraph's top travels from 90% down the
  // viewport (just entering) to 35% down it (comfortably read) -- the words
  // finish lighting up before the paragraph reaches the middle of the screen.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.9", "start 0.35"] });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => (
        <Word key={`${word}-${i}`} index={i} total={words.length} progress={scrollYProgress}>
          {word}
        </Word>
      ))}
    </p>
  );
}
