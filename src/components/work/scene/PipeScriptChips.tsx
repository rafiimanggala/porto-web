"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { cubicPath } from "./PipeKitWire";
import { PHRASES, TL } from "./PipeScriptData";
import { BULB, PHRASE_AT } from "./PipeScriptLayout";
import { TXT, X, Y, fsChip, u } from "./PipeScriptKit";

/* The highlighted phrases lift off the article as chips and are eaten by the model (the bulb in the panel). */

const PATHS = PHRASES.map((_, i) => cubicPath(PHRASE_AT[i], BULB, { axis: "y", bend: 0.55 }));

function PhraseChip({ p, i }: { p: MV; i: number }) {
  const a = TL.lift.from + i * TL.lift.step;
  const t = useSeg(p, a, a + TL.lift.dur, easeInOutCubic);
  const left = useTransform(t, (v) => X(PATHS[i].at(v)[0]));
  const top = useTransform(t, (v) => Y(PATHS[i].at(v)[1]));
  const opacity = useTransform(t, [0, 0.06, 0.74, 1], [0, 1, 1, 0]);
  /* Never far below full size, so the text stays readable all the way into the model. */
  const scale = useTransform(t, [0, 0.12, 1], [0.94, 1.04, 0.86]);
  return (
    <motion.div aria-hidden style={{ left, top, opacity, scale }} className="absolute z-30 h-0 w-0">
      <span
        style={{ padding: `${u(2)} ${u(6)}`, fontSize: fsChip(TXT) }}
        className={`${MONO} absolute left-0 top-0 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-[4px] border border-accent bg-surface-2 text-fg shadow-[0_2px_8px_rgba(0,0,0,0.35)]`}
      >
        {PHRASES[i]}
      </span>
    </motion.div>
  );
}

export function PhraseChips({ p }: { p: MV }) {
  return (
    <>
      {PHRASES.map((ph, i) => (
        <PhraseChip key={ph} p={p} i={i} />
      ))}
    </>
  );
}
