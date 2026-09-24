"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { IconPop } from "./GeneticsSceneIcons";
import {
  BIN_H,
  BIN_LEN,
  BIN_STAGGER,
  BIN_START,
  BIN_W,
  BIN_X,
  CHIPS,
  CHIP_LEN,
  CHIP_STAGGER,
  CHIP_START,
  CHIP_W,
  CHIP_X,
  FLIGHT_LEN,
  HEAD_TOP,
  LANES,
  NAMED_FLIGHT,
  READ_END,
  REVEAL_LEN,
  SLOT_START,
  ROW_H,
  ROW_PAD_PX,
  ROW_W,
  ROW_X,
  binCount,
  binCover,
  binTop,
  clamp01,
  dotClarity,
  flightX,
  headerClear,
  lerp,
  num,
  pct,
  rainOpacity,
  readY,
  rowTop,
  rsidY,
  stripY,
  type Chip,
  type NamedTok,
  type RainTok,
} from "./GeneticsSceneData";


function useShift(shift?: MV): MV {
  const zero = useMotionValue(0);
  return shift ?? zero;
}

/* An anonymous rsID: rain, then a coloured dot flying to its pathway strip. */
export function RainToken({ p, rain, tok }: { p: MV; rain: MV; tok: RainTok }) {
  const f = useSeg(p, tok.t0, tok.t0 + FLIGHT_LEN, easeInOutCubic);
  const yRain = (r: number) => tok.y0 + tok.drift * r;
  const yNow = (r: number, t: number) => lerp(yRain(r), stripY(tok.lane), t);
  const top = useTransform([rain, f], ([r, t]: number[]) => pct(yNow(r, t)));
  const left = useTransform(
    f,
    (t) => `calc(${num(flightX(tok, t))}% + var(--dp) * ${num(t * tok.slot, 3)})`,
  );
  const textOp = useTransform([p, rain, f], ([v, r, t]: number[]) => {
    const lit = rainOpacity(yRain(r), tok.tone, readY(v)) * (1 - clamp01(t / 0.35));
    const x = flightX(tok, t);
    const y = yNow(r, t);
    return num(lit * (1 - binCover(v, x, y)) * headerClear(x, y), 3);
  });
  const dotOp = useTransform([rain, f], ([r, t]: number[]) =>
    num(clamp01((t - 0.05) / 0.35) * dotClarity(flightX(tok, t), yNow(r, t), tok.lane), 3),
  );
  return (
    <motion.span aria-hidden style={{ top, left }} className="absolute -translate-y-1/2 whitespace-nowrap leading-none">
      <motion.span style={{ opacity: textOp }} className={`relative ${MONO} text-[10px] text-fg @min-[500px]:text-[12px]`}>
        {tok.text}
        {tok.geno ? (
          <span className="absolute left-0 top-full mt-0.5 text-dim @min-[500px]:static @min-[500px]:ml-2">{tok.geno}</span>
        ) : null}
      </motion.span>
      <motion.i
        style={{ opacity: dotOp, background: LANES[tok.lane].color }}
        className="absolute left-0 top-1/2 h-[5px] w-[5px] -translate-y-1/2 rounded-full @min-[500px]:h-[6px] @min-[500px]:w-[6px]"
      />
    </motion.span>
  );
}

/* Bright scan line that reads the rsIDs top to bottom, with a lit trail behind it. */
export function ReadHead({ p }: { p: MV }) {
  const top = useTransform(p, (v) => pct(readY(v)));
  const opacity = useTransform(p, [0, 0.012, READ_END - 0.012, READ_END], [0, 1, 1, 0]);
  return (
    <motion.div aria-hidden style={{ top, opacity }} className="pointer-events-none absolute inset-x-0 h-0">
      <i className="absolute inset-x-0 -top-16 h-16 bg-linear-to-b from-transparent to-accent/25" />
      <i className="absolute inset-x-0 top-0 h-0.5 bg-accent shadow-[0_0_12px_var(--color-accent)]" />
    </motion.div>
  );
}

