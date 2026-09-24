import type { ReactNode } from "react";
import { SceneIcon } from "./SceneIcon";
import { iconTrim, type Panel } from "./HealthSceneData";

const MONO = "font-[ui-monospace,SFMono-Regular,Menlo,monospace]";

/* Stage header: icons stay inside the header box (no negative margins), so the tube and
   the watch keep a real gap above the first data row on narrow screens. */
const VARIANTS = {
  stage: {
    wrap: "gap-1.5 px-1 pb-2 text-[9.5px] sm:gap-2.5 sm:text-[11px]",
    icon: "h-7 w-7 sm:h-12 sm:w-12",
    file: "h-7 w-7 sm:h-9 sm:w-9",
    lead: "hidden sm:inline",
  },
  still: {
    wrap: "mb-2 gap-2.5 text-[10px]",
    icon: "h-11 w-11",
    file: "h-9 w-9",
    lead: "inline",
  },
} as const;

type Props = {
  panel: Panel;
  variant: keyof typeof VARIANTS;
  count?: ReactNode;
};

export function PanelHead({ panel, variant, count }: Props) {
  const v = VARIANTS[variant];
  return (
    <div className={`flex items-center ${MONO} uppercase tracking-[0.12em] ${v.wrap}`}>
      <SceneIcon name={panel.icon} size={48} className={`${v.icon} ${iconTrim(panel.icon)}`} />
      <div className="min-w-0 flex-1 leading-tight">
        <span className="block text-fg">{panel.tag}</span>
        <span className="mt-0.5 block normal-case tracking-normal text-mute">
          {panel.vendorLead ? <span className={v.lead}>{panel.vendorLead} </span> : null}
          {panel.vendor}
          {count ? <> &middot; {count}</> : null}
        </span>
      </div>
      {panel.file ? <SceneIcon name={panel.file} size={36} className={v.file} /> : null}
    </div>
  );
}
