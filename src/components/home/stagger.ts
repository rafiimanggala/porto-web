import type { CSSProperties } from "react";

// Entrance order for the hero elements: read by the .rise class in home.module.css.
export function stagger(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}