function useRowReveal(p: MV, a: number) {
  const r = useSeg(p, a, a + REVEAL_LEN);
  const front = useTransform(r, [0.08, 0.92], [0, 100], { clamp: true });
  const clip = useTransform(front, (q) => `inset(0 ${num(100 - q)}% 0 0 round 6px)`);
  const edgeLeft = useTransform(front, (q) => `${num(q)}%`);
  const edgeOp = useTransform(r, [0.02, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return { clip, edgeLeft, edgeOp };
}

function useNamedMotion(p: MV, rain: MV, v: NamedTok, sh: MV) {
  const f = useSeg(p, v.t0, v.t0 + NAMED_FLIGHT, easeInOutCubic);
  const yRain = (q: number) => v.y0 + v.drift * q;
  const rowTopMv = useTransform(sh, (s) => pct(rowTop(v.lane) + s));
  const tokTop = useTransform([rain, f, sh], ([q, t, s]: number[]) => pct(lerp(yRain(q), rsidY(v.lane), t) + s));
  const tokLeft = useTransform(
    f,
    (t) => `calc(${num(lerp(v.x, ROW_X, t))}% + ${num(t * ROW_PAD_PX)}px)`,
  );
  const tokOp = useTransform([rain, f], ([q, t]: number[]) => {
    const seen = lerp(rainOpacity(yRain(q), 1, q), 1, clamp01(t / 0.4));
    return num(seen * headerClear(lerp(v.x, ROW_X, t), lerp(yRain(q), rsidY(v.lane), t)), 3);
  });
  return { rowTopMv, tokTop, tokLeft, tokOp };
}

function RowLabel({ v }: { v: NamedTok }) {
  return (
    <div className="absolute inset-x-2 top-[30%] flex -translate-y-1/2 items-center justify-between gap-2 text-[10.5px] @min-[500px]:text-[13px]">
      <span className="flex min-w-0 items-center gap-1.5 text-fg">
        <i
          className="h-1.5 w-1.5 shrink-0 rounded-full"
          style={{ background: v.flag ? "var(--color-accent)" : "var(--color-mint)" }}
        />
        <span className="truncate font-medium">{v.gene}</span>
      </span>
      <span className="shrink-0 text-dim">
        {v.short ? (
          <>
            <span className="@min-[500px]:hidden">{v.short}</span>
            <span className="hidden @min-[500px]:inline">{v.value}</span>
          </>
        ) : (
          v.value
        )}
      </span>
    </div>
  );
}

/* A named variant: the rsID flies into the row, then the gene label is scanned in beside it. */
export function NamedVariant({ p, rain, v, shift, halo }: { p: MV; rain: MV; v: NamedTok; shift?: MV; halo?: MV }) {
  const sh = useShift(shift);
  const noHalo = useMotionValue(0);
  const { clip, edgeLeft, edgeOp } = useRowReveal(p, v.reveal);
  const { rowTopMv, tokTop, tokLeft, tokOp } = useNamedMotion(p, rain, v, sh);
  return (
    <>
      <motion.div
        aria-hidden
        style={{ top: rowTopMv, left: pct(ROW_X), width: pct(ROW_W), height: pct(ROW_H) }}
        className="absolute"
      >
        <motion.div style={{ clipPath: clip }} className="absolute inset-0 rounded-md bg-surface-2">
          <RowLabel v={v} />
        </motion.div>
        <motion.i
          style={{ left: edgeLeft, opacity: edgeOp }}
          className="absolute bottom-0.5 top-0.5 w-0.5 -translate-x-1/2 rounded-full bg-accent"
        />
        <motion.i style={{ opacity: halo ?? noHalo }} className="absolute inset-0 rounded-md border border-accent" />
      </motion.div>
      <motion.span
        aria-hidden
        style={{ top: tokTop, left: tokLeft, opacity: tokOp }}
        className={`absolute -translate-y-1/2 whitespace-nowrap leading-none ${MONO} text-[10px] text-fg @min-[500px]:text-[12px]`}
      >
        {v.rsid}
      </motion.span>
    </>
  );
}


export function LaneBin({ p, i }: { p: MV; i: number }) {
  const lane = LANES[i];
  const a = BIN_START + BIN_STAGGER * i;
  const t = useSeg(p, a, a + BIN_LEN, easeOutCubic);
  const clip = useTransform(t, (v) => `inset(0 0 ${num((1 - v) * 100)}% 0 round 10px)`);
  const headOp = useSeg(p, a + 0.015, a + BIN_LEN - 0.005);
  const countText = useTransform(p, (v) => String(binCount(i, v)));
  return (
    <div
      aria-hidden
      className="absolute"
      style={{ left: pct(BIN_X), top: pct(binTop(i)), width: pct(BIN_W), height: pct(BIN_H) }}
    >
      <motion.div
        style={{ clipPath: clip, borderTopColor: lane.color }}
        className="absolute inset-0 rounded-[10px] border border-t-2 border-line-strong bg-surface-1"
      />
      <motion.div
        style={{ opacity: headOp }}
        className={`absolute inset-x-2 top-[13%] flex -translate-y-1/2 items-center justify-between ${MONO} text-[10px] uppercase tracking-[0.12em] @min-[500px]:text-[11px]`}
      >
        <span className="flex items-center gap-1.5 text-fg">
          <i className="h-1.5 w-1.5 rounded-full" style={{ background: lane.color }} />
          {lane.name}
        </span>
        <span className="normal-case tracking-normal text-dim">
          <motion.span className="tabular-nums">{countText}</motion.span>
          <span className="hidden @min-[500px]:inline"> variants</span>
        </span>
      </motion.div>
    </div>
  );
}

function ChipFace({ chip }: { chip: Chip }) {
  return (
    <div className="flex h-full flex-col justify-center gap-0.5 rounded-md border border-line-strong bg-surface-2 px-2">
      <span className="flex items-center justify-between gap-1 text-[10px] leading-none text-dim @min-[500px]:text-[11.5px]">
        <span className="flex min-w-0 items-center gap-1.5">
          <i
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: chip.tag ? "var(--color-accent)" : "var(--color-mint)" }}
          />
          <span className="truncate">{chip.label}</span>
        </span>
        {chip.tag ? <span className={`${MONO} text-[10px] text-fg`}>{chip.tag}</span> : null}
      </span>
      <span className="text-[11px] font-medium leading-none tabular-nums text-fg @min-[500px]:text-[13.5px]">{chip.value}</span>
    </div>
  );
}


