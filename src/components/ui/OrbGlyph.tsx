/* A terminal-prompt badge, not a face: same `>` + cursor language as the
   roaming mascot's speech bubble (Mascot.tsx) and every other "live" chrome
   on the site (CommandCenter, AgentThreads, ChatDemo), sized to sit inline
   inside a heading. Deliberately not a literal Anthropic/Claude logo mark
   (that's a trademarked asset this site has no license to reproduce) --
   this is an original glyph that reads as "Claude Code" through the same
   CLI-prompt motif already used everywhere else. Decorative only: the
   heading's accessible name still comes from its text nodes. */
export default function OrbGlyph({ size = "0.52em" }: { size?: string }) {
  return (
    <span
      aria-hidden
      className="mx-[0.12em] inline-flex shrink-0 items-center justify-center gap-[0.06em] rounded-[0.18em] border border-line-strong bg-surface-3 align-middle"
      style={{ width: size, height: size }}
    >
      <span className="mono font-semibold text-accent" style={{ fontSize: "0.46em", lineHeight: 1 }}>
        &gt;
      </span>
      <span className="bg-accent" style={{ width: "0.08em", height: "0.4em" }} />
    </span>
  );
}
