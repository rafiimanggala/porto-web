"use client";

import { useRef, type CSSProperties } from "react";
import { EXTRUSION_SHADOW } from "./extrusion";
import { useExtrusionParallax } from "./useExtrusionParallax";
import s from "./home.module.css";

const SHADOW: CSSProperties = { textShadow: EXTRUSION_SHADOW };

// The page h1: the giant orange "Rafii" sign. Real DOM text (the extrusion is only
// text-shadow), with the rest of the name and role for screen readers and search.
export default function Wordmark({ style }: { style?: CSSProperties }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useExtrusionParallax(ref);

  return (
    <h1 id="home-h" ref={ref} className={`${s.wordmark} ${s.rise}`} style={{ ...SHADOW, ...style }}>
      Rafii
      <span className="sr-only"> Manggala, AI engineer</span>
    </h1>
  );
}