/* Reveal front (0 to 100 percent) shared by a chip and its slot, so their clips are complementary. */
function useChipFront(p: MV, i: number) {
  const a = CHIP_START + CHIP_STAGGER * i;
  const t = useSeg(p, a, a + CHIP_LEN, easeOutCubic);
  const front = useTransform(t, [0.02, 0.98], [0, 100], { clamp: true });
  const edgeOp = useTransform(t, [0.02, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return { front, edgeOp };
}

/* A blood chip is scanned in left to right over its dashed slot, never faded or slid, so it never ghosts. */
export function BloodChip({ p, i, shift, halo }: { p: MV; i: number; shift?: MV; halo?: MV }) {
  const chip = CHIPS[i];
  const sh = useShift(shift);
  const noHalo = useMotionValue(0);
  const { front, edgeOp } = useChipFront(p, i);
  const top = useTransform(sh, (s) => pct(chip.y - ROW_H / 2 + s));
  const clip = useTransform(front, (q) => `inset(0 ${num(100 - q)}% 0 0 round 6px)`);
  const edgeLeft = useTransform(front, (q) => `${num(q)}%`);
  return (
    <motion.div
      aria-hidden
      style={{ top, left: pct(CHIP_X), width: pct(CHIP_W), height: pct(ROW_H) }}
      className="absolute"
    >
      <motion.div style={{ clipPath: clip }} className="absolute inset-0">
        <ChipFace chip={chip} />
      </motion.div>
      <motion.i
        style={{ left: edgeLeft, opacity: edgeOp }}
        className="absolute bottom-0.5 top-0.5 w-0.5 -translate-x-1/2 rounded-full bg-accent"
      />
      <motion.i style={{ opacity: halo ?? noHalo }} className="absolute inset-0 rounded-md border border-accent" />
    </motion.div>
  );
}

/* Dashed outline with a ghost label where a blood chip will land; the chip scan consumes it. */
export function BloodSlot({ p, i }: { p: MV; i: number }) {
  const shown = useSeg(p, SLOT_START + 0.008 * i, SLOT_START + 0.008 * i + 0.04);
  const { front } = useChipFront(p, i);
  const clip = useTransform(front, (q) => `inset(0 0 0 ${num(q)}% round 6px)`);
  return (
    <motion.div
      aria-hidden
      style={{
        opacity: shown,
        clipPath: clip,
        top: pct(CHIPS[i].y - ROW_H / 2),
        left: pct(CHIP_X),
        width: pct(CHIP_W),
        height: pct(ROW_H),
      }}
      className="absolute rounded-md border border-dashed border-line-strong"
    >
      <span
        className={`absolute inset-x-2 top-1/2 -translate-y-1/2 whitespace-nowrap ${MONO} text-[10px] uppercase tracking-[0.1em] text-mute opacity-60 @min-[500px]:text-[11px]`}
      >
        {CHIPS[i].label}
      </span>
    </motion.div>
  );
}

export function BloodLabel({ p }: { p: MV }) {
  const o = useSeg(p, SLOT_START, SLOT_START + 0.05);
  return (
    <div
      aria-hidden
      style={{ left: pct(CHIP_X), top: pct(HEAD_TOP) }}
      className="absolute flex -translate-y-1/2 items-center gap-1"
    >
      <IconPop p={p} name="lab-blood" from={SLOT_START} len={0.05} />
      <motion.span
        style={{ opacity: o }}
        className={`${MONO} text-[10px] uppercase tracking-[0.14em] text-mute @min-[500px]:text-[11px]`}
      >
        Blood panel
      </motion.span>
    </div>
  );
}
