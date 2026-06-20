export type StageId = "task" | "fix" | "deploy" | "test" | "proof";
export type Line = { text: string; tone?: "add" | "del" | "ok" | "dim" | "cmd" };
export type Stage = { id: StageId; label: string; lines: Line[] };

export const automationStages: Stage[] = [
  {
    id: "task",
    label: "TASK",
    lines: [
      { text: "client.email -> reactor: \"vitals chart returns 403\"", tone: "dim" },
      { text: "agent: warming up repo · branch fix/vitals-403", tone: "cmd" },
    ],
  },
  {
    id: "fix",
    label: "FIX",
    lines: [
      { text: "- if (!token) return res.status(403)", tone: "del" },
      { text: "+ const token = await refreshIfExpired(session)", tone: "add" },
      { text: "+ if (!token) return res.status(401).json({ reason })", tone: "add" },
    ],
  },
  {
    id: "deploy",
    label: "DEPLOY",
    lines: [
      { text: "$ build --target render", tone: "cmd" },
      { text: "bundle 2.1mb · uploaded · live in 47s", tone: "ok" },
    ],
  },
  {
    id: "test",
    label: "TEST",
    lines: [
      { text: "$ playwright test vitals.spec.ts", tone: "cmd" },
      { text: "chart loads · 200 · series rendered", tone: "ok" },
      { text: "12/12 passed", tone: "ok" },
    ],
  },
  {
    id: "proof",
    label: "PROOF",
    lines: [
      { text: "screenshot captured -> vitals-pass.png", tone: "ok" },
    ],
  },
];

export const automationSummary = {
  duration: "3m 12s",
  steps: "5 stages · 0 human keystrokes",
  result: "fixed · verified · proof attached",
};
