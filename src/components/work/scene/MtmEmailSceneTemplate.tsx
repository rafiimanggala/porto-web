"use client";

import { Fragment, type ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { SceneIcon } from "./SceneIcon";
import { ORDER } from "./MtmKitData";
import { COPY, RES, ROW_K, T, TAG, typeWin } from "./MtmEmailSceneData";
import { flightAt } from "./MtmEmailSceneMath";
import { Merge, Tag, WipeSwap } from "./MtmEmailSceneKit";
import { ItemRow, Row } from "./MtmEmailSceneRows";
import { clamp01, pct, toneTint } from "./MtmKitMath";

/* Order template laid out at final size, revealed by the growing card. */

const BIG = "text-[15px] font-medium leading-none text-fg [@container(min-width:34rem)_and_(min-height:36rem)]:text-[20px]";
const SMALL = "text-[12px] leading-none text-dim [@container(min-width:34rem)_and_(min-height:36rem)]:text-[14px]";

function Greeting({ p }: { p: MV }) {
  return (
    <div className="flex flex-col gap-1 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-2">
      <Row
        p={p}
        k={ROW_K.hi}
        win={RES.hi}
        skel="34%"
        className="h-5 [@container(min-width:34rem)_and_(min-height:36rem)]:h-7"
        raw={
          <span className={`flex items-center gap-1.5 ${BIG}`}>
            {COPY.hi}
            <span className="inline-flex items-center">
              <Tag>{TAG.first}</Tag>,
            </span>
          </span>
        }
        done={<span className={BIG}>{`${COPY.hi} ${ORDER.firstName},`}</span>}
      />
      <Row
        p={p}
        k={ROW_K.order}
        win={RES.order}
        skel="58%"
        className="h-4 [@container(min-width:34rem)_and_(min-height:36rem)]:h-5"
        raw={
          <span className={`flex items-center gap-1.5 ${SMALL}`}>
            {COPY.orderWord}
            <Tag>{TAG.number}</Tag>
            {COPY.confirmed}
          </span>
        }
        done={<span className={SMALL}>{`${COPY.orderWord} ${ORDER.number} ${COPY.confirmed}`}</span>}
      />
    </div>
  );
}

function Block({ label, wideOnly = false, children }: { label: string; wideOnly?: boolean; children: ReactNode }) {
  return (
    <div className={`min-w-0 border-t border-line ${wideOnly ? "pt-1.5 [@container(min-width:34rem)_and_(min-height:36rem)]:pt-2" : "pt-2"}`}>
      <p className={`${MONO} mb-1.5 text-[10px] uppercase tracking-[0.12em] text-mute ${wideOnly ? "hidden [@container(min-width:34rem)_and_(min-height:36rem)]:block" : ""}`}>{label}</p>
      {children}
    </div>
  );
}

const INFO = "self-start text-balance text-[12px] leading-[1.3] text-fg [@container(min-width:34rem)_and_(min-height:36rem)]:text-[14px]";

/* The address breaks only at its commas, so a narrow column never splits the street name across two lines. */
const ADDRESS_PARTS = ORDER.address.split(", ");

function Address() {
  const last = ADDRESS_PARTS.length - 1;
  return (
    <span className={INFO}>
      {ADDRESS_PARTS.map((part, i) => (
        <Fragment key={part}>
          {i > 0 && " "}
          <span className="whitespace-nowrap">{i < last ? `${part},` : part}</span>
        </Fragment>
      ))}
    </span>
  );
}

function ShipPay({ p }: { p: MV }) {
  return (
    <div className="grid grid-cols-2 gap-3 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-5">
      <Block label={COPY.shipTo}>
        <Row p={p} k={ROW_K.ship} win={RES.ship} skel="80%" className="min-h-[32px]" raw={<Tag className="self-start">{TAG.address}</Tag>} done={<Address />} />
      </Block>
      <Block label={COPY.paidWith}>
        <Row p={p} k={ROW_K.pay} win={RES.pay} skel="60%" className="min-h-[32px]" raw={<Tag className="self-start">{TAG.payment}</Tag>} done={<span className={INFO}>{ORDER.payment}</span>} />
      </Block>
    </div>
  );
}

/* The dashed slot holds a raw tag that is typed like every other placeholder, then swept to the button label as the fill wipes in. */
function Cta({ p }: { p: MV }) {
  const t = useSeg(p, RES.cta[0], RES.cta[1]);
  const type = useSeg(p, typeWin(ROW_K.cta)[0], typeWin(ROW_K.cta)[1]);
  const bar = useTransform(type, (v) => 1 - clamp01(v * 3));
  return (
    <div className="relative">
      <WipeSwap
        t={t}
        className="relative h-8 [@container(min-width:34rem)_and_(min-height:36rem)]:h-11"
        a={<div className="h-full rounded-lg border border-dashed border-line-strong" />}
        b={<div className="h-full rounded-lg bg-accent" />}
      />
      <div className="pointer-events-none absolute inset-0 z-10 grid place-items-center">
        <motion.i aria-hidden style={{ opacity: bar }} className="col-start-1 row-start-1 h-2 w-24 rounded-full bg-fg/15" />
        <Merge
          type={type}
          res={t}
          center
          className="col-start-1 row-start-1"
          raw={<Tag>{TAG.cta}</Tag>}
          done={<span className="text-[12px] font-semibold leading-none text-fg [@container(min-width:34rem)_and_(min-height:36rem)]:text-[14px]">{COPY.cta}</span>}
        />
      </div>
    </div>
  );
}

export function TemplateBody({ p }: { p: MV }) {
  return (
    <div className="flex shrink-0 flex-col justify-between px-2.5 pb-2 pt-1 [@container(min-width:34rem)_and_(min-height:36rem)]:px-5 [@container(min-width:34rem)_and_(min-height:36rem)]:pb-5" style={{ width: "var(--tw)", height: "var(--bodyh)" }}>
      <Greeting p={p} />
      <Block label={COPY.items} wideOnly>
        <div className="flex flex-col gap-1.5 [@container(min-width:34rem)_and_(min-height:36rem)]:gap-3">
          <ItemRow p={p} k={ROW_K.item[0]} item={ORDER.items[0]} wins={RES.items[0]} />
          <ItemRow p={p} k={ROW_K.item[1]} item={ORDER.items[1]} wins={RES.items[1]} />
        </div>
      </Block>
      <ShipPay p={p} />
      <Cta p={p} />
    </div>
  );
}

const CHIP = `${MONO} flex h-full items-center gap-1 px-2 text-[10px] uppercase leading-none tracking-[0.1em]`;

/* Chip: template until the plane docks, then sent. */
export function TemplateChip({ p, show }: { p: MV; show: MV }) {
  const t = useSeg(p, T.sent[0], T.sent[1]);
  return (
    <motion.div style={{ opacity: show }} className="absolute right-2 top-1/2 h-5 w-[78px] -translate-y-1/2 overflow-hidden rounded-md bg-bg/45 [@container(min-width:34rem)_and_(min-height:36rem)]:right-3 [@container(min-width:34rem)_and_(min-height:36rem)]:h-6 [@container(min-width:34rem)_and_(min-height:36rem)]:w-[90px]">
      <WipeSwap
        t={t}
        className="relative h-full w-full"
        a={<span className={`${CHIP} text-fg/80`}>{COPY.template}</span>}
        b={
          <span className={`${CHIP} text-fg`} style={{ background: toneTint("mint", 0.4) }}>
            <SceneIcon name="send" size={16} className="h-3.5 w-3.5" />
            {COPY.sent}
          </span>
        }
      />
    </motion.div>
  );
}

const FLIGHT_X = [76, 104, 87] as const;
const FLIGHT_Y = [88, 48, 3.5] as const;

/* Paper plane flight to the chip. */
export function Plane({ p }: { p: MV }) {
  const t = useSeg(p, T.plane[0], T.plane[1]);
  const left = useTransform(t, (v) => pct(flightAt(FLIGHT_X, FLIGHT_Y, v).x));
  const top = useTransform(t, (v) => pct(flightAt(FLIGHT_X, FLIGHT_Y, v).y));
  const rotate = useTransform(t, (v) => flightAt(FLIGHT_X, FLIGHT_Y, v).rot);
  const scale = useTransform(t, (v) => easeOutBack(Math.min(1, v * 6)) * (1 - 0.3 * Math.max(0, (v - 0.85) / 0.15)));
  const opacity = useTransform(t, (v) => (v <= 0 || v >= 1 ? 0 : Math.min(1, v * 10, (1 - v) * 8)));
  return (
    <motion.span aria-hidden style={{ left, top, rotate, scale, opacity }} className="pointer-events-none absolute z-20 -ml-[18px] -mt-[18px] block h-9 w-9 text-fg [@container(min-width:34rem)_and_(min-height:36rem)]:-ml-6 [@container(min-width:34rem)_and_(min-height:36rem)]:-mt-6 [@container(min-width:34rem)_and_(min-height:36rem)]:h-12 [@container(min-width:34rem)_and_(min-height:36rem)]:w-12">
      <SceneIcon name="send" size={40} className="h-full w-full" />
    </motion.span>
  );
}
