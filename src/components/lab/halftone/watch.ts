// Browser signals that decide whether a frame should be drawn at all.
// Returns one function that removes every listener and observer.

export type Signals = {
  onResize: () => void; // canvas box or device pixel ratio changed
  onVisible: (visible: boolean) => void; // panel scrolled into or out of view
  onWake: () => void; // tab became visible again
  onLost: () => void;
  onRestored: () => void;
};

// devicePixelRatio has no change event, and a ResizeObserver stays quiet when
// only the ratio moves (window dragged to another monitor, browser zoom). A
// resolution query stops matching when the ratio changes, so re-arm one against
// the new ratio each time it fires. Returns the function that removes it.
function watchPixelRatio(onChange: () => void): () => void {
  let query: MediaQueryList | null = null;
  const onFire = () => {
    arm();
    onChange();
  };
  const arm = () => {
    query = window.matchMedia(`(resolution: ${window.devicePixelRatio}dppx)`);
    query.addEventListener("change", onFire, { once: true });
  };
  arm();
  return () => query?.removeEventListener("change", onFire);
}

export function watchEnvironment(canvas: HTMLCanvasElement, signals: Signals): () => void {
  const onLost = (event: Event) => {
    event.preventDefault(); // tells the browser we want a restore
    signals.onLost();
  };
  const onWake = () => {
    if (!document.hidden) signals.onWake();
  };
  const size = new ResizeObserver(() => signals.onResize());
  const view = new IntersectionObserver((entries) => {
    signals.onVisible(entries.some((entry) => entry.isIntersecting));
  });

  canvas.addEventListener("webglcontextlost", onLost);
  canvas.addEventListener("webglcontextrestored", signals.onRestored);
  document.addEventListener("visibilitychange", onWake);
  size.observe(canvas);
  view.observe(canvas);
  const stopRatio = watchPixelRatio(signals.onResize);

  return () => {
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", signals.onRestored);
    document.removeEventListener("visibilitychange", onWake);
    size.disconnect();
    view.disconnect();
    stopRatio();
  };
}
