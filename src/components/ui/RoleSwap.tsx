"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

// The role word in the nav. It swaps slowly enough to be read, pauses while the
// tab is hidden, and with reduced motion it stays on the first role. Screen
// readers get the whole list once instead of a word that changes underneath them.
export const ROLES = [
  "Full-stack engineer",
  "AI feature builder",
  "Automation engineer",
  "Shopify developer",
  "Live-system fixer",
] as const;

const HOLD_MS = 3800;

export default function RoleSwap({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "hidden") return;
      setIndex((i) => (i + 1) % ROLES.length);
    }, HOLD_MS);
    return () => window.clearInterval(id);
  }, [reduce]);

  return (
    <span className={`relative inline-flex h-5 items-center overflow-hidden ${className}`}>
      <span className="sr-only">{ROLES.join(", ")}</span>
      {/* Every role is stacked invisibly in one grid cell, so the widest by real
          pixels (not by letter count) reserves the width and nothing gets clipped. */}
      <span aria-hidden className="invisible inline-grid whitespace-nowrap">
        {ROLES.map((role) => (
          <span key={role} className="col-start-1 row-start-1">
            {role}
          </span>
        ))}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={ROLES[index]}
          aria-hidden
          className="absolute left-0 whitespace-nowrap"
          initial={reduce ? false : { y: 8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? { opacity: 0 } : { y: -8, opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.19, 1, 0.22, 1] }}
        >
          {ROLES[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
