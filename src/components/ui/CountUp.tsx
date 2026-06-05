"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

// Animate a numeric value on scroll-into-view. Keeps any prefix/suffix (e.g. "~", "+", "K").
export default function CountUp({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);
  const ran = useRef(false);

  const match = value.match(/(\d[\d,.]*)/);
  const num = match ? parseFloat(match[1].replace(/,/g, "")) : null;

  useEffect(() => {
    if (reduce || num === null || !match) return;
    const el = ref.current;
    if (!el) return;
    const prefix = value.slice(0, match.index);
    const suffix = value.slice((match.index ?? 0) + match[1].length);

    const animate = () => {
      if (ran.current) return;
      ran.current = true;
      const dur = 1100;
      const t0 = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        const cur = Math.round(num * eased);
        setShown(`${prefix}${cur.toLocaleString()}${suffix}`);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (e) => e.forEach((x) => x.isIntersecting && animate()),
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, num, reduce, match]);

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  );
}
