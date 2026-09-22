"use client";

import { useEffect, useState } from "react";

// Which row is "active" while scrolling a short list, via IntersectionObserver
// -- same primitive as useActiveSection.ts, different rule. useActiveSection
// picks whichever watched element has the most raw visible pixels, which is
// right for full-height page sections (only one is ever really on screen at
// once) but wrong here: several short rows can be on screen together, and the
// tallest one would win regardless of scroll position. This instead watches a
// thin horizontal band across the vertical center of the viewport and treats
// whichever row is crossing it as active, so it tracks scroll position rather
// than raw visible area.
export function useActiveRow(ids: readonly string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.find((e) => e.isIntersecting);
        if (hit) setActive(hit.target.id);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [ids]);

  return active;
}
