import Image from "next/image";

export const SCENE_ICONS = [
  "lab-blood",
  "dna",
  "body-scan",
  "device-ring",
  "device-watch",
  "device-phone",
  "chat-bubble",
  "meal",
  "training",
  "supplement",
  "sync",
  "heart-rate",
  "sleep",
  "hrv",
  "insight",
  "send",
  "swap",
  "goal",
  "browser",
  "pdf-report",
] as const;

export type SceneIconName = (typeof SCENE_ICONS)[number];

export const iconSrc = (name: SceneIconName) => `/icons/health/${name}.png`;

type Props = { name: SceneIconName; size: number; className?: string };

/** HTML icon. Inside an SVG stage use `<image href={iconSrc(name)} x y width height />` instead. */
export function SceneIcon({ name, size, className }: Props) {
  return (
    <Image
      src={iconSrc(name)}
      alt=""
      aria-hidden
      width={size}
      height={size}
      unoptimized
      draggable={false}
      className={`pointer-events-none shrink-0 select-none ${className ?? ""}`}
    />
  );
}
