"use client";

import type { ReactNode } from "react";
import { useRef } from "react";

// Card whose accent spotlight tracks the cursor (CSS vars --mx/--my).
export default function SpotlightCard({
  children,
  className = "",
  dataUnit,
}: {
  children: ReactNode;
  className?: string;
  dataUnit?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      data-unit={dataUnit}
      className={`card spot ${className}`}
    >
      {children}
    </div>
  );
}
