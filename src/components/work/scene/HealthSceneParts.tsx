"use client";

import { useCallback, useEffect, useRef } from "react";
import { motion, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { DOMAINS, PANELS, SCORE, iconTrim, type Panel, type Row } from "./HealthSceneData";
import { PanelHead } from "./HealthScenePanelHead";
import { SceneIcon, type SceneIconName } from "./SceneIcon";

/* Building blocks of the pinned scene. Every visual is a pure function of the
   (spring-smoothed) scroll progress `p`, so it stays deterministic and
   reversible. Named motion used, from the 60fps.design glossary: scroll-linked
   animation with parallax + progress indicator polish, a shared-element
   morph (score ring flies into the video badge) and an iris reveal. */

export type MV = MotionValue<number>;

export const MONO = "font-[ui-monospace,SFMono-Regular,Menlo,monospace]";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInCubic = (t: number) => t * t * t;
export const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutExpo = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeOutBack = (t: number) => {
  const c1 = 1.5;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

export function useSeg(p: MV, a: number, b: number, ease?: (t: number) => number): MV {
  return useTransform(p, (v) => {
    const t = clamp01((v - a) / (b - a));
    return ease ? ease(t) : t;
  });
}

export function useWindow(p: MV, a: number, b: number, opts?: { first?: boolean; last?: boolean }): MV {
  const e = 0.025;
  return useTransform(p, [a, a + e, b - e, b], [opts?.first ? 1 : 0, 1, 1, opts?.last ? 1 : 0]);
}

function RowView({ row, p, a }: { row: Row; p: MV; a: number }) {
  const t = useSeg(p, a, a + 0.03);
  const front = useTransform(t, [0.08, 0.92], [0, 100], { clamp: true });
  const rawClip = useTransform(front, (f) => `inset(0 0 0 ${f.toFixed(2)}%)`);
  const chipClip = useTransform(front, (f) => `inset(0 ${(100 - f).toFixed(2)}% 0 0 round 6px)`);
  const edgeLeft = useTransform(front, (f) => `${f.toFixed(2)}%`);
  const edgeOp = useTransform(t, [0.02, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const highlight = useTransform(t, [0, 0.2, 0.7], [0, 1, 0], { clamp: true });
  const bump = useTransform(t, [0.7, 0.88, 1], [1, row.flag ? 1.03 : 1, 1]);
  return (
    <div className="relative h-[26px] sm:h-[36px]">
      <motion.div aria-hidden style={{ opacity: highlight }} className="absolute inset-0 rounded-md bg-accent/20" />
      <motion.p
        style={{ clipPath: rawClip }}
        className={`absolute inset-0 flex items-center overflow-hidden whitespace-nowrap ${MONO} text-[10px] text-mute sm:text-[12.5px]`}
      >
        {row.raw}
      </motion.p>
      <motion.div
        style={{ clipPath: chipClip, scale: bump }}
        className="absolute inset-0 flex items-center justify-between gap-2 rounded-md bg-surface-2 px-2 text-[10.5px] sm:px-3 sm:text-[13px]"
      >
        <span className="flex min-w-0 items-center gap-1.5 text-fg">
          <i
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ background: row.flag ? "var(--color-accent)" : "var(--color-mint)" }}
          />
          <span className="truncate">{row.label}</span>
        </span>
        <span className="shrink-0 tabular-nums text-dim">{row.value}</span>
      </motion.div>
      <motion.i
        aria-hidden
        style={{ left: edgeLeft, opacity: edgeOp }}
        className="pointer-events-none absolute bottom-0.5 top-0.5 w-0.5 -translate-x-1/2 rounded-full bg-accent"
      />
    </div>
  );
}

export function PanelView({
  panel,
  idx,
  p,
  reg,
  px,
  py,
  conv,
}: {
  panel: Panel;
  idx: number;
  p: MV;
  reg: MV;
  px: MV;
  py: MV;
  conv: MV;
}) {
  const [sx, sy] = panel.quad;
  const s1a = 0.14 + idx * 0.02;
  const s1b = 0.4 + idx * 0.02;
  const n = panel.rows.length;

  const cx = useTransform(conv, (v) => `${-sx * 52 * easeInOutCubic(v)}%`);
  const cy = useTransform(conv, (v) => `${-sy * 52 * easeOutCubic(v)}%`);
  const cs = useTransform(conv, (v) => 1 - 0.7 * easeInCubic(v));
  const cr = useTransform(conv, (v) => Math.sin(v * Math.PI) * sx * sy * 6);
  const co = useTransform(conv, [0, 0.75, 1], [1, 0.9, 0]);

  const mx = useTransform([reg, px], ([r, q]: number[]) => (panel.mis.dx + q * panel.mis.kx) * (1 - r));
  const my = useTransform([reg, py], ([r, q]: number[]) => (panel.mis.dy + q * panel.mis.ky) * (1 - r));
  const mr = useTransform(reg, (r) => panel.mis.rot * (1 - r));
  const depth = useTransform(p, [0, 0.14], [(idx % 2 === 0 ? 1 : -1) * (10 + idx * 4), 0], { clamp: true });
  const myd = useTransform([my, depth], ([a, b]: number[]) => a + b);

  const scanTop = useTransform(p, [s1a, s1b], ["0%", "100%"], { clamp: true });
  const scanOp = useTransform(p, [s1a - 0.01, s1a, s1b, s1b + 0.012], [0, 1, 1, 0]);
  const parsedN = useTransform(p, [s1a, s1b], [0, n], { clamp: true });
  const parsedText = useTransform(parsedN, (v) => `${Math.min(n, Math.floor(v + 0.001))}/${n}`);

  return (
    <motion.div
      style={{ x: cx, y: cy, scale: cs, rotate: cr, opacity: co }}
      className="min-h-0 self-center will-change-transform"
    >
      <motion.div
        style={{ x: mx, y: myd, rotate: mr, borderTopColor: panel.color }}
        className="rounded-xl border border-t-2 border-line-strong bg-surface-1 p-1.5 will-change-transform shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] sm:p-2.5"
      >
        <PanelHead
          panel={panel}
          variant="stage"
          count={<motion.span className="tabular-nums text-fg">{parsedText}</motion.span>}
        />
        <div className="relative overflow-hidden rounded-md">
          {panel.rows.map((row, i) => (
            <RowView key={row.raw} row={row} p={p} a={s1a + ((i + 0.5) / n) * (s1b - s1a) - 0.012} />
          ))}
          <motion.div aria-hidden style={{ top: scanTop, opacity: scanOp }} className="pointer-events-none absolute inset-x-0 z-10">
            <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-accent/30 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-accent shadow-[0_0_10px_var(--color-accent)]" />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function DomainChip({ label, value, p, a }: { label: string; value: number; p: MV; a: number }) {
  const o = useSeg(p, a, a + 0.03);
  const y = useTransform(o, (v) => (1 - v) * 12);
  const bar = useSeg(p, a, a + 0.07, easeOutCubic);
  const barScale = useTransform(bar, (v) => v * (value / 100));
  return (
    <motion.div style={{ opacity: o, y }} className="rounded-lg border border-line bg-surface-1 px-2 py-1.5">
      <div className="flex items-baseline justify-between text-[10px] sm:text-[11px]">
        <span className="text-dim">{label}</span>
        <span className="tabular-nums text-fg">{value}</span>
      </div>
      <div className="mt-1 h-[3px] rounded-full bg-line-strong">
        <motion.div style={{ scaleX: barScale }} className="h-full origin-left rounded-full bg-mint" />
      </div>
    </motion.div>
  );
}

export function ScoreView({ p }: { p: MV }) {
  const arc = useSeg(p, 0.6, 0.73, easeOutExpo);
  const pathLength = useTransform(arc, (v) => (v * SCORE) / 100);
  const numText = useTransform(arc, (v) => String(Math.round(v * SCORE)));
  const enter = useSeg(p, 0.605, 0.67, easeOutCubic);
  const flight = useSeg(p, 0.78, 0.89, easeInOutCubic);

  const ringOpacity = useTransform([enter, flight], ([e, f]: number[]) => e * (1 - clamp01((f - 0.6) / 0.4)));
  const ringScale = useTransform([enter, flight], ([e, f]: number[]) => (0.82 + 0.18 * e) * (1 - 0.68 * f));
  const ringX = useTransform(flight, (f) => `${150 * f}%`);
  const ringY = useTransform(flight, (f) => `${-105 * f}%`);
  const glow = useTransform([arc, flight], ([a, f]: number[]) => a * 0.7 * (1 - f));
  const labelOpacity = useTransform(flight, [0, 0.4], [1, 0], { clamp: true });

  const groupOpacity = useTransform(p, [0.62, 0.68, 0.74, 0.79], [0, 1, 1, 0]);
  const groupY = useTransform(p, [0.62, 0.68, 0.74, 0.79], [16, 0, 0, -12]);
  const bioOp = useSeg(p, 0.7, 0.75);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 pb-8 sm:gap-5">
      <motion.div
        style={{ opacity: ringOpacity, scale: ringScale, x: ringX, y: ringY }}
        className="relative h-[124px] w-[124px] will-change-transform sm:h-[180px] sm:w-[180px]"
      >
        <motion.div
          style={{ opacity: glow }}
          className="absolute -inset-10 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-accent)_50%,transparent),transparent_65%)]"
        />
        <svg viewBox="0 0 120 120" className="relative h-full w-full -rotate-90">
          <circle cx="60" cy="60" r="52" fill="none" strokeWidth="7" style={{ stroke: "var(--color-line-strong)" }} />
          <motion.circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            strokeWidth="7"
            strokeLinecap="round"
            style={{ pathLength, stroke: "var(--color-accent)" }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center text-center">
          <div>
            <motion.span className="t-hero block text-[2.6rem] leading-none sm:text-6xl">{numText}</motion.span>
            <motion.span
              style={{ opacity: labelOpacity }}
              className={`${MONO} mt-1 block text-[8.5px] uppercase leading-[1.3] tracking-[0.12em] text-mute sm:text-[9px] sm:tracking-[0.14em]`}
            >
              longevity<br className="sm:hidden" /> score
            </motion.span>
          </div>
        </div>
      </motion.div>
      <motion.div style={{ opacity: groupOpacity, y: groupY }} className="grid w-full max-w-[420px] grid-cols-3 gap-1.5 px-1 sm:gap-2">
        {DOMAINS.map((d, i) => (
          <DomainChip key={d.k} label={d.k} value={d.v} p={p} a={0.62 + i * 0.012} />
        ))}
        <motion.p
          style={{ opacity: bioOp }}
          className={`${MONO} col-span-3 mt-1 text-center text-[10px] uppercase tracking-[0.12em] text-dim`}
        >
          bio age 34 &middot; ageing speed 0.91x
        </motion.p>
      </motion.div>
    </div>
  );
}

const VIDEO_START = 0.8;
const VIDEO_RESET = 0.76;
// Frames 24-28 of the 30-frame clip are the complete dashboard; frame 29 is the loop seam.
const VIDEO_HOLD_AT = 2.2;

function usePlayOnce(p: MV) {
  const ref = useRef<HTMLVideoElement>(null);
  const raf = useRef(0);
  const started = useRef(false);

  const sync = useCallback((v: number) => {
    const el = ref.current;
    if (!el) return;
    if (v >= VIDEO_START && !started.current) {
      started.current = true;
      el.currentTime = 0;
      el.play().catch(() => {});
      const watch = () => {
        if (el.currentTime >= VIDEO_HOLD_AT) {
          el.pause();
          return;
        }
        raf.current = requestAnimationFrame(watch);
      };
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(watch);
    } else if (v < VIDEO_RESET && started.current) {
      started.current = false;
      cancelAnimationFrame(raf.current);
      el.pause();
      el.currentTime = 0;
    }
  }, []);

  useMotionValueEvent(p, "change", sync);
  useEffect(() => {
    sync(p.get());
    return () => cancelAnimationFrame(raf.current);
  }, [p, sync]);

  return ref;
}

function SourceIcon({ name, p, a }: { name: SceneIconName; p: MV; a: number }) {
  const t = useSeg(p, a, a + 0.03, easeOutCubic);
  const scale = useTransform(t, (v) => 0.85 + 0.15 * v);
  const y = useTransform(t, (v) => (1 - v) * 6);
  return (
    <motion.span style={{ scale, y }} className="block">
      <SceneIcon name={name} size={32} className={`h-6 w-6 sm:h-7 sm:w-7 ${iconTrim(name)}`} />
    </motion.span>
  );
}

export function PayoffView({ p }: { p: MV }) {
  const video = usePlayOnce(p);
  const reveal = useSeg(p, 0.8, 0.94, easeOutCubic);
  const clip = useTransform(reveal, (v) => `circle(${(v * 112).toFixed(2)}% at 50% 48%)`);
  const scale = useTransform(reveal, (v) => 0.9 + 0.1 * v);
  const badge = useSeg(p, 0.87, 0.95, easeOutBack);
  const badgeOp = useSeg(p, 0.87, 0.905);
  const cap = useSeg(p, 0.93, 0.98);
  return (
    <figure className="absolute inset-0 m-0 flex flex-col items-center justify-center gap-2 pb-6">
      <div className="relative w-full max-w-[560px]">
        <motion.div
          style={{ clipPath: clip, scale }}
          className="overflow-hidden rounded-2xl border border-line-strong bg-black shadow-[0_30px_60px_-24px_rgba(0,0,0,0.7)]"
        >
          <video
            ref={video}
            src="/work/health-platform/dashboard-card.mp4"
            poster="/work/health-platform/dashboard-card.webp"
            preload="auto"
            muted
            playsInline
            className="block aspect-[1624/1116] w-full object-cover"
          />
        </motion.div>
        <motion.div
          aria-hidden
          style={{ scale: badge, opacity: badgeOp }}
          className="absolute -right-2 -top-3 z-10 grid h-14 w-14 place-items-center rounded-full border-2 border-accent bg-bg sm:-right-4 sm:h-16 sm:w-16"
        >
          <span className="t-hero text-xl leading-none sm:text-2xl">{SCORE}</span>
        </motion.div>
      </div>
      <motion.figcaption
        style={{ opacity: cap }}
        className={`flex flex-wrap items-center justify-center gap-x-2 gap-y-1 ${MONO} text-[11px] text-mute`}
      >
        <span>from</span>
        <span className="flex items-center gap-0.5">
          {PANELS.map((pn, i) => (
            <SourceIcon key={pn.key} name={pn.icon} p={p} a={0.93 + i * 0.008} />
          ))}
        </span>
        <span>
          <span className="text-fg">score {SCORE}</span>, as shipped
        </span>
      </motion.figcaption>
    </figure>
  );
}

export function Backdrop({ p }: { p: MV }) {
  const y = useTransform(p, [0, 1], [0, -200]);
  return (
    <motion.div
      aria-hidden
      style={{ backgroundPositionY: y }}
      className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] [background-size:28px_28px] [-webkit-mask-image:radial-gradient(75%_65%_at_50%_50%,#000,transparent)] [mask-image:radial-gradient(75%_65%_at_50%_50%,#000,transparent)]"
    />
  );
}

export function RegPulse({ p }: { p: MV }) {
  const t = useSeg(p, 0.55, 0.67, easeOutCubic);
  const scale = useTransform(t, (v) => 0.3 + 2.4 * v);
  const opacity = useTransform(t, [0, 0.04, 1], [0, 0.6, 0]);
  return (
    <motion.div
      aria-hidden
      style={{ scale, opacity }}
      className="pointer-events-none absolute left-1/2 top-1/2 -ml-20 -mt-20 h-40 w-40 rounded-full border border-accent"
    />
  );
}
