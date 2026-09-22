#!/usr/bin/env python3
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFont, ImageEnhance, ImageFilter

ROOT = Path("/workspace/public")
FONT = ROOT / "fonts/Outfit-SemiBold.ttf"
SONGS = [
    (1, "afterglow", "Afterglow"),
    (2, "midnight-frequency", "Midnight Frequency"),
    (3, "glass-heart", "Glass Heart"),
    (4, "neon-saints", "Neon Saints"),
    (5, "dont-call-it-love", "Don't Call It Love"),
    (6, "runaway-lights", "Runaway Lights"),
    (7, "slow-burn", "Slow Burn"),
    (8, "city-of-ghosts", "City of Ghosts"),
    (9, "one-last-dance", "One Last Dance"),
    (10, "electric-silence", "Electric Silence"),
    (11, "paper-crown", "Paper Crown"),
    (12, "until-morning", "Until Morning"),
    (13, "hurt-like-heaven", "Hurt Like Heaven"),
    (14, "static-kiss", "Static Kiss"),
    (15, "no-angels", "No Angels"),
    (16, "fade-with-me", "Fade With Me"),
    (17, "wildfire-eyes", "Wildfire Eyes"),
    (18, "last-goodbye", "Last Goodbye"),
    (19, "forever-tonight", "Forever Tonight"),
    (20, "gold-in-the-dark", "Gold in the Dark"),
]


def duration(path: Path) -> float:
    out = subprocess.run(["ffmpeg", "-i", str(path)], capture_output=True, text=True)
    for line in (out.stderr or "").splitlines():
        if "Duration:" in line:
            hms = line.split("Duration:")[1].split(",")[0].strip()
            h, m, s = hms.split(":")
            return int(h) * 3600 + int(m) * 60 + float(s)
    return 14.0


def frame(still: Path, title: str, dest: Path) -> None:
    im = Image.open(still).convert("RGB")
    w, h = 1920, 1080
    scale = max(w / im.width, h / im.height) * 1.08
    im = im.resize((int(im.width * scale), int(im.height * scale)), Image.Resampling.LANCZOS)
    left = (im.width - w) // 2
    top = (im.height - h) // 2
    im = im.crop((left, top, left + w, top + h))
    im = ImageEnhance.Contrast(im).enhance(1.08)
    im = ImageEnhance.Color(im).enhance(1.06)
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    d.rectangle((0, h - 220, w, h), fill=(0, 0, 0, 150))
    font_s = ImageFont.truetype(str(FONT), 28)
    font_l = ImageFont.truetype(str(FONT), 54)
    d.text((72, h - 168), "LINNEIRO  ·  AFTERGLOW", font=font_s, fill=(201, 164, 106, 240))
    d.text((72, h - 124), title, font=font_l, fill=(255, 255, 255, 245))
    out = Image.alpha_composite(im.convert("RGBA"), overlay).convert("RGB")
    dest.parent.mkdir(parents=True, exist_ok=True)
    out.save(dest, "JPEG", quality=92)


def make(n: int, sid: str, title: str) -> None:
    still = ROOT / "stills" / f"{n:02d}.jpg"
    vocal = ROOT / "vocals" / f"{sid}.mp3"
    framed = Path(f"/tmp/linneiro-frame-{n:02d}.jpg")
    dest = ROOT / "videos" / f"{n:02d}.mp4"
    frame(still, title, framed)
    dur = min(20.0, max(12.0, duration(vocal) + 0.8)) if vocal.exists() else 12.0
    cmd = [
        "ffmpeg", "-y",
        "-loop", "1", "-framerate", "24", "-t", f"{dur:.2f}", "-i", str(framed),
    ]
    if vocal.exists():
        cmd += ["-i", str(vocal)]
    else:
        cmd += ["-f", "lavfi", "-t", f"{dur:.2f}", "-i", "anullsrc=r=44100:cl=stereo"]
    cmd += [
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-preset", "veryfast", "-crf", "20",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
        "-shortest", "-movflags", "+faststart",
        str(dest),
    ]
    print(f"{n:02d} {title} {dur:.1f}s vocal={vocal.exists()}")
    subprocess.check_call(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)


def main() -> None:
    for n, sid, title in SONGS:
        make(n, sid, title)
    for n in range(1, 11):
        (ROOT / "pack1" / f"{n:02d}.mp4").write_bytes((ROOT / "videos" / f"{n:02d}.mp4").read_bytes())
    for n in range(11, 21):
        (ROOT / "pack2" / f"{n:02d}.mp4").write_bytes((ROOT / "videos" / f"{n:02d}.mp4").read_bytes())
    print("done")


if __name__ == "__main__":
    main()
