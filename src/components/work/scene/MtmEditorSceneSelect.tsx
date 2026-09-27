"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { CartButton } from "./MtmKitCards";
import { PATTERNS, PRODUCT, WOMEN_ONLY_ACCOUNT, type Pattern } from "./MtmKitData";
import { MtmGlyph } from "./MtmKitGlyphs";
import { lerp, segAt, toneTint, useKeys, useMv, type MvIn, type ToneName } from "./MtmKitMath";
import {
  ACCOUNTS,
  FILTER,
  PICKED,
  PLACEHOLDER,
  RECEIPT,
  ROW_H,
  SHIPPED_NOTE,
  SHOWN_FALLBACK,
  T,
  TRIGGER_H,
  V1,
} from "./MtmEditorSceneData";
import { COLUMN, Pointer, RollLines, WipePages, bell } from "./MtmEditorSceneKit";

/* Select Other: the pattern dropdown. It filters to the product gender, then meets an account with no match,
   where the stricter first version hid the dropdown and the shipped rule shows everything.
   The account line and the trigger sit at a fixed top and the button at a fixed bottom, only the dropdown grows and shrinks between them. */

const MENU_GAP = 4;
const MENU_CHROME = 10;
const V1_H = 96;
const RECEIPT_H = 22;
const NOTE_H = 22;
const SHIP_H = TRIGGER_H + MENU_GAP + MENU_CHROME + ROW_H * SHOWN_FALLBACK.length + NOTE_H;
const TAP_TOP = TRIGGER_H + MENU_GAP + MENU_CHROME / 2 + ROW_H / 2;

const HIDDEN = PATTERNS.flatMap((pt, i) => (pt.gender === PRODUCT.gender ? [] : [i]));
const CHIP_TONE: Readonly<Record<Pattern["gender"], ToneName>> = { Men: "sky", Women: "rose" };

/* Rows of the other gender fold away from the bottom up while the filter runs. */
function collapseFor(i: number, v: number) {
  const k = HIDDEN.indexOf(i);
  if (k < 0) return 0;
  const from = (HIDDEN.length - 1 - k) * 0.4;
  const [a, b] = T.filter;
  return segAt(v, lerp(a, b, from), lerp(a, b, from + 0.6), easeInOutCubic);
}

const rowsOpen = (v: number) => PATTERNS.reduce((sum, _, i) => sum + 1 - collapseFor(i, v), 0);
const menuOpen = (v: number) => segAt(v, T.menu[0], T.menu[1], easeOutCubic);

function blockHeight(v: number) {
  const a = TRIGGER_H + menuOpen(v) * (MENU_GAP + MENU_CHROME + ROW_H * rowsOpen(v));
  if (v < T.ship[0]) return lerp(a, V1_H, segAt(v, T.acct[0], T.acct[1], easeInOutCubic));
  return lerp(V1_H, SHIP_H, segAt(v, T.ship[0], T.ship[1], easeInOutCubic));
}

function Chevron({ open }: { open: MV }) {
  const rotate = useTransform(open, (v) => v * 180);
  return (
    <motion.svg style={{ rotate }} width="12" height="12" viewBox="0 0 12 12" aria-hidden className="shrink-0">
      <path d="M2.5 4.5L6 8L9.5 4.5" fill="none" stroke="var(--color-dim)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </motion.svg>
  );
}

function Trigger({ p, count, idx }: { p: MV; count: (v: number) => string; idx: MV }) {
  const open = useTransform(p, menuOpen);
  const label = useTransform(p, count);
  return (
    <div className="flex items-center gap-2 rounded-lg border border-line-strong bg-surface-2 px-2.5" style={{ height: TRIGGER_H }}>
      <RollLines
        idx={idx}
        lines={[<span key="a" className="text-mute">{PLACEHOLDER}</span>, <span key="b" className="text-fg">{PICKED.name}</span>]}
        className="min-w-0 flex-1 text-[12px] font-medium"
      />
      <motion.span className={`${MONO} shrink-0 text-[10px] text-mute`}>{label}</motion.span>
      <Chevron open={open} />
    </div>
  );
}

