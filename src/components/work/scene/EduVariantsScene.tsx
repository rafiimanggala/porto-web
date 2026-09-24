"use client";

import { useId, useMemo } from "react";
import { motion, useTransform } from "framer-motion";
import ScrollScene from "./ScrollScene";
import type { MV } from "./HealthSceneParts";
import { CAPTIONS, CHAPTERS, LICENSED, READOUT_CUTS, VARIANTS, VIEW_W } from "./EduVariantsSceneData";
import { GeoContext, makeGeo, useStretch } from "./EduVariantsSceneGeo";
import { launchedAt, licensedAt, pluggedAt, topicsAt } from "./EduVariantsSceneKit";
import { Chip, ScanEdge } from "./EduVariantsSceneChips";
import { SharedCore } from "./EduVariantsSceneCore";
import { PickerCard, SchoolBadge, WipeClips, WipeEdge, type WipeIds } from "./EduVariantsScenePicker";
import { RootLink, RootTile } from "./EduVariantsSceneRoot";
import { GhostCopy, Tree } from "./EduVariantsSceneTrees";

/* One curriculum, a dozen course variants. A single Biology tile splits into
   seven syllabus chips, each chip grows its own topic tree, all seven plug into
   one shared quiz engine and results pipeline, and a school licence narrows the
   chips to the few that reach its subject picker. */

const N = VARIANTS.length;
const STILL_AT = 0.985;
const IDLE_FIRST = VARIANTS.flatMap((v, i) => (v.licensed ? [] : [i]));

function readoutText(v: number) {
  if (v < READOUT_CUTS[0]) return `variants ${launchedAt(v)}/${N}`;
  if (v < READOUT_CUTS[1]) return `topics ${topicsAt(v)}`;
  if (v < READOUT_CUTS[2]) return `plugged in ${pluggedAt(v)}/${N}`;
  return `licensed ${licensedAt(v)}/${N}`;
}

function Readout({ p }: { p: MV }) {
  const text = useTransform(p, readoutText);
  return <motion.span>{text}</motion.span>;
}

function Visual({ p }: { p: MV }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids: WipeIds = { old: `edu-old-${uid}`, next: `edu-new-${uid}`, band: `edu-band-${uid}`, line: `edu-line-${uid}` };
  const { sy, narrow, ref } = useStretch();
  const G = useMemo(() => makeGeo(sy, narrow), [sy, narrow]);
  return (
    <GeoContext.Provider value={G}>
      <svg ref={ref} viewBox={`0 0 ${VIEW_W} ${G.viewH}`} className="absolute inset-0 h-full w-full" aria-hidden>
        <WipeClips p={p} ids={ids} />
        <g clipPath={`url(#${ids.old})`}>
          {VARIANTS.map((v, i) => (
            <Tree key={i} p={p} v={v} i={i} />
          ))}
          <GhostCopy p={p} />
          <SharedCore p={p} />
        </g>
        <g clipPath={`url(#${ids.next})`}>
          <PickerCard p={p} />
        </g>
        <WipeEdge p={p} ids={ids} />
        {VARIANTS.map((_, i) => (
          <RootLink key={i} p={p} i={i} />
        ))}
        {IDLE_FIRST.map((i) => (
          <Chip key={i} p={p} v={VARIANTS[i]} i={i} />
        ))}
        {LICENSED.map((i) => (
          <Chip key={i} p={p} v={VARIANTS[i]} i={i} />
        ))}
        <ScanEdge p={p} />
        <RootTile p={p} />
        <SchoolBadge p={p} />
      </svg>
    </GeoContext.Provider>
  );
}

export default function EduVariantsScene() {
  return (
    <ScrollScene
      captions={CAPTIONS}
      chapters={CHAPTERS}
      render={(p) => <Visual p={p} />}
      readout={(p) => <Readout p={p} />}
      heightClass="h-[240svh] sm:h-[280svh]"
      stillAt={STILL_AT}
    />
  );
}
