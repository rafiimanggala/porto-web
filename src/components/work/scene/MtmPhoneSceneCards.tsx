"use client";

import { motion, useTransform, type MotionValue } from "framer-motion";
import { MONO, useSeg, type MV } from "./HealthSceneParts";
import { u } from "./MobileSceneKit";
import { MtmGlyph } from "./MtmKitGlyphs";
import { CARD, FLOW_TOP, HEAD, HOVERS, M, PICKED, SHIRTS, T, TEXT, TILE } from "./MtmPhoneSceneData";
import type { CardGeo, Flow } from "./MtmPhoneSceneMath";
import { Flash, Head, NO_BEAT, Tap, clipRight, softWipe, useBeat, useRect, type Type } from "./MtmPhoneSceneKit";
import { GarmentTile } from "./MtmPhoneSceneGarment";

/* Collection grid. Three across on the desk, one column of rows on the phone. On its way a card wipes its wide caption
   away as it takes off, and the row caption sits right of the tile, so the card shows it exactly as far as it has
   widened. The picked row keeps its highlight and gains an in cart mark when the button says added. */

type Props = { p: MV; flow: MotionValue<Flow>; type: Type };

const WIDE_TEXT_TOP = TILE.pad + TILE.wideH + TILE.textGap;
const CHEVRON_W = 14;
const LIFT = 1.6;

const wideMask = (g: CardGeo) => softWipe(g.wideText);

function Chevron({ show }: { show: MV }) {
  return (
    <motion.svg
      aria-hidden
      viewBox="0 0 8 10"
      style={{ opacity: show, width: u(5), height: u(7), right: u(7), top: "50%", marginTop: u(-3.5) }}
      className="absolute"
      fill="none"
      stroke="var(--color-mute)"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 1.5L6 5L2 8.5" />
    </motion.svg>
  );
}

function Pick({ p }: { p: MV }) {
  const opacity = useSeg(p, T.select[0], T.select[1]);
  return <motion.i aria-hidden style={{ opacity, borderWidth: u(1.5), borderRadius: "inherit" }} className="pointer-events-none absolute inset-0 border-accent" />;
}

/* Shown on the picked row once the fit is added: it wipes in from the left over the chevron, which has already left. */
function InCart({ type, added }: { type: Type; added: MV }) {
  const clip = useTransform(added, (t) => clipRight(t));
  const visibility = useTransform(added, (t) => (t > 0.001 ? "visible" : "hidden"));
  return (
    <motion.span
      aria-hidden
      style={{ clipPath: clip, visibility, right: u(6), gap: u(2.5), fontSize: type.label, lineHeight: 1 }}
      className={`${MONO} absolute top-1/2 flex -translate-y-1/2 items-center whitespace-nowrap uppercase tracking-[0.08em] text-mint`}
    >
      <MtmGlyph name="check" size={u(8)} />
      {TEXT.inCart}
    </motion.span>
  );
}

/* Container queries in the caption's own em: a text is shown only once its box holds the whole of it, so a shrinking or
   growing card never shows a fragment. The classes are spelled out so the stylesheet keeps them. */
const NAME_EM = 0.52;
const MONO_EM = 0.6;
const FIT: Readonly<Record<number, string>> = {
  3: "@[3em]:visible",
  3.5: "@[3.5em]:visible",
  4: "@[4em]:visible",
  4.5: "@[4.5em]:visible",
  5: "@[5em]:visible",
  5.5: "@[5.5em]:visible",
  6: "@[6em]:visible",
  6.5: "@[6.5em]:visible",
  7: "@[7em]:visible",
  7.5: "@[7.5em]:visible",
  8: "@[8em]:visible",
};
const fit = (em: number) => FIT[Math.min(8, Math.max(3, Math.ceil((em + 0.15) * 2) / 2))];
const longestWord = (text: string) => Math.max(...text.split(" ").map((w) => w.length));

type CaptionProps = { geo: MotionValue<CardGeo>; type: Type; fabric: string; collar: string };

/* Wide caption: the name may wrap onto two lines under the tile. The collar line has one room for all six cards, so it
   is there for every card or for none. */
