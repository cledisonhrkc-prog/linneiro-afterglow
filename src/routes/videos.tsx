import { createFileRoute, Link } from "@tanstack/react-router";
import { Download, Play } from "lucide-react";
import { SONGS, padNo, songClip, songStill } from "@/lib/catalog";
import { usePlayer } from "@/lib/player-store";

export const Route = createFileRoute("/videos")({ component: Videos });

function Videos() {
  const play = usePlayer((s) => s.play);
  const exportTrack = usePlayer((s) => s.exportTrack);
  const exporting = usePlayer((s) => s.exporting);

  return (
    <main className="mx-auto max-w-6xl px-5 pt-28 md:px-8">
      <p className="text-xs tracking-[0.28em] text-muted uppercase">20 clipes · 20 músicas</p>
      <h1 className="mt-2 font-display text-4xl">AFTERGLOW</h1>
      <p className="mt-3 max-w-xl text-sm text-muted">
        Cada faixa: clipe + play da música + WAV. Toca aqui. Baixa o que for subir.
      </p>
      <div className="mt-10 grid grid-cols-1 gap-6 pb-10 sm:grid-cols-2">
        {SONGS.map((song) => {
          const n = padNo(song.no);
          return (
            <article key={song.id} className="overflow-hidden rounded-xl border border-line bg-surface">
              <video
                src={songClip(song)}
                poster={songStill(song)}
                controls
                playsInline
                loop
                preload="metadata"
                className="aspect-video w-full bg-black object-cover"
              />
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-xs tabular-nums text-faint">{n}</p>
                  <h2 className="truncate font-display text-xl text-fg">{song.title}</h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => void play(song)}
                    className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg"
                  >
                    <Play className="size-3 fill-current" />
                    Música
                  </button>
                  <a
                    href={songClip(song)}
                    download={`LINNEIRO-${n}-${song.title}.mp4`}
                    className="rounded-full border border-line px-3 py-1.5 text-xs text-fg hover:bg-raised"
                  >
                    Clipe
                  </a>
                  <button
                    type="button"
                    disabled={exporting}
                    onClick={() => void exportTrack(song)}
                    className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1.5 text-xs text-fg hover:bg-raised disabled:opacity-50"
                  >
                    <Download className="size-3" />
                    WAV
                  </button>
                  <Link
                    to="/watch/$id"
                    params={{ id: song.id }}
                    className="rounded-full border border-line px-3 py-1.5 text-xs text-fg hover:bg-raised"
                  >
                    Tela cheia
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
