"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { useSeg, MONO, type MV } from "./HealthSceneParts";
import type { OrderItem } from "./MtmKitData";
import { clamp01 } from "./MtmKitMath";
import { COPY, TAG, fabricOf, typeWin, type Win } from "./MtmEmailSceneData";
import { Merge, Tag, WipeSwap } from "./MtmEmailSceneKit";
import { ItemShirt, TILE_BG, shirtFill } from "./MtmEmailSceneShirt";

/* Merge row and line item row with shirt drawing. */

type RowProps = { p: MV; k: number; win: Win; raw: ReactNode; done: ReactNode; className?: string; skel?: string };

/* A skeleton line stands in for the row until its tag is typed, so the grown card is never empty. */
export function Row({ p, k, win, raw, done, className, skel = "50%" }: RowProps) {
  const type = useSeg(p, typeWin(k)[0], typeWin(k)[1]);
  const res = useSeg(p, win[0], win[1]);
  const bar = useTransform(type, (t) => 1 - clamp01(t * 3));
  return (
    <div className="relative">
      <motion.i aria-hidden style={{ opacity: bar, width: skel }} className="pointer-events-none absolute inset-y-[22%] left-0 rounded-full bg-fg/15" />
      <Merge type={type} res={res} raw={raw} done={done} className={className} />
    </div>
  );
}

/* Bigger tile, so the collar and cuff still read at phone size. It spans both text rows on a phone. */
const TILE =
  "relative row-span-2 h-12 w-12 shrink-0 [@container(min-width:34rem)_and_(min-height:36rem)]:row-span-1 [@container(min-width:34rem)_and_(min-height:36rem)]:h-[72px] [@container(min-width:34rem)_and_(min-height:36rem)]:w-[72px]";

function Pill({ word, value }: { word: string; value: string }) {
  return (
    <span className="inline-flex h-[18px] items-center gap-1 rounded-full border border-line-strong bg-surface-1 px-2 text-[11px] leading-none [@container(min-width:34rem)_and_(min-height:36rem)]:h-6 [@container(min-width:34rem)_and_(min-height:36rem)]:text-[12px]">
      <span className="text-mute">{word}</span>
      <span className="font-medium text-fg">{value}</span>
    </span>
  );
}

const L1 = "h-4 [@container(min-width:34rem)_and_(min-height:36rem)]:h-[22px]";
const L2 = "h-[18px] [@container(min-width:34rem)_and_(min-height:36rem)]:h-6";
const L3 = "h-[14px] [@container(min-width:34rem)_and_(min-height:36rem)]:h-4";

type ItemProps = { p: MV; k: number; item: OrderItem; wins: { l1: Win; l2: Win; l3: Win } };

/* Boxed on both tiers so each item reads as one unit. On the wide tier the fabric sits in a third column, so the row is balanced. */
const ROW_BOX =
  "grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2.5 gap-y-[2px] rounded-lg border border-line bg-surface-1/40 px-2 py-1.5 [@container(min-width:34rem)_and_(min-height:36rem)]:grid-cols-[auto_minmax(0,1fr)_auto] [@container(min-width:34rem)_and_(min-height:36rem)]:gap-x-4 [@container(min-width:34rem)_and_(min-height:36rem)]:rounded-xl [@container(min-width:34rem)_and_(min-height:36rem)]:px-3 [@container(min-width:34rem)_and_(min-height:36rem)]:py-2.5";

const FABRIC_CELL = "min-w-0 [@container(min-width:34rem)_and_(min-height:36rem)]:col-start-3 [@container(min-width:34rem)_and_(min-height:36rem)]:row-start-1";

const PRODUCT = "text-[14px] font-medium leading-none text-fg [@container(min-width:34rem)_and_(min-height:36rem)]:text-[16px]";
const FABRIC = `${MONO} flex items-center gap-1.5 whitespace-nowrap text-[10px] leading-none text-dim [@container(min-width:34rem)_and_(min-height:36rem)]:text-[11px]`;
const DOT = "h-2.5 w-2.5 rounded-full border border-line-strong [@container(min-width:34rem)_and_(min-height:36rem)]:h-3 [@container(min-width:34rem)_and_(min-height:36rem)]:w-3";

const QTY = `${MONO} text-[11px] leading-none text-dim [@container(min-width:34rem)_and_(min-height:36rem)]:text-[13px]`;

/* Product with its quantity right beside it, then the collar and cuff pills. */
function ItemLines({ p, k, item, wins }: ItemProps) {
  return (
    <div className="flex min-w-0 flex-col justify-center gap-[2px]">
      <Row
        p={p}
        k={k}
        win={wins.l1}
        skel="60%"
        className={L1}
        raw={<Tag>{TAG.product}</Tag>}
        done={
          <span className="flex items-baseline gap-2">
            <span className={PRODUCT}>{item.product}</span>
            <span className={QTY}>{COPY.qty}</span>
          </span>
        }
      />
      <Row
        p={p}
        k={k + 1}
        win={wins.l2}
        skel="85%"
        className={L2}
        raw={
          <span className="flex gap-1">
            <Tag>{TAG.collar}</Tag>
            <Tag>{TAG.cuff}</Tag>
          </span>
        }
        done={
          <span className="flex gap-1">
            <Pill word={COPY.collarWord} value={item.collar} />
            <Pill word={COPY.cuffWord} value={item.cuff} />
          </span>
        }
      />
    </div>
  );
}

function FabricLine({ p, k, item, wins }: ItemProps) {
  const fabric = fabricOf(item.fabric);
  return (
    <div className={FABRIC_CELL}>
      <Row
        p={p}
        k={k + 2}
        win={wins.l3}
        skel="50%"
        className={L3}
        raw={<Tag>{TAG.fabric}</Tag>}
        done={
          <span className={FABRIC}>
            <i className={DOT} style={{ background: shirtFill(fabric) }} />
            {COPY.fabricWord} {item.fabric}
          </span>
        }
      />
    </div>
  );
}

export function ItemRow(props: ItemProps) {
  const { p, item, wins } = props;
  const tile = useSeg(p, wins.l1[0], wins.l1[1]);
  return (
    <div className={ROW_BOX}>
      <WipeSwap
        t={tile}
        className={TILE}
        a={<div className="h-full w-full rounded-lg border border-dashed border-line-strong" />}
        b={
          <div className={`h-full w-full rounded-lg border border-line-strong p-0.5 ${TILE_BG}`}>
            <ItemShirt fabric={fabricOf(item.fabric)} item={item} />
          </div>
        }
      />
      <ItemLines {...props} />
      <FabricLine {...props} />
    </div>
  );
}
