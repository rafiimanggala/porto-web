import type { CSSProperties } from "react";
import { serviceColor } from "./orbitConfig";

// Hands a service's pastel to CSS as --node, so a label chip, the evidence
// card and an accordion row all pick up the same colour as the scene's node.
export const nodeStyle = (index: number): CSSProperties =>
  ({ "--node": serviceColor(index).css }) as CSSProperties;
