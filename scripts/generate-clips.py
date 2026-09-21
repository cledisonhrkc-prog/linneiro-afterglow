#!/usr/bin/env python3
"""Compose 16:9 music-video stills and Ken-Burns MP4s for AFTERGLOW."""
from __future__ import annotations

import subprocess
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path("/workspace/public")
STILLS = ROOT / "stills"
VIDEOS = ROOT / "videos"
COVERS = ROOT / "covers"
ARTIST = ROOT / "artist"

W, H = 1920, 1080
VW, VH = 1280, 720

TRACKS = [
    # no, layout, portrait, tint, kenburns
    ("01", "stage", "hero.jpg", (196, 92, 72), "zoom"),
    ("02", "split", "portrait-dark.jpg", (90, 110, 130), "pan-right"),
    ("03", "center", "portrait-bw.jpg", (180, 168, 172), "zoom"),
    ("04", "stage", "hero.jpg", (210, 80, 90), "pan-left"),
    ("05", "left", "album.jpg", (200, 140, 120), "zoom"),
    ("06", "split", "portrait-dark.jpg", (80, 100, 120), "pan-right"),
    ("07", "close", "album.jpg", (210, 150, 110), "zoom"),
    ("08", "split", "portrait-bw.jpg", (140, 150, 160), "pan-left"),
    ("09", "left", "portrait-cool.jpg", (220, 200, 180), "zoom"),
    ("10", "close", "portrait-dark.jpg", (90, 120, 140), "zoom"),
    ("11", "center", "portrait-bw.jpg", (200, 180, 160), "pan-right"),
    ("12", "split", "portrait-dark.jpg", (120, 130, 160), "zoom"),
    ("13", "stage", "hero.jpg", (200, 70, 70), "zoom"),
    ("14", "close", "portrait-dark.jpg", (160, 140, 150), "pan-left"),
    ("15", "left", "portrait-cool.jpg", (30, 30, 30), "zoom"),
    ("16", "center", "portrait-bw.jpg", (160, 168, 176), "zoom"),
    ("17", "close", "album.jpg", (210, 120, 80), "pan-right"),
    ("18", "split", "portrait-bw.jpg", (150, 150, 150), "zoom"),
    ("19", "left", "album.jpg", (200, 130, 130), "pan-left"),
    ("20", "stage", "hero.jpg", (210, 170, 90), "zoom"),
]


def load_rgb(path: Path) -> Image.Image:
    return Image.open(path).convert("RGB")


def cover_fill(im: Image.Image, size: tuple[int, int]) -> Image.Image:
    tw, th = size
    scale = max(tw / im.width, th / im.height)
    nw, nh = int(im.width * scale + 0.5), int(im.height * scale + 0.5)
    im = im.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return im.crop((left, top, left + tw, top + th))


def grade(im: Image.Image, tint: tuple[int, int, int], amount: float) -> Image.Image:
    overlay = Image.new("RGB", im.size, tint)
    blended = Image.blend(im, overlay, amount)
    blended = ImageEnhance.Contrast(blended).enhance(1.12)
    blended = ImageEnhance.Color(blended).enhance(0.82)
    return blended


def vignette(im: Image.Image, strength: float = 0.72) -> Image.Image:
    w, h = im.size
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((-int(w * 0.15), -int(h * 0.2), int(w * 1.15), int(h * 1.2)), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(90))
    dark = Image.new("RGB", (w, h), (8, 7, 6))
    inv = ImageOps.invert(mask.point(lambda p: int(p * strength)))
    return Image.composite(dark, im, inv)