function GenderChip({ gender }: { gender: Pattern["gender"] }) {
  return (
    <span className={`${MONO} inline-flex shrink-0 items-center rounded-[4px] px-1.5 py-[2px] text-[10px] uppercase leading-none tracking-[0.1em] text-fg`} style={{ background: toneTint(CHIP_TONE[gender], 0.4) }}>
      {gender}
    </span>
  );
}

type RowProps = { p: MV; pattern: Pattern; index?: number; lit?: MvIn };

function MenuRow({ p, pattern, index = -1, lit = 0 }: RowProps) {
  const height = useTransform(p, (v) => ROW_H * (1 - collapseFor(index, v)));
  const glow = useMv(lit);
  return (
    <motion.div style={{ height }} className="relative overflow-hidden">
      <motion.i aria-hidden style={{ opacity: glow }} className="absolute inset-0 rounded-md bg-accent/20" />
      <div className="relative flex items-center gap-2 px-1.5" style={{ height: ROW_H }}>
        <MtmGlyph name={pattern.garment} size={20} />
        <span className="min-w-0 flex-1 truncate text-[12px] text-fg">{pattern.name}</span>
        <GenderChip gender={pattern.gender} />
      </div>
    </motion.div>
  );
}

function MenuFrame({ height, children }: { height: MvIn; children: ReactNode }) {
  const h = useMv(height);
  return (
    <motion.div style={{ height: h }} className="mt-1 overflow-hidden rounded-lg border border-line-strong bg-surface-1 p-1">
      {children}
    </motion.div>
  );
}

const menuAll = (v: number) => `${Math.round(rowsOpen(v))} of ${PATTERNS.length}`;
const menuShip = () => `${SHOWN_FALLBACK.length} of ${WOMEN_ONLY_ACCOUNT.length}`;

function BlockAll({ p }: { p: MV }) {
  const idx = useMv(0);
  const height = useTransform(p, (v) => menuOpen(v) * (MENU_CHROME + ROW_H * rowsOpen(v)));
  return (
    <>
      <Trigger p={p} count={menuAll} idx={idx} />
      <MenuFrame height={height}>
        {PATTERNS.map((pt, i) => (
          <MenuRow key={pt.id} p={p} pattern={pt} index={i} />
        ))}
      </MenuFrame>
    </>
  );
}

/* The hidden state, shown in place: the dropdown as a struck ghost with the reason, tagged as an earlier version. */
function BlockV1() {
  const still = useMv(0);
  return (
    <div className="flex flex-col" style={{ height: V1_H }}>
      <div className={`${MONO} flex h-5 items-center justify-between text-[10px] uppercase leading-none tracking-[0.1em]`}>
        <span className="text-mute">{V1.eyebrow}</span>
        <span className="rounded-[4px] px-1.5 py-[3px] text-fg" style={{ background: toneTint("rose", 0.25) }}>
          {V1.tag}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2 rounded-lg border border-dashed border-line-strong px-2.5 opacity-70" style={{ height: TRIGGER_H }}>
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-mute line-through">{V1.ghost}</span>
        <Chevron open={still} />
      </div>
      <p className="mt-3 flex items-center gap-1.5 text-[12px] leading-4 text-dim">
        <MtmGlyph name="cross" size={16} />
        {V1.title}
      </p>
    </div>
  );
}

function BlockShip({ p, pick }: { p: MV; pick: MV }) {
  return (
    <>
      <Trigger p={p} count={menuShip} idx={pick} />
      <MenuFrame height={MENU_CHROME + ROW_H * SHOWN_FALLBACK.length}>
        {SHOWN_FALLBACK.map((pt, i) => (
          <MenuRow key={pt.id} p={p} pattern={pt} lit={i === 0 ? pick : 0} />
        ))}
      </MenuFrame>
      <p className={`${MONO} flex items-center gap-1.5 text-[10px] leading-none text-dim`} style={{ height: NOTE_H, paddingTop: 8 }}>
        <MtmGlyph name="check" size={12} />
        {SHIPPED_NOTE}
      </p>
    </>
  );
}

