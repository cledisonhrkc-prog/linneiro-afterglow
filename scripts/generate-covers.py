#!/usr/bin/env python3
"""Editorial album + single covers for LINNEIRO — AFTERGLOW."""
from __future__ import annotations

import math
import os
import random

import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont, ImageOps

OUT = "/workspace/public/covers"
ARTIST = "/workspace/public/artist"
SERIF = "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf"
SERIF_I = "/usr/share/fonts/truetype/liberation/LiberationSerif-Italic.ttf"
SANS = "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"
SANS_B = "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf"

TRACKS = [
    ("01", "Afterglow", (18, 14, 12), (236, 230, 219)),
    ("02", "Midnight Frequency", (10, 12, 16), (198, 210, 222)),
    ("03", "Glass Heart", (16, 14, 16), (220, 214, 218)),
    ("04", "Neon Saints", (14, 12, 12), (232, 214, 204)),
    ("05", "Don't Call It Love", (12, 11, 10), (214, 196, 184)),
    ("06", "Runaway Lights", (11, 12, 14), (186, 198, 210)),
    ("07", "Slow Burn", (16, 12, 10), (228, 210, 192)),
    ("08", "City of Ghosts", (12, 12, 13), (188, 190, 196)),
    ("09", "One Last Dance", (14, 12, 11), (232, 220, 208)),
    ("10", "Electric Silence", (10, 11, 13), (176, 188, 198)),
    ("11", "Paper Crown", (15, 13, 11), (222, 210, 196)),
    ("12", "Until Morning", (11, 11, 14), (196, 200, 214)),
    ("13", "Hurt Like Heaven", (16, 11, 11), (226, 198, 192)),
    ("14", "Static Kiss", (12, 11, 12), (210, 200, 204)),
    ("15", "No Angels", (10, 10, 10), (210, 210, 206)),
    ("16", "Fade With Me", (13, 13, 14), (186, 192, 198)),
    ("17", "Wildfire Eyes", (16, 12, 10), (230, 204, 184)),
    ("18", "Last Goodbye", (12, 12, 12), (200, 200, 198)),
    ("19", "Forever Tonight", (14, 11, 12), (222, 198, 196)),
    ("20", "Gold in the Dark", (14, 12, 9), (224, 208, 180)),
]


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size)


def grain(size: int, amount: float = 0.08) -> Image.Image:
    n = np.random.default_rng(size).integers(0, 255, (size, size), dtype=np.uint8)
    g = Image.fromarray(n, mode="L")
    return ImageEnhance.Brightness(g).enhance(amount * 8)


def add_grain(im: Image.Image, seed: int, amount: float = 0.11) -> Image.Image:
    rng = np.random.default_rng(seed)
    arr = np.array(im).astype(np.float32)
    noise = rng.normal(0, 18 * amount * 10, arr.shape[:2])
    for c in range(3):
        arr[:, :, c] = np.clip(arr[:, :, c] + noise, 0, 255)
    return Image.fromarray(arr.astype(np.uint8))


def load_face() -> Image.Image:
    return Image.open(os.path.join(ARTIST, "source-square.jpg")).convert("RGB")


def circular(im: Image.Image, size: int, blur: int = 2) -> Image.Image:
    im = im.resize((size, size), Image.Resampling.LANCZOS).convert("RGBA")
    m = Image.new("L", (size, size), 0)
    ImageDraw.Draw(m).ellipse((2, 2, size - 3, size - 3), fill=255)
    if blur:
        m = m.filter(ImageFilter.GaussianBlur(blur))
    im.putalpha(m)
    return im


def text_size(draw: ImageDraw.ImageDraw, text: str, fnt: ImageFont.FreeTypeFont):
    b = draw.textbbox((0, 0), text, font=fnt)
    return b[2] - b[0], b[3] - b[1]


