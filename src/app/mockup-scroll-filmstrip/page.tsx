import type { Metadata } from "next";
import Image from "next/image";
import { workReel } from "@/data/workReel";

export const metadata: Metadata = { robots: { index: false, follow: false } };

// Renders the WorkReel card arrival animation as a filmstrip -- same
// stacking pattern as mockup-filmstrip but shows the scroll slide-in
// (translateY + rotate) instead of internal mockup data animations.
//
// Each "frame" is a 812×558px dark stage (same dims as mockup-filmstrip
// frames, 1624×1116 at dpr 2) showing the card at a different point in its
// arrival: progress=0 card is fully below the stage, progress=1 card is
// settled in view.
//
// `?project=health|education&frames=N&hold=H&start=S&count=C`
// Same params as mockup-filmstrip. H hold frames at progress=1 give the
// "settled" portion of the loop.

const STAGE_W = 812;
const STAGE_H = 558;
// Padding mirrors WorkReel's motion.div: px-[3vw] py-[12vh]
const PAD_X = Math.round(STAGE_W * 0.03); // ≈24px each side
const PAD_Y = Math.round(STAGE_H * 0.12); // ≈67px top/bottom

// Pill colors per card index (PILL_TONES cycle: sun, sky, rose, mint)
// education-saas is index 2 → rose; health-platform is index 3 → mint
const PILL_COLOR = { education: "#ffa9a9", health: "#9cf0cb" };

function easeOutQuad(t: number) {
  return t * (2 - t);
}

export default async function MockupScrollFilmstrip({
  searchParams,
}: {
  searchParams: Promise<{ project?: string; frames?: string; hold?: string; start?: string; count?: string }>;
}) {
  const { project, frames, hold, start, count } = await searchParams;
  const n = Math.max(2, Math.min(60, Number(frames ?? "30") || 30));
  const h = Math.max(0, Math.min(n - 1, Number(hold ?? "6") || 6));
  const s = Math.max(0, Math.min(n - 1, Number(start ?? "0") || 0));
  const c = Math.max(1, Math.min(n - s, Number(count ?? String(n)) || n));
  const isEdu = project === "education";
  const sweepCount = n - h;

  const item = workReel.find((i) => i.slug === (isEdu ? "education-saas" : "health-platform"))!;
  const pillColor = isEdu ? PILL_COLOR.education : PILL_COLOR.health;

  const progressList = Array.from({ length: c }, (_, k) => {
    const i = s + k;
    return i < sweepCount ? i / (sweepCount - 1) : 1;
  });

  return (
    <div style={{ backgroundColor: "#0a0a0b", padding: 40 }}>
      <div id="shot-target" style={{ margin: "0 auto", width: STAGE_W }}>
        {progressList.map((p, frameIdx) => {
          const ease = easeOutQuad(p);
          // translateY: card starts at STAGE_H below (fully off-screen) → 0
          const ty = (1 - ease) * STAGE_H;
          // rotate: -5deg off-screen → 0deg settled
          const rot = -5 * (1 - ease);

          return (
            <div
              key={frameIdx}
              style={{
                width: STAGE_W,
                height: STAGE_H,
                position: "relative",
                overflow: "hidden",
                backgroundColor: "#0a0a0b",
              }}
            >
              {/* Full-stage wrapper carries the arrival transform, same as
                  WorkReel's motion.div absolute inset-0 with padding */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  padding: `${PAD_Y}px ${PAD_X}px`,
                  transform: `translateY(${ty.toFixed(2)}px) rotate(${rot.toFixed(3)}deg)`,
                  transformOrigin: "50% 50%",
                }}
              >
                {/* Card: mirrors WorkReel Link's rounded corner + border + shadow */}
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    height: "100%",
                    overflow: "hidden",
                    borderRadius: "1.75rem",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow: "0 20px 50px rgba(8,16,12,0.45)",
                  }}
                >
                  <Image
                    src={item.image.src}
                    alt={item.image.alt}
                    fill
                    sizes="764px"
                    style={{ objectFit: "cover" }}
                  />
                  {/* Gradient scrim */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.45) 40%, transparent 100%)",
                    }}
                  />
                  {/* Title + pill, same positioning as CoverCard */}
                  <div style={{ position: "absolute", left: 24, right: 24, bottom: 40 }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-card-title, 'Titan One', sans-serif)",
                        fontSize: "clamp(2.6rem, 9vw, 5.75rem)",
                        lineHeight: 0.9,
                        letterSpacing: "-0.01em",
                        color: "#ffffff",
                        textTransform: "uppercase",
                        margin: 0,
                        textWrap: "balance",
                        textShadow: "0 4px 24px rgba(0,0,0,0.6)",
                      }}
                    >
                      {item.title}
                    </h3>
                    <div style={{ marginTop: 20 }}>
                      <span
                        style={{
                          display: "inline-flex",
                          borderRadius: 9999,
                          padding: "6px 14px",
                          fontSize: 12,
                          fontWeight: 600,
                          lineHeight: 1.4,
                          color: "#152012",
                          background: pillColor,
                          maxWidth: "26ch",
                        }}
                      >
                        {item.caption}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
