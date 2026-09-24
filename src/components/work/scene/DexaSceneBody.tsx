"use client";

import { motion, useTransform } from "framer-motion";
import { easeInOutCubic, easeOutBack, easeOutCubic, easeOutExpo, useSeg, type MV } from "./HealthSceneParts";
import { PictureArt, Shapes, VectorBackdrop } from "./DexaSceneArt";
import {
  BODY_BOX,
  BODY_H,
  BODY_W,
  CARD_BOX,
  FACTS,
  HERO,
  LIFT,
  REGIONS,
  ROW,
  ROW_GROW,
  SEG_GAP,
  TL,
  VAT_CLASSES,
  VAT_CLASS_IDX,
  arriveAt,
  landAt,
  passAt,
  slotAt,
  trackAt,
  type Region,
} from "./DexaSceneData";
import { TXT, easeSnap, lerp, px, useExtra, useKeys, useSpan, useUid } from "./DexaSceneKit";

const VAT_INDEX = REGIONS.length - 1;
const pulseAt = (i: number) => (i < VAT_INDEX ? landAt(i) : TL.vatPill[0] + 0.03);
const rowTop = (i: number, extra: number) => ROW.y0 + i * (ROW.pitch + ROW_GROW * extra);
const BODY_SCALE = BODY_BOX[2] / BODY_W;
const HALO_W = 2.6;

function RegionFill({ p, region, i }: { p: MV; region: Region; i: number }) {
  const at = pulseAt(i);
  const pulse = useKeys(p, [at - 0.006, at + 0.012, at + 0.05], [0, 1, 0]);
  return (
    <>
      <motion.g style={{ opacity: pulse }}>
        <Shapes id={region.key} className="fill-none stroke-fg" strokeWidth={HALO_W} />
      </motion.g>
      <Shapes id={region.key} style={{ fill: region.color }} />
    </>
  );
}

function VectorArt({ p }: { p: MV }) {
  return (
    <g>
      <VectorBackdrop />
      <Shapes id="head" className="fill-mute/45" />
      {REGIONS.map((r, i) => (
        <RegionFill key={r.key} p={p} region={r} i={i} />
      ))}
    </g>
  );
}

const SCAN_W = 1.8;

export function ExtractCard({ p }: { p: MV }) {
  const idPicture = useUid();
  const idVector = useUid();
  const cardIn = useKeys(p, TL.cardIn, [0, 1]);
  const lift = useSpan(p, TL.lift, easeInOutCubic);
  const x = useTransform(lift, (v) => v * LIFT.dx);
  const y = useTransform(lift, (v) => v * LIFT.dy - Math.sin(v * Math.PI) * LIFT.arc);
  const scale = useTransform(lift, (v) => lerp(1, LIFT.scale, v));
  const rotate = useTransform(lift, (v) => Math.sin(v * Math.PI) * LIFT.tilt);
  const scan = useSpan(p, TL.scan);
  const scanY = useTransform(scan, (v) => v * BODY_H);
  const restH = useTransform(scan, (v) => (1 - v) * BODY_H);
  const lineOp = useKeys(p, [TL.scan[0], TL.scan[0] + 0.006, TL.scan[1] - 0.006, TL.scan[1]], [0, 1, 1, 0]);
  const [bx, by, bw] = CARD_BOX;

  return (
    <motion.g style={{ x, y, scale, rotate, opacity: cardIn }}>
      <g transform={`translate(${px(bx)} ${px(by)}) scale(${(bw / BODY_W).toFixed(4)})`}>
        <clipPath id={idPicture}>
          <motion.rect x={0} y={scanY} width={BODY_W} height={restH} />
        </clipPath>
        <clipPath id={idVector}>
          <motion.rect x={0} y={0} width={BODY_W} height={scanY} />
        </clipPath>
        <g clipPath={`url(#${idPicture})`}>
          <PictureArt />
        </g>
        <g clipPath={`url(#${idVector})`}>
          <VectorArt p={p} />
        </g>
        <motion.line
          x1={0}
          x2={BODY_W}
          y1={scanY}
          y2={scanY}
          strokeWidth={SCAN_W}
          vectorEffect="non-scaling-stroke"
          style={{ opacity: lineOp }}
          className="stroke-accent"
        />
      </g>
    </motion.g>
  );
}

