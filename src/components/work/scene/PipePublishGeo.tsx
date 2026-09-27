"use client";

import { createContext, useContext, useEffect, useState, type RefObject } from "react";
import { TALL, TALL_FROM, WIDE, type Geo } from "./PipePublishData";

/* Which stage geometry the scene uses. Components read it with useGeo(); the scene picks it from the shape of the box it is
   drawn in, so a phone gets the tall stage and a desktop column keeps the wide one. */

const GeoContext = createContext<Geo>(WIDE);
export const GeoProvider = GeoContext.Provider;
export const useGeo = () => useContext(GeoContext);

/** TALL when the box is at least TALL_FROM times taller than wide, else WIDE. Starts WIDE, so the first paint matches the server. */
export function useBoxGeo(ref: RefObject<HTMLElement | null>): Geo {
  const [tall, setTall] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const read = () => {
      const { width, height } = el.getBoundingClientRect();
      if (width > 0) setTall(height / width >= TALL_FROM);
    };
    read();
    const watch = new ResizeObserver(read);
    watch.observe(el);
    return () => watch.disconnect();
  }, [ref]);
  return tall ? TALL : WIDE;
}
