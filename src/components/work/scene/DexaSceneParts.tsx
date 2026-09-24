"use client";

import { motion, useTransform } from "framer-motion";
import { easeInOutCubic, easeOutBack, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { BarsChart, ColumnsChart, PictureArt } from "./DexaSceneArt";
import {
  BODY_W,
  NEW_CHART,
  NEW_SLOT,
  PAGES,
  PAGE_H,
  PAGE_HEAD,
  PAGE_W,
  STRIP,
  STRIP_CHARTS,
  STRIP_MARKS,
  TL,
  type Box,
  type DashBlock,
  type PageCfg,
} from "./DexaSceneData";
import { TXT, lerp, px, useExit, useKeys, useSpan } from "./DexaSceneKit";
import { PageBadge } from "./DexaSceneIcons";

const DASH_FRACTIONS = [0.9, 0.62, 0.78, 0.5, 0.86, 0.66, 0.72, 0.56] as const;
const DASH_PITCH = 7;
const DASH_H = 2.6;
const DASH_LABEL_SHARE = 0.72;
const DASH_VALUE_SHARE = 0.2;
const DIM_AMOUNT = 0.62;
const FLASH_VALS = [0, 0.85, 0.85, 0] as const;
const flashKeys = (at: number) => [at, at + TL.flashLen[0], at + TL.flashLen[1], at + TL.flashLen[2]];
const flashAt = (index: number) => TL.flashStart + TL.flashStep * index;

function Dashes({ block }: { block: DashBlock }) {
  return (
    <g className="fill-surface-1/30">
      {Array.from({ length: block.rows }, (_, i) => {
        const y = block.y + i * DASH_PITCH;
        const label = block.w * DASH_FRACTIONS[i % DASH_FRACTIONS.length] * DASH_LABEL_SHARE;
        return (
          <g key={i}>
            <rect x={block.x} y={y} width={label} height={DASH_H} rx={DASH_H / 2} />
            <rect x={block.x + block.w * (1 - DASH_VALUE_SHARE)} y={y} width={block.w * DASH_VALUE_SHARE} height={DASH_H} rx={DASH_H / 2} />
          </g>
        );
      })}
    </g>
  );
}

function ChartOnPage({ cfg }: { cfg: PageCfg }) {
  const [x, y, w, h] = cfg.chart;
  return (
    <g transform={`translate(${px(x)} ${px(y)})`}>
      {cfg.kind === "bars" && <BarsChart w={w} h={h} />}
      {cfg.kind === "columns" && <ColumnsChart w={w} h={h} />}
      {cfg.kind === "figure" && (
        <g transform={`scale(${px(w / BODY_W)})`}>
          <PictureArt />
        </g>
      )}
    </g>
  );
}

type PoseKey = "dx" | "dy" | "rot";

function usePose(open: MV, flat: MV, cfg: PageCfg, key: PoseKey): MV {
  return useTransform([open, flat], ([o, f]: number[]) => lerp(lerp(cfg.stack[key], cfg.fan[key], o), 0, f));
}

function PageChip({ unit, pop }: { unit: string; pop: MV }) {
  const { x, y, w, h } = PAGE_HEAD.chip;
  return (
    <motion.g style={{ scale: pop }}>
      <rect x={x} y={y} width={w} height={h} rx={3} className="fill-surface-1" />
      <text x={x + w / 2} y={PAGE_HEAD.labelY} textAnchor="middle" className={`${TXT} fill-fg`}>
        {unit}
      </text>
    </motion.g>
  );
}

export function PdfPage({ p, cfg, index }: { p: MV; cfg: PageCfg; index: number }) {
  const open = useSpan(p, TL.fanOut, easeOutCubic);
  const flat = useSpan(p, TL.squareUp, easeInOutCubic);
  const { drop, fade } = useExit(p);
  const dim = useSpan(p, TL.dim);
  const at = flashAt(index);

  const dx = usePose(open, flat, cfg, "dx");
  const dy = usePose(open, flat, cfg, "dy");
  const rot = usePose(open, flat, cfg, "rot");
  const y = useTransform([dy, drop], ([a, e]: number[]) => a + e);
  const opacity = useTransform([fade, dim], ([f, d]: number[]) => f * (1 - (cfg.focus ? 0 : d * DIM_AMOUNT)));

  const label = useSpan(p, TL.label);
  const pop = useSeg(p, at + TL.flashLen[0], at + TL.flashLen[1], easeOutBack);
  const flash = useKeys(p, flashKeys(at), FLASH_VALS);
  const [cx, cy, cw, ch] = cfg.chart;

  return (
    <motion.g style={{ x: dx, y, rotate: rot, opacity }}>
      <g transform={`translate(${cfg.x} ${cfg.y})`}>
        <rect x={PAGE_HEAD.shadow.dx} y={PAGE_HEAD.shadow.dy} width={PAGE_W} height={PAGE_H} rx={3} className="fill-surface-1/55" />
        <rect width={PAGE_W} height={PAGE_H} rx={3} className="fill-fg" />
        <motion.text x={PAGE_HEAD.labelX} y={PAGE_HEAD.labelY} style={{ opacity: label }} className={`${TXT} fill-surface-1`}>
          vendor {cfg.vendor}
        </motion.text>
        <PageChip unit={cfg.unit} pop={pop} />
        {cfg.dashes.map((d) => (
          <Dashes key={`${d.x}-${d.y}`} block={d} />
        ))}
        <motion.rect x={cx - 2} y={cy - 2} width={cw + 4} height={ch + 4} rx={3} style={{ opacity: flash, fill: cfg.color }} />
        <ChartOnPage cfg={cfg} />
        <PageBadge p={p} focus={cfg.focus} />
      </g>
    </motion.g>
  );
}

function SlotOutline({ x }: { x: number }) {
  return <rect x={x} y={STRIP.y} width={STRIP.w} height={STRIP.h} rx={2.5} strokeDasharray="2.5 2.5" strokeWidth={0.8} className="fill-none stroke-fg/30" />;
}

function GlyphPaper({ box }: { box: Box }) {
  const [x, y, w, h] = box;
  return (
    <>
      <rect width={STRIP.w} height={STRIP.h} rx={2.5} className="fill-fg" />
      <rect x={x} y={y} width={w} height={h} rx={1.5} className="fill-surface-1/55" />
    </>
  );
}

const GLYPH_DROP = 8;

function StripGlyph({ p, i, box }: { p: MV; i: number; box: Box }) {
  const start = TL.stripStart + i * TL.stripStep;
  const pop = useSeg(p, start, start + 0.03, easeOutBack);
  const drop = useTransform(pop, (v) => (1 - v) * GLYPH_DROP);
  const opacity = useSeg(p, start, start + 0.012);
  const mark = STRIP_MARKS[i];
  const ring = useKeys(p, flashKeys(flashAt(mark ?? 0)), FLASH_VALS);
  const x = STRIP.x + i * STRIP.pitch;
  return (
    <g>
      <SlotOutline x={x} />
      <motion.g style={{ scale: pop, y: drop, opacity }}>
        <g transform={`translate(${x} ${STRIP.y})`}>
          <GlyphPaper box={box} />
          {mark !== undefined && (
            <motion.rect width={STRIP.w} height={STRIP.h} rx={2.5} strokeWidth={2} style={{ opacity: ring, stroke: PAGES[mark].color }} className="fill-none" />
          )}
        </g>
      </motion.g>
    </g>
  );
}

const NEW_MARK_PAD = 1.5;
/* The strip label counts the 13th layout as soon as its slot is filled. */
const LABEL_FLIP = TL.lock[0] + 0.02;

function NewVendor({ p }: { p: MV }) {
  const pop = useSpan(p, TL.lock, easeOutBack);
  const fill = useKeys(p, [TL.lock[0] + 0.01, TL.lock[0] + 0.03], [0, 1]);
  const mark = useKeys(p, [TL.lock[0], TL.lock[0] + 0.012], [1, 0]);
  const x = STRIP.x + NEW_SLOT * STRIP.pitch;
  const [bx, by, bw, bh] = NEW_CHART;
  const rx = useTransform(pop, (v) => lerp(x, x + bx - NEW_MARK_PAD, v));
  const ry = useTransform(pop, (v) => lerp(STRIP.y, STRIP.y + by - NEW_MARK_PAD, v));
  const rw = useTransform(pop, (v) => lerp(STRIP.w, bw + NEW_MARK_PAD * 2, v));
  const rh = useTransform(pop, (v) => lerp(STRIP.h, bh + NEW_MARK_PAD * 2, v));
  const cx = x + STRIP.w / 2;
  return (
    <g>
      <SlotOutline x={x} />
      <motion.text x={cx} y={STRIP.y + STRIP.h / 2 + 4} textAnchor="middle" style={{ opacity: mark }} className={`${TXT} fill-mute`}>
        ?
      </motion.text>
      <motion.g style={{ opacity: fill }}>
        <g transform={`translate(${x} ${STRIP.y})`}>
          <GlyphPaper box={NEW_CHART} />
        </g>
      </motion.g>
      <motion.rect x={rx} y={ry} width={rw} height={rh} rx={1.5} strokeWidth={1.4} style={{ opacity: fill }} className="fill-none stroke-accent" />
      <motion.text x={cx} y={STRIP.y + STRIP.h + 15} textAnchor="middle" style={{ opacity: fill }} className={`${TXT} fill-fg`}>
        new
      </motion.text>
    </g>
  );
}

export function Strip({ p }: { p: MV }) {
  const { drop, fade } = useExit(p);
  const label = useTransform(p, (v) => `${STRIP_CHARTS.length + (v >= LABEL_FLIP ? 1 : 0)} vendor layouts`);
  return (
    <motion.g style={{ y: drop, opacity: fade }}>
      <motion.text x={STRIP.x} y={STRIP.labelY} className={`${TXT} fill-mute`}>
        {label}
      </motion.text>
      {STRIP_CHARTS.map((box, i) => (
        <StripGlyph key={i} p={p} i={i} box={box} />
      ))}
      <NewVendor p={p} />
    </motion.g>
  );
}
