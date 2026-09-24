import type { ReactNode } from "react";
import type { GlyphKey } from "./EduPhoneSceneData";

/* Inline duotone glyphs in the house style: cream stroke, tinted fill, chunky,
   readable at 24 px. They fill whatever box they sit in. */

const STROKE = "var(--color-fg)";

function Svg({ children, className = "h-full w-full" }: { children: ReactNode; className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      {children}
    </svg>
  );
}

const line = { stroke: STROKE, strokeWidth: 1.8 } as const;
const tint = (c: string, o: number) => ({ fill: c, fillOpacity: o });

function Leaf() {
  return (
    <Svg>
      <path d="M5.4 18.6C4.4 10.4 9.6 5 19.2 4.6c.4 9.6-4.6 15.2-13.8 14z" {...tint("var(--color-mint)", 0.5)} {...line} />
      <path d="M5.4 18.6 14.2 10M5.4 18.6 3.6 20.6" {...line} />
    </Svg>
  );
}

function Flask() {
  return (
    <Svg>
      <path d="M7.1 14H16.9l2.4 4.2a1.6 1.6 0 0 1-1.4 2.4H6.1a1.6 1.6 0 0 1-1.4-2.4z" {...tint("var(--color-sky)", 0.75)} />
      <path d="M10 3.5V9L4.7 18.2A1.6 1.6 0 0 0 6.1 20.6H17.9A1.6 1.6 0 0 0 19.3 18.2L14 9V3.5M8.6 3.5h6.8" {...line} />
      <circle cx="10.6" cy="17.4" r="1" fill={STROKE} />
    </Svg>
  );
}

function Atom() {
  return (
    <Svg>
      {[0, 60, 120].map((deg) => (
        <ellipse key={deg} cx="12" cy="12" rx="9.4" ry="3.8" transform={`rotate(${deg} 12 12)`} {...line} strokeWidth={1.6} />
      ))}
      <circle cx="12" cy="12" r="2.4" {...tint("var(--color-sun)", 1)} {...line} />
    </Svg>
  );
}

function Lens() {
  return (
    <Svg>
      <circle cx="10" cy="10" r="6.2" {...tint("var(--color-rose)", 0.5)} {...line} />
      <path d="M14.6 14.6 20.4 20.4" stroke={STROKE} strokeWidth="3" />
      <path d="M7.1 9.6a3.2 3.2 0 0 1 2.9-2.9" {...line} strokeWidth={1.5} />
    </Svg>
  );
}

const GLYPHS: Record<GlyphKey, () => ReactNode> = { leaf: Leaf, flask: Flask, atom: Atom, lens: Lens };

export function SubjectGlyph({ name }: { name: GlyphKey }) {
  const Glyph = GLYPHS[name];
  return <Glyph />;
}

export function BookIcon() {
  return (
    <Svg>
      <path d="M12 6.6C9.8 5 6.8 4.6 3.8 5v12.6c3-.4 6 .1 8.2 1.6 2.2-1.5 5.2-2 8.2-1.6V5c-3-.4-6-.1-8.2 1.6z" {...tint("var(--color-sky)", 0.45)} {...line} />
      <path d="M12 6.6v12.6" {...line} />
    </Svg>
  );
}

export function CheckIcon() {
  return (
    <Svg>
      <path d="M5 12.6 9.6 17.2 19 7.4" stroke="currentColor" strokeWidth="2.6" />
    </Svg>
  );
}

const TAB = { stroke: "currentColor", strokeWidth: 1.7 } as const;

export const TAB_GLYPHS: readonly ReactNode[] = [
  <path key="home" d="M4.2 11.3 12 4.2l7.8 7.1V19a1 1 0 0 1-1 1h-4.4v-5.4H9.6V20H5.2a1 1 0 0 1-1-1z" {...TAB} />,
  <g key="subjects" {...TAB}>
    <rect x="4" y="4" width="6.6" height="6.6" rx="1.6" />
    <rect x="13.4" y="4" width="6.6" height="6.6" rx="1.6" />
    <rect x="4" y="13.4" width="6.6" height="6.6" rx="1.6" />
    <rect x="13.4" y="13.4" width="6.6" height="6.6" rx="1.6" />
  </g>,
  <g key="lessons" {...TAB}>
    <path d="M9.4 7h10.6M9.4 12h10.6M9.4 17h10.6" />
    <path d="M4.6 7h.1M4.6 12h.1M4.6 17h.1" strokeWidth={2.6} />
  </g>,
  <g key="quiz" {...TAB}>
    <rect x="4" y="4" width="16" height="16" rx="3.4" />
    <path d="M9.6 9.7a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1 .8-1 1.6M12 16.5v.1" />
  </g>,
];

export function TabGlyph({ index }: { index: number }) {
  return <Svg className="h-full w-full">{TAB_GLYPHS[index]}</Svg>;
}
