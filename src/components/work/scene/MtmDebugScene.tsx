"use client";

import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { BYTES_TL, CAPTIONS, CHAPTERS, FONT, PUSH_GATE, READOUT, SHIP } from "./MtmDebugSceneData";
import Visual from "./MtmDebugSceneShell";

/* Debug scene: four small cases, read like an instrument panel. A redirect that bounced because three copies of a helper
   fought each other, a menu with no fallback, a font size that only the browser got wrong, and the push that had a way back. */

const BYTES_FOUND_AT = BYTES_TL.live[0] + 0.052;

/* The readout follows the button: it says ready once the sweep has crossed the whole button, not when it starts. */
const READY_AT = SHIP.gate[1] - 0.004;

function pushState(v: number) {
  if (v < READY_AT) return `push ${PUSH_GATE.waiting}`;
  if (v < SHIP.push[0]) return `push ${PUSH_GATE.ready}`;
  return v < SHIP.push[1] ? "pushing" : PUSH_GATE.pushed;
}

function readoutText(v: number) {
  if (v < CHAPTERS[1]) return `helper copies ${READOUT.copies(v)}`;
  if (v < CHAPTERS[2]) return `menu options ${READOUT.options(v)}`;
  if (v < CHAPTERS[3]) return `browser ${FONT.seen}, bytes ${v >= BYTES_FOUND_AT ? FONT.live : "?"}`;
  return pushState(v);
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutText);
  return <motion.span className="text-[11px] text-fg">{text}</motion.span>;
}

export default function MtmDebugScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
    />
  );
}
