"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { PT, RADIUS, TAB_H, TAB_ZONE } from "./MobileSceneData";
import { clamp01, frameAt, frameEase, lerp } from "./MobileSceneMath";
import { floorPx, pt, u, useBox } from "./MobileSceneKit";
import { StatusBar, sceneIn } from "./MobileSceneDevice";
import { M, NAV, PAGE_H, T } from "./EduPhoneSceneData";
import { pageAt, type Flow } from "./EduPhoneSceneMath";
import { Tap, fsAt, type Type } from "./EduPhoneSceneKit";
import { TabGlyph } from "./EduPhoneSceneIcons";

/* The device screen built on the Mobile bezel: the screen that morphs with the
   frame, the laptop nav that leaves upward, the phone tab bar that rises, and
   the pager that carries the home column and the three phone pages. */

const radii = (top: number, bottom: number) => `${u(top)} ${u(top)} ${u(bottom)} ${u(bottom)}`;

export function Screen({ p, children }: { p: MV; children: ReactNode }) {
  const box = useBox(p, (v) => frameAt(v).screen);
  const radius = useTransform(p, (v) => {
    const f = frameEase(v);
    return radii(lerp(RADIUS.screenTop[0], RADIUS.screenTop[1], f), lerp(RADIUS.screenBottom[0], RADIUS.screenBottom[1], f));
  });
  return (
    <motion.div aria-hidden style={{ ...box, borderRadius: radius }} className="absolute z-10 overflow-hidden bg-bg">
      {children}
      <StatusBar p={p} />
      <TabBar p={p} />
    </motion.div>
  );
}

export function Pager({ p, children }: { p: MV; children: ReactNode }) {
  const y = useTransform(p, (v) => u(-pageAt(v) * PAGE_H));
  return (
    <motion.div style={{ y }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

/* Signed-in student: a plain head and shoulders glyph in the round avatar. */
function Avatar() {
  return (
    <span aria-hidden className="grid shrink-0 place-items-center rounded-full border border-line-strong bg-surface-2 text-dim" style={{ width: u(12), height: u(12) }}>
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: u(8), height: u(8) }}>
        <circle cx="12" cy="8.6" r="4" />
        <path d="M4.4 20.4c.6-4 3.6-6.2 7.6-6.2s7 2.2 7.6 6.2z" />
      </svg>
    </span>
  );
}

const NAV_H = 14;
const NAV_TOP = 5;

export function Nav({ flow, type }: { flow: MotionValue<Flow>; type: Type }) {
  const y = useTransform(flow, (f) => u(-(NAV_TOP + NAV_H + 2) * f.nav));
  const opacity = useTransform(flow, (f) => 1 - clamp01(f.nav * 1.4));
  return (
    <motion.div
      style={{ y, opacity, top: u(NAV_TOP), height: u(NAV_H), left: u(M), right: u(M) }}
      className="absolute flex items-center justify-between"
    >
      <div className="flex items-center" style={{ gap: u(12) }}>
        {NAV.map((label, i) => (
          <motion.span
            key={label}
            style={{ fontSize: type.body, lineHeight: 1, paddingBottom: u(2) }}
            className={`relative whitespace-nowrap ${i === 0 ? "text-fg" : "text-mute"}`}
          >
            {label}
            {i === 0 ? <i aria-hidden className="absolute inset-x-0 bottom-[-2px] h-[2px] rounded-full bg-accent" /> : null}
          </motion.span>
        ))}
      </div>
      <Avatar />
    </motion.div>
  );
}

const TAB_ICON = `max(${pt(22)}, ${floorPx(11)})`;

function Tab({ page, size, i, label }: { page: MV; size: MotionValue<string>; i: number; label: string }) {
  const color = useTransform(page, (pg) => {
    const w = clamp01(1 - Math.abs(pg - i));
    return `color-mix(in oklab, var(--color-accent) ${(w * 100).toFixed(1)}%, var(--color-mute))`;
  });
  return (
    <motion.span style={{ color, gap: u(1) }} className="flex flex-col items-center">
      <span className="block" style={{ width: TAB_ICON, height: TAB_ICON }}>
        <TabGlyph index={i} />
      </span>
      <motion.span className="whitespace-nowrap" style={{ fontSize: size, lineHeight: 1.05, fontWeight: 500, letterSpacing: "-0.015em" }}>
        {label}
      </motion.span>
    </motion.span>
  );
}

/* Opaque bar that rises into place with the frame; three taps on its tabs precede the three page changes. */
export function TabBar({ p }: { p: MV }) {
  const t = useTransform(p, sceneIn);
  const y = useTransform(t, (v) => `${((1 - v) * 100).toFixed(2)}%`);
  const page = useTransform(p, pageAt);
  const size = useTransform(p, (v) => fsAt(10 * PT, 10.5, v));
  return (
    <motion.div style={{ y, height: u(TAB_ZONE) }} className="absolute inset-x-0 bottom-0 z-40 border-t border-line bg-bg">
      <motion.div style={{ opacity: t }}>
        <div className="flex justify-around" style={{ height: u(TAB_H), padding: `${u(3)} ${u(2)} 0` }}>
          {NAV.map((label, i) => (
            <Tab key={label} page={page} size={size} i={i} label={label} />
          ))}
        </div>
        <i
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-fg opacity-80"
          style={{ bottom: pt(8), width: pt(134), height: `max(${pt(5)}, 2px)` }}
        />
      </motion.div>
      {T.tapTab.map((span, k) => (
        <Tap key={k} p={p} span={span} style={{ left: `${(k + 1.5) * 25}%`, top: u(10) }} />
      ))}
    </motion.div>
  );
}
