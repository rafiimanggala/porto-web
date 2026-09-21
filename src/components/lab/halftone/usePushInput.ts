import { useRef } from "react";
import type { KeyboardEvent, PointerEvent, RefObject } from "react";
import type { HalftoneEngine, Push } from "./engine";

const KEY_VECTORS: Readonly<Record<string, Push>> = {
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
};
const KEY_PUSH = 300; // CSS px of virtual pointer offset per held arrow key

const isArrow = (key: string) => Object.hasOwn(KEY_VECTORS, key);

function offsetFromCentre(e: PointerEvent<HTMLCanvasElement>): Push {
  const r = e.currentTarget.getBoundingClientRect();
  return { x: e.clientX - r.left - r.width / 2, y: e.clientY - r.top - r.height / 2 };
}

// Press-and-hold on the canvas, or hold arrow keys while it has focus, pushes
// the plates toward that point. Release ends the push; the engine eases back.
export function usePushInput(engineRef: RefObject<HalftoneEngine | null>) {
  const held = useRef<ReadonlySet<string>>(new Set());
  const active = useRef<number | null>(null); // id of the pointer doing the push

  const clearPush = () => engineRef.current?.setPush(null);
  // A cancelled touch (the browser took the gesture to scroll) ends the push
  // the same way a release does. Other pointers are ignored.
  const endPointer = (e: PointerEvent<HTMLCanvasElement>) => {
    if (active.current !== e.pointerId) return;
    active.current = null;
    clearPush();
  };

  const applyKeys = (keys: ReadonlySet<string>) => {
    held.current = keys;
    if (keys.size === 0) {
      clearPush();
      return;
    }
    const sum = [...keys].reduce(
      (acc, key) => ({ x: acc.x + KEY_VECTORS[key].x, y: acc.y + KEY_VECTORS[key].y }),
      { x: 0, y: 0 },
    );
    engineRef.current?.setPush({ x: sum.x * KEY_PUSH, y: sum.y * KEY_PUSH });
  };

  return {
    onPointerDown: (e: PointerEvent<HTMLCanvasElement>) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      active.current = e.pointerId;
      // Touch is captured implicitly; capturing it by hand would only pin a
      // pointer the browser may want back for a scroll.
      if (e.pointerType !== "touch") e.currentTarget.setPointerCapture(e.pointerId);
      engineRef.current?.setPush(offsetFromCentre(e));
    },
    onPointerMove: (e: PointerEvent<HTMLCanvasElement>) => {
      if (active.current !== e.pointerId) return;
      engineRef.current?.setPush(offsetFromCentre(e));
    },
    onPointerUp: endPointer,
    onPointerCancel: endPointer,
    onLostPointerCapture: endPointer,
    onKeyDown: (e: KeyboardEvent<HTMLCanvasElement>) => {
      if (!isArrow(e.key)) return;
      e.preventDefault();
      applyKeys(new Set([...held.current, e.key]));
    },
    onKeyUp: (e: KeyboardEvent<HTMLCanvasElement>) => {
      if (!isArrow(e.key)) return;
      applyKeys(new Set([...held.current].filter((key) => key !== e.key)));
    },
    onBlur: () => applyKeys(new Set()),
  };
}
