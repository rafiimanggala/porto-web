/* Deep content tree scene: copy, invented curriculum data and the timeline.
   Everything is illustrative (NDA), consistent with the shared education data set. */

export const CAPTIONS = [
  {
    eyebrow: "01 / Drill down",
    title: "Unit, area, topic, sub-topic.",
    body: "Content is four levels deep and opens one level at a time.",
  },
  {
    eyebrow: "02 / Scale",
    title: "Hundreds of nodes, still instant.",
    body: "Only the open branch is drawn, so a big subject stays fast and readable.",
  },
  {
    eyebrow: "03 / Assign",
    title: "A quiz at any node.",
    body: "Attach a Level 1 or Level 2 quiz to a whole unit or a single sub-topic.",
  },
  {
    eyebrow: "04 / Offline",
    title: "Downloaded for bad wifi.",
    body: "Licensed variants cache to the device, so a lesson survives a dropped school connection.",
  },
] as const;

export const CHAPTERS = [0, 0.24, 0.5, 0.76, 1] as const;

export type Level = 0 | 1 | 2 | 3;
export const LEVELS = [
  { name: "Unit", color: "var(--color-sun)" },
  { name: "Area", color: "var(--color-sky)" },
  { name: "Topic", color: "var(--color-mint)" },
  { name: "Sub-topic", color: "var(--color-rose)" },
] as const;

export type NodeRow = { depth: Level; label: string; leaf: boolean; open: boolean; kids: number };

const node = (depth: Level, label: string, kids = 0, open = false): NodeRow => ({
  depth,
  label,
  leaf: kids === 0 && !open,
  open,
  kids,
});

/* The open branch of Biology, Units 3 and 4: twelve rows, the first three levels expanded. The counts on
   collapsed rows are hidden descendants and add up: 3 areas + 62 + 70 + 68 under Unit 3 is 203 rows,
   Unit 4 holds 207, so the two units plus their descendants make TOTAL. */
export const HEAD: readonly NodeRow[] = [
  node(0, "Unit 3: Cells and inheritance", 203, true),
  node(1, "Area 1: Heredity", 62, true),
  node(2, "Inheritance", 4, true),
  node(3, "Punnett squares"),
  node(3, "Pedigree charts"),
  node(3, "Test crosses"),
  node(3, "Sex-linked traits"),
  node(2, "DNA replication", 24),
  node(2, "Gene expression", 31),
  node(1, "Area 2: Cell energy", 70),
  node(1, "Area 3: Cell signals", 68),
  node(0, "Unit 4: Life over time", 207),
];

export const WINDOW = HEAD.length;
export const TOTAL = 412;
export const SWEEP = 200;
/* Gap between the tree window and the panel edge, in px, once the minimap has left. */
export const FRAME_PAD = 8;
/* Unit 4 is the last row of the open branch; it expands when the list is scrolled. */
export const UNIT4_AT = WINDOW - 1;

/* Unit 4 written out: area, then its topics as "topic|sub|sub|...". Five sub-topics each, so the
   207 rows below the unit row are 3 areas, 34 topics and 170 sub-topics. */
const UNIT4: readonly (readonly [string, readonly string[]])[] = [
  [
    "Area 4: Evolution",
    [
      "Natural selection|Heritable variation|Selection pressure|Relative fitness|Directional selection|Stabilising selection",
      "Mutation and variation|Point mutations|Frameshift changes|Gene duplication|Chromosome changes|Mutation rates",
      "Gene flow and drift|Migration|Founder effect|Bottleneck events|Allele frequencies|Hardy-Weinberg model",
      "Speciation|Allopatric speciation|Sympatric speciation|Reproductive barriers|Hybrid zones|Adaptive radiation",
      "Fossil evidence|Relative dating|Radiometric dating|Transitional fossils|Index fossils|Mass extinctions",
      "Comparative anatomy|Homologous structures|Analogous structures|Vestigial organs|Embryo development|Convergent evolution",
      "Molecular evidence|DNA comparison|Protein similarity|Molecular clocks|Mitochondrial DNA|Genome comparison",
      "Phylogenetics|Cladograms|Shared derived traits|Outgroups|Parsimony|Common ancestors",
      "Human evolution|Hominin fossils|Bipedalism|Brain size|Tool use|Migration out of Africa",
      "Co-evolution|Predator and prey|Pollinators|Host and parasite|Mimicry|Arms races",
      "Artificial selection|Selective breeding|Crop domestication|Livestock traits|Inbreeding depression|Genetic diversity",
    ],
  ],
  [
    "Area 5: Ecosystems",
    [
      "Population growth|Exponential growth|Logistic growth|Carrying capacity|Birth and death rates|Survivorship curves",
      "Limiting factors|Density dependent|Density independent|Competition|Resource supply|Abiotic limits",
      "Sampling methods|Quadrats|Transects|Mark and recapture|Random sampling|Population estimates",
      "Food webs|Producers|Consumers|Decomposers|Trophic levels|Energy pyramids",
      "Energy flow|Primary productivity|Energy transfer|Biomass pyramids|Detritus pathways|Ecological efficiency",
      "Carbon cycle|Photosynthesis|Respiration|Carbon sinks|Fossil fuels|Ocean uptake",
      "Nitrogen cycle|Nitrogen fixation|Nitrification|Denitrification|Ammonification|Fertiliser runoff",
      "Succession|Pioneer species|Primary succession|Secondary succession|Climax communities|Disturbance",
      "Biodiversity|Species richness|Genetic variety|Ecosystem variety|Keystone species|Diversity indices",
      "Invasive species|Introduction pathways|Competitive advantage|Native impacts|Biological control|Monitoring",
      "Climate change|Greenhouse effect|Warming oceans|Shifting ranges|Coral bleaching|Adapt or migrate",
    ],
  ],
  [
    "Area 6: Health and disease",
    [
      "Pathogens|Bacteria|Viruses|Fungi|Protozoans|Parasites",
      "Disease transmission|Direct contact|Airborne spread|Vectors|Contaminated water|Zoonoses",
      "Innate immunity|Skin and mucus|Phagocytes|Inflammation|Fever response|Complement proteins",
      "Adaptive immunity|Antigen presentation|T cell response|B cell response|Memory cells|Antibodies",
      "Vaccination|Live attenuated|Inactivated vaccines|Booster doses|Herd immunity|Vaccine schedules",
      "Antibiotics|Bacterial targets|Resistance genes|Selection for resistance|Course completion|Stewardship",
      "Immune disorders|Allergies|Autoimmunity|Immunodeficiency|Anaphylaxis|Transplant rejection",
      "Epidemiology|Incidence and prevalence|Outbreak tracing|Reproduction number|Contact tracing|Surveillance data",
      "Gene technology|PCR|Gel electrophoresis|CRISPR editing|Recombinant DNA|Gene therapy",
      "Diagnostics|Antibody tests|Blood smears|Culturing|Imaging|Screening programs",
      "Nutrition and health|Macronutrients|Micronutrients|Energy balance|Gut microbiome|Dietary guidelines",
      "Public health|Sanitation|Quarantine|Health campaigns|Vector control|Global health",
    ],
  ],
];

