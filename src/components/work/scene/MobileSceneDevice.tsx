"use client";

import type { CSSProperties, ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { ISLAND, PHONE_X, STATUS_COVER, STATUS_H, TAB_H, TAB_ZONE, TITLE_H } from "./MobileSceneData";
import { collapseAt, coverAt, frameEase, segAt, titleInAt } from "./MobileSceneMath";
import { floorPx, font, pt, u, useLayout } from "./MobileSceneKit";

const glyphH = (n: number) => ({ height: `max(${pt(n)}, ${floorPx(n * 0.62)})` }) satisfies CSSProperties;
const IN = [0.8, 1] as const;

function Signal() {
  return (
    <svg viewBox="0 0 18 12" fill="currentColor" className="w-auto" style={glyphH(12)}>
      {[4, 6.6, 9.2, 11.8].map((h, i) => (
        <rect key={h} x={i * 4.7} y={12 - h} width="3.3" height={h} rx="0.9" />
      ))}
    </svg>
  );
}

function Wifi() {
  return (
    <svg viewBox="0 0 17 12" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" className="w-auto" style={glyphH(12)}>
      <path d="M1.2 4.2a10.4 10.4 0 0 1 14.6 0" />
      <path d="M3.9 7a6.5 6.5 0 0 1 9.2 0" />
      <circle cx="8.5" cy="10.1" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Battery() {
  return (
    <svg viewBox="0 0 27 13" className="w-auto" style={glyphH(13)}>
      <rect x="0.6" y="0.6" width="22" height="11.8" rx="3.6" fill="none" stroke="currentColor" strokeOpacity="0.5" strokeWidth="1.1" />
      <rect x="2.2" y="2.2" width="15.6" height="8.6" rx="2.2" fill="currentColor" />
      <path d="M24.4 4.4v4.2c.9-.3 1.5-1.1 1.5-2.1s-.6-1.8-1.5-2.1z" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

export const sceneIn = (v: number) => segAt(frameEase(v), IN);

export function StatusBar({ p }: { p: MV }) {
  const height = useTransform(p, (v) => u(STATUS_COVER * coverAt(v)));
  const op = useTransform(p, sceneIn);
  const y = useTransform(op, (t) => u(-4 * (1 - t)));
  const ear = "flex flex-1 items-center justify-center";
  return (
    <motion.div style={{ height }} className="absolute inset-x-0 top-0 z-40 overflow-hidden bg-bg">
      <motion.div style={{ opacity: op, y, height: u(STATUS_H) }} className="flex items-center text-fg">
        <span className={`${ear} tabular-nums`} style={{ fontSize: font(15), fontWeight: 600, lineHeight: 1 }}>
          9:41
        </span>
        <span style={{ width: u(ISLAND.w) }} />
        <span className={ear} style={{ gap: pt(6) }}>
          <Signal />
          <Wifi />
          <Battery />
        </span>
      </motion.div>
    </motion.div>
  );
}

function Avatar() {
  const size = `max(${pt(30)}, ${floorPx(15)})`;
  return (
    <span className="grid shrink-0 place-items-center rounded-full border border-line-strong bg-surface-2 text-dim" style={{ width: size, height: size }}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" style={{ width: "58%", height: "58%" }}>
        <circle cx="12" cy="8.6" r="3.5" />
        <path d="M5.2 19.6c.8-3.5 3.5-5.4 6.8-5.4s6 1.9 6.8 5.4" />
      </svg>
    </span>
  );
}

export function LargeTitle({ p }: { p: MV }) {
  const { cards } = useLayout();
  const scroll = cards[0].scroll;
  const collapse = useTransform(p, (v) => collapseAt(v, scroll));
  const opacity = useTransform(p, (v) => titleInAt(v) * (1 - Math.min(1, collapseAt(v, scroll) * 1.4)));
  const y = useTransform(collapse, (c) => u(-TITLE_H * c));
  return (
    <motion.div
      style={{ opacity, y, top: u(STATUS_H), height: u(TITLE_H), left: u(PHONE_X), right: u(PHONE_X) }}
      className="absolute z-20 flex items-end justify-between"
    >
      <h3 className="text-fg" style={{ fontSize: font(26), lineHeight: 1.1, fontWeight: 700, letterSpacing: "-0.02em", marginBottom: pt(3) }}>
        Summary
      </h3>
      <span style={{ marginBottom: pt(5) }}>
        <Avatar />
      </span>
    </motion.div>
  );
}

const STROKE = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

const TABS: readonly { label: string; glyph: ReactNode }[] = [
  { label: "Home", glyph: <path d="M4.2 11.3 12 4.2l7.8 7.1V19a1 1 0 0 1-1 1h-4.4v-5.4H9.6V20H5.2a1 1 0 0 1-1-1z" /> },
  { label: "Insights", glyph: <path d="M3.8 17.2 9 12l3.6 3.6 7.6-7.8M15.2 7.8h5v5" /> },
  { label: "Biomarkers", glyph: <path d="M12 3.4c3.5 4.1 5.6 7 5.6 9.7a5.6 5.6 0 0 1-11.2 0c0-2.7 2.1-5.6 5.6-9.7z" /> },
  {
    label: "Profile",
    glyph: (
      <>
        <circle cx="12" cy="8.4" r="3.6" />
        <path d="M5 20c.8-3.7 3.6-5.6 7-5.6s6.2 1.9 7 5.6" />
      </>
    ),
  },
];

function Tab({ label, glyph, active }: { label: string; glyph: ReactNode; active: boolean }) {
  return (
    <span className={`flex flex-col items-center ${active ? "text-accent" : "text-mute"}`} style={{ gap: u(1) }}>
      <svg viewBox="0 0 24 24" {...STROKE} style={{ width: `max(${pt(22)}, ${floorPx(11)})`, height: `max(${pt(22)}, ${floorPx(11)})` }}>
        {glyph}
      </svg>
      <span className="whitespace-nowrap" style={{ fontSize: font(10), lineHeight: 1.05, fontWeight: 500, letterSpacing: "-0.015em" }}>
        {label}
      </span>
    </span>
  );
}

/* The bar is opaque and only rises into place: a translucent bar would show the cards under it as text on its icons.
   Its icons fade in as it rises. */
export function TabBar({ p }: { p: MV }) {
  const t = useTransform(p, sceneIn);
  const y = useTransform(t, (v) => `${((1 - v) * 100).toFixed(2)}%`);
  return (
    <motion.div style={{ y, height: u(TAB_ZONE) }} className="absolute inset-x-0 bottom-0 z-40 border-t border-line bg-bg">
      <motion.div style={{ opacity: t }}>
        <div className="flex justify-around" style={{ height: u(TAB_H), padding: `${u(3)} ${u(2)} 0` }}>
          {TABS.map((tab) => (
            <Tab key={tab.label} label={tab.label} glyph={tab.glyph} active={tab.label === "Home"} />
          ))}
        </div>
        <i
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-fg opacity-80"
          style={{ bottom: pt(8), width: pt(134), height: `max(${pt(5)}, 2px)` }}
        />
      </motion.div>
    </motion.div>
  );
}
