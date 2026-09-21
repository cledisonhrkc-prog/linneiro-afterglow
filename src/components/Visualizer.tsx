import { useEffect, useRef } from "react";
import { ARTIST, type Song } from "@/lib/catalog";
import { engine } from "@/lib/engine";

const TINT: Record<Song["mood"], string> = {
  ember: "#c45c4a",
  night: "#7a8494",
  haze: "#b8a898",
  pulse: "#d4c4b0",
  cold: "#8a9aa8",
};

type Props = {
  song: Song;
  playing: boolean;
  className?: string;
  overlay?: boolean;
};

export function Visualizer({ song, playing, className, overlay = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = ARTIST.portrait;
    imgRef.current = img;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const bins = new Uint8Array(512);

    const draw = (now: number) => {
      const { width: w, height: h } = canvas;
      const analyser = engine.analyser;
      if (analyser) analyser.getByteFrequencyData(bins);
      const bass = avg(bins, 0, 8) / 255;
      const mid = avg(bins, 8, 40) / 255;
      const high = avg(bins, 40, 120) / 255;
      const t = now / 1000;
      const tint = TINT[song.mood];

      if (overlay) {
        ctx.clearRect(0, 0, w, h);
      } else {
        ctx.fillStyle = "#0b0a09";
        ctx.fillRect(0, 0, w, h);
      }

      const pulse = playing ? 0.55 + bass * 0.7 : 0.4;
      ctx.save();
      if (overlay) ctx.globalAlpha = 0.22 + bass * 0.12;

      switch (song.theme) {
        case "rain":
          drawRain(ctx, w, h, t, high, tint);
          break;
        case "grid":
          drawGrid(ctx, w, h, bins, tint, bass);
          break;
        case "scan":
          drawScan(ctx, w, h, t, mid, tint);
          break;
        case "shatter":
          drawShatter(ctx, w, h, t, bass, tint);
          break;
        case "orbit":
          drawOrbit(ctx, w, h, t, mid, tint);
          break;
        case "pulse":
          drawPulse(ctx, w, h, t, bass, tint);
          break;
        case "haze":
          drawHaze(ctx, w, h, t, mid, tint);
          break;
        default:
          drawBloom(ctx, w, h, t, bass, mid, tint);
      }
      ctx.restore();

      const img = imgRef.current;
      if (!overlay && img && img.complete && img.naturalWidth) {
        const size = Math.min(w, h) * (0.42 + bass * 0.05);
        const x = (w - size) / 2;
        const y = (h - size) / 2 - h * 0.04;
        ctx.save();
        ctx.globalAlpha = 0.78 + pulse * 0.18;
        ctx.beginPath();
        ctx.arc(w / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.filter = `contrast(1.1) saturate(${0.7 + mid})`;
        ctx.drawImage(img, x, y, size, size);
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = tint;
        ctx.globalAlpha = 0.35 + bass * 0.4;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(w / 2, y + size / 2, size / 2 + 8 + bass * 18, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      if (!overlay) {
      // waveform ring
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.strokeStyle = tint;
      ctx.globalAlpha = 0.55;
      ctx.lineWidth = 1.25;
      ctx.beginPath();
      const n = 96;
      for (let i = 0; i < n; i++) {
        const v = (bins[8 + (i % 80)] ?? 0) / 255;
        const r = Math.min(w, h) * 0.28 + v * Math.min(w, h) * 0.12;
        const a = (i / n) * Math.PI * 2 + t * 0.15;
        const x = Math.cos(a) * r;
        const y = Math.sin(a) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
      }

      raf = requestAnimationFrame(draw);
    };

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = parent.clientWidth * dpr;
      canvas.height = parent.clientHeight * dpr;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
    };
    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [song.id, song.mood, song.theme, playing, overlay]);

  return (
    <canvas
      ref={canvasRef}
      className={className ?? "pointer-events-none absolute inset-0 h-full w-full"}
      aria-hidden
    />
  );
}

function avg(arr: Uint8Array, a: number, b: number) {
  let s = 0;
  const n = Math.max(1, b - a);
  for (let i = a; i < b && i < arr.length; i++) s += arr[i] ?? 0;
  return s / n;
}

function drawBloom(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  bass: number,
  mid: number,
  tint: string,
) {
  const g = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, Math.max(w, h) * 0.6);
  g.addColorStop(0, hexA(tint, 0.18 + bass * 0.25));
  g.addColorStop(1, "rgba(11,10,9,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = hexA(tint, 0.2 + mid * 0.3);
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, (80 + i * 70) * (1 + bass * 0.2), 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawRain(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  high: number,
  tint: string,
) {
  ctx.strokeStyle = hexA(tint, 0.35 + high * 0.4);
  ctx.lineWidth = 1;
  for (let i = 0; i < 50; i++) {
    const x = ((i * 97 + t * 40) % w);
    const len = 18 + (i % 7) * 8;
    const y = ((i * 53 + t * (80 + high * 220)) % (h + 40)) - 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 4, y + len);
    ctx.stroke();
  }
}

function drawGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bins: Uint8Array,
  tint: string,
  bass: number,
) {
  const cols = 24;
  const gap = w / cols;
  ctx.fillStyle = hexA(tint, 0.35 + bass * 0.3);
  for (let i = 0; i < cols; i++) {
    const v = (bins[i * 3] ?? 0) / 255;
    const bh = v * h * 0.45;
    ctx.fillRect(i * gap + 4, h - bh, gap - 8, bh);
  }
}

function drawScan(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  mid: number,
  tint: string,
) {
  const y = ((t * 70) % h);
  ctx.fillStyle = hexA(tint, 0.12 + mid * 0.2);
  ctx.fillRect(0, y, w, 28);
  for (let i = 0; i < h; i += 4) {
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(0, i, w, 1);
  }
}

function drawShatter(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  bass: number,
  tint: string,
) {
  ctx.strokeStyle = hexA(tint, 0.4);
  ctx.lineWidth = 1;
  const cx = w / 2;
  const cy = h / 2;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2 + t * 0.05;
    const r = 40 + bass * 220 + (i % 5) * 30;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.stroke();
  }
}

function drawOrbit(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  mid: number,
  tint: string,
) {
  ctx.fillStyle = hexA(tint, 0.7);
  for (let i = 0; i < 18; i++) {
    const a = t * (0.3 + i * 0.03) + i;
    const r = 90 + (i % 6) * 36 + mid * 40;
    ctx.beginPath();
    ctx.arc(w / 2 + Math.cos(a) * r, h / 2 + Math.sin(a * 1.2) * r * 0.6, 2 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPulse(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  bass: number,
  tint: string,
) {
  for (let i = 0; i < 4; i++) {
    ctx.strokeStyle = hexA(tint, 0.18);
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, ((t * 80 + i * 90) % 420) * (1 + bass), 0, Math.PI * 2);
    ctx.stroke();
  }
}

function drawHaze(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number,
  mid: number,
  tint: string,
) {
  const g = ctx.createLinearGradient(0, 0, w, h);
  g.addColorStop(0, hexA(tint, 0.05 + mid * 0.08));
  g.addColorStop(1, "rgba(11,10,9,0.2)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
