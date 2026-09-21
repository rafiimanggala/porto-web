// Browser signals that decide whether a frame should be drawn at all.
// Returns one function that removes every listener and observer.

export type Signals = {
  onResize: () => void;
  onVisible: (visible: boolean) => void; // panel scrolled into or out of view
  onWake: () => void; // tab became visible again
  onLost: () => void;
  onRestored: () => void;
};

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

  return () => {
    canvas.removeEventListener("webglcontextlost", onLost);
    canvas.removeEventListener("webglcontextrestored", signals.onRestored);
    document.removeEventListener("visibilitychange", onWake);
    size.disconnect();
    view.disconnect();
  };
}