const fmt = (r: Region, t: number) => `${(r.value * t).toFixed(r.decimals)} ${r.unit}`;
const DOT_R = 4;
const DOT_R_START = 6;
const DOT_ARC = 16;

function FlightDot({ p, region, i }: { p: MV; region: Region; i: number }) {
  const extra = useExtra();
  const pass = passAt(region);
  const fl = useSeg(p, pass, arriveAt(region), easeInOutCubic);
  const pop = useSeg(p, pass - 0.004, pass + 0.008, easeOutBack);
  const from = [BODY_BOX[0] + region.anchor[0] * BODY_SCALE, BODY_BOX[1] + region.anchor[1] * BODY_SCALE] as const;
  const to = [ROW.x + DOT_R, rowTop(i, extra) + ROW.swatch] as const;
  const cx = useTransform(fl, (v) => lerp(from[0], to[0], v));
  const cy = useTransform(fl, (v) => lerp(from[1], to[1], v) - Math.sin(v * Math.PI) * DOT_ARC);
  const r = useTransform([fl, pop], ([f, o]: number[]) => o * lerp(DOT_R_START, DOT_R, f));
  return <motion.circle cx={cx} cy={cy} r={r} strokeWidth={1.6} style={{ fill: region.color }} className="stroke-surface-1" />;
}

const GHOST_TEXT = 0.4;
const BLANK = "...";

/* Before its number arrives a row already reads as a pending table: the label at low
   opacity and a placeholder in the value slot. The placeholder is gone before the count starts. */
function ValueLine({ p, region, i }: { p: MV; region: Region; i: number }) {
  const extra = useExtra();
  const at = arriveAt(region);
  const seen = useKeys(p, [slotAt(i), slotAt(i) + 0.02], [0, 1]);
  const real = useKeys(p, [at - 0.006, at + 0.01], [0, 1]);
  const label = useTransform([seen, real], ([s, r]: number[]) => Math.max(s * GHOST_TEXT, r));
  const blank = useTransform([seen, real], ([s, r]: number[]) => s * GHOST_TEXT * (1 - Math.min(1, r * 4)));
  const count = useSpan(p, [at, at + TL.count], easeOutCubic);
  const text = useTransform(count, (t) => fmt(region, t));
  const y = rowTop(i, extra) + ROW.label;
  return (
    <g>
      <motion.text x={ROW.x + ROW.indent} y={y} style={{ opacity: label }} className={`${TXT} fill-fg`}>
        {region.label}
      </motion.text>
      <motion.text x={ROW.x + ROW.w} y={y} textAnchor="end" style={{ opacity: blank }} className={`${TXT} fill-mute`}>
        {BLANK}
      </motion.text>
      <motion.text x={ROW.x + ROW.w} y={y} textAnchor="end" style={{ opacity: real }} className={`${TXT} fill-dim`}>
        {text}
      </motion.text>
    </g>
  );
}

const TRACK_H = 6;
const MARKER_R = 6;
const LAND_GROW = 9;
const LABEL_LIFT = 14;
const BAND: readonly [number, number] = [0.25, 0.5];

