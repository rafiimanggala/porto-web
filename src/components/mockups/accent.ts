/* Collapsed to one accent site-wide (was mint/violet/amber per project) to
   match the single-accent restraint of the x.ai/bot reference — see
   --color-accent in globals.css, same hex. Keys kept so existing
   `accent: "violet"` call sites don't need touching. */
export const ACCENT = {
  mint: "#ff6a12",
  violet: "#ff6a12",
  amber: "#ff6a12",
} as const;

export type AccentKey = keyof typeof ACCENT;