const COLLAR_ROOM_EM = 6.6;
function WideCaption({ geo, type, fabric, collar }: CaptionProps) {
  const mask = useTransform(geo, wideMask);
  const shown = useTransform(geo, (g) => (g.wideText > 0.001 ? 1 : 0));
  const style = { maskImage: mask, WebkitMaskImage: mask, opacity: shown, fontSize: type.name, left: u(TILE.pad), top: u(WIDE_TEXT_TOP), right: 0 };
  return (
    <motion.div style={style} className="@container absolute">
      <div className={`invisible ${fit(longestWord(fabric) * NAME_EM)}`}>
        <motion.p style={{ fontSize: type.name, lineHeight: 1.15 }} className="font-medium text-fg">
          {fabric}
        </motion.p>
      </div>
      <div className={`invisible ${fit(COLLAR_ROOM_EM)}`}>
        <motion.p style={{ fontSize: type.label, lineHeight: 1.2, marginTop: u(1.5) }} className={`${MONO} whitespace-nowrap text-dim`}>
          {collar}
        </motion.p>
      </div>
    </motion.div>
  );
}

/* Row caption: it rides right of the tile and shows once the card has widened enough to hold both lines. */
function RowCaption({ geo, type, fabric, collar }: CaptionProps) {
  const left = useTransform(geo, (g) => u(g.rowLeft));
  const need = Math.max(fabric.length * NAME_EM, collar.length * MONO_EM);
  return (
    <motion.div style={{ left, right: u(CHEVRON_W), fontSize: type.name }} className="@container absolute inset-y-0">
      <div className={`invisible flex h-full flex-col justify-center ${fit(need)}`} style={{ gap: u(1.5) }}>
        <motion.p style={{ fontSize: type.name, lineHeight: 1.1 }} className="whitespace-nowrap font-medium text-fg">
          {fabric}
        </motion.p>
        <motion.p style={{ fontSize: type.label, lineHeight: 1.1 }} className={`${MONO} whitespace-nowrap text-dim`}>
          {collar}
        </motion.p>
      </div>
    </motion.div>
  );
}

function Captions(props: CaptionProps) {
  return (
    <>
      <WideCaption {...props} />
      <RowCaption {...props} />
    </>
  );
}

function Card({ p, flow, type, i }: Props & { i: number }) {
  const { fabric, collar } = SHIRTS[i];
  const geo = useTransform(flow, (f) => f.grid.cards[i]);
  const box = useRect(geo, (g) => g.rect);
  const tile = useRect(geo, (g) => g.tile);
  const a = T.cardBeat.start + i * T.cardBeat.step;
  const beat = useBeat(p, a, a + T.cardBeat.dur);
  const hover = useBeat(p, ...(HOVERS.find(([card]) => card === i)?.[1] ?? NO_BEAT));
  const added = useSeg(p, T.added[0], T.added[1]);
  const lift = useTransform(hover, (h) => u(-LIFT * h));
  const landed = useTransform(geo, (g) => g.chevron);
  const kept = useTransform(added, (t) => (i === PICKED ? 1 - Math.min(1, t * 2.5) : 1));
  const chevron = useTransform([landed, kept], ([l, k]: number[]) => l * k);
  return (
    <motion.div style={{ ...box, y: lift, borderRadius: u(5) }} className="absolute overflow-hidden border border-line bg-surface-1">
      <motion.div style={{ ...tile, borderRadius: u(3) }} className="absolute overflow-hidden bg-surface-2">
        <GarmentTile fabric={fabric} collar={collar} />
      </motion.div>
      <Captions geo={geo} type={type} fabric={fabric.name} collar={collar} />
      <Chevron show={chevron} />
      {i === PICKED ? <Pick p={p} /> : null}
      {i === PICKED ? <InCart type={type} added={added} /> : null}
      <Flash beat={beat} />
      <Flash beat={hover} tone="dim" />
    </motion.div>
  );
}

const TAP_ROW_TOP = FLOW_TOP.phone + HEAD + PICKED * (CARD.rowH + CARD.rowGap);

export default function CardsGroup(props: Props) {
  const head = useRect(props.flow, (f) => ({ x: M, y: f.grid.top, w: f.grid.rect.w, h: HEAD }));
  return (
    <>
      <motion.div style={head} className="absolute">
        <Head type={props.type} right={<span>{TEXT.gridTag}</span>}>
          {TEXT.gridHead}
        </Head>
      </motion.div>
      {SHIRTS.map((s, i) => (
        <Card key={`${s.fabric.id}${s.collar}`} {...props} i={i} />
      ))}
      <Tap p={props.p} span={T.tap} style={{ left: u(M + 122), top: u(TAP_ROW_TOP + CARD.rowH / 2) }} />
    </>
  );
}
