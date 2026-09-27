"use client";

import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { EMAIL_FLOWS } from "./MtmKitData";
import { useKeys } from "./MtmKitMath";
import { CAPTIONS, CHAPTERS, COPY, HERO, MERGE_FIELDS, RES_WINS, T, liveOnWin, restyleWin, trigWin } from "./MtmEmailSceneData";
import { STAGE_STYLE, countDone } from "./MtmEmailSceneMath";
import { EventWire, TopRow } from "./MtmEmailSceneTop";
import { CardGrid } from "./MtmEmailSceneGrid";

/* Ten stock emails restyle, fire, merge into a real order, then go live. */

const WINS = (win: (i: number) => readonly [number, number]) => EMAIL_FLOWS.map((_, i) => win(i));

export function MtmEmailVisual({ p }: { p: MV }) {
  const flow = useKeys(p, T.flowX, T.ramp);
  const recede = useKeys(p, T.recedeX, T.ramp);
  const expand = useKeys(p, T.expandX, T.ramp);
  return (
    <div className="absolute inset-0 [container-type:size]">
      <div className="absolute inset-x-0" style={STAGE_STYLE}>
        <TopRow p={p} flow={flow} />
        <EventWire p={p} flow={flow} />
        <CardGrid p={p} expand={expand} recede={recede} />
      </div>
    </div>
  );
}

function readoutText(v: number) {
  const n = EMAIL_FLOWS.length;
  if (v < CHAPTERS[1]) return `branded ${countDone(v, WINS(restyleWin))}/${n}`;
  if (v < T.flowX[2]) return `armed ${countDone(v, WINS(trigWin))}/${n}`;
  if (v < RES_WINS[0][0]) return `event: ${HERO.trigger}`;
  if (v < T.plane[0]) return `fields ${countDone(v, RES_WINS)}/${MERGE_FIELDS}`;
  if (v < T.sent[1]) return COPY.sending;
  if (v < CHAPTERS[3]) return COPY.sent;
  return `live ${countDone(v, WINS(liveOnWin))}/${n}`;
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutText);
  return <motion.span>{text}</motion.span>;
}

export default function MtmEmailScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <MtmEmailVisual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[270svh] sm:h-[320svh]"
      stillAt={0.985}
    />
  );
}
