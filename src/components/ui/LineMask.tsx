"use client";

import { motion, useReducedMotion } from "framer-motion";

type Line = { text: string; className?: string };

export default function LineMask({ lines }: { lines: Line[] }) {
  const reduce = useReducedMotion();
  if (reduce) {
    return (
      <>
        {lines.map((l, i) => (
          <span key={i} className={`block ${l.className ?? ""}`}>
            {l.text}
          </span>
        ))}
      </>
    );
  }
  return (
    <>
      {lines.map((l, i) => (
        <span key={i} className="block overflow-hidden pb-[0.06em]">
          <motion.span
            className={`block ${l.className ?? ""}`}
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            {l.text}
          </motion.span>
        </span>
      ))}
    </>
  );
}
