"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
} from "framer-motion";
import React from "react";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  glowOpacity?: number;
  disabled?: boolean;
  dataUnit?: string;
}

export default function TiltCard({
  children,
  className = "",
  intensity = 8,
  glowOpacity = 0.18,
  disabled = false,
  dataUnit,
}: TiltCardProps) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  const springX = useSpring(rawX, { stiffness: 180, damping: 22, mass: 0.6 });
  const springY = useSpring(rawY, { stiffness: 180, damping: 22, mass: 0.6 });

  const rotateY = useTransform(springX, [-0.5, 0.5], [-intensity, intensity]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [intensity, -intensity]);

  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowOp = useMotionValue(0);

  const glowBg = useMotionTemplate`radial-gradient(220px circle at ${glowX}% ${glowY}%, color-mix(in oklab, var(--color-accent) 28%, transparent), transparent 65%)`;

  const reduce = useReducedMotion();

  if (reduce || disabled) {
    return (
      <div className={className} data-unit={dataUnit}>
        {children}
      </div>
    );
  }

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    rawX.set((e.clientX - r.left) / r.width - 0.5);
    rawY.set((e.clientY - r.top) / r.height - 0.5);
    glowX.set(((e.clientX - r.left) / r.width) * 100);
    glowY.set(((e.clientY - r.top) / r.height) * 100);
    glowOp.set(glowOpacity);
  }

  function onMouseLeave() {
    rawX.set(0);
    rawY.set(0);
    glowOp.set(0);
  }

  return (
    <div style={{ perspective: "900px" }}>
      <motion.div
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        data-unit={dataUnit}
        className={className}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
          position: "relative",
        }}
      >
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit]"
          style={{ opacity: glowOp, background: glowBg }}
        />
        <div style={{ transform: "translateZ(8px)", transformStyle: "preserve-3d" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
