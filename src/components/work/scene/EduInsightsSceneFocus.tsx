"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { AVG_COMPLETE, D_CLASS, NAIVE_COMPLETE, REPORTING, T, TONE } from "./EduInsightsSceneData";
import { BellIcon, WarnIcon } from "./EduInsightsSceneIcons";
import { Panel, SwapEdge, clamp01, hatch, useSwap } from "./EduInsightsSceneKit";

/* Focus card of the honest-zero chapter. The naive 0 percent pops in, gets
   struck out, and is replaced by a "no data yet" chip through a complementary
   clip with an accent line at the moving edge. */

const ROSE = "var(--color-rose)";
const SUN = "var(--color-sun)";
const BIG = "text-[clamp(2.3rem,10cqh,4.4rem)]";
const CHIP_TEXT = "text-[clamp(1rem,4.2cqh,1.6rem)]";

function Head() {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid h-[1.6em] w-[1.6em] place-items-center rounded-md ${MONO} text-fg`}
        style={{ background: `color-mix(in oklab, ${TONE[D_CLASS.tone]} 42%, transparent)` }}
      >
        {D_CLASS.id}
      </span>
      <span className="font-medium text-fg">Class {D_CLASS.id}</span>
      <span className="ml-auto truncate text-dim">
        {D_CLASS.course}, {D_CLASS.students} students
      </span>
    </div>
  );
}

function NaiveValue({ p }: { p: MV }) {
  const pop = useSeg(p, T.naive[0], T.naive[1], easeOutBack);
  const opacity = useTransform(pop, (v) => clamp01(v * 1.5));
  const scale = useTransform(pop, (v) => 0.6 + 0.4 * v);
  const tag = useSeg(p, T.tag[0], T.tag[1], easeOutBack);
  const tagOp = useTransform(tag, (v) => clamp01(v * 1.5));
  const tagX = useTransform(tag, (v) => (1 - v) * -8);
  const strike = useSeg(p, T.strike[0], T.strike[1], easeInOutCubic);
  /* The bar lifts just before the wipe reaches the glyph, so the edge never slices a struck 0%. */
  const strikeOp = useSeg(p, T.swap[0], T.swap[0] + 0.2 * (T.swap[1] - T.swap[0]), (t) => 1 - t);
  return (
    <div className="flex items-center gap-[0.9em]">
      <motion.span style={{ opacity, scale, color: ROSE }} className="relative origin-left">
        <span className={`t-hero block leading-none tabular-nums ${BIG}`}>0%</span>
        <motion.i
          aria-hidden
          style={{ scaleX: strike, opacity: strikeOp }}
          className="absolute -left-[6%] right-[-6%] top-1/2 h-[4px] origin-left -rotate-[8deg] rounded-full bg-fg"
        />
      </motion.span>
      <motion.span
        style={{ opacity: tagOp, x: tagX, borderColor: ROSE, color: ROSE }}
        className={`${MONO} inline-flex items-center gap-1 whitespace-nowrap rounded-md border px-[0.6em] py-[0.25em]`}
      >
        <WarnIcon className="h-[1.4em] w-[1.4em]" />
        misleading
      </motion.span>
    </div>
  );
}

function HonestValue({ p }: { p: MV }) {
  const settle = useSeg(p, T.settle[0], T.settle[1], easeOutBack);
  const bump = useTransform(settle, (v) => 1 + 0.07 * Math.sin(Math.PI * clamp01(v)));
  const bell = useTransform(settle, (v) => clamp01(v * 1.4));
  const bellScale = useTransform(settle, (v) => 0.5 + 0.5 * clamp01(v));
  return (
    <div className="flex items-center gap-[0.8em]">
      <motion.span
        style={{ scale: bump, background: `color-mix(in oklab, ${SUN} 32%, transparent)` }}
        className={`inline-flex origin-left items-center whitespace-nowrap rounded-lg border border-line-strong px-[0.7em] py-[0.15em] leading-tight text-fg ${CHIP_TEXT}`}
      >
        no data yet
      </motion.span>
      <motion.span style={{ opacity: bell, scale: bellScale }} className="inline-flex items-center gap-1 text-dim">
        <BellIcon className="h-[2.2em] w-[2.2em]" />
      </motion.span>
    </div>
  );
}

function Track({ honest }: { honest: boolean }) {
  return (
    <div className="relative h-[0.9em] min-w-0 flex-1 overflow-hidden rounded-full border border-line-strong bg-line-strong">
      {honest ? (
        <i aria-hidden className="absolute inset-0" style={hatch(SUN)} />
      ) : (
        <i aria-hidden className="absolute inset-y-0 left-0 w-[3px]" style={{ background: ROSE }} />
      )}
    </div>
  );
}

function Face({ p, honest }: { p: MV; honest: boolean }) {
  const foot = useSeg(p, T.foot[0], T.foot[1]);
  const footOp = honest ? 1 : foot;
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="flex min-h-0 flex-1 items-center">{honest ? <HonestValue p={p} /> : <NaiveValue p={p} />}</div>
      <div className={`flex items-center gap-2 ${MONO} text-dim`}>
        <Track honest={honest} />
        <span className="whitespace-nowrap">{honest ? "0 submissions" : `0 of ${D_CLASS.students}`}</span>
      </div>
      <motion.p style={{ opacity: footOp }} className={`${MONO} mt-[0.5em] whitespace-nowrap text-dim`}>
        {honest ? (
          <>
            avg of {REPORTING} with data: <span className="text-mint">{Math.round(AVG_COMPLETE)}%</span>
          </>
        ) : (
          <>
            avg with D as 0: <span style={{ color: ROSE }}>{Math.round(NAIVE_COMPLETE)}%</span>
          </>
        )}
      </motion.p>
    </div>
  );
}

export function FocusTile({ p }: { p: MV }) {
  const sw = useSwap(useSeg(p, T.swap[0], T.swap[1], easeInOutCubic));
  return (
    <Panel className="flex flex-col gap-[clamp(4px,1.2cqw,10px)] p-[clamp(8px,2.2cqw,16px)]">
      <Head />
      <div className="relative min-h-0 flex-1">
        <motion.div style={{ clipPath: sw.outClip }} className="absolute inset-0">
          <Face p={p} honest={false} />
        </motion.div>
        <motion.div style={{ clipPath: sw.inClip }} className="absolute inset-0">
          <Face p={p} honest />
        </motion.div>
        <SwapEdge edge={sw.edge} op={sw.edgeOp} />
      </div>
    </Panel>
  );
}
