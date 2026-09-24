import type { QType } from "./EduQuizSceneData";

/* Inline duotone glyphs in the house style: cream stroke, tinted fill, chunky,
   readable at 24px. */

const STROKE = "var(--color-fg)";

type IconProps = { className?: string };

export function QuizSheetIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      <path
        d="M6.5 3h7.6l4.9 4.9V19.5a1.5 1.5 0 0 1-1.5 1.5H6.5A1.5 1.5 0 0 1 5 19.5v-15A1.5 1.5 0 0 1 6.5 3Z"
        fill="var(--color-sky)"
        fillOpacity={0.4}
        stroke={STROKE}
        strokeWidth="1.8"
      />
      <path d="M14 3.2v4.9h4.9" stroke={STROKE} strokeWidth="1.8" />
      <path d="M8.5 12.2h7M8.5 15.8h4.2" stroke={STROKE} strokeWidth="1.8" />
    </svg>
  );
}

export function KeyIcon({ className = "h-6 w-6" }: IconProps) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      <circle cx="7.5" cy="12" r="4.8" fill="var(--color-sun)" fillOpacity={0.5} stroke={STROKE} strokeWidth="1.8" />
      <circle cx="7.5" cy="12" r="1.5" fill={STROKE} />
      <path d="M12.3 12H21.2M17.6 12v3.4M21.2 12v2.4" stroke={STROKE} strokeWidth="1.8" />
    </svg>
  );
}

/* Tiny answer-control glyph: radio, checkbox or text field. */
export function TypeGlyph({ type, className = "h-[14px] w-[14px]" }: { type: QType; className?: string }) {
  const common = { stroke: STROKE, strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round", fill: "none" } as const;
  return (
    <svg aria-hidden viewBox="0 0 16 16" className={`shrink-0 ${className}`}>
      {type === "single" ? (
        <>
          <circle cx="8" cy="8" r="6" {...common} />
          <circle cx="8" cy="8" r="2.4" fill="var(--color-accent)" />
        </>
      ) : null}
      {type === "multi" ? (
        <>
          <rect x="2" y="2" width="12" height="12" rx="3" {...common} fill="var(--color-accent)" fillOpacity={0.55} />
          <path d="M5.2 8.2l2 2 3.6-4" {...common} />
        </>
      ) : null}
      {type === "short" ? (
        <>
          <rect x="1.5" y="4" width="13" height="8" rx="2.4" {...common} />
          <path d="M5 6.6v2.8" {...common} stroke="var(--color-accent)" />
        </>
      ) : null}
    </svg>
  );
}
