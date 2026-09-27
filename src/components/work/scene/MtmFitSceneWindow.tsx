"use client";

import type { ReactNode } from "react";
import { motion, useTransform } from "framer-motion";
import type { MV } from "./HealthSceneParts";
import { StoreWindow } from "./MtmKitStage";
import { clamp01, pct, segAt, useKeys } from "./MtmKitMath";
import { T } from "./MtmFitSceneData";
import { FormPage } from "./MtmFitSceneForm";
import { CartGate } from "./MtmFitSceneGate";
import { Edge, OUT_FADE } from "./MtmFitSceneKit";
import { ProductPage } from "./MtmFitSceneProduct";
import { SavePage } from "./MtmFitSceneSave";

const PAGE_KEYS = [T.formWipe[0], T.formWipe[1], T.saveWipe[0], T.saveWipe[1]] as const;
const PAGE_VALS = [0, 1, 1, 2] as const;

function Page({ pos, k, children }: { pos: MV; k: number; children: ReactNode }) {
  const shown = useTransform(pos, (v) => clamp01(v - (k - 1)));
  const cover = useTransform(pos, (v) => clamp01(v - k));
  const clip = useTransform([shown, cover], ([s, c]: number[]) => `inset(0 ${pct(100 - s * 100)} 0 ${pct(c * 100)})`);
  const opacity = useTransform(cover, [0, OUT_FADE], [1, 0]);
  return (
    <motion.div style={{ clipPath: clip, opacity }} className="absolute inset-0">
      {children}
    </motion.div>
  );
}

function ScanEdge({ pos, k }: { pos: MV; k: number }) {
  const front = useTransform(pos, (v) => clamp01(v - (k - 1)));
  const left = useTransform(front, (f) => pct(f * 100));
  const opacity = useTransform(front, [0, 0.04, 0.96, 1], [0, 1, 1, 0]);
  return <Edge left={left} opacity={opacity} />;
}

/* While the probe is out the load line creeps along, and it drops back when the probe finds nothing. */
const PROBE_LOAD = 0.6;

function loadAt(v: number) {
  if (v >= T.probeOut[0] && v < T.probeBack[1]) return PROBE_LOAD * segAt(v, T.probeOut[0], T.probeHit[0]) * (1 - segAt(v, T.probeHit[0], T.probeHit[1]));
  if (v >= T.get[0] && v < T.ok[1]) return segAt(v, T.get[0], T.ok[1]);
  if (v >= T.post[0] && v < T.created[1]) return segAt(v, T.post[0], T.created[1]);
  return 0;
}

export function Window({ p }: { p: MV }) {
  const pos = useKeys(p, PAGE_KEYS, PAGE_VALS);
  const load = useTransform(p, loadAt);
  return (
    <StoreWindow load={load}>
      <Page pos={pos} k={0}>
        <ProductPage p={p} />
      </Page>
      <Page pos={pos} k={1}>
        <FormPage p={p} />
      </Page>
      <Page pos={pos} k={2}>
        <SavePage p={p} />
      </Page>
      <CartGate p={p} />
      <ScanEdge pos={pos} k={1} />
      <ScanEdge pos={pos} k={2} />
    </StoreWindow>
  );
}