def soft_portrait(path: Path, size: int, feather: int) -> Image.Image:
    im = load_rgb(path)
    im = cover_fill(im, (size, size))
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    inset = feather
    d.ellipse((inset, inset, size - inset, size - inset), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(feather // 2))
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.paste(im.convert("RGBA"), (0, 0))
    out.putalpha(mask)
    return out


def compose(no: str, layout: str, portrait_name: str, tint: tuple[int, int, int]) -> Image.Image:
    cover = cover_fill(load_rgb(COVERS / f"{no}.jpg"), (W, H))
    cover_blur = cover.filter(ImageFilter.GaussianBlur(28))
    base = Image.blend(cover_blur, cover, 0.55)
    base = grade(base, tint, 0.18)

    if layout == "stage":
        hero = cover_fill(load_rgb(ARTIST / "hero.jpg"), (W, H))
        hero = grade(hero, tint, 0.16)
        base = Image.blend(hero, base, 0.28)
        face = soft_portrait(ARTIST / portrait_name, 620, 70)
        base_rgba = base.convert("RGBA")
        base_rgba.alpha_composite(face, (W - 700, H - 720))
        base = base_rgba.convert("RGB")
    elif layout == "split":
        face = soft_portrait(ARTIST / portrait_name, 900, 90)
        base_rgba = base.convert("RGBA")
        base_rgba.alpha_composite(face, (-40, (H - 900) // 2))
        base = base_rgba.convert("RGB")
    elif layout == "left":
        face = soft_portrait(ARTIST / portrait_name, 820, 80)
        base_rgba = base.convert("RGBA")
        base_rgba.alpha_composite(face, (80, H - 860))
        base = base_rgba.convert("RGB")
    elif layout == "close":
        close = cover_fill(load_rgb(ARTIST / portrait_name), (W, H))
        close = grade(close, tint, 0.22)
        base = Image.blend(close, base, 0.22)
    else:  # center
        face = soft_portrait(ARTIST / portrait_name, 760, 80)
        base_rgba = base.convert("RGBA")
        base_rgba.alpha_composite(face, ((W - 760) // 2, (H - 760) // 2 - 20))
        base = base_rgba.convert("RGB")

    base = vignette(base, 0.62)
    # letterbox
    draw = ImageDraw.Draw(base)
    bar = 64
    draw.rectangle((0, 0, W, bar), fill=(8, 7, 6))
    draw.rectangle((0, H - bar, W, H), fill=(8, 7, 6))
    return base


def kenburns_filter(kind: str) -> str:
    # 8s at 24fps = 192 frames
    if kind == "pan-right":
        return (
            "scale=1536:864,crop=1280:720:x='(iw-ow)*t/8':y='(ih-oh)/2',"
            "format=yuv420p"
        )
    if kind == "pan-left":
        return (
            "scale=1536:864,crop=1280:720:x='(iw-ow)*(1-t/8)':y='(ih-oh)/2',"
            "format=yuv420p"
        )
    return (
        "scale=1920:1080,zoompan=z='min(1.12,1+0.00055*on)':"
        "x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=192:s=1280x720:fps=24,"
        "format=yuv420p"
    )


def encode(still: Path, dest: Path, kind: str) -> None:
    vf = kenburns_filter(kind)
    cmd = [
        "ffmpeg", "-y", "-loop", "1", "-i", str(still),
        "-vf", vf,
        "-t", "8", "-r", "24", "-an",
        "-c:v", "libx264", "-preset", "veryfast", "-crf", "23",
        "-pix_fmt", "yuv420p", "-movflags", "+faststart",
        str(dest),
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    STILLS.mkdir(parents=True, exist_ok=True)
    VIDEOS.mkdir(parents=True, exist_ok=True)

    jobs: list[tuple[Path, Path, str]] = []
    for no, layout, portrait, tint, ken in TRACKS:
        still = STILLS / f"{no}.jpg"
        clip = VIDEOS / f"{no}.mp4"
        frame = compose(no, layout, portrait, tint)
        frame.save(still, quality=90, optimize=True)
        jobs.append((still, clip, ken))
        print(f"still {no} {layout}")

    ok = 0
    with ThreadPoolExecutor(max_workers=4) as pool:
        futs = {pool.submit(encode, s, d, k): d.name for s, d, k in jobs}
        for fut in as_completed(futs):
            name = futs[fut]
            fut.result()
            ok += 1
            print(f"clip {name} ({ok}/20)")


if __name__ == "__main__":
    main()
