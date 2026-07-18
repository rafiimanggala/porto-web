import type { ReactNode } from "react";

const A = "var(--color-accent)";
const L = "var(--color-line-strong)";

function Mini({ children }: { children: ReactNode }) {
  return (
    <div className="relative mb-4 h-16 w-full overflow-hidden rounded-lg border border-line bg-surface-2">
      <div className="grid h-full place-items-center">{children}</div>
    </div>
  );
}

// 1 · Mahoraga:self-improvement loop + lock
function Mahoraga() {
  return (
    <Mini>
      <svg viewBox="0 0 120 44" className="h-10">
        <path d="M84 22a24 11 0 1 1-7-7.8" fill="none" stroke={A} strokeWidth="1.6" strokeLinecap="round" />
        <path d="M77 8 l1 7 -7 0" fill="none" stroke={A} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="52" y="18" width="16" height="11" rx="2" fill="none" stroke={A} strokeWidth="1.4" />
        <path d="M55 18v-3a5 5 0 0 1 10 0v3" fill="none" stroke={A} strokeWidth="1.4" />
        <circle cx="60" cy="24" r="1.4" fill={A} />
      </svg>
    </Mini>
  );
}

// 2 · Graphify:node-edge graph
function Graphify() {
  const nodes = [
    [20, 14], [54, 8], [40, 32], [78, 26], [98, 12],
  ];
  const edges = [
    [0, 1], [0, 2], [1, 2], [1, 3], [3, 4], [2, 3],
  ];
  return (
    <Mini>
      <svg viewBox="0 0 118 44" className="h-11">
        {edges.map(([a, b], i) => (
          <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={L} strokeWidth="1" />
        ))}
        {nodes.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 1 ? 4 : 3} fill={i === 1 ? A : "var(--color-surface-3)"} stroke={A} strokeWidth="1.2" />
        ))}
      </svg>
    </Mini>
  );
}

// 3 · Seismic Sense:seismograph bars
function Seismic() {
  const h = [10, 22, 14, 30, 18, 38, 24, 12, 28, 16, 34, 20];
  return (
    <Mini>
      <svg viewBox="0 0 120 44" className="h-10">
        <line x1="4" y1="22" x2="116" y2="22" stroke={L} strokeWidth="0.8" />
        {h.map((v, i) => (
          <line key={i} x1={8 + i * 9.3} y1={22 - v / 2} x2={8 + i * 9.3} y2={22 + v / 2} stroke={A} strokeWidth="1.6" strokeLinecap="round" opacity={0.5 + (v / 76)} />
        ))}
      </svg>
    </Mini>
  );
}

// 4 · Writing DNA:double helix
function WritingDNA() {
  return (
    <Mini>
      <svg viewBox="0 0 120 44" className="h-10">
        <path d="M16 8 C44 8 44 36 72 36 S100 8 116 8" fill="none" stroke={A} strokeWidth="1.4" opacity="0.8" />
        <path d="M16 36 C44 36 44 8 72 8 S100 36 116 36" fill="none" stroke={A} strokeWidth="1.4" opacity="0.5" />
        {[24, 44, 64, 84, 104].map((x, i) => (
          <line key={i} x1={x} y1={i % 2 ? 14 : 30} x2={x} y2={i % 2 ? 30 : 14} stroke={L} strokeWidth="1" />
        ))}
      </svg>
    </Mini>
  );
}

// 5 · CUA Driver:isolated cursor over window
function CUADriver() {
  return (
    <Mini>
      <svg viewBox="0 0 120 44" className="h-11">
        <rect x="22" y="8" width="60" height="30" rx="3" fill="none" stroke={L} strokeWidth="1.2" />
        <line x1="22" y1="15" x2="82" y2="15" stroke={L} strokeWidth="1" />
        {/* real cursor (dim) */}
        <path d="M40 20 l0 12 3 -3 3 6 2 -1 -3 -6 4 0 z" fill="var(--color-mute)" />
        {/* isolated agent cursor (accent + ring) */}
        <circle cx="78" cy="30" r="8" fill="none" stroke={A} strokeWidth="1" strokeDasharray="2 2" />
        <path d="M74 24 l0 12 3 -3 3 6 2 -1 -3 -6 4 0 z" fill={A} />
      </svg>
    </Mini>
  );
}

// 6 · wa:stealth tier ladder
function WA() {
  const tiers = [10, 18, 26, 34];
  return (
    <Mini>
      <svg viewBox="0 0 120 44" className="h-10">
        {tiers.map((h, i) => (
          <rect key={i} x={20 + i * 20} y={38 - h} width="14" height={h} rx="1.5" fill={i === tiers.length - 1 ? A : "var(--color-surface-3)"} stroke={A} strokeWidth="1" />
        ))}
        <text x="103" y="14" fill={A} fontSize="9" fontFamily="monospace">↺</text>
      </svg>
    </Mini>
  );
}

// 7 · Smart Context Injector:keyword → file
function Injector() {
  return (
    <Mini>
      <svg viewBox="0 0 120 44" className="h-10">
        <rect x="14" y="15" width="30" height="14" rx="7" fill="none" stroke={A} strokeWidth="1.2" />
        <text x="20" y="25" fill={A} fontSize="8" fontFamily="monospace">key</text>
        <path d="M48 22 h20 m-5 -4 5 4 -5 4" fill="none" stroke={A} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="78" y="10" width="24" height="26" rx="2" fill="none" stroke={L} strokeWidth="1.2" />
        {[16, 21, 26, 31].map((y, i) => (
          <line key={i} x1="82" y1={y} x2={i === 0 ? 96 : 98} y2={y} stroke={i === 0 ? A : L} strokeWidth="1.2" />
        ))}
      </svg>
    </Mini>
  );
}

// 8 · Email Reactor:inbox → branch → reply
function EmailReactor() {
  return (
    <Mini>
      <svg viewBox="0 0 120 44" className="h-10">
        {/* envelope */}
        <rect x="10" y="14" width="26" height="18" rx="2" fill="none" stroke={A} strokeWidth="1.2" />
        <path d="M10 16 l13 9 13 -9" fill="none" stroke={A} strokeWidth="1.2" />
        <path d="M40 23 h12" stroke={L} strokeWidth="1.2" />
        {/* branch */}
        <circle cx="60" cy="23" r="3" fill="none" stroke={A} strokeWidth="1.2" />
        <circle cx="74" cy="13" r="3" fill="none" stroke={A} strokeWidth="1.2" />
        <circle cx="74" cy="33" r="3" fill="none" stroke={A} strokeWidth="1.2" />
        <path d="M63 23 q8 0 8 -8 M63 23 q8 0 8 8" fill="none" stroke={L} strokeWidth="1.2" />
        <path d="M80 23 h10 m-5 -4 5 4 -5 4" fill="none" stroke={A} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M96 18 l8 5 -8 5 2 -5 z" fill={A} />
      </svg>
    </Mini>
  );
}

const MAP: Record<string, () => ReactNode> = {
  Mahoraga,
  Graphify,
  "Seismic Sense": Seismic,
  "Writing DNA": WritingDNA,
  "CUA Driver": CUADriver,
  wa: WA,
  "Smart Context Injector": Injector,
  "Email Reactor": EmailReactor,
};

export default function ToolVisual({ name }: { name: string }) {
  const Comp = MAP[name];
  if (!Comp) return null;
  return <Comp />;
}
