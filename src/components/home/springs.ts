// Shared spring feel for hover/tap micro-interactions on pastel pills and
// buttons (Dock, Contact's lean panel, FaqAccordion). One constant so every
// pill bounces the same amount instead of drifting apart file by file.
export const SPRING = { type: "spring", stiffness: 420, damping: 28 } as const;
export const HOVER_SCALE = { scale: 1.045 } as const;
export const TAP_SCALE = { scale: 0.965 } as const;
