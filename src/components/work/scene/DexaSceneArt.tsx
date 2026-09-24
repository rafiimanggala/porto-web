import type { CSSProperties } from "react";
import { BODY, BODY_H, BODY_W, type RegionKey } from "./DexaSceneData";
import { BODY_PATHS } from "./DexaSceneBodyPaths";

/* Static drawings: the body-composition chart as printed on paper (ink on cream)
   and as extracted (flat colour on dark). Both use the same traced silhouette so
   the chart can lift out of the page and stay the same object. */

type Shape = { kind: "path"; d: string } | { kind: "ellipse"; cx: number; cy: number; rx: number; ry: number };

export type ShapeKey = RegionKey | "head";

const paths = (list: readonly string[]): readonly Shape[] => list.map((d) => ({ kind: "path", d }));

export const SHAPES: Readonly<Record<ShapeKey, readonly Shape[]>> = {
  head: paths(BODY_PATHS.head),
  trunk: paths(BODY_PATHS.trunk),
  arms: paths(BODY_PATHS.arms),
  legs: paths(BODY_PATHS.legs),
  vat: [{ kind: "ellipse", ...BODY.vat }],
};

type ShapeProps = { className?: string; style?: CSSProperties; strokeWidth?: number; dash?: string };

function ShapeView({ s, className, style, strokeWidth, dash }: { s: Shape } & ShapeProps) {
  const common = { className, style, strokeWidth, strokeDasharray: dash, strokeLinejoin: "round" as const, vectorEffect: "non-scaling-stroke" as const };
  if (s.kind === "path") return <path d={s.d} {...common} />;
  return <ellipse cx={s.cx} cy={s.cy} rx={s.rx} ry={s.ry} {...common} />;
}

export function Shapes({ id, ...props }: { id: ShapeKey } & ShapeProps) {
  return (
    <>
      {SHAPES[id].map((s, i) => (
        <ShapeView key={i} s={s} {...props} />
      ))}
    </>
  );
}

const CUT_LINES = [26, 66] as const;
const TICKS = [20, 40, 60, 80, 100, 120] as const;

export function PictureArt() {
  return (
    <g>
      <rect width={BODY_W} height={BODY_H} rx={5} className="fill-fg stroke-surface-1/40" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
      {CUT_LINES.map((y) => (
        <line key={y} x1={5} x2={95} y1={y} y2={y} strokeDasharray="3 2.5" strokeWidth={0.6} className="stroke-surface-1/45" vectorEffect="non-scaling-stroke" />
      ))}
      {TICKS.map((y) => (
        <line key={y} x1={2} x2={6} y1={y} y2={y} strokeWidth={0.6} className="stroke-surface-1/45" vectorEffect="non-scaling-stroke" />
      ))}
      {(["head", "arms", "legs", "trunk"] as const).map((id) => (
        <Shapes key={id} id={id} className="fill-surface-1/12 stroke-surface-1/60" strokeWidth={0.9} />
      ))}
      <Shapes id="vat" className="fill-none stroke-surface-1/60" strokeWidth={0.8} dash="2 1.6" />
    </g>
  );
}

export function VectorBackdrop() {
  return <rect width={BODY_W} height={BODY_H} rx={5} className="fill-surface-1 stroke-line-strong" strokeWidth={1} vectorEffect="non-scaling-stroke" />;
}

export function BarsChart({ w, h }: { w: number; h: number }) {
  const widths = [0.66, 0.46, 0.78, 0.38] as const;
  const pitch = (h - 8) / widths.length;
  return (
    <g>
      <rect width={w} height={h} rx={2} className="fill-none stroke-surface-1/40" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
      {widths.map((f, i) => (
        <rect key={i} x={6} y={5 + i * pitch} width={(w - 12) * f} height={pitch - 4} rx={1} className="fill-surface-1/55" />
      ))}
    </g>
  );
}

export function ColumnsChart({ w, h }: { w: number; h: number }) {
  const heights = [0.5, 0.82, 0.38, 0.66] as const;
  const pitch = (w - 8) / heights.length;
  return (
    <g>
      <rect width={w} height={h} rx={2} className="fill-none stroke-surface-1/40" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
      {heights.map((f, i) => (
        <rect key={i} x={5 + i * pitch} y={h - 5 - (h - 12) * f} width={pitch - 3} height={(h - 12) * f} rx={1} className="fill-surface-1/55" />
      ))}
    </g>
  );
}
