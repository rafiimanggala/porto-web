import type { CSSProperties } from "react";
import { clamp01 } from "./MtmKitMath";

/* Stage geometry in container units, as calc() strings. */

export const STAGE_VARS = {
  "--H": "min(100cqh, 44rem)",
  "--pad": "clamp(8px, 2.4cqw, 16px)",
  "--gap": "clamp(6px, 1.5cqw, 10px)",
  "--hdr": "clamp(26px, calc(var(--H) * 0.044), 32px)",
  "--wire": "clamp(16px, calc(var(--H) * 0.04), 36px)",
  "--band": "clamp(30px, calc(var(--H) * 0.056), 38px)",
  "--colw": "calc((100cqw - 2 * var(--pad) - var(--gap)) / 2)",
  "--rowh": "calc((var(--H) - 2 * var(--pad) - var(--hdr) - 5 * var(--gap)) / 5)",
  "--zone": "calc(var(--rowh) - var(--band))",
  "--gtop": "calc(var(--pad) + var(--hdr) + var(--gap))",
  "--tw": "min(calc(100cqw - 2 * var(--pad)), 34rem)",
  "--tl": "calc((100cqw - var(--tw)) / 2)",
  "--tt": "calc(var(--pad) + var(--hdr) + var(--wire))",
  "--th": "calc(var(--H) - var(--pad) - var(--tt))",
  "--bodyh": "calc(var(--th) - var(--band) - var(--zone))",
} as CSSProperties;

/* Stage is at most 44rem tall, centred. */
export const STAGE_STYLE = { ...STAGE_VARS, top: "calc((100cqh - var(--H)) / 2)", height: "var(--H)" } as CSSProperties;

export const gridLeft = (col: number) => `calc(var(--pad) + ${col} * (var(--colw) + var(--gap)))`;
export const gridTop = (row: number) => `calc(var(--gtop) + ${row} * (var(--rowh) + var(--gap)))`;

/* Blend of two lengths. */
export const mixCalc = (a: string, b: string, e: number) => `calc(${(1 - e).toFixed(4)} * (${a}) + ${e.toFixed(4)} * (${b}))`;

/* Windows ended at progress v. */
export const countDone = (v: number, wins: readonly (readonly [number, number])[]) => wins.filter((w) => v >= w[1]).length;

export const hump = (t: number) => Math.sin(Math.PI * clamp01(t));

const quad = (a: number, c: number, b: number, t: number) => (1 - t) * (1 - t) * a + 2 * (1 - t) * t * c + t * t * b;
const quadSlope = (a: number, c: number, b: number, t: number) => 2 * (1 - t) * (c - a) + 2 * t * (b - c);

type Bez = readonly [number, number, number];

const PLANE_NATIVE = 30;

/* Plane position in percent and rotation. */
export function flightAt(x: Bez, y: Bez, t: number) {
  const heading = (Math.atan2(quadSlope(y[0], y[1], y[2], t), quadSlope(x[0], x[1], x[2], t)) * 180) / Math.PI;
  return { x: quad(x[0], x[1], x[2], t), y: quad(y[0], y[1], y[2], t), rot: heading + PLANE_NATIVE };
}
