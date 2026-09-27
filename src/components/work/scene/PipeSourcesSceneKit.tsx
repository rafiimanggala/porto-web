"use client";

import { createContext, useContext, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { SW, TALL, TALL_RATIO, WIDE, type Layout } from "./PipeSourcesSceneLayout";

/* Stage helpers. The stage is 360 units wide and keeps a fixed aspect for its layout; it defines --u as one stage
   unit, so every size below scales with the stage. X is a share of the width, Y a length in units, so a position is
   right in either layout. Labels never drop under 11px; the text of a list row never under 11px on desktop and 12px
   on a tall phone (see the layout). */

export const X = (x: number) => `${((x / SW) * 100).toFixed(3)}%`;
export const U = (n: number) => `calc(var(--u) * ${n.toFixed(2)})`;
export const Y = U;
export const FS = "max(11px, calc(var(--u) * 10))";
export const TAG_FS = "max(11.5px, calc(var(--u) * 7))";
export const LH = U(12);

export const TILE_SIZE = (n: number) => `calc(var(--u) * ${n})`;

/** Centre of a point of the stage in percent of the stage, for the shared node tiles. */
export const pctOf = (ly: Layout, x: number, y: number): [number, number] => [(x / SW) * 100, (y / ly.sh) * 100];

const LayoutCtx = createContext<Layout>(WIDE);

/** The layout of the stage this component is drawn in. */
export const useLy = () => useContext(LayoutCtx);

/* A tall box (a phone held upright) gets the tall layout; anything else the wide one. The stage renders wide until it
   has been measured, so a server render and a browser without layout support both show a complete stage. */
function useTall(box: RefObject<HTMLDivElement | null>) {
  const [tall, setTall] = useState(false);
  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const read = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0) setTall(height / width >= TALL_RATIO);
    };
    read();
    const watch = new ResizeObserver(read);
    watch.observe(el);
    return () => watch.disconnect();
  }, [box]);
  return tall;
}

export function Stage({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const ly = useTall(box) ? TALL : WIDE;
  return (
    <div ref={box} className="absolute inset-0 [container-type:size]">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 [container-type:size]"
        style={{
          width: `min(100cqw, calc(100cqh * ${SW} / ${ly.sh}))`,
          aspectRatio: `${SW} / ${ly.sh}`,
          ["--u" as string]: `calc(100cqw / ${SW})`,
        }}
      >
        <LayoutCtx.Provider value={ly}>{children}</LayoutCtx.Provider>
      </div>
    </div>
  );
}
