"use client";

import type { RefObject } from "react";
import type { Field, FieldRefs } from "./useReadout";

const FIELDS: readonly { key: Field; label: string; initial: string }[] = [
  { key: "x", label: "x", initial: "0.0" },
  { key: "velocity", label: "velocity", initial: "0" },
  { key: "progress", label: "progress", initial: "0.000" },
  { key: "snapped", label: "snapped", initial: "0" },
  { key: "direction", label: "direction", initial: "idle" },
];

// The values are written by useReadout via textContent. React renders each
// initial string once and never touches it again, so the two never fight.
export default function Readout({ fieldRefs }: { fieldRefs: RefObject<FieldRefs> }) {
  return (
    <div
      role="group"
      aria-label="Live readout"
      data-testid="drag-readout"
      className="mono flex-1 rounded-2xl border border-line bg-surface-1 p-5"
    >
      <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-5">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <dt className="eyebrow">{f.label}</dt>
            <dd
              ref={(el) => {
                fieldRefs.current[f.key] = el;
              }}
              data-field={f.key}
              className="nums mt-1.5 min-w-[7ch] text-sm text-fg"
            >
              {f.initial}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
