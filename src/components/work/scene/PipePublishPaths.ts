import { cubicPath, elbowPath, linePath } from "./PipeKitPath";
import { W, type Geo } from "./PipePublishData";

/* Wire routes, built once per stage geometry. Coordinates are stage units (358 wide). */

const ELBOW_RADIUS = 12;

function build({ PT, SIZE, SHEET_H }: Geo) {
  /* Where the feed wire turns, just under the card, so the copy leaves the thumbnail straight down and never crosses the text. */
  const feedTurn = (SIZE.head + SIZE.row + SIZE.body + 14 - PT.thumb[1]) / (PT.up[1] - PT.thumb[1]);
  return {
    /** Thumbnail on the card down to the upload node. */
    FEED: elbowPath(PT.thumb, PT.up, { axis: "y", mid: feedTurn, radius: ELBOW_RADIUS }),
    /** Upload node out to the two posting nodes. */
    FORK: PT.posts.map((post) => cubicPath(PT.up, post, { axis: "y" })),
    /** Posting nodes up to the write-back node. */
    TO_WRITE: PT.low.map((low) => elbowPath(low, PT.write, { axis: "y", radius: ELBOW_RADIUS })),
    /** Write-back node up to the bottom edge of the sheet. */
    UP: linePath(PT.write, [W / 2, SHEET_H]),
  } as const;
}

export type Paths = ReturnType<typeof build>;
const CACHE = new WeakMap<Geo, Paths>();

export function pathsOf(geo: Geo): Paths {
  const hit = CACHE.get(geo);
  if (hit) return hit;
  const made = build(geo);
  CACHE.set(geo, made);
  return made;
}
