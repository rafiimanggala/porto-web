"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import { MONO, easeInOutCubic, type MV } from "./HealthSceneParts";
import { COPIES, HELPER, LAYOUT_FILE, LOGIN, REDIRECT_CLASH } from "./MtmDebugSceneData";
import { LABEL, Roll, Tag } from "./MtmDebugSceneKit";
import { at, keyframes, tent, useWin } from "./MtmDebugSceneMath";

/* Three copies of one helper as a pile of code cards. They start fanned by a header and the destination line, so all three
   destinations read from the first frame, then spread apart, then the first two slide behind the last one and only that one is left. */

const HEAD = 20;
const CARD_H = 54;
const PITCH = CARD_H + 6;
const REGION_H = CARD_H + 2 * PITCH;
const HEADER_H = 32;
const FAN = HEAD + 16;
const CASCADE_TOP = (REGION_H - (CARD_H + 2 * FAN)) / 2;
const BRACKET_INSET = 4;
const MERGED_Y = (REGION_H - CARD_H) / 2;
const GUTTER = 78;
const JITTER_PX = 1;
const JITTER_RATE = 300;
const LAST = COPIES.length - 1;
const Y_KEYS = [LOGIN.spread[0], LOGIN.spread[1], LOGIN.merge[0], LOGIN.merge[1]];
/* Mono while the panel is small, where a display face at 24px closes up into a blob; the display face once the panel is wide. */
const NUMERAL = `${MONO} block text-[24px] font-bold leading-none @min-[500px]:font-[family-name:var(--font-display)] @min-[500px]:font-semibold @min-[500px]:tracking-[-0.035em]`;

const cardY = (v: number, i: number) => keyframes(v, Y_KEYS, [CASCADE_TOP + i * FAN, i * PITCH, i * PITCH, MERGED_Y]);
const jitter = (v: number, i: number) => JITTER_PX * (1 - at(v, LOGIN.jitterOff)) * Math.sin(v * JITTER_RATE + i * 2.1);

/* The copy that is fired by the redirect leg under way pulses: the first one sends users to login, the last to the account. */
function pulseAt(v: number, i: number) {
  const { xs, ys } = LOGIN.bounce;
  const leg = xs.findIndex((x, j) => j < xs.length - 1 && v >= x && v < xs[j + 1]);
  if (leg < 0 || i === 1) return 0;
  const toAccount = ys[leg + 1] === 1;
  if ((i === LAST) !== toAccount) return 0;
  return Math.sin(Math.PI * ((v - xs[leg]) / (xs[leg + 1] - xs[leg]))) * (1 - at(v, LOGIN.mark));
}

function Line({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`h-[13px] whitespace-nowrap ${className}`}>{children}</p>;
}

function Strike({ t }: { t: MV }) {
  return <motion.i style={{ scaleX: t }} className="absolute left-2 top-1/2 h-px w-[29ch] origin-left bg-rose" />;
}

