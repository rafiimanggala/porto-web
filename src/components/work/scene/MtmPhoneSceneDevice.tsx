"use client";

import type { ReactNode } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, easeInOutCubic, useSeg, type MV } from "./HealthSceneParts";
import { ISLAND, RADIUS, STATUS_COVER } from "./MobileSceneData";
import { coverAt, frameAt, frameEase, lerp, lerpRect, segAt } from "./MobileSceneMath";
import { FS, pt, u, useBox } from "./MobileSceneKit";
import { StatusBar } from "./MobileSceneDevice";
import { MtmGlyph } from "./MtmKitGlyphs";
import { BAR_H, M, NAV_H, NAV_PLATE_PAD, PAGE_FADE, T, TEXT, VIEW_PATHS, type Rect } from "./MtmPhoneSceneData";
import { barRiseAt, clamp01, viewAt, type Flow } from "./MtmPhoneSceneMath";
import { clipRight, softWipe, type Type } from "./MtmPhoneSceneKit";

/* The device on the Mobile bezel: the screen that morphs with the frame, the scrolling page, the browser chrome that
   becomes the island, the desk nav that collapses into a menu glyph and stays as the phone's header, and the bar that
   rises under the sticky button. */

const radii = (top: number, bottom: number) => `${u(top)} ${u(top)} ${u(bottom)} ${u(bottom)}`;
const GLASS = "color-mix(in oklab, var(--color-surface-1) 40%, black)";
const DEVICE_IN = [0.55, 1] as const;

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
    </motion.div>
  );
}

/* Scroll edges: the page is cut under the status bar and fades over the last units above the bar. Before the bar has
   risen the bottom edge of the screen fades too, so a line that crosses it is faded out, never sliced through its glyphs. */
const edgeMask = (top: number, bottom: number) => {
  const cut = u(STATUS_COVER * top);
  const bar = u(BAR_H * bottom);
  const soft = u(lerp(PAGE_FADE.open, PAGE_FADE.bar, bottom));
  return `linear-gradient(to bottom, transparent ${cut}, #000 ${cut}, #000 calc(100% - ${bar} - ${soft}), transparent calc(100% - ${bar}))`;
};

export function Page({ p, flow, children }: { p: MV; flow: MotionValue<Flow>; children: ReactNode }) {
  const mask = useTransform(p, (v) => edgeMask(coverAt(v), barRiseAt(v)));
  const y = useTransform(flow, (f) => u(-f.scroll));
  return (
    <motion.div style={{ maskImage: mask, WebkitMaskImage: mask }} className="absolute inset-0 z-30">
      <motion.div style={{ y }} className="absolute inset-0">
        {children}
      </motion.div>
    </motion.div>
  );
}

export function Bar({ p }: { p: MV }) {
  const t = useTransform(p, barRiseAt);
  const y = useTransform(t, (v) => `${((1 - v) * 100).toFixed(2)}%`);
  return (
    <motion.div style={{ y, height: u(BAR_H) }} className="absolute inset-x-0 bottom-0 z-40 border-t border-line bg-bg">
      <motion.div style={{ opacity: t }} className="absolute inset-0">
        <i
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-fg opacity-80"
          style={{ bottom: pt(8), width: pt(134), height: `max(${pt(5)}, 2px)` }}
        />
      </motion.div>
    </motion.div>
  );
}

function Menu() {
  return (
    <span aria-hidden className="flex flex-col justify-between" style={{ width: u(12), height: u(9) }}>
      {[0, 1, 2].map((i) => (
        <i key={i} className="block w-full rounded-full bg-fg" style={{ height: u(1.6) }} />
      ))}
    </span>
  );
}

const CLIP_PAD = "-6px";
const BADGE = { d: 9, right: -3.5, top: -1 } as const;

/* The count that wipes onto the cart icon together with the in cart mark of the picked row. */
function CartBadge({ p, type }: { p: MV; type: Type }) {
  const added = useSeg(p, T.added[0], T.added[1], easeInOutCubic);
  const clip = useTransform(added, clipRight);
  return (
    <motion.i
      aria-hidden
      style={{ clipPath: clip, width: u(BADGE.d), height: u(BADGE.d), right: u(BADGE.right), top: u(BADGE.top), fontSize: type.label }}
      className={`${MONO} absolute grid place-items-center rounded-full bg-accent font-semibold not-italic leading-none text-fg`}
    >
      1
    </motion.i>
  );
}

/* The header: the desk tabs wipe away from the left while the menu glyph is revealed in the same box from the left, so
   the two never overlap. Its plate is opaque, so the page scrolls under it like under a sticky header. */
