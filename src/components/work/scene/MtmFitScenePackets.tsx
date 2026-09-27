"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { TONE_VAR, toneTint, useKeys, useSpan, type ToneName } from "./MtmKitMath";
import { API, T } from "./MtmFitSceneData";

/* The wire between the two boxes: where it sits and the packets that travel along it. */

export const WIRE_X = "var(--wire)";
export const BREAK = [30, 70] as const;
const PROBE_STOP = BREAK[0] / 100;

/* A packet stays this far from both ends, so its chip never straddles the border of a box. */
const EDGE_PX = 12;
const TRAIL_PX = 56;
const SPAN = `(100% - ${EDGE_PX * 2}px)`;
const along = (v: number) => `calc(${EDGE_PX}px + ${SPAN} * ${v.toFixed(4)})`;
const reach = (v: number) => `min(${TRAIL_PX}px, ${SPAN} * ${v.toFixed(4)})`;

type TrailProps = { t: MV; down: boolean; tone: ToneName; opacity: MV };

/* A comet tail behind the head: it fades towards where the packet came from. */
function Trail({ t, down, tone, opacity }: TrailProps) {
  const top = useTransform(t, (v) => (down ? `calc(${along(v)} - ${reach(v)})` : along(1 - v)));
  const height = useTransform(t, reach);
  const background = `linear-gradient(${down ? "to bottom" : "to top"}, transparent, ${toneTint(tone, 0.75)})`;
  return <motion.i aria-hidden style={{ left: WIRE_X, top, height, opacity, background }} className="absolute z-[9] w-[7px] -translate-x-1/2 rounded-full blur-[2px]" />;
}

type PacketProps = { t: MV; down: boolean; label: string; tone: ToneName; fade?: MV; trail?: MV };

function Packet({ t, down, label, tone, fade, trail }: PacketProps) {
  const top = useTransform(t, (v) => along(down ? v : 1 - v));
  const own = useTransform(t, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const opacity = fade ?? own;
  return (
    <>
      <Trail t={t} down={down} tone={tone} opacity={trail ?? opacity} />
      <motion.div style={{ left: WIRE_X, top, opacity }} className="absolute z-10 flex -translate-y-1/2 items-center gap-1.5">
        <i className="-ml-[5px] block h-2.5 w-2.5 shrink-0 rounded-full border-2 border-bg" style={{ background: TONE_VAR[tone] }} />
        <span
          className={`${MONO} whitespace-nowrap rounded-full px-2 py-[3px] text-[10px] leading-none text-fg @[520px]:px-2.5 @[520px]:py-1 @[520px]:text-[12px]`}
          style={{ background: toneTint(tone, 0.5) }}
        >
          {label}
        </span>
      </motion.div>
    </>
  );
}

/* A ring blooms where the probe meets the end of the wire. */
export function Impact({ p }: { p: MV }) {
  const t = useSeg(p, T.probeHit[0], T.probeHit[1] + 0.04);
  const scale = useTransform(t, (v) => 0.5 + 2.4 * v);
  const opacity = useTransform(t, [0, 0.15, 1], [0, 0.9, 0]);
  return (
    <motion.i
      aria-hidden
      style={{ left: WIRE_X, top: along(PROBE_STOP), scale, opacity }}
      className="absolute z-[8] h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-rose"
    />
  );
}

export function Packets({ p }: { p: MV }) {
  const probeAt = useKeys(p, [T.probeOut[0], T.probeOut[1], T.probeBack[0], T.probeBack[1]], [0, PROBE_STOP, PROBE_STOP, PROBE_STOP / 2]);
  const probeOn = useSpan(p, T.probeOut[0], T.probeBack[1]);
  const probeTrail = useTransform(p, [T.probeOut[0], T.probeOut[0] + 0.01, T.probeOut[1], T.probeHit[1]], [0, 1, 1, 0]);
  const get = useSeg(p, T.get[0], T.get[1]);
  const ok = useSeg(p, T.ok[0], T.ok[1]);
  const post = useSeg(p, T.post[0], T.post[1]);
  const created = useSeg(p, T.created[0], T.created[1]);
  return (
    <>
      <Packet t={probeAt} down label={API.probe} tone="sun" fade={probeOn} trail={probeTrail} />
      <Packet t={get} down label={API.list} tone="accent" />
      <Packet t={ok} down={false} label={API.listOk} tone="mint" />
      <Packet t={post} down label={API.write} tone="accent" />
      <Packet t={created} down={false} label={API.writeOk} tone="mint" />
    </>
  );
}
