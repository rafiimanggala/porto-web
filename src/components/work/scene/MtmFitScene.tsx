"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { keyframes } from "./MtmKitMath";
import { API, BRIDGE_LABEL, CAPTIONS, CHAPTERS, LAYOUT, NEW_RECORD, RECORD_COUNT, SLEEVE_T, T } from "./MtmFitSceneData";
import { BAD_ENTRY, MEASURES } from "./MtmKitData";
import { Bridge } from "./MtmFitSceneBridge";
import { validCount } from "./MtmFitSceneMotion";
import { Service } from "./MtmFitSceneService";
import { Window } from "./MtmFitSceneWindow";

const rowsAt = (v: number) => {
  const at = (ys: readonly number[]) => keyframes(v, LAYOUT.xs, ys).toFixed(3);
  return `minmax(0, ${at(LAYOUT.window)}fr) minmax(0, ${at(LAYOUT.gap)}fr) minmax(${LAYOUT.serviceMinPx}px, ${at(LAYOUT.service)}fr)`;
};

function Cell({ children }: { children: ReactNode }) {
  return <div className="relative min-h-0">{children}</div>;
}

/* Exported so the WorkReel card preview (mockup-video route) can drive this
   same visual directly with a manually-set progress value, instead of a
   fake mockup animation: one real scene, two places it plays. */
export function MtmFitVisual({ p }: { p: MV }) {
  const rows = useTransform(p, rowsAt);
  return (
    <div className="@container absolute inset-0 overflow-hidden">
      <motion.div style={{ gridTemplateRows: rows }} className="grid h-full">
        <Cell>
          <div className="absolute inset-0">
            <Window p={p} />
          </div>
        </Cell>
        <Cell>
          <Bridge p={p} />
        </Cell>
        <Cell>
          <Service p={p} />
        </Cell>
      </motion.div>
    </div>
  );
}

const total = MEASURES.length;
/* Each line switches when the picture it names is on screen: the bridge at the middle of the pill wipe, the retype hint once the bad value is erased. */
const BRIDGE_AT = (T.pill[0] + T.pill[1]) / 2;

function readoutText(v: number): string {
  if (v < T.probeOut[0]) return "Shopify: 0 fit fields";
  if (v < BRIDGE_AT) return `service: ${RECORD_COUNT.before} patterns`;
  if (v < T.get[0]) return `bridge: ${BRIDGE_LABEL}`;
  if (v < T.ok[0]) return API.list;
  if (v < T.formWipe[0]) return `${API.listOk}, ${RECORD_COUNT.before} patterns`;
  if (v >= SLEEVE_T.bad[0] && v < SLEEVE_T.back[1]) return `${BAD_ENTRY.typed} cm out of range`;
  if (v >= SLEEVE_T.back[1] && v < SLEEVE_T.ok[0]) return `sleeve: retype ${BAD_ENTRY.fixed} cm`;
  if (v < T.post[0]) return `${validCount(v)}/${total} fields valid`;
  if (v < T.created[0]) return API.write;
  return `${API.writeOk}, ${NEW_RECORD.id}, ${RECORD_COUNT.after} patterns`;
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutText);
  return <motion.span>{text}</motion.span>;
}

export default function MtmFitScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <MtmFitVisual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
      stillAt={1}
    />
  );
}