function CopyCard({ p, i }: { p: MV; i: number }) {
  const copy = COPIES[i];
  const keeper = i === LAST;
  const y = useTransform(p, (v) => cardY(v, i));
  const x = useTransform(p, (v) => jitter(v, i));
  const scale = useTransform(p, (v) => (keeper ? 1 + 0.035 * tent(v, LOGIN.keep[0], LOGIN.keep[0] + 0.008, LOGIN.keep[1]) : 1));
  const ring = useTransform(p, (v) => pulseAt(v, i) * 0.9);
  const mark = useWin(p, LOGIN.mark);
  const frame = useWin(p, LOGIN.keep);
  const hl = useTransform(p, (v) => at(v, [LOGIN.reveal[0] + i * 0.007, LOGIN.reveal[0] + i * 0.007 + 0.012]));
  return (
    <motion.div
      style={{ y, x, scale, height: CARD_H, zIndex: i + 1, right: GUTTER }}
      className={`${MONO} absolute left-0 top-0 overflow-hidden rounded-lg border border-line-strong bg-surface-2 text-[10px] leading-[13px]`}
    >
      <div style={{ height: HEAD }} className="relative flex items-center justify-between border-b border-line px-2">
        <span className="whitespace-nowrap">
          <span className="text-mute">function </span>
          <span className="text-fg">{HELPER}</span>
          <span className="text-mute">()</span>
        </span>
        <span className="tabular-nums text-mute">L{copy.line}</span>
        {keeper ? null : <Strike t={mark} />}
      </div>
      <div className="px-2 pt-[3px]">
        <Line className="pl-3">
          <span className="text-mute">return </span>
          <span className="relative text-fg">
            <motion.i style={{ opacity: hl }} className="absolute -inset-x-0.5 inset-y-0 rounded-sm bg-sun/30" />
            <span className="relative">{`"${copy.dest}"`}</span>
          </span>
        </Line>
        <Line className="text-mute">{"}"}</Line>
      </div>
      <motion.span style={{ opacity: mark }} className="absolute bottom-[5px] right-2">
        <Tag tone={keeper ? "mint" : "rose"}>{keeper ? "keep" : "remove"}</Tag>
      </motion.span>
      {keeper ? (
        <motion.i style={{ opacity: frame }} className="pointer-events-none absolute inset-0 rounded-lg border-2 border-mint" />
      ) : (
        <motion.i style={{ opacity: mark }} className="pointer-events-none absolute inset-0 bg-rose/10" />
      )}
      <motion.i style={{ opacity: ring }} className="pointer-events-none absolute inset-0 rounded-lg border-2 border-accent" />
    </motion.div>
  );
}

/* A double arrow between two headers: the copies pull against each other with the same override.
   Both ends stop short of the header they point at, so two brackets never meet head to head on the middle card. */
function Bracket({ p, k }: { p: MV; k: number }) {
  const top = useTransform(p, (v) => cardY(v, k) + HEAD / 2 + BRACKET_INSET);
  const height = useTransform(p, (v) => Math.max(0, cardY(v, k + 1) - cardY(v, k) - 2 * BRACKET_INSET));
  const opacity = useTransform(p, (v) => 1 - at(v, LOGIN.bracketOff));
  return (
    <motion.div aria-hidden style={{ top, height, opacity, width: GUTTER }} className="pointer-events-none absolute right-0 z-20">
      <i className="absolute left-0 top-0 h-px w-2.5 bg-accent" />
      <i className="absolute bottom-0 left-0 h-px w-2.5 bg-accent" />
      <i className="absolute inset-y-0 left-[9px] w-0.5 bg-accent" />
      <i className="absolute -top-px left-[5px] h-1.5 w-2.5 bg-accent [clip-path:polygon(50%_0,0_100%,100%_100%)]" />
      <i className="absolute -bottom-px left-[5px] h-1.5 w-2.5 bg-accent [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      <Tag tone="accent" className="absolute left-[15px] top-1/2 -translate-y-1/2">
        {REDIRECT_CLASH}
      </Tag>
    </motion.div>
  );
}

/* The file name and the count ride the top edge of the pile, wherever it is. */
function Header({ p }: { p: MV }) {
  const y = useTransform(p, (v) => cardY(v, 0));
  const roll = useWin(p, LOGIN.roll, easeInOutCubic);
  return (
    <motion.div style={{ y }} className="absolute inset-x-0 top-0 flex h-7 items-center justify-between">
      <span className={`${MONO} text-[11px] text-dim`}>{LAYOUT_FILE}</span>
      <span className="flex items-center gap-2">
        <span className={LABEL}>copies</span>
        <Roll
          t={roll}
          h={26}
          align="center"
          className="w-4"
          a={<span className={`${NUMERAL} text-rose`}>{COPIES.length}</span>}
          b={<span className={`${NUMERAL} text-mint`}>1</span>}
        />
      </span>
    </motion.div>
  );
}

export default function LoginStack({ p }: { p: MV }) {
  return (
    <div style={{ height: HEADER_H + REGION_H }} className="relative">
      <Header p={p} />
      <div style={{ top: HEADER_H, height: REGION_H }} className="absolute inset-x-0">
        {COPIES.map((c, i) => (
          <CopyCard key={c.line} p={p} i={i} />
        ))}
        {COPIES.slice(1).map((c, k) => (
          <Bracket key={c.line} p={p} k={k} />
        ))}
      </div>
    </div>
  );
}