def draw_title(draw: ImageDraw.ImageDraw, title: str, y: int, fill, max_w: int = 1180):
    size = 78
    fnt = font(SERIF, size)
    w, h = text_size(draw, title, fnt)
    while w > max_w and size > 36:
        size -= 2
        fnt = font(SERIF, size)
        w, h = text_size(draw, title, fnt)
    draw.text(((1400 - w) // 2, y), title, font=fnt, fill=fill)
    return h


def geometry(draw: ImageDraw.ImageDraw, idx: int, ink: tuple[int, int, int], S: int = 1400):
    rng = random.Random(100 + idx)
    ink_a = ink + (46,)
    mode = idx % 7
    if mode == 0:
        for i in range(5):
            r = 220 + i * 90
            draw.ellipse((S // 2 - r, S // 2 - r, S // 2 + r, S // 2 + r), outline=ink_a, width=1)
    elif mode == 1:
        for i in range(14):
            y = 80 + i * 90
            draw.line((80, y, S - 80, y), fill=ink_a, width=1)
    elif mode == 2:
        draw.arc((120, 180, S - 120, S - 80), 200, 340, fill=ink, width=2)
        draw.arc((220, 280, S - 220, S - 180), 20, 160, fill=ink_a, width=1)
    elif mode == 3:
        for i in range(9):
            x = 140 + i * 140
            draw.line((x, 120, x, S - 120), fill=ink_a, width=1)
    elif mode == 4:
        pts = [(S // 2, 160), (S - 180, S - 200), (180, S - 200)]
        draw.line(pts + [pts[0]], fill=ink_a, width=1)
    elif mode == 5:
        draw.rectangle((90, 90, S - 90, S - 90), outline=ink_a, width=1)
        draw.rectangle((140, 140, S - 140, S - 140), outline=ink_a, width=1)
    else:
        for _ in range(18):
            x = rng.randint(80, S - 80)
            y = rng.randint(80, S - 80)
            r = rng.randint(6, 28)
            draw.ellipse((x - r, y - r, x + r, y + r), outline=ink_a, width=1)


def compose(idx: int, num: str, title: str, bg: tuple[int, int, int], ink: tuple[int, int, int], face: Image.Image) -> Image.Image:
    S = 1400
    im = Image.new("RGB", (S, S), bg)
    overlay = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    geometry(od, idx, ink)
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")

    layout = idx % 5
    if layout == 0:
        crop = face.crop((80, 40, 1120, 1080)).resize((S, S), Image.Resampling.LANCZOS)
        im = Image.blend(im, crop, 0.62)
        # bottom fade
        fade = Image.new("L", (S, S), 0)
        fd = ImageDraw.Draw(fade)
        for y in range(S):
            a = 0 if y < 520 else int(min(255, (y - 520) / 680 * 255))
            fd.line([(0, y), (S, y)], fill=a)
        dark = Image.new("RGB", (S, S), bg)
        im = Image.composite(dark, im, fade)
        circ = None
    elif layout == 1:
        circ = circular(face.crop((150, 80, 1050, 980)), 720)
        im.paste(circ, ((S - 720) // 2, 210), circ)
    elif layout == 2:
        strip = face.crop((0, 280, 1200, 820)).resize((S, 620), Image.Resampling.LANCZOS)
        im.paste(strip, (0, 280))
        circ = None
    elif layout == 3:
        half = face.resize((S, S), Image.Resampling.LANCZOS)
        im.paste(half.crop((0, 0, S // 2, S)), (0, 0))
        # edge line
        d = ImageDraw.Draw(im)
        d.line([(S // 2, 80), (S // 2, S - 80)], fill=ink, width=1)
        circ = None
    else:
        circ = circular(face.crop((200, 60, 1100, 960)), 520)
        im.paste(circ, (80, 420), circ)

    im = add_grain(im, 40 + idx, 0.07)
    draw = ImageDraw.Draw(im)

    tiny = font(SANS, 22)
    draw.text((80, 72), "LINNEIRO", font=tiny, fill=ink)
    draw.text((S - 80 - 90, 72), "AFTERGLOW", font=tiny, fill=ink)

    nfont = font(SERIF, 210)
    draw.text((72, 110), num, font=nfont, fill=ink + (0,))  # will ignore alpha on RGB
    # ghosted number
    ghost = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    gd = ImageDraw.Draw(ghost)
    gd.text((64, 96), num, font=nfont, fill=ink + (38,))
    im = Image.alpha_composite(im.convert("RGBA"), ghost).convert("RGB")
    draw = ImageDraw.Draw(im)

    draw_title(draw, title, 1180, ink)
    rule_y = 1164
    draw.line((200, rule_y, S - 200, rule_y), fill=ink, width=1)

    return im.resize((1000, 1000), Image.Resampling.LANCZOS)


def album_cover(face: Image.Image) -> Image.Image:
    S = 1400
    bg = (12, 11, 10)
    ink = (236, 230, 219)
    im = Image.new("RGB", (S, S), bg)
    crop = face.crop((40, 0, 1160, 1120)).resize((S, S), Image.Resampling.LANCZOS)
    crop = ImageEnhance.Contrast(crop).enhance(1.12)
    crop = ImageEnhance.Brightness(crop).enhance(0.88)
    crop = ImageEnhance.Color(crop).enhance(0.78)
    im = Image.blend(im, crop, 0.9)
    # vignette
    vig = Image.new("L", (S, S), 0)
    vd = ImageDraw.Draw(vig)
    vd.ellipse((-40, -80, S + 40, S + 120), fill=255)
    vig = vig.filter(ImageFilter.GaussianBlur(48))
    dark = Image.new("RGB", (S, S), bg)
    im = Image.composite(im, dark, vig)
    im = add_grain(im, 7, 0.08)

    overlay = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((48, 48, S - 48, S - 48), outline=ink + (70,), width=1)
    im = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    draw = ImageDraw.Draw(im)
    small = font(SANS, 24)
    draw.text((80, 86), "LINNEIRO", font=small, fill=ink)
    title = font(SERIF, 92)
    tw, _ = text_size(draw, "AFTERGLOW", title)
    draw.text(((S - tw) // 2, 1188), "AFTERGLOW", font=title, fill=ink)
    draw.line((200, 1174, S - 200, 1174), fill=ink, width=1)
    return im.resize((1200, 1200), Image.Resampling.LANCZOS)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    face = load_face()
    album = album_cover(face)
    album.save(os.path.join(ARTIST, "album.jpg"), quality=90, optimize=True)
    print("album", album.size)
    for i, (num, title, bg, ink) in enumerate(TRACKS):
        cover = compose(i, num, title, bg, ink, face)
        path = os.path.join(OUT, f"{num}.jpg")
        cover.save(path, quality=90, optimize=True)
        print("wrote", path)


if __name__ == "__main__":
    main()