function AccountRow({ p }: { p: MV }) {
  const swap = useSeg(p, T.acct[0], T.acct[1], easeInOutCubic);
  const ring = useTransform(p, (v) => bell(segAt(v, T.filter[0] - 0.008, T.filter[0] + 0.03)));
  const bump = useTransform(ring, (r) => 1 + 0.05 * r);
  return (
    <div className="mb-2 flex h-6 shrink-0 items-center justify-between gap-2">
      <span className="flex min-w-0 flex-1 items-center gap-1.5">
        <MtmGlyph name="user" size={16} />
        <RollLines idx={swap} lines={ACCOUNTS} h={16} className={`${MONO} min-w-0 flex-1 text-[10px] text-dim`} />
      </span>
      <motion.span style={{ scale: bump, background: toneTint("sky", 0.3) }} className="relative inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full px-2.5">
        <motion.i aria-hidden style={{ opacity: ring }} className="absolute -inset-px rounded-full border-2 border-accent" />
        <MtmGlyph name="filter" size={14} />
        <span className="relative text-[11px] font-medium leading-none text-fg">
          <span className="hidden @[24rem]:inline">{FILTER.key}: </span>
          {FILTER.value}
        </span>
      </motion.span>
    </div>
  );
}

const BLOCK_X = [T.acct[0], T.acct[1], T.ship[0], T.ship[1]] as const;

/* One line under the button once it is ready: which saved pattern now stands behind the choice. */
function Receipt({ unlock }: { unlock: MV }) {
  const y = useTransform(unlock, (v) => (1 - v) * 6);
  return (
    <motion.p style={{ opacity: unlock, y, height: RECEIPT_H }} className="mt-2 flex shrink-0 items-center gap-1.5 text-[12px] leading-none text-fg">
      <MtmGlyph name="check" size={16} />
      <span className="min-w-0 truncate font-medium">{PICKED.name}</span>
      <span className={`${MONO} ml-auto shrink-0 text-[10px] text-mute`}>{RECEIPT}</span>
    </motion.p>
  );
}

export default function SelectPage({ p }: { p: MV }) {
  const height = useTransform(p, blockHeight);
  const pos = useKeys(p, BLOCK_X, [0, 1, 1, 2]);
  const pick = useSeg(p, T.pick[0], T.pick[1], easeInOutCubic);
  const unlock = useSeg(p, T.unlock[0], T.unlock[1]);
  const travel = useSeg(p, T.tapRow.travel[0], T.tapRow.travel[1], easeInOutCubic);
  const press = useSeg(p, T.tapRow.press[0], T.tapRow.press[1]);
  const show = useTransform(p, (v) => segAt(v, T.tapRow.travel[0], T.tapRow.travel[0] + 0.012) * (1 - segAt(v, T.pick[1], T.pick[1] + 0.012)));
  return (
    <div className={COLUMN}>
      <div className="mt-3.5 flex shrink-0 flex-col">
        <AccountRow p={p} />
        <motion.div style={{ height }} className="relative shrink-0">
          <WipePages
            pos={pos}
            className="relative h-full w-full"
            pages={[<BlockAll key="all" p={p} />, <BlockV1 key="v1" />, <BlockShip key="ship" p={p} pick={pick} />]}
          />
          <div className="absolute left-[60%]" style={{ top: TAP_TOP }}>
            <Pointer t={travel} press={press} show={show} from={[50, 44]} />
          </div>
        </motion.div>
      </div>
      <div className="mt-auto shrink-0 pt-3">
        <CartButton unlock={unlock} />
        <Receipt unlock={unlock} />
      </div>
    </div>
  );
}
