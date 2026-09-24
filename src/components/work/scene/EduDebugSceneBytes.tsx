"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, easeOutBack, useSeg, type MV } from "./HealthSceneParts";
import { BYTES_TL, BYTE_ROWS, DLL_COUNT, HASH, ROWS, matchedAt } from "./EduDebugSceneData";
import { CheckMark, DllIcon } from "./EduDebugSceneIcons";
import { LABEL, PAD, clamp01, pct } from "./EduDebugSceneKit";

/* Byte compare page: decode, row scan, IDENTICAL stamp. */

const { decode: DEC, scan: SCAN } = BYTES_TL;
const COLS = "grid grid-cols-[minmax(0,1fr)_clamp(20px,5cqw,30px)_minmax(0,1fr)] items-center";
const FONT = "text-[clamp(10.5px,min(3.1cqw,2.4cqh),14px)]";
const BYTE_TEXT = `${MONO} ${FONT} tracking-[0.02em]`;
const ROW_H = "clamp(24px, 6.2cqh, 44px)";

function Bytes({ bytes }: { bytes: readonly string[] }) {
  return (
    <>
      {bytes.map((b, i) => (
        <span key={i} className={i > 3 ? "hidden @[30rem]:inline" : ""}>
          {i > 0 ? " " : ""}
          {b}
        </span>
      ))}
    </>
  );
}

function Masked({ count }: { count: number }) {
  return <Bytes bytes={Array.from({ length: count }, () => "??")} />;
}

function Cell({ off, children }: { off: string; children: React.ReactNode }) {
  return (
    <span className={`relative flex items-center gap-2 px-[clamp(6px,1.8cqw,12px)] ${BYTE_TEXT}`}>
      <span className="text-mute">{off}</span>
      <span className="relative">{children}</span>
    </span>
  );
}

