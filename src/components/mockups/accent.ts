/* Was collapsed to one accent site-wide (mint/violet/amber all the same
   hex) to match the near-black theme's single-accent restraint. Recoloured
   to the same pastel family as health.tsx/education.tsx's own palettes, so
   this outer chrome tint (BrowserWindow's label pill) reads as part of the
   same system instead of the old orange island. Keys kept so existing
   `accent: "violet"` call sites don't need touching. */
export const ACCENT = {
  mint: "#9cf0cb",
  violet: "#c9baf5",
  amber: "#ffe375",
} as const;

export type AccentKey = keyof typeof ACCENT;
