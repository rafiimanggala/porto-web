import { useSeg, type MV } from "./HealthSceneParts";
import { clamp01, keyframes, lerp, segAt } from "./MtmKitMath";

export { clamp01, keyframes, lerp, segAt };

export type Win = readonly [number, number];
type Ease = (t: number) => number;

/** Eased 0..1 progress of the window `w` at value v. */
export const at = (v: number, w: Win, ease?: Ease) => segAt(v, w[0], w[1], ease);

export const useWin = (p: MV, w: Win, ease?: Ease) => useSeg(p, w[0], w[1], ease);

export const pct = (v: number) => `${v.toFixed(3)}%`;

/** 0 before a, up to 1 at b, back to 0 at c. */
export const tent = (v: number, a: number, b: number, c: number) => keyframes(v, [a, b, c], [0, 1, 0], (t) => t);

/** Clip that reveals the left `t` share of a box. */
export const revealLeft = (t: number) => `inset(0 ${pct(100 - clamp01(t) * 100)} 0 0)`;

/** Clip that keeps only what lies right of the `t` share of a box. */
export const keepRight = (t: number) => `inset(0 0 0 ${pct(clamp01(t) * 100)})`;