const unit4Rows = (): NodeRow[] =>
  UNIT4.flatMap(([area, topics]) => [
    node(1, area, 0, true),
    ...topics.flatMap((t) => {
      const [name, ...subs] = t.split("|");
      return [node(2, name, 0, true), ...subs.map((s) => node(3, s))];
    }),
  ]);

/* The rows after the open branch: what Unit 4 shows once it is expanded. */
const REST: readonly NodeRow[] = unit4Rows();

/* Any position of the subject list, computed on demand: a virtual list never draws 412 rows. */
export function nodeAt(i: number): NodeRow | null {
  if (i < 0) return null;
  return i < HEAD.length ? HEAD[i] : (REST[i - HEAD.length] ?? null);
}

/* Chapter 1: three clicks open three levels. Row numbers are positions in HEAD. */
export const DRILL = [
  { arrive: [0.004, 0.02], click: [0.02, 0.038], open: [0.03, 0.058] },
  { arrive: [0.06, 0.088], click: [0.09, 0.108], open: [0.098, 0.126] },
  { arrive: [0.13, 0.158], click: [0.16, 0.178], open: [0.168, 0.196] },
] as const;

export const REVEAL: Readonly<Record<number, readonly [number, number]>> = {
  1: [0.03, 0.056],
  9: [0.034, 0.06],
  10: [0.038, 0.064],
  2: [0.102, 0.128],
  7: [0.106, 0.132],
  8: [0.11, 0.136],
  3: [0.172, 0.196],
  4: [0.177, 0.2],
  5: [0.182, 0.204],
  6: [0.187, 0.208],
};

export const CRUMBS = [
  { label: "Unit 3", at: 0.036 },
  { label: "Heredity", at: 0.108 },
  { label: "Inheritance", at: 0.176 },
  { label: "Punnett squares", at: 0.212 },
] as const;
export const LEVEL_AT = [0, 0.036, 0.108, 0.176] as const;

export const TL = {
  select: [0.205, 0.228],
  roll: [0.234, 0.254, 0.494, 0.514, 0.754, 0.774],
  treeOnly: 0.245,
  frame: [0.246, 0.275],
  race: [0.25, 0.31],
  ghost: { start: 0.25, step: 0.005, len: 0.03 },
  mini: [0.252, 0.3],
  down: [0.315, 0.395],
  pulse: [0.397, 0.414],
  up: [0.415, 0.485],
  tray: [0.506, 0.532],
  cover: [0.716, 0.755],
  furniture: [0.486, 0.522],
  wipe: [0.768, 0.812],
  ring: [0.812, 0.88],
  device: [0.88, 0.906],
  drop: [0.912, 0.948],
  swap: [0.929, 0.937],
  open: [0.952, 0.986],
} as const;

export const QUIZ = [
  { rel: 3, level: 1, scope: "sub-topic", fly: [0.534, 0.574], stamp: [0.574, 0.6] },
  { rel: 2, level: 2, scope: "topic", fly: [0.606, 0.64], stamp: [0.64, 0.666] },
  { rel: 0, level: 1, scope: "whole unit", fly: [0.674, 0.71], stamp: [0.71, 0.736] },
] as const;
/* Rows under Unit 3 (HEAD 1 to 10) covered by its quiz. */
export const COVER_ROWS = 11;

export const VARIANTS = ["IB", "AP", "Senior", "Stage 1", "Stage 2", "Units 1 and 2", "Units 3 and 4"] as const;

export const LESSONS = [
  { title: "Alleles and genotypes", min: 8 },
  { title: "Monohybrid crosses", min: 12 },
  { title: "Reading a Punnett square", min: 9 },
] as const;
export const OPEN_LESSON = 1;
