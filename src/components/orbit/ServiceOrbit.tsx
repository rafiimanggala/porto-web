"use client";

import { useCallback, useState } from "react";
import ServiceAccordion from "./ServiceAccordion";
import OrbitStage from "./OrbitStage";
import { useHydrated, useOrbitCapable } from "./useOrbitCapable";

// The homepage service directory, and the one heavy object on "/".
//
// Progressive enhancement, in order:
//   ssr       server HTML and first client render: the numbered accordion, all
//             seven services and links as real text, no script needed.
//   booting   a capable desktop (>= 768px, fine pointer) mounts the orbit
//             stage hidden while three.js loads. The accordion stays put.
//   ready     first WebGL frame drawn: the stage replaces the accordion.
//   fallback  phone, coarse pointer, no WebGL, or the GL context was lost:
//             the accordion is the final state.
//
// data-orbit-state and data-selected are the hooks tests read.
export default function ServiceOrbit() {
  const hydrated = useHydrated();
  const capable = useOrbitCapable();
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const fail = useCallback(() => {
    setFailed(true);
    setSelected(null);
  }, []);
  const wantsStage = hydrated && capable && !failed;
  const state = !hydrated ? "ssr" : !wantsStage ? "fallback" : ready ? "ready" : "booting";

  return (
    <div
      data-orbit-state={state}
      data-selected={wantsStage && ready ? (selected ?? "none") : "none"}
      className={wantsStage ? "relative md:min-h-[600px] lg:min-h-[640px]" : "relative"}
    >
      {!(wantsStage && ready) && <ServiceAccordion />}
      {wantsStage && (
        <OrbitStage
          ready={ready}
          selected={selected}
          onSelect={setSelected}
          onReadyChange={setReady}
          onFail={fail}
        />
      )}
    </div>
  );
}
