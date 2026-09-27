import { useId } from "react";
import { fabricColor, type Fabric, type Weave } from "./MtmKitData";
import type { Collar } from "./MtmPhoneSceneData";

/* A tailored shirt drawn flat in the colour and weave of its fabric, with the collar of its style. Fills its parent. */

const BODY = "M-4.4 -9.6L-8.4 -8.4L-12.6 3.4L-9.6 5.2L-6.9 -0.6V9.8H6.9V-0.6L9.6 5.2L12.6 3.4L8.4 -8.4L4.4 -9.6L0 -5.8Z";
const CUFF = "M-11.4 0.1L-8.1 1.4";

const FLAP: Readonly<Record<Collar, string>> = {
  Classic: "M-4.4 -9.6L0 -5.8L-2.8 -2.8L-6.4 -6.4Z",
  Cutaway: "M-4.4 -9.6L0 -5.8L-4.8 -4.2L-7.8 -7.8Z",
  "Button-down": "M-4.4 -9.6L0 -5.8L-2.8 -2.8L-6.4 -6.4Z",
};

const TIP: Readonly<Record<Collar, readonly [number, number] | null>> = {
  Classic: null,
  Cutaway: null,
  "Button-down": [-5.3, -5.8],
};

const WEAVE: Readonly<Record<Weave, { size: number; d: string; width: number }>> = {
  basket: { size: 2.4, d: "M0 1.2H2.4M1.2 0V2.4", width: 0.4 },
  plain: { size: 1.1, d: "M0 0.55H1.1M0.55 0V1.1", width: 0.22 },
  twill: { size: 1.6, d: "M-0.4 0.4L0.4 -0.4M0 1.6L1.6 0M1.2 2L2 1.2", width: 0.4 },
  slub: { size: 1.8, d: "M0 0.9H1.8M1.4 0V1.8", width: 0.3 },
};

const INK = "var(--color-fg)";
const stroke = { fill: "none", stroke: INK, strokeWidth: 1, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const mirror = "scale(-1 1)";

export function GarmentTile({ fabric, collar }: { fabric: Fabric; collar: Collar }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const w = WEAVE[fabric.weave];
  const cloth = fabricColor(fabric);
  const flap = `color-mix(in oklab, ${cloth}, ${INK} 24%)`;
  const tip = TIP[collar];
  return (
    <svg aria-hidden viewBox="-14 -12 28 24" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full">
      <defs>
        <pattern id={id} width={w.size} height={w.size} patternUnits="userSpaceOnUse">
          <path d={w.d} stroke="var(--color-bg)" strokeOpacity="0.22" strokeWidth={w.width} fill="none" />
        </pattern>
      </defs>
      <path d={BODY} fill={cloth} />
      <path d={BODY} fill={`url(#${id})`} />
      {[false, true].map((flip) => (
        <g key={String(flip)} transform={flip ? mirror : undefined}>
          <path d={FLAP[collar]} {...stroke} fill={flap} />
          <path d={CUFF} {...stroke} strokeWidth={0.8} />
          {tip ? <circle cx={tip[0]} cy={tip[1]} r="0.55" fill={INK} /> : null}
        </g>
      ))}
      <path d={BODY} {...stroke} />
      <path d="M0 -5.8V9.8" {...stroke} strokeWidth={0.7} strokeDasharray="0.1 3.2" />
    </svg>
  );
}
