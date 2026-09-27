"use client";

import { motion, useTransform, type MotionStyle } from "framer-motion";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { MtmGlyph } from "./MtmKitGlyphs";
import { COLLARS, CUFFS, ORDER, PRODUCT, STACK } from "./MtmKitData";
import { CartButton, OptionChip, PatternCard } from "./MtmKitCards";
import { FIT_HEAD, FIT_LIST, FIT_SHORT, GATE_NOTE, NO_FIT, OPTION_LABELS, T } from "./MtmFitSceneData";
import { Tag, Wipe } from "./MtmFitSceneKit";
import { shake, stretchAt } from "./MtmFitSceneMotion";
import { pct, toneTint } from "./MtmKitMath";

function Head() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[13px] font-medium text-fg @[520px]:text-[15px]">{PRODUCT.name}</span>
      <Tag tone="sky">{PRODUCT.gender}</Tag>
      <span className={`${MONO} ml-auto text-[10px] uppercase tracking-[0.1em] text-mute`}>{STACK.theme}</span>
    </div>
  );
}

const SCAN_BAND = `linear-gradient(90deg, transparent, ${toneTint("sun", 0.22)}, transparent)`;

/* While the probe is out a soft band sweeps the slot, as if the theme were looking for fit data in it. */
function Scan({ p }: { p: MV }) {
  const t = useSeg(p, T.probeOut[0], T.probeOut[1]);
  const left = useTransform(t, (v) => pct(v * 100));
  const opacity = useTransform(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  return (
    <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
      <motion.i style={{ left, opacity, background: SCAN_BAND }} className="absolute inset-y-0 w-36 -translate-x-1/2" />
    </span>
  );
}

/* The store hit: the slot floods rose and its content shakes, only the inside moves so the frame stays whole. */
function EmptySlot({ p }: { p: MV }) {
  const hit = useTransform(p, [T.probeHit[0], T.probeHit[1], T.probeBack[1]], [0, 1, 0]);
  const x = useTransform(p, (v) => shake(v, T.probeShake[0], T.probeShake[1], 6));
  return (
    <div className="relative flex h-full items-center rounded-lg border border-dashed border-line-strong px-3">
      <Scan p={p} />
      <motion.i aria-hidden style={{ opacity: hit }} className="pointer-events-none absolute -inset-px rounded-lg border-2 border-rose bg-rose/20" />
      <motion.div style={{ x }} className="relative flex min-w-0 items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-surface-2">
          <MtmGlyph name="tape" size={24} />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-fg @[520px]:text-[14px]">{NO_FIT.title}</p>
          <p className={`${MONO} mt-0.5 text-[10px] text-mute @[520px]:text-[11px]`}>{NO_FIT.note}</p>
        </div>
      </motion.div>
    </div>
  );
}

function FitList({ p }: { p: MV }) {
  const select = useSeg(p, T.select[0], T.select[1]);
  const open = useTransform(p, stretchAt);
  return (
    <div className="flex h-full flex-col gap-1.5 @[520px]:gap-2">
      {FIT_LIST.map((pt, i) => (
        <motion.div
          key={pt.id}
          style={i < FIT_SHORT ? undefined : { opacity: open }}
          className={i < FIT_SHORT ? "" : "hidden @[520px]:[@media(min-height:820px)]:block"}
        >
          <PatternCard name={pt.name} gender={pt.gender} state="saved" selected={i === 0 ? select : 0} />
        </motion.div>
      ))}
    </div>
  );
}

const LABEL = `${MONO} text-[10px] uppercase leading-none tracking-[0.12em] text-mute`;

function OptionRow({ label, items, active }: { label: string; items: readonly string[]; active: string }) {
  return (
    <div className="w-full">
      <p className={`${LABEL} mb-1.5`}>{label}</p>
      <div className="flex flex-wrap gap-1.5">
        {items.map((item) => (
          <OptionChip key={item} label={item} active={item === active} />
        ))}
      </div>
    </div>
  );
}

/* When the bar opens, in the room the stretched window leaves above it. */
function GateNote({ p }: { p: MV }) {
  const opacity = useSeg(p, T.cartIn[0], T.cartIn[1]);
  return (
    <motion.p style={{ opacity }} className={`${MONO} absolute inset-x-4 bottom-[72px] hidden text-[12px] leading-snug text-dim @[520px]:[@media(min-height:820px)]:block`}>
      {GATE_NOTE}
    </motion.p>
  );
}

/* A wrapping column: whatever does not fit the height moves to a second column outside the frame, so no line is ever cut in half.
   On a tall window the room the stretch opens up is used: the list gains its third pattern and the gaps widen with it (--stretch, 0 to 1). */
const STRETCH_BOX = "@[520px]:[@media(min-height:820px)]:h-[calc(132px+var(--stretch,0)*62px)]";
const STRETCH_GAP = "@[520px]:[@media(min-height:820px)]:gap-y-[calc(0.75rem+var(--stretch,0)*0.75rem)]";

export function ProductPage({ p }: { p: MV }) {
  const swap = useSeg(p, T.list[0], T.list[1]);
  const stretch = useTransform(p, stretchAt);
  const [first] = ORDER.items;
  return (
    <motion.div
      style={{ "--stretch": stretch } as MotionStyle}
      className={`absolute inset-0 flex flex-col flex-wrap content-start gap-x-40 gap-y-1.5 overflow-hidden p-2.5 @[520px]:gap-y-3 @[520px]:p-4 ${STRETCH_GAP}`}
    >
      <div className="w-full">
        <Head />
      </div>
      <p className={`${LABEL} w-full`}>{FIT_HEAD}</p>
      <Wipe t={swap} className={`h-[120px] w-full @[520px]:h-[132px] ${STRETCH_BOX}`} from={<EmptySlot p={p} />} to={<FitList p={p} />} />
      <OptionRow label={OPTION_LABELS.collar} items={COLLARS} active={first.collar} />
      <OptionRow label={OPTION_LABELS.cuff} items={CUFFS} active={first.cuff} />
      {/* On a wide, tall window the bar lives in the pinned gate at the foot of the window (MtmFitSceneGate). */}
      <CartButton unlock={0} className="w-full @[520px]:[@media(min-height:820px)]:hidden" />
      <GateNote p={p} />
    </motion.div>
  );
}
