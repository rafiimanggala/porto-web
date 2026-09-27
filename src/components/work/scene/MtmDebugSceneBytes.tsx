"use client";

import { motion, useTransform } from "framer-motion";
import { MONO, type MV } from "./HealthSceneParts";
import { BYTES_TL, FONT, PROBES, VERDICT } from "./MtmDebugSceneData";
import { CODE, Tag, Typed } from "./MtmDebugSceneKit";
import { useWin } from "./MtmDebugSceneMath";
import { Dump, Frame, Head, LINE, MINT, ROSE, Reading, Ruler, useProofBorder, usePop } from "./MtmDebugSceneBytesProbe";
import { MtmGlyph } from "./MtmKitGlyphs";
import { mixColor, useMv } from "./MtmKitMath";
import { SceneIcon } from "./SceneIcon";

/* Page 3: the browser says 12px and looks stuck. Two independent reads of the deployed bytes say 15px. */

const [BROWSER, LIVE, CDN] = PROBES;

function BrowserRow({ p }: { p: MV }) {
  const verdict = useWin(p, BYTES_TL.verdict);
  const border = useTransform(verdict, (t) => mixColor("transparent", t, LINE));
  const read = useWin(p, BYTES_TL.read);
  const tag = usePop(p, [BYTES_TL.verdict[0] + 0.006, BYTES_TL.verdict[0] + 0.016]);
  const full = useMv(1);
  return (
    <Frame border={border}>
      <motion.i aria-hidden style={{ opacity: verdict }} className="pointer-events-none absolute -inset-px rounded-lg border border-dashed border-rose bg-rose/10" />
      <Head
        probe={BROWSER}
        icon={<SceneIcon name="browser" size={32} className="h-5 w-5" />}
        reading={
          <>
            <span className="t-h3 block text-[20px] leading-6 text-rose">{FONT.seen}</span>
            <Ruler t={full} px={FONT.seenPx} color={ROSE} />
          </>
        }
      />
      <p className={`${CODE} relative mt-2.5 flex items-center text-dim`}>
        <Typed t={read}>
          computed <span className="text-fg">font-size:</span> <span className="text-rose">{FONT.seen}</span>
        </Typed>
        <motion.span style={{ scale: tag, opacity: tag }} className="ml-auto origin-right">
          <Tag tone="rose">outlier</Tag>
        </motion.span>
      </p>
    </Frame>
  );
}

function ProofRow({ p, probe, glyph, win, equals }: { p: MV; probe: (typeof PROBES)[number]; glyph: "code" | "server"; win: readonly [number, number]; equals?: boolean }) {
  const found = useWin(p, [win[0] + 0.04, win[0] + 0.052]);
  const border = useProofBorder(p, win);
  const pop = usePop(p, [BYTES_TL.verdict[0], BYTES_TL.verdict[0] + 0.01]);
  return (
    <Frame border={border}>
      {equals ? (
        <motion.span
          aria-hidden
          style={{ scale: pop, opacity: pop }}
          className={`${MONO} absolute -top-[13px] left-1/2 z-10 grid h-[18px] w-[18px] -translate-x-1/2 place-items-center rounded-full bg-mint text-[13px] font-bold leading-none text-pastel-ink`}
        >
          =
        </motion.span>
      ) : null}
      <Head probe={probe} icon={<MtmGlyph name={glyph} size={20} />} reading={<Reading found={found} color={MINT} />} />
      <Dump p={p} win={win} />
    </Frame>
  );
}

/* The verdict is two lines, so the whole sentence fits the 358px panel: the two readings, then the outlier. */
const VERDICT_SPLIT = 0.65;

function Conclusion({ p }: { p: MV }) {
  const [a, b] = [BYTES_TL.verdict[0] + 0.012, BYTES_TL.verdict[1]];
  const mid = a + (b - a) * VERDICT_SPLIT;
  const readings = useWin(p, [a, mid]);
  const outlier = useWin(p, [mid, b]);
  return (
    <p className={`${CODE} mt-0.5 text-dim`}>
      <span className="block h-[15px]">
        <Typed t={readings}>
          {VERDICT.seen}, <span className="text-mint">{VERDICT.live}</span>,
        </Typed>
      </span>
      <span className="block h-[15px]">
        <Typed t={outlier}>
          <span className="text-rose">{VERDICT.outlier}</span>
        </Typed>
      </span>
    </p>
  );
}

export default function BytesPage({ p }: { p: MV }) {
  return (
    <div className="flex h-full flex-col justify-center gap-3.5 px-3">
      <BrowserRow p={p} />
      <ProofRow p={p} probe={LIVE} glyph="code" win={BYTES_TL.live} />
      <ProofRow p={p} probe={CDN} glyph="server" win={BYTES_TL.cdn} equals />
      <Conclusion p={p} />
    </div>
  );
}
