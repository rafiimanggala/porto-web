#!/usr/bin/env python3
"""
Record WorkReel scroll-animation videos via mockup-scroll-filmstrip.
Captures full-page filmstrip screenshots via Playwright, slices into
per-frame PNGs, compiles to mp4 with ffmpeg.

Usage:
  python3 scripts/record-scroll-video.py [education|health]
  python3 scripts/record-scroll-video.py  # both
"""
import subprocess, sys, tempfile, shutil
from pathlib import Path
from PIL import Image as PILImage

BASE_URL = "http://localhost:3000"
TOTAL_FRAMES = 30
HOLD_FRAMES = 6          # frames at progress=1 (settled hold)
FPS = 12
STAGE_H_CSS = 558        # CSS px per frame
DPR = 2
FRAME_H = STAGE_H_CSS * DPR   # = 1116 px at dpr 2
FRAME_W = 812 * DPR            # = 1624 px
# The filmstrip page has p-10 (40px) around #shot-target and the page bg
# is the same dark color. At dpr 2 the crop left-edge is at 40*2 = 80px.
CROP_LEFT = 80
CROP_TOP  = 80   # p-10 top padding in px at dpr 2

PROJECTS = {
    "education": {
        "param": "education",
        "out": Path("public/work/education-saas/insights-card.mp4"),
        "poster": Path("public/work/education-saas/insights-card.webp"),
    },
    "health": {
        "param": "health",
        "out": Path("public/work/health-platform/dashboard-card.mp4"),
        "poster": Path("public/work/health-platform/dashboard-card.webp"),
    },
}


def capture_filmstrip(project_param: str, tmp_dir: Path) -> list[Path]:
    """Navigate to filmstrip page, full-page screenshot, slice into PNGs."""
    from playwright.sync_api import sync_playwright

    url = (
        f"{BASE_URL}/mockup-scroll-filmstrip"
        f"?project={project_param}&frames={TOTAL_FRAMES}&hold={HOLD_FRAMES}"
    )
    shot_path = tmp_dir / "filmstrip.png"

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(device_scale_factor=DPR, viewport={"width": 1200, "height": 900})
        page.goto(url, wait_until="networkidle")
        page.screenshot(path=str(shot_path), full_page=True)
        browser.close()

    filmstrip = PILImage.open(shot_path)
    w, h = filmstrip.size
    print(f"  filmstrip: {w}×{h}")

    frames: list[Path] = []
    for i in range(TOTAL_FRAMES):
        top = CROP_TOP + i * FRAME_H
        bottom = top + FRAME_H
        if bottom > h:
            print(f"  WARN: frame {i+1} bottom ({bottom}) > image height ({h}), skipping rest")
            break
        frame = filmstrip.crop((CROP_LEFT, top, CROP_LEFT + FRAME_W, bottom))
        out = tmp_dir / f"frame_{i+1:03d}.png"
        frame.save(str(out))
        frames.append(out)

    print(f"  {len(frames)} frames sliced")
    return frames


def compile_video(frames: list[Path], out_path: Path, fps: int):
    """Compile PNG frames to mp4 with ffmpeg."""
    if not frames:
        print("  no frames, skipping")
        return

    # Use ffmpeg's image2 muxer via a pattern (frames must be sequentially named)
    frame_dir = frames[0].parent
    pattern = str(frame_dir / "frame_%03d.png")
    out_path.parent.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg", "-y",
        "-framerate", str(fps),
        "-i", pattern,
        "-vf", "scale=812:558",
        "-c:v", "libx264",
        "-crf", "23",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        str(out_path),
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print("  ffmpeg stderr:", result.stderr[-1000:])
        raise RuntimeError(f"ffmpeg failed: {result.returncode}")
    size = out_path.stat().st_size
    print(f"  wrote {out_path} ({size:,} bytes)")


def update_poster(frames: list[Path], poster_path: Path):
    """Update the poster frame (last settled frame)."""
    if not frames:
        return
    settled = frames[-1]
    img = PILImage.open(settled)
    # Save as webp
    poster_path.parent.mkdir(parents=True, exist_ok=True)
    img.save(str(poster_path), "webp", quality=85)
    print(f"  poster → {poster_path} ({poster_path.stat().st_size:,} bytes)")


def main():
    targets = sys.argv[1:] or list(PROJECTS.keys())
    for name in targets:
        if name not in PROJECTS:
            print(f"Unknown project: {name}. Use: {list(PROJECTS.keys())}")
            sys.exit(1)

    for name in targets:
        cfg = PROJECTS[name]
        print(f"\n=== {name} ===")
        with tempfile.TemporaryDirectory() as tmp:
            tmp_dir = Path(tmp)
            frames = capture_filmstrip(cfg["param"], tmp_dir)
            compile_video(frames, cfg["out"], FPS)
            update_poster(frames, cfg["poster"])

    print("\nDone.")


if __name__ == "__main__":
    main()
