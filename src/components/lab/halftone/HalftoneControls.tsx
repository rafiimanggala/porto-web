"use client";

import type { HalftoneParams } from "./types";

type NumericKey = "pitch" | "angleDeg" | "separation";
type InkKey = "inkA" | "inkB";

const SLIDERS: readonly {
  id: string;
  key: NumericKey;
  label: string;
  unit: string;
  min: number;
  max: number;
}[] = [
  { id: "halftone-pitch", key: "pitch", label: "Dot pitch", unit: " px", min: 3, max: 24 },
  { id: "halftone-angle", key: "angleDeg", label: "Screen angle", unit: "°", min: 0, max: 90 },
  {
    id: "halftone-separation",
    key: "separation",
    label: "Plate separation",
    unit: " px",
    min: 0,
    max: 60,
  },
];

const INKS: readonly { id: string; key: InkKey; label: string; swatch: string }[] = [
  { id: "halftone-ink-a", key: "inkA", label: "Plate A, orange", swatch: "bg-accent" },
  { id: "halftone-ink-b", key: "inkB", label: "Plate B, off-white", swatch: "bg-fg" },
];

function Slider({
  spec,
  value,
  onChange,
}: {
  spec: (typeof SLIDERS)[number];
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={spec.id} className="mono text-xs text-dim">
          {spec.label}
        </label>
        <output htmlFor={spec.id} className="mono nums text-xs text-fg">
          {value}
          {spec.unit}
        </output>
      </div>
      <input
        id={spec.id}
        type="range"
        min={spec.min}
        max={spec.max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1 h-11 w-full cursor-pointer accent-accent"
      />
    </div>
  );
}

function Ink({
  spec,
  checked,
  onChange,
}: {
  spec: (typeof INKS)[number];
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      htmlFor={spec.id}
      className="mono flex min-h-11 cursor-pointer items-center gap-3 text-xs text-dim"
    >
      <input
        id={spec.id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 cursor-pointer accent-accent"
      />
      <span aria-hidden className={`inline-block h-3 w-3 rounded-full ${spec.swatch}`} />
      {spec.label}
    </label>
  );
}

export default function HalftoneControls({
  params,
  disabled,
  onChange,
}: {
  params: HalftoneParams;
  disabled: boolean;
  onChange: (params: HalftoneParams) => void;
}) {
  const patch = (next: Partial<HalftoneParams>) => onChange({ ...params, ...next });

  return (
    <fieldset
      disabled={disabled}
      className="mt-6 grid gap-x-8 gap-y-2 rounded-2xl border border-line bg-surface-1 p-5 disabled:opacity-50 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <legend className="eyebrow px-2">Controls</legend>
      {SLIDERS.map((s) => (
        <Slider key={s.id} spec={s} value={params[s.key]} onChange={(v) => patch({ [s.key]: v })} />
      ))}
      <div className="flex flex-col justify-center sm:col-span-2 lg:col-span-1">
        {INKS.map((ink) => (
          <Ink
            key={ink.id}
            spec={ink}
            checked={params[ink.key]}
            onChange={(on) => patch({ [ink.key]: on })}
          />
        ))}
      </div>
    </fieldset>
  );
}
