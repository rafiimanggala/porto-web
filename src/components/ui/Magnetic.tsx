"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { useRef } from "react";

// Element drifts toward the cursor within a radius, springs back on leave.
export default function Magnetic({
  children,
  className,
  radius = 0.35,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 150, damping: 15, mass: 0.1 });
  const sy = useSpring(y, { stiffness: 150, damping: 15, mass: 0.1 });

  if (reduce) return <div className={className}>{children}</div>;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * radius);
    y.set((e.clientY - (r.top + r.height / 2)) * radius);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={reset}
    >
      {children}
    </motion.div>
  );
}
