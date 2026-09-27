"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, type MV } from "./HealthSceneParts";
import { PUSH, SHIP, TAG_BEFORE, TAG_COMMAND, TAG_NUMBER, TAG_STEM } from "./MtmDebugSceneData";
import { CODE, LABEL, Roll, Typed } from "./MtmDebugSceneKit";
import { useWin } from "./MtmDebugSceneMath";
import BackupRow from "./MtmDebugSceneShipBackup";
import { Bar, Link, PushButton, ROW_H, Rollback, Station } from "./MtmDebugSceneShipParts";
import { MtmGlyph } from "./MtmKitGlyphs";

/* Page 4: backup, then tag, then the gate opens and the push goes out. The way back is drawn last. */

const NODE = 20;
const SEG_W = 14;
/* The stack starts centred and slides this far left to make room for the restore rail on its right. */
const SLIDE_PX = 14;

const NODE_BASE = `${MONO} relative grid shrink-0 place-items-center rounded-full border text-[11px]`;

function TagNode({ n }: { n: number }) {
  return (
    <span style={{ width: NODE, height: NODE }} className={`${NODE_BASE} border-line-strong bg-surface-1 text-dim`}>
      {n}
    </span>
  );
}

/* The new tag: a dashed slot until it drops in as a filled node. */
function NewTagNode({ n, pop }: { n: number; pop: MV }) {
  const scale = useTransform(pop, (t) => 0.6 + 0.4 * t);
  return (
    <span style={{ width: NODE, height: NODE }} className={`${NODE_BASE} border-dashed border-line-strong text-mute`}>
      <motion.span style={{ scale, opacity: pop }} className="absolute -inset-px grid place-items-center rounded-full bg-accent text-fg">
        {n}
      </motion.span>
      {n}
    </span>
  );
}

function TagLine({ t }: { t?: MV }) {
  return (
    <span style={{ width: SEG_W }} className="relative h-0.5 shrink-0 rounded-full bg-line-strong">
      {t ? <motion.i style={{ scaleX: t }} className="absolute inset-0 origin-left rounded-full bg-accent" /> : <i className="absolute inset-0 rounded-full bg-mute/60" />}
    </span>
  );
}

function TagRow({ p }: { p: MV }) {
  const [a, b] = SHIP.tag;
  const seg = useWin(p, [a + 0.004, a + 0.01]);
  const pop = useWin(p, [a + 0.01, a + 0.018], easeOutBack);
  const cmd = useWin(p, [a + 0.014, b - 0.006]);
  const done = useWin(p, [b - 0.008, b]);
  return (
    <Station h={ROW_H.tag} glyph={<MtmGlyph name="tag" size={24} />} done={done}>
      <div className="flex h-[22px] items-center gap-1">
        <span className={`${CODE} mr-1 text-mute`}>{TAG_STEM}</span>
        <TagNode n={TAG_NUMBER - 2} />
        <TagLine />
        <TagNode n={TAG_NUMBER - 1} />
        <TagLine t={seg} />
        <NewTagNode n={TAG_NUMBER} pop={pop} />
      </div>
      <p className={`${CODE} mt-2`}>
        <span className="text-mute">$ </span>
        <Typed t={cmd} className="text-fg">
          {TAG_COMMAND}
        </Typed>
      </p>
    </Station>
  );
}

function LiveRow({ p }: { p: MV }) {
  const push = useWin(p, SHIP.push);
  const version = useWin(p, [SHIP.push[1] - 0.008, SHIP.push[1]]);
  const done = useWin(p, SHIP.done);
  return (
    <Station h={ROW_H.live} glyph={<MtmGlyph name="layers" size={24} />} done={done}>
      <div className="flex h-[15px] items-center justify-between">
        <span className={LABEL}>live theme</span>
        <Roll t={version} h={15} className={CODE} a={<span className="text-mute">{TAG_BEFORE}</span>} b={<span className="text-fg">{PUSH.tag}</span>} />
      </div>
      <Bar t={push} done={done} />
    </Station>
  );
}

export default function ShipPage({ p }: { p: MV }) {
  const first = useWin(p, SHIP.linkTag);
  const second = useWin(p, SHIP.linkGate);
  const third = useWin(p, SHIP.linkLive);
  const slide = useWin(p, SHIP.slide, easeInOutCubic);
  const x = useTransform(slide, (t) => (1 - t) * SLIDE_PX);
  return (
    <div className="flex h-full flex-col justify-center pl-3 pr-10">
      <motion.div style={{ x }} className="relative">
        <BackupRow p={p} />
        <Link t={first} />
        <TagRow p={p} />
        <Link t={second} />
        <PushButton p={p} />
        <Link t={third} />
        <LiveRow p={p} />
        <Rollback p={p} />
      </motion.div>
    </div>
  );
}
