"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { VIEW_H, VIEW_W } from "./EduVariantsSceneData";

/* Vertical geometry of the stage. The art is authored in a 360 x 430 box, which
   fits a desktop stage. A tall, narrow phone stage would leave dead bands above
   and below it, so every vertical position is multiplied by a stretch factor
   `sy` measured from the real box. Sizes (tiles, chips, text) never stretch,
   only the gaps between them do, so nothing is distorted. */

export type FontSizes = { s: number; m: number; l: number };

export type Geo = {
  sy: number;
  viewH: number;
  fs: FontSizes;
  bigY: number;
  rootY: number;
  chipY: number;
  treeTop: number;
  treeGap: number;
  countY: number;
  connY: number;
  engineY: number;
  resultsY: number;
  cardY: number;
  cardH: number;
  slotTops: readonly number[];
  subjectTops: readonly number[];
  bioCy: number;
  wipeTop: number;
};

const FS_WIDE: FontSizes = { s: 11, m: 12, l: 13 };
const FS_TALL: FontSizes = { s: 12.4, m: 13.2, l: 14 };
const SY_MAX = 1.4;
const SY_STEP = 0.05;

const round1 = (v: number) => Math.round(v * 10) / 10;

export function makeGeo(sy: number, narrow = false): Geo {
  const y = (v: number) => round1(v * sy);
  return {
    sy,
    viewH: y(VIEW_H),
    fs: narrow ? FS_TALL : FS_WIDE,
    bigY: y(212),
    rootY: y(33),
    chipY: y(96),
    treeTop: y(126),
    treeGap: y(24),
    countY: y(246),
    connY: y(268),
    engineY: y(322),
    resultsY: y(376),
    cardY: y(132),
    cardH: y(278),
    slotTops: [206, 250, 294].map(y),
    subjectTops: [344, 374].map(y),
    bioCy: y(184),
    wipeTop: y(100),
  };
}

export const GeoContext = createContext<Geo>(makeGeo(1));
export const useGeo = () => useContext(GeoContext);

/* The stretch that lets the art fill a box of the measured aspect, snapped down
   to a coarse step so a resize does not rebuild the stage on every pixel. */
export function stretchFor(width: number, height: number) {
  if (width <= 0 || height <= 0) return 1;
  const fit = (height / width) * (VIEW_W / VIEW_H);
  const snapped = Math.round(Math.floor(fit / SY_STEP) * SY_STEP * 100) / 100;
  return Math.min(SY_MAX, Math.max(1, snapped));
}

type Measure = { sy: number; narrow: boolean };
const NARROW_BELOW = 480;

/* A callback ref for the stage svg: it reports the stretch and whether the box
   is phone-sized (small text is then drawn larger) for its own size. */
export function useStretch() {
  const [m, setM] = useState<Measure>({ sy: 1, narrow: false });
  const ref = useCallback((el: SVGSVGElement | null) => {
    if (!el) return undefined;
    const read = () => {
      const r = el.getBoundingClientRect();
      const next = { sy: stretchFor(r.width, r.height), narrow: r.width > 0 && r.width < NARROW_BELOW };
      setM((prev) => (prev.sy === next.sy && prev.narrow === next.narrow ? prev : next));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return { ...m, ref };
}
