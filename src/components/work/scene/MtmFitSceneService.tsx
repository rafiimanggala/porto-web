"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { ServiceBox } from "./MtmKitStage";
import { useKeys, useSpan } from "./MtmKitMath";
import { CALL_STATUS, NEW_RECORD, RECORDS, SERVICE_SUB, T, type RecordRow } from "./MtmFitSceneData";
import { Reveal } from "./MtmFitSceneKit";

const STATUS_H = 14;
const ROW_BODY = "relative flex h-full items-center gap-2 rounded-md bg-surface-2 px-2";
const WAKE_GLOW = 0.03;
/* The glow runs down the list in the wake window, however many records it holds. */
const WAKE_STEP = (T.wake[1] - T.wake[0]) / RECORDS.length;
const ROW_BOX = "h-[calc(var(--row)-2px)]";

function RowBody({ row, mark, glow, className = "" }: { row: RecordRow; mark: ReactNode; glow?: MV; className?: string }) {
  return (
    <div className={`${ROW_BODY} ${className}`}>
      {glow ? <motion.i aria-hidden style={{ opacity: glow }} className="pointer-events-none absolute inset-0 rounded-md bg-accent/30" /> : null}
      <span className={`${MONO} shrink-0 text-[10px] text-mute`}>{row.id}</span>
      <span className="min-w-0 flex-1 truncate text-[11px] text-fg @[520px]:text-[12px]">{row.name}</span>
      {mark}
    </div>
  );
}

function StoredRow({ p, row, i, shift }: { p: MV; row: RecordRow; i: number; shift: MV }) {
  const a = T.records.start + i * T.records.step;
  const t = useSeg(p, a, a + T.records.len);
  const top = useTransform(shift, (s) => `calc(var(--row) * ${i + s})`);
  const g = T.wake[0] + i * WAKE_STEP;
  const glow = useTransform(p, [g, g + WAKE_GLOW * 0.4, g + WAKE_GLOW], [0, 1, 0]);
  return (
    <motion.div style={{ top }} className="absolute inset-x-0">
      <Reveal t={t} className={ROW_BOX}>
        <RowBody row={row} glow={glow} mark={<span className={`${MONO} shrink-0 text-[10px] text-mute`}>{row.gender}</span>} />
      </Reveal>
    </motion.div>
  );
}

function NewRow({ p, shift }: { p: MV; shift: MV }) {
  const t = useSeg(p, T.landText[0], T.landText[1]);
  const check = useSeg(p, T.landCheck[0], T.landCheck[1], easeOutBack);
  const top = useTransform(shift, (s) => `calc(var(--row) * ${s - 1})`);
  const mark = (
    <motion.span style={{ scale: check }} className="block h-3.5 w-3.5 shrink-0">
      <MtmGlyph name="check" size="100%" />
    </motion.span>
  );
  return (
    <motion.div style={{ top }} className="absolute inset-x-0">
      <Reveal t={t} className={ROW_BOX}>
        <RowBody row={NEW_RECORD} mark={mark} className="border border-mint" />
      </Reveal>
    </motion.div>
  );
}

/* The list stays put while the tile squeezes: the tile clips it (soft at the foot) and, collapsed, it is just its header strip. */
function Records({ p }: { p: MV }) {
  const shift = useSeg(p, T.land[0], T.land[1], easeInOutCubic);
  return (
    <div className="relative h-full min-h-0 overflow-hidden [--row:24px] [mask-image:linear-gradient(to_bottom,#000_calc(100%-14px),transparent)] @[520px]:[--row:26px]">
      {RECORDS.map((row, i) => (
        <StoredRow key={row.id} p={p} row={row} i={i} shift={shift} />
      ))}
      <NewRow p={p} shift={shift} />
    </div>
  );
}

const STATUS_XS = [T.ok[1] - 0.01, T.ok[1], T.land[0], T.land[1]] as const;
const STATUS_YS = [0, 1, 1, 2] as const;

function CallStatus({ p }: { p: MV }) {
  const index = useKeys(p, STATUS_XS, STATUS_YS);
  const y = useTransform(index, (i) => `${-i * STATUS_H}px`);
  return (
    <div style={{ height: STATUS_H }} className={`${MONO} absolute right-2 top-[17px] overflow-hidden text-right text-[10px] leading-[14px] text-mute`}>
      <motion.div style={{ y }}>
        {CALL_STATUS.map((line) => (
          <p key={line} style={{ height: STATUS_H }} className="whitespace-nowrap">
            {line}
          </p>
        ))}
      </motion.div>
    </div>
  );
}

export function Service({ p }: { p: MV }) {
  const getBusy = useSpan(p, T.busyGet[0], T.busyGet[1]);
  const postBusy = useSpan(p, T.busyPost[0], T.busyPost[1]);
  const wake = useSpan(p, T.wake[0], T.wake[1], 0.015);
  const active = useTransform([getBusy, postBusy, wake], ([a, b, w]: number[]) => Math.max(a, b, w));
  return (
    <div className="absolute inset-0">
      <ServiceBox sub={SERVICE_SUB} active={active} className="h-full !p-2">
        <Records p={p} />
      </ServiceBox>
      <CallStatus p={p} />
    </div>
  );
}
