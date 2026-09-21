import { createFileRoute } from "@tanstack/react-router";
import { Download, Play } from "lucide-react";
import { TrackRow } from "@/components/TrackRow";
import { ARTIST, SONGS, albumDuration } from "@/lib/catalog";
import { usePlayer } from "@/lib/player-store";
import { formatTime } from "@/lib/utils";

export const Route = createFileRoute("/music")({ component: Music });

function Music() {
  const play = usePlayer((s) => s.play);
  const exportTrack = usePlayer((s) => s.exportTrack);
  const exportAlbum = usePlayer((s) => s.exportAlbum);
  const exporting = usePlayer((s) => s.exporting);

  return (
    <main className="mx-auto max-w-5xl px-5 pt-28 md:px-8">
      <div className="flex flex-col gap-8 md:flex-row md:items-end">
        <img
          src={ARTIST.albumCover}
          alt=""
          className="w-48 rounded-lg border border-line object-cover shadow-soft md:w-56"
        />
        <div>
          <p className="text-xs tracking-[0.28em] text-muted uppercase">Album</p>
          <h1 className="mt-2 font-display text-4xl">{ARTIST.album}</h1>
          <p className="mt-2 text-sm text-muted">
            {ARTIST.name} · {ARTIST.year} · 20 songs · {formatTime(albumDuration())}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => void play(SONGS[0])}
              className="inline-flex h-12 items-center gap-2 rounded-full bg-accent px-6 text-sm font-medium text-accent-fg transition-transform duration-150 active:scale-95"
            >
              <Play className="size-4 fill-current" />
              Play album
            </button>
            <button
              type="button"
              onClick={() => void exportAlbum()}
              disabled={exporting}
              className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-sm font-medium text-fg transition-colors hover:bg-raised disabled:opacity-50"
            >
              <Download className="size-4" />
              {exporting ? "Gerando WAV…" : "Baixar 20 WAV (DistroKid)"}
            </button>
            <a
              href="/artist/album-3000.jpg"
              download="LINNEIRO-AFTERGLOW-cover-3000.jpg"
              className="inline-flex h-12 items-center gap-2 rounded-full border border-line px-6 text-sm font-medium text-fg transition-colors hover:bg-raised"
            >
              <Download className="size-4" />
              Capa 3000
            </a>
          </div>
        </div>
      </div>
      <div className="mt-10 divide-y divide-line border-t border-line pb-8">
        {SONGS.map((song) => (
          <TrackRow key={song.id} song={song} />
        ))}
      </div>
    </main>
  );
}
