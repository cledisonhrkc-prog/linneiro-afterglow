import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SONGS, songStill } from "@/lib/catalog";

export const Route = createFileRoute("/pack-2")({ component: Pack2 });

const PACK = SONGS.filter((s) => s.no >= 11);

function Pack2() {
  const [i, setI] = useState(0);
  const song = PACK[i]!;
  const n = song.no.toString().padStart(2, "0");

  return (
    <main className="mx-auto max-w-3xl px-5 pt-28 pb-10 md:px-8">
      <p className="text-xs tracking-[0.28em] text-muted uppercase">
        Pack 2 · um de cada vez
      </p>
      <h1 className="mt-2 font-display text-4xl">
        {n}. {song.title}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {i + 1} de 10 — o outro some. Próximo mostra o seguinte.
      </p>

      <video
        key={n}
        src={`/pack2/${n}.mp4`}
        poster={songStill(song)}
        controls
        playsInline
        autoPlay
        muted
        loop
        className="mt-8 aspect-video w-full rounded-xl border border-line bg-black object-cover"
      />

      <div className="mt-6 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={i === 0}
          onClick={() => setI((v) => v - 1)}
          className="inline-flex h-12 items-center gap-1 rounded-full border border-line px-5 text-sm disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
          Some
        </button>
        <span className="text-sm tabular-nums text-muted">
          {n} / 20
        </span>
        <button
          type="button"
          disabled={i === PACK.length - 1}
          onClick={() => setI((v) => v + 1)}
          className="inline-flex h-12 items-center gap-1 rounded-full bg-accent px-5 text-sm font-medium text-accent-fg disabled:opacity-30"
        >
          Manda o próximo
          <ChevronRight className="size-4" />
        </button>
      </div>
    </main>
  );
}
