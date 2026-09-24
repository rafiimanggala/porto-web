"use client";

import { motion, useTransform } from "framer-motion";
import ChatSceneShell from "./ChatSceneShell";
import type { MV } from "./HealthSceneParts";
import { ActionBar, ChatHeader, PlanSheet } from "./ChatSceneBars";
import { ATTACH_AT, ATTACH_LEN, CAPTIONS, CHAPTERS, CITE_AT, PLAN_ROWS_AT, STILL_AT, T } from "./ChatSceneData";
import { Rail } from "./ChatSceneRail";
import { FocusThread, GeneralThread } from "./ChatSceneThread";

const count = (times: readonly number[], v: number, lag = 0) => times.filter((t) => v >= t + lag).length;

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, (v) => {
    if (v < T.swap[0]) return `sources ${count(ATTACH_AT, v, ATTACH_LEN / 2)}/4`;
    if (v < T.push[0]) return `cited ${count(Object.values(CITE_AT), v)}/3`;
    if (v < T.swapBar[0]) return "focus: vitamin D";
    return `plan ${count(PLAN_ROWS_AT.map((r) => r[1]), v)}/3`;
  });
  return <motion.span>{text}</motion.span>;
}

function Visual({ p }: { p: MV }) {
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div className="absolute inset-x-0 top-1/2 flex h-[min(100%,504px)] -translate-y-1/2 flex-col overflow-hidden rounded-xl border border-line-strong bg-surface-1 shadow-[0_18px_40px_-24px_rgba(0,0,0,0.6)] @[30rem]:h-[min(100%,600px)]">
        <ChatHeader p={p} />
        <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] @[30rem]:grid-cols-[minmax(0,1fr)_minmax(0,0.4fr)] @[30rem]:grid-rows-1">
          <div className="relative min-h-0 overflow-hidden">
            <GeneralThread p={p} />
            <FocusThread p={p} />
            <PlanSheet p={p} />
          </div>
          <div className="border-t border-line @[30rem]:border-l @[30rem]:border-t-0">
            <Rail p={p} />
          </div>
        </div>
        <ActionBar p={p} />
      </div>
    </div>
  );
}

export default function ChatScene() {
  return (
    <ChatSceneShell
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[420svh] sm:h-[460svh]"
      stillAt={STILL_AT}
    />
  );
}
