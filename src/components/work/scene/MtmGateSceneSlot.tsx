"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { MtmGlyph, type MtmGlyphName } from "./MtmKitGlyphs";
import { CartButton } from "./MtmKitCards";
import { clamp01, toneTint, type ToneName } from "./MtmKitMath";
import { CHIP, CHIPS_FRESH, CHIPS_SAVED, HINT, PIN_FRESH, PIN_SAVED, type PinChip } from "./MtmGateSceneData";
import type { GateMotion } from "./MtmGateSceneMotion";
import { Ink, WipeStack } from "./MtmGateSceneWipe";

/* The bar above the cart button: what stands behind the choice. Empty, a hint about why it is locked, the pinned fit, and at
   the end a calm line that says the bail out left nothing half saved. The frame swaps under the wipe edge, the words are
   Ink, so a swap never leaves a cut word behind. */

const SLOT = "flex h-full items-center gap-2 rounded-lg border";
const SLOT_PAD = "px-3";
const CHIP_DROP = -8;

function EmptySlot() {
  return (
    <div className={`${SLOT} ${SLOT_PAD} border-dashed border-line-strong`}>
      <Ink className="flex w-full items-center justify-between gap-2">
        <span className={`${MONO} text-[10px] uppercase tracking-[0.12em] text-mute`}>{HINT.empty.label}</span>
        <span className="text-[12px] text-dim">{HINT.empty.value}</span>
      </Ink>
    </div>
  );
}

function HintSlot({ text, glyph, tone }: { text: string; glyph: MtmGlyphName; tone: ToneName }) {
  return (
    <div className={`${SLOT} ${SLOT_PAD}`} style={{ background: toneTint(tone, 0.14), borderColor: toneTint(tone, 0.7) }}>
      <Ink className="flex min-w-0 items-center gap-2">
        <MtmGlyph name={glyph} size={18} />
        <span className="min-w-0 truncate text-[12px] text-fg">{text}</span>
      </Ink>
    </div>
  );
}

function SettledSlot() {
  return (
    <div className={`${SLOT} ${SLOT_PAD}`} style={{ background: toneTint("mint", 0.1), borderColor: toneTint("mint", 0.6) }}>
      <Ink className="flex min-w-0 items-center gap-2">
        <MtmGlyph name="check" size={18} />
        <span className="min-w-0 truncate text-[12px] text-fg">{HINT.settled}</span>
      </Ink>
    </div>
  );
}

function PinChipView({ chip, p, a }: { chip: PinChip; p: MV; a: number }) {
  const t = useSeg(p, a, a + CHIP.len, easeOutBack);
  const opacity = useTransform(t, (v) => clamp01(v * 2));
  const y = useTransform(t, (v) => (1 - v) * CHIP_DROP);
  return (
    <motion.div style={{ opacity, y }} className="min-w-0 flex-1 rounded-md bg-surface-2 px-0.5 py-1 text-center leading-none">
      <p className={`${MONO} truncate text-[10px] text-mute`}>{chip.label}</p>
      <p className="mt-1 truncate text-[11px] font-medium tabular-nums text-fg">{chip.value}</p>
    </motion.div>
  );
}

function PinnedSlot({ chips, start, p }: { chips: readonly PinChip[]; start: number; p: MV }) {
  return (
    <div className={`${SLOT} gap-1 px-1.5`} style={{ background: toneTint("mint", 0.1), borderColor: toneTint("mint", 0.6) }}>
      <Ink className="flex w-full min-w-0 gap-1">
        {chips.map((chip, i) => (
          <PinChipView key={chip.label} chip={chip} p={p} a={start + i * CHIP.stagger} />
        ))}
      </Ink>
    </div>
  );
}

export function CartBar({ p, m }: { p: MV; m: GateMotion }) {
  const pages = [
    <EmptySlot key="0" />,
    <HintSlot key="1" text={HINT.locked} glyph="warning" tone="sun" />,
    <EmptySlot key="2" />,
    <PinnedSlot key="3" chips={PIN_SAVED} start={CHIPS_SAVED} p={p} />,
    <EmptySlot key="4" />,
    <HintSlot key="5" text={HINT.sleeve} glyph="cross" tone="rose" />,
    <EmptySlot key="6" />,
    <PinnedSlot key="7" chips={PIN_FRESH} start={CHIPS_FRESH} p={p} />,
    <EmptySlot key="8" />,
    <HintSlot key="9" text={HINT.locked} glyph="warning" tone="sun" />,
    <SettledSlot key="10" />,
  ];
  return (
    <div className="shrink-0 border-t border-line bg-surface-1 px-3 pb-2.5 pt-2">
      <WipeStack pos={m.slotPos} pages={pages} className="h-10" />
      <motion.div style={{ x: m.shake }} className="mt-1.5">
        <CartButton unlock={m.unlock} press={m.press} />
      </motion.div>
    </div>
  );
}
