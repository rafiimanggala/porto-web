"use client";

// Small button that opens the command palette (also bound to cmd/ctrl-K).
export default function CmdkHint() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-cmdk"))}
      aria-label="Open command menu"
      className="mono hidden cursor-pointer items-center gap-1.5 rounded-full border border-line px-2.5 py-1.5 text-[11px] text-mute transition-colors duration-200 hover:border-line-strong hover:text-fg sm:inline-flex"
    >
      <span>⌘</span>
      <span>K</span>
    </button>
  );
}
