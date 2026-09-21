"use client";

import { useEffect, useState } from "react";

const THRESHOLDS = Array.from({ length: 51 }, (_, i) => i / 50);

// The section with the most pixels on screen wins (first in list order on a tie).
function pickMostVisible(ids: readonly string[], visible: ReadonlyMap<string, number>): string | null {
  const best = ids.reduce<{ id: string | null; px: number }>(
    (acc, id) => {
      const px = visible.get(id) ?? 0;
      return px > acc.px ? { id, px } : acc;
    },
    { id: null, px: 0 },
  );
  return best.id;
}

// Which watched section is current, via IntersectionObserver. Starts on the first id
// so the server render and the first client render agree.
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const visible = new Map<string, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          visible.set(e.target.id, e.isIntersecting ? e.intersectionRect.height : 0);
        });
        const next = pickMostVisible(ids, visible);
        if (next) setActive(next);
      },
      { threshold: THRESHOLDS },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