function PercentileTrack({ p, region, i }: { p: MV; region: Region; i: number }) {
  const extra = useExtra();
  const pct = region.pct ?? 0;
  const draw = useSeg(p, trackAt(i), trackAt(i) + (TL.tracks[1] - TL.tracks[0]), easeOutCubic);
  const from = TL.markersStart + i * TL.markerStep;
  const pop = useSeg(p, from - 0.012, from, easeOutBack);
  const slide = useSeg(p, from, from + TL.markerDur, easeOutExpo);
  const land = useSeg(p, landAt(i), landAt(i) + 0.04);
  const y = rowTop(i, extra) + ROW.track;
  const trackW = useTransform(draw, (v) => v * ROW.w);
  const mx = useTransform(slide, (v) => ROW.x + (ROW.w * pct * v) / 100);
  const trailW = useTransform(slide, (v) => (ROW.w * pct * v) / 100);
  const mr = useTransform(pop, (v) => v * MARKER_R);
  const label = useTransform(slide, (v) => `P${Math.round(pct * v)}`);
  const ringR = useTransform(land, (v) => MARKER_R + v * LAND_GROW);
  const ringOp = useTransform(land, (v) => (v > 0 && v < 1 ? 0.7 * (1 - v) : 0));
  const rounded = { rx: TRACK_H / 2, height: TRACK_H, y: y - TRACK_H / 2 };

  return (
    <g>
      <motion.rect x={ROW.x} width={trackW} {...rounded} className="fill-line-strong" />
      <motion.rect x={ROW.x + ROW.w * BAND[0]} width={ROW.w * BAND[1]} height={TRACK_H} y={rounded.y} style={{ opacity: draw }} className="fill-fg/20" />
      <motion.rect x={ROW.x + ROW.w * 0.5 - 0.5} y={y - TRACK_H * 1.3} width={1} height={TRACK_H * 2.6} style={{ opacity: draw }} className="fill-mute" />
      <motion.rect x={ROW.x} width={trailW} {...rounded} style={{ fill: region.color, opacity: 0.6 }} />
      <motion.circle cx={mx} cy={y} r={ringR} strokeWidth={1.4} style={{ opacity: ringOp, stroke: region.color }} className="fill-none" />
      <motion.circle cx={mx} cy={y} r={mr} strokeWidth={2} style={{ fill: region.color }} className="stroke-surface-1" />
      <motion.text x={mx} y={y - LABEL_LIFT} textAnchor="middle" style={{ opacity: pop }} className={`${TXT} fill-fg`}>
        {label}
      </motion.text>
    </g>
  );
}

const SEG_H = 20;
const SEG_TEXT = 13.6;
const SEG_STAGGER = 0.008;

function segLeft(k: number) {
  return ROW.x + VAT_CLASSES.slice(0, k).reduce((sum, c) => sum + c.w + SEG_GAP, 0);
}

function VatSegment({ p, k }: { p: MV; k: number }) {
  const extra = useExtra();
  const t = useSeg(p, TL.vatScale[0] + k * SEG_STAGGER, TL.vatScale[0] + k * SEG_STAGGER + 0.024, easeOutCubic);
  const c = VAT_CLASSES[k];
  const y = rowTop(VAT_INDEX, extra) + ROW.scale;
  return (
    <motion.g style={{ opacity: t }}>
      <rect x={segLeft(k)} y={y} width={c.w} height={SEG_H} rx={4} className="fill-surface-1 stroke-line-strong" />
      <text x={segLeft(k) + c.w / 2} y={y + SEG_TEXT} textAnchor="middle" className={`${TXT} fill-dim`}>
        {c.label}
      </text>
    </motion.g>
  );
}

function VatScale({ p }: { p: MV }) {
  const extra = useExtra();
  const id = useUid();
  const slide = useSpan(p, TL.vatPill, easeSnap);
  const appear = useKeys(p, [TL.vatPill[0], TL.vatPill[0] + 0.012], [0, 1]);
  const x = useTransform(slide, (v) => lerp(segLeft(0), segLeft(VAT_CLASS_IDX), v));
  const w = useTransform(slide, (v) => lerp(VAT_CLASSES[0].w, VAT_CLASSES[VAT_CLASS_IDX].w, v));
  const y = rowTop(VAT_INDEX, extra) + ROW.scale;
  return (
    <g>
      {VAT_CLASSES.map((c, k) => (
        <VatSegment key={c.label} p={p} k={k} />
      ))}
      <clipPath id={id}>
        <motion.rect x={x} y={y} width={w} height={SEG_H} rx={4} />
      </clipPath>
      <motion.g style={{ opacity: appear }}>
        <motion.rect x={x} y={y} width={w} height={SEG_H} rx={4} style={{ fill: REGIONS[VAT_INDEX].color }} />
        <g clipPath={`url(#${id})`}>
          {VAT_CLASSES.map((c, k) => (
            <text key={c.label} x={segLeft(k) + c.w / 2} y={y + SEG_TEXT} textAnchor="middle" className={`${TXT} fill-pastel-ink`}>
              {c.label}
            </text>
          ))}
        </g>
      </motion.g>
    </g>
  );
}

const GHOST_DASH = "2 4";
const GHOST_RING_DASH = "2 2";

