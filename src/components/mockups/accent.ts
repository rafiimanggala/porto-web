/* Matches health.tsx/education.tsx's bright light-mode jewel-tone palette,
   so this outer chrome tint (BrowserWindow's label pill) reads as part of
   the same system as the screen content it wraps. Keys kept so existing
   `accent: "violet"` call sites don't need touching. */
export const ACCENT = {
  mint: "#2f9e6e",
  violet: "#8a5fd9",
  amber: "#d98f2f",
} as const;

export type AccentKey = keyof typeof ACCENT;
