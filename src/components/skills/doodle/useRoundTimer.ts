"use client";

import { useEffect, useRef } from "react";
import { ROUND_SECONDS } from "@/lib/doodle/round";

// Counts a round down while `running`. The seconds callback drives the text
// readout; the end callback fires once at the deadline. The animated bar is
// pure CSS and does not depend on these ticks.
export function useRoundTimer(
  running: boolean,
  roundKey: number,
  onSecond: (secondsLeft: number) => void,
  onEnd: () => void
): void {
  const secondRef = useRef(onSecond);
  const endRef = useRef(onEnd);

  useEffect(() => {
    secondRef.current = onSecond;
    endRef.current = onEnd;
  });

  useEffect(() => {
    if (!running) return;
    const deadline = performance.now() + ROUND_SECONDS * 1000;
    const tick = window.setInterval(() => {
      secondRef.current(Math.max(0, Math.ceil((deadline - performance.now()) / 1000)));
    }, 250);
    const end = window.setTimeout(() => endRef.current(), ROUND_SECONDS * 1000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(end);
    };
  }, [running, roundKey]);
}
