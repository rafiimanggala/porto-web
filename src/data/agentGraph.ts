export type NodeDef = { id: string; label: string; x: number; y: number; r?: number; accent?: boolean };
export type EdgeDef = { from: string; to: string; dashed?: boolean };

export const NODES: NodeDef[] = [
  { id: "lead", label: "Lead Agent", x: 50, y: 20, r: 13, accent: true },
  { id: "teams", label: "Agent Teams", x: 20, y: 50, r: 11 },
  { id: "mahoraga", label: "Mahoraga", x: 50, y: 74, r: 11 },
  { id: "email", label: "Email Reactor", x: 80, y: 50, r: 11 },
  { id: "memory", label: "Memory", x: 22, y: 82, r: 9 },
  { id: "council", label: "Council", x: 78, y: 82, r: 9 },
];

export const EDGES: EdgeDef[] = [
  { from: "lead", to: "teams" },
  { from: "lead", to: "email" },
  { from: "lead", to: "mahoraga" },
  { from: "teams", to: "memory" },
  { from: "mahoraga", to: "memory" },
  { from: "mahoraga", to: "council" },
  { from: "email", to: "council" },
  { from: "teams", to: "council", dashed: true },
];
