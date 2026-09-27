"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { MENU, MENU_TL } from "./MtmDebugSceneData";
import { CODE_SM, Packet, Pending, Tag, Typed, VWire } from "./MtmDebugSceneKit";
import { clamp01, tent, useWin } from "./MtmDebugSceneMath";
import MenuDrop from "./MtmDebugSceneMenuDrop";
import { MtmGlyph } from "./MtmKitGlyphs";
import { mixColor, useMv } from "./MtmKitMath";
import { SceneIcon } from "./SceneIcon";

/* Page 2: the lookup reads one place only. The metafield chip is empty, the localStorage chip holds the store the profile page wrote. */

const ROSE = "var(--color-rose)";
const MINT = "var(--color-mint)";
const ACCENT = "var(--color-accent)";
const LINE = "var(--color-line-strong)";
const ZONE_TOP = "min-h-7 max-h-16 flex-1";
const ZONE_BOTTOM = "min-h-6 max-h-14 flex-1";
const LEFT_X = "left-[24.1%]";
const RIGHT_X = "left-[75.9%]";
const CHIP = `${MONO} relative rounded-lg bg-surface-2 px-2 py-1.5 text-[10px] leading-[14px]`;

function Head({ children, label }: { children: ReactNode; label: string }) {
  return (
    <p className="flex items-center gap-1.5 text-mute">
      {children}
      {label}
    </p>
  );
}

function MetaChip({ p }: { p: MV }) {
  const blank = useWin(p, MENU_TL.blank);
  const border = useTransform(blank, (t) => mixColor(ROSE, t, LINE));
  return (
    <motion.div style={{ borderColor: border }} className={`${CHIP} border`}>
      <Head label="metafield">
        <MtmGlyph name="server" size={14} />
      </Head>
      <p className="truncate text-fg">{MENU.metafield}</p>
      <p className="text-mute">
        value <Tag tone="rose">null</Tag>
      </p>
      <p className="text-mute">{MENU.copy.onlyLookup}</p>
    </motion.div>
  );
}

function StoreChip({ p }: { p: MV }) {
  const solid = useWin(p, [MENU_TL.write[0] - 0.004, MENU_TL.write[0] + 0.006]);
  const typed = useWin(p, [MENU_TL.write[0] + 0.004, MENU_TL.write[1]]);
  const dim = useTransform(solid, (t) => 0.6 + 0.4 * t);
  const dashed = useTransform(solid, (t) => 1 - t);
  return (
    <div className={`${CHIP} border border-transparent`}>
      <motion.i aria-hidden style={{ opacity: dashed }} className="pointer-events-none absolute -inset-px rounded-lg border border-dashed border-line-strong" />
      <motion.i aria-hidden style={{ opacity: solid }} className="pointer-events-none absolute -inset-px rounded-lg border border-line-strong" />
      <motion.div style={{ opacity: dim }}>
        <Head label="localStorage">
          <SceneIcon name="browser" size={32} className="h-3.5 w-3.5" />
        </Head>
        <p className="truncate text-fg">{MENU.storageKey}</p>
        <p className="text-mute">
          value{" "}
          <span className="relative inline-block align-top">
            <Pending t={typed} width={`${MENU.stored.length + 2}ch`} />
            <Typed t={typed} className="text-mint">
              {`"${MENU.stored}"`}
            </Typed>
          </span>
        </p>
        <p className="relative text-mute">
          <span className="relative inline-block">
            {MENU.writtenBy}
            <motion.i aria-hidden style={{ scaleX: typed }} className="absolute inset-x-0 -bottom-px h-px origin-left bg-accent" />
          </span>
        </p>
      </motion.div>
    </div>
  );
}

function Wires({ p }: { p: MV }) {
  const whole = useMv(1);
  const blank = useWin(p, MENU_TL.blank);
  const right = useWin(p, MENU_TL.wireRight);
  const leftColor = useTransform(blank, (t) => mixColor(ROSE, t, LINE));
  const rightColor = useTransform(right, (t) => mixColor(MINT, t, ACCENT));
  const pktLeft = useWin(p, MENU_TL.wireLeft);
  const pktRight = useWin(p, MENU_TL.pktRight);
  return (
    <div className={`relative ${ZONE_TOP}`}>
      <div className={`absolute inset-y-0 -ml-px ${LEFT_X}`}>
        <VWire t={whole} color={leftColor} className="h-full" />
      </div>
      <div className={`absolute inset-y-0 -ml-px ${RIGHT_X}`}>
        <VWire t={right} color={rightColor} className="h-full" />
      </div>
      <Packet t={pktLeft} className={LEFT_X} />
      <Packet t={pktRight} color={MINT} className={RIGHT_X} />
    </div>
  );
}

function LookupBar({ p }: { p: MV }) {
  const glow = useTransform(p, (v) => tent(v, ...MENU_TL.glow));
  const warn = useWin(p, MENU_TL.warn);
  const code = useWin(p, MENU_TL.code);
  const border = useTransform([warn, code], ([w, c]: number[]) => mixColor(MINT, c, mixColor(ROSE, w, LINE)));
  const flag = useTransform([warn, code], ([w, c]: number[]) => w * (1 - clamp01(c * 4)));
  return (
    <motion.div style={{ borderColor: border }} className="relative flex h-9 items-center rounded-lg border bg-surface-2 px-2.5">
      <motion.i aria-hidden style={{ opacity: glow }} className="pointer-events-none absolute -inset-px rounded-lg border-2 border-accent" />
      <motion.span
        aria-hidden
        style={{ opacity: flag }}
        className={`${MONO} absolute -top-2.5 left-1/2 z-10 inline-flex -translate-x-1/2 items-center gap-1 rounded-md border border-rose bg-surface-1 px-1.5 text-[10px] leading-[14px] text-rose`}
      >
        <MtmGlyph name="warning" size={12} />
        {MENU.copy.warn}
      </motion.span>
      <span className={`${CODE_SM} flex items-center text-fg`}>
        {MENU.head}
        <Typed t={code}>{MENU.tail}</Typed>
      </span>
    </motion.div>
  );
}

function DownWire({ p }: { p: MV }) {
  const whole = useMv(1);
  const blank = useWin(p, MENU_TL.blank);
  const fill = useWin(p, MENU_TL.fill);
  const color = useTransform([blank, fill], ([b, f]: number[]) => mixColor(MINT, f, mixColor(ROSE, b, LINE)));
  const pktDown = useWin(p, MENU_TL.wireDown);
  const pktFill = useWin(p, MENU_TL.down2);
  return (
    <div className={`relative ${ZONE_BOTTOM}`}>
      <div className="absolute inset-y-0 left-1/2 -ml-px">
        <VWire t={whole} color={color} className="h-full" />
      </div>
      <Packet t={pktDown} className="left-1/2" />
      <Packet t={pktFill} color={MINT} className="left-1/2" />
    </div>
  );
}

export default function MenuPage({ p }: { p: MV }) {
  return (
    <div className="flex h-full flex-col justify-center px-3">
      <div className="grid grid-cols-2 gap-3">
        <MetaChip p={p} />
        <StoreChip p={p} />
      </div>
      <Wires p={p} />
      <LookupBar p={p} />
      <DownWire p={p} />
      <MenuDrop p={p} />
    </div>
  );
}