function RowSlot({ p, i }: { p: MV; i: number }) {
  const extra = useExtra();
  const show = useKeys(p, [slotAt(i), slotAt(i) + 0.02], [0, 1]);
  const goneAt = i < VAT_INDEX ? trackAt(i) : TL.vatScale[0];
  const gone = useKeys(p, [goneAt, goneAt + 0.02], [0, 1]);
  const opacity = useTransform([show, gone], ([a, g]: number[]) => a * (1 - g));
  const y = rowTop(i, extra) + (i < VAT_INDEX ? ROW.track : ROW.scale + SEG_H / 2);
  return (
    <>
      <motion.circle cx={ROW.x + DOT_R} cy={rowTop(i, extra) + ROW.swatch} r={DOT_R} strokeWidth={1} strokeDasharray={GHOST_RING_DASH} style={{ opacity: show }} className="fill-none stroke-fg/40" />
      <motion.line x1={ROW.x} x2={ROW.x + ROW.w} y1={y} y2={y} strokeWidth={1.2} strokeDasharray={GHOST_DASH} style={{ opacity }} className="stroke-fg/25" />
    </>
  );
}

const HEADER_LIFT = 20;

export function RegionList({ p }: { p: MV }) {
  const header = useSpan(p, TL.header);
  return (
    <g>
      <motion.text x={ROW.x} y={ROW.y0 - HEADER_LIFT} style={{ opacity: header }} className={`${TXT} fill-mute`}>
        vs age-matched peers
      </motion.text>
      {REGIONS.map((r, i) => (
        <g key={r.key}>
          <RowSlot p={p} i={i} />
          <ValueLine p={p} region={r} i={i} />
          {r.pct !== null && <PercentileTrack p={p} region={r} i={i} />}
          <FlightDot p={p} region={r} i={i} />
        </g>
      ))}
      <VatScale p={p} />
    </g>
  );
}

const FACT_PITCH = 20;
const FACT_TOP = 42;
const FACT_RULE = 14;
const FACT_STAGGER = 0.015;
const HERO_SIZE = 38;
const HERO_CAPTION = 16;
const HERO_GHOST = 0.2;

function Fact({ p, i }: { p: MV; i: number }) {
  const t = useSeg(p, TL.facts[0] + i * FACT_STAGGER, TL.facts[1] + (i - 1) * FACT_STAGGER);
  const y = HERO.y + FACT_TOP + i * FACT_PITCH;
  const x1 = BODY_BOX[0];
  const x2 = BODY_BOX[0] + BODY_BOX[2];
  return (
    <motion.g style={{ opacity: t }}>
      <line x1={x1} x2={x2} y1={y - FACT_RULE} y2={y - FACT_RULE} className="stroke-line" strokeWidth={1} />
      <text x={x1} y={y} className={`${TXT} fill-mute`}>
        {FACTS[i].label}
      </text>
      <text x={x2} y={y} textAnchor="end" className={`${TXT} fill-fg`}>
        {FACTS[i].value}
      </text>
    </motion.g>
  );
}

export function Summary({ p }: { p: MV }) {
  const count = useSpan(p, TL.hero, easeOutCubic);
  const text = useTransform(count, (t) => `${(HERO.value * t).toFixed(1)} %`);
  const show = useKeys(p, [TL.hero[0] - 0.01, TL.hero[0] + 0.01], [0, 1]);
  const seen = useKeys(p, [TL.lift[1], TL.lift[1] + 0.02], [0, 1]);
  const number = useTransform([seen, show], ([s, r]: number[]) => Math.max(s * HERO_GHOST, r));
  const caption = useTransform([seen, show], ([s, r]: number[]) => Math.max(s * GHOST_TEXT, r));
  return (
    <g>
      <motion.text x={HERO.x} y={HERO.y} className="t-hero fill-fg" style={{ fontSize: HERO_SIZE, opacity: number }}>
        {text}
      </motion.text>
      <motion.text x={HERO.x} y={HERO.y + HERO_CAPTION} style={{ opacity: caption }} className={`${TXT} fill-mute`}>
        total body fat
      </motion.text>
      {FACTS.map((f, i) => (
        <Fact key={f.label} p={p} i={i} />
      ))}
    </g>
  );
}
