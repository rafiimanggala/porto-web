"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

const GLYPHS = "!<>-_\\/[]{}=+*^?#________";

// Decode-on-reveal text effect (terminal signature). Runs once when in view.
export default function Scramble({
  text,
  className,
  as: Tag = "span",
  speed = 28,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "h3" | "p";
  speed?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const [out, setOut] = useState(reduce ? text : "");
  const started = useRef(false);

  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const chars = text.split("");
      const start = chars.map(() => Math.floor(Math.random() * 12));
      const end = chars.map((_, i) => start[i] + 8 + Math.floor(i * 1.4));
      let frame = 0;
      let raf = 0;
      const tick = () => {
        let done = 0;
        const next = chars
          .map((c, i) => {
            if (c === " ") return " ";
            if (frame >= end[i]) {
              done++;
              return c;
            }
            if (frame < start[i]) return "";
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("");
        setOut(next);
        frame++;
        if (done < chars.length) raf = window.setTimeout(tick, speed);
      };
      tick();
      return () => window.clearTimeout(raf);
    };

    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && run()),
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text, reduce, speed]);

  return (
    <Tag ref={ref as never} className={className} aria-label={text}>
      <span aria-hidden="true">{out || " "}</span>
    </Tag>
  );
}
