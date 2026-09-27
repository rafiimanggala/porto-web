"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, type MV } from "./HealthSceneParts";
import { FABRICS, fabricColor, type EmailFlow } from "./MtmKitData";
import { MtmGlyph } from "./MtmKitGlyphs";
import { COPY, GROUP_TINT, LIVE_ON } from "./MtmEmailSceneData";
import { Bolt, WipeSwap } from "./MtmEmailSceneKit";

/* Card faces: stock, branded band with mini body, trigger row. */

const STOCK_BARS = ["92%", "84%", "58%"] as const;
const BAR = "h-[4px] rounded-full [@container(min-width:34rem)_and_(min-height:36rem)]:h-[6px]";

export function StockFace({ flow }: { flow: EmailFlow }) {
  return (
    <div className="absolute inset-0 bg-bg">
      <div className="flex h-[var(--band)] items-center gap-1.5 px-2 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-2.5 [@container(min-width:34rem)_and_(min-height:36rem)]:px-3">
        <i aria-hidden className="h-5 w-5 shrink-0 rounded-md border border-dashed border-line-strong [@container(min-width:34rem)_and_(min-height:36rem)]:h-7 [@container(min-width:34rem)_and_(min-height:36rem)]:w-7" />
        <span className="line-clamp-2 min-w-0 text-[10.5px] leading-[1.15] text-mute [@container(min-width:34rem)_and_(min-height:36rem)]:text-[12px]">{flow.name}</span>
      </div>
      <div className="flex h-[var(--zone)] flex-col justify-center gap-[5px] px-2 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-2 [@container(min-width:34rem)_and_(min-height:36rem)]:px-3">
        {STOCK_BARS.map((w) => (
          <i key={w} className={`${BAR} bg-line-strong`} style={{ width: w }} />
        ))}
      </div>
    </div>
  );
}

const MINI_BAR = `${BAR} bg-fg/25`;
const PILL = "rounded-full bg-accent";

function Hero({ i }: { i: number }) {
  return <i className="aspect-square h-[72%] shrink-0 rounded-md border border-line-strong" style={{ background: fabricColor(FABRICS[i % FABRICS.length]) }} />;
}

function DateBlock() {
  return (
    <span className="flex aspect-square h-[72%] shrink-0 flex-col overflow-hidden rounded-md border border-line-strong">
      <i className="h-[32%] bg-rose/60" />
      <i className="m-auto h-[3px] w-[55%] rounded-full bg-fg/40" />
    </span>
  );
}

/* Mini body per email group. */
export function MiniBody({ flow, i }: { flow: EmailFlow; i: number }) {
  if (flow.group === "account") {
    return (
      <div className="flex h-full flex-col justify-center gap-1 px-2 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-2 [@container(min-width:34rem)_and_(min-height:36rem)]:px-3">
        <i className={`${MINI_BAR} w-[70%]`} />
        <i className={`${MINI_BAR} w-[46%]`} />
        <i className={`${PILL} h-[8px] w-[42%] [@container(min-width:34rem)_and_(min-height:36rem)]:h-[14px]`} />
      </div>
    );
  }
  return (
    <div className="flex h-full items-center gap-2 px-2 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-3 [@container(min-width:34rem)_and_(min-height:36rem)]:px-3">
      {flow.group === "order" ? <Hero i={i} /> : <DateBlock />}
      <div className="flex min-w-0 flex-1 flex-col gap-1 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-2">
        <i className={`${MINI_BAR} w-[88%]`} />
        <i className={`${MINI_BAR} w-[56%]`} />
      </div>
      <i className={`${PILL} h-[36%] w-[24%] shrink-0`} />
    </div>
  );
}

export function TriggerRow({ flow }: { flow: EmailFlow }) {
  return (
    <div className="absolute inset-x-1.5 top-1/2 flex -translate-y-1/2 flex-col gap-1 [@container(min-width:34rem)_and_(min-height:36rem)]:inset-x-3 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-1.5">
      <span className={`${MONO} hidden text-[10px] uppercase tracking-[0.12em] text-mute [@container(min-width:34rem)_and_(min-height:36rem)]:block`}>{COPY.triggerLabel}</span>
      <div className="flex h-[22px] items-center gap-1.5 rounded-md px-1.5 [@container(min-width:34rem)_and_(min-height:36rem)]:h-8 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-2 [@container(min-width:34rem)_and_(min-height:36rem)]:px-2.5" style={{ background: GROUP_TINT[flow.group] }}>
        <Bolt className="h-3 w-3 shrink-0 [@container(min-width:34rem)_and_(min-height:36rem)]:h-4 [@container(min-width:34rem)_and_(min-height:36rem)]:w-4" />
        <span className={`${MONO} min-w-0 truncate text-[10px] leading-none text-fg [@container(min-width:34rem)_and_(min-height:36rem)]:text-[12px]`}>{flow.trigger}</span>
      </div>
    </div>
  );
}

/* Mini body gives way to the trigger row. */
export function Zone({ flow, i, trig }: { flow: EmailFlow; i: number; trig: MV }) {
  return <WipeSwap t={trig} className="relative h-[var(--zone)] shrink-0" a={<MiniBody flow={flow} i={i} />} b={<TriggerRow flow={flow} />} />;
}

function LiveDot({ live }: { live: MV }) {
  const scale = useTransform(live, (v) => easeOutBack(Math.min(1, v / LIVE_ON)));
  const opacity = useTransform(live, (v) => Math.min(1, v / LIVE_ON));
  return (
    <motion.span aria-hidden style={{ scale, opacity }} className="ml-auto flex shrink-0 items-center gap-1">
      <i className="h-2 w-2 rounded-full bg-mint" />
      <span className={`${MONO} hidden text-[10px] uppercase tracking-[0.1em] text-fg [@container(min-width:34rem)_and_(min-height:36rem)]:inline`}>{COPY.liveWord}</span>
    </motion.span>
  );
}

export function Band({ flow, live, children }: { flow: EmailFlow; live: MV; children?: ReactNode }) {
  return (
    <div className="relative flex h-[var(--band)] shrink-0 items-center gap-1.5 bg-accent px-2 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-2.5 [@container(min-width:34rem)_and_(min-height:36rem)]:px-3">
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-bg/40 [@container(min-width:34rem)_and_(min-height:36rem)]:h-7 [@container(min-width:34rem)_and_(min-height:36rem)]:w-7">
        <MtmGlyph name={flow.glyph} size="72%" />
      </span>
      <span className="line-clamp-2 min-w-0 text-[10.5px] font-semibold leading-[1.15] text-fg [@container(min-width:34rem)_and_(min-height:36rem)]:text-[13px]">{flow.name}</span>
      <LiveDot live={live} />
      {children}
    </div>
  );
}
