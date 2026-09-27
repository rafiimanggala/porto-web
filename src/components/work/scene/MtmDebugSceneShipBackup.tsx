"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { FOLDERS, PUSH, SHIP } from "./MtmDebugSceneData";
import { CODE, Roll, Typed } from "./MtmDebugSceneKit";
import { at, tent, useWin } from "./MtmDebugSceneMath";
import { Bar, ROW_H, Station } from "./MtmDebugSceneShipParts";
import { MtmGlyph } from "./MtmKitGlyphs";

/* The backup station: the seven theme folders drop into the archive one after another. They do not fit one line of the text
   column, so they sit on two rows and every chip is visible from the start. Each chip slides to the left edge of the text
   column along its own row, shrinking and fading, and is gone before it reaches the icon rail, so nothing is ever clipped
   by the rail. The archive icon bumps as each chip lands. */

const CHIP_PAD = 10;
const CHIP_GAP = 3;
/* A chip's left edge ends this many px left of the text column: inside the column padding, short of the rail border. */
const EXIT_PX = 6;
const CHIP_SHRINK = 0.5;
const GULP = 0.12;
const FADE = [0.55, 0.95] as const;
const SHRINK = [0.4, 1] as const;
const [RUN_A, RUN_B] = SHIP.chips;
/* Seven chips share the run, so each hop is a shorter share of it than when there were four (0.4): the hops still overlap but the
   last one ends with the run, and the archive bump is as wide as the gap between two landings, so every chip gets its own bump. */
const HOP_SHARE = 0.3;
const HOP_LEN = (RUN_B - RUN_A) * HOP_SHARE;
const HOP_STEP = (RUN_B - RUN_A - HOP_LEN) / (FOLDERS.length - 1);
const BUMP = Math.min(0.006, HOP_STEP * 0.5);

/* The first row holds the first three folders, the second row the rest, both in archive order. */
const ROW_SPLIT = Math.floor(FOLDERS.length / 2);

/* Travel of each chip, as characters of the 10px mono face plus fixed px, so no width has to be measured:
   the chips in front of it on its own row, their padding and gaps, and the stop short of the rail. */
const HOPS = FOLDERS.map((name, i) => {
  const ahead = FOLDERS.slice(i < ROW_SPLIT ? 0 : ROW_SPLIT, i);
  return {
    name,
    ch: ahead.reduce((sum, f) => sum + f.length, 0),
    px: ahead.length * (CHIP_PAD + CHIP_GAP) + EXIT_PX,
    start: RUN_A + i * HOP_STEP,
  };
});
const HOP_ROWS = [HOPS.slice(0, ROW_SPLIT), HOPS.slice(ROW_SPLIT)];

function FolderChip({ p, hop }: { p: MV; hop: (typeof HOPS)[number] }) {
  const u = useWin(p, [hop.start, hop.start + HOP_LEN]);
  const x = useTransform(u, (t) => {
    return `calc(${(-t * hop.ch).toFixed(3)}ch + ${(-t * hop.px).toFixed(2)}px)`;
  });
  const opacity = useTransform(u, (t) => 1 - at(t, FADE));
  const scale = useTransform(u, (t) => 1 - CHIP_SHRINK * at(t, SHRINK));
  return (
    <motion.span
      style={{ x, opacity, scale }}
      className={`${MONO} block origin-left rounded-[3px] border border-line-strong bg-surface-1 px-1 text-[10px] leading-4 text-dim`}
    >
      {hop.name}
    </motion.span>
  );
}

const landing = (v: number, start: number) => {
  const swallowed = start + HOP_LEN * FADE[1];
  return tent(v, swallowed - BUMP, swallowed, swallowed + BUMP * 1.15);
};

/* The archive icon swells a little when a chip is swallowed, at the moment that chip has faded out. */
function Archive({ p }: { p: MV }) {
  const scale = useTransform(p, (v) => 1 + GULP * Math.max(...HOPS.map((h) => landing(v, h.start))));
  return (
    <motion.span style={{ scale }} className="grid place-items-center">
      <MtmGlyph name="archive" size={26} />
    </motion.span>
  );
}

export default function BackupRow({ p }: { p: MV }) {
  const [a, b] = SHIP.backup;
  const name = useWin(p, [a + 0.004, a + 0.028]);
  const run = useWin(p, SHIP.chips);
  const done = useWin(p, [b - 0.008, b]);
  return (
    <Station h={ROW_H.backup} glyph={<Archive p={p} />} done={done}>
      <div className="flex h-[15px] items-center justify-between">
        <Typed t={name} className={`${CODE} text-fg`}>
          {PUSH.backup}
        </Typed>
        <Roll t={done} h={15} className={CODE} a={<span className="text-mute">zipping</span>} b={<span className="text-mint">done</span>} />
      </div>
      <div className="mt-2 flex flex-col" style={{ gap: CHIP_GAP }}>
        {HOP_ROWS.map((row) => (
          <div key={row[0].name} className="flex h-[18px] items-center" style={{ gap: CHIP_GAP }}>
            {row.map((hop) => (
              <FolderChip key={hop.name} p={p} hop={hop} />
            ))}
          </div>
        ))}
      </div>
      <Bar t={run} done={done} />
    </Station>
  );
}
