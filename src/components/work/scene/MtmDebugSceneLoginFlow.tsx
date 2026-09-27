"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { LOGIN, PAGES } from "./MtmDebugSceneData";
import { Roll } from "./MtmDebugSceneKit";
import { keyframes, pct, useWin } from "./MtmDebugSceneMath";
import { MtmGlyph } from "./MtmKitGlyphs";
import { mixColor } from "./MtmKitMath";

/* The redirect as two pages and a token. While the copies fight, the token bounces between them and every arrival counts;
   once one copy is left it goes across once and stays. */

const FLOW_H = 100;
const TILE_W = 104;
const LINE_Y = 50;
const TOKEN = 10;
const ARRIVAL_SPAN = 0.014;
const FINAL_AT = LOGIN.bounce.xs[LOGIN.bounce.xs.length - 1];
const OK_WIN = [FINAL_AT - 0.008, FINAL_AT] as const;
const ROSE = "var(--color-rose)";
const MINT = "var(--color-mint)";

const tokenAt = (v: number) => keyframes(v, LOGIN.bounce.xs, LOGIN.bounce.ys);
const arrivals = (v: number) => LOGIN.bounce.xs.filter((x, j) => j > 0 && v >= x).length;

/* Triangular bump around every arrival on one side of the flow: 0 is the login page, 1 the account. */
function bumpAt(v: number, side: number) {
  const { xs, ys } = LOGIN.bounce;
  return Math.max(0, ...xs.map((x, j) => (j > 0 && ys[j] === side ? 1 - Math.min(1, Math.abs(v - x) / ARRIVAL_SPAN) : 0)));
}

function Bar({ w, strong = false }: { w: number | string; strong?: boolean }) {
  return <i style={{ width: w }} className={`block h-[5px] rounded-full ${strong ? "bg-dim" : "bg-line-strong"}`} />;
}

const FIELD = "block h-3 rounded-[3px] border border-line-strong bg-surface-1";

/* Login page: a title, two fields and a button. Account page: a person and two rows. */
function LoginBody() {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1">
        <MtmGlyph name="key" size={14} />
        <Bar w={36} strong />
      </span>
      <i className={FIELD} />
      <i className={FIELD} />
      <i className="block h-3.5 rounded-[3px] bg-accent/80" />
    </div>
  );
}

function AccountBody() {
  return (
    <div className="flex flex-col gap-1">
      <span className="flex items-center gap-1.5">
        <MtmGlyph name="user" size={20} />
        <span className="flex flex-col gap-1">
          <Bar w={40} strong />
          <Bar w={26} />
        </span>
      </span>
      <i className={FIELD} />
      <i className={FIELD} />
    </div>
  );
}

function Tile({ p, side, path }: { p: MV; side: 0 | 1; path: string }) {
  const bump = useTransform(p, (v) => bumpAt(v, side));
  const ok = useWin(p, OK_WIN);
  const ring = useTransform(ok, (t) => (side === 1 ? mixColor(MINT, t, ROSE) : ROSE));
  const badge = useWin(p, LOGIN.keep);
  return (
    <div style={{ width: TILE_W }} className="relative flex h-full flex-col rounded-lg border border-line-strong bg-surface-2">
      <span className={`${MONO} flex h-[18px] shrink-0 items-center border-b border-line px-1.5 text-[10px] text-fg`}>{path}</span>
      <div className="flex-1 p-1.5">{side === 0 ? <LoginBody /> : <AccountBody />}</div>
      <motion.i aria-hidden style={{ opacity: bump, borderColor: ring }} className="pointer-events-none absolute -inset-[3px] rounded-[11px] border-2" />
      {side === 1 ? (
        <motion.span aria-hidden style={{ scale: badge, opacity: badge }} className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-surface-1">
          <MtmGlyph name="check" size={18} />
        </motion.span>
      ) : null}
    </div>
  );
}

function Track({ p }: { p: MV }) {
  const u = useTransform(p, tokenAt);
  const left = useTransform(u, (x) => pct(x * 100));
  const resolved = useWin(p, OK_WIN);
  const dashed = useTransform(resolved, (r) => 1 - r);
  const head = useTransform(resolved, (r) => mixColor(MINT, r, ROSE));
  const swap = useWin(p, LOGIN.keep);
  const hops = useTransform(p, (v) => `redirects ${Math.min(arrivals(v), 4)}`);
  return (
    <div style={{ left: TILE_W + 8, right: TILE_W + 8 }} className="absolute inset-y-0">
      <motion.i aria-hidden style={{ opacity: dashed, top: LINE_Y - 1 }} className="absolute inset-x-0 border-t-2 border-dashed border-rose" />
      <motion.i aria-hidden style={{ opacity: resolved, top: LINE_Y - 1 }} className="absolute inset-x-0 h-0.5 bg-mint" />
      <motion.i aria-hidden style={{ opacity: dashed, top: LINE_Y - 4 }} className="absolute left-0 h-2 w-1.5 bg-rose [clip-path:polygon(100%_0,0_50%,100%_100%)]" />
      <motion.i aria-hidden style={{ background: head, top: LINE_Y - 4 }} className="absolute right-0 h-2 w-1.5 [clip-path:polygon(0_0,100%_50%,0_100%)]" />
      <motion.i
        aria-hidden
        style={{ left, top: LINE_Y - TOKEN / 2, width: TOKEN, height: TOKEN, marginLeft: -TOKEN / 2 }}
        className="absolute z-10 rounded-full bg-accent shadow-[0_0_0_2px_var(--color-surface-1)]"
      />
      <span className={`${MONO} absolute inset-x-0 top-[64px] block text-center text-[10px] leading-[14px]`}>
        <Roll
          t={swap}
          h={14}
          align="center"
          a={<motion.span className="tabular-nums text-rose">{hops}</motion.span>}
          b={<span className="text-mint">redirect ok</span>}
        />
      </span>
    </div>
  );
}

export default function LoginFlow({ p }: { p: MV }) {
  return (
    <div style={{ height: FLOW_H }} className="relative">
      <div className="absolute left-0 top-0 h-full">
        <Tile p={p} side={0} path={PAGES.from} />
      </div>
      <div className="absolute right-0 top-0 h-full">
        <Tile p={p} side={1} path={PAGES.to} />
      </div>
      <Track p={p} />
    </div>
  );
}
