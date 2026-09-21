import type { BriefOption } from "@/data/briefOptions";

// The brief is plain text so it survives any mail client and any paste target.
// The same body feeds both "Send brief" (mailto) and "Copy brief".
export function buildBriefBody(
  skillTitle: string,
  chosen: readonly BriefOption[],
  eol = "\n",
): string {
  const lines = [
    "Hi Rafii,",
    "",
    `I am looking at "${skillTitle}" and would like to talk about:`,
    "",
    ...chosen.map((o) => `- ${o.title}`),
    "",
    "The problem I am trying to solve (replace this line with a few sentences in your own words):",
    "",
    "",
  ];
  return lines.join(eol);
}

// mailto bodies use CRLF line breaks (RFC 6068).
export function buildMailto(
  email: string,
  skillTitle: string,
  chosen: readonly BriefOption[],
): string {
  const body = buildBriefBody(skillTitle, chosen, "\r\n");
  return `mailto:${email}?subject=${encodeURIComponent(skillTitle)}&body=${encodeURIComponent(body)}`;
}
