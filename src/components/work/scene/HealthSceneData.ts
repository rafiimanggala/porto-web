/* Health case study scene content: four raw sources, the structured rows they parse into,
   and the six scoring domains. All values are invented (NDA illustrative). */

import type { SceneIconName } from "./SceneIcon";

export type PlateKey = "blood" | "dexa" | "dna" | "wearable";

export type Row = {
  raw: string;
  label: string;
  value: string;
  flag?: "high" | "low";
};

export type Panel = {
  key: PlateKey;
  tag: string;
  /** Leading words of the vendor line, hidden on narrow stages where the file icon carries them. */
  vendorLead?: string;
  vendor: string;
  icon: SceneIconName;
  file?: SceneIconName;
  color: string;
  quad: readonly [1 | -1, 1 | -1];
  mis: { dx: number; dy: number; rot: number; kx: number; ky: number };
  rows: readonly Row[];
};

/* Optical-weight trim: the DNA helix is thin strokes with no filled mass, so at the same box
   size it reads lighter than the filled icons. A plain scale evens it out (no filter, no recolour). */
const ICON_TRIM: Partial<Record<SceneIconName, string>> = { dna: "scale-[1.2]" };
export const iconTrim = (name: SceneIconName) => ICON_TRIM[name] ?? "";

export const PANELS: readonly Panel[] = [
  {
    key: "blood",
    tag: "Blood",
    vendorLead: "lab pdf",
    vendor: "p.3",
    icon: "lab-blood",
    file: "pdf-report",
    color: "var(--color-rose)",
    quad: [-1, -1],
    mis: { dx: -14, dy: -9, rot: -1.6, kx: -9, ky: -6 },
    rows: [
      { raw: "LDL-CHOL 3.4 mmol/L H", label: "LDL-C", value: "3.4 mmol/L", flag: "high" },
      { raw: "HDL 1.3  (>1.0)", label: "HDL-C", value: "1.3 mmol/L" },
      { raw: "hsCRP 2.1 mg/L 0-3.0", label: "hsCRP", value: "2.1 mg/L" },
      { raw: "HbA1c 5.4% 4.0-5.6", label: "HbA1c", value: "5.4 %" },
      { raw: "25-OH VitD 62 L", label: "Vitamin D", value: "62 nmol/L", flag: "low" },
    ],
  },
  {
    key: "dexa",
    tag: "DEXA",
    vendor: "vendor 7",
    icon: "body-scan",
    color: "var(--color-sun)",
    quad: [1, -1],
    mis: { dx: 12, dy: -11, rot: 1.4, kx: 8, ky: -7 },
    rows: [
      { raw: "TOT BODY %FAT... 23.4", label: "Body fat", value: "23.4 %" },
      { raw: "A/G RATIO....... 1.08", label: "A/G ratio", value: "1.08" },
      { raw: "VAT MASS(g)....... 412", label: "Visceral fat", value: "412 g" },
      { raw: "TRUNK/TOTAL FAT 0.94", label: "Trunk ratio", value: "0.94" },
      { raw: "ALMI kg/m2....... 8.1", label: "ALMI", value: "8.1 kg/m2" },
    ],
  },
  {
    key: "dna",
    tag: "DNA",
    vendor: "vcf",
    icon: "dna",
    color: "var(--color-sky)",
    quad: [-1, 1],
    mis: { dx: -11, dy: 12, rot: 1.2, kx: -8, ky: 7 },
    rows: [
      { raw: "rs429358 T/C APOE", label: "APOE", value: "e4 carrier", flag: "high" },
      { raw: "rs1801133 C/T MTHFR", label: "MTHFR", value: "C677T het" },
      { raw: "rs4988235 G/G MCM6", label: "Lactase", value: "non-persist." },
      { raw: "rs662799 A/G APOA5", label: "APOA5", value: "A/G" },
      { raw: "rs7903146 C/T TCF7L2", label: "TCF7L2", value: "C/T", flag: "high" },
    ],
  },
  {
    key: "wearable",
    tag: "Wearable",
    vendor: "30-day",
    icon: "device-watch",
    color: "var(--color-mint)",
    quad: [1, 1],
    mis: { dx: 14, dy: 9, rot: -1.3, kx: 9, ky: 6 },
    rows: [
      { raw: "hrv_rmssd=58.2 rhr=52", label: "HRV", value: "58 ms" },
      { raw: "sleep_eff:.91 deep:88m", label: "Sleep eff.", value: "91 %" },
      { raw: "spo2_avg=97 n=30d", label: "SpO2", value: "97 %" },
      { raw: "vo2max_est 46.1", label: "VO2 max", value: "46.1" },
      { raw: "rhr_7d=[53,52,52,51]", label: "Resting HR", value: "52 bpm" },
    ],
  },
];

export const DOMAINS = [
  { k: "Cardio", v: 74 },
  { k: "Metabolic", v: 93 },
  { k: "Vitals", v: 79 },
  { k: "Inflam.", v: 81 },
  { k: "Organ", v: 88 },
  { k: "Body comp", v: 77 },
] as const;

export const SCORE = 82;

export const CAPTIONS = [
  {
    eyebrow: "01 / Raw",
    title: "Four sources, zero shared language.",
    body: "Lab PDFs, DEXA layouts, DNA variants and wearable streams, each in its own units. Hold the button to line them up, or keep scrolling.",
  },
  {
    eyebrow: "02 / Parsed",
    title: "Lab PDFs into structured, comparable data.",
    body: "A scan line reads every source into markers, units and flags. DEXA reports are cropped by reading the PDF itself, not a scanner template.",
  },
  {
    eyebrow: "03 / Registered",
    title: "Reconciling four sources into one number.",
    body: "Six domains, unit conversions, one longevity score and a biological age. Partial data still scores, and says how much is missing.",
  },
  {
    eyebrow: "04 / Shipped",
    title: "Live, in production.",
    body: "The scoring engine, the DEXA pipeline and the AI insights layer run against real client data.",
  },
] as const;
