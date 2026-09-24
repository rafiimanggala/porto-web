"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { BANK_START, BANK_TOTAL, N, STATUS_COLOR, STATUS_FILL, T, listStatus, listStem, listType, qLabel } from "./EduQuizSceneData";
import { QuizSheetIcon, TypeGlyph } from "./EduQuizSceneIcons";
import { HexDot, WipePages, lerp, pct, segAt } from "./EduQuizSceneKit";

/* Chapter 1: a long question list that will not stop. The count keeps growing,
   the scrollbar thumb shrinks to a sliver and the rows speed up. Then a scan
   line runs down the stage: above it the list is gone (the map takes its
   place), below it the rows are still scrolling. */

const ROWS_RENDERED = 100;
const SCROLL_ROWS = 84;
const VISIBLE_ROWS = 13;
const MIN_THUMB = 2.4;
const ROW_VARS = "[--row:32px] @[34rem]:[--row:40px]";

const bankTotal = (v: number) => lerp(BANK_START, BANK_TOTAL, segAt(v, T.count[0], T.count[1], easeOutCubic));
const scrolled = (v: number) => SCROLL_ROWS * Math.pow(segAt(v, T.scroll[0], T.scroll[1]), 1.45);
const thumbSize = (total: number) => Math.max(MIN_THUMB, (VISIBLE_ROWS / total) * 100);

/* Scan line position inside the list box: the grid height, then off the bottom. */
const scanTop = (v: number) =>
  `calc(var(--gh) * ${segAt(v, T.scan[0], T.scan[1]).toFixed(4)} + 100cqh * ${segAt(v, T.tail[0], T.tail[1]).toFixed(4)})`;

function Row({ i }: { i: number }) {
  const status = listStatus(i);
  return (
    <div className="flex items-center gap-2 border-b border-line pl-0.5 pr-3.5" style={{ height: "var(--row)" }}>
      <HexDot color={STATUS_COLOR[status]} opacity={STATUS_FILL[status] + 0.15} />
      <span className={`${MONO} w-[4ch] shrink-0 text-[10px] tabular-nums text-mute`}>{qLabel(i)}</span>
      <span className="min-w-0 flex-1 truncate text-[12px] text-dim @[34rem]:text-[13px]">{listStem(i)}</span>
      <TypeGlyph type={listType(i)} />
    </div>
  );
}

const ROW_INDEXES = Array.from({ length: ROWS_RENDERED }, (_, i) => i);

function Scrollbar({ p }: { p: MV }) {
  const h = useTransform(p, (v) => pct(thumbSize(bankTotal(v))));
  const top = useTransform(p, (v) => {
    const total = bankTotal(v);
    return pct(Math.min(100 - thumbSize(total), (scrolled(v) / total) * 100));
  });
  return (
    <div aria-hidden className="absolute bottom-0 right-0 top-0 w-[3px] rounded-full bg-line-strong">
      <motion.i style={{ top, height: h }} className="absolute inset-x-0 min-h-[6px] rounded-full bg-fg" />
    </div>
  );
}

export function BankList({ p, lift }: { p: MV; lift: MV }) {
  const bottom = useTransform(lift, (s) => `calc(var(--shift) * ${s.toFixed(4)})`);
  const rows = useTransform(p, (v) => `translateY(calc(var(--row) * ${(-scrolled(v)).toFixed(3)}))`);
  const clip = useTransform(p, (v) => `inset(${scanTop(v)} 0 0 0)`);
  const line = useTransform(p, scanTop);
  const lineOp = useTransform(p, (v) => Math.min(segAt(v, T.scan[0] - 0.004, T.scan[0]), 1 - segAt(v, T.tail[1] - 0.004, T.tail[1])));
  return (
    <motion.div style={{ bottom }} className={`absolute inset-x-0 top-[calc(var(--hdr)+var(--gap))] ${ROW_VARS}`}>
      <motion.div style={{ clipPath: clip }} className="absolute inset-0 overflow-hidden [mask-image:linear-gradient(to_bottom,#000_84%,transparent)]">
        <motion.div style={{ transform: rows }} className="will-change-transform">
          {ROW_INDEXES.map((i) => (
            <Row key={i} i={i} />
          ))}
        </motion.div>
        <Scrollbar p={p} />
      </motion.div>
      <motion.i
        aria-hidden
        style={{ top: line, opacity: lineOp }}
        className="pointer-events-none absolute inset-x-0 z-20 h-0.5 -translate-y-1/2 rounded-full bg-accent"
      />
    </motion.div>
  );
}

const HDR_TEXT = `${MONO} text-[10px] text-mute @[34rem]:text-[11px]`;

function CountText({ p }: { p: MV }) {
  const text = useTransform(p, (v) => `Q${Math.floor(scrolled(v)) + 1} of ${Math.round(bankTotal(v))} questions`);
  return <motion.span className={`${HDR_TEXT} tabular-nums`}>{text}</motion.span>;
}

export function TopRow({ p }: { p: MV }) {
  const swap = useSeg(p, T.hdr[0], T.hdr[1]);
  const right = [
    <span key="bank" className="flex h-full items-center justify-end">
      <CountText p={p} />
    </span>,
    <span key="scope" className="flex h-full items-center justify-end">
      <span className={`${HDR_TEXT} tabular-nums text-fg`}>Level 2: {N} of {BANK_TOTAL}</span>
    </span>,
  ];
  return (
    <div className="absolute inset-x-0 top-0 flex h-[var(--hdr)] items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        <QuizSheetIcon className="h-[22px] w-[22px]" />
        <span className="truncate text-[12px] font-medium text-fg @[34rem]:text-[13px]">Biology, Units 3 and 4</span>
      </div>
      <WipePages pos={swap} pages={right} className="h-full w-[136px] shrink-0 @[34rem]:w-[150px]" />
    </div>
  );
}
