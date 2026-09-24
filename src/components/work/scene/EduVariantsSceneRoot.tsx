"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { BIG_TILE, CHIP, MID_X, ROOT_TILE, TL, colX } from "./EduVariantsSceneData";
import { useGeo } from "./EduVariantsSceneGeo";
import { BookIcon } from "./EduVariantsSceneIcons";
import { chipStart, clamp01, lerp } from "./EduVariantsSceneKit";

/* The subject tile. It starts big in the middle of the stage with a stack of
   sibling versions peeking out behind it, then lifts to the top and shrinks
   into the root of the whole tree as the variant chips leave it. */

const STACK_STEP = 6;
const STACK_TO = 9;

export function RootTile({ p }: { p: MV }) {
  const G = useGeo();
  const t = useSeg(p, TL.lift[0], TL.lift[1], easeInOutCubic);
  const fan = useSeg(p, TL.intro[0], TL.intro[1], easeOutCubic);
  const y = useTransform(t, (v) => lerp(G.bigY, G.rootY, v));
  const w = useTransform(t, (v) => lerp(BIG_TILE.w, ROOT_TILE.w, v));
  const h = useTransform(t, (v) => lerp(BIG_TILE.h, ROOT_TILE.h, v));
  const left = useTransform(w, (v) => -v / 2);
  const top = useTransform(h, (v) => -v / 2);
  const rx = useTransform(t, (v) => lerp(16, 8, v));
  const iconY = useTransform(t, (v) => lerp(-22, -11, v));
  const iconScale = useTransform(t, (v) => lerp(2.3, 0.85, v));
  const titleY = useTransform(t, (v) => lerp(32, 17, v));
  const titleSize = useTransform(t, (v) => lerp(28, 14, v));
  const subY = useTransform(h, (v) => v / 2 - 7);
  const subOpacity = useTransform(t, [0, 0.16], [1, 0]);
  const stack = useTransform(t, (v) => 1 - clamp01(v * 3));
  const step = useTransform(fan, (f) => lerp(STACK_STEP, STACK_TO, f));
  const back1X = useTransform([left, step], ([l, s]: number[]) => l + s);
  const back1Y = useTransform([top, step], ([tp, s]: number[]) => tp - s);
  const back2X = useTransform([left, step], ([l, s]: number[]) => l + s * 2);
  const back2Y = useTransform([top, step], ([tp, s]: number[]) => tp - s * 2);

  return (
    <motion.g style={{ x: MID_X, y }}>
      <motion.rect x={back2X} y={back2Y} width={w} height={h} rx={rx} style={{ opacity: stack }} className="fill-surface-1 stroke-line-strong" />
      <motion.rect x={back1X} y={back1Y} width={w} height={h} rx={rx} style={{ opacity: stack }} className="fill-surface-1 stroke-line-strong" />
      <motion.rect x={left} y={top} width={w} height={h} rx={rx} className="fill-surface-2 stroke-line-strong" />
      <motion.g style={{ y: iconY, scale: iconScale }}>
        <BookIcon />
      </motion.g>
      <motion.text
        x={0}
        y={titleY}
        textAnchor="middle"
        className="fill-fg"
        style={{ fontFamily: "var(--font-display)", fontWeight: 600, letterSpacing: "-0.02em", fontSize: titleSize }}
      >
        Biology
      </motion.text>
      <motion.text x={0} y={subY} textAnchor="middle" style={{ opacity: subOpacity }} fontSize={G.fs.s} className={`${MONO} fill-mute uppercase tracking-[0.12em]`}>
        one subject
      </motion.text>
    </motion.g>
  );
}

export function RootLink({ p, i }: { p: MV; i: number }) {
  const G = useGeo();
  const a = chipStart(i) + TL.chip.linkLag;
  const draw = useSeg(p, a, a + TL.chip.linkDur, easeOutCubic);
  const shown = useTransform(draw, (v) => (v > 0 ? 1 : 0));
  const from = G.rootY + ROOT_TILE.h / 2;
  const to = G.chipY - CHIP.h / 2;
  const lift = (to - from) * 0.55;
  const d = `M${MID_X} ${from}C${MID_X} ${from + lift} ${colX(i)} ${to - lift} ${colX(i)} ${to}`;
  return (
    <motion.path d={d} fill="none" strokeWidth={1.3} strokeLinecap="round" style={{ pathLength: draw, opacity: shown }} className="stroke-fg/35" />
  );
}