export function Nav({ p, flow, type }: { p: MV; flow: MotionValue<Flow>; type: Type }) {
  const top = useTransform(flow, (f) => u(f.navTop));
  const plate = useTransform(flow, (f) => u(f.navTop + NAV_H + NAV_PLATE_PAD));
  const rule = useTransform(flow, (f) => clamp01(f.scroll / 6));
  const tabsClip = useTransform(flow, (f) => `inset(${CLIP_PAD} 0 ${CLIP_PAD} ${(f.nav * 100).toFixed(2)}%)`);
  const menuClip = useTransform(flow, (f) => `inset(${CLIP_PAD} ${((1 - f.nav) * 100).toFixed(2)}% ${CLIP_PAD} 0)`);
  const tabsShown = useTransform(flow, (f) => (f.nav < 0.999 ? "visible" : "hidden"));
  return (
    <>
      <motion.div aria-hidden style={{ height: plate }} className="absolute inset-x-0 top-0 z-[35] bg-bg">
        <motion.i style={{ opacity: rule }} className="absolute inset-x-0 bottom-0 h-px bg-line-strong" />
      </motion.div>
      <motion.div
        style={{ top, height: u(NAV_H), left: u(M), right: u(M) }}
        className="absolute z-[36] flex items-center justify-between"
      >
        <div className="relative">
          <motion.div style={{ clipPath: tabsClip, visibility: tabsShown, gap: u(12) }} className="flex items-center">
            {TEXT.nav.map((label) => (
              <motion.span
                key={label}
                style={{ fontSize: type.name, lineHeight: 1, paddingBottom: u(2) }}
                className={`relative whitespace-nowrap ${label === TEXT.activeNav ? "text-fg" : "text-mute"}`}
              >
                {label}
                {label === TEXT.activeNav ? <i aria-hidden className="absolute inset-x-0 bottom-[-2px] h-[2px] rounded-full bg-accent" /> : null}
              </motion.span>
            ))}
          </motion.div>
          <motion.div style={{ clipPath: menuClip }} className="absolute inset-0 flex items-center">
            <Menu />
          </motion.div>
        </div>
        <span className="relative flex">
          <MtmGlyph name="cart" size={u(13)} />
          <CartBadge p={p} type={type} />
        </span>
      </motion.div>
    </>
  );
}

const URL_WIDE: Rect = { x: 50, y: 87, w: 256, h: 12 };
/* The address is wiped away from its right end while the pill is still wider than the text, so it is never faded through
   and never cut by the pill's edge. */
const LABEL_OUT = [0.05, 0.36] as const;

export function Chrome({ p }: { p: MV }) {
  const pill = useBox(p, (v) => lerpRect(URL_WIDE, ISLAND, frameEase(v)));
  const island = useTransform(p, (v) => segAt(frameEase(v), DEVICE_IN));
  const fill = useTransform(island, (t) => `color-mix(in oklab, ${GLASS} ${(t * 100).toFixed(1)}%, var(--color-surface-2))`);
  const rim = useTransform(island, (t) => `color-mix(in oklab, var(--color-line-strong) ${((1 - t) * 100).toFixed(1)}%, transparent)`);
  const label = useTransform(p, (v) => softWipe(1 - segAt(frameEase(v), LABEL_OUT)));
  const dots = useTransform(p, (v) => 1 - segAt(frameEase(v), [0, 0.3]));
  const dotsLeft = useTransform(p, (v) => u(frameAt(v).frame.x + 8));
  const dotsTop = useTransform(p, (v) => u(frameAt(v).frame.y + 6));
  /* The address is the one of the view on screen: the grid is at the collection, the form and the cart are at the product. */
  const path = useTransform(p, (v): string => VIEW_PATHS[Math.round(viewAt(v))]);
  return (
    <>
      <motion.div aria-hidden style={{ left: dotsLeft, top: dotsTop, opacity: dots, gap: u(3.5) }} className="absolute z-20 flex">
        {[0, 1, 2].map((i) => (
          <i key={i} className="rounded-full bg-line-strong" style={{ width: u(5), height: u(5) }} />
        ))}
      </motion.div>
      <motion.div aria-hidden style={{ ...pill, backgroundColor: fill, borderColor: rim }} className="absolute z-50 grid place-items-center overflow-hidden rounded-full border">
        <motion.span
          style={{ maskImage: label, WebkitMaskImage: label, fontSize: u(FS), lineHeight: 1, paddingInline: u(6) }}
          className={`${MONO} max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-mute`}
        >
          {path}
        </motion.span>
      </motion.div>
    </>
  );
}

const FRAME_END = 0.6;

/* A resize handle on the right edge of the frame: it is dragged inwards while the window narrows. */
export function Grip({ p }: { p: MV }) {
  const opacity = useTransform(p, [T.grip[0], T.grip[1], FRAME_END - 0.03, FRAME_END], [0, 1, 1, 0]);
  const left = useTransform(p, (v) => u(frameAt(v).frame.x + frameAt(v).frame.w));
  const top = useTransform(p, (v) => u(frameAt(v).frame.y + frameAt(v).frame.h / 2));
  return (
    <motion.span
      aria-hidden
      style={{ opacity, left, top, width: u(7), height: u(30), marginLeft: u(-3.5), marginTop: u(-15) }}
      className="absolute z-40 flex items-center justify-center gap-[2px] rounded-full border border-accent bg-bg"
    >
      <i className="h-[45%] w-px rounded-full bg-accent" />
      <i className="h-[45%] w-px rounded-full bg-accent" />
    </motion.span>
  );
}
