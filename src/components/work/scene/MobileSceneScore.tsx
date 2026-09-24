"use client";

import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { SCORE, SCORE_GEO, type CardDef } from "./MobileSceneData";
import { cardBoxAt, collapseAt, easeLaunch, numInAt, numOutAt, scoreGeo, segAt } from "./MobileSceneMath";
import { Ring, Title, floorPx, u } from "./MobileSceneKit";

const SCORE_FRAC = SCORE / 100;

function useScoreStyles(p: MV, card: CardDef) {
  const m = useTransform(p, (v) => easeLaunch(segAt(v, card.move)));
  const geo = useTransform(p, (v) => scoreGeo(cardBoxAt(card, v), easeLaunch(segAt(v, card.move)), collapseAt(v, card.scroll)));
  const inOp = useTransform(m, numInAt);
  const outOp = useTransform(m, numOutAt);
  return {
    m,
    inOp,
    outOp,
    ring: {
      left: useTransform(geo, (g) => u(g.ring.x)),
      top: useTransform(geo, (g) => u(g.ring.y)),
      width: useTransform(geo, (g) => u(g.ring.d)),
      height: useTransform(geo, (g) => u(g.ring.d)),
    },
    numIn: {
      left: useTransform(geo, (g) => u(g.numIn.x)),
      top: useTransform(geo, (g) => u(g.numIn.y)),
      fontSize: useTransform(geo, (g) => u(g.numIn.font)),
    },
    numOut: {
      left: useTransform(geo, (g) => u(g.numOut.x)),
      top: useTransform(geo, (g) => u(g.numOut.y)),
      fontSize: useTransform(geo, (g) => u(g.numOut.font)),
    },
    label: {
      left: useTransform(geo, (g) => u(g.label.x)),
      top: useTransform(geo, (g) => u(g.label.y)),
      fontSize: useTransform(geo, (g) => `max(${u(g.label.font)}, ${floorPx(g.label.floor)})`),
    },
  };
}

export function ScoreBody({ p, card }: { p: MV; card: CardDef }) {
  const { m, inOp, outOp, ring, numIn, numOut, label } = useScoreStyles(p, card);
  const titleOp = useTransform(m, [0, 0.3], [1, 0], { clamp: true });
  const labelOp = useTransform(m, [0.85, 1], [0, 1], { clamp: true });
  return (
    <div className="absolute inset-0">
      <motion.div style={{ opacity: titleOp, left: u(SCORE_GEO.pad), top: u(SCORE_GEO.pad) }} className="absolute">
        <Title>Score</Title>
      </motion.div>
      <motion.div style={ring} className="absolute">
        <Ring frac={SCORE_FRAC} />
      </motion.div>
      <motion.span className="t-hero absolute" style={{ ...numIn, opacity: inOp, lineHeight: 1 }}>
        {SCORE}
      </motion.span>
      <motion.span className="t-hero absolute" style={{ ...numOut, opacity: outOp, lineHeight: 1 }}>
        {SCORE}
      </motion.span>
      <motion.span className="absolute whitespace-nowrap text-dim" style={{ ...label, opacity: labelOp, lineHeight: 1.1 }}>
        Longevity score
      </motion.span>
    </div>
  );
}