function ShippedBytes({ p, row, i }: { p: MV; row: (typeof BYTE_ROWS)[number]; i: number }) {
  const a = DEC.start + i * DEC.step;
  const t = useSeg(p, a, a + DEC.dur);
  const front = useTransform(t, [0.05, 0.95], [0, 100], { clamp: true });
  const realClip = useTransform(front, (f) => `inset(0 ${pct(100 - f)} 0 0)`);
  const maskClip = useTransform(front, (f) => `inset(0 0 0 ${pct(f)})`);
  const left = useTransform(front, (f) => pct(f));
  const edge = useTransform(t, [0.02, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return (
    <>
      <motion.span style={{ clipPath: realClip }} className="block whitespace-nowrap">
        <Bytes bytes={row.bytes} />
      </motion.span>
      <motion.span aria-hidden style={{ clipPath: maskClip }} className="absolute inset-0 block whitespace-nowrap text-mute/60">
        <Masked count={row.bytes.length} />
      </motion.span>
      <motion.i aria-hidden style={{ left, opacity: edge }} className="absolute inset-y-[-2px] w-0.5 rounded-full bg-accent" />
    </>
  );
}

function RowPair({ p, row, i }: { p: MV; row: (typeof BYTE_ROWS)[number]; i: number }) {
  const c0 = SCAN.start + i * SCAN.step;
  const cmp = useSeg(p, c0, c0 + SCAN.dur);
  const tint = useTransform(cmp, [0, 0.3, 1], [0, 1, 0.55]);
  const bright = useTransform(cmp, [0, 1], [0.6, 1]);
  const dot = useTransform(cmp, (v) => 1 - clamp01(v * 2));
  const check = useTransform(cmp, [0.3, 1], [0, 1], { clamp: true });
  const checkScale = useTransform(check, (v) => 0.6 + 0.4 * v);
  return (
    <div className={`relative ${COLS} min-h-0`}>
      <motion.i aria-hidden style={{ opacity: tint }} className="absolute inset-0 rounded-md bg-mint/15" />
      <motion.span style={{ opacity: bright }} className="text-fg">
        <Cell off={row.off}>
          <ShippedBytes p={p} row={row} i={i} />
        </Cell>
      </motion.span>
      <span className="relative grid place-items-center">
        <motion.i aria-hidden style={{ opacity: dot }} className="h-1 w-1 rounded-full bg-mute" />
        <motion.span style={{ opacity: check, scale: checkScale }} className="absolute grid h-[clamp(14px,3.6cqw,20px)] w-[clamp(14px,3.6cqw,20px)] place-items-center rounded-full bg-mint text-pastel-ink">
          <CheckMark className="h-[70%] w-[70%]" />
        </motion.span>
      </span>
      <motion.span style={{ opacity: bright }} className="text-fg">
        <Cell off={row.off}>
          <span className="block whitespace-nowrap">
            <Bytes bytes={row.bytes} />
          </span>
        </Cell>
      </motion.span>
    </div>
  );
}

function ColumnHead({ title, sub }: { title: string; sub: string }) {
  return (
    <span className="flex items-center gap-2 px-[clamp(6px,1.8cqw,12px)]">
      <DllIcon className="h-[clamp(22px,5.6cqw,32px)] w-auto flex-none" />
      <span className="min-w-0 leading-tight">
        <span className={`${LABEL} block text-fg`}>{title}</span>
        <span className={`${LABEL} block normal-case tracking-normal`}>{sub}</span>
      </span>
    </span>
  );
}

function ScanLine({ p }: { p: MV }) {
  const top = useTransform(p, (v) => pct(100 * clamp01((v - SCAN.start - SCAN.dur / 2) / SCAN.step / ROWS + 0.5 / ROWS)));
  const opacity = useTransform(p, [SCAN.start - 0.006, SCAN.start, matchedAt(ROWS - 1) - 0.004, matchedAt(ROWS - 1)], [0, 1, 1, 0]);
  return (
    <motion.div aria-hidden style={{ top, opacity }} className="pointer-events-none absolute inset-x-0 z-10">
      <div className="absolute inset-x-0 bottom-0 h-[clamp(14px,4cqh,26px)] bg-gradient-to-t from-accent/25 to-transparent" />
      <div className="absolute inset-x-0 top-0 h-0.5 rounded-full bg-accent" />
    </motion.div>
  );
}

function Stamp({ p }: { p: MV }) {
  const [a, b] = BYTES_TL.stamp;
  const t = useSeg(p, a, b, easeOutBack);
  const scale = useTransform(t, (v) => 1.9 - 0.9 * v);
  const opacity = useSeg(p, a, a + 0.008);
  const ring = useSeg(p, a + 0.014, b + 0.02);
  const ringScale = useTransform(ring, (v) => 1 + 0.5 * v);
  const ringOpacity = useTransform(ring, [0, 0.05, 1], [0, 0.6, 0]);
  return (
    <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center">
      <motion.div style={{ opacity, scale }} className="relative -rotate-[6deg]">
        <motion.i aria-hidden style={{ scale: ringScale, opacity: ringOpacity }} className="absolute inset-0 rounded-md border-2 border-accent" />
        <div className="relative rounded-md bg-accent px-[clamp(14px,4cqw,26px)] py-[clamp(8px,2cqh,14px)] text-center text-fg outline outline-2 -outline-offset-[5px] outline-fg/45">
          <span className="t-hero block text-[clamp(1.5rem,7.6cqw,2.7rem)] leading-none tracking-[0.04em]">IDENTICAL</span>
          <span className={`${MONO} mt-1.5 block text-[clamp(10.5px,2.6cqw,13px)]`}>
            {DLL_COUNT} dll, 0 bytes differ
          </span>
        </div>
      </motion.div>
    </div>
  );
}

function Footer({ p }: { p: MV }) {
  const matched = useTransform(p, (v) => BYTE_ROWS.filter((_, i) => v >= matchedAt(i) - SCAN.dur / 2).length);
  const hash = useSeg(p, BYTES_TL.hash[0], BYTES_TL.hash[1]);
  const equal = useTransform(hash, [0.5, 1], [0, 1], { clamp: true });
  return (
    <div className={`${MONO} flex flex-none flex-col gap-1.5 ${FONT}`}>
      <div className="flex items-baseline justify-between px-[clamp(6px,1.8cqw,12px)]">
        <span className={LABEL}>
          rows <motion.span className="text-fg tabular-nums">{matched}</motion.span>/{ROWS} match
        </span>
        <span className={LABEL}>0 bytes differ</span>
      </div>
      <motion.div style={{ opacity: hash }} className={`${COLS} rounded-md border border-line bg-bg/40 py-1`}>
        <span className="px-[clamp(6px,1.8cqw,12px)] text-fg">
          <span className="text-mute">sha256 </span>
          {HASH}
        </span>
        <motion.span style={{ opacity: equal }} className="text-center text-mint">
          =
        </motion.span>
        <span className="px-[clamp(6px,1.8cqw,12px)] text-fg">
          <span className="text-mute">sha256 </span>
          {HASH}
        </span>
      </motion.div>
    </div>
  );
}

export default function BytesPage({ p }: { p: MV }) {
  const dim = useTransform(p, [BYTES_TL.stamp[0], BYTES_TL.stamp[1]], [1, 0.28]);
  return (
    <div style={{ padding: PAD, gap: `calc(${PAD} * 0.6)` }} className="flex h-full flex-col justify-center">
      <div className={`${COLS} flex-none`}>
        <ColumnHead title="shipped" sub="prod build" />
        <span className={`${LABEL} text-center`}>vs</span>
        <ColumnHead title="tested" sub="qa build" />
      </div>
      <div className="relative flex-none">
        <motion.div
          style={{ opacity: dim, gridTemplateRows: `repeat(${ROWS}, ${ROW_H})` }}
          className="relative grid gap-[clamp(2px,0.6cqh,5px)]"
        >
          {BYTE_ROWS.map((row, i) => (
            <RowPair key={row.off} p={p} row={row} i={i} />
          ))}
          <ScanLine p={p} />
        </motion.div>
        <Stamp p={p} />
      </div>
      <Footer p={p} />
    </div>
  );
}
